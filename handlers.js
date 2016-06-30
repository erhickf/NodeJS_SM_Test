var globalConfig 			= require("./globalConfig.js");
var js2xmlparser 			= require("js2xmlparser");
var querystring 			= require("querystring");
var parseString 			= require('xml2js').parseString;
var maisUtils 				= require("./MAIS/Mais_Utils.js");
var maisConfigDeclarations 	= require("./MAIS/Config_Declaration.js");
var express 				= require('express');
var accepts 				= require('accepts');
var http 					= require("http");
var MgrCrud 				= require("./Methods_Section/ManagerCRUD.js");
var oauth 					= require("./oAtuth2.js");

var pathXML = 'xmlRequest.xml';
var guid    = require("guid");

// Sección de funciones compartidas
var clientRest = "";
function RestMappingData( params, paramNames, operation, method ){
	clientRest = "";
	var tokenObj;
	var token 		= params.request.headers["authorization"];
	var validToken  = false;
	
	if (token)
	{	
		if (operation == undefined) operation = null;
		if (method    == undefined) method    = null;
		tokenObj   = oauth.oAuth2.Tokens.ValidToken(token, operation, method);
		validToken = tokenObj != null;	
	}
	
	if (validToken){
		params.Security = {};
		params.Security.ClientId  = tokenObj.ClientId;
		params.Security.GrantType = tokenObj.GrantType;
		clientRest = tokenObj.ClientId;
		
		if (paramNames != null && paramNames.length == params.paramsPath.length)
		{
			for(var a=0;a < paramNames.length; a++)
			{
				eval("params." + paramNames[a] + " = params.paramsPath[" + a + "];");
			}
		}
		return true;
	}
	else{
		var f = new Date();
		console.log("--------------------------------------------");
		console.log("OPERACION CON TOKEN INVALIDO ");
		console.log("URL -- " + params.request.url );
		console.log("       " + f.getDate() + "/" + (f.getMonth() +1) + "/" + f.getFullYear() + " (dd/mm/aaaa) - " + 
					f.getHours() + ":" + f.getMinutes() + ":" + f.getSeconds());
		console.log("token  " + token);
		console.log("--------------------------------------------");

		params.response.writeHead(404, globalConfig.ContentType);
		//params.response.write("404 No Encontrado");
		params.response.end();
		return false;
	}	
}
function responseFinal( responseFactura,request, response ){
	var accept = accepts(request);
		
	switch(accept.type(['json', 'html','xml'])) {
		case 'json':			
			endResponseJson(response,responseFactura);			
			break;
		case 'html':
		case 'xml':	
			endResponseXML(response, responseFactura);
			break;
		default:
		  // the fallback is text/plain, so no need to specify it above 	
			response.setHeader('Content-Type', 'text/plain');
			response.write('');
			response.end();
		  break
	}
	
	var f = new Date();
	console.log("");
	console.log("Response enviado -- " + request.url );
	console.log("  Client " + clientRest + " -- " + f.getDate() + "/" + (f.getMonth() +1) + "/" + f.getFullYear() + " (d/m/a) - " + 
					f.getHours() + ":" + f.getMinutes() + ":" + f.getSeconds());
	
	return;
}
function endResponseJson( response, dataResponse ){  
  response.statusCode = 200;
  response.setHeader('Content-Type', "application/json; charset=utf-8");
  response.setHeader('X-Powered-By', 'Swiss Medical');
  globalConfig.setPublicCORS(response, 'GET, POST, DELETE, PUT, PATCH');  
  response.write(JSON.stringify(dataResponse));
  response.end();
}
function endResponseXML( response, dataResponse ){    
  response.statusCode = 200;
  response.setHeader('Content-Type', "text/xml; charset=utf-8");
  response.setHeader('X-Powered-By', 'Swiss Medical');
  globalConfig.setPublicCORS(response, 'GET, POST, DELETE, PUT, PATCH');
  response.write(dataResponse);  
  response.end();
}
function Manager_CRUD(functionMethods, function_ResponseFinal,params){		
	MgrCrud.ManagerFunctionCRUD(params, functionMethods, responseFinal);
}

// =========================================================================================================================
// Sección de funciones públicas << llamados de los servicios >>
function facturacion(params){// FUNCION PUBLICA
	var paramsGet = null;
	if (params.request.method.toLowerCase() == "get" )
		paramsGet = ["idTransaction"];	
	
	if (RestMappingData(params, paramsGet, "generico", "generico"))
		Manager_CRUD({get:"facturacion", post:"facturacion"} , responseFinal, params);			
}

function filterManager(params, filter, conditions){
	var ret = filter;	
	for(var a in conditions){
		var condition = conditions[a];		
		if (eval("params.urlParams." + condition ) == undefined){
			ret = "";
			break;						
		}
	}
	
	return ret;
}

function debitos_busqueda( params ){
	if ( RestMappingData( params, null, "generico", "generico") ){		
		var tipoFiltro = "";
		tipoFiltro = tipoFiltro != "" ? tipoFiltro : filterManager( params, "nro_factura", ["nro_factura"]);
		tipoFiltro = tipoFiltro != "" ? tipoFiltro : filterManager( params, "transaction", ["transaction"]);
		tipoFiltro = tipoFiltro != "" ? tipoFiltro : filterManager( params, "fecha_rango", ["fechadesde", "fechahasta"]);
		tipoFiltro = tipoFiltro != "" ? tipoFiltro : filterManager( params, "fecha_desde", ["fechadesde"]);
		tipoFiltro = tipoFiltro != "" ? tipoFiltro : filterManager(   params, "fecha_hasta", ["fechahasta"]);
		
		switch(tipoFiltro)
		{
			case "nro_factura":
				params.idFactura   = params.urlParams.nro_factura;
				params.idPrestador = params.Security.ClientId;
				
				Manager_CRUD({get:"debitos_nroFactura"} , responseFinal, params);			
			break;
			case "transaction":
				params.idTransaction = params.urlParams.transaction;
				
				Manager_CRUD({get:"debitos_transaccion"} , responseFinal, params);		
			break;
			case "fecha_rango":				
				params.idPrestador = params.Security.ClientId;
				params.fechaDesde = maisUtils.getEstructuraFecha(params.urlParams.fechadesde);
				params.fechaHasta = maisUtils.getEstructuraFecha(params.urlParams.fechahasta);

				Manager_CRUD({get:"debitos_fechaRango"} , responseFinal, params);	
			break;
			case "fecha_desde":
				params.idPrestador = params.Security.ClientId;
				params.fechaDesde = maisUtils.getEstructuraFecha(params.urlParams.fechadesde);

				Manager_CRUD({get:"debitos_fechaDesde"} , responseFinal, params);
			break;
			case "fecha_hasta":				
				params.idPrestador = params.Security.ClientId;
				params.fechaHasta = maisUtils.getEstructuraFecha(params.urlParams.fechahasta);				
				
				Manager_CRUD({get:"debitos_fechaHasta"} , responseFinal, params);				
			break;
			default:
				var f = new Date();
				console.log("--------------------------------------------");
				console.log("OPERACION DE FILTRADO NO SOPORTADO ");
				console.log("URL -- " + params.request.url );
				console.log("       " + f.getDate() + "/" + (f.getMonth() +1) + "/" + f.getFullYear() + " (dd/mm/aaaa) - " + 
							f.getHours() + ":" + f.getMinutes() + ":" + f.getSeconds());				
				console.log("--------------------------------------------");

				params.response.writeHead(404, globalConfig.ContentType);
				//params.response.write("404 No Encontrado");
				params.response.end();
				return false;
			break;
		}
	}
}

function debitos_transaccion( params ){ // FUNCION PUBLICA
	if ( RestMappingData( params, ["idTransaction"], "generico", "generico") )
		Manager_CRUD({get:"debitos_transaccion"} , responseFinal, params);		
}
function debitos_nroFactura ( params ){	// FUNCION PUBLICA	
	if ( RestMappingData( params, ["idFactura"], "generico", "generico") )
	{		
		params.idPrestador = params.Security.ClientId;
		Manager_CRUD({get:"debitos_nroFactura"} , responseFinal, params);
	}
}

function debitos_fechaRango( params ){ // FUNCION PUBLICA
	if ( RestMappingData( params, ["fechaDesde", "fechaHasta"], "generico", "generico") )
	{	
		params.idPrestador = params.Security.ClientId;
		params.fechaDesde = maisUtils.getEstructuraFecha(params.fechaDesde);
		params.fechaHasta = maisUtils.getEstructuraFecha(params.fechaHasta);
		
		Manager_CRUD({get:"debitos_fechaRango"} , responseFinal, params);		
	}	
}
function debitos_fechaDesde( params ){ // FUNCION PUBLICA	
	if ( RestMappingData( params, ["fechaDesde"], "generico", "generico") )
	{
		params.idPrestador = params.Security.ClientId;
		params.fechaDesde = maisUtils.getEstructuraFecha(params.fechaDesde);
		
		Manager_CRUD({get:"debitos_fechaDesde"} , responseFinal, params);		
	}
}
function debitos_fechaHasta( params ){ // FUNCION PUBLICA	
	if ( RestMappingData( params, ["fechaHasta"], "generico", "generico") ){
		params.idPrestador = params.Security.ClientId;
		params.fechaHasta = maisUtils.getEstructuraFecha(params.fechaHasta);
		
		Manager_CRUD({get:"debitos_fechaHasta"} , responseFinal, params);
	}
}

function documentos( params ){ // FUNCION PUBLICA	
	if ( RestMappingData( params, null, "generico", "generico") )
		Manager_CRUD({post:"documentos"} , responseFinal, params);
}

function auth( params ){ // FUNCION PUBLICA
	clientRest = params.request.headers["user"];
	Manager_CRUD({post:"auth"} , responseFinal, params);
}

exports.facturacion	 								= facturacion;
exports.debitos_busqueda							= debitos_busqueda;
exports.debitos_transaccion							= debitos_transaccion;
exports.debitos_nroFactura		 					= debitos_nroFactura;
exports.debitos_fechaRango							= debitos_fechaRango;
exports.debitos_fechaDesde					 		= debitos_fechaDesde;
exports.debitos_fechaHasta							= debitos_fechaHasta;
exports.documentos						  			= documentos;
exports.auth										= auth;
