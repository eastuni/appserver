define([
        	'text!app/views/page/popup/CAPSV/popup-service.html'
        	, 'bx-component/ext-grid/_ext-grid'
        	, 'bx/common/common-index-paging'
        	, 'bx-component/popup/popup'
        ]
    , function (
    		tpl
         , ExtGrid
         , IndexPaging
         , Popup
        ) {
		// page number.
		var pgNbr = 1;


        var popupService = Popup.extend({


        	templates: {
                'tpl': tpl
            }


        	, attributes: {
        		'style': 'width: 1020px; height: 800px;'
        	}


        	, events: {
                'click #btn-popup-search-modal': 'popPageLayerCtrl' // 조회영역 접기 
            	, 'click #btn-popup-service-reset': 'reset' // 초기화
                , 'click #btn-popup-service-search': 'selectList' // 목록조회


            	, 'click #btn-popup-grid-modal': 'popGridLayerCtrl' // 그리드영역 접기
        		, 'click #btn-popup-select': 'fn_select' // 선택버튼클릭
            }




//
//
//
        	, popPageLayerCtrl : function() {
        		var that = this;


        		fn_pageLayerCtrl(that.$el.find("#popup-search-area"));
        	}


//
//
//
        	, reset : function() {
        		var that = this;
            	that.$el.find(".popup-service-table [data-form-param='cmpntCd']").val("");
            	that.$el.find(".popup-service-table [data-form-param='srvcCd']").val("");
            	that.$el.find(".popup-service-table [data-form-param='srvcNm']").val("");
        	}


//
//
//
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
				fn_pageLayerCtrl(that.$el.find("#popup-service-grid"));
			}




//
//
//
            , initialize: function (initConfig) {
                var that = this;


                this.$el.html(this.tpl());


                $.extend(that, initConfig);


                that.enableDim = true;
                console.log("initialize");


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


                var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                bxProxy.all([
                         {
                            // 컴포넌트콤보로딩
                            url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {


                            	if (fn_commonChekResult(responseData)) {
                            		that.comboStore1 = new Ext.data.Store({
                                        fields: ['cd', 'cdNm']
                                        , data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                    });
                                }
                            }
                        }
                  ]
                , {
                    success: function () {
                        that.PopupServiceGrid = new ExtGrid({
                            // 그리드 컬럼 정의
                            fields: ['rowIndex', 'cmpntCd', 'srvcCd', 'srvcNm', 'srvcClassNm', 'oprtnNm']
                            , id: 'PopupServiceGrid'
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
                                    text: bxMsg('cbb_items.AT#cmpntCd'), flex: 1, dataIndex: 'cmpntCd', style: 'text-align:center', align: 'left', editor: {
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
                                , {text: bxMsg('cbb_items.AT#srvcCd'), flex: 1, dataIndex: 'srvcCd', style: 'text-align:center', align: 'left'}
                                , {text: bxMsg('cbb_items.AT#srvcNm'), flex: 1, dataIndex: 'srvcNm', style: 'text-align:center', align: 'left'}
                                , {text: bxMsg('cbb_items.AT#srvcClassNm'), dataIndex: 'srvcClassNm', hidden : true}
                                , {text: bxMsg('cbb_items.AT#oprtnNm'), dataIndex: 'oprtnNm', hidden : true}
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
                        that.$el.find(".popup-service-grid").html(that.PopupServiceGrid.render({'height': CaPopGridHeight}));
                    } // end of success:.function
                }); // end of bxProxy.all
            }


//
//
//
            , render: function () {
                var that = this;


                // 콤보데이터 로딩
                var sParam;


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "popup-service-cmpntCd-wrap";
                sParam.targetId = "cmpntCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                sParam.cdNbr = "11603";
                // 콤보데이터 load
                fn_getCodeList(sParam, that);


                that.show();
            }


//
//
//
            , fn_loadList: function () {
                var that = this;
                var sParam = {};


                sParam.cmpntCd = that.$el.find(".popup-service-table [data-form-param='cmpntCd']").val();
                sParam.srvcCd = that.$el.find(".popup-service-table [data-form-param='srvcCd']").val();
                sParam.srvcNm = that.$el.find(".popup-service-table [data-form-param='srvcNm']").val();
                sParam.pgCnt = bwgPageSize;
                sParam.pgNbr = pgNbr;


               var linkData = {"header": fn_getHeader("CAPSV9008401"), "CaSrvcMgmtSvcGetSrvcIn": sParam};


               //ajax 호출
               bxProxy.post(sUrl, JSON.stringify(linkData), {
                   success: function (responseData) {
                       if (fn_commonChekResult(responseData)) {
                           var tbList = responseData.CaSrvcMgmtSvcGetSrvcListOut.tblNm;
                           var totCnt = responseData.CaSrvcMgmtSvcGetSrvcListOut.totCnt;


                           if (tbList != null || tbList.length > 0) {
                        	   that.subViews['indexPaging'].setPaging(pgNbr, totCnt);
                               that.PopupServiceGrid.setData(tbList);
                               that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                           } else {
                               that.PopupServiceGrid.resetData();
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
                var selectedData = that.PopupServiceGrid.grid.getSelectionModel().selected.items[0];
                var param = {};


                if (!selectedData) {
                    return;
                } else {
                    param.cmpntCd = selectedData.data.cmpntCd;
                    param.srvcCd = selectedData.data.srvcCd;
                    param.srvcNm = selectedData.data.srvcNm;
                    param.srvcAbrvtnNm = selectedData.data.srvcAbrvtnNm;
                    param.srvcClassNm = selectedData.data.srvcClassNm;
                    param.oprtnNm = selectedData.data.oprtnNm;
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


        return popupService;
    }
);
