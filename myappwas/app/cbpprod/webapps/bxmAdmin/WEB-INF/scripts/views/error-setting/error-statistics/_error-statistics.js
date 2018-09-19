define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/online/online-log-search/popup/trx-code-select-popup',
        'text!views/error-setting/error-statistics/_error-statistics-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        TrxCodeSelectPopup,
        tpl
    ) {
        return Backbone.View.extend({
            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click #error-statistics-first-tab .reset-search-btn': 'resetSearch',
                'click #error-statistics-first-tab .search-btn': 'renderCharts',
                'change #error-statistics-first-tab input[data-form-param="occurDt"]': 'renderCharts',
                'change #error-statistics-first-tab input[data-form-param="bizDt"]': 'renderCharts',
                'click #error-statistics-first-tab .move-error-log-page': 'moveErrorLogPage',

                'click #error-statistics-second-tab .reset-search-btn': 'resetSearch2',
                'click #error-statistics-second-tab .search-btn': 'renderCharts2',
                'change #error-statistics-second-tab input[data-form-param="occurDtStart"]': 'renderCharts2',
                'change #error-statistics-second-tab input[data-form-param="occurDtEnd"]': 'renderCharts2',
                'change #error-statistics-second-tab input[data-form-param="bizDtStart"]': 'renderCharts2',
                'change #error-statistics-second-tab input[data-form-param="bizDtEnd"]': 'renderCharts2',
                'click #error-statistics-second-tab .move-error-log-page': 'moveErrorLogPage2',

                'click #error-statistics-last-tab .reset-search-btn': 'resetSearch3',
                'click #error-statistics-last-tab .search-btn': 'loadGrid',
                'change #error-statistics-last-tab input[data-form-param="occurDt"]': 'loadGrid',
                'change #error-statistics-last-tab input[data-form-param="bizDt"]': 'loadGrid',

                'click .trx-code-search-btn': 'showTrxCodeSearchPopup',
                'click .show-error-log-btn': 'moveErrorLogPage3',
                'click .event-grid .move-btn': 'loadErrorChart'
            },

            secondTabRendered: false,
            lastTabRendered: false,
            backgroundColor: [
                'rgb(148, 174, 10)', 'rgb(17, 95, 166)', 'rgb(166, 17, 32)', 'rgb(255, 136, 9)', 'rgb(255, 209, 62)',
                'rgb(166, 17, 135)', 'rgb(36, 173, 154)', 'rgb(124, 116, 116)', 'rgb(166, 97, 17)'
            ],
            backgroundColorLength: 9,

            initialize: function() {
                var that = this;


                // Sub Views
                that.subViews['firstTabLoadingBar'] = new LoadingBar();
                that.subViews['secondTabLoadingBar'] = new LoadingBar();
                that.subViews['lastTabLoadingBar'] = new LoadingBar();

                that.subViews['trxCodeSelectPopup'] = new TrxCodeSelectPopup();
                that.subViews['trxCodeSelectPopup'].on('select-trx-code', function(trxCode) {
                    that.$lastTabChartSearch.val(trxCode);
                    that.trxCd = trxCode;
                    that.chartParam = {cndtUid: that.cndtUid, occurDt: that.occurDt, bizDt: that.bizDt, trxCd: trxCode};

                    that.loadErrorChart();
                });

                that.errorEventGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ErrStatService', 'getList4CndtGrid', 'SearchBaseOMM'),
                        key: 'SearchBaseOMM'
                    },
                    responseParam: {
                        objKey: 'ErrEventCndtListOMM',
                        key: 'errEventCndtOmmList'
                    },
                    header: {
                        pageCount: true
                    },
                    paging: true,

                    fields: ['cndtUid', 'cndtNm', 'eventOccurCnt', 'trxTargetCd', 'errTargetCd', 'stdPerdCd', 'stdCnt', 'ctrlCd', 'useYn', 'trxCd', 'errCd', 'sqlErrCd'],
                    columns: [
                        {text: bxMsg('error-setting.condition-name'), flex: 1, dataIndex: 'cndtNm', align: 'center'},
                        {text: bxMsg('error-setting.event-frequency'), flex: 1, dataIndex: 'eventOccurCnt', align: 'center'},
                        {
                            text: bxMsg('error-setting.trading-target'), flex: 1, dataIndex: 'trxTargetCd', align: 'center',
                            renderer: function(value, p, record){
                                var returnStr = commonConfig['comCdList']['BXMDF0011'][value];

                                if(value === 'T'){
                                    returnStr = record.get('trxCd');
                                }

                                return returnStr;
                            }
                        },
                        {
                            text: bxMsg('error-setting.error-target'), flex: 1, dataIndex: 'errTargetCd', align: 'center',
                            renderer: function(value, p, record){
                                var returnStr = commonConfig['comCdList']['BXMDF0012'][value];

                                if(value === 'E'){
                                    returnStr = record.get('errCd');
                                }else if(value === 'S'){
                                    returnStr = record.get('sqlErrCd');
                                }

                                return returnStr;
                            }
                        },
                        {
                            text: bxMsg('error-setting.standard-period'), width: 160, dataIndex: 'stdPerdCd', align: 'center',
                            renderer: function(value){
                                return commonConfig['comCdList']['BXMDF0013'][value];
                            }
                        },
                        {text: bxMsg('error-setting.standard-count'), width: 160, dataIndex: 'stdCnt', align: 'center'},
                        {
                            text: bxMsg('error-setting.control-system'), width: 160, dataIndex: 'ctrlCd', align: 'center',
                            renderer: function(value){
                                return commonConfig['comCdList']['BXMDF0014'][value];
                            }
                        }
                    ],
                    listeners: {
                        select : function(_this, record) {
                            var cndtUid = record.get('cndtUid'),
                                occurDt = that.$lastTabSearchDt.val(),
                                bizDt = commonUtil.changeDateStringToString(that.$lastTabSearchDt2.val()),
                                trxCd = record.get('trxCd'),
                                trxTargetCd = record.get('trxTargetCd'),
                                chartWrap;

                            that.cndtUid = cndtUid;
                            that.occurDt = occurDt;
                            that.bizDt = bizDt;
                            that.trxCd = trxCd;
                            that.errCd = record.get('errCd');
                            that.sqlErrCd = record.get('sqlErrCd');

                            if(trxTargetCd === 'E'){
                                chartWrap = Ext.get(that.$lastTabChart);
                                chartWrap.first() && chartWrap.first().remove();

                                that.$lastTabChartSearchBtn.prop('disabled', false).show()
                            }else{
                                that.chartParam = {cndtUid: cndtUid, occurDt: occurDt, bizDt: bizDt, trxCd: trxCd};
                                that.loadErrorChart();

                                that.$lastTabChartSearchBtn.prop('disabled', true).hide();
                            }

                            that.$lastTabTitle.text(record.get('cndtNm'));
                            that.$lastTabChartSearch.val(trxCd);
                        }
                    }
                });

                that.eventGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ErrStatService', 'getList4CndtLogErr', 'LogErrOMM'),
                        key: 'LogErrOMM'
                    },
                    responseParam: {
                        objKey: 'LogErrListOMM',
                        key: 'logErrOmmList'
                    },
                    header: {
                        pageCount: false
                    },
                    paging: true,

                    fields: ['logOccurDttm', 'guid', 'trxCd', 'errCd', 'sqlErrCd'],
                    columns: [
                        {text: bxMsg('error-setting.occur-date'), flex: 1, dataIndex: 'logOccurDttm', align: 'center'},
                        {text: bxMsg('error-setting.guid'), flex: 1, dataIndex: 'guid', align: 'center'},
                        {text: bxMsg('error-setting.trading-code'), flex: 1, dataIndex: 'trxCd', align: 'center'},
                        {text: bxMsg('error-setting.error-code'), flex: 1, dataIndex: 'errCd', align: 'center'},
                        {text: bxMsg('error-setting.sql-error-code'), flex: 1, dataIndex: 'sqlErrCd', align: 'center'},
                        {
                            text: bxMsg('error-setting.detail'),
                            renderer: function(value, p, record){
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn show-error-log-btn" data-dttm="{0}" data-trx-cd="{1}" data-guid="{2}" data-err-cd="{3}" data-sql-err-cd="{4}" title="' + bxMsg('online.watch-error-log') + '">' +
                                    '<i class="bw-icon i-25 i-log-error"></i>' +
                                    '</button>',
                                    record.get('logOccurDttm'),
                                    record.get('trxCd') ? record.get('trxCd') : '',
                                    record.get('guid') ? record.get('guid') : '',
                                    record.get('errCd') ? record.get('errCd') : '',
                                    record.get('sqlErrCd') ? record.get('sqlErrCd') : ''
                                );

                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            tdCls: 'grid-icon-btn',
                            width: 40
                        }
                    ]
                });

                // Set Page
                that.$el.html(that.tpl());

                that.$firstTab = that.$el.find('#error-statistics-first-tab');
                that.$firstTabSearchDt = that.$firstTab.find('input[data-form-param="occurDt"]');
                that.$firstTabSearchDt2 = that.$firstTab.find('input[data-form-param="bizDt"]');
                that.$ErrorOccurCountByHourChart = that.$firstTab.find('.error-occur-count-by-hour-chart')[0];
                that.$ErrorOccurTop5TradingCodeChart = that.$firstTab.find('.error-occur-top5-trading-code-chart .bw-chart')[0];
                that.$ErrorOccurTop5ChannelCodeChart = that.$firstTab.find('.error-occur-top5-channel-code-chart .bw-chart')[0];
                that.$ErrorOccurTop5ErrorCodeChart = that.$firstTab.find('.error-occur-top5-error-code-chart .bw-chart')[0];
                that.$ErrorOccurTop5TradingCodeTable = that.$firstTab.find('.error-occur-top5-trading-code-chart table tbody');
                that.$ErrorOccurTop5ChannelCodeTable = that.$firstTab.find('.error-occur-top5-channel-code-chart table tbody');
                that.$ErrorOccurTop5ErrorCodeTable = that.$firstTab.find('.error-occur-top5-error-code-chart table tbody');

                that.$secondTab = that.$el.find('#error-statistics-second-tab');
                that.$secondTabSearchDtStart = that.$secondTab.find('input[data-form-param="occurDtStart"]');
                that.$secondTabSearchDtEnd = that.$secondTab.find('input[data-form-param="occurDtEnd"]');
                that.$secondTabSearchDtStart2 = that.$secondTab.find('input[data-form-param="bizDtStart"]');
                that.$secondTabSearchDtEnd2 = that.$secondTab.find('input[data-form-param="bizDtEnd"]');
                that.$ErrorOccurCountByDateChart = that.$secondTab.find('.error-occur-count-by-date-chart')[0];
                that.$ErrorOccurTop5TradingCodeChart2 = that.$secondTab.find('.error-occur-top5-trading-code-chart .bw-chart')[0];
                that.$ErrorOccurTop5ChannelCodeChart2 = that.$secondTab.find('.error-occur-top5-channel-code-chart .bw-chart')[0];
                that.$ErrorOccurTop5ErrorCodeChart2 = that.$secondTab.find('.error-occur-top5-error-code-chart .bw-chart')[0];
                that.$ErrorOccurTop5TradingCodeTable2 = that.$secondTab.find('.error-occur-top5-trading-code-chart table tbody');
                that.$ErrorOccurTop5ChannelCodeTable2 = that.$secondTab.find('.error-occur-top5-channel-code-chart table tbody');
                that.$ErrorOccurTop5ErrorCodeTable2 = that.$secondTab.find('.error-occur-top5-error-code-chart table tbody');

                that.$lastTab = that.$el.find('#error-statistics-last-tab');
                that.$lastTabSearchDt = that.$lastTab.find('input[data-form-param="occurDt"]');
                that.$lastTabSearchDt2 = that.$lastTab.find('input[data-form-param="bizDt"]');
                that.$lastTabGrid = that.$lastTab.find('.condition-grid');
                that.$lastTabGrid2 = that.$lastTab.find('.event-grid');
                that.$lastTabChart = that.$lastTab.find('.error-count-chart .bw-chart')[0];
                that.$lastTabChartSearch = that.$lastTab.find('input[data-form-param="trxCd"]');
                that.$lastTabChartSearchBtn = that.$lastTab.find('.trx-code-search-btn');
                that.$lastTabTitle = that.$lastTab.find('.condition-title');

                commonUtil.setDatePicker(that.$firstTabSearchDt, 'yy-mm-dd');
                commonUtil.setDatePicker(that.$firstTabSearchDt2, 'yy-mm-dd');
                commonUtil.setDatePicker(that.$secondTabSearchDtStart, 'yy-mm-dd');
                commonUtil.setDatePicker(that.$secondTabSearchDtEnd, 'yy-mm-dd');
                commonUtil.setDatePicker(that.$secondTabSearchDtStart2, 'yy-mm-dd');
                commonUtil.setDatePicker(that.$secondTabSearchDtEnd2, 'yy-mm-dd');
                commonUtil.setDatePicker(that.$lastTabSearchDt, 'yy-mm-dd');
                commonUtil.setDatePicker(that.$lastTabSearchDt2, 'yy-mm-dd');

                that.resetSearch();
                that.resetSearch2();
                that.resetSearch3();

                // tab menu 전환 기능
                that.$el.find(".tab-title li").click(function () {
                    that.$el.find(".tab-title li").removeClass("on-tab");
                    $(this).addClass("on-tab");
                    that.$el.find(".tabs").hide();
                    that.activeTab = $(this).attr("rel");
                    that.$el.find("#error-statistics-" + that.activeTab).show();

                    if (that.activeTab === 'second-tab') {
                        if (!that.secondTabRendered) {
                            that.renderCharts2();
                            that.secondTabRendered = true;
                        }
                    }

                    if (that.activeTab === 'last-tab') {
                        if (!that.lastTabRendered) {
                            that.loadGrid();
                            that.eventGrid.resizeGrid();
                            that.lastTabRendered = true;
                        }
                    }
                });
            },

            render: function() {
                this.$firstTab.append(this.subViews['firstTabLoadingBar'].render());
                this.$secondTab.append(this.subViews['secondTabLoadingBar'].render());
                this.$lastTab.append(this.subViews['lastTabLoadingBar'].render());

                this.$lastTabGrid.html(this.errorEventGrid.render());
                this.$lastTabGrid2.html(this.eventGrid.render());

                this.renderCharts();

                return this.$el;
            },

            resetSearch: function () {
                this.$firstTabSearchDt.datepicker('setDate', commonConfig.bizDate);
                this.$firstTabSearchDt2.datepicker('setDate', new Date());
            },

            resetSearch2: function () {
                var date,
                	strArr;

                if(commonConfig.bizDate) {
                	strArr =commonConfig.bizDate.split('-');
                	date = new Date(strArr[0], strArr[1] -1, strArr[2]);
                }
                
                this.$secondTabSearchDtEnd.datepicker('setDate', commonConfig.bizDate);
                date.setDate(date.getDate() - 15);
                this.$secondTabSearchDtStart.datepicker('setDate', date);

                date = new Date();
                this.$secondTabSearchDtEnd2.datepicker('setDate', date);
                date.setDate(date.getDate() - 15);
                this.$secondTabSearchDtStart2.datepicker('setDate', date);
            },

            resetSearch3: function () {
                this.$lastTabSearchDt.datepicker('setDate', commonConfig.bizDate);
                this.$lastTabSearchDt2.datepicker('setDate', new Date());
            },

            renderCharts: function () {
                var that = this,
                    occurDt = this.$firstTabSearchDt.val(),
                    bizDt = commonUtil.changeDateStringToString(this.$firstTabSearchDt2.val()),
                    d0 = $.Deferred(),
                    d1 = $.Deferred(),
                    d2 = $.Deferred(),
                    d3 = $.Deferred();

                that.subViews['firstTabLoadingBar'].show();

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('ErrStatService', 'getList4TmGraph', 'SearchBaseOMM', {
                    occurDt: occurDt,
                    bizDt: bizDt
                }), {
                    success: function(response) {
                        that.drawErrorOccurCountChart('ErrorOccurCountByHourChart', response['GraphListOMM']['graphOmmList'],
                            that.$ErrorOccurCountByHourChart,
                            function (value) {
                                return value + bxMsg('common.hour');
                            });
                        d0.resolve();
                    }
                });

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('ErrStatService', 'getList4TmTopTrxCd', 'SearchBaseOMM', {
                    occurDt: occurDt,
                    bizDt: bizDt
                }), {
                    success: function(response) {
                        var data = response['TopTrxCdListOMM']['topTrxCdOmmList'];

                        that.drawErrorOccurTop5CodeChart('ErrorOccurTop5TradingCodeChart', data, that.$ErrorOccurTop5TradingCodeChart, 'trxCd', 'errOccurCnt');

                        var htmlList = data.map(function (item) {
                            var returnStr = '<tr><td><b class="move-error-log-page cursor-pointer" data-type="trxCd" data-code="' + item['trxCd'] + '">' +
                                item['trxCd'] + '</b></td><td>' + commonUtil.convertNumberFormat(item['errOccurCnt']) + '</td></tr>';

                            return returnStr;
                        });
                        that.$ErrorOccurTop5TradingCodeTable.html(htmlList);

                        d1.resolve();
                    }
                });

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('ErrStatService', 'getList4TmTopChlTypeCd', 'SearchBaseOMM', {
                    occurDt: occurDt,
                    bizDt: bizDt
                }), {
                    success: function(response) {
                        var data = response['TopChlTypeCdListOMM']['topChlTypeCdOmmList'];

                        data.forEach(function(dataItem) {
                            if(!dataItem.chlTypeCd && dataItem.etc){
                                dataItem.chlTypeCd = dataItem.etc;
                            }
                        });

                        that.drawErrorOccurTop5CodeChart('ErrorOccurTop5ChannelCodeChart', data,
                            that.$ErrorOccurTop5ChannelCodeChart,
                            'chlTypeCd', 'errOccurCnt',
                            function(chlTypeCd) {return commonConfig.comCdList['BXMDT0001'][chlTypeCd]});

                        var htmlList = data.map(function (item) {
                            var returnStr = '<tr><td><b class="move-error-log-page cursor-pointer" data-type="chlTypeCd" data-code="' + item['chlTypeCd'] + '">' +
                                commonConfig.comCdList['BXMDT0001'][item['chlTypeCd']] + '</b></td><td>' + commonUtil.convertNumberFormat(item['errOccurCnt']) + '</td></tr>';

                            return returnStr;
                        });
                        that.$ErrorOccurTop5ChannelCodeTable.html(htmlList);

                        d2.resolve();
                    }
                });

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('ErrStatService', 'getList4TmTopErrCd', 'SearchBaseOMM', {
                    occurDt: occurDt,
                    bizDt: bizDt
                }), {
                    success: function(response) {
                        var data = response['TopErrCdListOMM']['topErrCdOmmList'];

                        that.drawErrorOccurTop5CodeChart('ErrorOccurTop5ErrorCodeChart', data,
                            that.$ErrorOccurTop5ErrorCodeChart,
                            'errCd', 'errOccurCnt');

                        var htmlList = data.map(function (item) {
                            var returnStr = '<tr><td><b class="move-error-log-page cursor-pointer" data-type="errCd" data-code="' + item['errCd'] + '">' +
                                item['errCd'] + '</b></td><td>' + commonUtil.convertNumberFormat(item['errOccurCnt']) + '</td></tr>';

                            return returnStr;
                        });
                        that.$ErrorOccurTop5ErrorCodeTable.html(htmlList);

                        d3.resolve();
                    }
                });


                // all deferred resolved
                $.when(d0, d1, d2, d3).done(function () {
                    that.subViews['firstTabLoadingBar'].hide();
                });
            },

            renderCharts2: function () {
                var that = this,
                    occurDtStart = this.$secondTabSearchDtStart.val(),
                    occurDtEnd = this.$secondTabSearchDtEnd.val(),
                    bizDtStart = commonUtil.changeDateStringToString(this.$secondTabSearchDtStart2.val()),
                    bizDtEnd = commonUtil.changeDateStringToString(this.$secondTabSearchDtEnd2.val()),
                    d0 = $.Deferred(),
                    d1 = $.Deferred(),
                    d2 = $.Deferred(),
                    d3 = $.Deferred();

                that.subViews['secondTabLoadingBar'].show();

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('ErrStatService', 'getList4DtGraph', 'SearchBaseOMM', {
                    occurDtStart: occurDtStart,
                    occurDtEnd: occurDtEnd,
                    bizDtStart: bizDtStart,
                    bizDtEnd: bizDtEnd
                }), {
                    success: function(response) {
                        that.drawErrorOccurCountChart('ErrorOccurCountByDateChart', response['GraphListOMM']['graphOmmList'],
                            that.$ErrorOccurCountByDateChart,
                            function (value) {
                                return value;
                            });
                        d0.resolve();
                    }
                });

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('ErrStatService', 'getList4DtTopTrxCd', 'SearchBaseOMM', {
                    occurDtStart: occurDtStart,
                    occurDtEnd: occurDtEnd,
                    bizDtStart: bizDtStart,
                    bizDtEnd: bizDtEnd
                }), {
                    success: function(response) {
                        var data = response['TopTrxCdListOMM']['topTrxCdOmmList'];

                        that.drawErrorOccurTop5CodeChart('ErrorOccurTop5TradingCodeChart2', data,
                            that.$ErrorOccurTop5TradingCodeChart2,
                            'trxCd', 'errOccurCnt');

                        var htmlList = data.map(function (item) {
                            var returnStr ='<tr><td><b class="move-error-log-page cursor-pointer" data-type="trxCd" data-code="' + item['trxCd'] + '">' + item['trxCd'] +
                                '</b></td><td>' + commonUtil.convertNumberFormat(item['errOccurCnt']) + '</td></tr>';

                            return returnStr;
                        });
                        that.$ErrorOccurTop5TradingCodeTable2.html(htmlList);

                        d1.resolve();
                    }
                });

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('ErrStatService', 'getList4DtTopChlTypeCd', 'SearchBaseOMM', {
                    occurDtStart: occurDtStart,
                    occurDtEnd: occurDtEnd,
                    bizDtStart: bizDtStart,
                    bizDtEnd: bizDtEnd
                }), {
                    success: function(response) {
                        var data = response['TopChlTypeCdListOMM']['topChlTypeCdOmmList'];

                        data.forEach(function(dataItem) {
                            if(!dataItem.chlTypeCd && dataItem.etc){
                                dataItem.chlTypeCd = dataItem.etc;
                            }
                        });

                        that.drawErrorOccurTop5CodeChart('ErrorOccurTop5ChannelCodeChart2', data,
                            that.$ErrorOccurTop5ChannelCodeChart2,
                            'chlTypeCd', 'errOccurCnt',
                            function(chlTypeCd) {return commonConfig.comCdList['BXMDT0001'][chlTypeCd]});

                        var htmlList = data.map(function (item) {
                            var returnStr = '<tr><td><b class="move-error-log-page cursor-pointer" data-type="chlTypeCd" data-code="' + item['chlTypeCd'] + '">' + commonConfig.comCdList['BXMDT0001'][item['chlTypeCd']] +
                                '</b></td><td>' + commonUtil.convertNumberFormat(item['errOccurCnt']) + '</td></tr>';

                            return returnStr;
                        });
                        that.$ErrorOccurTop5ChannelCodeTable2.html(htmlList);

                        d2.resolve();
                    }
                });

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('ErrStatService', 'getList4DtTopErrCd', 'SearchBaseOMM', {
                    occurDtStart: occurDtStart,
                    occurDtEnd: occurDtEnd,
                    bizDtStart: bizDtStart,
                    bizDtEnd: bizDtEnd
                }), {
                    success: function(response) {
                        var data = response['TopErrCdListOMM']['topErrCdOmmList'];

                        that.drawErrorOccurTop5CodeChart('ErrorOccurTop5ErrorCodeChart2', data,
                            that.$ErrorOccurTop5ErrorCodeChart2,
                            'errCd', 'errOccurCnt');

                        var htmlList = data.map(function (item) {
                            var returnStr ='<tr><td><b class="move-error-log-page cursor-pointer" data-type="errCd" data-code="' + item['errCd'] + '">' + item['errCd'] +
                                '</b></td><td>' + commonUtil.convertNumberFormat(item['errOccurCnt']) + '</td></tr>';

                            return returnStr;
                        });
                        that.$ErrorOccurTop5ErrorCodeTable2.html(htmlList);

                        d3.resolve();
                    }
                });


                // all deferred resolved
                $.when(d0, d1, d2, d3).done(function () {
                    that.subViews['secondTabLoadingBar'].hide();
                });
            },

            drawErrorOccurCountChart: function (charName, data, chartWrap, labelRenderer, callback) {
                var logOccurDttms = [],
                    errOccurCnts = [];

                data.map(function(dataItem) {
                    logOccurDttms.push(labelRenderer(dataItem.logOccurDttm));
                    errOccurCnts.push(dataItem.errOccurCnt);
                });

                this[charName] && this[charName].destroy();

                this[charName] = new Chart(chartWrap, {
                    type: 'line',
                    data: {
                        labels: logOccurDttms,
                        datasets: [{
                            label: bxMsg('error-setting.total-error-count'),
                            data: errOccurCnts,
                            backgroundColor: 'rgb(17, 95, 166)',
                            borderColor: 'rgb(17, 95, 166)',
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
                    }
                });

                callback && callback();
            },

            drawErrorOccurTop5CodeChart: function (charName, data, chartWrap, labelField, angleField, labelNameFn, callback) {
                var that = this,
                    labels = [],
                    datas = [],
                    colors = [],
                    realData = {},
                    totalCount = 0;

                data.forEach(function(dataItem) {
                    totalCount += dataItem[angleField];
                });

                data.map(function(dataItem, idx) {
                    var label = labelNameFn ? labelNameFn(dataItem[labelField]) : dataItem[labelField];
                    labels.push(label);

                    var data = (dataItem[angleField] / totalCount) * 100;
                    datas.push((data > 5) ? dataItem[angleField] : totalCount/20);

                    colors.push(that.backgroundColor[idx - (Math.floor(idx/that.backgroundColorLength) * that.backgroundColorLength)]);

                    realData[label] = dataItem[angleField];
                });

                this[charName] && this[charName].destroy();

                this[charName] = new Chart(chartWrap, {
                    type: 'pie',
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
                        legend: {
                            position: 'right'
                        },
                        tooltips: {
                            callbacks: {
                                label: function(tooltipItem) {
                                    var label = this._chart.data.labels[tooltipItem.index];
                                    return this._chart.data.labels[tooltipItem.index] + ": " + realData[label];
                                }
                            },
                        },
                    }
                });

                callback && callback();
            },

            loadGrid: function() {
                this.errorEventGrid.loadData({occurDt: this.$lastTabSearchDt.val(), bizDt: commonUtil.changeDateStringToString(this.$lastTabSearchDt2.val())}, null, true);
            },

            loadErrorChart: function(param) {
                var that = this;

                that.chartParam.pageCount = 10;
                that.chartParam.pageNum = (param && param.target) ? $(param.currentTarget).attr('data-id') : 1;

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('ErrStatService', 'getList4CndtGraph', 'SearchBaseOMM', that.chartParam), {
                    beforeSend: function() {
                        that.subViews['lastTabLoadingBar'].show();
                    },
                    success: function(response) {
                        that.drawCoditionErrorOccurCountChart(response, that.$lastTabChart);
                    },
                    complete: function() {
                        that.subViews['lastTabLoadingBar'].hide();
                    }
                });
            },

            loadEventList: function(param) {
                this.eventGrid.loadData(param, null, true);
            },

            showTrxCodeSearchPopup: function() {
                this.subViews['trxCodeSelectPopup'].render();
            },

            drawCoditionErrorOccurCountChart: function(data, chartWrap) {
                var that = this,
                    logOccurDttms = [],
                    errOccurCnts = [],
                    stdCnts = [],
                    colors = [],
                    borderWidths = [];

                data.GraphListOMM.graphOmmList.map(function(dataItem) {
                    logOccurDttms.push(dataItem.logOccurDttm + bxMsg('common.hour'));
                    errOccurCnts.push(dataItem.errOccurCnt);
                    stdCnts.push(data.GraphListOMM.stdCnt);
                    colors.push(dataItem.errEventOccurYn ? 'rgb(255, 54, 0)' : 'rgb(64, 71, 211)');
                    borderWidths.push(dataItem.errEventOccurYn ? 6 : 3);
                });

                this['CoditionErrorOccurCountChart'] && this['CoditionErrorOccurCountChart'].destroy();

                this['CoditionErrorOccurCountChart'] = new Chart(chartWrap, {
                    type: 'line',
                    data: {
                        labels: logOccurDttms,
                        datasets: [{
                            label: bxMsg('error-setting.total-error-count'),
                            data: errOccurCnts,
                            backgroundColor: 'rgb(64, 71, 211)',
                            borderColor: 'rgb(64, 71, 211)',
                            pointRadius: borderWidths,
                            pointHoverRadius: borderWidths,
                            pointBackgroundColor: colors,
                            pointBorderColor: colors,
                            fill: false,
                        },{
                            label: bxMsg('error-setting.standard-count'),
                            data: stdCnts,
                            backgroundColor: 'rgb(255, 54, 0)',
                            borderColor: 'rgb(255, 54, 0)',
                            fill: false,
                            pointRadius: 0,
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
                        onClick: function(e, chart) {
                            chart = chart[0]._chart;

                            var activePoints = chart.getElementsAtEvent(e);
                            var label = chart.data.labels[activePoints[0]._index].replace(bxMsg('common.hour'), '');

                            that.loadEventList({
                                logOccurDttm: that.occurDt + ' ' + label,
                                trxCd: that.trxCd,
                                errCd: that.errCd,
                                sqlErrCd: that.sqlErrCd
                            });
                        }
                    }
                });
            },

            moveErrorLogPage: function(e) {
                var $target = $(e.currentTarget),
                    pageParam = {logType: 'err'},
                    occurDt = this.$firstTabSearchDt.val(),
                    bizDt = this.$firstTabSearchDt2.val();

                pageParam[$target.attr('data-type')] = $target.attr('data-code');
                pageParam['errFromOccurDttm[0]'] = occurDt;
                pageParam['errToOccurDttm[0]'] = occurDt;
                pageParam['fromBizDate'] = bizDt;
                pageParam['toBizDate'] = bizDt;

                commonUtil.redirectRoutePage('MENU00101', pageParam);
            },

            moveErrorLogPage2: function(e) {
                var $target = $(e.currentTarget),
                    pageParam = {logType: 'err'},
                    occurDtStart = this.$secondTabSearchDtStart.val(),
                    occurDtEnd = this.$secondTabSearchDtEnd.val(),
                    bizDtStart = this.$secondTabSearchDtStart2.val(),
                    bizDtEnd = this.$secondTabSearchDtEnd2.val();

                pageParam[$target.attr('data-type')] = $target.attr('data-code');
                pageParam['errFromOccurDttm[0]'] = occurDtStart;
                pageParam['errToOccurDttm[0]'] = occurDtEnd;
                pageParam['fromBizDate'] = bizDtStart;
                pageParam['toBizDate'] = bizDtEnd;

                commonUtil.redirectRoutePage('MENU00101', pageParam);
            },

            moveErrorLogPage3: function(e) {
                var $target = $(e.currentTarget),
                    pageParam = {logType: 'err'},
                    dttm = $target.attr('data-dttm'),
                    trxCd = $target.attr('data-trx-cd'),
                    guid = $target.attr('data-guid'),
                    errCd = $target.attr('data-err-cd'),
                    sqlErrCd = $target.attr('data-sql-err-cd');

                pageParam['fromBizDate'] = dttm.substr(0, 10);
                pageParam['toBizDate'] = dttm.substr(0, 10);
                pageParam['errFromOccurDttm[0]'] = dttm.substr(0, 10);
                pageParam['errToOccurDttm[0]'] = dttm.substr(0, 10);
                pageParam['errFromOccurDttm[1]'] = dttm.substr(11, 5);
                pageParam['errToOccurDttm[1]'] = dttm.substr(11, 5);
                trxCd && (pageParam['trxCd'] = trxCd);
                guid && (pageParam['guid'] = guid);
                errCd && (pageParam['errCd'] = errCd);
                sqlErrCd && (pageParam['sqlErrCd'] = sqlErrCd);

                commonUtil.redirectRoutePage('MENU00101', pageParam);
            }
        });
    }
);
