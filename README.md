<div align="center">

# JinaAI MCP Server

**An intelligent web reader tool powered by the Jina.ai Reader API, delivered as a production-grade Model Context Protocol (MCP) server.**

[![TypeScript](https://img.shields.io/badge/TypeScript-^5.8.3-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP%20SDK-^1.17.1-green.svg?style=flat-square)](https://modelcontextprotocol.io/)
[![Version](https://img.shields.io/badge/Version-1.0.1-blue.svg?style=flat-square)](./CHANGELOG.md)
[![Coverage](https://img.shields.io/badge/Coverage-60.39%25-yellow?style=flat-square)](./vitest.config.ts)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](https://opensource.org/licenses/Apache-2.0)
[![Status](https://img.shields.io/badge/Status-Stable-green.svg?style=flat-square)](https://github.com/cyanheads/jinaai-mcp-server/issues)
[![GitHub](https://img.shields.io/github/stars/cyanheads/jinaai-mcp-server?style=social)](https://github.com/cyanheads/jinaai-mcp-server)

</div>

Model Context Protocol (MCP) Server providing a robust, developer-friendly interface to the [Jina.ai Reader API](https://jina.ai/reader). Enables LLMs and AI agents to read, process, and understand content from any webpage programmatically.

Built on the [`cyanheads/mcp-ts-template`](https://github.com/cyanheads/mcp-ts-template), this server follows a modular architecture with robust error handling, logging, and security features.

## 🚀 Core Capabilities: Jina AI Tools 🛠️

This server equips your AI with a specialized tool to interact with web content:

| Tool Name                                                   | Description                                                                                                                                                          | Example                                               |
| :---------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------- |
| [`jinaai_read_webpage`](./src/mcp-server/tools/jinaReader/) | Extracts and processes the main content from a given URL using Jina AI's ReaderLM engine. It returns a clean, markdown-formatted text representation of the content. | [View Example](./docs/jinaai_read_webpage_example.md) |

---

## Table of Contents

| [Overview](#overview)           | [Features](#features)                   | [Installation](#installation)                  |
| :------------------------------ | :-------------------------------------- | :--------------------------------------------- |
| [Configuration](#configuration) | [Project Structure](#project-structure) | [Development & Testing](#development--testing) |
| [License](#license)             |                                         |                                                |

## Overview

The JinaAI MCP Server acts as a bridge, allowing applications that understand the Model Context Protocol (MCP)—like advanced AI assistants, IDE extensions, or custom research tools—to interact directly and efficiently with web content.

Instead of dealing with raw HTML or complex scraping logic, your agents can leverage this server to:

- **Automate Information Gathering**: Read articles, documentation, and other web content programmatically.
- **Gain Deeper Understanding**: Access clean, LLM-ready text from any URL without leaving the host application.
- **Integrate Web Content into AI Workflows**: Enable LLMs to perform research, summarize articles, and incorporate real-time web data into their responses.

> **Developer Note**: This repository includes a [.clinerules](./.clinerules/clinerules.md) file that serves as a developer cheat sheet for your LLM coding agent with quick reference for the codebase patterns, file locations, and code snippets.

## Features

### Core Utilities

Leverages the robust utilities provided by the `mcp-ts-template`:

- **Logging**: Structured, configurable logging with sensitive data redaction.
- **Error Handling**: Centralized error processing and standardized error types (`McpError`).
- **Configuration**: Environment variable loading (`dotenv`) with validation using Zod.
- **Input Validation**: Uses `zod` for all tool input schemas.
- **Request Context**: End-to-end operation tracking via unique request IDs.
- **Type Safety**: Enforced by TypeScript and Zod schemas.
- **HTTP Transport**: High-performance HTTP server using **Hono**, featuring session management and authentication support.
- **Authentication**: Robust authentication layer supporting JWT and OAuth 2.1.
- **Observability**: Integrated **OpenTelemetry** for distributed tracing and metrics.

### Jina AI Integration

- **Intelligent Content Extraction**: Utilizes Jina's `readerlm-v2` engine to parse main content and remove boilerplate.
- **Multiple Formats**: Supports output in Markdown, HTML, or plain text.
- **Flexible Options**: Control over including links, images, and using the cache.

## Installation

### Prerequisites

- [Node.js (>=18.0.0)](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### MCP Client Settings

Add the following to your MCP client's configuration file (e.g., `cline_mcp_settings.json`).
This configuration uses `npx` to run the server, which will automatically install the package if not already present.
The `JINA_API_KEY` is required for the server to function.

```json
{
  "mcpServers": {
    "jinaai-mcp-server": {
      "command": "npx",
      "args": ["@cyanheads/jinaai-mcp-server"],
      "env": {
        "MCP_TRANSPORT_TYPE": "http",
        "MCP_HTTP_PORT": "3010",
        "JINA_API_KEY": "YOUR_JINA_API_KEY_HERE"
      }
    }
  }
}
```

### From Source

1.  Clone the repository:
    ```bash
    git clone https://github.com/cyanheads/jinaai-mcp-server.git
    cd jinaai-mcp-server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Build the project:
    ```bash
    npm run build
    ```

## Configuration

### Environment Variables

Configure the server using environment variables. For local development, create a `.env` file at the project root.

| Variable             | Description                                              | Default       |
| :------------------- | :------------------------------------------------------- | :------------ |
| `JINA_API_KEY`       | **Required.** Your API key for the Jina AI service.      | (none)        |
| `MCP_TRANSPORT_TYPE` | Transport mechanism: `stdio` or `http`.                  | `stdio`       |
| `MCP_HTTP_PORT`      | Port for the HTTP server (if `MCP_TRANSPORT_TYPE=http`). | `3010`        |
| `LOGS_DIR`           | Directory for log file storage.                          | `logs/`       |
| `NODE_ENV`           | Runtime environment (`development`, `production`).       | `development` |

## Project Structure

The codebase follows a modular structure within the `src/` directory:

```
src/
├── index.ts              # Entry point: Initializes and starts the server
├── config/               # Configuration loading (env vars)
│   └── index.ts
├── mcp-server/           # Core MCP server logic and capability registration
│   ├── server.ts         # Server setup, tool registration
│   └── tools/            # MCP Tool implementations
│       └── jinaReader/   # The Jina AI Reader tool
└── utils/                # Common utility functions (logger, error handler, etc.)
```

For a detailed file tree, run `npm run tree` or see [docs/tree.md](docs/tree.md).

## Development & Testing

### Development Scripts

```bash
# Build the project (compile TS to JS in dist/)
npm run build

# Clean build artifacts and then rebuild the project
npm run rebuild

# Format code with Prettier
npm run format
```

### Testing

This project uses [Vitest](https://vitest.dev/) for unit and integration testing.

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests and generate a coverage report
npm run test:coverage
```

### Running the Server

```bash
# Start the server using stdio (default)
npm run start:server

# Start the server using HTTP transport
npm run start:server:http
```

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Built with the <a href="https://modelcontextprotocol.io/">Model Context Protocol</a>
</div>
