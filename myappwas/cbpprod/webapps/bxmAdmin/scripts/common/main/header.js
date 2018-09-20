define(
    [
        'common/util',
        'common/config',
        'common/main/biz-date-detail-popup',
        'common/main/user-info-change-popup'
    ],
    function (
        commonUtil,
        commonConfig,
        BizDateDetailPopup,
        UserInfoChangePopup
    ) {

        var HeaderView = Backbone.View.extend({

            el: '#header',

            events: {
                'click .logo': 'refreshPage',

                'click .biz-date-detail-btn': 'showBizDateDetail',
                'click .user-info-change-btn': 'showUserInfoChange',
                'click .change-theme-btn': 'toggleChangeThemePopup',
                'click .change-theme-item': 'changeTheme',
                'mouseover .util-sub': 'stopPropagation',
                'click .logout-btn': 'logout'
            },

            userId: null,
            initialize: function () {
            	this.$el.find('.biz-date-detail-btn').attr('title', bxMsg('common.biz-date-detail'));
                this.$el.find('.user-info-change-btn').attr('title', bxMsg('common.user-info-change-title'));
                this.$el.find('.change-theme-btn').attr('title', bxMsg('common.theme-setting'));
                this.$el.find('.logout-btn').attr('title', bxMsg('common.logout'));

                this.subViews['bizDateDetailPopup'] = new BizDateDetailPopup();
                this.subViews['userInfoChangePopup'] = new UserInfoChangePopup();
                
                // Theme initialize
                var currentTheme = $.cookie('theme') || 'default';
                this.$el.find('.change-theme-item[data-theme="' + currentTheme + '"]').addClass('on');
                $('body').addClass(currentTheme);
            },

            /**
             * bizDt 영업일자
             * systemDesc 시스템설명
             * userNm 사용자명
             * roleNm 역할명
             * */
            renderHeaderInfo: function(param) {
            	
                if(!param.useBizDt) {
                	this.$el.find('.biz-date-option-tag').html('<i class="bw-icon i-25 i-cal"></i><span class="bw-input biz-date-text"></span>');
                }
            	
                this.$el.find('.biz-date-text').html(param.bizDt);
                this.$el.find('.system-text').html(param.systemDesc);
                this.$el.find('.user-text').html(param.userNm + ' ' + param.roleNm);
                this.$el.find('.domain-text').html(param.domain);
                this.userId = param.userId;
            },

            refreshPage: function (e) {
                e.preventDefault();

                location.reload();
            },

            showBizDateDetail: function () {
                this.subViews['bizDateDetailPopup'].render();
            },
            
            showUserInfoChange: function () {
            	
            	var that = this;
            	
            	swal({
            		title: bxMsg('common.user-info-change-title'), text: bxMsg('common.password-msg'), type: "input", inputType: "password",
            		showCancelButton: true, closeOnConfirm:false, inputPlacehoder: bxMsg('setting.pwd')
            	}, function(inputValue) {

            		if(inputValue === false) return false;
            		
            		if(inputValue.trim() === "") {
            			swal.showInputError(bxMsg('common.password-msg'));
                        return false;
            		}
            		
            		// 요청 객체 생성
                    requestParam = commonUtil.getBxmReqData(
                        'InfoChangeService', 'checkPassword', 'InfoChangeOMM',
                        {
                            userId: that.userId,
                            userPwd: inputValue
                        }
                    );
            		
                    // Ajax 요청
                    commonUtil.requestBxmAjax(requestParam, {
                        success: function(response) {
                            var code = response.ResponseCode.code;

                            if(code === 200){
                            	that.subViews['userInfoChangePopup'].render(that.userId);
                            	swal.close();
                            }else if(code === 201) {
                                swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            }
                        }
                    });
                    
            		
            	}
          			);
            },

            toggleChangeThemePopup: function(e) {
                commonUtil.closeTooltip();
                $(e.currentTarget).parent().find('.util-sub').toggleClass('on');
            },

            changeTheme: function (e) {
                var $target = $(e.currentTarget),
                    $selectedTarget;

                $selectedTarget = $target.siblings('.change-theme-item.on');

                $selectedTarget.removeClass('on');
                $target.addClass('on');

                var currentTheme = $target.attr('data-theme');
                $('body').removeClass($selectedTarget.attr('data-theme'))
                    .addClass(currentTheme);

                $.cookie('theme', currentTheme, { expires: 365 });
                $target.parent().removeClass('on');
            },

            stopPropagation: function(e) {
                e.stopPropagation();
            },

            logout: function () {
                swal({
                    type: 'warning', title: '', text: bxMsg('common.logout-msg'), showCancelButton: true, closeOnConfirm: false
                }, function () {
                    // JSON 객체 생성
                    var requestParam = commonUtil.getBxmReqData('AuthorityService', 'logoutOperation', 'LoginOMM');

                    // Ajax 요청
                    commonUtil.requestBxmAjax(requestParam, {
                        success: function() {
                            commonUtil.redirectLoginPage();
                        }
                    }, true);
                });
            }
        });

        return HeaderView;
    }
);