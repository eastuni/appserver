/**
 * @fileOverview Common popups related to calculation rule. Branched from fee calculation
 * @author Choi Junhyeok
 */


/**
 * Select calculation rule with popup.
 * @param {Object} config
 * @param {boolean} [config.multi=false] Allow multi select.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=bxMsg('selectCalculationRule')]
 *     Title of popup.
 * @param {PFPopup~calculationRuleCallback} callback The callback that handles the response.
 */
PFPopup.selectCalculationRule = function ({
  calculationUnitId = null,
  multi = false,
  readOnly = false,
  title = bxMsg('selectCalculationRule'),
} = {}, callback = function () { }) {
  const popupTpl = PFPopup.getPopupTemplate('calculation_rule');

  function getCalculationRuleForList(item, callBack) {
    const requestParam = {
      tntInstId: getLoginTntInstId(),
      calculationUnitId: calculationUnitId
    };

    if(!calculationUnitId){
    	//
    }

    PFRequest.get('/calculator/getCalculationRuleForList.json', requestParam, {
      success(responseData) {
        callBack(responseData);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'CalculationRuleService',
        operation: 'getCalculationRuleForList',
      },
    });
  }

  let grid;
  let $form;
  PFComponent.makePopup({
    title,
    contents: popupTpl(),
    width: 500,
    height: 360,
    useCurrentTaskIdConfirmYn: true,
    buttons: readOnly ? [] : [{
      text: bxMsg('Z_OK'),
      elCls: 'button button-primary write-btn select-calculation-rule-submit',
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
        $form = $('.select-calculation-rule-form-table');

        // 조건 그리드
        grid = PFComponent.makeExtJSGrid({
          fields: ['calculationRuleId', 'formulaId', 'formulaName', 'formulaContent'],
          gridConfig: {
        	selModel: PFPopup.getCheckboxModel(multi, readOnly),
            renderTo: '.pf-cal-search-grid',
            columns: [
			  {
				text: bxMsg('calculationRuleId'), width: 120, dataIndex: 'calculationRuleId', align: 'center'
			  },
              {
  				text: bxMsg('formulaName'), width: 120, dataIndex: 'formulaName', align: 'left'
  			  },
                {
                  text: bxMsg('formulaContent'), flex: 1, dataIndex: 'formulaContent', align: 'left'
                }
            ],
            listeners: {
              scope: this,
              celldblclick() {
                $('.select-calculation-rule-submit').click();
              },
            },
          },
        });

        getCalculationRuleForList({}, (responseData) => {
        	if(responseData){
        		grid.setData(responseData);
        	}else{
        		grid.setData([]);
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


