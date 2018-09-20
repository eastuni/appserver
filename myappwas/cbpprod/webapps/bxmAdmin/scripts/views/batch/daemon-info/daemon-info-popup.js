define(
    [
        'common/config',
        'common/util',
        'common/component/popup/popup',
        'views/batch/daemon-info/commit-setting-popup',
        'text!views/batch/daemon-info/daemon-info-popup-tpl.html'
    ],
    function(
        commonConfig,
        commonUtil,
        Popup,
        CommitSettingPopup,
        tpl
    ) {

        var AdminSettingPopup = Popup.extend({

            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'change .interval-cron-select': 'changeIntervalCron',
                'click .add-commit-setting-btn': 'openAddCommitSettingPopup',
                'click .save-daemon-info-btn': 'saveDaemonInfo',
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

            render: function(daemonInfoData) {
                this.mode = daemonInfoData ? 'edit' : 'add';

                this.$el.html(this.tpl(daemonInfoData));
                // textarea에 handlebars template을 이용해 값을 셋팅하면 newline이 적용되지 않아
                // jquery val()을 이용해 값 셋팅
                this.mode === 'edit' && this.$el.find('textarea[data-form-param="execArgs"]').val(daemonInfoData.execArgs);

                this.renderCode(daemonInfoData);
                this.setDraggable();

                this.show();
            },

            renderCode: function(daemonInfoData) {
                var $useYnSelect,
                    $logLvNmSelect,
                    $parllExecYnSelect,
                    $errStopYnSelect,
                    $intervalCronSelect;

                //// 로그 레벨 코드 ////
                $logLvNmSelect =  this.$el.find('select[data-form-param="logLvNm"]');
                $logLvNmSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0009']));

                //// SELECT 값 세팅 ////
                if(this.mode === 'edit') {
                    //// 사용 여부 코드 ////
                    $useYnSelect =  this.$el.find('select[data-form-param="useYn"]');
                    $useYnSelect.val(daemonInfoData.useYn);

                    //// 로그 레벨 코드 ////
                    $logLvNmSelect.val(daemonInfoData.logLvNm);

                    //// 병렬 실행 여부 코드 ////
                    $parllExecYnSelect =  this.$el.find('select[data-form-param="parllExecYn"]');
                    $parllExecYnSelect.val(daemonInfoData.parllExecYn);

                    //// 에러 중지 여부 코드 ////
                    $errStopYnSelect =  this.$el.find('select[data-form-param="errStopYn"]');
                    $errStopYnSelect.val(daemonInfoData.errStopYn);

                    //// 실행 시간 코드 ////
                    $intervalCronSelect =  this.$el.find('select.interval-cron-select');
                    daemonInfoData.cronExecCfgVal ? $intervalCronSelect.val('CRON') : $intervalCronSelect.val('INTERVAL');
                }
            },

            openAddCommitSettingPopup: function() {
                this.subViews['commitSettingPopup'].render(this.$el.find('input[data-form-param="commitCfgList"]').val());
            },

            saveDaemonInfo: function() {
                var that = this,
                    operation,
                    requestParam,
                    $daemonInfoForm = this.$el.find('.daemon-info-form'),
                    formParam,
                    $askFormItems,
                    isFormat,
                    $checkItem,
                    checkItemVal,
                    checkItemTitle;

                // 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm($daemonInfoForm);

                // 필수값 체크
                $askFormItems = $daemonInfoForm.find('.asterisk');

                for(var i = 0 ; i < $askFormItems.length; i++){
                    var $askFormItem = $($askFormItems[i]),
                        key = $askFormItem.find('[data-form-param]').attr('data-form-param'),
                        msg = $askFormItem.find('.bw-label').text();

                    if(!formParam[key]) {
                        swal({type: 'warning', title: '', text: msg + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }
                }

                // 실행 노드 번호 포맷 체크
                isFormat = /^[0-9,]+$/;
                $checkItem = $daemonInfoForm.find('[data-form-param="execNodeNoList"]');
                checkItemVal = $checkItem.val().trim();
                checkItemTitle = $checkItem.parent().find('.bw-label').text() + ' ' + $checkItem.parent().find('.fa-question-circle').attr('title');

                if(!isFormat.test(checkItemVal)){
                    swal({type: 'warning', title: '', text: checkItemTitle, timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                // 실행 시간 포맷 체크
                if($daemonInfoForm.find('.interval-cron-select').val() === 'INTERVAL') {
                    isFormat = /^[0-9]+$/;
                    $checkItem = $daemonInfoForm.find('[data-form-param="execIntervalSec"]');
                    checkItemVal = $checkItem.val().trim();
                    checkItemTitle = $checkItem.parent().find('.bw-label').text() + ' ' + $checkItem.parent().find('.fa-question-circle').attr('title');

                    if(!isFormat.test(checkItemVal)){
                        swal({type: 'warning', title: '', text: checkItemTitle, timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }
                }

                // 요청 객체 생성
                operation = (that.mode === 'edit') ? 'editDaemon' : 'addDaemon';
                requestParam = commonUtil.getBxmReqData(
                    'BatchDaemonService', operation, 'BatchDaemonOMM',
                    formParam
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            (that.mode === 'edit') ? that.trigger('edit-daemon-info') : that.trigger('add-daemon-info');
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
            },

            changeIntervalCron: function(e) {
                var $target = $(e.currentTarget),
                    $daemonInfoForm = this.$el.find('.daemon-info-form');

                if($target.val() === 'INTERVAL') {
                    $target.parent().find('.fa-question-circle').attr('title', bxMsg('batch.execute-time-msg'));
                    $daemonInfoForm.find('.interval-cron-input').attr('data-form-param', 'execIntervalSec').val('');
                }else{
                    $target.parent().find('.fa-question-circle').attr('title', bxMsg('batch.execute-time-msg2'));
                    $daemonInfoForm.find('.interval-cron-input').attr('data-form-param', 'cronExecCfgVal').val('');
                }
            }

        });

        return AdminSettingPopup;
    }
);