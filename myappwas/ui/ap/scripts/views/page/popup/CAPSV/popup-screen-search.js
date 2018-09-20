define(
    [
        'text!app/views/page/popup/CAPSV/popup-screen-search.html',
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
        var popupScreenSearch = Popup.extend({


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
                this.$el.find("#search-condition-area [data-form-param='scrnId']").val("");
                this.$el.find("#search-condition-area [data-form-param='scrnNm']").val("");
                this.$el.find("#search-condition-area [data-form-param='cmpntCd'] option:eq(0)").attr("selected", "selected");
            },


//
//
//
            selectList : function() {
            	if(this.initData !=null && this.initData.menuTargetYn =='Y'){
            		 this.fn_loadList();
            	}else{
            		 this.inquireScreenList();
            	}
            },


//
//
//
            toggleSearchResult : function() {
                fn_pageLayerCtrl(this.$el.find("#popup-screen-search-grid"), this.$el.find("#btn-search-result-toggle"));
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


                this.popupScreenSearchGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'cmpntCd', 'scrnId', 'scrnNm']
                    , id: 'popupScreenSearchGrid'
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
                            text: bxMsg('cbb_items.SCRNITM#cmpnt'),
                            flex: 1,
                            dataIndex: 'cmpntCd',
                            style: 'text-align:center',
                            align: 'center',
                            code: '11603',
                            renderer: function (val) {
                                return val ? bxMsg('cbb_items.CDVAL#11603' + val) : '';
                            }
                        },
                        {
                            text: bxMsg('cbb_items.AT#scrnId'),
                            flex: 1,
                            dataIndex: 'scrnId',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#scrnNm'),
                            flex: 1,
                            dataIndex: 'scrnNm',
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
                this.$el.find(".popup-screen-search-grid").html(this.popupScreenSearchGrid.render({'height': CaPopGridHeight}));


                this.setComboBoxes();
                this.show();

                if(!fn_isNull(this.initData)) {
                    if(!fn_isNull(this.initData.scrnNm)) {
                        this.setSearchCondition(this.initData.scrnNm);
                    }
                }
            },


            setComboBoxes: function () {
                var sParam = {};


                // combobox 정보 셋팅
                sParam.className = "PopupScrnSrch-cmpntCd-wrap";
                sParam.targetId = "cmpntCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "11603"; // 컴포넌트코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
            },


            setSearchCondition: function (data) {
                var that = this;


                console.log(data);


                if(data) {
                    that.$el.find("#search-condition-area [data-form-param='roleNm']").val(data);
                }


                that.fn_loadList();
                //that.inquireScreenList();
            },


//
//
//
            fn_loadList: function () {
                var that = this;
                var sParam = {};


                // sParam.cdNbrTpCd    = that.$el.find("#search-condition-area [data-form-param='cdKnd']").val();
                sParam.instCd       = $.sessionStorage('headerInstCd');
                sParam.cmpntCd      = that.$el.find("#search-condition-area [data-form-param='cmpntCd']").val();
                sParam.scrnId       = that.$el.find("#search-condition-area [data-form-param='scrnId']").val();
                sParam.scrnNm       = that.$el.find("#search-condition-area [data-form-param='scrnNm']").val();


                var linkData = {"header": fn_getHeader("CAPSV0298401"), "CaScrnMgmtSvcGetScrnInfoListIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var list = responseData.CaScrnMgmtSvcGetScrnListOut.scrnList;
                            var totCnt = list.length;


                            if (list != null) {
                                // that.subViews['indexPaging'].setPaging(pgNbr, totalCount);
                                that.popupScreenSearchGrid.setData(list);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                            }


                            that.$el.find('#btn-popup-select').removeClass('on');
                        }
                    }   // end of suucess: fucntion
                });
            },

            
            fn_loadList: function () {
                var that = this;
                var sParam = {};


                // sParam.cdNbrTpCd    = that.$el.find("#search-condition-area [data-form-param='cdKnd']").val();
                sParam.instCd       = $.sessionStorage('headerInstCd');
                sParam.cmpntCd      = that.$el.find("#search-condition-area [data-form-param='cmpntCd']").val();
                sParam.scrnId       = that.$el.find("#search-condition-area [data-form-param='scrnId']").val();
                sParam.scrnNm       = that.$el.find("#search-condition-area [data-form-param='scrnNm']").val();


                var linkData = {"header": fn_getHeader("CAPSV0298401"), "CaScrnMgmtSvcGetScrnInfoListIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var list = responseData.CaScrnMgmtSvcGetScrnListOut.scrnList;
                            var totCnt = list.length;


                            if (list != null) {
                                // that.subViews['indexPaging'].setPaging(pgNbr, totalCount);
                                that.popupScreenSearchGrid.setData(list);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                            }


                            that.$el.find('#btn-popup-select').removeClass('on');
                        }
                    }   // end of suucess: fucntion
                });
            },
            
            inquireScreenList: function () {
                var that = this;
                var sParam = {};
                that.saveList =[];
                that.TargetObj =[];
                that.deleteList =[];


                // 조회 key값 set




                sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                sParam.cmpntCd      = that.$el.find("#search-condition-area [data-form-param='cmpntCd']").val();
                sParam.scrnId       = that.$el.find("#search-condition-area [data-form-param='scrnId']").val();
                sParam.scrnNm       = that.$el.find("#search-condition-area [data-form-param='scrnNm']").val();
                var linkData = {"header": fn_getHeader("CAPSV0508401"), "CaScrnMgmtSvcGetScrnInfoListIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {


                        if (fn_commonChekResult(responseData)) {
                        	
                            var list = responseData.CaScrnMgmtSvcGetScrnInfoListOut.tblNm;
                            var totCnt = list.length;


                            if (list != null) {
                                // that.subViews['indexPaging'].setPaging(pgNbr, totalCount);
                                that.popupScreenSearchGrid.setData(list);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                            }
                        }
                    }
                });
            },



//
//
//
            fn_select: function () {
                var selectedData = this.popupScreenSearchGrid.grid.getSelectionModel().selected.items[0];
                var param = {};


                console.log(selectedData);


                if (!selectedData) {
                    return;
                } else {
                    param.scrnId = selectedData.data.scrnId;
                    param.scrnNm = selectedData.data.scrnNm;
                    param.cmpntCd = selectedData.data.cmpntCd;
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


        return popupScreenSearch;
    }
);
