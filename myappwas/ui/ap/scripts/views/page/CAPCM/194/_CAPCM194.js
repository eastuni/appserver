define(
    [
        'bx/common/config',
        'text!app/views/page/CAPCM/194/_CAPCM194.html',
        'bx-component/ext-grid/_ext-grid',
        'bx/common/common-info',
        'app/views/page/popup/CAPSV/popup-screen-search',
        'app/views/page/popup/CAPCM/popup-role-search'
    ]
    , function (
        config,
        tpl,
        ExtGrid,
        commonInfo,
        PopupScrnSrch,
        PopupRoleSrch
    ) {
        /**
         * Backbone
         */
        var CAPCM194View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section',
            // 클래스이름 설정
            className: 'bx-container CAPCM194-page',
            // 탬플릿 설정
            templates: {
                'tpl': tpl
            },
            // 이벤트 설정
            events: {
                'change .CAPCM194-srvcCmpntCd-wrap': 'inquireLeftScreenList',


                'click #btn-search-condition-reset': 'resetSearchCondition',


                'click #btn-search-condition-inquire': 'inquireRoleScreenRelationList',


                'click #btn-search-result-save': 'saveSearchResult',
                'click #btn-screen-access-authority-save': 'saveScreenAccessAuthority',


                'click #btn-role-search': 'openRoleSearchPopup',
                'click #btn-screen-search': 'openScreenSearchPopup',


                'click #btn-search-result-excel': 'downloadSearchResultWithExcel',
                'click #btn-screen-access-authority-excel': 'downloadScreenAccessAuthorityWithExcel',


                'click #btn-grid-add-data': 'addGridData',
                'click #btn-grid-del-data': 'deleteGridData',


                'click #btn-search-condition-toggle': 'toggleSearchCondition',
                'click #btn-search-result-toggle': 'toggleSearchResult',
                'click #btn-screen-access-authority-toggle': 'toggleScreenAccessAuthority'
            }


            /**
             * initialize
             */
            , initialize: function (initData) {
                var that = this;
            	
                this.deleteList = [];


                $.extend(this, initData);

                if (commonInfo.getInstInfo().instCd) {
                    that.instCd = commonInfo.getInstInfo().instCd;
                } else {
                    alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));
                    that.instCd = "";
                }
                this.createGrid();
            },


            /**
             * render
             */
            render: function () {
                this.$el.html(this.tpl());
                this.$el.find("#CAPCM194-search-result-grid").html(this.CAPCM194SrchRsltGrid.render({'height': CaGridHeight}));
                this.$el.find("#CAPCM194-screen-access-left-grid").html(this.CAPCM194ScrnAcsAthrtyLeftGrid.render({'height': CaGridHeight}));
                this.$el.find("#CAPCM194-screen-access-right-grid").html(this.CAPCM194ScrnAcsAthrtyRightGrid.render({'height': CaGridHeight}));


                this.setComboBoxes();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPCM194-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPCM194-wrap #btn-screen-access-authority-save')
                                    		]);
                return this.$el;
            },


            createGrid: function () {
                var that = this;


                this.CAPCM194SrchRsltGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'roleId', 'roleNm', 'scrnId', 'scrnNm', 'lastChngTmstmp'],
                    id: 'CAPCM194SrchRsltGrid',
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
                                    	alert('yyyy');
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


                this.CAPCM194ScrnAcsAthrtyLeftGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'scrnId', 'scrnNm'],
                    id: 'CAPCM194ScrnAcsAthrtyLeftGrid',
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


                this.CAPCM194ScrnAcsAthrtyRightGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'scrnId', 'scrnNm'],
                    id: 'CAPCM194ScrnAcsAthrtyRightGrid',
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
                        multiSelect: true,
                        // 셀 에디팅 플러그인
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                // 2번 클릭시, 에디팅할 수 있도록 처리
                                clicksToEdit: 2
                                , listeners: {
                                    'beforeedit': function (editor, e) {
                                    	alert('xxxx');
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


                sParam.className = "CAPCM194-srvcCmpntCd-wrap";
                sParam.targetId = "srvcCmpntCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "11603";
                fn_getCodeList(sParam, this);   // 서비스컴포넌트코드
            },


            setSearchResult: function (data) {
                var totCnt = data.length;


                this.CAPCM194SrchRsltGrid.setData(data);
                this.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
            },


            setScreenAccessAuthorityLeftSide: function (list) {
                this.CAPCM194ScrnAcsAthrtyLeftGrid.setData(list);
            },


            setScreenAccessAuthorityRightSide: function (data, list) {
                this.$el.find('#screen-access-authority-area [data-form-param="roleId"]').val(data.roleId);
                this.$el.find('#screen-access-authority-area [data-form-param="roleNm"]').val(data.roleNm);
                this.CAPCM194ScrnAcsAthrtyRightGrid.setData(list);
            },


            selectSrchRsltGridRecord: function () {
                if(this.CAPCM194SrchRsltGrid.grid.getSelectionModel().selected.items[0]) {
                    var selectedData = this.CAPCM194SrchRsltGrid.grid.getSelectionModel().selected.items[0].data;
                    this.inquireRightScreenList(selectedData);
                }
            },


            resetSearchCondition: function () {
                this.$el.find('#search-condition-area [data-form-param="roleId"]').val("");
                this.$el.find('#search-condition-area [data-form-param="roleNm"]').val("");
                this.$el.find('#search-condition-area [data-form-param="scrnId"]').val("");
                this.$el.find('#search-condition-area [data-form-param="scrnNm"]').val("");
            },


            inquireRoleScreenRelationList: function () {
                var that = this;
                var sParam = {};


                sParam.instCd = that.instCd;
                sParam.roleId = this.$el.find('#search-condition-area [data-form-param="roleId"]').val();
                sParam.roleNm = this.$el.find('#search-condition-area [data-form-param="roleNm"]').val();
                sParam.scrnId = this.$el.find('#search-condition-area [data-form-param="scrnId"]').val();
                sParam.scrnNm = this.$el.find('#search-condition-area [data-form-param="scrnNm"]').val();


                console.log(sParam);


                var linkData = {"header": fn_getHeader("CAPCM1948401"), "CaRoleMgmtSvcGetRoleScreenRelationListIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var list = responseData.CaRoleMgmtSvcGetRoleScreenRelationListOut.tblNm;


                            if (list != null) {
                                if( list.length <= 0) {
                                    that.$el.find('#screen-access-authority-area [data-form-param="roleId"]').val(sParam.roleId);
                                    that.$el.find('#screen-access-authority-area [data-form-param="roleNm"]').val(sParam.roleNm);
                                    //그리드 초기화
                                    that.CAPCM194SrchRsltGrid.setData(list);
                                    //화면 접근 권한
                                    that.CAPCM194ScrnAcsAthrtyRightGrid.setData(list);
                                    //화면 접근 권한 왼쪽 판넬 리스트 초기화
                                    that.CAPCM194ScrnAcsAthrtyLeftGrid.setData(list);
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


            inquireLeftScreenList: function (e) {
                var that = this;
                var sParam = {};

                sParam.instCd = that.instCd;
//                sParam.instCd   = $.sessionStorage('headerInstCd');
                sParam.cmpntCd  = $(e.target).val();
//                sParam.cmpntCd  = that.$el.find('#search-condition-area [data-form-param="srvcCmpntCd"]').val();


                console.log(sParam);


                var linkData = {"header": fn_getHeader("CAPSV0508406"), "CaScrnMgmtSvcGetScrnInfoListIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var list = responseData.CaScrnMgmtSvcGetScrnInfoListOut.tblNm;


                            if (list != null) {
                                that.setScreenAccessAuthorityLeftSide(list);
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            inquireRightScreenList: function (data) {
                var that = this;
                var sParam = {};


                sParam.instCd = that.instCd;
                sParam.roleId = data.roleId;
                sParam.roleNm = data.roleNm;


                console.log(sParam);


                var linkData = {"header": fn_getHeader("CAPCM1948400"), "CaRoleMgmtSvcGetRoleScreenRelationListByRoleIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var list = responseData.CaRoleMgmtSvcGetRoleScreenRelationListOut.tblNm;


                            if (list != null) {
                                that.setScreenAccessAuthorityRightSide(data, list);
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


            openScreenSearchPopup: function () {
                var that = this;
                var param = {};
                // var srvcNm = this.$el.find('#search-condition-area [data-form-param="srvcNm"]').val();
                //
                // if(srvcNm) {
                //     param.srvcNm = srvcNm;
                // }


                this.popupScrnSrch = new PopupScrnSrch(param);
                this.popupScrnSrch.render();
                this.popupScrnSrch.on('popUpSetData', function (data) {
                    that.$el.find('#search-condition-area [data-form-param="scrnId"]').val(data.scrnId);
                    that.$el.find('#search-condition-area [data-form-param="scrnNm"]').val(data.scrnNm);
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


                    sParam.instCd = that.instCd;
                    sParam.roleId = that.$el.find('#search-condition-area [data-form-param="roleId"]').val();


                    $(that.deleteList).each(function(index, element) {
                        var sub = {};


                        sub.instCd = sParam.instCd;
                        sub.roleId = element.roleId;
                        sub.scrnId = element.scrnId;


                        deleteList.push(sub);
                    });


                    console.log(deleteList);


                    sParam.tblNm = deleteList;


                    var linkData = {"header": fn_getHeader("CAPCM1948102"), "CaRoleMgmtSvcSaveRoleScreenRelationListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                // 재조회
                                that.inquireRoleScreenRelationList();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            saveScreenAccessAuthority: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var tbl = [];
                    var sParam = {};


                    sParam.instCd = that.instCd;
                    sParam.roleId = that.$el.find('#screen-access-authority-area [data-form-param="roleId"]').val();
                    if( sParam.roleId == null ||  sParam.roleId == ""){
                    	sParam.roleId = that.$el.find('#search-condition-area [data-form-param="roleId"]').val();
                    }
                    $(that.CAPCM194ScrnAcsAthrtyRightGrid.getAllData()).each(function(index, element) {
                        var sub = {};


                        sub.instCd = sParam.instCd;
                        sub.roleId = sParam.roleId;
                        sub.scrnId = element.scrnId;


                        tbl.push(sub);
                    });


                    console.log(tbl);


                    sParam.tblNm = tbl;


                    var linkData = {"header": fn_getHeader("CAPCM1948101"), "CaRoleMgmtSvcSaveRoleScreenRelationListIn": sParam};


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
                this.CAPCM194SrchRsltGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM194')+"_"+getCurrentDate("yyyy-mm-dd"));
            },


            downloadScreenAccessAuthorityWithExcel: function () {
                this.CAPCM194ScrnAcsAthrtyRightGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM194')+"_"
                    +bxMsg('cbb_items.SCRNITM#scrnSrchRslt')+"_"+getCurrentDate("yyyy-mm-dd"));
            },


            addGridData: function () {
                var that = this;
                var selectedRows = that.CAPCM194ScrnAcsAthrtyLeftGrid.getSelectedItem();
                var rightGridData = that.CAPCM194ScrnAcsAthrtyRightGrid.getAllData();


                if(selectedRows) {
                    $(selectedRows).each(function (leftIndex, leftElement) {
                        var checkValue = true;


                        $(rightGridData).each(function (rightIndex, rightElement) {
                            if(leftElement.scrnId == rightElement.scrnId) {
                                checkValue = false;
                                return false;
                            }
                        });


                        if(checkValue) {
                            var data = {};
                            that.$el.find('[data-form-param="roleId"]').prop("disabled", false);
                            that.$el.find('[data-form-param="roleNm"]').prop("disabled", false);
                            data.scrnId = leftElement.scrnId;
                            data.scrnNm = leftElement.scrnNm;
                            that.CAPCM194ScrnAcsAthrtyRightGrid.addData(data);
                        }
                    });
                }
            },


            deleteGridData: function () {
                var that = this;
                var selectedRows = that.CAPCM194ScrnAcsAthrtyRightGrid.getSelectedRecords();


                if (selectedRows.length > 0) {
                    this.CAPCM194ScrnAcsAthrtyRightGrid.removeRow(selectedRows);
                }
            },


            toggleSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find('#search-condition-area'), this.$el.find('#btn-search-condition-toggle'));
            },


            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find('#btn-search-result-toggle'));
            },


            toggleScreenAccessAuthority: function () {
                fn_pageLayerCtrl(this.$el.find('#screen-access-authority-area'), this.$el.find('#btn-screen-access-authority-toggle'));
            }
        }); // end of Backbone.View.extend({


        return CAPCM194View;
    } // end of define function
)
; // end of define
