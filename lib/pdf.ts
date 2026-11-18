import { PDFParse } from 'pdf-parse';

/**
 * Parses text from a PDF buffer purely in-memory.
 * No data is ever written to disk or persisted to any database.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result?.text?.trim() || '';
    await parser.destroy();
    return text;
  } catch (error) {
    console.error('In-memory PDF parsing error:', error);
    return '';
  }
}
