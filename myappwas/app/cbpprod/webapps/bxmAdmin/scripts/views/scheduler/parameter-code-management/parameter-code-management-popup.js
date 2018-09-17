define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'text!views/scheduler/parameter-code-management/parameter-code-management-popup-tpl.html'
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
                'click .save-btn': 'saveItem',
                'click .cancel-btn': 'close',

                'change select[data-form-param="autoRegYn"]': 'changeAutoRegYn'
            },

            mode: '', // add, edit

            initialize: function() {},

            render: function(data) {
                this.mode = data ? 'edit' : 'add';

                this.$el.html(this.tpl(data));
                this.$formWrap = this.$el.find('.bxm-form-wrap');

                this.renderCode(data);

                this.setDraggable();

                this.show();
            },

            renderCode: function(data) {
                this.$el.find('select[data-form-param="paramTypeCd"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0017']));

                if (this.mode === 'edit') {
                    if (!data.autoRegSeq) data.autoRegSeq = 'N/A';
                    commonUtil.makeFormFromParam(this.$formWrap, data);
                    this.$formWrap.find('select[data-form-param="autoRegYn"]').trigger('change');
                }
            },

            saveItem: function() {
                var that = this,
                    operation,
                    requestParam,
                    formParam,
                    $askFormItems;

                // 폼 파라미터 객체 생성
                formParam = commonUtil.makeParamFromForm(this.$formWrap);
                if (formParam.autoRegSeq == 'N/A') formParam.autoRegSeq = 0;

                // 필수값 체크
                $askFormItems = this.$formWrap.find('.asterisk');

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
                operation = (that.mode === 'edit') ? 'editParameterCode' : 'addParameterCode';
                requestParam = commonUtil.getBxmReqData(
                    'ParameterCodeService', operation, 'ParameterCodeOMM',
                    formParam
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            (that.mode === 'edit') ? that.trigger('edit-item') : that.trigger('add-item');
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

            changeAutoRegYn: function(e) {
                var $autoRegSeq = this.$formWrap.find('input[data-form-param="autoRegSeq"]');

                if ($(e.currentTarget).val() === 'Y') {
                    $autoRegSeq.attr('disabled', false).val(1);
                } else {
                    $autoRegSeq.attr('disabled', true).val('N/A');
                }
            }
        });
    }
);