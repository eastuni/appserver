const bxMsg = parent.bxMsg;
const PFPopup = parent.PFPopup;
const PFUtil = parent.PFUtil;
const PFRequest = parent.PFRequest;

// summernote plugin for PF
class pf {
  constructor(context) {
    this.context = context;
    const ui = $.summernote.ui;
    const options = context.options;
    
    // toolbar button
    context.memo('button.pf', () => {
      return ui.buttonGroup([
        ui.button({
          className: 'dropdown-toggle',
          contents: ui.dropdownButtonContents('<span class="pf-tool">PF</span>', options),
          tooltip: bxMsg('productRelatedInformation'),
          data: {
            toggle: 'dropdown',
          },
        }),
        ui.dropdown({
          className: 'dropdown-pf',
          checkClassName: options.icons.menuCheck,
          template: (item) => bxMsg(item),
          items: ['product', 'productCondition'],
          click: (e) => {
            const type = e.target.getAttribute('data-value');
            switch (type) {
              case 'product':
                PFPopup.selectProduct({ selectAttribute: true }, (pd) => {
                  this.insertPFInfo(type, pd.code, pd.attribute);
                });
                break;

              case 'productCondition':
                PFPopup.selectProductCondition({
                  callback: (pdCnd) => {
                    const pdCd = pdCnd.productCode || '';
                    const cndCd = pdCnd.code || '';
                    const cndGrpTmpltCd = pdCnd.conditionValue.conditionGroupTemplateCode || '';
                    const cndGrpCd = pdCnd.conditionValue.conditionGroupCode || '';
                    this.insertPFInfo(type, `${pdCd}@${cndCd}@${cndGrpTmpltCd}@${cndGrpCd}`, pdCnd.attribute);
                  },
                });
                break;

              default:
                break;
            }
          },
        }),
      ]).render();
    });
  }
  
  insertPFInfo(type, value, attr) {
    const prop = attr ? `.${attr}` : '';
    this.context.invoke('editor.insertText', `\$PF{${type}${prop}:${value}}`);
  }
}

class pftpl {
  constructor(context) {
    this.context = context;
    const ui = $.summernote.ui;
    const options = context.options;
    
    let templates;
    PFRequest.get('/eav/getEAVObjectValueDetailInfoList.json', {objectId: 'docTpl'}, {
      success: function (responseData) {
        templates = responseData.voList.map(v => ({
          option: v.atrbtNm,
          value: escape(v.atrbtVal),
        }));
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'EAVService',
        operation: 'getEAVObjectValueDetailInfoList'
      },
      async: false,
    });
    
    context.memo('button.pftpl', () => {
      return ui.buttonGroup([
        ui.button({
          className: 'dropdown-toggle',
          contents: ui.dropdownButtonContents(ui.icon('i-mng-template'), options),
          tooltip: bxMsg('documentTemplate'),
          data: {
            toggle: 'dropdown',
          },
        }),
        ui.dropdown({
          className: 'dropdown-pf-template',
          checkClassName: options.icons.menuCheck,
          template: (item) => item.option,
          items: [{option: bxMsg('none')}, ...templates],
          click: (e) => {
            const template = unescape(e.target.getAttribute('data-value'));

            context.invoke('editor.empty');
            if (template) {
              context.code(template);
            }
          },
        }),
      ]).render();
    });
  }
  
}

$.extend($.summernote.plugins, {
  'pf': pf,
  'pftpl': pftpl,
});