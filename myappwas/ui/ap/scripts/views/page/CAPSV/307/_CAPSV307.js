define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPSV/307/_CAPSV307.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , ExtGrid
        , commonInfo
        , PopupClassSearch
        , PopupHighLevelCodeSearch
        ) {


        /**
         * Backbone
         */
        var CAPSV307View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPSV307-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                	// 검색조건 이벤트
                    'click #btn-base-reset': 'resetBaseArea'
                    , 'click #btn-base-search': 'inquiryEnvCdData'
                    , 'click #btn-detail-save': 'saveEnvCdData'
                	, 'click #btn-up-grid': 'baseGridModal'
                	, 'click #btn-detail-modal': 'baseDetailModal'
                    , 'click #btn-detail-refresh': 'resetDetailArea'
                    , 'click #btn-CAPSV307-grid-excel': 'exportEnvCdGrid'
                    , 'click #btn-CAPSV307-grid-delete': 'fn_deleteEnvCdList'
                    
					, 'keydown #searchKey' : 'fn_enter'
                }

                , initialize: function (initData) {

                    var that = this;
                    that.that = this;

                    $.extend(that, initData);
                    that.$el.html(that.tpl());

                    that.initData = initData;

                    var deleteEnvCdList = [];
                    that.createEnvCdGrid();
                }
                , render: function () {
                	var that = this;
                	// 콤보데이터 로딩
                    var sParam;

                  //활동상태코드
                    sParam = {};
                    sParam.className = "CAPSV307-envCd-actvStsCd";
                    sParam.targetId = "actvStsCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                    sParam.cdNbr = "A0439";
                    fn_getCodeList(sParam, this);
                    
                    that.inquiryEnvCdData();
                    return that.$el;
                }
                , createEnvCdGrid : function() {
                	var that = this;

                	that.CAPSV307EnvCdGrid = new ExtGrid({
                        /* ------------------------------------------------------------ */
                        // 단일탭 그리드 컬럼 정의
                        fields: ['rowIndex', 'instCd', 'dstbEnvrnmntCd','dstbEnvrnmntCdCntnt', 'lastStepYn','actvStsCd', 'lastChngId', 'lastChngTmstmp']
                        , id: 'CAPSV307EnvCdGrid'
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
                            , {text: bxMsg('cbb_items.AT#instCd'),width: 170, flex: 1,dataIndex: 'instCd', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#dstbEnvrnmntCd'),width: 170, flex: 1,dataIndex: 'dstbEnvrnmntCd', style: 'text-align:center', align: 'center'}
                           
                            , {text: bxMsg('cbb_items.AT#dstbEnvrnmntCdCntnt'),width: 300,flex: 3,dataIndex: 'dstbEnvrnmntCdCntnt', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#lastStepYn'),width: 80,flex: 3,dataIndex: 'lastStepYn', style: 'text-align:center', align: 'center'}
                            ,{
	                            text: bxMsg('cbb_items.AT#actvStsCd'),
	                            flex: 1,
	                            dataIndex: 'actvStsCd',
	                            style: 'text-align:center',
	                            align: 'center',
	                            code: 'A0439',
	                            renderer: function (val) {
	                                return val ? bxMsg('cbb_items.CDVAL#A0439' + val) : '';
	                            }
	                        }
                            , {text: bxMsg('cbb_items.AT#lastChngId'),width: 130,flex: 3,dataIndex: 'lastChngId', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#lastChngTmstmp'),width: 150,dataIndex: 'lastChngTmstmp', style: 'text-align:center', align: 'center'
                            	, type: 'date',
                                renderer : function(value) {
                                    return XDate(value).toString('yyyy-MM-dd HH:mm:ss');
                                }
                            }
                            , {
                             	xtype: 'actioncolumn', width: 80, align: 'center',text: "",
                             	items: [
											{
											//  icon: 'images/icon/x-delete-16.png'
											  iconCls : "bw-icon i-25 i-func-trash"
											  , tooltip: bxMsg('tm-layout.delete-field')
											  , handler: function (grid, rowIndex, colIndex, item, e, record) {
												  that.deleteEnvCdList.push(record.data);
												  grid.store.remove(record);
											  }
											}
                             	        ]
                             }
                        ] // end of columns

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
                    that.$el.find(".CAPSV307-envCd-grid").html(that.CAPSV307EnvCdGrid.render({'height': 200}));
                }
                
                

                , resetDetailArea : function() {
                	this.$el.find('#CAPSV307-envCd-table [data-form-param="dstbEnvrnmntCd"]').val("");
                	this.$el.find('#CAPSV307-envCd-table [data-form-param="dstbEnvrnmntCdCntnt"]').val("");
            		this.$el.find('.CAPSV307-envCd-table [data-form-param="lastStepYn"]').prop("checked", false);
            		this.$el.find('.CAPSV307-envCd-table [data-form-param="actvStsCd"]').val("");
                }

                , inquiryEnvCdData: function () {
                	var that = this;
                    var sParam = {};

                    sParam.instCd = $.sessionStorage('headerInstCd');
                   
                    var linkData = {"header": fn_getHeader('CAPSV0060411'), "CaDstbEnvMIO": sParam};

                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                    var tbList = responseData.CaDstbEnvMListIO.tbl;
                                    var totCnt = tbList.length;
                                    if (tbList != null || tbList.length > 0) {
                                        that.CAPSV307EnvCdGrid.setData(tbList);
                                        that.deleteEnvCdList = [];
                                    }
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                } // end


                , clickGrid: function () {

                    var that = this;
                    var selectedRecord = that.CAPSV307EnvCdGrid.grid.getSelectionModel().selected.items[0];

                    if (!selectedRecord) {
                        return;
                    } else {
                    	that.$el.find('.CAPSV307-envCd-table [data-form-param="dstbEnvrnmntCd"]').val(selectedRecord.data.dstbEnvrnmntCd);
                    	that.$el.find('.CAPSV307-envCd-table [data-form-param="dstbEnvrnmntCdCntnt"]').val(selectedRecord.data.dstbEnvrnmntCdCntnt);
                    	that.$el.find('.CAPSV307-envCd-table [data-form-param="actvStsCd"]').val(selectedRecord.data.actvStsCd);
                    	if(selectedRecord.data.lastStepYn == 'Y') {
                            this.$el.find('.CAPSV307-envCd-table [data-form-param="lastStepYn"]').prop('checked', true);
                        } else {
                            this.$el.find('.CAPSV307-envCd-table [data-form-param="lastStepYn"]').prop('checked', false);
                        }
                    }
                }
                
                , saveEnvCdData: function () {
                	var that = this;
                    var sParam = {};
                    sParam.dstbEnvrnmntCd = that.$el.find('.CAPSV307-envCd-table [data-form-param="dstbEnvrnmntCd"]').val();
                    sParam.dstbEnvrnmntCdCntnt = that.$el.find('.CAPSV307-envCd-table [data-form-param="dstbEnvrnmntCdCntnt"]').val();
                    sParam.actvStsCd = that.$el.find('.CAPSV307-envCd-table [data-form-param="actvStsCd"]').val();
                    if(that.$el.find('.CAPSV307-envCd-table [data-form-param="lastStepYn"]').is(":checked")) {
                        sParam.lastStepYn = "Y";
                    }
                    else {
                        sParam.lastStepYn = "N";
                    }
//                    sParam.actvStsCd = '01';
                    sParam.instCd = $.sessionStorage('headerInstCd');
                    if(sParam.dstbEnvrnmntCd == ''){
                		fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbEnvrnmntCd')+"]");
                      	return;
                	}
                    if(sParam.dstbEnvrnmntCdCntnt == ''){
                		fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbEnvrnmntCdCntnt')+"]");
                      	return;
                	}
                    if(sParam.actvStsCd == ''){
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#actvStsCd')+"]");
                    	return;
                    }  
                    var linkData = {"header": fn_getHeader('CAPSV0060412'), "CaDstbEnvMIO": sParam};

                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                	that.inquiryEnvCdData();
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                } // end
                
                ,fn_deleteEnvCdList: function () {
                    var that = this;
                    
                    if(this.deleteEnvCdList.length < 1) {
                		return;
                	}
                	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), this.deleteEnvCdGrid, this);
                }
             // 그리드 삭제
                , deleteEnvCdGrid : function(that) {
                	var tbl = [];
                	var sParam = {};


                	if(that.deleteEnvCdList.length > 0) {
                		$(that.deleteEnvCdList).each(function(idx, data) {
                			var delParam = {};
                			delParam.instCd = $.sessionStorage('headerInstCd');
                			delParam.dstbEnvrnmntCd = data.dstbEnvrnmntCd;
                			delParam.dstbEnvrnmntCdCntnt = data.dstbEnvrnmntCdCntnt;
                            delParam.lastStepYn = data.lastStepYn;
                			tbl.push(delParam);
                		});

                		sParam.tbl = tbl;

                		var linkData = {"header": fn_getHeader("CAPSV0060413"), "CaDstbEnvMListIO": sParam};

                            // ajax호출
                            bxProxy.post(sUrl, JSON.stringify(linkData), {
                                enableLoading: true
                                , success: function (responseData) {
                                    if (fn_commonChekResult(responseData)) {
                                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                    	var tbList = responseData.CaDstbEnvMListIO.tbl;
                                        var totCnt = tbList.length;
                                        if (tbList != null || tbList.length > 0) {
                                            that.CAPSV307EnvCdGrid.setData(tbList);
                                            that.deleteEnvCdList = [];
                                        }
                                    }
                                }   // end of suucess: fucntion
                            }); // end of bxProxy
                	}
                	else {
                		return;
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
                    	that.inquiryEnvCdData();
                    }
                }
                
                , baseGridModal : function() {
                	fn_pageLayerCtrl("#CAPSV307-envCd-grid", this.$el.find("#btn-up-grid"));
                }
                , baseDetailModal : function() {
                	fn_pageLayerCtrl("#CAPSV307-envCd-table", this.$el.find("#btn-detail-modal"));
                }
               
                , exportEnvCdGrid : function() {
                	var that = this;
                	that.CAPSV307EnvCdGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPSV307')+"_"+getCurrentDate("yyyy-mm-dd"));
                }
                
            })
            ; // end of Backbone.View.extend({


        return CAPSV307View;
    } // end of define function
)
; // end of define
