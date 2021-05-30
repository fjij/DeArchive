const fs = require('fs');
const path = require('path');
const contractsDir = __dirname + "/../frontend/src/contracts";

async function main() {

  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );
  
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const DeArchive = await ethers.getContractFactory("DeArchive");
  const contract = await DeArchive.deploy(
    process.env.DEARCHIVE_ORACLE_ADDRESS,
    process.env.DEARCHIVE_JOB_ID,
  );

  console.log("DeArchive contract address:", contract.address);

  copyArtifact('DeArchive');
  writeConfig({
    contractAddress: contract.address,
    linkAddress: process.env.DEARCHIVE_LINK_ADDRESS,
    rpc: process.env.DEARCHIVE_RINKEBY_RPC
  });
}


function writeConfig(config) {
  fs.writeFileSync(
    contractsDir + "/config.json",
    JSON.stringify(config, undefined, 2)
  );
}

function copyArtifact(name) {
  fs.copyFileSync(
    path.join(__dirname, `../artifacts/contracts/${name}.sol/${name}.json`),
    path.join(contractsDir, `/${name}.json`)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
