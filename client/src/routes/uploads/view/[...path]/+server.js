import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { error } from '@sveltejs/kit';

export async function GET({ params }) {
  // params.path will be like "1/2/document_123.pdf"
  const filePath = join(process.cwd(), 'static', 'uploads', params.path);

  if (!existsSync(filePath)) {
    throw error(404, 'File not found');
  }

  const file = readFileSync(filePath);
  const ext = params.path.split('.').pop().toLowerCase();

  const mimeTypes = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };

  return new Response(file, {
    headers: { 
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Content-Disposition': 'inline'
    }
  });
}