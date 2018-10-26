/* eslint class-methods-use-this: off */

export class CharmProcessor {
  constructor (properties) {
    this.properties = properties;
  }

  process (charm) {
    const id = charm._attr.id._value;
    const out = { id };

    const name = this.properties[id];
    if (name) {
      out.name = name;
    }

    out.type = this.getCharmType();

    out.exalt = charm._attr.exalt?._value || /^(\w+)\./u.exec(id)[1];

    this.setCharmGroup(charm, out);
    if (out.group) {
      out.group = (this.properties[out.group] || out.group).replace(/^\(\w+\)\s*/u, '');
      if (out.group.endsWith(' Charms')) {
        out.group = out.group.slice(0, -7);
      }
      if (out.group === 'She Who Lives In Her Name') {
        out.group = 'She Who Lives in Her Name';
      }
    }

    if (charm.prerequisite?.length) {
      out.prerequisites = {};
      for (const [tag, contents] of Object.entries(charm.prerequisite[0])) {
        switch (tag) {
        case 'trait':
          for (const traitNode of contents) {
            if (traitNode._attr) {
              let traitID = '_';
              if (traitNode._attr.id) {
                const value = traitNode._attr.id._value;
                traitID = value === 'MartialArts' ? 'Martial Arts' : value;
              }
              const traitValue = traitNode._attr.value._value;
              if (traitValue) {
                (out.prerequisites.traits ||= {})[traitID] = traitValue;
              }
            }
          }
          break;
        case 'essence':
          out.prerequisites.essence = contents[0]._attr.value._value;
          break;
        case 'charmReference':
        case 'genericCharmReference':
          (out.prerequisites.charms ||= []).push(
            ...contents.map((referenceNode) => ({ id: referenceNode._attr.id._value }))
          );
          break;
        case 'selectiveCharmGroup':
          (out.prerequisites.groups ||= []).push(
            ...contents.map(CharmProcessor.processSelectiveGroup)
          );
          break;
        case 'genericCharmAttributeRequirement':
          out.prerequisites.excellencies ||= 1;
          break;
        case 'charmAttributeRequirement':
          out.prerequisites.excellencies = contents[0]._attr?.count?._value || 1;
          break;
        default:
          // ignore
        }
      }
      if (out.prerequisites.charms) {
        out.prerequisites.charms.sort(sortByID);
      }
    }

    if (out.exalt === 'Lunar' && out.prerequisites && out.prerequisites.traits) {
      const attribute = Object.keys(out.prerequisites.traits)[0];
      if (attribute !== '_') {
        out.group = attribute;
      }
    }

    if (charm.charmtype?.length && charm.charmtype[0]._attr?.type) {
      const action = charm.charmtype[0]._attr.type._value;
      out.action = this.properties[action] || action;
    }

    out.keywords = {};
    for (const x of charm.charmAttribute || []) {
      if (x._attr?.attribute) {
        CharmProcessor.processCharmAttribute(charm, x._attr.attribute._value, out);
      }
    }

    if (charm.essenceFixedRepurchases) {
      out.repurchases = { limit: 'Essence', required: true };
    }

    if (charm.oxbody) {
      if (out.repurchases) {
        throw new Error(`More than one repurchase type in Charm ${id}`);
      }
      const oxbody = charm.oxbody[0];
      out.repurchases = { limit: oxbody._attr.trait._value };
      out.variants = {};
      for (const pick of oxbody.pick) {
        const category = pick._attr.name._value;
        out.variants[category] = { name: this.properties[`OxBodyTechnique.${category}`] };
      }
    }

    if (charm.multiEffects) {
      if (out.variants) {
        throw new Error(`More than one variant type in Charm ${id}`);
      }
      out.variants = {};
      for (const effect of charm.multiEffects[0].effect) {
        const variant = effect._attr.name._value;
        out.variants[variant] = {
          name: this.properties[`${id}.Subeffects.${variant}`] || variant,
        };
        if (effect._attr.prereqEffect) {
          out.variants[variant].prerequisites = {
            charms: [{ id, variant: effect._attr.prereqEffect._value }],
          };
        }
      }
    }

    if (charm.subeffects) {
      out['edge cost'] = charm.subeffects[0]._attr.bpCost._value * 2;
      out.edges = {};
      for (const subeffect of charm.subeffects[0].subeffect) {
        const sub = subeffect._attr.name._value;
        out.edges[sub] = this.properties[`${id}.Subeffects.${sub}`] || sub;
      }
    }

    if (charm.repurchases) {
      if (out.repurchases) {
        throw new Error(`More than one repurchase type in Charm ${id}`);
      }
      CharmProcessor.processRepurchases(charm, out);
    }

    if (charm.transcendence) {
      out.transcends = true;
    }

    if (charm.elemental) {
      if (out.variants) {
        throw new Error(`More than one variant type in Charm ${id}`);
      }
      out.variants = {
        Air: { name: 'Air' },
        Earth: { name: 'Earth' },
        Fire: { name: 'Fire' },
        Water: { name: 'Water' },
        Wood: { name: 'Wood' },
      };
    }

    if (charm.upgradeable) {
      out.taint = {};
      charm.upgradeable[0].upgrade.forEach((upgrade) => {
        let taintName = upgrade._attr.name._value;
        if (taintName === 'Taint') {
          taintName = 'permanent';
        } else if (this.properties[taintName]) {
          taintName = this.properties[taintName];
        }
        out.taint[taintName] = upgrade._attr.xpCost._value;
      });
    }

    if (charm.traitCapModifier) {
      let param = 'raises trait cap';
      if (charm.traitCapModifier[0]._attr.trait) {
        param = 'raises Essence cap';
      }
      out[param] = true;
    }

    if (charm.source?.map((x) => x._attr.source._value)?.includes('ScrollErrata')) {
      out.errata = true;
    }

    if (out.action === 'Permanent') {
      delete out.keywords['Combo-OK'];
    }

    return out;
  }

  getCharmType () {
    return 'charm';
  }

  setCharmGroup (charm, out) {
    if (out.exalt === 'Infernal') {
      out.group = (charm.prerequisite[0].trait || [])[0]?._attr?.id?._value || 'Heretical';
    } else {
      let group = charm._attr.group?._value;
      if (group === 'TerrestrialInitiation') {
        group = 'Enlightening';
      }
      if (group) {
        out.group = group;
      }
    }
  }

  static processRepurchases (charm, out) {
    const repurchases = charm.repurchases[0];
    out.repurchases = {};
    let trait;
    if (repurchases._attr) {
      if (repurchases._attr.limitingTrait) {
        out.repurchases.limit = repurchases._attr.limitingTrait._value;
        return;
      }
      if (repurchases._attr.limit) {
        out.repurchases.limit = repurchases._attr.limit._value;
        return;
      }
      if (repurchases._attr.trait) {
        trait = repurchases._attr.trait._value;
      }
    }
    const when = [];
    for (const x of repurchases.repurchase) {
      const traitValue = x._attr?.trait?._value;
      const essenceValue = x._attr?.essence?._value;
      const repurchase = {};
      if (traitValue) {
        repurchase[trait] = traitValue;
      }
      if (essenceValue) {
        repurchase.essence = essenceValue;
      }
      if (Object.keys(repurchase).length) {
        when.push(repurchase);
      }
    }
    if (when.length) {
      out.repurchases.when = when;
    }
  }

  static processCharmAttribute (charm, value, out) {
    switch (value) {
    case 'ActionOnly':
      out.keywords['Action-Only'] = true;
      break;
    case 'AllowsCelestial':
      out.keywords.Enlightening = true;
      break;
    case 'Avatar1':
      out.keywords.Avatar = 1;
      break;
    case 'Avatar2':
      out.keywords.Avatar = 2;
      break;
    case 'Avatar3':
      out.keywords.Avatar = 3;
      break;
    case 'Avatar4':
      out.keywords.Avatar = 4;
      break;
    case 'Avatar5':
      out.keywords.Avatar = 5;
      break;
    case 'Celestial':
    case 'Sidereal':
    case 'Terrestrial':
      CharmProcessor.processMartialArts(
        value, out,
        charm.charmAttribute.some((x) => x._attr.attribute._value === 'Exclusive')
      );
      break;
    case 'Combo-Ok':
      out.keywords['Combo-OK'] = true;
      break;
    case 'Complusion':
      out.keywords.Compulsion = true;
      break;
    // case 'Exclusive':
    case 'NotAlienLearnable':
    case 'NotAlienLernable':
      out.keywords.Native = true;
      break;
    case 'FavoredCaste.Dawn':
      out.keywords.Dawn = true;
      break;
    case 'FavoredCaste.Dusk':
      out.keywords.Dusk = true;
      break;
    case 'Form':
      out.keywords['Form-type'] = true;
      break;
    case 'FormEnhancing':
      out.keywords['Form-Enhancing'] = true;
      break;
    case 'Knack':
      out.type = 'knack';
      delete out.group;
      break;
    case 'Leader':
      out.keywords.Leader = 1;
      break;
    case 'Leader4':
      out.keywords.Leader = 4;
      break;
    case 'Leader5':
      out.keywords.Leader = 5;
      break;
    case 'Leader6':
      out.keywords.Leader = 6;
      break;
    case 'Leader7':
      out.keywords.Leader = 7;
      break;
    case 'MartialArchery':
      out.martial = { Archery: true };
      break;
    case 'MartialArcheryMartialArtsThrown':
      out.martial = {
        Archery: true, 'Martial Arts': true, Thrown: true,
      };
      break;
    case 'MartialArcheryMeleeThrown':
      out.martial = {
        Archery: true, Melee: true, Thrown: true,
      };
      break;
    case 'MartialMartialArts':
      out.martial = { 'Martial Arts': true };
      break;
    case 'MartialMartialArtsArcheryMelee':
      out.martial = {
        Archery: true, 'Martial Arts': true, Melee: true,
      };
      break;
    case 'MartialReadyArcheryMeleeThrown':
      out.martial = {
        Archery: true, Melee: true, Thrown: true,
      };
      out['martial-ready'] = true;
      break;
    case 'MartialReadyMartialArts':
      out.martial = { 'Martial Arts': true };
      out['martial-ready'] = true;
      break;
    case 'MartialReadyMartialArtsArcheryMelee':
      out.martial = {
        Archery: true, 'Martial Arts': true, Melee: true,
      };
      out['martial-ready'] = true;
      break;
    case 'MartialReadyMartialArtsArcheryThrown':
      out.martial = {
        Archery: true, 'Martial Arts': true, Thrown: true,
      };
      out['martial-ready'] = true;
      break;
    case 'MartialReadyMartialArtsMeleeThrown':
      out.martial = {
        'Martial Arts': true, Melee: true, Thrown: true,
      };
      out['martial-ready'] = true;
      break;
    case 'MartialReadyMelee':
      out.martial = { Melee: true };
      out['martial-ready'] = true;
      break;
    case 'MartialThrown':
      out.martial = { Thrown: true };
      break;
    case 'Messianic1':
      out.keywords.Messianic = 1;
      break;
    case 'Messianic2':
      out.keywords.Messianic = 2;
      break;
    case 'Messianic3':
      out.keywords.Messianic = 3;
      break;
    case 'Mount(Mundane)':
      out.keywords['Mount (Mundane)'] = true;
      break;
    case 'PrayerStrip':
      out.keywords['Prayer Strip'] = true;
      break;
    case 'Purity2':
      out.keywords.Purity = 2;
      break;
    case 'Purity3':
      out.keywords.Purity = 3;
      break;
    case 'Purity4':
      out.keywords.Purity = 4;
      break;
    case 'Purity5':
      out.keywords.Purity = 5;
      break;
    case 'Taint':
      out.keywords.Taint = true;
      if (!out.taint) {
        out.taint = { permanent: 0 };
      }
      break;
    case 'Virtue-Compassion':
      (out.virtue ||= {}).Compassion = true;
      break;
    case 'Virtue-Conviction':
      (out.virtue ||= {}).Conviction = true;
      break;
    case 'Virtue-Temperance':
      (out.virtue ||= {}).Temperance = true;
      break;
    case 'Virtue-Valor':
      (out.virtue ||= {}).Valor = true;
      break;
    case 'Aquatic': case 'Blasphemy': case 'Combo-Basic': case 'Combo-OK':
    case 'Compulsion': case 'Cooperative': case 'Counterattack': case 'Crippling':
    case 'Desecration': case 'Dynasty': case 'Elemental': case 'Emotion': case 'Enhanced':
    case 'Enlightening': case 'Form-type': case 'Fury-OK': case 'Gift': case 'Heretical':
    case 'Holy': case 'Illusion': case 'Knockback': case 'Maiden': case 'Mandate':
    case 'Martyr': case 'Mirror': case 'Merged': case 'Moliation': case 'Monstrous':
    case 'Native': case 'Obvious': case 'Overdrive': case 'Pandemonium': case 'Poison':
    case 'Rage': case 'Reactor': case 'Sea': case 'Servitude': case 'Shaping': case 'Sickness':
    case 'Social': case 'Sorcerous': case 'Spectral': case 'Stackable': case 'Touch':
    case 'Training': case 'Variable': case 'Velocity': case 'War': case 'Wyld':
      out.keywords[value] = true;
      break;
    case 'Combo-AltCore-Archery': case 'Combo-AltCore-Athletics': case 'Combo-AltCore-Thrown':
    case 'Exclusive': case 'Infernal1stExcellency': case 'MartialArts': case 'Mortal':
    case 'NoStyle': case 'SorcerousEnlightenment': case 'Unrestricted': case 'Varies':
      // ignore
      break;
    default:
      throw new Error(`unrecognized charmAttribute ${value}`);
    }
  }

  static processMartialArts (value, out, exclusive) {
    if (out.group !== 'Martial Arts') {
      if (exclusive) {
        out['treat as'] = `${value === 'Sidereal' ? 'Celestial' : value} Martial Arts`;
      } else {
        out.exalt = `${value} Martial Arts`;
      }
    }
  }

  static processSelectiveGroup (node) {
    const out = { threshold: node._attr.threshold._value };
    if (node.charmReference) {
      out.charms = node.charmReference.map((x) => ({ id: x._attr.id._value }));
    }
    if (node.genericCharmReference) {
      out.generics = node.genericCharmReference.map((x) => ({ id: x._attr.id._value }));
    }
    return out;
  }
}

function sortByID (a, b) {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
}

export class GenericCharmProcessor extends CharmProcessor {
  process (charm) {
    const out = super.process(charm);
    for (const y of charm.genericCharmAttribute || []) {
      if (y._attr?.attribute) {
        const value = y._attr.attribute._value;
        GenericCharmProcessor.processGenericCharmAttribute(charm, value, out);
      }
    }
    return out;
  }

  getCharmType () {
    return 'generic';
  }

  setCharmGroup (charm, out) {
    if (out.exalt !== 'Infernal') {
      super.setCharmGroup(charm, out);
      return;
    }
    const group = charm._attr.group?._value;
    if (group) {
      out.group = group;
    }
  }

  static processGenericCharmAttribute (charm, value, out) {
    switch (value) {
    case 'Excellency':
      if (out.name.endsWith('Excellency')) { // XXX this is a horrible kludge
        out.excellency = true;
      }
      break;
    default:
      throw new Error(`Unrecognized genericCharmAttribute ${value}`);
    }
  }
}

export class MiscProcessor {
  constructor () {
    this.alternatives = [];
    this.merges = [];
  }

  processAlternative (alt) {
    this.alternatives.push(alt.charmReference.map((ref) => ref._attr.id._value));
  }

  processMerged (merge) {
    this.merges.push(merge.charmReference.map((ref) => ref._attr.id._value));
  }
}
