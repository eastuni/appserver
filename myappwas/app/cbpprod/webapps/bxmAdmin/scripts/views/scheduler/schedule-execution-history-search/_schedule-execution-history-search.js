define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'common/popup/batch-job-log-detail/batch-job-log-detail',
        'common/popup/batch-user-log-detail/batch-user-log-detail',
        'common/popup/standard-out-log-detail/standard-out-log-detail',
        'common/popup/schedule-search/schedule-search',
        'common/popup/schedule-group-search/schedule-group-search',
        'common/popup/system-search/system-search',
        'text!views/scheduler/schedule-execution-history-search/_schedule-execution-history-search-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        JobLogPopup,
        UserLogPopup,
        StandardOutLogPopup,
        ScheduleSearchPopup,
        ScheduleGroupSearchPopup,
        SystemSearchPopup,
        tpl
    ) {
        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            currentDetail: null,

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadList',
                'enter-component .bxm-search-wrap input': 'loadList',
                'change .bxm-search-wrap select': 'loadList',

                'click .schedule-search-btn': 'showScheduleSearchPopup',
                'click .schedule-group-search-btn': 'showScheduleGroupSearchPopup',
                'click .system-search-btn': 'showSystemSearchPopup',

                'click .show-job-log-btn': 'showJobLogPopup',
                'click .show-user-log-btn': 'showUserLogPopup',
                'click .show-stdout-log-btn': 'showStandardOutLogPopup',

                'click .detail-refresh-btn': 'refreshDetail'
            },

            // 작업 상태
            statusCdList: {
                'OK': {text: '정상', icon: '<i class="fa fa-check-circle chr-c-blue"></i>'},
                'ERROR': {text: '에러', icon: '<i class="fa fa-exclamation-circle chr-c-orange"></i>'},
                'R_EXEC': {text: '실행요청', icon: '<span class="fa-stack fa-lg">\
                    <i class="fa fa-circle fa-stack-2x chr-c-green"></i>\
                    <i class="fa fa-spinner fa-stack-1x fa-inverse"></i>\
                    </span>'},
                'EXEC': {text: '실행중', icon: '<i class="fa fa-check-circle chr-c-green"></i>'},
                'WAIT': {text: '대기', icon: '<i class="fa fa-clock-o chr-c-yellow"></i>'},
                'UNKNOWN': {text: '알수없음', icon: '<i class="fa fa-question-circle chr-c-yellow2"></i>'},
                'PENDING': {text: '보류', icon: '<i class="fa fa-stop-circle chr-c-yellow2"></i>'},
                'KILL': {text: 'KILL', icon: '<i class="fa fa-minus-circle chr-c-black"></i>'},
                'SUSPEND': {text: '일시정지', icon: '<i class="fa fa-pause-circle chr-c-orange"></i>'},
                'F_OK': {text: '강제정상', icon: '<span class="fa-stack fa-lg">\
                    <i class="fa fa-certificate fa-stack-2x chr-c-blue"></i>\
                    <i class="fa fa-check fa-stack-1x fa-inverse"></i>\
                    </span>'},
                'F_ERROR': {text: '강제에러', icon: '<span class="fa-stack fa-lg">\
                    <i class="fa fa-certificate fa-stack-2x chr-c-orange"></i>\
                    <i class="fa fa-exclamation fa-stack-1x fa-inverse"></i>\
                    </span>'},
                'P_ERROR': {text: '선처리에러', icon: '<span class="fa-stack fa-lg">\
                    <i class="fa fa-circle fa-stack-2x chr-c-orange"></i>\
                    <i class="fa fa-ellipsis-h fa-stack-1x fa-inverse"></i>\
                    </span>'},
                'S_ERROR': {text: '스케줄링에러', icon: '<span class="fa-stack fa-lg">\
                    <i class="fa fa-circle fa-stack-2x chr-c-orange"></i>\
                    <i class="fa fa-calendar fa-stack-1x fa-inverse"></i>\
                    </span>'},
                'A_ERROR': {text: '에이전트에러', icon: '<i class="fa fa-exclamation-circle chr-c-black"></i>'},
                'S_DELAY': {text: '시작지연', icon: '<span class="fa-stack fa-lg">\
                    <i class="fa fa-square fa-stack-2x chr-c-magenta"></i>\
                    <i class="fa fa-hourglass-half fa-stack-1x fa-inverse"></i>\
                    </span>'},
                'E_DELAY': {text: '완료지연', icon: '<span class="fa-stack fa-lg">\
                <i class="fa fa-square fa-stack-2x chr-c-purple"></i>\
                    <i class="fa fa-hourglass-end fa-stack-1x fa-inverse"></i>\
                    </span>'}
            },

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set SubViews
                that.subViews['scheduleSearchPopup'] = new ScheduleSearchPopup();
                that.subViews['scheduleSearchPopup'].on('select-code', function (scheduleId) {
                    that.$searchWrap.find('input[data-form-param="scheduleId"]').val(scheduleId);
                });

                that.subViews['scheduleGroupSearchPopup'] = new ScheduleGroupSearchPopup();
                that.subViews['scheduleGroupSearchPopup'].on('select-code', function (scheduleGrpId) {
                    that.$searchWrap.find('input[data-form-param="scheduleGrpId"]').val(scheduleGrpId);
                });

                that.subViews['systemSearchPopup'] = new SystemSearchPopup();
                that.subViews['systemSearchPopup'].on('select-code', function (sysId) {
                    that.$searchWrap.find('input[data-form-param="sysId"]').val(sysId);
                });

                that.subViews['jobLogPopup'] = new JobLogPopup();
                that.subViews['userLogPopup'] = new UserLogPopup();
                that.subViews['standardOutLogPopup'] = new StandardOutLogPopup();

                // Set Grid
                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ExecutionHistoryService', 'getExecutionHistoryList', 'ExecutionHistoryInOMM'),
                        key: 'ExecutionHistoryInOMM'
                    },
                    responseParam: {
                        objKey: 'ExecutionHistoryListOMM',
                        key: 'historyList'
                    },
                    header: {
                        pageCount: true
                    },
                    paging: true,

                    fields: ['scheduleDt', 'sysId', 'sysNm', 'scheduleId', 'scheduleGrpId', 'scheduleGrpNm', 'schedulingCd', 'scheduleNo', 'execNo', 'startDt', 'startTime', 'endDt', 'endTime', 'procStatusCd', 'scheduleExecId'],
                    columns: [
                        {
                            text: bxMsg('scheduler.schedule-date'), flex: 2, dataIndex: 'scheduleDt', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToDateString(value);
                            }
                        },
                        {
                            text: bxMsg('scheduler.system'), flex: 3, dataIndex: 'sysId', align: 'center',
                            renderer: function (value, metaData, record) {
                                return record.get('sysNm');
                            }
                        },
                        {text: bxMsg('scheduler.schedule-id'), flex: 2, dataIndex: 'scheduleId',  align: 'center'},
                        {
                            text: bxMsg('scheduler.schedule-group'), flex: 3, dataIndex: 'scheduleGrpId', align: 'center',
                            renderer: function (value, metaData, record) {
                                return record.get('scheduleGrpNm');
                            }
                        },
                        {
                            text: bxMsg('scheduler.schedule-type'), flex: 2, dataIndex: 'schedulingCd', align: 'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMAD0014'][value];
                            }
                        },
                        {text: bxMsg('scheduler.schedule-no'), flex: 1.5, dataIndex: 'scheduleNo', align: 'center'},
                        {text: bxMsg('scheduler.execution-no'), flex: 1.5, dataIndex: 'execNo', align: 'center'},
                        {
                            text: bxMsg('scheduler.start-datetime'), flex: 3, dataIndex: 'startDt', align: 'center',
                            renderer: function (value, metaData, record) {
                                if (value) {
                                    return commonUtil.changeStringToFullTimeString(value + ' ' + record.get('startTime'));
                                }
                            }
                        },
                        {
                            text: bxMsg('scheduler.end-datetime'), flex: 3, dataIndex: 'endDt', align: 'center',
                            renderer: function (value, metaData, record) {
                                if (value) {
                                    return commonUtil.changeStringToFullTimeString(value + ' ' + record.get('endTime'));
                                }
                            }
                        },
                        {
                            text: bxMsg('scheduler.execution-status'), flex: 2, dataIndex: 'procStatusCd', align: 'center',
                            renderer: function(value) {
                                return that.statusCdList[value].icon + commonConfig.comCdList['BXMAD0015'][value];
                            }
                        },
                        {
                            text: bxMsg('batch.log'),
                            renderer: function (value, p, record) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn show-job-log-btn" data-execution-id="{0}" title="' + bxMsg('common.job-log') + '">' +
                                        '<i class="bw-icon i-25 i-log-task"></i>' +
                                    '</button>' +
                                    '<button type="button" class="bw-btn show-user-log-btn" data-execution-id="{0}" title="' + bxMsg('common.user-log') + '">' +
                                        '<i class="bw-icon i-25 i-log-batch"></i>' +
                                    '</button>' +
                                    '<button type="button" class="bw-btn show-stdout-log-btn" data-execution-id="{0}" data-schedule-dt="{1}" data-sys-id="{2}" data-schedule-id="{3}" data-scheduling-cd="{4}" data-schedule-no="{5}" data-exec-no="{6}" title="' + bxMsg('common.stdout-log') + '">' +
                                    '<i class="bw-icon i-25 i-log-stdout"></i>' +
                                    '</button>',
                                    record.get('scheduleExecId'),
                                    record.get('scheduleDt'),
                                    record.get('sysId'),
                                    record.get('scheduleId'),
                                    record.get('schedulingCd'),
                                    record.get('scheduleNo'),
                                    record.get('execNo')
                                );
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            tdCls: 'grid-icon-btn',
                            width: 100
                        }
                    ],
                    listeners: {
                        beforecellmousedown: function(_this, td, cellIndex) {
                            this.gridSelect = (cellIndex !== 10);
                        },
                        beforeselect: function() {
                            return this.gridSelect;
                        },
                        select : function(_this, record) {
                            that.loadDetail({
                                "scheduleDt": record.get('scheduleDt'),
                                "sysId": record.get('sysId'),
                                "scheduleId": record.get('scheduleId'),
                                "schedulingCd": record.get('schedulingCd'),
                                "scheduleNo": record.get('scheduleNo'),
                                "execNo": record.get('execNo')
                            });
                        }
                    }
                });

                // Dom Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$gridWrap = that.$el.find('.bxm-grid-wrap');
                that.$detailTitle = that.$el.find('h3 > .bxm-detail-title');
                that.$detailWrap = that.$el.find('.bxm-detail-wrap');
            },

            render: function(renderOption, renderInfo) {
                var that = this;

                commonUtil.setDatePicker(that.$searchWrap.find('input[data-form-param="scheduleDt"]'), 'yy-mm-dd');
                this.$searchWrap.find('select[data-form-param="procStatusCd"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0015'], true, bxMsg('common.all')));
                this.$searchWrap.find('select[data-form-param="sortType"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0029'], true, bxMsg('scheduler.select-job-exec-type-cd')));
                that.$gridWrap.html(that.grid.render(function(){
                    if (!renderInfo) {
                        that.resetSearch();
                        that.loadList();
                    }
                }));
                that.$detailWrap.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            afterRender: function(pageRenderInfo) {
                var that = this,
                    params;

                if(pageRenderInfo && pageRenderInfo.scheduleId) {
                    params = {
                        scheduleDt: pageRenderInfo.scheduleDt,
                        sysId: pageRenderInfo.sysId,
                        scheduleId: pageRenderInfo.scheduleId,
                        schedulingCd: pageRenderInfo.schedulingCd,
                        scheduleNo: pageRenderInfo.scheduleNo
                    };

                    setTimeout(function () {
                        commonUtil.makeFormFromParam(that.$searchWrap, params);
                        that.$searchWrap.find('[data-form-param="scheduleDt"]').datepicker('setDate', commonUtil.changeStringToDateString(params.scheduleDt));
                        that.grid.loadData(params, null, true);
                    }, 100);
                }
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param]').val('');
                this.$searchWrap.find('[data-form-param="scheduleDt"]').datepicker('setDate', commonConfig.scheduleDate);
            },

            loadList: function() {
                var that = this,
                	params = commonUtil.makeParamFromForm(this.$searchWrap);
                params.scheduleDt = params.scheduleDt.replace(/-/g, '');
                this.grid.loadData(params, function(data) {
                	data = data['historyList'];
                	if(data && data.length) {
                		that.$gridWrap.find('tbody tr:first-child').click();
                	} else {
                		that.$detailWrap.find('[data-form-param]').val('');
                		that.$detailWrap.find('[data-form-param="procStatusCd"]').html('');
                    	that.$detailTitle.text('');
                	}
                }, true);
            },

            loadDetail: function(params) {
                var that = this,
                    requestParam;
                this.currentDetail = params;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'ExecutionHistoryService', 'getExecutionHistoryInfo', 'ExecutionHistoryInOMM',
                    params
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var data = response.ExecutionHistoryOMM;

                        that.$detailTitle.text(data.sysId + '/' + data.scheduleId);

                        data.scheduleDt = commonUtil.changeStringToDateString(data.scheduleDt);
                        data.sysNm = data.sysId + '(' + data.sysNm + ')';
                        data.scheduleGrpNm = data.scheduleGrpId + '(' + data.scheduleGrpNm + ')';
                        if (data.startDt) {
                            data.startDt = commonUtil.changeStringToFullTimeString(data.startDt + ' ' + data.startTime);
                        }
                        if (data.endDt) {
                            data.endDt = commonUtil.changeStringToFullTimeString(data.endDt + ' ' + data.endTime);
                        }

                        commonUtil.makeFormFromParam(that.$detailWrap, data);
                        that.$detailWrap.find('span[data-form-param="procStatusCd"]').html(that.statusCdList[data.procStatusCd].icon + commonConfig.comCdList['BXMAD0015'][data.procStatusCd]);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },

            refreshDetail: function() {
                this.currentDetail && this.loadDetail(this.currentDetail);
            },

            showJobLogPopup: function(e) {
                var that = this,
                    requestParam;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'ExecutionHistoryService', 'getBatchJobLogFile', 'ExecutionHistoryInOMM',
                    {
                        scheduleExecId: $(e.currentTarget).attr('data-execution-id')
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                        that.grid.showGridLoadingBar();
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
                        that.grid.hideGridLoadingBar();
                    }
                });
            },

            showUserLogPopup: function(e) {
                this.subViews['userLogPopup'].render(
                    {
                        scheduleExecId: $(e.currentTarget).attr('data-execution-id')
                    },
                    {
                        obj: commonUtil.getBxmReqData('ExecutionHistoryService', 'getJobUserLog', 'ExecutionHistoryInOMM'),
                        key: 'ExecutionHistoryInOMM'
                    },
                    {
                        objKey: 'BatchJobUserLogListOMM',
                        key: 'jobUserLogList'
                    },
                    'schedule'
                );
            },

            showStandardOutLogPopup: function(e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'ExecutionHistoryService', 'getStandardOutLogFile', 'ExecutionHistoryOMM',
                    {
                        "scheduleDt": $target.attr('data-schedule-dt'),
                        "sysId": $target.attr('data-sys-id'),
                        "scheduleId": $target.attr('data-schedule-id'),
                        "schedulingCd": $target.attr('data-scheduling-cd'),
                        "scheduleNo": $target.attr('data-schedule-no'),
                        "execNo": $target.attr('data-exec-no'),
                        "scheduleExecId": $target.attr('data-execution-id')
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                        that.grid.showGridLoadingBar();
                    },
                    success: function(response) {
                        var data = response.StandardOutLogOMM;

                        if(data.responseCode === 900){
                            if(data.isDownload){
                                swal({
                                        title: '', text: bxMsg('common.log-download-msg'), showCancelButton: true
                                    },
                                    function(){
                                        commonUtil.downloadFile('fileEndpoint/download', {filePath: data.locationLogFile});
                                    }
                                );
                            }else{
                                that.subViews['standardOutLogPopup'].render($.extend({}, {
                                    scheduleExecId: $(e.currentTarget).attr('data-execution-id')
                                }, data));
                            }
                        }else if(data.responseCode === 901){
                            swal({type: 'error', title: '', text: bxMsg('batch.no-log-file-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }else if(data.responseCode === 902){
                            swal({type: 'error', title: '', text: bxMsg('batch.no-daemon-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }else if(data.responseCode === 903){
                            swal({type: 'error', title: '', text: bxMsg('batch.log-read-error-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }else if(data.responseCode === 904) {
                            swal({type: 'error', title: '', text: bxMsg('batch.file-read-error-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                        that.grid.hideGridLoadingBar();
                    }
                });
            },

            showScheduleSearchPopup: function () {
                this.subViews['scheduleSearchPopup'].render();
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