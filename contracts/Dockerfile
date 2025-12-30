FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Compile contracts
RUN pnpm exec hardhat compile

# Expose Hardhat node port
EXPOSE 8545

# Keep container running (node started manually via make node)
CMD ["tail", "-f", "/dev/null"]

