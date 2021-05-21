import { log, BigInt, Address, ethereum } from '@graphprotocol/graph-ts'

// contract imports
import {
  PotPoolContract,
  RewardAdded as RewardAddedEvent
} from "../../generated/PotNotifyHelperListener/PotPoolContract"

// schema imports
import {
  Pool,
  Reward
} from "../../generated/schema"

// helper function imports
import { loadOrCreateTransaction } from "./utils/Transaction"
import { loadOrCreateERC20DetailedToken } from "./Token"


export function handleRewardAdded(event: RewardAddedEvent): void {
  let pool_addr = event.address
  let pool_contract = PotPoolContract.bind(pool_addr)
  let reward_token_addr = event.params.rewardToken
  let reward_amount = event.params.reward

  // the pool is guaranteed to exist at this point
  let pool = Pool.load(pool_addr.toHex())

  // check if the potpool already includes the rewarded token
  // if not we add it
  let reward_tokens = pool.rewardTokens
  if (reward_tokens.includes(reward_token_addr.toHex()) == false){
    let reward_token = loadOrCreateERC20DetailedToken(reward_token_addr)
    reward_tokens.push(reward_token.id)
    pool.rewardTokens = reward_tokens
    pool.save()
  }

  let transaction = loadOrCreateTransaction(event.transaction, event.block)

  let reward = new Reward(transaction.id+"-"+pool.id+"-"+reward_token_addr.toHex())
  reward.timestamp = transaction.timestamp
  reward.transaction = transaction.id
  reward.pool = pool.id
  reward.token = reward_token_addr.toHex()
  reward.reward = reward_amount
  reward.rewardRate = pool_contract.rewardRateForToken(reward_token_addr)
  reward.periodFinish = pool_contract.periodFinishForToken(reward_token_addr)
  reward.save()
}
