const cndValueType4TblByComplex = getTemplate('condition/cndValueType4TblByComplex');

function renderConditionValue4Popup(data, rowIndex, historyButton) {
  var button;

  if (historyButton){
    button = historyButton;
  } else {
    if (!data) {
      data = {};
    }
    // 금액정보
    data.minFixFeeAmt = (data.minFixFeeAmt) ? data.minFixFeeAmt : '0.00'; // 최소수수료
    data.maxFixFeeAmt = (data.maxFixFeeAmt) ? data.maxFixFeeAmt : '0.00'; // 최대수수료
    data.fixed = (data.fixed) ? data.fixed : '0.00'; // 기본수수료
    data.fixFeeIncrsAmt = (data.fixFeeIncrsAmt) ? data.fixFeeIncrsAmt : '0.00'; // 증가단위금액

    // OHS 20180503 추가 - 자릿수 통일
    data.minFixFeeAmt = PFValidation.gridFloatCheckRenderer(data.minFixFeeAmt, 19, 2);
    data.maxFixFeeAmt = PFValidation.gridFloatCheckRenderer(data.maxFixFeeAmt, 19, 2);
    data.fixed = PFValidation.gridFloatCheckRenderer(data.fixed, 19, 2);
    data.fixFeeIncrsAmt = PFValidation.gridFloatCheckRenderer(data.fixFeeIncrsAmt, 19, 2);
    
    // 율정보
    data.minRt = (data.minRt) ? data.minRt : '0.000000'; // 최소
    data.maxRt = (data.maxRt) ? data.maxRt : '0.000000'; // 최대
    data.rate = (data.rate) ? data.rate : '0.000000'; // 기본
    data.unitIncrsRt = (data.unitIncrsRt) ? data.unitIncrsRt : '0.000000'; // 단위증가
    
    // OHS 20180503 추가 - 자릿수 통일
    data.minRt = PFValidation.gridFloatCheckRenderer(data.minRt, 3, 6);
    data.maxRt = PFValidation.gridFloatCheckRenderer(data.maxRt, 3, 6);
    data.rate = PFValidation.gridFloatCheckRenderer(data.rate, 3, 6);
    data.unitIncrsRt = PFValidation.gridFloatCheckRenderer(data.unitIncrsRt, 3, 6);

    // 징수수수료금액
    data.bottom = (data.bottom) ? data.bottom : '0.00'; // 최소금액
    data.top = (data.top) ? data.top : '0.00'; // 최대금액
    
    data.bottom = PFValidation.gridFloatCheckRenderer(data.bottom, 19, 2);
    data.top = PFValidation.gridFloatCheckRenderer(data.top, 19, 2);

    button = [
      {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn', handler:function(){
        // OHS 2017.03.22 수정 - 금액&율 모든 데이터가 저장되고있음.
        //var $popupTable = $('.cnd-value-type4-popup .bx-info-table'),
        var $popupTable = $('.cnd-value-type4-popup .bx-info-table.active'),
        formData = PFComponent.makeYGForm($popupTable).getData();

        // 수수료 유형코드
        var radioType = $('.cnd-value-type4').find('input[name=cnd-value-04-radio2]:checked');

        // 계약레벨
        if(selectedCondition.conditionAgreeLevel == '02') {
          // 금액
          if (radioType.hasClass('charge-radio-amount')) {
            if (!PFValidation.minMaxCheck($popupTable, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check')) {
              PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
              return;
            }

            formData.feeTpCd = '02';
            formData.calcBasic = $popupTable.find('.calcBasicAmt').val();
          }
          // 율
          else if (radioType.hasClass('charge-radio-rate')) {
            if (!PFValidation.minMaxCheck($popupTable, '.type3-min-check', '.type3-max-check', '.type3-default-check', '.type3-increase-check')) {
              PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
              return;
            }

            formData.feeTpCd = '01';
            formData.rtMsurUnitCd = $popupTable.find('.RtMsurUnitCd').val();
            formData.calcBasic = $popupTable.find('.calcBasicRate').val();
          }
        }
        // 상품레벨
        else {
          // 금액
          if (radioType.hasClass('charge-radio-amount')) {
            var checkMsg = PFValidation.minMaxCheckForPfLvl($popupTable, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check');
            if (checkMsg) {
              PFComponent.showMessage(checkMsg, 'warning');
              return;
            }

            formData.feeTpCd = '02';
            formData.calcBasic = $popupTable.find('.calcBasicAmt').val();
          }
          // 율
          else if (radioType.hasClass('charge-radio-rate')) {
            var checkMsg = PFValidation.minMaxCheckForPfLvl($popupTable, '.type3-min-check', '.type3-max-check', '.type3-default-check', '.type3-increase-check');
            if (checkMsg) {
              PFComponent.showMessage(checkMsg, 'warning');
              return;
            }

            formData.feeTpCd = '01';
            formData.rtMsurUnitCd = $popupTable.find('.RtMsurUnitCd').val();
            formData.calcBasic = $popupTable.find('.calcBasicRate').val();
          }
        }

        if ($popupTable.find('.isSystemMaxValue').prop('checked')) {
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
    title: bxMsg('DPP0150Title4'),
    width: 445,
    height: 350,
    elCls: 'cnd-value-type4-popup',
    contents: cndValueType4TblByComplex(data),
    buttons: button,
    contentsEvent: {
      'click .isSystemMaxValue': function(e) {
        if($(e.currentTarget).prop('checked')) {
          $('.cnd-value-type4-popup').find('.topValue').prop('disabled', true).val('');
        } else {
          $('.cnd-value-type4-popup').find('.topValue').prop('disabled', false).val('0.00');
        }
      },
      'click input:radio[name="cnd-value-04-radio2"]': function(e) {
        var $type4Wrap = $('.cnd-value-type4');

        if (e.currentTarget.classList.contains('charge-radio-amount')) {
          $type4Wrap.find('.cnd-value-04-amount-table').addClass('active');
          $type4Wrap.find('.cnd-value-04-rate-table').removeClass('active');
        } else {
          $type4Wrap.find('.cnd-value-04-amount-table').removeClass('active');
          $type4Wrap.find('.cnd-value-04-rate-table').addClass('active');
        }
      },
      'click .isUseSameValueComplexAmount' : function(e) {
        if($(e.currentTarget).find('input').prop('checked')) {
          $('.cnd-value-type4-popup').find('.type2-max-check').val($('.cnd-value-type4-popup').find('.type2-min-check').val());
          $('.cnd-value-type4-popup').find('.type2-default-check').val($('.cnd-value-type4-popup').find('.type2-min-check').val());
        }
      },
      'click .isUseSameValueComplexRate' : function(e) {
        if($(e.currentTarget).find('input').prop('checked')) {
          $('.cnd-value-type4-popup').find('.type3-max-check').val($('.cnd-value-type4-popup').find('.type3-min-check').val());
          $('.cnd-value-type4-popup').find('.type3-default-check').val($('.cnd-value-type4-popup').find('.type3-min-check').val());
        }
      },
      'keyup.xdsoft .type2-min-check' : function(e) {
        if($('.isUseSameValueComplexAmount').find('input').prop('checked')){
          $('.cnd-value-type4-popup').find('.type2-max-check').val($('.cnd-value-type4-popup').find('.type2-min-check').val());
          $('.cnd-value-type4-popup').find('.type2-max-check').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
          $('.cnd-value-type4-popup').find('.type2-default-check').val($('.cnd-value-type4-popup').find('.type2-min-check').val());
          $('.cnd-value-type4-popup').find('.type2-default-check').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
        }
      },
      'keyup.xdsoft .type3-min-check' : function(e) {
        if($('.isUseSameValueComplexRate').find('input').prop('checked')){
          $('.cnd-value-type4-popup').find('.type3-max-check').val($('.cnd-value-type4-popup').find('.type3-min-check').val());
          $('.cnd-value-type4-popup').find('.type3-max-check').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
          $('.cnd-value-type4-popup').find('.type3-default-check').val($('.cnd-value-type4-popup').find('.type3-min-check').val());
          $('.cnd-value-type4-popup').find('.type3-default-check').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
        }
      }
    },
    listeners: {
      afterRenderUI: function() {
        var checkFloatPopup = PFValidation.floatCheck('.cnd-value-type4-popup');
        checkFloatPopup('.float21', 19, 2);
        checkFloatPopup('.float10', 3, 6);
        checkFloatPopup('.float0', 3, 0);

        var focusDragPopup = PFValidation.dragAll('.cnd-value-type4-popup');
        focusDragPopup('.float21');
        focusDragPopup('.float19');
        focusDragPopup('.float10');
        focusDragPopup('.float0');

        var $popup =  $('.cnd-value-type4-popup');

        // OHS 2017.03.22 이력조회가 아니면 동일값 적용 체크박스 보이게 수정
        if(!historyButton) {
          $popup.find('.isUseSameValueComplexRate').css('display', 'inline-block');
          $popup.find('.isUseSameValueComplexAmount').css('display', 'inline-block');
        }

        if (data.isSystemMaxValue == true) {
          $popup.find('.topValue').prop('disabled', true).val('');
          $popup.find('.isSystemMaxValue').prop('checked', true);
        } else {
          $popup.find('.topValue').prop('disabled', false);
        }

        renderComboBox('ProductMeasurementUnitCodeR', $popup.find('.RtMsurUnitCd'));
        renderComboBox('FeeCalculateBasicTypeCode', $popup.find('.FeeCalculateBasicTypeCode'), data.calcBasic ? data.calcBasic : '');       // 징수기준

        // 율정보 체크
        if (data.feeTpCd == '01') {
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

        if (historyButton) {
          $popup.find('input').prop('disabled', true);
          $popup.find('select').prop('disabled', true);
        }
      }
    }
  });
}
