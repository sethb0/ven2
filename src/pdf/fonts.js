import { join, relative, resolve } from 'path';

export function makeAbsoluteFontDescriptor () {
  const fontDir = resolve(__dirname, '..', 'assets', 'pdf');

  function fontPath (...args) {
    return join(fontDir, ...args);
  }

  return {
    RobotoCondensed: {
      normal: fontPath('RobotoCondensed', 'RobotoCondensed-Light.ttf'),
      italics: fontPath('RobotoCondensed', 'RobotoCondensed-LightItalic.ttf'),
      bold: fontPath('RobotoCondensed', 'RobotoCondensed-Bold.ttf'),
      bolditalics: fontPath('RobotoCondensed', 'RobotoCondensed-BoldItalic.ttf'),
    },
    PTSans: {
      normal: fontPath('PTSans', 'PT_Sans-Web-Regular.ttf'),
      italics: fontPath('PTSans', 'PT_Sans-Web-Italic.ttf'),
      bold: fontPath('PTSans', 'PT_Sans-Web-Bold.ttf'),
      bolditalics: fontPath('PTSans', 'PT_Sans-Web-BoldItalic.ttf'),
    },
    PTSerif: {
      normal: fontPath('PTSerif', 'PT_Serif-Web-Regular.ttf'),
      italics: fontPath('PTSerif', 'PT_Serif-Web-Italic.ttf'),
      bold: fontPath('PTSerif', 'PT_Serif-Web-Bold.ttf'),
      bolditalics: fontPath('PTSerif', 'PT_Serif-Web-BoldItalic.ttf'),
    },
    Pterra: {
      normal: fontPath('pterra.ttf'),
      italics: fontPath('pterra.ttf'),
      bold: fontPath('pterra.ttf'),
      bolditalics: fontPath('pterra.ttf'),
    },
    Trebuchet: {
      normal: fontPath('Trebuchet', 'Trebuchet-MS.ttf'),
      italics: fontPath('Trebuchet', 'Trebuchet-MS-Italic.ttf'),
      bold: fontPath('Trebuchet', 'Trebuchet-MS-Bold.ttf'),
      bolditalics: fontPath('Trebuchet', 'Trebuchet-MS-Bold-Italic.ttf'),
    },
  };
}

export function makeRelativeFontDescriptor (relativeTo) {
  const out = {};
  Object.entries(makeAbsoluteFontDescriptor()).forEach(([font, descriptor]) => {
    const relativeDescriptor = {};
    Object.entries(descriptor).forEach(([style, path]) => {
      relativeDescriptor[style] = relative(relativeTo, path);
    });
    out[font] = relativeDescriptor;
  });
  return out;
}
