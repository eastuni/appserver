/**
 * @fileOverview Common popups related to product condition.
 * @author Choi Junhyeok
 */


/**
 * Select product condition with popup.
 * @param {Object} config
 * @param {String} [config.pdInfoDscd='01'] Product information dscd.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=bxMsg('selectCondition')]
 *     Title of popup.
 * @param {PFPopup~productConditionCallback} [config.callback]
 *     The callback that handles the response.
 */
PFPopup.selectProductCondition = function ({
  pdInfoDscd = '01',
  readOnly = false,
  title = bxMsg('selectCondition'),
  callback = function () {},
} = {}) {
  const popupTpl = PFPopup.getPopupTemplate('product_condition');

  const [code, name] = ({
    '01': [bxMsg('DPS0106String2'), bxMsg('pdNm')],
    '02': [bxMsg('ServiceCode'), bxMsg('ServiceName')],
    '03': [bxMsg('PointCode'), bxMsg('PointName')],
  })[pdInfoDscd];

  function queryProductBaseForList(item = {}, cb = function () {}) {
    const requestParam = Object.assign(item, {
      productStatusCode: '04',
      pdInfoDscd,
    });

    PFRequest.get('/product/queryProductBaseForList.json', requestParam, {
      success(responseData) {
        cb(responseData);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'PdService',
        operation: 'queryListPd',
      },
    });
  }

  function getProductConditionForList(product = {}, cb = function () {}) {
    const requestParam = {
      code: product.code,
      businessDistinctionCode: product.firstCatalogId,
      productTypeCode: product.secondCatalogId,
      productTemplateCode: product.productTemplateCode,
      pdInfoDscd,
    };

    PFRequest.get('/product_condition/getListProductCondition.json', requestParam, {
      success(responseData) {
        cb(responseData);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'PdCndService',
        operation: 'queryListPdCnd',
      },
    });
  }

  // attributes map for each condition type
  const attributes = {
    '01': ['listCode'], // 목록
    '02': ['minValue', 'maxValue', 'defaultValue'], // 범위
    '03': ['minValue', 'maxValue', 'defaultValue'], // 수수료
    '04': ['minValue', 'maxValue', 'defaultValue'], // 금리
  };

  const newStore = data => new Ext.data.Store({
    fields: ['code', 'name'],
    data: data.map(v => ({
      code: v,
      name: bxMsg(v),
    })),
  });

  const attributeStore = {
    '01': newStore(attributes['01']),
    '02': newStore(attributes['02']),
    '03': newStore(attributes['03']),
    '04': newStore(attributes['04']),
  };

  let productGrid;
  let conditionGrid;
  PFComponent.makePopup({
    title,
    contents: popupTpl(),
    width: 700,
    height: 460,
    useCurrentTaskIdConfirmYn: true,
    buttons: readOnly ? [] : [{
      text: bxMsg('Z_OK'),
      elCls: 'button button-primary write-btn select-product-condition-btn',
      handler() {
        const selected = conditionGrid.getSelectedItem();
        if (selected.length > 0 && selected[0].leaf) { // return one result
          if (selected[0].attribute) {
            callback(selected[0]);
            this.close();
          } else {
            PFComponent.showMessage(bxMsg('selectAttribute'), 'warning');
          }
        } else {
          PFComponent.showMessage(bxMsg('selectProductCondition'), 'warning');
        }
      },
    }],
    listeners: {
      afterSyncUI() {
        PFUtil.renderComboBox('ProductCategoryLevelOneCode', $('[data-form-param="businessDistinctionCode"]'), '01');
        $('[data-form-param="businessDistinctionCode"]').trigger('change');

        // 상품 그리드
        productGrid = PFComponent.makeExtJSGrid({
          pageAble: true,
          fields: ['code', 'name', 'fullPath', 'firstCatalogId', 'secondCatalogId', 'productTemplateCode'],
          gridConfig: {
            renderTo: '.product-grid',
            columns: [
              {
                text: code, width: 140, dataIndex: 'code', style: 'text-align: center',
              },
              {
                text: name, flex: 1, dataIndex: 'name', style: 'text-align: center',
              },
            ],
            listeners: {
              scope: this,
              cellclick: (_this, td, cellIndex, record) => {
                const productCode = record.get('code');
                getProductConditionForList(record.data, (cndList) => {
                  conditionGrid.setStoreRootNode(cndList.map(v => Object.assign(v, {
                    text: v.text.endsWith('*') ? v.text.substr(0, v.text.length - 1) : v.text,
                    children: v.children ?
                      v.children.map(c => Object.assign(c, {
                        productCode,
                        leaf: true,
                      })) : v.children,
                  })));
                });
              },
            },
          },
        });

        // 상품조건 그리드
        conditionGrid = PFComponent.makeExtTreeGrid({
          fields: ['text', 'attribute', 'productCode',
            {
              name: 'code',
              convert(newValue, record) {
                return record.get('id');
              },
            },
            {
              name: 'name',
              convert(newValue, record) {
                return record.get('text');
              },
            },
            {
              name: 'conditionValue',
              convert(newValue, record) {
                return record.raw;
              },
            },
          ],
          gridConfig: {
            renderTo: '.product-condition-grid',
            expanded: false,
            columns: [
              {
                xtype: 'treecolumn',
                text: bxMsg('code'),
                width: 90,
                dataIndex: 'code',
                style: 'text-align: center',
              },
              {
                text: bxMsg('name'),
                flex: 1,
                dataIndex: 'name',
                style: 'text-align: center',
              },
              {
                text: bxMsg('attribute'),
                width: 80,
                dataIndex: 'attribute',
                style: 'text-align: center',
                renderer(value) {
                  return value ? bxMsg(value) : null;
                },

                editor: {
                  xtype: 'combo',
                  typeAhead: true,
                  editable: false,
                  triggerAction: 'all',
                  displayField: 'name',
                  valueField: 'code',
                  emptyText: bxMsg('select'),
                  store: null,
                },
              },

            ],
            plugins: [
              Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1,
                listeners: {
                  beforeedit(e, editor) {
                    if (editor.record.get('leaf') && editor.field === 'attribute') {
                      const conditionValue = editor.record.get('conditionValue');
                      const type = conditionValue.conditionTypeCode;
                      editor.column.field.bindStore(attributeStore[type]);
                      return true;
                    }
                    return false;
                  },
                },
              }),
            ],
          },

        });
      },
    },
    contentsEvent: {
      'click .search-btn': () => {
        const form = PFComponent.makeYGForm($('.select-product-table'));
        queryProductBaseForList(form.getData(), (products) => {
          productGrid.setData(products);
        });
      },

      'keyup .product-name': (e) => {
        if (e.keyCode === '13') {
          $('.search-btn').click();
        }
      },

      'change .business-dscd': (e) => {
        const firstCategoryId = e.currentTarget.value;

        if (firstCategoryId) {
          const requestParam = {
            idType: '04',
            treeType: 'PD',
            id: firstCategoryId,
            pdInfoDscd,
          };

          PFRequest.get('/catalog/getCatalog.json', requestParam, {
            success(responseData) {
              $('[data-form-param="productTemplateCode"]').empty();
              if (responseData.childCatalogs) {
                const map = {};
                responseData.childCatalogs.forEach((category) => {
                  const cd = category.id.substr(3, 4);
                  map[cd] = category.name;
                });
                PFUtil.renderComboBox(map, '.product-type-code', null, true);
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

      'change .product-type-code': (e) => {
        const firstCategoryId = $('[data-form-param="businessDistinctionCode"]').val();
        const secondCategoryId = e.currentTarget.value;

        if (secondCategoryId) {
          const requestParam = {
            firstCatalogId: firstCategoryId,
            secondCatalogId: secondCategoryId,
            treeType: 'PD',
            id: secondCategoryId,
            pdInfoDscd,
          };

          PFRequest.get('/product/template/queryProductTemplateBaseForList.json', requestParam, {
            success(responseData) {
              if (responseData) {
                const map = {};
                responseData.forEach((template) => {
                  map[template.code] = template.name;
                  PFUtil.renderComboBox(map, '.product-template-code', null, true);
                });
              }
            },
            bxmHeader: {
              application: 'PF_Factory',
              service: 'PdTemplateService',
              operation: 'queryListPdTemplate',
            },
          });
        }
      },
    },
  });
};


/**
 * Product condition
 * @typedef {Object} ProductCondition
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
 * @callback PFPopup~productConditionCallback
 * @param {ProductCondition|ProductCondition[]} result
 *     Selected result(s) of product condition, according to config.multi option.
 */
