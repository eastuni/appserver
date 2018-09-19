/**
 * Created by parkbeomsoo on 2016. 5. 31..
 */



const angular = require('angular');

const md = require('./common.module');

md.service('$commonArrOpenScreen', __service);

function __service($commonService, $commonProxy, $commonUiGenerator){
    return {
		//상품조건조회
		fn_arrOpenScreenGenerate : function (inParam, format, thatDiv, rltdThatDiv, $compile, $scope, callback, order) {
			
			console.log("fn_arrOpenScreenGenerate");
			
			var param = {};
			var that = this;
			
			var serviceCd = "CAPAR0208400";
	        param.instCd = inParam.instCd;

			if (inParam.pdCd == "membershipPd"){
				serviceCd = "PAR0208401";
			} else {
				param.pdCd = inParam.pdCd;
				param.baseDt = inParam.baseDt;
				param.arrStrctrQryCd = inParam.arrStrctrQryCd;
			}
			
			var linkData = {"header": $commonService.fn_getHeader(serviceCd), "ArrOpnScrnIn": param};

			//ajax 호출
   			$commonProxy.fn_callAsyncSvc(sUrl, linkData, {
				enableLoading: true,
				success: function (data) {
					
					//console.log("PAR0208401 : " + data);
					/* 관계 SKIP */
					var tmpRelList = {};
					var arrStrctrRelList = data.ArrOpnScrnOut.arrStrctrRelList;
					
					/* 초기화 */
					data.ArrOpnScrnOut.arrStrctrRelList = [];
					
					for (var i=0; i<arrStrctrRelList.length; i++) {
						if (arrStrctrRelList[i].arrRelCd == "036" ||
							arrStrctrRelList[i].arrRelCd == "037" ||
							arrStrctrRelList[i].arrRelCd == "038"){
							//SKIP(036:설정계약)은 내부계약관계로 처리 화면 입력값 아님
							//SKIP(037:심사계약)은 내부계약관계로 처리 화면 입력값 아님
							//SKIP(038:변경심사원천계약)은 내부계약관계로 처리 화면 입력값 아님
						} else {
							tmpRelList = arrStrctrRelList[i];
							data.ArrOpnScrnOut.arrStrctrRelList.push(tmpRelList);
						}
					}
					
					console.log("test : " +data.ArrOpnScrnOut.arrStrctrRelList);
					
					/* 조건순서정렬 */
					if (order != null) {
						var tmpCndList = {};
						var arrStrctrCndList = data.ArrOpnScrnOut.arrStrctrCndList;
						//var tmpArrStrctrCnd = {};
						//var tmpArrStrctrCndList = [];
						
						/* 초기화 */
						data.ArrOpnScrnOut.arrStrctrCndList = [];
						
						for (var i=0; i<order.length; i++) {
							for (var j=0; j<arrStrctrCndList.length; j++) {
								
								//tmpArrStrctrCnd = arrStrctrCndList[j];
								
								if (order[i] == arrStrctrCndList[j].cndCd) {
									tmpCndList = arrStrctrCndList[j];
									data.ArrOpnScrnOut.arrStrctrCndList.push(tmpCndList);
									
									//arrStrctrCndList[j].cndCd = null;
									break;
								}
							}
						}
						
						console.log("arrStrctrCndList : " +arrStrctrCndList);
						
						var chk = "N";
						for (var i=0; i<arrStrctrCndList.length; i++) {
							chk = "N";
							for (var j=0; j<data.ArrOpnScrnOut.arrStrctrCndList.length; j++) {
								if (arrStrctrCndList[i].cndCd == data.ArrOpnScrnOut.arrStrctrCndList[j].cndCd) {
									chk = "Y";
									break;
								}
							}
							if (chk == "N") {
								tmpCndList = arrStrctrCndList[i];
								data.ArrOpnScrnOut.arrStrctrCndList.push(tmpCndList);
							}
						}
						
						console.log("cndList : " +data.ArrOpnScrnOut.arrStrctrCndList);
					}
					
					// 모계약상품조건 출력
					var gDiv = $commonUiGenerator.fn_generateUIWithData(data, format, thatDiv);
					$compile(gDiv)($scope);
					// 자동생성계약의 상품조건 출력
					if(rltdThatDiv != undefined && rltdThatDiv != null && data.ArrOpnScrnOut.arrStrctrRltdPdList) {
						this.fn_rltdPdArrOpenScreenGenerate(inParam, format, rltdThatDiv, data.ArrOpnScrnOut.arrStrctrRltdPdList, data.ArrOpnScrnOut.arrStrctrRelList);
					}
					
					//@@@@@@
					thatDiv.find('.datePicker').each(function(idx, element) {
		        		$commonService.fn_makeDatePicker(element, '', null, function(date) {});
		        	});
					
					typeof callback === 'function' && callback();
				}
			});
		},
		
		//서비스 조회 내용을 파라미터로 받아 화면생성
		fn_arrOpenScreenGenerateByServiceOutput : function (serviceOutput, format, thatDiv, rltdThatDiv, $compile, $scope, callback, order) {
			
			/* 관계 SKIP */
			var tmpRelList = {};
			var arrStrctrRelList = serviceOutput.ArrOpnScrnOut.arrStrctrRelList;
			
			/* 초기화 */
			serviceOutput.ArrOpnScrnOut.arrStrctrRelList = [];
			
			for (var i=0; i<arrStrctrRelList.length; i++) {
				if (arrStrctrRelList[i].arrRelCd == "036"){
					//SKIP(036:설정계약)은 내부계약관계로 처리 화면 입력값 아님
				} else {
					tmpRelList = arrStrctrRelList[i];
					serviceOutput.ArrOpnScrnOut.arrStrctrRelList.push(tmpRelList);
				}
			} 
			
			console.log("test : " +serviceOutput.ArrOpnScrnOut.arrStrctrRelList);
			
			/*계약 구조*/
			var arrStrctrCndList = serviceOutput.ArrOpnScrnOut.arrStrctrCndList;
			
			serviceOutput.ArrOpnScrnOut.arrStrctrCndList = [];
			
			$(arrStrctrCndList).each(function(idx, item){
				//계약조건이어야만 목록에 추가
				if(item.cndValDcsnLvlCd == "02"){
					serviceOutput.ArrOpnScrnOut.arrStrctrCndList.push(item);
				}
			});

			// 모계약상품조건 출력
			var gDiv = $commonUiGenerator.fn_generateUIWithData(serviceOutput, format, thatDiv);
			$compile(gDiv)($scope);
			
			//@@@@@@
			thatDiv.find('.datePicker').each(function(idx, element) {
        		$commonService.fn_makeDatePicker(element, '', null, function(date) {});
        	});
			
			typeof callback === 'function' && callback();
		},
		
		/**
		 * 자동생성계약의상품조건 출력 
		 */
		fn_rltdPdArrOpenScreenGenerate : function (inParam, format, thatDiv, rltdPdList, motherArrStrctrRelList) {
			
			if(rltdPdList && rltdPdList.length > 0) {
				var that = this;
				var serviceCd = "CAPAR0208400";
				var param = {};
				if(inParam.instCd) param.instCd = inParam.instCd;
				if(inParam.baseDt) param.baseDt = inParam.baseDt;
				if(inParam.arrStrctrQryCd) param.arrStrctrQryCd = inParam.arrStrctrQryCd;
		        
				// 자동생성계약상품조건 출력 
				$(rltdPdList).each(function (idx, rltdData) {
					
					param.pdCd = rltdData.pdCd;	// 상품코드 
					var linkData = {"header": $commonService.fn_getHeader(serviceCd), "ArrOpnScrnIn": param};

					//ajax 호출
		   			$commonProxy.fn_callAsyncSvc(sUrl, linkData, {
						enableLoading: true,
						success: function (data) {
							
							console.log("data : " + data);
							
							var rltdRelDataList = new Array(); // 자동생성계약에만 있는 관계목록
							var dupRelDataList = new Array();  // 모계약과 자동생성계약에서 중복되는 관계목록 
							
							// 모계약의 관계목록과 중복되는 관계정보가 있는 경우 화면에 보이지 않게 처리하기 위해 관계목록 분리 
							$(data.ArrOpnScrnOut.arrStrctrRelList).each(function (rltdRelIdx, rltdRelData) {
								
								var isDupRelData = false;
								
								$(motherArrStrctrRelList).each(function (motherRelIdx, motherRelData) {
									if(motherRelData.arrRelKndCd == rltdRelData.arrRelKndCd) {
										isDupRelData = true;
										dupRelDataList.push(rltdRelData);
										return false;
									}
								});
								
								if(!isDupRelData) {
									rltdRelDataList.push(rltdRelData);
								}
							});
							
							data.ArrOpnScrnOut.arrStrctrRelList = rltdRelDataList;
							
							console.log("rltdRelDataList : " + rltdRelDataList);
							
							// 자동생성계약정보 화면에 출력 
							$(thatDiv).append("<div id='rltdPdArr_" + rltdData.pdCd + "' class='rltdPdArrIndvArea'><span width='100%'><hr></span><b>" + rltdData.pdNm + "</b></div>");
							var rltdPdArrDiv = $(thatDiv).find('#rltdPdArr_' + rltdData.pdCd);
							$commonUiGenerator.fn_generateUIWithData(data, format, rltdPdArrDiv);
							
							// 모계약과 자동생성계약에서 중복된 관계목록을 hidden으로 append
							$(dupRelDataList).each(function (dupRelIdx, dupRelData) {
								$(rltdPdArrDiv).append("<input type='hidden' name='dupArrRelKndCd' value='" + dupRelData.arrRelKndCd + "'>");
							});	
							
							// 화면에 출력되는 입력항목이 없는 경우 자동생성계약의 정보 숨김
							if($(thatDiv).find('input:visible').length + $(thatDiv).find('select:visible').length == 0) {
								$(rltdPdArrDiv).hide();
							}
						}
					});
				});  
			}
		},
/*		
		fn_datepicker  : function(tbXtnList, that) {

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
		},
*/
		//신규입력값가져오기
		fn_arrOpenInputGenerate : function (thatDiv, rltdThatDiv) {
			var that = this;
			
			console.log("thatDiv : " + thatDiv);
			
			var arrInputGrmerateData = $commonUiGenerator.fn_getArrInputGenerate(thatDiv); // 모계약및자계약정보 get
			
			console.log("fn_arrOpenInputGenerate : " + arrInputGrmerateData);
			
			// 자동생성계약정보 get 
			if(rltdThatDiv != undefined && rltdThatDiv != null) {
				var rltdArrIndvAreas = $(rltdThatDiv).find(".rltdPdArrIndvArea");
	            var relation = new Array();
	            	
	            $(rltdArrIndvAreas).each(function (idx, data) {
	            	var rltdPdArrOpenInputData = that.fn_arrOpenInputGenerate(data);
	            	
	            	console.log(rltdPdArrOpenInputData);
	            	
	            	// 자동생성계약과 모계약의 관계목록 중 중복되어 화면에서 입력받지 않은 항목에 대해 입력데이터 추가처리 
	            	$(data).find("input[name='dupArrRelKndCd']").each(function (dupRelIdx, dupRelData) {
	            		$(arrInputGrmerateData.main.relList).each(function (mainRelIdx, mainRelData) {
	            			if(mainRelData.arrRelKndCd == $(dupRelData).val()) {
	            				rltdPdArrOpenInputData.main.relList.push(mainRelData);
	            				return false;
	            			}
	            		});            		
	            	});
	            	
	            	relation.push(rltdPdArrOpenInputData.main);
	            });
	            arrInputGrmerateData.relation = relation;
			}
			return arrInputGrmerateData;
		}

        
    } // end return
} // end function