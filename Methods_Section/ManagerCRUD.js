var accepts        = require('accepts')
var get_Methods    = require("./GET/Get.js");
var post_Methods   = require("./POST/Post.js");
var put_Methods    = require("./PUT/Put.js");
var patch_Methods  = require("./PATCH/Patch.js");
var delete_Methods = require("./DELETE/Delete.js");

function CRUD_Json_Struct(GetFunction, PostFuncion, PutFuncion, PatchFuncion, DeleteFunction){
	return {
		GET    : GetFunction,
		POST   : PostFuncion,
		PUT    : PutFuncion,
		PATCH  : PatchFuncion,
		DELETE : DeleteFunction
	};
}

function ManagerFunctionCRUD(params, CRUD_Functions, functionResponseCallBack){
	// TODO, definir -- responseMsg -- segun las diferentes respuestas por el tipo de petición (json, xml y html)
	var method = params.request.method.toLowerCase();
	var crud_function = eval("CRUD_Functions." + method);
	
	if ( typeof(crud_function) === "undefined" || crud_function == null )
	{
		var responseMsg;
		var accept = accepts(params.request);
		
		switch(accept.type(['json', 'html','xml']))
		{
			case 'json':
				console.log("pasa json");
				responseMsg = {Error:"Método " + method + " no soportado"};
				break;
			case 'html':
				console.log("pasa html");
				responseMsg = "Método " + method + " no soportado";
				break;
			case 'xml':
				console.log("pasa xml");
				responseMsg = "<xml>Método " + method + " no soportado</xml>";
				break;
		}
		
		functionResponseCallBack(responseMsg, params.request, params.response );
	}
	else
		eval( method + "_Methods." + (eval("CRUD_Functions." + method)) + "(params,functionResponseCallBack );"  );
}

exports.ManagerFunctionCRUD = ManagerFunctionCRUD;
exports.CRUD_Json_Struct 	= CRUD_Json_Struct;
