define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'text!views/batch/before-image-search/_before-image-search-tpl.html',
        'text!views/batch/before-image-search/before-image-search-detail-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        tpl,
        detailTpl
    ) {

        var BeforeImageSearchView = Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl,
                'detailTpl': detailTpl
            },

            events: {
                'click .reset-search-btn': 'resetBeforeImageSearchList',
                'click .search-btn': 'loadBeforeImageSearchList',
                'enter-component .before-image-search-list-search input': 'loadBeforeImageSearchList',
                
                'change .reload-interval-select': 'changeReloadInterval',
                'click .refresh-btn': 'intervalLoad',
            },

            statisticsByTableChart: null,
            calibrationResultStatisticsChart: null,
            calibrationResultStatisticsChartMap: {
                okBefCnt: bxMsg('batch.normal-before-reflection'),
                okAftCnt: bxMsg('batch.normal-after-reflection'),
                errNoDataCnt: bxMsg('batch.error-no-data'),
                errManyDataCnt: bxMsg('batch.error-many-data'),
                errDupKeyCnt: bxMsg('batch.error-duplication-key'),
                errPartialSkipCnt: bxMsg('batch.error-partial-skip')
            },
            backgroundColor: [
                'rgb(148, 174, 10)', 'rgb(17, 95, 166)', 'rgb(166, 17, 32)', 'rgb(255, 136, 9)', 'rgb(255, 209, 62)',
                'rgb(166, 17, 135)', 'rgb(36, 173, 154)', 'rgb(124, 116, 116)', 'rgb(166, 97, 17)'
            ],
            backgroundColorLength: 9,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                that.subViews['detailLoadingBar'] = new LoadingBar();
                that.subViews['statisticsByTableChartLoadingBar'] = new LoadingBar();
                that.subViews['calibrationResultStatisticsChartLoadingBar'] = new LoadingBar();

                // Set Grid
                that.beforeImageSearchStaticsGrid = new ExtGrid({
                	clr: 'two-row-header-table',	
                    fields: ['tableNm', 'totalCnt', 'okBefCnt', 'okAftCnt', 'errNoDataCnt', 'errManyDataCnt', 'errDupKeyCnt', 'errPartialSkipCnt', 'percent'],
                    columns: [
                        {
                            text: bxMsg('batch.table-name'), flex: 2, dataIndex: 'tableNm', align: 'center',
                            renderer: function(value, p, record) {
                                var returnValue = (record.get('tableNm') === 'Total') ? '<b>'+ value +'</b>' : value;

                                return returnValue;
                            }
                        },
                        {
                            text: bxMsg('batch.total'), flex: 0.7, dataIndex: 'totalCnt', align: 'center',
                            renderer: function(value, p, record) {
                                var returnValue = (record.get('tableNm') === 'Total') ? '<b>'+ value +'</b>' : value;

                                return returnValue;
                            }
                        },
                        {
                        	text: bxMsg('batch.normal'), align: 'center',
                        	columns: [
								{
								    text: bxMsg('batch.normal-before-reflection'), width: 110, dataIndex: 'okBefCnt', align: 'center',
								    renderer: function(value, p, record) {
								        var returnValue = (record.get('tableNm') === 'Total') ? '<b>'+ value +'</b>' : value;
								
								        return returnValue;
								    }
								},
								{
								    text: bxMsg('batch.normal-after-reflection'),  width: 110, dataIndex: 'okAftCnt', align: 'center',
								    renderer: function(value, p, record) {
								        var returnValue = (record.get('tableNm') === 'Total') ? '<b>'+ value +'</b>' : value;
								
								        return returnValue;
								    }
								}     
                        	]
                        },
                        {
                        	text: bxMsg('batch.error'), align: 'center',
                        	columns: [
		                        {
		                            text: bxMsg('batch.error-no-data'), width: 110, dataIndex: 'errNoDataCnt', align: 'center',
		                            renderer: function(value, p, record) {
		                                var returnValue = (record.get('tableNm') === 'Total') ? '<b>'+ value +'</b>' : value;
		
		                                return returnValue;
		                            }
		                        },
		                        {
		                            text: bxMsg('batch.error-many-data'), width: 110, dataIndex: 'errManyDataCnt', align: 'center',
		                            renderer: function(value, p, record) {
		                                var returnValue = (record.get('tableNm') === 'Total') ? '<b>'+ value +'</b>' : value;
		
		                                return returnValue;
		                            }
		                        },
		                        {
		                            text: bxMsg('batch.error-duplication-key'), width: 110, dataIndex: 'errDupKeyCnt', align: 'center',
		                            renderer: function(value, p, record) {
		                                var returnValue = (record.get('tableNm') === 'Total') ? '<b>'+ value +'</b>' : value;
		
		                                return returnValue;
		                            }
		                        },
		                        {
		                            text: bxMsg('batch.error-partial-skip'), width: 110, dataIndex: 'errPartialSkipCnt', align: 'center',
		                            renderer: function(value, p, record) {
		                                var returnValue = (record.get('tableNm') === 'Total') ? '<b>'+ value +'</b>' : value;
		
		                                return returnValue;
		                            }
		                        }
	                        ]
                        }
                        /*,{
                            text: '%', flex: 1, dataIndex: 'percent', align: 'center',
                            renderer: function(value, p, record) {
                                value = '<u>'+ value +'</u>';
                                var returnValue = (record.get('tableNm') === 'Total') ? '<b>'+ value +'</b>' : value;

                                return returnValue;
                            }
                        }*/
                    ],
                    listeners: {
                        select : function(_this, record) {
                        	
                        	if(record.get('tableNm') !== 'Total') {
                        		commonUtil.makeFormFromParam(that.$beforeImageSearchListSearch, {tableNm: record.get('tableNm')});
                        		that.loadBeforeImageSearchList();
                        	} else {
                        		commonUtil.makeFormFromParam(that.$beforeImageSearchListSearch, {tableNm: ''});
                        		that.loadBeforeImageSearchList();
                        	}
                        }
                    }
                });

                that.beforeImageSearchListGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('BeforeImageService', 'getBeforeImageList', 'BeforeImageSearchOMM'),
                        key: 'BeforeImageSearchOMM'
                    },
                    responseParam: {
                        objKey: 'BeforeImageListOMM',
                        key: 'beforeImageList'
                    },
                    header: {
                        pageCount: true
                    },
                    paging: true,

                    fields: ['trxDt', 'tableNm', 'trxCd', 'guid', 'dataBefAftTypeCd', 'revertResultCd', 'orclRowId', 'procDttm', 'sqlTypeCd'],
                    columns: [
                        {
                            text: bxMsg('batch.table-name'), flex: 3, dataIndex: 'tableNm', align: 'center',
                            renderer: function(value, p, record) {
                                return '<u>'+ value +'</u>';
                            }
                        },
                        {text: bxMsg('batch.transaction-date'), flex: 1.5, dataIndex: 'trxDt', align: 'center',
                        	renderer: function(value) {
                        		return commonUtil.changeStringToDateString(value);
                        	}
                        },
                        {
                        	text: bxMsg('batch.before-and-after'), width: 100, dataIndex: 'dataBefAftTypeCd', align: 'center',
                        	renderer: function(value){
                        		return commonConfig.comCdList['BXMAD0032'][value];
                        	}
                        },
                        {
                            text: bxMsg('batch.sql-type'), width: 100, dataIndex: 'sqlTypeCd', align: 'center',
                            renderer: function(value){
                                return commonConfig.comCdList['BXMAD0033'][value];
                            }
                        },
                        {text: bxMsg('batch.transaction-code'), flex: 2, dataIndex: 'trxCd', align: 'center'},
                        {text: bxMsg('batch.guid'), flex: 4.5, dataIndex: 'guid', align: 'center',
                        	renderer: function(value) {
                        		return '<pre class="white-block-staging">'+ value +'</pre>';
                        	}
                        },
//                        {
//                            text: bxMsg('batch.processing-date'), flex: 1, dataIndex: 'procDttm', align: 'center',
//                            renderer: function(value){
//                                return commonUtil.changeStringToFullTimeString(value);
//                            }
//                        },
                        {text: bxMsg('batch.calibration-result'), flex: 1.5, dataIndex: 'revertResultCd', align: 'center',
                        	renderer: function(value) {
                        		return commonConfig.comCdList['BXMAD0031'][value];
                        	}
                        }
                    ],
                    listeners: {
                        select : function(_this, record) {
                            that.loadBeforeImageSearchDetail({
                                tableNm: record.get('tableNm'),
                                trxDt: record.get('trxDt'),
                                procDttm: record.get('procDttm'),
                                sqlTypeCd: record.get('sqlTypeCd'),
                                dataBefAftTypeCd: record.get('dataBefAftTypeCd'),
                                orclRowId: record.get('orclRowId')
                            });
                        }
                    }
                });

                // Dom Element Cache
                that.$headerWrap = that.$el.find('.header-wrap');
                that.trxDtSelect = that.$headerWrap.find('input[data-form-param="trxDt"]');
                that.$reloadIntervalSelect = that.$el.find('.reload-interval-select');
                
                that.$beforeImageSearchStaticsGrid = that.$el.find('.before-image-search-statics-grid');
                that.$beforeImageSearchListSearch = that.$el.find('.before-image-search-list-search');
                that.$beforeImageSearchListGrid = that.$el.find('.before-image-search-list-grid');
                that.$beforeImageSearchDetail = that.$el.find('.before-image-search-detail');
                that.$statisticsByTableChart = that.$el.find('.statistics-by-table-chart');
                that.$calibrationResultStatisticsChart = that.$el.find('.calibration-result-statistics-chart');
            },

            render: function() {
                var that = this;

                commonUtil.setDatePicker(that.trxDtSelect, 'yy-mm-dd');
                that.trxDtSelect.datepicker('setDate', new Date());

                commonUtil.setDatePicker(that.$beforeImageSearchListSearch.find('input[data-form-param="trxDt"]'), 'yy-mm-dd');
                that.$beforeImageSearchListSearch.find('input[data-form-param="trxDt"]').datepicker('setDate', new Date());
//                that.$beforeImageSearchListSearch.find('select[data-form-param="revertResultCd"]')
//                	.html(commonUtil.getCommonCodeOptionTag({'normal' : '정상', 'error' : '에러'}, true));
                
                that.$beforeImageSearchStaticsGrid.html(that.beforeImageSearchStaticsGrid.render());
                that.$beforeImageSearchListGrid.html(that.beforeImageSearchListGrid.render(function(){that.loadBeforeImageSearchList();}));
                that.$beforeImageSearchDetail.append(that.subViews['detailLoadingBar'].render());
                that.$el.find('.statistics-by-table-chart-wrap').append(that.subViews['statisticsByTableChartLoadingBar'].render());
                that.$el.find('.calibration-result-statistics-chart-wrap').append(that.subViews['calibrationResultStatisticsChartLoadingBar'].render());

                that.loadBeforeImageSearchStatics({trxDt : that.trxDtSelect.val().replace(/-/g,'')});

                return that.$el;
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
                that.loadBeforeImageSearchStatics({trxDt : that.trxDtSelect.val().replace(/-/g, '')});
            },
            
            loadBeforeImageSearchStatics: function(param) {
                var that = this,
                    requestParam;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'BeforeImageService', 'getBeforeImageStats', 'BeforeImageSearchOMM',
                    param
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['statisticsByTableChartLoadingBar'].show();
                        that.subViews['calibrationResultStatisticsChartLoadingBar'].show();
                        that.beforeImageSearchStaticsGrid.showGridLoadingBar();
                    },
                    success: function(response) {
                        var beforeImageStatsOMM = response.BeforeImageStatsOMM;

                        that.renderStatisticsByTableChart(beforeImageStatsOMM.statsForTable);
                        that.renderCalibrationResultStatisticsChart(beforeImageStatsOMM.statsForRevertCd);
                        that.beforeImageSearchStaticsGrid.setData(beforeImageStatsOMM.statsForTotal);
                    },
                    complete: function() {
                        that.subViews['statisticsByTableChartLoadingBar'].hide();
                        that.subViews['calibrationResultStatisticsChartLoadingBar'].hide();
                        that.beforeImageSearchStaticsGrid.hideGridLoadingBar();
                    }
                });
            },

            renderStatisticsByTableChart: function(data) {
                var that = this,
                    labels = [],
                    datas = [],
                    colors = [];

                data.map(function(dataItem, idx) {
                    labels.push(dataItem.tableNm);
                    datas.push(dataItem.count);
                    colors.push(that.backgroundColor[idx - (Math.floor(idx/that.backgroundColorLength) * that.backgroundColorLength)]);
                });

                if(that.statisticsByTableChart === null) {
                    that.statisticsByTableChart = new Chart(that.$statisticsByTableChart, {
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
                        }
                    });
                }else{
                    that.statisticsByTableChart.data.labels = labels;
                    that.statisticsByTableChart.data.datasets[0].data = datas;
                    that.statisticsByTableChart.data.datasets[0].backgroundColor = colors;
                    that.statisticsByTableChart.update();
                }
            },

            renderCalibrationResultStatisticsChart: function(data) {
                var that = this,
                    labels = [],
                    datas = [],
                    colors = [],
                    key;

                for(key in data) {
                    if(data.hasOwnProperty(key)){
                        labels.push(that.calibrationResultStatisticsChartMap[key]);
                        datas.push(data[key]);
                        colors.push((key.indexOf('ok') !== -1) ? 'rgb(63, 72, 204)' : 'rgb(240, 62, 70)');
                    }
                }

                if(that.calibrationResultStatisticsChart === null) {
                    that.calibrationResultStatisticsChart = new Chart(that.$calibrationResultStatisticsChart, {
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
                            }
                        }
                    });
                }else{
                    that.calibrationResultStatisticsChart.data.labels = labels;
                    that.calibrationResultStatisticsChart.data.datasets[0].data = datas;
                    that.calibrationResultStatisticsChart.data.datasets[0].backgroundColor = colors;
                    that.calibrationResultStatisticsChart.update();
                }
            },

            resetBeforeImageSearchList: function() {
                this.$beforeImageSearchListSearch.find('[data-form-param="trxDt"]').datepicker('setDate', new XDate().toString('yyyy-MM-dd'));
                this.$beforeImageSearchListSearch.find('[data-form-param]').val('');
            },

            loadBeforeImageSearchList: function() {
            	var params = commonUtil.makeParamFromForm(this.$beforeImageSearchListSearch);
            	
                this.beforeImageSearchListGrid.loadData({
                	tableNm: params.tableNm,
                	trxDt: params.trxDt.replace(/-/g, ''),
                	revertResultCd: params.revertResultCd
                	}, null, true);
            },

            loadBeforeImageSearchDetail: function(param) {
                var that = this,
                    requestParam;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'BeforeImageService', 'getBeforeImageInfo', 'BeforeImageOMM',
                    param
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var beforeImageOutOMM = response.BeforeImageOutOMM;

                        beforeImageOutOMM.trxDt = commonUtil.changeStringToDateString(beforeImageOutOMM.trxDt);
                        beforeImageOutOMM.procDttm = commonUtil.changeStringToFullTimeString(beforeImageOutOMM.procDttm);

                        commonUtil.makeFormFromParam(that.$beforeImageSearchDetail, beforeImageOutOMM);

                        that.$beforeImageSearchDetail.find('.change-data-detail').html(that.detailTpl(
                            $.extend({pkList: beforeImageOutOMM.pkColumnNmList.split(',')}, beforeImageOutOMM)
                        ));
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            }

        });

        return BeforeImageSearchView;
    }
);