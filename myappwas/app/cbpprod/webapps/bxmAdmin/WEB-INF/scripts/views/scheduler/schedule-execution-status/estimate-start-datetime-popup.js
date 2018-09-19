define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'text!views/scheduler/schedule-execution-status/estimate-start-datetime-popup-tpl.html'
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
                'click .time-wrap .i-count-up': 'increaseTime',
                'click .time-wrap .i-count-down': 'decreaseTime',

                'click .save-btn': 'saveItem',
                'click .cancel-btn': 'close'
            },

            renderData: {},

            initialize: function() {
                this.$el.html(this.tpl());
                this.$searchWrap = this.$el.find('.search-wrap');
                this.$expectedStartDt = this.$searchWrap.find('input[data-form-param="expectedStartDt"]');
                this.$expectedStartTimeWrap = this.$searchWrap.find('.time-wrap');

                commonUtil.setDatePicker(this.$expectedStartDt, 'yy-mm-dd');

                // time input fields validation
                this.$el.find('.time-wrap input').on( "keydown", function( event ) {
                    commonUtil.validateInput(event, /^[0-9]{0,2}$/);
                });
            },

            render: function(data) {
                this.renderData = data;
                this.renderCode(data);

                this.setDraggable();
                this.show();
            },

            renderCode: function (data) {
                this.$expectedStartDt.datepicker('setDate', commonUtil.changeStringToDateString(data.expectedStartDt));
                this.setTimeWrap(data.expectedStartTime);
            },

            increaseTime: function (e) {
                var $target = $(e.currentTarget).parent().siblings('input'),
                    value = parseInt($target.val());

                switch ($target.attr('data-form-param')) {
                    case 'hour':
                        value = value + 1;
                        if (value > 23) value = 23;
                        break;
                    case 'minute':
                    case 'second':
                        value = value + 15;
                        if (value > 59) value = 59;
                        break;
                }

                $target.val(value);
            },

            decreaseTime: function (e) {
                var $target = $(e.currentTarget).parent().siblings('input'),
                    value = parseInt($target.val());

                switch ($target.attr('data-form-param')) {
                    case 'hour':
                        value = value - 1;
                        if (value < 0) value = 0;
                        break;
                    case 'minute':
                    case 'second':
                        value = value - 15;
                        if (value < 0) value = 0;
                        break;
                }

                $target.val(value);
            },

            convertTimeString: function (params) {
                return (params['hour'].length === 1 ? '0' + params['hour'] : params['hour']) +
                    (params['minute'].length === 1 ? '0' + params['minute'] : params['minute']) +
                    (params['second'].length === 1 ? '0' + params['second'] : params['second']);
            },

            setTimeWrap: function (timeString) {
                commonUtil.makeFormFromParam(this.$expectedStartTimeWrap, {
                    hour: timeString.substring(0, 2),
                    minute: timeString.substring(2, 4),
                    second: timeString.substring(4, 6)
                })
            },

            saveItem: function () {
                var that = this,
                    $searchWrap = that.$el.find('.search-wrap'),
                    formParams = commonUtil.makeParamFromForm($searchWrap),
                    params = {
                        currProcStatusCd: that.renderData.currProcStatusCd,
                        scheduleDt: commonUtil.changeDateStringToString(that.renderData.scheduleDt),
                        sysId: that.renderData.sysId,
                        scheduleId: that.renderData.scheduleId,
                        schedulingCd: that.renderData.schedulingCd,
                        scheduleNo: that.renderData.scheduleNo,
                        expectedStartDt: commonUtil.changeDateStringToString(formParams.expectedStartDt),
                        expectedStartTime: that.convertTimeString(formParams)
                    },
                    requestParam = commonUtil.getBxmReqData(
                        'ExecutionStatusService', 'changeExpectedStartDttm', 'ExecutionStatusOMM',
                        params
                    );

                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 1400){
                            swal({type: 'success', title: '', text: bxMsg('common.change-success'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            that.trigger('save-item');
                            that.close();
                        }else if(code === 1401 || code === 1402 || code === 1403){
                            swal({type: 'error', title: '', text: bxMsg('common.change-fail'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    }
                });
            }
        });
    }
);
