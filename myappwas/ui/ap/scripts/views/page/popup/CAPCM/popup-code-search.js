define(
    [
        'text!app/views/page/popup/CAPCM/popup-code-search.html',
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
        var popupCodeSearch = Popup.extend({


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


                'click #btn-popup-select': 'fn_select', // 선택버튼클릭
    			'keydown #searchKey' : 'fn_enter'
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
                this.$el.find("#search-condition-area [data-form-param='cdKnd'] option:eq(0)").attr("selected", "selected");
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


                this.popupCodeSearchGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'cdKnd', 'cdNbr', 'cdNbrNm', 'cdDescCntnt']
                    , id: 'popupCodeSearchGrid'
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
                            text: bxMsg('cbb_items.SCRNITM#cdKnd'),
                            flex: 1,
                            dataIndex: 'cdKnd',
                            style: 'text-align:center',
                            align: 'center',
                            renderer: function (val) {
                                return val ? bxMsg('cbb_items.CDVAL#11915' + val) : "1";
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#code'),
                            flex: 1,
                            dataIndex: 'cdNbr',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#cdNm'),
                            flex: 2,
                            dataIndex: 'cdNbrNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#cdDescCntnt'),
                            flex: 2,
                            dataIndex: 'cdDescCntnt',
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
                this.$el.find(".popup-code-search-grid").html(this.popupCodeSearchGrid.render({'height': CaPopGridHeight}));


                this.setComboBoxes();
                this.show();


                console.log(this.initData);


                if(!fn_isNull(this.initData)) {
                	if(!fn_isNull(this.initData.cdNbr)) {
                        this.setSearchCondition(this.initData.cdNbr);
                	}
                }
            },


            setComboBoxes: function () {
                var sParam = {};


                // combobox 정보 셋팅
                sParam.className = "PopupCdSrch-cdKnd-wrap";
                sParam.targetId = "cdKnd";
                sParam.cdNbr = "11915"; // 코드는 베이스+서비스 로 등록 되어 있다.
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
            },


            setSearchCondition: function (data) {
                var that = this;


                console.log(data);


                if(data) {
                    that.$el.find("#search-condition-area [data-form-param='code']").val(data);
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
                sParam.cdNbr        = that.$el.find("#search-condition-area [data-form-param='code']").val();
                sParam.cdNbrNm      = that.$el.find("#search-condition-area [data-form-param='cdNm']").val();


                if(!sParam.cdNbr && !sParam.cdNbrNm) return;


                var linkData = {"header": fn_getHeader("CAPCM0018400"), "CaCmnCdSvcGetCdMListIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var cdList = responseData.CaCmnCdSvcGetCdMListOut.tblNm;
                            var totCnt = cdList.length;


                            if (cdList != null || cdList.length > 0) {
                                // that.subViews['indexPaging'].setPaging(pgNbr, totalCount);
                                that.popupCodeSearchGrid.setData(cdList);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                            } else {
                                that.popupCodeSearchGrid.resetData();
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
                var selectedData = this.popupCodeSearchGrid.grid.getSelectionModel().selected.items[0];
                var param = {};


                console.log(selectedData);


                if (!selectedData) {
                    return;
                } else {
                    param.cdNbr = selectedData.data.cdNbr;
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


            /**
             * 엔터 입력 처리를 위한 콜백함수
             */
            ,fn_enter: function (event) {
                var that = this;
                var event = event || window.event;
                var keyID = (event.which) ? event.which : event.keyCode;
                if(keyID == 13) { //enter
                	that.fn_loadList();
                }
            }


        });


        return popupCodeSearch;
    }
);
