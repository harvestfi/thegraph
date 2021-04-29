import { ethereum } from '@graphprotocol/graph-ts'
// schema imports
import { Block } from "../../generated/schema"


export function loadOrCreateBlock(eth_block : ethereum.Block): Block{
  let block = Block.load(eth_block.hash.toHex())
  if (block == null) {
    block = new Block(eth_block.hash.toHex())
    block.number = eth_block.number
    block.timestamp = eth_block.timestamp
    block.save()
  }
  return block as Block
}
