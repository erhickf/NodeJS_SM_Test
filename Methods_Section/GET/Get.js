var appRoot = require('app-root-path');
var fs = require('fs');

var maisUtils = require(appRoot + "/MAIS/Mais_Utils.js");
var parseString = require('xml2js').parseString;
var maisCfgDec = require(appRoot + "/MAIS/Config_Declaration.js");

function facturacion		 (params, functionResponseCallBack){
	fs.readFile("Transactions/" + params.idTransaction + ".xml", "utf8", function(err2, dataRead2) {			
		params.idTransaction = null; // se nulea para que siga con la validación lógica de como filtrar
		var dataReturn = "";		
		if (err2)
			dataReturn = maisUtils.getXML_InsertEntryStatus( maisUtils.getXML_HeaderDebito() ,2) + "</Bundle>";
		else{
			// aca cuando se busca la data se debería de estar validando si fue procesado o no
			dataReturn = maisUtils.getXML_InsertEntryStatus(dataRead2,0);
		}
		
		functionResponseCallBack( dataReturn, params.request, params.response );
	});						
}

function debitos_transaccion (params, functionResponseCallBack){
	try{		
		params.functionCallback 		= genericResponse;
		params.functionResponseCallBack = functionResponseCallBack;
		params.Filtro = "transaccion";
		
		maisUtils.getResponseDebitoByFilters( params );		
	}
	catch(e)
	{
		console.log(e);
	}	
}

function debitos_nroFactura  (params, functionResponseCallBack){
	try{
		params.idPrestador 				= params.Security.ClientId;
		params.functionCallback 		= genericResponse;
		params.functionResponseCallBack = functionResponseCallBack;
		params.Filtro = "nroFactura";
		
		maisUtils.getResponseDebitoByFilters( params );		
	}
	catch(e)
	{
		console.log(e);
	}
}

function debitos_fechaRango  (params, functionResponseCallBack){
	try{
		params.idPrestador 				= params.Security.ClientId;
		params.functionCallback 		= genericResponse;
		params.functionResponseCallBack = functionResponseCallBack;
		params.Filtro = "fechaRango";
		
		maisUtils.getResponseDebitoByFilters( params );		
	}
	catch(e)
	{
		console.log(e);
	}	
}

function debitos_fechaDesde  (params, functionResponseCallBack){
	try{
		params.idPrestador 				= params.Security.ClientId;
		params.functionCallback 		= genericResponse;
		params.functionResponseCallBack = functionResponseCallBack;
		params.Filtro = "fechaDesde";
		
		maisUtils.getResponseDebitoByFilters( params );
	}
	catch(e)
	{
		console.log(e);
	}	
}

function debitos_fechaHasta  (params, functionResponseCallBack){	
	try{
		params.idPrestador 				= params.Security.ClientId;
		params.functionCallback 		= genericResponse;
		params.functionResponseCallBack = functionResponseCallBack;
		params.Filtro = "fechaHasta";
		
		maisUtils.getResponseDebitoByFilters( params );
	}
	catch(e)
	{
		console.log(e);
	}	
}

function genericResponse( params ){
	params.functionResponseCallBack(params.xml, params.request, params.response);	
}

exports.facturacion 			= facturacion;
exports.debitos_transaccion		= debitos_transaccion;
exports.debitos_nroFactura		= debitos_nroFactura;
exports.debitos_fechaRango		= debitos_fechaRango;
exports.debitos_fechaDesde		= debitos_fechaDesde;
exports.debitos_fechaHasta		= debitos_fechaHasta;