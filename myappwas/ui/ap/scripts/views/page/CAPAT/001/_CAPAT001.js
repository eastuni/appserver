define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPAT/001/_CAPAT001.html'
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
        var CAPAT001View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPAT001-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                      'click #btn-base-reset': 'resetBaseArea'
                    , 'click #btn-base-search': 'queryBaseArea'
                	, 'click #btn-base-search-modal': 'baseSearchModal'


        			, 'click #btn-CAPAT001-grid-delete': 'clickDeleteGrid'
    				, 'click #btn-CAPAT001-grid-excel': 'gridExcel'
					, 'click #btn-up-grid': 'gridAreaModal'


    				, 'click #btn-detail-refresh': 'resetDetailArea'
					, 'click #btn-detail-save': 'clickSaveDetail'
					, 'click #btn-detail-modal': 'detailModal'


					, 'click #btn-CAPAT001-mltLngBtn': 'fn_rgstMltLng'
					, 'keyup .CAPAT001-detail-table [data-form-param="noticeMsgCd"]': 'fn_showMltLngBtn'
                }


                /**
                 * initialize
                 */
                , initialize: function (initData) {
                    var that = this;


                	that.comboStore1 = {}; // 통지방식유형코드
                	that.comboStore2 = {}; // 통지목적유형코드
                	that.comboStore3 = {}; // 통지문서식별자


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


                    if(that.instCd == 'STDA') {
                    	that.$el.find('.CAPAT001-detail-table [data-form-param="noticeMsgNm"]').prop("disabled", false);  
                		that.$el.find('.CAPAT001-detail-table [data-form-param="noticeWayTpCd"]').prop("disabled", false);  
                		that.$el.find('.CAPAT001-detail-table [data-form-param="noticeGoalTpCd"]').prop("disabled", false);  
                		that.$el.find('#btn-CAPAT001-grid-delete').prop("disabled", false);  
                	}


                    var sParam = {};
                    sParam.cdNbr = "40029"; // 통지방식유형코드
                    var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    sParam = {};
                    sParam.cdNbr = "40027"; // 통지목적유형코드
                    var linkData2 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    sParam = {};
                    sParam.cdNbr = "A0119"; // 통지문서식별자
                    var linkData3 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    bxProxy.all([
                                 // 통지방식유형코드 컴포넌트콤보로딩
                                 {url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {
                                     if (fn_commonChekResult(responseData)) {
                                         comboStore1 = new Ext.data.Store({
                                             fields: ['cd', 'cdNm'],
                                             data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                         });


                                         // add option to 기본속성 combobox 
                                         var comboParam = {};
                                         comboParam.className = "CAPAT001-dtl-noticeWayTp-wrap";
                                         comboParam.tblNm = responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;
                                         comboParam.valueNm = "cd";
                                         comboParam.textNm = "cdNm";


                                         fn_makeComboBox(comboParam, that);
                                     }
                                 }} 
                                 // 통지목적유형코드 컴포넌트콤보로딩
                                ,{url: sUrl, param: JSON.stringify(linkData2), success: function (responseData) {
                                     if (fn_commonChekResult(responseData)) {
                                         comboStore2 = new Ext.data.Store({
                                             fields: ['cd', 'cdNm'],
                                             data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                         });


                                         // add option to 기본속성 combobox 
                                         comboParam = {};
                                         comboParam.className = "CAPAT001-dtl-noticeGoalTp-wrap";
                                         comboParam.tblNm = responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;
                                         comboParam.valueNm = "cd";
                                         comboParam.textNm = "cdNm";


                                         fn_makeComboBox(comboParam, that);                                         
                                     }
                                 }} 
                                // 통지문서식별자 컴포넌트콤보로딩
                                ,{url: sUrl, param: JSON.stringify(linkData3), success: function (responseData) {
                                     if (fn_commonChekResult(responseData)) {
                                         comboStore3 = new Ext.data.Store({
                                             fields: ['cd', 'cdNm'],
                                             data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                         });


                                         // add option to 검색조건 combobox 
                                         var comboParam = {};
                                         comboParam.className = "CAPAT001-base-docId-wrap";
                                         comboParam.tblNm = responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;
                                         comboParam.valueNm = "cd";
                                         comboParam.textNm = "cdNm";
                                         comboParam.nullYn = "Y";
                                         comboParam.allNm = bxMsg('cbb_items.SCRNITM#all');


                                         fn_makeComboBox(comboParam, that);


                                         // add option to 기본속성 combobox 
                                         comboParam = {};
                                         comboParam.className = "CAPAT001-dtl-docId-wrap";
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


                                	var trashIconDisabled = "";  
                                	if(that.instCd != "STDA") {
                                		trashIconDisabled = " disabled";    
                                	}


                                	/* ------------------------------------------------------------ */
				                    that.CAPAT001Grid = new ExtGrid({
				                        /* ------------------------------------------------------------ */
				                        // 단일탭 그리드 컬럼 정의
				                        fields: ['rowIndex', 'noticeMsgCd', 'noticeMsgNm', 'noticeWayTpCd', 'noticeGoalTpCd', 'docId', 'delBtn', 'lastChngGuid']
				                        , id: 'CAPAT001Grid'
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
											    	record.data.rowIndex = rowIndex + 1;
											        return record.data.rowIndex;
											    }
											}
				                            , {text: bxMsg('cbb_items.AT#noticeMsgCd'),width: 160,flex: 1, dataIndex: 'noticeMsgCd', style: 'text-align:center', align: 'center'}
				                            , {text: bxMsg('cbb_items.AT#noticeMsgNm'),width: 160,flex: 1,dataIndex: 'noticeMsgNm', style: 'text-align:center', align: 'center'}
				                            , {text: bxMsg('cbb_items.SCRNITM#noticeWayTp'),width: 160,flex: 1, dataIndex: 'noticeWayTpCd', style: 'text-align:center', align: 'center',
		                                       renderer: function(val) {
		                                    	   index = comboStore1.findExact('cd', val);
	                                               if(index != -1) {
	                                            	   rs = comboStore1.getAt(index).data;
	                                                   return rs.cdNm;
	                                               }
	                                           } // end of render				                            	
				                              }
				                            , {text: bxMsg('cbb_items.SCRNITM#noticeGoalTp'),width: 160,flex: 1,dataIndex: 'noticeGoalTpCd', style: 'text-align:center', align: 'center',
			                                   renderer: function(val) {
			                                	   index = comboStore2.findExact('cd', val);
		                                           if(index != -1) {
		                                        	   rs = comboStore2.getAt(index).data;
		                                               return rs.cdNm;
		                                           }
		                                       } // end of render				                            	
					                          }
				                            , {text: bxMsg('cbb_items.AT#docId'),width: 160,flex: 1,dataIndex: 'docId', style: 'text-align:center', align: 'center',
			                                   renderer: function(val) {
			                                	   index = comboStore3.findExact('cd', val);
		                                           if(index != -1) {
		                                        	   rs = comboStore3.getAt(index).data;
		                                               return rs.cdNm;
		                                           }
		                                       } // end of render				                            	
					                          }
				                            , {text: bxMsg('cbb_items.SCRNITM#del'),width: 80, style: 'text-align:center', align: 'center',
				                                   renderer: function(value, metaData, record, row, col, store, gridView, e){


				                                	   var delBtnCreateHtml = '<button type="button" onClick="this.blur()" class="bw-btn" ' + trashIconDisabled +  
				                                	   			'><i class="bw-icon i-25 i-func-trash"></i></button>';


				                                	   return delBtnCreateHtml;


				                                   } // end of render				                            	
						                     }
				                           , {hidden : true, dataIndex: 'lastChngGuid'}
				                        ] // end of columns
				                        , listeners: {
				                        	cellClick: function (view, cell, cellIndex, record, row, rowIndex, e) {
				                        		if(cellIndex == 6 && that.instCd == 'STDA') {
				                        			that.deleteList.push(record.data);
				                        			that.CAPAT001Grid.store.remove(record);				                        							                        			
				                        		}
				                        		else {
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
                                        		this.$el.find('.CAPAT001-wrap #btn-CAPAT001-grid-delete')
                                        		,this.$el.find('.CAPAT001-wrap #btn-detail-save')
                                        			   ]);
                    return this.$el;
                }


                /**
                 * 기본부 초기화
                 */
                , resetBaseArea: function (e) {
                    var that = this;


                    that.$el.find('.CAPAT001-base-table input').val("");
                    that.$el.find('.CAPAT001-base-table select').each(function(){ 
		        		this.selectedIndex = 0;	
		        	});


                    that.CAPAT001Grid.resetData();
                    that.$el.find('#rsltCnt').html(0);


                    that.resetDetailArea(e, true);
                }


                /**
                 * 상세부 초기화
                 */
                , resetDetailArea : function(e, keyObjDisplayFlag) {


                	var that = this;
                	if(keyObjDisplayFlag == undefined || keyObjDisplayFlag == null) keyObjDisplayFlag = false;


                	that.$el.find('.CAPAT001-detail-table input').val("");
                	that.$el.find('.CAPAT001-detail-table select').each(function(){ 
		        		this.selectedIndex = 0;	
		        	});


                	if(!keyObjDisplayFlag && that.instCd == 'STDA') {
                		that.$el.find('.CAPAT001-detail-table [data-form-param="noticeMsgCd"]').prop("disabled", keyObjDisplayFlag);  
                	}
                	else if(keyObjDisplayFlag) {
                		that.$el.find('.CAPAT001-detail-table [data-form-param="noticeMsgCd"]').prop("disabled", keyObjDisplayFlag);  
                	}


                	that.$el.find("#btn-CAPAT001-mltLngBtn").hide();
                	that.newSaveYn = "Y";
                	that.lastChngGuid = "";
                }
                /**
                 * 기본부 조회 버튼 클릭
                 */
                , queryBaseArea: function () {
                    var that = this;
                    var sParam = {};


                    sParam.instCd = that.instCd;
                    sParam.noticeMsgCd = that.$el.find('.CAPAT001-base-table [data-form-param="noticeMsgCd"]').val();
                    sParam.noticeMsgNm = that.$el.find('.CAPAT001-base-table [data-form-param="noticeMsgNm"]').val();
                    sParam.docId = that.$el.find('.CAPAT001-base-table [data-form-param="docId"]').val();


                    that.inquiryBaseData(sParam);
                }


                /**
                 * 기본부 정보로 그리드 조회
                 */
                , inquiryBaseData: function (sParam) {
                    var that = this;


                    var linkData = {"header": fn_getHeader("CAPAT0018401"), "CaNoticeMsgCdSvcGetListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                var tbList = responseData.CaNoticeMsgCdSvcGetListOut.noticeMsgCdList;
                                var totCnt = responseData.CaNoticeMsgCdSvcGetListOut.noticeMsgCdList.length;


                                if (tbList != null || tbList.length > 0) {
                                    that.CAPAT001Grid.setData(tbList);
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
                	sParam.noticeMsgCdList = [];


                	if(that.deleteList.length > 0) {
                		$(that.deleteList).each(function(idx, data) {
                			var delParam = {};
                			delParam.noticeMsgCd = data.noticeMsgCd;
                			sParam.noticeMsgCdList.push(delParam);
                		});


                		var linkData = {"header": fn_getHeader("CAPAT0018201"), "CaNoticeMsgCdSvcTerminateListIn": sParam};


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
                	 var linkData = null;
                	 var sParam = {};


                	 sParam.instCd = that.instCd;
                	 sParam.noticeMsgCd = that.$el.find('.CAPAT001-detail-table [data-form-param="noticeMsgCd"]').val(); 
                	 sParam.docId = that.$el.find('.CAPAT001-detail-table [data-form-param="docId"]').val(); 


                	 if(that.instCd == "STDA") {
	                     sParam.noticeMsgNm = that.$el.find('.CAPAT001-detail-table [data-form-param="noticeMsgNm"]').val();  
	                     sParam.noticeWayTpCd = that.$el.find('.CAPAT001-detail-table [data-form-param="noticeWayTpCd"]').val();  
	                     sParam.noticeGoalTpCd = that.$el.find('.CAPAT001-detail-table [data-form-param="noticeGoalTpCd"]').val();
	                     sParam.lastChngGuid = that.lastChngGuid;
	                     sParam.newSaveYn = that.newSaveYn;


	                     linkData = {"header": fn_getHeader("CAPAT0018101"), "CaNoticeMsgCdSvcRgstIn": sParam};
                	 }
                	 else {
                		 linkData = {"header": fn_getHeader("CAPAT0018202"), "CaNoticeMsgCdSvcRgstRelIn": sParam};
                	 }


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
                    	  , trnsfrOriginKeyVal : "A0068" + that.$el.find('.CAPAT001-detail-table [data-form-param="noticeMsgCd"]').val()  
                        }
                    });
                }
                /**
                 * 다국어버튼 show/hide
                 */
                , fn_showMltLngBtn : function(e) {
                	var that = this;


                	if($(e.currentTarget).val().trim().length == 0) {
                		that.$el.find("#btn-CAPAT001-mltLngBtn").hide();
                	}
                	else {
                		that.$el.find("#btn-CAPAT001-mltLngBtn").show();
                	}
                }
                /**
                 * 그리드 생성
                 */
                , createGrid: function () {
                    var that = this;


                    this.$el.find(".CAPAT001-grid").html(this.CAPAT001Grid.render({'height': CaPopGridHeight}));
                } // end of createGrid


                /**
                 * 그리드 행 클릭
                 */
                , clickGrid: function () {


                    var that = this;
                    var selectedRecord = that.CAPAT001Grid.grid.getSelectionModel().selected.items[0];


                    if (!selectedRecord) {
                        return;
                    } else {
                    	that.$el.find('.CAPAT001-detail-table [data-form-param="noticeMsgCd"]').val(selectedRecord.data.noticeMsgCd);
                    	that.$el.find('.CAPAT001-detail-table [data-form-param="noticeMsgNm"]').val(selectedRecord.data.noticeMsgNm);
                    	that.$el.find('.CAPAT001-detail-table [data-form-param="noticeWayTpCd"]').val(selectedRecord.data.noticeWayTpCd);
                    	that.$el.find('.CAPAT001-detail-table [data-form-param="noticeGoalTpCd"]').val(selectedRecord.data.noticeGoalTpCd);
                    	that.$el.find('.CAPAT001-detail-table [data-form-param="docId"]').val(selectedRecord.data.docId);
                    	that.lastChngGuid = selectedRecord.data.lastChngGuid;


                    	that.$el.find('.CAPAT001-detail-table [data-form-param="noticeMsgCd"]').prop("disabled", true);


                    	that.$el.find("#btn-CAPAT001-mltLngBtn").show();  
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
                	fn_pageLayerCtrl("#CAPAT001-grid");
                }


                // 상세영역 toggle
                , detailModal : function() {
                	var that = this;
                	fn_pageLayerCtrl(".CAPAT001-detail-table");
                }


                // 그리드 내용 엑셀 다운로드
                , gridExcel : function() {
                	var that = this;
                	that.CAPAT001Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPAT001')+"_"+getCurrentDate("yyyy-mm-dd"));
                }
            })
            ; // end of Backbone.View.extend({


        return CAPAT001View;
    } // end of define function
)
; // end of define
