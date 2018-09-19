define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/batch/daemon-info/daemon-info-popup',
        'text!views/batch/daemon-info/_daemon-info-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        DaemonInfoPopup,
        tpl
    ) {

        var DaemonInfoView = Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            jobId: null,

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadDaemonInfoList',
                'enter-component .daemon-info-search input': 'loadDaemonInfoList',

                'click .del-daemon-info-btn': 'deleteDaemonInfo',
                'click .edit-daemon-info-btn': 'showEditDaemonInfoPopup'
            },

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['daemonInfoPopup'] = new DaemonInfoPopup();
                that.subViews['daemonInfoPopup'].on('edit-daemon-info', function() {
                    // 데몬 수정시, 리스트, 상세 리프래시
                    var selectedIdx = that.daemonInfoGrid.getSelectedRowIdx();

                    that.daemonInfoGrid.reloadData(function() {
                        if(selectedIdx === -1){
                            that.loadDaemonInfo({jobId: that.jobId});
                        }else{
                            that.daemonInfoGrid.setSelectedRowIdx(selectedIdx);
                        }
                    });
                });
                that.subViews['daemonInfoPopup'].on('add-daemon-info', function() {
                    // 데몬 생성시, 리스트 리프래시
                    that.daemonInfoGrid.reloadData();
                });

                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set Grid
                that.daemonInfoGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('BatchDaemonService', 'getDaemonList', 'BatchDaemonSearchConditionOMM'),
                        key: 'BatchDaemonSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'BatchDaemonListOMM',
                        key: 'batchDaemonList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['daemonInfoPopup'].render();
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
                                            var requestParam = commonUtil.getBxmReqData('BatchDaemonService', 'daemonExportExcel', 'EmptyOMM');

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

                    fields: ['jobId', 'jobNm', 'bxmAppId', 'useYn', 'parllExecYn', 'errStopYn', 'regUserId', 'regOccurDttm'],
                    columns: [
                        {text: bxMsg('batch.work-id'), flex: 1, dataIndex: 'jobId', align: 'center'},
                        {text: bxMsg('batch.work-nm'), flex: 1, dataIndex: 'jobNm', align: 'center'},
                        {text: bxMsg('batch.app-nm'), flex: 1, dataIndex: 'bxmAppId', align: 'center'},
                        {text: bxMsg('batch.use-yn'), width: 100, dataIndex: 'useYn', align: 'center'},
                        {text: bxMsg('batch.parallel-execute-yn'), width: 100, dataIndex: 'parllExecYn', align: 'center', cls: bxMsg.locale === 'en' && 'bx-grid-header-wrap'},
                        {text: bxMsg('batch.error-stop-yn'), width: 100, dataIndex: 'errStopYn', align: 'center'},
                        {text: bxMsg('batch.register-id'), width: 120, dataIndex: 'regUserId', align: 'center'},
                        {text: bxMsg('batch.register-date'), width: 160, dataIndex: 'regOccurDttm', align: 'center'},
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn del-daemon-info-btn" data-job-id="{0}"> ' +
                                    '<i class="bw-icon i-20 i-func-trash"></i>' +
                                    '</button>',
                                    record.get('jobId')
                                );
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            width: 50
                        }
                    ],
                    listeners: {
                        select : function(_this, record) {
                            that.loadDaemonInfo({jobId: record.get('jobId')});
                        }
                    }
                });

                // Dom Element Cache
                that.$daemonInfoSearch = that.$el.find('.daemon-info-search');
                that.$daemonInfoGrid = that.$el.find('.daemon-info-grid');
                that.$daemonInfoDetail = that.$el.find('.daemon-info-detail');
                that.$daemonInfoDetailTitle = that.$el.find('h3 > .daemon-info-detail-title');
            },

            render: function() {
                var that = this;

                that.$daemonInfoGrid.html(that.daemonInfoGrid.render(function(){that.loadDaemonInfoList();}));
                that.$daemonInfoDetail.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            resetSearch: function() {
                this.$daemonInfoSearch.find('[data-form-param]').val('');
            },

            loadDaemonInfoList: function() {
            	var that =this,
            		params = commonUtil.makeParamFromForm(this.$daemonInfoSearch);
            	
                this.daemonInfoGrid.loadData(params, function(data) {
                	data = data['batchDaemonList'];
                	if(data && data.length) {
                		that.$daemonInfoGrid.find('tbody tr:first-child').click();
                	}else {
                		that.$daemonInfoDetail.find('[data-form-param]').val('');
                		that.$daemonInfoDetail.find('.interval-cron-select').val('');
                		that.$daemonInfoDetailTitle.text('');
                	}
                }, true);
            },

            deleteDaemonInfo: function(e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        // 요청 객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'BatchDaemonService', 'removeDaemon', 'BatchDaemonOMM',
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
                                    that.daemonInfoGrid.reloadData();

                                    // 상세 초기화
                                    that.$daemonInfoDetailTitle.text('');
                                    that.$daemonInfoDetail.find('[data-form-param]').val('');
                                    that.$daemonInfoDetail.find('.interval-cron-select').val('');
                                }else if(code === 205) {
                                    swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    }
                );
            },

            showEditDaemonInfoPopup: function() {
                var renderData = commonUtil.makeParamFromForm(this.$daemonInfoDetail);

                if(!renderData.jobId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['daemonInfoPopup'].render(renderData);
            },

            /**
             * jobId
             * */
            loadDaemonInfo: function(param) {
                var that = this,
                    requestParam;

                that.jobId = param.jobId;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'BatchDaemonService', 'getDaemonInfo', 'BatchDaemonMonOMM',
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
                        var batchDaemonOMM = response.BatchDaemonOMM;

                        that.$daemonInfoDetailTitle.text(batchDaemonOMM.jobId);
                        commonUtil.makeFormFromParam(that.$daemonInfoDetail, batchDaemonOMM);

                        // 실행시간에 따른 요소 표시
                        if(batchDaemonOMM.cronExecCfgVal) {
                            that.$daemonInfoDetail.find('.interval-cron-select').val('CRON')
                                .parent().find('.fa-question-circle').attr('title', bxMsg('batch.execute-time-msg2'));
                            that.$daemonInfoDetail.find('.interval-cron-input')
                                .attr('data-form-param', 'cronExecCfgVal').val(batchDaemonOMM.cronExecCfgVal);
                        }else {
                            that.$daemonInfoDetail.find('.interval-cron-select').val('INTERVAL')
                                .parent().find('.fa-question-circle').attr('title', bxMsg('batch.execute-time-msg'));
                            that.$daemonInfoDetail.find('.interval-cron-input')
                                .attr('data-form-param', 'execIntervalSec').val(batchDaemonOMM.execIntervalSec);
                        }
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            }
        });

        return DaemonInfoView;
    }
);