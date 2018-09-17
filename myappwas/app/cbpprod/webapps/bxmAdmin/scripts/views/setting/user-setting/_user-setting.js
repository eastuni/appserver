define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/setting/user-setting/user-setting-popup',
        'text!views/setting/user-setting/_user-setting-tpl.html'
    ],
    function(
        commonUtil,
        ExtGrid,
        LoadingBar,
        UserSettingPopup,
        tpl
    ) {

        var UserSettingView = Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadUserList',
                'enter-component .user-setting-search input': 'loadUserList',

                'click .del-user-btn': 'deleteUser',
                'click .edit-user-btn': 'showEditUserPopup'
            },

            userId: null,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['userSettingPopup'] = new UserSettingPopup();
                that.subViews['userSettingPopup'].on('edit-user', function() {
                    // 사용자 수정시, 리스트, 상세 리프래시
                    var selectedIdx = that.userSettingGrid.getSelectedRowIdx();

                    that.userSettingGrid.reloadData(function() {
                        if(selectedIdx === -1){
                            that.loadUser({userId: that.userId});
                        }else{
                            that.userSettingGrid.setSelectedRowIdx(selectedIdx);
                        }
                    });
                });
                that.subViews['userSettingPopup'].on('add-user', function() {
                    // 사용자 생성시, 리스트 리프래시
                    that.userSettingGrid.reloadData();
                });

                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set Grid
                that.userSettingGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('UserInfoService', 'getUserInfoList', 'UserInfoSearchConditionOMM'),
                        key: 'UserInfoSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'UserInfoListOMM',
                        key: 'userInfoList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['userSettingPopup'].render();
                                }
                            },
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-xls" title="' + bxMsg('common.excel-download') + '"></i></button>',
                                event: function() {
                                    swal({
                                            title: '', text: bxMsg('common.excel-download-msg'), showCancelButton: true
                                        },
                                        function(){
                                            // 요청 객체 생성
                                            var requestParam = commonUtil.getBxmReqData('UserInfoService', 'userInfoExportExcel', 'EmptyOMM');

                                            // Ajax 요청
                                            commonUtil.requestBxmAjax(requestParam, {
                                                success: function(response) {
                                                    var filePath = response.ExcelExportOMM.filePath;

                                                    commonUtil.downloadFile('fileEndpoint/download', {filePath: filePath});
                                                }
                                            });
                                        }
                                    );
                                }
                            }
                        ]
                    },
                    paging: true,

                    fields: ['userId', 'userNm', 'userPwd', 'roleId', 'useYn', 'regUserId', 'regOccurDttm'],
                    columns: [
                        {text: bxMsg('setting.user-id'), flex: 1, dataIndex: 'userId', align: 'center'},
                        {text: bxMsg('setting.user-nm'), flex: 1, dataIndex: 'userNm', align: 'center'},
                        {text: bxMsg('setting.role-id'), flex: 1, dataIndex: 'roleId', align: 'center'},
                        {text: bxMsg('setting.use-yn'), width: 100, dataIndex: 'useYn', align: 'center'},
                        {text: bxMsg('setting.register-id'), width: 120, dataIndex: 'regUserId', align: 'center'},
                        {text: bxMsg('setting.register-date'), width: 160, dataIndex: 'regOccurDttm', align: 'center'},
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn del-user-btn" data-id="{0}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('userId')
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
                            that.loadUser({userId: record.get('userId')});
                        }
                    }
                });

                // Dom Element Cache
                that.$userSettingSearch = that.$el.find('.user-setting-search');
                that.$userSettingGrid = that.$el.find('.user-setting-grid');
                that.$userSettingDetail = that.$el.find('.user-setting-detail');
                that.$userSettingDetailTitle = that.$el.find('h3 > .user-setting-detail-title');
            },

            render: function() {
                var that = this;

                that.$userSettingGrid.html(that.userSettingGrid.render(function(){that.loadUserList();}));
                that.$userSettingDetail.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            resetSearch: function() {
                this.$userSettingSearch.find('input[data-form-param]').val('');
            },

            loadUserList: function() {
            	var that = this,
            		params = commonUtil.makeParamFromForm(this.$userSettingSearch);
                this.userSettingGrid.loadData(params, function(data) {
                	that.$userSettingGrid.find('tbody tr:first-child').click();
                }, true);
            },

            deleteUser: function(e) {
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
                                    'UserInfoService', 'removeUserInfo', 'UserInfoPwdOMM',
                                    {
                                        userId: $target.attr('data-id'),
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
                                            that.userSettingGrid.reloadData();

                                            // 상세 초기화
                                            that.$userSettingDetailTitle.text('');
                                            that.$userSettingDetail.find('input[data-form-param]').val('');
                                        }else if(code === 205) {
                                            swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                        }
                                    }
                                });
                        });
                    }
                );
            },

            showEditUserPopup: function() {
                var renderData = commonUtil.makeParamFromForm(this.$userSettingDetail);

                if(!renderData.userId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['userSettingPopup'].render(renderData);
            },

            /**
             * userId
             * */
            loadUser: function(param) {
                var that = this,
                    requestParam;

                that.userId = param.userId;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'UserInfoService', 'getUserInfo', 'UserInfoOMM',
                    {
                        userId: param.userId
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var userInfoOMM = response.UserInfoOMM;

                        that.$userSettingDetailTitle.text(userInfoOMM.userId);
                        commonUtil.makeFormFromParam(that.$userSettingDetail, userInfoOMM);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            }

        });

        return UserSettingView;
    }
);