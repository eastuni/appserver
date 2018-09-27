define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPSV/302/_CAPSV302.html'
        , 'bx-component/date-picker/_date-picker'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , DatePicker
        , ExtGrid
        , commonInfo
        ) {


        /**
         * Backbone
         */
        var CAPSV302View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPSV302-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                	'keydown #searchKey' : 'fn_enter'
                    , 'click #btn-base-reset': 'clickResetBaseArea'
                    , 'click #btn-base-search': 'queryBaseArea'
                    , 'click #btn-base-search-modal': 'baseSearchModal'
                    , 'click #btn-up-grid': 'gridAreaModal'
//                    , 'click #btn-CAPSV302-request-grid-save': 'taskRequestSave'
                    , 'click #btn-CAPSV302-request-grid-run': 'taskRequestProc'
                    , 'click #tab-CAPSV302-request' : 'clickTapRequest'
        			, 'click #tab-CAPSV302-result' : 'clickTapResult'
            		, 'click #btn-request-reset' : 'clickResetRequestArea'
            		, 'click #btn-CAPSV302-result-grid-run' : 'taskResultProc'
                	, 'click #btn-CAPSV302-result-recall' : 'taskResultRecall'
                	, 'click #btn-CAPSV302-result-download' : 'taskResultDownload'
                	, 'click #btn-CAPSV302-result-finish' : 'taskResultFinish'

                    , 'click #btn-CAPSV302-request-init' : 'taskRequestInit'
                	, 'click #btn-CAPSV302-request-stop' : 'taskRequestStop'
                	, 'click #btn-CAPSV302-request-cancel' : 'taskRequestCancel'
                	                		
                		
                		
                	, 'click #btn-CAPSV302-grid-excel' : 'taskgridExcel'
                    , 'click #btn-CAPSV302-request-grid-excel' : 'requestGridExcel'
                    , 'click #btn-CAPSV302-result-grid-excel' : 'resultGridExcel'

                    , 'click #btn-CAPSV302-result-server-grid-excel' : 'resultServerGridExcel'
                    , 'click #btn-CAPSV302-result-server-sql-download' : 'resultServerSqlDownload'
                    
                    	
                    , 'click #btn-up-request-modal': 'requestDetailAreaModal'
                    , 'click #btn-up-request-grid': 'requestGridAreaModal'
                    , 'click #btn-up-result-grid': 'resultGridAreaModal'
                    , 'click #btn-up-result-server-grid': 'resultServerGridAreaModal'
                    	
        			,'change .CAPSV302-request-dstbEnvrnmntCdwrap': 'changeDstbEnvrnmntCd'
        			,'change .CAPSV302-request-dstbWayCd-wrap': 'changeDstbWayCd'
        			, 'click #btnCAPSV302AdditionalSearchCndToggle': 'additionalSearchModal'
        			
                }
                
                
                , initialize: function (initData) {
                    var that = this;
                    that.that = this;
                    that.isMainGridClick = false;
                    $.extend(that, initData);
                    that.$el.html(that.tpl());
                    that.initData = initData;
                    that.dstbSrvrMList = {};
                    that.srvrStore = {};
                    this.inquiryTargetServerData();
                    // 그리드 생성
//                    
//                    var sParam = {};
//                    sParam.actvStsCd = "01";
//                    var linkData = {"header": fn_getHeader('CAPSV0060401'), "CaDstbSrvrMIO": sParam};
//
//                    //ajax호출
//                    bxProxy.post(sUrl
//                        , JSON.stringify(linkData), {
//                            enableLoading: true,
//                            success: function (responseData) {
//                                if (fn_commonChekResult(responseData)) {
//                                	var tbList = responseData.CaDstbSrvrMListOut.tbl;
//                                    if (tbList != null || tbList.length > 0) {
//                                    	that.dstbSrvrMList = tbList;
//                                    }
//                                }
//                            }   // end of suucess: fucntion
//                        }
//                    ); // end of bxProxy
                    
                    that.fn_createGrid();
                }

                , render: function () {
                	this.setDatePicker();
                	this.setTimeInput();
                	
                 // 콤보데이터 로딩
                    var sParam = {};

                    //배포상태
                    sParam = {};
                    sParam.className = "CAPSV302-base-dstbStsCd-wrap";
                    sParam.targetId = "dstbStsCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                    sParam.cdNbr = "A1005";
//                    sParam.selectVal = "05";
                    fn_getCodeList(sParam, this);
                    
                  //배포상태
                    sParam = {};
                    sParam.className = "CAPSV302-request-dstbStsCd-wrap";
                    sParam.targetId = "dstbStsCd";
                    sParam.nullYn = "Y";
                    sParam.disabled = true;
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                    sParam.cdNbr = "A1005";
                    fn_getCodeList(sParam, this);
                    
                    //배포방법
                    sParam = {};
                    sParam.className = "CAPSV302-request-dstbWayCd-wrap";
                    sParam.targetId = "dstbWayCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                    sParam.cdNbr = "A1006";
                    fn_getCodeList(sParam, this);
                    
                  //배포서버환경
                    sParam = {};
                    sParam.className = "CAPSV302-request-dstbEnvrnmntCdwrap";
                    sParam.targetId = "dstbEnvrnmntCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                    sParam.cdNbr = "A1035";
                    fn_getCodeList(sParam, this);
                    
                  //배포서버환경
                    sParam = {};
                    sParam.className = "CAPSV302-base-dstbEnvrnmntCdwrap";
                    sParam.targetId = "dstbEnvrnmntCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                    sParam.cdNbr = "A1035";
                    fn_getCodeList(sParam, this);
                    
                    this.CAPSV302ResultGrid.resetData();
                    this.$el.find("#result-gird-area").hide(); //배포결과
                    this.$el.find("#btn-CAPSV302-result-grid-run").hide();
                    this.$el.find("#btn-CAPSV302-result-recall").hide();
                    
                    this.setChangeExcuteMode();
//                    this.setChangeStatus();
                    //과제에서 넘어온 경우
                    if(this.initData.param) {
                    	if(this.initData.param.dstbTaskId) {
                    		
                    		this.$el.find('.CAPSV302-base-table [data-form-param="dstbTaskId"]').val(this.initData.param.dstbTaskId);
                    		this.$el.find('.CAPSV302-request-table [data-form-param="dstbTaskId"]').val(this.initData.param.dstbTaskId);
                    		this.queryBaseArea();
                    		// 조회
                    		// trnsfrKnd 변환유형코드 콤보박스가 다 그려 졌는지 확인 한다.
                    		// 타이머설정
//                            var timer = setInterval(function () {
//                                if (that.$el.find('.CAPCM190-base-table [data-form-param="trnsfrKnd"]').children().length != 0) {
//                                    clearInterval(timer);
//                                    var param = {};
//                                    //역할분류관계조회
//                                    that.queryBaseArea(param);
//                                }
//                            }, 100);
                    	}
                    }
                    
                    return this.$el;
                }

                , fn_enter : function(event) {
          	      	var event = event || window.event;
          	      	var keyID = (event.which) ? event.which : event.keyCode;
          	      	if(keyID == 13) { //enter
          	      		that.queryBaseArea();
          	      	}
                }
                , inquiryTargetServerData: function () {
                	var that = this;
                    var sParam = {};

                    sParam.actvStsCd = "01";
                    var linkData = {"header": fn_getHeader('CAPSV0060401'), "CaDstbSrvrMIO": sParam};

                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                    var tbList = responseData.CaDstbSrvrMListOut.tbl;
                                    
                                    that.srvrStore = new Ext.data.Store({
                                        fields: ['dstbSrvrId', 'dstbSrvrNm']
                                        , data: tbList
                                    });
                                    
                                    var totCnt = tbList.length;
                                    if (tbList != null || tbList.length > 0) {
                                    	that.dstbSrvrMList = tbList;
                                        // add option to 기본속성 combobox 
                                        var comboParam = {};
//                                        comboParam.className = "CAPSV302-base-dstbSrvrIdwrap";
//                                        comboParam.tblNm = tbList;
//                                        comboParam.nullYn = "Y";
//                                        comboParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
//                                        comboParam.valueNm = "dstbSrvrId";
//                                        comboParam.textNm = "dstbSrvrNm";
//                                        fn_makeComboBox(comboParam, that);
                                        
                                        comboParam.className = "CAPSV302-request-dstbSrvrIdwrap";
                                        comboParam.tblNm = tbList;
                                        comboParam.nullYn = "Y";
                                        comboParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                                        comboParam.valueNm = "dstbSrvrId";
                                        comboParam.textNm = "dstbSrvrNm";
                                        fn_makeComboBox(comboParam, that);
                                    }
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                } // end

                , fn_createGrid : function() {
                	var that = this;

                    that.CAPSV302Grid = new ExtGrid({
                        // 그리드 컬럼 정의
                        fields: ['rowIndex', 'dstbRqstId', 'dstbTaskId', 'dstbStsCd','dstbWayCd', 'dstbEnvrnmntCd', 'dstbSchdlTmstmp','dstbRqstDscd','lastChngId','lastChngTmstmp']
                        , id: 'CAPSV302Grid'
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
                            , {text: bxMsg('cbb_items.AT#dstbRqstId'), flex: 1, dataIndex: 'dstbRqstId', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#dstbTaskId'), flex: 1, dataIndex: 'dstbTaskId', style: 'text-align:center', align: 'center'}
                           
                            ,{
                                text: bxMsg('cbb_items.AT#dstbStsCd'),
                                flex: 1,
                                dataIndex: 'dstbStsCd',
                                style: 'text-align:center',
                                align: 'center',
                                code: 'A1005',
                                renderer: function (val) {
                                    return val ? bxMsg('cbb_items.CDVAL#A1005' + val) : '';
                                }
                            }
                            ,{
                                text: bxMsg('cbb_items.AT#dstbWayCd'),
                                flex: 1,
                                dataIndex: 'dstbWayCd',
                                style: 'text-align:center',
                                align: 'center',
                                code: 'A1006',
                                renderer: function (val) {
                                    return val ? bxMsg('cbb_items.CDVAL#A1006' + val) : '';
                                }
                            }
                            ,{
                                text: bxMsg('cbb_items.AT#dstbEnvrnmntCd'),
                                flex: 1,
                                dataIndex: 'dstbEnvrnmntCd',
                                style: 'text-align:center',
                                align: 'center',
                                code: 'A1035',
                                renderer: function (val) {
                                    return val ? bxMsg('cbb_items.CDVAL#A1035' + val) : '';
                                }
                            }
                            , {text: bxMsg('cbb_items.AT#dstbSchdlTmstmp'),width: 160,dataIndex: 'dstbSchdlTmstmp', style: 'text-align:center', align: 'center'
                            	, type: 'date',
                                renderer : function(value) {
                                    return XDate(value).toString('yyyy-MM-dd HH:mm:ss');
                                }
                            }
                            ,{
                                text: bxMsg('cbb_items.AT#dstbRqstDscd'),
                                flex: 1,
                                dataIndex: 'dstbRqstDscd',
                                style: 'text-align:center',
                                align: 'center',
                                code: 'A1040',
                                renderer: function (val) {
                                    return val ? bxMsg('cbb_items.CDVAL#A1040' + val) : '';
                                }
                            }
                            
                            , {text: bxMsg('cbb_items.AT#lastChngId'),width: 160,dataIndex: 'lastChngId', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#lastChngTmstmp'),width: 160,dataIndex: 'lastChngTmstmp', style: 'text-align:center', align: 'center'
                            	, type: 'date',
                                renderer : function(value) {
                                    return XDate(value).toString('yyyy-MM-dd HH:mm:ss');
                                }
                            }
                        ] // end of columns
	                    , listeners: {
	                        click: {
	                            element: 'body'
	                            , fn: function (event) {
	                                that.clickResultDetailGrid();
	                            }
	                        }
	                    }
                    });

                    that.$el.find("#CAPSV302-grid").html(that.CAPSV302Grid.render({'height': 300}));
                    
                    that.CAPSV302RequestGrid = new ExtGrid({
                    	fields: ['dstbTaskChngSeqNbr', 'dstbTblId', 'dstbPkValCntnt', 'dstbSaveDscd', 'dstbTaskChngHstSeqNbr','lastChngId','lastChngTmstmp','dstbBfChngCntnt','dstbAfChngCntnt','dplctnKeyValCntnt']
	                    , id: 'CAPSV302RequestGrid'
	                    , columns: [
							{text: bxMsg('cbb_items.AT#dstbTaskChngSeqNbr'), flex: 1, height: 25, dataIndex: 'dstbTaskChngSeqNbr', style: 'text-align:center', align: 'center'}
	                        , {text: bxMsg('cbb_items.AT#dstbTblId'), flex: 1, dataIndex: 'dstbTblId', style: 'text-align:center', align: 'center'}
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
	                        , {text: bxMsg('cbb_items.AT#dstbTaskChngHstSeqNbr'), flex: 1, dataIndex: 'dstbTaskChngHstSeqNbr', style: 'text-align:center', align: 'center'}
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
	                            }
	                        }
	                    }
                    });
                    that.$el.find("#CAPSV302-request-grid").html(that.CAPSV302RequestGrid.render({'height': 150}));

                    // 서비스 그리드 생성
                    that.CAPSV302ResultServerGrid = new ExtGrid({
                    	// 그리드 컬럼 정의
                    	fields: ['dstbRqstId', 'dstbTaskId', 'dstbSrvrId','dstbPrcsStsCd','dstbPrcsTmstmp','dstbRsltErrCd','rePrcsng']
                    	, id: 'CAPSV302ResultServerGrid'
                    	, columns: [
                    	            {text: bxMsg('cbb_items.AT#dstbRqstId'), flex: 1, height: 25, dataIndex: 'dstbRqstId', style: 'text-align:center', align: 'center'}
                    	            ,{text: bxMsg('cbb_items.AT#dstbTaskId'), flex: 1, height: 25, dataIndex: 'dstbTaskId', style: 'text-align:center', align: 'center'}
                    	            
                    	            ,{
                                        text: bxMsg('cbb_items.AT#dstbSrvrNm'),
                                        flex: 1,
                                        dataIndex: 'dstbSrvrId',
                                        style: 'text-align:center',
                                        align: 'center',
                                        renderer: function (val) {
                                        	var rtn = "";
                                        	 if (that.dstbSrvrMList != null || that.dstbSrvrMList.length > 0) {
                                        		 for(var i=0; i < that.dstbSrvrMList.length;i++){
                                                     if(val == that.dstbSrvrMList[i].dstbSrvrId){
                                                    	 rtn = that.dstbSrvrMList[i].dstbSrvrNm;
                                                    	 break;
                                                     }
                                                 }
                                        	 }
                                            return rtn;
                                        }
                                    }
                    	            ,{
                                        text: bxMsg('cbb_items.AT#dstbPrcsStsCd'),
                                        flex: 1,
                                        dataIndex: 'dstbPrcsStsCd',
                                        style: 'text-align:center',
                                        align: 'center',
                                        code: 'A1007',
                                        renderer: function (val) {
                                            return val ? bxMsg('cbb_items.CDVAL#A1007' + val) : '';
                                        }
                                    }
                    	            , {text: bxMsg('cbb_items.AT#dstbPrcsTmstmp'),width: 160,dataIndex: 'dstbPrcsTmstmp', style: 'text-align:center', align: 'center'
        	                        	, type: 'date',
        	                            renderer : function(value) {
        	                                return XDate(value).toString('yyyy-MM-dd HH:mm:ss');
        	                            }
        	                        }
                    	            , {text: bxMsg('cbb_items.AT#dstbRsltErrCd'), flex: 1, dataIndex: 'dstbRsltErrCd', style: 'text-align:center', align: 'center'}
                    	            , {xtype: 'actioncolumn', text: bxMsg('cbb_items.SCRNITM#rePrcsng'), flex: 1, align: 'center', style: 'text-align:center'
	        	                        	, renderer: function (val, metaData, record, row, col, store, gridView) {
	        	                        		var rtnBtn = "-";
	        	                        		
	        	                        		if(record.get("dstbPrcsStsCd")=='99'){ //배포 실패이면 재실행 요청가능
	        	                        			rtnBtn = "<button type=\"button\" class=\"bw-btn-form add-mg-t-5\" id=\"btn-grid-reDistr\">"+bxMsg('cbb_items.SCRNITM#reDistribution')+"</button>";
	        	                        		} else {
	        	                        			var reqData = that.CAPSV302Grid.grid.getSelectionModel().selected.items[0];
	        	                        			if (reqData) {
	        	                        				var dstbStsCd = reqData.data.dstbStsCd; //배포상태코드
	        	                        				var dstbWayCd = reqData.data.dstbWayCd; //배포방법코드
	        	                                		if(dstbStsCd == '01' && dstbWayCd != 'H'){ //배포요청상태면 재요청 가능. 단, 수기배포방식에서는 노출하지 않는다.
	        	                                			rtnBtn = "<button type=\"button\" class=\"bw-btn-form add-mg-t-5\" id=\"btn-grid-recallDistr\">"+bxMsg('cbb_items.SCRNITM#btn_recallDistr')+"</button>";
	        	                                		}
	        	                        			}
	        	                        		}
	        	                        		return rtnBtn;
	        	                        	}
	        	                        	, listeners: {
	        		                          /**
	        		                           * 버튼 클릭 이벤트 등록
	        		                           */
	        		                          click: function (grid, rowEl, rowIdx, cellIdx, e, record) {
	        		                              if ($(e.target).hasClass('bw-btn-form')) {
	        		                            	  if($(e.target)[0].id == 'btn-grid-recallDistr'){
	        		                            		  that.taskResultRecall(record);
	        		                            	  } else if($(e.target)[0].id == 'btn-grid-reDistr'){
	        		                            		  that.taskResultProc(record);
	        		                            	  }
	        		                            	  
//	        		                            	  var param = {};
//	        		                            	  param.trnsfrKndCd = "CDVAL_NAME"; // 코드값
//	        		                            	  param.trnsfrOriginKeyVal = that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbr"]').val()+record.get("cd"); // 코드+값
//	        		                            	  that.openPage(e, param);
	        		                              }
	        		                          }
	        		                      }
	                                 }
                    	            , {xtype: 'actioncolumn', text: bxMsg('cbb_items.SCRNITM#dstbFin'), flex: 1, align: 'center', style: 'text-align:center'
        	                        	, renderer: function (val, metaData, record, row, col, store, gridView) {
        	                        		var rtnBtn = "-";
        	                        		
        	                        		if(record.get("dstbPrcsStsCd")=='01'){ //배포 실패이면 재실행 요청가능
        	                        			var reqData = that.CAPSV302Grid.grid.getSelectionModel().selected.items[0];
        	                        			if (reqData) {
        	                        				var dstbWayCd = reqData.data.dstbWayCd;
        	                        				var dstbStsCd = reqData.data.dstbStsCd;
        	                        				if(dstbWayCd == 'H' && dstbStsCd == '01'){ //수기배포방식 && 배포요청상태면 배포완료 가능 
        	                                			rtnBtn = "<button type=\"button\" class=\"bw-btn-form add-mg-t-5\" id=\"btn-grid-finishDistr\">"+bxMsg('cbb_items.SCRNITM#dstbFin')+"</button>";
        	                                		}
        	                        			}
        	                        		}
        	                        		return rtnBtn;
        	                        	}
        	                        	, listeners: {
        		                          /**
        		                           * 버튼 클릭 이벤트 등록
        		                           */
        		                          click: function (grid, rowEl, rowIdx, cellIdx, e, record) {
        		                              if ($(e.target).hasClass('bw-btn-form')) {
       		                            		  that.taskResultFinish(record);
        		                              }
        		                          }
        		                      }
                                 }
                    	            
            	            ] // end of columns
		                    , listeners: {
		                        click: {
		                            element: 'body'
		                            , fn: function (event) {
		                                //더블클릭시 이벤트 발생
//		                            	that.clickResultDetailServerGrid();
		                            }
		                        }
		                    }
                    });
                    that.$el.find("#CAPSV302-result-server-grid").html(that.CAPSV302ResultServerGrid.render({'height': 150}));
                    
                 // 서비스 그리드 생성
                    that.CAPSV302ResultGrid = new ExtGrid({
                    	// 그리드 컬럼 정의
                    	fields: ['dstbTaskChngSeqNbr', 'dstbTaskChngHstSeqNbr','dstbSaveDscd', 'lastChngId', 'lastChngTmstmp']
                    	, id: 'CAPSV302ResultGrid'
                    	, columns: [
                    	             {text: bxMsg('cbb_items.AT#dstbTaskChngSeqNbr'), flex: 1, height: 25, dataIndex: 'dstbTaskChngSeqNbr', style: 'text-align:center', align: 'center'}
                    	            , {text: bxMsg('cbb_items.AT#dstbTaskChngHstSeqNbr'), flex: 1, dataIndex: 'dstbTaskChngHstSeqNbr', style: 'text-align:center', align: 'center'}
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
                    	            , {text: bxMsg('cbb_items.AT#lastChngId'), flex: 1, dataIndex: 'lastChngId', style: 'text-align:center', align: 'center'}
                    	            , {text: bxMsg('cbb_items.AT#lastChngTmstmp'),width: 160,dataIndex: 'lastChngTmstmp', style: 'text-align:center', align: 'center'
        	                        	, type: 'date',
        	                            renderer : function(value) {
        	                                return XDate(value).toString('yyyy-MM-dd HH:mm:ss');
        	                            }
        	                        }
            	            ] // end of columns
		                    , gridConfig: {
		                        // 셀 에디팅 플러그인
		                        // 2번 클릭시, 에디팅할 수 있도록 처리
		                        plugins: [
		                            Ext.create('Ext.grid.plugin.CellEditing', {
		                                clicksToEdit: 2
		                                , listeners: {


		                                }  // end of listener for after edit
		                            }) // end of Ext.create
		                        ] // end of plugins
		                    } // end of gridConfig
                    });
                    that.$el.find("#CAPSV302-result-grid").html(that.CAPSV302ResultGrid.render({'height': 150}));
                   
                }
                , queryBaseArea: function () {
                    var that = this;
                    that.inquiryBaseData();
                }
                , inquiryBaseData: function () {
                    // header 정보 set
                    var that = this;
                    var sParam = {};
                    sParam.dstbRqstId = that.$el.find('.CAPSV302-base-table [data-form-param="dstbRqstId"]').val();
                    sParam.dstbTaskId = that.$el.find('.CAPSV302-base-table [data-form-param="dstbTaskId"]').val();
                    sParam.dstbStsCd = that.$el.find('#CAPSV302-base-table [data-form-param="dstbStsCd"]').val();
                    var srchStartDtm = that.$el.find('#CAPSV302-base-table [data-form-param="srchStartDtm"]').val();
                    var srchEndDtm = that.$el.find('#CAPSV302-base-table [data-form-param="srchEndDtm"]').val();
                    if(srchStartDtm != ''){
                    	sParam.srchStartDtm = fn_getDateValue(srchStartDtm) + "000000";
                    }
                    if(srchEndDtm != ''){
                    	sParam.srchEndDtm = fn_getDateValue(srchEndDtm) + "235959";
                    }
                    sParam.dstbEnvrnmntCd = that.$el.find('.CAPSV302-base-table [data-form-param="dstbEnvrnmntCd"]').val();
    
                    var linkData = {"header": fn_getHeader("CAPSV0060301"), "CaDstbReqMIn": sParam};

                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	var data = responseData.CaDstbReqMListOut;
                            	that.CAPSV302Grid.setData(data.tbl);
                            	
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                } // end


                , clickResetBaseArea : function() {
                	this.$el.find('#CAPSV302-base-table [data-form-param="dstbRqstId"]').val("");
            		this.$el.find('#CAPSV302-base-table [data-form-param="dstbTaskId"]').val("");
            		this.$el.find('#CAPSV302-base-table [data-form-param="dstbStsCd"] option:eq(0)').attr("selected", "selected");
            		fn_makeDatePicker(this.$el.find('#CAPSV302-base-table [data-form-param="srchStartDtm"]'));
                    fn_makeDatePicker(this.$el.find('#CAPSV302-base-table [data-form-param="srchEndDtm"]'));
            		this.$el.find('#CAPSV302-base-table [data-form-param="dstbSrvrId"] option:eq(0)').attr("selected", "selected");
                }
                , clickResetRequestArea : function() {
                	this.setChangeExcuteMode();
            		
                	this.$el.find('#CAPSV302-request-table [data-form-param="dstbRqstId"]').val("");
            		this.$el.find('#CAPSV302-request-table [data-form-param="dstbTaskId"]').val("");
            		this.$el.find('#CAPSV302-request-table [data-form-param="dstbStsCd"] option:eq(1)').attr("selected", "selected");
//            		this.$el.find('#CAPSV302-request-table [data-form-param="dstbExecuteDt"]').val("");
//            		this.$el.find('#CAPSV302-request-table [data-form-param="dstbExecuteHms"]').val("");
            		this.$el.find('#CAPSV302-request-table [data-form-param="dstbSchdlDt"]').val("");
            		this.$el.find('#CAPSV302-request-table [data-form-param="dstbSchdlHms"]').val("");
            		this.$el.find('#CAPSV302-request-table [data-form-param="dstbEnvrnmntCd"] option:eq(0)').attr("selected", "selected");
            		this.$el.find('.CAPSV302-request-table-srvrList').empty();
            		this.CAPSV302RequestGrid.resetData();
            		this.$el.find('.CAPSV302-request-table [data-form-param="dstbWayCd"]').val("");
            		this.changeDstbWayCd();
            		
//            		this.setChangeStatus();
                }
                , baseSearchModal : function() {
                	fn_pageLayerCtrl("#CAPSV302-base-table", this.$el.find("#btn-base-search-modal"));
                }
                
                , gridAreaModal : function() {
                	fn_pageLayerCtrl("#CAPSV302-grid", this.$el.find("#btn-up-grid"));
                }
                
                , requestDetailAreaModal : function() {
                	fn_pageLayerCtrl("#CAPSV302-request-table", this.$el.find("#btn-up-request-modal"));
                }
                , requestGridAreaModal : function() {
                	fn_pageLayerCtrl("#CAPSV302-request-grid", this.$el.find("#btn-up-request-grid"));
                }
                , resultGridAreaModal : function() {
                	fn_pageLayerCtrl("#CAPSV302-result-grid", this.$el.find("#btn-up-result-grid"));
                }
                , resultServerGridAreaModal : function() {
                	fn_pageLayerCtrl("#CAPSV302-result-server-grid", this.$el.find("#btn-up-result-server-grid"));
                }
                
                , taskgridExcel : function() {
                	var that = this;
                	that.CAPSV302Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPSV302')+"_"+getCurrentDate("yyyy-mm-dd"));
                }
                , requestGridExcel : function() {
                	var that = this;
                	that.CAPSV302RequestGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPSV302')+"_"+getCurrentDate("yyyy-mm-dd"));
                }
                , resultGridExcel : function() {
                	var that = this;
                	that.CAPSV302ResultGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPSV302')+"_"+getCurrentDate("yyyy-mm-dd"));
                }	
                , resultServerGridExcel : function() {
                	var that = this;
                	that.CAPSV302ResultServerGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPSV302')+"_"+getCurrentDate("yyyy-mm-dd"));
                }	
                
                
                , clickTapRequest : function(event) {
                	this.$el.find("#tab-title > ul > li").removeClass("on-tab");
                	this.$el.find("#tab-CAPSV302-request").addClass("on-tab");
                	this.$el.find("#request-grid-area").show();
                	this.$el.find("#result-gird-area").hide();
                	
//                	this.deleteList = [];
//                	this.selectDeptList(this.$el.find('#CAPSV302-base-table [data-form-param="cntrlCntrId"]').val());
                }

                , clickTapResult : function(event) {
                	this.$el.find("#tab-title > ul > li").removeClass("on-tab");
                	this.$el.find("#tab-CAPSV302-result").addClass("on-tab");
                	this.$el.find("#request-grid-area").hide();
                	this.$el.find("#result-gird-area").show();
//                	var reqAllData = this.CAPSV302Grid.getAllData();
                	if(!this.isMainGridClick){
                    	this.CAPSV302ResultServerGrid.resetData();
                	}
//                	this.deleteList = [];
//                	this.selectSrvcList(this.$el.find('#CAPSV302-base-table [data-form-param="cntrlCntrId"]').val());
                }
                
                ,changeDstbEnvrnmntCd: function () {
                	var rqstId = this.$el.find('.CAPSV302-request-table [data-form-param="dstbRqstId"]').val(); //배포요청ID
                    var taskId = this.$el.find('.CAPSV302-request-table [data-form-param="dstbTaskId"]').val(); //과제ID
                    var dstbEnvrnmntCd = this.$el.find('.CAPSV302-request-table [data-form-param="dstbEnvrnmntCd"]').val(); //대상환경
                    
                    
                    var that = this;
                    var sParam = {};
                    that.$el.find('.CAPSV302-request-table-srvrList').empty();
                    sParam.dstbTaskId = taskId;
                    sParam.dstbEnvrnmntCd = dstbEnvrnmntCd;
                    
                    if(taskId == '' || dstbEnvrnmntCd == ''){
                    	that.CAPSV302RequestGrid.resetData();
                    	return;
                    }
                    
//                    if(rqstId != ''){
                    	var reqData = that.CAPSV302Grid.grid.getSelectionModel().selected.items[0];
                    	if(reqData && reqData.data.dstbEnvrnmntCd == dstbEnvrnmntCd){
                    		that.setChangeSaveMode();
//                    		that.setChangeExcuteMode();
                    	} else {
                    		that.setChangeExcuteMode();
                    	}
//                    } else {
//                    	that.setChangeExcuteMode();
//                    }
                    
                    this.$el.find('#CAPSV302-request-table [data-form-param="dstbStsCd"] option:eq(1)').attr("selected", "selected");
                    
                    var linkData = {"header": fn_getHeader('CAPSV0060105'), "CaDstbReqInfoIO": sParam};

                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                	 var tbList = responseData.CaDstbTaskInfoIO.dstbTaskDtl;

                                     if (tbList != null && tbList.length > 0) {
//                                     	var totCnt = tbList.length;
//                                     	that.$el.find("#searchDetailResultCount").html(bxMsg('cbb_items.SCRNITM#chngHst')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                    	 
                                     	that.CAPSV302RequestGrid.setData(tbList);
                                     } else {
                                         that.CAPSV302RequestGrid.resetData();
                                         if(rqstId != ''){
                                        	 that.setChangeSaveMode();
                                         }
                                     }
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                    
                    if (that.dstbSrvrMList != null || that.dstbSrvrMList.length > 0) {
                    	for(var i=0; i < that.dstbSrvrMList.length;i++){
                            var srvrListArea =	that.$el.find('.CAPSV302-request-table-srvrList');
                            if(dstbEnvrnmntCd == that.dstbSrvrMList[i].dstbEnvrnmntCd){
                            	srvrListArea.append('<li>'+ (i+1) + '. ' +that.dstbSrvrMList[i].dstbSrvrNm+'</li>');
                            	
                            	if(that.dstbSrvrMList[i].lastStepYn == 'Y'){
                            		sParam = {};
                                    sParam.className = "CAPSV302-request-dstbWayCd-wrap";
                                    sParam.targetId = "dstbWayCd";
                                    sParam.nullYn = "Y";
                                    sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                                    sParam.cdNbr = "A1006";
                                    fn_getCodeList(sParam, this);
                            	} else {
                            		that.$el.find('.CAPSV302-request-table [data-form-param="dstbWayCd"]').find('option[value="H"]').remove();
                            		that.$el.find('.CAPSV302-request-table [data-form-param="dstbWayCd"]').find('option[value="H"]').val('');
                            	}
                            }
                        }
                    }
                    
//                    sParam = {};
//                    sParam.actvStsCd = "01";
//                    sParam.dstbEnvrnmntCd = dstbEnvrnmntCd;
//                    var linkData = {"header": fn_getHeader('CAPSV0060401'), "CaDstbSrvrMIO": sParam};
//
//                    //ajax호출
//                    bxProxy.post(sUrl
//                        , JSON.stringify(linkData), {
//                            enableLoading: true,
//                            success: function (responseData) {
//                                if (fn_commonChekResult(responseData)) {
//                                    var tbList = responseData.CaDstbSrvrMListOut.tbl;
//                                    if (tbList != null || tbList.length > 0) {
//                                        for(var i=0; i < tbList.length;i++){
//                                          var srvrListArea =	that.$el.find('.CAPSV302-request-table-srvrList');
//                                          srvrListArea.append('<li>'+ (i+1) + '. ' +tbList[i].dstbSrvrNm+'</li>');
//                                        }
//                                    }
//                                }
//                            }   // end of suucess: fucntion
//                        }
//                    ); // end of bxProxy
                }
                
                ,changeDstbWayCd: function () {
                    var dstbWayCd = this.$el.find('.CAPSV302-request-table [data-form-param="dstbWayCd"]').val(); //배포방법 코드[I:즉시배포,R:예약배포,H:수기배포]
                    switch (dstbWayCd) {
					case 'R':
//                    	this.$el.find('.CAPSV302-request-dstbWayCd-change').show(); //예약 일시 + 예약 시간
                    	this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlDt"]').prop("disabled", false);
                    	this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlHms"]').prop("disabled", false);
                    	this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlDt"]').prop("readonly", false);
                    	this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlHms"]').prop("readonly", false);
                    	break;
					case 'H':
//                    	this.$el.find('.CAPSV302-request-dstbWayCd-change').show(); //예약 일시 + 예약 시간
                    	this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlDt"]').prop("disabled", true);
                    	this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlHms"]').prop("disabled", true);
                    	this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlDt"]').prop("readonly", true);
                    	this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlHms"]').prop("readonly", true);
                    	this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlDt"]').val('');
                    	this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlHms"]').val('');
                    	break;
					default:
//                    	this.$el.find('.CAPSV302-request-dstbWayCd-change').hide(); //예약 일시 + 예약 시간
                    	this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlDt"]').prop("disabled", true);
                    	this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlHms"]').prop("disabled", true);
                    	this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlDt"]').prop("readonly", true);
                    	this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlHms"]').prop("readonly", true);
                    	this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlDt"]').val('');
                    	this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlHms"]').val('');
                    	break;
					}
                }
                
//                ,taskRequestSave:function(){
//                	var that = this;
//                   
//            	  var dstbWayCd = that.$el.find('.CAPSV302-request-table [data-form-param="dstbWayCd"]').val(); //대상서버
//                  var  dstbSchdlDt = that.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlDt"]').val(); //대상서버
//                  var  dstbSchdlHms = that.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlHms"]').val(); //대상서버
//                  if(dstbWayCd == ''){
//                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbWayCd')+"]");
//                    	return;
//                  }
//                  
//                  if(dstbWayCd =='R'){
//                  	if(dstbSchdlDt == '' || dstbSchdlHms == ''){
//                      	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbSchdlTmstmp')+"]");
//                      	return;
//                    }
//                  }
//                  fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#run'), bxMsg('cbb_items.SCRNITM#runCnfrm'), that.taskRequestSaveCall, that);
//                }
//                ,taskRequestSaveCall: function (that) {
//                    ////배포요청
//                    var sParam = {};
//
//                    sParam.dstbRqstId = that.$el.find('.CAPSV302-request-table [data-form-param="dstbRqstId"]').val(); //배포요청식별자;
//                    sParam.dstbTaskId = that.$el.find('.CAPSV302-request-table [data-form-param="dstbTaskId"]').val(); //과제ID;
//                    sParam.dstbSrvrId = that.$el.find('.CAPSV302-request-table [data-form-param="dstbSrvrId"]').val(); //대상서버
//                    sParam.dstbStsCd = that.$el.find('.CAPSV302-request-table [data-form-param="dstbStsCd"]').val(); //배포상태
//                    sParam.dstbWayCd = that.$el.find('.CAPSV302-request-table [data-form-param="dstbWayCd"]').val(); //배포방식
////                    var  dstbExecuteDt = that.$el.find('.CAPSV302-request-table [data-form-param="dstbExecuteDt"]').val(); //
////                    var  dstbExecuteHms = that.$el.find('.CAPSV302-request-table [data-form-param="dstbExecuteHms"]').val(); //
//                    var  dstbSchdlDt = that.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlDt"]').val(); //예약일자
//                    var  dstbSchdlHms = that.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlHms"]').val(); //예약시간
////                    sParam.dstbExecuteTmstmp = getCurrentDate("yyyy-MM-dd HH:mm:ss"); //실행일시
//                    sParam.dstbSchdlTmstmp = dstbSchdlDt + " " + dstbSchdlHms; //실행일자
////                    sParam.sndFinYn = "N"; //대상서버
//                    
//                    var linkData = {"header": fn_getHeader('CAPSV0060303'), "CaDstbReqMIO": sParam};
//
//                    //ajax호출
//                    bxProxy.post(sUrl
//                        , JSON.stringify(linkData), {
//                            enableLoading: true,
//                            success: function (responseData) {
//                                if (fn_commonChekResult(responseData)) {
////                                	 var tbList = responseData.CaDstbTaskInfoIO.dstbTaskDtl;
//                                	 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
//                                	 that.inquiryBaseData();
//                                }
//                            }   // end of suucess: fucntion
//                        }
//                    ); // end of bxProxy
//                }
                
                ,taskRequestProc:function(){
                	var that = this;
                    var reqAllData = this.CAPSV302RequestGrid.getAllData();
            		
            		
            		//배포요청 가능한 요건정보가 없습니다.
            		if(reqAllData.length < 1){
            			fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0062'));  
//            			alertMessage.error(bxMsg("cbb_err_msg.AUICME0006") + "[" + bxMsg("cbb_items.AT#staffId") + "]");
            			return;
            		}
            		var dstbTaskId = that.$el.find('.CAPSV302-request-table [data-form-param="dstbTaskId"]').val(); //과제ID;
	            	var dstbWayCd = that.$el.find('.CAPSV302-request-table [data-form-param="dstbWayCd"]').val(); //대상서버
	            	var dstbStsCd = that.$el.find('.CAPSV302-request-table [data-form-param="dstbStsCd"]').val(); //배포상태
	                var  dstbSchdlDt = that.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlDt"]').val(); //대상서버
	                var  dstbSchdlHms = that.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlHms"]').val(); //대상서버
	                if(dstbTaskId == ''){
	                  	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbTaskId')+"]");
	                  	return;
	                }
	                if(dstbWayCd == ''){
	                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbWayCd')+"]");
	                    	return;
	                }
	                if(dstbStsCd == ''){
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbStsCd')+"]");
                    	return;
                    }
	                if(dstbWayCd == ''){
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbWayCd')+"]");
                    	return;
                    }  
	                if(dstbWayCd =='R'){
	                  	if(dstbSchdlDt == '' || dstbSchdlHms == ''){
	                      	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbSchdlTmstmp')+"]");
	                      	return;
	                    }
	                }
	                
                  fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#run'), bxMsg('cbb_items.SCRNITM#runCnfrm'), that.taskRequestProcCall, that);
                }
                
                ,taskRequestProcCall: function (that) {
                    ////배포요청
                    var sParam = {};

                    sParam.dstbRqstId = that.$el.find('.CAPSV302-request-table [data-form-param="dstbRqstId"]').val(); //배포요청식별자;
                    sParam.dstbTaskId = that.$el.find('.CAPSV302-request-table [data-form-param="dstbTaskId"]').val(); //과제ID;
//                    sParam.dstbSrvrId = that.$el.find('.CAPSV302-request-table [data-form-param="dstbSrvrId"]').val(); //대상서버
                    sParam.dstbStsCd = that.$el.find('.CAPSV302-request-table [data-form-param="dstbStsCd"]').val(); //대상서버
                    sParam.dstbWayCd = that.$el.find('.CAPSV302-request-table [data-form-param="dstbWayCd"]').val(); //대상서버
//                    var  dstbExecuteDt = that.$el.find('.CAPSV302-request-table [data-form-param="dstbExecuteDt"]').val(); //대상서버
//                    var  dstbExecuteHms = that.$el.find('.CAPSV302-request-table [data-form-param="dstbExecuteHms"]').val(); //대상서버
                    var  dstbSchdlDt = that.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlDt"]').val(); //대상서버
                    var  dstbSchdlHms = that.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlHms"]').val(); //대상서버
//                    sParam.dstbExecuteTmstmp = getCurrentDate("yyyy-MM-dd HH:mm:ss"); //대상서버
                    sParam.dstbSchdlTmstmp = dstbSchdlDt + " " + dstbSchdlHms; //대상서버
                    sParam.sndFinYn = "N"; //대상서버
                    sParam.dstbRqstDscd="01";
                    sParam.dstbEnvrnmntCd=that.$el.find('.CAPSV302-request-table [data-form-param="dstbEnvrnmntCd"]').val(); //대상서버
                    
                    
                    var reqAllData = that.CAPSV302RequestGrid.getAllData();
            		
                    var srvrList = that.dstbSrvrMList;
                    var dstbReqSrvrDtl = [];
            		$(srvrList).each(function(idx, data) {
            			if(sParam.dstbEnvrnmntCd == data.dstbEnvrnmntCd){
	            			var arryDtl = [];
	                		$(reqAllData).each(function(dIdx, gridData) {
	                			arryDtl.push(
	                					{"dstbRqstId":sParam.dstbRqstId
	                						,"dstbTaskId":sParam.dstbTaskId
	                						,"dstbTaskChngSeqNbr":gridData.dstbTaskChngSeqNbr
	                						,"dstbTaskChngHstSeqNbr":gridData.dstbTaskChngHstSeqNbr
	                						,"dstbSrvrId":data.dstbSrvrId
	                						,"dstbSaveDscd":gridData.dstbSaveDscd
	                					}
	                			);
	                		});
	                		
	            			dstbReqSrvrDtl.push(
	            					{"dstbRqstId":""
	            						,"dstbTaskId":sParam.dstbTaskId
	            						,"dstbEnvrnmntCd":sParam.dstbEnvrnmntCd
	            						,"dstbSrvrId":data.dstbSrvrId
	            						,"dstbPrcsStsCd":"01"
	            						,"dstbReqDtl":arryDtl
	            					}
	            			);
            			}
            		});
            		
                    sParam.dstbReqSrvrDtl = dstbReqSrvrDtl; //대상서버
                    
//                  var linkData = {"header": fn_getHeader('CAPSV0060302'), "CaDstbReqInfoIO": sParam};
                    var linkData = {"header": fn_getHeader('CAPSV3020311'), "CaDstbReqInfoIO": sParam};
                    
                    var loading = $('#loading-dim');
                    loading.show();
                    
                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: false,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
//                                	 var tbList = responseData.CaDstbTaskInfoIO.dstbTaskDtl;
//                                	 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
//                                	 that.clickResetRequestArea();
//                                	 that.queryBaseArea();
                                	var sendList = {};
                                	sendList.dstbReqTgtAndDataList = responseData.CaOnlyDstbReqOut.dstbReqTgtAndDataList;
                                	 var linkData = {"header": fn_getHeader('CAPSV3020312'), "CaOnlyDstbSendIn": sendList};
                                     bxProxy.post(sUrl
                                         , JSON.stringify(linkData), {
                                             enableLoading: false,
                                             success: function (responseData) {
                                                 if (fn_commonChekResult(responseData)) {
//                                                     	 var tbList = responseData.CaDstbTaskInfoIO.dstbTaskDtl;
                                                 	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                                 	that.clickResetRequestArea();
                                                 	that.queryBaseArea();
                                                 }
                                                 loading.hide();
                                             },
                                             error: function (){
                                            	 loading.hide();
                                             }// end of suucess: fucntion
                                         }
                                     ); // end of bxProxy
                                } else {
                                	loading.hide();
                                }
                            },   // end of suucess: fucntion
                            error: function (){
                            	loading.hide();
                            }// end of suucess: fucntion
                        }
                    ); // end of bxProxy
                }
                , downloadResultAsJson: function (sqlList){
                	
                	var strSql = '';
                	$(sqlList).each(function(idx, sql){
                		strSql += sql;
                		strSql += '\n';
                	});
                	
                	var downloadAnchorNode = document.createElement('a');
                	downloadAnchorNode.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(strSql));
                	downloadAnchorNode.setAttribute("download", bxMsg('cbb_items.SCRNITM#dstbRqst') + ".sql");
                	document.body.appendChild(downloadAnchorNode); // required for firefox
                	downloadAnchorNode.click();
                	downloadAnchorNode.remove();
                }
                
                ,taskRequestInit :  function(){
              	  var that = this;
                  fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#dstbRqst'), bxMsg('cbb_items.SCRNITM#runCnfrm'), that.taskRequestInitCall, that);
                }
                ,taskRequestInitCall: function (that) {
                    ////배포요청
                    var sParam = {};

                    sParam.dstbRqstId = that.$el.find('.CAPSV302-request-table [data-form-param="dstbRqstId"]').val(); //배포요청식별자;
                    sParam.dstbTaskId = that.$el.find('.CAPSV302-request-table [data-form-param="dstbTaskId"]').val(); //과제ID;
                    sParam.dstbStsCd = '01'; //배포상태[요청]
                    
                    var linkData = {"header": fn_getHeader('CAPSV0060303'), "CaDstbReqMIO": sParam};

                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
//                                	 var tbList = responseData.CaDstbTaskInfoIO.dstbTaskDtl;
                                	 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                	 that.inquiryBaseData();
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                }
                
                ,taskRequestStop : function(){
                	  var that = this;
                    
	              	  var dstbWayCd = that.$el.find('.CAPSV302-request-table [data-form-param="dstbWayCd"]').val(); //대상서버
	                   	                    
	                    if(dstbWayCd !='R'){
	                    	fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0065'));  
                        	return;
	                    }
	                    fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#dstbStop'), bxMsg('cbb_items.SCRNITM#runCnfrm'), that.taskRequestStopCall, that);
                }
                ,taskRequestStopCall: function (that) {
                    ////배포요청
                    var sParam = {};

                    sParam.dstbRqstId = that.$el.find('.CAPSV302-request-table [data-form-param="dstbRqstId"]').val(); //배포요청식별자;
                    sParam.dstbTaskId = that.$el.find('.CAPSV302-request-table [data-form-param="dstbTaskId"]').val(); //과제ID;
                    sParam.dstbStsCd = '03'; //배포상태[중지]
                    
                    var linkData = {"header": fn_getHeader('CAPSV0060303'), "CaDstbReqMIO": sParam};

                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
//                                	 var tbList = responseData.CaDstbTaskInfoIO.dstbTaskDtl;
                                	 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                	 that.inquiryBaseData();
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                }
                
                ,taskRequestCancel : function(){
                	var that = this;
                	var dstbStsCd = that.$el.find('.CAPSV302-request-table [data-form-param="dstbStsCd"]').val(); //배포상태
	              	var dstbWayCd = that.$el.find('.CAPSV302-request-table [data-form-param="dstbWayCd"]').val(); //배포방식
	                   	                    
	                if (!(dstbStsCd =='01' || dstbStsCd =='03' || dstbStsCd =='99')){
	                	fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0066'));  
	                   	return;
	                }
	                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#dstbCncl'), bxMsg('cbb_items.SCRNITM#runCnfrm'), that.taskRequestCancelCall, that);
                }
                ,taskRequestCancelCall: function (that) {
                    ////배포요청
                    var sParam = {};

                    sParam.dstbRqstId = that.$el.find('.CAPSV302-request-table [data-form-param="dstbRqstId"]').val(); //배포요청식별자;
                    sParam.dstbTaskId = that.$el.find('.CAPSV302-request-table [data-form-param="dstbTaskId"]').val(); //과제ID;
                    sParam.dstbStsCd = '04'; //배포상태[취소]
                    
                    var linkData = {"header": fn_getHeader('CAPSV0060303'), "CaDstbReqMIO": sParam};

                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
//                                	 var tbList = responseData.CaDstbTaskInfoIO.dstbTaskDtl;
                                	 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                	 that.inquiryBaseData();
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                }
                ,taskResultProc:function(item){
                	if(item == undefined){return;}
                	var that = this;
//                    var reqAllData = this.CAPSV302ResultGrid.getAllData();
//            		
//            		//배포요청 가능한 요건정보가 없습니다.
//            		if(reqAllData.length < 1){
//            			fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0062'));  
////            			alertMessage.error(bxMsg("cbb_err_msg.AUICME0006") + "[" + bxMsg("cbb_items.AT#staffId") + "]");
//            			return;
//            		}
            		
                	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#btn_recallDistr'), bxMsg('cbb_items.SCRNITM#screenSave'), that.taskResultSave, [that,item]);
                }
                ,taskResultSave: function (param) {
                	var that = param[0];
                	var item = param[1];
                	if(item == undefined){return;}
                    ////배포요청
                    var sParam = {};
                    var reqData = that.CAPSV302Grid.grid.getSelectionModel().selected.items[0];
//                    var reqSrvrData = that.CAPSV302ResultServerGrid.grid.getSelectionModel().selected.items[0];
                    var reqSrvrData = item;
                    
                    
                    sParam.dstbRqstId = reqData.data.dstbRqstId; //배포식별자;
                    sParam.dstbTaskId = reqData.data.dstbTaskId; //과제ID;
                    sParam.dstbSrvrId = reqSrvrData.data.dstbSrvrId; //대상서버
                    sParam.dstbEnvrnmntCd = reqData.data.dstbEnvrnmntCd; //대상환경
                    sParam.dstbStsCd = "01";
                    sParam.dstbWayCd = reqData.data.dstbWayCd; //배포방법
                    var linkData = {"header": fn_getHeader('CAPSV0060303'), "CaDstbReqMIO": sParam};

                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
//                                	 var tbList = responseData.CaDstbTaskInfoIO.dstbTaskDtl;
                                	 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                	 that.queryBaseArea();
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                }
                
                ,taskResultRecall:function(item){
                	if(item == undefined){return;}
                	var that = this;
                    var reqAllData = this.CAPSV302ResultGrid.getAllData();
                                        
            		//배포요청 가능한 요건정보가 없습니다.
            		if(reqAllData.length < 1){
            			fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0062'));  
//            			alertMessage.error(bxMsg("cbb_err_msg.AUICME0006") + "[" + bxMsg("cbb_items.AT#staffId") + "]");
            			return;
            		}
            		
                	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#btn_recallDistr'), bxMsg('cbb_items.SCRNITM#screenSave'), that.taskResultRecall_callback, [that,item]);
                }
                ,taskResultRecall_callback: function (param) {
                	var that = param[0];
                	var item = param[1];
                	
                	if(item == undefined){return;}
                    ////배포요청
                    var sParam = {};
                    var reqData = that.CAPSV302Grid.grid.getSelectionModel().selected.items[0];
//                    var reqSrvrData = that.CAPSV302ResultServerGrid.grid.getSelectionModel().selected.items[0];
                    var reqSrvrData = item;
                    
                    sParam.dstbRqstId = reqData.data.dstbRqstId; //배포식별자;
                    sParam.dstbTaskId = reqData.data.dstbTaskId; //과제ID;
                    sParam.dstbSrvrId = reqSrvrData.data.dstbSrvrId; //대상서버
                    sParam.dstbEnvrnmntCd = reqData.data.dstbEnvrnmntCd; //대상환경
                    
//                    sParam.dstbStsCd = "01";
//                    sParam.dstbWayCd = reqData.data.dstbWayCd; //배포방법
                    var linkData = {"header": fn_getHeader('CAPSV0060307'), "CaDstbReqMIO": sParam};

                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
//                                	 var tbList = responseData.CaDstbTaskInfoIO.dstbTaskDtl;
                                	 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                	 that.queryBaseArea();
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                }
                
                
                ,clickResultDetailGrid : function(){
                	var that = this;
                	var selectedRecord = that.CAPSV302Grid.grid.getSelectionModel().selected.items[0];

                	if (!selectedRecord) {
                		return;
                	} else {
                		that.isMainGridClick = true;
                		var dstbStsCd = selectedRecord.data.dstbStsCd;
                		var dstbWayCd = selectedRecord.data.dstbWayCd;
                		this.$el.find('#CAPSV302-request-table [data-form-param="dstbRqstId"]').val(selectedRecord.data.dstbRqstId);
                		this.$el.find('#CAPSV302-request-table [data-form-param="dstbTaskId"]').val(selectedRecord.data.dstbTaskId);
                		this.$el.find('#CAPSV302-request-table [data-form-param="dstbEnvrnmntCd"]').val(selectedRecord.data.dstbEnvrnmntCd);
                		
                		this.$el.find('#CAPSV302-request-table [data-form-param="dstbStsCd"]').val(dstbStsCd);
                		var dstbSchdlTmstmp = selectedRecord.data.dstbSchdlTmstmp;
                		var dstbSchdlDt = "";
                		var dstbSchdlHms = "";
                		if(dstbSchdlTmstmp != '' && dstbSchdlTmstmp != null){
                			var toDateFormat = XDate(dstbSchdlTmstmp).toString('yyyyMMddHHmmss')
                			dstbSchdlDt = toDateFormat.substring(0,8);
                    		dstbSchdlHms = toDateFormat.substring(8,14);
                    		this.$el.find('#CAPSV302-request-table [data-form-param="dstbSchdlDt"]').val(fn_setDateValue(dstbSchdlDt));
                    		this.$el.find('#CAPSV302-request-table [data-form-param="dstbSchdlHms"]').val(fn_setTimeValue(dstbSchdlHms));
                    	}
                		this.$el.find('#CAPSV302-request-table [data-form-param="dstbWayCd"]').val(dstbWayCd);
                		
                		if(dstbWayCd == 'H'){
                			this.$el.find('#btn-CAPSV302-result-server-sql-download').show();
                		} else {
                			this.$el.find('#btn-CAPSV302-result-server-sql-download').hide();
                		}
                		
//                		that.changeDstbWayCd();
                		that.clickTapResult(event);
                		that.setChangeSaveMode();
                		that.CAPSV302ResultGrid.resetData();
                		
                		if(dstbStsCd == '04'){ //취소면 모든 항목 비활성화
                			that.changeDstbWayCd();
                			this.$el.find('.CAPSV302-request-table [data-form-param="dstbTaskId"]').prop("readonly", true);
                			this.$el.find('.CAPSV302-request-table [data-form-param="dstbEnvrnmntCd"]').prop("disabled", true);
                			this.$el.find('.CAPSV302-request-table [data-form-param="dstbWayCd"]').prop("disabled", true);
                			
                			this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlDt"]').prop("disabled", true);
                        	this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlHms"]').prop("disabled", true);
                        	this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlDt"]').prop("readonly", true);
                        	this.$el.find('.CAPSV302-request-table [data-form-param="dstbSchdlHms"]').prop("readonly", true);
                		} else {
                			this.$el.find('.CAPSV302-request-table [data-form-param="dstbTaskId"]').prop("readonly", false);
                			this.$el.find('.CAPSV302-request-table [data-form-param="dstbEnvrnmntCd"]').prop("disabled", false);
                			this.$el.find('.CAPSV302-request-table [data-form-param="dstbWayCd"]').prop("disabled", false);
                			
                			that.changeDstbWayCd();
                		}
                        
                		var sParam = {};
                		sParam.dstbRqstId = selectedRecord.data.dstbRqstId; //배포요청식별자
                		sParam.dstbEnvrnmntCd = selectedRecord.data.dstbEnvrnmntCd; //배포과제식별자
                        var linkData = {"header": fn_getHeader('CAPSV0060306'), "CaDstbReqMIO": sParam};

                        //ajax호출
                        bxProxy.post(sUrl
                            , JSON.stringify(linkData), {
                                enableLoading: true,
                                success: function (responseData) {
                                    if (fn_commonChekResult(responseData)) {
                                    	 var tbList = responseData.CaDstbReqInfoIO.dstbReqSrvrDtl;
                                    	 if (tbList != null && tbList.length > 0) {
                                         	var totCnt = tbList.length;
//                                         	that.$el.find("#searchDetailResultCount").html(bxMsg('cbb_items.SCRNITM#chngHst')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");

                                         	that.CAPSV302ResultServerGrid.setData(tbList);
//                                         	that.CAPSV302ResultServerGrid.grid.getSelectionModel().select(0);
//                                         	that.clickResultDetailServerGrid();
                                         } else {
                                             that.CAPSV302ResultServerGrid.resetData();
                                         }
                                    }
                                    that.changeDstbEnvrnmntCd();
                                }   // end of suucess: fucntion
                            }
                        ); // end of bxProxy
                	}
                }
                
                ,clickResultDetailServerGrid : function(){
                	var that = this;
                	var selectedRecord = that.CAPSV302ResultServerGrid.grid.getSelectionModel().selected.items[0];

                	if (!selectedRecord) {
                		return;
                	} else {
                		if(selectedRecord.data.dstbPrcsStsCd=='99'){ //배포 실패이면 재실행 요청가능
                			this.$el.find("#btn-CAPSV302-result-grid-run").show();
                			this.$el.find("#btn-CAPSV302-result-recall").hide();
                		} else {
                			this.$el.find("#btn-CAPSV302-result-grid-run").hide();
                			this.$el.find("#btn-CAPSV302-result-recall").hide();
                			var reqData = that.CAPSV302Grid.grid.getSelectionModel().selected.items[0];
                			if (reqData) {
                				var dstbWayCd = reqData.data.dstbWayCd; //배포방법
                        		if(selectedRecord.data.dstbPrcsStsCd=='01'){
                        			this.$el.find("#btn-CAPSV302-result-recall").show();
                        		}
                        	}
                		}
                	
                		var dstbSchdlTmstmp = selectedRecord.data.dstbSchdlTmstmp;
                		
                		var sParam = {};
                		sParam.dstbRqstId = selectedRecord.data.dstbRqstId; //배포요청식별자
                		sParam.dstbTaskId = selectedRecord.data.dstbTaskId; //배포과제식별자
                		sParam.dstbSrvrId = selectedRecord.data.dstbSrvrId; //배포서버식별자
                        var linkData = {"header": fn_getHeader('CAPSV0060306'), "CaDstbReqMIO": sParam};

                        //ajax호출
                        bxProxy.post(sUrl
                            , JSON.stringify(linkData), {
                                enableLoading: true,
                                success: function (responseData) {
                                    if (fn_commonChekResult(responseData)) {
                                    	var srvrList = responseData.CaDstbReqInfoIO.dstbReqSrvrDtl;
                                    	if(srvrList != null && srvrList.length > 0) {
                                    		var tbList = srvrList[0].dstbReqDtl;
                                       	 	if (tbList != null && tbList.length > 0) {
                                            	var totCnt = tbList.length;
//                                            	that.$el.find("#searchDetailResultCount").html(bxMsg('cbb_items.SCRNITM#chngHst')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");

                                            	that.CAPSV302ResultGrid.setData(tbList);
                                            } else {
                                                that.CAPSV302ResultGrid.resetData();
                                            }
                                    	}
                                    }
                                }   // end of suucess: fucntion
                            }
                        ); // end of bxProxy
                	}
                }
                
                ,resultServerSqlDownload : function(record){
                	var that = this;
                	var selectedReq = that.CAPSV302Grid.grid.getSelectionModel().selected.items;
                	if(selectedReq != undefined && selectedReq.length > 0){
                		var dstbWayCd = selectedReq[0].data.dstbWayCd; //배포방식
                		if(dstbWayCd !='H'){
                			fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0067'));  
                			return;
                		}
                		that.record = record;
                		fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#dstbFin'), bxMsg('cbb_items.SCRNITM#runCnfrm'), that.resultServerSqlDownloadCall, that);
                	}
                }
                ,resultServerSqlDownloadCall: function (that) {
                	// 과제정보조회
                	var selectedReq = that.CAPSV302Grid.grid.getSelectionModel().selected.items;
                	if(selectedReq != undefined && selectedReq.length > 0){
                		var sParam = {};
                		sParam.dstbTaskId = selectedReq[0].data.dstbTaskId; //과제ID
                		sParam.dstbEnvrnmntCd = selectedReq[0].data.dstbEnvrnmntCd; //대상환경
                		                		                		
                		var linkData = {"header": fn_getHeader('CAPSV0060107'), "CaDstbReqInfoIO": sParam};
                		
                		//ajax호출
                		bxProxy.post(sUrl, JSON.stringify(linkData), {
                			enableLoading: true,
                			success: function (responseData) {
                				if (fn_commonChekResult(responseData)) {
                					var dstbTaskDtlList = responseData.CaDstbTaskInfoIO.dstbTaskDtl;
                					if (dstbTaskDtlList != undefined) {
                						if(selectedReq != undefined && selectedReq.length > 0){
                	                		var sParam = {};
                	                		sParam.dstbRqstId = selectedReq[0].data.dstbRqstId; //배포요청식별자;
                	                        sParam.dstbTaskId = selectedReq[0].data.dstbTaskId; //과제ID;
                	                        sParam.dstbStsCd = selectedReq[0].data.dstbStsCd; //대상서버
                	                        sParam.dstbWayCd = selectedReq[0].data.dstbWayCd; //대상서버
                	                        sParam.dstbSchdlTmstmp = selectedReq[0].data.dstbSchdlTmstmp; //대상서버
                	                        sParam.sndFinYn = "N"; //대상서버
                	                        sParam.dstbRqstDscd="01";
                	                        sParam.dstbEnvrnmntCd=selectedReq[0].data.dstbEnvrnmntCd; //대상서버
                	                        
                	                        var dstbTaskDtl = responseData.CaDstbTaskInfoIO.dstbTaskDtl;
                	                        var srvrList = that.dstbSrvrMList;
                	                        var dstbReqSrvrDtl = [];
                	                		$(srvrList).each(function(idx, data) {
                	                			if(sParam.dstbEnvrnmntCd == data.dstbEnvrnmntCd){
                	                				var arryDtl = [];
                	    	                		$(dstbTaskDtl).each(function(dIdx, dData) {
                	    	                			arryDtl.push(
                	    	                					{"dstbRqstId":sParam.dstbRqstId
                	    	                						,"dstbTaskId":sParam.dstbTaskId
                	    	                						,"dstbTaskChngSeqNbr":dData.dstbTaskChngSeqNbr
                	    	                						,"dstbTaskChngHstSeqNbr":dData.dstbTaskChngHstSeqNbr
                	    	                						,"dstbSrvrId":data.dstbSrvrId
                	    	                						,"dstbSaveDscd":dData.dstbSaveDscd
                	    	                					}
                	    	                			);
                	    	                		});
                	    	                		
                	    	            			dstbReqSrvrDtl.push(
                	    	            					{"dstbRqstId":""
                	    	            						,"dstbTaskId":sParam.dstbTaskId
                	    	            						,"dstbEnvrnmntCd":sParam.dstbEnvrnmntCd
                	    	            						,"dstbSrvrId":data.dstbSrvrId
                	    	            						,"dstbPrcsStsCd":"01"
                	    	            						,"dstbReqDtl":arryDtl
                	    	            					}
                	    	            			);
                	                			}
                	                		});
                	                		
                	                        sParam.dstbReqSrvrDtl = dstbReqSrvrDtl; //대상서버
                	                        
                	                        var linkData = {"header": fn_getHeader('CAPSV3020314'), "CaDstbReqInfoIO": sParam};
                	                        
                	                        var loading = $('#loading-dim');
                	                        loading.show();
                	                        
                	                        //ajax호출
                	                        bxProxy.post(sUrl
                	                            , JSON.stringify(linkData), {
                	                                enableLoading: false,
                	                                success: function (responseData) {
                	                                    if (fn_commonChekResult(responseData)) {
                	                                    	var sendList = {};
                	                                    	sendList.dstbReqTgtAndDataList = responseData.CaOnlyDstbReqOut.dstbReqTgtAndDataList;
                	                                    	 var linkData = {"header": fn_getHeader('CAPSV3020312'), "CaOnlyDstbSendIn": sendList};
                	                                         bxProxy.post(sUrl
                	                                             , JSON.stringify(linkData), {
                	                                                 enableLoading: false,
                	                                                 success: function (responseData) {
                	                                                     if (fn_commonChekResult(responseData)) {
//                	                                                         	 var tbList = responseData.CaDstbTaskInfoIO.dstbTaskDtl;
                	                                                     	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                	                                                     	that.clickResetRequestArea();
                	                                                     	that.queryBaseArea();
                	                                                     	var sqlList = responseData.CaOnlyDstbSendOut.dstbRqstSqlList;
                	                                                     	if(sqlList != undefined && sqlList.length > 0){
                	                                                     		that.downloadResultAsJson(sqlList);
                	                                                     	} 
                	                                                     }
                	                                                     loading.hide();
                	                                                 },
                	                                                 error: function (){
                	                                                	 loading.hide();
                	                                                 }// end of suucess: fucntion
                	                                             }
                	                                         ); // end of bxProxy
                	                                    }
                	                                    loading.hide();
                	                                },   // end of suucess: fucntion
                	                                error: function (){
                	                                	loading.hide();
                	                                }// end of suucess: fucntion
                	                            }
                	                        ); // end of bxProxy
                	                	}
                					}
                				}
                			}   // end of suucess: fucntion
                		}); // end of bxProxy
                	}                   
                }
                                
                ,taskResultFinish : function(record){
                	var that = this;
                	var selectedReq = that.CAPSV302Grid.grid.getSelectionModel().selected.items;
                	if(selectedReq != undefined && selectedReq.length > 0){
                		var dstbStsCd = selectedReq[0].data.dstbStsCd; //배포상태
                		var dstbWayCd = selectedReq[0].data.dstbWayCd; //배포방식
                		
                		if (!dstbStsCd =='01'){
                			fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0066'));  
                			return;
                		}
                		if(dstbWayCd !='H'){
                			fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0067'));  
                			return;
                		}
                		that.record = record;
                		fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#dstbFin'), bxMsg('cbb_items.SCRNITM#runCnfrm'), that.taskResultFinishCall, that);
                	}
                }
                ,taskResultFinishCall: function (that) {
                	var selectedReq = that.CAPSV302Grid.grid.getSelectionModel().selected.items;
                	if(selectedReq != undefined && selectedReq.length > 0){
                		////배포요청
                		var sParam = {};
                		sParam.dstbRqstId = selectedReq[0].data.dstbRqstId; //배포요청식별자;
                		sParam.dstbTaskId = selectedReq[0].data.dstbTaskId; //과제ID;
                		sParam.dstbStsCd = '05'; //배포상태[완료]
                		sParam.dstbEnvrnmntCd = selectedReq[0].data.dstbEnvrnmntCd; //배포환경코드;
                		sParam.sndFinYn = 'Y';
                		sParam.dstbRsltErrCd = that.record.data.dstbRsltErrCd;
                		sParam.dstbSrvrId = that.record.data.dstbSrvrId;
                		sParam.dstbRqstDscd = selectedReq[0].data.dstbRqstDscd;
                		
                		var srvrDtl = {};
                		srvrDtl.dstbRqstId = that.record.data.dstbRqstId;
                		srvrDtl.dstbTaskId = that.record.data.dstbTaskId;
                		srvrDtl.dstbSrvrId = that.record.data.dstbSrvrId;
                		srvrDtl.dstbPrcsStsCd = '02';
                		srvrDtl.dstbPrcsTmstmp = that.record.data.dstbPrcsTmstmp;
                		
                		var srvrDtlList = [];
                		srvrDtlList.push(srvrDtl);
                		
                		sParam.dstbReqSrvrDtl = srvrDtlList;
                		
                		
                		var linkData = {"header": fn_getHeader('CAPSV0060305'), "CaDstbReqInfoIO": sParam};
                		
                		//ajax호출
                		bxProxy.post(sUrl
                				, JSON.stringify(linkData), {
                			enableLoading: true,
                			success: function (responseData) {
                				if (fn_commonChekResult(responseData)) {
                					fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                					that.inquiryBaseData();
                				}
                			}   // end of suucess: fucntion
                		}); // end of bxProxy    
                	}
                }
                
                
                ,setDatePicker: function () {
                    fn_makeDatePicker(this.$el.find('#CAPSV302-base-table [data-form-param="srchStartDtm"]'));
                    fn_makeDatePicker(this.$el.find('#CAPSV302-base-table [data-form-param="srchEndDtm"]'));
//                    fn_makeDatePicker(this.$el.find('#CAPSV302-request-table [data-form-param="dstbExecuteDt"]'));
                    fn_makeDatePicker(this.$el.find('#CAPSV302-request-table [data-form-param="dstbSchdlDt"]'));
                    
//                    this.$el.find('#CAPSV302-request-table [data-form-param="dstbExecuteDt"]').val("");
                    this.$el.find('#CAPSV302-request-table [data-form-param="dstbSchdlDt"]').val("");
                }
                ,setTimeInput: function () {
                	//fn_setTimeValue(data.txAblEndHms)
//                    this.$el.find('#CAPSV302-request-table [data-form-param="dstbExecuteHms"]').mask("99:99:99", {placeholder:"--:--:--"});
                    this.$el.find('#CAPSV302-request-table [data-form-param="dstbSchdlHms"]').mask("99:99:99", {placeholder:"--:--:--"});
                }
                
                , setChangeExcuteMode : function(){
//                	this.$el.find('#btn-CAPSV302-request-grid-save').hide(); //배포요청 저장버튼
                	this.$el.find('#btn-CAPSV302-request-grid-run').show(); //배포요청 실행버튼
//                	this.$el.find('.CAPSV302-request-dstbWayCd-change').hide(); //예약 일시 + 예약 시간
                	this.$el.find('.CAPSV302-request-grid-area').show();
                	this.changeDstbWayCd();
                	this.setChangeStatus();
                }
                , setChangeSaveMode : function(){
//                	this.$el.find('#btn-CAPSV302-request-grid-save').show(); //배포요청 저장버튼
                	this.$el.find('#btn-CAPSV302-request-grid-run').hide(); //배포요청 실행버튼
                	this.$el.find('.CAPSV302-request-grid-area').hide();
                	this.changeDstbWayCd();
                	this.setChangeStatus();
                }
                , setChangeStatus : function(){
                	var that = this;
                	that.$el.find('.CAPSV302-request-table [data-form-param="dstbRqstId"]').val('');
                	
                	if(that.CAPSV302Grid.grid == undefined){
                		that.$el.find("#btn-CAPSV302-request-stop").hide();
                		that.$el.find("#btn-CAPSV302-request-cancel").hide();
                		that.$el.find("#btn-CAPSV302-request-init").hide();
                		return;
                	}
            		that.$el.find("#btn-CAPSV302-request-init").hide();
                	var selectedRecord = that.CAPSV302Grid.grid.getSelectionModel().selected.items[0];

                	if (!selectedRecord) {
                		that.$el.find("#btn-CAPSV302-request-stop").hide();
                		that.$el.find("#btn-CAPSV302-request-cancel").hide();
                		that.$el.find("#btn-CAPSV302-request-init").hide();
                	} else {
                		var dstbStsCd = selectedRecord.data.dstbStsCd;
                		var dstbWayCd = selectedRecord.data.dstbWayCd;
                		var grid_dstbEnvrnmntCd = selectedRecord.data.dstbEnvrnmntCd;
                		var dstbEnvrnmntCd = this.$el.find('.CAPSV302-request-table [data-form-param="dstbEnvrnmntCd"]').val(); //대상환경
                		
                		if(grid_dstbEnvrnmntCd != dstbEnvrnmntCd){
                			that.$el.find("#btn-CAPSV302-request-stop").hide();
                    		that.$el.find("#btn-CAPSV302-request-cancel").hide();
                    		return;
                		} else {
                			that.$el.find('.CAPSV302-request-table [data-form-param="dstbRqstId"]').val(selectedRecord.data.dstbRqstId);
                		}
                		
                		if(dstbStsCd == '01' && dstbWayCd == 'R'){  // '배포요청'상태 && '예약배포'인경우 '배포중지' 가능
                			that.$el.find("#btn-CAPSV302-request-stop").show();
                		} else {
                			that.$el.find("#btn-CAPSV302-request-stop").hide();
                		}
                		if(dstbStsCd == '01' || dstbStsCd == '03' || dstbStsCd == '99'){  // '배포요청' || '배포중지' || '배포실패'상태인 경우 '배포취소' 가능
                			that.$el.find("#btn-CAPSV302-request-cancel").show();
                		} else {
                			that.$el.find("#btn-CAPSV302-request-cancel").hide();
                		}
                		if(dstbStsCd == '03'){ // '배포중지' 상태인 경우 '배포요청' 가능
            				that.$el.find("#btn-CAPSV302-request-init").show();
            			}
                	}
                }
            })
            ; // end of Backbone.View.extend({


        return CAPSV302View;
    } // end of define function
)
; // end of define
