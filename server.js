var maisCD = require("./MAIS/Config_Declaration.js");
var http = require('http');
var url = require("url");

function iniciarServer(route, handle){
  console.log("Iniciando Server");
	
  function serverRequest(request, response){
    var pathname = url.parse(request.url).pathname;
    var postData = "";	
	
    request.setEncoding("utf8");
    request.on("data", function(postPart) {
		//console.log("postPart -- "  + postPart);
          postData += postPart;
    });
    
    request.on("end", function() {		
      route(handle, pathname, request, response, postData);
    });
  }
			
  //http.createServer(serverRequest).listen(8090);

  // esto de acá abajo es para usar openshift
	
	var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8090;
	var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
	 
	http.createServer(serverRequest).listen(server_port, server_ip_address, function () {
	  console.log( "Listening on " + server_ip_address + ", server_port " + port )
	});



  
  maisCD.instanciarValoresMock();  
  console.log("");
  console.log("---- SERVIDOR INICIADO EN EL PUERTO -- " + server_port.toString());
}

// ------------------------------------------------------------
exports.iniciarServer = iniciarServer;  
