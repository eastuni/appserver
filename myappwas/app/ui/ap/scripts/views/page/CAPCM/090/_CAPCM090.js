define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPCM/090/_CAPCM090.html'
        , 'bx-component/ext-grid/_ext-grid'
    ]
    , function (config
        , tpl
        , ExtGrid
        ) {


        /**
         * Backbone
         */
        var CAPCM090View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPCM090-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                    'click #btn-base-reset': 'resetBaseArea'
                    , 'click #btn-base-search': 'queryBaseArea'
                	, 'click #btn-base-search-modal': 'baseSearchModal'
                	, 'keydown #searchKey': 'pressEnter'

        			, 'click #btn-CAPCM090-grid-delete': 'clickDeleteGrid'
    				, 'click #btn-CAPCM090-grid-excel': 'gridExcel'
					, 'click #btn-up-grid': 'gridAreaModal'


					, 'click #btn-detail-modal': 'detailAreaModal'
    				, 'click #btn-detail-refresh': 'resetDetailArea'
					, 'click #btn-detail-save': 'clickSaveDetail'
                }




//
//
//
                , initialize: function (initData) {


                    var that = this;
                    that.that = this;


                    var deleteList = [];


                    $.extend(that, initData);
                    that.$el.html(that.tpl());


                    that.initData = initData;


                    that.comboStore1 = {}; // 메시지구분
                    that.comboStore2 = {}; // 채널
                    that.comboStore3 = {}; // 업무구분
                    that.comboStore4 = {}; // 에러레벨


                    var sParam = {};
                    sParam.cdNbr = "A0009";
                    var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    sParam = {};
                    sParam.cdNbr = "11930";
                    var linkData2 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    sParam = {};
                    sParam.cdNbr = "11929";
                    var linkData3 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    sParam = {};
                    sParam.cdNbr = "A0132";
                    var linkData4 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};




                    bxProxy.all([
                                 {
		                            // 메시지구분
		                            url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {


		                            	if (fn_commonChekResult(responseData)) {
		                            		that.comboStore1 = new Ext.data.Store({
		                                        fields: ['cd', 'cdNm']
		                                        , data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
		                                    });
		                                }
		                            }
		                        }
                                 , {
                                	 // 채널
                                	 url: sUrl, param: JSON.stringify(linkData2), success: function (responseData) {


                                		 if (fn_commonChekResult(responseData)) {
                                			 that.comboStore2 = new Ext.data.Store({
                                				 fields: ['cd', 'cdNm']
                                			 , data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                			 });
                                		 }
                                	 }
                                 }
                                 , {
                                	 // 업무구분
                                	 url: sUrl, param: JSON.stringify(linkData3), success: function (responseData) {


                                		 if (fn_commonChekResult(responseData)) {
                                			 that.comboStore3 = new Ext.data.Store({
                                				 fields: ['cd', 'cdNm']
                                			 , data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                			 });
                                		 }
                                	 }
                                 }
                                 , {
                                	 // 에러레벨
                                	 url: sUrl, param: JSON.stringify(linkData4), success: function (responseData) {


                                		 if (fn_commonChekResult(responseData)) {
                                			 that.comboStore4 = new Ext.data.Store({
                                				 fields: ['cd', 'cdNm']
                                			 , data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                			 });
                                		 }
                                	 }
                                 }
                          ]
                        , {
                            success: function () {
                            	/* ------------------------------------------------------------ */
                                that.CAPCM090Grid = new ExtGrid({
                                    /* ------------------------------------------------------------ */
                                    // 단일탭 그리드 컬럼 정의
                                    fields: ['rowIndex', 'msgScrnSrvrDscd', 'chnlCd', 'prjctDscd', 'msgCd', 'errLvlCd', 'msgCntnt', 'trtmntCntnt']
                                    , id: 'CAPCM090Grid'
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
                                        , {
                                            text: bxMsg('cbb_items.SCRNITM#msgScrnSrvrDscd'),width: 120, dataIndex: 'msgScrnSrvrDscd', style: 'text-align:center', align: 'center'
                                            	, flex: 1
                                            	, editor: {
	                                                xtype: 'combobox'
	                                                , store: that.comboStore1
	                                                , displayField: 'cdNm'
	                                                , valueField: 'cd'
	                                            }
                                            , renderer: function (val) {
                                                var index = that.comboStore1.findExact('cd', val);


                                                if (index != -1) {
                                                    var rs = that.comboStore1.getAt(index).data;


                                                    return rs.cdNm;
                                                }
                                            }
                                        }
                                        , {
                                        	text: bxMsg('cbb_items.SCRNITM#chnl'),width: 120, dataIndex: 'chnlCd', style: 'text-align:center', align: 'center'
                                        		, flex: 1
                                        		, editor: {
                                        			xtype: 'combobox'
                                        				, store: that.comboStore2
                                        				, displayField: 'cdNm'
                                        					, valueField: 'cd'
                                        		}
	                                        , renderer: function (val) {
	                                        	var index = that.comboStore2.findExact('cd', val);


	                                        	if (index != -1) {
	                                        		var rs = that.comboStore2.getAt(index).data;


	                                        		return rs.cdNm;
	                                        	}
	                                        }
                                        }
                                        , {
                                        	text: bxMsg('cbb_items.SCRNITM#bizDstnctnNm'),width: 120, dataIndex: 'prjctDscd', style: 'text-align:center', align: 'center'
                                        		, flex: 1
                                        		, editor: {
                                        			xtype: 'combobox'
                                        				, store: that.comboStore3
                                        				, displayField: 'cdNm'
                                        					, valueField: 'cd'
                                        		}
	                                        , renderer: function (val) {
	                                        	var index = that.comboStore3.findExact('cd', val);


	                                        	if (index != -1) {
	                                        		var rs = that.comboStore3.getAt(index).data;


	                                        		return rs.cdNm;
	                                        	}
	                                        }
                                        }
                                        , {text: bxMsg('cbb_items.SCRNITM#errMsgCd'),width: 160, flex: 1,dataIndex: 'msgCd', style: 'text-align:center', align: 'center'}
                                        , {
                                        	text: bxMsg('cbb_items.SCRNITM#errLvlCd'),width: 120, dataIndex: 'errLvlCd', style: 'text-align:center', align: 'center'
                                        		, flex: 1
                                        		, editor: {
                                        			xtype: 'combobox'
                                        				, store: that.comboStore4
                                        				, displayField: 'cdNm'
                                        					, valueField: 'cd'
                                        		}
	                                        , renderer: function (val) {
	                                        	var index = that.comboStore4.findExact('cd', val);


	                                        	if (index != -1) {
	                                        		var rs = that.comboStore4.getAt(index).data;


	                                        		return rs.cdNm;
	                                        	}
	                                        }
                                        }
                                        , {text: bxMsg('cbb_items.AT#msgCntnt'),width: 160,flex: 3,dataIndex: 'msgCntnt', style: 'text-align:center', align: 'left'}
                                        , {text: bxMsg('cbb_items.AT#trtmntCntnt'),width: 160,flex: 2,dataIndex: 'trtmntCntnt', style: 'text-align:center', align: 'left'}
                                        , {
                                         	xtype: 'actioncolumn', width: 80, align: 'center', style: 'text-align:center', text: bxMsg('cbb_items.SCRNITM#del')
                                         	, items: [
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
                                            , fn: function (event) {
                                            	// 삭제 버튼 클릭시는 상세조회 안함.
                                            	if(!$(event.target).hasClass('bw-icon')) {
                                            		//더블클릭시 이벤트 발생
                                            		that.doubleiClickGrid();
                                            	}
                                            }
                                        }
                                    }
                                });
                                // 단일탭 그리드 렌더
                                that.createGrid("single");
                            } // end of success:.function
                    }); // end of bxProxy.all
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  render                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                , render: function () {
                	var that = this;
                	// 콤보데이터 로딩
                    var sParam;


                    // 메시지구분
                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = 'CAPCM090-base-msgScrnSrvrDscd-wrap';
                    sParam.targetId = "msgScrnSrvrDscd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
//                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "A0009";
                    fn_getCodeList(sParam, that);


                    // 채널
                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = 'CAPCM090-base-chnlCd-wrap';
                    sParam.targetId = "chnlCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
//                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "11930";
                    fn_getCodeList(sParam, that);


                    // 업무구분
                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = 'CAPCM090-base-prjctDscd-wrap';
                    sParam.targetId = "prjctDscd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
//                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "11929";
                    fn_getCodeList(sParam, that);


                    // 에러레벨
                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = 'CAPCM090-base-errorLvlCd-wrap';
                    sParam.targetId = "errLvlCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
//                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "A0132";
                    fn_getCodeList(sParam, that);


                    // 언어
                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = 'CAPCM090-base-lngCd-wrap';
                    sParam.targetId = "lngCd";
                    sParam.nullYn = "N";
//                    sParam.allNm = bxMsg('cbb_items.SCRNITM#nonSelect'); // 선택 안함
//                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "10005";
                    fn_getCodeList(sParam, that);


                    // 메시지구분
                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = 'CAPCM090-detail-msgScrnSrvrDscd-wrap';
                    sParam.targetId = "msgScrnSrvrDscd";
//                    sParam.nullYn = "Y";
//                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
//                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "A0009";
                    fn_getCodeList(sParam, that);


                    // 채널
                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = 'CAPCM090-detail-chnlCd-wrap';
                    sParam.targetId = "chnlCd";
//                    sParam.nullYn = "Y";
//                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
//                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "11930";
                    fn_getCodeList(sParam, that);


                    // 업무구분
                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = 'CAPCM090-detail-prjctDscd-wrap';
                    sParam.targetId = "prjctDscd";
//                    sParam.nullYn = "Y";
//                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
//                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "11929";
                    fn_getCodeList(sParam, that);


                    // 에러레벨
                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = 'CAPCM090-detail-errorLvlCd-wrap';
                    sParam.targetId = "errLvlCd";
//                    sParam.nullYn = "Y";
//                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
//                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "A0132";
                    fn_getCodeList(sParam, that);


                    that.$el.find('.CAPCM090-detail-table [data-form-param="msgCd"]').prop("readonly", true);

                  //배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPCM090-wrap #btn-CAPCM090-grid-delete')
                                        		,this.$el.find('.CAPCM090-wrap #btn-detail-save')
                                        			   ]);

                    return that.$el;
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  기본부 초기화                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                , resetBaseArea: function () {
                    var that = this;


                    that.$el.find('.CAPCM090-base-table [data-form-param="msgScrnSrvrDscd"] option:eq(0)').attr("selected", "selected");
                    that.$el.find('.CAPCM090-base-table [data-form-param="chnlCd"] option:eq(0)').attr("selected", "selected");
                    that.$el.find('.CAPCM090-base-table [data-form-param="prjctDscd"] option:eq(0)').attr("selected", "selected");
                    that.$el.find('.CAPCM090-base-table [data-form-param="msgCd"]').val("");
                    that.$el.find('.CAPCM090-base-table [data-form-param="errorLvlCd"] option:eq(0)').attr("selected", "selected");
                    that.$el.find('.CAPCM090-base-table [data-form-param="lngCd"] option:eq(0)').attr("selected", "selected");


                    that.CAPCM090Grid.resetData();
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  상세부 초기화                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , resetDetailArea : function() {
                	var that = this;


                	that.$el.find('.CAPCM090-detail-table [data-form-param="msgScrnSrvrDscd"] option:eq(0)').attr("selected", "selected");
                    that.$el.find('.CAPCM090-detail-table [data-form-param="chnlCd"] option:eq(0)').attr("selected", "selected");
                    that.$el.find('.CAPCM090-detail-table [data-form-param="prjctDscd"] option:eq(0)').attr("selected", "selected");
                    that.$el.find('.CAPCM090-detail-table [data-form-param="msgCd"]').val("");
                    that.$el.find('.CAPCM090-detail-table [data-form-param="errorLvlCd"] option:eq(0)').attr("selected", "selected");


                    that.$el.find('.CAPCM090-detail-table [data-form-param="koMsgCntnt"]').val("");
                    that.$el.find('.CAPCM090-detail-table [data-form-param="koTrtmntCntnt"]').val("");


                    that.$el.find('.CAPCM090-detail-table [data-form-param="enMsgCntnt"]').val("");
                    that.$el.find('.CAPCM090-detail-table [data-form-param="enTrtmntCntnt"]').val("");


                    that.$el.find('.CAPCM090-detail-table [data-form-param="zhMsgCntnt"]').val("");
                    that.$el.find('.CAPCM090-detail-table [data-form-param="zhTrtmntCntnt"]').val("");


                 // pk readonly 처리
                    that.$el.find('.CAPCM090-detail-table [data-form-param="chnlCd"]').prop("readonly", false);
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  기본부 조회 버튼 클릭                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , queryBaseArea: function () {
                    var that = this;
                    that.inquiryBaseData();
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  기본부 정보로 그리드 조회                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , inquiryBaseData: function () {
                	var that = this;
                    var sParam = {};


                    sParam.msgScrnSrvrDscd = that.$el.find('.CAPCM090-base-table [data-form-param="msgScrnSrvrDscd"]').val();
                    sParam.chnlCd = that.$el.find('.CAPCM090-base-table [data-form-param="chnlCd"]').val();
                    sParam.prjctDscd = that.$el.find('.CAPCM090-base-table [data-form-param="prjctDscd"]').val();
                    sParam.msgCd = that.$el.find('.CAPCM090-base-table [data-form-param="msgCd"]').val();
                    sParam.errLvlCd = that.$el.find('.CAPCM090-base-table [data-form-param="errorLvlCd"]').val();
                    sParam.lngCd = that.$el.find('.CAPCM090-base-table [data-form-param="lngCd"]').val();
                    sParam.msgCntnt = that.$el.find('.CAPCM090-base-table [data-form-param="msgCntnt"]').val();
                    sParam.trtmntCntnt = that.$el.find('.CAPCM090-base-table [data-form-param="trtmntCntnt"]').val();


                    if (fn_isEmpty(sParam.msgCd) && fn_isEmpty(sParam.prjctDscd) && fn_isEmpty(sParam.chnlCd) 
                    		&& fn_isEmpty(sParam.lngCd) && fn_isEmpty(sParam.msgCntnt) && fn_isEmpty(sParam.trtmntCntnt)
                    		&& fn_isEmpty(sParam.msgScrnSrvrDscd) && fn_isEmpty(sParam.errLvlCd)
                        ) {
                            fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0014'));
                            return;
                    }


                    var linkData = {"header": fn_getHeader('CAPCM0908401'), "CaErrMsgMgmtSvcGetErrMsgListIn": sParam};


                    //ajax호출
                    bxProxy.post(sUrl
                        , JSON.stringify(linkData), {
                            enableLoading: true,
                            success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                    var tbList = responseData.CaErrMsgMgmtSvcGetErrMsgListOut.errMsgList;
                                    var totalCount = tbList.length;


                                    if (tbList != null || tbList.length > 0) {
                                        that.CAPCM090Grid.setData(tbList);
                                        that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totalCount)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                        // 삭제 로우 초기화
                                        that.deleteList = [];
                                        //상세부 초기화
                                        that.resetDetailArea();
                                        // 검색결과 설정


                                    }
                                }
                            }   // end of suucess: fucntion
                        }
                    ); // end of bxProxy
                } // end




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  그리드 저장(삭제)버튼 클릭                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
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




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  그리드 삭제                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , deleteGrid : function(that) {
                	var sParam = {};
                	sParam.errMsgList = [];


                	if(that.deleteList.length > 0) {
                		$(that.deleteList).each(function(idx, data) {
                			var delParam = {};
                			delParam.msgCd = data.msgCd;
                			delParam.chnlCd = data.chnlCd;
                			sParam.errMsgList.push(delParam);
                		});


                		var linkData = {"header": fn_getHeader("CAPCM0908301"), "CaErrMsgMgmtSvcDeleteErrMsgListIn": sParam};


                            // ajax호출
                            bxProxy.post(sUrl, JSON.stringify(linkData), {
                                enableLoading: true
                                , success: function (responseData) {
                                    if (fn_commonChekResult(responseData)) {
                                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                        that.queryBaseArea(); // 재조회
                                    }
                                }   // end of suucess: fucntion
                            }); // end of bxProxy
                	}
                	else {
                		return;
                	}


                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  상세 저장 버튼 클릭                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , clickSaveDetail : function(event) {
                	var sParam = {};

               	 	sParam.msgCd = this.$el.find('.CAPCM090-detail-table [data-form-param="msgCd"]').val();
                    sParam.prjctDscd = this.$el.find('.CAPCM090-detail-table [data-form-param="prjctDscd"]').val();
                    sParam.msgScrnSrvrDscd = this.$el.find('.CAPCM090-detail-table [data-form-param="msgScrnSrvrDscd"]').val();
                    sParam.errLvlCd = this.$el.find('.CAPCM090-detail-table [data-form-param="errorLvlCd"]').val();


                    if (sParam.prjctDscd === '' || sParam.prjctDscd === undefined || sParam.prjctDscd === null) {
                    	fn_alertMessage('',bxMsg('cbb_err_msg.AUICME0015'));


                        return;
                    }


                    if (sParam.msgScrnSrvrDscd === '' || sParam.msgScrnSrvrDscd === undefined || sParam.msgScrnSrvrDscd === null) {
                    	fn_alertMessage('',bxMsg('cbb_err_msg.AUICME0022'));


                        return;
                    }


                    if (sParam.errLvlCd === '' || sParam.errLvlCd === undefined || sParam.errLvlCd === null) {
                    	fn_alertMessage('',bxMsg('cbb_err_msg.AUICUE0007'));


                        return;
                    }


                    if (sParam.msgCd != '' && sParam.msgCd.substring(3, 5) != sParam.prjctDscd) {
                    	fn_alertMessage('',bxMsg('cbb_err_msg.AUICME0016'));


                        return;
                    }

                    
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                	fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveDetail, this);
                }


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  상세 저장                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , saveDetail : function(that) {


                	 var sParam = {};
                	 sParam.errMsgList = [];


                	 sParam.msgCd = that.$el.find('.CAPCM090-detail-table [data-form-param="msgCd"]').val();
                     sParam.prjctDscd = that.$el.find('.CAPCM090-detail-table [data-form-param="prjctDscd"]').val();
                     sParam.msgScrnSrvrDscd = that.$el.find('.CAPCM090-detail-table [data-form-param="msgScrnSrvrDscd"]').val();
                     sParam.errLvlCd = that.$el.find('.CAPCM090-detail-table [data-form-param="errorLvlCd"]').val();

//
//                     if (sParam.prjctDscd === '' || sParam.prjctDscd === undefined || sParam.prjctDscd === null) {
//                         alertMessage.error(bxMsg('cbb_err_msg.AUICME0015'));
//
//
//                         return;
//                     }
//
//
//                     if (sParam.msgScrnSrvrDscd === '' || sParam.msgScrnSrvrDscd === undefined || sParam.msgScrnSrvrDscd === null) {
//                         alertMessage.error(bxMsg('cbb_err_msg.AUICME0022'));
//
//
//                         return;
//                     }
//
//
//                     if (sParam.errLvlCd === '' || sParam.errLvlCd === undefined || sParam.errLvlCd === null) {
//                         alertMessage.error(bxMsg('cbb_err_msg.AUICUE0007'));
//
//
//                         return;
//                     }
//
//
//                     if (sParam.msgCd != '' && sParam.msgCd.substring(3, 5) != sParam.prjctDscd) {
//                         alertMessage.error(bxMsg('cbb_err_msg.AUICME0016'));
//
//
//                         return;
//                     }


                     sParam.errMsgList = that.setErrMsgList(sParam, 'ko', sParam.errMsgList, that);
                     sParam.errMsgList = that.setErrMsgList(sParam, 'en', sParam.errMsgList, that);
                     sParam.errMsgList = that.setErrMsgList(sParam, 'zh', sParam.errMsgList, that);


                     var linkData = {"header": fn_getHeader("CAPCM0908101"),"CaErrMsgMgmtSvcSaveErrMsgListIn": sParam};
                     //ajax 호출
                     bxProxy.post(sUrl, JSON.stringify(linkData), {
                    	 enableLoading: true,
                         success: function (responseData) {
                             if (fn_commonChekResult(responseData)) {
                            	 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            	 that.$el.find('.CAPCM090-base-table [data-form-param="msgCd"]').val(responseData.CaErrMsgMgmtSvcSaveErrMsgOut.msgCd);
                            	 that.queryBaseArea();
                             }
                         }
                     });
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  에러메시지목록 설정                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , setErrMsgList : function(sParam, lngCd, errMsgList, that) {
                	var record = {};


                    record.msgCd = sParam.msgCd;
                    record.prjctDscd = sParam.prjctDscd;
                    record.msgScrnSrvrDscd = sParam.msgScrnSrvrDscd;


                    record.chnlCd = that.$el.find('.CAPCM090-detail-table [data-form-param="chnlCd"]').val();
                    record.lngCd = lngCd;
                    record.msgCntnt = that.$el.find('.CAPCM090-detail-table [data-form-param="'+lngCd+'MsgCntnt"]').val();
                    record.trtmntCntnt = that.$el.find('.CAPCM090-detail-table [data-form-param="'+lngCd+'TrtmntCntnt"]').val();
                    errMsgList.push(record);


                    return errMsgList;
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  그리드 생성                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , createGrid: function () {
                    var that = this;


                    this.$el.find(".CAPCM090-grid").html(this.CAPCM090Grid.render({'height': CaGridHeight}));
                } // end of createGrid




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  그리드 행 더블클릭nder                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , doubleiClickGrid: function () {


                    var that = this;
                    var selectedRecord = that.CAPCM090Grid.grid.getSelectionModel().selected.items[0];


                    if (!selectedRecord) {
                        return;
                    } else {
                    	// 상세 조회
                    	var sParam = {};
                    	sParam.msgCd = selectedRecord.data.msgCd;
                    	var linkData = {"header": fn_getHeader('CAPCM0908402'), "CaErrMsgMgmtSvcGetErrMsgListIn": sParam};


                        //ajax호출
                        bxProxy.post(sUrl
                            , JSON.stringify(linkData), {
                                enableLoading: true,
                                success: function (responseData) {
                                    if (fn_commonChekResult(responseData)) {
                                    	// 상세 설정
                                    	var errMsgOut = responseData.CaErrMsgMgmtSvcGetErrMsgListOut;


                                    	that.$el.find('.CAPCM090-detail-table [data-form-param="msgScrnSrvrDscd"]').val(errMsgOut.msgScrnSrvrDscd);
                                        that.$el.find('.CAPCM090-detail-table [data-form-param="chnlCd"]').val(errMsgOut.chnlCd);
                                        that.$el.find('.CAPCM090-detail-table [data-form-param="prjctDscd"]').val(errMsgOut.prjctDscd);
                                        that.$el.find('.CAPCM090-detail-table [data-form-param="msgCd"]').val(errMsgOut.msgCd);
                                        that.$el.find('.CAPCM090-detail-table [data-form-param="errorLvlCd"]').val(errMsgOut.errLvlCd);


                                        var tbList = errMsgOut.errMsgList;


                                        $(tbList).each(function(idx, data) {
                                        	that.$el.find('.CAPCM090-detail-table [data-form-param="'+data.lngCd+'MsgCntnt"]').val(data.msgCntnt);
                                            that.$el.find('.CAPCM090-detail-table [data-form-param="'+data.lngCd+'TrtmntCntnt"]').val(data.trtmntCntnt);
                                        });


                                        // pk readonly 처리
                                        that.$el.find('.CAPCM090-detail-table [data-form-param="msgCd"]').prop("readonly", true);
                                        that.$el.find('.CAPCM090-detail-table [data-form-param="chnlCd"]').prop("readonly", true);
                                    }
                                }   // end of suucess: fucntion
                            }
                        ); // end of bxProxy
                    }
                }

                /**
                 * 트리의 엔터 입력 처리를 위한 콜백함수
                 */
                ,pressEnter: function (event) {
                    var event = event || window.event;
                    var keyID = (event.which) ? event.which : event.keyCode;
                    if(keyID == 13) { //enter
                        this.inquiryBaseData();
                    }
                }


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  조회조건영역 toggle                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , baseSearchModal : function() {
                	fn_pageLayerCtrl("#CAPCM090-base-table", this.$el.find("#btn-base-search-modal"));
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  그리드영역 toggle                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , gridAreaModal : function() {
                	fn_pageLayerCtrl("#CAPCM090-grid", this.$el.find("#btn-up-grid"));
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  상세영역 toggle                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , detailAreaModal : function() {
                	fn_pageLayerCtrl("#CAPCM090-detail-table", this.$el.find("#btn-detail-modal"));
                }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////  그리드 내용 엑셀 다운로드                    /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////                
                , gridExcel : function() {
                	var that = this;
                	that.CAPCM090Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM090')+"_"+getCurrentDate("yyyy-mm-dd"));
                }
            })
            ; // end of Backbone.View.extend({


        return CAPCM090View;
    } // end of define function
)
; // end of define
