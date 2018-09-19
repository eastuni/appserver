define(
    [
        'common/util',
        'common/component/popup/popup',
        'text!common/main/biz-date-detail-popup-tpl.html'
    ],
    function(
        commonUtil,
        Popup,
        tpl
    ) {

        return Popup.extend({
            className: 'md-biz-date',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .ok-btn': 'close'
            },

            initialize: function() {},

            render: function() {
                var that = this;
                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('BizDateService', 'getBizDate', 'EmptyOMM'), {
                    success: function(response) {
                        var formData = response.BizDateOMM;
                        
                        if(!$.isEmptyObject(formData)) {
                        	formData.day_of_week = bxMsg("common.days-of-week")[formData.daywTypeCd];
                        }
                        
                        that.$el.html(that.tpl(formData));

                        that.setDraggable();
                        that.show();
                    }
                });
            }
        });
    }
);
