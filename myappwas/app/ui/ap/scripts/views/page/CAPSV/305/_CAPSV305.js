define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPSV/305/_CAPSV305.html'
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
        var CAPSV305View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPSV305-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                	// 검색조건 이벤트
                    'click #btn-table-search': 'inquiryTableData'
                    , 'click #btn-base-reset': 'resetTableBaseArea'
                    , 'click #btn-target-table-save': 'saveTableData'
                    , 'click #btn-table-grid': 'tableGridModal'
                    , 'click #btn-base-search-modal': 'tableBaseModal'
                    	
                    	
                    , 'click #btn-target-table-modal': 'tableDetailModal'
                    , 'click #btn-target-table-refresh': 'resetTableDetailArea'
                    , 'click #btn-CAPSV305-table-grid-excel': 'exportTableGrid'
                    , 'click #btn-CAPSV305-table-delete': 'fn_deleteTableList'
                    , 'click #btn-CAPSV305-table-list-search': 'fn_inquiryColumnList'
                    	
            		, 'change .CAPSV305-base-cdNbrTpCd-wrap': 'changeBaseCdNbrTpCd'
					, 'keydown #searchKey' : 'fn_enter'
                }

                , initialize: function (initData) {

                    var that = this;
                    that.that = this;

                    $.extend(that, initData);
                    that.$el.html(that.tpl());

                    that.initData = initData;

                    var deleteTableList = [];
                    var currentPkArry = []
                    var currentDkArry = []
                    
                    // 서브셋그리드영역을 숨긴다.
                    that.$el.find('#CAPSV305-standard-subset-code-grid-area').hide();
                    that.createTableGrid();
                    that.createTableColumnsGrid();
                }
                , render: function () {
                	var that = this;
                	// 콤보데이터 로딩
                    var sParam;

                    
                  //배포상태
                    sParam = {};
                    sParam.className = "CAPSV305-param-dstbSetDscdwrap";
                    sParam.targetId = "dstbSetDscd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                    sParam.cdNbr = "A1009";
                    fn_getCodeList(sParam, this);
                    
                    sParam = {};
                    sParam.className = "CAPSV305-server-dstbEnvrnmntCdwrap";
                    sParam.targetId = "dstbEnvrnmntCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                    sParam.cdNbr = "A1035";
                    fn_getCodeList(sParam, this);
                    
                  //활동상태코드
                    sParam = {};
                    sParam.className = "CAPSV305-table-actvStsCd";
                    sParam.targetId = "actvStsCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                    sParam.cdNbr = "A0439";
                    fn_getCodeList(sParam, this);
                    
                    that.inquiryTableData();
                    return that.$el;
                }
                
                , createTableGrid : function() {
                	var that = this;

                	that.CAPSV305TableGrid = new ExtGrid({
                        /* ------------------------------------------------------------ */
                        // 단일탭 그리드 컬럼 정의
                        fields: ['rowIndex', 'dstbTblId', 'lgclTblNm', 'pkVal', 'dplctnKeyValCntnt','initzCacheKeyVal','actvStsCd', 'lastChngId', 'lastChngTmstmp']
                        , id: 'CAPSV305TableGrid'
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
                            , {text: bxMsg('cbb_items.AT#dstbTblId'),width: 170, flex: 1,dataIndex: 'dstbTblId', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#lgclTblNm'),width: 170, flex: 1,dataIndex: 'lgclTblNm', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#pkVal'),width: 200,flex: 1,dataIndex: 'pkVal', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#dplctnKeyValCntnt'),width: 200,flex: 1,dataIndex: 'dplctnKeyValCntnt', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#initzCacheKeyVal'),width: 200,flex: 1,dataIndex: 'initzCacheKeyVal', style: 'text-align:center', align: 'center'}
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
												  that.deleteTableList.push(record.data);
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
                                    that.clickTableGrid();
                                }
                            }
                        }
                    });
                    // 단일탭 그리드 렌더
                    that.$el.find(".CAPSV305-table-grid").html(that.CAPSV305TableGrid.render({'height': 200}));
                }
                , createTableColumnsGrid : function() {
                	var that = this;

                	that.CAPSV305TableColumnsGrid = new ExtGrid({
                        /* ------------------------------------------------------------ */
                        // 단일탭 그리드 컬럼 정의
                        fields: ['rowIndex', 'columnId', 'columnNm', 'pkVal', 'dplctnKeyValCntnt','columnKeyVal']
                        , id: 'CAPSV305TableColumnsGrid'
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
                            , {text: bxMsg('cbb_items.AT#columnId'),width: 170, flex: 1,dataIndex: 'columnId', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#columnNm'),width: 170, flex: 1,dataIndex: 'columnNm', style: 'text-align:center', align: 'center'}
                            ,{
                                text: bxMsg('cbb_items.AT#pkVal'),
                                flex: 1,
                                xtype: 'checkcolumn',
                                dataIndex: 'pkVal',
                                style: 'text-align:center',
                                align: 'center',
                                stopSelection: false
	                            , listeners: {
	                                click: function (_this, cell, rowIndex, eOpts) {
	                                	var currentRecord = that.CAPSV305TableColumnsGrid.store.getAt(rowIndex)
	                                    changedChecked = !currentRecord.get('pkVal');
	                                    currentRecord.set('pkVal', changedChecked ? 'Y' : 'N');
	                                }
	                            }
                            }
                            ,{
                                text: bxMsg('cbb_items.AT#dplctnKeyValCntnt'),
                                flex: 1,
                                xtype: 'checkcolumn',
                                dataIndex: 'dplctnKeyValCntnt',
                                style: 'text-align:center',
                                align: 'center',
                                stopSelection: false
                                , listeners: {
	                                click: function (_this, cell, rowIndex, eOpts) {
	                                	var currentRecord = that.CAPSV305TableColumnsGrid.store.getAt(rowIndex)
	                                    changedChecked = !currentRecord.get('dplctnKeyValCntnt');
	                                    currentRecord.set('dplctnKeyValCntnt', changedChecked ? 'Y' : 'N');
	                                }
	                            }                 
                            }
                            , {dataIndex: 'columnKeyVal', hidden : true}
//                            , {text: bxMsg('cbb_items.AT#pkVal'),width: 200,flex: 1,dataIndex: 'pkVal', style: 'text-align:center', align: 'center'}
//                            , {text: bxMsg('cbb_items.AT#dplctnKeyValCntnt'),width: 200,flex: 1,dataIndex: 'dplctnKeyValCntnt', style: 'text-align:center', align: 'center'}
                        ] // end of columns

                        , listeners: {
                            click: {
                                element: 'body'
                                , fn: function (event) {
                                    //더블클릭시 이벤트 발생
                                    
                                }
                            }
                        }
                    });
                    // 단일탭 그리드 렌더
                    that.$el.find(".CAPSV305-table-columns-grid").html(that.CAPSV305TableColumnsGrid.render({'height': 200}));
                }
                
                , resetTableDetailArea : function() {
                	var that = this;
                	that.$el.find('.CAPSV305-target-table [data-form-param="dstbTblId"]').val("");
                	that.$el.find('.CAPSV305-target-table [data-form-param="dstbTblId"]').attr("readonly", false);
                	
                	that.$el.find('.CAPSV305-target-table [data-form-param="lgclTblNm"]').val("");
                	that.$el.find('.CAPSV305-target-table [data-form-param="initzCacheKeyVal"]').val("");
                	that.$el.find('.CAPSV305-target-table [data-form-param="actvStsCd"]').val("");
                	
                	that.CAPSV305TableColumnsGrid.resetData();
                }
                
                , resetTableBaseArea : function() {
                	var that = this;
                	that.$el.find('.CAPSV305-base-table [data-form-param="dstbTblId"]').val("");                	
                	that.$el.find('.CAPSV305-base-table [data-form-param="lgclTblNm"]').val("");

                	that.resetTableDetailArea();
                	that.CAPSV305TableGrid.resetData();
                }
                
                , inquiryTableData: function () {
                	var that = this;
                    var sParam = {};

//                    sParam.actvStsCd = "01";
                    sParam.dstbTblId = that.$el.find('.CAPSV305-base-table [data-form-param="dstbTblId"]').val().toUpperCase();
                    sParam.lgclTblNm = that.$el.find('.CAPSV305-base-table [data-form-param="lgclTblNm"]').val();
                   
                    var linkData = {"header": fn_getHeader('CAPSV0060402'), "CaDstbTblMIO": sParam};

                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                    var tbList = responseData.CaDstbTblMListOut.tbl;
                                    var totCnt = tbList.length;
                                    if (tbList != null || tbList.length > 0) {
                                        that.CAPSV305TableGrid.setData(tbList);
                                        that.deleteTableList = [];
                                    }
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                } // end
                , fn_inquiryColumnList: function () {
                	this.currentPkArry = [];
                	this.currentDkArry = [];
                    
                	this.fn_inquirySysTableList();
                }
                
                , fn_inquirySysTableList: function () {
                	var that = this;
                    var sParam = {};
                    sParam.tblId = that.$el.find('.CAPSV305-target-table [data-form-param="dstbTblId"]').val();
                    
                    if(sParam.tblId == ''){
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbTblId')+"]");
                    	return;
                    }
                    
                    var linkData = {"header": fn_getHeader('CAPSV0060410'), "CaDstbSystemColumnIO": sParam};

                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                    var tbList = responseData.CaDstbSystemColumnOut.tbl;
                                    var totCnt = tbList.length;
//                                    var tableNm = '';
                                    if (tbList != null && tbList.length > 0) {
                                    	
                                    	$.each(tbList,function(index,value){
                                    		if(that.currentPkArry && that.currentPkArry.length > 0){
	                                    		if(that.currentPkArry.indexOf(value.columnId) >= 0){
	                                    			value.pkVal=true;
	                                    		} else {
	                                    			value.pkVal=false;
	                                    		}
                                    		} else {
                                    			if(value.columnKeyVal == 'PRI'){
                                    				value.pkVal=true;
                                    			} else {
	                                    			value.pkVal=false;
	                                    		}
                                    		}
                                    		if(that.currentDkArry && that.currentDkArry.indexOf(value.columnId) >= 0){
                                    			value.dplctnKeyValCntnt=true;
                                    		} else {
                                    			value.dplctnKeyValCntnt=false;
                                    		}
                                        });
                                    	
                                    	
                                    	that.CAPSV305TableColumnsGrid.setData(tbList);
//                                       var pkList = '';
//                                       var cnt = 0;
//                                    	tableNm = tbList[0].tblNm;
//                                       that.$el.find('.CAPSV305-target-table [data-form-param="pkVal"]').val(pkList);
                                       if(that.$el.find('.CAPSV305-target-table [data-form-param="lgclTblNm"]').val() == ''){
                                    	  that.$el.find('.CAPSV305-target-table [data-form-param="lgclTblNm"]').val(tbList[0].tblNm);
                                       }
                                    } else {
                                    	fn_alertMessage("",bxMsg("cbb_err_msg.AAPCME0526"));
                                    }
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                } // end
                
                
                , clickTableGrid: function () {

                    var that = this;
                    var selectedRecord = that.CAPSV305TableGrid.grid.getSelectionModel().selected.items[0];

                    if (!selectedRecord) {
                        return;
                    } else {
                    	that.$el.find('.CAPSV305-target-table [data-form-param="dstbTblId"]').val(selectedRecord.data.dstbTblId);
                    	that.$el.find('.CAPSV305-target-table [data-form-param="dstbTblId"]').attr("readonly", true); 
                    	
                    	that.$el.find('.CAPSV305-target-table [data-form-param="lgclTblNm"]').val(selectedRecord.data.lgclTblNm);
//                    	that.$el.find('.CAPSV305-target-table [data-form-param="dplctnKeyValCntnt"]').val(selectedRecord.data.dplctnKeyValCntnt);
                    	
//                    	that.$el.find('.CAPSV305-target-table [data-form-param="pkVal"]').val(selectedRecord.data.pkVal);
                    	that.$el.find('.CAPSV305-target-table [data-form-param="initzCacheKeyVal"]').val(selectedRecord.data.initzCacheKeyVal);
                    	that.$el.find('.CAPSV305-target-table [data-form-param="actvStsCd"]').val(selectedRecord.data.actvStsCd);
                    	var pkVal = selectedRecord.data.pkVal;
                    	if(pkVal != ''){
                    		that.currentPkArry = pkVal.split(',');
                    	}
                    	var dplctnKeyValCntnt = selectedRecord.data.dplctnKeyValCntnt;
                    	if(dplctnKeyValCntnt != ''){
                    		that.currentDkArry = dplctnKeyValCntnt.split(',');
                    	}
                    	
                    	that.fn_inquirySysTableList();
                    }
                }
                
                , saveTableData: function () {
                	var that = this;
                    var sParam = {};
                    sParam.dstbTblId = that.$el.find('.CAPSV305-target-table [data-form-param="dstbTblId"]').val();
                    if(sParam.dstbTblId == ''){
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbTblId')+"]");
                    	return;
                    }
                    sParam.lgclTblNm = that.$el.find('.CAPSV305-target-table [data-form-param="lgclTblNm"]').val();
                    
                    sParam.pkVal = that.$el.find('.CAPSV305-target-table [data-form-param="pkVal"]').val();
                    sParam.dplctnKeyValCntnt = that.$el.find('.CAPSV305-target-table [data-form-param="dplctnKeyValCntnt"]').val();
                    sParam.actvStsCd = that.$el.find('.CAPSV305-target-table [data-form-param="actvStsCd"]').val();
                    
                    if(that.$el.find('.CAPSV305-target-table [data-form-param="lgclTblNm"]').val().length > 50){
                    	fn_alertMessage("", bxMsg('cbb_err_msg.AUICUE0003') + ' ['+bxMsg('cbb_items.AT#lgclTblNm') +':50 byte]');  
                    	return;
                    }
                    
                    var allData = that.CAPSV305TableColumnsGrid.getAllData(); // 변경된 데이터 가져오기
                    var gridData = [];

                    if (allData.length > 0) {
                    	var appendPkVal = '';
                    	var appendDkVal = '';
                        for (var idx in allData) {
                            var columnId = allData[idx].columnId;
                            var pkVal = allData[idx].pkVal;
                            var dplctnKeyValCntnt = allData[idx].dplctnKeyValCntnt;
                            if(pkVal == true){
                            	if(appendPkVal != ''){
                            		appendPkVal += ',';
                            	}
                            	appendPkVal += columnId;
                            }
                            if(dplctnKeyValCntnt == true){
                            	if(appendDkVal != ''){
                            		appendDkVal += ',';
                            	}
                            	appendDkVal += columnId;
                            }
//                            fields: ['rowIndex', 'columnId', 'columnNm', 'pkVal', 'dplctnKeyValCntnt']
                        }
                        
                        sParam.pkVal = appendPkVal;
                        sParam.dplctnKeyValCntnt = appendDkVal;
                    }
                    
                    
                    sParam.initzCacheKeyVal = that.$el.find('.CAPSV305-target-table [data-form-param="initzCacheKeyVal"]').val();
                    if(sParam.lgclTblNm == ''){
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#lgclTblNm')+"]");
                    	return;
                    }  
                    if(sParam.pkVal == ''){
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#pkVal')+"]");
                    	return;
                    }
                    if(sParam.dplctnKeyValCntnt == ''){
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dplctnKeyValCntnt')+"]");
                    	return;
                    }
                    
                    if(sParam.actvStsCd == ''){
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#actvStsCd')+"]");
                    	return;
                    }  
                    
                    var linkData = {"header": fn_getHeader('CAPSV0060404'), "CaDstbTblMIO": sParam};

                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                	that.inquiryTableData();
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                } // end
                
                ,fn_deleteTableList: function () {
                    var that = this;
                    
                    if(this.deleteTableList.length < 1) {
                		return;
                	}
                	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), this.deleteTableGrid, this);
                }
             // 그리드 삭제
                , deleteTableGrid : function(that) {
                	var tbl = [];
                	var sParam = {};


                	if(that.deleteTableList.length > 0) {
                		$(that.deleteTableList).each(function(idx, data) {
                			var delParam = {};
                			delParam.dstbTblId = data.dstbTblId;
                			delParam.lgclTblNm = data.lgclTblNm;
                            delParam.pkVal = data.pkVal;
                            delParam.dplctnKeyValCntnt = data.dplctnKeyValCntnt;
                            
                			tbl.push(delParam);
                		});

                		sParam.tbl = tbl;

                		var linkData = {"header": fn_getHeader("CAPSV0060406"), "CaDstbTblMListIn": sParam};

                            // ajax호출
                            bxProxy.post(sUrl, JSON.stringify(linkData), {
                                enableLoading: true
                                , success: function (responseData) {
                                    if (fn_commonChekResult(responseData)) {
                                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                    	var tbList = responseData.CaDstbTblMListOut.tbl;
                                        var totCnt = tbList.length;
                                        if (tbList != null || tbList.length > 0) {
                                            that.CAPSV305TableGrid.setData(tbList);
                                            that.deleteTableList = [];
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
                    	that.inquiryTableData();
                    }
                }
                
                , tableBaseModal : function() {
                	fn_pageLayerCtrl("#CAPSV305-base-table", this.$el.find("#btn-base-search-modal"));
                }
                , tableGridModal : function() {
                	fn_pageLayerCtrl("#CAPSV305-table-grid", this.$el.find("#btn-table-grid"));
                }
                , tableDetailModal : function() {
                	fn_pageLayerCtrl("#CAPSV305-target-table", this.$el.find("#btn-target-table-modal"));
                }
               
                , exportTableGrid : function() {
                	var that = this;
                	that.CAPSV305TableGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPSV305')+"_"+getCurrentDate("yyyy-mm-dd"));
                }
               
            })
            ; // end of Backbone.View.extend({


        return CAPSV305View;
    } // end of define function
)
; // end of define
