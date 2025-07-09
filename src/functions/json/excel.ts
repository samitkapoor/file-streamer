import ExcelJS from 'exceljs';
import { JsonData, Response } from '../../types';

export const jsonToExcelBuffer = async (data: JsonData, sheetName = 'Sheet1') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  if (data.length === 0) {
    worksheet.addRow(['No data']);
  } else {
    worksheet.columns = Object.keys(data[0]).map((key) => ({
      header: key,
      key: key,
      width: 20
    }));

    data.forEach((item: (typeof data)[0]) => {
      worksheet.addRow(item);
    });
  }

  return workbook;
};

export const pipeJsonAsExcel = async (res: Response, data: JsonData, fileName?: string) => {
  try {
    let responseFileName = !fileName
      ? 'data.xlsx'
      : fileName.endsWith('.xlsx')
      ? fileName
      : `${fileName}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${responseFileName}`);

    const workbook = await jsonToExcelBuffer(data);

    workbook.xlsx.write(res);
  } catch (err: unknown) {
    console.error(err);
    throw err;
  }
};
