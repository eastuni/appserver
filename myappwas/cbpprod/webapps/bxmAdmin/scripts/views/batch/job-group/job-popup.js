define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/config',
        'common/component/popup/popup',
        'text!views/batch/job-group/job-popup-tpl.html'
    ],
    function(
        commonUtil,
        ExtGrid,
        commonConfig,
        Popup,
        tpl
    ) {

        var JobPopup = Popup.extend({

            className: 'md-small',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadJobList',
                'enter-component .job-search input': 'loadJobList',

                'click .job-id-check': 'changeCheck',

                'click .save-job-btn': 'saveJob',
                'click .cancel-btn': 'close'
            },

            jobGrpId: null,
            jobList: null,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());
                that.setDraggable();

                // Set Grid
                that.jobGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('BatchGroupService', 'getJobRelPopList', 'BatchGroupRelOMM'),
                        key: 'BatchGroupRelOMM'
                    },
                    responseParam: {
                        objKey: 'BatchJobListOMM',
                        key: 'batchJobList'
                    },
                    header: {
                        pageCount: true,
                        pageCountList: [5, 10, 15]
                    },
                    paging: true,

                    fields: ['jobId', 'jobNm', 'bxmAppId'],
                    columns: [
                        {
                            width: 40,
                            align: 'center',
                            renderer: function(value, p, record) {
                                var jobId = record.get('jobId'),
                                    tpl;

                                if(that.jobList.indexOf(jobId) !== -1) {
                                    tpl = '<input type="checkbox" class="bw-input ipt-radio job-id-check" data-job-id="{0}" checked>';
                                }else{
                                    tpl = '<input type="checkbox" class="bw-input ipt-radio job-id-check" data-job-id="{0}">';
                                }

                                return Ext.String.format(
                                    tpl,
                                    jobId
                                );
                            }
                        },
                        {text: bxMsg('batch.work-id'), flex: 1, dataIndex: 'jobId', style: 'text-align:center'},
                        {text: bxMsg('batch.work-nm'), flex: 1, dataIndex: 'jobNm', style: 'text-align:center'},
                        {text: bxMsg('batch.app-nm'), flex: 1, dataIndex: 'bxmAppId', style: 'text-align:center'}
                    ]
                });

                // Dom Element Cache
                that.$jobSearch = that.$el.find('.job-search');
                that.$jobGrid = that.$el.find('.job-grid');

                that.$jobGrid.html(that.jobGrid.render());
            },

            /**
            * jobGrpId
            * */
            render: function(renderParam) {
                $.extend(this, renderParam);

                this.jobList = [];

                this.show();
                this.loadJobList(renderParam);
            },

            resetSearch: function() {
                this.$jobSearch.find('[data-form-param]').val('');
            },

            loadJobList: function(renderParam) {
            	var that= this,
            		param;
            	
            	param = commonUtil.makeParamFromForm(that.$jobSearch);
                
            	$.extend(param, {
            		jobGrpId : renderParam.jobGrpId
            	});
            	
            	that.jobGrid.loadData(param, null, true);
            },

            changeCheck: function(e) {
                var $target = $(e.currentTarget);

                if($target.is(':checked')){
                    this.jobList.push($target.attr('data-job-id'));
                }else{
                    this.jobList.splice(this.jobList.indexOf($target.attr('data-job-id')),1);
                }
            },

            saveJob: function() {
                var that = this,
                    requestParam,
                    requestParamList = [];

                if(that.jobList.length === 0){
                    swal({type: 'warning', title: '', text: bxMsg('batch.batch-select-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                that.jobList.forEach(function(value) {
                    requestParamList.push({
                        jobId: value,
                        jobGrpId: that.jobGrpId
                    });
                });

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'BatchGroupService', 'addGroupRel', 'BatchGroupRelListOMM',
                    {
                        jobRelList: requestParamList
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            that.trigger('add-job');
                            that.close();
                        }else if(code === 201){
                            swal({type: 'error', title: '', text: bxMsg('common.save-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }else if(code === 202){
                            swal({type: 'error', title: '', text: bxMsg('common.same-val-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }else if(code === 204){
                            swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    }
                });
            }

        });

        return JobPopup;
    }
);