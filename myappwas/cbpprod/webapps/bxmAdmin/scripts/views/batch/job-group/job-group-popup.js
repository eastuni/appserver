define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'text!views/batch/job-group/job-group-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        Popup,
        tpl
    ) {

        var JobGroupPopup = Popup.extend({

            className: 'md-small',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-job-group-btn': 'saveJobGroup',
                'click .cancel-btn': 'close'
            },

            mode: '', // add, edit

            initialize: function() {},

            render: function(jobGroupData) {
                this.mode = jobGroupData ? 'edit' : 'add';

                this.$el.html(this.tpl(jobGroupData));

                this.renderCode(jobGroupData);

                this.setDraggable();

                this.show();
            },

            renderCode: function(jobGroupData) {
                //// SELECT 값 세팅 ////
                if(this.mode === 'edit') {
                    //// 사용 여부 ////
                    this.$el.find('select[data-form-param="useYn"]').val(jobGroupData.useYn);
                }
            },

            saveJobGroup: function() {
                var that = this,
                    operation,
                    requestParam,
                    $jobGroupForm = this.$el.find('.job-group-form'),
                    formParam,
                    $askFormItems,
                    isFormat,
                    $checkItem,
                    checkItemVal,
                    sysMaxExecCnt,
                    nodeMaxExecCnt,
                    checkItemTitle;

                // 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm($jobGroupForm);

                // 필수값 체크
                $askFormItems = $jobGroupForm.find('.asterisk');

                for(var i = 0 ; i < $askFormItems.length; i++){
                    var $askFormItem = $($askFormItems[i]),
                        key = $askFormItem.find('[data-form-param]').attr('data-form-param'),
                        msg = $askFormItem.find('.bw-label').text();

                    if(!formParam[key]) {
                        swal({type: 'warning', title: '', text: msg + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }
                }

                // 시스템 최대 실행 수 포맷 체크
                isFormat = /^[0-9]+$/;
                $checkItem = $jobGroupForm.find('[data-form-param="sysMaxExecCnt"]');
                sysMaxExecCnt = $checkItem.val().trim();
                checkItemTitle = $checkItem.parent().find('.bw-label').text() + ' ' + $checkItem.parent().find('.fa-question-circle').attr('title');

                if(!isFormat.test(sysMaxExecCnt)){
                    swal({type: 'warning', title: '', text: checkItemTitle, timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                // 노드 최대 실행 수 포맷 체크
                isFormat = /^[0-9]+$/;
                $checkItem = $jobGroupForm.find('[data-form-param="nodeMaxExecCnt"]');
                nodeMaxExecCnt = $checkItem.val().trim();
                checkItemTitle = $checkItem.parent().find('.bw-label').text() + ' ' + $checkItem.parent().find('.fa-question-circle').attr('title');

                if(!isFormat.test(nodeMaxExecCnt)) {
                    swal({type: 'warning', title: '', text: checkItemTitle, timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }
                
                if(sysMaxExecCnt < nodeMaxExecCnt) {
                	swal({type: 'warning', title: '', text: bxMsg('batch.batch-group-node-warning-msg'), showConfirmButton: true});
                	return;
                }

                // 요청 객체 생성
                operation = (that.mode === 'edit') ? 'editGroup' : 'addGroup';
                requestParam = commonUtil.getBxmReqData(
                    'BatchGroupService', operation, 'BatchGroupOMM',
                    formParam
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            (that.mode === 'edit') ? that.trigger('edit-job-group') : that.trigger('add-job-group');
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

        return JobGroupPopup;
    }
);