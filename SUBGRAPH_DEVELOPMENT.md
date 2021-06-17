## Subgraph Development

The current easiest way that to develop this subgraph is as follows:

1. Clone this repo to your machine and `npm install`
2. Visit https://thegraph.com/ and create a new subgraph titled "Harvest Finance Development $YOUR_NAME". Make sure to set it to "hidden" so that it does not appear in search results
3. If you have not yet used `graph-cli`, run `graph auth https://api.thegraph.com/deploy/ $YOUR_TOKEN` with the token you received from thegraph.com

Now you are ready to make some changes.

When you are ready to deploy your changes, run the following commands:

1. `npm run codegen` (autogenerates code from schema mappings)
2. `npm run build`
3. Deploy to your personal subgraph with:

```sh
graph deploy --node https://api.thegraph.com/deploy/ \
             --ipfs https://api.thegraph.com/ipfs/ \
             $GITHUB_USER/$STAGING_GRAPH_NAME

```

4. You can then visit your personal subgraph's page to verify that your changes are indexing properly.


#### Local node

It is also possible to run these tasks with a local graph node, which removes the dependency on a remote service. This might be beneficial if you are getting errors and need better visibility into why they are occurring.

To run a local node, follow the instructions at [graphprotocol/graph-node](https://github.com/graphprotocol/graph-node). Edit the `docker-compose.yml` to point at a remote Ethereum RPC, **however** it needs to support the trace module. (As of writing: Alchemy does, Infura does not.)

Then, you can run `npm run create-local` and `npm run deploy-local` to deploy your subgraph to your local node.
