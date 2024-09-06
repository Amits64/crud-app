# Stage 1: Build Stage
FROM node:18.19.1 AS build

# Set environment variables for New Relic
ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
ENV NEW_RELIC_LOG=stdout

# Create a directory for your app and set it as the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install app dependencies using npm install
RUN npm install --only=production

# Copy the rest of the application code
COPY . .

# Run build script (if applicable)
# RUN npm run build

# Stage 2: Production Stage
FROM node:18.19.1

# Create a non-root user and group for running the application
RUN groupadd -g 1001 nonroot && useradd -u 1001 -g nonroot -m nonroot

# Create a directory for your app and set it as the working directory
WORKDIR /usr/src/app

# Set environment variables for New Relic
ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
ENV NEW_RELIC_LOG=stdout

# Copy only the necessary files from the build stage
COPY --from=build /usr/src/app /usr/src/app

# Expose the port your app will run on
EXPOSE 3000

# Switch to the non-root user for running the application
USER nonroot

# Add a health check to ensure the container is running properly
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl --fail http://localhost:3000/ || exit 1

# Define the command to run your Node.js application
CMD ["node", "index.js"]
