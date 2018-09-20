/**
 * activity java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {

    setMainTapLeftPosition();
    renderActivityMasterList();     // 메인화면 초기세팅
    renderActivityMasterListGrid();

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
});

$('body').css('overflow-y','scroll');

var $el = $('.pf-pa');

var activityListTpl;

var activityListGrid;
var form;

var onEvent = PFUtil.makeEventBinder($el);
var lengthVlad = PFValidation.realTimeLengthCheck($('body'));

lengthVlad('.task-valid-100',100);
PFComponent.toolTip($el);

// Handlebars compile, html 파일명을 파라미터로 넘겨준다.
activityListTpl = getTemplate('activityListTpl');


/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/

//
onEvent('click', 'a', function(e) { e.preventDefault(); });

// 초기화버튼 클릭시
onEvent('click','.pf-reset-form-btn',function(e) {
    form.reset();
    activityListGrid.resetData();

    var $gridFooter =  $('.grid-paging-footer');
    $gridFooter.find('span').text('');
    $gridFooter.find('.grid-page-input').val('1');

    $('.progress-status-checkbox').prop('checked',true);

    PFUtil.getDatePicker();

    // Set default start, end date
    $('.start-date').val(PFUtil.getStartDate());
    $('.end-date').val(PFUtil.getEndDate());
});

// 조회버튼 클릭시
onEvent('click', '.activity-list-inquiry-btn', function(e) {
    searchActivityData();
});

// 신규버튼 클릭시
onEvent('click', '.activity-create-popup-btn', function(e) {

    var defaultParam = {
        "work" : "CREATE"
    };

    editActivity(defaultParam);
});

// 등록사원 포커스
onEvent('focus', '.user-id', function(e) {
	$('.user-id').blur(); // OHS20180725 - blur처리하여 팝업이 무한생성되는것을 방지
    PFPopup.selectEmployee({}, function (selectItem) {
    	if(!selectItem) {
    		$('.user-id').val('');
    		$('.user-name').val('');
    	}
    	else {
    		$('.user-id').val(selectItem.staffId);
    		$('.user-name').val(selectItem.staffName);
    	}
    });
});

/******************************************************************************************************************
 * 사용자 함수
 ******************************************************************************************************************/

// 메인화면 초기세팅
function renderActivityMasterList() {

    //$('.pf-page-conts').html(activityListTpl());
	$el.find('.pf-page-conts').html(activityListTpl());
    form = PFComponent.makeYGForm($('.activity-query-table'));

    PFUtil.getDatePicker();

    // Set default start, end date
    $('.start-date').val(PFUtil.getStartDate());
    $('.end-date').val(PFUtil.getEndDate());
}

// 콤보바인딩함수
function renderComboBox(code, selector){

    var options = [];

    $.each(codeMapObj[code], function (code, name) {
        var $option = $('<option>');

        $option.val(code);
        $option.text(name);

        options.push($option);
    });

    selector.html(options);
}

// 조회
function searchActivityData(){
    var requestData = form.getData({dateFormat:'yyyy-MM-dd'});
    requestData.startDate = !requestData.startDate ? '' : requestData.startDate += ' 00:00:00';
    requestData.endDate = !requestData.endDate ? '9999-12-31 23:59:59' : requestData.endDate += ' 23:59:59';
    loadGridData(activityListGrid,requestData);
    popupModifyFlag = false;
}

// 그리드데이터 Load
function loadGridData(grid, data) {
    var option = {
        'isReset' : true,
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ActivityMasterService',
            operation: 'queryListActivityMaster'
        }
    };

    grid.loadData(data,option);
}

/******************************************************************************************************************
 * BIZ 함수(서비스 호출)
 ******************************************************************************************************************/

// 그리드 조회
function renderActivityMasterListGrid() {
    activityListGrid = PFComponent.makeExtJSGrid({
        url: '/activity/getActivityMasterList.json',
        httpMethod: 'get',
        //pageAble: true,
        //paging: true,
        //pageSize: 14,
        fields: [
            "activityId","activityName","activityContent","activityTag", "lastModifier", "gmtLastModify", "registUserName"
        ],
        //dataRoot: 'list',
        gridConfig: {
            renderTo: '.pf-pa-activity-list-grid',
            columns: [
                {text: bxMsg('ActivityId'), flex:  1  , dataIndex: 'activityId'},                                   // 액티비티 ID
                {text: bxMsg('ActivityName'), width: 400, dataIndex: 'activityName'},                               // 액티비티명
                {text: bxMsg('lastModifiedDate'), flex:  1  , dataIndex: 'gmtLastModify'},                            // 등록일
                {text: bxMsg('PAS0200String7'), flex:  1  , dataIndex: 'registUserName'}                              // 등록사원
            ],
            listeners: {
                scope: this,
                itemdblclick : function(tree, record){      // 그리드 더블클릭 시
                    PFRequest.get('/activity/getActivityMaster.json',record.data,{
                        success: function(responseData) {
                            responseData.work = "UPDATE";
                            editActivity(responseData);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'ActivityMasterService',
                            operation: 'queryActivityMaster'
                        }
                    });
                },
                afterrender : function(){
                    searchActivityData();       // 조회
                }
            }
        }
    });
}