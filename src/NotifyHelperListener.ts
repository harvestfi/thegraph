import { log  } from '@graphprotocol/graph-ts'

// contract imports
import {
  NotifyPoolsCall,
  NotifyPoolsIncludingProfitShareCall
} from "../generated/NotifyHelperListener/NotifyHelperContract"
import {
  PoolContract
} from "../generated/NotifyHelperListener/PoolContract"


// schema imports
import {
  Pool,
  Vault
} from "../generated/schema"

// helper function import
import { loadOrCreateNoMintPool } from "./utils/Pool"


// Functions only trigger a thegraph when they are called directly, not when called
// within the same contract unless it is marked as external (which this one is not)
export function handleNotifyPools(call: NotifyPoolsCall): void {
  let pools = call.inputs.pools
  for(let i = 0;i<pools.length;i++) {
    let pool_addr = pools[i]
    loadOrCreateNoMintPool(pool_addr, call.block, call.transaction)
  }
}

// We need to listen to this one primarily but two transactions were made
// directly to handleNotifyPools so we catch that one aswell
export function handleNotifyPoolsIncludingProfitShare
(
  call: NotifyPoolsIncludingProfitShareCall
): void {
  let pools = call.inputs.pools
  for(let i = 0;i<pools.length;i++) {
    let pool_addr = pools[i]
    loadOrCreateNoMintPool(pool_addr, call.block, call.transaction)
  }
}
