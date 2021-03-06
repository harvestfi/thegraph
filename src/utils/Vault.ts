import { Address, ethereum } from '@graphprotocol/graph-ts'

// subgraph templates
import { VaultListener } from '../../generated/templates'

// contract imports
import { VaultContract } from "../../generated/ControllerListener/VaultContract"

// schema imports
import { Vault, Strategy, NewUniVault } from "../../generated/schema"

// helper function import
import { createStrategy } from "./Strategy"
import { loadOrCreateERC20DetailedToken } from "./Token"
import { loadOrCreateTransaction } from "./Transaction"

export function createVaultAndStrategy
(
  vault_addr: Address,
  strategy_addr: Address,
  eth_block: ethereum.Block,
  eth_transaction: ethereum.Transaction
): void
{
  let vault_contract = VaultContract.bind(vault_addr)
  let underlying_addr_call = vault_contract.try_underlying()

  if (underlying_addr_call.reverted) {
    let newUniVault = new NewUniVault(vault_addr.toHex())
    newUniVault.save()
  } else {
    let underlying_token = loadOrCreateERC20DetailedToken(<Address> underlying_addr_call.value)
    let f_token = loadOrCreateERC20DetailedToken(vault_addr)

    let transaction = loadOrCreateTransaction(eth_transaction, eth_block)

    let vault = new Vault(vault_addr.toHex())
    vault.timestamp = transaction.timestamp
    vault.transaction = transaction.id
    vault.underlying = underlying_token.id
    vault.fToken = f_token.id

    // strategy cannot exist yet because it is unique to a vault and the only way
    // for the enitity to be created is by getting here or the vault was already
    // being listened to, which means the vault already exist so we wouldnt be here
    let strategy = createStrategy(strategy_addr, vault_addr, eth_block, eth_transaction)

    vault.currStrategy = strategy.id

    vault.save()

    VaultListener.create(vault_addr)
  }
}
