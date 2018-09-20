/**
 * Created by parkbeomsoo on 2016. 5. 31..
 */



const angular = require('angular');

const md = require('./common.module');

md.service('$commonUiGenerator', __service);

function __service($commonService, $commonModal, $timeout){
    return {
        /* ======================================================================== */
        /* Generate Condition UI By Using Response Data							    */
        /* ======================================================================== */
        fn_generateUIWithData : function(data, format, thatDiv) {
        	var that = this;
            var displayData = data.ArrOpnScrnOut;

            var mainDiv = $(document.createElement('div')).addClass("arrMain").attr("name", displayData.pdCd);

            that._generateRel(displayData.arrStrctrRelList,format,mainDiv);
            that._generateCnd(displayData.arrStrctrCndList,format,mainDiv);
            that._generateXtn(displayData.arrStrctrXtnList,format,mainDiv);
            that._generatePdDoc(displayData.arrStrctrPdDocList,format,mainDiv);

            var childDiv = $(document.createElement('div')).addClass("arrChildren");

            that._generateChild(displayData.children,format,childDiv);

            $(thatDiv).append(mainDiv).append(childDiv);

            that._generatePopupListener(thatDiv);

            if (format.relSectionHidden != undefined && format.relSectionHidden == true) {
                $(thatDiv).find(".relAtrbtNm-table").hide();
            }
            if (format.xtnSectionHidden != undefined && format.xtnSectionHidden == true) {
                $(thatDiv).find(".xtnAtrbtNm-table").hide();
            }
            if (format.cndSectionHidden != undefined && format.cndSectionHidden == true) {
                $(thatDiv).find(".cndAtrbtNm-table").hide();
            }
            
            return thatDiv;
        },

        _generateCnd : function(cndList,format,parent) {
        	if (cndList == null || cndList.length < 1) {
        		return ;
        	}
        	
        	var that = this;
            var itemCnt = 0;

            var elTable = $(document.createElement('table'));
            elTable.addClass("w-100");
            elTable.addClass("cndAtrbtNm-table");
            elTable.attr("id", "cnd-table");
            
            var elTr;
            $(cndList).each(function (idx, data) {
            	elTr = that._buildLine(elTable, format, itemCnt++);
                that._cndCommon(data,format,elTr);
                switch (data.cndTpCd) {
                    case "01":
                        that._cndListType(data,format,elTr);
                        break;
                    default :
                        that._cndOtherType(data,format,elTr);
                }
            });

            that._fillBlankcell(format,itemCnt,elTr);
            
            parent.append(that._buildSection(elTable));
        },

        _setCndLabel : function(data,format,parent) {
        	var that = this;
            var label = data.cndNm;

            if (data.mndtryNegtnCndYn == "Y") {
                parent.addClass("asterisk");
            }
            
            var pdCndVal = {};
            if (!$commonService.fn_isEmpty(data.pdCndVal)) {
                var pdCndVal = JSON.parse(data.pdCndVal);
            }
            
            if (data.pdCndVal.indexOf('msurUnitNm') != -1) {
                label = label + " [" + pdCndVal.msurUnitNm + "]";

                var elTh = $(document.createElement('th'));
                elTh.attr("hidden", true);
                
                var elInput = $(document.createElement('input'));
                elInput.addClass("msurUnitCd");
                elInput.attr("type", "text");
                elInput.val(pdCndVal.msurUnitCd);
                
                elTh.html(elInput);
                parent.append(elTh);
            }

            if (data.pdCndVal.indexOf('crncyCd') != -1) {
                label = label + " [" + pdCndVal.crncyCd + "]";
                
                var elTh = $(document.createElement('th'));
                elTh.attr("hidden", true);
                
                var elInput = $(document.createElement('input'));
                elInput.attr("type", "text");
                elInput.val(pdCndVal.crncyCd);
                
                elTh.html(elInput);
                parent.append(elTh);
            }

            var elLabel = $(document.createElement('label'));
            elLabel.addClass("bw-label");
//            elLabel.attr("data-tooltip", label);
            elLabel.attr("title", label);
            //elLabel.attr("data-i18n", "{%=%}");
            elLabel.text(label);
            
            parent.append(elLabel);
        },

        _cndListType : function(data,format,parent) {
        	var that = this;
            var pdCndVal = {};

            if (!$commonService.fn_isEmpty(data.pdCndVal)) {
                pdCndVal = JSON.parse(data.pdCndVal);
            }

            var basicVal = "";

            if (pdCndVal.bsicListCd != undefined && format.setDefault != undefined && format.setDefault == true ) {
            	basicVal = pdCndVal.bsicListCd;   // FIXME KisuKim
            }

           	// td > div > label, select
            var elDiv = $(document.createElement('div'));
            elDiv.addClass("input-wrap fix-label clr");
            elDiv.addClass(data.cndCd + "-wrap");

            if(data.dpndntCndYn == "Y"){
                elDiv.addClass("upperCnd");
            }

            that._setCndLabel(data,format,elDiv);
            
            var elSelect = $(document.createElement('select'));
            elSelect.addClass("bw-input");
            elSelect.addClass("ipt-select");
            elSelect.addClass("arrCndVal");
            elSelect.attr("data-form-param", data.cndCd);

            if (data.mndtryNegtnCndYn == "Y" && pdCndVal.listCdList.length == 1) {
            	elSelect.attr("disabled", true);
            }

            if (data.mndtryNegtnCndYn != "Y"){
            	var elOption = $(document.createElement('option'));
            	elOption.val('');
            	elOption.text($commonService.makeBxI18n().getValue('{%=cbb_items.SCRNITM#check%}'));
            	elSelect.append(elOption);
            }
            
            $(pdCndVal.listCdList).each(function (idx, listItem) {
                var elOption = $(document.createElement('option'));
                elOption.val(listItem.listCd);
                // 통화코드는 코드이름이 아닌 코드로 화면에출력
                elOption.text(data.cndCd == "L0149"? listItem.listCd : listItem.listCdNm);

                elSelect.append(elOption);
            });

           	elSelect.find('option[value="' + basicVal + '"]').attr("selected", true);

           	// td > div > label, select
            elDiv.append(elSelect);

            var elTd = $(document.createElement('td'));
            elTd.addClass("td-w-33");
           	
           	elTd.html(elDiv);

           	parent.append(elTd);
        },

        _cndOtherType : function (data,format,parent){
        	var that = this;
            var pdCndVal = {};
            var basicVal = "";
            var disabled = false;

            if (!$commonService.fn_isEmpty(data.pdCndVal)) {
                pdCndVal = JSON.parse(data.pdCndVal);
            }

            if (data.mndtryNegtnCndYn == "Y") {
            	if(data.cndTpCd == "03"){
            		if(data.pdCndVal != undefined && pdCndVal.minIntRt == undefined && pdCndVal.maxIntRt == undefined){
            			disabled = true;
            			basicVal = pdCndVal.bsicIntRt;
            		}
            	}else{
            		if (data.pdCndVal != undefined && pdCndVal.minVal != undefined && pdCndVal.maxVal != undefined && pdCndVal.bsicVal != undefined &&
            				pdCndVal.minVal == pdCndVal.maxVal && pdCndVal.minVal == pdCndVal.bsicVal) {
            			disabled = true;
            			basicVal = pdCndVal.bsicVal;
            		}
            	}
            }

            if (data.pdCndVal != undefined && pdCndVal.bsicVal != undefined && format.setDefault != undefined && format.setDefault == true) {
            	basicVal = pdCndVal.bsicVal;
            }
            // 계약생성시 설정한 조건 value가 있는 경우
            if (data.arrCndVal != undefined && data.arrCndVal != null) {
            	basicVal = data.arrCndVal;
            }

           	// td > div > label, input
            var elDiv = $(document.createElement('div'));
            elDiv.addClass("input-wrap fix-label clr");
            elDiv.addClass(data.cndCd + "-wrap");

            that._setCndLabel(data,format,elDiv);

            var elInput = $(document.createElement('input'));
            elInput.addClass("bw-input arrCndVal");
            elInput.attr("type", "text");
            elInput.attr("data-form-param", data.cndCd);
            elInput.attr("style", "text-align: right");
            elDiv.attr("title", data.pdCndValAsRdblFormCntnt);
            
            if (disabled) {
                elInput.attr("disabled", true);
            }
            
            // 범위형 조건인 경우
            if (data.cndTpCd == "02" && data.pdCndValAsRdblFormCntnt != null){
            	
            	// 조건값 측정단위
            	var msurUnitCd = JSON.parse(data.pdCndVal).msurUnitCd;
            	
            	// 금액
            	if(msurUnitCd === undefined){
            		
            		// 조건 기본값에 따라 소수점 처리
            		var decimalLength = 0;
                	var dotSplitedVal = basicVal.split(".");
                	var decimalFormat = "#,###";
                	if (dotSplitedVal[1] > 0) {
                		decimalLength = dotSplitedVal[1].length;
                		decimalFormat = "#,###." + dotSplitedVal[1];
                	}
                	
                    // 금액 comma 처리
                    if (basicVal != "") {
                    	basicVal = Ext.util.Format.number(parseInt(basicVal), decimalFormat);
                    }
                    
                    // 조건 증가값에 따라 소수점처리
                    var incrsVal = JSON.parse(data.pdCndVal).incrsVal;
                    var dotSplitedIncrsVal = incrsVal.split(".");
                    if (dotSplitedIncrsVal[1] > 0) {
                    	decimalLength = Math.max(decimalLength, dotSplitedIncrsVal[1].length);
                    }
                    
                    elInput.addClass("ng-pristine ng-valid a-right ng-empty ng-touched");
                    elInput.attr("common-numeric-only-directive", "");
                    elInput.attr("id", "amount");
                    elInput.attr("dec", decimalLength);                            		

                // 백분율
            	} else if(msurUnitCd == "11" || msurUnitCd == "12"){
            		
            		// 조건 기본값에 따라 소수점 처리
            		var decimalLength = 0;
                	var dotSplitedVal = basicVal.split(".");
                	if (dotSplitedVal[1] > 0) {
                		decimalLength = dotSplitedVal[1].length;
                	}
                	
            		// 조건 증가값에 따라 소수점처리
                    var incrsVal = JSON.parse(data.pdCndVal).incrsVal;
                    var dotSplitedIncrsVal = incrsVal.split(".");
                    if (dotSplitedIncrsVal[1] > 0) {
                    	decimalLength = Math.max(decimalLength, dotSplitedIncrsVal[1].length);
                    }
                    
                    elInput.addClass("ng-pristine ng-valid a-right ng-empty ng-touched");
                    elInput.attr("common-string-number-only-directive", "");
                    elInput.attr("id", "percent");
                    elInput.attr("dec", decimalLength);
                    
            	// 기간
            	} else {
            		// 기간 소수점 제거 처리
                    if (!$commonService.fn_isEmpty(basicVal)) {
                    	basicVal = parseInt(basicVal);
                    }
                    elInput.attr("common-string-number-only-directive", "");
                    elInput.attr("id", "term");
                    
                }
            	elInput.attr("ng-model", data.cndCd);
                elInput.attr("ng-init", elInput.attr("ng-model")+ "='" +basicVal+ "'");
            
                
            // 금리형 조건인 경우
        	} else if (data.cndTpCd == "03" && data.pdCndValAsRdblFormCntnt != null){
            	
            	var basicVal = JSON.parse(data.pdCndVal).bsicIntRtIntRt;
            	if (basicVal == null){
            		basicVal = "";
            	}
            	                
                elInput.addClass("ng-pristine ng-valid a-right ng-empty ng-touched");
                elInput.attr("common-string-number-only-directive", "");
                elInput.attr("id", "interest");
                elInput.attr("dec", 0);
                elInput.attr("ng-model", data.cndCd);
                elInput.attr("ng-init", elInput.attr("ng-model")+ "='" +basicVal+ "'");
            
                
            // 수수료형 조건인 경우
            } else if (data.cndTpCd == "04" && data.pdCndValAsRdblFormCntnt != null){
            	
            	var basicVal = JSON.parse(data.pdCndVal).bsicRt;
            	if (basicVal == null){
            		basicVal = "";
            	}
            	
                elInput.addClass("ng-pristine ng-valid a-right ng-empty ng-touched");
                elInput.attr("common-string-number-only-directive", "");
                elInput.attr("id", "fee");
                elInput.attr("dec", 0);
                elInput.attr("ng-model", data.cndCd);
                elInput.attr("ng-init", elInput.attr("ng-model")+ "='" +basicVal+ "'");
                
            }           
            elInput.val(basicVal);

            elDiv.append(elInput);

            var elTd = $(document.createElement('td'));
//            elTd.attr("data-tooltip", data.pdCndValAsRdblFormCntnt);
            
            
            elTd.addClass("td-w-33");
            
            elTd.append(elDiv);
            
            parent.append(elTd);
            
        },

        _cndCommon : function(data,format,parent) {
            var returnString = "";

            var elTd = $(document.createElement('td'));
            elTd.attr("hidden", "true");

            var elInput = $(document.createElement('input'));
            elInput.addClass("arrCndCd");
            elInput.attr("type", "text");
            elInput.val(data.cndCd);

            elTd.html(elInput);
            parent.append(elTd);

            //4.<td> area readableForm
            if (format.readableFormYn == "Y") {
                elTd = $(document.createElement('td'));
                elTd.attr("id", "readableForm");
                elTd.attr("colspan", "4");

                var elP = $(document.createElement('p'));
                elP.attr("id", "readableForm");
                elP.attr("style", "text-align: left;");
                elP.text(data.pdCndValAsRdblFormCntnt);
                
                elTd.html(elP);
                parent.append(elTd);
            }
        },

        // Generate Product Document List
        _generatePdDoc : function(arrStrctrPdDocList, format, parent) {
//        	if(format.docSectionHidden != undefined && format.docSectionHidden == true) {
//        		return null;
//        	}
//        	
//        	if (arrStrctrPdDocList == null || arrStrctrPdDocList.length < 1) {
//        		return null;
//        	}
//        	
//        	var that = this;
//            var arrPdDocSize = arrStrctrPdDocList.length;
//
//            var elTable = $(document.createElement('table'));
//            elTable.addClass("w-100");
//            elTable.attr("id", "pdDoc-table");
//
//            $(arrStrctrPdDocList).each(function (idx, pdDocInfo) {
//                if(idx == 0){
//                	returnSection += that._buildFirstLinePdDocList(pdDocInfo, arrPdDocSize, format, elTable)
//                }else{
//                	returnSection += that._pdDocCommon(pdDocInfo,format,elTable);
//                }
//            });
//
//            parent.append(that._buildSection(elTable));
        	
        	var that = this;
            var returnSection = "";

            if(format.docSectionHidden != undefined && format.docSectionHidden == true)
                return returnSection;

            if (arrStrctrPdDocList == null || arrStrctrPdDocList.length < 1) return returnSection;

            var arrPdDocSize = arrStrctrPdDocList.length;

            $(arrStrctrPdDocList).each(function (idx, pdDocInfo) {

                if(idx == 0){
                returnSection += that._buildFirstLinePdDocList(pdDocInfo, arrPdDocSize, format);
                }else{
                returnSection += that._pdDocCommon(pdDocInfo,format);
                }
            })

            returnSection = "<table class=\"bx-info-table\" id=\"pdDoc-table\">"  + returnSection + "</table>";

            return that._buildSection(returnSection);
        	
        },

//        _buildFirstLinePdDocList : function(pdDocInfo, arrPdDocSize,format,parent) {
    	_buildFirstLinePdDocList : function(pdDocInfo, arrPdDocSize,format) {
            var returnString = "";
            var clickYn = false;
/*
            var elTr = $(document.createElement('tr'));
            
            var elTh = $(document.createElement('th'));
            elTh.addClass("asterisk");
            elTh.attr("rowspan", arrPdDocSize);
            elTh.attr("data-i18n", "{%=cbb_items.AT#termsAgrmntList%}");
//            elTh.html(bxMsg('cbb_items.AT#termsAgrmntList'));
//            elTh.html(bxMsg('cbb_items.AT#termsAgrmntList'));
            elTr.append(elTh);
            
            var elTd = $(document.createElement('td'));
            elTd.addClass("arrPdDocVal");
            elTd.attr("tooltip", pdDocInfo.docNm);
            elTd.html(pdDocInfo.docNm);

            elTr.append(elTd);

            var elInput = $(document.createElement('input'));
            elInput.addClass("arrPdDocVal");
            elInput.attr("type", "text");
            elInput.attr("tooltip", "arrPdDocId");
            elInput.attr("hidden", true);
            elInput.val(pdDocInfo.docId);

            var elTd = $(document.createElement('td'));
            elTd.html(elInput);
            
            var elButton = $(document.createElement('button'));
            elButton.addClass("termsAgrmntView");
            elButton.attr("clicked", clickYn);
//            elButton.text(bxMsg('cbb_items.SCRNITM#termsAgrmntView'));
            elButton.attr("data-i18n", "{%=cbb_items.AT#termsAgrmntView%}");
            
            elTd.append(elButton);

            elTr.append(elTd);

            var elTd = $(document.createElement('td'));
            elTd.attr("colspan", (format.colCount * 2 - 3));
            
            elTr.append(elTd);
            
            parent.append(elTr);
            */
            returnString += "<tr>"
            returnString += "<th rowspan=\""+arrPdDocSize+"\"><i class=\"fa fa-check fa-lg require-check-icon\"></i>"
//            returnString +=  bxMsg('cbb_items.AT#termsAgrmntList');
            returnString +=  "<label class=\"bw-label\" data-i18n=\"{%=cbb_items.AT#acctNbr%}\"></label>";
            returnString += "</th>";
//            returnString += "<td style=\"text-align: left;\" data-tooltip=\""+pdDocInfo.docNm+"\" class=\"arrPdDocVal\ style=\"text-align: right;\">" + pdDocInfo.docNm + "</td>";
            returnString += "<td style=\"text-align: left;\" title=\""+pdDocInfo.docNm+"\" class=\"arrPdDocVal\ style=\"text-align: right;\">" + pdDocInfo.docNm + "</td>";
            returnString += "<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            returnString += "<input type=\"text\" data-form-param=\"arrPdDocId\" value=\""+pdDocInfo.docId+"\"  hidden>";
            returnString += "<button class=\"bx-btn bx-btn-small termsAgrmntView\" clicked = \""+clickYn+"\" onclick=\"fn_clickTermsAgrmntView(this);\">";
//            returnString +=  bxMsg('cbb_items.SCRNITM#termsAgrmntView');
//            returnString +=  "data-i18n=\"{%=cbb_items.SCRNITM#termsAgrmntView%}\"";
            returnString +=  "<span data-i18n=\"{%=cbb_items.SCRNITM#termsAgrmntView%}\"/>";
            returnString += "</button>"
            returnString += "</td><td colspan=\""+ (format.colCount * 2 - 3) +"\"/>";
            returnString += "</tr>"
            	
        	return returnString;
        },


        _pdDocCommon : function(pdDocInfo,format,parent) {
            var returnString = "";
            var clickYn = false;

            returnString += "<tr>"
//            returnString += "<td style=\"text-align: left;\" data-tooltip=\""+pdDocInfo.docNm+"\" class=\"arrPdDocVal\ style=\"text-align: right;\">" + pdDocInfo.docNm + "</td>";
            returnString += "<td style=\"text-align: left;\" title=\""+pdDocInfo.docNm+"\" class=\"arrPdDocVal\ style=\"text-align: right;\">" + pdDocInfo.docNm + "</td>";
            returnString += "<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            returnString += "<input type=\"text\" data-form-param=\"arrPdDocId\" value=\""+pdDocInfo.docId+"\"  hidden>";
            returnString += "<button class=\"bx-btn bx-btn-small termsAgrmntView\" clicked = \""+clickYn+"\" onclick=\"fn_clickTermsAgrmntView(this);\">";
//            returnString +=  bxMsg('cbb_items.SCRNITM#termsAgrmntView');
            returnString +=  "data-i18n=\"{%=cbb_items.SCRNITM#termsAgrmntView%}\"";
            returnString += "</button>";
            returnString += "</td><td colspan=\""+ (format.colCount * 2 - 3) +"\"/>";
            returnString += "</tr>";
            
            return returnString; 
//            parent.append(returnString);
        },

        _generateXtn : function(xtnList,format,parent) {
        	if (xtnList == null || xtnList.length < 1) {
        		return ;
        	}

        	var that = this;
            var itemCnt = 0;

            //@@@@@@
            var dateList = [];
            
            var elTable = $(document.createElement('table'));
            elTable.addClass("w-100");
            elTable.addClass("xtnAtrbtNm-table");
            
            // table tr td div label input
            var elTr;
            $(xtnList).each(function (idx, xtnInfo) {
            	elTr = that._buildLine(elTable,format,itemCnt++);

                var elLabel = $(document.createElement('label'));
                elLabel.addClass("bw-label");
//                elLabel.attr("data-tooltip", xtnInfo.lblNm);
                //elLabel.attr("data-i18n", "{%=%}");
                elLabel.text(xtnInfo.lblNm);

                var elDiv = $(document.createElement('div'));
                elDiv.addClass("input-wrap fix-label asterisk clr");
                elDiv.attr("title", xtnInfo.lblNm);
                elDiv.html(elLabel);
                
                switch (xtnInfo.atrbtTpCd) {
                    case "NU":
                        that._xtnNumberType(xtnInfo,elDiv);
                        break;
                    case "TD":
                    	//@@@@@@
                    	dateList.push({xtnAtrbtNm : xtnInfo.xtnAtrbtNm});
                        that._xtnDateType(xtnInfo,elDiv);
                        break;
                    case "PW":
                        that._xtnPasswordType(xtnInfo,elDiv);
                        break;
                    case "YN":
                        that._xtnBooleanType(xtnInfo,elDiv);
                        break;
                    default :
                        that._xtnDefaultType(xtnInfo,elDiv);
                }
                that._xtnCommon(xtnInfo,elDiv);
                
                var elTd = $(document.createElement('td'));
                elTd.addClass("td-w-33");
                elTd.html(elDiv);
                
                elTr.append(elTd);
            });
            
            that._fillBlankcell(format,itemCnt,elTr);

            parent.append(that._buildSection(elTable));
            
          //@@@@@@
//            $timeout(function() {
//            	if(dateList != null && dateList.length > 0) {
//                	$(dateList).each(function(idx2, data2) {
//                		$commonService.fn_makeDatePicker("#"+data2.xtnAtrbtNm, '', null, function(date) {});
//                	});
//                }
//            }, 100);
        },

        _xtnNumberType : function(data,parent){
            var elInput = $(document.createElement('input'));
            elInput.addClass("bw-input arrXtnAtrbt");
            elInput.attr("data-form-param", data.xtnAtrbtNm);
            elInput.attr("type", "number");
            elInput.attr("name", data.xtnAtrbtNm);
            elInput.attr("maxlength", data.len);

            parent.append(elInput);
        },

        _xtnDateType : function(data,parent){
        	//@@@@@@
            var elDiv = $(document.createElement('div'));
            elDiv.addClass("datePicker arrXtnAtrbt");
            elDiv.attr("data-form-param", data.xtnAtrbtNm);
            elDiv.attr("id", data.xtnAtrbtNm);
            elDiv.attr("name", data.xtnAtrbtNm);
            parent.append(elDiv);
        },

        _xtnPasswordType  : function(data,parent) {
            var elInput = $(document.createElement('input'));
            elInput.addClass("bw-input arrXtnAtrbt");
            elInput.attr("type", "password");
            elInput.attr("name", data.xtnAtrbtNm);
            elInput.attr("maxlength", data.len);

            parent.append(elInput);
        },

        _xtnBooleanType : function(data,parent){
            var elSelect = $(document.createElement('select'));
            elSelect.addClass("bw-input arrXtnAtrbt ipt-select");
            elSelect.attr("data-form-param", data.xtnAtrbtNm);
            elSelect.attr("name", data.xtnAtrbtNm);

            var elOption = $(document.createElement('option'));
            elOption.val('Y');
            elOption.text('Y');
            elSelect.append(elOption);

            elOption = $(document.createElement('option'));
            elOption.val('N');
            elOption.text('N');
            elSelect.append(elOption);

            //var elInput = $(document.createElement('input'));
            //elInput.addClass("bw-input ipt-radio f-l arrXtnAtrbt");
            //elInput.attr("type", "checkbox");
            //elInput.attr("name", data.xtnAtrbtNm);
            //elInput.attr("maxlength", data.len);
            //elInput.attr("data-form-param", data.xtnAtrbtNm);
            //elInput.on("change", fn_checkBoxValueChange(this));

            //parent.removeClass("input-wrap fix-label");
            //parent.addClass("add-mg-l-10");
            //parent.find('label').addClass("f-l add-mg-t-5 add-font-style").before(elInput);
            parent.append(elSelect);
        },

        _xtnDefaultType  : function(data,parent) {
            var elInput = $(document.createElement('input'));
            elInput.addClass("bw-input arrXtnAtrbt");
            elInput.attr("type", "text");
            elInput.attr("name", data.xtnAtrbtNm);
            elInput.attr("maxlength", data.len);

            parent.append(elInput);
        },

        _xtnCommon  : function(data,parent) {
            var elInput = $(document.createElement('input'));
            elInput.addClass("bw-input arrXtnAtrbtType");
            elInput.attr("type", "hidden");
            elInput.val(data.atrbtTpCd);

            parent.append(elInput);
        },

        _buildLine : function(parent,format,itemCnt) {
            if (itemCnt % format.colCount == 0) {
                var elTr = $(document.createElement('tr'));
                parent.append(elTr);
            }
        	return parent.find("tr:last");
        },

        _fillBlankcell : function(format,itemCnt,parent) {
            if (itemCnt % format.colCount == 0) return;

            var loopCnd = format.colCount - itemCnt % format.colCount;

            for(var i = 0; i < loopCnd; i++){
            	parent.append($(document.createElement('td')));
            }
        },

        _buildSection : function(child) {
        	var elSection = $(document.createElement('section'));
        	elSection.html(child);
            return elSection;
        },

        _generateRel  : function(relList,format,parent) {
        	if (relList == null || relList.length < 1) {
        		return ;
        	}
        	
        	var that = this;
            var itemCnt = 0;

            var elTable = $(document.createElement('table'));
            elTable.addClass("w-100");
            elTable.addClass("relAtrbtNm-table");

            var elTr;
            $(relList).each(function (idx, data) {
            	console.log('format.arrRelRelShow : '+format.arrRelRelShow);
            	/*
                if (format.arrRelRelShow != undefined && format.arrRelRelShow == true) {
                    if (data.arrRelKndCd == "02") {
                    	itemCnt++;
                    }
                } else {
                	itemCnt++;
                }
                */
            	elTr = that._buildLine(elTable,format,itemCnt);
                if (that._relCommon(data,format,elTr)) {
                	itemCnt++;
                };
            })

            that._fillBlankcell(format,itemCnt,elTr);

            parent.append(that._buildSection(elTable));
        },

        _relCommon : function(data,format,parent) {
        	var that = this;

            if (format.arrRelRelShow != undefined && format.arrRelRelShow == true) {
                if (data.arrRelKndCd == "02") {
                    that._generateRelDetail(data,parent);
                    return true;
                }
            } else {
                that._generateRelDetail(data,parent);
                return true;
            }
            
            return false;
        },


        _generateRelDetail : function(data,parent){
            var elDiv = $(document.createElement('div'));
            elDiv.addClass("input-wrap fix-label clr add-btn");

            if (data.mndtryYn == "Y") {
            	elDiv.addClass("asterisk");
            }

            var elLabel = $(document.createElement('label'));
            elLabel.addClass("bw-label");
//            elLabel.attr("data-tooltip", data.arrRelNm);
            //elLabel.attr("data-i18n", "{%=cbb_items.AT#"+ +"%}");
            elLabel.text(data.arrRelNm);

            elDiv.append(elLabel);
            elDiv.attr("title", data.arrRelNm);
            
            var elInput = $(document.createElement('input'));
            elInput.addClass("bw-input relObjname");
            elInput.attr("type", "text");
            elInput.attr("data-form-param", data.cndCd);
            elInput.attr("maxlength", "18");
            elInput.attr("readonly", true);

            elDiv.append(elInput);

            var elButton = $(document.createElement('button'));
            elButton.addClass("bw-btn fix-r");
            elButton.attr("type", "button");
            
			// 계좌조회
			if (data.arrRelKndCd == "02") {
	            elButton.attr("id", "arrRel"+data.arrRelKndCd+data.arrRelCd);
			}
			else if (data.arrRelKndCd == "04"){
				elButton.addClass("arrRel04");
	            elButton.attr("id", "arrRel"+data.arrRelKndCd);
			}
			else {
	            elButton.attr("id", "arrRel"+data.arrRelKndCd);
			}

			var elI = $(document.createElement('i')).addClass("bw-icon i-20 i-search");
			
			elButton.html(elI);

            elDiv.append(elButton);

            var elInput = $(document.createElement('input'));
            elInput.addClass("relObjId");
            elInput.attr("type", "hidden");
            elInput.val("")

            elDiv.append(elInput);

            var elInput = $(document.createElement('input'));
            elInput.addClass("arrRelKndCd");
            elInput.attr("type", "hidden");
            elInput.val(data.arrRelKndCd)

            elDiv.append(elInput);

            var elInput = $(document.createElement('input'));
            elInput.addClass("arrRelCd");
            elInput.attr("type", "hidden");
            elInput.val(data.arrRelCd)

            elDiv.append(elInput);
            
            var elTd = $(document.createElement('td'));
            elTd.addClass("td-w-33");
            elTd.append(elDiv);

            parent.append(elTd);
        },

        _generateChild : function(children,format,parent) {
        	if (children == null || children.length < 1) {
        		return null;
        	}
        	
        	var that = this;

            $(children).each(function (idx, childData) {
            	var elDiv = $(document.createElement('div'));
            	elDiv.addClass("arrChild");
            	
                that._setChildHead(childData,format,elDiv);
                that._generateCnd(childData.arrStrctrCndList,format,elDiv);
                that._generateXtn(childData.arrStrctrXtnList,format,elDiv);
                that._generateRel(childData.arrStrctrRelList,format,elDiv);
            });

            parent.append(that._buildSection(returnSection));
        },

        _setChildHead : function(data,format,parent) {
        	var elLabel = $(document.createElement('label'));
//        	elLabel.attr("data-tooltip", data.pdNm);
        	elLabel.text(data.pdNm);
        	
        	var elDiv = $(document.createElement('div'));
        	elDiv.html(elLabel);
        	elDiv.attr("title", data.pdNm);
        	
        	var elInput = $(document.createElement('input'));
        	elInput.addClass("childProductSelect");
        	elInput.attr("type", "checkbox");
        	elInput.attr("name", data.pdCd);
        	
        	if (data.mndtryYn == "Y" ) {
        		elInput.attr("checked", true).attr("disabled", true);
        	}

        	elDiv.append(elInput);
        	
        	var elTd = $(document.createElement('td'));
        	elTd.html(elDiv);

        	var elTr = $(document.createElement('tr'));
        	elTr.html(elTd);
        	
        	var elTd = $(document.createElement('td'));
        	elTd.attr("colspan", 2);
        	elTr.append(elTd);

        	var elTable = $(document.createElement('table'));
        	elTable.addClass("w-100");
        	elTable.html(elTr);

        	parent.append(elTable);
        },

        _generatePopupListener : function(thatDiv)  {
            $(thatDiv).find('#arrRel01').click(function(){
                var that = this;
        		var param = {};
        		var custId_PopInstance = $commonModal.showModal({
    				id : "SCU900",
    				name : "SCU900",
    				templateUrl : 'app/views/page/popup/SCU900/SCU900.tpl.html',
    				controller : 'views.page.popup.SCU900.SCU900.controller',
    				controllerAs : 'SCU900Ctrl',
    				param : param
    			});

    			custId_PopInstance.result.then (
        			function (selectedItem) {
                        $(that).parent().find('.relObjname').val(selectedItem.selectedData.custNm);
                        $(that).parent().find('.relObjId').val(selectedItem.selectedData.custId);
                        $("[data-form-param='custIdVal']").val(selectedItem.selectedData.custId);
        			},
        			function () {
        				//닫기시 callback 함수
        			}
            	);
            });

            $(thatDiv).find('#arrRel02001').click(function(e){
                var that = this;
                var param = {};
                var custId = "";

                var mainDiv = $(thatDiv).find(".arrMain");
                $(mainDiv).find(".arrRelKndCd").each(function(idx, eachObject) {
                    if($(this).val() == "01" && $(this).parent().find(".arrRelCd").val() == "01") {
                        custId = $(this).parent().find(".relObjId").val();
                        return false;
                    }
                });

                if (!$commonService.fn_isEmpty(custId)) {
                    param.custId = custId;
                } else {
                    param.custId = $("[data-form-param='custIdVal']").val();
                }

                param.bizDscd = '01';
            	param.changeableBizDscdYn = 'N';
            	param.pdTpCd = '10';
            	param.changeablePdTpCdYn = 'N';

        		var acctNbr_PopInstance = $commonModal.showModal({
    				id : "SAR900",
    				name : "SAR900",
    				templateUrl : 'app/views/page/popup/SAR900/SAR900.tpl.html',
    				controller : 'views.page.popup.SAR900.SAR900.controller',
    				controllerAs : 'SAR900Ctrl',
    				param : param
    			});

    			acctNbr_PopInstance.result.then (
        			function (selectedItem) {
                        $(that).parent().find('.relObjname').val(selectedItem.selectedData.acctNbr);
                        $(that).parent().find('.relObjId').val(selectedItem.selectedData.acctNbr);
        			},
        			function () {
        				//닫기시 callback 함수
        			}
            	);
            });

            $(thatDiv).find('#arrRel02011').click(function(e){
                var param = {};
                var that = this;
                param.custId = $("[data-form-param='custIdVal']").val();
            	param.bizDscd = '01';
            	param.changeableBizDscdYn = 'N';
            	param.pdTpCd = '10';
            	param.changeablePdTpCdYn = 'N';
                param.pdTmpltCd = "001"; // 요구불
                
        		var acctNbr_PopInstance = $commonModal.showModal({
    				id : "SAR900",
    				name : "SAR900",
    				templateUrl : 'app/views/page/popup/SAR900/SAR900.tpl.html',
    				controller : 'views.page.popup.SAR900.SAR900.controller',
    				controllerAs : 'SAR900Ctrl',
    				param : param
    			});

    			acctNbr_PopInstance.result.then (
        			function (selectedItem) {
                        $(that).parent().find('.relObjname').val(selectedItem.selectedData.acctNbr);
                        $(that).parent().find('.relObjId').val(selectedItem.selectedData.acctNbr);
        			},
        			function () {
        				//닫기시 callback 함수
        			}
            	);
            });

            $(thatDiv).find('#arrRel02012').click(function(){
                var param = {};
                var that = this;
                param.custId = $("[data-form-param='custIdVal']").val();
            	param.bizDscd = '01';
            	param.changeableBizDscdYn = 'N';
            	param.pdTpCd = '10';
            	param.changeablePdTpCdYn = 'N';
                param.pdTmpltCd = "001"; // 요구불

        		var acctNbr_PopInstance = $commonModal.showModal({
    				id : "SAR900",
    				name : "SAR900",
    				templateUrl : 'app/views/page/popup/SAR900/SAR900.tpl.html',
    				controller : 'views.page.popup.SAR900.SAR900.controller',
    				controllerAs : 'SAR900Ctrl',
    				param : param
    			});

    			acctNbr_PopInstance.result.then (
        			function (selectedItem) {
                        $(that).parent().find('.relObjname').val(selectedItem.selectedData.acctNbr);
                        $(that).parent().find('.relObjId').val(selectedItem.selectedData.acctNbr);
        			},
        			function () {
        				//닫기시 callback 함수
        			}
            	);
            });

            $(thatDiv).find('#arrRel02013').click(function(){
                var param = {};
                var that = this;
                param.custId = $("[data-form-param='custIdVal']").val();
                if (param.custId == null) {
                	param.custId = $("[data-form-param='custId']").val();
                }
            	param.bizDscd = '01';
            	param.changeableBizDscdYn = 'N';
            	param.pdTpCd = '10';
            	param.changeablePdTpCdYn = 'N';
                param.pdTmpltCd = "001"; // 요구불

        		var acctNbr_PopInstance = $commonModal.showModal({
    				id : "SAR900",
    				name : "SAR900",
    				templateUrl : 'app/views/page/popup/SAR900/SAR900.tpl.html',
    				controller : 'views.page.popup.SAR900.SAR900.controller',
    				controllerAs : 'SAR900Ctrl',
    				param : param
    			});

    			acctNbr_PopInstance.result.then (
        			function (selectedItem) {
                        $(that).parent().find('.relObjname').val(selectedItem.selectedData.acctNbr);
                        $(that).parent().find('.relObjId').val(selectedItem.selectedData.acctNbr);
        			},
        			function () {
        				//닫기시 callback 함수
        			}
            	);
            });

            $(thatDiv).find('#arrRel02024').click(function(){
                var param = {};
                var that = this;
                param.custId = $("[data-form-param='custIdVal']").val();
            	param.bizDscd = '01';
            	param.changeableBizDscdYn = 'N';
            	param.pdTpCd = '10';
            	param.changeablePdTpCdYn = 'N';
                param.pdTmpltCd = "001"; // 요구불

        		var acctNbr_PopInstance = $commonModal.showModal({
    				id : "SAR900",
    				name : "SAR900",
    				templateUrl : 'app/views/page/popup/SAR900/SAR900.tpl.html',
    				controller : 'views.page.popup.SAR900.SAR900.controller',
    				controllerAs : 'SAR900Ctrl',
    				param : param
    			});

    			acctNbr_PopInstance.result.then (
        			function (selectedItem) {
                        $(that).parent().find('.relObjname').val(selectedItem.selectedData.acctNbr);
                        $(that).parent().find('.relObjId').val(selectedItem.selectedData.acctNbr);
        			},
        			function () {
        				//닫기시 callback 함수
        			}
            	);
            });
            
            $(thatDiv).find('#arrRel02039').click(function(e){
                var param = {};
                var that = this;
                $(thatDiv).find(".relAtrbtNm-table").find('.arrRelKndCd').each(function(relIdx, relItem){
                	if($(relItem).val() == "01"){
                		param.custId = $(this).parent().find('.relObjId').val();
                		param.changeableCustIdYn = "N"
                	}
                });
                
        		var acctNbr_PopInstance = $commonModal.showModal({
    				id : "SAR900",
    				name : "SAR900",
    				templateUrl : 'app/views/page/popup/SAR900/SAR900.tpl.html',
    				controller : 'views.page.popup.SAR900.SAR900.controller',
    				controllerAs : 'SAR900Ctrl',
    				param : param
    			});

    			acctNbr_PopInstance.result.then (
        			function (selectedItem) {
                        $(that).parent().find('.relObjname').val(selectedItem.selectedData.acctNbr);
                        $(that).parent().find('.relObjId').val(selectedItem.selectedData.acctNbr);
        			},
        			function () {
        				//닫기시 callback 함수
        			}
            	);
            });
            
            $(thatDiv).find('#arrRel02027').click(function(e){
            	var param = {};
                var that = this;
                
                var mainDiv = $(thatDiv).find(".arrMain");
                $(mainDiv).find(".arrRelKndCd").each(function(idx, eachObject) {
                    if($(this).val() == "01" && $(this).parent().find(".arrRelCd").val() == "01") {
                        custId = $(this).parent().find(".relObjId").val();
                        return false;
                    }
                });

                if (!$commonService.fn_isEmpty(custId)) {
                    param.custId = custId;
                } else {
                    param.custId = $("[data-form-param='custIdVal']").val();
                }
                
            	param.bizDscd = '02';
            	param.changeableBizDscdYn = 'N';

        		var acctNbr_PopInstance = $commonModal.showModal({
    				id : "SAR900",
    				name : "SAR900",
    				templateUrl : 'app/views/page/popup/SAR900/SAR900.tpl.html',
    				controller : 'views.page.popup.SAR900.SAR900.controller',
    				controllerAs : 'SAR900Ctrl',
    				param : param
    			});

    			acctNbr_PopInstance.result.then (
        			function (selectedItem) {
                        $(that).parent().find('.relObjname').val(selectedItem.selectedData.acctNbr);
                        $(that).parent().find('.relObjId').val(selectedItem.selectedData.acctNbr);
        			},
        			function () {
        				//닫기시 callback 함수
        			}
            	);
            });
            
            //FIXME : 해당 팝업에 맞게 설정
            $(thatDiv).find('#arrRel02016').click(function(){
                var param = {};
                var that = this;
                param.custId = $("[data-form-param='custIdVal']").val();
                var popupUseAgrmnt = new PopupUseAgrmnt(param); // 팝업생성
                popupUseAgrmnt.render(param);
                popupUseAgrmnt.on('popUpSetData', function(param) {
                    $(that).parent().children().filter('.relObjname').val(param.arrId);
                    $(that).parent().next().find('.relObjId').val(param.arrId);
                });
            });

            //FIXME : 해당 팝업에 맞게 설정
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

            $(thatDiv).find('.arrRel04').click(function(){
                var param = {};
                var that = this;

        		var acctNbr_PopInstance = $commonModal.showModal({
    				id : "SDT900",
    				name : "SDT900",
    				templateUrl : 'app/views/page/popup/SDT900/SDT900.tpl.html',
    				controller : 'views.page.popup.SDT900.SDT900.controller',
    				controllerAs : 'SDT900Ctrl',
    				param : param
    			});

    			acctNbr_PopInstance.result.then (
        			function (selectedItem) {
                        $(that).parent().find('.relObjname').val(selectedItem.selectedData.text);
                        $(that).parent().find('.relObjId').val(selectedItem.selectedData.id);
        			},
        			function () {
        				//닫기시 callback 함수
        			}
            	);
            });

            $(thatDiv).find('#arrRel02007').click(function() {
                // 스윙계좌
                var that = this;
                var custId = "";

                var mainDiv = $(thatDiv).find(".arrMain");
                $(mainDiv).find(".arrRelKndCd").each(function(idx, eachObject) {
                    if($(this).val() == "01" && $(this).parent().find(".arrRelCd").val() == "01") {
                        custId = $(this).parent().find(".relObjId").val();
                        return false;
                    }
                });

                var param = {};
                param.custId = custId;
                param.bizDscd = "01";
        		var acctNbr_PopInstance = $commonModal.showModal({
    				id : "SAR900",
    				name : "SAR900",
    				templateUrl : 'app/views/page/popup/SAR900/SAR900.tpl.html',
    				controller : 'views.page.popup.SAR900.SAR900.controller',
    				controllerAs : 'SAR900Ctrl',
    				param : param
    			});

    			acctNbr_PopInstance.result.then (
        			function (selectedItem) {
                        $(that).parent().find('.relObjname').val(selectedItem.selectedData.acctNbr);
                        $(that).parent().find('.relObjId').val(selectedItem.selectedData.acctNbr);
        			},
        			function () {
        				//닫기시 callback 함수
        			}
            	);
            });

            $(thatDiv).find('#arrRel02033').click(function() {
                // 스윙계좌
                var that = this;
                var custId = "";

                var mainDiv = $(thatDiv).find(".arrMain");
                $(mainDiv).find(".arrRelKndCd").each(function(idx, eachObject) {
                    if($(this).val() == "01" && $(this).parent().find(".arrRelCd").val() == "01") {
                        custId = $(this).parent().find(".relObjId").val();
                        return false;
                    }
                });

                var param = {};
                param.custId = $('#lnAplctnCustId').val();
                //param.custId = custId;
                param.bizDscd = "01";

        		var acctNbr_PopInstance = $commonModal.showModal({
    				id : "SAR900",
    				name : "SAR900",
    				templateUrl : 'app/views/page/popup/SAR900/SAR900.tpl.html',
    				controller : 'views.page.popup.SAR900.SAR900.controller',
    				controllerAs : 'SAR900Ctrl',
    				param : param
    			});

    			acctNbr_PopInstance.result.then (
        			function (selectedItem) {
                        $(that).parent().find('.relObjname').val(selectedItem.selectedData.acctNbr);
                        $(that).parent().find('.relObjId').val(selectedItem.selectedData.acctNbr);
        			},
        			function () {
        				//닫기시 callback 함수
        			}
            	);
            });
        },
        
	    fn_getArrInputGenerate : function (thatDiv) {
        	var that = this;
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
	                	inputParam.txtCndVal = $commonService.fn_removeCommaToStr($(this).parent().next().find(".arrCndVal").val());
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
	                if ($(this).attr("type") == "checkbox") {
	                	if ($(this).is(":checked") == true) {
	                		inputParam.xtnAtrbtCntnt = "Y";
	                	} else {
	                		inputParam.xtnAtrbtCntnt = "N";
	                	}
	                } else {
	                	inputParam.xtnAtrbtCntnt = $(this).val();
	                }
	                //@@@@@@@@
//	                if(inputParam.xtnAtrbtCntnt !="" && "TD" == $(this).parent().next().find(".arrXtnAtrbtType").val()){
//	                    inputParam.xtnAtrbtCntnt = XDate(inputParam.xtnAtrbtCntnt).toString('yyyyMMdd');
//	                }
	                
	                //@@@@@@@@@
	                if($(this).children().hasClass("hasDatepicker")) {
	                	inputParam.xtnAtrbtCntnt = XDate($(this).children("input").val()).toString('yyyyMMdd');
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
	                inputParam.arrRelCd = $(this).parent().find(".arrRelCd").val();
	                inputParam.rltdBizObjId = $(this).parent().find(".relObjId").val();
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
	                    inputParam.cndList = that._getInputCndData(this); //조건리스트
	                    inputParam.xtnList = that._getInputXtnData(this); //확장값리스트
	                    inputParam.relList = that._getInputRelData(this); //관계값리스트
	                    inputChildrenData.push(inputParam);
	                }
	            });
	            return inputChildrenData;
	        }
	    }
        
    } // end return
} // end function