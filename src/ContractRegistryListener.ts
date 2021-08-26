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
} from "../generated/schema"

import { store } from '@graphprotocol/graph-ts'

function addAddresses(addresses: Address[], contractType: string = ''): void {
  for (let i=0; i<addresses.length; i++) {
    let address = addresses[i]
    let contractRegistryAddress = new ContractRegistryAddress(address.toString())
    contractRegistryAddress.address = address;
    if (contractType) contractRegistryAddress.contractType = contractType;
    contractRegistryAddress.save()
  }
}
function removeAddresses(addresses: Address[]): void {
  for (let i=0; i<addresses.length; i++) {
    let address = addresses[i]
    store.remove('ContractRegistryAddress', address.toString())
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
