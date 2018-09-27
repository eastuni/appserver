if(pageType === pageType_ProductGroupPage || pageType === pageType_ServiceGroupPage){
   var cnd4FeeConditionValueColumnSettingPopupTpl = getTemplate('cnd4FeeConditionValueColumnSettingPopupTpl');
}
var complexConditionPopupGrid;
var complexConditionPopupGridTitleDataObj = {};
var complexConditionPopupGridTitleDataArr = [];


function renderComplexConditionPopupGrid(title, data){

    var fields = ['y'],
        columns = [{text: bxMsg('DPS0128String1'), xtype: 'rownumberer', width: 47, sortable: false, style : 'text-align:center'}],
        gridData = [];

    //reset title obj, arr of complex grid
    $('.add-cnd4-fee-popup-cpl-grid').empty();
    complexConditionPopupGridTitleDataArr = [];
    complexConditionPopupGridTitleDataObj = {};

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

            if(el.defineValues){
            el.defineValues.forEach(function(e){
                if(e.key) {
                    e.code = e.key;
                    e.name = e.value;
                    delete e.key;
                    delete e.value;
                }
            });

                tempObj['defineValues'] = el.defineValues;
            }else {
                tempObj['defineValues'] = [];
            }



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

            var rangeHeader;

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
                            return PFValidation.gridFloatCheckRenderer(value, 19, 0);
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
                            return PFValidation.gridFloatCheckRenderer(value, 19, 0);
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

        complexConditionPopupGridTitleDataArr.push(tempObj);
    });

    complexConditionPopupGridTitleDataArr.forEach(function(el) {
        complexConditionPopupGridTitleDataObj[el.titleConditionCode] = el;
    });

    var flex = 0,
        width = 0;

    if(complexConditionPopupGridTitleDataArr.length >= 2) {
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
                yVal1 = '',
                yTitle2 = '',
                yVal2 = '';

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
                        }
                        baseString = (record.get('y').defalueValue) ? record.get('y').defalueValue : '0.00';
                        
                        
                    	// OHS 20180417 추가 - 소숫점일치를 위해 추가
                    	// 금액
                    	if(record.get('y').conditionDetailTypeCode == '01') {
                        	defaultString = PFValidation.gridFloatCheckRenderer(defaultString, 19, 2, true);
                        	minString = PFValidation.gridFloatCheckRenderer(minString, 19, 2, true);
                        	if(!record.get('y').isSystemMaxValue) {
                        		maxString = PFValidation.gridFloatCheckRenderer(maxString, 19, 2, true);
                        	}
                        	baseString = PFValidation.gridFloatCheckRenderer(baseString, 19, 2, true);
                    	}
                    	// 율
                    	else if(record.get('y').conditionDetailTypeCode == '05' || record.get('y').conditionDetailTypeCode == '08') {
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

                        if (selectedCondition.conditionDetailTypeCode == '01' || record.get('y').conditionDetailTypeCode === '01') {
                            yTitle2 = bxMsg('currencyCode') + ' : ';
                            yVal2 = codeMapObj['CurrencyCode'][record.get('y').currencyValue];
                        } else {
                            yTitle2 = bxMsg('DPS0129Unit1String2') + ' : ';
                            yVal2 = codeMapObj['ProductMeasurementUnitCode'][record.get('y').productMeasurementUnit];
                        }
                    }

                    extFormat = Ext.String.format('<p class="ext-condition-value-column">{0} {1} </br> {2} {3}</p>', yTitle1, yVal1, yTitle2, yVal2);
                    break;
            }

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
            }
        }]
    });

    complexConditionPopupGrid = PFComponent.makeExtJSGrid({
        fields: fields,
        gridConfig:{
            renderTo: '.prod-group-cnd-complex-grid',
            columns: columns,
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
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
                        }
                    }
                }
            }
        }
    });

    complexConditionPopupGrid.setData(gridData);
}


function isNotNegativeRangeType(conditionDetailTypeCode){
    if(conditionDetailTypeCode != '01' && conditionDetailTypeCode != '04' && conditionDetailTypeCode != '05'){
        return true;
    }else{
        return false;
    }
}

function renderColumnSettingPopup() {
  var conditionPopupGrid, columnSettingPopupGrid,
  measureComboData = codeArrayObj['ProductMeasurementUnitCode'],
  measureComboMap = codeMapObj['ProductMeasurementUnitCode'],
  rangeComboData = codeArrayObj['RangeBlwUnderTypeCode'],
  rangeComboMap = codeMapObj['RangeBlwUnderTypeCode'],
  currencyComboData = codeArrayObj['CurrencyCode'],
  currencyComboMap = codeMapObj['CurrencyCode'];

  function deleteArrFromObj(key, arr) {
    arr.forEach(function(el, idx){
      if (el.code === key) {
        arr.splice(idx, 1);

        return false;
      }
    })
  }

  PFComponent.makePopup({
    title: bxMsg('columnSetting'),
    width: 840,
    height: 360,
    contents: cnd4FeeConditionValueColumnSettingPopupTpl(),
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

        titleDataArr = selectedColumnList;

        // 목록형인 데이터의 콤보 바인딩을 위한 조회
        var codeList;
        selectedColumnList.forEach(function(el, index) {
          if(el.titleConditionTypeCode == '01') {     // 01.목록
            if(codeList) {
              codeList = codeList + '.' + el.titleConditionCode;
            }else{
              codeList = el.titleConditionCode;
            }
          }
        });

        if(codeList) {
          var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();

          var requestParam = {
              commonHeaderMessage : '{"loginTntInstId" : "'+ loginTntInstId +'"}',
              code : codeList,
              tntInstId : tntInstId
          };

          PFRequest.get('/condition/template/getListCndTemplateMasterList.json', requestParam, {
            success:function (responseData) {

              selectedColumnList.forEach(function (el) {
                responseData.forEach(function (e) {
                  if (el.titleConditionCode == e.code) {
                    el.defineValues = e.values;
                  }
                });
              });
              complexConditionPopupGridTitleDataArr = selectedColumnList;
              $('.prod-group-cnd-complex-grid').empty();
              renderComplexConditionPopupGrid(complexConditionPopupGridTitleDataArr, []);       // data
            },
            bxmHeader: {
              application: 'PF_Factory',
              service: 'CndTemplateService',
              operation: 'queryListListCndTemplate'
            }
          });
        }else{
          complexConditionPopupGridTitleDataArr = selectedColumnList;
          $('.prod-group-cnd-complex-grid').empty();
          renderComplexConditionPopupGrid(complexConditionPopupGridTitleDataArr, []);       // data
        }

        popupModifyFlag = true;
        this.close();
      }},
      {text:bxMsg('ButtonBottomString16'), elCls:'button button-primary', handler:function(){
        this.close();
      }}
      ],
      contentsEvent:{
        // 검색버튼 클릭시
        'click .cnd-tpl-search': function() {
          var requestParam = {
              'conditionName': $('.add-cnd4-fee-condition-value-column-setting-popup .cnd-name-search').val(),
              'tntInstId' : tntInstId
          };

          var comboVal = $('.add-cnd4-fee-condition-value-column-setting-popup .cnd-type-select').val();

          if (comboVal) {
            requestParam.conditionTypeCode = comboVal;
          } else {
            requestParam.conditionTypeCode = 'A';
          }
          PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
            success: function (responseData) {

              var resArrLength = responseData.length;

              // title로 설정되어 있는 조건은 제외
              var clone = responseData.slice(0);

              for (var i = 0; i < resArrLength; i++) {
                if (complexConditionPopupGridTitleDataObj[clone[i].code]) {
                  deleteArrFromObj(clone[i].code, responseData);
                }
              }

              conditionPopupGrid.setData(responseData);
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

          var requestParam = {'conditionTypeCode': 'A', 'tntInstId' : tntInstId};

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
          $('.add-cnd4-fee-condition-value-column-setting-popup .cnd-type-select').html(options);

          PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
            success: function(responseData) {

              var resArrLength = responseData.length;

              // title로 설정되어 있는 조건은 제외
              var clone = responseData.slice(0);

              for (var i = 0; i < resArrLength; i++) {
                if (complexConditionPopupGridTitleDataObj[clone[i].code]) {
                  deleteArrFromObj(clone[i].code, responseData);
                }
              }

              conditionPopupGrid = PFComponent.makeExtJSGrid({
                fields: [
                  'code', 'name', 'type',
                  'defineValues', 'titleConditionDetailTypeCode', 'conditionDetailTypeCode',
                  {
                    name: 'titleConditionCode',
                    convert: function(newValue, record) {
                      return record.get('code');
                    }},
                    {
                      name: 'titleConditionName',
                      convert: function(newValue, record) {
                        return record.get('name');
                      }},
                      {
                        name: 'titleConditionTypeCode',
                        convert: function(newValue, record) {
                          return record.get('type');
                        }}
                      ],
                      gridConfig: {
                        renderTo: '.add-cnd4-fee-condition-value-column-setting-popup .condition-list-grid',
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
                    if (record.get('conditionDetailTypeCode')) {
                      record.set('titleConditionDetailTypeCode', record.get('conditionDetailTypeCode'));
                    }

                    if (record.get('titleConditionTypeCode') === '02' && record.get('titleConditionDetailTypeCode') !== '01')  {

                      var val;
                      if (value) {
                        val = value;
                      } else {

                        if (record.get('titleConditionDetailTypeCode') === '05') {
                          val = '11';
                        }else if (record.get('titleConditionDetailTypeCode') === '02') {
                          val = '01';
                        }else {
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
                        record.set('titleConditionDetailTypeCode', record.get('conditionDetailTypeCode'));
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

              columnSettingPopupGrid = PFComponent.makeExtJSGrid({
                fields: ['titleConditionCode', 'rangeBlwUnderType', 'titleConditionName',
                  'productMeasurementUnit', 'titleConditionTypeCode', 'defineValues',
                  'type', 'titleConditionDetailTypeCode', 'currencyValue', 'baseConditionYn'],
                  gridConfig: {
                    renderTo: '.add-cnd4-fee-condition-value-column-setting-popup .column-list-grid',
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
                              if (editor.colIdx === 3 && (editor.value !== '11' && editor.value !== '12')) {
                                PFComponent.showMessage(bxMsg('RPorRM'), 'warning');
                                editor.record.set('productMeasurementUnit', editor.originalValue);
                              }
                            }else if(editor.record.data.titleConditionDetailTypeCode === '02' ) {
                              if (editor.colIdx === 3 && (editor.value === '11' || editor.value === '12' || editor.value === '13' || editor.value === '14' || editor.value === '10' || editor.value === '09')) {
                                PFComponent.showMessage(bxMsg('dateTypeError'), 'warning');
                                editor.record.set('productMeasurementUnit', editor.originalValue);
                              }
                            }
                          }
                        }
                      })
                      ]
                  }
              });


              columnSettingPopupGrid.setData(complexConditionPopupGridTitleDataArr);
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