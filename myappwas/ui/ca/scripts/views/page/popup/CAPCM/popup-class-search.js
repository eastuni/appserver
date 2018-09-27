define(
    [
        'text!app/views/page/popup/CAPCM/popup-class-search.html',
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


                'click #btn-popup-select': 'fn_select', // 선택버튼클릭
                'keydown #searchKey' : 'fn_enter'
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
                this.$el.find('#search-condition-area [data-form-param="classNm"]').val("");
                this.$el.find('#search-condition-area [data-form-param="parntClass"]').val("");
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
                fn_pageLayerCtrl(this.$el.find("#popup-class-search-grid"));
            },




//
//
//
            initialize: function (initConfig) {
                $.extend(this, initConfig);


                this.enableDim = true;
                this.initData = initConfig;
                console.log("initialize");


                this.createGrid();
            },


//
//
//
            render: function () {
                this.$el.html(this.tpl());
                this.$el.find(".popup-class-search-grid").html(this.popupClassSearchGrid.render({'height': CaPopGridHeight}));


                this.setComboBoxes(this.initData);
                this.show();


                if(this.initData) this.setSearchCondition(this.initData);
            },


            setSearchCondition: function (data) {
                var that = this;


                console.log(data);


                that.$el.find("#search-condition-area [data-form-param='classNm']").val(data.classNm);                                
            },


            createGrid: function () {
                var that = this;


                this.popupClassSearchGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'cmpntCd', 'classNm', 'classDesc', 'parntClassNm', 'pckgNm'],
                    id: 'popupClassSearchGrid',
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
                            width: 100,
                            dataIndex: 'cmpntCd',
                            style: 'text-align:center',
                            align: 'center',
                            renderer: function (val) {
                                return bxMsg('cbb_items.CDVAL#11602' + val);
                            }


                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#class'),
                            flex: 1,
                            dataIndex: 'classNm',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.ABRVTN#explntn'),
                            flex: 1,
                            dataIndex: 'classDesc',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#parntClass'),
                            flex: 1,
                            dataIndex: 'parntClassNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {text: "",dataIndex: 'pckgNm',hidden : true}
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


                console.log(data);


                // combobox 정보 셋팅
                sParam.className = "PopupClassSrch-cmpntCd-wrap";
                sParam.targetId = "cmpntCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "11602";
                if(!$.isEmptyObject(data)) {
                	if(data.cmpntCd) {
                		sParam.selectVal = data.cmpntCd;
                		sParam.disabled = true;
                	}
                }
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "PopupClassSrch-classLayerTp-wrap";
                sParam.targetId = "classLayerTp";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                if (data !== undefined && data.useSubsetCdYn == 'Y') {
                	sParam.cdNbr = "A0056";
                }else{
                	sParam.cdNbr = "A0035";
                }


                if(!$.isEmptyObject(data)) {
                	if(data.classLayerTp) {
                		sParam.selectVal = data.classLayerTp;
                		sParam.disabled = true;
                	}
                }
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
            },


//
//
//
            fn_loadList: function (data) {
                var that = this;
                var sParam = {};


                sParam.cmpntCd = that.$el.find("#search-condition-area [data-form-param='cmpnt']").val();
                sParam.classLayerTpCd = that.$el.find("#search-condition-area [data-form-param='classLayerTp']").val();
                sParam.classNm = that.$el.find("#search-condition-area [data-form-param='classNm']").val();
                sParam.parntClassNm = that.$el.find("#search-condition-area [data-form-param='parntClass']").val();


                var linkData = {"header": fn_getHeader("CAPCM0208404"), "CaClassMgmtSvcGetClassInfoListIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var classList = responseData.CaClassMgmtSvcGetClassInfoListOut.classList;
                            var totCnt = classList.length;


                            if (classList != null || classList.length > 0) {
                                // that.subViews['indexPaging'].setPaging(pgNbr, totalCount);
                                that.popupClassSearchGrid.setData(classList);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                            } else {
                                that.popupClassSearchGrid.resetData();
                            }
                        }


                    }   // end of suucess: fucntion
                });
            },




//
//
//
            fn_select: function () {
                var selectedData = this.popupClassSearchGrid.grid.getSelectionModel().selected.items[0];
                var param = {};


                if (!selectedData) {
                    return;
                } else {
                    param.classNm = selectedData.data.classNm;
                    param.classDescCntnt = selectedData.data.classDescCntnt;
                    param.cmpntCd = selectedData.data.cmpntCd;
                    param.pckgNm = selectedData.data.pckgNm;
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


        return popupClassSearch;
    }
);
