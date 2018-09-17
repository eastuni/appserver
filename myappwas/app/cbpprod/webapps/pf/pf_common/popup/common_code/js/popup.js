/**
 * @fileOverview Common popups related to common codes. Branched from pf-popup.js
 * @author Choi Junhyeok
 */


/**
 * Select common code with popup.
 * @param {Object} config
 * @param {boolean} [config.multi=false] Allow multi select.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=bxMsg('CommonCode') + bxMsg('ButtonBottomString4')]
 *     Title of popup.
 * @param {PFPopup~commonCodeCallback} callback The callback that handles the response.
 */
PFPopup.selectCommonCode = function ({
  multi = false,
  readOnly = false,
  title = bxMsg('CommonCode') + bxMsg('ButtonBottomString4'),
} = {}, callback = function () { }) {
  const popupTpl = PFPopup.getPopupTemplate('common_code');

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
        const requestParam = PFComponent.makeYGForm($('.common-code-search-popup table'))
          .getData();
        requestParam.activeYn = 'Y';

        PFRequest.get('/commonCode/getCommonCodeMasterList.json', requestParam, {
          success(responseData) {
            grid.setData(responseData);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CommonCodeMasterService',
            operation: 'queryListCommonCodeMaster',
          },
        });
      },
    },
    listeners: {
      afterRenderUI() {
        PFRequest.get('/commonCode/getCommonCodeMasterList.json', {
          activeYn: 'Y',
        }, {
          success(responseData) {
            grid = PFComponent.makeExtJSGrid({
              fields: [
                'domainCode', 'domainContent',
              ],
              gridConfig: {
                selModel: PFPopup.getCheckboxModel(multi, readOnly),
                renderTo: '.common-code-search-popup .common-code-list-grid',
                columns: [{
                  text: bxMsg('DomainCode'),
                  flex: 1,
                  dataIndex: 'domainCode',
                  sortable: false,
                },
                {
                  text: bxMsg('DomainContent'),
                  flex: 2,
                  dataIndex: 'domainContent',
                  sortable: false,
                },
                ],
              },
            });
            grid.setData(responseData);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CommonCodeMasterService',
            operation: 'queryListCommonCodeMaster',
          },
        });
      },
    },
  });
};


/**
 * Select common code detail with popup.
 * @param {Object} config
 * @param {String} config.code - common code.
 * @param {String} [config.codeNm] - common code name.
 * @param {boolean} [config.multi=false] - Allow multi select.
 * @param {boolean} [config.readOnly=false] - Create popup as read-only mode.
 * @param {String} [config.title=codeNm + bxMsg('ButtonBottomString4')] Title of popup.
 * @param {PFPopup~commonCodeDetailCallback} callback - The callback that handles the response.
 */
PFPopup.selectCommonCodeDetail = function ({
  code = '',
  codeNm = bxMsg('DomainCodeDetail'),
  multi = false,
  readOnly = false,
  title,
} = {}, callback = function () {}) {
  const defaultTitle = title || codeNm + bxMsg('ButtonBottomString4');
  const popupTpl = PFPopup.getPopupTemplate('common_code', 'detailTpl');
  let grid;
  PFComponent.makePopup({
    title: defaultTitle,
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
    listeners: {
      afterRenderUI() {
        PFRequest.get('/commonCode/getCommonCodeDetailList.json', {
          activeYn: 'Y',
          domainCode: code,
        }, {
          success(responseData) {
            grid = PFComponent.makeExtJSGrid({
              fields: [
                'instanceCode', 'instanceName',
              ],
              gridConfig: {
                selModel: PFPopup.getCheckboxModel(multi, readOnly),
                renderTo: '.common-code-detail-search-popup .common-code-detail-list-grid',
                columns: [{
                  text: bxMsg('InstanceCode'),
                  flex: 1,
                  dataIndex: 'instanceCode',
                  sortable: false,
                },
                {
                  text: bxMsg('InstanceCodeName'),
                  flex: 2,
                  dataIndex: 'instanceName',
                  sortable: false,
                },
                ],
              },
            });
            grid.setData(responseData);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CommonCodeDetailService',
            operation: 'queryListCommonCodeDetail',
          },
        });
      },
    },
  });
};


/**
 * Select common code detail by multi with popup.
 * @param {Object} config
 * @param {String} config.code - common code.
 * @param {String} [config.codeNm] - common code name.
 * @param {boolean} [config.readOnly=false] - Create popup as read-only mode.
 * @param {String} [config.title=codeNm + bxMsg('ButtonBottomString4')] Title of popup.
 * @param {PFPopup~commonCodeDetailCallback} callback - The callback that handles the response.
 */
PFPopup.selectCommonCodeDetailByMulti = function ({
  code,
  codeNm = bxMsg('DomainCodeDetail'),
  readOnly = false,
  title,
} = {}, callback = function () { }) {
  const defaultTitle = title || codeNm + bxMsg('ButtonBottomString4');
  const popupTpl = PFPopup.getPopupTemplate('common_code', 'detailMultiTpl');
  let grid;
  PFComponent.makePopup({
    title: defaultTitle,
    contents: popupTpl(),
    width: 500,
    height: 350,
    buttons: readOnly ? [] : [{
      text: bxMsg('Z_OK'),
      elCls: 'button button-primary',
      handler() {
        const selectedItem = grid.getSelectedItem();
        const merchantRelCode = $('.common-code-detail-search-popup').find('.merchantRelType').val(); // 업종관계유형
        const aplyStartDate = $('.common-code-detail-search-popup').find('.calendar.start-date').val();
        const endDate = $('.common-code-detail-search-popup').find('.calendar.end-date').val();

        if (selectedItem.length === 0) {
        // 대상을 선택해주세요
          PFComponent.showMessage(bxMsg('Z_TargetSelect'), 'warning');
          return;
        }

        callback(selectedItem, {
          merchantRelCode,
          aplyStartDate,
          endDate,
        });
        this.close();
      },
    }],
    submit() {
    },
    listeners: {
      afterRenderUI() {
        // 가맹점관계유형 콤보조립
    	// OHS 20180213 수정 - default value '01' 추가 
    	PFUtil.renderComboBox('BnftMrchntRelTypeCode', $('.common-code-detail-search-popup').find('.merchantRelType'), '01');

        // 적용시작일,적용종료일 달력적용
        // OHS 20180213 수정 - selector 수정
        PFUtil.getDatePicker(true, $('.common-code-detail-search-popup'));
        PFUtil.getDatePicker(true, $('.common-code-detail-search-popup'));
        $('.common-code-detail-search-popup').find('.calendar.start-date').val(`${PFUtil.getToday()} 00:00:00`);
        $('.common-code-detail-search-popup').find('.calendar.end-date').val('9999-12-31 23:59:59');

        PFRequest.get('/commonCode/getCommonCodeDetailList.json', {
          activeYn: 'Y',
          domainCode: code,
        }, {
          success(responseData) {
            grid = PFComponent.makeExtJSGrid({
              fields: [
                'instanceCode', 'instanceName',
              ],
              gridConfig: {
                selModel: PFPopup.getCheckboxModel(true, readOnly),
                renderTo: '.common-code-detail-search-popup .common-code-detail-list-grid',
                columns: [{
                  text: bxMsg('InstanceCode'),
                  flex: 1,
                  dataIndex: 'instanceCode',
                  sortable: false,
                },
                {
                  text: bxMsg('InstanceCodeName'),
                  flex: 2,
                  dataIndex: 'instanceName',
                  sortable: false,
                },
                ],
              },
            });
            grid.setData(responseData);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CommonCodeDetailService',
            operation: 'queryListCommonCodeDetail',
          },
        });
      },
    },
  });
};


/**
 * Common code
 * @typedef {Object} CommonCode
 * @property {String} domainCode Domain code.
 * @property {String} domainContent Domain content.
 */

/**
 * Common code detail
 * @typedef {Object} CommonCodeDetail
 * @property {String} instanceCode Instance code.
 * @property {String} instanceName Instance name.
 */


/**
 * @callback PFPopup~commonCodeCallback
 * @param {CommonCode|CommonCode[]} result Selected result(s) of common code,
 *     according to config.multi option.
 */

/**
 * @callback PFPopup~commonCodeDetailCallback
 * @param {CommonCodeDetail|CommonCodeDetail[]} result Selected result(s) of common code detail,
 *     according to config.multi option.
 */
