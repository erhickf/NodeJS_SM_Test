var maisConfig = require("../MAIS/Config_Declaration.js");
var xsdValidator = require('xsd-schema-validator');
var exec = require('child_process');
var fs = require('fs');
var guid = require("guid");

var pathXSDFacturacion = 'MAIS\\XSD_Validation';

function getFieldValue(jsonData, jsonPath, arrayData){ // ***************************************************************** FUNCION PUBLICA >>>>>>>>>>>>>>>>>>
	if (arrayData)
	{
		var arrayRet = new Array();
		for(var a=0;a<arrayData.length;a++) arrayRet.push( getFieldValue(jsonData,arrayData[a])); 

		return arrayRet;
	}
	else
	{
		try{ return eval("jsonData." + jsonPath);	}
		catch(ex) { return null; }		
	}
}

function getInstanceObject(jsonData, objStruct){ // *********************************************************************** FUNCION PUBLICA >>>>>>>>>>>>>>>>>>
		var objRet = {};
		for(prop in objStruct){
			var objProp = eval("objStruct." + prop );
			if ((typeof(objProp) == "object"))
				recorrerProps(objRet, jsonData, objStruct, prop, prop, prop, new Array());
			else{				
				var a = getFieldValue(jsonData, eval("objStruct." + prop));
				eval("objRet." + prop + " = " + (a==null?"null":"'" + a + "'") + ";");
			}			
		}
		return objRet;
}
function recorrerProps(objRet, jsonData, objStruct,objStructRet, ramaStruct, propActual, indicesArray){	
	var lineExec = 0;
	try{
		if (propActual == "RamaArray") return;	
		
		var objProp = eval("objStruct." + ramaStruct);	
		if ((typeof(objProp) == "object")){
			var ramaActual = eval("objStruct." + ramaStruct);
			eval("objRet." + objStructRet + " = {};");
			if (propActual.indexOf("Array_") == 0){
				var ramaArray = eval("objStruct." + ramaStruct + ".RamaArray");
				for (var a=0;a<indicesArray.length;a++) ramaArray = ramaArray.replace("[X]","[" + indicesArray[a] + "]");
				
				var cantRamasJson = eval("jsonData." + ramaArray +".length");
				for(var a=0;a<cantRamasJson;a++){
					eval("objRet." + objStructRet + "[" + a + "] = {};");
					for(prop2 in ramaActual ){					
						if (prop2 != "RamaArray") {						
							var ramaItemArray = eval("objStruct." + ramaStruct + "." + prop2);						
							indicesArray.push(a);
							recorrerProps(objRet, jsonData, objStruct,objStructRet + "[" + a + "]." + prop2, ramaStruct + "." + prop2, prop2,indicesArray);
						}					
					}
				}
			}
			else	
				for(prop2 in ramaActual ) recorrerProps(objRet, jsonData, objStruct, objStructRet + "." + prop2, ramaStruct + "." + prop2, prop2,indicesArray);			
		}
		else{	
			var rutaALeer = eval("objStruct." + ramaStruct);		
			for (var a=0;a<indicesArray.length;a++) rutaALeer = rutaALeer.replace("[X]","[" + indicesArray[a] + "]");

			var b = getFieldValue(jsonData, rutaALeer);
			eval("objRet." + objStructRet + " = " + (b==null?"null":"'" + b + "'") + ";");
		}
	}
	catch(e)
	{
		
	}
}

function jsonToXMLfromInstance(maisStructure, instanceObj){ // ************************************************************ FUNCION PUBLICA >>>>>>>>>>>>>>>>>>
		var objRet = {};
		var leafObj;
		
		for(prop in maisStructure)
		{
			var branch = (eval("maisStructure." + prop)).split(".");
			
			var actualBranch = "objRet";
			for(var a=0; a < branch.length;a++)
			{
				var leaf = branch[a];
				actualBranch += "." + leaf;
				try{
					var objTemp =  eval("" + actualBranch + ";");
				}
				catch(ex){}
			}
		}
		return objRet;
}

function createXMLTag(obj,tagName, tagValue, propertyName,propertyValue){ // ********************************************** FUNCION PUBLICA >>>>>>>>>>>>>>>>>>
	obj["" + tagName + ""] = tagValue;

	if (propertyName && propertyName!= ""){
		var obj2 = {};
		var obj3 = {};
		obj3["" + propertyName + ""] = propertyValue;
		obj2["@"] = obj3;
		obj2["#"] = tagValue;
		obj["" + tagName + ""] = obj2;
	}
	return obj;
}

function getFacturacionOperationOutcomeOK( params ) {
	//idTransaccion,jsonData, instancia,  pathXML){	// ******************************** FUNCION PUBLICA >>>>>>>>>>>>>>>>>>
	var xmlRet = "";
	xmlRet += '<OperationOutcome xmlns="http://hl7.org/fhir">';
	xmlRet += '<IdTransaction value="' + params.idTransaccion + '"/>';
	var array_DataFindFacturas = new Array();
	var transaction_Struct = {
		IdTransaccion:params.idTransaccion,
		Facturas:[]
	};
	// Valido data del prestador Entry [0]
	//instancia.Prestador.Id_Mais
	xmlRet += getXML_IssueOutcome("Create", "201", "diagnostics","url a conformar")
	
	// Valido data del financiador Entry [1]
	//instancia.Financiador.Id_Mais
	xmlRet += getXML_IssueOutcome("Create", "201", "diagnostics","url a conformar")
	
	// Valido data de la facturacion/claims entrys[2 en adelante]
	
	for(var itemFactura in params.instancia.Array_Facturas)
	{
		var factura = params.instancia.Array_Facturas[itemFactura];	
		transaction_Struct.Facturas.push({							
											NroFactura		: factura.Factura_Nro, 
											Fecha			: factura.Fecha_Liquidacion,
											Prestador		: params.instancia.Prestador.Id_Mais
		});		
		xmlRet += getXML_IssueOutcome("Create", "201", "diagnostics","url a conformar")
	}
	array_DataFindFacturas.push(transaction_Struct);
	xmlRet += '</OperationOutcome>';
	
	ASYNC_OperationFact(params.pathXML, params.idTransaccion,array_DataFindFacturas,params.jsonData, params.instancia);
	
	return xmlRet;
}
function ASYNC_OperationFact(pathXML, idTransaccion, array_DataFindFacturas, jsonData, instancia){
	fs.readFile(pathXML,"utf8"  , function(err1, data) {
		// =================== ACA SE DISPARAN TODAS LAS OPERACIONES ASINCRONAS, CONECTIVIDAD CON EL SISTEMA DE FACTURACIÓN 
		//                     DE SWISS MEDICAL, ETC, ETC.   ----> DE MOMENTO YO ESCRIBO UN XML		
		fs.writeFile("Transactions/" + idTransaccion + ".xml", data, function(err2){
			fs.writeFile("Transactions/" + idTransaccion + "_debito.js", JSON.stringify(ASYNC_getDataToSaveFactura(jsonData, instancia)), function(err3) {
				var json = JSON.stringify(array_DataFindFacturas);
				json = json.substring(1);
				json = "," + json.substring(0, json.length - 1);			
				
				fs.appendFile('Transactions/TransactionManager.js', json, function (err3) {
					
				});
			});
		});				
	});	
}
function ASYNC_getDataToSaveFactura(jsonData, instancia){ // to do : a terminar

	// En esta sección se tienen que hacer las validaciones del negocio para saber si todo lo enviado se puede facturar o no.
	
/* PARAMETROS PARA LAS VALIDACIONES
	
Entidad		Validacion (Prestador = ("Efector"))--En este caso

Prestador	Prestador inexistente "prestador - fecha de ejecuciónprestación"
Prestador	Prestador Inhabilitado "prestador - fecha de ejecuciónprestación"
Prestacion	Prestacion no convenida "Prestador - fecha de ejecución prestación"

Afiliado	Afiliado inexistente "Afiliado - fecha de ejecuciónprestación"
Afiliado	Afiliado inhabilitado "Afiliado - fecha de ejecuciónprestación"
Afiliado / Plan	Cobertura("Cobertura") Inexistente "Afiliado - fecha de ejecuciónprestación"	

Prestacion	Prestacion inexistente (Listado de Prestaciones codigo/v_desde-hasta) "Prestación - fecha de ejecuciónprestación"

Afiliado / Prestador	Cartilla / Plan  "Prestador - Afiliado - fecha de ejecución prestación" 
	(relacion (afiliado plan) - (prestador cartilla) / (plan-cartilla) "codigo/v_desde-hasta")
*/	
	var retJson = {
		Prestador:{
			ID:instancia.Prestador.Id_Interno,
			OID:instancia.Prestador.Id_Mais,
			Method:instancia.Prestador.Method,
			URL_Request:instancia.Prestador.URL_Request
		},
		Financiador:{
			ID:instancia.Financiador.Id_Interno,
			OID:instancia.Financiador.Id_Mais,
			Method:instancia.Financiador.Method,
			URL_Request:instancia.Financiador.URL_Request
		},
		Array_Entrys:[]
	};

	var index = 0;
	for(var item in instancia.Array_Facturas)
	{
		var factura = instancia.Array_Facturas[item];		
		var facturaClaim = {
				ID_Claim:"Claim" + (index + 1).toString(),
				Tipo:factura.Tipo,
				Method:instancia.Financiador.Method,
				Renglon_Unico:{
					OID:factura.Factura_OID_Prestador,
					Value:factura.Id_Unico_Renglon_Prestador
				},
				Factura:{
					OID:factura.Factura_OID_Prestador,
					Value:factura.Factura_Nro
				},
				Servicio:{
					OID:factura.Episodio.OID,
					Value:factura.Episodio.Nro_Episodio_Prestador
				},
				Fecha_Prestacion:factura.Fecha_Liquidacion,
				Afiliado:{
					ID:factura.Afiliado.Id,
					Nro:factura.Afiliado.Nro,
					URL:factura.Afiliado.URL
				},
				Fecha_Debito:getFechaActualFormatoMais(),
				Outcome:{
					Status:"",
					Diagnostico:""
				},
				Error:{
					Hubo:false,
					URL:"",
					Codigo:"",
					Descripcion:""				
				},
				Debito:{
					Importe:getImporteFactura(factura.Array_Items),
					Moneda:"ARS",
					Motivo:{
						URL:"",
						Codigo:"",
						Descripcion:""
					}
				},
				Array_Items:[]
			};
			
		var subIndex = 0;
		
		// validar el porqué un Item no sería facturado e indicar motivos de rechazo
		for(var subItem in factura.Array_Items)
		{
			var itemFactura = factura.Array_Items[subItem];
			var mensaje = "";
			var Validaciones = {
				ExistePrestador					: Validacion_Estructura(),
				PretadorHabilitado				: Validacion_Estructura(),
				PrestacionEnConvenio			: Validacion_Estructura(),
				AfiliadoExistente				: Validacion_Estructura(),
				AfiliadoHabilitado				: Validacion_Estructura(),
				AfiliadoCobertura				: Validacion_Estructura(),
				ExistePrestacion				: Validacion_Estructura(),
				AfiliadoCubiertoPorPrestacion	: Validacion_Estructura()
			};
			// -------- Validaciones Id Prestador y Fecha de Prestacion



			// -------- Validaciones Id Afiliado y Fecha de Prestacion (MAIS- No es afiliado o páciente dado de baja) - OK
			Validacion_AfiliadoExistente(	factura.Afiliado.Id, itemFactura.Fecha_Prestacion, 
											Validaciones.AfiliadoExistente);
			Validacion_AfiliadoHabilitado(	factura.Afiliado.Id, itemFactura.Fecha_Prestacion, 
											Validaciones.AfiliadoHabilitado);

			// -------- Validaciones Id Prestacion y Fecha de Prestacion (MAIS - Practica no convenida u homologada) - OK
			Validacion_ExistePrestacion( itemFactura.Prestacion.Codigo, itemFactura.Prestacion.Codigo_Homologado, itemFactura.Fecha_Prestacion, 
												Validaciones.ExistePrestacion);


			// (MAIS - Plan no cubierto para la institución) - ok
			Validacion_PrestacionEnConvenio(	instancia.Prestador.Id_Mais, instancia.Prestador.Id_Interno, itemFactura.Prestacion.Codigo, itemFactura.Fecha_Prestacion, 
												Validaciones.PrestacionEnConvenio);
												
			
			
			// - A cargo del afiliado (coseguro, topes, insumos,según orden emitida o modalidad operativa) no cubiertos por la entidad		
			Validacion_AfiliadoCobertura(	factura.Afiliado.Id, itemFactura.Fecha_Prestacion, itemFactura.Prestacion.Codigo,
											Validaciones.AfiliadoCobertura);
										






			// -------- Validaciones Id Prestador, Id Afiliado y Fecha de Prestacion
			Validacion_AfiliadoCubiertoPorPrestacion( instancia.Prestador.Id_Mais, instancia.Prestador.Id_Interno, factura.Afiliado.Id, itemFactura.Fecha_Prestacion, 
												Validaciones.AfiliadoCubiertoPorPrestacion);

												
			/*
				Validacion_ExistePrestador(			instancia.Prestador.Id_Mais, instancia.Prestador.Id_Interno, itemFactura.Fecha_Prestacion, 
												Validaciones.ExistePrestador);
				Validacion_PretadorHabilitado(		instancia.Prestador.Id_Mais, instancia.Prestador.Id_Interno, itemFactura.Fecha_Prestacion, 
												Validaciones.PretadorHabilitado);												
			*/
			
			var error = Validacion_OK(Validaciones);
			if (error != null){
				// Acá debería de viajar un código de porque no se acepta la factura
				if (!retJson.Array_Entrys[index]){
					facturaClaim.Error.Hubo = true;
					facturaClaim.Error.URL = "http://mais.org.ar/fhir/ValueSet/ErroresTransacciones";
					facturaClaim.Error.Codigo = "to do - a definir";
					facturaClaim.Error.Descripcion = "to do - a definir";
					
					facturaClaim.Debito.Motivo.URL = "http://mais.org.ar/fhir/ValueSet/ErroresTransacciones";
					facturaClaim.Debito.Motivo.Codigo = error.Codigo;
					facturaClaim.Debito.Motivo.Descripcion = error.Mensaje;
					facturaClaim.Outcome.Status = "error";
					facturaClaim.Outcome.Diagnostico = error.Mensaje;					
					
					retJson.Array_Entrys[index] = facturaClaim;
				}
				
				retJson.Array_Entrys[index].Array_Items[subIndex++] = {
					ID				: itemFactura.Secuencia,
					Prestacion:{
						OID			: itemFactura.Prestacion.OID_Homologado,
						Codigo		: itemFactura.Prestacion.Codigo_Homologado,
						Descripcion : itemFactura.Prestacion.Descripcion_Homologado
					}
				};
			}
		}
	}
	
	return retJson;
}

function getFechaActualFormatoMais(){
	var dateFormat = require('dateformat');
	var now = new Date();
	return dateFormat(now, "yyyy-mm-dd//hh:MM:ss").replace("//","T");
}
function getImporteFactura(itemsFactura){
	var importe = 0;
	for(var itemIndex in itemsFactura)
	{
		var itemFactura = itemsFactura[itemIndex];
		importe += 	parseFloat(itemFactura.Valores.Gsatos).toFixed(2) + 
					parseFloat(itemFactura.Valores.Honorarios).toFixed(2) + 
					parseFloat(itemFactura.Valores.Importe_Gravado).toFixed(2) +
					parseFloat(itemFactura.Prestacion.Importe).toFixed(2);
	}
	
	return importe;
}
function Validacion_Estructura(){
	return {
		ValidacionOK:true,
		Codigo:0, 
		Mensaje:""
	};
}
function Validacion_ExistePrestador      (Id_Prestador_Mais, idPrestador_Interno, fechaPrestacion, output){
	output.ValidacionOK = true;
	output.Mensaje = "";
}
function Validacion_PretadorHabilitado   (Id_Prestador_Mais, idPrestador_Interno, fechaPrestacion, output){
	output.ValidacionOK = true;
	output.Mensaje = "";
}
function Validacion_PrestacionEnConvenio (Id_Prestador_Mais, idPrestador_Interno, Id_prestacion, fechaPrestacion, output){
	// prestador / prestaciones
	var validacionOK = true;
	for(item in maisConfig.MOCK_Validacion_Planes_Prestador.Validos)
	{
		if(validacionOK)
		{
			var itemData = maisConfig.MOCK_Validacion_Planes_Prestador.Validos[item];
			if (itemData.Prestador == Id_Prestador_Mais)			
				validacionOK = !maisConfig.MOCK_Codigo_Valido( itemData.PrestacionesValidas, Id_prestacion);
		}
	}
	//19 - 6
	//30 - 10
	//31 - 10
	if (validacionOK)
	{
		output.Codigo = maisConfig.MOCK_Validacion_Planes_Prestador.CodigoError;
		output.ValidacionOK = false;
		output.Mensaje = maisConfig.MOCK_Validacion_Planes_Prestador.MensajeError;		
	}	
}
function Validacion_AfiliadoExistente    (Id_Afiliado, fechaPrestacion, output){	
	if ( !maisConfig.MOCK_Codigo_Valido( maisConfig.MOCK_Validacion_Afiliados.Validos, Id_Afiliado)  ) 
	{
		output.Codigo = maisConfig.MOCK_Validacion_Afiliados.CodigoError;
		output.ValidacionOK = false;
		output.Mensaje = maisConfig.MOCK_Validacion_Afiliados.MensajeError;		
	}
}
function Validacion_AfiliadoHabilitado   (Id_Afiliado, fechaPrestacion, output){
	output.Codigo = "";
	output.ValidacionOK = true;
	output.Mensaje = "";
}
function Validacion_AfiliadoCobertura    (Id_Afiliado, fechaPrestacion, Id_prestacion, output){
	// afiliado / prestaciones										
	var validacionOK = true;
	for(item in maisConfig.MOCK_Validacion_Afiliado_Prestacion.Validos)
	{
		if(validacionOK)
		{
			var itemData = maisConfig.MOCK_Validacion_Afiliado_Prestacion.Validos[item];
			if (itemData.Afiliado == Id_Afiliado)			
				validacionOK = !maisConfig.MOCK_Codigo_Valido( itemData.PrestacionesValidas, Id_prestacion);
		}
	}
	//19 - 6
	//30 - 10
	//31 - 10
	if (validacionOK)
	{
		output.Codigo = maisConfig.MOCK_Validacion_Afiliado_Prestacion.CodigoError;
		output.ValidacionOK = false;
		output.Mensaje = maisConfig.MOCK_Validacion_Afiliado_Prestacion.MensajeError;		
	}	
}
function Validacion_ExistePrestacion     (Id_Prestacion, id_Prestacion_Homologada, fechaPrestacion, output){
	if ( !maisConfig.MOCK_Codigo_Valido( maisConfig.MOCK_Validacion_Prestacion.Validos, Id_Prestacion)  ) 
	{
		output.Codigo = maisConfig.MOCK_Validacion_Prestacion.CodigoError;
		output.ValidacionOK = false;
		output.Mensaje = maisConfig.MOCK_Validacion_Prestacion.MensajeError;		
	}
}
function Validacion_AfiliadoCubiertoPorPrestacion(Id_Prestador_Mais, idPrestador_Interno, Id_Afiliado, fechaPrestacion, output){
	output.Codigo = "";
	output.ValidacionOK = true;
	output.Mensaje = "";
}
function Validacion_OK(objVal){
	var objErrors = new Array();
	for(prop in objVal)
	{
		if (!eval("objVal[prop].ValidacionOK"))
			objErrors.push(objVal[prop]);
	}
	if (objErrors.length == 0)
		return null;
	else
		return objErrors;
}

function validateErrorsXSD_XML(params){
	//(pathXML, request, response, xmlString, jsonData, functionCallBack){	// ******************** FUNCION PUBLICA >>>>>>>>>>>>>>>>>>
	
	var comando = "xsdval /xml:" + params.pathXML + " /xsd:" + pathXSDFacturacion + "\\bundle.xsd ";	
		
	try{
		exec.exec(comando, function (error, stdout, stderr) {			
				var propsObj = {
					xml        : params.postData,						
					request    : params.request,
					response   : params.response,
					jsonData   : params.jsonData,
					error      : "",
					validation : "",
					functionResponseCallBack : params.functionResponseCallBack,
					instancia  : params.instancia
				};
				
				if (error !== null)
					propsObj.error = error;
				else
					propsObj.validation = stdout;					

				propsObj.validation += SYNC_ValidationFact( propsObj );				
				params.functionCallback( propsObj );
		});
	}
	catch(la)
	{

	}
}
function SYNC_ValidationFact( propsObj ){ // Validaciones sincrónicas
	var validaciones = "";
	
	// Valido el OID del financiador --------------------------------------------------------------------	
	try{
		if (propsObj.instancia.Financiador.Id_Mais != maisConfig.OID_SwissMedical_Financiador)
			validaciones += "ERROR: OID del financiador inválido \n";
		
		// Valido el OID del Prestador ----------------------------------------------------------------------
		var prestadorValido = false;

		for(prest in maisConfig.OIDS_Organizacionales.Prestadores)
		{
			if (maisConfig.OIDS_Organizacionales.Prestadores[prest] == propsObj.instancia.Prestador.Id_Mais){
				prestadorValido = true;
				break;
			}
		}
		if (!prestadorValido)
			validaciones += "ERROR: OID del prestador inválido \n";
	}
	catch(e)
	{
		console.log(e);
	}
	return validaciones;
}
function getFacturacionOperationOutcomeErrors(data,type){ // ************************************************************** FUNCION PUBLICA >>>>>>>>>>>>>>>>>>
		var splitValidation = data.split(/\r?\n/);
		var Array_XSD_Error = new Array();
		
		var issues = {Issues:[]};
		var incre = 0;
		for(index in splitValidation){
			var item = splitValidation[index];
			
			if (item.indexOf("ERROR:") == 0){								
				issues.Issues[index] = {
					code 		: incre++,
					severity 	: "Error",
					details		: null,
					diagnostics : item.replace("ERROR:","")
				};						
			}
			else if (item.indexOf("WARNING:") == 0){				
				issues.Issues[index] = {
					code 		: incre++,
					severity 	: "Warning",
					details		: null,
					diagnostics : item.replace("WARNING:","")
				};		
			}
		}
		
		return getXML_OperationOutcome(issues);	
}

function normalizeString(string){
	while(string.indexOf("'") != -1)
	{
		string = string.replace("'","");
	}
	
	return string;
}
function quitarEspacios(string){
	while(string.indexOf(" ") != -1)
	{
		string = string.replace(" ","");
	}
	
	return string;	
}

// ************************************************************ Sección para el manejo del RESPONSE del servicio de DEBITO
function getResponseDebitoByFilters( params ){
	params.Prestador	= {};
	params.Financiador  = {};
	params.Array_Entrys = [];
	params.jsonDebito   = {};
		
	switch(params.Filtro)
	{
		case "transaccion":
			fs.readFile("Transactions/" + params.idTransaction + "_debito.js", "utf8", function(err2, dataJs) {									
				if (err2)
					params.functionCallback({
											xml						 : getXML_InsertEntryStatus(getXML_HeaderDebito(),2) + "</Bundle>",
											request  				 : params.request, 
											response 				 : params.response, 
											functionResponseCallBack : params.functionResponseCallBack
										 });
				else{
					// TO DO : acá debería de ir la lógica para conocer el status si es 0 o 1
					params.functionCallback({
											xml						 : getXML_InsertEntryStatus(getResponseDebitoByFilters_ParteC(params, dataJs),0), 
											request					 : params.request, 
											response				 : params.response, 
											functionResponseCallBack : params.functionResponseCallBack
										 });
				}
			});		
		break;
			case "nroFactura":
			case "fechaRango":
			case "fechaDesde":
			case "fechaHasta":
				getResponseDebitoByFilters_ParteB( params );
		break;
		default:
		break;
	}
}
function getResponseDebitoByFilters_ParteB( params ){	
	fs.readFile("Transactions/TransactionManager.js", "utf8", function(err, dataRead) {	
		params.jsonDebito = [];
		eval("params.jsonDebito = [" + dataRead.toString().substring(1) + "];");
		params.idPrestador 	 = params.idPrestador.toLowerCase();
		
		var Transaction_Arrays = new Array();
		var prestadorEncontrado = false;
		
		switch(params.Filtro)
		{
			case "nroFactura":
				params.idFactura = params.idFactura.toLowerCase();
				for(var a in params.jsonDebito){
					if (params.idTransaction == null){					
						var facturas = params.jsonDebito[a];
						for(var b in facturas.Facturas)
						{	
							var factura = facturas.Facturas[b];
							/*console.log("quitarEspacios(factura.NroFactura.toLowerCase()) = " + quitarEspacios(factura.NroFactura.toLowerCase()));
							console.log("data.idFactura                             = " + data.idFactura);
							console.log("factura.Prestador.toLowerCase() = " + factura.Prestador.toLowerCase());
							console.log("data.idPrestador                = " + data.idPrestador);
							console.log("");*/

							if (factura.Prestador.toLowerCase() == params.idPrestador)
							{
								prestadorEncontrado = true;
								if (quitarEspacios(factura.NroFactura.toLowerCase()) == params.idFactura)
									Transaction_Arrays.push({IDTransaction:facturas.IdTransaccion,
															NrosFacturas:[params.idFactura]});
							}														
						}
					}
				}				
			break;
			case "fechaRango":
				for(var a in params.jsonDebito){
					var struct_temp = {
						IDTransaction:null,
						NrosFacturas:[]
					};
					
					var facturas = params.jsonDebito[a];							
					
					for(var b in facturas.Facturas)
					{
						var factura = facturas.Facturas[b];
						var fecha_debito = getFechaParaFiltrar(factura.Fecha);								
						
						if (factura.Prestador.toLowerCase() == params.idPrestador)						{								
							prestadorEncontrado = true;
							if (params.fechaDesde == null && params.fechaHasta == null) 
								break;
							
							if ( fecha_debito != null
								 && params.fechaDesde <= fecha_debito
								 && params.fechaHasta >= fecha_debito){
									struct_temp.IDTransaction = facturas.IdTransaccion;
									struct_temp.NrosFacturas.push(factura.NroFactura);
							}
						}							
					}
					if (prestadorEncontrado && params.fechaDesde == null && params.fechaHasta == null) 
						break;
					
					if (struct_temp.IDTransaction != null)
						Transaction_Arrays.push(struct_temp);
				}
			break;
			case "fechaDesde":				
				for(var a in params.jsonDebito){
					var struct_temp = {
						IDTransaction:null,
						NrosFacturas:[]
					};
					
					var facturas = params.jsonDebito[a];
					for (var b in facturas.Facturas)
					{
						var factura = facturas.Facturas[b];
						var fecha_debito = getFechaParaFiltrar(factura.Fecha);
						
						if (factura.Prestador.toLowerCase() == params.idPrestador){
							prestadorEncontrado = true;
							if (params.fechaDesde == null ) 
								break;
							
							if ( fecha_debito != null 								 
								 && params.fechaDesde <= fecha_debito){
									struct_temp.IDTransaction = facturas.IdTransaccion;
									struct_temp.NrosFacturas.push(factura.NroFactura);											
							}
						}
					}
					if (prestadorEncontrado && params.fechaDesde == null ) 
						break;
					
					if (struct_temp.IDTransaction != null)
						Transaction_Arrays.push(struct_temp);								
				}			
			break;
			case "fechaHasta":				
				for(var a in params.jsonDebito){
					var struct_temp = {
						IDTransaction:null,
						NrosFacturas:[]
					};
					
					var facturas = params.jsonDebito[a];
					
					for (var b in facturas.Facturas){
						var factura = facturas.Facturas[b];
						var fecha_debito = getFechaParaFiltrar(factura.Fecha);
						
						if (factura.Prestador.toLowerCase() == params.idPrestador)
						{
							prestadorEncontrado = true;
							if (params.fechaHasta == null) 
								break;
							if ( fecha_debito != null 
								&& params.fechaHasta >= fecha_debito ){
										struct_temp.IDTransaction = facturas.IdTransaccion;
										struct_temp.NrosFacturas.push(factura.NroFactura);											
							}
						}						
					}
					if (prestadorEncontrado && params.fechaHasta == null) 
						break;
					
					if (struct_temp.IDTransaction != null)
						Transaction_Arrays.push(struct_temp);														
				}			
			break;
		} // switch

		if (!prestadorEncontrado){
			params.functionCallback({
									xml						 : getXML_InsertEntryStatus(getXML_HeaderDebito(),2) + "</Bundle>", 
									request					 : params.request, 
									response 				 : params.response, 
									functionResponseCallBack : params.functionResponseCallBack
								  });
			return;
		}
		else{				
			if (Transaction_Arrays.length > 0)
				getResponseDebitoByFilters_ParteRecursiva(0, Transaction_Arrays, params , getXML_HeaderDebito()); //--------------------------------------
			else
			{
				params.functionCallback({
										xml						 : getXML_InsertEntryStatus(getXML_HeaderDebito(),2) + "</Bundle>", 
										request					 : params.request, 
										response				 : params.response, 
										functionResponseCallBack : params.functionResponseCallBack
									  });
				return;
			}
		}	
	});
}

function getResponseDebitoByFilters_ParteRecursiva(indiceActual,Transaction_Arrays, data , xml){	
	if(indiceActual < Transaction_Arrays.length){		
		fs.readFile("Transactions/" + Transaction_Arrays[indiceActual].IDTransaction + "_debito.js", "utf8", function(err2, dataJs) {
			if (err2){
			}
			else{
				// TO DO : acá debería de ir la lógica para conocer el status si es 0 o 1
				xml += getXML_EntryDebito(data, dataJs, Transaction_Arrays[indiceActual].NrosFacturas);
				indiceActual++;
				getResponseDebitoByFilters_ParteRecursiva(indiceActual, Transaction_Arrays, data, xml);
			}
		});	
	}
	else
	{
		data.functionCallback({
								xml:getXML_InsertEntryStatus(xml + "</Bundle>",0), 
								request:data.request, 
								response:data.response, 
								functionResponseCallBack:data.functionResponseCallBack
							 });					
	}
}
function getXML_EntryDebito(data, dataJs, facturas){
	var jsonDebito = {};
	eval("jsonDebito = " + dataJs + ";");	
	
	var arrayClaimIds = new Array();
	// busco por factura

	if (typeof(data.idTransaction) === "undefined" || data.idTransaction == null){	
		// Busco todas las facturas que vinieron con la transaccion, y elimino las que no sean la que yo busco.
		
		for(var index in jsonDebito.Array_Entrys)
		{
			var quitarEntry = true;
			for(var a in facturas){
				var nroFactura = facturas[a];
				if (quitarEspacios(jsonDebito.Array_Entrys[index].Factura.Value).toLowerCase() == quitarEspacios(nroFactura).toLowerCase())
					quitarEntry = false;
			}
			if (quitarEntry)
				jsonDebito.Array_Entrys[index] = {};
		}
	}
	var xml = "";	
	xml +=  getResponseDebito(jsonDebito);	
	return xml;
}
function getResponseDebitoByFilters_ParteC(data, dataJs){
	
	var jsonDebito = {};
	eval("jsonDebito = " + dataJs + ";");	
	
	var arrayClaimIds = new Array();
		// busco por factura

	if (typeof(data.idTransaction) === "undefined" || data.idTransaction == null){	
		// Busco todas las facturas que vinieron con la transaccion, y elimino las que no sean la que yo busco.
		
		for(var index in jsonDebito.Array_Entrys)		
		{			
			if (jsonDebito.Array_Entrys[index].Factura.Value != data.idFacturaDebito){
				jsonDebito.Array_Entrys[index] = {};				
			}
		}
	}
	var xml = getXML_HeaderDebito();	
	xml +=  getResponseDebito(jsonDebito);	
	xml += '</Bundle>';	
	return xml;		
}
function getFechaParaFiltrar(fecha){
	try	{		
		if (fecha.length < 8) return null;
		
		var fecha = fecha.split("T")[0];		
		while(fecha.indexOf("-") != -1)
		{
			fecha = fecha.replace("-","");
		}		
		
		return getEstructuraFecha(fecha.toString());
	}
	catch(e)
	{		
		return null;
	}
}
function getEstructuraFecha(fecha){
	if (fecha.length < 8) return null;
	try{
		var retFecha = new Date(fecha.substring(4,8), fecha.substring(2,4), fecha.substring(0,2));	 //DD MM AAAA	
		//             new Date(fecha.substring(0,4)), fecha.substring(4,6),fecha.substring(6,8)); // AAAA MM DD
		return retFecha;
	}
	catch(e){
		return null;
	}
	//return new Date(fecha.substring(4,8), fecha.substring(2,4), fecha.substring(0,2));	 //DD MM AAAA	
	//return new Date(fecha.substring(0,4)), fecha.substring(4,6),fecha.substring(6,8)); // AAAA MM DD	
}

function getPrestadorByIdFactura(idFactura){
	// Acá busco por ID de la factura para extraer el prestador
	return { ID:"F87E4DC7-BEFA-45D1-B336-09BE61B1AA3E",
			 OID:"OID_ORGANIZACION_PRESTADORA",
			 Method:"POST",
			 URL_Request:"Organization"};
}
function getFinanciador(){
	return { ID:"C81696FE-2B56-4F77-BCED-440A727D2869",
			 OID:"OID_ORGANIZACION_FINANCIADORA",
			 Method:"POST",
			 URL_Request:"Organization"};
}
function getResponseDebito(json){
	var xml = "";	
	// Identificador de la organizacion prestadora	
	xml += getXML_EntryDatosOrganizacion(json.Prestador.ID, json.Prestador.OID,json.Prestador.Method, json.Prestador.URL_Request); // **4	
	// Identificador de la organizacion prestadora	
	xml += getXML_EntryDatosOrganizacion(json.Financiador.ID, json.Financiador.OID,json.Financiador.Method, json.Financiador.URL_Request); // **3
	//Puede haber varias repeticiones de este recurso, tantas como 'renglones' de lo que antes eran nuestros archivos de intercambio
    // Este es el primer renglon
	
	// FOR	
	for(var index in json.Array_Entrys)	{	
		if (!(typeof(json.Array_Entrys[index].ID_Claim) === "undefined"))
			xml += getXML_EntryClaimDebito(json.Array_Entrys[index], json.Prestador, json.Financiador);	
	}

	return xml;
}

function getXML_HeaderDebito(){
	var xml = "";
	xml += '<?xml version="1.0" encoding="UTF-8" ?>';
	xml += '<Bundle xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://hl7.org/fhir fhir-all-xsd/bundle.xsd" xmlns="http://hl7.org/fhir">';
	xml +=    '<meta>';
	xml +=       '<profile value="http://mais.org.ar/fhir/ImplementationGuide/TransaccionDebitoMais"/>';
	xml +=    '</meta>';
	xml +=    '<type value="transaction"/>';
	return xml;
}
function getXML_IssueOutcome(severity, code, diagnostics, location){
	var retXML = "";
	retXML += '<issue>';
	retXML +=   '<severity value="' + severity + '" />';
	retXML +=   '<code value="' + code + '" />';
	retXML +=   '<diagnostics value="' + diagnostics + '" />';
	retXML +=   '<location value="' + location + '" />';
	retXML += '</issue>';
	return retXML;
}
function getXML_EntryDatosOrganizacion(id, OID, method, url){
	var xml = "";
	xml +=    '<entry>';
	xml +=       '<resource>';
	xml +=          '<Organization>';
	xml +=             '<id value="' + id + '"/>'; // Identificador Interno dentro de la Transaccion
	xml +=             '<identifier>';
	xml +=                '<value value="' + OID + '"/>'; // Identificador MAIS de la Organización Prestadora
	xml +=             '</identifier>';
	xml +=          '</Organization>';
	xml +=      '</resource>';
	xml +=      '<request>';
	xml +=         '<method value="' + method + '"/>';
	xml +=         '<url value="' + url + '"/>';
	xml +=      '</request>';	
	xml +=    '</entry>';
	return xml;	
}
function getXML_EntryClaimDebito( entry, prestador, financiador){ 
	// TO DO : Ver referencia del paciente
	var xml = "";
	xml +=    '<entry>';
	xml +=       '<resource>';
	xml +=          '<ClaimResponse>';
	xml +=             '<contained>';
	xml +=                '<claim>';
	xml +=                   '<id value="' + entry.ID_Claim + '"></id>'; // **1
	xml +=                   '<type value="' + entry.Tipo + '"/>'; // Tipo de Item
	                            // Identificador Único del Renglón para el Prestador D01c 
	xml +=                      getXML_Identifier(entry.Renglon_Unico.OID, entry.Renglon_Unico.Value);
								// Identificador : Tipo y Numero de Factura del Prestador - D01b	
	xml +=                      getXML_Identifier(entry.Factura.OID, entry.Factura.Factura_Nro);
								// Identificador : Accession del Prestador - D01f	
	xml +=                      getXML_Identifier(entry.Servicio.OID, entry.Servicio.Value);
	xml +=                   '<created value="' + entry.Fecha_Prestacion + '"></created>'; // Fecha de Prestación - D01d
	xml +=                   '<patient>';
	xml +=                      '<reference value="#' + entry.Afiliado.ID + '"></reference>'; // Referencia a datos de paciente **2
	xml +=                   '</patient>';	
	xml +=                '</claim>';
	xml +=             '</contained>';
	//                 Datos del paciente
	xml +=             '<contained>';
	xml +=                '<Patient>';
	xml +=                   '<id value="' + entry.Afiliado.ID + '"/>'; // Identificador interno dentro de la transacción **2
	// Identificador : Accession del Prestador - D01f	
	xml +=                   getXML_Identifier(entry.Afiliado.URL,entry.Afiliado.Nro); 	
	xml +=                '</Patient>';
	xml +=             '</contained>';
	xml +=             '<request>';
	xml +=                '<reference value="#' + entry.ID_Claim + '"></reference>'; // Referencia a Item de Factura Debitado **1
	xml +=             '</request>';
	xml +=             '<created value="' + entry.Fecha_Debito + '"></created>'; // Fecha del Débito: D01a
	xml +=             '<organization>';
	xml +=                '<reference value="organization/' + financiador.ID + '"></reference>'; // Referencia a Organizacion Financiadora **3
	xml +=             '</organization>';
	xml +=             '<requestOrganization>';
	xml +=                '<reference value="organization/' + prestador.ID + '"></reference>'; // Referencia a Organizacion Financiadora **4
	xml +=             '</requestOrganization>';
	xml +=             '<outcome value="' + entry.Outcome.Status + '"/>'; // Resultado del Procesamiento
	xml +=             '<disposition value="' + entry.Outcome.Diagnostico + '"></disposition>'; // Mensaje de Error o Debito para el item
	
	// FOR
	for (var a=0;a < entry.Array_Items.length;a++)
	{
		xml +=             getXML_ItemDebito(entry.Array_Items[a]);
	}
	
	// Solo para Errores de Procesamiento del batch de Facturacion
	// Definicion de codigo de Errores en la Guia - D01l
	if(entry.Error.Hubo){
		xml +=         '<error>';	
		xml +=            getXML_CodeDebito(entry.Error.URL, entry.Error.Codigo, entry.Error.Descripcion);
		xml +=         '</error>';	
	}
	//                 Valor del Débito en Pesos - D01k 
	xml +=             '<paymentAdjustment>';
	xml +=                '<value value="' + entry.Debito.Importe + '"/>';
	xml +=                '<unit value="' + entry.Debito.Moneda + '"></unit>';
	xml +=             '</paymentAdjustment>';
	//                 Motivo del Debito -         D01i/D01j
	xml +=             '<paymentAdjustmentReason>';
	xml +=                getXML_CodeDebito(entry.Debito.Motivo.URL, entry.Debito.Motivo.Codigo, entry.Debito.Motivo.Descripcion);
	xml +=             '</paymentAdjustmentReason>';
	
	xml +=          '</ClaimResponse>';
	xml +=      '</resource>';
	xml +=      '<request>';
	xml +=         '<method value="' + entry.Method + '"/>';
	xml +=         '<url value="' + entry.URL_Request_Claim + '"/>';
	xml +=      '</request>';	
	xml +=    '</entry>';
	
	return xml;	
}
function getXML_ItemDebito(item){
	var xml = '';
	xml += '<item>';
	xml +=    '<sequenceLinkId value="' + item.ID + '"></sequenceLinkId>';
	xml +=    '<adjudication>'; 
	xml +=       getXML_CodeDebito(item.Prestacion.OID, item.Prestacion.Codigo, item.Prestacion.Descripcion); // Codigo del Financiador para la Prestacion D01h
	xml +=    '</adjudication>';	
	xml += '</item>';
	return xml;	
}
function getXML_CodeDebito(system, code, display){
	var xml ='';
	xml += '<code>'; 
	xml +=    '<system value="' + system + '"/>'; 
	xml +=    '<code value="' + code + '"/>'; 
	xml +=    '<display value="' + display + '"/>'; 
	xml += '</code>'; 
	return xml;
}
function getXML_Identifier(system, value){
	var xml ='';
	xml += '<identifier>'; 
	xml +=    '<system value="' + system + '"/>'; 
	xml +=    '<value value="' + value + '"/>'; 
	xml += '</identifier>'; 
	return xml;
}
function getXML_modifierExtension(url, system, value){
	var xml ='';
	xml += '<modifierExtension url="' + url + '">'; 
	xml +=    '<valueIdentifier>'; 
	xml +=       '<system value="' + system + '"/>'; 
	xml +=       '<value value="' + value + '"/>'; 
	xml +=    '</valueIdentifier>'; 	
	xml += '</modifierExtension>'; 
	return xml;
}


//function documentReferencePut(request, response, postData, instancia, idTransaction, functionCallback){ // ***************** FUNCION PUBLICA
function getXML_documentReferencePut(params){ // ***************** FUNCION PUBLICA
	
	fs.writeFile("Transactions/" + params.idTransaction + "_docRef.js", JSON.stringify(params.instancia), function(err2){
		var xml = "";
		xml += getXML_OperationOutcome( {Issues:{
											  severity	: params.instancia.Tipo, 
											  code		: params.idTransaction,
											  details		: null,
											  diagnostics : "1" }											
										}
									   );		
		
		params.functionCallback( {xml						: xml, 
								  request					: params.request, 
								  response					: params.response, 
								  functionResponseCallBack	: params.functionResponseCallBack} 
								);
	});			
}

function getXML_OperationOutcome(issues){
	var xml = '';
	xml +=    '<OperationOutcome xmlns="http://hl7.org/fhir">';
	for(index in issues.Issues)
	{
		xml += getXML_Issue(issues.Issues[index]);
	}
	xml +=   '</OperationOutcome>';
	
	return xml;
}
function getXML_Issue(params){
	var xml = '';
	xml += '<issue>';
	xml +=    '<severity value="'    + params.severity + '"/>';
	xml +=    '<code value="'        + params.code + '"/>';
	if (params.details != null)
		xml +='<details value="' + params.details + '"/>';	
	if (params.diagnostics != null)
		xml +='<diagnostics value="' + params.diagnostics + '"/>';

	xml += '</issue>';
	return xml;
}
function getXML_InsertEntryStatus(xml, status){
	var positionEntryStatus = 3;
	var positionCharEntry = xml.indexOf("</entry>");
	var xmlReq = "";
	var xmlStart = "";
	var xmlEnd = "";
	// Este caso sería cuando no se encontró la transacción búscada
	
	if ( positionCharEntry == -1)
		xmlStart = xml;		
	else
	{
		var loops = 1;
		while(positionEntryStatus > loops && positionCharEntry != 0 )
		{			
			xmlStart += xml.substring(0 , (positionCharEntry + 8));
			xml = xml.substring(positionCharEntry + 8);
			positionCharEntry = xml.indexOf("</entry>");
			xmlEnd = xml;
			loops++;
		}		
	}
	var statusText = "";
	
	switch(status)
	{
		case 0:
			statusText = "transacción procesada"; break;
		case 1:
			statusText = "transacción pendiente de proceso"; break;
		case 2:
			statusText = "no se encontraron datos por el filtro solicitado"; break;
	}
	
	xmlReq = xmlStart;
	xmlReq += '<entry>';
	xmlReq +=    '<fullUrl value="url con el value set de los status" />';
	xmlReq +=    '<response>';		
	xmlReq +=        '<status value="' + statusText + '" />';
	xmlReq +=    '</response>';	
	xmlReq += '</entry>';
	
	xmlReq += xmlEnd;
	
	return xmlReq;
}

exports.getResponseDebitoByFilters				= getResponseDebitoByFilters;
exports.getFieldValue 							= getFieldValue;
exports.createXMLTag 							= createXMLTag;
exports.getInstanceObject 						= getInstanceObject;
exports.jsonToXMLfromInstance 					= jsonToXMLfromInstance;
exports.getFacturacionOperationOutcomeOK 		= getFacturacionOperationOutcomeOK;
exports.validateErrorsXSD_XML 					= validateErrorsXSD_XML;
exports.getFacturacionOperationOutcomeErrors 	= getFacturacionOperationOutcomeErrors;
exports.getXML_documentReferencePut				= getXML_documentReferencePut;
exports.getXML_OperationOutcome					= getXML_OperationOutcome;
exports.getXML_InsertEntryStatus				= getXML_InsertEntryStatus;
exports.getXML_HeaderDebito						= getXML_HeaderDebito;
exports.getEstructuraFecha						= getEstructuraFecha;