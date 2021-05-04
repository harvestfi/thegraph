import { log  } from '@graphprotocol/graph-ts'

// contract imports
import {
  NotifyPoolsCall
} from "../generated/NotifyHelperListener/NotifyHelperContract"
import {
  PoolContract
} from "../generated/NotifyHelperListener/PoolContract"


// schema imports
import {
  Pool
} from "../generated/schema"

// helper function import
import { loadOrCreateERC20DetailedToken } from "./utils/Token"
import { loadOrCreateTransaction } from "./utils/Transaction"


export function handleNotifyPools(call: NotifyPoolsCall): void {
  let pools = call.inputs.pools
  for(let i = 0;i<pools.length;i++) {
    let pool_addr = pools[i]
    let pool = Pool.load(pool_addr.toHex())
    if (pool == null){
      let transaction = loadOrCreateTransaction(call.transaction, call.block)

      let pool_contract = PoolContract.bind(pool_addr)
      let lp_token_addr = pool_contract.lpToken()
      let lp_token = loadOrCreateERC20DetailedToken(lp_token_addr)

      let reward_token_addr = pool_contract.rewardToken()
      let reward_token = loadOrCreateERC20DetailedToken(reward_token_addr)

      let vault_addr = pool_contract.sourceVault()

      pool = new Pool(pool_addr.toHex())
      pool.timestamp = transaction.timestamp
      pool.transaction = transaction.id
      // We are not first loading the vault and creating it because some old
      // pools point to address 0 and we can't create a vault for that address
      // besides pools are only relevant when attached to a vault
      pool.vault = vault_addr.toHex()
      pool.lpToken = lp_token.id
      pool.rewardToken = reward_token.id
      pool.save()
    }
  }
}
