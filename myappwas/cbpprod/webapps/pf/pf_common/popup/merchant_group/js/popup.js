/**
 * @fileOverview - Common popups related to merchant group. Branched from pf-popup.js
 * @author Choi Junhyeok
 */


/**
 * Select merchant group.
 * @param {Object} config
 * @param {boolean} [config.multi=false] Allow multi select.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=bxMsg('formulaEdit')] Title of popup.
 * @param {PFPopup~merchantGroupCallback} callback The callback that handles the response.
 */
PFPopup.selectMerchantGroup = function ({
  multi = false,
  readOnly = false,
  title = bxMsg('merchantGroupSearch'),
}, callback = function () {}) {
  const popupTpl = PFPopup.getPopupTemplate('merchant_group');
  let grid;

  PFComponent.makePopup({
    title,
    contents: popupTpl(),
    width: 500,
    height: 300,
    buttons: readOnly ? [] : [{
      text: bxMsg('Z_OK'),
      elCls: 'button button-primary',
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
    contentsEvent: {
      'click .search-btn': function () {
        const requestParam = PFComponent.makeYGForm($('.merchant-group-search-popup table')).getData();
        requestParam.activeYn = 'Y';
        PFRequest.get('/merchant/getListMerchantGroupMaster.json', requestParam, {
          success(responseData) {
            grid.setData(responseData);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'MerchantGroupService',
            operation: 'queryList',
          },
        });
      },
    },
    listeners: {
      afterRenderUI() {
        PFRequest.get('/merchant/getListMerchantGroupMaster.json', {}, {
          success(responseData) {
            grid = PFComponent.makeExtJSGrid({
              fields: [
                'merchantGroupCode', 'merchantGroupName',
              ],
              gridConfig: {
                selModel: PFPopup.getCheckboxModel(multi, readOnly),
                renderTo: '.merchant-group-search-popup .merchant-group-list-grid',
                columns: [
                  {
                    text: bxMsg('merchantGroupCd'),
                    flex: 1,
                    dataIndex: 'merchantGroupCode',
                    sortable: false,
                    align: 'center',
                  },
                  {
                    text: bxMsg('merchantGroupName'),
                    flex: 2,
                    dataIndex: 'merchantGroupName',
                    sortable: false,
                    style: 'text-align:center',
                  },
                ],
              },
            });
            grid.setData(responseData);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'MerchantGroupService',
            operation: 'queryList',
          },
        });
      },
    },
  });
};


/**
 * Merchant group
 * @typedef {Object} MerchantGroup
 * @property {String} merchantGroupCode Merchant group code.
 * @property {String} merchantGroupName Merchant group name.
 */


/**
 * @callback PFPopup~merchantGroupCallback
 * @param {MerchantGroup|MerchantGroup[]} result Selected result(s) of merchant group,
 *     according to config.multi option.
 */
