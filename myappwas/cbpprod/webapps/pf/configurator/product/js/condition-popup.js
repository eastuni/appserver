const cndPopupTpl = getTemplate('main/cndPopupTpl');
const cnd2FeePopupTpl = getTemplate('condition/cnd2FeePopupTpl');
const cndValueTypeForFeeTpl = getTemplate('condition/cndValueTypeForFeeTpl');

function makeConditionTemplateListSearchPopup(submitEvent, isRef, interestTypeData){
    var cndPopupGrid;
    PFComponent.makePopup({
        title: bxMsg('DTP0203Title'),
        width: 500,
        height: 330,
        contents: cndPopupTpl(),
        submit: function() {
            var data = cndPopupGrid.getSelectedItem()[0];
            submitEvent(data);
            modifyFlag = true;
        },
        contentsEvent: {
            'click .cnd-tpl-search': function() {

                $('.preference-interest-search').hide();
                var requestParam = {
                    conditionName: $('.add-cnd-popup .cnd-name-search').val(),
                    conditionTypeCode: isRef ? $('.add-cnd-popup .cnd-type-select').val() : '03',
                    pirtCndQueryYn : 'N' // OHS20180214 추가 - 우대금리를 제외한 기본이율만 조회하기 위함임. 타상품금리연동 조회팝업
                };

                interestTypeData && $.extend(requestParam, interestTypeData);

                requestParam.pdInfoDscd = pdInfoDscd;
                requestParam.tntInstId = selectedTreeItem.tntInstId;

                PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
                    success: function(responseData) {
                    	// OHS 20180213 추가 - 자바스크립트 error 방지
                    	if(responseData) {
                    		cndPopupGrid.setData(responseData);
                    	}
                    	else {
                    		cndPopupGrid.setData([]);
                    	}
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
                $('.preference-interest-search').hide();
                if(isRef){
                    setRefComboBox();

                }else{
                    $('.add-cnd-popup .ref-condition-item').hide();
                }

                var requestParam = {conditionTypeCode: isRef ? $('.add-cnd-popup .cnd-type-select').val() : '03' };

                interestTypeData && $.extend(requestParam, interestTypeData);

                requestParam.pdInfoDscd = pdInfoDscd;
                requestParam.tntInstId = selectedTreeItem.tntInstId;
                requestParam.pirtCndQueryYn = 'N'; // OHS20180214 추가 - 우대금리를 제외한 기본이율만 조회하기 위함임. 타상품금리연동 조회팝업

                PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
                    success: function(responseData) {
                        cndPopupGrid = makeCndListGrid(responseData);
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

    function setRefComboBox(){
        var options = [];

        $.each(codeMapObj['ProductConditionTypeCode'], function(key,value){
            if(key == '01' || key == '02'){
                var $option = $('<option>');
                $option.val(key);
                $option.text(value);

                options.push($option);
            }
        });

        $('.add-cnd-popup .cnd-type-select').html(options);
    }

    function makeCndListGrid(gridData){
        var grid = PFComponent.makeExtJSGrid({
            fields: ['code', 'type', 'name', 'content', 'isActive','conditionDetailTypeCode','currentCatalogId', {
                name: 'typeNm',
                convert: function(newValue, record) {
                    var typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
                    return typeNm;
                }}],
            gridConfig: {
                selModel: Ext.create ('Ext.selection.CheckboxModel', {mode: 'SINGLE'}),
                renderTo: '.popup-cnd-grid',
                columns: [
                    {text: bxMsg('DTP0203String3'), width: 80, dataIndex: 'code'},
                    {text: bxMsg('DTP0203String4'), width: 80, dataIndex: 'typeNm'},
                    {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name'},
                    {text: bxMsg('DPS0101String6'), width: 70, dataIndex: 'isActive',
                        renderer: function(value, p, record) {
                        	// OHS 20180214 추가 - 01, 02 또는 Y, N으로 들어올경우 모두 처
                            if (value === '01' || value == 'Y') {
                                return bxMsg('active');
                            } else if (value === '02' || value == 'N') {
                                return bxMsg('inactive');
                            }
                        }
                    },
                    {text: bxMsg('DTP0203String8'), flex: 1, dataIndex: 'content'}
                ]
            }
        });

        if(gridData) {
        	grid.setData(gridData);
        }
        return grid;
    }

}


// 공통 우대금리 검색 팝업
function renderSearchCommonPrefIntPopup(submitEvent){
    var cndPopupGrid;

    PFComponent.makePopup({
        title: bxMsg('DTP0203Title'),
        width: 500,
        height: 330,
        contents: cndPopupTpl(),
        submit: function () {
            submitEvent(cndPopupGrid.getSelectedItem());
        },
        contentsEvent: {
            'keydown.xdsoft .preference-interest-search-base': function(e) {
                if (e.keyCode == '13') {
                    var requestParam = {};
                    requestParam.applyStart = $('.preference-interest-search-base').val();

                    PFRequest.get('/product_condition/getCommonPreferenceInterestCondition.json', requestParam, {
                        success: function (responseData) {
                        	if(responseData) {
                        		cndPopupGrid.setData(responseData);
                        	}
                        	else {
                        		cndPopupGrid.setData([]);
                        	}
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'PreferencialInterestService',
                            operation: 'queryCommonPreferentialInterestCnd'
                        }
                    });
                }
            }

        },
        listeners:{
            afterRenderUI: function() {

                $('.popup-cnd-tpl-grid-header').hide();
                //PFUtil.getDatePicker(true, $('.add-cnd-popup'));
                PFUtil.getAllDatePicker(true, $('.add-cnd-popup'));
                $('.preference-interest-search-base').val(XDate(Date()).toString("yyyy-MM-dd")+ " 00:00:00");

                cndPopupGrid = PFComponent.makeExtJSGrid({
                    fields: [
                        'id', 'text', 'tntInstId',
                        'conditionGroupTemplateCode', 'conditionGroupCode', 'conditionDetailTypeCode',
                        'applyStart', 'applyEnd', 'isValueNull',
                        {
                            name: 'valueYn',
                            convert: function(newValue, record) {
                                if(record.get('isValueNull')) {        // true == 값 없음,  false = 값 존재
                                    return 'N';
                                }else{
                                    return 'Y';
                                }
                            }
                        }
                    ],
                    gridConfig: {
                        //selType: 'checkboxmodel',
                        selModel: Ext.create ('Ext.selection.CheckboxModel', {mode: 'MULTI'}),
                        renderTo: '.popup-cnd-grid',
                        columns: [
                            {text: bxMsg('DTP0203String3'), flex: 1, dataIndex: 'id'},
                            {text: bxMsg('DTP0203String5'), flex: 4, dataIndex: 'text'},
                            {text: bxMsg('DPS0129String4') + bxMsg('Yn'), flex: 1, dataIndex: 'valueYn'}
                        ]
                    }
                });

                var requestParam = {};
                requestParam.applyStart =$('.preference-interest-search-base').val();

                PFRequest.get('/product_condition/getCommonPreferenceInterestCondition.json', requestParam, {
                    success: function (responseData) {
                    	if(responseData) {
                    		cndPopupGrid.setData(responseData);
                    	}
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'PreferencialInterestService',
                        operation: 'queryCommonPreferentialInterestCnd'
                    }
                });
            }
        }
    });
}


function renderConditionValuePopupForFee(data, rowIndex, grid){
    if(!grid) grid = cnd4feePopupGrid;

    PFComponent.makePopup({
        title: bxMsg('DPP0150Title2'),
        width: 350,
        height: 210,
        elCls: 'cnd-value-type-for-fee-popup',
        contents: cndValueTypeForFeeTpl(data),
        buttons: [
            {text:bxMsg('ButtonBottomString3'), elCls:'button button-primary write-btn', handler:function(){
                var $popupTable = $('.cnd-value-type-for-fee .bx-info-table'),
                    formData = PFComponent.makeYGForm($popupTable).getData();

                if (!PFValidation.minMaxCheck($('.cnd-value-type-for-fee'), '.type2-min-check', '.type2-max-check')) {
                    PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
                    return;
                }

                grid.store.getAt(rowIndex).set('minValue', formData.minValue);
                grid.store.getAt(rowIndex).set('maxValue', formData.maxValue);
                grid.store.getAt(rowIndex).set('mesurementUnitCode', formData.mesurementUnitCode);
                grid.store.getAt(rowIndex).set('currencyCode', formData.currencyCode);

                if(grid.store.getAt(rowIndex).get('process') != 'C'){
                    grid.store.getAt(rowIndex).set('process', 'U');
                }
                modifyFlag = true;
                this.close();
            }},
            {text:bxMsg('ButtonBottomString16'), elCls:'button button-primary', handler:function(){
                this.close();
            }}
        ],
        listeners: {
            afterRenderUI: function() {
                var checkFloat = PFValidation.floatCheck($('.cnd-value-type-for-fee-popup'));
                checkFloat('.float21', 19, 2);
                checkFloat('.float10', 3, 6);
                checkFloat('.float0', 8, 0);

                var checkFlatForRageType = PFValidation.floatCheckForRangeType($('.cnd-value-type-for-fee-popup'));
                checkFlatForRageType('.float-range-21', 19, 2);

                // 금액, 숫자
                if(data.detailType == '01' || data.detailType == '04'){
                    $('.type2-min-check').addClass('float-range-21');
                    $('.type2-max-check').addClass('float-range-21');
                }
                // 율
                else if (data.detailType == '05'){
                    $('.type2-min-check').addClass('float10');
                    $('.type2-max-check').addClass('float10');
                }
                else if(data.detailType == '02'){
                    $('.type2-min-check').addClass('float0');
                    $('.type2-max-check').addClass('float0');
                }
                else{
                    $('.type2-min-check').addClass('float21');
                    $('.type2-max-check').addClass('float21');
                }

                renderComboBox('CurrencyCode', $('.currencyCode'), data.currencyCode);

                if(data.detailType === '01'){
                    $('.tr-mesurementUnitCode').hide();
                    $('.tr-currencyCode').show();
                }else {
                    if(data.detailType === '02') {  // 날짜
                        renderComboBox('ProductMeasurementUnitCodeD', $('.measurementUnitCode'), data.mesurementUnitCode);
                    }
                    else if(data.detailType === '03') { // 주기
                        renderComboBox('ProductMeasurementUnitCodeF', $('.measurementUnitCode'), data.mesurementUnitCode);
                    }
                    else if(data.detailType === '04') { // 숫자
                        renderComboBox('ProductMeasurementUnitCodeN', $('.measurementUnitCode'), data.mesurementUnitCode);
                    }
                    else if(data.detailType === '05') { // 율
                        renderComboBox('ProductMeasurementUnitCodeR', $('.measurementUnitCode'), data.mesurementUnitCode);
                    }
                    else {
                        renderComboBox('ProductMeasurementUnitCode', $('.measurementUnitCode'), data.mesurementUnitCode);
                    }

                    $('.tr-mesurementUnitCode').show();
                    $('.tr-currencyCode').hide();
                }
            }
        }
    });
}

function renderCnd2FeePopup() {

  var cnd2FeePopupGrid;

  PFComponent.makePopup({
    title: bxMsg('DPP0139Title'),
    width: 500,
    height: 330,
    contents: cnd2FeePopupTpl(),
    submit: function() {
      var selectedData = cnd2FeePopupGrid.getSelectedRecords(),
      selectedDataArr = [];

      var applyStart = PFUtil.getNextDate() + ' 00:00:00';
      $.each(selectedData, function(idx, value) {
        value.data['applyStart'] = applyStart;
        value.data['applyEnd'] = '9999-12-31 23:59:59';

        delete value.data['id'];
        selectedDataArr.push(value.data);
      });

      cndType2Grid.addData(selectedDataArr);

      modifyFlag = true;
    },
    contentsEvent: {
      'click .cnd2-fee-name-search': function() {
        var requestParam = {
            'conditionName': $('.add-cnd2-fee-tpl-popup .cnd2-fee-name-search').val(),
            'tntInstId' : tntInstId
        };

        PFRequest.get('/condition/template/queryConditionTemplatePrimeInterestForList.json', requestParam, {
          success: function(responseData) {

            $('.add-cnd2-fee-tpl-popup .popup-cnd2-fee-grid').empty();

            cnd2FeePopupGrid = PFComponent.makeExtJSGrid({
              fields: ['text', 'name', 'interestConditionValue', {
                name: 'rate',
                convert: function(newValue, record) {
                  var interestConditionValue = record.get('interestConditionValue');
                  return interestConditionValue.rate;
                }},{
                  name: 'conditionCode',
                  convert: function(newValue, record) {
                    return record.get('id');
                  }}, 'conditionGroupCode', 'conditionGroupTemplateCode','id'],
                  gridConfig: {
                    selType: 'checkboxmodel',
                    renderTo: '.popup-cnd2-fee-grid',
                    columns: [
                      {text: bxMsg('DPS0138String2'), flex: 1, dataIndex: 'text'},
                      {text: bxMsg('DPS0138String5'), flex: 1, dataIndex: 'rate'}
                      ]
                  }
            });

            if(responseData) {
            	cnd2FeePopupGrid.setData(responseData);
            }
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CndTemplateService',
            operation: 'queryListCndTemplatePrimeInterest'
          }
        });
      }
    },
    listeners: {
      afterRenderUI: function() {
        PFRequest.get('/condition/template/queryConditionTemplatePrimeInterestForList.json',{tntInstId: tntInstId}, {
          success: function(responseData) {

            cnd2FeePopupGrid = PFComponent.makeExtJSGrid({
              fields: ['text', 'name', 'interestConditionValue', {
                name: 'rate',
                convert: function(newValue, record) {
                  var interestConditionValue = record.get('interestConditionValue');
                  return interestConditionValue.rate;
                }},{
                  name: 'conditionCode',
                  convert: function(newValue, record) {
                    return record.get('id');
                  }}, 'conditionGroupCode', 'conditionGroupTemplateCode','id'],
                  gridConfig: {
                    selType: 'checkboxmodel',
                    renderTo: '.popup-cnd2-fee-grid',
                    columns: [
                      {text: bxMsg('DPS0138String2'), flex: 1, dataIndex: 'text'},
                      {text: bxMsg('DPS0138String5'), flex: 1, dataIndex: 'rate'}
                      ]
                  }
            });

            if(responseData) {
            	cnd2FeePopupGrid.setData(responseData);
            }
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CndTemplateService',
            operation: 'queryListCndTemplatePrimeInterest'
          }
        });
      }
    }
  });
}