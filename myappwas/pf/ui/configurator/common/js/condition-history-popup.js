const commonConditionHistoryPopupTpl = getTemplate('condition/commonConditionHistoryPopupTpl');

function renderConditionHistoryPopup() {
  PFComponent.makePopup({
    title: bxMsg('DPP0127Title'),
    contents: commonConditionHistoryPopupTpl(selectedCondition),
    width: 800,
    height: 570,
    buttons:[
      {text:bxMsg('ContextMenu_Close'), elCls:'button button-primary', handler:function(){
        this.close();
      }}
      ],
      listeners: {
        afterRenderUI: function() {
          var requestParam = {
              conditionGroupTemplateCode: selectedCondition.conditionGroupTemplateCode,
              conditionGroupCode: selectedCondition.conditionGroupCode,
              conditionCode: selectedCondition.id,
              tntInstId: selectedCondition.tntInstId
          };
          renderCommonConditionHistoryGrid(requestParam);
        }
      }
  });
}

function renderCommonConditionHistoryGrid(requestParam) {
  var $conditionInfoWrap = $el.find('.pf-cc-condition-info');
  var gridRow = requestParam;
  PFRequest.get('/product_condition/getListProductConditionHistory.json',requestParam, {
    success: function(responseData){
      var grid = PFComponent.makeExtJSGrid({
        fields: [
          'applyStart', 'applyEnd', 'conditionClassifyCode', 'lastModifier',
          'complexConditionRecordSequence', 'status', 'conditionTypeCode', 'isValueNull',
          'conditionGroupCode', 'isMandatory', 'conditionGroupTemplateCode', 'conditionAgreeLevel'
          ],
          gridConfig: {
            renderTo: '.pf-cc-condition-history-grid',
            columns: [
              {text: bxMsg('PAS0202String19'), flex: 1, dataIndex: 'applyStart'},
              {text: bxMsg('PAS0202String20'), flex: 1, dataIndex: 'applyEnd'},
              {text: bxMsg('DPP0127String8'), flex: 1, dataIndex: 'conditionClassifyCode',
                renderer: function(value) {
                  return codeMapObj.ProductConditionClassifyCode[value];
                }
              },
              {text: bxMsg('DPP0127String9'), flex: 1, dataIndex: 'lastModifier'}
              ],
              listeners: {
                scope: this,
                itemdblclick : function(tree, record){
                  var requestParam = gridRow;
                  requestParam.applyStart = record.get('applyStart');
                  requestParam.tntInstId = requestParam.tntInstId;

                  PFRequest.get('/product_condition/getProductConditionDetail.json', requestParam, {
                    success: function(data) {
                      if (data.isValueNull) {
                        $('.pf-cc-condition-history-popup .history-complex-grid').hide();
                        $('.pf-cc-condition-history-popup .history-condition-value').html('<p class="isValueNull-text">' + bxMsg('DPS0121String10') + '</p>');
                      } else {
                        if (data.conditionClassifyCode == '02') {
                          $('.pf-cc-condition-history-popup .history-complex-grid').show();
                          $('.pf-cc-condition-history-popup .history-condition-value').hide();

                          renderHistoryComplexGrid(data.complexConditionTitleInfoList, data.complexConditionMatrix);
                        } else {
                          $('.pf-cc-condition-history-popup .history-complex-grid').hide();
                          $('.pf-cc-condition-history-popup .history-condition-value').show();

                          switch (data.conditionTypeCode) {
                          // OHS 20180628 추가 - 기타조건들에 대한 이력조회로직 추가
                          case '01' :
                              $('.pf-cc-condition-history-popup').find('.history-condition-value').empty();
                              renderHistoryCndValueType1Grid(data.listConditionValue.defineValues, '.pf-cp-condition-history-popup .history-condition-value');
                              break;
                          case '02' :

                              $('.pf-cc-condition-history-popup .history-condition-value').html(cndValueType2Tpl(data.rangeConditionValue));

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

                            var $history = $('.pf-cc-condition-history-popup .history-condition-value');

                            $history.find('.frctnAplyCnt').val(data.interestConditionValue.frctnAplyCnt);
                            if (data.interestConditionValue) {
                              data.interestConditionValue.minInterestRate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.minInterestRate, 3, 6);
                              data.interestConditionValue.maxInterestRate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.maxInterestRate, 3, 6);
                              data.interestConditionValue.applyMinInterestRate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.applyMinInterestRate, 3, 6);
                              data.interestConditionValue.applyMaxInterestRate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.applyMaxInterestRate, 3, 6);
                              data.interestConditionValue.rate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.rate, 3, 6);
                              data.interestConditionValue.minSprdRt = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.minSprdRt, 3, 6); // 스프레드율 최소
                              data.interestConditionValue.maxSprdRt = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.maxSprdRt, 3, 6); // 스프레드율 최대
                            }

                            $('.pf-cc-condition-history-popup .history-condition-value').html(cndValueType3Tpl(data.interestConditionValue));

                            renderComboBox('FrctnAplyWayCode', $history.find('.FrctnAplyWayCode'), data.interestConditionValue.frctnAplyWayCd, true); // 우수리적용방법코드
                            renderComboBox('ProductConditionInterestApplyTypeCode', $history.find('.ProductConditionInterestApplyTypeCode'), (data.interestConditionValue.rateApplyWayCode ? data.interestConditionValue.rateApplyWayCode : '')); // 금리적용방식코드

                            renderCndValueType3Tab($history, data);

                            // 우수리적용방법 별도 처리 ( 빈값일경우 '' 세팅 )
                            if(!data.interestConditionValue.frctnAplyWayCd) {
                              $history.find('.FrctnAplyWayCode').val('');
                            }

                            // 조건값결정레벨이 상품(01)이면
                            if(selectedCondition.conditionAgreeLevel == '01'){
                              // 스프레스율 1개만 입력
                              $history.find('.maxSprdRt').hide();
                            }else{
                              $history.find('.maxSprdRt').show();
                            }

                            if(detailRequestParam.applyMethod && detailRequestParam.applyMethod == '02'){
                              $history.find('.pf-cp-type3-panel .pf-panel-body *').prop('disabled', true);
                            }

                            // 조건값적용방법코드
                            if (data.conditionValueAplyWayCode == '02') {

                              $history.find('.condition-value').addClass('active');

                              $history.find('.pf-cp-type3-panel .cndValApplyWayCode-hidden').hide();    // 자상품사용가능여부
                              $history.find('.cnd-val-apply-way').hide();
                              $history.find('.additional-info-wrap').hide();

                            }
                            break;

                          case '04' :
                            $('.pf-cc-condition-history-popup .history-condition-value').html(cndValueType4TblByHistory(data.feeConditionValue));
                            var $history = $('.pf-cc-condition-history-popup .history-condition-value');

                            if (data.feeConditionValue.isSystemMaxValue == true) {
                              // OHS 2017.02.16 수정 - 시스템최대치 값세팅
                              //$history.find('.topValue').prop('disabled', true).val('');
                              $history.find('.topValue').prop('disabled', true);

                              $history.find('.isSystemMaxValue').prop('checked', true);
                            }

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
                    },
                    bxmHeader: {
                      application: 'PF_Factory',
                      service: 'PdCndService',
                      operation: 'queryPdCndDetail'
                    }
                  })

                }
              }
          }

      });

      var gridData = [];
      $.each(responseData,function(index, history){
        var row = {};
        row.applyStart = history.applyStart;
        row.applyEnd = history.applyEnd;
        row.conditionClassifyCode = history.conditionClassifyCode;
        row.lastModifier = history.lastModifier;
        row.complexConditionRecordSequence = history.complexConditionRecordSequence;
        row.status = history.status;
        row.conditionTypeCode = history.conditionTypeCode;
        row.isValueNull = history.isValueNull ? 'true':'false';
        row.isMandatory = history.isMandatory ? 'true':'false';
        row.conditionGroupTemplateCode = history.conditionGroupTemplateCode;
        row.conditionAgreeLevel = history.conditionAgreeLevel;
        gridData.push(row);
      })
      grid.setData(gridData);
    },
    bxmHeader: {
      application: 'PF_Factory',
      service: 'PdCndService',
      operation: 'queryListPdCndHistory'
    }
  });
}

function renderHistoryComplexGrid(title, data) {
    var fields = ['y'],
        columns = [{text: bxMsg('DPS0128String1'), width: 50, sortable: false, align:'center',
          renderer: function(value, metaData, record) {
            var index = record.store.data.keys.indexOf(record.internalId);
            var prev = record.store.data.items.slice(0, index).map(function(v) { return v.data });
            var start = prev.reduce(function(n, cnd) {
              return n + Object.keys(cnd).reduce(function(m, key) {
                if (key.endsWith(".code")) {
                  m *= cnd[key].length;
                }
                return m;
              }, 1);
            }, 1);
            var len = Object.keys(record.data).reduce(function(m, key) {
              if (key.endsWith(".code")) {
                m *= record.data[key].length;
              }
              return m;
            }, 1);
            return start + (len > 1 ? "~" + (start + len - 1) : "");
          }
        }],
        gridData = [];

    $('.pf-cc-condition-history-popup .history-complex-grid').empty();

    data.forEach(function(el) {
        var tempObj = {};

        el.x.forEach(function(xEl){
            var columnId = xEl.id;

            tempObj[columnId] = xEl;

        });

        //condition value column setting from here
        tempObj['y'] = el.y;

        gridData.push(tempObj);
    });

    title.forEach(function(el) {
        el.defineValues = el.defineValues || [];
        var conditionCode = el.titleConditionCode;
        var tempObj = {};
        tempObj['titleConditionCode'] = conditionCode;
        tempObj['titleConditionName'] = el.titleConditionName;
        tempObj['titleConditionTypeCode'] = el.titleConditionTypeCode;

        if (el.titleConditionTypeCode == '01') {
            tempObj['defineValues'] = el.defineValues;

            var defineValuesObj = {};

            el.defineValues.forEach(function(el) {
                defineValuesObj[el.code] = el.name;
            });

            fields.push(conditionCode, conditionCode+'.defineValues', {
                name: conditionCode+'.code',
                style: 'text-align:center',
                convert: function(newValue, record) {
                    var code;
                    if (!Array.isArray(newValue)) newValue = [newValue];
                    if (record.get(conditionCode)) {
                        code = record.get(conditionCode).listConditionValue.defineValues.reduce(function(l, v) {
                            if (v.isSelected) {
                              l.push(v.code);
                            }
                            return l;
                        }, []);
                    } else {
                        code = [''];
                    }
                    
                    return code.length > 0 ? code : [''];
                }
            });

            columns.push({header: el.titleConditionName + '('+ el.titleConditionCode +')',
                width: 170, dataIndex: conditionCode+'.code',
                style: 'text-align:center',
                renderer: function(value, metadata, record) {
                    var map = value.reduce(function(map, v) {
                      map[v] = true;
                      return map;
                    }, {});

                    var consecutive = false;
                    var resultList = [];
                    var temp = [];
                    var defineValues = el.defineValues; 
                    defineValues.forEach(function(v, i) {
                      if (map[v.code]) {
                        temp.push(v);
                        consecutive = true;
                      }

                      if (i === defineValues.length - 1 || (!map[v.code] && consecutive)) {
                        if (temp.length === 1) {
                          resultList.push(Ext.String.format("[{0}]{1}", temp[0].code, temp[0].name));
                        } else if (temp.length > 1) {
                          var left = temp.shift();
                          var right = temp.pop();
                          resultList.push(Ext.String.format("[{0}]{1}~[{2}]{3}", left.code, left.name, right.code, right.name));
                        }
                        temp = [];
                        consecutive = false;
                      }
                    });

                    return resultList.join(", ");
                }});

        } else if (el.titleConditionTypeCode == '02') {
            tempObj['productMeasurementUnit'] = el.productMeasurementUnit;
            tempObj['currencyValue'] = el.currencyValue;
            tempObj['rangeBlwUnderType'] = el.rangeBlwUnderType;
            tempObj['titleConditionDetailTypeCode'] = el.titleConditionDetailTypeCode;

            fields.push(conditionCode, {
                name: conditionCode + '.minValue',
                style: 'text-align:center',
                convert: function (newValue, record) {
                    var minValue;

                    if (record.get(conditionCode)['rangeConditionValue']) {
                        minValue = record.get(conditionCode)['rangeConditionValue']['minValue'];
                    } else {
                        minValue = '';
                    }

                    return minValue;
                }
            }, {
                name: conditionCode + '.maxValue',
                convert: function (newValue, record) {
                    var maxValue;
                    if (record.get(conditionCode)['rangeConditionValue']) {
                        maxValue = record.get(conditionCode)['rangeConditionValue']['maxValue'];
                    } else {
                        maxValue = '';
                    }

                    return maxValue;
                }
            });

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
                    dataIndex: conditionCode + '.minValue'
                }, {
                    text: bxMsg('DPS0121_1String2'),
                    width: 120,
                    dataIndex: conditionCode + '.maxValue'
                }]
            });
        }

    });

    var flex = 0,
        width = 0;

    if(title.length >= 3) {
        flex = 0;
        width = 250;
    } else {
        flex = 1;
        width = 0;
    }

    columns.push({text: bxMsg('DPS0129String4'), flex : flex, width : width, renderer: function(value, p, record) {
        var yTitle1 = '',
            yVal1 = '',
            yTitle2 = '',
            yVal2 = '',
            line1 = '',
            line2 = '',
            line3 = '';

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
                        baseString = (record.get('y').defalueValue) ? record.get('y').defalueValue : '0.00';
                    }

                    if (selectedCondition.isSingleValue) {
                        yTitle1 = bxMsg('DPM100TabSring1') + ' : ';
                        yVal1 = defaultString;
                    } else {
                        yTitle1 = bxMsg('DPS0129Unit1String1') + ' : ';
                        yVal1 = minString + '~' + maxString + '(' + baseString  + ')';
                    }

                    if (selectedCondition.conditionDetailTypeCode == '01') {
                        yTitle2 = bxMsg('currencyCode') + ' : ';
                        yVal2 = codeMapObj['CurrencyCode'][record.get('y').currencyValue];
                    } else {
                        yTitle2 = bxMsg('DPS0129Unit1String2') + ' : ';
                        yVal2 = codeMapObj['ProductMeasurementUnitCode'][record.get('y').productMeasurementUnit];
                    }
                }

                extFormat = Ext.String.format('<p class="ext-condition-value-column">{0} {1} </br> {2} {3}</p>', yTitle1, yVal1, yTitle2, yVal2);
                break;
            case '03' :
                if (record.get('y')) {
                    var minInString,
                        maxInString, base,
                        refPdCd, refPdNm,
                        refCndCd, refCndNm;

                    var rateApplyWay,           // 금리적용방식
                        intVal,                 // 금리값(최대~최소(기본))
                        sprdVal,                // 기준금리 (+,-,*,/) 스프레드율
                        rateSegmentType,        // 변동적용방식
                        varIntRtCyclCalcnBase,  // 변동주기산정기준
                        refPdVal;               // 타상품금리연동 정보


                    // 금리적용방식
                    rateApplyWay = codeMapObj['ProductConditionInterestApplyTypeCode'][record.get('y').rateApplyWayCode];

                    // 금리값
                    minInString = (record.get('y').minInterestRate) ? record.get('y').minInterestRate : '';
                    maxInString = (record.get('y').maxInterestRate) ? record.get('y').maxInterestRate : '';
                    base = (record.get('y').rate) ? record.get('y').rate : '';
                    intVal = bxMsg('DPS0129Unit1String1') + ' : ' + minInString + '~' + maxInString + '(' + base + ')';

                    // 금리데이터유형코드 = 기준금리연동
                    if(record.get('y').type == '02') {

                        var sprdAplyFormula;

                        switch (record.get('y').sprdAplyFormulaCd) {
                            case '01' :
                                sprdAplyFormula = '+';
                                break;
                            case '02' :
                                sprdAplyFormula = '-';
                                break;
                            case '03' :
                                sprdAplyFormula = '*';
                                break;
                            case '04' :
                                sprdAplyFormula = '/';
                                break;
                        }
                        sprdVal = codeMapObj['BaseIntRtKndCode'][record.get('y').baseRateCode] + (sprdAplyFormula ? sprdAplyFormula + record.get('y').minSprdRt : '');
                    }
                    // 금리데이터유형코드 = 타상품금리연동
                    else if(record.get('y').type == '03') {
                        yTitle1 = bxMsg('DPS0121_34String1') + ' : ';
                        refPdCd = (record.get('y').refPdCd) ? record.get('y').refPdCd : '';
                        refPdNm = (record.get('y').refPdNm) ? record.get('y').refPdNm : '';

                        yTitle2 = bxMsg('DPS0121_34String2') + ' : ';
                        refCndCd = (record.get('y').refCndCd) ? '[' + record.get('y').refCndCd  + ']' : '';
                        refCndNm = (record.get('y').refCndNm) ? ' / ' +record.get('y').refCndNm : '';

                        var refRefCndCd = (record.get('y').refRefCndCd) ? ' / ' + record.get('y').refRefCndNm : '';
                        var refCndVal = (record.get('y').refCndVal) ? record.get('y').refCndVal : '';
                        var refCndMsurUtCd = (record.get('y').refCndMsurUtCd) ? '(' + codeMapObj['ProductMeasurementUnitCode'][record.get('y').refCndMsurUtCd] + ')' : '';

                        refPdVal = refPdNm + refCndNm + refRefCndCd + ' '+ refCndVal + refCndMsurUtCd;
                    }

                    // 금리적용방식코드 != 고정적용
                    if(record.get('y').rateApplyWayCode != '01') {
                        // 변동적용방식
                        if (record.get('y').rateSegmentType == '01') {
                            // 신규이후변동적용  : 변동적용방식
                            rateSegmentType = codeMapObj['InterestSegmentTypeCode'][record.get('y').rateSegmentType];
                        }
                        else if (record.get('y').rateSegmentType == '02' || record.get('y').rateSegmentType == '03') {
                            // 일주기변동, 월주기변동 : (주기수)변동적용방식
                            rateSegmentType = '(' + record.get('y').varIntRtAplyCyclCnt + ')'
                                + codeMapObj['InterestSegmentTypeCode'][record.get('y').rateSegmentType];
                        }
                        else if (record.get('y').rateSegmentType == '04') {
                            // 약정주기변동적용 : 변동적용방식([조건코드]조건명)
                            rateSegmentType = codeMapObj['InterestSegmentTypeCode'][record.get('y').rateSegmentType]
                                + '([' + record.get('y').varFrqRefCndCd + ']' + record.get('y').varFrqRefCndNm + ')';
                        }

                        // 변동주기산정기준
                        varIntRtCyclCalcnBase = codeMapObj['VarIntRtCyclCalcnBaseCode'][record.get('y').varIntRtCyclCalcnBaseCd];
                    }

                    // 금리적용방식코드 = 고정
                    if (record.get('y').rateApplyWayCode == '01') {
                        // 금리값
                        if(record.get('y').type == '01'){
                            line1 = rateApplyWay + ', ' + intVal;
                        }
                        // 기준금리연동
                        else if(record.get('y').type == '02'){
                            line1 = rateApplyWay + ', ' + sprdVal;
                        }
                        // 타상품금리연동
                        else if(record.get('y').type == '03'){
                            line1 = rateApplyWay + ', ' + refPdVal;
                        }
                    }
                    // 금리적용방식코드 = 변동
                    else if (record.get('y').rateApplyWayCode == '02') {

                        line1 = rateApplyWay + ', ' + rateSegmentType + ', ' + varIntRtCyclCalcnBase;

                        // 금리값
                        if(record.get('y').type == '01'){
                            line2 = intVal;
                        }
                        // 기준금리연동
                        else if(record.get('y').type == '02'){
                            line2 = sprdVal;
                        }
                        // 타상품금리연동
                        else if(record.get('y').type == '03'){
                            line2 = refPdVal;
                        }
                    }
                    // 금리적용방식코드 = 고정후변동
                    else if (record.get('y').rateApplyWayCode == '03') {
                        // 기준금리연동
                        if(record.get('y').type == '02'){
                            line1 = rateApplyWay + ', '
                                + bxMsg('FixedDuration') + ':' + record.get('y').frstFixIrtAplyTrmCnt + codeMapObj['FrstFixIRtAplyTrmDscd'][record.get('y').frstFixIrtAplyTrmDscd] + ', ' // 고정기간
                                + intVal;
                            line2 = rateSegmentType + ', ' + varIntRtCyclCalcnBase + ', ' + sprdVal;
                        }
                        // 타상품금리연동
                        else if(record.get('y').type == '03'){
                            line1 = rateApplyWay + ', ' + refPdVal;
                            line2 = rateSegmentType + ', ' + varIntRtCyclCalcnBase;
                        }
                    }
                    // 금리적용방식코드 = 타상품참조
                    else if (record.get('y').rateApplyWayCode == '04') {
                        line1 = rateApplyWay + ', ' + refPdVal;
                    }

                    if(record.get('y').type != '01'){
                        line3 = bxMsg('DPS0121_31String3') + ':' +  record.get('y').applyMinInterestRate + '/' + record.get('y').applyMaxInterestRate;
                    }
                }

                if(line2.length > 0){
                    line2 = '</br>'+line2;
                }
                if(line3.length > 0){
                    line3 = '</br>'+line3;
                }

                extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}{1}{2}</p>', line1, line2, line3);
                break;
            case '04' :
                if (record.get('y')) {
                    var minFixFeeAmt, // 최소수수료
                        maxFixFeeAmt,  // 최대수수료
                        fixed, // 기본수수료
                        minRt, // 최소수수료율
                        maxRt, // 최대수수료율
                        rate; // 기본율
                    var bottom,
                        top,
                        calcBasic;  // 징수기준

                    calcBasic = codeMapObj['FeeCalculateBasicTypeCode'][(record.get('y').calcBasic)];

                    // 금액정보
                    if (record.get('y').feeTpCd == '02') {
                        minFixFeeAmt = (record.get('y').minFixFeeAmt) ? record.get('y').minFixFeeAmt : '0.00';
                        maxFixFeeAmt = (record.get('y').maxFixFeeAmt) ? record.get('y').maxFixFeeAmt : '0.00';
                        fixed = (record.get('y').fixed) ? record.get('y').fixed : '0.00';

                        // 최소~최대(기본)
                        //line1 = calcBasic + ', ' + bxMsg('DPS0129Unit1String1') + ' : ' + minFixFeeAmt + '~' + maxFixFeeAmt + '(' + fixed + '), ' + record.get('y').currencyValue;
                        //line1 = calcBasic + ', ' + bxMsg('DPS0129Unit1String1') + ' : ' + minFixFeeAmt + '~' + maxFixFeeAmt + '(' + fixed + '), ' + ('.CurrencyCode').val();

                        // OHS 2017.02.16 수정 - 통화코드는 저장하지않는값으로 불필요데이터임.
                        line1 = calcBasic + ', ' + bxMsg('DPS0129Unit1String1') + ' : ' + minFixFeeAmt + '~' + maxFixFeeAmt + '(' + fixed + ')';
                        line2 = '';
                    }
                    // 율정보
                    else if (record.get('y').feeTpCd == '01') {
                        minRt = (record.get('y').minRt) ? record.get('y').minRt : '0.000000';
                        maxRt = (record.get('y').maxRt) ? record.get('y').maxRt : '0.000000';
                        rate = (record.get('y').rate) ? record.get('y').rate : '0.000000';
                        bottom = (record.get('y').bottom) ? record.get('y').bottom : '0.00';
                        top = (record.get('y').top) ? record.get('y').top : '0.00';

                        // 최소~최대(기본)
                        line1 = calcBasic  + ', ' + bxMsg('DPS0129Unit1String1') + ' : ' + minRt + '~' + maxRt + '(' + rate + ') (%)';
                        //line2 = bxMsg('DPS0129Unit1String1') + ' : ' + bottom + '~' + top + ', ' + record.get('y').currencyValue;

                        // OHS 2017.02.16 수정 - 통화코드는 저장하지않는값으로 불필요데이터임.
                        //line2 = bxMsg('DPS0129Unit1String1') + ' : ' + bottom + '~' + top + ', ' + codeMapObj['ProductMeasurementUnitCodeR'][el.rtMsurUnitCd];
                        line2 = bxMsg('DPS0129Unit1String1') + ' : ' + bottom + '~' + top;
                    }
                }

                extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}</br> {1}</p>', line1, line2);
                break;
        }

        return extFormat;
    }
    });

    var historyCndValComplexGrid = PFComponent.makeExtJSGrid({
        fields: fields,
        gridConfig: {
            renderTo: '.history-complex-grid',
            columns: columns,
            listeners: {
                scope: this,
                'celldblclick': function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    if ($(td).find('p').attr('class') === 'ext-condition-value-column') {
                        var conditionTypeCode = selectedCondition.conditionTypeCode,
                            button = [{text:bxMsg('Z_OK'), elCls:'button button-primary', handler:function(){
                                this.close();
                            }}];

                        switch (conditionTypeCode) {
                            case '03' :
                                renderConditionValue3Popup(record.get('y'), rowIndex, button);
                                break;
                            case '04' :
                                renderConditionValue4Popup(record.get('y'), rowIndex, button);
                                break;
                        }
                    }
                }
            }
        }

    });

    gridData = aggregate(gridData);
    historyCndValComplexGrid.setData(gridData);
}