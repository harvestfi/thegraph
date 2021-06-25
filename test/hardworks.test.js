const axios = require('axios')
const { request } = require('graphql-request')
const vaults = require('./vaults.json').data
const ETHPARSER_URL = 'https://ethparser-api.herokuapp.com/hardwork/pages'
const GRAPH_URL = 'https://api.thegraph.com/subgraphs/name/harvestfi/harvest-finance'

const GRAPHQL_QUERY = `
{
  vault(id: "$vaultId") {
    id

    doHardWorks {
      id
    }
  }
}
`

async function main() {
  for (let vault of vaults.slice(0, 25)) {
    console.log(`testing vault ${vault.contract.address}`)

    const ethparserResponse = await axios.get(ETHPARSER_URL, {
      params: {
        pageSize: 9999999,
        page: 0,
        vault: vault.contract.address
      }
    })

    let ethparserData = ethparserResponse.data.data.data
    let ethparserCount = ethparserData ? ethparserData.length : 0

    let graphQuery = GRAPHQL_QUERY.replace('$vaultId', vault.contract.address)
    let graphResponse = await request(GRAPH_URL, graphQuery)
    let graphData = graphResponse.vault ? graphResponse.vault.doHardWorks : []
    let graphCount = graphData.length

    console.log(`DoHardWorks on ethparser: ${ethparserCount}`)
    console.log(`DoHardWorks on thegraph: ${graphCount}`)
    console.log('')
  }
}

main()
