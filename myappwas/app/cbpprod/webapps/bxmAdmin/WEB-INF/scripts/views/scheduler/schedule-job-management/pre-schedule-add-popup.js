define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/config',
        'common/component/popup/popup',
        'text!views/scheduler/schedule-job-management/pre-schedule-add-popup-tpl.html'
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
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadList',
                'enter-component .bxm-popup-search input': 'loadList',

                'click .save-btn': 'selectCode',
                'click .cancel-btn': 'close'
            },

            preScheduleList: [],
            gridData: {},

            initialize: function() {
                var that = this;

                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ScheduleInfoService', 'getPreSchedulePopupList', 'ScheduleInfoPopupInOMM'),
                        key: 'ScheduleInfoPopupInOMM'
                    },
                    responseParam: {
                        objKey: 'PreJobPopupListOMM',
                        key: 'preJobList'
                    },
                    header: {
                    },

                    fields: ['scheduleId', 'scheduleNm', 'scheduleGrpId', 'scheduleTypeCd', 'scheduleSubCd', 'schedule1Val', 'schedule2Val', 'schedule3Val'],
                    columns: [
                        {
                            text: '',
                            renderer: function (value, metaData, record) {
                                return Ext.String.format(
                                    '<input type="checkbox" name="checkboxItem" class="bw-input ipt-radio" data-form-param="scheduleId" data-value="{0}" />',
                                    record.get('scheduleId')
                                );
                            },
                            sortable: false,
                            authDisabled: true,
                            align: 'center',
                            flex: 1
                        },
                        {text: bxMsg('scheduler.schedule-id'), flex: 3, dataIndex: 'scheduleId', align: 'center'},
                        {text: bxMsg('scheduler.schedule-nm'), flex: 3, dataIndex: 'scheduleNm', align: 'center'},
                        {text: bxMsg('scheduler.schedule-group-id'), flex: 3, dataIndex: 'scheduleGrpId', align: 'center'},
                        {text: bxMsg('scheduler.schedule-type'), flex: 2, dataIndex: 'scheduleTypeCd', align: 'center',
                        	renderer: function (value) {
                                return commonConfig.comCdList['BXMAD0021'][value];
                            }
                        },
                        {text: bxMsg('scheduler.detail-type'), flex: 2, dataIndex: 'scheduleSubCd', align: 'center',
                        	renderer: function (value) {
                                return commonConfig.comCdList['BXMAD0022'][value];
                            }
                        },
                        {
                            text: bxMsg('scheduler.schedule-type-detail'), flex: 3, dataIndex: 'schedule1Val', align: 'center',
                            renderer: function (value, metaData, record) {
                                var scheduleSubCd = record.get('scheduleSubCd');

                                if (scheduleSubCd === 'WEEK') {
                                    value = commonUtil.convertStringToDaysOfWeek(value);
                                } else if (scheduleSubCd === 'YEAR') {
                                    value = commonUtil.convertStringToMonthAndDay(value);
                                }

                                return value;
                            }
                        }
                    ],
                    gridToggle: false,

                    listeners: {
                        itemclick: function(_this, record, item, idx) {
                            var $target = $( that.$el.find('input[name="checkboxItem"]')[idx] );
                            if ($target.attr('checked')) {
                                $target.attr("checked", false);
                            } else {
                                $target.attr("checked", true);
                            }
                        }
                    }
                });

                that.$el.html(that.tpl());
                that.$el.find('.bxm-popup-grid').html(that.grid.render());
                that.$searchWrap = that.$el.find('.bxm-popup-search');
            },

            render: function(data, sysId, typeInfo) {
                this.loadList(data, sysId, typeInfo);
                this.setDraggable();
                this.show();
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param]').val('');
            },

            loadList: function (data, sysId, typeInfo) {
                var that = this,
                    params = commonUtil.makeParamFromForm(this.$searchWrap),
                    preScheduleList = [];

                if (Array.isArray(data)) {
                    data.forEach(function (item) {
                        preScheduleList.push(item.preScheduleId);
                    });
                    that.preScheduleList = params.preScheduleList = preScheduleList;
                    that.sysId = params.sysId = sysId;
                } else {
                    params.preScheduleList = that.preScheduleList;
                    params.sysId = that.sysId;
                }

                $.extend(params, {
                    scheduleTypeCd: typeInfo.scheduleTypeCd,
                    scheduleSubCd: typeInfo.scheduleSubCd,
                    schedule1Val: typeInfo.schedule1Val
                });

                this.grid.loadData(params, function (data) {
                    that.gridData = data;

                    $('input[type="checkbox"][name="checkboxItem"]').on('click', function () {
                        var $target = $(this);
                        if ($target.attr('checked')) {
                            $target.attr("checked", false);
                        } else {
                            $target.attr("checked", true);
                        }
                    })
                }, true);
            },

            selectCode: function() {
                var dataObject = commonUtil.convertArrayToObject(this.gridData['preJobList'], 'scheduleId'),
                    gridData = commonUtil.makeParamFromForm(this.$el.find('.bxm-popup-grid')),
                    selectedObject = {};


                if (gridData['scheduleId']) {
                    commonUtil.makeParamFromForm(this.$el.find('.bxm-popup-grid'))['scheduleId'].forEach(function (item) {
                        selectedObject[item] = dataObject[item];
                    });
                }

                this.trigger('select-code', selectedObject);
                this.close();
            }
        });
    }
);