module.exports = function(RED) {
  function Intech_protocol_write_multiples(config) {
    RED.nodes.createNode(this,config);
    var context = this.context();
    var dataValue;
    const get = require('simple-get');

    this.ip = config.ip;
    this.slave = config.slave;
    this.ini = config.ini;
    //this.quant = config.quant;
    this.enableretry = config.enableretry
    var node = this;

    node.on('input', function(msg) {
      //console.log(msg)
      //var msgFoward = msg.payload

      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      //remove chaves da passagem de parametro do objeto
      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      function removeMustaches(str) {
        var stringT = str
        stringT = stringT.split('{').join('')
        stringT = stringT.split('}').join('')
        if (stringT.indexOf(']') >= 0){
          stringT = stringT.slice(0,-1)
        }
        if (stringT.indexOf('[') >= 0){
          stringT = stringT.split('[')
        }
        if (typeof stringT=='string' ) {
          stringT = stringT.split('.')
        };
        return stringT
      }
      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      //Verifica origem do parametro
      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      function sourceParameter(value) {
        var valueR
        //console.log('Valor->', value)
        if (isNaN(value)){
          if (value.indexOf("{") >= 0){
            var tempRet = removeMustaches(value)
            //console.log(tempRet)
            if ((tempRet.length ==2) && (Array.isArray(tempRet))) {
              valueR = msg[tempRet[0]][[tempRet[1]]];
            }
            else if ((tempRet.length ==3) && (Array.isArray(tempRet))) {
              valueR = msg[tempRet[0]][[tempRet[1]]][[tempRet[2]]];
            }
            else if ((tempRet.length ==4) && (Array.isArray(tempRet))) {
              valueR = msg[tempRet[0]][[tempRet[1]]][[tempRet[2]]][[tempRet[3]]];
            }
            else if ((tempRet.length ==5) && (Array.isArray(tempRet))) {
              valueR = msg[tempRet[0]][[tempRet[1]]][[tempRet[2]]][[tempRet[3]]][[tempRet[4]]];
            }
            else if ((tempRet.length ==6) && (Array.isArray(tempRet))) {
              valueR = msg[tempRet[0]][[tempRet[1]]][[tempRet[2]]][[tempRet[3]]][[tempRet[4]]][[tempRet[5]]];
            }
            else if ((tempRet.length ==7) && (Array.isArray(tempRet))) {
              valueR = msg[tempRet[0]][[tempRet[1]]][[tempRet[2]]][[tempRet[3]]][[tempRet[4]]][[tempRet[5]]][[tempRet[6]]];
            }
            else if ((tempRet.length ==8) && (Array.isArray(tempRet))) {
              valueR = msg[tempRet[0]][[tempRet[1]]][[tempRet[2]]][[tempRet[3]]][[tempRet[4]]][[tempRet[5]]][[tempRet[6]]][[tempRet[7]]];
            }
            else if ((tempRet.length ==9) && (Array.isArray(tempRet))) {
              valueR = msg[tempRet[0]][[tempRet[1]]][[tempRet[2]]][[tempRet[3]]][[tempRet[4]]][[tempRet[5]]][[tempRet[6]]][[tempRet[7]]][[tempRet[8]]];
            }

            else{
              valueR = msg[tempRet];
            }

          }else{
            valueR = value;
          }
        }else{
          valueR = value;

        }
        if (valueR==true) {return 1};
        if (valueR==false) {return 0};
        return valueR
        
      }
      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      //Http request
      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      const address = "http://"+node.ip+"/api/modbuswritemultiplespost"
      const POST_CONFIG = {
        method: 'POST',
        url: address,
        body: {
          id:sourceParameter(node.slave),
          ini:sourceParameter(node.ini),
          search: '0',
          dados: msg.payload,
          enableretry: node.enableretry
        },
        json: true
      }


      node.status({fill:"yellow",shape:"ring",text:"executando..."});
      get.concat(POST_CONFIG, function (err, res, data) {
        if(err){
          dataValue = err;
          console.log('aqui')
          var outMsg = {payload: dataValue};
          node.status({fill:"red",shape:"dot",text:"erro na conexão"});
          node.send(outMsg);
        }else{
          if(data.error){
            var outMsg = {payload: data};
            node.status({fill:"red",shape:"dot",text:"timeout"});
            node.send(outMsg);
          }else if(data.errorDisable){
            var outMsg = {payload: data};
            node.status({fill:"orange",shape:"ring",text:"desab. excesso timeout"});
            node.send(outMsg);
          }else if(data.errorFormat){
            var outMsg = {payload: data};
            node.status({fill:"red",shape:"ring",text:"verifique format do array"});
            node.send(outMsg);
          }
          else{
            var outMsg = {payload: data};
            node.status({fill:"green",shape:"dot",text:"ok"});
            node.send(outMsg);
          }
        }
      })

    });
}
RED.nodes.registerType("Write Multiples",Intech_protocol_write_multiples);
};
