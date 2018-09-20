define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'text!views/setting/commoncode-setting/common-topcode-setting-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        Popup,
        tpl
    ) {

        return Popup.extend({

            className: 'md-small',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-common-topcode-btn': 'saveCommonTopCode',
                'click .cancel-btn': 'close',
                'click .auto-generate-check': 'changeAutoGenerateCheck',

                'change select[data-form-param="category"]': 'changeCodeName',
                'change select[data-form-param="subCategory"]': 'changeCodeName'
            },

            initialize: function() {},

            render: function() {
                this.$el.html(this.tpl());
                this.renderCode();
                this.changeCodeName();

                this.setDraggable();

                this.show();
            },

            renderCode: function() {
                var that = this,
                    requestParam,
                    $categorySelect = that.$el.find('select[data-form-param="category"]'),
                    $subCategorySelect = that.$el.find('select[data-form-param="subCategory"]'),
                    $parentCdIdSelect = that.$el.find('select[data-form-param="parentCdId"]');

                $categorySelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0007']));
                $subCategorySelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0008']));

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData('CommonCodeService', 'getTopCodeList', 'EmptyOMM');

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var commonCodeList = response.CommonCodeListOMM.commonCodeList,
                            $optionList = ['<option value="" selected>' + bxMsg('setting.no-parent-code') + '</option>'];

                        // option 태그 렌더
                        commonCodeList.forEach(function(commonCode) {
                            var option =
                                '<option value="' + commonCode.cdId + '" data-name="'+ commonCode.cdId +'">[' +
                                commonCode.cdId + "]" + commonCode.cdNm +
                                '</option>';

                            $optionList.push(option);
                        });

                        $parentCdIdSelect.html($optionList);
                    }
                });
            },

            saveCommonTopCode: function() {
                var that = this,
                    requestParam,
                    $commonTopCodeSettingForm = this.$el.find('.common-topcode-setting-form'),
                    formParam,
                    $askFormItems;

                // 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm($commonTopCodeSettingForm);

                // 필수값 체크
                $askFormItems = $commonTopCodeSettingForm.find('.asterisk');

                for(var i = 0 ; i < $askFormItems.length; i++){
                    var $askFormItem = $($askFormItems[i]),
                        key = $askFormItem.find('[data-form-param]').attr('data-form-param'),
                        msg = $askFormItem.find('.bw-label').text();

                    if (key === 'cdId') key = 'cdIdNo';

                    if(!formParam[key]) {
                        swal({type: 'warning', title: '', text: msg + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }
                }

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'CommonCodeService', 'addCommonTopCode', 'CommonTopCodeOMM',
                    {
                        cdId: formParam.cdId + formParam.cdIdNo,
                        cdNm: formParam.cdNm,
                        parentCdId: formParam.parentCdId
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            that.trigger('add-common-topcode');
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

            changeCodeName: function() {
                var that = this,
                    $categorySelect = that.$el.find('select[data-form-param="category"]'),
                    $subCategorySelect = that.$el.find('select[data-form-param="subCategory"]'),
                    $cdIdSelect = that.$el.find('input[data-form-param="cdId"]');

                $cdIdSelect.val($categorySelect.val() + $subCategorySelect.val());
            },

            changeAutoGenerateCheck: function(e) {
                var $target = $(e.currentTarget),
                    $cdIdNoInput = this.$el.find('input[data-form-param="cdIdNo"]');

                if($target.is(':checked')){
                    $cdIdNoInput.prop('disabled', true);
                    $cdIdNoInput.attr('placeholder', '');
                    $cdIdNoInput.parent().removeClass('asterisk');
                }else{
                    $cdIdNoInput.prop('disabled', false);
                    $cdIdNoInput.attr('placeholder', '0001');
                    $cdIdNoInput.parent().addClass('asterisk');
                }
            }
        });
    }
);
