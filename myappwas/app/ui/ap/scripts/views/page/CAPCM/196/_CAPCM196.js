define(
    [
        'bx/common/config',
        'text!app/views/page/CAPCM/196/_CAPCM196.html',
        'bx-component/ext-grid/_ext-grid',
        'bx-component/ext-grid/_ext-tree-grid',
        'app/views/page/popup/CAPCM/popup-role-search'
    ]
    , function (
        config,
        tpl,
        ExtGrid,
        ExtTreeGrid,
        PopupRoleSrch
    ) {
        /**
         * Backbone
         */
        var CAPCM196View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section',
            // 클래스이름 설정
            className: 'bx-container CAPCM196-page',
            // 탬플릿 설정
            templates: {
                'tpl': tpl
            },
            // 이벤트 설정
            events: {
                'change .CAPCM196-clHrarcyId2-wrap': 'inquireLeftGroupList',


                'click #btn-search-condition-reset': 'resetSearchCondition',


                'click #btn-search-condition-inquire': 'inquireRoleGroupRelationList',


                'click #btn-search-result-save': 'saveSearchResult',
                'click #btn-group-access-authority-save': 'saveGroupAccessAuthority',


                'click #btn-role-search': 'openRoleSearchPopup',


                'click #btn-search-result-excel': 'downloadSearchResultWithExcel',
                'click #btn-group-access-authority-excel': 'downloadGroupAccessAuthorityWithExcel',


                'click #btn-grid-add-data': 'addGridData',
                'click #btn-grid-del-data': 'deleteGridData',


                'click #btn-search-condition-toggle': 'toggleSearchCondition',
                'click #btn-search-result-toggle': 'toggleSearchResult',
                'click #btn-group-access-authority-toggle': 'toggleGroupAccessAuthority'
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
                this.$el.find("#CAPCM196-search-result-grid").html(this.CAPCM196SrchRsltGrid.render({'height': CaGridHeight}));
                this.$el.find("#CAPCM196-group-access-left-grid").html(this.CAPCM196GrpAcsAthrtyLeftGrid.render({'height': CaGridHeight}));
                this.$el.find("#CAPCM196-group-access-right-grid").html(this.CAPCM196GrpAcsAthrtyRightGrid.render({'height': CaGridHeight}));


                this.setComboBoxes();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPCM196-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPCM196-wrap #btn-group-access-authority-save')
                                    		]);
                return this.$el;
            },


            createGrid: function () {
                var that = this;


                this.CAPCM196SrchRsltGrid = new ExtTreeGrid({
                    // 그리드 컬럼 정의
                    fields: ['clHrarcyId', 'clId', 'clNm', 'roleId', 'roleNm', 'lastChngTmstmp', 'children'],
                    id: 'CAPCM196SrchRsltGrid',
                    expanded: true,
                    columns: [
                        {
                            xtype: 'treecolumn',
                            width : 150,
                            height: 25
                        },
                        {
                            text: bxMsg('cbb_items.AT#clId'),
                            flex: 1,
                            dataIndex: 'clId',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.AT#clNm'),
                            flex: 1,
                            dataIndex: 'clNm',
                            style: 'text-align:center',
                            align: 'left'
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
                            text: bxMsg('cbb_items.SCRNITM#regtDt'),
                            flex: 1,
                            dataIndex: 'lastChngTmstmp',
                            style: 'text-align:center',
                            align: 'center',
                            type: 'date',
                            renderer : function(val) {
                                return val ? XDate(val).toString('yyyy-MM-dd') : '';
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
                                    	if(record.data.roleId) {
                                    		that.deleteList.push(record.data);
                                    		grid.store.remove(record);
                                    	}
                                    }
                                }
                            ]
                        }
                    ], // end of columns
                    listeners: {
                        click: {
                            element: 'body',
                            fn: function (event, element) {
                                that.selectSrchRsltGridRecord(event, element);
                            }
                        }
                    },
                    viewConfig: {
                        toggleOnDblClick: false,
                        plugins: {
                            ptype: 'treeviewdragdrop',
                            containerScroll: true
                        }
                    }
                });


                this.CAPCM196GrpAcsAthrtyLeftGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'clId', 'clNm'],
                    id: 'CAPCM196GrpAcsAthrtyLeftGrid',
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
                            text: bxMsg('cbb_items.AT#clId'),
                            flex: 1,
                            dataIndex: 'clId',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#clNm'),
                            flex: 1,
                            dataIndex: 'clNm',
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


                this.CAPCM196GrpAcsAthrtyRightGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'clId', 'clNm'],
                    id: 'CAPCM196GrpAcsAthrtyRightGrid',
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
                            text: bxMsg('cbb_items.AT#clId'),
                            flex: 1,
                            dataIndex: 'clId',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#clNm'),
                            flex: 1,
                            dataIndex: 'clNm',
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


                sParam.className = "CAPCM196-clHrarcyId-wrap";
                sParam.targetId = "clHrarcyId";
                sParam.nullYn = "N";
//                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A0112";
                fn_getCodeList(sParam, this);   // 분류체계코드


                sParam = {};
                sParam.className = "CAPCM196-clHrarcyId2-wrap";
                sParam.targetId = "clHrarcyId2";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A0112";
                fn_getCodeList(sParam, this);   // 분류체계코드
            },


            setSearchResult: function (sParam, data) {
                var totCnt = data.length;


                this.CAPCM196SrchRsltGrid.setStoreRootNode(data);
                this.CAPCM196SrchRsltGrid.expandAll();
                this.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                this.$el.find('#group-access-authority-area [data-form-param="roleId"]').val(sParam.roleId);
                this.$el.find('#group-access-authority-area [data-form-param="roleNm"]').val(sParam.roleNm);


            },


            setGroupAccessAuthorityLeftSide: function (list) {
                this.CAPCM196GrpAcsAthrtyLeftGrid.setData(list);
            },


            setGroupAccessAuthorityRightSide: function (data, list) {
                this.$el.find('#group-access-authority-area [data-form-param="roleId"]').val(data.roleId);
                this.$el.find('#group-access-authority-area [data-form-param="roleNm"]').val(data.roleNm);
                this.CAPCM196GrpAcsAthrtyRightGrid.setData(list);
            },


            /**
             * 상단 그리드 조회
             */
            inquireRoleGroupRelationList: function () {
                var that = this;
                var sParam = {};


                sParam.instCd       = $.sessionStorage('headerInstCd');
                sParam.roleId       = this.$el.find('#search-condition-area [data-form-param="roleId"]').val();
                sParam.roleNm       = this.$el.find('#search-condition-area [data-form-param="roleNm"]').val();
                sParam.clHrarcyId   = this.$el.find('#search-condition-area [data-form-param="clHrarcyId"]').val();


                console.log(sParam);


                var linkData = {"header": fn_getHeader("CAPCM1708402"), "CaClTreeMgmtSvcRoleIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var list = responseData.CaClTreeMgmtSvcRoleOut.children;


                            if (list != null) {
                                that.setSearchResult(sParam, list);


                                // 삭제 로우 초기화
                                that.deleteList = [];


                                // 하단 초기화
                                that.resetDetailArea();
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            /**
             * 상단 그리드 선택
             */
            selectSrchRsltGridRecord: function (event, element) {
                var isArrow = $(element).hasClass('x-tree-elbow-img');


                if(isArrow) return;


                if(this.CAPCM196SrchRsltGrid.grid.getSelectionModel().selected.items[0]) {
                    var selectedData = this.CAPCM196SrchRsltGrid.grid.getSelectionModel().selected.items[0].data;


                    this.$el.find('#group-access-authority-area [data-form-param="clHrarcyId"]').val(selectedData.clHrarcyId);
                    this.$el.find('#group-access-authority-area [data-form-param="roleId"]').val(selectedData.roleId ? selectedData.roleId : this.$el.find('#search-condition-area [data-form-param="roleId"]').val());
                    this.$el.find('#group-access-authority-area [data-form-param="roleNm"]').val(selectedData.roleNm ? selectedData.roleNm : this.$el.find('#search-condition-area [data-form-param="roleNm"]').val());
                    this.$el.find('#group-access-authority-area [data-form-param="clHrarcyId"]').trigger("change");
//                    this.inquireRightGroupList(selectedData);
                }
            },


            /**
             * 왼쪽 그리드 조회
             */
            inquireLeftGroupList: function (e) {
                var that = this;
                var sParam = {};


                sParam.clHrarcyId   = $(e.target).val();


                if(!sParam.clHrarcyId) {
                	return;
                }


                var linkData = {"header": fn_getHeader("CAPCM1708403"), "CaClTreeMgmtSvcIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var list = responseData.CaClTreeMgmtSvcOut.children;
                            var param = {
                                instCd: $.sessionStorage('headerInstCd'),
                                roleId: that.$el.find('#group-access-authority-area [data-form-param="roleId"]').val(),
                                roleNm: that.$el.find('#group-access-authority-area [data-form-param="roleNm"]').val(),
                                clId: '',
                                clHrarcyId: $(e.target).val()
                            };


                            if (list != null) {
                                that.setGroupAccessAuthorityLeftSide(list);
                            }


                            that.inquireRightGroupList(param);
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            /**
             * 오른쪽 그리드 조회
             */
            inquireRightGroupList: function (data) {
                var that = this;
                var sParam = {};


                sParam.instCd       = $.sessionStorage('headerInstCd');
                sParam.roleId       = data.roleId;
                sParam.clId         = data.clId;
                sParam.clHrarcyId   = data.clHrarcyId;


                console.log(sParam);


                var linkData = {"header": fn_getHeader("CAPCM1968400"), "CaRoleMgmtSvcGetRoleClassificationRelationListIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var list = responseData.CaRoleMgmtSvcGetRoleClassificationRelationListOut.tblNm;


                            if (list != null) {
                                that.setGroupAccessAuthorityRightSide(data, list);
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            /**
             * 조회조건 초기화
             */
            resetSearchCondition: function () {
                this.$el.find('#search-condition-area [data-form-param="roleId"]').val("");
                this.$el.find('#search-condition-area [data-form-param="roleNm"]').val("");
                this.$el.find('#search-condition-area [data-form-param="clHrarcyId"] option:eq(0)').prop('selected', true);
            },


            /**
             * 상세영역 초기화
             */
            resetDetailArea : function () {
            	this.$el.find('#group-access-authority-area [data-form-param="clHrarcyId"] option:eq(0)').prop('selected', true);
            	this.$el.find('#group-access-authority-area [data-form-param="roleId"]').val("");
            	this.$el.find('#group-access-authority-area [data-form-param="roleNm"]').val("");
            	this.CAPCM196GrpAcsAthrtyRightGrid.resetData();
            	this.CAPCM196GrpAcsAthrtyLeftGrid.resetData();


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


            /**
             * 그리드 삭제
             */
            saveSearchResult: function (event) {
                if(this.deleteList.length < 1) return;


                var that = this;

                //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var sParam = {};


                    sParam.instCd = $.sessionStorage('headerInstCd');
                    sParam.tblNm = [];


                    $(that.deleteList).each(function(index, element) {
                        var sub = {};


                        sub.instCd  = sParam.instCd;
                        sub.clHrarcyId = element.clHrarcyId;
                        sub.clId    = element.clId;
                        sub.roleId  = element.roleId;
                        sParam.tblNm.push(sub);
                    });


                    var linkData = {"header": fn_getHeader("CAPCM1968102"), "CaRoleMgmtSvcSaveRoleClassificationRelationListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                // 재조회
                                that.inquireRoleGroupRelationList();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            saveGroupAccessAuthority: function (event) {
                var that = this;

                //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var tbl = [];
                    var sParam = {};


                    sParam.instCd = $.sessionStorage('headerInstCd');
                    sParam.clHrarcyId = that.$el.find('#group-access-authority-area [data-form-param="clHrarcyId"]').val();
                    sParam.roleId = that.$el.find('#group-access-authority-area [data-form-param="roleId"]').val();
                    sParam.tblNm = [];


                    $(that.CAPCM196GrpAcsAthrtyRightGrid.getAllData()).each(function(index, element) {
                        var sub = {};


                        sub.instCd  = sParam.instCd;
                        sub.roleId  = sParam.roleId;
                        sub.clHrarcyId = sParam.clHrarcyId;
                        sub.clId    = element.clId;


                        sParam.tblNm.push(sub);
                    });


                    console.log(sParam.tblNm);




                    var linkData = {"header": fn_getHeader("CAPCM1968101"), "CaRoleMgmtSvcSaveRoleClassificationRelationListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                that.$el.find('#group-access-authority-area [data-form-param="clHrarcyId"]').trigger("change");
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            downloadSearchResultWithExcel: function () {
                this.CAPCM196SrchRsltGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM196')+"_"+getCurrentDate("yyyy-mm-dd"));
            },


            downloadGroupAccessAuthorityWithExcel: function () {
                this.CAPCM196GrpAcsAthrtyRightGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM196')+"_"
                    +bxMsg('cbb_items.SCRNITM#scrnSrchRslt')+"_"+getCurrentDate("yyyy-mm-dd"));
            },


            addGridData: function () {
                var that = this;
                var selectedRows = that.CAPCM196GrpAcsAthrtyLeftGrid.getSelectedItem();
                var rightGridData = that.CAPCM196GrpAcsAthrtyRightGrid.getAllData();


                if(selectedRows) {
                    $(selectedRows).each(function (leftIndex, leftElement) {
                        var checkValue = true;


                        $(rightGridData).each(function (rightIndex, rightElement) {
                            if(leftElement.clId == rightElement.clId) {
                                checkValue = false;
                                return false;
                            }
                        });


                        if(checkValue) {
                            var data = {};
                            that.$el.find('[data-form-param="roleId"]').prop("disabled", false);
                            that.$el.find('[data-form-param="roleNm"]').prop("disabled", false);
                            data.clId = leftElement.clId;
                            data.clNm = leftElement.clNm;
                            that.CAPCM196GrpAcsAthrtyRightGrid.addData(data);
                        }else{
                            that.$el.find('[data-form-param="roleId"]').prop("disabled", true);
                            that.$el.find('[data-form-param="roleNm"]').prop("disabled", true);
                        }
                    });
                }
            },


            deleteGridData: function () {
                var that = this;
                var selectedRows = that.CAPCM196GrpAcsAthrtyRightGrid.getSelectedRecords();


                if (selectedRows.length > 0) {
                    this.CAPCM196GrpAcsAthrtyRightGrid.removeRow(selectedRows);
                }
            },


            toggleSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find('#search-condition-area'), this.$el.find('#btn-search-condition-toggle'));
            },


            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find('#btn-search-result-toggle'));
            },


            toggleGroupAccessAuthority: function () {
                fn_pageLayerCtrl(this.$el.find('#group-access-authority-area'), this.$el.find('#btn-group-access-authority-toggle'));
            }
        }); // end of Backbone.View.extend({


        return CAPCM196View;
    } // end of define function
)
; // end of define
