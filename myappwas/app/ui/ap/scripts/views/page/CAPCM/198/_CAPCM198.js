define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPCM/198/_CAPCM198.html'
        , 'bx-component/ext-grid/_ext-grid'
    ]
    , function (config
        , tpl
        , ExtGrid
        ) {


        /**
         * Backbone
         */
        var CAPCM198View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPCM198page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                    'click #btn-base-reset': 'resetBaseArea'
                    , 'click #btn-base-search': 'queryBaseArea'
                	, 'click #btn-base-search-modal': 'baseSearchModal'


        			, 'click #btn-CAPCM198-grid-delete': 'clickDeleteGrid'
    				, 'click #btn-CAPCM198-grid-excel': 'gridExcel'
					, 'click #btn-up-grid': 'gridAreaModal'


    				, 'click #btn-detail-refresh': 'resetDetailArea'
					, 'click #btn-detail-save': 'clickSaveDetail'
					, 'click #btn-detail-modal': 'detailModal'


					, 'click #btn-CAPCM198-stdAbrvtn': 'fn_createStdAbrvtn'
				    , 'keydown #searchKey' : 'fn_enter'
				    , 'keyup #stdEngAbrvtnNmKey': 'pressInputLengthChk'
                }


                /**
                 * initialize
                 */
                , initialize: function (initData) {
                    var that = this;
                    that.that = this;


                    var deleteList = [];


                    $.extend(that, initData);
                    that.$el.html(that.tpl());


                    /* ------------------------------------------------------------ */
                    that.CAPCM198Grid = new ExtGrid({
                        /* ------------------------------------------------------------ */
                        // 단일탭 그리드 컬럼 정의
                        fields: ['rowIndex', 'atrbtDmnGrpCd', 'atrbtDmnNm', 'atrbtDmnEngNm', 'loginLngDmn','engNm','koreanNm', 'chineseNm']
                        , id: 'CAPCM198Grid'
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
                                text: bxMsg('cbb_items.SCRNITM#abrvtnDmnGrp'),
                                flex: 1,
                                dataIndex: 'atrbtDmnGrpCd',
                                style: 'text-align:center',
                                align: 'center',
                                code: 'A0797',
                                renderer: function (val) {
                                    return val ? bxMsg('cbb_items.CDVAL#A0797' + val) : '';
                                }
                            }
                            , {text: bxMsg('cbb_items.AT#dmnNm'),width: 160,flex: 1, dataIndex: 'atrbtDmnNm',editor: 'textfield', style: 'text-align:center', align: 'left'}
                            , {text: bxMsg('cbb_items.SCRNITM#abrvtnDmnEngNm'),width: 160,flex: 1,dataIndex: 'atrbtDmnEngNm',editor: 'textfield', style: 'text-align:center', align: 'left'}
                            , {text: bxMsg('cbb_items.SCRNITM#loginLngDmn'),width: 160,flex: 1,dataIndex: 'loginLngDmn',editor: 'textfield', style: 'text-align:center', align: 'left'}
                            , {text: bxMsg('cbb_items.AT#engNm'),width: 160,flex: 1,dataIndex: 'engNm',editor: 'textfield', style: 'text-align:center', align: 'left'}
                            , {text: bxMsg('cbb_items.AT#koreanNm'),width: 160,flex: 1,dataIndex: 'koreanNm',editor: 'textfield', style: 'text-align:center', align: 'left'}
                            , {text: bxMsg('cbb_items.AT#chineseNm'),width: 160,flex: 1,dataIndex: 'chineseNm',editor: 'textfield', style: 'text-align:center', align: 'left'}
                            , {
                             	xtype: 'actioncolumn', width: 80, align: 'center',text: "",
                             	items: [
												{
												//  icon: 'images/icon/x-delete-16.png'
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
                    // 단일탭 그리드 렌더
                    that.createGrid("single");
                }


                /**
                 * render
                 */
                , render: function () {

                	this.setComboBoxes();
                	
                	//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPCM198-wrap #btn-CAPCM198-grid-delete')
                                        		,this.$el.find('.CAPCM198-wrap #btn-detail-save')
                                        			   ]);
                    
                	
                    return this.$el;
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
                
                ,setComboBoxes: function () {
                    var sParam = {};


                    sParam = {};
                    sParam.className = "CAPCM0198-abrvtnDmnGrpCd-wrap";
                    sParam.targetId = "abrvtnDmnGrpCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                    sParam.cdNbr = "A0797";
                    fn_getCodeList(sParam, this);   // 속성타입코드

                }
                /**
                 * 입력 length 체크
                 */
                ,pressInputLengthChk: function (event) {
	                var that = this;
                    var targetValue = event.target.value;
                    if(targetValue.length >= 10){
                    	fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0057'));
                    	that.$el.find('.CAPCM198-detail-table [data-form-param="stdEngAbrvtnNm"]').val(targetValue.substring(0,5));
                    	return;
                    }




                }


                /**
                 * 기본부 초기화
                 */
                , resetBaseArea: function () {
                    var that = this;


                    that.$el.find('.CAPCM198-base-table [data-form-param="abrvtnDmnGrpCd"]').val("");
                    that.$el.find('.CAPCM198-base-table [data-form-param="dmnNm"]').val("");
                    that.$el.find('.CAPCM198-base-table [data-form-param="atrbtDmnEngNm"]').val("");
                    that.$el.find('.CAPCM198-base-table [data-form-param="loginLngDmn"]').val("");


                    that.CAPCM198Grid.resetData();
                }


                //상세부 초기화
                , resetDetailArea : function() {
                	var that = this;


                	that.$el.find('.CAPCM198-detail-table [data-form-param="abrvtnDmnGrpCd"]').val("");
                	that.$el.find('.CAPCM198-detail-table [data-form-param="dmnNm"]').val("");
                	that.$el.find('.CAPCM198-detail-table [data-form-param="atrbtDmnEngNm"]').val("");


//                	that.$el.find('.CAPCM198-detail-table [data-form-param="engWrdNm"]').prop("readonly", false);
//                	that.$el.find('.CAPCM198-detail-table [data-form-param="stdEngAbrvtnNm"]').prop("readonly", false);
//                	that.$el.find('.CAPCM198-detail-table #btn-CAPCM198-stdAbrvtn').show();
                	that.$el.find('.CAPCM198-detail-table [data-form-param="dmnNm"]').prop("readonly", false);

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

                    sParam.atrbtDmnNm = that.$el.find('.CAPCM198-base-table [data-form-param="dmnNm"]').val(); // 도메인명
                    sParam.atrbtDmnGrpCd = that.$el.find('.CAPCM198-base-table [data-form-param="abrvtnDmnGrpCd"]').val(); // 도메인그룹코드
                    sParam.atrbtDmnEngNm = that.$el.find('.CAPCM198-base-table [data-form-param="atrbtDmnEngNm"]').val(); // 속성영문명
                    sParam.loinLngDmnNm = that.$el.find('.CAPCM198-base-table [data-form-param="loginLngDmn"]').val(); // 로그인언어명


                    var linkData = {"header": fn_getHeader("CAPCM0198101"), "CaDmnMgmtSvcIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                var tbList = responseData.CaDmnMgmtSvcListOut.tblNm;
                                var totCnt = responseData.CaDmnMgmtSvcListOut.totCnt;


                                if (tbList != null || tbList.length > 0) {
                                    that.CAPCM198Grid.setData(tbList);
                                    that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                    // 삭제 로우 초기화
                                    that.deleteList = [];
                                    that.resetDetailArea();
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
                	var tbl = [];
                	var sParam = {};


                	if(that.deleteList.length > 0) {
                		$(that.deleteList).each(function(idx, data) {
                			var delParam = {};
                			delParam.atrbtDmnNm = data.atrbtDmnNm;
                			delParam.atrbtDmnEngNm = data.atrbtDmnEngNm;
                			tbl.push(delParam);
                		});


                		sParam.tblNm = tbl;


                		var linkData = {"header": fn_getHeader("CAPCM0198401"), "CaDmnMgmtSvcListIn": sParam};


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
                 	if($.sessionStorage('staffId') !="0000000002" && $.sessionStorage('staffId') !="0000000214" && $.sessionStorage('staffId') !="000000000001210"  ){
                		fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0060'));
                		return;
                	}
                 	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                	fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveDetail, this);
                }


                // 상세 저장
                , saveDetail : function(that) {


                	 var sParam = {};
                	 var srvcCd = "CAPCM0198201";
                     
                     sParam.atrbtDmnNm = that.$el.find('.CAPCM198-detail-table [data-form-param="dmnNm"]').val(); // 도메인명
                     sParam.atrbtDmnGrpCd = that.$el.find('.CAPCM198-detail-table [data-form-param="abrvtnDmnGrpCd"]').val(); // 도메인그룹코드
                     sParam.atrbtDmnEngNm = that.$el.find('.CAPCM198-detail-table [data-form-param="atrbtDmnEngNm"]').val(); // 속성영문명

                     var linkData = {"header": fn_getHeader(srvcCd), "CaDmnMgmtSvcIn": sParam};


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


                //약어명 생성 Btn click
                , fn_createStdAbrvtn: function () {
                    var that = this;
                    var sParam = {};


                    // 영문단어명 뺴고 초기화
                    that.$el.find('.CAPCM198-detail-table [data-form-param="stdEngAbrvtnNm"]').val("");
                	that.$el.find('.CAPCM198-detail-table [data-form-param="koreanNm"]').val("");
                	that.$el.find('.CAPCM198-detail-table [data-form-param="chineseNm"]').val("");


                	that.$el.find('.CAPCM198-detail-table [data-form-param="engWrdNm"]').prop("readonly", false);
                	that.$el.find('.CAPCM198-detail-table [data-form-param="stdEngAbrvtnNm"]').prop("readonly", false);
                	that.$el.find('.CAPCM198-detail-table #btn-CAPCM198-stdAbrvtn').show();


                    //서비스 개별부 set
                    sParam.engWrdNm = that.$el.find('.CAPCM198-detail-table [data-form-param="engWrdNm"]').val();


                    var linkData = {"header": fn_getHeader("CAPCM1988402"), "StdAbrvtnMgmtSvcCofirmStdAbrvtnIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                    	enableLoading: true,
                        success: function (responseData) {


                            if (fn_commonChekResult(responseData)) {
                                var cofirmStdAbrvtnOut = responseData.CaStdAbrvtnMgmtSvcCofirmStdAbrvtnOut;


                                if (!fn_isNull(cofirmStdAbrvtnOut) && !fn_isNull(cofirmStdAbrvtnOut.stdEngAbrvtnNm)) {
                                	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                    that.$el.find('.CAPCM198-detail-table [data-form-param="stdEngAbrvtnNm"]').val(cofirmStdAbrvtnOut.stdEngAbrvtnNm);
                                }
                            }
                        }   // end of suucess: fucntion
                    });     // end of bxProxy
                }


                /**
                 * 그리드 생성
                 */
                , createGrid: function () {
                    var that = this;


                    this.$el.find(".CAPCM198-grid").html(this.CAPCM198Grid.render({'height': CaGridHeight}));
                } // end of createGrid


                /**
                 * 그리드 행 더블클릭
                 */
                , doubleiClickGrid: function () {


                    var that = this;
                    var selectedRecord = that.CAPCM198Grid.grid.getSelectionModel().selected.items[0];


                    if (!selectedRecord) {
                        return;
                    } else {
                    	that.$el.find('.CAPCM198-detail-table [data-form-param="dmnNm"]').prop("readonly", true);
                    	that.$el.find('.CAPCM198-detail-table [data-form-param="abrvtnDmnGrpCd"]').val(selectedRecord.data.atrbtDmnGrpCd);
                    	that.$el.find('.CAPCM198-detail-table [data-form-param="dmnNm"]').val(selectedRecord.data.atrbtDmnNm);
                    	that.$el.find('.CAPCM198-detail-table [data-form-param="atrbtDmnEngNm"]').val(selectedRecord.data.atrbtDmnEngNm);
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
                	fn_pageLayerCtrl("#CAPCM198-grid", this.$el.find("#btn-up-grid"));
                }


                // 상세영역 toggle
                , detailModal : function() {
                	var that = this;
                	fn_pageLayerCtrl(".CAPCM198-detail-table", this.$el.find("#btn-detail-modal"));
                }


                // 그리드 내용 엑셀 다운로드
                , gridExcel : function() {
                	var that = this;
                	that.CAPCM198Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM198')+"_"+getCurrentDate("yyyy-mm-dd"));
                }
            })
            ; // end of Backbone.View.extend({


        return CAPCM198View;
    } // end of define function
)
; // end of define
