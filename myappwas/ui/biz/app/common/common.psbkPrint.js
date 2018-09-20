/**
 * Created by parkbeomsoo on 2016. 5. 31..
 */



const angular = require('angular');

const md = require('./common.module');

md.service('$commonPsbkPrint', __service);

function __service($psbkConf, $commonService, $commonXml){
	var remainItems = {};
	var psbkCryngTrgtYn = 'N';
	
    return {

    	fn_connectPrinter : function(pageType, xmlData, callback) {
    		var that = this;
    	    var wsImpl = window.WebSocket || window.MozWebSocket;

    	    if (window.wsPassbookPrinter) {
   	            window.wsPassbookPrinter.close();
    	    }
    	    
    	    // create a new passbook printer websocket and connect
    	    window.wsPassbookPrinter = new wsImpl($psbkConf.wsProtocol + $psbkConf.wsAddress);

    	    // Portlet Websocket error시 처리
    	    wsPassbookPrinter.onerror = function (evt) {
    	        console.log('printer websocket error :' + JSON.stringify(evt));
    	    };

    	    // when data is comming from the server, this metod is called
    	    wsPassbookPrinter.onmessage = function (evt) {
    	        console.log('printer websocket message2 :' + evt.data);
    	        that.fn_printNext();
    	    };

    	    // when the connection is established, this method is called
    	    wsPassbookPrinter.onopen = function () {
    	        console.log('printer websocket opened');
				typeof callback === 'function' && callback(pageType, xmlData);
    	    };

    	    // when the connection is closed, this method is called
    	    wsPassbookPrinter.onclose = function (evt) {
    	        console.log('printer websocket close :' + JSON.stringify(evt));
    	    };
    	},
    	
    	fn_sendToPassbookPrinter : function(pageType, xmlData) {
    		if (window.wsPassbookPrinter && window.wsPassbookPrinter.readyState == $psbkConf.readyState.OPEN) {
    	        console.log('printer websocket already opened');
    	        this.fn_showConfirm(pageType, xmlData);
                return;
    		} else {
    			this.fn_connectPrinter(pageType, xmlData, this.fn_showConfirm);
    		}
    	},

    	fn_showConfirm : function(pageType, xmlData) {
    		var content;
    		switch(pageType) {
    		case 'slip' :
    			content = '전표를 넣어주세요.';
    			break;
    		case 'cover' :
    			content = '통장 표지를 넣어주세요.';
    			break;
    		case 'title' :
    			content = '통장 표제부를 넣어주세요.';
    			break;
    		case 'inner' :
    			content = '다음 장을 넣어주세요.';
    			break;
    		case 'next' :
    			content = '다음 장을 넣어주세요.';
    			break;
    		case 'psbk' :
    			content = '통장을 넣어주세요.';
    			break;
    		case 'carrying' :
				var alertParam = {};
				alertParam.content = '통장을 이월하여야 합니다.</br>통장재발행 메뉴에서 이월 재발행 처리해 주세요.';
				alertParam.closeText = $commonService.makeBxI18n().getValue('{%=cbb_items.SCRNITM#cnfrm%}');
				$commonService.alert(alertParam);
    			return;
    		default :
    			content = '출력 대상을 넣어주세요.';
    		}

	    	var alertParam = {};
	    	alertParam.title = " ";
	    	alertParam.content = content;
	    	alertParam.confirmText = $commonService.makeBxI18n().getValue('{%=cbb_items.SCRNITM#cnfrm%}');
	    	alertParam.closeText = $commonService.makeBxI18n().getValue('{%=cbb_items.SCRNITM#B_cancel%}');
	    	alertParam.xmlData = xmlData;
	    	alertParam.wsPassbookPrinter = window.wsPassbookPrinter;
	    	$commonService.alertConfirm(alertParam, function(rParam) {
	    		console.log(rParam.xmlData);
	            rParam.wsPassbookPrinter.send(rParam.xmlData);
	    	});
    	},
    	
    	fn_printPassbook : function(printItems) {
    	    if (!printItems) {
				return;
			}

    	    remainItems = printItems;
    	    
    	    this.fn_printNext();
    	},
    	
    	fn_printNext : function() {
    	    if (!remainItems) {
				return;
			}
    	    
    	    if (psbkCryngTrgtYn == 'Y') {
    	    	this.fn_showConfirm('carrying');
    	    }
    	    
			if (remainItems.coverList && remainItems.coverList.length > 0) {
				this.fn_printPassbookCover(remainItems.coverList);
	    	    return;
			}

			if (remainItems.titleList && remainItems.titleList.length > 0) {
				this.fn_printPassbookTitlePage(remainItems.titleList);
	    	    return;
			}

			if (remainItems.innerList && remainItems.innerList.length > 0) {
				this.fn_printPassbookInnerPage(remainItems.innerList);
	    	    return;
			}
    	},

    	fn_printPassbookCover : function(printItems) {
    		this.fn_print($psbkConf.psbk, 'cover', printItems);
    	},

    	fn_printPassbookTitlePage : function(printItems) {
    		this.fn_print($psbkConf.psbk, 'title', printItems);
    	},
    	
    	fn_printPassbookInnerPage : function(printItems) {
    		this.fn_print($psbkConf.psbk, 'inner', printItems);
    	},

    	fn_printSlip : function(printItems) {
    		this.fn_print($psbkConf.slip, 'slip', printItems);
    	},

    	fn_print : function(docType, pageType, printItems) {
    		var that = this;
    		
    	    if (!printItems) {
				return;
			}

			var xmlDoc = this.fn_createXmlDoc(docType);
			var item = {};
			var cnt = 0;
			while (item = printItems.shift()) {
				that.fn_appendLine(docType, xmlDoc, item);

				if (item.psbkCryngTrgtYn == 'Y') {
					psbkCryngTrgtYn = 'Y';
					break;
				}
				
				if (item.psbkLastRowYn == 'Y') {
					break;
				}
			}

			var serializer = new XMLSerializer();
    	    var xmlData = serializer.serializeToString(xmlDoc);
    	    
    	    this.fn_sendToPassbookPrinter(pageType, xmlData);    		
    	},
    	
    	fn_createXmlDoc : function(docType) {
    		var xmlDoc;
    		
    		docType.nodes.forEach(function(node) {
    			if (node.depth == 0) {
    				xmlDoc = $commonXml.fn_createXml(docType.processingInstuction, node.tag, node.attrs);
    			} else {
    				$commonXml.fn_appendChild(xmlDoc, node.parent, node.tagText, node.attrs);
    			}
    		});
			
			return xmlDoc;
    	},
    	
    	fn_appendLine : function(docType, xmlDoc, line) {
			var node = docType.lineNode;
			node.attrs.Row = line.psbkBkgRowCnt;
			node.attrs.Column = line.psbkBkgColumnCnt;
			node.attrs.Attr = 0;
			
			$commonXml.fn_appendChild(xmlDoc, node.parent, node.tagText, node.attrs, line.psbkBkgCntnt);
    	}
	    
    } // end return
} // end function