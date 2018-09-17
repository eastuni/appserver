/**
 * @author wb-yealeekim
 * @version $$id: product.js, v 0.1 2015-01-22 PM 3:09 wb-yealeekim Exp $$
 */



//////////////////////////////////////////////////////////////////////////////////////
/////condition tab////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
var cndValueType2Tpl = getTemplate('condition/cndValueType2Tpl'),
    cndValueType3Tpl = getTemplate('condition/cndValueType3Tpl'),
    cndValueType4Tpl = getTemplate('condition/cndValueType4Tpl'),
    cndValueType4TblByHistory = getTemplate('condition/cndValueType4TblByHistory'),
    cndValueType3FixedInfoTpl = getTemplate('condition/cndValueType3FixedInfoTpl'),
    cndValueType3VarInfoTpl = getTemplate('condition/cndValueType3VarInfoTpl'),
    cndValueType3RefInfoTpl = getTemplate('condition/cndValueType3RefInfoTpl');

var cndValColumnSettingPopupTpl = getTemplate('condition/cndValColumnSettingPopupTpl'),
    productConditionHistoryPopupTpl = getTemplate('condition/productConditionHistoryPopupTpl');

var conditionType1Tpl = getTemplate('condition/conditionType1Tpl'),
    conditionType2Tpl = getTemplate('condition/conditionType2Tpl'),
    conditionType2GridTpl = getTemplate('condition/conditionType2GridTpl'),
    conditionType3Tpl = getTemplate('condition/conditionType3Tpl'),
    conditionType4_1Tpl = getTemplate('condition/conditionType4_1Tpl'),
    conditionType4_2Tpl = getTemplate('condition/conditionType4_2Tpl'),
    cnd4FeePopupTpl = getTemplate('condition/cnd4FeePopupTpl'),
    cnd4FeeSubPopupTpl = getTemplate('condition/cnd4FeeSubPopupTpl'),
    cndApplyRuleTpl = getTemplate('condition/cndApplyRuleTpl');  // 적용규칙

var conditionType3_0Tpl, conditionType3_1Tpl, conditionType3_2Tpl, conditionType3_ZTpl;
if(pdInfoDscd == pdInfoDscd_Product){
    conditionType3_0Tpl = getTemplate('condition/conditionType3_0Tpl');
    conditionType3_1Tpl = getTemplate('condition/conditionType3_1Tpl');
    conditionType3_2Tpl = getTemplate('condition/conditionType3_2Tpl');
    conditionType3_ZTpl = getTemplate('condition/conditionType3_ZTpl');
}

var detailRequestParam, selectedCondition,
    cndValComplexGrid, cndValueType1Grid,
    YforNewColumn, firstConditionTabRender,
    stepCndCd,                     // 스텝조건코드(기준조건)
    normalCndCdYn = false,
    GridMinMaxCheck = true,
    titleDataObj = {},
    titleDataArr = [],
    complexGridDeleteData = [],
    cndType2Grid, cndType3Grid,
    cpl4feePopupGridTitleDataObj = {},  // 수수료할인 팝업 > 복합조건 TitleDataObj
    cpl4feePopupGridTitleDataArr = [],  // 수수료할인 팝업 > 복합조건 TitleDataArr
    cpl4feePopupGrid,                   // 수수료할인 팝업 > 복합조건 그리드
    cnd4feePopupGrid,                   // 수수료할인 팝업 > 제공조건 그리드
    limitcnd4feePopupGrid;              // 수수료할인 팝업 > 한도조건 그리드

var conditionType3;

var conditionApplyTargetDscd; //제공조건기본 조건적용대상구분코드
var tokens;
onEvent('focus', '.bx-form-item', function(e) {
    $(e.target).removeClass("has-error");
});

onEvent('click', '.pf-cp-product-condition-delete-btn', function(e) {
    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    }

    var requestData = {
        "conditionCode": selectedCondition.id,
        "conditionGroupCode": selectedCondition.conditionGroupCode,
        "conditionGroupTemplateCode": selectedCondition.conditionGroupTemplateCode,
        "projectId": projectId,
        "tntInstId": selectedTreeItem.tntInstId,
        "pdInfoDscd": pdInfoDscd
    };

    PFComponent.showConfirm(bxMsg('DPE00001_Delete_Confirm'), function() {
        PFRequest.post('/product_condition/deleteProductCondition.json', requestData, {
            success: function(responseData) {
                if (responseData === true) {
                    PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                }

                $el.find('.pf-cp-condition-list-wrap').empty();
                renderConditionTree(conditionRequestParam);

                $el.find('.pf-cp-product-condition-panel').hide();

                modifyFlag = false;	//resetFormModifed();
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'PdCndService',
                operation: 'deletePdCnd'
            }
        });
    }, function() {
        return;
    });

});


// 상품 조건정보관리 저장버튼 클릭
onEvent('click', '.pf-cp-product-condition-save-btn', function(e) {

    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    if (!GridMinMaxCheck) {
        PFComponent.showMessage(bxMsg('DPS0126_1Error4'), 'warning');
        return;
    }
    GridMinMaxCheck = true;

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    }

    var formData = PFComponent.makeYGForm($('.pf-cp-product-condition-panel .condition-table-wrap')).getData(),
        conditionTypeCode = formData.conditionTypeCode,
        complexGridData,
        dontSave = false;

    formData.productCode = productInfo.code;

    formData.isChildPdUsable = $('.pf-cp-product-condition-panel .condition-table-wrap').find('.childYn-check').prop('checked');

    formData.intRtAplyBaseDayCd = $('.intRtAplyBaseDayCd').val();

    if ($el.find('.isMandatory').prop('checked')) {
        formData.isMandatory = true;
    } else {
        formData.isMandatory = false;
    }

    if ($el.find('.returnFeeYn').prop('checked')) {
        formData.returnFeeYn = 'Y';
    } else {
        formData.returnFeeYn = 'N';
    }

    if ($el.find('.isValueNull').prop('checked')) {
        formData.isValueNull = true;
    } else {
        formData.isValueNull = false;

        // 복합조건이나 계층미정의시 에러
        if (formData.conditionClassifyCode == '02' && cndValComplexGrid.getAllData().length == 0) {
            PFComponent.showMessage(bxMsg('DPS0129Error5'), 'warning');
            return;
        }

        var titleIndexMap = titleDataArr.filter(function(v) {
          return v.titleConditionTypeCode === "01";
        }).reduce(function(m, v, i) {
          m[v.titleConditionCode] = i;
          return m;
        }, {});

        var tierNumber = 1;
        switch (conditionTypeCode) {
            // 목록형
            case '01':
                if (formData.conditionClassifyCode == '01') {
                    formData.productCode = productInfo.code;
                    formData.listConditionValue = {};

                    var selectedCode = $('.cnd-val-type1-grid').find('input[name=default-check]:checked').attr('data-code'),
                        gridData = cndValueType1Grid.getAllData(),
                        selectedCheck = false;

                    gridData.forEach(function (el) {
                        /* if (el.code === selectedCode) {
                         el.isDefaultValue = true;
                         } else {
                         el.isDefaultValue = false;
                         }*/

                        if (el.isSelected) {
                            selectedCheck = true;
                        }
                    });

                    if (!selectedCheck) {
                        PFComponent.showMessage(bxMsg('DPJ0122Error1'), 'warning');
                        return;
                    }

                    formData.listConditionValue.defineValues = gridData;
                } else if (formData.conditionClassifyCode == '02') {
                    formData.tierHistoryExistYn = $el.find('.tierHistoryExistYn-check-value').val();

                    formData.complexConditionTitleInfoList = titleDataArr;

                    //layerCalcType should be 02 when conditionClassifyCode is 02
                    formData.layerCalcType = '01';

                    titleDataArr.forEach(function (el) {
                        el.titleConditionGroupTemplateCode = formData.conditionGroupTemplateCode;
                    });

                    complexGridData = complexGridDeleteData.concat(cndValComplexGrid.getAllData());

                    formData.complexConditionMatrix = [];

                    complexGridData.forEach(function (el) {
                      var listCodes = Object.keys(el).reduce(function(l, key) {
                        if (key.endsWith(".code")) {
                          l.push(el[key]);
                        }
                        return l;
                      }, []);
                      nestedFor(listCodes, function(values) {
                        var complexConditionMatrixDataObj = {};
                        complexConditionMatrixDataObj.process = el.process;
                        complexConditionMatrixDataObj.complexStructureId = el.complexStructureId;
                        complexConditionMatrixDataObj.tierNumber = tierNumber++;
                        complexConditionMatrixDataObj.listConditionValue = el.y;

                        complexConditionMatrixDataObj.x = [];

                        $.each(el, function (prop, value) {
                            var propNm = prop.split('.');

                            if(checkComplexColumn(prop)){
                            	return;
                            }

                            if (prop == 'y') {
                                complexConditionMatrixDataObj.listConditionValue = value;
                                value.applyStart = el.applyStart;
                                value.applyEnd = el.applyEnd;

                                //check that condition value(last column) has one more value or not
                                if (value.defineValues) {
                                    var dontSaveList = true;

                                    value.defineValues.forEach(function (el) {
                                        if (el.isSelected) {
                                            dontSaveList = false;
                                        }
                                    });

                                    if (dontSaveList) {
                                        dontSave = true;
                                        return;
                                    }
                                }

                            } else if (propNm.length != 2) {
                                if (value.listConditionValue) {
                                  value = $.extend({}, value);
                                  var index = titleIndexMap[prop];
                                  var code = values[index];
                                  value.listConditionValue = {
                                      defineValues: [{
                                        code: code,
                                        isSelected: true,
                                      }]
                                  }
                                }
                                value.id = prop;

                                //check that each condition has value or not
                                if (!value.rangeConditionValue && !value.listConditionValue) {
                                    dontSave = true;
                                    return;
                                }
                                else if (value.listConditionValue && value.listConditionValue.defineValues.length === 1
                                    && value.listConditionValue.defineValues[0].code === "") {
                                    dontSave = true;
                                    return;
                                }
                                complexConditionMatrixDataObj.x.push(value);
                            }
                        });

                        //check that condition value(last column) has one more value or not
                        if (!el.y) {
                            dontSave = true;
                            return;
                        }

                        formData.complexConditionMatrix.push(complexConditionMatrixDataObj);
                      });
                    });
                }

                break;

            // 범위형
            case '02' :
                if (formData.conditionClassifyCode == '01') {	// 01.일반조건
                    formData.rangeConditionValue = PFComponent.makeYGForm($('.cnd-value-type2 .bx-info-table')).getData();

                    if (!selectedCondition.isSingleValue) {

                    	// 계약레벨
                    	if(selectedCondition.conditionAgreeLevel == '02') {
                    		// OHS 2017.02.16 시스템최대치에 체크하여도 값이 세팅되기때문에 동일하게 처리
                    		if (!PFValidation.minMaxCheck($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check')) {
                				PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
                				return;
                			}
                    	}
                    	// 상품레벨
                    	else {
                    		// OHS 2017.02.16 시스템최대치에 체크하여도 값이 세팅되기때문에 동일하게 처리
                    		var checkMsg = PFValidation.minMaxCheckForPfLvl($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check');
                			if (checkMsg) {
                				PFComponent.showMessage(checkMsg, 'warning');
                				return;
                			}
                    	}
                    }

                    if (selectedCondition.isSingleValue) {
                        formData.rangeConditionValue.isSingleValue = true;
                        formData.rangeConditionValue.maxValue = formData.rangeConditionValue.defalueValue;
                        formData.rangeConditionValue.increaseValue = '0.00';
                        formData.rangeConditionValue.minValue = formData.rangeConditionValue.defalueValue;
                    } else {
                        formData.rangeConditionValue.isSingleValue = false;
                    }

                    if ($el.find('.isSystemMaxValue').find('input').prop('checked')) {
                        formData.rangeConditionValue.isSystemMaxValue = true;
                    } else {
                        formData.rangeConditionValue.isSystemMaxValue = false;
                    }

                } else if (formData.conditionClassifyCode == '02') {	// 02.복합조건
                    formData.tierHistoryExistYn = $el.find('.tierHistoryExistYn-check-value').val();
                    formData.complexConditionTitleInfoList = titleDataArr;
                    titleDataArr.forEach(function (el) {
                        el.titleConditionGroupTemplateCode = formData.conditionGroupTemplateCode;
                    });

                    complexGridData = complexGridDeleteData.concat(cndValComplexGrid.getAllData());

                    formData.complexConditionMatrix = [];

                    complexGridData.forEach(function (el) {
                      var listCodes = Object.keys(el).reduce(function(l, key) {
                        if (key.endsWith(".code")) {
                          l.push(el[key]);
                        }
                        return l;
                      }, []);
                      nestedFor(listCodes, function(values) {
                        var complexConditionMatrixDataObj = {};
                        complexConditionMatrixDataObj.process = el.process;
                        complexConditionMatrixDataObj.complexStructureId = el.complexStructureId;
                        complexConditionMatrixDataObj.tierNumber = tierNumber++;
                        complexConditionMatrixDataObj.rangeConditionValue = el.y;

                        complexConditionMatrixDataObj.x = [];

                        $.each(el, function (prop, value) {
                            var propNm = prop.split('.');

                            if(checkComplexColumn(prop)){
                            	return;
                            }

                            if (prop == 'y') {
                                // if isSingleValue is True Then, increaseValue
                                if (selectedCondition.isSingleValue) {
                                    value.maxValue = value.defalueValue;
                                    value.increaseValue = '0.00';
                                    value.minValue = value.defalueValue;
                                }

                                value.applyStart = el.applyStart;
                                value.applyEnd = el.applyEnd;
                                complexConditionMatrixDataObj.rangeConditionValue = value;
                            } else if (propNm.length != 2) {
                                if (value.listConditionValue) {
                                  value = $.extend({}, value);
                                  var index = titleIndexMap[prop];
                                  var code = values[index];
                                  value.listConditionValue = {
                                      defineValues: [{
                                        code: code,
                                        isSelected: true,
                                      }]
                                  }
                                }
                                value.id = prop;

                                // RangeConditionValue And ListConditionValue All Not Exists
                                if (!value.rangeConditionValue && !value.listConditionValue) {
                                    dontSave = true;
                                    return;
                                }
                                else if (value.listConditionValue && value.listConditionValue.defineValues.length === 1
                                    && value.listConditionValue.defineValues[0].code === "") {
                                    dontSave = true;
                                    return;
                                }
                                complexConditionMatrixDataObj.x.push(value);
                            }
                        });

                        if (!el.y || !el.y.defalueValue) {
                            dontSave = true;
                            return;
                        }

                        formData.complexConditionMatrix.push(complexConditionMatrixDataObj);
                      });
                    });
                }

                break;

            // 금리형
            case '03' :
                if (formData.conditionClassifyCode == '01') {	// 단순조건

                	var defaultData = PFComponent.makeYGForm($('.cnd-value-type3 .default-condition-info')).getData();

                	// 값적용방법 = 내부로직산출인 경우
                	if(formData.conditionValueAplyWayCode == '02'){
                		formData.rateApplyWayCode = '';
                		formData.type = '';
                		formData.interestConditionValue = defaultData;
                	}
                	else{

	                     // 금리데이터유형코드 != 01.금리값 && 상품결정레벨이 상품인 경우
	                    if($el.find('.fixed-info .InterestTypeCode').val() != '01' && selectedCondition.conditionAgreeLevel == '01'){
	                        $el.find('.fixed-info .maxSprdRt').val($el.find('.fixed-info .minSprdRt').val());   // 스프레드율 max = min
	                    }
	                    if($el.find('.var-info .InterestTypeCode').val() != '01' && selectedCondition.conditionAgreeLevel == '01'){
	                        $el.find('.var-info .maxSprdRt').val($el.find('.var-info .minSprdRt').val());   // 스프레드율 max = min
	                    }

	                	if ($('.fixed-info .interest-min-check').length>0 &&
	                    		!PFValidation.minMaxCheck($el, '.fixed-info .interest-min-check', '.fixed-info .interest-max-check', '.fixed-info .interest-default-check')) {

	                    		PFComponent.showMessage(bxMsg('minMaxAmountMsg'), 'warning');
	                            return;
	                    }
	                    if ($('.var-info .interest-min-check').length>0 &&
	                    	!PFValidation.minMaxCheck($el, '.var-info .interest-min-check', '.var-info .interest-max-check', '.var-info .interest-default-check')) {

	                    	PFComponent.showMessage(bxMsg('minMaxAmountMsg'), 'warning');
	                        return;
	                    }

	                    if ($('.fixed-info .applyMinInterestRate-min-check').length>0 &&
	                    	!PFValidation.minMaxCheck($el, '.fixed-info .applyMinInterestRate-min-check', '.fixed-info .applyMinInterestRate-max-check')) {

	                    	PFComponent.showMessage(bxMsg('DPJ0124Error8'), 'warning');
	                        return;
	                    }
	                    if ($('.var-info .applyMinInterestRate-min-check').length>0 &&
	                    	!PFValidation.minMaxCheck($el, '.var-info .applyMinInterestRate-min-check', '.var-info .applyMinInterestRate-max-check')) {

	                    	PFComponent.showMessage(bxMsg('DPJ0124Error8'), 'warning');
	                        return;
	                    }

	                    // 금리적용방식코드 분기
	                    // 고정적용
	                    if($el.find('.ProductConditionInterestApplyTypeCode').val() == '01') {
	                        var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .cnd-value-type3-fixed-info .bx-info-table')).getData();
	                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
	                    }
	                    // 변동적용
	                    else if($el.find('.ProductConditionInterestApplyTypeCode').val() == '02'){
	                    	var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .cnd-value-type3-var-info .bx-info-table')).getData();
	                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
	                    }
	                    // 고정후변동
	                    else if($el.find('.ProductConditionInterestApplyTypeCode').val() == '03'){
	                    	var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .cnd-value-type3-fixed-info .bx-info-table')).getData();
	                    	detailInfo.varIntCndValueVO = PFComponent.makeYGForm($('.cnd-value-type3 .cnd-value-type3-var-info .bx-info-table')).getData();
	                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
	                    }
	                    // 타상품참조
	                    else if($el.find('.ProductConditionInterestApplyTypeCode').val() == '04'){
	                    	var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .cnd-value-type3-ref-info .bx-info-table')).getData();
	                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
	                    }

	                    // 금리적용방식에 따른 분기 - 고정후 변동일때
	                    if($el.find('.ProductConditionInterestApplyTypeCode').val() == '03'){

	                    	/*
	                    	 * 고정정보
	                    	 */
	                    	// 금리값
		                    if($el.find('.fixed-info .InterestTypeCode').val() == '01') {
		                        var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .fixed-info .interest-value-wrap .bx-info-table')).getData();

		                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
		                    }
		                    // 기준금리
		                    else if($el.find('.fixed-info .InterestTypeCode').val() == '02') {
		                        if($el.find('.fixed-info .BaseIntRtKndCode').val() == null || $el.find('.fixed-info .BaseIntRtKndCode').val() != '') {
		                            // 기준금리종류 미입력 dontSave = true;
		                        	$el.find('.fixed-info .BaseInterestKind').addClass("has-error");
		                        	dontSave = true;
		                        }
		                        if($el.find('.fixed-info .BaseIntRtAplyTmCode').val() == null || $el.find('.fixed-info .BaseIntRtAplyTmCode').val() != '') {
		                            // 기준금리적용시점코드 미입력 dontSave = true;
		                        	$el.find('.fixed-info .BaseIntRtAplyTmCode').addClass("has-error");
		                        	dontSave = true;
		                        }
		                        if($el.find('.fixed-info .SprdAplyFormulaCode').val() == null || $el.find('.fixed-info .SprdAplyFormulaCode').val() != '') {
		                            // 스프레드적용산식 미입력 dontSave = true;
		                        	$el.find('.fixed-info .SprdAplyFormulaCode').addClass("has-error");
		                        	dontSave = true;
		                        }

		                        var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .fixed-info .base-interest-tpl .bx-info-table')).getData();
		                        formData.interestConditionValue = $.extend(defaultData,detailInfo);

		                    }
		                    // 타상품금리연동
		                    else if($el.find('.fixed-info .InterestTypeCode').val() == '03') {
		                        var detailInfo= PFComponent.makeYGForm($('.cnd-value-type3 .fixed-info .interest-link-tpl .bx-info-table')).getData();
		                        formData.interestConditionValue = $.extend(defaultData,detailInfo);

		                        if(formData.interestConditionValue.refPdCd == null || formData.interestConditionValue.refPdCd == ''){
		                        	$el.find('.fixed-info .product-code').addClass("has-error");
		                        	dontSave = true;
		                        }
		                        if(formData.interestConditionValue.refCndCd == null || formData.interestConditionValue.refCndCd == ''){
		                        	$el.find('.fixed-info .condition-code').addClass("has-error");
		                        	dontSave = true;
		                        }
		                    }

		                    /*
		                     * 변동정보
		                     */
	                    	// 금리값
		                    if($el.find('.var-info .InterestTypeCode').val() == '01') {
		                        var varIntCndValueVO = PFComponent.makeYGForm($('.cnd-value-type3 .var-info .interest-value-wrap .bx-info-table')).getData();

		                        formData.interestConditionValue.varIntCndValueVO = $.extend(formData.interestConditionValue.varIntCndValueVO,varIntCndValueVO);
		                    }
		                    // 기준금리
		                    else if($el.find('.var-info .InterestTypeCode').val() == '02') {
		                        if($el.find('.var-info .BaseIntRtKndCode').val() == null || $el.find('.var-info .BaseIntRtKndCode').val() == '') {
		                            // 기준금리종류 미입력
		                        	$el.find('.var-info .BaseInterestKind').addClass("has-error");
		                        	dontSave = true;
		                        }
		                        if($el.find('.var-info .BaseIntRtAplyTmCode').val() == null || $el.find('.var-info .BaseIntRtAplyTmCode').val() == '') {
		                            // 기준금리적용시점코드 미입력
		                        	$el.find('.var-info .BaseIntRtAplyTmCode').addClass("has-error");
		                        	dontSave = true;
		                        }
		                        if($el.find('.var-info .SprdAplyFormulaCode').val() == null || $el.find('.var-info .SprdAplyFormulaCode').val() == '') {
		                            // 스프레드적용산식 미입력
		                        	$el.find('.var-info .SprdAplyFormulaCode').addClass("has-error");
		                        	dontSave = true;
		                        }

		                        var varIntCndValueVO = PFComponent.makeYGForm($('.cnd-value-type3 .var-info .base-interest-tpl .bx-info-table')).getData();
		                        formData.interestConditionValue.varIntCndValueVO = $.extend(formData.interestConditionValue.varIntCndValueVO,varIntCndValueVO);

		                    }
		                    // 타상품금리연동
		                    else if($el.find('.var-info .InterestTypeCode').val() == '03') {
		                        var varIntCndValueVO= PFComponent.makeYGForm($('.cnd-value-type3 .var-info .interest-link-tpl .bx-info-table')).getData();
		                        formData.interestConditionValue.varIntCndValueVO = $.extend(formData.interestConditionValue.varIntCndValueVO,varIntCndValueVO);

		                        if(formData.interestConditionValue.varIntCndValueVO.refPdCd == null || formData.interestConditionValue.varIntCndValueVO.refPdCd == ''){
		                        	$el.find('.var-info .product-code').addClass("has-error");
		                        	dontSave = true;
		                        }
		                        if(formData.interestConditionValue.varIntCndValueVO.refCndCd == null || formData.interestConditionValue.varIntCndValueVO.refCndCd == ''){
		                        	$el.find('.var-info .condition-code').addClass("has-error");
		                        	dontSave = true;
		                        }
		                    }
	                    }else{
	                    	if($el.find('.ProductConditionInterestApplyTypeCode').val() == '01'){
	                    		$infoWrap = $('.fixed-info');
	                    	}else if($el.find('.ProductConditionInterestApplyTypeCode').val() == '02'){
	                    		$infoWrap = $('.var-info');
	                    	}else if($el.find('.ProductConditionInterestApplyTypeCode').val() == '04'){
	                    		$infoWrap = $('.ref-info');
	                    	}

		                    // 금리값
		                    if($infoWrap.find('.InterestTypeCode').val() == '01') {
		                        var detailInfo = PFComponent.makeYGForm($infoWrap.find('.interest-value-wrap .bx-info-table')).getData();

		                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
		                    }
		                    // 기준금리
		                    else if($infoWrap.find('.InterestTypeCode').val() == '02') {
		                        if($infoWrap.find('.BaseIntRtKndCode').val() == null || $infoWrap.find('.BaseIntRtKndCode').val() == '') {
		                            // 기준금리종류 미입력
		                        	$el.find('.BaseInterestKind').addClass("has-error");
		                        	dontSave = true;
		                        }
		                        if($infoWrap.find('.BaseIntRtAplyTmCode').val() == null || $infoWrap.find('.BaseIntRtAplyTmCode').val() == '') {
		                            // 기준금리적용시점코드 미입력
		                        	$el.find('.BaseIntRtAplyTmCode').addClass("has-error");
		                        	dontSave = true;
		                        }
		                        if($infoWrap.find('.SprdAplyFormulaCode').val() == null || $infoWrap.find('.SprdAplyFormulaCode').val() == '') {
		                            // 스프레드적용산식 미입력
		                            $el.find('.SprdAplyFormulaCode').addClass("has-error");
		                            dontSave = true;
		                        }

		                        var detailInfo = PFComponent.makeYGForm($infoWrap.find('.base-interest-tpl .bx-info-table')).getData();
		                        formData.interestConditionValue = $.extend(defaultData,detailInfo);

		                    }
		                    // 타상품금리연동
		                    else if($infoWrap.find('.InterestTypeCode').val() == '03') {
		                        var detailInfo= PFComponent.makeYGForm($infoWrap.find('.interest-link-tpl .bx-info-table')).getData();
		                        formData.interestConditionValue = $.extend(defaultData,detailInfo);

		                        if(formData.interestConditionValue.refPdCd == null || formData.interestConditionValue.refPdCd == ''){
		                        	$el.find('.product-code').addClass("has-error");
		                        	dontSave = true;
		                        }
		                        if(formData.interestConditionValue.refCndCd == null || formData.interestConditionValue.refCndCd == ''){
		                        	$el.find('.condition-code').addClass("has-error");
		                        	dontSave = true;
		                        }
		                    }
	                    }
                	}
                }
                // 복합
                else if (formData.conditionClassifyCode == '02') {
                    formData.tierHistoryExistYn = $el.find('.tierHistoryExistYn-check-value').val();
                    formData.complexConditionTitleInfoList = titleDataArr;
                    titleDataArr.forEach(function (el) {
                        el.titleConditionGroupTemplateCode = formData.conditionGroupTemplateCode;
                    });

                    complexGridData = complexGridDeleteData.concat(cndValComplexGrid.getAllData());

                    formData.complexConditionMatrix = [];

                    complexGridData.forEach(function (el) {
                      var listCodes = Object.keys(el).reduce(function(l, key) {
                        if (key.endsWith(".code")) {
                          l.push(el[key]);
                        }
                        return l;
                      }, []);
                      nestedFor(listCodes, function(values) {
                        var complexConditionMatrixDataObj = {};
                        complexConditionMatrixDataObj.process = el.process;
                        complexConditionMatrixDataObj.complexStructureId = el.complexStructureId;
                        complexConditionMatrixDataObj.tierNumber = tierNumber++;
                        complexConditionMatrixDataObj.interestConditionValue = el.y;

                        complexConditionMatrixDataObj.x = [];

                        $.each(el, function (prop, value) {
                            var propNm = prop.split('.');

                            if(checkComplexColumn(prop)){
                            	return;
                            }

                            if (prop == 'y') {
                            	 value.applyStart = el.applyStart;
                                 value.applyEnd = el.applyEnd;
                                complexConditionMatrixDataObj.interestConditionValue = value;
                            } else if (propNm.length != 2) {
                                if (value.listConditionValue) {
                                  value = $.extend({}, value);
                                  var index = titleIndexMap[prop];
                                  var code = values[index];
                                  value.listConditionValue = {
                                      defineValues: [{
                                        code: code,
                                        isSelected: true,
                                      }]
                                  }
                                }
                                value.id = prop;
                                // RangeConditionValue And ListConditionValue All Not Exists
                                if (!value.rangeConditionValue && !value.listConditionValue) {
                                    dontSave = true;
                                    return;
                                }
                                else if (value.listConditionValue && value.listConditionValue.defineValues.length === 1
                                    && value.listConditionValue.defineValues[0].code === "") {
                                    dontSave = true;
                                    return;
                                }
                                complexConditionMatrixDataObj.x.push(value);
                            }
                        });

                        if (!el.y || !el.y.type) {
                            dontSave = true;
                            return;
                        }

                        formData.complexConditionMatrix.push(complexConditionMatrixDataObj);
                      });
                    });
                }
                break;

            // 수수료형
            case '04' :
                if (formData.conditionClassifyCode == '01') {       // 일반 조건

                    /** 최소, 최대, 기본, 증가값 검증 START */
                    // 수수료유형
                    var radioType = $('.cnd-value-type4').find('input[name=cnd-value-04-radio]:checked');

                	// 계약레벨
                	if(selectedCondition.conditionAgreeLevel == '02') {
                		// 금액
                        if (radioType.hasClass('charge-radio-amount')) {
                            if (!PFValidation.minMaxCheck($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check')) {
                                PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
                                return;
                            }
                        }
                        // 율
                        else if (radioType.hasClass('charge-radio-rate')) {
                            if (!PFValidation.minMaxCheck($el, '.type3-min-check', '.type3-max-check', '.type3-default-check', '.type3-increase-check')) {
                                PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
                                return;
                            }
                        }
                	}
                	// 상품레벨
                	else {
                		// 금액
                        if (radioType.hasClass('charge-radio-amount')) {
                        	var checkMsg = PFValidation.minMaxCheckForPfLvl($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check');
                        	if (checkMsg) {
                				PFComponent.showMessage(checkMsg, 'warning');
                				return;
                			}
                        }
                        // 율
                        else if (radioType.hasClass('charge-radio-rate')) {
                        	var checkMsg = PFValidation.minMaxCheckForPfLvl($el, '.type3-min-check', '.type3-max-check', '.type3-default-check', '.type3-increase-check');
                        	if (checkMsg) {
                				PFComponent.showMessage(checkMsg, 'warning');
                				return;
                			}
                        }
                	}


                    /** 최소, 최대, 기본, 증가값 검증 END */

                    formData.feeConditionValue = PFComponent.makeYGForm($('.cnd-value-type4 .bx-info-table')).getData();
                    formData.feeConditionValue.feeTpCd = $el.find('[name=cnd-value-04-radio]:checked').val();
                    if(formData.feeConditionValue.feeTpCd == '02'){ // 금액
                        formData.feeConditionValue.calcBasic = $el.find('.calcBasicAmt').val();
                    }else{
                        formData.feeConditionValue.rtMsurUnitCd = $el.find('.RtMsurUnitCd').val();
                        formData.feeConditionValue.calcBasic = $el.find('.calcBasicRate').val();
                    }
                    if ($el.find('.isSystemMaxValue').find('input').prop('checked')) {
                        formData.feeConditionValue.isSystemMaxValue = true;
                    } else {
                        formData.feeConditionValue.isSystemMaxValue = false;
                    }

                } else if (formData.conditionClassifyCode == '02') {    // 복합 조건
                    formData.tierHistoryExistYn = $el.find('.tierHistoryExistYn-check-value').val();
                    formData.complexConditionTitleInfoList = titleDataArr;
                    titleDataArr.forEach(function (el) {
                        el.titleConditionGroupTemplateCode = formData.conditionGroupTemplateCode;
                    });

                    complexGridData = complexGridDeleteData.concat(cndValComplexGrid.getAllData());

                    formData.complexConditionMatrix = [];

                    complexGridData.forEach(function (el) {
                      var listCodes = Object.keys(el).reduce(function(l, key) {
                        if (key.endsWith(".code")) {
                          l.push(el[key]);
                        }
                        return l;
                      }, []);
                      nestedFor(listCodes, function(values) {
                        var complexConditionMatrixDataObj = {};
                        complexConditionMatrixDataObj.process = el.process;
                        complexConditionMatrixDataObj.complexStructureId = el.complexStructureId;
                        complexConditionMatrixDataObj.tierNumber = tierNumber++;
                        complexConditionMatrixDataObj.feeConditionValue = el.y;

                        complexConditionMatrixDataObj.x = [];

                        $.each(el, function (prop, value) {
                            var propNm = prop.split('.');

                            if(checkComplexColumn(prop)){
                            	return;
                            }

                            if (prop == 'y') {
                            	 value.applyStart = el.applyStart;
                                 value.applyEnd = el.applyEnd;
                                complexConditionMatrixDataObj.feeConditionValue = value;
                            } else if (propNm.length != 2) {
                                if (value.listConditionValue) {
                                  value = $.extend({}, value);
                                  var index = titleIndexMap[prop];
                                  var code = values[index];
                                  value.listConditionValue = {
                                      defineValues: [{
                                        code: code,
                                        isSelected: true,
                                      }]
                                  }
                                }
                                value.id = prop;
                                // RangeConditionValue And ListConditionValue All Not Exists
                                if (!value.rangeConditionValue && !value.listConditionValue) {
                                    dontSave = true;
                                    return;
                                }
                                else if (value.listConditionValue && value.listConditionValue.defineValues.length === 1
                                    && value.listConditionValue.defineValues[0].code === "") {
                                    dontSave = true;
                                    return;
                                }
                                complexConditionMatrixDataObj.x.push(value);
                            }
                        });

                        if (!el.y || !el.y.feeTpCd) {
                            dontSave = true;
                            return;
                        }

                        formData.complexConditionMatrix.push(complexConditionMatrixDataObj);
                      });
                    });
                }

                break;
        }
        if (dontSave) {

        	if (formData.conditionClassifyCode == '01') {    // 일반 조건
        		PFComponent.showMessage(bxMsg('Z_EmptyInputValue'), 'warning');		// 입력하지 않은 값이 있습니다.
        	}else if (formData.conditionClassifyCode == '02') {    // 복합 조건
        		PFComponent.showMessage(bxMsg('DPS0128Error4'), 'warning');			// 조건값에 입력하지 않은 행이 있습니다
        	}
            return;
        }

        if(!modifyFlag){
    		// 변경된 정보가 없습니다.
    		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
    		return;
    	}
    }

    formData.projectId = projectId;
    formData.pdInfoDscd = pdInfoDscd;
    formData.tntInstId = selectedTreeItem.tntInstId;

    // 조건구조=복합조건 and 복합적용방법=다계층사용
    if(formData.conditionClassifyCode == '02' &&  formData.layerCalcType == '02') {

        formData.stepCndCd = stepCndCd;
    }

    PFRequest.post('/product_condition/saveProductCondition.json', formData, {
        success: function(responseData) {
            if (responseData === true) {
                PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                //$el.find('.pf-cp-condition-list-wrap').empty();

                detailRequestParam.isNew = true;
                complexGridDeleteData = [];

                renderConditionPage(detailRequestParam);

            }

            modifyFlag = false; // resetFormModifed();
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdCndService',
            operation: 'savePdCnd'
        }
    });
});

// 상품 조건 검증 버튼 클릭
onEvent('click', '.verify-btn', function(e) {
    if (!GridMinMaxCheck) {
        PFComponent.showMessage(bxMsg('DPS0126_1Error4'), 'warning');
        return;
    }
    GridMinMaxCheck = true;

    var formData = PFComponent.makeYGForm($('.pf-cp-product-condition-panel .condition-table-wrap')).getData(),
        conditionTypeCode = formData.conditionTypeCode,
        complexGridData,
        dontSave = false;

    formData.productCode = productInfo.code;

    formData.isChildPdUsable = $('.pf-cp-product-condition-panel .condition-table-wrap').find('.childYn-check').prop('checked');

    formData.intRtAplyBaseDayCd = $('.intRtAplyBaseDayCd').val();

    if ($el.find('.isMandatory').prop('checked')) {
        formData.isMandatory = true;
    } else {
        formData.isMandatory = false;
    }

    if ($el.find('.returnFeeYn').prop('checked')) {
        formData.returnFeeYn = 'Y';
    } else {
        formData.returnFeeYn = 'N';
    }

    if ($el.find('.isValueNull').prop('checked')) {
        formData.isValueNull = true;
    } else {
        formData.isValueNull = false;

        // 복합조건이나 계층미정의시 에러
        if (formData.conditionClassifyCode == '02' && cndValComplexGrid.getAllData().length == 0) {
            PFComponent.showMessage(bxMsg('DPS0129Error5'), 'warning');
            return;
        }

        var titleIndexMap = titleDataArr.filter(function(v) {
          return v.titleConditionTypeCode === "01";
        }).reduce(function(m, v, i) {
          m[v.titleConditionCode] = i;
          return m;
        }, {});

        var tierNumber = 1;
        switch (conditionTypeCode) {
            // 목록형
            case '01':
                if (formData.conditionClassifyCode == '01') {
                    formData.productCode = productInfo.code;
                    formData.listConditionValue = {};

                    var selectedCode = $('.cnd-val-type1-grid').find('input[name=default-check]:checked').attr('data-code'),
                        gridData = cndValueType1Grid.getAllData(),
                        selectedCheck = false;

                    gridData.forEach(function (el) {
                        if (el.isSelected) {
                            selectedCheck = true;
                        }
                    });

                    if (!selectedCheck) {
                        PFComponent.showMessage(bxMsg('DPJ0122Error1'), 'warning');
                        return;
                    }

                    formData.listConditionValue.defineValues = gridData;
                } else if (formData.conditionClassifyCode == '02') {
                    formData.tierHistoryExistYn = $el.find('.tierHistoryExistYn-check-value').val();

                    formData.complexConditionTitleInfoList = titleDataArr;

                    //layerCalcType should be 02 when conditionClassifyCode is 02
                    formData.layerCalcType = '01';

                    titleDataArr.forEach(function (el) {
                        el.titleConditionGroupTemplateCode = formData.conditionGroupTemplateCode;
                    });

                    complexGridData = complexGridDeleteData.concat(cndValComplexGrid.getAllData());

                    formData.complexConditionMatrix = [];

                    complexGridData.forEach(function (el) {
                      var listCodes = Object.keys(el).reduce(function(l, key) {
                        if (key.endsWith(".code")) {
                          l.push(el[key]);
                        }
                        return l;
                      }, []);
                      nestedFor(listCodes, function(values) {
                        var complexConditionMatrixDataObj = {};
                        complexConditionMatrixDataObj.process = el.process;
                        complexConditionMatrixDataObj.complexStructureId = el.complexStructureId;
                        complexConditionMatrixDataObj.tierNumber = tierNumber++;
                        complexConditionMatrixDataObj.listConditionValue = el.y;

                        complexConditionMatrixDataObj.x = [];

                        $.each(el, function (prop, value) {
                            var propNm = prop.split('.');

                            if(checkComplexColumn(prop)){
                            	return;
                            }

                            if (prop == 'y') {
                                complexConditionMatrixDataObj.listConditionValue = value;
                                value.applyStart = el.applyStart;
                                value.applyEnd = el.applyEnd;

                                //check that condition value(last column) has one more value or not
                                if (value.defineValues) {
                                    var dontSaveList = true;

                                    value.defineValues.forEach(function (el) {
                                        if (el.isSelected) {
                                            dontSaveList = false;
                                        }
                                    });

                                    if (dontSaveList) {
                                        dontSave = true;
                                        return;
                                    }
                                }

                            } else if (propNm.length != 2) {
                                if (value.listConditionValue) {
                                  value = $.extend({}, value);
                                  var index = titleIndexMap[prop];
                                  var code = values[index];
                                  value.listConditionValue = {
                                      defineValues: [{
                                        code: code,
                                        isSelected: true,
                                      }]
                                  }
                                }
                                value.id = prop;

                                //check that each condition has value or not
                                if (!value.rangeConditionValue && !value.listConditionValue) {
                                    dontSave = true;
                                    return;
                                }
                                else if (value.listConditionValue && value.listConditionValue.defineValues.length === 1
                                    && value.listConditionValue.defineValues[0].code === "") {
                                    dontSave = true;
                                    return;
                                }
                                complexConditionMatrixDataObj.x.push(value);
                            }
                        });

                        //check that condition value(last column) has one more value or not
                        if (!el.y) {
                            dontSave = true;
                            return;
                        }

                        formData.complexConditionMatrix.push(complexConditionMatrixDataObj);
                      });
                    });
                }

                break;

            // 범위형
            case '02' :
                if (formData.conditionClassifyCode == '01') {
                    formData.rangeConditionValue = PFComponent.makeYGForm($('.cnd-value-type2 .bx-info-table')).getData();

                    if (!selectedCondition.isSingleValue) {

                    	// 계약레벨
                    	if(selectedCondition.conditionAgreeLevel == '02') {
                    		if (!PFValidation.minMaxCheck($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check')) {
                				PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
                				return;
                			}
                    	}
                    	// 상품레벨
                    	else {
                    		var checkMsg = PFValidation.minMaxCheckForPfLvl($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check');
                			if (checkMsg) {
                				PFComponent.showMessage(checkMsg, 'warning');
                				return;
                			}
                    	}
                    }

                    if (selectedCondition.isSingleValue) {
                        formData.rangeConditionValue.isSingleValue = true;
                        formData.rangeConditionValue.maxValue = formData.rangeConditionValue.defalueValue;
                        formData.rangeConditionValue.increaseValue = '0.00';
                        formData.rangeConditionValue.minValue = formData.rangeConditionValue.defalueValue;
                    } else {
                        formData.rangeConditionValue.isSingleValue = false;
                    }

                    if ($el.find('.isSystemMaxValue').find('input').prop('checked')) {
                        formData.rangeConditionValue.isSystemMaxValue = true;
                    } else {
                        formData.rangeConditionValue.isSystemMaxValue = false;
                    }

                } else if (formData.conditionClassifyCode == '02') {
                    formData.tierHistoryExistYn = $el.find('.tierHistoryExistYn-check-value').val();
                    formData.complexConditionTitleInfoList = titleDataArr;
                    titleDataArr.forEach(function (el) {
                        el.titleConditionGroupTemplateCode = formData.conditionGroupTemplateCode;
                    });

                    complexGridData = complexGridDeleteData.concat(cndValComplexGrid.getAllData());

                    formData.complexConditionMatrix = [];

                    complexGridData.forEach(function (el) {
                      var listCodes = Object.keys(el).reduce(function(l, key) {
                        if (key.endsWith(".code")) {
                          l.push(el[key]);
                        }
                        return l;
                      }, []);
                      nestedFor(listCodes, function(values) {
                        var complexConditionMatrixDataObj = {};
                        complexConditionMatrixDataObj.process = el.process;
                        complexConditionMatrixDataObj.complexStructureId = el.complexStructureId;
                        complexConditionMatrixDataObj.tierNumber = tierNumber++;
                        complexConditionMatrixDataObj.rangeConditionValue = el.y;

                        complexConditionMatrixDataObj.x = [];

                        $.each(el, function (prop, value) {
                            var propNm = prop.split('.');

                            if(checkComplexColumn(prop)){
                            	return;
                            }

                            if (prop == 'y') {
                                // if isSingleValue is True Then, increaseValue
                                if (selectedCondition.isSingleValue) {
                                    value.maxValue = value.defalueValue;
                                    value.increaseValue = '0.00';
                                    value.minValue = value.defalueValue;
                                }

                                value.applyStart = el.applyStart;
                                value.applyEnd = el.applyEnd;
                                complexConditionMatrixDataObj.rangeConditionValue = value;
                            } else if (propNm.length != 2) {
                                if (value.listConditionValue) {
                                  value = $.extend({}, value);
                                  var index = titleIndexMap[prop];
                                  var code = values[index];
                                  value.listConditionValue = {
                                      defineValues: [{
                                        code: code,
                                        isSelected: true,
                                      }]
                                  }
                                }
                                value.id = prop;

                                // RangeConditionValue And ListConditionValue All Not Exists
                                if (!value.rangeConditionValue && !value.listConditionValue) {
                                    dontSave = true;
                                    return;
                                }
                                else if (value.listConditionValue && value.listConditionValue.defineValues.length === 1
                                    && value.listConditionValue.defineValues[0].code === "") {
                                    dontSave = true;
                                    return;
                                }
                                complexConditionMatrixDataObj.x.push(value);
                            }
                        });

                        if (!el.y) {
                            dontSave = true;
                            return;
                        }

                        formData.complexConditionMatrix.push(complexConditionMatrixDataObj);
                      });
                    });
                }

                break;

            // 금리형
            case '03' :
                if (formData.conditionClassifyCode == '01') {
                	if ($('.fixed-info .interest-min-check').length>0 &&
                    		!PFValidation.minMaxCheck($el, '.fixed-info .interest-min-check', '.fixed-info .interest-max-check', '.fixed-info .interest-default-check')) {

                    		PFComponent.showMessage(bxMsg('minMaxAmountMsg'), 'warning');
                            return;
                    }
                    if ($('.var-info .interest-min-check').length>0 &&
                    	!PFValidation.minMaxCheck($el, '.var-info .interest-min-check', '.var-info .interest-max-check', '.var-info .interest-default-check')) {

                    	PFComponent.showMessage(bxMsg('minMaxAmountMsg'), 'warning');
                        return;
                    }

                    if ($('.fixed-info .applyMinInterestRate-min-check').length>0 &&
                    	!PFValidation.minMaxCheck($el, '.fixed-info .applyMinInterestRate-min-check', '.fixed-info .applyMinInterestRate-max-check')) {

                    	PFComponent.showMessage(bxMsg('DPJ0124Error8'), 'warning');
                        return;
                    }
                    if ($('.var-info .applyMinInterestRate-min-check').length>0 &&
                    	!PFValidation.minMaxCheck($el, '.var-info .applyMinInterestRate-min-check', '.var-info .applyMinInterestRate-max-check')) {

                    	PFComponent.showMessage(bxMsg('DPJ0124Error8'), 'warning');
                        return;
                    }

                     // 금리데이터유형코드 != 01.금리값 && 상품결정레벨이 상품인 경우
                    if($el.find('.fixed-info .InterestTypeCode').val() != '01' && selectedCondition.conditionAgreeLevel == '01'){
                        $el.find('.fixed-info .maxSprdRt').val($el.find('.fixed-info .minSprdRt').val());   // 스프레드율 max = min
                    }
                    if($el.find('.var-info .InterestTypeCode').val() != '01' && selectedCondition.conditionAgreeLevel == '01'){
                        $el.find('.var-info .maxSprdRt').val($el.find('.var-info .minSprdRt').val());   // 스프레드율 max = min
                    }

                    var defaultData = PFComponent.makeYGForm($('.cnd-value-type3 .default-condition-info')).getData();

                    // 금리적용방식코드 분기
                    // 고정적용
                    if($el.find('.ProductConditionInterestApplyTypeCode').val() == '01') {
                        var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .cnd-value-type3-fixed-info .bx-info-table')).getData();
                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
                    }
                    // 변동적용
                    else if($el.find('.ProductConditionInterestApplyTypeCode').val() == '02'){
                    	var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .cnd-value-type3-var-info .bx-info-table')).getData();
                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
                    }
                    // 고정후변동
                    else if($el.find('.ProductConditionInterestApplyTypeCode').val() == '03'){
                    	var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .cnd-value-type3-fixed-info .bx-info-table')).getData();
                    	detailInfo.varIntCndValueVO = PFComponent.makeYGForm($('.cnd-value-type3 .cnd-value-type3-var-info .bx-info-table')).getData();
                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
                    }
                    // 타상품참조
                    else if($el.find('.ProductConditionInterestApplyTypeCode').val() == '04'){
                    	var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .cnd-value-type3-ref-info .bx-info-table')).getData();
                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
                    }

                    // 금리유형에 따른 분기 - 고정후 변동일때
                    if($el.find('.ProductConditionInterestApplyTypeCode').val() == '03'){

                    	/*
                    	 * 고정정보
                    	 */
                    	// 금리값
	                    if($el.find('.fixed-info .InterestTypeCode').val() == '01') {
	                        var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .fixed-info .interest-value-wrap .bx-info-table')).getData();

	                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
	                    }
	                    // 기준금리
	                    else if($el.find('.fixed-info .InterestTypeCode').val() == '02') {
	                        if(!$el.find('.fixed-info .BaseIntRtKndCode')) {
	                            // 기준금리종류 미입력
	                            dontSave = true;
	                        }
	                        if(!$el.find('.fixed-info .BaseIntRtAplyTmCode')) {
	                            // 기준금리적용시점코드 미입력
	                            dontSave = true;
	                        }
	                        if(!$el.find('.fixed-info .SprdAplyFormulaCode')) {
	                            // 스프레드적용산식 미입력
	                            dontSave = true;
	                        }

	                        var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .fixed-info .base-interest-tpl .bx-info-table')).getData();
	                        formData.interestConditionValue = $.extend(defaultData,detailInfo);

	                    }
	                    // 타상품금리연동
	                    else if($el.find('.fixed-info .InterestTypeCode').val() == '03') {
	                        var detailInfo= PFComponent.makeYGForm($('.cnd-value-type3 .fixed-info .interest-link-tpl .bx-info-table')).getData();
	                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
	                    }

	                    /*
	                     * 변동정보
	                     */
                    	// 금리값
	                    if($el.find('.var-info .InterestTypeCode').val() == '01') {
	                        var varIntCndValueVO = PFComponent.makeYGForm($('.cnd-value-type3 .var-info .interest-value-wrap .bx-info-table')).getData();

	                        formData.interestConditionValue.varIntCndValueVO = $.extend(formData.interestConditionValue.varIntCndValueVO,varIntCndValueVO);
	                    }
	                    // 기준금리
	                    else if($el.find('.var-info .InterestTypeCode').val() == '02') {
	                        if(!$el.find('.var-info .BaseIntRtKndCode')) {
	                            // 기준금리종류 미입력
	                            dontSave = true;
	                        }
	                        if(!$el.find('.var-info .BaseIntRtAplyTmCode')) {
	                            // 기준금리적용시점코드 미입력
	                            dontSave = true;
	                        }
	                        if(!$el.find('.var-info .SprdAplyFormulaCode')) {
	                            // 스프레드적용산식 미입력
	                            dontSave = true;
	                        }

	                        var varIntCndValueVO = PFComponent.makeYGForm($('.cnd-value-type3 .var-info .base-interest-tpl .bx-info-table')).getData();
	                        formData.interestConditionValue.varIntCndValueVO = $.extend(formData.interestConditionValue.varIntCndValueVO,varIntCndValueVO);

	                    }
	                    // 타상품금리연동
	                    else if($el.find('.var-info .InterestTypeCode').val() == '03') {
	                        var varIntCndValueVO= PFComponent.makeYGForm($('.cnd-value-type3 .var-info .interest-link-tpl .bx-info-table')).getData();
	                        formData.interestConditionValue.varIntCndValueVO = $.extend(formData.interestConditionValue.varIntCndValueVO,varIntCndValueVO);
	                    }
                    }else{
                    	if($el.find('.ProductConditionInterestApplyTypeCode').val() == '01'){
                    		$infoWrap = $('.fixed-info');
                    	}else if($el.find('.ProductConditionInterestApplyTypeCode').val() == '02'){
                    		$infoWrap = $('.var-info');
                    	}else if($el.find('.ProductConditionInterestApplyTypeCode').val() == '04'){
                    		$infoWrap = $('.ref-info');
                    	}

	                    // 금리값
	                    if($infoWrap.find('.InterestTypeCode').val() == '01') {
	                        var detailInfo = PFComponent.makeYGForm($infoWrap.find('.interest-value-wrap .bx-info-table')).getData();

	                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
	                    }
	                    // 기준금리
	                    else if($infoWrap.find('.InterestTypeCode').val() == '02') {
	                        if(!$infoWrap.find('.BaseIntRtKndCode')) {
	                            // 기준금리종류 미입력
	                            dontSave = true;
	                        }
	                        if(!$infoWrap.find('.BaseIntRtAplyTmCode')) {
	                            // 기준금리적용시점코드 미입력
	                            dontSave = true;
	                        }
	                        if(!$infoWrap.find('.SprdAplyFormulaCode')) {
	                            // 스프레드적용산식 미입력
	                            dontSave = true;
	                        }

	                        var detailInfo = PFComponent.makeYGForm($infoWrap.find('.base-interest-tpl .bx-info-table')).getData();
	                        formData.interestConditionValue = $.extend(defaultData,detailInfo);

	                    }
	                    // 타상품금리연동
	                    else if($infoWrap.find('.InterestTypeCode').val() == '03') {
	                        var detailInfo= PFComponent.makeYGForm($infoWrap.find('.interest-link-tpl .bx-info-table')).getData();
	                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
	                    }
                    }
                }
                // 복합
                else if (formData.conditionClassifyCode == '02') {
                    formData.tierHistoryExistYn = $el.find('.tierHistoryExistYn-check-value').val();
                    formData.complexConditionTitleInfoList = titleDataArr;
                    titleDataArr.forEach(function (el) {
                        el.titleConditionGroupTemplateCode = formData.conditionGroupTemplateCode;
                    });

                    complexGridData = complexGridDeleteData.concat(cndValComplexGrid.getAllData());

                    formData.complexConditionMatrix = [];

                    complexGridData.forEach(function (el) {
                      var listCodes = Object.keys(el).reduce(function(l, key) {
                        if (key.endsWith(".code")) {
                          l.push(el[key]);
                        }
                        return l;
                      }, []);
                      nestedFor(listCodes, function(values) {
                        var complexConditionMatrixDataObj = {};
                        complexConditionMatrixDataObj.process = el.process;
                        complexConditionMatrixDataObj.complexStructureId = el.complexStructureId;
                        complexConditionMatrixDataObj.tierNumber = tierNumber++;
                        complexConditionMatrixDataObj.interestConditionValue = el.y;

                        complexConditionMatrixDataObj.x = [];

                        $.each(el, function (prop, value) {
                            var propNm = prop.split('.');

                            if(checkComplexColumn(prop)){
                            	return;
                            }

                            if (prop == 'y') {
                            	 value.applyStart = el.applyStart;
                                 value.applyEnd = el.applyEnd;
                                complexConditionMatrixDataObj.interestConditionValue = value;
                            } else if (propNm.length != 2) {
                                if (value.listConditionValue) {
                                  value = $.extend({}, value);
                                  var index = titleIndexMap[prop];
                                  var code = values[index];
                                  value.listConditionValue = {
                                      defineValues: [{
                                        code: code,
                                        isSelected: true,
                                      }]
                                  }
                                }
                                value.id = prop;
                                // RangeConditionValue And ListConditionValue All Not Exists
                                if (!value.rangeConditionValue && !value.listConditionValue) {
                                    dontSave = true;
                                    return;
                                }
                                else if (value.listConditionValue && value.listConditionValue.defineValues.length === 1
                                    && value.listConditionValue.defineValues[0].code === "") {
                                    dontSave = true;
                                    return;
                                }
                                complexConditionMatrixDataObj.x.push(value);
                            }
                        });

                        if (!el.y) {
                            dontSave = true;
                            return;
                        }

                        formData.complexConditionMatrix.push(complexConditionMatrixDataObj);
                      });
                    });
                }
                break;

            // 수수료형
            case '04' :
                if (formData.conditionClassifyCode == '01') {       // 일반 조건

                    /** 최소, 최대, 기본, 증가값 검증 START */
                    // 수수료유형
                    var radioType = $('.cnd-value-type4').find('input[name=cnd-value-04-radio]:checked');

                	// 계약레벨
                	if(selectedCondition.conditionAgreeLevel == '02') {
                		// 금액
                        if (radioType.hasClass('charge-radio-amount')) {
                            if (!PFValidation.minMaxCheck($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check')) {
                                PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
                                return;
                            }
                        }
                        // 율
                        else if (radioType.hasClass('charge-radio-rate')) {
                            if (!PFValidation.minMaxCheck($el, '.type3-min-check', '.type3-max-check', '.type3-default-check', '.type3-increase-check')) {
                                PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
                                return;
                            }
                        }
                	}
                	// 상품레벨
                	else {
                		// 금액
                        if (radioType.hasClass('charge-radio-amount')) {
                        	var checkMsg = PFValidation.minMaxCheckForPfLvl($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check');
                        	if (checkMsg) {
                				PFComponent.showMessage(checkMsg, 'warning');
                				return;
                			}
                        }
                        // 율
                        else if (radioType.hasClass('charge-radio-rate')) {
                        	var checkMsg = PFValidation.minMaxCheckForPfLvl($el, '.type3-min-check', '.type3-max-check', '.type3-default-check', '.type3-increase-check');
                        	if (checkMsg) {
                				PFComponent.showMessage(checkMsg, 'warning');
                				return;
                			}
                        }
                	}


                    /** 최소, 최대, 기본, 증가값 검증 END */

                    formData.feeConditionValue = PFComponent.makeYGForm($('.cnd-value-type4 .bx-info-table')).getData();
                    formData.feeConditionValue.feeTpCd = $el.find('[name=cnd-value-04-radio]:checked').val();
                    if(formData.feeConditionValue.feeTpCd == '02'){ // 금액
                        formData.feeConditionValue.calcBasic = $el.find('.calcBasicAmt').val();
                    }else{
                        formData.feeConditionValue.rtMsurUnitCd = $el.find('.RtMsurUnitCd').val();
                        formData.feeConditionValue.calcBasic = $el.find('.calcBasicRate').val();
                    }
                    if ($el.find('.isSystemMaxValue').find('input').prop('checked')) {
                        formData.feeConditionValue.isSystemMaxValue = true;
                    } else {
                        formData.feeConditionValue.isSystemMaxValue = false;
                    }

                } else if (formData.conditionClassifyCode == '02') {    // 복합 조건
                    formData.tierHistoryExistYn = $el.find('.tierHistoryExistYn-check-value').val();
                    formData.complexConditionTitleInfoList = titleDataArr;
                    titleDataArr.forEach(function (el) {
                        el.titleConditionGroupTemplateCode = formData.conditionGroupTemplateCode;
                    });

                    complexGridData = complexGridDeleteData.concat(cndValComplexGrid.getAllData());

                    formData.complexConditionMatrix = [];

                    complexGridData.forEach(function (el) {
                      var listCodes = Object.keys(el).reduce(function(l, key) {
                        if (key.endsWith(".code")) {
                          l.push(el[key]);
                        }
                        return l;
                      }, []);
                      nestedFor(listCodes, function(values) {
                        var complexConditionMatrixDataObj = {};
                        complexConditionMatrixDataObj.process = el.process;
                        complexConditionMatrixDataObj.complexStructureId = el.complexStructureId;
                        complexConditionMatrixDataObj.tierNumber = tierNumber++;
                        complexConditionMatrixDataObj.feeConditionValue = el.y;

                        complexConditionMatrixDataObj.x = [];

                        $.each(el, function (prop, value) {
                            var propNm = prop.split('.');

                            if(checkComplexColumn(prop)){
                            	return;
                            }

                            if (prop == 'y') {
                            	 value.applyStart = el.applyStart;
                                 value.applyEnd = el.applyEnd;
                                complexConditionMatrixDataObj.feeConditionValue = value;
                            } else if (propNm.length != 2) {
                                if (value.listConditionValue) {
                                  value = $.extend({}, value);
                                  var index = titleIndexMap[prop];
                                  var code = values[index];
                                  value.listConditionValue = {
                                      defineValues: [{
                                        code: code,
                                        isSelected: true,
                                      }]
                                  }
                                }
                                value.id = prop;
                                // RangeConditionValue And ListConditionValue All Not Exists
                                if (!value.rangeConditionValue && !value.listConditionValue) {
                                    dontSave = true;
                                    return;
                                }
                                else if (value.listConditionValue && value.listConditionValue.defineValues.length === 1
                                    && value.listConditionValue.defineValues[0].code === "") {
                                    dontSave = true;
                                    return;
                                }
                                complexConditionMatrixDataObj.x.push(value);
                            }
                        });

                        if (!el.y) {
                            dontSave = true;
                            return;
                        }

                        formData.complexConditionMatrix.push(complexConditionMatrixDataObj);
                      });
                    });
                }

                break;
        }
        if (dontSave) {
            PFComponent.showMessage(bxMsg('DPS0128Error4'), 'warning');
            return;
        }
    }

    formData.pdInfoDscd = pdInfoDscd;
    formData.tntInstId = selectedTreeItem.tntInstId;

    // 조건구조=복합조건 and 복합적용방법=다계층사용
    if(formData.conditionClassifyCode == '02' &&  formData.layerCalcType == '02') {

        formData.stepCndCd = stepCndCd;
    }

    PFRequest.post('/product_condition/validateProductCondition.json', formData, {
        success: function(responseData) {
            if (responseData === true) {
                PFComponent.showMessage(bxMsg('noAbnormality'), 'success');
            }
        },
        // warning
        showMessageType : 'W',
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdCndService',
            operation: 'validatePdCnd'
        }
    });
});

function nestedFor(rangeList, callback, values) {
  var [range, ...rest] = rangeList;
  values = values || [];

  if (range)
    range.forEach(function(v, i) {
      nestedFor(rest, callback, values.concat([v]));
    });
  else
    callback(values);
}

function deleteArrFromObj(key, arr) {

    arr.forEach(function(el, idx){
        if (el.conditionTemplateCode === key) {
            arr.splice(idx, 1);

            return false;
        }
    })
}

// 구성조건설정 버튼 클릭 시
onEvent('click', '.column-setting-btn', function(e) {
    var conditionPopupGrid, columnSettingPopupGrid,
        measureComboData = codeArrayObj['ProductMeasurementUnitCode'],
        measureComboMap = codeMapObj['ProductMeasurementUnitCode'],
        rangeComboData = codeArrayObj['RangeBlwUnderTypeCode'],
        rangeComboMap = codeMapObj['RangeBlwUnderTypeCode'],
        currencyComboData = codeArrayObj['CurrencyCode'],
        currencyComboMap = codeMapObj['CurrencyCode'];

    PFComponent.makePopup({
        title: bxMsg('columnSetting'),
        width: 840,
        height: 300,
        contents: cndValColumnSettingPopupTpl(),
        buttons:[
            {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn', handler:function(){
                var selectedColumnList = columnSettingPopupGrid.getAllData();
                var newCode;
                selectedColumnList.forEach(function(el, idx){
                    el['complexConditionRecordSequence'] = idx+1;

                    if (el.conditionTemplateCode) {
                        newCode = el.conditionTemplateCode;
                    }

                    delete el.conditionTemplateCode;
                    delete el.conditionTemplateName;
                    delete el.type;
                });

                titleDataArr = selectedColumnList || [];

                // 20150206 OHS - Grid Data Clean
                //var data = (selectedCondition.complexConditionMatrix) ? selectedCondition.complexConditionMatrix : [];
                data = [];

                data.forEach(function(el) {
                    $.each(el, function(prop, value) {
                        if (prop == 'x') {
                            el['x'].push({id: newCode});
                        }
                    })
                });

                renderComplexGrid(titleDataArr, data, $el.find('.tierHistoryExistYn-check-value').val());
                modifyFlag = true;
                this.close();
            }},
            {text:bxMsg('ButtonBottomString16'), elCls:'button button-primary', handler:function(){
                this.close();
            }}
        ],
        listeners: {
            afterRenderUI: function() {
                var requestParam = {
                    'conditionGroupTemplateCode': selectedCondition.conditionGroupTemplateCode,
                    'conditionTemplateCode': selectedCondition.id,
                    'tntInstId' : selectedTreeItem.tntInstId
                };

                PFRequest.get('/conditionGroup/template/queryComplexConditionTemplateRelationForList.json', requestParam, {
                    success: function(responseData) {

                        var resArrLength = responseData.length;

                        // title로 설정되어 있는 조건은 제외
                        var clone = responseData.slice(0);

                        for (var i = 0; i < resArrLength; i++) {
                            if (titleDataObj[clone[i].conditionTemplateCode]) {
                                deleteArrFromObj(clone[i].conditionTemplateCode, responseData);
                            }
                        }

                        conditionPopupGrid = PFComponent.makeExtJSGrid({
                            fields: ['conditionTemplateCode', 'conditionTemplateName', 'type', 'defineValues',
                                'titleConditionDetailTypeCode', 'detailType',{
                                    name: 'titleConditionCode',
                                    convert: function(newValue, record) {
                                        return record.get('conditionTemplateCode');
                                    }}, {
                                    name: 'titleConditionName',
                                    convert: function(newValue, record) {
                                        return record.get('conditionTemplateName');
                                    }}, {
                                    name: 'titleConditionTypeCode',
                                    convert: function(newValue, record) {
                                        return record.get('type');
                                    }}],
                            gridConfig: {
                                renderTo: '.condition-value-column-setting-popup .condition-list-grid',
                                viewConfig: {
                                    plugins: [
                                        Ext.create('Ext.grid.plugin.DragDrop', {
                                            ptype: 'gridviewdragdrop',
                                            dragGroup: 'firstGridDDGroup',
                                            dropGroup: 'secondGridDDGroup'
                                        })],
                                    listeners: {
                                        drop: function(node, data, overModel, dropPosition, eOpts) {
                                            columnSettingPopupGrid.grid.getView().refresh();
                                        }
                                    }
                                },
                                columns: [
                                    {text: bxMsg('DTP0203String3'), flex: 0.6, dataIndex: 'titleConditionCode'},
                                    {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'titleConditionName'}
                                ]
                            }
                        });

                        conditionPopupGrid.setData(responseData);

                        var columns = [
                            {xtype: 'rownumberer', width: 30, sortable: false},
                            {text: bxMsg('DTP0203String3'), flex: 0.6, dataIndex: 'titleConditionCode'},
                            {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'titleConditionName'},
                            {text: bxMsg('measureUnitCode'), flex: 1.3, dataIndex: 'productMeasurementUnit',
                                renderer: function(value, p, record) {
                                    if (record.get('detailType')) {
                                        record.set('titleConditionDetailTypeCode', record.get('detailType'));
                                    }

                                    if (record.get('titleConditionTypeCode') === '02' && record.get('titleConditionDetailTypeCode') !== '01')  {

                                        var val;
                                        if (value) {
                                            val = value;
                                        } else {
                                            if (record.get('titleConditionDetailTypeCode') === '05') {
                                                val = '11';
                                            } else {
                                                val = '14';
                                            }

                                            record.set('productMeasurementUnit', val)
                                        }
                                        return measureComboMap[val];
                                    }
                                },
                                editor: {
                                    xtype: 'combo',
                                    typeAhead: true,
                                    editable: false,
                                    triggerAction: 'all',
                                    displayField: 'name',
                                    valueField: 'code',
                                    store: new Ext.data.Store({
                                        fields: ['code', 'name'],
                                        data: measureComboData
                                    })
                                }},
                            {text: bxMsg('currencyCode'), flex: 1, dataIndex: 'currencyValue',
                                renderer: function(value, p, record) {
                                    if(!record.get('titleConditionDetailTypeCode')) {
                                        record.set('titleConditionDetailTypeCode', record.get('detailType'));
                                    }
                                    if (record.get('titleConditionTypeCode') === '02'&& record.get('titleConditionDetailTypeCode') === '01') {
                                        var val;

                                        if (value) {
                                            val = value;
                                        } else {
                                            val = codeArrayObj['CurrencyCode'][0].code; //조회순서가 제일 높은게 들어감
                                            record.set('currencyValue', val)
                                        }
                                        return currencyComboMap[val];
                                    }
                                },
                                editor: {
                                    xtype: 'combo',
                                    typeAhead: true,
                                    editable: false,
                                    triggerAction: 'all',
                                    displayField: 'name',
                                    valueField: 'code',
                                    store: new Ext.data.Store({
                                        fields: ['code', 'name'],
                                        data: currencyComboData
                                    })
                                }},
                            {text: bxMsg('rangeCode'), flex: 1.3, dataIndex: 'rangeBlwUnderType',
                                renderer: function(value, p, record) {
                                    if (record.get('titleConditionTypeCode') === '02') {
                                        var val;

                                        if (value) {
                                            val = value;
                                        } else {
                                            val = '14';
                                            record.set('rangeBlwUnderType', '01')
                                        }

                                        return rangeComboMap[val];
                                    }
                                },
                                editor: {
                                    xtype: 'combo',
                                    typeAhead: true,
                                    editable: false,
                                    triggerAction: 'all',
                                    displayField: 'name',
                                    valueField: 'code',
                                    store: new Ext.data.Store({
                                        fields: ['code', 'name'],
                                        data: rangeComboData
                                    })
                                }}
                        ];

                        // 기준조건여부 추가
                        var formData = PFComponent.makeYGForm($('.pf-cp-product-condition-panel .condition-table-wrap')).getData();
                        if(formData.conditionClassifyCode == '02' &&            // 조건구조=복합조건
                            formData.layerCalcType == '02') {                    // 복합적용방법=다계층사용
                            columns.push(
                                {
                                    xtype: 'checkcolumn',
                                    text: bxMsg('BaseConditionYn'),
                                    align: 'center',
                                    width: 80,
                                    align: 'center',
                                    sortable: false,
                                    dataIndex: 'baseConditionYn',
                                    listeners: {
                                        checkchange: function(column, rowIndex, checked, eOpts) {
                                            if (checked) {
                                                stepCndCd = columnSettingPopupGrid.store.getAt(rowIndex).get('titleConditionCode');
                                                columnSettingPopupGrid.store.data.items.forEach(function(el, idx){
                                                    if(idx != rowIndex){
                                                        columnSettingPopupGrid.store.getAt(idx).set('baseConditionYn', false);
                                                    }
                                                });
                                            } else{
                                                stepCndCd = "";
                                            }
                                        }
                                    }
                                }
                            );
                        }
                        columnSettingPopupGrid = PFComponent.makeExtJSGrid({
                            fields: ['titleConditionCode', 'rangeBlwUnderType', 'titleConditionName',
                                'productMeasurementUnit', 'titleConditionTypeCode', 'defineValues',
                                'type', 'titleConditionDetailTypeCode', 'currencyValue', 'baseConditionYn'],
                            gridConfig: {
                                renderTo: '.condition-value-column-setting-popup .column-list-grid',
                                viewConfig: {
                                    plugins: [
                                        Ext.create('Ext.grid.plugin.DragDrop', {
                                            ptype: 'gridviewdragdrop',
                                            dragGroup: 'secondGridDDGroup',
                                            dropGroup: 'firstGridDDGroup'
                                        })],
                                    listeners: {
                                        drop: function(node, data, overModel, dropPosition, eOpts) {
                                            columnSettingPopupGrid.grid.getView().refresh();
                                        }
                                    }
                                },
                                stripeRows: true,
                                columns: columns,
                                plugins: [
                                    Ext.create('Ext.grid.plugin.CellEditing', {
                                        clicksToEdit: 1,
                                        listeners: {
                                            beforeedit: function(e, editor){
                                                if (editor.record.data.titleConditionTypeCode !== '02') {
                                                    return false;
                                                } else {
                                                    if(editor.record.data.titleConditionDetailTypeCode === '01' ) {
                                                        if(editor.field == 'productMeasurementUnit') {
                                                            return false;
                                                        }
                                                    } else {
                                                        if(editor.field == 'currencyValue') {
                                                            return false;
                                                        }
                                                    }
                                                }
                                            },
                                            edit: function(e, editor) {
                                                if(editor.record.data.titleConditionDetailTypeCode === '05' ) {
                                                    if (editor.value !== '11' && editor.value !== '12') {
                                                        PFComponent.showMessage(bxMsg('RPorRM'), 'warning');
                                                        editor.record.set('productMeasurementUnit', editor.originalValue);
                                                    }
                                                }
                                            }
                                        }
                                    })
                                ]
                            }
                        });


                        columnSettingPopupGrid.setData(titleDataArr);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CndGroupTemplateService',
                        operation: 'queryListCndGroupTemplateRelation'
                    }
                });
            }
        }
    });
});

// simple <-> comlex condition
onEvent('change', '.ProductConditionClassifyCode', function(e) {
    var value = $(e.currentTarget).val(),
        complexGridWrap = $el.find('.complex-grid-wrap'),
        $conditionValueWrap = $el.find('.condition-value'),
        conditionTypeCode = selectedCondition.conditionTypeCode;

    // Simple Condition
    if (value === '01') {
        complexGridWrap.removeClass('active');
        $conditionValueWrap.addClass('active');

        $el.find('.conditionClassifyCode01-disabled').prop('disabled', true).val('');

        if (selectedCondition.conditionClassifyCode != '01') { //if original data was not simple condition

            switch (conditionTypeCode) {
                case '01':
                    renderCndValueType1Grid(selectedCondition.defineValues);
                    break;
                case '02' :
                    $conditionValueWrap.html(cndValueType2Tpl());

                    renderComboBox('CurrencyCode', $('.CurrencyCode'));
                    $conditionValueWrap.find('input[type=text]').val('0.00');

                    if (selectedCondition.conditionDetailTypeCode == '05') {
                        $conditionValueWrap.find('.isSystemMaxValue').prop('disabled', true);
                        renderComboBox('ProductMeasurementUnitCodeR', $('.ProductMeasurementUnitCode'));
                    }
                    // 02.날짜
                    else if(selectedCondition.conditionDetailTypeCode == '02'){
                        renderComboBox('ProductMeasurementUnitCodeD', $('.ProductMeasurementUnitCode'));
                    }
                    // 03.주기
                    else if(selectedCondition.conditionDetailTypeCode == '03'){
                        renderComboBox('ProductMeasurementUnitCodeF', $('.ProductMeasurementUnitCode'));
                    }
                    // 04.숫자
                    else if(selectedCondition.conditionDetailTypeCode == '04'){
                        renderComboBox('ProductMeasurementUnitCodeN', $('.ProductMeasurementUnitCode'));
                    } else {
                        renderComboBox('ProductMeasurementUnitCode', $('.ProductMeasurementUnitCode'));
                    }

                    if (selectedCondition.isSingleValue) {
                        $conditionValueWrap.find('.isSingleValue-hide').hide();
                    } else {
                        $conditionValueWrap.find('.isNotSingleValue-hide').hide();
                    }
                    // if conditionDetailTypeCode == '01' : AmountType
                    if (selectedCondition.conditionDetailTypeCode == '01') {
                        $conditionValueWrap.find('.detail-type01-hide').hide();
                    } else  {
                        $conditionValueWrap.find('.detail-except-type01-hide').hide();
                    }

                    break;
                case '03' :

                    var defaultValueSetting = {
                		rateApplyWayCode : '01',
                        minInterestRate: '0.000000',
                        maxInterestRate: '0.000000',
                        rate: '0.000000'
                    };

                    $conditionValueWrap.html(cndValueType3Tpl());

                    renderComboBox('FrctnAplyWayCode', $('.FrctnAplyWayCode')); // 우수리적용방법코드
                    renderComboBox('ProductConditionInterestApplyTypeCode', $('.ProductConditionInterestApplyTypeCode')); // 금리적용방식코드
                    renderCndValueType3Tab($conditionValueWrap, {interestConditionValue : defaultValueSetting});


                    $conditionValueWrap.find('.FrctnAplyWayCode').val(''); // 우수리적용방법 default ''

                    $conditionValueWrap.find('.InterestTypeCode01-th').find('.red-notice').text('*');
                    $conditionValueWrap.find('.InterestTypeCode02-th').find('.red-notice').text('');
                    $conditionValueWrap.find('.InterestTypeCode03-th').find('.red-notice').text('');

                    $conditionValueWrap.find('.float0').val('0');
                    $conditionValueWrap.find('.float10').val('0.000000');

                    // 조건값결정레벨이 상품(01)이면
                    if(selectedCondition.conditionAgreeLevel == '01'){
                        // 스프레스율 1개만 입력
                        $conditionValueWrap.find('.maxSprdRt').hide();
                    }else{
                        $conditionValueWrap.find('.maxSprdRt').show();
                    }
                    break;

                case '04' :
                    $conditionValueWrap.html(cndValueType4Tpl());

                    // OHS 2017.03.22 버그수정 - 복합조건으로 저장된 데이터를 일반조건으로 바껐을경우 값입력란 정상출력되지않음.
                    $conditionValueWrap.find('.cnd-value-type4').find('.cnd-value-04-amount-table').addClass('active');

                    renderComboBox('FeeCalculateBasicTypeCode', $('.FeeCalculateBasicTypeCode'));   // 징수기준
                    renderComboBox('ProductMeasurementUnitCodeR', $('.RtMsurUnitCd'));         // 측정단위 세팅

                    $el.find('.condition-type4-table-wrap').find('.TierAplyCalcnWayCodeCode01-disabled').prop('disabled', true).val('');
                    $conditionValueWrap.find('.float10').val('0.000000');
                    $conditionValueWrap.find('.float21').val('0.00');
                    break;
            }
        } else { //In case original data was simple data. This is for reset for complex grid.
            titleDataArr = [];
            titleDataObj = {};
        }

        $el.find('.TierAplyCalcnWayCodeCode-th').find('.red-notice').empty();
    } else if (value === '02') {
        complexGridWrap.addClass('active');
        $conditionValueWrap.removeClass('active');

        if (selectedCondition.conditionClassifyCode != '02' && conditionTypeCode === '04') {
            $el.find('.conditionClassifyCode01-conditionValueAplyWayCode03-disabled').prop('disabled', false).find('option:eq(1)').prop('selected', true);
            $el.find('.layerCalcType01-conditionValueAplyWayCode03-disabled').prop('disabled', false).val('');
        } else {
            $el.find('.conditionClassifyCode01-disabled').prop('disabled', false).find('option:eq(0)').prop('selected', true);
        }

        $el.find('.TierAplyCalcnWayCodeCode-th').find('.red-notice').text('*');

        //It renders empty complex grid only if original data was not complex grid.
        if (selectedCondition.conditionClassifyCode != '02') {
            renderComplexGrid([], []);
        }
    }
});

// 조건값 없음 체크박스
onEvent('click', '.isValueNull', function(e) {
    var $conditionInfoWrap = $el.find('.pf-cp-condition-info'),
        defaultValueSetting;

    if($(e.currentTarget).prop('checked')) {
        $conditionInfoWrap.find('.isMandatory').prop('disabled', true).prop('checked', false);
        $conditionInfoWrap.find('.ProductConditionClassifyCode').prop('disabled', true).val('01');
        $conditionInfoWrap.find('.condition-value-wrap').removeClass('active');
        $conditionInfoWrap.find('.isValueNull-hidden').addClass('active');
        $conditionInfoWrap.find('.ConditionValueApplyWayCodeCode').prop('disabled', true).val(''); // 조건값적용방법

    } else {
        $conditionInfoWrap.find('.isMandatory').prop('disabled', false);
        $conditionInfoWrap.find('.condition-value-wrap').addClass('active');
        $conditionInfoWrap.find('.isValueNull-hidden').removeClass('active');
        $conditionInfoWrap.find('.condition-value').addClass('active');
        $conditionInfoWrap.find('.complex-grid-wrap').removeClass('active');
        $conditionInfoWrap.find('.ConditionValueApplyWayCodeCode').prop('disabled', false); // 조건값적용방법

        if (selectedCondition.isEnableComplexCondition) {
            $conditionInfoWrap.find('.isEnableComplexCondition-disabled').prop('disabled', false);
        }

        if (selectedCondition.conditionAgreeLevel != '02') {    // 02.계약
            $conditionInfoWrap.find('.isMandatory').prop('disabled', true);
        }

        switch (selectedCondition.conditionTypeCode) {
            case '01' :

                if (selectedCondition.conditionClassifyCode != '01') {
                    !cndValueType1Grid && renderCndValueType1Grid(selectedCondition.defineValues);
                } else {
                    !cndValueType1Grid && renderCndValueType1Grid(selectedCondition.listConditionValue.defineValues);
                }

                //심플에서 복합 조건으로 변경할 경우, 복합 그리드의 조건값 필드를 더블클릭 할 때 필요한 정보를 저장해 둠
                YforNewColumn = selectedCondition.listConditionValue;
                break;
            case '02' :
                defaultValueSetting = {
                    minValue: '0.00',
                    maxValue: '0.00',
                    defalueValue: '0.00',
                    increaseValue: '0.00'
                };

            	// OHS 20180417 추가 - 소숫점일치를 위해 추가
            	// 금액
            	if(selectedCondition.conditionDetailTypeCode == '01') {
            		defaultValueSetting.defalueValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.defalueValue, 19, 2, true);
            		defaultValueSetting.minValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.minValue, 19, 2, true);
            		defaultValueSetting.maxValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.maxValue, 19, 2, true);
            		defaultValueSetting.defalueValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.defalueValue, 19, 2, true);
            	}
            	// 율
            	else if(selectedCondition.conditionDetailTypeCode == '05' || selectedCondition.conditionDetailTypeCode == '08') {
            		defaultValueSetting.defalueValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.defalueValue, 3, 6, true);
            		defaultValueSetting.minValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.minValue, 3, 6, true);
            		defaultValueSetting.maxValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.maxValue, 3, 6, true);
            		defaultValueSetting.defalueValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.defalueValue, 3, 6, true);
            	}
            	else {
            		defaultValueSetting.defalueValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.defalueValue, 8, 0, true);
            		defaultValueSetting.minValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.minValue, 8, 0, true);
            		defaultValueSetting.maxValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.maxValue, 8, 0, true);
            		defaultValueSetting.defalueValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.defalueValue, 8, 0, true);
            	}
                
                $conditionInfoWrap.find('.condition-value').html(cndValueType2Tpl(defaultValueSetting));

                if (selectedCondition.isSingleValue) {
                    $conditionInfoWrap.find('.isSingleValue-hide').hide();
                } else {
                    $conditionInfoWrap.find('.isNotSingleValue-hide').hide();
                }

                //conditionDetailTypeCode이 01이면 통화코드, 그외는 측정단위(05만 측정단위의 콤보가 달라짐)
                if (selectedCondition.conditionDetailTypeCode == '01') {
                    $conditionInfoWrap.find('.detail-type01-hide').hide();
                    renderComboBox('CurrencyCode', $('.CurrencyCode:visible'));
                } else {
                    $conditionInfoWrap.find('.detail-except-type01-hide').hide();

                    //05일 때 최대치 선택 못하게 하며 측정단위도 달라여쟈함
                    if (selectedCondition.conditionDetailTypeCode == '05') {
                        // isSystemMaxValue Control
                    	// OHS 2017.02.16 수정 - element를 찾지못해 동작하지않음.
                    	$conditionInfoWrap.find('.isSystemMaxValue').prop('checked', false).find('input').prop('disabled', true);
                        renderComboBox('ProductMeasurementUnitCodeR', $('.ProductMeasurementUnitCode:visible'));
                    }
                    // 02.날짜
                    else if(selectedCondition.conditionDetailTypeCode == '02'){
                        renderComboBox('ProductMeasurementUnitCodeD', $('.ProductMeasurementUnitCode:visible'));
                    }
                    // 03.주기
                    else if(selectedCondition.conditionDetailTypeCode == '03'){
                        renderComboBox('ProductMeasurementUnitCodeF', $('.ProductMeasurementUnitCode:visible'));
                    }
                    // 04.숫자
                    else if(selectedCondition.conditionDetailTypeCode == '04'){
                        renderComboBox('ProductMeasurementUnitCodeN', $('.ProductMeasurementUnitCode:visible'));
                    } else {
                        renderComboBox('ProductMeasurementUnitCode', $('.ProductMeasurementUnitCode:visible'));
                    }
                }

                //  입력포멧 설정
                setRangeFormat($conditionInfoWrap.find('.cnd-value-type2-table'), selectedCondition.conditionDetailTypeCode);

                // OHS 20180417 추가 - default value를 입력하고 각 입력항목별로 맞춰진 소숫점처리대로 보이기위해 일괄 blur 처리
                $conditionInfoWrap.find('.condition-value').find('input').trigger('blur');
                break;

            // 금리형
            case '03' :
                defaultValueSetting = {
            		rateApplyWayCode : '01',
                    minInterestRate: '0.000000',
                    maxInterestRate: '0.000000',
                    rate: '0.000000'
                };

                $conditionInfoWrap.find('.condition-value').html(cndValueType3Tpl(defaultValueSetting));
                var $cndValueType3Wrap = $conditionInfoWrap.find('.cnd-value-type3');
                renderCndValueType3Tab($cndValueType3Wrap, {interestConditionValue : defaultValueSetting});

                renderComboBox('FrctnAplyWayCode', $('.FrctnAplyWayCode'), '', true); // 우수리적용방법코드
                renderComboBox('ProductConditionInterestApplyTypeCode', $('.ProductConditionInterestApplyTypeCode')); // 금리적용방식코드
                renderComboBox('ConditionValueApplyWayCodeCode', $('.ConditionValueApplyWayCodeCode'), '01');		// 상품조건값사용

                // 우대금리적용시점코드 (01:신규일, 02:만기일)
                if(selectedCondition.conditionDetailTypeCode == '11'){   // 우대금리인 경우
                    renderComboBox('PreferentialInterestRateApplyBaseDayCode', $('.prfIntRtAplyTmCd'), '01');
                }else { // 우대금리가 아닌경우
                    $('.prfIntRt-hidden').addClass('active');   // 숨김
                    renderComboBox('PreferentialInterestRateApplyBaseDayCode', $('.prfIntRtAplyTmCd'), '');
                }

                $cndValueType3Wrap.find('.InterestTypeCode-01-enable').prop('disabled', false);

                $cndValueType3Wrap.find('.InterestTypeCode01-th').find('.red-notice').text('*');
                $cndValueType3Wrap.find('.InterestTypeCode02-th').find('.red-notice').text('');
                $cndValueType3Wrap.find('.InterestTypeCode03-th').find('.red-notice').text('');

                $cndValueType3Wrap.find('.float0').val('0');
                $cndValueType3Wrap.find('.float10').val('0.000000');

                // 우수리적용자릿수 default 세팅
                $cndValueType3Wrap.find('.FrctnAplyWayCode').val('');

                // 조건값결정레벨이 상품(01)이면
                if(selectedCondition.conditionAgreeLevel == '01'){
                    // 스프레스율 1개만 입력
                    $cndValueType3Wrap.find('.maxSprdRt').hide();
                }else{
                    $cndValueType3Wrap.find('.maxSprdRt').show();
                }

                // OHS 20180417 추가 - default value를 입력하고 각 입력항목별로 맞춰진 소숫점처리대로 보이기위해 일괄 blur 처리
                $cndValueType3Wrap.find('.condition-value').find('input').trigger('blur');
                break;

            // 수수료형
            case '04' :
                defaultValueSetting = {
                    rate: '0.000000',
                    fixed: '0.00',
                    bottom: '0.00',
                    top: '0.00'
                };

                renderComboBox('CurrencyCode', $('.CurrencyCode'), selectedCondition.currencyValue);
                renderComboBox('FeeSettleTypeCode', $('.FeeSettleTypeCode'), selectedCondition.settleType, true);
                renderComboBox('LevyFrqDscd', $('.LevyFrqDscd'), selectedCondition.levyFrqDscd);    // 징수주기추가.


                $conditionInfoWrap.find('.condition-value').html(cndValueType4Tpl(defaultValueSetting));

                // default 수수료유형 금액 선택
                var $type4Wrap = $('.cnd-value-type4');
                $type4Wrap.find('.cnd-value-04-amount-table').prop('checked', true);
                $type4Wrap.find('.cnd-value-04-amount-table').addClass('active');
                $type4Wrap.find('.cnd-value-04-rate-table').removeClass('active');

                // 기본값 세팅
                $type4Wrap.find('.float21').val('0.00');
                $type4Wrap.find('.float10').val('0.000000');

                renderComboBox('ProductMeasurementUnitCodeR', $('.RtMsurUnitCd'), selectedCondition.rtMsurUnitCd ? selectedCondition.rtMsurUnitCd : '');   // 측정단위 세팅
                renderComboBox('FeeCalculateBasicTypeCode', $('.FeeCalculateBasicTypeCode'), selectedCondition.feeConditionValue ? selectedCondition.feeConditionValue.calcBasic : '');   // 징수기준

                break;
        }

        $conditionInfoWrap.find('.conditionClassifyCode01-disabled').prop('disabled', true).val('');

        if (selectedCondition.isEnableComplexCondition) {
            $conditionInfoWrap.find('.isEnableComplexCondition-disabled').prop('disabled', false);
        }
    }

    fnSetCndAtrb();
});

// 필수협상조건 체크박스
onEvent('click', '.isMandatory', function(e) {
	modifyFlag = true;
});

// 계층이력존재여부
onEvent('click', '.tierHistoryExistYn-check', function(e) {
    if($(e.currentTarget).prop('checked')) {
        $el.find('.tierHistoryExistYn-check-value').val('Y');
        $el.find('.base-date ').show();
        $el.find('.base-date ').val('');
        renderComplexGrid(titleDataArr, cndValComplexGrid.getAllData(), 'Y', 'Y');
    } else {
        $el.find('.tierHistoryExistYn-check-value').val('N');
        $el.find('.base-date ').hide();
        $el.find('.base-date ').val('');
        renderComplexGrid(titleDataArr, cndValComplexGrid.getAllData(), 'N', 'Y');
    }
});

// 계층이력 baseDt
onEvent('keydown.xdsoft', '.base-date', function(e) {

    if (e.keyCode == '13') {
        detailRequestParam.baseDt = e.target.value;
        renderConditionPage(detailRequestParam);
    }
});

onEvent('click', '.isSystemMaxValue', function(e) {
    if($(e.currentTarget).find('input').prop('checked')) {
        $('.cnd-value-type2').find('.maxValue').prop('disabled', true).val('9999999999999999999.999999');
    } else {
        $('.cnd-value-type2').find('.maxValue').prop('disabled', false).val('0.00');
    }
});

onEvent('click', '.isUseSameValue', function(e) {
    if($(e.currentTarget).find('input').prop('checked')) {
    	// 범위
        $('.cnd-value-type2').find('.defalueValue').val($('.cnd-value-type2').find('.minValue').val());

        // OHS 20180122 추가 - 금액/율 라디오버튼 선택에 따라서 분기하도록 함
        if($('input[name=cnd-value-04-radio]:checked').hasClass('charge-radio-amount')) {
            $('.cnd-value-type4').find('.fixed').val($('.cnd-value-type4').find('.minFixFeeAmt').val()); // 금액
        }
        else {
        	$('.cnd-value-type4').find('.rate').val($('.cnd-value-type4').find('.minRt').val()); // 율
        }

        if(!$('.isSystemMaxValue').find('input').prop('checked')) {
            $('.cnd-value-type2').find('.maxValue').val($('.cnd-value-type2').find('.minValue').val());

            // OHS 20180122 추가 - 금액/율 라디오버튼 선택에 따라서 분기하도록 함
            if($('input[name=cnd-value-04-radio]:checked').hasClass('charge-radio-amount')) {
            	$('.cnd-value-type4').find('.maxFixFeeAmt').val($('.cnd-value-type4').find('.minFixFeeAmt').val()); // 금액
            }
            else {
            	$('.cnd-value-type4').find('.maxRt').val($('.cnd-value-type4').find('.minRt').val()); // 율
            }
        }
    }
});

onEvent('keyup.xdsoft', '.minValue', function(e) {
    if($('.isUseSameValue').find('input').prop('checked')){
        if(!$('.isSystemMaxValue').find('input').prop('checked')) {
        	$('.cnd-value-type2').find('.maxValue').val($('.cnd-value-type2').find('.minValue').val());
        	$('.cnd-value-type2').find('.maxValue').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함

        }
        $('.cnd-value-type2').find('.defalueValue').val($('.cnd-value-type2').find('.minValue').val());
        $('.cnd-value-type2').find('.defalueValue').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
    }
});

onEvent('keyup.xdsoft', '.minFixFeeAmt', function(e) {
	// OHS 20180119 수정 - (수수료)금액 테이블영역에서 체크하도록 수정
	//if($('.isUseSameValue').find('input').prop('checked')){
	if($('.cnd-value-04-amount-table .isUseSameValue').find('input').prop('checked')){
        if(!$('.isSystemMaxValue').find('input').prop('checked')) {
        	$('.cnd-value-type4').find('.maxFixFeeAmt').val($('.cnd-value-type4').find('.minFixFeeAmt').val());
        	$('.cnd-value-type4').find('.maxFixFeeAmt').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
        }
        $('.cnd-value-type4').find('.fixed').val($('.cnd-value-type4').find('.minFixFeeAmt').val());
        $('.cnd-value-type4').find('.fixed').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
    }
});

onEvent('keyup.xdsoft', '.minRt', function(e) {
	// OHS 20180119 수정 - (수수료)율 테이블영역에서 체크하도록 수정
	//if($('.isUseSameValue').find('input').prop('checked')){
	if($('.cnd-value-04-rate-table .isUseSameValue').find('input').prop('checked')){
        if(!$('.isSystemMaxValue').find('input').prop('checked')) {
        	$('.cnd-value-type4').find('.maxRt').val($('.cnd-value-type4').find('.minRt').val());
        	$('.cnd-value-type4').find('.maxRt').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
        }
        $('.cnd-value-type4').find('.rate').val($('.cnd-value-type4').find('.minRt').val());
        $('.cnd-value-type4').find('.rate').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
    }
});


// 조건 > 금리형 > 금리적용방식코드 변경 시
onEvent('change', '.ProductConditionInterestApplyTypeCode', function(e) {
    var $type3Wrap = $('.cnd-value-type3');

    var defaultValueSetting = {
        minInterestRate: '0.000000',
        maxInterestRate: '0.000000',
        rate: '0.000000',
        rateApplyWayCode : $(e.currentTarget).val()
    };

    renderCndValueType3Tab($type3Wrap, {interestConditionValue : defaultValueSetting});

});

// 조건 > 금리형 > 금리데이터유형코드 변경 시
onEvent('change', '.fixed-info .InterestTypeCode', function(e) {
    var $type3Wrap = $('.fixed-info');

    var data = {interestConditionValue:{type:$(e.currentTarget).val()}};
    setInterestCombobox(data, $type3Wrap);
});
onEvent('change', '.var-info .InterestTypeCode', function(e) {
    var $type3Wrap = $('.var-info');
    var data = {interestConditionValue:{type:$(e.currentTarget).val()}};
    setInterestCombobox(data, $type3Wrap);
});

// 조건 > 고정기간데이터유형구분코드
onEvent('change', '.fix-irt-tr .fixTrmDataTpDscd', function(e) {
	setFixTrmDataTpDscd($('.fix-irt-tr'), $(e.currentTarget).val());
});

//조건 > 기준금리데이터유형구분코드
onEvent('change', '.fixed-info .baseIntRateDataTpDscd', function(e) {
	setBaseIntRateDataTpDscd($('.fixed-info'), $(e.currentTarget).val());
});
onEvent('change', '.var-info .baseIntRateDataTpDscd', function(e) {
	setBaseIntRateDataTpDscd($('.var-info'), $(e.currentTarget).val());
});

// 조건 > 금리형 > 스프레드 적용산식 변경 시
onEvent('change', '.fixed-info .SprdAplyFormulaCode', function(e) {
    setSprdAplyFormulaCombobox($('.fixed-info'), $(e.currentTarget).val());
});
onEvent('change', '.var-info .SprdAplyFormulaCode', function(e) {
    setSprdAplyFormulaCombobox($('.var-info'), $(e.currentTarget).val());
});

// 조건 > 금리형 > 변동정보 > 변동정보적용방식 변경 시
onEvent('change', '.fixed-info .InterestSegmentTypeCode', function(e) {
    setInterestSegmentTypeCombobox($('.fixed-info'), $(e.currentTarget).val());
});
onEvent('change', '.var-info .InterestSegmentTypeCode', function(e) {
    setInterestSegmentTypeCombobox($('.var-info'), $(e.currentTarget).val());
});

onEvent('change', '.TierAplyCalcnWayCodeCode', function(e) {
    var $type4Table = $('.condition-type4-table-wrap');

    if($(e.currentTarget).val() != '02') {
        $type4Table.find('.TierAplyCalcnWayCodeCode01-disabled').prop('disabled', false).val('');
    } else  {
        $type4Table.find('.TierAplyCalcnWayCodeCode01-disabled').prop('disabled', true).val('');
    }
});

// 조건값적용방법코드 변경시
onEvent('change', '.ConditionValueApplyWayCodeCode', function(e) {
    var $cndValueType3Wrap = $el.find('.cnd-value-type3');

    // 02.내부로직산출 선택시
    if($(e.currentTarget).val() == '02') {
        $el.find('.pf-cp-type3-panel .ProductConditionClassifyCode').prop('disabled', true).val('01').change();    // 조건구조: 일반조건
        $el.find('.pf-cp-type3-panel .cndValApplyWayCode-hidden').hide();    // 자상품사용가능여부
        $el.find('.pf-cp-type3-panel .cnd-val-apply-way').hide();
        $el.find('.pf-cp-type3-panel .additional-info-wrap').hide();
        $el.find('.pf-cp-type3-panel .cnd-value-type3-info-tab').hide();

    } else {
        $el.find('.pf-cp-type3-panel .cndValApplyWayCode-hidden').show();    // 자상품사용가능여부
        $cndValueType3Wrap.find('.cnd-val-apply-way').show();
        $cndValueType3Wrap.find('.additional-info-wrap').show();
        $el.find('.pf-cp-type3-panel .ProductConditionClassifyCode').prop('disabled', false);   // 조건구조

        $el.find('.pf-cp-type3-panel .cnd-value-type3-info-tab').show();
        $cndValueType3Wrap.find('.ProductConditionInterestApplyTypeCode').val('01').change();    // 고정적용
    }
});

var enterFlag  = false;



// 수수료유형 radio button
onEvent('click', 'input[name=cnd-value-04-radio]', function(e) {
    var that = this,
        radioClass = $(that).attr('class'),
        $type4Wrap = $('.cnd-value-type4');

    // 금액
    if ($(that).hasClass('charge-radio-amount')) {
        $type4Wrap.find('.cnd-value-04-amount-table').addClass('active');
        $type4Wrap.find('.cnd-value-04-rate-table').removeClass('active');

        // 초기화
        //$type4Wrap.find('.type2-min-check').val('0.00');
        //$type4Wrap.find('.type2-max-check').val('0.00');
        //$type4Wrap.find('.type2-default-check').val('0.00');
        //$type4Wrap.find('.type2-increase-check').val('0.00');
    }
    // 율
    else if ($(that).hasClass('charge-radio-rate')) {
        $type4Wrap.find('.cnd-value-04-amount-table').removeClass('active');
        $type4Wrap.find('.cnd-value-04-rate-table').addClass('active');

        // 초기화
        //$type4Wrap.find('.type3-min-check').val('0.000000');
        //$type4Wrap.find('.type3-max-check').val('0.000000');
        //$type4Wrap.find('.type3-default-check').val('0.000000');
        //$type4Wrap.find('.type3-increase-check').val('0.000000');
    }
});


onEvent('click', '.complex-condition-value-add-btn', function() {

    if (titleDataArr.length === 0)  {
        // 20150205 Message Add
        PFComponent.showMessage(bxMsg('complexHeaderSetMsg'), 'warning');
        return;
    }

    var tempObj = {},
        tempArr = [];

    $.each(titleDataObj, function(prop, val) {
        tempObj[prop] = {};
    });

    tempObj.process = 'C';
    tempObj.complexStructureId = selectedCondition.complexStructureId
    tempObj.y = {
		conditionStatusCode: '01'
	  , applyStart : PFUtil.getNextDate() + ' 00:00:00'
	  , applyEnd : '9999-12-31 23:59:59'
    };

    tempArr.push(tempObj);

    modifyFlag = true;
    cndValComplexGrid.addData(tempArr);
});

onEvent('click', '.add-cnd2-fee-btn', function(e) {
    renderCnd2FeePopup();
});

onEvent('click', '.add-cnd4-fee-btn', function(e) {
    renderCnd4FeePopup();
});


onEvent('click', '.pf-cp-product-condition2-fee-save-btn', function(e) {
    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    }

    var param = {
        code: productInfo.code,
        projectId: projectId,
        tntInstId: tntInstId
    };

    param.voList = cndType2Grid.getAllData();
    $.each(param.voList, function(index, vo){
        delete(vo.text);
        delete(vo.id);
        delete(vo.rate);
    });

    PFRequest.post('/product/updateProductPrimeInterestRelation.json', param, {
        success: function(responseData) {
            if (responseData === true) {
                PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                $el.find('.pf-cp-condition-list-wrap').empty();
                renderConditionTree(conditionRequestParam);
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationService',
            operation: 'updatePrimeInterestRelation'
        }
    });
});

var conditionTreeStore;
function renderConditionTree(param, item) {
    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();

    PFUI.use(['pfui/tree', 'pfui/data'], function (Tree, Data) {


        if(g_serviceType == g_bxmService){
            param.commonHeader = {
                loginTntInstId: getLoginTntInstId()
            };
            params = {
                header: {
                    application: 'PF_Factory',
                    service: 'PdCndService',
                    operation: 'queryListPdCnd'
                },
                input: param
            };

            conditionTreeStore = new Data.TreeStore({
                autoLoad: false,
                url: '/serviceEndpoint/json/request.json',
                dataProperty: 'responseMessage',
                proxy : {
                    method : 'POST',
                    ajaxOptions : {
                        contentType: 'application/json; charset=UTF-8',
                        data:JSON.stringify(params)
                    },
                    dataType : 'json'
                }
            });

        }else {
            conditionTreeStore = new Data.TreeStore({
                autoLoad: false,
                url: '/product_condition/getListProductCondition.json?commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '", "lastModifier":"' + getLoginUserId() + '"}',
                dataProperty: 'responseMessage'
            });
        }

        conditionTreeStore.on('beforeprocessload', function (ev) {

            if(ev.data.ModelMap){
                ev.data.responseMessage = ev.data.ModelMap.responseMessage;
                delete ev.data.ModelMap.responseMessage;
            }

            if(!ev.data.responseMessage){
            	return;
            }

            ev.data.responseMessage = $.grep(ev.data.responseMessage, function(el){
               return el.useYn != 'N';
            });

            var data = ev.data.responseMessage;

            data.forEach(function(el){ // el = 조건군

                if(el.id == 'PIRT'){    // (조건군템플릿유형코드 = 02.우대금리)
                    el.text = bxMsg('DPS0121_5String1');

                    if ($.isArray(el.children)) {

                        el.children = $.grep(el.children, function(child){
                           return  child.useYn != 'N';
                        });

                        el.children.forEach(function (condition) {

                            condition.text = '[' + condition.id + ']' + condition.text;

                            el.applyMethod = condition.applyMethod;
                            if (condition.id == null) {       // id
                                return;
                            }

                            if (condition.applyMethod == '02') {  // 적용방법이 연결일때는 return;
                                return;
                            }

                            var oriObj = {
                                conditionGroupTemplateCode: condition.conditionGroupTemplateCode,
                                conditionGroupCode: condition.conditionGroupCode,
                                id: condition.id,
                                conditionTypeCode: condition.conditionTypeCode,
                                custom: condition.custom,
                                conditionDetailTypeCode: condition.conditionDetailTypeCode
                            };

                            condition['children'] = [];

                            condition['children'].push($.extend(true, {
                                'text': bxMsg('DPS0121_5String1'),  // 우대금리
                                'menuId': '03-1'
                            }, oriObj));

                            condition['children'].push($.extend(true, {
                                'text': bxMsg('providedCondition'),    // 제공조건
                                'menuId': '03-2'
                            }, oriObj));
                        });
                    }else{
                        el.children = [];
                    }

                    // 목록설정
                    el.children.unshift({
                        id:'I000',
                        text: bxMsg('ListSetting')
                    });

                    // 적용규칙설정
                    el.children.push({
                        id:'IZZZ',
                        text: bxMsg('ApplyRuleSetting')
                    });


                }else {
                	if(el.text.indexOf('*') >= 0) {
                		el.text = '[' + el.id + '] ' + el.text.substring(0, el.text.length-1) + '<span style="color:red;vertical-align: middle;"> *</span>';
                	}else{
                		el.text = '[' + el.id + '] ' + el.text;
                	}

                    if ($.isArray(el.children)) {

                        el.children = $.grep(el.children, function(child){
                            return  child.useYn != 'N';
                        });

                        el.children.forEach(function (condition) {

                            condition.text = '[' + condition.id + ']' + condition.text;

                            if (condition.conditionTypeCode == '04') {   // 수수료일때
                                var oriObj = {
                                    conditionGroupTemplateCode: condition.conditionGroupTemplateCode,
                                    conditionGroupCode: condition.conditionGroupCode,
                                    id: condition.id,
                                    conditionTypeCode: condition.conditionTypeCode,
                                    custom: condition.custom,
                                    conditionDetailTypeCode: condition.conditionDetailTypeCode
                                };

                                condition['children'] = [];

                                // OHS 2017.02.13 - 서비스영역에서는 할인조건은 트리에서 보여주지않음
                                if (condition.conditionTypeCode == '04') {

                                    condition['children'].push($.extend(true, {
                                        'text': bxMsg('DPS0121_4String3'),      // 기본 수수료
                                        'menuId': '04-1'
                                    }, oriObj));

                                    if(pdInfoDscd == pdInfoDscd_Product ) {
	                                    condition['children'].push($.extend(true, {
	                                        'text': bxMsg('DPS0126String2'),        // 할인조건
	                                        'menuId': '04-2'
	                                    }, oriObj));
                                    }
                                }
                            }
                        })
                    }
                }
            });
        });

        if(g_serviceType == g_bxmService){
            conditionTreeStore.load();
        }else {
            conditionTreeStore.load(param);
        }

        var conditionTree = new Tree.TreeList({
            itemTpl : '<li class="{custom}">{text}</li>',
            render: '.pf-cp-condition-list-wrap',
            elCls: 'pf-cp-condition-list',
            store : conditionTreeStore
        });

        conditionTree.render();

        conditionTree.on('expanded', function (ev){
            // 수수료폴더 더블 클릭시 기본수수료 열리도록, 우대금리폴더 더블 클릭시 우대금리 열리도록
            if(!ev.node.leaf &&
                (ev.node.conditionTypeCode == '04' || (ev.node.conditionTypeCode == '03' && ev.node.conditionDetailTypeCode == '11'))){
                conditionTree.setSelected(ev.node.children[0]);
                renderConditionInfo(ev.node.children[0]);
            }
        });

        conditionTree.on('itemdblclick', function (ev) {
            renderConditionInfo(ev.item);
        });

        if(item && item.id=='I000') {
            var node = conditionTreeStore.findNode(item.id);
            //conditionTree.setSelection(conditionTree.getItemByElement(node));
            conditionTree.setSelected(node);
            renderConditionType3_0GridPage(conditionTree.getItemByElement(node));
        }

        function renderConditionInfo(item){
            if (item.leaf) { // || item.type === '02') {

                conditionType3 = '';
                if(item.conditionDetailTypeCode === '11'){ // 우대금리
                    // 20160831 OHS 수정
                    //conditionType3 = true;
                    conditionApplyTargetDscd = '01';
                    conditionType3 = item.applyMethod;

                }else if(item.conditionDetailTypeCode === '09'){
                    conditionApplyTargetDscd = '02';
                }

                detailRequestParam = {
                    conditionGroupTemplateCode: item.conditionGroupTemplateCode,
                    conditionGroupCode: item.conditionGroupCode,
                    productCode: productInfo.code,
                    conditionCode: item.id,
                    pdInfoDscd: pdInfoDscd,
                    tntInstId: selectedTreeItem.tntInstId,
                    conditionGroupTemplateTypeCode: item.conditionGroupTemplateTypeCode,
                    writeYn : item.writeYn
                };

                if (!modifyFlag){
                    //if (item.type === '02') {
                    //    renderConditionType2GridPage();
                    //} else
                    if (item.id == 'I000'){                     // 우대금리 목록설정
                        renderConditionType3_0GridPage(item);
                    } else if (item.applyMethod === '02'){ // 우대금리기본정보

                        renderConditionType3_1GridPage(item);
                    } else if (item.menuId === '03-2'){         // 우대금리제공조건
                        renderConditionType3_2GridPage(item);
                    } else if (item.id == 'IZZZ'){              // 우대금리 적용규칙설정
                        renderConditionType3_ZGridPage(item);
                    } else if (item.menuId === '04-2') {        // 수수료할인
                        renderConditionType4_2GridPage(item);
                    } else {
                        renderConditionPage(detailRequestParam);
                    }
                } else{
                    PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
                        //if (item.type === '02') {
                        //    renderConditionType2GridPage();
                        //} else
                        if (item.id == 'I000'){                     // 우대금리 목록설정
                            renderConditionType3_0GridPage(item);
                        } else if (item.applyMethod === '02') {     // 우대금리기본정보

                            renderConditionType3_1GridPage(item);
                        } else if (item.menuId === '03-2'){         // 우대금리제공조건
                            renderConditionType3_2GridPage(item);
                        } else if (item.id == 'IZZZ'){              // 우대금리 적용규칙설정
                            renderConditionType3_ZGridPage(item);
                        } else if (item.menuId === '04-2') {        // 수수료할인
                            renderConditionType4_2GridPage(item);
                        } else {
                            renderConditionPage(detailRequestParam);
                        }
                        modifyFlag = false; // resetFormModifed();
                    }, function() {
                        return;
                    });
                }
            }
        }
    });
}

/******************************************************************************************************************
 * 조건 > 우대금리 > 목록설정
 ******************************************************************************************************************/
// 우대금리 목록설정 그리드
var deleteConditionList=[];
function renderConditionType3_0GridPage(treeItem) {
    var $conditionInfoWrap = $el.find('.pf-cp-condition-info');

    $conditionInfoWrap.html(conditionType3_0Tpl());

    if(writeYn != 'Y'
        || (selectedTreeItem && selectedTreeItem.writeYn == 'N')
        || (detailRequestParam && detailRequestParam.writeYn == 'N')){
        $('.write-btn').hide();
    }

    cndType3Grid = PFComponent.makeExtJSGrid({
        fields: [
            'id',
            {
                name:'conditionCode',
                convert: function(newValue, record){
                    return record.get('id');
                }
            },
            {
                name:'pdInfoDscd',
                convert: function(newValue, record){
                    return pdInfoDscd;
                }
            },
            'text', 'tntInstId', 'isValueNull','productCode',
            'conditionGroupTemplateCode', 'conditionGroupCode', 'conditionDetailTypeCode',
            'applyStart', 'applyEnd', 'applyMethod', 'process'
        ],
        gridConfig: {
            renderTo: '.condition-type3-grid-wrap',
            columns: [
                {
                    text: bxMsg('DPS0121_5String1') + bxMsg('DTP0203String3'),   // 우대금리 조건코드
                    flex: 1,
                    dataIndex: 'conditionCode'
                },
                {
                    text: bxMsg('DPS0121_5String1') + bxMsg('DTP0203String5'),   // 우대금리 조건명
                    flex: 1.5,
                    dataIndex: 'text'
                },
                {
                    text: bxMsg('AplyMethod'),  flex:1, dataIndex: 'applyMethod',
                    renderer: function(value) {
                        return codeMapObj.ApplyMethodCode[value] || value;
                    },
                    editor: {
                        xtype: 'combo',
                        typeAhead: true,
                        triggerAction: 'all',
                        displayField: 'name',
                        valueField: 'code',
                        editable: false,
                        store: new Ext.data.Store({
                            fields: ['code', 'name'],
                            data: codeArrayObj['ApplyMethodCode']
                        })
                    }
                },
                {
                    xtype: 'actioncolumn', width: 35, align: 'center',
                    items: [{
                        icon: '/images/x-delete-16.png',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                            modifyFlag = true;
                            if(record.data.process != 'C') {
                                record.data.process = 'D';
                                deleteConditionList.push(record.data);
                            }
                            record.destroy();
                        }
                    }]
                }
            ],
            listeners: {
                scope: this
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                        beforeedit:function(e, editor){
                            if(editor.record.get('isValueNull')){ // 정의된 값이 없으면
                                return false;
                            }
                        },
                        afteredit: function(e, editor){
                            if(editor.originalValue !=  editor.value && editor.record.get('process') != 'C'){
                                editor.record.set('process', 'U');
                                modifyFlag = true;
                            }
                        }
                    }
                })
            ]
        } // gridconfig end
    }); // 그리드 end

    //if (treeItem) {
    detailRequestParam = {
        tntInstId : selectedTreeItem.tntInstId,
        productCode: selectedTreeItem.id
        //conditionGroupTemplateTypeCode: '01'        // null.공통, 01.공통+상품
        //conditionGroupTemplateCode: treeItem.conditionGroupTemplateCode,
        //conditionGroupCode: treeItem.conditionGroupCode,
        //conditionCode: treeItem.id,
    };
    //}

    // 우대금리 목록설정 그리드 조회
    PFRequest.get('/product_condition/getProductPreferenceInterestCondition.json', detailRequestParam, {
        success: function(data) {
            cndType3Grid.setData(data);
            deleteConditionList = [];
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PreferencialInterestService',
            operation: 'queryPdPreferentialInterestCnd'
        }
    });
}

// 우대금리 목록설정 저장
function saveListSetting(projectId){

    var gridData = cndType3Grid.getAllData().concat(deleteConditionList);
    var requestData = {
        projectId: projectId,
        voList: gridData
    };

    // 서비스 호출
    PFRequest.post('/product_condition/savePreferentialInterestList.json', requestData, {
        success: function(responseData) {
            if (responseData === true) {
                PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                // setPrefIntTreeData(gridData);
                $el.find('.pf-cp-condition-list-wrap').empty();
                renderConditionTree(conditionRequestParam, {id:'I000'});
                deleteConditionList = [];
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PreferencialInterestService',
            operation: 'savePreferentialInterestList'
        }
    });
}

// 조건트리 set
function setPrefIntTreeData(gridData){

    var parentNode = conditionTreeStore.findNode('PIRT'); // id로 우대금리를 검색

    gridData.forEach(function (condition) {

        if(condition.process == 'D'){
            conditionTreeStore.remove(conditionTreeStore.findNode(condition.id));   // id로 조건을 찾아서 삭제
        }else{

            if(condition.applyMethod == '01'){          // 01.정의
                condition.custom = 'node_disable';      // 회색 display

                var oriObj = {
                    conditionGroupTemplateCode: condition.conditionGroupTemplateCode,
                    conditionGroupCode: condition.conditionGroupCode,
                    id: condition.id,
                    conditionTypeCode: condition.conditionTypeCode,
                    custom: condition.custom,
                    conditionDetailTypeCode: condition.conditionDetailTypeCode
                };

                condition['children'] = [];

                condition['children'].push($.extend(true, {
                    'text': bxMsg('DPS0121_5String1'),  // 우대금리
                    'menuId': '03-1'
                }, oriObj));

                condition['children'].push($.extend(true, {
                    'text': bxMsg('providedCondition'),    // 제공조건
                    'menuId': '03-2'
                }, oriObj));

            }else if(condition.applyMethod == '02'){    // 02.연결
                condition.custom = '';                  // 검정 display
                condition.applyStart = PFUtil.getNextDate() + ' 00:00:00';
            }

            if(condition.process == 'C'){
                conditionTreeStore.add(condition, parentNode, 1);
            }else if(condition.process == 'U'){
                conditionTreeStore.update(condition);
            }
        }
    });
}

// 공통우대금리조건 추가 버튼 클릭
onEvent('click', '.add-cmn-int-cnd-btn', function(e) {

    var submitEvent = function(selectedData){
        selectedData.forEach(function (el){
        	var duplicateCount = 0;

        	// OHS 20180425 추가 - 기존그리드에서 없는조건만 추가한다.
        	if(cndType3Grid.getAllData() && cndType3Grid.getAllData().length > 0) {
        		for(var i = 0; i < cndType3Grid.getAllData().length; i++) {
        			 if(el.id == cndType3Grid.getAllData()[i].id) {
            			 duplicateCount++;
            		 }
        		}
        	}
        	if(duplicateCount > 0) {
        		return;
        	}

            if(el.isValueNull) {          // true == 값 없음,
                el.applyMethod = '01';   // 01.정의
            }else{                                  // false = 값 존재
                el.applyMethod = '02';   // 02.연결
            }

            el.process = 'C';
            el.productCode = selectedTreeItem.id;

            // 그리드에 추가
            cndType3Grid.addData(el);
            modifyFlag = true;
        })
    };

    // 팝업호출
    renderSearchCommonPrefIntPopup(submitEvent);

});

// 우대금리 목록 저장 버튼 클릭
onEvent('click', '.list-setting-save-btn', function(e) {
    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    };
    saveListSetting(projectId);
});

/******************************************************************************************************************
 * 조건 > 우대금리 > 적용규칙설정
 ******************************************************************************************************************/

// 우대금리 적용규칙설정
function renderConditionType3_ZGridPage(treeItem){
    var $conditionInfoWrap = $el.find('.pf-cp-condition-info');

    $conditionInfoWrap.html(conditionType3_ZTpl());         // 적용규칙설정 그리드
    PFUtil.getAllDatePicker(true, $('.condition-type3-grid-header'));
    $conditionInfoWrap.find('.preference-interest-apply-rule-condition-search-base').val(PFUtil.getToday() + ' 00:00:00');
    // 적용규칙
    $('.apply-rule-info-wrap').html(cndApplyRuleTpl());     // 적용규칙 화면 render

    // 적용규칙 화면 조정

    $('.apply-rule-info-wrap').find('span.max-discount').text(bxMsg('DPS0121_4String6')+bxMsg('DPS0121_5String1')+'(%)');
    $('.apply-rule-info-wrap').find('.discount-amount[value="02"]').prop('checked', false);     // 금액 checked
    $('.apply-rule-info-wrap').find('.discount-rate[value="01"]').prop('checked', true);        // 율 unchecked
    $('.apply-rule-info-wrap').find('.discount-radio').hide();
    $('.apply-rule-info-wrap').find('.pf-cp-apply-rule-grapic-view-btn').hide();

    $('.apply-rule-info-wrap .max-amount').prop('type', 'hidden');                              // 금액 숨김
    $('.apply-rule-info-wrap .max-rate').prop('type', 'text');                                  // 율 활성

    $('.apply-rule-info-wrap .and').hide();
    $('.apply-rule-info-wrap .or').hide();
    $('.apply-rule-info-wrap .not').hide();
    $('.apply-rule-info-wrap .match').hide();
    $('.applyRuleSyntaxError').hide();

    if(writeYn != 'Y'
        || (selectedTreeItem && selectedTreeItem.writeYn == 'N')
        || (detailRequestParam && detailRequestParam.writeYn == 'N')){
        $('.write-btn').hide();
    }

    cndType3Grid = PFComponent.makeExtJSGrid({
        fields: [
            'id','applyStart', 'applyEnd', 'conditionStatusCode',
            {
                name:'conditionCode',
                convert: function(newValue, record){
                    return record.get('id');
                }
            },
            'text',
            'basicInterestRate', 'minmumInterestRate', 'maximumInterestRate',
            {
                name:'conditionValue',
                convert: function(newValue, record) {
                    if (record.get('basicInterestRate')) {
                        return bxMsg('DPS0129Unit1String1') + ' : ' + record.get('minmumInterestRate') + '~' + record.get('maximumInterestRate') + '(' + record.get('basicInterestRate') + ')';
                    }else{
                        return bxMsg('MTM0200String8');
                    }
                }
            }
        ],
        gridConfig: {
            renderTo: '.condition-type3-grid-wrap',
            columns: [
                {
                    text: bxMsg('DPS0121_5String1') + bxMsg('DTP0203String3'),   // 우대금리 조건코드
                    flex: 1.1,
                    dataIndex: 'conditionCode'
                },
                {
                    text: bxMsg('DPS0121_5String1') + bxMsg('DTP0203String5'),   // 우대금리 조건명
                    flex: 1,
                    dataIndex: 'text'
                },
                {
                    text: bxMsg('DPS0102String4'),   // 적용시작일자
                    flex: 1,
                    dataIndex: 'applyStart'
                },
                {
                    text: bxMsg('DPS0102String5'),   // 적용종료일자
                    flex: 1,
                    dataIndex: 'applyEnd'
                },
                {
                    text: bxMsg('DPS0126String14'),   // 상태
                    flex: 0.6,
                    dataIndex: 'conditionStatusCode',
                    renderer: function(value, p, record) {
                        return codeMapObj['ProductStatusCode'][value];
                    }
                },
                {
                    text: bxMsg('DPS0129String4'),      // 조건값
                    flex:3,
                    dataIndex: 'conditionValue'

                }
            ],
            listeners: {
                scope: this,
                'celldblclick': function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    var cntnt = $('.apply-rule').val() + "#"+record.get('id');
                    $('.apply-rule').val(cntnt);

                    // OHS20180416 추가 - 계산영역처럼 적용
                    tokens.push({
                        type: TokenType.CONDITION,
                        value: "#"+record.get('id')
                    });
                }
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ]
        } // gridconfig end
    }); // 그리드 end

    if (treeItem) {
        detailRequestParam = {
            tntInstId : selectedTreeItem.tntInstId,
            productCode: selectedTreeItem.id,
            conditionGroupTemplateTypeCode: '01',        // null.공통, 01.공통+상품
            applyStart: $('.preference-interest-apply-rule-condition-search-base').val()
        };
    }

    // 우대금리 적용규칙설정 그리드 조회
    PFRequest.get('/product_condition/getProductPreferenceInterestCondition.json', detailRequestParam, {
        success: function(data) {
            cndType3Grid.setData(data);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PreferencialInterestService',
            operation: 'queryPdPreferentialInterestCnd'
        }
    });

    $('.apply-rule-info-wrap').find('.rule-apply-target-distinction-code').val('01');	// 규칙적용대상구분코드 = 01.우대금리적용규칙, 02.수수료할인, 03.서비스, 04.제공조건
    PFUtil.getDatePicker(true);
    renderComboBox('ProductStatusCode', $('.apply-rule-info-wrap .status'));
    $conditionInfoWrap.find('.apply-rule')[0].placeholder = bxMsg('noneApplyRule');
    searchApplyRule(treeItem);	// 조회
}

//우대금리 적용규칙설정 그리드 조회

onEvent('keydown.xdsoft', '.preference-interest-apply-rule-condition-search-base', function(e) {

    if (e.keyCode == '13') {
        detailRequestParam = {
            tntInstId: selectedTreeItem.tntInstId,
            productCode: selectedTreeItem.id,
            conditionGroupTemplateTypeCode: '01',        // null.공통, 01.공통+상품
            applyStart: $('.preference-interest-apply-rule-condition-search-base').val()
        };

        // 우대금리 적용규칙설정 그리드 조회
        PFRequest.get('/product_condition/getProductPreferenceInterestCondition.json', detailRequestParam, {
            success: function (data) {
                cndType3Grid.setData(data);
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'PreferencialInterestService',
                operation: 'queryPdPreferentialInterestCnd'
            }
        });
    }
});

/******************************************************************************************************************
 * 조건 > 우대금리
 ******************************************************************************************************************/

// 우대금리 관계 정보 (연결일때)
var prefIntRelInfo;
function renderConditionType3_1GridPage(treeItem) {

    var $conditionInfoWrap = $el.find('.pf-cp-condition-info');

    if (treeItem) {
        detailRequestParam = {
            conditionGroupTemplateCode: treeItem.conditionGroupTemplateCode,
            conditionGroupCode: treeItem.conditionGroupCode,
            conditionCode: treeItem.id,
            tntInstId : selectedTreeItem.tntInstId,
            code: selectedTreeItem.id,
            pdInfoDscd: pdInfoDscd,
            applyStart : treeItem.applyStart
        };
    }

    PFRequest.get('/product/queryPrimeInterestRelation.json', detailRequestParam, {
        success: function (data) {data
            // OHS20160902 실제 데이터가 null 일경우 목록설정 화면으로 이동
            if(data.tntInstId == null) {
                var node = conditionTreeStore.findNode(prefIntRelInfo.conditionCode);
                conditionTreeStore.remove(node);
                modifyFlag = false; // resetFormModifed();
                renderConditionType3_0GridPage();
            }
            else {
                prefIntRelInfo = data;

                $conditionInfoWrap.html(conditionType3_1Tpl(data));
                renderComboBox('ProductStatusCode', $('.relationInformationStatus'), data.relationInformationStatus);

                if(data.relationInformationStatus != '01'){ // 상태 != 01.수정가능
                    $('.pf-cp-product-pref-int-delete-btn').prop('disabled', true); // 삭제버튼 비활성
                }

                // 권한이 없는 경우
                if (writeYn != 'Y'
                    || (selectedTreeItem && selectedTreeItem.writeYn == 'N')
                    || (detailRequestParam && detailRequestParam.writeYn == 'N')) {
                    $('.write-btn').hide();
                }

                detailRequestParam.commonConditionYn = 'Y';
                detailRequestParam.applyMethod = '02';

                delete detailRequestParam.applyStart;
                renderConditionPage(detailRequestParam);
            }

            fnSetCndAtrb();
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PreferencialInterestService',
            operation: 'queryPdPreferentialInterestRelation'
        }
    });
}

// 우대금리 관계 저장 버튼 클릭
onEvent('click', '.pf-cp-product-pref-int-save-btn', function(e) {

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    };

    prefIntRelInfo.oldApplyStart = prefIntRelInfo.applyStart;
    var formData = prefIntRelInfo;
    $.extend(formData, PFComponent.makeYGForm($('.pf-cp-product-condition-panel .pref-int-table-wrap')).getData());
    formData.projectId = projectId;

    // 서비스 호출
    PFRequest.post('/product/updateProductPrimeInterestRelation.json', formData, {
        success: function(responseData) {
            if (responseData === true) {
                PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                var node = conditionTreeStore.findNode(prefIntRelInfo.conditionCode);
                node.applyStart = prefIntRelInfo.applyStart;
                conditionTreeStore.update(node);

                renderConditionType3_1GridPage(node);
                modifyFlag = false; // resetFormModifed();
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationService',
            operation: 'updatePrimeInterestRelation'
        }
    });
});

// 우대금리 관계 삭제 버튼 클릭
onEvent('click', '.pf-cp-product-pref-int-delete-btn', function(e) {

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    };

    var requestParam = prefIntRelInfo;
    requestParam.projectId = projectId;

    // 서비스 호출
    PFRequest.post('/product/deleteProductPrimeInterestRelation.json', requestParam, {
        success: function(responseData) {
            if (responseData === true) {
                PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                var node = conditionTreeStore.findNode(prefIntRelInfo.conditionCode);
                renderConditionType3_1GridPage(node);

                //var node = conditionTreeStore.findNode(prefIntRelInfo.conditionCode);
                //conditionTreeStore.remove(node);
                modifyFlag = false; // resetFormModifed();
                //renderConditionType3_0GridPage();
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PreferencialInterestService',
            operation: 'deletePdPreferentialInterestRelation'
        }
    });
});


/******************************************************************************************************************
 * 조건 > 우대금리 > 제공조건
 ******************************************************************************************************************/

// 공통우대금리제공조건 연결인 경우 확장버튼 클릭 시
onEvent('click', '.pf-cp-provide-condition-expend-view-btn', function(e) {

    var $button = $('.pf-cp-condition-info .pf-cp-type3-2panel .pf-cp-provide-condition-expend-view-btn');
    $button.toggleClass('cnd-info-expand');

    if($button.hasClass('cnd-info-expand')){
        //$(e.currentTarget).text('▲');
        $(e.currentTarget).html('<i class="bw-icon i-25 i-close3"></i>');
        $('.pf-cp-condition-info .pf-cp-type3-2panel .pf-panel-body').show();
        if(!cndType3Grid) {
            // 그리드
            cndType3Grid = renderConditionType3_2Grid(detailRequestParam);

            // 적용규칙
            $('.apply-rule-info-wrap').find('.rule-apply-target-distinction-code').val('04');	// 규칙적용대상구분코드 = 01.우대금리적용규칙, 02.수수료할인, 03.서비스, 04.제공조건
            PFUtil.getDatePicker(true);
            renderComboBox('ProductStatusCode', $('.apply-rule-info-wrap .status'));
            $('.pf-cp-type3-2panel .apply-rule')[0].placeholder = bxMsg('noneApplyRule');
            searchApplyRule(detailRequestParam);	// 조회
        }
    }else{
        //$(e.currentTarget).text('▼');
        $(e.currentTarget).html('<i class="bw-icon i-25 i-open3"></i>');
        $('.pf-cp-condition-info .pf-cp-type3-2panel .pf-panel-body').hide();
    }

});

// 우대금리 제공조건 그리드페이지
function renderConditionType3_2GridPage(treeItem) {

    var $conditionInfoWrap = $el.find('.pf-cp-condition-info');
    cndType3Grid = null;

    //if (treeItem && !treeItem.conditionGroupCode) {
    //
    //    $conditionInfoWrap.find('.add-cnd3-int-btn').prop('disabled', true);
    //    return;
    //}

    if(treeItem.applyMethod == '02') {
        $conditionInfoWrap.append(conditionType3_2Tpl());
    } else {
        $conditionInfoWrap.html(conditionType3_2Tpl());
    }

    // 적용규칙
    $('.apply-rule-info-wrap').html(cndApplyRuleTpl());     // 적용규칙 화면 render

    // 적용규칙 화면 조정
    $('.apply-rule-info-wrap').find('.max-discount').hide();
    $('.apply-rule-info-wrap').find('.discount-amount[value="02"]').prop('checked', false);      // 금액 checked
    $('.apply-rule-info-wrap').find('.discount-rate[value="01"]').prop('checked', false);       // 율 unchecked
    $('.apply-rule-info-wrap').find('.pf-cp-apply-rule-grapic-view-btn').hide();

    $('.apply-rule-info-wrap .min').hide();
    $('.apply-rule-info-wrap .max').hide();
    $('.apply-rule-info-wrap .avg').hide();
    $('.apply-rule-info-wrap .sum').hide();
    $('.applyRuleSyntaxError').hide();

    // 공통우대금리 적용방법코드 = 02.연결 일때
    if(treeItem.applyMethod == '02') {

        $conditionInfoWrap.find('.pf-cp-type3-2panel .pf-panel-footer').remove();                    // 하단버튼 제거
        $conditionInfoWrap.find('.pf-cp-type3-2panel button').remove();
        $conditionInfoWrap.find('.pf-cp-type3-2panel .condition-type3-grid-header').remove();

        //var $button = '<button class="bw-btn bx-btn-small pf-cp-provide-condition-expend-view-btn">'+'▼'+'</button>';
        var $button = '<button class="bw-btn bx-btn-small pf-cp-provide-condition-expend-view-btn">'+
            '<i class="bw-icon i-25 i-open3"></i>'
            +'</button>';
        $conditionInfoWrap.find('.pf-cp-type3-2panel .header-btn-group').append($button);
        $conditionInfoWrap.find('.pf-cp-type3-2panel .pf-panel-body').hide();

        $conditionInfoWrap.find('.pf-cp-type3-2panel .apply-rule-info-wrap :input').prop('disabled', true);

    } else{

        // 적용규칙
        $('.apply-rule-info-wrap').find('.rule-apply-target-distinction-code').val('04');
        PFUtil.getDatePicker(true);
        PFUtil.getAllDatePicker(true, $('.pf-cp-condition-type3-2tpl .header-group'));
        //$('.bnft-prov-cnd-search').val(XDate(Date()).toString("yyyy-MM-dd")+ " 00:00:00");

        // 우대금리제공조건 엔터누를경우 조회
        $('.bnft-prov-cnd-search').on('keydown.xdsoft', function(e) {
            if (e.keyCode == '13') {
                if($('.bnft-prov-cnd-search').val()) {
                    detailRequestParam.applyStartDate = $('.bnft-prov-cnd-search').val();
                }
                else {
                    delete detailRequestParam.applyStartDate;
                }
                PFRequest.get('/benefit/queryListBenefitProvideCnd.json', detailRequestParam, {
                    success: function(data) {
                        cndType3Grid.setData(data);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'BenefitProvideCndService',
                        operation: 'queryListBenefitProvideCnd'
                    }
                });
            }
        });

        $('.bnft-prov-cnd-search').on('focusout', function(e){
            if($('.bnft-prov-cnd-search').val()) {
                detailRequestParam.applyStartDate = $('.bnft-prov-cnd-search').val();
            }
            else {
                delete detailRequestParam.applyStartDate;
            }
            PFRequest.get('/benefit/queryListBenefitProvideCnd.json', detailRequestParam, {
                success: function(data) {
                    cndType3Grid.setData(data);
                },
                bxmHeader: {
                    application: 'PF_Factory',
                    service: 'BenefitProvideCndService',
                    operation: 'queryListBenefitProvideCnd'
                }
            });
        });

        renderComboBox('ProductStatusCode', $('.apply-rule-info-wrap .status'));

        $conditionInfoWrap.find('.apply-rule')[0].placeholder = bxMsg('noneApplyRule');
        if (treeItem && treeItem.conditionGroupCode && treeItem.conditionGroupCode != '') {
            cndType3Grid = renderConditionType3_2Grid(treeItem);
            searchApplyRule(treeItem);	// 조회
        } else {
            cndType3Grid = renderConditionType3_2Grid();
            $conditionInfoWrap.find('.pf-panel-body :input').prop('disabled', true);
        }
    }

    // 권한이 없는 경우
    if(writeYn != 'Y'
        || (selectedTreeItem && selectedTreeItem.writeYn == 'N')
        || (detailRequestParam && detailRequestParam.writeYn == 'N')){
        $('.write-btn').hide();
    }
}

// 우대금리 제공조건 그리드
function renderConditionType3_2Grid(treeItem, renderTo){
    var grid = PFComponent.makeExtJSGrid({
        fields: ['providedConditionCode','providedConditionName','process',
            'providedConditionStatusCode', 'applyStartDate',
            'applyEndDate', 'providedConditionTypeCode', 'providedConditionDetailTypeCode',
            'productBenefitProvidedListConditionList', 'mesurementUnitCode', 'currencyCode', 'cndDscd',
            'isAdditionalInfoExist','provideCndAdditionalInfoDetailList', 'providedConditionSequenceNumber',
            {
                name: 'maxValue',
                convert: function(newValue, record) {
                    if (newValue) {
                     	// OHS 20180417 추가 - 소숫점일치를 위해 추가
                    	// 금액, 숫자
                    	if(record.get('providedConditionDetailTypeCode') == '01'
                    		|| record.get('providedConditionDetailTypeCode') == '04') {
                    		newValue = PFValidation.gridFloatCheckRenderer(newValue, 19, 2);
                    	}
                    	// 율
                    	else if(record.get('providedConditionDetailTypeCode') == '05') {
                     		newValue = PFValidation.gridFloatCheckRenderer(newValue, 3, 6);
                    	}
                    	// 날짜
                    	else if(record.get('providedConditionDetailTypeCode') == '02') {
                    		newValue = PFValidation.gridFloatCheckRenderer(newValue, 8, 0);
                    	}
                    	else {
                    		newValue = PFValidation.gridFloatCheckRenderer(newValue, 19, 2);
                    	}
                        return newValue;
                    } else {
                    	var val = '0.00';
                        if (!record || !newValue) {
                         	if(record.get('providedConditionDetailTypeCode') == '01'
                        		|| record.get('providedConditionDetailTypeCode') == '04') {
                         		val = '0.00';
                        	}
                        	// 율
                        	else if(record.get('providedConditionDetailTypeCode') == '05') {
                        		val = '0.000000';
                        	}
                        	// 날짜
                        	else if(record.get('providedConditionDetailTypeCode') == '02') {
                        		val = '0';
                        	}
                        	else {
                        		val = '0.00';
                        	}
                        }
                        return val;
                    }
                }
            },
            {
                name: 'minValue',
                convert: function(newValue, record) {
                    if (newValue) {
                     	// OHS 20180417 추가 - 소숫점일치를 위해 추가
                    	// 금액, 숫자
                    	if(record.get('providedConditionDetailTypeCode') == '01'
                    		|| record.get('providedConditionDetailTypeCode') == '04') {
                    		newValue = PFValidation.gridFloatCheckRenderer(newValue, 19, 2);
                    	}
                    	// 율
                    	else if(record.get('providedConditionDetailTypeCode') == '05') {
                     		newValue = PFValidation.gridFloatCheckRenderer(newValue, 3, 6);
                    	}
                    	// 날짜
                    	else if(record.get('providedConditionDetailTypeCode') == '02') {
                    		newValue = PFValidation.gridFloatCheckRenderer(newValue, 8, 0);
                    	}
                    	else {
                    		newValue = PFValidation.gridFloatCheckRenderer(newValue, 19, 2);
                    	}
                        return newValue;
                    } else {
                    	var val = '0.00';
                        if (!record || !newValue) {
                         	if(record.get('providedConditionDetailTypeCode') == '01'
                        		|| record.get('providedConditionDetailTypeCode') == '04') {
                         		val = '0.00';
                        	}
                        	// 율
                        	else if(record.get('providedConditionDetailTypeCode') == '05') {
                        		val = '0.000000';
                        	}
                        	// 날짜
                        	else if(record.get('providedConditionDetailTypeCode') == '02') {
                        		val = '0';
                        	}
                        	else {
                        		val = '0.00';
                        	}
                        }
                        return val;
                    }
                }
            }
        ],
        gridConfig: {
            renderTo: renderTo ? renderTo : '.condition-type3-grid-wrap',
            columns: [
                {
                    text: bxMsg('DAS0101String11'),   // 일련번호
                    flex: 0.6,
                    dataIndex: 'providedConditionSequenceNumber'
                },
                {
                    text: bxMsg('providedConditionCode'),   // 제공조건코드
                    flex: 0.6,
                    dataIndex: 'providedConditionCode'
                },
                {
                    text: bxMsg('providedConditionName'),   // 제공조건명
                    flex: 0.6,
                    dataIndex: 'providedConditionName'
                },
                {
                    text : bxMsg('DPS0101String6'),         // 상태
                    width : 70,
                    align: 'center',
                    dataIndex : 'providedConditionStatusCode',
                    renderer : function(value){
                        return codeMapObj['ProductStatusCode'][value];
                    }
                },
                {
                    text: bxMsg('DPP0127String6'), flex: 1, dataIndex: 'applyStartDate',
                    /*editor: {
                     allowBlank: false,
                     listeners: {
                     focus: function (_this) {
                     PFUtil.getGridDateTimePicker(_this, 'applyStartDate', grid, selectedCndGridCellIndex, true);
                     },
                     blur: function(_this, e){
                     PFUtil.checkDate(e.target);
                     }
                     }
                     },
                     listeners: {
                     click: function () {
                     selectedCndGridCellIndex = $(arguments[1]).parent().index();
                     }
                     }*/
                },
                {
                    text: bxMsg('DPP0127String7'), flex: 1, dataIndex: 'applyEndDate',
                    /*editor: {
                     allowBlank: false,
                     listeners: {
                     focus: function (_this) {
                     //$('#'+_this.inputId).prop('readonly',true);
                     PFUtil.getGridDateTimePicker(_this, 'applyEndDate', grid, selectedCndGridCellIndex, true);
                     },
                     blur: function(_this, e){
                     PFUtil.checkDate(e.target, '9999-12-31 23:59:59');
                     }
                     }
                     },
                     listeners: {
                     click: function () {
                     selectedCndGridCellIndex = $(arguments[1]).parent().index();
                     }
                     }*/
                },
                {
                    text: bxMsg('providedConditionVal'),
                    flex: 1,
                    renderer: function (value, p, record) {
                        var yVal = '', extFormat, yTitle1 = '', yVal1 = '';
                        var conditionTypeCode = record.get('providedConditionTypeCode');

                        if (conditionTypeCode == '01') {

                            if (record.get('productBenefitProvidedListConditionList')) {
                                record.get('productBenefitProvidedListConditionList').forEach(function (el) {
                                    yVal = yVal + '['+el.listCode+']'+ el.listCodeName + '，';
                                });

                                if (yVal != '' && yVal.length > 0) {
                                    yVal = yVal.substring(0, yVal.length - 1);
                                }
                            }

                            extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}</p>', yVal);
                        } else {
                            var minString, maxString;

                            minString = record.get('minValue');
                            maxString = record.get('maxValue');

                            yTitle1 = bxMsg('minAndMax') + ' : ';
                            yVal1 = minString + '~' + maxString;

                            extFormat = Ext.String.format('<p class="ext-condition-value-column">{0} {1} </p>', yTitle1, yVal1);
                        }

                        return extFormat;
                    }
                },
                {
                    xtype: 'checkcolumn',
                    text: bxMsg('DPM10002Sring8'),
                    width: 60,
                    dataIndex: 'isAdditionalInfoExist' // 부가정보존재여부
                }/*,
                 {   // 부가정보 입력
                 xtype: 'actioncolumn', width: 35, align: 'center',
                 items: [{
                 icon: '/images/edit-icon30.png',
                 handler: function (_this, rowIndex, colIndex, item, e, record) {
                 _this.focusRow(rowIndex);

                 var submitEvent = function(listData){

                 if(listData.length > 0){
                 record.set('provideCndAdditionalInfoDetailList', listData);
                 record.set('isAdditionalInfoExist', true);
                 }else{
                 record.set('provideCndAdditionalInfoDetailList', []);
                 record.set('isAdditionalInfoExist', false);
                 }
                 if(record.get('process') != 'C') {
                 record.set('process', 'U');
                 }
                 };

                 renderAddInfoPopup(submitEvent, record.getData());
                 }
                 }]
                 }*//*,

                 {
                 xtype: 'actioncolumn', width: 35, align: 'center',
                 items: [{
                 icon: '/images/x-delete-16.png',
                 handler: function (grid, rowIndex, colIndex, item, e, record) {
                 modifyFlag = true;
                 if(record.get('process') != 'C') {
                 record.set('process','D');
                 deleteConditionList.push(record.data);
                 }
                 record.destroy();
                 }
                 }]
                 }*/
            ],
            listeners: {
                scope: this,
                'celldblclick': function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    if(cellIndex === 6){
                    	renderProvCndPopup(record.data);
                    }else{
                        if(!isReadOnly){
                            var cntnt = $('.apply-rule-info-wrap .apply-rule').val() + "#"+record.get('providedConditionSequenceNumber');
                            $('.apply-rule-info-wrap .apply-rule').val(cntnt);
                        }
                        // OHS20180416 추가 - 계산영역처럼 적용
                        tokens.push({
                            type: TokenType.CONDITION,
                            value: "#"+record.get('providedConditionSequenceNumber')
                        });
                    }
                },
                'viewready': function(_this, eOpts){

                    if (treeItem) {

                        // 서비스 제공조건 일때
                        if(treeItem.ruleApplyTargetDistinctionCode && treeItem.ruleApplyTargetDistinctionCode == '03') {
                            detailRequestParam = treeItem;
                        }else{
                            detailRequestParam = {
                                conditionGroupTemplateCode: treeItem.conditionGroupTemplateCode,
                                conditionGroupCode: treeItem.conditionGroupCode,
                                conditionCode: treeItem.conditionCode ? treeItem.conditionCode : treeItem.id,
                                tntInstId: selectedTreeItem.tntInstId
                            };

                            if($('.bnft-prov-cnd-search').val()) {
                                detailRequestParam.applyStartDate = $('.bnft-prov-cnd-search').val(); // 조회기준일 추가
                            }
                            else {
                                delete detailRequestParam.applyStartDate;
                            }
                        }
                        detailRequestParam.cndDscd = '01';
                        // 우대금리 제공조건 그리드 조회
                        PFRequest.get('/benefit/queryListBenefitProvideCnd.json', detailRequestParam, {
                            success: function(data) {
                                grid.setData(data);
                                deleteConditionList = [];
                            },
                            bxmHeader: {
                                application: 'PF_Factory',
                                service: 'BenefitProvideCndService',
                                operation: 'queryListBenefitProvideCnd'
                            }
                        });
                    }



                }
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                        beforeedit:function(e, editor){
                            //if(editor.record.get('process') != 'C'
                            //    && editor.field == 'applyStartDate') {
                            //    return false;
                            //}

                            if(editor.record.field == 'isAdditionalInfoExist'){
                                return false;
                            }
                        },
                        afteredit: function(e, editor){
                            if(editor.originalValue !=  editor.value && editor.record.get('process') != 'C'){
                                editor.record.set('process', 'U');
                            }
                        }
                    }
                })
            ]
        } // gridcinfig end
    }); // 그리드 end

    return grid;
}


// 우대금리제공조건그리드 저장
function saveBenefitProvideCnd(projectId, ruleApplyTargetDistinctionCode, grid){

    if(!grid){
        grid = cndType3Grid;
    }

    var formData = {};

    // 제공조건그리드
    if (grid) {
        formData.projectId = projectId;

        if(ruleApplyTargetDistinctionCode == '03'){
            formData.pdInfoDscd = pdInfoDscd_Service;
            formData.productCode = selectedTreeItem.id;
        } else {
            formData.conditionGroupTemplateCode = detailRequestParam.conditionGroupTemplateCode;
            formData.conditionGroupCode = detailRequestParam.conditionGroupCode;
            formData.conditionCode = detailRequestParam.conditionCode;
        }
        formData.productBenefitProvidedConditonList = grid.getAllData().concat(deleteConditionList);

        formData.productBenefitProvidedConditonList.forEach(function(el) {

            if(ruleApplyTargetDistinctionCode == '03'){
                formData.pdInfoDscd = pdInfoDscd_Service;
                formData.pdCode = selectedTreeItem.id;     // pdCode
            } else {
                el.conditionGroupTemplateCode = detailRequestParam.conditionGroupTemplateCode;
                el.conditionGroupCode = detailRequestParam.conditionGroupCode;
                el.conditionCode = detailRequestParam.conditionCode;
            }

            if (el.productBenefitProvidedListConditionList == '') {
                delete el.productBenefitProvidedListConditionList;
            } else {
                delete el.maxValue;
                delete el.minValue;
            }

            delete el.conditionDetailTypeCode;
            delete el.y;
        });

        PFRequest.post('/benefit/saveBenefitProvideCnd.json', formData, {
            success: function(responseData) {
                if (responseData) {
                    PFComponent.showMessage(bxMsg('workSuccess'),  'success');
                    deleteConditionList = [];
                    modifyFlag = false; // resetFormModifed();

                    // 우대금리 제공조건 그리드 조회 (일련번호 바인딩을 위함)
                    delete formData.productBenefitProvidedConditonList;
                    formData.cndDscd = '01';

                    if($('.bnft-prov-cnd-search').val()) {
                        formData.applyStartDate = $('.bnft-prov-cnd-search').val();
                    }
                    else {
                        delete formData.applyStartDate;
                    }

                    PFRequest.get('/benefit/queryListBenefitProvideCnd.json', formData, {
                        success: function(data) {
                            grid.setData(data);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'BenefitProvideCndService',
                            operation: 'queryListBenefitProvideCnd'
                        }
                    });
                }
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'BenefitProvideCndService',
                operation: 'saveBenefitProvideCnd'
            }
        });
    }
}

// 우대금리 제공조건 추가버튼 클릭
onEvent('click', '.add-cnd3-int-btn', function(e) {
    var submitEvent = function(selectedData) {
        var data = selectedData[0];

        data['applyStartDate'] = PFUtil.getNextDate() + ' 00:00:00';
        data['applyEndDate'] = '9999-12-31 23:59:59';
        data['process'] = 'C';
        data['cndDscd'] = '01';

        data['providedConditionTypeCode'] = data.type;
        data['providedConditionCode'] = data.code;
        data['providedConditionName'] = data.name;
        data['providedConditionStatusCode'] = '01';  // 조건의 active 상태가 아님 -> 제공조건의 상태는 최소 01.수정가능으로 서비스에서 생성함.
        data['providedConditionDetailTypeCode'] = data.conditionDetailTypeCode;
        data['provideCndAdditionalInfoDetailList'] = [];

        delete data['content'];
        delete data['code'];
        delete data['name'];
        delete data['type'];
        delete data['typeNm'];
        delete data['conditionDetailTypeCode'];

        renderProvCndPopup(data);
        modifyFlag = true;
    };

    renderCndPopup(submitEvent, true);
});

// 우대금리 제공조건 저장 버튼 클릭
onEvent('click', '.bnft-prov-cnd-save-btn', function(e) {
    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    };

    saveBenefitProvideCnd(projectId);        // 제공조건 그리드 저장
});


onEvent('click', '.pf-cp-condition-expend-view-btn', function(e) {

    var $button = $('.pf-cp-condition-info .pf-cp-type3-panel .pf-cp-condition-expend-view-btn');
    $button.toggleClass('cnd-info-expand');

    if($button.hasClass('cnd-info-expand')){
        //$(e.currentTarget).text('▲');
        $(e.currentTarget).html('<i class="bw-icon i-25 i-close3"></i>');
        $('.pf-cp-condition-info .pf-cp-type3-panel .pf-panel-body').show();
    }else{
        //$(e.currentTarget).text('▼');
        $(e.currentTarget).html('<i class="bw-icon i-25 i-open3"></i>');
        $('.pf-cp-condition-info .pf-cp-type3-panel .pf-panel-body').hide();
    }

});


// 조건기본
function renderConditionPage(detailRequestParam) {
    var $conditionInfoWrap = $el.find('.pf-cp-condition-info');

    //reset title obj, arr of complex grid
    titleDataObj = {};
    titleDataArr = [];
    cndValueType1Grid = null;

    var tplMap = {
        '01': conditionType1Tpl,
        '02': conditionType2Tpl,
        '03': conditionType3Tpl,
        '04': conditionType4_1Tpl
    };

    PFRequest.get('/product_condition/getProductConditionDetail.json', detailRequestParam, {
        success: function(data) {
        	modifyFlag = false;
            selectedCondition = data;
            complexGridDeleteData = [];

            data.conditionTypeCodeNm = codeMapObj['ProductConditionTypeCode'][data.conditionTypeCode];
            data.statusNm = codeMapObj['ProductStatusCode'][data.status];

            if(data.conditionTypeCode == '03'
                && detailRequestParam.applyMethod && detailRequestParam.applyMethod == '02'){

                $conditionInfoWrap.append(tplMap[data.conditionTypeCode](data));

                $conditionInfoWrap.find('.pf-cp-type3-panel .pf-panel-title').text(bxMsg('DPS0121_5String1'));
                $conditionInfoWrap.find('.pf-cp-type3-panel .pf-panel-footer').remove();                    // 하단버튼 제거
                $conditionInfoWrap.find('.pf-cp-type3-panel .pf-cp-condition-view-history-btn').remove();   // history 버튼 제거

                var button = '<button class="bw-btn bx-btn-small pf-cp-condition-expend-view-btn">'+
                    '<i class="bw-icon i-25 i-open3"></i>'
                    +'</button>';
                $conditionInfoWrap.find('.pf-cp-type3-panel .header-btn-group').append(button);
                $conditionInfoWrap.find('.pf-cp-type3-panel .pf-panel-body').hide();

                renderConditionType3_2GridPage(detailRequestParam);
            }else{
                $conditionInfoWrap.html(tplMap[data.conditionTypeCode](data));
            }

            if(writeYn != 'Y'
                || (selectedTreeItem && selectedTreeItem.writeYn == 'N')
                || (detailRequestParam && detailRequestParam.writeYn == 'N')){
                $('.write-btn').hide();
            }

            // 조건값결정레벨이 '02.계약'이 아니면 필수협상조건 체크박스 disable
            if (data.conditionAgreeLevel != '02') {
                $conditionInfoWrap.find('.isMandatory').prop('disabled', true);
            }

            // 환출대상여부 체크박스
            if(data.returnFeeYn == 'Y'){
            	$conditionInfoWrap.find('.returnFeeYn').prop('checked', true);
            }

            // 4개의 타입에 모두 들어가는 공통 콤보박스
            renderComboBox('ProductConditionAgreeLevelCode', $('.ProductConditionAgreeLevelCode'), data.conditionAgreeLevel);
            renderComboBox('ProductConditionClassifyCode', $('.ProductConditionClassifyCode'), data.conditionClassifyCode);
            renderComboBox('TierAplyCalcnWayCodeCode', $('.TierAplyCalcnWayCodeCode'), data.layerCalcType);

            var intRtAplyBaseDayCd = data.intRtAplyBaseDayCd ? data.intRtAplyBaseDayCd : (data.conditionAgreeLevel=='01'? '03' : '01');
            renderComboBox('IntRtAplyBaseDayCode', $('.intRtAplyBaseDayCd'), intRtAplyBaseDayCd);

            // 자상품사용가능여부 체크박스
            $conditionInfoWrap.find('.childYn-check').prop('checked', data.isChildPdUsable);

            // 조건군코드 없을경우 이력조회 버튼 disabled
            if(!data.conditionGroupCode) {
                $conditionInfoWrap.find('.pf-cp-condition-view-history-btn').prop('disabled', true);
            } else {
                $conditionInfoWrap.find('.pf-cp-condition-view-history-btn').prop('disabled', false);
            }

            if (data.isValueNull) {
                $conditionInfoWrap.find('.isValueNull').prop('checked', true);
                $conditionInfoWrap.find('.isMandatory').prop('disabled', true);
                $conditionInfoWrap.find('.isValueNull-hidden').addClass('active');
                $conditionInfoWrap.find('.condition-value-wrap').removeClass('active');
                $conditionInfoWrap.find('.isEnableComplexCondition-disabled').prop('disabled', true).val('01');
                $conditionInfoWrap.find('.conditionClassifyCode01-disabled').prop('disabled', true).val('');

            } else {
                if (data.isMandatory) {
                    $conditionInfoWrap.find('.isMandatory').prop('checked', true);
                }

                // 우대금리적용시점코드 (01:신규일, 02:만기일)
                if(data.conditionDetailTypeCode == '11'){   // 우대금리인 경우
                    renderComboBox('PreferentialInterestRateApplyBaseDayCode', $('.prfIntRtAplyTmCd'), data.prfIntRtAplyTmCd ? data.prfIntRtAplyTmCd : '01');
                }else {// 우대금리가 아닌경우
                    $('.prfIntRt-hidden').addClass('active');   // 숨김
                    renderComboBox('PreferentialInterestRateApplyBaseDayCode', $('.prfIntRtAplyTmCd'), data.prfIntRtAplyTmCd ? data.prfIntRtAplyTmCd : '');
                }

                //화면에 있는 필드는 아니지만 isEnableComplexCondition에 의해 심플/복합 콤보박스를 disabled or not 해야함
                if (!data.isEnableComplexCondition && data.conditionClassifyCode != '02') {
                    $conditionInfoWrap.find('.isEnableComplexCondition-disabled').prop('disabled', true);
                }

                //심플조건일 때
                if (data.conditionClassifyCode == '01') {
                    $conditionInfoWrap.find('.condition-value').addClass('active');

                    //01: 목록형, 02: 범위형, 03:금리형 , 04:수수료형
                    switch (data.conditionTypeCode) {
                        case '01' :
                            renderCndValueType1Grid(data.listConditionValue.defineValues);

                            //심플에서 복합 조건으로 변경할 경우, 복합 그리드의 조건값 필드를 더블클릭 할 때 필요한 정보를 저장해 둠
                            YforNewColumn = data.listConditionValue;
                            break;
                        case '02' :
                            if (data.rangeConditionValue) {
                            	
                            	// OHS 20180503 추가 - 소숫점일치를 위해 추가
                            	// 금액
                            	if(data.conditionDetailTypeCode == '01') {
                                    data.rangeConditionValue.minValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.minValue, 19, 2);
                                    data.rangeConditionValue.maxValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.maxValue, 19, 2);
                                    data.rangeConditionValue.increaseValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.increaseValue, 19, 2);
                                    data.rangeConditionValue.defalueValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.defalueValue, 19, 2);
                            	}
                            	// 율
                            	else if(data.conditionDetailTypeCode == '05' || data.conditionDetailTypeCode == '08') {
                                    data.rangeConditionValue.minValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.minValue, 3, 6);
                                    data.rangeConditionValue.maxValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.maxValue, 3, 6);
                                    data.rangeConditionValue.increaseValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.increaseValue, 3, 6);
                                    data.rangeConditionValue.defalueValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.defalueValue, 3, 6);
                            	}
                            	else {
                                    data.rangeConditionValue.minValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.minValue, 8, 0);
                                    data.rangeConditionValue.maxValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.maxValue, 8, 0);
                                    data.rangeConditionValue.increaseValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.increaseValue, 8, 0);
                                    data.rangeConditionValue.defalueValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.defalueValue, 8, 0);
                            	}
                            	
                            	/** OHS 20180503 - 주석처리, 위로직으로 대체
                                if(data.conditionDetailTypeCode == '01' ||
                                    data.conditionDetailTypeCode == '05' ||
                                    data.conditionDetailTypeCode == '08') {
                                    data.rangeConditionValue.minValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.minValue, 19, 2);
                                    data.rangeConditionValue.maxValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.maxValue, 19, 2);
                                    data.rangeConditionValue.increaseValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.increaseValue, 19, 2);
                                    data.rangeConditionValue.defalueValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.defalueValue, 19, 2);
                                }
                                else{
                                    data.rangeConditionValue.minValue = data.rangeConditionValue.minValue.substring(0,data.rangeConditionValue.minValue.indexOf('.'));
                                    data.rangeConditionValue.maxValue = data.rangeConditionValue.maxValue.substring(0, data.rangeConditionValue.maxValue.indexOf('.'));
                                    data.rangeConditionValue.increaseValue = data.rangeConditionValue.increaseValue.substring(0,data.rangeConditionValue.increaseValue.indexOf('.'));
                                    data.rangeConditionValue.defalueValue = data.rangeConditionValue.defalueValue.substring(0,data.rangeConditionValue.defalueValue.indexOf('.'));
                                }
                                */
                            }

                            $conditionInfoWrap.find('.condition-value').html(cndValueType2Tpl(data.rangeConditionValue));

                            if (data.rangeConditionValue.isSystemMaxValue == true) {
                            	// 2017.02.15 OHS 수정 - 시스템최대치가 true이면 기존값을 없애고 disabled처리에서 값을 세팅해줌.
                            	//$conditionInfoWrap.find('.maxValue').prop('disabled', true).val('');
                                $conditionInfoWrap.find('.maxValue').prop('disabled', true);
                                $conditionInfoWrap.find('.isSystemMaxValue').find('input').prop('checked', true);
                            }

                            //단일 값이면 기본값만 보여줘야 함
                            if (data.rangeConditionValue.isSingleValue) {
                                $conditionInfoWrap.find('.isSingleValue-hide').hide();
                            } else {
                                $conditionInfoWrap.find('.isNotSingleValue-hide').hide();
                            }

                            //conditionDetailTypeCode이 01이면 통화코드, 그외는 측정단위(05만 측정단위의 콤보가 달라짐)
                            if (data.conditionDetailTypeCode == '01') {
                                $conditionInfoWrap.find('.detail-type01-hide').hide();
                                renderComboBox('CurrencyCode', $('.CurrencyCode:visible'), data.rangeConditionValue.currencyValue);
                            } else {
                                $conditionInfoWrap.find('.detail-except-type01-hide').hide();

                                //05일 때 최대치 선택 못하게 하며 측정단위도 달라여쟈함
                                if (data.conditionDetailTypeCode == '05') {
                                    // isSystemMaxValue Control
                                	// OHS 2017.02.16 수정 - element를 찾지못해 수정
                                    //$conditionInfoWrap.find('input').find('.isSystemMaxValue').prop('checked', false).prop('disabled', true);
                                	$conditionInfoWrap.find('.isSystemMaxValue').prop('checked', false).find('input').prop('disabled', true);
                                    renderComboBox('ProductMeasurementUnitCodeR', $('.ProductMeasurementUnitCode:visible'), data.rangeConditionValue.productMeasurementUnit);
                                }
                                // 02.날짜
                                else if(selectedCondition.conditionDetailTypeCode == '02'){
                                    renderComboBox('ProductMeasurementUnitCodeD', $('.ProductMeasurementUnitCode:visible'), data.rangeConditionValue.productMeasurementUnit);
                                }
                                // 03.주기
                                else if(selectedCondition.conditionDetailTypeCode == '03'){
                                    renderComboBox('ProductMeasurementUnitCodeF', $('.ProductMeasurementUnitCode:visible'), data.rangeConditionValue.productMeasurementUnit);
                                }
                                // 04.숫자
                                else if(selectedCondition.conditionDetailTypeCode == '04'){
                                    renderComboBox('ProductMeasurementUnitCodeN', $('.ProductMeasurementUnitCode:visible'), data.rangeConditionValue.productMeasurementUnit);
                                }else {
                                    renderComboBox('ProductMeasurementUnitCode', $('.ProductMeasurementUnitCode:visible'), data.rangeConditionValue.productMeasurementUnit);
                                }
                            }

                            //  입력포멧 설정
                            setRangeFormat($conditionInfoWrap.find('.cnd-value-type2-table'), data.conditionDetailTypeCode);

                            break;

                        // 금리형
                        case '03' :

                            if (data.interestConditionValue) {
                                data.interestConditionValue.minInterestRate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.minInterestRate, 3, 6);
                                data.interestConditionValue.maxInterestRate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.maxInterestRate, 3, 6);
                                data.interestConditionValue.applyMinInterestRate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.applyMinInterestRate, 3, 6);
                                data.interestConditionValue.applyMaxInterestRate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.applyMaxInterestRate, 3, 6);
                                data.interestConditionValue.rate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.rate, 3, 6);
                                data.interestConditionValue.minSprdRt = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.minSprdRt, 3, 6); // 스프레드율 최소
                                data.interestConditionValue.maxSprdRt = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.maxSprdRt, 3, 6); // 스프레드율 최대
                            }
                            $conditionInfoWrap.find('.condition-value').html(cndValueType3Tpl(data.interestConditionValue));

                            // 금리적용방식코드
                            renderComboBox('ProductConditionInterestApplyTypeCode', $('.ProductConditionInterestApplyTypeCode'), (data.interestConditionValue.rateApplyWayCode ? data.interestConditionValue.rateApplyWayCode : '')); // 금리적용방식코드

                            // 우수리자리수/적용방법
                            $('.frctnAplyCnt').val(data.interestConditionValue.frctnAplyCnt);												// 우수리적용자리수
                            renderComboBox('FrctnAplyWayCode', $('.FrctnAplyWayCode'), data.interestConditionValue.frctnAplyWayCd, true); 	// 우수리적용방법코드

                            var $cndValueType3Wrap = $conditionInfoWrap.find('.cnd-value-type3');
                            renderCndValueType3Tab($conditionInfoWrap, data);

                            // 우수리적용방법 별도 처리 ( 빈값일경우 '' 세팅 )
                            if(!data.interestConditionValue.frctnAplyWayCd) {
                                $cndValueType3Wrap.find('.FrctnAplyWayCode').val('');
                            }

                            // 조건값결정레벨이 상품(01)이면
                            if(selectedCondition.conditionAgreeLevel == '01'){
                                // 스프레스율 1개만 입력
                                $cndValueType3Wrap.find('.maxSprdRt').hide();
                            }else{
                                $cndValueType3Wrap.find('.maxSprdRt').show();
                            }

                            if(detailRequestParam.applyMethod && detailRequestParam.applyMethod == '02'){
                                $conditionInfoWrap.find('.pf-cp-type3-panel .pf-panel-body *').prop('disabled', true);
                            }

                            // 조건값적용방법코드 -> 코드 바인딩은 복합인 경우에도 되어야 함. 아래 공통부분에서 바인딩
                            //renderComboBox('ConditionValueApplyWayCodeCode', $('.ConditionValueApplyWayCodeCode'), data.conditionValueAplyWayCode);   // 조건값적용방법코드
                            if (data.conditionValueAplyWayCode == '02') {
	                            $el.find('.pf-cp-type3-panel .ProductConditionClassifyCode').prop('disabled', true).val('01').change();    // 조건구조: 일반조건
	                            $el.find('.pf-cp-type3-panel .cndValApplyWayCode-hidden').hide();    // 자상품사용가능여부
	                            $el.find('.pf-cp-type3-panel .cnd-val-apply-way').hide();
	                            $el.find('.pf-cp-type3-panel .additional-info-wrap').hide();
	                            $el.find('.pf-cp-type3-panel .cnd-value-type3-info-tab').hide();
                            }

                            break;
                        case '04' :
                            if (data.feeConditionValue) {
                                // 금액정보 19, 2
                                // 징수수수료 정보
                                // 최소금액
                                data.feeConditionValue.bottom = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.bottom, 19, 2);
                                // 최대금액
                                data.feeConditionValue.top = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.top, 19, 2);

                                // 금액정보
                                // 최소수수료
                                data.feeConditionValue.minFixFeeAmt = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.minFixFeeAmt, 19, 2);
                                // 최대수수료
                                data.feeConditionValue.maxFixFeeAmt = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.maxFixFeeAmt, 19, 2);
                                // 기본수수료
                                data.feeConditionValue.fixed = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.fixed, 19, 2);
                                // 증가단위금액
                                data.feeConditionValue.fixFeeIncrsAmt = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.fixFeeIncrsAmt, 19, 2);


                                // 율 정보 4,6
                                // 최소
                                data.feeConditionValue.minRt = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.minRt, 3, 6);
                                // 최대
                                data.feeConditionValue.maxRt = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.maxRt, 3, 6);
                                // 기본
                                data.feeConditionValue.rate = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.rate, 3, 6);
                                // 단위증가
                                data.feeConditionValue.unitIncrsRt = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.unitIncrsRt, 3, 6);
                            }

                            $conditionInfoWrap.find('.condition-value').html(cndValueType4Tpl(data.feeConditionValue));
                            $conditionInfoWrap.find('.condition-value').find('.cnd-value-04-amount-table').addClass('active');

                            if (data.feeConditionValue.isSystemMaxValue == true) {
                            	// OHS 2017.02.16 수정 - 시스템최대치 값세팅
                                //$conditionInfoWrap.find('.topValue').prop('disabled', true).val('');
                            	$conditionInfoWrap.find('.topValue').prop('disabled', true);
                                $conditionInfoWrap.find('.isSystemMaxValue').find('input').prop('checked', true);
                            }
                            renderComboBox('ProductMeasurementUnitCodeR', $('.RtMsurUnitCd'), data.feeConditionValue.rtMsurUnitCd ? data.feeConditionValue.rtMsurUnitCd : '');
                            renderComboBox('FeeCalculateBasicTypeCode', $('.FeeCalculateBasicTypeCode'), data.feeConditionValue ? data.feeConditionValue.calcBasic : '');   // 징수기준

                            // 율정보 체크
                            if (data.feeConditionValue.feeTpCd == '01') {
                                $conditionInfoWrap.find('.charge-radio-rate').prop('checked', true);
                                $conditionInfoWrap.find('.cnd-value-04-amount-table').removeClass('active');
                                $conditionInfoWrap.find('.cnd-value-04-rate-table').addClass('active');
                            }
                            // 금액정보 체크
                            else {
                                $conditionInfoWrap.find('.charge-radio-amount').prop('checked', true);
                                $conditionInfoWrap.find('.cnd-value-04-amount-table').addClass('active');
                                $conditionInfoWrap.find('.cnd-value-04-rate-table').removeClass('active');
                            }
                            break;
                    }

                    $conditionInfoWrap.find('.conditionClassifyCode01-disabled').prop('disabled', true).val('');

                // 복합조건일 때
                } else if (data.conditionClassifyCode == '02') {
                    $el.find('.tierHistoryExistYn-check-value').val(data.tierHistoryExistYn);
                    if(data.tierHistoryExistYn === 'Y'){
                        $el.find('.tierHistoryExistYn-check').prop('checked', true)
                    }

                    $el.find('.complex-grid-wrap').addClass('active');

                    stepCndCd = data.stepConditionCode;

                    renderComplexGrid(data.complexConditionTitleInfoList, data.complexConditionMatrix, data.tierHistoryExistYn);
                    //renderComboBox('IntRtAplyBaseDayCode', $('.intRtAplyBaseDayCd'), data.intRtAplyBaseDayCd);
                    $conditionInfoWrap.find('.TierAplyCalcnWayCodeCode-th').find('.red-notice').text('*');
                }

                // 금리형
                if (data.conditionTypeCode == '03') {
                    renderComboBox('IntTermCalculateTpyeCode', $('.IntTermCalculateTpyeCode'), data.termCalcType);
                    renderComboBox('IntDailyRateYearCoefficientCode', $('.IntDailyRateYearCoefficientCode'), data.dayRateYearlyCoefficient);
                    renderComboBox('InterestMethodCode', $('.InterestMethodCode'), data.calcInterestMethod);

                    // 조건값적용방법코드 바인딩 (심플, 복합 모두 바인딩 되어야 함)
                    renderComboBox('ConditionValueApplyWayCodeCode', $('.ConditionValueApplyWayCodeCode'),
                    		data.conditionValueAplyWayCode != null && data.conditionValueAplyWayCode != '' ? data.conditionValueAplyWayCode : '01');   // 조건값적용방법코드

                    // 조건값적용방법코드에 따른 설정 -> 위 심플일때 금리형에서 처리
                    //if (data.conditionValueAplyWayCode === '02') { //조건값적용방법코드가 03이면, 아래 3줄 disbled
                    // 	$conditionInfoWrap.find('.calcBasic-conditionValueAplyWayCode03-disabled').prop('disabled', true).val('');
                    // 	$conditionInfoWrap.find('.conditionClassifyCode01-conditionValueAplyWayCode03-disabled').prop('disabled', true).val('');
                    // 	$conditionInfoWrap.find('.layerCalcType01-conditionValueAplyWayCode03-disabled').prop('disabled', true).val('');

                    // 	$conditionInfoWrap.find('.condition-value-wrap').removeClass('active');
                    //}
                }

                // 수수료형
                if (data.conditionTypeCode == '04') {

                	conditionApplyTargetDscd = '02';	//제공조건 조건적용대상구분코드 수수료로 설정

                    renderComboBox('FeeCalculateBasicTypeCode', $('.FeeCalculateBasicTypeCode'), data.calcBasic);
                    renderComboBox('CurrencyCode', $('.CurrencyCode'), data.currencyValue);
                    renderComboBox('FeeSettleTypeCode', $('.FeeSettleTypeCode'), data.settleType, true);
                    renderComboBox('LevyFrqDscd', $('.LevyFrqDscd'), data.levyFrqDscd);             // 징수주기추가.

                    if (data.layerCalcType == '01') { //01일 때만 관련조건정보 활성화
                    } else {
                        $conditionInfoWrap.find('.layerCalcType01-conditionValueAplyWayCode03-disabled').prop('disabled', true).val('');
                    }

                    if (data.conditionClassifyCode === '01') {
                        $conditionInfoWrap.find('.conditionClassifyCode01-disabled').prop('disabled', true).val('');
                        $conditionInfoWrap.find('.layerCalcType01-conditionValueAplyWayCode03-disabled').prop('disabled', true).val('');
                    }
                }
            }

            /*if ($('.pf-cp-condition .pf-cp-condition-list-wrap').find('.pfui-tree-item-selected').hasClass('node_disable')) {
             $('.pf-cp-condition-view-history-btn').prop('disabled', true);
             $('.pf-cp-product-condition-delete-btn').prop('disabled', true);
             }*/


            PFUtil.getDatePicker(true);
            PFUtil.getAllDatePicker(true, $('.complex-grid-wrap'));

            if(data.tierHistoryExistYn == 'Y'){
            	$('.tierHistoryExistYn-check').prop('disabled', true);

            }

            if(detailRequestParam.baseDt){
            	$('.base-date').val(detailRequestParam.baseDt);
            }

            fnSetCndAtrb();

            // 수수료와 우대금리
            if( detailRequestParam.applyMethod != '02'){         // 연결인 경우는 tree 정보를 변경하면 안됨.

                var thisNode = conditionTreeStore.findNode(data.id);
                var index = $('.pf-cp-condition .pf-cp-condition-list-wrap').find('.pfui-tree-item-selected').index();

                //if((data.conditionTypeCode == '04' || (data.conditionTypeCode == '03' && data.conditionDetailTypeCode == '11'))) {

                // 값이 없으면
                if (data.isValueNull && !$('.pf-cp-condition .pf-cp-condition-list-wrap').find('.pfui-tree-item-selected').hasClass('node_disable')) {
                    thisNode.custom = 'node_disable';
                    $($('.pf-cp-condition .pf-cp-condition-list-wrap ul li')[index]).addClass('node_disable');

                    if(thisNode.children.length > 0) {
                        thisNode.children[0].custom = 'node_disable';
                        $($('.pf-cp-condition .pf-cp-condition-list-wrap ul li')[index - 1]).addClass('node_disable');
                        if(thisNode.children.length == 2){
                        	thisNode.children[1].custom = 'node_disable';
                            $($('.pf-cp-condition .pf-cp-condition-list-wrap ul li')[index + 1]).addClass('node_disable');
                        }
                    }

                }
                // 값이 있으면
                else if (!data.isValueNull) {
                    if ($('.pf-cp-condition .pf-cp-condition-list-wrap').find('.pfui-tree-item-selected').hasClass('node_disable')) {
                        thisNode.custom = '';
                        $($('.pf-cp-condition .pf-cp-condition-list-wrap ul li')[index]).removeClass('node_disable');

                        if(thisNode.children.length > 0) {
                            thisNode.children[0].custom = '';
                            $($('.pf-cp-condition .pf-cp-condition-list-wrap ul li')[index - 1]).removeClass('node_disable');

                            if(thisNode.children.length == 2){
	                            thisNode.children[1].custom = '';
	                            $($('.pf-cp-condition .pf-cp-condition-list-wrap ul li')[index + 1]).removeClass('node_disable');
                            }
                        }
                    }

                    thisNode.conditionGroupCode = $('.conditionGroupCode').val() ? $('.conditionGroupCode').val() : data.conditionGroupCode;
                    if(thisNode.children.length > 0) {
                    	// OHS 2017.02.13 수정 - 상품조건일때만 수수료, 할인조건 트리에 조건그룹코드 세팅
                    	// 상품
                    	if(pdInfoDscd == pdInfoDscd_Product) {
	                        thisNode.children[0].conditionGroupCode = thisNode.conditionGroupCode;
	                        thisNode.children[1].conditionGroupCode = thisNode.conditionGroupCode;
                    	}
                    	// 서비스 등
                    	else {
                    		thisNode.children[0].conditionGroupCode = thisNode.conditionGroupCode;
                    	}

                    }
                }

                conditionTreeStore.update(thisNode);
            }

            modifyFlag = false;
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdCndService',
            operation: 'queryPdCndDetail'
        }
    });
}


// RangeCondition ProductMeasurementUnitCode Combo Assemly
function renderComboBoxByRate(code, selector, value, defaultSetting) {
    var options = [];

    if (defaultSetting) {
        var $defaultOption = $('<option>');

        $defaultOption.val('');
        $defaultOption.text('');

        options.push($defaultOption);
    }

    $.each(codeMapObj[code], function(key, value){
        var $option = $('<option>');

        if(key == '11' || key == '12') {
            $option.val(key);
            $option.text(value);

            options.push($option);
        }
    });

    selector.html(options);

    if (value) {
        selector.val(value);
    }
}

function renderHistoryComplexGrid(title, data) {
    var fields = ['y'],
        columns = [{text: bxMsg('DPS0128String1'), width: 50, sortable: false, align:'center',
          renderer: function(value, metaData, record) {
            var index = record.store.data.keys.indexOf(record.internalId);
            var prev = record.store.data.items.slice(0, index).map(function(v) { return v.data });
            var start = prev.reduce(function(n, cnd) {
              return n + Object.keys(cnd).reduce(function(m, key) {
                if (key.endsWith(".code")) {
                  m *= cnd[key].length;
                }
                return m;
              }, 1);
            }, 1);
            var len = Object.keys(record.data).reduce(function(m, key) {
              if (key.endsWith(".code")) {
                m *= record.data[key].length;
              }
              return m;
            }, 1);
            return start + (len > 1 ? "~" + (start + len - 1) : "");
          }
        }],
        gridData = [];

    $('.pf-cp-condition-history-popup .history-complex-grid').empty();

    data.forEach(function(el) {
        var tempObj = {};

        el.x.forEach(function(xEl){
            var columnId = xEl.id;

            tempObj[columnId] = xEl;

        });

        //condition value column setting from here
        tempObj['y'] = el.y;

        gridData.push(tempObj);
    });

    title.forEach(function(el) {
        el.defineValues = el.defineValues || [];
        var conditionCode = el.titleConditionCode;
        var tempObj = {};
        tempObj['titleConditionCode'] = conditionCode;
        tempObj['titleConditionName'] = el.titleConditionName;
        tempObj['titleConditionTypeCode'] = el.titleConditionTypeCode;

        if (el.titleConditionTypeCode == '01') {
            tempObj['defineValues'] = el.defineValues;

            var defineValuesObj = {};

            el.defineValues.forEach(function(el) {
                defineValuesObj[el.code] = el.name;
            });

            fields.push(conditionCode, conditionCode+'.defineValues', {
                name: conditionCode+'.code',
                style: 'text-align:center',
                convert: function(newValue, record) {
                    /*var name ;

                    if (record.get(conditionCode)) {
                        record.get(conditionCode)['listConditionValue']['defineValues'].forEach(function(el) {
                            if (el.isSelected) {
                                name =  el.name;
                            }
                        })
                    } else {
                        name = '';
                    }


                    return name;*/

                    var code;
                    if (!Array.isArray(newValue)) newValue = [newValue];
                    if (record.get(conditionCode)) {
                        code = record.get(conditionCode).listConditionValue.defineValues.reduce(function(l, v) {
                            if (v.isSelected) {
                              l.push(v.code);
                            }
                            return l;
                        }, []);
                    } else {
                        code = [''];
                    }

                    return code.length > 0 ? code : [''];
                }
            });

            columns.push({header: el.titleConditionName + '('+ el.titleConditionCode +')',
                width: 170, dataIndex: conditionCode+'.code',
                style: 'text-align:center',
                renderer: function(value, metadata, record) {
                  //return value;

                  var map = value.reduce(function(map, v) {
                    map[v] = true;
                    return map;
                  }, {});

                  var consecutive = false;
                  var resultList = [];
                  var temp = [];
                  var defineValues = el.defineValues;
                  defineValues.forEach(function(v, i) {
                    if (map[v.code]) {
                      temp.push(v);
                      consecutive = true;
                    }

                    if (i === defineValues.length - 1 || (!map[v.code] && consecutive)) {
                      if (temp.length === 1) {
                        resultList.push(Ext.String.format("[{0}]{1}", temp[0].code, temp[0].name));
                      } else if (temp.length > 1) {
                        var left = temp.shift();
                        var right = temp.pop();
                        resultList.push(Ext.String.format("[{0}]{1}~[{2}]{3}", left.code, left.name, right.code, right.name));
                      }
                      temp = [];
                      consecutive = false;
                    }
                  });

                  return resultList.join(", ");
                }});

        } else if (el.titleConditionTypeCode == '02') {
            tempObj['productMeasurementUnit'] = el.productMeasurementUnit;
            tempObj['currencyValue'] = el.currencyValue;
            tempObj['rangeBlwUnderType'] = el.rangeBlwUnderType;
            tempObj['titleConditionDetailTypeCode'] = el.titleConditionDetailTypeCode;

            fields.push(conditionCode, {
                name: conditionCode + '.minValue',
                style: 'text-align:center',
                convert: function (newValue, record) {
                    var minValue;

                    if (record.get(conditionCode)['rangeConditionValue']) {
                        minValue = record.get(conditionCode)['rangeConditionValue']['minValue'];
                    } else {
                        minValue = '';
                    }

                    return minValue;
                }
            }, {
                name: conditionCode + '.maxValue',
                convert: function (newValue, record) {
                    var maxValue;
                    if (record.get(conditionCode)['rangeConditionValue']) {
                        maxValue = record.get(conditionCode)['rangeConditionValue']['maxValue'];
                    } else {
                        maxValue = '';
                    }

                    return maxValue;
                }
            });

            var rangeHeader;

            if(el.titleConditionDetailTypeCode == '01') {
                rangeHeader = '<div align=center>' + el.titleConditionName + '(' + el.titleConditionCode + ')<br/>' + codeMapObj['CurrencyCode'][el.currencyValue] + '<br/>' + codeMapObj['RangeBlwUnderTypeCode'][el.rangeBlwUnderType] + '</div>';
            } else {
                rangeHeader = '<div align=center>' + el.titleConditionName + '(' + el.titleConditionCode + ')<br/>' + codeMapObj['ProductMeasurementUnitCode'][el.productMeasurementUnit] + '<br/>' + codeMapObj['RangeBlwUnderTypeCode'][el.rangeBlwUnderType] + '</div>';
            }

            columns.push({
                header: rangeHeader,
                columns: [{
                    text: bxMsg('DPS0121_1String1'),
                    width: 120,
                    dataIndex: conditionCode + '.minValue'
                }, {
                    text: bxMsg('DPS0121_1String2'),
                    width: 120,
                    dataIndex: conditionCode + '.maxValue'
                }]
            });
        }

    });

    var flex = 0,
        width = 0;

    if(title.length >= 3) {
        flex = 0;
        width = 250;
    } else {
        flex = 1;
        width = 0;
    }

    columns.push({text: bxMsg('DPS0129String4'), flex : flex, width : width, renderer: function(value, p, record) {
        var yTitle1 = '',
            yVal1 = '',
            yTitle2 = '',
            yVal2 = '',
            line1 = '',
            line2 = '',
            line3 = '';

        var conditionTypeCode = selectedCondition.conditionTypeCode;
        var extFormat;

        switch (conditionTypeCode) {
            case '01':
                if (record.get('y')) {
                    record.get('y')['defineValues'].forEach(function(el) {
                        if (el.isSelected) {
                            yTitle1 = yTitle1 + el.name + '，';
                        }
                    });
                }

                if(yTitle1 != '' && yTitle1.length > 0) {
                    yTitle1 = yTitle1.substring(0, yTitle1.length - 1);
                }

                extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}</p>', yTitle1);
                break;
            case '02' :
                if (record.get('y')) {
                    var defaultString = (record.get('y').defalueValue) ? record.get('y').defalueValue : '0.00',
                        minString = (record.get('y').minValue) ? record.get('y').minValue : '0.00',
                        maxString, baseString;

                    if (record.get('y').isSystemMaxValue) {
                        maxString = bxMsg('systemMax');
                    } else {
                        maxString = (record.get('y').maxValue) ? record.get('y').maxValue : '0.00';
                        baseString = (record.get('y').defalueValue) ? record.get('y').defalueValue : '0.00';
                    }

                    if (selectedCondition.isSingleValue) {
                        yTitle1 = bxMsg('DPM100TabSring1') + ' : ';
                        yVal1 = defaultString;
                    } else {
                        yTitle1 = bxMsg('DPS0129Unit1String1') + ' : ';
                        yVal1 = minString + '~' + maxString + '(' + baseString  + ')';
                    }

                    if (selectedCondition.conditionDetailTypeCode == '01') {
                        yTitle2 = bxMsg('currencyCode') + ' : ';
                        yVal2 = codeMapObj['CurrencyCode'][record.get('y').currencyValue];
                    } else {
                        yTitle2 = bxMsg('DPS0129Unit1String2') + ' : ';
                        yVal2 = codeMapObj['ProductMeasurementUnitCode'][record.get('y').productMeasurementUnit];
                    }
                }

                extFormat = Ext.String.format('<p class="ext-condition-value-column">{0} {1} </br> {2} {3}</p>', yTitle1, yVal1, yTitle2, yVal2);
                break;
            case '03' :
                if (record.get('y')) {
                    var minInString,
                        maxInString, base,
                        refPdCd, refPdNm,
                        refCndCd, refCndNm;

                    var rateApplyWay,           // 금리적용방식
                        intVal,                 // 금리값(최대~최소(기본))
                        sprdVal,                // 기준금리 (+,-,*,/) 스프레드율
                        rateSegmentType,        // 변동적용방식
                        varIntRtCyclCalcnBase,  // 변동주기산정기준
                        refPdVal;               // 타상품금리연동 정보


                    // 금리적용방식
                    rateApplyWay = codeMapObj['ProductConditionInterestApplyTypeCode'][record.get('y').rateApplyWayCode];

                    // 금리값
                    minInString = (record.get('y').minInterestRate) ? record.get('y').minInterestRate : '';
                    maxInString = (record.get('y').maxInterestRate) ? record.get('y').maxInterestRate : '';
                    base = (record.get('y').rate) ? record.get('y').rate : '';
                    intVal = bxMsg('DPS0129Unit1String1') + ' : ' + minInString + '~' + maxInString + '(' + base + ')';

                    // 금리데이터유형코드 = 기준금리연동
                    if(record.get('y').type == '02') {

                        var sprdAplyFormula;

                        switch (record.get('y').sprdAplyFormulaCd) {
                            case '01' :
                                sprdAplyFormula = '+';
                                break;
                            case '02' :
                                sprdAplyFormula = '-';
                                break;
                            case '03' :
                                sprdAplyFormula = '*';
                                break;
                            case '04' :
                                sprdAplyFormula = '/';
                                break;
                        }
                        sprdVal = codeMapObj['BaseIntRtKndCode'][record.get('y').baseRateCode] + (sprdAplyFormula ? sprdAplyFormula + record.get('y').minSprdRt : '');
                    }
                    // 금리데이터유형코드 = 타상품금리연동
                    else if(record.get('y').type == '03') {
                        yTitle1 = bxMsg('DPS0121_34String1') + ' : ';
                        refPdCd = (record.get('y').refPdCd) ? record.get('y').refPdCd : '';
                        refPdNm = (record.get('y').refPdNm) ? record.get('y').refPdNm : '';

                        yTitle2 = bxMsg('DPS0121_34String2') + ' : ';
                        refCndCd = (record.get('y').refCndCd) ? '[' + record.get('y').refCndCd  + ']' : '';
                        refCndNm = (record.get('y').refCndNm) ? ' / ' +record.get('y').refCndNm : '';

                        var refRefCndCd = (record.get('y').refRefCndCd) ? ' / ' + record.get('y').refRefCndNm : '';
                        var refCndVal = (record.get('y').refCndVal) ? record.get('y').refCndVal : '';
                        var refCndMsurUtCd = (record.get('y').refCndMsurUtCd) ? '(' + codeMapObj['ProductMeasurementUnitCode'][record.get('y').refCndMsurUtCd] + ')' : '';

                        refPdVal = refPdNm + refCndNm + refRefCndCd + ' '+ refCndVal + refCndMsurUtCd;
                    }

                    // 금리적용방식코드 != 고정적용
                    if(record.get('y').rateApplyWayCode != '01') {
                        // 변동적용방식
                        if (record.get('y').rateSegmentType == '01') {
                            // 신규이후변동적용  : 변동적용방식
                            rateSegmentType = codeMapObj['InterestSegmentTypeCode'][record.get('y').rateSegmentType];
                        }
                        else if (record.get('y').rateSegmentType == '02' || record.get('y').rateSegmentType == '03') {
                            // 일주기변동, 월주기변동 : (주기수)변동적용방식
                            rateSegmentType = '(' + record.get('y').varIntRtAplyCyclCnt + ')'
                                + codeMapObj['InterestSegmentTypeCode'][record.get('y').rateSegmentType];
                        }
                        else if (record.get('y').rateSegmentType == '04') {
                            // 약정주기변동적용 : 변동적용방식([조건코드]조건명)
                            rateSegmentType = codeMapObj['InterestSegmentTypeCode'][record.get('y').rateSegmentType]
                                + '([' + record.get('y').varFrqRefCndCd + ']' + record.get('y').varFrqRefCndNm + ')';
                        }

                        // 변동주기산정기준
                        varIntRtCyclCalcnBase = codeMapObj['VarIntRtCyclCalcnBaseCode'][record.get('y').varIntRtCyclCalcnBaseCd];
                    }

                    // 금리적용방식코드 = 고정
                    if (record.get('y').rateApplyWayCode == '01') {
                        // 금리값
                        if(record.get('y').type == '01'){
                            line1 = rateApplyWay + ', ' + intVal;
                        }
                        // 기준금리연동
                        else if(record.get('y').type == '02'){
                            line1 = rateApplyWay + ', ' + sprdVal;
                        }
                        // 타상품금리연동
                        else if(record.get('y').type == '03'){
                            line1 = rateApplyWay + ', ' + refPdVal;
                        }
                    }
                    // 금리적용방식코드 = 변동
                    else if (record.get('y').rateApplyWayCode == '02') {

                        line1 = rateApplyWay + ', ' + rateSegmentType + ', ' + varIntRtCyclCalcnBase;

                        // 금리값
                        if(record.get('y').type == '01'){
                            line2 = intVal;
                        }
                        // 기준금리연동
                        else if(record.get('y').type == '02'){
                            line2 = sprdVal;
                        }
                        // 타상품금리연동
                        else if(record.get('y').type == '03'){
                            line2 = refPdVal;
                        }
                    }
                    // 금리적용방식코드 = 고정후변동
                    else if (record.get('y').rateApplyWayCode == '03') {
                        // 기준금리연동
                        if(record.get('y').type == '02'){
                            line1 = rateApplyWay + ', '
                                + bxMsg('FixedDuration') + ':' + record.get('y').frstFixIrtAplyTrmCnt + codeMapObj['FrstFixIRtAplyTrmDscd'][record.get('y').frstFixIrtAplyTrmDscd] + ', ' // 고정기간
                                + intVal;
                            line2 = rateSegmentType + ', ' + varIntRtCyclCalcnBase + ', ' + sprdVal;
                        }
                        // 타상품금리연동
                        else if(record.get('y').type == '03'){
                            line1 = rateApplyWay + ', ' + refPdVal;
                            line2 = rateSegmentType + ', ' + varIntRtCyclCalcnBase;
                        }
                    }
                    // 금리적용방식코드 = 타상품참조
                    else if (record.get('y').rateApplyWayCode == '04') {
                        line1 = rateApplyWay + ', ' + refPdVal;
                    }

                    if(record.get('y').type != '01'){
                        line3 = bxMsg('DPS0121_31String3') + ':' +  record.get('y').applyMinInterestRate + '/' + record.get('y').applyMaxInterestRate;
                    }
                }

                if(line2.length > 0){
                    line2 = '</br>'+line2;
                }
                if(line3.length > 0){
                    line3 = '</br>'+line3;
                }

                extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}{1}{2}</p>', line1, line2, line3);
                break;
            case '04' :
                if (record.get('y')) {
                    var minFixFeeAmt, // 최소수수료
                        maxFixFeeAmt,  // 최대수수료
                        fixed, // 기본수수료
                        minRt, // 최소수수료율
                        maxRt, // 최대수수료율
                        rate; // 기본율
                    var bottom,
                        top,
                        calcBasic;  // 징수기준

                    calcBasic = codeMapObj['FeeCalculateBasicTypeCode'][(record.get('y').calcBasic)];

                    // 금액정보
                    if (record.get('y').feeTpCd == '02') {
                        minFixFeeAmt = (record.get('y').minFixFeeAmt) ? record.get('y').minFixFeeAmt : '0.00';
                        maxFixFeeAmt = (record.get('y').maxFixFeeAmt) ? record.get('y').maxFixFeeAmt : '0.00';
                        fixed = (record.get('y').fixed) ? record.get('y').fixed : '0.00';

                        // 최소~최대(기본)
                        //line1 = calcBasic + ', ' + bxMsg('DPS0129Unit1String1') + ' : ' + minFixFeeAmt + '~' + maxFixFeeAmt + '(' + fixed + '), ' + record.get('y').currencyValue;

                        // OHS 2017.02.16 수정 - 통화코드는 저장하지않는값으로 불필요데이터임.
                        //line1 = calcBasic + ', ' + bxMsg('DPS0129Unit1String1') + ' : ' + minFixFeeAmt + '~' + maxFixFeeAmt + '(' + fixed + '), ' + $('.CurrencyCode').val();
                        line1 = calcBasic + ', ' + bxMsg('DPS0129Unit1String1') + ' : ' + minFixFeeAmt + '~' + maxFixFeeAmt + '(' + fixed + ')';
                        line2 = '';
                    }
                    // 율정보
                    else if (record.get('y').feeTpCd == '01') {
                        minRt = (record.get('y').minRt) ? record.get('y').minRt : '0.000000';
                        maxRt = (record.get('y').maxRt) ? record.get('y').maxRt : '0.000000';
                        rate = (record.get('y').rate) ? record.get('y').rate : '0.000000';
                        bottom = (record.get('y').bottom) ? record.get('y').bottom : '0.00';
                        top = (record.get('y').top) ? record.get('y').top : '0.00';

                        // 최소~최대(기본)
                        line1 = calcBasic  + ', ' + bxMsg('DPS0129Unit1String1') + ' : ' + minRt + '~' + maxRt + '(' + rate + ') (%)';

                        // OHS 2017.02.16 수정 - 통화코드는 저장하지않는값으로 불필요데이터임.
                        //line2 = bxMsg('DPS0129Unit1String1') + ' : ' + bottom + '~' + top + ', ' + record.get('y').currencyValue;
                        line2 = bxMsg('DPS0129Unit1String1') + ' : ' + bottom + '~' + top;
                    }
                }

                extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}</br> {1}</p>', line1, line2);
                break;
        }

        return extFormat;
    }
    });

    var historyCndValComplexGrid = PFComponent.makeExtJSGrid({
        fields: fields,
        gridConfig: {
            renderTo: '.history-complex-grid',
            columns: columns,
            listeners: {
                scope: this,
                'celldblclick': function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    if ($(td).find('p').attr('class') === 'ext-condition-value-column') {
                        var conditionTypeCode = selectedCondition.conditionTypeCode,
                            button = [{text:bxMsg('Z_OK'), elCls:'button button-primary', handler:function(){
                                this.close();
                            }}];

                        switch (conditionTypeCode) {
                            case '01':
                                renderConditionValue1Popup(record.get('y'), rowIndex, button);
                                break;
                            case '02' :
                                renderConditionValue2Popup(record.get('y'), rowIndex, button);
                                break;

                            case '03' :
                                renderConditionValue3Popup(record.get('y'), rowIndex, button);
                                break;
                            case '04' :
                                renderConditionValue4Popup(record.get('y'), rowIndex, button);
                                break;
                        }
                    }
                }
            }
        }

    });

    gridData = aggregate(gridData);
    historyCndValComplexGrid.setData(gridData);
}

// 복합조건 컬럼 check
function checkComplexColumn(prop){
	if(prop == 'applyStart' || prop == 'applyEnd' || prop == 'process'
		|| prop == 'conditionStatusCode' || prop == 'complexStructureId'
		|| prop == 'tierNumber'){
		return true;
	}
	else{
		return false;
	}
}

// 복합조건 그리드 render
function renderComplexGrid(title, data, tierHistoryExistYn, gridDataYn) {
	// 복합조건의 일자(이력)은 서비스(혜택)에서만 사용한다.
    var fields = [ 'y'
                 , {
                	 name:'applyStart', convert: function(newValue, record){
                      	 if(newValue){
	                		 record.get('y')['applyStart'] = newValue;
	                	 }
	                	 return record.get('y')['applyStart'];
                	 }
                 }
                 , {
                	 name:'applyEnd', convert: function(newValue, record){
	                	 if(newValue){
	                		 record.get('y')['applyEnd'] = newValue;
	                	 }
	                	 return record.get('y')['applyEnd']
                	 }
                 }
                 , 'process'
                 , 'complexStructureId'
                 , 'tierNumber'
                 ,{
                	 name:'conditionStatusCode', convert: function(newValue, record){
         		 		if(newValue){
        		 			record.get('y')['conditionStatusCode'] = newValue;
        		 		}
        		 		return record.get('y')['conditionStatusCode'];
                	 }
                 }],
        columns = [{text: bxMsg('DPS0128String1'), width: 47, sortable: false, style : 'text-align:center',
          renderer: function(value, metaData, record) {
            var index = record.store.data.keys.indexOf(record.internalId);
            var prev = record.store.data.items.slice(0, index).map(function(v) { return v.data });
            var start = prev.reduce(function(n, cnd) {
              return n + Object.keys(cnd).reduce(function(m, key) {
                if (key.endsWith(".code")) {
                  m *= cnd[key].length;
                }
                return m;
              }, 1);
            }, 1);
            var len = Object.keys(record.data).reduce(function(m, key) {
              if (key.endsWith(".code")) {
                m *= record.data[key].length;
              }
              return m;
            }, 1);
            return start + (len > 1 ? "~" + (start + len - 1) : "");
          }
          }],
        gridData = [];

    //reset title obj, arr of complex grid
    $el.find('.complex-grid').empty();
    titleDataArr = [];
    titleDataObj = {};

    if(gridDataYn && gridDataYn == 'Y'){
    	gridData = data;
    }else{
	    data.forEach(function(el) {
	        var tempObj = {};

	        tempObj['complexStructureId'] = el.complexStructureId;
	        tempObj['tierNumber'] = el.tierNumber;

	        el.x.forEach(function(xEl){
	            var columnId = xEl.id;

	            tempObj[columnId] = xEl;
	        });

	        YforNewColumn = tempObj['y'] = el.y;

	        gridData.push(tempObj);
	    });
    }

    //title(즉, 컬럼 수) 만큼 필드와 컬럼 세팅 해줘야 함
    title.forEach(function(el) {
        el.defineValues = el.defineValues || [];
        var conditionCode = el.titleConditionCode,
            tempObj = {},
            conditionDetailCode = el.titleConditionDetailTypeCode;

        tempObj['titleConditionCode'] = conditionCode;
        tempObj['titleConditionName'] = el.titleConditionName;
        tempObj['titleConditionTypeCode'] = el.titleConditionTypeCode;

        // 기준조건여부
        if( stepCndCd && conditionCode == stepCndCd){
            tempObj['baseConditionYn'] = true;
        }else{
            tempObj['baseConditionYn'] = false;
        }

        //목록형
        if (el.titleConditionTypeCode == '01') {
            tempObj['defineValues'] = el.defineValues;

            var defineValuesObj = {};


            if(conditionCode=='L0149'){
                // 금액일때(통화코드) 명이 아닌 코드로 표시한다.
                el.defineValues.forEach(function(el) {
                    defineValuesObj[el.code] = el.code;
                });
            }else{
                el.defineValues.forEach(function(el) {
                    defineValuesObj[el.code] = el.name;
                });
            }

            fields.push(conditionCode, conditionCode+'.defineValues', {
                name: conditionCode+'.code',
                style: 'text-align:center',
                convert: function(newValue, record) {
                    var code ;

                    /*if (newValue) {
                        if (!Array.isArray(newValue)) newValue = [newValue];
                        code = newValue;

                        record.get(conditionCode)['listConditionValue'] = {};
                        record.get(conditionCode)['listConditionValue']['defineValues'] = [];
                        record.get(conditionCode)['listConditionValue']['defineValues'].push({
                            code: newValue,
                            name: defineValuesObj[newValue],
                            isSelected: true
                        });

                    } else if (record.get(conditionCode)['listConditionValue']) {
                        record.get(conditionCode)['listConditionValue']['defineValues'].forEach(function(el) {
                            if (el.isSelected) {
                                code =  el.code;
                            }
                        })
                    } else {
                        code = '';
                    }*/

                    if (newValue) {
                        if (!Array.isArray(newValue)) newValue = [newValue];
                        // 순서 조정
                        var map = newValue.reduce(function(m, v) {
                          m[v] = true;
                          return m;
                        }, {});
                        code = el.defineValues.reduce(function(l, v) {
                          if (map[v.code])
                            l.push(v.code);
                          return l;
                        }, []);

                        record.get(conditionCode).listConditionValue = {
                          defineValues: newValue.map(function(v) {
                            return {
                              code: v,
                              name: defineValuesObj[v],
                              isSelected: true
                            };
                          })
                        };

                    } else if (record.get(conditionCode).listConditionValue) {
                        code = record.get(conditionCode).listConditionValue.defineValues.reduce(function(l, v) {
                            if (v.isSelected) {
                              l.push(v.code);
                            }
                            return l;
                        }, []);
                    } else {
                        code = [''];
                    }

                    return code.length > 0 ? code : [''];
                }
            });

            if(!parent.g_cndAtrb['cndAtrb-07'] || parent.g_cndAtrb['cndAtrb-07'] == 'Y') {
                columns.push({
                    header: el.titleConditionName + '(' + el.titleConditionCode + ')',
                    width: 170, dataIndex: conditionCode + '.code',
                    style: 'text-align:center',
                    renderer: function (value, metadata, record) {
                        var map = value.reduce(function(map, v) {
                          map[v] = true;
                          return map;
                        }, {});

                        var consecutive = false;
                        var resultList = [];
                        var temp = [];
                        var defineValues = el.defineValues;
                        defineValues.forEach(function(v, i) {
                          if (map[v.code]) {
                            temp.push(v);
                            consecutive = true;
                          }

                          if (i === defineValues.length - 1 || (!map[v.code] && consecutive)) {
                            if (temp.length === 1) {
                              resultList.push(Ext.String.format("[{0}]{1}", temp[0].code, temp[0].name));
                            } else if (temp.length > 1) {
                              var left = temp.shift();
                              var right = temp.pop();
                              resultList.push(Ext.String.format("[{0}]{1}~[{2}]{3}", left.code, left.name, right.code, right.name));
                            }
                            temp = [];
                            consecutive = false;
                          }
                        });

                        return resultList.join(", ");
                        //return defineValuesObj[value];
                    },
                    editor: {
                        xtype: 'combo',
                        typeAhead: true,
                        triggerAction: 'all',
                        displayField: conditionCode == 'L0149' ? 'code' : 'name',
                        valueField: 'code',
                        emptyText: bxMsg("select"),
                        multiSelect: true,
                        listConfig: {
                          getInnerTpl: function() {
                            return "[{code}] {name}";
                          }
                        },
                        editable: false,
                        store: new Ext.data.Store({
                            fields: ['code', 'name'],
                            data: el['defineValues']
                        })
                    }
                });
            }else{
                columns.push({
                    header: el.titleConditionName + '(' + el.titleConditionCode + ')',
                    width: 170, dataIndex: conditionCode + '.code',
                    style: 'text-align:center',
                    renderer: function (value, metadata, record) {
                        var map = value.reduce(function(map, v) {
                          map[v] = true;
                          return map;
                        }, {});

                        var consecutive = false;
                        var resultList = [];
                        var temp = [];
                        var defineValues = el.defineValues;
                        defineValues.forEach(function(v, i) {
                          if (map[v.code]) {
                            temp.push(v);
                            consecutive = true;
                          }

                          if (i === defineValues.length - 1 || (!map[v.code] && consecutive)) {
                            if (temp.length === 1) {
                              resultList.push(Ext.String.format("[{0}]{1}", temp[0].code, temp[0].name));
                            } else if (temp.length > 1) {
                              var left = temp.shift();
                              var right = temp.pop();
                              resultList.push(Ext.String.format("[{0}]{1}~[{2}]{3}", left.code, left.name, right.code, right.name));
                            }
                            temp = [];
                            consecutive = false;
                          }
                        });

                        return resultList.join(", ");
                        //return defineValuesObj[value];
                    },
                });
            }
        } else if (el.titleConditionTypeCode == '02') { //범위형
            tempObj['productMeasurementUnit'] = el.productMeasurementUnit;
            tempObj['currencyValue'] = el.currencyValue;
            tempObj['rangeBlwUnderType'] = el.rangeBlwUnderType;
            tempObj['titleConditionDetailTypeCode'] = el.titleConditionDetailTypeCode;
            fields.push(conditionCode, {
                name: conditionCode+'.minValue',
                style: 'text-align:center',
                convert: function(newValue, record) {
                    var minValue ;
                    var isNegativeNumber = newValue.substr(0,1) == '-';

                    if (newValue) {
                        if (!record.get(conditionCode)['rangeConditionValue']) {
                            record.get(conditionCode)['rangeConditionValue'] = {};
                        }

                        if(isNotNegativeRangeType(conditionDetailCode)){
                            minValue = PFValidation.gridFloatCheckRenderer(newValue, 19, 0, true);
                        }else{
                            minValue = PFValidation.gridFloatCheckRendererForRangeType(newValue, 19, 2, true);
                        }


                        record.get(conditionCode)['rangeConditionValue']['minValue'] = minValue;
                    }  else if (record.get(conditionCode)['rangeConditionValue']) {
                        //minValue = record.get(conditionCode)['rangeConditionValue']['minValue'];

                    	// OHS 20180423 - 자릿수통일
                        if(isNotNegativeRangeType(conditionDetailCode)){
                            minValue = PFValidation.gridFloatCheckRenderer(record.get(conditionCode)['rangeConditionValue']['minValue'], 19, 0, true);
                        }else{
                            minValue = PFValidation.gridFloatCheckRendererForRangeType(record.get(conditionCode)['rangeConditionValue']['minValue'], 19, 2, true);
                        }

                    } else {
                        if (!record.get(conditionCode)['rangeConditionValue']) {
                            record.get(conditionCode)['rangeConditionValue'] = {};
                        }

                        minValue = '0.00';

                        record.get(conditionCode)['rangeConditionValue']['minValue'] = minValue;
                    }

                    if(isNegativeNumber && parseFloat(newValue) == 0){
                        minValue = parseFloat('-' + minValue) + '';
                        if(minValue == '-0'){
                            minValue = '0.00';
                        }
                    }

                    if(newValue){
                        var resultValue = parseFloat(newValue)+''
                        if(resultValue.split('.')[0] == 'NaN'){
                            minValue = '0.00'
                        }
                    }

                    return minValue;
                }
            }, {
                name: conditionCode+'.maxValue',
                style: 'text-align:center',
                convert: function(newValue, record) {
                    var maxValue ;
                    var isNegativeNumber = newValue.substr(0,1) == '-';

                    if (newValue) {
                        if (!record.get(conditionCode)['rangeConditionValue']) {
                            record.get(conditionCode)['rangeConditionValue'] = {};
                        }

                        if(isNotNegativeRangeType(conditionDetailCode)){
                            maxValue = PFValidation.gridFloatCheckRenderer(newValue, 19, 0, true);
                        }else{
                            maxValue = PFValidation.gridFloatCheckRendererForRangeType(newValue, 19, 2, true);
                        }

                        record.get(conditionCode)['rangeConditionValue']['maxValue'] = maxValue;
                    }  else if (record.get(conditionCode)['rangeConditionValue']['maxValue']){
                        //maxValue = record.get(conditionCode)['rangeConditionValue']['maxValue'];

                    	// OHS 20180423 - 자릿수통일
                        if(isNotNegativeRangeType(conditionDetailCode)){
                        	maxValue = PFValidation.gridFloatCheckRenderer(record.get(conditionCode)['rangeConditionValue']['maxValue'], 19, 0, true);
                        }else{
                        	maxValue = PFValidation.gridFloatCheckRendererForRangeType(record.get(conditionCode)['rangeConditionValue']['maxValue'], 19, 2, true);
                        }

                    } else {
                        if (!record.get(conditionCode)['rangeConditionValue']) {
                            record.get(conditionCode)['rangeConditionValue'] = {};
                        }

                        maxValue = '0.00';

                        record.get(conditionCode)['rangeConditionValue']['maxValue'] = maxValue;
                    }

                    if(isNegativeNumber && parseFloat(newValue) == 0){
                        maxValue = parseFloat('-' + maxValue) + '';
                        if(maxValue == '-0'){
                            maxValue = '0.00';
                        }
                    }

                    if(newValue){
                        var resultValue = parseFloat(newValue)+''
                        if(resultValue.split('.')[0] == 'NaN'){
                            maxValue = '0.00'
                        }
                    }

                    return maxValue;
                }
            });

            var rangeHeader;

            if(el.titleConditionDetailTypeCode == '01') {
                rangeHeader = '<div align=center>' + el.titleConditionName + '(' + el.titleConditionCode + ')<br/>' + codeMapObj['CurrencyCode'][el.currencyValue] + '<br/>' + codeMapObj['RangeBlwUnderTypeCode'][el.rangeBlwUnderType] + '</div>';
            } else {
                rangeHeader = '<div align=center>' + el.titleConditionName + '(' + el.titleConditionCode + ')<br/>' + codeMapObj['ProductMeasurementUnitCode'][el.productMeasurementUnit] + '<br/>' + codeMapObj['RangeBlwUnderTypeCode'][el.rangeBlwUnderType] + '</div>';
            }

            if(!parent.g_cndAtrb['cndAtrb-07'] || parent.g_cndAtrb['cndAtrb-07'] == 'Y') {
                columns.push({
                    header: rangeHeader,
                    columns: [{
                        text: bxMsg('DPS0121_1String1'),
                        width: 160,
                        dataIndex: conditionCode + '.minValue',
                        style: 'text-align:center',
                        renderer: function (value, metadata, record) {
                            if (parseFloat(value) > parseFloat(record.get(conditionCode + '.maxValue'))) {
                                GridMinMaxCheck = false;
                            } else {
                                GridMinMaxCheck = true;
                            }

                            if (isNotNegativeRangeType(conditionDetailCode)) {
                                return PFValidation.gridFloatCheckRenderer(value, 19, 0, true);
                            } else {
                                return PFValidation.gridFloatCheckRendererForRangeType(value, 19, 2);
                            }
                        },
                        editor: {
                            xtype: 'textfield',
                            allowBlank: false,
                            selectOnFocus: true,
                            listeners: {
                                'render': function (cmp) {
                                    cmp.getEl()
                                        .on('keydown', function (e) {
                                            if (isNotNegativeRangeType(conditionDetailCode)) {
                                                PFValidation.gridFloatCheckKeydown(e, 19, 0);
                                            } else {
                                                PFValidation.gridFloatCheckKeydownForRangeType(e, 19, 2);
                                            }

                                        })
                                        .on('keyup', function (e) {
                                            if (isNotNegativeRangeType(conditionDetailCode)) {
                                                PFValidation.gridFloatCheckKeyup(e, 19, 0);
                                            } else {
                                                PFValidation.gridFloatCheckKeyupForRangeType(e, 19, 2);
                                            }
                                        })
                                }
                            }
                        }
                    }, {
                        text: bxMsg('DPS0121_1String2'),
                        width: 160,
                        dataIndex: conditionCode + '.maxValue',
                        style: 'text-align:center',
                        renderer: function (value, metadata, record) {
                            if (isNotNegativeRangeType(conditionDetailCode)) {
                                return PFValidation.gridFloatCheckRenderer(value, 19, 0, true);
                            } else {
                                return PFValidation.gridFloatCheckRendererForRangeType(value, 19, 2);
                            }
                        },
                        editor: {
                            xtype: 'textfield',
                            allowBlank: false,
                            selectOnFocus: true,
                            listeners: {
                                'render': function (cmp) {
                                    cmp.getEl()
                                        .on('keydown', function (e) {
                                            if (isNotNegativeRangeType(conditionDetailCode)) {
                                                PFValidation.gridFloatCheckKeydown(e, 19, 0);
                                            } else {
                                                PFValidation.gridFloatCheckKeydownForRangeType(e, 19, 2);
                                            }
                                        })
                                        .on('keyup', function (e) {
                                            if (isNotNegativeRangeType(conditionDetailCode)) {
                                                PFValidation.gridFloatCheckKeyup(e, 19, 0);
                                            } else {
                                                PFValidation.gridFloatCheckKeyupForRangeType(e, 19, 2);
                                            }
                                        })
                                }
                            }
                        }
                    }]
                });
            }else{
                columns.push({
                    header: rangeHeader,
                    columns: [{
                        text: bxMsg('DPS0121_1String1'),
                        width: 160,
                        dataIndex: conditionCode + '.minValue',
                        style: 'text-align:center',
                        renderer: function (value, metadata, record) {
                            if (parseFloat(value) > parseFloat(record.get(conditionCode + '.maxValue'))) {
                                GridMinMaxCheck = false;
                            } else {
                                GridMinMaxCheck = true;
                            }

                            if (isNotNegativeRangeType(conditionDetailCode)) {
                                return PFValidation.gridFloatCheckRenderer(value, 19, 0, true);
                            } else {
                                return PFValidation.gridFloatCheckRendererForRangeType(value, 19, 2);
                            }
                        }
                    }, {
                        text: bxMsg('DPS0121_1String2'),
                        width: 160,
                        dataIndex: conditionCode + '.maxValue',
                        style: 'text-align:center',
                        renderer: function (value, metadata, record) {
                            if (isNotNegativeRangeType(conditionDetailCode)) {
                                return PFValidation.gridFloatCheckRenderer(value, 19, 0, true);
                            } else {
                                return PFValidation.gridFloatCheckRendererForRangeType(value, 19, 2);
                            }
                        }
                    }]
                });
            }
        }

        titleDataArr.push(tempObj);
    });

    titleDataArr.forEach(function(el) {
        titleDataObj[el.titleConditionCode] = el;
    });

    var flex = 0,
        width = 0;

    if(titleDataArr.length > 1 && (!tierHistoryExistYn || tierHistoryExistYn != 'Y')) {
        flex = 0;
        width = 295;
    } else {
        flex = 1;
        width = 0;
    }

    if(tierHistoryExistYn && tierHistoryExistYn == 'Y'){
    	// 적용시작일자
    	columns.push({text: bxMsg('DPP0127String6'), width:130,dataIndex:'applyStart', align: 'center',
            editor: {
                allowBlank: false,
                listeners: {
                    focus: function(_this) {
                        var isNextDay = true;
                        if(getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                            isNextDay = false;
                        }
                        PFUtil.getGridDateTimePicker(_this, 'applyStart', cndValComplexGrid, selectedCellIndex, isNextDay);
                    },
                    blur: function(_this, e){
                        PFUtil.checkDate(e.target);
                    }
                }
            },
            listeners: {
                click: function() {
                    selectedCellIndex = $(arguments[1]).parent().index();
                }
            }
        });

        // 적용종료일자
    	columns.push({text: bxMsg('DPP0127String7'), width:130, dataIndex:'applyEnd', align: 'center'});

    	columns.push({
	        text : bxMsg('DPS0101String6'),
	        width : 100,
	        align: 'center',
	        dataIndex : 'conditionStatusCode',
	        renderer : function(value){
	            return codeMapObj['ProductStatusCode'][value];
	        }
	    });
    }

    // Header Style Center
    columns.push({text: bxMsg('DPS0129String4'), style: 'text-align:center', flex : flex, width : width,  renderer: function(value, p, record) {
        var yTitle1 = '',
            yVal1 = '',
            yTitle2 = '',
            yVal2 = '',
            line1 = '',
            line2 = '',
            line3 = '';

        var conditionTypeCode = selectedCondition.conditionTypeCode;
        var extFormat;

        switch (conditionTypeCode) {
            case '01':
                if (record.get('y')) {
                    if (!record.get('y')['defineValues']) record.get('y')['defineValues'] =
                      selectedCondition.defineValues ? selectedCondition.defineValues : selectedCondition.listConditionValue.defineValues;
                    record.get('y')['defineValues'].forEach(function(el) {
                        if (el.isSelected) {
                            yTitle1 = yTitle1 + el.name + '，';
                        }
                    });
                }

                if(yTitle1 != '' && yTitle1.length > 0) {
                    yTitle1 = yTitle1.substring(0, yTitle1.length - 1);
                }

                extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}</p>', yTitle1);
                break;
            case '02' :
                if (record.get('y')) {
                    var defaultString = (record.get('y').defalueValue) ? record.get('y').defalueValue : '0.00',
                        minString = (record.get('y').minValue) ? record.get('y').minValue : '0.00',
                        maxString, baseString;

                    if (record.get('y').isSystemMaxValue) {
                        maxString = bxMsg('systemMax');
                    } else {
                        maxString = (record.get('y').maxValue) ? record.get('y').maxValue : '0.00';
                    }
                    baseString = (record.get('y').defalueValue) ? record.get('y').defalueValue : '0.00';
                    
                	// OHS 20180503 추가 - 소숫점일치를 위해 추가
                	// 금액
                	if(selectedCondition.conditionDetailTypeCode == '01') {
                    	defaultString = PFValidation.gridFloatCheckRenderer(defaultString, 19, 2, true);
                    	minString = PFValidation.gridFloatCheckRenderer(minString, 19, 2, true);
                    	if(!record.get('y').isSystemMaxValue) {
                    		maxString = PFValidation.gridFloatCheckRenderer(maxString, 19, 2, true);
                    	}
                    	baseString = PFValidation.gridFloatCheckRenderer(baseString, 19, 2, true);
                	}
                	// 율
                	else if(selectedCondition.conditionDetailTypeCode == '05' || selectedCondition.conditionDetailTypeCode == '08') {
                    	defaultString = PFValidation.gridFloatCheckRenderer(defaultString, 3, 6, true);
                    	minString = PFValidation.gridFloatCheckRenderer(minString, 3, 6, true);
                    	if(!record.get('y').isSystemMaxValue) {
                    		maxString = PFValidation.gridFloatCheckRenderer(maxString, 3, 6, true);
                    	}
                    	baseString = PFValidation.gridFloatCheckRenderer(baseString, 3, 6, true);
                	}
                	else {
                    	defaultString = PFValidation.gridFloatCheckRenderer(defaultString, 8, 0, true);
                    	minString = PFValidation.gridFloatCheckRenderer(minString, 8, 0, true);
                    	if(!record.get('y').isSystemMaxValue) {
                    		maxString = PFValidation.gridFloatCheckRenderer(maxString, 8, 0, true);
                    	}
                    	baseString = PFValidation.gridFloatCheckRenderer(baseString, 8, 0, true);
                	}
                	
                    if (selectedCondition.isSingleValue) {
                        yTitle1 = bxMsg('DPM100TabSring1') + ' : ';
                        yVal1 = defaultString;
                    } else {
                        yTitle1 = bxMsg('DPS0129Unit1String1') + ' : ';
                        yVal1 = minString + '~' + maxString + '(' + baseString  + ')';
                    }

                    if (selectedCondition.conditionDetailTypeCode == '01') {
                        yTitle2 = bxMsg('currencyCode') + ' : ';

                        // OHS 20171205 수정 - currencyValue 값이 없을경우 조회순서가 가장 빠른 통화코드를 기본 세팅
                        if(record.get('y').currencyValue == undefined) {
                        	yVal2 = codeArrayObj['CurrencyCode'][0].name;
                        	record.data.y.currencyValue = codeArrayObj['CurrencyCode'][0].code;
                        }
                        else {
                        	yVal2 = codeMapObj['CurrencyCode'][record.get('y').currencyValue];
                        }
                    } else {
                        yTitle2 = bxMsg('DPS0129Unit1String2') + ' : ';

                        // OHS 20171205 수정 - ProductMeasurementUnitCode 값이 없을경우 조회순서가 가장 빠른 측정단위코드를 기본 세팅
                        if(record.get('y').productMeasurementUnit == undefined) {
                        	
                        	var mrUnitCodeName = '';
                        	// OHS 20180503 - 조건상세유형코드별로 세분화처리
                        	// 02 : 날짜
                        	if(selectedCondition.conditionDetailTypeCode == '02') {
                        		mrUnitCodeName = 'ProductMeasurementUnitCodeD'; 
                        	}
                        	// 03 : 주기
                        	else if(selectedCondition.conditionDetailTypeCode == '03') {
                        		mrUnitCodeName = 'ProductMeasurementUnitCodeF';
                        	}
                        	// 04 : 숫자
                        	else if(selectedCondition.conditionDetailTypeCode == '04') {
                        		mrUnitCodeName = 'ProductMeasurementUnitCodeN';
                        	}
                        	// 05 : 율
                        	else if(selectedCondition.conditionDetailTypeCode == '05') {
                        		mrUnitCodeName = 'ProductMeasurementUnitCodeR';
                        	}
                        	
                        	if(codeArrayObj[mrUnitCodeName]) {
                        		yVal2 = codeArrayObj[mrUnitCodeName][0].name;
                        		record.data.y.productMeasurementUnit = codeArrayObj[mrUnitCodeName][0].code;
                        	}
                        	// 공통코드에 등록이 안되어있는경우 오류방지를 위해 ProductMeasurementUnitCode 에서 값세팅
                        	else {
                        		yVal2 = codeArrayObj['ProductMeasurementUnitCode'][0].name;
                        		record.data.y.productMeasurementUnit = codeArrayObj['ProductMeasurementUnitCode'][0].code;
                        	}
                        }
                        else {
                        	yVal2 = codeMapObj['ProductMeasurementUnitCode'][record.get('y').productMeasurementUnit];
                        }
                    }
                }

                extFormat = Ext.String.format('<p class="ext-condition-value-column">{0} {1} </br> {2} {3}</p>', yTitle1, yVal1, yTitle2, yVal2);
                break;
            case '03' :
                if (record.get('y')) {
                    var minInString,
                        maxInString, base,
                        refPdCd, refPdNm,
                        refCndCd, refCndNm;

                    var rateApplyWay,           // 금리적용방식
                        intVal,                 // 금리값(최대~최소(기본))
                        sprdVal,                // 기준금리 (+,-,*,/) 스프레드율
                        rateSegmentType,        // 변동적용방식
                        varIntRtCyclCalcnBase,  // 변동주기산정기준
                        refPdVal;               // 타상품금리연동 정보


                    // 금리적용방식
                    rateApplyWay = codeMapObj['ProductConditionInterestApplyTypeCode'][record.get('y').rateApplyWayCode];

                    // 금리값
                    minInString = (record.get('y').minInterestRate) ? record.get('y').minInterestRate : '';
                    maxInString = (record.get('y').maxInterestRate) ? record.get('y').maxInterestRate : '';
                    base = (record.get('y').rate) ? record.get('y').rate : '';
                    
                    // OHS 20180629 추가 - 추후 조건유형별로 자릿수를 공통변수로 추출해야함.
                    minInString = PFValidation.gridFloatCheckRenderer(minInString, 3, 6);
                    maxInString = PFValidation.gridFloatCheckRenderer(maxInString, 3, 6);
                    base = PFValidation.gridFloatCheckRenderer(base, 3, 6);
                    
                    intVal = bxMsg('DPS0129Unit1String1') + ' : ' + minInString + '~' + maxInString + '(' + base + ')';

                    // 금리데이터유형코드 = 기준금리연동
                    if(record.get('y').type == '02') {

                        var sprdAplyFormula;

                        switch (record.get('y').sprdAplyFormulaCd) {
                            case '01' :
                                sprdAplyFormula = '+';
                                break;
                            case '02' :
                                sprdAplyFormula = '-';
                                break;
                            case '03' :
                                sprdAplyFormula = '*';
                                break;
                            case '04' :
                                sprdAplyFormula = '/';
                                break;
                        }
                        sprdVal = codeMapObj['BaseIntRtKndCode'][record.get('y').baseRateCode] + (sprdAplyFormula ? sprdAplyFormula + record.get('y').minSprdRt : '');
                    }
                    // 금리데이터유형코드 = 타상품금리연동
                    else if(record.get('y').type == '03') {
                        yTitle1 = bxMsg('DPS0121_34String1') + ' : ';
                        refPdCd = (record.get('y').refPdCd) ? record.get('y').refPdCd : '';
                        refPdNm = (record.get('y').refPdNm) ? record.get('y').refPdNm : '';

                        yTitle2 = bxMsg('DPS0121_34String2') + ' : ';
                        refCndCd = (record.get('y').refCndCd) ? '[' + record.get('y').refCndCd  + ']' : '';
                        refCndNm = (record.get('y').refCndNm) ? ' / ' +record.get('y').refCndNm : '';

                        var refRefCndCd = (record.get('y').refRefCndCd) ? ' / ' + record.get('y').refRefCndNm : '';
                        var refCndVal = (record.get('y').refCndVal) ? record.get('y').refCndVal : '';
                        var refCndMsurUtCd = (record.get('y').refCndMsurUtCd) ? '(' + codeMapObj['ProductMeasurementUnitCode'][record.get('y').refCndMsurUtCd] + ')' : '';

                        refPdVal = refPdNm + refCndNm + refRefCndCd + ' '+ refCndVal + refCndMsurUtCd;
                    }

                    // 변동정보 적용방식, 변동주기산정기준
                    if(record.get('y').rateApplyWayCode == '02') {	// 금리적용방식코드 = 02.변동

                        // 변동적용방식
                        if (record.get('y').rateSegmentType == '01') {
                            // 신규이후변동적용  : 변동적용방식
                            rateSegmentType = codeMapObj['InterestSegmentTypeCode'][record.get('y').rateSegmentType];
                        }
                        else if (record.get('y').rateSegmentType == '02' || record.get('y').rateSegmentType == '03') {
                            // 일주기변동, 월주기변동 : (주기수)변동적용방식
                            rateSegmentType = '(' + record.get('y').varIntRtAplyCyclCnt + ')'
                                + codeMapObj['InterestSegmentTypeCode'][record.get('y').rateSegmentType];
                        }
                        else if (record.get('y').rateSegmentType == '04') {
                            // 약정주기변동적용 : 변동적용방식([조건코드]조건명)
                            rateSegmentType = codeMapObj['InterestSegmentTypeCode'][record.get('y').rateSegmentType]
                                + '([' + record.get('y').varFrqRefCndCd + ']' + record.get('y').varFrqRefCndNm + ')';
                        }

                        // 변동주기산정기준
                        varIntRtCyclCalcnBase = codeMapObj['VarIntRtCyclCalcnBaseCode'][record.get('y').varIntRtCyclCalcnBaseCd];

                    }else if(record.get('y').rateApplyWayCode == '03') {	// 금리적용방식코드 = 03.고정후변동

                    	// 변동적용방식
                        if (record.get('y').varIntCndValueVO.rateSegmentType == '01') {
                            // 신규이후변동적용  : 변동적용방식
                            rateSegmentType = codeMapObj['InterestSegmentTypeCode'][record.get('y').varIntCndValueVO.rateSegmentType];
                        }
                        else if (record.get('y').varIntCndValueVO.rateSegmentType == '02' || record.get('y').varIntCndValueVO.rateSegmentType == '03') {
                            // 일주기변동, 월주기변동 : (주기수)변동적용방식
                            rateSegmentType = '(' + record.get('y').varIntCndValueVO.varIntRtAplyCyclCnt + ')'
                                + codeMapObj['InterestSegmentTypeCode'][record.get('y').varIntCndValueVO.rateSegmentType];
                        }
                        else if (record.get('y').varIntCndValueVO.rateSegmentType == '04') {
                            // 약정주기변동적용 : 변동적용방식([조건코드]조건명)
                            rateSegmentType = codeMapObj['InterestSegmentTypeCode'][record.get('y').varIntCndValueVO.rateSegmentType]
                                + '([' + record.get('y').varIntCndValueVO.varFrqRefCndCd + ']' + record.get('y').varIntCndValueVO.varFrqRefCndNm + ')';
                        }

                        // 변동주기산정기준
                        varIntRtCyclCalcnBase = codeMapObj['VarIntRtCyclCalcnBaseCode'][record.get('y').varIntCndValueVO.varIntRtCyclCalcnBaseCd];
                    }

                    // 금리적용방식코드 = 고정
                    if (record.get('y').rateApplyWayCode == '01') {
                        // 금리값
                        if(record.get('y').type == '01'){
                            line1 = rateApplyWay + ', ' + intVal;
                        }
                        // 기준금리연동
                        else if(record.get('y').type == '02'){
                            line1 = rateApplyWay + ', ' + sprdVal;
                        }
                        // 타상품금리연동
                        else if(record.get('y').type == '03'){
                            line1 = rateApplyWay + ', ' + refPdVal;
                        }
                    }
                    // 금리적용방식코드 = 변동
                    else if (record.get('y').rateApplyWayCode == '02') {

                        line1 = rateApplyWay + ', ' + rateSegmentType + ', ' + varIntRtCyclCalcnBase;

                        // 금리값
                        if(record.get('y').type == '01'){
                            line2 = intVal;
                        }
                        // 기준금리연동
                        else if(record.get('y').type == '02'){
                            line2 = sprdVal;
                        }
                        // 타상품금리연동
                        else if(record.get('y').type == '03'){
                            line2 = refPdVal;
                        }
                    }
                    // 금리적용방식코드 = 고정후변동
                    else if (record.get('y').rateApplyWayCode == '03') {
                    	// 금리값
                        if(record.get('y').type == '01'){
                            line1 = rateApplyWay + ', ' + intVal;
                        }
                        // 기준금리연동
                        else if(record.get('y').type == '02'){
                            line1 = rateApplyWay + ', '
                                + bxMsg('FixedDuration') + ':' + record.get('y').frstFixIrtAplyTrmCnt + codeMapObj['FrstFixIRtAplyTrmDscd'][record.get('y').frstFixIrtAplyTrmDscd] + ', ' // 고정기간
                                + intVal;
                            line2 = rateSegmentType + ', ' + varIntRtCyclCalcnBase + ', ' + sprdVal;
                        }
                        // 타상품금리연동
                        else if(record.get('y').type == '03'){
                            line1 = rateApplyWay + ', ' + refPdVal;
                            line2 = rateSegmentType + ', ' + varIntRtCyclCalcnBase;
                        }
                    }
                    // 금리적용방식코드 = 타상품참조
                    else if (record.get('y').rateApplyWayCode == '04') {
                        line1 = rateApplyWay + ', ' + refPdVal;
                    }

                	// 고정이 아닐때
                    if(record.get('y').type && record.get('y').type != '01'){
                        line3 = bxMsg('DPS0121_31String3') + ':' +  record.get('y').applyMinInterestRate + '/' + record.get('y').applyMaxInterestRate;
                    }
                }

                if(line2.length > 0){
                    line2 = '</br>'+line2;
                }
                if(line3.length > 0){
                    line3 = '</br>'+line3;
                }

                extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}{1}{2}</p>', line1, line2, line3);
                break;
            case '04' :
                if (record.get('y')) {
                    var minFixFeeAmt, // 최소수수료
                        maxFixFeeAmt,  // 최대수수료
                        fixed, // 기본수수료
                        minRt, // 최소수수료율
                        maxRt, // 최대수수료율
                        rate; // 기본율
                    var bottom,
                        top,
                        calcBasic;  // 징수기준

                    calcBasic = codeMapObj['FeeCalculateBasicTypeCode'][(record.get('y').calcBasic)];

                    // 금액정보
                    if (record.get('y').feeTpCd == '02') {
                        minFixFeeAmt = (record.get('y').minFixFeeAmt) ? record.get('y').minFixFeeAmt : '0.00';
                        maxFixFeeAmt = (record.get('y').maxFixFeeAmt) ? record.get('y').maxFixFeeAmt : '0.00';
                        fixed = (record.get('y').fixed) ? record.get('y').fixed : '0.00';

                        minFixFeeAmt = PFValidation.gridFloatCheckRenderer(minFixFeeAmt, 19, 2, true);
                        maxFixFeeAmt = PFValidation.gridFloatCheckRenderer(maxFixFeeAmt, 19, 2, true);
                        fixed = PFValidation.gridFloatCheckRenderer(fixed, 19, 2, true);
                        
                        // 최소~최대(기본)
                        line1 = calcBasic + ', ' + bxMsg('DPS0129Unit1String1') + ' : ' + minFixFeeAmt + '~' + maxFixFeeAmt + '(' + fixed + ')';
                        line2 = '';
                    }
                    // 율정보
                    else if (record.get('y').feeTpCd == '01') {
                        minRt = (record.get('y').minRt) ? record.get('y').minRt : '0.000000';
                        maxRt = (record.get('y').maxRt) ? record.get('y').maxRt : '0.000000';
                        rate = (record.get('y').rate) ? record.get('y').rate : '0.000000';
                        bottom = (record.get('y').bottom) ? record.get('y').bottom : '0.00';
                        top = (record.get('y').top) ? record.get('y').top : '0.00';

                        minRt = PFValidation.gridFloatCheckRenderer(minRt, 3, 6, true);
                        maxRt = PFValidation.gridFloatCheckRenderer(maxRt, 3, 6, true);
                        rate = PFValidation.gridFloatCheckRenderer(rate, 3, 6, true);
                        bottom = PFValidation.gridFloatCheckRenderer(bottom, 19, 2, true);
                        top = PFValidation.gridFloatCheckRenderer(top, 19, 2, true);
                        
                        // 최소~최대(기본)
                        line1 = calcBasic  + ', ' + bxMsg('DPS0129Unit1String1') + ' : ' + minRt + '~' + maxRt + '(' + rate + ') (%)';
                        line2 = bxMsg('DPS0129Unit1String1') + ' : ' + bottom + '~' + top;
                    }
                }

                extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}</br> {1}</p>', line1, line2);
                break;
        }

        return extFormat;
    }
    });

    // 구성조건설정 권한이 있는 경우만 X(삭제) 컬럼 추가
    if(!parent.g_cndAtrb['cndAtrb-07'] || parent.g_cndAtrb['cndAtrb-07'] == 'Y') {
        columns.push({
            xtype: 'actioncolumn', width: 35, align: 'center',
            style: 'text-align:center',
            items: [{
                icon: '/images/x-delete-16.png',
                handler: function (grid, rowIndex, colIndex, item, e, record) {

                	if(tierHistoryExistYn == 'Y' && record.data.conditionStatusCode != '01'){
                		PFComponent.showMessage(bxMsg('dontDeleteEffect'), 'warning');
                		return;
                	}

                    record.destroy();
                    cndValComplexGrid.grid.getView().refresh(); // rowIndex adjusting.
                    modifyFlag = true;
                }
            }]
        });
    }

    cndValComplexGrid = PFComponent.makeExtJSGrid({
        fields: fields,
        gridConfig: {
            renderTo: '.complex-grid',
            columns: columns,
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                        beforeedit:function(e, editor){

                            var projectId = getSelectedProjectId();

                            // emergency와 상관없이 applyStart만 수정가능, 조건값은 팝업에서 수정
                        	if(editor.record.data.conditionStatusCode !='01' && editor.field != 'applyStart'
                        		&& tierHistoryExistYn && tierHistoryExistYn == 'Y') {
                                return false;
                            }
                        },
                        afteredit: function(e, editor){

                        	// 값이 수정된 경우
                            if(editor.originalValue !=  editor.value
                            	&& (editor.record.get('process') == null || editor.record.get('process').length == 0)){

                            	modifyFlag = true;

                        		// 수정가능 상태이면 기존 데이터는 삭제
                        		if(editor.record.data.conditionStatusCode == '01'){
                            		var originalData = $.extend(true, {}, editor.record.data);
                                    originalData[editor.field] = editor.record.modified[editor.field];
                                    originalData['process'] = 'D';
                                    complexGridDeleteData.push(originalData);
                        		}

                        		// 수정된 데이터는 생성
                                editor.record.set('process', 'C');

                            }

                            if (editor.field.endsWith(".code")) { // 목록조건 수정
                              cndValComplexGrid.grid.getView().refresh(); // rowIndex adjusting.
                            }
                        }
                    }
                })
            ],
            listeners: {
                scope: this,
                'celldblclick': function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {

                    if ($(td).find('p').attr('class') === 'ext-condition-value-column') {
                        var conditionTypeCode = selectedCondition.conditionTypeCode;
                        switch (conditionTypeCode) {
                            case '01':
                                renderConditionValue1Popup(record.get('y'), rowIndex);
                                break;
                            case '02' :
                                renderConditionValue2Popup(record.get('y'), rowIndex);
                                break;
                            case '03' :
                                renderConditionValue3Popup(record.get('y'), rowIndex);
                                break;
                            case '04' :
                                renderConditionValue4Popup(record.get('y'), rowIndex);
                                break;
                        }
                    }
                }
            }
        }

    });

    cndValComplexGrid.store.model.override({
      isEqual : function(currentValue, newValue) {
        if (typeof currentValue == "undefined" || currentValue === null)
          return currentValue === newValue;
        if (currentValue === newValue) return true;

        if (Ext.isDate(currentValue))
          if (Ext.isDate(newValue))
            return currentValue.getTime() == newValue.getTime();
          else
            return false;

        if (Ext.isObject(currentValue)) {
          for (var key in currentValue) {
            if (currentValue.hasOwnProperty(key))
              if (!this.isEqual(currentValue[key], newValue[key]))
                return false;
          }
          return true;
        }
        else if (Ext.isArray(currentValue)) {
          if (newValue === null) return false;
          if (currentValue.length != newValue.length) return false;
          for (var i = 0 ; i < currentValue.length ; i++)
            if (!this.isEqual(currentValue[i], newValue[i]))
              return false;
          return true;
        }
        return false;
      }
    });

    // OHS 20180117 추가 - 계층이력존재여부가 Y 이면 aggregate() 함수를 호출하지 않음.
    if($el.find('.tierHistoryExistYn-check-value').val() != 'Y') {
    	gridData = aggregate(gridData);
    }
    cndValComplexGrid.setData(gridData);
}


function aggregate(data) {
  var match = function(a, b) {
    // 조건값 체크
    if (a.y.conditionValueType === "DISCRETE") { // 목록
      if (a.y.defineValues.length !== b.y.defineValues.length)
        return null;
      for (var i=0; i<a.y.defineValues.length; i++) {
        if (a.y.defineValues[i].isSelected !== b.y.defineValues[i].isSelected)
          return null;
      }
    } else if (a.y.conditionValueType === "RANGE") { // 범위
      if (a.y.conditionDetailTypeCode !== b.y.conditionDetailTypeCode
          || a.y.minValue !== b.y.minValue
          || a.y.maxValue !== b.y.maxValue
          || a.y.defalueValue !== b.y.defalueValue
          || a.y.increaseValue !== b.y.increaseValue
          || a.y.currencyValue !== b.y.currencyValue
          || a.y.productMeasurementUnit !== b.y.productMeasurementUnit
          || a.y.isSingleValue !== b.y.isSingleValue
          || a.y.isSystemMaxValue !== b.y.isSystemMaxValue)
        return null;
    } else if (a.y.conditionValueType === "INTEREST") { // 금리
      if (a.y.applyMaxInterestRate !== b.y.applyMaxInterestRate
          || a.y.applyMinInterestRate !== b.y.applyMinInterestRate
          || a.y.baseIntRateDataTpDscd !== b.y.baseIntRateDataTpDscd
          || a.y.baseIntRtAplyTmCd !== b.y.baseIntRtAplyTmCd
          || a.y.baseIntRtAplyWayCd !== b.y.baseIntRtAplyWayCd
          || a.y.baseRateCode !== b.y.baseRateCode
          || a.y.calcMethod !== b.y.calcMethod
          || a.y.dayRateYearlyCoefficient !== b.y.dayRateYearlyCoefficient
          || a.y.fixTrmDataTpDscd !== b.y.fixTrmDataTpDscd
          || a.y.fixTrmRefCndCd !== b.y.fixTrmRefCndCd
          || a.y.frctnAplyCnt !== b.y.frctnAplyCnt
          || a.y.frctnAplyWayCd !== b.y.frctnAplyWayCd
          || a.y.frstFixIrtAplyTrmCnt !== b.y.frstFixIrtAplyTrmCnt
          || a.y.frstFixIrtAplyTrmDscd !== b.y.frstFixIrtAplyTrmDscd
          || a.y.maxInterestRate !== b.y.maxInterestRate
          || a.y.maxSprdRt !== b.y.maxSprdRt
          || a.y.minInterestRate !== b.y.minInterestRate
          || a.y.minSprdRt !== b.y.minSprdRt
          || a.y.rate !== b.y.rate
          || a.y.rateApplyWayCode !== b.y.rateApplyWayCode
          || a.y.rateFixedTerm !== b.y.rateFixedTerm
          || a.y.rateRefDay !== b.y.rateRefDay
          || a.y.rateSegmentCircle !== b.y.rateSegmentCircle
          || a.y.rateSegmentDayType !== b.y.rateSegmentDayType
          || a.y.rateSegmentType !== b.y.rateSegmentType
          || a.y.refTrmAplyDscd !== b.y.refTrmAplyDscd
          || a.y.sprdAplyFormulaCd !== b.y.sprdAplyFormulaCd
          || a.y.termCalcType !== b.y.termCalcType
          || a.y.varIntRtAplyCyclCnt !== b.y.varIntRtAplyCyclCnt
          || a.y.varIntRtCyclCalcnBaseCd !== b.y.varIntRtCyclCalcnBaseCd)
        return null;
    } else if (a.y.conditionValueType === "FEE") { // 수수료
      if (a.y.feeTpCd !== b.y.feeTpCd
          || a.y.calcBasic !== b.y.calcBasic
          || a.y.maxValue !== b.y.maxValue
          || a.y.minFixFeeAmt !== b.y.minFixFeeAmt
          || a.y.maxFixFeeAmt !== b.y.maxFixFeeAmt
          || a.y.fixed !== b.y.fixed
          || a.y.fixFeeIncrsAmt !== b.y.fixFeeIncrsAmt
          || a.y.bottom !== b.y.bottom
          || a.y.top !== b.y.top
          || a.y.minRt !== b.y.minRt
          || a.y.maxRt !== b.y.maxRt
          || a.y.rate !== b.y.rate
          || a.y.unitIncrsRt !== b.y.unitIncrsRt
          || a.y.rtMsurUnitCd !== b.y.rtMsurUnitCd
          || a.y.settleType !== b.y.settleType
          || a.y.currencyValue !== b.y.currencyValue
          || a.y.isSystemMaxValue !== b.y.isSystemMaxValue
          || a.y.levyFrqDscd !== b.y.levyFrqDscd)
        return null;
    } else return null; // 이외 타입은 aggregate 하지 않음.

    //구성조건 체크
    var diff = 0;
    var index = null;
    var target = Object.keys(a).filter(function(key) {
      return a[key].conditionTypeCode;
    });
    for (var i=0; i<target.length; i++) {
      var key = target[i];
      var va = a[key];
      var vb = b[key];

      if (va.conditionTypeCode === "01") { // 목록
        var la = va.listConditionValue.defineValues;
        var lb = vb.listConditionValue.defineValues;
        if (la.length !== lb.length) {
          diff++;
          index = key;
        }
        else {
          for (var j=0; j<la.length; j++) {
            if (la[j].code !== lb[j].code
                || la[j].isSelected !== lb[j].isSelected) {
              diff++;
              index = key;
              break;
            }
          }
        }

      } else if (va.conditionTypeCode === "02") { // 범위
        var ra = va.rangeConditionValue;
        var rb = va.rangeConditionValue;

        if (ra.conditionDetailTypeCode !== rb.conditionDetailTypeCode
            || ra.minValue !== rb.minValue
            || ra.maxValue !== rb.maxValue
            || ra.defalueValue !== rb.defalueValue
            || ra.increaseValue !== rb.increaseValue
            || ra.currencyValue !== rb.currencyValue
            || ra.productMeasurementUnit !== rb.productMeasurementUnit)
          diff++;
          index = key;

      }

      if (diff > 1) return null;
    }

    return index;
  };

  var iterate = function(list) {
    return list.reduce(function(l, now) {
      var prev = l.length ? l[l.length - 1] : null;
      if (prev) {
        var key = match(prev, now);
        if (key && prev[key].conditionTypeCode === "01") {
          var map = now[key].listConditionValue.defineValues.reduce(function(m, v) {
            if (v.isSelected)
              m[v.code] = true;
            return m;
          }, {});
          prev[key].listConditionValue.defineValues.forEach(function(v) {
            if (map[v.code])
              v.isSelected = true;
          });
        } else {
          l.push(now);
        }
      } else {
        l.push(now);
      }
      return l;
    }, []);
  };

  var prev, result = data;
  do {
    prev = result;
    result = iterate(result);
  } while (prev.length > result.length);

  return result;
}


function sameProductCheckEvent(e, $selecter){
	if(!$selecter){
		$selecter = $(e.currentTarget).parents('.cnd-value-type3');
	}

    var isChecked = $(e.currentTarget).prop('checked');
    var $thisProductCode = $selecter.find('.product-code');
    var $thisProductName = $selecter.find('.product-name');
    if(isChecked){
        var thisProduct = selectedTreeItem.id; //$('.pf-cp-product-info-base-form').find('.product-base-info-code').text();
        var thisProductName = selectedTreeItem.text; // $('.pf-cp-product-info-base-form').find('.product-name').val();
        $thisProductCode.val(thisProduct);
        $thisProductName.val(thisProductName);
        $thisProductCode.removeClass("has-error");
        $thisProductName.removeClass("has-error");
    }else{
        $thisProductCode.val('');
        $thisProductName.val('');
    }
}


onEvent('click', '.pf-cp-condition-view-history-btn', function(e) {
    PFComponent.makePopup({
        title: bxMsg('DPP0127Title'),
        contents: productConditionHistoryPopupTpl(selectedCondition),
        width: 800,
        height: 570,
        buttons:[
            {text:bxMsg('ContextMenu_Close'), elCls:'button button-primary', handler:function(){
                this.close();
            }}
        ],
        listeners: {
            afterRenderUI: function() {
                var requestParam = {
                    conditionGroupTemplateCode: selectedCondition.conditionGroupTemplateCode,
                    conditionGroupCode: selectedCondition.conditionGroupCode,
                    conditionCode: selectedCondition.id,
                    code: productInfo.code,
                    tntInstId: selectedTreeItem.tntInstId,
                    pdInfoDscd: pdInfoDscd
                };
                renderProductConditionHistoryGrid(requestParam);
            }
        }
    });
});

function renderProductConditionHistoryGrid(requestParam){
    var $conditionInfoWrap = $el.find('.pf-cp-condition-info');
    var gridRow = requestParam;
    var requestURL;
    var columns = [];
    var bxmHeader = {};

    columns.push(
        {text: bxMsg('PAS0202String19'), flex: 1, dataIndex: 'applyStart'},
        {text: bxMsg('PAS0202String20'), flex: 1, dataIndex: 'applyEnd'}
    );

    // conditionType3 == '02' : 우대금리 연결
    if(conditionType3 == '02'){
        requestURL = '/product/queryPrimeInterestRelationHistoryList.json';
        bxmHeader = {
            application : 'PF_Factory',
            service : 'PdRelationService',
            operation : 'queryPrimeInterestRelationHistoryList'
        }
    }
    // 우대금리 정의 및 기존 조건
    else {
        requestURL = '/product_condition/getListProductConditionHistory.json';
        columns.push(
            {text: bxMsg('DPP0127String8'), flex: 1, dataIndex: 'conditionClassifyCode',
                renderer: function(value) {
                    return codeMapObj.ProductConditionClassifyCode[value];
                }
            }
        );
        bxmHeader = {
            application : 'PF_Factory',
            service : 'PdCndService',
            operation : 'queryListPdCndHistory'
        }
    }

    columns.push({text: bxMsg('DPP0127String9'), flex: 1, dataIndex: 'lastModifier'});

    PFRequest.get(requestURL,requestParam, {
        success: function(responseData){
            var grid = PFComponent.makeExtJSGrid({
                fields: [
                    'applyStart', 'applyEnd', 'conditionClassifyCode', 'lastModifier',
                    'complexConditionRecordSequence', 'status', 'conditionTypeCode', 'isValueNull',
                    'conditionGroupCode', 'isMandatory', 'returnFeeYn', 'conditionGroupTemplateCode', 'conditionAgreeLevel'
                ],
                gridConfig: {
                    renderTo: '.pf-cp-condition-history-grid',
                    columns: columns,
                    listeners: {
                        scope: this,
                        itemdblclick : function(tree, record){
                            var requestParam = gridRow;
                            requestParam.applyStart = record.get('applyStart');
                            requestParam.pdInfoDscd = pdInfoDscd;
                            requestParam.tntInstId = selectedTreeItem.tntInstId;

                            PFRequest.get('/product_condition/getProductConditionDetail.json', requestParam, {
                                success: function(data) {
                                    if (data.isValueNull) {
                                        $('.pf-cp-condition-history-popup .history-complex-grid').hide();
                                        $('.pf-cp-condition-history-popup .history-condition-value').html('<p class="isValueNull-text">' + bxMsg('DPS0121String10') + '</p>');
                                    } else {
                                        if (data.conditionClassifyCode == '02') {
                                            $('.pf-cp-condition-history-popup .history-complex-grid').show();
                                            $('.pf-cp-condition-history-popup .history-condition-value').hide();

                                            renderHistoryComplexGrid(data.complexConditionTitleInfoList, data.complexConditionMatrix);
                                        } else {
                                            $('.pf-cp-condition-history-popup .history-complex-grid').hide();
                                            $('.pf-cp-condition-history-popup .history-condition-value').show();

                                            switch (data.conditionTypeCode) {

                                                case '01' :
                                                    $('.pf-cp-condition-history-popup').find('.history-condition-value').empty();
                                                    renderHistoryCndValueType1Grid(data.listConditionValue.defineValues, '.pf-cp-condition-history-popup .history-condition-value');
                                                    break;
                                                case '02' :

                                                    $('.pf-cp-condition-history-popup .history-condition-value').html(cndValueType2Tpl(data.rangeConditionValue));

                                                    renderComboBox('CurrencyCode', $('.CurrencyCode'));
                                                    if (data.conditionDetailTypeCode == '05') {
                                                        //renderComboBoxByRate('ProductMeasurementUnitCode', $('.ProductMeasurementUnitCode'));
                                                        renderComboBox('ProductMeasurementUnitCodeR', $('.ProductMeasurementUnitCode:visible'));
                                                    }
                                                    // 02.날짜
                                                    else if(data.conditionDetailTypeCode == '02'){
                                                        renderComboBox('ProductMeasurementUnitCodeD', $('.ProductMeasurementUnitCode:visible'));
                                                    }
                                                    // 03.주기
                                                    else if(data.conditionDetailTypeCode == '03'){
                                                        renderComboBox('ProductMeasurementUnitCodeF', $('.ProductMeasurementUnitCode:visible'));
                                                    }
                                                    // 04.숫자
                                                    else if(data.conditionDetailTypeCode == '04'){
                                                        renderComboBox('ProductMeasurementUnitCodeN', $('.ProductMeasurementUnitCode:visible'));
                                                    }else{
                                                        renderComboBox('ProductMeasurementUnitCode', $('.ProductMeasurementUnitCode:visible'));
                                                    }

                                                    if (data.rangeConditionValue.isSingleValue) {
                                                        $('.history-condition-value').find('.isSingleValue-hide').hide();
                                                    } else {
                                                        $('.history-condition-value').find('.isNotSingleValue-hide').hide();
                                                    }

                                                    if (data.conditionDetailTypeCode == '01') {
                                                        $('.history-condition-value').find('.detail-type01-hide').hide();
                                                    } else {
                                                        $('.history-condition-value').find('.detail-except-type01-hide').hide();
                                                    }

                                                    //$('.history-condition-value').find('.detail-type01-hide').css('display','none');
                                                    break;
                                                case '03' :

                                                	var $history = $('.pf-cp-condition-history-popup .history-condition-value');

                                                	$history.find('.frctnAplyCnt').val(data.interestConditionValue.frctnAplyCnt);
                                                    if (data.interestConditionValue) {
                                                        data.interestConditionValue.minInterestRate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.minInterestRate, 3, 6);
                                                        data.interestConditionValue.maxInterestRate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.maxInterestRate, 3, 6);
                                                        data.interestConditionValue.applyMinInterestRate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.applyMinInterestRate, 3, 6);
                                                        data.interestConditionValue.applyMaxInterestRate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.applyMaxInterestRate, 3, 6);
                                                        data.interestConditionValue.rate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.rate, 3, 6);
                                                        data.interestConditionValue.minSprdRt = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.minSprdRt, 3, 6); // 스프레드율 최소
                                                        data.interestConditionValue.maxSprdRt = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.maxSprdRt, 3, 6); // 스프레드율 최대
                                                    }

                                                    $('.pf-cp-condition-history-popup .history-condition-value').html(cndValueType3Tpl(data.interestConditionValue));

                                                    renderComboBox('FrctnAplyWayCode', $history.find('.FrctnAplyWayCode'), data.interestConditionValue.frctnAplyWayCd, true); // 우수리적용방법코드
                                                    renderComboBox('ProductConditionInterestApplyTypeCode', $history.find('.ProductConditionInterestApplyTypeCode'), (data.interestConditionValue.rateApplyWayCode ? data.interestConditionValue.rateApplyWayCode : '')); // 금리적용방식코드

                                                    renderCndValueType3Tab($history, data);

                                                    // 우수리적용방법 별도 처리 ( 빈값일경우 '' 세팅 )
                                                    if(!data.interestConditionValue.frctnAplyWayCd) {
                                                    	$history.find('.FrctnAplyWayCode').val('');
                                                    }

                                                    // 조건값결정레벨이 상품(01)이면
                                                    if(selectedCondition.conditionAgreeLevel == '01'){
                                                        // 스프레스율 1개만 입력
                                                    	$history.find('.maxSprdRt').hide();
                                                    }else{
                                                    	$history.find('.maxSprdRt').show();
                                                    }

                                                    if(detailRequestParam.applyMethod && detailRequestParam.applyMethod == '02'){
                                                    	$history.find('.pf-cp-type3-panel .pf-panel-body *').prop('disabled', true);
                                                    }

                                                    // 조건값적용방법코드
                                                    if (data.conditionValueAplyWayCode == '02') {

                                                    	$history.find('.condition-value').addClass('active');

                                                    	$history.find('.pf-cp-type3-panel .cndValApplyWayCode-hidden').hide();    // 자상품사용가능여부
                                                        $history.find('.cnd-val-apply-way').hide();
                                                        $history.find('.additional-info-wrap').hide();

                                                    }

                                                    break;

                                                case '04' :
                                                    $('.pf-cp-condition-history-popup .history-condition-value').html(cndValueType4TblByHistory(data.feeConditionValue));

                                                    var $history = $('.pf-cp-condition-history-popup .history-condition-value');

                                                    if (data.feeConditionValue.isSystemMaxValue == true) {
                                                    	// OHS 2017.02.16 수정 - 시스템최대치 값세팅
                                                        //$history.find('.topValue').prop('disabled', true).val('');
                                                    	$history.find('.topValue').prop('disabled', true);
                                                        $history.find('.isSystemMaxValue').prop('checked', true);
                                                    }

                                                    //renderComboBoxByRate('ProductMeasurementUnitCode', $history.find('.RtMsurUnitCd'), data.feeConditionValue.rtMsurUnitCd ? data.feeConditionValue.rtMsurUnitCd : '');
                                                    renderComboBox('ProductMeasurementUnitCodeR', $history.find('.RtMsurUnitCd'), data.feeConditionValue.rtMsurUnitCd ? data.feeConditionValue.rtMsurUnitCd : '');
                                                    renderComboBox('FeeCalculateBasicTypeCode', $('.FeeCalculateBasicTypeCode'), data.feeConditionValue ? data.feeConditionValue.calcBasic : '');   // 징수기준

                                                    // 율정보 체크
                                                    if (data.feeConditionValue.feeTpCd == '01') {
                                                        $history.find('.charge-radio-rate').prop('checked', true);
                                                        $history.find('.cnd-value-04-amount-table').removeClass('active');
                                                        $history.find('.cnd-value-04-rate-table').addClass('active');
                                                    }
                                                    // 금액정보 체크
                                                    else {
                                                        $history.find('.charge-radio-amount').prop('checked', true);
                                                        $history.find('.cnd-value-04-amount-table').addClass('active');
                                                        $history.find('.cnd-value-04-rate-table').removeClass('active');
                                                    }
                                                    break;
                                            }
                                            $('.history-condition-value').find('select').prop('disabled',true);
                                            $('.history-condition-value').find('input').prop('disabled',true);
                                        }
                                    }
                                },
                                bxmHeader: {
                                    application: 'PF_Factory',
                                    service: 'PdCndService',
                                    operation: 'queryPdCndDetail'
                                }
                            })

                        }
                    }
                }

            });

            var gridData = [];
            $.each(responseData,function(index, history){
                var row = {};
                row.applyStart = history.applyStart;
                row.applyEnd = history.applyEnd;
                row.conditionClassifyCode = history.conditionClassifyCode;
                row.lastModifier = history.lastModifier;
                row.complexConditionRecordSequence = history.complexConditionRecordSequence;
                row.status = history.status;
                row.conditionTypeCode = history.conditionTypeCode;
                row.isValueNull = history.isValueNull ? 'true':'false';
                row.isMandatory = history.isMandatory ? 'true':'false';
                row.returnFeeYn = history.returnFeeYn=='Y' ? 'true':'false';
                row.conditionGroupTemplateCode = history.conditionGroupTemplateCode;
                row.conditionAgreeLevel = history.conditionAgreeLevel;
                gridData.push(row);
            })
            grid.setData(gridData);
        },
        //bxmHeader: {
        //    application: 'PF_Factory',
        //    service: 'PdCndService',
        //    operation: 'queryListPdCndHistory'
        //}
        bxmHeader : bxmHeader
    });
}

// 금리데이터유형코드에 따른 화면 컨트롤
function setInterestCombobox(data, $selector, varIntCndValueVO){

	var interestConditionValue;
	if(varIntCndValueVO){
		interestConditionValue = varIntCndValueVO;
	}else{
		interestConditionValue = data.interestConditionValue;
	}

	// 금리값
    if (!interestConditionValue.type || interestConditionValue.type == '01') {
        $selector.find('.interest-value-wrap').show();		// 금리값
        $selector.find('.interest-value-wrap .cnd-value-title').text(bxMsg('InterestValue'));

        $selector.find('.base-interest-type-wrap').hide();	// 기준금리
        $selector.find('.spread-info-wrap').hide();			// 스프레드
        $selector.find('.apply-limit-wrap').hide();			// 적용가능한도
        $selector.find('.interest-link-info-wrap').hide();	// 참조정보
    }
    // 기준금리연동
    else if (interestConditionValue.type == '02') {

        $selector.find('.interest-value-wrap').hide();		// 금리값
        $selector.find('.base-interest-type-wrap').show();	// 기준금리

        // 스프레드
        $selector.find('.spread-info-wrap').show();
        setSprdAplyFormulaCombobox($selector);
        if(selectedCondition.conditionAgreeLevel == '01'){	// 조건값결정레벨 = 상품
        	$selector.find('.maxSprdRt').hide();
        }

        $selector.find('.apply-limit-wrap').show();			// 적용가능한도
        $selector.find('.interest-link-info-wrap').hide();	// 참조정보

    } else if(interestConditionValue.type == '03') { 	// 타상품참조

        $selector.find('.interest-value-wrap').hide();      // 금리값

        // 금리적용방식코드 = 04.타상품참조
        if($selector.find('.ProductConditionInterestApplyTypeCode').val() == '04'){
            $selector.find('.spread-info-wrap').hide();     // 스프레드정보
            $selector.find('.apply-limit-wrap').hide();     // 적용가능한도

            // 타금리연동정보의 동상품여부, 참조조건/조건값/측정단뒤, 참조금리조회시점 숨김
            $selector.find('.interest-link-info-wrap .product-ref').hide();
        }else{

        	// 스프레드정보
            $selector.find('.spread-info-wrap').show();
            setSprdAplyFormulaCombobox($selector);
            if(selectedCondition.conditionAgreeLevel == '01'){	// 조건값결정레벨 = 상품
            	$selector.find('.maxSprdRt').hide();
            }

            $selector.find('.apply-limit-wrap').show();     // 적용가능한도

            $selector.find('.interest-link-info-wrap .product-ref').show();
        }

        $selector.find('.base-interest-type-wrap').hide();  // 기준금리연동
        $selector.find('.interest-link-info-wrap').show();  // 타금리연동정보


        var $listTypeSelect =
            $('<select class="bx-form-item bx-compoenent-small list-type-value list-type" data-form-param="refCndListCd"  style="width: 130px; margin-left: 1px;">');
        var $rangeTypeInput =
            $('<input type="text" class="bx-form-item bx-compoenent-small range-type-value range-type removeComma input-align-right" data-form-param="refCndVal"  style="width: 125px; margin-left: 1px;">');
        var $rangeType =
            $('<select class="bx-form-item bx-compoenent-small range-type-unit range-type" data-form-param="refCndMsurUtCd"  style="width: 125px; margin-left: 3px;">');

        if(data.currentCatalogId != '01' && data.currentCatalogId != '04' && data.currentCatalogId != '05'){
            $rangeTypeInput.addClass('float10');
        }else if(data.currentCatalogId == '02'){
            $rangeTypeInput.addClass('float-range-0');
        }else{
            $rangeTypeInput.addClass('float-range-21');
        }

        $selector.find('.list-type').remove();
        $selector.find('.range-type').remove();

        if(interestConditionValue.refPdCd){
            if(interestConditionValue.refRefCndCd && (interestConditionValue.refRefCndCd.substr(0,1)=='L' || interestConditionValue.refRefCndCd.substr(0,1)=='Y')){
                $selector.find('.ref-condition-column').append($listTypeSelect);
                var conditionData = {code:interestConditionValue.refRefCndCd, conditionTypeCode:'01'}
                makeListTypeValue(conditionData, $selector, interestConditionValue.refCndListCd ? interestConditionValue.refCndListCd : null);
                $selector.find('.list-type-value[value="'+interestConditionValue.refCndListCd+'"]').prop('selected', true);
            }
            else if(interestConditionValue.refRefCndCd) {
                var requestParam = {conditionCode:interestConditionValue.refRefCndCd, tntInstId:selectedTreeItem.tntInstId};
                PFRequest.get('/condition/template/getConditionTemplate.json', requestParam, {
                    success: function(responseData){
                        var conditionData = {
                            code : interestConditionValue.refRefCndCd,
                            conditionDetailTypeCode : responseData.currentCatalogId
                        }
                        $selector.find('.ref-condition-column').append($rangeTypeInput,$rangeType);

                        var value = interestConditionValue.refCndMsurUtCd ? interestConditionValue.refCndMsurUtCd : interestConditionValue.refCndCrncyCd
                        makeRangeTypeValue(conditionData, $selector, value);

                        $selector.find('.range-type-value').val(interestConditionValue.refCndVal);

                        if(responseData.conditionDetailTypeCode=='01'){
                            $selector.find('.range-type-unit option[value="'+interestConditionValue.refCndMsurUtCd+'"]').prop('selected',true)
                        }else{
                            $selector.find('.range-type-unit option[value="'+interestConditionValue.refCndCrncyCd+'"]').prop('selected',true)
                        }

                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CndTemplateService',
                        operation: 'queryCndTemplate'
                    }
                });
            }
        }else{
            $selector.find('.product-code').val('');
            $selector.find('.product-name').val('');
            $selector.find('.condition-code').val('');
            $selector.find('.reference-product-code').val('');

            $selector.find('.list-type').remove();
            $selector.find('.range-type').remove();
        }

//        if(refPdCdEvent){
//            refPdCdEvent(data, $selector);
//        }

    }
}

function setSprdAplyFormulaCombobox($selector, value){
    if(!value) {
        value = $selector.find('.SprdAplyFormulaCode').val();
    }
    if(value == ''){
        $selector.find('.minSprdRt').val('0.000000');
        $selector.find('.maxSprdRt').val('0.000000');
        $selector.find('.minSprdRt').prop('disabled', true);
        $selector.find('.maxSprdRt').prop('disabled', true);
    }else{
        $selector.find('.minSprdRt').prop('disabled', false);
        $selector.find('.maxSprdRt').prop('disabled', false);
    }
}

//고정기간데이터유형구분코드
function setFixTrmDataTpDscd($selector, value){
	if(!value){
		value = $selector.find('.fixTrmDataTpDscd').val();
	}

	// 지정값일때
	if(value == '01'){
		$selector.find('.fixTrmDataTpDscd-01').show();
		$selector.find('.fixTrmDataTpDscd-02').hide();

		$selector.find('.fixTrmRefCndCd').val('');
		$selector.find('.fixTrmRefCndNm').val('');
	}
	// 고정기간조건
	else if(value == '02'){
		$selector.find('.fixTrmDataTpDscd-01').hide();
		$selector.find('.fixTrmDataTpDscd-02').show();

		$selector.find('.frstFixIrtAplyTrmCnt').val('');
		$selector.find('.frstFixIrtAplyTrmDscd').val('');
	}
}

//기준금리데이터유형구분코드
function setBaseIntRateDataTpDscd($selector, value){
	if(!value){
		value = $selector.find('.baseIntRateDataTpDscd').val();
	}

	// 지정값일때
	if(value == '01'){
		$selector.find('.baseIntRateDataTpDscd-01').show();
		$selector.find('.baseIntRateDataTpDscd-02').hide();

		$selector.find('.base-interest-type-wrap .refCndCd').val('');
		$selector.find('.base-interest-type-wrap .refCndNm').val('');
	}
	// 고정기간조건
	else if(value == '02'){
		$selector.find('.baseIntRateDataTpDscd-01').hide();
		$selector.find('.baseIntRateDataTpDscd-02').show();

		$selector.find('.base-interest-type-wrap .BaseIntRtKndCode').val('');
	}
}


// 변동정보적용방식 선택에 따른 setting
function setInterestSegmentTypeCombobox($selector){

    // 변동정보적용방식 = 04.약정주기변동적용 일때
    if($selector.find('.InterestSegmentTypeCode').val() == '04'){
        // 변동주기참조조건코드 보임
        $selector.find('.varFrqRefCndCd').show();
        $selector.find('.varFrqRefCndNm').show();
    }else{
        // 변동주기참조조건코드 숨김
        $selector.find('.varFrqRefCndCd').hide();
        $selector.find('.varFrqRefCndNm').hide();
    }

}

// 동상품여부 체크
onEvent('change', '.condition-value .fixed-info .same-product-yn', function(e){
    sameProductCheckEvent(e, $('.condition-value .fixed-info'));
});

onEvent('change', '.condition-value .var-info .same-product-yn', function(e){
    sameProductCheckEvent(e, $('.condition-value .var-info'));
});

onEvent('change', '.condition-value .ref-info .same-product-yn', function(e){
    sameProductCheckEvent(e, $('.condition-value .ref-info'));
});

// 변동주기참조조건코드 포커스
onEvent('mousedown', '.fixed-info .varFrqRefCndCd', function(e){
    PFPopup.selectConditionTemplate({}, function (data) {
        $('.fixed-info .varFrqRefCndCd').val(data.code);
        $('.fixed-info .varFrqRefCndNm').val(data.name);
    });
});

//변동주기참조조건코드 포커스
onEvent('mousedown', '.var-info .varFrqRefCndCd', function(e){
    PFPopup.selectConditionTemplate({}, function (data) {
        $('.var-info .varFrqRefCndCd').val(data.code);
        $('.var-info .varFrqRefCndNm').val(data.name);
    });
});

// 타상품금리 연동 상품코드 포커스
onEvent('mousedown', '.condition-value .fixed-info .product-code', function(e) {
    PFPopup.selectProduct({ pdInfoDscd }, function(data) {
        var code;
        var name;
        if(data){
            code = data.code;
            name = data.name;
        }

        if(code == $(e.currentTarget).val()){
            $('.condition-value .fixed-info .same-product-yn').prop('checked', true);
        }else{
            $('.condition-value .fixed-info .same-product-yn').prop('checked', false);
            $('.condition-value .fixed-info .product-code').val(code);
            $('.condition-value .fixed-info .product-name').val(name);
        }
        modifyFlag = true;
    });
});
onEvent('mousedown', '.condition-value .var-info .product-code', function(e) {
    PFPopup.selectProduct({ pdInfoDscd }, function(data) {
        var code;
        var name;
        if(data){
            code = data.code;
            name = data.name;
        }

        if(code == $(e.currentTarget).val()){
            $('.condition-value .var-info .same-product-yn').prop('checked', true);
        }else{
            $('.condition-value .var-info .same-product-yn').prop('checked', false);
            $('.condition-value .var-info .product-code').val(code);
            $('.condition-value .var-info .product-name').val(name);
        }
        modifyFlag = true;
    });
});
onEvent('mousedown', '.condition-value .ref-info .product-code', function(e) {
    PFPopup.selectProduct({ pdInfoDscd }, function(data) {
        var code;
        var name;
        if(data){
            code = data.code;
            name = data.name;
        }

        if(code == $(e.currentTarget).val()){
            $('.condition-value .ref-info .same-product-yn').prop('checked', true);
        }else{
            $('.condition-value .ref-info .same-product-yn').prop('checked', false);
            $('.condition-value .ref-info .product-code').val(code);
            $('.condition-value .ref-info .product-name').val(name);
        }
        modifyFlag = true;
    });
});

// 금리값 참조조건코드 포커스
onEvent('mousedown','.condition-value .fixed-info .fix-irt-tr .condition-code',function(e){
	var submitEvent = function(data){
        if(!data) return;
        $(e.currentTarget).val(data.code);
        $('.fix-irt-tr .condition-name').val(data.name);
    }

	// 해당 상품의 범위조건만
	var requestParam = {
		pdCd: selectedTreeItem.id	//$('.pf-cp-product-info-base-form').find('.product-base-info-code').text()
		, conditionTypeCode:'02'
	};
	makeConditionTemplateListSearchPopup(submitEvent, false, requestParam);
});

//기준금리 참조조건코드 포커스
onEvent('mousedown','.condition-value .fixed-info .base-interest-type-wrap .condition-code',function(e){
	var submitEvent = function(data){
        if(!data) return;
        $(e.currentTarget).val(data.code);
        $('.fixed-info .condition-name').val(data.name);
    }

	makeConditionTemplateListSearchPopup(submitEvent, false, {});
});
onEvent('mousedown','.condition-value .var-info .base-interest-type-wrap .condition-code',function(e){
	var submitEvent = function(data){
        if(!data) return;
        $(e.currentTarget).val(data.code);
        $('.var-info .condition-name').val(data.name);
    }

	makeConditionTemplateListSearchPopup(submitEvent, false, {});
});

// 타상품금리 연동 조건코드 포커스
onEvent('mousedown','.condition-value .fixed-info .interest-link-info-wrap .condition-code',function(e){
    conditionCodeFocusEvent(e, $('.condition-value .fixed-info'));
});
onEvent('mousedown','.condition-value .var-info .interest-link-info-wrap .condition-code',function(e){
    conditionCodeFocusEvent(e, $('.condition-value .var-info'));
});
onEvent('mousedown','.condition-value .ref-info .condition-code',function(e){
    conditionCodeFocusEvent(e, $('.condition-value .ref-info'));
});

function conditionCodeFocusEvent(e, $selecter){
    var submitEvent = function(data){
        if(!data) return;
        $(e.currentTarget).val(data.code);
        $('.condition-name').val(data.name); //$('.condition-value .condition-name').val(data.name);
    }
    var productCode;
    if($selecter){
        productCode = $selecter.find('.cnd-value-type3-table .product-code').val();
    }else{
        productCode = $('.cnd-value-type3-table').find('.product-code').val();
    }

    if(!productCode || productCode==''){
        // 상품코드을(를) 먼저 선택하세요.
        PFComponent.showMessage(bxMsg('PdCdSelectWarningMsg'), 'warning');
        return;
    }

    makeConditionTemplateListSearchPopup(submitEvent, false, {pdCd: productCode});
}

onEvent('mousedown', '.condition-value .fixed-info .reference-product-code', function(e){
    referenceProductCodeFocusEvent(e, $('.condition-value .fixed-info .interest-link-info-wrap'));
});

onEvent('mousedown', '.condition-value .var-info .reference-product-code', function(e){
    referenceProductCodeFocusEvent(e, $('.condition-value .var-info .interest-link-info-wrap'));
});

onEvent("click", ".text-input-btn", function(e){
    var cntnt = $(".apply-rule").val() + $(e.currentTarget).val();
    $(".apply-rule").val(cntnt);

    // product-condition.js - function setTokens() / 7354 line
    setTokens($(e.currentTarget).val()); // OHS20180416 추가 - 계산모듈처럼 적용

    var ruleContent = $(e.currentTarget).parent().parent().parent().find('.apply-rule').val();
    var count = 0;

    for(var i = 0 ; i < ruleContent.length ; i++){
        if (ruleContent.charAt(i) === '('){
            count++;
        }else if(ruleContent.charAt(i) === ')'){
            count--;
        }
    }

    if(count !== 0){
        $('.applyRuleSyntaxError').show();
        return;
    }

    if(ruleVerifier(ruleContent)){
        $('.applyRuleSyntaxError').hide();
    }else{
        $('.applyRuleSyntaxError').show();
    }

    modifyFlag = true;
});

onEvent("click", ".back-space-btn", function(e){
	// OHS 20180416 - 계산영역처럼 단위로 지움
	// 수기입력하였을때는 기존처럼 slice를 이용하여 지움
	var result = "";
    var delimiter = "";
    if(tokens && tokens.length > 0) {
    	$.each(tokens, function(index, token) {
    		if (token.type === TokenType.ARITHMETIC)
    			result += delimiter;
    			result += token.value;

    		if (token.type === TokenType.ARITHMETIC || token.type === TokenType.COMMA)
    			result += delimiter;
    	});
    }

	if(tokens && tokens.length > 0 && result.replace(/ /gi, '') == $(".apply-rule").val().replace(/ /gi, '')) {
		tokens.pop();
		$(".apply-rule").val(PFFormulaEditor.toContent(tokens, " "));
	}
	else {
		var cntnt = $(".apply-rule").val().slice(0, -1);
	    $(".apply-rule").val(cntnt);
	}

    var ruleContent = $(e.currentTarget).parent().parent().parent().find('.apply-rule').val();
    var count = 0;

    for(var i = 0 ; i < ruleContent.length ; i++){
        if (ruleContent.charAt(i) === '('){
            count++;
        }else if(ruleContent.charAt(i) === ')'){
            count--;
        }
    }

    if(count !== 0){
        $('.applyRuleSyntaxError').show();
        return;
    }

    if(ruleContent == '') {
    	tokens = PFFormulaEditor.tokenize(''); // 초기화
    	$('.apply-rule-desc').val('');
    }
    if(ruleVerifier(ruleContent)){
        $('.applyRuleSyntaxError').hide();
    }else{
        $('.applyRuleSyntaxError').show();
    }

    modifyFlag = true;
});

// 적용규칙 검증
onEvent('keyup.xdsoft', '.apply-rule', function(e) {

    var ruleContent = $(e.currentTarget).parent().parent().find('.apply-rule').val();
    var count = 0;

    for(var i = 0 ; i < ruleContent.length ; i++){
        if (ruleContent.charAt(i) === '('){
            count++;
        }else if(ruleContent.charAt(i) === ')'){
            count--;
        }
    }

    if(count !== 0){
        $('.applyRuleSyntaxError').show();
        return;
    }

    if(ruleVerifier(ruleContent)){
        $('.applyRuleSyntaxError').hide();
    }else{
        $('.applyRuleSyntaxError').show();
    }

});

// OHS 20180418 - 적용규칙 값이 변경될때 값이 하나도없으면 tokens 초기화처리
onEvent('change', '.apply-rule', function(e) {
	if($(e.currentTarget).val() == '') {
		tokens = PFFormulaEditor.tokenize(''); // 초기화
		$('.apply-rule-desc').val('');
	}
});

function referenceProductCodeFocusEvent(e, $root){

    var $currentTarget = $(e.currentTarget);
    if(!$root) {
        $root = $('.cnd-value-type3-table');
    }

    var productCode = $root.find('.product-code').val();
    var conditionCode = $root.find('.condition-code').val();

    if(!productCode){
        var msg = bxMsg('Z_EmptyInputValue') + ' ['+ bxMsg('DPP0107String1') + ']';
        PFComponent.showMessage(msg, 'warning');
        return;
    }

    if(!conditionCode){
        var msg = bxMsg('Z_EmptyInputValue') + ' ['+ bxMsg('DPP0128String2') + ']';
        PFComponent.showMessage(msg, 'warning');
        return;
    }

    var submitEvent = function(data){

        if(!data) return;

        $currentTarget.val(data.code);

//        var $parent = $currentTarget.parents('.cnd-value-type3');

        $root.find('.refRefCndNm').val(data.name);

        var $listTypeSelect =
            $('<select class="bx-form-item bx-compoenent-small list-type-value list-type" data-form-param="refCndListCd" style="width: 130px; margin-left: 1px;">');
        var $rangeTypeInput =
            $('<input type="text" class="bx-form-item bx-compoenent-small range-type-value range-type removeComma input-align-right" data-form-param="refCndVal" style="width: 130px; margin-left: 1px;">');
        var $rangeType =
            $('<select class="bx-form-item bx-compoenent-small range-type-unit range-type" data-form-param="refCndMsurUtCd" style="width: 130px; margin-left: 3px;">');

        if(data.currentCatalogId != '01' && data.currentCatalogId != '04' && data.currentCatalogId != '05'){
            $rangeTypeInput.addClass('float10');
        }else if(data.currentCatalogId == '02'){
            $rangeTypeInput.addClass('float-range-0');
        }else{
            $rangeTypeInput.addClass('float-range-21');
        }

        if(data.type=='01'){
        	$root.find('.range-type').remove();
        	$root.find('.list-type').remove();
        	$root.find('.ref-condition-column').append($listTypeSelect);
            makeListTypeValue(data, $root);
        }else{
        	$root.find('.range-type').remove();
        	$root.find('.list-type').remove();
        	$root.find('.ref-condition-column').append($rangeTypeInput,$rangeType);
            makeRangeTypeValue(data, $root);
        }

    }
    makeConditionTemplateListSearchPopup(submitEvent, true, {pdCd: productCode, cndCd: conditionCode});
}

function makeRangeTypeValue(data, $selector, value){
    var $unitSelectBox = $selector.find('.range-type-unit');
    switch (data['conditionDetailTypeCode']){
        case '01' :
            renderComboBox('CurrencyCode', $unitSelectBox); // makeEnumComboBox('CurrencyCode', $unitSelectBox);
            $unitSelectBox.attr('data-form-param','refCndCrncyCd');
            break;

        case '02' : // 날짜
            renderComboBox('ProductMeasurementUnitCodeD', $unitSelectBox);
            $unitSelectBox.attr('data-form-param','refCndMsurUtCd');
            break;

        case '03' : // 주기
            renderComboBox('ProductMeasurementUnitCodeF', $unitSelectBox);
            $unitSelectBox.attr('data-form-param','refCndMsurUtCd');
            break;

        case '04' : // 숫자
            renderComboBox('ProductMeasurementUnitCodeN', $unitSelectBox);
            $unitSelectBox.attr('data-form-param','refCndMsurUtCd');
            break;

        case '05' : // 율
                    //var options = [];
                    //$.each(codeArrayObj['ProductMeasurementUnitCodeR'], function(index, code){
                    //    //if(code.code == '11' || code.code == '12'){
                    //        var $option = $('<option>');
                    //        $option.val(code.code);
                    //        $option.text(code.name);
                    //        options.push($option);
                    //    //}
                    //});
                    //$unitSelectBox.html(options);
            renderComboBox('ProductMeasurementUnitCodeR', $unitSelectBox);
            $unitSelectBox.attr('data-form-param','refCndMsurUtCd');
            break;

        default :
            renderComboBox('ProductMeasurementUnitCode', $unitSelectBox); // makeEnumComboBox('ProductMeasurementUnitCode', $unitSelectBox);
            $unitSelectBox.attr('data-form-param','refCndMsurUtCd');
            break;
    }

    if(value){
        $unitSelectBox.val(value);
    }
}

function makeListTypeValue(data, $selector, value){
    var requestParam = {
        conditionCode : data.code,
        conditionTypeCode : data.type,
        tntInstId: selectedTreeItem.tntInstId
    }
    PFRequest.get('/condition/template/getConditionTemplate.json',requestParam, {
        success: function(responseData){
            var options =[];
            $.each(responseData.values, function(index, listItem){
                var $option = $('<option>');
                $option.val(listItem.key);
                $option.text(listItem.value);
                options.push($option);
            });

            $selector.find('.list-type-value').html(options);
            if(value){
                $selector.find('.list-type-value').val(value);
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'CndTemplateService',
            operation: 'queryCndTemplate'
        }
    });

}

function makeEnumComboBox(enumName, $selector){
    var options = [];

    $.each(codeArrayObj[enumName], function(index, code){
        var $option = $('<option>');
        $option.val(code.code);
        $option.text(code.name);
        options.push($option);
    });

    $selector.html(options);
}

function isNotNegativeRangeType(conditionDetailTypeCode){
    if(conditionDetailTypeCode != '01' && conditionDetailTypeCode != '04' && conditionDetailTypeCode != '05'){
        return true;
    }else{
        return false;
    }
}


// 개발과제가 Emergency 일 때
function fnEmergencyControlForProvCnd(flag){


    if(flag) {
        $('.write-btn').prop('disabled', false);
        if(isNewData) {
            $('.prov-cnd-mod-btn').prop('disabled', true);
        } else if($('.prov-cnd-status').val() == '01'){
            $('.prov-cnd-reg-btn').prop('disabled', true);
        } else if($('.prov-cnd-status').val() == '04'){
            $('.prov-cnd-mod-btn').prop('disabled', false);
            $('.prov-cnd-delete-btn').prop('disabled', false);
        }
    }
    else{
        if(isNewData){
            $('.prov-cnd-reg-btn').prop('disabled', false);
        } else if($('.prov-cnd-status').val() == '04'){
            $('.prov-cnd-reg-btn').prop('disabled', false);
            $('.prov-cnd-delete-btn').prop('disabled', true);
            $('.prov-cnd-mod-btn').prop('disabled', false);
        }
    }

}

// 조건속성 설정
function fnSetCndAtrb(){
    var $conditionInfoWrap = $el.find('.pf-cp-condition-info');

    codeArrayObj['CndAttribute'].forEach(function(el){
        if(parent.g_cndAtrb['cndAtrb-'+el.code] && parent.g_cndAtrb['cndAtrb-'+el.code] != 'Y'){
            $conditionInfoWrap.find('.cndAtrb-'+el.code).hide();
        }
    });
}

// 금리 정보  탭
function renderCndValueType3Tab($cndValueType3Wrap, data){

	var varIntCndValueVO = {
			type : '01'
	};

	var interestConditionValue = {
		rateApplyWayCode : '01',
		type : '01',
		varIntCndValueVO : varIntCndValueVO
	};

	if(data){
		if(data.interestConditionValue){
			interestConditionValue = data.interestConditionValue;

			if(!interestConditionValue.rateApplyWayCode){
				interestConditionValue.rateApplyWayCode = '01';
			}

			if(interestConditionValue.varIntCndValueVO){
				varIntCndValueVO = interestConditionValue.varIntCndValueVO;
			}
		}else{
			data.interestConditionValue = interestConditionValue;
		}
	}else{
		data = {
			interestConditionValue : interestConditionValue
		};
	}


	PFUI.use('pfui/tab',function(Tab){

		var children =  [];

		// 고정 or 고정후변동
		if(interestConditionValue.rateApplyWayCode == '01' || interestConditionValue.rateApplyWayCode == '03'){
			children.push({text:bxMsg('fixedInfo'),value:interestConditionValue,index:0}); 			// 고정 정보
		}
		// 변동 or 고정후 변동
		if(interestConditionValue.rateApplyWayCode == '02' || interestConditionValue.rateApplyWayCode == '03'){
			children.push({text:bxMsg('DPS0121_3BString2'),value:interestConditionValue, index:1}); // 변동 정보
		}
		// 타상품참조
		if(interestConditionValue.rateApplyWayCode == '04'){
			children.push({text:bxMsg('refInfo'),value:interestConditionValue, index:2}); // 참조 정보
		}

		$cndValueType3Wrap.find('#cnd-value-type3-tab').empty();
		$cndValueType3Wrap.find('#cnd-value-type3-tab-conts #fixed-info-panel').empty();
		$cndValueType3Wrap.find('#cnd-value-type3-tab-conts #var-info-panel').empty();
		$cndValueType3Wrap.find('#cnd-value-type3-tab-conts #ref-info-panel').empty();

        var tab = new Tab.Tab({
            render : $cndValueType3Wrap.find('#cnd-value-type3-tab'),
            elCls : 'nav-tabs',
            autoRender: true,
            children:children
        });

        tab.on('selectedchange',function (ev) {
            var item = ev.item;

            if(item.get('index') == 0){
            	$cndValueType3Wrap.find('#fixed-info-panel').show();
            	$cndValueType3Wrap.find('#var-info-panel').hide();
            	$cndValueType3Wrap.find('#ref-info-panel').hide();

            	if(!$cndValueType3Wrap.find('#fixed-info-panel').html()){
                    $cndValueType3Wrap.find('#fixed-info-panel').html(cndValueType3FixedInfoTpl(interestConditionValue));

                    renderComboBox('InterestTypeCode', $('.fixed-info .InterestTypeCode'), (interestConditionValue.type) ? interestConditionValue.type : ''); // 금리데이터유형코드
                	renderComboBox('BaseIntRtKndCode', $('.fixed-info .BaseIntRtKndCode'), (interestConditionValue.baseRateCode) ? interestConditionValue.baseRateCode : ''); // 기준금리종류
                	renderComboBox('BaseIntRtAplyTmCode', $('.fixed-info .BaseIntRtAplyTmCode'), (interestConditionValue.baseIntRtAplyTmCd) ? interestConditionValue.baseIntRtAplyTmCd : ''); // 기준금리적용시점코드
                	renderComboBox('SprdAplyFormulaCode', $('.fixed-info .SprdAplyFormulaCode'), (interestConditionValue.sprdAplyFormulaCd) ? interestConditionValue.sprdAplyFormulaCd : '', true); // 스프레드적용산식
                	renderComboBox('RefTrmAplyDscd', $('.fixed-info .RefTrmAplyDscdEnum'), (interestConditionValue.refTrmAplyDscd) ? interestConditionValue.refTrmAplyDscd : ''); // 참조기간적용구분코드
                	renderComboBox('RefTrmMsurUtCode', $('.fixed-info .RefTrmMsurUtCode'), (interestConditionValue.refTrmMsurUtCd) ? interestConditionValue.refTrmMsurUtCd : ''); // 측정단위
                	renderComboBox('BaseIntRateDataTpDscd', $('.fixed-info .baseIntRateDataTpDscd'), (interestConditionValue.baseIntRateDataTpDscd) ? interestConditionValue.baseIntRateDataTpDscd : '01');

                	// 고정일 때
                	if(interestConditionValue.rateApplyWayCode == '01'){
                		$cndValueType3Wrap.find('.fixed-info .fix-irt-tr').hide();		// 고정정보 > 최초고정금리적용기간수
                	}
                	// 고정후변동일 때
                	else{
                		$cndValueType3Wrap.find('.fixed-info .fix-irt-tr').show();		// 고정정보 > 최초고정금리적용기간수
                		renderComboBox('FrstFixIRtAplyTrmDscd',$('.fixed-info .frstFixIrtAplyTrmDscd'),(interestConditionValue.frstFixIrtAplyTrmDscd) ? interestConditionValue.frstFixIrtAplyTrmDscd : '');
                		renderComboBox('FixTrmDataTpDscd', $('.fixed-info .fix-irt-tr .fixTrmDataTpDscd'), (interestConditionValue.fixTrmDataTpDscd) ? interestConditionValue.fixTrmDataTpDscd : '01');
                	}

                	setInterestCombobox(data, $cndValueType3Wrap.find('#fixed-info-panel'));
                	setFixTrmDataTpDscd($cndValueType3Wrap.find('.fixed-info  .fix-irt-tr'), (interestConditionValue.fixTrmDataTpDscd) ? interestConditionValue.fixTrmDataTpDscd : '01');
                	setBaseIntRateDataTpDscd($cndValueType3Wrap.find('.fixed-info'), (interestConditionValue.baseIntRateDataTpDscd) ? interestConditionValue.baseIntRateDataTpDscd : '01');

                	if(interestConditionValue.refPdCd){
                		bindPdNameByPdInfoDscd($cndValueType3Wrap.find('.fixed-info .product-code'), $cndValueType3Wrap.find('.fixed-info .product-name'), pdInfoDscd);
                    }

                    if(interestConditionValue.refCndCd){
                    	if($cndValueType3Wrap.find('.fixed-info .base-interest-type-wrap .refCndCd').val() != ''){
                    		bindConditionName($cndValueType3Wrap.find('.fixed-info .base-interest-type-wrap .refCndCd'), $cndValueType3Wrap.find('.fixed-info .base-interest-type-wrap .refCndNm'));
                    	}

                    	if($cndValueType3Wrap.find('.fixed-info .interest-link-info-wrap .refCndCd').val() != ''){
                    		bindConditionName($cndValueType3Wrap.find('.fixed-info .interest-link-info-wrap .refCndCd'), $cndValueType3Wrap.find('.fixed-info .interest-link-info-wrap .refCndNm'));
                    	}
                    }

                    if(interestConditionValue.refRefCndCd){
                        bindConditionName($cndValueType3Wrap.find('.fixed-info .refRefCndCd'), $cndValueType3Wrap.find('.fixed-info .refRefCndNm'));
                    }

                    if(interestConditionValue.fixTrmRefCndCd){
                        bindConditionName($cndValueType3Wrap.find('.fixed-info .fixTrmRefCndCd'), $cndValueType3Wrap.find('.fixed-info .fixTrmRefCndNm'));
                    }

            	}
            }
            else if(item.get('index') == 1){
            	$cndValueType3Wrap.find('#fixed-info-panel').hide();
            	$cndValueType3Wrap.find('#var-info-panel').show();
            	$cndValueType3Wrap.find('#ref-info-panel').hide();

                if(!$cndValueType3Wrap.find('#var-info-panel').html()){

                	// 변동 -> 변동영역 set
            		if(interestConditionValue.rateApplyWayCode == '02'){
            			$cndValueType3Wrap.find('#var-info-panel').html(cndValueType3VarInfoTpl(interestConditionValue));
            			renderComboBox('InterestTypeCode', $('.var-info .InterestTypeCode'), (interestConditionValue.type) ? interestConditionValue.type : ''); // 금리데이터유형코드
                        renderComboBox('InterestSegmentTypeCode', $('.var-info .InterestSegmentTypeCode'), (interestConditionValue.rateSegmentType) ? interestConditionValue.rateSegmentType : ''); // 변동정보 적용방식
                        renderComboBox('VarIntRtCyclCalcnBaseCode', $('.var-info .VarIntRtCyclCalcnBaseCode'), (interestConditionValue.varIntRtCyclCalcnBaseCd) ? interestConditionValue.varIntRtCyclCalcnBaseCd : ''); // 변동주기 산정기준
                        renderComboBox('BaseIntRtKndCode', $('.var-info .BaseIntRtKndCode'), (interestConditionValue.baseRateCode) ? interestConditionValue.baseRateCode : ''); // 기준금리종류
                        renderComboBox('BaseIntRtAplyTmCode', $('.var-info .BaseIntRtAplyTmCode'), (interestConditionValue.baseIntRtAplyTmCd) ? interestConditionValue.baseIntRtAplyTmCd : ''); // 기준금리적용시점코드
                        renderComboBox('SprdAplyFormulaCode', $('.var-info .SprdAplyFormulaCode'), (interestConditionValue.sprdAplyFormulaCd) ? interestConditionValue.sprdAplyFormulaCd : '', true); // 스프레드적용산식
                        renderComboBox('RefTrmAplyDscd', $('.var-info .RefTrmAplyDscdEnum'), (interestConditionValue.refTrmAplyDscd) ? interestConditionValue.refTrmAplyDscd : ''); // 참조기간적용구분코드
                        renderComboBox('RefTrmMsurUtCode', $('.var-info .RefTrmMsurUtCode'), (interestConditionValue.refTrmMsurUtCd) ? interestConditionValue.refTrmMsurUtCd : ''); // 측정단위
                        renderComboBox('BaseIntRateDataTpDscd', $('.var-info .baseIntRateDataTpDscd'), (interestConditionValue.baseIntRateDataTpDscd) ? interestConditionValue.baseIntRateDataTpDscd : '01');
                        setInterestCombobox(data, $cndValueType3Wrap.find('#var-info-panel'));
                    	setBaseIntRateDataTpDscd($cndValueType3Wrap.find('.var-info'), (interestConditionValue.baseIntRateDataTpDscd) ? interestConditionValue.baseIntRateDataTpDscd : '01');

                        // 변동주기참조조건코드 네이밍
                        if(interestConditionValue.varFrqRefCndCd){
                            bindConditionName($cndValueType3Wrap.find('.var-info .varFrqRefCndCd'), $cndValueType3Wrap.find('.var-info .varFrqRefCndNm'));
                        }

                        if(interestConditionValue.refPdCd){
                        	bindPdNameByPdInfoDscd($cndValueType3Wrap.find('.var-info .product-code'), $cndValueType3Wrap.find('.var-info .product-name'), pdInfoDscd);
                        }

                        if(interestConditionValue.refCndCd){
                        	if($cndValueType3Wrap.find('.var-info .base-interest-type-wrap .refCndCd').val() != ''){
                        		bindConditionName($cndValueType3Wrap.find('.var-info .base-interest-type-wrap .refCndCd'), $cndValueType3Wrap.find('.var-info .base-interest-type-wrap .refCndNm'));
                        	}

                        	if($cndValueType3Wrap.find('.var-info .interest-link-info-wrap .refCndCd').val() != ''){
                        		bindConditionName($cndValueType3Wrap.find('.var-info .interest-link-info-wrap .refCndCd'), $cndValueType3Wrap.find('.var-info .interest-link-info-wrap .refCndNm'));
                        	}
                        }

                        if(interestConditionValue.refRefCndCd){
                            bindConditionName($cndValueType3Wrap.find('.var-info .refRefCndCd'), $cndValueType3Wrap.find('.var-info .refRefCndNm'));
                        }
            		}
            		// 고정후변동  -> 변동영역 set
            		if(interestConditionValue.rateApplyWayCode == '03'){
            			$cndValueType3Wrap.find('#var-info-panel').html(cndValueType3VarInfoTpl(varIntCndValueVO));
            			renderComboBox('InterestTypeCode', $('.var-info .InterestTypeCode'), (varIntCndValueVO.type) ? varIntCndValueVO.type : ''); // 금리데이터유형코드
                        renderComboBox('InterestSegmentTypeCode', $('.var-info .InterestSegmentTypeCode'), (varIntCndValueVO.rateSegmentType) ? varIntCndValueVO.rateSegmentType : ''); // 변동정보 적용방식
                        renderComboBox('VarIntRtCyclCalcnBaseCode', $('.var-info .VarIntRtCyclCalcnBaseCode'), (varIntCndValueVO.varIntRtCyclCalcnBaseCd) ? varIntCndValueVO.varIntRtCyclCalcnBaseCd : ''); // 변동주기 산정기준
                        renderComboBox('BaseIntRtKndCode', $('.var-info .BaseIntRtKndCode'), (varIntCndValueVO.baseRateCode) ? varIntCndValueVO.baseRateCode : ''); // 기준금리종류
                        renderComboBox('BaseIntRtAplyTmCode', $('.var-info .BaseIntRtAplyTmCode'), (varIntCndValueVO.baseIntRtAplyTmCd) ? varIntCndValueVO.baseIntRtAplyTmCd : ''); // 기준금리적용시점코드
                        renderComboBox('SprdAplyFormulaCode', $('.var-info .SprdAplyFormulaCode'), (varIntCndValueVO.sprdAplyFormulaCd) ? varIntCndValueVO.sprdAplyFormulaCd : '', true); // 스프레드적용산식
                        renderComboBox('RefTrmAplyDscd', $('.var-info .RefTrmAplyDscdEnum'), (varIntCndValueVO.refTrmAplyDscd) ? varIntCndValueVO.refTrmAplyDscd : ''); // 참조기간적용구분코드
                        renderComboBox('RefTrmMsurUtCode', $('.var-info .RefTrmMsurUtCode'), (varIntCndValueVO.refTrmMsurUtCd) ? varIntCndValueVO.refTrmMsurUtCd : ''); // 측정단위
                        renderComboBox('BaseIntRateDataTpDscd', $('.var-info .baseIntRateDataTpDscd'), (varIntCndValueVO.baseIntRateDataTpDscd) ? varIntCndValueVO.baseIntRateDataTpDscd : '01');
                        setInterestCombobox(data, $cndValueType3Wrap.find('#var-info-panel'), varIntCndValueVO);
                        setBaseIntRateDataTpDscd($cndValueType3Wrap.find('.var-info'), (varIntCndValueVO.baseIntRateDataTpDscd) ? varIntCndValueVO.baseIntRateDataTpDscd : '01');

                        // 변동주기참조조건코드 네이밍
                        if(varIntCndValueVO.varFrqRefCndCd){
                            bindConditionName($cndValueType3Wrap.find('.var-info .varFrqRefCndCd'), $cndValueType3Wrap.find('.var-info .varFrqRefCndNm'));
                        }

                        if(varIntCndValueVO.refPdCd){
                        	bindPdNameByPdInfoDscd($cndValueType3Wrap.find('.var-info .product-code'), $cndValueType3Wrap.find('.var-info .product-name'), pdInfoDscd);
                        }

                        if(varIntCndValueVO.refCndCd){
                            if($cndValueType3Wrap.find('.var-info .base-interest-type-wrap .refCndCd').val() != ''){
                        		bindConditionName($cndValueType3Wrap.find('.var-info .base-interest-type-wrap .refCndCd'), $cndValueType3Wrap.find('.var-info .base-interest-type-wrap .refCndNm'));
                        	}

                        	if($cndValueType3Wrap.find('.var-info .interest-link-info-wrap .refCndCd').val() != ''){
                        		bindConditionName($cndValueType3Wrap.find('.var-info .interest-link-info-wrap .refCndCd'), $cndValueType3Wrap.find('.var-info .interest-link-info-wrap .refCndNm'));
                        	}
                        }

                        if(varIntCndValueVO.refRefCndCd){
                            bindConditionName($cndValueType3Wrap.find('.var-info .refRefCndCd'), $cndValueType3Wrap.find('.var-info .refRefCndNm'));
                        }
            		}

            		setInterestSegmentTypeCombobox($cndValueType3Wrap);
                }

            }else if(item.get('index') == 2){
            	$cndValueType3Wrap.find('#fixed-info-panel').hide();
            	$cndValueType3Wrap.find('#var-info-panel').hide();
            	$cndValueType3Wrap.find('#ref-info-panel').show();

                if(!$('#ref-info-panel').html()){
                	$cndValueType3Wrap.find('#ref-info-panel').html(cndValueType3RefInfoTpl(interestConditionValue));
                	renderComboBox('InterestTypeCode', $('.ref-info .InterestTypeCode'), (interestConditionValue.type) ? interestConditionValue.type : '03'); // 금리데이터유형코드
                	$cndValueType3Wrap.find('.ref-info .InterestTypeCode').prop('disabled', true);            // 금리데이터유형코드 disabled
                }
            }
        });

        tab.setSelected(tab.getItemAt(0));

    });
}

function setTokens(value) {
	//OHS 20180416 추가 - 계산영역처럼 적용함
	var operatorSet = new Set();
	operatorSet.add('min');
	operatorSet.add('max');
	operatorSet.add('avg');
	operatorSet.add('sum');
	operatorSet.add('and');
	operatorSet.add('or');
	operatorSet.add('not');
	operatorSet.add('priority');
	operatorSet.add('match');

	var s = value != '' ? value.toLowerCase() : '';
	var type;

	if (operatorSet.has(s)) { // function
	  type = TokenType.FUNCTION;

	} else if (s === "(") {
	  type = TokenType.OPEN_BRACKET;

	} else if (s === ")") {
	  type = TokenType.CLOSE_BRACKET;

	} else if (s === ",") {
	  type = TokenType.COMMA;

	} else if (s === "+" || s === "-" || s === "*" || s === "/") {
	  type = TokenType.ARITHMETIC;
	} else {
	  type = TokenType.NUMBER;
	}
	s = s.toUpperCase();
	tokens.push({
	  type: type,
	  value: s
	});
}

