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

// export function handleApproval(event: Approval): void {
//   // Entities can be loaded from the store using a string ID; this ID
//   // needs to be unique across all entities of the same type
//   let entity = ExampleEntity.load(event.transaction.from.toHex())
//
//   // Entities only exist after they have been saved to the store;
//   // `null` checks allow to create entities on demand
//   if (entity == null) {
//     entity = new ExampleEntity(event.transaction.from.toHex())
//
//     // Entity fields can be set using simple assignments
//     entity.count = BigInt.fromI32(0)
//   }
//
//   // BigInt and BigDecimal math are supported
//   entity.count = entity.count + BigInt.fromI32(1)
//
//   // Entity fields can be set based on event parameters
//   entity.owner = event.params.owner
//   entity.spender = event.params.spender
//
//   // Entities can be written to the store with `.save()`
//   entity.save()
//
//   // Note: If a handler doesn't require existing field values, it is faster
//   // _not_ to load the entity from the store. Instead, create it fresh with
//   // `new Entity(...)`, set the fields that should be updated and save the
//   // entity back to the store. Fields that were not set or unset remain
//   // unchanged, allowing for partial updates to be applied.
//
//   // It is also possible to access smart contracts from mappings. For
//   // example, the contract that has emitted the event can be connected to
//   // with:
//   //
//   // let contract = Contract.bind(event.address)
//   //
//   // The following functions can then be called on this contract to access
//   // state variables and other data:
//   //
//   // - contract.allowance(...)
//   // - contract.approve(...)
//   // - contract.availableToInvestOut(...)
//   // - contract.balanceOf(...)
//   // - contract.canUpdateStrategy(...)
//   // - contract.controller(...)
//   // - contract.decimals(...)
//   // - contract.decreaseAllowance(...)
//   // - contract.futureStrategy(...)
//   // - contract.getPricePerFullShare(...)
//   // - contract.governance(...)
//   // - contract.increaseAllowance(...)
//   // - contract.name(...)
//   // - contract.nextImplementation(...)
//   // - contract.nextImplementationDelay(...)
//   // - contract.nextImplementationTimestamp(...)
//   // - contract.shouldUpgrade(...)
//   // - contract.strategy(...)
//   // - contract.strategyTimeLock(...)
//   // - contract.strategyUpdateTime(...)
//   // - contract.symbol(...)
//   // - contract.totalSupply(...)
//   // - contract.transfer(...)
//   // - contract.transferFrom(...)
//   // - contract.underlying(...)
//   // - contract.underlyingBalanceInVault(...)
//   // - contract.underlyingBalanceWithInvestment(...)
//   // - contract.underlyingBalanceWithInvestmentForHolder(...)
//   // - contract.underlyingUnit(...)
//   // - contract.vaultFractionToInvestDenominator(...)
//   // - contract.vaultFractionToInvestNumerator(...)
// }


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
    // strategy = new Strategy(strategy_addr.toHex())
    // strategy.reg_block = event.block.number
    // strategy.reg_timestamp = event.block.timestamp
    // strategy.vault = vault.id
    // strategy.save()
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
    // new_strategy = new Strategy(event.params.newStrategy.toHex())
    // new_strategy.reg_block = event.block.number
    // new_strategy.reg_timestamp = event.block.timestamp
    // new_strategy.vault = vault.id
    // new_strategy.save()
  }
  vault.curr_strategy = strategy.id
  vault.save()
}

// export function handleInvest(event: Invest): void {}

// export function handleStrategyAnnounced(event: StrategyAnnounced): void {}
//
// export function handleStrategyChanged(event: StrategyChanged): void {}
//
// export function handleTransfer(event: Transfer): void {}
