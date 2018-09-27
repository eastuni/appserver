define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPSV/303/_CAPSV303.html'
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
        var CAPSV303View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPSV303-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                	// 검색조건 이벤트
                    'click #btn-base-reset': 'resetBaseArea'
                    , 'click #btn-base-search': 'inquiryServerData'
                    , 'click #btn-detail-save': 'saveServerData'
                	, 'click #btn-up-grid': 'baseGridModal'
                	, 'click #btn-detail-modal': 'baseDetailModal'
                    , 'click #btn-detail-refresh': 'resetDetailArea'
                    , 'click #btn-CAPSV303-grid-excel': 'exportServerGrid'
                    , 'click #btn-CAPSV303-grid-delete': 'fn_deleteServerList'
                    
					, 'keydown #searchKey' : 'fn_enter'
                }

                , initialize: function (initData) {

                    var that = this;
                    that.that = this;

                    $.extend(that, initData);
                    that.$el.html(that.tpl());

                    that.initData = initData;

                    var deleteServerList = [];
                    // 서브셋그리드영역을 숨긴다.
                    that.createServerGrid();
                }
                , render: function () {
                	var that = this;
                	// 콤보데이터 로딩
                    var sParam;

                    
                  //배포상태
                    sParam = {};
                    sParam.className = "CAPSV303-param-dstbSetDscdwrap";
                    sParam.targetId = "dstbSetDscd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                    sParam.cdNbr = "A1009";
                    fn_getCodeList(sParam, this);
                    
                    sParam = {};
                    sParam.className = "CAPSV303-server-dstbEnvrnmntCdwrap";
                    sParam.targetId = "dstbEnvrnmntCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                    sParam.cdNbr = "A1035";
                    fn_getCodeList(sParam, this);
                    
                    //활동상태코드
                    sParam = {};
                    sParam.className = "CAPSV303-server-actvStsCd";
                    sParam.targetId = "actvStsCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                    sParam.cdNbr = "A0439";
                    fn_getCodeList(sParam, this);
                    
                    that.inquiryServerData();
                    return that.$el;
                }
                , createServerGrid : function() {
                	var that = this;

                	that.CAPSV303ServerGrid = new ExtGrid({
                        /* ------------------------------------------------------------ */
                        // 단일탭 그리드 컬럼 정의
                        fields: ['rowIndex', 'dstbSrvrId', 'dstbSrvrNm','dstbEnvrnmntCd', 'lastStepYn', 'dstbTrgtSrvrUrl','actvStsCd', 'lastChngId', 'lastChngTmstmp']
                        , id: 'CAPSV303ServerGrid'
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
                            , {text: bxMsg('cbb_items.AT#dstbSrvrId'),width: 170, flex: 1,dataIndex: 'dstbSrvrId', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#dstbSrvrNm'),width: 170, flex: 1,dataIndex: 'dstbSrvrNm', style: 'text-align:center', align: 'center'}
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
                            , {text: bxMsg('cbb_items.AT#lastStepYn'),width: 80,flex: 3,dataIndex: 'lastStepYn', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#dstbTrgtSrvrUrl'),width: 300,flex: 3,dataIndex: 'dstbTrgtSrvrUrl', style: 'text-align:center', align: 'center'}
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
												  that.deleteServerList.push(record.data);
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
                    that.$el.find(".CAPSV303-server-grid").html(that.CAPSV303ServerGrid.render({'height': 200}));
                }
                
                

                , resetDetailArea : function() {
                	this.$el.find('#CAPSV303-server-table [data-form-param="dstbSrvrId"]').val("");
                	this.$el.find('#CAPSV303-server-table [data-form-param="dstbSrvrNm"]').val("");
//            		this.$el.find('.CAPSV303-server-table [data-form-param="lastStepYn"]').prop("checked", false);
                	this.$el.find('#CAPSV303-server-table [data-form-param="dstbTrgtSrvrUrl"]').val("");
                	this.$el.find('.CAPSV303-server-table [data-form-param="actvStsCd"]').val("");
                }

                , inquiryServerData: function () {
                	var that = this;
                    var sParam = {};
                    
//                    sParam.actvStsCd = "01";
                   
                    var linkData = {"header": fn_getHeader('CAPSV0060401'), "CaDstbSrvrMIO": sParam};

                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                    var tbList = responseData.CaDstbSrvrMListOut.tbl;
                                    var totCnt = tbList.length;
                                    if (tbList != null || tbList.length > 0) {
                                        that.CAPSV303ServerGrid.setData(tbList);
                                        that.deleteServerList = [];
                                    }
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                } // end


                , clickGrid: function () {

                    var that = this;
                    var selectedRecord = that.CAPSV303ServerGrid.grid.getSelectionModel().selected.items[0];

                    if (!selectedRecord) {
                        return;
                    } else {
                    	that.$el.find('.CAPSV303-server-table [data-form-param="dstbSrvrId"]').val(selectedRecord.data.dstbSrvrId);
                    	
                    	that.$el.find('.CAPSV303-server-table [data-form-param="dstbSrvrNm"]').val(selectedRecord.data.dstbSrvrNm);
                    	that.$el.find('.CAPSV303-server-table [data-form-param="dstbTrgtSrvrUrl"]').val(selectedRecord.data.dstbTrgtSrvrUrl);
                    	that.$el.find('.CAPSV303-server-table [data-form-param="dstbEnvrnmntCd"]').val(selectedRecord.data.dstbEnvrnmntCd);
                    	that.$el.find('.CAPSV303-server-table [data-form-param="actvStsCd"]').val(selectedRecord.data.actvStsCd);
//                        if(selectedRecord.data.lastStepYn == 'Y'){
//                        	that.$el.find('.CAPSV303-server-table [data-form-param="lastStepYn"]').prop("checked", true);
//                        } else {
//                        	that.$el.find('.CAPSV303-server-table [data-form-param="lastStepYn"]').prop("checked", false);
//                        }
                    }
                }
                
                , saveServerData: function () {
                	var that = this;
                    var sParam = {};
                    sParam.dstbSrvrId = that.$el.find('.CAPSV303-server-table [data-form-param="dstbSrvrId"]').val();
                    sParam.dstbSrvrNm = that.$el.find('.CAPSV303-server-table [data-form-param="dstbSrvrNm"]').val();
                    
//                    var lastStepYn = that.$el.find('.CAPSV303-server-table [data-form-param="lastStepYn"]').prop("checked");
//                    if(lastStepYn){
//                    	sParam.lastStepYn = "Y";
//                    } else {
//                    	sParam.lastStepYn = "N";
//                    }
                    sParam.dstbTrgtSrvrUrl = that.$el.find('.CAPSV303-server-table [data-form-param="dstbTrgtSrvrUrl"]').val();
                    sParam.dstbEnvrnmntCd = that.$el.find('.CAPSV303-server-table [data-form-param="dstbEnvrnmntCd"]').val();
                    sParam.actvStsCd = that.$el.find('.CAPSV303-server-table [data-form-param="actvStsCd"]').val();
                    
                    if(sParam.dstbSrvrNm == ''){
                		fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbSrvrNm')+"]");
                      	return;
                	}
                    if(sParam.dstbTrgtSrvrUrl == ''){
                		fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbTrgtSrvrUrl')+"]");
                      	return;
                	}
                    if(sParam.dstbEnvrnmntCd == ''){
                		fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbEnvrnmntCd')+"]");
                      	return;
                	}
                    if(sParam.actvStsCd == ''){
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#actvStsCd')+"]");
                    	return;
                    }  
                    var linkData = {"header": fn_getHeader('CAPSV0060403'), "CaDstbSrvrMIO": sParam};

                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                	that.inquiryServerData();
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                } // end
                
                ,fn_deleteServerList: function () {
                    var that = this;
                    
                    if(this.deleteServerList.length < 1) {
                		return;
                	}
                	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), this.deleteServerGrid, this);
                }
             // 그리드 삭제
                , deleteServerGrid : function(that) {
                	var tbl = [];
                	var sParam = {};


                	if(that.deleteServerList.length > 0) {
                		$(that.deleteServerList).each(function(idx, data) {
                			var delParam = {};
                			delParam.dstbSrvrId = data.dstbSrvrId;
                			delParam.dstbSrvrNm = data.dstbSrvrNm;
//                            delParam.lastStepYn = data.lastStepYn;
                            delParam.dstbTrgtSrvrUrl = data.dstbTrgtSrvrUrl;
                			tbl.push(delParam);
                		});

                		sParam.tbl = tbl;

                		var linkData = {"header": fn_getHeader("CAPSV0060405"), "CaDstbSrvrMListIn": sParam};

                            // ajax호출
                            bxProxy.post(sUrl, JSON.stringify(linkData), {
                                enableLoading: true
                                , success: function (responseData) {
                                    if (fn_commonChekResult(responseData)) {
                                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                    	var tbList = responseData.CaDstbSrvrMListOut.tbl;
                                        var totCnt = tbList.length;
                                        if (tbList != null || tbList.length > 0) {
                                            that.CAPSV303ServerGrid.setData(tbList);
                                            that.deleteServerList = [];
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
                    	that.inquiryServerData();
                    }
                }
                
                , baseGridModal : function() {
                	fn_pageLayerCtrl("#CAPSV303-server-grid", this.$el.find("#btn-up-grid"));
                }
                , baseDetailModal : function() {
                	fn_pageLayerCtrl("#CAPSV303-server-table", this.$el.find("#btn-detail-modal"));
                }
               
                , exportServerGrid : function() {
                	var that = this;
                	that.CAPSV303ServerGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPSV303')+"_"+getCurrentDate("yyyy-mm-dd"));
                }
                
            })
            ; // end of Backbone.View.extend({


        return CAPSV303View;
    } // end of define function
)
; // end of define
