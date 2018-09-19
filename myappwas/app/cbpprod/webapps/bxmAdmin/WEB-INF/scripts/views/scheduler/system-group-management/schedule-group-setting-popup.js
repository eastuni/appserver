define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'common/component/loading-bar/_loading-bar',
        'text!views/scheduler/system-group-management/schedule-group-setting-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        Popup,
        LoadingBar,
        tpl
    ) {

        return Popup.extend({

            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-btn': 'saveItem',
                'click .cancel-btn': 'close'
            },

            mode: '', // add, edit

            initialize: function() {
                this.subViews['loadingBar'] = new LoadingBar();
            },

            render: function(data) {
                this.mode = data.scheduleGrpId ? 'edit' : 'add';

                this.$el.html(this.tpl(data));
                this.$formWrap = this.$el.find('.bxm-form-wrap');
                this.$formWrap.append(this.subViews['loadingBar'].render());

                this.renderCode(data);
                this.setDraggable();

                this.show();
            },

            renderCode: function(data) {
                var that = this;

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'ScheduleGroupService', 'getParentGroupList', 'ScheduleGroupInOMM',
                    {sysId: data.sysId}
                    ), {
                    beforeSend: function() {
                        that.subViews['loadingBar'].show();
                    },
                    success: function(response) {
                        that.$el.find('[data-form-param="parentScheduleGrpId"]').html(commonUtil.getCommonCodeOptionTag(response.ScheduleParentsGrpOMM.parentGroupList, true, bxMsg('common.not-selected')));
                        commonUtil.makeFormFromParam(that.$formWrap, data);
                    },
                    complete: function() {
                        that.subViews['loadingBar'].hide();
                    }
                });
            },

            saveItem: function() {
                var that = this,
                    operation,
                    requestParam,
                    formParam,
                    $askFormItems;

                // 폼 파라미터 객체 생성
                formParam = commonUtil.makeParamFromForm(that.$formWrap);

                // 필수값 체크
                $askFormItems = that.$formWrap.find('.asterisk');

                for(var i = 0 ; i < $askFormItems.length; i++){
                    var $askFormItem = $($askFormItems[i]),
                        key = $askFormItem.find('[data-form-param]').attr('data-form-param'),
                        msg = $askFormItem.find('.bw-label').text();

                    if(!formParam[key] && key !== 'parentScheduleGrpId') {
                        swal({type: 'warning', title: '', text: msg + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }
                }

                // 요청 객체 생성
                operation = (that.mode === 'edit') ? 'editScheduleGroup' : 'addScheduleGroup';
                requestParam = commonUtil.getBxmReqData(
                    'ScheduleGroupService', operation, 'ScheduleGroupOMM',
                    formParam
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            (that.mode === 'edit') ? that.trigger('edit-item', formParam.scheduleGrpId) : that.trigger('add-item');
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