import { log  } from '@graphprotocol/graph-ts'

// contract imports
import {
  VaultContract,
  Withdraw  as WithdrawEvent,
  Deposit   as DepositEvent,
  StrategyAnnounced as StrategyAnnouncedEvent,
  StrategyChanged as StrategyChangedEvent,
  DoHardWorkCall,
} from "../generated/templates/VaultListener/VaultContract"

// schema imports
import {
  Vault,
  User,
  Withdrawal,
  Deposit,
  Strategy,
  Transaction,
  DoHardWork
} from "../generated/schema"

// helper function import
import { createStrategy } from "./utils/Strategy"
import { loadOrCreateTransaction } from "./utils/Transaction"


export function handleWithdraw(event: WithdrawEvent): void {
  //let vault_contract = VaultContract.bind(event.address)

  // the vault is guaranteed to exist at this point
  let vault = Vault.load(event.address.toHex())

  let user = User.load(event.params.beneficiary.toHex())
  if (user == null) {
    user = new User(event.params.beneficiary.toHex())
    user.save()
  }

  let transaction = loadOrCreateTransaction(event.transaction, event.block)

  let withdrawal = new Withdrawal(event.transaction.hash.toHex())
  withdrawal.timestamp = transaction.timestamp
  withdrawal.transaction = transaction.id
  withdrawal.vault  = vault.id
  withdrawal.user   = user.id
  withdrawal.amount = event.params.amount
  withdrawal.save()
}

export function handleDeposit(event: DepositEvent): void {
  // the vault is guaranteed to exist at this point
  let vault = Vault.load(event.address.toHex())

  let user = User.load(event.params.beneficiary.toHex())
  if (user == null) {
    user = new User(event.params.beneficiary.toHex())
    user.save()
  }

  let transaction = loadOrCreateTransaction(event.transaction, event.block)

  let deposit = new Deposit(event.transaction.hash.toHex())
  deposit.timestamp = transaction.timestamp
  deposit.transaction = transaction.id
  deposit.vault  = vault.id
  deposit.user   = user.id
  deposit.amount = event.params.amount
  deposit.save()
}

export function handleStrategyAnnounced(event: StrategyAnnouncedEvent): void {
  let vault_addr = event.address
  let strategy_addr = event.params.newStrategy
  // the vault is guaranteed to exist at this point
  let vault = Vault.load(vault_addr.toHex())

  let strategy = Strategy.load(strategy_addr.toHex())
  if (strategy == null){

    strategy = createStrategy(strategy_addr, vault_addr, event.block, event.transaction)

  }
}

export function handleStrategyChanged(event: StrategyChangedEvent): void {
  let vault_addr = event.address
  let strategy_addr = event.params.newStrategy
  // the vault is guaranteed to exist at this point
  let vault = Vault.load(vault_addr.toHex())
  // strategy should exist because it has been created by StrategyAnnounced (not true see down)
  let strategy = Strategy.load(strategy_addr.toHex())
  if (strategy == null) {
    // should be impossible to reach
    // edit: turns out it isn't. Special cases exist where the strategy has not
    // been initialized yet and is set to addr 0. In this special case
    // handle strategyChangedEvent can be emitted without a prior StrategyAnnounced
    // event. So we need to account for this here. Example of such a transaction:
    // https://etherscan.io/tx/0x4e335f00636cebba15760e50b0329f57418ebd59e7647708b80a88f7b43cc67b#eventlog
    log.warning('New strategy doesn\'t exist yet event though it should? {}', [
        event.transaction.hash.toHex(),
      ])

    strategy = createStrategy(strategy_addr, vault_addr, event.block, event.transaction)

  }
  vault.currStrategy = strategy.id
  vault.save()
}


export function handleDoHardWorkCall(call: DoHardWorkCall): void {

  let vault_addr = call.to
  let vault_contract = VaultContract.bind(vault_addr)
  let vault = Vault.load(vault_addr.toHex())
  if (vault == null ){
    // we are listening to the vault so it has to exist
    log.error('Vault didnt exist in DoHardWorkCall should be impossible {}', [
          call.transaction.hash.toHex(),
        ])
  }

  let strategy_addr = vault_contract.strategy()
  let strategy = Strategy.load(strategy_addr.toHex())
  if (strategy == null ){
    // you'd expect the strategy to already exist due to the handleStrategyAnnounced
    // however probably due to legacy stuff this isn't guaranteed so we need
    // to create it here in some cases :/ similar to strategy changed
    strategy = createStrategy(strategy_addr, vault_addr, call.block, call.transaction)
  }

  let transaction = loadOrCreateTransaction(call.transaction, call.block)

  let doHardWork = new DoHardWork(transaction.id)
  doHardWork.timestamp = transaction.timestamp
  doHardWork.transaction = transaction.id
  doHardWork.vault = vault.id
  doHardWork.strategy = strategy.id
  doHardWork.pricePerFullShare = vault_contract.getPricePerFullShare()
  doHardWork.balanceInVault = vault_contract.underlyingBalanceInVault()
  doHardWork.balanceWithInvestment = vault_contract.underlyingBalanceWithInvestment()

  doHardWork.save()

}
