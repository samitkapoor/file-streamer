import httpMocks from 'node-mocks-http';
import { Request } from 'express';
import { pipeJsonAsCsv } from '../../src/functions';
import { Data } from '../../src/types';

describe('JSON to CSV API Endpoint Tests', () => {
  // Sample test data
  const testData: Data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35 }
  ];

  const emptyData: Data = [];

  const singleRecordData: Data = [{ id: 1, name: 'Single User', email: 'single@example.com' }];

  const dataWithSpecialChars: Data = [
    { id: 1, name: 'John, Doe', description: 'Has "quotes"', value: 'test,value' }
  ];

  describe('API Endpoint with pipeJsonAsCsv', () => {
    test('should set correct headers when calling pipeJsonAsCsv', async () => {
      // Create mock response object
      const res = httpMocks.createResponse();

      // Call the function
      await pipeJsonAsCsv(res as any, testData, 'test-file');

      // Verify headers were set correctly
      expect(res.getHeader('Content-Type')).toBe('text/csv');
      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=test-file.csv');
    });

    test('should handle filename without .csv extension', async () => {
      const res = httpMocks.createResponse();

      await pipeJsonAsCsv(res as any, testData, 'my-data');

      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=my-data.csv');
    });

    test('should use default filename when none provided', async () => {
      const res = httpMocks.createResponse();

      await pipeJsonAsCsv(res as any, testData);

      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=data.csv');
    });

    test('should handle empty data in API endpoint', async () => {
      const res = httpMocks.createResponse();

      await pipeJsonAsCsv(res as any, emptyData, 'empty-data');

      expect(res.getHeader('Content-Type')).toBe('text/csv');
      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=empty-data.csv');

      const csvContent = res._getData();
      expect(csvContent).toBe('No data');
    });

    test('should generate correct CSV format for valid data', async () => {
      const res = httpMocks.createResponse();

      await pipeJsonAsCsv(res as any, testData, 'test-data');

      const csvContent = res._getData();
      const lines = csvContent.split('\n');

      // Check header row
      expect(lines[0]).toBe('id,name,email,age');

      // Check data rows
      expect(lines[1]).toBe('1,John Doe,john@example.com,30');
      expect(lines[2]).toBe('2,Jane Smith,jane@example.com,25');
      expect(lines[3]).toBe('3,Bob Johnson,bob@example.com,35');
    });

    test('should handle single record data', async () => {
      const res = httpMocks.createResponse();

      await pipeJsonAsCsv(res as any, singleRecordData, 'single-record');

      const csvContent = res._getData();
      const lines = csvContent.split('\n');

      expect(lines[0]).toBe('id,name,email');
      expect(lines[1]).toBe('1,Single User,single@example.com');
    });

    test('should properly escape special characters in CSV', async () => {
      const res = httpMocks.createResponse();

      await pipeJsonAsCsv(res as any, dataWithSpecialChars, 'special-chars');

      const csvContent = res._getData();
      const lines = csvContent.split('\n');

      // Check that commas and quotes are properly escaped
      expect(lines[0]).toBe('id,name,description,value');
      expect(lines[1]).toContain('"John, Doe"'); // comma escaped
      expect(lines[1]).toContain('"Has ""quotes"""'); // quotes escaped
      expect(lines[1]).toContain('"test,value"'); // comma in value escaped
    });
  });

  describe('Simulated Express Route', () => {
    test('should simulate a complete Express route handler', async () => {
      // Simulate Express route handler
      const downloadCsvHandler = async (req: Request, res: any) => {
        try {
          const { data, filename } = req.body;
          await pipeJsonAsCsv(res, data || testData, filename || 'download');
          return { success: true };
        } catch (error) {
          res.status(500).json({ error: 'Failed to generate CSV file' });
          return { success: false, error };
        }
      };

      // Create mock request with body data
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/download-csv',
        body: {
          data: testData,
          filename: 'user-report'
        }
      }) as Request;

      const res = httpMocks.createResponse();

      // Execute the route handler
      const result = await downloadCsvHandler(req, res);

      // Verify the response
      expect(result.success).toBe(true);
      expect(res.getHeader('Content-Type')).toBe('text/csv');
      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=user-report.csv');

      // Verify CSV content
      const csvContent = res._getData();
      expect(csvContent).toContain('id,name,email,age');
      expect(csvContent).toContain('John Doe');
    });

    test('should handle errors in route handler', async () => {
      const downloadCsvHandler = async (req: Request, res: any) => {
        try {
          // Simulate an error scenario by passing invalid data
          await pipeJsonAsCsv(null as any, testData);
          return { success: true };
        } catch (error) {
          res.status(500).json({ error: 'Failed to generate CSV file' });
          return { success: false, error };
        }
      };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/download-csv',
        body: { data: testData }
      }) as Request;

      const res = httpMocks.createResponse();

      const result = await downloadCsvHandler(req, res);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Failed to generate CSV file'
      });
    });

    test('should handle request with query parameters', async () => {
      // Simulate route handler that gets data from query params
      const downloadCsvHandler = async (req: Request, res: any) => {
        try {
          const filename = (req.query.filename as string) || 'default';
          await pipeJsonAsCsv(res, testData, filename);
          return { success: true };
        } catch (error) {
          return { success: false, error };
        }
      };

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/download-csv',
        query: {
          filename: 'query-report'
        }
      }) as Request;

      const res = httpMocks.createResponse();

      const result = await downloadCsvHandler(req, res);

      expect(result.success).toBe(true);
      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=query-report.csv');
    });

    test('should handle empty data with proper error handling', async () => {
      const downloadCsvHandler = async (req: Request, res: any) => {
        try {
          const { data, filename } = req.body;
          await pipeJsonAsCsv(res, data, filename);
          return { success: true };
        } catch (error) {
          res.status(500).json({ error: 'Failed to generate CSV file' });
          return { success: false, error };
        }
      };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/download-csv',
        body: {
          data: emptyData,
          filename: 'empty-report'
        }
      }) as Request;

      const res = httpMocks.createResponse();

      const result = await downloadCsvHandler(req, res);

      expect(result.success).toBe(true);
      expect(res.getHeader('Content-Type')).toBe('text/csv');
      expect(res._getData()).toBe('No data');
    });
  });
});
