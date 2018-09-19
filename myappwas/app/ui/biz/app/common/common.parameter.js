
const angular = require('angular');

const md = require('./common.module');

md.service('$commonParameter', __service);

function __service($rootScope){
    var _data = {};

    return {
    	getParameter : function(_scrnId){
    		return _data[_scrnId];
        },
        
        setParameter : function(_scrnId, __data) {
        	if(__data) {
        		_data[_scrnId] = __data;
        	}
        },
        
        removeParameter : function(_scrnId) {
        	delete _data[_scrnId];
        }

    } // end return
}
