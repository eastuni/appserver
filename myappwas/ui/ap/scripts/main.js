require(['../libs/bx/bx-frame/main-config'], function (mainConfig) {
    // header set
    var sParam = {};
    sParam.scrnId = "CAP";
    // 메뉴목록 조회
//    var linkData = {"header": fn_getHeader("CAPSV0508401"), "CaScrnMgmtSvcGetScrnInfoListIn": sParam};
    var linkData = {"header": fn_getHeader("CAPSV0508404"), "CaScrnMgmtSvcGetScrnInfoListIn": sParam};
    var pageSrcMap = {};
//    var responseData = fn_callSyncSvc(linkData);

    
    // ajax 호출
    bxProxy.post(sUrl, JSON.stringify(linkData),{
//    	enableLoading: true,
    	success: function(responseData){
    	    var tbList = [];
//    	    var defaultScreenId = "PWF020";
    	    var defaultScreenId = "";
    	    
    	    if(typeof responseData.CaScrnMgmtSvcGetScrnInfoListOut != "undefined") {
    	    	tbList = responseData.CaScrnMgmtSvcGetScrnInfoListOut.tblNm;
    	    	defaultScreenId = responseData.CaScrnMgmtSvcGetScrnInfoListOut.nrmlDfltScrnId;
    	    	console.log(defaultScreenId);
    	    }
    	    else {
    	    	alert("메뉴에 대한 사용자의 권한이 하나도 없습니다.");
    	    	return false;
    	    }
    	    
    	    if (tbList != null || tbList.length > 0) {
    	        for (var i = 0; i < tbList.length; i++) {
    	            pageSrcMap[tbList[i].scrnId] = tbList[i].scrnUrlAddr;
    	        }
    	    }

    	    var messageList = [

    	        'cbb-items.csv', 'cbb-err-msg.csv', 'issue-mng.json'];

    	    $.sessionStorage('custMode', false);

    	 // 초기화면 안하게
//    	    defaultScreenId = "";
    	    
    	    mainConfig.boot({
    	        startPageByRole: {
    	            'default': defaultScreenId
    	        },
    	        pageSrcMap: pageSrcMap,
    	        messageList: messageList
    	    });
    	}
    });   
});