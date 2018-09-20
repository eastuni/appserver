define(
    [
        'common/util',
        'common/component/popup/popup',
        'text!views/setting/studio-setting/namespace-setting-popup-tpl.html'
    ],
    function(
        commonUtil,
        Popup,
        tpl
    ) {

        return Popup.extend({

            className: 'md-small',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-namespace-btn': 'saveNamespace',
                'click .cancel-btn': 'close'
            },

            initialize: function() {},

            render: function() {
                this.$el.html(this.tpl());
                this.setDraggable();
                this.show();
            },

            saveNamespace: function() {
                var that = this,
                    requestParam,
                    $namespaceSettingForm = this.$el.find('.namespace-setting-form'),
                    formParam;

                // 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm($namespaceSettingForm);

                // 필수값 체크
                var $askFormItems = $namespaceSettingForm.find('.asterisk');

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
                requestParam = commonUtil.getBxmReqData(
                    'BuilderConfigService', 'addNamespace', 'BuilderConfigNSOMM',
                    formParam
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            that.trigger('add-namespace');
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