/**
 * @fileOverview Common popups related to calculation unit. Branched from fee calculation
 * @author Choi Junhyeok
 */


/**
 * Select calculation unit with popup.
 * @param {Object} config
 * @param {String} [config.calculationUnitDistinctionCode=''] 10(interest), 20(fee), 30(tax).
 * @param {boolean} [config.multi=false] Allow multi select.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=bxMsg('selectCalculationUnit')]
 *     Title of popup.
 * @param {PFPopup~calculationUnitCallback} callback The callback that handles the response.
 */
PFPopup.selectCalculationUnit = function ({
  calculationUnitDistinctionCode = '',
  multi = false,
  readOnly = false,
  title = bxMsg('selectCalculationUnit'),
} = {}, callback = function () { }) {
  const popupTpl = PFPopup.getPopupTemplate('calculation_unit');

  function getCalculationUnitForList(item, callBack) {
    const requestParam = {
      tntInstId: getLoginTntInstId(),
      calculationUnitDistinctionCode: item.calculationUnitDistinctionCode,
    };

    PFRequest.get('/calculator/getCalculationUnitForList.json', requestParam, {
      success(responseData) {
        callBack(responseData);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'CalculationUnitService',
        operation: 'getCalculationUnitForList',
      },
    });
  }

  let grid;
  let $form;
  PFComponent.makePopup({
    title,
    contents: popupTpl(),
    width: 450,
    height: 360,
    useCurrentTaskIdConfirmYn: true,
    buttons: readOnly ? [] : [{
      text: bxMsg('Z_OK'),
      elCls: 'button button-primary write-btn select-calculation-unit-submit',
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
        $form = $('.select-calculation-unit-form-table');

        // 조건 그리드
        grid = PFComponent.makeExtJSGrid({
          fields: ['transactionId', 'calculationUnitId', 'calculationUnitConditionCode', 'calculationUnitConditionName',
            'calculationUnitDistinctionCode'],
          gridConfig: {
        	selModel: PFPopup.getCheckboxModel(multi, readOnly),
            renderTo: '.pf-cal-search-grid',
            columns: [
			  {
			    text: bxMsg('ServiceType'), flex: 1, dataIndex: 'transactionId',
			    renderer: function(value) {
                    return codeMapObj['11973'][value] || value;
                }
			  },
			  {
				text: bxMsg('calculationUnit'), width: 120, dataIndex: 'calculationUnitId', align: 'center',
			  },
              {
                text: bxMsg('cndNm'), flex: 1.5, dataIndex: 'calculationUnitConditionName', align: 'left',
              }
            ],
            listeners: {
              scope: this,
              celldblclick() {
                $('.select-calculation-unit-submit').click();
              },
            },
          },
        });

        getCalculationUnitForList({}, (responseData) => {
          if (responseData) {
            grid.setData(responseData);
          }
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
 * Calculation unit
 * @typedef {Object} CalculationUnit
 * @property {String} calculationUnitConditionCode Calculation unit condition code.
 * @property {String} calculationUnitConditionName Calculation unit condition name.
 * @property {String} calculationUnitDistinctionCode Calculation unit dscd.
 */


/**
 * @callback PFPopup~calculationUnitCallback
 * @param {CalculationUnit|CalculationUnit[]} result
 *     Selected result(s) of calculation unit, according to config.multi option.
 */
