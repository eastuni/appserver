/**
 * @fileOverview - Common popups related to condition group template. Branched from pf-popup.js
 * @author Choi Junhyeok
 */


/**
 * Select condition group template with popup.
 * @param {Object} config
 * @param {boolean} [config.multi=false] Allow multi select.
 * @param {boolean} [config.readOnly=false] Create popup as read-only mode.
 * @param {String} [config.title=bxMsg('MTP0103Title')] Title of popup.
 * @param {PFPopup~conditionGroupTemplateCallback} callback The callback that handles the response.
 */
PFPopup.selectConditionGroupTemplate = function ({
  multi = false,
  readOnly = false,
  title = bxMsg('MTP0103Title'),
}, callback = function () {}) {
  const popupTpl = PFPopup.getPopupTemplate('condition_group_template');
  let grid;

  function search(requestParam) {
    PFRequest.get('/conditionGroup/template/queryConditionGroupTemplateBaseForList.json', requestParam, {
      success(responseData) {
        $('.cnd-grp-tpl-popup .popup-cnd-tpl-grid').empty();
        grid = PFComponent.makeExtJSGrid({
          fields: ['name', 'code', 'type', 'isActive'],
          gridConfig: {
            selModel: PFPopup.getCheckboxModel(multi, readOnly),
            renderTo: '.popup-cnd-tpl-grid',
            columns: [
              { text: bxMsg('MTM0100String7'), flex: 1, dataIndex: 'code' },
              { text: bxMsg('MTM0100String8'), flex: 1, dataIndex: 'name' },
              {
                text: bxMsg('DPS0101String6'),
                width: 70,
                dataIndex: 'isActive',
                renderer(value) {
                  return bxMsg(value === 'Y' ? 'active' : 'inactive');
                },
              },
            ],
          },
        });
        grid.setData(responseData);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'CndGroupTemplateService',
        operation: 'queryListCndGroupTemplate',
      },
    });
  }

  PFComponent.makePopup({
    title,
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
      'click .cnd-tpl-search': function () {
        const requestParam = {
          conditionGroupTemplateTypeCode: '01',
          conditionGroupTemplateName: $('.cnd-grp-tpl-popup .cnd-name-search').val(),
          likeQueryYn: 'Y',
        };
        search(requestParam);
      },
    },
    listeners: {
      afterRenderUI() {
        const requestParam = {
          conditionGroupTemplateTypeCode: '01',
          likeQueryYn: 'Y',
        };
        search(requestParam);
      },
    },
  });
};


/**
 * Yes or No
 * @typedef YN
 * @enum
 * @value {'Y'} Yes
 * @value {'N'} No
 */

/**
 * Condition group template
 * @typedef {Object} ConditionGroupTemplate
 * @property {String} name - Instance code.
 * @property {String} code - Instance name.
 * @property {String} type - Instance name.
 * @property {String} isActive - Instance name.
 */


/**
 * @callback PFPopup~conditionGroupTemplateCallback
 * @param {ConditionGroupTemplate|ConditionGroupTemplate[]} result
 *     Selected result(s) of condition group template, according to config.multi option.
 */
