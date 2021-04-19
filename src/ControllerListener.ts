import { log, BigInt, Address } from '@graphprotocol/graph-ts'

// subgraph templates
import { VaultListener } from '../generated/templates'

// contract imports
import { AddVaultAndStrategyCall } from "../generated/ControllerListener/ControllerContract"
import { ERC20DetailedContract } from "../generated/ControllerListener/ERC20DetailedContract"
import { VaultContract } from "../generated/ControllerListener/VaultContract"

// schema imports
import {
  Vault,
  Strategy,
  Token
} from "../generated/schema"


export function handleAddVaultAndStrategy(call: AddVaultAndStrategyCall): void {
  let vault_addr = call.inputs._vault
  let strategy_addr = call.inputs._strategy

  // reverted transactions will not trigger call handelers (no need to check)
  // we leave it for now just incase and can verify at a different point
  if (BigInt.fromUnsignedBytes(vault_addr) != BigInt.fromI32(0) &&
      BigInt.fromUnsignedBytes(strategy_addr) != BigInt.fromI32(0)){

    let vault_contract = VaultContract.bind(vault_addr)
    let vault = Vault.load(vault_addr.toHex())
    if (vault == null) {

      let underlying_addr = vault_contract.underlying()

      let underlying_token = loadOrCreateERC20DetailedToken(underlying_addr)
      let f_token = loadOrCreateERC20DetailedToken(vault_addr)


      vault = new Vault(vault_addr.toHex())
      vault.reg_block = call.block.number
      vault.reg_timestamp = call.block.timestamp
      vault.underlying = underlying_token.id
      vault.f_token = f_token.id

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
    // we log this incase calls do end up being called when transaction is reverted
    // although this should never happen according to thegraph discord people
    log.warning('handleAddVaultAndStrategy called with invalid fields. Transaction id: {}', [
        call.transaction.hash.toHex(),
      ])
  }
}

function loadOrCreateERC20DetailedToken(token_address: Address): Token{
  let token_contract = ERC20DetailedContract.bind(token_address)
  let token = Token.load(token_address.toHex())
  if (token == null){
    token = new Token(token_address.toHex())
    token.name = token_contract.name()
    token.symbol = token_contract.symbol()
    token.decimals = token_contract.decimals()
    token.save()
  }
  // we can cast it as token becaus we either create it or load it
  // so reciever is guaranteed a token object
  return token as Token
}
