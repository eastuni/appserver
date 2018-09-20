const cndValueTypeForFeeTpl = getTemplate('condition/cndValueTypeForFeeTpl');
const cndPopupTpl = getTemplate('condition/cndPopupTpl');

function renderConditionValuePopupForFee(data, rowIndex, grid){

    if(!grid) grid = cnd4feePopupGrid;

    PFComponent.makePopup({
        title: bxMsg('DPP0150Title2'),
        width: 350,
        height: 210,
        elCls: 'cnd-value-type-for-fee-popup',
        contents: cndValueTypeForFeeTpl(data),
        buttons: [
            {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn', handler:function(){
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
                    grid.store.getAt(rowIndex).set('process' , 'U');
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

                if(grid.store.getAt(rowIndex).get('providedConditionDetailTypeCode') === '01'){
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


/**********************************************************************************************************************
 * user defiend function
 **********************************************************************************************************************/

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
            conditionTypeCode: isRef ? $('.add-cnd-popup .cnd-type-select').val() : '03'
        };

        interestTypeData && $.extend(requestParam, interestTypeData);

        requestParam.pdInfoDscd = pdInfoDscd;
        requestParam.tntInstId = selectedTreeItem.tntInstId;

        PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
          success: function(responseData) {
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
        requestParam.tntInstId = tntInstId;

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
                if (value === '01') {
                  return bxMsg('active');
                } else if (value === '02') {
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
