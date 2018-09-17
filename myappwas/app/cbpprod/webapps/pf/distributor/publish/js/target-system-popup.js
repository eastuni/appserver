
function renderTargetSystemPopup(callback) {
  const addTargetSysPopup = getTemplate('addTargetSysPopup');
  //Add Target System Popup Grid
  let addTargetSysPopupGrid;

  PFComponent.makePopup({
    title: bxMsg('PAM0500String1'), //배포대상시스템
    contents: addTargetSysPopup(),
    width: 270,
    height: 300,
    submit: function() {
      const checkedItem = addTargetSysPopupGrid.getSelectedItem();
      if (checkedItem.length > 0) {
        checkedItem.forEach(function(el){
          if (!el.userName) {
            el.userName = el.userNumber;
          }
        });
      }
      callback(checkedItem);
    },
    listeners: {
      afterRenderUI: function() {

        PFRequest.get('/publish/PublishQuerySystemList.json',{
          success: function(responseData){
            addTargetSysPopupGrid = renderAddTargetSystemGrid(responseData);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'PublishSystemService',
            operation: 'queryListPublishSystem'
          }
        });

      }
    }
  });
}


/**
 * 배포대상시스템 추가 그리드
 */
function renderAddTargetSystemGrid(responseData) {
    // Grid Empty
    $('.add-approval-popup-grid').empty();
    const addTargetSysPopupGrid = PFComponent.makeExtJSGrid({
        fields: ["name", "userNumber", "code"],
        gridConfig: {
            selModel: Ext.create ('Ext.selection.CheckboxModel', {mode: 'MULTI'}),
            renderTo: '.add-target-sys-popup-grid',
            columns: [
                // 1. PAS0501String2 : 시스템명
                // 2. DAS0101String19 : 담당자
                {text: bxMsg('PAS0501String2'), flex: 1, dataIndex: 'name', style: 'text-align:center', align: 'center'},
                {text: bxMsg('DAS0101String19'), flex: 1, dataIndex: 'userNumber', style: 'text-align:center', align: 'center'}
            ]
        }
    });
    if(responseData) {
        addTargetSysPopupGrid.setData(responseData);
    }
    
    return addTargetSysPopupGrid;
}
