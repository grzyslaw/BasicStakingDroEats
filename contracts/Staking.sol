// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
 
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Staking is Ownable, IERC721Receiver {
    
    IERC721 public nft;

    uint16 public totalStaked;
    uint256 public stakingStartTime;
    bool public isStakingActive = false;

    struct Stake {
        uint16 tokenId;
        uint256 timestamp;
        uint256 totalTimeStaked;
        address owner;
        bool active;
    }

    mapping (uint256 => Stake) public Vault;
    
    modifier ownerOfToken(uint256 tokenId) {
        require(msg.sender == nft.ownerOf(tokenId), "You are not owner of the token");
        _;
    }

    modifier ownerOfStake(uint256 tokenId) {
        require(msg.sender == Vault[tokenId].owner, "You are not an owner of this stake");
        _;
    }

    modifier isNotStakedYet(uint256 tokenId) {
        require(Vault[tokenId].active == false, "This Stake does not belong to you");
        _;
    }

    modifier stakingActive() {
        require(isStakingActive, "Staking is not active yet");
        _;
    }

    event Staked(address by, uint16 tokenId);
    event Unstaked(address by, uint16 tokenId);

    constructor(address _nft) {
        nft = IERC721(_nft);
    }

    function stake(uint256 tokenId) 
    public 
    ownerOfToken(tokenId) isNotStakedYet(tokenId) stakingActive
    {
        totalStaked++;
        nft.safeTransferFrom(msg.sender, address(this), tokenId, "0x00");
        if(Vault[tokenId].owner == address(0))
        {
            Vault[tokenId] = Stake({
                tokenId: uint16(tokenId),
                timestamp: block.timestamp,
                totalTimeStaked: 0,
                owner: msg.sender,
                active: true
            });
        }
        else if(Vault[tokenId].owner != msg.sender)
        {
            Vault[tokenId].owner = msg.sender;
            Vault[tokenId].active = true;
            Vault[tokenId].timestamp = block.timestamp;
        }
        else
        {
            Vault[tokenId].active = true;
            Vault[tokenId].timestamp = block.timestamp;
        }
        emit Staked(msg.sender, uint16(tokenId));
    }

    function unstake(uint256 tokenId) 
    public
    ownerOfStake(tokenId) stakingActive
    {
        totalStaked--;
        Vault[tokenId].active = false;
        Vault[tokenId].totalTimeStaked += block.timestamp - Vault[tokenId].timestamp;
        Vault[tokenId].timestamp = 0;
        emit Unstaked(msg.sender, uint16(tokenId));
        nft.safeTransferFrom(address(this), msg.sender, tokenId);
    }

    function stakeMany(uint256[] calldata tokenIds) 
    external
    stakingActive
    {
        for(uint i=0; i<tokenIds.length; i++)
        {
            stake(tokenIds[i]);
        }
    }

    function unstakeMany(uint256[] calldata tokenIds) 
    external
    stakingActive
    {
        for(uint i=0; i<tokenIds.length; i++)
        {
            unstake(tokenIds[i]);
        }
    }

    function stakedTimeInfo(uint256 tokenId)
    external view returns(uint256) 
    {
        return (Vault[tokenId].totalTimeStaked + (block.timestamp - Vault[tokenId].timestamp));
    }

    function onERC721Received(address, address from, uint256, bytes calldata) 
    external pure override returns (bytes4) {
      return IERC721Receiver.onERC721Received.selector;
    }

    function toggleStaking(bool state)
    external onlyOwner
    {
        isStakingActive = state;
        stakingStartTime = block.timestamp;
    }

    function setNewErc721Contract(address _nft)
    external onlyOwner
    {
        nft=IERC721(_nft);
    }
}