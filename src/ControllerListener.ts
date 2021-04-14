import { VaultListener } from '../generated/templates'

import { AddVaultAndStrategyCall } from "../generated/ControllerListener/Controller.ts"


export function handleAddVaultAndStrategy(call: AddVaultAndStrategyCall): void {
  VaultListener.create(call.inputs._vault)
}
