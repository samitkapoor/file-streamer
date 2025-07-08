# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2024-12-26

### Added

- Frontend usage example showing how to handle streaming responses with axios
- Client-side blob download implementation for file downloads

### Fixed

- Corrected import statement in README examples from 'res-pipe' to 'file-streamer'

### Changed

- Reorganized Usage section into Backend and Frontend subsections for better clarity

## [1.0.1] - 2024-12-26

### Added

- Comprehensive README.md with package description, features, and usage examples
- Documentation for all available functions (`pipeJsonAsExcel`, `pipeJsonAsCsv`, `pipeJsonAsJson`)
- Installation and usage instructions
- Contributing guidelines
- Feature comparison table

## [1.0.0] - 2024-12-26

### Added

- Initial release of file-streamer package
- Core streaming functionality for HTTP responses
- Support for Excel (xlsx), CSV, and JSON file formats
- TypeScript support with full type definitions
- Express.js integration
- Basic package structure and build configuration
