.PHONY: help up down build logs logs-hardhat logs-frontend \
        node stop-node compile test clean deploy-local deploy-sepolia verify \
        deploy-mock mint approve lock withdraw demo shell-hardhat shell-frontend

# ============ Docker Commands ============

help:
	@echo "Vaultio Docker Commands"
	@echo "======================="
	@echo ""
	@echo "Docker Management:"
	@echo "  make up              - Start all containers"
	@echo "  make up-build        - Start all containers with rebuild"
	@echo "  make down            - Stop all containers"
	@echo "  make build           - Build Docker images"
	@echo "  make logs            - Show logs from all services"
	@echo "  make logs-hardhat    - Show logs from hardhat container"
	@echo "  make logs-frontend   - Show logs from frontend container"
	@echo "  make shell-hardhat   - Open shell in hardhat container"
	@echo "  make shell-frontend  - Open shell in frontend container"
	@echo ""
	@echo "Hardhat Node:"
	@echo "  make node            - Start Hardhat node inside container"
	@echo "  make stop-node       - Stop Hardhat node"
	@echo ""
	@echo "Hardhat Commands (run inside Docker):"
	@echo "  make compile         - Compile contracts"
	@echo "  make test            - Run contract tests"
	@echo "  make clean           - Clean build artifacts"
	@echo "  make deploy-local    - Deploy Vaultio to local network"
	@echo ""
	@echo "Demo Scripts (run inside Docker):"
	@echo "  make deploy-mock     - Deploy MockERC20 token"
	@echo "  make mint            - Mint tokens to an address"
	@echo "  make approve         - Approve Vaultio to spend tokens"
	@echo "  make lock            - Lock tokens in Vaultio"
	@echo "  make withdraw        - Withdraw tokens from Vaultio"
	@echo "  make demo            - Run full demo (deploy-mock, mint, approve, lock)"
	@echo ""
	@echo "Environment Variables for Demo:"
	@echo "  TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS  - For deploy-mock"
	@echo "  TOKEN_ADDRESS, RECIPIENT    - For mint"
	@echo "  TOKEN_ADDRESS, AMOUNT       - For approve/lock"
	@echo "  VAULTIO_ADDRESS, LOCK_ID    - For withdraw"

# Start all services
up:
	docker compose up -d

# Start all services with rebuild
up-build:
	docker compose up -d --build

# Stop all services
down:
	docker compose down

# Build Docker images
build:
	docker compose build

# Show logs from all services
logs:
	docker compose logs -f

# Show logs from hardhat service
logs-hardhat:
	docker compose logs -f hardhat

# Show logs from frontend service
logs-frontend:
	docker compose logs -f frontend

# Open shell in hardhat container
shell-hardhat:
	docker compose exec hardhat sh

# Open shell in frontend container
shell-frontend:
	docker compose exec frontend sh

# ============ Hardhat Node ============

# Start Hardhat node inside container
node:
	docker compose exec hardhat pnpm exec hardhat node --hostname 0.0.0.0

# Stop Hardhat node (kills the process inside container)
stop-node:
	docker compose exec hardhat pkill -f "hardhat node" || true

# ============ Hardhat Commands (inside Docker) ============

compile:
	docker compose exec hardhat pnpm exec hardhat compile

test:
	docker compose exec hardhat pnpm exec hardhat test

clean:
	docker compose exec hardhat pnpm exec hardhat clean

deploy-local:
	docker compose exec hardhat pnpm exec hardhat ignition deploy ignition/modules/Vaultio.ts --network localhost

deploy-sepolia:
	docker compose exec hardhat pnpm exec hardhat ignition deploy ignition/modules/Vaultio.ts --network sepolia --verify

verify:
	docker compose exec hardhat pnpm exec hardhat ignition verify sepolia-deployment

# ============ Demo Scripts (inside Docker) ============

# Deploy a MockERC20 token
# Usage: make deploy-mock
# Example: make deploy-mock TOKEN_NAME="Ziku Token" TOKEN_SYMBOL="ZKT" TOKEN_DECIMALS=18
deploy-mock:
	docker compose exec -e TOKEN_NAME="$(TOKEN_NAME)" -e TOKEN_SYMBOL="$(TOKEN_SYMBOL)" -e TOKEN_DECIMALS="$(TOKEN_DECIMALS)" \
		hardhat pnpm exec hardhat run scripts/deploy-mock.ts --network localhost

# Mint tokens to an address
# Usage: make mint TOKEN_ADDRESS=0x... RECIPIENT=0x... AMOUNT=1000
mint:
	docker compose exec -e TOKEN_ADDRESS="$(TOKEN_ADDRESS)" -e RECIPIENT="$(RECIPIENT)" -e AMOUNT="$(AMOUNT)" \
		hardhat pnpm exec hardhat run scripts/mint.ts --network localhost

# Approve Vaultio to spend tokens
# Usage: make approve TOKEN_ADDRESS=0x... VAULTIO_ADDRESS=0x... AMOUNT=1000
approve:
	docker compose exec -e TOKEN_ADDRESS="$(TOKEN_ADDRESS)" -e VAULTIO_ADDRESS="$(VAULTIO_ADDRESS)" -e AMOUNT="$(AMOUNT)" \
		hardhat pnpm exec hardhat run scripts/approve.ts --network localhost

# Lock tokens in Vaultio
# Usage: make lock TOKEN_ADDRESS=0x... VAULTIO_ADDRESS=0x... AMOUNT=100 DURATION=1
lock:
	docker compose exec -e TOKEN_ADDRESS="$(TOKEN_ADDRESS)" -e VAULTIO_ADDRESS="$(VAULTIO_ADDRESS)" \
		-e AMOUNT="$(AMOUNT)" -e DURATION="$(DURATION)" \
		hardhat pnpm exec hardhat run scripts/lock.ts --network localhost

# Withdraw tokens from Vaultio
# Usage: make withdraw VAULTIO_ADDRESS=0x... LOCK_ID=0
withdraw:
	docker compose exec -e VAULTIO_ADDRESS="$(VAULTIO_ADDRESS)" -e LOCK_ID="$(LOCK_ID)" \
		hardhat pnpm exec hardhat run scripts/withdraw.ts --network localhost

# Run full demo: deploy mock, mint, approve, lock
demo:
	@echo "=========================================="
	@echo "Starting Vaultio Demo..."
	@echo "=========================================="
	@$(MAKE) deploy-mock
	@$(MAKE) mint
	@$(MAKE) approve
	@$(MAKE) lock
	@echo ""
	@echo "=========================================="
	@echo "Demo complete! Token locked in Vaultio."
	@echo "Wait for the lock period to expire, then run:"
	@echo "  make withdraw"
	@echo "=========================================="

