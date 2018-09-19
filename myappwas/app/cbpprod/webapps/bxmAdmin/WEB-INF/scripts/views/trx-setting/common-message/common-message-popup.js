define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'text!views/trx-setting/common-message/common-message-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        Popup,
        tpl
    ) {

        var CommonMessagePopup = Popup.extend({

            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .generate-id-check': 'changeGenerateIdYn',
                'click .save-common-message-btn': 'saveCommonMessage',
                'click .cancel-btn': 'close'
            },

            mode: '', // add, edit

            initialize: function() {},

            render: function(commonMessageData) {
                this.mode = commonMessageData ? 'edit' : 'add';

                this.$el.html(this.tpl(commonMessageData));
                // textarea에 handlebars template을 이용해 값을 셋팅하면 newline이 적용되지 않아
                // jquery val()을 이용해 값 셋팅
                this.mode === 'edit' && this.$el.find('textarea[data-form-param="detailMsgCtt"]').val(commonMessageData.detailMsgCtt);

                this.renderCode(commonMessageData);

                this.setDraggable();

                this.show();
            },

            renderCode: function(commonMessageData) {
                var $messageLevelSelect,
                    $messageTypeSelect,
                    $langCdSelect;

                //// 메시지 구분 코드 ////
                $messageLevelSelect =  this.$el.find('select[data-form-param="msgBizGrpId"]');
                $messageLevelSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0005']));

                //// 메시지 타입 코드 ////
                $messageTypeSelect =  this.$el.find('select[data-form-param="msgTypeCd"]');
                $messageTypeSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0006']));

                //// 언어 코드 ////
                $langCdSelect =  this.$el.find('select[data-form-param="langCd"]');
                $langCdSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0003']));

                //// SELECT 값 세팅 ////
                if(this.mode === 'edit') {
                    $messageLevelSelect.val(commonMessageData.msgBizGrpId);
                    $messageTypeSelect.val(commonMessageData.msgTypeCd);
                    $langCdSelect.val(commonMessageData.langCd);
                }
            },


            changeGenerateIdYn: function(e) {
                var $target = $(e.currentTarget),
                    $messageIdInput = this.$el.find('.common-message-form').find('input[data-form-param="msgId"]');

                if($target.is(':checked')){
                    $messageIdInput.val('').prop('disabled', true);
                    $messageIdInput.parent().removeClass('asterisk');
                }else{
                    $messageIdInput.prop('disabled', false);
                    $messageIdInput.parent().addClass('asterisk');
                }
            },

            saveCommonMessage: function() {
                var that = this,
                    operation,
                    requestParam,
                    $commonMessageForm = this.$el.find('.common-message-form'),
                    formParam,
                    $askFormItems;

                // 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm($commonMessageForm);

                // 필수값 체크
                $askFormItems = $commonMessageForm.find('.asterisk');

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
                operation = (that.mode === 'edit') ? 'editCommonMsg' : 'addCommonMsg';
                requestParam = commonUtil.getBxmReqData(
                    'CommonMessageService', operation, 'CommonMessageOMM',
                    formParam
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            (that.mode === 'edit') ? that.trigger('edit-common-message') : that.trigger('add-common-message');
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

        return CommonMessagePopup;
    }
);