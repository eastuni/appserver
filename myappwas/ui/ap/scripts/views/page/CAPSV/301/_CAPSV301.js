define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPSV/301/_CAPSV301.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
		, 'app/views/page/popup/CAPAT/popup-staffId'
        , 'bx/views/header'
    ]
    , function (config
        , tpl
        , ExtGrid
        , commonInfo
        , popupStaffId
		, HeaderView
        ) {


        /**
         * Backbone
         */
        var CAPSV301View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPSV301-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                	// 검색조건 이벤트
                    'click #btn-base-reset': 'resetBaseArea'
                    , 'click #btn-base-search': 'queryBaseArea'
                	, 'click #btn-base-search-modal': 'baseSearchModal'

           			// 검색 결과 이벤트
    				, 'click #btn-CAPSV301-grid-excel': 'gridExcel'
					, 'click #btn-up-grid': 'gridAreaModal'
					, 'click #btnAdditionalSearchCndToggle': 'additionalSearchModal'

					// 기본 속성 이벤트
					, 'click #btn-detail-modal': 'detailAreaModal'
    				, 'click #btn-detail-refresh': 'resetDetailArea'
					, 'click #btn-detail-save': 'clickSaveDetail'
					, 'click #btn-CAPSV301-request-grid-run': 'clickMoveRequest'
					, 'click #btn-CAPSV301-task-cancel': 'clickTaskCancel'
					
					, 'click #btn-staff-search': 'popStaffSearch'//사용자조회팝업
						, 'click #btn-staff-search-cond': 'popStaffCondSearch'//사용자조회팝업(검색용)
					// 상세 과제 이벤트
					, 'click #btn-detail-up-grid': 'detailTaskListAreaModal'
					, 'click #btn-CAPSV301-detail-grid-excel': 'detailGridExcel'
					, 'click #btn-task-detail-modal': 'taskDetailAreaModal'

					, 'keydown #searchKey' : 'fn_enter'
                }

                , initialize: function (initData) {

                    var that = this;
                    that.that = this;

//                    var deleteList = []; // 코드삭제목록
                    var deleteDetailList= []; // 코드상세삭제목록


                    $.extend(that, initData);
                    that.$el.html(that.tpl());

                    that.initData = initData;

                    that.createBaseGrid();
                    that.createDetailGrid();
                    
                }
                , render: function () {
                	var that = this;
                	// 콤보데이터 로딩
                    var sParam;

                    this.setDatePicker();
                    
                    // 코드종류
                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = 'CAPSV301-base-dstbTaskStsCd-wrap';
                    sParam.targetId = "dstbTaskStsCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
//                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "A1004"; // 11915
                    sParam.selectVal = "01";
                    fn_getCodeList(sParam, that);

                    
                    // 코드종류
                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = 'CAPSV301-detail-dstbTaskStsCd-wrap';
                    sParam.targetId = "dstbTaskStsCd";
                    sParam.disabled = true;
//                    sParam.nullYn = "Y";
//                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); 
//                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "A1004";
                    fn_getCodeList(sParam, that);

                    that.requestRunBtnShow();
                    
                    this.staffId = $.sessionStorage('staffId');
                    this.staffNm = $.sessionStorage('nm');
                    
                    that.$el.find('.CAPSV301-base-table [data-form-param="lastChngId"]').val(this.staffId);
                    
                    that.setDstbStaffInfo('CAPSV301-detail-table',this.staffId,this.staffNm);
                    that.setDstbStaffInfo('CAPSV301-base-table',this.staffId,this.staffNm);
//                    that.$el.find('.CAPSV301-detail-table [data-form-param="dstbStaffId"]').val(staffId);
//                    that.$el.find('.CAPSV301-detail-table [data-form-param="dstbStaffNm"]').val(staffNm);
//                    that.$el.find('.CAPSV301-detail-table [data-form-param="dstbStaffIdNm"]').val(staffId + " " + staffNm);

					
                    that.$el.find("#btn-CAPSV301-task-cancel").hide();
                    
                    that.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskStsCd"]').prop("disabled", true);
                    
 
                    fn_pageLayerCtrl("#CAPSV301-task-detail-table", that.$el.find("#btn-task-detail-modal"));
                    that.$el.find("#CAPSV301-task-detail-table").hide();
                    
                    return that.$el;
                }
                , createBaseGrid : function() {
                	var that = this;

                    that.comboStore1 = {}; // 코드종류

                    var sParam = {};
                    sParam.cdNbr = "A1004";
                    var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};

                    that.comboStore1 = {}; // 코드종류

                    bxProxy.all([
                                 {
		                            // 코드종류
		                            url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {

		                            	if (fn_commonChekResult(responseData)) {
		                            		that.comboStore1 = new Ext.data.Store({
		                                        fields: ['cd', 'cdNm']
		                                        , data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
		                                    });
		                                }
		                            }
		                        }
                          ]
                        , {
                            success: function () {
                            	/* ------------------------------------------------------------ */
                                that.CAPSV301Grid = new ExtGrid({
                                    /* ------------------------------------------------------------ */
                                    // 단일탭 그리드 컬럼 정의
                                    fields: ['rowIndex', 'dstbTaskId', 'dstbTaskNm', 'dstbTaskStsCd','lastDstbEnvrnmntCd', 'efctvStartDt', 'efctvEndDt', 'dstbStaffNm', 'lastChngTmstmp', 'dstbTaskDtlCntnt','dstbStaffId']
                                    , id: 'CAPSV301Grid'
                                    , columns: [
            							{
            								text: 'No.'
            							    , dataIndex: 'rowIndex'
            							    , sortable: false
            							    , width : 80
                                            , height: 25
            							    , style: 'text-align:center'
            							    , align: 'center'
            							    // other config you need....
            							    , renderer: function (value, metaData, record, rowIndex) {
            							        return rowIndex + 1;
            							    }
            							}
                                        , {text: bxMsg('cbb_items.AT#dstbTaskId'),width: 160,dataIndex: 'dstbTaskId', style: 'text-align:center', align: 'center'}
                                        , {text: bxMsg('cbb_items.AT#dstbTaskNm'),width: 250, flex: 1,dataIndex: 'dstbTaskNm', style: 'text-align:center', align: 'center'}
                                        ,{
                                            text: bxMsg('cbb_items.AT#dstbTaskStsCd'),
                                            flex: 1,
                                            dataIndex: 'dstbTaskStsCd',
                                            style: 'text-align:center',
                                            align: 'center',
                                            code: 'A1004',
                                            renderer: function (val) {
                                                return val ? bxMsg('cbb_items.CDVAL#A1004' + val) : '';
                                            }
                                        }
                                        ,{
                                            text: bxMsg('cbb_items.AT#lastDstbEnvrnmntCd'),
                                            flex: 1,
                                            dataIndex: 'lastDstbEnvrnmntCd',
                                            style: 'text-align:center',
                                            align: 'center',
                                            code: 'A1035',
                                            renderer: function (val) {
                                                return val ? bxMsg('cbb_items.CDVAL#A1035' + val) : bxMsg('cbb_items.SCRNITM#nprcsd');
                                            }
                                        }
                                        
//                                        , {text: bxMsg('cbb_items.AT#efctvStartDt'),width: 160,dataIndex: 'efctvStartDt', style: 'text-align:center', align: 'center'}
                                        , {text: bxMsg('cbb_items.AT#efctvStartDt'),width: 160,dataIndex: 'efctvStartDt', style: 'text-align:center', align: 'center'
                                        	, type: 'date',
                                            renderer : function(value) {
                                                return XDate(value).toString('yyyy-MM-dd');
                                            }
                                        }
//                                        , {text: bxMsg('cbb_items.AT#efctvEndDt'),width: 160,dataIndex: 'efctvEndDt', style: 'text-align:center', align: 'center'}
                                        , {text: bxMsg('cbb_items.AT#efctvEndDt'),width: 160,dataIndex: 'efctvEndDt', style: 'text-align:center', align: 'center'
                                        	, type: 'date',
                                            renderer : function(value) {
                                                return XDate(value).toString('yyyy-MM-dd');
                                            }
                                        }
                                        , {text: bxMsg('cbb_items.SCRNITM#prsnChrg'),width: 160,dataIndex: 'dstbStaffNm', style: 'text-align:center', align: 'center'}
                                        , {text: bxMsg('cbb_items.AT#lastChngTmstmp'),width: 160,dataIndex: 'lastChngTmstmp', style: 'text-align:center', align: 'center'
                                        	, type: 'date',
                                            renderer : function(value) {
                                                return XDate(value).toString('yyyy-MM-dd HH:mm:ss');
                                            }
                                        }
                                        , {text: bxMsg('cbb_items.AT#dstbStaffId') ,dataIndex: 'dstbStaffId', hidden : true}
                                        , {text: bxMsg('cbb_items.AT#dstbTaskDtlCntnt') ,dataIndex: 'dstbTaskDtlCntnt', hidden : true}
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
                                            , fn: function (event) {
                                                //더블클릭시 이벤트 발생
                                                that.clickGrid();
                                            }
                                        }
                                    }
                                });
                                // 단일탭 그리드 렌더
                                that.$el.find(".CAPSV301-grid").html(that.CAPSV301Grid.render({'height': 300}));
                            } // end of success:.function
                    }); // end of bxProxy.all
                }


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  상세코드 그리드 생성                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                , createDetailGrid : function() {
                	var that = this;
                	that.createTaskDetailGrid(that); // 일반 그리드
                }


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  일반 그리드 생성                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                , createTaskDetailGrid : function(that) {


                    that.CAPSV301TaskDetailGrid = new ExtGrid({
                        fields: ['dstbTaskChngSeqNbr', 'dstbTblId', 'dstbPkValCntnt', 'dstbSaveDscd', 'dstbChngStsDscd','lastDstbEnvrnmntCd','lastChngId','lastChngTmstmp','dstbBfChngCntnt','dstbAfChngCntnt','dplctnKeyValCntnt']
                        , id: 'CAPSV301TaskDetailGrid'
                        , columns: [
							{text: bxMsg('cbb_items.AT#dstbTaskChngSeqNbr'), flex: 1
                                , height: 25, dataIndex: 'dstbTaskChngSeqNbr', style: 'text-align:center', align: 'center'}
	                        , {text: bxMsg('cbb_items.AT#tblNm'), flex: 1, dataIndex: 'dstbTblId', style: 'text-align:center', align: 'center'}
	                        , {text: bxMsg('cbb_items.AT#dstbPkValCntnt'), flex: 1, dataIndex: 'dstbPkValCntnt', style: 'text-align:center', align: 'center'}
	                        ,{
                                text: bxMsg('cbb_items.AT#dstbSaveDscd'),
                                flex: 1,
                                dataIndex: 'dstbSaveDscd',
                                style: 'text-align:center',
                                align: 'center',
                                code: 'A1008',
                                renderer: function (val) {
                                    return val ? bxMsg('cbb_items.CDVAL#A1008' + val) : '';
                                }
                            }
	                        ,{
                                text: bxMsg('cbb_items.AT#dstbChngStsDscd'),
                                flex: 1,
                                dataIndex: 'dstbChngStsDscd',
                                style: 'text-align:center',
                                align: 'center',
                                code: 'A1034',
                                renderer: function (val) {
                                    return val ? bxMsg('cbb_items.CDVAL#A1034' + val) : '';
                                }
                            }
	                        ,{
                                text: bxMsg('cbb_items.AT#lastDstbEnvrnmntCd'),
                                flex: 1,
                                dataIndex: 'lastDstbEnvrnmntCd',
                                style: 'text-align:center',
                                align: 'center',
                                code: 'A1035',
                                renderer: function (val) {
                                    return val ? bxMsg('cbb_items.CDVAL#A1035' + val) : bxMsg('cbb_items.SCRNITM#nprcsd');
                                }
                            }
	                        , {text: bxMsg('cbb_items.AT#lastChngId'), flex: 1, dataIndex: 'lastChngId', style: 'text-align:center', align: 'center'}
	                        , {text: bxMsg('cbb_items.AT#lastChngTmstmp'),width: 160,dataIndex: 'lastChngTmstmp', style: 'text-align:center', align: 'center'
                            	, type: 'date',
                                renderer : function(value) {
                                    return XDate(value).toString('yyyy-MM-dd HH:mm:ss');
                                }
                            }
	                        , {text: bxMsg('cbb_items.AT#dstbBfChngCntnt') ,dataIndex: 'dstbBfChngCntnt', hidden : true}
	                        , {text: bxMsg('cbb_items.AT#dstbAfChngCntnt') ,dataIndex: 'dstbAfChngCntnt', hidden : true}
	                        , {text: bxMsg('cbb_items.AT#dplctnKeyValCntnt') ,dataIndex: 'dplctnKeyValCntnt', hidden : true}
                        ]
	                    , listeners: {
	                        click: {
	                            element: 'body'
	                            , fn: function (event) {
	                                //더블클릭시 이벤트 발생
	                                that.clickTaskDetailGrid();
	                            }
	                        }
	                    }


                    });

                    that.$el.find("#CAPSV301-task-detail-grid").html(that.CAPSV301TaskDetailGrid.render({'height': 200}));
                }

//
                

                ,setDatePicker: function () {
                    fn_makeDatePicker(this.$el.find('#CAPSV301-base-table [data-form-param="srchStartDtm"]'));
                    fn_makeDatePicker(this.$el.find('#CAPSV301-base-table [data-form-param="srchEndDtm"]'));
                    fn_makeDatePicker(this.$el.find('#CAPSV301-detail-table [data-form-param="efctvStartDt"]'));
                    fn_makeDatePicker(this.$el.find('#CAPSV301-detail-table [data-form-param="efctvEndDt"]'));
                }
                
                , resetBaseArea: function () {
                    var that = this;
                    
                    that.$el.find("#btn-detail-save").show();

                    that.$el.find('.CAPSV301-base-table [data-form-param="dstbTaskId"]').val("");
                    that.$el.find('.CAPSV301-base-table [data-form-param="dstbTaskNm"]').val("");

                    that.setDstbStaffInfo('CAPSV301-base-table',this.staffId, this.staffNm);
                    
                    that.$el.find('#CAPSV301-base-table [data-form-param="dstbTaskStsCd"] option:eq(0)').attr("selected", "selected");
                    fn_makeDatePicker(that.$el.find('#CAPSV301-base-table [data-form-param="srchStartDtm"]'));
                    fn_makeDatePicker(that.$el.find('#CAPSV301-base-table [data-form-param="srchEndDtm"]'));
                    
                    that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt'));
                    that.CAPSV301Grid.resetData();

                    // 상세부 초기화
                    that.resetDetailArea();
                }

                , clickMoveRequest : function(event) {
                	var that = this;
                	
                	var dstbTaskId = that.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskId"]').val();
                	
                	if(dstbTaskId == ''){
                		fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbTaskId')+"]");
                      	return;
                	}
                	
                	that.$el.trigger({
                		type: 'open-conts-page',
                		pageHandler: 'CAPSV302',
                		pageDPName: bxMsg('cbb_items.SCRN#CAPSV302'),
                		pageInitialize: true,
                		pageRenderInfo: {
                			dstbTaskId : dstbTaskId
                		}
                	});
                }
                
                , resetDetailArea : function() {
                	var that = this;
                	
                	

                	that.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskStsCd"] option:eq(0)').attr("selected", "selected");
                	that.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskId"]').val("");
                	that.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskNm"]').val("");
                	fn_makeDatePicker(that.$el.find('#CAPSV301-detail-table [data-form-param="efctvStartDt"]'));
                    fn_makeDatePicker(that.$el.find('#CAPSV301-detail-table [data-form-param="efctvEndDt"]'));
                    that.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskDtlCntnt"]').val("");
//                    that.$el.find('.CAPSV301-detail-table [data-form-param="dstbFinYn"]').val("");
                    that.setDstbStaffInfo('CAPSV301-detail-table',this.staffId, this.staffNm);
                    // 상세 코드 그리드 초기화
                    that.$el.find("#searchDetailResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt'));
                    that.CAPSV301TaskDetailGrid.resetData(); // 일반코드초기화

                    // 상세 코드 속성 초기화
                    that.resetTaskDetailArea();
                    
                    //배포요청버튼 감추기
                    that.requestRunBtnShow();
                    
                    that.$el.find("#btn-CAPSV301-task-cancel").hide();
                    
                    that.$el.find("#btn-detail-save").show();
                }


                , resetTaskDetailArea : function() {
                	var that = this;
                	that.$el.find("#searchDetailResultCount").html(bxMsg('cbb_items.SCRNITM#chngHst')+" (0 "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                	
//                	that.$el.find('.CAPSV301-task-detail-table [data-form-param="dstbTaskChngSeqNbr"]').val("");
//            		that.$el.find('.CAPSV301-task-detail-table [data-form-param="dstbTblId"]').val("");
//            		that.$el.find('.CAPSV301-task-detail-table [data-form-param="dstbSaveDscd"]').val("");
//            		that.$el.find('.CAPSV301-task-detail-table [data-form-param="frstChngYn"]').prop("checked", false);
            		that.$el.find('.CAPSV301-task-detail-table [data-form-param="dstbPkValCntnt"]').val("");
            		that.$el.find('.CAPSV301-task-detail-table [data-form-param="dplctnKeyValCntnt"]').val("");
//            		that.$el.find('.CAPSV301-task-detail-table [data-form-param="lastChngId"]').val("");
//            		that.$el.find('.CAPSV301-task-detail-table [data-form-param="lastChngTmstmp"]').val("");
            		that.$el.find('.CAPSV301-task-detail-table [data-form-param="dstbBfChngCntnt"]').val("");
            		that.$el.find('.CAPSV301-task-detail-table [data-form-param="dstbAfChngCntnt"]').val("");
                }

                , queryBaseArea: function () {
                    var that = this;
                    that.inquiryBaseData();
                }

                , inquiryBaseData: function () {
                	var that = this;
                    var sParam = {};

                    //header 배포과제 combo를 재조회 한다.
                    
                    sParam.dstbTaskId = that.$el.find('.CAPSV301-base-table [data-form-param="dstbTaskId"]').val();
                    sParam.dstbTaskNm = that.$el.find('.CAPSV301-base-table [data-form-param="dstbTaskNm"]').val();
                    sParam.dstbTaskStsCd = that.$el.find('#CAPSV301-base-table [data-form-param="dstbTaskStsCd"]').val();
                    sParam.dstbStaffId = that.$el.find('.CAPSV301-base-table [data-form-param="dstbStaffId"]').val();
                    var efctvStartDt = that.$el.find('#CAPSV301-base-table [data-form-param="srchStartDtm"]').val();
                    var efctvEndDt = that.$el.find('#CAPSV301-base-table [data-form-param="srchEndDtm"]').val();
                    if(efctvStartDt != ''){
                    	sParam.efctvStartDt = XDate(efctvStartDt).toString('yyyyMMdd');
                    }
                    if(efctvEndDt != ''){
                    	sParam.efctvEndDt = XDate(efctvEndDt).toString('yyyyMMdd');
                    }
                    
                    
                    var linkData = {"header": fn_getHeader('CAPSV0060101'), "CaDstbTaskMIO": sParam};

                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                    var tbList = responseData.CaDstbTaskMListOut.tbl;
                                    var totCnt = tbList.length;


                                    if (tbList != null || tbList.length > 0) {
                                        that.CAPSV301Grid.setData(tbList);
                                        that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                        // 삭제 로우 초기화
//                                        that.deleteList = [];
                                        //상세부 초기화
                                        that.resetDetailArea();


                                        that.CAPSV301TaskDetailGrid.resetData(); // 일반코드초기화

                                		// 상세 코드 속성 영역 초기화
                                		that.resetTaskDetailArea();
                                    }
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                } // end

             // 상세 저장 버튼 클릭
                , clickSaveDetail : function(event) {
                	var dstbTaskStsCd = this.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskStsCd"]').val();       //배포과제상태코드
                	if(dstbTaskStsCd == '03'){ //완료
            			fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0063'));  
                       	return;
                	} else {
                		
                		
                		var sParam = {};
                		
                        sParam.dstbTaskNm = this.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskNm"]').val();       //배포과제명
                        sParam.dstbTaskStsCd = this.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskStsCd"]').val();       //배포과제상태코드
                        sParam.efctvStartDt = XDate(this.$el.find('.CAPSV301-detail-table [data-form-param="efctvStartDt"]').val()).toString('yyyyMMdd'); // 유효시작년월일
                        sParam.efctvEndDt = XDate(this.$el.find('.CAPSV301-detail-table [data-form-param="efctvEndDt"]').val()).toString('yyyyMMdd'); // 유효종료년월일
                        sParam.dstbStaffId = this.$el.find('.CAPSV301-detail-table [data-form-param="dstbStaffId"]').val(); // 담당자 staffId

                        if(sParam.dstbTaskNm == ''){
                    		fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbTaskNm')+"]");
                          	return;
                    	}
                       if(sParam.dstbTaskStsCd == ''){
                     		fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbTaskStsCd')+"]");
                           	return;
                     	}
                       if(sParam.efctvStartDt == ''){
                      		fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#efctvStartDt')+"]");
                            	return;
                      	}
                       if(sParam.efctvEndDt == ''){
                       		fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#efctvEndDt')+"]");
                             	return;
                       }
                       if(sParam.dstbStaffId == ''){
                   		fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.SCRNITM#prsnChrg')+"]");
                         	return;
                       }
                		
                		
                		fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveDetail, this);
                	}
                }

                // 상세 저장
                , saveDetail : function(that) {

                	 var sParam = {};
                	 var srvcCd = "CAPSV0060103";
                	 
                	 if( that.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskId"]').val() != ''){
                		srvcCd = "CAPSV0060104";
                	 }
                	 sParam.dstbTaskId = that.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskId"]').val();       //배포과제식별자
                     sParam.dstbTaskNm = that.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskNm"]').val();       //배포과제명
                     sParam.dstbTaskStsCd = that.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskStsCd"]').val();       //배포과제상태코드
                     sParam.efctvStartDt = XDate(that.$el.find('.CAPSV301-detail-table [data-form-param="efctvStartDt"]').val()).toString('yyyyMMdd'); // 유효시작년월일
                     sParam.efctvEndDt = XDate(that.$el.find('.CAPSV301-detail-table [data-form-param="efctvEndDt"]').val()).toString('yyyyMMdd'); // 유효종료년월일
                     sParam.dstbTaskDtlCntnt = that.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskDtlCntnt"]').val(); // 배포과제상세내용
                     sParam.dstbStaffId = that.$el.find('.CAPSV301-detail-table [data-form-param="dstbStaffId"]').val(); // 담당자 staffId
                     sParam.dstbStaffNm = that.$el.find('.CAPSV301-detail-table [data-form-param="dstbStaffNm"]').val(); // 담당자 staffNm

                     var linkData = {"header": fn_getHeader(srvcCd), "CaDstbTaskMIO": sParam};

                     //ajax 호출
                     bxProxy.post(sUrl, JSON.stringify(linkData), {
                    	 enableLoading: true,
                         success: function (responseData) {
                             if (fn_commonChekResult(responseData)) {
                            	 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            	 that.queryBaseArea();
                            	 fn_headerTaskList();
                             }
                         }
                     });
                }
                
                
                , clickTaskCancel: function(event) {
                	var dstbTaskStsCd = this.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskStsCd"]').val();       //배포과제상태코드
                	if(dstbTaskStsCd == '03'){ //완료
            			fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0063'));  
                       	return;
                	} else {
                		fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#dstbTaskCncl'), bxMsg('cbb_items.SCRNITM#cancelCnfrm'), this.cancelDetail, this);
                	}
                }
             // 취소 저장
                , cancelDetail : function(that) {

                	 var sParam = {};
                	 var srvcCd = "CAPSV0060304";
                	 
                	 sParam.dstbTaskId = that.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskId"]').val();       //배포과제식별자
//                     sParam.dstbTaskStsCd = that.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskStsCd"]').val();       //배포과제상태코드
//                     sParam.dstbTaskDtlCntnt = that.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskDtlCntnt"]').val(); // 배포과제상세내용

                     if(sParam.dstbTaskId  == ''){
                       	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbTaskId')+"]");
                       	return;
                     }
                     
                     var linkData = {"header": fn_getHeader(srvcCd), "CaDstbReqInfoIO": sParam};

                     //ajax 호출
                     bxProxy.post(sUrl, JSON.stringify(linkData), {
                    	 enableLoading: true,
                         success: function (responseData) {
                             if (fn_commonChekResult(responseData)) {
                            	 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            	 that.queryBaseArea();
                             }
                         }
                     });
                }
                
                , requestRunBtnShow: function(){
                	var that = this;
                	var dstbTaskId = that.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskId"]').val();
                	if(dstbTaskId == ''){
                		that.$el.find("#btn-CAPSV301-request-grid-run").hide();
                	} else {
                		 var isShow = false;
                		 var selectedRecord = that.CAPSV301Grid.grid.getSelectionModel().selected.items[0];
                		 var detailCnt = that.CAPSV301TaskDetailGrid.store.getCount();
                		 if (selectedRecord) {
                			 if(selectedRecord.data.dstbTaskStsCd == '02' || selectedRecord.data.dstbTaskStsCd == '03'){
                				 isShow = false;
                			 } else {
                				 if(detailCnt > 0){
                    				 isShow = true;
                				 } else {
                    				 isShow = false;
                				 }
                			 }
                         } else {
                        	 isShow = false;
                         }
                		 if (isShow) {
                			 that.$el.find("#btn-CAPSV301-request-grid-run").show();
                         } else {
                        	 that.$el.find("#btn-CAPSV301-request-grid-run").hide();
                         }
                	}
                }
                
                , clickGrid: function () {

                    var that = this;
                    
                    var selectedRecord = that.CAPSV301Grid.grid.getSelectionModel().selected.items[0];

                    if (!selectedRecord) {
                        return;
                    } else {
                    	that.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskId"]').val(selectedRecord.data.dstbTaskId);
                    	that.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskNm"]').val(selectedRecord.data.dstbTaskNm);
                    	that.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskStsCd"]').val(selectedRecord.data.dstbTaskStsCd);
                        that.$el.find('.CAPSV301-detail-table [data-form-param="efctvStartDt"]').val(XDate(selectedRecord.data.efctvStartDt).toString('yyyy-MM-dd'));
                        that.$el.find('.CAPSV301-detail-table [data-form-param="efctvEndDt"]').val(XDate(selectedRecord.data.efctvEndDt).toString('yyyy-MM-dd'));
                        that.$el.find('.CAPSV301-detail-table [data-form-param="dstbTaskDtlCntnt"]').val(selectedRecord.data.dstbTaskDtlCntnt);
//                        that.$el.find('.CAPSV301-detail-table [data-form-param="dstbFinYn"]').val(selectedRecord.data.dstbFinYn);
                        that.setDstbStaffInfo('CAPSV301-detail-table',selectedRecord.data.dstbStaffId,selectedRecord.data.dstbStaffNm);
                        // 배포요청 상세 조회
                        that.queryDetailGrid(selectedRecord.data);
                        
                        if(selectedRecord.data.dstbTaskStsCd == '01'){
                        	this.$el.find("#btn-CAPSV301-task-cancel").show();
                        	this.$el.find("#btn-detail-save").show();
                        } else {
                        	this.$el.find("#btn-CAPSV301-task-cancel").hide();
                        	this.$el.find("#btn-detail-save").hide();
                        }
                    }
                }


                , clickTaskDetailGrid : function() {
                	var that = this;
                	var selectedRecord = that.CAPSV301TaskDetailGrid.grid.getSelectionModel().selected.items[0];


                	if (!selectedRecord) {
                		return;
                	} else {
//                		that.$el.find('.CAPSV301-task-detail-table [data-form-param="dstbTaskChngSeqNbr"]').val(selectedRecord.data.dstbTaskChngSeqNbr);
//                		that.$el.find('.CAPSV301-task-detail-table [data-form-param="dstbTblId"]').val(selectedRecord.data.dstbTblId);
//                		that.$el.find('.CAPSV301-task-detail-table [data-form-param="dstbSaveDscd"]').val(selectedRecord.data.dstbSaveDscd);
//                		if(selectedRecord.data.frstChngYn == 'Y'){
//	                		that.$el.find('.CAPSV301-task-detail-table [data-form-param="frstChngYn"]').prop("checked", true);
//	                	} else {
//	                		that.$el.find('.CAPSV301-task-detail-table [data-form-param="frstChngYn"]').prop("checked", false);
//	                	}
                		that.$el.find('.CAPSV301-task-detail-table [data-form-param="dstbPkValCntnt"]').val(selectedRecord.data.dstbPkValCntnt);
                		that.$el.find('.CAPSV301-task-detail-table [data-form-param="dplctnKeyValCntnt"]').val(selectedRecord.data.dplctnKeyValCntnt);
//                		that.$el.find('.CAPSV301-task-detail-table [data-form-param="lastChngId"]').val(selectedRecord.data.lastChngId);
//                		that.$el.find('.CAPSV301-task-detail-table [data-form-param="lastChngTmstmp"]').val(XDate(selectedRecord.data.lastChngTmstmp).toString('yyyy-MM-dd HH:mm:ss'));
                		that.$el.find('.CAPSV301-task-detail-table [data-form-param="dstbBfChngCntnt"]').val(selectedRecord.data.dstbBfChngCntnt);
                		that.$el.find('.CAPSV301-task-detail-table [data-form-param="dstbAfChngCntnt"]').val(selectedRecord.data.dstbAfChngCntnt);
//                		that.$el.find('.CAPSV301-task-detail-table [data-form-param="cd"]').prop("readonly", true);
                		
                		fn_pageLayerCtrl("#CAPSV301-task-detail-table", that.$el.find("#btn-task-detail-modal"));
                        that.$el.find("#CAPSV301-task-detail-table").show();
                	}
                }

                , queryDetailGrid : function(baseData) {
                	var that = this;
                	var sParam = {};


                	// 상세 코드 속성 영역 초기화
                	that.resetTaskDetailArea();


                	// 식별자가 없으면 return
                	if(fn_isNull(baseData.dstbTaskId)) {
                		// 그리드 초기화
                		that.CAPSV301TaskDetailGrid.resetData();
                		return;
                	}


                	that.setDetailGridformat(that, baseData.dstbTaskStsCd);

                	sParam.dstbTaskId = baseData.dstbTaskId;
//                	sParam.dstbTaskStsCd = baseData.dstbTaskStsCd;


                    var linkData = {"header": fn_getHeader("CAPSV0060102"),"CaDstbTaskMIO": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                var tbList = responseData.CaDstbTaskInfoIO.dstbTaskDtl;
                                //that.CAPSV301Grid.store.getCount()

                                if (tbList != null && tbList.length > 0) {
                                	var totCnt = tbList.length;
                                	that.$el.find("#searchDetailResultCount").html(bxMsg('cbb_items.SCRNITM#chngHst')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");


                                	that.CAPSV301TaskDetailGrid.setData(tbList);
                                } else {
                                    that.CAPSV301TaskDetailGrid.resetData();
                                 // 상세 코드 속성 초기화
                                    that.resetTaskDetailArea();
                                }
                                that.requestRunBtnShow();
                            }
                        } // end of suucess: fucntion
                    }); // end of bxProxy

                }
                , setDetailGridformat : function(that, dstbTaskStsCd) {

                	that.CAPSV301TaskDetailGrid.resetData();
                }

                , baseSearchModal : function() {
                	fn_pageLayerCtrl("#CAPSV301-base-table", this.$el.find("#btn-base-search-modal"));
                }

                , gridAreaModal : function() {
                	fn_pageLayerCtrl("#CAPSV301-grid", this.$el.find("#btn-up-grid"));
                }

                , detailAreaModal : function() {
                	fn_pageLayerCtrl("#CAPSV301-detail-table", this.$el.find("#btn-detail-modal"));
                }

                , detailTaskListAreaModal : function() {
                	fn_pageLayerCtrl("#CAPSV301-task-detail-grid-area", this.$el.find("#btn-detail-up-grid"));
                }
                
                , taskDetailAreaModal : function() {
                	fn_pageLayerCtrl("#CAPSV301-task-detail-table", this.$el.find("#btn-task-detail-modal"));
                }
                
                , gridExcel : function() {
                	var that = this;
                	that.CAPSV301Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPSV301')+"_"+getCurrentDate("yyyy-mm-dd"));
                }

                , detailGridExcel : function() {
                	var that = this;


                	var taskDetailGrid = that.$el.find('#CAPSV301-task-detail-grid-area #CAPSV301-task-detail-grid');


                	if(taskDetailGrid.css('display') === 'none') {
                		that.CAPSV301SubsetRightGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPSV301')+"_"+getCurrentDate("yyyy-mm-dd"));
                	}
                	else {
                		that.CAPSV301TaskDetailGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPSV301')+"_"+getCurrentDate("yyyy-mm-dd"));
                	}
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
                ,setDstbStaffInfo: function (cls, staffId, staffNm) {
            		this.$el.find('.'+ cls+' [data-form-param="dstbStaffIdNm"]').val(staffId + " " + staffNm); 
                	this.$el.find('.'+ cls+' [data-form-param="dstbStaffId"]').val(staffId); 
                	this.$el.find('.'+ cls+' [data-form-param="dstbStaffNm"]').val(staffNm); 
                }
                /**
				 * Staff Search popup
				 */
				, popStaffSearch: function(){
					var that = this;					
					var param = {};
					//set institution code
					param.instCd = fn_getInstCd(commonInfo.getInstInfo().instCd);
					if(!param.instCd){
						param.instCd = $.sessionStorage('instCd');
					}

				    var popStaffIdObj = new popupStaffId(param);

				    popStaffIdObj.render();
				    popStaffIdObj.on('popUpSetData', function (param) {
//				    	that.$el.find('[data-form-param="dstbStaffIdNm"]').val(param.staffId + " " + param.staffNm); 
//				    	that.$el.find('[data-form-param="dstbStaffId"]').val(param.staffId); 
//				    	that.$el.find('[data-form-param="dstbStaffNm"]').val(param.staffNm); 
				    	that.setDstbStaffInfo('CAPSV301-detail-table',param.staffId,param.staffNm);
				    });
				}
				, popStaffCondSearch: function(){
					var that = this;					
					var param = {};
					//set institution code
					param.instCd = fn_getInstCd(commonInfo.getInstInfo().instCd);
					if(!param.instCd){
						param.instCd = $.sessionStorage('instCd');
					}

				    var popStaffIdObj = new popupStaffId(param);

				    popStaffIdObj.render();
				    popStaffIdObj.on('popUpSetData', function (param) {
//				    	that.$el.find('[data-form-param="dstbStaffIdNm"]').val(param.staffId + " " + param.staffNm); 
//				    	that.$el.find('[data-form-param="dstbStaffId"]').val(param.staffId); 
//				    	that.$el.find('[data-form-param="dstbStaffNm"]').val(param.staffNm); 
				    	that.setDstbStaffInfo('CAPSV301-base-table',param.staffId,param.staffNm);
				    });
				}
				

            })
            ; // end of Backbone.View.extend({


        return CAPSV301View;
    } // end of define function
)
; // end of define
