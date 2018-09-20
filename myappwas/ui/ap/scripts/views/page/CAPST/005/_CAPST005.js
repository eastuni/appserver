define(
    [ 	'bx/common/config'
		, 'bx/common/common-info'
        , 'text!app/views/page/CAPST/005/_CAPST005.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'app/views/page/popup/CAPCM/popup-class-search'
        , 'app/views/page/popup/CAPCM/popup-code-search'
    ]
    , function (config
    	, commonInfo
        , tpl
        , ExtGrid
        , PopupClassSearch
        , PopupCodeSearch
        ) {


        /**
         * Backbone
         */
        var CAPST005View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPST005-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                    'click #btn-instTaxCalcnClassNm-reset': 'resetInstArea'			//초기화영역
                	, 'click #btn-instTaxCalcnClassNm-search' : 'openPopupClassSearch'	//클래스 조회 팝업
                	, 'click #btn-amtTpRpymntSeq-search' : 'openPopupCodeSearch'		//코드 조회 팝업	
                    , 'click #btn-instTaxCalcnClassNm-save': 'settleParamSave'		//저장
                    , 'click #btn-instTaxCalcnClassNm-modal': 'toggleInstArea'		//토글
                }


                /**
                 * 초기화
                 */
                , initialize: function (initData) {
                    var that = this;
                    that.that = this;
                    $.extend(that, initData);
                    that.$el.html(that.tpl());
		           	this.setComboBoxes();
                }


                /**
                 * 화면렌더링
                 */
                , render: function () { 
                	this.selectInstitutionParameter();
                	
                	//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPST005-wrap #btn-instTaxCalcnClassNm-save')
                                        			   ]);
                    return this.$el;
                }
                , selectInstitutionParameter : function() {
                	this.instCreateMode = false;


                	this.selectCustParam();
                }
                , selectCustParam : function() {
                	var sParam = {};
                	sParam.instCd = $.sessionStorage('headerInstCd');


                	this.selectProxy(sParam);
                }
                , selectProxy : function(sParam) {
                	var that = this;
                	var linkData = {"header": fn_getHeader("CAPCM0308403"), "CaInstMgmtSvcGetParmIn": sParam};


                	// ajax호출
                	bxProxy.post(sUrl, JSON.stringify(linkData), {
                		enableLoading: true
                		, success: function (responseData) {
                			if (fn_commonChekResult(responseData)) {
                				var parmList = responseData.CaInstMgmtSvcGetParmOut.parmList;


                				$(parmList).each(function(idx, data) {


                					var paramVal = data.parmVal;


                					that.$el.find('[data-form-param="'+data.parmAtrbtNm+'"]').val(paramVal);


                				});
                			}
                		}   // end of suucess: fucntion
                	}); // end of bxProxy
                }


                /**
                 * 클래스조회 팝업
                 */
                ,openPopupClassSearch : function(){
	                var that = this;
	                var sParam = {};


	                sParam.classNm = that.$el.find('#CAPST005-settlementParameter-table [data-form-param="instTaxCalcnClassNm"]').val();


	                var popupClassSearch = new PopupClassSearch(sParam);


	                popupClassSearch.render();
	                popupClassSearch.on('popUpSetData', function (data) {
	                    that.$el.find('[data-form-param="instTaxCalcnClassNm"]').val(data.classNm);
	                });
				}


                /**
                 * 코드조회 팝업
                 */
                ,openPopupCodeSearch : function(){
	                var that = this;
	                var sParam = {};
	                sParam.cdNbr = that.$el.find('#CAPST005-settlementParameter-table [data-form-param="amtTpRpymntSeq"]').val();
	                var popupCodeSearch = new PopupCodeSearch(sParam);


	                popupCodeSearch.render();
	                popupCodeSearch.on('popUpSetData', function (data) {
	                    that.$el.find('[data-form-param="amtTpRpymntSeq"]').val(data.cdNbr);
	                });
				}


                /**
                 * 콤보박스 세팅
                 */
                , setComboBoxes: function () {
                    // 콤보데이터 로딩
                    var sParam = {};


                    //적수산정방법코드
                    sParam = {};
                    sParam.className = "CAPST005-acmltdCalcnMthdCd-wrap";
                    sParam.targetId = "acmltdCalcnMthdCd";
                    sParam.nullYn = "N";
                    //sParam.selectVal = "A01";
                    sParam.cdNbr = "A0574";
                    fn_getCodeList(sParam, this);


                    //윤년여부코드
                    sParam = {};
                    sParam.className = "CAPST005-leapYrYn-wrap";
                    sParam.targetId = "leapYrYn";
                    sParam.nullYn = "N";
                   // sParam.selectVal = "Y";
                    sParam.cdNbr = "10000";
                    sParam.viewType = "val";
                    fn_getCodeList(sParam, this);


                    //이율기간구분코드
                    sParam = {};
                    sParam.className = "CAPST005-rtTrmDscd-wrap";
                    sParam.targetId = "rtTrmDscd";
                    sParam.nullYn = "N";
                   // sParam.selectVal = "M";
                    sParam.cdNbr = "A0424";
                    fn_getCodeList(sParam, this);


                    //수신이자세금면제여부
                    sParam = {};
                    sParam.className = "CAPST005-wthldngTaxFreeYn-wrap";
                    sParam.targetId = "wthldngTaxFreeYn";
                    sParam.nullYn = "N";
                   // sParam.selectVal = "Y";
                    sParam.cdNbr = "10000";
                    sParam.viewType = "val";
                    fn_getCodeList(sParam, this);


                    //발생주의적용여부
                    sParam = {};
                    sParam.className = "CAPST005-accrualBasisYn-wrap";
                    sParam.targetId = "accrualBasisYn";
                    sParam.nullYn = "N";
                   // sParam.selectVal = "Y";
                    sParam.cdNbr = "10000";
                    sParam.viewType = "val";
                    fn_getCodeList(sParam, this);


                    //지점간정산계좌관리여부
                    sParam = {};
                    sParam.className = "CAPST005-pstnAcctMgmtYn-wrap";
                    sParam.targetId = "pstnAcctMgmtYn";
                    sParam.nullYn = "N";
                   // sParam.selectVal = "Y";
                    sParam.cdNbr = "10000";
                    sParam.viewType = "val";
                    fn_getCodeList(sParam, this);
                }


                /**
                 * 설정 초기화
                 */
                , resetInstArea: function () {
                	this.instCreateMode = true;


                	this.$el.find('#CAPST005-settlementParameter-table [data-form-param="instTaxCalcnClassNm"]').val("");                	
                	this.$el.find('#CAPST005-settlementParameter-table [data-form-param="instTaxCalcnClassNm"]').prop("disabled", true);


                	this.$el.find('#CAPST005-settlementParameter-table [data-form-param="acmltdCalcnMthdCd"]').val("D");
                	this.$el.find('#CAPST005-settlementParameter-table [data-form-param="acmltdCalcnMthdCd"]').prop("disabled", true);
                }


                /*
                 * Toggle
                 */
                ,toggleInstArea: function () {
                    fn_pageLayerCtrl(this.$el.find('#CAPST005-settlementParameter-table'), this.$el.find("#btn-instTaxCalcnClassNm-modal"));
                }




                /**
                 * 저장
                 */
                , settleParamSave : function(event) {
                    var that = this;
                    that.mainEvent = event;

                  //배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                    function saveData() {
                        var sParam = {};


                        sParam.tblNm = [];
                        var instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                        var paramList = {};
                        var target = "#CAPST005-settlementParameter-table";


                        paramList = bxUtil.makeParamFromForm(that.$el.find(target));


                        for (var key in paramList) {
                        	if(key != "instCd") {
                        		var param = {};
                        		param.instCd = instCd;
                        		param.parmAtrbtNm = key;
                        		param.parmVal = paramList[key];
                        		sParam.tblNm.push(param);
                        	}
                        }


                        var linkData = {"header": fn_getHeader("CAPCM0308103"), "CaInstMgmtSvcRegParmListIn": sParam};


                            bxProxy.post(sUrl, JSON.stringify(linkData), {
                                enableLoading: true
                                , success: function (responseData) {
                                    if (fn_commonChekResult(responseData)) {
                                        fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                    }
                                }
                            });
                    }


                    fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
                }
            })
            ; // end of Backbone.View.extend({


        return CAPST005View;
    } // end of define function
)
; // end of define
