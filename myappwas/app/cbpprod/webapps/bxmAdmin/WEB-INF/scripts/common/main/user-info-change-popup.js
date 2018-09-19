define(
    [
        'common/util',
        'common/component/popup/popup',
        'text!common/main/user-info-change-popup-tpl.html'
    ],
    function(
        commonUtil,
        Popup,
        tpl
    ) {
        return Popup.extend({
            className: 'md-small',

            templates: {
                tpl: tpl
            },

            events: {
            	'click .save-user-info-btn': 'saveUserInfo',
                'click .cancel-btn': 'close'
            },

            initialize: function() {
            	var that = this;
            	
            	that.$el.html(that.tpl());
            	
            	that.$userInfoChangeDetail = that.$el.find('.user-info-change-detail');
            	
            },

            render: function(userId) {
            	var that = this,
            		requestParam;
            	
            	//요청 객체 생성
            	requestParam = commonUtil.getBxmReqData(
            			'InfoChangeService', 'getUserInfo',	'InfoChangeOMM', 
            			{
            				userId: userId
            			}
            	);
            	
            	// Ajax 요청
            	commonUtil.requestBxmAjax(requestParam, {
            		success: function(response) {
            			var formData = response.InfoChangeOMM;
            			
            			commonUtil.makeFormFromParam(that.$userInfoChangeDetail, formData);
            			that.$userInfoChangeDetail.find('[data-form-param="checkPwd"]').val(formData.userPwd);
            			that.setDraggable();
            			that.show();
            		}
            	});
            	
            },
            
            saveUserInfo: function() {
            	var that= this,
            		requestParam,
            		userPwd,
            		checkPwd,
            		formParam,
            		$askFormItems;
            		
            	// 폼 파라미터 객체 생성
                formParam =  commonUtil.makeParamFromForm(that.$userInfoChangeDetail);

                // 필수값 체크
                $askFormItems = that.$userInfoChangeDetail.find('.asterisk');

                for(var i = 0 ; i < $askFormItems.length; i++){
                    var $askFormItem = $($askFormItems[i]),
                        key = $askFormItem.find('[data-form-param]').attr('data-form-param'),
                        msg = $askFormItem.find('.bw-label').text();

                    if(!formParam[key]) {
                        swal({type: 'warning', title: '', text: msg + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }
                }
            		
                // 비밀번호 체크
                userPwd = that.$userInfoChangeDetail.find('[data-form-param="userPwd"]').val();
                checkPwd = that.$userInfoChangeDetail.find('[data-form-param="checkPwd"]').val();

                if(userPwd !== checkPwd) {
                    swal({type: 'warning', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                // Email validation
                if (formParam.email && !/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(formParam.email)) {
                    swal({type: 'warning', title: '', text: bxMsg('common.invalid-email-warning'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }	
            		
            	//요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                        'InfoChangeService', 'updateUserInfo', 'InfoChangeOMM',
                        formParam
                    );
            		
             // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            that.close();
                        }else if(code === 201){
                            swal({type: 'error', title: '', text: bxMsg('common.save-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    }
                });
            		
            	
            }


        });
    }
);
