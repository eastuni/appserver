define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'text!views/trx-setting/test-parameter/test-parameter-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        Popup,
        tpl
    ) {

        var TestParameterPopup = Popup.extend({

            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-test-param-btn': 'saveTestParam',
                'click .cancel-btn': 'close'
            },

            mode: '', // add, edit

            initialize: function() {},

            render: function(testParamData) {
                this.mode = testParamData ? 'edit' : 'add';

                this.$el.html(this.tpl(testParamData));

                this.renderCode(testParamData);
                this.renderDatePicker();

                this.setDraggable();

                this.show();
            },

            renderCode: function(testParamData) {
                var $testKeyTypeSelect,
                    $testEaiIdSelect;

                //// 테스트 구분 코드 ////
                $testKeyTypeSelect =  this.$el.find('select[data-form-param="testKeyTypeCd"]');
                $testKeyTypeSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMRT0008']));

                //// 테스트 EAI ID 코드 ////
                $testEaiIdSelect =  this.$el.find('select[data-form-param="testEaiId"]');
                $testEaiIdSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0026']));

                //// SELECT 값 세팅 ////
                if(this.mode === 'edit') {
                    $testKeyTypeSelect.val(testParamData.testKeyTypeCd);
                    $testEaiIdSelect.val(testParamData.testEaiId);
                }
            },

            renderDatePicker: function() {
                commonUtil.setDatePicker(this.$el.find('input[data-form-param="testDt"]'));
            },

            saveTestParam: function() {
                var that = this,
                    operation,
                    requestParam,
                    $testParamForm = this.$el.find('.test-param-form'),
                    formParam,
                    $askFormItems;

                // 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm($testParamForm);

                // 필수값 체크
                $askFormItems = $testParamForm.find('.asterisk');

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
                operation = (that.mode === 'edit') ? 'editTestParam' : 'addTestParam';
                requestParam = commonUtil.getBxmReqData(
                    'TestParamService', operation, 'TestParamOMM',
                    formParam
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            (that.mode === 'edit') ? that.trigger('edit-test-param') : that.trigger('add-test-param');
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

        return TestParameterPopup;
    }
);