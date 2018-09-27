/**
 * @fileOverview - Common popups related to product template. Branched from pf-popup.js
 * @author Choi Junhyeok
 */


/**
 * Select product template.
 * @param {Object} config
 * @param {Object} [config.pdInfoDscd='01'] Product information dscd.
 * @param {Object} [config.bizDscd='01'] Business dscd.
 * @param {Object} [config.pdTpCd='10'] Product type code.
 * @param {boolean} [config.multi=false] Allow multi select.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=bxMsg('DPS0101String3')] Title of popup.
 * @param {PFPopup~productTemplateCallback} callback The callback that handles the response.
 */
PFPopup.selectProductTemplate = function ({
  pdInfoDscd = '01',
  bizDscd = '01',
  pdTpCd = '10',
  multi = false,
  readOnly = false,
  title = bxMsg('DPS0101String3'),
}, callback = function () {}) {
  const popupTpl = PFPopup.getPopupTemplate('product_template');
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
          fields: ['id', 'name', 'code'],
          gridConfig: {
            selModel: PFPopup.getCheckboxModel(multi, readOnly),
            renderTo: '.product-template-popup-grid',
            columns: [
              { text: bxMsg('pdTmpltCd'), width: 80, dataIndex: 'code' },
              { text: bxMsg('pdTmpltNm'), flex: 1, dataIndex: 'name' },
            ],
          },
        });

        const requestParam = {
          treeType: 'PD',
          pdInfoDscd,
          firstCatalogId: bizDscd,
          secondCatalogId: pdTpCd,
          id: pdTpCd,
        };
        PFRequest.get('/product/template/queryProductTemplateBaseForList.json', requestParam, {
          success(responseData) {
        	  if(responseData){
        		  grid.setData(responseData);
        	  }
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'PdTemplateService',
            operation: 'queryListPdTemplate',
          },
        });
      },
    },
  });
};


/**
 * Select product template 2.
 * @param {Object} config
 * @param {Object} [config.pdInfoDscd='01'] Product information dscd.
 * @param {boolean} [config.multi=false] Allow multi select.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=(related to pdInfoDscd)] Title of popup.
 * @param {PFPopup~productTemplateCallback} callback The callback that handles the response.
 */
PFPopup.selectProductTemplate2 = function ({
  pdInfoDscd = '01',
  multi = false,
  readOnly = false,
  title,
}, callback = function () {}) {
  const popupTpl = PFPopup.getPopupTemplate('product_template', 'tpl2');
  let grid;
  const defaultTitle = (function () {
    return {
      '01': bxMsg('DPS0101String3'),
      '02': bxMsg('ServiceTemplate'),
      '03': bxMsg('PointTemplate'),
    };
  }())[pdInfoDscd];

  PFComponent.makePopup({
    title: title || defaultTitle,
    width: 500,
    height: 330,
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
    contentsEvent: {
      'change .first-category-select': function (e) {
        const firstCategoryId = $(e.currentTarget).val();

        if (firstCategoryId !== '') {
          const secondCategoryOptions = [];
          secondCategoryOptions.push($('<option>'));

          const requestParam = {
            idType: '04',
            treeType: 'PD',
            id: firstCategoryId,
            pdInfoDscd,
          };
          PFRequest.get('/catalog/getCatalog.json', requestParam, {
            success(responseData) {
              const secondCategoryMap = {};
              if (responseData.childCatalogs && responseData.childCatalogs.length > 0) {
                  console.log(responseData);
                responseData.childCatalogs.forEach((category) => {
                  const value = category.id.substr(3, 4);
                  secondCategoryMap[value] = category;

                  const $option = $('<option>');
                  $option.val(value);
                  $option.text(category.name);
                  secondCategoryOptions.push($option);
                });
                $('.second-category-select').html(secondCategoryOptions);
              }
            },
            bxmHeader: {
              application: 'PF_Factory',
              service: 'CatalogService',
              operation: 'queryCatalog',
            },
          });
        }
      },
      'change .second-category-select': function () {
        const requestParam = {
          treeType: 'PD',
          pdInfoDscd,
          firstCatalogId: $('.first-category-select').val(),
          secondCatalogId: $('.second-category-select').val(),
        };
        PFRequest.get('/product/template/queryProductTemplateBaseForList.json', requestParam, {
          success(responseData) {
            grid.setData(responseData);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'PdTemplateService',
            operation: 'queryListPdTemplate',
          },
        });
      },
    },
    listeners: {
      afterSyncUI() {
        grid = PFComponent.makeExtJSGrid({
          fields: ['id', 'name', 'code'],
          gridConfig: {
            selModel: PFPopup.getCheckboxModel(multi, readOnly),
            renderTo: '.product-template-popup-grid',
            columns: [
              { text: bxMsg('pdTmpltCd'), width: 80, dataIndex: 'code' },
              { text: bxMsg('pdTmpltNm'), flex: 1, dataIndex: 'name' },
            ],
          },
        });

        // set first category select
        const firstCategoryOptions = [];
        firstCategoryOptions.push($('<option>'));
        const target = (function () {
          return {
            '01': codeArrayObj.ProductCategoryLevelOneCode,
            '02': codeArrayObj.ServiceCategoryLevelOneCode,
            '03': codeArrayObj.PointCategoryLevelOneCode,
          };
        }())[pdInfoDscd];
        target.forEach((category) => {
          const $option = $('<option>');
          $option.val(category.code);
          $option.text(category.name);
          firstCategoryOptions.push($option);
        });
        $('.first-category-select').html(firstCategoryOptions);
      },
    },
  });
};


/**
 * Product template
 * @typedef {Object} ProductTemplate
 * @property {String} id Product template id.
 * @property {String} code Product template code.
 * @property {String} name Product template name.
 */


/**
 * @callback PFPopup~productTemplateCallback
 * @param {ProductTemplate|ProductTemplate[]} result Selected result(s) of product template,
 *     according to config.multi option.
 */
