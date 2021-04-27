import { log  } from '@graphprotocol/graph-ts'

// contract imports
import {
  VaultContract,
  Withdraw  as WithdrawEvent,
  Deposit   as DepositEvent,
  StrategyAnnounced as StrategyAnnouncedEvent,
  StrategyChanged as StrategyChangedEvent,
} from "../generated/templates/VaultListener/VaultContract"

// schema imports
import {
  Vault,
  User,
  Withdrawal,
  Deposit,
  Strategy
} from "../generated/schema"

// helper function import
import { createStrategy } from "./utils/Strategy"


export function handleWithdraw(event: WithdrawEvent): void {
  //let vault_contract = VaultContract.bind(event.address)

  // the vault is guaranteed to exist at this point
  let vault = Vault.load(event.address.toHex())

  let user = User.load(event.params.beneficiary.toHex())
  if (user == null) {
    user = new User(event.params.beneficiary.toHex())
    user.save()
  }

  let withdrawal = new Withdrawal(event.transaction.hash.toHex())
  withdrawal.timestamp = event.block.timestamp
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

  let deposit = new Deposit(event.transaction.hash.toHex())
  deposit.timestamp = event.block.timestamp
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

    strategy = createStrategy(strategy_addr, vault_addr, event.block)

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

    strategy = createStrategy(strategy_addr, vault_addr, event.block)

  }
  vault.currStrategy = strategy.id
  vault.save()
}
