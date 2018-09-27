/*
 * Screen number  CAPCM110
 * brief          코드
 * discription  표준코드, 확장코드, 외부코드, 서브셋코드를 관리 합니다.
 * STDA 기관이 아니라 다른 기관으로 로그인 했을시 서브셋코드가 아니라 기관별서브셋코드로 처리 한다.
 * author         이영주
 * history        2016.05.16      생성
 */
define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPCM/110/_CAPCM110.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
        , 'app/views/page/popup/CAPCM/popup-class-search'
        , 'app/views/page/popup/CAPCM/popup-high-level-code-search'
        , 'app/views/page/popup/CAPSV/popup-change-history-search'
    ]
    , function (config
        , tpl
        , ExtGrid
        , commonInfo
        , PopupClassSearch
        , PopupHighLevelCodeSearch
        , PopupChangeHistorySearch
        ) {


        /**
         * Backbone
         */
        var CAPCM110View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPCM110-page'
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
            		, 'change .CAPCM110-base-cdNbrTpCd-wrap': 'changeBaseCdNbrTpCd'


           			// 검색 결과 이벤트
        			, 'click #btn-CAPCM110-grid-delete': 'clickDeleteGrid'
    				, 'click #btn-CAPCM110-grid-excel': 'gridExcel'
					, 'click #btn-up-grid': 'gridAreaModal'


					// 기본 속성 이벤트
					, 'click #btn-detail-modal': 'detailAreaModal'
    				, 'click #btn-detail-refresh': 'resetDetailArea'
					, 'click #btn-detail-save': 'clickSaveCode'
					, 'change .CAPCM110-detail-cdNbrTpCd-wrap': 'changeDetailCdNbrTpCd'
					, 'click #btn-mltLng': 'openPageByCodeBase'
					, 'click #btn-upCdNbr-search': 'openUpcdNbrPopup'
					, 'click #btn-class-search': 'openClassSearchPopup'


					// 상세 코드 이벤트
					, 'click #btn-detail-up-grid': 'detailCodeListAreaModal'
					, 'click #btn-CAPCM110-detail-grid-delete': 'clickDeleteCodeDetail'
					, 'click #btn-CAPCM110-detail-grid-excel': 'detailGridExcel'
					, 'click #btn-grid-add-data': 'detailAddGridData'
					, 'click #btn-grid-del-data': 'detailDelGridData'

					, 'click #btn-CAPCM110-code-detail-chnghst': 'openChangeHistoryPopup'

					// 상세 코드 속성 이벤트
					, 'click #btn-code-detail-refresh': 'resetCodeDetailArea'
					, 'click #btn-code-detail-save': 'clickSaveCodeDetail'
					, 'click #btn-code-detail-mltLng': 'openPageByCodeDetail'
					, 'click #btn-code-detail-modal': 'detailCodeTableAreaModal'
					, 'keydown #searchKey' : 'fn_enter'
                }


//
//
//
                , initialize: function (initData) {


                    var that = this;
                    that.that = this;


                    var deleteList = []; // 코드삭제목록
                    var deleteDetailList= []; // 코드상세삭제목록


                    $.extend(that, initData);
                    that.$el.html(that.tpl());


                    that.initData = initData;


                    // 서브셋그리드영역을 숨긴다.
                    that.$el.find('#CAPCM110-standard-subset-code-grid-area').hide();
                    that.createBaseGrid();
                    that.createDetailGrid();
                    
                    
//                    fn_btnCheckForDistribution([that.$el.find('#btn-CAPCM110-grid-delete'), that.$el.find('#CAPCM110-code-detail-table-area #btn-code-detail-save')]);
                }



                
//
//
//
                , createBaseGrid : function() {
                	var that = this;


                    that.comboStore1 = {}; // 코드종류


                    var sParam = {};
                    sParam.cdNbr = "A0536";
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
                                that.CAPCM110Grid = new ExtGrid({
                                    /* ------------------------------------------------------------ */
                                    // 단일탭 그리드 컬럼 정의
                                    fields: ['rowIndex', 'cdNbrTpCd', 'cdNbr', 'cdNbrNm', 'upCdNbr', 'upCdNbrNm', 'cdDescCntnt', 'instCd', 'xtnCdTblNm', 'xtnCdClassNm', 'cmpntCd']
                                    , id: 'CAPCM110Grid'
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
                                        , {
                                            text: bxMsg('cbb_items.SCRNITM#cdNbrTpCd'),width: 120, dataIndex: 'cdNbrTpCd', style: 'text-align:center', align: 'center'
                                            	, flex: 1
                                            	, editor: {
	                                                xtype: 'combobox'
	                                                , store: that.comboStore1
	                                                , displayField: 'cdNm'
	                                                , valueField: 'cd'
	                                            }
                                            , renderer: function (val) {
                                                var index = that.comboStore1.findExact('cd', val);


                                                if (index != -1) {
                                                    var rs = that.comboStore1.getAt(index).data;


                                                    return rs.cdNm;
                                                }
                                            }
                                        }
                                        , {text: bxMsg('cbb_items.SCRNITM#cdNbr'),width: 160, flex: 1,dataIndex: 'cdNbr', style: 'text-align:center', align: 'center'}
                                        , {text: bxMsg('cbb_items.SCRNITM#cdNbrNm'),width: 160, flex: 1,dataIndex: 'cdNbrNm', style: 'text-align:center', align: 'left'}
                                        , {text: bxMsg('cbb_items.SCRNITM#upCdNbr'),width: 160, flex: 1,dataIndex: 'upCdNbr', style: 'text-align:center', align: 'center'}
                                        , {text: bxMsg('cbb_items.AT#cdDescCntnt'),width: 160,flex: 3,dataIndex: 'cdDescCntnt', style: 'text-align:center', align: 'left'}
                                        , {text: bxMsg('cbb_items.AT#instCd') ,dataIndex: 'instCd', hidden : true}
                                        , {text: bxMsg('cbb_items.AT#xtnCdTblNm') ,dataIndex: 'xtnCdTblNm', hidden : true}
                                        , {text: bxMsg('cbb_items.AT#xtnCdClassNm') ,dataIndex: 'xtnCdClassNm', hidden : true}
                                        , {text: bxMsg('cbb_items.SCRNITM#cmpnt') ,dataIndex: 'cmpntCd', hidden : true}
                                        , {text: bxMsg('cbb_items.AT#upCdNbrNm') ,dataIndex: 'upCdNbrNm', hidden : true}
                                        , {
                                         	xtype: 'actioncolumn', width: 80, align: 'center', style: 'text-align:center', text: bxMsg('cbb_items.SCRNITM#del')
                                         	, items: [
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
                                            , fn: function (event) {
                                                //더블클릭시 이벤트 발생
                                                that.clickGrid();
                                            }
                                        }
                                    }
                                });
                                // 단일탭 그리드 렌더
                                that.$el.find(".CAPCM110-grid").html(that.CAPCM110Grid.render({'height': CaGridHeight}));
                            } // end of success:.function
                    }); // end of bxProxy.all
                }


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  상세코드 그리드 생성                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                , createDetailGrid : function() {
                	var that = this;
                	that.deleteDetailList =[];

                	var sParam = {};
                	sParam.cdNbr = "11914";
                	var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                	that.comboStore2 = {}; // 코드번호


                    bxProxy.all([
								{
								    // 코드종류
								    url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {


								    	if (fn_commonChekResult(responseData)) {
								    		that.comboStore2 = new Ext.data.Store({
								                fields: ['cd', 'cdNm']
								                , data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
								            });
								        }
								    }
								}
                             ]
	                    , {
	                        success: function () {
	                        	that.createStandardCodeGrid(that); // 일반 그리드
                                that.createStandardSubsetCodeGrid(that); // 서브셋 그리드
	                        }
                    });


                }


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  일반 그리드 생성                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                , createStandardCodeGrid : function(that) {


                    that.CAPCM110SandardGrid = new ExtGrid({
                        fields: ['rowIndex', 'cd', 'cdNm', 'inqrySeq']
                        , id: 'CAPCM110SandardGrid'
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
	                        , {text: bxMsg('cbb_items.SCRNITM#cd'), flex: 1, dataIndex: 'cd', style: 'text-align:center', align: 'center'}
	                        , {text: bxMsg('cbb_items.AT#cdNm'), flex: 1, dataIndex: 'cdNm', style: 'text-align:center', align: 'center'}
	                        , {text: bxMsg('cbb_items.AT#inqrySeq'), flex: 1, dataIndex: 'inqrySeq', style: 'text-align:center', align: 'center'}
	                        , {
                             	xtype: 'actioncolumn', width: 80, align: 'center', style: 'text-align:center', text: bxMsg('cbb_items.SCRNITM#del')
                             	, items: [
												{
												//  icon: 'images/icon/x-delete-16.png'
												  iconCls : "bw-icon i-25 i-func-trash"
												  , tooltip: bxMsg('tm-layout.delete-field')
												  , handler: function (grid, rowIndex, colIndex, item, e, record) {
													  that.deleteDetailList.push(record.data);
													  grid.store.remove(record);
												  }
												}
                             	        ]
                             }
                        ]
	                    , listeners: {
	                        click: {
	                            element: 'body'
	                            , fn: function (event) {
	                                //더블클릭시 이벤트 발생
	                                that.clickStandardCodeGrid();
	                            }
	                        }
	                    }


                    });


                    that.$el.find("#CAPCM110-standard-code-grid").html(that.CAPCM110SandardGrid.render({'height': CaGridHeight}));
                }


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  서브셋 코드 그리드 생성                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                , createStandardSubsetCodeGrid : function(that) {


                	// 서브셋 왼쪽 그리드 생성
                	that.CAPCM110SubsetLeftGrid = new ExtGrid({
                        fields: ['cd', 'cdNm', 'inqrySeq']
                        , id: 'CAPCM110SubsetLeftGrid'
                        , columns: [
	                        {text: bxMsg('cbb_items.SCRNITM#cd'), height: 25, flex: 1, dataIndex: 'cd', style: 'text-align:center', align: 'center'}
	                        , {text: bxMsg('cbb_items.AT#cdNm'), flex: 1, dataIndex: 'cdNm', style: 'text-align:center', align: 'center'}
	                        , {text: bxMsg('cbb_items.AT#inqrySeq'), flex: 1, dataIndex: 'inqrySeq', style: 'text-align:center', align: 'center'}
                        ]
	                	,gridConfig: {
				  				multiSelect: true
		          		  } // end of gridConfig
                    });


                    that.$el.find("#CAPCM110-subset-left-grid").html(that.CAPCM110SubsetLeftGrid.render({'height': CaGridHeight}));


                	// 서브셋 오른쪽 그리드 생성
                	that.CAPCM110SubsetRightGrid = new ExtGrid({
                        fields: ['cd', 'cdNm', 'inqrySeq']
                        , id: 'CAPCM110SubsetRightGrid'
                        , columns: [
	                        {text: bxMsg('cbb_items.SCRNITM#cd'), height: 25, flex: 1, dataIndex: 'cd', style: 'text-align:center', align: 'center'}
	                        , {text: bxMsg('cbb_items.AT#cdNm'), flex: 1, dataIndex: 'cdNm', style: 'text-align:center', align: 'center'}
	                        , {text: bxMsg('cbb_items.AT#inqrySeq'), flex: 1, dataIndex: 'inqrySeq', style: 'text-align:center', align: 'center', editor: 'textfield'}
	                        , {xtype: 'actioncolumn', text: bxMsg('cbb_items.SCRNITM#btnMltLng'), flex: 1, align: 'center', style: 'text-align:center'
	                        	, renderer: function (val) {
//	                        		return "<button type=\"button\" class=\"bw-btn-form unit\" title=\"{{bxMsg 'cbb_items.SCRNITM#btnMltLng'}}\" id=\"btn-grid-search\">{{bxMsg 'cbb_items.SCRNITM#btnMltLng'}}</button>";
	                        		return "<button type=\"button\" class=\"bw-btn-form add-mg-t-5\" id=\"btn-grid-search\">"+bxMsg('cbb_items.SCRNITM#btnMltLng')+"</button>";
	                        	}
	                        	, listeners: {
		                          /**
		                           * 버튼 클릭 이벤트 등록
		                           */
		                          click: function (grid, rowEl, rowIdx, cellIdx, e, record) {
		                              if ($(e.target).hasClass('bw-btn-form')) {
		                            	  // 다국어 화면으로 이동.


		                            	  var param = {};
		                            	  param.trnsfrKndCd = "CDVAL_NAME"; // 코드값
		                            	  param.trnsfrOriginKeyVal = that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbr"]').val()+record.get("cd"); // 코드+값


		                            	  that.openPage(e, param);


		                              }
		                          }
		                      }
                         }


                        ]
	                	,gridConfig: {
		                	// 셀 에디팅 플러그인
	                		multiSelect: true
		                  , plugins: [
		                        Ext.create('Ext.grid.plugin.CellEditing', {
		                            // 2번 클릭시, 에디팅할 수 있도록 처리
		                            clicksToEdit: 2
		                          , listeners: {
		                            	'beforeedit': function (editor, e) {
			                            	if(e.field == 'cd' || e.field == 'cdNm') {
			                            		return false;
			                            	}
		                                } // end of edit
		                            } // end of listners
		                        }) // end of Ext.create
		                    ] // end of plugins
                	
	                	} // end of gridConfig
                    });


                    that.$el.find("#CAPCM110-subset-right-grid").html(that.CAPCM110SubsetRightGrid.render({'height': CaGridHeight}));


                }


//
//
//
                , render: function () {
                	var that = this;
                	// 콤보데이터 로딩
                    var sParam;


                    // 코드종류
                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = 'CAPCM110-base-cdNbrTpCd-wrap';
                    sParam.targetId = "cdNbrTpCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
//                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "A0536"; // 11915
                    fn_getCodeList(sParam, that);


                    // 컴포넌트
                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = 'CAPCM110-base-cmpntCd-wrap';
                    sParam.targetId = "cmpntCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "11602";
                    fn_getCodeList(sParam, that);


                    // 코드종류
                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = 'CAPCM110-detail-cdNbrTpCd-wrap';
                    sParam.targetId = "cdNbrTpCd";
//                    sParam.nullYn = "Y";
//                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); 
//                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "A0536";
                    fn_getCodeList(sParam, that);


                    // 컴포넌트
                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = 'CAPCM110-detail-cmpntCd-wrap';
                    sParam.targetId = "cmpntCd";
//                    sParam.nullYn = "Y";
//                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); 
                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "11602";
                    fn_getCodeList(sParam, that);


                    // 상위코드 비활성화
                    that.$el.find('.CAPCM110-base-table [data-form-param="upCdNbr"]').prop("readonly", true);
                    that.$el.find('.CAPCM110-detail-table [data-form-param="upCdNbr"]').prop("readonly", true);

                  //배포처리반영[버튼비활성화]
                    this.resetDistributionBtn();
                    return that.$el;
                }


                , resetDistributionBtn : function(){
                	//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPCM110-wrap #btn-CAPCM110-grid-delete')
                                        		,this.$el.find('.CAPCM110-wrap #btn-detail-save')
                                        		,this.$el.find('.CAPCM110-wrap #btn-CAPCM110-detail-grid-delete')
                                        		,this.$el.find('.CAPCM110-wrap #btn-code-detail-save')
                                        			   ]);
                }

//
//
//
                , resetBaseArea: function () {
                    var that = this;


                    that.$el.find('.CAPCM110-base-table [data-form-param="cdNbrTpCd"] option:eq(0)').attr("selected", "selected");
                    that.$el.find('.CAPCM110-base-table [data-form-param="cdNbr"]').val("");
                    that.$el.find('.CAPCM110-base-table [data-form-param="cdNbrNm"]').val("");
                    that.$el.find('.CAPCM110-base-table [data-form-param="cmpntCd"] option:eq(0)').attr("selected", "selected");
                    that.$el.find('.CAPCM110-base-table [data-form-param="cdNm"]').val("");
                    that.$el.find('.CAPCM110-base-table [data-form-param="upCdNbr"]').val("");
                    that.$el.find('.CAPCM110-base-table [data-form-param="upCdNbr"]').prop("readonly", true);


                    that.CAPCM110Grid.resetData();


                    // 상세부 초기화
                    that.resetDetailArea();
                }




//
//
//
                , resetDetailArea : function() {
                	var that = this;


                	that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbrTpCd"] option:eq(0)').attr("selected", "selected");
                	that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbr"]').val("");
                	that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbrNm"]').val("");
                    that.$el.find('.CAPCM110-detail-table [data-form-param="cmpntCd"] option:eq(0)').attr("selected", "selected");
                    that.$el.find('.CAPCM110-detail-table [data-form-param="upCdNbr"]').val("");
                    that.$el.find('.CAPCM110-detail-table [data-form-param="upCdNbrNm"]').val("");
                    that.$el.find('.CAPCM110-detail-table [data-form-param="cdDesc"]').val("");
                    that.$el.find('.CAPCM110-detail-table [data-form-param="xtnCdTblNm"]').val("");
                    that.$el.find('.CAPCM110-detail-table [data-form-param="xtnCdClassNm"]').val("");


                 // readonly 처리
                    that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbrTpCd"]').prop("readonly", false);
                    that.$el.find('.CAPCM110-detail-table [data-form-param="upCdNbr"]').prop("readonly", true);
                    that.$el.find('.CAPCM110-detail-table #btn-upCdNbr-search').prop("readonly", true); // 상위코드조회버튼


                    that.$el.find('.CAPCM110-detail-table [data-form-param="xtnCdTblNm"]').prop("readonly", true);
                    that.$el.find('.CAPCM110-detail-table [data-form-param="xtnCdClassNm"]').prop("readonly", true);
                    that.$el.find('.CAPCM110-detail-table #btn-class-search').prop("readonly", true); // 클래스조회버튼


                    that.$el.find('#CAPCM110-standard-code-grid').show();
            		that.$el.find('#CAPCM110-standard-subset-code-grid-area').hide();
            		// 상세 코드 속성 영역 보임 처리
        			that.$el.find('#CAPCM110-code-detail-table-area').show();
        			that.CAPCM110SandardGrid.setColumnVisible(3, true);


        			// 상세 코드 저장 버튼 보임 처리
        			that.$el.find('#btn-CAPCM110-detail-grid-delete').show();
        			that.resetDistributionBtn();

                    // 상세 코드 그리드 초기화
                    that.CAPCM110SandardGrid.resetData(); // 일반코드초기화
            		that.CAPCM110SubsetLeftGrid.resetData(); // 서브셋코드 왼쪽 그리드 초기화 
            		that.CAPCM110SubsetRightGrid.resetData(); // 서브셋코드 오른쪽 그리드 초기화


                    // 상세 코드 속성 초기화
                    that.resetCodeDetailArea();


                }


//
//
//
                , resetCodeDetailArea : function() {
                	var that = this;


                	that.$el.find('#CAPCM110-code-detail-table [data-form-param="cd"]').val("");
                	that.$el.find('#CAPCM110-code-detail-table [data-form-param="cdNm"]').val("");
                	that.$el.find('#CAPCM110-code-detail-table [data-form-param="inqrySeq"]').val("");


                	// readonly 처리
            		//2018.06.19  keewoong.hong  Bug(prj) #11578  확장코드(02), 외부코드(03)는 화면표시순서를 관리하지 않음.
                	that.$el.find('#CAPCM110-code-detail-table [data-form-param="cd"]').prop("readonly", false);
                	that.$el.find('#CAPCM110-code-detail-table [data-form-param="cdNm"]').prop("readonly", false);
                	
                	
                	var cdNbrTpCd = that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbrTpCd"]').val();
                	
            		if(cdNbrTpCd == '02' || cdNbrTpCd == '03') {
                		$(document.getElementById("CAPCM110-code-detail-table-row2")).hide();
            		} else {
                		$(document.getElementById("CAPCM110-code-detail-table-row2")).show();
            		}
                	
                }


//
//
//
                , queryBaseArea: function () {
                    var that = this;
                    that.inquiryBaseData();
                }




//
//
//
                , inquiryBaseData: function () {
                	var that = this;
                    var sParam = {};


                    if(commonInfo.getInstInfo().instCd) {
                		sParam.instCd = commonInfo.getInstInfo().instCd;
                	}
                	else {
                		sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                	}


                    sParam.cdNbrTpCd = that.$el.find('.CAPCM110-base-table [data-form-param="cdNbrTpCd"]').val();
                    sParam.cdNbr = that.$el.find('.CAPCM110-base-table [data-form-param="cdNbr"]').val();
                    sParam.cdNbrNm = that.$el.find('.CAPCM110-base-table [data-form-param="cdNbrNm"]').val();
                    sParam.cmpntCd = that.$el.find('.CAPCM110-base-table [data-form-param="cmpntCd"]').val();
                    sParam.cdNm = that.$el.find('.CAPCM110-base-table [data-form-param="cdNm"]').val();
                    sParam.cdDescCntnt = that.$el.find('.CAPCM110-base-table [data-form-param="cdDesc"]').val();
                    sParam.upCdNbr = that.$el.find('.CAPCM110-base-table [data-form-param="upCdNbr"]').val();


                    if (fn_isEmpty(sParam.cdNbr) && fn_isEmpty(sParam.cdNbrNm) && fn_isEmpty(sParam.cdDescCntnt)
                    		&& fn_isEmpty(sParam.cdNm) && fn_isEmpty(sParam.cdNbrTpCd) && fn_isEmpty(sParam.cmpntCd)) {
                    	 fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0014'));
                         return;
                    }


                    var linkData = {"header": fn_getHeader('CAPCM0808401'), "CaCdMgmtSvcGetCdListIn": sParam};


                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                    var tbList = responseData.CaCdMgmtSvcGetCdListOut.cdList;
                                    var totCnt = tbList.length;


                                    if (tbList != null || tbList.length > 0) {
                                        that.CAPCM110Grid.setData(tbList);
                                        that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                        // 삭제 로우 초기화
                                        that.deleteList = [];
                                        //상세부 초기화
                                        that.resetDetailArea();


                                        that.CAPCM110SandardGrid.resetData(); // 일반코드초기화
                                		that.CAPCM110SubsetLeftGrid.resetData(); // 서브셋코드 왼쪽 그리드 초기화 
                                		that.CAPCM110SubsetRightGrid.resetData(); // 서브셋코드 오른쪽 그리드 초기화


                                		// 상세 코드 속성 영역 초기화
                                		that.resetCodeDetailArea();
                                    }
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                } // end




//
//
//
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




//
//
//
                , deleteGrid : function(that) {
                	var sParam = {};
                	sParam.tblNm = [];


                	if(that.deleteList.length > 0) {
                		$(that.deleteList).each(function(idx, data) {
                			var deleteParam = {};
                			deleteParam.cmpntCd = data.cmpntCd;
                			deleteParam.dmnDscd = data.cmpntCd;
                			deleteParam.cdNbr = data.cdNbr;
                			deleteParam.cdNbrNm = data.cdNbrNm;
                			deleteParam.upCdNbr = data.upCdNbr;
                			deleteParam.cdDescCntnt = data.cdDescCntnt;
                			deleteParam.cdNbrTpCd = data.cdNbrTpCd;
                			deleteParam.xtnCdTblNm = data.xtnCdTblNm;
                			deleteParam.xtnCdClassNm = data.xtnCdClassNm;
                			deleteParam.upCdNbrNm = data.upCdNbrNm;
                			deleteParam.instCd = data.instCd;
                			sParam.tblNm.push(deleteParam);
                		});


                		var linkData = {"header": fn_getHeader("CAPCM0808302"), "CaCdMgmtSvcReoveCodeListIn": sParam};


                            // ajax호출
                            bxProxy.post(sUrl, JSON.stringify(linkData), {
                                enableLoading: true
                                , success: function (responseData) {
                                    if (fn_commonChekResult(responseData)) {
                                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                        that.queryBaseArea(); // 재조회
                                    }
                                }   // end of suucess: fucntion
                            }); // end of bxProxy
                	}
                	else {
                		return;
                	}


                }




//
//
//
                , clickSaveCode : function(event) {
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                    var sParam = this.setCodeBaseInfo(this);
                    if(sParam == null) {
                 		return;
                 	}
                	fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveCode, this);
                }


//
//
//
                , saveCode : function(that) {


                	 var sParam = {};
                	 sParam = that.setCodeBaseInfo(that);


                 	// 표준코드 저장
//                 	CdMgmtSvcCdInfoListIn":{"cdNbrTpCd":"01","dmnDscd":"ACB","cdNbrNm":"test","cdNbrEngNm":"test","cdDesc":"test","instCd":"STDA","cdDtlList":[{"cd":"test","cdNm":"test","engCdNm":"test"}],"lngCd":"ko","cmpntCd":"ACB"}}:"
                 	// 확장코드 저장
//                 	CdMgmtSvcCdInfoListIn":{"cdNbrTpCd":"02","dmnDscd":"ACB","cdNbrNm":"test","cdNbrEngNm":"test","cdDesc":"test","xtnCdTblNm":"test","xtnCdClassNm":"AmtTpImpl","instCd":"STDA","cdDtlList":[],"lngCd":"ko","cmpntCd":"ACB"}}:
                 	// 외부코드 저장
//                 	CdMgmtSvcCdInfoListIn":{"cdNbrTpCd":"03","dmnDscd":"ACB","cdNbrNm":"test","cdNbrEngNm":"test","cdDesc":"test","instCd":"STDA","cdDtlList":[{"cd":"test","cdNm":"test","engCdNm":"test"}],"lngCd":"ko","cmpntCd":"ACB"}}:
                 	// 서브셋코드 저장 서브셋코드는 단건이 아니라 다건 저장 한다.
//                 	CdMgmtSvcCdInfoListIn":{"cdNbrTpCd":"04","dmnDscd":"ACB","cdNbrNm":"test","cdNbrEngNm":"test","cdDesc":"test","upCdNbr":"10002","upCdNbrNm":"속성검증구분코드","instCd":"STDA","cdDtlList":[{"cd":"L","cdNm":"리스트타입검증","engCdNm":"List Type Inspection"}],"lngCd":"ko","cmpntCd":"ACB"}}:


                 	if(sParam == null) {
                 		return;
                 	}


                     var linkData = {"header": fn_getHeader("CAPCM0808102"),"CaCdMgmtSvcCdInfoListIn": sParam};
                     //ajax 호출
                     bxProxy.post(sUrl, JSON.stringify(linkData), {
                    	 enableLoading: true,
                         success: function (responseData) {
                             if (fn_commonChekResult(responseData)) {
                            	 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            	 that.$el.find('.CAPCM110-base-table [data-form-param="cdNbr"]').val(responseData.CaCdMgmtSvcCdInfoOut.cdNbr);
                            	 that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbr"]').val(responseData.CaCdMgmtSvcCdInfoOut.cdNbr);
//                            	 that.queryBaseArea();
                             }
                         }
                     });
                }




//
//
//
                , clickDeleteCodeDetail : function(event) {
                	// 기본 속성에 코드 가 있은지 검증 한다. 없으면 리턴
                	if(fn_isNull(this.$el.find('.CAPCM110-detail-table [data-form-param="cdNbr"]').val())) {
                		return;
                	}
                	// 확장코드는 다건 저장 안됨.
                	var cdNbrTpCd = this.$el.find('.CAPCM110-detail-table [data-form-param="cdNbrTpCd"]').val();
                	if(cdNbrTpCd == "02") {
                		return;
                	}




                	var msgTitle = bxMsg('cbb_items.SCRNITM#B_delete');
                	var msg = bxMsg('cbb_items.SCRNITM#data-delete-msg');


                	if(cdNbrTpCd == "04" || cdNbrTpCd == "05") {
                		msgTitle = bxMsg('cbb_items.ABRVTN#save');
                		msg = bxMsg('cbb_items.SCRNITM#screenSave');
                	}

                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                    
                    var sParam = this.setCodeBaseInfo(this);
                    if(sParam == null) {
                 		return;
                 	}
                    
                	fn_confirmMessage(event,msgTitle, msg, this.deleteCodeDetail, this);
                }


//
//
//
                , deleteCodeDetail : function(that) {
                	

                	var sParam = {};
                	sParam = that.setCodeBaseInfo(that);
                	sParam.cdDtlList = [];;
                	// 표준코드 저장
//                	CdMgmtSvcCdInfoListIn":{"cdNbrTpCd":"01","dmnDscd":"ACB","cdNbrNm":"test","cdNbrEngNm":"test","cdDesc":"test","instCd":"STDA","cdDtlList":[{"cd":"test","cdNm":"test","engCdNm":"test"}],"lngCd":"ko","cmpntCd":"ACB"}}:"
                	// 확장코드 저장
//                	CdMgmtSvcCdInfoListIn":{"cdNbrTpCd":"02","dmnDscd":"ACB","cdNbrNm":"test","cdNbrEngNm":"test","cdDesc":"test","xtnCdTblNm":"test","xtnCdClassNm":"AmtTpImpl","instCd":"STDA","cdDtlList":[],"lngCd":"ko","cmpntCd":"ACB"}}:
                	// 외부코드 저장
//                	CdMgmtSvcCdInfoListIn":{"cdNbrTpCd":"03","dmnDscd":"ACB","cdNbrNm":"test","cdNbrEngNm":"test","cdDesc":"test","instCd":"STDA","cdDtlList":[{"cd":"test","cdNm":"test","engCdNm":"test"}],"lngCd":"ko","cmpntCd":"ACB"}}:
                	// 서브셋코드 저장 서브셋코드는 단건이 아니라 다건 저장 한다.
//                	CdMgmtSvcCdInfoListIn":{"cdNbrTpCd":"04","dmnDscd":"ACB","cdNbrNm":"test","cdNbrEngNm":"test","cdDesc":"test","upCdNbr":"10002","upCdNbrNm":"속성검증구분코드","instCd":"STDA","cdDtlList":[{"cd":"L","cdNm":"리스트타입검증","engCdNm":"List Type Inspection"}],"lngCd":"ko","cmpntCd":"ACB"}}:


                	if(sParam == null) {
                		return;
                	}


                	// 그리드의 건수 만큼 돌린다.
                	// 04, 05 일시 오른쪽 그리드값을 가져 온다.
                	var gridData = that.CAPCM110SandardGrid.getAllData();
                	if(sParam.cdNbrTpCd == "04" || sParam.cdNbrTpCd == "05") {
                		gridData = that.CAPCM110SubsetRightGrid.getAllData();
                	}


                	$(gridData).each(function(idx, data) {
                		var dtlParam = {};
                		dtlParam.cd = data.cd;
                		dtlParam.cdNm = data.cdNm;
                		dtlParam.inqrySeq = data.inqrySeq;
                		sParam.cdDtlList.push(dtlParam);
                	});
   				// for (var i = 0; i < sParam.cdDtlList.length; i++){
   					 for( var j = 0; j< that.deleteDetailList.length; j++){
   						// if(that.deleteDetailList[j].cd == sParam.cdDtlList[i].cd ){
   	                		var dtlParam = {};
   	                		dtlParam.cd = that.deleteDetailList[j].cd;
   	                		dtlParam.cdNm = that.deleteDetailList[j].cdNm;
   	                		dtlParam.inqrySeq = that.deleteDetailList[j].inqrySeq;
   	                		dtlParam.delYn = 'Y';
   							sParam.cdDtlList.push(dtlParam);
   						 }
   					// }

   				// }

                	var linkData = {"header": fn_getHeader("CAPCM0808101"),"CaCdMgmtSvcCdInfoListIn": sParam};
                	//ajax 호출
                	bxProxy.post(sUrl, JSON.stringify(linkData), {
                		enableLoading: true,
                		success: function (responseData) {
                			if (fn_commonChekResult(responseData)) {
                				fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                				that.$el.find('.CAPCM110-base-table [data-form-param="cdNbr"]').val(responseData.CaCdMgmtSvcCdInfoOut.cdNbr);
                				that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbr"]').val(responseData.CaCdMgmtSvcCdInfoOut.cdNbr);


                				// 상세 재조회 검색 결과 그리드 클릭
                				that.clickGrid();
                			}
                		}
                	});
                }


//
//
//
                , clickSaveCodeDetail : function(event) {
                	// 기본 속성에 코드 가 있은지 검증 한다. 없으면 리턴
                	if(fn_isNull(this.$el.find('.CAPCM110-detail-table [data-form-param="cdNbr"]').val())) {
                		fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#cdNbr')+"]");
                		return;
                	}
                	// 확장, 서브셋, 기관서브셋은 단건 저장 안됨
                	var cdNbrTpCd = this.$el.find('.CAPCM110-detail-table [data-form-param="cdNbrTpCd"]').val();
                	if(cdNbrTpCd == "02" || cdNbrTpCd == "04" || cdNbrTpCd == "05") {
                		return;
                	}

                	//과제선택 체크
                	if(!fn_headerTaskIdCheck()){
                		return;
                	}
                	var sParam = this.setCodeBaseInfo(this);
                    if(sParam == null) {
                 		return;
                 	}
                    var dtlParam = {};
                	dtlParam.cd = this.$el.find('.CAPCM110-code-detail-table [data-form-param="cd"]').val();
                	dtlParam.cdNm = this.$el.find('.CAPCM110-code-detail-table [data-form-param="cdNm"]').val();

                	if(fn_isNull(dtlParam.cd)) {
                		fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004") + "["+bxMsg('cbb_items.SCRNITM#cd')+"]");
                		this.$el.find('.CAPCM110-code-detail-table [data-form-param="cd"]').focus();
                		return;
                	}


                	if(fn_isNull(dtlParam.cdNm)) {
                		fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004") + "["+bxMsg('cbb_items.SCRNITM#cdNm')+"]");
                		this.$el.find('.CAPCM110-code-detail-table [data-form-param="cdNm"]').focus();
                		return;
                	}
                	
                	fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveCodeDetail, this);
                }


//
//
//
                , saveCodeDetail : function(that) {
                	var sParam = {};
                	sParam = that.setCodeBaseInfo(that);


                	// 표준코드 저장
//                	CdMgmtSvcCdInfoListIn":{"cdNbrTpCd":"01","dmnDscd":"ACB","cdNbrNm":"test","cdNbrEngNm":"test","cdDesc":"test","instCd":"STDA","cdDtlList":[{"cd":"test","cdNm":"test","engCdNm":"test"}],"lngCd":"ko","cmpntCd":"ACB"}}:"
                	// 확장코드 저장
//                	CdMgmtSvcCdInfoListIn":{"cdNbrTpCd":"02","dmnDscd":"ACB","cdNbrNm":"test","cdNbrEngNm":"test","cdDesc":"test","xtnCdTblNm":"test","xtnCdClassNm":"AmtTpImpl","instCd":"STDA","cdDtlList":[],"lngCd":"ko","cmpntCd":"ACB"}}:
                	// 외부코드 저장
//                	CdMgmtSvcCdInfoListIn":{"cdNbrTpCd":"03","dmnDscd":"ACB","cdNbrNm":"test","cdNbrEngNm":"test","cdDesc":"test","instCd":"STDA","cdDtlList":[{"cd":"test","cdNm":"test","engCdNm":"test"}],"lngCd":"ko","cmpntCd":"ACB"}}:
                	// 서브셋코드 저장 서브셋코드는 단건이 아니라 다건 저장 한다.
//                	CdMgmtSvcCdInfoListIn":{"cdNbrTpCd":"04","dmnDscd":"ACB","cdNbrNm":"test","cdNbrEngNm":"test","cdDesc":"test","upCdNbr":"10002","upCdNbrNm":"속성검증구분코드","instCd":"STDA","cdDtlList":[{"cd":"L","cdNm":"리스트타입검증","engCdNm":"List Type Inspection"}],"lngCd":"ko","cmpntCd":"ACB"}}:


                	// 단건 저장은 표준코드, 외부코드만 저장 한다.
                	if(sParam == null) {
                		return;
                	}
                	
                	var dtlParam = {};
                	dtlParam.cd = that.$el.find('.CAPCM110-code-detail-table [data-form-param="cd"]').val();
                	dtlParam.cdNm = that.$el.find('.CAPCM110-code-detail-table [data-form-param="cdNm"]').val();
                	dtlParam.inqrySeq = that.$el.find('.CAPCM110-code-detail-table [data-form-param="inqrySeq"]').val();

                	if(fn_isNull(dtlParam.cdNm)) {
                		dtlParam.inqrySeq = 0;
                	}


                	sParam.cdDtlList = [];
                	sParam.cdDtlList.push(dtlParam);


                	var linkData = {"header": fn_getHeader("CAPCM0808103"),"CaCdMgmtSvcCdInfoListIn": sParam};
                	//ajax 호출
                	bxProxy.post(sUrl, JSON.stringify(linkData), {
                		enableLoading: true,
                		success: function (responseData) {
                			if (fn_commonChekResult(responseData)) {
                				fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                				that.$el.find('.CAPCM110-base-table [data-form-param="cdNbr"]').val(responseData.CaCdMgmtSvcCdInfoOut.cdNbr);
                				that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbr"]').val(responseData.CaCdMgmtSvcCdInfoOut.cdNbr);


                				// 상세 재조회 검색 결과 그리드 클릭
                				that.clickGrid();
                			}
                		}
                	});
                }


//
//
//
                , setCodeBaseInfo : function(that) {
                	var sParam = {};


                	sParam.cdNbrTpCd = that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbrTpCd"]').val(); // 코드종류
                	sParam.cdNbr = that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbr"]').val(); // 코드
                	sParam.cdNbrNm = that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbrNm"]').val(); // 코드명
                	sParam.dmnDscd = that.$el.find('.CAPCM110-detail-table [data-form-param="cmpntCd"]').val(); // 컴포넌트
                	sParam.cmpntCd = that.$el.find('.CAPCM110-detail-table [data-form-param="cmpntCd"]').val(); // 컴포넌트
                	sParam.upCdNbr = that.$el.find('.CAPCM110-detail-table [data-form-param="upCdNbr"]').val(); // 상위코드
                	sParam.cdDescCntnt = that.$el.find('.CAPCM110-detail-table [data-form-param="cdDesc"]').val(); // 코드설명
                	sParam.xtnCdTblNm = that.$el.find('.CAPCM110-detail-table [data-form-param="xtnCdTblNm"]').val(); // 테이블명
                	sParam.xtnCdClassNm = that.$el.find('.CAPCM110-detail-table [data-form-param="xtnCdClassNm"]').val(); // 클래스


                	if(commonInfo.getInstInfo().instCd) {
                		sParam.instCd = commonInfo.getInstInfo().instCd;
                	}
                	else {
                		sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                	}
                	
//                	if( instCd != 'STDA'){
//                		fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0058"));
//                		sParam = null;
//                		return;
//                	}


                	if(fn_isNull(sParam.cdNbrTpCd)) {
                		fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004"));
                		that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbrTpCd"]').focus();
                		sParam = null;
                		return;
                	}
                	
       

                	if(fn_isNull(sParam.cdNbrNm)) {
                		fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004"));
                		that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbrNm"]').focus();
                		sParam = null;
                		return;
                	}


                	if(fn_isNull(sParam.cmpntCd)) {
                		fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004"));
                		that.$el.find('.CAPCM110-detail-table [data-form-param="cmpntCd"]').focus();
                		sParam = null;
                		return;
                	}


                	if(fn_isNull(sParam.cdDescCntnt)) {
                		fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004"));
                		that.$el.find('.CAPCM110-detail-table [data-form-param="cdDesc"]').focus();
                		sParam = null;
                		return;
                	}


                	if (sParam.cdNbrTpCd == '05') {
                		sParam.cdNbr = sParam.upCdNbr;
                	}


                	// 서브셋 코드일시 상위코드 필수
                	if(sParam.cdNbrTpCd == "04" || sParam.cdNbrTpCd == "05") {
                		if(fn_isNull(sParam.upCdNbr)) {
                			fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004"));
                			that.$el.find('.CAPCM110-detail-table [data-form-param="upCdNbr"]').focus();
                			sParam = null;
                			return;
                		}
                	}


                	// 확장 코드일시 테이블, 클래스는 필수 이다.
                	if(sParam.cdNbrTpCd == "02") {
                		if(fn_isNull(sParam.xtnCdTblNm)) {
                			fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004"));
                			that.$el.find('.CAPCM110-detail-table [data-form-param="xtnCdTblNm"]').focus();
                			sParam = null;
                			return;
                		}
                		if(fn_isNull(sParam.xtnCdClassNm)) {
                			fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004"));
                			that.$el.find('.CAPCM110-detail-table [data-form-param="xtnCdClassNm"]').focus();
                			sParam = null;
                			return;
                		}
                	}


                	return sParam;
                }


//
//
//
                , clickGrid: function () {


                    var that = this;
                    var selectedRecord = that.CAPCM110Grid.grid.getSelectionModel().selected.items[0];


                    if (!selectedRecord) {
                        return;
                    } else {
                    	that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbrTpCd"]').val(selectedRecord.data.cdNbrTpCd);
                    	that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbr"]').val(selectedRecord.data.cdNbr);
                    	that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbrNm"]').val(selectedRecord.data.cdNbrNm);
                        that.$el.find('.CAPCM110-detail-table [data-form-param="cmpntCd"]').val(selectedRecord.data.cmpntCd);
                        that.$el.find('.CAPCM110-detail-table [data-form-param="upCdNbr"]').val(selectedRecord.data.upCdNbr);
                        that.$el.find('.CAPCM110-detail-table [data-form-param="upCdNbrNm"]').val(selectedRecord.data.upCdNbrNm);
                        that.$el.find('.CAPCM110-detail-table [data-form-param="cdDesc"]').val(selectedRecord.data.cdDescCntnt);
                        that.$el.find('.CAPCM110-detail-table [data-form-param="xtnCdTblNm"]').val(selectedRecord.data.xtnCdTblNm);
                        that.$el.find('.CAPCM110-detail-table [data-form-param="xtnCdClassNm"]').val(selectedRecord.data.xtnCdClassNm);


                        // readonly 처리
                        that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbrTpCd"]').prop("readonly", true);
                        that.$el.find('.CAPCM110-detail-table [data-form-param="upCdNbr"]').prop("readonly", true); // 상위코드는 변경 불가 추가만 할수 있음
                        that.$el.find('.CAPCM110-detail-table #btn-upCdNbr-search').prop("readonly", true); // 상위코드조회버튼


                        that.$el.find('.CAPCM110-detail-table [data-form-param="xtnCdTblNm"]').prop("readonly", true);
                        that.$el.find('.CAPCM110-detail-table [data-form-param="xtnCdClassNm"]').prop("readonly", true);


                        if(selectedRecord.data.cdNbrTpCd == "02") { // 확장 코드 일시
                        	that.$el.find('.CAPCM110-detail-table #btn-class-search').prop("readonly", false); // 클래스조회버튼
                        	that.$el.find('.CAPCM110-detail-table [data-form-param="xtnCdTblNm"]').prop("readonly", false);
                        }
                        else {
                        	that.$el.find('.CAPCM110-detail-table #btn-class-search').prop("readonly", true); // 클래스조회버튼
                        	that.$el.find('.CAPCM110-detail-table [data-form-param="xtnCdTblNm"]').prop("readonly", true);
                        }

                        // 코드상세 조회
                        that.queryDetailGrid(selectedRecord.data);
                    }
                }




//
//
//
                , clickStandardCodeGrid : function() {
                	var that = this;
                	var selectedRecord = that.CAPCM110SandardGrid.grid.getSelectionModel().selected.items[0];


                	if (!selectedRecord) {
                		return;
                		
                	} else {
                		that.$el.find('.CAPCM110-code-detail-table [data-form-param="cd"]').val(selectedRecord.data.cd);
                		that.$el.find('.CAPCM110-code-detail-table [data-form-param="cdNm"]').val(selectedRecord.data.cdNm);
                		that.$el.find('.CAPCM110-code-detail-table [data-form-param="inqrySeq"]').val(selectedRecord.data.inqrySeq);
                		that.$el.find('.CAPCM110-code-detail-table [data-form-param="cd"]').prop("readonly", true);
                    	that.$el.find('#CAPCM110-code-detail-table [data-form-param="cdNm"]').prop("readonly", true);

                	}
                }


//
//
//
                , queryDetailGrid : function(baseData) {
                	var that = this;
                	var sParam = {};


                	// 상세 코드 속성 영역 초기화
                	that.resetCodeDetailArea();


                	// 코드가 없으면 return
                	if(fn_isNull(baseData.cdNbr)) {
                		// 그리드 초기화
                		that.CAPCM110SandardGrid.resetData();
                		that.CAPCM110SubsetLeftGrid.resetData();
                		that.CAPCM110SubsetRightGrid.resetData();
                		return;
                	}


                	that.setDetailGridformat(that, baseData.cdNbrTpCd);


                	// 기관코드 설정
                    if(commonInfo.getInstInfo().instCd) {
                		sParam.instCd = commonInfo.getInstInfo().instCd;
                	}
                	else {
                		sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                	}


                	// 상위코드가 있는지 확인후 있으면 서브셋코드 이므로 왼쪽 그리드를 조회 한다.
                	if(!fn_isNull(baseData.upCdNbr)) {
                		// 왼쪽 그리드 조회
                		that.selectCAPCM110SubsetLeftGrid(baseData);
                	}


                	sParam.cdNbr = baseData.cdNbr;
                	sParam.cdNbrTpCd = baseData.cdNbrTpCd;


                	// 코드종류가 기관서브셋코드이면 상위코드를 코드로 넣는다.
                	if (baseData.cdNbrTpCd == '05') {
                        sParam.cdNbr = baseData.upCdNbr;
                    } 
                	else {
                		if (that.cdNbrTpCd == '02') { // 확장코드이면 확장클래스명을 넣는다.
                			sParam.xtnCdClassNm = baseData.xtnCdClassNm;
                		}
                	}


                    var linkData = {"header": fn_getHeader("CAPCM0808402"),"CaCdMgmtSvcGetCdDtlIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                var tbList = responseData.CaCdMgmtSvcGetCdDtlListOut.cdDtlList;


                                if (tbList != null && tbList.length > 0) {
                                	var totCnt = tbList.length;
                                	that.$el.find("#searchDetailResultCount").html(bxMsg('cbb_items.SCRNITM#dtlCd')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");


                                	that.CAPCM110SandardGrid.setData(tbList);
                                    that.CAPCM110SubsetRightGrid.setData(tbList);
                                } else {
                                    that.CAPCM110SandardGrid.resetData();
                                    that.CAPCM110SubsetRightGrid.resetData();
                                }
                            }
                        } // end of suucess: fucntion
                    }); // end of bxProxy




                }


//
//
//
                , setDetailGridformat : function(that, cdNbrTpCd) {
                	// 서브셋코드이거나 기관서브셋코드이면 그리드변경 하고 상세 코드 속성 영역을 숨긴다.


                	if(cdNbrTpCd == '04' || cdNbrTpCd == '05') {
                		that.$el.find('#CAPCM110-standard-code-grid').hide();
                		that.$el.find('#CAPCM110-standard-subset-code-grid-area').show();


                		// 상세 코드 속성 영역 숨김 처리
                		that.$el.find('#CAPCM110-code-detail-table-area').hide();
                	}
                	else {
                		that.$el.find('#CAPCM110-standard-code-grid').show();
                		that.$el.find('#CAPCM110-standard-subset-code-grid-area').hide();


                		// 확장코드는 다국어 등록 및 등록, 삭제가 없다.
                		if(cdNbrTpCd == "02") {
                			// 상세 코드 속성 영역 숨김 처리
//                    		that.$el.find('#CAPCM110-code-detail-table-area').hide();
                			that.$el.find('#CAPCM110-code-detail-table-area #btn-code-detail-save').hide();
                			
                    		that.$el.find('#btn-CAPCM110-detail-grid-delete').hide();
                    		that.CAPCM110SandardGrid.setColumnVisible(3, false);
                		}
                		else {
                			// 상세 코드 속성 영역 보임 처리
                			that.$el.find('#CAPCM110-code-detail-table-area').show();
                			that.$el.find('#CAPCM110-code-detail-table-area #btn-code-detail-save').show();
                			
                			that.$el.find('#btn-CAPCM110-detail-grid-delete').show();
                			that.CAPCM110SandardGrid.setColumnVisible(3, true);
                		}
                		
                    	//2018.06.19  keewoong.hong  Bug(prj) #11578  확장코드(02), 외부코드(03)는 화면표시순서를 관리하지 않음.
                		if(cdNbrTpCd == '02' || cdNbrTpCd == '03') {
                    		$(document.getElementById("CAPCM110-code-detail-table-row2")).hide();
                		} else {
                    		$(document.getElementById("CAPCM110-code-detail-table-row2")).show();
                		}
                		
                	}
                	that.resetDistributionBtn();

                	that.CAPCM110SandardGrid.resetData();
                	that.CAPCM110SubsetLeftGrid.resetData();
                	that.CAPCM110SubsetRightGrid.resetData();
                }


                , selectCAPCM110SubsetLeftGrid : function(baseData) {
                    var that = this;
                    var sParam = {};


                    sParam.cdNbr = baseData.upCdNbr;


                    // 기관코드 설정
                    if(commonInfo.getInstInfo().instCd) {
                		sParam.instCd = commonInfo.getInstInfo().instCd;
                	}
                	else {
                		sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                	}


                    var linkData = {
                        "header": fn_getHeader("CAPCM0808402"),"CaCdMgmtSvcGetCdDtlIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                var tbList = responseData.CaCdMgmtSvcGetCdDtlListOut.cdDtlList;


                                if (tbList != null && tbList.length > 0) {
                                    that.CAPCM110SubsetLeftGrid.setData(tbList);
                                } else {
                                    that.CAPCM110SubsetLeftGrid.resetData();
                                }
                            }
                        } // end of suucess: fucntion
                    }); // end of bxProxy
                }


//
//
//
                , baseSearchModal : function() {
                	fn_pageLayerCtrl("#CAPCM110-base-table", this.$el.find("#btn-base-search-modal"));
                }




//
//
//
                , gridAreaModal : function() {
                	fn_pageLayerCtrl("#CAPCM110-grid", this.$el.find("#btn-up-grid"));
                }




//
//
//
                , detailAreaModal : function() {
                	fn_pageLayerCtrl("#CAPCM110-detail-table", this.$el.find("#btn-detail-modal"));
                }




//
//
//
                , detailCodeListAreaModal : function() {
                	fn_pageLayerCtrl("#CAPCM110-code-detail-grid-area", this.$el.find("#btn-detail-up-grid"));
                }


//
//
//
                , detailCodeTableAreaModal : function() {
                	fn_pageLayerCtrl("#CAPCM110-code-detail-table", this.$el.find("#btn-code-detail-modal"));
                }




//
//
//
                , gridExcel : function() {
                	var that = this;
                	that.CAPCM110Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM110')+"_"+getCurrentDate("yyyy-mm-dd"));
                }


//
//
//
                , detailGridExcel : function() {
                	var that = this;


                	var srandardCodeGrid = that.$el.find('#CAPCM110-code-detail-grid-area #CAPCM110-standard-code-grid');


                	if(srandardCodeGrid.css('display') === 'none') {
                		that.CAPCM110SubsetRightGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM110')+"_"+getCurrentDate("yyyy-mm-dd"));
                	}
                	else {
                		that.CAPCM110SandardGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM110')+"_"+getCurrentDate("yyyy-mm-dd"));
                	}
                }


//
//
//
                , changeBaseCdNbrTpCd : function() {
                	var that = this;
                	// 코드종류중 서브셋코드일시만 상위코드를 활성화 한다.
                	var cdNbrTpCd = that.$el.find('.CAPCM110-base-table [data-form-param="cdNbrTpCd"]').val();


                	that.$el.find('.CAPCM110-base-table [data-form-param="upCdNbr"]').val("");


                	if(cdNbrTpCd == "04" || cdNbrTpCd == "05") {
                        that.$el.find('.CAPCM110-base-table [data-form-param="upCdNbr"]').prop("readonly", false);
                	}
                	else {
                		that.$el.find('.CAPCM110-base-table [data-form-param="upCdNbr"]').prop("readonly", true);
                	}


                }


//
//
//
                , changeDetailCdNbrTpCd : function() {
                	var that = this;
                	// 코드종류중 서브셋코드일시만 상위코드를 활성화 한다.
                	var cdNbrTpCd = that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbrTpCd"]').val();


                	// 서브셋 이면 상위버튼 활성화
                	if(cdNbrTpCd == "04" || cdNbrTpCd == "05") {
                		that.$el.find('.CAPCM110-detail-table [data-form-param="upCdNbr"]').prop("readonly", false);
                		that.$el.find('.CAPCM110-detail-table #btn-upCdNbr-search').prop("readonly", false); // 상위조회 버튼
                	}
                	else {
                		that.$el.find('.CAPCM110-detail-table [data-form-param="upCdNbr"]').prop("readonly", true);
                		that.$el.find('.CAPCM110-detail-table #btn-upCdNbr-search').prop("readonly", true); // 상위조회 버튼
                	}


                	if(cdNbrTpCd == "02") {
                		that.$el.find('.CAPCM110-detail-table #btn-class-search').prop("readonly", false); // 클래스조회버튼
                		that.$el.find('.CAPCM110-detail-table [data-form-param="xtnCdTblNm"]').prop("readonly", false);
                	}
                	else {
                		that.$el.find('.CAPCM110-detail-table #btn-class-search').prop("readonly", true); // 클래스조회버튼
                		that.$el.find('.CAPCM110-detail-table [data-form-param="xtnCdTblNm"]').prop("readonly", true);
                	}


                	that.setDetailGridformat(that, cdNbrTpCd);
                }


//
//
//
                , openPageByCodeBase : function(evnet) {
                	var that = this;
                	var param = {};
                	param.trnsfrKndCd = "CD_NAME"; // 코드명
            		param.trnsfrOriginKeyVal = that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbr"]').val() // 코드번호


            		that.openPage(evnet, param);


                }
//
//
//
                , openPageByCodeDetail : function(evnet) {
                	var that = this;
                	var param = {};
                	param.trnsfrKndCd = "CDVAL_NAME"; // 코드값명
                	
                	var sCdNbrTpCd = that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbrTpCd"]').val();
                	
                	// 2018.06.20  keewoong.hong  외부코드는 다국어 key값이 [instCd + cdNbr + cd] 이다.
                	if (sCdNbrTpCd == "03") {
                		var sHeaderInstCd = $.sessionStorage('headerInstCd')
                		param.trnsfrOriginKeyVal = sHeaderInstCd+that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbr"]').val()+that.$el.find('.CAPCM110-code-detail-table [data-form-param="cd"]').val(); // 기관코드+코드+값
                	} else {
                		param.trnsfrOriginKeyVal = that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbr"]').val()+that.$el.find('.CAPCM110-code-detail-table [data-form-param="cd"]').val(); // 코드+값
                	}


            		that.openPage(evnet, param);


                }
//
//
//
                , openPage : function(evnet, param) {
                	var that = this;


                	if(!param) {
                		return;
                	}


                	that.$el.trigger({
                		type: 'open-conts-page',
                		pageHandler: 'CAPCM190',
                		pageDPName: bxMsg('cbb_items.SCRN#CAPCM190'),
                		pageInitialize: true,
                		pageRenderInfo: {
                			trnsfrKnd : param.trnsfrKndCd
            				, trnsfrOriginKeyVal : param.trnsfrOriginKeyVal
                		}
                	});
                }




//
//
//
                , openClassSearchPopup: function () {
                	var that = this;
                	var sParam = {};
                	sParam.useSubsetCdYn = 'Y';
                	sParam.usePckgYn = 'N';
                	sParam.cdNbr = 'A0089';


                	var popupClassSearch = new PopupClassSearch(sParam);
                	popupClassSearch.render();


                	popupClassSearch.on('popUpSetData', function (data) {
                		that.$el.find('.CAPCM110-detail-table [data-form-param="xtnCdClassNm"]').val(data.classNm); //클래스명
                	});
                }                


//
//
//
                , openUpcdNbrPopup: function () {
                	var that = this;
                    var param = {};


                    param.cdNbrTpCd = that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbrTpCd"]').val();


                    var popupCdNbr = new PopupHighLevelCodeSearch(param);
                    popupCdNbr.render();


                    popupCdNbr.on('popUpSetData', function (param) {
                        that.$el.find('.CAPCM110-detail-table [data-form-param="upCdNbr"]').val(param.cdNbr);
                        that.$el.find('.CAPCM110-detail-table [data-form-param="upCdNbrNm"]').val(param.cdNbrNm);
                        // 서브셋 그리드 왼쪽 조회
                        //that.queryCodeInfo(param[0].cdNbr);
                        param.upCdNbr = param.cdNbr;
                        that.selectCAPCM110SubsetLeftGrid(param);
                    });
                }                




//
//
//
                , detailAddGridData : function() {
                	var that = this;
                	var selectedRows = that.CAPCM110SubsetLeftGrid.getSelectedItem();
                	var rigthGridData = that.CAPCM110SubsetRightGrid.getAllData();


                	if(selectedRows) {
                		$(selectedRows).each(function(idx, data) {
                			var checkValue = true;


                			$(rigthGridData).each(function(idx2, data2) {
                				if(data.cd == data2.cd) {
                					checkValue = false;
                					return false;
                				}
                			});


                			if(checkValue) {
                				var addData = {};
                				addData.cd = data.cd;
                				addData.cdNm = data.cdNm;
                				addData.inqrySeq = data.inqrySeq;


                    			that.CAPCM110SubsetRightGrid.addData(addData);
                			}
                		});
                	}
                }


//
//
//
                , detailDelGridData : function() {
                	var that = this;
                	var selectedStore = that.CAPCM110SubsetRightGrid.grid.getStore();
                    var selectedRows = that.CAPCM110SubsetRightGrid.grid.getSelectionModel().getSelection();


                    if (selectedRows.length > 0) {
                    	selectedStore.remove(selectedRows);
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

                ,openChangeHistoryPopup : function(){
                	var that = this;
                	var param = {};
                	var cdNbr = that.$el.find('.CAPCM110-detail-table [data-form-param="cdNbr"]').val();  
                	var cd = that.$el.find('.CAPCM110-code-detail-table [data-form-param="cd"]').val();
                	
                	param.tblNm = "CM_CD_D";
                	param.key = {"CD":cd,"CD_NBR":cdNbr};  //{                	  "CD" : "03",                	  "CD_NBR" : "A1034"                	}
                    this.popupChangeHistorySearch = new PopupChangeHistorySearch(param);
                    this.popupChangeHistorySearch.render();
                }

            })
            ; // end of Backbone.View.extend({


        return CAPCM110View;
    } // end of define function
)
; // end of define
