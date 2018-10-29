import { mutationPoints } from '@ven2/data';
const MUTATION_POINTS = mutationPoints();

import { CharmCategorizer, discountedXP, flatXP, geomXP } from '../audit/base';

export class BaseAuditor extends CharmCategorizer {
  audit () {
    this.prepareCharms();

    const sections = [];
    sections.push(this.attributes());
    sections.push(this.abilities());
    sections.push(this.specialties());
    sections.push(this.thaumaturgy());
    sections.push(this.virtues());
    sections.push(this.essence());
    sections.push(this.willpower());
    sections.push(this.graces());
    sections.push(this.paths());
    sections.push(this.colleges());
    sections.push(this.backgrounds());
    sections.push(this.slots());
    sections.push(this.charms());
    sections.push(this.knacks());
    sections.push(this.mutations());
    sections.push(this.spells());
    sections.push(this.protocols());
    sections.push(this.misc());

    if (this.options.debug) {
      console.log(sections);
    }

    return sections.filter(
      (s) => s.length > 1
        || (s.length === 1 && (
          s[0].toLowerCase().startsWith('essence')
            || s[0].toLowerCase().startsWith('willpower')
        ))
    )
      .map((s) => s.join('\n'))
      .join('\n');
  }

  abilities () {
    const out = ['ABILITIES:'];
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
        const formatted = formatTrait(k, v, n, true, v.prodigy);
        if (formatted) {
          out.push(formatted);
        }
      }
    }
    return out;
  }

  attributes () {
    const out = ['ATTRIBUTES:'];
    if (this.character.attributes) {
      for (const [k, v] of Object.entries(this.character.attributes)) {
        const n = geomXP(v, v.favored || v.caste ? 3 : 4);
        const formatted = formatTrait(k, v, n, true);
        if (formatted) {
          out.push(formatted);
        }
      }
    }
    return out;
  }

  backgrounds () {
    const out = ['BACKGROUNDS:'];
    if (this.character.backgrounds) {
      for (const x of this.character.backgrounds) {
        const formatted = formatTrait(x.name, x, flatXP(x, 3), true);
        if (formatted) {
          out.push(formatted);
        }
      }
    }
    return out;
  }

  charms () {
    const out = ['CHARMS:'];
    const charmList = [].concat(...Object.values(this._charms));
    charmList.sort(byName);
    for (const x of charmList) {
      if (x.cost) {
        const formatted = formatTrait(x.name, x, x.cost);
        if (formatted) {
          out.push(formatted);
        }
      }
    }
    return out;
  }

  colleges () {
    const out = ['COLLEGES:'];
    if (this.character.colleges) {
      for (const [k, v] of Object.entries(this.character.colleges)) {
        const n = discountedXP(v, 3, 2);
        const formatted = formatTrait(k, v, n, true);
        if (formatted) {
          out.push(formatted);
        }
      }
    }
    return out;
  }

  essence () {
    if (this.character.essence?.permanent) {
      const formatted = formatTrait(
        'ESSENCE',
        this.character.essence.permanent,
        geomXP(this.character.essence?.permanent, this.coster.essenceCostMultiplier),
        'no tab',
      );
      if (formatted) {
        return [formatted];
      }
    }
    return ['ESSENCE: 0'];
  }

  graces () {
    const out = ['GRACES:'];
    if (this.character.graces) {
      const graces = Object.entries(this.character.graces);
      graces.sort((a, b) => {
        if (a[0] === 'Heart' && b[0] !== 'Heart') {
          return -1;
        }
        if (a[0] !== 'Heart' && b[0] === 'Heart') {
          return 1;
        }
        if (a[0] < b[0]) {
          return -1;
        }
        if (a[0] > b[0]) {
          return 1;
        }
        return 0;
      });
      for (const [k, v] of graces) {
        let cost;
        if (k === 'Heart') {
          cost = flatXP(v, 20);
        } else {
          cost = geomXP(v, v.major ? 3 : 6);
        }
        const formatted = formatTrait(k, v, cost, true);
        if (formatted) {
          out.push(formatted);
        }
      }
    }
    return out;
  }

  knacks () {
    const out = ['KNACKS:'];
    if (this.character.knacks?.length) {
      this.character.knacks.sort(byName);
      for (const x of this.character.knacks) {
        const n = this.getCharmXP(x, this.coster.knackCost);
        if (n) {
          const formatted = formatTrait(x.name, x, n);
          if (formatted) {
            out.push(formatted);
          }
        }
      }
    }
    return out;
  }

  misc () {
    const out = ['MISC:'];
    if (this.character.experience) {
      for (const x of this.character.experience) {
        if (x.points < 0) {
          out.push(`\t${x.memo}: ${-x.points}`);
        }
      }
    }
    return out;
  }

  mutations () {
    const out = ['MUTATIONS:'];
    if (this.character.mutations) {
      const mutationList = [];
      for (const [k, v] of Object.entries(this.character.mutations)) {
        const multiplier = MUTATION_POINTS[k] * 2;
        for (const mutation of v) {
          mutation.cost = flatXP(mutation, multiplier);
          mutationList.push(mutation);
        }
      }
      mutationList.sort(byName);
      for (const x of mutationList) {
        const formatted = formatTrait(x.name, x, x.cost);
        if (formatted) {
          out.push(formatted);
        }
      }
    }
    return out;
  }

  paths () {
    const out = ['PATHS:'];
    if (this.character.paths) {
      for (const x of this.character.paths) {
        const formatted = formatTrait(x.name, x, discountedXP(x, 7, 5), true);
        if (formatted) {
          out.push(formatted);
        }
      }
    }
    return out;
  }

  protocols () {
    const out = ['PROTOCOLS:'];
    if (this.character.protocols) {
      const protocolList = [];
      for (const x of this.character.protocols['Man-Machine'] || []) {
        x.cost = flatXP(x, this.coster.manMachineProtocolCost);
        protocolList.push(x);
      }
      for (const x of this.character.protocols['God-Machine'] || []) {
        x.cost = flatXP(x, this.coster.godMachineProtocolCost);
        protocolList.push(x);
      }
      protocolList.sort(byName);
      for (const x of protocolList) {
        const formatted = formatTrait(x.name, x, x.cost);
        if (formatted) {
          out.push(formatted);
        }
      }
    }
    return out;
  }

  slots () {
    const out = ['SLOTS:'];
    if (this.character.slots) {
      const { dedicated, general } = this.character.slots;
      if (dedicated) {
        const formatted = formatTrait(
          'Dedicated',
          dedicated,
          flatXP(dedicated, this.coster.dedicatedSlotCost),
        );
        if (formatted) {
          out.push(formatted);
        }
      }
      if (general) {
        const formatted = formatTrait(
          'General',
          general,
          flatXP(general, this.coster.generalSlotCost),
        );
        if (formatted) {
          out.push(formatted);
        }
      }
    }
    return out;
  }

  specialties () {
    const out = ['SPECIALTIES:'];
    if (this.character.specialties) {
      for (const [k, v] of Object.entries(this.character.specialties)) {
        const cost = this.coster.getSpecialtyDotCost(k);
        for (const x of v) {
          const formatted = formatTrait(`${k} (${x.name})`, x, flatXP(x, cost), true);
          if (formatted) {
            out.push(formatted);
          }
        }
      }
    }
    return out;
  }

  spells () {
    const out = ['SPELLS:'];
    if (this.character.spells && Object.keys(this.character.spells).length) {
      const spellList = [];
      const cost = this.parser.favorsSpells
        ? this.coster.favoredSpellCost
        : this.coster.unfavoredSpellCost;
      for (const circle of Object.values(this.character.spells)) {
        for (const x of circle) {
          x.cost = flatXP(x, cost);
          spellList.push(x);
        }
      }
      spellList.sort(byName);
      for (const x of spellList) {
        const formatted = formatTrait(x.name, x, x.cost);
        if (formatted) {
          out.push(formatted);
        }
      }
    }
    return out;
  }

  thaumaturgy () {
    const out = ['THAUMATURGY:'];
    const { thaumaturgy } = this.character;
    if (thaumaturgy) {
      const entries = Object.entries(thaumaturgy);
      entries.sort((a, b) => {
        if (a[0] < b[0]) {
          return -1;
        }
        if (a[0] > b[0]) {
          return 1;
        }
        return 0;
      });
      const cost = this.parser.favorsSpells
        ? this.coster.favoredDegreeCost
        : this.coster.unfavoredDegreeCost;
      for (const [k, x] of entries) {
        if (x.degrees) {
          const formatted = formatTrait(k, x.degrees, flatXP(x.degrees, cost), true);
          if (formatted) {
            out.push(formatted);
          }
        }
        if (x.procedures) {
          for (const y of x.procedures) {
            const formatted = formatTrait(y.name, y, flatXP(y, 1));
            if (formatted) {
              out.push(formatted);
            }
          }
        }
      }
    }
    return out;
  }

  virtues () {
    const out = ['VIRTUES:'];
    if (this.character.virtues) {
      const entries = Object.entries(this.character.virtues);
      entries.sort(byName);
      for (const [k, v] of entries) {
        const formatted = formatTrait(k, v, geomXP(v, 3), true);
        if (formatted) {
          out.push(formatted);
        }
      }
    }
    return out;
  }

  willpower () {
    if (this.character.willpower) {
      const formatted = formatTrait(
        'WILLPOWER', this.character.willpower, geomXP(this.character.willpower, 2), 'no tab'
      );
      if (formatted) {
        return [formatted];
      }
    }
    return ['WILLPOWER: 0'];
  }
}

function byName (a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

function formatTrait (name, value, cost, forceDots, prodigy) {
  const bonus = value.bonus || value.creation || 0;
  const experienced = value.experienced || bonus;
  if (experienced <= bonus) {
    return '';
  }
  let out;
  if (experienced === 1 && !forceDots) {
    out = `${name}: ${cost}`;
  } else {
    const low = bonus + 1;
    if (experienced === low) {
      out = `${name} ${formatNumber(low)}: ${cost}`;
    } else {
      out = `${name} ${formatNumber(low)}\u2013${formatNumber(experienced)}: ${cost}`;
    }
  }
  if (prodigy) {
    out = out.replace(':', ' (prodigy):');
  }
  if (forceDots !== 'no tab') {
    out = `\t${out}`;
  }
  return out;
}

function formatNumber (n) {
  return n ? '•'.repeat(n) : '0';
}
