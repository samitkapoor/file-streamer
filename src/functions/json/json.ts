import { Data, Response } from '../../types';

export const pipeJsonAsJson = async (res: Response, data: Data, fileName?: string) => {
  try {
    let responseFileName = !fileName
      ? 'data.json'
      : fileName.endsWith('.json')
      ? fileName
      : `${fileName}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${responseFileName}`);

    res.write('[\n');

    data.forEach((item: (typeof data)[0], index: number) => {
      const isLast = index === data.length - 1;

      res.write(JSON.stringify(item, null, 2));

      if (!isLast) {
        res.write(',\n');
      } else {
        res.write('\n');
      }
    });

    res.write(']\n');
    res.end();
  } catch (err: unknown) {
    console.error(err);
    throw err;
  }
};
