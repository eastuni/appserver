define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPCM/030/_CAPCM030.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'app/views/page/popup/CAPCM/popup-institution-search'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , ExtGrid
        , PopupInstSrch
        , commonInfo
        ) {


        /**
         * Backbone
         */
        var CAPCM030View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPCM030-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                    'click #btn-setInst-reset': 'resetInstArea'


                	, 'click #btn-inst-search': 'openInstSearchPopup'
                	, 'click #btn-ref-inst-search': 'openRefInstSearchPopup'

                    , 'click #btn-setInst-save': 'instSave'
                	, 'click #btn-setInst-delete': 'instDelete'
                	, 'click #btn-natAndLng-save': 'save'
            		, 'click #btn-bizInfo-save': 'save'


            		, 'click #btn-setInst-modal': 'toggleSetInst'
                    , 'click #btn-natAndLng-modal': 'toggleNatAndLng'
                    , 'click #btn-bizInfo-modal': 'toggleBizInfo'


                	, 'click .instParamAtrbt': 'goInstParamAtrbt'
                }


                /**
                 * initialize
                 */
                , initialize: function (initData) {
                    var that = this;
                    that.that = this;


                    // 전역변수 설정
                    this.lngCd = "";
                    this.natCd = "";
                    this.dtFrmtCd = "";
                    this.instBaseCrncyCd = "";
                    this.instCreateMode = false;
                    
                    this.refMode = false;

                    $.extend(that, initData);
                    that.$el.html(that.tpl());
                }


                /**
                 * render
                 */
                , render: function () {
                	this.$el.find('#CAPCM030-setInst-table [data-form-param="instCd"]').val($.sessionStorage('headerInstCd'));
                	// 기관파라미터 조회
                	this.selectInstitutionParameter();


                	var userInfo = commonInfo.getUserInfo();


                    if(userInfo.staffId == "0000000026") {
                    	this.$el.find(".instParamAtrbt").show();
                    }


                	this.setTimeInput();
                	
                	//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPCM030-wrap #btn-setInst-save')
                                        		,this.$el.find('.CAPCM030-wrap #btn-setInst-delete')
                                        			   ]);

                    return this.$el;
                }


                /**
                 * 기관파라미터속성관리 이동
                 */
                , goInstParamAtrbt : function() {
                	var that = this;


                    that.$el.trigger({
                        type: 'open-conts-page'
                        , pageHandler: 'CAPCM031'
                        , pageDPName: bxMsg('cbb_items.SCRN#CAPCM031')
                        , pageInitialize: true
                        , pageRenderInfo: {
                            //cdNbrTpCd: '01'
                        }
                    });
                }


                /**
                 * 기관파라미터 조회
                 */
                , selectInstitutionParameter : function() {
                	this.instCreateMode = false;
                	this.$el.find('#CAPCM030-setInst-table [data-form-param="instCd"]').prop("disabled", true);
                	this.$el.find('#CAPCM030-setInst-table [data-form-param="instEngNm"]').prop("disabled", false);
                	this.$el.find('#CAPCM030-setInst-table [data-form-param="ownBnkFnclInstId"]').prop("disabled", false);
                	this.$el.find('#CAPCM030-setInst-table [data-form-param="cardBinNbr"]').prop("disabled", false);


                	// 기관설정 조회
                	this.selectSetInst('instCd');
                	// 국가 및 언어 설정 조회
                	this.selectNatAndLng('instCd');
                	// 영업 정보 설정 조회
                	this.selectBizInfo('instCd');
                }


                /**
                 * 기관설정 조회
                 */
                , selectSetInst : function(AttrId) {
                	var sParam = {};
                	sParam.instCd = this.$el.find('#CAPCM030-setInst-table [data-form-param="'+AttrId+'"]').val();
                	sParam.instParmTpCd = "20";


                	this.selectProxy(sParam);
                }


                /**
                 * 국가 및 언어 설정 조회
                 */
                , selectNatAndLng : function(AttrId) {
                	var sParam = {};
                	sParam.instCd = this.$el.find('#CAPCM030-setInst-table [data-form-param="'+AttrId+'"]').val();
                	sParam.instParmTpCd = "21";


                	this.selectProxy(sParam);
                }


                /**
                 * 영업 정보 조회
                 */
                , selectBizInfo : function(AttrId) {
                	var sParam = {};
                	sParam.instCd = this.$el.find('#CAPCM030-setInst-table [data-form-param="'+AttrId+'"]').val();
                	sParam.instParmTpCd = "22";


                	this.selectProxy(sParam);
                }


                /**
                 * 조회
                 */
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


                					if("bizStartHms" == data.parmAtrbtNm || "bizEndHms" == data.parmAtrbtNm) {
                						paramVal = fn_setTimeValue(paramVal);
                					}

                					if(that.refMode && ("instNm" == data.parmAtrbtNm || "instEngNm" == data.parmAtrbtNm)){
                						that.$el.find('[data-form-param="'+data.parmAtrbtNm+'"]').val('');
                					} else {
                						that.$el.find('[data-form-param="'+data.parmAtrbtNm+'"]').val(paramVal);
                					}
                					
                					that.$el.find('[data-form-param="'+data.parmAtrbtNm+'"]').attr("maxLength", data.atrbtLen);
                					that.$el.find('[data-form-param="'+data.parmAtrbtNm+'"]').attr("atrbtTpCd", data.atrbtTpCd);


                					// 국가 및 언어 설정 의 콤보박스를 생성 하기 위하여 전역변수에 데이터를 넣은다.
                					if("21" == sParam.instParmTpCd) {
                						if(data.parmAtrbtNm == "lngCd") {
                							that.lngCd = data.parmVal;
                						}
                						if(data.parmAtrbtNm == "natCd") {
                							that.natCd = data.parmVal;
                						}
                						if(data.parmAtrbtNm == "dtFormatCd") {
                							that.dtFrmtCd = data.parmVal;
                						}
                						if(data.parmAtrbtNm == "instBaseCrncyCd") {
                							that.instBaseCrncyCd = data.parmVal;
                						}
                					}
                					
                				});


                				if("21" == sParam.instParmTpCd) {
                					that.setNatAndLngComboBoxes();
                				}
                			}
                		}   // end of suucess: fucntion
                	}); // end of bxProxy
                }


                /**
                 * 콤보박스 세팅
                 */
                , setNatAndLngComboBoxes: function () {
                    // 콤보데이터 로딩
                    var sParam = {};


                    // 국가코드
                    sParam = {};
                    sParam.className = "CAPCM030-natCd-wrap";
                    sParam.targetId = "natCd";
                    sParam.nullYn = "N";
                    sParam.cdNbr = "40010";
                    sParam.viewType ="ValNm"
                    if(this.natCd) {
                    	sParam.selectVal = this.natCd;
                    }
                    fn_getCodeList(sParam, this);


                    // 언어코드
                    sParam = {};
                    sParam.className = "CAPCM030-lngCd-wrap";
                    sParam.targetId = "lngCd";
                    sParam.nullYn = "N";
                    sParam.cdNbr = "10005";
                    sParam.viewType ="ValNm"
                    if(this.lngCd) {
                    	sParam.selectVal = this.lngCd;
                    }
                    fn_getCodeList(sParam, this);


                    //날짜형식코드
                    sParam = {};
                    sParam.className = "CAPCM030-dtFormatCd-wrap";
                    sParam.targetId = "dtFormatCd";
                    sParam.nullYn = "N";
                    sParam.cdNbr = "A0620";
                    if(this.dtFrmtCd) {
                    	sParam.selectVal = this.dtFrmtCd;
                    }
                    fn_getCodeList(sParam, this);


                    //기관기준통화코드
                    sParam = {};
                    sParam.className = "CAPCM030-instBaseCrncyCd-wrap";
                    sParam.targetId = "instBaseCrncyCd";
                    sParam.nullYn = "N";
                    sParam.cdNbr = "T0001";
                    sParam.viewType ="ValNm"
                    if(this.instBaseCrncyCd) {
                    	sParam.selectVal = this.instBaseCrncyCd;
                    }
                    fn_getCodeList(sParam, this);
                }


                , setTimeInput: function () {
                    this.$el.find('#CAPCM030-bizInfo-table [data-form-param="bizStartHms"]').mask("99:99:99", {placeholder:"--:--:--"});
                    this.$el.find('#CAPCM030-bizInfo-table [data-form-param="bizEndHms"]').mask("99:99:99", {placeholder:"--:--:--"});
                }


                /**
                 * 기관 설정 초기화
                 */
                , resetInstArea: function () {
                	this.instCreateMode = true;

                	this.$el.find('#CAPCM030-setInst-table [data-form-param="instCd"]').val("");


                	this.$el.find('#CAPCM030-setInst-table [data-form-param="instCd"]').prop("disabled", false);
                	this.$el.find('#CAPCM030-setInst-table [data-form-param="instEngNm"]').prop("disabled", false);
                	this.$el.find('#CAPCM030-setInst-table [data-form-param="ownBnkFnclInstId"]').prop("disabled", false);
                	this.$el.find('#CAPCM030-setInst-table [data-form-param="cardBinNbr"]').prop("disabled", false);
                	
//                	this.$el.find('#CAPCM030-setInst-table [data-form-param="instEngNm"]').prop("disabled", true);
//                	this.$el.find('#CAPCM030-setInst-table [data-form-param="ownBnkFnclInstId"]').prop("disabled", true);
//                	this.$el.find('#CAPCM030-setInst-table [data-form-param="cardBinNbr"]').prop("disabled", true);


                    this.$el.find('#CAPCM030-setInst-table [data-form-param="instNm"]').val("");
                    this.$el.find('#CAPCM030-setInst-table [data-form-param="instEngNm"]').val("");
                    this.$el.find('#CAPCM030-setInst-table [data-form-param="ownBnkFnclInstId"]').val("");
                    this.$el.find('#CAPCM030-setInst-table [data-form-param="cardBinNbr"]').val("");


                    this.$el.find('#CAPCM030-natAndLng-table [data-form-param="natCd"]').val("");
                    this.$el.find('#CAPCM030-natAndLng-table [data-form-param="lngCd"]').val("");
                    this.$el.find('#CAPCM030-natAndLng-table [data-form-param="sysNm"]').val("");
                    this.$el.find('#CAPCM030-natAndLng-table [data-form-param="telNbrPtrnCntnt"]').val("");
                    this.$el.find('#CAPCM030-natAndLng-table [data-form-param="mobileNbrPtrnCntnt"]').val("");
                    this.$el.find('#CAPCM030-natAndLng-table [data-form-param="dtFrmtCd"]').val("");
                    this.$el.find('#CAPCM030-natAndLng-table [data-form-param="instBaseCrncyCd"]').val("");


                    this.$el.find('#CAPCM030-bizInfo-table [data-form-param="custHelpdeskTelNbr"]').val("");
                    this.$el.find('#CAPCM030-bizInfo-table [data-form-param="bizStartHms"]').val("00:00:00");
                    this.$el.find('#CAPCM030-bizInfo-table [data-form-param="bizEndHms"]').val("23:59:59");
                    
                    this.$el.find('#CAPCM030-setInst-table [data-form-param="refInstCd"]').val('');
                }


                , instSave : function(event) {
                	this.fn_InstSave();
//                	if(this.instCreateMode) {
//                		this.fn_InstSave();
//                	}
//                	else {
//                		this.save(event);
//                	}
                }


                /**
                 * 기관저장
                 */
                , fn_InstSave: function () {
                    var that = this;

                  //배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                    
                    function saveData() {
                    	var sParam = {};


                        sParam.instCd       = that.$el.find('#CAPCM030-setInst-table [data-form-param="instCd"]').val();
                        sParam.instNm      	= that.$el.find('#CAPCM030-setInst-table [data-form-param="instNm"]').val();
                        sParam.refInstCd    = that.$el.find('#CAPCM030-setInst-table [data-form-param="refInstCd"]').val();
                        sParam.tblNm = [];
//                        var paramList = {};
//                        var target = "";

                        var natAndLngParamLis = that.fn_MakeParamList('#CAPCM030-natAndLng-table',sParam.instCd);
                        if(natAndLngParamLis.length > 0){
                        	for (var item in natAndLngParamLis) {
                        		sParam.tblNm.push(natAndLngParamLis[item]);
                        	}
                        }
                        var bizInfoParamLis = that.fn_MakeParamList('#CAPCM030-bizInfo-table',sParam.instCd);
                        if(bizInfoParamLis.length > 0){
                        	for (var item in bizInfoParamLis) {
                        		sParam.tblNm.push(bizInfoParamLis[item]);
                        	}
                        }

                        sParam.tblNm.push(that.fn_MakeParam('ownBnkFnclInstId',sParam.instCd));
                        sParam.tblNm.push(that.fn_MakeParam('cardBinNbr',sParam.instCd));
                        console.log("sParam==>"+sParam)
                        var linkData = {"header": fn_getHeader("CAPCM0308102"), "CaInstMgmtSvcRegIn": sParam};


                        //ajax 호출
                        bxProxy.post(sUrl, JSON.stringify(linkData), {
                        	enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                	that.resetInstArea();
                                	that.$el.find('#CAPCM030-setInst-table [data-form-param="instCd"]').val(sParam.instCd);
                                    that.selectInstitutionParameter();
                                }
                            }
                        });


                    }
                    fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
                }

                ,fn_MakeParamList : function(target,instCd){
                	var paramList = bxUtil.makeParamFromForm(this.$el.find(target));
                	var rtnList = [];
                    for (var key in paramList) {
                		rtnList.push(this.fn_MakeParam(key,instCd));
                    }
                    return rtnList;
                }
                ,fn_MakeParam : function(key,instCd){
                	var param = {};
            		param.instCd = instCd;
            		param.parmAtrbtNm = key;

            		var val = this.$el.find('.CAPCM030-wrap [data-form-param="'+key+'"]').val();
            		if(param.parmAtrbtNm == "bizStartHms" || param.parmAtrbtNm == "bizEndHms") {
            			param.parmVal = fn_getTimeValue(val);
            		}
            		else {
            			param.parmVal = val;
            		}
                    return param;
                }
                /**
                 * 기관삭제
                 */
                , instDelete: function () {
                	var that = this;

                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                	function deleteData() {
                        var sParam = {};


                        sParam.instCd        = that.$el.find('#CAPCM030-setInst-table [data-form-param="instCd"]').val();


                        var linkData = {"header": fn_getHeader("CAPCM0308301"), "CaInstMgmtSvcRegIn": sParam};


                        //ajax 호출
                        bxProxy.post(sUrl, JSON.stringify(linkData), {
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                	that.resetInstArea();
//                                	that.$el.find('#CAPCM030-setInst-table [data-form-param="instCd"]').val($.sessionStorage('headerInstCd'));
//                                	that.selectInstitutionParameter();
                                }
                            }
                        });
                	}


                	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), deleteData, this);
                }


                /**
                 * 기관파라미터 저장
                 */
                , save: function (event) {
                    var that = this;
                    that.mainEvent = event;

                  //배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                    function saveData() {
                        var sParam = {};


                        sParam.tblNm = [];
                        var instCd = that.$el.find('#CAPCM030-setInst-table [data-form-param="instCd"]').val();
                        var paramList = {};
                        var target = "";


                        if(that.mainEvent.target.parentElement.id == "btn-setInst-save") {
                        	target = "#CAPCM030-setInst-table";
                        }
                        else if(that.mainEvent.target.parentElement.id == "btn-natAndLng-save") {
                        	target = "#CAPCM030-natAndLng-table";
                        }
                        else if(that.mainEvent.target.parentElement.id == "btn-bizInfo-save") {
                        	target = "#CAPCM030-bizInfo-table";
                        }


                        paramList = bxUtil.makeParamFromForm(that.$el.find(target));


                        for (var key in paramList) {
                        	if(key != "instCd") {
                        		var param = {};
                        		param.instCd = instCd;
                        		param.parmAtrbtNm = key;


                        		if(param.parmAtrbtNm == "bizStartHms" || param.parmAtrbtNm == "bizEndHms") {
                        			param.parmVal = fn_getTimeValue(paramList[key]);
                        		}
                        		else {
                        			param.parmVal = paramList[key];
                        		}
                        		sParam.tblNm.push(param);
                        	}
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
                 * 기관조회 팝업
                 */
                , openInstSearchPopup: function () {
                    var that = this;
                    var param = {};
                    param.instNm = that.$el.find('#CAPCM030-setInst-table [data-form-param="instNm"]').val();
//                    param.savePsblYn = "Y";


                    this.popupInstSrch = new PopupInstSrch(param);
                    this.popupInstSrch.render();
                    this.popupInstSrch.on('popUpSetData', function (data) {
                    	that.refMode = false;
                    	that.resetInstArea();
                        that.$el.find('#CAPCM030-setInst-table [data-form-param="instCd"]').val(data.instCd);
                        that.$el.find('#CAPCM030-setInst-table [data-form-param="instNm"]').val(data.instNm);


                        that.selectInstitutionParameter();
                    });
                }
                
                /**
                 * 참조 기관조회 팝업
                 */
                , openRefInstSearchPopup: function () {
                    var that = this;
                    var param = {};
                    param.instNm = that.$el.find('#CAPCM030-setInst-table [data-form-param="instNm"]').val();
//                    param.savePsblYn = "Y";


                    this.popupInstSrch = new PopupInstSrch(param);
                    this.popupInstSrch.render();
                    this.popupInstSrch.on('popUpSetData', function (data) {
                    	that.refMode = true;
                    	that.resetInstArea();
                        that.$el.find('#CAPCM030-setInst-table [data-form-param="refInstCd"]').val(data.instCd);
                        
                        
                        that.$el.find('#CAPCM030-setInst-table [data-form-param="instCd"]').val('');
                        that.$el.find('#CAPCM030-setInst-table [data-form-param="instNm"]').val('');
                        that.$el.find('#CAPCM030-setInst-table [data-form-param="instEngNm"]').val('');
                        that.$el.find('#CAPCM030-setInst-table [data-form-param="ownBnkFnclInstId"]').val('');
                        that.$el.find('#CAPCM030-setInst-table [data-form-param="cardBinNbr"]').val('');
                        
                        that.$el.find('#CAPCM030-setInst-table [data-form-param="instCd"]').prop("disabled", false);
                        that.$el.find('#CAPCM030-setInst-table [data-form-param="instEngNm"]').prop("disabled", false);
                        that.$el.find('#CAPCM030-setInst-table [data-form-param="ownBnkFnclInstId"]').prop("disabled", false);
                        that.$el.find('#CAPCM030-setInst-table [data-form-param="cardBinNbr"]').prop("disabled", false);
                    	

//                        that.selectInstitutionParameter('refInstCd');
                     // 기관설정 조회
                        that.selectSetInst('refInstCd');
                    	// 국가 및 언어 설정 조회
                        that.selectNatAndLng('refInstCd');
                    	// 영업 정보 설정 조회
                        that.selectBizInfo('refInstCd');
                    });
                }


                /**
                 * 기관 설정 영역 토글
                 */
                , toggleSetInst: function () {
                    fn_pageLayerCtrl(this.$el.find("#CAPCM030-setInst-table"), this.$el.find('#btn-base-attribute-toggle'));
                }


                /**
                 * 국가 및 언어 설정 영역 토글
                 */
                , toggleNatAndLng: function () {
                	fn_pageLayerCtrl(this.$el.find("#CAPCM030-natAndLng-table"), this.$el.find('#btn-base-attribute-toggle'));
                }


                /**
                 * 영업 정보 설정 영역 토글
                 */
                , toggleBizInfo: function () {
                	fn_pageLayerCtrl(this.$el.find("#CAPCM030-bizInfo-table"), this.$el.find('#btn-base-attribute-toggle'));
                }


                // 그리드 내용 엑셀 다운로드
                , gridExcel : function() {
                	var that = this;
                	that.CAPCM030Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM030')+"_"+getCurrentDate("yyyy-mm-dd"));
                }
            })
            ; // end of Backbone.View.extend({


        return CAPCM030View;
    } // end of define function
)
; // end of define
