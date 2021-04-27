import { log, BigInt, Address } from '@graphprotocol/graph-ts'

// subgraph templates
import { VaultListener } from '../generated/templates'

// contract imports
import {
  AddVaultAndStrategyCall,
  SharePriceChangeLog as SharePriceChangeLogEvent
} from "../generated/ControllerListener/ControllerContract"
import { ERC20DetailedContract } from "../generated/ControllerListener/ERC20DetailedContract"
import { VaultContract } from "../generated/ControllerListener/VaultContract"

// schema imports
import {
  Vault,
  Strategy,
  DoHardWork,
  Token
} from "../generated/schema"

// helper function imports
import{ createVaultAndStrategy } from "./utils/Vault"

export function handleSharePriceChangeLog(event: SharePriceChangeLogEvent): void{

  let vault_addr = event.params.vault
  let strategy_addr = event.params.strategy
  let number = event.block.number
  let timestamp = event.block.timestamp


  // these only exist if the controllercontract has ben tracked since creation
  let vault = Vault.load(vault_addr.toHex())
  if (vault == null){
    vault = createVaultAndStrategy(vault_addr, strategy_addr, event.block)
    log.warning('Vault didn\' exist yet, should only happen in testing, transaction hash:: {}', [
        event.transaction.hash.toHex(),
      ])
  }

  let strategy = Strategy.load(vault.currStrategy)
  let old_share_price = event.params.oldSharePrice
  let new_share_price = event.params.newSharePrice

  let do_hard_work = new DoHardWork(event.transaction.hash.toHex())
  do_hard_work.block = number
  do_hard_work.timestamp = timestamp
  do_hard_work.vault = vault.id
  do_hard_work.strategy = strategy.id
  do_hard_work.oldSharePrice = old_share_price
  do_hard_work.newSharePrice = new_share_price
  do_hard_work.save()

}


export function handleAddVaultAndStrategy(call: AddVaultAndStrategyCall): void {
  let vault_addr = call.inputs._vault
  let strategy_addr = call.inputs._strategy

  // reverted transactions will not trigger call handelers (no need to check)
  // we leave it for now just incase and can verify at a different point
  if (BigInt.fromUnsignedBytes(vault_addr) != BigInt.fromI32(0) &&
      BigInt.fromUnsignedBytes(strategy_addr) != BigInt.fromI32(0)){

    let vault = Vault.load(vault_addr.toHex())
    if (vault == null) {
      vault = createVaultAndStrategy(vault_addr, strategy_addr, call.block)

    }
  } else {
    // we log this incase calls do end up being called when transaction is reverted
    // although this should never happen according to thegraph discord people
    log.warning('handleAddVaultAndStrategy called with invalid fields. Transaction id: {}', [
        call.transaction.hash.toHex(),
      ])
  }
}
