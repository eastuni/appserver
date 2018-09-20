if(pageType === pageType_ProductGroupPage || pageType === pageType_ServiceGroupPage){
  var conditionType1PopupTpl = getTemplate('conditionType1PopupTpl'); // 목록형 조건정보관리 팝업
  var conditionType2PopupTpl = getTemplate('conditionType2PopupTpl'); // 범위형 조건정보관리 팝업
  var cndValueType1Tpl = getTemplate('cndValueType1Tpl'); // 목록형 조건값입력 팝업
  var cndValueType2Tpl = getTemplate('cndValueType2Tpl'); // 범위형 조건값입력 팝업
}

function renderConditionValue1Popup(data, rowIndex, historyButton){
    var yDefineValues, button;

    if (historyButton){
        button = historyButton;
    } else {
        button = [
            {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn', handler:function(){
                var listDataObj = {},
                    selectedCode = $('.cnd-value-type1-popup .cnd-val-type1-grid').find('input[name=default-check]:checked').attr('data-code'),
                    gridData = cndValueType1Grid.getAllData();

                listDataObj.defineValues = gridData;
                complexConditionPopupGrid.store.getAt(rowIndex).set('y', listDataObj);
                popupModifyFlag = true;

                this.close();
            }},
            {text:bxMsg('ButtonBottomString16'), elCls:'button button-primary', handler:function(){
                this.close();
            }}
        ]
    }

    if (!data) {
              yDefineValues = selectedCondition.listConditionValue.defineValues;
    } else {

        for(var i = 0 ; i < selectedCondition.listConditionValue.defineValues.length; i++){
            for(var j = 0 ; j < data.defineValues.length ; j ++){
                if(selectedCondition.listConditionValue.defineValues[i].code === data.defineValues[j].code) {
                    selectedCondition.listConditionValue.defineValues[i] = data.defineValues[j];
                }
            }
        }

        yDefineValues = selectedCondition.listConditionValue.defineValues;
    }

    PFComponent.makePopup({
        title: bxMsg('DPP0150Title1'),
        width: 500,
        height: 370,
        elCls: 'cnd-value-type1-popup',
        contents: cndValueType1Tpl(),
        buttons: button,
        listeners: {
            afterRenderUI: function() {
                if (historyButton) {
                    renderHistoryCndValueType1Grid(data.defineValues, '.cnd-value-type1-popup .cnd-val-type1-grid');
                } else {
                    renderCndValueType1Grid(yDefineValues, true);
                }
            }
        }
    });
}

/**
 * 범위형 복합조건 설정 팝업
 * @param data
 * @param rowIndex
 * @param historyButton
 */
function renderConditionValue2Popup(data, rowIndex, historyButton){
    var button;

    if (historyButton){
        button = historyButton;
    } else {
        if (!data) {
            data = {};
        }
        
        // OHS 2017.02.28 추가 - 데이터보여줄때 천단위 자릿수추가
        data.defalueValue = (data.defalueValue) ? data.defalueValue : '0.00';
        data.increaseValue = (data.increaseValue) ? data.increaseValue : '0.00';
        data.maxValue = (data.maxValue) ? data.maxValue : '0.00';
        data.minValue = (data.minValue) ? data.minValue : '0.00';

    	// OHS 20180503 추가 - 소숫점일치를 위해 추가
      	if(data.conditionDetailTypeCode == '01') {
      		data.minValue = PFValidation.gridFloatCheckRenderer(data.minValue, 19, 2);
      		data.maxValue = PFValidation.gridFloatCheckRenderer(data.maxValue, 19, 2);
            data.increaseValue = PFValidation.gridFloatCheckRenderer(data.increaseValue, 19, 2);
            data.defalueValue = PFValidation.gridFloatCheckRenderer(data.defalueValue, 19, 2);
      	}
      	// 율
      	else if(data.conditionDetailTypeCode == '05' || data.conditionDetailTypeCode == '08') {
      		data.minValue = PFValidation.gridFloatCheckRenderer(data.minValue, 3, 6);
      		data.maxValue = PFValidation.gridFloatCheckRenderer(data.maxValue, 3, 6);
            data.increaseValue = PFValidation.gridFloatCheckRenderer(data.increaseValue, 3, 6);
            data.defalueValue = PFValidation.gridFloatCheckRenderer(data.defalueValue, 3, 6);
      	}
      	else {
      		data.minValue = PFValidation.gridFloatCheckRenderer(data.minValue, 8, 0);
      		data.maxValue = PFValidation.gridFloatCheckRenderer(data.maxValue, 8, 0);
            data.increaseValue = PFValidation.gridFloatCheckRenderer(data.increaseValue, 8, 0);
            data.defalueValue = PFValidation.gridFloatCheckRenderer(data.defalueValue, 8, 0);
      	}
      	
        button = [
            {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn', handler:function(){
                var $popupTable = $('.cnd-value-type2-popup .bx-info-table'),
                    formData = PFComponent.makeYGForm($popupTable).getData();

                if (!selectedCondition.isSingleValue) {

                   	// OHS 2017.03.02 수정 - 그룹정보의 범위조건값은 상품조건의 상품레벨로 동일하게 체크한다.
                	var checkMsg = PFValidation.minMaxCheckForPfLvl($('.cnd-value-type2-popup'), '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check');
        			if (checkMsg) {
        				PFComponent.showMessage(checkMsg, 'warning');
        				return;
        			}
                }

                if (selectedCondition.isSingleValue) {
                    formData.isSingleValue = true;
                    formData.maxValue = formData.defalueValue;
                    formData.increaseValue = '0';
                    formData.minValue =formData.defalueValue;
                } else {
                    formData.isSingleValue = false;
                }

                if ($popupTable.find('.isSystemMaxValue').find('input').prop('checked')) {
                    formData.isSystemMaxValue = true;
                } else {
                    formData.isSystemMaxValue = false;
                }

                complexConditionPopupGrid.store.getAt(rowIndex).set('y', formData);
                popupModifyFlag = true;
                this.close();
            }},
            {text:bxMsg('ButtonBottomString16'), elCls:'button button-primary', handler:function(){
                this.close();
            }}
        ]
    }

    PFComponent.makePopup({
        title: bxMsg('DPP0150Title2'),  //범위조건 입력
        width: 680,
        height: 250,
        elCls: 'cnd-value-type2-popup',
        contents: cndValueType2Tpl(data),
        buttons: button,
        contentsEvent: {
            'click .isSystemMaxValue': function(e) {
                if($(e.currentTarget).find('input').prop('checked')) {
                    $('.cnd-value-type2-popup').find('.maxValue').prop('disabled', true).val('9999999999999999999.999999');
                } else {
                	// OHS 20180503 추가 - 조건상세유형별 체크해제 값을 다르게 세팅함
                	if(data.conditionDetailTypeCode == '01') {
                		$('.cnd-value-type2-popup').find('.maxValue').prop('disabled', false).val('0.00');
                	}
                	else if(data.conditionDetailTypeCode == '05' || data.conditionDetailTypeCode == '08') {
                		$('.cnd-value-type2-popup').find('.maxValue').prop('disabled', false).val('0.000000');
                	}
                	else {
                		$('.cnd-value-type2-popup').find('.maxValue').prop('disabled', false).val('0');
                	}
                }
            },
            // OHS 2017.02.27 추가 - 동일값사용 누락로직 추가
            'click .isUseSameValue' : function(e) {
                if($(e.currentTarget).find('input').prop('checked')) {
                    $('.cnd-value-type2-popup').find('.defalueValue').val($('.cnd-value-type2-popup').find('.minValue').val());
                    if(!$('.cnd-value-type2-popup').find('.isSystemMaxValue').find('input').prop('checked')) {
                        $('.cnd-value-type2-popup').find('.maxValue').val($('.cnd-value-type2-popup').find('.minValue').val());
                    }
                }
            },
            'keyup.xdsoft .minValue' : function(e) {
                if($('.cnd-value-type2-popup').find('.isUseSameValue').find('input').prop('checked')){
                    if(!$('.cnd-value-type2-popup').find('.isSystemMaxValue').find('input').prop('checked')) {
                    	$('.cnd-value-type2-popup').find('.maxValue').val($('.cnd-value-type2-popup').find('.minValue').val());
                    	$('.cnd-value-type2-popup').find('.maxValue').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
                    }
                    $('.cnd-value-type2-popup').find('.defalueValue').val($('.cnd-value-type2-popup').find('.minValue').val());
                    $('.cnd-value-type2-popup').find('.defalueValue').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
                }
            }
        },
        listeners: {
            afterRenderUI: function() {
            	
                // OHS 20180503 - 기존로직 삭제, 아래로직 추가
                // 금액
                if(data.conditionDetailTypeCode == '01') {
                    $('.cnd-value-type2-popup').find('.minValue').removeClass('float-range-10');
                    $('.cnd-value-type2-popup').find('.maxValue').removeClass('float-range-10');
                    $('.cnd-value-type2-popup').find('.defalueValue').removeClass('float-range-10');
                    $('.cnd-value-type2-popup').find('.type2-increase-check').removeClass('float-range-10');

                    $('.cnd-value-type2-popup').find('.minValue').removeClass('float-range-0');
                    $('.cnd-value-type2-popup').find('.maxValue').removeClass('float-range-0');
                    $('.cnd-value-type2-popup').find('.defalueValue').removeClass('float-range-0');
                    $('.cnd-value-type2-popup').find('.type2-increase-check').removeClass('float-range-0');

                    $('.cnd-value-type2-popup').find('.minValue').addClass('float-range-21');
                    $('.cnd-value-type2-popup').find('.maxValue').addClass('float-range-21');
                    $('.cnd-value-type2-popup').find('.defalueValue').addClass('float-range-21');
                    $('.cnd-value-type2-popup').find('.type2-increase-check').addClass('float-range-21');
                }
                // 율
                else if(data.conditionDetailTypeCode == '05' || data.conditionDetailTypeCode == '08'){
                    $('.cnd-value-type2-popup').find('.minValue').removeClass('float-range-21');
                    $('.cnd-value-type2-popup').find('.maxValue').removeClass('float-range-21');
                    $('.cnd-value-type2-popup').find('.defalueValue').removeClass('float-range-21');
                    $('.cnd-value-type2-popup').find('.type2-increase-check').removeClass('float-range-21');

                    $('.cnd-value-type2-popup').find('.minValue').removeClass('float-range-0');
                    $('.cnd-value-type2-popup').find('.maxValue').removeClass('float-range-0');
                    $('.cnd-value-type2-popup').find('.defalueValue').removeClass('float-range-0');
                    $('.cnd-value-type2-popup').find('.type2-increase-check').removeClass('float-range-0');

                    $('.cnd-value-type2-popup').find('.minValue').addClass('float-range-10');
                    $('.cnd-value-type2-popup').find('.maxValue').addClass('float-range-10');
                    $('.cnd-value-type2-popup').find('.defalueValue').addClass('float-range-10');
                    $('.cnd-value-type2-popup').find('.type2-increase-check').addClass('float-range-10');

                }else{
                    $('.cnd-value-type2-popup').find('.minValue').removeClass('float-range-21');
                    $('.cnd-value-type2-popup').find('.maxValue').removeClass('float-range-21');
                    $('.cnd-value-type2-popup').find('.defalueValue').removeClass('float-range-21');
                    $('.cnd-value-type2-popup').find('.type2-increase-check').removeClass('float-range-21');

                    $('.cnd-value-type2-popup').find('.minValue').removeClass('float-range-10');
                    $('.cnd-value-type2-popup').find('.maxValue').removeClass('float-range-10');
                    $('.cnd-value-type2-popup').find('.defalueValue').removeClass('float-range-10');
                    $('.cnd-value-type2-popup').find('.type2-increase-check').removeClass('float-range-10');

                    $('.cnd-value-type2-popup').find('.minValue').addClass('float-range-0');
                    $('.cnd-value-type2-popup').find('.maxValue').addClass('float-range-0');
                    $('.cnd-value-type2-popup').find('.defalueValue').addClass('float-range-0');
                    $('.cnd-value-type2-popup').find('.type2-increase-check').addClass('float-range-0');
                }
                // OHS 2017.02.28 추가
                var checkFloatPopup = PFValidation.floatCheck('.cnd-value-type2-popup');
                checkFloatPopup('.float-range-21', 19, 2);
                checkFloatPopup('.float-range-10', 3, 6);
                checkFloatPopup('.float-range-0', 14, 0);	// 일자(+시분초)를 감안하여 14자리로 변경

                var focusDragPopup = PFValidation.dragAll('.cnd-value-type2-popup');
                focusDragPopup('.float-range-21');
                focusDragPopup('.float-range-10');
                focusDragPopup('.float-range-0');

                var $popup =  $('.cnd-value-type2-popup');

                if (historyButton) {
                    $popup.find('input').prop('disabled', true);
                    $('.cnd-value-type2-popup').find('select').prop('disabled', true);
                }

                if (data.isSingleValue) {
                    $popup.find('.isSingleValue-hide').hide();
                } else {
                    $popup.find('.isNotSingleValue-hide').hide();
                }

                if (selectedCondition.conditionDetailTypeCode == '01' || data.conditionDetailTypeCode == '01') {
                    $popup.find('.detail-type01-hide').hide();
                    renderComboBox('CurrencyCode', $('.CurrencyCode:visible'), data.currencyValue);
                } else {
                    $popup.find('.detail-except-type01-hide').hide();

                    //05일 때 최대치 선택 못하게 하며 측정단위도 달라여쟈함
                    if (selectedCondition.conditionDetailTypeCode == '05' || data.conditionDetailTypeCode == '05') {
                        // isSystemMaxValue Control
                        $popup.find('.isSystemMaxValue').find('input').prop('checked', false).prop('disabled', true);
                        renderComboBox('ProductMeasurementUnitCodeR', $('.ProductMeasurementUnitCode:visible'), data.productMeasurementUnit);
                    }
                    // 02.날짜
                    else if(selectedCondition.conditionDetailTypeCode == '02' || data.conditionDetailTypeCode == '02'){
                        renderComboBox('ProductMeasurementUnitCodeD', $('.ProductMeasurementUnitCode:visible'), data.productMeasurementUnit);
                    }
                    // 03.주기
                    else if(selectedCondition.conditionDetailTypeCode == '03' || data.conditionDetailTypeCode == '03'){
                        renderComboBox('ProductMeasurementUnitCodeF', $('.ProductMeasurementUnitCode:visible'), data.productMeasurementUnit);
                    }
                    // 04.숫자
                    else if(selectedCondition.conditionDetailTypeCode == '04' || data.conditionDetailTypeCode == '04'){
                        renderComboBox('ProductMeasurementUnitCodeN', $('.ProductMeasurementUnitCode:visible'), data.productMeasurementUnit);
                    }else{
                        renderComboBox('ProductMeasurementUnitCode', $('.ProductMeasurementUnitCode:visible'), data.productMeasurementUnit);
                    }
                }

                if (data.isSystemMaxValue == true) {
                	// OHS 2017.02.28 수정
                	$popup.find('.maxValue').prop('disabled', true);
                    $popup.find('.isSystemMaxValue').find('input').prop('checked', true);
                } else {
                    $popup.find('.maxValue').prop('disabled', false);
                }
            }
        }
    });
}


function renderCndValueType1Grid(data, popup) {
    var renderTo,
        firstRender = true;

    if (popup) {
        renderTo = '.cnd-value-type1-popup .cnd-val-type1-grid';
    } else {
        renderTo = '.cnd-val-type1-grid';
    }

    cndValueType1Grid = PFComponent.makeExtJSGrid({
        fields: ['code', 'isDefaultValue', 'isSelected', 'name'],
        gridConfig: {
            renderTo: renderTo,
            columns: [
                {xtype: 'checkcolumn', text: bxMsg('PAS0301String4'), width: 120, dataIndex: 'isSelected', align:'center', // 기본값여부
                    listeners: {
                        checkchange: function(column, rowIndex, checked, eOpts) {
                            $(renderTo).find('.type1-grid-default-check').each(function(idx) {
                                var that = this;

                                // If ConditionAgreeLevel By Product Then DefaultCheck Disabled
                                if (selectedCondition.conditionAgreeLevel == '02') {
                                    if (checked && $(that).attr('data-idx') == rowIndex) {
                                        $(that).prop('disabled', false);
                                    } else if (!checked && $(that).attr('data-idx') == rowIndex) {
                                        $(that).prop('disabled', true).prop('checked', false);
                                    }
                                } else {
                                    $(that).prop('disabled', true).prop('checked', false);
                                }
                            });
                            popupModifyFlag = true;
                        }
                    }},
                {text: bxMsg('DPS0121_21String1'), flex: 1, dataIndex: 'code', align:'center'},
                {text: bxMsg('DPS0121_21String2'), flex: 1, dataIndex: 'name', align:'center'},
                {xtype: 'checkcolumn', text: bxMsg('defaultValue'), dataIndex: 'isDefaultValue',  sortable: false,
                    renderer: function(value, metadata, record, rowIndex) {
                        if (!record.get('isSelected') || selectedCondition.conditionAgreeLevel == '01') {
                            cndValueType1Grid.store.getAt(rowIndex).set('isDefaultValue', false);
                            return "<input type='checkbox' disabled>";
                        } else {
                            return (new Ext.ux.CheckColumn()).renderer(value);
                        }
                    },
                    listeners: {
                        beforecheckchange: function(column, rowIndex, checked, eOpts) {
                            if (!cndValueType1Grid.store.getAt(rowIndex).data['isSelected'] || selectedCondition.conditionAgreeLevel == '01') {
                                return false;
                            } else {
                                return true;
                            }
                        }
                    }, align: 'center', width: 120}
            ],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ]
        }
    });
    cndValueType1Grid.setData(data);
}

/******************************************************************************************************************
 * 조건값 관리 팝업
 ******************************************************************************************************************/
var titleDataObj = {};
var titleDataArr = [];
var popupModifyFlag = false;
function makeConditionValueManagementPopup(data, rowIndex, isNew) {//조건정보 팝업
  var tplMap = {
      '01': conditionType1PopupTpl,
      '02': conditionType2PopupTpl
  }


  var popup = PFComponent.makePopup({
    title: bxMsg('productConditionInfoMgmt'),
    modifyFlag : 'popup', // 'main':modifyFlag 사용, 'popup':popupModifyFlag 사용 , 'readOnly':사용안함
    contents: tplMap[data.conditionTypeCode](data), //요청값에 따라 팝업에 다른 화면을 그림
    width: 600,
    height: 520,
    buttons: [
      //등록
      {text:bxMsg('registration'), elCls:'button button-primary write-btn cnd-reg-btn',
        handler:function(){
          // OHS 2017.02.28 추가 - titleDataArr 파라미터 추가 (스크립트오류방지)
          classificationConditionSave(rowIndex, 'C', popup, titleDataArr);
        }
      },
      {
        text:bxMsg('modify'), //조건정보 수정
        elCls:'button button-primary write-btn cnd-mod-btn',
        handler:function(){
          // OHS 2017.02.28 추가 - titleDataArr 파라미터 추가 (스크립트오류방지)
          classificationConditionSave(rowIndex, 'U', popup, titleDataArr);
        }
      },
      {text:bxMsg('ButtonBottomString2'), elCls:'button button-primary cnd-delete-btn write-btn', //조건정보 삭제
        handler:function(){

          var requestParam = {};

          var formData = PFComponent.makeYGForm($('.condition-table-wrap')).getData();

          if(!isHaveProject()){
            haveNotTask();
            return;
          }

          var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
          if(isNotMyTask(projectId)){
            return;
          }

          if(conditionInfoGrid.store.getAt(rowIndex).get('process') !== 'C') {

            requestParam.projectId = projectId;
            requestParam.tntInstId = tntInstId;
            requestParam.pdInfoDscd = pdInfoDscd;
            requestParam.classificationStructureDistinctionCode = classForEvent.classificationStructureDistinctionCode;
            requestParam.classificationCode = classForEvent.classificationCode;
            requestParam.cndCode = formData.cndCode;
            requestParam.applyStart = conditionInfoGrid.store.getAt(rowIndex).get('applyStart');

            var _this = this;
            PFRequest.post('/classification/deleteClassificationCnd.json', requestParam, {
              success: function (responseMessage) {
                if (responseMessage) {
                	PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success'); // 삭제에 성공하였습니다.
                	popupModifyFlag = false;
                	conditionInfoGrid.store.getAt(rowIndex).destroy();
                	_this.close();
                }
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'ClassificationCndService',
                operation: 'deleteClassificationCnd'
              }
            });
          }
        }
      },//취소
      {text:bxMsg('ButtonBottomString17'), elCls:'button button-primary',
        handler:function(){
        	popupModifyFlag = false;
        	this.close();
        }
      }],
      submit: function () {
        var selectProduct = productGrid.getSelectedItem();
        submitEvent(selectProduct);
      },
      contentsEvent: {
        // OHS 2017.02.28 추가 - 동일값사용 누락로직 추가
        'click .isUseSameValue' : function(e) {
          if($(e.currentTarget).find('input').prop('checked')) {
            $('.cnd-value-type2').find('.defalueValue').val($('.cnd-value-type2').find('.minValue').val());
            if(!$('.isSystemMaxValue').find('input').prop('checked')) {
              $('.cnd-value-type2').find('.maxValue').val($('.cnd-value-type2').find('.minValue').val());
            }
          }
        },
        'keyup.xdsoft .minValue' : function(e) {
          if($('.isUseSameValue').find('input').prop('checked')){
            if(!$('.isSystemMaxValue').find('input').prop('checked')) {
              $('.cnd-value-type2').find('.maxValue').val($('.cnd-value-type2').find('.minValue').val());
              $('.cnd-value-type2').find('.maxValue').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
            }
            $('.cnd-value-type2').find('.defalueValue').val($('.cnd-value-type2').find('.minValue').val());
            $('.cnd-value-type2').find('.defalueValue').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
          }
        },
        // simple <-> comlex condition
        'change .ProductConditionClassifyCode':  function(e) {
          var value = $(e.currentTarget).val(),
          complexGridWrap = $('.complex-grid-wrap'),
          $conditionValueWrap = $('.condition-value'),
          conditionTypeCode = selectedCondition.conditionTypeCode;

          // Simple Condition
          if (value === '01') {
            complexGridWrap.removeClass('active');
            $conditionValueWrap.addClass('active');

            $('.conditionClassifyCode01-disabled').prop('disabled', true).val('');

            if (selectedCondition.conditionClassifyCode != '01') { //if original data was not simple condition

              switch (conditionTypeCode) {
              //목록형
              case '01':
                if(!cndValueType1Grid) {
                  renderCndValueType1Grid(selectedCondition.listConditionValue.defineValues);
                }
                break;

                //범위형
              case '02' :
                // OHS 2017.03.02 다시 렌더링을하여 아래 floatCheck, dragAll 함수를 다시 설정해준다.
                $conditionValueWrap.html(cndValueType2Tpl(selectedCondition));

                // OHS 2017.02.28 추가
                var checkFloatPopup = PFValidation.floatCheck('.cnd-value-type2');
                checkFloatPopup('.float-range-21', 19, 2);
                checkFloatPopup('.float-range-10', 3, 6);
                checkFloatPopup('.float-range-0', 14, 0);	// 일자(+시분초)를 감안하여 14자리로 변경

                var focusDragPopup = PFValidation.dragAll('.cnd-value-type2');
                focusDragPopup('.float-range-21');
                focusDragPopup('.float-range-10');
                focusDragPopup('.float-range-0');
                
                renderComboBox('CurrencyCode', $('.CurrencyCode'));
                $conditionValueWrap.find('input[type=text]').val('0.00');

                // 05. 율
                if (selectedCondition.conditionDetailTypeCode == '05') {
                  $conditionValueWrap.find('.isSystemMaxValue').prop('disabled', true);
                  renderComboBox('ProductMeasurementUnitCodeR', $('.ProductMeasurementUnitCode'));
                }
                // 02.날짜
                else if(selectedCondition.conditionDetailTypeCode == '02'){
                  renderComboBox('ProductMeasurementUnitCodeD', $('.ProductMeasurementUnitCode'));
                }
                // 03.주기
                else if(selectedCondition.conditionDetailTypeCode == '03'){
                  renderComboBox('ProductMeasurementUnitCodeF', $('.ProductMeasurementUnitCode'));
                }
                // 04.숫자
                else if(selectedCondition.conditionDetailTypeCode == '04'){
                  renderComboBox('ProductMeasurementUnitCodeN', $('.ProductMeasurementUnitCode'));
                } else {
                  renderComboBox('ProductMeasurementUnitCode', $('.ProductMeasurementUnitCode'));
                }

                if (selectedCondition.isSingleValue) {
                  $conditionValueWrap.find('.isSingleValue-hide').hide();
                } else {
                  $conditionValueWrap.find('.isNotSingleValue-hide').hide();
                }
                // if conditionDetailTypeCode == '01' : AmountType
                if (selectedCondition.conditionDetailTypeCode == '01') {
                  $conditionValueWrap.find('.detail-type01-hide').hide();
                } else  {
                  $conditionValueWrap.find('.detail-except-type01-hide').hide();
                }

                break;
              }
            } else { //In case original data was simple data. This is for reset for complex grid.
              titleDataArr = [];
              titleDataObj = {};
            }

            //complex condition
          } else if (value === '02') {
            complexGridWrap.addClass('active');
            $conditionValueWrap.removeClass('active');

            if (selectedCondition.conditionClassifyCode != '02' && conditionTypeCode === '04' && $('.condition-type4-table-wrap').find('.ConditionValueApplyWayCodeCode').val() != '03') {
              $el.find('.conditionClassifyCode01-conditionValueAplyWayCode03-disabled').prop('disabled', false).find('option:eq(1)').prop('selected', true);
              $el.find('.layerCalcType01-conditionValueAplyWayCode03-disabled').prop('disabled', false).val('');
            } else {
              $('.conditionClassifyCode01-disabled').prop('disabled', false).find('option:eq(0)').prop('selected', true);
            }

            $el.find('.TierAplyCalcnWayCodeCode-th').find('.red-notice').text('*');

            //It renders empty complex grid only if original data was not complex grid.

            if(!isComplexGridRend){
              isComplexGridRend = true;
              renderComplexConditionPopupGrid([], []);
            }
          }
        },
        'click .column-setting-btn': function(e) {   //구성조건설정 버튼
          renderColumnSettingPopup();
        },
        // 복합조건 추가 버튼 클릭
        'click .complex-condition-value-add-btn': function(e) {
          if (complexConditionPopupGridTitleDataArr.length === 0)  {
            PFComponent.showMessage(bxMsg('complexHeaderSetMsg'), 'warning');
            return;
          }

          var tempObj = {},
          tempArr = [];

          $.each(complexConditionPopupGridTitleDataObj, function(prop, val) {
            tempObj[prop] = {};
          });

          tempArr.push(tempObj);

          popupModifyFlag = true;
          complexConditionPopupGrid.addData(tempArr);
        },
        'click .isSystemMaxValue': function(e) {
          if($(e.currentTarget).find('input').prop('checked')) {
            // OHS 2017.02.27 수정 - DB컬럼 최대값 세팅
            $('.maxValue').prop('disabled', true).val('9999999999999999999.999999');
          } else {
         	if(data.conditionDetailTypeCode == '01') {
        		$('.cnd-value-type2').find('.maxValue').prop('disabled', false).val('0.00');
        	}
        	else if(data.conditionDetailTypeCode == '05' || data.conditionDetailTypeCode == '08') {
        		$('.cnd-value-type2').find('.maxValue').prop('disabled', false).val('0.000000');
        	}
        	else {
        		$('.cnd-value-type2').find('.maxValue').prop('disabled', false).val('0');
        	}
          }
        },
        //이력조회
        'click .pf-cl-condition-view-history-btn': function(e) {
          renderConditionHistoryPopup();
        }
      },
      listeners: {
        afterSyncUI :
          function () {

          if(isNew){
            $('.pf-cl-condition-view-history-btn').hide();
          }else{
            $('.pf-cl-condition-view-history-btn').show();
          }

          renderComboBox('ProductConditionClassifyCode', $('.ProductConditionClassifyCode'), data.conditionClassifyCode);
          renderComboBox('TierAplyCalcnWayCodeCode', $('.conditionClassifyCode01-disabled'));
          
          PFUtil.getDatePicker(true, $('.pf-cl-condition-type2-tpl'));
          PFUtil.getDatePicker(true, $('.pf-cl-condition-type1-tpl'));

          if (data.conditionClassifyCode == '01') {//단순
            $('.condition-value').addClass('active');

            // OHS 2017.02.28 - isComplexGridRend 값이 초기화되지않는 케이스를 방지하기위해 초기화처리
            isComplexGridRend = false;
            //01: 목록형, 02: 범위형
            switch (data.conditionTypeCode) {
            case '01' :
              renderCndValueType1Grid(data.listConditionValue.defineValues);
              //심플에서 복합 조건으로 변경할 경우, 복합 그리드의 조건값 필드를 더블클릭 할 때 필요한 정보를 저장해 둠
              YforNewColumn = data.listConditionValue;
              break;
            case '02' :
              if (!data.rangeConditionValue) data.rangeConditionValue = {};
              // OHS 20180503 추가 - 소숫점 일치를 위해서 default value 세팅
              data.rangeConditionValue.minValue = data.rangeConditionValue.minValue ? data.rangeConditionValue.minValue : '0.00'; 
              data.rangeConditionValue.maxValue = data.rangeConditionValue.maxValue ? data.rangeConditionValue.maxValue : '0.00'; 
              data.rangeConditionValue.increaseValue = data.rangeConditionValue.increaseValue ? data.rangeConditionValue.increaseValue : '0.00'; 
              data.rangeConditionValue.defalueValue = data.rangeConditionValue.defalueValue ? data.rangeConditionValue.defalueValue : '0.00';
              
              // OHS 20180503 추가 - 소숫점일치를 위해 추가
              // 금액, 숫자
              if(data.conditionDetailTypeCode == '01') {
            	  data.rangeConditionValue.minValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.minValue, 19, 2);
            	  data.rangeConditionValue.maxValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.maxValue, 19, 2);
            	  data.rangeConditionValue.increaseValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.increaseValue, 19, 2);
            	  data.rangeConditionValue.defalueValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.defalueValue, 19, 2);
              }
              // 율
              else if(data.conditionDetailTypeCode == '05' || data.conditionDetailTypeCode == '08') {
            	  data.rangeConditionValue.minValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.minValue, 3, 6);
            	  data.rangeConditionValue.maxValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.maxValue, 3, 6);
            	  data.rangeConditionValue.increaseValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.increaseValue, 3, 6);
            	  data.rangeConditionValue.defalueValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.defalueValue, 3, 6);
              }
              else {
            	  data.rangeConditionValue.minValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.minValue, 8, 0);
            	  data.rangeConditionValue.maxValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.maxValue, 8, 0);
            	  data.rangeConditionValue.increaseValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.increaseValue, 8, 0);
            	  data.rangeConditionValue.defalueValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.defalueValue, 8, 0);
              }

              $('.condition-value').html(cndValueType2Tpl(data.rangeConditionValue));
              $('.condition-value').addClass('active');

              //단일 값이면 기본값만 보여줘야 함
              if (data.rangeConditionValue.isSingleValue) {
                $('.isSingleValue-hide').hide();
              } else {
                $('.isNotSingleValue-hide').hide();
              }

              if (data.rangeConditionValue.isSystemMaxValue == true) {
                // OHS 2017.02.27 수정 - isSystemMaxValue == true일경우 '9999999999999999999.999999' 값 세팅(DB조회값)
                $('.maxValue').prop('disabled', true);
                $('.isSystemMaxValue').find('input').prop('checked', true);
              } else {
                $('.maxValue').prop('disabled', false);
              }

              //conditionDetailTypeCode이 01이면 통화코드, 그외는 측정단위(05만 측정단위의 콤보가 달라짐)
              if (data.conditionDetailTypeCode == '01') {
                $('.detail-type01-hide').hide();
                renderComboBox('CurrencyCode', $('.CurrencyCode:visible'), data.rangeConditionValue.currencyValue);
              } else {
                $('.detail-except-type01-hide').hide();

                //05일 때 최대치 선택 못하게 하며 측정단위도 달라여x함
                if (data.conditionDetailTypeCode == '05') {
                  // isSystemMaxValue Control
                  $('.isSystemMaxValue').prop('checked', false).prop('disabled', true);
                  renderComboBox('ProductMeasurementUnitCodeR', $('.ProductMeasurementUnitCode:visible'), data.rangeConditionValue.productMeasurementUnit);
                }
                // 02.날짜
                else if(selectedCondition.conditionDetailTypeCode == '02'){
                  renderComboBox('ProductMeasurementUnitCodeD', $('.ProductMeasurementUnitCode:visible'), data.rangeConditionValue.productMeasurementUnit);
                }
                // 03.주기
                else if(selectedCondition.conditionDetailTypeCode == '03'){
                  renderComboBox('ProductMeasurementUnitCodeF', $('.ProductMeasurementUnitCode:visible'), data.rangeConditionValue.productMeasurementUnit);
                }
                // 04.숫자
                else if(selectedCondition.conditionDetailTypeCode == '04'){
                  renderComboBox('ProductMeasurementUnitCodeN', $('.ProductMeasurementUnitCode:visible'), data.rangeConditionValue.productMeasurementUnit);
                }else {
                  renderComboBox('ProductMeasurementUnitCode', $('.ProductMeasurementUnitCode:visible'), data.rangeConditionValue.productMeasurementUnit);
                }
              }
              // OHS 20180503 - 기존로직 삭제, 아래로직 추가
              // 금액
              if(data.conditionDetailTypeCode == '01') {
                  $('.minValue').removeClass('float-range-10');
                  $('.maxValue').removeClass('float-range-10');
                  $('.defalueValue').removeClass('float-range-10');
                  $('.type2-increase-check').removeClass('float-range-10');

                  $('.minValue').removeClass('float-range-0');
                  $('.maxValue').removeClass('float-range-0');
                  $('.defalueValue').removeClass('float-range-0');
                  $('.type2-increase-check').removeClass('float-range-0');

                  $('.minValue').addClass('float-range-21');
                  $('.maxValue').addClass('float-range-21');
                  $('.defalueValue').addClass('float-range-21');
                  $('.type2-increase-check').addClass('float-range-21');
              }
              // 율
              else if(data.conditionDetailTypeCode == '05' || data.conditionDetailTypeCode == '08'){
                  $('.minValue').removeClass('float-range-21');
                  $('.maxValue').removeClass('float-range-21');
                  $('.defalueValue').removeClass('float-range-21');
                  $('.type2-increase-check').removeClass('float-range-21');

                  $('.minValue').removeClass('float-range-0');
                  $('.maxValue').removeClass('float-range-0');
                  $('.defalueValue').removeClass('float-range-0');
                  $('.type2-increase-check').removeClass('float-range-0');

                  $('.minValue').addClass('float-range-10');
                  $('.maxValue').addClass('float-range-10');
                  $('.defalueValue').addClass('float-range-10');
                  $('.type2-increase-check').addClass('float-range-10');

              }else{
                  $('.minValue').removeClass('float-range-21');
                  $('.maxValue').removeClass('float-range-21');
                  $('.defalueValue').removeClass('float-range-21');
                  $('.type2-increase-check').removeClass('float-range-21');

                  $('.minValue').removeClass('float-range-10');
                  $('.maxValue').removeClass('float-range-10');
                  $('.defalueValue').removeClass('float-range-10');
                  $('.type2-increase-check').removeClass('float-range-10');

                  $('.minValue').addClass('float-range-0');
                  $('.maxValue').addClass('float-range-0');
                  $('.defalueValue').addClass('float-range-0');
                  $('.type2-increase-check').addClass('float-range-0');
              }
              break;
            }

            // OHS 2017.02.28 추가
            var checkFloatPopup = PFValidation.floatCheck('.cnd-value-type2');
            checkFloatPopup('.float-range-21', 19, 2);
            checkFloatPopup('.float-range-10', 3, 6);
            checkFloatPopup('.float-range-0', 14, 0);	// 일자(+시분초)를 감안하여 14자리로 변경

            var focusDragPopup = PFValidation.dragAll('.cnd-value-type2');
            focusDragPopup('.float-range-21');
            focusDragPopup('.float-range-10');
            focusDragPopup('.float-range-0');

            $('.conditionClassifyCode01-disabled').prop('disabled', true).val('');

          } else if (data.conditionClassifyCode == '02') {//복합
            $('.complex-grid-wrap').addClass('active');
            titleDataArr = data.complexConditionTitleInfoList;
            isComplexGridRend = true;
            renderComplexConditionPopupGrid(data.complexConditionTitleInfoList, data.complexConditionMatrix);
          }

          if(data.isEnableComplexCondition){
            $('.cl-condition-value-wrap').addClass('active');
          }else {
            $('.cl-condition-value-wrap').removeClass('active');
          }

          if(isNew){
            if(isEmergency(getSelectedProjectId())){
              $('.cnd-reg-btn').prop('disabled', true);
            }else{
              $('.cnd-reg-btn').prop('disabled', false);
            }
            $('.cnd-mod-btn').prop('disabled', true);
          }



          if(writeYn != 'Y'){
            $('.write-btn').hide();
          }else{
            //수정가능
            if($('.condition-table-wrap .status').val() == '01') {

              if(isNew){
                if(isEmergency(getSelectedProjectId())){
                  $('.cnd-reg-btn').prop('disabled', true);
                }else{
                  $('.cnd-reg-btn').prop('disabled', false);
                }
                $('.cnd-delete-btn').prop('disabled', true);
                $('.cnd-mod-btn').prop('disabled', true);
              }else {
                $('.cnd-reg-btn').prop('disabled', true);
              }
            }
            //판매중
            else{
              //emergency
              if(getSelectedProjectId() && isEmergency(getSelectedProjectId())){
                if($('.condition-table-wrap .status').val() == '04'){
                  $('.cnd-reg-btn').prop('disabled', false);
                }else {
                  $('.cnd-reg-btn').prop('disabled', true);
                }

                $('.cnd-mod-btn').prop('disabled', false);
                $('.cnd-delete-btn').prop('disabled', false);
              }else{

                $('.cnd-reg-btn').prop('disabled', false);
                $('.cnd-delete-btn').prop('disabled', true);
                if(isUpdateStatus(getSelectedProjectId())){
                  $('.cnd-mod-btn').prop('disabled', false);
                }else{
                  $('.cnd-mod-btn').prop('disabled', true);
                }
              }
            }
          }
        }
      }
  });
}

function classificationConditionSave(rowIndex, process, popup, titleDataArr){
  if(!isHaveProject()){
    haveNotTask();
    return;
  }

  var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
  if(isNotMyTask(projectId)){
    return;
  }

  var formData = PFComponent.makeYGForm($('.pf-cp-product-condition-panel .condition-table-wrap')).getData(),
  conditionTypeCode = formData.conditionTypeCode,
  complexGridData,
  dontSave = false;


  if ($el.find('.isValueNull').prop('checked')) {
    formData.isValueNull = true;
  } else {
    formData.isValueNull = false;

    // 복합조건이나 계층미정의시 에러
    if (formData.conditionClassifyCode == '02' && complexConditionPopupGrid.getAllData().length == 0) {
      PFComponent.showMessage(bxMsg('DPS0129Error5'), 'warning');
      return;
    }

    switch (conditionTypeCode) {
    // 목록형
    case '01':
      if (formData.conditionClassifyCode == '01') { //단순
        formData.listConditionValue = {};

        var gridData = cndValueType1Grid.getAllData(),
        selectedCheck = false;

        gridData.forEach(function (el) {

          if (el.isSelected) {
            selectedCheck = true;
            return;
          }
        });

        if (!selectedCheck) {
          PFComponent.showMessage(bxMsg('DPJ0122Error1'), 'warning');
          return;
        }

        formData.listConditionValue.defineValues = gridData;
      } else if (formData.conditionClassifyCode == '02') { //복합
        formData.complexConditionTitleInfoList = titleDataArr;

        //layerCalcType should be 02 when conditionClassifyCode is 02
        formData.layerCalcType = '02';

        titleDataArr.forEach(function (el) {
          el.titleConditionGroupTemplateCode = formData.conditionGroupTemplateCode;
          if(el.titleConditionTypeCode == '02'){
            el.defineValues = [];
          }
        });

        complexGridData = complexConditionPopupGrid.getAllData();

        formData.complexConditionMatrix = [];

        complexGridData.forEach(function (el) {
          var complexConditionMatrixDataObj = {};
          complexConditionMatrixDataObj.listConditionValue = el.y;

          complexConditionMatrixDataObj.x = [];

          $.each(el, function (prop, value) {
            var propNm = prop.split('.');

            if (prop == 'y') {
              complexConditionMatrixDataObj.listConditionValue = value;

              //check that condition value(last column) has one more value or not
              if (value.defineValues) {
                var dontSaveList = true;

                value.defineValues.forEach(function (el) {
                  if (el.isSelected) {
                    dontSaveList = false;
                  }
                });

                if (dontSaveList) {
                  dontSave = true;
                  return;
                }
              }

            } else if (propNm.length != 2) {
              value.id = prop;

              //check that each condition has value or not
              if (!value.rangeConditionValue && !value.listConditionValue) {
                dontSave = true;
                return;
              }
              complexConditionMatrixDataObj.x.push(value);
            }
          });

          //check that condition value(last column) has one more value or not
          if (!el.y) {
            dontSave = true;
            return;
          }

          formData.complexConditionMatrix.push(complexConditionMatrixDataObj);
        });
      }

      break;

      // 범위형
    case '02' :
      if (formData.conditionClassifyCode == '01') { //단순조건
        formData.rangeConditionValue = PFComponent.makeYGForm($('.cnd-value-type2 .bx-info-table')).getData();

        if (!selectedCondition.isSingleValue) {
          // OHS 2017.03.02 수정 - 그룹정보의 범위조건값은 상품조건의 상품레벨로 동일하게 체크한다.
          var checkMsg = PFValidation.minMaxCheckForPfLvl($('.pf-cl-condition-type2-tpl'), '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check');
          if (checkMsg) {
            PFComponent.showMessage(checkMsg, 'warning');
            return;
          }
        }

        if (selectedCondition.isSingleValue) {
          formData.rangeConditionValue.isSingleValue = true;
          formData.rangeConditionValue.maxValue = formData.rangeConditionValue.defalueValue;
          formData.rangeConditionValue.increaseValue = '0.00';
          formData.rangeConditionValue.minValue = formData.rangeConditionValue.defalueValue;
        } else {
          formData.rangeConditionValue.isSingleValue = false;
        }

        if ($('.isSystemMaxValue').find('input').prop('checked')) {
          formData.rangeConditionValue.isSystemMaxValue = true;
        } else {
          formData.rangeConditionValue.isSystemMaxValue = false;
        }

      } else if (formData.conditionClassifyCode == '02') { //복합조건
        formData.complexConditionTitleInfoList = titleDataArr;
        titleDataArr.forEach(function (el) {
          el.titleConditionGroupTemplateCode = formData.conditionGroupTemplateCode;
          if(el.titleConditionTypeCode == '02'){
            el.defineValues = [];
          }
        });

        complexGridData = complexConditionPopupGrid.getAllData();

        formData.complexConditionMatrix = [];

        complexGridData.forEach(function (el) {
          var complexConditionMatrixDataObj = {};
          complexConditionMatrixDataObj.rangeConditionValue = el.y;

          complexConditionMatrixDataObj.x = [];

          $.each(el, function (prop, value) {
            var propNm = prop.split('.');

            if (prop == 'y') {
              // if isSingleValue is True Then, increaseValue
              if (selectedCondition.isSingleValue) {
                value.maxValue = value.defalueValue;
                value.increaseValue = '0.00';
                value.minValue = value.defalueValue;
              }
              complexConditionMatrixDataObj.rangeConditionValue = value;
            } else if (propNm.length != 2) {
              value.id = prop;

              // RangeConditionValue And ListConditionValue All Not Exists
              if (!value.rangeConditionValue && !value.listConditionValue) {
                dontSave = true;
                return;
              }
              complexConditionMatrixDataObj.x.push(value);
            }
          });

          if (!el.y) {
            dontSave = true;
            return;
          }

          formData.complexConditionMatrix.push(complexConditionMatrixDataObj);
        });
      }

      break;
    }
    if (dontSave) {
      PFComponent.showMessage(bxMsg('DPS0128Error4'), 'warning');
      return;
    }
  }

  if(!popupModifyFlag){
	// 변경된 정보가 없습니다.
	PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
	return;
  }

  formData.projectId = projectId;
  formData.pdInfoDscd = pdInfoDscd;
  formData.tntInstId = tntInstId;

//조건구조=복합조건 and 복합적용방법=다계층사용
  if(formData.conditionClassifyCode == '02' &&  formData.layerCalcType == '02') {
    formData.stepCndCd = stepCndCd;
  }

  formData.classificationStructureDistinctionCode = classForEvent.classificationStructureDistinctionCode;
  formData.classificationCode = classForEvent.classificationCode;


  if(formData.conditionClassifyCode === '02'){
    formData.isComplexCnd = true;
  }else{
    formData.isComplexCnd = false;
  }

  formData.isMandatory = false;
  formData.process = process;
  formData.cndStatusCode = formData.status;
  delete formData.status;
  saveConditionValue(formData, popup.popup);

  // OHS20180327 추가 - 저장후 그리드에 더 필요한 값들을 세팅한다. (범위-금액일때 그리드 더블클릭하였을때 화폐가 아닌 측정단위로 잘못보이는버그수정)
  //fromData.conditionDetailTypeCode = selectedCondition.conditionDetailTypeCode; - 추후테스트결과 정상작동하여 임시 주석처리

  // OHS20180323 추가 - saveConditionValue 가 오류등으로 실패하였을때는 아래로직을 처리하지 않는다.
  formData.process = null;
  if(!isNewData){
    conditionInfoGrid.store.getAt(rowIndex).set(formData);
  }else {
    conditionInfoGrid.addData(formData);
  }
  //popup.popup.close();
}

function saveConditionValue(requestParam, _popup){

    PFRequest.post('/classification/saveClassificationCnd.json',requestParam,{
        success : function(){
            PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
            var requestData = {};

            requestData.tntInstId = tntInstId;
            requestData.pdInfoDscd = pdInfoDscd;
            requestData.classificationStructureDistinctionCode = classForEvent.classificationStructureDistinctionCode;
            requestData.classificationCode = classForEvent.classificationCode;
            requestData.isComplexCnd = false;
            popupModifyFlag = false;

            PFRequest.get('/classification/getListClassificationCnd.json', requestData, {
                success: function(result){
                    // 삼품그룹 조건정보 그리드
                    result.forEach(function(el){
                        el.status = el.cndStatusCode;

                        if(!el.isComplexCnd){ //단순

                            el.conditionClassifyCode = '01';

                            if(el.conditionTypeCode === '01'){//목록
                                var conditionList = [];

                                el.listConditionValue.defineValues.forEach(function(condition){
                                    var obj = {}
                                    obj.listCode = condition.code;
                                    conditionList.push(obj);
                                });
                                el.conditionList = conditionList
                            }else if(el.conditionTypeCode === '02'){//범위
                                el.conditionDetailTypeCode = el.rangeConditionValue.conditionDetailTypeCode;
                            }
                        }else if(el.isComplexCnd){//복합

                            el.conditionClassifyCode = '02';

                            if(el.conditionTypeCode === '02') {//범위
                                el.conditionDetailTypeCode = el.complexConditionMatrix[0].y.conditionDetailTypeCode;
                            }
                        }
                    });

                    conditionInfoGrid.setData(result);
                },
                bxmHeader : {
                    application: 'PF_Factory',
                    service: 'ClassificationCndService',
                    operation: 'queryListClassificationCnd'
                }
            });
            if(_popup) _popup.close();
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ClassificationCndService',
            operation: 'saveClassificationCnd'
        }
    });
}
