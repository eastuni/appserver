/**
 * Created by gim-yang-gwi on 2013. 12. 17..
 */

$(function () {
	
	// 기관코드 조회
//    if(!fn_isNull(constantBaseInstCd)) {
//    	$("#instArea").show();
//    }
    
    var browserLocale = navigator.language || navigator.browserLanguage,
    locale = "en";
    if(!fn_isNull($.cookie('locale'))){
    	locale = $.cookie('locale');
    }
    
    locale = "en";
    
    registHandlebarsLocaleHelper();

    bxMsg.init({
        locale: locale,
        messageRoot: 'scripts/messages/',
        messageList: [
            'login.json'
        ]
    });

    // 로그인버튼 설정
    $("#bx-login-btn").text(bxMsg('login.login'));
    
    $(".login_title").text(topTitle); //config.js에 정의되어 있음..
    
    
    // 언어코드 조회
    fn_getLangCdList();

    // 기관코드 조회
//    if(!fn_isNull(constantBaseInstCd)) {
//    	fn_getInstCdList();
//    }
//    else {
//    	$("#instArea").hide();
//    }
    
    //로그인 Click Event
    $('body').on('click', '#bx-login-btn', function (e) {
        var loinIdNbr = $("#loinIdNbr").val(),
        pwd = $("#pwd").val(),
        locale = $("#selectLng").val();
//        instCd = $("#selectInst").val(),
//        instNm = $("#selectInst option:selected").text();

//        
//        if(!fn_isNull(constantBaseInstCd)) {
//	        $.cookie('instCd', instCd);
//	        $.cookie('instNm', instNm);
//        }
//        else {
//        	$.cookie('instCd', constantAdminInstCd);
//        	$.cookie('instNm', constantAdminInstNm);
//        }
        
        $.cookie('locale', locale);
        $.cookie('instCd', constantAdminInstCd);
    	$.cookie('instNm', constantAdminInstNm);
        $.cookie('loinIdNbr', loinIdNbr);

        e.preventDefault();

        if (fn_isNull(loinIdNbr) || fn_isNull(pwd)) {
            alert(bxMsg('login.idPwdNull'));
            return;
        }
        
         console.log(constantAdminInstCd);
    	fn_login(loinIdNbr, pwd, locale, constantAdminInstCd, constantAdminInstNm);
        
    });//end of #bx-login-btn click
    

    $('body').on('click', '#loinIdNbr', function () {
    	this.select();
    });
    
    // 로그인
    function fn_login(loinIdNbr, pwd, locale, instCd, instNm) {
        var that = this;
        var sParam = {};
        var header = new Object();

        sParam.lngCd = locale;
        sParam.instCd = instCd;
        sParam.loinIdNbr = loinIdNbr;
        sParam.encrptnPswd = pwd;

        header.instCd = sParam.instCd;

        header.srvcCd = "CAPSF0028401";
        header.tmZone = "";
        header.custId = "";
        header.staffId = "";
        header.deptId = "";
        header.lngCd = $("#selectLng").val();
        header.txDt = getCurrentDate("yyyymmdd");
        if(isDistrbutionEnv()){  //commom.js 정의
        	header.chnlDscd = "40";
        } else {
        	header.chnlDscd = "01";
        }

        var linkData = {"header": header, "CaLogInSvcGetLoginUserIn": sParam};

        bxProxy.post(sUrl, JSON.stringify(linkData), {
            success: function (responseData) {
                var path = getContextPath();
                var returnCode = responseData.header.returnCode;
                
                if (returnCode != "0") {
                	var errorMessage = responseData.header.errorMessages[0].message;
                    alert(errorMessage);
                } else {
                    
                    location.pathname = path + 'main.html';

                    $.sessionStorage('loinIdNbr', loinIdNbr);
                    $.sessionStorage('pwd', pwd);
                    $.sessionStorage('nm', responseData.CaLogInSvcGetLoginUserOut.nm);
                    $.sessionStorage('staffId', responseData.CaLogInSvcGetLoginUserOut.staffId);
                    $.sessionStorage('custId', "");
                    $.sessionStorage('lngCd', sParam.lngCd);
                    $.sessionStorage('instNm', instNm);
                    $.sessionStorage('instCd', responseData.header.instCd);
                   
                    $.sessionStorage('headerInstNm', instNm);
                    $.sessionStorage('headerInstCd', responseData.header.instCd);
                    $.sessionStorage('userGrpCd', responseData.CaLogInSvcGetLoginUserOut.userGrpCd);
                	$.sessionStorage('chnlDscd', responseData.header.chnlDscd);
                    $.sessionStorage('tmZone', responseData.header.tmZone);
                    $.sessionStorage('deptId', responseData.CaLogInSvcGetLoginUserOut.deptId);
                    $.sessionStorage('deptNm', responseData.CaLogInSvcGetLoginUserOut.deptNm);
                    $.sessionStorage('txDt', responseData.header.txDt);
                    $.sessionStorage('custRprsnId', "");
                    
//                    fn_getInstParm(responseData.header.instCd, 'instBaseCrncyCd');
                }
            }//end of success
        });//end of bxProxy
    }

    /*언어코드 콤보*/
    function fn_getLangCdList() {

        var header = new Object();
        var param = {};

        param.cdNbr = "10005";

        header.instCd = constantAdminInstCd;
        header.userGrpCd = "06";
        header.srvcCd = "CAPCM0038400";
        header.tmZone = "";
        header.custId = "";
        header.staffId = "";
        header.deptId = "";
        header.lngCd = locale;
        header.txDt = getCurrentDate("yyyymmdd");
        if(isDistrbutionEnv()){  //commom.js 정의
        	header.chnlDscd = "40";
        } else {
        	header.chnlDscd = "01";
        }

        var linkData = {"header": header, "CaCmnCdSvcGetCdListByCdNbrIn": param};
        var response = fn_callSyncSvc(linkData);
        
        if (response == null) return null;
        var returnCode = response.header.returnCode;
        
        if (returnCode != "0") {
            console.info("messageCode : " + response.header.messageCode);
            console.info("messages : " + response.header.messages);
            console.info("detailMessages : " + response.header.detailMessages);
            console.info("traceMessage : " + response.header.traceMessage);
            return;
        } else {
        	// 언어콤보 생성
        	var $selectLng = $("#selectLng");
        	
        	$('#selectLng option').remove();
        	
        	var codeList = response.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;
        	$selectLng.attr("data-form-param", "langCd");
        	
        	$(codeList).each(function(idx, item) {
        		// 건수만큼 자식 생성
        		var optionText = item.cdNm;
        		$selectLng.append($(document.createElement('option')).val(item.cd).text(optionText));
        	});
        	
        	// 현재 언어 선택
        	$selectLng.find('option[value=' + locale + ']').attr('selected', true);
        	
            if($.cookie('locale') == undefined || $.cookie('locale') == null || $.cookie('locale') == '') {
//            	locale = param.locale;
            	locale = locale;
            } else {
            	locale = $.cookie('locale');
            }
            
            if($.cookie('loinIdNbr') != undefined) {
            	$("#loinIdNbr").val($.cookie('loinIdNbr'));
            }
        }
    }
    
    /*기관코드 생성*/
    function fn_getInstCdList() {
        var header = new Object();
        var param = {};

        header.instCd = constantAdminInstCd;
        header.userGrpCd = "06";
        header.srvcCd = "CAPCM0308401";
        header.tmZone = "";
        header.custId = "";
        header.staffId = "";
        header.deptId = "";
        header.lngCd = $("#selectLng").val();
        header.txDt = getCurrentDate("yyyymmdd");
        if(isDistrbutionEnv()){  //commom.js 정의
        	header.chnlDscd = "40";
        } else {
        	header.chnlDscd = "01";
        }

        var linkData = {"header": header, "DummyIO": param};
        //ajax 호출
        bxProxy.post(sUrl, JSON.stringify(linkData), {
            success: function (data) {
                var returnCode = data.header.returnCode;
                if (returnCode != "0") {
                    console.info("messageCode : " + data.header.messageCode);
                    console.info("messages : " + data.header.messages);
                    console.info("detailMessages : " + data.header.detailMessages);
                    console.info("traceMessage : " + data.header.traceMessage);
                    return;
                } else {
                	// 기관코드 콤보 설정
                	var $selectInst = $("#selectInst");
                	
                	$('#selectInst option').remove();
                	
                	var instList = data.CaInstMgmtSvcGetInstOut.instList;
                	$selectInst.attr("data-form-param", "instCd");
                	
                	$(instList).each(function(idx, item) {
                		// 건수만큼 자식 생성
                		var optionText = item.instNm;
                		var optionValue = item.instCd;
                		
            			$selectInst.append($(document.createElement('option')).val(optionValue).text(optionText));
                	});
                }
            }
        });
    }
    

    /*메시지*/
    function registHandlebarsLocaleHelper() {

        Handlebars.registerHelper('bxMsg', function (keyword) {
            return bxMsg(keyword) || keyword;
        });
    }
    
    function getContextPath(){
    	var ctxPath = location.pathname.substring(0, location.pathname.indexOf("/",2));
        return ctxPath+"/";
    }
});