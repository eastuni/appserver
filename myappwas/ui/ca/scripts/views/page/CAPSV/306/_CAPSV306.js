define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPSV/306/_CAPSV306.html'
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
        var CAPSV306View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPSV306-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                	// 검색조건 이벤트
                    'click #btn-target-param-refresh': 'resetParamArea'
                    , 'click #btn-target-param-save': 'saveParamData'
                    , 'click #btn-param-search': 'inquiryParamData'
                    , 'click #btn-CAPSV306-param-delete': 'fn_deleteParamList'
                    , 'click #btn-CAPSV306-param-grid-excel': 'exportParamGrid'
                    	
                    	
            		, 'change .CAPSV306-base-cdNbrTpCd-wrap': 'changeBaseCdNbrTpCd'
					, 'keydown #searchKey' : 'fn_enter'
                }

                , initialize: function (initData) {

                    var that = this;
                    that.that = this;

                    $.extend(that, initData);
                    that.$el.html(that.tpl());

                    that.initData = initData;

                    var deleteParamList = [];
                    // 서브셋그리드영역을 숨긴다.
                    that.$el.find('#CAPSV306-standard-subset-code-grid-area').hide();
                    that.createParamGrid();
                }
                , render: function () {
                	var that = this;
                	// 콤보데이터 로딩
                    var sParam;

                    
                  //배포상태
                    sParam = {};
                    sParam.className = "CAPSV306-param-dstbParmCdwrap";
                    sParam.targetId = "dstbParmCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                    sParam.cdNbr = "A1009";
                    fn_getCodeList(sParam, this);
                    
                    sParam = {};
                    sParam.className = "CAPSV306-server-dstbEnvrnmntCdwrap";
                    sParam.targetId = "dstbEnvrnmntCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                    sParam.cdNbr = "A1035";
                    fn_getCodeList(sParam, this);
                    
                    that.inquiryParamData();
                    return that.$el;
                }
                
                ,createParamGrid : function() {
                	var that = this;

                	that.CAPSV306ParamGrid = new ExtGrid({
                        /* ------------------------------------------------------------ */
                        // 단일탭 그리드 컬럼 정의
                        fields: ['rowIndex', 'dstbParmCd', 'dstbParmVal', 'lastChngId', 'lastChngTmstmp']
                        , id: 'CAPSV306ParamGrid'
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
							,{
                                text: bxMsg('cbb_items.AT#dstbParmCd'),
                                flex: 1,
                                dataIndex: 'dstbParmCd',
                                style: 'text-align:center',
                                align: 'center',
                                code: 'A1009',
                                renderer: function (val) {
                                    return val ? bxMsg('cbb_items.CDVAL#A1009' + val) : '';
                                }
                            }
                            , {text: bxMsg('cbb_items.AT#dstbParmVal'),width: 170, flex: 1,dataIndex: 'dstbParmVal', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#lastChngId'),width: 130,flex: 1,dataIndex: 'lastChngId', style: 'text-align:center', align: 'center'}
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
												  that.deleteParamList.push(record.data);
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
                                    that.clickParamGrid();
                                }
                            }
                        }
                    });
                    // 단일탭 그리드 렌더
                    that.$el.find(".CAPSV306-param-grid").html(that.CAPSV306ParamGrid.render({'height': 200}));
                }
                   
                , resetParamArea : function() {
            		this.$el.find('#CAPSV306-param-table [data-form-param="dstbParmCd"] option:eq(0)').attr("selected", "selected");
                	this.$el.find('#CAPSV306-param-table [data-form-param="dstbParmVal"]').val("");
                }
                
                , inquiryParamData: function () {
                	var that = this;
                    var sParam = {};

                    sParam.actvStsCd = "01";
                   
                    var linkData = {"header": fn_getHeader('CAPSV0060409'), "CaDstbParamMIO": sParam};

                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                    var tbList = responseData.CaDstbParamMListIO.tbl;
                                    var totCnt = tbList.length;
                                    if (tbList != null || tbList.length > 0) {
                                        that.CAPSV306ParamGrid.setData(tbList);
                                        that.deleteParamList = [];
                                    }
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                } // end

                , clickParamGrid: function () {

                    var that = this;
                    var selectedRecord = that.CAPSV306ParamGrid.grid.getSelectionModel().selected.items[0];

                    if (!selectedRecord) {
                        return;
                    } else {
                    	that.$el.find('.CAPSV306-param-table [data-form-param="dstbParmCd"]').val(selectedRecord.data.dstbParmCd);
                    	that.$el.find('.CAPSV306-param-table [data-form-param="dstbParmVal"]').val(selectedRecord.data.dstbParmVal);
                    	
                    }
                }
                
                , saveParamData: function () {
                	var that = this;
                    var sParam = {};
                    sParam.actvStsCd = '01';
                    sParam.dstbParmCd = that.$el.find('.CAPSV306-param-table [data-form-param="dstbParmCd"]').val();
                    if(sParam.dstbParmCd == ''){
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbParmCd')+"]");
                    	return;
                    }
                    sParam.dstbParmVal = that.$el.find('.CAPSV306-param-table [data-form-param="dstbParmVal"]').val();
                    if(sParam.dstbParmVal == ''){
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbParmVal')+"]");
                    	return;
                    }
                    var linkData = {"header": fn_getHeader('CAPSV0060407'), "CaDstbTblMIO": sParam};

                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                	that.inquiryParamData();
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                } // end
                
                ,fn_deleteParamList: function () {
                    var that = this;
                    
                    if(this.deleteParamList.length < 1) {
                		return;
                	}
                	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), this.deleteParamGrid, this);
                }
             // 그리드 삭제
                , deleteParamGrid : function(that) {
                	var tbl = [];
                	var sParam = {};

                	if(that.deleteParamList.length > 0) {
                		$(that.deleteParamList).each(function(idx, data) {
                			var delParam = {};
                			delParam.dstbParmCd = data.dstbParmCd;
                			delParam.dstbParmVal = data.dstbParmVal;
                			tbl.push(delParam);
                		});

                		sParam.tbl = tbl;

                		var linkData = {"header": fn_getHeader("CAPSV0060408"), "CaDstbParamMListIO": sParam};

                            // ajax호출
                            bxProxy.post(sUrl, JSON.stringify(linkData), {
                                enableLoading: true
                                , success: function (responseData) {
                                    if (fn_commonChekResult(responseData)) {
                                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                        that.deleteParamList = [];
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
                    	that.inquiryParamData();
                    }
                }
                
                , exportParamGrid : function() {
                	var that = this;
                	that.CAPSV306ParamGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPSV306')+"_"+getCurrentDate("yyyy-mm-dd"));
                }
                
                
            })
            ; // end of Backbone.View.extend({


        return CAPSV306View;
    } // end of define function
)
; // end of define
