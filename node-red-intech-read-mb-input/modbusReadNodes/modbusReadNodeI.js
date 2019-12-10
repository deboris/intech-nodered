module.exports = function(RED) {
  function Intech_protocol_read_i(config) {
    RED.nodes.createNode(this,config)
    var context = this.context()
    var dataValue
    const get = require('simple-get')
    this.topic = config.topic
    this.property = config.property
    this.ip = config.ip
    this.slave = config.slave
    this.regini = config.regini
    this.quant = config.quant
    this.extractbits = config.extractbits
    this.enableretry = config.enableretry
    var node = this



   node.on('input', function(msg) {
    var msgOut = msg
     //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     //Format com 16 caracteres
     //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     function formatZero(str,size) {
       var s = str
       while (s.length < (size || 2)) {s = "0" + s;}
       return s;
     }

     //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     //remove chaves da passagem de parametro do objeto
     //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      function strToBitArray(str) {
        var arr = []
        for (var i = 0; i < str.length; i++) {
          arr.push(parseInt(str[i]))
        }
        return arr
      }

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
      //Faz requisição a API
      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      const POST_CONFIG = {
        method: 'POST',
        url: "http://"+ node.ip +"/api/modbusread",
        body: {
          id: sourceParameter(node.slave),
          inicio: sourceParameter(node.regini),
          quant: sourceParameter(node.quant),
          search: '0',
          enableretry: node.enableretry
        },
        json: true
      }
      node.status({fill:"yellow",shape:"ring",text:"executando..."})
      get.concat(POST_CONFIG, function (err, res, data) {
        if(err){
          node.status({fill:"red",shape:"dot",text:"erro na conexão"});
          msgOut.result =  err
          node.send(msgOut);  
        }else{
          if(data.error){
            node.status({fill:"red",shape:"dot",text:"timeout"});
            msgOut.result =  data.result
            node.send(msgOut);  
          }else if(data.errorDisable){
            node.status({fill:"orange",shape:"ring",text:"desab. excesso timeout"});
            msgOut.result =  data.result
            node.send(msgOut);  
          }
          else{
            node.status({fill:"green",shape:"dot",text:"ok"});
            if (node.extractbits) {
              msgOut[node.property] =  strToBitArray(formatZero(data.payload[0].toString(2),16))
              msgOut.result =  data.result
              node.send(msgOut);  
            }else{
              msgOut[node.property] =  data.payload
              msgOut.result =  data.result
              node.send(msgOut);  
            }
          }
        }
      })
    })
  }
  
  RED.nodes.registerType("Input Read",Intech_protocol_read_i)

}

