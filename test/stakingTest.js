const Staking = artifacts.require("Staking");
const NFToken = artifacts.require("NFToken");

const time = require("./helpers/time");
const utils = require("./helpers/utils");

const SECONDS_IN_DAY = 86400;

contract('staking tests', (accounts) => {
    let [alice, bob, carl, damian, eve, frank, george] = accounts;
    let cNft;
    let cNftAddress;
    let cStaker;
    let cStakerAddress;

    beforeEach(async () => {
        cNft = await NFToken.deployed();
        cNftAddress = cNft.address;

        cStaker = await Staking.deployed(cNftAddress);
        cStakerAddress = cStaker.address;

        for(let i=0;i<5;i++)
        {
            await cNft.safeMint({from:alice});
        }
        for(let i=0;i<5;i++)
        {
            await cNft.safeMint({from:bob});
        }
        await cNft.safeMint({from:carl});
        await cNft.safeMint({from:damian});
        await cNft.safeMint({from:eve});
        await cNft.safeMint({from:frank});
        await cNft.safeMint({from:george});
        
        //peers set approval
        await cNft.setApprovalForAll(cStakerAddress,true, {from:alice});
        await cNft.setApprovalForAll(cStakerAddress,true, {from:bob});
        await cNft.setApprovalForAll(cStakerAddress,true, {from:carl});
        await cNft.setApprovalForAll(cStakerAddress,true, {from:damian});
        await cNft.setApprovalForAll(cStakerAddress,true, {from:eve});
        await cNft.setApprovalForAll(cStakerAddress,true, {from:frank});
        await cNft.setApprovalForAll(cStakerAddress,true, {from:george});
    });

    it.skip('should not allow any actions before staking starts', async() => {
        await utils.shouldThrow(cStaker.stake(0,{from:alice}));
    });

    it.skip('peers should be able to stake their NFTs', async() => {
        await cStaker.toggleStaking(true);
        for(let i=0;i<5;i++) 
        {
            await cStaker.stake(i,{from:alice});
        }
        await cStaker.stake(5,{from:bob});
        await cStaker.stake(10,{from:carl});
        await cStaker.stake(11,{from:damian});
        await cStaker.stake(12,{from:eve});
        await cStaker.stake(13,{from:frank});
        await cStaker.stake(14,{from:george});
        assert.equal(await cStaker.totalStaked.call(), 11);
    });

    it.skip('peers should not be able to stake nft that does not belong to them', async() => {
        await cStaker.toggleStaking(true);
        await utils.shouldThrow(cStaker.stake(7,{from:alice}));
    });

    it.skip('peers should be able to unstake nft that belong to them', async() => {
        await cStaker.toggleStaking(true);
        await cStaker.stake(0,{from:alice});
        assert.equal(await cStaker.totalStaked.call(), 1);
        await cStaker.unstake(0,{from:alice});
        assert.equal(await cStaker.totalStaked.call(), 0);
    });

    it.skip('stake should not be affected while transfering nft', async() => {
        await cStaker.toggleStaking(true);
        await cStaker.stake(0,{from:alice});
        await time.advanceTimeAndBlock(10*SECONDS_IN_DAY);
        let T1 = await cStaker.stakedTimeInfo(0);
        console.log(T1 + " T1 time after 10 days of staking");
        await cStaker.unstake(0,{from: alice});
        await time.advanceTimeAndBlock(10*SECONDS_IN_DAY);
        await cNft.safeTransferFrom(alice, bob, 0, {from:alice});
        await cStaker.stake(0,{from:bob});
        let T2 = await cStaker.stakedTimeInfo(0);
        console.log(T2 + " T2 time right after transfer");
        await time.advanceTimeAndBlock(10*SECONDS_IN_DAY);
        let T3 = await cStaker.stakedTimeInfo(0);
        console.log(T3 + " T3 time after 10 days of staking");
        await utils.shouldThrow(cStaker.unstake(0,{from:alice}));
        await cStaker.unstake(0,{from:bob});
        assert.equal(await cStaker.totalStaked.call(), 0);
    });

    it.skip('stake/unstake many should work', async() => {
        await cStaker.toggleStaking(true);
        await cStaker.stakeMany([0,1,2,3,4],{from:alice});
        assert.equal(await cStaker.totalStaked.call(), 5);
        await cStaker.unstakeMany([0,1,2,3,4],{from:alice});
        assert.equal(await cStaker.totalStaked.call(), 0);
    });
});