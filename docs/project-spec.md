# Project Specification: JinaAI MCP Server

**Version:** 1.0
**Author:** @cyanheads

## 1. Project Overview

This document outlines the plan for creating the `jinaai-mcp-server`, a Model Context Protocol (MCP) server that provides intelligent tools powered by the Jina.ai Reader API. The server will be built upon the `mcp-ts-template`, adhering to its architectural principles of modularity, observability, and robust error handling.

The primary goal is to create a tool that can read and process content from any webpage using Jina's `readerlm-v2` engine, providing a clean, LLM-ready version of the content.

## 2. Core Requirements & Goals

- **Create an Intelligent Web Reader Tool:** Develop a primary tool, `jinaai_read_webpage`, that accepts a URL and returns the processed content from the Jina Reader API.
- **Secure Configuration:** The Jina API key must be managed securely via a `.env` file and not be hardcoded in the source.
- **Adherence to Standards:** The implementation must strictly follow the development mandates outlined in the `.clinerules/clinerules.md` document.
- **Robust Error Handling:** Implement comprehensive error handling to gracefully manage API failures, network issues, and invalid inputs.
- **Streaming Support:** The tool should support streaming responses from the Jina API to handle large content efficiently.

## 3. Architecture and Design

The server will follow the canonical pattern established in the `mcp-ts-template`.

### 3.1. Directory Structure

A new tool will be created at `src/mcp-server/tools/jinaReader/`, with the following structure:

- **`jinaReader/{tool_name}`**
  - `index.ts`: Barrel file to export the registration function.
  - `logic.ts`: Contains the core business logic, Zod schemas for input/output, and the API call to Jina.
  - `registration.ts`: Handles the tool's registration with the MCP server, request handling, and error catching.

### 3.2. Configuration Management

- The Jina API key will be moved to a `.env` file.
- The `src/config/index.ts` file will be updated to load `JINA_API_KEY` from the environment variables.
- The `.env.example` file will be updated to include `JINA_API_KEY=""`.

### 3.3. API Interaction

- A dedicated service or function within `logic.ts` will be responsible for making requests to the Jina API endpoint (`https://r.jina.ai/`).
- This function will construct the necessary headers as specified:
  - `Authorization: Bearer ${process.env.JINA_API_KEY}`
  - `Accept: text/event-stream`
  - `X-Engine: browser`
  - `X-Locale: en-US`
  - `X-Proxy: auto`
  - `X-Respond-With: readerlm-v2`
  - `X-With-Generated-Alt: true`

## 4. Tool Definitions

### Tool 1: `jinaai_read_webpage`

- **Description:** "Extracts and processes the main content from a given webpage using Jina AI's ReaderLM engine. It returns a clean, markdown-formatted text representation of the content, suitable for analysis or summarization. Supports streaming for large pages."
- **Input Schema (`ReadWebpageInputSchema`):**
  ```typescript
  z.object({
    url: z.string().url("A valid URL must be provided."),
    format: z
      .enum(["Default", "Markdown", "HTML", "Text", "Screenshot", "Pageshot"])
      .default("Default")
      .describe("The desired output format."),
    with_links: z
      .boolean()
      .default(false)
      .describe("Whether to include links in the output."),
    with_images: z
      .boolean()
      .default(false)
      .describe("Whether to include images in the output."),
    with_generated_alt: z
      .boolean()
      .default(true)
      .describe("Whether to generate alt text for images."),
    no_cache: z
      .boolean()
      .default(false)
      .describe("Whether to bypass the cache."),
  });
  ```
- **Output Schema (`ReadWebpageResponseSchema`):**
  ```typescript
  z.object({
    url: z.string().url(),
    content: z.string().describe("The processed content of the webpage."),
    format: z.string().describe("The format of the returned content."),
  });
  ```
- **Example Usage:**
  ```json
  {
    "tool": "jinaai_read_webpage",
    "params": {
      "url": "https://example.com"
    }
  }
  ```

## 5. Implementation Plan

1.  **Configuration:**
    - Create a `.env` file from `.env.example`.
    - Update `.env.example` with `JINA_API_KEY=""`.
    - Modify `src/config/index.ts` to load and export the `JINA_API_KEY`.

2.  **Create Tool Files:**
    - Create the directory `src/mcp-server/tools/jinaReader`.
    - Create `logic.ts`, `registration.ts`, and `index.ts` inside the new directory.

3.  **Implement Logic (`logic.ts`):**
    - Define the `ReadWebpageInputSchema` and `ReadWebpageResponseSchema` using Zod.
    - Create the `readWebpageToolLogic` async function.
    - Inside the function, use `fetch` to call the Jina API (`https://r.jina.ai/{url}`).
    - Construct all required headers, pulling the API key from the config.
    - Handle the API response, processing the stream and returning the final content.
    - Throw a structured `McpError` for any failures (e.g., non-200 status code, network error).

4.  **Implement Registration (`registration.ts`):**
    - Import the schemas and logic function from `logic.ts`.
    - Create the `registerReadWebpageTool` function.
    - Call `server.registerTool()` with the tool name, description, schemas, and a handler function.
    - The handler will create a `RequestContext`, call `readWebpageToolLogic` within a `try...catch` block, and use `ErrorHandler.handleError` to format any errors.
    - Return a `CallToolResult` with the structured content on success or a formatted error on failure.

5.  **Register Tool in Server:**
    - Import and call `registerReadWebpageTool` within `src/mcp-server/server.ts` to make the tool available when the server starts.

6.  **Update Barrel Files:**
    - Ensure the new tool is exported from `src/mcp-server/tools/index.ts` if such a file is used for central exports.

## 6. Testing Strategy

- **Integration Tests:** Create `tests/mcp-server/tools/jinaReader/integration.test.ts`.
  - Test the successful execution of the `read_webpage` tool with a real (mocked) API call to Jina.
  - Test various input parameters (`format`, `with_links`, etc.).
  - Test error handling for API failures (e.g., 401 Unauthorized, 500 Server Error).
  - Test handling of invalid inputs (e.g., malformed URL).
- **Logic Tests:** Create `tests/mcp-server/tools/jinaReader/logic.test.ts` for any complex data transformations if they arise.
- **Test Environment:** Use `msw` (Mock Service Worker) or a similar library to mock the Jina API endpoints to avoid making real network calls during tests.
