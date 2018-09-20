const provCndPopupTpl = PFUtil.getTemplate('configurator/product', 'condition/provCndPopupTpl');
const provCndHistoryPopupTpl = PFUtil.getTemplate('configurator/product', 'condition/provCndHistoryPopupTpl');

//서비스제공조건그리드
var providedConditionGrid;

/******
 * 제공조건 팝업용 변수
 */
var provListCndCodeGrid,
    provListCndCodeHistoryGrid,
    provAddInfoGrid,
    isNewData,
    isReadOnly;

/*****************************************************************************************
 * 제공조건 관련
 */

/*******************************
 * 제공조건 팝업
 *******************************/
var popupModifyFlag;
var originalData;
function renderProvCndPopup(data, isReadOnly){
	originalData = {};
	popupModifyFlag = false;
    var buttons = [];
    if(!isReadOnly){
        buttons.push({text:bxMsg('registration'), elCls:'button button-primary write-btn prov-cnd-reg-btn', handler:function() {

                var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
                if(isNotMyTask(projectId)){
                    return;
                };
                saveBenefitProvideCndPopup('C', projectId);

            }},
            {text:bxMsg('modify'), elCls:'button button-primary write-btn prov-cnd-mod-btn', handler:function() {
                var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
                if(isNotMyTask(projectId)){
                    return;
                };
                var temp = PFComponent.makeYGForm($('.prov-cnd-tpl')).getData();
                var that = this;
                
                // OHS 20171206 수정 - getSelectedProjectId() && isEmergency(getSelectedProjectId() 체크로직 추가 ( 긴급적용이 아닐때만 ShowConfirm )
            	if(temp.providedConditionStatusCode === '04') {
            		if(getSelectedProjectId() && !isEmergency(getSelectedProjectId())) {
            			/**
            			PFComponent.showConfirm(bxMsg('UpdateAplyEndDateWarning'), function() {
            				saveBenefitProvideCndPopup('U', projectId);
            			}, function() {
            				return;
            			});
            			*/
            			saveBenefitProvideCndPopup('U', projectId);
            		}
            		else {
            			saveBenefitProvideCndPopup('U', projectId);
            		}
            		
                }else if(temp.providedConditionStatusCode === '01'){
                	saveBenefitProvideCndPopup('U', projectId);
                }

            }},
            {text:bxMsg('ButtonBottomString2'), elCls:'button button-primary write-btn prov-cnd-delete-btn', handler:function() {
                var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
                if(isNotMyTask(projectId)){
                    return;
                };
                saveBenefitProvideCndPopup('D', projectId, undefined, this);

                //this.close();
            }});
    }

    buttons.push(
        {text:bxMsg('ButtonBottomString17'), elCls:'button button-primary write-btn', handler:function() {

        	popupModifyFlag = false;
            this.close();
        }}
    );

    PFComponent.makePopup({
        title: bxMsg('provideConditionMangement'),
        width: 600,
        height: 630,
        contents: provCndPopupTpl(data),
        modifyFlag : 'popup',
        buttons:buttons,
        contentsEvent: {
            //부가정보 추가
            'click .prov-cnd-add-info-add-btn': function () {

        		var tmpData = {
            	}

        		provAddInfoGrid.addData(tmpData);
        		popupModifyFlag = true;
            }
            ,'click .prov-cnd-history-btn': function () {

                var formData = PFComponent.makeYGForm($('.prov-cnd-tpl')).getData();

                renderProvConditionHistoryPopup(formData);
            }
        },
        listeners: {
            afterSyncUI: function() {

                if(isReadOnly){
                    $('.prov-cnd-add-info-add-btn').hide();
                }

                if(data.providedConditionSequenceNumber && data.providedConditionSequenceNumber !== null && data.providedConditionSequenceNumber !== ''){
                    isNewData = false;
                }else{
                    isNewData = true;
                }

                if(isNewData){
                    $('.prov-cnd-history-btn').hide();
                }else{
                    $('.prov-cnd-history-btn').show();
                }

                if (data.productBenefitProvidedListConditionList) {
                    var tempObj = {};

                    data.productBenefitProvidedListConditionList.forEach(function(el) {
                        tempObj[el.listCode] = el;
                    });
                    
                    originalData.productBenefitProvidedListConditionList = {};
                    originalData.productBenefitProvidedListConditionList = data.productBenefitProvidedListConditionList;
                }

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
                            provListCndCodeGrid = renderProvListCndCodeGrid(responseData['values'], 'prov-cnd-list-code-grid');
                        }
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CndTemplateService',
                        operation: 'queryCndTemplate'
                    }
                });

                $('.prov-cnd-status-name').val(codeMapObj['ProductStatusCode'][data.providedConditionStatusCode]);
                PFUtil.getDatePicker(true, $('.prov-cnd-tpl'));
                
                // 제공조건유형 '01' - 목록형
                if(data.providedConditionTypeCode == '01'){
                    $('.prov-cnd-type1-warp').show();
                    $('.prov-cnd-type2-warp').hide();
                }
                // 제공조건유형 '02' - 범위형
                else if(data.providedConditionTypeCode == '02'){
                	
                	// OHS20180417 추가 - 범위형에 대해 소수점 처리 로직 추가
                	 var checkFloat = PFValidation.floatCheck($('.prov-cnd-type2-warp'));
                     checkFloat('.float21', 19, 2);
                     checkFloat('.float10', 3, 6);
                     checkFloat('.float0', 8, 0);

                     var checkFlatForRageType = PFValidation.floatCheckForRangeType($('.prov-cnd-type2-warp'));
                     checkFlatForRageType('.float-range-21', 19, 2);

                     // 금액, 숫자
                     if(data.providedConditionDetailTypeCode == '01' || data.providedConditionDetailTypeCode == '04'){
                    	 $('.prov-cnd-type2-warp').find('input[data-form-param=minValue]').addClass('float-range-21');
                    	 $('.prov-cnd-type2-warp').find('input[data-form-param=maxValue]').addClass('float-range-21');
                     }
                     // 율
                     else if (data.providedConditionDetailTypeCode == '05'){
                    	 $('.prov-cnd-type2-warp').find('input[data-form-param=minValue]').addClass('float10');
                    	 $('.prov-cnd-type2-warp').find('input[data-form-param=maxValue]').addClass('float10');
                     }
                     else if(data.providedConditionDetailTypeCode == '02'){
                    	 $('.prov-cnd-type2-warp').find('input[data-form-param=minValue]').addClass('float0');
                    	 $('.prov-cnd-type2-warp').find('input[data-form-param=maxValue]').addClass('float0');
                     }
                     else{
                    	 $('.prov-cnd-type2-warp').find('input[data-form-param=minValue]').addClass('float21');
                    	 $('.prov-cnd-type2-warp').find('input[data-form-param=maxValue]').addClass('float21');
                     }
                     
                     // OHS20180417 - drag 기능 추가
                     var focusDrag = PFValidation.dragAll($('.prov-cnd-type2-warp'));
                     focusDrag('.float21');
                     focusDrag('.float10');
                     focusDrag('.float0');
                     focusDrag('.float-range-21');
                	
                    $('.prov-cnd-type1-warp').hide();
                    $('.prov-cnd-type2-warp').show();
                    //금액
                    if(data.providedConditionDetailTypeCode == '01'){
                        $('.prov-cnd-currency-code').show();
                        $('.prov-cnd-mesure-code').hide();
                        renderComboBox('CurrencyCode', $('.prov-cnd-currency-code-combo'));
                        
                        // OHS 20180417 - default 값 선택처리
                        if(data.currencyCode) {
                        	$('.prov-cnd-currency-code-combo').val(data.currencyCode);
                        }
                        else {
                        	$('.prov-cnd-currency-code-combo').find('option:eq(0)').prop('selected', true);
                        }
                    }else{
                        $('.prov-cnd-currency-code').hide();
                        $('.prov-cnd-mesure-code').show();

                        if(data.providedConditionDetailTypeCode === '02'){//율
                            renderComboBox('ProductMeasurementUnitCodeD', $('.prov-cnd-mesurement-unit-code-combo'));
                        }else if(data.providedConditionDetailTypeCode === '03'){//숫자
                            renderComboBox('ProductMeasurementUnitCodeF', $('.prov-cnd-mesurement-unit-code-combo'));
                        }else if(data.providedConditionDetailTypeCode === '04'){//주기
                            renderComboBox('ProductMeasurementUnitCodeN', $('.prov-cnd-mesurement-unit-code-combo'));
                        }else if(data.providedConditionDetailTypeCode === '05') {//날짜
                            renderComboBox('ProductMeasurementUnitCodeR', $('.prov-cnd-mesurement-unit-code-combo'));
                        }
                        setRangeFormat($('.prov-cnd-tpl'), data.providedConditionDetailTypeCode);
                        // OHS 20180417 - default 값 선택처리
                        if(data.mesurementUnitCode) {
                        	$('.prov-cnd-mesurement-unit-code-combo').val(data.mesurementUnitCode);
                        }
                        else {
                        	$('.prov-cnd-mesurement-unit-code-combo').find('option:eq(0)').prop('selected', true);
                        }
                    }
                    // OHS 20180417 추가 - 자릿수 통일을위해 추가
                    $('.prov-cnd-type2-warp').find('input[data-form-param=minValue]').trigger('blur');
                    $('.prov-cnd-type2-warp').find('input[data-form-param=maxValue]').trigger('blur');
                }

                if(data.provideCndAdditionalInfoDetailList && data.provideCndAdditionalInfoDetailList.length > 0) {
	                originalData.provideCndAdditionalInfoDetailList = {};
	                originalData.provideCndAdditionalInfoDetailList = data.provideCndAdditionalInfoDetailList;
                }
                provAddInfoGrid = renderProvCndAddInfoGrid(data.provideCndAdditionalInfoDetailList);


                if(writeYn != 'Y'){
                    $('.write-btn').hide();
                }else{
                    //수정가능
                    if($('.prov-cnd-status').val() === '01') {
                        if(isNewData){
                            $('.prov-cnd-reg-btn').prop('disabled', false);
                            $('.prov-cnd-delete-btn').prop('disabled', true);
                            $('.prov-cnd-mod-btn').prop('disabled', true);
                        }else {
                            $('.prov-cnd-reg-btn').prop('disabled', true);
                        }
                    }
                    //판매중
                    else if($('.prov-cnd-status').val() === '04' ){
                        //emergency
                        if(getSelectedProjectId() && isEmergency(getSelectedProjectId())){
                            $('.prov-cnd-reg-btn').prop('disabled', false);
                            $('.prov-cnd-mod-btn').prop('disabled', false);
                            $('.prov-cnd-delete-btn').prop('disabled', false);
                        }else{
                            $('.prov-cnd-reg-btn').prop('disabled', false);
                            $('.prov-cnd-mod-btn').prop('disabled', false);
                            $('.prov-cnd-delete-btn').prop('disabled', true);


                        }
                    }
                }
                
                // OHS 20180420 - 비교를하기위한 데이터 조립
                var listDataBackup = [];
                if(originalData.productBenefitProvidedListConditionList && originalData.productBenefitProvidedListConditionList.length > 0) {
                	for(var i = 0; i < originalData.productBenefitProvidedListConditionList.length; i++) {
                		listDataBackup[i] = {};
                		listDataBackup[i]['key'] = originalData.productBenefitProvidedListConditionList[i].listCode;
                		listDataBackup[i]['listCode'] = originalData.productBenefitProvidedListConditionList[i].listCode;
                		listDataBackup[i]['value'] = originalData.productBenefitProvidedListConditionList[i].listCodeName;
                		//listDataBackup[i]['isSelected'] = '';
                	}
                }
                var additionDataBackup = [];
                if(originalData.provideCndAdditionalInfoDetailList && originalData.provideCndAdditionalInfoDetailList.length > 0) {
                	for(var i = 0; i < originalData.provideCndAdditionalInfoDetailList.length; i++) {
                		additionDataBackup[i] = {};
                		additionDataBackup[i]['additionalInfoTypeDscd'] = originalData.provideCndAdditionalInfoDetailList[i].additionalInfoTypeDscd;
                		additionDataBackup[i]['additionalInfoValue'] = originalData.provideCndAdditionalInfoDetailList[i].additionalInfoValue;
                		additionDataBackup[i]['additionalInfoValueName'] = originalData.provideCndAdditionalInfoDetailList[i].additionalInfoValueName;
                		additionDataBackup[i]['applyStartDate'] = originalData.provideCndAdditionalInfoDetailList[i].applyStartDate;
                		additionDataBackup[i]['provideCndSequenceNumber'] = originalData.provideCndAdditionalInfoDetailList[i].provideCndSequenceNumber;
                	}
                }
                originalData = PFComponent.makeYGForm($('.prov-cnd-tpl')).getData();
                originalData.productBenefitProvidedListConditionList = listDataBackup;
                originalData.provideCndAdditionalInfoDetailList = additionDataBackup;
            }
        }
    });
}
/**
 * 제공조건 팝업 제공조건값 그리드(목록조건)
 */

function renderProvListCndCodeGrid(data, renderTo){

    var checkboxmodel = Ext.create ('Ext.selection.CheckboxModel', {mode:'MULTI'});

    var grid = PFComponent.makeExtJSGrid({
        fields: ['key','value', 'isSelected'],
        gridConfig: {
            selModel: checkboxmodel,
            renderTo: '.' + renderTo,
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
                        $.each(_this.getStore().data.items, function(index, condition){
                            $.each(data, function(idx, thisRowCondition){
                                if(condition.data.key == thisRowCondition.key && thisRowCondition.isSelected){
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

/**
 * 제공조건 팝업 부가정보 그리드
 */
function renderProvCndAddInfoGrid(data){

    var columns = [
        {
            text: bxMsg('PAS0102String10'),  flex:1, dataIndex: 'additionalInfoTypeDscd',
            style: 'text-align:center',
            renderer: function(value) {
                return codeMapObj.AdtnlInfoTpDscd[value] || value;
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
                    data: codeArrayObj['AdtnlInfoTpDscd']
                })
            }
        },
        {
            text : bxMsg('PAS0203String3'),
            flex:5,
            dataIndex: 'additionalInfoValueName',
            sortable: false,
            style: 'text-align:center'
        },
        {
            xtype: 'actioncolumn', width: 35, align: 'center',
            style: 'text-align:center',
            items: [{
                icon: '/images/x-delete-16.png',
                handler: function (grid, rowIndex, colIndex, item, e, record) {
                    record.destroy();
                    modifyFlag = true;
                }
            }]
        }
    ];

    var grid = PFComponent.makeExtJSGrid({
        fields: [
            'provideCndSequenceNumber', 'additionalInfoTypeDscd', 'additionalInfoValue', 'additionalInfoValueName',
            'applyStartDate'
        ],
        gridConfig: {
            renderTo: '.prov-cnd-add-info-grid',
            columns : columns,
            listeners: {
                scope: this,
                itemdblclick : function(tree, record){
                	if(record.data.additionalInfoTypeDscd === ""){

                		return;

                	}
                	// 상품
                	else if(record.data.additionalInfoTypeDscd === "01"){

                        var data = PFComponent.makeYGForm($('.prov-cnd-tpl')).getData();

                        record.destroy();
                        PFPopup.selectProduct({
                        	pdInfoDscd : pdInfoDscd_Product,	// 상품
                          isSelectTemplate: true,
                          multi: true,
                        }, (selectItem) => {
                          selectItem.forEach((el) => {
                            el.additionalInfoValue = el.code;
                            el.additionalInfoValueName = el.name;
                            el.additionalInfoTypeDscd = '01';   // 상품
                            el.provideCndSequenceNumber = data.providedConditionSequenceNumber;
                            el.applyStartDate =data.applyStartDate;

                            delete el.code;
                            delete el.name;

                            provAddInfoGrid.addData(el);
                          });
                        });

                	}else if(record.data.additionalInfoTypeDscd === "02"){
                        var data = PFComponent.makeYGForm($('.prov-cnd-tpl')).getData();
                        record.destroy();
                        PFPopup.selectProductGroup({ multi: true }, (selectItem) => {
                            selectItem.forEach((el) => {
                                el.additionalInfoValue = el.classificationStructureDistinctionCode + ":" + el.classificationCode + ":" + el.applyStartDate;
                                el.additionalInfoValueName = el.classificationName;
                                el.additionalInfoTypeDscd = '02';   // 상품
                                el.provideCndSequenceNumber = data.providedConditionSequenceNumber;
                                el.applyStartDate = data.applyStartDate;

                                delete el.classificationCode;
                                delete el.classificationStructureDistinctionCode;
                                delete el.classificationName;

                                provAddInfoGrid.addData(el);
                            });
                        });
                	}
                }
            },
            plugins: [
                      Ext.create('Ext.grid.plugin.CellEditing', {
                          clicksToEdit: 1
                      })
            ]
        }
    });

    if(data) {
        grid.setData(data);
    }
    return grid;
}

/**
 * 제공조건팝업 등록,수정 함수
 * @param process : Create (C) or Update (U)
 * @param projectId
 * @param ruleApplyTargetDistinctionCode
 * @returns
 */
function saveBenefitProvideCndPopup(process, projectId, ruleApplyTargetDistinctionCode, _this) {

    if(process === 'U' && !popupModifyFlag){
		// 변경된 정보가 없습니다.
		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
		return;
	}

    var formData = {};
    var provCnd = [];
    var temp = PFComponent.makeYGForm($('.prov-cnd-tpl')).getData();

    if(temp.providedConditionTypeCode === '01') {
        temp.productBenefitProvidedListConditionList = provListCndCodeGrid.getSelectedItem();
        temp.productBenefitProvidedListConditionList.forEach(function (el) {
            el.listCode = el.key;
        });
    }
    temp.provideCndAdditionalInfoDetailList = provAddInfoGrid.getAllData();
    temp.isAdditionalInfoExist = false;
    if(temp.provideCndAdditionalInfoDetailList.length > 0){
        temp.isAdditionalInfoExist = true;
    }
    temp.conditionApplyTargetDscd = conditionApplyTargetDscd;
    temp.process = process;
    provCnd.push(temp);

    formData.productBenefitProvidedConditonList = provCnd;
    formData.projectId = projectId;
    formData.feeDiscountSequenceNumber = $('.feeDiscountSequenceNumber').val();
    formData.cndDscd = '01'

    // 2017.01.24 OHS product-condition.js 2954 line -> '03' 이면 서비스제공조건세팅
    ruleApplyTargetDistinctionCode = !ruleApplyTargetDistinctionCode ? detailRequestParam.ruleApplyTargetDistinctionCode : ruleApplyTargetDistinctionCode;
    if(ruleApplyTargetDistinctionCode == '03'){
        formData.pdInfoDscd = pdInfoDscd_Service;
        formData.productCode = selectedTreeItem.id;

    } else {
        formData.conditionGroupTemplateCode = detailRequestParam.conditionGroupTemplateCode;
        formData.conditionGroupCode = detailRequestParam.conditionGroupCode;
        formData.conditionCode = detailRequestParam.conditionCode;
    }

    formData.productBenefitProvidedConditonList.forEach(function(el) {

    	// OHS 20180417 추가 - 범위형일경우 통화코드 또는 측정단위가 모두 값이 없을경우 에러
    	if(process != 'D' && el.providedConditionTypeCode == '02') {
    		if(!el.currencyCode && !el.mesurementUnitCode) {
    			// TODO
    		}
    	}
    	
        if(ruleApplyTargetDistinctionCode == '03'){
//            formData.pdInfoDscd = pdInfoDscd_Service;
//            formData.pdCode = selectedTreeItem.id;     // pdCode
        } else {
            el.conditionGroupTemplateCode = detailRequestParam.conditionGroupTemplateCode;
            el.conditionGroupCode = detailRequestParam.conditionGroupCode;
            el.conditionCode = detailRequestParam.conditionCode;
        }

        if (el.productBenefitProvidedListConditionList == '') {
            delete el.productBenefitProvidedListConditionList;
        }

        delete el.conditionDetailTypeCode;
    });
    
    // OHS 20180417 - 최소값, 최대값 체크로직 추가, 단 삭제일때는 체크하지 않음.
	if(process != 'D' && !PFValidation.minMaxCheck($('.prov-cnd-tpl')
			, 'input[data-form-param="minValue"]'
			, 'input[data-form-param="maxValue"]'
			, ''
			, '')) {
		PFComponent.showMessage(bxMsg('DPS0126_1Error4'), 'warning');
		return;
	}
	
	// OHS 20180420 추가 - 적용종료일자를 제외한 정보가 수정되었을때 메세지 출력
	var compareData = $.extend(true, {}, formData);
	compareData = compareData.productBenefitProvidedConditonList;
	delete compareData[0].process;
	delete compareData[0].isAdditionalInfoExist;
	delete compareData[0].conditionCode;
	delete compareData[0].conditionApplyTargetDscd;
	delete compareData[0].conditionGroupCode;
	delete compareData[0].conditionGroupTemplateCode;
	delete compareData[0].applyEndDate;
	
	if(compareData[0].productBenefitProvidedListConditionList && compareData[0].productBenefitProvidedListConditionList.length > 0) {
		for(var i = 0; i < compareData[0].productBenefitProvidedListConditionList.length; i++) {
			delete compareData[0].productBenefitProvidedListConditionList[i].isSelected;
		}
	}
	delete originalData.applyEndDate;
	
	// KYL 20180718 추가 - originalData에 productBenefitProvidedListConditionList 없으면 originalData 에서 제거
	if(!originalData.productBenefitProvidedListConditionList || originalData.productBenefitProvidedListConditionList.length == 0) {
		delete originalData.productBenefitProvidedListConditionList;
	}
	
	if(process == 'U' && $('.prov-cnd-status').val() == '04'
		&& originalData && !PFValidation.compare(originalData, compareData[0])) {
		PFComponent.showMessage(bxMsg('UpdateAplyEndDateWarning'), 'warning');
		return;
	}

	function saveBenefitProvideCnd(_this) {
		PFRequest.post('/benefit/saveBenefitProvideCnd.json', formData, {
	        success: function(responseData) {
	        	// OHS 20180313 추가 - 삭제(D)일경우에 아래로직을 탈 수 있도록 조건문 수정
	            if (responseData || (process == 'D' && !responseData)) {

	                // 등록인경우
	                if(process == 'C'){
	                    $('.prov-cnd-tpl .providedConditionSequenceNumber').val(responseData);  // 일련번호 바인딩
	                    $('.prov-cnd-reg-btn').prop('disabled', true);          // 등록버튼 비활성
	                    $('.prov-cnd-delete-btn').prop('disabled', false);       // 삭제버튼 활성
	                    $('.prov-cnd-mod-btn').prop('disabled', false);          // 수정버튼 활성
	                    

	                    // OHS 20180425 추가 - 판매중이고 등록이 성공하였을때는 상태를 바꿔준다.
	                    if($('.prov-cnd-status').val() == '04') {
		                    $('.prov-cnd-status').val('01')
		                    $('.prov-cnd-status-name').val(codeMapObj['ProductStatusCode']['01']);
	                    }
	                }

	                PFComponent.showMessage(bxMsg('workSuccess'),  'success');
	                deleteConditionList = [];
	                popupModifyFlag = false;	// resetFormModifed();

	                // 우대금리 제공조건 그리드 조회 (일련번호 바인딩을 위함)
	                delete formData.productBenefitProvidedConditonList;
	                formData.cndDscd = '01';

	                if($('.bnft-prov-cnd-search').val()) {
	                    formData.applyStartDate = $('.bnft-prov-cnd-search').val();
	                }
	                else {
	                    delete formData.applyStartDate;
	                }

	                formData.pdCode = formData.productCode;     // pdCode
	                PFRequest.get('/benefit/queryListBenefitProvideCnd.json', formData, {
	                    success: function(data) {
	                    	// 서비스제공조건
	                    	if(providedConditionGrid) {
	                    		providedConditionGrid.setData(data);
	                    	}
	                    	else if(cndType3Grid){
	                            //우대금리제공조건 그리드
	                            cndType3Grid.setData(data);
	                        }else{
	                            //수수료할인팝업 제공조건 그리드
	                            cnd4feePopupGrid.setData(data);
	                        }
	                    		                    	
	                    	// KYL 20180724 추가
	                    	modifyFlag = false;
	                    	
	                    },
	                    bxmHeader: {
	                        application: 'PF_Factory',
	                        service: 'BenefitProvideCndService',
	                        operation: 'queryListBenefitProvideCnd'
	                    }
	                });
	                
	                if(_this) {
	                	_this.close();
	                }
	            }
	        },
	        bxmHeader: {
	            application: 'PF_Factory',
	            service: 'BenefitProvideCndService',
	            operation: 'saveBenefitProvideCnd'
	        }
	    });
	}
		
	// OHS 20180508 추가 - 삭제일경우 '삭제하시겠습니까' confirm 창 추가
	if(process == 'D') {
		formData.ruleApplyTargetDistinctionCode = ruleApplyTargetDistinctionCode ? ruleApplyTargetDistinctionCode : '04' ;
	    PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), function() {
	    	saveBenefitProvideCnd(_this);
	    }, 
	    function() {
	        return;
	    });
	}
	else {
		saveBenefitProvideCnd();
	}
}


/**
 * 제공조건 이력 팝업
 */
function renderProvConditionHistoryPopup(data){
    provListCndCodeHistoryGrid = null;
    PFComponent.makePopup({
        title: bxMsg('searchProvCndHistory'),
        width: 500,
        height: 580,
        contents: provCndHistoryPopupTpl(data),
        modifyFlag : 'readonly',
        buttons: [
            {text:bxMsg('RightPane_Command1'), elCls:'button button-primary', handler:function(){
                this.close();
            }}
        ],
        listeners: {
            afterRenderUI: function() {

                var formData = PFComponent.makeYGForm($('.pf-cp-prov-condition-history-popup')).getData();
                formData.tntInstId = tntInstId;
                formData.pdInfoDscd = pdInfoDscd; // OHS 2017.03.17 추가

                // 서비스영역이면 상품코드세팅
                if(pdInfoDscd == pdInfoDscd_Service) {
                	formData.pdCode = selectedTreeItem.id;
                }

                PFRequest.get('/benefit/queryListBenefitProvideCndHistory.json', formData, {
                    success: function(responseData) {
                        renderProvConditionHistoryGrid(responseData);
                        $('.history-prov-condition-list-value').hide();
                        $('.history-prov-condition-range-value').hide();
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'BenefitProvideCndService',
                        operation: 'queryListBenefitProvideCndHistory'
                    }
                });
            }
        }
    });
}

function renderProvConditionHistoryGrid(data){

    var grid = PFComponent.makeExtJSGrid({
        pageAble: true,
        fields: ['providedConditionCode','providedConditionName','process',
            'providedConditionStatusCode', 'applyStartDate', 'maxValue', 'minValue',
            'applyEndDate', 'providedConditionTypeCode', 'providedConditionDetailTypeCode',
            'productBenefitProvidedListConditionList', 'mesurementUnitCode', 'currencyCode', 'cndDscd',
            'isAdditionalInfoExist','provideCndAdditionalInfoDetailList', 'providedConditionSequenceNumber'],
        gridConfig: {
            renderTo: '.pf-cp-prov-condition-history-grid',
            columns: [
                {text: bxMsg('DPP0127String6'), flex: 1, dataIndex: 'applyStartDate'},
                {text: bxMsg('DPP0127String7'), flex: 1, dataIndex: 'applyEndDate'}
            ],
            listeners: {
                scope: this,
                itemdblclick : function(tree, record){
                    if(record.data.providedConditionTypeCode === '01'){

                        var tempObj = {};

                        record.data.productBenefitProvidedListConditionList.forEach(function(el) {
                            tempObj[el.listCode] = el;
                        });

                        PFRequest.get('/condition/template/getConditionTemplate.json', {'conditionCode': record.data.providedConditionCode, 'tntInstId': tntInstId}, {
                            success: function(data) {
                                if (data['values']) {
                                    data['values'].forEach(function(el) {

                                        if (record.data.productBenefitProvidedListConditionList) {
                                            if (tempObj[el.key]) {
                                                el['isSelected'] = true;
                                            }
                                        }
                                    });

                                    $('.history-prov-cnd-list-code-grid').empty();
                                    provListCndCodeHistoryGrid = renderProvListCndCodeGrid(data['values'], 'history-prov-cnd-list-code-grid');

                                }
                            },
                            bxmHeader: {
                                application: 'PF_Factory',
                                service: 'CndTemplateService',
                                operation: 'queryCndTemplate'
                            }
                        });
                    }

                    $('.history-condition-value-wrap .minValue').val(record.data.minValue);
                    $('.history-condition-value-wrap .maxValue').val(record.data.maxValue);

                    $('.history-prov-cnd-status-name').val(codeMapObj['ProductStatusCode'][record.data.providedConditionStatusCode]);
                    if (record.data.providedConditionTypeCode === '01'){
                        $('.history-prov-condition-list-value').show();
                        $('.history-prov-condition-range-value').hide();
                    }else if(record.data.providedConditionTypeCode === '02'){
                        $('.history-prov-condition-list-value').hide();
                        $('.history-prov-condition-range-value').show();
                        //금액
                        if(record.data.providedConditionDetailTypeCode == '01'){
                            $('.history-prov-cnd-currency-code').show();
                            $('.history-prov-cnd-mesure-code').hide();
                            renderComboBox('CurrencyCode', $('.history-prov-cnd-currency-code-combo'));
                        }else{
                            $('.history-prov-cnd-currency-code').hide();
                            $('.history-prov-cnd-mesure-code').show();
                            renderComboBox('ProductMeasurementUnitCode', $('.history-prov-cnd-mesurement-unit-code-combo'));
                        }
                    }
                    
                    // OHS20180417 추가 - input, select 항목은 모두 disabled 처리
                    $('.history-condition-value-wrap').find('input').prop('disabled', true);
                    $('.history-condition-value-wrap').find('select').prop('disabled', true);
                }
            }
        }
    });

    if(data.length > 0){
        grid.setData(data);
    }
    return grid;
}

/*****************************************************************************************
 * 제공조건 관련 END
 */


// 제공조건 검색팝업 (수수료할인팝업>제공조건탭, 서비스>제공조건탭)
function renderCndPopup(submitEvent, isSingle){
    var cndPopupGrid;

    PFComponent.makePopup({
        title: bxMsg('DTP0203Title'),
        width: 600,
        height: 330,
        contents: cnd4FeeSubPopupTpl(),
        submit: function(){
        	if(cndPopupGrid.getSelectedItem() && cndPopupGrid.getSelectedItem().length > 0) {
        		submitEvent(cndPopupGrid.getSelectedItem());
        	}
        },
        contentsEvent: {
            'click .cnd-tpl-search': function() {
                var requestParam = {
                    'conditionName': $('.add-cnd4-fee-tpl-sub-popup .cnd-name-search').val()
                };

                var comboVal = $('.add-cnd4-fee-tpl-sub-popup .cnd-type-select').val();

                if (comboVal) {
                    requestParam.conditionTypeCode = comboVal;
                } else {
                    requestParam.conditionTypeCode = 'A';
                }
                requestParam.tntInstId = tntInstId;
                requestParam.activeYn = 'Y';

                PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
                    success: function(responseData) {

                        $('.add-cnd4-fee-tpl-sub-popup .popup-cnd-grid').empty();

                        var checkboxmodel = Ext.create ('Ext.selection.CheckboxModel', {mode:'SINGLE'});
                        var gridConf = {
                            selType: 'checkboxmodel',
                            renderTo: '.popup-cnd-grid',
                            columns: [
                                {text: bxMsg('DTP0203String3'), width: 80, dataIndex: 'code'},
                                {text: bxMsg('DTP0203String4'), width: 80, dataIndex: 'typeNm'},
                                {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name'},
                                {text: bxMsg('DPS0101String6'), width: 70, dataIndex: 'isActive',
                                    renderer: function(value, p, record) {
                                        if (value === 'Y') {
                                            return bxMsg('active');
                                        } else if (value === 'N') {
                                            return bxMsg('inactive');
                                        }
                                    }
                                },
                                {text: bxMsg('DTP0203String8'), flex: 1, dataIndex: 'content'}
                            ]
                        }

                        if(isSingle){
                            gridConf.selModel = checkboxmodel;
                        }

                        cndPopupGrid = PFComponent.makeExtJSGrid({
                            fields: ['code', 'type', 'name', 'content', 'isActive', 'conditionDetailTypeCode', {
                                name: 'typeNm',
                                convert: function(newValue, record) {
                                    var typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
                                    return typeNm;
                                }}],
                            gridConfig: {
                                selType: 'checkboxmodel',
                                renderTo: '.popup-cnd-grid',
                                columns: [
                                    {text: bxMsg('DTP0203String3'), width: 80, dataIndex: 'code'},
                                    {text: bxMsg('DTP0203String4'), width: 80, dataIndex: 'typeNm'},
                                    {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name'},
                                    {text: bxMsg('DPS0101String6'), width: 70, dataIndex: 'isActive',
                                        renderer: function(value, p, record) {
                                            if (value === 'Y') {
                                                return bxMsg('active');
                                            } else if (value === 'N') {
                                                return bxMsg('inactive');
                                            }
                                        }
                                    },
                                    {text: bxMsg('DTP0203String8'), flex: 1, dataIndex: 'content'}
                                ]
                            }
                        });

                        cndPopupGrid.setData(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CndTemplateService',
                        operation: 'queryListCndTemplate'
                    }
                });
            }
        },
        listeners: {
            afterRenderUI: function() {
                var requestParam = {'conditionTypeCode': 'A', 'activeYn' : 'Y'};

                var options = [];

                var $defaultOption = $('<option>');
                $defaultOption.text(bxMsg('Z_All'));
                $defaultOption.val('');

                options.push($defaultOption);

                $.each(codeMapObj['ProductConditionTypeCode'], function(key,value){
                    if (key === '03' || key === '04') {
                        return;
                    }

                    var $option = $('<option>');

                    $option.val(key);
                    $option.text(value);

                    options.push($option);
                });

                $('.add-cnd4-fee-tpl-sub-popup .cnd-type-select').html(options);

                PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
                    success: function(responseData) {
                        var checkboxmodel = Ext.create ('Ext.selection.CheckboxModel', {mode:'SINGLE'});
                        var gridConf = {
                            selType: 'checkboxmodel',
                            renderTo: '.popup-cnd-grid',
                            columns: [
                                {text: bxMsg('DTP0203String3'), width: 80, dataIndex: 'code'},
                                {text: bxMsg('DTP0203String4'), width: 80, dataIndex: 'typeNm'},
                                {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name'},
                                {text: bxMsg('DPS0101String6'), width: 70, dataIndex: 'isActive',
                                    renderer: function(value, p, record) {
                                        if (value === 'Y') {
                                            return bxMsg('active');
                                        } else if (value === 'N') {
                                            return bxMsg('inactive');
                                        }
                                    }
                                },
                                {text: bxMsg('DTP0203String8'), flex: 1, dataIndex: 'content'}
                            ]
                        }

                        if(isSingle){
                            gridConf.selModel = checkboxmodel;
                        }

                        cndPopupGrid = PFComponent.makeExtJSGrid({
                            fields: ['code', 'type', 'name', 'content', 'isActive', 'conditionDetailTypeCode', {
                                name: 'typeNm',
                                convert: function(newValue, record) {
                                    var typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
                                    return typeNm;
                                }}],
                            gridConfig: gridConf
                        });

                        cndPopupGrid.setData(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CndTemplateService',
                        operation: 'queryListCndTemplate'
                    }
                });
            }
        }
    });
}
