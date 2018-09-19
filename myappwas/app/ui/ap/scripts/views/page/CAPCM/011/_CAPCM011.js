define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPCM/011/_CAPCM011.html'
        , 'bx-component/ext-grid/_ext-grid'
    ]
    , function (config
        , tpl
        , ExtGrid
        ) {


        /**
         * Backbone
         */
        var CAPCM011View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPCM011-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                    'click #btn-base-reset': 'resetBaseArea'
                    , 'click #btn-base-search': 'queryBaseArea'
                	, 'click #btn-base-search-modal': 'baseSearchModal'


        			, 'click #btn-CAPCM011-grid-delete': 'clickDeleteGrid'
    				, 'click #btn-CAPCM011-grid-excel': 'gridExcel'
					, 'click #btn-up-grid': 'gridAreaModal'


    				, 'click #btn-detail-refresh': 'resetDetailArea'
					, 'click #btn-detail-save': 'clickSaveDetail'
					, 'click #btn-detail-modal': 'detailModal'


					, 'click #btn-CAPCM011-stdAbrvtn': 'fn_createStdAbrvtn'
				    , 'keydown #searchKey' : 'fn_enter'
				    , 'keyup #stdEngAbrvtnNmKey': 'pressInputLengthChk'
                }


                /**
                 * initialize
                 */
                , initialize: function (initData) {
                    var that = this;
                    that.that = this;


                    var deleteList = [];


                    $.extend(that, initData);
                    that.$el.html(that.tpl());

                    
                    // 2018.05.29  keewoong.hong  Subtask #10531 [CAS-Multilingual] (BPI 지원) 다국어 언어 추가 요청 (따갈로그어, 세부아노어)
                    // 관리 하고자 하는 언어 1, 2, 3 선택                      
                	var sParam = {};
                	sParam.instCd  = $.sessionStorage('headerInstCd');
                	sParam.cdNbr   = "10005";

            		var linkData = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};

            		var lngCdNm2 = "";
            		var lngCdNm3 = "";

                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: false
                        , success: function (responseData) {

                        	if(responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm.length > 0) {
                        		$(responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm).each(function(idx, data) {
                            		if(data.cd != "en"  &&  lngCdNm2 == "") {
                            			lngCdNm2 = data.cdNm;
                            		} else if(data.cd != "en"  &&  lngCdNm3 == "") {
                            			lngCdNm3 = data.cdNm;
                            		}
                        		});

                            	
                        		// 하단 상세 항목 타이틀 변경
                        		that.$el.find("#CAPCM011-detail-table #label_trnsfrRsltVal2").text(lngCdNm2);
                        		that.$el.find("#CAPCM011-detail-table #label_trnsfrRsltVal3").text(lngCdNm3);
                        		
                        		that.$el.find("#CAPCM011-detail-table #label_trnsfrRsltVal2").prop("title", lngCdNm2);
                        		that.$el.find("#CAPCM011-detail-table #label_trnsfrRsltVal3").prop("title", lngCdNm3);
                        		
                        		// 하단 상세 항목필드 placeholer 변경
                        		that.$el.find('#CAPCM011-detail-table [data-form-param="trnsfrRsltVal2"]').prop("placeholder", lngCdNm2);
                        		that.$el.find('#CAPCM011-detail-table [data-form-param="trnsfrRsltVal3"]').prop("placeholder", lngCdNm3);
                        		
                        		// 중단 그리드 Title명 변경
                        		that.CAPCM011Grid.columns[4].text = lngCdNm2;
                        		that.CAPCM011Grid.columns[5].text = lngCdNm3;
                        		
                        	}
                        }   // end of suucess: fucntion
                    }); // end of bxProxy

                    

                    /* ------------------------------------------------------------ */
                    that.CAPCM011Grid = new ExtGrid({
                        /* ------------------------------------------------------------ */
                        // 단일탭 그리드 컬럼 정의
                        fields: ['rowIndex', 'engWrdNm', 'stdEngAbrvtnNm', 'useLngWrdNm', 'useLngWrdNm2', 'useLngWrdNm3', 'cmpxAbrvtnYn']
                        , id: 'CAPCM011Grid'
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
                            , {text: bxMsg('cbb_items.SCRNITM#engWrdNm'),width: 160,flex: 1, dataIndex: 'engWrdNm',editor: 'textfield', style: 'text-align:center', align: 'left'}
                            , {text: bxMsg('cbb_items.SCRNITM#stdEngAbrvtnNm'),width: 160,flex: 1,dataIndex: 'stdEngAbrvtnNm',editor: 'textfield', style: 'text-align:center', align: 'left'}
                            , {text: bxMsg('cbb_items.SCRNITM#loginLngWrd'),width: 160,flex: 1,dataIndex: 'useLngWrdNm',editor: 'textfield', style: 'text-align:center', align: 'left'}
                            , {text: bxMsg('cbb_items.SCRNITM#lngCd')+'2',width: 160,flex: 1,dataIndex: 'useLngWrdNm2',editor: 'textfield', style: 'text-align:center', align: 'left'}
                            , {text: bxMsg('cbb_items.SCRNITM#lngCd')+'3',width: 160,flex: 1,dataIndex: 'useLngWrdNm3',editor: 'textfield', style: 'text-align:center', align: 'left'}
                            ,{
                                text: bxMsg('cbb_items.AT#cmpxAbrvtnYn'),
                                flex: 1,
                                dataIndex: 'cmpxAbrvtnYn',
                                style: 'text-align:center',
                                align: 'center',
                                 renderer: function (val) {
                                	var classNm = "s-no";
                                	if(val =="Y") {
                            			classNm = "s-yes";
                            		}
                            		return "<span class=\"bw-sign "+classNm+"\">"+val+"</span>";


                                } // end of render
                            }
                            , {
                             	xtype: 'actioncolumn', width: 80, align: 'center',text: "",
                             	items: [
												{
												//  icon: 'images/icon/x-delete-16.png'
												  iconCls : "bw-icon i-25 i-func-trash"
												  , tooltip: bxMsg('tm-layout.delete-field')
												  , handler: function (grid, rowIndex, colIndex, item, e, record) {
													  that.deleteList.push(record.data);
													  grid.store.remove(record);
												  }
												}
                             	        ]
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
                }


                /**
                 * render
                 */
                , render: function () {
                	//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPCM011-wrap #btn-CAPCM011-grid-delete')
                                        		,this.$el.find('.CAPCM011-wrap #btn-detail-save')
                                        		
                                        			   ]);

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


                /**
                 * 입력 length 체크
                 */
                ,pressInputLengthChk: function (event) {
	                var that = this;
                    var targetValue = event.target.value;
                    if(targetValue.length >= 10){
                    	fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0057'));
                    	that.$el.find('.CAPCM011-detail-table [data-form-param="stdEngAbrvtnNm"]').val(targetValue.substring(0,5));
                    	return;
                    }




                }


                /**
                 * 기본부 초기화
                 */
                , resetBaseArea: function () {
                    var that = this;


                    that.$el.find('.CAPCM011-base-table [data-form-param="engWrdNm"]').val("");
                    that.$el.find('.CAPCM011-base-table [data-form-param="stdEngAbrvtnNm"]').val("");
                    that.$el.find('.CAPCM011-base-table [data-form-param="useLngWrdNm"]').val("");


                    that.CAPCM011Grid.resetData();
                }


                //상세부 초기화
                , resetDetailArea : function() {
                	var that = this;


                	that.$el.find('.CAPCM011-detail-table [data-form-param="engWrdNm"]').val("");
                	that.$el.find('.CAPCM011-detail-table [data-form-param="stdEngAbrvtnNm"]').val("");
                	that.$el.find('.CAPCM011-detail-table [data-form-param="trnsfrRsltVal2"]').val("");
                	that.$el.find('.CAPCM011-detail-table [data-form-param="trnsfrRsltVal3"]').val("");


                	that.$el.find('.CAPCM011-detail-table [data-form-param="engWrdNm"]').prop("readonly", false);
                	that.$el.find('.CAPCM011-detail-table [data-form-param="stdEngAbrvtnNm"]').prop("readonly", false);
                	that.$el.find('.CAPCM011-detail-table #btn-CAPCM011-stdAbrvtn').show();


                }
                /**
                 * 기본부 조회 버튼 클릭
                 */
                , queryBaseArea: function () {
                    var that = this;
                    that.inquiryBaseData(sParam);
                }


                /**
                 * 기본부 정보로 그리드 조회
                 */
                , inquiryBaseData: function (param) {
                    // header 정보 set
                    var that = this;
                    var sParam = {};


                    sParam.engWrdNm = that.$el.find('.CAPCM011-base-table [data-form-param="engWrdNm"]').val().toLowerCase();
                    sParam.stdEngAbrvtnNm = that.$el.find('.CAPCM011-base-table [data-form-param="stdEngAbrvtnNm"]').val().toLowerCase();
                    sParam.useLngWrdNm = that.$el.find('.CAPCM011-base-table [data-form-param="useLngWrdNm"]').val();


                    if (fn_isEmpty(sParam.engWrdNm) && fn_isEmpty(sParam.stdEngAbrvtnNm) && fn_isEmpty(sParam.useLngWrdNm)) {
                    	fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0014'));
                        return;
                    }


                    var linkData = {"header": fn_getHeader("CAPCM0118401"), "CaStdAbrvtnMgmtSvcGetStdAbrvtnListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                var tbList = responseData.CaStdAbrvtnMgmtSvcGetStdAbrvtnListOut.abrvtnList;
                                var totCnt = responseData.CaStdAbrvtnMgmtSvcGetStdAbrvtnListOut.totCnt;


                                if (tbList != null || tbList.length > 0) {
                                    that.CAPCM011Grid.setData(tbList);
                                    that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                    // 삭제 로우 초기화
                                    that.deleteList = [];
                                    that.resetDetailArea();
                                }
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                } // end


                // 그리드 저장(삭제)버튼 클릭
                , clickDeleteGrid : function(event) {
                	if(this.deleteList.length < 1) {
                		return;
                	}
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
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


                		var linkData = {"header": fn_getHeader("CAPCM0118301"), "CaStdAbrvtnMgmtSvcRemoveStdAbrvtnListIn": sParam};


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
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                	fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveDetail, this);
                }


                // 상세 저장
                , saveDetail : function(that) {


                	 var sParam = {};
                	 var srvcCd = "";


                	 if(that.$el.find('.CAPCM011-detail-table [data-form-param="engWrdNm"]').prop("readonly")) {
                    	 // 수정
                		 srvcCd = "CAPCM0118201";
                     }
                     else {
                    	 // 등록
                    	 srvcCd = "CAPCM0118101";
                     }


                	 sParam.engWrdNm = that.$el.find('.CAPCM011-detail-table [data-form-param="engWrdNm"]').val();       //영문단어명
                     sParam.stdEngAbrvtnNm = that.$el.find('.CAPCM011-detail-table [data-form-param="stdEngAbrvtnNm"]').val();       //표준영문약어명
                     sParam.vrtnEngAbrvtnNm = that.$el.find('.CAPCM011-detail-table [data-form-param="vrtnEngAbrvtnNm"]').val();       //변형영문약어명
                     sParam.useLngWrdNm2 = that.$el.find('.CAPCM011-detail-table [data-form-param="trnsfrRsltVal2"]').val(); // 한글명
                     sParam.useLngWrdNm3 = that.$el.find('.CAPCM011-detail-table [data-form-param="trnsfrRsltVal3"]').val(); // 중문명


                     if(sParam.stdEngAbrvtnNm.length >= 6 ){
                    	 fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0057'));
                     }


                     var linkData = {"header": fn_getHeader(srvcCd), "CaStdAbrvtnMgmtSvcRegisterStdAbrvtnIn": sParam};


                     //ajax 호출
                     bxProxy.post(sUrl, JSON.stringify(linkData), {
                    	 enableLoading: true,
                         success: function (responseData) {
                             if (fn_commonChekResult(responseData)) {
                            	 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                            	 var engWrdNm = that.$el.find('.CAPCM011-base-table [data-form-param="engWrdNm"]').val();
                                 var stdEngAbrvtnNm = that.$el.find('.CAPCM011-base-table [data-form-param="stdEngAbrvtnNm"]').val();
                                 var useLngWrdNm = that.$el.find('.CAPCM011-base-table [data-form-param="useLngWrdNm"]').val();


                                 if (fn_isEmpty(engWrdNm) && fn_isEmpty(stdEngAbrvtnNm) && fn_isEmpty(useLngWrdNm)) {
                                     return;
                                 }
                                 else {
                                	 // 재조회
                                	 that.queryBaseArea();
                                 }


                             }
                         }
                     });
                }


                //약어명 생성 Btn click
                , fn_createStdAbrvtn: function () {
                    var that = this;
                    var sParam = {};


                    // 영문단어명 뺴고 초기화
                    that.$el.find('.CAPCM011-detail-table [data-form-param="stdEngAbrvtnNm"]').val("");
                	that.$el.find('.CAPCM011-detail-table [data-form-param="trnsfrRsltVal2"]').val("");
                	that.$el.find('.CAPCM011-detail-table [data-form-param="trnsfrRsltVal3"]').val("");


                	that.$el.find('.CAPCM011-detail-table [data-form-param="engWrdNm"]').prop("readonly", false);
                	that.$el.find('.CAPCM011-detail-table [data-form-param="stdEngAbrvtnNm"]').prop("readonly", false);
                	that.$el.find('.CAPCM011-detail-table #btn-CAPCM011-stdAbrvtn').show();


                    //서비스 개별부 set
                    sParam.engWrdNm = that.$el.find('.CAPCM011-detail-table [data-form-param="engWrdNm"]').val();


                    var linkData = {"header": fn_getHeader("CAPCM0118402"), "StdAbrvtnMgmtSvcCofirmStdAbrvtnIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                    	enableLoading: true,
                        success: function (responseData) {


                            if (fn_commonChekResult(responseData)) {
                                var cofirmStdAbrvtnOut = responseData.CaStdAbrvtnMgmtSvcCofirmStdAbrvtnOut;


                                if (!fn_isNull(cofirmStdAbrvtnOut) && !fn_isNull(cofirmStdAbrvtnOut.stdEngAbrvtnNm)) {
                                	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                    that.$el.find('.CAPCM011-detail-table [data-form-param="stdEngAbrvtnNm"]').val(cofirmStdAbrvtnOut.stdEngAbrvtnNm);
                                }
                            }
                        }   // end of suucess: fucntion
                    });     // end of bxProxy
                }


                /**
                 * 그리드 생성
                 */
                , createGrid: function () {
                    var that = this;


                    this.$el.find(".CAPCM011-grid").html(this.CAPCM011Grid.render({'height': CaGridHeight}));
                } // end of createGrid


                /**
                 * 그리드 행 더블클릭
                 */
                , doubleiClickGrid: function () {


                    var that = this;
                    var selectedRecord = that.CAPCM011Grid.grid.getSelectionModel().selected.items[0];


                    if (!selectedRecord) {
                        return;
                    } else {
                    	that.$el.find('.CAPCM011-detail-table [data-form-param="engWrdNm"]').val(selectedRecord.data.engWrdNm);
                    	that.$el.find('.CAPCM011-detail-table [data-form-param="stdEngAbrvtnNm"]').val(selectedRecord.data.stdEngAbrvtnNm);
                    	that.$el.find('.CAPCM011-detail-table [data-form-param="trnsfrRsltVal2"]').val(selectedRecord.data.useLngWrdNm2);
                    	that.$el.find('.CAPCM011-detail-table [data-form-param="trnsfrRsltVal3"]').val(selectedRecord.data.useLngWrdNm3);


                    	that.$el.find('.CAPCM011-detail-table [data-form-param="engWrdNm"]').prop("readonly", true);
                    	that.$el.find('.CAPCM011-detail-table [data-form-param="stdEngAbrvtnNm"]').prop("readonly", true);
                    	that.$el.find('.CAPCM011-detail-table #btn-CAPCM011-stdAbrvtn').hide();
                    }
                }


                // 조회조건영역 toggle
                , baseSearchModal : function() {
                	var that = this;
                	fn_pageLayerCtrl("#search-area", this.$el.find("#btn-base-search-modal"));
                }


                // 그리드영역 toggle
                , gridAreaModal : function() {
                	var that = this;
                	fn_pageLayerCtrl("#CAPCM011-grid", this.$el.find("#btn-up-grid"));
                }


                // 상세영역 toggle
                , detailModal : function() {
                	var that = this;
                	fn_pageLayerCtrl(".CAPCM011-detail-table", this.$el.find("#btn-detail-modal"));
                }


                // 그리드 내용 엑셀 다운로드
                , gridExcel : function() {
                	var that = this;
                	that.CAPCM011Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM011')+"_"+getCurrentDate("yyyy-mm-dd"));
                }
            })
            ; // end of Backbone.View.extend({


        return CAPCM011View;
    } // end of define function
)
; // end of define
