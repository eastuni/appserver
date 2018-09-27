/**
 * @fileOverview - Common popups related to product. Branched from pf-popup.js
 * @author Choi Junhyeok
 */


/**
 * Select product.
 * @param {Object} config
 * @param {String} [config.pdInfoDscd='01'] Product information dscd.
 * @param {boolean} [config.isSelectTemplate=false] Add *(whole template) to the list.
 * @param {boolean} [config.isSelectAllProduct=false] Add *(whole product) to the list.
 * @param {boolean} [config.selectAttribute=false] Select product attribute instead of product base.
 * @param {boolean} [config.multi=false] Allow multi select.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=(related to pdInfoDscd)] Title of popup.
 * @param {PFPopup~productCallback} callback The callback that handles the response.
 */
PFPopup.selectProduct = function ({
  pdInfoDscd = '01',
  isSelectTemplate = false,
  isSelectAllProduct = false,
  selectAttribute = false,
  multi = false,
  readOnly = false,
  title,
}, callback = function () {}) {
  let secondCategoryMap;
  let thirdCategoryMap;
  let grid;

  const [defaultTitle, code, name] = ({
    '01': [bxMsg('DPP0107Title'), bxMsg('DPS0106String2'), bxMsg('pdNm')],
    '02': [bxMsg('selectRelatedService'), bxMsg('ServiceCode'), bxMsg('ServiceName')],
    '03': [bxMsg('selectRelatedPoint'), bxMsg('PointCode'), bxMsg('PointName')],
  })[pdInfoDscd];
  const popupTpl = PFPopup.getPopupTemplate('product');

  const fields = ['code', 'name', 'fullPath', 'firstCatalogId', 'secondCatalogId', 'productTemplateCode'];
  const columns = [
    { text: code, flex: 1, dataIndex: 'code' },
    { text: name, flex: 1, dataIndex: 'name' },
  ];
  const plugins = [];

  if (selectAttribute) {
    const attributes = ['code', 'name'];

    fields.push('attribute');
    columns.push({
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
        store: new Ext.data.Store({
          fields: ['code', 'name'],
          data: attributes.map(v => ({
            code: v,
            name: bxMsg(v),
          })),
        }),
      },
    });

    plugins.push(Ext.create('Ext.grid.plugin.CellEditing', {
      clicksToEdit: 1,
      listeners: {
        beforeedit(e, editor) {
          return readOnly || editor.field === 'attribute';
        },
      },
    }));
  }

  function renderProductListGrid() {
    return PFComponent.makeExtJSGrid({
      pageAble: true,
      fields,
      gridConfig: {
        selModel: PFPopup.getCheckboxModel(multi, readOnly),
        renderTo: '.product-grid',
        columns,
        plugins,
      },
    });
  }

  PFComponent.makePopup({
    title: title || defaultTitle,
    contents: popupTpl(),
    width: 600,
    buttons: readOnly ? [] : [{
      text: bxMsg('Z_OK'),
      elCls: 'button button-primary',
      handler() {
        const selected = grid.getSelectedItem();
        let selectProduct = grid.getSelectedItem();
        let secondCategorySelect;
        let thirdCategorySelect;

        if (selectAttribute && !selectProduct[0].attribute) {
          PFComponent.showMessage(bxMsg('selectAttribute'), 'warning');
          return;
        }

        if (selectProduct.length === 0 && $('.second-category-select').val() !== null) {
          selectProduct = [];
          selectProduct.push({
            code: '*',
            name: '전체',
          });
        }

        if (!thirdCategoryMap && $('.third-category-select').val() === null) {
          thirdCategorySelect = null;
        } else {
          thirdCategorySelect = thirdCategoryMap[$('.third-category-select').val()];
        }

        if ($('.second-category-select').val() === null) {
          secondCategorySelect = null;
        } else {
          secondCategorySelect = secondCategoryMap[$('.second-category-select').val()];
        }

        if (multi) { // return multiple results
          callback(selectProduct, $('.first-category-select').val(), secondCategorySelect, thirdCategorySelect);
        } else if (selected.length > 0) { // return one result
          callback(selectProduct[0], $('.first-category-select').val(), secondCategorySelect, thirdCategorySelect);
        }
        this.close();
      },
    }],
    contentsEvent: {
      'click .search-btn': function () {
        if ($('.first-category-select').val() === '') {
          PFComponent.showMessage(bxMsg('mandatoryFirstCategory'), 'warning');
          $('.first-category-select').focus();
          return;
        }

        const form = PFComponent.makeYGForm($('.rel-product-search-form'));
        const requestParam = form.getData();
        requestParam.productStatusCode = '04';
        requestParam.pdInfoDscd = pdInfoDscd;

        PFRequest.get('/product/queryProductBaseForList.json', requestParam, {
          success(responseData) {
            const selectAll = [];
            if ($('.second-category-select').val() !== null && $('.second-category-select').val() !== '' && isSelectTemplate) {
              selectAll.push({
                code: '*',
                name: bxMsg('Z_All'),
              });
            }
            const gridData = selectAll.concat(responseData || []);
            grid.setData(gridData);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'PdService',
            operation: 'queryListPd',
          },
        });
      },
    },
    listeners: {
      afterRenderUI() {
        let firstCategoryId;

        // set first category select
        const firstCategoryOptions = [];
        firstCategoryOptions.push($('<option>'));

        if (pdInfoDscd === '01') {
          $.each(codeArrayObj.ProductCategoryLevelOneCode, (index, category) => {
            const $option = $('<option>');
            $option.val(category.code);
            $option.text(category.name);
            firstCategoryOptions.push($option);
          });
        } else if (pdInfoDscd === '02') {
          $.each(codeArrayObj.ServiceCategoryLevelOneCode, (index, category) => {
            const $option = $('<option>');
            $option.val(category.code);
            $option.text(category.name);
            firstCategoryOptions.push($option);
          });
        } else if (pdInfoDscd === '03') {
          $.each(codeArrayObj.PointCategoryLevelOneCode, (index, category) => {
            const $option = $('<option>');
            $option.val(category.code);
            $option.text(category.name);
            firstCategoryOptions.push($option);
          });
        }
        $('.first-category-select').html(firstCategoryOptions);
        // set second category select
        $('.first-category-select').change((e) => {
          firstCategoryId = $(e.currentTarget).val();

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
                secondCategoryMap = {};
                const map = {};
                (responseData.childCatalogs || []).forEach((category) => {
                  const cd = category.id.substr(3, 4);
                  // OHS20180209 추가 - code값을 세팅
                  category.code = cd;
                  secondCategoryMap[cd] = category;
                  map[cd] = category.name;
                });
                PFUtil.renderComboBox(map, '.second-category-select', null, true);
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'CatalogService',
                operation: 'queryCatalog',
              },
            });
          }
        });


        // set third category select
        $('.second-category-select').change((e) => {
          $('.third-category-select').empty();

          const selectSecondCategoryId = $(e.currentTarget).val();

          if (selectSecondCategoryId !== '') {
            const requestParam = {
              firstCatalogId: firstCategoryId,
              secondCatalogId: selectSecondCategoryId,
              treeType: 'PD',
              id: selectSecondCategoryId,
              pdInfoDscd, // 상품
            };

            const thirdCategoryOptions = [];
            thirdCategoryOptions.push($('<option>'));

            PFRequest.get('/product/template/queryProductTemplateBaseForList.json', requestParam, {
              success(responseData) {
                thirdCategoryMap = {};
                $.each(responseData || [], (index, tamplate) => {
                  thirdCategoryMap[tamplate.code] = tamplate;

                  const $option = $('<option>');
                  $option.val(tamplate.code);
                  $option.text(tamplate.name);
                  thirdCategoryOptions.push($option);
                });
                $('.third-category-select').html(thirdCategoryOptions);
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'PdTemplateService',
                operation: 'queryListPdTemplate',
              },
            });
          }
        });
        grid = renderProductListGrid();
        if (isSelectAllProduct) {
          const temp = {
            code: '**',
            name: bxMsg('allProduct'),
          };
          grid.addData(temp);
        }
      },
    },
  });
};


/**
 * Select product by multi.
 * @param {Object} config
 * @param {String} [config.pdInfoDscd='01'] Product information dscd.
 * @param {boolean} [config.isSelectTemplate=false] Add *(whole template) to the list.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=(related to pdInfoDscd)] Title of popup.
 * @param {PFPopup~productCallback} callback The callback that handles the response.
 */
PFPopup.selectProductByMulti = function ({
  pdInfoDscd = '01',
  isSelectTemplate = false,
  readOnly = false,
  title,
}, callback = function () {}) {
  const popupTpl = PFPopup.getPopupTemplate('product', 'multiTpl');
  let secondCategoryMap;
  let thirdCategoryMap;
  let grid;

  const [defaultTitle, code, name] = (function () {
    return {
      '01': [bxMsg('DPP0107Title'), bxMsg('DPS0106String2'), bxMsg('pdNm')],
      '02': [bxMsg('selectRelatedService'), bxMsg('ServiceCode'), bxMsg('ServiceName')],
      '03': [bxMsg('selectRelatedPoint'), ('PointCode'), bxMsg('PointName')],
    };
  }())[pdInfoDscd];

  function renderProductListGrid() {
    return PFComponent.makeExtJSGrid({
      pageAble: true,
      fields: ['code', 'name', 'fullPath', 'firstCatalogId', 'secondCatalogId', 'productTemplateCode'],
      gridConfig: {
        selModel: PFPopup.getCheckboxModel(true, readOnly),
        renderTo: '.product-grid',
        columns: [
          { text: code, flex: 1, dataIndex: 'code' },
          { text: name, flex: 1, dataIndex: 'name' },
        ],
      },
    });
  }

  PFComponent.makePopup({
    title: title || defaultTitle,
    contents: popupTpl(),
    width: 700,
    height: 430,
    buttons: readOnly ? [] : [{
      text: bxMsg('Z_OK'),
      elCls: 'button button-primary',
      handler() {
        const secondCategorySelect = $('.second-category-select').val();
        const thirdCategorySelect = $('.third-category-select').val();

        let selectProduct = grid.getSelectedItem();
        if (selectProduct.length === 0) {
          if (secondCategorySelect) {
            selectProduct = [{
              code: '*',
              name: '전체',
            }];
          } else {
          // 대상을 선택해주세요
            PFComponent.showMessage(bxMsg('Z_TargetSelect'), 'warning');
            return;
          }
        }

        const firstCategory = $('.first-category-select').val();
        const secondCategory = secondCategorySelect != null
          ? secondCategoryMap[secondCategorySelect] : null;
        const thirdCategory = thirdCategorySelect != null
          ? thirdCategoryMap[thirdCategorySelect] : null;
        const serviceRelationTypeCode = $('.rel-service-fixed-input-form').find('.serviceRelationTypeCode').val();
        const aplyStartDate = $('.rel-service-fixed-input-form').find('.calendar.start-date').val();
        const endDate = $('.rel-service-fixed-input-form').find('.calendar.end-date').val();

        if (grid) {
          callback(selectProduct, {
            firstCategory,
            secondCategory,
            thirdCategory,
            serviceRelationTypeCode,
            aplyStartDate,
            endDate,
          });
        }
        this.close();
      },
    }],
    contentsEvent: {
      'click .search-btn': function () {
        if ($('.first-category-select').val() === '') {
          PFComponent.showMessage(bxMsg('mandatoryFirstCategory'), 'warning');
          $('.first-category-select').focus();
          return;
        }

        const form = PFComponent.makeYGForm($('.rel-product-search-form'));
        const requestParam = form.getData();
        requestParam.productStatusCode = '04';
        requestParam.pdInfoDscd = pdInfoDscd; // 상품

        PFRequest.get('/product/queryProductBaseForList.json', requestParam, {
          success(responseData) {
            const selectAll = [];
            if ($('.second-category-select').val() !== null && $('.second-category-select').val() !== '' && isSelectTemplate) {
              const temp = {
                code: '*',
                name: bxMsg('Z_All'),
              };
              selectAll.push(temp);
            }
            const gridData = selectAll.concat(responseData || []);

            grid.setData(gridData);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'PdService',
            operation: 'queryListPd',
          },
        });
      },
    },
    listeners: {
      afterRenderUI() {
        let firstCategoryId;

        // set first category select
        const firstCategoryOptions = [];
        firstCategoryOptions.push($('<option>'));

        if (pdInfoDscd === '01') {
          $.each(codeArrayObj.ProductCategoryLevelOneCode, (index, category) => {
            const $option = $('<option>');
            $option.val(category.code);
            $option.text(category.name);
            firstCategoryOptions.push($option);
          });
        } else if (pdInfoDscd === '02') {
          $.each(codeArrayObj.ServiceCategoryLevelOneCode, (index, category) => {
            const $option = $('<option>');
            $option.val(category.code);
            $option.text(category.name);
            firstCategoryOptions.push($option);
          });

          // 관계유형 콤보조립
          PFUtil.renderComboBox('ServiceRelationTypeCode', $('.rel-service-fixed-input-form').find('.serviceRelationTypeCode'), '01');

          // 적용시작일,적용종료일 달력적용
          // OHS 20180213 수정 - selector 수정 기존 : $('.rel-service-fixed-input-form').find('.calendar.end-date')
          PFUtil.getDatePicker(true, $('.rel-service-fixed-input-form'));
          PFUtil.getDatePicker(true, $('.rel-service-fixed-input-form'));
          $('.rel-service-fixed-input-form').find('.calendar.start-date').val(`${PFUtil.getToday()} 00:00:00`);
          $('.rel-service-fixed-input-form').find('.calendar.end-date').val('9999-12-31 23:59:59');
        }

        // 포인트
        if (pdInfoDscd === '03') {
          // 포인트-상품 관계
          if (pdInfoDscd === '01') {
            $.each(codeArrayObj.ProductCategoryLevelOneCode, (index, category) => {
              const $option = $('<option>');
              $option.val(category.code);
              $option.text(category.name);
              firstCategoryOptions.push($option);
            });

            // 관계유형 콤보조립
            PFUtil.renderComboBox('PointProductRelTypeCode', $('.rel-service-fixed-input-form').find('.serviceRelationTypeCode'));

            // 적용시작일,적용종료일 달력적용
            // OHS 20180213 수정 - selector 수정 기존 : $('.rel-service-fixed-input-form').find('.calendar.end-date')
            PFUtil.getDatePicker(true, $('.rel-service-fixed-input-form'));
            PFUtil.getDatePicker(true, $('.rel-service-fixed-input-form'));
            $('.rel-service-fixed-input-form').find('.calendar.start-date').val(`${PFUtil.getToday()} 00:00:00`);
            $('.rel-service-fixed-input-form').find('.calendar.end-date').val('9999-12-31 23:59:59');
          }
        }

        $('.first-category-select').html(firstCategoryOptions);
        // set second category select
        $('.first-category-select').change((e) => {
          firstCategoryId = $(e.currentTarget).val();

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
                secondCategoryMap = {};
                const map = {};
                (responseData.childCatalogs || []).forEach((category) => {
                  const cd = category.id.substr(3, 4);
                  secondCategoryMap[cd] = category;
                  map[cd] = category.name;
                });
                PFUtil.renderComboBox(map, '.second-category-select', null, true);
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'CatalogService',
                operation: 'queryCatalog',
              },
            });
          }
        });


        // set third category select
        $('.second-category-select').change((e) => {
          $('.third-category-select').empty();

          const selectSecondCategoryId = $(e.currentTarget).val();

          if (selectSecondCategoryId !== '') {
            const requestParam = {
              firstCatalogId: firstCategoryId,
              secondCatalogId: selectSecondCategoryId,
              treeType: 'PD',
              id: selectSecondCategoryId,
              pdInfoDscd, // 상품
            };

            const thirdCategoryOptions = [];
            thirdCategoryOptions.push($('<option>'));

            PFRequest.get('/product/template/queryProductTemplateBaseForList.json', requestParam, {
              success(responseData) {
                thirdCategoryMap = {};
                $.each(responseData || [], (index, tamplate) => {
                  thirdCategoryMap[tamplate.code] = tamplate;

                  const $option = $('<option>');
                  $option.val(tamplate.code);
                  $option.text(tamplate.name);
                  thirdCategoryOptions.push($option);
                });
                $('.third-category-select').html(thirdCategoryOptions);
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'PdTemplateService',
                operation: 'queryListPdTemplate',
              },
            });
          }
        });
        grid = renderProductListGrid();
      },
    },
  });
};


/**
 * Product
 * @typedef {Object} Product
 * @property {String} code Product code.
 * @property {String} name Product name.
 * @property {String} firstCatalogId Product information dscd.
 * @property {String} secondCatalogId Product type.
 * @property {String} productTemplateCode Product template code.
 * @property {String} fullPath Product full path.
 */


/**
 * @callback PFPopup~productCallback
 * @param {Product|Product[]} result Selected result(s) of product,
 *     according to config.multi option.
 */
