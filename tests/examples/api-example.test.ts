import httpMocks from 'node-mocks-http';
import { Request } from 'express';
import { pipeJsonAsExcel } from '../../src/functions/stream-json';
import { Data } from '../../src/types';

describe('Real API Endpoint Examples', () => {
  // Example data that might come from a database
  const usersData: Data = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@company.com',
      department: 'Engineering',
      salary: 85000
    },
    { id: 2, name: 'Bob Smith', email: 'bob@company.com', department: 'Marketing', salary: 65000 },
    { id: 3, name: 'Carol Davis', email: 'carol@company.com', department: 'Sales', salary: 70000 },
    {
      id: 4,
      name: 'David Wilson',
      email: 'david@company.com',
      department: 'Engineering',
      salary: 90000
    }
  ];

  describe('Users Export Endpoint', () => {
    test('should export users to Excel file', async () => {
      // Simulate an Express route: GET /api/users/export
      const exportUsersHandler = async (req: Request, res: any) => {
        try {
          // In a real app, you'd fetch this from a database
          const users = usersData;

          // Generate filename with current date
          const today = new Date().toISOString().split('T')[0];
          const filename = `users-export-${today}`;

          await pipeJsonAsExcel(res, users, filename);

          return { success: true, message: 'Export completed' };
        } catch (error) {
          res.status(500).json({ error: 'Export failed' });
          return { success: false, error };
        }
      };

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/users/export'
      }) as Request;

      const res = httpMocks.createResponse();

      const result = await exportUsersHandler(req, res);

      expect(result.success).toBe(true);
      expect(res.getHeader('Content-Type')).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      // Check filename includes today's date
      const today = new Date().toISOString().split('T')[0];
      expect(res.getHeader('Content-Disposition')).toBe(
        `attachment; filename=users-export-${today}.xlsx`
      );
    });

    test('should handle filtered export with query parameters', async () => {
      // Simulate: GET /api/users/export?department=Engineering
      const exportFilteredUsersHandler = async (req: Request, res: any) => {
        try {
          const { department } = req.query;

          // Filter users by department
          let users = usersData;
          if (department) {
            users = usersData.filter(
              (user) => user.department?.toLowerCase() === (department as string).toLowerCase()
            );
          }

          const filename = department ? `users-${department}-export` : 'users-export';

          await pipeJsonAsExcel(res, users, filename);

          return { success: true, count: users.length };
        } catch (error) {
          res.status(500).json({ error: 'Export failed' });
          return { success: false, error };
        }
      };

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/users/export',
        query: { department: 'Engineering' }
      }) as Request;

      const res = httpMocks.createResponse();

      const result = await exportFilteredUsersHandler(req, res);

      expect(result.success).toBe(true);
      expect(result.count).toBe(2); // 2 engineering users
      expect(res.getHeader('Content-Disposition')).toBe(
        'attachment; filename=users-Engineering-export.xlsx'
      );
    });
  });

  describe('Reports Export Endpoint', () => {
    test('should export custom report with POST data', async () => {
      // Simulate: POST /api/reports/export
      const exportReportHandler = async (req: Request, res: any) => {
        try {
          const { reportData, reportName, format } = req.body;

          // Validate request
          if (!reportData || !Array.isArray(reportData)) {
            res.status(400).json({ error: 'Invalid report data' });
            return { success: false, error: 'Invalid data' };
          }

          const filename = reportName || 'custom-report';

          await pipeJsonAsExcel(res, reportData, filename);

          return { success: true, recordCount: reportData.length };
        } catch (error) {
          res.status(500).json({ error: 'Report generation failed' });
          return { success: false, error };
        }
      };

      const customReportData = [
        { metric: 'Total Sales', value: 125000, period: 'Q1 2024' },
        { metric: 'New Customers', value: 45, period: 'Q1 2024' },
        { metric: 'Retention Rate', value: 0.89, period: 'Q1 2024' }
      ];

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/reports/export',
        body: {
          reportData: customReportData,
          reportName: 'q1-sales-report',
          format: 'excel'
        }
      }) as Request;

      const res = httpMocks.createResponse();

      const result = await exportReportHandler(req, res);

      expect(result.success).toBe(true);
      expect(result.recordCount).toBe(3);
      expect(res.getHeader('Content-Disposition')).toBe(
        'attachment; filename=q1-sales-report.xlsx'
      );
    });

    test('should handle validation errors for invalid data', async () => {
      const exportReportHandler = async (req: Request, res: any) => {
        try {
          const { reportData } = req.body;

          if (!reportData || !Array.isArray(reportData)) {
            res.status(400).json({ error: 'Invalid report data' });
            return { success: false, error: 'Invalid data' };
          }

          await pipeJsonAsExcel(res, reportData, 'report');
          return { success: true };
        } catch (error) {
          res.status(500).json({ error: 'Report generation failed' });
          return { success: false, error };
        }
      };

      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/reports/export',
        body: {
          reportData: 'invalid-data', // Should be an array
          reportName: 'test-report'
        }
      }) as Request;

      const res = httpMocks.createResponse();

      const result = await exportReportHandler(req, res);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid data');
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid report data'
      });
    });
  });

  describe('Async Data Processing', () => {
    test('should handle async data fetching before export', async () => {
      // Simulate fetching data from an async source (like a database)
      const fetchUsersFromDB = async (): Promise<Data> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(usersData);
          }, 10); // Simulate async operation
        });
      };

      const exportAsyncHandler = async (req: Request, res: any) => {
        try {
          // Simulate async data fetching
          const users = await fetchUsersFromDB();

          await pipeJsonAsExcel(res, users, 'async-users-export');

          return { success: true, fetchedCount: users.length };
        } catch (error) {
          res.status(500).json({ error: 'Async export failed' });
          return { success: false, error };
        }
      };

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/users/async-export'
      }) as Request;

      const res = httpMocks.createResponse();

      const result = await exportAsyncHandler(req, res);

      expect(result.success).toBe(true);
      expect(result.fetchedCount).toBe(4);
      expect(res.getHeader('Content-Type')).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    });
  });
});
