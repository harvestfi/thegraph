//import { log } from '@graphprotocol/graph-ts'

// contract imports
import {
  NoMintPoolContract,
  RewardAdded as RewardAddedEvent
} from "../generated/templates/NoMintPoolListener/NoMintPoolContract"

// schema imports
import {
  Pool,
  Reward
} from "../generated/schema"

// helper function imports
import { loadOrCreateTransaction } from "./utils/Transaction"


export function handleRewardAdded(event: RewardAddedEvent): void {
  let pool_addr = event.address
  let pool_contract = NoMintPoolContract.bind(pool_addr)
  let reward_token_addr = pool_contract.rewardToken()

  // the pool is guaranteed to exist at this point
  let pool = Pool.load(pool_addr.toHex())

  let transaction = loadOrCreateTransaction(event.transaction, event.block)

  let reward = new Reward(transaction.id+"-"+pool.id+"-"+reward_token_addr.toHex())
  reward.timestamp = transaction.timestamp
  reward.transaction = transaction.id
  reward.pool = pool.id
  reward.token = reward_token_addr.toHex()
  reward.reward = event.params.reward
  reward.rewardRate = pool_contract.rewardRate()
  reward.periodFinish = pool_contract.periodFinish()
  reward.save()
}
