define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'common/popup/batch-job-log-detail/batch-job-log-detail',
        'common/popup/batch-user-log-detail/batch-user-log-detail',
        'views/batch/job-monitoring/job-popup',
        'views/batch/job-monitoring/job-step-popup',
        'text!views/batch/job-monitoring/_job-monitoring-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        JobLogPopup,
        UserLogPopup,
        JobPopup,
        JobStepPopup,
        tpl
    ) {
        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            jobExecutionId: null,
            frmInstanceId: null,
            jobInstanceId: null,
            jobId: null,
            jobTypeCd: null,
            execParamList: null,
            dupExecUseYn: null,
            status: null,

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadJobMonitoringList',
                'enter-component .job-monitoring-search input': 'loadJobMonitoringList',
                'change .job-monitoring-search select': 'loadJobMonitoringList',

                'click .search-work-id-btn': 'showJobPopup',
                'click .show-job-log-btn': 'showJobLogSelectionPopup',
                'click .show-user-log-btn': 'showUserLogPopup',

                'click .detail-refresh-btn': 'refreshDetail',
                'click .control-job-btn': 'controlJob',

                'click .step-detail-btn': 'showStepPopup',
                'click .step-refresh-btn': 'refreshStep'
            },

            // 작업 상태
            statusCdList: {
                'COMPLETED': {text: 'Completed', icon: '<i class="fa fa-check-circle chr-c-blue"></i>'},
                'FAILED': {text: 'Failed', icon: '<i class="fa fa-exclamation-circle chr-c-orange"></i>'},
                'STARTING': {text: 'Starting', icon: '<i class="fa fa-check-circle chr-c-green"></i>'},
                'STARTED': {text: 'Started', icon: '<i class="fa fa-check-circle chr-c-green"></i>'},
                'STOPPING': {text: 'Stopping', icon: '<i class="fa fa-stop-circle chr-c-yellow"></i>'},
                'STOPPED': {text: 'Stopped', icon: '<i class="fa fa-stop-circle chr-c-yellow"></i>'},
                'UNKNOWN': {text: 'Unknown', icon: '<i class="fa fa-question-circle chr-c-yellow2"></i>'},
                'ABANDONED': {text: 'Abandoned', icon: '<i class="fa fa-exclamation-circle chr-c-black"></i>'},
                'SUSPENDED': {text: 'Suspended', icon: '<i class="fa fa-stop-circle chr-c-yellow"></i>'}
            },

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['detailLoadingBar'] = new LoadingBar();
                that.subViews['jobPopup'] = new JobPopup();

                that.subViews['jobPopup'].on('select-job', function(jobId) {
                    that.$jobMonitoringSearch.find('[data-form-param="jobId"]').val(jobId);
                });

                that.subViews['jobLogPopup'] = new JobLogPopup();
                that.subViews['userLogPopup'] = new UserLogPopup();
                that.subViews['jobStepPopup'] = new JobStepPopup({statusCdList: that.statusCdList});

                // Set Grid
                that.jobMonitoringGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('BatchJobMonService', 'getJobMonList', 'BatchJobSearchConditionOMM'),
                        key: 'BatchJobSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'BatchJobMonListOMM',
                        key: 'batchJobMonList'
                    },
                    header: {
                        pageCount: true
                    },
                    paging: true,

                    fields: ['jobExecutionId', 'jobId', 'jobNm', 'status', 'startTime', 'endTime', 'elapsedMinutes', 'elapsedSeconds', 'stepCount', 'nodeName', 'cpuUseTime', 'cpuElapsedMinutes','cpuElapsedSeconds'],
                    columns: [
                        {text: bxMsg('batch.work-execute-id'), flex: 0.7, dataIndex: 'jobExecutionId', align: 'center'},
                        {text: bxMsg('batch.work-id'), flex: 1, dataIndex: 'jobId', align: 'center'},
                        {text: bxMsg('batch.work-nm'), flex: 1, dataIndex: 'jobNm',  align: 'center'},
                        {
                            text: bxMsg('batch.execute-state'), width: 100, dataIndex: 'status', align: 'center',
                            renderer: function(value) {
                                var statusCdObj = that.statusCdList[value];

                                return statusCdObj.icon + ' ' + statusCdObj.text;
                            }
                        },
                        {text: bxMsg('batch.start-date'), width: 160, dataIndex: 'startTime', align: 'center'},
                        {text: bxMsg('batch.end-date'), width: 160, dataIndex: 'endTime', align: 'center'},
                        {text: bxMsg('batch.elapsed-time'), flex: 1, dataIndex: 'elapsedSeconds', align: 'center',
                        	renderer: function(value, p, record) {
                        		var elapsedMinutes = record.get('elapsedMinutes');
                        		return elapsedMinutes + bxMsg('common.min') +' '+ value + bxMsg('common.second');
                        	}
                        },
                        {text: bxMsg('batch.cpu-use-time'), flex: 1, dataIndex: 'cpuElapsedSeconds', align: 'center',
                        	renderer: function(value, p, record) {
                        		var elapsedMinutes = record.get('cpuElapsedMinutes');
                        		return elapsedMinutes + bxMsg('common.min') +' '+ value + bxMsg('common.second');
                        	}
                        },
                        {text: bxMsg('batch.node-nm'), flex: 0.7, dataIndex: 'nodeName', align: 'center'},
                        {text: bxMsg('batch.step-count'), flex: 0.5, dataIndex: 'stepCount', align: 'center'},
                        {
                            text: bxMsg('batch.log'),
                            renderer: function (value, p, record) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn show-job-log-btn" data-job-execution-id="{0}" data-job-id="{1}" data-job-nm="{2}" data-status="{3}" title="' + bxMsg('common.job-log') + '">' +
                                        '<i class="bw-icon i-25 i-log-task"></i>' +
                                    '</button>' +
                                    '<button type="button" class="bw-btn show-user-log-btn" data-job-execution-id="{0}" data-job-id="{1}" data-job-nm="{2}" title="' + bxMsg('common.user-log') + '">' +
                                        '<i class="bw-icon i-25 i-log-error"></i>' +
                                    '</button>',
                                    record.get('jobExecutionId'),
                                    record.get('jobId'),
                                    record.get('jobNm'),
                                    record.get('status')
                                );
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            tdCls: 'grid-icon-btn',
                            width: 80
                        }
                    ],
                    listeners: {
                        beforecellmousedown: function(_this, td, cellIndex ) {
                            this.gridSelect = (cellIndex !== 7);
                        },
                        beforeselect: function() {
                            return this.gridSelect;
                        },
                        select : function(_this, record, idx, e) {
                            that.loadJobMonitoring({jobExecutionId: record.get('jobExecutionId')});
                        }
                    }
                });

                that.jobStepGrid = new ExtGrid({
                    fields: ['stepExecutionId', 'jobExecutionId', 'startTime', 'endTime', 'status', 'commitCount', 'readCount', 'writeCount', 'stepName', 'elapsedTime', 'cpuUseTime'],
                    columns: [
                        {text: bxMsg('batch.step-execution-id'), flex: 1.5, dataIndex: 'stepExecutionId', align: 'center'},
                        {text: bxMsg('batch.step-id'), flex: 2.5, dataIndex: 'stepName', align: 'center'},
                        {text: bxMsg('batch.start-date'), flex: 3.5, dataIndex: 'startTime', align: 'center'},
                        {text: bxMsg('batch.end-date'), flex: 3.5, dataIndex: 'endTime', align: 'center'},
                        {text: bxMsg('batch.elapsed-time'), flex: 1.5, dataIndex: 'elapsedTime', align: 'center',
                        	renderer: function(value) {
                        		if(value) {
                        			return value + bxMsg('common.second');
                        		} else {
                        			return value;
                        		}
                        	}
                        },
                        {text: bxMsg('batch.cpu-use-time'), flex: 1.5, dataIndex: 'cpuUseTime', align: 'center',
                        	renderer: function(value) {
                        		if(value) {
                        			return value + bxMsg('common.second');
                        		} else {
                        			return value;
                        		}
                        	}
                        },
                        {
                            text: bxMsg('batch.execute-state'), flex: 2, dataIndex: 'status', align: 'center',
                            renderer: function(value) {
                                var statusCdObj = that.statusCdList[value];

                                return statusCdObj.icon + ' ' + statusCdObj.text;
                            }
                        },
                        {
                            text: bxMsg('batch.detail'),
                            renderer: function (value, p, record) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn bw-btn-txt step-detail-btn" data-step-execution-id="{0}"> ' +
                                        bxMsg('batch.detail') +
                                    '</button>',
                                    record.get('stepExecutionId')
                                );
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            width: 50
                        },
                        {text: bxMsg('batch.commit-count'), flex: 1.4, dataIndex: 'commitCount', align: 'center',
                        	renderer: function(value) {
                        		return value ? commonUtil.convertNumberFormat(value) : value;
                        	}
                        },
                        {text: bxMsg('batch.read-count'), flex: 1.2, dataIndex: 'readCount', align: 'center',
                        	renderer: function(value) {
                        		return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : value;
                        	}	
                        },
                        {text: bxMsg('batch.write-count'), flex: 1.2, dataIndex: 'writeCount', align: 'center',
                        	renderer: function(value) {
                        		return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : value;
                        	}	
                        },
                        {
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn step-refresh-btn" data-step-execution-id="{0}" data-idx="{1}">' +
                                        '<i class="bw-icon i-20 i-func-refresh"></i>' +
                                    '</button>',
                                    record.get('stepExecutionId'),
                                    idx
                                );
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            width: 40
                        }
                    ]
                });

                // Dom Element Cache
                that.$jobMonitoringSearch = that.$el.find('.job-monitoring-search');
                that.$jobMonitoringGrid = that.$el.find('.job-monitoring-grid');
                that.$jobStepGrid = that.$el.find('.job-step-grid');
                that.$jobMonitoringDetail = that.$el.find('.job-monitoring-detail');
                that.$jobMonitoringDetailTitle = that.$el.find('h3 > .job-monitoring-title');
                that.$jobMonitoringRunningIcon = that.$jobMonitoringDetail.find('.bw-status>.img-area>.job-monitoring-running-icon');
                
            },

            render: function() {
                var that = this;

                // 작업일시 데이터피커 셋팅
                commonUtil.setDatePicker(that.$jobMonitoringSearch.find('input[data-form-param="fromStartTime[0]"]'), 'yy-mm-dd');
                commonUtil.setDatePicker(that.$jobMonitoringSearch.find('input[data-form-param="toStartTime[0]"]'), 'yy-mm-dd');
                commonUtil.setTimePicker(that.$jobMonitoringSearch.find('input[data-form-param="fromStartTime[1]"]'));
                commonUtil.setTimePicker(that.$jobMonitoringSearch.find('input[data-form-param="toStartTime[1]"]'), {
                    noneOption: [
                        {
                            'label': '23:59',
                            'value': '23:59'
                        }
                    ]
                });

                // 실행 상태 렌더
                that.renderSelectFilter();

                // 배치 작업 모니터링 그리드 렌더, 로드
                that.$jobMonitoringGrid.html(that.jobMonitoringGrid.render(function(){that.resetSearch(); that.loadJobMonitoringList();}));

                // 배치 작업 스텝 그리드 렌더
                that.$jobStepGrid.html(that.jobStepGrid.render(function() {
                    that.jobStepGrid.setGridHeight(1);
                }));
                that.$jobMonitoringDetail.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            renderSelectFilter: function() {
                var statusCd,
                    option,
                    optionList = [];

                //// 실행상태 ////
                for(statusCd in this.statusCdList){
                    if(this.statusCdList.hasOwnProperty(statusCd)){
                        option = '<option value="' + statusCd + '">' +
                                    this.statusCdList[statusCd]['text'] +
                                '</option>';

                        optionList.push(option);
                    }
                }

                this.$jobMonitoringSearch.find('select[data-form-param="status"]').append(optionList);
            },

            resetSearch: function() {
                this.$jobMonitoringSearch.find('[data-form-param]').val('');
                this.$jobMonitoringSearch.find('[data-form-param="fromStartTime[0]"]').datepicker('setDate', new XDate().addDays(-7).toString('yyyy-MM-dd'));
                this.$jobMonitoringSearch.find('[data-form-param="fromStartTime[1]"]').val('00:00');
                this.$jobMonitoringSearch.find('[data-form-param="toStartTime[0]"]').datepicker('setDate', new XDate().toString('yyyy-MM-dd'));
                this.$jobMonitoringSearch.find('[data-form-param="toStartTime[1]"]').val('23:59');
            },

            loadJobMonitoringList: function() {
                var that = this,
                	loadData = commonUtil.makeParamFromForm(this.$jobMonitoringSearch);

                if(!commonUtil.isTimeFormat(loadData['fromStartTime[1]'])) {
                    swal({type: 'warning', title: '', text: bxMsg('batch.job-time-format-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                if(!commonUtil.isTimeFormat(loadData['toStartTime[1]'])) {
                    swal({type: 'warning', title: '', text: bxMsg('batch.job-time-format-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                loadData.fromStartTime = loadData['fromStartTime[0]'] + ' ' + loadData['fromStartTime[1]'];
                loadData.toStartTime = loadData['toStartTime[0]'] + ' ' + loadData['toStartTime[1]'];

                delete loadData['fromStartTime[0]'];
                delete loadData['fromStartTime[1]'];
                delete loadData['toStartTime[0]'];
                delete loadData['toStartTime[1]'];

                this.jobMonitoringGrid.loadData(loadData, function(data) {
                	data = data['batchJobMonList'];
                	if(data && data.length) {
                		that.$jobMonitoringGrid.find('tbody tr:first-child').click();
                	} else {
                		that.$jobMonitoringDetail.find('[data-form-param]').val('');
                		that.$jobMonitoringDetail.find('[data-form-param="status"]').html('');
                		that.$jobMonitoringDetail.find('[data-form-param="exitCode"]').html('');
                		that.$jobMonitoringDetailTitle.text('');
                		that.$jobMonitoringRunningIcon.removeClass('fa-spin');
                		
                	}
                }, true);
            },

            /**
             * jobExecutionId
             * */
            loadJobMonitoring: function(param) {
                var that = this,
                    requestParam;

                that.jobExecutionId = param.jobExecutionId;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'BatchJobMonService', 'getJobMonInfo', 'BatchJobMonOMM',
                    {
                        jobExecutionId: param.jobExecutionId
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var batchJobMonInfoOutOMM = response.BatchJobMonInfoOutOMM,
                            batchJobMonInfo = batchJobMonInfoOutOMM.batchJobMonInfo,
                            exitCdObj;

                        that.$jobMonitoringDetailTitle.text(batchJobMonInfo.jobExecutionId);
                        commonUtil.makeFormFromParam(that.$jobMonitoringDetail, batchJobMonInfo);
                        that.jobStepGrid.setData(batchJobMonInfoOutOMM.stepList);
                        that.jobStepGrid.setGridHeight(batchJobMonInfoOutOMM.stepList.length);

                        // 작업 상태 렌더링
                        that.renderStatusCd(batchJobMonInfo.status);

                        // 종료 구분 렌더링
                        exitCdObj = that.statusCdList[batchJobMonInfo.exitCode];
                        exitCdObj && that.$jobMonitoringDetail.find('[data-form-param="exitCode"]').html(exitCdObj['icon'] + ' ' + exitCdObj['text']);

                        // 컨트롤링을 위한 변수 저장
                        that.frmInstanceId = batchJobMonInfo.frmInstanceId;
                        that.jobInstanceId = batchJobMonInfo.jobInstanceId;
                        that.jobId = batchJobMonInfo.jobId;
                        that.execParamList = batchJobMonInfo.execParamList;
                        that.jobTypeCd = batchJobMonInfo.jobTypeCd;
                        that.dupExecUseYn = batchJobMonInfo.dupExecUseYn;
                        that.status = batchJobMonInfo.status;
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },

            refreshDetail: function() {
                this.jobExecutionId && this.loadJobMonitoring({jobExecutionId: this.jobExecutionId});
            },

            renderStatusCd: function(statusCd) {
                var statusCdObj = this.statusCdList[statusCd];

                // 상세 항목 작업 상태 표시
                statusCdObj && this.$jobMonitoringDetail.find('[data-form-param="status"]').html(statusCdObj['icon'] + ' ' + statusCdObj['text']);

                // Running 상태면 아이콘 돌아가도록 처리
                if(statusCd === 'STARTING' || statusCd === 'STARTED') {
                    this.$jobMonitoringRunningIcon.addClass('fa-spin');
                }else{
                    this.$jobMonitoringRunningIcon.removeClass('fa-spin');
                }
            },

            controlJob: function(e) {
                var that = this,
                    requestParam,
                    command;

                if(!that.jobExecutionId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                command = $(e.currentTarget).attr('data-code');

                swal({
                        title: '', text: command + bxMsg('common.msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){1
                        // 요청 객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'BatchJobMonService', 'controlBatchJob', 'BatchJobMonOMM',
                            {
                                frmInstanceId: that.frmInstanceId,
                                jobInstanceId: that.jobInstanceId,
                                jobExecutionId: that.jobExecutionId,
                                jobId: that.jobId,
                                execParamList: that.execParamList,
                                jobTypeCd: that.jobTypeCd,
                                status: that.status,
                                dupExecUseYn: that.dupExecUseYn,
                                command: command
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 800){
                                    commonUtil.closeTooltip();
                                    swal({type: 'success', title: '', text: bxMsg('batch.success-batch-control-msg') + '(' + command + ')', timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }else if(code === 801){
                                    swal({type: 'error', title: '', text: bxMsg('batch.fail-batch-control-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }else if(code === 802){
                                    swal({type: 'warning', title: '', text: bxMsg('batch.fail-batch-control-status-miss'), showConfirmButton: true});
                                }else if(code === 803){
                                    swal({type: 'error', title: '', text: bxMsg('batch.fail-batch-control-option-miss'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }else if(code === 804){
                                    swal({type: 'error', title: '', text: bxMsg('batch.fail-batch-control-invalid-url'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    }
                );
            },

            showJobLogSelectionPopup: function (e) {
                var that = this,
                    status = $(e.currentTarget).attr('data-status');

                if (status === 'STARTING' || status === 'STARTED') {
                    swal({
                        title: '<div class="bw-close i-20 bx-no-draggable cancel-swal-btn"></div>',
                        text: bxMsg('batch.log-type-select'),
                        showCancelButton: true,
                        html: true,
                        customClass: 'sweet-alert-button-resize',
                        confirmButtonText: bxMsg('batch.log-down'),
                        cancelButtonText: bxMsg('batch.real-time-log')
                    }, function (isConfirm) {
                        if (isConfirm) {
                            that.showJobLogPopup(e);
                        } else {
                            that.showRealTimeJobLogPopup(e);
                        }
                    });
                } else {
                    that.showJobLogPopup(e);
                }
            },

            showRealTimeJobLogPopup: function (e) {
                var $target = $(e.currentTarget);

                this.subViews['jobLogPopup'].render({
                    jobExecutionId: $target.attr('data-job-execution-id'),
                    jobId: $target.attr('data-job-id'),
                    jobNm: $target.attr('data-job-nm')
                }, null, 'real-time');
            },

            showJobLogPopup: function(e) {
                var that = this,
                    requestParam;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'BatchJobMonService', 'getJobLogFile', 'BatchJobMonLogOMM',
                    {
                        jobExecutionId: $(e.currentTarget).attr('data-job-execution-id')
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                        that.jobMonitoringGrid.showGridLoadingBar();
                    },
                    success: function(response) {
                        var batchJobMonLogOMM = response.BatchJobMonLogOMM;

                        if(batchJobMonLogOMM.responseCode === 900){
                            if(batchJobMonLogOMM.isDownload){
                                swal({
                                        title: '', text: bxMsg('common.log-download-msg'), showCancelButton: true
                                    },
                                    function(){
                                        commonUtil.downloadFile('fileEndpoint/download', {filePath: batchJobMonLogOMM.locationLogFile});
                                    }
                                );
                            }else{
                                that.subViews['jobLogPopup'].render({
                                    jobId: batchJobMonLogOMM.jobId,
                                    jobNm: batchJobMonLogOMM.jobNm,
                                    logMessages: batchJobMonLogOMM.logMessages
                                });
                            }
                        }else if(batchJobMonLogOMM.responseCode === 901){
                            swal({type: 'error', title: '', text: bxMsg('batch.no-log-file-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }else if(batchJobMonLogOMM.responseCode === 902){
                            swal({type: 'error', title: '', text: bxMsg('batch.no-daemon-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }else if(batchJobMonLogOMM.responseCode === 903){
                            swal({type: 'error', title: '', text: bxMsg('batch.log-read-error-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }else if(batchJobMonLogOMM.responseCode === 904) {
                            swal({type: 'error', title: '', text: bxMsg('batch.file-read-error-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                        that.jobMonitoringGrid.hideGridLoadingBar();
                    }
                });
            },

            showUserLogPopup: function(e) {
                var that = this,
                    $target = $(e.currentTarget);
                that.subViews['userLogPopup'].render({
                    jobExecutionId: $target.attr('data-job-execution-id'),
                    jobId: $target.attr('data-job-id'),
                    jobNm: $target.attr('data-job-nm')
                });
            },

            showJobPopup: function() {
                this.subViews['jobPopup'].render();
            },

            showStepPopup: function(e) {
                this.subViews['jobStepPopup'].render({stepExecutionId: $(e.currentTarget).attr('data-step-execution-id')});
            },

            refreshStep: function(e) {
                var that = this,
                    requestParam,
                    rowIdx = $(e.currentTarget).attr('data-idx');

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'BatchJobMonService', 'refreshStepInfo', 'BatchStepOMM',
                    {
                        stepExecutionId: $(e.currentTarget).attr('data-step-execution-id')
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var batchStepOMM = response.BatchStepOMM,
                            rowData = that.jobStepGrid.getDataAt(rowIdx);

                        // Commit 카운트
                        rowData.commitCount = batchStepOMM.commitCount;

                        // Read 카운트
                        rowData.readCount =  batchStepOMM.readCount;

                        // Write 카운트
                        rowData.writeCount =  batchStepOMM.writeCount;

                        // 실행 상태
                        rowData.status =  batchStepOMM.status;

                        // 종료일시
                        rowData.endTime =  batchStepOMM.endTime;

                        that.jobStepGrid.setDataAt(rowIdx, rowData)
                    }
                });
            }

        });
    }
);