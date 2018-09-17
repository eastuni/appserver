define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/component/popup/popup',
        'text!views/setting/role-setting/auth-setting-popup-tpl.html'
    ],
    function(
        commonUtil,
        ExtGrid,
        Popup,
        tpl
    ) {

        return Popup.extend({
            className: 'md-small',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-auth-btn': 'saveAuth',
                'click .cancel-btn': 'close'
            },

            mode: '', // add, edit

            initialize: function() {
                var that = this;

                that.authSettingGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('UserRoleService', 'getPermPopList', 'UserRoleRelationOMM'),
                        key: 'UserRoleRelationOMM'
                    },
                    responseParam: {
                        objKey: 'UserPermissionListOMM',
                        key: 'userPermissionList'
                    },
                    paging: true,
                    gridToggle: false,
                    pageCountList: [5],

                    fields: ['authId', 'authNm', 'authDesc'],
                    columns: [
                        {
                            text: '',
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<input type="checkbox" name="checkboxItem" class="bw-input ipt-radio" data-form-param="authId" data-value="{0}" />',
                                    record.get('authId')
                                );
                            },
                            sortable: false,
                            authDisabled: true,
                            align: 'center',
                            flex: 1
                        },
                        {text: bxMsg('setting.permission-id'), flex: 1, dataIndex: 'authId', align: 'center'},
                        {text: bxMsg('setting.permission-nm'), flex: 1, dataIndex: 'authNm', align: 'center'},
                        {text: bxMsg('setting.permission-desc'), flex: 2, dataIndex: 'authDesc', align: 'center'}
                    ],
                    listeners: {
                        itemclick: function(_this, record, item, idx) {
                            var $target = $( that.$el.find('input[name="checkboxItem"]')[idx] );
                            if ($target.attr('checked')) {
                                $target.attr("checked", false);
                            } else {
                                $target.attr("checked", true);
                            }
                        }
                    }
                });

                that.$el.html(that.tpl());
                that.$el.find('.auth-setting-grid').html(that.authSettingGrid.render());
            },

            render: function(authData) {
                var that = this;

                that.roleId = authData.roleId;

                that.$el.find('.auth-setting-grid-title')
                    .text(bxMsg('setting.add-operation-permission').replace("{{roleId}}", that.roleId));
                that.authSettingGrid.loadData({
                    roleId: that.roleId,
                    pageNum: "1",
                    pageCount: "5"
                }, function () {
                    $('input[type="checkbox"][name="checkboxItem"]').on('click', function () {
                        var $target = $(this);
                        if ($target.attr('checked')) {
                            $target.attr("checked", false);
                        } else {
                            $target.attr("checked", true);
                        }
                    })
                }, true);

                that.setDraggable();

                that.show();
            },

            saveAuth: function() {
                var that = this,
                    relationList = [],
                    requestParam,
                    $authSettingGrid = this.$el.find('.auth-setting-grid'),
                    formParam;

                // 폼 파라미터 객체 생성
                formParam = commonUtil.makeParamFromForm($authSettingGrid);

                if (!formParam.authId) {
                    swal({type: 'error', title: '', text: bxMsg('common.item-no-select-error'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                    return;
                }

                for (var i in formParam.authId) {
                    if (formParam.authId.hasOwnProperty(i)) {
                        relationList.push({
                            roleId: that.roleId,
                            authId: formParam.authId[i]
                        });
                    }
                }

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'UserRoleService', 'addPerm', 'UserRoleRelListOMM',
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
                            that.trigger('add-auth');
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
