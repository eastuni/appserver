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




//
//
//
            toggleSearchCondition : function() {
                fn_pageLayerCtrl(this.$el.find("#search-condition-area"), this.$el.find("#btn-search-condition-toggle"));
            },


//
//
//
            reset : function() {
                this.$el.find("#search-condition-area [data-form-param='acctgDstnctn'] option:eq(0)").attr("selected", "selected");
                this.$el.find("#search-condition-area [data-form-param='bsisDstnctn'] option:eq(0)").attr("selected", "selected");
                this.$el.find("#search-condition-area [data-form-param='acctgItmCd']").val("");
                this.$el.find("#search-condition-area [data-form-param='acctgItmNm']").val("");
            },


            init_pagingInfo : function() {
          	   var that = this;
          	   that.pgNbr = 1; // 페이지번호
          	   that.pgCnt = 500; // 페이지건수
          	   that.acctgList = [];
             },
//
//
//
            selectList : function() {
            	this.init_pagingInfo();
                this.fn_loadList();
            },
//
//
//
            selectNextList : function() {
            	this.pageNum++;
            	this.fn_loadList();
            },


//
//
//
            toggleSearchResult : function() {
                fn_pageLayerCtrl(this.$el.find("#popup-acctgItm-search-grid"), this.$el.find("#btn-search-result-toggle"));
            },




//
//
//
            initialize: function (initData) {
                $.extend(this, initData);


                this.enableDim = true;
                this.initData = initData;
                this.createGrid();
            },


            createGrid: function () {
                var that = this;


                this.popupAcctgItmSearchGrid = new ExtGrid({
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
            },


//
//
//
            render: function () {
                this.$el.html(this.tpl());
                this.$el.find(".popup-acctgItm-search-grid").html(this.popupAcctgItmSearchGrid.render({'height': CaPopGridHeight}));


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


//
//
//
            fn_loadList: function () {
                var that = this;
                var sParam = {};


                // sParam.cdNbrTpCd    = that.$el.find("#search-condition-area [data-form-param='cdKnd']").val();
                sParam.instCd       = $.sessionStorage('headerInstCd');
                sParam.acctgDscd    = that.$el.find("#search-condition-area [data-form-param='acctgDstnctn']").val();
                sParam.bsisDscd     = that.$el.find("#search-condition-area [data-form-param='bsisDstnctn']").val();
                sParam.acctgItmCd   = that.$el.find("#search-condition-area [data-form-param='acctgItmCd']").val();
                sParam.acctgItmNm   = that.$el.find("#search-condition-area [data-form-param='acctgItmNm']").val();
                sParam.closeAcctgInqryYn = "Y";
                sParam.pgNbr = that.pgNbr;
                sParam.pgCnt = that.pgCnt;


                var linkData = {"header": fn_getHeader("CAPAC0018402"), "CaCoaMgmtSvcGetCoaListIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                        	var tbLists = [];
                        	var list = responseData.CaCoaMgmtSvcGetCoaTreeListOut.children;
                        	if(list != null) {
                        		if(that.pgNbr == 1) {
                            		that.popupAcctgItmSearchGrid.setData(list);
                            		tbLists = list;
                            	}


                       		   else {
                       			   // 다음
                       			   tbLists = that.popupAcctgItmSearchGrid.getAllData().concat(list);
                       			   that.popupAcctgItmSearchGrid.setData(tbLists);
                       		   }


                        		if(responseData.CaCoaMgmtSvcGetCoaTreeListOut.inqryCnt > that.$el.find('.popup-acctgItm-search-grid').find('.x-grid-data-row').length) {
                        			// 다음버튼 활성화
                        			that.$el.find('.nxt-btn').prop("disabled", false);
                        		}


                        		if(sParam.acctgItmCd.length > 0 || sParam.acctgItmCd.length > 0) {
                        			// 다음버튼 비활성화
                        			that.$el.find('.nxt-btn').prop("disabled", true);
                        		}


                        		that.$el.find('.x-grid-table td:nth-child(6):contains("Y")').parent().find('td').css("background-color","gainsboro");
                        	}


                            if (tbLists != null) {
                            	var totCnt = tbLists.length;
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                            }


                            that.$el.find('#btn-popup-select').removeClass('on');
                        }
                    }   // end of suucess: fucntion
                });
            },




//
//
//
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


//
//
//
            afterClose : function() {
                this.remove();
            }


        });


        return popupacctgItmSearch;
    }
);
