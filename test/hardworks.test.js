const axios = require('axios')
const { vaultIds } = require('./shared')
const ETHPARSER_URL = 'https://ethparser-api.herokuapp.com/hardwork/pages'

it ('works properly', async () => {
  const resp = await axios.get(ETHPARSER_URL, {
    params: {
      pageSize: 9999999,
      page: 0,
      vault: vaultIds[1]
    }
  })

  console.log(resp.data.data.data)
})
