import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const DEPLOYED_MOCK_PATH = path.join(__dirname, "..", "deployed-mock.json");

const getTokenAddress = (): string => {
  // First check environment variable
  if (process.env.TOKEN_ADDRESS) {
    return process.env.TOKEN_ADDRESS;
  }

  // Then check deployed-mock.json
  if (fs.existsSync(DEPLOYED_MOCK_PATH)) {
    const deployedData = JSON.parse(fs.readFileSync(DEPLOYED_MOCK_PATH, "utf8"));
    return deployedData.address;
  }

  throw new Error(
    "Token address not found. Set TOKEN_ADDRESS env var or run deploy-mock first."
  );
};

const main = async () => {
  const [signer] = await ethers.getSigners();
  
  const tokenAddress = getTokenAddress();
  const recipient = process.env.RECIPIENT || signer.address;
  const amount = process.env.AMOUNT || "1000";

  console.log("Token Address:", tokenAddress);
  console.log("Recipient:", recipient);
  console.log("Amount:", amount, "tokens");

  // Connect to MockERC20
  const mockToken = await ethers.getContractAt("MockERC20", tokenAddress);

  // Get balance before minting
  const balanceBefore = await mockToken.balanceOf(recipient);
  console.log(`\nBalance before: ${ethers.formatEther(balanceBefore)} tokens`);

  // Mint tokens
  const mintAmount = ethers.parseEther(amount);
  const tx = await mockToken.mint(recipient, mintAmount);
  await tx.wait();
  console.log(`Minted ${amount} tokens to ${recipient}`);
  console.log(`Transaction hash: ${tx.hash}`);

  // Get balance after minting
  const balanceAfter = await mockToken.balanceOf(recipient);
  console.log(`\nBalance after: ${ethers.formatEther(balanceAfter)} tokens`);

  return balanceAfter;
};

main()
  .then(() => {
    console.log("\nMinting successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Minting failed:", error);
    process.exit(1);
  });

