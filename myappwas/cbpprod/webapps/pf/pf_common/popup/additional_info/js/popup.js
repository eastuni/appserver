/**
 * @fileOverview Common popups related to additional information
 *     of provide condition. Branched from pf-popup.js
 * @author Choi Junhyeok
 */

/**
 * Select provide condition additional information with popup.
 * @param {Object} config
 * @param {ProvideCondition} config.data Provide condition.
 * @param {boolean} [config.multi=false] Allow multi select.
 * @param {boolean} [config.readOnly=false] Render read-only popup.
 * @param {String} [config.title=bxMsg('DPM10002Sring8')] Title of popup.
 * @param {PFPopup~additionalInfoCallback} callback The callback that handles the response.
 */
PFPopup.selectAdditionalInfo = function ({
  data = {},
  multi = false,
  readOnly = false,
  title = bxMsg('DPM10002Sring8'), // 부가정보
} = {}, callback = function () { }) {
  const popupTpl = PFPopup.getPopupTemplate('additional_info');

  let grid;
  PFComponent.makePopup({
    title,
    contents: popupTpl(data),
    width: 600,
    height: 330,
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
      'click .product-add-btn': function () {
        PFPopup.selectProduct({ multi: true }, (resultList) => {
          resultList.forEach((el) => {
            grid.addData({
              provideCndSequenceNumber: data.providedConditionSequenceNumber,
              applyStartDate: data.applyStartDate,
              additionalInfoTypeDscd: '01', // 상품
              additionalInfoValue: el.code,
              additionalInfoValueName: el.name,
            });
          });
        });
      },
    },
    listeners: {
      afterRenderUI() {
        const columns = [
          {
            text: bxMsg('PAS0102String10'),
            flex: 1,
            dataIndex: 'additionalInfoTypeDscd',
            style: 'text-align:center',
            renderer(value) {
              return codeMapObj.AdtnlInfoTpDscd[value] || value;
            },
            editor: {
              xtype: 'combo',
              typeAhead: true,
              triggerAction: 'all',
              displayField: 'name',
              valueField: 'code',
              editable: false,
              store: new Ext.data.Store({
                fields: ['code', 'name'],
                data: codeArrayObj.AdtnlInfoTpDscd,
              }),
            },
          },
          {
            text: bxMsg('PAS0203String3'),
            flex: 5,
            dataIndex: 'content',
            sortable: false,
            style: 'text-align:center',
          },
        ];

        if (!readOnly) {
          columns.push({
            xtype: 'actioncolumn',
            width: 35,
            align: 'center',
            items: [{
              icon: '/images/x-delete-16.png',
              handler(value, rowIndex, colIndex, item, e, record) {
                record.destroy();
              },
            }],
          });
        }

        grid = PFComponent.makeExtJSGrid({
          fields: [
            'provideCndSequenceNumber', 'additionalInfoTypeDscd', 'additionalInfoValue', 'additionalInfoValueName',
            'applyStartDate',
            {
              name: 'content',
              convert(newValue, record) {
                return `${record.get('additionalInfoValue')}(${record.get('additionalInfoValueName')})`;
              },
            },
          ],
          gridConfig: {
            selModel: PFPopup.getCheckboxModel(multi, readOnly),
            renderTo: '.prov-cnd-add-info-popup .prov-cnd-add-info-list-grid',
            columns,
          },
        });

        if (data.provideCndAdditionalInfoDetailList) {
          grid.setData(data.provideCndAdditionalInfoDetailList);
        }
      },
    },
  });
};


/**
 * Provide condition
 * @typedef {Object} ProvideCondition
 * @property {Object} providedConditionSequenceNumber Provide condition sequence number.
 * @property {Object} providedConditionCode Provide condition code.
 * @property {Object} providedConditionName Provide condition name.
 * @property {Object} applyStartDate Apply start date.
 * @property {Object} provideCndAdditionalInfoDetailList
 *     provide condition additional info detail list.
 */

/**
 * Additional information
 * @typedef {Object} AdditionalInfo
 * @property {String} provideCndSequenceNumber Provide condition sequence number.
 * @property {String} additionalInfoTypeDscd Additional information type dscd.
 * @property {String} additionalInfoValue Additional information value.
 * @property {String} additionalInfoValueName Additional information value name.
 * @property {String} applyStartDate Apply start date.
 */


/**
 * @callback PFPopup~additionalInfoCallback
 * @param {AdditionalInfo|AdditionalInfo[]} result Selected result(s) of additional information,
 *     according to config.multi option.
 */
