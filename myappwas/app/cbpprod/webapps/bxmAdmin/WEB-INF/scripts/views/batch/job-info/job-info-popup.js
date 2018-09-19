define(
    [
        'common/config',
        'common/util',
        'common/component/popup/popup',
        'views/batch/daemon-info/commit-setting-popup',
        'text!views/batch/job-info/job-info-popup-tpl.html'
    ],
    function(
        commonConfig,
        commonUtil,
        Popup,
        CommitSettingPopup,
        tpl
    ) {
        return Popup.extend({

            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .add-commit-setting-btn': 'openAddCommitSettingPopup',
                'click .save-job-info-btn': 'saveJobInfo',
                'click .cancel-btn': 'close'
            },

            mode: '', // add, edit

            initialize: function() {
                var that = this;

                // Set SubViews
                that.subViews['commitSettingPopup'] = new CommitSettingPopup();
                that.subViews['commitSettingPopup'].on('add-commit-setting', function(value) {
                    that.$el.find('input[data-form-param="commitCfgList"]').val(value);
                });
            },

            render: function(jobInfoData) {
                this.mode = jobInfoData ? 'edit' : 'add';

                this.$el.html(this.tpl(jobInfoData));
                this.renderCode(jobInfoData);

                this.setDraggable();

                this.show();
            },

            renderCode: function(jobInfoData) {
                // remove 'batchType' field
                if (commonConfig.extraOption && commonConfig.extraOption['BatchTypeField'] === 'hide') {
                    this.$el.find('.batch-type-field').remove();      // remove 'batchType' column
                } else {
                    this.$el.find('select[data-form-param="jobTypeCd"]')
                        .html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0012']));
                }

                this.$el.find('select[data-form-param="logLvNm"]')
                    .html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0009']));
                commonUtil.setDatePicker(this.$el.find('input[data-form-param="jobUseStartDt"]'), 'yy-mm-dd');
                commonUtil.setDatePicker(this.$el.find('input[data-form-param="jobUseEndDt"]'), 'yy-mm-dd');

                //// Edit mode일 경우 값 세팅 ////
                if(this.mode === 'edit') {
                    commonUtil.makeFormFromParam(this.$el.find('.job-info-form'), jobInfoData);
                }
            },

            openAddCommitSettingPopup: function() {
                this.subViews['commitSettingPopup'].render(this.$el.find('input[data-form-param="commitCfgList"]').val());
            },

            saveJobInfo: function() {
                var that = this,
                    operation,
                    requestParam,
                    $jobInfoForm = this.$el.find('.job-info-form'),
                    formParam,
                    $askFormItems;

                // 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm($jobInfoForm);

                // 필수값 체크
                $askFormItems = $jobInfoForm.find('.asterisk');

                for(var i = 0 ; i < $askFormItems.length; i++){
                    var $askFormItem = $($askFormItems[i]),
                        key = $askFormItem.find('[data-form-param]').attr('data-form-param'),
                        msg = $askFormItem.find('.bw-label').text();

                    if(!formParam[key]) {
                        swal({type: 'warning', title: '', text: msg + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }
                }

                
                // 요청 객체 생성
                formParam.jobUseStartDt = formParam.jobUseStartDt.replace(/-/g, '');
                formParam.jobUseEndDt = formParam.jobUseEndDt.replace(/-/g, '');
                operation = (that.mode === 'edit') ? 'editJob' : 'addJob';
                requestParam = commonUtil.getBxmReqData(
                    'BatchJobService', operation, 'BatchJobOMM',
                    formParam
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            (that.mode === 'edit') ? that.trigger('edit-job-info') : that.trigger('add-job-info');
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
    }
);