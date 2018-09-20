define(
    [
        'text!app/views/page/popup/CAPAR/popup-condition-search.html',
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
        var popupConditionSearch = Popup.extend({


            templates: {
                'tpl': tpl
            },


            attributes: {
                'style': 'width: 680px; height: 640px;'
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
                this.$el.find("#search-condition-area [data-form-param='cndCd']").val("");
                this.$el.find("#search-condition-area [data-form-param='cndNm']").val("");
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
                fn_pageLayerCtrl(this.$el.find("#popup-condition-search-grid"));
            },




//
//
//
            initialize: function (initData) {
                $.extend(this, initData);	console.log(initData);


                this.enableDim = true;
                this.initData = initData;
                this.createGrid();
            },


            createGrid: function () {
                var that = this;


                this.popupConditionSearchGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'cndTpCdNm', 'cndCd', 'cndNm']
                    , id: 'popupConditionSearchGrid'
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
                            text: bxMsg('cbb_items.AT#cndTpCdNm'),
                            flex: 3,
                            dataIndex: 'cndTpCdNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#cndCd'),
                            flex: 3,
                            dataIndex: 'cndCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#cndNm'),
                            flex: 3,
                            dataIndex: 'cndNm',
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
                this.$el.find(".popup-condition-search-grid").html(this.popupConditionSearchGrid.render({'height': '300px'}));
                this.show();


               	this.setSearchCondition(this.initData);             
            },


            setSearchCondition: function (data) {
                var that = this;


                console.log(data);


                // 콤보데이터 로딩
                var sParam;
                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPAR040-cndTp-wrap";
                sParam.targetId = "cndTp";
                sParam.cdNbr = "A0553";                
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.nullYn = "Y";
                sParam.selectVal = "";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                if(data) {
                	that.$el.find("#search-condition-area [data-form-param='cndCd']").val(data.cndCd);
                    that.$el.find("#search-condition-area [data-form-param='cndNm']").val(data.cndNm);
                }


                if(data.cndCd||data.cndNm){
                	that.fn_loadList();
                }
            },


//
//
//
            fn_loadList: function () {	
                var that = this;
                var sParam = {};
                sParam.instCd = $.sessionStorage('headerInstCd');
                sParam.cndTpCd = that.$el.find("#search-condition-area [data-form-param='cndTp'] option:selected").val();
                sParam.cndCd = that.$el.find("#search-condition-area [data-form-param='cndCd']").val();
                sParam.cndNm = that.$el.find("#search-condition-area [data-form-param='cndNm']").val();


                var linkData = {"header": fn_getHeader("SPD0010402"), "PdTxSrvcMgmtSvcIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var cndList = responseData.PdTxSrvcMgmtSvcOut.tbl;
                            var totCnt = cndList.length;


                            if (cndList != null || cndList.length > 0) {
                                // that.subViews['indexPaging'].setPaging(pgNbr, totalCount);
                                that.popupConditionSearchGrid.setData(cndList);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                            } else {
                                that.popupConditionSearchGrid.resetData();
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
                var selectedData = this.popupConditionSearchGrid.grid.getSelectionModel().selected.items[0];
                var param = {};


                console.log(selectedData);


                if (!selectedData) {
                    return;
                } else {
                	param.cndCd = selectedData.data.cndCd;
                    param.cndNm = selectedData.data.cndNm;                    
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


        return popupConditionSearch;
    }
);
