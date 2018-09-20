define(['bx-component/date-picker/_date-picker',
        'app/views/page/popup/CAPAT/popup-zipCd',
        'app/views/page/popup/CAPCM/popup-kr-zipCd',
        'app/views/page/popup/CAPAT/popup-cntctAuth',
        'app/views/page/popup/popup-mm-address',
        'app/views/page/popup/CAPAT/popup-clTree'
       ],
	function(datePicker, popupZipCd, popupKrZipCd, popupCntctAuth, popupMmZipCd, popupClTree) {


	var ynComboDataArray = new Array(); 
	var ynComboData = new Object();
	ynComboData.cd = "Y";
	ynComboData.cdNm = "Y"
	ynComboDataArray[0] = ynComboData;
	ynComboData = new Object();
	ynComboData.cd = "N";
	ynComboData.cdNm = "N";
	ynComboDataArray[1] = ynComboData;


	var comboStore1 = null; // 연락금지유형코드 
	var instParams = {}; // 기관파라미터-주소입력유형 


	var CAPSF000 = {


			// 해당 내용 여기서는 필요 없음
/*		 get 연락처입력항목조회 	
		getCntctPntInputItemList : function(svcParam, srcnParam, that, cntctPntDataList) {


			var CAPSF000That = this; 


		    if(svcParam != null) {
		    	// 연락처입력항목 정보 
		    	var linkData1 = {"header": fn_getHeader("SSF1510401"), "ActorCntctPntSvcGetInputItmIn": svcParam};
			    var cntctPntList = null;


			    // 기관파라미터 정보 
			    var instSvcParam = {};
			    var instSvcHeader = fn_getHeader("PCM0308403");
			    instSvcParam.instCd = instSvcHeader.instCd;
		    	var linkData2 = {"header": instSvcHeader, "InstMgmtSvcGetParmIn": instSvcParam};
		    	var instParamList = null;


		    	// 연락금지유형코드 
			    var sParam = {};
	            sParam.cdNbr = "11978"; 
	            var linkData3 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


		    	// ajax 호출
	            bxProxy.all([
	                         {url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {
	                        	 if (fn_commonChekResult(responseData)) {
	                            	 cntctPntList = responseData.ActorCntctPntSvcGetInputItmListOut.cntctPntList;
	                             }
	                         }}
	                        ,{url: sUrl, param: JSON.stringify(linkData2), success: function (responseData) {
	                        	 if (fn_commonChekResult(responseData)) {
	                        		 instParamList = responseData.InstMgmtSvcGetParmOut.parmList;
	                             }
	                         }}
	                        ,{url: sUrl, param: JSON.stringify(linkData3), success: function (responseData) {
	                            if (fn_commonChekResult(responseData)) {
	                                comboStore1 = new Ext.data.Store({
	                                    fields: ['cd', 'cdNm'],
	                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tbl
	                                });
	                            }
	                        }}
	                     ]
	                     , {
	                         success: function () {


	                        	if(instParamList != null && instParamList != undefined) {
	 	                			$(instParamList).each(function (idx, item) {
	 	                				if(item.parmAtrbtNm == "addrHrarcyCd") {
	 	                					instParams.addrHrarcyCd = item.parmVal;
	 	                				}
	 	                            });	 
	 	                		}


	                        	if (cntctPntList != null) {
	    			            	CAPSF000That.printCntctPntList(svcParam, srcnParam, that, cntctPntList, cntctPntDataList); 
	    			            }
	                         } // end of success:.function
                }); // end of bxProxy.all
		    }
		}, 	*/


		/* get 확장정보 */
		getXtnAtrbtList : function(svcParam, srcnParam, that, xtnAtrbtDataList, gridObj) {


			var CAPSF000That = this; 


			var header = new Object();
		    var headerParam = {};
		    header = fn_getHeader("SSF1508201");


		    var linkData = {"header": header, "StaffXtnAtrbtSvcIn": svcParam};


		    if(svcParam != null) {
			    // ajax 호출
			    bxProxy.post(sUrl, JSON.stringify(linkData), {
			        success: function (data) {
			            if (fn_commonChekResult(data)) {


			            	if(srcnParam != undefined && srcnParam != null) {
			            		CAPSF000That.printXtnAtrbtList(svcParam, srcnParam, that, data.StaffXtnAtrbtSvcListOut.xtnAtrbtList, xtnAtrbtDataList); 
			            	}
			            	else if(gridObj != undefined && gridObj != null){
			            		CAPSF000That.printXtnAtrbtGrid(svcParam, data.StaffXtnAtrbtSvcListOut.xtnAtrbtList, xtnAtrbtDataList, gridObj);
			            	}
			            }
			        }
			    });
		    }
		},	
		// 확장속성정보 출력가능정보 Grid set 
		printXtnAtrbtGrid : function(svcParam, xtnAtrbtList, xtnAtrbtDataList, gridObj) {


			if(xtnAtrbtList != null && xtnAtrbtList != undefined && $(xtnAtrbtList).length > 0) {


				$(xtnAtrbtList).each(function(idx, item) {


					var printAbleFlag = true;


					if((svcParam.scrnInpYn != undefined && svcParam.scrnInpYn == "Y" && svcParam.scrnInpYn != item.scrnInpYn)) {
						printAbleFlag = false;
					}


					if ((svcParam.intrnlInqryTrgtYn != undefined && svcParam.intrnlInqryTrgtYn == "Y" && svcParam.intrnlInqryTrgtYn != item.intrnlInqryTrgtYn)) {
						printAbleFlag = false;
					}


					if((svcParam.scrnChngAblYn != undefined && svcParam.scrnChngAblYn == "Y" && svcParam.scrnChngAblYn != item.scrnChngAblYn)) {
						printAbleFlag = false;
					}


					if((svcParam.custInqryTrgtYn != undefined && svcParam.custInqryTrgtYn == "Y" && svcParam.custInqryTrgtYn != item.custInqryTrgtYn)) {
						printAbleFlag = false;
					}


					if(printAbleFlag) {
						// 출력정보 
						var printItem = null;


						$(xtnAtrbtDataList).each(function(dataIdx, dataItem) {


							if(dataItem.atrbtDesc && dataItem.atrbtDesc == item.xtnAtrbtNm) {
								dataItem.xtnAtrbtNm = bxMsg('cbb_items.SCRNITM#' + item.xtnAtrbtNm);
								if(dataItem.xtnAtrbtNm == 'SCRNITM#' + item.xtnAtrbtNm )
								{
									dataItem.xtnAtrbtNm = bxMsg('cbb_items.AT#' + item.xtnAtrbtNm);
								}
								printItem = dataItem;
								return false;
							}
							else if(dataItem.xtnAtrbtNm && dataItem.xtnAtrbtNm == item.xtnAtrbtNm) {
								dataItem.xtnAtrbtNm = bxMsg('cbb_items.SCRNITM#' + item.xtnAtrbtNm);
								if(dataItem.xtnAtrbtNm == 'SCRNITM#' + item.xtnAtrbtNm )
								{
									dataItem.xtnAtrbtNm = bxMsg('cbb_items.AT#' + item.xtnAtrbtNm);
								}
								printItem = dataItem;
								return false;
							}
						});


						if(printItem != null) {


							if(printItem.xtnAtrbtCntnt == null || printItem.xtnAtrbtCntnt == undefined || printItem.xtnAtrbtCntnt == "null") {
								printItem.xtnAtrbtCntnt = "";
							}


							// 공통코드 element인 경우
							if(item.cdNbr != undefined && item.cdNbr != null && item.cdNbr != "") {
								// 연락수단구분
								var sParam = {};
								sParam.cdNbr = item.cdNbr;


								var linkData = {"header": fn_getHeader("CAPCM0038400"), "CmnCdSvc06In": sParam};


							    bxProxy.post(sUrl, JSON.stringify(linkData), {
							        success: function (data) {


							        	if (fn_commonChekResult(data)) {
							        		var comboStore = new Ext.data.Store({
							        			fields: ['cd', 'cdNm'],
							        			data: data.CaCmnCdSvcGetCdListByCdNbrOut.tbl
							        		});


							        		if(comboStore != null) {
							        			var storeIndex = comboStore .findExact('cd', printItem.xtnAtrbtCntnt);


							        			if(storeIndex != -1) {
							        				printItem.xtnAtrbtCntnt = printItem.xtnAtrbtCntnt + " " + comboStore.getAt(storeIndex).data.cdNm;
							        			}
							        		} 	
							        		gridObj.addData(printItem);
							            }
							        }
							    });
							}
							// 날짜형식인 경우 
							else if(item.atrbtTpCd == "TD") {
								if(printItem.xtnAtrbtCntnt != undefined && printItem.xtnAtrbtCntnt != null && printItem.xtnAtrbtCntnt.length == 8) {
									printItem.xtnAtrbtCntnt = printItem.xtnAtrbtCntnt.substring(0, 4) + "-" +
										printItem.xtnAtrbtCntnt.substring(4, 6) + "-" + printItem.xtnAtrbtCntnt.substring(6, 8);
 								}
								else {
									printItem.xtnAtrbtCntnt = printItem.xtnAtrbtCntnt;
								}
								gridObj.addData(printItem);
							}
							// 숫자형식인 경우 
							else if(item.atrbtTpCd == "NU") {
								printItem.xtnAtrbtCntnt = Ext.util.Format.number(printItem.xtnAtrbtCntnt, '0,000');
								gridObj.addData(printItem);
							}
							else {
								gridObj.addData(printItem);
							}							
						} // end of if(printItem != null)	
						else {
							printItem = new Object();
							printItem.xtnAtrbtNm = bxMsg('cbb_items.AT#' + item.xtnAtrbtNm);
							gridObj.addData(printItem);
						}
					}
				});				
			}
		},
		// 연락처정보 출력 
		printCntctPntList : function(svcParam, srcnParam, that, cntctPntList, cntctPntDataList) {
			if(cntctPntList != null && cntctPntList != undefined && $(cntctPntList).length > 0) {
				var CAPSF000That = this; 
				var elcmentCntPreRow = srcnParam.elcmentCntPreRow; // 1row에 출력할 element 개수 
				var printElementCntPerRow = 0; 	// 1row에 출력된 element 개수
				var printElementTotCnt = 0; // 전체 출력된 element 개수  
				var trObj = null;
				var thObj = null; 
				var tdObj = null; 
				var tblObj = that.$el.find("." + srcnParam.tblClass);
				var calColspan = (srcnParam.printCntctPrhbtnTpYn != "N" ? 0 : 1);


				$(cntctPntList).each(function(idx, item) {


					var cntctPntSupplInfoCntnt = "";
					var addrHrarcyCd = "";
					var addrId = "";
					var dtlCntctPntCntnt = "";
					var telecomcarrId = "";
					var cntctPrhbtnTpCd = "";
					var authYn = "";
					var addrCntnt = "";
					var cntntId = "cntctId_" + idx;
					var cntctPntSeqNbr = "";


					// data get 
					$(cntctPntDataList).each(function (dataIdx, dataItem) {
						if(item.cntctPntTpCd == dataItem.cntctPntTpCd && item.cntctMthdTpCd == dataItem.cntctMthdTpCd) {
							cntctPntSupplInfoCntnt = dataItem.cntctPntSupplInfoCntnt;
							addrHrarcyCd = dataItem.addrHrarcyCd;
							addrId = dataItem.addrId;
							dtlCntctPntCntnt = dataItem.dtlCntctPntCntnt;
							telecomcarrId = dataItem.telecomcarrId;
							cntctPrhbtnTpCd = dataItem.cntctPrhbtnTpCd;
							authYn = dataItem.authYn;
							addrCntnt = dataItem.addrCntnt;
							cntctPntSeqNbr = dataItem.cntctPntSeqNbr;
							return false;
						}
					});


					// 새로운 row 생성 
					if(printElementCntPerRow == 0) {
						trObj = document.createElement("tr"); 
					}


					thObj = document.createElement("th");
					thObj.setAttribute("cntnt-id", cntntId);


					var itemName = bxMsg('cbb_items.' + item.cntctPntItmNm);
					thObj.setAttribute("data-tooltip", itemName);
					thObj.setAttribute("col-index-per-row", printElementCntPerRow);


					// 필수입력 표시 
					if(item.mndtryYn == "Y") {
						thObj.setAttribute("mandatory", "true");


						var iObj = document.createElement("i");
						iObj.className = "fa fa-check fa-lg require-check-icon"; 
						thObj.appendChild(iObj);
					}
					var spanObj = document.createElement("span");
					spanObj.appendChild(document.createTextNode(itemName)); 
					thObj.appendChild(spanObj);
					trObj.appendChild(thObj);


					// td 생성 
					tdObj = document.createElement("td");
					tdObj.setAttribute("cntnt-id", cntntId);


					// 입력하는 경우 
					if(srcnParam.scrnInpYn == "Y" ) {


						// set hidden information 
						var hiddenObj = document.createElement("input");
						hiddenObj.setAttribute("type", "hidden");
						hiddenObj.setAttribute("data-form-param", "cntctPntTpCd");
						hiddenObj.value = item.cntctPntTpCd;
						tdObj.appendChild(hiddenObj);


						hiddenObj = document.createElement("input");
						hiddenObj.setAttribute("type", "hidden");
						hiddenObj.setAttribute("data-form-param", "cntctMthdTpCd");
						hiddenObj.value = item.cntctMthdTpCd;
						tdObj.appendChild(hiddenObj);


						hiddenObj = document.createElement("input");
						hiddenObj.setAttribute("type", "hidden");
						hiddenObj.setAttribute("data-form-param", "cntctPntSeqNbr");
						hiddenObj.value = cntctPntSeqNbr;
						tdObj.appendChild(hiddenObj);


						// 연락방식이 우편인 경우 
						if(item.cntctMthdTpCd == "07") {


							if(instParams.addrHrarcyCd == "NA") {
								// editing area
								tdObj.setAttribute("colspan", (7 + calColspan));


								var inputObj = document.createElement("input");
								inputObj.setAttribute("type", "text");
								inputObj.setAttribute("data-form-param", "dtlCntctPntCntnt");
								inputObj.setAttribute("cntnt-id", cntntId);
								inputObj.value = dtlCntctPntCntnt;
								inputObj.addEventListener("change", function(e) { CAPSF000That.changeCntctPnt(e) });
								inputObj.className = "bx-form-item bx-component-small";
								tdObj.appendChild(inputObj);
							}
							else {
								// popup search area
								tdObj.setAttribute("colspan", "5");


								var inputObj = document.createElement("input");
								inputObj.setAttribute("type", "text");
								inputObj.setAttribute("data-form-param", "addrCntnt");
								inputObj.setAttribute("cntnt-id", cntntId);
								inputObj.value = addrCntnt;
								inputObj.setAttribute("disabled", "true");
								inputObj.className = "bx-form-item bx-component-small";


								tdObj.appendChild(inputObj);


								var btnObj = document.createElement("button");
								btnObj.setAttribute("cntnt-id", cntntId);
								btnObj.className = "bx-icon bx-icon-medium bx-icon-search";
								btnObj.addEventListener("click", function(e) { CAPSF000That.popupCntctPntAddr(e) });    


								tdObj.appendChild(btnObj);
								trObj.appendChild(tdObj);


								tdObj = document.createElement("td");
								tdObj.setAttribute("cntnt-id", cntntId);
								tdObj.setAttribute("colspan", (2 + calColspan));  


								var inputObj = document.createElement("input");
								inputObj.setAttribute("type", "text");
								inputObj.setAttribute("data-form-param", "dtlCntctPntCntnt");
								inputObj.setAttribute("cntnt-id", cntntId);
								inputObj.value = dtlCntctPntCntnt;
								inputObj.setAttribute("disabled", "true");
								inputObj.className = "bx-form-item bx-component-small";


								tdObj.appendChild(inputObj);
							}
							printElementCntPerRow = elcmentCntPreRow - 1;
						}
						else {


							tdObj.setAttribute("colspan", (2 + calColspan));


							var inputObj = document.createElement("input");
							inputObj.setAttribute("type", "text");
							inputObj.setAttribute("data-form-param", "dtlCntctPntCntnt");
							inputObj.setAttribute("cntnt-id", cntntId);
							inputObj.value = dtlCntctPntCntnt;
							inputObj.addEventListener("change", function(e) { CAPSF000That.changeCntctPnt(e) });
							inputObj.className = "bx-form-item bx-component-small";
							tdObj.appendChild(inputObj);
						}


						var addHiddenObj = document.createElement("input");
						addHiddenObj.setAttribute("type", "hidden");
						addHiddenObj.setAttribute("data-form-param", "cntctPntSupplInfoCntnt");
						addHiddenObj.value = cntctPntSupplInfoCntnt;
						tdObj.appendChild(addHiddenObj);


						addHiddenObj = document.createElement("input");
						addHiddenObj.setAttribute("type", "hidden");
						addHiddenObj.setAttribute("data-form-param", "addrHrarcyCd");
						addHiddenObj.value = instParams.addrHrarcyCd;
						tdObj.appendChild(addHiddenObj);


						addHiddenObj = document.createElement("input");
						addHiddenObj.setAttribute("type", "hidden");
						addHiddenObj.setAttribute("data-form-param", "addrId");
						addHiddenObj.value = addrId;
						tdObj.appendChild(addHiddenObj);


						addHiddenObj = document.createElement("input");
						addHiddenObj.setAttribute("type", "hidden");
						addHiddenObj.setAttribute("data-form-param", "telecomcarrId");
						addHiddenObj.value = telecomcarrId;
						tdObj.appendChild(addHiddenObj);


						addHiddenObj = document.createElement("input");
						addHiddenObj.setAttribute("type", "hidden");
						addHiddenObj.setAttribute("data-form-param", "authYn");
						addHiddenObj.value = authYn;
						tdObj.appendChild(addHiddenObj);


						trObj.appendChild(tdObj);


						// 접촉허용정보 SET 
						if(srcnParam.printCntctPrhbtnTpYn != "N") {
							tdObj = document.createElement("td");
							tdObj.setAttribute("cntnt-id", cntntId);


							var spanObj = document.createElement("span");
							spanObj.className = "cntctPrhbtnTpCd-wrap";
							spanObj.setAttribute("cntnt-id", cntntId);


							tdObj.appendChild(spanObj);
							trObj.appendChild(tdObj);


							// 연락금지콤보 set
							var comboParam = {};			
							comboParam.areaObj = $(spanObj);
							comboParam.targetId = "cntctPrhbtnTpCd";
			            	comboParam.nullYn = "N";
			            	comboParam.viewType = "ValNm";


			            	if(dtlCntctPntCntnt == null || dtlCntctPntCntnt == "") {
			            		comboParam.disabled = true;
			            	}


			            	if(cntctPrhbtnTpCd != null && cntctPrhbtnTpCd != "") {
			            		comboParam.selectVal = cntctPrhbtnTpCd;
			            	}
			            	CAPSF000That.setActorComboBase(comboParam, that, {}, null, comboStore1);
						}


						tdObj = document.createElement("td");
						tdObj.setAttribute("cntnt-id", cntntId);


						// 주소 입력 
						if(item.cntctMthdTpCd == "07" && instParams.addrHrarcyCd != "NA") {
							var btnObj = document.createElement("button");
							btnObj.className = "bx-btn bx-btn-small cntctPntAddr-reset-btn";
							btnObj.innerHTML = bxMsg('cbb_items.SCRNITM#reset2');
							btnObj.addEventListener("click", function(e) { CAPSF000That.clickCntctPntAddrReset(e) });
							btnObj.setAttribute("cntnt-id", cntntId);


							tdObj.appendChild(btnObj);
						}


						// 인증필요한 연락처 정보인 경우 
						if(item.authMndtryCntctPntYn == "Y") {
							var btnObj = document.createElement("button");
							btnObj.className = "bx-btn bx-btn-small bx-btn-primary cntctPnt-auth-btn";
							btnObj.innerHTML = bxMsg('cbb_items.SCRNITM#authentication');
							btnObj.addEventListener("click", function(e) { CAPSF000That.clickCntctAuth(e) });
							btnObj.setAttribute("cntnt-id", cntntId);


							if(dtlCntctPntCntnt == null || dtlCntctPntCntnt == "") {
								btnObj.setAttribute("disabled", true);
							}


							tdObj.appendChild(btnObj);


							var authRsltObj = document.createElement("span");
							authRsltObj.className = "authRslt-wrap";
							authRsltObj.value = "N";
							tdObj.appendChild(authRsltObj);
						}
						trObj.appendChild(tdObj);


						// 인증성공된 경우
						if(authYn == "Y") {
							CAPSF000That.setCntctAuthSuccessInfo($(trObj).find('[cntnt-id="' + cntntId + '"]'));
						}	
					}
					// 출력만 하는 경우
					else {
						trObj.appendChild(tdObj);
					}


					printElementCntPerRow++;


					if(printElementCntPerRow == elcmentCntPreRow) {
						tblObj.append(trObj); 
						printElementCntPerRow = 0;							
					}
					printElementTotCnt++; // 출력된 총 element 개수 


				});					


				// 1row에 출력되어야할 컬럼개수보다 적은 수의 컬럼이 출력된 경우 나머지 컬럼 출력 
				if(printElementCntPerRow != 0 && printElementCntPerRow < elcmentCntPreRow) {
					tdObj = document.createElement("td");
					tdObj.setAttribute("colspan", ((elcmentCntPreRow - (printElementTotCnt % elcmentCntPreRow)) * 5));
					trObj.appendChild(tdObj);
					tblObj.append(trObj); 
				}	
			}
		},
		// 연락처정보 변경 시 실행
		changeCntctPnt : function(e) {
			var $targetObj = $(e.currentTarget);
			var $cntctIdObjs = $targetObj.parent().parent().find('[cntnt-id="' + $targetObj.attr("cntnt-id") + '"]');


			if($targetObj.val() == "") {
				$cntctIdObjs.find("[data-form-param='authYn']").val("N");
				$cntctIdObjs.find('button').attr("disabled", true);
				$cntctIdObjs.find('.authRslt-wrap').html("");
				$cntctIdObjs.find("select option:eq(0)").attr("selected", true);
				$cntctIdObjs.find("select").attr("disabled", true);
			}
			else {
				$cntctIdObjs.find('button').attr("disabled", false);
				$cntctIdObjs.find("select").attr("disabled", false);
				$cntctIdObjs.find('.authRslt-wrap').html("");
				$cntctIdObjs.find("[data-form-param='authYn']").val("N");
			}			
		},
//		// 연락처인증 버튼 클릭 시 실행
//		clickCntctPntAuth : function(e) {
//			var $clickedObj = $(e.currentTarget);
//			var $cntctIdObjs = $clickedObj.parent().parent().find('[cntnt-id="' + $clickedObj.attr("cntnt-id") + '"]');
//			
//			if($cntctIdObjs.find("input [data-form-param='dtlCntctPntCntnt']").val() != "") {
//				$cntctIdObjs.find("[data-form-param='authYn']").val("Y");
//				$cntctIdObjs.parent().find(".authRslt-wrap").html(" " + bxMsg('cbb_items.SCRNITM#authentication'));
//			}
//		}, 
		// 연락처주소 검색 버튼 클릭 시 실행
		popupCntctPntAddr : function(e) {


			var $clickedObj = $(e.currentTarget);
			var $cntctIdObjs = $clickedObj.parent().parent().find('[cntnt-id="' + $clickedObj.attr("cntnt-id") + '"]');


			if(instParams.addrHrarcyCd == "KZ") {
			    var param = {};
			    var popZipCdObj = new popupZipCd(param); // 팝업생성
			    popZipCdObj.render();


			    popZipCdObj.on('popUpSetData', function (param) {
			    	$cntctIdObjs.find('[data-form-param="addrHrarcyCd"]').val(instParams.addrHrarcyCd); 
			    	$cntctIdObjs.find('[data-form-param="addrId"]').val(param.addrId); 
			    	$cntctIdObjs.find('[data-form-param="addrCntnt"]').val("[" + param.zipCd + "]" + param.addr); 
			    	$cntctIdObjs.find('[data-form-param="dtlCntctPntCntnt"]').val(param.dtlAddr); 
			    	$cntctIdObjs.find("select").attr("disabled", false);					    	
			    });
			}
			else if(instParams.addrHrarcyCd == "KR") {
			    var param = {};
			    var popZipCdObj = new popupKrZipCd(param); // 팝업생성
			    popZipCdObj.render();


			    popZipCdObj.on('popUpSetData', function (param) {
			    	$cntctIdObjs.find('[data-form-param="addrHrarcyCd"]').val(instParams.addrHrarcyCd); 
			    	$cntctIdObjs.find('[data-form-param="addrId"]').val(param.addrId); 
			    	$cntctIdObjs.find('[data-form-param="addrCntnt"]').val("[" + param.zipCd + "]" + param.roadAddr); 
			    	$cntctIdObjs.find('[data-form-param="dtlCntctPntCntnt"]').val(param.dtlAddr); 
			    	$cntctIdObjs.find("select").attr("disabled", false);					    	
			    });
			}
			else if(instParams.addrHrarcyCd == "MM") {
			    var param = {};
			    var popZipCdObj = new popupMmZipCd(param); // 팝업생성
			    popZipCdObj.render();


			    popZipCdObj.on('popUpSetData', function (param) {
			    	$cntctIdObjs.find('[data-form-param="addrHrarcyCd"]').val(instParams.addrHrarcyCd);
			    	$cntctIdObjs.find('[data-form-param="addrId"]').val(param.townshipCd);
			    	$cntctIdObjs.find('[data-form-param="addrCntnt"]').val(param.cityNm);
			    	$cntctIdObjs.find('[data-form-param="dtlCntctPntCntnt"]').val(param.townshipNm + " " + param.dtlAddrCntnt);//화면출력용
			    	$cntctIdObjs.find('[data-form-param="bsicAddrCntnt"]').val(param.cityNm + " " + param.townshipNm);
			    	$cntctIdObjs.find('[data-form-param="dtlAddrCntnt"]').val(param.dtlAddrCntnt); //DB인서트용
			    	$cntctIdObjs.find("select").attr("disabled", false);
			    });
			}
		}, 
		// 주소연락처정보 리셋 버튼 클릭 시 실행
		clickCntctPntAddrReset : function(e) {
			var $clickedObj = $(e.currentTarget);
			var $cntctIdObjs = $clickedObj.parent().parent().find('[cntnt-id="' + $clickedObj.attr("cntnt-id") + '"]');


	    	$cntctIdObjs.find('[data-form-param="addrId"]').val(""); 
	    	$cntctIdObjs.find('[data-form-param="addrCntnt"]').val(""); 
	    	$cntctIdObjs.find('[data-form-param="cntctPntSupplInfoCntnt"]').val(""); 
	    	$cntctIdObjs.find('[data-form-param="dtlCntctPntCntnt"]').val(""); 
	    	$cntctIdObjs.find("select option:eq(0)").attr("selected", true);
	    	$cntctIdObjs.find("select").attr("disabled", true);	
		}, 
		// 확장속성정보 출력 
		printXtnAtrbtList : function(svcParam, srcnParam, that, xtnAtrbtList, xtnAtrbtDataList) {
			if(xtnAtrbtList != null && xtnAtrbtList != undefined && $(xtnAtrbtList).length > 0) {
				var CAPSF000That = this; 
				var elcmentCntPreRow = srcnParam.elcmentCntPreRow; // 1row에 출력할 element 개수 
				var printElementCntPerRow = 0; 	// 1row에 출력된 element 개수
				var printElementTotCnt = 0; // 전체 출력된 element 개수  
				var trObj = null;
				var thObj = null; 
				var tdObj = null; 
				var tblObj = that.$el.find("." + srcnParam.tblClass);
				CAPSF000That.clTreeList = new Array();


				$(xtnAtrbtList).each(function(idx, item) {
					var printAbleFlag = true;


					if((svcParam.scrnInpYn != undefined && svcParam.scrnInpYn == "Y" && svcParam.scrnInpYn != item.scrnInpYn)) {
						printAbleFlag = false;
					}


					if ((svcParam.intrnlInqryTrgtYn != undefined && svcParam.intrnlInqryTrgtYn == "Y" && svcParam.intrnlInqryTrgtYn != item.intrnlInqryTrgtYn)) {
						printAbleFlag = false;
					}


					if((svcParam.scrnChngAblYn != undefined && svcParam.scrnChngAblYn == "Y" && svcParam.scrnChngAblYn != item.scrnChngAblYn)) {
						printAbleFlag = false;
					}


					if((svcParam.custInqryTrgtYn != undefined && svcParam.custInqryTrgtYn == "Y" && svcParam.custInqryTrgtYn != item.custInqryTrgtYn)) {
						printAbleFlag = false;
					}


					if(printAbleFlag) {
						var xtnAtrbtCntnt = "";


						// data get 
						$(xtnAtrbtDataList).each(function (dataIdx, dataItem) {
							if(item.xtnAtrbtNm == dataItem.xtnAtrbtNm) {
								xtnAtrbtCntnt = dataItem.xtnAtrbtCntnt;
								return false;
							}
						});


						// 새로운 row 생성 
						if(printElementCntPerRow == 0) {
							trObj = document.createElement("tr"); 
						}


						thObj = document.createElement("th");


						var itemName = bxMsg('cbb_items.AT#' + item.xtnAtrbtNm);
						thObj.setAttribute("data-tooltip", itemName);
						thObj.setAttribute("col-index-per-row", printElementCntPerRow);


						if(item.atrbtTpCd == "YN" && srcnParam.printYnTypeToCombo == "Y") {
							thObj.setAttribute("atrbt-tp", item.atrbtTpCd + "_combobox"); // 항목유형 set
						}
						else {
							thObj.setAttribute("atrbt-tp", item.atrbtTpCd); // 항목유형 set
						}


						// 필수입력 표시 
						if(item.mndtryYn == "Y") {
							thObj.setAttribute("mandatory", "true");


							var iObj = document.createElement("i");
							iObj.className = "fa fa-check fa-lg require-check-icon"; 
							thObj.appendChild(iObj);
						}
						var spanObj = document.createElement("span");
						spanObj.appendChild(document.createTextNode(itemName)); 
						thObj.appendChild(spanObj);
						trObj.appendChild(thObj);


						// td 생성 
						tdObj = document.createElement("td");
						var itemObj = null;


						// 입력/수정하고자하는 경우 
						if(svcParam.scrnInpYn == "Y" || svcParam.scrnChngAblYn == "Y") {


							// 분류체계 element인 경우
							if(item.clHrarcyId != undefined && item.clHrarcyId != null && item.clHrarcyId != "") {
								var clNmObj = document.createElement("input");
								clNmObj.setAttribute("type", "text");
								clNmObj.setAttribute("data-form-param", "xtnAtrbtCntntInfo");
								clNmObj.setAttribute("disabled", true);
								clNmObj.className = "bx-form-item bx-component-small"; 	


								tdObj.appendChild(clNmObj);


								// 분류체계정보 get 
								var clTreeListId = CAPSF000That.clTreeList.length;
								CAPSF000That.getClNmList(item.clHrarcyId, xtnAtrbtCntnt, clNmObj, clTreeListId);


								var inputObj = document.createElement("input");
								inputObj.setAttribute("type", "hidden");
								inputObj.setAttribute("data-form-param", "xtnAtrbtCntnt");
								inputObj.value = xtnAtrbtCntnt;


								tdObj.appendChild(inputObj);


								inputObj = document.createElement("input");
								inputObj.setAttribute("type", "hidden");
								inputObj.setAttribute("data-form-param", "clHrarcyCd");
								inputObj.value = item.clHrarcyId;


								tdObj.appendChild(inputObj);


								inputObj = document.createElement("input");
								inputObj.setAttribute("type", "hidden");
								inputObj.setAttribute("data-form-param", "clTreeListId");
								inputObj.value = clTreeListId;


								tdObj.appendChild(inputObj);


								itemObj = document.createElement("button");
								itemObj.className = "bx-icon bx-icon-medium bx-icon-search";
								itemObj.addEventListener("click", function(e) { CAPSF000That.popupSearchClTreeForXtnAtrbt(e) }); 


							}
							// 공통코드 element인 경우
							else if(item.cdNbr != undefined && item.cdNbr != null && item.cdNbr != "") {
								itemObj = document.createElement("span");
								itemObj.className = item.xtnAtrbtNm + "-wrap";


								var sParam = {};
								var selectStyle = {};					
								sParam.className = item.xtnAtrbtNm + "-wrap";
								sParam.targetId = "xtnAtrbtCntnt";
								sParam.nullYn = "Y";
								//sParam.nullYn = item.mndtryYn == "Y" ? "N" : "Y";
								sParam.selectVal = xtnAtrbtCntnt;
								sParam.cdNbr = item.cdNbr;
								sParam.viewType = "ValNm";
								fn_getCodeList(sParam, that, selectStyle);	


							}
							// date picker 
							else if(item.atrbtTpCd == "TD" || item.atrbtTpCd == "TM") {
								itemObj = document.createElement("span");
								itemObj.className = item.xtnAtrbtNm + "-wrap"; 


								var datePickerNm = item.xtnAtrbtNm + "DatePicker";
								var setTimeFlag = item.atrbtTpCd == "TM" ? true : false;


								that.subViews[datePickerNm] = new datePicker({
				                	inputAttrs: { 'data-form-param': 'xtnAtrbtCntnt' },
				                    setTime: setTimeFlag,
				                    editable: true
				                });


								$(itemObj).html(that.subViews[datePickerNm].render());
								that.subViews[datePickerNm].setValue(xtnAtrbtCntnt);


							}
							else if(item.atrbtTpCd == "YN") {




								if(srcnParam.printYnTypeToCombo == "Y") {
									var printComboParam = {};
									printComboParam.nullYn = "Y";
									printComboParam.selectVal = xtnAtrbtCntnt;


									itemObj = CAPSF000That.printXtnAtrbtCombo(printComboParam, ynComboDataArray);
								}
								else {
									itemObj = document.createElement("span");
									itemObj.className = item.xtnAtrbtNm + "-wrap"; 


									var checkObj = document.createElement("input");
									checkObj.setAttribute("type", "checkbox");
									checkObj.setAttribute("data-form-param", "xtnAtrbtCntnt");
									checkObj.value = "Y";


									var textObj = document.createElement("span");
									$(textObj).html(bxMsg('cbb_items.ABRVTN#yes'));


									itemObj.appendChild(checkObj);
									itemObj.appendChild(textObj);


									if(xtnAtrbtCntnt == "Y") {
										checkObj.checked = true;
									}								
								}
							}
							else if(item.atrbtTpCd == "PW") {
								itemObj = document.createElement("input");
								itemObj.setAttribute("type", "password");
								itemObj.setAttribute("data-form-param", "xtnAtrbtCntnt");
								itemObj.className = "bx-form-item bx-component-small"; 
								itemObj.value = xtnAtrbtCntnt;
							}
							else {
								itemObj = document.createElement("input");
								itemObj.setAttribute("type", "text");
								itemObj.setAttribute("data-form-param", "xtnAtrbtCntnt");
								itemObj.className = "bx-form-item bx-component-small"; 	


								// 숫자인 경우 오른쪽 정렬 적용 
								if(item.atrbtTpCd == "NU" || item.atrbtTpCd == "TN") {
									itemObj.style.textAlign = "right";
								}	


								itemObj.value = xtnAtrbtCntnt;
							}


							// set actor division code object
							var actorDsObj = document.createElement("input");
							actorDsObj.setAttribute("type", "hidden");
							actorDsObj.setAttribute("data-form-param", "actorDsCd");
							actorDsObj.value = item.actorDsCd;


							tdObj.appendChild(actorDsObj);


							// set extend attribute name object
							var atrbtNmObj = document.createElement("input");
							atrbtNmObj.setAttribute("type", "hidden");
							atrbtNmObj.setAttribute("data-form-param", "xtnAtrbtNm");
							atrbtNmObj.value = item.xtnAtrbtNm;


							tdObj.appendChild(atrbtNmObj);	
						}
						// 출력만 하는 경우
						else {
							itemObj = document.createElement("span");
							itemObj.className = item.xtnAtrbtNm + "-wrap";
							itemObj.innerHTML = xtnAtrbtCntnt; 
						}
						tdObj.appendChild(itemObj);
						trObj.appendChild(tdObj);


						printElementCntPerRow++;


						if(printElementCntPerRow == elcmentCntPreRow) {
							tblObj.append(trObj); 
							printElementCntPerRow = 0;							
						}
						printElementTotCnt++; // 출력된 총 element 개수 
					}
				});					


				// 1row에 출력되어야할 컬럼개수보다 적은 수의 컬럼이 출력된 경우 나머지 컬럼 출력 
				if(printElementTotCnt % elcmentCntPreRow > 0) {
					tdObj = document.createElement("td");
					tdObj.setAttribute("colspan", ((elcmentCntPreRow - (printElementTotCnt % elcmentCntPreRow)) * 2));
					trObj.appendChild(tdObj);
					tblObj.append(trObj); 
				}


				/*
				// 데이터 출력 
				if(xtnAtrbtDataList != null) {
					this.setXtnAtrbtInfo(that, srcnParam.tblClass, xtnAtrbtDataList);
				}
				*/
			}
		},
		// 분류체계목록 조회
		getClNmList : function(clHrarcyCd, clId, clNmObj, clTreeListId) {
			var CAPSF000That = this; 
			var svcParam = new Object();
			svcParam.clHrarcyId = clHrarcyCd;


		    var linkData = {"header": fn_getHeader("CAPCM1708401"), "CaClTreeMgmtSvcIn": svcParam};


		    if(svcParam != null) {
			    // ajax 호출
			    bxProxy.post(sUrl, JSON.stringify(linkData), {
			        success: function (data) {
			            if (fn_commonChekResult(data)) {
			            	CAPSF000That.clTreeList[clTreeListId] = data.CaClTreeMgmtSvcOut;


			            	// 분류명 출력 
			            	CAPSF000That.setClNm(clId, clNmObj, clTreeListId);			            	
			            }
			        }
			    });
		    }


		},
		// 분류체계명을 화면의 항목에 출력 
		setClNm : function(clId, clNmObj, clTreeListId) {


			var CAPSF000That = this; 


			if(clId != null && clId != "" && clNmObj) {


				var clTreeList = CAPSF000That.clTreeList[clTreeListId];
				var clNm = CAPSF000That.getClNmByClId(clId, clTreeList);


				if(clNm == null) clNm = "";
				$(clNmObj).val(clId + " " + clNm);		
			}
		},
		getClNmByClId : function(clId, clTreeList) {
			var CAPSF000That = this; 
			var clNm = null;


			$(clTreeList).each(function(idx, item) {
				if(clId == item.clId) {
					clNm = item.clNm;
			    	return false;
			    }
			});	


			if(clNm == null) {


				if(clTreeList.children != undefined && 
						clTreeList.children.length > 0) {


					$(clTreeList.children).each(function(idx, item) {
						clNm = CAPSF000That.getClNmByClId(clId, item);


						if(clNm != null) {
							return false;
						}
					});
				}
			}
			return clNm;
		},
		// 분류체계 검색 팝업 창 오픈 
        popupSearchClTreeForXtnAtrbt : function(e) {


        	var $clickedObj = $(e.currentTarget);
            var $xtnAtrbtCntntObj = $clickedObj.parent().find('[data-form-param="xtnAtrbtCntnt"]');


            var param = {};
            param.instCd = $.sessionStorage('instCd');
            param.clHrarcyCd = $clickedObj.parent().find('[data-form-param="clHrarcyCd"]').val();


            var popupClTreeObj = new popupClTree(param); // 팝업생성
            popupClTreeObj.render();


            popupClTreeObj.on('popUpSetData', function(param) {
            	$clickedObj.parent().find('[data-form-param="xtnAtrbtCntnt"]').val(param.clId);
            	$clickedObj.parent().find('[data-form-param="xtnAtrbtCntntInfo"]').val(param.clId + " " + param.clNm);            	
            });
        },		
		// 연락처정보 인증 검색 팝업 창 오픈 
        clickCntctAuth : function(e) {
        	var CAPSF000That = this;
        	var $clickedObj = $(e.currentTarget);
        	var cntctIdObjs = $clickedObj.parent().parent().find('[cntnt-id="' + $clickedObj.attr("cntnt-id") + '"]');


            var param = {};


            // 무선전화
            if(cntctIdObjs.find('[data-form-param="cntctMthdTpCd"]').val() == "01") {
           		param.authTrgtTpCd = "03";
           		param.authCd = "00002"; // 비고객SMS인증 
        	}
            // email
            else if(cntctIdObjs.find('[data-form-param="cntctMthdTpCd"]').val() == "03") {
           		param.authTrgtTpCd = "04";
           		param.authCd = "00003"; // 비고객EMAIL인증  
        	}
        	param.authTrgtId = cntctIdObjs.find('[data-form-param="dtlCntctPntCntnt"]').val();


            var popupCntctAuthObj = new popupCntctAuth(param); // 팝업생성
            popupCntctAuthObj.render();


            popupCntctAuthObj.on('popUpSetData', function(param) {


            	if(param != null && param.selfAuthId != undefined && param.selfAuthId != null && param.selfAuthId != "") {
	            	CAPSF000That.setCntctAuthSuccessInfo(cntctIdObjs);
            	}
            });


        },
        // 연락처 인증성공 정보 set 
        setCntctAuthSuccessInfo : function(cntctIdObjs) {
        	cntctIdObjs.find('[data-form-param="authYn"]').val("Y");
        	cntctIdObjs.find(".authRslt-wrap").html(" " + bxMsg('cbb_items.SCRNITM#authentication'));
        },
		// combo object 출력 
		printXtnAtrbtCombo : function(printParam, cdDataList) {
		    var itemObj = document.createElement('section');
		    itemObj.className = "bx-combo-box-wrap";


		    var selectObj = document.createElement('select');
		    selectObj.className = "bx-combo-box bx-form-item bx-component-small";
		    selectObj.setAttribute("data-form-param", "xtnAtrbtCntnt");


		    if(printParam.nullYn == "Y") {
			    var optionObj = document.createElement('option');
			    $(optionObj).val("").text("");
			    selectObj.appendChild(optionObj);
			}


		    var selectedOptionObj = null;


		    $(cdDataList).each(function(idx, item) {
			    var optionObj = document.createElement('option');
			    $(optionObj).val(item.cd).text(item.cdNm);
			    selectObj.appendChild(optionObj);


			    if(printParam.selectVal == item.cd) {
			    	selectedOptionObj = $(optionObj);
			    }
		    });


		    itemObj.appendChild(selectObj);


		    if(selectedOptionObj) {
		    	selectedOptionObj.attr('selected', true);
		    }


		    return itemObj;
		},
		// 확장속성 입력값 validation check
		// param : tblClassNm 확장속성을 포함한 table 의 class명 
		checkValidXtnAtrbt : function(that, tblClassNm) {
			var errorMsg = null;
			var mandatoryItemNms = ""; 


			that.$el.find("." + tblClassNm).find("th").each(function(idx, item) {


				var colIndexPerRow = Number(item.getAttribute("col-index-per-row"));
				var xtnAtrbtCntntObj = $(item).parent().find('[data-form-param="xtnAtrbtCntnt"]').eq(colIndexPerRow);
				var xtnAtrbtCntntVal = $(item).parent().find('[data-form-param="xtnAtrbtCntnt"]').eq(colIndexPerRow).val();


				// 필수입력항목 체크 
				if(item.getAttribute("mandatory") == "true") {


					if(xtnAtrbtCntntObj.attr("type") == "checkbox" && xtnAtrbtCntntObj.prop("checked") != true) {
						mandatoryItemNms += $(item).find("span").html() + ", ";
					}
					else if(xtnAtrbtCntntVal == "" || xtnAtrbtCntntVal == "null" || xtnAtrbtCntntVal == null) {
						mandatoryItemNms += $(item).find("span").html() + ", ";
					}
				}
			});


			if(mandatoryItemNms != "") {
				errorMsg = bxMsg("cbb_err_msg.AUICME0004") + "[" + mandatoryItemNms.substring(0, mandatoryItemNms.length - 2) + "]";
			}


			return errorMsg;
		},
		// 연락처정보 입력값 validation check
		// param : tblClassNm 확장속성을 포함한 table 의 class명 
		checkValidCntctPnt : function(that, tblClassNm) {
			var CAPSF000That = this; 
			var errorMsg = null;
			var mandatoryErrorItemNms = ""; 
			var emailIteErrormNms = ""; 


			that.$el.find("." + tblClassNm).find("th").each(function(idx, item) {


				var targetVal = $(item).parent().find('[cntnt-id="' + $(item).attr("cntnt-id") + '"]').find('[data-form-param="dtlCntctPntCntnt"]').val();


				// 필수입력항목 체크 
				if(item.getAttribute("mandatory") == "true") {


					if(targetVal == "") {
						mandatoryErrorItemNms += $(item).find("span").html() + ", ";
					}
				}


				// 이메일 입력형식 체크
				if($(item).parent().find('[cntnt-id="' + $(item).attr("cntnt-id") + '"]').find('[data-form-param="cntctMthdTpCd"]').val() == '03' && !CAPSF000That.isEmailValue(targetVal)) {
					emailIteErrormNms += $(item).find("span").html() + ", ";
				}
			});


			if(mandatoryErrorItemNms != "") {
				errorMsg = bxMsg("cbb_err_msg.AUICME0004") + "[" + mandatoryErrorItemNms.substring(0, mandatoryErrorItemNms.length - 2) + "]";
			}


			if(emailIteErrormNms != "") {
				if(errorMsg != null) errorMsg += "<br>";
				else errorMsg = "";


				errorMsg += bxMsg("cbb_err_msg.AUICME0006") + "[" + bxMsg("cbb_items.ABRVTN#email") + " " + bxMsg("cbb_items.ABRVTN#format") + "]" + "[" + emailIteErrormNms.substring(0, emailIteErrormNms.length - 2) + "]";
			}


			return errorMsg;
		},
		// get 특정연락처의 화면입력정보 
		getCntctPntDtlAddrCntnt : function(that, tblClassNm, cntctMthdTpCd) {
			var dtlCntntAddr = "";


			that.$el.find("." + tblClassNm).find("th").each(function(idx, item) {


				var cntntIdObj = $(item).parent().find('[cntnt-id="' + $(item).attr("cntnt-id") + '"]');
				var cntctMthdTpCdVal = cntntIdObj.find('[data-form-param="cntctMthdTpCd"]').val();


				if(cntctMthdTpCdVal == cntctMthdTpCd) {


					if(cntctMthdTpCd == "07" && cntntIdObj.find('[data-form-param="addrHrarcyCd"]').val() != "NA" && cntntIdObj.find('[data-form-param="addrCntnt"]').val() != "") {
						dtlCntntAddr = cntntIdObj.find('[data-form-param="addrCntnt"]').val() + cntntIdObj.find('[data-form-param="dtlCntctPntCntnt"]').val();
					}
					else {
						dtlCntntAddr = cntntIdObj.find('[data-form-param="dtlCntctPntCntnt"]').val();
					}
					return false;
				}
			});	


			return dtlCntntAddr;
		},
		// 이메일 입력형식 체크
		isEmailValue : function(targetVal) {
			if(targetVal != "") {
				var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z\s]{2,4}$/;
				return emailPattern.test(targetVal); 
			}
			else return true;
		}, 
		// 확장속성 입력값 set
		putXtnAtrbtParam : function(that, tblClassNm, actorXtnInflList) {


			// set extend attribute list
			if(actorXtnInflList == null || actorXtnInflList == undefined) {
				actorXtnInflList = new Array();
			}


            that.$el.find("." + tblClassNm).find("th").each(function(idx, item) {


            	var colIndexPerRow = Number(item.getAttribute("col-index-per-row"));
            	var dtlParam = new Object();
				dtlParam.xtnAtrbtNm = $(item).parent().find('[data-form-param="xtnAtrbtNm"]').eq(colIndexPerRow).val();
				dtlParam.actorDscd = $(item).parent().find('[data-form-param="actorDsCd"]').eq(colIndexPerRow).val();


				// 날짜 입력항목인 경우 
				if(item.getAttribute("atrbt-tp") == "TD") {
					dtlParam.xtnAtrbtCntnt = $(item).parent().find('[data-form-param="xtnAtrbtCntnt"]').eq(colIndexPerRow).val().replace(/\-/g, "");
				}
				// 여부 입력항목인 경우 
				else if(item.getAttribute("atrbt-tp") == "YN") {
					var isChecked = $(item).parent().find('[data-form-param="xtnAtrbtCntnt"]').eq(colIndexPerRow).prop("checked");


					if(isChecked) {
						dtlParam.xtnAtrbtCntnt = "Y";
					}
					else {
						dtlParam.xtnAtrbtCntnt = "N";
					}
				}
				else {
					dtlParam.xtnAtrbtCntnt = $(item).parent().find('[data-form-param="xtnAtrbtCntnt"]').eq(colIndexPerRow).val();
				}                
				actorXtnInflList.push(dtlParam);	
			});				
			return actorXtnInflList;
		},
		// 연락처정보 입력값 set
		putCntctPntParam : function(that, tblClassNm, printCntctPrhbtnTpYn, setCntctPntSeqNbrYn) {


			// set extend attribute list
            var cntctPntIndex = new Array();


            that.$el.find("." + tblClassNm).find("th").each(function(idx, item) {


            	var cntntIdObjs = $(item).parent().find('[cntnt-id="' + $(item).attr("cntnt-id") + '"]');


            	if(cntntIdObjs.find('[data-form-param="dtlCntctPntCntnt"]').val() != "") {
	            	var dtlParam = new Object();
	            	dtlParam.cntctMthdTpCd = cntntIdObjs.find('[data-form-param="cntctMthdTpCd"]').val();
					dtlParam.cntctPntTpCd = cntntIdObjs.find('[data-form-param="cntctPntTpCd"]').val();
					dtlParam.cntctPntSupplInfoCntnt = cntntIdObjs.find('[data-form-param="cntctPntSupplInfoCntnt"]').val();
					if(dtlParam.cntctMthdTpCd == "07") dtlParam.addrHrarcyCd = cntntIdObjs.find('[data-form-param="addrHrarcyCd"]').val();
					dtlParam.addrId = cntntIdObjs.find('[data-form-param="addrId"]').val();
					dtlParam.telecomcarrId = cntntIdObjs.find('[data-form-param="telecomcarrId"]').val();
					if(printCntctPrhbtnTpYn != "N") dtlParam.cntctPrhbtnTpCd = cntntIdObjs.find('[data-form-param="cntctPrhbtnTpCd"]').val();
					dtlParam.dtlCntctPntCntnt = cntntIdObjs.find('[data-form-param="dtlCntctPntCntnt"]').val();	
					dtlParam.authYn = cntntIdObjs.find('[data-form-param="authYn"]').val();


					if(setCntctPntSeqNbrYn == "Y") dtlParam.cntctPntSeqNbr = cntntIdObjs.find('[data-form-param="cntctPntSeqNbr"]').val();


	            	cntctPntIndex.push(dtlParam);	
            	}
            	else if(setCntctPntSeqNbrYn == "Y" && cntntIdObjs.find('[data-form-param="cntctPntSeqNbr"]').val() != "") {
            		var dtlParam = new Object();
            		dtlParam.cntctPntSeqNbr = cntntIdObjs.find('[data-form-param="cntctPntSeqNbr"]').val();


            		cntctPntIndex.push(dtlParam);
            	}
			});				
			return cntctPntIndex;
		},		
		// 확장속성 변경 시 실행
		changeXtnAtrbtCntnt : function(that, tblClassNm, e) {


			var marriageDtObj = that.$el.find("." + tblClassNm).find('.marriageDt-wrap').find("input");
			var marriageTpCdObj = that.$el.find("." + tblClassNm).find('.marriageTpCd-wrap').find("select");


			var arrXtnAtrbtNmObj = [];
			arrXtnAtrbtNmObj = that.$el.find('[data-form-param="xtnAtrbtNm"]');		//확장속성 이름들(배열). hidden처리 되어 있음.최영은 추가
			// 20160226  박경지 결혼여부로 자녀수 확인
			//var childrenCntObj = that.$el.find("." +  tblClassNm).find('.childrenCnt-wrap').find("input");


			if(marriageDtObj != undefined && marriageDtObj.length > 0 &&
					marriageTpCdObj != undefined && marriageTpCdObj.length > 0) {		//결혼 일자 객체와 타입 객체를 생성한 것임. 값 입력된 상태는 아님.
				// 결혼여부를 기혼이 아닌 다른 값으로 선택한 경우 결혼일자 입력 불가
				// 20160226 박경지  자녀수도 입력 불가능하게 변경 추가								
				if($(e.currentTarget).parent().parent().attr("class") == "marriageTpCd-wrap") {


					if($(e.currentTarget).val() == "2") {		//결혼인 경우(값 = 2)


						marriageDtObj.attr("readonly", false); 	//결혼한 경우, 결혼 기념일 입력 가능.


						/*marriageDtObj.attr("readonly", false);
						childrenCntObj.attr("readonly", false);
*/
					}
					else {										//미혼인 경우(값 = 1)


						marriageDtObj.val("");					//결혼 일자 clear.


						//marriageDtObj.attr("readonly", true); 	


						console.log(arrXtnAtrbtNmObj.length);


						for(var i = 0; i < arrXtnAtrbtNmObj.length; i++){


							console.log(arrXtnAtrbtNmObj[i]);


							if(arrXtnAtrbtNmObj[i] == 'childrenCnt'){	//속성이름이 '자녀수'인 객체를 찾아서
								arrXtnAtrbtNmObj[i].parent().find('[data-form-param="xtnAtrbtCntnt"]').prop("disabled", true);	//자녀수 입력하지 못하게 함. 최영은 추가


							}


						}


																		//that.$el.find('[data-form-param="xtnAtrbtCntnt"]').prop("disabled", true);	


/*						marriageDtObj.attr("readonly", true);


						childrenCntObj.val("");
						childrenCntObj.attr("readonly", true);
*/
					}
				}
				// 결혼여부를 기혼이 아닌 다른 값으로 선택한 경우 결혼일자 입력 불가 
				else if($(e.currentTarget).parent().parent().attr("class") == "marriageDt-wrap") {


					if(marriageTpCdObj.val() != "2") {
						$(e.currentTarget).val("");
						$(e.currentTarget).attr("readonly", true); 
					}
				}	
			}
		},
		// 확장속성 변경 시 실행
		clickXtnAtrbtCntnt : function(that, tblClassNm, e) {


			var marriageDtObj = that.$el.find("." + tblClassNm).find('.marriageDt-wrap').find("input");
			var marriageTpCdObj = that.$el.find("." + tblClassNm).find('.marriageTpCd-wrap').find("select");


			if(marriageDtObj != undefined && marriageDtObj.length > 0 &&
					marriageTpCdObj != undefined && marriageTpCdObj.length > 0) {


				// 결혼여부를 기혼이 아닌 다른 값으로 선택한 경우 결혼일자 입력 불가 
				if($(e.currentTarget).parent().parent().attr("class") == "marriageDt-wrap") {


					if(marriageTpCdObj.val() != "2") {
						$(e.currentTarget).val("");
						$(e.currentTarget).attr("readonly", true); 
					}
				}
			}					
		},
		// 확장속성정보 출력
		setXtnAtrbtInfo : function(that, tblClassNm, xtnInfoList) {
			var CAPSF000That = this;


			$(xtnInfoList).each(function (idx, item) {


				var xtnAtrbtNmObj = that.$el.find("." + tblClassNm).find('[data-form-param="xtnAtrbtNm"]').filter('[value="' + item.xtnAtrbtNm + '"]');
				var xtnAtrbtCntntWrap = that.$el.find("." + tblClassNm).find('.' + item.xtnAtrbtNm + '-wrap');
				var xtnAtrbtCntntObj = null;


				if(xtnAtrbtCntntWrap != null && xtnAtrbtCntntWrap != undefined && xtnAtrbtCntntWrap.length > 0) {
					xtnAtrbtCntntObj = xtnAtrbtCntntWrap.find("input");
				}


				if(xtnAtrbtNmObj != undefined && xtnAtrbtNmObj.length > 0) {


					if(item.xtnAtrbtCntnt == null || item.xtnAtrbtCntnt == undefined || item.xtnAtrbtCntnt == "null") {
						item.xtnAtrbtCntnt = "";
					}


					var clTreeListObj = $(xtnAtrbtNmObj).parent().find('[data-form-param="clTreeListId"]');
					var datePickerView = that.subViews[item.xtnAtrbtNm + 'DatePicker'];


					if(datePickerView != null && datePickerView != undefined) {
						datePickerView.setValue(item.xtnAtrbtCntnt);
					}
					else if(clTreeListObj != undefined && clTreeListObj.length == 1) {
						CAPSF000That.setClNm(item.xtnAtrbtCntnt, $(xtnAtrbtNmObj).parent().find('[data-form-param="xtnAtrbtCntntInfo"]'), clTreeListObj.val());
						xtnAtrbtNmObj.parent().find('[data-form-param="xtnAtrbtCntnt"]').val(item.xtnAtrbtCntnt);
					}
					else if(xtnAtrbtCntntObj != null && xtnAtrbtCntntObj.attr("type") == "checkbox") {


						if(item.xtnAtrbtCntnt == "Y") {
							xtnAtrbtCntntObj.attr("checked", true);
							xtnAtrbtCntntObj.prop("checked", "checked");
						}
						else {
							xtnAtrbtCntntObj.attr("checked", false);
							xtnAtrbtCntntObj.prop("checked", "");
						}
					}
					else {
						xtnAtrbtNmObj.parent().find('[data-form-param="xtnAtrbtCntnt"]').val(item.xtnAtrbtCntnt);
					}
				}
			}); 
		},
		// 확장정보의 변경정보 set
		setXtnAtrbtChangeInfo : function(that, tblClassNm, param, xtnInfoList) {
			var CAPSF000That = this;
			var xtnAtrbtNmObjs = that.$el.find("." + tblClassNm).find('[data-form-param="xtnAtrbtNm"]');
			var xtnAtrbtCntntObjs = that.$el.find("." + tblClassNm).find('[data-form-param="xtnAtrbtCntnt"]');


			that.$el.find("." + tblClassNm).find('th').each(function(objIdx, item) {
				var colIndexPerRow = Number(item.getAttribute("col-index-per-row"));
				var dParam = new Object();
				var atrbtNm = xtnAtrbtNmObjs.eq(objIdx).val();


				dParam.headerName = bxMsg('cbb_items.AT#' + atrbtNm);
				dParam.afValue = "";
				dParam.bfValue = "";


				// 날짜 형식인 경우 
				if(item.getAttribute("atrbt-tp") == "TD") {
					dParam.afValue = xtnAtrbtCntntObjs.eq(objIdx).val();
				}
				else if(xtnAtrbtCntntObjs.eq(objIdx).prop("tagName") == "SELECT") {
					dParam.afValue = xtnAtrbtCntntObjs.eq(objIdx).find("option:selected").text();
				}
				else if(xtnAtrbtCntntObjs.eq(objIdx).attr("type") == "checkbox") {
					dParam.afValue = ((xtnAtrbtCntntObjs.eq(objIdx).prop("checked") == "checked" || xtnAtrbtCntntObjs.eq(objIdx).prop("checked") == true)  ? "Y" : "N");
				}
				else {


					var xtnAtrbtCntntInfoObj = xtnAtrbtCntntObjs.eq(objIdx).parent().find('[data-form-param="xtnAtrbtCntntInfo"]');


					if(xtnAtrbtCntntInfoObj != undefined && xtnAtrbtCntntInfoObj.length > 0) {
						dParam.afValue = xtnAtrbtCntntInfoObj.val(); 
					}
					else {
						dParam.afValue = xtnAtrbtCntntObjs.eq(objIdx).val(); 
					}
				}


				$(xtnInfoList).each(function (idx, xtnInfoItem) {
					if(xtnInfoItem.xtnAtrbtNm == atrbtNm) {


						if(xtnAtrbtCntntObjs.eq(objIdx).prop("tagName") == "SELECT") {
							dParam.bfValue = xtnAtrbtCntntObjs.eq(objIdx).find("option[value='" + xtnInfoItem.xtnAtrbtCntnt + "']").text();
						}
						else if(item.getAttribute("atrbt-tp") == "TD" && xtnInfoItem.xtnAtrbtCntnt != null && xtnInfoItem.xtnAtrbtCntnt != "") {
							dParam.bfValue = XDate(xtnInfoItem.xtnAtrbtCntnt).toString('yyyy-MM-dd');
						}
						else {


							var clTreeListIdObj = xtnAtrbtCntntObjs.eq(objIdx).parent().find('[data-form-param="clTreeListId"]');


							if(clTreeListIdObj != undefined && clTreeListIdObj.length > 0) {


								var clTreeList = CAPSF000That.clTreeList[clTreeListIdObj.val()];
								var clNm = CAPSF000That.getClNmByClId(xtnInfoItem.xtnAtrbtCntnt, clTreeList);


								if(clNm == null) clNm = "";


								dParam.bfValue = xtnInfoItem.xtnAtrbtCntnt + " " + clNm;
							}
							else {
								dParam.bfValue = xtnInfoItem.xtnAtrbtCntnt;
							}
						}
						return false;
					}
				});  


				param.push(dParam); 				
			});
			return param;
		},
		// 연락처정보 출력
		setCntctPntInfo : function(srcnParam, that, tblClassNm, cntctPntInfoList) {
			var CAPSF000That = this;


            that.$el.find("." + tblClassNm).find("th").each(function(idx, item) {


            	var cntntIdObjs = $(item).parent().find('[cntnt-id="' + $(item).attr("cntnt-id") + '"]');
            	cntntIdObjs.find('[data-form-param="cntctPntSeqNbr"]').val("");
				cntntIdObjs.find('[data-form-param="authYn"]').val("");
				cntntIdObjs.find('[data-form-param="addrId"]').val("");
				cntntIdObjs.find('[data-form-param="cntctPntSupplInfoCntnt"]').val("");
				cntntIdObjs.find('[data-form-param="telecomcarrId"]').val("");  
				cntntIdObjs.find('[data-form-param="addrCntnt"]').val("");
				cntntIdObjs.find('[data-form-param="dtlCntctPntCntnt"]').val("");
				cntntIdObjs.find('[data-form-param="cntctPrhbtnTpCd"]').find("option:eq(0)").attr("selected", true);


				$(cntctPntInfoList).each(function (dataIdx, cntctInfoItem) {
					if(cntctInfoItem.cntctMthdTpCd == cntntIdObjs.find('[data-form-param="cntctMthdTpCd"]').val() &&
							cntctInfoItem.cntctPntTpCd == cntntIdObjs.find('[data-form-param="cntctPntTpCd"]').val()) {


						cntntIdObjs.find('[data-form-param="cntctPntSeqNbr"]').val(cntctInfoItem.cntctPntSeqNbr);
						cntntIdObjs.find('[data-form-param="authYn"]').val(cntctInfoItem.authYn);
						cntntIdObjs.find('[data-form-param="addrId"]').val(cntctInfoItem.addrId);
						cntntIdObjs.find('[data-form-param="cntctPntSupplInfoCntnt"]').val(cntctInfoItem.cntctPntSupplInfoCntnt);
						cntntIdObjs.find('[data-form-param="telecomcarrId"]').val(cntctInfoItem.telecomcarrId);


						if(cntntIdObjs.find('[data-form-param="cntctMthdTpCd"]').val() == "07" && cntntIdObjs.find('[data-form-param="addrHrarcyCd"]').val() != "NA") {
							cntntIdObjs.find('[data-form-param="addrCntnt"]').val(cntctInfoItem.addrCntnt);
							cntntIdObjs.find('[data-form-param="dtlCntctPntCntnt"]').val(cntctInfoItem.dtlCntctPntCntnt);
						}
						else {
							cntntIdObjs.find('[data-form-param="dtlCntctPntCntnt"]').val(cntctInfoItem.dtlCntctPntCntnt)
						}


						if(srcnParam.printCntctPrhbtnTpYn != "N") {
							cntntIdObjs.find('[data-form-param="cntctPrhbtnTpCd"]').val(cntctInfoItem.cntctPrhbtnTpCd);


							// 연락처정보가 입력된 경우 연락허용선택박스를 선택가능하도록 변경 
							if(cntctInfoItem.dtlCntctPntCntnt != null && cntctInfoItem.dtlCntctPntCntnt != "") {
								cntntIdObjs.find('[data-form-param="cntctPrhbtnTpCd"]').attr("disabled", false);
							}
						}


						// 인증버튼 활성화 
						if(cntctInfoItem.dtlCntctPntCntnt != null && cntctInfoItem.dtlCntctPntCntnt != "") {
							cntntIdObjs.find(".cntctPnt-auth-btn").attr("disabled", false);
						}


						// 인증정보 결과정보 출력
						if(cntctInfoItem.authYn == "Y") {
							CAPSF000That.setCntctAuthSuccessInfo(cntntIdObjs);
						}


						return false;
					}
				});  					
			});
		},		
		// 연락처의 변경정보 set
		setCntctPntChangeInfo : function(srcnParam, that, tblClassNm, param, cntctPntInfoList) {


			// set extend attribute list
            var cntctPntIndex = new Array();


            that.$el.find("." + tblClassNm).find("th").each(function(idx, item) {


            	var cntntIdObjs = $(item).parent().find('[cntnt-id="' + $(item).attr("cntnt-id") + '"]');
            	var dParam = new Object();


				dParam.headerName = $(item).find("span").html();
				dParam.afValue = "";
				dParam.bfValue = "";


				if(cntntIdObjs.find('[data-form-param="cntctMthdTpCd"]').val() == "07" && cntntIdObjs.find('[data-form-param="addrHrarcyCd"]').val() != "NA") {
					dParam.afValue = cntntIdObjs.find('[data-form-param="addrCntnt"]').val() + 
									" " + cntntIdObjs.find('[data-form-param="dtlCntctPntCntnt"]').val();
				}
				else {
					dParam.afValue = cntntIdObjs.find('[data-form-param="dtlCntctPntCntnt"]').val(); 
				}


				if(srcnParam.printCntctPrhbtnTpYn != "N" && dParam.afValue != "") {
					dParam.afValue += " (" + cntntIdObjs.find('[data-form-param="cntctPrhbtnTpCd"]').find("option:selected").text() + ")";
				} 


				if(dParam.afValue != "" && cntntIdObjs.find('[data-form-param="authYn"]').val() == "Y") {
					dParam.afValue +=  " (" + bxMsg('cbb_items.SCRNITM#authentication') + ")"; 
				}


				$(cntctPntInfoList).each(function (dataIdx, cntctInfoItem) {
					if(cntctInfoItem.cntctMthdTpCd == cntntIdObjs.find('[data-form-param="cntctMthdTpCd"]').val() &&
							cntctInfoItem.cntctPntTpCd == cntntIdObjs.find('[data-form-param="cntctPntTpCd"]').val()) {


						if(cntntIdObjs.find('[data-form-param="cntctMthdTpCd"]').val() == "07" && cntntIdObjs.find('[data-form-param="addrHrarcyCd"]').val() != "NA") {
							dParam.bfValue = cntctInfoItem.addrCntnt + 
											" " + cntctInfoItem.dtlCntctPntCntnt;  


						}
						else {
							dParam.bfValue = cntctInfoItem.dtlCntctPntCntnt; 


						}


						if(srcnParam.printCntctPrhbtnTpYn != "N" && dParam.bfValue != "") {
							var cntctPrhbtTpStoreIndex = comboStore1.findExact('cd', cntctInfoItem.cntctPrhbtnTpCd);
							var cntctPrhbtTpCdCntnt = (cntctPrhbtTpStoreIndex != -1 ? comboStore1.getAt(cntctPrhbtTpStoreIndex).data.cd + " " + comboStore1.getAt(cntctPrhbtTpStoreIndex).data.cdNm : cntctInfoItem.cntctPrhbtnTpCd);


							dParam.bfValue +=  " (" + cntctPrhbtTpCdCntnt + ")"; 
						}


						if(dParam.bfValue != "" && cntctInfoItem.authYn == "Y") {
							dParam.bfValue +=  " (" + bxMsg('cbb_items.SCRNITM#authentication') + ")"; 
						}
						return false;
					}
				});  				
				param.push(dParam); 					
			});


			return param;
		},
		// 연락처인증정보 clear
		resetCntctAuthInfo : function(that, tblClassNm) {


			that.$el.find("." + tblClassNm).find("[data-form-param=authYn]").val("N");
			that.$el.find("." + tblClassNm).find(".authRslt-wrap").html("");
			that.$el.find("." + tblClassNm).find(".cntctPnt-auth-btn").attr("disabled", true);


		}, 
        /* 콤보박스 그리기 */
        setActorComboBase : function(sParam, that, selectStyle, fn, dataStore) {


            var sectionArea = $(document.createElement('section'));
            sectionArea.addClass("bx-combo-box-wrap");


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


            var selectedOption = null;


            dataStore.each(function (item) {
                var optionText = item.get("cdNm");
                var option = $(document.createElement('option')).val(item.get("cd")).text(optionText);


                if (sParam.viewType) {
                    if (sParam.viewType == "ValNm") {
                        option = $(document.createElement('option')).val(item.get("cd")).text(item.get("cd") + " " + optionText);
                    }
                    else if (sParam.viewType == "val") {
                        option = $(document.createElement('option')).val(item.get("cd")).text(item.get("cd"));
                    }
                }


                if(item.get("cd") == sParam.selectVal) {
                	selectedOption = option;
                }


                selectArea.append(option);
            });
            sectionArea.html(selectArea);


            var areaObj = null;


            if(sParam.className != null && sParam.className != undefined) {
            	areaObj = that.$el.find("." + Param.className);
            }
            else if(sParam.areaObj) {
            	areaObj = sParam.areaObj;
            }


            if(areaObj) {
            	areaObj.html(sectionArea);
            }


            if (selectedOption) {
            	selectedOption.attr('selected', true);
            }


            typeof fn === 'function' && fn();
        }
	};


	return CAPSF000;
});
