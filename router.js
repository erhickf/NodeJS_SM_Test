var globalConfig = require("./globalConfig.js");

function route(handle, pathname, request, response,postData) {
	var params ={
		response:response,
		request:request,
		postData:postData,
		paramsPath:new Array(),
		urlParams:null
	};
	var paramsPath = null;	
	
	try{
		var urlParams = request.url.split("?");	
		if (urlParams.length > 1){									
			params.urlParams = {};								
			urlParams = urlParams[1].split("&");							
							
			for (var item in urlParams)
			{									
				var tempItem = urlParams[item].split("=");
				if (tempItem.length > 1)
					eval("params.urlParams." + tempItem[0].toLowerCase() + " = '" + tempItem[1] + "';");
				else
					eval("params.urlParams." + tempItem[0].toLowerCase() + " = '';");
			}								
		}
	}
	catch(e){}
	
	if (typeof handle[pathname] === 'function') {
		handle[pathname](params);
	} else {		
		// MAPEO URL REST 	
		var pathSplit = pathname.toLowerCase().split("/");		
		var keep404 = true;

		for(var a=1;keep404 && a<pathSplit.length;a++)
		{
			params.paramsPath = new Array();			
			var itemSplitPath = pathSplit[a];
			
			for(idHandle in handle)
			{	
				if (!keep404) break;
				if (keep404 && idHandle.toLowerCase().indexOf("/" + itemSplitPath) == 0){					
					var splitHandle = idHandle.toLowerCase().split("/");
					
					try{
						var pathReq = "";
						var pathHandle = idHandle.toLowerCase();
						
						for (var b=1; b < splitHandle.length;b++)
						{		
							pathReq += "/";							

							if (splitHandle[b] != "@")
								pathReq +=  pathSplit[b];
							else{
								pathReq += "@";							
								params.paramsPath.push(pathSplit[b]);							
							}
							
							if (pathHandle.indexOf(pathReq) == -1)							
								break;
						}
						
						if (pathReq == pathHandle && pathSplit.length == splitHandle.length )
						{												
							keep404 = false;							
							handle[idHandle](params);
							break;
						}
					}
					catch(e){
						
					}
				}
			}
		}
		
		if (keep404)
		{
			console.log("No se encontro manipulador para " + pathname);
			response.writeHead(404, globalConfig.ContentType);
			response.write("404 No Encontrado");
			response.end();
			
			return "404 No Encontrado";
		}
  }
}

exports.route = route;
