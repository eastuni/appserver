
function selectProject(callback) {
  const projectPopup = getTemplate('projectPopup');

  var projectPopupGrid;
  PFComponent.makePopup({
    title: bxMsg('DAS0101String2'),
    contents: projectPopup(),
    width: 500,
    height: 300,
    submit: function() {
      if(!projectPopupGrid.getSelectedRecords()[0]){
        return;
      }
      var checkedItem = projectPopupGrid.getSelectedRecords()[0].data;


      if(checkedItem.projectId) {
        callback(checkedItem);
      }
    },
    contentsEvent: {
      'click .project-search' : function() {
        var requestParam = PFComponent.makeYGForm($('.add-project-popup')).getData();

        PFRequest.get('/project/queryProjectPublishForList.json', requestParam, {
          success: function(responseData) {

            $('.add-project-popup .popup-project-grid').empty();

            projectPopupGrid = PFComponent.makeExtJSGrid({
              fields: ['projectId', 'name'],
              gridConfig: {
                renderTo: '.add-project-popup .popup-project-grid',
                selModel: Ext.create('Ext.selection.CheckboxModel', {mode: 'SINGLE'}),
                columns: [
                  {text: bxMsg('DAS0101String22'), flex: 1, dataIndex: 'projectId'},
                  {text: bxMsg('DAS0101String23'), flex: 1, dataIndex: 'name'}
                  ]
              }
            });
            projectPopupGrid.setData(responseData);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'ProjectMasterService',
            operation: 'queryListProjectPublish'
          }
        });
      }
    },
    listeners: {
      afterRenderUI: function() {
        var requestParam = PFComponent.makeYGForm($('.add-project-popup')).getData();
        PFRequest.get('/project/queryProjectPublishForList.json', requestParam, {
          success: function(responseData) {

            $('.add-project-popup .popup-project-grid').empty();

            projectPopupGrid = PFComponent.makeExtJSGrid({
              fields: ['projectId', 'name'],
              gridConfig: {
                renderTo: '.add-project-popup .popup-project-grid',
                selModel: Ext.create('Ext.selection.CheckboxModel', {mode: 'SINGLE'}),
                columns: [
                  {text: bxMsg('DAS0101String22'), flex: 1, dataIndex: 'projectId'},
                  {text: bxMsg('DAS0101String23'), flex: 1, dataIndex: 'name'}
                  ]
              }
            });
            projectPopupGrid.setData(responseData);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'ProjectMasterService',
            operation: 'queryListProjectPublish'
          }
        });
      }
    }
  });
}