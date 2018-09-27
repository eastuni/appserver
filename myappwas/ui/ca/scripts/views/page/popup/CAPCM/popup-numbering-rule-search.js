define(
    [
        'text!app/views/page/popup/CAPCM/popup-numbering-rule-search.html',
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
        var popupNumberingRuleSearch = Popup.extend({


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
                this.$el.find('#search-condition-area [data-form-param="nbrgAtrbtNm"]').val("");
                this.$el.find('#search-condition-area [data-form-param="nbrgRuleNm"]').val("");
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
                fn_pageLayerCtrl(this.$el.find("#popup-nbrg-rule-search-grid"));
            },




//
//
//
            initialize: function (initConfig) {
                $.extend(this, initConfig);


                this.enableDim = true;
                this.initData = initConfig;


                this.createGrid();
            },


//
//
//
            render: function () {
                this.$el.html(this.tpl());
                this.$el.find(".popup-nbrg-rule-search-grid").html(this.popupNbrgRuleSearchGrid.render({'height': CaPopGridHeight}));


                this.setComboBoxes(this.initData);
                this.show();


                if(this.initData) this.setSearchCondition(this.initData);
            },


            setSearchCondition: function (data) {
                var that = this;


                console.log(data);


                that.$el.find("#search-condition-area [data-form-param='nbrgAtrbtNm']").val(data.nbrgAtrbtNm);                                
            },


            createGrid: function () {
                var that = this;


                this.popupNbrgRuleSearchGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'cmpntCd', 'nbrgAtrbtNm', 'nbrgRuleNm'],
                    id: 'popupNbrgRuleSearchGrid',
                    columns: [
                        {
                            text: 'No.',
                            dataIndex: 'rowIndex',
                            sortable: false,
                            height : 25,
                            width : 80,
                            style: 'text-align:center',
                            align: 'center',
                            // other config you need....
                            renderer: function (value, metaData, record, rowIndex) {
                                return rowIndex + 1;
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#cmpnt'),
                            flex: 1,
                            dataIndex: 'cmpntCd',
                            style: 'text-align:center',
                            align: 'center',
                            renderer: function (val) {
                                return bxMsg('cbb_items.CDVAL#11602' + val);
                            }


                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#nbrgRule'),
                            flex: 1,
                            dataIndex: 'nbrgAtrbtNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#nbrgRuleNm'),
                            flex: 1,
                            dataIndex: 'nbrgRuleNm',
                            style: 'text-align:center',
                            align: 'left'
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


            setComboBoxes: function (data) {
            	var sParam = {};


                // combobox 정보 셋팅
                sParam.className = "PopupNbrgRuleSrch-cmpntCd-wrap";
                sParam.targetId = "cmpntCd";
                sParam.cdNbr = "11602";
                if(data) sParam.selectVal = data.cmpntCd;
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                if(data) sParam.disabled = true;
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
            },


//
//
//
            fn_loadList: function (data) {
                var that = this;
                var sParam = {};


                sParam.instCd = $.sessionStorage('headerInstCd');
                sParam.cmpntCd = that.$el.find("#search-condition-area [data-form-param='cmpnt']").val();
                sParam.nbrgAtrbtNm = that.$el.find("#search-condition-area [data-form-param='nbrgAtrbtNm']").val();
                sParam.nbrgRuleNm = that.$el.find("#search-condition-area [data-form-param='nbrgRuleNm']").val();


                var linkData = {"header": fn_getHeader("CAPCM0058403"), "CaNbrgRuleSvcGetNbrgRuleListIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var nbrgRuleList = responseData.CaNbrgRuleSvcGetNbrgRuleListOut.nbrgRuleList;

                            if (nbrgRuleList != null || nbrgRuleList.length > 0) {
                            	
                            	var gridList = [];
                            	var gridList1 = [];
                            	
                            	$(nbrgRuleList).each(function(idx, data) {
                                    if (data.cmpntCd != null) {
                                        if (data.cmpntCd.indexOf(sParam.cmpntCd) > -1) {
                                        	gridList.push(data);
                                        }
                                    }
                                });
                            	
                            	if(sParam.nbrgAtrbtNm != ""){
                            		$(gridList).each(function(idx, data) {
                                        if (data.nbrgAtrbtNm.indexOf(sParam.nbrgAtrbtNm) > -1) {
                                        	gridList1.push(data);
                                        }
                                    });
                            	}      
                            	
                            	if(sParam.nbrgRuleNm != ""){
                            		$(gridList).each(function(idx, data) {
                                        if (data.nbrgRuleNm.indexOf(sParam.nbrgRuleNm) > -1) {
                                        	gridList1.push(data);
                                        }
                                    });
                            	}    
                            	
                            	if(gridList1.length > 0){
                            		gridList = [];
                            		$(gridList1).each(function(idx, data) {
                            			gridList.push(data);
                                    });
                            	}

                            	var totCnt = gridList.length;
                                that.popupNbrgRuleSearchGrid.setData(gridList);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                            } else {
                                that.popupNbrgRuleSearchGrid.resetData();
                            }
                        }


                    }   // end of suucess: fucntion
                });
            },




//
//
//
            fn_select: function () {
                var selectedData = this.popupNbrgRuleSearchGrid.grid.getSelectionModel().selected.items[0];
                var param = {};


                if (!selectedData) {
                    return;
                } else {
                    param.nbrgAtrbtNm = selectedData.data.nbrgAtrbtNm;
                    param.nbrgRuleNm = selectedData.data.nbrgRuleNm;
                    param.cmpntCd = selectedData.data.cmpntCd;
                    console.log(param);
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


        return popupNumberingRuleSearch;
    }
);
