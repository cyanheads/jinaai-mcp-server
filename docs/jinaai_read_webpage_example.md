# Example: `jinaai_read_webpage`

This document provides examples of how to use the `jinaai_read_webpage` tool, including successful responses and common error scenarios.

## Basic Usage

This example demonstrates a basic call to the tool to read the content of a webpage.

**Request:**

```json
{
  "tool": "jinaai_read_webpage",
  "params": {
    "url": "https://www.jina.ai/reader"
  }
}
```

**Expected Response (Success):**

```json
{
  "structuredContent": {
    "url": "https://www.jina.ai/reader",
    "content": "Jina Reader is a tool that reads any URL and returns clean, LLM-ready text. It's powered by our readerlm-v2 engine...",
    "format": "Default"
  },
  "content": [
    {
      "type": "text",
      "text": "Success: {\n  \"url\": \"https://www.jina.ai/reader\",\n  \"content\": \"Jina Reader is a tool that reads any URL and returns clean, LLM-ready text. It's powered by our readerlm-v2 engine...\",\n  \"format\": \"Default\"\n}"
    }
  ]
}
```

## Advanced Usage with Options

This example shows how to use additional parameters to customize the output.

**Request:**

```json
{
  "tool": "jinaai_read_webpage",
  "params": {
    "url": "https://en.wikipedia.org/wiki/Large_language_model",
    "format": "Markdown",
    "with_links": true
  }
}
```

**Expected Response (Success):**

The `content` field in the response will be a detailed markdown document including links from the Wikipedia page.

## Error Handling

The following are real-world examples of errors that can occur when the Jina AI service is unavailable or network issues arise.

### Scenario 1: Service Unavailable

This error occurs when the Jina AI API service is temporarily down or unreachable.

**Response (Error):**

```json
{
  "isError": true,
  "content": [
    {
      "type": "text",
      "text": "Error: Jina API request failed with status 503: upstream connect error or disconnect/reset before headers. reset reason: connection termination"
    }
  ],
  "structuredContent": {
    "code": "INTERNAL_ERROR",
    "message": "Jina API request failed with status 503: upstream connect error or disconnect/reset before headers. reset reason: connection termination",
    "details": {
      "toolName": "jinaai_read_webpage",
      "statusCode": 503
    }
  }
}
```

### Scenario 2: Request Timeout

This error occurs if the request to the Jina AI service takes too long to complete.

**Response (Error):**

```json
{
  "isError": true,
  "content": [
    {
      "type": "text",
      "text": "Error: MCP error -32001: Request timed out"
    }
  ],
  "structuredContent": {
    "code": -32001,
    "message": "MCP error -32001: Request timed out",
    "data": {
      "timeout": 60000
    }
  }
}
```
