define (
	[
	 'common/util',
	 'common/config',
	 'common/component/popup/popup',
	 'text!views/setting/ondemandurl-setting/ondemandurl-setting-popup-tpl.html'
	 ],
	 function(
		commonUtil,
		commonConfig,
		Popup,
		tpl
	 ) {
		
			var BatchUrlSettingPopup = Popup.extend({
				
				className: 'md-large',
				
				templates: {
					'tpl':tpl
				},
				
				events: {
					'change .url-type-select': 'changeUrlType',
					'click .save-batchurl-btn': 'saveBatchUrl',
					'click .cancel-btn': 'close'
				},
				
				mode: '',
				
				initialize: function() {},
				
				render: function(batchUrlData) {
					this.mode = batchUrlData ? 'edit' : 'add';
					
					this.$el.html(this.tpl(batchUrlData));
					this.loadCode(batchUrlData);
					
					this.setDraggable();	//팝업 드래그 가능?
					
					this.show();
				},
				
				loadCode: function(batchUrlData) {
					
					var $typeSelect,
						$useYnSelect,
						$urlTypeSelect;
					
					$typeSelect = this.$el.find('select[data-form-param="batchUrlTypeCd"]');
					$typeSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0004'], false));
					(this.mode === 'edit') ? $typeSelect.val(batchUrlData.batchUrlTypeCd) : $typeSelect.val('1');
					
					$useYnSelect = this.$el.find('select[data-form-param="useYn"]');
					(this.mode === 'edit') ? $useYnSelect.val(batchUrlData.useYn) : $useYnSelect.val('Y');
					
					$urlTypeSelect = this.$el.find('select[data-form-param="urlTypeCd"]');
					$urlTypeSelect.html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0041'], false));
					if(this.mode === 'edit') {
						$urlTypeSelect.val(batchUrlData.urlTypeCd);
						(batchUrlData.urlTypeCd === 'O') ? $typeSelect.val('').prop('disabled', true) : null;
					} else {
						$urlTypeSelect.val('B');
					}
				},
				
				changeUrlType: function(e) {
					var that = this,
						urlType = e && $(e.currentTarget).val();
					
					if(urlType == 'O') {
						that.$el.find('select[data-form-param="batchUrlTypeCd"]').val('').prop('disabled', true);
					} else {
						that.$el.find('select[data-form-param="batchUrlTypeCd"]').val('1').prop('disabled', false);
					}
				},
				
				saveBatchUrl: function() {
					var that = this,
						operation,
						requestParam,
						$batchUrlSettingForm = this.$el.find('.batchurl-setting-form'),
						formParam,
						$askFormItems;
				
					// admin-common.js 의 makeParamFromForm 사용, form 변수는 상단에 정의
					formParam = commonUtil.makeParamFromForm($batchUrlSettingForm);
					
					$askFormItems = $batchUrlSettingForm.find('.asterisk');
					
					for(var i = 0 ; i < $askFormItems.length; i++){
						var $askFormItem = $($askFormItems[i]),
							key = $askFormItem.find('[data-form-param]').attr('data-form-param'),
							msg = $askFormItem.find('.bw-label').text();
						
						if(!formParam[key]) {
							swal({type: 'warning', title: '', text: msg + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
							return;
						}
					}
					
					//요청 객체 생성
					operation = (that.mode === 'edit') ? 'editBatchUrl' : 'addBatchUrl';
					
					requestParam = commonUtil.getBxmReqData('BatchUrlService', operation, 'BatchUrlOMM', formParam);
					
					commonUtil.requestBxmAjax(requestParam, {
						success: function(response) {
							var code = response.ResponseCode.code;
							
							if(code === 200){
								swal({type: 'success', title:'', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
								(that.mode === 'edit') ? that.trigger('edit-batchurl') : that.trigger('add-batchurl');
								that.close();
							}else if(code === 201){
								swal({type: 'error', title:'', text: bxMsg('common.save-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
							}else if(code === 202){
								swal({type: 'error', title:'', text: bxMsg('common.same-val-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
							}
						}
					});
				}
				
			});
			
			return BatchUrlSettingPopup;
	}
);