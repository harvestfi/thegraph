import { Address, log } from '@graphprotocol/graph-ts'

import {  TransferCall  } from '../generated/FARMERC20/ERC20DetailedContract'
import { loadOrCreateNoMintPool } from "./utils/NoMintPool"


export function handleTransfer(call: TransferCall): void {
    let origin = call.from
    let destination = call.inputs.recipient

    if (origin.toString() == "0xf00dd244228f51547f0563e60bca65a30fbf5f7f"){
        loadOrCreateNoMintPool(destination, call.block, call.transaction)
    }
}