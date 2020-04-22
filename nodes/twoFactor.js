const CpaasSDK = require('@kandy-io/cpaas-nodejs-sdk')

module.exports = function(RED) {
  function twofactor(config) {
    RED.nodes.createNode(this, config)

    const { credentials } = RED.nodes.getNode(config.creds)
    const client = CpaasSDK.createClient(credentials)

    this.on('input', async function(msg) {
      const {
        operationType,
        destinationAddress,
        message,
        method,
        subject,
        length,
        expiry,
        format,
        codeId,
        verificationCode
      } = { ...config, ...msg.payload }
      let requestParams = {}

      if (operationType === 'send' || operationType === 'resend') {
        requestParams = {
          destinationAddress,
          message,
          method,
          length,
          expiry,
          type: format
        }

        if (method === 'email') {
          requestParams.subject = subject
        }

        if (operationType === 'resend') {
          requestParams.codeId = codeId
        }
      } else if (operationType === 'verify') {
        requestParams = { codeId, verificationCode }
      } else if (operationType === 'delete') {
        requestParams = { codeId }
      }

      let response = null

      try {
        switch (operationType) {
          case 'send':
            response = await client.twofactor.sendCode(requestParams)
            break;
          case 'verify':
            response = await client.twofactor.verifyCode(requestParams)
            break;
          case 'resend':
            response = await client.twofactor.resendCode(requestParams)
            break;
          case 'delete':
            response = await client.twofactor.deleteCode(requestParams)
            break;
          default:
            break;
        }
      } catch (error) {
        response = error
      }

      this.send({ ...msg, cpaas_response: response })
    })
  }

  RED.nodes.registerType('2FA', twofactor)
}
