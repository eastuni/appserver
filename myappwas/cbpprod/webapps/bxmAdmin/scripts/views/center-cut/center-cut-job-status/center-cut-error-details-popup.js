define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/config',
        'common/component/popup/popup',
        'text!views/center-cut/center-cut-job-status/center-cut-error-details-popup-tpl.html'
    ],
    function(
        commonUtil,
        ExtGrid,
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
                'click .cancel-btn': 'close'
            },

            initialize: function() {},

            render: function(data) {
                this.data = data;
                this.$el.html(this.tpl());

                commonUtil.makeFormFromParam(this.$el.find('.bxm-popup-search'), data);
                this.loadMessages(data);

                this.setDraggable();
                this.show();
            },

            loadMessages: function(params) {
                var that = this,
                    requestParam;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'SCC1005', 'searchDetailCcutError', 'SCC100503In',
                    params,
                    'bxmAdminCC'
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        that.$el.find('[data-form-param="oputCn"]').val(response['SCC100503Out']['oputCn']);
                    }
                });
            }
        });
    }
);