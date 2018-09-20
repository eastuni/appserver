/**
 * @fileOverview Common popups related to calculation compose template.
 * @author Choi Junhyeok
 */


/**
 * Select calculation compose template with popup.
 * @param {Object} config
 * @param {boolean} [config.multi=false] Allow multi select.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=bxMsg('selectCalculationComposeTemplate')]
 *     Title of popup.
 * @param {PFPopup~calculationComposeTemplateCallback} callback
 *     The callback that handles the response.
 */
PFPopup.selectCalculationComposeTemplate = function ({
  multi = false,
  readOnly = false,
  title = bxMsg('selectCalculationComposeTemplate'),
} = {}, callback = function () { }) {
  const popupTpl = PFPopup.getPopupTemplate('calculation_compose_template');

  function getCalculationComposeElementTemplateForList(item, callBack) {
    const requestParam = {
      tntInstId: getLoginTntInstId(),
    };

    PFRequest.get('/calculator/getCalculationComposeElementTemplateForList.json', requestParam, {
      success(responseData) {
        callBack(responseData);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'CalculationComposeElementTemplateService',
        operation: 'getCalculationComposeElementTemplateForList',
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
      elCls: 'button button-primary write-btn select-calculation-compose-template-submit',
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
        $form = $('.select-calculation-compose-template-form-table');

        // 조건 그리드
        grid = PFComponent.makeExtJSGrid({
          fields: ['composeElementConditionCode', 'composeElementConditionName',
            'valueComputationMethodDistinctionCode', 'conditionDetailTypeCode',
            'applyStartDate', 'applyEndDate', 'referenceObjectName', 'referenceAttributeName',
            'inputInfoAttributeName', 'calculationClassName', 'interestRateStructureCode', 'activeYn',
            'referenceCalculationClassName',
          ],
          gridConfig: {
            renderTo: '.pf-cal-compose-template-search-grid',
            columns: [
              {
                text: bxMsg('cndCd'), width: 80, dataIndex: 'composeElementConditionCode', align: 'center',
              },
              {
                text: bxMsg('cndNm'), flex: 1, dataIndex: 'composeElementConditionName', align: 'center',
              },
            ],
            listeners: {
              scope: this,
              celldblclick() {
                $('.select-calculation-compose-template-submit').click();
              },
            },
          },
        });

        getCalculationComposeElementTemplateForList({}, (responseData) => {
          grid.setData(responseData);
        });
      },
    },
    contentsEvent: {
      'keyup .keyword': function () {
        const name = $form.find('.keyword').val();
        grid.store.filterBy((record) => {
          if (name) {
            const keyword = `${record.get('composeElementConditionName')} ${record.get('composeElementConditionCode')}`;
            return keyword.toUpperCase().search(name.toUpperCase()) >= 0;
          }
          return true;
        });
      },
    },
  });
};


/**
 * Calculation compose template
 * @typedef {Object} CalculationComposeTemplate
 * @property {String} composeElementConditionCode Compose element condition code.
 * @property {String} composeElementConditionName Compose element condition code.
 * @property {String} valueComputationMethodDistinctionCode
 * @property {String} conditionDetailTypeCode
 * @property {String} applyStartDate
 * @property {String} applyEndDate
 * @property {String} referenceObjectName
 * @property {String} referenceAttributeName
 * @property {String} inputInfoAttributeName
 * @property {String} calculationClassName
 * @property {String} interestRateStructureCode
 * @property {String} activeYn
 * @property {String} referenceCalculationClassName
 */


/**
 * @callback PFPopup~calculationComposeTemplateCallback
 * @param {CalculationComposeTemplate|CalculationComposeTemplate[]} result
 *     Selected result(s) of calculation compose template, according to config.multi option.
 */
