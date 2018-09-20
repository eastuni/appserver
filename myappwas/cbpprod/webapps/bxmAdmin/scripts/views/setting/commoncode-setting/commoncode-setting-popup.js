define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'views/setting/commoncode-setting/common-topcode-setting-popup',
        'text!views/setting/commoncode-setting/commoncode-setting-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        Popup,
        CommonTopCodeSettingPopup,
        tpl
    ) {

        return Popup.extend({

            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-commoncode-btn': 'saveCommonCode',
                'click .cancel-btn': 'close',
                'click .add-common-topcode-btn': 'showEditCommonTopCodePopup',

                'change select[data-form-param="cdId"]': 'changeCodeName'
            },

            mode: '', // add, edit

            initialize: function() {
                var that = this;

                // Set SubViews
                that.subViews['commonTopCodeSettingPopup'] = new CommonTopCodeSettingPopup();
                that.subViews['commonTopCodeSettingPopup'].on('add-common-topcode', function() {
                    that.renderCode();
                });
            },

            render: function(commonCodeData) {
                this.mode = commonCodeData ? 'edit' : 'add';

                this.$el.html(this.tpl(commonCodeData));
                this.renderCode(commonCodeData);

                this.setDraggable();

                this.show();
            },

            renderCode: function(commonCodeData) {
                var that = this,
                    requestParam,
                    $cdIdSelect = that.$el.find('select[data-form-param="cdId"]'),
                    $langCdSelect = that.$el.find('select[data-form-param="langCd"]');

                if (that.mode === 'add') {
                    $langCdSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0003']));

                    // 요청 객체 생성
                    requestParam = commonUtil.getBxmReqData('CommonCodeService', 'getTopCodeList', 'EmptyOMM');

                    // Ajax 요청
                    commonUtil.requestBxmAjax(requestParam, {
                        success: function(response) {
                            var commonCodeList = response.CommonCodeListOMM.commonCodeList,
                                $optionList = [];

                            // option 태그 렌더
                            commonCodeList.forEach(function(commonCode) {
                                var option =
                                    '<option value="' + commonCode.cdId + '" data-name="'+ commonCode.cdId +'">' +
                                    commonCode.cdNm +
                                    '</option>';

                                $optionList.push(option);
                            });

                            $cdIdSelect.html($optionList);
                            $cdIdSelect.trigger('change');
                        }
                    });
                } else {
                    commonUtil.makeFormFromParam(that.$el.find('.commoncode-setting-form'), commonCodeData);
                }
            },

            saveCommonCode: function() {
                var that = this,
                    operation,
                    requestParam,
                    $commonCodeSettingForm = this.$el.find('.commoncode-setting-form'),
                    formParam,
                    $askFormItems;

                // 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm($commonCodeSettingForm);

                // 필수값 체크
                $askFormItems = $commonCodeSettingForm.find('.asterisk');

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
                if(!/^[0-9,]+$/.test($commonCodeSettingForm.find('[data-form-param="seq"]').val().trim())){
                    swal({type: 'warning', title: '', text: bxMsg('setting.seq-no-number-error'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                // 요청 객체 생성
                operation = (that.mode === 'edit') ? 'editCommonCode' : 'addCommonCode';
                requestParam = commonUtil.getBxmReqData(
                    'CommonCodeService', operation, 'CommonCodeOMM',
                    formParam
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            (that.mode === 'edit') ? that.trigger('edit-commoncode') : that.trigger('add-commoncode');
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

            showEditCommonTopCodePopup: function() {
                this.subViews['commonTopCodeSettingPopup'].render();
            },

            changeCodeName: function(e) {
                var $target = $(e.currentTarget);

                $target.siblings('input').val($target.find('option:selected').attr('data-name'));
            }

        });
    }
);