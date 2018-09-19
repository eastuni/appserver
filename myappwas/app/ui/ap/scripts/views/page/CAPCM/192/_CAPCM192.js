define(
    [
        'bx/common/config',
        'text!app/views/page/CAPCM/192/_CAPCM192.html',
        'bx-component/ext-grid/_ext-grid',
        'app/views/page/popup/CAPSV/popup-service',
        'app/views/page/popup/CAPCM/popup-role-search'
    ]
    , function (
        config,
        tpl,
        ExtGrid,
        PopupSrvcSrch,
        PopupRoleSrch
    ) {
        /**
         * Backbone
         */
        var CAPCM192View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section',
            // 클래스이름 설정
            className: 'bx-container CAPCM192-page',
            // 탬플릿 설정
            templates: {
                'tpl': tpl
            },
            // 이벤트 설정
            events: {
                'change .CAPCM192-srvcCmpntCd-wrap': 'inquireLeftServiceList',


                'click #btn-search-condition-reset': 'resetSearchCondition',


                'click #btn-search-condition-inquire': 'inquireRoleServiceRelationList',


                'click #btn-search-result-save': 'saveSearchResult',
                'click #btn-service-access-authority-save': 'saveServiceAccessAuthority',


                'click #btn-role-search': 'openRoleSearchPopup',
                'click #btn-service-search': 'openServiceSearchPopup',


                'click #btn-search-result-excel': 'downloadSearchResultWithExcel',
                'click #btn-service-access-authority-excel': 'downloadServiceAccessAuthorityWithExcel',


                'click #btn-grid-add-data': 'addGridData',
                'click #btn-grid-del-data': 'deleteGridData',


                'click #btn-search-condition-toggle': 'toggleSearchCondition',
                'click #btn-search-result-toggle': 'toggleSearchResult',
                'click #btn-service-access-authority-toggle': 'toggleServiceAccessAuthority'
            }


            /**
             * initialize
             */
            , initialize: function (initData) {
                this.deleteList = [];


                $.extend(this, initData);


                this.createGrid();
            },


            /**
             * render
             */
            render: function () {
                this.$el.html(this.tpl());
                this.$el.find("#CAPCM192-search-result-grid").html(this.CAPCM192SrchRsltGrid.render({'height': CaGridHeight}));
                this.$el.find("#CAPCM192-service-access-left-grid").html(this.CAPCM192SrvcAcsAthrtyLeftGrid.render({'height': CaGridHeight}));
                this.$el.find("#CAPCM192-service-access-right-grid").html(this.CAPCM192SrvcAcsAthrtyRightGrid.render({'height': CaGridHeight}));


                this.setComboBoxes();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPCM192-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPCM192-wrap #btn-service-access-authority-save')
                                    		]);
                return this.$el;
            },


            createGrid: function () {
                var that = this;


                this.CAPCM192SrchRsltGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'roleId', 'roleNm', 'srvcCd', 'srvcNm', 'lastChngTmstmp'],
                    id: 'CAPCM192SrchRsltGrid',
                    columns: [
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
                            text: bxMsg('cbb_items.AT#srvcCd'),
                            flex: 1,
                            dataIndex: 'srvcCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#srvcNm'),
                            flex: 1,
                            dataIndex: 'srvcNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#regtDt'),
                            flex: 1,
                            dataIndex: 'lastChngTmstmp',
                            style: 'text-align:center',
                            align: 'center',
                            type: 'date',
                            renderer : function(value) {
                                return XDate(value).toString('yyyy-MM-dd');
                            }
                        },
                        {
                            xtype: 'actioncolumn',
                            width: 80,
                            align: 'center',
                            text: bxMsg('cbb_items.SCRNITM#del'),
                            style: 'text-align:center',
                            items: [
                                {
                                    //  icon: 'images/icon/x-delete-16.png'
                                    iconCls : "bw-icon i-25 i-func-trash",
                                    tooltip: bxMsg('tm-layout.delete-field'),
                                    handler: function (grid, rowIndex, colIndex, item, e, record) {
                                        that.deleteList.push(record.data);
                                        grid.store.remove(record);
                                    }
                                }
                            ]
                        }
                    ], // end of columns


                    // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                    gridConfig: {
                        // 셀 에디팅 플러그인
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                // 2번 클릭시, 에디팅할 수 있도록 처리
                                clicksToEdit: 2
                                , listeners: {
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
                                that.selectSrchRsltGridRecord();
                            }
                        }
                    }
                });


                this.CAPCM192SrvcAcsAthrtyLeftGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'srvcCd', 'srvcNm'],
                    id: 'CAPCM192SrvcAcsAthrtyLeftGrid',
                    columns: [
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
                            text: bxMsg('cbb_items.AT#srvcCd'),
                            flex: 1,
                            dataIndex: 'srvcCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#srvcNm'),
                            flex: 1,
                            dataIndex: 'srvcNm',
                            style: 'text-align:center',
                            align: 'center'
                        }
                    ], // end of columns


                    // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                    gridConfig: {
                        multiSelect: true,
                        // 셀 에디팅 플러그인
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                // 2번 클릭시, 에디팅할 수 있도록 처리
                                clicksToEdit: 2
                                , listeners: {
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
                            }
                        }
                    }
                });


                this.CAPCM192SrvcAcsAthrtyRightGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'srvcCd', 'srvcNm'],
                    id: 'CAPCM192SrvcAcsAthrtyRightGrid',
                    columns: [
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
                            text: bxMsg('cbb_items.AT#srvcCd'),
                            flex: 1,
                            dataIndex: 'srvcCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#srvcNm'),
                            flex: 1,
                            dataIndex: 'srvcNm',
                            style: 'text-align:center',
                            align: 'center'
                        }
                    ], // end of columns


                    // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                    gridConfig: {
                        multiSelect: true,
                        // 셀 에디팅 플러그인
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                // 2번 클릭시, 에디팅할 수 있도록 처리
                                clicksToEdit: 2
                                , listeners: {
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
                            }
                        }
                    }
                });
            },


            setComboBoxes: function () {
                var sParam = {};


                sParam.className = "CAPCM192-srvcCmpntCd-wrap";
                sParam.targetId = "srvcCmpntCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "11603";
                fn_getCodeList(sParam, this);   // 서비스컴포넌트코드
            },


            setSearchResult: function (data) {
                var totCnt = data.length;


                this.CAPCM192SrchRsltGrid.setData(data);
                this.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
            },


            setServiceAccessAuthorityLeftSide: function (list) {
                this.CAPCM192SrvcAcsAthrtyLeftGrid.setData(list);
            },


            setServiceAccessAuthorityRightSide: function (data, list) {
                this.$el.find('#service-access-authority-area [data-form-param="roleId"]').val(data.roleId);
                this.$el.find('#service-access-authority-area [data-form-param="roleNm"]').val(data.roleNm);
                this.CAPCM192SrvcAcsAthrtyRightGrid.setData(list);
            },


            selectSrchRsltGridRecord: function () {
                if(this.CAPCM192SrchRsltGrid.grid.getSelectionModel().selected.items[0]) {
                    var selectedData = this.CAPCM192SrchRsltGrid.grid.getSelectionModel().selected.items[0].data;
                    this.inquireRightServiceList(selectedData);
                }
            },


            resetSearchCondition: function () {
                this.$el.find('#search-condition-area [data-form-param="roleId"]').val("");
                this.$el.find('#search-condition-area [data-form-param="roleNm"]').val("");
                this.$el.find('#search-condition-area [data-form-param="srvcCd"]').val("");
                this.$el.find('#search-condition-area [data-form-param="srvcNm"]').val("");
            },


            inquireRoleServiceRelationList: function () {
                var that = this;
                var sParam = {};


                sParam.instCd = $.sessionStorage('headerInstCd');
                sParam.roleId = this.$el.find('#search-condition-area [data-form-param="roleId"]').val();
                sParam.roleNm = this.$el.find('#search-condition-area [data-form-param="roleNm"]').val();
                sParam.srvcCd = this.$el.find('#search-condition-area [data-form-param="srvcCd"]').val();
                sParam.srvcNm = this.$el.find('#search-condition-area [data-form-param="srvcNm"]').val();


                console.log(sParam);


                var linkData = {"header": fn_getHeader("CAPCM1928401"), "CaRoleMgmtSvcGetRoleServiceRelationListIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var list = responseData.CaRoleMgmtSvcGetRoleServiceRelationListOut.tblNm;


                            if (list != null) {
                                if( list.length <= 0) {
                                    that.$el.find('#service-access-authority-area [data-form-param="roleId"]').val(sParam.roleId);
                                    that.$el.find('#service-access-authority-area [data-form-param="roleNm"]').val(sParam.roleNm);
                                    //그리드 초기화
                                    that.CAPCM192SrchRsltGrid.setData(list);
                                    //서비스 접근 권한
                                    that.CAPCM192SrvcAcsAthrtyRightGrid.setData(list);
                                    //서비스 접근 권한 왼쪽 판넬 리스트 초기화
                                    that.CAPCM192SrvcAcsAthrtyLeftGrid.setData(list);
	                            }else{
	                                that.setSearchResult(list);


	                                // 삭제 로우 초기화
	                                that.deleteList = [];        
	                            }
                            }


                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            inquireLeftServiceList: function (e) {
                var that = this;
                var sParam = {};


                sParam.instCd   = $.sessionStorage('headerInstCd');
                sParam.cmpntCd  = $(e.target).val();


                console.log(sParam);


                var linkData = {"header": fn_getHeader("CAPSV0048401"), "CaSrvcPrflMgmtSvcGetInstSrvcBsicIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var list = responseData.CaSrvcPrflMgmtSvcGetInstSrvcBsicOut.tblNm;


                            if (list != null) {
                                that.setServiceAccessAuthorityLeftSide(list);
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            inquireRightServiceList: function (data) {
                var that = this;
                var sParam = {};


                sParam.instCd = $.sessionStorage('headerInstCd');
                sParam.roleId = data.roleId;
                sParam.roleNm = data.roleNm;


                console.log(sParam);


                var linkData = {"header": fn_getHeader("CAPCM1928400"), "CaRoleMgmtSvcGetRoleServiceRelationListByRoleIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var list = responseData.CaRoleMgmtSvcGetRoleServiceRelationListOut.tblNm;


                            if (list != null) {
                                that.setServiceAccessAuthorityRightSide(data, list);
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            openRoleSearchPopup: function () {
                var that = this;
                var param = {};
                // var roleNm = this.$el.find('#search-condition-area [data-form-param="roleNm"]').val();
                //
                // if(roleNm) {
                //     param.roleNm = roleNm;
                // }


                this.popupRoleSrch = new PopupRoleSrch(param);
                this.popupRoleSrch.render();
                this.popupRoleSrch.on('popUpSetData', function (data) {
                    that.$el.find('#search-condition-area [data-form-param="roleId"]').val(data.roleId);
                    that.$el.find('#search-condition-area [data-form-param="roleNm"]').val(data.roleNm);
                });
            },


            openServiceSearchPopup: function () {
                var that = this;
                var param = {};
                // var srvcNm = this.$el.find('#search-condition-area [data-form-param="srvcNm"]').val();
                //
                // if(srvcNm) {
                //     param.srvcNm = srvcNm;
                // }


                this.popupSrvcSrch = new PopupSrvcSrch(param);
                this.popupSrvcSrch.render();
                this.popupSrvcSrch.on('popUpSetData', function (data) {
                    that.$el.find('#search-condition-area [data-form-param="srvcCd"]').val(data.srvcCd);
                    that.$el.find('#search-condition-area [data-form-param="srvcNm"]').val(data.srvcNm);
                });
            },


            saveSearchResult: function (event) {
                if(this.deleteList.length < 1) return;


                var that = this;

                //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }

                function saveData() {
                    var deleteList = [];
                    var sParam = {};


                    sParam.instCd = $.sessionStorage('headerInstCd');
                    sParam.roleId = that.$el.find('#search-condition-area [data-form-param="roleId"]').val();


                    $(that.deleteList).each(function(index, element) {
                        var sub = {};


                        sub.instCd = $.sessionStorage('headerInstCd');
                        sub.roleId = element.roleId;
                        sub.srvcCd = element.srvcCd;


                        deleteList.push(sub);
                    });


                    console.log(deleteList);


                    sParam.tblNm = deleteList;


                    var linkData = {"header": fn_getHeader("CAPCM1928102"), "CaRoleMgmtSvcSaveRoleServiceRelationListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                // 재조회
                                that.inquireRoleServiceRelationList();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            saveServiceAccessAuthority: function (event) {
                var that = this;

                //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var tbl = [];
                    var sParam = {};


                    sParam.instCd = $.sessionStorage('headerInstCd');
                    sParam.roleId = that.$el.find('#service-access-authority-area [data-form-param="roleId"]').val();
                    if( sParam.roleId == null ||  sParam.roleId == ""){
                    	sParam.roleId = that.$el.find('#search-condition-area [data-form-param="roleId"]').val();
                    }


                    $(that.CAPCM192SrvcAcsAthrtyRightGrid.getAllData()).each(function(index, element) {
                        var sub = {};


                        sub.instCd = $.sessionStorage('headerInstCd');
                        sub.roleId = sParam.roleId;
                        sub.srvcCd = element.srvcCd;


                        tbl.push(sub);
                    });


                    console.log(tbl);


                    sParam.tblNm = tbl;


                    var linkData = {"header": fn_getHeader("CAPCM1928101"), "CaRoleMgmtSvcSaveRoleServiceRelationListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            downloadSearchResultWithExcel: function () {
                this.CAPCM192SrchRsltGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM192')+"_"+getCurrentDate("yyyy-MM-dd"));
            },


            downloadServiceAccessAuthorityWithExcel: function () {
                this.CAPCM192SrvcAcsAthrtyRightGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM192')+"_"
                    +bxMsg('cbb_items.SCRNITM#srvcSrchRslt')+"_"+getCurrentDate("yyyy-MM-dd"));
            },


            addGridData: function () {
                var that = this;
                var selectedRows = that.CAPCM192SrvcAcsAthrtyLeftGrid.getSelectedItem();
                var rightGridData = that.CAPCM192SrvcAcsAthrtyRightGrid.getAllData();


                if(selectedRows) {
                    $(selectedRows).each(function (leftIndex, leftElement) {
                        var checkValue = true;


                        $(rightGridData).each(function (rightIndex, rightElement) {
                            if(leftElement.srvcCd == rightElement.srvcCd) {
                                checkValue = false;
                                return false;
                            }
                        });


                        if(checkValue) {
                            var data = {};
                            data.srvcCd = leftElement.srvcCd;
                            data.srvcNm = leftElement.srvcNm;
                            that.CAPCM192SrvcAcsAthrtyRightGrid.addData(data);
                        }
                    });
                }
            },


            deleteGridData: function () {
                var that = this;
                var selectedRows = that.CAPCM192SrvcAcsAthrtyRightGrid.getSelectedRecords();


                if (selectedRows.length > 0) {
                    this.CAPCM192SrvcAcsAthrtyRightGrid.removeRow(selectedRows);
                }
            },


            toggleSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find('#search-condition-area'), this.$el.find('#btn-search-condition-toggle'));
            },


            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find('#btn-search-result-toggle'));
            },


            toggleServiceAccessAuthority: function () {
                fn_pageLayerCtrl(this.$el.find('#service-access-authority-area'), this.$el.find('#btn-service-access-authority-toggle'));
            }
        }); // end of Backbone.View.extend({


        return CAPCM192View;
    } // end of define function
)
; // end of define
