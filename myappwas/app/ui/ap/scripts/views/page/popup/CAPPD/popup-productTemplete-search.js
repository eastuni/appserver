define(
    [
        'text!app/views/page/popup/CAPPD/popup-productTemplete-search.html',
        'bx-component/ext-grid/_ext-grid',
        'bx/common/common-info',
        'bx/common/common-index-paging',
        'bx-component/popup/popup'
    ],
    function (
        tpl,
        ExtGrid,
        commonInfo,
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


                'change .bizDscd-wrap': 'changeBusinessDistinctCode',
                'change .pdTpCd-wrap': 'changeProductTypeCode',
                'change .pdTmpltCd-wrap': 'changeProductTemplateCode',


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
                this.$el.find('#search-condition-area [data-form-param="bizDscd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#search-condition-area [data-form-param="pdTpCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#search-condition-area [data-form-param="pdTmpltNm"]').val("");


                this.$el.find('#search-condition-area [data-form-param="pdTpCd"]').empty();
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
                fn_pageLayerCtrl(this.$el.find("#popup-grid"));
            },




//
//
//
            initialize: function (initConfig) {
                $.extend(this, initConfig);


                this.enableDim = true;


            },


//
//
//
            render: function () {
                this.$el.html(this.tpl());
                this.createGrid();


              //상품대분류
                var sParam = {};
                sParam.className = "bizDscd-wrap";
                sParam.targetId = "bizDscd";
                sParam.nullYn = "Y";
                sParam.cdNbr = "80015";
                fn_getCodeList(sParam, this);


                this.show();


                return this.$el;
            },


            createGrid: function () {
                var that = this;


                this.popupGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'pdTmpltCd', 'pdTmpltNm']
                    , id: 'popupGrid'
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
                            text: bxMsg('cbb_items.SCRNITM#pdTmpltCd'),
                            flex: 1,
                            dataIndex: 'pdTmpltCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#pdTmpltNm'),
                            flex: 1,
                            dataIndex: 'pdTmpltNm',
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


                this.$el.find(".popup-grid").html(this.popupGrid.render({'height': CaPopGridHeight}));
            },


//
//
//
            fn_loadList: function () {
                var that = this;
                var sParam = {};


                sParam.instCd = commonInfo.getInstInfo().instCd;
                sParam.bizDscd          = that.$el.find("#search-condition-area [data-form-param='bizDscd']").val();
                sParam.pdTpCd       = that.$el.find("#search-condition-area [data-form-param='pdTpCd']").val();
                sParam.pdTmpltNm    = that.$el.find("#search-condition-area [data-form-param='pdTmpltNm']").val();


                var linkData = {"header": fn_getHeader("SPD0010406"), "PdTxSrvcMgmtSvcIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var tableList = responseData.PdTxSrvcMgmtSvcOut.tbl;
                            var totCnt = tableList.length;


                            if (tableList != null || tableList.length > 0) {
                                that.popupGrid.setData(tableList);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                            } else {
                                that.popupGrid.resetData();
                            }
                        }
                    }   // end of suucess: fucntion
                });
            },




//
//
//
            fn_select: function () {
                var selectedData = this.popupGrid.grid.getSelectionModel().selected.items[0];
                var param = {};


                if (!selectedData) {
                    return;
                } else {
                    param.pdTmpltCd           = selectedData.data.pdTmpltCd;
                    param.pdTmpltNm           = selectedData.data.pdTmpltNm;
                }
                this.trigger('popUpSetData', param);
                this.close();
            },


            /**
             * 업무 구분 코드 변경
             */
            changeBusinessDistinctCode: function () {
                var sParam = {};
                var bizDscd = this.$el.find('#search-condition-area [data-form-param="bizDscd"]').val();


                var $selectPdTpCd = this.$el.find('#search-condition-area [data-form-param="pdTpCd"]');


                if (bizDscd == "") {


                } else {
                    //combobox 정보 셋팅
                    sParam.className = "pdTpCd-wrap";
                    sParam.targetId = "pdTpCd";
                    sParam.nullYn = "Y";
                    //inData 정보 셋팅
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                    sParam.bizDscd = bizDscd;
                    sParam.pdTpCd = "";
                    sParam.pdTmpltCd = "";
                    sParam.pdCd = "";
                    //상품유형코드 콤보데이터 load
                    fn_getPdCodeList(sParam, this, null, this.changeProductTypeCode);
                }
            },


            /**
             * 상품 유형 코드 변경
             */
            changeProductTypeCode: function (str) {
            	var that = this;


            	if(str.$el !== undefined) {
            		that = str;
            	}


                var sParam = {};
                var bizDscd = that.$el.find('#search-condition-area [data-form-param="bizDscd"]').val();
                var pdTpCd = that.$el.find('#search-condition-area [data-form-param="pdTpCd"]').val();


                var $selectPdTmpltCd = that.$el.find('#search-condition-area [data-form-param="pdTmpltCd"]');
                var $selectPdCd = that.$el.find('#search-condition-area [data-form-param="pdCd"]');




                if (pdTpCd == "") {


                } else {
                    //combobox 정보 셋팅
                    sParam.className = "pdTmpltCd-wrap";
                    sParam.targetId = "pdTmpltCd";
                    sParam.nullYn = "Y";
                    //inData 정보 셋팅
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                    sParam.bizDscd = bizDscd;
                    sParam.pdTpCd = pdTpCd;
                    sParam.pdTmpltCd = "";
                    sParam.pdCd = "";
                    //상품템플릿코드 콤보데이터 load
                    fn_getPdCodeList(sParam, that);
                }
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
