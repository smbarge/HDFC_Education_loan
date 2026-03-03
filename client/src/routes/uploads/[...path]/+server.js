import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { error } from '@sveltejs/kit';

export async function GET({ params }) {
  const filePath = join(process.cwd(), 'uploads', params.path);

  if (!existsSync(filePath)) {
    throw error(404, 'File not found');
  }

  const file = readFileSync(filePath);
  const ext = params.path.split('.').pop().toLowerCase();

  const mimeTypes = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png'
  };

  return new Response(file, {
    headers: { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' }
  });
}