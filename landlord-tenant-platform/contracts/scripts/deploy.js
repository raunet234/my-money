const hre = require("hardhat");

async function main() {
  console.log("Deploying RentalEscrow contract...");

  // Get the contract factory
  const RentalEscrow = await hre.ethers.getContractFactory("RentalEscrow");

  // Deploy the contract
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Set fee collector to deployer address (you can change this)
  const feeCollector = deployer.address;

  const rentalEscrow = await RentalEscrow.deploy(feeCollector);
  await rentalEscrow.waitForDeployment();

  const contractAddress = await rentalEscrow.getAddress();
  console.log("RentalEscrow deployed to:", contractAddress);

  // Log deployment details
  console.log("\nDeployment Details:");
  console.log("- Network:", hre.network.name);
  console.log("- Contract Address:", contractAddress);
  console.log("- Fee Collector:", feeCollector);
  console.log("- Deployer:", deployer.address);

  // Verify contract on Etherscan if not on hardhat network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await rentalEscrow.deploymentTransaction().wait(6);

    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [feeCollector],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contractAddress: contractAddress,
    deployer: deployer.address,
    feeCollector: feeCollector,
    blockNumber: rentalEscrow.deploymentTransaction()?.blockNumber,
    transactionHash: rentalEscrow.deploymentTransaction()?.hash,
    timestamp: new Date().toISOString(),
  };

  const fs = require("fs");
  const path = require("path");
  
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`\nDeployment info saved to deployments/${hre.network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });