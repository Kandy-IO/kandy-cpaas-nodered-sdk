const CpaasSDK = require('@kandy-io/cpaas-nodejs-sdk')

const WEBHOOK_KEY = 'cpaas-sdk-subscribed-webhooks'

module.exports = function(RED) {
  function analyzeNotification(config) {
    RED.nodes.createNode(this, config)

    const { credentials } = RED.nodes.getNode(config.creds)
    const { webhook, destinationAddress, storage } = config
    const destination = destinationAddress || 'default'
    const context = this.context().global
    const storageType = (storage && storage.trim()) || 'default'
    const hooks = context.get(WEBHOOK_KEY, storageType) || {}
    const isWebhookRegistered = (hooks[destination] || []).some(h => h.includes(webhook))
    const client = CpaasSDK.createClient(credentials)

    function registerWebhook() {
      const hooksList = hooks && (hooks[destination] || [])

      hooksList.push(webhook)

      context.set(WEBHOOK_KEY, {
        ...hooks,
        [destination]: hooksList
      }, storageType)
    }

    if (!isWebhookRegistered) {
      const params = { webhookURL: webhook }

      if (destinationAddress) {
        params.destinationAddress = destinationAddress
      }

      client.conversation.subscribe(params)
        .then(registerWebhook)
        .error(e => {
          this.error(`Failed to subscribe webhook endpoint: ${webhook}`, e)
          console.error(e)
        })
    }

    this.on('input', async function(msg) {
      const response = client.notification.parse(msg.payload)

      this.send({ ...msg, cpaas_response: response })
    })
  }

  RED.nodes.registerType('Analyze Notification', analyzeNotification)
}
