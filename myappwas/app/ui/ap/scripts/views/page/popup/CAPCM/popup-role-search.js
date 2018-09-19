define(
    [
        'text!app/views/page/popup/CAPCM/popup-role-search.html',
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
           var totInqryYn="";
           var popupRoleSearch = Popup.extend({


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
                this.$el.find("#search-condition-area [data-form-param='roleId']").val("");
                this.$el.find("#search-condition-area [data-form-param='roleNm']").val("");
                this.$el.find("#search-condition-area [data-form-param='roleStsCd'] option:eq(0)").attr("selected", "selected");
                this.$el.find("#search-condition-area [data-form-param='roleTpCd'] option:eq(0)").attr("selected", "selected");
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
                fn_pageLayerCtrl(this.$el.find("#popup-role-search-grid"), this.$el.find("#btn-search-result-toggle"));
            },




//
//
//
            initialize: function (initData) {
                $.extend(this, initData);


                this.enableDim = true;
                this.initData = initData;
                totInqryYn=initData.totInqryYn;
                this.createGrid();
            },


            createGrid: function () {
                var that = this;


                this.popupRoleSearchGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'roleId', 'roleNm','roleTpCd', 'roleStsCd']
                    , id: 'popupRoleSearchGrid'
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
                            text: bxMsg('cbb_items.AT#roleId'),
                            flex: 1,
                            dataIndex: 'roleId',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#roleNm'),
                            flex: 1,
                            dataIndex: 'roleNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#roleTp'),
                            flex: 1,
                            dataIndex: 'roleTpCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#roleSts'),
                            flex: 1,
                            dataIndex: 'roleStsCd',
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
                this.$el.find(".popup-role-search-grid").html(this.popupRoleSearchGrid.render({'height': CaPopGridHeight}));


                this.setComboBoxes();
                this.show();


                console.log(this.initData);


                if(!fn_isNull(this.initData)) {
                    if(!fn_isNull(this.initData.totInqryYn)) {
                        this.setSearchCondition(this.initData.totInqryYn);
                    }
                }
            },


            setComboBoxes: function () {
                
            	var sParam = {};

                // combobox 정보 셋팅
                sParam.className = "PopupRoleSrch-roleStsCd-wrap";
                sParam.targetId = "roleStsCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A0054"; // 역할상태코드
                sParam.viewType = "ValNm";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
                
                var sParam = {};
                // combobox 정보 셋팅
                sParam.className = "PopupRoleSrch-roleTpCd-wrap";
                sParam.targetId = "roleTpCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A1124"; // 역할유형코드
                sParam.viewType = "ValNm";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
            },


            setSearchCondition: function (data) {
                var that = this;


                console.log(data);
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
                sParam.roleId       = that.$el.find("#search-condition-area [data-form-param='roleId']").val();
                sParam.roleNm       = that.$el.find("#search-condition-area [data-form-param='roleNm']").val();
                sParam.roleTpCd    = that.$el.find("#search-condition-area [data-form-param='roleTpCd']").val();
                sParam.roleStsCd    = that.$el.find("#search-condition-area [data-form-param='roleStsCd']").val();
                //admin은 관리자화면이라서 전체조회/스태프기준조회 분리해놓은거 다시 합침
//                if(totInqryYn){
//                	sParam.totInqryYn=totInqryYn;
//                }

                var linkData = {"header": fn_getHeader("CAPCM1918401"), "CaRoleMgmtSvcGetRoleListIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var list = responseData.CaRoleMgmtSvcGetRoleListOut.tblNm;
                            var totCnt = list.length;


                            if (list != null) {
                                // that.subViews['indexPaging'].setPaging(pgNbr, totalCount);
                                that.popupRoleSearchGrid.setData(list);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
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
                var selectedData = this.popupRoleSearchGrid.grid.getSelectionModel().selected.items[0];
                var param = {};


                console.log(selectedData);


                if (!selectedData) {
                    return;
                } else {
                    param.roleId = selectedData.data.roleId;
                    param.roleNm = selectedData.data.roleNm;
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


        return popupRoleSearch;
    }
);
