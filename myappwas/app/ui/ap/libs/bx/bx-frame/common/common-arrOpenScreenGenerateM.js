	function fn_arrOpenScreenGenerateM (inParam,format,thatDiv) {
	    var param = {};
	    var serviceCd = "CAPAR0208400";
	
	    param.pdCd = inParam.pdCd;
	    param.instCd = inParam.instCd;
	    param.baseDt = inParam.baseDt;
	    param.arrStrctrQryCd = inParam.arrStrctrQryCd;
	
	    var linkData = {"header": fn_getHeader(serviceCd), "ArrOpnScrnIn": param};
	
	    //ajax 호출
	    bxProxy.post(sUrl, JSON.stringify(linkData), {
	        enableLoading: true,
	        success: function (data) {
	            if(fn_commonChekResult(data)) {
	                var displayInfo = data.ArrOpnScrnOut;
	
	                var headerSection = _generateHeader(displayInfo,format);
	
	                var cndSection = _generateCnd(displayInfo.arrStrctrCndList,format);
	                var xtnSection = _generateXtn(displayInfo.arrStrctrXtnList,format);
	                var relSection = _generateRel(displayInfo.arrStrctrRelList,format);
	
	                var mainSection     = "<div class=\"arrMain\" name=\""+inParam.pdCd+ "\">" + headerSection + relSection + xtnSection + cndSection + "</div>";
	                var childrenSection = "<div class=\"arrChildren\">" + _generateChild(displayInfo.children,format) + "</div>";
	
	                $(thatDiv).append(mainSection + childrenSection);
	
	                if (format.isHidden != undefined && format.isHidden == true ) {
	                    $(thatDiv).hide();
	                }
	                else {
	                    _generatePopupListener();
	                }
	            }
	        }
	
	    });
	
	}
	
	
	function _generateHeader(displayInfo,format) {
		
	    return "<table class=\"bx-info-table\"><tr><th>{{bxMsg \"cbb_items.pdNm\"}}</th><td>" + displayInfo.pdNm + "</td></tr></table>";
	}
	
	function _generateCnd(cndList,format) {
	
	    var return_fixedSection = "";
	    var return_valiableSection = "";
	
	    if (cndList == null || cndList.length < 1) return "";
	
	
	    var fixedCndCnt = 0;
	    var valiableCndCnt = 0;
	    var oneItem;
	
	    $(cndList).each(function (idx, conditionValue) {
	
	        var pdCndVal = _getPdCndValObject(conditionValue);
	
	        oneItem = _setCndLabel(pdCndVal);
	
	        if (_isFixedValue(pdCndVal)) {
	            oneItem += _fixedValueCondition(pdCndVal);
	            return_fixedSection +=  _buildLine(oneItem, format, fixedCndCnt++);
	        } else {
	            oneItem += _variableValueCondition(pdCndVal);
	            return_valiableSection +=  _buildLine(oneItem, format, valiableCndCnt++);
	        }
	    });
	
	    if (!fn_isEmpty(return_valiableSection)) {
	        return_valiableSection +=_fillBlankcell(format,fixedCndCnt);
	        return_valiableSection = "<table class=\"bx-info-table\">" + return_valiableSection + "</table>";
	    }
	
	    if (!fn_isEmpty(return_fixedSection)) {
	        return_fixedSection +=_fillBlankcell(format,fixedCndCnt);
	        return_fixedSection = "<table class=\"bx-info-table\">" + return_fixedSection + "</table>";
	    }
	
	    return _buildSection(return_fixedSection+return_valiableSection);
	}
	
	function _getPdCndValObject(conditionValue){
	
	    var pdCndVal = {};

	    if (!fn_isEmpty(conditionValue.pdCndVal)){
	    	pdCndVal = JSON.parse(conditionValue.pdCndVal);
		}
	
	    pdCndVal.isList = false;
	    pdCndVal.isMandatory = false;
	    pdCndVal.cndCd = conditionValue.cndCd;
	    pdCndVal.cndNm = conditionValue.cndNm;
	
	    if (conditionValue.cndTpCd == "01") pdCndVal.isList = true;
	    if (conditionValue.mndtryNegtnCndYn == "Y") pdCndVal.isMandatory = true;
	
	    return pdCndVal;
	}
	
	function _setCndLabel(pdCndVal) {
	
	    var conditonHidden = "<td hidden=\"true\"><input type=\"text\" value=\"" + pdCndVal.cndCd + "\" class=\"arrCndCd\"/></td>";
	
	    var measurementUnit = "";
	
	    if (pdCndVal.msurUnitNm != undefined) {
	        measurementUnit = "	<th  hidden=\"true\"><input type=\"text\" value=\"" + pdCndVal.msurUnitCd + "\"/>";
	    }
	
	    if (pdCndVal.crncyCd != undefined) {
	        measurementUnit = "	<th  hidden=\"true\"><input type=\"text\" value=\"" + pdCndVal.crncyCd + "\"/>";
	    }
	
	    return  "<th style=\"text-align: right;\"> "+ pdCndVal.cndNm+"</th>" + measurementUnit + conditonHidden
	}
	
	
	function _isFixedValue(pdCndVal) {
	
	    if (pdCndVal.isList) {
	        if (pdCndVal.isMandatory && pdCndVal.listCdList.length < 2) {
	            return true;
	        }
	        return false;
	    }
	
	    if (pdCndVal.isMandatory && 
	        pdCndVal.minVal != undefined && pdCndVal.maxVal != undefined && pdCndVal.bsicVal != undefined &&
	        pdCndVal.minVal == pdCndVal.maxVal && pdCndVal.minVal == pdCndVal.bsicVal) {
	        return true;
	    }
	
	    return false;
	}
	
	
	function _fixedValueCondition(pdCndVal) {
	
	    if (pdCndVal.isList) {
	        return "<th  hidden=\"true\"><input type=\"text\" class=\"arrCndVal\" value=\"" + pdCndVal.listCdList[0].listCd + "\"/><td>"+pdCndVal.listCdList[0].listCdNm+"</td>";
	    }
	
	    var measurementUnit = _getMeasurementUnitString(pdCndVal);
	
	    return "<th  hidden=\"true\"><input type=\"text\" value=\"" + pdCndVal.basicVal + "\"/><td style=\"float: left; text-align: right;\">"+pdCndVal.basicVal+"&nbsp"+ measurementUnit+"</td>";
	}
	
	function _getMeasurementUnitString(pdCndVal) {
	
	    if (pdCndVal.crncyNm != undefined) {
	        return pdCndVal.crncyNm;
	    }
	    if (pdCndVal.msurUnitNm != undefined) {
	        return pdCndVal.msurUnitNm;
	    }
	
	}
	
	function _variableValueCondition(pdCndVal) {
	
	    if (pdCndVal.isList) {
	
	        var basicVal = "";
	
	        if (pdCndVal.bsicListCd != undefined) basicVal = pdCndVal.bsicListCd;
	        var listString = "";
	
	        $(pdCndVal.listCdList).each(function (idx, listItem) {
	            var oneListCd;
	            if (basicVal == listItem.listCd) {
	                oneListCd = "<option value=\"" + listItem.listCd + "\" selected>" + listItem.listCdNm;
	            } else {
	                oneListCd = "<option value=\"" + listItem.listCd + "\">" + listItem.listCdNm;
	            }
	            listString +=oneListCd;
	        });
	
	        if (!pdCndVal.isMandatory){
	            if (basicVal == "") {
	                listString = "<option value=\"\" selected ></option>" + listString
	            } else {
	                listString = "<option value=\"\" ></option>" + listString
	            }
	        }
	        
	        listString = "<select class=\"bx-combo-box bx-form-item bx-component-small arrCndVal\" >"+listString+"</select>";
	        listString = "<section class=\"bx-combo-box-wrap\">" + listString + "</section>";
	        listString = "<td><span class=\""+ pdCndVal.cndCd + "-wrap\">"+listString+"</span></td>";

	        return listString;
	
	    }
	
	    if (pdCndVal.bsicVal != undefined) basicVal = pdCndVal.bsicVal;
	    
	    var with80String;
	    
	    var measurementUnitString = _getMeasurementUnitString(pdCndVal);
	    
	    if (fn_isEmpty(measurementUnitString)) {
	    	with80String = "";
	    	measurementUnitString = "";
	    } else {
	    	with80String = "width : 80%;";
	    	measurementUnitString = "<span style=\"text-align: right;\">&nbsp" + measurementUnitString + "</span>";
	    }
	
	    return   "<td><input type=\"text\" value=\""+basicVal+"\" class=\"bx-form-item bx-component-small arrCndVal\" style=\"float: left;"+ with80String + " text-align: right;\"/>"
	        + measurementUnitString + "</td>";	
	}
	
	
	function _generateXtn(xtnList,format) {
	
	    var returnSection = "";
	    if (xtnList == null || xtnList.length < 1) return returnSection;
	
	    var itemCnt = 0;
	
	    $(xtnList).each(function (idx, xtnInfo) {
	
	        var label = xtnInfo.lblNm;
	        var oneItem = "<th data-tooltip=\""+label+"\" style=\"text-align: right;\"><i class=\"fa fa-check fa-lg require-check-icon\"></i>"+label+"</th>";
	
	        switch (xtnInfo.atrbtTpCd) {
	            case "NU":
	                oneItem += _xtnNumberType(xtnInfo);
	                break;
	            case "TD":
	                oneItem += _xtnDateType(xtnInfo);
	                break;
	            case "PW":
	                oneItem += _xtnPasswordType(xtnInfo);
	                break;
	            default :
	                oneItem += _xtnDefaultType(xtnInfo);
	        }
	        oneItem+=_xtnCommon(xtnInfo);
	
	        returnSection += _buildLine(oneItem,format,itemCnt++);
	    });
	    returnSection +=_fillBlankcell(format,itemCnt);
	
	    returnSection = "<table class=\"bx-info-table\" id=\"xtnAtrbtNm-table\">" + returnSection + "</table>";
	
	    return _buildSection(returnSection);
	}
	
	function _xtnNumberType(xtnInfo){
	
	    return ( "<td>"
	    + " <input type=\"number\" name=\""+xtnInfo.xtnAtrbtNm+"\" value=\"\" maxlength=\""+xtnInfo.len+"\" class=\"bx-form-item bx-component-small arrXtnAtrbt\" style=\"text-align: left;\"/>"
	    + "</td>" )
	}
	
	function _xtnDateType(xtnInfo){
	    return ( "	<td>"
	    + "<span class=\""+xtnInfo.xtnAtrbtNm+"-date-wrap arrXtnAtrbt\"></span>"
	    + "</td>" )
	}
	
	function _xtnPasswordType (xtnInfo) {
	    return ( "	<td>"
	    + "	<input type=\"password\" name=\""+xtnInfo.xtnAtrbtNm+"\" maxlength=\""+xtnInfo.len+"\" value=\"\" class=\"bx-form-item bx-component-small arrXtnAtrbt\" style=\"text-align: left;\"/>"
	    + "</td>" )
	}
	
	function _xtnDefaultType (xtnInfo) {
	    return ( "	<td>"
	    + "	<input type=\"text\" name=\""+xtnInfo.xtnAtrbtNm+"\" maxlength=\""+xtnInfo.len+"\" value=\"\" class=\"bx-form-item bx-component-small arrXtnAtrbt\" style=\"text-align: left;\"/>"
	    + "</td>" )
	}
	
	function _xtnCommon (xtnInfo) {
	    return ( "	<td hidden=\"true\">"
	    + "	<input class =\"arrXtnAtrbtType\" value=\""+xtnInfo.atrbtTpCd+"\" ></input>"
	    + "	</td>" )
	}
	
	function _buildLine(oneItem,format,itemCnt) {
	
	    var returnString = oneItem;
	    if (itemCnt % format.colCount == 0) {
	        returnString = "<tr>" + returnString;
	    }
	
	    if ((itemCnt % format.colCount + 1) == format.colCount) {
	        returnString += "</tr>";
	    }
	
	    return returnString;
	}
	
	function _fillBlankcell(format,itemCnt) {
	    var returnString ="";
	
	    if (itemCnt % format.colCount == 0)  return returnString;
	
	    var loopCnd = format.colCount - itemCnt % format.colCount;
	
	    for(var i = 0; i < loopCnd; i++){
	        returnString += "<th></th><td></td>";
	    }
	
	    return returnString;
	}
	
	function _buildSection(inStirng) {
	    return ("<section class=\"bx-container bx-panel-body\">" +  inStirng + "</section>");
	}
	
	function _generateRel (relList,format) {
	    var returnSection = "";
	
	    if (relList == null || relList.length < 1) return returnSection;
	
	    var itemCnt = 0;
	
	    var oneItem;
	    var relKind = "";
	
	    $(relList).each(function (idx, relInfo) {
	        oneItem =_relCommon(itemCnt,relInfo);
	        returnSection += _buildLine(oneItem,format,itemCnt++);
	    })
	
	    returnSection +=_fillBlankcell(format,itemCnt);
	    returnSection = "<table class=\"bx-info-table\" id=\"relAtrbtNm-table\">" + returnSection + "</table>";
	
	    return _buildSection(returnSection);
	
	}
	
	function _relCommon(itemCnt,relInfo) {
	    var returnString = "";
	    returnString += "<th data-tooltip=\""+relInfo.arrRelNm+"\" style=\"text-align: right;\"><i class=\"fa fa-check fa-lg require-check-icon\"></i>"+relInfo.arrRelNm+"</th>";
	    returnString += "<td>";
	    returnString += "	<input type=\"text\" class=\"bx-form-item bx-component-small relObjId\" maxlength=\"18\" style=\"text-align: left;\"/>";
	    returnString += "	<button class=\"bx-icon bx-icon-medium bx-icon-search \" id=\"arrRel"+relInfo.arrRelKndCd+"\" maxlength=\"18\" style=\"text-align: right;\"></button>"
	    returnString += "</td>";
//	    returnString += "<td hidden=\"true\"><input class=\"relObjId\"     type=\"text\"                                 /></td>";
	    returnString += "<td hidden=\"true\"><input class=\"arrRelKndCd\"  type=\"text\" value=\""+relInfo.arrRelKndCd +"\" /></td>";
	    returnString += "<td hidden=\"true\"><input class=\"arrRelCd\"     type=\"text\" value=\""+relInfo.arrRelCd    +"\" /></td>";
	    return returnString;
	}
	
	function _generateChild(children,format) {
	
	    var returnSection = "";
	    if (children == null || children.length < 1) return returnSection;
	    var itemCnt = 0;
	    var oneItem;
	
	    $(children).each(function (idx, childData) {
	
	        oneItem = _setChildHead(childData,format);
	
	        oneItem += _generateXtn(childData.arrStrctrXtnList,format);
	        oneItem += _generateCnd(childData.arrStrctrCndList,format);
	        oneItem += _generateRel(childData.arrStrctrRelList,format);
	        returnSection += "<div class=\"arrChild\">" + oneItem + "</div>"
	    });
	
	    return _buildSection(returnSection);
	
	}
	
	
	function _setChildHead(data,format) {
	
	    var requireYn = "";
	
	    if (data.mndtryYn == "Y" ) {
	        requireYn = "checked disabled";
	    } else {
	        requireYn = "";
	    }
	
	    returnString  = "<tr><th data-tooltip=\""+data.pdNm+"\" style=\"text-align: right;\">"+data.pdNm+"</th>";
	    returnString += "<td><input type=\"checkbox\" name=\""+data.pdCd+"\" class = \"childProductSelect\" "+requireYn+" ></td><td colspan=\"6\"><hr></td></tr>"
	    returnString  = "<table class=\"bx-info-table\">" + returnString + "</table>";
	
	    return  returnString;
	}
	

	
	
	
	
	
	
	function _generatePopupListener ()  {
		$('#arrRel01').click(function(){
			var param = {};
			var that = this;
			param.type = "03";
			var popupCustId = new PopupCustId(param); // 팝업생성
			popupCustId.render();
			popupCustId.on('popUpSetData', function(param) {
				$(that).parent().children().filter('.relObjname').val(param.custNm);
				$(that).parent().next().find('.relObjId').val(param.custId);
			});
		});

		$('#arrRel02').click(function(){
			var param = {};
			var that = this;
			param.custId = $('#custIdVal').val();
			var popupCustAcct = new PopupCustAcct(param); // 팝업생성
			popupCustAcct.render();
			popupCustAcct.on('popUpSetData', function(param) {
				$(that).parent().children().filter('.relObjname').val(param.pdNm);
				$(that).parent().next().find('.relObjId').val(param.acctNbr);
			});
		});

		$('#arrRel03').click(function(){
			var param = {};
			var that = this;
			var popupStaffId = new PopupStaffId(param); // 팝업생성
			popupStaffId.render();
			popupStaffId.on('popUpSetData', function(param) {
				$(that).parent().children().filter('.relObjname').val(param.nm);
				$(that).parent().next().find('.relObjId').val(param.staffId);
			});
		});

		$('#arrRel04').click(function(){
			var param = {};
			var that = this;
			param.instCd = instCd;
			var popupDeptCd = new PopupDeptCd(param); // 팝업생성
			popupDeptCd.render();
			popupDeptCd.on('popUpSetData', function(param) {
				$(that).parent().children().filter('.relObjname').val(param.brnchNm);
				$(that).parent().next().find('.relObjId').val(param.brnchCd);
			});
		});
	}



	function fn_datepicker (tbXtnList, that) {

		$(tbXtnList).each(function (idx, data) {

			var xtnAtrbtNm = data.xtnAtrbtNm;
			that.subViews[xtnAtrbtNm] && that.subViews[xtnAtrbtNm].remove();
			// 거래년월일 데이터 피커 생성
			that.subViews[xtnAtrbtNm] = new DatePicker({
				inputAttrs: {'data-form-param': xtnAtrbtNm},
				setTime: false
			});
			// 거래년월일데이터 피커 렌더
			that.$el.find('.'+xtnAtrbtNm+"-date-wrap").html(that.subViews[xtnAtrbtNm].render());
		});
	}

	
	
	//신규입력값가져오기
	function fn_arrOpenInputGenerateM (thatDiv) {
	
	    var returnObject = {};
	    var main = {};
	    var mainDiv = $(thatDiv).find(".arrMain")
	    var childrenDiv = $(thatDiv).find(".arrChildren")
	
//	    main.   	 = _getInputBasicData(mainDiv); //기본정보
	    main.cndList = _getInputCndData(mainDiv); 	//조건리스트
	    main.xtnList = _getInputXtnData(mainDiv); 	//확장값리스트
	    main.relList = _getInputRelData(mainDiv); 	//관계값리스트
	    main.pdCd = $(mainDiv).attr("name");      	//상품코드
	
	    returnObject.main     = main;
	    returnObject.children = _getInputChildrenData(childrenDiv);
	
	    return returnObject;
	}
	
	function _getInputCndData (thatDiv){
	
	    var inputCndData = [];
	
	    $(thatDiv).find(".arrCndCd").each(function(idx, data) {
	        var inputParam = {};
	        inputParam.cndCd = $(this).val();
	        inputParam.txtCndVal = $(this).parent().next().find(".arrCndVal").val();
	        inputCndData.push(inputParam);
	    });
	
	    return inputCndData;
	}
	
	function _getInputXtnData (thatDiv){
	
	    var inputXtnData = [];
	
	    $(thatDiv).find(".arrXtnAtrbt").each(function(idx, data) {
	        var inputParam = {};
	        inputParam.xtnAtrbtNm = $(this).attr("name");
	        inputParam.xtnAtrbtCntnt = $(this).val();
	        if(inputParam.xtnAtrbtCntnt !="" && "TD" == $(this).parent().next().find(".arrXtnAtrbtType").val()){
	            inputParam.xtnAtrbtCntnt = XDate(inputParam.xtnAtrbtCntnt).toString('yyyyMMdd');
	        }
	        inputXtnData.push(inputParam);
	    });
	
	    return inputXtnData;
	}
	
	function _getInputRelData(thatDiv){
	    var inputRelData = [];
	    $(thatDiv).find(".arrRelKndCd").each(function(idx, eachObject) {
	        var inputParam = {};
	        inputParam.arrRelKndCd = $(this).val();
	        inputParam.arrRelCd = $(this).parent().next().find(".arrRelCd").val();
	        inputParam.rltdBizObjId = $(this).parent().prev().find(".relObjId").val();
	        inputRelData.push(inputParam);
	    });
	    return inputRelData;
	}
	
	
	function _getInputChildrenData(thatDiv){
	    var inputChildrenData = [];
	    $(thatDiv).find(".arrChild").each(function(idx, eachObject) {
	        var inputParam = {};
	        if ($(this).find(".childProductSelect").is(":checked")) {
	            inputParam.pdCd = $(this).find(".childProductSelect").attr("name")
	            inputParam.cndList = _getInputCndData(this); //조건리스트
	            inputParam.xtnList = _getInputXtnData(this); //확장값리스트
	            inputParam.relList = _getInputRelData(this); //관계값리스트
	            inputChildrenData.push(inputParam);
	        }
	    });
	    return inputChildrenData;
	}
		
