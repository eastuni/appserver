/******************************************************************************************************************
 * 수수료 할인 팝업 START
 ******************************************************************************************************************/
function renderCnd4FeePopup(data, productBenefitProvidedConditonList) {
    const cnd4FeePopupTpl = getTemplate('cnd4FeePopupTpl');

    cpl4feePopupGrid = null;
    cnd4feePopupGrid = null;
    limitcnd4feePopupGrid = null;
    deleteConditionList = [];

    var buttons = [
        {
            text:bxMsg('ContextMenu_Close'), elCls:'button button-primary', handler:function(){
            this.close();
        }
        }
    ];

    PFComponent.makePopup({
        title: bxMsg('NewFeeDiscountPopup'),        // 수수료할인 신규 팝업
        width: 800,
        height: 600,
        contents: cnd4FeePopupTpl(data),
        buttons: buttons,
        listeners: {
            afterRenderUI: function() {

                // tab
                var that = this;
                PFUI.use(['pfui/tab','pfui/mask'],function(Tab){

                    var tab = new Tab.Tab({
                        render : '.fee-dis-sub-tab',
                        elCls : 'nav-tabs',
                        autoRender: true,
                        children : [
                            {text:bxMsg('FeeDiscount')      , index:1},           // 수수료할인
                            {text:bxMsg('providedCondition'), index:2},            // 제공조건
                            {text:bxMsg('LimitCondition')   , index:3}              // 한도조건
                        ]
                    });


                    tab.on('selectedchange',function (ev) {

                        var item = ev.item;

                        // 수수료할인 탭
                        if (item.get('index') == 1) {
                            $('.add-cnd4-fee-tpl-popup .fee-discount').show();      // 수수료할인 탭 활성
                            $('.add-cnd4-fee-tpl-popup .fee-condition').hide();     //removeClass('active');
                            $('.add-cnd4-fee-tpl-popup .limit-condition').hide();
                            $('.fee-discount-save-btn').show();
                            $('.fee-discount-delete-btn').show();
                        }
                        // 제공조건 탭
                        else if(item.get('index') == 2){
                            $('.add-cnd4-fee-tpl-popup .fee-discount').hide();
                            $('.add-cnd4-fee-tpl-popup .fee-condition').show();     // 제공조건 탭 활성
                            $('.add-cnd4-fee-tpl-popup .limit-condition').hide();
                            $('.fee-discount-save-btn').hide();
                            $('.fee-discount-delete-btn').hide();

                            // 제공조건그리드
                            renderCnd4FeePopupGrid(data);
                            if (data && data.productBenefitProvidedConditionList && data.productBenefitProvidedConditonList.length > 0) {
                                cnd4feePopupGrid.setData(data.productBenefitProvidedConditonList);
                            }

                        }else if(item.get('index') == 3){
                            $('.add-cnd4-fee-tpl-popup .fee-discount').hide();
                            $('.add-cnd4-fee-tpl-popup .fee-condition').hide();     // 한도조건 탭 활성
                            $('.add-cnd4-fee-tpl-popup .limit-condition').show();
                            $('.fee-discount-save-btn').hide();
                            $('.fee-discount-delete-btn').hide();

                            // 한도조건그리드
                            renderLimitCnd4FeePopupGrid(data);
                            /*if(data && data.productBenefitLimitConditonList.length > 0) {
                             limitcnd4feePopupGrid.setData(data.productBenefitLimitConditonList);
                             }*/
                        } // 제공조건 탭 end

                        // 권한이 없는 경우
                        if(writeYn != 'Y'){
                            $('.write-btn').hide();
                        }

                    }); // tab.on('selectedchange') end

                    // 수수료할인 탭 활성
                    tab.setSelected(tab.getItemAt(0));

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
                        else {
                            $('.add-cnd4-fee-tpl-popup .fee-dis-com').hide();                               // 일반조건 숨김
                            $('.add-cnd4-fee-tpl-popup .fee-dis-com-amt').hide();                           // 일반조건>금액 숨김
                            $('.add-cnd4-fee-tpl-popup .fee-dis-com-rate').hide();                          // 일반조건>율 숨김
                            $('.add-cnd4-fee-tpl-popup .fee-dis-cpl').show();                               // 복합조건 활성

                            $('.add-cnd4-fee-tpl-popup .feeDiscountStructure').val('02');

                            // 복합조건그리드
                            renderCpl4FeePopupGrid(data.complexCndTitleInformationList, data.complexCndMatrix);   // title과 data를 넘겨줘야함.
                            //(data.complexConditonList) ? cpl4feePopupGrid.setData(data.complexConditonList) : cpl4feePopupGrid.setData([]);
                        }
                    }
                    // 데이터가 없을 때
                    else{
                        $('.add-cnd4-fee-tpl-popup .fee-dis-com').show();                                   // 일반조건 활성
                        $('.add-cnd4-fee-tpl-popup .fee-dis-com-amt').show();                               // 일반조건>금액 활성
                        $('.add-cnd4-fee-tpl-popup .fee-dis-com-rate').hide();                              // 율 숨김
                        $('.add-cnd4-fee-tpl-popup .fee-dis-cpl').hide();                                   // 복합조건 숨김

                        var nextDate = PFUtil.getToday() + ' 00:00:00';
                        var endDay = '9999-12-31 23:59:59';
                        $('.add-cnd4-fee-tpl-popup').find('.start-date').val(nextDate);    // ★★★ 시작일자 TEST를 위해 TODAY ★★★
                        $('.add-cnd4-fee-tpl-popup').find('.end-date').val(endDay);
                    }

                }); // PFUI tab end


            } // afterRenderUI end
        } // listener end
    }); // 수수료할인 팝업 end
}

// 수수료할인 팝업 복합조건 그리드
function renderCpl4FeePopupGrid(title, data){

    var fields = ['y'],
        columns = [{text: bxMsg('DPS0128String1'), xtype: 'rownumberer', width: 47, sortable: false, style : 'text-align:center'}],
        gridData = [];

    //reset title obj, arr of complex grid
    $('.add-cnd4-fee-popup-cpl-grid').empty();
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

                    if (newValue) {
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

                    return code;
                }
            });

            columns.push({header: el.titleConditionName + '('+ el.titleConditionCode +')',
                width: 170, dataIndex: conditionCode+'.code',
                style: 'text-align:center',
                renderer: function(value) {
                    return defineValuesObj[value];
                },
                editor: {
                    xtype: 'combo',
                    typeAhead: true,
                    triggerAction: 'all',
                    displayField: conditionCode =='L0149' ? 'code' : 'name',
                    valueField: 'code',
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
                            minValue = PFValidation.gridFloatCheckRenderer(newValue, 19, 2, true);
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
                            maxValue = PFValidation.gridFloatCheckRenderer(newValue, 19, 2, true);
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
                            return PFValidation.gridFloatCheckRenderer(value, 19, 2);
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
                                            PFValidation.gridFloatCheckKeydown(e, 19, 2);
                                        }else{
                                            PFValidation.gridFloatCheckKeydownForRangeType(e, 19, 2);
                                        }

                                    })
                                    .on('keyup', function (e) {
                                        if(isNotNegativeRangeType(conditionDetailCode)){
                                            PFValidation.gridFloatCheckKeyup(e, 19, 2);
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
                            return PFValidation.gridFloatCheckRenderer(value, 19, 2);
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
                                            PFValidation.gridFloatCheckKeydown(e, 19, 2);
                                        }else{
                                            PFValidation.gridFloatCheckKeydownForRangeType(e, 19, 2);
                                        }
                                    })
                                    .on('keyup', function (e) {
                                        if(isNotNegativeRangeType(conditionDetailCode)){
                                            PFValidation.gridFloatCheckKeyup(e, 19, 2);
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
            //yTitle2 = '',
            //yVal2 = '';

            //var conditionTypeCode = selectedCondition.conditionTypeCode;
            var extFormat;

            //switch (conditionTypeCode) {
            //    case '04' :
            if (record.get('y')) {
                var feeDiscountMinimumAmount, // 최소수수료
                    feeDiscountMaximumAmount,  // 최대수수료
                    feeDiscountAmount, // 기본수수료
                //minRt, // 최소수수료율
                //maxRt, // 최대수수료율
                    feeDiscountRate; // 기본율
                // 금액정보
                if (record.get('y').feeRateAmountDistinctionCode == '02') {
                    //minFixFeeAmt = (record.get('y').minFixFeeAmt) ? record.get('y').minFixFeeAmt : '0.00';
                    //maxFixFeeAmt = (record.get('y').maxFixFeeAmt) ? record.get('y').maxFixFeeAmt : '0.00';
                    feeDiscountAmount = (record.get('y').feeDiscountAmount) ? record.get('y').feeDiscountAmount : '0.00';

                    // 최소~최대(기본)
                    yTitle1 = bxMsg('base') + ' : ';        // 기본
                    yVal1 = feeDiscountAmount; //minFixFeeAmt + '~' + maxFixFeeAmt + '(' + fixed + ')';
                }
                // 율정보
                else if (record.get('y').feeRateAmountDistinctionCode == '01') {
                    //minRt = (record.get('y').minRt) ? record.get('y').minRt : '0.000000';
                    //maxRt = (record.get('y').maxRt) ? record.get('y').maxRt : '0.000000';
                    feeDiscountRate = (record.get('y').feeDiscountRate) ? record.get('y').feeDiscountRate : '0.000000';
                    feeDiscountMinimumAmount = (record.get('y').feeDiscountMinimumAmount) ? record.get('y').feeDiscountMinimumAmount : '0.00';
                    feeDiscountMaximumAmount = (record.get('y').feeDiscountMaximumAmount) ? record.get('y').feeDiscountMaximumAmount : '0.00';

                    // 최소~최대(기본)
                    yTitle1 = bxMsg('DPS0129Unit1String1') + ' : ';
                    yVal1 = feeDiscountMinimumAmount + '~' + feeDiscountMaximumAmount + '(' + feeDiscountRate + ' %)';
                }
            }

            extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}{1}</p>', yTitle1, yVal1);
            //        break;
            //}
            return extFormat;
        }
    });

    cpl4feePopupGrid = PFComponent.makeExtJSGrid({
        fields: fields,
        gridConfig:{
            renderTo: '.add-cnd4-fee-popup-cpl-grid',
            columns: columns
        }
    });

    cpl4feePopupGrid.setData(gridData);
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
            renderTo: '.add-cnd4-fee-popup-cnd-grid',
            columns: [
                {
                    text: bxMsg('DAS0101String11'),   // 일련번호
                    width: 60,
                    dataIndex: 'providedConditionSequenceNumber'
                },
                {
                    text: bxMsg('providedConditionCode'),   // 제공조건코드
                    width: 100,
                    dataIndex: 'providedConditionCode'
                },
                {
                    text: bxMsg('providedConditionName'),   // 제공조건명
                    width: 200,
                    dataIndex: 'providedConditionName'
                },
                {
                    text: bxMsg('DPP0127String6'), width: 160, dataIndex: 'applyStartDate',
                    editor: {
                        allowBlank: false,
                        listeners: {
                            focus: function (_this) {
                                //$('#'+_this.inputId).prop('readonly',true);
                                PFUtil.getGridDateTimePicker(_this, 'applyStart', cnd4feePopupGrid, selectedCellIndex);
                            }
                        }
                    },
                    listeners: {
                        click: function () {
                            selectedCndGridCellIndex = $(arguments[1]).parent().index();
                        }
                    }
                },
                {
                    text: bxMsg('DPP0127String7'), width: 160, dataIndex: 'applyEndDate',
                    editor: {
                        allowBlank: false,
                        listeners: {
                            focus: function (_this) {
                                //$('#'+_this.inputId).prop('readonly',true);
                                PFUtil.getGridDateTimePicker(_this, 'applyEnd', cnd4feePopupGrid, selectedCellIndex);
                            }
                        }
                    },
                    listeners: {
                        click: function () {
                            selectedCndGridCellIndex = $(arguments[1]).parent().index();
                        }
                    }
                },
                {
                    text: bxMsg('providedConditionVal'),
                    width: 280,
                    renderer: function (value, p, record) {
                        var yVal = '', extFormat, yTitle1 = '', yVal1 = '';
                        var conditionTypeCode = record.get('providedConditionTypeCode');

                        if (conditionTypeCode == '01') {

                            if (record.get('productBenefitProvidedListConditionList')) {
                                record.get('productBenefitProvidedListConditionList').forEach(function (el) {
                                    yVal = yVal + el.listCode + '，';
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
                    text: bxMsg('DPM10002Sring8'),
                    width: 60,
                    dataIndex: 'isAdditionalInfoExist', // 부가정보존재여부
                    style: 'text-align:center',
                    align: 'center',
                    renderer: function(value) {
                        return "<input type='checkbox' disabled='disabled'" + (value ? "checked='checked'" : "") + ">";
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
                    formData.cndDscd = '01';
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

                    // 부가정보 팝업 호출하도록
                    if(record.get('isAdditionalInfoExist') && cellIndex == 6){
                        PFPopup.selectAdditionalInfo({
                          data: record.getData(),
                          readOnly: true,
                        });
                    }
                }
            }
        } // gridcinfig end
    }); // 그리드 end


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
    formData.tntInstId = data.tntInstId;
    formData.conditionGroupTemplateCode = data.conditionGroupTemplateCode;
    formData.conditionGroupCode = data.conditionGroupCode;
    formData.conditionCode = data.conditionCode;
    searchApplyRule(formData, $('.add-cnd4-fee-tpl-popup .apply-rule-info-wrap'));	// 조회
}


// 수수료할인 팝업 한도조건 그리드
function renderLimitCnd4FeePopupGrid(data) {
    // 최초 한번만 그리드 생성
    if(limitcnd4feePopupGrid){
        return;
    }

    // 그리드
    limitcnd4feePopupGrid = PFComponent.makeExtJSGrid({
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
                    width: 60,
                    dataIndex: 'providedConditionCode'
                },
                {
                    text: bxMsg('DTP0203String2'),   // 조건명
                    width: 100,
                    dataIndex: 'providedConditionName'
                },
                {
                    text: bxMsg('DPP0127String6'), width: 160, dataIndex: 'applyStartDate',
                    editor: {
                        allowBlank: false,
                        listeners: {
                            focus: function (_this) {
                                //$('#'+_this.inputId).prop('readonly',true);
                                PFUtil.getGridDateTimePicker(_this, 'applyStart', limitcnd4feePopupGrid, selectedCellIndex);
                            }
                        }
                    },
                    listeners: {
                        click: function () {
                            selectedCndGridCellIndex = $(arguments[1]).parent().index();
                        }
                    }
                },
                {
                    text: bxMsg('DPP0127String7'), width: 160, dataIndex: 'applyEndDate',
                    editor: {
                        allowBlank: false,
                        listeners: {
                            focus: function (_this) {
                                //$('#'+_this.inputId).prop('readonly',true);
                                PFUtil.getGridDateTimePicker(_this, 'applyEnd', limitcnd4feePopupGrid, selectedCellIndex);
                            }
                        }
                    },
                    listeners: {
                        click: function () {
                            selectedCndGridCellIndex = $(arguments[1]).parent().index();
                        }
                    }
                },
                {
                    text: bxMsg('DPS0129String4'), //조건값
                    width: 280,
                    renderer: function (value, p, record) {
                        var yVal = '', extFormat, yTitle1 = '', yVal1 = '';
                        var conditionTypeCode = record.get('providedConditionTypeCode');

                        if (conditionTypeCode == '01') {

                            if (record.get('productBenefitProvidedListConditionList')) {
                                record.get('productBenefitProvidedListConditionList').forEach(function (el) {
                                    yVal = yVal + el.listCode + '，';
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
                    PFRequest.get('/benefit/queryListBenefitProvideCnd.json', formData, {
                        success: function(responseData) {
                            limitcnd4feePopupGrid.setData(responseData);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'BenefitProvideCndService',
                            operation: 'queryListBenefitProvideCnd'
                        }
                    });
                }
            }
        } // gridcinfig end
    }); // 그리드 end
}

// 적용규칙 조회
function searchApplyRule(param, $applyRuleInfo){

    if(!$applyRuleInfo){
        $applyRuleInfo = $('.apply-rule-info-wrap');
    }

    var requestParam = {
        tntInstId                       : param.tntInstId,
        ruleApplyTargetDistinctionCode  : $applyRuleInfo.find('.rule-apply-target-distinction-code').val()	// 규칙적용대상구분코드 = 01.우대금리적용규칙, 02.수수료할인, 03.우대금리제공조건, 04.수수료할인제공조건
    };

    if($applyRuleInfo.find('.rule-apply-target-distinction-code').val() == '01') {            // 01.우대금리적용규칙
        requestParam.pdCode                     = detailRequestParam.productCode;
    } else if($applyRuleInfo.find('.rule-apply-target-distinction-code').val() == '03') {     // 03.서비스제공조건적용규칙
        requestParam.pdCode                     = selectedTreeItem.id;
    } else{                                                                                   // 02.수수료할인적용규칙
        requestParam.cndGroupTemplateCode 		= param.conditionGroupTemplateCode;
        requestParam.cndGroupCode 				= param.conditionGroupCode;
        requestParam.cndCode 					= param.conditionCode;

        if($applyRuleInfo.find('.rule-apply-target-distinction-code').val() == '04' && param.feeDiscountSequenceNumber) { // 04.수수료할인 제공조건일때
            requestParam.feeDiscountSequenceNumber = param.feeDiscountSequenceNumber;
        }
    }

    PFRequest.get('/benefit/getBenefitRuleMaster.json', requestParam, {
        success: function(responseData) {

            // 조회일때
            if (responseData.ruleId) {
                $applyRuleInfo.find('.start-date').val(responseData.applyStartDate);
                $applyRuleInfo.find('.end-date').val(responseData.applyEndDate);
                $applyRuleInfo.find('.rule-id').val(responseData.ruleId);
                $applyRuleInfo.find('.apply-rule').val(responseData.ruleContent);
                $applyRuleInfo.find('.max-amount').val(responseData.maxAmount);
                $applyRuleInfo.find('.max-rate').val(responseData.maxRate);
                $applyRuleInfo.find('.status').val(responseData.ruleStatusCode);

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
                    $('.pf-cp-apply-rule-delete-btn').prop('disabled', false);  // 삭제버튼 활성
                } else {
                    $('.pf-cp-apply-rule-delete-btn').prop('disabled', true);  // 삭제버튼 비활성
                }
                $('.pf-cp-apply-rule-grapic-view-btn').prop('disabled', false);  // 그래픽으로보기 버튼 활성

                // 신규일 때
            } else {
                var nextDate = PFUtil.getToday() + ' 00:00:00';
                $applyRuleInfo.find('.start-date').val(nextDate);     // ★★★ 시작일자 TEST를 위해 TODAY ★★★
                $applyRuleInfo.find('.end-date').val('9999-12-31 23:59:59');
                $applyRuleInfo.find('.rule-id').val('');
                $applyRuleInfo.find('.apply-rule').val('');
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
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'BenefitRuleMasterService',
            operation: 'queryBenefitRuleMaster'
        }
    });
}

/******************************************************************************************************************
 * 수수료 할인 팝업 END
 ******************************************************************************************************************/
