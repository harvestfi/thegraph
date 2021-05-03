import { Address, ethereum } from '@graphprotocol/graph-ts'

// subgraph templates
import { StrategyListener } from '../../generated/templates'

// schema imports
import { Strategy } from "../../generated/schema"

// helper function import
import { loadOrCreateTransaction } from "./Transaction"

export function createStrategy
(
  strategy_addr: Address,
  vault_addr: Address,
  eth_block: ethereum.Block,
  eth_transaction: ethereum.Transaction
): Strategy
{
  let transaction = loadOrCreateTransaction(eth_transaction, eth_block)

  let strategy = new Strategy(strategy_addr.toHex())
  strategy.timestamp = transaction.timestamp
  strategy.transaction = transaction.id
  strategy.vault = vault_addr.toHex()
  strategy.save()

  StrategyListener.create(strategy_addr)

  return strategy
}
