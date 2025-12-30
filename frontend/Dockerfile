FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Expose Next.js dev server port
EXPOSE 3000

# Set environment variable for development
ENV NODE_ENV=development

# Run Next.js dev server with proper host binding
CMD ["pnpm", "dev", "--hostname", "0.0.0.0"]

