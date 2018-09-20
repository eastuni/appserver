define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPCA/003/_CAPCA003.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
    ]
    , function (
    	  config
        , tpl
        , ExtGrid
        , commonInfo
        ) {
        /**
         * Backbone
         */
        var CAPCA003View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPCA003-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                	// 검색조건 이벤트
                    'click #btn-table-search': 'inquiryTableData'
                    , 'click #btn-base-reset': 'resetTableBaseArea'
                    , 'click #btn-table-grid-modal': 'tableGridModal'
                    , 'click #btn-base-search-modal': 'tableBaseModal'
                    , 'click #btn-target-table-modal': 'tableDetailModal'
                    , 'click #btn-CAPCA003-dstbCtvdRslt': 'moveCAPCA001'
                    , 'click #btn-target-grid-excute': 'excuteDstbCtvd'
                            	
					, 'keydown #searchKey' : 'fn_enter'
                }

                , initialize: function (initData) {

                    var that = this;

                    $.extend(that, initData);
                    that.$el.html(that.tpl());

                    that.initData = initData;

                    var deleteTableList = [];
                    that.saveList = [];
                    
                    // 서브셋그리드영역을 숨긴다.
                    that.$el.find('#CAPCA003-standard-subset-code-grid-area').hide();
                    that.createTableGrid();
                    
                    // 조회 화면이기에 입력부분은 제외한다.
                	that.$el.find('.CAPCA003-target-table [data-form-param="dstbTblId"]').attr("readonly", true); 
                	that.$el.find('.CAPCA003-target-table [data-form-param="lgclTblNm"]').attr("readonly", true); 
                	that.$el.find('.CAPCA003-target-table [data-form-param="dstbCtvdTrgtTblYn"]').attr("readonly", true); 
                	that.$el.find('.CAPCA003-target-table [data-form-param="dtoClassNm"]').attr("readonly", true); 
                	that.$el.find('.CAPCA003-target-table [data-form-param="dstbCtvdClassNm"]').attr("readonly", true); 
                	that.$el.find('.CAPCA003-target-table [data-form-param="dstbCtvdPckgNm"]').attr("readonly", true); 
                	
                }
                , render: function () {
                	var that = this;
                	// 콤보데이터 로딩
                    var sParam;

                    
                  //배포상태
                    sParam = {};
                    sParam.className = "CAPCA003-param-dstbSetDscdwrap";
                    sParam.targetId = "dstbSetDscd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                    sParam.cdNbr = "A1009";
                    fn_getCodeList(sParam, this);
                    
                    sParam = {};
                    sParam.className = "CAPCA003-server-dstbEnvrnmntCdwrap";
                    sParam.targetId = "dstbEnvrnmntCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                    sParam.cdNbr = "A1035";
                    fn_getCodeList(sParam, this);
                    
                  //활동상태코드
                    sParam = {};
                    sParam.className = "CAPCA003-table-actvStsCd";
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

                	that.CAPCA003TableGrid = new ExtGrid({
                        /* ------------------------------------------------------------ */
                        // 단일탭 그리드 컬럼 정의
                        fields: ['rowIndex', 'useYn', 'dstbTblId', 'lgclTblNm', 
                                 'dstbCtvdTrgtTblYn', 'dtoClassNm', 'dstbCtvdClassNm', 'dstbCtvdPckgNm', 
                                 'lastChngId', 'lastChngTmstmp',
                		{
                            name: 'checkUseYn',
                            type: 'boolean',
                            convert: function (value, record) {
                                return record.get('useYn') === 'Y';
                                ;
                            }
                        },
                        { name : 'flagTp',
                            type : 'text'
                        }]    
                        , id: 'CAPCA003TableGrid'
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
							},
	                        {
	                            text: bxMsg('cbb_items.AT#useYn')
	                            ,flex: 1
	                            ,dataIndex: 'checkUseYn'
	                            ,style: 'text-align:center'
	                            ,align: 'center'
	                        	,xtype: 'checkcolumn'
	                        	,editor: {
	                                     xtype: 'checkbox',
	                                     cls: 'x-grid-checkheader-editor'
	                        	}
	                            ,columntype: 'checkbox'
	                        	, stopSelection: false
	                        	,header : '<input type="checkbox" />' + bxMsg('cbb_items.SCRNITM#B_run')
	                            ,listeners: 
	                                  {
	                                click: function (_this, cell, rowIndex, eOpts) {
	                                    var currentRecord = that.CAPCA003TableGrid.store.getAt(rowIndex),
	                                        changedChecked = !currentRecord.get('checkUseYn');
	                                    currentRecord.set('useYn', changedChecked ? 'Y' : 'N');
	                                    currentRecord.set('checkUseYn', changedChecked);
	                                    that.CAPCA003TableGrid.store.getAt(rowIndex).set('flagTp', 'Y');
	                                },
	                                headerclick: function(header, column, e, t,eOpts) {
	                                    console.log(that.CAPCA003TableGrid.store);
	                                    var selections = that.CAPCA003TableGrid.store.getRange(),
	                                        i = 0,
	                                        len = selections.length;


	                                    for (; i < len; i++) {
	                                    	 if( e.target.checked ){
	                                    		 if( e.target.checked === ( that.CAPCA003TableGrid.store.getAt(i).data.useYn==='Y')){
	                                    			 that.CAPCA003TableGrid.store.getAt(i).set('flagTp', '');
	                                    		 }else{
	                                                 that.CAPCA003TableGrid.store.getAt(i).set('useYn', 'Y');
	                                                 that.CAPCA003TableGrid.store.getAt(i).set('checkUseYn', 'Y'); 
	                                              	 that.CAPCA003TableGrid.store.getAt(i).set('flagTp', 'Y');
	                                    		 }
	                                    	 }else{
	                                    		 if( !e.target.checked === ( that.CAPCA003TableGrid.store.getAt(i).data.useYn==='N')){
	                                    			 that.CAPCA003TableGrid.store.getAt(i).set('flagTp', '');
	                                    		 }else{
	                                        		 that.CAPCA003TableGrid.store.getAt(i).set('useYn', 'N');
	                                                 that.CAPCA003TableGrid.store.getAt(i).set('checkUseYn', 'N');
	                                    			 that.CAPCA003TableGrid.store.getAt(i).set('flagTp', 'Y');
	                                    		 }
	                                    	 }
	                                    }
	                               }
	                           }
	                        }
                            , {text: bxMsg('cbb_items.AT#dstbTblId'),width: 170, flex: 1,dataIndex: 'dstbTblId', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#lgclTblNm'),width: 170, flex: 1,dataIndex: 'lgclTblNm', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#dstbCtvdTrgtTblYn'),width: 100,flex: 1,dataIndex: 'dstbCtvdTrgtTblYn', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#dtoClassNm'),width: 400,flex: 1,dataIndex: 'dtoClassNm', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#dstbCtvdClassNm'),width: 200,flex: 1,dataIndex: 'dstbCtvdClassNm', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#dstbCtvdPckgNm'),width: 200,flex: 1,dataIndex: 'dstbCtvdPckgNm', style: 'text-align:center', align: 'center'}
                            
                            , {text: bxMsg('cbb_items.AT#lastChngId'),width: 130,flex: 1,dataIndex: 'lastChngId', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#lastChngTmstmp'),width: 150,dataIndex: 'lastChngTmstmp', style: 'text-align:center', align: 'center'
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
                                    //더블클릭시 이벤트 발생
                                    that.clickTableGrid();
                                }
                            }
                        }
                    });
                    // 단일탭 그리드 렌더
                    that.$el.find(".CAPCA003-table-grid").html(that.CAPCA003TableGrid.render({'height': 200}));
                }
                
                , resetTableDetailArea : function() {
                	var that = this;
                	that.$el.find('.CAPCA003-target-table [data-form-param="dstbTblId"]').val("");
                	that.$el.find('.CAPCA003-target-table [data-form-param="dstbTblId"]').attr("readonly", false);
                	
                	that.$el.find('.CAPCA003-target-table [data-form-param="lgclTblNm"]').val("");
                	that.$el.find('.CAPCA003-target-table [data-form-param="initzCacheKeyVal"]').val("");
                	that.$el.find('.CAPCA003-target-table [data-form-param="actvStsCd"]').val("");
                	
                	that.$el.find('.CAPCA003-target-table [data-form-param="dtoClassNm"]').val("");
                	that.$el.find('.CAPCA003-target-table [data-form-param="dstbCtvdClassNm"]').val("");
                	that.$el.find('.CAPCA003-target-table [data-form-param="dstbCtvdPckgNm"]').val("");
                	that.$el.find('.CAPCA003-target-table [data-form-param="dstbCtvdTrgtTblYn"]').prop("checked", false);
                	
                	that.CAPCA003TableColumnsGrid.resetData();
                }
                
                , resetTableBaseArea : function() {
                	var that = this;
                	that.$el.find('.CAPCA003-base-table [data-form-param="dstbTblId"]').val("");                	
                	that.$el.find('.CAPCA003-base-table [data-form-param="lgclTblNm"]').val("");

                	that.resetTableDetailArea();
                	that.CAPCA003TableGrid.resetData();
                }
                , moveCAPCA001: function () {
                    
                	var that = this;
                	
                	that.$el.trigger({
                		type: 'open-conts-page',
                		pageHandler: 'CAPCA001',
                		pageDPName: bxMsg('cbb_items.SCRN#CAPCA001'),
                		pageInitialize: true
                	});
                    
                } // end
                
                , inquiryTableData: function () {
                	var that = this;
                    var sParam = {};

//                    sParam.actvStsCd = "01";
                    sParam.dstbTblId = that.$el.find('.CAPCA003-base-table [data-form-param="dstbTblId"]').val().toUpperCase();
                    sParam.lgclTblNm = that.$el.find('.CAPCA003-base-table [data-form-param="lgclTblNm"]').val();
                   
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
                                        that.CAPCA003TableGrid.setData(tbList);
                                        that.deleteTableList = [];
                                    }
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                } // end
                , clickTableGrid: function () {

                    var that = this;
                    var selectedRecord = that.CAPCA003TableGrid.grid.getSelectionModel().selected.items[0];

                    if (!selectedRecord) {
                        return;
                    } else {
                    	that.$el.find('.CAPCA003-target-table [data-form-param="dstbTblId"]').val(selectedRecord.data.dstbTblId);
                    	that.$el.find('.CAPCA003-target-table [data-form-param="lgclTblNm"]').val(selectedRecord.data.lgclTblNm);
                    	that.$el.find('.CAPCA003-target-table [data-form-param="dtoClassNm"]').val(selectedRecord.data.dtoClassNm);
                    	that.$el.find('.CAPCA003-target-table [data-form-param="dstbCtvdClassNm"]').val(selectedRecord.data.dstbCtvdClassNm);
                    	that.$el.find('.CAPCA003-target-table [data-form-param="dstbCtvdPckgNm"]').val(selectedRecord.data.dstbCtvdPckgNm);
                        
                    	if (selectedRecord.data.dstbCtvdTrgtTblYn == "Y")
                    		that.$el.find('.CAPCA003-target-table [data-form-param="dstbCtvdTrgtTblYn"]').prop("checked", true);
                        else
                        	that.$el.find('.CAPCA003-target-table [data-form-param="dstbCtvdTrgtTblYn"]').prop("checked", false);
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
                
                ,
                getYn: function(obj){
                	if($(obj).attr('checked'))
                		return "Y";
                	else
                		return "N";
                }
                
                , tableBaseModal : function() {
                	fn_pageLayerCtrl("#CAPCA003-base-table", this.$el.find("#btn-base-search-modal"));
                }
                , tableGridModal : function() {
                	fn_pageLayerCtrl("#CAPCA003-table-grid", this.$el.find("#btn-table-grid"));
                }
                , tableDetailModal : function() {
                	fn_pageLayerCtrl("#CAPCA003-target-table", this.$el.find("#btn-target-table-modal"));
                }
    	        , excuteDstbCtvd: function () {
                    var that = this;
                    
                	var tblList = [];
                    var sParam = {};
                    
    				if( that.CAPCA003TableGrid.store.getRange().length > 0){
   					 	for (j = 0; j < that.CAPCA003TableGrid.store.getRange().length; j++){
	   					 	if( that.CAPCA003TableGrid.store.getAt(j).data.flagTp === 'Y'){
	   					 		that.saveList.push(that.CAPCA003TableGrid.store.getAt(j).data);
	   					 	}
            		    }
    				} 	

                	if( that.saveList.length >=1 ){
                 	    $(that.saveList).each(function(idx, data) {
                 		var sub = {};
                 		sub.tblNm      = data.dstbTblId;
                 		tblList.push(sub);
                 		sParam.tblList = tblList;
                 	   });        
                 	}
                    var linkData = {"header": fn_getHeader("CAPSV0008501"), "CaDstbChrncTaskMIn": sParam};

                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                that.saveList = [];
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
    	        }
            })
            ; // end of Backbone.View.extend({

        return CAPCA003View;
    } // end of define function
)
; // end of define
