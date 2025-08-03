/**
 * @fileoverview Handles registration and error handling for the `jinaai_read_webpage` tool.
 * @module src/mcp-server/tools/jinaReader/registration
 * @see {@link src/mcp-server/tools/jinaReader/logic.ts} for the core business logic and schemas.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BaseErrorCode, McpError } from "../../../types-global/errors.js";
import {
  ErrorHandler,
  logger,
  measureToolExecution,
  requestContextService,
} from "../../../utils/index.js";
import {
  ReadWebpageInput,
  ReadWebpageInputSchema,
  ReadWebpageResponseSchema,
  readWebpageToolLogic,
} from "./logic.js";

const TOOL_NAME = "jinaai_read_webpage";
const TOOL_DESCRIPTION =
  "Extracts and processes the main content from a given URL using Jina AI's ReaderLM engine for text extraction. It returns a clean, markdown-formatted text representation of the content, suitable for further analysis or summarization. You can use this tool to fetch content from a URL.";

export const registerJinaReaderTool = async (
  server: McpServer,
): Promise<void> => {
  const registrationContext = requestContextService.createRequestContext({
    operation: "RegisterTool",
    toolName: TOOL_NAME,
  });

  logger.info(`Registering tool: '${TOOL_NAME}'`, registrationContext);

  await ErrorHandler.tryCatch(
    async () => {
      server.registerTool(
        TOOL_NAME,
        {
          title: "Read Webpage",
          description: TOOL_DESCRIPTION,
          inputSchema: ReadWebpageInputSchema.shape,
          outputSchema: ReadWebpageResponseSchema.shape,
          annotations: {
            readOnlyHint: true,
            openWorldHint: true,
          },
        },
        async (
          params: ReadWebpageInput,
          callContext: Record<string, unknown>,
        ) => {
          const sessionId =
            typeof callContext?.sessionId === "string"
              ? callContext.sessionId
              : undefined;

          const handlerContext = requestContextService.createRequestContext({
            parentContext: callContext,
            operation: "HandleToolRequest",
            toolName: TOOL_NAME,
            sessionId,
            input: params,
          });

          try {
            const result = await measureToolExecution(
              () => readWebpageToolLogic(params, handlerContext),
              { ...handlerContext, toolName: TOOL_NAME },
              params,
            );

            return {
              structuredContent: result,
              content: [
                {
                  type: "text",
                  text: `Success: ${JSON.stringify(result, null, 2)}`,
                },
              ],
            };
          } catch (error) {
            const mcpError = ErrorHandler.handleError(error, {
              operation: `tool:${TOOL_NAME}`,
              context: handlerContext,
              input: params,
            }) as McpError;

            return {
              isError: true,
              content: [{ type: "text", text: `Error: ${mcpError.message}` }],
              structuredContent: {
                code: mcpError.code,
                message: mcpError.message,
                details: mcpError.details,
              },
            };
          }
        },
      );

      logger.info(
        `Tool '${TOOL_NAME}' registered successfully.`,
        registrationContext,
      );
    },
    {
      operation: `RegisteringTool_${TOOL_NAME}`,
      context: registrationContext,
      errorCode: BaseErrorCode.INITIALIZATION_FAILED,
      critical: true,
    },
  );
};
