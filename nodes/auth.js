module.exports = function(RED) {
   function cpaasbasic(config){
    RED.nodes.createNode(this, config)

    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
    this.baseUrl = config.baseUrl
 }

 RED.nodes.registerType('cpaasbasic', cpaasbasic, {
    credentials: {
      clientId: { type: 'text' },
      clientSecret: { type: 'password' },
      baseUrl: { type: 'text' }
    }
 })
}