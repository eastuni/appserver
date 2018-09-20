define(
    [
        'common/util',
        'common/component/popup/popup',
        'text!views/scheduler/system-group-management/system-setting-popup-tpl.html'
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
                'click .save-btn': 'saveItem',
                'click .cancel-btn': 'close'
            },

            mode: '', // add, edit

            initialize: function() {},

            render: function(data) {
                this.mode = data ? 'edit' : 'add';

                this.$el.html(this.tpl(data));
                if (this.mode === 'add') {
                    this.renderParentSystemList(data);
                }

                this.setDraggable();

                this.show();
            },

            renderParentSystemList: function (data) {
                var that = this,
                    optionList = [];

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('SystemNodeService', 'getSystemAllList', 'EmptyOMM'), {
                    success: function(response) {
                        response['SystemListOMM']['systemList'].forEach(function (item) {
                            optionList.push({
                                key: item['sysId'],
                                name: item['sysNm'] + ' (' + item['sysId'] + ')'
                            })
                        });
                        that.$el.find('select[data-form-param="parentSysId"]').html(commonUtil.getCommonCodeOptionTag(optionList, true, bxMsg('common.none')));
                    }
                });
            },

            saveItem: function() {
                var that = this,
                    operation,
                    requestParam,
                    $formWarp = this.$el.find('.bxm-form-wrap'),
                    formParam,
                    $askFormItems;

                // 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm($formWarp);

                // 필수값 체크
                $askFormItems = $formWarp.find('.asterisk');

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
                operation = (that.mode === 'edit') ? 'editSystem' : 'addSystem';
                requestParam = commonUtil.getBxmReqData(
                    'SystemNodeService', operation, 'SystemDetailOMM',
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
