/**
 * proejct java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function(){
    setMainTapLeftPosition();
    renderTaskManagement();
    renderTaskManagementGrid();

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
});

$('body').css('overflow-y','scroll');

var $el = $('.pf-pt');

var taskManagementTpl;
var taskManagementGrid;

var form;

var taskPopup;

var onEvent = PFUtil.makeEventBinder($el);
var lengthVlad = PFValidation.realTimeLengthCheck($('body'));

lengthVlad('.task-valid-100',100);

taskManagementTpl = getTemplate('taskManagementTpl');

var tab; // OHS 20171205 추가 - 개발과제별 액티비티 데이터가 없을경우 탭을 disabled 처리하기 위함.

// 20160912 OHS
PFComponent.toolTip($el);

onEvent('click', 'a', function(e) { e.preventDefault(); });

onEvent('click', '.task-list-inquiry-btn', function(e) {
    searchProjectData();
});

onEvent('click', '.task-new-btn', function(e) {
    // header의 신규버튼을 클릭함.
    if(!taskPopup || taskPopup.popup.destroyed){
        taskPopup = renderTaskPopup();

    }
});

// 초기화 버튼 클릭시
onEvent('click','.pf-reset-form-btn',function(e) {
    form.reset();
    taskManagementGrid.resetData();
    $('.prgrs-sts-dscd').val();

    var $gridFooter =  $('.grid-paging-footer');
    $gridFooter.find('span').text('');
    $gridFooter.find('.grid-page-input').val('1');

    getDatePicker(false, $('.pf-pt-task-mgmt-form'));

    $('.prgrs-sts-dscd').val('');
    $('.prgrs-sts-dscd').multiselect('reload', '');

    // Set default start, end date
    $('.start-date').val(PFUtil.addMonths(PFUtil.getToday(),-1));
    $('.end-date').val(PFUtil.getToday());
});

function searchProjectData(){
    var requestData = form.getData({dateFormat:'yyyy-MM-dd'});
    var prgrsStsListArr = $('.prgrs-sts-dscd').val();
    var prgrsStsListString;
    if(prgrsStsListArr != null && prgrsStsListArr.length > 0) {
        prgrsStsListString = ""
        for (var i = 0; i < prgrsStsListArr.length; i++) {
            prgrsStsListString += prgrsStsListArr[i] + ",";
        }
        requestData.prgrsStsDscdList = prgrsStsListString.substr(0, prgrsStsListString.length - 1);
    }
    delete requestData.prgrsStsDscd;
    requestData.startDate = !requestData.startDate ? '' : requestData.startDate += ' 00:00:00';
    requestData.endDate = !requestData.endDate ? '9999-12-31 23:59:59' : requestData.endDate += ' 23:59:59';
    loadGridData(taskManagementGrid,requestData);
}

function loadGridData(grid, data) {
    var option = {
        'isReset' : true,
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ProjectMasterService',
            operation: 'queryListProjectMaster'
        }
    };

    grid.loadData(data,option);
}

// 메인화면 초기세팅
function renderTaskManagement() {

    $('.pf-page-conts').html(taskManagementTpl());
    form = PFComponent.makeYGForm($('.task-query-table'));

    getDatePicker(false, $('.pf-pt-task-mgmt-form'));

    //make combo
    renderComboBox('TargetObjectTypeCode', $('.target-obj-code-list'), '', true, bxMsg('Z_All'));
    //renderComboBox('ProgressStatusCode', $('.prgrs-sts-dscd'), '', true, bxMsg('Z_All'));
    renderComboBox('ProgressStatusCode', $('.prgrs-sts-dscd'), '', false, null);
    $('.prgrs-sts-dscd').multiselect();

    // Set default start, end date
    $('.start-date').val(PFUtil.addMonths(PFUtil.getToday(),-1));
    $('.end-date').val(PFUtil.getToday());

    if($('.default-layout-task-menu .click', parent.document).length > 0) {
        $('.task-new-btn').click();
        $('.default-layout-task-menu .click', parent.document).removeClass('click');
    }
}

function renderTaskManagementGrid() {
    taskManagementGrid = PFComponent.makeExtJSGrid({
        url: '/project/queryProjectBaseForList.json',
        httpMethod: 'get',
        pageAble: true,
        paging: true,
        pageSize: 14,
        fields: [
            "lastModifier","name","projectId","registDepartmentCode",
            "registUserId","tntInstId","gmtLastModify","registUserName",
            {
                name: 'progressStatus',
                convert: function(value, record) {
                    var codeValue;
                    codeArrayObj['ProgressStatusCode'].forEach(function(codeInfo, i) {
                        codeValue = (codeInfo.code === value)? codeInfo.name: codeValue;
                    });
                    return codeValue;
                }
            }
        ],
        dataRoot: 'list',
        gridConfig: {
            renderTo: '.pf-pt-task-mgmt-grid',
            columns: [
                {text: bxMsg('PAS0201String3'), flex: 1, dataIndex: 'projectId'},
                {text: bxMsg('PAS0201String2'), width: 400, dataIndex: 'name'},
                {text: bxMsg('PAS0201String5'), width: 100, dataIndex: 'progressStatus'},
                {text: bxMsg('lastModifiedDate'), flex: 1, dataIndex: 'gmtLastModify'},
                {text: bxMsg('PAS0200String7'), flex: 1, dataIndex: 'registUserName'}                               // 등록사원
            ],
            listeners: {
                scope: this,
                itemdblclick : function(tree, record){
                    PFRequest.get('/project/getProjectBase.json',record.data,{
                        success: function(responseData){
                            renderTaskPopup(responseData);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'ProjectMasterService',
                            operation: 'queryProjectMaster'
                        }
                    });
                },
                afterrender : function(){
                    searchProjectData();
                }
            }
        }
    });
}

function getDatePicker(isTimePicker, $target) {
    $target.find(".calendar.start-date").val(PFUtil.getToday());
    $target.find(".calendar.end-date").val("9999-12-31");
    $target.find(".calendar").on("mousedown", function() {
      $(this).datetimepicker({
        format: "Y-m-d",
        timepicker: isTimePicker,
        yearEnd: 9999,
        todayButton: true
      });
    });
}