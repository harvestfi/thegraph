# Harvest Finance Subgraph
Currently work in progress to implement a subgraph for Harvest Finance


## GraphQL Endpoint

The GraphQL endpoint as provided by [The Graph](https://thegraph.com) can be found here:
https://api.thegraph.com/subgraphs/name/harvestfi/harvest-finance

A great way of testing queries and inspecting the database structure is interactive playground provided by [The Graph](https://thegraph.com) found here: [Harvest The Graph Playground](https://thegraph.com/explorer/subgraph/harvestfi/harvest-finance).

## Usage

Thegraph is build using the GraphQL api for querying information from its datastores.
The main advantage of using GraphQL you only query the information you need. For the construction of such queries, refer to [learn GraphQL](https://graphql.org/learn/) or [advanced GraphQL](https://www.howtographql.com/basics/0-introduction/) for a more complete introduction.

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

These are all fields that can be queried within a vault entity. As an example take `reg_block: BigInt!` which is named reg_block and contains a BigInt, the exclamation mark indicates that the field cannot return null and always exists. The following field `curr_strategy: Strategy!` returns a Strategy entity and has its respective fields that can be queried, these fields can be inspected by looking at the content of the Strategy entity. As you may observe some of the fields objects are enclosed by brackets, these are lists and therefore can return multiple values. As an example `strategies: [Strategy!]!` contain all strategies that were at some point attached to the vault. Although this field has both exclamation marks, it only means that this list exists and if it contains a item it is guaranteed to be a Strategy, but it doesn't guarantee a Strategy will be contained within the list(in short - the list could be empty)

### Query Entry Points
Now to finally construct a query, we first need an 'entry point' into the datastore. By convention two entry points exists for each entity contained within the data store. These are the plural and singular forms, for example `vaults` and `vault` are the respective entry points for the Vault entity and similarly `doHardWorks` and `doHardWork` exist for the DoHardWork entity. These entry points can be seen as query definitions as seen here:

    type Query {
      vault(id: ID!): Vault
      vaults: [Vault!]!
    }

This shows that the return type of a `vault` query will return a single Vault entity and the `vaults` query will return a list of Vault entities. Note that the syntax for the return types is the same as for fields within an entity, such as `strategies: [Strategy!]!` within the Vault entity, which will be relevant soon.

### Query Construction
The following queries can all be executed using the playground [Harvest The Graph Playground](https://thegraph.com/explorer/subgraph/harvestfi/harvest-finance), and I would recommend you to play around with it as you go.

So lets write a first query for retrieving values for a specific vault:

    {
      vault(id: "0x02d77f6925f4ef89ee2c35eb3dd5793f5695356f"){
        id
      }
    }

That's it! This will return the vault with the address of "0x02d77f6925f4ef89ee2c35eb3dd5793f5695356f" and will contain only its id field. If we want to query different fields we simply specify the ones we are interested in. As an example if we are only interested in the block and timestamp it was registered at the controller the following query would suffice:

    {
      vault(id: "0x02d77f6925f4ef89ee2c35eb3dd5793f5695356f"){
        reg_block
        reg_timestamp
      }
    }

As you may have noticed the previous examples only include literal types as fields. So what if you want to query the current strategy of the vault? It is important to remember that `curr_strategy: Strategy!` returns a single Strategy entity within the vault and as such can be queried in the same way. Take the following example:

    {
      vault(id: "0x02d77f6925f4ef89ee2c35eb3dd5793f5695356f"){
        reg_block
        reg_timestamp
        curr_strategy{
          id
          reg_block
          reg_timestamp
        }
      }
    }

This will return the current strategy id reg_block and reg_timestamp nested in the vault you queried.

So know we know how to query single objects, but what if we want to query a list? So let's start with the `vaults: [Vault!]!` query and with the simplest example:

    {
      vaults{
        id
      }
    }

This will simply return 'all' vaults, however a single query is limited to a 100 entities (I believe, don't quote me on that) so it will return a list of 100 vaults with their ids. To control the amount of vaults it will query you can use the following:

    {
      vaults(first: 5){
        id
      }
    }

This will simply return the 'first' 5 vaults, be aware that first means in terms of their id, not the creation date of the entity or the 'reg_timestamp'. To paginate them and retrieve the following 5 entries use the following syntax:

    {
      vaults(first: 5, skip:5){
        id
      }
    }

However let's say we only want the last 5 vaults that were registered at the controller? We do this using the following query:

    {
      vaults(first: 5, orderBy: reg_timestamp, orderDirection: desc){
        id
        reg_timestamp
      }
    }

This tells the GraphQL 'resolver' we want to order them by the reg_timestamp field and order them from high to low. Thus giving us the 5 most recent created vaults.

Finally let's say we want to retrieve multiple vaults which meet a specific requirement on given field. As an example we want to find all vaults that were created after a specific timestamp:

    {
      vaults(where: {reg_timestamp_gt: 1617040411} , orderBy: reg_timestamp, orderDirection: desc){
        id
        reg_timestamp
      }
    }

This introduces the `where` syntax, the `reg_timestamp_gt` means that it matches all fields where `reg_timestamp` is `_gt` **g**reater **t**han the given value. The available suffixes can be found here [The Graph - Docs - Filtering](https://thegraph.com/docs/graphql-api#filtering).

Note that the previous couple of queries all operate on a list of items, more specifically `vautls: [Vault!]!`. Hopefully you made the connection that these queries can therefore also operate on fields within a entity which are lists. To illustrate this take the following example:

    {
      vault(id: "0x02d77f6925f4ef89ee2c35eb3dd5793f5695356f"){
        reg_block
        reg_timestamp
        strategies(first: 5, orderBy: reg_timestamp, orderDirection: desc){
          id
          reg_block
          reg_timestamp
        }
      }
    }

This use the strategies field in a vault entity to find the 5 latest created strategies that were at some point attached to the vault. As you can see, these operations can be done on any list type.


### Query Examples
Here a couple of examples will be given to hopefully show the use cases and make the previous information come full circle.

We are going to take two separate approaches to query the 10 most recent DoHardWorks for a specific vault. The first example will use the `vault` entry point as seen here:

    {
      vault(id: "0x02d77f6925f4ef89ee2c35eb3dd5793f5695356f"){
        do_hard_works(first: 10, orderBy: reg_timestamp, orderDirection: desc){
          old_share_price
          new_share_price
        }
      }
    }

This will return a vault object with a nested do_hard_works list which contains the old and new share prices for the last 10 DoHardWorks.

The second approach uses the `doHardWorks` entry point as seen here:

    {
      doHardWorks(where: {vault: "0x02d77f6925f4ef89ee2c35eb3dd5793f5695356f"}, first: 10, orderBy: timestamp, orderDirection: desc){
        old_share_price
        new_share_price
      }
    }

This will return a doHardWorks object containing a list of [old_share_price, new_share_price]. To inspect the exact structure I would recommend filling in these queries in the [Harvest The Graph Playground](https://thegraph.com/explorer/subgraph/harvestfi/harvest-finance) and inspecting the returns.

### Query Execution
To actually query a GraphQL endpoint several libraries exist, such as:
 - [Apollo](https://www.apollographql.com/) - React
 - [Graphene](https://graphene-python.org/) - Python

These libraries abstract away sending raw requests to the GraphQL endpoint. However, as an example a couple `curl` commands are included to understand what is happening under the hood:

    # retrieves 100 vault ids
    curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"query": "{ vaults{ id } }"}' \
    https://api.thegraph.com/subgraphs/name/harvestfi/harvest-finance

The queries previously constructed are placed inside of the query object. However, the enters all have to be removed and strings such as the id of a vault have to be escaped. In essence you send the actual query in a string format to the GraphQL endpoint. For example:

    curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"query": "{ vault(id: \"0xf0358e8c3cd5fa238a29301d0bea3d63a17bedbe\" ){ id deposits(first: 5, orderBy: timestamp, orderDirection: desc){ id timestamp user{ id } amount } } }"}' \
    https://api.thegraph.com/subgraphs/name/harvestfi/harvest-finance

The previous curl is equivalent to following query, which is the same thing but with all enters removed, and note that the string id has to be escaped as such: `/"0xf0358e8c3cd5fa238a29301d0bea3d63a17bedbe/"`

    vault(id:"0xf0358e8c3cd5fa238a29301d0bea3d63a17bedbe"){
     id
     deposits(first: 5, orderBy: timestamp, orderDirection: desc){
       id
       timestamp
       user{
         id
       }
       amount
     }
    }

As you can see the construction of raw requests can be somewhat cumbersome, especially if you want to make them generic over variables.
