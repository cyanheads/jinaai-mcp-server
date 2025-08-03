# ---- Build Stage ----
# Use a Long-Term Support (LTS) version of Node.js for stability.
# 'alpine' provides a smaller base image.
FROM node:22-alpine AS build

# Set the working directory inside the container.
WORKDIR /usr/src/app

# Copy package.json and lockfile to leverage Docker layer caching.
COPY package.json package-lock.json* ./

# Install all dependencies, including devDependencies needed for the build.
RUN npm ci

# Copy the rest of the application source code.
COPY . .

# Run the build script to compile TypeScript to JavaScript.
RUN npm run build

# ---- Production Stage ----
# Start from a fresh, minimal Node.js image.
FROM node:22-alpine AS production

WORKDIR /usr/src/app

# Set the environment to development.
ENV NODE_ENV=development

# Create a non-root user and group for better security.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create and set permissions for the log directory.
RUN mkdir -p /var/log/jinaaimcp-server && chown -R appuser:appgroup /var/log/jinaaimcp-server

# Copy only the necessary production artifacts from the build stage.
# This includes the pruned production node_modules and the compiled 'dist' folder.
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./

# Switch to the non-root user.
USER appuser

# The server will listen on the port provided by the MCP_HTTP_PORT environment variable.
# Smithery provides this automatically. We expose it for documentation.
EXPOSE 3018

# Set port for Smithery
ENV PORT=3018

# Set environment variables for the MCP server.
ENV MCP_HTTP_PORT=3018
ENV MCP_HTTP_HOST=0.0.0.0
ENV MCP_TRANSPORT_TYPE=http
ENV MCP_SESSION_MODE=stateless
ENV MCP_LOG_LEVEL=info
ENV LOGS_DIR=/var/log/jinaaimcp-server
ENV MCP_AUTH_MODE=none
ENV MCP_FORCE_CONSOLE_LOGGING=true

# The command to start the server.
CMD ["node", "dist/index.js"]
