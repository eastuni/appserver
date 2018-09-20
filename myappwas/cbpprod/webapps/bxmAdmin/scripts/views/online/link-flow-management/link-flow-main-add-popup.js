define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/popup/popup',
        'views/online/link-flow-management/link-start-trading-code-search-popup',
        'text!views/online/link-flow-management/link-flow-main-add-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        Popup,
        LinkStartTradingCodeSearchPopup,
        tpl
    ) {

        var LinkFlowMainAddPopup = Popup.extend({

            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-btn': 'save',
                'click .cancel-btn': 'close',

                'click .search-link-start-trading-code-btn': 'openSearchLinkStartCodePopup',

                'click [name="changeLinkMain"]': 'checkLinkMainCode',
                'change [data-form-param="linkOutputCheckYn"]': 'checkLinkOutputFqn'
            },

            initialize: function() {
                var that = this;

                that.subViews['linkStartTradingCodeSearchPopup'] = new LinkStartTradingCodeSearchPopup({isStartingFilter: true});
                that.subViews['linkStartTradingCodeSearchPopup'].on('select-code', function(data) {
                    that.$el.find('[data-form-param="linkStartTrxCd"]').val(data.linkStartTrxCd);
                    that.$el.find('[data-form-param="linkMainCd"]').val(data.linkMainCd);
                    that.$el.find('[name="trxNm"]').val(data.linkStartTrxNm);
                    
                    if(data.linkCtrlFqn !== 'null') {
                    	that.$el.find('[name="linkCtrlFqn"]').val(data.linkCtrlFqn);
                    }
                });
            },

            render: function() {
                this.$el.html(this.tpl());

                this.$el.find('[data-form-param="linkOutputCheckYn"]').trigger('change');
                this.$el.find('[data-form-param="linkOutputMappingType"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0036'])).trigger('change');

                this.setDraggable();

                this.show();
            },

            openSearchLinkStartCodePopup: function() {
                this.subViews['linkStartTradingCodeSearchPopup'].render();
            },

            checkLinkMainCode: function(e) {
                var $target = $(e.currentTarget);

                if($target.is(':checked')){
                    $target.parent().siblings('[data-form-param="linkMainCd"]').prop('readonly', false);
                }else{
                    $target.parent().siblings('[data-form-param="linkMainCd"]').prop('readonly', true);
                }
            },

            save: function() {
                var that = this,
                    requestParam,
                    $form = this.$el.find('.link-flow-main-form'),
                    formParam,
                    $askFormItems;

                // 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm($form);

                // 필수값 체크
                $askFormItems = $form.find('.asterisk');

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
                    'LinkFlowMainService', 'addMainFlow', 'LinkFlowMainOMM',
                    formParam
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            that.trigger('add-link-flow-main');
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

            checkLinkOutputFqn: function(e) {
                var $target = $(e.currentTarget),
                    $checkTarget = this.$el.find('[data-form-param="linkOutputFqn"]').parent();

                if($target.val() === 'Y') {
                    $checkTarget.addClass('asterisk');
                }else{
                    $checkTarget.removeClass('asterisk');
                }
            }
        });

        return LinkFlowMainAddPopup;
    }
);