define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'text!views/scheduler/schedule-execution-status/execution-parameter-popup-tpl.html'
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
                'click .cancel-btn': 'close'
            },

            renderData: {},

            initialize: function() {
                this.$el.html(this.tpl());
                this.$execParamCtt = this.$el.find('[data-form-param="execParamCtt"]');
            },

            render: function(data) {
                this.renderData = data;
                this.renderCode(data);

                this.setDraggable();
                this.show();
            },

            renderCode: function (data) {
                this.$execParamCtt.val(data['execParamCtt']);
            },

            saveItem: function () {
                var that = this,
                    params = {
                        scheduleDt: commonUtil.changeDateStringToString(that.renderData.scheduleDt),
                        sysId: that.renderData.sysId,
                        scheduleId: that.renderData.scheduleId,
                        schedulingCd: that.renderData.schedulingCd,
                        scheduleNo: that.renderData.scheduleNo.toString(),
                        execParamCtt: that.$execParamCtt.val()
                    },
                    requestParam = commonUtil.getBxmReqData(
                        'ExecutionStatusService', 'changeExecParamCtt', 'ExecutionStatusOMM',
                        params
                    );

                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            that.trigger('save-item');
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
