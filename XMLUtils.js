function XMLTAG_Object(tagName)
{
	this.TagName = tagName;
	
	this.Properties = new Array();
	this.TagObjects = new Array();
	
	this.AddProperty = function(propName, propValue)
	{
		this.Properties.push( {
				Name  : propName,
				Value : propValue
		});
	}
	this.GetXML = function(){
		var xml = '';
		xml += '<'+ this.TagName;
		for(var a in this.Properties){
			var prop = this.Properties[a];
			xml += ' ' + prop.Name + '="' + prop.Value + '"';
		}
		xml += '>';

		for(var a in this.TagObjects){
			var tag = this.TagObjects[a];
			xml += tag.GetXML();
		}
		
		xml += '</'+ this.TagName + '>';
		return xml;
	}
	
	this.AddXMLTag = function (objXML){
		this.TagObjects.push(objXML);
	}	
}