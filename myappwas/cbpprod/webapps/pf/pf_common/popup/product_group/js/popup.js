/**
 * @fileOverview - Common popups related to product group. Branched from pf-popup.js
 * @author Choi Junhyeok
 */


/**
 * Select product group.
 * @param {Object} config
 * @param {boolean} [config.multi=false] Allow multi select.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=bxMsg('SearchProductGroup')] Title of popup.
 * @param {PFPopup~productGroupCallback} callback The callback that handles the response.
 */
PFPopup.selectProductGroup = function ({
  multi = false,
  readOnly = false,
  title = bxMsg('SearchProductGroup'),
}, callback = function () {}) {
  const popupTpl = PFPopup.getPopupTemplate('product_group');
  const tntInstId = getLoginTntInstId();

  function renderProductGroupListGrid() {
    return PFComponent.makeExtJSGrid({
      pageAble: true,
      fields: ['classificationStructureDistinctionCode', 'classificationCode', 'classificationName', 'applyStartDate'],
      gridConfig: {
        selModel: PFPopup.getCheckboxModel(multi, readOnly),
        renderTo: '.product-group-grid',
        columns: [
          { text: bxMsg('ProductGroupCode'), flex: 1, dataIndex: 'classificationCode' },
          { text: bxMsg('ProductGroupName'), flex: 1, dataIndex: 'classificationName' },
        ],
      },
    });
  }

  let grid;
  PFComponent.makePopup({
    title,
    contents: popupTpl(),
    width: 600,
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
        const form = PFComponent.makeYGForm($('.rel-product-group-search-form'));
        const requestParam = form.getData();
        requestParam.pdInfoDscd = '01'; // 상품
        requestParam.tntInstId = tntInstId;
        requestParam.classificationStructureTypeCode = '2';

        PFRequest.get('/classification/getListClassificationDetail.json', requestParam, {
          success(responseData) {
            grid.setData(responseData);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'ClassificationDetailService',
            operation: 'queryListClassificationDetail',
          },
        });
      },
    },
    listeners: {
      afterRenderUI() {
        // set first category select
        const firstCategoryOptions = [];
        firstCategoryOptions.push($('<option>'));

        const requestParam = {
          classificationStructureTypeCode: '2',
          tntInstId,
          pdInfoDscd: '01',
        };

        PFRequest.get('/classification/getListClassificationMaster.json', requestParam, {
          success(responseData) {
            responseData.forEach((category) => {
              const $option = $('<option>');
              $option.val(category.classificationStructureDistinctionCode);
              $option.text(category.classificationStructureName);
              firstCategoryOptions.push($option);
            });
            $('.first-category-select').html(firstCategoryOptions);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'ClassificationMasterService',
            operation: 'queryListClassificationMaster',
          },
        });
        grid = renderProductGroupListGrid();
      },
    },
  });
};


/**
 * Product group (ClassificationDetail)
 * @typedef {Object} ProductGroup
 * @property {String} classificationStructureDistinctionCode
 *     Classification structure distinction code.
 * @property {String} classificationCode Classification code.
 * @property {String} classificationName Classification name.
 * @property {String} applyStartDate Apply start date.
 */

/**
 * @callback PFPopup~productGroupCallback
 * @param {ProductGroup|ProductGroup[]} result - Selected result(s) of product group,
 *     according to config.multi option.
 */
