define([
        	'text!app/views/page/popup/CAPMT/popup-rule.html'
        	,'bx/common/common-info'
        	, 'bx-component/ext-grid/_ext-grid'
        	, 'bx/common/common-index-paging'
        	, 'bx-component/popup/popup'
        ]
    , function (
    		tpl
    	 ,commonInfo
         , ExtGrid
         , IndexPaging
         , Popup
        ) {
		// page number.
		var pgNbr = 1;


        var popupRule = Popup.extend({


        	templates: {
                'tpl': tpl
            }


        	, attributes: {
        		'style': 'width: 1020px; height: 800px;'
        	}


        	, events: {
                'click #btn-popup-search-modal': 'popPageLayerCtrl' // 조회영역 접기 
            	, 'click #btn-popup-rule-reset': 'reset' // 초기화
                , 'click #btn-popup-rule-search': 'selectList' // 목록조회


            	, 'click #btn-popup-grid-modal': 'popGridLayerCtrl' // 그리드영역 접기
        		, 'click #btn-popup-select': 'fn_select' // 선택버튼클릭
            }




        	, popPageLayerCtrl : function() {
        		var that = this;


        		fn_pageLayerCtrl(that.$el.find("#popup-search-area"));
        	}

        	, reset : function() {
        		var that = this;
            	that.$el.find(".popup-rule-table [data-form-param='ruleId']").val("");
            	that.$el.find(".popup-rule-table [data-form-param='ruleNm']").val("");
        	}


        	, selectList : function() {
        		var that = this;
        		pgNbr = 1;
        		that.fn_loadList();
        	}


//
//
//
			, popGridLayerCtrl : function() {
				var that = this;
				fn_pageLayerCtrl(that.$el.find("#popup-rule-grid"));
			}




//
//
//
            , initialize: function (initConfig) {
                var that = this;


                this.$el.html(this.tpl());


                $.extend(that, initConfig);


                that.enableDim = true;


                // paging 초기 생성
                var pagingParam = {};
                pagingParam.pageSize = bwgPageSize; // 조회건수 server config.js 의 건수 20 건으로 설정
                pagingParam.naviSize = 15; // 페이징에 보여줄 건수 1 2 3 4 5 6 7 8 9 10


                that.subViews['indexPaging'] = new IndexPaging(pagingParam);
                that.$el.find(".paging-area").html(that.subViews['indexPaging'].render());


                // 페이징 버튼 클릭시 조회 호출
                that.listenTo(that.subViews['indexPaging'], 'paginSetData', function(param) {
                	pgNbr = param;
                	that.fn_loadList();
                });


                that.comboStore1 = {};


                var sParam = {};
                sParam.cdNbr = "11603";


               that.PopupRuleGrid = new ExtGrid({
                            // 그리드 컬럼 정의
                            fields: ['rowIndex', 'ruleId', 'ruleNm', 'ruleDescCntnt', 'lastChngTmstmp', 'lastChngGuid']
                            , id: 'PopupRuleGrid'
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
                                , {text: bxMsg('cbb_items.AT#ruleId'), flex: 1, dataIndex: 'ruleId', style: 'text-align:center'}
                                , {text: bxMsg('cbb_items.AT#ruleNm'), flex: 1, dataIndex: 'ruleNm', style: 'text-align:center'}
                                , {text: bxMsg('cbb_items.AT#ruleDescCntnt'), flex: 1, dataIndex: 'ruleDescCntnt', style: 'text-align:center'}
                                , {text: bxMsg('cbb_items.AT#lastChngTmstmp'), dataIndex: 'lastChngTmstmp', hidden : true}
                                , {text: bxMsg('cbb_items.AT#lastChngGuid'), dataIndex: 'lastChngGuid', hidden : true}
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
                                dblclick: {
                                    element: 'body'
                                    , fn: function () {
                                    	that.fn_select();
                                    }
                                }
                            }
                });


                        // 단일탭 그리드 렌더
                that.$el.find(".popup-rule-grid").html(that.PopupRuleGrid.render({'height': CaPopGridHeight}));
            }


//
//
//
            , render: function () {
                var that = this;




                that.show();
            }


//
//
//
            , fn_loadList: function () {
                var that = this;
                var sParam = {};


                sParam.instCd = commonInfo.getInstInfo().instCd;
                sParam.ruleId = that.$el.find(".popup-rule-table [data-form-param='ruleId']").val();
                sParam.ruleNm = that.$el.find(".popup-rule-table [data-form-param='ruleNm']").val();
                sParam.pgCnt = bwgPageSize;
                sParam.pgNbr = pgNbr;


               var linkData = {"header": fn_getHeader("PMT0928401"), "WorkflowRuleMgmtSvcIO": sParam};


               //ajax 호출
               bxProxy.post(sUrl, JSON.stringify(linkData), {
                   success: function (responseData) {
                       if (fn_commonChekResult(responseData)) {
                           var tbList = responseData.WorkflowRuleMgmtSvcIOList.tblNm;
                           //var totCnt = responseData.WorkflowRuleMgmtSvcIOList.totCnt;
                           var totCnt = tbList.length;


                           if (tbList != null || tbList.length > 0) {
                        	   that.subViews['indexPaging'].setPaging(pgNbr, totCnt);
                               that.PopupRuleGrid.setData(tbList);
                               that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                           } else {
                               that.PopupRuleGrid.resetData();
                           }
                       }


                   }   // end of suucess: fucntion
               });


            }




//
//
//
            , fn_select: function () {
            	var that = this;
                var selectedData = that.PopupRuleGrid.grid.getSelectionModel().selected.items[0];
                var param = {};


                if (!selectedData) {
                    return;
                } else {
                    param.ruleId = selectedData.data.ruleId;
                    param.ruleNm = selectedData.data.ruleNm;
                    param.ruleDescCntnt = selectedData.data.ruleDescCntnt;
                    param.lastChngTmstmp = selectedData.data.lastChngTmstmp;
                    param.lastChngGuid = selectedData.data.lastChngGuid;
                }
                this.trigger('popUpSetData', param);
                this.close();
            }


//
//
//
            , afterClose : function() {
            	var that = this;
            	that.remove();
            }


        });


        return popupRule;
    }
);
