/**
 * Created by 진 on 2016-10-13.
 */
var selectedTreeItem, selectedCondition;

var feeDiscountHistoryDetailTpl;
if(pdInfoDscd === pdInfoDscd_Product) {
  const getProductTemplate = function(template) {
    var tpl = $.ajax({
      url: "/configurator/product/tpl/" + template + ".html",
      async: false,
      dataType: "html"
    }).responseText;
    return Handlebars.compile(tpl);
  };
	feeDiscountHistoryDetailTpl = getProductTemplate('benefit/feeDiscountHistoryDetailTpl');
}

//수수료할인통합용 변수
var classForEvent;

var benefitTokens;
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

/******************************************************************************************************************
 * 수수료 할인 팝업 START
 ******************************************************************************************************************/
var popupModifyFlag;
function renderCnd4FeePopup(data, isReadOnlyPopup) {
    cpl4feePopupGrid = null;
    cnd4feePopupGrid = null;
    limitConditionInfoGrid = null;
    deleteConditionList = [];
    isReadOnly = isReadOnlyPopup;
    popupModifyFlag = false;

    var formData ={};

    function setFormData(){
        formData = PFComponent.makeYGForm($('.add-cnd4-fee-tpl-popup .fee-discount .bx-info-table')).getData();

        var self = this;

        $.extend(true, formData, detailRequestParam);

        formData.feeRateAmountDistinctionCode = $('.add-cnd4-fee-tpl-popup .fee-discount .bx-info-table').find('input[name=cnd4-fee-radio]:checked').val();

        formData.productBenefitProvidedConditonList = [];

        // 일반조건
        if (formData.feeDiscountStructure == '01') {
            formData.complexConditionYn = 'N';
        }
        // 복합조건 그리드
        else if (formData.feeDiscountStructure == '02') {

            formData.complexConditionYn = 'Y';
            formData.complexCndTitleInformationList = cpl4feePopupGridTitleDataArr;

            //layerCalcType should be 02 when conditionClassifyCode is 02
            //formData.layerCalcType = '02';

            cpl4feePopupGridTitleDataArr.forEach(function (el) {
                el.titleConditionGroupTemplateCode = formData.conditionGroupTemplateCode;
            });

            var titleIndexMap = cpl4feePopupGridTitleDataArr.filter(function(v) {
              return v.titleConditionTypeCode === "01";
            }).reduce(function(m, v, i) {
              m[v.titleConditionCode] = i;
              return m;
            }, {});

            var complexGridData = cpl4feePopupGrid.getAllData();

            // OHS20180315 추가 - 구성조건그리드의 값을 하나도 설정하지 않았을경우 오류
            if(complexGridData && complexGridData.length == 0) {
            	return 'error_case_01';
            }

            var dontSave = false;

            formData.complexCndMatrix = [];

            var tierNumber = 1;
            complexGridData.forEach(function (el) {
              var listCodes = Object.keys(el).reduce(function(l, key) {
                if (key.endsWith(".code")) {
                  l.push(el[key]);
                }
                return l;
              }, []);
              nestedFor(listCodes, function(values) {
                var complexCndMatrixDataObj = {};
                complexCndMatrixDataObj.pdFeeDiscountDetail = el.y;
                complexCndMatrixDataObj.tierNumber = tierNumber++;

                complexCndMatrixDataObj.x = [];

                $.each(el, function (prop, value) {
                    var propNm = prop.split('.');

                    if (prop == 'y') {
                        complexCndMatrixDataObj.pdFeeDiscountDetail = value;

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
                            return dontSave;
                        }
                        else if (value.listConditionValue && value.listConditionValue.defineValues.length === 1
                            && value.listConditionValue.defineValues[0].code === "") {
                          dontSave = true;
                          return dontSave;
                        }
                        complexCndMatrixDataObj.x.push(value);
                    }
                });

                if (!el.y) {
                    dontSave = true;
                    return dontSave;
                }

                formData.complexCndMatrix.push(complexCndMatrixDataObj);
              });
            });
        }
        if(data){
            formData.tntInstId = data.tntInstId;
            formData.pdInfoDscd = data.pdInfoDscd;
        }else{
            formData.tntInstId = selectedTreeItem ? selectedTreeItem.tntInstId : selectedCondition.tntInstId;
            formData.pdInfoDscd = pdInfoDscd;
        }

        if (!formData.feeDiscountAmount){
            formData.feeDiscountAmount = 0;
        }

        return dontSave;
    }

    // OHS 20180315 추가 - 수수료 율일경우 최소값,최대값 체크로직 추가
    var _checkFeeMinMaxValue = function(formData) {
    	var checkResult = '';
    	if(formData) {
    		// 일반조건
            if (formData.feeDiscountStructure == '01') {
            	// 율 체크
            	if(formData.feeRateAmountDistinctionCode == '01') {
            		var minValue = parseFloat($('.add-cnd4-fee-tpl-popup').find('input[data-form-param="feeDiscountMinAmount"]').val());
            		var maxValue = parseFloat($('.add-cnd4-fee-tpl-popup').find('input[data-form-param="feeDiscountMaxAmount"]').val());
            		if(minValue < 0 || maxValue < 0) {
            			checkResult = 'ERROR_CASE_2';
            		}
            		if (minValue > maxValue) {
            			checkResult = 'ERROR_CASE_1';
            		}
            	}
            }
            // 복합조건 그리드
            else if (formData.feeDiscountStructure == '02') {

            	if(formData.complexCndMatrix && formData.complexCndMatrix.length > 0) {
            		formData.complexCndMatrix.forEach(function (value) {
            			if(value.feeRateAmountDistinctionCode == '01') {
                    		var minValue = parseFloat(value.feeDiscountMinimumAmount ? value.feeDiscountMinimumAmount : 0);
                    		var maxValue = parseFloat(value.feeDiscountMaximumAmount ? value.feeDiscountMaximumAmount : 0);
                    		if(minValue < 0 || maxValue < 0) {
                    			checkResult = 'ERROR_CASE_2';
                    		}
                    		if (minValue > maxValue) {
                    			checkResult = 'ERROR_CASE_1';
                    		}
                    	}
	                });
            	}
            }
    	}
    	return checkResult;
    }

    var buttons = [];
    if(!isReadOnly) {
        buttons = [
            // 등록버튼
            {
                text: bxMsg('registration'),
                elCls: 'button button-primary fee-discount-save-btn write-btn',
                handler: function () {

                    if (!isHaveProject()) {
                        haveNotTask();
                        return;
                    }
                    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
                    if (isNotMyTask(projectId)) {
                        return;
                    }

                    var dontSave = setFormData();

                    // OHS20180315 에러케이스1 : 복합조건은 반드시 한건 이상의 계층이 존재해야합니다 추가
                    if (dontSave == 'error_case_01') {
                    	PFComponent.showMessage(bxMsg('DPS0129Error5'), 'warning');
                        return;
                    }
                    else if(dontSave) {
                    	PFComponent.showMessage(bxMsg('DPS0128Error4'), 'warning');
                    	return;
                    }

                    formData.projectId = projectId;
                    formData.feeDiscountStatusCode = '01';  // 등록일때는 01.수정가능상태로 생성

                    if(data){
                        // 활동중, 적용시작일자를 변경하지 않은 경우
                        if(data.feeDiscountStatusCode == '04' && data.applyStartDate == formData.applyStartDate){
                            PFComponent.showMessage(bxMsg('DPS0126Error1'), 'warning'); // 적용시작일은 미래일자로만 입력가능합니다
                            return;
                        }

                        // 수정가능
                        if(data.feeDiscountStatusCode == '01'){
                            PFComponent.showMessage(bxMsg('dontCreateEditableType'), 'warning'); // 수정가능 상태인 경우 등록할 수 없습니다.
                            return;
                        }
                    }

                    var checkResult = _checkFeeMinMaxValue(formData); // OHS 20180315 추가 - 값에 대한 체크를 하기위함
                    // 에러케이스1 [최소값 > 최대값]
                    if(checkResult == 'ERROR_CASE_1') {
                    	PFComponent.showMessage(bxMsg('DPJ0125Error1'), 'warning'); // 입력형식은 최소값 <= 최대값 형식이어야 합니다
                    	return;
                    }
                    // 에러케이스2 [최소값 < 0 or 최대값 < 0]
                    else if(checkResult == 'ERROR_CASE_2') {
                    	PFComponent.showMessage(bxMsg('MinMaxGreaterThanZero'), 'warning'); // 최소수수료, 최대수수료값은 0보다 커야합니다.
                    	return;
                    }

                    if(!popupModifyFlag){
                		// 변경된 정보가 없습니다.
                		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
                		return;
                	}

                    PFRequest.post('/product_condition/createProductConditionFeeDiscount.json', formData, {
                        success: function (responseData) {
                            if (responseData) {
                                PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                                popupModifyFlag = false;

                                renderConditionType4_2GridPage(formData);

                                data = formData; // OHS 20180412 수정 - 무조건 fromData -> data 로 처리하고 시작. (상태관련된 수정,삭제 오류 처리)
                                if(!data.feeDiscountSequenceNumber) {
                                    data.feeDiscountSequenceNumber = responseData.feeDiscountSequenceNumber;
                                    $('.add-cnd4-fee-tpl-popup .fee-discount .bx-info-table').find('.feeDiscountSequenceNumber').val(responseData.feeDiscountSequenceNumber); // 할인일련번호 바인딩 추가
                                    $('.add-cnd4-fee-tpl-popup .fee-discount .bx-info-table').find('.feeDiscountStatusCode').val(responseData.feeDiscountStatusCode);
                                }

                                // OHS20180412 추가 - 등록후 결과값에 복합조건여부이고 복합구조ID가 있으면 새로 갱신하여 값을 세팅한다.
                                if(responseData && responseData.complexConditionYn == 'Y' && responseData.complexStructureId != '') {
                                	data.complexStructureId = responseData.complexStructureId;
                                	$('.add-cnd4-fee-tpl-popup .fee-discount .bx-info-table').find('.complexStructureId').val(responseData.complexStructureId);
                                }

                                // 2017.01.18 할인상태구분코드 바인딩 추가
                                $('.add-cnd4-fee-tpl-popup .fee-discount .bx-info-table').find('.feeDiscountStatusCode').val(responseData.feeDiscountStatusCode);

                                // OHS 20180312 추가 - 등록성공 후 팝업 버튼 재배치
                                $('.fee-discount-save-btn').show();
                                $('.fee-discount-update-btn').show();
                                $('.fee-discount-delete-btn').show();

                                if( getSelectedProjectId()!='' && isEmergency(getSelectedProjectId()) ){
                                    fnEmergencyControlForCpl4FeePopup(true);
                                }
                                else{
                                    fnEmergencyControlForCpl4FeePopup(false);
                                }
                                // End

                                // OHS 2017.03.20 등록한상태일경우 제공조건, 한도조건 disabled 해제
                                // disabled true 상태일경우 해당 탭의 opacity 조정
                                if($('.add-cnd4-fee-tpl-popup').find('.nav-tabs').find('li') && $('.add-cnd4-fee-tpl-popup').find('.nav-tabs').find('li').length > 0) {
                                	$.each($('.add-cnd4-fee-tpl-popup').find('.nav-tabs').find('li'), function(idx, value) {
                                		if((idx == 1 || idx == 2) && innerTab) {
                                			innerTab.getItemAt(idx).set('disabled', false);
                                			$(value).css('opacity', '100');
                                		}
                                	});
                                }
                            }
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'PdCndFeeDiscountService',
                            operation: 'createPdCndFeeDiscount'
                        }
                    });
                }},
            // 수정버튼
            {text:bxMsg('modify'), elCls:'button button-primary fee-discount-update-btn write-btn', handler:function() {

                if (!isHaveProject()) {
                    haveNotTask();
                    return;
                }
                var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
                if (isNotMyTask(projectId)) {
                    return;
                }

                var dontSave = setFormData();

                // OHS20180315 에러케이스1 : 복합조건은 반드시 한건 이상의 계층이 존재해야합니다 추가
                if (dontSave == 'error_case_01') {
                	PFComponent.showMessage(bxMsg('DPS0129Error5'), 'warning');
                    return;
                }
                else if (dontSave) {
                  PFComponent.showMessage(bxMsg('DPS0128Error4'), 'warning');
                  return;
                }

                // 긴급도 아니고 활동중이면
                if ((getSelectedProjectId() == '' || !isEmergency(getSelectedProjectId())) &&
                    (getSelectedProjectId() == '' || !isUpdateStatus(getSelectedProjectId())) &&
                    (data.feeDiscountStatusCode == '04' && data.applyStartDate != formData.applyStartDate)) {

                    PFComponent.showMessage(bxMsg('dontUpdateSellableType'), 'warning');    // 활동 상태인 경우 수정할 수 없습니다. 미래 날짜로 등록 해야합니다.
                    return;
                }

                formData.projectId = projectId;
                formData.beforeApplyStartDate = data.applyStartDate;

                var checkResult = _checkFeeMinMaxValue(formData); // OHS 20180315 추가 - 값에 대한 체크를 하기위함
                // 에러케이스1 [최소값 > 최대값]
                if(checkResult == 'ERROR_CASE_1') {
                	PFComponent.showMessage(bxMsg('DPJ0125Error1'), 'warning'); // 입력형식은 최소값 <= 최대값 형식이어야 합니다
                	return;
                }
                // 에러케이스2 [최소값 < 0 or 최대값 < 0]
                else if(checkResult == 'ERROR_CASE_2') {
                	PFComponent.showMessage(bxMsg('MinMaxGreaterThanZero'), 'warning'); // 최소수수료, 최대수수료값은 0보다 커야합니다.
                	return;
                }

                if(!popupModifyFlag){
            		// 변경된 정보가 없습니다.
            		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
            		return;
            	}

                PFRequest.post('/product_condition/updateProductConditionFeeDiscount.json', formData, {
                    success: function (responseData) {
                        if (responseData) {
                            PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                            popupModifyFlag = false;

                            renderConditionType4_2GridPage(formData);

                            if (!data) {
                                data = {};
                            }
                            data = formData;
                        }
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'PdCndFeeDiscountService',
                        operation: 'updatePdCndFeeDiscount'
                    }
                });
            }
            }
        ];
    }

    var elStyle = 'display:none';
    if (data && !isReadOnly) {
    	elStyle = 'display:inline-block';
    }

    // 삭제 버튼
    buttons.push({text:bxMsg('ButtonBottomString2'), elCls:'button button-primary fee-discount-delete-btn write-btn', elStyle:elStyle, handler:function(){

        if(!isHaveProject()){
            haveNotTask();
            return;
        }
        var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
        if(isNotMyTask(projectId)){
            return;
        };

        // 긴급도 아니고 활동중이면
        if( (getSelectedProjectId()=='' || !isEmergency(getSelectedProjectId())) &&
            (getSelectedProjectId()=='' || !isUpdateStatus(getSelectedProjectId())) &&
            (data.feeDiscountStatusCode == '04') ){

            PFComponent.showMessage(bxMsg('dontDeleteActiveTypeConditionTemplate'), 'warning'); // 활동 상태일 경우 삭제할 수 없습니다.
            return;
        }

        var that = this;
        var requestParam = {
            "conditionGroupTemplateCode": data.conditionGroupTemplateCode,
            "conditionGroupCode": data.conditionGroupCode,
            "conditionCode": data.conditionCode,
            "feeDiscountSequenceNumber": data.feeDiscountSequenceNumber,
            "applyStartDate": data.applyStartDate,
            "projectId" : projectId,
            "tntInstId" : data.tntInstId,
            "ruleApplyTargetDistinctionCode" : '02'// OHS 20180508 추가 - 삭제시에 적용규칙에 존재여부 체크를 위함
        };
        PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), function() {

            PFRequest.post('/product_condition/deleteProductConditionFeeDiscount.json', requestParam, {
                success: function(){
                    PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');
                    renderConditionType4_2GridPage(requestParam);
                    //record.destroy();
                    that.close();

                },
                bxmHeader: {
                    application: 'PF_Factory',
                    service: 'PdCndFeeDiscountService',
                    operation: 'deletePdCndFeeDiscount'
                }
            });

        }, function() {
            return;
        });
    }});

    buttons.push({text:bxMsg('ContextMenu_Close'), elCls:'button button-primary', handler:function(){
    	benefitTokens = PFFormulaEditor.tokenize(''); // 초기화
        this.close();
    }});

    var title;

    if(isReadOnly){
        title = bxMsg('FeeDiscountInfoMgmt');        // 수수료할인정보관리
    }else {
        title = bxMsg('NewFeeDiscountPopup');        // 수수료할인 신규 팝업
    }

    //적용규칙 도움말 포커스아웃 처리를 할때 HELP 영역을 클릭하였을경우 사라지지않도록 처리하기위함
    var isHelpAreaClick = false;
    var innerTab;
    PFComponent.makePopup({
        title: title,
        width: 700,
        height: 650,
        contents: cnd4FeePopupTpl(data),
        buttons: buttons,
        modifyFlag : isReadOnly ? 'readonly' : 'popup',
        contentsEvent: {
            'blur .start-date': function(e){
                PFUtil.checkDate(e.target);
            },
            'blur .end-date': function(e){
                PFUtil.checkDate(e.target, '9999-12-31 23:59:59');
            },
            // 수수료할인구조 change (일반조건/복합조건)
            'change .feeDiscountStructure': function(e) {
                if ($(e.currentTarget).val() == '01') { // 일반 선택 시

                	$('.add-cnd4-fee-tpl-popup').find('.cnd4-fee-amount').prop('checked', true);
                    $('.add-cnd4-fee-tpl-popup .fee-dis-com').show();           // 일반조건 활성
                    $('.add-cnd4-fee-tpl-popup .fee-dis-com-amt').show();       // 일반조건>금액 활성
                    $('.add-cnd4-fee-tpl-popup .fee-dis-com-rate').hide();      // 일반조건>율 숨김
                    $('.add-cnd4-fee-tpl-popup .fee-dis-cpl').hide();           // 복합조건 숨김

                } else if ($(e.currentTarget).val() == '02') {  // 복합

                    $('.add-cnd4-fee-tpl-popup .fee-dis-com').hide();           // 일반조건 숨김
                    $('.add-cnd4-fee-tpl-popup .fee-dis-com-amt').hide();       // 일반조건>금액 숨김
                    $('.add-cnd4-fee-tpl-popup .fee-dis-com-rate').hide();      // 일반조건>율 숨김
                    $('.add-cnd4-fee-tpl-popup .fee-dis-cpl').show();           // 복합조건 활성

                    // 복합조건그리드
                    if(!cpl4feePopupGrid) {
                        var title = [];
                        var complexConditionList = [];
                        if (data && data.complexConditionYn == 'Y') {
                            title = data.title;
                            complexConditionList = data.complexConditionList;
                        }
                        renderCpl4FeePopupGrid(title, complexConditionList);   // title과 data를 넘겨줘야함.
                    }
                }
            },

            // 수수료할인유형 click
            'click input[name=cnd4-fee-radio]': function(e) {
                if ($(e.currentTarget).val() == '02') {         // 금액 선택 시

                    $('.add-cnd4-fee-tpl-popup .fee-dis-com-amt').show();       // 일반조건>금액 활성
                    $('.add-cnd4-fee-tpl-popup .fee-dis-com-rate').hide();      // 일반조건>율 숨김


                } else if ($(e.currentTarget).val() == '01') {  // 율 선택시

                    $('.add-cnd4-fee-tpl-popup .fee-dis-com-amt').hide();       // 일반조건>금액 숨김
                    $('.add-cnd4-fee-tpl-popup .fee-dis-com-rate').show();      // 율 활성

                }
            },

            // 제공조건탭 > 그리드 위 추가버튼 클릭
            'click .add-fee-discount-condition': function(e) {

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
            },

            // 한도조건탭 > 그리드 위 추가버튼 클릭
            'click .add-fee-limit-condition': function(e) {

                var submitEvent = function(selectedData) {

                    var data = selectedData[0];

                    data['applyStartDate'] = PFUtil.getNextDate() + ' 00:00:00';
                    data['applyEndDate'] = '9999-12-31 23:59:59';
                    data['process'] = 'C';
                    data['cndDscd'] = '02';

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

                    renderLimitCndPopup(data);
                    modifyFlag = true;
                };

                renderCndPopup(submitEvent, true);
            },

            // 복합조건 구성조건설정 팝업 (조건선택)
            'click .fee-dis-column-setting-btn': function(e) {
                //renderFeeDiscountColumnSettingPopup();
            	renderFeeDiscountColumnSettingPopup(data); // OHS20180315 data 파라미터 추가 - data is not defined 스크립트 오류처리를 위함
            },

            // 복합조건 추가 버튼 클릭
            'click .fee-dis-complex-add-btn': function(e) {
                if (cpl4feePopupGridTitleDataArr.length === 0)  {
                    PFComponent.showMessage(bxMsg('complexHeaderSetMsg'), 'warning');
                    return;
                }

                var tempObj = {},
                    tempArr = [];

                $.each(cpl4feePopupGridTitleDataObj, function(prop, val) {
                    tempObj[prop] = {};
                });

                tempArr.push(tempObj);

                modifyFlag = true;
                cpl4feePopupGrid.addData(tempArr);
            },

            'click .fee-dis-complex-verify-btn': function(e) {
                var dontSave = setFormData();
                if (dontSave) {
                  PFComponent.showMessage(bxMsg('DPS0128Error4'), 'warning');
                  return;
                }

                formData.conditionTypeCode = "04"; // 수수료
                formData.complexConditionMatrix = formData.complexCndMatrix;
                formData.complexConditionTitleInfoList = formData.complexCndTitleInformationList;
                delete formData.complexCndMatrix;
                delete formData.complexCndTitleInformationList;
                formData.complexConditionMatrix.forEach(function(v) {
                  v.feeConditionValue = v.pdFeeDiscountDetail;
                  delete v.pdFeeDiscountDetail;
                });
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
            },

            // 적용규칙 저장 버튼 클릭
            'click .pf-cp-apply-rule-save-btn': function(e) {

                if(cnd4feePopupGrid.getAllData().length == 0){
                    PFComponent.showMessage(bxMsg('ApplyRuleSaveWarningMsg'), 'warning');
                    return;
                }

                var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
                if(isNotMyTask(projectId)){
                    return;
                };

                var param = {
                    projectId:projectId,
                    feeDiscountSequenceNumber : data.feeDiscountSequenceNumber
                };
                saveApplyRule(param, $('.add-cnd4-fee-tpl-popup .apply-rule-info-wrap'));   // 적용규칙저장
            },
            // 적용규칙 삭제 버튼 클릭
            'click .pf-cp-apply-rule-delete-btn': function(e) {
                var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
                if(isNotMyTask(projectId)){
                    return;
                };

                deleteApplyRule(projectId, $('.add-cnd4-fee-tpl-popup .apply-rule-info-wrap .bx-info-table'));   // 적용규칙삭제
            },
            // 적용규칙 이력보기 버튼 클릭
            'click .pf-cp-apply-rule-history-btn': function(e) {

                var $applyRuleTable = $('.add-cnd4-fee-tpl-popup .apply-rule-info-wrap .bx-info-table');
                var formData = PFComponent.makeYGForm($applyRuleTable).getData();

                formData.tntInstId  = data.tntInstId;
                formData.feeDiscountSequenceNumber = $('.add-cnd4-fee-tpl-popup .fee-discount .bx-info-table').find('.feeDiscountSequenceNumber').val();
                PFPopup.showApplyRuleHistory({
                  param: formData,
                  pdInfoDscd,
                });
            },
            // 수수료할인 이력버튼 클릭
            'click .fee-dis-history-btn write-btn' : function(e){
                var $feeDiscount = $('.add-cnd4-fee-tpl-popup .fee-discount .bx-info-table');
                var formData = PFComponent.makeYGForm($feeDiscount).getData();
                var requestParam = {};
                requestParam.tntInstId  = data.tntInstId;
                requestParam.conditionGroupTemplateCode = data.conditionGroupTemplateCode;
                requestParam.conditionGroupCode = data.conditionGroupCode;
                requestParam.conditionCode = data.conditionCode;
                requestParam.feeDiscountSequenceNumber = formData.feeDiscountSequenceNumber;

                renderFeeDiscountHistory(requestParam);
            },
            'click .text-input-btn' : function(e){
                if($(e.currentTarget).parents('.add-cnd4-fee-tpl-popup').length > 0){
                    var cntnt = $(".add-cnd4-fee-tpl-popup .apply-rule").val() + $(e.currentTarget).val();
                    $(".add-cnd4-fee-tpl-popup .apply-rule").val(cntnt);

                    setBenefitTokens($(e.currentTarget).val()); // OHS20180416 추가 - 계산모듈처럼 적용
                    
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
                        $('.applyRuleSyntaxError_popup').show();
                        return;
                    }

                    if(ruleVerifier(ruleContent)){
                        $('.applyRuleSyntaxError_popup').hide();
                    }else{
                        $('.applyRuleSyntaxError_popup').show();
                    }
                    
                    popupModifyFlag = true;
                }
            },
            'click .back-space-btn' : function(e){
                if($(e.currentTarget).parents('.add-cnd4-fee-tpl-popup').length > 0){
                	
                	// OHS 20180416 - 계산영역처럼 단위로 지움
                	// 수기입력하였을때는 기존처럼 slice를 이용하여 지움
                	var result = "";
                    var delimiter = "";
                    if(benefitTokens && benefitTokens.length > 0) {
                    	$.each(benefitTokens, function(index, token) {
                    		if (token.type === TokenType.ARITHMETIC)
                    			result += delimiter;
                    			result += token.value;

                    		if (token.type === TokenType.ARITHMETIC || token.type === TokenType.COMMA)
                    			result += delimiter;
                    	});
                    }

                	if(benefitTokens && benefitTokens.length > 0 && result.replace(/ /gi, '') == $(".add-cnd4-fee-tpl-popup .apply-rule").val().replace(/ /gi, '')) {
                		benefitTokens.pop();
                        $(".add-cnd4-fee-tpl-popup .apply-rule").val(PFFormulaEditor.toContent(benefitTokens, " "));
                	}
                	else {
                        var cntnt = $(".add-cnd4-fee-tpl-popup .apply-rule").val().slice(0, -1);
                        $(".add-cnd4-fee-tpl-popup .apply-rule").val(cntnt);
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
                        $('.applyRuleSyntaxError_popup').show();
                        return;
                    }

                    if(ruleContent == '') {
                    	benefitTokens = PFFormulaEditor.tokenize(''); // 초기화
                    	$(e.currentTarget).parent().parent().parent().find('.apply-rule-desc').val(''); // 적용규칙설명 초기화
                    }
                    if(ruleVerifier(ruleContent)){
                        $('.applyRuleSyntaxError_popup').hide();
                    }else{
                        $('.applyRuleSyntaxError_popup').show();
                    }
                    popupModifyFlag = true;
                }
            },
            'keyup.xdsoft .apply-rule': function(e) {

                var ruleContent = $(e.currentTarget).parent().parent().find('.apply-rule').val();
                var count = 0;

                // product-benefit.js - function setBenefitTokens() / 3197 line 
                setBenefitTokens($(e.currentTarget).val()); // OHS20180416 추가 - 계산모듈처럼 적용
                
                for(var i = 0 ; i < ruleContent.length ; i++){
                    if (ruleContent.charAt(i) === '('){
                        count++;
                    }else if(ruleContent.charAt(i) === ')'){
                        count--;
                    }
                }

                if(count !== 0){
                    $('.applyRuleSyntaxError_popup').show();
                    return;
                }

                if(ruleVerifier(ruleContent)){
                    $('.applyRuleSyntaxError_popup').hide();
                }else{
                    $('.applyRuleSyntaxError_popup').show();
                }
            },
            
            // OHS 20180418 - 적용규칙 값이 변경될때 값이 하나도없으면 tokens 초기화처리
            'change .apply-rule' :  function(e) {
            	if($(e.currentTarget).val() == '') {
            	     var $applyRuleInfo = $('.add-cnd4-fee-tpl-popup .apply-rule-info-wrap');
            	     benefitTokens = PFFormulaEditor.tokenize(''); // 초기화
            		$applyRuleInfo.find('.apply-rule-desc').val(''); // 적용규칙설명 초기화
            	}
            },

            // 제공조건 팝업 적용규칙 검증 버튼 클릭
            'click .rule-validation-btn': function(e) {

                var $applyRuleInfo = $('.add-cnd4-fee-tpl-popup .apply-rule-info-wrap');

            	var ruleContent = $applyRuleInfo.find('.apply-rule').val();
                var count = 0;

                for(var i = 0 ; i < ruleContent.length ; i++){
                    if (ruleContent.indexOf(i) === '('){
                    	count++;
                    }else if(ruleContent.indexOf(i) === ')'){
                    	count--;
                    }
                }

                if(count !== 0 || !ruleVerifier(ruleContent)){
                	PFComponent.showMessage(bxMsg('applyRuleSyntaxError'), 'warning'); //문법이상

                } else{
                	var requestParam = {
            			'tntInstId' : tntInstId,
            			'ruleApplyTargetDscd' : $applyRuleInfo.find('.rule-apply-target-distinction-code').val(),
            			'cndGroupTemplateCode' : detailRequestParam.conditionGroupTemplateCode,
            			'cndGroupCode' : detailRequestParam.conditionGroupCode,
            			'cndCode' : detailRequestParam.conditionCode,
            			'ruleContent' : ruleContent,
            			'feeDiscountSeqNbr' : data.feeDiscountSequenceNumber
            	    };

                	// 서버 호출
            	    PFRequest.get('/common/verifyApplyRule.json', requestParam, {
            	        success: function (responseData) {
            	        	if (responseData) {
            	        		PFComponent.showMessage(bxMsg('noAbnormality'),  'success');
            	        		$applyRuleInfo.find('.apply-rule-desc').val(responseData);
            	        	}
            	        },
            	        bxmHeader: {
            	            application: 'PF_Factory',
            	            service: 'CommonService',
            	            operation: 'verifyApplyRule'
            	        }
            	    });
                }
            }
        },
        listeners: {
            afterSyncUI: function() {
                // tab
                var that = this;
                PFUI.use(['pfui/tab','pfui/mask'],function(Tab){
                	innerTab = new Tab.Tab({
                        render : '.fee-dis-sub-tab',
                        elCls : 'nav-tabs',
                        autoRender: true,
                        children : [
                            {text:bxMsg('FeeDiscount')      , index:1},           // 수수료할인
                            {text:bxMsg('providedCondition'), index:2},           // 제공조건
                            {text:bxMsg('LimitCondition')   , index:3}            // 한도조건
                        ]
                    });

                    innerTab.on('selectedchange',function (ev) {

                        var item = ev.item;

                        // 수수료할인 탭
                        if (item.get('index') == 1) {
                            $('.add-cnd4-fee-tpl-popup .fee-discount').show();      // 수수료할인 탭 활성
                            $('.add-cnd4-fee-tpl-popup .fee-condition').hide();     //removeClass('active');
                            $('.add-cnd4-fee-tpl-popup .limit-condition').hide();
                            $('.fee-discount-save-btn').show();
                            $('.fee-discount-update-btn').show();

                            // OHS20180313 - 할인일련번호가 없으면 미등록 상태이므로 삭제버튼이 보일 필요가 없음.
                            if($('.add-cnd4-fee-tpl-popup .feeDiscountSequenceNumber').val() != '') {
                            	$('.fee-discount-delete-btn').show();
                            }
                        }
                        // 제공조건 탭
                        else if(item.get('index') == 2){
                            $('.add-cnd4-fee-tpl-popup .fee-discount').hide();
                            $('.add-cnd4-fee-tpl-popup .fee-condition').show();     // 제공조건 탭 활성
                            $('.add-cnd4-fee-tpl-popup .limit-condition').hide();
                            $('.fee-discount-save-btn').hide();
                            $('.fee-discount-update-btn').hide();
                            $('.fee-discount-delete-btn').hide();

                            if(!cnd4feePopupGrid){
                                renderCnd4FeePopupGrid(data);
                            }

                            $(".add-cnd4-fee-tpl-popup").find('.applyRuleSyntaxError').addClass('applyRuleSyntaxError_popup');
                            $(".add-cnd4-fee-tpl-popup").find('.applyRuleSyntaxError').removeClass('applyRuleSyntaxError');


                        }else if(item.get('index') == 3){
                            $('.add-cnd4-fee-tpl-popup .fee-discount').hide();
                            $('.add-cnd4-fee-tpl-popup .fee-condition').hide();     // 한도조건 탭 활성
                            $('.add-cnd4-fee-tpl-popup .limit-condition').show();
                            $('.fee-discount-save-btn').hide();
                            $('.fee-discount-update-btn').hide();
                            $('.fee-discount-delete-btn').hide();

                            // 한도조건그리드
                            renderLimitCnd4FeePopupGrid(data);
                        } // 제공조건 탭 end

                        // 권한이 없는 경우
                        if(writeYn != 'Y') {
                        	// OHS 20171214 수정 - 수수료할인통합한도 그리드 팝업 호출시에 메인 버튼 사라짐 버그 수정
                        	$('.add-cnd4-fee-tpl-popup').find('.write-btn').hide();
                        }else{
                            if( getSelectedProjectId()!='' && isEmergency(getSelectedProjectId()) ){
                                fnEmergencyControlForCpl4FeePopup(true);
                            }else{
                                fnEmergencyControlForCpl4FeePopup(false);
                            }
                        }

                        if(isReadOnly){
                        	// OHS 20171214 수정 - 수수료할인통합한도 그리드 팝업 호출시에 메인 버튼 사라짐 버그 수정
                        	$('.add-cnd4-fee-tpl-popup').find('.write-btn').hide();
                        }

                    }); // tab.on('selectedchange') end

                    PFUtil.getDatePicker(true, $('.fee-dis-sub-tab-conts'));

                    var checkFloatPopup = PFValidation.floatCheck('.add-cnd4-fee-tpl-popup');
                    checkFloatPopup('.float21', 19, 2);
                    checkFloatPopup('.float10', 3, 6);
                    checkFloatPopup('.float0', 3, 0);

                    var focusDragPopup = PFValidation.dragAll('.add-cnd4-fee-tpl-popup');
                    focusDragPopup('.float21');
                    focusDragPopup('.float19');
                    focusDragPopup('.float10');
                    focusDragPopup('.float0');

                    renderComboBox('ProductStatusCode', $('.feeDiscountStatusCode'), data ? data.feeDiscountStatusCode : '01');
                    renderComboBox('ProductConditionClassifyCode', $('.feeDiscountStructure'));

                    // 데이터가 있는 경우
                    if(data) {

                        // 기본 금액활성화이므로 수수료할인값 필드 기본값을 세팅해준다.
                    	// OHS20180417 추가 - 범위형에 대해 소수점 처리 로직 추가
                    	// 할인금액
                    	var feeDiscountAmount = '0.00';
                    	if(data.feeDiscountAmount) {
                    		feeDiscountAmount = PFValidation.gridFloatCheckRenderer(data.feeDiscountAmount, 19, 2);
                    	}
                		$('.add-cnd4-fee-tpl-popup').find('.feeDiscountAmount').val(feeDiscountAmount);
                		
                		// 할인율
                		var feeDiscountRate = '0.000000'; 
                    	if(data.feeDiscountRate) {
                    		feeDiscountRate = PFValidation.gridFloatCheckRenderer(data.feeDiscountRate, 3, 6);
                    	}
                    	$('.add-cnd4-fee-tpl-popup').find('.feeDiscountRate').val(feeDiscountRate);
                    	
                    	// 할인최소값
                    	var feeDiscountMinAmount = '0.00';
                    	if(data.feeDiscountMinAmount) {
                    		feeDiscountMinAmount = PFValidation.gridFloatCheckRenderer(data.feeDiscountMinAmount, 19, 2);	
                    	}
                    	$('.add-cnd4-fee-tpl-popup').find('[data-form-param="feeDiscountMinAmount"]').val(feeDiscountMinAmount);
                    	
                    	// 할인최대값
                    	var feeDiscountMaxAmount = '0.00';
                    	if(data.feeDiscountMaxAmount) {
                    		feeDiscountMaxAmount = PFValidation.gridFloatCheckRenderer(data.feeDiscountMaxAmount, 19, 2);
                    	}
                		$('.add-cnd4-fee-tpl-popup').find('[data-form-param="feeDiscountMaxAmount"]').val(feeDiscountMaxAmount);

                        // 일반조건
                        if (data.complexConditionYn == 'N') {

                            $('.add-cnd4-fee-tpl-popup .fee-dis-com').show();                               // 일반조건 활성
                            $('.add-cnd4-fee-tpl-popup .fee-dis-cpl').hide();                               // 복합조건 숨김

                            $('.add-cnd4-fee-tpl-popup .feeDiscountStructure').val('01');

                            // 율 선택 시
                            if (data.feeRateAmountDistinctionCode == '01') {
                                $('.add-cnd4-fee-tpl-popup').find('.fee-dis-com-amt').hide();               // 일반조건>금액 비활성
                                $('.add-cnd4-fee-tpl-popup').find('.fee-dis-com-rate').show();              // 일반조건>율 활성

                                $('.add-cnd4-fee-tpl-popup').find('.cnd4-fee-rate[value="01"]').prop('checked',true);      // 금액 checked
                                $('.add-cnd4-fee-tpl-popup').find('.cnd4-fee-amount[value="02"]').prop('checked',false);     // 율 unchecked

                            }
                            // 금액 선택 시
                            else {
                                $('.add-cnd4-fee-tpl-popup').find('.fee-dis-com-amt').show();               // 일반조건>금액 활성
                                $('.add-cnd4-fee-tpl-popup').find('.fee-dis-com-rate').hide();              // 일반조건>율 비활성
                                $('.add-cnd4-fee-tpl-popup').find('.cnd4-fee-amount[value="02"]').prop('checked',true);     // 금액 checked
                                $('.add-cnd4-fee-tpl-popup').find('.cnd4-fee-rate[value="01"]').prop('checked',false);      // 율 unchecked

                            }
                        }
                        // 복합조건
                        else if(data.complexConditionYn == 'Y') {
                            $('.add-cnd4-fee-tpl-popup .fee-dis-com').hide();                               // 일반조건 숨김
                            $('.add-cnd4-fee-tpl-popup .fee-dis-com-amt').hide();                           // 일반조건>금액 숨김
                            $('.add-cnd4-fee-tpl-popup .fee-dis-com-rate').hide();                          // 일반조건>율 숨김
                            $('.add-cnd4-fee-tpl-popup .fee-dis-cpl').show();                               // 복합조건 활성

                            $('.add-cnd4-fee-tpl-popup .feeDiscountStructure').val('02');

                            // 복합조건그리드
                            renderCpl4FeePopupGrid(data.complexCndTitleInformationList, data.complexCndMatrix);   // title과 data를 넘겨줘야함.
                        }
                    }
                    // 데이터가 없을 때
                    else{

                        data = {};
                        if(detailRequestParam && detailRequestParam.tntInstId){
                            data.tntInstId = detailRequestParam.tntInstId;
                        }else if(selectedTreeItem){
                            data.tntInstId = selectedTreeItem.tntInstId;
                        }else if(selectedCondition){
                            data.tntInstId = selectedCondition.tntInstId;
                        }else{
                            data.tntInstId = tntInstId;
                        }

                        $('.add-cnd4-fee-tpl-popup .fee-dis-com').show();                                   // 일반조건 활성
                        $('.add-cnd4-fee-tpl-popup .fee-dis-com-amt').show();                               // 일반조건>금액 활성
                        $('.add-cnd4-fee-tpl-popup .fee-dis-com-rate').hide();                              // 율 숨김
                        $('.add-cnd4-fee-tpl-popup .fee-dis-cpl').hide();                                   // 복합조건 숨김

                        $('.add-cnd4-fee-tpl-popup').find('.start-date').val(PFUtil.getNextDate() + ' 00:00:00');
                        $('.add-cnd4-fee-tpl-popup').find('.end-date').val('9999-12-31 23:59:59');

                        // OHS 2017.03.20 추가 - 수수료할인데이터가 저장되지않았을경우 제공조건, 한도조건 탭 비활성화 처리
                        // disabled true 상태일경우 해당 탭의 opacity 조정
                        if($('.add-cnd4-fee-tpl-popup').find('.nav-tabs').find('li') && $('.add-cnd4-fee-tpl-popup').find('.nav-tabs').find('li').length > 0) {
                        	$.each($('.add-cnd4-fee-tpl-popup').find('.nav-tabs').find('li'), function(idx, value) {

                        		if((idx == 1 || idx == 2) && innerTab) {
                        			innerTab.getItemAt(idx).set('disabled', true);
                        			$(value).css('opacity', '0.4');
                        		}
                        	});
                        }
                        // 기본 금액활성화이므로 수수료할인값 필드 기본값을 세팅해준다.
                        $('.add-cnd4-fee-tpl-popup').find('.feeDiscountAmount').val('0.00');
                        $('.add-cnd4-fee-tpl-popup').find('.feeDiscountRate').val('0.000000');
                        $('.add-cnd4-fee-tpl-popup').find('[data-form-param="feeDiscountMinAmount"]').val('0.00');
                        $('.add-cnd4-fee-tpl-popup').find('[data-form-param="feeDiscountMaxAmount"]').val('0.00');
                    }
                    // 수수료할인 탭 활성
                    innerTab.setSelected(innerTab.getItemAt(0));
                }); // PFUI tab end
            } // afterRenderUI end
        } // listener end
    }); // 수수료할인 팝업 end
}

// 수수료할인 팝업 복합조건 그리드
function renderCpl4FeePopupGrid(title, data, strGridClass){

    var fields = ['y'],
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
    if(strGridClass){
        $(strGridClass).empty();
    }else {
        $('.add-cnd4-fee-tpl-popup .add-cnd4-fee-popup-cpl-grid').empty();
    }
    cpl4feePopupGridTitleDataArr = [];
    cpl4feePopupGridTitleDataObj = {};

    data.forEach(function(el) {
        var tempObj = {};

        el.x.forEach(function(xEl){
            var columnId = xEl.id;

            tempObj[columnId] = xEl;
        });

        YforNewColumn = tempObj['y'] = el.y;

        gridData.push(tempObj);
    });

    // 구성조건 컬럼 추가 (목록형과 범위형만 가능)
    title.forEach(function(el){
        el.defineValues = el.defineValues || [];
        var conditionCode = el.titleConditionCode,
            tempObj = {},
            conditionDetailCode = el.titleConditionDetailTypeCode;

        tempObj['titleConditionCode'] = conditionCode;
        tempObj['titleConditionName'] = el.titleConditionName;
        tempObj['titleConditionTypeCode'] = el.titleConditionTypeCode;

        //목록형
        if (el.titleConditionTypeCode == '01') {


            el.defineValues.forEach(function(e){
                if(e.key) {
                    e.code = e.key;
                    e.name = e.value;
                    delete e.key;
                    delete e.value;
                }
            });

            tempObj['defineValues'] = el.defineValues;

            var defineValuesObj = {};

            if(conditionCode=='L0149'){
                // 금액일때(통화코드) 명이 아닌 코드로 표시한다.
                tempObj['defineValues'].forEach(function(el) {
                    defineValuesObj[el.code] = el.code;
                });
            }else{
                tempObj['defineValues'].forEach(function(el) {
                    defineValuesObj[el.code] = el.name;
                });
            }

            fields.push(conditionCode, conditionCode+'.defineValues', {
                name: conditionCode+'.code',
                style: 'text-align:center',
                convert: function(newValue, record) {
                    var code ;

                    /*if (newValue) {
                        code = newValue;

                        record.get(conditionCode)['listConditionValue'] = {};
                        record.get(conditionCode)['listConditionValue']['defineValues'] = [];
                        record.get(conditionCode)['listConditionValue']['defineValues'].push({
                            code: newValue,
                            value: defineValuesObj[newValue],
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
                    }

                    return code;*/

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

            columns.push({header: el.titleConditionName + '('+ el.titleConditionCode +')',
                width: 170, dataIndex: conditionCode+'.code',
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
                    displayField: conditionCode =='L0149' ? 'code' : 'name',
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
                }});


            //범위형
        } else if (el.titleConditionTypeCode == '02') {
            tempObj['productMeasurementUnit'] = el.productMeasurementUnit;              // 측정단위
            tempObj['currencyValue'] = el.currencyValue;                                // 통화
            tempObj['rangeBlwUnderType'] = el.rangeBlwUnderType;                        // 이하미만구분코드
            tempObj['titleConditionDetailTypeCode'] = el.titleConditionDetailTypeCode;  // 조건상세유형코드

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
                        minValue = record.get(conditionCode)['rangeConditionValue']['minValue'];
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
                        maxValue = record.get(conditionCode)['rangeConditionValue']['maxValue'];
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

            var rangeHeader;// = '<div align=center>' + el.titleConditionName + '(' + el.titleConditionCode + ')'+ '</div>';

            if(el.titleConditionDetailTypeCode == '01') {
                rangeHeader = '<div align=center>' + el.titleConditionName + '(' + el.titleConditionCode + ')' + codeMapObj['CurrencyCode'][el.currencyValue] + '<br/>' + codeMapObj['RangeBlwUnderTypeCode'][el.rangeBlwUnderType] + '</div>';
            } else {
                rangeHeader = '<div align=center>' + el.titleConditionName + '(' + el.titleConditionCode + ')' + codeMapObj['ProductMeasurementUnitCode'][el.productMeasurementUnit] + '<br/>' + codeMapObj['RangeBlwUnderTypeCode'][el.rangeBlwUnderType] + '</div>';
            }

            columns.push({
                header: rangeHeader,
                columns: [{
                    text: bxMsg('DPS0121_1String1'),
                    width: 160,
                    dataIndex: conditionCode + '.minValue',
                    style: 'text-align:center',
                    renderer: function(value, metadata, record) {
                        if (parseFloat(value) > parseFloat(record.get(conditionCode + '.maxValue'))) {
                            GridMinMaxCheck = false;
                        } else {
                            GridMinMaxCheck = true;
                        }

                        if(isNotNegativeRangeType(conditionDetailCode)){
                            return PFValidation.gridFloatCheckRenderer(value, 19, 0, true);
                        }else{
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
                                    .on('keydown', function(e) {
                                        if(isNotNegativeRangeType(conditionDetailCode)){
                                            PFValidation.gridFloatCheckKeydown(e, 19, 0);
                                        }else{
                                            PFValidation.gridFloatCheckKeydownForRangeType(e, 19, 2);
                                        }

                                    })
                                    .on('keyup', function (e) {
                                        if(isNotNegativeRangeType(conditionDetailCode)){
                                            PFValidation.gridFloatCheckKeyup(e, 19, 0);
                                        }else{
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
                    renderer: function(value, metadata, record) {
                        if(isNotNegativeRangeType(conditionDetailCode)){
                            return PFValidation.gridFloatCheckRenderer(value, 19, 0, true);
                        }else{
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
                                    .on('keydown', function(e) {
                                        if(isNotNegativeRangeType(conditionDetailCode)){
                                            PFValidation.gridFloatCheckKeydown(e, 19, 0);
                                        }else{
                                            PFValidation.gridFloatCheckKeydownForRangeType(e, 19, 2);
                                        }
                                    })
                                    .on('keyup', function (e) {
                                        if(isNotNegativeRangeType(conditionDetailCode)){
                                            PFValidation.gridFloatCheckKeyup(e, 19, 0);
                                        }else{
                                            PFValidation.gridFloatCheckKeyupForRangeType(e, 19, 2);
                                        }
                                    })
                            }
                        }
                    }
                }]
            });
        }

        cpl4feePopupGridTitleDataArr.push(tempObj);
    });

    cpl4feePopupGridTitleDataArr.forEach(function(el) {
        cpl4feePopupGridTitleDataObj[el.titleConditionCode] = el;
    });

    var flex = 0,
        width = 0;

    if(cpl4feePopupGridTitleDataArr.length >= 2) {
        flex = 0;
        width = 295;
    } else {
        flex = 1;
        width = 0;
    }

    // 조건값 컬럼 추가
    columns.push({text: bxMsg('DPS0129String4'), style: 'text-align:center', flex : flex, width : width,
        renderer: function(value, p, record) {
            var yTitle1 = '',
                yVal1 = '';
            var extFormat;

            if (record.get('y')) {
                var feeDiscountMinimumAmount, // 최소수수료
                    feeDiscountMaximumAmount,  // 최대수수료
                    feeDiscountAmount, // 기본수수료
                    feeDiscountRate; // 기본율
                
                // 금액정보
                if (record.get('y').feeRateAmountDistinctionCode == '02') {
                	
                	// OHS 20180417 추가 - 자릿수처리를 위해 로직 추가
                	if(record.get('y').feeDiscountAmount) {
                		feeDiscountAmount = PFValidation.gridFloatCheckRenderer(record.get('y').feeDiscountAmount, 19, 2);
                	}
                	else {
                		feeDiscountAmount = '0.00';
                	}

                    // 최소~최대(기본)
                    yTitle1 = bxMsg('base') + ' : ';        // 기본
                    yVal1 = feeDiscountAmount; //minFixFeeAmt + '~' + maxFixFeeAmt + '(' + fixed + ')';
                }
                // 율정보
                else if (record.get('y').feeRateAmountDistinctionCode == '01') {
                	
                	
                  	// OHS 20180417 - 소숫점처리를위해 로직 수정
                	var feeDiscountRate = '';
                	if(record.get('y')['feeDiscountRate']) {
                		feeDiscountRate = PFValidation.gridFloatCheckRenderer(record.get('y')['feeDiscountRate'], 3, 6);
                	}
                	else {
                		feeDiscountRate = '0.000000';
                	}
                    var feeDiscountMinimumAmount = '';
                    if(record.get('y')['feeDiscountMinimumAmount']) {
                    	feeDiscountMinimumAmount = PFValidation.gridFloatCheckRenderer(record.get('y')['feeDiscountMinimumAmount'], 19, 2);
                    }
                    else {
                    	feeDiscountMinimumAmount = '0.00';
                    }
                    var feeDiscountMaximumAmount = '';
                    if(record.get('y')['feeDiscountMaximumAmount']) {
                    	feeDiscountMaximumAmount = PFValidation.gridFloatCheckRenderer(record.get('y')['feeDiscountMaximumAmount'], 19, 2);
                    }
                    else {
                    	feeDiscountMaximumAmount = '0.00';
                    }
                    
                    // 최소~최대(기본)
                    yTitle1 = bxMsg('DPS0129Unit1String1') + ' : ';
                    yVal1 = feeDiscountMinimumAmount + '~' + feeDiscountMaximumAmount + '(' + feeDiscountRate + ' %)';
                }
            }

            extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}{1}</p>', yTitle1, yVal1);
            return extFormat;
        }
    });

    // 삭제 컬럼 추가
    columns.push( {
        xtype: 'actioncolumn', width: 35, align: 'center',
        style: 'text-align:center',
        items: [{
            icon: '/images/x-delete-16.png',
            handler: function (grid, rowIndex, colIndex, item, e, record) {
                record.destroy();
                cpl4feePopupGrid.grid.getView().refresh(); // rowIndex adjusting.
                popupModifyFlag = true;
            }
        }]
    });

    cpl4feePopupGrid = PFComponent.makeExtJSGrid({
        fields: fields,
        gridConfig:{
            renderTo: strGridClass ? strGridClass : '.add-cnd4-fee-tpl-popup .add-cnd4-fee-popup-cpl-grid',
            columns: columns,
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                        afteredit: function(e, editor){
                            if (editor.field.endsWith(".code")) { // 목록조건 수정
                              cpl4feePopupGrid.grid.getView().refresh(); // rowIndex adjusting.
                            }
                        }
                    }
                })
            ],
            listeners: {
                scope: this,
                'celldblclick': function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {

                    // 수수료조건 입력 팝업 호출
                    renderCpl4feeConditionValue4Popup(record.get('y'), rowIndex);
                }
            }
        }
    });

    cpl4feePopupGrid.store.model.override({
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

    gridData = aggregate(gridData);
    cpl4feePopupGrid.setData(gridData);
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
          || a.y.productMeasurementUnit !== b.y.productMeasurementUnit)
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
    }
    else return null; // 이외 타입은 aggregate 하지 않음.

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


// 수수료할인 팝업 제공조건 그리드
function renderCnd4FeePopupGrid(data) {
    // 최초 한번만 그리드 생성
    if(cnd4feePopupGrid){
        return;
    }

    // 그리드
    cnd4feePopupGrid = PFComponent.makeExtJSGrid({
        fields: ['providedConditionCode','providedConditionName', 'process',
            'providedConditionStatusCode', 'applyStartDate',
            'applyEndDate', 'providedConditionTypeCode', 'providedConditionDetailTypeCode',
            'productBenefitProvidedListConditionList', 'mesurementUnitCode', 'currencyCode',
            'isAdditionalInfoExist','provideCndAdditionalInfoDetailList', 'providedConditionSequenceNumber', 'cndDscd',
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
            renderTo: '.add-cnd4-fee-popup-cnd-grid',
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
                    text: bxMsg('DPP0127String6'), flex: 1, dataIndex: 'applyStartDate'
                },
                {
                    text: bxMsg('DPP0127String7'), flex: 1, dataIndex: 'applyEndDate'
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

                            yTitle1 = bxMsg('DPS0129Unit1String1') + ' : ';
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
                }
            ],
            listeners: {
                scope: this,
                'viewready' : function(_this, eOpts){

                    if(!data) return;

                    var formData = {};
                    formData.conditionGroupTemplateCode = data.conditionGroupTemplateCode;
                    formData.conditionGroupCode = data.conditionGroupCode;
                    formData.conditionCode = data.conditionCode;
                    formData.feeDiscountSequenceNumber = data.feeDiscountSequenceNumber;
                    formData.cndDscd = '01';

                    if($('.bnft-prov-cnd-search').val()) {
                        formData.applyStartDate = $('.bnft-prov-cnd-search').val();
                    }
                    else {
                        delete formData.applyStartDate;
                    }

                    PFRequest.get('/benefit/queryListBenefitProvideCnd.json', formData, {
                        success: function(responseData) {
                            cnd4feePopupGrid.setData(responseData);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'BenefitProvideCndService',
                            operation: 'queryListBenefitProvideCnd'
                        }
                    });
                },
                'celldblclick': function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    if(cellIndex === 6){
                    	benefitTokens = PFFormulaEditor.tokenize(''); // 초기화
                        renderProvCndPopup(record.data, isReadOnly);
                    }else{
                        if(!isReadOnly){
                            var cntnt = $('.add-cnd4-fee-tpl-popup .apply-rule').val() + "#"+record.get('providedConditionSequenceNumber');
                            $('.add-cnd4-fee-tpl-popup .apply-rule').val(cntnt);
                            
                            benefitTokens.push({
                                type: TokenType.CONDITION,
                                value: "#"+record.get('providedConditionSequenceNumber')
                            });
                            
                            var ruleContent = $(e.currentTarget).parent().parent().parent().find('.apply-rule').val();
                        }
                    }
                }
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
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

    cnd4feePopupGrid.setData(data);

    // 적용규칙
    $('.add-cnd4-fee-tpl-popup .apply-rule-info-wrap').html(cndApplyRuleTpl());     // 적용규칙 화면 render

    // 적용규칙 화면 조정
    $('.add-cnd4-fee-tpl-popup .apply-rule-info-wrap').find('.max-discount').hide();
    $('.add-cnd4-fee-tpl-popup .apply-rule-info-wrap').find('.discount-amount[value="02"]').prop('checked', false);      // 금액 checked
    $('.add-cnd4-fee-tpl-popup .apply-rule-info-wrap').find('.discount-rate[value="01"]').prop('checked', false);       // 율 unchecked
    $('.add-cnd4-fee-tpl-popup .apply-rule-info-wrap').find('.pf-cp-apply-rule-grapic-view-btn').hide();

    // 적용규칙
    $('.add-cnd4-fee-tpl-popup .apply-rule-info-wrap .rule-apply-target-distinction-code').val('04');  // 규칙적용대상구분코드 = 01.우대금리적용규칙, 02.수수료할인, 03.서비스, 04.제공조건
    PFUtil.getDatePicker(true, $('.apply-rule-info-wrap'));
    renderComboBox('ProductStatusCode', $('.apply-rule-info-wrap .status'));
    var formData = PFComponent.makeYGForm($('.add-cnd4-fee-tpl-popup .fee-discount')).getData();
    $('.add-cnd4-fee-tpl-popup .apply-rule')[0].placeholder = bxMsg('noneApplyRule');
    formData.tntInstId = data.tntInstId;

    $('.add-cnd4-fee-tpl-popup .apply-rule-info-wrap .min').hide();
    $('.add-cnd4-fee-tpl-popup .apply-rule-info-wrap .max').hide();
    $('.add-cnd4-fee-tpl-popup .apply-rule-info-wrap .avg').hide();
    $('.add-cnd4-fee-tpl-popup .apply-rule-info-wrap .sum').hide();

    $('.applyRuleSyntaxError').hide();

    searchApplyRule(formData, $('.add-cnd4-fee-tpl-popup .apply-rule-info-wrap'));	// 조회

    //적용규칙 도움말 포커스아웃 처리를 할때 HELP 영역을 클릭하였을경우 사라지지않도록 처리하기위함
    var isHelpAreaClick = false;
    // 적용규칙 도움말 버튼 클릭
    $('.add-cnd4-fee-tpl-popup .pf-cp-apply-rule-help-btn').on('click', function(e) {
    	// 버튼 아이콘이 보여 도움말 툴팁이 가려지는 케이스를 방지하기위해 hide() 처리
    	var $toolTip = $('.tooltip');
    	if($toolTip) $($toolTip).hide();

    	var $helpDiv = $('.help-area');
    	var applyRuleExample = bxMsg('ApplyRuleHelpMessage');
    	$($helpDiv).html('<p class="help-area-message">' + applyRuleExample + '</p>');
    	$($helpDiv).css({top: e.pageY+15, left: e.pageX+15}).show();

    	$('.help-area-message').on('mousedown', function(e) {
    		isHelpAreaClick = true;
    	});
    });

	// 적용규칙 도움말 포커스아웃 처리
	$('.add-cnd4-fee-tpl-popup .pf-cp-apply-rule-help-btn').on('focusout', function(e) {
		if(!isHelpAreaClick) {
			var $helpDiv = $('.help-area');
			if($helpDiv) $($helpDiv).hide();
				isHelpAreaClick = false;
		}
		else {
			isHelpAreaClick = false;
			$('.add-cnd4-fee-tpl-popup .pf-cp-apply-rule-help-btn').focus();
		}
	});

}


// 수수료할인 팝업 한도조건 그리드
function renderLimitCnd4FeePopupGrid(data) {
    // 최초 한번만 그리드 생성
    if(limitConditionInfoGrid){
        return;
    }

    // 그리드
    limitConditionInfoGrid = PFComponent.makeExtJSGrid({
        fields: ['providedConditionCode','providedConditionName', 'process',
            'providedConditionStatusCode', 'applyStartDate',
            'applyEndDate', 'providedConditionTypeCode', 'providedConditionDetailTypeCode', 'currencyCode',
            'productBenefitProvidedListConditionList', 'mesurementUnitCode', 'cndDscd', 'providedConditionSequenceNumber',

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
            renderTo: '.add-cnd4-fee-popup-limit-cnd-grid',
            columns: [
                {
                    text: bxMsg('DPP0128String2'),   // 조건코드
                    flex: 0.6,
                    dataIndex: 'providedConditionCode'
                },
                {
                    text: bxMsg('DTP0203String2'),   // 조건명
                    flex: 1,
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
                    text: bxMsg('DPP0127String6'), flex: 0.7, dataIndex: 'applyStartDate',
                },
                {
                    text: bxMsg('DPP0127String7'), flex: 0.7, dataIndex: 'applyEndDate',
                },
                {
                    text: bxMsg('DPS0129String4'), //조건값
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

                            yTitle1 = bxMsg('DPS0129Unit1String1') + ' : ';
                            yVal1 = minString + '~' + maxString;

                            extFormat = Ext.String.format('<p class="ext-condition-value-column">{0} {1} </p>', yTitle1, yVal1);
                        }

                        return extFormat;
                    }
                }
            ],
            listeners: {
                scope: this,
                'viewready' : function(_this, eOpts){

                    if(!data) return;

                    var formData = {};
                    formData.conditionGroupTemplateCode = data.conditionGroupTemplateCode;
                    formData.conditionGroupCode = data.conditionGroupCode;
                    formData.conditionCode = data.conditionCode;
                    formData.feeDiscountSequenceNumber = data.feeDiscountSequenceNumber;
                    formData.cndDscd = '02';

                    if($('.bnft-prov-cnd-search').val()) {
                        formData.applyStartDate = $('.bnft-prov-cnd-search').val();
                    }
                    else {
                        delete formData.applyStartDate;
                    }
                    PFRequest.get('/benefit/queryListBenefitProvideCnd.json', formData, {
                        success: function(responseData) {
                            limitConditionInfoGrid.setData(responseData);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'BenefitProvideCndService',
                            operation: 'queryListBenefitProvideCnd'
                        }
                    });
                },
                'celldblclick': function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                	renderLimitCndPopup(record.data, isReadOnly);
                }
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
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

}

/******************************************************************************************************************
 * 수수료 할인 팝업 END
 ******************************************************************************************************************/




/******************************************************************************************************************
 * 조건 > 수수료 > 할인조건
 ******************************************************************************************************************/
// 할인조건 그리드
function renderConditionType4_2GridPage(treeItem) {

    // 상품인경우
    var $conditionInfoWrap = $el.find('.pf-cp-condition-info');

    // 공통인경우
    if($conditionInfoWrap.length==0){
        $conditionInfoWrap = $el.find('.pf-cc-condition-info');
    }

    $conditionInfoWrap.html(conditionType4_2Tpl());
    $('.apply-rule-info-wrap').html(cndApplyRuleTpl());

    $('.apply-rule-info-wrap .and').hide();
    $('.apply-rule-info-wrap .or').hide();
    $('.apply-rule-info-wrap .not').hide();
    $('.apply-rule-info-wrap .match').hide();
    $('.applyRuleSyntaxError').hide();
    if (treeItem) {
        detailRequestParam = {
            conditionGroupTemplateCode: treeItem.conditionGroupTemplateCode,
            conditionGroupCode: treeItem.conditionGroupCode,
            conditionCode: (treeItem.id ? treeItem.id : treeItem.conditionCode),
            tntInstId : treeItem.tntInstId,
            writeYn : treeItem.writeYn
        };
    }

    // 권한이 없으면
    if(writeYn != 'Y' || (selectedTreeItem && selectedTreeItem.writeYn == 'N') || detailRequestParam.writeYn == 'N'){
        $('.write-btn').hide();
    }

    cndType2Grid = PFComponent.makeExtJSGrid({
        fields: ['feeDiscountSequenceNumber', 'applyStartDate','applyEndDate', 'feeDiscountName',
         'feeDiscountRate', 'feeDiscountMaxAmount', 'feeDiscountMinAmount', 'feeDiscountAmount', 'feeRateAmountDistinctionCode',
         'conditionCode', 'conditionGroupCode', 'conditionGroupTemplateCode', 'complexConditionYn'],
        gridConfig: {
            renderTo: '.condition-type4-2grid-wrap',
            columns: [
                {text: bxMsg('discountNo')     , flex:0.5, dataIndex: 'feeDiscountSequenceNumber'	, align:'center', style: 'text-align:center'},
                {text: bxMsg('DPP0127String6') , flex:0.7, dataIndex: 'applyStartDate'				, align:'center', style: 'text-align:center'},
                {text: bxMsg('DPP0127String7') , flex:0.7, dataIndex: 'applyEndDate'				, align:'center', style: 'text-align:center'},
                {text: bxMsg('discountName')   , flex:1, dataIndex: 'feeDiscountName'			, align:'left'  , style: 'text-align:center'},
                {text: bxMsg('feeDiscountVal') , flex:1, align:'left'	                        , style: 'text-align:center',
                    renderer: function(value, p, record) {
                        var yTitle1 = '',
                            yVal1 = '';
                        var extFormat;

                        if (record.get('complexConditionYn') === 'N') {

                            //금액
                            if(record.get('feeRateAmountDistinctionCode') === '02') {
                            	var feeDiscountAmount = '';
                            	// OHS 20180417 - 소숫점처리를위해 로직 수정
                            	if(record.get('feeDiscountAmount')) {
                            		feeDiscountAmount = PFValidation.gridFloatCheckRenderer(record.get('feeDiscountAmount'), 19, 2);
                            	}
                            	else {
                            		feeDiscountAmount = '0.00';
                            	}
                                // 할인금액
                                yTitle1 = bxMsg('discountAmount') + ' : ';        // 할인금액
                                yVal1 = feeDiscountAmount;
                            }
                            // 율정보
                            else if (record.get('feeRateAmountDistinctionCode') === '01') {
                              	// OHS 20180417 - 소숫점처리를위해 로직 수정
                            	var feeDiscountRate = '';
                            	if(record.get('feeDiscountRate')) {
                            		feeDiscountRate = PFValidation.gridFloatCheckRenderer(record.get('feeDiscountRate'), 3, 6);
                            	}
                            	else {
                            		feeDiscountRate = '0.000000';
                            	}
                                var feeDiscountMinimumAmount = '';
                                if(record.get('feeDiscountMinimumAmount')) {
                                	feeDiscountMinimumAmount = PFValidation.gridFloatCheckRenderer(record.get('feeDiscountMinimumAmount'), 19, 2);
                                }
                                else {
                                	feeDiscountMinimumAmount = '0.00';
                                }
                                var feeDiscountMaximumAmount = '';
                                if(record.get('feeDiscountMaximumAmount')) {
                                	feeDiscountMaximumAmount = PFValidation.gridFloatCheckRenderer(record.get('feeDiscountMaximumAmount'), 19, 2);
                                }
                                else {
                                	feeDiscountMaximumAmount = '0.00';
                                }

                                yTitle1 = bxMsg('feeDcRt') + ' : ';               //할인율
                                yVal1 = feeDiscountRate + ' % ('+ feeDiscountMinimumAmount + '~' + feeDiscountMaximumAmount + ')';
                            }

                            extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}{1}</p>', yTitle1, yVal1);

                        }else if(record.get('complexConditionYn') === 'Y'){
                            yTitle1 = bxMsg('MTM0200String8');               //복합조건
                            extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}</p>', yTitle1);
                        }
                        return extFormat;
                    }
                }
            ],
            listeners: {
                'celldblclick': function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    if(cellIndex === 4){
                        PFRequest.get('/product_condition/getProductConditionFeeDiscount.json', {
                                conditionGroupTemplateCode: record.get('conditionGroupTemplateCode'),
                                conditionGroupCode: record.get('conditionGroupCode'),
                                conditionCode: record.get('conditionCode'),
                                feeDiscountSequenceNumber: record.get('feeDiscountSequenceNumber'),
                                applyStartDate: record.get('applyStartDate'),
                                tntInstId : treeItem.tntInstId
                            },
                            {
                                success: function(data) {
                                    if(writeYn != 'Y' || (selectedTreeItem && selectedTreeItem.writeYn == 'N') || detailRequestParam.writeYn == 'N') {
                                        renderCnd4FeePopup(data, true);
                                    }else{
                                        renderCnd4FeePopup(data);
                                    }
                                },
                                bxmHeader: {
                                    application: 'PF_Factory',
                                    service: 'PdCndFeeDiscountService',
                                    operation: 'queryPdCndFeeDiscount'
                                }
                            }
                        );
                    }else {
                        var cntnt = $('.apply-rule').val() + "#"+record.get('feeDiscountSequenceNumber');
                        $('.apply-rule').val(cntnt);
                        
                        tokens.push({
                            type: TokenType.CONDITION,
                            value: "#"+record.get('feeDiscountSequenceNumber')
                        });
                    }
                },
                'viewready': function(_this, eOpts){

                    if (treeItem && treeItem.conditionGroupCode && treeItem.conditionGroupCode != '') {
                        fnSearchFeeDiscountGridData(detailRequestParam);
                    }
                }
            }
        }
    });

    // OHS 20180315 주석처리 - 상품-수수료할인 팝업에서 수정버튼 클릭 후 적용시작/종료일 클릭시 스크립트 오류 발생
    // 적용규칙
    PFUtil.getDatePicker(true);
    //PFUtil.getAllDatePicker(true);

    $('.apply-rule-info-wrap').find('.rule-apply-target-distinction-code').val('02');	// 규칙적용대상구분코드 = 02.수수료할인
    renderComboBox('ProductStatusCode', $('.apply-rule-info-wrap .status'));
    $conditionInfoWrap.find('.apply-rule')[0].placeholder = bxMsg('noneApplyRule');
    if (treeItem && treeItem.conditionGroupCode && treeItem.conditionGroupCode != '') {
        searchApplyRule(treeItem);	// 조회
    } else {
        $conditionInfoWrap.find('.pf-panel-body :input').prop('disabled', true);
    }
}

function fnSearchFeeDiscountGridData(requestParam){
    // 할인조건 그리드 조회
    PFRequest.get('/product_condition/getListProductConditionFeeDiscount.json', requestParam, {
        success: function (data) {
        	if(data) {
        		cndType2Grid.setData(data);
        	}
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdCndFeeDiscountService',
            operation: 'queryListPdCndFeeDiscount'
        }
    });
}


/******************************************************************************************************************
 적용규칙
 ******************************************************************************************************************/
// 적용규칙 이력보기 버튼 클릭
onEvent('click', '.pf-cp-apply-rule-history-btn', function(e) {

    var $applyRuleTable = $('.apply-rule-info-wrap .bx-info-table');
    var formData = PFComponent.makeYGForm($applyRuleTable).getData();

    formData.tntInstId  = selectedTreeItem ? selectedTreeItem.tntInstId : selectedCondition.tntInstId;

    PFPopup.showApplyRuleHistory({
      param: formData,
      pdInfoDscd,
    });
});

//적용규칙 도움말 포커스아웃 처리를 할때 HELP 영역을 클릭하였을경우 사라지지않도록 처리하기위함
var isHelpAreaClick = false;

// 적용규칙 도움말 버튼 클릭
onEvent('click', '.pf-cp-apply-rule-help-btn', function(e){
	// 버튼 아이콘이 보여 도움말 툴팁이 가려지는 케이스를 방지하기위해 hide() 처리
	var $toolTip = $('.tooltip');
	if($toolTip) $($toolTip).hide();

	var $helpDiv = $('.help-area');
	var applyRuleExample = bxMsg('ApplyRuleHelpMessage');
	$($helpDiv).html('<p class="help-area-message">' + applyRuleExample + '</p>');
	$($helpDiv).css({top: e.pageY+15, left: e.pageX+15}).show();

	$('.help-area-message').on('mousedown', function(e) {
		isHelpAreaClick = true;
	});
});

// 적용규칙 도움말 포커스아웃 처리
onEvent('focusout', '.pf-cp-apply-rule-help-btn', function(e){
	if(!isHelpAreaClick) {
		var $helpDiv = $('.help-area');
		if($helpDiv) $($helpDiv).hide();
		isHelpAreaClick = false;
	}
	else {
		isHelpAreaClick = false;
		$('.pf-cp-apply-rule-help-btn').focus();
	}
});



// 적용규칙 그래픽으로보기 버튼 클릭
onEvent('click', '.pf-cp-apply-rule-grapic-view-btn', function(e){

    var $applyRuleTable = $('.apply-rule-info-wrap .bx-info-table'),
        formData = PFComponent.makeYGForm($applyRuleTable).getData();

    formData.tntInstId = selectedTreeItem ? selectedTreeItem.tntInstId : selectedCondition.tntInstId;

    if(formData.ruleApplyTargetDistinctionCode == '02'){      // 02.수수료할인적용규칙
        formData.cndGroupTemplateCode 			= detailRequestParam.conditionGroupTemplateCode;
        formData.cndGroupCode 					= detailRequestParam.conditionGroupCode;
        formData.cndCode 						= detailRequestParam.conditionCode;
    }

    PFRequest.get(
        '/benefit/getBenefitRuleMasterGraphic.json',
        formData,
        {
            success: renderChargeConditionGraphicPopup,
            bxmHeader: {
                application: 'PF_Factory',
                service: 'BenefitRuleMasterService',
                operation: 'queryBenefitRuleMasterGraphic'
            }
        }
    )
});

// 적용규칙 저장 버튼 클릭
onEvent('click', '.pf-cp-apply-rule-save-btn', function(e) {
    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    };

    saveApplyRule({projectId:projectId});                // 적용규칙저장
});

// 적용규칙 삭제 버튼 클릭
onEvent('click', '.pf-cp-apply-rule-delete-btn', function(e) {
    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    };

    deleteApplyRule(projectId);
});


// 적용규칙 할인유형 click
onEvent('click', 'input[name=discount-radio]', function(e) {

    if ($(e.currentTarget).val() == '02') {         // 금액 선택 시

        $('.apply-rule-info-wrap .max-amount').prop('type', 'text');         // 일반조건>금액 활성
        $('.apply-rule-info-wrap .max-rate').prop('type', 'hidden');         // 일반조건>율 숨김
        $('.apply-rule-info-wrap .max-amount').trigger('blur'); // OHS 20180417 추가

    } else if ($(e.currentTarget).val() == '01') {  // 율 선택시

        $('.apply-rule-info-wrap .max-amount').prop('type', 'hidden');       // 일반조건>금액 숨김
        $('.apply-rule-info-wrap .max-rate').prop('type', 'text');           // 율 활성
        $('.apply-rule-info-wrap .max-rate').trigger('blur'); // OHS 20180417 추가
    }
});

// 적용규칙 조회
function searchApplyRule(param, $applyRuleInfo){
	// 공통조건 또는 상품조건의 수수료의 할인조건일경우 flag = true
	var mainApplyRuleFlag = false;
    if(!$applyRuleInfo){
    	mainApplyRuleFlag = true;
        $applyRuleInfo = $('.apply-rule-info-wrap');
    }

    var requestParam = {
        tntInstId                       : tntInstId,
        ruleApplyTargetDistinctionCode  : $applyRuleInfo.find('.rule-apply-target-distinction-code').val()	// 규칙적용대상구분코드 = 01.우대금리적용규칙, 02.수수료할인, 03.우대금리제공조건, 04.수수료할인제공조건
    };

    if($applyRuleInfo.find('.rule-apply-target-distinction-code').val() == '01') {            // 01.우대금리적용규칙
        requestParam.pdCode                     = detailRequestParam.productCode;
    } else if($applyRuleInfo.find('.rule-apply-target-distinction-code').val() == '03') {     // 03.서비스제공조건적용규칙
        requestParam.pdInfoDscd                 = pdInfoDscd_Service;
        // OHS 20180508 수정 - 서비스 제공조건 적용규칙 삭제시 서비스코드 미세팅으로 잘못된 적용규칙을 조회함.
        requestParam.pdCode                     = param.pdCode ? param.pdCode : detailRequestParam.pdCode;
    } else{                                                                                   // 02.수수료할인적용규칙
        requestParam.cndGroupTemplateCode 		= detailRequestParam.conditionGroupTemplateCode;
        requestParam.cndGroupCode 				= detailRequestParam.conditionGroupCode;
        requestParam.cndCode 					= detailRequestParam.conditionCode;

        if($applyRuleInfo.find('.rule-apply-target-distinction-code').val() == '04' && param.feeDiscountSequenceNumber) { // 04.수수료할인 제공조건일때
            requestParam.feeDiscountSequenceNumber = param.feeDiscountSequenceNumber;
        }
    }

    PFRequest.get('/benefit/getBenefitRuleMaster.json', requestParam, {
        success: function(responseData) {

            // 조회일때
            if (responseData && responseData.ruleId) {
                $applyRuleInfo.find('.start-date').val(responseData.applyStartDate);
                $applyRuleInfo.find('.end-date').val(responseData.applyEndDate);
                $applyRuleInfo.find('.rule-id').val(responseData.ruleId);
                $applyRuleInfo.find('.apply-rule').val(responseData.ruleContent);
                $applyRuleInfo.find('.apply-rule-desc').val(responseData.ruleDesc);
                $applyRuleInfo.find('.max-amount').val(responseData.maxAmount);
                $applyRuleInfo.find('.max-rate').val(responseData.maxRate);
                $applyRuleInfo.find('.status').val(responseData.ruleStatusCode);

                // 상품조건 메인의 적용규칙조회
                if(mainApplyRuleFlag) {
                	tokens = PFFormulaEditor.tokenize(responseData.ruleContent); // OHS20180416 - 계산영역 token 적용
                }
                else {
                	benefitTokens = PFFormulaEditor.tokenize(responseData.ruleContent); // OHS20180416 - 계산영역 token 적용
                }
                	
                // 규칙적용대상구분코드 = 01.우대금리적용규칙, 02.수수료할인, 03.우대금리제공조건, 04.수수료할인제공조건
                if($applyRuleInfo.find('.rule-apply-target-distinction-code').val() == '01'){         // 01.우대금리

                }else if($applyRuleInfo.find('.rule-apply-target-distinction-code').val() == '02'){   // 02.수수료할인
                    if (responseData.rateAmountDistinctionCode == '01') { // 할인유형 = 율
                        $applyRuleInfo.find('.discount-rate[value="01"]').prop('checked', true);          // 율 checked
                        $applyRuleInfo.find('.discount-amount[value="02"]').prop('checked', false);       // 금액 unchecked

                        $('.apply-rule-info-wrap .max-rate').prop('type', 'text');              // 율 활성
                        $('.apply-rule-info-wrap .max-amount').prop('type', 'hidden');          // 금액 숨김

                    } else {  // 할인유형 = 금액
                        $applyRuleInfo.find('.discount-amount[value="02"]').prop('checked', true);        // 금액 checked
                        $applyRuleInfo.find('.discount-rate[value="01"]').prop('checked', false);         // 율 unchecked

                        $('.apply-rule-info-wrap .max-amount').prop('type', 'text');                    // 금액 활성
                        $('.apply-rule-info-wrap .max-rate').prop('type', 'hidden');                    // 율 숨김
                    }
                }else if($applyRuleInfo.find('.rule-apply-target-distinction-code').val() == '03'){   // 03.우대금리제공조건

                }else if($applyRuleInfo.find('.rule-apply-target-distinction-code').val() == '04'){   // 04.수수료할인제공조건

                }

                if (responseData.ruleStatusCode == '01') {          // 상태코드
                    //$('.pf-cp-apply-rule-delete-btn').prop('disabled', false);  // 삭제버튼 활성
                	$applyRuleInfo.find('.pf-cp-apply-rule-delete-btn').prop('disabled', false);  // 삭제버튼 활성
                } else {
                    //$('.pf-cp-apply-rule-delete-btn').prop('disabled', true);  // 삭제버튼 비활성
                	$applyRuleInfo.find('.pf-cp-apply-rule-delete-btn').prop('disabled', true);  // 삭제버튼 비활성
                }
                //$('.pf-cp-apply-rule-grapic-view-btn').prop('disabled', false);  // 그래픽으로보기 버튼 활성
                $applyRuleInfo.find('.pf-cp-apply-rule-grapic-view-btn').prop('disabled', false);  // 그래픽으로보기 버튼 활성

                $applyRuleInfo.find('.max-amount').trigger('blur'); // OHS 20180417 추가 - blur 이벤트를 태워 소숫점을 일치시키기 위함
                $applyRuleInfo.find('.max-rate').trigger('blur'); // OHS 20180417 추가 - blur 이벤트를 태워 소숫점을 일치시키기 위함
            }
            // 신규 일때
            else {
                if(mainApplyRuleFlag) {
                	tokens = PFFormulaEditor.tokenize(''); // 초기화
                }
                else {
                	benefitTokens = PFFormulaEditor.tokenize(''); // 초기화
                }
                $applyRuleInfo.find('.start-date').val(PFUtil.getNextDate() + ' 00:00:00');
                $applyRuleInfo.find('.end-date').val('9999-12-31 23:59:59');
                $applyRuleInfo.find('.rule-id').val('');
                $applyRuleInfo.find('.apply-rule').val('');
                $applyRuleInfo.find('.apply-rule-desc').val('');
                $applyRuleInfo.find('.max-amount').val('0');
                $applyRuleInfo.find('.max-rate').val('0');
                $applyRuleInfo.find('.status').val('01');
                $('.pf-cp-apply-rule-delete-btn').prop('disabled', true);  // 삭제버튼 비활성
                $('.pf-cp-apply-rule-grapic-view-btn').prop('disabled', true);  // 그래픽으로보기 버튼 비활성

                // 규칙적용대상구분코드 = 01.우대금리적용규칙, 02.수수료할인, 03.우대금리제공조건, 04.수수료할인제공조건
                if($applyRuleInfo.find('.rule-apply-target-distinction-code').val() == '01'){         // 01.우대금리

                }else if($applyRuleInfo.find('.rule-apply-target-distinction-code').val() == '02') { // 수수료할인
                    $('.apply-rule-info-wrap .max-amount').prop('type', 'text');          // 금액 활성
                    $('.apply-rule-info-wrap .max-rate').prop('type', 'hidden');          // 율 숨김
                }else if($applyRuleInfo.find('.rule-apply-target-distinction-code').val() == '03'){   // 03.우대금리제공조건

                }else if($applyRuleInfo.find('.rule-apply-target-distinction-code').val() == '04'){   // 04.수수료할인제공조건

                }
                
                $applyRuleInfo.find('.max-amount').trigger('blur'); // OHS 20180417 추가 - blur 이벤트를 태워 소숫점을 일치시키기 위함
                $applyRuleInfo.find('.max-rate').trigger('blur'); // OHS 20180417 추가 - blur 이벤트를 태워 소숫점을 일치시키기 위함
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'BenefitRuleMasterService',
            operation: 'queryBenefitRuleMaster'
        }
    });
}

// 적용규칙 저장
function saveApplyRule(param, $applyRuleInfo){

    if(!$applyRuleInfo){
        $applyRuleInfo = $('.apply-rule-info-wrap');
    }

    // 팝업이면
    if($applyRuleInfo.parents('.pfui-dialog').length > 0){
    	if(!popupModifyFlag){
    		// 변경된 정보가 없습니다.
    		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
    		return;
    	}
    }else{
        if(!modifyFlag){
    		// 변경된 정보가 없습니다.
    		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
    		return;
    	}
    }

    var formData = PFComponent.makeYGForm($applyRuleInfo).getData();

    formData.projectId						= param.projectId;
    formData.ruleStatusCode					= $applyRuleInfo.find('.status').val();
    formData.rateAmountDistinctionCode      = $applyRuleInfo.find('input[name=discount-radio]:checked').val();
    formData.tntInstId                      = selectedTreeItem ? selectedTreeItem.tntInstId : selectedCondition.tntInstId;

    // OHS 20171207 추가 - pdInfoDscd 값을 일괄 세팅처리.
    formData.pdInfoDscd = pdInfoDscd;
    if(formData.ruleApplyTargetDistinctionCode == '01') {            // 01.우대금리적용규칙
        formData.pdCode                     = detailRequestParam.productCode;
    }
    // 서비스제공조건 적용규칙
    else if($applyRuleInfo.find('.rule-apply-target-distinction-code').val() == '03') {
        formData.pdInfoDscd                 = pdInfoDscd_Service;
        formData.pdCode                     = selectedTreeItem.id;
    } else {
        formData.cndGroupTemplateCode 		= detailRequestParam.conditionGroupTemplateCode;
        formData.cndGroupCode 				= detailRequestParam.conditionGroupCode;
        formData.cndCode 					= detailRequestParam.conditionCode;
        if(formData.ruleApplyTargetDistinctionCode == '04' && param.feeDiscountSequenceNumber){
            formData.feeDiscountSequenceNumber = param.feeDiscountSequenceNumber;
        }
    }

    PFRequest.post('/benefit/saveBenefitRuleMaster.json', formData, {
        success: function(responseMessage) {
            if (responseMessage) {
                PFComponent.showMessage(bxMsg('workSuccess'), 'success');

                // 팝업이면
                if($applyRuleInfo.parents('.pfui-dialog').length > 0){
                	popupModifyFlag = false; // resetFormModifed();
                }else{
                	modifyFlag = false; // resetFormModifed();
                }

                searchApplyRule(formData, $applyRuleInfo);
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'BenefitRuleMasterService',
            operation: 'saveBenefitRuleMaster'
        }
    });
}

// 적용규칙 삭제
function deleteApplyRule(projectId, $applyRuleTable){

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    }

    if(!$applyRuleTable) {
        $applyRuleTable = $('.apply-rule-info-wrap .bx-info-table');
    }
    var formData = PFComponent.makeYGForm($applyRuleTable).getData();

    formData.projectId						= projectId;
    formData.tntInstId                      = selectedTreeItem ? selectedTreeItem.tntInstId : selectedCondition.tntInstId;

    PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), function() {

        PFRequest.post('/benefit/deleteBenefitRuleMaster.json', formData, {
            success: function() {
                PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');
                // OHS20180416 주석처리 - 삭제후 수수료할인의 적용규칙을 조회함.
                //searchApplyRule(formData, this.$applyRuleInfo);
                searchApplyRule(formData, $applyRuleTable);

                // 팝업이면
                if($applyRuleTable.parents('.pfui-dialog').length > 0){
                	popupModifyFlag = false; // resetFormModifed();
                }else{
                	modifyFlag = false; // resetFormModifed();
                }
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'BenefitRuleMasterService',
                operation: 'deleteBenefitRuleMaster'
            }
        });

    });
}




/*
 * 이벤트 함수
 */

// 수수료할인 조회기준일 엔터
onEvent('keydown.xdsoft', '.fee-dc-search-base-dt', function(e) {
    if (e.keyCode == '13') {
        detailRequestParam.applyStartDate = $('.fee-dc-search-base-dt').val();
        fnSearchFeeDiscountGridData(detailRequestParam);
    }
});

// 수수료할인 조회기준일 변경 시
onEvent('change', '.fee-dc-search-base-dt', function(e) {
    detailRequestParam.applyStartDate = $('.fee-dc-search-base-dt').val();
    fnSearchFeeDiscountGridData(detailRequestParam);
});

// 적용규칙 검증
onEvent('click', '.rule-validation-btn', function(e) {

	var $applyRuleInfo = $('.apply-rule-info-wrap');
	var ruleContent = $applyRuleInfo.find('.apply-rule').val();
    var count = 0;

    for(var i = 0 ; i < ruleContent.length ; i++){
        if (ruleContent.indexOf(i) === '('){
        	count++;
        }else if(ruleContent.indexOf(i) === ')'){
        	count--;
        }
    }

    if(count !== 0 || !ruleVerifier(ruleContent)){
    	PFComponent.showMessage(bxMsg('applyRuleSyntaxError'), 'warning'); //문법이상

    } else{
    	var requestParam = {
			'tntInstId' : tntInstId,
			'ruleApplyTargetDscd' : $applyRuleInfo.find('.rule-apply-target-distinction-code').val(),
			'cndGroupTemplateCode' : detailRequestParam.conditionGroupTemplateCode,
			'cndGroupCode' : detailRequestParam.conditionGroupCode,
			'cndCode' : detailRequestParam.conditionCode,
			'pdCode': detailRequestParam.pdCode === undefined ? detailRequestParam.productCode : detailRequestParam.pdCode,
			'pdInfoDscd' : detailRequestParam.pdInfoDscd,
            'ruleContent' : ruleContent,
            'applyStartDt': detailRequestParam.applyStart,
            'CndGroupTemplateTypeCode': detailRequestParam.conditionGroupTemplateTypeCode
	    };

    	// 서버 호출
	    PFRequest.get('/common/verifyApplyRule.json', requestParam, {
	        success: function (responseData) {
	        	if (responseData) {
	                PFComponent.showMessage(bxMsg('noAbnormality'),  'success');
	        		$applyRuleInfo.find('.apply-rule-desc').val(responseData);
	        	}
	        },
	        bxmHeader: {
	            application: 'PF_Factory',
	            service: 'CommonService',
	            operation: 'verifyApplyRule'
	        }
	    });
    }
});

function ruleVerifier(ruleContent){
	if(ruleContent == '') return true;
    ruleContent = ruleContent.toLowerCase();
    ruleContent = ruleContent.replace(/ /gi, '');
    
    // OHS20180416 추가 - 특이케이스 체크를 위함
	var _additionalRuleVerifier = function() {
		var resultFlag = true;

		// 규칙에 사용된 조건의 갯수
        var customCndCount = ruleContent.indexOf('#') != -1 ? ruleContent.split('#').length : 0;
        
		if(operator == 'match') {
			var pattOne = new RegExp(/\([0-9]+/);
			var pattTwo = new RegExp(/\)\)+/);
			resultFlag = pattOne.test(ruleContent);
			resultFlag = pattTwo.test(ruleContent);
			
			customCndCount = customCndCount + 1; // match에서는 문법상 ,가 하나더 무조건 있으므로 +1처리
		}
        // 조건의 갯수가 1개이상이어야 함
        // 조건의 갯수만큼 , 로 구분지어야 함. (조건갯수 - 1 은 , 의 갯수. 단, match는 예외처리)
        if(customCndCount - 1 > 1 
        		&& (ruleContent.indexOf(',') == -1)
        				|| (ruleContent.indexOf(',') != -1 && ruleContent.split(',').length != customCndCount -1)) {
        	resultFlag = false;
        	return resultFlag;
        }
        
        // OHS 20180418 추가 - 수수료할인 or 우대금리 or 적용규칙에서 동일한 Discount로 적용규칙을 구성하였을때 체크
        var verifierTokens = PFFormulaEditor.tokenize(ruleContent ? ruleContent.toUpperCase() : '');
        if(verifierTokens == null || verifierTokens.length < 1) {
        	resultFlag = false;
        	return resultFlag;
        }
        
        var functionType1 = null;
        var functionType2 = null;
        for(var i = 0; i < verifierTokens.length; i++) {
        	var dupDiscount = 0;
        	if(verifierTokens[i].type == TokenType.FUNCTION) {
        		functionType1 = verifierTokens[i].value;
        	}
        	
        	for(var j = 0; j < verifierTokens.length; j++) {
        		if(verifierTokens[j].type == TokenType.FUNCTION) {
                    functionType2 = verifierTokens[j].value;
                }
                // 같은 FUNCTION 일때
                if(functionType1 == functionType2) {
                    // 같은 DISCOUNT 일때
                    if(
                    		// 우대금리 이외의 적용규칙 패턴
                    		(TokenType.DISCOUNT == verifierTokens[i].type 
                            && TokenType.DISCOUNT == verifierTokens[j].type
                            && verifierTokens[i].value == verifierTokens[j].value)
                            ||
                            // 우대금리 패턴
                            (TokenType.CONDITION == verifierTokens[i].type 
                            && TokenType.CONDITION == verifierTokens[j].type
                            && verifierTokens[i].value == verifierTokens[j].value)) {
                        dupDiscount++;
                    }
                }
        	}
        	if(dupDiscount > 1) {
        		resultFlag = false;
        		break;
        	}
        }
		return resultFlag;
	}
	
    var node;
    var firstIndex = ruleContent.indexOf('(');
    var operator = ruleContent.substring(0, firstIndex);
    
    if(operator.length > 0 && operatorSet.has(operator)){
    	// OHS20180416 - 추가검증
    	if(!_additionalRuleVerifier(operator)) {
    		return false;
    	}
        //정의된 연산자중 하나면
        //괄호 안의 내용을 다시 검증
        var startIndex = 0;
        var count = 0;
        var lastIndex = ruleContent.lastIndexOf(')');
        var paramContent = ruleContent.substring(firstIndex + 1, lastIndex);

        // OHS20180416 추가 - 규칙에 ')' 가 없으면 false 처리
        if(lastIndex == -1 || lastIndex !== ruleContent.length-1){
            return false;
        }

        var result = null;

        for(var i = 0 ; i < paramContent.length ; i++){

            if(paramContent.charAt(i) === '('){
                count++;
            }else if(paramContent.charAt(i) === ')'){
                count--;
            }else if(paramContent.charAt(i) === ','){
                if(count === 0){
                    result = ruleVerifier(paramContent.substring(startIndex, i));
                    //재귀호출
                    startIndex = i+1;
                }
            }else if(paramContent.length === i+1){
                result = ruleVerifier(paramContent.substring(startIndex, i));
            }

            if(result !== null && !result){
                break;
            }
        }

        if(result === null){
            return false;
        }
        // OHS20180416 - 체크로직 추가
        if(ruleContent != "" && !ruleContent.match('\\(') && !ruleContent.match('\\)')){
            return false;
        }
        return result;

    }else{
        // OHS20180416 - 체크로직 추가
    	if(ruleContent != '' && operatorSet.has(ruleContent)) {
    		return false;
    	}
        //연산자가 아니고 피연산자(#****)도 아니면 에러
        var patt = new RegExp(/^#||[0-9]+/);
        if(!patt.test(ruleContent)){
            return false;
        }else{
            if(ruleContent.match('\\(') || ruleContent.match('\\)')){
                return false;
            }
            return true;
        }
    }
}

// 수수료할인 팝업 emergency control
function fnEmergencyControlForCpl4FeePopup(flag){

    if($('.add-cnd4-fee-tpl-popup').length == 0) {
        return;
    }

    // emergency인 경우 or 상품정보수정인 경우
    if(flag || (getSelectedProjectId() != '' && isUpdateStatus(getSelectedProjectId()))){
        // OHS 20180312 추가 - 긴급or상품정보수정이어도 등록되지않은 상태이면 수정버튼은 비활성화
        if($('.add-cnd4-fee-tpl-popup .feeDiscountSequenceNumber').val() == ''){
            $('.fee-discount-update-btn').prop('disabled', true); // 수정 비활성
            $('.fee-discount-delete-btn').hide();
        }
        else {
        	$('.fee-discount-save-btn').prop('disabled', false); // 등록 비활성화
            $('.fee-discount-update-btn').prop('disabled', false); // 수정 활성화
        }
    }
    // emergency 가 아닌경우
    else{

        /*
         * 수수료할인 탭
         */
        // 신규일때
        if($('.add-cnd4-fee-tpl-popup .feeDiscountSequenceNumber').val() == '') {
            $('.fee-discount-save-btn').prop('disabled', false);            // 등록 활성
            $('.fee-discount-update-btn').prop('disabled', true);           // 수정 비활성
            $('.fee-discount-delete-btn').prop('disabled', true);           // 삭제 비활성
        }
        else{
            // 수정가능 일때
            if($('.add-cnd4-fee-tpl-popup .feeDiscountStatusCode').val() == '01'){
                $('.fee-discount-save-btn').prop('disabled', true);         // 등록 비활성
                $('.fee-discount-update-btn').prop('disabled', false);      // 수정 활성
                $('.fee-discount-delete-btn').prop('disabled', false);      // 삭제 활성
            }
            // 판매중일 때
            else{
                // 수수료할인 탭
                $('.fee-discount-save-btn').prop('disabled', false);        // 등록 활성
                $('.fee-discount-update-btn').prop('disabled', false);      // 수정 활성
                $('.fee-discount-delete-btn').prop('disabled', true);       // 삭제 비활성
            }
        }

        // 제공조건 탭 적용규칙
        // OHS 20180313 - if 조건 추가
        // selector add-cnd4-fee-tpl-popup 추가(메인창의 버튼 영향을 피하기 위함)
        if(!$('.add-cnd4-fee-tpl-popup .rule-id') ||  !$('.add-cnd4-fee-tpl-popup .rule-id').val() || $('.add-cnd4-fee-tpl-popup .rule-id').val() == ''){
            $('.add-cnd4-fee-tpl-popup .pf-cp-apply-rule-delete-btn').prop('disabled', true);                   // 삭제버튼 비활성
            $('.add-cnd4-fee-tpl-popup .pf-cp-apply-rule-grapic-view-btn').prop('disabled', true);              // 그래픽으로보기 버튼 비활성
        }else {
            if ($('.add-cnd4-fee-tpl-popup .ruleStatusCode').val() == '01') {           // 상태코드
                $('.add-cnd4-fee-tpl-popup .pf-cp-apply-rule-delete-btn').prop('disabled', false);              // 삭제버튼 활성
            } else {
                $('.add-cnd4-fee-tpl-popup .pf-cp-apply-rule-delete-btn').prop('disabled', true);               // 삭제버튼 비활성
            }
            $('.add-cnd4-fee-tpl-popup .pf-cp-apply-rule-grapic-view-btn').prop('disabled', false);             // 그래픽으로보기 버튼 활성
        }
    }
}


function setRangeFormat($selector, conditionDetailTypeCode){
    if(conditionDetailTypeCode == '01'){      //  금액
        $selector.find('.minValue').removeClass('float-range-10');
        $selector.find('.maxValue').removeClass('float-range-10');
        $selector.find('.defalueValue').removeClass('float-range-10');
        $selector.find('.increaseValue').removeClass('float-range-10');

        $selector.find('.minValue').removeClass('float-range-0');
        $selector.find('.maxValue').removeClass('float-range-0');
        $selector.find('.defalueValue').removeClass('float-range-0');
        $selector.find('.increaseValue').removeClass('float-range-0');

        $selector.find('.minValue').addClass('float-range-21');
        $selector.find('.maxValue').addClass('float-range-21');
        $selector.find('.defalueValue').addClass('float-range-21');
        $selector.find('.increaseValue').addClass('float-range-21');
    }
    else if(conditionDetailTypeCode == '05' || conditionDetailTypeCode == '08'){    // 율일때
        $selector.find('.minValue').removeClass('float-range-21');
        $selector.find('.maxValue').removeClass('float-range-21');
        $selector.find('.defalueValue').removeClass('float-range-21');
        $selector.find('.increaseValue').removeClass('float-range-21');

        $selector.find('.minValue').removeClass('float-range-0');
        $selector.find('.maxValue').removeClass('float-range-0');
        $selector.find('.defalueValue').removeClass('float-range-0');
        $selector.find('.increaseValue').removeClass('float-range-0');

        $selector.find('.minValue').addClass('float-range-10');
        $selector.find('.maxValue').addClass('float-range-10');
        $selector.find('.defalueValue').addClass('float-range-10');
        $selector.find('.increaseValue').addClass('float-range-10');

    }else{
        $selector.find('.minValue').removeClass('float-range-21');
        $selector.find('.maxValue').removeClass('float-range-21');
        $selector.find('.defalueValue').removeClass('float-range-21');
        $selector.find('.increaseValue').removeClass('float-range-21');

        $selector.find('.minValue').removeClass('float-range-10');
        $selector.find('.maxValue').removeClass('float-range-10');
        $selector.find('.defalueValue').removeClass('float-range-10');
        $selector.find('.increaseValue').removeClass('float-range-10');

        $selector.find('.minValue').addClass('float-range-0');
        $selector.find('.maxValue').addClass('float-range-0');
        $selector.find('.defalueValue').addClass('float-range-0');
        $selector.find('.increaseValue').addClass('float-range-0');

    }
}


function setBenefitTokens(value) {
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
	benefitTokens.push({
	  type: type,
	  value: s
	});
}