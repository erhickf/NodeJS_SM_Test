var server = require("./server.js");
var router = require("./router.js");
//var handlers = require("./handlers.js");

// Aquellas secciones de la url a capturar cuyo valor puede ser dinámico y corresponde a un valor del servicio rest, 
// deberá tener puesto un @ en vez la ruta.  
// Ejemplo 
//        handle["/cliente/@/get"] = handlers.retornarCliente; 
//    A la función retornarCliente le va a llegar el valor depositado en donde se encuentra el @
//
//        function retornarCliente(params){
//             	params.paramsPath[0] 

var handle = {}
/*handle["/SwissMedical/facturacion"] 				= handlers.facturacion;
handle["/SwissMedical/facturacion/@"] 				= handlers.facturacion;

handle["/SwissMedical/claimresponse/@"] 			= handlers.debitos_transaccion;
handle["/SwissMedical/debitos/transaccion/@"] 		= handlers.debitos_transaccion;
//http://dell-2-4nj-dg:8090/SwissMedical/debitos/fecha_hasta/20160103

//http://dell-2-4nj-dg:8090/SwissMedical/claimresponse/condition?fecha_hasta=20160103
handle["/SwissMedical/claimresponse/condition"] 	= handlers.debitos_busqueda;
handle["/SwissMedical/debitos/nro_factura/@"] 		= handlers.debitos_nroFactura;

handle["/SwissMedical/debitos/fecha_rango/@/@"]		= handlers.debitos_fechaRango;
handle["/SwissMedical/debitos/fecha_desde/@"]		= handlers.debitos_fechaDesde; // to do :fecha desde  => ddmmaa
handle["/SwissMedical/debitos/fecha_hasta/@"]		= handlers.debitos_fechaHasta; // to do :fecha hasta  => ddmmaa

handle["/SwissMedical/documentos"] 					= handlers.documentos;
handle["/SwissMedical/auth"] 						= handlers.auth;*/

server.iniciarServer(router.route, handle); 
