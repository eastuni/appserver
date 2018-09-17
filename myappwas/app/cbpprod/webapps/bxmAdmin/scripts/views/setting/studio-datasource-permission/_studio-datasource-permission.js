define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'text!views/setting/studio-datasource-permission/_studio-datasource-permission-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        tpl
    ) {
        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .connection-usage-status-tool-wrap .reset-search-btn': 'resetConnectionUsageStatusSearch',
                'click .connection-usage-status-tool-wrap .search-btn': 'loadConnectionUsageStatusList',
                'enter-component .connection-usage-status-search-wrap input': 'loadConnectionUsageStatusList',

                'click .registered-users-wrap .reset-search-btn': 'resetRegisteredUsersSearch',
                'click .registered-users-wrap .search-btn': 'registeredUsersList',
                'enter-component .registered-users-wrap input': 'registeredUsersList',

                'click .unregistered-users-wrap .reset-search-btn': 'resetUnregisteredUsersSearch',
                'click .unregistered-users-wrap .search-btn': 'unregisteredUsersList',
                'enter-component .unregistered-users-wrap input': 'unregisteredUsersList',

                'click .left-btn': 'addUserToConnectionList',
                'click .right-btn': 'removeUserFromConnectionList'
            },

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set Grid
                that.connectionUsageStatusGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('StudioDataSourceAuthService', 'getUserNConnectionList', 'StudioDataSourceAuthInOMM'),
                        key: 'StudioDataSourceAuthInOMM'
                    },
                    responseParam: {
                        objKey: 'StudioDataSourceAuthListOMM',
                        key: 'dataAuthList'
                    },
                    header: {
                        pageCount: true
                    },
                    pageCountDefaultVal: 5,
                    paging: true,

                    fields: ['userId', 'userNm', 'accessUseDatabase', 'dataSourceName'],
                    columns: [
                        {text: bxMsg('setting.user-id'), flex: 1, dataIndex: 'userId', align: 'center'},
                        {text: bxMsg('setting.user-nm'), flex: 1, dataIndex: 'userNm', align: 'center'},
                        {text: bxMsg('setting.connection-name'), flex: 1, dataIndex: 'accessUseDatabase', align: 'center'},
                        {text: bxMsg('setting.datasource-name'), flex: 1, dataIndex: 'dataSourceName', align: 'center'}
                    ]
                });

                that.connectionListGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('StudioDataSourceAuthService', 'getConnectionAuthList', 'EmptyOMM'),
                        key: 'EmptyOMM'
                    },
                    responseParam: {
                        objKey: 'ConnectionListOMM',
                        key: 'connectionList'
                    },
                    pageCountDefaultVal: 10,

                    fields: ['connectionName'],
                    columns: [
                        {text: bxMsg('setting.connection-name'), flex: 1, dataIndex: 'connectionName', align: 'center'}
                    ],
                    listeners: {
                        select: function (_this, record) {
                            that.connectionName = record.get('connectionName');
                            that.loadConnectionDetail();
                        }
                    }
                });

                that.registeredUsersGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('StudioDataSourceAuthService', 'getConnectionUserList', 'StudioDataSourceUserInOMM'),
                        key: 'StudioDataSourceUserInOMM'
                    },
                    responseParam: {
                        objKey: 'StudioDataSourceUserListOMM',
                        key: 'userList'
                    },
                    pageCountDefaultVal: 5,
                    paging: true,

                    fields: ['userId', 'userNm'],
                    columns: [
                        {
                            text: '',
                            renderer: function (value, p, record) {
                                return Ext.String.format(
                                    '<input type="checkbox" class="bw-input ipt-radio" data-form-param="userId" data-value="{0}" />',
                                    record.get('userId')
                                );
                            },
                            sortable: false,
                            authDisabled: true,
                            align: 'center',
                            flex: 1
                        },
                        {text: bxMsg('setting.user-id'), flex: 2, dataIndex: 'userId', align: 'center'},
                        {text: bxMsg('setting.user-nm'), flex: 2, dataIndex: 'userNm', align: 'center'},
                    ]
                });

                that.unregisteredUsersGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('StudioDataSourceAuthService', 'getNoRegisteredUserLIst', 'StudioDataSourceUserInOMM'),
                        key: 'StudioDataSourceUserInOMM'
                    },
                    responseParam: {
                        objKey: 'StudioDataSourceUserListOMM',
                        key: 'userList'
                    },
                    pageCountDefaultVal: 5,
                    paging: true,

                    fields: ['userId', 'userNm'],
                    columns: [
                        {
                            text: '',
                            renderer: function (value, p, record) {
                                return Ext.String.format(
                                    '<input type="checkbox" class="bw-input ipt-radio" data-form-param="userId" data-value="{0}" />',
                                    record.get('userId')
                                );
                            },
                            sortable: false,
                            authDisabled: true,
                            align: 'center',
                            flex: 1
                        },
                        {text: bxMsg('setting.user-id'), flex: 2, dataIndex: 'userId', align: 'center'},
                        {text: bxMsg('setting.user-nm'), flex: 2, dataIndex: 'userNm', align: 'center'},
                    ]
                });


                // Dom Element Cache
                that.$connectionUsageStatusSearchWrap = that.$el.find('.connection-usage-status-search-wrap');
                that.$connectionUsageStatusGridWrap = that.$el.find('.connection-usage-status-grid-wrap');
                that.$datasourcePermissionManagementTitle = that.$el.find('.datasource-permission-management-title');
                that.$connectionListGridWrap = that.$el.find('.connection-list-grid-wrap');
                that.$registeredUsersWrap = that.$el.find('.registered-users-wrap');
                that.$registeredUsersSearchWrap = that.$registeredUsersWrap.find('.bxm-search-wrap');
                that.$registeredUsersGridWrap = that.$registeredUsersWrap.find('.registered-users-grid-wrap');
                that.$unregisteredUsersWrap = that.$el.find('.unregistered-users-wrap');
                that.$unregisteredUsersSearchWrap = that.$unregisteredUsersWrap.find('.bxm-search-wrap');
                that.$unregisteredUsersGridWrap = that.$unregisteredUsersWrap.find('.unregistered-users-grid-wrap');
                that.$changeSubtitle = that.$el.find('.change-subtitle');
            },

            render: function() {
                var that = this;

                that.$connectionUsageStatusGridWrap.html(that.connectionUsageStatusGrid.render(function () {
                    that.loadConnectionUsageStatusList();
                }));
                that.$connectionListGridWrap.html(that.connectionListGrid.render(function () {
                    that.loadConnectionList();
                }));
                that.$registeredUsersGridWrap.html(that.registeredUsersGrid.render());
                that.$unregisteredUsersGridWrap.html(that.unregisteredUsersGrid.render());

                return that.$el;
            },

            resetConnectionUsageStatusSearch: function () {
                this.$connectionUsageStatusSearchWrap.find('[data-form-param]').val('');
            },

            loadConnectionUsageStatusList: function () {
                this.connectionUsageStatusGrid
                    .loadData(commonUtil.makeParamFromForm(this.$connectionUsageStatusSearchWrap), null, true);
            },

            loadConnectionList: function() {
                this.connectionListGrid.loadData(null, null, true);
            },

            loadConnectionDetail: function () {
                this.registeredUsersList();
                this.unregisteredUsersList();
            },

            resetRegisteredUsersSearch: function () {
                this.$registeredUsersSearchWrap.find('[data-form-param]').val('');
            },

            registeredUsersList: function() {
                if (!this.connectionName) return;

                var formParams = commonUtil.makeParamFromForm(this.$registeredUsersSearchWrap);
                formParams.accessUseDatabase = this.connectionName;

                this.$changeSubtitle.text(bxMsg('setting.connection-user-list').replace('{{accessUseDatabase}}', this.connectionName));
                this.registeredUsersGrid.loadData(formParams, null, true);
            },

            resetUnregisteredUsersSearch: function () {
                this.$unregisteredUsersSearchWrap.find('[data-form-param]').val('');
            },

            unregisteredUsersList: function() {
                if (!this.connectionName) return;

                var formParams = commonUtil.makeParamFromForm(this.$unregisteredUsersSearchWrap);
                formParams.accessUseDatabase = this.connectionName;

                this.unregisteredUsersGrid.loadData(formParams, null, true);
            },

            addUserToConnectionList: function () {
                var that = this,
                    params = [];

                that.$unregisteredUsersGridWrap.find('[data-form-param="userId"]:checked').each(function (i, item) {
                    params.push({
                        userId: $(item).attr('data-value'),
                        accessUseDatabase: that.connectionName
                    })
                });

                if (!params.length) return;
                that.updateConnectionList(params, 'addUserListToConnection');
            },

            removeUserFromConnectionList: function () {
                var that = this,
                    params = [];

                that.$registeredUsersGridWrap.find('[data-form-param="userId"]:checked').each(function (i, item) {
                    params.push({
                        userId: $(item).attr('data-value'),
                        accessUseDatabase: that.connectionName
                    })
                });

                if (!params.length) return;
                that.updateConnectionList(params, 'removeUserListFromConnection');
            },

            updateConnectionList: function (params, operation) {
                var that = this,
                    requestParam;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'StudioDataSourceAuthService', operation, 'StudioDataSourceUserInListOMM',
                    {userList: params}
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                            // 그리드 리로드
                            that.loadConnectionDetail();
                        }else if(code === 205) {
                            swal({type: 'error', title: '', text: bxMsg('common.save-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    }
                });
            }
        });
    }
);
