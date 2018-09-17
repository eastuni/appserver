define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'text!views/setting/studio-datasource-config/_studio-datasource-config-tpl.html'
    ],
    function(
        commonUtil,
        ExtGrid,
        LoadingBar,
        tpl
    ) {
        return Backbone.View.extend({
            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .add-btn': 'addItem',
                'click .save-btn': 'saveItem',
                'click .del-btn': 'deleteItem'
            },

            DEFAULT_DATASOURCE_LIST: [],
            connectionName: null,
            currentDetails: null,
            mode: 'edit',
            addingIndex: null,
            $addingConnection: null,
            mappingDataCell: null,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set Grids
                that.connectionListGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('StudioDataSourceService', 'getConnectionList', 'EmptyOMM'),
                        key: 'EmptyOMM'
                    },
                    responseParam: {
                        objKey: 'ConnectionListOMM',
                        key: 'connectionList'
                    },
                    pageCountDefaultVal: 15,

                    fields: ['connectionName', 'roleNm', 'roleDesc', 'useYn'],
                    columns: [
                        {
                            text: bxMsg('setting.connection-name'), flex: 1, dataIndex: 'connectionName', align: 'center',
                            editor: {
                                listeners: {
                                    blur: function (_this) {
                                        var value = _this.value;
                                        if (value) {
                                            that.connectionName = value;
                                        }
                                    }
                                }
                            }
                        },
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record) {
                                if (record.get('connectionName') === 'Default') {
                                    return '';
                                } else {
                                    return Ext.String.format(
                                        '<button type="button" class="bw-btn del-btn" data-name="{0}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                        record.get('connectionName')
                                    );
                                }
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            width: 50
                        }
                    ],
                    listeners: {
                        beforecellmousedown: function(_this, td, cellIndex) {
                            this.gridSelect = (cellIndex !== 1);
                        },
                        beforeselect: function() {
                            return this.gridSelect;
                        },
                        select: function (_this, record, index) {
                            if (that.mode === 'edit') {
                                that.connectionName = record.get('connectionName');
                                that.loadConnectionDatasourceDetails({
                                    connectionName: that.connectionName
                                });

                            // add mode에서 다른 커넥션을 누를 때
                            } else if (index !== that.addingIndex) {
                                swal({
                                        title: '', text: bxMsg('setting.cancel-adding-warning'), showCancelButton: true
                                    },
                                    function () {
                                        that.connectionListGrid.store.removeAt(that.addingIndex);
                                        that.setEditMode();

                                        that.connectionName = record.get('connectionName');
                                        that.loadConnectionDatasourceDetails({
                                            connectionName: that.connectionName
                                        });
                                    },
                                    function () {
                                        that.$addingConnection.trigger('click');
                                    });
                            }
                        },
                        cellclick: function (_this, td, cellIndex, record, tr, rowIndex) {
                            if (that.mode === 'edit' || rowIndex !== that.addingIndex) {
                                return false;
                            }
                        }
                    },
                    gridConfig: {
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                clicksToEdit: 1
                            })
                        ]
                    }
                });

                that.connectionDatasourceGrid = new ExtGrid({
                    pageCountDefaultVal: 13,

                    fields: ['namespace', 'property', 'value', 'description'],
                    columns: [
                        {text: bxMsg('setting.type'), flex: 2, dataIndex: 'property', align: 'center'},
                        {
                            text: bxMsg('setting.value'), flex: 3, dataIndex: 'value', align: 'center', editor: {},
                            renderer: function (value, p, record) {
                                if (record.get('property') === 'encPassword') {
                                    value = '<input class="div-to-password" type="password" value="' + value + '"/>';
                                }
                                return value;
                            }
                        },
                        {text: bxMsg('setting.description'), flex: 3, dataIndex: 'description', align: 'center', editor: {}}
                    ],
                    listeners: {
                        cellclick: function(_this, td, cellIndex, record) {
                            if (record.get('property') !== 'encPassword') {
                                that.mappingDataCell.setEditor({
                                    inputType: 'text'
                                });
                            } else {
                                that.mappingDataCell.setEditor({
                                    inputType: 'password'
                                });
                            }
                        }
                    },
                    gridConfig: {
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                clicksToEdit: 1
                            })
                        ]
                    }
                });

                // Dom Element Cache
                that.$connectionListGrid = that.$el.find('.connection-list-grid-wrap');

                that.$connectionDatasourceDetailWrap = that.$el.find('.connection-datasource-detail-wrap');
                that.$connectionDatasourceTitle = that.$connectionDatasourceDetailWrap.find('.connection-datasource-title');
                that.$connectionDatasourceSearchWrap = that.$connectionDatasourceDetailWrap.find('.bxm-search-wrap');
                that.$connectionDatasourceGrid = that.$connectionDatasourceDetailWrap.find('.connection-datasource-grid-wrap');

                // get DEFAULT_DATASOURCE_LIST
                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'StudioDataSourceService', 'getDataSourceList', 'StudioDataSourceInOMM',
                    {
                        connectionName: 'Default'
                    }
                ), {
                    success: function(response) {
                        var data = response['StudioDataSourceDetailOMM']['dataSourceList'];
                        that.DEFAULT_DATASOURCE_LIST = [];

                        data.forEach(function (item) {
                            item.value = '';
                            that.DEFAULT_DATASOURCE_LIST.push(item);
                        });
                    }
                });
            },

            render: function() {
                var that = this;

                that.$connectionListGrid.html(that.connectionListGrid.render(function () {
                    that.loadConnectionList();
                }));
                that.$connectionDatasourceGrid.html(that.connectionDatasourceGrid.render(function () {
                    that.mappingDataCell = that.connectionDatasourceGrid.getView().getHeaderCt().gridDataColumns[1];
                }));
                that.$connectionDatasourceDetailWrap.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            loadConnectionList: function() {
            	var that= this;
            	
                this.connectionListGrid.loadData(null, function(data) {
                	data = data['connectionList'];
                	if(data && data.length) {
                		that.$connectionListGrid.find('tbody tr:first-child').click();
                	}
                }, true);
            },

            loadConnectionDatasourceDetails: function (params) {
                var that = this;

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'StudioDataSourceService', 'getDataSourceList', 'StudioDataSourceInOMM',
                    params
                ), {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var data = response['StudioDataSourceDetailOMM'];
                        that.currentDetails = data;

                        commonUtil.makeFormFromParam(that.$connectionDatasourceSearchWrap, data);
                        that.connectionDatasourceGrid.loadData(params, null, true, data, 'dataSourceList');

                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },

            saveItem: function() {
                var that = this,
                    operation = that.mode === 'edit' ? 'editDataSourceInfo' : 'addDataSourceInfo',
                    $askFormItems,
                    formParam,
                    requestParam,
                    dataSourceList,
                    qualified = true;

                formParam = commonUtil.makeParamFromForm(that.$connectionDatasourceSearchWrap);

                // required values validation
                if (!that.connectionName) {
                    swal({type: 'warning', title: '', text: bxMsg('setting.connection-name') + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }
                $askFormItems = that.$connectionDatasourceSearchWrap.find('.asterisk');

                for(var i = 0 ; i < $askFormItems.length; i++){
                    var $askFormItem = $($askFormItems[i]),
                        key = $askFormItem.find('[data-form-param]').attr('data-form-param'),
                        msg = $askFormItem.find('.bw-label').text();

                    if(!formParam[key]) {
                        swal({type: 'warning', title: '', text: msg + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }
                }

                if (that.mode === 'edit') {
                    dataSourceList = [];
                    var oldList = commonUtil.convertArrayToObject(that.currentDetails.dataSourceList, 'property');

                    that.connectionDatasourceGrid.getModifiedData().forEach(function (item) {
                        if (!item.value) {
                            swal({type: 'warning', title: '', text: item.property + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            qualified = false;
                        }

                        item.oldValue = oldList[item.property].value;
                        dataSourceList.push(item);
                    });
                } else {
                    dataSourceList = that.connectionDatasourceGrid.getAllData();

                    dataSourceList.forEach(function (item) {
                        if (!item.value) {
                            swal({type: 'warning', title: '', text: item.property + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            qualified = false;
                        }
                    });
                }

                if (!qualified) return;


                requestParam = {
                    "connectionName": that.connectionName,
                    "dataSourceName": formParam.dataSourceName,
                    "useYn": formParam.useYn,
                    "dataSourceList": dataSourceList
                };

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'StudioDataSourceService', operation, 'StudioDataSourceDetailOMM',
                    requestParam
                ), {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var code = response['ResponseCode'].code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                            that.setEditMode();
                        }else if(code === 201){
                            swal({type: 'error', title: '', text: bxMsg('common.save-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }else if(code === 202){
                            swal({type: 'error', title: '', text: bxMsg('common.same-val-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }else if(code === 204){
                            swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },

            deleteItem: function(e) {
                var that = this,
                    connectionName = $(e.currentTarget).attr('data-name'),
                    requestParam;

                if (connectionName === 'Default') {
                    swal({type: 'warning', title: '', text: bxMsg('setting.default-delete-unable'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function () {
                        requestParam = commonUtil.getBxmReqData(
                            'StudioDataSourceService', 'removeDataSourceInfo', 'StudioDataSourceDetailOMM',
                            {
                                connectionName: connectionName
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function (response) {
                                var code = response.ResponseCode.code;

                                if(code === 200){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                    // 그리드 리로드
                                    that.connectionListGrid.reloadData();

                                    // 상세 초기화
                                    that.$connectionDatasourceSearchWrap.find('input[data-form-param="dataSourceName"]').val('');
                                    that.$connectionDatasourceSearchWrap.find('input[data-form-param="useYn"]').val('Y');
                                    that.connectionDatasourceGrid.resetData();
                                } else if(code === 201) {
                                    swal({type: 'error', title: '', text: bxMsg('common.del-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    }
                );
            },

            addItem: function () {
                if (this.mode === 'add') return;

                this.mode = 'add';
                this.$connectionDatasourceTitle.text(bxMsg('setting.connection-datasource-add'));
                commonUtil.makeFormFromParam(this.$connectionDatasourceSearchWrap, {
                    dataSourceName: '',
                    useYn: 'Y'
                });
                this.connectionDatasourceGrid.loadData({
                    connectionName: this.connectionName
                }, null, true, this.DEFAULT_DATASOURCE_LIST);
                this.connectionName = null;
                this.currentDetails = null;

                this.connectionListGrid.addData({
                    connectionName: ""
                });

                this.addingIndex = this.connectionListGrid.store.getCount()-1;
                this.$addingConnection = $(this.connectionListGrid.getView().getCellByPosition({row: this.addingIndex, column: 0}).dom);
                this.$addingConnection.trigger('click');
            },

            setEditMode: function () {
                this.mode = 'edit';
                this.addingIndex = null;
                this.$addingConnection = null;
                this.$connectionDatasourceTitle.text(bxMsg('setting.connection-datasource-details'));
            }
        });
    }
);