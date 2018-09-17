define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'common/component/loading-bar/_loading-bar',
        'text!views/batch/job-info/parameter-item-tpl.html',
        'text!views/batch/job-info/general-batch-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        Popup,
        LoadingBar,
        itemTpl,
        tpl
    ) {
        return Popup.extend({
            className: 'md-small',

            templates: {
                itemTpl: itemTpl,
                tpl: tpl
            },

            events: {
            	'change .step-exec-type': 'changeStepExecType',
            	
                'click .add-parameter-btn': 'addParameterSetting',
                'click .del-parameter-btn': 'delParameterSetting',

                'click .run-general-batch-btn': 'runGeneralBatch',
                'click .cancel-btn': 'close'
            },

            initialize: function() {
            	this.subViews['runLoadingBar'] = new LoadingBar();
            },

            render: function(jobInfoData) {
                this.$el.html(this.tpl(jobInfoData));
                this.loadNodeList();
                this.$el.find('.popup-title').text(commonConfig.comCdList['BXMAD0012']['G'] + ' ' + bxMsg('common.run'));
                this.$el.find('.general-batch-popup').parent().append(this.subViews['runLoadingBar'].render());
                this.$module = this.$el.find('.module');

                this.renderCode();
                this.setCrossMarks();
                this.setDraggable();

                this.show();
            },
            
            renderCode: function() {
            	var that= this;
            	
            	that.$el.find('select[data-form-param="stepExecuteType"]')
            	.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0042'], true, bxMsg('batch.step-exec-option-all-step')));
            
            	that.$el.find('.default-step-box').hide();
            	that.$el.find('.step-2-step-box').hide();
            },

            loadNodeList: function() {
                var that = this,
                    $runtimeInstanceList = that.$el.find('.runtime-instance-list');

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('RemoteExecuteService', 'getPropertyList', 'EmptyOMM'), {
                    success: function(response) {
                        var runtimeInstanceList = response.RuntimeInstanceListOMM.propList,
                            list = [];

                        runtimeInstanceList.forEach(function(instance) {
                            list.push('<tr>' +
                                '<td><input type="radio" name="instance" class="bw-input ipt-radio" data-form-param="bxmInstanceId" data-value="' + instance.bxmInstanceId + '"></td>' +
                                '<td>' + instance.nodeName + '</td>' +
                                '<td>' + instance.bxmInstanceId + '</td>' +
                                '</tr>');
                        });

                        if(list.length == 0) {
                        	list.push('<tr><td></td><td></td><td align="left">'+bxMsg('batch.no-exist-executing-node')+'</td></tr>');
                        }
                        $runtimeInstanceList.html(list);
                        $runtimeInstanceList.find('input').first().prop("checked", true);
                    }
                });
            },

            addParameterSetting: function(e) {
                $(e.currentTarget).parent().parent().after(this.itemTpl());
                this.setCrossMarks();
            },

            delParameterSetting: function(e) {
                $(e.currentTarget).parent().parent().remove();
                this.setCrossMarks();
            },

            setCrossMarks: function () {
                var parameterItems = this.$module.find('ul.parameter-items');

                if (parameterItems.length === 1) {
                    $(parameterItems[0]).find('.del-parameter-btn').remove();
                } else {
                    if (!$(parameterItems[0]).find('.del-parameter-btn').length) {
                        $(parameterItems[0]).find('.add-parameter-btn').after(
                            '<button type="button" class="bw-btn del-parameter-btn"><i class="bw-icon i-25 i-func-del"></i></button>'
                        )
                    }
                }
            },
            
            changeStepExecType: function(e) {
            	var that = this,
            		$target = $(e.currentTarget).val();
            	
            	that.$el.find('input[data-form-param="stepId"]').val('');
            	that.$el.find('input[data-form-param="startStepId"]').val('');
        		that.$el.find('input[data-form-param="endStepId"]').val('');
        		
            	if($target === '') {
            		that.$el.find('.default-step-box').hide();
            		that.$el.find('.step-2-step-box').hide();
            	} else if($target === 'SS') {
            		that.$el.find('input[data-form-param="startStepId"]').prop('readonly', false);
            		that.$el.find('input[data-form-param="endStepId"]').prop('readonly', false);
            		that.$el.find('.default-step-box').hide();
            		that.$el.find('.step-2-step-box').show();
            	} else {
            		that.$el.find('input[data-form-param="stepId"]').prop('readonly', false);
            		that.$el.find('.default-step-box').show();
            		that.$el.find('.step-2-step-box').hide();
            	}
            },

            getParameterItems: function() {
                var $parameterItems,
                    $parameterItem,
                    parameterList = [],
                    parameterKey,
                    parameterValue;

                $parameterItems = this.$el.find('.parameter-items');

                for(var i = 0; i < $parameterItems.length; i++){
                    $parameterItem = $($parameterItems[i]);

                    parameterKey = $parameterItem.find('.parameter-key-input').val().trim();
                    parameterValue = $parameterItem.find('.parameter-value-input').val().trim();

                    if(!parameterKey && !parameterValue) continue;

                    if(!parameterKey) {
                        swal({type: 'warning', title: '', text: bxMsg('batch.parameter-key-error'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }

                    if(!parameterValue) {
                        swal({type: 'warning', title: '', text: bxMsg('batch.parameter-value-error'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }

                    parameterList.push(parameterKey + '=' + parameterValue);
                }

                return parameterList.length ? parameterList.join(';') + ';' : '';
            },

            runGeneralBatch: function() {
                var that = this,
                    requestParam,
                    $generalBatchPopup = this.$el.find('.general-batch-popup'),
                    formParam,
                    inputParam = {};

                if (!that.$el.find('.runtime-instance-list').find('input').length) {
                    swal({type: 'warning', title: '', text: bxMsg('common.no-instance-to-execute-warning'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                // 폼 파라미터 객체 생성
                formParam = commonUtil.makeParamFromForm($generalBatchPopup);
                formParam.parameter = that.getParameterItems();

                if(formParam.stepExecuteType === 'SS' && formParam.startStepId === '' && formParam.endStepId === '') {
                	swal({type: 'warning', title: '', text: bxMsg('batch.step-ids-warning-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }
                
                if(formParam.stepExecuteType !== 'SS' && formParam.stepExecuteType !== '' && formParam.stepId === '') {
                	swal({type: 'warning', title: '', text: bxMsg('batch.step-ids-warning-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                inputParam.bxmAppId = formParam.bxmAppId;
                inputParam.bxmInstanceId = formParam.bxmInstanceId;
                inputParam.jobId = formParam.jobId;
                inputParam.parameter = formParam.parameter;
                inputParam.stepExecuteType = formParam.stepExecuteType;
                
                if(formParam.stepExecuteType === 'SS') {
                	inputParam.stepId = formParam.startStepId + ',' + formParam.endStepId;
                } else {
                	inputParam.stepId = formParam.stepId;
                }
                
                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'RemoteExecuteService', 'executeRemoteBatch', 'RemoteExecuteOMM',
                    inputParam
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['runLoadingBar'].show();
                    },
                    success: function(response) {
                        var code = response.RemoteExecuteOMM.responseCode;

                        switch (code) {
                            case 1000:
                            case 1001:
                            case 1002:
                            case 1003:
                            case 1004:
                                swal({type: 'success', title: '', text: bxMsg('batch.run-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                that.close();
                                break;
                            case 1005:
                                swal({type: 'error', title: '', text: bxMsg('batch.run-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                break;
                            case 1006:
                                swal({type: 'error', title: '', text: bxMsg('batch.batch-app-not-exist-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                break;
                            case 1007:
                                swal({type: 'error', title: '', text: bxMsg('batch.batch-job-not-exist-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                break;
                            case 1008:
                                swal({type: 'error', title: '', text: bxMsg('batch.remote-execution-error'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                break;
                            default:
                                swal({type: 'error', title: '', text: bxMsg('batch.run-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    },
                    complete: function() {
                        that.subViews['runLoadingBar'].hide();
                    }
                });
            }
        });
    }
);
