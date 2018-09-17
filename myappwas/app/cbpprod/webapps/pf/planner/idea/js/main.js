/**
 * idea java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {
    setMainTapLeftPosition();
    renderIdeaMasterList();        // 메인화면 초기세팅
    renderIdeaMasterListGrid();    // 그리드 조회

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
});

$('body').css('overflow-y', 'scroll');

var $el = $('.pf-pi');
var ideaListTpl;

var ideaListGrid;
var form;
var fileUploadList = new FormData();
var deleteFileList = [];
var fileAddSeq = 0;
var fileGrid;

var onEvent = PFUtil.makeEventBinder($el);
PFComponent.toolTip($el);
var lengthVlad = PFValidation.realTimeLengthCheck($('body'));

lengthVlad('.task-valid-100', 100);

ideaListTpl = getTemplate('ideaListTpl');



/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/

//
onEvent('click', 'a', function(e) { e.preventDefault(); });

// 초기화버튼 클릭시
onEvent('click','.pf-reset-form-btn',function(e) {
    form.reset();
    ideaListGrid.resetData();

    var $gridFooter =  $('.grid-paging-footer');
    $gridFooter.find('span').text('');
    $gridFooter.find('.grid-page-input').val('1');

    $('.progress-status-checkbox').prop('checked',true);

    PFUtil.getDatePicker();

    // Set default start, end date
    $('.start-date').val(PFUtil.addMonths(PFUtil.getToday(),-1));
    $('.end-date').val(PFUtil.getToday());
});

// 조회버튼 클릭시
onEvent('click', '.idea-list-inquiry-btn', function(e) {
    searchIdeaData();
});

// 신규버튼 클릭시
onEvent('click', '.idea-create-popup-btn', function(e) {

var defaultParam = {
    "work" : "CREATE"
    }

    renderIdeaMasterPopup(defaultParam);
});


    // 등록사원 포커스
onEvent('focus', '.user-id', function(e) {
	$('.user-id').blur(); // OHS20180725 - blur처리하여 팝업이 무한생성되는것을 방지
    PFPopup.selectEmployee({}, function (selectItem) {
    	// OHS 2018.01.08 추가 - script error 방지
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

function ComSubmit(opt_formId) {
    this.formId = gfn_isNull(opt_formId) == true ? "commonForm" : opt_formId;
    this.url = "";

    if(this.formId == "commonForm"){
        $("#commonForm")[0].reset();
    }

    this.setUrl = function setUrl(url){
        this.url = url;
    };

    this.addParam = function addParam(key, value){
        $("#"+this.formId).append($("<input type='hidden' name='"+key+"' id='"+key+"' value='"+value+"' >"));
    };

    this.submit = function submit(){
        var frm = $("#"+this.formId)[0];
        frm.action = this.url;
        frm.method = "post";
        frm.submit();
    };
}

function gfn_isNull(str) {
    if (str == null) return true;
    if (str == "NaN") return true;
    if (new String(str).valueOf() == "undefined") return true;
    var chkStr = new String(str);
    if( chkStr.valueOf() == "undefined" ) return true;
    if (chkStr == null) return true;
    if (chkStr.toString().length == 0 ) return true;
    return false;
}

// 메인화면 초기세팅
function renderIdeaMasterList() {

    $('.pf-page-conts').html(ideaListTpl());
    form = PFComponent.makeYGForm($('.idea-query-table'));

    PFUtil.getDatePicker();

    // Set default start, end date
    $('.start-date').val(PFUtil.addMonths(PFUtil.getToday(),-1));
    $('.end-date').val(PFUtil.getToday());
}

// 조회
function searchIdeaData(){
    var requestData = form.getData({dateFormat:'yyyy-MM-dd'});
    requestData.startDate = !requestData.startDate ? '' : requestData.startDate += ' 00:00:00';
    requestData.endDate = !requestData.endDate ? '9999-12-31 23:59:59' : requestData.endDate += ' 23:59:59';

    loadGridData(ideaListGrid,requestData);
    popupModifyFlag = false;
}

// 그리드데이터 Load
function loadGridData(grid, data) {
    var option = {
        'isReset' : true,
        bxmHeader: {
            application: 'PF_Factory',
            service: 'IdeaMasterService',
            operation: 'queryListIdeaMaster'
        }
    };

    grid.loadData(data,option);
}

/******************************************************************************************************************
 * BIZ 함수(서비스 호출)
 ******************************************************************************************************************/

// 그리드 조회
function renderIdeaMasterListGrid() {
    ideaListGrid = PFComponent.makeExtJSGrid({
        url: '/idea/getIdeaMasterList.json',
        httpMethod: 'get',
        //pageAble: true,
        //paging: true,
        //pageSize: 14,
        fields: [
            "ideaId","ideaNm","ideaContent","ideaTag", "lastModifier", "gmtLastModify", "registUserName"
        ],
        //dataRoot: 'list',
        gridConfig: {
            renderTo: '.pf-pi-idea-list-grid',
            columns: [
                {text: bxMsg('PAS0102String2'), flex:  1  , dataIndex: 'ideaId'},                                      // 아이디어 ID
                {text: bxMsg('PAS0102String3'), width: 400, dataIndex: 'ideaNm'},                                   // 아이디어명
                {text: bxMsg('lastModifiedDate'), flex:  1  , dataIndex: 'gmtLastModify'},                                  // 등록일
                {text: bxMsg('PAS0200String7'), flex:  1  , dataIndex: 'registUserName'}                               // 등록사원
            ],
            listeners: {
                scope: this,
                itemdblclick : function(tree, record){      // 그리드 더블클릭 시
                    PFRequest.get('/idea/getIdeaMaster.json',record.data,{
                        success: function(responseData) {
                            responseData.work = "UPDATE";
                            fileUploadList = new FormData();
                            fileGrid = null;
                            deleteFileList = [];
                            fileAddSeq = 0;
                            renderIdeaMasterPopup(responseData);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'IdeaMasterService',
                            operation: 'queryIdeaMaster'
                        }
                    });
                },
                afterrender : function(){
                    searchIdeaData();
                }
            }
        }
    });
}
