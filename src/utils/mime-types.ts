import { ContentType } from '../types';

// Mapping of file extensions to MIME types
const extensionToMimeType: { [key: string]: ContentType } = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.zip': 'application/zip',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg'
};

// Mapping of MIME types to file extensions
const mimeTypeToExtension: { [key: string]: string } = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'text/html': '.html',
  'text/css': '.css',
  'text/javascript': '.js',
  'application/json': '.json',
  'application/xml': '.xml',
  'application/zip': '.zip',
  'application/x-zip-compressed': '.zip',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/ogg': '.ogg'
};

/**
 * Gets the content type (MIME type) from a file extension
 * @param extension - File extension (e.g., '.jpg', '.png')
 * @returns ContentType or 'application/octet-stream' as default
 */
export const getContentTypeFromExtension = (extension: string): ContentType => {
  return extensionToMimeType[extension.toLowerCase()] || 'application/octet-stream';
};

/**
 * Gets the file extension from a MIME type
 * @param mimeType - MIME type (e.g., 'image/jpeg', 'application/pdf')
 * @returns File extension or '.bin' as default
 */
export const getFileExtensionFromMimeType = (mimeType: string): string => {
  return mimeTypeToExtension[mimeType.toLowerCase()] || '.bin';
};
