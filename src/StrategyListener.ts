import { log, BigInt, Address, ethereum } from '@graphprotocol/graph-ts'

// contract imports
import {
  ProfitAndBuybackLog as ProfitAndBuybackLogEvent,
  DoHardWorkCall,
  StrategyContract
} from "../generated/templates/StrategyListener/StrategyContract"

import {
  VaultContract
} from "../generated/templates/VaultListener/VaultContract"

// schema imports
import {
  Vault,
  Strategy,
  DoHardWork
} from "../generated/schema"

// helper function import
import { loadOrCreateTransaction } from "./utils/Transaction"

export function handleProfitAndBuybackLog(event: ProfitAndBuybackLogEvent): void{
  let strategy_addr = event.address
  let profit_amount = event.params.profitAmount
  let fee_amount = event.params.feeAmount
  let timestamp = event.block.timestamp


}
