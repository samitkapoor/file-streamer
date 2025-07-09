import { Base64Data, ContentType, Response } from '../../types';
import { getFileExtensionFromMimeType } from '../../utils';

export const pipeBase64 = async (
  res: Response,
  data: Base64Data,
  contentType?: ContentType,
  fileName?: string
) => {
  try {
    const mimeType = contentType || 'application/octet-stream';

    let responseFileName: string;
    if (fileName) {
      if (fileName.includes('.')) {
        responseFileName = fileName;
      } else {
        const extension = getFileExtensionFromMimeType(mimeType);
        responseFileName = `${fileName}${extension}`;
      }
    } else {
      const extension = getFileExtensionFromMimeType(mimeType);
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
