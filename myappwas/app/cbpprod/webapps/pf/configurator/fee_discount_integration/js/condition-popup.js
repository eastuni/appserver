// 제공조건 검색팝업 (수수료할인팝업>제공조건탭)
function renderAddLimitCndPopup(submitEvent){
  const addLimitCndPopupTpl = getTemplate('addLimitCndPopupTpl'); // 한도조건추가 검색팝업
  var cndPopupGrid;

  PFComponent.makePopup({
    title: bxMsg('DTP0203Title'),
    width: 600,
    height: 330,
    contents: addLimitCndPopupTpl(),
    submit: function(){
      submitEvent(cndPopupGrid.getSelectedItem());
    },
    contentsEvent: {
      'click .cnd-tpl-search': function() {
        var requestParam = {
            'conditionName': $('.add-limit-cnd-popup .cnd-name-search').val()
        };

        var comboVal = $('.add-limit-cnd-popup .cnd-type-select').val();

        if (comboVal) {
          requestParam.conditionTypeCode = comboVal;
        } else {
          requestParam.conditionTypeCode = 'A';
        }
        requestParam.tntInstId = tntInstId;
        requestParam.activeYn = 'Y';

        PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
          success: function(responseData) {

            $('.add-limit-cnd-popup .popup-cnd-grid').empty();
            var checkboxmodel = Ext.create ('Ext.selection.CheckboxModel', {mode:'SINGLE'});
            cndPopupGrid = PFComponent.makeExtJSGrid({
              fields: ['code', 'type', 'name', 'content', 'isActive', 'conditionDetailTypeCode', {
                name: 'typeNm',
                convert: function(newValue, record) {
                  var typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
                  return typeNm;
                }}],
                pageAble: true,
                gridConfig: {
                  selModel: checkboxmodel,
                  renderTo: '.popup-cnd-grid',
                  columns: [
                    {text: bxMsg('DTP0203String3'), width: 80, dataIndex: 'code'},
                    {text: bxMsg('DTP0203String4'), width: 80, dataIndex: 'typeNm'},
                    {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name'},
                    {text: bxMsg('DPS0101String6'), width: 70, dataIndex: 'isActive',
                      renderer: function(value, p, record) {
                        if (value === 'Y') {
                          return bxMsg('active');
                        } else if (value === 'N') {
                          return bxMsg('inactive');
                        }
                      }
                    },
                    {text: bxMsg('DTP0203String8'), flex: 1, dataIndex: 'content'}
                    ]
                }
            });

            if(responseData) {
            	cndPopupGrid.setData(responseData);
            }
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CndTemplateService',
            operation: 'queryListCndTemplate'
          }
        });
      }
    },
    listeners: {
      afterRenderUI: function() {
        var requestParam = {'conditionTypeCode': 'A', 'activeYn' : 'Y'};

        var options = [];

        var $defaultOption = $('<option>');
        $defaultOption.text(bxMsg('Z_All'));
        $defaultOption.val('');

        options.push($defaultOption);

        $.each(codeMapObj['ProductConditionTypeCode'], function(key,value){
          if (key === '03' || key === '04') {
            return;
          }

          var $option = $('<option>');

          $option.val(key);
          $option.text(value);

          options.push($option);
        });

        $('.add-limit-cnd-popup .cnd-type-select').html(options);

        PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
          success: function(responseData) {
            var checkboxmodel = Ext.create ('Ext.selection.CheckboxModel', {mode:'SINGLE'});
            cndPopupGrid = PFComponent.makeExtJSGrid({
              fields: ['code', 'type', 'name', 'content', 'isActive', 'conditionDetailTypeCode', {
                name: 'typeNm',
                convert: function(newValue, record) {
                  var typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
                  return typeNm;
                }}],
                gridConfig: {
                  selModel: checkboxmodel,
                  renderTo: '.popup-cnd-grid',
                  columns: [
                    {text: bxMsg('DTP0203String3'), width: 80, dataIndex: 'code'},
                    {text: bxMsg('DTP0203String4'), width: 80, dataIndex: 'typeNm'},
                    {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name'},
                    {text: bxMsg('DPS0101String6'), width: 70, dataIndex: 'isActive',
                      renderer: function(value, p, record) {
                        if (value === 'Y') {
                          return bxMsg('active');
                        } else if (value === 'N') {
                          return bxMsg('inactive');
                        }
                      }
                    },
                    {text: bxMsg('DTP0203String8'), flex: 1, dataIndex: 'content'}
                    ]
                }
            });

            if(responseData) {
            	cndPopupGrid.setData(responseData);
            }
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CndTemplateService',
            operation: 'queryListCndTemplate'
          }
        });
      }
    }
  });
}