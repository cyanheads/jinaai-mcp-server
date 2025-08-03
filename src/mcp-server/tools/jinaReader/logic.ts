/**
 * @fileoverview Defines the core logic, schemas, and types for the `jinaai_read_webpage` tool.
 * @module src/mcp-server/tools/jinaReader/logic
 * @see {@link src/mcp-server/tools/jinaReader/registration.ts} for the handler and registration logic.
 */

import { z } from "zod";
import { config } from "../../../config/index.js";
import { BaseErrorCode, McpError } from "../../../types-global/errors.js";
import { logger, type RequestContext } from "../../../utils/index.js";

export const ReadWebpageInputSchema = z.object({
  url: z
    .string()
    .url({ message: "A valid URL must be provided." })
    .describe("The fully-qualified URL of the webpage to read."),
  format: z
    .enum(["Default", "Markdown", "HTML", "Text"])
    .default("Default")
    .describe(
      "The desired text-based output format. 'Default' provides the best available text representation.",
    ),
  with_links: z
    .boolean()
    .default(true)
    .describe(
      "If true, includes hyperlinks in the extracted content. (Default: true)",
    ),
  with_images: z
    .boolean()
    .default(false)
    .describe(
      "If true, includes images in the extracted content. (Default: false)",
    ),
  with_generated_alt: z
    .boolean()
    .default(true)
    .describe(
      "If true, generates descriptive alt text for images. (Default: true)",
    ),
  no_cache: z
    .boolean()
    .default(true)
    .describe(
      "If true, bypasses any cached version of the page and fetches a fresh copy. (Default: true)",
    ),
});

export const ReadWebpageResponseSchema = z.object({
  url: z.string().url(),
  content: z.string().describe("The processed content of the webpage."),
  format: z.string().describe("The format of the returned content."),
});

export type ReadWebpageInput = z.infer<typeof ReadWebpageInputSchema>;
export type ReadWebpageResponse = z.infer<typeof ReadWebpageResponseSchema>;

export async function readWebpageToolLogic(
  params: ReadWebpageInput,
  context: RequestContext,
): Promise<ReadWebpageResponse> {
  logger.debug("Processing read webpage logic.", {
    ...context,
    toolInput: params,
  });

  if (!config.jinaApiKey) {
    throw new McpError(
      BaseErrorCode.CONFIGURATION_ERROR,
      "Jina API key is not configured.",
      { toolName: "jinaai_read_webpage" },
    );
  }

  const headers = {
    Authorization: `Bearer ${config.jinaApiKey}`,
    Accept: "text/event-stream",
    // X-Engine Options:
    // Default: None
    // Best Quality: "browser"
    // Speed: "direct"
    // Experimental: "cf-browser-rendering"
    "X-Engine": "browser",
    "X-Locale": "en-US",
    "X-Proxy": "auto",
    "X-Respond-With": "readerlm-v2",
    "X-With-Generated-Alt": params.with_generated_alt.toString(),
  };

  const response = await fetch(`https://r.jina.ai/${params.url}`, { headers });

  if (!response.ok) {
    const errorText = await response.text();
    throw new McpError(
      BaseErrorCode.INTERNAL_ERROR,
      `Jina API request failed with status ${response.status}: ${errorText}`,
      {
        toolName: "jinaai_read_webpage",
        statusCode: response.status,
      },
    );
  }

  const content = await response.text();

  const result: ReadWebpageResponse = {
    url: params.url,
    content,
    format: params.format,
  };

  logger.debug("Read webpage processed successfully.", {
    ...context,
    responseSummary: {
      contentLength: result.content.length,
    },
  });

  return result;
}
