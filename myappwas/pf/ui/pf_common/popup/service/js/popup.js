/**
 * @fileOverview - Common popups related to service. Branched from pf-popup.js
 * @author Choi Junhyeok
 */


/**
 * Select service.
 * @param {Object} config
 * @param {boolean} [config.multi=false] Allow multi select.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=bxMsg('serviceSearch')] Title of popup.
 * @param {PFPopup~serviceCallback} callback The callback that handles the response.
 */
PFPopup.selectService = function ({
  multi = false,
  readOnly = false,
  title = bxMsg('serviceSearch'),
}, callback = function () {}) {
  const popupTpl = PFPopup.getPopupTemplate('service');
  let grid;

  function search() {
    const requestParam = {
      productStatusCode: '04',
      pdInfoDscd: '02', // 02.서비스
      tntInstId: getLoginTntInstId(),
      // OHS 2017.02.28 추가 - 서비스유형을 선택하지않아도 조회되도록 수정
      businessDistinctionCode: codeArrayObj.ServiceCategoryLevelOneCode[0].code, // '31'
      productTypeCode: $('.service-type-select').val(),
    };

    PFRequest.get('/product/queryProductBaseForList.json', requestParam, {
      success(responseData) {
        grid.setData(responseData);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'PdService',
        operation: 'queryListPd',
      },
    });
  }

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
        search();
      },
    },
    listeners: {
      afterSyncUI() {
        const firstCategoryId = codeArrayObj.ServiceCategoryLevelOneCode[0].code; // '31'

        if (firstCategoryId) {
          const secondCategoryOptions = [];
          secondCategoryOptions.push($('<option>'));

          const requestParam = {
            idType: '04',
            treeType: 'ST',
            id: firstCategoryId,
            pdInfoDscd: '02', // 02 :서비스
          };
          PFRequest.get('/catalog/getCatalog.json', requestParam, {
            success(responseDate) {
              responseDate.childCatalogs.forEach((category) => {
                const $option = $('<option>');
                $option.val(category.id.substr(3, 4));
                $option.text(category.name);
                secondCategoryOptions.push($option);
              });
              $('.service-type-select').html(secondCategoryOptions);
            },
            bxmHeader: {
              application: 'PF_Factory',
              service: 'CatalogService',
              operation: 'queryCatalog',
            },
          });
        }

        grid = PFComponent.makeExtJSGrid({
          pageAble: true,
          fields: ['code', 'name'],
          gridConfig: {
            selModel: PFPopup.getCheckboxModel(multi, readOnly),
            renderTo: '.service-grid',
            columns: [
              { text: bxMsg('ServiceCode'), flex: 1, dataIndex: 'code' },
              { text: bxMsg('ServiceName'), flex: 1, dataIndex: 'name' },
            ],
          },
        });
        search();
      },
    },
  });
};


/**
 * Service
 * @typedef {Object} Service
 * @property {String} code Service code.
 * @property {String} name Service name.
 */


/**
 * @callback PFPopup~serviceCallback
 * @param {Service|Service[]} result - Selected result(s) of service,
 *     according to config.multi option.
 */
