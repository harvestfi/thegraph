import { log, BigInt, Address, ethereum } from '@graphprotocol/graph-ts'
// import { Block } from '@graphprotocol/graph-ts/chain/ethereum'

// contract imports
import {
  ProfitAndBuybackLog as ProfitAndBuybackLogEvent
} from "../generated/templates/StrategyListener/StrategyContract"


// schema imports
import {
  Strategy
} from "../generated/schema"

export function handleProfitAndBuybackLog(event: ProfitAndBuybackLogEvent): void{
  let strategy_addr = event.address
  let profit_amount = event.params.profitAmount
  let fee_amount = event.params.feeAmount
  let timestamp = event.block.timestamp


}
