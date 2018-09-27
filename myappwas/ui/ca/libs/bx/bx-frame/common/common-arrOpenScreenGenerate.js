define(
	[
		'bx/common/config'
		, 'bx-component/message/message-alert'
		, 'bx-component/message/message-confirm'
		, 'bx-component/date-picker/_date-picker'
		, 'bx/common/common-info'
        , 'bx/common/common-arrUIGenerate'

	]
	, function(
		config
		, alertMessage
		, confirmMessage
		, DatePicker
	) {
		var instCd;

		//상품조건조회
		fn_arrOpenScreenGenerate = function (inParam,format,thatDiv,rltdThatDiv) {
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
			
			var linkData = {"header": fn_getHeader(serviceCd), "ArrOpnScrnIn": param};

			//ajax 호출
			bxProxy.post(sUrl, JSON.stringify(linkData), {
				enableLoading: true,
				success: function (data) {
					if(fn_commonChekResult(data)) {
						// 모계약상품조건 출력
						fn_generateUIWithData(data, format, thatDiv);

						// 자동생성계약의 상품조건 출력
						if(rltdThatDiv != undefined && rltdThatDiv != null && data.ArrOpnScrnOut.arrStrctrRltdPdList) {
							fn_rltdPdArrOpenScreenGenerate(inParam, format, rltdThatDiv, data.ArrOpnScrnOut.arrStrctrRltdPdList, data.ArrOpnScrnOut.arrStrctrRelList);
						}
					}
				}
			});
		};
		
		/**
		 * 자동생성계약의상품조건 출력 
		 */
		fn_rltdPdArrOpenScreenGenerate = function (inParam, format, thatDiv, rltdPdList, motherArrStrctrRelList) {
			
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
					var linkData = {"header": fn_getHeader(serviceCd), "ArrOpnScrnIn": param};

					//ajax 호출
					bxProxy.post(sUrl, JSON.stringify(linkData), {
						enableLoading: true,
						success: function (data) {
							if(fn_commonChekResult(data)) {
								
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
								
								// 자동생성계약정보 화면에 출력 
								$(thatDiv).append("<div id='rltdPdArr_" + rltdData.pdCd + "' class='rltdPdArrIndvArea'><span width='100%'><hr></span><b>" + rltdData.pdNm + "</b></div>");
								var rltdPdArrDiv = $(thatDiv).find('#rltdPdArr_' + rltdData.pdCd);
								fn_generateUIWithData(data, format, rltdPdArrDiv);
								
								// 모계약과 자동생성계약에서 중복된 관계목록을 hidden으로 append
								$(dupRelDataList).each(function (dupRelIdx, dupRelData) {
									$(rltdPdArrDiv).append("<input type='hidden' name='dupArrRelKndCd' value='" + dupRelData.arrRelKndCd + "'>");
								});	
								
								// 화면에 출력되는 입력항목이 없는 경우 자동생성계약의 정보 숨김
								if($(thatDiv).find('input:visible').length + $(thatDiv).find('select:visible').length == 0) {
									$(rltdPdArrDiv).hide();
								}
							}
						}
					});
				});  
			}
		};
		
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

	}, // end of define function


	//신규입력값가져오기
	fn_arrOpenInputGenerate = function (thatDiv, rltdThatDiv) {
		var arrInputGrmerateData = fn_getArrInputGenerate(thatDiv); // 모계약및자계약정보 get
		
		// 자동생성계약정보 get 
		if(rltdThatDiv != undefined && rltdThatDiv != null) {
			var rltdArrIndvAreas = $(rltdThatDiv).find(".rltdPdArrIndvArea");
            var relation = new Array();
            	
            $(rltdArrIndvAreas).each(function (idx, data) {
            	var rltdPdArrOpenInputData = fn_arrOpenInputGenerate (data);
            	
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

);  // end of define