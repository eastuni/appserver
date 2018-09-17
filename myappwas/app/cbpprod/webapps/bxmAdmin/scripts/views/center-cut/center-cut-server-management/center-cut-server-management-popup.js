define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'text!views/center-cut/center-cut-server-management/center-cut-server-management-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        Popup,
        tpl
    ) {
        return Popup.extend({

            className: 'md-large',

            templates: {
                'tpl': tpl
            },

            events: {
                'change select[data-form-param="svrType"]': 'validateAutoSvrYn',
                'change select[data-form-param="useYn"]': 'validateAutoSvrYn',

                'click .save-btn': 'saveItem',
                'click .cancel-btn': 'close'
            },

            mode: '', // add, edit

            initialize: function() {
                this.autoSvrYnSelectTemp = '<select class="bw-input ipt-select w-60" data-form-param="autoSvrYn">\
                    <option value="Y">Y</option>\
                    <option value="N" selected>N</option>\
                    </select>';

                this.autoSvrYnInputTemp = '<input type="text" class="bw-input w-60" data-form-param="autoSvrYn" value="N" readonly/>';
            },

            render: function(data) {
                this.mode = data ? 'edit' : 'add';

                this.$el.html(this.tpl(data));
                this.$formWrap = this.$el.find('.bxm-form-wrap');

                this.initializeView();
                
                this.renderCode(data);

                this.setDraggable();

                this.show();
            },

            initializeView: function(){
            	var that = this;

            	that.svrTypeSelect = that.$formWrap.find('select[data-form-param="svrType"]');
                that.useYnSelect = that.$formWrap.find('select[data-form-param="useYn"]');

            	// render select tags
                that.svrTypeSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMCC0017']));
            },
            
            renderCode: function(data) {
                if (this.mode === 'edit') {
                    commonUtil.makeFormFromParam(this.$formWrap, data);

                    this.validateAutoSvrYn();
                }
            },

            validateAutoSvrYn: function () {
                if (this.svrTypeSelect.val() === 'P' || this.useYnSelect.val() === 'N') {
                    var autoSvrYnSelect = this.$formWrap.find('select[data-form-param="autoSvrYn"]');
                    autoSvrYnSelect.after(this.autoSvrYnInputTemp);
                    autoSvrYnSelect.remove();
                } else {
                    var autoSvrYnInput = this.$formWrap.find('input[data-form-param="autoSvrYn"]');
                    autoSvrYnInput.after(this.autoSvrYnSelectTemp);
                    autoSvrYnInput.remove();
                }
            },

            saveItem: function() {
                var that = this,
                    operation,
                    requestParam,
                    formParam,
                    $askFormItems;

                // 폼 파라미터 객체 생성
                formParam = commonUtil.makeParamFromForm(this.$formWrap);

                // 필수값 체크
                $askFormItems = this.$formWrap.find('.asterisk');

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
                operation = (that.mode === 'edit') ? 'modifyCcNode' : 'createCcNode';
                requestParam = commonUtil.getBxmReqData(
                    'SCC1008', operation, 'SCC100802In',
                    formParam,
                    'bxmAdminCC'
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            (that.mode === 'edit') ? that.trigger('edit-item') : that.trigger('add-item');
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