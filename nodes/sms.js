const CpaasSDK = require('@kandy-io/cpaas-nodejs-sdk')

module.exports = function(RED) {
  function twofactor(config) {
    RED.nodes.createNode(this, config)

    this.on('input', async function(msg) {
      const { credentials } = RED.nodes.getNode(config.creds)

      const client = CpaasSDK.createClient(credentials)
      console.log(client)
      const requestParams = { ...config, ...msg.payload }
      let response = null
      console.log('requestParams', requestParams)
      try {
        response = await client.conversation.createMessage(requestParams)
        console.log('response', response)
      } catch (e) {
        console.log('e', e)
        response = e
      }

      this.send({ ...msg, cpaas_response: response })
    })
  }

  RED.nodes.registerType('Send SMS', twofactor)
}