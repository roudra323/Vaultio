// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VaultioModule = buildModule("VaultioModule", (m) => {
  const vaultio = m.contract("Vaultio");

  return { vaultio };
});

export default VaultioModule;
