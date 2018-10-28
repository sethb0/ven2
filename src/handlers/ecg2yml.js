/* eslint no-undefined: off */
import { casteTraits as loadCasteTraits, casteYozis as loadCasteYozis } from '@ven2/data';
import { DOMParser } from 'xmldom';
import { dumpString as dumpYamlString, loadSync as loadYamlSync } from '@sethb0/yaml-utils';
import path from 'path';
import xmlToJson from 'xmltojson';

xmlToJson.stringToXML = (string) => new DOMParser().parseFromString(string, 'text/xml');

const CHARMS = loadYamlSync(path.resolve(__dirname, '..', 'ecg', 'charms.yml'));
const LANGUAGES = loadYamlSync(path.resolve(__dirname, '..', 'ecg', 'languages.yml'));
const SPELLS = loadYamlSync(path.resolve(__dirname, '..', 'ecg', 'spells.yml'));

const CASTE_TRAITS = loadCasteTraits();
const CASTE_YOZIS = loadCasteYozis();

export default async function transform (argv) {
  const { debug } = argv;
  const ecg = xmlToJson.parseString((await argv.file).data, { grokText: false, xmlns: false });
  const out = {};

  const ch = ecg.ExaltedCharacter[0];

  const desc = ch.Description[0];
  const st = ch.Statistics[0];
  const concept = st.CharacterConcept[0];
  const models = {};
  for (const model of st.AdditionalModels[0].Model) {
    models[model._attr.templateId._value] = model;
  }

  out.name = desc.CharacterName[0]._text;
  if (desc.Player) {
    out.player = desc.Player[0]._text;
  }
  out.splat = st.CharacterType[0]._text;
  const caste = concept.Caste && concept.Caste[0]._attr.type._value;
  let casteTraits = new Set();
  if (caste) {
    out.caste = caste.replace('Moon', ' Moon');
    casteTraits = CASTE_TRAITS[out.caste];
    if (CASTE_YOZIS[out.caste]) {
      out.yozis = { patron: CASTE_YOZIS[out.caste] };
    }
  }
  if (desc.Concept) {
    out.concept = desc.Concept[0]._text;
  }
  if (concept.Motivation) {
    out.motivation = concept.Motivation[0]._text;
  }
  if (models['Infernal.Urge.Template']) {
    const vf = models['Infernal.Urge.Template'].Content[0].VirtueFlaw[0];
    if (vf.description) {
      out.urge = vf.description[0]._text;
    }
  }
  out.description = {};
  if (desc.Sex) {
    out.description.sex = desc.Sex[0]._text;
  }
  if (desc.Eyes) {
    out.description.eyes = desc.Eyes[0]._text;
  }
  if (desc.Hair) {
    out.description.hair = desc.Hair[0]._text;
  }
  if (desc.Skin) {
    out.description.skin = desc.Skin[0]._text;
  }
  if (desc.PhysicalDescription) {
    out.description.appearance = desc.PhysicalDescription[0]._text;
  }
  if (desc.Characterization) {
    out.description.characterization = desc.Characterization[0]._text;
  }
  if (desc.Anima) {
    out.anima = desc.Anima[0]._text;
  }
  out.age = concept._attr.age?._value;

  if (models['Infernal.Patron.Template']) {
    out.yozis.favored = renameYozi(
      models['Infernal.Patron.Template']?.Content[0].patronYozi[0]._attr.favored._value
    );
  }

  let vf = null;
  if (models.SolarVirtueFlaw || models['Db.VirtueFlaw.Template']
      || models['Sidereal.FlawedFate.Template'] || models['Lunar.VirtueFlaw.Template']
      || models.AbyssalResonance || models['Infernal.Urge.Template']) {
    vf = (models.SolarVirtueFlaw || models['Db.VirtueFlaw.Template']
        || models['Sidereal.FlawedFate.Template'] || models['Lunar.VirtueFlaw.Template']
        || models.AbyssalResonance || models['Infernal.Urge.Template'])
      .Content[0].VirtueFlaw[0];
    const vfOut = {};
    if (vf.Name && !models.AbyssalResonance) {
      vfOut.name = vf.Name[0]._text;
    }
    if (vf.LimitBreak) {
      vfOut.condition = vf.LimitBreak[0]._text;
    }
    if (vf.Description && !models['Infernal.Urge.Template']) {
      vfOut.description = vf.Description[0]._text;
    }
    out['virtue flaw'] = vfOut;
  }

  out.essence = { permanent: readCrExpItem(st.Essence[0]) };
  out.willpower = readCrExpItem(st.Willpower[0]);
  const virtues = st.Virtues[0];
  out.virtues = {
    Compassion: readCrExpItem(virtues.Compassion[0]),
    Conviction: readCrExpItem(virtues.Conviction[0]),
    Temperance: readCrExpItem(virtues.Temperance[0]),
    Valor: readCrExpItem(virtues.Valor[0]),
  };
  if (vf?.RootVirtue && vf.RootVirtue[0]?._attr?.name) {
    out.virtues[vf.RootVirtue[0]._attr.name._value].primary = true;
  }

  const specialties = {};

  const attrs = st.Attributes[0];
  out.attributes = {};
  for (const attrGroup of [attrs.Physical[0], attrs.Social[0], attrs.Mental[0]]) {
    for (const attribute of Object.keys(attrGroup)) {
      if (!attribute.startsWith('_')) {
        out.attributes[attribute] = {};
        if (casteTraits.has(attribute)) {
          out.attributes[attribute].caste = true;
        }
        try {
          const a = attrGroup[attribute][0];
          Object.assign(out.attributes[attribute], readCrExpItem(a));
          specialties[attribute] = readSpecialties(a);
        } catch (e) {
          e.message = `${e.message} (attribute = ${attribute})`;
          throw e;
        }
      }
    }
  }
  scrub(out.attributes);

  const abils = st.Abilities[0];
  out.abilities = {};
  for (const ability of Object.keys(abils)) {
    if (!ability.startsWith('_')) {
      const key = ability === 'MartialArts' ? 'Martial Arts' : ability;
      out.abilities[key] = {};
      const isCaste = casteTraits.has(key);
      if (isCaste) {
        out.abilities[key].caste = true;
      }
      try {
        if (key === 'Craft') {
          const favoredIn = abils.Craft[0]._attr?.favored;
          if (favoredIn) {
            out.abilities.Craft.favored = true;
          }
          specialties.Craft = {};
          for (const s of abils.Craft[0].subTrait) {
            const craft = s.traitName[0]._text;
            const craftOut = readCrExpItem(s);
            if (craftOut.creation || craftOut.experienced) {
              out.abilities.Craft[craft] = craftOut;
            }
            specialties.Craft[craft] = readSpecialties(s);
          }
          scrub(out.abilities.Craft);
          scrub(specialties.Craft);
        } else {
          const a = abils[ability][0];
          Object.assign(out.abilities[key], readCrExpItem(a));
          specialties[key] = readSpecialties(a);
        }
      } catch (e) {
        e.message = `${e.message} (ability = ${ability})`;
        throw e;
      }
    }
  }
  scrub(out.abilities);

  scrub(specialties);
  out.specialties = specialties;

  out.languages = [];
  if (models.Linguistics?.Content[0].linguistics[0].language) {
    for (const lang of models.Linguistics.Content[0].linguistics[0].language) {
      out.languages.push(LANGUAGES[lang._text] || lang._text);
    }
  }

  if (st.Backgrounds) {
    out.backgrounds = [];
    for (const background of st.Backgrounds[0].Background || []) {
      let name = background._text;
      switch (name) {
      case 'UnderworldManse':
        name = 'Underworld Manse';
        break;
      case 'UnwovenCoadjutor':
        name = 'Unwoven Coadjutor';
        break;
      default:
        // NOOP
      }
      if (background.Description) {
        name = `${name} (${background.Description[0]._text})`;
      }
      const bg = { name, ...readCrExpItem(background) };
      out.backgrounds.push(bg);
    }
  }

  out.intimacies = [];
  if (models.Intimacies?.Content[0].Intimacies[0].Intimacy) {
    for (const intimacy of models.Intimacies.Content[0].Intimacies[0].Intimacy) {
      const i = { name: intimacy._attr.name._value };
      if (intimacy._attr.complete) {
        i.active = intimacy._attr.complete._value;
      }
      let pts = 0;
      const a = intimacy.Trait[0]._attr;
      if (a.creationValue) {
        pts = a.creationValue._value;
      }
      if (a.experiencedValue) {
        pts = a.experiencedValue._value;
      }
      if (pts) {
        i.points = pts;
      }
      out.intimacies.push(i);
    }
  }

  // can't handle Thaumaturgy programmatically at this time

  if (st.Charms) {
    out.charms = {};
    out.knacks = [];
    for (const charmGroup of st.Charms[0].CharmGroup) {
      for (const charm of charmGroup.Charm) {
        const charmData = CHARMS[charm._attr.name._value];
        if (charmData) {
          const group = charmData.group;
          if (charmData.knack) {
            const charmOut = { name: charmData.name, id: charm._attr.name._value };
            if (charm._attr.experienceLearned?._value) {
              charmOut.experienced = 1;
            } else {
              charmOut.creation = 1;
            }
            out.knacks.push(charmOut);
          } else {
            const exalt = charmData.exalt;
            out.charms[exalt] ||= {};
            out.charms[exalt][group] ||= [];

            const special = charm.Special && charm.Special[0];
            if (!special || Object.keys(special).length <= 1) {
              const charmOut = {
                name: charmData.name,
                id: charm._attr.name._value,
                ...copyCharmData(charmData),
              };
              if (charm._attr.experienceLearned._value) {
                charmOut.experienced = 1;
              } else {
                charmOut.creation = 1;
              }
              out.charms[exalt][group].push(charmOut);
            } else {
              const charmsOut = [];

              if (special.LearnCount) {
                const charmOut = {
                  name: charmData.name,
                  id: charm._attr.name._value,
                  ...copyCharmData(charmData),
                  ...readCrExpItem(special.LearnCount[0]),
                };
                scrub(charmOut);
                out.charms[exalt][group].push(charmOut);
              } else if (special.Categories) {
                for (const [id, category] of Object.entries(special.Categories[0])) {
                  if (!id.startsWith('_')) {
                    const categoryName = charmData.variants[id];
                    charmsOut.push({
                      name: `${charmData.name}: ${categoryName}`,
                      id: charm._attr.name._value,
                      ...copyCharmData(charmData),
                      ...readCrExpItem(category[0]),
                    });
                  }
                }
              } else if (special.Subeffects) {
                if (charmData.variants) {
                  for (const subeffect of special.Subeffects[0].Subeffect) {
                    const variantName = charmData.variants[subeffect._attr.id._value];
                    const charmName = charmData.namee.includes('()')
                      ? charmData.name.replace(/\(.*?\)/u, variantName)
                      : `${charmData.name}: ${variantName}`;
                    const c = {
                      name: charmName,
                      id: charm._attr.name._value,
                      ...copyCharmData(charmData),
                    };
                    if (subeffect._attr.creationlearned?._value) {
                      c.creation = 1;
                    }
                    if (subeffect._attr.experiencelearned?._value) {
                      c.experienced = 1;
                    }
                    charmsOut.push(c);
                  }
                } else if (charmData.edges) {
                  const c = {
                    name: charmData.name,
                    id: charm._attr.name._value,
                    edges: [],
                    ...copyCharmData(charmData),
                  };
                  for (const subeffect of special.Subeffects[0].Subeffect) {
                    const edgeData = { name: charmData.edges[subeffect._attr.id._value] };
                    if (subeffect._attr.creationlearned?._value) {
                      edgeData.creation = 1;
                    }
                    if (subeffect._attr.experiencelearned?._value) {
                      edgeData.experienced = 1;
                    }
                    c.edges.push(edgeData);
                  }
                  scrub(c.edges);
                  charmsOut.push(c);
                } else {
                  console.warn(
                    'Warning: Charm %s has neither variants nor edges',
                    charmData.name,
                  );
                }
              } else {
                console.warn('Warning: unrecognized Charm Special in %s', charmData.name);
              }

              for (const x of charmsOut) {
                if (x.creation || x.experienced || x['edge cost']) {
                  out.charms[exalt][group].push(x);
                }
              }
            }
          }
        } else {
          console.warn('Charm not found: %s', charm._attr.name._value);
        }
      }
    }
  }

  if (st.Spells) {
    out.spells = {};
    if (st.Spells[0].Spell) {
      for (const spell of st.Spells[0].Spell) {
        const rawName = spell._attr.name._value;
        let [circle, name] = rawName.split('.'); // eslint-disable-line prefer-const
        out.spells[circle] ||= [];
        if (SPELLS[circle] && SPELLS[circle][rawName]) {
          name = SPELLS[circle][rawName];
        }
        if (spell._attr.experienceLearned && spell._attr.experienceLearned._value) {
          out.spells[circle].push({ name, id: rawName, experienced: 1 });
        } else {
          out.spells[circle].push({ name, id: rawName, creation: 1 });
        }
      }
    }
  }

  if (models.SiderealColleges) {
    out.colleges = {};
    const colleges = models.SiderealColleges.Content[0].Colleges[0];
    for (const [key, value] of Object.entries(colleges)) {
      if (!key.startsWith('_')) {
        const renamed = renameCollege(key);
        out.colleges[renamed] = readCrExpItem(value[0]);
        if (CASTE_TRAITS[out.caste].has(renamed)) {
          out.colleges[renamed].caste = true;
        }
      }
    }
    scrub(out.colleges);
  }

  out.experience = [];
  if (st.Experience[0]?.Entry) {
    for (const entry of st.Experience[0].Entry) {
      out.experience.push({
        memo: entry.Description[0]?._text || '',
        points: entry._attr.points._value,
      });
    }
  }

  if (desc.Notes) {
    out.notes = desc.Notes[0]._text;
  }

  scrub(out);
  if (debug) {
    console.log(out);
  }
  return dumpYamlString(out);
}

function copyCharmData (charm) {
  const out = {};
  if (charm['edge cost']) {
    out['edge cost'] = charm['edge cost'];
  }
  if (charm['favored caste']) {
    out['favored caste'] = charm['favored caste'];
  }
  if (charm['treat as']) {
    out['treat as'] = charm['treat as'];
  }
  if (charm.merge) {
    out.merge = charm.merge;
  }
  if (charm.gather) {
    out.gather = charm.gather;
  }
  return out;
}

function readCrExpItem (node) {
  const out = {};
  if (node._attr) {
    const a = node._attr;
    out.favored = a.favored?._value;
    out.creation = a.creationValue?._value;
    out.experienced = a.experiencedValue?._value;
    scrub(out);
  }
  return out;
}

function renameCollege (college) {
  switch (college) {
  case 'ShipsWheel':
    return 'Ship’s Wheel';
  case 'RisingSmoke':
    return 'Rising Smoke';
  case 'TreasureTrove':
    return 'Treasure Trove';
  default:
    return college;
  }
}

function renameYozi (yozi) {
  switch (yozi) {
  case 'EbonDragon':
    return 'Ebon Dragon';
  case 'SheWhoLivesInHerName':
    return 'She Who Lives in Her Name';
  default:
    return yozi;
  }
}

function readSpecialties (node) {
  const out = [];
  if (node.Specialty) {
    for (const sp of node.Specialty) {
      out.push({ name: sp._attr.name._value, ...readCrExpItem(sp) });
    }
  }
  return out;
}

function scrub (obj) {
  for (const [key, value] of Object.entries(obj)) {
    if (
      value === null || typeof value === 'undefined'
      || (typeof value === 'object' && !Object.keys(value).length)
    ) {
      delete obj[key];
    }
  }
}
