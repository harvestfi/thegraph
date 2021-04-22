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

export function handleSharePriceChangeLog(event: SharePriceChangeLogEvent): void{

  let vault_addr = event.params.vault
  let strategy_addr = event.params.strategy
  let number = event.block.number
  let timestamp = event.block.timestamp


  // these only exist if the controllercontract has ben tracked since creation
  let vault = Vault.load(vault_addr.toHex())
  if (vault == null){
    vault = createVaultAndStrategy(vault_addr, strategy_addr, number, timestamp)
    log.warning('Vault didn\' exist yet, should only happen in testing, transaction hash:: {}', [
        event.transaction.hash.toHex(),
      ])
  }

  let strategy = Strategy.load(vault.curr_strategy)
  let old_share_price = event.params.oldSharePrice
  let new_share_price = event.params.newSharePrice

  let do_hard_work = new DoHardWork(event.transaction.hash.toHex())
  do_hard_work.block = number
  do_hard_work.timestamp = timestamp
  do_hard_work.vault = vault.id
  do_hard_work.strategy = strategy.id
  do_hard_work.old_share_price = old_share_price
  do_hard_work.new_share_price = new_share_price
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

      let number = call.block.number
      let timestamp = call.block.timestamp

      vault = createVaultAndStrategy(vault_addr, strategy_addr, number, timestamp)

    }
  } else {
    // we log this incase calls do end up being called when transaction is reverted
    // although this should never happen according to thegraph discord people
    log.warning('handleAddVaultAndStrategy called with invalid fields. Transaction id: {}', [
        call.transaction.hash.toHex(),
      ])
  }
}


function createVaultAndStrategy(
  vault_addr: Address,
  strategy_addr: Address,
  number: BigInt,
  timestamp: BigInt): Vault
{

  let vault_contract = VaultContract.bind(vault_addr)
  let underlying_addr = vault_contract.underlying()

  let underlying_token = loadOrCreateERC20DetailedToken(underlying_addr)
  let f_token = loadOrCreateERC20DetailedToken(vault_addr)

  let vault = new Vault(vault_addr.toHex())
  vault.reg_block = number
  vault.reg_timestamp = timestamp
  vault.underlying = underlying_token.id
  vault.f_token = f_token.id

  // strategy cannot exist yet because it is unique to a vault and the only way
  // for the enitity to be created is by getting here or the vault was already
  // being listened to, which means the vault already exist so we wouldnt be here
  let strategy = new Strategy(strategy_addr.toHex())
  strategy.reg_block = number
  strategy.reg_timestamp = timestamp
  strategy.vault = vault.id

  vault.curr_strategy = strategy.id

  vault.save()
  strategy.save()

  VaultListener.create(vault_addr)
  return vault
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
