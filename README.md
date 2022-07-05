# BasicStakingDroEats
Contract is designed in a way that will allow furter rewards distributin based on total time staked (flexibility in terms of furter actions)
- stake is bounded to nft (in case of transfer event, stake is still "there")
- rewards can be displayed with stakedTimeInfo (for the sake of further distribution)
- while unstaking rewards are cumulated in Stake.totalTimeStaked, so later token can be staked again without losing the "progress".
