define(
    [
        'common/util',
        'common/component/popup/popup',
        'text!views/setting/user-setting/user-setting-popup-tpl.html'
    ],
    function(
        commonUtil,
        Popup,
        tpl
    ) {

        var UserSettingPopup = Popup.extend({

            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-user-btn': 'saveUser',
                'click .cancel-btn': 'close',

                'change select[data-form-param="roleId"]': 'changeCodeName'
            },

            mode: '', // add, edit

            initialize: function() {},

            render: function(userData) {
                this.mode = userData ? 'edit' : 'add';

                this.$el.html(this.tpl(userData));
                this.renderCode(userData);

                this.setDraggable();

                this.show();
            },

            renderCode: function(userData) {
                var that = this,
                    requestParam,
                    $roleSelect;


                //// 역할 코드 ////
                $roleSelect =  that.$el.find('select[data-form-param="roleId"]');

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData('UserInfoService', 'getUserRoleIdList', 'EmptyOMM');

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var userList = response.UserRoleListOMM.userRoleList,
                            $optionList = [];

                        // option 태그 렌더
                        userList.forEach(function(user) {
                            var option =
                                '<option value="' + user.roleId + '" data-name="'+ user.roleNm +'">' +
                                user.roleId +
                                '</option>';

                            $optionList.push(option);
                        });

                        $roleSelect.html($optionList);

                        if (that.mode === 'edit') {
                            commonUtil.makeFormFromParam(that.$el.find('.user-setting-form'), userData);
                            that.$el.find('.modified-pwd').html(bxMsg('modified-pwd'));
                            that.$el.find('.modified-check-pwd').html(bxMsg('modified-check-pwd'));
                        } else {
                            $roleSelect.trigger('change');
                        }
                    }
                });
            },

            saveUser: function() {
                var that = this,
                    operation,
                    requestParam,
                    $userSettingForm = this.$el.find('.user-setting-form'),
                    userPwd,
                    checkPwd,
                    formParam,
                    $askFormItems;

                // 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm($userSettingForm);

                // 필수값 체크
                $askFormItems = $userSettingForm.find('.asterisk');

                for(var i = 0 ; i < $askFormItems.length; i++){
                    var $askFormItem = $($askFormItems[i]),
                        key = $askFormItem.find('[data-form-param]').attr('data-form-param'),
                        msg = $askFormItem.find('.bw-label').text();

                    if(!formParam[key]) {
                        swal({type: 'warning', title: '', text: msg + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }
                }

                // 비밀번호 체크
                userPwd = $userSettingForm.find('[data-form-param="userPwd"]').val();
                checkPwd = $userSettingForm.find('[data-form-param="checkPwd"]').val();

                if(userPwd !== checkPwd) {
                    swal({type: 'warning', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                // Email validation
                if (formParam.email && !/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(formParam.email)) {
                    swal({type: 'warning', title: '', text: bxMsg('common.invalid-email-warning'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                // 요청 객체 생성
                operation = (that.mode === 'edit') ? 'editUserInfo' : 'addUserInfo';
                requestParam = commonUtil.getBxmReqData(
                    'UserInfoService', operation, 'UserInfoOMM',
                    formParam
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            (that.mode === 'edit') ? that.trigger('edit-user') : that.trigger('add-user');
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
            },

            changeCodeName: function(e) {
                var $target = $(e.currentTarget);

                $target.siblings('input').val($target.find('option:selected').attr('data-name'));
            }

        });

        return UserSettingPopup;
    }
);