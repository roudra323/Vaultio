<div align="center">

# Vaultio

**A decentralized token locking vault system built on Ethereum**

[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-blue.svg)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.28.0-yellow.svg)](https://hardhat.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## Table of Contents

<details>
<summary><b>Click to expand</b></summary>

- [Project Overview](#project-overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Contract Deployment](#contract-deployment)
- [Frontend Setup](#frontend-setup)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Development](#development)
- [Security Considerations](#security-considerations)

</details>

---

## Project Overview

**Vaultio is a smart contract-based token vault system that provides secure, time-locked storage for ERC-20 tokens. Users can lock their tokens for a customizable duration (specified in minutes), and withdraw them only after the lock period has expired. The system uses OpenZeppelin's SafeERC20 library for secure token transfers and proper error handling.**

### Key Components

<table>
<tr>
<td width="33%">

**Smart Contract**

- Solidity 0.8.28
- OpenZeppelin libraries
- Hardhat framework

</td>
<td width="33%">

**Frontend**

- Next.js 16.1.1
- React 19.2.3
- Wagmi & RainbowKit

</td>
<td width="33%">

**Scripts**

- Hardhat scripts
- Makefile commands
- Deployment automation

</td>
</tr>
</table>

---

## Features

<table>
<tr>
<td>

✓ Lock ERC-20 tokens for specified duration  
✓ Withdraw tokens after lock expiration  
✓ View all user locks and details  
✓ Check withdrawal eligibility

</td>
<td>

✓ Secure transfers using SafeERC20  
✓ Multi-network support  
✓ Modern responsive UI  
✓ Time-based lock enforcement

</td>
</tr>
</table>

---

## Prerequisites

**Required Software:**

<table>
<thead>
<tr>
<th>Software</th>
<th>Version</th>
<th>Purpose</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Node.js</strong></td>
<td>v20+</td>
<td>JavaScript runtime</td>
</tr>
<tr>
<td><strong>pnpm</strong></td>
<td>v10.26.0+</td>
<td>Package manager</td>
</tr>
<tr>
<td><strong>Git</strong></td>
<td>Latest</td>
<td>Version control</td>
</tr>
<tr>
<td><strong>MetaMask</strong></td>
<td>Latest</td>
<td>Web3 wallet</td>
</tr>
<tr>
<td><strong>Hardhat Node</strong></td>
<td>Latest</td>
<td>Local blockchain</td>
</tr>
</tbody>
</table>

---

## Project Structure

<details>
<summary><b>View Project Structure</b></summary>

```
Vaultio/
├── contracts/              # Smart contract code
│   ├── contracts/         # Solidity contracts
│   ├── scripts/          # Deployment and interaction scripts
│   ├── test/             # Contract tests
│   ├── ignition/         # Hardhat Ignition deployment modules
│   └── hardhat.config.ts # Hardhat configuration
│
├── frontend/              # Next.js frontend application
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities and configurations
│   │   └── abi/          # Contract ABIs
│   └── public/           # Static assets
│
└── README.md             # This file
```

</details>

---

## Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Vaultio
```

### 2. Install Dependencies

**Install contract dependencies:**

```bash
cd contracts
pnpm install
```

**Install frontend dependencies:**

```bash
cd ../frontend
pnpm install
```

### 3. Environment Variables

<details>
<summary><b>Contracts Environment Configuration</b></summary>

Create a `.env` file in the `contracts/` directory:

```bash
cd contracts
```

```env
# Required for Sepolia deployment
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

<div style="background-color: #f8d7da; padding: 0.75rem; border-radius: 4px; margin: 0.5rem 0;">

<strong>⚠️ Security Note:</strong> Never commit your `.env` file to version control. Add it to `.gitignore`.

</div>

</details>

<details>
<summary><b>Frontend Environment Configuration</b></summary>

Create a `.env.local` file in the `frontend/` directory:

```bash
cd frontend
```

```env
# Contract address (will be set after deployment)
NEXT_PUBLIC_VAULTIO_ADDRESS=0x...

# WalletConnect Project ID (optional, for WalletConnect support)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

</details>

---

## Contract Deployment

### Local Development Network

<table>
<tr>
<td width="50%">

<strong>Step 1: Start Hardhat Node</strong>

```bash
cd contracts
make node
# Or: npx hardhat node
```

Keep this terminal running.  
Node starts on `http://127.0.0.1:8545`

</td>
<td width="50%">

<strong>Step 2: Deploy Vaultio Contract</strong>

```bash
cd contracts
make deploy-local
```

Save the contract address for frontend configuration.

</td>
</tr>
<tr>
<td colspan="2">

<strong>Step 3: Deploy Mock Token (Optional)</strong>

```bash
make deploy-mock
# Customize: TOKEN_NAME="Test Token" TOKEN_SYMBOL="TEST" make deploy-mock
```

</td>
</tr>
</table>

### Sepolia Testnet Deployment

**Production Deployment Checklist:**

<table>
<thead>
<tr>
<th>Step</th>
<th>Action</th>
<th>Command</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>1</strong></td>
<td>Configure environment variables</td>
<td>Set PRIVATE_KEY, SEPOLIA_RPC_URL, ETHERSCAN_API_KEY</td>
</tr>
<tr>
<td><strong>2</strong></td>
<td>Deploy to Sepolia</td>
<td><code>make deploy-sepolia</code></td>
</tr>
<tr>
<td><strong>3</strong></td>
<td>Verify contract (if needed)</td>
<td><code>make verify</code></td>
</tr>
</tbody>
</table>

---

## Frontend Setup

### 1. Configure Contract Address

**Option 1: Environment Variable (Recommended)**

Update `frontend/.env.local`:

```env
NEXT_PUBLIC_VAULTIO_ADDRESS=0xYourDeployedContractAddress
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

**Option 2: Direct Configuration**

Update `frontend/src/lib/contracts.ts`:

```typescript
export const VAULTIO_ADDRESS = "0xYourDeployedContractAddress";
```

### 2. Configure Network

<table>
<thead>
<tr>
<th>Network</th>
<th>RPC URL</th>
<th>Chain ID</th>
<th>Purpose</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Hardhat</strong></td>
<td>http://127.0.0.1:8545</td>
<td>31337</td>
<td>Local development</td>
</tr>
<tr>
<td><strong>Sepolia</strong></td>
<td>Public RPC</td>
<td>11155111</td>
<td>Testnet</td>
</tr>
<tr>
<td><strong>Mainnet</strong></td>
<td>Public RPC</td>
<td>1</td>
<td>Production</td>
</tr>
</tbody>
</table>

Network configuration is in `frontend/src/lib/wagmi.ts`.

### 3. Run Frontend Development Server

```bash
cd frontend
pnpm dev
```

Application available at: **http://localhost:3000**

### 4. Build for Production

```bash
cd frontend
pnpm build
pnpm start
```

---

## Configuration

### Contract Address Configuration

**Configuration Priority:**

1. Environment variable: `NEXT_PUBLIC_VAULTIO_ADDRESS`
2. Fallback: Default address in `frontend/src/lib/contracts.ts`

**To update after deployment:**

1. Copy deployed contract address from deployment output
2. Add/update `NEXT_PUBLIC_VAULTIO_ADDRESS` in `frontend/.env.local`
3. Restart frontend development server

### Network Configuration

<details>
<summary><b>Frontend Network Setup</b></summary>

Edit `frontend/src/lib/wagmi.ts`:

```typescript
import { mainnet, sepolia, hardhat, yourChain } from "wagmi/chains";

export const config = getDefaultConfig({
  chains: [mainnet, sepolia, hardhat, yourChain],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [hardhat.id]: http("http://127.0.0.1:8545"),
    [yourChain.id]: http("your_rpc_url"),
  },
});
```

</details>

<details>
<summary><b>Contract Network Setup</b></summary>

Edit `contracts/hardhat.config.ts`:

```typescript
networks: {
  yourNetwork: {
    url: "your_rpc_url",
    accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    chainId: your_chain_id,
  },
}
```

</details>

---

## Usage Examples

### Complete Workflow: Approve → Lock → Withdraw

**Workflow Overview:**

<table>
<tr>
<td width="33%">

<strong>Step 1: Approve</strong>  
Grant permission to spend tokens

</td>
<td width="33%">

<strong>Step 2: Lock</strong>  
Lock tokens for duration

</td>
<td width="33%">

<strong>Step 3: Withdraw</strong>  
Withdraw after expiration

</td>
</tr>
</table>

#### Step 1: Approve Tokens

**Command Line:**

```bash
cd contracts

# Using Makefile
make approve AMOUNT=1000

# Or using script directly
TOKEN_ADDRESS=0x... VAULTIO_ADDRESS=0x... AMOUNT=1000 \
  npx hardhat run scripts/approve.ts --network localhost
```

**Via Frontend:**

<ol>
<li>Connect your wallet</li>
<li>Navigate to the dashboard</li>
<li>Select a token and enter the amount to approve</li>
<li>Click "Approve"</li>
</ol>

#### Step 2: Lock Tokens

**Command Line:**

```bash
cd contracts

# Using Makefile
make lock AMOUNT=100 DURATION=5

# Or using script directly
TOKEN_ADDRESS=0x... VAULTIO_ADDRESS=0x... AMOUNT=100 DURATION=5 \
  npx hardhat run scripts/lock.ts --network localhost
```

**Via Frontend:**

<ol>
<li>Ensure tokens are approved</li>
<li>Enter the amount to lock</li>
<li>Specify the lock duration in minutes</li>
<li>Click "Lock Tokens"</li>
<li>Confirm the transaction in your wallet</li>
</ol>

#### Step 3: Withdraw Tokens

**Command Line:**

```bash
cd contracts

# Using Makefile
make withdraw LOCK_ID=0

# Or using script directly
VAULTIO_ADDRESS=0x... LOCK_ID=0 \
  npx hardhat run scripts/withdraw.ts --network localhost
```

**Via Frontend:**

<ol>
<li>Navigate to the dashboard</li>
<li>View your active locks in the table</li>
<li>Click "Withdraw" on an eligible lock</li>
<li>Confirm the transaction in your wallet</li>
</ol>

### Quick Demo Script

**Run Complete Demo:**

```bash
cd contracts

# Deploy mock token, mint tokens, approve, and lock
make demo

# Wait for lock period to expire, then withdraw
make withdraw LOCK_ID=0
```

### Script Parameters

<table>
<thead>
<tr>
<th>Script</th>
<th>Parameters</th>
<th>Default</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Approve</strong></td>
<td>
<code>TOKEN_ADDRESS</code> - Token address<br>
<code>VAULTIO_ADDRESS</code> - Contract address<br>
<code>AMOUNT</code> - Amount to approve
</td>
<td>From deployed files<br>From deployment<br>1000</td>
</tr>
<tr>
<td><strong>Lock</strong></td>
<td>
<code>TOKEN_ADDRESS</code> - Token address<br>
<code>VAULTIO_ADDRESS</code> - Contract address<br>
<code>AMOUNT</code> - Amount to lock<br>
<code>DURATION</code> - Duration (minutes)
</td>
<td>From deployed files<br>From deployment<br>100<br>1</td>
</tr>
<tr>
<td><strong>Withdraw</strong></td>
<td>
<code>VAULTIO_ADDRESS</code> - Contract address<br>
<code>LOCK_ID</code> - Lock ID
</td>
<td>From deployment<br>0</td>
</tr>
</tbody>
</table>

---

## Development

### Contract Development

<table>
<tr>
<td width="50%">

<strong>Compile Contracts</strong>

```bash
cd contracts
make compile
```

</td>
<td width="50%">

<strong>Run Tests</strong>

```bash
cd contracts
make test
```

</td>
</tr>
<tr>
<td>

<strong>Run Coverage</strong>

```bash
cd contracts
npx hardhat coverage
```

</td>
<td>

<strong>Clean Build</strong>

```bash
cd contracts
make clean
```

</td>
</tr>
</table>

### Frontend Development

<table>
<tr>
<td width="50%">

<strong>Start Dev Server</strong>

```bash
cd frontend
pnpm dev
```

</td>
<td width="50%">

<strong>Run Linter</strong>

```bash
cd frontend
pnpm lint
```

</td>
</tr>
<tr>
<td>

<strong>Format Code</strong>

```bash
cd frontend
pnpm format
```

</td>
<td>

<strong>Check Formatting</strong>

```bash
cd frontend
pnpm format:check
```

</td>
</tr>
</table>

### Available Makefile Commands

<details>
<summary><b>Contract Commands</b></summary>

<table>
<thead>
<tr>
<th>Command</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>make compile</code></td>
<td>Compile contracts</td>
</tr>
<tr>
<td><code>make test</code></td>
<td>Run tests</td>
</tr>
<tr>
<td><code>make clean</code></td>
<td>Clean build artifacts</td>
</tr>
<tr>
<td><code>make node</code></td>
<td>Start Hardhat node</td>
</tr>
<tr>
<td><code>make stop-node</code></td>
<td>Stop Hardhat node</td>
</tr>
<tr>
<td><code>make deploy-local</code></td>
<td>Deploy to localhost</td>
</tr>
<tr>
<td><code>make deploy-sepolia</code></td>
<td>Deploy to Sepolia</td>
</tr>
<tr>
<td><code>make verify</code></td>
<td>Verify contract on Etherscan</td>
</tr>
</tbody>
</table>

</details>

<details>
<summary><b>Interaction Commands</b></summary>

<table>
<thead>
<tr>
<th>Command</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>make deploy-mock</code></td>
<td>Deploy mock ERC-20 token</td>
</tr>
<tr>
<td><code>make mint</code></td>
<td>Mint tokens to an address</td>
</tr>
<tr>
<td><code>make approve</code></td>
<td>Approve tokens for Vaultio</td>
</tr>
<tr>
<td><code>make lock</code></td>
<td>Lock tokens in Vaultio</td>
</tr>
<tr>
<td><code>make withdraw</code></td>
<td>Withdraw tokens from Vaultio</td>
</tr>
<tr>
<td><code>make demo</code></td>
<td>Run complete demo workflow</td>
</tr>
</tbody>
</table>

</details>

---

## Security Considerations

**Security Features:**

<table>
<tr>
<td>

✓ SafeERC20 for secure transfers  
✓ Reentrancy protection  
✓ EOA-only lock creation  
✓ Input validation

</td>
<td>

✓ State updates before external calls  
✓ Lock period enforcement  
✓ Proper error handling  
✓ No contract-based locks

</td>
</tr>
</table>

**Important:** Always audit smart contracts before deploying to mainnet. This code is provided as-is for educational purposes.

---

## License

This project is licensed under the **MIT License**.

---

## Support

For issues, questions, or contributions, please open an issue in the repository.

---

<div align="center">

<sub>Built with Solidity, Hardhat, Next.js, and Web3 technologies</sub>

</div>
