define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPCM/033/_CAPCM033.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'app/views/page/popup/CAPSV/popup-attribute-search'
        , 'app/views/page/popup/CAPPD/popup-product-search'
        , 'app/views/page/popup/CAPPD/popup-productTemplete-search'


    ]
    , function (config
        , tpl
        , ExtGrid
        , PopupAtrbtSrch
        , PopupPdSrch
        , PopupPdTmplSrch
        ) {


        /**
         * Backbone
         */
        var CAPCM033View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPCM033-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                	'click #btn-up-grid': 'gridAreaModal'
            		, 'click #btn-detail-modal': 'detailAreaModal'


        			, 'click #btn-CAPCM033-grid-delete': 'clickDeleteGrid'


    				, 'click #btn-detail-refresh': 'resetDetailArea'
					, 'click #btn-detail-save': 'clickSaveDetail'


					, 'click #btn-atrbt-search': 'openAtrbtSearchPopup'
					, 'click #btn-pd-search': 'openPdTmlplSearchPopup'
                }




//
//
//
                , initialize: function (initData) {
                    var that = this;
                    that.that = this;
                    that.initFlag = true;


                    var deleteList = [];


                    $.extend(that, initData);
                    that.$el.html(that.tpl());
                }




//
//
//
                , render: function () {
                	// 콤보데이터 로딩
                    var sParam = {};
                    sParam.className = 'CAPCM033-detail-instParmTpCd-wrap';
                    sParam.targetId = "instParmTpCd";
                    sParam.nullYn = "N";
                    sParam.cdNbr = "A0627";
                    fn_getCodeList(sParam, this);


                    this.createGrid();
                    this.queryBaseArea();

                  //배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPCM033-wrap #btn-CAPCM033-grid-delete')
                                        		,this.$el.find('.CAPCM033-wrap #btn-detail-save')
                                        			   ]);

                    return this.$el;
                }




//
//
//
                , createGrid : function() {
                	var that = this;
                    /* ------------------------------------------------------------ */
                	that.CAPCM033Grid = new ExtGrid({
                        /* ------------------------------------------------------------ */
                        // 단일탭 그리드 컬럼 정의
                        fields: ['rowIndex', 'instParmTpCd', 'parmAtrbtNm', 'parmNm', 'parmVal', 'parmDesc']
                        , id: 'CAPCM033Grid'
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
                            , {text: bxMsg('cbb_items.SCRNITM#parmDs'),width: 160,flex: 1, dataIndex: 'instParmTpCd', style: 'text-align:center', align: 'center'
                            	, renderer: function (value, metaData, record, rowIndex) {
                            		if(value) {
                            			return bxMsg('cbb_items.CDVAL#A0627'+value);
                            		}
                            		else {
                            			return value;
                            		}
							    }
                            }
                            , {text: bxMsg('cbb_items.SCRNITM#parmAtrbt'),width: 160,flex: 1,dataIndex: 'parmAtrbtNm', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#parmAtrbtNm'),width: 160,flex: 1,dataIndex: 'parmNm', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.SCRNITM#pdAndTmpltCd'),width: 160,flex: 1,dataIndex: 'parmVal', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.SCRNITM#pdTmpltNm'),width: 160,flex: 1,dataIndex: 'parmDesc', style: 'text-align:center', align: 'center'}
//                            , {
//                             	xtype: 'actioncolumn', width: 80, align: 'center', style: 'text-align:center', text: bxMsg('cbb_items.SCRNITM#del')
//                             	, items: [
//												{
//												//  icon: 'images/icon/x-delete-16.png'
//												  iconCls : "bw-icon i-25 i-func-trash"
//												  , tooltip: bxMsg('tm-layout.delete-field')
//												  , handler: function (grid, rowIndex, colIndex, item, e, record) {
//													  that.deleteList.push(record.data);
//													  grid.store.remove(record);
//												  }
//												}
//                             	        ]
//                             }
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


                	that.$el.find(".CAPCM033-grid").html(that.CAPCM033Grid.render({'height': CaGridHeight}));
                }


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  기본 초기화                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                , resetBaseArea: function () {
                    var that = this;
                    that.CAPCM033Grid.resetData();
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  상세 초기화                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                , resetDetailArea : function() {
                	this.initFlag = true;
                	this.$el.find('#CAPCM033-detail-table [data-form-param="instParmTpCd"] option:eq(0)').attr("selected", "selected");
                	this.$el.find('#CAPCM033-detail-table [data-form-param="parmAtrbtNm"]').val("");
                	this.$el.find('#CAPCM033-detail-table [data-form-param="parmNm"]').val("");
                	this.$el.find('#CAPCM033-detail-table [data-form-param="parmVal"]').val("");
                	this.$el.find('#CAPCM033-detail-table [data-form-param="parmDesc"]').val("");
                	this.$el.find('#btn-atrbt-search').prop("disabled", false);
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  기본조회                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                , queryBaseArea: function () {
                    this.inquiryBaseData();
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  기본조회                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                , inquiryBaseData: function () {
                	var that = this;
                    var sParam = {};


                    sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드


                    var linkData = {"header": fn_getHeader('CAPCM0308405'), "CaInstMgmtSvcGetParmIn": sParam};


                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                    var tbList = responseData.CaInstMgmtSvcGetParmOut.parmList;
                                    var totalCount = responseData.CaInstMgmtSvcGetParmOut.parmList.length;
                                    if (tbList != null || totalCount > 0) {
                                        that.CAPCM033Grid.setData(tbList);
                                        that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRN#CAPCM033')+ " "+bxMsg('cbb_items.SCRNITM#list')+" ("+fn_setComma(totalCount)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                        // 삭제 로우 초기화
                                        that.deleteList = [];
                                        //상세부 초기화
                                        that.resetDetailArea();
                                    }
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                } // end




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  그리드 저장(삭제)버튼 클릭                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
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




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  그리드 삭제                 /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , deleteGrid : function(that) {
                	var sParam = {};
                	sParam.instParmAtrbtList = [];


                	if(that.deleteList.length > 0) {
                		$(that.deleteList).each(function(idx, data) {
                			var delParam = {};
                			delParam.parmAtrbtNm = data.parmAtrbtNm;
                			sParam.instParmAtrbtList.push(delParam);
                		});


                		var linkData = {"header": fn_getHeader("CAPCM0318301"), "CaInstMgmtSvcAtrbtIn": sParam};


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




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  상세 저장 버튼 클릭                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , clickSaveDetail : function(event) {
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                	fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveDetail, this);
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  상세 저장                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , saveDetail : function(that) {


                	 var sParam = {};


                	 sParam.instCd = $.sessionStorage('headerInstCd');
                	 sParam.parmAtrbtNm =  that.$el.find('#CAPCM033-detail-table [data-form-param="parmAtrbtNm"]').val();
                	 sParam.parmVal = that.$el.find('#CAPCM033-detail-table [data-form-param="parmVal"]').val();


                	 var srvcCd = "CAPCM0308101"; // 수정
                	 var inOmmNm = "CaInstMgmtSvcRegParmIn";
                	 if(that.initFlag) {
                		 srvcCd = "CAPCM0308104"; // 신규 저장
                		 inOmmNm = "CaInstMgmtSvcAtrbtIn";
                		 sParam.instParmTpCd = that.$el.find('#CAPCM033-detail-table [data-form-param="instParmTpCd"]').val();
                	 }


                     var linkData = {"header": fn_getHeader(srvcCd), inOmmNm: sParam};
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


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  그리드 행 더블클릭                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , doubleiClickGrid: function () {


                    var that = this;
                    var selectedRecord = that.CAPCM033Grid.grid.getSelectionModel().selected.items[0];


                    if (!selectedRecord) {
                        return;
                    } else {
                    	this.initFlag = false;
                    	that.$el.find('#CAPCM033-detail-table [data-form-param="instParmTpCd"]').val(selectedRecord.data.instParmTpCd);
                        that.$el.find('#CAPCM033-detail-table [data-form-param="parmAtrbtNm"]').val(selectedRecord.data.parmAtrbtNm);
                        that.$el.find('#CAPCM033-detail-table [data-form-param="parmNm"]').val(selectedRecord.data.parmNm);
                        that.$el.find('#CAPCM033-detail-table [data-form-param="parmVal"]').val(selectedRecord.data.parmVal);
                        that.$el.find('#CAPCM033-detail-table [data-form-param="parmDesc"]').val(selectedRecord.data.parmDesc);
                        that.$el.find('#btn-atrbt-search').prop("disabled", true);
                    }
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  그리드영역 toggle                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , gridAreaModal : function() {
                	var that = this;
                	fn_pageLayerCtrl("#CAPCM033-grid", this.$el.find("#btn-up-grid"));
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  상세영역 toggle                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , detailAreaModal : function() {
                	var that = this;
                	fn_pageLayerCtrl("#CAPCM033-detail-table", this.$el.find("#btn-detail-modal"));
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  그리드 내용 엑셀 다운로드                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , gridExcel : function() {
                	var that = this;
                	that.CAPCM033Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM033')+"_"+getCurrentDate("yyyy-mm-dd"));
                }




                /**
                 * 속성조회 팝업
                 */
                , openAtrbtSearchPopup: function () {
                    var that = this;
                    var param = {};


                    this.popupAtrbtSrch = new PopupAtrbtSrch();
                    this.popupAtrbtSrch.render();
                    this.popupAtrbtSrch.on('popUpSetData', function (data) {
                        that.$el.find('#CAPCM033-detail-table [data-form-param="parmAtrbtNm"]').val(data.atrbtCd); // 속성
                        that.$el.find('#CAPCM033-detail-table [data-form-param="parmNm"]').val(data.loginLngAtrbtNm); // 속성명
                    });
                }


                /**
                 * 상품, 템플릿 조회 팝업
                 */
                , openPdTmlplSearchPopup: function () {
                	var that = this;
                	var instParmTpCd = this.$el.find('#CAPCM033-detail-table [data-form-param="instParmTpCd"]').val();


                	if(instParmTpCd == "06") {
                		that.popupPdSrch = new PopupPdSrch();
                		that.popupPdSrch.render();
                		that.popupPdSrch.on('popUpSetData', function (data) {
                            that.$el.find('#CAPCM033-detail-table [data-form-param="parmVal"]').val(data.pdCd); // 상품코드
                            that.$el.find('#CAPCM033-detail-table [data-form-param="parmDesc"]').val(data.pdNm); // 상품명
                        });
                	}
                	else {
                		that.popupPdTmplSrch = new PopupPdTmplSrch();
                		that.popupPdTmplSrch.render();
                		that.popupPdTmplSrch.on('popUpSetData', function (data) {
                            that.$el.find('#CAPCM033-detail-table [data-form-param="parmVal"]').val(data.pdTmpltCd); // 템플릿코드
                            that.$el.find('#CAPCM033-detail-table [data-form-param="parmDesc"]').val(data.pdTmpltNm); // 템플릿명
                        });
                	}






                }
            })
            ; // end of Backbone.View.extend({


        return CAPCM033View;
    } // end of define function
)
; // end of define
