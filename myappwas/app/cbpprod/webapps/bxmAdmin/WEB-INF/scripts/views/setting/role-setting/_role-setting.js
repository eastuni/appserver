define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/component/ext-grid/_ext-tree-grid',
        'common/component/loading-bar/_loading-bar',
        'views/setting/role-setting/role-setting-popup',
        'views/setting/role-setting/menu-setting-popup',
        'views/setting/role-setting/auth-setting-popup',
        'text!views/setting/role-setting/_role-setting-tpl.html'
    ],
    function(
        commonUtil,
        ExtGrid,
        ExtTreeGrid,
        LoadingBar,
        RoleSettingPopup,
        MenuSettingPopup,
        AuthSettingPopup,
        tpl
    ) {
        return Backbone.View.extend({
            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .del-role-btn': 'deleteRoleSetting',
                'click .edit-role-btn': 'showEditRoleSettingPopup',

                'click .del-menu-btn': 'deleteMenuSetting',
                'click .del-auth-btn': 'deleteAuthSetting'
            },

            roleId: null,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['roleSettingPopup'] = new RoleSettingPopup();
                that.subViews['roleSettingPopup'].on('edit-role', function() {
                    // 역할 수정시, 리스트, 상세 리프래시
                    var selectedIdx = that.roleSettingGrid.getSelectedRowIdx();

                    that.roleSettingGrid.reloadData(function() {
                        if(selectedIdx === -1){
                            that.loadRoleSetting({
                                roleId: that.roleId
                            });
                        }else{
                            that.roleSettingGrid.setSelectedRowIdx(selectedIdx);
                        }
                    });
                });
                that.subViews['roleSettingPopup'].on('add-role', function() {
                    // 역할 생성시, 리스트 리프래시
                    that.roleSettingGrid.reloadData();
                });

                that.subViews['menuSettingPopup'] = new MenuSettingPopup();
                that.subViews['menuSettingPopup'].on('add-menu', function() {
                    // 역할 생성시, 리스트 리프래시
                    that.roleSettingMenuAccessPermissionGrid.loadData({
                        roleId: that.roleId
                    });
                });

                that.subViews['authSettingPopup'] = new AuthSettingPopup();
                that.subViews['authSettingPopup'].on('add-auth', function() {
                    // 역할 생성시, 리스트 리프래시
                    that.roleSettingOperationPermissionGrid.loadData({
                        roleId: that.roleId
                    });
                });

                that.subViews['detailLoadingBar'] = new LoadingBar();
                that.subViews['menuAccessLoadingBar'] = new LoadingBar();
                that.subViews['operationLoadingBar'] = new LoadingBar();

                // Set Role Setting Grid
                that.roleSettingGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('UserRoleService', 'getUserRoleList', 'PageCountOMM'),
                        key: 'PageCountOMM'
                    },
                    responseParam: {
                        objKey: 'UserRoleListOMM',
                        key: 'userRoleList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['roleSettingPopup'].render();
                                }
                            }
                        ]
                    },
                    paging: true,
                    gridToggle: false,
                    pageCountList: [5, 10, 15],

                    fields: ['roleId', 'roleNm', 'roleDesc', 'useYn'],
                    columns: [
                        {text: bxMsg('setting.role-id'), flex: 30, dataIndex: 'roleId', align: 'center'},
                        {text: bxMsg('setting.role-nm'), flex: 30, dataIndex: 'roleNm', align: 'center'},
                        {text: bxMsg('setting.use-yn'), flex: 25, dataIndex: 'useYn', align: 'center'},
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn inner-btn del-role-btn" data-id="{0}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('roleId')
                                );
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            flex: 15
                        }
                    ],
                    listeners: {
                        select : function(_this, record) {
                            that.loadRoleSetting({
                                roleId: record.get('roleId')
                            });
                        }
                    }
                });

                // Set Menu Access Permission Grid
                that.roleSettingMenuAccessPermissionGrid = new ExtTreeGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('UserRoleService', 'getIncludedMenuList', 'UserRoleRelationOMM'),
                        key: 'UserRoleRelationOMM'
                    },
                    responseParam: {
                        objKey: 'RoleMenuOMM',
                        key: 'menuList'
                    },
                    header: {
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    if(!that.roleId) {
                                        swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                        return;
                                    }

                                    that.subViews['menuSettingPopup'].render({
                                        roleId: that.roleId
                                    });
                                }
                            }
                        ],
                        treeExpand: true
                    },
                    pageCountDefaultVal: 20,
                    gridToggle: false,

                    fields: ['menuId', 'menuNm', 'menuDesc'],
                    columns: [
                        {xtype: 'treecolumn', text: bxMsg('setting.menu-nm'), flex: 2, dataIndex: 'menuNm', style: 'text-align: center', tdCls: 'left-align'},
                        {text: bxMsg('setting.menu-desc'), flex: 1, dataIndex: 'menuDesc', align: 'center'},
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn inner-btn del-menu-btn" data-id="{0}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('menuId')
                                );
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            flex: 1
                        }
                    ]
                });

                // Set Operation Permission Grid
                that.roleSettingOperationPermissionGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('UserRoleService', 'getIncludePermList', 'UserRoleRelationOMM'),
                        key: 'UserRoleRelationOMM'
                    },
                    responseParam: {
                        objKey: 'RolePermissionOMM',
                        key: 'permList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    if(!that.roleId) {
                                        swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                        return;
                                    }

                                    that.subViews['authSettingPopup'].render({
                                        roleId: that.roleId
                                    });
                                }
                            }
                        ]
                    },
                    paging: true,
                    gridToggle: false,
                    pageCountList: [5, 10, 15],

                    fields: ['authId', 'authNm', 'authDesc', 'useYn'],
                    columns: [
                        {text: bxMsg('setting.permission-id'), flex: 2, dataIndex: 'authId', align: 'center'},
                        {text: bxMsg('setting.permission-nm'), flex: 2, dataIndex: 'authNm', align: 'center'},
                        {text: bxMsg('setting.permission-desc'), flex: 3, dataIndex: 'authDesc', align: 'center'},
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn inner-btn del-auth-btn" data-id="{0}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('authId')
                                );
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            flex: 1
                        }
                    ]
                });

                // Dom Element Cache
                that.$roleSettingGrid = that.$el.find('.role-setting-grid');
                that.$roleSettingDetail = that.$el.find('.role-setting-detail');
                that.$roleSettingDetailTitle = that.$el.find('.role-setting-detail-title');
                that.$roleSettingMenuAccessPermissionTitle = that.$el.find('.role-setting-menu-access-permission-title');
                that.$roleSettingMenuAccessPermissionGrid = that.$el.find('.role-setting-menu-access-permission-grid');
                that.$roleSettingOperationPermissionTitle = that.$el.find('.role-setting-operation-permission-title');
                that.$roleSettingOperationPermissionGrid = that.$el.find('.role-setting-operation-permission-grid');
            },

            render: function() {
                var that = this;

                that.$roleSettingGrid.html(that.roleSettingGrid.render(function(){that.loadRoleSettingList();}));
                that.$roleSettingDetail.append(that.subViews['detailLoadingBar'].render());

                that.$roleSettingMenuAccessPermissionGrid.html(that.roleSettingMenuAccessPermissionGrid.render());
                that.$roleSettingMenuAccessPermissionGrid.append(that.subViews['menuAccessLoadingBar'].render());

                that.$roleSettingOperationPermissionGrid.html(that.roleSettingOperationPermissionGrid.render());
                that.$roleSettingOperationPermissionGrid.append(that.subViews['operationLoadingBar'].render());

                return that.$el;
            },

            loadRoleSettingList: function() {
                this.roleSettingGrid.loadData(null, null, true);
            },

            deleteRoleSetting: function(e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        swal({
                                title: '', text:  bxMsg('common.password-msg'), type: "input", inputType: 'password',
                                showCancelButton: true, closeOnConfirm: false, inputPlaceholder: bxMsg('setting.pwd')
                            },
                            function(inputValue){
                                if (inputValue === false) return false;

                                if (inputValue.trim() === "") {
                                    swal.showInputError(bxMsg('common.password-msg'));
                                    return false;
                                }

                                // 요청 객체 생성
                                requestParam = commonUtil.getBxmReqData(
                                    'UserRoleService', 'removeUserRole', 'UserRolePwdOMM',
                                    {
                                        roleId: $target.attr('data-id'),
                                        password: inputValue
                                    }
                                );

                                // Ajax 요청
                                commonUtil.requestBxmAjax(requestParam, {
                                    success: function(response) {
                                        var code = response.ResponseCode.code;

                                        if(code === 200){
                                            swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                            // 그리드 리로드
                                            that.roleSettingGrid.reloadData();
                                            // 초기화
                                            that.resetForms();
                                        }else if(code === 205) {
                                            swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                        }
                                    }
                                });
                            });
                    }
                );
            },

            deletePermission: function (e, requestParam, successCallback) {
                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 200){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                    // 그리드 리로드
                                    successCallback && $.isFunction(successCallback) && successCallback();
                                }
                            }
                        });
                    }
                );
            },

            deleteMenuSetting: function (e) {
                var that = this,
                    $target = $(e.currentTarget);

                that.deletePermission(
                    e,
                    commonUtil.getBxmReqData('UserRoleService', 'removeMenu', 'UserRoleRelationOMM', {
                        roleId: that.roleId,
                        menuId: $target.attr('data-id')
                    }),
                    function () {
                        that.roleSettingMenuAccessPermissionGrid.loadData({
                            roleId: that.roleId
                        });
                    }
                );
            },

            deleteAuthSetting: function (e) {
                var that = this,
                    $target = $(e.currentTarget);

                that.deletePermission(
                    e,
                    commonUtil.getBxmReqData('UserRoleService', 'removePerm', 'UserRoleRelationOMM', {
                        roleId: that.roleId,
                        authId: $target.attr('data-id')
                    }),
                    function () {
                        that.roleSettingOperationPermissionGrid.loadData({
                            roleId: that.roleId
                        });
                    }
                );
            },

            resetForms: function () {
                this.$roleSettingDetailTitle.text('');
                this.$roleSettingDetail.find('input[data-form-param]').val('');
                this.$roleSettingMenuAccessPermissionTitle.text(bxMsg('setting.menu-access-permission'));
                this.$roleSettingOperationPermissionTitle.text(bxMsg('setting.operation-permission'));
                this.roleSettingMenuAccessPermissionGrid.setStoreRootNode(null);
                this.roleSettingOperationPermissionGrid.setData({});
                this.roleId = null;
            },

            showEditRoleSettingPopup: function() {
                var renderData = commonUtil.makeParamFromForm(this.$roleSettingDetail);

                if(!renderData.roleId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['roleSettingPopup'].render(renderData);
            },

            /**
             * roleId
             * */
            loadRoleSetting: function(param) {
                var that = this,
                    requestParam;

                that.roleId = param.roleId;

                // 요청 객체 생성
                requestParam = {
                    roleId: param.roleId,
                    pageNum: "1",
                    pageCount: "5"
                };

                // Ajax 요청
                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'UserRoleService', 'getUserRoleInfo', 'UserRoleRelationOMM',
                    requestParam
                ), {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                        that.subViews['menuAccessLoadingBar'].show();
                        that.subViews['operationLoadingBar'].show();
                    },
                    success: function(response) {
                        var formData = response.UserRoleInfoOutOMM,
                            roleInfo = formData['userRole']['roleNm'] + '(' + formData['userRole']['roleId'] + ')';

                        that.$roleSettingDetailTitle.text(': ' + formData['userRole']['roleId']);
                        that.$roleSettingMenuAccessPermissionTitle
                            .text(bxMsg('setting.menu-access-permission-for').replace("{{roleInfo}}", roleInfo));
                        that.$roleSettingOperationPermissionTitle
                            .text(bxMsg('setting.operation-permission-for').replace("{{roleInfo}}", roleInfo));

                        commonUtil.makeFormFromParam(that.$roleSettingDetail, formData.userRole);
                        that.roleSettingMenuAccessPermissionGrid.setStoreRootNode(formData.userRoleMenu.menuList);
                        that.roleSettingOperationPermissionGrid.loadData(requestParam, null, true,
                            formData.userRolePermission, 'permList');
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                        that.subViews['menuAccessLoadingBar'].hide();
                        that.subViews['operationLoadingBar'].hide();
                    }
                });
            }
        });
    }
);