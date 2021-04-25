import { Address, ethereum } from '@graphprotocol/graph-ts'

// subgraph templates
import { VaultListener } from '../../generated/templates'

// contract imports
import { VaultContract } from "../../generated/ControllerListener/VaultContract"

// schema imports
import { Vault, Strategy } from "../../generated/schema"

// helper function import
import { createStrategy } from "./Strategy"
import { loadOrCreateERC20DetailedToken } from "./Token"

export function createVaultAndStrategy( vault_addr: Address, strategy_addr: Address, block: ethereum.Block ): Vault
{
  let vault_contract = VaultContract.bind(vault_addr)
  let underlying_addr = vault_contract.underlying()

  let underlying_token = loadOrCreateERC20DetailedToken(underlying_addr)
  let f_token = loadOrCreateERC20DetailedToken(vault_addr)

  let vault = new Vault(vault_addr.toHex())
  vault.reg_block = block.number
  vault.reg_timestamp = block.timestamp
  vault.underlying = underlying_token.id
  vault.f_token = f_token.id

  // strategy cannot exist yet because it is unique to a vault and the only way
  // for the enitity to be created is by getting here or the vault was already
  // being listened to, which means the vault already exist so we wouldnt be here
  let strategy = createStrategy(strategy_addr, vault_addr, block)

  vault.curr_strategy = strategy.id

  vault.save()

  VaultListener.create(vault_addr)
  return vault
}
