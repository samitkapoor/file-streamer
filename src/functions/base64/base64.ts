import { Base64Data, ContentType, Response } from '../../types';

export const pipeBase64 = async (
  res: Response,
  data: Base64Data,
  contentType?: ContentType,
  fileName?: string
) => {
  try {
    const mimeType = contentType || 'application/octet-stream';

    const getFileExtension = (mimeType: string): string => {
      const mimeToExtension: { [key: string]: string } = {
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

      return mimeToExtension[mimeType.toLowerCase()] || '.bin';
    };

    let responseFileName: string;
    if (fileName) {
      if (fileName.includes('.')) {
        responseFileName = fileName;
      } else {
        const extension = getFileExtension(mimeType);
        responseFileName = `${fileName}${extension}`;
      }
    } else {
      const extension = getFileExtension(mimeType);
      responseFileName = `data${extension}`;
    }

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${responseFileName}"`);

    const buffer = Buffer.from(data, 'base64');
    res.write(buffer);
    res.end();
  } catch (err) {
    console.error(err);
    throw err;
  }
};
