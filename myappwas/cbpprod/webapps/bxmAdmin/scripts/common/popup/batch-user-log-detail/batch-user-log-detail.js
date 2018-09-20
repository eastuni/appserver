define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/component/popup/popup',
        'text!common/popup/batch-user-log-detail/batch-user-log-detail-tpl.html'
    ],
    function(
        commonUtil,
        ExtGrid,
        Popup,
        tpl
    ) {
        return Popup.extend({
            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'change select[data-form-param="execNo"]': 'onChangeExecNo',
                'click .cancel-btn': 'close'
            },

            mode: '', // add, edit

            initialize: function() {
                var that = this;

                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('BatchJobMonService', 'getJobUserLog', 'BatchJobUserLogInOMM'),
                        key: 'BatchJobUserLogInOMM'
                    },
                    responseParam: {
                        objKey: 'BatchJobUserLogListOMM',
                        key: 'jobUserLogList'
                    },
                    header: {
                        pageCount: true
                    },

                    fields: ['stepExecutionId', 'stepName', 'logOccurDttm', 'appLogCtt', 'logSeq'],
                    columns: [
                        {text: bxMsg('batch.log-seq-no'), flex: 2, dataIndex: 'logSeq', align: 'center'},
                        {text: bxMsg('batch.step-execution-id'), flex: 2, dataIndex: 'stepExecutionId', align: 'center'},
                        {text: bxMsg('batch.step-nm'), flex: 3, dataIndex: 'stepName', align: 'center'},
                        {text: bxMsg('online.occur-date'), flex: 3, dataIndex: 'logOccurDttm', align: 'center',
                        	renderer: function (value, metaData, record) {
                                if (value) {
                                    return commonUtil.changeStringToFullTimeString(value);
                                }
                            }	
                        },
                        {text: bxMsg('batch.log-detail'), flex: 6, dataIndex: 'appLogCtt', style: 'text-align: center;'}
                    ],
                    paging: true,
                    gridToggle: false,
                    pageCountList: [5, 10, 20]
                });

                that.$el.html(that.tpl());
                that.$el.find('.bxm-popup-grid-wrap').html(that.grid.render());
            },

            render: function(data, requestParam, responseParam, type, executionNoYn) {
                var that = this,
                    params;

                if (executionNoYn) {
                    that.$el.find('[data-form-param="execNo"]').parent().parent().show();
                    that.loadExecNoList(data);
                }
                if (requestParam) {
                    that.grid.requestParam = requestParam;
                }
                if (responseParam) {
                    that.grid.responseParam = responseParam;
                }
                if (type === 'schedule') {
                    params = {
                        scheduleExecId: data.scheduleExecId
                    };
                    that.grid.loadData(params, function (data) {
                        data.jobExecutionId = data.jobId;
                        data.jobNm = data.jobName;
                        commonUtil.makeFormFromParam(that.$el.find('.search-wrap'), data);

                        if (data['responseCode'] === 1301) {
                            swal(
                                {type: 'error', title: '', text: bxMsg('common.no-batch-user-log-exist-error')},
                                function () {
                                    that.close();
                                }
                            );
                        }
                    }, true);
                } else {
                    params = {
                        jobExecutionId: data.jobExecutionId,
                        jobId: data.jobId
                    };
                    commonUtil.makeFormFromParam(that.$el.find('.search-wrap'), data);
                    that.grid.loadData(params, function (data) {
                        if (!executionNoYn && data['responseCode'] === 1301) {
                            swal(
                                {type: 'error', title: '', text: bxMsg('common.no-batch-user-log-exist-error')},
                                function () {
                                    that.close();
                                }
                            );
                        }
                    }, true);

                }
                that.setDraggable();

                that.show();
            },

            loadExecNoList: function (params) {
                var that = this,
                    requestParam;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'ExecutionStatusService', 'getExecNoSelectList', 'ExecutionStatusOMM',
                    params
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var data = response['ExecutionStatusPopupListOMM']['execNoList'],
                            optionList = [];

                        data.forEach(function (item) {
                            optionList.push({
                                key: item['scheduleExecId'],
                                name: item['execNo'] + ' ('
                                + commonUtil.changeStringToFullTimeString(item['startDt'] + ' ' + item['startTime']) + ')'
                            });
                        });

                        that.$el.find('[data-form-param="execNo"]').html(commonUtil.getCommonCodeOptionTag(optionList));
                    }
                });
            },

            onChangeExecNo: function (e) {
                var that = this,
                    $target = $(e.currentTarget),
                    params = {
                        scheduleExecId: $target.val()
                    };
                that.grid.loadData(params, function (data) {
                    data.jobExecutionId = data.jobId;
                    data.jobNm = data.jobName;
                    commonUtil.makeFormFromParam(that.$el.find('.search-wrap'), data);

//                    if (data['responseCode'] === 1301) {
//                        swal(
//                            {type: 'error', title: '', text: bxMsg('common.no-batch-user-log-exist-error')},
//                            function () {
//                                that.close();
//                            }
//                        );
//                    }
                }, true);
            }
        });
    }
);
