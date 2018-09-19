define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'views/online/online-log-search/popup/trx-code-select-popup',
        'common/popup/msg-search/msg-search',
        'text!views/error-setting/error-event-setting/error-event-setting-popup-tpl.html'
    ],
    function (
        commonUtil,
        commonConfig,
        Popup,
        TrxCodeSelectPopup,
        MsgSelectPopup,
        tpl
    ) {
        return Popup.extend({

            className: 'md-large error-event-setting-popup',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-btn': 'save',
                'click .cancel-btn': 'close',

                'change [data-form-param="trxTargetCd"]': 'changeTrxCdInput',
                'change [data-form-param="errTargetCd"]': 'changeErrorCdInput',

                'click .trx-code-search-btn': 'showTrxCodeSearchPopup',
                'click .err-code-search-btn': 'showErrCodeSearchPopup'
            },

            mode: '',

            initialize: function () {
                var that = this;

                that.subViews['trxCodeSelectPopup'] = new TrxCodeSelectPopup();
                that.subViews['trxCodeSelectPopup'].on('select-trx-code', function(trxCode) {
                    that.$el.find('[data-form-param="trxCd"]').val(trxCode);
                });
                that.subViews['errMsgSelectPopup'] = new MsgSelectPopup();
                that.subViews['errMsgSelectPopup'].on('select-msg-id', function(msgId) {
                    that.$el.find('[data-form-param="errCd"]').val(msgId);
                });
            },

            render: function (errorEventData) {
                this.mode = errorEventData ? 'edit' : 'add';
                this.$el.html(this.tpl(errorEventData));
                this.loadCode();

                commonUtil.makeFormFromParam(this.$el.find('.error-event-form'), errorEventData);
                this.$el.find('select[data-form-param="trxTargetCd"]').trigger('change');
                this.$el.find('select[data-form-param="errTargetCd"]').trigger('change');

                this.setDraggable();

                this.show();
            },

            loadCode: function () {
                var $trxTargetCdSelect,
                    $errTargetCdSelect,
                    $stdPerdCdSelect,
                    $ctrlCdSelect;

                //// 거래대상 코드 ////
                $trxTargetCdSelect = this.$el.find('select[data-form-param="trxTargetCd"]');
                $trxTargetCdSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMDF0011']));

                //// 에러대상 코드 ////
                $errTargetCdSelect = this.$el.find('select[data-form-param="errTargetCd"]');
                $errTargetCdSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMDF0012']));

                //// 기준기간 코드 ////
                $stdPerdCdSelect = this.$el.find('select[data-form-param="stdPerdCd"]');
                $stdPerdCdSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMDF0013']));

                //// 제어방식 코드 ////
                $ctrlCdSelect = this.$el.find('select[data-form-param="ctrlCd"]');
                $ctrlCdSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMDF0014']));
            },

            save: function() {
                var that = this,
                    operation,
                    requestParam,
                    $form = this.$el.find('.error-event-form'),
                    formParam;

                // 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm($form);

                // 요청 객체 생성
                operation = (that.mode === 'edit') ? 'updateErrEventCndt' : 'addErrEventCndt';
                requestParam = commonUtil.getBxmReqData(
                    'ErrEventCndtCntrlService', operation, 'ErrEventCndtOMM',
                    formParam
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            (that.mode === 'edit') ? that.trigger('edit-error-event') : that.trigger('add-error-event');
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

            changeTrxCdInput: function(e){
                var $target = $(e.currentTarget);

                if($target.val() === 'T'){
                    this.$el.find('.trx-cd-wrap').show();
                }else{
                    this.$el.find('.trx-cd-wrap').hide();
                    this.$el.find('.trx-cd-wrap input').val('');
                }
            },

            changeErrorCdInput: function(e) {
                var $target = $(e.currentTarget);

                if($target.val() === 'E'){
                    this.$el.find('.err-cd-wrap').show();
                    this.$el.find('.sql-err-cd-wrap').hide();
                    this.$el.find('.sql-err-cd-wrap input').val('');
                }else if($target.val() === 'S'){
                    this.$el.find('.err-cd-wrap').hide();
                    this.$el.find('.sql-err-cd-wrap').show();
                    this.$el.find('.err-cd-wrap input').val('');
                }else{
                    this.$el.find('.err-cd-wrap').hide();
                    this.$el.find('.sql-err-cd-wrap').hide();
                    this.$el.find('.err-cd-wrap input').val('');
                    this.$el.find('.sql-err-cd-wrap input').val('');
                }
            },

            showTrxCodeSearchPopup: function() {
                this.subViews['trxCodeSelectPopup'].render();
            },

            showErrCodeSearchPopup: function() {
                this.subViews['errMsgSelectPopup'].render();
            }
        });
    }
);