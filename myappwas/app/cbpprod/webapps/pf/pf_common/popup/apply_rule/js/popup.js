/**
 * Show apply rule history as popup.
 * @param {Object} config
 * @param {BenefitRule} config.param Benefit rule to query.
 * @param {String} [config.pdInfoDscd='01] Product info dscd.
 * @param {String} [config.title=bxMsg('ApplyRuleHistory')] Title of popup.
 */
PFPopup.showApplyRuleHistory = function ({
  param = {},
  pdInfoDscd = '01', // 상품
  title = bxMsg('ApplyRuleHistory'), // 적용규칙 이력조회
} = {}) {
  // Input validation
  const dscd = param.ruleApplyTargetDistinctionCode;
  
  /** OHS20180412 주석처리 - 코드별 입력값체크가 정확하지 않아 주석처리
  if (!('ruleApplyTargetDistinctionCode' in param)) {
    throw new Error('Missing mandatory field: ruleApplyTargetDistingctionCode');
  } else if (dscd === '01' && !param.pdCode) {
    throw new Error('Missing mandatory field: pdCode');
  } else if (dscd === '04' && !param.feeDiscountSequenceNumber) {
    throw new Error('Missing mandatory field: feeDiscountSequenceNumber');
  } else if (['02', '03', '04'].includes('02') &&
    (!param.cndGroupTemplateCode || !param.cndGroupTemplateCode || !param.cndCode)) {
    throw new Error('Missing mandatory field: cndCode|cndGroupCode|cndGroupTemplateCode');
  }
  */

  const cndPopupTpl = PFPopup.getPopupTemplate('apply_rule');
  const columns = [
    { text: bxMsg('ApplyRuleId'), flex: 1, dataIndex: 'ruleId' },
    { text: bxMsg('DPP0127String6'), flex: 1, dataIndex: 'applyStartDate' },
    { text: bxMsg('DPP0127String7'), flex: 1, dataIndex: 'applyEndDate' },
  ];

  if (dscd === '01') { // 규칙적용대상구분코드 = 01.우대금리적용규칙
    columns.push({
      text: bxMsg('PAS0102String10'), // 유형
      flex: 0.3,
      dataIndex: 'rateAmountDistinctionCode',
      renderer(value) {
        return codeMapObj.FeeTypeCode[value];
      },
    }, {
      text: bxMsg('DPS0121_4String6') + bxMsg('DPS0121_5String1'),
      flex: 0.5,
      align: 'right',
      style: 'text-align:left',
      dataIndex: 'maxDiscount',
      renderer(value) {
        return value || 0;
      },
    });
  } else if (dscd === '02') { // 규칙적용대상구분코드 = 02.수수료할인
    columns.push({
      text: bxMsg('MaxDiscount'),
      flex: 0.5,
      align: 'right',
      style: 'text-align:left',
      dataIndex: 'maxDiscount',
      renderer(value) {
        return value || 0;
      },
    });
  }

  columns.push({ text: bxMsg('ApplyRule'), flex: 1, dataIndex: 'ruleContent' });

  let cndPopupGrid;
  PFComponent.makePopup({
    title,
    width: 800,
    height: 330,
    contents: cndPopupTpl(),
    listeners: {
      afterRenderUI() {
        cndPopupGrid = PFComponent.makeExtJSGrid({
          fields: ['ruleId', 'ruleContent', 'rateAmountDistinctionCode', 'maxAmount', 'maxRate', 'applyStartDate', 'applyEndDate',
            {
              name: 'maxDiscount',
              convert(newValue, record) {
                return record.get('rateAmountDistinctionCode') === '02' ? record.get('maxAmount') : record.get('maxRate');
              },
            },
          ],
          gridConfig: {
            renderTo: '.popup-cnd-grid',
            columns,
          },
        });

        if (param.ruleId) {
          // param.pdInfoDscd = pdInfoDscd; // OHS 20171207 추가 - PdInfoDscd 필수입력값 세팅(값 누락시 조회되지 않음)
          PFRequest.get('/benefit/getListBenefitRuleMasterHistory.json', $.extend(param, { pdInfoDscd }), {
            success(responseData) {
              cndPopupGrid.setData(responseData);
            },
            bxmHeader: {
              application: 'PF_Factory',
              service: 'BenefitRuleMasterService',
              operation: 'queryListBenefitRuleMaster',
            },
          });
        }
      },
    },
  });
};


/**
 * @typedef RuleApplyTargetDscd
 * @enum
 * @value {'01'} Benefit interest
 * @value {'02'} Fee discount
 * @value {'03'} Service provided condition
 * @value {'04'} Provide condition
 */

/**
 * @typedef {Object} BenefitRule
 * @property {String} ruleId Rule ID.
 * @property {String} applyStartDate Apply start date.
 * @property {String} applyEndDate Apply end date.
 * @property {RuleApplyTargetDscd} ruleApplyTargetDistinctionCode
 *     Rule apply target distinction code.
 * @property {String} ruleContent Rule contents.
 * @property {String} ruleDesc Rule description.
 * @property {String} rateAmountDistinctionCode Rate amount distinction code.
 * @property {String} maxAmount Max amount.
 * @property {String} maxRate Max rate.
 * @property {String} ruleStatusCode Rule status code.
 * @property {String} cndGroupTemplateCode Condition group template code.
 *     Mandatory if ruleApplyTargetDscd in ('02', '03', '04').
 * @property {String} cndGroupCode Condtion group code.
 *     Mandatory if ruleApplyTargetDscd in ('02', '03', '04').
 * @property {String} cndCode Condition code.
 *     Mandatory if ruleApplyTargetDscd in ('02', '03', '04').
 * @property {String} feeDiscountSequenceNumber Fee discount sequence number.
 *     Mandatory if ruleApplyTargetDscd is '04'.
 * @property {String} pdCode Product code. Mandatory if ruleApplyTargetDscd is '01'.
 * @property {String} classificationStructureDistinctionCode
 *     Classification structure distinction code.
 * @property {String} classificationCode Classification code.
 */
