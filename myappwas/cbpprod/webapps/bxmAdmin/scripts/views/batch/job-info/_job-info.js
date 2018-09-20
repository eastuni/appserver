define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/batch/job-info/job-info-popup',
        'views/batch/job-info/general-batch-popup',
        'views/batch/job-info/on-demand-batch-popup',
        'text!views/batch/job-info/_job-info-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        JobInfoPopup,
        GeneralBatchPopup,
        OnDemandBatchPopup,
        tpl
    ) {
        return Backbone.View.extend({
            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            jobId: null,
            currentJobTypeCd: null,

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadJobInfoList',
                'enter-component .job-info-search input': 'loadJobInfoList',
                'change .job-info-search select': 'loadJobInfoList',

                'click .del-job-info-btn': 'deleteJobInfo',
                'click .edit-job-info-btn': 'showEditJobInfoPopup',

                'click .run-job-btn': 'showRunJobPopup'
            },

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['jobInfoPopup'] = new JobInfoPopup();
                that.subViews['jobInfoPopup'].on('edit-job-info', function() {
                    // 작업 수정시, 리스트, 상세 리프래시
                    var selectedIdx = that.jobInfoGrid.getSelectedRowIdx();

                    that.jobInfoGrid.reloadData(function() {
                        if(selectedIdx === -1){
                            that.loadJobInfo({jobId: that.jobId});
                        }else{
                            that.jobInfoGrid.setSelectedRowIdx(selectedIdx);
                        }
                    });
                });
                that.subViews['jobInfoPopup'].on('add-job-info', function() {
                    // 작업 생성시, 리스트 리프래시
                    that.jobInfoGrid.reloadData();
                });

                that.subViews['generalBatchPopup'] = new GeneralBatchPopup();
                that.subViews['onDemandBatchPopup'] = new OnDemandBatchPopup();

                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set Grid
                that.jobInfoGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('BatchJobService', 'getJobList', 'BatchJobSearchConditionOMM'),
                        key: 'BatchJobSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'BatchJobListOMM',
                        key: 'batchJobList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['jobInfoPopup'].render();
                                }
                            },
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-xls" title="' + bxMsg('common.excel-download') + '"></i></button>',
                                event: function() {
                                    swal({
                                            title: '', text: bxMsg('common.excel-download-msg'), showCancelButton: true
                                        },
                                        function(){
                                            // 요청 객체 생성
                                            var requestParam = commonUtil.getBxmReqData('BatchJobService', 'jobExportExcel', 'EmptyOMM');

                                            // Ajax 요청
                                            commonUtil.requestBxmAjax(requestParam, {
                                                success: function(response) {
                                                    var filePath = response.ExcelExportOMM.filePath;

                                                    commonUtil.downloadFile('fileEndpoint/download', {filePath: filePath});
                                                }
                                            });
                                        }
                                    );
                                }
                            }
                        ]
                    },
                    paging: true,

                    fields: ['jobId', 'jobNm', 'bxmAppId', 'jobTypeCd', 'logLvNm', 'useYn', 'scheduleCount', 'regUserId', 'regOccurDttm'],
                    columns: (function () {
                        var jobInfoGridColumn = [
                            {text: bxMsg('batch.work-id'), flex: 15, dataIndex: 'jobId', style: 'text-align:center', tdCls: 'left-align'},
                            {text: bxMsg('batch.work-nm'), flex: 15, dataIndex: 'jobNm', style: 'text-align:center', tdCls: 'left-align'},
                            {text: bxMsg('batch.app-nm'), flex: 15, dataIndex: 'bxmAppId', style: 'text-align:center', tdCls: 'left-align'},
                            {
                                text: bxMsg('batch.batch-type'),
                                flex: 8,
                                dataIndex: 'jobTypeCd',
                                renderer: function (value) {
                                    return commonConfig.comCdList['BXMAD0012'][value];
                                },
                                align: 'center'
                            },
                            {
                                text: bxMsg('batch.log-level-nm'),
                                flex: 8,
                                dataIndex: 'logLvNm',
                                renderer: function (value) {
                                    return commonConfig.comCdList['BXMAD0009'][value];
                                },
                                align: 'center',
                                cls: bxMsg.locale === 'en' && 'bx-grid-header-wrap'
                            },
                            {text: bxMsg('batch.use-yn'), flex: 5, dataIndex: 'useYn', align: 'center'},
//                            {text: bxMsg('batch.register-id'), flex: 8, dataIndex: 'regUserId', align: 'center'},
//                            {text: bxMsg('batch.register-date'), flex: 10, dataIndex: 'regOccurDttm', align: 'center'},
                            {
                                text: bxMsg('common.del'),
                                renderer: function (value, p, record) {
                                    return Ext.String.format(
                                        '<button type="button" class="bw-btn del-job-info-btn" data-job-id="{0}"> ' +
                                        '<i class="bw-icon i-20 i-func-trash"></i>' +
                                        '</button>',
                                        record.get('jobId')
                                    );
                                },
                                sortable: false,
                                menuDisabled: true,
                                align: 'center',
                                flex: 3
                            }
                        ];

                        if (commonConfig.extraOption['batchTypeField'] === 'hide') {
                            jobInfoGridColumn.splice(3, 1);     // remove 'batchType' column
                        }

                        return jobInfoGridColumn;
                    })(),
                    listeners: {
                        beforecellmousedown: function(_this, td, cellIndex) {
                            this.gridSelect = (cellIndex !== 5);
                        },
                        beforeselect: function() {
                            return this.gridSelect;
                        },
                        select : function(_this, record) {
                            that.loadJobInfo({jobId: record.get('jobId')});
                        }
                    }
                });

                // Dom Element Cache
                that.$jobInfoSearch = that.$el.find('.job-info-search');
                that.$jobInfoGrid = that.$el.find('.job-info-grid');
                that.$jobInfoDetail = that.$el.find('.job-info-detail');
                that.$jobInfoDetailTitle = that.$el.find('h3 > .job-info-detail-title');

                that.$jobInfoSearch.find('select').html(commonUtil.getCommonCodeOptionTag(
                    $.extend({}, {"": bxMsg('batch.batch-type-select')}, commonConfig.comCdList['BXMAD0012']))
                );

                // remove 'batchType' field
                if (commonConfig.extraOption && commonConfig.extraOption['batchTypeField'] === 'hide') {
                    that.$el.find('.batch-type-field').remove();      // remove 'batchType' column
                }
            },

            render: function() {
                var that = this;

                that.$jobInfoGrid.html(that.jobInfoGrid.render(function(){that.loadJobInfoList();}));
                that.$jobInfoDetail.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            resetSearch: function() {
                this.$jobInfoSearch.find('[data-form-param]').val('');
            },

            loadJobInfoList: function() {
            	var that =this,
            		params = commonUtil.makeParamFromForm(this.$jobInfoSearch);
                this.jobInfoGrid.loadData(params, function(data) {
                	data = data['batchJobList'];
                	if(data && data.length) {
                		that.$jobInfoGrid.find('tbody tr:first-child').click();
                	}else {
                		that.$jobInfoDetail.find('[data-form-param]').val('');
                		that.$jobInfoDetailTitle.text('');
                	}
                }, true);
            },

            deleteJobInfo: function(e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        // 요청 객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'BatchJobService', 'removeJob', 'BatchJobOMM',
                            {
                                jobId: $target.attr('data-job-id')
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 200){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                    // 그리드 리로드
                                    that.jobInfoGrid.reloadData();

                                    // 상세 초기화
                                    that.$jobInfoDetailTitle.text('');
                                    that.$jobInfoDetail.find('[data-form-param]').val('');
                                }else if(code === 205) {
                                    swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    }
                );
            },

            showEditJobInfoPopup: function() {
                var renderData = commonUtil.makeParamFromForm(this.$jobInfoDetail);

                if(!renderData.jobId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['jobInfoPopup'].render(renderData);
            },

            /**
             * jobId
             * */
            loadJobInfo: function(param) {
                var that = this,
                    requestParam;

                that.jobId = param.jobId;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'BatchJobService', 'getJobInfo', 'BatchJobOMM',
                    {
                        jobId: param.jobId
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var batchJobOMM = response.BatchJobOMM;

                        that.currentJobTypeCd = batchJobOMM.jobTypeCd;
                        that.$jobInfoDetailTitle.text(batchJobOMM.jobId);
                        batchJobOMM.jobUseStartDt = batchJobOMM.jobUseStartDt && commonUtil.changeStringToDateString(batchJobOMM.jobUseStartDt);
                        batchJobOMM.jobUseEndDt = batchJobOMM.jobUseEndDt && commonUtil.changeStringToDateString(batchJobOMM.jobUseEndDt);
                        commonUtil.makeFormFromParam(that.$jobInfoDetail, batchJobOMM);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },

            showRunJobPopup: function () {
                var that = this,
                    jobInfoData = commonUtil.makeParamFromForm(that.$jobInfoDetail);

                if (!that.currentJobTypeCd) {
                    swal({
                        type: 'warning',
                        title: '',
                        text: bxMsg('common.run-fail-msg'),
                        timer: commonUtil.getPopupDuration(),
                        showConfirmButton: false
                    });

                    return;
                }

                switch (that.currentJobTypeCd) {
                    case 'G':
                        that.subViews['generalBatchPopup'].render(jobInfoData);
                        break;
                    case 'R':
                        that.subViews['onDemandBatchPopup'].render(jobInfoData);
                        break;
                    case 'A':
                        swal({
                            title: '<div class="bw-close i-20 bx-no-draggable cancel-swal-btn"></div>',
                            text: bxMsg('batch.batch-type-select'),
                            showCancelButton: true,
                            html: true,
                            customClass: 'sweet-alert-button-resize',
                            confirmButtonText: commonConfig.comCdList['BXMAD0012']['G'],
                            cancelButtonText: commonConfig.comCdList['BXMAD0012']['R']
                        }, function (isConfirm) {
                            if (isConfirm) {
                                that.subViews['generalBatchPopup'].render(jobInfoData);
                            } else {
                                that.subViews['onDemandBatchPopup'].render(jobInfoData);
                            }
                        });
                        break;
                    default:
                        swal({
                            type: 'warning',
                            title: '',
                            text: bxMsg('batch.batch-type-not-define-error'),
                            timer: commonUtil.getPopupDuration(),
                            showConfirmButton: false
                        });
                }
            }
        });
    }
);
