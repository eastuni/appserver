define(
    [
        'common/config',
        'common/util',
        'common/component/popup/popup',
        'common/component/loading-bar/_loading-bar',
        'text!views/batch/job-monitoring/job-step-popup-tpl.html'
    ],
    function(
        commonConfig,
        commonUtil,
        Popup,
        LoadingBar,
        tpl
    ) {
        return Popup.extend({

            className: 'md-form job-step-popup',

            templates: {
                'tpl': tpl
            },

            statusCdList: null,

            events: {
                'click .ok-btn': 'close'
            },

            /**
             * statusCdList
             * */
            initialize: function(initParam) {
                $.extend(this, initParam);

                // Set Page
                this.$el.html(this.tpl());
                this.setDraggable();

                // Dom Element Cache
                this.$jobStepDetail = this.$el.find('.job-step-detail');

                // Set SubViews
                this.subViews['detailLoadingBar'] = new LoadingBar();

                // Render LoadingBar
                this.$jobStepDetail.append(this.subViews['detailLoadingBar'].render());
            },

            /**
             * stepExecutionId
             * */
            render: function(renderParam) {
                this.loadJobStep(renderParam);

                this.show();
            },

            loadJobStep: function(param) {
                var that = this,
                    requestParam;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'BatchJobMonService', 'getStepInfo', 'BatchStepOMM',
                    param
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var batchStepOMM = response.BatchStepOMM,
                            statusCdObj,
                            exitCdObj,
                            value;

                        commonUtil.makeFormFromParam(that.$jobStepDetail, batchStepOMM);

                        statusCdObj = that.statusCdList[batchStepOMM.status];
                        statusCdObj && that.$jobStepDetail.find('[data-form-param="status"]').html(statusCdObj['icon'] + ' ' + statusCdObj['text']);

                        exitCdObj = that.statusCdList[batchStepOMM.exitCode];
                        exitCdObj && that.$jobStepDetail.find('[data-form-param="exitCode"]').html(exitCdObj['icon'] + ' ' + exitCdObj['text']);
                        
                        that.$jobStepDetail.find('[data-form-param="readCount"]').val(commonUtil.convertNumberFormat(batchStepOMM.readCount));
                        that.$jobStepDetail.find('[data-form-param="writeCount"]').val(commonUtil.convertNumberFormat(batchStepOMM.writeCount));
                        that.$jobStepDetail.find('[data-form-param="filterCount"]').val(commonUtil.convertNumberFormat(batchStepOMM.filterCount));
                        that.$jobStepDetail.find('[data-form-param="readSkipCount"]').val(commonUtil.convertNumberFormat(batchStepOMM.readSkipCount));
                        that.$jobStepDetail.find('[data-form-param="writeSkipCount"]').val(commonUtil.convertNumberFormat(batchStepOMM.writeSkipCount));
                        that.$jobStepDetail.find('[data-form-param="processSkipCount"]').val(commonUtil.convertNumberFormat(batchStepOMM.processSkipCount));
                        that.$jobStepDetail.find('[data-form-param="commitCount"]').val(commonUtil.convertNumberFormat(batchStepOMM.commitCount));
                        that.$jobStepDetail.find('[data-form-param="rollbackCount"]').val(commonUtil.convertNumberFormat(batchStepOMM.rollbackCount));
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            }
        });
    }
);