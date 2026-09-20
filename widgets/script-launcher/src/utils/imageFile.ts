export const MAX_ICON_BYTES = 512 * 1024;

const IMAGE_MIME_BY_EXTENSION: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  bmp: 'image/bmp',
  avif: 'image/avif',
};

export const IMAGE_ACCEPT = Object.keys(IMAGE_MIME_BY_EXTENSION)
  .map((extension) => `.${extension}`)
  .join(',');

export async function readFileAsDataUrl(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const mimeType =
    IMAGE_MIME_BY_EXTENSION[extension] ??
    (file.type || 'application/octet-stream');

  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return `data:${mimeType};base64,${btoa(binary)}`;
}
