define(
    [
		'common/util',
		'common/config',
		'common/component/ext-grid/_ext-grid',
		'common/component/loading-bar/_loading-bar',
        'text!views/center-cut/dashboard/_dashboard-tpl.html'
    ],
    function(
    	commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        tpl
    ) {
        return Backbone.View.extend({

            tagName: 'section',
            className: 'dashboard center-cut',

            templates: {
                'tpl': tpl
            },

            events: {
                'change .transactionDateSelect': 'loadSysIdDependentData',
                'change .reload-interval-select': 'changeReloadInterval',
                'click .refresh-btn': 'intervalLoad'
            },

            LINE_COLORS: ['#4047D3', '#FF4600', '#FF0098', '#001BA6'],
            interval: 0,
            initialRender: false,
            sysId: null,
            processesPerServerChart: null,
            dailyTransactionsPerTaskChart: null,

            initialize: function() {
                var that = this;

                // Sub Views
                that.subViews['loadingBar'] = new LoadingBar();

                // Set Page
                that.$el.html(that.tpl()).addClass('bxm-db');
                that.$headerWrap = that.$el.find('.header-wrap');
                that.pcsnDtSelect = that.$headerWrap.find('input[data-form-param="pcsnDt"]');
                that.$reloadIntervalSelect = that.$el.find('.reload-interval-select');

                that.$processesPerServerChart = that.$el.find('.processesPerServerChart')[0];
                that.$dailyTransactionsPerTaskChart = that.$el.find('.dailyTransactionsPerTaskChart')[0];
                that.$parallelProcessStatusGrid = that.$el.find('.parallelProcessStatusGrid');
                // that.$alarmOccurrenceCasesGrid = that.$el.find('.alarmOccurrenceCasesGrid');
                that.$errorOccurrenceCasesGrid = that.$el.find('.errorOccurrenceCasesGrid');
                that.$keyLogsGrid = that.$el.find('.keyLogsGrid');
                // that.$monitoringStatusGrid = that.$el.find('.monitoringStatusGrid');


                that.parallelProcessStatusGrid = new ExtGrid({
                    pageCountDefaultVal: 5,
                    loadingBarAvailable: false,

                    fields: ['ccId', 'acptNo', 'tnNo', 'srvrId', 'pcsnPrcsCnt'],
                    columns: [
                        {text: bxMsg('centerCut.ccId'), flex: 1, dataIndex: 'ccId', align: 'center'},
                        {text: bxMsg('centerCut.registrationNo'), flex: 1, dataIndex: 'acptNo', align: 'center'},
                        {text: bxMsg('centerCut.turnNo'), flex: 1, dataIndex: 'tnNo', align: 'center'},
                        {text: bxMsg('centerCut.server'), flex: 1, dataIndex: 'srvrId', align: 'center'},
                        {text: bxMsg('centerCut.processCount'), flex: 1, dataIndex: 'pcsnPrcsCnt', align: 'center'}
                    ]
                });

                // that.alarmOccurrenceCasesGrid = new ExtGrid({
                //     pageCountDefaultVal: 5,
                //     loadingBarAvailable: false,
                //
                //     fields: ['ccId', 'acptNo', 'tnNo', 'alrmEltm', 'alrm'],
                //     columns: [
                //         {text: bxMsg('centerCut.ccId'), flex: 1, dataIndex: 'ccId', align: 'center'},
                //         {text: bxMsg('centerCut.registrationNo'), flex: 1, dataIndex: 'acptNo', align: 'center'},
                //         {text: bxMsg('centerCut.turnNo'), flex: 1, dataIndex: 'tnNo', align: 'center'},
                //         {text: bxMsg('centerCut.time'), flex: 1, dataIndex: 'alrmEltm', align: 'center'},
                //         {text: bxMsg('centerCut.alarmDetail'), flex: 2, dataIndex: 'alrm', align: 'center'}
                //     ]
                // });

                that.errorOccurrenceCasesGrid = new ExtGrid({
                    pageCountDefaultVal: 5,
                    loadingBarAvailable: false,

                    fields: ['ccId', 'acptNo', 'tnNo', 'ercsCntSum'],
                    columns: [
                        {text: bxMsg('centerCut.ccId'), flex: 1, dataIndex: 'ccId', align: 'center'},
                        {text: bxMsg('centerCut.registrationNo'), flex: 1, dataIndex: 'acptNo', align: 'center'},
                        {text: bxMsg('centerCut.turnNo'), flex: 1, dataIndex: 'tnNo', align: 'center'},
                        {
                            text: bxMsg('centerCut.errorCount'), flex: 1, dataIndex: 'ercsCntSum', align: 'center',
                            renderer: function (value) {
                                return '<span style="color: red; font-weight: bold;">' + value + '</span>';
                            }
                        }
                    ]
                });

                that.keyLogsGrid = new ExtGrid({
                    pageCountDefaultVal: 5,
                    loadingBarAvailable: false,

                    fields: ['ccId', 'acptNo', 'tnNo', 'logEltm', 'logCn'],
                    columns: [
                        {text: bxMsg('centerCut.ccId'), flex: 2, dataIndex: 'ccId', align: 'center'},
                        {text: bxMsg('centerCut.registrationNo'), flex: 1, dataIndex: 'acptNo', align: 'center'},
                        {text: bxMsg('centerCut.turnNo'), flex: 1, dataIndex: 'tnNo', align: 'center'},
                        {text: bxMsg('centerCut.time'), flex: 1.5, dataIndex: 'logEltm', align: 'center'},
                        {text: bxMsg('centerCut.logDetail'), flex: 4, dataIndex: 'logCn', align: 'center'}
                    ]
                });

                // that.monitoringStatusGrid = new ExtGrid({
                //     pageCountDefaultVal: 5,
                //     loadingBarAvailable: false,
                //
                //     fields: ['logEltm', 'logCn'],
                //     columns: [
                //         {text: bxMsg('centerCut.occurTime'), flex: 1, dataIndex: 'logEltm', align: 'center'},
                //         {text: bxMsg('centerCut.errorCount'), flex: 5, dataIndex: 'logCn', align: 'center'}
                //     ]
                // });
            },

            render: function() {
                var that = this,
                    d1 = $.Deferred(),
                    // d2 = $.Deferred(),
                    d3 = $.Deferred(),
                    d4 = $.Deferred();
                    // d5 = $.Deferred();
                this.initialRender = true;

                commonUtil.setDatePicker(that.pcsnDtSelect, 'yy-mm-dd');
                that.pcsnDtSelect.datepicker('setDate', commonConfig.bizDate);

                that.$parallelProcessStatusGrid.html(that.parallelProcessStatusGrid.render(function () {
                    d1.resolve();
                }));

                // that.$alarmOccurrenceCasesGrid.html(that.alarmOccurrenceCasesGrid.render(function () {
                //     d2.resolve();
                // }));

                that.$errorOccurrenceCasesGrid.html(that.errorOccurrenceCasesGrid.render(function () {
                    d3.resolve();
                }));

                that.$keyLogsGrid.html(that.keyLogsGrid.render(function () {
                    d4.resolve();
                }));

                // that.$monitoringStatusGrid.html(that.monitoringStatusGrid.render(function () {
                //     d5.resolve();
                // }));


                // all deferred resolved
                $.when(d1, d3, d4).done(function () {
                    that.changeReloadInterval();
                    that.intervalLoad();
                });

                that.$el.find('.md-db').append(that.subViews['loadingBar'].render());


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
                var that = this;

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('PZF3000', 'searchDashboard', 'PZF300001In', {
                    'pcsnDt': that.pcsnDtSelect.val().replace(/-/g, '')
                }, 'bxmAdminCC'), {
                    beforeSend: function() {
                        that.subViews['loadingBar'].show();
                    },
                    success: function(response) {
                        var data = response['PZF300001Out'];

                        that.drawProcessesPerServerChart(data['listProcessCnt']);
                        that.drawDailyTransactionsPerTaskChart(data['listMonthCnt']);
                        that.parallelProcessStatusGrid.loadData({}, null, true, data['listPara']);
                        // that.alarmOccurrenceCasesGrid.loadData({}, null, true, data['listAlarm']);
                        that.errorOccurrenceCasesGrid.loadData({}, null, true, data['listError']);
                        that.keyLogsGrid.loadData({}, null, true, data['listLog']);
                        // that.monitoringStatusGrid.loadData({}, null, true, data['listMonitor']);
                    },
                    complete: function() {
                        that.subViews['loadingBar'].hide();
                    }
                });
            },

            drawProcessesPerServerChart: function (data) {
                var that = this,
                    labels = [],
                    datas = [],
                    colors = [];

                data.map(function(dataItem) {
                    labels.push(dataItem.labl);
                    datas.push(dataItem.vl2);
                    colors.push('rgb(64, 71, 211)');
                });

                if(that.processesPerServerChart === null) {
                    that.processesPerServerChart = new Chart(that.$processesPerServerChart, {
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
                                        return "CCOnline: " + tooltipItem.yLabel;
                                    }
                                },
                            },
                        }
                    });
                }else{
                    that.processesPerServerChart.data.labels = labels;
                    that.processesPerServerChart.data.datasets[0].data = datas;
                    that.processesPerServerChart.data.datasets[0].backgroundColor = colors;
                    that.processesPerServerChart.update();
                }
            },

            drawDailyTransactionsPerTaskChart: function (data) {
                var that = this,
                    labels = [],
                    datas = [],
                    colors = [];

                data.map(function(dataItem) {
                    labels.push(dataItem.labl);
                    datas.push(dataItem.vl);
                    colors.push('rgb(148, 174, 10)');
                });

                if(that.dailyTransactionsPerTaskChart === null) {
                    that.dailyTransactionsPerTaskChart = new Chart(that.$dailyTransactionsPerTaskChart, {
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
                                        return bxMsg('centerCut.vl') + ': ' + tooltipItem.yLabel;
                                    }
                                },
                            },
                        },
                    });
                }else{
                    that.dailyTransactionsPerTaskChart.data.labels = labels;
                    that.dailyTransactionsPerTaskChart.data.datasets[0].data = datas;
                    that.dailyTransactionsPerTaskChart.data.datasets[0].backgroundColor = colors;
                    that.dailyTransactionsPerTaskChart.update();
                }
            }
        });
    }
);