require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: "0.4.24",
  networks: {
    rinkeby: {
      url: process.env.DEARCHIVE_RINKEBY_RPC,
      accounts: [process.env.DEARCHIVE_PRIVATE_KEY]
    }
  }
};
