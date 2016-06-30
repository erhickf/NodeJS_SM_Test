var appRoot = require('app-root-path');
var fs = require('fs');

var maisUtils = require(appRoot + "/MAIS/Mais_Utils.js");
var parseString = require('xml2js').parseString;
var guid = require("guid");
var maisCfgDec = require(appRoot + "/MAIS/Config_Declaration.js");

var oauth = require(appRoot + "/oAtuth2.js");

function documentos		( params, functionResponseCallBack ){
	parseString(params.postData, function (err, jsonData) {			
		try{	
				params.instancia = maisUtils.getInstanceObject(jsonData, maisCfgDec.documentReference);
				params.idTransaction = guid.raw();
				params.functionCallback = documentos_ParteB;
				params.functionResponseCallBack = functionResponseCallBack;
				
				maisUtils.getXML_documentReferencePut(	params ); 
		}
		catch (ex){}
	});
}
function documentos_ParteB ( params ){	
	params.functionResponseCallBack(params.xml, params.request, params.response);
}

function facturacion		 ( params, functionResponseCallBack ){
	fs.writeFile(maisCfgDec.pathXML_Facturacion_Request, params.postData, function(err) {
		if( err ){		}
	});
	
	parseString(params.postData, function (err, jsonData) {			
		params.pathXML = maisCfgDec.pathXML_Facturacion_Request;
		params.jsonData = jsonData;
		params.functionCallback = facturacion_ParteB;
		params.functionResponseCallBack = functionResponseCallBack;

		if (err)
		{
			var error = err.toString();
			while(error.indexOf("\r") != -1)
			{ error = error.replace("\r"," ");}
			
			while(error.indexOf("\n") != -1)
			{ error = error.replace("\n"," ");}
			
			params.validation = "ERROR: Error de lectura en el XML -- " + error;
			
			facturacion_ParteB( params );
		}
		else{
			try{
				params.instancia = maisUtils.getInstanceObject(params.jsonData, maisCfgDec.facturacion);
				maisUtils.validateErrorsXSD_XML( params );
			}
			catch (ex){
				console.log("Catch = " + ex.toString());
			}
		}
	});	
}
function facturacion_ParteB ( params ){
	if (params.validation != "")
		params.functionResponseCallBack(maisUtils.getFacturacionOperationOutcomeErrors(params.validation,"xml"), 
										params.request,
										params.response);	
	else
	{		
		params.idTransaccion = guid.raw();
		//params.instancia 	 = maisUtils.getInstanceObject(params.jsonData, maisCfgDec.facturacion);
		params.pathXML 		 = maisCfgDec.pathXML_Facturacion_Request;
		
		params.functionResponseCallBack(maisUtils.getFacturacionOperationOutcomeOK(params), 
										params.request,
										params.response);
	}

	return;
}

function auth( params , functionResponseCallBack ){
	var user  		= params.request.headers["user"];
	var pass  		= params.request.headers["password"];	
	
	var token = oauth.oAuth2.GrantType.Password.GetToken(user, pass, "generico","generico");
	var xml = "";	
	if (token != null)
		xml =  	'<xml><access_token value="' + token.Token	   + '" />' + 
				'<token_valid_until value="' + token.UntilDate + '" />' + 
				'<token_type value="' 		 + token.GrantType + '" /></xml>';
	else{
		var f = new Date();
		console.log("--------------------------------------------");
		console.log("PETICION DE TOKEN INVALIDA ");
		console.log("   " + f.getDate() + "/" + (f.getMonth() +1) + "/" + f.getFullYear() + " (dd/mm/aaaa) - " + 
					f.getHours() + ":" + f.getMinutes() + ":" + f.getSeconds());
		console.log("--------------------------------------------");
		console.log("PETICION DE TOKEN INVALIDA");
		console.log("user 		= " + user);
		console.log("pass 		= " + pass);
		console.log("--------------------------------------------");

		xml = '<xml><access_token value="invalid data" /></xml>';
	}
				
	functionResponseCallBack( xml, params.request, params.response );
}

exports.documentos 			= documentos;
exports.facturacion 		= facturacion;
exports.auth				= auth;

