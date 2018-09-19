/**
 * number 형식의 directive 로 검증을 지원 한다.
 */

const angular = require('angular');

const md = require('../views/page/page.module');

md.directive('commonNumericOnlyDirective', __commonNumericOnlyDirective);


/*
 * input 의 숫자를 검증 한다.
 */
function __commonNumericOnlyDirective($compile, $filter, $rootScope, $timeout, $commonConfig, $commonService) {
	
    return {
        restrict: 'A',
        compile: function (iElement, iAttrs, transclude) {
        	return {
        		pre: function ($scope, iElement, iAttrs, controller) {
        			var i18n = $commonService.makeBxI18n();
        			iElement.addClass("a-right");
        			
        			var _option = {};
        			
        			if(iAttrs.dec) {
        				_option.decimalPoint = Number(iAttrs.dec);
        			}
                	iElement.on({
                		'keydown' : function(e) {
                			return __numberchk(e, iElement, _option);
                		},
                		'keyup' : function(e) {
                			__vComma($scope, iElement, iAttrs, _option, $commonService);
                		}
                	});
                	
                	/**
                	 * key down 이벤트 삭제 함수
                	 * 삭제할 대상을 받아서 처리 한다.
                	 */
                	$scope._removeNumericOnlyKeyDownEvent = function(_target) {
                		var __target = angular.element(_target);
                		
                		if(__target.length > 0) {
                			__target.removeAttr("common-numeric-only-directive");
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
                			__target.removeAttr("common-numeric-only-directive");
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
 * 숫자와 콤마만 입력
 * @param event
 */
function __numberchk(event, iElement, _option) {
    event = event || window.event;
    var keyID = (event.which) ? event.which : event.keyCode;
    
    // keycode 검증
    if ((keyID >= 48 && keyID <= 57) || (keyID >= 96 && keyID <= 105) // 숫자, 키패드 숫자
    		|| keyID == 8 || keyID == 46 // backspace, delete
    		|| keyID == 35 || keyID == 36 // home, end
    		|| keyID == 189 || keyID == 110 || keyID == 190 // -(189) .(110, 190)
    		|| keyID == 13 // enter
    		|| keyID == 37 || keyID == 39) { // 화살표 <,  >
    	
    	// 소수점 사용
    	if(_option.decimalPoint && _option.decimalPoint > 0) {
			var val = iElement.val();
	    	
	    	var valArr = val.split('.');
	    	
	    	// 소수점이 2개 이상이면 false
	    	if(valArr.length > 2) {
	    		return false;
	    	}
    	} // end if
    	else { // 소수점 사용 안함.
    		if(keyID == 110 || keyID == 190) {
    			return false;
    		}
    	}
    }
    else {
      return false;
    }
} // end __numberchk

/**
 * 숫자에 콤마 삽입
 * @param $scope, iElement, iAttrs
 */
function __vComma($scope, iElement, iAttrs, _option, $commonService) {
	var str = "" + iElement.val().replace(/,/gi,'').replace(/^(0)([0-9]*)/,'$2'); // 콤마 제거
	
	var regx = new RegExp(/(-?\d+)(\d{3})/);
	var bExists = str.indexOf(".",0);
	var strArr = str.split('.');
	
	while(regx.test(strArr[0])){
		strArr[0] = strArr[0].replace(regx,"$1,$2");
	}
	
	if (bExists > -1) {
		var decimalPointUseFlag = _option.decimalPoint && _option.decimalPoint > 0;
		
		$commonService.fn_apply({scope : $scope, fn : function() {
			$scope[iAttrs.ngModel] = strArr[0] + "." + (decimalPointUseFlag ? strArr[1].substring(0, _option.decimalPoint) : strArr[1]);
		}});
	}
	else {
		$commonService.fn_apply({scope : $scope, fn : function() {
			$scope[iAttrs.ngModel] = strArr[0];
		}});
	}
	
	typeof $scope.__endSetNumericData === "function" && $scope.__endSetNumericData();
} // end __vComma

module.exports = md;
