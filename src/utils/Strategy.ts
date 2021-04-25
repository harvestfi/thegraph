import { Address, ethereum } from '@graphprotocol/graph-ts'
// schema imports
import { Strategy } from "../../generated/schema"


export function createStrategy(strategy_addr: Address, vault_addr: Address, block: ethereum.Block): Strategy{
  let strategy = new Strategy(strategy_addr.toHex())
  strategy.reg_block = block.number
  strategy.reg_timestamp = block.timestamp
  strategy.vault = vault_addr.toHex()
  strategy.save()

  return strategy
}
