import { createReadStream, statSync } from 'fs';
import { extname, basename } from 'path';
import { ContentType, Response } from '../../types';
import { getContentTypeFromExtension } from '../../utils';

export const pipeFileFromPath = async (
  res: Response,
  filePath: string,
  fileName?: string,
  contentType?: ContentType
) => {
  try {
    // Check if file exists and get stats
    let fileStats;
    try {
      fileStats = statSync(filePath);
    } catch (error) {
      throw new Error(`File not found: ${filePath}`);
    }

    if (!fileStats.isFile()) {
      throw new Error(`Path is not a file: ${filePath}`);
    }

    // Determine content type
    const fileExtension = extname(filePath);
    const mimeType = contentType || getContentTypeFromExtension(fileExtension);

    // Determine filename
    let responseFileName: string;
    if (fileName) {
      responseFileName = fileName.includes('.') ? fileName : `${fileName}${fileExtension}`;
    } else {
      responseFileName = basename(filePath);
    }

    // Set response headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${responseFileName}"`);
    res.setHeader('Content-Length', fileStats.size);

    // Create read stream and pipe to response
    const readStream = createReadStream(filePath);

    // Handle stream errors
    readStream.on('error', (error) => {
      console.error('Error reading file:', error);
      if (!res.headersSent) {
        res.status(500).end('Error reading file');
      }
    });

    // Pipe the file stream to the response
    readStream.pipe(res);
  } catch (err: unknown) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).end('Internal server error');
    }
    throw err;
  }
};
