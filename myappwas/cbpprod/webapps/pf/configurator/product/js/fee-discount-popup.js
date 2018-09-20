const cnd4FeeConditionValueType4TblByComplex = PFUtil.getTemplate('configurator/product', 'condition/cnd4FeeConditionValueType4TblByComplex');
const cnd4FeeConditionValueColumnSettingPopupTpl = PFUtil.getTemplate('configurator/product', 'condition/cnd4FeeConditionValueColumnSettingPopupTpl');

var historyYn = false; // OHS 20180412 - 이력팝업일경우 disabled 처리를 위함

// 수수료할인 복합조건 수수료조건 입력 팝업 호출
function renderCpl4feeConditionValue4Popup(data, rowIndex){
    var button;

    if (!data) {
        data = {};
    }
    // 금액정보
    data.feeDiscountAmount = (data.feeDiscountAmount) ? data.feeDiscountAmount : '0.00'; // 기본수수료

    // 율정보
    data.feeDiscountRate = (data.feeDiscountRate) ? data.feeDiscountRate : '0.000000'; // 기본

    // 징수수수료금액
    data.feeDiscountMinimumAmount = (data.feeDiscountMinimumAmount) ? data.feeDiscountMinimumAmount : '0.00'; // 최소금액
    data.feeDiscountMaximumAmount = (data.feeDiscountMaximumAmount) ? data.feeDiscountMaximumAmount : '0.00'; // 최대금액

    button = [
        {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn', handler:function(){
            var $popupTable = $('.cnd-value-type4-popup .bx-info-table'),
                formData = PFComponent.makeYGForm($popupTable).getData();

            var $radioType = $('.add-cnd4-fee-cnd-value-popup').find('input[name=cnd-value-04-radio2]:checked');
            // 수수료 유형코드 세팅
            if ($radioType.hasClass('charge-radio-amount')) {
                formData.feeRateAmountDistinctionCode = '02';
            } else if ($radioType.hasClass('charge-radio-rate')) {
                formData.feeRateAmountDistinctionCode = '01';
            }

            // OHS20180315 추가 - 율일경우 최소, 최대값 체크
            if(formData.feeRateAmountDistinctionCode == '01') {
            	var minValue = parseFloat(formData.feeDiscountMinimumAmount ? formData.feeDiscountMinimumAmount : 0);
            	var maxValue = parseFloat(formData.feeDiscountMaximumAmount ? formData.feeDiscountMaximumAmount : 0);
            	if(minValue < 0 || maxValue < 0) {
             	   	PFComponent.showMessage(bxMsg('MinMaxGreaterThanZero'), 'warning'); // 최소수수료, 최대수수료값은 0보다 커야합니다.
                	return;
            	}
            	if (minValue > maxValue) {
            		PFComponent.showMessage(bxMsg('DPJ0125Error1'), 'warning'); // 입력형식은 최소값 <= 최대값 형식이어야 합니다
                	return;
            	}
            }

            cpl4feePopupGrid.store.getAt(rowIndex).set('y', formData);

            popupModifyFlag = true;
            this.close();
        }},
        {text:bxMsg('ButtonBottomString16'), elCls:'button button-primary', handler:function(){
            this.close();
        }}
    ]


    // OHS20180412 - 이력버튼이면 저장버튼을 없애고 닫기만 활성화
    if(historyYn) {
    	button = [button[1]];
    }

    PFComponent.makePopup({
        title: bxMsg('DPP0150Title4'),
        width: 445,
        height: 210,
        elCls: 'cnd-value-type4-popup',
        contents: cnd4FeeConditionValueType4TblByComplex(data),
        buttons: button,
        contentsEvent: {
            'click input:radio[name="cnd-value-04-radio2"]': function(e) {
                var $type4Wrap = $('.add-cnd4-fee-cnd-value-popup');

                if (e.currentTarget.classList.contains('charge-radio-amount')) {
                    $type4Wrap.find('.cnd-value-04-amount-table').addClass('active');
                    $type4Wrap.find('.cnd-value-04-rate-table').removeClass('active');
                } else {
                    $type4Wrap.find('.cnd-value-04-amount-table').removeClass('active');
                    $type4Wrap.find('.cnd-value-04-rate-table').addClass('active');
                }
            }
        },
        listeners: {
            afterRenderUI: function() {
                var checkFloatPopup = PFValidation.floatCheck('.cnd-value-type4-popup');
                checkFloatPopup('.float21', 19, 2);
                checkFloatPopup('.float10', 3, 6);
                //checkFloatPopup('.float0', 3, 0);

                var focusDragPopup = PFValidation.dragAll('.cnd-value-type4-popup');
                focusDragPopup('.float21');
                focusDragPopup('.float10');

                var $popup =  $('.cnd-value-type4-popup');

                // 율정보 체크
                if (data.feeRateAmountDistinctionCode == '01') {
                    $popup.find('.charge-radio-rate').prop('checked', true);
                    $popup.find('.cnd-value-04-amount-table').removeClass('active');
                    $popup.find('.cnd-value-04-rate-table').addClass('active');
                }
                // 금액정보 체크
                else {
                    $popup.find('.charge-radio-amount').prop('checked', true);
                    $popup.find('.cnd-value-04-amount-table').addClass('active');
                    $popup.find('.cnd-value-04-rate-table').removeClass('active');
                }
                
                if(historyYn) {
                	$popup.find('input').prop('disabled', true);
                	$popup.find('select').prop('disabled', true);
                }
                
                // OHS 20180417 추가 - 소숫점 일치작업을 위해 팝업내의 input trigger 이벤트 적용
                $popup.find('input').trigger('blur');
                historyYn = false;
            }
        }
    });
}


function renderFeeDiscountHistory(param){
	const feeDiscountHistoryPopup = getTemplate('benefit/feeDiscountHistoryPopup');
    var feeDiscountHistoryGrid;

    PFComponent.makePopup({
        title: bxMsg('feeDiscountHistory'),		// 수수료할인 이력조회
        width: 800,
        height: 600,
        contents: feeDiscountHistoryPopup(param),
        listeners: {
            afterRenderUI: function() {

                renderComboBox('ProductStatusCode', $('.pf-cp-fee-discount-history-popup .feeDiscountStatusCode'), param.feeDiscountStatusCode);

                feeDiscountHistoryGrid = PFComponent.makeExtJSGrid({
                    fields: ['feeDiscountSequenceNumber', 'applyStartDate','applyEndDate', 'feeDiscountName', 'feeDiscountRate', 'feeDiscountAmount', 'conditionCode', 'conditionGroupCode', 'conditionGroupTemplateCode'],
                    gridConfig: {
                        renderTo: '.pf-cp-fee-discount-history-grid',
                        columns: [
                            {text: bxMsg('DPP0127String6') , flex:1, dataIndex: 'applyStartDate'				, align:'center', style: 'text-align:center'},
                            {text: bxMsg('DPP0127String7') , flex:1, dataIndex: 'applyEndDate'				, align:'center', style: 'text-align:center'},
                            {text: bxMsg('discountName')   , flex:1, dataIndex: 'feeDiscountName'			, align:'left'  , style: 'text-align:center'},
                            {text: bxMsg('discountAmount') , flex:1, dataIndex: 'feeDiscountAmount'			, align:'right'	, style: 'text-align:center'},
                            {text: bxMsg('DPS0126String18'), flex:1, dataIndex: 'feeDiscountRate'			, align:'right'	, style: 'text-align:center'}
                        ],
                        listeners:{
                            scope:this,
                            'celldblclick': function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                                PFRequest.get('/product_condition/getProductConditionFeeDiscount.json', {
                                        conditionGroupTemplateCode: record.get('conditionGroupTemplateCode'),
                                        conditionGroupCode: record.get('conditionGroupCode'),
                                        conditionCode: record.get('conditionCode'),
                                        feeDiscountSequenceNumber: record.get('feeDiscountSequenceNumber'),
                                        applyStartDate: record.get('applyStartDate'),
                                        tntInstId : param.tntInstId
                                    },
                                    {
                                        success: function(data) {
                                            $('.pf-cp-fee-discount-history-popup .fee-discount-history-wrap').html(feeDiscountHistoryDetailTpl(data));

                                            renderComboBox('ProductConditionClassifyCode', $('.pf-cp-fee-discount-history-popup .feeDiscountStructure'));

                                            // 일반조건
                                            if (data.complexConditionYn == 'N') {

                                                $('.pf-cp-fee-discount-history-popup .fee-dis-com').show();                               // 일반조건 활성
                                                $('.pf-cp-fee-discount-history-popup .fee-dis-cpl').hide();                               // 복합조건 숨김

                                                $('.pf-cp-fee-discount-history-popup .feeDiscountStructure').val('01');

                                                // 율 선택 시
                                                if (data.feeRateAmountDistinctionCode == '01') {
                                                    $('.pf-cp-fee-discount-history-popup').find('.fee-dis-com-amt').hide();               // 일반조건>금액 비활성
                                                    $('.pf-cp-fee-discount-history-popup').find('.fee-dis-com-rate').show();              // 일반조건>율 활성

                                                    $('.pf-cp-fee-discount-history-popup').find('.cnd4-fee-rate[value="01"]').prop('checked',true);      // 금액 checked
                                                    $('.pf-cp-fee-discount-history-popup').find('.cnd4-fee-amount[value="02"]').prop('checked',false);     // 율 unchecked

                                                }
                                                // 금액 선택 시
                                                else {
                                                    $('.pf-cp-fee-discount-history-popup').find('.fee-dis-com-amt').show();               // 일반조건>금액 활성
                                                    $('.pf-cp-fee-discount-history-popup').find('.fee-dis-com-rate').hide();              // 일반조건>율 비활성
                                                    $('.pf-cp-fee-discount-history-popup').find('.cnd4-fee-amount[value="02"]').prop('checked',true);     // 금액 checked
                                                    $('.pf-cp-fee-discount-history-popup').find('.cnd4-fee-rate[value="01"]').prop('checked',false);      // 율 unchecked

                                                }
                                            }
                                            // 복합조건
                                            else {
                                                $('.pf-cp-fee-discount-history-popup .fee-dis-com').hide();                               // 일반조건 숨김
                                                $('.pf-cp-fee-discount-history-popup .fee-dis-com-amt').hide();                           // 일반조건>금액 숨김
                                                $('.pf-cp-fee-discount-history-popup .fee-dis-com-rate').hide();                          // 일반조건>율 숨김
                                                $('.pf-cp-fee-discount-history-popup .fee-dis-cpl').show();                               // 복합조건 활성

                                                $('.pf-cp-fee-discount-history-popup .feeDiscountStructure').val('02');

                                                historyYn = true;
                                                
                                                // 복합조건그리드
                                                renderCpl4FeePopupGrid(data.complexCndTitleInformationList, data.complexCndMatrix, '.pf-cp-fee-discount-history-popup .add-cnd4-fee-popup-cpl-grid');   // title과 data를 넘겨줘야함.
                                            }
                                            
                                            // OHS20180412 추가 - 모든항목 이력팝업에 맞게 disabled 처리
                                            $('.pf-cp-fee-discount-history-popup .fee-discount-history-wrap').find('input').prop('disabled', true);
                                            $('.pf-cp-fee-discount-history-popup .fee-discount-history-wrap').find('textarea').prop('disabled', true);
                                            $('.pf-cp-fee-discount-history-popup .fee-discount-history-wrap').find('select').prop('disabled', true);
                                        },
                                        bxmHeader: {
                                            application: 'PF_Factory',
                                            service: 'PdCndFeeDiscountService',
                                            operation: 'queryPdCndFeeDiscount'
                                        }
                                    }
                                );
                            }
                        }
                    }
                });


                PFRequest.get('/product_condition/getListProductConditionFeeDiscount.json', param, {
                    success: function (data) {
                        feeDiscountHistoryGrid.setData(data);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'PdCndFeeDiscountService',
                        operation: 'queryListPdCndFeeDiscount'
                    }
                });
            }
        }
    });
}

function renderFeeDiscountColumnSettingPopup(_data) {
	if(!window.data) window.data = {};
	if(_data) data = _data; // OHS20180315 - 기존 사용하고있음에 따른 side effect 방지를 위함
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
              tntInstId : data.tntInstId
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
              cpl4feePopupGridTitleDataArr = selectedColumnList;
              renderCpl4FeePopupGrid(cpl4feePopupGridTitleDataArr, []);       // data
            },
            bxmHeader: {
              application: 'PF_Factory',
              service: 'CndTemplateService',
              operation: 'queryListListCndTemplate'
            }
          });
        }else{
          cpl4feePopupGridTitleDataArr = selectedColumnList;
          renderCpl4FeePopupGrid(cpl4feePopupGridTitleDataArr, []);       // data
        }

        modifyFlag = true;
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
              'tntInstId' : data.tntInstId
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
                if (cpl4feePopupGridTitleDataObj[clone[i].code]) {
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
                if (cpl4feePopupGridTitleDataObj[clone[i].code]) {
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


              columnSettingPopupGrid.setData(cpl4feePopupGridTitleDataArr);
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

  function deleteArrFromObj(key, arr) {

    arr.forEach(function(el, idx){
      if (el.code === key) {
        arr.splice(idx, 1);

        return false;
      }
    })
  }
}