import path from 'path';
import { loadSync as loadYamlSync } from '@sethb0/yaml-utils';

const ATTRIBUTES = [
  'Strength', 'Dexterity', 'Stamina',
  'Charisma', 'Manipulation', 'Appearance',
  'Perception', 'Intelligence', 'Wits',
];

const STYLES = loadYamlSync(path.join(__dirname, 'styles.yml'));
for (const [key, value] of Object.entries(STYLES.images)) {
  STYLES.images[key] = require.resolve(`@ven2/images/data/${value}`);
}
const SIZES = loadYamlSync(require.resolve('@ven2/images/data/images/sizes.yml'));

export function rephraseYozi (yozi) {
  if (yozi === 'Ebon Dragon') {
    return 'the Ebon Dragon';
  }
  return yozi;
}

export class Generator {
  constructor (character, options) {
    this.character = character;
    this.debug = options.debug;
  }

  makeDocumentDescriptor () {
    const content = [
      {
        image: `splat.${this.character.splat}`,
        width: 100,
        absolutePosition: { x: 476, y: STYLES.styles.title.margin[1] },
      },
      {
        stack: [
          { text: this.subtitle + this.akumaSubtitle, style: 'subtitle' },
          ...this.formattedConcept,
          ...this.formattedMotivation,
          ...this.formattedUrge,
          ...this.formattedAnima,
          ...this.additionalFormattedHeaderInfo,
          ...this.formattedAttributes,
          ...this.formattedAttributeSpecialties,
          ...this.formattedAbilities,
          ...this.formattedAbilitySpecialties,
          ...this.formattedThaumaturgy,
          ...this.formattedLanguages,
          ...this.formattedVirtues,
          ...this.formattedVirtueFlawAndPools,
          ...this.formattedGraces,
          ...this.formattedPaths,
          ...this.formattedColleges,
          ...this.formattedIntimacies,
          ...this.formattedBackgrounds,
          ...this.allFormattedCharms,
          ...this.formattedSpells,
          ...this.formattedProtocols,
          ...this.formattedMutations,
          ...this.formattedNotes,
        ],
      },
    ];

    const descriptor = {
      ...STYLES,
      info: this.documentInfo,
      content,
      header: (current, total) => current === 1
        ? { text: this.nameInlines, style: 'title' }
        : {
          text: this.nameInlines.concat([` / Page ${current} of ${total}`]),
          style: 'header',
        },
      footer: (current, total) => total > 1 && current === 1
        ? { text: '1', style: 'footer' }
        : {},
      pageBreakBefore: (nodeInfo, rest, nextPage, prev) => nodeInfo.pageBreak === 'conditional'
        && prev.length
        && nextPage.length
        && !rest.some((x) => x.pageBreak === 'conditional'),
    };

    const casteImageTag = `caste.${this.character.caste}`;
    if (STYLES.images[casteImageTag]) {
      const [width, height] = SIZES[path.basename(STYLES.images[casteImageTag])];
      const adj = Math.min(540 / width, 720 / height);
      const adjWidth = width * adj;
      const adjHeight = height * adj;
      descriptor.background = {
        image: casteImageTag,
        fit: [540, 720],
        absolutePosition: { x: (612 - adjWidth) / 2, y: (792 - adjHeight) / 2 },
      };
    }

    return descriptor;
  }

  get documentInfo () {
    const info = {
      title: this.character.name,
      subject: 'Exalted 2.5e character sheet',
    };
    if (this.character.player) {
      info.author = this.character.player;
    }
    return info;
  }

  get nameInlines () {
    return [this.character.name];
  }

  get subtitle () {
    return `${this.character.caste} Caste ${this.character.splat} Exalted`;
  }

  get akumaSubtitle () {
    return this.isAkuma ? `\nAkuma of ${rephraseYozi(this.character.yozis?.patron)}` : '';
  }

  get formattedConcept () {
    return Generator.formatHeaderLine('Concept', this.character.concept);
  }

  get formattedMotivation () {
    return Generator.formatHeaderLine('Motivation', this.character.motivation);
  }

  get formattedUrge () {
    return Generator.formatHeaderLine('Urge', this.character.urge);
  }

  get formattedAnima () {
    return Generator.formatHeaderLine('Anima', this.character.anima);
  }

  get additionalFormattedHeaderInfo () {
    return [];
  }

  get formattedAttributes () {
    return [
      Generator.makeDivider(),
      {
        columns: [
          this.formatTraits(
            this.character.attributes,
            ['Strength', 'Dexterity', 'Stamina'],
          ),
          this.formatTraits(
            this.character.attributes,
            ['Charisma', 'Manipulation', 'Appearance'],
          ),
          this.formatTraits(
            this.character.attributes,
            ['Perception', 'Intelligence', 'Wits'],
          ),
        ],
      },
    ];
  }

  get formattedAttributeSpecialties () {
    const specialtyEntries = Object.entries(this.character.specialties || {})
      .filter(([k]) => ATTRIBUTES.includes(k));
    if (!specialtyEntries.length) {
      return [];
    }
    return [
      Generator.makeDivider(),
      this.formatSpecialties(specialtyEntries),
    ];
  }

  get formattedAbilities () {
    return [
      Generator.makeDivider(),
      {
        columns: [
          this.formatAbilities([
            ['Archery', 'Martial Arts', 'Melee', 'Thrown', 'War'],
            ['Athletics', 'Awareness', 'Dodge', 'Larceny', 'Stealth'],
          ]),
          this.formatAbilities([
            ['Integrity', 'Performance', 'Presence', 'Resistance', 'Survival'],
            ['Bureaucracy', 'Linguistics', 'Ride', 'Sail', 'Socialize'],
          ]),
          this.formatAbilities([
            ['Craft', 'Investigation', 'Lore', 'Medicine', 'Occult'],
          ]),
        ],
      },
    ];
  }

  get formattedAbilitySpecialties () {
    const specialtyEntries = Object.entries(this.character.specialties || {})
      .filter(([k]) => !ATTRIBUTES.includes(k));
    if (!specialtyEntries.length) {
      return [];
    }
    return [
      Generator.makeDivider(),
      this.formatSpecialties(specialtyEntries),
    ];
  }

  get formattedThaumaturgy () {
    const thaumEntries = Object.entries(this.character.thaumaturgy || {});
    if (!thaumEntries.length) {
      return [];
    }
    const a = [{ text: 'Thaumaturgy:', bold: true }];
    for (const [k, v] of thaumEntries) {
      const b = [` ${k}`];
      if (v.degrees) {
        b[0] += ' ';
        b.push(...Generator.formatDots(v.degrees));
      }
      if (v.procedures?.length) {
        b.push(' (procedures: ');
        for (const proc of v.procedures) {
          b.push(...Generator.formatStyledName(proc));
          b.push(', ');
        }
        b.pop();
        b.push(')');
      }
      b.push(',');
      a.push(...b);
    }
    a.pop();
    return [Generator.makeDivider(), { text: a, style: 'hang' }];
  }

  get formattedLanguages () {
    const languages = this.character.languages || [];
    if (!languages.length) {
      return [];
    }
    return [
      Generator.makeDivider(),
      {
        text: [
          { text: 'Languages:', bold: true },
          ` ${languages.join(', ')}`,
        ],
        style: 'hang',
      },
    ];
  }

  get formattedVirtues () {
    const data = {
      Willpower: this.character.willpower,
      Essence: this.character.essence.permanent,
      ...this.character.virtues || {},
    };
    return [
      Generator.makeDivider(),
      {
        columns: [
          this.formatTraits(data, ['Compassion', 'Conviction']),
          this.formatTraits(data, ['Temperance', 'Valor']),
          this.formatTraits(data, ['Willpower', 'Essence']),
        ],
      },
    ];
  }

  get formattedVirtueFlawAndPools () {
    const vf = this.formattedVirtueFlaw;
    const pools = this.formattedEssencePools;
    if (!vf.length && !pools.length) {
      return [];
    }
    return [
      {
        columns: [
          { stack: vf, width: 276 },
          { stack: pools, width: 'auto' },
        ],
      },
    ];
  }

  get formattedVirtueFlaw () {
    return [];
  }

  get formattedEssencePools () {
    const personal
      = Generator.formatEssencePool('personal', this.character.essence.personal);
    const peripheral
      = Generator.formatEssencePool('peripheral', this.character.essence.peripheral);
    const pools = [personal, peripheral].filter((x) => x).join(', ');
    return pools ? [{ text: [{ text: 'Essence Pools:', bold: true }, ` ${pools}`] }] : [];
  }

  get formattedGraces () {
    if (!this.character.graces) {
      return [];
    }
    const graces = { ...this.character.graces };
    graces.Heart = null;
    const names = [];
    for (const name of ['Cup', 'Ring', 'Staff', 'Sword']) {
      if (graces[name]) {
        names.push(name);
        graces[name] = null;
      }
    }
    for (const [name, v] of Object.entries(graces)) {
      if (v !== null) {
        names.push(name);
      }
    }
    if (this.character.graces.Heart) {
      names.push('Heart');
    }
    const height = Math.ceil(names.length / 3);
    const leftNames = names.splice(0, height);
    const middleNames = names.splice(0, height);
    const rightNames = names;
    return [
      Generator.makeDivider(),
      {
        columns: [
          this.formatTraits(this.character.graces, leftNames),
          this.formatTraits(this.character.graces, middleNames),
          this.formatTraits(this.character.graces, rightNames),
        ],
      },
    ];
  }

  get formattedColleges () {
    return this.formatTricolumn(this.character.colleges);
  }

  get formattedPaths () {
    return this.formatBicolumn(this.character.paths);
  }

  get formattedBackgrounds () {
    const backgrounds = this.character.backgrounds;
    if (!backgrounds) {
      return [];
    }
    const out = [
      {
        pageBreak: 'conditional',
        stack: [{ text: 'Backgrounds:', style: 'section' }],
      },
    ];
    for (const x of backgrounds) {
      out[0].stack.push({
        columns: [
          { stack: [{ text: x.name }], width: 210, style: 'hang' },
          { stack: [{ text: Generator.formatDots(x) }], width: 48, style: 'hang' },
          { stack: [{ text: x.notes || '' }], width: 234, style: 'hang' },
        ],
        columnGap: 6,
      });
    }
    return out;
  }

  get formattedIntimacies () {
    if (!this.character.intimacies) {
      return [];
    }
    return [
      {
        pageBreak: 'conditional',
        stack: [{ text: 'Intimacies:', style: 'section' }],
      },
      {
        ul: this.character.intimacies.map((x) => ({ text: Generator.formatIntimacy(x) })),
      },
    ];
  }

  get allFormattedCharms () {
    const charmsOut = this.formattedCharms;
    if (this.alchemicalCharmsFirst) {
      if (charmsOut.length) {
        charmsOut[0].stack[0].text[0] = 'Other Charms:';
      }
      return this.formattedAlchemicalCharms.concat(charmsOut);
    }
    return charmsOut.concat(this.formattedAlchemicalCharms);
  }

  get formattedCharms () {
    const charms = this.character.charms;
    if (!charms) {
      return [];
    }
    const out = [{ text: ['Charms:'], style: 'section' }];
    const native = { ...charms[this.character.splat] || [] };
    const splats = Object.entries(charms).filter(([k]) => k !== this.character.splat);
    const knacks = this.character.knacks || [];
    if (knacks.length) {
      native.Knacks = knacks;
    }
    if (Object.keys(native).length) {
      out.push(...this.formatCharmSplat(native));
    }
    for (const [splat, groups] of splats) {
      out.push({ text: `${splat}:`, style: 'subsection' });
      out.push(...this.formatCharmSplat(groups));
    }
    return [{ pageBreak: 'conditional', stack: out }];
  }

  get formattedAlchemicalCharms () {
    const { installed, uninstalled } = this.character;
    const installedCharms = installed?.charms;
    const installedArrays = installed?.arrays;
    const uninstalledCharms = uninstalled?.charms;
    const uninstalledArrays = uninstalled?.arrays;
    if (!installedCharms?.length && !installedArrays?.length && !uninstalledCharms?.length
        && !uninstalledArrays?.length) {
      return [];
    }
    const out = [{
      pageBreak: 'conditional',
      stack: [
        { text: 'Alchemical Charms:', style: 'section' },
        { text: [{ text: 'Slots:', bold: true }, ...this.formatSlots()], marginBottom: 2 },
      ],
    }];
    if (installedCharms.length) {
      out.push(
        ...Generator.formatAlchemicalArray('Installed Charms\u2014', installedCharms)
      );
    }
    for (let i = 0; i < installedArrays.length; i += 1) {
      out.push(
        ...Generator.formatAlchemicalArray(
          `Installed Array #${i + 1}\u2014`,
          installedArrays[i],
        )
      );
    }
    if (uninstalledCharms.length) {
      out.push(
        ...Generator.formatAlchemicalArray('Uninstalled Charms\u2014', uninstalledCharms)
      );
    }
    for (let i = 0; i < uninstalledArrays.length; i += 1) {
      out.push(
        ...Generator.formatAlchemicalArray(
          `Uninstalled Array #${i + 1}\u2014`,
          uninstalledArrays[i],
        )
      );
    }
    return out;
  }

  get formattedSpells () {
    const spells = this.character.spells;
    if (!spells) {
      return [];
    }
    const out = [{ text: ['Spells:'], style: 'section' }];
    for (const [circle, list] of Object.entries(spells)) {
      if (list.length) {
        const para = [`${circle} Circle\u2014`];
        for (const spell of list) {
          para.push(...Generator.formatStyledName(spell), ', ');
        }
        para.pop();
        out.push({ text: para, style: 'hang', marginBottom: 2 });
      }
    }
    return [{ pageBreak: 'conditional', stack: out }];
  }

  get formattedProtocols () {
    const protocols = this.character.protocols;
    if (!protocols) {
      return [];
    }
    const out = [{ text: ['Protocols:'], style: 'section' }];
    for (const [circle, list] of Object.entries(protocols)) {
      if (list.length) {
        const para = [`${circle} Circle\u2014`];
        for (const protocol of list) {
          para.push(...Generator.formatStyledName(protocol), ', ');
        }
        para.pop();
        out.push({ text: para, style: 'hang', marginBottom: 2 });
      }
    }
    return [{ pageBreak: 'conditional', stack: out }];
  }

  get formattedMutations () {
    const mutations = this.character.mutations;
    if (!mutations) {
      return [];
    }
    const out = [{ text: ['Mutations:'], style: 'section' }];
    for (const [k, v] of Object.entries(mutations)) {
      const kk = k[0].toUpperCase() + k.substring(1);
      if (v.length) {
        const para = [`${kk}\u2014`];
        for (const mutation of v) {
          para.push(...Generator.formatStyledName(mutation), ', ');
        }
        para.pop();
        out.push({ text: para, style: 'hang', marginBottom: 2 });
      }
    }
    return [{ pageBreak: 'conditional', stack: out }];
  }

  get formattedNotes () {
    if (!this.character.notes?.length) {
      return [];
    }
    return [{
      pageBreak: 'conditional',
      stack: [
        { text: 'Notes:', style: 'section' },
        ...Array.isArray(this.character.notes) ? this.character.notes : [this.character.notes],
      ],
    }];
  }

  get isAkuma () {
    return this.character.yozis?.patron;
  }

  get alchemicalCharmsFirst () {
    return false;
  }

  formatSlots () {
    const slots = this.character.slots;
    if (!slots) {
      return [];
    }
    const { dedicated, general } = slots;
    const content = [];
    if (dedicated) {
      content.push(' dedicated = ');
      content.push(...Generator.formatSlotField(dedicated));
      if (general) {
        content.push(',');
      }
    }
    if (general) {
      content.push(' general = ');
      content.push(...Generator.formatSlotField(general));
    }
    return content;
  }

  formatAbilities (groups) {
    const names = [];
    const crafts = Object.keys(this.character.abilities).filter((x) => x.startsWith('Craft ('));
    for (const group of groups) {
      if (group.includes('Craft')) {
        const craftRows = 12 - Object.keys(group).length;
        while (crafts.length < craftRows) {
          crafts.push('Craft');
        }
      }
      for (const x of group) {
        if (x === 'Craft') {
          for (const craft of crafts) {
            names.push(craft);
          }
        } else {
          names.push(x);
        }
      }
      names.push(null);
    }
    names.pop();
    return this.formatTraits(this.character.abilities, names);
  }

  formatTricolumn (data) {
    if (!data) {
      return [];
    }
    const names = Object.keys(data);
    names.sort();
    const height = Math.ceil(names.length / 3);
    const leftNames = names.splice(0, height);
    const middleNames = names.splice(0, height);
    const rightNames = names;
    return [
      Generator.makeDivider(),
      {
        columns: [
          this.formatTraits(data, leftNames),
          this.formatTraits(data, middleNames),
          this.formatTraits(data, rightNames),
        ],
      },
    ];
  }

  formatTraits (data, names) {
    const n = names || Object.keys(data);
    const out = { stack: [] };
    for (const x of n) {
      out.stack.push({
        columns: [
          {
            stack: [x ? this.formatTraitName(x, data[x] || {}) : ' '],
            style: 'hang',
            width: 90,
          },
          {
            stack: [x ? { text: Generator.formatDots(data[x] || {}) } : ' '],
            width: 54,
          },
        ],
      });
    }
    return out;
  }

  formatTraitName (name, data) {
    const out = {
      text: name,
      italics: this.character.favors(name)
        || data?.caste || data?.favored || data?.major || data?.primary,
    };
    if (data?.prodigy) {
      out.decoration = 'underline';
    }
    return out;
  }

  formatVirtueFlaw () {
    if (this.character['virtue flaw']?.name) {
      return this.character['virtue flaw'].name;
    }
    return 'none';
  }

  formatCharmSplat (groups) {
    const out = [];
    for (const [group, list] of Object.entries(groups)) {
      if (list?.length) {
        const para = [
          { text: group, italics: this.character.discounts(group) },
          '\u2014',
        ];
        for (const charm of list) {
          para.push(...Generator.formatCharm(charm), ', ');
        }
        para.pop();
        out.push({ text: para, style: 'hang', marginBottom: 2 });
      }
    }
    return out;
  }

  formatSpecialties (data) {
    const a = [];
    for (const [k, v] of data) {
      for (const x of v) {
        a.push({
          ...x,
          parent: k,
          name: ` (${x.name})`,
        });
      }
    }
    a.sort((x, y) => {
      if (x.parent < y.parent) {
        return -1;
      }
      if (x.parent > y.parent) {
        return 1;
      }
      if (x.name < y.name) {
        return -1;
      }
      if (x.name > y.name) {
        return 1;
      }
      return 0;
    });
    const columnHeight = Math.ceil(a.length / 2);
    const b = [];
    for (let i = 0; i < a.length; i += columnHeight) {
      b.push(a.slice(i, i + columnHeight));
    }
    return {
      columns: b.map((list) => ({
        stack: list.map((item) => ({
          columns: [
            { text: [this.formatTraitName(item.parent), item.name], style: 'hang', width: 178 },
            { text: Generator.formatDots(item), width: 'auto' },
          ],
          columnGap: 8,
        })),
        width: 276,
      })),
    };
  }

  formatBicolumn (data) {
    if (!data) {
      return [];
    }
    const names = Object.keys(data);
    names.sort();
    const height = Math.ceil(names.length / 2);
    const leftNames = names.splice(0, height);
    const rightNames = names;
    return [
      Generator.makeDivider(),
      {
        columns: [
          this.formatTraitsWide(data, leftNames),
          this.formatTraitsWide(data, rightNames),
        ],
      },
    ];
  }

  formatTraitsWide (data, names) {
    const n = names || Object.keys(data);
    return {
      stack: n.map((x) => ({
        columns: [
          {
            stack: [x ? this.formatTraitName(x, data[x] || {}) : ' '],
            style: 'hang',
            width: 178,
          },
          {
            stack: [x ? { text: Generator.formatDots(data[x] || {}) } : ' '],
            width: 'auto',
          },
        ],
        columnGap: 8,
      })),
      width: 276,
    };
  }

  static formatHeaderLine (header, content) {
    return content
      ? [{
        columns: [
          { text: `${header}:`, bold: true, width: 52 },
          { text: content, width: 'auto' },
        ],
        columnGap: 12,
      }]
      : [];
  }

  static formatEssencePool (name, data) {
    return data
      ? `${name} ${data.maximum - (data.committed || 0)} (${data.maximum})`
      : '';
  }

  static formatIntimacy (data) {
    const out = [
      `${data.name} `,
      {
        text: data.special ? `(${data.points}, ${data.special})` : `(${data.points})`,
        bold: data.active,
      },
    ];
    return out;
  }

  static formatAlchemicalArray (subsection, array) {
    const out = [subsection];
    for (const charm of array) {
      out.push(...Generator.formatStyledName(charm));
      if (charm.submodules?.length) {
        out.push(' (');
        for (const submodule of charm.submodules) {
          out.push(...Generator.formatStyledName(submodule));
          out.push(', ');
        }
        out.pop();
        out.push(')');
      }
      out.push(', ');
    }
    out.pop();
    return [{ stack: [{ text: out }], style: 'hang', marginBottom: 2 }];
  }

  static formatDots (obj) {
    if (obj && obj['n/a']) {
      return [{ text: 'N/A', style: 'N/A' }];
    }
    let { creation, bonus, experienced, augmented, diminished } = obj || {};
    creation = creation || 0;
    bonus = bonus || creation;
    experienced = experienced || bonus;
    augmented = augmented || experienced;
    if (!augmented) {
      return [{ text: '\u2014', style: 'diminished' }];
    }
    const maximum = augmented;
    if (typeof diminished !== 'number') {
      diminished = Infinity;
    }
    creation = Math.min(creation, diminished);
    bonus = Math.min(bonus, diminished);
    experienced = Math.min(experienced, diminished);
    augmented = Math.min(augmented, diminished);
    const out = [];
    if (creation > 0) {
      out.push(Generator.formatDotSection(0, creation, 'creation'));
    }
    if (bonus > creation) {
      out.push(Generator.formatDotSection(creation, bonus, 'bonus'));
    }
    if (experienced > bonus) {
      out.push(Generator.formatDotSection(bonus, experienced, 'experienced'));
    }
    if (augmented > experienced) {
      out.push(Generator.formatDotSection(experienced, augmented, 'augmented'));
    }
    if (maximum > augmented) {
      out.push(Generator.formatDotSection(augmented, maximum, 'diminished'));
    }
    return out;
  }

  static formatDotSection (from, to, style) {
    let text = '\u2022'.repeat(to - from);
    if (from <= 4 && to >= 5) {
      text = ['\u2022'.repeat(5 - from), '\u2022'.repeat(to - 5)].join(' ');
    }
    return { text, style };
  }

  static formatSlotField (obj) {
    let { creation, bonus, experienced, augmented, diminished } = obj || {};
    creation = creation || 0;
    bonus = bonus || creation;
    experienced = experienced || bonus;
    augmented = augmented || experienced;
    if (!augmented) {
      return [{ text: 0, style: 'diminished' }];
    }
    const maximum = augmented;
    if (typeof diminished !== 'number') {
      diminished = Infinity;
    }
    creation = Math.min(creation, diminished);
    bonus = Math.min(bonus, diminished);
    experienced = Math.min(experienced, diminished);
    augmented = Math.min(augmented, diminished);
    const out = [];
    if (creation > 0) {
      out.push({ text: creation, style: 'creation' });
      out.push(' + ');
    }
    if (bonus > creation) {
      out.push({ text: bonus - creation, style: 'bonus' });
      out.push(' + ');
    }
    if (experienced > bonus) {
      out.push({ text: experienced - bonus, style: 'experienced' });
      out.push(' + ');
    }
    if (augmented > experienced) {
      out.push({ text: augmented - experienced, style: 'augmented' });
      out.push(' + ');
    }
    out.pop();
    if (maximum > diminished) {
      out.push(' ');
      out.push({ text: `(${maximum - diminished} lost)`, style: 'diminished' });
    }
    return out;
  }

  static formatCharm (obj) {
    const edges = obj.edges;
    if (!edges) {
      return Generator.formatStyledName(obj);
    }
    const prep = { name: obj.name };
    if (edges.some((x) => x.creation)) {
      prep.creation = 1;
    } else if (edges.some((x) => x.bonus)) {
      prep.bonus = 1;
    } else if (edges.some((x) => x.experienced)) {
      prep.experienced = 1;
    } else if (edges.some((x) => x.augmented)) {
      prep.augmented = 1;
    } else {
      return [];
    }
    const out = Generator.formatStyledName(prep);
    out.push(' (');
    for (const edge of edges) {
      out.push(...Generator.formatStyledName(edge), ', ');
    }
    out.pop();
    out.push(')');
    return out;
  }

  static formatStyledName (obj) {
    let { creation, bonus, experienced, augmented, diminished } = obj || {};
    creation = creation || 0;
    bonus = bonus || creation;
    experienced = experienced || bonus;
    augmented = augmented || experienced;
    if (!augmented) {
      return [];
    }
    if (augmented > 1) {
      return [`${obj.name} `, ...Generator.formatDots(obj)];
    }
    if (typeof diminished !== 'number') {
      diminished = Infinity;
    }
    creation = Math.min(creation, diminished);
    bonus = Math.min(bonus, diminished);
    experienced = Math.min(experienced, diminished);
    augmented = Math.min(augmented, diminished);
    let style = 'diminished';
    if (creation) {
      style = 'creation';
    } else if (bonus) {
      style = 'bonus';
    } else if (experienced) {
      style = 'experienced';
    } else if (augmented) {
      style = 'augmented';
    }
    return [{ text: obj.name, style }];
  }

  static makeDivider (width) {
    return [{
      canvas: [
        {
          type: 'line',
          x1: 0,
          y1: 0.5,
          x2: width || 540,
          y2: 0.5,
          lineColor: 'black',
          opacity: 0.7,
          lineWidth: 0.75,
        },
      ],
      margin: [0, 4],
    }];
  }

  static conditionalPageBreak (node, rest) {
    if (node.pageBreak !== 'conditional') {
      return false;
    }
    return !rest.some((x) => x.pageBreak === 'conditional');
  }
}

export class NoCasteAbilitiesGenerator extends Generator {
  get formattedAbilities () {
    return [
      Generator.makeDivider(),
      {
        columns: [
          this.formatAbilities([
            [
              'Archery', 'Athletics', 'Awareness', 'Bureaucracy', 'Dodge', 'Integrity',
              'Investigation', 'Larceny', 'Linguistics', 'Lore', 'Martial Arts',
            ],
          ]),
          this.formatAbilities([
            [
              'Medicine', 'Melee', 'Occult', 'Presence', 'Performance', 'Resistance',
              'Ride', 'Sail', 'Socialize', 'Stealth', 'Survival',
            ],
          ]),
          this.formatAbilities([
            [
              'Thrown', 'War', 'Craft',
            ],
          ]),
        ],
      },
    ];
  }
}

export class NoFavoredCharmsGenerator extends NoCasteAbilitiesGenerator {
  formatCharmSplat (groups) {
    const out = super.formatCharmSplat(groups);
    for (const para of out) {
      if (typeof para[0] === 'object') {
        para[0].italics = false;
      }
    }
    return out;
  }
}
