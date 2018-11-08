import { alchemicalSubmoduleCosts, mutationPoints } from '@ven2/data';
const SUBMODULE_COSTS = alchemicalSubmoduleCosts();
const MUTATION_POINTS = mutationPoints();

export class CharmCategorizer {
  constructor (character, coster, parser, options) {
    this.character = character;
    this.parser = parser;
    this.coster = coster;
    this.options = options;
  }

  prepareCharms () {
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
          if (splat === this.parser.nativeSplat && !charm['treat as']) {
            if (this.parser.favors(group)) {
              this._charms.FavoredNative.push(charm);
            } else {
              this._charms.UnfavoredNative.push(charm);
            }
          } else if (
            this.parser.isAkuma && splat === 'Infernal'
            && (group === this.character.yozis?.patron || charm['any akuma'])
          ) {
            this._charms.Akuma.push(charm);
          } else if (splat === 'Raksha') {
            this._charms.Raksha.push(charm);
          } else if (
            splat === 'Terrestrial Martial Arts'
            || charm['treat as'] === 'Terrestrial Martial Arts'
          ) {
            this._charms['Terrestrial MA'].push(charm);
          } else if (
            splat === 'Celestial Martial Arts'
            || charm['treat as'] === 'Celestial Martial Arts'
          ) {
            this._charms['Celestial MA'].push(charm);
          } else if (
            splat === 'Sidereal Martial Arts'
            || charm['treat as'] === 'Sidereal Martial Arts'
          ) {
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

  assessAkumaCharms () {
    if (this._charms.Akuma.length) {
      if (this.options.debug) {
        console.log('debug assessAkumaCharms');
      }
      const cost = this.coster.favoredCharmCost;
      for (const x of this._charms.Akuma) {
        x.cost = this.getCharmXP(x, cost);
      }
    }
  }

  assessAlchemicalCharms () {
    if (this._charms.Alchemical.length) {
      if (this.options.debug) {
        console.log('debug assessAlchemicalCharms');
      }
      const cost = this.coster.alchemicalCharmCost;
      for (const x of this._charms.Alchemical) {
        x.cost = this.getCharmXP(x, cost);
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

  assessForeignCharms () {
    if (this._charms.Foreign.length) {
      if (this.options.debug) {
        console.log('debug assessForeignCharms');
      }
      const cost = this.coster.foreignCharmCost;
      for (const x of this._charms.Foreign) {
        x.cost = this.getCharmXP(x, cost);
      }
    }
  }

  assessTMACharms () {
    if (this._charms['Terrestrial MA'].length) {
      if (this.options.debug) {
        console.log('debug assessTMACharms');
      }
      const cost = this.parser.favors('Martial Arts')
        ? this.coster.favoredTerrestrialMACharmCost
        : this.coster.unfavoredTerrestrialMACharmCost;
      for (const x of this._charms['Terrestrial MA']) {
        x.cost = this.getCharmXP(x, cost);
      }
    }
  }

  assessCMACharms () {
    if (this._charms['Celestial MA'].length) {
      if (this.options.debug) {
        console.log('debug assessCMACharms');
      }
      const cost = this.parser.favors('Martial Arts')
        ? this.coster.favoredCelestialMACharmCost
        : this.coster.unfavoredCelestialMACharmCost;
      for (const x of this._charms['Celestial MA']) {
        x.cost = this.getCharmXP(x, cost);
      }
    }
  }

  assessSMACharms () {
    if (this._charms['Sidereal MA'].length) {
      if (this.options.debug) {
        console.log('debug assessSMACharms');
      }
      const cost = this.parser.favors('Martial Arts')
        ? this.coster.favoredSiderealMACharmCost
        : this.coster.unfavoredSiderealMACharmCost;
      for (const x of this._charms['Sidereal MA']) {
        x.cost = this.getCharmXP(x, cost);
      }
    }
  }

  assessNativeCharms () {
    if (this.options.debug) {
      console.log('debug assessNativeCharms');
    }
    const favCost = this.coster.favoredCharmCost;
    const unfCost = this.coster.unfavoredCharmCost;
    for (const x of this._charms.FavoredNative) {
      x.cost = this.getCharmXP(x, favCost);
    }
    for (const x of this._charms.UnfavoredNative) {
      x.cost = this.getCharmXP(x, unfCost);
    }
  }

  assessRakshaCharms () {
    if (this._charms.Raksha.length) {
      if (this.options.debug) {
        console.log('debug assessRakshaCharms');
      }
      const cost = this.coster.rakshaCharmCost;
      for (const x of this._charms.Raksha) {
        x.cost = this.getCharmXP(x, cost);
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

  getCharmXP (item, cost) {
    let actualCost = cost;
    if (item['favored caste'] && item['favored caste'] === this.character.caste) {
      actualCost = this.coster.favoredCharmCost;
    }
    if (!item['edge cost']) {
      const xp = flatXP(item, actualCost);
      if (this.options.debug) {
        console.log('debug getCharmXP: %s %d', item.name, xp);
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
        console.log('debug getCharmXP: %s %d', item.name, xp);
      }
    }
    return xp;
  }
}

export class BaseAuditor extends CharmCategorizer {
  audit () {
    this.prepareCharms();

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

  abilities () {
    let total = 0;
    if (this.character.abilities) {
      for (const [k, v] of Object.entries(this.character.abilities)) {
        const favored = v.favored || v.caste || v.prodigy;
        const bonus = v.bonus || v.creation || 0;
        const experienced = v.experienced || bonus;
        let n = 0;
        for (let i = bonus; i < experienced; i += 1) {
          n += this.coster.getAbilityDotCost(k, i, favored);
        }
        if (v.prodigy) {
          n += this.coster.prodigyCost;
        }
        if (this.options.debug) {
          console.log('debug abilities: %s %d', k, n);
        }
        total += n;
      }
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

  backgrounds () {
    let total = 0;
    if (this.character.backgrounds) {
      for (const x of this.character.backgrounds) {
        total += flatXP(x, 3);
      }
    }
    return total;
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

  essence () {
    return geomXP(this.character.essence?.permanent, this.coster.essenceCostMultiplier);
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

  knacks () {
    let total = 0;
    if (this.character.knacks?.length) {
      if (this.options.debug) {
        console.log('debug knacks');
      }
      for (const x of this.character.knacks) {
        total += this.getCharmXP(x, this.coster.knackCost);
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

  paths () {
    let total = 0;
    if (this.character.paths) {
      for (const x of Object.values(this.character.paths)) {
        total += discountedXP(x, 7, 5);
      }
    }
    return total;
  }

  protocols () {
    let total = 0;
    const { protocols } = this.character;
    if (protocols) {
      if (protocols['Man-Machine']) {
        const cost = this.coster.manMachineProtocolCost;
        for (const x of protocols['Man-Machine']) {
          total += flatXP(x, cost);
        }
      }
      if (protocols['God-Machine']) {
        const cost = this.coster.godMachineProtocolCost;
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
        const cost = this.coster.generalSlotCost;
        total += flatXP(slots.general, cost);
      }
      if (slots.dedicated) {
        const cost = this.coster.dedicatedSlotCost;
        total += flatXP(slots.dedicated, cost);
      }
    }
    return total;
  }

  specialties () {
    let total = 0;
    if (this.character.specialties) {
      for (const [k, v] of Object.entries(this.character.specialties)) {
        const cost = this.coster.getSpecialtyDotCost(k);
        for (const x of v) {
          total += flatXP(x, cost);
        }
      }
    }
    return total;
  }

  spells () {
    let total = 0;
    const { spells } = this.character;
    if (spells && Object.keys(spells).length) {
      const cost = this.parser.favorsSpells
        ? this.coster.favoredSpellCost
        : this.coster.unfavoredSpellCost;
      for (const circle of Object.values(spells)) {
        for (const x of circle) {
          total += flatXP(x, cost);
        }
      }
    }
    return total;
  }

  thaumaturgy () {
    let total = 0;
    const { thaumaturgy } = this.character;
    if (thaumaturgy && Object.keys(thaumaturgy).length) {
      const cost = this.parser.favorsSpells
        ? this.coster.favoredDegreeCost
        : this.coster.unfavoredDegreeCost;
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

  virtues () {
    let total = 0;
    if (this.character.virtues) {
      for (const x of Object.values(this.character.virtues)) {
        total += geomXP(x, 3);
      }
    }
    return total;
  }

  willpower () {
    return geomXP(this.character.willpower, 2);
  }
}

export class BaseCoster {
  constructor (parser) {
    this.parser = parser;
  }

  getAbilityDotCost (name, i, favored) {
    return i ? (i * 2) - (favored ? 1 : 0) : 3;
  }

  getSpecialtyDotCost () {
    return 3;
  }

  get favoredCharmCost () {
    return 8;
  }

  get unfavoredCharmCost () {
    return 10;
  }

  get akumaCharmCost () {
    return this.favoredCharmCost;
  }

  get alchemicalCharmCost () {
    return 10;
  }

  get foreignCharmCost () {
    return this.favoredCharmCost * 2;
  }

  get favoredTerrestrialMACharmCost () {
    return this.parser.knowsLotusRoot
      ? Math.ceil(this.favoredCelestialMACharmCost / 2)
      : this.favoredCelestialMACharmCost;
  }

  get unfavoredTerrestrialMACharmCost () {
    return this.parser.knowsLotusRoot
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

  get rakshaCharmCost () {
    return this.favoredCharmCost * 2;
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

  get knackCost () {
    throw new Error('unable to compute knack cost for non-Lunar');
  }

  get prodigyCost () {
    return 6;
  }

  get manMachineProtocolCost () {
    return 12;
  }

  get godMachineProtocolCost () {
    return 14;
  }

  get generalSlotCost () {
    return 10;
  }

  get dedicatedSlotCost () {
    throw new Error('unable to compute dedicated slot cost for non-Alchemical');
  }

  get specialtyCost () {
    return 3;
  }

  get favoredSpellCost () {
    return 8;
  }

  get unfavoredSpellCost () {
    return 10;
  }
}

export class BaseParser {
  constructor (character) {
    this.character = character;
  }

  favors (thing) {
    return this.character.favors(thing);
  }

  get favorsSpells () {
    return this.favors('Occult');
  }

  get isAkuma () {
    return this.character.yozis?.patron;
  }

  get knowsLotusRoot () {
    if (this.character.charms) {
      for (const x of Object.values(this.character.charms)) {
        for (const y of Object.values(x)) {
          for (const z of Object.values(y)) {
            if (z['lotus root']) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }
}

export function discountedXP (item, base, mult) {
  if (!item) {
    return 0;
  }
  const discount = item.caste || item.favored || item.prodigy ? 1 : 0;
  const actualBase = base - discount;
  const actualMult = mult - discount;
  const bonus = item.bonus || item.creation || 0;
  const experienced = item.experienced || bonus;
  let n = 0;
  for (let i = bonus; i < experienced; ++i) {
    n += i ? i * actualMult : actualBase;
  }
  return n;
}

export function flatXP (item, cost) {
  if (!item) {
    return 0;
  }
  const bonus = item.bonus || item.creation || 0;
  const experienced = item.experienced || bonus;
  const xp = cost * (experienced - bonus);
  return xp;
}

export function geomXP (item, mult) {
  if (!item) {
    return 0;
  }
  const bonus = item.bonus || item.creation || 0;
  const experienced = item.experienced || bonus;
  let n = 0;
  for (let i = bonus; i < experienced; ++i) {
    n += i * mult;
  }
  return n;
}
