define(
	    [
	        'bx/common/config', 
	        'text!app/views/page/CAPCM/201/_CAPCM201.html',
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
        var CAPCM201View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPCM201-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                    'click #btn-base-reset': 'resetBaseArea'
                    , 'click #btn-base-search': 'queryBaseArea'
                	, 'click #btn-base-search-modal': 'baseSearchModal'


        			, 'click #btn-CAPCM201-grid-delete': 'clickDeleteGrid'
    				, 'click #btn-CAPCM201-grid-excel': 'gridExcel'
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
                    this.CAPCM201Grid = new ExtGrid({
                        /* ------------------------------------------------------------ */
                        // 단일탭 그리드 컬럼 정의
                        fields: ['rowIndex', 'ipctClCd', 'nbrgAtrbtNm', 'actvStsCd']
                        , id: 'CAPCM201Grid'
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
	                            text: bxMsg('cbb_items.AT#ipctClCd'),
	                            flex: 1,
	                            dataIndex: 'ipctClCd',
	                            style: 'text-align:center',
	                            align: 'center',
	                            code: 'A0889',
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
                                    that.clickGridOfServiceInputItem();
                                }
                            }
                        }
                    });
                }



                /**
                 * render
                 */
                , render: function () {
                    // set page template
                    this.$el.html(this.tpl());
                    // 단일탭 그리드 렌더
                    this.$el.find("#CAPCM201-grid").html(this.CAPCM201Grid.render({'height': CaGridHeight}));
                	this.setComboBoxes();
                    return this.$el;
                }
                ,setComboBoxes: function () {
                    var sParam = {};


                    sParam = {};
                    sParam.className = "CAPCM201-ipctClCd-wrap";
                    sParam.targetId = "ipctClCd";
                    sParam.nullYn = "Y";
                    sParam.cdNbr = "A0889";
                    fn_getCodeList(sParam, this);   // 속성타입코드
                    
                    sParam = {};
                    sParam.className = "CAPCM201-actvStsCd-wrap";
                    sParam.targetId = "actvStsCd";
                    sParam.nullYn = "Y";
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


                    that.$el.find('.CAPCM201-base-table [data-form-param="ipctClCd"]').val("");

                    that.CAPCM201Grid.resetData();
                }


                //상세부 초기화
                , resetDetailArea : function() {
                	var that = this;


                	that.$el.find('.CAPCM201-detail-table [data-form-param="ipctClCd"]').val("");
                	that.$el.find('.CAPCM201-detail-table [data-form-param="actvStsCd"]').val("");
                	that.$el.find('.CAPCM201-detail-table [data-form-param="nbrgAtrbtNm"]').val("");
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


                    sParam.ipctClCd = that.$el.find('.CAPCM201-base-table [data-form-param="ipctClCd"]').val();
      

//                    var linkData = {"header": fn_getHeader("CAPCM2018401"), "CaStdAbrvtnMgmtSvcGetStdAbrvtnListIn": sParam};
//
//
//                    // ajax호출
//                    bxProxy.post(sUrl, JSON.stringify(linkData), {
//                        enableLoading: true
//                        , success: function (responseData) {
//                            if (fn_commonChekResult(responseData)) {
//                                var tbList = responseData.CaStdAbrvtnMgmtSvcGetStdAbrvtnListOut.abrvtnList;
//                                var totCnt = responseData.CaStdAbrvtnMgmtSvcGetStdAbrvtnListOut.totCnt;
//
//
//                                if (tbList != null || tbList.length > 0) {
//                                    that.CAPCM201Grid.setData(tbList);
//                                    that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
//                                    // 삭제 로우 초기화
//                                    that.deleteList = [];
//                                    that.resetDetailArea();
//                                }
//                            }
//                        }   // end of suucess: fucntion
//                    }); // end of bxProxy
                } // end


                // 상세 저장 버튼 클릭
                , clickSaveDetail : function(event) {
                	fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveDetail, this);
                }


                // 상세 저장
                , saveDetail : function(that) {

                }

                /**
                 * 그리드 행 더블클릭
                 */
                , doubleiClickGrid: function () {


                    var that = this;
                    var selectedRecord = that.CAPCM201Grid.grid.getSelectionModel().selected.items[0];


                    if (!selectedRecord) {
                        return;
                    } else {
                    	that.$el.find('.CAPCM201-detail-table [data-form-param="ipctClCd"]').val(selectedRecord.data.ipctClCd);
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
                	fn_pageLayerCtrl("#CAPCM201-grid", this.$el.find("#btn-up-grid"));
                }


                // 상세영역 toggle
                , detailModal : function() {
                	var that = this;
                	fn_pageLayerCtrl(".CAPCM201-detail-table", this.$el.find("#btn-detail-modal"));
                }


                // 그리드 내용 엑셀 다운로드
                , gridExcel : function() {
                	var that = this;
                	that.CAPCM201Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM201')+"_"+getCurrentDate("yyyy-mm-dd"));
                }
            })
            ; // end of Backbone.View.extend({


        return CAPCM201View;
    } // end of define function
)
; // end of define
