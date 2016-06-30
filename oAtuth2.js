var guid = require("guid");
// TO DO : a medida que se utilicen diferentes formas de obtener el Token, ir armando la lógica de consulta

var oAuth2 = {
	Tokens 	  : {
		QtyControlUntilTokens 	 : 500,
		actualControlUntilTokens : 0,
		Add 			 : function(token, obj){
			// Al llamar a esta función SI O SI, hay que pasarle tres parámetros
			//    -- UntilDate
			//    -- GrantType = este debe coincidir literal con al nombre que se le haya dado dentro de oAuth2.GrantType.XXXXXX
			//    -- Operation = operación desde la cual se pide acceso
			//    -- Method    = tipo de método del servicio (GET, POST, etc, etc)			
			eval('oAuth2.Tokens.Elements.' + token + ' = ' + JSON.stringify(obj) + ';');
			eval('oAuth2.Tokens.Elements.' + token + '.UntilDate = new Date(oAuth2.Tokens.Elements.' + token + '.UntilDate);');			
		},
		ValidToken 		 : function(token, operation, method){
			oAuth2.Tokens.actualControlUntilTokens++;
			
			if (oAuth2.Tokens.actualControlUntilTokens > oAuth2.Tokens.QtyControlUntilTokens)
			{
				oAuth2.Tokens.CleanUntilTokens();
				oAuth2.Tokens.actualControlUntilTokens = 0;
			}
			
			if (token.indexOf("=") != -1) return null;			
			var objToken;
			eval("objToken = oAuth2.Tokens.Elements." + token + ";");			
			
			if (objToken != undefined) {
				if (!(new Date() - objToken.UntilDate ) <= oAuth2.GrantType.Password.TimeExpire_Miliseconds
					&& (operation == null || objToken.Operation == operation ) 
					&& (method    == null || objToken.Method    == method) )
					objToken = GetCloneObject(objToken);
				
				eval("delete oAuth2.Tokens.Elements." + token + ";");
			}
			return objToken==undefined?null:objToken;
		},
		CleanUntilTokens : function() {
			var itemsClean  = new Array();
			var now 		= new Date();
			for(element in oAuth2.Tokens.Elements)
			{
				var item = eval("oAuth2.Tokens.Elements." + element + ";")
				
				if ((now - item.UntilDate ) >= eval("oAuth2.GrantType." + item.GrantType + ".TimeExpire_Miliseconds"))					
					itemsClean.push("delete oAuth2.Tokens.Elements." + element + ";");
			}
			for(element in itemsClean)
			{ eval(itemsClean[element]); }
		},
		Elements 		 : {}
	},	
	GrantType : {
		Password:{
			Elements   			   : [],			
			ValidToken 			   : function(token, operation, method ){
				return oAuth2.Tokens.ValidToken(token, operation, method);
			},			
			GetToken   			   : function(clientId, password, operationName, method){
				return GetToken("Password", {ClientId : Decode(clientId, oAuth2.GrantType.Password.Base), 
											 Password : Decode(password, oAuth2.GrantType.Password.Base), 
											 Operation : operationName, 
											 Method : method }
								);
			},
			TimeExpire_Miliseconds : 60000, // 60000 = 60 segundos = 1 minuto
			Base				   : "none"
		}
	}
};

function Add_oAuth2_GrantType_Password (clientId, pass){
	oAuth2.GrantType.Password.Elements.push(
					{						
						ClientID 	: clientId,
						Password 	: pass						
					}
	);
}
		 Add_oAuth2_GrantType_Password("1.2.3","123");
		 Add_oAuth2_GrantType_Password("2.16.840.1.113883.2.10.24.2.1.1","123");
		 Add_oAuth2_GrantType_Password("2.16.840.1.113883.2.10.24.2.1.2","123");
		 Add_oAuth2_GrantType_Password("2.16.840.1.113883.2.10.24.2.1.3","123");
		 Add_oAuth2_GrantType_Password("2.16.840.1.113883.2.10.24.2.1.4","123");
		 Add_oAuth2_GrantType_Password("2.16.840.1.113883.2.10.24.2.1.5","123");
		 Add_oAuth2_GrantType_Password("2.16.840.1.113883.2.10.24.2.1.9","123");


function GetToken       (grantType, params){	
	var token = null;
	var untilDate = new Date();	
	
	switch(grantType)
	{
		case "Password":
			untilDate.setMilliseconds(oAuth2.GrantType.Password.TimeExpire_Miliseconds);
			for(item in oAuth2.GrantType.Password.Elements)
			{
				var element = oAuth2.GrantType.Password.Elements[item];
				if (element.ClientID == params.ClientId && element.Password == params.Password){
					token = GetIDToken(untilDate, grantType, params.ClientId, params.Password, params.Operation, params.Method );
					break;
				}	
			}
		break;
	}
	
	return token;
}
function GetIDToken     (untilDate, grantType, clientId, password, operation, method){
	var token = guid.raw();
	while(token.indexOf("-") != -1)
	{
		token = token.replace("-","");
	}
	
	var charNumber = token.charCodeAt(0);
	if (charNumber >= 48 || charNumber <= 57)
		token = "t" + token.substring(1);
	
	oAuth2.Tokens.Add( token, { ClientId  : clientId , Password : password, GrantType : grantType,
								Operation : operation, Method   : method,   UntilDate : untilDate} );	
								
	return {Token:token, UntilDate: untilDate, GrantType: grantType, Operation: operation, Method: method};
}
function GetCloneObject (obj){
	var objClone = {};
	for(prop in obj)
	{
		eval("objClone." + prop + " = " + "obj." + prop + ";");
	}
	return objClone;
}
function Decode(data, base){
	var dataRet = data;
	switch(base){
		case "64":
			var b64 = new Buffer(data, 'base64')
			dataRet = b64.toString()			
		break;
	}
	return dataRet;
}

exports.oAuth2 = oAuth2;
		 
