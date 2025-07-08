import httpMocks from 'node-mocks-http';
import { Request } from 'express';
import { pipeJsonAsJson } from '../../src/functions/stream-json';
import { Data } from '../../src/types';

describe('JSON to JSON API Endpoint Tests', () => {
  // Sample test data
  const testData: Data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35 }
  ];

  const emptyData: Data = [];

  const singleRecordData: Data = [{ id: 1, name: 'Single User', email: 'single@example.com' }];

  const complexData: Data = [
    {
      id: 1,
      name: 'Complex User',
      metadata: {
        preferences: ['dark-mode', 'notifications'],
        settings: { theme: 'dark', language: 'en' }
      },
      scores: [95, 87, 92]
    }
  ];

  describe('API Endpoint with pipeJsonAsJson', () => {
    test('should set correct headers when calling pipeJsonAsJson', async () => {
      // Create mock response object
      const res = httpMocks.createResponse();

      // Call the function
      await pipeJsonAsJson(res as any, testData, 'test-file');

      // Verify headers were set correctly
      expect(res.getHeader('Content-Type')).toBe('application/json');
      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=test-file.json');
    });

    test('should handle filename without .json extension', async () => {
      const res = httpMocks.createResponse();

      await pipeJsonAsJson(res as any, testData, 'my-data');

      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=my-data.json');
    });

    test('should use default filename when none provided', async () => {
      const res = httpMocks.createResponse();

      await pipeJsonAsJson(res as any, testData);

      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=data.json');
    });

    test('should handle empty data in API endpoint', async () => {
      const res = httpMocks.createResponse();

      await pipeJsonAsJson(res as any, emptyData, 'empty-data');

      expect(res.getHeader('Content-Type')).toBe('application/json');
      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=empty-data.json');

      const jsonContent = res._getData();
      expect(JSON.parse(jsonContent)).toEqual([]);
    });

    test('should generate valid JSON format for valid data', async () => {
      const res = httpMocks.createResponse();

      await pipeJsonAsJson(res as any, testData, 'test-data');

      const jsonContent = res._getData();
      const parsedJson = JSON.parse(jsonContent);

      // Check that it's a valid JSON array
      expect(Array.isArray(parsedJson)).toBe(true);
      expect(parsedJson.length).toBe(3);

      // Check structure of first object
      expect(parsedJson[0]).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
      });
    });

    test('should handle single record data', async () => {
      const res = httpMocks.createResponse();

      await pipeJsonAsJson(res as any, singleRecordData, 'single-record');

      const jsonContent = res._getData();
      const parsedJson = JSON.parse(jsonContent);

      expect(Array.isArray(parsedJson)).toBe(true);
      expect(parsedJson.length).toBe(1);
      expect(parsedJson[0]).toEqual({
        id: 1,
        name: 'Single User',
        email: 'single@example.com'
      });
    });

    test('should handle complex nested data structures', async () => {
      const res = httpMocks.createResponse();

      await pipeJsonAsJson(res as any, complexData, 'complex-data');

      const jsonContent = res._getData();
      const parsedJson = JSON.parse(jsonContent);

      expect(Array.isArray(parsedJson)).toBe(true);
      expect(parsedJson.length).toBe(1);
      expect(parsedJson[0]).toEqual(complexData[0]);

      // Verify nested structures are preserved
      expect(parsedJson[0].metadata.preferences).toEqual(['dark-mode', 'notifications']);
      expect(parsedJson[0].metadata.settings.theme).toBe('dark');
      expect(parsedJson[0].scores).toEqual([95, 87, 92]);
    });

    test('should generate properly formatted JSON with indentation', async () => {
      const res = httpMocks.createResponse();

      await pipeJsonAsJson(res as any, singleRecordData, 'formatted-data');

      const jsonContent = res._getData();

      // Check that the JSON is properly formatted with indentation
      expect(jsonContent).toContain('[\n');
      expect(jsonContent).toContain('{\n');
      expect(jsonContent).toContain('"id": 1,');
      expect(jsonContent).toContain(']\n');
    });
  });

  describe('Simulated Express Route', () => {
    test('should simulate a complete Express route handler', async () => {
      // Simulate Express route handler
      const downloadJsonHandler = async (req: Request, res: any) => {
        try {
          const { data, filename } = req.body;
          await pipeJsonAsJson(res, data || testData, filename || 'download');
          return { success: true };
        } catch (error) {
          res.status(500).json({ error: 'Failed to generate JSON file' });
          return { success: false, error };
        }
      };

      // Create mock request with body data
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/download-json',
        body: {
          data: testData,
          filename: 'user-report'
        }
      }) as Request;

      const res = httpMocks.createResponse();

      // Execute the route handler
      const result = await downloadJsonHandler(req, res);

      // Verify the response
      expect(result.success).toBe(true);
      expect(res.getHeader('Content-Type')).toBe('application/json');
      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=user-report.json');

      // Verify JSON content
      const jsonContent = res._getData();
      const parsedJson = JSON.parse(jsonContent);
      expect(parsedJson).toEqual(testData);
    });

    test('should handle errors in route handler', async () => {
      const downloadJsonHandler = async (req: Request, res: any) => {
        try {
          // Simulate an error scenario by passing invalid data
          await pipeJsonAsJson(null as any, testData);
          return { success: true };
        } catch (error) {
          res.status(500).json({ error: 'Failed to generate JSON file' });
          return { success: false, error };
        }
      };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/download-json',
        body: { data: testData }
      }) as Request;

      const res = httpMocks.createResponse();

      const result = await downloadJsonHandler(req, res);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Failed to generate JSON file'
      });
    });

    test('should handle request with query parameters', async () => {
      // Simulate route handler that gets data from query params
      const downloadJsonHandler = async (req: Request, res: any) => {
        try {
          const filename = (req.query.filename as string) || 'default';
          await pipeJsonAsJson(res, testData, filename);
          return { success: true };
        } catch (error) {
          return { success: false, error };
        }
      };

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/download-json',
        query: {
          filename: 'query-report'
        }
      }) as Request;

      const res = httpMocks.createResponse();

      const result = await downloadJsonHandler(req, res);

      expect(result.success).toBe(true);
      expect(res.getHeader('Content-Disposition')).toBe('attachment; filename=query-report.json');
    });

    test('should handle empty data with proper structure', async () => {
      const downloadJsonHandler = async (req: Request, res: any) => {
        try {
          const { data, filename } = req.body;
          await pipeJsonAsJson(res, data, filename);
          return { success: true };
        } catch (error) {
          res.status(500).json({ error: 'Failed to generate JSON file' });
          return { success: false, error };
        }
      };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/download-json',
        body: {
          data: emptyData,
          filename: 'empty-report'
        }
      }) as Request;

      const res = httpMocks.createResponse();

      const result = await downloadJsonHandler(req, res);

      expect(result.success).toBe(true);
      expect(res.getHeader('Content-Type')).toBe('application/json');

      const jsonContent = res._getData();
      const parsedJson = JSON.parse(jsonContent);
      expect(parsedJson).toEqual([]);
    });

    test('should handle complex data in route handler', async () => {
      const downloadJsonHandler = async (req: Request, res: any) => {
        try {
          const { data, filename } = req.body;
          await pipeJsonAsJson(res, data, filename);
          return { success: true };
        } catch (error) {
          res.status(500).json({ error: 'Failed to generate JSON file' });
          return { success: false, error };
        }
      };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/download-json',
        body: {
          data: complexData,
          filename: 'complex-report'
        }
      }) as Request;

      const res = httpMocks.createResponse();

      const result = await downloadJsonHandler(req, res);

      expect(result.success).toBe(true);

      const jsonContent = res._getData();
      const parsedJson = JSON.parse(jsonContent);
      expect(parsedJson).toEqual(complexData);

      // Verify complex structures are maintained
      expect(parsedJson[0].metadata.preferences).toEqual(['dark-mode', 'notifications']);
      expect(parsedJson[0].scores).toEqual([95, 87, 92]);
    });
  });
});
