//////////////////////////////////////////////////////////////////////////////////////
/////provided condition tab////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

var providedConditionTpl = getTemplate('provide/providedConditionTpl');
var providedConditionTabRender;


/*
 * 이벤트 함수
 */

// 제공조건 추가버튼 클릭
onEvent('click', '.add-provided-condition-btn', function(e) {
    var submitEvent = function(selectedData) {

        selectedData.forEach(function(el) {
            var code = el.code;
            var name = el.name;

            el['applyStartDate'] = PFUtil.getNextDate() + ' 00:00:00';
            el['applyEndDate'] = '9999-12-31 23:59:59';
            el['process'] = 'C';
            el['cndDscd'] = '01';   // 01.제공조건

            el['providedConditionTypeCode'] = el.type;
            el['providedConditionCode'] = code;
            el['providedConditionName'] = name;
            el['providedConditionStatusCode'] = el.isActive;
            el['providedConditionDetailTypeCode'] = el.conditionDetailTypeCode;
            el['provideCndAdditionalInfoDetailList'] = [];

            delete el['content'];
            delete el['code'];
            delete el['name'];
            delete el['type'];
            delete el['typeNm'];
            delete el['conditionDetailTypeCode'];

            providedConditionGrid.addData(el);
        });

        modifyFlag = true;
    };

    renderCndPopup(submitEvent);
});

onEvent('click', '.save-provided-condition-btn', function(e) {

    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    };


    saveBenefitProvideCnd(projectId, '03', providedConditionGrid);  // 적용규칙구분코드 03 : 서비스


});

/*
 * render 함수
 */

// 제공조건 화면
function renderProvidedCondition(){

    $el.find('.pf-cp-provided-condition-info').html(providedConditionTpl());

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }

    var param = {
        tntInstId : selectedTreeItem.tntInstId,
        pdInfoDscd : pdInfoDscd_Service,
        pdCode : selectedTreeItem.id,
        ruleApplyTargetDistinctionCode : '03'   // 서비스
    }

    providedConditionGrid = renderConditionType3_2Grid(param, '.pf-cp-provided-condition-grid');

    // 적용규칙
    $('.apply-rule-info-wrap').html(cndApplyRuleTpl());     // 적용규칙 화면 render

    // 적용규칙 화면 조정
    $('.apply-rule-info-wrap').find('.max-discount').hide();
    $('.apply-rule-info-wrap').find('.discount-amount[value="02"]').prop('checked', false);      // 금액 checked
    $('.apply-rule-info-wrap').find('.discount-rate[value="01"]').prop('checked', false);       // 율 unchecked
    $('.apply-rule-info-wrap').find('.pf-cp-apply-rule-grapic-view-btn').hide();

    $('.apply-rule-info-wrap').find('.rule-apply-target-distinction-code').val('03');   // 03.서비스제공조건
    PFUtil.getDatePicker(true);
    renderComboBox('ProductStatusCode', $('.apply-rule-info-wrap .status'));
    $('.apply-rule-info-wrap .apply-rule')[0].placeholder = bxMsg('noneApplyRule');
    
    $('.apply-rule-info-wrap .min').hide();
    $('.apply-rule-info-wrap .max').hide();
    $('.apply-rule-info-wrap .avg').hide();
    $('.apply-rule-info-wrap .sum').hide();
    $('.applyRuleSyntaxError').hide();

    searchApplyRule(param);	// 조회

    providedConditionTabRender = false;        // 한번 render 이후에는 render 되지 않도록

}