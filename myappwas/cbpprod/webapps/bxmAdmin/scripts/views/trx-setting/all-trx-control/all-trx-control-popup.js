define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'text!views/trx-setting/all-trx-control/all-trx-control-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        Popup,
        tpl
    ) {

        var AllTrxControlPopup = Popup.extend({

            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-all-trx-control-btn': 'saveAllTrxControl',
                'click .cancel-btn': 'close'
            },

            initialize: function() {},

            render: function(allTrxControlData) {

                this.$el.html(this.tpl());

                this.renderCode(allTrxControlData);

                this.setDraggable();

                this.show();
            },

            renderCode: function(allTrxControlData) {
                //// 전체 거래 제어 여부 코드 ////
                this.$el.find('select[data-form-param="allTrxCtrlYn"]').val(allTrxControlData.allTrxCtrlYn);

                //// 일자 변경 거래 제어 여부 코드 ////
                this.$el.find('select[data-form-param="dtchgTrxCtrlYn"]').val(allTrxControlData.dtchgTrxCtrlYn);

                //// 이미지 로그 여부 코드 ////
                this.$el.find('select[data-form-param="imgLogYn"]').val(allTrxControlData.imgLogYn);

                //// DW 로그 여부 코드 ////
                this.$el.find('select[data-form-param="dwLogYn"]').val(allTrxControlData.dwLogYn);
            },

            saveAllTrxControl: function() {
                var that = this,
                    requestParam,
                    $allTrxControlForm = this.$el.find('.all-trx-control-form'),
                    formParam;

                // 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm($allTrxControlForm);

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'TRXControlService', 'editTrxControl', 'TestParamOMM',
                    formParam
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            that.trigger('edit-all-trx-control');
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

        return AllTrxControlPopup;
    }
);