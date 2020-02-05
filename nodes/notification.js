const CpaasSDK = require('@kandy-io/cpaas-nodejs-sdk')
const fse = require('fs-extra')
const path = require('path')

const FILE_NAME = 'webhooks.json'
const PATH = path.join(__dirname, '/cpaas-node-red-files/', FILE_NAME)

async function ensureFileExists() {
  const fileExists = await fse.pathExists(PATH)

  if (!fileExists) {
    await fse.writeJson(PATH, { default: [] })
  }
}

async function injectWebhook(webhook, destinationAddress) {
  try {
    await ensureFileExists()

    const linkedDestination = destinationAddress || 'default'
    const webhooks = await fse.readJson(PATH)

    if (!webhooks[linkedDestination]) {
      webhooks[linkedDestination] = []
    }

    webhooks[linkedDestination].push(webhook)

    await fse.writeJson(PATH, webhooks)
  } catch (err) {
    console.error(err)
  }
}

async function isWebhookPresent(webhook, destinationAddress) {
  try {
    await ensureFileExists()

    const webhooks = await fse.readJson(PATH)
    const linkedDestination = destinationAddress || 'default'

    if (webhooks[linkedDestination]) {
      for(let i = 0; i < webhooks[linkedDestination].length; i++) {
        if (webhooks[linkedDestination][i] === webhook) {
          return true
        }
      }
    }

    return false

  } catch (err) {
    console.error(err)
  }
}

module.exports = function(RED) {
  function analyzeNotification(config) {
    RED.nodes.createNode(this, config)

    const { credentials } = RED.nodes.getNode(config.creds)
    const { webhook, destinationAddress } = config
    const client = CpaasSDK.createClient(credentials)

    isWebhookPresent(webhook, destinationAddress)
      .then(async isSubscribed => {
        if (!isSubscribed && webhook) {
          try {
            const params = { webhookURL: webhook }

            if (destinationAddress) {
              params.destinationAddress = destinationAddress
            }

            await client.conversation.subscribe(params)

            injectWebhook(webhook, destinationAddress)
          } catch (e) {
            console.error(e)
          }
        }
      }).catch(e => {
        console.error(e)
      })

    this.on('input', async function(msg) {
      const response = client.notification.parse(msg.payload)

      this.send({ ...msg, cpaas_response: response })
    })
  }

  RED.nodes.registerType('Analyze Notification', analyzeNotification)
}
