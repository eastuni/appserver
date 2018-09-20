/**
 * @fileOverview It provides common utility for JavaScript coding in the ProductFactory Screen.
 * @author BankwareGlobal ProductFactory Team
 */
var $rootEl = $('body');
var onProjectEvent = PFUtil.makeEventBinder($rootEl);

onProjectEvent('click','.default-layout-task-menu .task-create-popup-btn',function(e) {
//    $('.default-layout-task-menu .task-create-popup-btn').addClass('click');
//    $('.planner ul a.project').click();
	renderTaskPopup(null, true);
});

function setMainTapLeftPosition(){
	// 삭제 대상
}

/**
 * Set cookie whenever change project(task) list
 * @return {void}
 */
$('.default-layout-task-menu').find('.my-task-list').on('change',function(e){
    var cookie = $(this).val();
    setCookie('selectProject',cookie,30);
    setEmergency(cookie);
    // OHS 20161102 actived 된 탭별로 proejctId저장
    $(parent.document).find('.tab-nav-list .tab-nav-actived').attr('save-tab-project-id', cookie);
});

/**
 * Set Emergency
 * @param {String} projectId - Project(task) id
 * @return {void}
 */
function setEmergency(projectId){

    var ifr = $(document.body).find('.tab-content[style!="display: none;"]').find('iframe')[0];
    if(!ifr) return;

    var ifrw = (ifr.contentWindow) ? ifr.contentWindow : (ifr.contentDocument.document) ? ifr.contentDocument.document : ifr.contentDocument;

    if(ifrw.fnEmergencyControl) {
        if (isEmergency(projectId)) {
            ifrw.fnEmergencyControl(true);
        } else {
            ifrw.fnEmergencyControl(false);
        }
    }
}

/**
 * Load Project(Task) Id and make Combo box
 * @param {String} [childYn=''] - Project(task) id
 * @return {void}
 */
function loadTaskRibbon(childYn, projectId) {
// render user project(task) list
    PFRequest.get('/project/getProjectProgressForList.json', {},{
        async: false,
        success: function (responseData) {
            var options = [];
            options.push($('<option>'));
            $.each(responseData, function (index, task) {
                var $option = $('<option>');
                $option.val(task.projectId);
                $option.text(task.name);
                options.push($option);

                if(parent.taskList) {
                    parent.taskList[task.projectId] = task;
                }else{
                    taskList[task.projectId] = task;
                }
            });

            var $selector;
            if(childYn && childYn == 'Y'){
            	$selector = parent.$('.default-layout-task-menu').find('.my-task-list')
            }else {
            	$selector = $('.default-layout-task-menu').find('.my-task-list')
            }

            $selector.html(options);

            // if you have selected a project before, select as it
            if (getCookie('selectProject')) {
            	$selector.find('option[value="' + getCookie('selectProject') + '"]').prop('selected', true);
            }

            if(projectId){
            	$selector.find('option[value="'+projectId+'"]').prop('selected', true);
            	//$('.default-layout-task-menu .my-task-list option[value="' + projectId + '"]').prop('selected', true);
            }
        },
        bxmHeader: {
                application: 'PF_Factory',
                service: 'ProjectMasterService',
                operation: 'queryListProjectProgress'
        }
    });
}

/**
 * if do not have project, show message
 * @return {void}
 */
function haveNotTask(){
    PFComponent.showMessage(bxMsg('notHaveTask'), 'warning',function(){
        $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).focus();
        $($('.default-layout-task-menu', parent.document).find('.task-create-popup-btn')[0]).addClass('bx-btn-success');
    });
}

/**
 * if do not select project, show message
 * @return {void}
 */
function selectNotTask(){
    PFComponent.showMessage(bxMsg('selectFirstTask'), 'warning',function(){
        $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).focus();
    });
}

/**
 * Check whether the current task-id is used in the popup
 * @return {Object} makePopup - Popup Object
 * @history - OHS 20161102 현재 개발과제ID를 사용하여 context 거래 (이름바꾸기, 복사하기, 삭제하기, 신규생성) 할것인지 확인.
 */
function useCurrentTaskIdConfirm(makePopup){
    // 개발과제가 현재 선택되어있고, disabled처리일때만 체크
    if(isHaveProject() && $('.default-layout-task-menu', parent.document).find('.my-task-list').prop('disabled') == true){
        return PFComponent.showConfirm(bxMsg('useCurrentTaskIdConfirm'), function(){
            makePopup.popup.show();
        }, function() {
            $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).removeAttr('data-status');
            $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).addClass('task-hide');
            $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).removeClass('task-hide');


            $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).find('option').eq(0).prop('selected',true);
            $('.default-layout-task-menu', parent.document).find('.my-task-list').prop('disabled', false);

            $(parent.document).find('.tab-nav-list .tab-nav-actived').removeAttr('save-tab-project-id');
            $(parent.document).find('.tab-nav-list .tab-nav-actived').removeAttr('save-tab-project-nm');

            makePopup.popup.show();
        });
    }
    else {
        makePopup.popup.show();
    }
}

/**
 * Check if it is my project id
 * @return {boolean} My task or not, true or false
 */
function isNotMyTask(data){
    var result = false;
    var selectedTask = $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).attr('data-status')=='true';

    // if do not select project
    if(!selectedTask){
        if(data==''){
            selectNotTask();
            result = true;
        }
    }else{
        PFComponent.showMessage(bxMsg('isNotMyTask'), 'warning');
        result = true;
    }

    return result;
}

/**
 * Get Selected Project(Task) Id
 * @return {String} Selected Project(Task) Id
 */
function getSelectedProjectId(){
    return $('.default-layout-task-menu', parent.document).find('.my-task-list').val();
}

/**
 * Project(Task) Id settings mapped to inquire objects
 * @param {String} targetProjectNm -
 * @return {void}
 */
function renderTaskRibbonCaseOfYourTask(targetProjectNm){
    // OHS 20161102 actvied 된 탭별로 proejctId저장
    $(parent.document).find('.tab-nav-list .tab-nav-actived').attr('save-tab-project-nm', targetProjectNm);
    $(parent.document).find('.tab-nav-list .tab-nav-actived').removeAttr('save-tab-project-id');

    $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).attr('data-status','true');
    $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).removeClass('task-hide');
    $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).val(targetProjectNm);
    $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).addClass('task-hide');
}

/**
 * Show only my Project(Task) Id Combo box
 * @return {void}
 */
function renderTaskRibbonCaseOfMyTask(targetProjectId){

    $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).removeAttr('data-status');
    $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).addClass('task-hide');
    $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).removeClass('task-hide');
    if(targetProjectId){
        $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).find('option[value="'+targetProjectId +'"]').prop('selected',true);
        parent.setEmergency(targetProjectId);

        // OHS 20161102 actvied 된 탭별로 proejctId저장, projectNm은 제거한다.
        $(parent.document).find('.tab-nav-list .tab-nav-actived').attr('save-tab-project-id', targetProjectId);
        $(parent.document).find('.tab-nav-list .tab-nav-actived').removeAttr('save-tab-project-nm');

        // OHS 20161102 상품화면일경우 task-id가 재선택되지못하게 disabled처리한다.
        if($(parent.document).find('.tab-nav-list .tab-nav-actived').attr('only-one-task-id-yn') == 'Y') {
            $('.default-layout-task-menu', parent.document).find('.my-task-list').prop('disabled', true);
        }

    }else{
        $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).find('option').eq(0).prop('selected',true);
        $('.default-layout-task-menu', parent.document).find('.my-task-list').prop('disabled', false);

        // OHS20161102 task-id를 선택할 수 있도록 다시 초기화 세팅한다.
        $(parent.document).find('.tab-nav-list .tab-nav-actived').removeAttr('save-tab-project-id');
        $(parent.document).find('.tab-nav-list .tab-nav-actived').removeAttr('save-tab-project-nm');
    }
}

/**
 * Functions to handle when choose something other than my proejct(task) id
 * @return {void}
 */
function selectedYourTask(){
    renderTaskRibbonCaseOfMyTask();
    selectNotTask();
}

/**
 * Bind to the Proejct(Task) Id combo box.
 * @param {String} projectId - Project(Task) id
 * @param {String} projectName - Project(Task) Name
 * @return {void}
 */
function setTaskRibbonInput(projectId,projectName){

    if($('.pf-multi-entity').val() && $('.pf-multi-entity').val() != $('.login-tntInst-id', parent.document).text()){
        renderTaskRibbonCaseOfYourTask('');
        return;
    }

    if(!projectId){
        renderTaskRibbonCaseOfMyTask(projectId);
        return;
    }
    var result = isMyTask(projectId);

    if(result){
        renderTaskRibbonCaseOfMyTask(projectId);
    }else{
        renderTaskRibbonCaseOfYourTask(projectName);
    }

}

/**
 * Check whether the login user's Project(Task) is right
 * @param {String} data - Project(Task) id
 * @return {void}
 */
function isMyTask(data){
    var result = false;

    $.each($($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).children(),
        function(index, option){
            if ($(option).val() == data) {
                result = true;
            }
    });

    return result;
}

/**
 * Remove the Project(Task) id from the project combo box.
 * @param {String} projectId - Project(Task) id
 * @return {void}
 */
function removeProject(projectId){
    $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).find('option[value=""]').prop('selected', true);
    $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).find('option[value="'+
    projectId +'"]').remove();
}

/**
 * Set Project(Task) information as a cookie
 * @param {String} projectId - Project(Task) id
 * @return {void}
 */
function setNewProjectData(projectId){
    setCookie('selectProject',projectId,30);
}

/**
 * Check the contents of the assembled Project(Task) combo box.
 * @return {boolean} if no have false, have true
 */
function isHaveProject(){
    if($($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).children().size() === 1){
        return false;
    }else{
        return true;
    }
}

/**
 * Set the Cookie information
 * @param {String} cName - Cookie Key name
 * @param {String} cValue - Cookie Value
 * @param {String} cMinute - minute
 * @return {void}
 */
function setCookie(cName, cValue, cMinute){
    var expire = new Date();
    expire.setDate(expire.getDate());
    expire.setMinutes(expire.getMinutes()+cMinute);
    var cookies = cName + '=' + escape(cValue) + '; path=/ ';
    if(typeof cMinute != 'undefined') cookies += ';expires=' + expire.toGMTString() + ';';
    document.cookie = cookies;
}

/**
 * Get the Cookie
 * @param {String} cName - Cookie name
 * @return {String} Cookie value
 */
function getCookie(cName) {
    cName = cName + '=';
    var cookieData = document.cookie;
    var start = cookieData.indexOf(cName);
    var cValue = '';
    if(start != -1){
        start += cName.length;
        var end = cookieData.indexOf(';', start);
        if(end == -1)end = cookieData.length;
        cValue = cookieData.substring(start, end);
    }
    return unescape(cValue);
}

/**
 * Get MotherYn (MotherTntInstId Yn) in the Cookie
 * @return {boolean} - if Mother is true or false
 */
function getMortherYn(){
    if(getCookie('mother') == 'true'){
        return true;
    }else {
        return false;
    }
}

/**
 * Get MotherTntInstId Value in the Cookie
 * @return {String} - Mother TntInstId Value
 */
function getMotherTntInstId(){
    return getCookie('motherTntInstId');
}

/**
 * Get Login TntInstId Value
 * @return {String} - Login TntInst Value
 */
function getLoginTntInstId(){
    return $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
}

/**
 * Get Login User Id Value
 * @return {String} - Login User Id
 */
function getLoginUserId(){
    return $('.product-factory-header', parent.document).find('.user-id').text();
}

/**
 * Get Login User Name Value
 * @return {String} - Login User Name
 */
function getLoginUserNm(){
    return getCookie('loginNm');
}

/**
 * inquire to Tenant Institution information and the combo is assembled
 * @param {Object} $selecter - The jQuery element to bind to the combo
 * @param {String} defaultValue - Default Set Value (Optional)
 * @param {Function} returnFunction - Execute the callback function after bind to the combo.
 * @return {void}
 */
function renderTntInstComboBox($selecter, defaultValue, returnFunction){
    PFRequest.get('/common/queryTenantInstitutionForList.json',{tntInstId: '', motherTntInstId: getMotherTntInstId()},{
        async: false,
        success: function(response) {
            var options = [];
            $.each(response, function(index, tntinst){
                var $option = $('<option>');
                $option.val(tntinst.tntInstId);
                $option.text(tntinst.tntInstName);

                options.push($option);
            });
            $selecter.html(options);

            if (defaultValue) {
                $selecter.val(defaultValue);
                $selecter.find('option[value="'+defaultValue+'"]').prop('selected', true);
            }

            if(returnFunction) {
                returnFunction(true);
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'CommonService',
            operation: 'queryListTenantInstitution'
        }
    });
}

/**
 * Make the code into a combo and bind it.
 * @param {String} code - Default Set Value (Optional)
 * @param {Object} selector - The jQuery element to bind to the combo
 * @param {String} value - combo setting value
 * @param {boolean} defaultSetting - Whether to set the default empty value
 * @param {String} defaultText - Whether to set the default text
 * @return {void}
 */
function renderComboBox(code, selector, value, defaultSetting, defaultText) {
    var options = [];

    if (defaultSetting) {
        var $defaultOption = $('<option>');

        $defaultOption.val('');
        $defaultOption.text(defaultText ? defaultText : '');

        options.push($defaultOption);
    }

    $.each(codeArrayObj[code], function(index, item){
        var $option = $('<option>');

        $option.val(item.code);
        $option.text(item.name);

        options.push($option);
    });

    selector.html(options);

    if (value) {
        selector.val(value);
        selector.find('option[value="'+value+'"]').prop('selected', true);
    }
}

/**
 * Inquire for Condition Name and combo bind it.
 * @param {String} $code - The jQuery element of condition code
 * @param {Object} $name - The jQuery element to bind to the combo
 * @return {$name} - call by reference.
 */
function bindConditionName($code, $name){

    var requestParam = {
        nameTypeDscd: '01', // 조건
        code: $code.val()
    };

    getNameUtil(requestParam, $name);
}

function bindPdNameByPdInfoDscd($code, $name, pdInfoDscd){

	var requestParam = {
        nameTypeDscd: '02', // 상품
        pdInfoDscd : pdInfoDscd,
        code: $code.val()
    };

    getNameUtil(requestParam, $name);
}

/**
 * Inquire for Product Name and combo bind it.
 * @param {String} $code - The jQuery element of Product code
 * @param {Object} $name - The jQuery element to bind to the combo
 * @return {$name} - call by reference.
 */
function bindProductName($code, $name){

    var requestParam = {
        nameTypeDscd: '02', // 상품
        pdInfoDscd : '01',  // 상품
        code: $code.val()
    };

    getNameUtil(requestParam, $name);
}

/**
 * Inquire for Service Name and combo bind it.
 * @param {String} $code - The jQuery element of Service code
 * @param {Object} $name - The jQuery element to bind to the combo
 * @return {$name} - call by reference.
 */
function bindServiceName($code, $name){

    var requestParam = {
        nameTypeDscd: '02', // 상품
        pdInfoDscd : '02',  // 서비스
        code: $code.val()
    };

    getNameUtil(requestParam, $name);
}

/**
 * Inquire for Point Name and combo bind it.
 * @param {String} $code - The jQuery element of Point code
 * @param {Object} $name - The jQuery element to bind to the combo
 * @return {$name} - call by reference.
 */
function bindPointName($code, $name){

    var requestParam = {
        nameTypeDscd: '02', // 상품
        pdInfoDscd : '03',  // 포인트
        code: $code.val()
    };
    getNameUtil(requestParam, $name);
}

/**
 * The Common Function for Inquire for Name and combo bind it.
 * @param {Object} requestParam - Parameter Object For Request
 * @param {Object} $name - The jQuery element to bind to the combo
 * @return {$name} - call by reference.
 */
function getNameUtil(requestParam, $name){
    PFRequest.get('/common/getNameUtil.json',requestParam,{
        async: false,
        success: function(response) {
            $name.val(response.name);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'CommonService',
            operation: 'queryNameUtil'
        }
    });
}

/**
 * Whether or not it is an emergency Project(Task) Id
 * @param {String} projectId - Project(Task) Id
 * @return {boolean} - If it is an emergency return true else false
 */
function isEmergency(projectId){

    if(!projectId) return false;

    if(parent.taskList[projectId].projectTypeCode == g_emergency){
        return true;
    }

    return false;
}

/**
 * Whether or not it is an Update Status of Project(Task) Id
 * @param {String} projectId - Project(Task) Id
 * @return {boolean} - If it is an update status return true else false
 */
function isUpdateStatus(projectId){

    if(!projectId) return false;

    // 상품정보 수정
    if(parent.taskList[projectId].progressStatus == '10'){
        return true;
    }

    return false;
}

/**
 * Ext library override
 * @return {void}
 */
Ext.define('Ext.view.override.Table', {
    override: 'Ext.view.Table',

    doStripeRows: function(startRow, endRow) {
        var me = this,
            rows,
            rowsLn,
            i,
            row;


        if (me.rendered && me.stripeRows) {
            rows = me.getNodes(startRow, endRow);

            for (i = 0, rowsLn = rows.length; i < rowsLn; i++) {
                row = rows[i];

                if (row) { // self updating; check for row existence
                    row.className = row.className.replace(me.rowClsRe, ' ');
                    startRow++;

                    if (startRow % 2 === 0) {
                        row.className += (' ' + me.altRowCls);
                    }
                }
            }
        }
    }
});

$.ajaxSetup({
    headers: {
        'Accept-Language': getCookie('lang')
    }
});


/**
 * text area or text의 커서 위치 변경
 * @param {int} start : 선택시작위치
 * 		  {int} end : 선택종료위치
 * @return
 */
$.fn.selectRange = function(start, end) {
	return this.each(function() {
		if(this.setSelectionRange) {
			this.focus();
			this.setSelectionRange(start, end);
		}
		else if(this.createTextRange) {
			var range = this.createTextRange();
			range.collapse(true);
			range.moveEnd('character', end);
			range.moveStart('character', start);
			range.select();
		}
	});
};

//OHS 20180718 - endsWith Polyfill
if (!String.prototype.endsWith) {
	String.prototype.endsWith = function(searchString, position) {
		  var subjectString = this.toString();
	      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
	    	  position = subjectString.length;
	      }
	      position -= searchString.length;
	      var lastIndex = subjectString.indexOf(searchString, position);
	      return lastIndex !== -1 && lastIndex === position;
	  };
}

//OHS 20180718 - Object.assign Polyfill
if (typeof Object.assign != 'function') {
	  (function () {
	    Object.assign = function (target) {
	      'use strict';
	      if (target === undefined || target === null) {
	        throw new TypeError('Cannot convert undefined or null to object');
	      }

	      var output = Object(target);
	      for (var index = 1; index < arguments.length; index++) {
	        var source = arguments[index];
	        if (source !== undefined && source !== null) {
	          for (var nextKey in source) {
	            if (source.hasOwnProperty(nextKey)) {
	              output[nextKey] = source[nextKey];
	            }
	          }
	        }
	      }
	      return output;
	    };
	  })();
}


//OHS 20180719 - Object.keys Polyfill
//From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
Object.keys = (function() {
  'use strict';
  var hasOwnProperty = Object.prototype.hasOwnProperty,
      hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
      dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ],
      dontEnumsLength = dontEnums.length;

  return function(obj) {
    if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
      throw new TypeError('Object.keys called on non-object');
    }

    var result = [], prop, i;

    for (prop in obj) {
      if (hasOwnProperty.call(obj, prop)) {
        result.push(prop);
      }
    }

    if (hasDontEnumBug) {
      for (i = 0; i < dontEnumsLength; i++) {
        if (hasOwnProperty.call(obj, dontEnums[i])) {
          result.push(dontEnums[i]);
        }
      }
    }
    return result;
  };
}());
}
$(loadTaskRibbon);