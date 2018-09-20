define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'views/setting/studio-setting/namespace-setting-popup',
        'text!views/setting/studio-setting/studio-setting-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        Popup,
        NamespaceSettingPopup,
        tpl
    ) {

        return Popup.extend({

            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-studio-btn': 'saveStudio',
                'click .cancel-btn': 'close',
                'click .add-namespace-btn': 'showEditNamespacePopup'
            },

            mode: '', // add, edit

            initialize: function() {
                var that = this;

                // Set SubViews
                that.subViews['namespaceSettingPopup'] = new NamespaceSettingPopup();
                that.subViews['namespaceSettingPopup'].on('add-namespace', function() {
                    that.renderCode();
                    that.trigger('add-namespace');
                });
            },

            render: function(studioData) {
                this.mode = studioData ? 'edit' : 'add';

                this.$el.html(this.tpl(studioData));
                commonUtil.makeFormFromParam(this.$el.find('.studio-setting-form'), studioData);
                if (this.mode === 'add') this.renderCode();

                this.setDraggable();

                this.show();
            },

            renderCode: function() {
                var that = this,
                    requestParam,
                    $namespaceSelect = that.$el.find('select[data-form-param="namespace"]');

                // Search form NS코드 fill in
                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData('BuilderConfigService', 'getNamespaceList', 'EmptyOMM');

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var nsList = response.BuilderConfigNSListOMM.namespaceList,
                            $optionList = [];

                        // option 태그 렌더
                        nsList.forEach(function(nsCode) {
                            var option =
                                '<option value="' + nsCode.name + '">' +
                                nsCode.name + ' [' + nsCode.description + ']</option>';

                            $optionList.push(option);
                        });

                        $namespaceSelect.html($optionList);
                        $namespaceSelect.trigger('change');
                    }
                });
            },

            saveStudio: function() {
                var that = this,
                    operation,
                    requestParam,
                    $studioSettingForm = this.$el.find('.studio-setting-form'),
                    formParam,
                    $askFormItems;

                // 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm($studioSettingForm);

                // 필수값 체크
                $askFormItems = $studioSettingForm.find('.asterisk');

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
                operation = (that.mode === 'edit') ? 'editBuilderConfig' : 'addBuilderConfig';
                requestParam = commonUtil.getBxmReqData(
                    'BuilderConfigService', operation, 'BuilderConfigOMM',
                    formParam
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            (that.mode === 'edit') ? that.trigger('edit-studio') : that.trigger('add-studio');
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

            showEditNamespacePopup: function() {
                this.subViews['namespaceSettingPopup'].render();
            }
        });
    }
);
