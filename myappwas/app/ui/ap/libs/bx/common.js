// CONSTANT 정의
var constantAdminInstCd = "STDA";
var constantAdminInstNm = "CBP Admin";

var constantBaseInstCd = "";
var constantBaseInstNm = "";
//var constantBaseInstCd = "103";
//var constantBaseInstNm = "K BANK";

//var CaGridHeight = "840px"; // 20 건
var CaGridHeight = "440px"; // 10 건
var CaPopGridHeight = "440px"; // 10 건

/**
 * 콤보박스 생성
 * 조회 를 하지 않고 리스트값까지 받아서 처리 한다.
 * sParam.className : 콤보박스의 클래스명
 * sParam.disabled : 활성화여부
 * sParam.hidden : 숨김여부
 * sParam.nullYn : 빈값 처리 여부
 * sParam.allNm : 빈값 일시 빈값의 text 를 설정
 * sParam.tblNm :  콤보박스의 리스트 값
 * sParam.viewType :  콤보박스 option text type
 * sParam.selectVal :  콤보박스의 선택값
 * sParam.valueNm : value 명
 * sParam.textNm : text 명
 */
function fn_makeComboBox(sParam, that, selectStyle) {
	var $targetArea;
	$targetArea = that.$el.find("." + sParam.className);
	
	$targetArea.html("");
	
	// 비활성화 처리
	 if (sParam.disabled) {
		 $targetArea.attr("disabled", true);
     }
	
	 // 숨김처리
	 if (sParam.hidden) {
		 $targetArea.attr("hidden", true);
     }
	 
	 // 빈값 처리
	 if (sParam.nullYn == "Y") {
         var option = $(document.createElement('option')).val("").text(sParam.allNm);
         $targetArea.append(option);
     }
	 
	 $(sParam.tblNm).each(function (idx, item) {
         var optionText = item[sParam.textNm];
         var optionValue = item[sParam.valueNm];
         var option = $(document.createElement('option')).val(optionValue).text(optionText);

         if (sParam.viewType) {
             if (sParam.viewType == "ValNm") {
                 option = $(document.createElement('option')).val(optionValue).text(optionValue + " " + optionText);
             }
             else if (sParam.viewType == "val") {
                 option = $(document.createElement('option')).val(optionValue).text(optionValue);
             }
         }

         $targetArea.append(option);
     });
	 
	 if (sParam.selectVal) {
		 $targetArea.find('option[value=' + sParam.selectVal + ']').attr('selected', true);
     }
}

/**
 * 공통코드조회
 */
function fn_getCodeList(sParam, that, selectStyle, fn) {
    var param = {};

    param.cdNbr = sParam.cdNbr;
    param.instCd = $.sessionStorage('instCd');

    var linkData = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": param};

    bxProxy.post(sUrl, JSON.stringify(linkData), {
        success: function (data) {
            if (fn_commonChekResult(data)) {
            	var $targetArea;
            	
            	
            	if(sParam.pageType && sParam.pageType == "popup") {
            		$targetArea = that.find("." + sParam.className);
            	}
            	else {
            		$targetArea = that.$el.find("." + sParam.className);
            	}
            	
            	$targetArea.html("");
            	
            	// 비활성화 처리
            	 if (sParam.disabled) {
            		 $targetArea.attr("disabled", true);
                 }
            	 else {
            		 $targetArea.attr("disabled", false);
            	 }
            	
            	 // 숨김처리
            	 if (sParam.hidden) {
            		 $targetArea.attr("hidden", true);
                 }
            	 
            	 // 빈값 처리
            	 if (sParam.nullYn == "Y") {
                     var option = $(document.createElement('option')).val("").text(sParam.allNm);
                     $targetArea.append(option);
                 }
            	 
            	 $(data.CaCmnCdSvcGetCdListByCdNbrOut.tblNm).each(function (idx, item) {
                     var optionText = item.cdNm;
                     var optionValue = item.cd;
                     var option = $(document.createElement('option')).val(optionValue).text(optionText);

                     if (sParam.viewType) {
                         if (sParam.viewType == "ValNm") {
                             option = $(document.createElement('option')).val(optionValue).text(item.cd + " " + optionText);
                         }
                         else if (sParam.viewType == "val") {
                             option = $(document.createElement('option')).val(optionValue).text(optionValue);
                         }
                     }

                     $targetArea.append(option);
                 });
            	 
            	 if (sParam.selectVal) {
            		 $targetArea.find('option[value=' + sParam.selectVal + ']').attr('selected', true);
                 }
            	 
                typeof fn === 'function' && fn();
            }
        }
    });
}

/**
 * 구군코드조회
 */
function fn_getGuGunList(sParam, that, selectStyle, fn) {
    var param = {};

    param.cityPrvncCd = sParam.cityPrvncCd;

    var linkData = {"header": fn_getHeader("SCM0038401"), "KrAddrSvcGetGuGunListIn": param};

    bxProxy.post(sUrl, JSON.stringify(linkData), {
        success: function (data) {
            if (fn_commonChekResult(data)) {
                var sectionArea = $(document.createElement('section'));

                sectionArea.addClass("bx-combo-box-wrap");
                sParam.className = "." + sParam.className;
                that.$el.find(sParam.className).html("");

                var selectArea = $(document.createElement('select'));

                selectArea.addClass("bx-combo-box bx-form-item bx-component-small");
                selectStyle && selectArea.css(selectStyle);
                selectArea.attr("data-form-param", sParam.targetId);

                if (sParam.disabled) {
                    selectArea.attr("disabled", true);
                }

                if (sParam.hidden) {
                    selectArea.attr("hidden", true);
                }

                if (sParam.nullYn == "Y") {
                    var option = $(document.createElement('option')).val("").text(" ");
                    selectArea.append(option);
                }

                $(data.KrAddrSvcGetGuGunListOut.tblNm).each(function (idx, item) {
                    var optionText = item.cityGunGuAddr;
                    var optionValue = item.cityGunGuCd;
                    var option = $(document.createElement('option')).val(optionValue).text(optionText);

                    if (sParam.viewType) {
                        if (sParam.viewType == "ValNm") {
                            option = $(document.createElement('option')).val(optionValue).text(item.cd + " " + optionText);
                        }
                        else if (sParam.viewType == "val") {
                            option = $(document.createElement('option')).val(optionValue).text(item.cd);
                        }
                    }

                    selectArea.append(option);
                });

                sectionArea.html(selectArea);
                that.$el.find(sParam.className).html(sectionArea);

                if (sParam.selectVal) {
                    selectArea.find('option[value=' + sParam.selectVal + ']').attr('selected', true);
                }
                typeof fn === 'function' && fn();
            }
        }
    });
}

/* 라디오박스 생성 */
function fn_makeRadio(sParam, that, selectStyle, fn) {
    var param = {};

    param.cdNbr = sParam.cdNbr;

    var linkData = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": param};

    bxProxy.post(sUrl, JSON.stringify(linkData), {
        success: function (data) {
            if (fn_commonChekResult(data)) {
                that.$el.find("." + sParam.className).html("");
                var selectArea = "";

                var fristVal = "";

                $(data.CaCmnCdSvcGetCdListByCdNbrOut.tblNm).each(function (idx, item) {
                    var optionText = item.cdNm;
                    var optionValue = item.cd;
                    if (idx == 0) {
                        fristVal = optionValue;
                    }
                    var inputMarginRight = "2px";
                    var labelMarginRight = "5px";

                    if (sParam.inputMarginRight) {
                        inputMarginRight = sParam.inputMarginRight;
                    }

                    if (sParam.labelMarginRight) {
                        labelMarginRight = sParam.labelMarginRight;
                    }

                    var inRadio = "<input type=\"radio\" value=\"" + optionValue + "\" id=\"" + sParam.targetId + "_" + optionValue + "\" name=\"" + sParam.targetId + "\" style=\"vertical-align: middle; margin-right: " + inputMarginRight + ";\">";
                    inRadio += "<label for=\"" + sParam.targetId + "_" + optionValue + "\" style=\"vertical-align: middle; margin-right: " + labelMarginRight + ";\">" + optionText + "</label>";
                    selectArea += inRadio;
                });

                that.$el.find("." + sParam.className).html(selectArea);

                if (sParam.selectVal) {
                    that.$el.find('input:radio[name=' + sParam.targetId + ']:input:radio[value=' + sParam.selectVal + ']').attr("checked", true);
                }
                else {
                    that.$el.find('input:radio[name=' + sParam.targetId + ']:input:radio[value=' + fristVal + ']').attr("checked", true);
                }

                if (sParam.disabled) {
                    that.$el.find("." + sParam.className).attr("disabled", true);
                }

                if (sParam.hidden) {
                    that.$el.find("." + sParam.className).attr("hidden", true);
                }

                typeof fn === 'function' && fn();
            }
        }
    });
}

/**
 * empty combobox 생성
 */
function fn_getEmptyCombo(sParam, that, selectStyle) {
    var sectionArea = $(document.createElement('section'));

    sectionArea.addClass("bx-combo-box-wrap");
    sParam.className = "." + sParam.className;
    that.$el.find(sParam.className).html("");

    var selectArea = $(document.createElement('select'));

    selectArea.addClass("bx-combo-box bx-form-item bx-component-small");
    selectStyle && selectArea.css(selectStyle);
    selectArea.attr("data-form-param", sParam.targetId);

    if (sParam.disabled) {
        selectArea.attr("disabled", true);
    }

    var option = $(document.createElement('option')).val("").text("");

    selectArea.append(option);

    $(sectionArea).html(selectArea);

    that.$el.find(sParam.className).html(sectionArea);
}

/**
 * 상품코드조회
 */
function fn_getPdCodeList(sParam, that, selectStyle, fn) {
    var header = new Object();
    var headerParam = {};
    var param = {};
    var idName = sParam.idName || 'pdCd';
    var serviceCd;

    param.instCd = sParam.instCd;	//기관코드 추가
    param.bizDscd = sParam.bizDscd;
    param.pdTpCd = sParam.pdTpCd;
    param.pdTmpltCd = sParam.pdTmpltCd;

    if (sParam.instCd) {
        param.instCd = sParam.instCd;
    }

    if (sParam.getPdListByChannel == "Y") {
        serviceCd = "SPD0010404";
    } else {
        serviceCd = "SPD0010401";
    }

    var linkData = {"header": fn_getHeader(serviceCd), "PdTxSrvcMgmtSvcIn": param};

    bxProxy.post(sUrl, JSON.stringify(linkData), {
        success: function (data) {
            if (fn_commonChekResult(data)) {
            	var $targetArea = that.$el.find("." + sParam.className);
            	
            	$targetArea.html("");
            	
            	// 비활성화 처리
            	 if (sParam.disabled) {
            		 $targetArea.attr("disabled", true);
                 }
            	
            	 // 숨김처리
            	 if (sParam.hidden) {
            		 $targetArea.attr("hidden", true);
                 }
            	 
            	 // 빈값 처리
            	 if (sParam.nullYn == "Y") {
                     var option = $(document.createElement('option')).val("").text(sParam.allNm);
                     $targetArea.append(option);
                 }
            	 
                 $(data.PdTxSrvcMgmtSvcOut.tbl).each(function (idx, item) {
                     var optionText = item.pdNm;
                     var option = $(document.createElement('option')).val(item.pdCd).text(optionText);

                     if (sParam.viewType) {
                         if (sParam.viewType == "ValNm") {
                             option = $(document.createElement('option')).val(item.pdCd).text(item.pdCd + " " + optionText);
                         }
                         else if (sParam.viewType == "val") {
                             option = $(document.createElement('option')).val(item.pdCd).text(item.pdCd);
                         }
                     }


                     if (sParam.selectVal) {
                         if (sParam.selectVal == item[idName]) {
                             option.attr("selected", true);
                         }
                     }

                     $targetArea.append(option);
                 });
                 
            	 if (sParam.selectVal) {
            		 $targetArea.find('option[value=' + sParam.selectVal + ']').attr('selected', true);
                 }

                typeof fn === 'function' && fn(that);
            }
        }
    });
}

/**
 * 분류트리코드조회
 */
function fn_getClTreeCodeList(sParam, that, selectStyle) {
    var param = {};

    param.clId = sParam.clId;
    param.clHrarcyId = sParam.clHrarcyId;
    param.upClId = sParam.upClId;

    var linkData = {"header": fn_getHeader("SCM0028400"), "ClTreeSvcGetClassificationTreeListIn": param};

    bxProxy.post(sUrl, JSON.stringify(linkData), {
        success: function (data) {
            if (fn_commonChekResult(data)) {
                var sectionArea = $(document.createElement('section'));

                sectionArea.addClass("bx-combo-box-wrap");
                sParam.className = "." + sParam.className;
                that.$el.find(sParam.className).html("");

                var selectArea = $(document.createElement('select'));

                selectArea.addClass("bx-combo-box bx-form-item bx-component-small");
                selectStyle && selectArea.css(selectStyle);
                selectArea.attr("data-form-param", sParam.targetId);
                selectArea.attr("id", sParam.targetId + "combo");

                if (sParam.disabled) {
                    selectArea.attr("disabled", true);
                }

                if (sParam.nullYn == "Y") {
                    var option = $(document.createElement('option')).val("").text(" ");
                    selectArea.append(option);
                }

                $(data.ClTreeSvcGetClassificationTreeListOut.tblNm).each(function (idx, item) {
                    var optionText = item.clNm;
                    var optionValue = item.clId;
                    var clHrarcyId = item.clHrarcyId;
                    var mostLowrLvlYn = item.mostLowrLvlYn;
                    var option = $(document.createElement('option')).val(optionValue).text(optionText).attr("clHrarcyId", clHrarcyId).attr("mostLowrLvlYn", mostLowrLvlYn);

                    if (sParam.viewType) {
                        if (sParam.viewType == "ValNm") {
                            option = $(document.createElement('option')).val(optionValue).text(optionValue + " " + optionText).attr("clHrarcyId", clHrarcyId).attr("mostLowrLvlYn", mostLowrLvlYn);
                        }
                        else if (sParam.viewType == "val") {
                            option = $(document.createElement('option')).val(optionValue).text(optionValue).attr("clHrarcyId", clHrarcyId).attr("mostLowrLvlYn", mostLowrLvlYn);
                        }
                    }


                    if (sParam.selectVal) {
                        if (sParam.selectVal == item[idName]) {
                            option.attr("selected", true);
                        }
                    }

                    selectArea.append(option);
                });

                $(sectionArea).html(selectArea);

                that.$el.find(sParam.className).html(sectionArea);
            }
        }
    });
}

/**
 * 현재날짜 조회 (기관파라미터의 날짜 형식으로 ) defalut 는 "yyyy-mm-dd" 임
 */
function getCurrentDateByInstParamsDateFormat() { 

	var dateType = "yyyy-mm-dd";
	
	var dateFormatCd  = fn_getInstParm($.sessionStorage('instCd'), "dtFrmtCd");

	if (dateFormatCd = "01") {
		dateType = "yyyy-mm-dd";
	} 

	if  (dateFormatCd = "02") {
		dateType = "dd-mm-yyyy";
	}

	return	getCurrentDate(dateType);

}


/**
 * convert yyyymmdd date format to institution parameter's date format    defalut 는 "yyyy-mm-dd" 임
 */
function convertYyyymmddToInstParamsDateFormat(yyyymmdd) {


    if (fn_isNull(yyyymmdd) || yyyymmdd.length != 8) return yyyymmdd;


    var dateFormatCd  = fn_getInstParm($.sessionStorage('instCd'), "dtFrmtCd");

    var convertedDateFormat =  yyyymmdd.substring(0, 4) + "-" + yyyymmdd.substring(4, 6) +"-" + yyyymmdd.substring(6,8);

    if (dateFormatCd == "01") {
        convertedDateFormat =  yyyymmdd.substring(0, 4) + "-" + yyyymmdd.substring(4, 6) + "-" + yyyymmdd.substring(6,8);
    }

    if  (dateFormatCd == "02") {
        convertedDateFormat =   yyyymmdd.substring(6,8) + "-" + yyyymmdd.substring(4, 6) + "-" + yyyymmdd.substring(0, 4) ;
    }

    return	convertedDateFormat;

}
	

/**
 * retunr Date Picker Data Format by institution parameter  defalut 는 "yy-mm-dd" 임
 */
function getDatepickerDateFormatByInstParamsDateFormat() { 

	var datePickerFormat = "Y-m-d";
	
	var dateFormatCd  = fn_getInstParm($.sessionStorage('instCd'), "dtFrmtCd");

	if (dateFormatCd == "01") {
		datePickerFormat = "y-m-d";
	} 

	if  (dateFormatCd == "02") {
		datePickerFormat = "d-m-Y";
	}

	return	datePickerFormat;

}
	
	
/**
 * 현재날짜 조회
 */
function getCurrentDate(dateType) { // FIXME
    var now = new Date();   //현재시간
    var reDate;

    var year = now.getFullYear();   //현재시간 중 4자리 연도
    var month = now.getMonth() + 1;   //현재시간 중 달. 달은 0부터 시작하기 때문에 +1
    var date = now.getDate();      //현재 시간 중 날짜.
    var hour = now.getHours(); 
    var minute = now.getMinutes();
    var second = now.getSeconds();
    
    
    if ((month + "").length < 2) {
        month = "0" + month;   //달의 숫자가 1자리면 앞에 0을 붙임.
    }

    if ((date + "").length < 2) {
        date = "0" + date;
    }
    
    if ((hour + "").length < 2) {
    	hour = "0" + hour;
    }
    
    if ((minute + "").length < 2) {
    	minute = "0" + minute;
    }
    
    if ((second + "").length < 2) {
    	second = "0" + second;
    }

    if (dateType == "yyyymmdd") {
        reDate = year + "" + month + "" + date;
    }

    if (dateType == "yyyy-mm-dd") {
        reDate = year + "-" + month + "-" + date;
    }

    if (dateType == "dd-mm-yyyy") {
        reDate = date + "-" + month + "-" + year;
    }
    
    if (dateType == "yyyy-MM-dd HH:mm:ss") {
        reDate = year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
    }

    return reDate;
}

/**
 * 숫자만 있는지 검사
 */
function fn_onlyNumber(event) {
    event = event || window.event;
    var keyID = (event.which) ? event.which : event.keyCode;

    if ((keyID >= 48 && keyID <= 57) || (keyID >= 96 && keyID <= 105) || keyID == 8 || keyID == 46 || keyID == 37 || keyID == 39) {
        return true;
    } else {
        return false;
    }
}

/**
 * 문자 제거
 */
function fn_removeChar(event) {
    event = event || window.event;
    var keyID = (event.which) ? event.which : event.keyCode;
    var targetValue;

    if (keyID == 37 || keyID == 39 || keyID == 16 || keyID == 35 || keyID == 36) {
        return;
    } else {
        targetValue = event.target.value;

        if (!isNaN(fn_removeComma(targetValue))) { //문자가 아니면
            targetValue = Number(fn_removeComma(targetValue));
        }
        event.target.value = fn_setComma(targetValue + "".replace(/[^0-9]/g, ""));
    }
}

/**
 * 숫자에 콤마 삽입
 */
function fn_setComma(num) {
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
            return strArr[0];
    }
    else {
        return "";
    }
}

/**
 * 숫자 콤마 제거
 */
function fn_removeComma(n) {
    return parseInt(n.replace(/,/g, ""));
}

//document.write("<script src='/libs/bx/bx-frame/views/workspace.js'></script>");
/**
 * 공통 header
 */
function fn_getHeader(srcvCd) {
    var header = new Object();

    header.custId = $.sessionStorage('custId');
    header.staffId = $.sessionStorage('staffId');
    header.instCd = $.sessionStorage('instCd');
    header.userGrpCd = $.sessionStorage('userGrpCd');
    header.srvcCd = srcvCd;
    header.tmZone = "";
    header.deptId = $.sessionStorage('deptId');
    header.lngCd = $.sessionStorage('lngCd');
    header.txDt = $.sessionStorage('txDt');
    header.chnlDscd = $.sessionStorage('chnlDscd');
    header.scrnId = $.sessionStorage('scrnId');
    header.custRprsnId = $.sessionStorage('custRprsnId');// customer related person identification
    if(isDistrbutionEnv()){
	    var $selectInst = $("#header-taskSelectArea");
		if($selectInst && $selectInst.val() != ''){
			header.dstbTaskId = $selectInst.val();
		}
    }
    return header;
}

/**
 * Element 값 설정하기
 */
function fn_setVal(form, attr, val) {
    var that = form;

    that.$el.find('[data-form-param="' + attr + '"]').val(val);
}

/**
 * 거래 호출
 */
function fn_callTx(sParam, txParam, fn) {
    //서비스 header 정보 set
    var linkDataObj = {};

    linkDataObj['header'] = fn_getHeader(txParam.txCd);
    linkDataObj[txParam.ommNm] = sParam;

    // ajax호출
    bxProxy.post(sUrl, JSON.stringify(linkDataObj), {
        enableLoading: true
        , success: function (responseData) {
            fn_commonChekResult(responseData) && fn(responseData);
        }   // end of suucess: fucntion
    });  // end of bxProxy
}

/**
 * 공통 콤보 header 조립
 */
function fn_makeCmnCdCmbHdr(param) {
    // 콤보조회 서비스호출 준비
    var sParam = {};

    //    headerParam.application = "CPSvc";
    //    headerParam.service = "CmnCdSvc";
    //    headerParam.operation = "getCmnCdLstByCdNbr";
    //    headerParam.txCd = "PCM0038400";

    sParam = {};
    sParam.cdNbr = param;

    var linkData = {
        "header": fn_getHeader("PCM0038400")
        , "CmnCdSvcGetCdListByCdNbrIn": sParam
    };

    return linkData;
}

/**
 * Null Check
 */
function fn_isNull(param) {
    if (param == null)
        return true;
    
    if (param == 'undefined')
        return true;

    if (typeof param == 'string' && param.trim() == '')
        return true;
    
    if (typeof param == 'object' && $.isEmptyObject(param))
    	return true;
    
    return false;
}

/**
 * Empty Check
 */
function fn_isEmpty(param) {
    return fn_isNull(param);
}

/**
 * Convert String to Hex
 */
function fn_stringToHex(param) {
    var str = '';
    var i = 0;
    var len = param.length;
    var c;

    for (; i < len; i++) {
        c = param.charCodeAt(i);
        str += c.toString(16) + ' ';
    }

    return str;
}

/**
 * Convert Hex to String
 */
function fn_hexToString(param) {
    var arr = param.split(' ');
    var str = '';
    var i = 0;
    var len = arr.length;
    var c;

    for (; i < len; i += 1) {
        c = String.fromCharCode(parseInt(arr[i], 16));
        str += c;
    }

    return str;
}

/**
 * 문자열의 앞뒤 공백 제거
 */
function rlTrim(s) {
    s += ''; // 숫자라도 문자열로 변환

    return s.replace(/^\s*|\s*$/g, '');
}

/**
 * 숫자 타입에서 쓸 수 있도록 format() 함수 추가
 */
Number.prototype.format = function () {
    if (this == 0) return 0;

    var reg = /(^[+-]?\d+)(\d{3})/;
    var n = (this + '');

    while (reg.test(n)) n = n.replace(reg, '$1' + ',' + '$2');

    return n;
};

/**
 * 문자열 타입에서 쓸 수 있도록 format() 함수 추가
 */
String.prototype.format = function () {
    var num = parseFloat(this);

    if (isNaN(num)) return "0";

    return num.format();
};

/**
 * 여신사용 Common Util
 */
//여신 신청 Default 상품 
function getLnDefautlPdcd(s) {
    var rtnPdcd;

    if (s == "jeanVal") {
        rtnPdcd = "01021000100000000001";
    } else {
        rtnPdcd = "";
    }
    return rtnPdcd;
}

//숫자에 콤마 삽입  
function fn_LnSetComma(num, param) {
    num = num + "";

    if (num != "" || num != 0) {
        var regx = new RegExp(/(-?\d+)(\d{3})/);
        var bExists = num.indexOf(".", 0);
        var strArr = num.split('.');

        //콤마 표시
        while (regx.test(strArr[0])) {
            strArr[0] = strArr[0].replace(regx, "$1,$2");
        }

        //소수점 표시
        if (typeof param != "undefined" && param) {
            if (bExists > -1) {
                if (strArr[1].length < 2) {
                    while (strArr[1].length < 2) {
                        strArr[1] = strArr[1] + "0";
                    }
                    return strArr[0] + "." + strArr[1];
                } else {
                    return strArr[0] + "." + strArr[1].substr(0, 2);
                }
            } else {
                return strArr[0] + "." + "00";
            }
        } else {
            if (bExists > -1)
                return strArr[0] + "." + strArr[1].substr(0, 2);
            else
                return strArr[0];
        }
    } else {
        return "";
    }
}

/**
 * 계좌정보조회 콤보
 */
function fn_custAcct(sParam, that, selectStyle, param) {
    var linkData = {"header": fn_getHeader("SCU1120401"), "CustRelArrInqrySvcGetCustArrListIn": sParam};

    //ajax 호출
    bxProxy.post(sUrl, JSON.stringify(linkData), {
        success: function (responseData) {
            if (fn_commonChekResult(responseData)) {
                var tbList = responseData.CustRelArrInqrySvcGetCustArrListOut.custArrList;

                //상품조건리스트 셋팅
                if (tbList != null || tbList.length > 0) {
                    var sectionArea = $(document.createElement('section'));

                    sectionArea.addClass("bx-combo-box-wrap");
                    param.className = "." + param.className;
                    that.$el.find(param.className).html("");

                    var selectArea = $(document.createElement('select'));

                    selectArea.addClass("bx-combo-box bx-form-item bx-component-small");
                    selectStyle && selectArea.css(selectStyle);
                    selectArea.attr("data-form-param", param.targetId);

                    $(tbList).each(function (idx, item) {
                        if (item.acctNbr != null) {
                            var option = $(document.createElement('option')).val(item.acctNbr).text(item.acctNbr);

                            selectArea.append(option);
                        }
                    });
                    sectionArea.html(selectArea);

                    that.$el.find(param.className).html(sectionArea);
                }
            }
        }
    });
};

/**
 * 기관코드 선택 체크
 */
function fn_getInstCd(InstCd) {
    var result;
    var ss_instCd = $.sessionStorage('instCd');

    if (!fn_isNull(InstCd)) {
        result = InstCd;
    } else if (!fn_isNull(ss_instCd) && ss_instCd != 'STDA') {
        result = ss_instCd;
    }

    if (fn_isNull(result)) {
        return null;
    }

    return result;
}

/**
 * 숫자 여부 검증
 */
function fn_isNumber(val) {
    var fmt = /^[0-9]+$/;

    return fmt.test(val);
}

/**
 * 시간포멧이 맞는지 검증
 * @param str
 * @returns
 */
function fn_isTimeFormat(val) {
	// 000000 ~ 235959까지 가능
	var format = /^(2[0-3]|[0-1]\d)([0-5]\d){1,2}([0-5]\d){1,2}$/;
	return format.test(val);
}


// 0 삽입
function fn_setZero(str) {
    if ((str + "").length < 2) str = "0" + str;
    return str;
}

/**
 * 시작숫자부터 종료숫자까지의 숫자를 배열로 리턴 한다.
 * 예) 1, 31 = 1~31 까지의 숫자 리턴
 * @param startDay
 * @param endDay
 * @returns {Array}
 */
function fn_getTofromNumber(startDay, endDay) {
    var returnArray = [];
    for (var i = startDay; i <= endDay; i++) {
        var obj = new Object();
        obj.name = fn_setZero(i + "");
        obj.value = i;

        returnArray.push(obj);
    }

    return returnArray;
}

/**
 * check box change event change the value checked "Y", unchecked "N"
 *
 */

function fn_checkBoxValueChange(checkBoxObject) {
    var that = $(checkBoxObject)


    if (that.is(':checked')) {
        that.prop("value", "Y");
    } else {
        that.prop("value", "N");
    }
}


/**
 * Term agreement document show event
 *
 */
function fn_clickTermsAgrmntView(e) {

    var docId = $(e.parentNode).find('[data-form-param="arrPdDocId"]').val();
    var allClicked = true;

    alert(docId);

    // 약관보기 클릭 --> true.
    $(e.parentNode).find('.termsAgrmntView').attr('clicked', 'true');

    // 클릭 count 수가 전체 docList보다 클 때 ( 전체가 클릭되었을 때 )
    $($.find(".arrPdDocVal")).each(function (idx, data) {
        if ($($.find('.termsAgrmntView')[idx]).attr("clicked") == "false") {
            allClicked = false;
            return false;
        }
    });

    if (allClicked == true) {
        $("input[name=termsAgrmntYn]").prop("checked", true);
        $("input[name=termsAgrmntYn]").prop("value", "Y");
    }

}

/**
 * 서비스를 sync로 호출
 */
function fn_callSyncSvc(linkData) {

    if (linkData == null) return null;

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("post", sUrl, false); // false for synchronous request
    xmlHttp.send(JSON.stringify(linkData));

    return JSON.parse(xmlHttp.responseText);
}

/**
 * 기관파라미터조회
 */
function fn_getInstParm(instCd, parmAtrbtNm) {

    if (instCd == null || parmAtrbtNm == null) return null;
    
    var sessionValue = $.sessionStorage('inst_'+parmAtrbtNm);
    
    if(sessionValue) {
    	return sessionValue;
    }
    
    var param = {};
    param.instCd = instCd;

    var linkData = {"header": fn_getHeader("CAPCM0308403"), "CaInstMgmtSvcGetParmIn": param};
    var response = fn_callSyncSvc(linkData);
    if (response == null) return null;
    if (response.CaInstMgmtSvcGetParmOut == null) return null;

    var tblList = response.CaInstMgmtSvcGetParmOut.parmList;

    for (var idx = 0; idx < tblList.length; idx++) {
    	
    	$.sessionStorage('inst_'+tblList[idx].parmAtrbtNm, tblList[idx].parmVal);
    	
        if (tblList[idx].parmAtrbtNm == parmAtrbtNm) {
            result = tblList[idx].parmVal;
        }
    }
    
    return result;
}

/**
 * Dummy 콤보박스 생성
 */
function fn_getDummyCodeList(sParam, that, selectStyle, dummyParam) {
	var sectionArea = $(document.createElement('section'));

    sectionArea.addClass("bx-combo-box-wrap");
    sParam.className = "." + sParam.className;
    that.$el.find(sParam.className).html("");

    var selectArea = $(document.createElement('select'));

    selectArea.addClass("bx-combo-box bx-form-item bx-component-small");
    selectStyle && selectArea.css(selectStyle);
    selectArea.attr("data-form-param", sParam.targetId);

    if (sParam.nullYn == "Y") {
        var option = $(document.createElement('option')).val("").text(" ");
        selectArea.append(option);
    }
    
    if (sParam.disabled) {
        selectArea.attr("disabled", true);
    }
    
    $(dummyParam).each(function (idx, item) {
        var optionText = item.cdNm;
        var option = $(document.createElement('option')).val(item.cd).text(optionText);

        if (sParam.viewType) {
            if (sParam.viewType == "ValNm") {
                option = $(document.createElement('option')).val(item.cd).text(item.cd + " " + optionText);
            }
            else if (sParam.viewType == "val") {
                option = $(document.createElement('option')).val(item.cd).text(item.cd);
            }
            else if (sParam.viewType == "nm") {
                option = $(document.createElement('option')).val(item.cd).text(optionText);
            }
        }

        selectArea.append(option);
    });

    sectionArea.html(selectArea);
    that.$el.find(sParam.className).html(sectionArea);

    if (sParam.selectVal) {
        selectArea.find('option[value=' + sParam.selectVal + ']').attr('selected', true);
    }
}

// 달력생성
function fn_makeDatePicker(target, value) {
	var lngCd = $.sessionStorage('lngCd');
    var months;
    var dayOfWeek;
    
    if (lngCd === 'ko') {
    	months = ['1월(JAN)', '2월(FEB)', '3월(MAR)', '4월(APR)', '5월(MAY)', '6월(JUN)','7월(JUL)', '8월(AUG)', '9월(SEP)', '10월(OCT)', '11월(NOV)', '12월(DEC)'];
    	dayOfWeek =  ['일', '월', '화', '수', '목', '금', '토'];
    } else if (lngCd === 'zh') {
    	months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
        dayOfWeek = ["日", "一", "二", "三", "四", "五", "六"];
    } else {
    	months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
         dayOfWeek = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'];
    }
//    var isDisabled = false;
//    if($(target).is(':disabled')){
//    	isDisabled = true;
//    }
    // 달력 설정
    $(target).datepicker({
    	showOtherMonths: true
        , selectOtherMonths: true
        , altFormat: "yyyy-mm-dd"
    	, dateFormat: "yy-mm-dd" 
    	, monthNames : months // 월 설정
    	, monthNamesShort : months // 월의 언어 변환
    	, dayNames : dayOfWeek // 요일 설정
    	, dayNamesMin : dayOfWeek // 요일의 언어 변환
//    	, disabled: isDisabled
    	, currentText: '오늘 날짜' // 오늘날짜로 이동하는 버튼 패널
    	, gotoCurrent: true
//    	, buttonImageOnly: true
//    	, changeMonth: true // 셀렉트박스로 월 변경 여부
//    	, changeYear: true  // 셀렉트박스로 연도 변경 여부
    });
    
    if(value != undefined) {
    	$(target).val(value);
    }
    else {
    	$(target).val(getCurrentDate("yyyy-mm-dd"));
    }
}

function fn_datePickerIconClick(target) {
	$(target).datepicker("show");
	$(target).focus();
}

//MODAL OPEN CLOSE(그리드 접기용)*/
function fn_pageLayerCtrl(target, button) {
//	if($(target).is(":visible")) {
//		$(target).hide();
//	}
//	else {
//		$(target).show();
//	}
	if($(target).is(":visible")) {
		$(target).hide();
		if($(target).prev().find("i.fa-forward").length > 0) {
			$(target).prev().find("i.fa-forward").removeClass("fa-rotate-270");
			$(target).prev().find("i.fa-forward").addClass("fa-rotate-90");
		} 
		else {
			if($(target).prev(".sub-tool").length > 0) {
				var subTarget = $(target).prev(".sub-tool").find(".btn-wrap.fix-r .i-func-close");
				subTarget.removeClass("i-func-close");
				subTarget.addClass("i-func-open");
				return;
			}
			else if($(target).parent().parent().find("i.fa-forward").length > 0) {
				$(target).parent().parent().find("i.fa-forward").removeClass("fa-rotate-270");
				$(target).parent().parent().find("i.fa-forward").addClass("fa-rotate-90");
			}
		}
	}
	else {
		$(target).show();
		if($(target).prev().find("i.fa-forward").length > 0) {
			$(target).prev().find("i.fa-forward").removeClass("fa-rotate-90");
			$(target).prev().find("i.fa-forward").addClass("fa-rotate-270");
		} 
		else {
			if($(target).prev(".sub-tool").length > 0) {
				var subTarget = $(target).prev(".sub-tool").find(".btn-wrap.fix-r .i-func-open");
				subTarget.removeClass("i-func-open");
				subTarget.addClass("i-func-close");
				return;
			}
			else if($(target).parent().parent().find("i.fa-forward").length > 0) {
				$(target).parent().parent().find("i.fa-forward").removeClass("fa-rotate-90");
				$(target).parent().parent().find("i.fa-forward").addClass("fa-rotate-270");
			}
		}
	}
    if(button) $(button).toggleClass('toggled');
}

// 날짜값 변환 YYYY-MM-DD >> YYYYMMDD
function fn_getDateValue(value) {
	return value.replace(/-/gi, '');
}

function fn_setDateValue(value) {
    if(fn_isNull(value)) return '';
    return [value.slice(0, 4), '-', value.slice(4, 6), '-', value.slice(6)].join('');
}

// 시간값 변환 HH:MM:SS >> HHMMSS
function fn_getTimeValue(value) {
    return value.replace(/:/gi, '');
}

// 시간값 변환 HHMMSS >> HH:MM:SS
function fn_setTimeValue(value) {
    if(fn_isNull(value)) return '';
    return [value.slice(0, 2), ':', value.slice(2, 4), ':', value.slice(4)].join('');
}

function fn_createAccordion(that, target, collapsible, active) {
	
	that.$el.find(target).accordion({
		collapsible: collapsible
		, active: active
		, heightStyle: "content"
	});
	
	that.$el.find(target).accordion("refresh");       
}

function fn_createDetailAccordion(that, target, collapsible, active) {
	
	that.$el.find(target).accordion({
		collapsible: collapsible
		, active: active
		, heightStyle: "content"
		, beforeActivate : function(event, ui) {
//			console.log(event);
//			console.log(ui);
		}
	});
	
	that.$el.find(target).accordion("refresh");       
}

function fn_getSpectrumColorRgb(element) {
    var color = element.spectrum('get');

    if(!color) return 'transparent';

    return color.toRgbString();
}


function fn_checkEmptyColor(color) {
    if(color == 'transparent') return null;

    return color;
}

function fn_renderColorPicker(input, color) {
    input.spectrum({
        color: color,
        preferredFormat: "rgb",
        showInput: true, // 인풋박스 설정
        showAlpha: true, // 바 설정
        showPaletteOnly: true,
        showPalette: true, // 팔레트 설정
        showSelectionPalette: true,
        maxSelectionSize: 10,
        hideAfterPaletteSelect: true,
        togglePaletteOnly: true,
        togglePaletteMoreText: "More Color",
        togglePaletteLessText: "Less Color",
        allowEmpty: true,
        chooseText: bxMsg('cbb_items.SCRNITM#confirm'), // 선택하는 택스트 문구 설정
        cancelText: bxMsg('cbb_items.SCRNITM#B_cancel'), // 취소 문구 설정
//                    containerClassName : "클래스명", // 팔레트 css 지정
//                    replacerClassName: 'awesome', // 인풋박스의 css 지정

        palette: [ // 팔레트에 표시될 색 설정
            ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
            ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
            ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
            ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
            ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
            ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
            ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
            ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
        ]
    });
}

function isDistrbutionEnv(){
	var rtn = false;
	if (typeof(isDistribution) != "undefined")
	{
		if(isDistribution == 'Y'){  //config.js
			rtn = true;
		}
	}
	return rtn;
}
/*과제목록생성*/
function fn_headerTaskList(isTarget) {
	//배포시스템환경이 아니면..
//	var isDistribution = 'N'; 
	if(isUseDstb == false){  //config.js에 정의되어 있음... 배포기능사용여부
		$('#header-task-area').hide();
		return;
	} else {
		console.log("isUseDstb ==>" + isUseDstb);
	}
	
	if(isDistrbutionEnv()){
		if(isTarget){
			 if ($('#header-task-area').is(':visible')) {
				 return;
			 } else {
				 $('#header-task-area').show();
			 }
		} else {
			$('#header-task-area').hide();
			return;
		}
	} else {
		$('#header-task-area').hide();
		return;
	}
	
	// 개발과제 타이틀
	$("#headerSettingTaskTitle").text(bxMsg('cbb_items.SCRNITM#dstbTask')+" :");
	
    sParam = {};
    sParam.dstbTaskStsCd = '01'; //작성중
    sParam.dstbStaffId = $.sessionStorage('staffId'); //운영기배포미완료
    
    var linkData = {"header": fn_getHeader('CAPSV0060101'), "CaDstbTaskMIO": sParam};

    //ajax호출
    bxProxy.post(sUrl
        , JSON.stringify(linkData), {
            enableLoading: true,
            success: function (responseData) {
                if (fn_commonChekResult(responseData)) {
                    var tbList = responseData.CaDstbTaskMListOut.tbl;
                    var $selectInst = $("#header-taskSelectArea");
                    var selectedVal = $selectInst.val();
                	
                	$('#header-taskSelectArea option').remove();
                	// 빈값 처리
                	var option = $(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#B_select'));
                	$selectInst.append(option);
	               	 
                	$(tbList).each(function(idx, item) {
                		// 건수만큼 자식 생성
                		var optionText = item.dstbTaskNm;
                		var optionValue = item.dstbTaskId;
                		
                		$selectInst.append($(document.createElement('option')).val(optionValue).text(optionText));
                	});
                	
                	if (selectedVal) {
                		$selectInst.find('option[value=' + selectedVal + ']').attr('selected', true);
                    }
                }
            }   // end of suucess: fucntion
        }
    ); // end of bxProxy

}

/*과제선택 체크*/
function fn_headerTaskIdCheck() {
	if(isUseDstb == false){  //config.js에 정의되어 있음... 배포기능사용여부
		return true;
	} 
	
	if(isDistrbutionEnv()){
		var $selectInst = $("#header-taskSelectArea");
		var isDistribution = $('#header-task-area').css('display');
		if(isDistribution != 'none' && $selectInst.val() == ''){
			fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbTaskId')+"]");
			return false;
		}
	}
	return true;
}

/*화면 버튼 제어*/
function fn_btnCheckForDistribution(objList) {
	if(isUseDstb == false){  //config.js에 정의되어 있음... 배포기능사용여부
		return;
	} 
	if(isDistrbutionEnv()){
		return;
	}
	if(objList == undefined){
		return;
	}
    $(objList).each(function (idx, item) {
    	$(item).hide();
    });
}