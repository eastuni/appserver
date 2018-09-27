define(
    [
        'text!app/views/page/popup/CAPAC/popup-acctgItm-search.html',
        'bx-component/ext-grid/_ext-grid',
        'bx/common/common-index-paging',
        'bx-component/popup/popup'
    ],
    function (
        tpl,
        ExtGrid,
        IndexPaging,
        Popup
    ) {
    	// page number.
		var pgNbr = 1;
    	
        var popupacctgItmSearch = Popup.extend({

        	templates: {
                'tpl': tpl
            },

            attributes: {
                'style': 'width: 1020px; height: 800px;'
            },

            events: {
                'click #btn-search-condition-reset': 'reset', // 초기화
                'click #btn-search-condition-inquire': 'selectList', // 목록조회
                'click #btn-search-result-toggle': 'toggleSearchResult', // 그리드영역 접기
                'click #btn-search-condition-toggle': 'toggleSearchCondition', // 조회영역 접기
                'click #btn-popup-select': 'fn_select' // 선택버튼클릭
            },
            
            // 조회영역 접기
            toggleSearchCondition : function() {
                fn_pageLayerCtrl(this.$el.find("#search-condition-area"), this.$el.find("#btn-search-condition-toggle"));
            },

            // 초기화
            reset : function() {
                this.$el.find("#search-condition-area [data-form-param='acctgDstnctn'] option:eq(0)").attr("selected", "selected");
                this.$el.find("#search-condition-area [data-form-param='bsisDstnctn'] option:eq(0)").attr("selected", "selected");
                this.$el.find("#search-condition-area [data-form-param='acctgItmCd']").val("");
                this.$el.find("#search-condition-area [data-form-param='acctgItmNm']").val("");
            },

            // 목록조회
            selectList : function() {
            	var that = this;
           	   	pgNbr = 1; // 페이지번호
           	   	
                this.fn_loadList();
            },

            // 그리드영역 접기
            toggleSearchResult : function() {
                fn_pageLayerCtrl(this.$el.find("#popup-acctgItm-search-grid"), this.$el.find("#btn-search-result-toggle"));
            },

            initialize: function (initData) {
                
            	var that = this;
            	
            	/***** paging *****/
            	this.$el.html(this.tpl());
            	
            	$.extend(this, initData);

                
                this.enableDim = true;
                this.initData = initData;
                this.createGrid();
                
                /***** paging *****/
                var pagingParam = {};
//                pagingParam.pageSize = bwgPageSize; // 조회건수 server config.js의 건수 20건으로 설정
                pagingParam.pageSize = 100; // 조회건수 
                pagingParam.naviSize = 15; // 페이징에 보여줄 건수 1 2 3 4 5 6 7 8 9 10
                
                that.subViews['indexPaging'] = new IndexPaging(pagingParam);
                that.$el.find(".paging-area").html(that.subViews['indexPaging'].render());
        
		        // 페이징 버튼 클릭시 조회 호출
		        that.listenTo(that.subViews['indexPaging'], 'paginSetData', function(param) {
		        	pgNbr = param;
		        	that.fn_loadList();
		        });
            },

            createGrid: function () {
                var that = this;

                that.popupAcctgItmSearchGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'acctgDscd', 'acctgItmCd', 'acctgItmNm', 'titlAcctgClCd', 'realTitlAcctgYn' ,'glOutpLvlDscd']
                    , id: 'popupAcctgItmSearchGrid'
                	, columns: [
                        {
                            text: 'No.',
                            dataIndex: 'rowIndex',
                            sortable: false,
                            width : 80,
                            height: 25,
                            style: 'text-align:center',
                            align: 'center',
                            // other config you need....
                            renderer: function (value, metaData, record, rowIndex) {
                                return rowIndex + 1;
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#acctgDstnctn'),
                            flex: 1,
                            dataIndex: 'acctgDscd',
                            style: 'text-align:center',
                            align: 'center',
                            code: '51011',
                            renderer: function (val) {
                                return val ? bxMsg('cbb_items.CDVAL#51011' + val) : "";
                            }
                        },
                        {
                            text: bxMsg('cbb_items.AT#acctgItmCd'),
                            flex: 1,
                            dataIndex: 'acctgItmCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#acctgItmNm'),
                            flex: 2,
                            dataIndex: 'acctgItmNm',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#titlAcctgCl'),
                            flex: 1,
                            dataIndex: 'titlAcctgClCd',
                            style: 'text-align:center',
                            align: 'center',
                        	renderer: function (val) {
                                return val ? bxMsg('cbb_items.CDVAL#51012' + val) : "";
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#realTitlAcctg'),
                            flex: 1,
                            dataIndex: 'realTitlAcctgYn',
                            style: 'text-align:center',
                            align: 'center',
                            renderer : function(val) {
                                var classNm = "s-no";


                                if(val =="Y") {
                                    classNm = "s-yes";
                                }


                                return "<span class=\"bw-sign "+classNm+"\">"+val+"</span>";
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#glOutpLvl'),
                            flex: 1,
                            dataIndex: 'glOutpLvlDscd',
                            style: 'text-align:center',
                            align: 'center'
                        }
                    ], // end of columns


                    // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                    gridConfig: {
                        // 셀 에디팅 플러그인
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                // 2번 클릭시, 에디팅할 수 있도록 처리
                                clicksToEdit: 2,
                                listeners: {
                                    'beforeedit': function (editor, e) {
                                        return false;
                                    } // end of edit
                                } // end of listners
                            }) // end of Ext.create
                        ] // end of plugins
                    }, // end of gridConfig
                    listeners: {
                        click: {
                            element: 'body',
                            fn: function () {
                                that.$el.find('#btn-popup-select').addClass('on');
                            }
                        },
                        dblclick: {
                            element: 'body',
                            fn: function () {
                                that.fn_select();
                            }
                        }
                    }
                });
                
                that.$el.find(".popup-acctgItm-search-grid").html(that.popupAcctgItmSearchGrid.render({'height': '420px'}));
//                that.$el.find(".popup-acctgItm-search-grid").html(that.popupAcctgItmSearchGrid.render({'height': CaPopGridHeight}));
            },

            render: function () {

                this.setComboBoxes();
                this.show();

                console.log(this.initData);

                if(!fn_isNull(this.initData)) {
                    if(!fn_isNull(this.initData.acctgDscd)) {
                        this.setSearchCondition(this.initData.acctgDscd);
                    }
                }
            },


            setComboBoxes: function () {
                var sParam = {};

                // combobox 정보 셋팅
                sParam.className = "PopupAcctgItmSrch-acctgDstnctn-wrap";
                sParam.targetId = "acctgDstnctn";
//                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "51011"; // 회계구분코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);

                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "PopupAcctgItmSrch-bsisDstnctn-wrap";
                sParam.targetId = "bsisDstnctn";
//                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "51010"; // BSIS구분코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
            },

            setSearchCondition: function (data) {
                var that = this;

                console.log(data);

                if(data) {
                    that.$el.find('#search-condition-area [data-form-param="acctgDstnctn"]').val(data.acctgDscd);
                    that.$el.find('#search-condition-area [data-form-param="bsisDstnctn"]').val(data.bsisDscd);
                }
                that.fn_loadList();
            },

            fn_loadList: function () {
                var that = this;
                var sParam = {};

                sParam.instCd       = $.sessionStorage('headerInstCd');
                sParam.acctgDscd    = that.$el.find("#search-condition-area [data-form-param='acctgDstnctn']").val();
                sParam.bsisDscd     = that.$el.find("#search-condition-area [data-form-param='bsisDstnctn']").val();
                sParam.acctgItmCd   = that.$el.find("#search-condition-area [data-form-param='acctgItmCd']").val();
                sParam.acctgItmNm   = that.$el.find("#search-condition-area [data-form-param='acctgItmNm']").val();
                sParam.closeAcctgInqryYn = "Y";
                sParam.pgNbr = pgNbr;
                sParam.pgCnt = 100;

                var linkData = {"header": fn_getHeader("CAPAC0018402"), "CaCoaMgmtSvcGetCoaListIn": sParam};

                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                        	var tbList = responseData.CaCoaMgmtSvcGetCoaTreeListOut.children;
                        	var totCnt = responseData.CaCoaMgmtSvcGetCoaTreeListOut.inqryCnt;
                        	
                        	/***** paging *****/
                        	if (tbList != null) {
                        		that.subViews['indexPaging'].setPaging(pgNbr, totCnt);
                                that.popupAcctgItmSearchGrid.setData(tbList);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                        	} else {
                        		that.PopupServiceGrid.resetData();
                        	}
                        }   // end of suucess: fucntion
                    }
                });
            },

            fn_select: function () {
                var selectedData = this.popupAcctgItmSearchGrid.grid.getSelectionModel().selected.items[0];
                var param = {};

                if (!selectedData) {
                    return;
                } else {
                    param = selectedData.data;
                }
                this.trigger('popUpSetData', param);
                this.close();
            },

            afterClose : function() {
                this.remove();
            }
        });
        return popupacctgItmSearch;
    }
);
