define(
    [
        'common/util',
        'common/component/ext-grid/_ext-tree-grid',
        'common/component/popup/popup',
        'text!views/setting/role-setting/menu-setting-popup-tpl.html'
    ],
    function(
        commonUtil,
        ExtTreeGrid,
        Popup,
        tpl
    ) {

        return Popup.extend({
            className: 'md-small',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-menu-btn': 'saveMenu',
                'click .cancel-btn': 'close'
            },

            mode: '', // add, edit

            initialize: function() {
                var that = this;

                that.menuSettingGrid = new ExtTreeGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('UserRoleService', 'getMenuPopList', 'UserRoleRelationOMM'),
                        key: 'UserRoleRelationOMM'
                    },
                    responseParam: {
                        objKey: 'UserMenuListOMM',
                        key: 'userMenuList'
                    },
                    gridToggle: false,
                    pageCountList: [5],

                    fields: ['menuId', 'menuNm', 'menuDesc', 'childrenSize'],
                    columns: [
                        {
                            text: '',
                            renderer: function (value, p, record, idx) {
                                // child menu 인 경우에만 체크박스 선택 가능
                                if (record.get('childrenSize')) {
                                    return '';
                                } else {
                                    return Ext.String.format(
                                        '<input type="checkbox" class="bw-input ipt-radio" data-form-param="menuId" data-value="{0}" />',
                                        record.get('menuId')
                                    );
                                }
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            flex: 10
                        },
                        {xtype: 'treecolumn', text: bxMsg('setting.menu-nm'), flex: 25, dataIndex: 'menuNm', style: 'text-align: center'},
                        {text: bxMsg('setting.menu-desc'), flex: 50, dataIndex: 'menuDesc', align: 'center'}
                    ]
                });

                that.$el.html(that.tpl());
                that.$el.find('.menu-setting-grid').html(that.menuSettingGrid.render());
            },

            render: function(menuData) {
                var that = this;

                that.roleId = menuData.roleId;

                that.$el.find('.menu-setting-grid-title')
                    .text(bxMsg('setting.add-menu-access-permission').replace("{{roleInfo}}", that.roleId));
                that.menuSettingGrid.loadData(menuData, function () {
                    that.menuSettingGrid.expandAllTreeNode();
                });

                that.setDraggable();

                that.show();
            },

            saveMenu: function() {
                var that = this,
                    relationList = [],
                    requestParam,
                    $menuSettingGrid = this.$el.find('.menu-setting-grid'),
                    formParam;

                // 폼 파라미터 객체 생성
                formParam = commonUtil.makeParamFromForm($menuSettingGrid);

                if (!formParam.menuId) {
                    swal({type: 'error', title: '', text: bxMsg('common.item-no-select-error'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                    return;
                }

                for (var i in formParam.menuId) {
                    if (formParam.menuId.hasOwnProperty(i)) {
                        relationList.push({
                            roleId: that.roleId,
                            menuId: formParam.menuId[i]
                        });
                    }
                }

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'UserRoleService', 'addMenu', 'UserRoleRelListOMM',
                    {
                        relationList: relationList
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            that.trigger('add-menu');
                            that.close();
                        }else if(code === 201){
                            swal({type: 'error', title: '', text: bxMsg('common.save-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }else if(code === 202){
                            swal({type: 'error', title: '', text: bxMsg('common.same-val-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }else if(code === 204){
                            swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    }
                });
            }
        });
    }
);
