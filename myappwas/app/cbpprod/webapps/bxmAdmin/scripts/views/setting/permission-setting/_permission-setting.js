define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/setting/permission-setting/permission-setting-popup',
        'text!views/setting/permission-setting/_permission-setting-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        PermissionSettingPopup,
        tpl
    ) {

        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .del-permission-btn': 'deletePermission',
                'click .edit-permission-btn': 'showEditPermissionPopup'
            },

            authId: null,

            initialize: function() {
                var that = this;

                // Set Page
                this.$el.html(this.tpl());

                // Dom Element Cache
                that.$permissionSettingGrid = that.$el.find('.permission-setting-grid');
                that.$permissionSettingDetail = that.$el.find('.permission-setting-detail');
                that.$permissionSettingDetailTitle = that.$el.find('h3 > .permission-setting-detail-title');

                // line alignment for locale
                if (bxMsg.locale === 'en') {
                    that.$permissionSettingDetail.find('input[data-form-param="authDesc"]').prev().addClass('bx-label-wrap');
                }

                // Set SubViews
                that.subViews['permissionSettingPopup'] = new PermissionSettingPopup();
                that.subViews['permissionSettingPopup'].on('edit-permission', function() {
                    // 사용자 수정시, 리스트, 상세 리프래시
                    var selectedIdx = that.permissionSettingGrid.getSelectedRowIdx();

                    that.permissionSettingGrid.reloadData(function() {
                        if(selectedIdx === -1){
                            that.loadPermission({authId: that.authId});
                        }else{
                            that.permissionSettingGrid.setSelectedRowIdx(selectedIdx);
                        }
                    });
                });
                that.subViews['permissionSettingPopup'].on('add-permission', function() {
                    // 사용자 생성시, 리스트 리프래시
                    that.permissionSettingGrid.reloadData();
                });

                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set Grid
                that.permissionSettingGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('UserPermissionService', 'getUserPermissionList', 'PageCountOMM'),
                        key: 'PageCountOMM'
                    },
                    responseParam: {
                        objKey: 'UserPermissionListOMM',
                        key: 'userPermissionList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['permissionSettingPopup'].render();
                                }
                            }
                        ]
                    },
                    paging: true,

                    fields: ['authId', 'authNm', 'authDesc', 'authTypeCd', 'useYn'],
                    columns: [
                        {text: bxMsg('setting.permission-id'), flex: 2, dataIndex: 'authId', align: 'center'},
                        {text: bxMsg('setting.permission-nm'), flex: 2, dataIndex: 'authNm', align: 'center'},
                        {text: bxMsg('setting.permission-desc'), flex: 3, dataIndex: 'authDesc', style: 'text-align:center', tdCls: 'left-align'},
                        {
                            text: bxMsg('setting.permission-type'),
                            flex: 2,
                            dataIndex: 'authTypeCd',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMAD0011'][value];
                            },
                            align: 'center'
                        },
                        {text: bxMsg('setting.use-yn'), flex: 1, dataIndex: 'useYn', align: 'center'},
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn del-permission-btn" data-id="{0}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('authId')
                                );
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            width: 50
                        }
                    ],
                    listeners: {
                        select: function(_this, record) {
                            that.loadPermission({authId: record.get('authId')});
                        }
                    }
                });
            },

            render: function() {
                var that = this;

                that.$permissionSettingGrid.html(that.permissionSettingGrid.render(function(){that.loadPermissionList();}));
                that.$permissionSettingDetail.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            loadPermissionList: function() {
            	var that= this;
            	
                this.permissionSettingGrid.loadData(null, function(data) {
                	data = data['userPermissionList'];
                	if(data && data.length) {
                		that.$permissionSettingGrid.find('tbody tr:first-child').click();
                	}
                }, true);
            },

            deletePermission: function(e) {
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
                                    'UserPermissionService', 'removeUserPermission', 'CommonCodeOMM',
                                    {
                                        authId: $target.attr('data-id'),
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
                                            that.permissionSettingGrid.reloadData();

                                            // 상세 초기화
                                            that.$permissionSettingDetailTitle.text('');
                                            that.$permissionSettingDetail.find('input[data-form-param]').val('');
                                        }else if(code === 205) {
                                            swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                        }
                                    }
                                });
                            });
                    }
                );
            },

            showEditPermissionPopup: function() {
                var renderData = commonUtil.makeParamFromForm(this.$permissionSettingDetail);

                if(!renderData.authId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['permissionSettingPopup'].render(renderData);
            },

            /**
             * authId
             * */
            loadPermission: function(param) {
                var that = this,
                    requestParam;

                that.authId = param.authId;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'UserPermissionService', 'getUserPermissionInfo', 'CommonCodeOMM',
                    {
                        authId: param.authId
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var userPermissionOMM = response.UserPermissionOMM;

                        that.$permissionSettingDetailTitle.text(userPermissionOMM.authId);
                        commonUtil.makeFormFromParam(that.$permissionSettingDetail, userPermissionOMM);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            }
        });
    }
);