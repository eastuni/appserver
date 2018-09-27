define(
    [
        'bx/common/config'
        , 'bx-component/message/message-alert'
        , 'bx-component/message/message-confirm'
        , 'bx-component/date-picker/_date-picker'
        , 'app/views/page/popup/popup-custId'
        , 'app/views/page/popup/popup-custAcct'
        , 'app/views/page/popup/popup-staffId'
        , 'app/views/page/popup/popup-brnchCd'
        , 'app/views/page/popup/popup-useAgrmntList'
        , 'bx/common/common-info'

    ]
    , function(
        config
        , alertMessage
        , confirmMessage
        , DatePicker
        , PopupCustId	//customer
        , PopupCustAcct	//arrangement
        , PopupStaffId	//staffId
        , PopupDeptCd	//deptCd'
        , PopupUseAgrmnt

    ) {

        /* ======================================================================== */
        /* Generate Condition UI By Using Response Data							    */
        /* ======================================================================== */
        fn_generateUIWithData = function (data, format, thatDiv) {

            var displayData = data.ArrOpnScrnOut;

            var cndSection = _generateCnd(displayData.arrStrctrCndList,format);
            var xtnSection = _generateXtn(displayData.arrStrctrXtnList,format);
            var relSection = _generateRel(displayData.arrStrctrRelList,format);
            var pdDocSection = _generatePdDoc(displayData.arrStrctrPdDocList, format);

            var mainSection     = "<div class=\"arrMain\" name=\""+displayData.pdCd+ "\">"  + relSection  + cndSection + pdDocSection + xtnSection + "</div>";
            var childrenSection = "<div class=\"arrChildren\">" + _generateChild(displayData.children,format) + "</div>";

             $(thatDiv).append(mainSection + childrenSection);

             _generatePopupListener(thatDiv);

             if (format.relSectionHidden != undefined && format.relSectionHidden == true) {
                 $(thatDiv).find(".relAtrbtNm-table").hide();
             }
             if (format.xtnSectionHidden != undefined && format.xtnSectionHidden == true) {
                 $(thatDiv).find(".xtnAtrbtNm-table").hide();
             }
             if (format.cndSectionHidden != undefined && format.cndSectionHidden == true) {
                 $(thatDiv).find(".cndAtrbtNm-table").hide();
             }
        };

        function _generateCnd(cndList,format) {

            var returnSection = "";
            if (cndList == null || cndList.length < 1) return returnSection;
            var itemCnt = 0;
            var oneItem;

            $(cndList).each(function (idx, data) {
                oneItem = _setCndLabel(data,format);
                oneItem +=_cndCommon(data,format);
                switch (data.cndTpCd) {
                    case "01":
                        oneItem += _cndListType(data,format);
                        break;
                    default :
                        oneItem += _cndOtherType(data,format);
                }
                returnSection += _buildLine(oneItem, format, itemCnt++);
            });

            returnSection +=_fillBlankcell(format,itemCnt);
            returnSection = "<table class=\"bx-info-table cndAtrbtNm-table\" id=\"cnd-table\">" + returnSection + "</table>";
            return _buildSection(returnSection);
        }

        function _setCndLabel(data,format) {

            var measurementUnit = "";
            var label = data.cndNm;
            var requireYn = "";

            if (data.mndtryNegtnCndYn == "Y") {
                requireYn = "<i class=\"fa fa-check fa-lg require-check-icon\"></i> " ;
            }
            if (data.pdCndVal !=null && data.pdCndVal.indexOf('msurUnitNm') != -1 ) {
                var pdCndVal = JSON.parse(data.pdCndVal);
                label = label + " [" + pdCndVal.msurUnitNm + "]";
                measurementUnit = "	<th  hidden=\"true\"><input type=\"text\" value=\"" + pdCndVal.msurUnitCd + "\" class=\"msurUnitCd\" />";
            }

            if (data.pdCndVal !=null && data.pdCndVal.indexOf('crncyCd') != -1 ) {
                var pdCndVal = JSON.parse(data.pdCndVal);
                label = label + " [" + pdCndVal.crncyCd + "]";
                measurementUnit = "	<th  hidden=\"true\"><input type=\"text\" value=\"" + pdCndVal.crncyCd + "\"/>";
            }

            var returnString = "<th data-tooltip=\""+label+"\" style=\"text-align: right;\"> " + requireYn + label+"</th>" + measurementUnit;
            return  returnString;
        }

        function _cndListType(data,format) {

            var pdCndVal = {};

            if (!fn_isEmpty(data.pdCndVal)) {
                pdCndVal = JSON.parse(data.pdCndVal);
            }

            var basicVal = "";
            var disabled = "";

            if (pdCndVal.bsicListCd != undefined && format.setDefault != undefined && format.setDefault == true ) basicVal = pdCndVal.bsicListCd;   // FIXME KisuKim

            if (data.mndtryNegtnCndYn == "Y"&& pdCndVal.listCdList.length < 2) {
                disabled = "disabled"
            } else {
                disabled = ""
            }

            var returnString = "";
            $(pdCndVal.listCdList).each(function (idx, listItem) {
                var oneListCd;
                if (basicVal == listItem.listCd) {
                    oneListCd = "<option value=\"" + listItem.listCd + "\" selected>" + listItem.listCdNm;
                } else {
                    oneListCd = "<option value=\"" + listItem.listCd + "\">" + listItem.listCdNm;
                }
                returnString +=oneListCd;
            });

            if (data.mndtryNegtnCndYn != "Y"){
                if (basicVal == "") {
                    returnString = "<option value=\"\" selected ></option>" + returnString
                } else {
                    returnString = "<option value=\"\" ></option>" + returnString
                }
            }

            returnString = "<select class=\"bx-combo-box bx-form-item bx-component-small arrCndVal\" data-form-param=\""+data.cndCd+"\" "+disabled+" >"+returnString+"</select>";
            returnString = "<section class=\"bx-combo-box-wrap\">" + returnString + "</section>";

            // 종속조건이 있는지 여부에 따라 class 주기
            if(data.dpndntCndYn == "Y"){
                returnString = "<td><span class=\""+ data.cndCd + "-wrap upperCnd\" value=\""+data.cndCd+"\" >"+returnString+"</span></td>";
            }else{
                returnString = "<td><span class=\""+ data.cndCd + "-wrap\">"+returnString+"</span></td>";
            }
            return returnString;
        }

        function _cndOtherType (data,format){

            var pdCndVal = {};

            if (!fn_isEmpty(data.pdCndVal)) {
                pdCndVal = JSON.parse(data.pdCndVal);
            }

            var basicVal = "";
            var disabled = "";
            var returnString = ""


            if (data.mndtryNegtnCndYn == "Y") {
                if (data.pdCndVal != undefined && pdCndVal.minVal != undefined && pdCndVal.maxVal != undefined && pdCndVal.bsicVal != undefined &&
                    pdCndVal.minVal == pdCndVal.maxVal && pdCndVal.minVal == pdCndVal.bsicVal) {
                    disabled = "disabled";
                }
            }

            if (data.pdCndVal != undefined && pdCndVal.bsicVal != undefined && format.setDefault != undefined && format.setDefault == true){ basicVal = pdCndVal.bsicVal; }
            // 계약생성시 설정한 조건 value가 있는 경우
            if (data.arrCndVal != undefined && data.arrCndVal != null){ basicVal = data.arrCndVal; }

            if(data.cndTpCd == "02" && data.pdCndValAsRdblForm != null && data.pdCndValAsRdblForm.indexOf('msurUnitNm') == -1){
                returnString += "<td data-tooltip=\""+data.pdCndValAsRdblForm+"\">" ;

                // 금액 comma 처리
                if (basicVal != "") {basicVal = fn_setComma(parseInt(basicVal))}

                returnString += "<input type=\"text\" value=\""+basicVal+"\"  data-form-param=\""+data.cndCd+"\" id=\"amount\" class=\"bx-form-item bx-component-small arrCndVal\" style=\"float: left; text-align: right;\" "+ disabled +"   />" ;
                returnString += "</td>" ;

            }else if(data.cndTpCd == "02" && data.pdCndValAsRdblForm != null && data.pdCndValAsRdblForm.indexOf('msurUnitNm') > -1){
                // 기간 소수점 제거 처리
                if (!fn_isEmpty(basicVal)) {basicVal = parseInt(basicVal);}

                returnString += "<td data-tooltip=\""+data.pdCndValAsRdblForm+"\">";
                returnString += "<input type=\"text\" value=\""+basicVal+"\"  data-form-param=\""+data.cndCd+"\" id=\"term\"  class=\"bx-form-item bx-component-small arrCndVal\" style=\"float: left; text-align: right;\" "+ disabled +"   />";
                returnString += "</td>";

            }else{
                returnString += "<td data-tooltip=\""+data.pdCndValAsRdblForm+"\">";
                returnString += "<input type=\"text\" value=\""+basicVal+"\"  data-form-param=\""+data.cndCd+"\"  class=\"bx-form-item bx-component-small arrCndVal\" style=\"float: left; text-align: right;\" "+ disabled +"   />";
                returnString += "</td>";

            }

            return returnString;
        }

        function _cndCommon(data,format) {
            var returnString = "";

            returnString += "<td hidden=\"true\">";
            returnString += "<input type=\"text\"  value=\"" + data.cndCd + "\" class=\"bx-form-item bx-component-small arrCndCd\"     />";
            returnString += "</td>";


            //4.<td> area readableForm
            if (format.readableFormYn == "Y") {
                returnString += "	<td id=\"readableForm\" colspan=\"4\">";
                returnString += "		<p id=\"readableForm\" style=\"text-align: left;\">" + data.pdCndValAsRdblForm + "</p>";
                returnString += "	</td>";
            }

            return returnString;
        }

        // Generate Product Document List
        function _generatePdDoc(arrStrctrPdDocList, format) {

            var returnSection = "";

            if(format.docSectionHidden != undefined && format.docSectionHidden == true)
                return returnSection;

            if (arrStrctrPdDocList == null || arrStrctrPdDocList.length < 1) return returnSection;

            var arrPdDocSize = arrStrctrPdDocList.length;

            $(arrStrctrPdDocList).each(function (idx, pdDocInfo) {

                if(idx == 0){
                returnSection += _buildFirstLinePdDocList(pdDocInfo, arrPdDocSize, format)
                }else{
                returnSection += _pdDocCommon(pdDocInfo,format);
                }
            })

            returnSection = "<table class=\"bx-info-table\" id=\"pdDoc-table\">"  + returnSection + "</table>";

            return _buildSection(returnSection);

        }

        function _buildFirstLinePdDocList(pdDocInfo, arrPdDocSize,format) {
            var returnString = "";
            var clickYn = false;

            returnString += "<tr>"
            returnString += "<th rowspan=\""+arrPdDocSize+"\"><i class=\"fa fa-check fa-lg require-check-icon\"></i>"
            returnString +=  bxMsg('cbb_items.AT#termsAgrmntList');
            returnString += "</th>";
            returnString += "<td style=\"text-align: left;\" data-tooltip=\""+pdDocInfo.docNm+"\" class=\"arrPdDocVal\ style=\"text-align: right;\">" + pdDocInfo.docNm + "</td>";
            returnString += "<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            returnString += "<input type=\"text\" data-form-param=\"arrPdDocId\" value=\""+pdDocInfo.docId+"\"  hidden>";
            returnString += "<button class=\"bx-btn bx-btn-small termsAgrmntView\" clicked = \""+clickYn+"\" onclick=\"fn_clickTermsAgrmntView(this);\">";
            returnString +=  bxMsg('cbb_items.SCRNITM#termsAgrmntView');
            returnString += "</button>"
            returnString += "</td><td colspan=\""+ (format.colCount * 2 - 3) +"\"/>";
            returnString += "</tr>"

            return returnString;
        }


        function _pdDocCommon(pdDocInfo,format) {

            var returnString = "";
            var clickYn = false;

            returnString += "<tr>"
            returnString += "<td style=\"text-align: left;\" data-tooltip=\""+pdDocInfo.docNm+"\" class=\"arrPdDocVal\ style=\"text-align: right;\">" + pdDocInfo.docNm + "</td>";
            returnString += "<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            returnString += "<input type=\"text\" data-form-param=\"arrPdDocId\" value=\""+pdDocInfo.docId+"\"  hidden>";
            returnString += "<button class=\"bx-btn bx-btn-small termsAgrmntView\" clicked = \""+clickYn+"\" onclick=\"fn_clickTermsAgrmntView(this);\">";
            returnString +=  bxMsg('cbb_items.SCRNITM#termsAgrmntView');
            returnString += "</button>";
            returnString += "</td><td colspan=\""+ (format.colCount * 2 - 3) +"\"/>";
            returnString += "</tr>"

            return returnString;
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
                    case "YN":
                        oneItem += _xtnBooleanType(xtnInfo);
                        break;
                    default :
                        oneItem += _xtnDefaultType(xtnInfo);
                }
                oneItem+=_xtnCommon(xtnInfo );

                returnSection += _buildLine(oneItem,format,itemCnt++);
            });
            returnSection +=_fillBlankcell(format,itemCnt);

            returnSection = "<table class=\"bx-info-table xtnAtrbtNm-table\">" + returnSection + "</table>";

            return _buildSection(returnSection);
        }

        function _xtnNumberType(data){

            return ( "<td>"
            + " <input type=\"number\" name=\""+data.xtnAtrbtNm+"\" value=\"\" maxlength=\""+data.len+"\" class=\"bx-form-item bx-component-small arrXtnAtrbt\" style=\"text-align: left;\"/>"
            + "</td>" )
        }

        function _xtnDateType(data){
            return ( "	<td>"
            + "<span class=\""+data.xtnAtrbtNm+"-date-wrap arrXtnAtrbt\"></span>"
            + "</td>" )
        }

        function _xtnPasswordType (data) {
            return ( "	<td>"
            + "	<input type=\"password\" name=\""+data.xtnAtrbtNm+"\" maxlength=\""+data.len+"\" value=\"\" class=\"bx-form-item bx-component-small arrXtnAtrbt\" style=\"text-align: left;\"/>"
            + "</td>" )
        }

        function _xtnBooleanType(xtnInfo){
            return ( "	<td>"
                    + "<div><input type=\"checkbox\" name=\""+xtnInfo.xtnAtrbtNm+"\" maxlength=\""+xtnInfo.len+"\" value=\"\" class=\"arrXtnAtrbt\"/ data-form-param=\""+xtnInfo.xtnAtrbtNm+"\"  onchange=\"fn_checkBoxValueChange(this);\"/></div>"
                    + "</td>" )
        }

        function _xtnDefaultType (data) {
            return ( "	<td>"
            + "	<input type=\"text\" name=\""+data.xtnAtrbtNm+"\" maxlength=\""+data.len+"\" value=\"\" class=\"bx-form-item bx-component-small arrXtnAtrbt\" style=\"text-align: left;\"/>"
            + "</td>" )
        }

        function _xtnCommon (data) {
            return ( "	<td hidden=\"true\">"
            + "	<input class =\"arrXtnAtrbtType\" value=\""+data.atrbtTpCd+"\" ></input>"
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

            $(relList).each(function (idx, data) {
                oneItem =_relCommon(itemCnt,data,format);
                if (!fn_isEmpty(oneItem))
                    returnSection += _buildLine(oneItem,format,itemCnt++);
            })

            returnSection +=_fillBlankcell(format,itemCnt);
            returnSection = "<table class=\"bx-info-table relAtrbtNm-table\" >" + returnSection + "</table>";

            return _buildSection(returnSection);

        }

        function _relCommon(itemCnt,data,format) {
            var returnString = "";

            if(format.arrRelRelShow != undefined && format.arrRelRelShow == true){
                if(data.arrRelKndCd == "02") {
                    returnString = _generateRelDetail(data);
                }
            }else{
                   returnString = _generateRelDetail(data);
            }

            return returnString;
        }


        function _generateRelDetail(data){

             var returnString = "";
             returnString += "<th data-tooltip=\""+data.arrRelNm+"\" style=\"text-align: right;\"><i class=\"fa fa-check fa-lg require-check-icon\"></i>"+data.arrRelNm+"</th>";
             returnString += "<td>";
             returnString += "	<input type=\"text\" class=\"bx-form-item bx-component-small relObjname\" maxlength=\"18\" style=\"text-align: left;\" readonly = \"readonly\"/>";

             // 계좌조회
             if(data.arrRelKndCd == "02"){
             returnString += "	<button class=\"bx-icon bx-icon-medium bx-icon-search \" id=\"arrRel"+data.arrRelKndCd+data.arrRelCd+"\" maxlength=\"18\" style=\"text-align: right;\"></button>"
             }else{
             returnString += "	<button class=\"bx-icon bx-icon-medium bx-icon-search \" id=\"arrRel"+data.arrRelKndCd+"\" maxlength=\"18\" style=\"text-align: right;\"></button>"
             }

             returnString += "</td>";
             returnString += "<td hidden=\"true\"><input class=\"relObjId\"     type=\"text\"                                 /></td>";
             returnString += "<td hidden=\"true\"><input class=\"arrRelKndCd\"  type=\"text\" value=\""+data.arrRelKndCd +"\" /></td>";
             returnString += "<td hidden=\"true\"><input class=\"arrRelCd\"     type=\"text\" value=\""+data.arrRelCd    +"\" /></td>";
             return returnString;

        }

        function _generateChild(children,format) {

            var returnSection = "";
            if (children == null || children.length < 1) return returnSection;
            var itemCnt = 0;
            var oneItem;

            $(children).each(function (idx, childData) {

                oneItem = _setChildHead(childData,format);
                oneItem += _generateCnd(childData.arrStrctrCndList,format);
                oneItem += _generateXtn(childData.arrStrctrXtnList,format);
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

        function _generatePopupListener (thatDiv)  {
            $(thatDiv).find('#arrRel01').click(function(){
                var param = {};
                var that = this;
                param.type = "03";
                var popupCustId = new PopupCustId(param); // 팝업생성
                popupCustId.render();
                popupCustId.on('popUpSetData', function(param) {
                    $(that).parent().children().filter('.relObjname').val(param.custNm);
                    $(that).parent().next().find('.relObjId').val(param.custId);
                    $('#custIdVal').val(param.custId);
                });
            });


            $(thatDiv).find('#arrRel02001').click(function(e){
                var param = {};
                var that = this;

                var custId = "";
                var mainDiv = $(thatDiv).find(".arrMain");

                $(mainDiv).find(".arrRelKndCd").each(function(idx, eachObject) {
                    if($(this).val() == "01" && $(this).parent().next().find(".arrRelCd").val() == "01") {
                        custId = $(this).parent().prev().find(".relObjId").val();
                        return false;
                    }
                });

                if(!fn_isEmpty(custId)){
                    param.custId = custId;
                }else{
                    param.custId = $('#custIdVal').val();
                }

                if (!fn_isEmpty($('#bizDscd').val()))
                    param.bizDscd = $('#bizDscd').val();
                if (!fn_isEmpty($('#pdTpCd').val()))
                    param.pdTpCd = $('#pdTpCd').val();
                if (!fn_isEmpty($('#pdTmpltCd').val()))
                    param.pdTmpltCd = $('#pdTmpltCd').val();
                var popupCustAcct = new PopupCustAcct(param); // 팝업생성
                popupCustAcct.render(param);
                popupCustAcct.on('popUpSetData', function(param) {
                    $(that).parent().children().filter('.relObjname').val(param.acctNbr);
                    $(that).parent().next().find('.relObjId').val(param.acctNbr);
                });
            });

            $(thatDiv).find('#arrRel02011').click(function(e){
                var param = {};
                var that = this;
                param.custId = $('#custIdVal').val();
                param.bizDscd = "01"; // 수신
                param.pdTpCd = "10"; // 요구불
                param.pdTmpltCd = "001"; // 요구불
                var popupCustAcct = new PopupCustAcct(param); // 팝업생성
                popupCustAcct.render(param);
                popupCustAcct.on('popUpSetData', function(param) {
                    $(that).parent().children().filter('.relObjname').val(param.acctNbr);
                    $(that).parent().next().find('.relObjId').val(param.acctNbr);
                });
            });

            $(thatDiv).find('#arrRel02012').click(function(){
                var param = {};
                var that = this;
                param.custId = $('#custIdVal').val();
                param.bizDscd = "01"; // 수신
                param.pdTpCd = "10"; // 요구불
                param.pdTmpltCd = "001"; // 요구불
                var popupCustAcct = new PopupCustAcct(param); // 팝업생성
                popupCustAcct.render(param);
                popupCustAcct.on('popUpSetData', function(param) {
                    $(that).parent().children().filter('.relObjname').val(param.acctNbr);
                    $(that).parent().next().find('.relObjId').val(param.acctNbr);
                });
            });

            $(thatDiv).find('#arrRel02013').click(function(){
                var param = {};
                var that = this;
                param.custId = $('#custIdVal').val();
                param.bizDscd = "01"; // 수신
                param.pdTpCd = "10"; // 요구불
                param.pdTmpltCd = "001"; // 요구불
                var popupCustAcct = new PopupCustAcct(param); // 팝업생성
                popupCustAcct.render(param);
                popupCustAcct.on('popUpSetData', function(param) {
                    $(that).parent().children().filter('.relObjname').val(param.acctNbr);
                    $(that).parent().next().find('.relObjId').val(param.acctNbr);
                });
            });

            $(thatDiv).find('#arrRel02016').click(function(){
                var param = {};
                var that = this;
                param.custId = $('#custIdVal').val();
                var popupUseAgrmnt = new PopupUseAgrmnt(param); // 팝업생성
                popupUseAgrmnt.render(param);
                popupUseAgrmnt.on('popUpSetData', function(param) {
                    $(that).parent().children().filter('.relObjname').val(param.arrId);
                    $(that).parent().next().find('.relObjId').val(param.arrId);
                });
            });

            $(thatDiv).find('#arrRel03').click(function(){
                var param = {};
                var that = this;
                var popupStaffId = new PopupStaffId(param); // 팝업생성
                popupStaffId.render();
                popupStaffId.on('popUpSetData', function(param) {
                    $(that).parent().children().filter('.relObjname').val(param.nm);
                    $(that).parent().next().find('.relObjId').val(param.staffId);
                });
            });

            $(thatDiv).find('#arrRel04').click(function(){
                var param = {};
                var that = this;

                var popupDeptCd = new PopupDeptCd(param); // 팝업생성
                popupDeptCd.render();
                popupDeptCd.on('popUpSetData', function(param) {
                    $(that).parent().children().filter('.relObjname').val(param.brnchNm);
                    $(that).parent().next().find('.relObjId').val(param.brnchCd);
                });
            });

            $(thatDiv).find('#arrRel02007').click(function() {
                // 스윙계좌
                var param = {};
                var that = this;

                var custId = "";
                var mainDiv = $(thatDiv).find(".arrMain");

                $(mainDiv).find(".arrRelKndCd").each(function(idx, eachObject) {
                    if($(this).val() == "01" && $(this).parent().next().find(".arrRelCd").val() == "01") {
                        custId = $(this).parent().prev().find(".relObjId").val();
                        return false;
                    }
                });

                param.custId = custId;
                param.bizDscd = "01";
                var popupCustAcct = new PopupCustAcct(param); // 팝업생성
                popupCustAcct.render(param);
                popupCustAcct.on('popUpSetData', function(param) {
                    $(that).parent().children().filter('.relObjname').val(param.acctNbr);
                    $(that).parent().next().find('.relObjId').val(param.acctNbr);
                });
            });

        };

    } , // end of define function

    fn_getArrInputGenerate = function (thatDiv) {

        var returnObject = {};
        var main = {};
        var mainDiv = $(thatDiv).find(".arrMain")
        var childrenDiv = $(thatDiv).find(".arrChildren")

        main.cndList = _getInputCndData(mainDiv); //조건리스트
        main.xtnList = _getInputXtnData(mainDiv); //확장값리스트
        main.relList = _getInputRelData(mainDiv); //관계값리스트
        main.pdCd = $(mainDiv).attr("name");      //상품코드

        returnObject.main     = main;
        returnObject.children = _getInputChildrenData(childrenDiv);

        return returnObject;

        function _getInputCndData (thatDiv){

            var inputCndData = [];

            $(thatDiv).find(".arrCndCd").each(function(idx, data) {
                var inputParam = {};
                inputParam.cndCd = $(this).val();

                if($(this).parent().next().find(".arrCndVal").attr("id") == "amount"){
                inputParam.txtCndVal = fn_removeComma($(this).parent().next().find(".arrCndVal").val());
                }else{
                inputParam.txtCndVal = $(this).parent().next().find(".arrCndVal").val();
                }

                inputParam.msurUnitCd  = $(this).parent().parent().find(".msurUnitCd").val();
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

    }

);  // end of define