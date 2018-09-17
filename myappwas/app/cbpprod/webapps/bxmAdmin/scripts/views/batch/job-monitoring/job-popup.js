define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/config',
        'common/component/popup/popup',
        'text!views/batch/job-monitoring/job-popup-tpl.html'
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
                'click .job-id-check': 'changeCheck',
                'click .save-job-btn': 'saveJob',
                'click .cancel-btn': 'close'
            },

            job: null,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());
                that.setDraggable();

                // Set Grid
                that.jobGrid = new ExtGrid({
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
                        pageCountList: [5, 10, 15]
                    },
                    paging: true,

                    fields: ['jobId', 'jobNm', 'bxmAppId'],
                    columns: [
                        {
                            width: 40,
                            renderer: function(value, p, record) {
                                var jobId = record.get('jobId'),
                                    tpl;

                                if(that.job === jobId) {
                                    tpl = '<input type="radio" name="BatchJob" class="bw-input ipt-radio job-id-check" data-job-id="{0}" checked>';
                                }else{
                                    tpl = '<input type="radio" name="BatchJob" class="bw-input ipt-radio job-id-check" data-job-id="{0}">';
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
                that.$jobGrid = that.$el.find('.job-grid');

                that.$jobGrid.html(that.jobGrid.render());

            },

            render: function() {
                this.job = null;

                this.show();
                this.loadJobList();
            },

            loadJobList: function() {
                this.jobGrid.loadData();
            },

            changeCheck: function(e) {
                this.job = $(e.currentTarget).attr('data-job-id');
            },

            saveJob: function() {
                if(!this.job) {
                    swal({type: 'warning', title: '', text: bxMsg('batch.job-select-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.trigger('select-job', this.job);
                this.close();
            }

        });

        return JobPopup;
    }
);