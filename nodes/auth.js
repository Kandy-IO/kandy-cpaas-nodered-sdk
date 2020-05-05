module.exports = function(RED) {
  function cpaasbasic(config) {
    RED.nodes.createNode(this, config)
  }

  RED.nodes.registerType('cpaasbasic', cpaasbasic, {
    credentials: {
      clientId: { type: 'text' },
      clientSecret: { type: 'password' },
      baseUrl: { type: 'text' },
      email: { type: 'text' },
      password: { type: 'password' }
    }
  })
}