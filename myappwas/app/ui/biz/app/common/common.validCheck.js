/**
 * Created by parkbeomsoo on 2016. 5. 31..
 */



const angular = require('angular');

const md = require('./common.module');

md.service('$commonvalidCheck', __service);

function __service($commonService, $commonProxy){
    return {
    	/**
    	 * 필수 입력 항목 검증
    	 * paramList : 입력항목을 검증할 항목명
    	 * 
    	 * 리턴
    	 * boolean   : true 로 리턴되는 경우 필수입력 누락된 항목이 존재
    	 *             false로 리턴되는 경우 필수입력 누락항목 미존재
    	 */
    	fn_validCheck : function(paramList) {

    		//파라미터 입력 여부 확인
    		if(paramList.length <= 0) {
    			return false;
    		}

    		var content = '';
    		var countCheck = 0;
    		var alertParam = {};
    		
    		//입력된 파라미터의 for
    		$(paramList).each(function (idy, data) {
    		
    			//화면 항목 for
        		$('input, select').each(function (idx, item){
        			
        			if($(item.parentNode).attr('id') == data.id || $(item).attr('data-form-param') == data.id) {

        				if($(item).val() == '' || $(item).val() == undefined) {
        					$(item).focus();
        					
        					++countCheck;
        					
        					if(data.label == '' || data.label == undefined) {
        						content = content + $commonService.makeBxI18n().getValue($(item.parentNode).parent().find('label').attr('data-i18n') + '<br>');
        					} else {
        						content = content + $commonService.makeBxI18n().getValue(data.label) + '<br>';
        					}
        					
        					//최대 5개의 항목에 대해서만 메세지를 뿌려준다.
        					if(countCheck > 6) {
        						return false;
        					}
        				}
        				
        				return true;
        			}
        			
        		});
    		});

        	//필수누락된 항목이 한건이라도 있는 경우
        	if(countCheck > 0) {
	        	var common_msg = $commonService.makeBxI18n().getValue('{%=cbb_items.SCRNITM#no-mandatory-data-msg%}');
				alertParam.content = common_msg + '<br><br>' + content;
				alertParam.closeText = $commonService.makeBxI18n().getValue('{%=cbb_items.SCRNITM#cnfrm%}'); 
				$commonService.alert(alertParam);
				
				return true;
        	} else {
        		return false;
        	}
    	}
    } // end return
} // end function