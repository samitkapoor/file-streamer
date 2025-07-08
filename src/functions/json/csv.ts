import { Data, Response } from '../../types';

export const pipeJsonAsCsv = async (res: Response, data: Data, fileName?: string) => {
  try {
    let responseFileName = !fileName
      ? 'data.csv'
      : fileName.endsWith('.csv')
      ? fileName
      : `${fileName}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${responseFileName}`);

    if (data.length === 0) {
      res.write('No data');
      res.end();
      return;
    }

    const headers = Object.keys(data[0]);
    const headerRow = headers.join(',');
    res.write(headerRow + '\n');

    data.forEach((item: (typeof data)[0]) => {
      const row = headers.map((header) => {
        const value = item[header];
        if (
          typeof value === 'string' &&
          (value.includes(',') || value.includes('"') || value.includes('\n'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      });
      res.write(row.join(',') + '\n');
    });

    res.end();
  } catch (err: unknown) {
    console.error(err);
    throw err;
  }
};
