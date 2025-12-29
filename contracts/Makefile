.PHONY: compile test clean node stop-node deploy-local deploy-sepolia verify \
        deploy-mock mint approve lock withdraw demo

compile:
	npx hardhat compile

test:
	npx hardhat test

clean:
	npx hardhat clean

node:
	npx hardhat node

stop-node:
	pkill -f "hardhat node" || true

deploy-local:
	npx hardhat ignition deploy ignition/modules/Vaultio.ts --network localhost

deploy-sepolia:
	npx hardhat ignition deploy ignition/modules/Vaultio.ts --network sepolia --verify

verify:
	npx hardhat ignition verify sepolia-deployment

# ============ Demo Scripts ============

# Deploy a MockERC20 token
# Usage: make deploy-mock
# Env vars: TOKEN_NAME, TOKEN_SYMBOL
# Example: make deploy-mock TOKEN_NAME="Ziku Token" TOKEN_SYMBOL="ZKT"
deploy-mock:
	npx hardhat run scripts/deploy-mock.ts --network localhost

# Mint tokens to an address
# Usage: make mint
# Env vars: TOKEN_ADDRESS, RECIPIENT, AMOUNT (default: 1000)
mint:
	npx hardhat run scripts/mint.ts --network localhost

# Approve Vaultio to spend tokens
# Usage: make approve
# Env vars: TOKEN_ADDRESS, VAULTIO_ADDRESS, AMOUNT (default: 1000)
approve:
	npx hardhat run scripts/approve.ts --network localhost

# Lock tokens in Vaultio
# Usage: make lock
# Env vars: TOKEN_ADDRESS, VAULTIO_ADDRESS, AMOUNT (default: 100), DURATION (default: 1 minute)
lock:
	npx hardhat run scripts/lock.ts --network localhost

# Withdraw tokens from Vaultio
# Usage: make withdraw
# Env vars: VAULTIO_ADDRESS, LOCK_ID (default: 0)
withdraw:
	npx hardhat run scripts/withdraw.ts --network localhost

# Run full demo: deploy mock, mint, approve, lock
# Usage: make demo
demo: deploy-mock mint approve lock
	@echo "\n=========================================="
	@echo "Demo complete! Token locked in Vaultio."
	@echo "Wait for the lock period to expire, then run:"
	@echo "  make withdraw"
	@echo "=========================================="

