define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/popup/schedule-group-search/schedule-group-search',
        'common/popup/system-search/system-search',
        'text!views/scheduler/schedule-estimate-date/_schedule-estimate-date-tpl.html'
    ],
    function (commonUtil,
              commonConfig,
              ExtGrid,
              ScheduleGroupSearchPopup,
              SystemSearchPopup,
              tpl) {
        return Backbone.View.extend({
            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadList',
                'click .schedule-group-search-btn': 'showScheduleGroupSearchPopup',
                'click .system-search-btn': 'showSystemSearchPopup',
                'enter-component .bxm-search-wrap input': 'loadList'
            },

            initialize: function () {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Dom Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$gridWrap = that.$el.find('.bxm-grid-wrap');

                // Set SubViews
                that.subViews['scheduleGroupSearchPopup'] = new ScheduleGroupSearchPopup();
                that.subViews['scheduleGroupSearchPopup'].on('select-code', function (scheduleGrpId) {
                    that.$searchWrap.find('input[data-form-param="scheduleGrpId"]').val(scheduleGrpId);
                });

                that.subViews['systemSearchPopup'] = new SystemSearchPopup();
                that.subViews['systemSearchPopup'].on('select-code', function (sysId) {
                    that.$searchWrap.find('input[data-form-param="sysId"]').val(sysId);
                });

                // Set Grid
                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ExecuteExpectService', 'getScheduledList', 'ExecuteExpectInOMM'),
                        key: 'ExecuteExpectInOMM'
                    },
                    responseParam: {
                        objKey: 'ExecuteExpectListOMM',
                        key: 'scheduleList'
                    },
                    header: {
                        pageCount: true
                    },
                    paging: true,

                    fields: ['sysId', 'sysNm', 'scheduleId', 'scheduleNm', 'scheduleGrpId', 'scheduleGrpNm', 'prevExecDt', 'prevExecTime', 'expectedStartDt', 'expectedStartTime'],
                    columns: [
                        {
                            text: bxMsg('scheduler.system'), flex: 3, dataIndex: 'sysNm', align: 'center',
                            renderer: function (value, metaData, record) {
                                return value + '(' + record.get('sysId') + ')';
                            }
                        },
                        {text: bxMsg('scheduler.schedule-id'), flex: 2, dataIndex: 'scheduleId', align: 'center'},
                        {text: bxMsg('scheduler.schedule-nm'), flex: 3, dataIndex: 'scheduleNm', align: 'center'},
                        {
                            text: bxMsg('scheduler.schedule-group'), flex: 3, dataIndex: 'scheduleGrpNm', align: 'center',
                            renderer: function (value, metaData, record) {
                                return value + '(' + record.get('scheduleGrpId') + ')';
                            }
                        },
                        {
                            text: bxMsg('scheduler.previous-execution-datetime'), flex: 3, dataIndex: 'prevExecDt', align: 'center',
                            renderer: function (value, metaData, record) {
                                return value && commonUtil.changeStringToDateString(value) + ' ' + commonUtil.changeStringToTimeString(record.get('prevExecTime'));
                            }
                        },
                        {
                            text: bxMsg('scheduler.estimate-start-datetime'), flex: 3, dataIndex: 'expectedStartDt', align: 'center',
                            renderer: function (value, metaData, record) {
                                return value && commonUtil.changeStringToDateString(value) + ' ' + commonUtil.changeStringToTimeString(record.get('expectedStartTime'));
                            }
                        }
                    ]
                });
            },

            render: function () {
                var that = this;

                that.$gridWrap.html(this.grid.render(function(){that.loadList();}));
                return that.$el;
            },

            resetSearch: function () {
                this.$searchWrap.find('[data-form-param]').val('');
            },

            loadList: function () {
                this.grid.loadData(commonUtil.makeParamFromForm(this.$searchWrap), null, true);
            },

            showScheduleGroupSearchPopup: function () {
            	var sysId = this.$searchWrap.find('input[data-form-param="sysId"]').val();
            	
            	if (!sysId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.sys-id-first-warning'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }
            	
            	this.subViews['scheduleGroupSearchPopup'].render(sysId);
            },

            showSystemSearchPopup: function () {
                this.subViews['systemSearchPopup'].render();
            }
        });
    }
);