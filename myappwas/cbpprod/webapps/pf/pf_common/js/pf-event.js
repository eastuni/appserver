/**
 * @fileOverview It provides functions that must be processed events in common.
 * @author BankwareGlobal ProductFactory Team
 */

$(function() {
	/**
	 * 탭을이용하여 화면이 그려질때 로그인시 선택한 언어코드를 세팅하여
	 * CSS 에서 언어별 폰트가 적용되도록 함
	 */
	$('body').attr('lang', getCookie('lang'));
});

/**
 * The function is input enter keyup event
 * @param {Object} event - jQuery Event Object
 */
// for IE
//onEvent('keyup', 'input', function(event) {
onEvent('keydown', 'input', function(event) {
  // 2018.01.31. 비어있는 input도 검색 가능하도록.
	if (event.keyCode === 13) {

		var searchBtn;

		if(event.target.attributes['data-form-param']){
			searchBtn = $('[data-form-param="'+event.target.attributes['data-form-param'].value+'"]').parents('.pf-panel-body').find('.i-search');
		}
		else{
			// 트리이벤트는 제외
			// searchBtn = $('.'+event.target.classList[event.target.classList.length-1]).parents('.pf-panel-body').find('.i-search');
		}

		if(searchBtn && searchBtn.length == 1){
			searchBtn.click();
		}
	}
});

// 변경 이벤트 발생 시
onEvent('change', '.bx-form-item', function(event){

	// 트리의 검색 인 경우 return
	if($(event.currentTarget).parents('.pf-left-nav').length > 0 || $(event.currentTarget).hasClass('except-modify-flag')){
		return;
	}

	modifyFlag = true;
});