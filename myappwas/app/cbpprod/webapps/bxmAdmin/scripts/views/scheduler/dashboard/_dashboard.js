define(
    [
		'common/util',
		'common/config',
		'common/component/ext-grid/_ext-grid',
		'common/component/loading-bar/_loading-bar',
        'views/scheduler/dashboard/event-detail-popup',
        'text!views/scheduler/dashboard/_dashboard-tpl.html'
    ],
    function(
    	commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        EventDetailPopup,
        tpl
    ) {
        return Backbone.View.extend({

            tagName: 'section',
            className: 'dashboard',

            templates: {
                'tpl': tpl
            },

            events: {
                'change .schedule-date-select': 'loadSysIdDependentData',
                'change .system-id-select': 'loadSysIdDependentData',
                'change .reload-interval-select': 'changeReloadInterval',
                'click .refresh-btn': 'intervalLoad',

                'change .event-occur-type-code-select': 'loadEventList',
                'change .importance-code-select': 'loadEventList',
                'change .event-max-count-select': 'loadEventList',
                'click .event-detail-btn': 'showEventDetailPopup',

                'change select[data-form-param="period"]': 'loadHourlyScheduleExecutionStatusChart'
            },

            LINE_COLORS: ['#4047D3', '#FF4600', '#FF0098', '#001BA6'],
            interval: 0,
            initialRender: false,
            sysId: null,
            executionCountPerNodeChart: null,
            jobStatusInProgressChart: null,
            hourlyScheduleExecutionStatusChart: null,

            initialize: function() {
                var that = this;

                // Sub Views
                that.subViews['loadingBar'] = new LoadingBar();
                that.subViews['hourlyScheduleChartLoadingBar'] = new LoadingBar();
                that.subViews['eventDetailPopup'] = new EventDetailPopup();

                // Set Page
                that.$el.html(that.tpl()).addClass('bxm-db');
                that.$scheduleDateSelect = that.$el.find('.schedule-date-select');
                that.$systemIdSelect = that.$el.find('.system-id-select');
                that.$reloadIntervalSelect = that.$el.find('.reload-interval-select');
                that.$eventMaxCountSelect = that.$el.find('.event-max-count-select');
                that.$importanceCodeSelect = that.$el.find('.importance-code-select');
                that.$eventOccurTypeSelect = that.$el.find('.event-occur-type-code-select');
                that.$scheduleRegistrationStatusWrap = that.$el.find('.schedule-registration-status-wrap');
                that.$jobStatusInProgressChartWrap = that.$el.find('.job-status-in-progress-chart')[0];
                that.$eventListGridWrap = that.$el.find('.event-list-grid-wrap');
                that.$executionCountPerNodeChartWrap = that.$el.find('.execution-count-per-node-chart')[0];
                that.$hourlyScheduleExecutionPeriodSelect = that.$el.find('[data-form-param="period"]');
                that.$hourlyScheduleExecutionStatusChart = that.$el.find('.hourly-schedule-execution-status-chart')[0];
                that.$hourlyStandardTime = that.$el.find('.hourly-standard-time');
                
                that.eventListGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ScheduleDashBoardService', 'getEventList', 'DashBoardInOMM'),
                        key: 'DashBoardInOMM'
                    },
                    responseParam: {
                        objKey: 'DashBoardEventListOMM',
                        key: 'eventList'
                    },
                    pageCountDefaultVal: 5,
                    loadingBarAvailable: false,

                    fields: ['occurDttm', 'occurTypeCd', 'sysId', 'scheduleId', 'alarmCd', 'importanceCd', 'sysNm', 'scheduleNm'],
                    columns: [
                        {
                            text: bxMsg('scheduler.occur-datetime'), flex: 3, dataIndex: 'occurDttm', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToFullTimeString(value);
                            }
                        },
                        {
                            text: bxMsg('scheduler.occur-type'), flex: 2, dataIndex: 'occurTypeCd', align: 'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMAD0027'][value];
                            }
                        },
                        {text: bxMsg('scheduler.system'), flex: 2, dataIndex: 'sysNm', align: 'center'},
                        {text: bxMsg('scheduler.schedule-id'), flex: 2, dataIndex: 'scheduleId', align: 'center'},
                        {text: bxMsg('scheduler.schedule-nm'), flex: 2, dataIndex: 'scheduleNm', align: 'center'},
                        {
                            text: bxMsg('scheduler.alarm-type'), flex: 2, dataIndex: 'alarmCd', align: 'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMAD0024'][value];
                            }
                        },
                        {
                            text: bxMsg('scheduler.priority'), flex: 2, dataIndex: 'importanceCd', align: 'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMAD0018'][value];
                            }
                        },
                        {
                            text: bxMsg('common.detail'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn bw-btn-txt event-detail-btn" data-sys-id="{0}" data-schedule-id="{1}" data-occur-dttm="{2}" data-occur-type-cd="{3}" data-sys-nm="{4}">' + bxMsg('common.detail') + '</button>',
                                    record.get('sysId'),
                                    record.get('scheduleId'),
                                    record.get('occurDttm'),
                                    record.get('occurTypeCd'),
                                    record.get('sysNm')
                                );
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            width: 50
                        }
                    ]
                });
            },

            render: function() {
                var that = this;
                this.initialRender = true;

                that.$eventListGridWrap.html(that.eventListGrid.render(function(){
                    that.changeReloadInterval();
                    that.intervalLoad();
                }));
                that.$el.find('.md-db').append(that.subViews['loadingBar'].render());
                that.$el.find('.hourly-schedule-chart-loading-bar').append(that.subViews['hourlyScheduleChartLoadingBar'].render());

                that.$importanceCodeSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0018'], true, bxMsg('scheduler.priority')));
                that.$eventOccurTypeSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0027'], true, bxMsg('scheduler.occur-type')));
                
                return this.$el;
            },

            changeReloadInterval: function(){
                var that = this,
                    reloadIntervalSelect = that.$reloadIntervalSelect.val();
                clearInterval(this.interval);

                if (!reloadIntervalSelect) return;

                that.interval = setInterval(function() {
                    if(that.$el.is(':visible')) {
                        that.intervalLoad();
                    }
                }, that.$reloadIntervalSelect.val());
            },

            intervalLoad: function() {
                var that = this,
                    deferredScheduleDate = $.Deferred(),
                    deferredSysId = $.Deferred(),
                    deferredExecutionCountPerNode = $.Deferred(),
                    prevSelectedItem = that.$systemIdSelect.val(),
                    optionList = [],
                    lastestDate = 0;

                that.subViews['loadingBar'].show();

                // Schedule Date
                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('ScheduleDashBoardService', 'getScheduleDate', 'EmptyOMM'), {
                    success: function(response) {
                        response['DashBoardScheduleDtOMM']['scheduleDt'].forEach(function (item) {
                            optionList.push('<option value="' + item + '">' +
                                commonUtil.changeStringToDateString(item) +
                                '</option>');

                            if (item > lastestDate) {
                                lastestDate = item;
                            }
                        });

                        that.$scheduleDateSelect.html(optionList).val(lastestDate);
                        deferredScheduleDate.resolve();
                    }
                });

                // load sysId
                commonUtil.requestBxmAjax(
                    commonUtil.getBxmReqData('ScheduleDashBoardService', 'getSystemList', 'EmptyOMM'),
                    {
                        success: function (response) {
                            that.$systemIdSelect
                                .html(commonUtil.getCommonCodeOptionTag(response['DashBoardSystemListOMM']['systemList'], true, bxMsg('common.all'), 'sysId', 'sysNm'))
                                .val(prevSelectedItem);

                            deferredSysId.resolve();
                        }
                    });

                // Execution Count per Node
                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('ScheduleDashBoardService', 'getExecCountPerNode', 'EmptyOMM'), {
                    success: function(response) {
                        that.drawExecutionCountPerNodeChart(
                            response['DashBoardExecCountListOMM']['execCountList'],
                            function () {
                                deferredExecutionCountPerNode.resolve();
                            }
                        );
                    }
                });


                // all deferred resolved
                $.when(deferredSysId,
                    deferredScheduleDate,
                    deferredExecutionCountPerNode).done(function () {
                    that.subViews['loadingBar'].hide();
                    that.loadSysIdDependentData();
                });
            },

            loadSysIdDependentData: function() {
                var that = this,
                    deferredScheduleRegistrationStatus = $.Deferred(),
                    deferredJobStatusInProgress = $.Deferred(),
                    deferredEventList = $.Deferred(),
                    deferredHourlyScheduleExecutionStatus = $.Deferred(),
                    selectedSysId = that.$systemIdSelect.val(),
                    requestParam;

                that.subViews['loadingBar'].show();

                // Schedule Registration Status
                requestParam = commonUtil.getBxmReqData(
                    'ScheduleDashBoardService', 'currentScheduleStatusCount', 'DashBoardInOMM',
                    {
                    	sysId: selectedSysId,
                        scheduleDt: that.$scheduleDateSelect.val()
                    }
                );

                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        commonUtil.makeFormFromParam(that.$scheduleRegistrationStatusWrap, response['DashBoardScheduleStatusOutOMM']);
                        deferredScheduleRegistrationStatus.resolve();
                    }
                });

                // Job Status in Progress
                requestParam = commonUtil.getBxmReqData(
                    'ScheduleDashBoardService', 'getExecJobStatistics', 'DashBoardInOMM',
                    {
                        sysId: selectedSysId,
                        scheduleDt: that.$scheduleDateSelect.val()
                    }
                );

                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        that.drawJobStatusInProgressChart(
                            response['DashBoardExecJobListOMM']['execJobStatusList'],
                            function () {
                                deferredJobStatusInProgress.resolve();
                            }
                        );
                    }
                });

                // Event List
                that.loadEventList(function () {
                    deferredEventList.resolve();
                });

                // Hourly Schedule Execution Status
                that.loadHourlyScheduleExecutionStatusChart(function () {
                    deferredHourlyScheduleExecutionStatus.resolve();
                }, true);


                // all deferred resolved
                $.when(deferredScheduleRegistrationStatus,
                    deferredJobStatusInProgress,
                    deferredEventList,
                    deferredHourlyScheduleExecutionStatus).done(function () {
                    that.subViews['loadingBar'].hide();
                })
            },

            loadEventList: function (callback) {
                var that = this;

                // the case call by change event
                if (!$.isFunction(callback)) {
                    that.eventListGrid.subViews['gridLoadingBar'].show();
                }
                that.eventListGrid.loadData({
                    sysId: that.$systemIdSelect.val(),
                    occurTypeCd: that.$eventOccurTypeSelect.val(),
                    importanceCd: that.$importanceCodeSelect.val(),
                    eventMaxCnt: that.$eventMaxCountSelect.val()
                }, function () {
                    if (!$.isFunction(callback)) {
                        that.eventListGrid.subViews['gridLoadingBar'].hide();
                    } else {
                        $.isFunction(callback) && callback();
                    }

                }, true);
            },

            loadHourlyScheduleExecutionStatusChart: function (callback, loadingBarDisable) {
                var that = this,
                    requestParam = commonUtil.getBxmReqData(
                        'ScheduleDashBoardService', 'getHourlyStatusStatistics', 'DashBoardInOMM',
                        {
                            period: that.$hourlyScheduleExecutionPeriodSelect.val(),
                            sysId: that.$systemIdSelect.val()
                        }
                    );

                if (!loadingBarDisable) {
                    that.subViews['hourlyScheduleChartLoadingBar'].show();
                }
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        that.drawHourlyScheduleExecutionStatusChart(
                            response['HourlyScheduleResultListOMM']['statResultList'],
                            function () {
                                if (!loadingBarDisable) {
                                    that.subViews['hourlyScheduleChartLoadingBar'].hide();
                                }
                                $.isFunction(callback) && callback();
                            }
                        );
                        
                        that.$hourlyStandardTime.text(' ('+ response.HourlyScheduleResultListOMM.currentTime +' 기준)');
                    }
                });
            },

            drawExecutionCountPerNodeChart: function (data, callback) {
                var that = this,
                    labels = [],
                    datas = [],
                    colors = [];

                data.map(function(dataItem) {
                    labels.push(dataItem.nodeNm);
                    datas.push(dataItem.execCount);
                    colors.push('rgb(64, 71, 211)');
                });

                if(that.executionCountPerNodeChart === null) {
                    that.executionCountPerNodeChart = new Chart(that.$executionCountPerNodeChartWrap, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                data: datas,
                                backgroundColor: colors,
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                xAxes: [{
                                    gridLines: {
                                        display: false
                                    },
                                    barPercentage: 0.2
                                }],
                                yAxes: [{
                                    ticks: {
                                        min: 0,
                                        callback: function(value, index, values) {
                                            if (Math.floor(value) === value) {
                                                return value;
                                            }
                                        }
                                    },
                                    gridLines: {
                                        color: "rgb(204, 204, 204)",
                                        borderDash: [2, 5],
                                    }
                                }]
                            },
                            legend: {
                                display: false
                            },
                            tooltips: {
                                callbacks: {
                                    label: function(tooltipItem) {
                                        return bxMsg('scheduler.execCount') + ": " + tooltipItem.yLabel;
                                    }
                                },
                            },
                        }
                    });
                }else{
                    that.executionCountPerNodeChart.data.labels = labels;
                    that.executionCountPerNodeChart.data.datasets[0].data = datas;
                    that.executionCountPerNodeChart.data.datasets[0].backgroundColor = colors;
                    that.executionCountPerNodeChart.update();
                }

                callback && callback();
            },

            drawJobStatusInProgressChart: function (data, callback) {
                var that = this,
                    scheduleIds = [],
                    pastEndTimeAvgs = [],
                    presentExecTimes = [],
                    tooltips = {};

                data.map(function(dataItem) {
                    scheduleIds.push(dataItem.scheduleId);
                    pastEndTimeAvgs.push(dataItem.pastEndTimeAvg);
                    presentExecTimes.push(dataItem.presentExecTime);

                    tooltips[dataItem.scheduleId] = [
                        bxMsg('scheduler.schedule-id') + ' : ' + dataItem['scheduleId'],
                        bxMsg('scheduler.schedule-type') + ' : ' + commonConfig.comCdList['BXMAD0014'][dataItem['schedulingCd']],
                        bxMsg('scheduler.schedule-no') + ' : ' + dataItem['scheduleNo']
                    ];
                });

                if(that.jobStatusInProgressChart === null) {
                    that.jobStatusInProgressChart = new Chart(that.$jobStatusInProgressChartWrap, {
                        type: 'bar',
                        data: {
                            labels: scheduleIds,
                            datasets: [{
                                label: bxMsg('scheduler.pastEndTimeAvg'),
                                data: pastEndTimeAvgs,
                                backgroundColor: 'rgb(64, 71, 211)',
                            },{
                                label: bxMsg('scheduler.presentExecTime'),
                                data: presentExecTimes,
                                backgroundColor: 'rgb(255, 0, 149)',
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                xAxes: [{
                                    gridLines: {
                                        display: false
                                    },
                                }],
                                yAxes: [{
                                    ticks: {
                                        min: 0,
                                        callback: function(value, index, values) {
                                            if (Math.floor(value) === value) {
                                                return value;
                                            }
                                        }
                                    },
                                    gridLines: {
                                        color: "rgb(204, 204, 204)",
                                        borderDash: [2, 5],
                                    }
                                }]
                            },
                            legend: {
                                position: 'right'
                            },
                            tooltips: {
                                callbacks: {
                                    beforeFooter: function(tooltipItem) {
                                        return tooltips[tooltipItem[0].xLabel][0];
                                    },
                                    footer: function(tooltipItem) {
                                        return tooltips[tooltipItem[0].xLabel][1];
                                    },
                                    afterFooter: function(tooltipItem) {
                                        return tooltips[tooltipItem[0].xLabel][2];
                                    },
                                },
                            },
                        }
                    });
                }else{
                    that.jobStatusInProgressChart.data.labels = scheduleIds;
                    that.jobStatusInProgressChart.data.datasets[0].data = pastEndTimeAvgs;
                    that.jobStatusInProgressChart.data.datasets[1].data = presentExecTimes;
                    that.jobStatusInProgressChart.update();
                }

                callback && callback();
            },

            drawHourlyScheduleExecutionStatusChart: function (data, callback) {
                var that = this,
                    statDttms = [],
                    okCnts = [],
                    errorCnts = [],
                    tooltips = {};

                data.map(function(dataItem) {
                    var statDttm = commonUtil.changeStringToTimeString(dataItem.statDttm.substring(8)).substring(0, 5);

                    statDttms.push(statDttm);
                    okCnts.push(dataItem.okCnt);
                    errorCnts.push(dataItem.errorCnt);

                    tooltips[statDttm] = dataItem.statDttm;
                });

                if(that.hourlyScheduleExecutionStatusChart === null) {
                    that.hourlyScheduleExecutionStatusChart = new Chart(that.$hourlyScheduleExecutionStatusChart, {
                        type: 'line',
                        data: {
                            labels: statDttms,
                            datasets: [{
                                label: bxMsg('scheduler.okCnt'),
                                data: okCnts,
                                backgroundColor: 'rgb(64, 71, 211)',
                                borderColor: 'rgb(64, 71, 211)',
                                fill: false,
                            },{
                                label: bxMsg('scheduler.errorCnt'),
                                data: errorCnts,
                                backgroundColor: 'rgb(255, 0, 149)',
                                borderColor: 'rgb(255, 0, 149)',
                                fill: false,
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                xAxes: [{
                                    gridLines: {
                                        display: false
                                    },
                                }],
                                yAxes: [{
                                    ticks: {
                                        min: 0,
                                        callback: function(value, index, values) {
                                            if (Math.floor(value) === value) {
                                                return value;
                                            }
                                        }
                                    },
                                    gridLines: {
                                        color: "rgb(204, 204, 204)",
                                        borderDash: [2, 5],
                                    }
                                }]
                            },
                            legend: {
                                position: 'right'
                            },
                            tooltips: {
                                callbacks: {
                                    footer: function(tooltipItem) {
                                        var datetime = tooltips[tooltipItem[0].xLabel];
                                        datetime = commonUtil.changeStringToFullTimeString(datetime);

                                        return bxMsg('common.time') + ": " + datetime;
                                    }
                                },
                            },
                        }
                    });
                }else{
                    that.hourlyScheduleExecutionStatusChart.data.labels = statDttms;
                    that.hourlyScheduleExecutionStatusChart.data.datasets[0].data = okCnts;
                    that.hourlyScheduleExecutionStatusChart.data.datasets[1].data = errorCnts;
                    that.hourlyScheduleExecutionStatusChart.update();
                }

                callback && callback();
            },

            showEventDetailPopup: function (e) {
                var $target = $(e.currentTarget);

                this.subViews['eventDetailPopup'].render({
                    sysId: $target.attr('data-sys-id'),
                    scheduleId: $target.attr('data-schedule-id'),
                    occurDttm: $target.attr('data-occur-dttm'),
                    occurTypeCd: $target.attr('data-occur-type-cd')
                }, $target.attr('data-sys-nm'))
            }
        });
    }
);