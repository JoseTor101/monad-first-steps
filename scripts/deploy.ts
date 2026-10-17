import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Counter to Monad testnet...");

  // Grab the compiled contract factory and deploy it.
  const Counter = await ethers.getContractFactory("Counter");
  const counter = await Counter.deploy();

  // Wait until the deployment transaction is mined.
  await counter.waitForDeployment();

  const address = await counter.getAddress();
  console.log("Counter deployed to:", address);
  console.log("\nNext step: paste this address into frontend/src/config.ts");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
