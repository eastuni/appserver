/**
 * number 형식의 directive 로 검증을 지원 한다.
 */

const angular = require('angular');

const md = require('../views/page/page.module');

md.directive('commonStringNumberOnlyDirective', __commonStringNumberDirective);

 
/*
 * input 의 숫자를 검증 한다.
 */
function __commonStringNumberDirective($compile, $filter, $rootScope, $timeout, $commonConfig, $commonService) {
	

    return {
        restrict: 'A',
        compile: function (iElement, iAttrs, transclude) {
        	return {
        		pre: function ($scope, iElement, iAttrs, controller) {
//        			var i18n = $commonService.makeBxI18n();
//        			iElement.addClass("a-right");
        			var ctrlKey = 17,
        	        cmdKey = 91,
        	        vKey = 86,
        	        cKey = 67;

        			
        			var _option = {};
        			_option.ctrlDown = false; 
        			if(iAttrs.dec) {
        				_option.decimalPoint = Number(iAttrs.dec);
        			}
                	iElement.on({
                		'keydown' : function(e) {
                			if (e.keyCode == ctrlKey || e.keyCode == cmdKey) _option.ctrlDown = true;
                			return __strNumberchk(e, iElement, _option);
                		},
                		'keyup' : function(e) {
                			if (e.keyCode == ctrlKey || e.keyCode == cmdKey) _option.ctrlDown = false;
                			__strNumberchk(e, iElement, _option);
                		}
                	});
                	
                	/**
                	 * key down 이벤트 삭제 함수
                	 * 삭제할 대상을 받아서 처리 한다.
                	 */
                	$scope._removeNumericOnlyKeyDownEvent = function(_target) {
                		var __target = angular.element(_target);
                		
                		if(__target.length > 0) {
                			__target.removeAttr("common-string-number-only-directive");
                			__target.off("keydown");
                			$compile(__target)($scope);
                		}
                	};
                	
                	/**
                	 * key up 이벤트 삭제 함수 
                	 * 삭제할 대상을 받아서 처리 한다.
                	 */
                	$scope._removeNumericOnlyKeyUpEvent = function(_target) {
                		var __target = angular.element(_target);
                		
                		if(__target.length > 0) {
                			__target.removeAttr("common-string-number-only-directive");
                			__target.off("keyup");
                			$compile(__target)($scope);
                		}
                	};
                	
        		},
        		post: function ($scope, iElement, iAttrs, controller) {

        		}
        	};
        },
        link: function ($scope, iElement, iAttrs, ngModel) {
        	
        }
    };
}
/**
 * 숫자와 콤마, 점 만 입력
 * @param event
 */
function __strNumberchk(event, iElement, _option) {
    event = event || window.event;
    var keyID = (event.which) ? event.which : event.keyCode;
    console.log(keyID);
    var vKey = 86,
    cKey = 67;
    if(keyID == 13){ //enter
    	return true;
    }

    if (_option.ctrlDown && (keyID == vKey || keyID == cKey)){
    	return true;
    }
    var val = iElement.val();
    
     
    // keycode 검증
    if ((keyID >= 48 && keyID <= 57) || (keyID >= 96 && keyID <= 105) // 숫자, 키패드 숫자
    		|| keyID == 8 || keyID == 46 || keyID == 9 || keyID == 16 // backspace, delete, tab, Shift
    		|| keyID == 35 || keyID == 36 // home, end
    		|| keyID == 189 || keyID == 110 || keyID == 190 // -(189) .(110, 190)
    		|| keyID == 37 || keyID == 39) { // 화살표 <,  >
    	
    	// 소수점 사용
    	if(_option.decimalPoint && _option.decimalPoint > 0) {
			
	    	var valArr = val.split('.');
	    	
	    	// 소수점이 2개 이상이면 false
	    	if(valArr.length > 2) {
	    		return false;
	    	}
    	} // end if
    	else { // 소수점 사용 안함.
    		if(keyID == 110 || keyID == 190 || keyID == 189) {
    			return false;
    		}
    	}
    }
    else {
      return false;
    }
} // end __numberchk
module.exports = md;
