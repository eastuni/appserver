define(
    [
        'common/util',
        'common/component/popup/popup',
        'text!views/setting/menu-setting/menu-setting-popup-tpl.html'
    ],
    function(
        commonUtil,
        Popup,
        tpl
    ) {

        var MenuSettingPopup = Popup.extend({

            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-menu-btn': 'saveUser',
                'click .cancel-btn': 'close'
            },

            initialize: function() {},

            render: function(menuData) {
                this.$el.html(this.tpl(menuData));
                this.renderCode(menuData);

                this.setDraggable();

                this.show();
            },

            renderCode: function(menuData) {
                //// 사용 여부 코드 ////
                this.$el.find('select[data-form-param="useYn"]').val(menuData.useYn);
            },

            saveUser: function() {
                var that = this,
                    requestParam,
                    $menuSettingForm = this.$el.find('.menu-setting-form'),
                    formParam,
                    $askFormItems;

                // 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm($menuSettingForm);

                // 필수값 체크
                $askFormItems = $menuSettingForm.find('.asterisk');

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
                requestParam = commonUtil.getBxmReqData(
                    'UserMenuService', 'editUserMenu', 'UserMenuOMM',
                    formParam
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            that.trigger('edit-menu');
                            that.close();
                        }else if(code === 202){
                            swal({type: 'error', title: '', text: bxMsg('common.same-val-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    }
                });
            }

        });

        return MenuSettingPopup;
    }
);