define(
    [
        'common/util',
        'common/component/popup/popup',
        'text!common/popup/batch-job-log-detail/batch-job-log-detail-tpl.html'
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

                this.$jobId = this.$el.find('[data-form-param="jobId"]');
                this.$jobNm = this.$el.find('[data-form-param="jobNm"]');
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

                    this.$jobId.val(renderParams.jobId);
                    this.$jobNm.val(renderParams.jobNm);
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
                    formParams = commonUtil.makeParamFromForm(that.$realTimeSelectors),
                    requestParams;

                if (that.scheduleExecutionYn) {
                    requestParams = commonUtil.getBxmReqData(
                        'ExecutionStatusService', 'getRealTimeBatchLogPopup', 'RealtimeLogInOMM',
                        {
                            scheduleExecId: that.renderParams.scheduleExecId,
                            fileReadYn: !that.firstRendered,
                            lastFilePoint: that.lastFilePoint || 0,
                            fileReadSize: formParams.fileReadSize
                        }
                    );
                } else {
                    requestParams = commonUtil.getBxmReqData(
                        'BatchJobMonService', 'getRealTimeLogPopup', 'RealtimeLogPopupOMM',
                        {
                            jobExecutionId: that.renderParams.jobExecutionId,
                            jobId: that.renderParams.jobId,
                            jobName: that.renderParams.jobNm,
                            fileReadYn: !that.firstRendered,
                            lastFilePoint: that.lastFilePoint || 0,
                            fileReadSize: formParams.fileReadSize
                        }
                    );
                }

                commonUtil.requestBxmAjax(requestParams, {
                    success: function(response) {
                        var data = response['RealtimeLogPopupOMM'];
                        if (that.renderActivated) {
                            data['logContent'] && that.updateLogMessage(data['logContent']);
                            that.lastFilePoint = data['lastFilePoint'];
                            if (!that.firstRendered) {
                                that.$jobId.val(data.jobId);
                                that.$jobNm.val(data.jobName);
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
                    requestParam = commonUtil.getBxmReqData(
                        'ExecutionHistoryService', 'getBatchJobLogFile', 'ExecutionHistoryInOMM',
                        {
                            scheduleExecId: $target.attr('data-id')
                        }
                    );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
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
                                that.$el.find('[data-form-param="jobId"]').val(batchJobMonLogOMM.jobId);
                                that.$el.find('[data-form-param="jobNm"]').val(batchJobMonLogOMM.jobNm);
                                that.$el.find('[data-form-param="logMessages"]').text(batchJobMonLogOMM.logMessages);
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
                    }
                });
            }
//            
//            changeRequestBtnColor: function() {
//            	this.$requestButton.prop('style', 'background: #9f5e16');
//            	this.$requestButton.prop('style', 'border-color: #9f5e16');
//            	this.$pauseButton.prop('style', 'background: #f0850c');
//            	this.$pauseButton.prop('style', 'border-color: #f0850c');
//            },
//            
//            changePauseBtnColor: function() {
//            	this.$pauseButton.prop('style', 'background: #9f5e16');
//            	this.$pauseButton.prop('style', 'border-color: #9f5e16');
//            	this.$requestButton.prop('style', 'background: #f0850c');
//            	this.$requestButton.prop('style', 'border-color: #f0850c');
//            }
        });
    }
);