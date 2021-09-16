import { Address } from '@graphprotocol/graph-ts'

// contract imports
import {
  AddressesAdded,
  AddressesRemoved,
  PoolsAdded,
  PoolsRemoved,
  VaultsAdded,
  VaultsRemoved

} from "../generated/templates/ContractRegistryListener/ContractRegistry"


// schema imports
import {
  ContractRegistryAddress,
  Pool,
  Vault
} from "../generated/schema"

import { store } from '@graphprotocol/graph-ts'

function addAddresses(addresses: Address[], contractType: string = ''): void {
  for (let i=0; i<addresses.length; i++) {
    let address = addresses[i]
    let hexAddress = address.toHex()
    let ra = new ContractRegistryAddress(hexAddress)
    ra.address = address
    if (contractType) ra.contractType = contractType

    let pool = Pool.load(hexAddress)
    if (pool) ra.pool = pool.id

    let vault = Vault.load(hexAddress)
    if (vault) ra.vault = vault.id

    ra.save()
  }
}
function removeAddresses(addresses: Address[]): void {
  for (let i=0; i<addresses.length; i++) {
    let address = addresses[i]
    store.remove('ContractRegistryAddress', address.toHex())
  }
}

export function handleAddressesAdded(event: AddressesAdded): void {
  let addresses = event.params.addresses
  addAddresses(addresses )
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let addresses = event.params.addresses
  removeAddresses(addresses)
}
export function handlePoolsAdded(event: PoolsAdded): void {
  let addresses = event.params.addresses
  addAddresses(addresses, 'Pool')
}

export function handlePoolsRemoved(event: PoolsRemoved): void {
  let addresses = event.params.addresses
  removeAddresses(addresses)
}
export function handleVaultsAdded(event: VaultsAdded): void {
  let addresses = event.params.addresses
  addAddresses(addresses, 'Vault')
}

export function handleVaultsRemoved(event: VaultsRemoved): void {
  let addresses = event.params.addresses
  removeAddresses(addresses)
}
