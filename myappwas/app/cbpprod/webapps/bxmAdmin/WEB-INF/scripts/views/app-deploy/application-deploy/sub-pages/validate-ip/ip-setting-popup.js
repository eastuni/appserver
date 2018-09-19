define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'text!views/app-deploy/application-deploy/sub-pages/validate-ip/ip-setting-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        Popup,
        tpl
    ) {

        return Popup.extend({

            className: 'md-small',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-ip-btn': 'saveIp',
                'click .cancel-btn': 'close'
            },

            mode: null,

            initialize: function() {},

            render: function(renderData) {
                this.mode = renderData && renderData.validIp ? 'edit' : 'add';
                this.$el.html(this.tpl(renderData));
                this.setDraggable();

                this.show();
            },

            saveIp: function() {
                var that = this,
                    $ipSettingForm = this.$el.find('.ip-setting-form'),
                    operation,
                    formParam,
                    $askFormItems;

                // 폼 파라미터 객체 생성
                formParam = commonUtil.makeParamFromForm($ipSettingForm);

                // 필수값 체크
                $askFormItems = $ipSettingForm.find('.asterisk');

                for(var i = 0 ; i < $askFormItems.length; i++){
                    var $askFormItem = $($askFormItems[i]),
                        key = $askFormItem.find('[data-form-param]').attr('data-form-param'),
                        msg = $askFormItem.find('.bw-label').text();

                    if(!formParam[key]) {
                        swal({type: 'warning', title: '', text: msg + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }
                }

                formParam.useYn = "Y";
                operation = (that.mode === 'edit') ? 'editValidateIP' : 'addValidateIP';

                // Ajax 요청
                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('ValidateIPService', operation, 'ValidateIPOMM', formParam), {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            (that.mode === 'edit') ? that.trigger('edit-ip') : that.trigger('add-ip');that.trigger('add-ip');
                            that.close();
                        }else if(code === 201){
                            swal({type: 'error', title: '', text: bxMsg('common.save-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }else if(code === 202){
                            swal({type: 'error', title: '', text: bxMsg('common.same-val-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    }
                });
            }
        });
    }
);
