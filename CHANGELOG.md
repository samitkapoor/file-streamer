# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-07-10

### Added

- New `pipeFileFromPath` function for streaming files directly from the file system
- Automatic MIME type detection based on file extensions
- MIME type utilities (`getContentTypeFromExtension` and `getFileExtensionFromMimeType`)
- Enhanced ContentType definitions with support for more file formats
- Proper error handling for file system operations
- Content-Length header support for better client experience

### Changed

- Enhanced base64 streaming with improved MIME type handling using new utility functions
- Updated package description to include file system streaming capabilities
- Added new keywords for better package discoverability (file-system, path-streaming, mime-types, static-files)

### Enhanced

- Better file extension and MIME type mapping for various file formats
- Improved error handling across all streaming functions

## [1.1.2] - 2025-07-10

### Changed

- Updated README to include Base64 file streaming support

## [1.1.1] - 2025-07-10

### Changed

- Updated package description to include Base64 file streaming support
- Updated package keywords to include Base64 file streaming

## [1.1.0] - 2025-07-10

### Added

- New `pipeBase64` function for streaming base64 data as files
- Support for multiple file types including images (PNG, JPEG, GIF, WebP, SVG), documents (PDF, DOC, DOCX, XLS, XLSX), media files (MP4, WebM, MP3, WAV, OGG), and more
- `Base64Data` type for base64 string data
- `ContentType` type with comprehensive MIME type support
- Automatic file extension detection based on MIME type
- Smart filename handling with extension auto-append

### Changed

- Enhanced error handling in JSON functions with proper TypeScript error typing
- Updated function exports to include new base64 module

## [1.0.3] - 2025-07-09

### Changed

- Enhanced package discoverability by adding more relevant keywords (buffer, xlsx, spreadsheet, download, streaming, file-download, data-streaming, response-streaming, file-generation)

## [1.0.2] - 2025-07-09

### Added

- Frontend usage example showing how to handle streaming responses with axios
- Client-side blob download implementation for file downloads

### Fixed

- Corrected import statement in README examples from 'res-pipe' to 'file-streamer'

### Changed

- Reorganized Usage section into Backend and Frontend subsections for better clarity

## [1.0.1] - 2025-07-09

### Added

- Comprehensive README.md with package description, features, and usage examples
- Documentation for all available functions (`pipeJsonAsExcel`, `pipeJsonAsCsv`, `pipeJsonAsJson`)
- Installation and usage instructions
- Contributing guidelines
- Feature comparison table

## [1.0.0] - 2025-07-09

### Added

- Initial release of file-streamer package
- Core streaming functionality for HTTP responses
- Support for Excel (xlsx), CSV, and JSON file formats
- TypeScript support with full type definitions
- Express.js integration
- Basic package structure and build configuration
