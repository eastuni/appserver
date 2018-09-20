define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'text!views/batch/daemon-monitoring/_daemon-monitoring-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        tpl
    ) {

        var DaemonMonitoringView = Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            jobId: null,
            execNodeNo: null,
            jobStatusCd: null,

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadDaemonMonitoringList',
                'enter-component .daemon-monitoring-search input': 'loadDaemonMonitoringList',
                'change .daemon-monitoring-search select': 'loadDaemonMonitoringList',

                'click .detail-refresh-btn': 'refreshDetail',
                'click .reset-restart-btn': 'resetRestart',
                'click .control-daemon-btn': 'controlDaemon'
            },

            // 작업 상태
            jobStatusCdList: {
                'BOOTING': {text: 'Booting', icon: '<span class="fa-stack fa-lg"> <i class="fa fa-circle fa-stack-1x chr-c-yellow2"></i> <i class="fa fa-circle-o-notch fa-stack-1x fa-inverse"></i></span>'},
                'END_FAIL': {text: 'Fail', icon: '<i class="fa fa-exclamation-circle chr-c-black"></i>'},
                'RUN_WAIT': {text: 'Run Wait', icon: '<i class="fa fa-check-circle chr-c-green"></i>'},
                'RUN_PROC': {text: 'Running', icon: '<i class="fa fa-check-circle chr-c-blue"></i>'},
                'END_DONE': {text: 'Stop', icon: '<i class="fa fa-stop-circle chr-c-yellow"></i>'},
                'END_ERR': {text: 'Error', icon: '<i class="fa fa-exclamation-circle chr-c-orange"></i>'}
            },

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set Grid
                that.daemonMonitoringGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('BatchDaemonMonService', 'getDaemonMonList', 'BatchDaemonSearchConditionOMM'),
                        key: 'BatchDaemonSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'BatchDaemonMonListOMM',
                        key: 'batchDaemonMonList'
                    },
                    header: {
                        pageCount: true
                    },
                    paging: true,

                    fields: ['jobId', 'execNodeNo', 'jobNm', 'execNodeNo', 'jobStatusCd', 'procExecCnt', 'jobStartDttm', 'prevProcEndDttm', 'currProcStartDttm', 'jobCtrlCd'],
                    columns: [
                        {text: bxMsg('batch.work-id'), flex: 1, dataIndex: 'jobId', align: 'center'},
                        {text: bxMsg('batch.work-nm'), flex: 1, dataIndex: 'jobNm', align: 'center'},
                        {text: bxMsg('batch.execute-node-num'), width: 100, dataIndex: 'execNodeNo',  align: 'center'},
                        {
                            text: bxMsg('batch.work-state'), width: 100, dataIndex: 'jobStatusCd', align: 'center',
                            renderer: function(value) {
                                var jobStatusCdObj;

                                if(value) {
                                	jobStatusCdObj = that.jobStatusCdList[value];
                                } else {
                                	return '';
                                }
                                
                                return jobStatusCdObj.icon + ' ' + jobStatusCdObj.text;
                            }
                        },
                        {text: bxMsg('batch.process-execute-count'), width: 100, dataIndex: 'procExecCnt', align: 'center', cls: bxMsg.locale === 'en' && 'bx-grid-header-wrap'},
                        {text: bxMsg('batch.job-start-date'), width: 160, dataIndex: 'jobStartDttm', align: 'center'},
                        {text: bxMsg('batch.before-process-end-date'), width: 160, dataIndex: 'prevProcEndDttm', align: 'center'},
                        {text: bxMsg('batch.current-process-start-date'), width: 160, dataIndex: 'currProcStartDttm', align: 'center'}
                    ],
                    listeners: {
                        select : function(_this, record) {
                            that.loadDaemonMonitoring({
                                jobId: record.get('jobId'),
                                execNodeNo: record.get('execNodeNo')
                            });
                        }
                    }
                });

                // Dom Element Cache
                that.$daemonMonitoringSearch = that.$el.find('.daemon-monitoring-search');
                that.$daemonMonitoringGrid = that.$el.find('.daemon-monitoring-grid');
                that.$daemonMonitoringDetail = that.$el.find('.daemon-monitoring-detail');
                that.$daemonMonitoringDetailTitle = that.$el.find('h3 > .daemon-monitoring-detail-title');
                that.$daemonMonitoringRunningIcon = that.$daemonMonitoringDetail.find('.bw-status>.img-area>.batch-daemon-running-icon');
            },

            render: function() {
                var that = this;

                that.renderSelectFilter();
                that.$daemonMonitoringGrid.html(that.daemonMonitoringGrid.render(function(){that.loadDaemonMonitoringList();}));
                that.$daemonMonitoringDetail.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            renderSelectFilter: function() {
                var that = this,
                    requestParam,
                    jobStatusCd,
                    optionList = [],
                    option;

                //// 실행 노드 번호 ////
                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData('BatchDaemonMonService', 'getNodeNumList', 'EmptyOMM');

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var optionList = [];

                        response.BatchDaemonMonListOMM.batchDaemonMonList.forEach(function(batchDaemonMon) {
                            var option = '<option value="' + batchDaemonMon.execNodeNo+ '">' +
                                            batchDaemonMon.execNodeNo +
                                        '</option>';

                            optionList.push(option);
                        });

                        that.$daemonMonitoringSearch.find('select[data-form-param="execNodeNo"]').append(optionList);
                    }
                });

                //// 작업상태 ////
                for(jobStatusCd in that.jobStatusCdList){
                    if(that.jobStatusCdList.hasOwnProperty(jobStatusCd)){
                        option = '<option value="' + jobStatusCd + '">' +
                                        that.jobStatusCdList[jobStatusCd]['text'] +
                                    '</option>';

                        optionList.push(option);
                    }
                }

                that.$daemonMonitoringSearch.find('select[data-form-param="jobStatusCd"]').append(optionList);
            },

            resetSearch: function() {
                this.$daemonMonitoringSearch.find('[data-form-param]').val('');
            },

            loadDaemonMonitoringList: function() {
            	var that = this,
            		params = commonUtil.makeParamFromForm(this.$daemonMonitoringSearch);
            	
                this.daemonMonitoringGrid.loadData(params, function(data) {
                	data = data['batchDaemonMonList'];
                	if(data && data.length) {
                		that.$daemonMonitoringGrid.find('tbody tr:first-child').click();
                	}else {
                		that.$daemonMonitoringDetail.find('[data-form-param]').val('');
                		that.$daemonMonitoringDetail.find('[data-form-param="jobStatusCd"]').html('');
                		that.$daemonMonitoringDetailTitle.text('');
                	}
                }, true);
            },

            /**
             * jobId,
             * execNodeNo
             * */
            loadDaemonMonitoring: function(param) {
                var that = this,
                    requestParam;

                that.jobId = param.jobId;
                that.execNodeNo = param.execNodeNo;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'BatchDaemonMonService', 'getDaemonMonInfo', 'BatchDaemonMonOMM',
                    {
                        jobId: param.jobId,
                        execNodeNo: param.execNodeNo
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var batchDaemonMonOMM = response.BatchDaemonMonOMM;

                        that.$daemonMonitoringDetailTitle.text(batchDaemonMonOMM.jobId);
                        commonUtil.makeFormFromParam(that.$daemonMonitoringDetail, batchDaemonMonOMM);

                        // save 작업상태
                        that.jobStatusCd = batchDaemonMonOMM.jobStatusCd;

                        // render 작업상태
                        that.renderJobStatusCd(batchDaemonMonOMM.jobStatusCd);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },

            refreshDetail: function() {
                var that = this,
                    requestParam;

                if(!that.jobId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'BatchDaemonMonService', 'refreshDaemonMon', 'BatchDaemonMonOMM',
                    {
                        jobId: that.jobId,
                        execNodeNo: that.execNodeNo
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var batchDaemonMonOMM = response.BatchDaemonMonOMM;

                        //jobStatusCd 작업상태 REFRESH
                        that.renderJobStatusCd(batchDaemonMonOMM.jobStatusCd);

                        //procExecCnt 처리실행수 REFRESH
                        that.$daemonMonitoringDetail.find('[data-form-param="procExecCnt"]').val(batchDaemonMonOMM.procExecCnt);

                        //restartCnt 재기동수 REFRESH
                        that.$daemonMonitoringDetail.find('[data-form-param="restartCnt"]').val(batchDaemonMonOMM.restartCnt);

                        //currProcStartDttm 현재처리시작일시 REFRESH
                        that.$daemonMonitoringDetail.find('[data-form-param="currProcStartDttm"]').val(batchDaemonMonOMM.currProcStartDttm);

                        //prevProcStartDttm 직전처리시작일시 REFRESH
                        that.$daemonMonitoringDetail.find('[data-form-param="prevProcStartDttm"]').val(batchDaemonMonOMM.prevProcStartDttm);

                        //prevProcEndDttm 직전처리종료일시 REFRESH
                        that.$daemonMonitoringDetail.find('[data-form-param="prevProcEndDttm"]').val(batchDaemonMonOMM.prevProcEndDttm);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },

            renderJobStatusCd: function(jobStatusCd) {
                var jobStatusCdObj = this.jobStatusCdList[jobStatusCd];

                // 상세 항목 작업 상태 표시
                jobStatusCdObj && this.$daemonMonitoringDetail.find('[data-form-param="jobStatusCd"]').html(jobStatusCdObj['icon'] + ' ' +jobStatusCdObj['text']);

                // Running 상태면 아이콘 돌아가도록 처리
                if(jobStatusCd === 'RUN_PROC' || jobStatusCd === 'RUN_WAIT') {
                    this.$daemonMonitoringRunningIcon.addClass('fa-spin');
                }else{
                    this.$daemonMonitoringRunningIcon.removeClass('fa-spin');
                }
            },

            resetRestart: function() {
                var that = this,
                    requestParam;

                if(!that.jobId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'BatchDaemonMonService', 'resetRestartCnt', 'BatchDaemonMonOMM',
                    {
                        jobId: that.jobId,
                        execNodeNo: that.execNodeNo
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            that.$daemonMonitoringDetail.find('[data-form-param="restartCnt"]').val(0);
                        }else{
                            swal({type: 'error', title: '', text: bxMsg('batch.fail-reset-restart-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },

            controlDaemon: function(e) {
                var that = this,
                    requestParam,
                    jobCtrlCd;

                if(!that.jobId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                jobCtrlCd = $(e.currentTarget).attr('data-code');

                swal({
                        title: '', text: jobCtrlCd + bxMsg('common.msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        // 요청 객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'BatchDaemonMonService', 'controlDaemonBtn', 'BatchDaemonMonOMM',
                            {
                                jobId: that.jobId,
                                execNodeNo: that.execNodeNo,
                                jobStatusCd: that.jobStatusCd,
                                jobCtrlCd: jobCtrlCd
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 600){
                                    commonUtil.closeTooltip();
                                    swal({type: 'success', title: '', text: bxMsg('batch.success-batch-control-msg') + '(' + jobCtrlCd + ')', timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }else if(code === 601){
                                    swal({type: 'error', title: '', text: bxMsg('batch.fail-batch-control-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }else if(code === 602){
                                    swal({type: 'error', title: '', text:  bxMsg('batch.fail-batch-control-msg2'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    }
                );
            }
        });

        return DaemonMonitoringView;
    }
);