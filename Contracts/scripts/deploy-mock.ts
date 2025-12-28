import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const DEPLOYED_MOCK_PATH = path.join(__dirname, "..", "deployed-mock.json");

const main = async () => {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying MockERC20 with account:", deployer.address);

    // Get token name and symbol from environment or use defaults
    const tokenName = process.env.TOKEN_NAME || "Mock Token";
    const tokenSymbol = process.env.TOKEN_SYMBOL || "MTK";

    console.log(`Token Name: ${tokenName}`);
    console.log(`Token Symbol: ${tokenSymbol}`);

    // Deploy MockERC20
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockToken = await MockERC20.deploy(tokenName, tokenSymbol);
    await mockToken.waitForDeployment();

    const tokenAddress = await mockToken.getAddress();
    console.log(`\nMockERC20 deployed to: ${tokenAddress}`);

    // Save deployed address to JSON file
    const deployedData = {
        address: tokenAddress,
        name: tokenName,
        symbol: tokenSymbol,
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
    };

    fs.writeFileSync(DEPLOYED_MOCK_PATH, JSON.stringify(deployedData, null, 2));
    console.log(`\nDeployment info saved to: ${DEPLOYED_MOCK_PATH}`);

    return tokenAddress;
};

main()
    .then((address) => {
        console.log("\nDeployment successful!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });

