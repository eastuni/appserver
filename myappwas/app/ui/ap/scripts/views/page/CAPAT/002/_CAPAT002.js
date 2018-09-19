define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPAT/002/_CAPAT002.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , ExtGrid
        , commonInfo
        ) {


        /**
         * Backbone
         */
        var CAPAT002View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPAT002-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                      'click #btn-base-reset': 'resetBaseArea'
                    , 'click #btn-base-search': 'queryBaseArea'
                	, 'click #btn-base-search-modal': 'baseSearchModal'


        			, 'click #btn-CAPAT002-grid-delete': 'clickDeleteGrid'
    				, 'click #btn-CAPAT002-grid-excel': 'gridExcel'
					, 'click #btn-up-grid': 'gridAreaModal'


    				, 'click #btn-detail-refresh': 'resetDetailArea'
					, 'click #btn-detail-save': 'clickSaveDetail'
					, 'click #btn-detail-modal': 'detailModal'


					, 'click #btn-CAPAT002-mltLngBtn': 'fn_rgstMltLng'
					, 'keyup .CAPAT002-detail-table [data-form-param="authCd"]': 'fn_showMltLngBtn'
                }


                /**
                 * initialize
                 */
                , initialize: function (initData) {
                    var that = this;
                    that.that = this;
                	that.comboStore1 = {}; // 인증유형코드
                	that.comboStore2 = {}; // 인증방식코드
                	that.comboStore3 = {}; // 인증유효기간코드
                	that.comboStore4 = {}; // 통지메시지코드     


                    // init data set
                    if (commonInfo.getInstInfo().instCd) {
                    	that.instCd = commonInfo.getInstInfo().instCd;
                    }
                    else {
                    	that.instCd = $.sessionStorage('instCd');
                    }


                    var deleteList = [];


                    $.extend(that, initData);
                    that.$el.html(that.tpl());


                    var sParam = {};
                    sParam.cdNbr = "11966"; // 인증유형코드
                    var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    sParam = {};
                    sParam.cdNbr = "40025"; // 인증방식코드
                    var linkData2 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    sParam = {};
                    sParam.cdNbr = "40022"; // 인증유효기간코드
                    var linkData3 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    sParam = {};
                    sParam.cdNbr = "A0068"; // 통지메시지코드
                    var linkData4 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    bxProxy.all([
                                 // 인증유형코드 컴포넌트콤보로딩
                                 {url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {
                                     if (fn_commonChekResult(responseData)) {
                                         comboStore1 = new Ext.data.Store({
                                             fields: ['cd', 'cdNm'],
                                             data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                         });


                                         // add option to 기본속성 combobox 
                                         var comboParam = {};
                                         comboParam.className = "CAPAT002-dtl-authTp-wrap";
                                         comboParam.tblNm = responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;
                                         comboParam.valueNm = "cd";
                                         comboParam.textNm = "cdNm";


                                         fn_makeComboBox(comboParam, that);
                                     }
                                 }} 
                                 // 인증방식코드 컴포넌트콤보로딩
                                ,{url: sUrl, param: JSON.stringify(linkData2), success: function (responseData) {
                                     if (fn_commonChekResult(responseData)) {
                                         comboStore2 = new Ext.data.Store({
                                             fields: ['cd', 'cdNm'],
                                             data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                         });


                                         // add option to 검색조건 combobox 
                                         var comboParam = {};
                                         comboParam.className = "CAPAT002-base-authWay-wrap";
                                         comboParam.tblNm = responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;
                                         comboParam.valueNm = "cd";
                                         comboParam.textNm = "cdNm";
                                         comboParam.nullYn = "Y";
                                         comboParam.allNm = bxMsg('cbb_items.SCRNITM#all');


                                         fn_makeComboBox(comboParam, that);


                                         // add option to 기본속성 combobox 
                                         comboParam = {};
                                         comboParam.className = "CAPAT002-dtl-authWay-wrap";
                                         comboParam.tblNm = responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;
                                         comboParam.valueNm = "cd";
                                         comboParam.textNm = "cdNm";


                                         fn_makeComboBox(comboParam, that);                                         
                                     }
                                 }} 
                                // 인증유효기간코드 컴포넌트콤보로딩
                                ,{url: sUrl, param: JSON.stringify(linkData3), success: function (responseData) {
                                     if (fn_commonChekResult(responseData)) {
                                         comboStore3 = new Ext.data.Store({
                                             fields: ['cd', 'cdNm'],
                                             data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                         });


                                         // add option to 기본속성 combobox 
                                         var comboParam = {};
                                         comboParam.className = "CAPAT002-dtl-authEfctvTrm-wrap";
                                         comboParam.tblNm = responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;
                                         comboParam.valueNm = "cd";
                                         comboParam.textNm = "cdNm";


                                         fn_makeComboBox(comboParam, that);
                                     }
                                 }}
                                 // 통지메시지 컴포넌트콤보로딩
                                ,{url: sUrl, param: JSON.stringify(linkData4), success: function (responseData) {
                                     if (fn_commonChekResult(responseData)) {
                                         comboStore4 = new Ext.data.Store({
                                             fields: ['cd', 'cdNm'],
                                             data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                         });


                                         // add option to 기본속성 combobox 
                                         var comboParam = {};
                                         comboParam.className = "CAPAT002-dtl-noticeMsg-wrap";
                                         comboParam.tblNm = responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;
                                         comboParam.valueNm = "cd";
                                         comboParam.textNm = "cdNm";
                                         comboParam.nullYn = "Y";
                                         comboParam.allNm = bxMsg('cbb_items.SCRNITM#na');                                         


                                         fn_makeComboBox(comboParam, that);
                                     }
                                 }}
                              ]
                              , {
                                  success: function () {   


                                	/* ------------------------------------------------------------ */
				                    that.CAPAT002Grid = new ExtGrid({
				                        /* ------------------------------------------------------------ */
				                        // 단일탭 그리드 컬럼 정의
				                        fields: ['rowIndex', 'authCd', 'authNm', 'authTpCd', 'authWayCd', 'authEfctvTrmCd', 'noticeMsgCd', 'delBtn']
				                        , id: 'CAPAT002Grid'
				                        , columns: [
											{
											    text: 'No.'
											    , dataIndex: 'rowIndex'
											    , sortable: false
											    , width : 80
											    , height : 25
											    , style: 'text-align:center'
											    , align: 'center'
											    , renderer: function (value, metaData, record, rowIndex) {
											        return rowIndex + 1;
											    }
											}
				                            , {text: bxMsg('cbb_items.AT#authCd'),width: 160,flex: 1, dataIndex: 'authCd', style: 'text-align:center', align: 'center'}
				                            , {text: bxMsg('cbb_items.AT#authNm'),width: 160,flex: 1,dataIndex: 'authNm', style: 'text-align:center', align: 'center'}
				                            , {text: bxMsg('cbb_items.SCRNITM#authTp'),width: 160,flex: 1, dataIndex: 'authTpCd', style: 'text-align:center', align: 'center',
		                                       renderer: function(val) {
		                                    	   index = comboStore1.findExact('cd', val);
	                                               if(index != -1) {
	                                            	   rs = comboStore1.getAt(index).data;
	                                                   return rs.cdNm;
	                                               }
	                                           } // end of render				                            	
				                              }
				                            , {text: bxMsg('cbb_items.SCRNITM#authWay'),width: 160,flex: 1,dataIndex: 'authWayCd', style: 'text-align:center', align: 'center',
			                                   renderer: function(val) {
			                                	   index = comboStore2.findExact('cd', val);
		                                           if(index != -1) {
		                                        	   rs = comboStore2.getAt(index).data;
		                                               return rs.cdNm;
		                                           }
		                                       } // end of render				                            	
					                          }
				                            , {text: bxMsg('cbb_items.SCRNITM#authEfctvTrm'),width: 160,flex: 1,dataIndex: 'authEfctvTrmCd', style: 'text-align:center', align: 'center',
			                                   renderer: function(val) {
			                                	   index = comboStore3.findExact('cd', val);
		                                           if(index != -1) {
		                                        	   rs = comboStore3.getAt(index).data;
		                                               return rs.cdNm;
		                                           }
		                                       } // end of render				                            	
					                          }
				                            , {text: bxMsg('cbb_items.SCRNITM#noticeMsg'),width: 160,flex: 1,dataIndex: 'noticeMsgCd', style: 'text-align:center', align: 'center',
			                                   renderer: function(val) {
			                                	   index = comboStore4.findExact('cd', val);
		                                           if(index != -1) {
		                                        	   rs = comboStore4.getAt(index).data;
		                                               return rs.cdNm;
		                                           }
		                                       } // end of render				                            	
					                          }
				                            , {
				                             	xtype: 'actioncolumn', width: 80, style: 'text-align:center', align: 'center',text: bxMsg('cbb_items.SCRNITM#del'),
				                             	items: [
																{
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
				                        , listeners: {
				                            click: {
				                                element: 'body'
				                                , fn: function () {
				                                    //더블클릭시 이벤트 발생
				                                    that.clickGrid();
				                                }
				                            }
				                        }
				                    });
				                    // 단일탭 그리드 렌더
				                    that.createGrid();
                                  } // end of success:.function
                    }); // end of bxProxy.all				                    
                }


                /**
                 * render
                 */
                , render: function () {
                	
                	//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPAT002-wrap #btn-CAPAT002-grid-delete')
                                        		,this.$el.find('.CAPAT002-wrap #btn-detail-save')
                                        			   ]);
                    
                    return this.$el;
                }


                /**
                 * 기본부 초기화
                 */
                , resetBaseArea: function (e) {
                    var that = this;


                    that.$el.find('.CAPAT002-base-table input').val("");
                    that.$el.find('.CAPAT002-base-table select').each(function(){ 
		        		this.selectedIndex = 0;	
		        	});


                    that.CAPAT002Grid.resetData();
                    that.$el.find('#rsltCnt').html(0);


                    that.resetDetailArea(e, true);
                }


                /**
                 * 상세부 초기화
                 */
                , resetDetailArea : function(e, keyObjDisplayFlag) {


                	var that = this;
                	if(keyObjDisplayFlag == undefined || keyObjDisplayFlag == null) keyObjDisplayFlag = false;


                	that.$el.find('.CAPAT002-detail-table input').val("");
                	that.$el.find('.CAPAT002-detail-table select').each(function(){ 
		        		this.selectedIndex = 0;	
		        	});


                	that.$el.find('.CAPAT002-detail-table [data-form-param="authCd"]').prop("disabled", keyObjDisplayFlag);     


                	that.$el.find("#btn-CAPAT002-mltLngBtn").hide();
                	that.newSaveYn = "Y";
                }
                /**
                 * 기본부 조회 버튼 클릭
                 */
                , queryBaseArea: function () {
                    var that = this;
                    var sParam = {};


                    sParam.instCd = that.instCd;
                    sParam.authCd = that.$el.find('.CAPAT002-base-table [data-form-param="authCd"]').val();
                    sParam.authNm = that.$el.find('.CAPAT002-base-table [data-form-param="authNm"]').val();
                    sParam.authWayCd = that.$el.find('.CAPAT002-base-table [data-form-param="authWayCd"]').val();


                    that.inquiryBaseData(sParam);
                }


                /**
                 * 기본부 정보로 그리드 조회
                 */
                , inquiryBaseData: function (sParam) {
                    var that = this;


                    var linkData = {"header": fn_getHeader("CAPAT0038401"), "CaSelfAuthCdSvcGetListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                var tbList = responseData.CaSelfAuthCdSvcGetListOut.selfAuthCdList;
                                var totCnt = responseData.CaSelfAuthCdSvcGetListOut.selfAuthCdList.length;


                                if (tbList != null || tbList.length > 0) {
                                    that.CAPAT002Grid.setData(tbList);
                                    //검색건수
                                	that.$el.find('#rsltCnt').html(fn_setComma(totCnt));
                                    // 삭제 로우 초기화
                                    that.deleteList = [];
                                    that.resetDetailArea(null, true);
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
                	var sParam = {};
                	sParam.instCd = that.instCd;
                	sParam.selfAuthCdList = [];


                	if(that.deleteList.length > 0) {
                		$(that.deleteList).each(function(idx, data) {
                			var delParam = {};
                			delParam.authCd = data.authCd;
                			sParam.selfAuthCdList.push(delParam);
                		});


                		var linkData = {"header": fn_getHeader("CAPAT0038201"), "CaSelfAuthCdSvcTerminateListIn": sParam};


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


                	 sParam.instCd = that.instCd;
                	 sParam.authCd = that.$el.find('.CAPAT002-detail-table [data-form-param="authCd"]').val();       
                     sParam.authNm = that.$el.find('.CAPAT002-detail-table [data-form-param="authNm"]').val();  
                     sParam.authTpCd = that.$el.find('.CAPAT002-detail-table [data-form-param="authTpCd"]').val();  
                     sParam.authWayCd = that.$el.find('.CAPAT002-detail-table [data-form-param="authWayCd"]').val();
                     sParam.authEfctvTrmCd = that.$el.find('.CAPAT002-detail-table [data-form-param="authEfctvTrmCd"]').val(); 
                     sParam.noticeMsgCd = that.$el.find('.CAPAT002-detail-table [data-form-param="noticeMsgCd"]').val(); 
                     sParam.newSaveYn = that.newSaveYn;


                     var linkData = {"header": fn_getHeader("CAPAT0038101"), "CaSelfAuthCdSvcRgstIn": sParam};


                     //ajax 호출
                     bxProxy.post(sUrl, JSON.stringify(linkData), {
                    	 enableLoading: true,
                         success: function (responseData) {
                             if (fn_commonChekResult(responseData)) {
                            	 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                            	 // 재조회
                            	 that.queryBaseArea();
                             }
                         }
                     });
                }
                /**
                 * 다국어버튼 클릭
                 */
                , fn_rgstMltLng : function() {
                	var that = this;


                    that.$el.trigger({
                        type: 'open-conts-page',
                        pageHandler: 'CAPCM190',
                        pageDPName: bxMsg('cbb_items.SCRN#CAPCM190'),
                        pageInitialize: true,
                        pageRenderInfo: {
                        	trnsfrKnd : "CDVAL_NAME" // 코드값명 
                    	  , trnsfrOriginKeyVal : "A0509" + that.instCd + that.$el.find('.CAPAT002-detail-table [data-form-param="authCd"]').val() // 본인인증코드  
                        }
                    });
                }
                /**
                 * 다국어버튼 show/hide
                 */
                , fn_showMltLngBtn : function(e) {
                	var that = this;


                	if($(e.currentTarget).val().trim().length == 0) {
                		that.$el.find("#btn-CAPAT002-mltLngBtn").hide();
                	}
                	else {
                		that.$el.find("#btn-CAPAT002-mltLngBtn").show();
                	}
                }
                /**
                 * 그리드 생성
                 */
                , createGrid: function () {
                    var that = this;


                    this.$el.find(".CAPAT002-grid").html(this.CAPAT002Grid.render({'height': CaPopGridHeight}));
                } // end of createGrid


                /**
                 * 그리드 행 클릭
                 */
                , clickGrid: function () {


                    var that = this;
                    var selectedRecord = that.CAPAT002Grid.grid.getSelectionModel().selected.items[0];


                    if (!selectedRecord) {
                        return;
                    } else {
                    	that.$el.find('.CAPAT002-detail-table [data-form-param="authCd"]').val(selectedRecord.data.authCd);
                    	that.$el.find('.CAPAT002-detail-table [data-form-param="authNm"]').val(selectedRecord.data.authNm);
                    	that.$el.find('.CAPAT002-detail-table [data-form-param="authTpCd"]').val(selectedRecord.data.authTpCd);
                    	that.$el.find('.CAPAT002-detail-table [data-form-param="authWayCd"]').val(selectedRecord.data.authWayCd);
                    	that.$el.find('.CAPAT002-detail-table [data-form-param="authEfctvTrmCd"]').val(selectedRecord.data.authEfctvTrmCd);
                    	that.$el.find('.CAPAT002-detail-table [data-form-param="noticeMsgCd"]').val(selectedRecord.data.noticeMsgCd);


                    	that.$el.find('.CAPAT002-detail-table [data-form-param="authCd"]').prop("disabled", true);


                    	that.$el.find("#btn-CAPAT002-mltLngBtn").show();  
                    	that.newSaveYn = "N";
                    }
                }


                // 조회조건영역 toggle
                , baseSearchModal : function() {
                	var that = this;
                	fn_pageLayerCtrl("#search-area");
                }


                // 그리드영역 toggle
                , gridAreaModal : function() {
                	var that = this;
                	fn_pageLayerCtrl("#CAPAT002-grid");
                }


                // 상세영역 toggle
                , detailModal : function() {
                	var that = this;
                	fn_pageLayerCtrl(".CAPAT002-detail-table");
                }


                // 그리드 내용 엑셀 다운로드
                , gridExcel : function() {
                	var that = this;
                	that.CAPAT002Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPAT002')+"_"+getCurrentDate("yyyy-mm-dd"));
                }
            })
            ; // end of Backbone.View.extend({


        return CAPAT002View;
    } // end of define function
)
; // end of define
