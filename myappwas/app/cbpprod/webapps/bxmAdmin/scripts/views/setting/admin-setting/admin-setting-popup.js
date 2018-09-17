define(
    [
        'common/util',
        'common/component/popup/popup',
        'text!views/setting/admin-setting/admin-setting-popup-tpl.html'
    ],
    function(
        commonUtil,
        Popup,
        tpl
    ) {

        var AdminSettingPopup = Popup.extend({

            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-admin-btn': 'saveAdmin',
                'click .cancel-btn': 'close'
            },

            mode: '', // add, edit

            initialize: function() {},

            render: function(adminData) {
                this.mode = adminData ? 'edit' : 'add';

                this.$el.html(this.tpl(adminData));
                // textarea에 handlebars template을 이용해 값을 셋팅하면 newline이 적용되지 않아
                // jquery val()을 이용해 값 셋팅
                if (this.mode === 'edit') {
                    this.$el.find('textarea[data-form-param="cfgVal"]').val(adminData.cfgVal);
                    this.$el.find('textarea[data-form-param="cfgDesc"]').val(adminData.cfgDesc);
                }

                this.setDraggable();

                this.show();
            },

            saveAdmin: function() {
                var that = this,
                    operation,
                    requestParam,
                    $adminSettingForm = this.$el.find('.admin-setting-form'),
                    formParam,
                    $askFormItems;

                // 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm($adminSettingForm);

                // 필수값 체크
                $askFormItems = $adminSettingForm.find('.asterisk');

                for(var i = 0 ; i < $askFormItems.length; i++){
                    var $askFormItem = $($askFormItems[i]),
                        key = $askFormItem.find('[data-form-param]').attr('data-form-param'),
                        msg = $askFormItem.find('.bw-label').text();

                    if(!formParam[key]) {
                        swal({type: 'warning', title: '', text: msg + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }
                }

                // 요청 객체 생성
                operation = (that.mode === 'edit') ? 'editAdminSetting' : 'addAdminSetting';
                requestParam = commonUtil.getBxmReqData(
                    'AdminSettingService', operation, 'AdminSettingOMM',
                    formParam
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            (that.mode === 'edit') ? that.trigger('edit-admin') : that.trigger('add-admin');
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

        return AdminSettingPopup;
    }
);