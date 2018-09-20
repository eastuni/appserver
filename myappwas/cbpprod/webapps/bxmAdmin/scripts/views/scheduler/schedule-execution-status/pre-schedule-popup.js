define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/component/popup/popup',
        'text!views/scheduler/schedule-execution-status/pre-schedule-popup-tpl.html'
    ],
    function(
        commonUtil,
        ExtGrid,
        Popup,
        tpl
    ) {
        return Popup.extend({
            className: 'md-small',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .cancel-btn': 'close'
            },

            initialize: function() {
                var that = this;

                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ExecutionStatusService', 'getPreScheduleList', 'ExecutionStatusInOMM'),
                        key: 'ExecutionStatusInOMM'
                    },
                    responseParam: {
                        objKey: 'ExecutionStatusPreJobListOMM',
                        key: 'preJobList'
                    },
                    header: {
                        pageCount: true
                    },

                    fields: ['preScheduleId', 'preScheduleNm', 'preWorkCheckCd'],
                    columns: [
                        {text: bxMsg('scheduler.pre-schedule-id'), flex: 2, dataIndex: 'preScheduleId', align: 'center'},
                        {text: bxMsg('scheduler.pre-schedule-nm'), fslex: 2, dataIndex: 'preScheduleNm', align: 'center'},
                        {text: bxMsg('scheduler.pre-job-check'), flex: 3, dataIndex: 'preWorkCheckCd', align: 'center'}
                    ],
                    paging: true,
                    gridToggle: false,
                    pageCountList: [5, 10, 20]
                });

                that.$el.html(that.tpl());
                that.$el.find('.bxm-popup-grid-wrap').html(that.grid.render());
            },

            render: function(data) {
                var that = this;

                that.grid.loadData(data, null, true);
                that.setDraggable();

                that.show();
            }
        });
    }
);
