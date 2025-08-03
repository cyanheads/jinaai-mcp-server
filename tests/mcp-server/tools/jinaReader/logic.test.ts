/**
 * @fileoverview Tests for the Jina Reader tool's core logic.
 * @module tests/mcp-server/tools/jinaReader/logic.test
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  readWebpageToolLogic,
  ReadWebpageInputSchema,
} from "../../../../src/mcp-server/tools/jinaReader/logic.js";
import { config } from "../../../../src/config/index.js";
import {
  McpError,
  BaseErrorCode,
} from "../../../../src/types-global/errors.js";
import { requestContextService } from "../../../../src/utils/index.js";
import { generateMock } from "@anatine/zod-mock";

// Mock the global fetch
global.fetch = vi.fn();

describe("Jina Reader Tool Logic", () => {
  const mockContext = requestContextService.createRequestContext({
    operation: "test-jina-reader",
  });

  beforeEach(() => {
    vi.resetAllMocks();
    config.jinaApiKey = "test-api-key";
  });

  afterEach(() => {
    config.jinaApiKey = undefined;
  });

  it("should successfully fetch and return content for a valid URL", async () => {
    const mockInput = generateMock(ReadWebpageInputSchema);
    const mockResponseText = "This is the fetched content.";

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => mockResponseText,
    } as Response);

    const result = await readWebpageToolLogic(mockInput, mockContext);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `https://r.jina.ai/${mockInput.url}`,
      expect.any(Object),
    );
    expect(result).toEqual({
      url: mockInput.url,
      content: mockResponseText,
      format: mockInput.format,
    });
  });

  it("should throw a configuration error if Jina API key is not set", async () => {
    config.jinaApiKey = undefined;
    const mockInput = generateMock(ReadWebpageInputSchema);

    await expect(readWebpageToolLogic(mockInput, mockContext)).rejects.toThrow(
      new McpError(
        BaseErrorCode.CONFIGURATION_ERROR,
        "Jina API key is not configured.",
        { toolName: "jinaai_read_webpage" },
      ),
    );
  });

  it("should throw an internal error if the Jina API request fails", async () => {
    const mockInput = generateMock(ReadWebpageInputSchema);
    const errorText = "API error";

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => errorText,
    } as Response);

    await expect(readWebpageToolLogic(mockInput, mockContext)).rejects.toThrow(
      new McpError(
        BaseErrorCode.INTERNAL_ERROR,
        `Jina API request failed with status 500: ${errorText}`,
        {
          toolName: "jinaai_read_webpage",
          statusCode: 500,
        },
      ),
    );
  });

  it("should construct the correct headers for the API request", async () => {
    const mockInput = {
      ...generateMock(ReadWebpageInputSchema),
      with_generated_alt: false,
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => "Success",
    } as Response);

    await readWebpageToolLogic(mockInput, mockContext);

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          Authorization: `Bearer ${config.jinaApiKey}`,
          Accept: "text/event-stream",
          "X-Engine": "browser",
          "X-Locale": "en-US",
          "X-Proxy": "auto",
          "X-Respond-With": "readerlm-v2",
          "X-With-Generated-Alt": "false",
        },
      }),
    );
  });
});
