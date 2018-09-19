/**
 * time 형식의 directive 로 검증을 지원 한다.
 */

const angular = require('angular');

const md = require('../views/page/page.module');

md.directive('commonTimeValidDirective', __commonTimeValidDirective);


/*
 * input 의 시간을 검증 한다.
 */
function __commonTimeValidDirective($compile, $rootScope, $timeout, $commonConfig, $commonService) {

    return { 
        restrict: 'A',
        compile: function (iElement, iAttrs, transclude) {
        	return {
        		pre: function ($scope, iElement, iAttrs, controller) {

        			iElement.attr("placeholder", "--:--:--");
        			iElement.mask("99:99:99", {placeholder:"--:--:--"});
        			iElement.addClass("ipt-time");
        			
        			let i18n = $commonService.makeBxI18n();
                	
                	iElement.on({
                		'change' : function() {
                			
                			let veiwVal = angular.element(this).val();
                			
                			if(!$commonService.fn_isNull(veiwVal)) {
                				let realVal = $commonService.fn_getTimeValue(veiwVal);
                				
                				// 길이 검증
                				if(realVal.length !== 6) {
                					__error($commonService, i18n.getValue("{%=cbb_items.ABRVTN#chk%}"), i18n.getValue("{%=cbb_err_msg.AUICME0047%}"), this);
                					return false;
                				}
                				
                				//숫자 체크
                				if(!$.isNumeric(realVal)) {
                					__error($commonService, i18n.getValue("{%=cbb_items.ABRVTN#chk%}"), i18n.getValue("{%=cbb_err_msg.AUICME0046%}"), this);
                					return false;
                				}
                				 
                				// hh 시 검증
                				if(Number(realVal.substr(0, 2)) > 23 || Number(realVal.substr(0, 2)) < 0) {
                					__error($commonService, i18n.getValue("{%=cbb_items.ABRVTN#chk%}"), i18n.getValue("{%=cbb_err_msg.AUICME0048%}"), this);
                					return false;
                				}
                				
                				// mm 분 검증
                				if(Number(realVal.substr(2, 2)) > 59 || Number(realVal.substr(2, 2)) < 0) {
                					__error($commonService, i18n.getValue("{%=cbb_items.ABRVTN#chk%}"), i18n.getValue("{%=cbb_err_msg.AUICME0049%}"), this);
                					return false;
                				}
                				
                				// ss 초 검증
                				if(Number(realVal.substr(4, 2)) > 59 || Number(realVal.substr(4, 2)) < 0) {
                					__error($commonService, i18n.getValue("{%=cbb_items.ABRVTN#chk%}"), i18n.getValue("{%=cbb_err_msg.AUICME0050%}"), this);
                					return false;
                				}
                				
                				angular.element(this).css('color', '#666666');
                			}
                		}
                	});
                	
                	function __error($commonService, title, content, that) {
                		$commonService.alertSay({title : title, content : content});
                		angular.element(that).focus();
                		angular.element(that).css('color', 'red');
                	}
        		},
        		post: function ($scope, iElement, iAttrs, controller) {
        		
        		}
        	};
        },
        link: function ($scope, iElement, iAttrs) {
        	
        }
    };
}

module.exports = md;
