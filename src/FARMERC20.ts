import { Address, log } from '@graphprotocol/graph-ts'

import {  Transfer  } from '../generated/FARMERC20/ERC20DetailedContract'
import { loadOrCreateNoMintPool } from "./utils/NoMintPool"


export function handleTransfer(event: Transfer): void {
    let origin = event.params.from
    let destination = event.params.to

    if (origin.toString() == "0xf00dd244228f51547f0563e60bca65a30fbf5f7f"){
        loadOrCreateNoMintPool(destination, event.block, event.transaction)
    }
}