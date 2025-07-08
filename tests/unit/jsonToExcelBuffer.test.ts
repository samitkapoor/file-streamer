import httpMocks from 'node-mocks-http';
import { Request } from 'express';
import { jsonToExcelBuffer, pipeJsonAsExcel } from '../../src/functions/stream-json';
import { Data } from '../../src/types';

describe('JSON to Excel API Endpoint Tests', () => {
  // Sample test data
  const testData: Data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35 }
  ];

  const emptyData: Data = [];

  const singleRecordData: Data = [{ id: 1, name: 'Single User', email: 'single@example.com' }];

  describe('jsonToExcelBuffer function', () => {
    test('should create Excel workbook with correct structure for valid data', async () => {
      const workbook = await jsonToExcelBuffer(testData, 'TestSheet');

      expect(workbook).toBeDefined();
      expect(workbook.worksheets.length).toBe(1);

      const worksheet = workbook.worksheets[0];
      expect(worksheet.name).toBe('TestSheet');
      expect(worksheet.columns.length).toBe(4); // id, name, email, age
      expect(worksheet.rowCount).toBe(4); // header + 3 data rows
    });

    test('should handle empty data gracefully', async () => {
      const workbook = await jsonToExcelBuffer(emptyData);

      expect(workbook).toBeDefined();
      expect(workbook.worksheets.length).toBe(1);

      const worksheet = workbook.worksheets[0];
      expect(worksheet.name).toBe('Sheet1'); // default name
      expect(worksheet.rowCount).toBe(1); // just "No data" row
    });

    test('should handle single record data', async () => {
      const workbook = await jsonToExcelBuffer(singleRecordData);

      expect(workbook).toBeDefined();
      const worksheet = workbook.worksheets[0];
      expect(worksheet.columns.length).toBe(3); // id, name, email
      expect(worksheet.rowCount).toBe(2); // header + 1 data row
    });
  });

  describe('API Endpoint with pipeJsonAsExcel', () => {
    test('should set correct headers when calling pipeJsonAsExcel', async () => {
      // Create mock response object
      const res = httpMocks.createResponse();

      // Call the function
      await pipeJsonAsExcel(res as any, testData, 'test-file');

      // Verify headers were set correctly
      expect(res.getHeader('Content-Type')).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=test-file.xlsx');
    });

    test('should handle filename without .xlsx extension', async () => {
      const res = httpMocks.createResponse();

      await pipeJsonAsExcel(res as any, testData, 'my-data');

      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=my-data.xlsx');
    });

    test('should use default filename when none provided', async () => {
      const res = httpMocks.createResponse();

      await pipeJsonAsExcel(res as any, testData);

      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=data.xlsx');
    });

    test('should handle empty data in API endpoint', async () => {
      const res = httpMocks.createResponse();

      await pipeJsonAsExcel(res as any, emptyData, 'empty-data');

      expect(res.getHeader('Content-Type')).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=empty-data.xlsx');
    });
  });

  describe('Simulated Express Route', () => {
    test('should simulate a complete Express route handler', async () => {
      // Simulate Express route handler
      const downloadExcelHandler = async (req: Request, res: any) => {
        try {
          const { data, filename } = req.body;
          await pipeJsonAsExcel(res, data || testData, filename || 'download');
          return { success: true };
        } catch (error) {
          res.status(500).json({ error: 'Failed to generate Excel file' });
          return { success: false, error };
        }
      };

      // Create mock request with body data
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/download-excel',
        body: {
          data: testData,
          filename: 'user-report'
        }
      }) as Request;

      const res = httpMocks.createResponse();

      // Execute the route handler
      const result = await downloadExcelHandler(req, res);

      // Verify the response
      expect(result.success).toBe(true);
      expect(res.getHeader('Content-Type')).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=user-report.xlsx');
    });

    test('should handle errors in route handler', async () => {
      const downloadExcelHandler = async (req: Request, res: any) => {
        try {
          // Simulate an error scenario by passing invalid data
          await pipeJsonAsExcel(null as any, testData);
          return { success: true };
        } catch (error) {
          res.status(500).json({ error: 'Failed to generate Excel file' });
          return { success: false, error };
        }
      };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/download-excel',
        body: { data: testData }
      }) as Request;

      const res = httpMocks.createResponse();

      const result = await downloadExcelHandler(req, res);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Failed to generate Excel file'
      });
    });

    test('should handle request with query parameters', async () => {
      // Simulate route handler that gets data from query params
      const downloadExcelHandler = async (req: Request, res: any) => {
        try {
          const filename = (req.query.filename as string) || 'default';
          await pipeJsonAsExcel(res, testData, filename);
          return { success: true };
        } catch (error) {
          return { success: false, error };
        }
      };

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/download-excel',
        query: {
          filename: 'query-report'
        }
      }) as Request;

      const res = httpMocks.createResponse();

      const result = await downloadExcelHandler(req, res);

      expect(result.success).toBe(true);
      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=query-report.xlsx');
    });
  });
});
