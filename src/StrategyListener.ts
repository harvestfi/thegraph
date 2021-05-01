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
import { loadOrCreateBlock } from "./utils/Block"

export function handleProfitAndBuybackLog(event: ProfitAndBuybackLogEvent): void{
  let strategy_addr = event.address
  let profit_amount = event.params.profitAmount
  let fee_amount = event.params.feeAmount
  let timestamp = event.block.timestamp


}

export function handleDoHardWorkCall(call: DoHardWorkCall): void {
  let vault_addr = call.to
  let vault_contract = VaultContract.bind(vault_addr)
  let vault = Vault.load(vault_addr.toHex())
  if (vault == null ){
    // we are listening to a strategy that has to be registered to a vault
    log.error('Vault didnt exist in DoHardWorkCall should be impossible {}', [
          call.transaction.hash.toHex(),
        ])
  }

  let strategy_addr = vault_contract.strategy()
  let strategy_contract = StrategyContract.bind(strategy_addr)
  let strategy = Strategy.load(strategy_addr.toHex())
  if (strategy == null ){
    // we are listening to a strategy so we should know of its existens
    log.error('Strategy didnt exist in DoHardWorkCall should be impossible {}', [
          call.transaction.hash.toHex(),
        ])
  }

  let block = loadOrCreateBlock(call.block)
  let transaction = loadOrCreateTransaction(call.transaction)

  let doHardWork = new DoHardWork(transaction.id)
  doHardWork.timestamp = block.timestamp
  doHardWork.block = block.id
  doHardWork.transaction = transaction.id
  doHardWork.vault = vault.id
  doHardWork.strategy = strategy.id
  doHardWork.pricePerFullShare = vault_contract.getPricePerFullShare()
  doHardWork.balanceInVault = vault_contract.underlyingBalanceInVault()
  doHardWork.balanceWithInvestment = vault_contract.underlyingBalanceWithInvestment()

  doHardWork.save()

}
