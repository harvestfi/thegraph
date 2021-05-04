import { log  } from '@graphprotocol/graph-ts'

// contract imports
import {
  NotifyPoolsCall
} from "../generated/NotifyHelperListener/NotifyHelperContract"

// schema imports
import {
  Pool
} from "../generated/schema"

// helper function import
// import { createStrategy } from "./utils/Strategy"
// import { loadOrCreateTransaction } from "./utils/Transaction"


export function handleNotifyPools(call: NotifyPoolsCall): void {
  let pools = call.inputs.pools
  for(let i = 0;i<pools.length;i++) {
    let pool_addr = pools[i].toHex()
    let pool = Pool.load(pool_addr)
    if (pool == null){
      pool = new Pool(pool_addr)
      pool.save()
    }
  }
}
