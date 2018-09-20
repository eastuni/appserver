if(pageType === pageType_ProductGroupPage || pageType === pageType_ServiceGroupPage) {
   var productConditionHistoryPopupTpl = getTemplate('productConditionHistoryPopupTpl');
}

function renderConditionHistoryPopup() {
  PFComponent.makePopup({
    title: bxMsg('DPP0127Title'),
    contents: productConditionHistoryPopupTpl(selectedCondition),
    width: 800,
    height: 570,
    buttons:[
      {text:bxMsg('ContextMenu_Close'), elCls:'button button-primary', handler:function(){
        this.close();
      }}
      ],
      listeners: {
        afterRenderUI: function() {
          var isComplexCnd;

          if(selectedCondition.conditionClassifyCode === '01'){
            isComplexCnd = false;
          }else {
            isComplexCnd = true;
          }
          var requestParam = {
              classificationStructureDistinctionCode: $('.classificationStructureDscd').html(),
              classificationCode: selectedCondition.productClassificationCode,
              cndCode: selectedCondition.cndCode,
              isComplexCnd:isComplexCnd,
              tntInstId: loginTntInstId,
              //pdInfoDscd:'01'
              pdInfoDscd:pdInfoDscd
          };
          renderProductConditionHistoryGrid(requestParam);
        }
      }
  });
}

function renderProductConditionHistoryGrid(requestParam){

    PFRequest.get('/classification/getListClassificationCndHistory.json',requestParam, {
        success: function(responseData){

            var grid = PFComponent.makeExtJSGrid({
                fields: [
                    'cndCode', 'cndName', 'conditionTypeCode', 'applyStart','applyEnd', 'conditionValue', 'conditionDetailTypeCode', 'conditionClassifyCode'
                    ,'status','complexConditionTitleInfoList', 'complexConditionMatrix', 'rangeConditionValue', 'listConditionValue',
                    {name:'rangeConditionValue',
                        convert: function(newValue, record) {
                            if (newValue) {
                                return newValue;
                            } else {
                                if (!record || !newValue) {
                                    var rangeConditionValue = {};
                                    rangeConditionValue.minValue = '0.00';
                                    rangeConditionValue.maxValue = '0.00';
                                    rangeConditionValue.increaseValue = '0.00';
                                    rangeConditionValue.defalueValue = '0.00';
                                }
                                return rangeConditionValue;
                            }
                        }
                    },
                    'process', 'lastModifier'
                ],
                gridConfig: {
                    renderTo: '.pf-cp-condition-history-grid',
                    columns: [
                        {text: bxMsg('PAS0202String19'), flex: 1, dataIndex: 'applyStart'},
                        {text: bxMsg('PAS0202String20'), flex: 1, dataIndex: 'applyEnd'},
                        {text: bxMsg('DPP0127String9'), flex: 1, dataIndex: 'lastModifier'}
                    ],
                    listeners: {
                        scope: this,
                        itemdblclick : function(tree, record){

                            var data = record.data;

                            if (data.isValueNull) {
                                $('.pf-cp-condition-history-popup .history-complex-grid').hide();
                                $('.pf-cp-condition-history-popup .history-condition-value').html('<p class="isValueNull-text">' + bxMsg('DPS0121String10') + '</p>');
                            } else {
                                if (data.conditionClassifyCode == '02') {
                                    $('.pf-cp-condition-history-popup .history-complex-grid').show();
                                    $('.pf-cp-condition-history-popup .history-condition-value').hide();

                                    renderHistoryComplexGrid(data.complexConditionTitleInfoList, data.complexConditionMatrix);
                                } else {
                                    $('.pf-cp-condition-history-popup .history-complex-grid').hide();
                                    $('.pf-cp-condition-history-popup .history-condition-value').show();

                                    switch (data.conditionTypeCode) {

                                        case '01' :
                                            $('.pf-cp-condition-history-popup').find('.history-condition-value').empty();
                                            renderHistoryCndValueType1Grid(data.listConditionValue.defineValues, '.pf-cp-condition-history-popup .history-condition-value');
                                            break;
                                        case '02' :

                                            $('.pf-cp-condition-history-popup .history-condition-value').html(cndValueType2Tpl(data.rangeConditionValue));

                                            renderComboBox('CurrencyCode', $('.CurrencyCode'));
                                            if (data.conditionDetailTypeCode == '05') {
                                                //renderComboBoxByRate('ProductMeasurementUnitCode', $('.ProductMeasurementUnitCode'));
                                                renderComboBox('ProductMeasurementUnitCodeR', $('.ProductMeasurementUnitCode:visible'));
                                            }
                                            // 02.날짜
                                            else if(data.conditionDetailTypeCode == '02'){
                                                renderComboBox('ProductMeasurementUnitCodeD', $('.ProductMeasurementUnitCode:visible'));
                                            }
                                            // 03.주기
                                            else if(data.conditionDetailTypeCode == '03'){
                                                renderComboBox('ProductMeasurementUnitCodeF', $('.ProductMeasurementUnitCode:visible'));
                                            }
                                            // 04.숫자
                                            else if(data.conditionDetailTypeCode == '04'){
                                                renderComboBox('ProductMeasurementUnitCodeN', $('.ProductMeasurementUnitCode:visible'));
                                            }else{
                                                renderComboBox('ProductMeasurementUnitCode', $('.ProductMeasurementUnitCode:visible'));
                                            }

                                            if (data.rangeConditionValue.isSingleValue) {
                                                $('.history-condition-value').find('.isSingleValue-hide').hide();
                                            } else {
                                                $('.history-condition-value').find('.isNotSingleValue-hide').hide();
                                            }

                                            if (data.conditionDetailTypeCode == '01') {
                                                $('.history-condition-value').find('.detail-type01-hide').hide();
                                            } else {
                                                $('.history-condition-value').find('.detail-except-type01-hide').hide();
                                            }

                                            //$('.history-condition-value').find('.detail-type01-hide').css('display','none');
                                            break;
                                        case '03' :
                                            $('.pf-cp-condition-history-popup .history-condition-value').html(cndValueType3Tpl(data.interestConditionValue));
                                            var $history = $('.pf-cp-condition-history-popup .history-condition-value');
                                            renderComboBox('ProductConditionInterestApplyTypeCode', $('.ProductConditionInterestApplyTypeCode'));

                                            if (data.interestConditionValue) {
                                                renderComboBox('FrctnAplyWayCode', $history.find('.FrctnAplyWayCode'), (data.interestConditionValue.frctnAplyWayCd) ? data.interestConditionValue.frctnAplyWayCd : '',true); // 우수리적용방법코드
                                                renderComboBox('InterestTypeCode', $history.find('.InterestTypeCode'), (data.interestConditionValue.type) ? data.interestConditionValue.type : ''); // 금리데이터유형코드
                                                renderComboBox('InterestSegmentTypeCode', $history.find('.InterestSegmentTypeCode'), (data.interestConditionValue.rateSegmentType) ? data.interestConditionValue.rateSegmentType : ''); // 변동정보 적용방식
                                                renderComboBox('VarIntRtCyclCalcnBaseCode', $history.find('.VarIntRtCyclCalcnBaseCode'), (data.interestConditionValue.varIntRtCyclCalcnBaseCd) ? data.interestConditionValue.varIntRtCyclCalcnBaseCd : ''); // 변동주기 산정기준
                                                renderComboBox('BaseIntRtKndCode', $history.find('.BaseIntRtKndCode'), (data.interestConditionValue.baseRateCode) ? data.interestConditionValue.baseRateCode : ''); // 기준금리종류
                                                renderComboBox('BaseIntRtAplyTmCode', $history.find('.BaseIntRtAplyTmCode'), (data.interestConditionValue.baseIntRtAplyTmCd) ? data.interestConditionValue.baseIntRtAplyTmCd : ''); // 기준금리적용시점코드
                                                renderComboBox('SprdAplyFormulaCode', $history.find('.SprdAplyFormulaCode'), (data.interestConditionValue.sprdAplyFormulaCd) ? data.interestConditionValue.sprdAplyFormulaCd : '', true); // 스프레드적용산식
                                                renderComboBox('RefTrmAplyDscd', $history.find('.RefTrmAplyDscdEnum'), (data.interestConditionValue.refTrmAplyDscd) ? data.interestConditionValue.refTrmAplyDscd : ''); // 참조기간적용구분코드
                                                renderComboBox('RefTrmMsurUtCode', $history.find('.RefTrmMsurUtCode'), (data.interestConditionValue.refTrmMsurUtCd) ? data.interestConditionValue.refTrmMsurUtCd : ''); // 측정단위
                                                renderComboBox('ProductConditionInterestApplyTypeCode', $history.find('.ProductConditionInterestApplyTypeCode'), (data.interestConditionValue.rateApplyWayCode) ? data.interestConditionValue.rateApplyWayCode : ''); // 금리적용방식코드

                                                // 고정변동코드 분기 처리
                                                if(data.interestConditionValue.rateApplyWayCode == '01'
                                                    || data.interestConditionValue.rateApplyWayCode == '04') {
                                                    // 변동정보 Clear
                                                    $history.find('.ProductConditionInterestApplyTypeCode-disabled').prop('disabled', true).val('');
                                                    $history.find('.ProductConditionInterestApplyTypeCode02-th').find('.red-notice').text('');
                                                    $history.find('.varIntRtAplyCyclCnt').val('0'); // 변동 주기수

                                                } else {
                                                    $history.find('.ProductConditionInterestApplyTypeCode-disabled').prop('disabled', false);
                                                    $history.find('.ProductConditionInterestApplyTypeCode02-th').find('.red-notice').text('*');

                                                }

                                                setInterestCombobox(data, $history, getRefPdCdEvent);

                                                // 조건값결정레벨이 상품(01)이면
                                                if(selectedCondition.conditionAgreeLevel == '01'){
                                                    // 스프레스율 1개만 입력
                                                    $history.find('.maxSprdRt').hide();
                                                }else{
                                                    $history.find('.maxSprdRt').show();
                                                }

                                                // 변동주기참조조건코드 네이밍
                                                if(data.interestConditionValue.varFrqRefCndCd){
                                                    bindConditionName($history.find('.varFrqRefCndCd'), $history.find('.varFrqRefCndNm'));
                                                }

                                                if(data.interestConditionValue.refCndCd){
                                                    bindConditionName($history.find('.refCndCd'), $history.find('.refCndNm'));
                                                }

                                                setInterestSegmentTypeCombobox($history);
                                            }
                                            break;

                                        case '04' :
                                            $('.pf-cp-condition-history-popup .history-condition-value').html(cndValueType4TblByHistory(data.feeConditionValue));

                                            var $history = $('.pf-cp-condition-history-popup .history-condition-value');

                                            if (data.feeConditionValue.isSystemMaxValue == true) {
                                                $history.find('.topValue').prop('disabled', true).val('');
                                                $history.find('.isSystemMaxValue').prop('checked', true);
                                            }

                                            //renderComboBoxByRate('ProductMeasurementUnitCode', $history.find('.RtMsurUnitCd'), data.feeConditionValue.rtMsurUnitCd ? data.feeConditionValue.rtMsurUnitCd : '');
                                            renderComboBox('ProductMeasurementUnitCodeR', $history.find('.RtMsurUnitCd'), data.feeConditionValue.rtMsurUnitCd ? data.feeConditionValue.rtMsurUnitCd : '');
                                            renderComboBox('FeeCalculateBasicTypeCode', $('.FeeCalculateBasicTypeCode'), data.feeConditionValue ? data.feeConditionValue.calcBasic : '');   // 징수기준

                                            // 율정보 체크
                                            if (data.feeConditionValue.feeTpCd == '01') {
                                                $history.find('.charge-radio-rate').prop('checked', true);
                                                $history.find('.cnd-value-04-amount-table').removeClass('active');
                                                $history.find('.cnd-value-04-rate-table').addClass('active');
                                            }
                                            // 금액정보 체크
                                            else {
                                                $history.find('.charge-radio-amount').prop('checked', true);
                                                $history.find('.cnd-value-04-amount-table').addClass('active');
                                                $history.find('.cnd-value-04-rate-table').removeClass('active');
                                            }
                                            break;
                                    }
                                    $('.history-condition-value').find('select').prop('disabled',true);
                                    $('.history-condition-value').find('input').prop('disabled',true);
                                }
                            }
                        }
                    }
                }

            });

            grid.setData(responseData);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ClassificationCndService',
            operation: 'queryListClassificationCndHistory'
        }
    });
}
