/******************************************************************************************************************
 * 액티비티 조회 팝업
 ******************************************************************************************************************/
function renderActivitySearchPopup(submitEvent){

  var activityListGrid;

  PFComponent.makePopup({
    title: bxMsg('ActivityList'),
    width: 370,
    height: 335,
    contents: activitySearchPopup(),
    submit: function () {
      submitEvent(activityListGrid.getSelectedItem());
    },
    contentsEvent: {
      'click .pf-ppt-activity-List-popup-search-btn': function () {
        var form = PFComponent.makeYGForm($('.pf-ppt-activity-List-popup .activity-query-table'));
        var requestData = form.getData();
        activityListGrid.loadData(requestData,{'isReset' : true});
      }
    },
    listeners: {
      afterRenderUI: function () {
        activityListGrid = renderActivityListGrid();

        var option = {
            'isReset' : true,
            bxmHeader: {
              application: 'PF_Factory',
              service: 'ActivityMasterService',
              operation: 'queryListActivityMaster'
            }
        };
        activityListGrid.loadData({},option);
      }
    }
  });
};

function renderActivityListGrid() {
  var grid = PFComponent.makeExtJSGrid({
    url: '/activity/getActivityMasterList.json',
    httpMethod: 'get',
    fields: [
      "activityId","activityName"//,"activityContent","activityTag", "lastModifier", "gmtLastModify"
      ],
      gridConfig: {
        selType: 'checkboxmodel',
        renderTo: '.pf-ppt-activity-list-grid',
        columns: [
          {text: bxMsg('ActivityId')    , flex:  1, dataIndex: 'activityId'},                                 // 액티비티 ID
          {text: bxMsg('ActivityName')  , flex: 2, dataIndex: 'activityName'}                                // 액티비티명
//        {text: bxMsg('PAS0101String1'), flex:  1  , dataIndex: 'gmtLastModify'},                            // 등록일
//        {text: bxMsg('PAS0200String7'), flex:  1  , dataIndex: 'lastModifier'}                              // 등록사원
          ],
          listeners: {
            afterRenderUI: function () {

            }
          }
      }
  });

  return grid;
}
