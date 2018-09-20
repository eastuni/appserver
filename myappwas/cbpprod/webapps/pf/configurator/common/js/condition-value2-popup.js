function renderConditionValue2Popup(data, rowIndex, historyButton){
    var button;

    if (historyButton){
        button = historyButton;
    } else {
        if (!data) {
            data = {};
        }
        data.defalueValue = (data.defalueValue) ? data.defalueValue : '0.00';
        data.increaseValue = (data.increaseValue) ? data.increaseValue : '0.00';
        data.maxValue = (data.maxValue) ? data.maxValue : '0.00';
        data.minValue = (data.minValue) ? data.minValue : '0.00';

        button = [
            {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn', handler:function(){
                var $popupTable = $('.cnd-value-type2-popup .bx-info-table'),
                    formData = PFComponent.makeYGForm($popupTable).getData();

                if (!selectedCondition.isSingleValue) {

                   	// OHS 2017.02.13 수정
                	// 계약레벨
                	if(selectedCondition.conditionAgreeLevel == '02') {
                		// OHS 2017.02.16 시스템최대치에 체크하여도 값이 세팅되기때문에 동일하게 처리
                		if (!PFValidation.minMaxCheck($('.cnd-value-type2-popup'), '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check')) {
                			PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
            				return;
            			}
                	}
                	// 상품레벨
                	else {
                   		// OHS 2017.02.16 시스템최대치에 체크하여도 값이 세팅되기때문에 동일하게 처리
                		var checkMsg = PFValidation.minMaxCheckForPfLvl($('.cnd-value-type2-popup'), '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check');
            			if (checkMsg) {
            				PFComponent.showMessage(checkMsg, 'warning');
            				return;
            			}
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

                cndValComplexGrid.store.getAt(rowIndex).set('y', formData);
                modifyFlag = true;
                this.close();
            }},
            {text:bxMsg('ButtonBottomString16'), elCls:'button button-primary', handler:function(){
                this.close();
            }}
        ]
    }

    PFComponent.makePopup({
        title: bxMsg('DPP0150Title2'),
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
                    $('.cnd-value-type2-popup').find('.maxValue').prop('disabled', false).val('0.00');
                }
            },
            'click .isUseSameValue' : function(e) {
            	if($(e.currentTarget).find('input').prop('checked')) {
            		$('.cnd-value-type2-popup').find('.defalueValue').val($('.cnd-value-type2-popup').find('.minValue').val());

            		if(!$('.isSystemMaxValue').find('input').prop('checked')) {
            			$('.cnd-value-type2-popup').find('.maxValue').val($('.cnd-value-type2-popup').find('.minValue').val());
                    }
            	}
            },
            'keyup.xdsoft .minValue' : function(e) {
            	if($('.cnd-value-type2-popup').find('.isUseSameValue').find('input').prop('checked')) {
            		$('.cnd-value-type2-popup').find('.defalueValue').val($('.cnd-value-type2-popup').find('.minValue').val());
            		$('.cnd-value-type2-popup').find('.defalueValue').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
            		if(!$('.isSystemMaxValue').find('input').prop('checked')) {
            			$('.cnd-value-type2-popup').find('.maxValue').val($('.cnd-value-type2-popup').find('.minValue').val());
            			$('.cnd-value-type2-popup').find('.maxValue').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
                    }
            	}
            }
        },
        listeners: {
            afterRenderUI: function() {
                var checkFloatPopup = PFValidation.floatCheck('.cnd-value-type2-popup');
                checkFloatPopup('.float-range-21', 19, 2);
                checkFloatPopup('.float-range-10', 7, 3);
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

                if (selectedCondition.isSingleValue) {
                    $popup.find('.isSingleValue-hide').hide();
                } else {
                    $popup.find('.isNotSingleValue-hide').hide();
                }

                if (selectedCondition.conditionDetailTypeCode == '01') {
                    $popup.find('.detail-type01-hide').hide();
                    renderComboBox('CurrencyCode', $('.CurrencyCode:visible'), data.currencyValue);
                } else {
                    $popup.find('.detail-except-type01-hide').hide();

                    //05일 때 최대치 선택 못하게 하며 측정단위도 달라여져야함
                    if (selectedCondition.conditionDetailTypeCode == '05') {
                        // isSystemMaxValue Control
                        $popup.find('.isSystemMaxValue').prop('disabled', true);
                        $popup.find('.isSystemMaxValue').find('input').prop('checked', false).prop('disabled', true);
                        renderComboBox('ProductMeasurementUnitCodeR', $('.ProductMeasurementUnitCode:visible'), data.productMeasurementUnit);
                    }
                    // 02.날짜
                    else if(selectedCondition.conditionDetailTypeCode == '02'){
                        renderComboBox('ProductMeasurementUnitCodeD', $('.ProductMeasurementUnitCode:visible'), data.productMeasurementUnit);
                    }
                    // 03.주기
                    else if(selectedCondition.conditionDetailTypeCode == '03'){
                        renderComboBox('ProductMeasurementUnitCodeF', $('.ProductMeasurementUnitCode:visible'), data.productMeasurementUnit);
                    }
                    // 04.숫자
                    else if(selectedCondition.conditionDetailTypeCode == '04'){
                        renderComboBox('ProductMeasurementUnitCodeN', $('.ProductMeasurementUnitCode:visible'), data.productMeasurementUnit);
                    }else {
                        renderComboBox('ProductMeasurementUnitCode', $('.ProductMeasurementUnitCode:visible'), data.productMeasurementUnit);
                    }
                }

                //  입력포멧 설정
                setRangeFormat($popup.find('.cnd-value-type2-table'), selectedCondition.conditionDetailTypeCode);

                if (data.isSystemMaxValue == true) {
                   	// OHS 2017.02.16 수정 - 시스템최대치일경우 값을 세팅해줌
                    //$popup.find('.maxValue').prop('disabled', true).val('');
                	$popup.find('.maxValue').prop('disabled', true);
                    $popup.find('.isSystemMaxValue').find('input').prop('checked', true);
                } else {
                    $popup.find('.maxValue').prop('disabled', false);
                }
            }
        }
    });
}
