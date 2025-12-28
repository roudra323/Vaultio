import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const DEPLOYED_MOCK_PATH = path.join(__dirname, "..", "deployed-mock.json");
const DEPLOYED_ADDRESSES_PATH = path.join(
    __dirname,
    "..",
    "ignition",
    "deployments",
    "chain-31337",
    "deployed_addresses.json"
);

const getTokenAddress = (): string => {
    if (process.env.TOKEN_ADDRESS) {
        return process.env.TOKEN_ADDRESS;
    }

    if (fs.existsSync(DEPLOYED_MOCK_PATH)) {
        const deployedData = JSON.parse(fs.readFileSync(DEPLOYED_MOCK_PATH, "utf8"));
        return deployedData.address;
    }

    throw new Error(
        "Token address not found. Set TOKEN_ADDRESS env var or run deploy-mock first."
    );
};

const getVaultioAddress = (): string => {
    if (process.env.VAULTIO_ADDRESS) {
        return process.env.VAULTIO_ADDRESS;
    }

    if (fs.existsSync(DEPLOYED_ADDRESSES_PATH)) {
        const deployedData = JSON.parse(fs.readFileSync(DEPLOYED_ADDRESSES_PATH, "utf8"));
        return deployedData["VaultioModule#Vaultio"];
    }

    throw new Error(
        "Vaultio address not found. Set VAULTIO_ADDRESS env var or deploy Vaultio first."
    );
};

const main = async () => {
    const [signer] = await ethers.getSigners();

    const tokenAddress = getTokenAddress();
    const vaultioAddress = getVaultioAddress();
    const amount = process.env.AMOUNT || "1000";

    console.log("Token Address:", tokenAddress);
    console.log("Vaultio Address:", vaultioAddress);
    console.log("Amount to approve:", amount, "tokens");
    console.log("Approving from:", signer.address);

    // Connect to MockERC20
    const mockToken = await ethers.getContractAt("MockERC20", tokenAddress);

    // Get current allowance before approval
    const allowanceBefore = await mockToken.allowance(signer.address, vaultioAddress);
    console.log(`\nAllowance before: ${ethers.formatEther(allowanceBefore)} tokens`);

    // Approve Vaultio to spend tokens
    const approveAmount = ethers.parseEther(amount);
    const tx = await mockToken.approve(vaultioAddress, approveAmount);
    await tx.wait();
    console.log(`Approved ${amount} tokens for Vaultio`);
    console.log(`Transaction hash: ${tx.hash}`);

    // Get allowance after approval
    const allowanceAfter = await mockToken.allowance(signer.address, vaultioAddress);
    console.log(`\nAllowance after: ${ethers.formatEther(allowanceAfter)} tokens`);

    return allowanceAfter;
};

main()
    .then(() => {
        console.log("\nApproval successful!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Approval failed:", error);
        process.exit(1);
    });


