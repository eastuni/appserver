/**
 * marketing priority java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {
    renderproductMarketingPriority();               // 메인화면 초기세팅
    searchProductMarketingPriority();               // 조회

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
});

$('body').css('overflow-y','scroll');

var $el = $('.pf-pmp');

var pdInfoDscd = '01'; // 상품

var complexGrid;
var complexGridDeleteData = [];

var classificationMasterData;

var objGridTitleData = {};
var arrGridTitleData = [];

var form;
var selectedCellIndex;
var tntInstId;

var onEvent = PFUtil.makeEventBinder($el);
var lengthVlad = PFValidation.realTimeLengthCheck($('body'));

lengthVlad('.task-valid-100',100);

PFComponent.toolTip($el); // icon tooltip 적용

var productMarketingPriorityListTpl = getTemplate('productMarketingPriorityListTpl');
/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/

    //
onEvent('click', 'a', function(e) { e.preventDefault(); });

onEvent('change', '.pf-multi-entity', function(e){

    tntInstId = $el.find('.pf-multi-entity').val();

    $('.tab-nav-list').empty();
    $('.tab-content').empty();

    if($(e.currentTarget).val() != $('.login-tntInst-id').text()) {
        $($('.default-layout-task-menu').find('.your-task')[0]).attr('data-status', 'true');
        $($('.default-layout-task-menu').find('.your-task')[0]).removeClass('task-hide');
        $($('.default-layout-task-menu').find('.your-task')[0]).val('');
        $($('.default-layout-task-menu').find('.my-task-list')[0]).addClass('task-hide');
    }else{
        $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).removeAttr('data-status');
        $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).addClass('task-hide');
        $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).removeClass('task-hide');
        $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).find('option').eq(0).prop('selected',true);
    }

});

// 초기화버튼 클릭시
onEvent('click','.pf-reset-form-btn',function(e) {
    form.reset();
    complexGrid.resetData();

    $('.base-date').val(PFUtil.getToday());

    var nextDate = PFUtil.getNextDate();
    $('.start-date').val(nextDate + ' 00:00:00');
    $('.end-date').val('9999-12-31 23:59:59');

    $('.cls-str-active-yn-select').val('N');

    var $gridFooter =  $('.grid-paging-footer');
    $gridFooter.find('span').text('');
    $gridFooter.find('.grid-page-input').val('1');
});

// 조회버튼 클릭시
onEvent('click', '.product-marketing-priority-list-inquiry-btn', function(e) {
    searchProductMarketingPriority();
});

// 추가버튼 클릭시
onEvent('click', '.product-marketing-priority-add-btn', function(e) {

    // 구성조건을 설정하지 않은 경우
    if (arrGridTitleData.length === 0)  {
        // 구성조건을 먼저 설정하세요.
        PFComponent.showMessage(bxMsg('complexHeaderSetMsg'), 'warning');
        return;
    }

    var nextDate = PFUtil.getNextDate();
    var applyStart = nextDate + ' ' + '00:00:00';
    var applyEnd = '9999-12-31 23:59:59';

    var newData = {
        pdInfoDscd : pdInfoDscd,
        classificationDetailVO : {
            applyStartDate : applyStart,
            applyEndDate : applyEnd,
            activeYn : 'N',
            process : 'C'
        },
        lstClassificationInformationRelationVO : [],
        activeYn : 'N',
        process : 'C'
    };

    complexGrid.addData(newData);
});

// 저장버튼 클릭시
onEvent('click', '.rel-save-btn', function(e) {
    saveProductMarketingPriority();
});

// 삭제버튼 클릭시
onEvent('click', '.rel-delete-btn', function(e) {
    deleteProductMarketingPriority();
});

// 구성조건설정 버튼 클릭 시
onEvent('click', '.column-setting-btn', function(e) {
    renderColumnSettingPopup();
});




/******************************************************************************************************************
 * 서비스 호출 함수
 ******************************************************************************************************************/

// 조회
function searchProductMarketingPriority(){

    var requestData = form.getData();
    requestData.tntInstId = tntInstId;
    requestData.classificationStructureTypeCode = '3';  //분류체계유형구분코드 1.분류체계, 2.그룹, 3.N차원그룹
    requestData.classificationStructureUsageDistinctionCode = '01';     // 01.마케팅우선순위

    PFRequest.get('/classification/getClassificationNTier.json', requestData, {
        success: function(responseData) {

        	if(responseData.projectBaseVO){
        		setTaskRibbonInput(responseData.projectBaseVO.projectId, responseData.projectBaseVO.name);
        	}

            var nextDate = PFUtil.getNextDate();
            $('.start-date').val(nextDate + ' 00:00:00');
            $('.end-date').val('9999-12-31 23:59:59');

            $('.cls-str-active-yn-select').val('N');

            if(complexGrid){
                complexGrid.resetData();
            }

            complexGridDeleteData = [];

            if (responseData.classificationMasterVO) {

                if( (!classificationMasterData || classificationMasterData.complexStructureId != responseData.classificationMasterVO.complexStructureId)
                    && responseData.lstComplexConditionTitleInfoVO.length > 0){

                    var titleConditionInfo = '';

                    responseData.lstComplexConditionTitleInfoVO.forEach(function(el, index){

                        var title = '';

                        if(el.titleConditionName.length > 12){
                            el.titleConditionName = el.titleConditionName.substring(0,12)+'...';
                        }
                        // 목록형일때
                        if(el.titleConditionTypeCode == '01') {

                            var options = '<option value="">' + bxMsg('Z_All') + '</option>';
                            el.defineValues.forEach(function(item){
                                options = options + '<option value="'+ $.trim(item.code) +'">' + item.name +  '</option>';
                            });

                            title = '<th style="width:155px">' + el.titleConditionName + '</th>' +
                                '<td><select class="bx-form-item bx-compoenent-small" data-form-param="listCd'+ (index+1) +'">' + options + '</select></td>';

                        }
                        // 범위형일때
                        else if(el.titleConditionTypeCode == '02'){

                            if(el.titleConditionDetailTypeCode == '01') {
                                title = '<th style="width:155px">' + el.titleConditionName + '</th>' +
                                    '<td><input type="text" class="bx-form-item bx-compoenent-small" data-form-param="' + 'minVal' + (index + 1) + '"/> ' +
                                    codeMapObj['CurrencyCode'][el.currencyValue] +' (' + codeMapObj['RangeBlwUnderTypeCode'][el.rangeBlwUnderType] + ') </td>';
                            }
                            else {
                                title = '<th style="width:155px">' + el.titleConditionName + '</th>' +
                                    '<td><input type="text" class="bx-form-item bx-compoenent-small" data-form-param="' + 'minVal' + (index + 1) + '"/>' +
                                    codeMapObj['ProductMeasurementUnitCode'][el.productMeasurementUnit] +' (' + codeMapObj['RangeBlwUnderTypeCode'][el.rangeBlwUnderType] + ') </td>';
                            }
                        }

                        // 홀수
                        if(((index+1)%2) == 1) {
                            titleConditionInfo = titleConditionInfo + '<tr class="add-tr">' + title;

                            if(responseData.lstComplexConditionTitleInfoVO.length == (index+1)){
                                titleConditionInfo = titleConditionInfo + '<th style="width:155px"></th><td></td></tr>';
                            }

                        }else{
                            titleConditionInfo = titleConditionInfo + title + '</tr>'
                        }

                    });

                    $('.pd-marketing-priority-query-table .add-tr').remove();
                    $('.pd-marketing-priority-query-table').append(titleConditionInfo);
                }

                classificationMasterData = responseData.classificationMasterVO;
                $('.pf-pd-marketing-priority-grid-form .start-date').val(classificationMasterData.applyStartDate)
                $('.pf-pd-marketing-priority-grid-form .end-date').val(classificationMasterData.applyEndDate)
                $('.pf-pd-marketing-priority-grid-form .cls-str-active-yn-select').val(classificationMasterData.activeYn);

                if(classificationMasterData.activeYn == 'Y'){
                	$('.rel-delete-btn').prop('disabled', true);  // 삭제버튼 비활성
                }else{
                	$('.rel-delete-btn').prop('disabled', false);  // 삭제버튼 활성
                }

                renderProductMarketingPriorityMngGrid(responseData.lstComplexConditionTitleInfoVO, responseData.lstClassificationNTierDetailVO);
            }else{
                renderProductMarketingPriorityMngGrid();
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ClassificationNTierService',
            operation: 'getClassificationNTier'
        }
    });
}


// 그리드
function renderProductMarketingPriorityMngGrid(title, data) {

    var fields = ['tierNumber', 'process', 'classificationDetailVO'];
    var columns = [];

    arrGridTitleData = [];
    objGridTitleData = {};

    $('.pf-pmp-pd-marketing-priority-list-grid').empty();

    // 계층
    columns.push({
        // text: bxMsg('DPS0128String1'), xtype: 'rownumberer', width: 50, sortable: false, align:'center'
        text: bxMsg('DPS0128String1'), dataIndex: 'tierNumber', width: 50, sortable: false, align:'center'
    });

    if(title) {
        var index = 1;

        title.forEach(function(el) {
            var conditionCode = el.titleConditionCode;
            var conditionDetailCode = el.titleConditionDetailTypeCode;
            var tempObj = {};
            tempObj['cndCd'+index] = 'cndCd'+index;
            tempObj['titleConditionCode'] = conditionCode;
            tempObj['titleConditionName'] = el.titleConditionName;
            tempObj['titleConditionTypeCode'] = el.titleConditionTypeCode;

            if (el.titleConditionTypeCode == '01') {

                el.defineValues.forEach(function(e){
                    if(e.key) {
                        e.code = e.key;
                        e.name = e.value;
                        delete e.key;
                        delete e.value;
                    }

                    else if(e.code) {
                        e.code = e.code;
                    }
                });

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

                fields.push(
                    'cndCd'+index,
                    'cndCd'+index+'.DefineValues',
                    'listCd'+index
                );

                columns.push({header: '<div style="text-align:center">' + el.titleConditionName + '</br>('+ el.titleConditionCode +') </div>',
                	width: el.titleConditionName.length * 12 + 25 , dataIndex: 'listCd'+index,
                    style: 'text-align:center',
                    renderer: function(value) {
                        return defineValuesObj[value];
                    },
                    editor:{
                        xtype:'combo',
                        typeAhead: true,
                        triggerAction: 'all',
                        displayField: conditionCode =='L0149' ? 'code' : 'name',
                        valueField: 'code',
                        editable: false,
                        store: new Ext.data.Store({
                            fields: ['name', 'code'],
                            data: el.defineValues
                        })
                    }
                });

            } else if (el.titleConditionTypeCode == '02') {
                tempObj['productMeasurementUnit'] = el.productMeasurementUnit;
                tempObj['currencyValue'] = el.currencyValue;
                tempObj['rangeBlwUnderType'] = el.rangeBlwUnderType;
                tempObj['titleConditionDetailTypeCode'] = el.titleConditionDetailTypeCode;
                tempObj['defineValues'] = el.defineValues;

                fields.push(
                    'cndCd'+index,
                    'cndCd'+index+'.defineValues',
                    {
                        name : 'minVal'+index,
                        convert: function(newValue, record){
                        	var minValue = '0.00';
                        	newValue = newValue.replace(/\,/g,'');

                        	if(newValue) {
	                            if(isNotNegativeRangeType(el.titleConditionDetailTypeCode)){
	                            	parseFloat(newValue);
	                            	minValue = PFValidation.gridFloatCheckRenderer(newValue, 19, 0, true);
	                            }else{
	                            	minValue = PFValidation.gridFloatCheckRendererForRangeType(newValue, 19, 2);
	                            }
                        	}
                        	return minValue;
                        }
                    },
                    {
                        name : 'maxVal'+index,
                        convert: function(newValue, record){
                        	var maxValue = '0.00';
                        	newValue = newValue.replace(/\,/g,'');

                        	if(newValue){
	                            if(isNotNegativeRangeType(el.titleConditionDetailTypeCode)){
	                            	parseFloat(newValue);
	                            	maxValue = PFValidation.gridFloatCheckRenderer(newValue, 19, 0, true);
	                            }else{
	                            	maxValue = PFValidation.gridFloatCheckRendererForRangeType(newValue, 19, 2);
	                            }
                        	}

                            return maxValue;
                        }
                    }
                );

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
                        dataIndex: 'minVal'+index,
                        style: 'text-align:center',
//                        renderer: function (value, metadata, record) {
//                        	value = value.replace(/\,/g,'');
//                            if (isNotNegativeRangeType(conditionDetailCode)) {
//                                return PFValidation.gridFloatCheckRenderer(value, 19, 0, true);
//                            } else {
//                                return PFValidation.gridFloatCheckRendererForRangeType(value, 19, 2);
//                            }
//                        },
                        editor: {
                            xtype: 'textfield',
                            allowBlank: false,
                            selectOnFocus: true,
                            listeners: {
                                'render': function (cmp) {
                                    cmp.getEl()
                                        .on('keydown', function(e) {
                                            if(isNotNegativeRangeType(el.titleConditionDetailTypeCode)){
                                                PFValidation.gridFloatCheckKeydown(e, 19, 0);
                                            }else{
                                                PFValidation.gridFloatCheckKeydownForRangeType(e, 19, 2);
                                            }

                                        })
                                        .on('keyup', function (e) {
                                            if(isNotNegativeRangeType(el.titleConditionDetailTypeCode)){
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
                        width: 120,
                        dataIndex: 'maxVal'+index,
                        style: 'text-align:center',
//                        renderer: function (value, metadata, record) {
//                        	value = value.replace(/\,/g,'');
//                            if (isNotNegativeRangeType(conditionDetailCode)) {
//                                return PFValidation.gridFloatCheckRenderer(value, 19, 0, true);
//                            } else {
//                                return PFValidation.gridFloatCheckRendererForRangeType(value, 19, 2);
//                            }
//                        },
                        editor: {
                            xtype: 'textfield',
                            allowBlank: false,
                            selectOnFocus: true,
                            listeners: {
                                'render': function (cmp) {
                                    cmp.getEl()
                                        .on('keydown', function(e) {
                                            if(isNotNegativeRangeType(el.titleConditionDetailTypeCode)){
                                                PFValidation.gridFloatCheckKeydown(e, 19, 0);
                                            }else{
                                                PFValidation.gridFloatCheckKeydownForRangeType(e, 19, 2);
                                            }

                                        })
                                        .on('keyup', function (e) {
                                            if(isNotNegativeRangeType(el.titleConditionDetailTypeCode)){
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
            arrGridTitleData.push(tempObj);
            index++;
        });

        var i = 1;
        arrGridTitleData.forEach(function(el) {
            objGridTitleData[el.titleConditionCode] = el;
            i++;
        });
    }

    var flex, width;
    if(arrGridTitleData.length > 2) {
        flex = 0;
        width = 145;
    } else {
        flex = 1;
        width = 0;
    }

    // 적용시작일자
    fields.push({name : 'applyStartDate',
        convert: function(newValue, record) {
            if(newValue){
                record.get('classificationDetailVO')['applyStartDate'] =  newValue;
            }
            return record.get('classificationDetailVO')['applyStartDate'];
        }
    });
    columns.push({text: bxMsg('DPP0127String6'), flex:flex , width:width,dataIndex:'applyStartDate', align: 'center',
        editor: {
            allowBlank: false,
            listeners: {
                focus: function(_this) {
                    PFUtil.getGridDateTimePicker(_this, 'applyStartDate', complexGrid, selectedCellIndex, false);
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
    fields.push({
        name: 'applyEndDate',
        convert: function (newValue, record) {
            if(newValue){
                record.get('classificationDetailVO')['applyEndDate'] =  newValue;
            }
            return record.get('classificationDetailVO')['applyEndDate'];
        }
    });
    columns.push({text: bxMsg('DPP0127String7'), flex:flex , width:width, dataIndex:'applyEndDate', align: 'center',
        editor: {
            allowBlank: false,
            listeners: {
                focus: function(_this) {
                    PFUtil.getGridDateTimePicker(_this, 'applyEndDate', complexGrid, selectedCellIndex, false);
                }
            }
        },
        listeners: {
            click: function() {
                selectedCellIndex = $(arguments[1]).parent().index();
            }
        }
    });

    // 활동여부
    fields.push({
        name : 'activeYn',
        convert : function(newValue, record){
            return record.get('classificationDetailVO')['activeYn'];
        }
    });
    columns.push({
        text: bxMsg('actvYn'),  width:80, dataIndex: 'activeYn', align: 'center',
        renderer: function(value) {
            return codeMapObj.TemplateActiveYnCode[value] || value;
        }
    });

    // 우선순위설정
    fields.push('lstClassificationInformationRelationVO');
    columns.push({
        xtype: 'actioncolumn', width: 35, align: 'center',
        items: [{
            icon: '/images/edit-icon30.png',
            handler: function (_this, rowIndex, colIndex, item, e, record) {
                var submitEvent = function(data){

                    var updateData = $.grep(data, function(el, i){
                        return el.process != null && el.process != '';
                    });

                    if(updateData.length > 0 && record.get('process') != 'C'){
                        record.set('process', 'U');
                    }

                    record.set('lstClassificationInformationRelationVO', data);
                }
                renderMarketingPriorityPopup(record, submitEvent);
            }
        }]
    });

    // 삭제컬럼
    columns.push({
        xtype: 'actioncolumn', width: 35, align: 'center',
        items: [{
            icon: '/images/x-delete-16.png',
            handler: function (grid, rowIndex, colIndex, item, e, record) {

                if(record.data.process != 'C' &&
                   record.get('activeYn') == 'Y' &&
                   (getSelectedProjectId() == "" || (getSelectedProjectId() && !isEmergency(getSelectedProjectId()) && !isUpdateStatus(getSelectedProjectId())) ) && // emergency도 아니고 상품정보수정도 아니고
                   PFUtil.compareDateTime(record.data.applyStartDate, PFUtil.getNextDate()) == 1){

                	PFComponent.showMessage(bxMsg('dontDeleteActiveTypeConditionTemplate'), 'warning');
                    return;
                }

                if(record.data.process != 'C') {
                    record.data.process = 'D';
                    complexGridDeleteData.push(record.data);
                }

                record.destroy();
                modifyFlag = true;
            }
        }]
    });

    complexGrid = PFComponent.makeExtJSGrid({
        fields:fields,
        gridConfig: {
            renderTo: '.pf-pmp-pd-marketing-priority-list-grid',
            columns: columns,
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                        beforeedit:function(e, editor) {
                            if( editor.record.data.activeYn == 'N' ||                                 // 비활동인 경우
                                editor.record.data.process == 'C' ||                                      // 새로 추가된 row인 경우
                                (getSelectedProjectId() && isEmergency(getSelectedProjectId()))    ||     // emergency 인 경우
                                (getSelectedProjectId() && isUpdateStatus(getSelectedProjectId())) ){     // 상품정보 수정인 경우
                                // 모두 수정가능
                            }
                            else if(editor.field != 'applyEndDate') {
                                return false;
                            }
                        },
                        afteredit: function(e, editor) {
                            if (editor.originalValue != editor.value){
                                if (editor.field != 'applyEndDate' && (editor.record.get('process') == null || editor.record.get('process').length == 0)) {
                                    var originalData = $.extend(true, {}, editor.record.data);
                                    originalData[editor.field] = editor.record.modified[editor.field];
                                    originalData['process'] = 'D';
                                    complexGridDeleteData.push(originalData);
                                    editor.record.set('process', 'C');
                                } else if (editor.record.get('process') != 'C') {
                                    editor.record.set('process', 'U');
                                }
                            }
                        }
                    }
                })
            ],
            listeners: {
                'viewready' : function(_this, eOpts){
                    if(data){
                        complexGrid.setData(data);
                    }
                }
            }
        }
    });


    //if(data){
    //    complexGrid.setData(data);
    //}
    //return grid;
}

// 그리드 저장
function saveProductMarketingPriority(){

    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    }

    if(!classificationMasterData){
        classificationMasterData = {
            classificationStructureName : bxMsg('pdMarketingPriorityManagement'),
            classificationStructureTypeCode : '3',
            classificationStructureUsageDistinctionCode : '01',
            activeYn : 'N'
        };
    }

    classificationMasterData.applyStartDate = $('.pf-pd-marketing-priority-grid-form .start-date').val();
    classificationMasterData.applyEndDate = $('.pf-pd-marketing-priority-grid-form .end-date').val();

    var lstClassificationNTierDetail = complexGridDeleteData.concat(complexGrid.getAllData());

    lstClassificationNTierDetail.forEach(function(el){
    	for(var i=1 ; i<10 ; i++) {
    		if(el['minVal'+i]) { el['minVal'+i] = el['minVal'+i].replace(/\,/g,''); }
    		if(el['maxVal'+i]) { el['maxVal'+i] = el['maxVal'+i].replace(/\,/g,''); }
    	}
    });

    arrGridTitleData.forEach(function(el){
    	if(el.titleConditionTypeCode == '02'){
    		el.defineValues = [];
    	}
    });

    var requestData = {
        tntInstId : tntInstId,
        pdInfoDscd : pdInfoDscd,
        projectId : projectId,
        process : 'U',
        classificationMasterVO : classificationMasterData,
        lstComplexConditionTitleInfoVO : arrGridTitleData,
        lstClassificationNTierDetailVO : lstClassificationNTierDetail
    }

    //PFRequest.post('/marketingpriority/savePdMarketingPriority.json', requestData, {
    PFRequest.post('/classification/saveClassificationNTier.json', requestData, {
        success: function(responseData) {
            if (responseData === true) {
                PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                searchProductMarketingPriority();
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ClassificationNTierService',
            operation: 'saveClassificationNTier'
        }
    });
}

// 삭제
function deleteProductMarketingPriority(){


	if(!isHaveProject()){
        haveNotTask();
        return;
    }

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    }

	classificationMasterData.applyStartDate = $('.pf-pd-marketing-priority-grid-form .start-date').val();
    classificationMasterData.applyEndDate = $('.pf-pd-marketing-priority-grid-form .end-date').val();


	var requestData = {
        tntInstId : tntInstId,
        pdInfoDscd : pdInfoDscd,
        projectId : projectId,
        process : 'D',
        classificationMasterVO : classificationMasterData,
        lstComplexConditionTitleInfoVO : [],
        lstClassificationNTierDetailVO : []
    }

    //PFRequest.post('/marketingpriority/deletePdMarketingPriorityMaster.json', requestData, {
    PFRequest.post('/classification/saveClassificationNTier.json', requestData, {
        success: function(responseData) {
            if (responseData === true) {
                PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                searchProductMarketingPriority();
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ClassificationNTierService',
            operation: 'saveClassificationNTier'
        }
    });
}



/******************************************************************************************************************
 * 사용자 함수
 ******************************************************************************************************************/

// 메인화면 초기세팅
function renderproductMarketingPriority() {
    $('.pf-page-conts').html(productMarketingPriorityListTpl());
    form = PFComponent.makeYGForm($('.pf-pd-marketing-priority-list-form'));

    setTntInstComboBox();
    renderComboBox('TemplateActiveYnCode', $('.cls-str-active-yn-select'), 'N');

    // make coboBox
    var options = [];

    var $defaultOption = $('<option>');
    $defaultOption.text(bxMsg('Z_All'));
    $defaultOption.val('');

    options.push($defaultOption);

    PFUtil.getAllDatePicker(false, $('.pd-marketing-priority-query-table'));
    PFUtil.getDatePicker(true, $('.pd-marketing-priority-master-table'));

    $('.base-date').val(PFUtil.getToday());

    var nextDate = PFUtil.getNextDate();
    $('.start-date').val(nextDate + ' 00:00:00');
    $('.end-date').val('9999-12-31 23:59:59');

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }

    $('.rel-delete-btn').prop('disabled', true);  // 삭제버튼 비활성

}

// 기관코드 콤보 바인딩
function setTntInstComboBox() {
    tntInstId = getLoginTntInstId();
    renderTntInstComboBox($el.find('.pf-multi-entity'), tntInstId);

    if (!getMortherYn()) {
        $el.find('.pf-multi-entity-yn').hide();
    }
}

// 범위형 체크
function isNotNegativeRangeType(conditionDetailTypeCode){
	// 금액 || 숫자 || 율
    if(conditionDetailTypeCode == '01' || conditionDetailTypeCode == '04' || conditionDetailTypeCode == '05'){
    	return false;
    }else{
    	return true;
    }
}

function fnEmergencyControl(flag){
    if(writeYn == 'Y') {
        if (flag) {
            $('.write-btn').prop('disabled', false);
        } else if($('.cls-str-active-yn-select').val() == 'Y'){
            $('.rel-delete-btn').prop('disabled', true);
        }
    }
}