define(
	    [
	        'bx/common/config', 
	        'text!app/views/page/CAPCM/200/_CAPCM200.html',
	        'bx-component/ext-grid/_ext-grid',
	        'bx/common/common-info'
	    ]
	    , function (
	        config,
	        tpl,
	        ExtGrid,
	        commonInfo
	    ) {
        /**
         * Backbone
         */
        var CAPCM200View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPCM200-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                    'click #btn-base-reset': 'resetBaseArea'
                    , 'click #btn-base-search': 'queryBaseArea'
                	, 'click #btn-base-search-modal': 'baseSearchModal'
                	, 'click #btn-CAPCM200-grid-refresh': 'resetPfrlArea'
        			, 'click #btn-CAPCM200-grid-save': 'clickSaveGrid'
    				, 'click #btn-CAPCM200-grid-excel': 'gridExcel'
    				, 'click #btn-CAPCM200-grid-add': 'gridAdd'
					, 'click #btn-up-grid': 'gridAreaModal'
    				, 'click #btn-detail-refresh': 'resetDetailArea'
					, 'click #btn-detail-save': 'clickSaveDetail'
					, 'click #btn-detail-modal': 'detailModal'
                }
             
                
                /**
                 * initialize
                 */
                , initialize: function (initData) {
                    $.extend(this, initData);
                    this.initData = initData;
                    this.createGrid();
                }
                
                /**
                 * 그리드 생성
                 */
                ,createGrid: function () {
                    var that = this;

                    /* ------------------------------------------------------------ */
                    this.CAPCM200Grid = new ExtGrid({
                        /* ------------------------------------------------------------ */
                        // 단일탭 그리드 컬럼 정의
                        fields: ['rowIndex', 'ipctClNm','ipctClCd', 'nbrgAtrbtNm', 'actvStsCd']
                        , id: 'CAPCM200Grid'
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
							, {text: bxMsg('cbb_items.AT#ipctClNm'),width: 160,flex: 1, dataIndex: 'ipctClNm',editor: 'textfield', style: 'text-align:center', align: 'center'}
	                        ,{
	                            text: bxMsg('cbb_items.AT#ipctClCd'),
	                            flex: 1,
	                            dataIndex: 'ipctClCd',
	                            style: 'text-align:center',
	                            align: 'center',
	                            code: 'A0889',
	                            hidden: true,
	                            renderer: function (val) {
	                                return val ? bxMsg('cbb_items.CDVAL#A0889' + val) : '';
	                            }
	                        }
                            , {text: bxMsg('cbb_items.AT#nbrgAtrbtNm'),width: 160,flex: 1, dataIndex: 'nbrgAtrbtNm',editor: 'textfield', style: 'text-align:center', align: 'left'}
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
                         
                        ] // end of columns
                        , listeners: {
                            click: {
                                element: 'body'
                                , fn: function () {
                                    that.clickGridIpctBasicInfo();
                                    that.clickGridIpctDetailInfo();
                                }
                            }
                        }
                    });


                    this.CAPCM200ProfileGrid = new ExtGrid({
                        /* ------------------------------------------------------------ */
                        // 그리드 컬럼 정의
                        fields: ['rowIndex', 'ipctPrflAtrbtNm', 'ipctPrflCntnt', 'ipctClCd','ipctPrflNm']
                        , id: 'CAPCM200ProfileGrid'
                        , columns: [
                            {
                                text: 'No.',
                                dataIndex: 'rowIndex',
                                sortable: false,
                                width: 80,
                                height: 25,
                                style: 'text-align:center',
                                align: 'center',
                                // other config you need....
                                renderer: function (value, metaData, record, rowIndex) {
                                    return rowIndex + 1;
                                }
                            },
                            {
                                text: bxMsg('cbb_items.SCRNITM#ipctPrflNm'),
                                flex: 1,
                                dataIndex: 'ipctPrflNm',
                                style: 'text-align:center',
                                align: 'left'
                            },
                            {
                                text: bxMsg('cbb_items.SCRNITM#ipctPrflNm'),
                                flex: 1,
                                dataIndex: 'ipctPrflAtrbtNm',
                                style: 'text-align:center',
                                align: 'left',
                                hidden : true
                            },
                            {
                                text: bxMsg('cbb_items.SCRNITM#settingVal'),
                                flex: 2,
                                dataIndex: 'ipctPrflCntnt',
                                style: 'text-align:center',
                                align: 'left',
                                editor: 'textfield'
                            },
                            {
                            	text: bxMsg('cbb_items.SCRNITM#ipctClCd'),
                            	dataIndex: 'ipctClCd',
                            	hidden : true
                            }
                        ] // end of columns

                        // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                        , gridConfig: {
                            // 셀 에디팅 플러그인
                            plugins: [
                                Ext.create('Ext.grid.plugin.CellEditing', {
                                    // 2번 클릭시, 에디팅할 수 있도록 처리
                                    clicksToEdit: 2
                                }) // end of Ext.create
                            ] // end of plugins
                        } // end of gridConfig
                    });
                }



                /**
                 * 그리드 행 더블클릭
                 */
                , clickGridIpctBasicInfo: function () {


                    var that = this;
                    var selectedRecord = that.CAPCM200Grid.grid.getSelectionModel().selected.items[0];


                    if (!selectedRecord) {
                        return;
                    } else {
                	   that.$el.find('.CAPCM200-detail-table [data-form-param="ipctClCd"]').prop("disabled", true);
                	   that.$el.find('.CAPCM200-detail-table [data-form-param="nbrgAtrbtNm"]').prop("disabled", true);
                    	that.$el.find('.CAPCM200-detail-table [data-form-param="ipctClCd"]').val(selectedRecord.data.ipctClCd);
                    	that.$el.find('.CAPCM200-detail-table [data-form-param="nbrgAtrbtNm"]').val(selectedRecord.data.nbrgAtrbtNm);
                    	that.$el.find('.CAPCM200-detail-table [data-form-param="actvStsCd"]').val(selectedRecord.data.actvStsCd);
//                    	that.$el.find('.CAPCM011-detail-table [data-form-param="chineseNm"]').val(selectedRecord.data.chineseNm);
//
//
//                    	that.$el.find('.CAPCM011-detail-table [data-form-param="engWrdNm"]').prop("readonly", true);
//                    	that.$el.find('.CAPCM011-detail-table [data-form-param="stdEngAbrvtnNm"]').prop("readonly", true);
//                    	that.$el.find('.CAPCM011-detail-table #btn-CAPCM011-stdAbrvtn').hide();
                    }
                }
                

                /**
                 * 그리드 행 더블클릭 시, 프로파일 항목 리스트 조회
                 */
                , clickGridIpctDetailInfo: function () {
                    // header 정보 set
                    var that = this;
                    that.$el.find('#btn-CAPCM200-grid-add').prop("disabled", true);
                    var sParam = {};
                    var ipctClCd ={};
                    
	                ipctClCd = that.CAPCM200Grid.grid.getSelectionModel().selected.items[0].data.ipctClCd;
	        		if( ipctClCd == null || ipctClCd =="" ){
	        			ipctClCd =  that.$el.find('.CAPCM200-base-table [data-form-param="ipctClCd"]').val();
	        		}
	        		if( ipctClCd == null){
	             		fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0061'));
	            		return;
	        		}
	        		sParam.ipctClCd = ipctClCd;
                    sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
      

                    var linkData = {"header": fn_getHeader("CAPCM2008402"), "CaIpctClPrflListIn": sParam};

                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                var tbList = responseData.CaIpctClPrflListOut.ipctClPrflInfoList;
                                var totCnt = responseData.CaIpctClPrflListOut.ipctClPrflInfoList.length;


                                if (tbList != null || tbList.length > 0) {
                                    that.CAPCM200ProfileGrid.setData(tbList);
                                    that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                    that.$el.find('#btn-CAPCM200-grid-add').prop("disabled", true);
                                    that.$el.find('#btn-CAPCM200-grid-refresh').prop("disabled", true);
                                    // 삭제 로우 초기화
                                //    that.deleteList = [];
                                  //  that.resetDetailArea();
                                }
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }
                /**
                 * render
                 */
                , render: function () {
                    // set page template
                    this.$el.html(this.tpl());
                    // 단일탭 그리드 렌더
                    this.$el.find("#CAPCM200-grid").html(this.CAPCM200Grid.render({'height': CaGridHeight}));
                    this.$el.find("#CAPCM200-profileGrid").html(this.CAPCM200ProfileGrid.render({'height': CaGridHeight}));
                	this.setComboBoxes();
                	
                	//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPCM200-wrap #btn-detail-save')
                                        		,this.$el.find('.CAPCM200-wrap #btn-CAPCM200-grid-save')
                                        			   ]);
                    return this.$el;
                }
                ,setComboBoxes: function () {
                    var sParam = {};


                    sParam = {};
                    sParam.className = "CAPCM200-ipctClCd-wrap";
                    sParam.targetId = "ipctClCd";
                    sParam.nullYn = "Y";
                    sParam.cdNbr = "A0889";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                    fn_getCodeList(sParam, this);   // 속성타입코드
                    
                    sParam = {};
                    sParam.className = "CAPCM200-ipctClCd2-wrap";
                    sParam.targetId = "ipctClCd";
                    sParam.nullYn = "N";
                    sParam.cdNbr = "A0889";
                    fn_getCodeList(sParam, this);   // 속성타입코드
                    
                    sParam = {};
                    sParam.className = "CAPCM200-actvStsCd-wrap";
                    sParam.targetId = "actvStsCd";
                    sParam.nullYn = "N";
                    sParam.cdNbr = "A0439";
                    fn_getCodeList(sParam, this);   // 활동상태코드
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
                 * 기본부 초기화
                 */
                , resetBaseArea: function () {
                    var that = this;


                    that.$el.find('.CAPCM200-base-table [data-form-param="ipctClCd"]').val("");

                    that.CAPCM200Grid.resetData();
                }
                /**
                 * 프로파일 그리드 항목 초기화
                 */
                , resetPfrlArea: function () {
                    var that = this;

                    that.CAPCM200ProfileGrid.resetData();
                    that.$el.find('#btn-CAPCM200-grid-add').prop("disabled", false);
                    that.$el.find('#btn-CAPCM200-grid-refresh').prop("disabled", false);
                }

                
                //상세부 초기화
                , resetDetailArea : function() {
                	var that = this;

             	    that.$el.find('.CAPCM200-detail-table [data-form-param="ipctClCd"]').prop("disabled", false);
            	    that.$el.find('.CAPCM200-detail-table [data-form-param="nbrgAtrbtNm"]').prop("disabled", false);
                    that.$el.find('#btn-CAPCM200-grid-add').prop("disabled", false);
                    that.$el.find('#btn-CAPCM200-grid-refresh').prop("disabled", false);
                	that.$el.find('.CAPCM200-detail-table [data-form-param="ipctClCd"]').val("");
                	that.$el.find('.CAPCM200-detail-table [data-form-param="actvStsCd"]').val("");
                	that.$el.find('.CAPCM200-detail-table [data-form-param="nbrgAtrbtNm"]').val("");
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


                    sParam.ipctClCd = that.$el.find('.CAPCM200-base-table [data-form-param="ipctClCd"]').val();
                    sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
      

                    var linkData = {"header": fn_getHeader("CAPCM2008401"), "CaIpctClPrflListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                var tbList = responseData.CaIpctClPrflListOut.ipctClInfoList;
                                var totCnt = responseData.CaIpctClPrflListOut.ipctClInfoList.length;


                                if (tbList != null || tbList.length > 0) {
                                    that.CAPCM200Grid.setData(tbList);
                                    that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                    // 삭제 로우 초기화
                                //    that.deleteList = [];
                                  //  that.resetDetailArea();
                                }
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                } // end


                // 상세 저장 버튼 클릭
                , clickSaveDetail : function(event) {
                	this.saveDetail();
                //	fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveDetail, this);
                }


                // 상세 저장
                , saveDetail : function() {
                    // header 정보 set
                    var that = this;
                    var sParam = {};
    				//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }

                    sParam.ipctClCd = that.$el.find('.CAPCM200-detail-table [data-form-param="ipctClCd"]').val();
                    sParam.nbrgAtrbtNm = that.$el.find('.CAPCM200-detail-table [data-form-param="nbrgAtrbtNm"]').val();
                    sParam.actvStsCd = that.$el.find('.CAPCM200-detail-table [data-form-param="actvStsCd"]').val();                    
                    sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
      

                    var linkData = {"header": fn_getHeader("CAPCM2008502"), "CaIpctClInfoIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }

                /**
                 * 그리드 행 더블클릭
                 */
                , doubleiClickGrid: function () {


                    var that = this;
                    var selectedRecord = that.CAPCM200Grid.grid.getSelectionModel().selected.items[0];


                    if (!selectedRecord) {
                        return;
                    } else {
                    	that.$el.find('.CAPCM200-detail-table [data-form-param="ipctClCd"]').val(selectedRecord.data.ipctClCd);
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
                	fn_pageLayerCtrl("#CAPCM200-grid", this.$el.find("#btn-up-grid"));
                }


                // 상세영역 toggle
                , detailModal : function() {
                	var that = this;
                	fn_pageLayerCtrl(".CAPCM200-detail-table", this.$el.find("#btn-detail-modal"));
                }


                // 그리드 내용 엑셀 다운로드
                , gridExcel : function() {
                	var that = this;
                	that.CAPCM200Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM200')+"_"+getCurrentDate("yyyy-mm-dd"));
                }
                
                // 그리드 신규 생성(추가)
                // 그리드 신규 생성(추가)
                , gridAdd : function() {
                	var that = this;
                	 var sParam = {};
                     var linkData = {"header": fn_getHeader("CAPCM2008403"), "DummyIO": sParam};
                     that.CAPCM200ProfileGrid.resetData();

                     // ajax호출
                     bxProxy.post(sUrl, JSON.stringify(linkData), {
                         enableLoading: true
                         , success: function (responseData) {
                             if (fn_commonChekResult(responseData)) {
                                 var tbList = responseData.CaIpctClPrflListOut.ipctClPrflInfoList;
                                 var totCnt = responseData.CaIpctClPrflListOut.ipctClPrflInfoList.length;


                                 if (tbList != null || tbList.length > 0) {
                                     that.CAPCM200ProfileGrid.setData(tbList);
                                     that.$el.find('#btn-CAPCM200-grid-add').prop("disabled", true);
                                     //that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                 }
                             }
                         }   // end of suucess: fucntion
                     }); // end of bxProxy
                 } // end
                
                // 프로파일명세값 저장
                , clickSaveGrid : function() {
                	var that = this;
                	 var prflAtrbtNmList = {};
                	 var sParam = {};
                	 var ipctClCd = {};
                	 var chngTgtTbl = [];
                	 ipctClCd = that.CAPCM200Grid.grid.getSelectionModel().selected.items[0].data.ipctClCd;
            		 if( ipctClCd == null || ipctClCd =="" ){
            			 ipctClCd =  that.$el.find('.CAPCM200-base-table [data-form-param="ipctClCd"]').val();
            		 }
            		 if( ipctClCd == null){
                 		fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0061'));
                		return;
            		 }
            		 
     				//배포처리[과제식별자 체크]
                     if (!fn_headerTaskIdCheck()){
                         return;
                     }
                     
                	 for (var i = 0; i < that.CAPCM200ProfileGrid.store.getRange().length; i++){
                		 prflAtrbtNmList = {};
                		 prflAtrbtNmList.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                		 prflAtrbtNmList.ipctPrflAtrbtNm = that.CAPCM200ProfileGrid.store.getAt(i).data.ipctPrflAtrbtNm;
                		 prflAtrbtNmList.ipctPrflCntnt = that.CAPCM200ProfileGrid.store.getAt(i).data.ipctPrflCntnt;
                		 prflAtrbtNmList.ipctClCd = ipctClCd;
                		
                		 chngTgtTbl.push(prflAtrbtNmList);
					 }
                	sParam.prflAtrbtNmList = chngTgtTbl;
                     var linkData = {"header": fn_getHeader("CAPCM2008501"), "CaIpctPrflAtrbtNmListIn": sParam};
                     // ajax호출
                     bxProxy.post(sUrl, JSON.stringify(linkData), {
                         enableLoading: true
                         , success: function (responseData) {
                             if (fn_commonChekResult(responseData)) {
                            	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                             }
                         }   // end of suucess: fucntion
                     }); // end of bxProxy
                 } // end

            })
            ; // end of Backbone.View.extend({


        return CAPCM200View;
    } // end of define function
)
; // end of define
