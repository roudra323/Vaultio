.PHONY: compile test clean node stop-node deploy-local deploy-sepolia verify

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

