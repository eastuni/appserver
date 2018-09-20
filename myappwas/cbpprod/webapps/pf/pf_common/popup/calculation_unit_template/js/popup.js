/**
 * @fileOverview Common popups related to calculation unit template. Branched from fee calculation
 * @author Choi Junhyeok
 */


/**
 * Select calculation unit template with popup.
 * @param {Object} config
 * @param {String} [config.calculationUnitDistinctionCode=''] 10(interest), 20(fee), 30(tax).
 * @param {boolean} [config.multi=false] Allow multi select.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=bxMsg('selectCalculationUnitTemplate')]
 *     Title of popup.
 * @param {PFPopup~calculationUnitTemplateCallback} callback The callback that handles the response.
 */
PFPopup.selectCalculationUnitTemplate = function ({
  calculationUnitDistinctionCode = '',
  multi = false,
  readOnly = false,
  title = bxMsg('selectCalculationUnitTemplate'),
} = {}, callback = function () { }) {
  const popupTpl = PFPopup.getPopupTemplate('calculation_unit_template');

  function getCalculationUnitTemplateForList(item, callBack) {
    const requestParam = {
      tntInstId: getLoginTntInstId(),
      calculationUnitDistinctionCode: item.calculationUnitDistinctionCode,
      activeYn: 'Y',
    };

    PFRequest.get('/calculator/getCalculationUnitTemplateForList.json', requestParam, {
      success(responseData) {
        callBack(responseData);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'CalculationUnitTemplateService',
        operation: 'getCalculationUnitTemplateForList',
      },
    });
  }

  let grid;
  let $form;
  PFComponent.makePopup({
    title,
    contents: popupTpl(),
    width: 350,
    height: 360,
    useCurrentTaskIdConfirmYn: true,
    buttons: readOnly ? [] : [{
      text: bxMsg('Z_OK'),
      elCls: 'button button-primary write-btn select-calculation-unit-template-submit',
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
        $form = $('.select-calculation-unit-template-form-table');

        // 조건 그리드
        grid = PFComponent.makeExtJSGrid({
          fields: ['calculationUnitConditionCode', 'calculationUnitConditionName',
            'calculationUnitDistinctionCode'],
          gridConfig: {
            renderTo: '.pf-cal-template-search-grid',
            columns: [
              {
                text: bxMsg('cndCd'), width: 80, dataIndex: 'calculationUnitConditionCode', align: 'center',
              },
              {
                text: bxMsg('cndNm'), flex: 1, dataIndex: 'calculationUnitConditionName', align: 'center',
              },
            ],
            listeners: {
              scope: this,
              celldblclick() {
                $('.select-calculation-unit-template-submit').click();
              },
            },
          },
        });

        getCalculationUnitTemplateForList({ calculationUnitDistinctionCode }, (responseData) => {
          grid.setData(responseData);
        });
      },
    },
    contentsEvent: {
      'keyup .keyword': function () {
        const name = $form.find('.keyword').val();
        grid.store.filterBy((record) => {
          if (name) {
            const keyword = `${record.get('calculationUnitConditionName')} ${record.get('calculationUnitConditionCode')}`;
            return keyword.toUpperCase().search(name.toUpperCase()) >= 0;
          }
          return true;
        });
      },
    },
  });
};


/**
 * Calculation unit template
 * @typedef {Object} CalculationUnitTemplate
 * @property {String} calculationUnitConditionCode Calculation unit condition code.
 * @property {String} calculationUnitConditionName Calculation unit condition name.
 * @property {String} calculationUnitDistinctionCode Calculation unit dscd.
 */


/**
 * @callback PFPopup~calculationUnitTemplateCallback
 * @param {CalculationUnitTemplate|CalculationUnitTemplate[]} result
 *     Selected result(s) of calculation unit template, according to config.multi option.
 */
