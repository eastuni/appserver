//////////////////////////////////////////////////////////////////////////////////////
/////limit condition tab////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

var limitConditionTpl = getTemplate('limit/limitConditionTpl');
var limitConditionTabRender;
var limitConditionGrid;

// 한도조건 추가버튼 클릭
onEvent('click', '.add-limit-condition-btn', function(e) {
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

        renderLimitCndPopupForService(data);
        modifyFlag = true;
    };

    renderCndPopup(submitEvent, true);
});

// 한도조건저장 아이콘 클릭
onEvent('click', '.save-limit-condition-btn', function(e) {
    if(!isHaveProject()){
        haveNotTask();
        return;
    }
    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    };
    saveBenefitLimitCndForServiceMain(projectId, '03', limitConditionGrid);  // 적용규칙구분코드 03 : 서비스

});

// 한도조건저장처리 (서비스영역용)
function saveBenefitLimitCndForService(process, projectId, ruleApplyTargetDistinctionCode){
    var formData = {};
    var provCnd = [];
    var temp = PFComponent.makeYGForm($('.limit-cnd-info-popup-tpl')).getData();

    if(temp.providedConditionTypeCode === '01') {
        temp.productBenefitProvidedListConditionList = limitListCndCodeGrid.getSelectedItem();
        temp.productBenefitProvidedListConditionList.forEach(function (el) {
            el.listCode = el.key;
        });
    }
    temp.isAdditionalInfoExist = false;
    temp.conditionApplyTargetDscd = conditionApplyTargetDscd;
    temp.process = process;
    provCnd.push(temp);

    formData.productBenefitProvidedConditonList = provCnd;
    formData.projectId = projectId;
    formData.feeDiscountSequenceNumber = $('.feeDiscountSequenceNumber').val();
    formData.cndDscd = '02'
    formData.pdInfoDscd = pdInfoDscd_Service;
    formData.productCode = selectedTreeItem.id;


    formData.productBenefitProvidedConditonList.forEach(function(el) {
        if (el.productBenefitProvidedListConditionList == '') {
            delete el.productBenefitProvidedListConditionList;
        }
        else {
        	el.cndDscd = '02';
        }

        delete el.conditionDetailTypeCode;
    });

    PFRequest.post('/benefit/saveBenefitProvideCnd.json', formData, {
        success: function(responseData) {
            if (responseData) {

                // 등록인경우
                if(process == 'C'){
                    $('.prov-cnd-tpl .providedConditionSequenceNumber').val(responseData);  // 일련번호 바인딩
                    $('.prov-cnd-reg-btn').prop('disabled', true);          				// 등록버튼 비활성
                    $('.prov-cnd-delete-btn').prop('disabled', false);       				// 삭제버튼 활성
                    $('.prov-cnd-mod-btn').prop('disabled', false);          				// 수정버튼 활성
                }

                PFComponent.showMessage(bxMsg('workSuccess'),  'success');
                deleteConditionList = [];
                resetFormModifed();

                // 우대금리 제공조건 그리드 조회 (일련번호 바인딩을 위함)
                delete formData.productBenefitProvidedConditonList;
                formData.cndDscd = '02';

                if($('.bnft-prov-cnd-search').val()) {
                    formData.applyStartDate = $('.bnft-prov-cnd-search').val();
                }
                else {
                    delete formData.applyStartDate;
                }

                formData.pdCode = formData.productCode;
                PFRequest.get('/benefit/queryListBenefitProvideCnd.json', formData, {
                    success: function(data) {
                		limitConditionGrid.setData(data);
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

// 한도조건 팝업 (Benefit영역)
function renderLimitCndPopupForService(data){

    PFComponent.makePopup({
        title: bxMsg('limitConditionMangement'),
        width: 600,
        height: 380,
        contents: limitCndPopupTpl(data),
        buttons:[
            {text:bxMsg('registration'), elCls:'button button-primary write-btn limit-cnd-reg-btn', handler:function() {

                var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
                if(isNotMyTask(projectId)){
                    return;
                };
                saveBenefitLimitCndForService('C', projectId);

                this.close();
            }},
            {text:bxMsg('modify'), elCls:'button button-primary write-btn limit-cnd-mod-btn', handler:function() {
                var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
                if(isNotMyTask(projectId)){
                    return;
                };
                saveBenefitLimitCndForService('U', projectId);

                this.close();
            }},
            {text:bxMsg('ButtonBottomString2'), elCls:'button button-primary write-btn limit-cnd-delete-btn', handler:function() {
                var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
                if(isNotMyTask(projectId)){
                    return;
                };
                saveBenefitLimitCndForService('D', projectId);

                this.close();
            }},
            {text:bxMsg('ButtonBottomString17'), elCls:'button button-primary write-btn', handler:function() {
                this.close();
            }}
        ],
        contentsEvent: {
            'click .limit-cnd-history-benefit-btn': function () {

                var formData = PFComponent.makeYGForm($('.limit-cnd-info-popup-tpl')).getData();
                
                /**
                 * 제공조건 이력 팝업
                 */
                function renderLimitConditionHistoryPopup(data){
                    provListCndCodeHistoryGrid = null;
                    PFComponent.makePopup({
                        title: bxMsg('searchLimitCndHistory'),
                        width: 500,
                        height: 580,
                        contents: provCndHistoryPopupTpl(data),
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
                
                renderLimitConditionHistoryPopup(formData);
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
                    var checkFloatPopup = PFValidation.floatCheck('.limit-cnd-info-popup-tpl');
                    checkFloatPopup('.float21', 19, 2);
                    checkFloatPopup('.float10', 3, 6);
                    checkFloatPopup('.float0', 3, 0);

                    var focusDragPopup = PFValidation.dragAll('.limit-cnd-info-popup-tpl');
                    focusDragPopup('.float21');
                    focusDragPopup('.float19');
                    focusDragPopup('.float10');
                    focusDragPopup('.float0');

                    $('.limit-cnd-type1-warp').hide();
                    $('.limit-cnd-type2-warp').show();
                    //금액
                    if(data.providedConditionDetailTypeCode == '01'){
                        $('.limit-cnd-currency-code').show();
                        $('.limit-cnd-mesure-code').hide();
                        renderComboBox('CurrencyCode', $('.limit-cnd-currency-code-combo'));
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
                        $('.limit-cnd-mesurement-unit-code-combo').val(data.mesurementUnitCode);
                    }
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
                            if(isEmergency(getSelectedProjectId())){
                                $('.limit-cnd-reg-btn').prop('disabled', true);
                            }else{
                                $('.limit-cnd-reg-btn').prop('disabled', false);
                            }
                            $('.limit-cnd-delete-btn').prop('disabled', true);
                            $('.limit-cnd-mod-btn').prop('disabled', true);
                        }else {
                            $('.limit-cnd-reg-btn').prop('disabled', true);
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


// 한도조건 화면
function renderLimitCondition(){

    $el.find('.pf-cp-limit-condition-info').html(limitConditionTpl());

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }

    var param = {
        tntInstId : selectedTreeItem.tntInstId,
        pdInfoDscd : pdInfoDscd_Service,
        pdCode : selectedTreeItem.id,
        ruleApplyTargetDistinctionCode : '03'   // 서비스
    }

    limitConditionGrid = renderlimitConditionGrid(param);
    // 한번 render 이후에는 render 되지 않도록
    limitConditionTabRender = false;
}

function renderlimitConditionGrid(data){
    var grid = PFComponent.makeExtJSGrid({
        fields: ['providedConditionCode','providedConditionName', 'process',
                 'providedConditionStatusCode', 'applyStartDate',
                 'applyEndDate', 'providedConditionTypeCode', 'providedConditionDetailTypeCode', 'currencyCode',
                 'productBenefitProvidedListConditionList', 'mesurementUnitCode', 'cndDscd', 'providedConditionSequenceNumber',

                 {
                     name: 'maxValue',
                     convert: function(newValue, record) {
                         if (newValue) {
                             return newValue;
                         } else {
                             if (!record || !newValue) {
                                 var val = '0.00';
                             }
                             return val;
                         }
                     }
                 },
                 {
                     name: 'minValue',
                     convert: function(newValue, record) {
                         if (newValue) {
                             return newValue;
                         } else {
                             if (!record || !newValue) {
                                 var val = '0.00';
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
                	
                    	 if (selectedTreeItem) {
	                         var detailRequestParam = {};
                             detailRequestParam.tntInstId = selectedTreeItem.tntInstId;
                             detailRequestParam.pdInfoDscd = pdInfoDscd_Service;
                             detailRequestParam.pdCode = selectedTreeItem.id;
	                         detailRequestParam.cndDscd = '02'; // 한도조건
	                         PFRequest.get('/benefit/queryListBenefitProvideCnd.json', detailRequestParam, {
	                             success: function(responseData) {
	                                 limitConditionGrid.setData(responseData);
	                             },
	                             bxmHeader: {
	                                 application: 'PF_Factory',
	                                 service: 'BenefitProvideCndService',
	                                 operation: 'queryListBenefitProvideCnd'
	                             }
	                         });
                    	 }
                     },
                     'celldblclick': function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    	 renderLimitCndPopupForService(record.data, isReadOnly);
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
             }
    });
    return grid;
}

// 한도조건 
function saveBenefitLimitCndForServiceMain(projectId, ruleApplyTargetDistinctionCode, grid){

    if(!grid){
        grid = cndType3Grid;
    }

    var formData = {};

    // 제공조건그리드
    if (grid) {
        formData.projectId = projectId;

        formData.pdInfoDscd = pdInfoDscd_Service;
        formData.productCode = selectedTreeItem.id;
        formData.productBenefitProvidedConditonList = grid.getAllData().concat(deleteConditionList);
        
        formData.productBenefitProvidedConditonList.forEach(function(el) {
            formData.pdInfoDscd = pdInfoDscd_Service;
            formData.pdCode = selectedTreeItem.id;
            
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
                    resetFormModifed();

                    // 한도조건 그리드 조회 (일련번호 바인딩을 위함)
                    delete formData.productBenefitProvidedConditonList;
                    formData.cndDscd = '02';

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