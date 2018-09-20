/**
 * Created by parkbeomsoo on 2016. 5. 31..
 */




const angular = require('angular');

const md = require('./common.module');

md.service('$psbkConf', __service);

function __service($http, $q, $rootScope) {

    return {
		wsProtocol : (window.location.protocol == 'https:') ? 'wss://' : 'ws://',
		wsAddress : 'localhost:8181',
		readyState : {
			CONNECTING : 0, //	연결이 수립되지 않은 상태입니다.
			OPEN : 1,       //	연결이 수립되어 데이터가 오고갈 수 있는 상태입니다.
			CLOSING : 2,    //	연결이 닫히는 중 입니다.
			CLOSED : 3      //	연결이 종료되었거나, 연결에 실패한 경우입니다.
    	},
    	slip : {
    		processingInstuction : '<?xml version="1.0" encoding="utf-8"?>',
    		passbookStart : 7,
    		passbookEnd : 42,
    		nodes : [
	    		{
	    			tag : '<Print/>',
	    			tagText : 'Print',
	    			depth : 0,
					parent : null,
	    			attrs : {
	        			Title : 'Slip Print'
	        		}
	    		},
				{
					tag : '<Page/>',
					tagText : 'Page',
	    			depth : 1,
					parent : 'Print',
					attrs : {
						Width : 980,
						Height : 640,
						Top : 1,
						Left : 1,
						FontName : '돋움체',
						FontSize : 10,
						LineSpace : 1
					}
				}
    		],
			lineNode : {
				tag : '<Line/>',
				tagText : 'Line',
    			depth : 2,
				parent : 'Page',
				attrs : {
					Row : 0,
					Column : 0,
					Attr : 0
				}
			}
    	},
    	psbk : {
    		processingInstuction : '<?xml version="1.0" encoding="utf-8"?>',
    		passbookStart : 7,
    		passbookEnd : 42,
    		nodes : [
	    		{
	    			tag : '<Print/>',
	    			tagText : 'Print',
	    			depth : 0,
					parent : null,
	    			attrs : {
	        			Title : 'Passbook Print'
	        		}
	    		},
				{
					tag : '<Page/>',
					tagText : 'Page',
	    			depth : 1,
					parent : 'Print',
					attrs : {
						Width : 900,
						Height : 640,
						Top : 1,
						Left : 1,
						FontName : '돋움체',
						FontSize : 10,
						LineSpace : 1
					}
				}
    		],
			lineNode : {
				tag : '<Line/>',
				tagText : 'Line',
				depth : 2,
				parent : 'Page',
				attrs : {
					Row : 0,
					Column : 0,
					Attr : 0
				}
			}
    	}
    }
}

