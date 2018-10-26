/* eslint no-undefined: off */

export class Character {
  constructor (data) {
    const input = Character.deepCopy(data);
    for (const property in this) { // eslint-disable-line guard-for-in
      // The whole point of this loop is to clear out input keys that would overwrite properties
      // inherited from the prototype, so guarding with hasOwnProperty() would be exactly the
      // wrong thing.
      input[property] = undefined;
    }
    Object.assign(this, Character.load(input));
  }

  dump () {
    return Character.unload(Character.deepCopy(this));
  }

  discounts (item) {
    return item && (
      (this.yozis && Object.values(this.yozis).includes(item))
      || (this.attributes && (this.attributes[item]?.favored || this.attributes[item]?.caste))
      || (this.abilities && (this.abilities[item]?.favored || this.abilities[item]?.caste))
      || (this.colleges && this.colleges[item]?.caste)
    );
  }

  favors (item) {
    return item && (
      this.discounts(item)
      || (this.virtues && this.virtues[item]?.primary)
      || (this.graces && this.graces[item]?.major)
    );
  }

  static deepCopy (data) {
    return JSON.parse(JSON.stringify(data));
  }

  static load (data) {
    // WARNING this function mungs its input value
    if (data.abilities) {
      const craft = data.abilities.Craft;
      if (craft) {
        const { caste, favored } = craft;
        for (const [k, v] of Object.entries(craft)) {
          if (k !== 'caste' && k !== 'favored') {
            const k2 = `Craft (${k})`;
            craft[k] = undefined;
            v.caste ??= caste;
            v.favored ??= favored;
            data.abilities[k2] = v;
          }
        }
        if (!craft.caste && !craft.favored) {
          data.abilities.Craft = undefined;
        }
      }
    }
    if (data.specialties) {
      const craft = data.specialties.Craft;
      if (craft) {
        data.specialties.Craft = undefined;
        for (const [k, v] of Object.entries(craft)) {
          data.specialties[`Craft (${k})`] = v;
        }
      }
    }
    const { installed, uninstalled } = data;
    if (installed) {
      const charms = installed.filter((x) => x.name || x.id);
      const arrays = installed.filter((x) => !x.name && !x.id);
      data.installed = { charms, arrays };
    }
    if (uninstalled) {
      const charms = uninstalled.filter((x) => x.name || x.id);
      const arrays = uninstalled.filter((x) => !x.name && !x.id);
      data.uninstalled = { charms, arrays };
    }
    return Character.deepCopy(data); // clear out keys with undefined values
  }

  static unload (data) {
    // WARNING this function mungs its input value
    const abilities = data.abilities;
    if (abilities) {
      let craft = abilities.Craft;
      if (craft) {
        for (const k of Object.keys(craft)) {
          if (k !== 'caste' && k !== 'favored') {
            craft[k] = undefined;
          }
        }
      } else {
        craft = abilities.Craft = {};
      }
      const caste = Boolean(craft.caste);
      const favored = Boolean(craft.favored);
      for (const [k, v] of Object.entries(abilities)) {
        const a = /^Craft \((.+)\)$/u.exec(k);
        if (a) {
          abilities[k] = undefined;
          if (Boolean(v.caste) === caste) {
            v.caste = undefined;
          }
          if (Boolean(v.favored) === favored) {
            v.favored = undefined;
          }
          craft[a[1]] = v;
        }
      }
      if (!Object.keys(craft).length) {
        abilities.Craft = undefined;
      }
    }
    const specialties = data.specialties;
    if (specialties) {
      const craft = {};
      for (const [k, v] of Object.entries(specialties)) {
        const a = /^Craft \((.+)\)$/u.exec(k);
        if (a) {
          specialties[k] = undefined;
          craft[a[1]] = v;
        }
      }
      if (Object.keys(craft).length) {
        specialties.Craft = craft;
      } else {
        specialties.Craft = undefined;
      }
    }
    const { installed, uninstalled } = data;
    if (installed) {
      data.installed = [...installed.charms, ...installed.arrays];
    }
    if (uninstalled) {
      data.uninstalled = [...uninstalled.charms, ...uninstalled.arrays];
    }
    return Character.deepCopy(data); // clear out keys with undefined values
  }
}
