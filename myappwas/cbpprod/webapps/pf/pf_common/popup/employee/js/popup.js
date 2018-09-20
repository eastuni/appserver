/**
 * @fileOverview - Common popups related to employee. Branched from pf-popup.js
 * @author Choi Junhyeok
 */


/**
 * Select employee.
 * @param {Object} config
 * @param {boolean} [config.multi=false] Allow multi select.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=bxMsg('employeeSearch')] Title of popup.
 * @param {PFPopup~employeeCallback} callback The callback that handles the response.
 */
PFPopup.selectEmployee = function ({
  multi = false,
  readOnly = false,
  title = bxMsg('employeeSearch'),
}, callback = function () {}) {
  const popupTpl = PFPopup.getPopupTemplate('employee');
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
        } else { callback() }
        this.close();
      },
    }],
    contentsEvent: {
      'click .search-btn': function () {
        const requestParam = PFComponent.makeYGForm($('.employee-search-popup table')).getData();
        PFRequest.get('/common/queryUserInfoForList.json', requestParam, {
          success(responseData) {
            grid.setData(responseData);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CommonService',
            operation: 'queryListUserInfo',
          },
        });
      },
    },
    listeners: {
      afterRenderUI() {
        PFRequest.get('/common/queryUserInfoForList.json', {}, {
          success(responseData) {
            grid = PFComponent.makeExtJSGrid({
              fields: [
                'staffId', 'staffName',
              ],
              gridConfig: {
                selModel: PFPopup.getCheckboxModel(multi, readOnly),
                renderTo: '.employee-search-popup .employee-list-grid',
                columns: [
                  {
                    text: bxMsg('employeeNumber'),
                    flex: 1,
                    dataIndex: 'staffId',
                    sortable: false,
                    align: 'center',
                  },
                  {
                    text: bxMsg('employeeName'),
                    flex: 1,
                    dataIndex: 'staffName',
                    sortable: false,
                    align: 'center',
                  },
                ],
              },
            });
            grid.setData(responseData);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CommonService',
            operation: 'queryListUserInfo',
          },
        });
      },
    },
  });
};


/**
 * Employee
 * @typedef {Object} Employee
 * @property {String} staffId Staff ID.
 * @property {String} staffName - Staff name.
 */


/**
 * @callback PFPopup~employeeCallback
 * @param {Employee|Employee[]} result - Selected result(s) of employee,
 *     according to config.multi option.
 */
