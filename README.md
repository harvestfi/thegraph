# Harvest Finance Subgraph
Currently work in progress to implement a subgraph for Harvest Finance


### GraphQL Endpoint

The GraphQL endpoint as provided by [The Graph](https://thegraph.com) can be found here:
https://api.thegraph.com/subgraphs/name/harvestfi/harvest-finance

A great way of testing queries and inspecting the database structure is interactive playground provided by [The Graph](https://thegraph.com) found here: [Harvest The Graph Playground](https://thegraph.com/explorer/subgraph/harvestfi/harvest-finance).

## Usage

Thegraph is build using the GraphQL api for querying information from its datastores.
The main advantage of using GraphQL you only query the information you need. For the construction of such queries, refer to [learn GraphQL](https://graphql.org/learn/).

As a small example let's create a query. First let's evaluate the database structure by using [Harvest The Graph Playground](https://thegraph.com/explorer/subgraph/harvestfi/harvest-finance).
Currently the following schema is defined (which will be expanded on in the future, but shouldn't matter for the example):

    Vault
    Strategy
    User
    Withdrawal
    Deposit
    Token

These all represent entities which are contained within the data store. Each of these entities has fields which can be queried.
For example a Vault entity contains, as of writing this, the following fields:



Some small code snippets to illustrate the using bash:

    # retrieves all vault ids
    curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"query": "{ vaults{ id } }"}' \
    https://api.thegraph.com/subgraphs/name/harvestfi/harvest-finance
