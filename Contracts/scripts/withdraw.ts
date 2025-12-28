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

  const vaultioAddress = getVaultioAddress();
  const lockId = process.env.LOCK_ID || "0";

  console.log("Vaultio Address:", vaultioAddress);
  console.log("Lock ID:", lockId);
  console.log("Withdrawing to:", signer.address);

  // Connect to Vaultio
  const vaultio = await ethers.getContractAt("Vaultio", vaultioAddress);

  // Get lock details
  const lock = await vaultio.getLock(signer.address, BigInt(lockId));
  const tokenAddress = lock.token;
  const amount = lock.amount;
  const unlockTime = lock.unlockTime;
  const withdrawn = lock.withdrawn;

  console.log(`\nLock Details:`);
  console.log(`Token: ${tokenAddress}`);
  console.log(`Amount: ${ethers.formatEther(amount)} tokens`);
  console.log(`Unlock time: ${new Date(Number(unlockTime) * 1000).toLocaleString()}`);
  console.log(`Already withdrawn: ${withdrawn}`);

  if (withdrawn) {
    throw new Error("Tokens have already been withdrawn from this lock.");
  }

  // Check if lock is withdrawable
  const isWithdrawable = await vaultio.isWithdrawable(signer.address, BigInt(lockId));
  console.log(`\nIs withdrawable: ${isWithdrawable}`);

  if (!isWithdrawable) {
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = Number(unlockTime) - currentTime;
    const remainingMinutes = Math.ceil(remainingTime / 60);
    throw new Error(
      `Lock period has not expired. ${remainingMinutes} minutes remaining.`
    );
  }

  // Connect to token to check balance
  const mockToken = await ethers.getContractAt("MockERC20", tokenAddress);
  const balanceBefore = await mockToken.balanceOf(signer.address);
  console.log(`\nBalance before withdrawal: ${ethers.formatEther(balanceBefore)} tokens`);

  // Withdraw tokens
  const tx = await vaultio.withdrawTokens(BigInt(lockId));
  const receipt = await tx.wait();
  console.log(`\nWithdraw transaction hash: ${tx.hash}`);

  // Parse the TokenWithdrawn event
  const tokenWithdrawnEvent = receipt?.logs.find((log) => {
    try {
      const parsed = vaultio.interface.parseLog({
        topics: log.topics as string[],
        data: log.data,
      });
      return parsed?.name === "TokenWithdrawn";
    } catch {
      return false;
    }
  });

  if (tokenWithdrawnEvent) {
    const parsed = vaultio.interface.parseLog({
      topics: tokenWithdrawnEvent.topics as string[],
      data: tokenWithdrawnEvent.data,
    });

    if (parsed) {
      console.log(`\nWithdrawal successful!`);
      console.log(`Lock ID: ${parsed.args.lockId}`);
      console.log(`Amount withdrawn: ${ethers.formatEther(parsed.args.amount)} tokens`);
    }
  }

  // Get updated balance
  const balanceAfter = await mockToken.balanceOf(signer.address);
  console.log(`\nBalance after withdrawal: ${ethers.formatEther(balanceAfter)} tokens`);
};

main()
  .then(() => {
    console.log("\nWithdrawal successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Withdrawal failed:", error);
    process.exit(1);
  });

