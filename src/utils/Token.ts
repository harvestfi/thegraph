import { Address } from '@graphprotocol/graph-ts'
// contract imports
import { ERC20DetailedContract } from "../../generated/NotifyHelperListener/ERC20DetailedContract"
// schema imports
import { Token } from "../../generated/schema"


export function loadOrCreateERC20DetailedToken(token_address: Address): Token{
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
