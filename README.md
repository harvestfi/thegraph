# Harvest Finance Subgraph
Currently work in progress to implement a subgraph for Harvest Finance


## GraphQL Endpoint

The GraphQL endpoint as provided by [The Graph](https://thegraph.com) can be found here:
https://api.thegraph.com/subgraphs/name/harvestfi/harvest-finance

A great way of testing queries and inspecting the database structure is interactive playground provided by [The Graph](https://thegraph.com) found here: [Harvest The Graph Playground](https://thegraph.com/explorer/subgraph/harvestfi/harvest-finance).

## Usage

Thegraph is build using the GraphQL api for querying information from its datastores.
The main advantage of using GraphQL you only query the information you need. For the construction of such queries, refer to [learn GraphQL](https://graphql.org/learn/).

As a small example let's create a query. First let's evaluate the database structure by using [Harvest The Graph Playground](https://thegraph.com/explorer/subgraph/harvestfi/harvest-finance).

### Schema
Currently the following schema is defined (which will be expanded on in the future, but shouldn't matter for the example):

    Vault
    Strategy
    DoHardWork
    User
    Withdrawal
    Deposit
    Token

These all represent entities which are contained within the data store. Each of these entities has fields which can be queried and can be inspected by clicking on the respective entities.

### Fields
For example a Vault entity contains, as of writing this, the following fields:

    "address of the vault"
    id: ID!

    "block and timestamp on which the vault was registered at the controller"
    reg_block: BigInt!
    reg_timestamp: BigInt!

    "current strategy"
    curr_strategy: Strategy!

    "all strategies"
    strategies: [Strategy!]!

    "token locked up in vault"
    underlying: Token!

    "returned share token"
    f_token: Token!

    "hard work done on vault"
    do_hard_works: [DoHardWork!]!

    withdrawals: [Withdrawal!]!
    deposits: [Deposit!]!

These are all fields that can be queried within a vault entity. As an example take `reg_block: BigInt!` which is named reg_block and contains a BigInt, the exclamation mark indicates that the field cannot return null and always exists. The following field `curr_strategy: Strategy!` returns a Strategy entity and has its respective fields that can be queried, these fields can be inspected by looking at the content of the Strategy entity. As you may observe some of the fields objects are enclosed by brackets, these are lists and therefore can return multiple values. As an example `strategies: [Strategy!]!` contain all strategies that were at some point attached to the vault. Although this field has both exclamation marks, it only means that this list exists and if it contains a Strategy it will be a Strategy, but it doesn't guarantee a Strategy will be contained within the list(in short - the list could be empty)




Some small code snippets to illustrate the using bash:

    # retrieves all vault ids
    curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"query": "{ vaults{ id } }"}' \
    https://api.thegraph.com/subgraphs/name/harvestfi/harvest-finance
