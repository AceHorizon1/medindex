import { extractText } from 'unpdf';

/**
 * Parses text from a PDF buffer purely in-memory.
 * Zero DOM dependencies; fully compatible with serverless & edge runtimes.
 * No data is ever written to disk or persisted to any database.
 */
export async function extractTextFromPdf(buffer: Buffer | Uint8Array): Promise<string> {
  try {
    const { text } = await extractText(buffer, { mergePages: true });
    return (Array.isArray(text) ? text.join('\n\n') : text)?.trim() || '';
  } catch (error) {
    console.error('In-memory PDF parsing error:', error);
    return '';
  }
}
