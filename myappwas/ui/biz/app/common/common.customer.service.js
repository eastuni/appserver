/**
 * Created by parkbeomsoo on 2016. 5. 31..
 */



const angular = require('angular');

const md = require('./common.module');

md.service('$commonCustomerService', __service);

function __service($http, $q, $commonConfig, $commonProxy, $commonModal, $rootScope, $state, $commonService){
    var subMenuList = [];
    var _messageData = {};

    return {
    	
        //clHrarcyCd : 분류체계코드(직위유형/표준산업분류 등), clId : 찾으려는 검색조건 clId, clIdObj : clNm을 넣어줄 object
        fn_setClNm : function(clHrarcyCd, clId, clIdObj){
        	var clNm = "";
        	var that = this;
    		var sParam = {};
    		var header =  new Object();
    		sParam.clHrarcyId = clHrarcyCd; //"StandardIndustrial"

            header = $commonService.fn_getHeader("CAPCM1708401");
            
            var linkData = {"header" : header , "CaClTreeMgmtSvcIn" : sParam};
            $commonProxy.fn_callAsyncSvc(sUrl, linkData, {
            	enableLoading : true,
            	success : function(responseData) {
            		var clTreeList = responseData.CaClTreeMgmtSvcOut;
            		
            		clNm = that.fn_getClNmByClId(clTreeList, clId); 
                    
            		$(clIdObj).val(clId + " " + clNm);
            		
                    return clNm;
            	}
            });
        },
        
        //get classification name from tree
        fn_getClNmByClId : function(clTreeList, clId){
        	var that = this;
        	let clNm = "";
        	
    		$(clTreeList).each(function(idx, item){
    			if(item.clId == clId){
    				clNm = item.clNm;
    				return false;
    			}
    		});
    		
    		if(!clNm){
    			if(clTreeList.children && clTreeList.children.length > 0) {					
    				$(clTreeList.children).each(function(idx, item) {
    					clNm = that.fn_getClNmByClId(item, clId);						
    					if(clNm) {
    						return false;
    					}
    				});
    			}
    		}			
    		return clNm;
        },
        
        // 금액 set
        fn_setAmtComma : function(num){
        	    num = num + "";
        	    if (num != "") {
        	        var regx = new RegExp(/(-?\d+)(\d{3})/);
        	        var bExists = num.indexOf(".", 0);
        	        var strArr = num.split('.');

        	        //콤마 표시
        	        while (regx.test(strArr[0])) {
        	            strArr[0] = strArr[0].replace(regx, "$1,$2");
        	        }

        	        //소수점 표시
        	        if (bExists > -1)
        	            return strArr[0] + "." + strArr[1];
        	        else
        	            return strArr[0] + ".00";
        	    }
        	    else {
        	        return "";
        	    }
        },
        //validate the contact point
        fn_validateCtcpt : function(param){
        	
        	//전화번호 및 팩스
        	if(param.cntctMthdTpCd == "01" || param.cntctMthdTpCd == "02" || param.cntctMthdTpCd == "05"){
        		if(!param.intrntnlNbr){
        			return '{%=cbb_items.AT#intrntnlNbr%}';
        		}
        		if(!param.idTelNbr){
        			return '{%=cbb_items.AT#idTelNbr%}';
        		}
        		if(!param.telExNbr){
        			return '{%=cbb_items.AT#telExNbr%}';
        		}
        		if(!param.serialTelNbr){
        			return '{%=cbb_items.AT#serialTelNbr%}';
        		}
        	}
        	
        	//주소
        	else if(param.cntctMthdTpCd == "07" || param.cntctMthdTpCd == "10" || param.cntctMthdTpCd == "11"){
        		if(param.bsicAddrCntnt && !param.dtlAddrCntnt){
        			return '{%=cbb_items.SCRNITM#dtlAddr%}';
        		}
        		if(!param.bsicAddrCntnt && param.dtlAddrCntnt){
        			return '{%=cbb_items.SCRNITM#areaRoadAddr%}';
        		}
        		if(param.engBsicAddrCntnt && !param.engDtlAddrCntnt){
        			return '{%=cbb_items.SCRNITM#engDtlAddrCntnt%}';
        		}
        		if(!param.engBsicAddrCntnt && param.engDtlAddrCntnt){
        			return '{%=cbb_items.SCRNITM#engBsicAddrCntnt%}';
        		}
        		if(!param.bsicAddrCntnt && !param.dtlAddrCntnt && 
        				!param.engBsicAddrCntnt && !param.engDtlAddrCntnt){
        			return '{%=cbb_items.SCRNITM#addr%}';
        		}
        	}
        	
        	//전자주소
        	else{
        		if(!param.elctrncAddr){
        			return '{%=cbb_items.SCRNITM#elctrncAddr%}';
        		}
        	}
        	
        	return null;
        },
        //validate the account number
        fn_validateAcctNbr : function(param){
        	
    		if(!param.bnkCd){
    			return '{%=cbb_items.SCRNITM#bnk%}';
    		}
    		if(!param.acctNbr){
    			return '{%=cbb_items.SCRNITM#acctNbr%}';
    		}
    		if(!param.dpsrNm){
    			return '{%=cbb_items.SCRNITM#dpsr%}';
    		}
        	
        	return null;
        },
    } // end return
}
