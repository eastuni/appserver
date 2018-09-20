const cndTplPopupTpl = getTemplate('cndTplPopupTpl');
function renderConditionTemplatePopup() {
  var cndPopupGrid;

  PFComponent.makePopup({
    title: bxMsg('MTP0103Title'),
    width: 500,
    height: 330,
    contents: cndTplPopupTpl(),
    submit: function() {
      var selectedData = cndPopupGrid.getSelectedRecords(),
      selectedDataArr = [];

      var today = new Date();
      var year = today.getFullYear();
      var month = today.getMonth()+1;
      var date = today.getDate();

      if(month<10){
        month = '0'+month;
      }

      if(date<10){
        date = '0'+date;
      }

      var applyStart = year + '-' + month + '-' + date + ' ' + '00:00:00';
      $.each(selectedData, function(idx, value) {
        value.data['applyStart'] = applyStart;
        value.data['applyEnd'] = '9999-12-31 23:59:59';
        value.data['process'] = 'C';

        selectedDataArr.push(value.data);
      });

      selectedDataArr.forEach(function(el) {
        listMap[el['code']+'@'+el.applyStart.split(' ')[0]] = el;
        cndGrid.addData(el);
        selectedGridData.push(el);
      });
      modifyFlag = true;
    },
    contentsEvent: {
      'click .cnd-tpl-search': function() {
        var requestParam = {
            'conditionGroupTemplateTypeCode': conditionGroupTemplateTypeCode,
            'conditionGroupTemplateName': $('.add-cnd-tpl-popup .cnd-name-search').val(),
            'likeQueryYn': 'Y',
            'cndGroupTemplateSearchDscd':'01' // OHS 20171214 추가
        };

        PFRequest.get('/conditionGroup/template/queryConditionGroupTemplateBaseForList.json', requestParam, {
          success: function(responseData) {

            $('.add-cnd-tpl-popup .popup-cnd-tpl-grid').empty();

            cndPopupGrid = PFComponent.makeExtJSGrid({
              fields: ['name', 'code', 'type', 'isActive'],
              gridConfig: {
                selType: 'checkboxmodel',
                renderTo: '.popup-cnd-tpl-grid',
                columns: [
                  {text: bxMsg('MTM0100String7'), flex: 1, dataIndex: 'code'},
                  {text: bxMsg('MTM0100String8'), flex: 1, dataIndex: 'name'},
                  {text: bxMsg('DPS0101String6'), width: 70, dataIndex: 'isActive',
                    renderer: function(value, p, record) {
                      if (value === 'Y') {
                        return bxMsg('active');
                      } else if (value === 'N') {
                        return bxMsg('inactive');
                      }
                    }
                  }
                  ]
              }
            });

            if(responseData) {
            	cndPopupGrid.setData(responseData);
            }
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CndGroupTemplateService',
            operation: 'queryListCndGroupTemplate'
          }
        });
      }
    },
    listeners: {
      afterRenderUI: function() {
        var requestParam = {'conditionGroupTemplateTypeCode': conditionGroupTemplateTypeCode,
            'cndGroupTemplateSearchDscd':'01', // OHS 20171214 추가
            'likeQueryYn':'Y'};


        PFRequest.get('/conditionGroup/template/queryConditionGroupTemplateBaseForList.json', requestParam, {
          success: function(responseData) {

            cndPopupGrid = PFComponent.makeExtJSGrid({
              fields: ['name', 'code', 'type', 'isActive'],
              gridConfig: {
                selType: 'checkboxmodel',
                renderTo: '.popup-cnd-tpl-grid',
                columns: [
                  {text: bxMsg('MTM0100String7'), flex: 1, dataIndex: 'code'},
                  {text: bxMsg('MTM0100String8'), flex: 1, dataIndex: 'name'},
                  {text: bxMsg('DPS0101String6'), width: 70, dataIndex: 'isActive',
                    renderer: function(value, p, record) {
                      if (value === 'Y') {
                        return bxMsg('active');
                      } else if (value === 'N') {
                        return bxMsg('inactive');
                      }
                    }
                  }
                  ]
              }
            });

            if(responseData) {
            	cndPopupGrid.setData(responseData);
            }
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CndGroupTemplateService',
            operation: 'queryListCndGroupTemplate'
          }
        });
      }
    }
  });
}