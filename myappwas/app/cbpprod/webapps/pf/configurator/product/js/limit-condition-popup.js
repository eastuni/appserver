const limitCndPopupTpl = PFUtil.getTemplate('configurator/product', 'condition/limitCndPopupTpl');


/*******************************
 * 한도조건 팝업
 *******************************/
var _limitCndPopup;
var popupModifyFlag;
function renderLimitCndPopup(data){

	popupModifyFlag = false;

	_limitCndPopup = PFComponent.makePopup({
        title: bxMsg('limitConditionMangement'), //한도조건관리
        width: 600,
        height: 380,
        modifyFlag : 'popup',  // 'main':modifyFlag 사용, 'popup':popupModifyFlag 사용 , 'readOnly':사용안함
        contents: limitCndPopupTpl(data),
        buttons:[
            {text:bxMsg('registration'), elCls:'button button-primary write-btn limit-cnd-reg-btn', handler:function() {

                var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
                if(isNotMyTask(projectId)){
                    return;
                };
                saveLimitCnd('C', projectId);
            }},
            {text:bxMsg('modify'), elCls:'button button-primary write-btn limit-cnd-mod-btn', handler:function() {
                var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
                if(isNotMyTask(projectId)){
                    return;
                };
                saveLimitCnd('U', projectId);
            }},
            {text:bxMsg('ButtonBottomString2'), elCls:'button button-primary write-btn limit-cnd-delete-btn', handler:function() {
                var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
                if(isNotMyTask(projectId)){
                    return;
                };
                // OHS 2018.03.13 추가 - 삭제하시겠습니다? confirm 창 추가
                PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), function() {
                	saveLimitCnd('D', projectId);
                }, function() {
                    return;
                });
            }},
            {text:bxMsg('ButtonBottomString17'), elCls:'button button-primary write-btn', handler:function() {
            	popupModifyFlag = false;
                this.close();
            }}
        ],
        contentsEvent: {
            'click .limit-cnd-history-btn': function () {

                var formData = PFComponent.makeYGForm($('.limit-cnd-info-popup-tpl')).getData();

                renderProvConditionHistoryPopup(formData);
            }
        },
        listeners: {
            afterSyncUI: function() {
                if(data.providedConditionSequenceNumber && data.providedConditionSequenceNumber !== null && data.providedConditionSequenceNumber !== ''){
                    isNewData = false;
                }else{
                    isNewData = true;
                }

                if (data.productBenefitProvidedListConditionList) {
                    var tempObj = {};

                    data.productBenefitProvidedListConditionList.forEach(function(el) {
                        tempObj[el.listCode] = el;
                    });
                }

                PFUtil.getDatePicker(true, $('.limit-cnd-info-popup-tpl'));

                PFRequest.get('/condition/template/getConditionTemplate.json', {'conditionCode': data.providedConditionCode, 'tntInstId': tntInstId}, {
                    success: function(responseData) {
                        if (responseData['values']) {
                            responseData['values'].forEach(function(el) {

                                if (data.productBenefitProvidedListConditionList) {
                                    if (tempObj[el.key]) {
                                        el['isSelected'] = true;
                                    }
                                }
                            });
                            limitListCndCodeGrid = renderLimitListCndCodeGrid(responseData['values']);

                        }
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CndTemplateService',
                        operation: 'queryCndTemplate'
                    }
                });

                $('.limit-cnd-status-name').val(codeMapObj['ProductStatusCode'][data.providedConditionStatusCode]);
                PFUtil.getDatePicker(true, $('.prov-cnd-tpl'));
                if(data.providedConditionTypeCode == '01'){
                    $('.limit-cnd-type1-warp').show();
                    $('.limit-cnd-type2-warp').hide();
                }else if(data.providedConditionTypeCode == '02'){
                    var checkFloatPopup = PFValidation.floatCheck($('.limit-cnd-info-popup-tpl'));
                    checkFloatPopup('.float21', 19, 2);
                    checkFloatPopup('.float10', 3, 6);
                    checkFloatPopup('.float0', 3, 0);
                    
                    // OHS 20180417 추가 - 유형별로 addClass 추가
                    var checkFlatForRageType = PFValidation.floatCheckForRangeType($('.limit-cnd-info-popup-tpl'));
                    checkFlatForRageType('.float-range-21', 19, 2);
                    
                    // 금액, 숫자
                    if(data.providedConditionDetailTypeCode == '01' || data.providedConditionDetailTypeCode == '04'){
                   	 $('.limit-cnd-info-popup-tpl').find('input[data-form-param=minValue]').addClass('float-range-21');
                   	 $('.limit-cnd-info-popup-tpl').find('input[data-form-param=maxValue]').addClass('float-range-21');
                    }
                    // 율
                    else if (data.providedConditionDetailTypeCode == '05'){
                   	 $('.limit-cnd-info-popup-tpl').find('input[data-form-param=minValue]').addClass('float10');
                   	 $('.limit-cnd-info-popup-tpl').find('input[data-form-param=maxValue]').addClass('float10');
                    }
                    else if(data.providedConditionDetailTypeCode == '02'){
                   	 $('.limit-cnd-info-popup-tpl').find('input[data-form-param=minValue]').addClass('float0');
                   	 $('.limit-cnd-info-popup-tpl').find('input[data-form-param=maxValue]').addClass('float0');
                    }
                    else{
                   	 $('.limit-cnd-info-popup-tpl').find('input[data-form-param=minValue]').addClass('float21');
                   	 $('.limit-cnd-info-popup-tpl').find('input[data-form-param=maxValue]').addClass('float21');
                    }
                    
                    var focusDragPopup = PFValidation.dragAll($('.limit-cnd-info-popup-tpl'));
                    focusDragPopup('.float21');
                    focusDragPopup('.float19');
                    focusDragPopup('.float10');
                    focusDragPopup('.float0');
                    focusDragPopup('.float-range-21');

                    $('.limit-cnd-type1-warp').hide();
                    $('.limit-cnd-type2-warp').show();
                    //금액
                    if(data.providedConditionDetailTypeCode == '01'){
                        $('.limit-cnd-currency-code').show();
                        $('.limit-cnd-mesure-code').hide();
                        renderComboBox('CurrencyCode', $('.limit-cnd-currency-code-combo'));
                        
                        // OHS 20180417 - default 값 선택처리
                        if(data.currencyCode) {
                        	$('.limit-cnd-currency-code-combo').val(data.currencyCode);
                        }
                        else {
                        	$('.limit-cnd-currency-code-combo').find('option:eq(0)').prop('selected', true);
                        }
                    }else{
                        $('.limit-cnd-currency-code').hide();
                        $('.limit-cnd-mesure-code').show();

                        if(data.providedConditionDetailTypeCode === '02'){//율
                            renderComboBox('ProductMeasurementUnitCodeD', $('.limit-cnd-mesurement-unit-code-combo'));
                        }else if(data.providedConditionDetailTypeCode === '03'){//숫자
                            renderComboBox('ProductMeasurementUnitCodeF', $('.limit-cnd-mesurement-unit-code-combo'));
                        }else if(data.providedConditionDetailTypeCode === '04'){//주기
                            renderComboBox('ProductMeasurementUnitCodeN', $('.limit-cnd-mesurement-unit-code-combo'));
                        }else if(data.providedConditionDetailTypeCode === '05') {//날짜
                            renderComboBox('ProductMeasurementUnitCodeR', $('.limit-cnd-mesurement-unit-code-combo'));
                        }
                        // OHS 20180417 - default 값 선택처리
                        if(data.mesurementUnitCode) {
                        	$('.limit-cnd-mesurement-unit-code-combo').val(data.mesurementUnitCode);
                        }
                        else {
                        	$('.limit-cnd-mesurement-unit-code-combo').find('option:eq(0)').prop('selected', true);
                        }
                    }
                    // OHS 20180417 추가 - 자릿수 통일을위해 추가
                    $('.limit-cnd-info-popup-tpl').find('input[data-form-param=minValue]').trigger('blur');
                    $('.limit-cnd-info-popup-tpl').find('input[data-form-param=maxValue]').trigger('blur');
                }

                if(isNewData){
                    $('.limit-cnd-history-btn').hide();
                }

                if(writeYn != 'Y'){
                    $('.write-btn').hide();
                }else{
                    //수정가능
                    if($('.limit-cnd-status').val() === '01') {
                        if(isNewData){
                        	// 신규 일때는 등록활성/수정비활성/삭제활성 (수정가능일 경우 긴급상관 없음)
//                            if(isEmergency(getSelectedProjectId())){
//                                $('.limit-cnd-reg-btn').prop('disabled', true);	 // 등록 비활성
//                            }else{
                                $('.limit-cnd-reg-btn').prop('disabled', false); // 등록 활성
//                            }
                            $('.limit-cnd-delete-btn').prop('disabled', true);	 // 삭제 비활성
                            $('.limit-cnd-mod-btn').prop('disabled', true);		 // 수정 비활성
                        }else {
                            $('.limit-cnd-reg-btn').prop('disabled', true);		 // 등록 비활성
                        }
                    }
                    //판매중
                    else if($('.limit-cnd-status').val() === '04' ){
                        //emergency
                        if(getSelectedProjectId() && isEmergency(getSelectedProjectId())){
                            $('.limit-cnd-reg-btn').prop('disabled', false);
                            $('.limit-cnd-mod-btn').prop('disabled', false);
                            $('.limit-cnd-delete-btn').prop('disabled', false);
                        }else{
                            $('.limit-cnd-reg-btn').prop('disabled', false);
                            $('.limit-cnd-mod-btn').prop('disabled', false);
                            $('.limit-cnd-delete-btn').prop('disabled', true);

                        }
                    }
                }
            }
        }
    });
}


/**
 * 한도조건 팝업 한도조건값 그리드(목록조건)
 */
function renderLimitListCndCodeGrid(data){

    var checkboxmodel = Ext.create ('Ext.selection.CheckboxModel', {mode:'MULTI'});

    var grid = PFComponent.makeExtJSGrid({
        fields: ['key','value', 'isSelected'],
        gridConfig: {
            selModel: checkboxmodel,
            renderTo: '.limit-cnd-list-code-grid',
            columns: [
                {text: bxMsg('DPS0121_21String1'), flex: 0.5, dataIndex: 'key', align:'center'},
                {text: bxMsg('DPS0121_21String2'), flex: 1, dataIndex: 'value', align:'center'}
            ],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ],
            listeners:{
                scope: this,
                'viewready' : function(_this, eOpts){
                    if(data){
                        $.each(limitListCndCodeGrid.getAllData(), function(index, condition){
                            $.each(data, function(idx, thisRowCondition){
                                if(condition.key == thisRowCondition.key && thisRowCondition.isSelected){
                                    checkboxmodel.select(index, true);
                                }
                            });
                        })
                    }
                },
                'cellclick' : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts){
                	popupModifyFlag = true;
                }
            }
        }
    });

    if(data) {
        grid.setData(data);
    }
    return grid;
}


function saveLimitCnd(process, projectId, ruleApplyTargetDistinctionCode) {

    if(process === 'U' && !popupModifyFlag){
		// 변경된 정보가 없습니다.
		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
		return;
	}

    // OHS 20180417 - 최소값, 최대값 체크로직 추가, 단 삭제일때는 체크하지 않음.
	if(process != 'D' && !PFValidation.minMaxCheck($('.limit-cnd-info-popup-tpl')
			, 'input[data-form-param="minValue"]'
			, 'input[data-form-param="maxValue"]'
			, ''
			, '')) {
		PFComponent.showMessage(bxMsg('DPS0126_1Error4'), 'warning');
		return;
	}
	
    var formData = {};
    var limitCnd = [];
    var getUrl;
    var bxmHeader;
    var temp = PFComponent.makeYGForm($('.limit-cnd-info-popup-tpl')).getData();
    if(temp.providedConditionTypeCode === '01'){
        temp.productBenefitProvidedListConditionList = limitListCndCodeGrid.getSelectedItem();

        temp.productBenefitProvidedListConditionList.forEach(function(el) {
            el.listCode = el.key;
        });
    }
    temp.conditionApplyTargetDscd = conditionApplyTargetDscd;
    temp.cndDscd = '02';

    if(classForEvent){
        //수수료통합한도일때
        temp.feeDiscountIntegrationLimitCd = classForEvent.id;
        getUrl = '/benefit/queryListBenefitProvideCndForFeeIntegration.json'
        bxmHeader = {
            application: 'PF_Factory',
            service: 'BenefitProvideCndService',
            operation: 'queryListBenefitProvideCndForIntegration'
        }
    }else{
        //수수료통합한도 아닐때
        formData.conditionGroupTemplateCode = detailRequestParam.conditionGroupTemplateCode;
        formData.conditionGroupCode = detailRequestParam.conditionGroupCode;
        formData.conditionCode = detailRequestParam.conditionCode;
        formData.feeDiscountSequenceNumber = $('.feeDiscountSequenceNumber').val();
        getUrl ='/benefit/queryListBenefitProvideCnd.json';
        bxmHeader = {
            application: 'PF_Factory',
            service: 'BenefitProvideCndService',
            operation: 'queryListBenefitProvideCnd'
        }
    }

    temp.process = process;
    limitCnd.push(temp);

    formData.productBenefitProvidedConditonList = limitCnd;
    formData.projectId = projectId;

    formData.productBenefitProvidedConditonList.forEach(function(el) {

        if (el.productBenefitProvidedListConditionList == '') {
            delete el.productBenefitProvidedListConditionList;
        }

        delete el.conditionDetailTypeCode;
    });

    PFRequest.post('/benefit/saveBenefitProvideCnd.json', formData, {
        success: function(responseData) {

        	// OHS 20180313 추가 - 삭제(D)일경우에 아래로직을 탈 수 있도록 조건문 수정
            if (responseData || (process == 'D' && !responseData)) {

                PFComponent.showMessage(bxMsg('workSuccess'),  'success');
                deleteConditionList = [];
                popupModifyFlag = false;

                // 우대금리 제공조건 그리드 조회 (일련번호 바인딩을 위함)
                delete formData.productBenefitProvidedConditonList;
                formData.cndDscd = '02';

                if(classForEvent) {
                    formData.feeDiscountIntegrationLimitCd = classForEvent.id;
                }

                if($('.bnft-prov-cnd-search').val()) {
                    formData.applyStartDate = $('.bnft-prov-cnd-search').val();
                }
                else {
                    delete formData.applyStartDate;
                }

                // OHS 20180313 추가 - 한도조건추가시 성공메세지가 뜰경우에만 팝업을 종료하고
                // 수수료할인 신규 팝업-한도조건 그리드의 데이터를 조회하도록 함
                _limitCndPopup.popup.close();

                PFRequest.get(getUrl, formData, {
                    success: function(data) {
//                        limitConditionInfoGrid.setData(data);

                    	// OHS 20180313 수정 - feeDiscountLimitConditionInfoGrid.setData()에서 스크립트오류발생하여
                    	// limitConditionInfoGrid.setData() 로직 추가. side effect 체크가 되질않아 최대한 오류안나게 수정
                    	if(limitConditionInfoGrid) {
                    		limitConditionInfoGrid.setData(data);
                    	}
                    	else {
                    		feeDiscountLimitConditionInfoGrid.setData(data);
                    	}
                    },
                    bxmHeader: bxmHeader
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
