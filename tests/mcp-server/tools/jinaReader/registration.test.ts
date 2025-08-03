/**
 * @fileoverview Tests for the Jina Reader tool registration and handler.
 * @module tests/mcp-server/tools/jinaReader/registration.test
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import * as logic from "../../../../src/mcp-server/tools/jinaReader/logic.js";
import { registerJinaReaderTool } from "../../../../src/mcp-server/tools/jinaReader/registration.js";
import {
  BaseErrorCode,
  McpError,
} from "../../../../src/types-global/errors.js";
import { logger } from "../../../../src/utils/internal/logger.js";

vi.mock("../../../../src/utils/internal/logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("Jina Reader Tool Registration", () => {
  let server: McpServer;
  let mockLogic: MockInstance<typeof logic.readWebpageToolLogic>;

  beforeEach(() => {
    server = new McpServer({ name: "test-server", version: "1.0.0" });
    vi.spyOn(server, "registerTool");
    mockLogic = vi
      .spyOn(logic, "readWebpageToolLogic")
      .mockResolvedValue({ url: "", content: "mock content", format: "text" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should register the tool with the correct metadata", async () => {
    await registerJinaReaderTool(server);
    expect(server.registerTool).toHaveBeenCalledOnce();
    const [name, metadata] = vi.mocked(server.registerTool).mock.calls[0];
    expect(name).toBe("jinaai_read_webpage");
    expect(metadata.description).toBeDefined();
    expect(metadata.inputSchema).toBeDefined();
    expect(metadata.outputSchema).toBeDefined();
  });

  it("should call the logic function with correct parameters on tool invocation", async () => {
    await registerJinaReaderTool(server);
    const handler = vi.mocked(server.registerTool).mock.calls[0][2];
    const params = { url: "https://example.com" };
    await handler(params, {
      signal: new AbortController().signal,
      requestId: "test-request-id",
      sendNotification: vi.fn(),
      sendRequest: vi.fn(),
    });
    expect(mockLogic).toHaveBeenCalledWith(params, expect.any(Object));
  });

  it("should return a successful CallToolResult on logic success", async () => {
    await registerJinaReaderTool(server);
    const handler = vi.mocked(server.registerTool).mock.calls[0][2];
    const params = { url: "https://example.com" };
    const result = await handler(params, {
      signal: new AbortController().signal,
      requestId: "test-request-id",
      sendNotification: vi.fn(),
      sendRequest: vi.fn(),
    });
    expect(result.isError).toBeUndefined();
    expect(result.structuredContent).toBeDefined();
    expect(result.content[0].text).toContain("Success");
  });

  it("should return an error CallToolResult on logic failure", async () => {
    const testError = new McpError(BaseErrorCode.INTERNAL_ERROR, "Test error");
    mockLogic.mockRejectedValue(testError);

    await registerJinaReaderTool(server);
    const handler = vi.mocked(server.registerTool).mock.calls[0][2];
    const params = { url: "https://example.com" };
    const result = await handler(params, {
      signal: new AbortController().signal,
      requestId: "test-request-id",
      sendNotification: vi.fn(),
      sendRequest: vi.fn(),
    });

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Test error"),
      expect.any(Object),
    );
    expect(result.isError).toBe(true);
    expect(result.structuredContent?.code).toBe(testError.code);
    expect(result.content[0].text).toContain(testError.message);
  });

  it("should handle errors during registration gracefully", async () => {
    const registrationError = new Error("Failed to register");
    vi.mocked(server.registerTool).mockImplementationOnce(() => {
      throw registrationError;
    });

    await expect(registerJinaReaderTool(server)).rejects.toSatisfy((error) => {
      expect(error).toBeInstanceOf(McpError);
      expect(error.message).toContain(
        "Error in RegisteringTool_jinaai_read_webpage: Failed to register",
      );
      expect(error.code).toBe(BaseErrorCode.INITIALIZATION_FAILED);
      return true;
    });

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Failed to register"),
      expect.objectContaining({
        operation: "RegisteringTool_jinaai_read_webpage",
        critical: true,
        errorCode: BaseErrorCode.INITIALIZATION_FAILED,
      }),
    );
  });
});
