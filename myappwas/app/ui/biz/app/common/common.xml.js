/**
 * Created by parkbeomsoo on 2016. 5. 31..
 */



const angular = require('angular');

const md = require('./common.module');

md.service('$commonXml', __service);

function __service() {
    return {
    	
    	fn_createXml : function(processingInstruction, rootTag, attrs) {
			var parser = new DOMParser();
			var xmlDoc = parser.parseFromString(processingInstruction + rootTag, 'text/xml');
			var rootNode = xmlDoc.documentElement;
			
			this.fn_setAttribute(rootNode, attrs);
			
			return xmlDoc;
    	},

    	fn_appendChild : function(xmlDoc, parent, name, attrs, cdata) {
		    var xmlNode = xmlDoc.createElement(name);
		    if (typeof parent === 'string') {
		    	var parentNode = xmlDoc.getElementsByTagName(parent)[0];
		    	parentNode.appendChild(xmlNode);
		    } else {
		    	parent.appendChild(xmlNode);
		    }
		
		    this.fn_setAttribute(xmlNode, attrs);
		    
		    if (cdata) {
				var cdataNode = xmlDoc.createCDATASection(cdata);
				xmlNode.appendChild(cdataNode);
		    }
		    
		    return xmlNode;
    	},
    	
    	fn_setAttribute : function(xmlNode, attrs) {
    		for (var name in attrs) {
    			xmlNode.setAttribute(name, attrs[name]);
    		}
    	}

    } // end return
} // end function