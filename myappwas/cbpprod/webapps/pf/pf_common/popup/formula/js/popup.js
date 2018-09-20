/**
 * @fileOverview - Common popups related to formula. Branched from pf-popup.js
 * @author Choi Junhyeok
 */


/**
 * Edit formula.
 * @param {Object} config
 * @param {String} [config.formulaContent=''] Formula content.
 * @param {String} [config.conditionType=''] Condition type for initial query.
 * @param {String} [config.title=bxMsg('formulaEdit')] Title of popup.
 * @param {PFPopup~formulaContentCallback} callback - The callback that handles the response.
 */
PFPopup.editFormula = function ({
  formulaContent = '',
  conditionType = '',
  title = bxMsg('formulaEdit'), // 산식관리
}, callback = function () {}) {
  const popupTpl = PFPopup.getPopupTemplate('formula');
  let grid;
  let tokens;
  const conditionMap = {};

  function fnBindFormula(content) {
    $('.pf-formula-editor-popup .formula-content').val(content);
    if (content.length === 0) {
      $('.pf-formula-editor-popup .conversion-content').val('');
      return;
    }

    if (PFFormulaEditor.validate(content)) {
      const convertCntnt = PFFormulaEditor.translate(content, conditionMap, ' ');
      $('.pf-formula-editor-popup .conversion-content').val(convertCntnt);
    } else {
      $('.pf-formula-editor-popup .conversion-content').val(bxMsg('invalidFormula'));
    }
  }

  function fnSearchCondition(content) {
    const requestParam = {
      conditionName: $('.pf-formula-editor-popup .cnd-name-search').val(), // 조건명
    };

    const comboVal = $('.pf-formula-editor-popup .cnd-type-select').val(); // 조건유형 콤보

    if (comboVal) {
      requestParam.conditionTypeCode = comboVal; // 조건유형값
    }

    PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
      success(responseData) {
    	  if(!responseData) {
    		  responseData=[];
    	  }

        grid.setData(responseData);

        responseData.forEach((el) => {
          conditionMap[el.code] = el.name;
        });

        if (content) {
          fnBindFormula(content);
        }
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'CndTemplateService',
        operation: 'queryListCndTemplate',
      },
    });
  }

  PFComponent.makePopup({
    title,
    contents: popupTpl(),
    width: 800,
    height: 500,
    buttons: [
      {
        text: bxMsg('ButtonBottomString3'),
        elCls: 'button button-primary',
        handler() {
          const content = $('.pf-formula-editor-popup .formula-content').val();
          if (PFFormulaEditor.validate(content)) {
            const conversionFormula = $('.pf-formula-editor-popup .conversion-content').val();
            callback(content, conversionFormula);
            this.close();
          } else {
            PFComponent.showMessage(bxMsg('invalidFormula'), 'error');
          }
        },
      },
      {
        text: bxMsg('ButtonBottomString17'),
        elCls: 'button button-primary',
        handler() {
          this.close();
        },
      },
    ],
    contentsEvent: {
      'click .text-input-btn': function (e) {
        const s = $(e.currentTarget).val();
        const type = PFFormulaEditor.getTokenType(s);

        tokens.push({
          type,
          value: s,
        });

        const cntnt = PFFormulaEditor.toContent(tokens, ' ');
        fnBindFormula(cntnt);
      },

      'click .back-space-btn': function () {
        tokens.pop();
        const cntnt = PFFormulaEditor.toContent(tokens, ' ');
        fnBindFormula(cntnt);
      },


      // 검증버튼
      'click .formula-validation-btn': function () {
        const requestParam = PFComponent.makeYGForm($('.formula-editor-table')).getData();

        if (!requestParam.intRtStructureContent) {
          PFComponent.showMessage(bxMsg('FormulaContentError'), 'warning');
          return;
        }

        if (!PFFormulaEditor.validate(requestParam.intRtStructureContent)) {
          PFComponent.showMessage(bxMsg('invalidFormula'), 'warning');
          return;
        }

        PFRequest.get('/interestRateStructure/validateFormula.json', requestParam, {
          success(responseData) {
            PFComponent.showMessage(bxMsg('noAbnormality'), 'success');
            $('.pf-formula-editor-popup .conversion-content').val(responseData);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'InterestRateStructureService',
            operation: 'validateFormula',
          },
        });
      },
      'click .cnd-tpl-search': function () {
        fnSearchCondition();
      },
    },
    listeners: {
      afterSyncUI() {
        PFUtil.renderComboBox('ProductConditionTypeCode', $('.pf-formula-editor-popup .cnd-type-select'), conditionType, true);

        tokens = PFFormulaEditor.tokenize(formulaContent);

        grid = PFComponent.makeExtJSGrid({
          fields: ['code', 'conditionDetailTypeCode', 'type', 'name', 'content', 'isActive', 'currentCatalogId', {
            name: 'typeNm',
            convert(newValue, record) {
              let typeNm;
              if (record.get('type') === '03') {
                typeNm = codeMapObj.ProductConditionInterestDetailTypeCode[record.get('conditionDetailTypeCode')];
              } else if (record.get('type') === '04') {
                typeNm = codeMapObj.ProductConditionFeeDetailTypeCode[record.get('conditionDetailTypeCode')];
              } else {
                typeNm = codeMapObj.ProductConditionDetailTypeCode[record.get('conditionDetailTypeCode')];
              }
              return typeNm;
            },
          }],
          gridConfig: {
            renderTo: '.formula-editor-grid',
            columns: [
              { text: bxMsg('DTP0203String3'), width: 70, dataIndex: 'code' },
              { text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name' },
              { text: bxMsg('DTP0203String4'), width: 70, dataIndex: 'typeNm' },
              {
                text: bxMsg('DPS0101String6'),
                width: 60,
                dataIndex: 'isActive',
                renderer(value) {
                  return bxMsg(value === 'Y' ? 'active' : 'inactive');
                },
              },
            ],
            listeners: {
              scope: this,
              celldblclick(_this, td, cellIndex, record) {
                tokens.push({
                  type: TokenType.CONDITION,
                  value: `#${record.get('code')}`,

                });

                const cntnt = PFFormulaEditor.toContent(tokens, ' ');

                $('.pf-formula-editor-popup .formula-content').val(cntnt);

                if (PFFormulaEditor.validate(cntnt)) {
                  const convertCntnt = PFFormulaEditor.translate(cntnt, conditionMap, ' ');
                  $('.pf-formula-editor-popup .conversion-content').val(convertCntnt);
                } else {
                  $('.pf-formula-editor-popup .conversion-content').val(bxMsg('invalidFormula'));
                }
              },
            },
          },
        });

        fnSearchCondition(formulaContent);
      },
    },
  });
};


/**
 * Select formula with popup.
 * @param {Object} config
 * @param {boolean} [config.multi=false] Allow multi select.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=bxMsg('selectFormula')]
 *     Title of popup.
 * @param {PFPopup~formulaCallback} callback
 *     The callback that handles the response.
 */
PFPopup.selectFormula = function ({
  multi = false,
  readOnly = false,
  title = bxMsg('selectFormula'),
} = {}, callback = function () { }) {
  const popupTpl = PFPopup.getPopupTemplate('formula', 'selectTpl');

  function getCalculationFormulaForList(item, callBack) {
    const requestParam = {
      activeYn: item.activeYn,
      tntInstId: getLoginTntInstId(),
    };

    PFRequest.get('/calculator/getCalculationFormulaForList.json', requestParam, {
      success(responseData) {
        callBack(responseData);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'CalculationFormulaService',
        operation: 'getCalculationFormulaForList',
      },
    });
  }

  let grid;
  let $form;
  PFComponent.makePopup({
    title,
    contents: popupTpl(),
    width: 600,
    height: 330,
    useCurrentTaskIdConfirmYn: true,
    buttons: readOnly ? [] : [{
      text: bxMsg('Z_OK'),
      elCls: 'button button-primary write-btn select-formula-btn',
      handler() {
        const selected = grid.getSelectedItem();
        if (multi) { // return multiple results
          callback(selected);
        } else if (selected.length > 0) { // return one result
          callback(selected[0]);
        }
        this.close();
      },
    }],
    listeners: {
      afterSyncUI() {
        $form = $('.select-formula-form-table');

        // 산식 유형
        PFUtil.renderComboBox('formulaTypeCode', $form.find("[data-form-param='type']"), null, true);

        // 조건 그리드
        grid = PFComponent.makeExtJSGrid({
          fields: ['formulaId', 'applyStartDate', 'applyEndDate',
            'formulaName', 'formulaContent', 'formulaTypeCode', 'activeYn'],
          gridConfig: {
            renderTo: '.pf-cal-formula-search-grid',
            columns: [
              {
                text: bxMsg('formulaId'), width: 50, dataIndex: 'formulaId', align: 'center',
              },
              {
                text: bxMsg('formulaName'), width: 160, dataIndex: 'formulaName',
              },
              {
                text: bxMsg('formulaContent'), flex: 1, dataIndex: 'formulaContent',
              },
            ],
            listeners: {
              scope: this,
              celldblclick() {
                $('.select-formula-btn').click();
              },
            },
          },
        });

        getCalculationFormulaForList({ activeYn: 'Y' }, (responseData) => {
          grid.setData(responseData);
        });
      },
    },
    contentsEvent: {
      'change .formula-type-input': function () {
        const formulaTypeCode = $form.find("[data-form-param='type']").val();

        if (formulaTypeCode) {
          grid.store.filterBy(record => record.get('formulaTypeCode') === formulaTypeCode);
        } else {
          grid.store.clearFilter();
        }
      },
    },
  });
};


/**
 * @callback PFPopup~formulaContentCallback
 * @param {String} formulaContent Content of formula.
 * @param {String} conversionContent Translated content of formula.
 */


/**
 * Formula
 * @typedef {Object} Formula
 * @property {String} formulaId Formula ID.
 * @property {String} formulaName Formula name.
 * @property {String} applyStartDate
 * @property {String} applyEndDate
 * @property {String} formulaContent
 * @property {String} formulaTypeCode
 * @property {String} activeYn
 */


/**
 * @callback PFPopup~formulaCallback
 * @param {Formula|Formula[]} result
 *     Selected result(s) of formula, according to config.multi option.
 */
