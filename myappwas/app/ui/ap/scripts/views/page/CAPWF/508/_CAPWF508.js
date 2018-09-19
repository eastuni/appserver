define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPWF/508/_CAPWF508.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
        , 'app/views/page/popup/CAPSV/popup-service'
        , 'app/views/page/popup/CAPCM/popup-aprvlTmplt'
        , 'app/views/page/popup/CAPAT/popup-brnchCd'
    ]
    , function (config
        , tpl
        , ExtGrid
        , commonInfo
        , popupService
        , popupAprvlTmplt
        , popupDeptId
        ) {

        var initParam = "";
        var initFlag = true;


        var bizDscd = "";
        var pdTpCd = "";
        var pdTmpltCd = "";
        var pdCd = "";


        var comboBoxCount = 0;
        /**
         * Backbone
         */
        var CAPWF508View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPWF508-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                    'click #btn-base-reset': 'resetBaseArea'
                    , 'click #btn-base-search': 'queryBaseArea'
                	, 'click #btn-base-search-modal': 'baseSearchModal'
                	, 'click #btn-CAPWF508-detail-toggle': 'detailSearchModal'

                	, 'click #btn-base-delete' : 'deleteArea'
        			, 'click #btn-CAPWF508-grid-delete': 'clickDeleteGrid'
    				, 'click #btn-CAPWF508-grid-excel': 'gridExcel'
					, 'click #btn-up-grid': 'gridAreaModal'
					, 'click #btn-base-save': 'saveCAPWF508Base'
					, 'click #btn-CAPWF508-detail-save': 'saveCAPWF508Detl'

    				, 'click #btn-detail-refresh': 'resetDetailArea'
					, 'click #btn-detail-save': 'clickSaveDetail'
					, 'click #btn-CAPWF501-detail-toggle': 'detailModal'
					, 'click #btn-srvcCd-search': 'popServiceSrch'
					, 'click #btn-aprvlTemplt-search' : 'popupAprvlTempltSrch'
					, 'click #btn-txBrnchCd-search' :'popupDeptId'
					, 'click #btn-CAPWF508-detail-delete' :'deleteTableDate'
		            , 'change #amtCndYn': 'fn_amtCndYnCheck'
                    , 'change #crncyCdCndYn': 'fn_crncyCdCndYnCheck'
                    , 'change #txHmsCndYn': 'fn_txHmsCndYnCheck'
                    , 'change #txBrnchDscdCndYn': 'fn_txBrnchDscdCndYnCheck'
                    , 'change #txBrnchCndYn': 'fn_txBrnchCndYnCheck'
                    , 'change #pdCndYn': 'fn_pdClCndYnCheck'
	                , 'change .CAPWF508-bizDscd-wrap': 'changeBizDscd'
	                , 'change .CAPWF508-pdTpCd-wrap': 'changePdTpCd'
	                , 'change .CAPWF508-pdTmpltCd-wrap': 'changePdTmpltCd'
	                , 'change #CAPWF508-pdCd-wrap': 'changePdCd'
					, 'click #btn-CAPWF508-stdAbrvtn': 'fn_createStdAbrvtn'
				    , 'keydown #searchKey' : 'fn_enter'
				    , 'keyup #stdEngAbrvtnNmKey': 'pressInputLengthChk'
                }
                

                /* ======================================================================== */
                /*   삭제 처리
                 /* ======================================================================== */
                , deleteTableDate: function () {
                    var that = this;
                    var sParam = {};
                    var header = new Object();
                    var headerParam = {};
                    var instInfo = commonInfo.getInstInfo();
                    instCdBase = instInfo.instCd;

                    var aprvlCndNbrBase = that.$el.find('.CAPWF508-base-table [data-form-param="aprvlCndNbr"]').val();
                    // UICME0004 필수 입력 항목입니다.
                    if (fn_isNull(aprvlCndNbrBase)) {
                        alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#aprvlCndNbr") + "]");
                        return;
                    }


                    // 입력항목 set
                    //기관코드
                    sParam.instCd = instCdBase;
                    // 결재조건번호
                    sParam.aprvlCndNbr = aprvlCndNbrBase;
                    // 테이블명
                    sParam.tblNm = that.$el.find('[data-form-param="tblNm"]').val();
                    // 확장속성명
                    sParam.xtnAtrbtNm = that.$el.find('[data-form-param="xtnAtrbtNm"]').val();


                    if (fn_isNull(sParam.tblNm)) {
                        alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#tblNm") + "]");
                        return;
                    }


                    if (fn_isNull(sParam.xtnAtrbtNm)) {
                        alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#xtnAtrbtNm") + "]");
                        return;
                    }

    				//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                    var linkData = {"header": fn_getHeader("CAPWF4028302"), "AprvlCndMgmtSvcAprvlCondXtnInfoIO": sParam};


                    // ajax 호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        success: function (responseData) {
                            // 에러여부 확인
                            if (fn_commonChekResult(responseData)) {
                            	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                that.resetCAPWF508Detl();


                                param = {}
                                param.instCd = instCdBase;
                                param.aprvlCndNbr = aprvlCndNbrBase;


                                // 재조회
                                that.trigger('loadData', param);
                            }
                        }   // end of success: function
                    });     // end of bxProxy
                }           // end of deletePWF508Detl: function
                
                , setDatePicker: function () {
                    fn_makeDatePicker(this.$el.find('#CAPWF508-base-table [data-form-param="aplyStartDt"]'));
                    fn_makeDatePicker(this.$el.find('#CAPWF508-base-table [data-form-param="aplyEndDt"]'));

                }
                
                ,setTimeInput: function () {
                    this.$el.find('#CAPWF508-condition-table [data-form-param="txStartHms"]').mask("99:99:99", {placeholder:"--:--:--"});
                    this.$el.find('#CAPWF508-condition-table [data-form-param="txEndHms"]').mask("99:99:99", {placeholder:"--:--:--"});
                }
                
                , popServiceSrch: function () {
    				var that = this;
    				var param = {};
    				param.instCd = that.instCd;
    			   this.popupService = new popupService(param);


    			    this.popupService.render();
    			    this.popupService.on('popUpSetData', function (param) {
    			    	that.$el.find('.CAPWF508-base-table [data-form-param="srvcCd"]').val(param.srvcCd);
    			    	that.$el.find('.CAPWF508-base-table [data-form-param="srvcNm"]').val(param.srvcNm);
    			    });

                }
                
                
                , popupAprvlTempltSrch: function () {
                	var that = this;
                    var param = {};

                    this.popupAprvlTmplt = new popupAprvlTmplt(param);
                    this.popupAprvlTmplt.render();
                    this.popupAprvlTmplt.on('popUpSetData', function (data) {
                		that.$el.find('.CAPWF508-base-table [data-form-param="aprvlTmpltId"]').val(data.aprvlTmpltId);
                		that.$el.find('.CAPWF508-base-table [data-form-param="aprvlTmpltNm"]').val(data.aprvlTmpltNm);
                    });
                }
                
                // 부서팝업
                , popupDeptId: function(event){
                	var that = this;
    				var param = {};
    				param.instCd =  $.sessionStorage('headerInstCd'); // 헤더의 기관코드
//    				param.gridType = 'tree';
//    				param.deptOrgnztnRelCd = '01';
    				param.dtogRelCd = '01'; //기본조직

    			    var popDeptIdObj = new popupDeptId(param);


    			    popDeptIdObj.render();
    			    popDeptIdObj.on('popUpSetData', function (param) {
    			    	that.$el.find('.CAPWF508-condition-table [data-form-param="txBrnchCd"]').val(param.brnchCd);
    			    });
    			}
                

                /**
                 * initialize
                 */
                , initialize: function (initData) {
                    var that = this;
                    //that.that = this;
                    comboBoxCount = 0;

                    var deleteList = [];


                    
                    $.extend(that, initData);
                    that.initData = initData;
                    console.log(initData);
                    that.setCombo();
                    if(  initData.param.aprvlCndNbr ){
                        that.$el.find('.CAPWF508-base-table [data-form-param="aprvlCndNbr"]').val(initData.param.aprvlCndNbr);       //결재조건번호
                        that.$el.find('#CAPWF508-base-table [data-form-param="aprvlCndNbr"]').val(initData.param.aprvlCndNbr);       //결재조건번호
                        //that.$el.find('[data-form-param="aprvlCndNbr"]').val('0000004');       //결재조건번호
                        var aprvlCndNbr = initData.param.aprvlCndNbr;
                        that.selectPWF508Base(aprvlCndNbr);
                        that.selSingle(aprvlCndNbr);
                    }

                    that.$el.html(that.tpl());
                    
                    // 콤보조회 서비스호출 준비
                    var sParam = {};
                    // 속성타입코드
                    sParam = {};
                    sParam.cdNbr = "10001";
                    var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};
	                  bxProxy.post(sUrl, JSON.stringify(linkData1), {
		                	enableLoading: true,
		                    success: function (responseData) {
		
		                        comboStore1 = new Ext.data.Store({
		                            fields: ['cd', 'cdNm'],
		                            data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
		                        });
		                       
		                    }   // end of suucess: fucntion
		                });     // end of bxProxy
		                    

                    // 속성검증방법코드
                    sParam = {};
                    sParam.cdNbr = "10002";
                    var linkData2 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};

	                  bxProxy.post(sUrl, JSON.stringify(linkData2), {
		                	enableLoading: true,
		                    success: function (responseData) {
		
		                        comboStore2 = new Ext.data.Store({
		                            fields: ['cd', 'cdNm'],
		                            data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
		                        });
		                       
		                    }   // end of suucess: fucntion
		                });     // end of bxProxy
		                    


                    /* ------------------------------------------------------------ */
                    that.CAPWF508Grid = new ExtGrid({
                        fields: ['aprvlCndNbr', 'tblNm', 'xtnAtrbtNm', 'atrbtTpCd', 'atrbtVldtnWayCd', 'vldtnRuleCntnt']
	                    , id: 'CAPWF508Grid'
	                    , columns: [
	                        {
	                            text: 'No.'
	                            , dataIndex: 'rowIndex',
	                            style: 'text-align:center',
	                            align: 'right'
	                            , sortable: false
	                            , width: 50
	                            , height : 25
	                            // other config you need....
	                            , renderer: function (value, metaData, record, rowIndex, colIndex, sotre) {
	                            return rowIndex + 1;
	                        }
	                        }
	                        , {text: "", width: 0, dataIndex: 'aprvlCndNbr', editor: 'textfield', hidden: true}
	                        , {
	                            text: bxMsg('cbb_items.AT#tblNm'), width: 100, dataIndex: 'tblNm', editor: 'textfield',
	                            style: 'text-align:center',
	                            align: 'left'
	                        }
	                        , {
	                            text: bxMsg('cbb_items.AT#xtnAtrbtNm'),
	                            width: 100,
	                            dataIndex: 'xtnAtrbtNm',
	                            editor: 'textfield',
	                            style: 'text-align:center',
	                            align: 'left'
	                        }
	                        , {
	                            text: bxMsg('cbb_items.AT#atrbtTpCd'), width: 100, dataIndex: 'atrbtTpCd',
	                            style: 'text-align:center',
	                            align: 'left'
	                            , editor: {
	                                xtype: 'combobox'
	                                , store: comboStore1
	                                , displayField: 'cdNm'
	                                , valueField: 'cd'
	                            }
	                            , renderer: function (val) {
	                                index = comboStore1.findExact('cd', val);
	                                if (index != -1) {
	                                    rs = comboStore1.getAt(index).data;
	                                    return rs.cdNm
	                                }
	                            } // end of render
	                        } // end of atrbtTpCd
	                        , {
	                            text: bxMsg('cbb_items.AT#atrbtVldtnWayCd'), width: 150, dataIndex: 'atrbtVldtnWayCd',
	                            style: 'text-align:center',
	                            align: 'left'
	                            , editor: {
	                                xtype: 'combobox'
	                                , store: comboStore2
	                                , displayField: 'cdNm'
	                                , valueField: 'cd'
	                            }
	                            , renderer: function (val) {
	                                index = comboStore2.findExact('cd', val);
	                                if (index != -1) {
	                                    rs = comboStore2.getAt(index).data;
	                                    return rs.cdNm
	                                }
	                            } // end of render
	                        } // end of atrbtVldtnWayCd
	                        , {
	                            text: bxMsg('cbb_items.AT#atrbtVldtnRuleCntnt'),
	                            width: 400,
	                            flex : 1,
	                            dataIndex: 'vldtnRuleCntnt',
	                            editor: 'textfield',
	                            style: 'text-align:center',
	                            align: 'left'
	                        }
	                    ] // end of columns
                        // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                        , gridConfig: {
                        	// 셀 에디팅 플러그인
                            plugins: [
                                Ext.create('Ext.grid.plugin.CellEditing', {
                                    // 2번 클릭시, 에디팅할 수 있도록 처리
                                    clicksToEdit: 2
                                    , listeners: {
                                    	'beforeedit': function (editor, e) {
                                            return false;
                                        } // end of edit
                                    } // end of listners
                                }) // end of Ext.create
                            ] // end of plugins
                        } // end of gridConfig
                        , listeners: {
                            click: {
                                element: 'body'
                                , fn: function () {
                                    //더블클릭시 이벤트 발생
                                    that.doubleiClickGrid();
                                }
                            }
                        }
                    });
                    // 단일탭 그리드 렌더
                    that.createGrid("single");
                   // that.setCAPWF508BaseData(that, '', "X");
                }


                /**
                 * render
                 */
                , render: function () {
                	 var that = this;
                	// 콤보데이터 로딩
                     var sParam = {};
                     var selectStyle = {};
                     that.setDatePicker();
                     that.setTimeInput();

                   //배포처리반영[버튼비활성화]
                     fn_btnCheckForDistribution([
                                         		this.$el.find('.CAPWF508-wrap #btn-base-save')
                                         		,this.$el.find('.CAPWF508-wrap #btn-base-delete')
                                         		,this.$el.find('.CAPWF508-wrap #btn-CAPWF508-detail-save')
//                                         		,this.$el.find('.CAPWF508-wrap #btn-CAPWF508-detail-delete')
                                         			   ]);
//                     var initData ={};
//                     initData.aprvlCndNbr ="0000005";
//                     that.selectPWF508Base(initData);
//                     that.setCombo();
                    return this.$el;
                }
                 /**
                 * 엔터 입력 처리를 위한 콜백함수
                 */
                ,fn_enter: function (event) {
	                var that = this;
                    var event = event || window.event;
                    var keyID = (event.which) ? event.which : event.keyCode;
                    if(keyID == 13) { //enter
                    	that.queryBaseArea();
                    }
                }
                , countCombobox: function () {
                    var that = this;


                    comboBoxCount += 1;

                    console.log(comboBoxCount);
                    console.log(that.$el.find('[data-form-param="aprvlCndNbr"]').val());
                    if(comboBoxCount == 7) {
                    	if(!fn_isEmpty(that.$el.find('[data-form-param="aprvlCndNbr"]').val())) {
                    	//	that.selectPWF508Base();
                    		that.selectPWF508Base(initData);
                    	}	
                    }
                }


                /**
                 * 입력 length 체크
                 */
                ,pressInputLengthChk: function (event) {
	                var that = this;
                    var targetValue = event.target.value;
                    if(targetValue.length >= 10){
                    	fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0057'));
                    	that.$el.find('.CAPWF508-detail-table [data-form-param="stdEngAbrvtnNm"]').val(targetValue.substring(0,5));
                    	return;
                    }




                }
                
                , setCombo :function () {
                    
                    var that = this;


                    // 콤보데이터 로딩
                    var sParam;

//                    sParam = {}; //데이터 초기화
//                    selectStyle = {}; //스타일 초기화
//                    //combobox 정보 셋팅
//                    sParam.className = "CAPWF508-stsCd-wrap";
//                    sParam.targetId = "stsCd";
//                    sParam.nullYn = "N";
//                    //inData 정보 셋팅
//                    sParam.cdNbr = "12307"; //승인상태코드
//                    // 콤보데이터 load
//                    fn_getCodeList(sParam, this, selectStyle);


                    //결재조건구분코드
//                    sParam = {};
//                    selectStyle = {};
//                    sParam.className = "CAPWF508-aprvlCndDscd-wrap";
//                    sParam.targetId = "aprvlCndDscd";
//                    sParam.nullYn = "N";
//                    sParam.cdNbr = "A0465";
//                    fn_getCodeList(sParam, this);
                    
                    //결재사유코드
                    sParam = {};
                    selectStyle = {};
                    sParam.className = "CAPWF508-aprvlRsnCd-wrap";
                    sParam.targetId = "aprvlRsnCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); 
                    sParam.cdNbr = "12303";
                    fn_getCodeList(sParam, this);
                    
                  

//                    sParam = {};
//                    //결재패턴구분코드
//                    sParam = {};
//                    selectStyle = {};
//                    sParam.className = "CAPWF508-aprvlPtrnDscd-wrap";
//                    sParam.targetId = "aprvlPtrnDscd";
//                    sParam.nullYn = "Y";
//                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); 
//                    sParam.cdNbr = "12302";
                   // fn_getCodeList(sParam, this);
                    fn_getCodeList(sParam, this, selectStyle, that.countCombobox.bind(that));
                    
                    sParam = {};
                    //컴포넌트
                    sParam = {};
                    selectStyle = {};
                    sParam.className = "CAPWF508-cmpntCd-wrap";
                    sParam.targetId = "cmpntCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); 
                    sParam.cdNbr = "11603";
                    //fn_getCodeList(sParam, this);
                    fn_getCodeList(sParam, this, selectStyle, that.countCombobox.bind(that));
                    
                    
                    //속성타입코드
                    sParam = {};
                    selectStyle = {};
                    sParam.className = "CAPWF508-atrbtTpCd-wrap";
                    sParam.targetId = "atrbtTpCd";
                    sParam.nullYn = "Y";
                    sParam.cdNbr = "10001";
                    //fn_getCodeList(sParam, this);
                    fn_getCodeList(sParam, this, selectStyle, that.countCombobox.bind(that));


                    //속성검증방법코드
                    sParam = {};
                    selectStyle = {};
                    sParam.className = "CAPWF508-atrbtVldtnWayCd-wrap";
                    sParam.targetId = "atrbtVldtnWayCd";
                    sParam.nullYn = "Y";
                    sParam.cdNbr = "A0019";
                    fn_getCodeList(sParam, this);
                    
                    
//                    sParam = {};
//                    sParam.cdNbr = "50026"; // 금액유형코드
//                    var linkData = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};
//
//
//                    // ajax호출
//                    bxProxy.post(sUrl, JSON.stringify(linkData), {
//                    	enableLoading: true,
//                        success: function (responseData) {
//
//
//                            if (fn_commonChekResult(responseData)) {
//                                //var cofirmStdAbrvtnOut = responseData.CaStdAbrvtnMgmtSvcCofirmStdAbrvtnOut;
//
//                                // add option to 검색조건 combobox 
//                                var comboParam = {};
//                                comboParam.className = "CAPWF508-amtTpCd-wrap";
//                                comboParam.targetId = "amtTpCd";
//                                comboParam.tblNm = responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;
//                                comboParam.valueNm = "cd";
//                                comboParam.textNm = "cdNm";
//                                comboParam.nullYn = "N";
//                                comboParam.allNm = bxMsg('cbb_items.SCRNITM#all');
//
//
//                                fn_makeComboBox(comboParam, that);
//                            }
//                        }   // end of suucess: fucntion
//                    });     // end of bxProxy
//                    
//                    //금액유형코드
                    sParam = {};
                    selectStyle = {};
                    sParam.className = "CAPWF508-amtTpCd-wrap";
                    sParam.targetId = "amtTpCd";
                    sParam.nullYn = "Y";
                    sParam.cdNbr = "50026";
                    sParam.disabled = false;
//                    sParam.allNm = bxMsg('cbb_items.CDVAL#5002600000'); 
                    //fn_getCodeList(sParam, this);
                    fn_getCodeList(sParam, this, selectStyle, that.countCombobox.bind(that));


//                    //통화코드
                    sParam = {};
                    selectStyle = {};
                    sParam.className = "CAPWF508-crncyCd-wrap";
                    sParam.targetId = "crncyCd";
                    sParam.nullYn = "Y";
                    sParam.cdNbr = "T0001";
                    sParam.disabled = true;
                   // fn_getCodeList(sParam, this);
                    fn_getCodeList(sParam, this, selectStyle, that.countCombobox.bind(that));


                    //거래부점구분코드
                    sParam = {};
                    selectStyle = {};
                    sParam.className = "CAPWF508-txBrnchDscd-wrap";
                    sParam.targetId = "txBrnchDscd";
                    sParam.nullYn = "Y";
                    sParam.cdNbr = "12305";
                    sParam.disabled = true;
                   // fn_getCodeList(sParam, this);
                    fn_getCodeList(sParam, this, selectStyle, that.countCombobox.bind(that));


                    //업무구분코드
                    sParam = {};
                    selectStyle = {};
                    sParam.className = "CAPWF508-bizDscd-wrap";
                    sParam.targetId = "bizDscd";
                    sParam.nullYn = "Y";
                    sParam.cdNbr = "80015";
                    sParam.disabled = true;
                    //fn_getCodeList(sParam, this);
                    fn_getCodeList(sParam, this);

                    
                }



                //상세부 초기화
                , resetDetailArea : function() {
                	var that = this;


                	that.$el.find('.CAPWF508-detail-table [data-form-param="tblNm"]').val("");
                	that.$el.find('.CAPWF508-detail-table [data-form-param="xtnAtrbtNm"]').val("");
                	that.$el.find('.CAPWF508-detail-table [data-form-param="atrbtTpCd"]').val("");
                	that.$el.find('.CAPWF508-detail-table [data-form-param="atrbtVldtnWayCd"]').val("");
                	that.$el.find('.CAPWF508-detail-table [data-form-param="vldtnRuleCntnt"]').val("");

                }
                /**
                 * 기본부 조회 버튼 클릭
                 */
                , queryBaseArea: function (sParam) {
                    var that = this;
                    that.selectPWF508Base(sParam);
                  //  that.inquiryBaseData(sParam);
                }
                
//                , setComboBind: function (cdNbr, targetId,that, isPd , bizDscd, pdTpCd, pdTmpltCd){
//                	//var that = this;
//                	 var sParam = {};
//                	 if( isPd){
//                		 	sParam = {};
//                            sParam.instCd = 'STDA';	//기관코드 추가
//                            sParam.bizDscd = bizDscd;
//                            sParam.pdTpCd = pdTpCd;
//                            sParam.pdTmpltCd = pdTmpltCd;
//                        
//                        var linkData = {"header": fn_getHeader("SPD0010401"), "PdTxSrvcMgmtSvcIn": sParam};
//
//
//                        // ajax호출
//                        bxProxy.post(sUrl, JSON.stringify(linkData), {
//                        	enableLoading: true,
//                            success: function (responseData) {
//
//
//                                if (fn_commonChekResult(responseData)) {
//                                    //var cofirmStdAbrvtnOut = responseData.CaStdAbrvtnMgmtSvcCofirmStdAbrvtnOut;
//
//                                    // add option to 검색조건 combobox 
//                                    var comboParam = {};
//                                    comboParam.className = "CAPWF508-"+targetId+"-wrap";
//                                    comboParam.targetId = targetId
//                                    comboParam.tblNm = responseData.PdTxSrvcMgmtSvcOut.tbl;
//                                    comboParam.valueNm = "pdCd";
//                                    comboParam.textNm = "pdNm";
//                                    comboParam.nullYn = "Y";
//                                   // comboParam.allNm = bxMsg('cbb_items.SCRNITM#all');
//
//
//                                    fn_makeComboBox(comboParam, that);
//                                }
//                               
//                            }   // end of suucess: fucntion
//                        });     // end of bxProxy
//                		  
//                	 }else{
//                		 sParam.cdNbr = cdNbr;
//                         var linkData = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};
//
//
//                         // ajax호출
//                         bxProxy.post(sUrl, JSON.stringify(linkData), {
//                         	enableLoading: true,
//                             success: function (responseData) {
//
//
//                                 if (fn_commonChekResult(responseData)) {
//                                     //var cofirmStdAbrvtnOut = responseData.CaStdAbrvtnMgmtSvcCofirmStdAbrvtnOut;
//
//                                     // add option to 검색조건 combobox 
//                                     var comboParam = {};
//                                     comboParam.className = "CAPWF508-"+targetId+"-wrap";
//                                     comboParam.targetId = targetId;
//                                     comboParam.tblNm = responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;
//                                     comboParam.valueNm = "cd";
//                                     comboParam.textNm = "cdNm";
//                                     comboParam.nullYn = "N";
//                                   //  comboParam.allNm = bxMsg('cbb_items.SCRNITM#all');
//
//
//                                     fn_makeComboBox(comboParam, that);
//                                  //   that.$el.find('.CAPWF508-condition-table [data-form-param="amtTpCd"]').val(outData.amtTpCd); 
//                                 }
//                             }   // end of suucess: fucntion
//                         });     // end of bxProxy
//                	 }
//                   
//                }

                /* ======================================================================== */
                /*    Click select btn                                                      */
                /* ======================================================================== */
                , selectPWF508Base: function (aprvlCndNbr) {
                    var that = this;
                    var sParam = {};
                    initFlag = false;
                    sParam.instCd = $.sessionStorage('headerInstCd');


                    instCdBase = sParam.instCd;


                    // 조회 key값 set
                    that.$el.find('.CAPWF508-base-table [data-form-param="aprvlCndNbr"]').val(aprvlCndNbr);       //결재조건번호
                    sParam.aprvlCndNbr = aprvlCndNbr;//결재조건번호


                    var linkData = {"header": fn_getHeader("CAPWF4028401"), "AprvlCndMgmtSvcGetAprvlCondDtlIn": sParam};


                    //ajax 호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {


                        success: function (responseData) {


                            // 에러여부 확인. 에러시 메시지 띄워주고 정상시 재조회 호출
                            if (fn_commonChekResult(responseData)) {
                                // 정상처리 메시지 출력
                               // alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));

                            	var outData = responseData.AprvlCndMgmtSvcGetAprvlCondDtlOut;
                                // 기본부 항목 set
                                if (outData.bizDscd == "") {
                                    that.setCAPWF508BaseData(that, outData, "X");
                                } else {
                                    bizDscd = "";
                                    pdTpCd = "";
                                    pdTmpltCd = "";
                                    pdCd = "";


                                    bizDscd = outData.bizDscd;
                                    pdTpCd = outData.pdTpCd;
                                    pdTmpltCd = outData.pdTmpltCd;
                                    pdCd = outData.pdCd;


//                                    if (bizDscd != null && bizDscd != "") {
//                                        //상품유형코드
//                                        sParam = {};
//                                        selectStyle = {};
//                                        sParam.nullYn = "Y";
//                                        sParam.targetId = "pdTpCd";
//                                        sParam.className = "CAPWF508-pdTpCd-wrap";
//                                        sParam.bizDscd = bizDscd;
//                                        sParam.pdTpCd = "";
//                                        sParam.pdTmpltCd = "";
//                                        sParam.pdCd = "";
//
//                                        if (outData.pdTpCd) {
//                                            sParam.selectVal = outData.pdTpCd;
//                                            //sParam.disabled = true;
//                                        }
//
//                                        fn_getPdCodeList(sParam, this, selectStyle);
//                                        that.$el.find('[data-form-param="pdTpCd"]').val(outData.pdTpCd);       //상품중분류코드
//                                    } else {
//                                        that.initPdTpCd();
//                                    }
                                    if (bizDscd != null && bizDscd != "") {
	                                    sParam = {};
	                                    sParam.instCd =  $.sessionStorage('headerInstCd'); // 헤더의 기관코드
	                                    sParam.bizDscd = bizDscd;
	                                    sParam.pdTpCd = "";
	                                    sParam.pdTmpltCd = "";
                                    
                                    var linkData = {"header": fn_getHeader("SPD0010401"), "PdTxSrvcMgmtSvcIn": sParam};


                                    // ajax호출
                                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                                    	enableLoading: true,
                                        success: function (responseData) {


                                            if (fn_commonChekResult(responseData)) {
                                                //var cofirmStdAbrvtnOut = responseData.CaStdAbrvtnMgmtSvcCofirmStdAbrvtnOut;

                                                // add option to 검색조건 combobox 
                                                var comboParam = {};
                                                comboParam.className = "CAPWF508-pdTpCd-wrap";
                                                comboParam.targetId = "pdTpCd";
                                                comboParam.tblNm = responseData.PdTxSrvcMgmtSvcOut.tbl;
                                                comboParam.valueNm = "pdCd";
                                                comboParam.textNm = "pdNm";
                                                comboParam.nullYn = "N";
                                                comboParam.allNm = bxMsg('cbb_items.SCRNITM#all');


                                                fn_makeComboBox(comboParam, that);
                                            }
                                            that.$el.find('[data-form-param="pdTpCd"]').val(outData.pdTpCd);  
                                        }   // end of suucess: fucntion
                                    });     // end of bxProxy
                                    }
//                                    serviceCd = "SPD0010401";
//                                }
//
//                                var linkData = {"header": fn_getHeader(serviceCd), "PdTxSrvcMgmtSvcIn": param};
                                    if (pdTpCd != null && pdTpCd != "") {
                                        //상품템플릿
	                                    sParam = {};
	                                    sParam.instCd = 'STDA';	//기관코드 추가
	                                    sParam.bizDscd = bizDscd;
	                                    sParam.pdTpCd = pdTpCd;
	                                    sParam.pdTmpltCd = "";
                                        
                                        var linkData = {"header": fn_getHeader("SPD0010401"), "PdTxSrvcMgmtSvcIn": sParam};


                                        // ajax호출
                                        bxProxy.post(sUrl, JSON.stringify(linkData), {
                                        	enableLoading: true,
                                            success: function (responseData) {


                                                if (fn_commonChekResult(responseData)) {
                                                    //var cofirmStdAbrvtnOut = responseData.CaStdAbrvtnMgmtSvcCofirmStdAbrvtnOut;

                                                    // add option to 검색조건 combobox 
                                                    var comboParam = {};
                                                    comboParam.className = "CAPWF508-pdTmpltCd-wrap";
                                                    comboParam.targetId = "pdTmpltCd";
                                                    comboParam.tblNm = responseData.PdTxSrvcMgmtSvcOut.tbl;
                                                    comboParam.valueNm = "pdCd";
                                                    comboParam.textNm = "pdNm";
                                                    comboParam.nullYn = "N";
                                                    comboParam.allNm = bxMsg('cbb_items.SCRNITM#all');


                                                    fn_makeComboBox(comboParam, that);
                                                }
                                                that.$el.find('[data-form-param="pdTmpltCd"]').val(outData.pdTmpltCd);  
                                            }   // end of suucess: fucntion
                                        });     // end of bxProxy
                                    } else {
                                        that.initPdTmpltCd();
                                    }


                                    if (pdTmpltCd != null && pdTmpltCd != "") {
                                        //상품코드
	                                    sParam = {};
	                                    sParam.instCd = 'STDA';	//기관코드 추가
	                                    sParam.bizDscd = bizDscd;
	                                    sParam.pdTpCd = pdTpCd;
	                                    sParam.pdTmpltCd = pdTmpltCd;
                                        
                                        var linkData = {"header": fn_getHeader("SPD0010401"), "PdTxSrvcMgmtSvcIn": sParam};


                                        // ajax호출
                                        bxProxy.post(sUrl, JSON.stringify(linkData), {
                                        	enableLoading: true,
                                            success: function (responseData) {


                                                if (fn_commonChekResult(responseData)) {
                                                    //var cofirmStdAbrvtnOut = responseData.CaStdAbrvtnMgmtSvcCofirmStdAbrvtnOut;

                                                    // add option to 검색조건 combobox 
                                                    var comboParam = {};
                                                    comboParam.className = "CAPWF508-pdCd-wrap";
                                                    comboParam.targetId = "pdCd";
                                                    comboParam.tblNm = responseData.PdTxSrvcMgmtSvcOut.tbl;
                                                    comboParam.valueNm = "pdCd";
                                                    comboParam.textNm = "pdNm";
                                                    comboParam.nullYn = "N";
                                                    comboParam.allNm = bxMsg('cbb_items.SCRNITM#all');


                                                    fn_makeComboBox(comboParam, that);
                                                }
                                                that.$el.find('[data-form-param="pdCd"]').val(outData.pdCd);  
                                            }   // end of suucess: fucntion
                                        });     // end of bxProxy
                                        

                                      //  fn_getPdCodeList(sParam, this, selectStyle, null);
                                    } else {
                                        that.initPdCd();
                                    }


                                    outData.aprvlCndNbr = aprvlCndNbr;


                                    // 기본부 항목 set
                                    that.setCAPWF508BaseData(that, outData, "R");


                                    // 첫번째 tab의 조회기능을 트리거하여 그리드도 처리함
                                    var param = {};
                                    param.instCd = instCdBase;
                                    param.aprvlCndNbr = that.$el.find('[data-form-param="aprvlCndNbr"]').val();

                                    sParam = {};
                                    sParam.cdNbr = "50026"; // 금액유형코드
                                    var linkData = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                                    // ajax호출
                                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                                    	enableLoading: true,
                                        success: function (responseData) {


                                            if (fn_commonChekResult(responseData)) {
                                                //var cofirmStdAbrvtnOut = responseData.CaStdAbrvtnMgmtSvcCofirmStdAbrvtnOut;

                                                // add option to 검색조건 combobox 
                                                var comboParam = {};
                                                comboParam.className = "CAPWF508-amtTpCd-wrap";
                                                comboParam.targetId = "amtTpCd";
                                                comboParam.tblNm = responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;
                                                comboParam.valueNm = "cd";
                                                comboParam.textNm = "cdNm";
                                                comboParam.nullYn = "N";

                                                fn_makeComboBox(comboParam, that);
                                            }
                                            that.$el.find('[data-form-param="amtTpCd"]').val(outData.amtTpCd);  
                                        }   // end of suucess: fucntion
                                    });     // end of bxProxy

                                    sParam = {};
                                    sParam.cdNbr = "T0001"; // 퉁화코드
                                    var linkData = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                                    // ajax호출
                                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                                    	enableLoading: true,
                                        success: function (responseData) {


                                            if (fn_commonChekResult(responseData)) {
                                                //var cofirmStdAbrvtnOut = responseData.CaStdAbrvtnMgmtSvcCofirmStdAbrvtnOut;

                                                // add option to 검색조건 combobox 
                                                var comboParam = {};
                                                comboParam.className = "CAPWF508-crncyCd-wrap";
                                                comboParam.targetId = "crncyCd";
                                                comboParam.tblNm = responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;
                                                comboParam.valueNm = "cd";
                                                comboParam.textNm = "cdNm";
                                                comboParam.nullYn = "N";
//                                                comboParam.allNm = bxMsg('cbb_items.SCRNITM#all');


                                                fn_makeComboBox(comboParam, that);
                                            }
                                            that.$el.find('[data-form-param="crncyCd"]').val(outData.crncyCd);  
                                        }   // end of suucess: fucntion
                                    });     // end of bxProxy
                                    
                                    sParam = {};
                                    sParam.cdNbr = "12303"; // 결재사유코드
                                    var linkData = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                                    // ajax호출
                                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                                    	enableLoading: true,
                                        success: function (responseData) {


                                            if (fn_commonChekResult(responseData)) {
                                                //var cofirmStdAbrvtnOut = responseData.CaStdAbrvtnMgmtSvcCofirmStdAbrvtnOut;

                                                // add option to 검색조건 combobox 
                                                var comboParam = {};
                                                comboParam.className = "CAPWF508-aprvlRsnCd-wrap";
                                                comboParam.targetId = "aprvlRsnCd";
                                                comboParam.tblNm = responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;
                                                comboParam.valueNm = "cd";
                                                comboParam.textNm = "cdNm";
                                                comboParam.nullYn = "Y";
                                                comboParam.allNm = bxMsg('cbb_items.SCRNITM#all');


                                               // fn_makeComboBox(comboParam, that);
                                                fn_makeComboBox(comboParam, that);
                                            }
                                            console.log(outData.aprvlRsnCd);
                                            that.$el.find('[data-form-param="aprvlRsnCd"]').val(outData.aprvlRsnCd);
                                        }   // end of suucess: fucntion
                                    
                                    });     // end of bxProxy
                                    
                                    sParam = {};
                                    sParam.cdNbr = "A0465"; // 결재조건구분코드
                                    var linkData = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                                    // ajax호출
//                                    bxProxy.post(sUrl, JSON.stringify(linkData), {
//                                    	enableLoading: true,
//                                        success: function (responseData) {
//
//
//                                            if (fn_commonChekResult(responseData)) {
//                                                //var cofirmStdAbrvtnOut = responseData.CaStdAbrvtnMgmtSvcCofirmStdAbrvtnOut;
//
//                                                // add option to 검색조건 combobox 
//                                                var comboParam = {};
//                                                comboParam.className = "CAPWF508-aprvlCndDscd-wrap";
//                                                comboParam.targetId = "aprvlCndDscd";
//                                                comboParam.tblNm = responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;
//                                                comboParam.valueNm = "cd";
//                                                comboParam.textNm = "cdNm";
//                                                comboParam.nullYn = "N";
//
//                                               // fn_makeComboBox(comboParam, that);
//                                                fn_makeComboBox(comboParam, that);
//                                            }
//                                            console.log(outData.aprvlCndDscd);
//                                            that.$el.find('[data-form-param="aprvlCndDscd"]').val(outData.aprvlCndDscd);
//                                        }   // end of suucess: fucntion
//                                    });     // end of bxProxy

                                    // 그리드부 재조회
                                   // that.trigger('loadData', param);


                                    //상세부에 조회된 분개규칙일련번호전달
                                  //  that.trigger('loadAprvlCndNbr', param);
                                }
                            }
                        } // end of success: function.....
                    }); // end of bxProxy.post....
                } // end of select function
                
                /* ======================================================================== */
                // 입출력항목 setting
                /* ======================================================================== */
                , setCAPWF508BaseData: function (that, outData, type) {
                    var that = this;


                    if (type == "X") {  // 초기화
                        that.$el.find('[data-form-param="aprvlCndNbr"]').val("");       //결재조건번호
                        //that.$el.find('[data-form-param="aprvlCndNbr"]').prop("disabled", false);
                        that.$el.find('[data-form-param="aplyStartDt"]').val(getCurrentDate("yyyy-mm-dd"));     //적용시작년월일
                        that.$el.find('[data-form-param="aplyEndDt"]').val("9999-12-31");     //적용종료년월일
                        that.$el.find('[data-form-param="srvcCd"]').val("");
                        that.$el.find('[data-form-param="srvcCd"]').prop("disabled", false); //서비스코드
                        that.$el.find('[data-form-param="srvcNm"]').val("");
                        //that.$el.find('[data-form-param="aprvlPtrnDscd"]').val("");       //결재패턴구분코드
                       // that.$el.find('[data-form-param="stsCd"]').val('1');//결재조건상태코드
                      //  that.$el.find('[data-form-param="stsCd"]').prop("disabled", false);//결재조건상태코드
                        that.$el.find('[data-form-param="aprvlTmpltId"]').val("");       //결재탬플릿식별자
                        that.$el.find('[data-form-param="aprvlRsnCd"]').val("");//결재사유코드
                        that.$el.find('[data-form-param="aprvlRsnCd"]').prop("disabled", false);//결재사유코드


                        //금액조건여부 초기화시 체크해제 및 코드 비활성화
                        that.$el.find('[data-form-param="amtCndYn"]').val("N");       //금액조건여부
                        that.$el.find('[data-form-param="amtCndYn"]').prop("checked", false);
                      //  that.$el.find('[data-form-param="amtTpCd"]').val("");
                        that.$el.find('[data-form-param="amtTpCd"]').prop("disabled", true);
                        that.$el.find('[data-form-param="amtCndMinVal"]').val(0);
                        that.$el.find('[data-form-param="amtCndMaxVal"]').val(0);
                        that.$el.find('[data-form-param="amtCndMinVal"]').prop("disabled", true);
                        that.$el.find('[data-form-param="amtCndMaxVal"]').prop("disabled", true);


                        //통화코드조건여부 초기화시 체크해제 및 코드 비활성화
                        that.$el.find('[data-form-param="crncyCdCndYn"]').val("N");       //통화코드조건여부
                        that.$el.find('[data-form-param="crncyCdCndYn"]').prop("checked", false);
                        that.$el.find('[data-form-param="crncyCd"]').val("");
                        that.$el.find('[data-form-param="crncyCd"]').prop("disabled", true);


                        //거래시각조건여부 초기화시 체크해제 및 코드 비활성화
                        that.$el.find('[data-form-param="txHmsCndYn"]').val("N");       //거래시각조건여부
                        that.$el.find('[data-form-param="txHmsCndYn"]').prop("checked", false);
                        that.$el.find('[data-form-param="txStartHms"]').val("00:00");
                        that.$el.find('[data-form-param="txStartHms"]').prop("disabled", true);
                        that.$el.find('[data-form-param="txEndHms"]').val("00:00");
                        that.$el.find('[data-form-param="txEndHms"]').prop("disabled", true);


                        //거래부점구분조건여부 초기화시 체크해제 및 코드 비활성화
                        that.$el.find('[data-form-param="txBrnchDscdCndYn"]').val("N");       //거래부점구분조건여부
                        that.$el.find('[data-form-param="txBrnchDscdCndYn"]').prop("checked", false);
                        that.$el.find('[data-form-param="txBrnchDscd"]').val("");
                        that.$el.find('[data-form-param="txBrnchDscd"]').prop("disabled", true);


                        //거래부점조건여부 초기화시 체크해제 및 코드 비활성화
                        that.$el.find('[data-form-param="txBrnchCndYn"]').val("N");       //거래부점조건여부
                        that.$el.find('[data-form-param="txBrnchCndYn"]').prop("checked", false);
                        that.$el.find('[data-form-param="txBrnchCd"]').val("");
                        that.$el.find('[data-form-param="txBrnchCd"]').prop("disabled", true);


                        //상품분류조건여부 초기화시 체크해제 및 코드 비활성화
                        that.$el.find('[data-form-param="pdCndYn"]').val("N");       //상품분류조건여부
                        that.$el.find('[data-form-param="pdCndYn"]').prop("checked", false);
                        that.$el.find('[data-form-param="bizDscd"]').prop("disabled", true);
                        that.$el.find('[data-form-param="pdTpCd"]').prop("disabled", true);
                        that.$el.find('[data-form-param="pdTmpltCd"]').prop("disabled", true);
                        that.$el.find('[data-form-param="pdCd"]').prop("disabled", true);
                        that.$el.find('[data-form-param="bizDscd"]').val("");       //업무구분코드
                        that.$el.find('[data-form-param="pdTpCd"]').val("");       //상품유형코드
                        that.$el.find('[data-form-param="pdTmpltCd"]').val("");       //상품템플릿코드
                        that.$el.find('[data-form-param="pdCd"]').val("");       //상품코드
                        
//                        
//                        that.fn_amtCndYnCheck();
//                        that.fn_crncyCdCndYnCheck();
//                        that.fn_txHmsCndYnCheck();
//                        that.fn_txBrnchDscdCndYnCheck();
//                        that.fn_txBrnchCndYnCheck();
//                        that.fn_pdClCndYnCheck();
                    }
                    else if (type == "P") {
                        that.$el.find('[data-form-param="bizDscd"]').val(bizDscd);       //업무구분코드
                        that.$el.find('[data-form-param="pdTpCd"]').val(pdTpCd);       //상품유형코드
                        that.$el.find('[data-form-param="pdTmpltCd"]').val(pdTmpltCd);       //상품템플릿코드
                        that.$el.find('[data-form-param="pdCd"]').val(pdCd);       //상품코드
                        that.$el.find('[data-form-param="pdNm"]').val(pdNm);       //상품명
                    }
                    else {
                    	console.log(outData);
                        that.$el.find('[data-form-param="aprvlCndNbr"]').val(outData.aprvlCndNbr);       //결재조건번호
                        that.$el.find('[data-form-param="aprvlCndNbr"]').prop("disabled", false);//결재조건번호 disabled
                        that.$el.find('[data-form-param="aplyStartDt"]').val( XDate(outData.aplyStartDt).toString('yyyy-MM-dd')); //적용시작년월일
                        that.$el.find('[data-form-param="aplyEndDt"]').val(XDate(outData.aplyEndDt).toString('yyyy-MM-dd')); //적용종료년월일
                        that.$el.find('[data-form-param="srvcCd"]').val(outData.srvcCd); //서비스코드
                        that.$el.find('[data-form-param="srvcNm"]').val(outData.srvcNm); //서비스명
                        //that.$el.find('[data-form-param="aprvlPtrnDscd"]').val(outData.aprvlPtrnDscd);       //결재패턴구분코드
                       // that.$el.find('[data-form-param="stsCd"]').val(outData.stsCd);//결재조건상태코드
                        that.$el.find('[data-form-param="aprvlTmpltId"]').val(outData.aprvlTmpltId);       //결재탬플릿식별자
                        that.$el.find('[data-form-param="aprvlTmpltNm"]').val(outData.aprvlTmpltNm);       //워크플로우명
                        that.$el.find('[data-form-param="aprvlRsnCd"]').val(outData.aprvlRsnCd);//결재사유코드


                        that.$el.find('[data-form-param="amtCndYn"]').val(outData.amtCndYn); //금액조건여부
                        that.$el.find('[data-form-param="crncyCdCndYn"]').val(outData.crncyCdCndYn);       //통화코드조건여부
                        that.$el.find('[data-form-param="txHmsCndYn"]').val(outData.txHmsCndYn);//거래시각조건여부
                        that.$el.find('[data-form-param="txBrnchDscdCndYn"]').val(outData.txBrnchDscdCndYn);       //거래부점구분조건여부
                        that.$el.find('[data-form-param="txBrnchCndYn"]').val(outData.txBrnchCndYn);//거래부점조건여부
                        that.$el.find('[data-form-param="pdCndYn"]').val(outData.pdCndYn);//상품분류코드여부

                        if (that.$el.find('[data-form-param="amtCndYn"]').val() == "Y") {
                            that.$el.find('[data-form-param="amtCndYn"]').prop("checked", true);
                           // that.$el.find('[data-form-param="amtTpCd"]').prop("disabled", false);
                            that.$el.find('[data-form-param="amtCndMinVal"]').prop("disabled", false);
                            that.$el.find('[data-form-param="amtCndMaxVal"]').prop("disabled", false);
                            console.log(outData.amtTpCd);
                            that.$el.find('[data-form-param="amtTpCd"]').val(outData.amtTpCd);  
                            //that.$el.find('[data-form-param="amtTpCd"]').val(outData.amtTpCd);       //금액유형코드
                            that.$el.find('[data-form-param="amtCndMinVal"]').val(outData.amtCndMinVal);
                            that.$el.find('[data-form-param="amtCndMaxVal"]').val(outData.amtCndMaxVal);
                        } else {
                            that.$el.find('[data-form-param="amtCndYn"]').prop("checked", false);
                            that.$el.find('[data-form-param="amtTpCd"]').prop("disabled", true);
                            that.$el.find('[data-form-param="amtCndMinVal"]').prop("disabled", true);
                            that.$el.find('[data-form-param="amtCndMaxVal"]').prop("disabled", true);
                        }//금액조건여부


                        if (that.$el.find('[data-form-param="crncyCdCndYn"]').val() == "Y") {
                            that.$el.find('[data-form-param="crncyCdCndYn"]').prop("checked", true);
                            that.$el.find('[data-form-param="crncyCd"]').prop("disabled", false);
                            that.$el.find('[data-form-param="crncyCd"]').val(outData.crncyCd);       //통화코드
                        } else {
                            that.$el.find('[data-form-param="crncyCdCndYn"]').prop("checked", false);
                            that.$el.find('[data-form-param="crncyCd"]').prop("disabled", true);
                        }//통화코드조건여부

                        if (that.$el.find('[data-form-param="txHmsCndYn"]').val() == "Y") {
                            that.$el.find('[data-form-param="txHmsCndYn"]').prop("checked", true);
                            that.$el.find('[data-form-param="txStartHms"]').prop("disabled", false);
                            that.$el.find('[data-form-param="txEndHms"]').prop("disabled", false);
                            that.$el.find('[data-form-param="txStartHms"]').val(fn_setTimeValue(outData.txStartHms));       //거래시작시각
                            that.$el.find('.CAPWF508-condition-table [data-form-param="txEndHms"]').val(fn_setTimeValue(outData.txEndHms));       //거래종료시각
                        } else {
                            that.$el.find('[data-form-param="txHmsCndYn"]').prop("checked", false);
                            that.$el.find('[data-form-param="txStartHms"]').prop("disabled", true);
                            that.$el.find('[data-form-param="txEndHms"]').prop("disabled", true);
                        }//거래시각조건여부

                        if (that.$el.find('[data-form-param="txBrnchDscdCndYn"]').val() == "Y") {
                            that.$el.find('[data-form-param="txBrnchDscdCndYn"]').prop("checked", true);
                            that.$el.find('[data-form-param="txBrnchDscd"]').prop("disabled", false);
                            that.$el.find('[data-form-param="txBrnchDscd"]').val(outData.txBrnchDscd);       //거래부점구분코드
                        } else {
                            that.$el.find('[data-form-param="txBrnchDscdCndYn"]').prop("checked", false);
                            that.$el.find('[data-form-param="txBrnchDscd"]').prop("disabled", true);
                        }//거래부점구분조건여부


                        if (that.$el.find('[data-form-param="txBrnchCndYn"]').val() == "Y") {
                            that.$el.find('[data-form-param="txBrnchCndYn"]').prop("checked", true);
                            that.$el.find('[data-form-param="txBrnchCd"]').prop("disabled", false);
                            that.$el.find('[data-form-param="txBrnchCd"]').val(outData.txBrnchCd);       //거래부점코드
                        } else {
                            that.$el.find('[data-form-param="txBrnchCndYn"]').prop("checked", false);
                            that.$el.find('[data-form-param="txBrnchCd"]').prop("disabled", true);
                        }//거래부점조건여부


                        if (that.$el.find('[data-form-param="pdCndYn"]').val() == "Y") {
                            that.$el.find('[data-form-param="pdCndYn"]').prop("checked", true);
                            that.$el.find('[data-form-param="bizDscd"]').val(outData.bizDscd);       //상품대분류코드
                            that.$el.find('[data-form-param="pdTpCd"]').val(outData.pdTpCd);       //상품중분류코드
                            that.$el.find('[data-form-param="pdTmpltCd"]').val(outData.pdTmpltCd);       //상품템플릿코드
                            that.$el.find('[data-form-param="pdCd"]').val(outData.pdCd);       //상품코드


                            that.$el.find('[data-form-param="bizDscd"]').prop('disabled', false);
                            that.$el.find('[data-form-param="pdTpCd"]').prop('disabled', false);
                            that.$el.find('[data-form-param="pdTmpltCd"]').prop('disabled', false);
                            that.$el.find('[data-form-param="pdCd"]').prop('disabled', false);
                        } else {
                            //상품코드 초기화
                            that.initPdTpCd();
                            that.initPdTmpltCd();
                            that.initPdCd();
                            that.$el.find('[data-form-param="pdCndYn"]').prop("checked", false);
                            that.$el.find('[data-form-param="bizDscd"]').prop("disabled", true);       //업무구분코드
                            that.$el.find('[data-form-param="pdTpCd"]').prop("disabled", true);       //상품유형코드
                            that.$el.find('[data-form-param="pdTmpltCd"]').prop("disabled", true);       //상품템플릿코드
                            that.$el.find('[data-form-param="pdCd"]').prop("disabled", true);               //상품코드
                        }//상품분류코드여부
                    }
                }

                /**
                 * 기본부 정보로 그리드 조회
                 */
                , inquiryBaseData: function (param) {
                    // header 정보 set
                    var that = this;
                    var sParam = {};


                    sParam.engWrdNm = that.$el.find('.CAPWF508-base-table [data-form-param="engWrdNm"]').val().toLowerCase();
                    sParam.stdEngAbrvtnNm = that.$el.find('.CAPWF508-base-table [data-form-param="stdEngAbrvtnNm"]').val().toLowerCase();
                    sParam.useLngWrdNm = that.$el.find('.CAPWF508-base-table [data-form-param="useLngWrdNm"]').val();


                    if (fn_isEmpty(sParam.engWrdNm) && fn_isEmpty(sParam.stdEngAbrvtnNm) && fn_isEmpty(sParam.useLngWrdNm)) {
                    	fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0014'));
                        return;
                    }


                    var linkData = {"header": fn_getHeader("CAPWF5088401"), "CaStdAbrvtnMgmtSvcGetStdAbrvtnListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                var tbList = responseData.CaStdAbrvtnMgmtSvcGetStdAbrvtnListOut.abrvtnList;
                                var totCnt = responseData.CaStdAbrvtnMgmtSvcGetStdAbrvtnListOut.length;


                                if (tbList != null || tbList.length > 0) {
                                    that.CAPWF508Grid.setData(tbList);
                                    that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(tbList.length)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                    // 삭제 로우 초기화
                                    that.deleteList = [];
                                    that.resetDetailArea();
                                }
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                } // end
               
                , selSingle: function (aprvlCndNbr) {
                    chkAddcol = false;
                    var that = this;
                    var sParam = {};

                    // 입력 Key값 set
                    sParam.instCd = $.sessionStorage('headerInstCd');
                    sParam.aprvlCndNbr = aprvlCndNbr;  // 승인조건번호


                    var linkData = {"header": fn_getHeader("CAPWF4028401"), "AprvlCndMgmtSvcGetAprvlCondDtlIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        //loading 설정
                        enableLoading: true,
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                var tbList = responseData.AprvlCndMgmtSvcGetAprvlCondDtlOut.xtnAtrList;
                                if (tbList != null || tbList.length > 0) {
                                    that.CAPWF508Grid.setData(tbList);
                                    that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(tbList.length)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                }
                                else {
                                	initFlag = false;
                                    that.CAPWF508Grid.resetData();
                                }
                            }
                        }   // end of suucess: fucntion
                    });     // end of bxProxy
                } // end of 조회

                // 그리드 저장(삭제)버튼 클릭
                , clickDeleteGrid : function(event) {
                	if(this.deleteList.length < 1) {
                		return;
                	}
                	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), this.deleteGrid, this);
                } 


                // 그리드 삭제
                , deleteGrid : function(that) {
                	var tbl = [];
                	var sParam = {};


                	if(that.deleteList.length > 0) {
                		$(that.deleteList).each(function(idx, data) {
                			var delParam = {};
                			delParam.engWrdNm = data.engWrdNm;
                			delParam.stdEngAbrvtnNm = data.stdEngAbrvtnNm;
                			tbl.push(delParam);
                		});


                		sParam.tblNm = tbl;


                		var linkData = {"header": fn_getHeader("CAPWF5088301"), "CaStdAbrvtnMgmtSvcRemoveStdAbrvtnListIn": sParam};


                            // ajax호출
                            bxProxy.post(sUrl, JSON.stringify(linkData), {
                                enableLoading: true
                                , success: function (responseData) {
                                    if (fn_commonChekResult(responseData)) {
                                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                        that.queryBaseArea();
                                    }
                                }   // end of suucess: fucntion
                            }); // end of bxProxy
                	}
                	else {
                		return;
                	}


                }


                // 상세 저장 버튼 클릭
                , clickSaveDetail : function(event) {
                	fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveDetail, this);
                }


              


               
                /**
                 * 그리드 생성
                 */
                , createGrid: function () {
                    var that = this;


                    this.$el.find(".CAPWF508-grid").html(this.CAPWF508Grid.render({'height': CaGridHeight}));
                } // end of createGrid


                /**
                 * 그리드 행 더블클릭
                 */
                , doubleiClickGrid: function () {


                    var that = this;
                    var selectedRecord = that.CAPWF508Grid.grid.getSelectionModel().selected.items[0];


                    if (!selectedRecord) {
                        return;
                    } else {
                    	that.$el.find('.CAPWF508-detail-table [data-form-param="tblNm"]').val(selectedRecord.data.tblNm);
                    	that.$el.find('.CAPWF508-detail-table [data-form-param="xtnAtrbtNm"]').val(selectedRecord.data.xtnAtrbtNm);
                    	that.$el.find('.CAPWF508-detail-table [data-form-param="atrbtTpCd"]').val(selectedRecord.data.atrbtTpCd);
                    	that.$el.find('.CAPWF508-detail-table [data-form-param="atrbtVldtnWayCd"]').val(selectedRecord.data.atrbtVldtnWayCd);
                    	that.$el.find('.CAPWF508-detail-table [data-form-param="vldtnRuleCntnt"]').val(selectedRecord.data.vldtnRuleCntnt);

//
//                    	that.$el.find('.CAPWF508-detail-table [data-form-param="engWrdNm"]').prop("readonly", true);
//                    	that.$el.find('.CAPWF508-detail-table [data-form-param="stdEngAbrvtnNm"]').prop("readonly", true);
//                    	that.$el.find('.CAPWF508-detail-table #btn-CAPWF508-stdAbrvtn').hide();
                    }
                }


                // 조회조건영역 toggle
                , baseSearchModal : function() {
                	var that = this;
                	fn_pageLayerCtrl("#CAPWF508-base-table", this.$el.find("#btn-base-search-modal"));
                }
                
                , detailSearchModal : function() {
                	var that = this;
                	fn_pageLayerCtrl("#CAPWF508-condition-table", this.$el.find("#btn-CAPWF508-detail-toggle"));
                }

                
                // 그리드영역 toggle
                , gridAreaModal : function() {
                	var that = this;
                	fn_pageLayerCtrl("#CAPWF508-grid", this.$el.find("#btn-up-grid"));
                }


                // 상세영역 toggle
                , detailModal : function() {
                	var that = this;
                	fn_pageLayerCtrl(".CAPWF508-detail-table", this.$el.find("#btn-CAPWF501-detail-toggle"));
                }


                // 그리드 내용 엑셀 다운로드
                , gridExcel : function() {
                	var that = this;
                	that.CAPWF508Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPWF508')+"_"+getCurrentDate("yyyy-mm-dd"));
                }
                /* ======================================================================== */
                /*    상품중분류코드 초기화                                */
                /* ======================================================================== */
                , initPdTpCd: function () {
                    var sParam = {};
                    var selectStyle = {};
                    // 상품템플릿코드 리셋
                    selectStyle = {};//'width':100};


                    sParam.className = "CAPWF508-pdTpCd-wrap";
                    sParam.targetId = "pdTpCd";
                    //상품중분류코드
                    fn_getEmptyCombo(sParam, this, selectStyle);
                }


                /* ======================================================================== */
                /*    상품템플릿코드 초기화                                */
                /* ======================================================================== */
                , initPdTmpltCd: function () {
                    var sParam = {};
                    var selectStyle = {};
                    // 상품템플릿코드 리셋
                    selectStyle = {};//'width':100};


                    sParam.className = "CAPWF508-pdTmpltCd-wrap";
                    sParam.targetId = "pdTmpltCd";
                    //상품중분류코드
                    fn_getEmptyCombo(sParam, this, selectStyle);
                }


                /* ======================================================================== */
                /*    상품코드 초기화                                */
                /* ======================================================================== */
                , initPdCd: function () {
                    var sParam = {};
                    var selectStyle = {};
                    // 상품템플릿코드 리셋
                    selectStyle = {};//'width':100};


                    sParam.className = "CAPWF508-pdCd-wrap";
                    sParam.targetId = "pdCd";
                    //상품중분류코드
                    fn_getEmptyCombo(sParam, this, selectStyle);
                }
                
                /* ======================================================================== */
                /*    Click 금액조건여부 btn                                                       */
                /* ======================================================================== */
                , fn_amtCndYnCheck: function () {
                    var that = this;
                    var amtCndYn =  this.$el.find('#amtCndYn').is(":checked");

                    if (!amtCndYn) {
                        that.$el.find('[data-form-param="amtCndYn"]').val("N");
                       // that.$el.find('[data-form-param="amtTpCd"]').val("");
                        that.$el.find('[data-form-param="amtCndMinVal"]').val("");
                        that.$el.find('[data-form-param="amtCndMaxVal"]').val("");
                        that.$el.find('[data-form-param="amtTpCd"]').prop("disabled", true);
                        that.$el.find('[data-form-param="amtCndMinVal"]').prop("disabled", true);
                        that.$el.find('[data-form-param="amtCndMaxVal"]').prop("disabled", true);
                    } else {
                        that.$el.find('[data-form-param="amtCndYn"]').val("Y");
                        that.$el.find('[data-form-param="amtTpCd"]').prop("disabled", false);
                        //that.$el.find('[data-form-param="amtCndMinVal"]').val("");
                        //that.$el.find('[data-form-param="amtCndMaxVal"]').val("");
                        that.$el.find('[data-form-param="amtCndMinVal"]').prop("disabled", false);
                        that.$el.find('[data-form-param="amtCndMaxVal"]').prop("disabled", false);
                    }
                }


                /* ======================================================================== */
                /*    Click 통화코드조건여부 btn                                                       */
                /* ======================================================================== */
                , fn_crncyCdCndYnCheck: function () {
                    var that = this;
                    var crncyCdCndYn =  this.$el.find('#crncyCdCndYn').is(":checked");
                    if (!crncyCdCndYn) {
                        that.$el.find('[data-form-param="crncyCdCndYn"]').val("N");
                       // that.$el.find('[data-form-param="crncyCd"]').val("");
                        that.$el.find('[data-form-param="crncyCd"]').prop("disabled", true);
                    } else {
                        that.$el.find('[data-form-param="crncyCdCndYn"]').val("Y");
                        that.$el.find('[data-form-param="crncyCd"]').prop("disabled", false);
                    }
                }


                /* ======================================================================== */
                /*    Click 거래시각조건여부 btn                                                       */
                /* ======================================================================== */
                , fn_txHmsCndYnCheck: function () {
                    var that = this;
                    var txHmsCndYn =  this.$el.find('#txHmsCndYn').is(":checked");

                    if (!txHmsCndYn) {
                        that.$el.find('[data-form-param="txHmsCndYn"]').val("N");
                        that.$el.find('[data-form-param="txStartHms"]').val("");
                        that.$el.find('[data-form-param="txStartHms"]').prop("disabled", true);
                        that.$el.find('[data-form-param="txEndHms"]').val("");
                        that.$el.find('[data-form-param="txEndHms"]').prop("disabled", true);
                    } else {
                        that.$el.find('[data-form-param="txHmsCndYn"]').val("Y");
                        that.$el.find('[data-form-param="txStartHms"]').prop("disabled", false);
                        that.$el.find('[data-form-param="txEndHms"]').prop("disabled", false);
                    }
                }


                /* ======================================================================== */
                /*    Click 거래부점구분조건여부 btn                                                       */
                /* ======================================================================== */
                , fn_txBrnchDscdCndYnCheck: function () {
                    var that = this;
                    var txBrnchDscdCndYn =  this.$el.find('#txBrnchDscdCndYn').is(":checked");
                    if (!txBrnchDscdCndYn) {
                        that.$el.find('[data-form-param="txBrnchDscdCndYn"]').val("N");
                        that.$el.find('[data-form-param="txBrnchDscd"]').val("");
                        that.$el.find('[data-form-param="txBrnchDscd"]').prop("disabled", true);
                    } else{
                        that.$el.find('[data-form-param="txBrnchDscdCndYn"]').val("Y");
                        that.$el.find('[data-form-param="txBrnchDscd"]').prop("disabled", false);
                    }
                }


                /* ======================================================================== */
                /*    Click 거래부점조건여부 btn                                                       */
                /* ======================================================================== */
                , fn_txBrnchCndYnCheck: function () {
                    var that = this;
                    var txBrnchCndYn =  this.$el.find('#txBrnchCndYn').is(":checked");
                    if (!txBrnchCndYn) {
                        that.$el.find('[data-form-param="txBrnchCndYn"]').val("N");
                        that.$el.find('[data-form-param="txBrnchCd"]').val("");
                        that.$el.find('[data-form-param="txBrnchCd"]').prop("disabled", true);
                    } else {
                        that.$el.find('[data-form-param="txBrnchCndYn"]').val("Y");
                        that.$el.find('[data-form-param="txBrnchCd"]').prop("disabled", false);
                    }
                }


                /* ======================================================================== */
                /*    Click 상품분류조건여부 btn                                                       */
                /* ======================================================================== */
                , fn_pdClCndYnCheck: function () {
                    var that = this;
                    var pdCndYn ="";

					if(that.$el.find('.CAPWF508-condition-table [data-form-param="pdCndYn"]').is(":checked")) {
						pdCndYn = "Y";
					}
					else {
						pdCndYn = "N";
					}
					
                    if (pdCndYn == 'N') {
                        that.$el.find('[data-form-param="pdCndYn"]').val("N");


                        that.$el.find('[data-form-param="bizDscd"]').val("");
                        that.$el.find('[data-form-param="pdTpCd"]').val("");
                        that.$el.find('[data-form-param="pdTmpltCd"]').val("");
                        that.$el.find('[data-form-param="pdCd"]').val("");


                        that.$el.find('[data-form-param="bizDscd"]').prop("disabled", true);
                        that.$el.find('[data-form-param="pdTpCd"]').prop("disabled", true);
                        that.$el.find('[data-form-param="pdTmpltCd"]').prop("disabled", true);
                        that.$el.find('[data-form-param="pdCd"]').prop("disabled", true);
                    } else if (pdCndYn =='Y') {
                        that.$el.find('[data-form-param="pdCndYn"]').val("Y");
                        that.$el.find('[data-form-param="bizDscd"]').prop("disabled", false);
                        that.$el.find('[data-form-param="pdTpCd"]').prop("disabled", false);
                        that.$el.find('[data-form-param="pdTmpltCd"]').prop("disabled", false);
                        that.$el.find('[data-form-param="pdCd"]').prop("disabled", false);
                    }
                }
                
                /* ======================================================================== */
                /*  상품 대분류코드 변경 event 처리 */
                /* ======================================================================== */
                , changeBizDscd: function () {
                    var that = this;
                    var sParam = {};
                    var selectStyle = {};
                    var param = {};
                    // 상품대분류코드
                    var bizDscd = that.$el.find('[data-form-param="bizDscd"]').val();


                    //상품중분류코드 재조회
                    param.bizDscd = bizDscd;
                    that.selectPdTpCd(param);
                }


                /* ======================================================================== */
                /*  상품 중분류코드 변경 event 처리 */
                /* ======================================================================== */
                , changePdTpCd: function () {
                    var that = this;
                    var sParam = {};
                    var selectStyle = {};
                    var param = {};
                    // 상품중분류코드
                    var pdTpCd = that.$el.find('[data-form-param="pdTpCd"]').val();


                    // 상품대분류코드+ 상품중분류코드
                    param.bizDscd = that.$el.find('[data-form-param="bizDscd"]').val();
                    param.pdTpCd = pdTpCd;


                    //상품템플릿코드 재조회
                    that.selectPdTmpltCd(param);
                }
                /* ======================================================================== */
                /*	  상품템플릿코드 변경 event 처리 */
                /* ======================================================================== */
                , changePdTmpltCd: function () {
                    var that = this;
                    var sParam = {};
                    var selectStyle = {};
                    var param = {};
                    // 상품템플릿코드
                    var pdTmpltCd = that.$el.find('[data-form-param="pdTmpltCd"]').val();




                    // 상품대분류코드+ 상품중분류코드
                    param.bizDscd = that.$el.find('[data-form-param="bizDscd"]').val();
                    param.pdTpCd = that.$el.find('[data-form-param="pdTpCd"]').val();
                    param.pdTmpltCd = pdTmpltCd;


                    //상품템플릿코드 재조회
                    that.selectPdCd(param);
                }
                
                /* ======================================================================== */
                /*    상품탬플릿코드 조회                                */
                /* ======================================================================== */
                , selectPdTmpltCd: function (param) {
                    var that = this;
                    var sParam = {};
                    var selectStyle = {};
                    sParam = {}; //데이터 초기화
                    selectStyle = {}; //스타일 초기화


                    if (param.pdTpCd == "") {
                        //상품템플릿 초기화
                        that.initPdTmpltCd();
                    }
                    else {
                        //combobox 정보 셋팅
                        sParam.className = "CAPWF508-pdTmpltCd-wrap";
                        sParam.targetId = "pdTmpltCd";
                        sParam.nullYn = "Y";
                        //inData 정보 셋팅
                        sParam.instCd = $.sessionStorage('headerInstCd');
                        sParam.bizDscd = param.bizDscd;
                        sParam.pdTpCd = param.pdTpCd;
                        // 상품탬플릿코드 콤보데이터 load
                        fn_getPdCodeList(sParam, this, selectStyle);
                    }


                    that.initPdCd();
                }


                /* ======================================================================== */
                /*  상품 중분류코드 조회 */
                /* ======================================================================== */
                , selectPdTpCd: function (param) {
                    var that = this;
                    var sParam = {};
                    var selectStyle = {};
                    sParam = {}; //데이터 초기화
                    selectStyle = {}; //스타일 초기화


                    if (param.bizDscd == "") {
                        //상품중분류코드 초기화
                        that.initPdTpCd();
                    }
                    else {
                        //combobox 정보 셋팅
                        sParam.className = "CAPWF508-pdTpCd-wrap";
                        sParam.targetId = "pdTpCd";
                        sParam.nullYn = "Y";
                        //inData 정보 셋팅
                        sParam.instCd = $.sessionStorage('headerInstCd');
                        sParam.bizDscd = param.bizDscd;
                        sParam.pdTpCd = "";
                        if (param.pdTpCd) {
                            sParam.selectVal = param.pdTpCd;
                            //sParam.disabled = true;
                        }

                        //상품중분류코드 콤보데이터 load
                        fn_getPdCodeList(sParam, this);
                    }


                    //상품템플릿 초기화
                    that.initPdTmpltCd();
                }
                
                /* ======================================================================== */
                /*    상품코드 조회                                */
                /* ======================================================================== */
                , selectPdCd: function (param) {
                    var that = this;
                    var sParam = {};
                    var selectStyle = {};
                    sParam = {}; //데이터 초기화
                    selectStyle = {}; //스타일 초기화


                    if (param.pdCd == "") {
                        //상품템플릿 초기화
                        that.initPdCd();
                    }
                    else {
                        //combobox 정보 셋팅
                        sParam.className = "CAPWF508-pdCd-wrap";
                        sParam.targetId = "pdCd";
                        sParam.nullYn = "Y";
                        //inData 정보 셋팅
                        sParam.instCd = $.sessionStorage('headerInstCd');
                        sParam.bizDscd = param.bizDscd;
                        sParam.pdTpCd = param.pdTpCd;
                        sParam.pdTmpltCd = param.pdTmpltCd;
                        // 상품탬플릿코드 콤보데이터 load
                        fn_getPdCodeList(sParam, this, selectStyle);
                    }
                }
                
                /* ======================================================================== */
                /*   저장기능 (등록/수정) 처리
                 /* ======================================================================== */
                , saveCAPWF508Detl: function () {
                    var that = this;
                    var sParam = {};
                    var header = new Object();
                    var headerParam = {};


                    // UICME0004 필수 입력 항목입니다.
                    var aprvlCndNbrBase = that.$el.find('.CAPWF508-base-table [data-form-param="aprvlCndNbr"]').val();
                    if (fn_isNull(aprvlCndNbrBase)) {
                        alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#aprvlCndNbr") + "]");
                        return;
                    }


                    // 입력항목 set
                    //기관코드
                    sParam.instCd =  $.sessionStorage('headerInstCd');;
                    // 결재조건번호
                    sParam.aprvlCndNbr = aprvlCndNbrBase;
                    // 테이블명
                    sParam.tblNm = that.$el.find('[data-form-param="tblNm"]').val();
                    // 확장속성명
                    sParam.xtnAtrbtNm = that.$el.find('[data-form-param="xtnAtrbtNm"]').val();
                    // 속성타입코드
                    sParam.atrbtTpCd = that.$el.find('[data-form-param="atrbtTpCd"]').val();
                    // 속성검증방법코드
                    sParam.atrbtVldtnWayCd = that.$el.find('[data-form-param="atrbtVldtnWayCd"]').val();
                    // 최소값
                    sParam.minVal = that.$el.find('[data-form-param="minVal"]').val();
                    // 최대값
                    sParam.maxVal = that.$el.find('[data-form-param="maxVal"]').val();
                    // 검증Rule
                    sParam.listVal = [];
                    sParam.listVal.push(that.$el.find('[data-form-param="vldtnRuleCntnt"]').val());
                    tbList = that.CAPWF508Grid.getAllData();
                    tbListCnt = that.CAPWF508Grid.getAllData().length;


                    //검증Rule배열 형태 변경 listVal[object, object] --> listVal[01, 02]
//                    $(tbList).each(function (idx, data) {
//                        sParam.listVal.push(data.val);
//                    });


                    if (fn_isNull(sParam.aprvlCndNbr) || fn_isNull(sParam.tblNm) || fn_isNull(sParam.xtnAtrbtNm)) {
                    	alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#aprvlCndNbr") + "]");
                        return;
                    }


//                    if(sParam.atrbtVldtnWayCd == 'L') {
//                        var gridAllData = that.CAPWF508Grid.getAllData();
//
//
//                        if (gridAllData.length === 0) {
//                            alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#vldtnRule") + "]");
//                            return;
//                        }
//                    }


                    // 범위 검증인 경우 최소, 최대는 필수 입력
                    if(sParam.atrbtVldtnWayCd == 'R') {
                    	if(fn_isEmpty(sParam.minVal)) {
                    		alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#minVal") + "]");
    	                    that.$el.find('[data-form-param="minVal"]').focus();
    	                    return;
                    	}


                    	if(fn_isEmpty(sParam.maxVal)) {
                    		alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#maxVal") + "]");
    	                    that.$el.find('[data-form-param="maxVal"]').focus();
    	                    return;
                    	}


                    	if(fn_isNumber(sParam.minVal) && fn_isNumber(sParam.maxVal)) {
                    		if(Number(sParam.minVal) > Number(sParam.maxVal)) {
                    			alertMessage.error(bxMsg('cbb_err_msg.UICME0028') + " [" + bxMsg("cbb_items.AT#minVal") + "]");
                    			that.$el.find('[data-form-param="minVal"]').focus();
                    			return;
                    		} 
                    	} else {
                    		if(sParam.minVal > sParam.maxVal) {
                    			alertMessage.error(bxMsg('cbb_err_msg.UICME0028') + " [" + bxMsg("cbb_items.AT#minVal") + "]");
                    			that.$el.find('[data-form-param="minVal"]').focus();
                    			return;
                    		}
                    	}
                    }
                    
    				//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                    var selectedRecord = that.CAPWF508Grid.grid.getSelectionModel().selected.items[0];
                    if (selectedRecord) {  // 등록 PWF4028202 -> CAPWF4028102
                    	var linkData = {"header": fn_getHeader("CAPWF4028102"), "AprvlCndMgmtGetAprvlCondXtnInfoIO": sParam};
                    }
                    else {
                    	var linkData = {"header": fn_getHeader("CAPWF4028102"), "AprvlCndMgmtSvcAprvlCondXtnInfoIO": sParam};
                        
                    }


                    // ajax 호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        success: function (responseData) {
                            // 에러여부 확인
                            if (fn_commonChekResult(responseData)) {
                            	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));

                                param = {}
                                param.instCd = instCdBase;
                                param.aprvlCndNbr = aprvlCndNbrBase;


                                // 재조회
                               // that.trigger('loadData', param);
                            }
                        }   // end of success: function
                    });     // end of bxProxy
                }           // end of savePWF508Detl: function
                

                /* ======================================================================== */
                /*    Click save btn                                                      */
                /* ======================================================================== */
                , saveCAPWF508Base: function (stsCd) {
                    var that = this;
                    var sParam = {};
                    var instCdBase = "";

                    instCdBase = $.sessionStorage('headerInstCd');


                    // 입력항목 set
                    sParam.instCd = instCdBase;
                    sParam.aprvlCndNbr = that.$el.find('[data-form-param="aprvlCndNbr"]').val();
                    sParam.srvcCd = that.$el.find('[data-form-param="srvcCd"]').val();
                    sParam.aprvlPtrnDscd = '';
                    if( stsCd != null && stsCd != ''){
                    	 sParam.stsCd = '1';
                    }else{
                    	sParam.stsCd = stsCd;
                    }
                   
                    sParam.aprvlTmpltId = that.$el.find('[data-form-param="aprvlTmpltId"]').val();
                    sParam.aprvlRsnCd = that.$el.find('[data-form-param="aprvlRsnCd"]').val();
                    
					if(that.$el.find('.CAPWF508-condition-table [data-form-param="amtCndYn"]').is(":checked")) {
						sParam.amtCndYn = "Y";
					}
					else {
						sParam.amtCndYn = "N";
					}
					
                    //sParam.amtCndYn = that.$el.find('[data-form-param="amtCndYn"]').val();


                    sParam.amtTpCd = that.$el.find('[data-form-param="amtTpCd"]').val();
                    sParam.amtCndMinVal = that.$el.find('[data-form-param="amtCndMinVal"]').val();
                    sParam.amtCndMaxVal = that.$el.find('[data-form-param="amtCndMaxVal"]').val();
                    
                    
					if(that.$el.find('.CAPWF508-condition-table [data-form-param="crncyCdCndYn"]').is(":checked")) {
						sParam.crncyCdCndYn = "Y";
					}
					else {
						sParam.crncyCdCndYn = "N";
					}
					
                   // sParam.crncyCdCndYn = that.$el.find('[data-form-param="crncyCdCndYn"]').val();
                    sParam.crncyCd = that.$el.find('[data-form-param="crncyCd"]').val();
                    
					if(that.$el.find('.CAPWF508-condition-table [data-form-param="txHmsCndYn"]').is(":checked")) {
						sParam.txHmsCndYn = "Y";
					}
					else {
						sParam.txHmsCndYn = "N";
					}
					
                   // sParam.txHmsCndYn = that.$el.find('[data-form-param="txHmsCndYn"]').val();
                    sParam.txStartHms = fn_getTimeValue(that.$el.find('#CAPWF508-condition-table [data-form-param="txStartHms"]').val()); 
                    sParam.txEndHms =  fn_getTimeValue(that.$el.find('#CAPWF508-condition-table [data-form-param="txEndHms"]').val()); 
                    
					if(that.$el.find('.CAPWF508-condition-table [data-form-param="txBrnchDscdCndYn"]').is(":checked")) {
						sParam.txBrnchDscdCndYn = "Y";
					}
					else {
						sParam.txBrnchDscdCndYn = "N";
					}
					
                   // sParam.txBrnchDscdCndYn = that.$el.find('[data-form-param="txBrnchDscdCndYn"]').val();
                    sParam.txBrnchDscd = that.$el.find('[data-form-param="txBrnchDscd"]').val();
                    
					if(that.$el.find('.CAPWF508-condition-table [data-form-param="txBrnchCndYn"]').is(":checked")) {
						sParam.txBrnchCndYn = "Y";
					}
					else {
						sParam.txBrnchCndYn = "N";
					}
					
                    //sParam.txBrnchCndYn = that.$el.find('[data-form-param="txBrnchCndYn"]').val();
                    sParam.txBrnchCd = that.$el.find('[data-form-param="txBrnchCd"]').val();




					if(that.$el.find('.CAPWF508-condition-table [data-form-param="pdCndYn"]').is(":checked")) {
						sParam.pdCndYn = "Y";
					}
					else {
						sParam.pdCndYn = "N";
					}
					
                   // sParam.pdCndYn = that.$el.find('[data-form-param="pdCndYn"]').val();
                    sParam.bizDscd = that.$el.find('[data-form-param="bizDscd"]').val();
                    sParam.pdTpCd = that.$el.find('[data-form-param="pdTpCd"]').val();
                    sParam.pdTmpltCd = that.$el.find('[data-form-param="pdTmpltCd"]').val();
                    sParam.pdCd = that.$el.find('[data-form-param="pdCd"]').val();
                    sParam.pdNm = that.$el.find('[data-form-param="pdNm"]').val();


                    // 날짜 데이터는 형식을 변환해야 함 yyyy-mm-dd ==> yyyymmdd
                    sParam.aplyStartDt = fn_getDateValue(that.$el.find('#CAPWF508-base-table [data-form-param="aplyStartDt"]').val());
                    sParam.aplyEndDt = fn_getDateValue(that.$el.find('#CAPWF508-base-table [data-form-param="aplyEndDt"]').val());


                    if (that.$el.find('[data-form-param="amtCndYn"]').is(':checked')) {
                        if (sParam.amtTpCd == undefined || sParam.amtTpCd == '') {
                            alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#amtTpCd") + "]");
                            that.$el.find('[data-form-param="amtTpCd"]').focus();


                            return;
                        }


                        if (sParam.amtCndMinVal == undefined || sParam.amtCndMinVal == '' || !jQuery.isNumeric(sParam.amtCndMinVal)) {
                            alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#amtCndMinVal") + "]");
                            that.$el.find('[data-form-param="amtCndMinVal"]').focus();


                            return;
                        }


                        if (sParam.amtCndMaxVal == undefined || sParam.amtCndMaxVal == '' || !jQuery.isNumeric(sParam.amtCndMaxVal)) {
                            alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#amtCndMaxVal") + "]");
                            that.$el.find('[data-form-param="amtCndMaxVal"]').focus();


                            return;
                        }
                    }


                    if (that.$el.find('[data-form-param="crncyCdCndYn"]').is(':checked')) {
                        if (sParam.crncyCd == undefined || sParam.crncyCd == '') {
                            alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#crncyCd") + "]");
                            that.$el.find('[data-form-param="crncyCd"]').focus();


                            return;
                        }
                    }


                    if (that.$el.find('[data-form-param="txHmsCndYn"]').is(':checked')) {
                        if (sParam.txStartHms == undefined || sParam.txStartHms == '') {
                            alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#txStartHms") + "]");
                            that.$el.find('[data-form-param="txStartHms"]').focus();


                            return;
                        }


                        if (sParam.txEndHms == undefined || sParam.txEndHms == '') {
                            alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#txEndHms") + "]");
                            that.$el.find('[data-form-param="txEndHms"]').focus();


                            return;
                        }
                    }


                    if (that.$el.find('[data-form-param="txBrnchDscdCndYn"]').is(':checked')) {
                        if (sParam.txBrnchDscd == undefined || sParam.txBrnchDscd == '') {
                            alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#txBrnchDscd") + "]");
                            that.$el.find('[data-form-param="txBrnchDscd"]').focus();


                            return;
                        }
                    }


                    if (that.$el.find('[data-form-param="txBrnchCndYn"]').is(':checked')) {
                        if (sParam.txBrnchCd == undefined || sParam.txBrnchCd == '') {
                            alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#txBrnchCd") + "]");
                            that.$el.find('[data-form-param="txBrnchCd"]').focus();


                            return;
                        }
                    }


                    if (that.$el.find('[data-form-param="pdCndYn"]').is(':checked')) {
                        if (sParam.bizDscd == undefined || sParam.bizDscd == '') {
                            alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#bizDscd") + "]");
                            that.$el.find('[data-form-param="bizDscd"]').focus();


                            return;
                        }
                    }
    				//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }

                    if (sParam.aprvlCndNbr) {
                    	 var linkData = {"header": fn_getHeader("CAPWF4028201"), "AprvlCndMgmtSvcAprvlCondBsicInfoIO": sParam};
                    }
                    else {
                    	var linkData = {"header": fn_getHeader("CAPWF4028101"), "AprvlCndMgmtSvcAprvlCondBsicInfoIO": sParam};
                    }


                    //ajax 호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        success: function (responseData) {
                            // 에러여부 확인. 에러시 메시지 띄워주고 정상시 재조회 호출
                            if (fn_commonChekResult(responseData)) {
                                // 정상처리 메시지 출력
                                //alertMessage.info(bxMsg('cbb_items.SCRNITM#success'));


                                if (responseData.AprvlCndMgmtSvcAprvlCondBsicInfoIO.aprvlCndNbr != null) {


                                   // this.$el.find('.CAPWF508-base-table [data-form-param="aprvlCndNbr"]').val(responseData.AprvlCndMgmtSvcAprvlCondBsicInfoIO.aprvlCndNbr);
                                    var aprvlCndNbr = responseData.AprvlCndMgmtSvcAprvlCondBsicInfoIO.aprvlCndNbr;

                                    // 기본부 재조회
                                    that.selectPWF508Base(aprvlCndNbr);


                                    // 첫번째 tab의 조회기능을 트리거하여 그리드도 처리함
                                    var param = {};
                                    param.instCd = instCdBase;
                                    param.aprvlCndNbr = sParam.aprvlCndNbr;


                                    if (param.aprvlCndNbr == '') {
                                        param.aprvlCndNbr = responseData.AprvlCndMgmtSvcAprvlCondBsicInfoIO.aprvlCndNbr;
                                    }


                                    // 그리드부 재조회
                                   // that.trigger('loadData', param);


                                    //상세부에 조회된 번호전달
                                    //that.trigger('loadAprvlCndNbr', param);
                                }


                            }
                        } // end of success: function
                    }); // end of bxProxy.post.....
                } // end of create function

                , deleteArea: function (){
                    var that = this;
                    var sParam = {};
                    var instCdBase = "";
                    instCdBase = $.sessionStorage('headerInstCd');
                    // 입력항목 set
                    sParam.instCd = instCdBase;
                    sParam.aprvlCndNbr = that.$el.find('[data-form-param="aprvlCndNbr"]').val();


                    if (fn_isEmpty(sParam.aprvlCndNbr)) {
                        alertMessage.error(bxMsg('cbb_err_msg.UICME0004') + " [" + bxMsg("cbb_items.AT#aprvlCndNbr") + "]");
                        that.$el.find('[data-form-param="aprvlCndNbr"]').focus();
                        return;
                    }

    				//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                    var linkData = {"header": fn_getHeader("CAPWF4028301"), "AprvlCndMgmtSvcAprvlCondBsicInfoIO": sParam};


                    //ajax 호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                // 정상처리 메시지 출력
                            	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                that.resetBaseArea();
                                that.resetDetailArea();
                            }
                        } // end of success: function
                    }); // end of bxProxy.post.....
                }
                , resetBaseArea: function (e) {
                    initFlag = false;
                    this.setCAPWF508BaseData(this, "", "X");
                    this.$el.find('[data-form-param="aprvlCndNbr"]').focus();
                    this.trigger('initList');
                    //this.changeBizDscd();
                }
                /* ======================================================================== */
                /*  데이터 피커 로드 컴포넌트 데이터 피커를 사용
                 /*  ('libs/bx/bx-ui/component/date-picker/_date-picker.js' 참조)
                 /* ======================================================================== */
                , loadDatePicker: function () {


                    this.subViews['aplyStartDt'] && this.subViews['aplyStartDt'].remove();
                    // 적용시작년월일 데이터 피커 생성
                    this.subViews['aplyStartDt'] = new DatePicker({
                        inputAttrs: {'data-form-param': 'aplyStartDt'},
                        setTime: false
                    });
                    // 적용시작년월일데이터 피커 렌더
                    this.$el.find('.CAPWF508-aplyStartDt-wrap').html(this.subViews['aplyStartDt'].render());


                    this.subViews['aplyEndDt'] && this.subViews['aplyEndDt'].remove();
                    // 적용종료년월일 데이터 피커 생성
                    this.subViews['aplyEndDt'] = new DatePicker({
                        inputAttrs: {'data-form-param': 'aplyEndDt'},
                        setTime: false
                    });
                    // 적용종료년월일데이터 피커 렌더
                    this.$el.find('.CAPWF508-aplyEndDt-wrap').html(this.subViews['aplyEndDt'].render());


                }
            })
            ; // end of Backbone.View.extend({


        return CAPWF508View;
    } // end of define function
)
; // end of define
