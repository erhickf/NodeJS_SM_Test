var ContentType_Json = {"Content-Type":"application/json"};
var ContentType_TEXT_HTML = {"Content-Type":"text/html"};
var ContentType_TEXT_XML = {"Content-Type":"text/xml"};

function setPublicCORS(response,methods){
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', methods);
  response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  response.setHeader('Access-Control-Allow-Credentials', false);
}

exports.ContentType = ContentType_TEXT_XML;
exports.setPublicCORS = setPublicCORS;

