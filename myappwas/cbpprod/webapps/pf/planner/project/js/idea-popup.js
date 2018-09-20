// 아이디어 검색 팝업
function searchIdeaPopup(submitEvent){

    var ideaPopup = PFUtil.getTemplate('planner/project','ideaPopup');
    var ideaPopupGrid;

    PFComponent.makePopup({
        title: bxMsg('SearchIdea'),		// 아이디어 검색
        width: 500,
        height: 460,
        contents: ideaPopup(),
        modifyFlag : 'readonly',
        submit: function() {
            submitEvent(ideaPopupGrid.getSelectedItem());
        },
        contentsEvent: {
            'click .idea-list-inquiry-btn': function() {
                search();
            }
        },
        listeners: {
            afterRenderUI: function() {
            	PFUtil.getDatePicker(false, $('.pf-pt-idea-list-popup'));		// 달력 컴포넌트 로드
            	// Set default start, end date
                $('.pf-pt-idea-list-popup .start-date').val(PFUtil.addMonths(PFUtil.getToday(),-1));
                $('.pf-pt-idea-list-popup .end-date').val(PFUtil.getToday());
                search();
            }
        }
    });

    // 조회
    function search(){

        var $popupTable = $('.pf-pt-idea-list-popup .bx-info-table'),
            formData = PFComponent.makeYGForm($popupTable).getData();;

        formData.endDate = formData.endDate.split(' ')[0].concat(' 23:59:59');
        PFRequest.get('/idea/getIdeaMasterList.json', formData, {
            success: function (responseData) {

                $('.pf-pt-idea-list-popup .pf-pt-idea-list-grid').empty();

                ideaPopupGrid = PFComponent.makeExtJSGrid({
                    fields: [
                        "ideaId","ideaNm","ideaContent","ideaTag", "lastModifier", "gmtLastModify"
                    ],
                    gridConfig: {
                        selType: 'checkboxmodel',
                        renderTo: '.pf-pt-idea-list-grid',
                        columns: [
                            {text: bxMsg('PAS0102String2'), flex:  1  , dataIndex: 'ideaId'},         // 아이디어 ID
                            {text: bxMsg('PAS0102String3'), flex:  1.5, dataIndex: 'ideaNm'},         // 아이디어명
                            {text: bxMsg('lastModifiedDate'), flex:  1.5, dataIndex: 'gmtLastModify'},  // 등록일
                            {text: bxMsg('PAS0200String7'), flex:  1  , dataIndex: 'lastModifier'}    // 등록사원
                        ]
                    }
                });

                ideaPopupGrid.setData(responseData);
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'IdeaMasterService',
                operation: 'queryListIdeaMaster'
            }
        });
    }
}