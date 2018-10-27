import { alchemicalSubmoduleCosts } from '@ven2/data';
const SUBMODULE_COSTS = alchemicalSubmoduleCosts();

const MUTATION_POINTS = {
  poxes: 1,
  afflictions: 2,
  blights: 4,
  abominations: 6,
  deficiencies: -1,
  debilities: -2,
  deformities: -4,
};

export function flatXP (item, cost) {
  if (!item) {
    return 0;
  }
  const creation = item.creation || 0;
  const bonus = item.bonus || creation;
  const experienced = item.experienced || bonus;
  const xp = cost * (experienced - bonus);
  return xp;
}

export function geomXP (item, mult) {
  if (!item) {
    return 0;
  }
  const creation = item.creation || 0;
  const bonus = item.bonus || creation;
  const experienced = item.experienced || bonus;
  let n = 0;
  for (let i = bonus; i < experienced; ++i) {
    n += i * mult;
  }
  return n;
}

export function discountedXP (item, base, mult) {
  if (!item) {
    return 0;
  }
  let actualBase = base;
  let actualMult = mult;
  if (item.caste || item.favored || item.prodigy) {
    actualBase -= 1;
    actualMult -= 1;
  }
  const creation = item.creation || 0;
  const bonus = item.bonus || creation;
  const experienced = item.experienced || bonus;
  let n = 0;
  for (let i = bonus; i < experienced; ++i) {
    n += i ? i * actualMult : actualBase;
  }
  return n;
}

export class BaseAuditor {
  constructor (character, options) {
    this.character = character;
    this.options = options;
  }

  audit () {
    this.categorizeCharms();
    this.assessNativeCharms();
    this.assessAkumaCharms();
    this.assessAlchemicalCharms();
    this.assessRakshaCharms();
    this.assessTMACharms();
    this.assessCMACharms();
    this.assessSMACharms();
    this.assessForeignCharms();
    this.mergeCharms();

    let total = 0;
    const spent = {};
    total += spent.Attributes = this.attributes();
    total += spent.Abilities = this.abilities();
    total += spent.Specialties = this.specialties();
    total += spent.Charms = this.charms();
    total += spent.Knacks = this.knacks();
    total += spent.Spells = this.spells();
    total += spent.Protocols = this.protocols();
    total += spent.Virtues = this.virtues();
    total += spent.Willpower = this.willpower();
    total += spent.Essence = this.essence();
    total += spent.Thaumaturgy = this.thaumaturgy();
    total += spent.Backgrounds = this.backgrounds();
    total += spent.Graces = this.graces();
    total += spent.Slots = this.slots();
    total += spent.Paths = this.paths();
    total += spent.Colleges = this.colleges();
    total += spent.Mutations = this.mutations();
    total += spent.Misc = this.misc();
    const earned = this.earned();
    if (this.options.verbose) {
      const lines = [];
      for (const [k, v] of Object.entries(spent)) {
        lines.push(`${k}: ${v}`);
      }
      lines.push('', `TOTAL SPENT: ${total}`, `EARNED: ${earned}`);
      return lines.join('\n');
    }
    return `${total}/${earned}`;
  }

  categorizeCharms () {
    this._charms = {
      FavoredNative: [],
      UnfavoredNative: [],
      Akuma: [],
      Raksha: [],
      'Terrestrial MA': [],
      'Celestial MA': [],
      'Sidereal MA': [],
      Foreign: [],
    };
    this._merges = {};
    for (const [splat, charmGroups] of Object.entries(this.character.charms || {})) {
      for (const [group, charms] of Object.entries(charmGroups)) {
        for (const charm of charms) {
          if (splat === this.nativeSplat && !charm['treat as']) {
            if (this.favors(group)) {
              this._charms.FavoredNative.push(charm);
            } else {
              this._charms.UnfavoredNative.push(charm);
            }
          } else if (this.isAkuma && splat === 'Infernal'
              && (group === this.character.yozis?.patron || charm['any akuma'])) {
            this._charms.Akuma.push(charm);
          } else if (splat === 'Raksha') {
            this._charms.Raksha.push(charm);
          } else if (splat === 'Terrestrial Martial Arts'
              || charm['treat as'] === 'Terrestrial Martial Arts') {
            this._charms['Terrestrial MA'].push(charm);
          } else if (splat === 'Celestial Martial Arts'
              || charm['treat as'] === 'Celestial Martial Arts') {
            this._charms['Celestial MA'].push(charm);
          } else if (splat === 'Sidereal Martial Arts'
              || charm['treat as'] === 'Sidereal Martial Arts') {
            this._charms['Sidereal MA'].push(charm);
          } else {
            this._charms.Foreign.push(charm);
          }
          if (charm.merge) {
            (this._merges[charm.merge] ||= []).push(charm);
          }
        }
      }
    }
    this._charms.Alchemical = [].concat(
      this.character.installed?.charms || [],
      this.character.uninstalled?.charms || [],
      ...this.character.installed?.arrays || [],
      ...this.character.uninstalled?.arrays || [],
    );
  }

  assessNativeCharms () {
    if (this.options.debug) {
      console.log('debug assessNativeCharms');
    }
    const favCost = this.favoredCharmCost;
    const unfCost = this.unfavoredCharmCost;
    for (const x of this._charms.FavoredNative) {
      x.cost = this.charmXP(x, favCost);
    }
    for (const x of this._charms.UnfavoredNative) {
      x.cost = this.charmXP(x, unfCost);
    }
  }

  assessAkumaCharms () {
    if (this._charms.Akuma.length) {
      if (this.options.debug) {
        console.log('debug assessAkumaCharms');
      }
      const cost = this.favoredCharmCost;
      for (const x of this._charms.Akuma) {
        x.cost = this.charmXP(x, cost);
      }
    }
  }

  assessAlchemicalCharms () {
    if (this._charms.Alchemical.length) {
      if (this.options.debug) {
        console.log('debug assessAlchemicalCharms');
      }
      const cost = this.alchemicalCharmCost;
      for (const x of this._charms.Alchemical) {
        x.cost = this.charmXP(x, cost);
        if (x.submodules) {
          for (const y of x.submodules) {
            const submodCost = flatXP(y, SUBMODULE_COSTS[x.name][y.name]);
            if (this.options.debug) {
              console.log('debug submodule: %s %d', y.name, submodCost);
            }
            x.cost += submodCost;
          }
        }
      }
    }
  }

  assessRakshaCharms () {
    if (this._charms.Raksha.length) {
      if (this.options.debug) {
        console.log('debug assessRakshaCharms');
      }
      const cost = this.rakshaCharmCost;
      for (const x of this._charms.Raksha) {
        x.cost = this.charmXP(x, cost);
      }
    }
  }

  assessTMACharms () {
    if (this._charms['Terrestrial MA'].length) {
      if (this.options.debug) {
        console.log('debug assessTMACharms');
      }
      const cost = this.favors('Martial Arts')
        ? this.favoredTerrestrialMACharmCost
        : this.unfavoredTerrestrialMACharmCost;
      for (const x of this._charms['Terrestrial MA']) {
        x.cost = this.charmXP(x, cost);
      }
    }
  }

  assessCMACharms () {
    if (this._charms['Celestial MA'].length) {
      if (this.options.debug) {
        console.log('debug assessCMACharms');
      }
      const cost = this.favors('Martial Arts')
        ? this.favoredCelestialMACharmCost
        : this.unfavoredCelestialMACharmCost;
      for (const x of this._charms['Celestial MA']) {
        x.cost = this.charmXP(x, cost);
      }
    }
  }

  assessSMACharms () {
    if (this._charms['Sidereal MA'].length) {
      if (this.options.debug) {
        console.log('debug assessSMACharms');
      }
      const cost = this.favors('Martial Arts')
        ? this.favoredSiderealMACharmCost
        : this.unfavoredSiderealMACharmCost;
      for (const x of this._charms['Sidereal MA']) {
        x.cost = this.charmXP(x, cost);
      }
    }
  }

  assessForeignCharms () {
    if (this._charms.Foreign.length) {
      if (this.options.debug) {
        console.log('debug assessForeignCharms');
      }
      const cost = this.foreignCharmCost;
      for (const x of this._charms.Foreign) {
        x.cost = this.charmXP(x, cost);
      }
    }
  }

  mergeCharms () {
    for (const x of Object.values(this._merges)) {
      const min = Math.min(...x.map((y) => y.cost ?? Infinity));
      x[0].cost = min;
      for (const y of x.slice(1)) {
        y.cost = 0;
      }
    }
  }

  charms () {
    let total = 0;
    for (const [k, a] of Object.entries(this._charms)) {
      let n = 0;
      for (const x of a) {
        n += x.cost || 0;
      }
      if (this.options.debug) {
        console.log('debug charms: %s = %d', k, n);
      }
      total += n;
    }
    return total;
  }

  attributes () {
    let total = 0;
    if (this.character.attributes) {
      for (const [k, v] of Object.entries(this.character.attributes)) {
        const n = geomXP(v, v.favored || v.caste ? 3 : 4);
        if (this.options.debug) {
          console.log('debug attributes: %s %d', k, n);
        }
        total += n;
      }
    }
    return total;
  }

  abilities () {
    let total = 0;
    if (this.character.abilities) {
      for (const [k, v] of Object.entries(this.character.abilities)) {
        const favored = v.favored || v.caste || v.prodigy;
        const creation = v.creation || 0;
        const bonus = v.bonus || creation;
        const experienced = v.experienced || bonus;
        let n = 0;
        for (let i = bonus; i < experienced; i += 1) {
          n += this.getAbilityDotCost(k, i, favored);
        }
        if (v.prodigy) {
          n += this.prodigyCost;
        }
        if (this.options.debug) {
          console.log('debug abilities: %s %d', k, n);
        }
        total += n;
      }
    }
    return total;
  }

  getAbilityDotCost (name, i, favored) {
    return i ? (i * 2) - (favored ? 1 : 0) : 3;
  }

  specialties () {
    let total = 0;
    if (this.character.specialties) {
      for (const [k, v] of Object.entries(this.character.specialties)) {
        const cost = this.getSpecialtyDotCost(k);
        for (const x of v) {
          total += flatXP(x, cost);
        }
      }
    }
    return total;
  }

  getSpecialtyDotCost () {
    return this.specialtyCost;
  }

  virtues () {
    let total = 0;
    if (this.character.virtues) {
      for (const x of Object.values(this.character.virtues)) {
        total += geomXP(x, 3);
      }
    }
    return total;
  }

  graces () {
    let total = 0;
    if (this.character.graces) {
      const { graces } = this.character;
      for (const [k, v] of Object.entries(graces)) {
        if (k === 'Heart') {
          const heart = flatXP(graces.Heart, 20);
          if (this.options.debug) {
            console.log('debug graces: Heart %d', heart);
          }
          total += heart;
        } else {
          const n = geomXP(v, v.major ? 3 : 6);
          if (this.options.debug) {
            console.log('debug graces: %s %d', k, n);
          }
          total += n;
        }
      }
    }
    return total;
  }

  willpower () {
    return geomXP(this.character.willpower, 2);
  }

  essence () {
    return geomXP(this.character.essence?.permanent, this.essenceCostMultiplier);
  }

  knacks () {
    let total = 0;
    if (this.character.knacks?.length) {
      if (this.options.debug) {
        console.log('debug knacks');
      }
      for (const x of this.character.knacks) {
        total += this.charmXP(x, this.knackCost);
      }
    }
    return total;
  }

  thaumaturgy () {
    let total = 0;
    const { thaumaturgy } = this.character;
    if (thaumaturgy && Object.keys(thaumaturgy).length) {
      const cost = this.favorsSpells
        ? this.favoredDegreeCost
        : this.unfavoredDegreeCost;
      for (const [k, x] of Object.entries(thaumaturgy)) {
        const degreeCost = flatXP(x.degrees, cost);
        let procedureCost = 0;
        if (x.procedures) {
          for (const y of x.procedures) {
            procedureCost += flatXP(y, 1);
          }
        }
        if (this.options.debug) {
          console.log('debug thaumaturgy: %s %d %d', k, degreeCost, procedureCost);
        }
        total += degreeCost + procedureCost;
      }
      if (this.options.debug) {
        console.log('debug thaumaturgy: %d', total);
      }
    }
    return total;
  }

  backgrounds () {
    let total = 0;
    if (this.character.backgrounds) {
      for (const x of this.character.backgrounds) {
        total += flatXP(x, 3);
      }
    }
    return total;
  }

  spells () {
    let total = 0;
    const { spells } = this.character;
    if (spells && Object.keys(spells).length) {
      const cost = this.favorsSpells
        ? this.favoredSpellCost
        : this.unfavoredSpellCost;
      for (const circle of Object.values(spells)) {
        for (const x of circle) {
          total += flatXP(x, cost);
        }
      }
    }
    return total;
  }

  protocols () {
    let total = 0;
    const { protocols } = this.character;
    if (protocols) {
      if (protocols['Man-Machine']) {
        const cost = this.manMachineProtocolCost;
        for (const x of protocols['Man-Machine']) {
          total += flatXP(x, cost);
        }
      }
      if (protocols['God-Machine']) {
        const cost = this.godMachineProtocolCost;
        for (const x of protocols['God-Machine']) {
          total += flatXP(x, cost);
        }
      }
    }
    return total;
  }

  slots () {
    let total = 0;
    const { slots } = this.character;
    if (slots) {
      if (slots.general) {
        const cost = this.generalSlotCost;
        total += flatXP(slots.general, cost);
      }
      if (slots.dedicated) {
        const cost = this.dedicatedSlotCost;
        total += flatXP(slots.dedicated, cost);
      }
    }
    return total;
  }

  paths () {
    let total = 0;
    if (this.character.paths) {
      for (const x of this.character.paths) {
        total += discountedXP(x, 7, 5);
      }
    }
    return total;
  }

  colleges () {
    let total = 0;
    if (this.character.colleges) {
      for (const [k, v] of Object.entries(this.character.colleges)) {
        const n = discountedXP(v, 3, 2);
        if (this.options.debug) {
          console.log('debug colleges: %s %d', k, n);
        }
        total += n;
      }
    }
    return total;
  }

  mutations () {
    let total = 0;
    if (this.character.mutations) {
      for (const [k, v] of Object.entries(this.character.mutations)) {
        const multiplier = MUTATION_POINTS[k] * 2;
        for (const mutation of v) {
          const n = flatXP(mutation, multiplier);
          if (this.options.debug) {
            console.log('debug mutations: %s %d', mutation.name, n);
          }
          total += n;
        }
      }
    }
    return total;
  }

  misc () {
    let total = 0;
    if (this.character.experience) {
      for (const x of this.character.experience) {
        if (x.points < 0) {
          total += x.points;
        }
      }
    }
    return -total;
  }

  earned () {
    let total = 0;
    if (this.character.experience) {
      for (const x of this.character.experience) {
        if (x.points > 0) {
          total += x.points;
        }
      }
    }
    return total;
  }

  get isAkuma () {
    return this.character.yozis?.patron;
  }

  get knowsLotusRoot () {
    if (this.character.charms) {
      const lotus = this.lotusRootCharmName;
      for (const x of Object.values(this.character.charms)) {
        for (const y of Object.values(x)) {
          for (const z of Object.values(y)) {
            if (z.name === lotus) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  get favorsSpells () {
    return this.favors('Occult');
  }

  get specialtyCost () {
    return 3;
  }

  get favoredDegreeCost () {
    return Math.ceil(this.favoredSpellCost / 2);
  }

  get unfavoredDegreeCost () {
    return Math.ceil(this.unfavoredSpellCost / 2);
  }

  get essenceCostMultiplier () {
    return 8;
  }

  get favoredCharmCost () {
    return 8;
  }

  get unfavoredCharmCost () {
    return 10;
  }

  get favoredTerrestrialMACharmCost () {
    return this.knowsLotusRoot
      ? Math.ceil(this.favoredCelestialMACharmCost / 2)
      : this.favoredCelestialMACharmCost;
  }

  get unfavoredTerrestrialMACharmCost () {
    return this.knowsLotusRoot
      ? Math.ceil(this.unfavoredCelestialMACharmCost / 2)
      : this.unfavoredCelestialMACharmCost;
  }

  get favoredCelestialMACharmCost () {
    return 8;
  }

  get unfavoredCelestialMACharmCost () {
    return 10;
  }

  get favoredSiderealMACharmCost () {
    return 12;
  }

  get unfavoredSiderealMACharmCost () {
    return 15;
  }

  get favoredSpellCost () {
    return 8;
  }

  get unfavoredSpellCost () {
    return 10;
  }

  get akumaCharmCost () {
    return this.favoredCharmCost;
  }

  get foreignCharmCost () {
    return this.favoredCharmCost * 2;
  }

  get knackCost () {
    throw new Error('unable to compute knack cost for non-Lunar');
  }

  get prodigyCost () {
    return 6;
  }

  get alchemicalCharmCost () {
    return 10;
  }

  get generalSlotCost () {
    return 10;
  }

  get dedicatedSlotCost () {
    throw new Error('unable to compute dedicated slot cost for non-Alchemical');
  }

  get manMachineProtocolCost () {
    return 12;
  }

  get godMachineProtocolCost () {
    return 14;
  }

  get rakshaCharmCost () {
    return this.favoredCharmCost * 2;
  }

  favors (thing) {
    return this.character.favors(thing);
  }

  charmXP (item, cost) {
    let actualCost = cost;
    if (item['favored caste'] && item['favored caste'] === this.character.caste) {
      actualCost = this.favoredCharmCost;
    }
    if (!item['edge cost']) {
      const xp = flatXP(item, actualCost);
      if (this.options.debug) {
        console.log('debug charmXP: %s %d', item.name, xp);
      }
      return xp;
    }
    const { edges } = item;
    let xp = 0;
    if (edges) {
      let bonusEdges = 0;
      let experiencedEdges = 0;
      for (const x of edges) {
        const b = x.bonus || x.creation || 0;
        bonusEdges += b;
        experiencedEdges += x.experienced || b;
      }
      xp = (item['edge cost'] * (experiencedEdges - bonusEdges))
        + (bonusEdges ? 0 : actualCost - item['edge cost']);
      // The logic of the above is that the Charm comes with one free edge.
      // If the Charm was purchased at creation or with bonus points, that free edge is already
      // accounted for, and we pay full price for edges from experience points. If the Charm was
      // paid for with experience, however, we deduct the cost of one edge from the cost of the
      // Charm.
      //
      // (The above algorithm assumes that Charms with edges are never repurchasable. Seems
      // legit.)
      if (this.options.debug) {
        console.log('debug charmXP: %s %d', item.name, xp);
      }
    }
    return xp;
  }
}
