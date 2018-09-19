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
        'views/scheduler/schedule-execution-status/pre-schedule-popup',
        'views/scheduler/schedule-execution-status/estimate-start-datetime-popup',
        'views/scheduler/schedule-execution-status/execution-parameter-popup',
        'text!views/scheduler/schedule-execution-status/_schedule-execution-status-tpl.html'
    ],
    function (
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
        PreSchedulePopup,
        EstimateStartDatetimePopup,
        ExecutionParameterPopup,
        tpl) {
        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            currentDetail: null,
            currentDetailData: {},

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadList',
                'enter-component .bxm-search-wrap input': 'loadList',
                'change .bxm-search-wrap select': 'loadList',
                'click .registered-search-btn': 'loadRegisteredList',
                'click .running-search-btn': 'loadRunningList',

                'click .detail-btn-wrap button': 'clickExecutionControlButton',

                'click .schedule-search-btn': 'showScheduleSearchPopup',
                'click .schedule-group-search-btn': 'showScheduleGroupSearchPopup',
                'click .system-search-btn': 'showSystemSearchPopup',

                'click .redirect-history-btn': 'redirectToHistoryPage',
                'click .show-job-log-btn': 'showJobLogSelectionPopup',
                'click .show-user-log-btn': 'showUserLogPopup',
                'click .show-stdout-log-btn': 'showStandardOutLogSelectionPopup',

                'click .detail-refresh-btn': 'refreshDetail',
                'click .estimate-start-datetime-edit-btn': 'showEstimateStartDatetimePopup',
                'click .execution-parameter-edit-btn': 'showExecutionParameterPopup'
            },

            //현재 작업 상태
            currStatusCdList: {
                'OK': {
                    text: '정상',
                    icon: '<i class="fa fa-check-circle chr-c-blue"></i>',
                    availableButtons: ['adminSvcRerunJob', 'F_ERROR']
                },
                'ERROR': {
                    text: '에러',
                    icon: '<i class="fa fa-exclamation-circle chr-c-orange"></i>',
                    availableButtons: ['adminSvcRestartJob', 'F_OK']
                },
                'R_EXEC': {
                    text: '실행요청',
                    icon: '<span class="fa-stack fa-lg">\
                        <i class="fa fa-circle fa-stack-2x chr-c-green"></i>\
                        <i class="fa fa-spinner fa-stack-1x fa-inverse"></i>\
                        </span>',
                    availableButtons: []
                },
                'EXEC': {
                    text: '실행중',
                    icon: '<i class="fa fa-check-circle chr-c-green"></i>',
                    availableButtons: ['adminSvcKillJob', 'adminSvcSuspendJob'],
                    availableButtonsOndemand: ['adminSvcForcedStopJob', 'adminSvcSuspendJob']
                },
                'WAIT': {
                    text: '대기',
                    icon: '<i class="fa fa-clock-o chr-c-yellow"></i>',
                    availableButtons: ['adminSvcForceStart', 'adminSvcImmediateStart', 'adminSvcPendingJob', 'F_OK', 'F_ERROR']
                },
                'UNKNOWN': {
                    text: '알수없음',
                    icon: '<i class="fa fa-question-circle chr-c-yellow2"></i>',
                    availableButtons: ['F_OK', 'F_ERROR']
                },
                'PENDING': {
                    text: '보류',
                    icon: '<i class="fa fa-stop-circle chr-c-yellow2"></i>',
                    availableButtons: ['adminSvcWaitJob', 'F_OK', 'F_ERROR']
                },
                'KILL': {
                    text: 'KILL',
                    icon: '<i class="fa fa-minus-circle chr-c-black"></i>',
                    availableButtons: ['adminSvcRestartJob', 'F_OK', 'F_ERROR']
                },
                'SUSPEND': {
                    text: '일시정지',
                    icon: '<i class="fa fa-pause-circle chr-c-orange"></i>',
                    availableButtons: ['adminSvcKillJob', 'adminSvcResumeJob']
                },
                'F_OK': {
                    text: '강제정상',
                    icon: '<span class="fa-stack fa-lg">\
                        <i class="fa fa-certificate fa-stack-2x chr-c-blue"></i>\
                        <i class="fa fa-check fa-stack-1x fa-inverse"></i>\
                        </span>',
                    availableButtons: ['adminSvcRerunJob', 'F_ERROR']
                },
                'F_ERROR': {
                    text: '강제에러',
                    icon: '<span class="fa-stack fa-lg">\
                        <i class="fa fa-certificate fa-stack-2x chr-c-orange"></i>\
                        <i class="fa fa-exclamation fa-stack-1x fa-inverse"></i>\
                        </span>',
                    availableButtons: ['adminSvcRestartJob', 'F_OK']
                },
                'P_ERROR': {
                    text: '선처리에러',
                    icon: '<span class="fa-stack fa-lg">\
                        <i class="fa fa-circle fa-stack-2x chr-c-orange"></i>\
                        <i class="fa fa-ellipsis-h fa-stack-1x fa-inverse"></i>\
                        </span>',
                    availableButtons: ['adminSvcRestartJob', 'F_OK']
                },
                'S_ERROR': {
                    text: '스케줄링에러',
                    icon: '<span class="fa-stack fa-lg">\
                        <i class="fa fa-circle fa-stack-2x chr-c-orange"></i>\
                        <i class="fa fa-calendar fa-stack-1x fa-inverse"></i>\
                        </span>',
                    availableButtons: ['adminSvcRestartJob', 'F_OK']
                },
                'A_ERROR': {
                    text: '에이전트에러',
                    icon: '<i class="fa fa-exclamation-circle chr-c-black"></i>',
                    availableButtons: ['adminSvcRestartJob', 'F_OK']
                },
                'S_DELAY': {
                    text: '시작지연',
                    icon: '<span class="fa-stack fa-lg">\
                        <i class="fa fa-square fa-stack-2x chr-c-magenta"></i>\
                        <i class="fa fa-hourglass-half fa-stack-1x fa-inverse"></i>\
                        </span>',
                    availableButtons: ['adminSvcForceStart', 'adminSvcPendingJob']
                },
                'E_DELAY': {
                    text: '완료지연',
                    icon: '<span class="fa-stack fa-lg">\
                        <i class="fa fa-square fa-stack-2x chr-c-purple"></i>\
                        <i class="fa fa-hourglass-end fa-stack-1x fa-inverse"></i>\
                        </span>',
                    availableButtons: ['adminSvcKillJob', 'adminSvcSuspendJob']
                }
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
                that.subViews['preSchedulePopup'] = new PreSchedulePopup();

                that.subViews['estimateStartDatetimePopup'] = new EstimateStartDatetimePopup();
                that.subViews['estimateStartDatetimePopup'].on('save-item', function () {
                    that.refreshDetail();
                    that.grid.reloadData(null, true);
                });

                that.subViews['executionParameterPopup'] = new ExecutionParameterPopup();
                that.subViews['executionParameterPopup'].on('save-item', function () {
                    that.refreshDetail();
                    that.grid.reloadData(null, true);
                });


                // Set Grid
                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ExecutionStatusService', 'getExecutionStatusList', 'ExecutionStatusInOMM'),
                        key: 'ExecutionStatusInOMM'
                    },
                    responseParam: {
                        objKey: 'ExecutionStatusListOMM',
                        key: 'executionStatusList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn" title="' + bxMsg('common.refresh') + '"><i class="bw-icon i-25 i-func-refresh"></i></button>',
                                event: function () {
                                    that.loadList(true);
                                }
                            }
                        ]
                    },
                    paging: true,

                    fields: ['scheduleDt', 'expectedStartDt', 'expectedStartTime', 'sysId', 'sysNm', 'scheduleId', 'scheduleNm', 'scheduleGrpId', 'scheduleGrpNm',
                             'schedulingCd', 'scheduleNo', 'preScheduleCnt', 'currProcStatusCd', 'renderHistoryYn', 'isExistPopup', 'isExistStdoutPopup', 'execNo', 'scheduleExecId', 'scheduleDtChg'],
                    columns: [
                        {
                            text: bxMsg('scheduler.schedule-date'), flex: 1.5, dataIndex: 'scheduleDt', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToDateString(value);
                            }
                        },
                        {
                            text: bxMsg('scheduler.estimate-start-datetime'), flex: 2.5, dataIndex: 'expectedStartDt', align: 'center',
                            renderer: function (value, metaData, record) {
                                if (value) {
                                    return commonUtil.changeStringToFullTimeString(value + ' ' + record.get('expectedStartTime'));
                                }
                            }
                        },
                        {
                            text: bxMsg('scheduler.system'), flex: 1.5, dataIndex: 'sysId', align: 'center',
                            renderer: function (value, metaData, record) {
                                return record.get('sysNm');
                            }
                        },
                        {text: bxMsg('scheduler.schedule-id'), flex: 3, dataIndex: 'scheduleId',  align: 'center'},
                        {text: bxMsg('scheduler.schedule-nm'), flex: 3.5, dataIndex: 'scheduleNm',  align: 'center'},
                        {
                            text: bxMsg('scheduler.schedule-group'), flex: 1.5, dataIndex: 'scheduleGrpId', align: 'center',
                            renderer: function (value, metaData, record) {
                                return record.get('scheduleGrpNm');
                            }
                        },
                        {
                            text: bxMsg('scheduler.schedule-type'), flex: 1.2, dataIndex: 'schedulingCd', align: 'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMAD0014'][value];
                            }
                        },
                        {text: bxMsg('common.number'), flex: 0.5, dataIndex: 'scheduleNo', align: 'center'},

                        {
                        	text: bxMsg('scheduler.pre-schedule-count'), flex: 0.5, dataIndex: 'preScheduleCnt', align: 'center',
                        	renderer: function(value) {
                        		return value ? '<button type="button" class="bw-btn bw-btn-txt">' + value + '</button>' : value;
                        	},
                        	listeners: {
                        		click: function(e, t, index) {
                        			var instanceData = that.grid.getDataAt(index);
                                    if (instanceData.preScheduleCnt) {
                                        that.subViews['preSchedulePopup'].render({sysId: instanceData.sysId, scheduleId: instanceData.scheduleId});
                                    } else {
                                        that.loadDetail(
                                            {
                                                scheduleDt: instanceData.scheduleDt,
                                                sysId: instanceData.sysId,
                                                scheduleId: instanceData.scheduleId,
                                                schedulingCd: instanceData.schedulingCd,
                                                scheduleNo: instanceData.scheduleNo
                                            }
                                        );
                                    }
                        		}
                        	}
                        },
                        {
                        	text: bxMsg('scheduler.present-execution-status'), flex: 2, dataIndex: 'currProcStatusCd', align: 'center',
                        	renderer: function(value, metaData, record) {
                                var content = that.currStatusCdList[value].icon + commonConfig.comCdList['BXMAD0023'][value];
                                if (record.get('renderHistoryYn')) {
                                    return Ext.String.format('<button type="button" class="bw-btn bw-btn-txt redirect-history-btn" data-date="{0}" data-sys-id="{1}" data-schedule-id="{2}" data-scheduling-cd="{3}" data-schedule-no="{4}">{5}</button>',
                                        record.get('scheduleDt'),
                                        record.get('sysId'),
                                        record.get('scheduleId'),
                                        record.get('schedulingCd'),
                                        record.get('scheduleNo'),
                                        content
                                    );
                                } else {
                                    return content;
                                }
                            }
                        },
                        {
                            text: bxMsg('batch.log'),
                            renderer: function (value, p, record) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn show-job-log-btn" data-execution-id="{0}" data-schedule-dt="{1}" data-sys-id="{2}" data-schedule-id="{3}" data-scheduling-cd="{4}" data-schedule-no="{5}" data-exec-no="{6}" is-exist-popup="{7}" data-status="{9}" title="' + bxMsg('common.job-log') + '">' +
                                        '<i class="bw-icon i-25 i-log-task"></i>' +
                                    '</button>' +
                                    '<button type="button" class="bw-btn show-user-log-btn" data-execution-id="{0}" data-schedule-dt="{1}" data-sys-id="{2}" data-schedule-id="{3}" data-scheduling-cd="{4}" data-schedule-no="{5}" data-exec-no="{6}" is-exist-popup="{7}" title="' + bxMsg('common.user-log') + '">' +
                                        '<i class="bw-icon i-25 i-log-batch"></i>' +
                                    '</button>' +
                                    '<button type="button" class="bw-btn show-stdout-log-btn" data-execution-id="{0}" data-schedule-dt="{1}" data-sys-id="{2}" data-schedule-id="{3}" data-scheduling-cd="{4}" data-schedule-no="{5}" data-exec-no="{6}" is-exist-stdout-popup="{8}" data-status="{9}" title="' + bxMsg('common.stdout-log') + '">' +
                                    '<i class="bw-icon i-25 i-log-stdout"></i>' +
                                    '</button>',
                                    record.get('scheduleExecId'),
                                    record.get('scheduleDt'),
                                    record.get('sysId'),
                                    record.get('scheduleId'),
                                    record.get('schedulingCd'),
                                    record.get('scheduleNo'),
                                    record.get('execNo'),
                                    record.get('isExistPopup'),
                                    record.get('isExistStdoutPopup'),
                                    record.get('currProcStatusCd')
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
                        select: function(_this, record) {
                            that.loadDetail({
                                "scheduleDt": record.get('scheduleDt'),
                                "sysId": record.get('sysId'),
                                "scheduleId": record.get('scheduleId'),
                                "schedulingCd": record.get('schedulingCd'),
                                "scheduleNo": record.get('scheduleNo')
                            });
                        }
                    }
                });

                // Dom Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$gridWrap = that.$el.find('.bxm-grid-wrap');
                that.$detailTitle = that.$el.find('h3 > .bxm-detail-title');
                that.$detailWrap = that.$el.find('.bxm-detail-wrap');
                that.$detailBtnWrap = that.$detailWrap.find('.detail-btn-wrap');
                that.$estimateStartDatetimeEditBtn = that.$detailWrap.find('.estimate-start-datetime-edit-btn');
                that.$executionStatusSpinner = that.$detailWrap.find('.execution-status-spinner');
            },

            render: function() {
                var that = this;

                commonUtil.setDatePicker(that.$searchWrap.find('input[data-form-param="scheduleDt"]'), 'yy-mm-dd');
                this.$searchWrap.find('select[data-form-param="currProcStatusCd"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0023'], true, bxMsg('common.all')));
                this.$searchWrap.find('select[data-form-param="schedulingCd"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0014'], true, bxMsg('common.all')));
                this.$searchWrap.find('select[data-form-param="sortType"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0029'], true, bxMsg('scheduler.select-job-exec-type-cd')));
                that.$gridWrap.html(that.grid.render(function(){
                    that.resetSearch();
                    that.loadList();
                }));
                that.$detailWrap.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param]').val('');
                this.$searchWrap.find('[data-form-param="scheduleDt"]').datepicker('setDate', commonConfig.scheduleDate);
            },

            //default search
            loadList: function(keepPageNo) {
                var that = this,
                    params = commonUtil.makeParamFromForm(this.$searchWrap);
                params.scheduleDt = params.scheduleDt.replace(/-/g, '');
                params.searchType = 'DEFAULT';
                
                if(keepPageNo && keepPageNo.type === 'click') {
                    keepPageNo = false;
                }
                
                this.grid.loadData(params, function (data) {
                    data = data['executionStatusList'];
                    if (data && data.length) {
                        that.$gridWrap.find('tbody tr:first-child').click();
                    } else {
                    	that.$detailWrap.find('[data-form-param]').val('');
                    	that.$detailWrap.find('[data-form-param="currProcStatusCd"]').html('');
                    	that.$detailTitle.text('');
                    }
                }, !keepPageNo);
            },

            loadRegisteredList: function() {

            	this.resetSearch();

            	var that = this,
            		params = commonUtil.makeParamFromForm(this.$searchWrap);

                params.scheduleDt = params.scheduleDt.replace(/-/g, '');
                params.searchType = 'REGISTERED';

                //callback!
                this.grid.loadData(params, function(response) {
                	data = response['executionStatusList'];
                	that.$searchWrap.find('[data-form-param="scheduleDt"]').datepicker('setDate', commonUtil.changeStringToDateString(response.executionStatusList[0].scheduleDtChg));
                	
                	if(data && data.length) {
                		that.$gridWrap.find('tbody tr:first-child').click();
                	}
                	
                }, true);
            },

            loadRunningList: function() {
            	this.resetSearch();
            	var that = this,
            		params = commonUtil.makeParamFromForm(this.$searchWrap);

                params.scheduleDt = '';
                params.searchType = 'RUNNING';

                this.$searchWrap.find('[data-form-param="scheduleDt"]').val('');
                this.$searchWrap.find('[data-form-param="currProcStatusCd"]').val('EXEC');
                this.grid.loadData(params, function(data) {
                	data = data['executionStatusList'];
                	if(data && data.length) {
                		that.$gridWrap.find('tbody tr:first-child').click();
                	}
                }, true);
            },

            loadDetail: function(params) {
                var that = this,
                    requestParam;
                this.currentDetail = params;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'ExecutionStatusService', 'getExecutionStatusInfo', 'ExecutionStatusInOMM',
                    params
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var data = response.ExecutionStatusOMM;
                        that.currentDetailData = $.extend({}, data);

                        that.$detailTitle.text(data.sysId + '/' + data.scheduleId);

                        data.scheduleDt = commonUtil.changeStringToDateString(data.scheduleDt);
                        data.sysId = data.sysId + '(' + data.sysNm + ')';
                        data.scheduleGrpId = data.scheduleGrpId + '(' + data.scheduleGrpNm + ')';
                        if (data.expectedStartDt) {
                            data.expectedStartDt = commonUtil.changeStringToFullTimeString(data.expectedStartDt + ' ' + data.expectedStartTime);
                        }

                        commonUtil.makeFormFromParam(that.$detailWrap, data);
                        that.$detailWrap.find('span[data-form-param="currProcStatusCd"]').html(that.currStatusCdList[data.currProcStatusCd].icon + commonConfig.comCdList['BXMAD0023'][data.currProcStatusCd]);

                        that.$detailBtnWrap.html(that.renderStatusBtn(data.currProcStatusCd, data.jobTypeCd));

                        if (data.currProcStatusCd === 'WAIT') {
                            that.$estimateStartDatetimeEditBtn.show();
                        }else{
                            that.$estimateStartDatetimeEditBtn.hide();
                        }

                        if (data.currProcStatusCd === 'EXEC' || data.currProcStatusCd === 'E_DELAY') {
                            that.$executionStatusSpinner.addClass('fa-spin');
                        }else{
                            that.$executionStatusSpinner.removeClass('fa-spin');
                        }
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },

            renderStatusBtn: function (currProcStatusCd, jobTypeCd) {
                var that = this,
                    availableButtons = that.currStatusCdList[currProcStatusCd].availableButtons,
                    buttonWidthPercent = 100 / availableButtons.length,
                    buttonList = [];

                if(currProcStatusCd === 'EXEC' && jobTypeCd === 'R') {
                	availableButtons = that.currStatusCdList[currProcStatusCd].availableButtonsOndemand;
                }

                availableButtons.forEach(function (item) {
                    switch (item) {
                        case 'adminSvcForceStart':
                        case 'adminSvcRestartJob':
                        case 'adminSvcImmediateStart':
                        case 'adminSvcRerunJob':
                        case 'adminSvcResumeJob':
                            buttonList.push('<button type="button" class="bw-btn btn-ctr" data-type="' + item + '" title="' + bxMsg('scheduler.' + item) + '" style="width: ' + buttonWidthPercent + '%"><i class="fa fa-play"></i></button>');
                            break;
                        case 'adminSvcPendingJob':
                        case 'adminSvcWaitJob':
                        case 'adminSvcSuspendJob':
                            buttonList.push('<button type="button" class="bw-btn btn-ctr" data-type="' + item + '" title="' + bxMsg('scheduler.' + item) + '" style="width: ' + buttonWidthPercent + '%"><i class="fa fa-stop"></i></button>');
                            break;
                        case 'adminSvcForcedStopJob':
                        	buttonList.push('<button type="button" class="bw-btn btn-ctr" data-type="' + item + '" title="' + bxMsg('scheduler.' + item) + '" style="width: ' + buttonWidthPercent + '%"><i class="fa fa-stop chr-c-orange"></i></button>');
                            break;
                        case 'adminSvcKillJob':
                            buttonList.push('<button type="button" class="bw-btn btn-ctr" data-type="' + item + '" title="' + bxMsg('scheduler.' + item) + '" style="width: ' + buttonWidthPercent + '%"><span class="fa-stack fa-lg">\
                                <i class="fa fa-circle fa-stack-2x chr-c-black"></i>\
                                <i class="fa fa-power-off fa-stack-1x fa-inverse"></i>\
                                </span></button>');
                            break;
                        case 'F_OK':
                            buttonList.push('<button type="button" class="bw-btn btn-ctr force-btn" data-type="' + item + '" title="' + bxMsg('scheduler.' + item) + '" style="width: ' + buttonWidthPercent + '%"><span class="fa-stack fa-lg">\
                                <i class="fa fa-square-o fa-stack-2x chr-c-blue bigger-square"></i>\
                                <i class="fa fa-stack-1x chr-c-blue">N</i>\
                                </span></button>');
                            break;
                        case 'F_ERROR':
                            buttonList.push('<button type="button" class="bw-btn btn-ctr force-btn" data-type="' + item + '" title="' + bxMsg('scheduler.' + item) + '" style="width: ' + buttonWidthPercent + '%"><span class="fa-stack fa-lg">\
                                <i class="fa fa-square-o fa-stack-2x chr-c-orange bigger-square"></i>\
                                <i class="fa fa-stack-1x chr-c-orange">E</i>\
                                </span></button>');
                            break;
                        default:
                    }
                });

                return buttonList;
            },

            clickExecutionControlButton: function (e) {
                var that = this,
                    executionType = $(e.currentTarget).attr('data-type'),
                    formParams = commonUtil.makeParamFromForm(that.$detailWrap);

                switch (executionType) {
                    case 'adminSvcForceStart':
                    case 'adminSvcRestartJob':
                    case 'adminSvcImmediateStart':
                    case 'adminSvcRerunJob':
                    case 'adminSvcPendingJob':
                    case 'adminSvcWaitJob':
                    case 'adminSvcKillJob':
                        that.executeAdminService(executionType, {
                            scheduleDt: commonUtil.changeDateStringToString(formParams.scheduleDt),
                            sysId: that.currentDetailData.sysId,
                            scheduleId: formParams.scheduleId,
                            schedulingCd: formParams.schedulingCd,
                            scheduleNo: formParams.scheduleNo,
                            expectedStartDt: commonUtil.changeDateStringToString(formParams.expectedStartDt.substring(0, 10)),
                            expectedStartTime: commonUtil.changeTimeStringToString(formParams.expectedStartDt.substring(11)),
                            currProcStatusCd: that.currentDetailData.currProcStatusCd
                        });
                        break;
                    case 'adminSvcSuspendJob':
                    case 'adminSvcResumeJob':
                    case 'adminSvcForcedStopJob':
                        that.executeAdminService(executionType, {
                            scheduleDt: commonUtil.changeDateStringToString(formParams.scheduleDt),
                            sysId: that.currentDetailData.sysId,
                            scheduleId: formParams.scheduleId,
                            schedulingCd: formParams.schedulingCd,
                            scheduleNo: formParams.scheduleNo,
                            currProcStatusCd: that.currentDetailData.currProcStatusCd
                        });
                        break;
                    case 'F_OK':
                    case 'F_ERROR':
                        that.changeForcedStatus(executionType);
                        break;
                    default:
                }
            },

            executeAdminService: function (operation, params) {
                var that= this,
                    requestParam;

                swal({
                        title: bxMsg('scheduler.' + operation), text: bxMsg('common.confirm-execution-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        // 요청 객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'ExecutionStatusService', operation, 'ExecutionStatusOMM',
                            params
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 1400){
                                    commonUtil.closeTooltip();
                                    swal({type: 'success', title: '', text: bxMsg('common.status-change-success'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                } else {
                                    swal({type: 'error', title: '', text: bxMsg('common.status-change-fail'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            },
                            complete: function() {
                                that.refreshDetail();
                                that.grid.reloadData(null, false);
                            }
                        });
                    }
                );
            },

            changeForcedStatus: function(currProcStatusCd) {
            	var that= this,
            		requestParam,
            		params = that.currentDetail,
                    msg = currProcStatusCd === 'F_OK' ? bxMsg('scheduler.curr-proc-status-cd-change-ok-msg')
                        : bxMsg('scheduler.curr-proc-status-cd-change-err-msg');

                swal({
                        title: '', text: msg, showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        // 요청 객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'ExecutionStatusService', 'changeCurrProcStatus', 'ExecutionStatusInOMM',
                            {
                                currProcStatusCd: currProcStatusCd,
                                scheduleDt: params.scheduleDt,
                                sysId: params.sysId,
                                scheduleId: params.scheduleId,
                                schedulingCd: params.schedulingCd,
                                scheduleNo: params.scheduleNo
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 1400){
                                    commonUtil.closeTooltip();
                                    swal({type: 'success', title: '', text: bxMsg('common.status-change-success'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                } else {
                                    swal({type: 'error', title: '', text: bxMsg('common.status-change-fail'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            },
                            complete: function() {
                                that.refreshDetail();
                                that.grid.reloadData(null, true);
                            }
                        });
                    }
                );
            },

            refreshDetail: function() {
                this.currentDetail && this.loadDetail(this.currentDetail);
            },

            redirectToHistoryPage: function (e) {
                var target = $(e.currentTarget);
                commonUtil.redirectRoutePage('MENU00903', {
                    scheduleDt: target.attr('data-date'),
                    sysId: target.attr('data-sys-id'),
                    scheduleId: target.attr('data-schedule-id'),
                    schedulingCd: target.attr('data-scheduling-cd'),
                    scheduleNo: target.attr('data-schedule-no')
                });
            },

            showJobLogSelectionPopup: function (e) {
                var that = this;

                if($(e.currentTarget).attr('is-exist-popup') === 'false') {
                	swal({type: 'error', title: '', text: bxMsg('scheduler.no-exist-log-file'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                	return;
                }

                if ($(e.currentTarget).attr('data-status') === 'EXEC') {
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
                    scheduleDt: $target.attr('data-schedule-dt'),
                    sysId: $target.attr('data-sys-id'),
                    scheduleId: $target.attr('data-schedule-id'),
                    schedulingCd: $target.attr('data-scheduling-cd'),
                    scheduleNo: $target.attr('data-schedule-no'),
                    execNo: $target.attr('data-exec-no'),
                    scheduleExecId: $target.attr('data-execution-id')
                }, true, 'real-time');
            },

            showJobLogPopup: function(e) {
                var that = this,
                	$target = $(e.currentTarget),
                    requestParam;

//                if($target.attr('is-exist-popup') === 'false') {
//                	swal({type: 'error', title: '', text: bxMsg('scheduler.no-exist-log-file'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
//                	return;
//                }
                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'ExecutionHistoryService', 'getBatchJobLogFile', 'ExecutionHistoryInOMM',
                    {
                        scheduleExecId: $target.attr('data-execution-id')
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
                                    logMessages: batchJobMonLogOMM.logMessages,
                                    scheduleDt: $target.attr('data-schedule-dt'),
                                    sysId: $target.attr('data-sys-id'),
                                    scheduleId: $target.attr('data-schedule-id'),
                                    schedulingCd: $target.attr('data-scheduling-cd'),
                                    scheduleNo: $target.attr('data-schedule-no'),
                                    execNo: $target.attr('data-exec-no')
                                }, true);
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
            	var $target = $(e.currentTarget);

//            	if($target.attr('is-exist-popup') === 'false') {
//                	swal({type: 'error', title: '', text: bxMsg('scheduler.no-exist-log-file'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
//                	return;
//                }

            	this.subViews['userLogPopup'].render(
            			{
            				scheduleExecId: $target.attr('data-execution-id'),
            				scheduleDt: $target.attr('data-schedule-dt'),
            				sysId: $target.attr('data-sys-id'),
            				scheduleId: $target.attr('data-schedule-id'),
            				schedulingCd: $target.attr('data-scheduling-cd'),
            				scheduleNo: $target.attr('data-schedule-no')
            			},
            			{
            				obj: commonUtil.getBxmReqData('ExecutionHistoryService', 'getJobUserLog', 'ExecutionHistoryInOMM'),
            				key: 'ExecutionHistoryInOMM'
            			},
            			{
            				objKey: 'BatchJobUserLogListOMM',
            				key: 'jobUserLogList'
            			},
            			'schedule',
            			true
            	);

            },

            showStandardOutLogSelectionPopup: function (e) {
                var that = this;

                if($(e.currentTarget).attr('is-exist-stdout-popup') === 'false') {
                	swal({type: 'error', title: '', text: bxMsg('scheduler.no-exist-log-file'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                	return;
                }

                if ($(e.currentTarget).attr('data-status') === 'EXEC') {
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
                            that.showStandardOutLogPopup(e);
                        } else {
                            that.showRealTimeStandardOutLogPopup(e);
                        }
                    });
                } else {
                    that.showStandardOutLogPopup(e);
                }
            },

            showRealTimeStandardOutLogPopup: function (e) {
                var $target = $(e.currentTarget);

                this.subViews['standardOutLogPopup'].render({
                    scheduleDt: $target.attr('data-schedule-dt'),
                    sysId: $target.attr('data-sys-id'),
                    scheduleId: $target.attr('data-schedule-id'),
                    schedulingCd: $target.attr('data-scheduling-cd'),
                    scheduleNo: $target.attr('data-schedule-no'),
                    execNo: $target.attr('data-exec-no')
                }, true, 'real-time');
            },

            showStandardOutLogPopup: function(e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

//                if($target.attr('is-exist-stdout-popup') === 'false') {
//                	swal({type: 'error', title: '', text: bxMsg('scheduler.no-exist-log-file'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
//                	return;
//                }

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
                                    scheduleExecId: $(e.currentTarget).attr('data-execution-id'),
                                    scheduleDt: $target.attr('data-schedule-dt'),
                                    sysId: $target.attr('data-sys-id'),
                                    scheduleId: $target.attr('data-schedule-id'),
                                    schedulingCd: $target.attr('data-scheduling-cd'),
                                    scheduleNo: $target.attr('data-schedule-no'),
                                    execNo: $target.attr('data-exec-no')
                                }, data), true);
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
            },

            showEstimateStartDatetimePopup: function () {
                if (this.currentDetailData.currProcStatusCd !== 'WAIT') return;

                if (!this.currentDetailData.sysId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['estimateStartDatetimePopup'].render(this.currentDetailData);
            },

            showExecutionParameterPopup: function () {
                if (!this.currentDetailData.sysId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['executionParameterPopup'].render(this.currentDetailData);
            }
        });
    }
);