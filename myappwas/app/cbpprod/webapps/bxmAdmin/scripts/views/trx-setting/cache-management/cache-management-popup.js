define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/popup/popup',
        'text!views/trx-setting/cache-management/cache_management-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        Popup,
        tpl
    ) {
        return Popup.extend({
            className: 'md-large low-z-index-popup',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-btn': 'saveItem',
                'click .cancel-btn': 'close'
            },

            mode: '',
            renderData: {},

            initialize: function() {
            },

            render: function(data) {
                var that = this;
                that.mode = data ? 'edit' : 'add';

                that.$el.html(this.tpl(data));
                that.initializeView();
                that.loadCode(data);

                that.setDraggable();
                that.show();
            },

            initializeView: function () {
                var that = this;

                // DOM Element Cache
                that.$detailWrap = that.$el.find('.bxm-detail-wrap');
            },

            loadCode: function(data) {
                var that = this;
                that.renderData = data;

                if (data) {
                    commonUtil.makeFormFromParam(that.$detailWrap, data);
                }
            },

            saveItem: function() {
                var that = this,
                    $askFormItems = that.$detailWrap.find('.asterisk'),
                    formParam = commonUtil.makeParamFromForm(that.$detailWrap),
                    operation;

                // required values validation
                for(var i = 0 ; i < $askFormItems.length ; i++){
                    var $askFormItem = $($askFormItems[i]),
                        key = $askFormItem.find('[data-form-param]').attr('data-form-param') || $askFormItem.parent().find('[data-form-param]').attr('data-form-param'),
                        msg = $askFormItem.find('.bw-label').text() || $askFormItem.parent().find('.bw-label').text();

                    if(!formParam[key]){
                        swal({type: 'warning', title: '', text: msg + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }
                }
                
                // Ajax request
                operation = (that.mode === 'edit') ? 'editCacheInfo' : 'addCacheInfo';

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('CacheInfoService', operation, 'CacheOMM', formParam), {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            (that.mode === 'edit') ? that.trigger('edit-item') : that.trigger('add-item');
                            that.close();
                        } else if(code === 201){
                            swal({type: 'error', title: '', text: bxMsg('common.save-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        } else if(code === 202){
                            swal({type: 'error', title: '', text: bxMsg('common.same-val-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    }
                });
            }
        });
    }
);
