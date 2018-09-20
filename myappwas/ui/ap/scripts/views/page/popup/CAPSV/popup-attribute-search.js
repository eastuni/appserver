define(
    [
        'text!app/views/page/popup/CAPSV/popup-attribute-search.html',
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
        var popupAttributeSearch = Popup.extend({


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
            initialize: function (initConfig) {
                $.extend(this, initConfig);


                this.enableDim = true;
                this.createGrid();
            },


//
//
//
            render: function () {
                this.$el.html(this.tpl());
                this.$el.find(".popup-standard-attribute-grid").html(this.popupStandardAttributeGrid.render({'height': CaPopGridHeight}));
                this.show();
            },


            createGrid: function () {
                var that = this;


                this.popupStandardAttributeGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'atrbtNm', 'engAtrbtNm', 'useLngAtrbtNm', 'atrbtVldtnWayCd', 'atrbtVldtnRuleCntnt', 'atrbtVldtnXtnRuleCntnt', 'atrbtTpCd']
                    , id: 'popupStandardAttributeGrid'
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
                            text: bxMsg('cbb_items.SCRNITM#atrbt'),
                            flex: 1,
                            dataIndex: 'atrbtNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#atrbtNm'),
                            flex: 1,
                            dataIndex: 'engAtrbtNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#loginLngAtrbtNm'),
                            flex: 1,
                            dataIndex: 'useLngAtrbtNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#atrbtVldtnWayCd'),
                            flex: 1,
                            dataIndex: 'atrbtVldtnWayCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#atrbtVldtnRuleCntnt'),
                            flex: 1,
                            dataIndex: 'atrbtVldtnRuleCntnt',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#atrbtVldtnXtnRuleCntnt'),
                            flex: 1,
                            dataIndex: 'atrbtVldtnXtnRuleCntnt',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                        	text: bxMsg('cbb_items.AT#atrbtTpCd'),
                        	flex: 1,
                        	dataIndex: 'atrbtTpCd',
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: true
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
                                that.popupStandardAttributeGrid.setData(tableList);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                            } else {
                                that.popupStandardAttributeGrid.resetData();
                            }
                        }
                    }   // end of suucess: fucntion
                });
            },




//
//
//
            fn_select: function () {
                var selectedData = this.popupStandardAttributeGrid.grid.getSelectionModel().selected.items[0];
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


        return popupAttributeSearch;
    }
);
