define(
    [
        'text!app/views/page/popup/CAPAR/popup-xtnAtrbt-class-search.html',
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
        var popupXtnAtrbtSearch = Popup.extend({


            templates: {
                'tpl': tpl
            },


            attributes: {
                'style': 'width: 680px; height: 640px;'
            },


            events: {
                'click #btn-search-xtnAtrbt-reset': 'reset', // 초기화
                'click #btn-search-xtnAtrbt-inquire': 'selectList', // 목록조회


                'click #btn-search-result-toggle': 'toggleSearchResult', // 그리드영역 접기
                'click #btn-search-xtnAtrbt-toggle': 'toggleSearchXtnAtrbt', // 조회영역 접기


                'click #btn-popup-select': 'fn_select' // 선택버튼클릭
            },




//
//
//
            toggleSearchXtnAtrbt : function() {
                fn_pageLayerCtrl(this.$el.find("#search-xtnAtrbt-area"));
            },


//
//
//
            reset : function() {                
                this.$el.find("#search-condition-area [data-form-param='xtnAtrbt']").val("");
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
                fn_pageLayerCtrl(this.$el.find("#popup-xtnAtrbt-search-grid"));
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


                this.popupXtnAtrbtSearchGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'xtnAtrbtNm', 'atrbtNm']
                    , id: 'popupXtnAtrbtSearchGrid'
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
                            text: bxMsg('cbb_items.AT#xtnAtrbtNm'),
                            flex: 3,
                            dataIndex: 'xtnAtrbtNm',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.AT#atrbtNm'),
                            flex: 3,
                            dataIndex: 'atrbtNm',
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
                this.$el.find(".popup-xtnAtrbt-search-grid").html(this.popupXtnAtrbtSearchGrid.render({'height': '300px'}));
                this.show();


               	this.setSearchXtnAtrbt(this.initData);             
            },


            setSearchXtnAtrbt: function (data) {
                var that = this;


                console.log(data);


                if(data) {
                	that.$el.find("#search-xtnAtrbt-area [data-form-param='xtnAtrbtNm']").val(data.xtnAtrbtNm);
                }


                that.fn_loadList();
            },


//
//
//
            fn_loadList: function () {	
                var that = this;
                var sParam = {};
                sParam.instCd = $.sessionStorage('headerInstCd');
                sParam.xtnAtrbtNm = that.$el.find("#search-xtnAtrbt-area [data-form-param='xtnAtrbtNm']").val();


                var linkData = {"header": fn_getHeader("CAPAR0608402"), "CaArrXtnAtrbtCntrlClassInqryIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var xtnList = responseData.CaArrXtnAtrbtCntrlClassItmListOut.tblList;
                            var totCnt = xtnList.length;


                            if (xtnList != null || xtnList.length > 0) {
                                // that.subViews['indexPaging'].setPaging(pgNbr, totalCount);
                                that.popupXtnAtrbtSearchGrid.setData(xtnList);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                            } else {
                                that.popupXtnAtrbtSearchGrid.resetData();
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
                var selectedData = this.popupXtnAtrbtSearchGrid.grid.getSelectionModel().selected.items[0];
                var param = {};


                console.log(selectedData);


                if (!selectedData) {
                    return;
                } else {
                	param.xtnAtrbtNm = selectedData.data.xtnAtrbtNm;
                    param.atrbtNm = selectedData.data.atrbtNm;                    
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


        return popupXtnAtrbtSearch;
    }
);
