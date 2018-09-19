define(
    [
        'common/util',
        'common/component/popup/popup',
        'text!views/scheduler/dashboard/event-detail-popup-tpl.html'
    ],
    function(
        commonUtil,
        Popup,
        tpl
    ) {
        return Popup.extend({

            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .cancel-btn': 'close'
            },

            initialize: function() {},

            render: function(data, sysNm) {
                this.$el.html(this.tpl());
                this.$bxmFormWrap = this.$el.find('.bxm-form-wrap');

                this.renderCode(data, sysNm);

                this.setDraggable();
                this.show();
            },

            renderCode: function(data, sysNm) {
                var that = this,
                    requestParam;

                // Schedule Registration Status
                requestParam = commonUtil.getBxmReqData(
                    'ScheduleDashBoardService', 'getEventPopupInfo', 'DashBoardInOMM',
                    data
                );

                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                    	var responseData = response.DashBoardEventOMM;
                    	
                    	responseData.sysId = sysNm;
                    	responseData.occurDttm = commonUtil.changeStringToFullTimeString(responseData.occurDttm);
                    	commonUtil.makeFormFromParam(that.$bxmFormWrap, responseData);
                    }
                });
            }
        });
    }
);
