define(
    [
        'common/util',
        'common/component/popup/popup',
        'text!common/popup/standard-out-log-detail/standard-out-log-detail-tpl.html'
    ],
    function(
        commonUtil,
        Popup,
        tpl
    ) {
        return Popup.extend({

            className: 'md-form job-log-popup',

            templates: {
                'tpl': tpl
            },

            events: {
                'change select[data-form-param="execNo"]': 'onChangeExecNo',

                'click .request-btn': 'startRenderMessage',
                'click .pause-btn': 'stopRenderMessage',
                'click .ok-btn': 'doneRenderMessage'
            },

            scheduleExecutionYn: null,
            jobLogType: null,

            renderParams: {},
            renderInterval: 0,
            lastFilePoint: 0,
            firstRendered: false,
            renderActivated: false,

            initialize: function() {
                // Set Page
                this.$el.html(this.tpl());
                this.$logDownActivated = this.$el.find('.log-down-activated');
                this.$realTimeActivated = this.$el.find('.real-time-activated');
                this.$realTimeSelectors = this.$el.find('.real-time-selectors');
                this.$requestButton = this.$el.find('.request-btn');
                this.$pauseButton = this.$el.find('.pause-btn');

                this.$logMessages = this.$el.find('[data-form-param="logMessages"]');

                this.setDraggable();
            },

            /**
             * jobId
             * jobNm
             * logMessages
             * */
            render: function(renderParams, scheduleExecutionYn, jobLogType) {
                this.renderParams = renderParams;
                this.scheduleExecutionYn = scheduleExecutionYn;
                this.jobLogType = jobLogType;

                if (scheduleExecutionYn) {
                    this.$el.find('[data-form-param="execNo"]').parent().parent().show();
                    this.loadExecNoList(renderParams);
                }

                // Real-time
                if (jobLogType === 'real-time') {
                    this.$logDownActivated.hide();
                    this.$realTimeActivated.show();

                    this.lastFilePoint = 0;
                    this.$logMessages.text('');
                    this.firstRendered = false;

                    this.startRenderMessage();

                // Log Down
                } else {
                    this.$logDownActivated.show();
                    this.$realTimeActivated.hide();

                    this.$jobId && this.$jobId.val(renderParams.jobId);
                    this.$jobNm && this.$jobNm.val(renderParams.jobNm);
                    this.$logMessages.text(renderParams.logMessages);
                }

                this.show();
            },

            startRenderMessage: function () {
                var formParams = commonUtil.makeParamFromForm(this.$realTimeSelectors);

                this.stopRenderMessage();
                this.renderMessage();

                this.renderInterval = setInterval(this.renderMessage.bind(this), formParams['waitingInterval']);
                this.renderActivated = true;
                this.$requestButton.prop('disabled', true);
                this.$requestButton.addClass('change-btn-color');
                this.$pauseButton.prop('disabled', false);
                this.$pauseButton.removeClass('change-btn-color');
            },

            stopRenderMessage: function () {
                clearInterval(this.renderInterval);
                this.renderActivated = false;
                this.$requestButton.prop('disabled', false);
                this.$requestButton.removeClass('change-btn-color');
                this.$pauseButton.prop('disabled', true);
                this.$pauseButton.addClass('change-btn-color');
            },

            doneRenderMessage: function () {
                this.stopRenderMessage();
                this.close();
            },

            renderMessage: function () {
                var that = this,
                    formParams = commonUtil.makeParamFromForm(that.$realTimeSelectors);

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'ExecutionStatusService', 'getRealTimeStdOutLogPopup', 'ExecutionHistoryOMM',
                    {
                        scheduleDt: that.renderParams.scheduleDt,
                        sysId: that.renderParams.sysId,
                        scheduleId: that.renderParams.scheduleId,
                        schedulingCd: that.renderParams.schedulingCd,
                        scheduleNo: that.renderParams.scheduleNo,
                        execNo: that.renderParams.execNo,
                        fileReadYn: !that.firstRendered,
                        lastFilePoint: that.lastFilePoint || 0,
                        fileReadSize: formParams.fileReadSize
                    }
                ), {
                    success: function(response) {
                        var data = response['RealtimeLogPopupOMM'];
                        that.lastReadPoint = data['lastReadPoint'];
                        if (that.renderActivated) {
                            data['logContent'] && that.updateLogMessage(data['logContent']);
                            that.lastFilePoint = data['lastFilePoint'];
                            if (!that.firstRendered) {
                                that.$jobId && that.$jobId.val(data.jobId);
                                that.$jobId && that.$jobNm.val(data.jobName);
                                that.firstRendered = true;
                            }
                            if (data['fileReadYn']) {
                                that.renderMessage.call(that);
                            } else {
                                that.$logMessages.animate({ scrollTop: that.$logMessages[0].scrollHeight });
                            }
                        } else {
                            that.stopRenderMessage();
                        }
                    }
                });
            },

            updateLogMessage: function (logData) {
                var currentLogMessage = this.$logMessages.text() + logData;

                if (currentLogMessage.length > 100000) {
                    currentLogMessage = currentLogMessage.substring(currentLogMessage.length - 100000);
                }

                this.$logMessages.text(currentLogMessage);
            },

            loadExecNoList: function (params) {
                var that = this,
                    requestParam;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'ExecutionStatusService', 'getExecNoSelectList', 'ExecutionStatusOMM',
                    {
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
                        var data = response['ExecutionStatusPopupListOMM']['execNoList'],
                            optionList = [];

                        data.forEach(function (item) {
                            optionList.push('<option value="' + item['execNo'] + '" data-id="' + item['scheduleExecId'] + '">'
                                + item['execNo'] + ' (' + commonUtil.changeStringToFullTimeString(item['startDt'] + ' ' + item['startTime']) + ')' + '</option>');
                        });

                        that.$el.find('[data-form-param="execNo"]').html(optionList).val(params.execNo);
                    }
                });
            },

            onChangeExecNo: function (e) {
                var that = this,
                    $target = $($(e.currentTarget).children('option:selected')[0]),
                    requestParam;
                that.renderParams = {
                    scheduleDt: that.renderParams.scheduleDt,
                    sysId: that.renderParams.sysId,
                    scheduleId: that.renderParams.scheduleId,
                    schedulingCd: that.renderParams.schedulingCd,
                    scheduleNo: that.renderParams.scheduleNo,
                    execNo: $target.attr('value'),
                    scheduleExecId: $target.attr('data-id')
                };

                requestParam = commonUtil.getBxmReqData(
                    'ExecutionHistoryService', 'getStandardOutLogFile', 'ExecutionHistoryOMM',
                    that.renderParams
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
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
                                that.$el.find('[data-form-param="jobId"]').val(data.jobId);
                                that.$el.find('[data-form-param="jobNm"]').val(data.jobNm);
                                that.$el.find('[data-form-param="logMessages"]').text(data.logMessages);
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
                    }
                });
            }
        });
    }
);