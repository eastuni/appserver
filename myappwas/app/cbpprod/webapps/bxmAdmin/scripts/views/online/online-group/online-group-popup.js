define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'text!views/online/online-group/online-group-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        Popup,
        tpl
    ) {

        var JobGroupPopup = Popup.extend({

            className: 'md-small',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-trx-group-btn': 'saveTrxGroup',
                'click .cancel-btn': 'close'
            },

            mode: '', // add, edit

            initialize: function() {},

            render: function(trxGroupData) {
                this.mode = trxGroupData ? 'edit' : 'add';

                this.$el.html(this.tpl(trxGroupData));

                this.renderCode(trxGroupData);
                this.setDraggable();
                this.show();
            },

            renderCode: function(trxGroupData) {
                if(this.mode === 'edit') {
                    this.$el.find('select[data-form-param="useYn"]').val(trxGroupData.useYn);
                }
            },

            saveTrxGroup: function() {
                var that = this,
                    operation,
                    requestParam,
                    $trxGroupForm = this.$el.find('.trx-group-form'),
                    formParam,
                    $askFormItems;

                // 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm($trxGroupForm);

                // 필수값 체크
                $askFormItems = $trxGroupForm.find('.asterisk');

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
                operation = (that.mode === 'edit') ? 'editTrxGroup' : 'addTrxGroup';
                requestParam = commonUtil.getBxmReqData(
                    'OnlineGroupService', operation, 'TrxGroupOMM',
                    formParam
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            (that.mode === 'edit') ? that.trigger('edit-trx-group') : that.trigger('add-trx-group');
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

        return JobGroupPopup;
    }
);