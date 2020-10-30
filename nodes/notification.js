const CpaasSDK = require('@kandy-io/cpaas-nodejs-sdk')

module.exports = function(RED) {
  function analyzeNotification(config) {
    RED.nodes.createNode(this, config)

    const { credentials } = RED.nodes.getNode(config.creds)
    const client = CpaasSDK.createClient(credentials)

    const destinationAddress = config.destinationAddress.trim()
    const webhookURL = config.webhook.trim()

    try {
      client.conversation.subscribe({ webhookURL, destinationAddress })
    } catch (e) {
      console.error(`Failed to subscribe webhook endpoint: ${webhookURL}`, e)
    }

    this.on('input', function(msg) {
      const cpaas_response = client.notification.parse(msg.payload)

      this.send({ ...msg, cpaas_response })
    })
  }

  RED.nodes.registerType('Analyze Notification', analyzeNotification)
}
