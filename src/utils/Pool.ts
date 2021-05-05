import { BigInt, Address, ethereum } from '@graphprotocol/graph-ts'

// contract imports
import {
  PoolContract
} from "../../generated/NotifyHelperListener/PoolContract"

// schema imports
import {
  Pool,
  Vault
} from "../../generated/schema"

// helper function import
import { loadOrCreateERC20DetailedToken } from "./Token"
import { loadOrCreateTransaction } from "./Transaction"

export function loadOrCreateNoMintPool
(
  pool_addr: Address,
  eth_block: ethereum.Block,
  eth_transaction: ethereum.Transaction
): Pool
{
  let pool = Pool.load(pool_addr.toHex())
  if (pool == null){
    let transaction = loadOrCreateTransaction(eth_transaction, eth_block)

    let pool_contract = PoolContract.bind(pool_addr)
    let vault_addr = pool_contract.lpToken()
    //let lp_token = loadOrCreateERC20DetailedToken(lp_token_addr)

    let reward_token_addr = pool_contract.rewardToken()
    let reward_token = loadOrCreateERC20DetailedToken(reward_token_addr)

    // let vault_addr = pool_contract.sourceVault()


    pool = new Pool(pool_addr.toHex())
    pool.timestamp = transaction.timestamp
    pool.transaction = transaction.id
    // some specific pools don't have a vault farm/weth farm/grain farm/usdc
    // and we don't load it first incase NotifyHelper gets called before vault
    // is registered at the controller (not the most elegant solution)
    pool.vault = vault_addr.toHex()
    // pool.lpToken = lp_token.id
    pool.rewardToken = reward_token.id
    pool.save()

    let vault = Vault.load(vault_addr.toHex())
    if ( vault != null){
      // if the vault already exists we set the currPool to the found pool
      // we aren't guaranteed that the pool is rewarded before the vault
      // is registered at the controller (although probably never happens)
      vault.currPool = pool.id
      vault.save()
    }
  }
  return pool as Pool
}
