define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/popup/popup',
        'common/popup/error-message-code-search/error-message-code-search',
        'views/deferred/deferred-job-management/manager-add-popup',
        'text!views/deferred/deferred-job-management/deferred-job-management-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        Popup,
        ErrorCodePopup,
        ManagerPopup,
        tpl
    ) {
        return Popup.extend({
            className: 'md-large low-z-index-popup',

            templates: {
                'tpl': tpl
            },

            events: {
            	'click .error-code-select': 'showErrorCodePopup',
            	'click .manager-search-btn': 'showUserPopup',
            	
            	'change .table-numbering-use': 'changeAsterisk',
            	
                'click .save-btn': 'saveItem',
                'click .cancel-btn': 'close'
            },

            mode: '',
            renderData: {},

            initialize: function() {
            	var that = this;
            	that.subViews['errorCodePopup'] = new ErrorCodePopup();
            	
            	that.subViews['errorCodePopup'].on('select-code', function(errorCodes){
            		that.$el.find('input[data-form-param="reprocAbleErrCd"]').val(errorCodes);
            	});
            	
            	that.subViews['managerPopup'] = new ManagerPopup();
            	
            	that.subViews['managerPopup'].on('select-code', function(userObject) {
            		that.$el.find('input[data-form-param="modifyUserId"]').val(userObject);
            	});
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

                // render select tags
                that.$detailWrap.find('select[data-form-param="startTypeCd"]')
                    .html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMDF0001']));
                that.$detailWrap.find('select[data-form-param="svcProcCd"]')
                    .html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMDF0002']));
                that.$detailWrap.find('select[data-form-param="deferredTranCd"]')
                	.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMDF0003']));
                that.$detailWrap.find('select[data-form-param="nodeExecYn"]')
                	.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMDF0010']));
            
                that.$tableNumberingAppId = that.$el.find('input[data-form-param="tableNumberingBxmAppId"]');
                that.$tableNumberingBeanNm = that.$el.find('input[data-form-param="tableNumberingBeanNm"]');
            },

            loadCode: function(data) {
                var that = this;
                that.renderData = data;

                if (data) {
                    commonUtil.makeFormFromParam(that.$detailWrap, data);
                    
                    if(data.tableNumberingUseYn === 'N') {
                    	that.$tableNumberingAppId.parent().removeClass('asterisk');
                		that.$tableNumberingBeanNm.parent().removeClass('asterisk');
                    } 
                }
            },
            
            changeAsterisk: function(e) {
            	var that = this,
            		target = $(e.currentTarget);
            	
            	if(target.val() === 'Y') {
            		that.$tableNumberingAppId.parent().addClass('asterisk');
            		that.$tableNumberingBeanNm.parent().addClass('asterisk');
            	} else {
            		that.$tableNumberingAppId.parent().removeClass('asterisk');
            		that.$tableNumberingBeanNm.parent().removeClass('asterisk');
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
                
                if(formParam.errStopYn == 'Y' && formParam.errSkipYn == 'Y') {
                	swal({type: 'warning', title: bxMsg('deferred.errorReprocessSetting'), text: bxMsg('deferred.errorReprocessMsg'), showConfirmButton: true});
                	return;
                }

                // Ajax request
                operation = (that.mode === 'edit') ? 'updateDfrdMain' : 'insertDfrdMain';


                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('DfrdMainMngtService', operation, 'DfrdMain01IO', formParam), {
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
            },
            
            showErrorCodePopup: function() {
            	 this.subViews['errorCodePopup'].render({
                     errorCodes: this.$el.find('input[data-form-param="reprocAbleErrCd"]').val()
                 });
            },
            
            showUserPopup: function() {
            	this.subViews['managerPopup'].render();
            }
        });
    }
);
