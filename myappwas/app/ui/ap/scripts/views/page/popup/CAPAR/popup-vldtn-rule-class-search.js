define(
    [
        'text!app/views/page/popup/CAPAR/popup-vldtn-rule-class-search.html',
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
        var popupClassSearch = Popup.extend({


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
                this.$el.find("#search-condition-area [data-form-param='code']").val("");
                this.$el.find("#search-condition-area [data-form-param='cdNm']").val("");
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
                fn_pageLayerCtrl(this.$el.find("#popup-vldtn-rule-class-search-grid"));
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


                this.popupVldtnRuleSearchGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'cmpntCd', 'classNm', 'classDescCntnt']
                    , id: 'popupVldtnRuleSearchGrid'
                    , columns: [
                        {
                            text: 'No.',
                            dataIndex: 'rowIndex',
                            sortable: false,
                            height: 25,
                            flex: 1,
                            style: 'text-align:center',
                            align: 'center',
                            // other config you need....
                            renderer: function (value, metaData, record, rowIndex) {
                                return rowIndex + 1;
                            }
                        },                        
                        {
                            text: bxMsg('cbb_items.AT#cmpntNm'),
                            flex: 8,
                            dataIndex: 'cmpntCd',
                            style: 'text-align:center',
                            align: 'center',
                            renderer: function (val) {
                            	return bxMsg('cbb_items.CDVAL#11602' + val);
                            }
                        },
                        {
                            text: bxMsg('cbb_items.AT#classNm'),
                            flex: 8,
                            dataIndex: 'classNm',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.AT#classDescCntnt'),
                            flex: 8,
                            dataIndex: 'classDescCntnt',
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


//
//
//
            render: function () {
                this.$el.html(this.tpl());
                this.$el.find(".popup-vldtn-rule-class-search-grid").html(this.popupVldtnRuleSearchGrid.render({'height': CaPopGridHeight}));


                this.setComboBoxes(this.initData);
                this.show();


                if(this.initData) this.setSearchCondition(this.initData);             
            },


            setSearchCondition: function (data) {
                var that = this;


                if(data) {
                	that.$el.find("#search-condition-area [data-form-param='classNm']").val(data.classNm); 
                }


                that.fn_loadList();
            },


            setComboBoxes: function (data) {
            	var sParam = {};


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "popup-cmpntNm-wrap";
                sParam.targetId = "cmpntNm";
                sParam.cdNbr = "11602";    
                if(data.cmpntCd) sParam.selectVal = data.cmpntCd;
                sParam.disabled = true;
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
            },


//
//
//
            fn_loadList: function () {	
                var that = this;
                var sParam = {};                
                sParam.cmpntCd = that.$el.find("#search-condition-area [data-form-param='cmpntNm']").val();
                sParam.classNm = that.$el.find("#search-condition-area [data-form-param='classNm']").val();
                sParam.classLayerTpCd = that.initData.classLayerTp;


                var linkData = {"header": fn_getHeader("CAPCM0208404"), "CaClassMgmtSvcGetClassInfoListIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var cndList = responseData.CaClassMgmtSvcGetClassInfoListOut.classList;
                            var totCnt = cndList.length;


                            if (cndList != null || cndList.length > 0) {
                                // that.subViews['indexPaging'].setPaging(pgNbr, totalCount);
                                that.popupVldtnRuleSearchGrid.setData(cndList);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                            } else {
                                that.popupVldtnRuleSearchGrid.resetData();
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
                var selectedData = this.popupVldtnRuleSearchGrid.grid.getSelectionModel().selected.items[0];
                var param = {};


                console.log(selectedData);


                if (!selectedData) {
                    return;
                } else {
                    param.classNm = selectedData.data.classNm;
                    param.classDescCntnt = selectedData.data.classDescCntnt;                    
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


        return popupClassSearch;
    }
);