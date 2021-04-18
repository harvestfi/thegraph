import { log, BigInt } from '@graphprotocol/graph-ts'

// subgraph templates
import { VaultListener } from '../generated/templates'

// contract imports
import { AddVaultAndStrategyCall } from "../generated/ControllerListener/Controller"

// schema imports
import {
  Vault,
  Strategy
} from "../generated/schema"


export function handleAddVaultAndStrategy(call: AddVaultAndStrategyCall): void {
  let vault_addr = call.inputs._vault
  let strategy_addr = call.inputs._strategy

  // reverted transactions will not trigger call handelers (no need to check)
  // we leave it for now just incase and can verify at a different point
  if (BigInt.fromUnsignedBytes(vault_addr) != BigInt.fromI32(0) &&
      BigInt.fromUnsignedBytes(strategy_addr) != BigInt.fromI32(0)){
    let vault = Vault.load(vault_addr.toHex())
    if (vault == null) {
      vault = new Vault(vault_addr.toHex())
      vault.reg_block = call.block.number
      vault.reg_timestamp = call.block.timestamp

      let strategy = new Strategy(strategy_addr.toHex())
      strategy.reg_block = call.block.number
      strategy.reg_timestamp = call.block.timestamp
      strategy.vault = vault.id

      vault.curr_strategy = strategy.id

      vault.save()
      strategy.save()

      VaultListener.create(vault_addr)
    }
  } else {
    log.warning('handleAddVaultAndStrategy called with invalid fields. Transaction id: {}', [
        call.transaction.hash.toHex(),
      ])
  }
}
