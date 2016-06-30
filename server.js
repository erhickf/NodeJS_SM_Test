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

			
  http.createServer(serverRequest).listen(8090);
  
  maisCD.instanciarValoresMock();  
  console.log("");
  console.log("---- SERVIDOR INICIADO EN EL PUERTO 8090 --");
}

// ------------------------------------------------------------
exports.iniciarServer = iniciarServer;  
