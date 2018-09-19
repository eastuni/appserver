define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPCM/100/_CAPCM100.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , ExtGrid
        ) {


        /**
         * Backbone
         */
        var CAPCM100View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPCM100page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                    'click #btn-base-reset': 'resetBaseArea'
                    , 'click #btn-base-search': 'queryBaseArea'
                	, 'click #btn-base-search-modal': 'baseSearchModal'


        			, 'click #btn-CAPCM100-grid-delete': 'clickDeleteGrid'
    				, 'click #btn-CAPCM100-grid-excel': 'gridExcel'
    				, 'click #btn-CAPCM100-grid-add': 'addRow'
					, 'click #btn-up-grid': 'gridAreaModal'


    				, 'click #btn-detail-refresh': 'resetDetailArea'
					, 'click #btn-detail-save': 'clickSaveDetail'
					, 'click #btn-detail-modal': 'detailModal'


					, 'click #btn-CAPCM100-stdAbrvtn': 'fn_createStdAbrvtn'
				    , 'keydown #searchKey' : 'fn_enter'
				    , 'keyup #stdEngAbrvtnNmKey': 'pressInputLengthChk'
                }


                /**
                 * initialize
                 */
                , initialize: function (initData) {
                    var that = this;
                    that.that = this;
                    
                    var isEdit = false;


                    var deleteList = [];
                    that.resetDetailArea();

                    $.extend(that, initData);
                    that.$el.html(that.tpl());
                    // 콤보조회 서비스호출 준비
                    var sParam = {};

                    // 컴포넌트
                    sParam = {};
                    sParam.cdNbr = "11601";
                    var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};

                    /* ========================================================== */
                    bxProxy.all([
                        /* ========================================================== */
                        // 제한유형콤보로딩
                        {

                        	 url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {
                                 if (fn_commonChekResult(responseData)) {
                                     comboStore1 = new Ext.data.Store({
                                         fields: ['cd', 'cdNm'],
                                         data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                     });
                              }
                        }
                        }
             	          ], {
                        success: function () {


                        }
                    });
                
                    /* ------------------------------------------------------------ */
                    that.CAPCM100Grid = new ExtGrid({
                        /* ------------------------------------------------------------ */
                        // 단일탭 그리드 컬럼 정의
                        fields: ['rowIndex', 'baseDt', 'hldyYn', 'chkYn', 'bizDt', 'bfBfBizDt', 'bfBizDt', 'nxtBizDt', 'nxtNxtBizDt', 'dtWeekDscd',
                                 {
                                     name: 'checkUseYn',
                                     type: 'boolean',
                                     convert: function (value, record) {
                                         return record.get('hldyYn') === 'Y';
                                     }
                                 }]
                        , id: 'CAPCM100Grid'
                        	  , columns: [
                                          {
                                              text: 'No'
                                              , dataIndex: 'rowIndex'
                                              , sortable: false
                                              , width: 50
                                              , height: 25
                                              , style: 'text-align:right', align: 'center'
                                              // other config you need....
                                    	  	  , renderer: function (value, metaData, record, rowIndex, colIndex, sotre) {
                                    	  		  return rowIndex + 1;
                                    	  	  }
                                          }
                                          , {
                                              width: 60, xtype: 'checkcolumn', dataIndex: 'chkYn',
                                              stopSelection: false
                                              , hidden: true
                                              , listeners: {
                                                  click: function (_this, cell, rowIndex, eOpts) {
                                                      var checkedData = that.CAPCM100Grid.store.getAt(rowIndex);

                                                  }
                                              }
                                          }
                                          ,
                                          {
                                              text: bxMsg('cbb_items.AT#baseDt'),
                                              width: 120,
                                              dataIndex: 'baseDt',
                                              editor: 'textfield',
                                              style: 'text-align:center',
                                              align: 'center',
                                              flex: 1,
                                              renderer: function (val) {
                                            	  return XDate(val).toString('yyyy-MM-dd');
                                              }
                                          }  // 기준일자
                                          , {text: bxMsg('cbb_items.AT#hldyYn'), width: 80, dataIndex: 'hldyYn', hidden: true}  // 휴일여부
                                          , {
                                              text: bxMsg('cbb_items.AT#hldyYn')
                                              , width: 60
                                              , xtype: 'checkcolumn'
                                              , dataIndex: 'checkUseYn'
                                              , style: 'text-align:center', align: 'center'
                                              , stopSelection: false
                                              , listeners: {
                                                  click: function (_this, cell, rowIndex, eOpts, e, record) {
                                                      var currentRecord = that.CAPCM100Grid.store.getAt(rowIndex),
                                                          changedChecked = !currentRecord.get('checkUseYn');

                                                      currentRecord.set('hldyYn', changedChecked ? 'Y' : 'N');
                                                      currentRecord.set('checkUseYn', changedChecked);
                                                      record.set('chkYn', true);
                                                  }
                                              }
                                          }
                                          , {
                                              text: bxMsg('cbb_items.AT#bizDt'),
                                              width: 120,
                                              dataIndex: 'bizDt',
                                              editor: 'textfield',
                                              style: 'text-align:center',
                                              align: 'center',
                                              flex: 1,
                                              renderer: function (val) {
                                            	  return XDate(val).toString('yyyy-MM-dd');
                                              }
                                          } // 당영업일
                                          , {
                                              text: bxMsg('cbb_items.AT#bfBfBizDt'),
                                              width: 120,
                                              dataIndex: 'bfBfBizDt',
                                              editor: 'textfield',
                                              style: 'text-align:center',
                                              align: 'center',
                                              flex: 1,
                                              renderer: function (val) {
                                            	  return XDate(val).toString('yyyy-MM-dd');
                                              }
                                          }  // 전전 영업일
                                          , {
                                              text: bxMsg('cbb_items.AT#bfBizDt'),
                                              width: 120,
                                              dataIndex: 'bfBizDt',
                                              editor: 'textfield',
                                              style: 'text-align:center',
                                              align: 'center',
                                              flex: 1,
                                              renderer: function (val) {
                                            	  return XDate(val).toString('yyyy-MM-dd');
                                              }
                                          } // 전영업일
                                          , {
                                              text: bxMsg('cbb_items.AT#nxtBizDt'),
                                              width: 120,
                                              dataIndex: 'nxtBizDt',
                                              editor: 'textfield',
                                              style: 'text-align:center',
                                              align: 'center',
                                              flex: 1,
                                              renderer: function (val) {
                                            	  return XDate(val).toString('yyyy-MM-dd');
                                              }
                                          } // 익영업일
                                          , {
                                              text: bxMsg('cbb_items.AT#nxtNxtBizDt'),
                                              width: 120,
                                              dataIndex: 'nxtNxtBizDt',
                                              editor: 'textfield',
                                              style: 'text-align:center',
                                              align: 'center',
                                              flex: 1,
                                              renderer: function (val) {
                                            	  return XDate(val).toString('yyyy-MM-dd');
                                              }
                                          } // 익익영업일
                                          , {
                                              text: bxMsg('cbb_items.AT#dtWeekDscd')
                                              , width: 80
                                              , dataIndex: 'dtWeekDscd'
                                              , style: 'text-align:center'
                                              , align: 'center'
                                            	  ,flex: 1
                                          	, renderer: function (val) {
                                                  index = comboStore1.findExact('cd', val);
                                                  if (index != -1) {
                                                      rs = comboStore1.getAt(index).data;
                                                      return rs.cdNm;
                                                  }
                                              } // end of render
                                          } // end of dtWeekDscd
                                          , {
                                              text: bxMsg('cbb_items.AT#instCd')
                                              , dataIndex: 'instCd'
                                              , style: 'text-align:center'
                                              , hidden: true
                                          }
//                                          ,{
//                                              xtype: 'actioncolumn',
//                                              width: 80,
//                                              align: 'center',
//                                              text: bxMsg('cbb_items.SCRNITM#del'),
//                                              style: 'text-align:center',
//                                              items: [
//                                                  {
//                                                      //  icon: 'images/icon/x-delete-16.png'
//                                                      iconCls : "bw-icon i-25 i-func-trash",
//                                                      tooltip: bxMsg('tm-layout.delete-field'),
//                                                      handler: function (grid, rowIndex, colIndex, item, e, record) {
//                                                    	  that.deleteList.push(record.data);
//                                                          grid.store.remove(record);
//                                                      }
//                                                  }
//                                              ]
//                                          }
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
                                element: 'body',
                                fn: function () {
                                    that.selectGridOfSearchResult();
                                }
                            }
                        }
                    });
                    // 단일탭 그리드 렌더
                    that.createGrid("single");
                }
                
                /**
                 * 상단 그리드 선택
                 */
                , selectGridOfSearchResult: function () {
                    var selectedRecord = this.CAPCM100Grid.grid.getSelectionModel().selected.items[0];
                    var param = {};


                    if (!selectedRecord) {
                        return;
                    } else {
                        this.setGridDetailData(selectedRecord.data);
                    }
                }
                
                /**
                 * 표준 속성 검증 설정
                 */
                , setGridDetailData: function (data) {
                	this.$el.find('.CAPCM100-detail-table [data-form-param="bfBfBizDt"]').val(XDate(data.bfBfBizDt).toString('yyyy-MM-dd'));
                	this.$el.find('.CAPCM100-detail-table [data-form-param="baseDt"]').val(XDate(data.baseDt).toString('yyyy-MM-dd'));
                	
                	this.$el.find('.CAPCM100-detail-table [data-form-param="bfBizDt"]').val(XDate(data.bfBizDt).toString('yyyy-MM-dd'));
                	this.$el.find('.CAPCM100-detail-table [data-form-param="bizDt"]').val(XDate(data.bizDt).toString('yyyy-MM-dd'));
                	
                	this.$el.find('.CAPCM100-detail-table [data-form-param="nxtBizDt"]').val(XDate(data.nxtBizDt).toString('yyyy-MM-dd'));
                	this.$el.find('.CAPCM100-detail-table [data-form-param="nxtNxtBizDt"]').val(XDate(data.nxtNxtBizDt).toString('yyyy-MM-dd'));
                	this.$el.find('.CAPCM100-detail-table [data-form-param="baseDt"]').val(XDate(data.baseDt).toString('yyyy-MM-dd'));
                	this.$el.find('.CAPCM100-detail-table [data-form-param="hldyYn"]').val(data.hldyYn);
                	this.$el.find('.CAPCM100-detail-table [data-form-param="dtWeekDscd"]').val(data.dtWeekDscd);                    
                  //  this.$el.find('#btn-attribute-search').prop("readonly", true);
                	//this.detailEditable(true);

                	 

                }
                
                , detailEditable: function(data){
                	var that = this;
                	alert(data);
                	that.$el.find('.CAPCM100-detail-table [data-form-param="bfBfBizDt"]').prop("disabled", data);
                	that.$el.find('.CAPCM100-detail-table [data-form-param="baseDt"]').prop("disabled", data);
                	that.$el.find('.CAPCM100-detail-table [data-form-param="bfBizDt"]').prop("disabled", data);
                	that.$el.find('.CAPCM100-detail-table [data-form-param="bizDt"]').prop("disabled", data);
                	that.$el.find('.CAPCM100-detail-table [data-form-param="nxtBizDt"]').prop("disabled", data);
                	that.$el.find('.CAPCM100-detail-table [data-form-param="nxtNxtBizDt"]').prop("disabled", data);
                	that.$el.find('.CAPCM100-detail-table [data-form-param="baseDt"]').prop("disabled", data);
                	that.$el.find('.CAPCM100-detail-table [data-form-param="hldyYn"]').prop("disabled", data);
                	that.$el.find('.CAPCM100-detail-table [data-form-param="dtWeekDscd"]').prop("disabled", data);
                }
                /**
                 * render
                 */
                , render: function () {

                	this.setComboBoxes();
                	this.setDatePicker();
                	this.deleteList = [];
                	
                	//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPCM100-wrap #btn-detail-save')
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
                    sParam.className = "CAPCM100-detail-dtWeekDscd-wrap";
                    sParam.targetId = "dtWeekDscd";
                    sParam.nullYn = "N";
                    sParam.cdNbr = "11601";
                    fn_getCodeList(sParam, this);   // 요일구분
                    
                    var sParam = {};
                    sParam = {};
                    sParam.className = "CAPCM100-detail-hldyYn-wrap";
                    sParam.targetId = "hldyYn";
                    sParam.nullYn = "N";
                    sParam.cdNbr = "10000";
                    fn_getCodeList(sParam, this);   // 여부

                }
                /**
                 * 입력 length 체크
                 */
                ,pressInputLengthChk: function (event) {
	                var that = this;
                    var targetValue = event.target.value;
                    if(targetValue.length >= 10){
                    	fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0057'));
                    	that.$el.find('.CAPCM100-detail-table [data-form-param="stdEngAbrvtnNm"]').val(targetValue.substring(0,5));
                    	return;
                    }




                }


                /**
                 * 기본부 초기화
                 */
                , resetBaseArea: function () {
                    var that = this;
                    that.$el.find('.CAPCM100-base-table [data-form-param="baseDt"]').val(XDate(new Date()).toString('yyyy-MM-dd'));
                    that.CAPCM100Grid.resetData();
                }


                //상세부 초기화
                , resetDetailArea : function() {
                	var that = this;
                	
                	that.$el.find('.CAPCM100-detail-table [data-form-param="baseDt"]').val('');
                	that.$el.find('.CAPCM100-detail-table [data-form-param="bfBfBizDt"]').val('');
                	that.$el.find('.CAPCM100-detail-table [data-form-param="bfBizDt"]').val('');
                	that.$el.find('.CAPCM100-detail-table [data-form-param="bizDt"]').val('');
                	that.$el.find('.CAPCM100-detail-table [data-form-param="nxtBizDt"]').val('');
                	that.$el.find('.CAPCM100-detail-table [data-form-param="nxtNxtBizDt"]').val('');
                	that.$el.find('.CAPCM100-detail-table [data-form-param="dtWeekDscd"]').val('');
                	that.$el.find('.CAPCM100-detail-table [data-form-param="hldyYn"]').val('');
                	
                	//that.detailEditable(false);
                	


                }
                /**
                 * 기본부 조회 버튼 클릭
                 */
                , queryBaseArea: function () {
                    var that = this;
                    that.inquiryBaseData();
                }


                /**
                 * 기본부 정보로 그리드 조회
                 */
                , inquiryBaseData: function () {
                    var that = this;
                    var sParam = {};

                    // 조회 key값 set
                    sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                    sParam.baseDt = fn_getDateValue(that.$el.find('#search-area [data-form-param="baseDt"]').val());
                    sParam.pgCnt = 200;
                    sParam.pgNbr = 1;

                    var linkData = {"header": fn_getHeader("CAPCM1008401"), "CaBizDtMgmtSvcGetBizDtIn": sParam};
                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true,
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                var tbList = responseData.CaBizDtMgmtSvcGetBizDtListOut.bizDtList;
                                var totalCount = responseData.CaBizDtMgmtSvcGetBizDtListOut.totalCount;

                                // 페이징 을 설정 한다.
                              //  that.subViews['indexPaging'].setPaging(pgNbr, totalCount);
                                if (tbList != null || tbList.length > 0) {
                                	 that.CAPCM100Grid.setData(tbList);
                                }
                            }
                        }   // end of suucess: fucntion
                    });     // end of bxProxy
                } // end


                // 그리드 저장(삭제)버튼 클릭
                , clickDeleteGrid : function(event) {
                	if(this.deleteList.length < 1) {
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
                			delParam.instCd = $.sessionStorage('headerInstCd');
                			delParam.baseDt = XDate(data.baseDt).toString('yyyyMMdd');
                			
                			tbl.push(delParam);
                		});


                		sParam.regBizDtList = tbl;


                		var linkData = {"header": fn_getHeader("CAPCM1008301"), "CaBizDtMgmtSvcRegBizDtIn": sParam};


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
                	this.saveDetail();
                }


                // 상세 저장
                , saveDetail2 : function() {
                    var that = this;
                    var checkdedAllData = that.CAPCM100Grid.getFilteredRecords('chkYn', true); // 체크된 데이터 가지고 오기
                    var sParam = {};
                    var gridData = [];

                    var instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드

                    // header 정보 set
                    var header = new Object();
                    var headerParam = {};

                    if (checkdedAllData.length > 0) {

                        for (var idx in checkdedAllData) {

                            var sub = {};
                            sub.baseDt = checkdedAllData[idx].baseDt;
                            sub.hldyYn = checkdedAllData[idx].hldyYn;
                            sub.bizDt = checkdedAllData[idx].bizDt;
                            sub.bfBfBizDt = checkdedAllData[idx].bfBfBizDt;
                            sub.bfBizDt = checkdedAllData[idx].bfBizDt;
                            sub.nxtBizDt = checkdedAllData[idx].nxtBizDt;
                            sub.nxtNxtBizDt = checkdedAllData[idx].nxtNxtBizDt;
                            sub.instCd = instCd;

                            gridData.push(sub);
                        }

                        sParam.regBizDtList = gridData;

                        var linkData = {"header": fn_getHeader("CAPCM1008101"), "CaBizDtMgmtSvcRegBizDtListIn": sParam};

                        //ajax 호출
                        bxProxy.post(sUrl, JSON.stringify(linkData), {
                            //loading 설정
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));

                                    // 완료 후 재조회
                                    that.trigger('loadData', '');
                                }
                            }
                        });
                    } else {
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-change-data-msg'));
                    }// if(changedAllData.length > 0)의  끝
                }
                ,setDetailArea : function(){
                	var sParam = {};
                	sParam.baseDt =  that.$el.find('.CAPCM100-detail-table [data-form-param="baseDt"]').val();
                	sParam.bfBfBizDt = that.$el.find('.CAPCM100-detail-table [data-form-param="bfBfBizDt"]').val();
                	sParam.bfBizDt = that.$el.find('.CAPCM100-detail-table [data-form-param="bfBizDt"]').val();
                	sParam.bizDt = that.$el.find('.CAPCM100-detail-table [data-form-param="bizDt"]').val();
                	sParam.nxtBizDt = that.$el.find('.CAPCM100-detail-table [data-form-param="nxtBizDt"]').val();
                	sParam.nxtNxtBizDt = that.$el.find('.CAPCM100-detail-table [data-form-param="nxtNxtBizDt"]').val();
                	sParam.dtWeekDscd = that.$el.find('.CAPCM100-detail-table [data-form-param="dtWeekDscd"]').val();
                	sParam.hldyYn = that.$el.find('.CAPCM100-detail-table [data-form-param="hldyYn"]').val();

                }

                , saveDetail : function() {
                    var that = this;
                    
                  //배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                    
                  //  var checkdedAllData = that.CAPCM100Grid.getFilteredRecords('chkYn', true); // 체크된 데이터 가지고 오기
                    var sub = {};
                    var regBizDtList = [];
                    var sParam = {};

                    var instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                    sub.baseDt =  that.$el.find('.CAPCM100-detail-table [data-form-param="baseDt"]').val();
                    sub.bfBfBizDt = that.$el.find('.CAPCM100-detail-table [data-form-param="bfBfBizDt"]').val();
                    sub.bfBizDt = that.$el.find('.CAPCM100-detail-table [data-form-param="bfBizDt"]').val();
                    sub.bizDt = that.$el.find('.CAPCM100-detail-table [data-form-param="bizDt"]').val();
                    sub.nxtBizDt = that.$el.find('.CAPCM100-detail-table [data-form-param="nxtBizDt"]').val();
                    sub.nxtNxtBizDt = that.$el.find('.CAPCM100-detail-table [data-form-param="nxtNxtBizDt"]').val();
                   // sub.dtWeekDscd = that.$el.find('.CAPCM100-detail-table [data-form-param="dtWeekDscd"]').val();
                    sub.hldyYn = that.$el.find('.CAPCM100-detail-table [data-form-param="hldyYn"]').val();
                 
                    sub.baseDt = XDate(sub.baseDt).toString('yyyyMMdd');
                    sub.bfBfBizDt = XDate(sub.bfBfBizDt).toString('yyyyMMdd');
                    sub.bfBizDt = XDate(sub.bfBizDt).toString('yyyyMMdd');
                    sub.bizDt = XDate(sub.bizDt).toString('yyyyMMdd');
                    sub.nxtBizDt = XDate(sub.nxtBizDt).toString('yyyyMMdd');
                    sub.nxtNxtBizDt = XDate(sub.nxtNxtBizDt).toString('yyyyMMdd');
                    
                    sub.instCd = instCd;
                  
                    regBizDtList.push(sub);
                    sParam.regBizDtList = regBizDtList;
                    console.log(sParam);

                     var linkData = {"header": fn_getHeader("CAPCM1008101"), "CaBizDtMgmtSvcRegBizDtListIn": sParam};

                    //ajax 호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        //loading 설정
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            	that.inquiryBaseData();
                           
                            }
                        }
                    });
                }
                //약어명 생성 Btn click
                , fn_createStdAbrvtn: function () {
                    var that = this;
                    var sParam = {};


                    // 영문단어명 뺴고 초기화
                    that.$el.find('.CAPCM100-detail-table [data-form-param="stdEngAbrvtnNm"]').val("");
                	that.$el.find('.CAPCM100-detail-table [data-form-param="koreanNm"]').val("");
                	that.$el.find('.CAPCM100-detail-table [data-form-param="chineseNm"]').val("");


                	that.$el.find('.CAPCM100-detail-table [data-form-param="engWrdNm"]').prop("readonly", false);
                	that.$el.find('.CAPCM100-detail-table [data-form-param="stdEngAbrvtnNm"]').prop("readonly", false);
                	that.$el.find('.CAPCM100-detail-table #btn-CAPCM100-stdAbrvtn').show();


                    //서비스 개별부 set
                    sParam.engWrdNm = that.$el.find('.CAPCM100-detail-table [data-form-param="engWrdNm"]').val();


                    var linkData = {"header": fn_getHeader("CAPCM1008402"), "StdAbrvtnMgmtSvcCofirmStdAbrvtnIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                    	enableLoading: true,
                        success: function (responseData) {


                            if (fn_commonChekResult(responseData)) {
                                var cofirmStdAbrvtnOut = responseData.CaStdAbrvtnMgmtSvcCofirmStdAbrvtnOut;


                                if (!fn_isNull(cofirmStdAbrvtnOut) && !fn_isNull(cofirmStdAbrvtnOut.stdEngAbrvtnNm)) {
                                	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                    that.$el.find('.CAPCM100-detail-table [data-form-param="stdEngAbrvtnNm"]').val(cofirmStdAbrvtnOut.stdEngAbrvtnNm);
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


                    this.$el.find(".CAPCM100-grid").html(this.CAPCM100Grid.render({'height': CaGridHeight}));
                } // end of createGrid


                /**
                 * 그리드 행 더블클릭
                 */
                , doubleiClickGrid: function () {


                    var that = this;
                    var selectedRecord = that.CAPCM100Grid.grid.getSelectionModel().selected.items[0];


                    if (!selectedRecord) {
                        return;
                    } else {
                    	that.$el.find('.CAPCM100-detail-table [data-form-param="abrvtnDmnGrpCd"]').val(selectedRecord.data.atrbtDmnGrpCd);
                    	that.$el.find('.CAPCM100-detail-table [data-form-param="dmnNm"]').val(selectedRecord.data.atrbtDmnNm);
                    	that.$el.find('.CAPCM100-detail-table [data-form-param="atrbtDmnEngNm"]').val(selectedRecord.data.atrbtDmnEngNm);
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
                	fn_pageLayerCtrl("#CAPCM100-grid", this.$el.find("#btn-up-grid"));
                }


                // 상세영역 toggle
                , detailModal : function() {
                	var that = this;
                	fn_pageLayerCtrl(".CAPCM100-detail-table", this.$el.find("#btn-detail-modal"));
                }
                
                , setDatePicker: function () {
                    fn_makeDatePicker(this.$el.find('#search-area [data-form-param="baseDt"]'));
                    
                    fn_makeDatePicker(this.$el.find('#CAPCM100-detail-table [data-form-param="baseDt"]'));
                    fn_makeDatePicker(this.$el.find('#CAPCM100-detail-table [data-form-param="bfBfBizDt"]'));
                    fn_makeDatePicker(this.$el.find('#CAPCM100-detail-table [data-form-param="bfBizDt"]'));
                    fn_makeDatePicker(this.$el.find('#CAPCM100-detail-table [data-form-param="bizDt"]'));
                    fn_makeDatePicker(this.$el.find('#CAPCM100-detail-table [data-form-param="nxtBizDt"]'));
                    fn_makeDatePicker(this.$el.find('#CAPCM100-detail-table [data-form-param="nxtNxtBizDt"]'));

                }


                // 그리드 내용 엑셀 다운로드
                , gridExcel : function() {
                	var that = this;
                	that.CAPCM100Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM100')+"_"+getCurrentDate("yyyy-mm-dd"));
                }
                
                /* ============================================================== */
                /*  addRow event      */
                /* ============================================================== */
                , addRow: function () {
                    var that = this;
                    var gridAllData = that.CAPCM100Grid.getAllData();
                    var sParam = {};
                    sParam.chkYn ='Y';
                    sParam.baseDt = that.$el.find('.CAPCM100-detail-table [data-form-param="baseDt"]').val();
                    sParam.bfBfBizDt = that.$el.find('.CAPCM100-detail-table [data-form-param="bfBfBizDt"]').val();
                    sParam.bfBizDt = that.$el.find('.CAPCM100-detail-table [data-form-param="bfBizDt"]').val();
                    sParam.bizDt = that.$el.find('.CAPCM100-detail-table [data-form-param="bizDt"]').val();
                    sParam.nxtBizDt = that.$el.find('.CAPCM100-detail-table [data-form-param="nxtBizDt"]').val();
                    
                    sParam.nxtNxtBizDt = that.$el.find('.CAPCM100-detail-table [data-form-param="nxtNxtBizDt"]').val();

                    
                    sParam.hldyYn = that.$el.find('.CAPCM100-detail-table [data-form-param="hldyYn"]').val();
                    sParam.dtWeekDscd = that.$el.find('.CAPCM100-detail-table [data-form-param="dtWeekDscd"]').val();
                    
                    that.CAPCM100Grid.addData(sParam);

                } // end of 행추가
                /* ============================================================== */
                /*  deleteRow event      */
                /* ============================================================== */
                , deleteRow: function () {
                    var that = this;

                    var gridAllData = that.CAPCM100Grid.getAllData();
                    var selectedRows = that.CAPCM100Grid.getSelectedItemRow();

                    if (gridAllData.length === 0 || selectedRows.length === 0) {
                        return;
                    }

                    that.CAPCM100Grid.store.remove(selectedRows[0]);
                }
            })
            ; // end of Backbone.View.extend({


        return CAPCM100View;
    } // end of define function
)
; // end of define
