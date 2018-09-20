define(
    [
        'text!app/views/page/popup/CAPSV/popup-change-history-search.html',
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
        var popupChangeHistorySearch = Popup.extend({


            templates: {
                'tpl': tpl
            },


            attributes: {
                'style': 'width: 1000px; height: 700px;'
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
                fn_pageLayerCtrl(this.$el.find("#search-condition-area"));
            },


//
//
//
            reset : function() {
                this.$el.find("#search-condition-area [data-form-param='atrbtCode']").val("");
                this.$el.find("#search-condition-area [data-form-param='atrbtNm']").val("");
                this.$el.find("#search-condition-area [data-form-param='loginLngAtrbtNm']").val("");
            },


//
//
//
            selectList : function() {
                this.fn_loadList();
            },


//
//
//
            toggleSearchResult : function() {
                fn_pageLayerCtrl(this.$el.find("#popup-standard-attribute-grid"));
            },




//
//
//
            initialize: function (initParam) {
                $.extend(this, initParam);


                this.enableDim = true;
                this.createGrid();
            },


//
//
//
            render: function () {
                this.$el.html(this.tpl());
                this.$el.find(".popup-standard-attribute-grid").html(this.popupChangeHistoryGrid.render({'height': CaPopGridHeight}));
                this.show();
            },


            createGrid: function () {
                var that = this;


                this.popupChangeHistoryGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex','lastChngId', 'lastChngTmstmp', 'dstbBfChngCntnt', 'dstbAfChngCntnt']
                    , id: 'popupChangeHistoryGrid'
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
                            text: bxMsg('cbb_items.AT#lastChngId'),
                            flex: 1,
                            dataIndex: 'lastChngId',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#lastChngTmstmp'),
                            flex: 1,
                            dataIndex: 'lastChngTmstmp',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#dstbBfChngCntnt'),
                            flex: 1,
                            dataIndex: 'dstbBfChngCntnt',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#dstbAfChngCntnt'),
                            flex: 1,
                            dataIndex: 'dstbAfChngCntnt',
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
            fn_loadList: function () {
                var that = this;
                var sParam = {};


                sParam.atrbtNm          = that.$el.find("#search-condition-area [data-form-param='atrbtCode']").val();
                sParam.engAtrbtNm       = that.$el.find("#search-condition-area [data-form-param='atrbtNm']").val();
                sParam.useLngAtrbtNm    = that.$el.find("#search-condition-area [data-form-param='loginLngAtrbtNm']").val();


                var linkData = {"header": fn_getHeader("CAPCM0108401"), "CaStdAtrbtMgmtSvcGetStdAtrbtListIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var tableList = responseData.CaStdAtrbtMgmtSvcGetStdAtrbtListOut.atrbtList;
                            var totCnt = tableList.length;


                            if (tableList != null || tableList.length > 0) {
                                that.popupChangeHistoryGrid.setData(tableList);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                            } else {
                                that.popupChangeHistoryGrid.resetData();
                            }
                        }
                    }   // end of suucess: fucntion
                });
            },




//
//
//
            fn_select: function () {
                var selectedData = this.popupChangeHistoryGrid.grid.getSelectionModel().selected.items[0];
                var param = {};


                if (!selectedData) {
                    return;
                } else {
                    param.atrbtCd           = selectedData.data.atrbtNm;
                    param.atrbtNm           = selectedData.data.engAtrbtNm;
                    param.loginLngAtrbtNm   = selectedData.data.useLngAtrbtNm;
                    param.atrbtVldtnWayCd   = selectedData.data.atrbtVldtnWayCd;
                    param.atrbtVldtnRuleCntnt    = selectedData.data.atrbtVldtnRuleCntnt;
                    param.atrbtVldtnXtnRuleCntnt = selectedData.data.atrbtVldtnXtnRuleCntnt;
                    param.atrbtTpCd = selectedData.data.atrbtTpCd;
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


        return popupChangeHistorySearch;
    }
);
