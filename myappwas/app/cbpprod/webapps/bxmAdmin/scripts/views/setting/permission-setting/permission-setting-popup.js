define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'text!views/setting/permission-setting/permission-setting-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        Popup,
        tpl
    ) {

        return Popup.extend({

            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-permission-btn': 'savePermission',
                'click .cancel-btn': 'close',

                'change select[data-form-param="authTypeCd"]': 'authTypeCdChanged'
            },

            mode: '', // add, edit

            initialize: function() {},

            render: function(permissionData) {
                this.mode = permissionData ? 'edit' : 'add';

                this.$el.html(this.tpl(permissionData));
                // line alignment for locale
                if (bxMsg.locale === 'en') {
                    this.$el.find('input[data-form-param="authDesc"]').prev().addClass('bx-label-wrap');
                }

                this.renderCode(permissionData);
                this.setDraggable();

                this.show();
            },

            renderCode: function(permissionData) {
                var that = this,
                    $authTypeCdSelect = this.$el.find('select[data-form-param="authTypeCd"]'),
                    $useYnSelect = this.$el.find('select[data-form-param="useYn"]');

                $authTypeCdSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0011']));

                if(that.mode === 'edit') {
                    $authTypeCdSelect.val(permissionData.authTypeCd);
                    $useYnSelect.val(permissionData.useYn);
                }
                
                that.authTypeCdChanged();
            },

            savePermission: function() {
                var that = this,
                    operation,
                    requestParam,
                    $permissionSettingForm = this.$el.find('.permission-setting-form'),
                    formParam,
                    $askFormItems;

                // 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm($permissionSettingForm);

                // 필수값 체크
                $askFormItems = $permissionSettingForm.find('.asterisk');

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
                operation = (that.mode === 'edit') ? 'editUserPermission' : 'addUserPermission';
                requestParam = commonUtil.getBxmReqData(
                    'UserPermissionService', operation, 'CommonCodeOMM',
                    formParam
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            (that.mode === 'edit') ? that.trigger('edit-permission') : that.trigger('add-permission');
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

            authTypeCdChanged: function(e) {
                var $target = e ? $(e.currentTarget) : this.$el.find('select[data-form-param="authTypeCd"]'),
                    $svcNmInput = this.$el.find('input[data-form-param="svcNm"]'),
                    $opNmInput = this.$el.find('input[data-form-param="opNm"]');

                if ($target.find('option:selected').val() === 'P') {
                    // 서비스 명, 오퍼레이션 명 disabled
                    $svcNmInput[0].disabled = true;
                    $opNmInput[0].disabled = true;
                } else {
                    // 서비스 명, 오퍼레이션 명 enabled
                    $svcNmInput[0].disabled = false;
                    $opNmInput[0].disabled = false;
                }
            }
        });
    }
);