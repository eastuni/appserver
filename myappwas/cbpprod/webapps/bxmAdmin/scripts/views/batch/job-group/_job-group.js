define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/batch/job-group/job-group-popup',
        'views/batch/job-group/job-popup',
        'text!views/batch/job-group/_job-group-tpl.html'
    ],
    function(
        commonUtil,
        ExtGrid,
        LoadingBar,
        JobGroupPopup,
        JobPopup,
        tpl
    ) {

        var JobGroupView = Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'resize-component .job-group-list-wrap': 'resizeGrid',

                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadJobGroupList',
                'enter-component .job-group-search input': 'loadJobGroupList',

                'click .del-job-group-btn': 'deleteJobGroup',
                'click .edit-job-group-btn': 'showEditJobGroupPopup',

                'click .del-job-btn': 'deleteJob',
                
                'click .control-batch button': 'controlBatchGroup'
            },

            jobGrpId: null,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Dom Element Cache
                that.$jobGroupSearch = that.$el.find('.job-group-search');
                that.$jobGroupGrid = that.$el.find('.job-group-grid');
                that.$jobGroupDetail = that.$el.find('.job-group-detail');
                that.$jobGroupTitle = that.$el.find('h4 > .job-group-title');
                that.$jobTitle = that.$el.find('h4 > .job-title');
                that.$jobGrid = that.$el.find('.job-grid');

                // line alignment for locale
                if (bxMsg.locale === 'en') {
                    ['sysMaxExecValidYn', 'sysMaxExecCnt', 'nodeMaxExecValidYn', 'nodeMaxExecCnt'].forEach(function (el) {
                        that.$jobGroupDetail.find('input[data-form-param="' + el + '"]').prev().addClass('bx-label-wrap');
                    })
                }

                // Set SubViews
                that.subViews['jobGroupPopup'] = new JobGroupPopup();
                that.subViews['jobGroupPopup'].on('edit-job-group', function() {
                    // 작업 그룹 수정시, 리스트, 상세 리프래시
                    var selectedIdx = that.jobGroupGrid.getSelectedRowIdx();

                    that.jobGroupGrid.reloadData(function() {
                        if(selectedIdx === -1){
                            that.loadJobGroup({jobGrpId: that.jobGrpId});
                        }else{
                            that.jobGroupGrid.setSelectedRowIdx(selectedIdx);
                        }
                    });
                });
                that.subViews['jobGroupPopup'].on('add-job-group', function() {
                    // 작업 그룹 생성시, 리스트 리프래시
                    that.jobGroupGrid.reloadData();
                });

                that.subViews['jobPopup'] = new JobPopup();
                that.subViews['jobPopup'].on('add-job', function() {
                    // 작업 추가시, 리스트, 상세 리프래시
                    that.jobGrid.loadData({jobGrpId: that.jobGrpId});
                });

                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set Grid
                that.jobGroupGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('BatchGroupService', 'getGroupList', 'BatchGroupSearchConditionOMM'),
                        key: 'BatchGroupSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'BatchGroupListOMM',
                        key: 'batchGroupList'
                    },
                    header: {
                        pageCount: true,
                        pageCountList: [5, 10, 15],
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['jobGroupPopup'].render();
                                }
                            }
                        ]
                    },
                    paging: true,

                    fields: ['jobGrpId', 'jobGrpNm'],
                    columns: [
                        {text: bxMsg('batch.work-group-id'), flex: 1, dataIndex: 'jobGrpId', align: 'center'},
                        {text: bxMsg('batch.work-group-nm'), flex: 1, dataIndex: 'jobGrpNm', align: 'center'},
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn del-job-group-btn" data-job-group-id="{0}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('jobGrpId')
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
                            var loadParam = {jobGrpId: record.get('jobGrpId')};

                            that.loadJobGroup(loadParam);
                            that.jobGrid.loadData(loadParam);

                            that.jobGrid.setEnabled();
                        }
                    }
                });

                that.jobGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('BatchGroupService', 'getIncludedJobList', 'BatchGroupRelOMM'),
                        key: 'BatchGroupRelOMM'
                    },
                    responseParam: {
                        objKey: 'BatchJobListOMM',
                        key: 'batchJobList'
                    },
                    header: {
                        pageCount: true,
                        pageCountDefaultVal: 20,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    if(!that.jobGrpId) {
                                        swal({type: 'warning', title: '', text: bxMsg('common.add-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                        return;
                                    }

                                    that.subViews['jobPopup'].render({jobGrpId: that.jobGrpId});
                                }
                            }
                        ]
                    },
                    paging: true,

                    fields: ['jobId', 'jobNm', 'bxmAppId'],
                    columns: [
                        {text: bxMsg('batch.work-id'), flex: 1, dataIndex: 'jobId', align: 'center'},
                        {text: bxMsg('batch.work-nm'), flex: 1, dataIndex: 'jobNm', align: 'center'},
                        {text: bxMsg('batch.app-nm'), flex: 1, dataIndex: 'bxmAppId', align: 'center'},
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn del-job-btn" data-job-id="{0}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('jobId')
                                );
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            width: 50
                        }
                    ]
                });
                that.jobGrid.setDisabled();
            },

            render: function() {
                var that = this;

                that.$jobGroupGrid.html(that.jobGroupGrid.render(function(){that.loadJobGroupList();}));
                that.$jobGrid.html(that.jobGrid.render());
                that.$jobGroupDetail.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            resizeGrid: function() {
                this.jobGroupGrid.resizeGrid();
            },

            resetSearch: function() {
                this.$jobGroupSearch.find('[data-form-param]').val('');
            },

            loadJobGroupList: function() {
                this.jobGroupGrid.loadData(commonUtil.makeParamFromForm(this.$jobGroupSearch), null, true);
            },

            deleteJobGroup: function(e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        // 요청 객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'BatchGroupService', 'removeGroup', 'BatchGroupOMM',
                            {
                                jobGrpId: $target.attr('data-job-group-id')
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 200){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                    // 그리드 리로드
                                    that.jobGroupGrid.reloadData();

                                    // 상세 초기화
                                    that.$jobGroupTitle.text('');
                                    that.$jobTitle.text(bxMsg('batch.batch-work-list'));
                                    that.$jobGroupDetail.find('[data-form-param]').val('');

                                    // 배치 작업 그리드 초기화
                                    that.jobGrid.resetData();
                                    that.jobGrid.setDisabled();

                                    that.jobGrpId = null;
                                }else if(code === 205) {
                                    swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    }
                );
            },

            showEditJobGroupPopup: function() {
                var renderData = commonUtil.makeParamFromForm(this.$jobGroupDetail);

                if(!renderData.jobGrpId) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['jobGroupPopup'].render(renderData);
            },

            /**
             * jobGrpId
             * */
            loadJobGroup: function(param) {
                var that = this,
                    requestParam;

                that.jobGrpId = param.jobGrpId;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'BatchGroupService', 'getGroupSingleInfo', 'BatchGroupRelOMM',
                    {
                        jobGrpId: param.jobGrpId
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var batchGroupOMM = response.BatchGroupOMM,
                            jobGrpId = batchGroupOMM.jobGrpId;

                        that.$jobGroupTitle.text(' : ' + jobGrpId);
                        that.$jobTitle.text(bxMsg('batch.batch-work-list-for').replace('{{jobGrpId}}', jobGrpId));

                        commonUtil.makeFormFromParam(that.$jobGroupDetail, batchGroupOMM);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },

            deleteJob: function(e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        // 요청 객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'BatchGroupService', 'removeGroupRel', 'BatchGroupRelOMM',
                            {
                                jobGrpId: that.jobGrpId,
                                jobId: $target.attr('data-job-id')
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 200){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                    that.jobGrid.loadData({jobGrpId: that.jobGrpId});
                                }else if(code === 205) {
                                    swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    }
                );
            },
            
            controlBatchGroup: function(event) {
            	var that = this,
            		command,
            		jobGrpId;
            	
            	//click .class-name에 button을 추가하면 target이 하위 button이 됨:)
            	jobGrpId = that.$jobGroupDetail.find('input[data-form-param="jobGrpId"]').val();
            	command = $(event.currentTarget).val();
            	
            	
            	swal({
                     title: '', text: command.toUpperCase() + bxMsg('common.msg'), showCancelButton: true, closeOnConfirm: false
                 },
                 function(){
                     // 요청 객체 생성
                     requestParam = commonUtil.getBxmReqData(
                         'BatchGroupService', 'controlBatchGroup', 'ControlBatchInOMM',
                         {
                        	 jobGrpId: jobGrpId,
                        	 command: command
                         }
                     );

                     // Ajax 요청
                     commonUtil.requestBxmAjax(requestParam, {
                         success: function(response) {
                             var result = response.ControlBatchOutOMM;

                             if(response){
                                 swal({type: 'success', title: '', text: Ext.String.format(bxMsg('batch.control-result-msg'), command.toUpperCase(), result.successCount, result.failCount, result.skipCount), showConfirmButton: true});
                                 that.jobGrid.loadData({jobGrpId: that.jobGrpId});
                             }else {
                                 swal({type: 'error', title: '', text: bxMsg('batch.fail-batch-control-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                             }
                         }
                     });
                 }
             );
            	
            }
        });

        return JobGroupView;
    }
);