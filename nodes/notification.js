const CpaasSDK = require('@kandy-io/cpaas-nodejs-sdk')

const WEBHOOK_KEY = 'cpaas-sdk-subscribed-webhooks'

/*
  Structure of the stored webhooks in context
  {
    clientId: {
      phoneNumber: {
        webhookURL,
        subscriptionId
      }
    },
    ....
    ....
  }

  {
    'ba9ddd86-7732-4724-3d14fc64ee1f': {
      '+1394895029: {
        webhookURL: 'https://mysite.com/webhook-endpoint',
        subscriptionId: '57ef355433-6cb388-4fc64e47'
      }
    },
    ...
    ...
  }

  Note: This node stores the subscription data in order to avoid multiple unnecessary subscription calls on every flow restart.
  It also detects a subscription cancellation and removes it's entry from the context.
*/

module.exports = function(RED) {
  function analyzeNotification(config) {
    RED.nodes.createNode(this, config)

    const context = this.context().global

    const { credentials } = RED.nodes.getNode(config.creds)
    const { clientId } = credentials
    const client = CpaasSDK.createClient(credentials)

    const destinationAddress = config.destinationAddress.trim()
    const webhookURL = config.webhook.trim()
    const storageType = config.storage.trim()
    const isDefaultStorage = !storageType || storageType === 'default'

    function getWebhooks() {
      const hooks = isDefaultStorage ? context.get(WEBHOOK_KEY) : context.get(WEBHOOK_KEY, storageType)

      return { ...hooks }
    }

    function setWebhooks(data) {
      isDefaultStorage ? context.set(WEBHOOK_KEY, data) : context.set(WEBHOOK_KEY, data, storageType)
    }

    const webhooks = getWebhooks()
    const { webhookURL: registeredWebhook } = (webhooks[clientId] && webhooks[clientId][destinationAddress]) || {}
    const isWebhookRegistered = registeredWebhook === webhookURL

    function registerWebhook({ subscriptionId }) {
      if (!webhooks[clientId]) {
        webhooks[clientId] = {}
      }

      webhooks[clientId][destinationAddress] = {
        webhookURL,
        subscriptionId
      }

      setWebhooks(webhooks)
    }

    function deregisterWebhook(subscriptionId) {
      const registeredWebhooks = getWebhooks()

      const number = Object.keys(registeredWebhooks[clientId]).find(phoneNumber =>
        registeredWebhooks[clientId][phoneNumber].subscriptionId === subscriptionId
      )

      delete registeredWebhooks[clientId][number]

      setWebhooks(registeredWebhooks)
    }

    if (!isWebhookRegistered) {
      client.conversation.subscribe({ webhookURL, destinationAddress })
        .then(registerWebhook)
        .error(e => {
          this.error(`Failed to subscribe webhook endpoint: ${webhook}`, e)
          console.error(e)
        })
    }

    this.on('input', function(msg) {
      const response = client.notification.parse(msg.payload)
      const { type, subscriptionId } = response

      if (type === 'subscriptionCancel') {
        deregisterWebhook(subscriptionId)
      }

      this.send({ ...msg, cpaas_response: response })
    })
  }

  RED.nodes.registerType('Analyze Notification', analyzeNotification)
}
