import fs from 'fs';
import { makeAbsoluteFontDescriptor } from '../pdf/fonts';
import PdfPrinter from 'pdfmake/src/printer';
import { stdInput, stdInputOption, stdOutputOption } from '../command-helpers';

export const command = 'pdf';

export const describe = 'Generate a PDF character sheet';

export function builder (yargs) {
  return yargs
    .options({
      ...stdInputOption,
      ...stdOutputOption,
    })
    .demandOption(['output']);
}

export function handler (argv) {
  stdInput(argv);
  return import('../handlers/pdf')
    .then((i) => i.default(argv))
    .then((result) => {
      const printer = new PdfPrinter(makeAbsoluteFontDescriptor());
      const pdf = printer.createPdfKitDocument(result);
      const out = fs.createWriteStream(argv.output);
      pdf.pipe(out);
      pdf.end();
    })
    .catch((e) => console.error(argv.debug ? e : e.message));
}
