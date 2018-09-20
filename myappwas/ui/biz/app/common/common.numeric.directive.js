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
    		|| keyID == 9  // tab
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
	// 2018.07.24  keewoong.hong   keyDown 이벤트에서 한글을 filtering 하지 못함에 따라... (keyCode 229)
	// keyUp 이벤트에서 한글이 제거된 값을 컴포넌트로 셋팅 후 진행한다. 중간에 셋팅하지 않으면 다음 keyDown 시 이전 한글이 살아남
	// 다만, focus를 떠날 때도 체크를 해야 하나 그 부분은 수정하지 않음
	// console.log(">>>>" + iElement.val() + "<<<");
	var str = "" + iElement.val().replace(/[^\-0-9.,]/g,''); // 한글제거
	iElement.val(str);  // 한글이 제거된 값을 다시 컴포넌트로 셋팅 
	
	str = str.replace(/,/gi,''); // 콤마 제거
	
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
