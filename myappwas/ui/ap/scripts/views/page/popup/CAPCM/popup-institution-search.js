define(
    [
        'text!app/views/page/popup/CAPCM/popup-institution-search.html',
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
        var popupInstSearch = Popup.extend({


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
            	, 'click #btn-save-condition-inquire': 'fn_save' // 저장버튼클릭
        		, 'click #btn-delete-condition-inquire': 'fn_delete' // 삭제버튼클릭
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
                this.$el.find("#search-condition-area [data-form-param='instCd']").val("");
                this.$el.find("#search-condition-area [data-form-param='instNm']").val("");
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
                fn_pageLayerCtrl(this.$el.find("#popup-code-search-grid"), this.$el.find("#btn-search-result-toggle"));
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


                this.popupInstSearchGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'instCd', 'instNm']
                    , id: 'popupInstSearchGrid'
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
                            text: bxMsg('cbb_items.AT#instCd'),
                            flex: 1,
                            dataIndex: 'instCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#instNm'),
                            flex: 2,
                            dataIndex: 'instNm',
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
                this.$el.find(".popup-code-search-grid").html(this.popupInstSearchGrid.render({'height': CaPopGridHeight}));


                if(!fn_isEmpty(this.initData.savePsblYn) && this.initData.savePsblYn == 'Y') {
                	this.$el.find('#btn-save-condition-inquire').show();
                	this.$el.find('#btn-delete-condition-inquire').show();
                } else {
                	this.$el.find('#btn-save-condition-inquire').hide();
                	this.$el.find('#btn-delete-condition-inquire').hide();
                }
                this.$el.find("#search-condition-area [data-form-param='instNm']").val(this.initData.instNm);


                this.fn_loadList();


                this.show();
            },


//
//
//
            fn_loadList: function () {
                var that = this;
                var sParam = {};


                sParam.instCd        = that.$el.find("#search-condition-area [data-form-param='instCd']").val();
                sParam.instNm      = that.$el.find("#search-condition-area [data-form-param='instNm']").val();


                var linkData = {"header": fn_getHeader("CAPCM0308402"), "CaInstMgmtSvcGetInstIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var instList = responseData.CaInstMgmtSvcGetInstOut.instList;
                            var totCnt = instList.length;


                            if (instList != null || instList.length > 0) {
                                // that.subViews['indexPaging'].setPaging(pgNbr, totalCount);
                                that.popupInstSearchGrid.setData(instList);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                            } else {
                                that.popupInstSearchGrid.resetData();
                            }


                            that.$el.find('#btn-popup-select').removeClass('on');
                        }
                    }   // end of suucess: fucntion
                });
            },


            fn_save: function () {
                var that = this;
                sParam = {};


                sParam.instCd        = that.$el.find("#search-condition-area [data-form-param='instCd']").val();
                sParam.instNm      = that.$el.find("#search-condition-area [data-form-param='instNm']").val();


                var linkData = {"header": fn_getHeader("CAPCM0308102"), "CaInstMgmtSvcRegIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            that.fn_loadList();
                        }
                    }
                });
            },


            fn_delete: function () {
                var that = this;
                sParam = {};


                sParam.instCd        = that.$el.find("#search-condition-area [data-form-param='instCd']").val();


                var linkData = {"header": fn_getHeader("CAPCM0308301"), "CaInstMgmtSvcRegIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                        	that.fn_loadList();
                        }
                    }
                });
            },


//
//
//
            fn_select: function () {
                var selectedData = this.popupInstSearchGrid.grid.getSelectionModel().selected.items[0];
                var param = {};


                if (!selectedData) {
                    return;
                } else {
                	param.instCd = selectedData.data.instCd;
                    param.instNm = selectedData.data.instNm;
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


        return popupInstSearch;
    }
);
