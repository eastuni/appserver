/**
 * @fileOverview - Common popups related to product information change. Branched from pf-popup.js
 * @author Choi Junhyeok
 */


/**
 * 상품정보변경내역상세 팝업 에서 사용
 */
function getKeyValueMap(list) {
  const keyValueMap = {};
  list.forEach((el) => {
    keyValueMap[el.key] = el.value ? el : '';
  });
  return keyValueMap;
}

/**
 * Show product information change.
 * @param {Object} config
 * @param {Object} config.projectId Project ID.
 * @param {String} [config.title=bxMsg('DPP0127String5')] Title of popup.
 */
PFPopup.showProductInfoChange = function ({
  projectId,
  title = bxMsg('DPP0127String5'),
}) {
  const popupTpl = PFPopup.getPopupTemplate('product_info_change');
  const columnCodeMap = {
    pdInfoDscd: 'PdInfoDscd',
    cmpxCndYn: 'ProductConditionClassifyCode',
    pdStsCd: 'ProductStatusCode',
    bizDscd: 'ProductCategoryLevelOneCode',
    intRtAplyBaseDayCd: 'IntRtAplyBaseDayCode',
    cndValDcsnLvlCd: 'ProductConditionAgreeLevelCode',
    crncyCd: 'CurrencyCode',
    intRtDataTpCd: 'InterestTypeCode',
    frctnAplyWayCd: 'FrctnAplyWayCode',
    intRtAplyWayCd: 'ProductConditionInterestApplyTypeCode',
    blwUndrDscd: 'RangeBlwUnderTypeCode',
    msurUnitCd: 'ProductMeasurementUnitCode',
    pdDocDscd: 'ProductDocumentTypeCode',
    pdTpDscd: 'ProductTypeDistinctionCode',
  };

  /**
   * TreeGrid형태를 조립하기위한 관계도 세팅
   */
  const PD_PD_M_TABLES = {
    PD_PD_CG_R: 'Y',
    PD_PD_CHNG_H: 'Y',
    PD_PD_R: 'Y',
    PD_PD_DOC_D: 'Y',
    PD_CL_M: 'Y',
    PD_PD_STS_H: 'Y',
    PD_PD_CUST_R: 'Y',
    PD_CG_STS_H: 'Y',
    PD_CG_M: 'Y',
    PD_PD_BR_R: 'Y',
  };
  const PD_PD_CND_M_TABLES = {
    PD_PD_CND_STS_H: 'Y',
    PD_PD_LST_CND_D: 'Y',
    PD_PD_RNG_CND_D: 'Y',
    PD_PD_INT_CND_D: 'Y',
    PD_PD_FEE_CND_D: 'Y',
    PD_PD_CX_LST_CND_D: 'Y',
    PD_PD_CX_RNG_CND_D: 'Y',
    PD_PD_CX_INT_CND_D: 'Y',
    PD_PD_CX_FEE_CND_D: 'Y',
    PD_CX_STRC_M: 'Y',
    PD_CX_CMPS_D: 'Y',
    PD_CX_TIER_D: 'Y',
  };

  const PD_PDT_M = {
    PD_PDT_STS_H: 'Y',
    PD_PDT_CGT_R: 'Y',
  };

  const PD_CGT_M = {
    PD_CGT_CT_R: 'Y',
    PD_RNG_CT_D: 'Y',
    PD_CGT_CT_CT_R: 'Y',
    PD_CGT_CTV_CTV_R: 'Y',
    PD_LST_CT_D: 'Y',
  };

  const PD_CT_M = {
    PD_LST_CT_M: 'Y',
  };

  PFComponent.makePopup({
    title,
    contents: popupTpl(),
    width: 700,
    height: 500,
    buttons: [
      {
        text: bxMsg('ButtonBottomString3'),
        elCls: 'button button-primary',
        handler() {
          this.close();
        },
      },
    ],
    contentsEvent: {},
    listeners: {
      afterRenderUI() {
        PFRequest.get('/publish/PublishGetProductInfoChange.json', { projectId }, {
          success(responseData) {
            $('.pd-info-change-grid-wrap .pd-info-change-grid').empty();

            const newResultObj = {};
            const resultArr = [];

            responseData.publishPdInfoChange.forEach((record) => {
              let resultObj;
              if (record.changeTargetTable === 'PD_PD_M') {
                resultObj = {
                  sequenceNumber: record.sequenceNumber,
                  changeType: record.changeType,
                  allTableColumns: record.allTableColumns,
                  changeTargetTable: record.changeTargetTable,
                  targetTableKey: record.targetTableKey,
                  txDataContentKeyValue: record.txDataContentKeyValue,
                  leaf: false,
                };

                // PD_PD_M 일경우 child 조립 대상 테이블
                const childObjArr = [];
                responseData.publishPdInfoChange.forEach((record_) => {
                  if (record_.changeTargetTable === 'PD_PD_CG_R'
                    || record_.changeTargetTable === 'PD_PD_CHNG_H'
                    || record_.changeTargetTable === 'PD_PD_R'
                    || record_.changeTargetTable === 'PD_PD_DOC_D'
                    || record_.changeTargetTable === 'PD_CL_M'
                    || record_.changeTargetTable === 'PD_PD_STS_H'
                    || record_.changeTargetTable === 'PD_PD_CUST_R'
                    || record_.changeTargetTable === 'PD_CG_STS_H'
                    || record_.changeTargetTable === 'PD_CG_M'
                    || record_.changeTargetTable === 'PD_PD_BR_R') {
                    const childObj = {
                      sequenceNumber: record_.sequenceNumber,
                      changeType: record_.changeType,
                      allTableColumns: record_.allTableColumns,
                      changeTargetTable: record_.changeTargetTable,
                      targetTableKey: record_.targetTableKey,
                      txDataContentKeyValue: record_.txDataContentKeyValue,
                      leaf: true,
                    };

                    childObjArr.push(childObj);
                  }
                });
                resultObj.children = childObjArr;
              } else if (record.changeTargetTable === 'PD_PD_CND_M') {
                resultObj = {
                  sequenceNumber: record.sequenceNumber,
                  changeType: record.changeType,
                  allTableColumns: record.allTableColumns,
                  changeTargetTable: record.changeTargetTable,
                  targetTableKey: record.targetTableKey,
                  txDataContentKeyValue: record.txDataContentKeyValue,
                  leaf: false,
                };

                // PD_PD_CND_M 일경우 child 조립 대상 테이블
                const childObjArr = [];
                responseData.publishPdInfoChange.forEach((record_) => {
                  if (record_.changeTargetTable === 'PD_PD_CND_STS_H'
                    || record_.changeTargetTable === 'PD_PD_LST_CND_D'
                    || record_.changeTargetTable === 'PD_PD_RNG_CND_D'
                    || record_.changeTargetTable === 'PD_PD_INT_CND_D'
                    || record_.changeTargetTable === 'PD_PD_FEE_CND_D'
                    || record_.changeTargetTable === 'PD_PD_CX_LST_CND_D'
                    || record_.changeTargetTable === 'PD_PD_CX_RNG_CND_D'
                    || record_.changeTargetTable === 'PD_PD_CX_INT_CND_D'
                    || record_.changeTargetTable === 'PD_PD_CX_FEE_CND_D'

                    // TODO 그룹핑 - 복합구조영역 재검토 필요.
                    //                    || record_.changeTargetTable === 'PD_CX_STRC_M'
                    //                    || record_.changeTargetTable === 'PD_CX_CMPS_D'
                    //                    || record_.changeTargetTable === 'PD_CX_TIER_D'
                  ) {
                    let isAllKeyYn = true;
                    record.targetTableKey.forEach((key) => {
                      record.txDataContentKeyValue.forEach((value) => {
                        if (value.key === key) {
                          record_.txDataContentKeyValue.forEach((value_) => {
                            if (value_.key === value.key && value_.value !== value.value) {
                              isAllKeyYn = false;
                            }
                          });
                        }
                      });
                    });

                    if (isAllKeyYn) {
                      const childObj = {
                        sequenceNumber: record_.sequenceNumber,
                        changeType: record_.changeType,
                        allTableColumns: record_.allTableColumns,
                        changeTargetTable: record_.changeTargetTable,
                        targetTableKey: record_.targetTableKey,
                        txDataContentKeyValue: record_.txDataContentKeyValue,
                        leaf: true,
                      };

                      childObjArr.push(childObj);
                    }
                  }
                });
                resultObj.children = childObjArr;
              } else if (record.changeTargetTable === 'PD_PDT_M') {
                resultObj = {
                  sequenceNumber: record.sequenceNumber,
                  changeType: record.changeType,
                  allTableColumns: record.allTableColumns,
                  changeTargetTable: record.changeTargetTable,
                  targetTableKey: record.targetTableKey,
                  txDataContentKeyValue: record.txDataContentKeyValue,
                  leaf: false,
                };

                // PD_PDT_M 일경우 child 조립 대상 테이블
                const childObjArr = [];
                responseData.publishPdInfoChange.forEach((record_) => {
                  if (record_.changeTargetTable === 'PD_PDT_STS_H'
                    || record_.changeTargetTable === 'PD_PDT_CGT_R') {
                    let isAllKeyYn = true;
                    record.targetTableKey.forEach((key) => {
                      record.txDataContentKeyValue.forEach((value) => {
                        if (value.key === key) {
                          record_.txDataContentKeyValue.forEach((value_) => {
                            if (value_.key === value.key && value_.value !== value.value) {
                              isAllKeyYn = false;
                            }
                          });
                        }
                      });
                    });

                    if (isAllKeyYn) {
                      const childObj = {
                        sequenceNumber: record_.sequenceNumber,
                        changeType: record_.changeType,
                        allTableColumns: record_.allTableColumns,
                        changeTargetTable: record_.changeTargetTable,
                        targetTableKey: record_.targetTableKey,
                        txDataContentKeyValue: record_.txDataContentKeyValue,
                        leaf: true,
                      };

                      childObjArr.push(childObj);
                    }
                  }
                });
                resultObj.children = childObjArr;
              } else if (record.changeTargetTable === 'PD_CGT_M') {
                resultObj = {
                  sequenceNumber: record.sequenceNumber,
                  changeType: record.changeType,
                  allTableColumns: record.allTableColumns,
                  changeTargetTable: record.changeTargetTable,
                  targetTableKey: record.targetTableKey,
                  txDataContentKeyValue: record.txDataContentKeyValue,
                  leaf: false,
                };

                // PD_CGT_M 일경우 child 조립 대상 테이블
                const childObjArr = [];
                responseData.publishPdInfoChange.forEach((record_) => {
                  if (record_.changeTargetTable === 'PD_CGT_CT_R'
                    || record_.changeTargetTable === 'PD_RNG_CT_D'
                    || record_.changeTargetTable === 'PD_CGT_CT_CT_R'
                    || record_.changeTargetTable === 'PD_CGT_CTV_CTV_R'
                    || record_.changeTargetTable === 'PD_LST_CT_D'
                    || record_.changeTargetTable === 'PD_PDT_CGT_R') {
                    let isAllKeyYn = true;
                    record.targetTableKey.forEach((key) => {
                      record.txDataContentKeyValue.forEach((value) => {
                        if (value.key === key) {
                          record_.txDataContentKeyValue.forEach((value_) => {
                            if (value_.key === value.key && value_.value !== value.value) {
                              isAllKeyYn = false;
                            }
                          });
                        }
                      });
                    });

                    if (isAllKeyYn) {
                      const childObj = {
                        sequenceNumber: record_.sequenceNumber,
                        changeType: record_.changeType,
                        allTableColumns: record_.allTableColumns,
                        changeTargetTable: record_.changeTargetTable,
                        targetTableKey: record_.targetTableKey,
                        txDataContentKeyValue: record_.txDataContentKeyValue,
                        leaf: true,
                      };

                      childObjArr.push(childObj);
                    }
                  }
                });
                resultObj.children = childObjArr;
              } else if (record.changeTargetTable === 'PD_CT_M') {
                resultObj = {
                  sequenceNumber: record.sequenceNumber,
                  changeType: record.changeType,
                  allTableColumns: record.allTableColumns,
                  changeTargetTable: record.changeTargetTable,
                  targetTableKey: record.targetTableKey,
                  txDataContentKeyValue: record.txDataContentKeyValue,
                  leaf: false,
                };

                // PD_CGT_M 일경우 child 조립 대상 테이블
                const childObjArr = [];
                responseData.publishPdInfoChange.forEach((record_) => {
                  if (record_.changeTargetTable === 'PD_LST_CT_M') {
                    let isAllKeyYn = true;
                    record.targetTableKey.forEach((key) => {
                      record.txDataContentKeyValue.forEach((value) => {
                        if (value.key === key) {
                          record_.txDataContentKeyValue.forEach((value_) => {
                            if (value_.key === value.key && value_.value !== value.value) {
                              isAllKeyYn = false;
                            }
                          });
                        }
                      });
                    });

                    if (isAllKeyYn) {
                      const childObj = {
                        sequenceNumber: record_.sequenceNumber,
                        changeType: record_.changeType,
                        allTableColumns: record_.allTableColumns,
                        changeTargetTable: record_.changeTargetTable,
                        targetTableKey: record_.targetTableKey,
                        txDataContentKeyValue: record_.txDataContentKeyValue,
                        leaf: true,
                      };

                      childObjArr.push(childObj);
                    }
                  }
                });
                resultObj.children = childObjArr;
              } else if (PD_PD_M_TABLES[record.changeTargetTable] === undefined
                  && PD_PD_CND_M_TABLES[record.changeTargetTable] === undefined
                  && PD_CGT_M[record.changeTargetTable] === undefined
                  && PD_CT_M[record.changeTargetTable] === undefined
                  && PD_PDT_M[record.changeTargetTable] === undefined) {
                resultObj = {
                  sequenceNumber: record.sequenceNumber,
                  changeType: record.changeType,
                  allTableColumns: record.allTableColumns,
                  changeTargetTable: record.changeTargetTable,
                  targetTableKey: record.targetTableKey,
                  txDataContentKeyValue: record.txDataContentKeyValue,
                  leaf: true,
                };
              }

              if (resultObj !== undefined) resultArr.push(resultObj);
            });

            newResultObj.result = resultArr;
            newResultObj.leaf = false;

            Ext.define('Car', {
              extend: 'Ext.data.Model',
              fields: ['sequenceNumber',
                'changeType', 'changeTypeNm',
                'changeTargetTable',
                'targetTableKey', 'txDataContentKeyValue',
                'contents', 'allTableColumns',
              ],
              proxy: {
                type: 'memory',
                data: {
                  success: true,
                  children: newResultObj.result,
                },
              },
            });

            const store = Ext.create('Ext.data.TreeStore', {
              model: 'Car',
            });

            Ext.create('Ext.tree.Panel', {
              height: '420px',
              store,
              rootVisible: false,
              lines: true,
              useArrows: true,
              renderTo: $('.pd-info-change-grid-wrap .pd-info-change-grid')[0],
              columns: [
                // 일련번호
                {
                  xtype: 'treecolumn', text: bxMsg('DAS0101String11'), width: 60, dataIndex: 'sequenceNumber',
                },

                // 구분(테이블)
                {
                  text: bxMsg('PAS0501String8'),
                  width: 150,
                  renderer(value, p, record) {
                    return `${bxMsg(record.get('changeTargetTable').toLowerCase())}</br>[${record.get('changeTargetTable')}]`;
                  },
                },

                // 변경구분
                {
                  text: bxMsg('changeDistinction'),
                  width: 60,
                  dataIndex: 'changeType',
                  renderer(value) {
                    let result = '';
                    // 등록
                    if (value === 'C') {
                      result = bxMsg('registration');

                    // 수정
                    } else if (value === 'U') {
                      result = bxMsg('modify');
                    // 삭제
                    } else {
                      result = bxMsg('Z_Del');
                    }
                    return result;
                  },
                },

                // 내용
                {
                  text: bxMsg('PAS0203String3'),
                  flex: 1,
                  renderer(v, p, record) {
                    let result = '';

                    // DB Data가 존재하지않는 경우가 존재하여 방지.
                    if (record.get('txDataContentKeyValue').length === 0) {
                      return result;
                    }
                    const keyValueMap = getKeyValueMap(record.get('txDataContentKeyValue'));

                    let cndGrpTmpltExistYn = false;
                    let cndCdExistYn = false;
                    let cndGrpTmpltInfo = '';
                    record.get('targetTableKey').forEach((el) => {
                      if (el === 'cndGrpTmpltCd') {
                        cndGrpTmpltExistYn = true;

                        let codeName;
                        const t = keyValueMap[el];
                        if (columnCodeMap[t.key]) {
                          codeName = codeMapObj[columnCodeMap[t.key]][t.value];
                        } else {
                          codeName = '';
                        }

                        const name = t.name || '';
                        const value = t.value || '';
                        cndGrpTmpltInfo = `${cndGrpTmpltInfo} [${value}] ${name}${codeName}`;
                      } else if (el === 'cndCd') {
                        cndCdExistYn = true;
                      }
                    });
                    record.get('targetTableKey').forEach((el) => {
                      if (el === 'cndGrpCd') return;

                      if (el === 'cndGrpTmpltCd' && cndGrpTmpltExistYn && cndCdExistYn) {
                        return;
                      }

                      let codeName;
                      const t = keyValueMap[el];
                      if (columnCodeMap[t.key]) {
                        codeName = codeMapObj[columnCodeMap[t.key]][t.value];
                      } else {
                        codeName = '';
                      }


                      const name = t.name || '';

                      // 20160830 OHS - 화면에 undefined로 보이는것 처리
                      const value = t.value || '';
                      if (el === 'cndCd' && cndGrpTmpltExistYn) {
                        result = `${result + bxMsg(el)} : ${cndGrpTmpltInfo} / [${v}] ${name}${codeName}</br>`;
                      } else {
                        result = `${result + bxMsg(el)} : [${value}] ${name}${codeName}</br>`;
                      }
                    });
                    return result;
                  },
                },
              ],
              listeners: {
                scope: this,
                celldblclick(_this, _td, _cellIndex, _record) {
                  if (_record.data.txDataContentKeyValue
                     && _record.data.txDataContentKeyValue.length > 0) {
                    PFPopup.showProductInfoChangeDetail({ record: _record.data });
                    return false;
                  }
                  return true;
                },
              },
            });
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'PublishService',
            operation: 'queryProductInfoChangeHistory',
          },
        });
      },
    },
  });
};

/**
 * Show product information change detail.
 * @param {Object} config
 * @param {Object} config.record product information change detail
 * @param {String} [config.title=bxMsg('detailInfo')] Title of popup.
 */
PFPopup.showProductInfoChangeDetail = function ({
  record,
  title = bxMsg('detailInfo'),
}) {
  const popupTpl = PFPopup.getPopupTemplate('product_info_change', 'detailTpl');

  const columnCodeMap = {
    pdInfoDscd: 'PdInfoDscd',
    cmpxCndYn: 'ProductConditionClassifyCode',
    pdStsCd: 'ProductStatusCode',
    bizDscd: 'ProductCategoryLevelOneCode',
    intRtAplyBaseDayCd: 'IntRtAplyBaseDayCode',
    cndValDcsnLvlCd: 'ProductConditionAgreeLevelCode',
    crncyCd: 'CurrencyCode',
    intRtDataTpCd: 'InterestTypeCode',
    frctnAplyWayCd: 'FrctnAplyWayCode',
    intRtAplyWayCd: 'ProductConditionInterestApplyTypeCode',
    blwUndrDscd: 'RangeBlwUnderTypeCode',
    msurUnitCd: 'ProductMeasurementUnitCode',
    pdDocDscd: 'ProductDocumentTypeCode',
    pdTpDscd: 'ProductTypeDistinctionCode',
  };

  PFComponent.makePopup({
    title,
    contents: popupTpl(),
    width: 400,
    height: 600,
    buttons: [
      {
        text: bxMsg('ButtonBottomString3'),
        elCls: 'button button-primary',
        handler() {
          this.close();
        },
      },
    ],
    contentsEvent: {},
    listeners: {
      afterRenderUI() {
        const $table = $('.pd-info-change-detail-wrap .pd-info-change-detail-table');
        const keyValueMap = getKeyValueMap(record.txDataContentKeyValue);

        record.allTableColumns.forEach((el) => {
          if (el === 'tntInstId' || el === 'cndGrpCd' || el === 'gmtCreate' || el === 'stsChngHms') return;

          const t = keyValueMap[el];
          const name = (t && t.name && (t.name !== null && t.name !== undefined)) ? t.name : '';

          let codeName;
          if (t && columnCodeMap[t.key]
             && (columnCodeMap[t.key] !== null && columnCodeMap[t.key] !== undefined)) {
            if (t.key === 'cmpxCndYn') {
              if (t.value === 'Y') {
                codeName = codeMapObj[columnCodeMap[t.key]]['02'];
              } else {
                codeName = codeMapObj[columnCodeMap[t.key]]['01'];
              }
            } else {
              codeName = codeMapObj[columnCodeMap[t.key]][t.value];
            }
          } else {
            codeName = '';
          }

          if (codeName === undefined) codeName = '';

          let code;
          if (t && (t.value !== null && t.value !== undefined)) {
            code = `[${t.value}]`;
          } else {
            code = '';
          }

          if (!(code === '' && name === '' && codeName === '')) {
            const tr = `<tr><th>${bxMsg(el)}</th><td>${code}${name}${codeName}</td></tr>`;
            $table.append(tr);
          }
        });
      },
    },
  });
};
