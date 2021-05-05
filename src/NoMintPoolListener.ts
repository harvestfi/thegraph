//import { log } from '@graphprotocol/graph-ts'

// subgraph templates
//import { VaultListener } from '../generated/templates'

// contract imports
import {
  NoMintPoolContract,
  RewardAdded as RewardAddedEvent
} from "../generated/templates/NoMintPoolListener/NoMintPoolContract"

// schema imports
import {
  Pool,
  RewardAdded
} from "../generated/schema"

// helper function imports
import { loadOrCreateTransaction } from "./utils/Transaction"


export function handleRewardAdded(event: RewardAddedEvent): void {
  let pool_addr = event.address
  let pool_contract = NoMintPoolContract.bind(pool_addr)

  // the pool is guaranteed to exist at this point
  let pool = Pool.load(pool_addr.toHex())

  let transaction = loadOrCreateTransaction(event.transaction, event.block)

  let reward_added = new RewardAdded(transaction.id+"-"+pool.id)
  reward_added.timestamp = transaction.timestamp
  reward_added.transaction = transaction.id
  reward_added.pool = pool.id
  reward_added.reward = event.params.reward
  reward_added.rewardRate = pool_contract.rewardRate()
  reward_added.save()
}
