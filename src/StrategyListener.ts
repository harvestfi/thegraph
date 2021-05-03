import { log, BigInt, Address, ethereum } from '@graphprotocol/graph-ts'

// contract imports
import {
  ProfitAndBuybackLog as ProfitAndBuybackLogEvent,
  ProfitLogInReward as ProfitLogInRewardEvent,
  DoHardWorkCall,
  StrategyContract
} from "../generated/templates/StrategyListener/StrategyContract"

import {
  VaultContract
} from "../generated/templates/VaultListener/VaultContract"

// schema imports
import {
  ProfitLog,
  Strategy,
  Vault
} from "../generated/schema"

// helper function import
import { loadOrCreateTransaction } from "./utils/Transaction"

export function handleProfitAndBuybackLog(event: ProfitAndBuybackLogEvent): void{
  let transaction_hash = event.transaction.hash.toHex()
  let profit_amount = event.params.profitAmount
  let fee_amount = event.params.feeAmount

  let strategy_addr = event.address
  let strategy = Strategy.load(strategy_addr.toHex())

  strategy.aggregatedProfit = strategy.aggregatedProfit + profit_amount
  strategy.aggregatedFee = strategy.aggregatedFee + fee_amount
  strategy.save()

  let profit_log = new ProfitLog(transaction_hash)

  profit_log.type = "ProfitAndBuybackLog"
  profit_log.doHardWork = transaction_hash
  profit_log.profitAmount = profit_amount
  profit_log.feeAmount = fee_amount
  profit_log.save()
}


export function handleProfitLogInReward(event: ProfitLogInRewardEvent): void{
  let transaction_hash = event.transaction.hash.toHex()
  let profit_amount = event.params.profitAmount
  let fee_amount = event.params.feeAmount

  let strategy_addr = event.address
  let strategy = Strategy.load(strategy_addr.toHex())

  strategy.aggregatedProfit = strategy.aggregatedProfit + profit_amount
  strategy.aggregatedFee = strategy.aggregatedFee + fee_amount
  strategy.save()

  let profit_log = new ProfitLog(transaction_hash)

  profit_log.type = "ProfitLogInReward"
  profit_log.doHardWork = transaction_hash
  profit_log.profitAmount = profit_amount
  profit_log.feeAmount = fee_amount
  profit_log.save()
}
