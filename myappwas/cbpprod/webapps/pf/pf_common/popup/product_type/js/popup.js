/**
 * @fileOverview - Common popups related to product type. Branched from pf-popup.js
 * @author Choi Junhyeok
 */


/**
 * Select product type.
 * @param {Object} config
 * @param {String} [config.pdInfoDscd='01'] Product information dscd.
 * @param {String} [config.bizDscd='01'] Business dscd.
 * @param {boolean} [config.multi=false] Allow multi select.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=bxMsg('DPS0101String11')] Title of popup.
 * @param {PFPopup~productTypeCallback} callback The callback that handles the response.
 */
PFPopup.selectProductType = function ({
  pdInfoDscd = '01',
  bizDscd = '01',
  multi = false,
  readOnly = false,
  title = bxMsg('DPS0101String11'),
}, callback = function () {}) {
  const popupTpl = PFPopup.getPopupTemplate('product_type');

  let grid;
  PFComponent.makePopup({
    title,
    width: 500,
    height: 300,
    contents: popupTpl(),
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
    listeners: {
      afterSyncUI() {
        grid = PFComponent.makeExtJSGrid({
          fields: ['id', 'name',
            {
              name: 'code',
              convert(newValue, record) {
                return record.get('id').substr(3, 4);
              },
            }],
          gridConfig: {
            selModel: PFPopup.getCheckboxModel(multi, readOnly),
            renderTo: '.product-type-popup-grid',
            columns: [
              { text: bxMsg('pdTpDscd'), width: 80, dataIndex: 'code' },
              { text: bxMsg('pdTpDscdNm'), flex: 1, dataIndex: 'name' },
            ],
          },
        });


        const requestParam = {
          idType: '04',
          treeType: 'PD',
          id: bizDscd,
          pdInfoDscd,
        };
        PFRequest.get('/catalog/getCatalog.json', requestParam, {
          success(responseData) {
            grid.setData(responseData.childCatalogs);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CatalogService',
            operation: 'queryCatalog',
          },
        });
      },
    },
  });
};


/**
 * Product type
 * @typedef {Object} ProductType
 * @property {String} id Product type ID.
 * @property {String} name Product type name.
 * @property {String} code Product type code.
 */


/**
 * @callback PFPopup~productTypeCallback
 * @param {ProductType|ProductType[]} result Selected result(s) of product type,
 *     according to config.multi option.
 */
