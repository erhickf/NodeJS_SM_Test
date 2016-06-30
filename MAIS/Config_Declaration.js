// SECCION MOCKEADA PARA VALIDAR DATA
var MOCK_Validacion_Afiliados  			= estructura_Mock_Validacion("40","No es afiliado o paciente dado de baja");
var MOCK_Validacion_Prestacion 			= estructura_Mock_Validacion("32","Práctica no convenida u homologada");
var MOCK_Validacion_Planes_Prestador    = estructura_Mock_Validacion("31","Plan no cubierto para la institución");
var MOCK_Validacion_Afiliado_Prestacion = estructura_Mock_Validacion("33","A cargo del afiliado (coseguro, topes, insumos,según orden emitida o modalidad operativa) no cubiertos por la entidad");

function estructura_Mock_Validacion(codigo, mensaje){
	return {
		CodigoError  : codigo,
		MensajeError : mensaje,
		Validos      : new Array()
	};
}
function instanciarValoresMock(){
	console.log("");
	console.log("> Instanciando valores MOCK");
	
	// --------------------------------------------------------------------- AFILIADOS
	MOCK_Validacion_Afiliados.Validos.push("123456789");
	MOCK_Validacion_Afiliados.Validos.push("987654321");
	MOCK_Validacion_Afiliados.Validos.push("0303456");
	
	// --------------------------------------------------------------------- PRESTACIONES
	MOCK_Validacion_Prestacion.Validos.push("42010100"); //  Consulta medica en consultorio
	MOCK_Validacion_Prestacion.Validos.push("990203");	 //  Consulta Psicología

	// --------------------------------------------------------------------- PLANES  >>  comentar aquel prestador que no debería de tener soporte a los planes		
	MOCK_Validacion_Planes_Prestador.Validos.push(relacionPrestadorPrestaciones("2.16.840.1.113883.2.10.24.2.1.1"));
	MOCK_Validacion_Planes_Prestador.Validos.push(relacionPrestadorPrestaciones("2.16.840.1.113883.2.10.24.2.1.2"));
	MOCK_Validacion_Planes_Prestador.Validos.push(relacionPrestadorPrestaciones("2.16.840.1.113883.2.10.24.2.1.3"));
	MOCK_Validacion_Planes_Prestador.Validos.push(relacionPrestadorPrestaciones("2.16.840.1.113883.2.10.24.2.1.4"));
	MOCK_Validacion_Planes_Prestador.Validos.push(relacionPrestadorPrestaciones("2.16.840.1.113883.2.10.24.2.1.5"));

	// --------------------------------------------------------------------- AFILIADO PRESTACION
	for(item in MOCK_Validacion_Afiliados.Validos){
		var afiliado = MOCK_Validacion_Afiliados.Validos[item];
		MOCK_Validacion_Afiliado_Prestacion.Validos.push(relacionAfiliadoPrestaciones(afiliado));
	}
	
	console.log(">> Fin de instancia de valores MOCK");
}
function relacionPrestadorPrestaciones(idPrestador){
	var objRet = {
		Prestador:idPrestador,
		PrestacionesValidas:new Array()
	};
	for(prestacoin in MOCK_Validacion_Prestacion.Validos)
	{
		objRet.PrestacionesValidas.push(MOCK_Validacion_Prestacion.Validos[prestacoin]);
	}
	return objRet;
}
function relacionAfiliadoPrestaciones(idAfiliado){
	var objRet = {
		Afiliado:idAfiliado,
		PrestacionesValidas:new Array()
	};
	for(prestacoin in MOCK_Validacion_Prestacion.Validos)
	{
		objRet.PrestacionesValidas.push(MOCK_Validacion_Prestacion.Validos[prestacoin]);
	}
	return objRet;
}
function MOCK_Codigo_Valido(estructura, codigo){
	for(item in estructura){
		if (estructura[item] == codigo)
			return true;
	}
	
	return false;
}
// -------------------------------------------------------------------------------------------------------------------------

var documentReference = {
	Tipo : 			"Bundle.type[0].$.value",
	FullURL : 		"Bundle.entry[0].type[0].$.value",
	Id : 			"Bundle.entry[0].resource[0].Binary[0].Id[0].$.value",
	TipoArchivo : 	"Bundle.entry[0].resource[0].Binary[0].contentType[0].$.value",
	CadenaBinaria : "Bundle.entry[0].resource[0].Binary[0].content[0].$.value"
};
var facturacion = {
	Prestador : {
		Id_Mais:     "Bundle.entry[0].resource[0].Organization[0].identifier[0].value[0].$.value",
		Id_Interno : "Bundle.entry[0].resource[0].Organization[0].id[0].$.value",
		Method :     "Bundle.entry[0].request[0].method[0].$.value",
		URL_Request :"Bundle.entry[0].request[0].url[0].$.value"
	},
	Financiador : {
		Id_Mais :    "Bundle.entry[1].resource[0].Organization[0].identifier[0].value[0].$.value",
		Id_Interno : "Bundle.entry[1].resource[0].Organization[0].id[0].$.value",
		Method :     "Bundle.entry[1].request[0].method[0].$.value",
		URL_Request :"Bundle.entry[1].request[0].url[0].$.value"		
	},
	Array_Facturas :{
		RamaArray :     "Bundle.entry[2].resource[0].Claim",
		Afiliado:{
			Id  :       "Bundle.entry[2].resource[0].Claim[X].contained[0].Patient[0].id[0].$.value",
			Nro :       "Bundle.entry[2].resource[0].Claim[X].contained[0].Patient[0].identifier[0].value[0].$.value",
			DNI :       "Bundle.entry[2].resource[0].Claim[X].contained[0].Patient[0].identifier[1].value[0].$.value",
			Apellido :  "Bundle.entry[2].resource[0].Claim[X].contained[0].Patient[0].name[0].family[0].$.value",
			Nombre :    "Bundle.entry[2].resource[0].Claim[X].contained[0].Patient[0].name[0].given[0].$.value",
			URL :       "Bundle.entry[2].resource[0].Claim[X].contained[0].Patient[0].identifier[0].system[0].$.value",
			IVA:{
				Codigo :       "Bundle.entry[2].resource[0].Claim[X].contained[0].Patient[0].modifierExtension[0].valueCoding[0].code[0].$.value",
				Descripcion :       "Bundle.entry[2].resource[0].Claim[X].contained[0].Patient[0].modifierExtension[0].valueCoding[0].display[0].$.value"
			}
		},
		Prescriptor:{
				Matricula:{
					Tipo: "Bundle.entry[2].resource[0].Claim[X].contained[1].Practitioner[0].identifier[0].system[0].$.value",
					Nro:  "Bundle.entry[2].resource[0].Claim[X].contained[1].Practitioner[0].identifier[0].value[0].$.value",
					Letra:"Bundle.entry[2].resource[0].Claim[X].contained[1].Practitioner[0].identifier[0].assigner[0].display[0].$.value"
				},
				CUIT:     "Bundle.entry[2].resource[0].Claim[X].contained[1].Practitioner[0].identifier[1].value[0].$.value"
		},
		Efector:{
				Matricula:{
					Tipo:       "Bundle.entry[2].resource[0].Claim[X].contained[2].Practitioner[0].identifier[0].system[0].$.value",
					Nro:        "Bundle.entry[2].resource[0].Claim[X].contained[2].Practitioner[0].identifier[0].value[0].$.value",
					Letra:      "Bundle.entry[2].resource[0].Claim[X].contained[2].Practitioner[0].identifier[0].assigner[0].display[0].$.value"
				},
				CUIT:           "Bundle.entry[2].resource[0].Claim[X].contained[1].Practitioner[0].identifier[1].value[0].$.value",
				Profesion:{
					Codigo:     "Bundle.entry[2].resource[0].Claim[X].contained[1].Practitioner[0].practitionerRole[0].role[0].coding[0].code[0].$.value",
					Descripcion:"Bundle.entry[2].resource[0].Claim[X].contained[1].Practitioner[0].practitionerRole[0].role[0].coding[0].display[0].$.value",
				}
		},		
		Autorizacion:{
			PFM37:              "Bundle.entry[2].resource[0].Claim[X].contained[2].ClaimResponse[0].identifier[0].value[0].$.value",
		},
		Episodio:{
			Id:                    "Bundle.entry[2].resource[0].Claim[X].contained[3].Encounter[0].id[0].$.value",
			OID:                   "Bundle.entry[2].resource[0].Claim[X].contained[3].Encounter[0].identifier[0].system[0].$.value",
			Nro_Episodio_Prestador:"Bundle.entry[2].resource[0].Claim[X].contained[3].Encounter[0].identifier[0].value[0].$.value",
			Tipo_Episodio:         "Bundle.entry[2].resource[0].Claim[X].contained[3].Encounter[0].class[0].$.value",
			Fecha:{
				Inicio:            "Bundle.entry[2].resource[0].Claim[X].contained[3].Encounter[0].period[0].start[0].$.value",
				Fin:               "Bundle.entry[2].resource[0].Claim[X].contained[3].Encounter[0].period[0].end[0].$.value"
			},
			Tiempo:{
				Medida:            "Bundle.entry[2].resource[0].Claim[X].contained[3].Encounter[0].length[0].value[0].$.value",
				Cantidad:          "Bundle.entry[2].resource[0].Claim[X].contained[3].Encounter[0].length[0].code[0].$.value"
			}
		},
		Documento:{
			ID:               "Bundle.entry[2].resource[0].Claim[X].contained[4].DocumentReference[0].masterIdentifier[0].value[0].$.value",
			Tipo:{
				Codigo:       "Bundle.entry[2].resource[0].Claim[X].contained[4].DocumentReference[0].type[0].coding[0].code[0].$.value",
				Desripcion:   "Bundle.entry[2].resource[0].Claim[X].contained[4].DocumentReference[0].type[0].coding[0].display[0].$.value",
				MIME:         "Bundle.entry[2].resource[0].Claim[X].contained[4].DocumentReference[0].content[0].attachment[0].contentType[0].$.value"
			},
			Fecha_Creacion:   "Bundle.entry[2].resource[0].Claim[X].contained[4].DocumentReference[0].indexed[0].$.value",
			Estado:           "Bundle.entry[2].resource[0].Claim[X].contained[4].DocumentReference[0].status[0].$.value",
			URL:              "Bundle.entry[2].resource[0].Claim[X].contained[4].DocumentReference[0].content[0].attachment[0].url[0].$.value"
		},
		Reliquidacion:{
			Si:     "Bundle.entry[2].resource[0].Claim[X].modifierExtension[0].valueBoolean[0].$.value",
			Factura:"Bundle.entry[2].resource[0].Claim[X].modifierExtension[1].valueBoolean[0].valueIdentifier[0].value[0].$.value"
		},		
		Tipo :                     "Bundle.entry[2].resource[0].Claim[X].type[0].$.value",
		Id_Unico_Renglon_Prestador:"Bundle.entry[2].resource[0].Claim[X].identifier[0].value[0].$.value",
		Factura_OID_Prestador:     "Bundle.entry[2].resource[0].Claim[X].identifier[1].system[0].$.value",
		Factura_Nro:               "Bundle.entry[2].resource[0].Claim[X].identifier[1].value[0].$.value",
		Fecha_Liquidacion:         "Bundle.entry[2].resource[0].Claim[X].created[0].$.value",
		Prioridad:                 "Bundle.entry[2].resource[0].Claim[X].priority[0].code[0].$.value",
		Array_Diagnosticos:{
			RamaArray : "Bundle.entry[2].resource[0].Claim[X].diagnosis",
			//ID:"Bundle.entry[2].resource[0].Claim[X].diagnosis[X].sequence[0].$.value",
			Codigo:     "Bundle.entry[2].resource[0].Claim[X].diagnosis[X].diagnosis[0].code[0].$.value",
			Descripcion:"Bundle.entry[2].resource[0].Claim[X].diagnosis[X].diagnosis[0].display[0].$.value"
		},
		Array_Coberturas:{
			RamaArray : "Bundle.entry[2].resource[0].Claim[X].coverage",
			Relacion:{
				Codigo:     "Bundle.entry[2].resource[0].Claim[X].coverage[X].relationship[0].code[0].$.value",
				Descripcion:"Bundle.entry[2].resource[0].Claim[X].coverage[X].relationship[0].display[0].$.value"
			},
			Nro_Orden:      "Bundle.entry[2].resource[0].Claim[X].coverage[X].preAuthRef[0].$.value",
			Normas_Facturacion:{
				Codigo:     "Bundle.entry[2].resource[0].Claim[X].coverage[X].originalRuleset[0].code[0].$.value",
				Descripcion:"Bundle.entry[2].resource[0].Claim[X].coverage[X].originalRuleset[0].display[0].$.value"
			}
		},
		Array_Items:{
			RamaArray : "Bundle.entry[2].resource[0].Claim[X].item",
			Secuencia : "Bundle.entry[2].resource[0].Claim[X].item[X].sequence[0].$.value",
			Valores:{
				Gsatos:         "Bundle.entry[2].resource[0].Claim[X].item[X].modifierExtension[0].valueDecimal[0].$.value",
				Honorarios:     "Bundle.entry[2].resource[0].Claim[X].item[X].modifierExtension[1].valueDecimal[0].$.value",				
				Importe_Gravado:"Bundle.entry[2].resource[0].Claim[X].item[X].modifierExtension[2].valueDecimal[0].$.value",
				Importe_Exento: "Bundle.entry[2].resource[0].Claim[X].item[X].modifierExtension[3].valueDecimal[0].$.value"
			},
			Prestacion:{
				ID:                    "Bundle.entry[2].resource[0].Claim[X].item[X].sequence[0].$.value",
				OID:      		   	   "Bundle.entry[2].resource[0].Claim[X].item[X].type[0].system[0].$.value",
				Codigo:      		   "Bundle.entry[2].resource[0].Claim[X].item[X].type[0].code[0].$.value",
				Descripcion: 		   "Bundle.entry[2].resource[0].Claim[X].item[X].type[0].display[0].$.value",
				OID_Homologado:    	   "Bundle.entry[2].resource[0].Claim[X].item[X].service[0].system[0].$.value",
				Codigo_Homologado:     "Bundle.entry[2].resource[0].Claim[X].item[X].service[0].code[0].$.value",
				Descripcion_Homologado:"Bundle.entry[2].resource[0].Claim[X].item[X].service[0].display[0].$.value",
				Importe:               "Bundle.entry[2].resource[0].Claim[X].item[X].quantity[0].net[0].value[0].$.value",
				Moneda:                "Bundle.entry[2].resource[0].Claim[X].item[X].quantity[0].net[0].unit[0].$.value",
			},
			Fecha_Prestacion: "Bundle.entry[2].resource[0].Claim[X].item[X].serviceDate[0].$.value",
			Cantidad_Provista:"Bundle.entry[2].resource[0].Claim[X].item[X].quantity[0].$.value",			
			Array_Detalles:
			{
				RamaArray : "Bundle.entry[2].resource[0].Claim[X].item[X].detail",
				Secuencia : "Bundle.entry[2].resource[0].Claim[X].item[X].detail[X].sequence[0].$.value",
				Servicio:{
					Codigo:     "Bundle.entry[2].resource[0].Claim[X].item[X].detail[X].type[0].code[0].$.value",
					Descripcion:"Bundle.entry[2].resource[0].Claim[X].item[X].detail[X].type[0].display[0].$.value"
				},
				Adicional:{
					Codigo:     "Bundle.entry[2].resource[0].Claim[X].item[X].detail[X].service[0].code[0].$.value",
					Descripcion:"Bundle.entry[2].resource[0].Claim[X].item[X].detail[X].service[0].display[0].$.value"
				},
				Cantidad:"Bundle.entry[2].resource[0].Claim[X].item[X].detail[X].quantity[0].$.value",
				Total:{
					Moneda: "Bundle.entry[2].resource[0].Claim[X].item[X].detail[X].net[0].value[0].$.value",
					Importe:"Bundle.entry[2].resource[0].Claim[X].item[X].detail[X].net[0].unit[0].$.value"
				}
			}
		}
	}
}; 

var AccesDB_Path = "MAIS.accdb";

var Transaction_Manager = new Array();
var idOrganizacion = "5";
var pathXML_Facturacion_Request = "xmlRequest.xml";

var OID_SwissMedical_Prestador     = "2.16.840.1.113883.2.10.24.2.1.3";
var OID_SwissMedical_Financiador   = "2.16.840.1.113883.2.10.24.2.2.5";
var OIDS_Arbol_Financiador  	 = {
	DOCUMENTOS_GENERADOS:									OID_SwissMedical_Financiador + ".1",
	SET_DE_DOCUMENTOS:										OID_SwissMedical_Financiador + ".2",
	NUMERO_DE_HISTORIA_CLINICA_INTERNA:						OID_SwissMedical_Financiador + ".3",
	IDENTIFICADOR_DE_SERVICIO_O_DEPARTAMENTO:				OID_SwissMedical_Financiador + ".4",
	IDENTIFICADOR_DE_SECCION:								OID_SwissMedical_Financiador + ".5",
	IDENTIFICADOR_DE_PLANES:								OID_SwissMedical_Financiador + ".6",
	NUMEROS_DE_CARNET_DE_AFILIADOS:							OID_SwissMedical_Financiador + ".7",
	IDENTIFICADOR_DE_EPISODIOS:								OID_SwissMedical_Financiador + ".8",
	NUMEROS_DE_TRANSACCIONES:								OID_SwissMedical_Financiador + ".9",
	NUMEROS_DE_FACTURAS:									OID_SwissMedical_Financiador + ".10",
	NUMERO_DE_ITEM_DE_FACTURAS:								OID_SwissMedical_Financiador + ".11",
	IDENTIFICACION_CÓDIGO_DE_PRESTACION_DE_LA_ORGANIZACION:	OID_SwissMedical_Financiador + ".12",
};

var OID_Prestadores_Raiz   = "2.16.840.1.113883.2.10.24.2.1.";
var OID_Financiadores_Raiz = "2.16.840.1.113883.2.10.24.2.2.";
var OIDS_Organizacionales ={
	Prestadores:{
		Hospital_Aleman :		OID_Prestadores_Raiz + "1",
		Hospital_Italiano :		OID_Prestadores_Raiz + "2",
		Suizo_Argentina :		OID_Prestadores_Raiz + "3",
		Fleni :					OID_Prestadores_Raiz + "4",
		Sanatorio_Otamendi :	OID_Prestadores_Raiz + "5",
		MOCK :	OID_Prestadores_Raiz + "9",
	},
	Financiadores:{
		Hospital_Aleman :	OID_Financiadores_Raiz + "1",
		Hospital_Italiano : OID_Financiadores_Raiz + "2",
		Medicus :			OID_Financiadores_Raiz + "3",
		Omint : 			OID_Financiadores_Raiz + "4",
		Swiss_Medical :		OID_Financiadores_Raiz + "5",
		OSDE :				OID_Financiadores_Raiz + "6"
	}
};

var OID_Plantillas_Documentos_Raiz = "2.16.840.1.113883.2.10.24.2.1.";
var OID_Plantillas_Secciones_Raiz  = "2.16.840.1.113883.2.10.24.2.2.";
var OIDS_Plantillas              = {
	Documentos:{
		Epicrisis : 					OID_Plantillas_Documentos_Raiz + "1",
		Protocolo_Quirurgico : 			OID_Plantillas_Documentos_Raiz + "2",
		Historia_Clinica_Ingreso : 		OID_Plantillas_Documentos_Raiz + "3",
		Evolucion_Interconsulta :       OID_Plantillas_Documentos_Raiz + "4",
		Hoja_De_Indicaciones :       	OID_Plantillas_Documentos_Raiz + "5",
		Hoja_De_Enfermeria :       		OID_Plantillas_Documentos_Raiz + "6",
		Informa_Medico_Preadmicion :    OID_Plantillas_Documentos_Raiz + "7",
		Informe_Estudio_Ap :       		OID_Plantillas_Documentos_Raiz + "8",
		Protocolo_De_Anestecia :       	OID_Plantillas_Documentos_Raiz + "9",
		Consentimiento_Informado :      OID_Plantillas_Documentos_Raiz + "10",
		Informe_De_Estudio_Laboratorio :OID_Plantillas_Documentos_Raiz + "11",
		Protocolo_De_Procedimiento :	OID_Plantillas_Documentos_Raiz + "12",
		Carta_De_Cobertura :			OID_Plantillas_Documentos_Raiz + "13",
		Orden_Medica :					OID_Plantillas_Documentos_Raiz + "14"
	},
	Secciones:{
		Motivo_De_Ingreso :					OID_Plantillas_Secciones_Raiz + "1",
		Diagnostico_Presuntivo_De_Ingreso :	OID_Plantillas_Secciones_Raiz + "2",
		Antecedentes_Familiares :			OID_Plantillas_Secciones_Raiz + "3",
		Antecedentes_Personales :			OID_Plantillas_Secciones_Raiz + "4",
		Historia_De_La_Enfermedad_Actual :	OID_Plantillas_Secciones_Raiz + "5",
		Examen_Fisico :						OID_Plantillas_Secciones_Raiz + "6",
		Curso_Clinico :						OID_Plantillas_Secciones_Raiz + "7",
		Diagnostico_De_Egreso :				OID_Plantillas_Secciones_Raiz + "8",
		Medicacion_Al_Alta :				OID_Plantillas_Secciones_Raiz + "9",
		Indicaciones_Al_Alta :				OID_Plantillas_Secciones_Raiz + "10",
		Estudios_Complementarios :			OID_Plantillas_Secciones_Raiz + "11",
		Plan_De_Seguimiento :				OID_Plantillas_Secciones_Raiz + "12",
		Procedimientos_Intervenciones :		OID_Plantillas_Secciones_Raiz + "13",
		Complicaciones :					OID_Plantillas_Secciones_Raiz + "14",
		Deatelle_De_Ubicaciones :			OID_Plantillas_Secciones_Raiz + "15",
		Informacion_Demografica :			OID_Plantillas_Secciones_Raiz + "16"
	}
};

var OID_Varios_Documentos_Identidad_Raiz = "2.16.840.1.113883.2.10.24.4.";
var OID_Varios_Matriculas_Medicas_Raiz   = "2.16.840.1.113883.2.10.24.7.";
var OIDS_Varios = {
	Documentos_Identidad:{
		DNI :							OID_Varios_Documentos_Identidad_Raiz + "1",
		Cedula :						OID_Varios_Documentos_Identidad_Raiz + "2",
		Libreta_Civica :				OID_Varios_Documentos_Identidad_Raiz + "3",
		Libre_De_Enrolamiento :			OID_Varios_Documentos_Identidad_Raiz + "4",
		CUIT :							OID_Varios_Documentos_Identidad_Raiz + "5",
		CUIL :							OID_Varios_Documentos_Identidad_Raiz + "6",
		Numero_Pasaporte_Argentino :	"2.16.840.1.113883.4.330.2",
		Numero_Pasaporte_Otros_Paises :	"2.16.840.1.113883.4.330.x"
	},
	Matriculas_Medicas:{
		Matricula_Nacional : 	OID_Varios_Matriculas_Medicas_Raiz + "1",
		Buenos_Aires :			OID_Varios_Matriculas_Medicas_Raiz + "2",
		Catamarca :				OID_Varios_Matriculas_Medicas_Raiz + "3",
		Chaco :					OID_Varios_Matriculas_Medicas_Raiz + "4",
		Chubut :				OID_Varios_Matriculas_Medicas_Raiz + "5",
		Cordoba :				OID_Varios_Matriculas_Medicas_Raiz + "6",
		Corrientes :			OID_Varios_Matriculas_Medicas_Raiz + "7",
		Entre_Ríos :			OID_Varios_Matriculas_Medicas_Raiz + "8",
		Formosa :				OID_Varios_Matriculas_Medicas_Raiz + "9",
		Jujuy :					OID_Varios_Matriculas_Medicas_Raiz + "10",
		La_Pampa :				OID_Varios_Matriculas_Medicas_Raiz + "11",
		La_Rioja :				OID_Varios_Matriculas_Medicas_Raiz + "12",
		Mendoza :				OID_Varios_Matriculas_Medicas_Raiz + "13",
		Misiones :				OID_Varios_Matriculas_Medicas_Raiz + "14",
		Neuguen :				OID_Varios_Matriculas_Medicas_Raiz + "15",
		Rio_Negro :				OID_Varios_Matriculas_Medicas_Raiz + "16",
		Salta :					OID_Varios_Matriculas_Medicas_Raiz + "17",
		San_Juan :				OID_Varios_Matriculas_Medicas_Raiz + "18",
		San_Luis :				OID_Varios_Matriculas_Medicas_Raiz + "19",
		Santa_Cruz :			OID_Varios_Matriculas_Medicas_Raiz + "20",
		Santa_Fe :				OID_Varios_Matriculas_Medicas_Raiz + "21",
		Santiago_Del_Estero :	OID_Varios_Matriculas_Medicas_Raiz + "22",
		Tierra_Del_Fuego :		OID_Varios_Matriculas_Medicas_Raiz + "23",
		Tucuman :				OID_Varios_Matriculas_Medicas_Raiz + "24"
	}	
};

var OID_Value_Sets_Raiz = "2.16.840.1.113883.2.10.24.";
var OIDS_Value_Sets ={
	Tipos_De_Docuemtos_Mais :	OID_Value_Sets_Raiz + "3",
	Especialidades :			OID_Value_Sets_Raiz + "5",
	Sub_Especialidades :		OID_Value_Sets_Raiz + "6",
	Ambito_De_Internacion :		OID_Value_Sets_Raiz + "8",
	Tipos_De_Internacion :		OID_Value_Sets_Raiz + "9",
	Tipos_De_Estudios_AP :		OID_Value_Sets_Raiz + "10",
	Tipos_De_Estudios_LAB :		OID_Value_Sets_Raiz + "11",
	Tipos_De_Estudios_DPI :		OID_Value_Sets_Raiz + "12"
};

// Ejemplo de como validar esta estructura :)
//   console.log(    maisCD.OIDValido( maisCD.OIDS_Arbol_Por_Organizacion.Identificador_De_Servicio_O_Departamento.Financiadores, "2.16.840.1.113883.2.10.24.2.2.5.4" )    );
var OIDS_Arbol_Por_Organizacion = {
	Documentos_Generados :						createArbolPrestadorFinanciador("1"),
	Set_De_Documentos :							createArbolPrestadorFinanciador("2"),
	Numero_De_Historia_Clinica_Interna :		createArbolPrestadorFinanciador("3"),
	Identificador_De_Servicio_O_Departamento :	createArbolPrestadorFinanciador("4"),
	Identificador_De_Seccion : 					createArbolPrestadorFinanciador("5"),
	Identificador_De_Planes :					createArbolPrestadorFinanciador("6"),
	Numeros_De_Carnet_De_Afiliados :			createArbolPrestadorFinanciador("7"),
	Identificador_De_Episodios :				createArbolPrestadorFinanciador("8"),
	Numeros_De_Transacciones :					createArbolPrestadorFinanciador("9"),
	Numeros_De_Facturas :						createArbolPrestadorFinanciador("10"),
	Numero_De_Item_De_Factura :					createArbolPrestadorFinanciador("11")
};

var Array_OID_Tablas             = new Array();

// FUNCION PUBLICA
// EJEMPLO USO
//    var maisCD = require("./MAIS/Config_Declaration.js");
//    console.log("deberia de ser true  = " + maisCD.OIDValido( maisCD.OIDS_Organizacionales.Prestadores, "2.16.840.1.113883.2.10.24.2.1.3")    );
//    console.log("deberia de ser false = " + maisCD.OIDValido( maisCD.OIDS_Organizacionales.Prestadores, "2.16.840.1.113883.2.10.24.2.1.8886") );
function OIDValido(estructura, OID){
	for(prop in estructura){
		if (estructura[prop] == OID)
			return true;
	}
	
	return false;
}

function createArbolPrestadorFinanciador(id){
	var rama = {
		Prestadores:  {},
		Financiadores:{}
	};
		
	for(item in OIDS_Organizacionales.Prestadores)
	{
		eval("rama.Prestadores." + item + " = '" + eval("OIDS_Organizacionales.Prestadores." + item) + "." + id + "';");		
	}

	for(item in OIDS_Organizacionales.Financiadores)
	{
		eval("rama.Financiadores." + item + " = '" + eval("OIDS_Organizacionales.Financiadores." + item) + "." + id + "';");		
	}
	
	return rama;
}

// **********************************************************************************************************************************
// **********************************************************************************************************************************
// **********************************************************************************************************************************
Array_OID_Tablas["2.16.840.1.113883.2.10.24.3.1"]={   Descripcion:"TIPO DE REPORTE RADIOLOGICO", Codigo:"18748-4", Concepto:"Reporte de Diagnóstico por Imágenes", Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.3.2"]={   Descripcion:"TIPO DE REPORTE RADIOLOGICO", Codigo:"18747-6", Concepto:"Reporte de Tomografía Computada",     Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.3.3"]={   Descripcion:"TIPO DE REPORTE RADIOLOGICO", Codigo:"18755-9", Concepto:"Reporte de Resonancia Magnética",     Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.3.4"]={   Descripcion:"TIPO DE REPORTE RADIOLOGICO", Codigo:"18760-9", Concepto:"Reporte de Ecografía",                Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.3.5"]={   Descripcion:"TIPO DE REPORTE RADIOLOGICO", Codigo:"18757-5", Concepto:"Reporte de Medicina Nuclear",         Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.3.6"]={   Descripcion:"TIPO DE REPORTE RADIOLOGICO", Codigo:"18758-3", Concepto:"Reporte de Escaneado PET",            Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.3.7"]={   Descripcion:"TIPO DE REPORTE RADIOLOGICO", Codigo:"18745-0", Concepto:"Reporte de Cateterización Cardíaca",  Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.3.8"]={   Descripcion:"TIPO DE REPORTE RADIOLOGICO", Codigo:"11522-0", Concepto:"Reporte de Ecocardiografía",          Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.3.9"]={   Descripcion:"TIPO DE REPORTE RADIOLOGICO", Codigo:"18746-8", Concepto:"Reporte de Colonoscopía",             Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.3.10"]={  Descripcion:"TIPO DE REPORTE RADIOLOGICO", Codigo:"18751-8", Concepto:"Reporte de Endoscopía",               Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.3.11"]={  Descripcion:"TIPO DE REPORTE RADIOLOGICO", Codigo:"11525-3", Concepto:"Reporte de Ecografía Obstétrica",     Code_System_Origen:"2.16.840.1.113883.6.1"};
// ------------------------------------------------------------------------------------------------------------------------------
Array_OID_Tablas["2.16.840.1.113883.2.10.24.3.12"]={  Descripcion:"TIPOS DE DOCUMENTO", Codigo:"18842-5", Concepto:"EPICRISIS",                           Code_System_Origen:"	2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.3.13"]={  Descripcion:"TIPOS DE DOCUMENTO", Codigo:"34874-8", Concepto:"PROTOCOLO QUIRURGICO",                Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.3.14"]={  Descripcion:"TIPOS DE DOCUMENTO", Codigo:"67582-4", Concepto:"HISTORIA_CLINICA_INGRESO",            Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.5.1.15"]={        Descripcion:"TIPOS DE DOCUMENTO", Codigo:"34112-3", Concepto:"EVOLUCION_INTERCONSULTA",             Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.5.1.16"]={        Descripcion:"TIPOS DE DOCUMENTO", Codigo:"56447-6", Concepto:"HOJA_DE_INDICACIONES",                Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.5.1.17"]={        Descripcion:"TIPOS DE DOCUMENTO", Codigo:"34746-8", Concepto:"HOJA_DE_ENFERMERIA",                  Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.18"]={  Descripcion:"TIPOS DE DOCUMENTO", Codigo:"57830-2", Concepto:"INFORME_MEDICO_PREADMISION",          Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.19"]={  Descripcion:"TIPOS DE DOCUMENTO", Codigo:"11526-1", Concepto:"INFORME_ESTUDIO_AP",                  Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.20"]={  Descripcion:"TIPOS DE DOCUMENTO", Codigo:"34750-0", Concepto:"PROTOCOLO_DE_ANESTESIA",              Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.21"]={  Descripcion:"TIPOS DE DOCUMENTO", Codigo:"59284-0", Concepto:"CONSENTIMIENTO INFORMADO",            Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.22"]={  Descripcion:"TIPOS DE DOCUMENTO", Codigo:"11502-2", Concepto:"INFORME_DE_ESTUDIO_LABORATORIO",      Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.23"]={  Descripcion:"TIPOS DE DOCUMENTO", Codigo:"28570-0", Concepto:"PROTOCOLO_DE_PROCEDIMIENTO",          Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.24"]={  Descripcion:"TIPOS DE DOCUMENTO", Codigo:"18748-4", Concepto:"INFORME DE DIAGNOSTICO POR IMAGENES", Code_System_Origen:"2.16.840.1.113883.6.1"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.25"]={  Descripcion:"TIPOS DE DOCUMENTO", Codigo:"52019-7", Concepto:"INFORME DE ATENCION PREHOSPITALARIA", Code_System_Origen:"2.16.840.1.113883.6.1"};
// ------------------------------------------------------------------------------------------------------------------------------
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.26"]={  Descripcion:"ESPECIALIDAD", Codigo:"3",  Concepto:"ALERGIA E INMUNOLOGIA",                        Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.27"]={  Descripcion:"ESPECIALIDAD", Codigo:"69", Concepto:"ALERGIA E INMUNOLOGIA PEDIATRICA",             Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.28"]={  Descripcion:"ESPECIALIDAD", Codigo:"53", Concepto:"ANATOMIA PATOLOGICA",                          Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.29"]={  Descripcion:"ESPECIALIDAD", Codigo:"54", Concepto:"ANESTESIOLOGIA",                               Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.30"]={  Descripcion:"ESPECIALIDAD", Codigo:"5",  Concepto:"ANGIOLOGIA GENERAL Y HEMODINAMIA",             Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.31"]={  Descripcion:"ESPECIALIDAD", Codigo:"4",  Concepto:"CARDIOLOGIA",                                  Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.32"]={  Descripcion:"ESPECIALIDAD", Codigo:"39", Concepto:"CARDIOLOGO INFANTIL",                          Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.33"]={  Descripcion:"ESPECIALIDAD", Codigo:"23", Concepto:"CIRUGIA CARDIOVASCULAR",                       Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.34"]={  Descripcion:"ESPECIALIDAD", Codigo:"70", Concepto:"CIRUGIA CARDIOVASCULAR PEDIATRICA.",           Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.35"]={  Descripcion:"ESPECIALIDAD", Codigo:"24", Concepto:"CIRUGIA DE CABEZA Y CUELLO",                   Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.36"]={  Descripcion:"ESPECIALIDAD", Codigo:"25", Concepto:"CIRUGIA DE TORAX (CIRUGIA TORACICA)",          Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.37"]={  Descripcion:"ESPECIALIDAD", Codigo:"22", Concepto:"CIRUGIA GENERAL",                              Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.38"]={  Descripcion:"ESPECIALIDAD", Codigo:"26", Concepto:"CIRUGIA INFANTIL (CIRUGIA PEDIATRICA)",        Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.39"]={  Descripcion:"ESPECIALIDAD", Codigo:"27", Concepto:"CIRUGIA PLASTICA Y REPARADORA",                Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.40"]={  Descripcion:"ESPECIALIDAD", Codigo:"28", Concepto:"CIRUGIA VASCULAR PERIFERICA",                  Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.41"]={  Descripcion:"ESPECIALIDAD", Codigo:"1",  Concepto:"CLINICA MEDICA",                               Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.42"]={  Descripcion:"ESPECIALIDAD", Codigo:"29", Concepto:"COLOPROCTOLOGIA",                              Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.43"]={  Descripcion:"ESPECIALIDAD", Codigo:"6",  Concepto:"DERMATOLOGIA",                                 Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.44"]={  Descripcion:"ESPECIALIDAD", Codigo:"63", Concepto:"DERMATOLOGIA PEDIATRICA",                      Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.45"]={  Descripcion:"ESPECIALIDAD", Codigo:"55", Concepto:"DIAGNOSTICO POR IMAGENES",                     Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.46"]={  Descripcion:"ESPECIALIDAD", Codigo:"65", Concepto:"ELECTRO FISIOLOGIA CARDIACA",                  Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.47"]={  Descripcion:"ESPECIALIDAD", Codigo:"64", Concepto:"EMERGENTOLOGIA",                               Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.48"]={  Descripcion:"ESPECIALIDAD", Codigo:"7",  Concepto:"ENDOCRINOLOGIA",                               Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.49"]={  Descripcion:"ESPECIALIDAD", Codigo:"40", Concepto:"ENDOCRINOLOGO INFANTIL",                       Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.50"]={  Descripcion:"ESPECIALIDAD", Codigo:"8",  Concepto:"FARMACOLOGIA CLINICA",                         Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.51"]={  Descripcion:"ESPECIALIDAD", Codigo:"9",  Concepto:"FISIATRIA (MEDICINA FISICA Y REHABILITACION)", Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.52"]={  Descripcion:"ESPECIALIDAD", Codigo:"10", Concepto:"GASTROENTEROLOGIA",                            Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.53"]={  Descripcion:"ESPECIALIDAD", Codigo:"41", Concepto:"GASTROENTEROLOGO INFANTIL",                    Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.54"]={  Descripcion:"ESPECIALIDAD", Codigo:"11", Concepto:"GENETICA MEDICA",                              Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.55"]={  Descripcion:"ESPECIALIDAD", Codigo:"12", Concepto:"GERIATRIA",                                    Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.56"]={  Descripcion:"ESPECIALIDAD", Codigo:"30", Concepto:"GINECOLOGIA",                                  Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.57"]={  Descripcion:"ESPECIALIDAD", Codigo:"13", Concepto:"HEMATOLOGIA",                                  Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.58"]={  Descripcion:"ESPECIALIDAD", Codigo:"42", Concepto:"HEMATOLOGO INFANTIL",                          Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.59"]={  Descripcion:"ESPECIALIDAD", Codigo:"56", Concepto:"HEMOTERAPIA E INMUNOHEMATOLOGIA",              Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.60"]={  Descripcion:"ESPECIALIDAD", Codigo:"67", Concepto:"HEPATOLOGIA",                                  Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.61"]={  Descripcion:"ESPECIALIDAD", Codigo:"68", Concepto:"HEPATOLOGIA PEDIATRICA",                       Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.62"]={  Descripcion:"ESPECIALIDAD", Codigo:"14", Concepto:"INFECTOLOGIA",                                 Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.63"]={  Descripcion:"ESPECIALIDAD", Codigo:"43", Concepto:"INFECTOLOGO INFANTIL",                         Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.64"]={  Descripcion:"ESPECIALIDAD", Codigo:"57", Concepto:"MEDICINA DEL DEPORTE",                         Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.65"]={  Descripcion:"ESPECIALIDAD", Codigo:"58", Concepto:"MEDICINA DEL TRABAJO",                         Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.66"]={  Descripcion:"ESPECIALIDAD", Codigo:"2",  Concepto:"MEDICINA GENERAL y/o MEDICINA DE FAMILIA",     Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.67"]={  Descripcion:"ESPECIALIDAD", Codigo:"59", Concepto:"MEDICINA LEGAL",                               Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.68"]={  Descripcion:"ESPECIALIDAD", Codigo:"60", Concepto:"MEDICINA NUCLEAR",                             Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.69"]={  Descripcion:"ESPECIALIDAD", Codigo:"15", Concepto:"NEFROLOGIA",                                   Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.70"]={  Descripcion:"ESPECIALIDAD", Codigo:"44", Concepto:"NEFROLOGO INFANTIL",                           Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.71"]={  Descripcion:"ESPECIALIDAD", Codigo:"45", Concepto:"NEONATOLOGIA",                                 Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.72"]={  Descripcion:"ESPECIALIDAD", Codigo:"16", Concepto:"NEUMONOLOGIA",                                 Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.73"]={  Descripcion:"ESPECIALIDAD", Codigo:"46", Concepto:"NEUMONOLOGO INFANTIL",                         Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.74"]={  Descripcion:"ESPECIALIDAD", Codigo:"31", Concepto:"NEUROCIRUGIA",                                 Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.75"]={  Descripcion:"ESPECIALIDAD", Codigo:"17", Concepto:"NEUROLOGIA",                                   Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.76"]={  Descripcion:"ESPECIALIDAD", Codigo:"47", Concepto:"NEUROLOGO INFANTIL",                           Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.77"]={  Descripcion:"ESPECIALIDAD", Codigo:"18", Concepto:"NUTRICION",                                    Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.78"]={  Descripcion:"ESPECIALIDAD", Codigo:"32", Concepto:"OBSTETRICIA",                                  Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.79"]={  Descripcion:"ESPECIALIDAD", Codigo:"33", Concepto:"OFTALMOLOGIA",                                 Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.80"]={  Descripcion:"ESPECIALIDAD", Codigo:"19", Concepto:"ONCOLOGIA",                                    Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.81"]={  Descripcion:"ESPECIALIDAD", Codigo:"48", Concepto:"ONCOLOGO INFANTIL",                            Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.82"]={  Descripcion:"ESPECIALIDAD", Codigo:"34", Concepto:"ORTOPEDIA Y TRAUMATOLOGIA",                    Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.83"]={  Descripcion:"ESPECIALIDAD", Codigo:"66", Concepto:"ORTOPEDIA Y TRAUMATOLOGIA INFANTIL",           Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.84"]={  Descripcion:"ESPECIALIDAD", Codigo:"35", Concepto:"OTORRINOLARINGOLOGIA",                         Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.85"]={  Descripcion:"ESPECIALIDAD", Codigo:"38", Concepto:"PEDIATRIA",                                    Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.86"]={  Descripcion:"ESPECIALIDAD", Codigo:"51", Concepto:"PSIQUIATRIA",                                  Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.5.87"]={  Descripcion:"ESPECIALIDAD", Codigo:"52", Concepto:"PSIQUIATRIA INFANTO JUVENIL",                  Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.6.88"]={  Descripcion:"ESPECIALIDAD", Codigo:"61", Concepto:"RADIOTERAPIA O TERAPIA RADIANTE",              Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.8.1"]={   Descripcion:"ESPECIALIDAD", Codigo:"20", Concepto:"REUMATOLOGIA",                                 Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.8.2"]={   Descripcion:"ESPECIALIDAD", Codigo:"49", Concepto:"REUMATOLOGO INFANTIL",                         Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.8.3"]={   Descripcion:"ESPECIALIDAD", Codigo:"21", Concepto:"TERAPIA INTENSIVA",                            Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.8.4"]={   Descripcion:"ESPECIALIDAD", Codigo:"50", Concepto:"TERAPISTA INTENSIVO INFANTIL",                 Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.8.5"]={   Descripcion:"ESPECIALIDAD", Codigo:"36", Concepto:"TOCOGINECOLOGIA",                              Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.9.6"]={   Descripcion:"ESPECIALIDAD", Codigo:"62", Concepto:"TOXICOLOGIA",                                  Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.9.7"]={   Descripcion:"ESPECIALIDAD", Codigo:"37", Concepto:"UROLOGIA",                                     Code_System_Origen:"2.16.840.1.113883.2.10.24.5"};
// ------------------------------------------------------------------------------------------------------------------------------
Array_OID_Tablas["2.16.840.1.113883.2.10.24.9.8"]={   Descripcion:"SUB-ESPECIALIDAD", Codigo:"37.1", Concepto:"UROLOGIA PEDIATRICA",      Code_System_Origen:"2.16.840.1.113883.2.10.24.6"};
// ------------------------------------------------------------------------------------------------------------------------------
Array_OID_Tablas["2.16.840.1.113883.2.10.24.9.9"]={   Descripcion:"AMBITO DE EPISODIO", Codigo:"I",  Concepto:"INTERNACION",              Code_System_Origen:"2.16.840.1.113883.2.10.24.7"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.9.10"]={  Descripcion:"AMBITO DE EPISODIO", Codigo:"DO", Concepto:"INTERNACION DOMICILIARIA", Code_System_Origen:"2.16.840.1.113883.2.10.24.7"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.9.11"]={  Descripcion:"AMBITO DE EPISODIO", Codigo:"E",  Concepto:"EMERGENCIA",               Code_System_Origen:"2.16.840.1.113883.2.10.24.7"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.9.12"]={  Descripcion:"AMBITO DE EPISODIO", Codigo:"LP", Concepto:"LARGO PLAZO",              Code_System_Origen:"2.16.840.1.113883.2.10.24.7"};
Array_OID_Tablas["2.16.840.1.113883.2.10.24.9.13"]={  Descripcion:"AMBITO DE EPISODIO", Codigo:"A",  Concepto:"AMBULATORIO",              Code_System_Origen:"2.16.840.1.113883.2.10.24.7"};
// ------------------------------------------------------------------------------------------------------------------------------
Array_OID_Tablas["2.16.840.1.113883.5.25.14"]={       Descripcion:"TIPO DE EPISODIO", Codigo:"N", Concepto:"NURSERY",           Code_System_Origen:"2.16.840.1.113883.2.10.24.9"};
Array_OID_Tablas["2.16.840.1.113883.5.25.15"]={       Descripcion:"TIPO DE EPISODIO", Codigo:"C", Concepto:"CLINICA",           Code_System_Origen:"2.16.840.1.113883.2.10.24.9"};
Array_OID_Tablas["2.16.840.1.113883.5.25.16"]={       Descripcion:"TIPO DE EPISODIO", Codigo:"E", Concepto:"EMERGENCIA",        Code_System_Origen:"2.16.840.1.113883.2.10.24.9"};
Array_OID_Tablas["2.16.840.1.113883.11.20.9.32.17"]={ Descripcion:"TIPO DE EPISODIO", Codigo:"G", Concepto:"CIRUGIA DE DIA",    Code_System_Origen:"2.16.840.1.113883.2.10.24.9"};
Array_OID_Tablas["2.16.840.1.113883.11.20.9.32.18"]={ Descripcion:"TIPO DE EPISODIO", Codigo:"H", Concepto:"OBSERVACION",       Code_System_Origen:"2.16.840.1.113883.2.10.24.9"};
Array_OID_Tablas["2.16.840.1.113883.11.20.9.32.19"]={ Descripcion:"TIPO DE EPISODIO", Codigo:"I", Concepto:"CUIDADO INTENSIVO", Code_System_Origen:"2.16.840.1.113883.2.10.24.9"};
Array_OID_Tablas["2.16.840.1.113883.11.20.9.32.20"]={ Descripcion:"TIPO DE EPISODIO", Codigo:"N", Concepto:"CUIDADO NEONATAL",  Code_System_Origen:"2.16.840.1.113883.2.10.24.9"};
Array_OID_Tablas["2.16.840.1.113883.11.20.9.32.21"]={ Descripcion:"TIPO DE EPISODIO", Codigo:"C", Concepto:"CONSULTORIO",       Code_System_Origen:"2.16.840.1.113883.2.10.24.9"};
// ------------------------------------------------------------------------------------------------------------------------------
Array_OID_Tablas["2.16.840.1.113883.11.20.9.32.22"]={ Descripcion:"GENERO DE PACIENTE", Codigo:"F", Concepto:"FEMENINO",        Code_System_Origen:"2.16.840.1.113883.5.1"};
Array_OID_Tablas["2.16.840.1.113883.11.20.9.32.23"]={ Descripcion:"GENERO DE PACIENTE", Codigo:"M", Concepto:"MASCULINO",       Code_System_Origen:"2.16.840.1.113883.5.1"};
Array_OID_Tablas["2.16.840.1.113883.11.20.9.32.24"]={ Descripcion:"GENERO DE PACIENTE", Codigo:"N", Concepto:"NO ESPECIFICADO", Code_System_Origen:"2.16.840.1.113883.5.1"};
// ------------------------------------------------------------------------------------------------------------------------------
Array_OID_Tablas["2.16.840.1.113883.11.20.9.32.25"]={ Descripcion:"NIVEL DE CONFIDENCIALIDAD", Codigo:"N", Concepto:"NORMAL",                             Code_System_Origen:"2.16.840.1.113883.5.25"};
Array_OID_Tablas["2.16.840.1.113883.11.20.9.32.26"]={ Descripcion:"NIVEL DE CONFIDENCIALIDAD", Codigo:"R", Concepto:"RESTRINGIDA (SOLO PRESTADORES)",     Code_System_Origen:"2.16.840.1.113883.5.25"};
Array_OID_Tablas["2.16.840.1.113883.11.20.9.32.27"]={ Descripcion:"NIVEL DE CONFIDENCIALIDAD", Codigo:"V", Concepto:"MUY RESTRINGIDA (SOLO AUTORIZADOS)", Code_System_Origen:"2.16.840.1.113883.5.25"};



exports.MOCK_Validacion_Afiliados    		= MOCK_Validacion_Afiliados;
exports.instanciarValoresMock		 		= instanciarValoresMock;
exports.MOCK_Validacion_Prestacion   		= MOCK_Validacion_Prestacion;
exports.MOCK_Validacion_Planes_Prestador 	= MOCK_Validacion_Planes_Prestador;
exports.MOCK_Validacion_Afiliado_Prestacion = MOCK_Validacion_Afiliado_Prestacion;
exports.MOCK_Codigo_Valido         	 		= MOCK_Codigo_Valido;


exports.documentReference			 = documentReference;
exports.facturacion                  = facturacion;
exports.pathXML_Facturacion_Request  = pathXML_Facturacion_Request;
exports.AccesDB_Path                 = AccesDB_Path;
exports.OIDS_Arbol_Financiador       = OIDS_Arbol_Financiador;
exports.OIDS_Value_Sets         	 = OIDS_Value_Sets;
exports.Array_OID_Tablas             = Array_OID_Tablas;
exports.Transaction_Manager          = Transaction_Manager;
exports.OIDS_Plantillas				 = OIDS_Plantillas;
exports.OIDS_Organizacionales		 = OIDS_Organizacionales;
exports.OID_SwissMedical_Financiador = OID_SwissMedical_Financiador;
exports.OIDValido					 = OIDValido;
exports.OIDS_Arbol_Por_Organizacion  = OIDS_Arbol_Por_Organizacion;
