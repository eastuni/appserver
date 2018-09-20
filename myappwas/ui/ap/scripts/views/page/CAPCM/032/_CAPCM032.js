define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPCM/032/_CAPCM032.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , ExtGrid
        , commonInfo
        ) {


        /**
         * Backbone
         */
        var CAPCM032View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPCM032-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                    'click #btn-system-save': 'save'
            		, 'click #btn-system-modal': 'toggleSystem'
                }


                /**
                 * initialize
                 */
                , initialize: function (initData) {
                    var that = this;


                    // 전역변수 설정
                    $.extend(that, initData);
                    that.$el.html(that.tpl());
                }


                /**
                 * render
                 */
                , render: function () {
                	// 기관파라미터 조회
                	this.selectInstitutionParameter();


                	var userInfo = commonInfo.getUserInfo();


                    if(userInfo.staffId == "0000000026") {
                    	this.$el.find(".hideClass").show();
                    }


                  //배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPCM032-wrap #btn-system-save')
                                        			   ]);

                	return this.$el;
                }


                /**
                 * 기관파라미터 조회
                 */
                , selectInstitutionParameter : function() {
                	var sParam = {};
                	sParam.instCd = $.sessionStorage('headerInstCd');
                	sParam.instParmTpCd = "60";


                	var that = this;
                	var linkData = {"header": fn_getHeader("CAPCM0308403"), "CaInstMgmtSvcGetParmIn": sParam};
                	var comboParam = {};
                	// ajax호출
                	bxProxy.post(sUrl, JSON.stringify(linkData), {
                		enableLoading: true
                		, success: function (responseData) {
                			if (fn_commonChekResult(responseData)) {
                				var parmList = responseData.CaInstMgmtSvcGetParmOut.parmList;


                				$(parmList).each(function(idx, data) {


                					var paramVal = data.parmVal;


                					that.$el.find('[data-form-param="'+data.parmAtrbtNm+'"]').val(paramVal);
                					that.$el.find('[data-form-param="'+data.parmAtrbtNm+'"]').attr("maxLength", data.atrbtLen);
                					that.$el.find('[data-form-param="'+data.parmAtrbtNm+'"]').attr("atrbtTpCd", data.atrbtTpCd);
                					comboParam[data.parmAtrbtNm] = paramVal;
                				});


                				that.setComboBoxes(comboParam);
                			}
                		}   // end of suucess: fucntion
                	}); // end of bxProxy
                }


                /**
                 * 콤보박스 세팅
                 */
                , setComboBoxes: function (comboParam) {


                	var sParam = {};
                	var $aprvlCndUseYn = this.$el.find('#CAPCM032-system-table [data-form-param="aprvlCndUseYn"]').find("option");
                	var $siteLbrtryDscd = this.$el.find('#CAPCM032-system-table [data-form-param="siteLbrtryDscd"]').find("option");


                	if($aprvlCndUseYn.length > 0) {
                		this.$el.find('#CAPCM032-system-table [data-form-param="aprvlCndUseYn"]').val(comboParam.aprvlCndUseYn);
                	}
                	else {
                		 // 국가코드
                        sParam = {};
                        sParam.className = "CAPCM032-aprvlCndUseYn-wrap";
                        sParam.targetId = "aprvlCndUseYn";
                        sParam.nullYn = "N";
                        sParam.cdNbr = "10000";
                        if(comboParam.aprvlCndUseYn) {
                        	sParam.selectVal = comboParam.aprvlCndUseYn;
                        }
                        fn_getCodeList(sParam, this);
                	}


                	if($siteLbrtryDscd.length > 0) {
                		this.$el.find('#CAPCM032-system-table [data-form-param="siteLbrtryDscd"]').val(comboParam.siteLbrtryDscd);
                	}
                	else {
                		// 언어코드
                        sParam = {};
                        sParam.className = "CAPCM032-siteLbrtryDscd-wrap";
                        sParam.targetId = "siteLbrtryDscd";
                        sParam.nullYn = "N";
                        sParam.cdNbr = "A0417";
                        if(comboParam.siteLbrtryDscd) {
                        	sParam.selectVal = comboParam.siteLbrtryDscd;
                        }
                        fn_getCodeList(sParam, this);
                	}
                }


                /**
                 * 기관 설정 초기화
                 */
                , resetInstArea: function () {
                    this.$el.find('#CAPCM032-system-table [data-form-param="mobileVersionAndroidCntnt"]').val("");
                    this.$el.find('#CAPCM032-system-table [data-form-param="mobileVersionIsoCntnt"]').val("");
                    this.$el.find('#CAPCM032-system-table [data-form-param="aprvlCndUseYn"]').val("");
                    this.$el.find('#CAPCM032-system-table [data-form-param="siteLbrtryDscd"]').val("");
                }


                /**
                 * 기관파라미터 저장
                 */
                , save: function () {
                    var that = this;

                  //배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                    
                    function saveData() {
                        var sParam = {};


                        sParam.tblNm = [];
                        var instCd = $.sessionStorage('headerInstCd');
                        var paramList = {};
                        var target = "";


                        paramList = bxUtil.makeParamFromForm(that.$el.find("#CAPCM032-system-table"));


                        for (var key in paramList) {
                    		var param = {};
                    		param.instCd = instCd;
                    		param.parmAtrbtNm = key;
                    		param.parmVal = paramList[key];
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
                }


                /**
                 * 기관 설정 영역 토글
                 */
                , toggleSystem: function () {
                    fn_pageLayerCtrl(this.$el.find("#CAPCM032-system-table"), this.$el.find('#btn-base-attribute-toggle'));
                }


            })
            ; // end of Backbone.View.extend({


        return CAPCM032View;
    } // end of define function
)
; // end of define
