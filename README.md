# file-streamer

A developer-friendly NPM package for streaming files directly over HTTP, reducing server load and optimizing performance for large data transfers.

## Description

`file-streamer` is a TypeScript package that enables efficient, real-time streaming of files directly to HTTP responses. By sending data as a stream instead of a single payload, it helps developers handle large data exports with minimal memory usage and improved server reliability. With a simple, one-line integration, it abstracts away the streaming logic, making large file delivery seamless and greatly enhancing developer experience.

## Key Features

- **Streaming Data:** Efficiently stream data to HTTP responses, reducing memory usage.
- **Multiple File Types:** Supports Excel (xlsx), CSV, JSON, file, base64 formats currently.
- **Express.js Integration:** Designed to work seamlessly with Express.js.
- **TypeScript Support:** Fully written in TypeScript for type safety and improved developer experience.

## Installation

Install the package using npm:

```bash
npm install file-streamer
```

## Usage

## Backend

Here's a basic example of how to use `file-streamer` with Express.js:

```typescript
import { pipeJsonAsExcel } from 'file-streamer';

// Dummy data for Excel export
const dummyData = [
  {
    'Employee ID': 'EMP001',
    'First Name': 'John',
    'Last Name': 'Doe',
    Email: 'john.doe@company.com',
    Department: 'Engineering',
    Salary: 75000,
    'Hire Date': '2023-01-15',
    Status: 'Active'
  },
  {
    'Employee ID': 'EMP002',
    'First Name': 'Jane',
    'Last Name': 'Smith',
    Email: 'jane.smith@company.com',
    Department: 'Marketing',
    Salary: 65000,
    'Hire Date': '2023-03-20',
    Status: 'Active'
  }
];

export const downloadRoute = async (req, res) => {
  try {
    // Get optional filename from query parameters
    const fileName = req.query.filename || 'employee_data';

    // Use the file-streamer package to convert JSON to Excel and pipe it as response
    await pipeJsonAsExcel(res, dummyData, fileName); // Just one line and you're all set!
  } catch (error) {
    console.error('Error generating Excel file:', error);
    res.status(500).json({
      error: 'Failed to generate Excel file',
      message: error.message
    });
  }
};
```

## Frontend

You're probably going to use this for downloading a file onto user's machine, here's the code to handle the streaming response!

```typescript
<button
  onClick={async () => {
    const response = await axios.get('http://localhost:3000/api/download/csv', {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `file.csv`;
    a.click();
  }}
>
  Download JSON AS CSV
</button>
```

## Features

| Function           | Parameters                                                                                 | Description                                                           |
| ------------------ | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `pipeJsonAsExcel`  | `res: express.Response`, `jsonData: any`, `filename?: string`                              | Pipes JSON data to an Excel file and streams it as an HTTP response.  |
| `pipeJsonAsCsv`    | `res: express.Response`, `jsonData: any`, `filename?: string`                              | Pipes JSON data to a CSV string and streams it as an HTTP response.   |
| `pipeJsonAsJson`   | `res: express.Response`, `jsonData: any`, `filename?: string`                              | Pipes JSON data to a JSON string and streams it as an HTTP response.  |
| `pipeBase64`       | `res: express.Response`, `base64Data: string`, `contentType?: string`, `filename?: string` | Pipes base64 data to a file and streams it as an HTTP response.       |
| `pipeFileFromPath` | `res: express.Response`, `filePath: string`, `fileName?: string`, `contentType?: string`   | Pipes a file from the file system and streams it as an HTTP response. |

## Contributing

Contributions are welcome! Please follow these steps:

1.  Raise an issue/feature request and get assigned to it.
1.  Fork the repository.
1.  Create a new branch for your feature or bug fix.
1.  Make your changes and ensure they are well-tested.
1.  Submit a pull request with a clear description of your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
