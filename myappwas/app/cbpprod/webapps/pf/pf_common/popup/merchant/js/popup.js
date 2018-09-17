/**
 * @fileOverview - Common popups related to merchant. Branched from pf-popup.js
 * @author Choi Junhyeok
 */


/**
 * Select merchant.
 * @param {Object} config
 * @param {boolean} [config.multi=false] Allow multi select.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=bxMsg('merchantSearch')] Title of popup.
 * @param {PFPopup~merchantCallback} callback - The callback that handles the response.
 */
PFPopup.selectMerchant = function ({
  multi = false,
  readOnly = false,
  title = bxMsg('merchantSearch'),
}, callback = function () {}) {
  const popupTpl = PFPopup.getPopupTemplate('merchant');

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
        const requestParam = PFComponent.makeYGForm($('.merchant-search-popup table')).getData();
        PFRequest.get('/merchant/getListMerchantMaster.json', requestParam, {
          success(responseData) {
            grid.setData(responseData);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'MerchantService',
            operation: 'queryList',
          },
        });
      },
    },
    listeners: {
      afterRenderUI() {
        PFRequest.get('/merchant/getListMerchantMaster.json', {}, {
          success(responseData) {
            grid = PFComponent.makeExtJSGrid({
              fields: [
                'merchantCode', 'merchantName',
                ],
                gridConfig: {
                  selModel: PFPopup.getCheckboxModel(multi, readOnly),
                  renderTo: '.merchant-search-popup .merchant-list-grid',
                  columns: [
                    {
                      text: bxMsg('merchantNo'),
                      flex: 1,
                      dataIndex: 'merchantCode',
                      sortable: false,
                      align: 'center',
                    },
                    {
                      text: bxMsg('merchantName'),
                      flex: 2,
                      dataIndex: 'merchantName',
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
            service: 'MerchantService',
            operation: 'queryList',
          },
        });
      },
    },
  });
};

/**
 * Select merchant 2.
 * @param {Object} config
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=`${bxMsg('MerchantGroup')}/${bxMsg('merchantSearch')}`]
 *     Title of popup.
 * @param {PFPopup~merchantCallback} callback - The callback that handles the response.
 */
PFPopup.selectMerchant2 = function ({
  readOnly = false,
  title = `${bxMsg('MerchantGroup')}/${bxMsg('merchantSearch')}`, // 가맹점그룹 / 가맹점조회
}, callback = function () {}) {
  const popupTpl = PFPopup.getPopupTemplate('merchant', 'multiTpl');

  let grid;
  PFComponent.makePopup({
    title,
    contents: popupTpl(),
    width: 700,
    height: 400,
    buttons: readOnly ? [] : [{
      text: bxMsg('Z_OK'),
      elCls: 'button button-primary',
      handler() {
        const merchantRelCode = $('.merchant-merchant-group-search-popup').find('.merchantRelType').val(); // 가맹점관계유형
        const merchantTypeCode = $('.merchant-merchant-group-search-popup').find('.merchantTypeDistinction').val(); // 가맹점유형구분
        const aplyStartDate = $('.merchant-merchant-group-search-popup').find('.calendar.start-date').val();
        const endDate = $('.merchant-merchant-group-search-popup').find('.calendar.end-date').val();
        if (grid) {
          callback(grid.getSelectedItem(), {
            merchantRelCode,
            merchantTypeCode,
            aplyStartDate,
            endDate,
          });
        }
        else {
    		var selectedItems = [];
    		var row = {
				pdMerchantRelCode : merchantRelCode,
				merchantTypeCode : merchantTypeCode,
				applyStart : aplyStartDate,
				applyEnd : endDate,
				process : 'C',
    			relationInformationStatus : '01'
    		}
    		selectedItems.push(row);
    		callback(selectedItems, {
    			merchantRelCode,
    			merchantTypeCode,
    			aplyStartDate,
    			endDate,
    		});
        }
        this.close();
      },
    }],
    contentsEvent: {
      'click .search-btn': function () {
        // 가맹점그룹
        if ($('.merchant-merchant-group-search-popup').find('.merchantTypeDistinction').val() === '02') {
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

        // 개별가맹점
        } else if ($('.merchant-merchant-group-search-popup').find('.merchantTypeDistinction').val() === '03') {
          const requestParam = PFComponent.makeYGForm($('.merchant-search-popup table')).getData();
          PFRequest.get('/merchant/getListMerchantMaster.json', requestParam, {
            success(responseData) {
              grid.setData(responseData);
            },
            bxmHeader: {
              application: 'PF_Factory',
              service: 'MerchantService',
              operation: 'queryList',
            },
          });
        }
      },
      'change .merchantTypeDistinction': function (e) {
        // 가맹점그룹
        if ($(e.currentTarget).val() === '02') {
          $('.merchant-group-search-popup .merchant-group-list-grid').empty();
          $('.merchant-merchant-group-search-popup').find('.merchant-group-search-popup').css('display', 'block');
          $('.merchant-merchant-group-search-popup').find('.merchant-search-popup').css('display', 'none');

          grid = PFComponent.makeExtJSGrid({
            fields: [
              'merchantGroupCode', 'merchantGroupName',
            ],
            gridConfig: {
              selModel: PFPopup.getCheckboxModel(true, readOnly),
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
        // 개별가맹점
        } else if ($(e.currentTarget).val() === '03') {
          $('.merchant-search-popup .merchant-list-grid').empty();
          $('.merchant-merchant-group-search-popup').find('.merchant-group-search-popup').css('display', 'none');
          $('.merchant-merchant-group-search-popup').find('.merchant-search-popup').css('display', 'block');

          grid = PFComponent.makeExtJSGrid({
            fields: [
              'merchantCode', 'merchantName',
            ],
            gridConfig: {
              selModel: PFPopup.getCheckboxModel(true, readOnly),
              renderTo: '.merchant-search-popup .merchant-list-grid',
              columns: [
                {
                  text: bxMsg('merchantNo'),
                  flex: 1,
                  dataIndex: 'merchantCode',
                  sortable: false,
                  align: 'center',
                },
                {
                  text: bxMsg('merchantName'),
                  flex: 2,
                  dataIndex: 'merchantName',
                  sortable: false,
                  style: 'text-align:center',
                },
              ],
            },
          });

        // 전가맹점은 보여주지않음
        } else {
          $('.merchant-search-popup .merchant-list-grid').empty();
          $('.merchant-merchant-group-search-popup').find('.merchant-group-search-popup').css('display', 'none');
          $('.merchant-merchant-group-search-popup').find('.merchant-search-popup').css('display', 'none');
        }
      },
    },
    listeners: {
      afterRenderUI() {
        // 가맹점관계유형 콤보조립
        PFUtil.renderComboBox('BnftMrchntRelTypeCode', $('.merchant-merchant-group-search-popup').find('.merchantRelType'), '01');
        // 가맹점유형구분
        PFUtil.renderComboBox('merchantTypeDistinction', $('.merchant-merchant-group-search-popup').find('.merchantTypeDistinction'), '01');

        // 적용시작일,적용종료일 달력적용
        // OHS 20180213 수정 - selector 수정
        PFUtil.getDatePicker(true, $('.merchant-merchant-group-search-popup'));
        PFUtil.getDatePicker(true, $('.merchant-merchant-group-search-popup'));
        $('.merchant-merchant-group-search-popup').find('.calendar.start-date').val(`${PFUtil.getToday()} 00:00:00`);
        $('.merchant-merchant-group-search-popup').find('.calendar.end-date').val('9999-12-31 23:59:59');
      },
    },
  });
};


/**
 * Merchant
 * @typedef {Object} Merchant
 * @property {String} merchantCode Merchant code.
 * @property {String} merchantName Merchant name.
 */


/**
 * @callback PFPopup~merchantCallback
 * @param {Merchant|Merchant[]} result Selected result(s) of merchant,
 *     according to config.multi option.
 */
