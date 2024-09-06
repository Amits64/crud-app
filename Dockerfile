# Stage 1: Build Stage
FROM node:18.19.1-bookworm-slim AS build

# Create a directory for your app and set it as the working directory
WORKDIR /usr/src/app

# Copy specific files and directories required for the image to run
COPY package.json .
COPY package-lock.json .

# Install app dependencies and update npm
RUN npm install -g npm@10.8.2
RUN npm install

# Copy the rest of the application code including views directory
COPY . .

# Stage 2: Production Stage
FROM node:18.19.1-bookworm-slim

# Create a non-root user and group for running the application
RUN groupadd -g 1001 nonroot && useradd -u 1001 -g nonroot -m nonroot

# Create a directory for your app and set it as the working directory
WORKDIR /usr/src/app

ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
ENV NEW_RELIC_LOG=stdout

# Copy only the necessary files from the build stage
COPY --from=build /usr/src/app /usr/src/app

# Expose the port your app will run on
EXPOSE 3000

# Switch to the non-root user for running the application
USER nonroot

# Define the command to run your Node.js application
CMD ["node", "index.js"]
