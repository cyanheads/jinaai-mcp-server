# Changelog

All notable changes to this project will be documented in this file.

## [1.0.4] - 2025-08-03

### Changed

- **Docker & Logging**: Enhanced Docker support by adding `MCP_HTTP_HOST` to bind the server to a specific host and `MCP_FORCE_CONSOLE_LOGGING` to ensure logs are always sent to the console in containerized environments.
- **Configuration**: Updated `smithery.yaml` and `Dockerfile` to include the new environment variables.
- **Dependencies**: Bumped the package version to `1.0.4` in `package.json` and `package-lock.json`.

## [1.0.3] - 2025-08-03

### Changed

- **Build**: Refactored the `Dockerfile` to use a more efficient and secure multi-stage build process. This results in a smaller, more secure production image.
- **Configuration**: Updated `smithery.yaml` to latest schema to support a container-based runtime, including a more detailed configuration schema for improved clarity and validation.
- **Dependencies**: Bumped the package version to `1.0.3` in `package.json` and `package-lock.json`.

## [1.0.2] - 2025-08-03

### Changed

- **Refactor**: Removed unused services (`duck-db`, `openRouterProvider`, `supabase`) to streamline the codebase.
- **Configuration**: Updated `package.json` to reflect the new package name `@cyanheads/jinaai-mcp-server`, updated the version to `1.0.2`, and changed the default HTTP port to `3018` across the codebase.
- **Build**: Added `mcp.json` for easier server configuration and execution.

## [1.0.1] - 2025-08-03

### Changed

- **Tests**: Refactored the test suite to focus exclusively on the `jinaai_read_webpage` tool, removing all legacy tests and adding comprehensive integration tests for the new tool.
- **Dependencies**: Updated `package.json` and `package-lock.json` with the new version `1.0.1`.
- **Bug Fix**: Corrected a minor typo in the `jinaReader` logic.
- **Refactor**: Improved the `errorHandler` to provide more structured and readable logs.

## [1.0.0] - 2025-08-03

### BREAKING CHANGE

- **Project Renaming**: The project has been renamed from `mcp-ts-template` to `jinaai-mcp-server` to reflect its new dedicated purpose.
- **Tool Refactoring**: All previous example tools (`echoTool`, `catFactFetcher`, `imageTest`) and resources (`echoResource`) have been removed. They are replaced by the new `jinaai_read_webpage` tool, which is now the core functionality of this server.

### Added

- **Jina AI Reader Tool**: Introduced the `jinaai_read_webpage` tool (`src/mcp-server/tools/jinaReader/`), which uses the Jina AI Reader API to extract clean, LLM-ready content from any URL.
- **Jina AI Configuration**: Added `JINA_API_KEY` to the configuration (`src/config/index.ts` and `.env.example`) to manage the API key for the Jina service.
- **Project Documentation**: Added new documentation specific to the Jina AI tool, including an OpenAPI specification for the Jina Reader API (`docs/jina-reader-openapi.json`), a project specification (`docs/project-spec.md`), and an example usage file (`docs/jinaai_read_webpage_example.md`).

### Changed

- **Architectural Standard**: Updated `.clinerules/clinerules.md` to reflect the project's new focus on the Jina AI tool, making it the canonical example for the architecture.
- **Dependencies**: Updated `package.json` with the new project name, description, and keywords.
- **Server Registration**: Modified `src/mcp-server/server.ts` to remove registrations for the old tools and add the registration for the new `jinaai_read_webpage` tool.
- **Documentation**: Updated `README.md` and `docs/tree.md` to align with the new project name, purpose, and file structure.

### Removed

- **Legacy Tools & Resources**: Deleted all files related to `echoTool`, `catFactFetcher`, `imageTest`, and `echoResource`.
- **Legacy Documentation**: Removed outdated API reference documents (`docs/api-references/`).
- **Legacy Tests**: Removed tests associated with the deleted tools.
