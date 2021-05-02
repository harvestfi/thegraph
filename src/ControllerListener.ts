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
  Token,
  SharePriceChangeLog
} from "../generated/schema"

// helper function imports
import{ createVaultAndStrategy } from "./utils/Vault"

export function handleSharePriceChangeLog(event: SharePriceChangeLogEvent): void{
  let transaction_hash = event.transaction.hash.toHex()

  let share_price_change_log = new SharePriceChangeLog(transaction_hash)
  share_price_change_log.doHardWork = transaction_hash
  share_price_change_log.oldSharePrice = event.params.oldSharePrice
  share_price_change_log.newSharePrice = event.params.newSharePrice

  share_price_change_log.save()
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
      vault = createVaultAndStrategy(vault_addr, strategy_addr, call.block, call.transaction)

    }
  } else {
    // we log this incase calls do end up being called when transaction is reverted
    // although this should never happen according to thegraph discord people
    log.warning('handleAddVaultAndStrategy called with invalid fields. Transaction id: {}', [
        call.transaction.hash.toHex(),
      ])
  }
}
