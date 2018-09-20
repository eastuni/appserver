define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/ext-grid/_ext-tree-grid',
        'common/component/loading-bar/_loading-bar',
        'views/scheduler/system-group-management/system-setting-popup',
        'views/scheduler/system-group-management/node-setting-popup',
        'views/scheduler/system-group-management/schedule-group-setting-popup',
        'text!views/scheduler/system-group-management/_system-group-management-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        ExtTreeGrid,
        LoadingBar,
        SystemSettingPopup,
        NodeSettingPopup,
        ScheduleGroupSettingPopup,
        tpl
    ) {
        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click #first-tab .left-btn': 'addNodeListToSystem',
                'click #first-tab .right-btn': 'removeNodeListFromSystem',
                'click #first-tab .refresh-btn': 'loadSystemListTree',

                'click #first-tab .system-add-btn': 'addSystem',
                'click #first-tab .system-edit-btn': 'editSystem',
                'click #first-tab .system-del-btn': 'delSystem',
                'click #first-tab .node-add-btn': 'addNode',
                'click #first-tab .node-edit-btn': 'editNode',
                'click #first-tab .node-del-btn': 'delNode',


                'click #last-tab .tree-search-wrap .reset-search-btn': 'resetSystemTreeSearch',
                'click #last-tab .tree-search-wrap .search-btn': 'loadSystemTree',
                'enter-component #last-tab .tree-search-wrap input': 'loadSystemTree',

                'click #last-tab .col2 .reset-search-btn': 'resetScheduleGroupSearch',
                'click #last-tab .col2 .search-btn': 'loadScheduleGroupList',
                'enter-component #last-tab .col2 .bxm-search-wrap input': 'loadScheduleGroupList',
                'click #last-tab .col2 .add-btn': 'showAddScheduleGroupPopup',
                'click #last-tab .col2 .edit-btn': 'showEditScheduleGroupPopup',
                'click #last-tab .col2 .grid-del-btn': 'delScheduleGroup'

            },

            sysId: '',
            nodeNm: null,
            systemTreeSysId: null,

            treeRendering: false,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl()).css('height', '100%');

                // Set SubViews
                that.subViews['scheduleGroupDetailLoadingBar'] = new LoadingBar();
                that.subViews['systemDetailLoadingBar'] = new LoadingBar();
                that.subViews['nodeDetailLoadingBar'] = new LoadingBar();

                that.subViews['systemSettingPopup'] = new SystemSettingPopup();
                that.subViews['systemSettingPopup'].on('edit-item', function() {
                    // 사용자 수정시, 리스트, 상세 리프래시
                    that.systemListTreeGrid.reloadData(function() {
                        that.loadSystemDetail({sysId: that.sysId});
                    });
                });
                that.subViews['systemSettingPopup'].on('add-item', function() {
                    // 사용자 생성시, 리스트 리프래시
                    that.systemListTreeGrid.reloadData();
                });

                that.subViews['nodeSettingPopup'] = new NodeSettingPopup();
                that.subViews['nodeSettingPopup'].on('edit-item', function() {
                    // 사용자 수정시, 리스트, 상세 리프래시
                    that.nodeListGrid.reloadData(function() {
                        that.loadNodeDetail({nodeNm: that.nodeNm});
                    });
                });
                that.subViews['nodeSettingPopup'].on('add-item', function() {
                    // 사용자 생성시, 리스트 리프래시
                    that.nodeListGrid.reloadData();
                });


                that.subViews['scheduleGroupSettingPopup'] = new ScheduleGroupSettingPopup();
                that.subViews['scheduleGroupSettingPopup'].on('edit-item', function(scheduleGrpId) {
                    // 사용자 수정시, 리스트, 상세 리프래시
                    that.scheduleGroupGrid.reloadData(function() {
                        that.loadScheduleGroupDetail({scheduleGrpId: scheduleGrpId});
                    });
                });
                that.subViews['scheduleGroupSettingPopup'].on('add-item', function() {
                    // 사용자 생성시, 리스트 리프래시
                    that.scheduleGroupGrid.reloadData();
                });


                // Set Grid
                // first tab
                that.systemListTreeGrid = new ExtTreeGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('SystemNodeService', 'getSystemList', 'EmptyOMM'),
                        key: 'EmptyOMM'
                    },
                    responseParam: {
                        objKey: 'SystemListOMM',
                        key: 'systemList'
                    },
                    pageCountDefaultVal: 15,

                    fields: ['sysId', 'sysNm'],
                    columns: [
                        {
                            xtype: 'treecolumn',
                            text: bxMsg('scheduler.system-id'), flex: 5, dataIndex: 'sysId', style: 'text-align: center;'},
                        {text: bxMsg('scheduler.system-nm'), flex: 4, dataIndex: 'sysNm', align: 'center'},
                        {
                            text:bxMsg('common.del'),
                            renderer: function (value, metaData, record){
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn system-del-btn" data-id="{0}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('sysId')
                                );
                            },
                            sortable: false,
                            align: 'center',
                            width: 50
                        }
                    ],
                    listeners: {
                        beforecellmousedown: function(_this, td, cellIndex) {
                            this.gridSelect = (cellIndex !== 2);
                        },
                        beforeselect: function() {
                            return this.gridSelect;
                        },
                        select: function(_this, record) {
                            that.sysId = record.get('sysId');
                            that.loadSystemDetail({sysId: that.sysId});
                        }
                    },
                    gridConfig: {
                        animate: false
                    }
                });

                that.systemNodeListGrid = new ExtGrid({
                    pageCountDefaultVal: 20,

                    fields: ['nodeNm'],
                    columns: [
                        {
                            text: '',
                            renderer: function (value, p, record) {
                                return Ext.String.format(
                                    '<input type="checkbox" class="bw-input ipt-radio" data-form-param="nodeNm" data-value="{0}" />',
                                    record.get('nodeNm')
                                );
                            },
                            sortable: false,
                            authDisabled: true,
                            align: 'center',
                            flex: 1
                        },
                        {text: bxMsg('scheduler.node-nm'), flex: 5, dataIndex: 'nodeNm', align: 'center'}
                    ],
                    listeners: {
                        itemclick: function(_this, record) {
                            that.nodeNm = record.get('nodeNm');
                            that.loadNodeDetail({nodeNm: that.nodeNm});
                        }
                    }
                });

                that.nodeListGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('SystemNodeService', 'getNodeList', 'NodeListInOMM'),
                        key: 'NodeListInOMM'
                    },
                    responseParam: {
                        objKey: 'NodeListOMM',
                        key: 'nodeList'
                    },
                    pageCountDefaultVal: 12,
                    paging: true,

                    fields: ['nodeNm', 'maxExecCnt', 'sysId'],
                    columns: [
                        {
                            text: '',
                            renderer: function (value, p, record) {
                                return Ext.String.format(
                                    '<input type="checkbox" class="bw-input ipt-radio" data-form-param="nodeNm" data-value="{0}" />',
                                    record.get('nodeNm')
                                );
                            },
                            sortable: false,
                            authDisabled: true,
                            align: 'center',
                            flex: 1
                        },
                        {text: bxMsg('scheduler.node-nm'), flex: 2, dataIndex: 'nodeNm', align: 'center'},
                        {text: bxMsg('scheduler.max-execution-count'), flex: 2, dataIndex: 'maxExecCnt', align: 'center'},
//                        {text: bxMsg('scheduler.registration-system'), flex: 2, dataIndex: 'sysId', align: 'center'},
                        {
                            text:bxMsg('common.del'),
                            renderer: function (value, metaData, record){
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn node-del-btn" data-id="{0}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('nodeNm')
                                );
                            },
                            sortable: false,
                            align: 'center',
                            width: 50
                        }
                    ],
                    listeners: {
                        beforecellmousedown: function(_this, td, cellIndex) {
                            this.gridSelect = (cellIndex !== 3);
                        },
                        beforeitemclick: function() {
                            return this.gridSelect;
                        },
                        itemclick: function(_this, record) {
                            that.nodeNm = record.get('nodeNm');
                            that.loadNodeDetail({nodeNm: that.nodeNm});
                        }
                    }
                });


                // last tab
                that.systemTreeGrid = new ExtTreeGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ScheduleGroupService', 'getSystemTreeView', 'SystemTreeInOMM'),
                        key: 'SystemTreeInOMM'
                    },
                    responseParam: {
                        objKey: 'SystemTreeListOMM',
                        key: 'systemTree'
                    },
                    fields: ['sysId', 'existChildren'],
                    columns: [
                        {
                            xtype: 'treecolumn', text: '', flex: 1, dataIndex: 'sysId',
                            renderer: function (value, metaData, record) {
                                if (record.get('existChildren')) {
                                    metaData.tdCls += ' has-children';
                                }
                                return value;
                            }
                        }
                    ],
                    listeners: {
                        select: function(_this, record) {
                            that.onClickSysId(record.get('sysId'));
                        },

                        beforeitemdblclick: function () {
                            return false;
                        },
                        itemexpand: function () {
                            setTimeout(function () {
                                that.treeRendering = false;
                            }, 500)
                        },
                        itemcollapse: function () {
                            setTimeout(function () {
                                that.treeRendering = false;
                            }, 500)
                        },
                        itemclick: function (_this, record) {
                            if (that.treeRendering || !record.get('existChildren')) return;
                            that.treeRendering = true;

                            if (record.isExpanded()) {
                                record.collapse();
                            } else {
                                // children이 있는 데 한번도 expand 한 적이 없을 때
                                if (record.isLeaf()) {
                                    that.loadSystemTreeChildren({
                                        sysId: record.get('sysId')
                                    }, function (data) {
                                        record.appendChild(data);
                                        record.data.leaf = false;
                                        record.commit();
                                        record.expand();
                                        that.renderDummyExpander(that.$systemTreeGridWrap);
                                    });
                                    return;
                                } else {
                                    record.expand();
                                }
                            }

                            that.renderDummyExpander(that.$systemTreeGridWrap);
                        },
                        afteritemexpand: function () {
                            that.renderDummyExpander(that.$systemTreeGridWrap);
                        }
                    },
                    customHeight: '100%',
                    gridConfig: {
                        animate: false
                    }
                });

                that.scheduleGroupGrid = new ExtTreeGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ScheduleGroupService', 'getScheduleGroupList', 'ScheduleGroupInOMM'),
                        key: 'ScheduleGroupInOMM'
                    },
                    responseParam: {
                        objKey: 'ScheduleGroupListOMM',
                        key: 'treeList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn add-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>'
                            }
                        ]
                    },
                    paging: true,

                    fields: ['scheduleGrpId', 'scheduleGrpNm', 'existChildren'],
                    columns: [
                        {
                            xtype: 'treecolumn',
                            text: bxMsg('scheduler.schedule-group-id'), flex: 5, dataIndex: 'scheduleGrpId', style: 'text-align: center;',
                            renderer: function (value, metaData, record) {
                                if (record.get('existChildren')) {
                                    metaData.tdCls += ' has-children';
                                }
                                return value;
                            }
                        },
                        {text: bxMsg('scheduler.schedule-group-nm'), flex: 4, dataIndex: 'scheduleGrpNm', align: 'center'},
                        {
                            text:bxMsg('common.del'),
                            renderer: function (value, metaData, record){
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn grid-del-btn" data-id="{0}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('scheduleGrpId')
                                );
                            },
                            sortable: false,
                            align: 'center',
                            width: 50
                        }
                    ],
                    listeners: {
                        beforecellmousedown: function(_this, td, cellIndex) {
                            this.gridSelect = (cellIndex !== 2);
                        },
                        beforeselect: function() {
                            return this.gridSelect;
                        },
                        select: function(_this, record) {
                            that.scheduleGrpId = record.get('scheduleGrpId');
                            that.loadScheduleGroupDetail({scheduleGrpId: that.scheduleGrpId});
                        },

                        beforeitemdblclick: function () {
                            return false;
                        },
                        itemexpand: function () {
                            setTimeout(function () {
                                that.treeRendering = false;
                            }, 500)
                        },
                        itemcollapse: function () {
                            setTimeout(function () {
                                that.treeRendering = false;
                            }, 500)
                        },
                        itemclick: function (_this, record) {
                            if (that.treeRendering || !record.get('existChildren')) return;
                            that.treeRendering = true;

                            if (record.isExpanded()) {
                                record.collapse();
                            } else {
                                // children이 있는 데 한번도 expand 한 적이 없을 때
                                if (record.isLeaf()) {
                                    that.loadScheduleGroupListChildren({
                                        scheduleGrpId: record.get('scheduleGrpId'),
                                        scheduleGrpNm: record.get('scheduleGrpNm')
                                    }, function (data) {
                                        record.appendChild(data);
                                        record.data.leaf = false;
                                        record.commit();
                                        record.expand();
                                        that.renderDummyExpander(that.$scheduleGroupGridWrap);
                                    });
                                    return;
                                } else {
                                    record.expand();
                                }
                            }

                            that.renderDummyExpander(that.$scheduleGroupGridWrap);
                        },
                        afteritemexpand: function () {
                            that.renderDummyExpander(that.$scheduleGroupGridWrap);
                        }
                    },
                    gridConfig: {
                        animate: false
                    }
                });

                // Dom Element Cache
                that.$systemNodeManagementTab = that.$el.find('#first-tab');
                that.$systemListTreeGridWrap = that.$systemNodeManagementTab.find('.system-list-tree-grid-wrap');
                that.$systemDetailTitleWrap = that.$systemNodeManagementTab.find('.system-detail-title');
                that.$systemDetailWrap = that.$systemNodeManagementTab.find('.system-detail-wrap');
                that.$systemNodeListGridWrap = that.$systemNodeManagementTab.find('.system-node-list-grid-wrap');
                that.$nodeListGridWrap = that.$systemNodeManagementTab.find('.node-list-grid-wrap');
                that.$nodeDetailTitleWrap = that.$systemNodeManagementTab.find('.node-detail-title');
                that.$nodeDetailWrap = that.$systemNodeManagementTab.find('.node-detail-wrap');

                that.$scheduleGroupTab = that.$el.find('#last-tab');
                that.$systemSearchWrap = that.$scheduleGroupTab.find('.tree-search-wrap');
                that.$systemTreeGridWrap = that.$scheduleGroupTab.find('.system-grid-wrap');
                that.$scheduleGroupListTitleWrap = that.$scheduleGroupTab.find('.schedule-group-list-title');
                that.$scheduleGroupSearchWrap = that.$scheduleGroupTab.find('.bxm-search-wrap');
                that.$scheduleGroupGridWrap = that.$scheduleGroupTab.find('.bxm-grid-wrap');
                that.$scheduleGroupDetailTitleWrap = that.$scheduleGroupTab.find('.bxm-detail-title');
                that.$scheduleGroupDetailWrap = that.$scheduleGroupTab.find('.bxm-detail-wrap');

                // tab menu 전환 기능
                that.$el.find(".tab-title li").click(function () {
                    that.$el.find(".tab-title li").removeClass("on-tab");
                    $(this).addClass("on-tab");
                    that.$el.find(".tabs").hide();
                    that.activeTab = $(this).attr("rel");
                    that.$el.find("#system-group-management-" + that.activeTab).show();
                });
            },

            render: function() {
                var that = this;

                // first tab
                that.$systemListTreeGridWrap.html(that.systemListTreeGrid.render(function () {
                    that.loadSystemListTree();
                }));
                that.$systemNodeListGridWrap.html(that.systemNodeListGrid.render());
                that.$nodeListGridWrap.html(that.nodeListGrid.render(function () {
                    that.nodeListGrid.loadData({sysId: that.sysId}, null, true);
                }));
                that.$systemDetailWrap.append(that.subViews['systemDetailLoadingBar'].render());
                that.$nodeDetailWrap.append(that.subViews['nodeDetailLoadingBar'].render());


                // last tab
                that.$systemTreeGridWrap.html(that.systemTreeGrid.render(function () {
                    that.loadSystemTree();
                }));
                that.$scheduleGroupGridWrap.html(that.scheduleGroupGrid.render());
                that.$scheduleGroupDetailWrap.append(that.subViews['scheduleGroupDetailLoadingBar'].render());

                return that.$el;
            },

            renderDummyExpander: function (dummyExpandTarget) {
                dummyExpandTarget.find('.has-children div').each(function (i, item) {
                    $(item).children('img:eq(-2)').addClass('x-tree-expander');
                });
            },


            // first tab
            loadSystemListTree: function () {
                var that = this;
                that.systemListTreeGrid.loadData({}, null, true);
            },

            loadSystemDetail: function (params) {
                var that = this,
                    requestParam,
                    gridData = [];

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'SystemNodeService', 'getSystemInfo', 'SystemDetailOMM',
                    params
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.systemNodeListGrid.subViews['gridLoadingBar'].show();
                        that.subViews['systemDetailLoadingBar'].show();
                    },
                    success: function(response) {
                        var data = response.SystemDetailOMM;

                        that.$systemDetailTitleWrap.text(bxMsg('scheduler.system-detail') + ' : ' + data.sysId);
                        commonUtil.makeFormFromParam(that.$systemDetailWrap, data);

                        data['systemNodeList'].forEach(function (item) {
                            gridData.push({
                                nodeNm: item
                            })
                        });
                        that.systemNodeListGrid.loadData({}, null, true, gridData);

                        that.nodeListGrid.loadData(params, null, true);
                    },
                    complete: function() {
                        that.systemNodeListGrid.subViews['gridLoadingBar'].hide();
                        that.subViews['systemDetailLoadingBar'].hide();
                    }
                });
            },

            loadNodeDetail: function (params) {
                var that = this,
                    requestParam;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'SystemNodeService', 'getNodeInfo', 'NodeListInOMM',
                    params
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['nodeDetailLoadingBar'].show();
                    },
                    success: function(response) {
                        var data = response.NodeOMM;

                        that.$nodeDetailTitleWrap.text(bxMsg('scheduler.node-detail') + ' : ' + data.nodeNm);
                        commonUtil.makeFormFromParam(that.$nodeDetailWrap, data);
                    },
                    complete: function() {
                        that.subViews['nodeDetailLoadingBar'].hide();
                    }
                });
            },

            addNodeListToSystem: function () {
                var that = this,
                    params = [];

                that.$nodeListGridWrap.find('[data-form-param="nodeNm"]:checked').each(function (i, item) {
                    params.push({
                        sysId: that.sysId,
                        nodeNm: $(item).attr('data-value')
                    })
                });

                if (!params.length) return;
                that.updateNodeLists(params, 'addSystemNode');
            },

            removeNodeListFromSystem: function () {
                var that = this,
                    params = [];

                that.$systemNodeListGridWrap.find('[data-form-param="nodeNm"]:checked').each(function (i, item) {
                    params.push({
                        sysId: that.sysId,
                        nodeNm: $(item).attr('data-value')
                    })
                });

                if (!params.length) return;
                that.updateNodeLists(params, 'removeSystemNode');
            },

            updateNodeLists: function (params, operation) {
                var that = this,
                    requestParam;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'SystemNodeService', operation, 'NodeListOMM',
                    {nodeList: params}
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                            // 그리드 리로드
                            that.loadSystemDetail({sysId: that.sysId});
                        }else if(code === 205) {
                            swal({type: 'error', title: '', text: bxMsg('common.save-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    }
                });
            },

            addSystem: function () {
                this.subViews['systemSettingPopup'].render();
            },

            editSystem: function () {
                var renderData = commonUtil.makeParamFromForm(this.$systemDetailWrap);

                if(!renderData.sysId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['systemSettingPopup'].render(renderData);
            },

            delSystem: function (e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        // 요청 객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'SystemNodeService', 'removeSystem', 'SystemDetailOMM',
                            {
                                sysId: $target.attr('data-id')
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 200){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                    // 그리드 리로드
                                    that.systemListTreeGrid.reloadData();

                                    // 상세 초기화
                                    that.$systemDetailTitleWrap.text('');
                                    that.$systemDetailWrap.find('[data-form-param]').val('');
                                }else if(code === 205) {
                                    swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    }
                );
            },

            addNode: function () {
                // if (!this.sysId) {
                //     swal({type: 'warning', title: '', text: bxMsg('common.system-not-selected-error'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                //     return;
                // }

                this.subViews['nodeSettingPopup'].render();
            },

            editNode: function () {
                var renderData = commonUtil.makeParamFromForm(this.$nodeDetailWrap);

                if(!renderData.nodeNm) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['nodeSettingPopup'].render(renderData);
            },

            delNode: function (e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        // 요청 객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'SystemNodeService', 'removeNode', 'NodeOMM',
                            {
                                nodeNm: $target.attr('data-id')
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 200){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                    // 그리드 리로드
                                    that.nodeListGrid.reloadData();

                                    // 상세 초기화
                                    that.$nodeDetailTitleWrap.text('');
                                    that.$nodeDetailWrap.find('[data-form-param]').val('');
                                }else if(code === 205) {
                                    swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    }
                );
            },


            // last tab
            resetSystemTreeSearch: function() {
                this.$systemSearchWrap.find('[data-form-param]').val('');
            },

            loadSystemTree: function () {
                var that = this,
                    params = commonUtil.makeParamFromForm(this.$systemSearchWrap);
                that.systemTreeGrid.loadData(params, function () {
                    that.renderDummyExpander(that.$systemTreeGridWrap);
                    if (params.sysId) {
                        that.systemTreeGrid.expandAllTreeNode();
                    }
                }, true);
            },

            loadSystemTreeChildren: function (params, callback) {
                var that = this;

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'ScheduleGroupService', 'showSystemChildren', 'SystemTreeInOMM',
                    params
                ), {
                    beforeSend: function() {
                        that.systemTreeGrid.subViews['gridLoadingBar'].show();
                    },
                    success: function(response) {
                        callback && callback(response.SystemTreeOMM.children);
                    },
                    complete: function() {
                        that.systemTreeGrid.subViews['gridLoadingBar'].hide();
                    }
                });
            },

            onClickSysId: function (sysId) {
                var that = this;

                that.loadScheduleGroupList(sysId);
            },

            resetScheduleGroupSearch: function () {
                this.$scheduleGroupSearchWrap.find('[data-form-param]').val('');
            },

            loadScheduleGroupList: function (sysId) {
                var that = this,
                    params = commonUtil.makeParamFromForm(this.$scheduleGroupSearchWrap);

                if (sysId && typeof sysId === 'string') {
                    this.systemTreeSysId = params.sysId = sysId;
                } else if (this.systemTreeSysId) {
                    params.sysId = this.systemTreeSysId;
                } else {
                    swal({type: 'warning', title: '', text: bxMsg('common.system-not-selected-error'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.scheduleGroupGrid.loadData(params, function () {
                    that.renderDummyExpander(that.$scheduleGroupGridWrap);
                    that.$scheduleGroupListTitleWrap.text(params.sysId);
                    if (params.scheduleGrpId || params.scheduleGrpNm) {
                        that.scheduleGroupGrid.expandAllTreeNode();
                    }
                }, true);
            },

            loadScheduleGroupListChildren: function (params, callback) {
                var that = this;
                params.sysId = this.systemTreeSysId;

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'ScheduleGroupService', 'showGroupChildren', 'ScheduleGroupInOMM',
                    params
                ), {
                    beforeSend: function() {
                        that.scheduleGroupGrid.subViews['gridLoadingBar'].show();
                    },
                    success: function(response) {
                        callback && callback(response.ScheduleGroupTreeOMM.children);
                    },
                    complete: function() {
                        that.scheduleGroupGrid.subViews['gridLoadingBar'].hide();
                    }
                });
            },

            loadScheduleGroupDetail: function (params) {
                var that = this,
                    requestParam;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'ScheduleGroupService', 'getScheduleGroupInfo', 'ScheduleGroupOMM',
                    params
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['scheduleGroupDetailLoadingBar'].show();
                    },
                    success: function(response) {
                        var data = response.ScheduleGroupOMM;

                        that.$scheduleGroupDetailTitleWrap.text(': ' + data.scheduleGrpId);
                        commonUtil.makeFormFromParam(that.$scheduleGroupDetailWrap, data);
                    },
                    complete: function() {
                        that.subViews['scheduleGroupDetailLoadingBar'].hide();
                    }
                });
            },

            showAddScheduleGroupPopup: function () {
                if (!this.systemTreeSysId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.system-not-selected-error'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['scheduleGroupSettingPopup'].render({sysId: this.systemTreeSysId});
            },

            showEditScheduleGroupPopup: function() {
                var renderData = commonUtil.makeParamFromForm(this.$scheduleGroupDetailWrap);
                renderData.sysId = this.systemTreeSysId;

                if(!renderData.scheduleGrpId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['scheduleGroupSettingPopup'].render(renderData);
            },

            delScheduleGroup: function (e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        // 요청 객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'ScheduleGroupService', 'removeScheduleGroup', 'ScheduleGroupOMM',
                            {
                                scheduleGrpId: $target.attr('data-id')
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 200){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                    // 그리드 리로드
                                    that.scheduleGroupGrid.reloadData();

                                    // 상세 초기화
                                    that.$scheduleGroupDetailTitleWrap.text('');
                                    that.$scheduleGroupDetailWrap.find('[data-form-param]').val('');
                                }else if(code === 205) {
                                    swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    }
                );
            }
        });
    }
);
