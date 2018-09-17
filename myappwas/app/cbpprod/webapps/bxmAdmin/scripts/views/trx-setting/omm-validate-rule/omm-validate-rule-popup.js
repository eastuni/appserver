define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'views/trx-setting/omm-validate-rule/rule-applied-type-search-popup',
        'text!views/trx-setting/omm-validate-rule/omm-validate-rule-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        Popup,
        RuleAppliedTypeSearchPopup,
        tpl
    ) {
        return Popup.extend({

            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .edit-applied-type-btn': 'showEditAppliedTypePopup',
                'click .save-btn': 'saveItem',
                'click .cancel-btn': 'close'
            },

            mode: '', // add, edit

            initialize: function() {},

            render: function(data) {
                var that = this;
                that.mode = data ? 'edit' : 'add';

                that.$el.html(that.tpl(data));
                commonUtil.makeFormFromParam(that.$el.find('.bx-form-wrap'), data);

                that.subViews['ruleAppliedTypeSearchPopup'] = new RuleAppliedTypeSearchPopup();
                that.subViews['ruleAppliedTypeSearchPopup'].on('save-items', function(items) {
                    that.$el.find('.bx-form-wrap input[data-form-param="type"]').val(items);
                });

                that.setDraggable();
                that.show();
            },

            showEditAppliedTypePopup: function () {
                this.subViews['ruleAppliedTypeSearchPopup']
                    .render(this.$el.find('.bx-form-wrap input[data-form-param="type"]').val());
            },

            saveItem: function() {
                var that = this,
                    operation,
                    requestParam,
                    $bxFormWrap = this.$el.find('.bx-form-wrap'),
                    formParam,
                    $askFormItems;

                // 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm($bxFormWrap);

                // 필수값 체크
                $askFormItems = $bxFormWrap.find('.asterisk');

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
                operation = (that.mode === 'edit') ? 'editValidRule' : 'addValidRule';
                requestParam = commonUtil.getBxmReqData(
                    'ValidationRuleService', operation, 'ValidationRuleOMM',
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
            }

        });
    }
);