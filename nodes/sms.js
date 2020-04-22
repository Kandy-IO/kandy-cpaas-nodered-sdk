const CpaasSDK = require('@kandy-io/cpaas-nodejs-sdk')

module.exports = function(RED) {
  function twofactor(config) {
    RED.nodes.createNode(this, config)

    const { credentials } = RED.nodes.getNode(config.creds)
    const client = CpaasSDK.createClient(credentials)

    this.on('input', async function(msg) {
      const { destinationAddress, senderAddress, message } = { ...config, ...msg.payload }
      const requestParams = {
        destinationAddress,
        senderAddress: senderAddress.trim() || 'default',
        message
      }
      let response = null

      try {
        response = await client.conversation.createMessage(requestParams)
      } catch (e) {
        response = e
      }

      this.send({ ...msg, cpaas_response: response })
    })
  }

  RED.nodes.registerType('Send SMS', twofactor)
}