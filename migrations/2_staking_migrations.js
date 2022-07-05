const Staking = artifacts.require("Staking");
const NFToken = artifacts.require("NFToken");

module.exports = async function (deployer) {
    await deployer.deploy(NFToken);
    const nft = await NFToken.deployed();
    await deployer.deploy(Staking, nft.address);
}