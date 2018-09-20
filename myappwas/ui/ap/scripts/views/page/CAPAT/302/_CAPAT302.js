define(
		[ 'bx/common/config', 
		  'bx/common/common-info',
	 	  'text!app/views/page/CAPAT/302/_CAPAT302.html', 
	 	 ],


function(config, commonInfo, tpl) {


	var CAPAT302BaseView = Backbone.View
			.extend({
				tagName : 'section',
				className : 'bx-container CAPAT302-page',
				templates : {
					'tpl' : tpl
				},
				events : {
					'click .CAPAT302-efctvTm-save-btn' : 'saveCAPAT302', //유효시간 저장
					'click .CAPAT302-loinPswd-save-btn' : 'saveCAPAT302', //로그인 비밀번호 저장
					'click .CAPAT302-txPswd-save-btn' : 'saveCAPAT302', //거래 비밀번호 저장
					'click .CAPAT302-scrtyQstn-save-btn' : 'saveCAPAT302', //보안질문 답 저장
					'click .CAPAT302-smsAuth-save-btn' : 'saveCAPAT302', //SMS 인증 저장
					'click .CAPAT302-othrScrty-save-btn' : 'saveCAPAT302', //기타 보안 저장
					'click .CAPAT302-loinBsicInfo-save-btn' : 'saveCAPAT302', //기타 보안 저장


					'click #btn-efctvTm-toggle' : 'popEfctvTmLayerCtrl', //유효시간 영역접기
					'click #btn-loinPswd-toggle' : 'popLoinPswdLayerCtrl', //로그인 비밀번호 영역접기
					'click #btn-txPswd-toggle' : 'popTxPswdLayerCtrl', //거래 비밀번호 영역접기
					'click #btn-scrtyQstn-toggle' : 'popScrtyQstnLayerCtrl', //보안질문 답 영역접기
					'click #btn-smsAuth-toggle' : 'popSMSAtuhLayerCtrl', //SMS 인증 영역접기
					'click #btn-othrScrty-toggle' : 'popOthrScrtyLayerCtrl', //기타 보안 영역접기
					'click #btn-loinBsicInfo-toggle' : 'popLoinBsicInfoLayerCtrl' //기타 보안 영역접기


				},
				initialize : function(initData) {
					var that = this;


		            $.extend(that,initData);


		            // 페이지 템플릿 설정
		            that.$el.html(that.tpl());


		            // init data set
		            if(commonInfo.getInstInfo().instCd) {
		              	that.instCd = commonInfo.getInstInfo().instCd;
		            }
		            else {
		            	that.instCd = $.sessionStorage("instCd");
		            }		            
		            //콤보박스 설정
		            that.setComboBoxes();
				},
				render : function() {
					
                	//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPAT302-wrap .CAPAT302-efctvTm-save-btn')
                                        		,this.$el.find('.CAPAT302-wrap .CAPAT302-loinPswd-save-btn')
                                        		,this.$el.find('.CAPAT302-wrap .CAPAT302-txPswd-save-btn')
                                        		,this.$el.find('.CAPAT302-wrap .CAPAT302-scrtyQstn-save-btn')
                                        		,this.$el.find('.CAPAT302-wrap .CAPAT302-smsAuth-save-btn')
                                        		,this.$el.find('.CAPAT302-wrap .CAPAT302-othrScrty-save-btn')
                                        		,this.$el.find('.CAPAT302-wrap .CAPAT302-loinBsicInfo-save-btn')
                                        			   ]);
					
					var that = this;


					// 기관파라미터 조회
					that.selectInstitutionParameter();


                	return that.$el;
				},


                /**
                 * 기관 파라미터 조회
                 */
                selectInstitutionParameter : function() {
                	this.instCreateMode = false;


                	// 유효시간 기관파라미터 조회
                	this.selectValidTimeParam();
                	// 로그인비밀번호 기관파라미터 조회
                	this.selectLoginPsswordParam();
                	// 거래비밀번호 기관파라미터 조회
                	this.selectTransactionPasswordParam();
                	// 보안질문 기관파라미터 조회
                	this.selectSecurityQuestionnaireParam();
                	// SMS인증 기관파라미터 조회
                	this.selectSmsAuthenticationParam();
                	// 기타보안 기관파라미터 조회
                	this.selectOtherSecurityParam();
                	// 유효시간 기관파라미터 조회 한번 조회해서 안나옴 이유 모르겠음
                	this.selectValidTimeParam();
                	// 로그인기본정보 기관파라미터 조회
                	this.selectLoinBsicInfoParam();


                },


                /**
                 * 유효시간 기관파라미터 조회
                 */
                selectValidTimeParam : function() {
                	var sParam = {};
                	sParam.instCd = $.sessionStorage('headerInstCd');
                	sParam.instParmTpCd = "08"; // 유효시간 08으로 잡았음 (코드 관리 참조)


                	this.selectProxy(sParam);
                },


                /**
                 * 로그인비밀번호 기관파라미터 조회
                 */
                selectLoginPsswordParam : function() {
                	var sParam = {};
                	sParam.instCd = $.sessionStorage('headerInstCd');
                	sParam.instParmTpCd = "09"; // 로그인비밀번호 09으로 잡았음 (코드 관리 참조)


                	this.selectProxy(sParam);
                },


                /**
                 * 거래비밀번호 기관파라미터 조회
                 */
                selectTransactionPasswordParam : function() {
                	var sParam = {};
                	sParam.instCd = $.sessionStorage('headerInstCd');
                	sParam.instParmTpCd = "10"; // 거래비밀번호 10으로 잡았음 (코드 관리 참조)


                	this.selectProxy(sParam);
                },


                /**
                 * 보안질문 기관파라미터 조회
                 */
                selectSecurityQuestionnaireParam : function() {
                	var sParam = {};
                	sParam.instCd = $.sessionStorage('headerInstCd');
                	sParam.instParmTpCd = "11"; // 보안질문 11으로 잡았음 (코드 관리 참조)


                	this.selectProxy(sParam);
                },


                /**
                 * SMS인증 기관파라미터 조회
                 */
                selectSmsAuthenticationParam : function() {
                	var sParam = {};
                	sParam.instCd = $.sessionStorage('headerInstCd');
                	sParam.instParmTpCd = "12"; // SMS인증 12으로 잡았음 (코드 관리 참조)


                	this.selectProxy(sParam);
                },


                /**
                 * 기타보안 기관파라미터 조회
                 */
                selectOtherSecurityParam : function() {
                	var sParam = {};
                	sParam.instCd = $.sessionStorage('headerInstCd');
                	sParam.instParmTpCd = "13"; // 기타보안 13으로 잡았음 (코드 관리 참조)


                	this.selectProxy(sParam);
                },
                
                /**
                 * 로그인기본정보 기관파라미터 조회
                 */
                selectLoinBsicInfoParam : function() {
                	var sParam = {};
                	sParam.instCd = $.sessionStorage('headerInstCd');
                	sParam.instParmTpCd = "14"; // 로그인기본정보 14


                	this.selectProxy(sParam);
                },

                /**
                 * 조회
                 */
                selectProxy : function(sParam) {
                	var that = this;
                	var linkData = {"header": fn_getHeader("CAPCM0308403"), "CaInstMgmtSvcGetParmIn": sParam};


                	// ajax호출
                	bxProxy.post(sUrl, JSON.stringify(linkData), {
                		enableLoading: true
                		, success: function (responseData) {
                			if (fn_commonChekResult(responseData)) {
                				var parmList = responseData.CaInstMgmtSvcGetParmOut.parmList;


                				$(parmList).each(function(idx, data) {


                					that.$el.find('[data-form-param="'+data.parmAtrbtNm+'"]').val(data.parmVal);
                					// 유효시간 및 세션 조회 해오면 체크박스에 체크
                					if(data.instParmTpCd == '08'){
                						if( data.parmAtrbtNm == 'mltplLoinSesnPsblYn' ){
                							that.$el.find('#CAPAT302-validTime-table #mltplLoinSesnPsblYn').prop('checked', data.parmVal == "Y" ? true : false);
                						}
                					}
                					// 로그인비밀번호 조회 해오면 체크박스에 체크
                					if(data.instParmTpCd == '09'){
                						if( data.parmAtrbtNm == 'loinPswdAlphbtCmpsYn' ){
                							that.$el.find('#CAPAT302-loginPassword-table #loinPswdAlphbtCmpsYn').prop('checked', data.parmVal == "Y" ? true : false);
                						}
                						if( data.parmAtrbtNm == 'loinPswdNbrCmpsYn' ){
                    						that.$el.find('#CAPAT302-loginPassword-table #loinPswdNbrCmpsYn').prop('checked', data.parmVal == "Y" ? true : false);
                						}
                						if( data.parmAtrbtNm == 'loinPswdNbrSpecialChrCmpsYn' ){
                							that.$el.find('#CAPAT302-loginPassword-table #loinPswdNbrSpecialChrCmpsYn').prop('checked', data.parmVal == "Y" ? true : false);
                						}
                					}
                					// 거래비밀번호 조회 해오면 체크박스에 체크
                					if(data.instParmTpCd == '10'){
                						if( data.parmAtrbtNm == 'txPswdAlphbtCmpsYn' ){
                							that.$el.find('#CAPAT302-transactionPassword-table #txPswdAlphbtCmpsYn').prop('checked', data.parmVal == "Y" ? true : false);
                						}
                						if( data.parmAtrbtNm == 'txPswdNbrCmpsYn' ){
                    						that.$el.find('#CAPAT302-transactionPassword-table #txPswdNbrCmpsYn').prop('checked', data.parmVal == "Y" ? true : false);
                						}
                						if( data.parmAtrbtNm == 'txPswdSpecialChrCmpsYn' ){
                							that.$el.find('#CAPAT302-transactionPassword-table #txPswdSpecialChrCmpsYn').prop('checked', data.parmVal == "Y" ? true : false);
                						}
                					}
                				});
                			}
                		}   // end of suucess: fucntion
                	}); // end of bxProxy
                },




                /**
                 * 기관 파라미터 저장
                 */
                saveCAPAT302: function (event) {
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                    
                    var that = this;
                    that.mainEvent = event;


                    function saveData() {
                        var sParam = {};
                        sParam.tblNm = [];
                        var paramList = {};
                        var target = "";


                        // 버튼 ID에 따른 target 변경
                        if(that.mainEvent.target.parentElement.id == "btn-setValidTime-save") {
                        	target = "#CAPAT302-validTime-table";
                        }else if(that.mainEvent.target.parentElement.id == "btn-setLoginPassword-save") {
                        	target = "#CAPAT302-loginPassword-table";
                        }else if(that.mainEvent.target.parentElement.id == "btn-setTransactionPassword-save") {
                        	target = "#CAPAT302-transactionPassword-table";
                        }else if(that.mainEvent.target.parentElement.id == "btn-setSecurityQuestionnaire-save") {
                        	target = "#CAPAT302-securityQuestionnaire-table";
                        }else if(that.mainEvent.target.parentElement.id == "btn-setSmsAuthentication-save") {
                        	target = "#CAPAT302-smsAuthentication-table";
                        }else if(that.mainEvent.target.parentElement.id == "btn-setOtherSecurity-save") {
                        	target = "#CAPAT302-otherSecurity-table";
                        }else if(that.mainEvent.target.parentElement.id == "btn-setLoinBsicInfo-save") {
                        	target = "#CAPAT302-loinBsicInfo-table";
                        }


                        paramList = bxUtil.makeParamFromForm(that.$el.find(target));


                        for (var key in paramList) {
                    		var param = {};
                    		//param.instCd = $.sessionStorage("instCd");
                    		param.instCd = commonInfo.getInstInfo().instCd;
                    		param.parmAtrbtNm = key;
                    		param.parmVal = paramList[key];
                    		sParam.tblNm.push(param);
                        }


                		if(target == "#CAPAT302-validTime-table"){


                			var param = {};
                			//param.instCd = $.sessionStorage("instCd");
                			param.instCd = commonInfo.getInstInfo().instCd;
                			param.parmAtrbtNm = 'mltplLoinSesnPsblYn';
                    		param.parmVal = that.$el.find('#CAPAT302-validTime-table #mltplLoinSesnPsblYn').prop('checked') ? 'Y' : 'N';
                			sParam.tblNm.push(param);
                		}


                		if(target == "#CAPAT302-loginPassword-table"){


                			var param = {};
                			//param.instCd = $.sessionStorage("instCd");
                			param.instCd = commonInfo.getInstInfo().instCd;
                			param.parmAtrbtNm = 'loinPswdAlphbtCmpsYn';
                    		param.parmVal = that.$el.find('#CAPAT302-loginPassword-table #loinPswdAlphbtCmpsYn').prop('checked') ? 'Y' : 'N';
                			sParam.tblNm.push(param);


                			var param = {};
                			//param.instCd = $.sessionStorage("instCd");
                			param.instCd = commonInfo.getInstInfo().instCd;
                			param.parmAtrbtNm = 'loinPswdNbrCmpsYn';
                    		param.parmVal = that.$el.find('#CAPAT302-loginPassword-table #loinPswdNbrCmpsYn').prop('checked') ? 'Y' : 'N';
                			sParam.tblNm.push(param);


                			var param = {};
                			//param.instCd = $.sessionStorage("instCd");
                			param.instCd = commonInfo.getInstInfo().instCd;
                			param.parmAtrbtNm = 'loinPswdNbrSpecialChrCmpsYn';
                    		param.parmVal = that.$el.find('#CAPAT302-loginPassword-table #loinPswdNbrSpecialChrCmpsYn').prop('checked') ? 'Y' : 'N';
                			sParam.tblNm.push(param);


                		}


                		if(target == "#CAPAT302-transactionPassword-table"){


                			var param = {};
                			//param.instCd = $.sessionStorage("instCd");
                			param.instCd = commonInfo.getInstInfo().instCd;
                			param.parmAtrbtNm = 'txPswdAlphbtCmpsYn';
                    		param.parmVal = that.$el.find('#CAPAT302-transactionPassword-table #txPswdAlphbtCmpsYn').prop('checked') ? 'Y' : 'N';
                			sParam.tblNm.push(param);


                			var param = {};
                			//param.instCd = $.sessionStorage("instCd");
                			param.instCd = commonInfo.getInstInfo().instCd;
                			param.parmAtrbtNm = 'txPswdNbrCmpsYn';
                    		param.parmVal = that.$el.find('#CAPAT302-transactionPassword-table #txPswdNbrCmpsYn').prop('checked') ? 'Y' : 'N';
                			sParam.tblNm.push(param);


                			var param = {};
                			//param.instCd = $.sessionStorage("instCd");
                			param.instCd = commonInfo.getInstInfo().instCd;
                			param.parmAtrbtNm = 'txPswdSpecialChrCmpsYn';
                    		param.parmVal = that.$el.find('#CAPAT302-transactionPassword-table #txPswdSpecialChrCmpsYn').prop('checked') ? 'Y' : 'N';
                			sParam.tblNm.push(param);


                		}


                        var linkData = {"header": fn_getHeader("CAPCM0308103"), "CaInstMgmtSvcRegParmListIn": sParam};


                            // ajax호출
                            bxProxy.post(sUrl, JSON.stringify(linkData), {
                                enableLoading: true
                                , success: function (responseData) {
                                    if (fn_commonChekResult(responseData)) {
                                        fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                        that.selectInstitutionParameter();
                                    }
                                }   // end of suucess: fucntion
                            }); // end of bxProxy
                    }


                    fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
                },




				/**
				 * 콤보박스 설정
				 */
				setComboBoxes: function(){
					var that = this;


  	                // combobox - minute
  	                var sParam = {};
  	                sParam.className = "minute-wrap";
  	                sParam.nullYn = "Y";
  	                sParam.cdNbr = "A0622";
  	                sParam.viewType = "textUnit";
		            sParam.unit = bxMsg('cbb_items.SCRNITM#minute')
		            CAPAT302_fn_getCodeList(sParam, that);


  	                // combobox - month
  	                var sParam = {};
  	                sParam.className = "month-wrap";
  	                sParam.nullYn = "Y";
  	                sParam.cdNbr = "A0623";
  	                sParam.viewType = "textUnitAndDays";
		            sParam.unit = bxMsg('cbb_items.SCRNITM#month')
		            sParam.secondUnit = bxMsg('cbb_items.SCRNITM#day')
  	                CAPAT302_fn_getCodeList(sParam, that);


  	                // combobox - count
  	                var sParam = {};
  	                sParam.className = "count-wrap";
  	                sParam.nullYn = "Y";
  	                sParam.cdNbr = "A0624";
  	                sParam.viewType = "textUnit";
		            sParam.unit = bxMsg('cbb_items.SCRNITM#times')
  	                CAPAT302_fn_getCodeList(sParam, that);


  	                // combobox - hour
  	                var sParam = {};
  	                sParam.className = "hour-wrap";
  	                sParam.nullYn = "Y";
  	                sParam.cdNbr = "A0625";
  	                sParam.viewType = "textUnit";
		            sParam.unit = bxMsg('cbb_items.SCRNITM#hh')
  	                CAPAT302_fn_getCodeList(sParam, that);


  	                // combobox - yn
  	                var sParam = {};
  	                sParam.className = "yn-wrap";
  	                sParam.nullYn = "Y";
  	                sParam.cdNbr = "10000";
  	                sParam.viewType = "cd";
  	                CAPAT302_fn_getCodeList(sParam, that);

		            //inquire institution parameters
		            setTimeout(function () {
		            	that.selectInstitutionParameter();
		            }, 300);
					
				},


	            /**
	             * 기타 화면 설정
	             */
				popEfctvTmLayerCtrl : function(){
					var that = this;
					fn_pageLayerCtrl(that.$el.find("#efctvTm-area"));
				},
				popLoinPswdLayerCtrl : function(){
					var that = this;
					fn_pageLayerCtrl(that.$el.find("#loinPswd-area"));
				},
				popTxPswdLayerCtrl : function(){
					var that = this;
					fn_pageLayerCtrl(that.$el.find("#txPswd-area"));
				},
				popScrtyQstnLayerCtrl : function(){
					var that = this;
					fn_pageLayerCtrl(that.$el.find("#scrtyQstn-area"));
				},
				popSMSAtuhLayerCtrl : function(){
					var that = this;
					fn_pageLayerCtrl(that.$el.find("#smsAuth-area"));
				},
				popOthrScrtyLayerCtrl : function(){
					var that = this;
					fn_pageLayerCtrl(that.$el.find("#othrScrty-area"));
				},
				popLoinBsicInfoLayerCtrl : function(){
					var that = this;
					fn_pageLayerCtrl(that.$el.find("#loinBsicInfo-area"));
				}

			});


	return CAPAT302BaseView;
});


/**
 * 공통코드조회
 */
function CAPAT302_fn_getCodeList(sParam, that, selectStyle, fn) {
    var param = {};


    param.cdNbr = sParam.cdNbr;


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
                         else if (sParam.viewType == "textUnit") {
                        	 if(optionValue == "UL"){//무제한인 경우 단위 붙이지 않음.
                                 option = $(document.createElement('option')).val(optionValue).text(optionText);
                        	 }else{
                                 option = $(document.createElement('option')).val(optionValue).text(optionText + " " + sParam.unit);                        		 
                        	 }
                         }
                         else if(sParam.viewType == "textUnitAndDays"){
                        	 if(optionValue == "UL"){//무제한인 경우 단위 붙이지 않음.
                                 option = $(document.createElement('option')).val(optionValue).text(optionText);
                        	 }else{
                                 option = $(document.createElement('option')).val(optionValue).text(optionText + " " + sParam.unit
                                		 + "(" + (30 * parseInt(optionText))+ sParam.secondUnit + ")");                        		 
                        	 }
                         }
                         else if(sParam.viewType == "cd"){
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
