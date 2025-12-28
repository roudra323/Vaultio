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
  const amount = process.env.AMOUNT || "100";
  const duration = process.env.DURATION || "1"; // Duration in minutes

  console.log("Token Address:", tokenAddress);
  console.log("Vaultio Address:", vaultioAddress);
  console.log("Amount to lock:", amount, "tokens");
  console.log("Duration:", duration, "minutes");
  console.log("Locking from:", signer.address);

  // Connect to contracts
  const vaultio = await ethers.getContractAt("Vaultio", vaultioAddress);
  const mockToken = await ethers.getContractAt("MockERC20", tokenAddress);

  // Check balance and allowance
  const balance = await mockToken.balanceOf(signer.address);
  const allowance = await mockToken.allowance(signer.address, vaultioAddress);
  console.log(`\nCurrent balance: ${ethers.formatEther(balance)} tokens`);
  console.log(`Current allowance: ${ethers.formatEther(allowance)} tokens`);

  const lockAmount = ethers.parseEther(amount);
  const durationMinutes = BigInt(duration);

  if (balance < lockAmount) {
    throw new Error(`Insufficient balance. Have: ${ethers.formatEther(balance)}, need: ${amount}`);
  }

  if (allowance < lockAmount) {
    throw new Error(`Insufficient allowance. Have: ${ethers.formatEther(allowance)}, need: ${amount}. Run approve script first.`);
  }

  // Lock tokens
  const tx = await vaultio.lockTokens(tokenAddress, lockAmount, durationMinutes);
  const receipt = await tx.wait();
  console.log(`\nLock transaction hash: ${tx.hash}`);

  // Parse the TokenLocked event to get lock details
  const tokenLockedEvent = receipt?.logs.find((log) => {
    try {
      const parsed = vaultio.interface.parseLog({
        topics: log.topics as string[],
        data: log.data,
      });
      return parsed?.name === "TokenLocked";
    } catch {
      return false;
    }
  });

  if (tokenLockedEvent) {
    const parsed = vaultio.interface.parseLog({
      topics: tokenLockedEvent.topics as string[],
      data: tokenLockedEvent.data,
    });
    
    if (parsed) {
      const lockId = parsed.args.lockId;
      const unlockTime = parsed.args.unlockTime;
      const unlockDate = new Date(Number(unlockTime) * 1000);

      console.log(`\nLock created successfully!`);
      console.log(`Lock ID: ${lockId}`);
      console.log(`Amount locked: ${amount} tokens`);
      console.log(`Unlock time: ${unlockDate.toLocaleString()}`);
    }
  }

  // Get updated balance
  const balanceAfter = await mockToken.balanceOf(signer.address);
  console.log(`\nBalance after lock: ${ethers.formatEther(balanceAfter)} tokens`);

  // Get user's locks
  const userLocks = await vaultio.getUserLocks(signer.address);
  console.log(`\nTotal locks for user: ${userLocks.length}`);
};

main()
  .then(() => {
    console.log("\nLock successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Lock failed:", error);
    process.exit(1);
  });


