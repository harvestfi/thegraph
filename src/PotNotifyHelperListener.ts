import { log  } from '@graphprotocol/graph-ts'

// contract imports
import {
  NotifyPoolsCall
} from "../generated/PotNotifyHelperListener/PotNotifyHelperContract"

// helper function import
import { loadOrCreatePotPool } from "./utils/PotPool"


//This is the only one used for the potpool notifyhelper
export function handlePotNotifyPools(call: NotifyPoolsCall): void {
  let pools = call.inputs.pools
  for(let i = 0;i<pools.length;i++) {
    let pool_addr = pools[i]
    loadOrCreatePotPool(pool_addr, call.block, call.transaction)
  }
}
