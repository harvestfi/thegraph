import { Address, ethereum } from '@graphprotocol/graph-ts'

// schema imports
import { Strategy } from "../../generated/schema"

// helper function import
import { loadOrCreateTransaction } from "./Transaction"
import { loadOrCreateBlock } from "./Block"

export function createStrategy
(
  strategy_addr: Address,
  vault_addr: Address,
  eth_block: ethereum.Block,
  eth_transaction: ethereum.Transaction
): Strategy
{
  let block = loadOrCreateBlock(eth_block)
  let transaction = loadOrCreateTransaction(eth_transaction)

  let strategy = new Strategy(strategy_addr.toHex())
  strategy.timestamp = block.timestamp
  strategy.block = block.id
  strategy.transaction = transaction.id
  strategy.vault = vault_addr.toHex()
  strategy.save()

  return strategy
}
