define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/setting/admin-setting/admin-setting-popup',
        'text!views/setting/admin-setting/_admin-setting-tpl.html'
    ],
    function(
        commonUtil,
        ExtGrid,
        LoadingBar,
        AdminSettingPopup,
        tpl
    ) {

        var AdminSettingView = Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadAdminList',
                'enter-component .admin-setting-search input': 'loadAdminList',

                'click .del-admin-btn': 'deleteAdmin',
                'click .edit-admin-btn': 'showEditAdminPopup'
            },

            cfgKey: null,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['adminSettingPopup'] = new AdminSettingPopup();
                that.subViews['adminSettingPopup'].on('edit-admin', function() {
                    // 어드민 수정시, 리스트, 상세 리프래시
                    var selectedIdx = that.adminSettingGrid.getSelectedRowIdx();

                    that.adminSettingGrid.reloadData(function() {
                        if(selectedIdx === -1){
                            that.loadAdmin({cfgKey: that.cfgKey});
                        }else{
                            that.adminSettingGrid.setSelectedRowIdx(selectedIdx);
                        }
                    });
                });
                that.subViews['adminSettingPopup'].on('add-admin', function() {
                    // 어드민 생성시, 리스트 리프래시
                    that.adminSettingGrid.reloadData();
                });

                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set Grid
                that.adminSettingGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('AdminSettingService', 'getAdminSettingList', 'AdminSettingSearchConditionOMM'),
                        key: 'AdminSettingSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'AdminSettingListOMM',
                        key: 'adminSettingList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['adminSettingPopup'].render();
                                }
                            }
                        ]
                    },
                    paging: true,

                    fields: ['cfgKey', 'cfgVal', 'cfgDesc', 'regUserId', 'regOccurDttm'],
                    columns: [
                        {text: bxMsg('setting.key'), flex: 1, dataIndex: 'cfgKey', style: 'text-align:center', tdCls: 'left-align'},
                        {text: bxMsg('setting.value'), flex: 1, dataIndex: 'cfgVal', style: 'text-align:center', tdCls: 'left-align'},
                        {text: bxMsg('setting.description'), flex: 1, dataIndex: 'cfgDesc', style: 'text-align:center', tdCls: 'left-align'},
                        {text: bxMsg('setting.user-id'), width: 120, dataIndex: 'regUserId', align: 'center'},
                        {text: bxMsg('setting.register-date'), width: 160, dataIndex: 'regOccurDttm', align: 'center'},
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn del-admin-btn" data-id="{0}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('cfgKey')
                                );
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            width: 50
                        }
                    ],
                    listeners: {
                        select : function(_this, record) {
                            that.loadAdmin({cfgKey: record.get('cfgKey')});
                        }
                    }
                });

                // Dom Element Cache
                that.$adminSettingSearch = that.$el.find('.admin-setting-search');
                that.$adminSettingGrid = that.$el.find('.admin-setting-grid');
                that.$adminSettingDetail = that.$el.find('.admin-setting-detail');
                that.$adminSettingDetailTitle = that.$el.find('h3 > .admin-setting-detail-title');
            },

            render: function() {
                var that = this;

                that.$adminSettingGrid.html(that.adminSettingGrid.render(function(){that.loadAdminList();}));
                that.$adminSettingDetail.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            resetSearch: function() {
                this.$adminSettingSearch.find('input[data-form-param]').val('');
            },

            loadAdminList: function() {
            	var that = this,
            		params = commonUtil.makeParamFromForm(this.$adminSettingSearch);
                this.adminSettingGrid.loadData(params, function(data){
                	data = data['adminSettingList'];
                	if(data && data.length) {
                		that.$adminSettingGrid.find('tbody tr:first-child').click();
                	}
                }, true);
            },

            deleteAdmin: function(e) {
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
                                    'AdminSettingService', 'removeAdminSetting', 'RecheckPwdOMM',
                                    {
                                        cfgKey: $target.attr('data-id'),
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
                                            that.adminSettingGrid.reloadData();

                                            // 상세 초기화
                                            that.$adminSettingDetailTitle.text('');
                                            that.$adminSettingDetail.find('[data-form-param]').val('');
                                        }else if(code === 205) {
                                            swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                        }
                                    }
                                });
                            });
                    }
                );
            },

            showEditAdminPopup: function() {
                var renderData = commonUtil.makeParamFromForm(this.$adminSettingDetail);

                if(!renderData.cfgKey) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['adminSettingPopup'].render(renderData);
            },

            /**
             * cfgKey
             * */
            loadAdmin: function(param) {
                var that = this,
                    requestParam;

                that.cfgKey = param.cfgKey;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'AdminSettingService', 'getAdminSettingInfo', 'AdminSettingOMM',
                    {
                        cfgKey: param.cfgKey
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var adminSettingOMM = response.AdminSettingOMM;

                        that.$adminSettingDetailTitle.text(adminSettingOMM.cfgKey);
                        commonUtil.makeFormFromParam(that.$adminSettingDetail, adminSettingOMM);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            }

        });

        return AdminSettingView;
    }
);