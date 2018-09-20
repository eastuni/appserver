/**
 * common code java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
// OHS 2017.03.20 추가
var $loadingDim = $('#loading-dim');

$(function() {
	$loadingDim.show();
    $('body').css('overflow-y', 'scroll');
    lengthVlad('.length-check-input', 50);
    PFComponent.toolTip($el);
    // Start Rendering Page
    renderCommonCodeTreeBox();
	// OHS 2017.03.20 초기조회 추가
    commonQueryDomainCodeList();
});

var modifyFlag = false;
var selectedCellIndex;

var $el = $('.pf-cd');          // Page Root jQuery Element

var commonCodeLeftTreeTpl,                      // 트리 //도메인코드 트리
    commonCodeDetailInfoTpl,
    commonCodeDetailManagementPopupTpl;             // 상세정보 관리


var navTree, navTreeStore,
    commonCodeDetailGrid;

var deleteInstanceList = [];

var loginTntInstId, tntInstId, mother, child, instanceLength;


var pdInfoDscd = '01';  // 초기값 = 상품
var gdomainCode,
    highDomainCode;

var clickEventForNewData = {};

var onEvent = PFUtil.makeEventBinder($el);

var lengthVlad = PFValidation.realTimeLengthCheck($el);


// Load Template in HTML
commonCodeLeftTreeTpl = getTemplate('commonCodeLeftTreeTpl');
commonCodeDetailInfoTpl = getTemplate('commonCodeDetailInfoTpl');
commonCodeDetailManagementPopupTpl = getTemplate('commonCodeDetailManagementPopupTpl');

/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/

onEvent('click', 'a', function (e) {
    e.preventDefault();
});

onEvent('click', '.sidebar-toggler', function (e) {
    var $target = $(e.currentTarget);

    $el.toggleClass('contents-expand');

    if($el.hasClass('contents-expand')) {
        $target.text('>');
    }else {
        $target.text('<');
    }

    setTimeout(function () {
        $('.manual-resize-component:visible').resize();
    }, 600);
});

onEvent('change', '.pf-multi-entity', function(e){

    tntInstId = $el.find('.pf-multi-entity').val();     // 기관콤보 change 시 tntInstId 변경

    $('.tab-nav-list').empty();
    $('.tab-content').empty();

    if($(e.currentTarget).val() != $('.login-tntInst-id').text()) {
        $($('.default-layout-task-menu').find('.your-task')[0]).attr('data-status', 'true');
        $($('.default-layout-task-menu').find('.your-task')[0]).removeClass('task-hide');
        $($('.default-layout-task-menu').find('.your-task')[0]).val('');
        $($('.default-layout-task-menu').find('.my-task-list')[0]).addClass('task-hide');
    }else{
        $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).removeAttr('data-status');
        $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).addClass('task-hide');
        $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).removeClass('task-hide');
        $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).find('option').eq(0).prop('selected',true);
    }

    renderDomainCodeNavTree.isRendered = false;
    renderCommonCodeInfo();
    $el.find('.pf-cd-info-wrap').removeClass('active');
});

//공통코드 검색
onEvent('click', '.common-code-search-btn', function(){
	commonQueryDomainCodeList();
});

onEvent('keypress', '.common-code-search-content', function(e) {
    if (e.keyCode == 13){
    	commonQueryDomainCodeList();
    }
});

onEvent('keypress', '.common-code-search-name', function(e) {
    if (e.keyCode == 13){
    	commonQueryDomainCodeList();
    }
});
onEvent('keypress', '.common-code-search-code', function(e) {
    if (e.keyCode == 13){
    	commonQueryDomainCodeList();
    }
});


//공통코드상세 추가버튼
onEvent('click', '.add-detail-btn', function() {

    if(highDomainCode === null || highDomainCode == ''){
        var newData = {
            activeYn : 'N',
            process : 'C'
        };
        commonCodeDetailGrid.addData(newData);
        modifyFlag = true;
    }else{
        renderSearchHighDomainCodeDetailPopup();
    }
});

//공통코드상세 조회버튼
onEvent('click', '.search-detail-btn', function() {

    var form = PFComponent.makeYGForm($('.pf-cd-detail-search-form'));
    var requestParam = form.getData();
    requestParam.domainCode = gdomainCode;
    requestParam.tntInstId = loginTntInstId;

    if(child){
        requestParam.motherTntInstId = getMotherTntInstId();
    }
    requestParam.inqrySeqSort = true;

    PFRequest.get('/commonCode/getCommonCodeDetailList.json', requestParam, {
        success: function(responseData) {

            if(responseData[0].isMotherData === true){
                for(var i = 0; i < responseData.length ; i++){
                    responseData[i].process = 'C';
                }
            }

            $('.detail-grid').html('');
            deleteInstanceList = [];
            commonCodeDetailGrid = commonCodeDetailListGrid();
            commonCodeDetailGrid.setData(responseData);

        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'CommonCodeDetailService',
            operation: 'queryListCommonCodeDetail'
        }
    });

});


onEvent('click', '.detail-save-btn', function() {
    saveDomainCodeInfo();
});

onEvent('click', '.create-common-code-btn', function() {

	if(loginTntInstId != tntInstId){
		PFComponent.showMessage(bxMsg('AccessError'), 'warning');
		return;
	}

	createDomainCodeEvent();
});


/******************************************************************************************************************
 * BIZ 함수
 ******************************************************************************************************************/
/**
 * 도메인코드 목록조회 공통부분을 함수화함.
 */
function commonQueryDomainCodeList() {
    traceTree.completeTrace = true;
    renderDomainCodeNavTree.isRendered = false;
    renderDomainCodeNavTree();
}


// 도메인코드삭제
function deleteDomainCode(id) {

    var requestData = {
        domainCode: treeItem.id,
        tntInstId: tntInstId
    };
    PFRequest.post('/commonCode/deleteCommonCodeMaster.json', requestData, {
        success : function (responseMessage) {
            if (responseMessage) {
                PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');                                        // 삭제에 성공하였습니다.
                modifyFlag = false;

                var pathArr = [];
                treeItem.path.forEach(function(path){
                    if(path && path != id){
                        pathArr.push(path);
                    }
                });

                traceTree.traceList = pathArr;
                traceTree.depth = 0;
                traceTree.completeTrace = false;

                renderDomainCodeNavTree.isRendered = false;
                renderDomainCodeNavTree();

                $el.find('.pf-cd-info-wrap').removeClass('active');
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'CommonCodeMasterService',
            operation: 'deleteCommonCodeMaster'
        }
    });
}

// 코드상세 저장
function saveDomainCodeInfo(){

    var requestParam = {};

    requestParam.tntInstId = tntInstId;
    requestParam.domainCode = gdomainCode;

    // 그리드데이터
    var gridData;

    gridData = commonCodeDetailGrid.getAllData();

    for(var i in gridData){
    	if(gridData[i].instanceCode == '' || gridData[i].instanceCode == null ||
		   gridData[i].instanceName == '' || gridData[i].instanceName == null ||
		   gridData[i].instanceContent == '' || gridData[i].instanceContent == null){
    		PFComponent.showMessage(bxMsg('Z_EmptyInputValue'), 'warning');
            return;
    	}else if(instanceLength < gridData[i].instanceCode.length){
            PFComponent.showMessage(bxMsg('IncorrectInstanceLength'), 'warning');
            return;
        }
    }

    gridData = gridData.concat(deleteInstanceList);
    requestParam['voList'] = gridData;

    if(!modifyFlag){
		// 변경된 정보가 없습니다.
		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
		return;
	}

    /*var nameLengthCheck = PFValidation.finalLengthCheck('',100,name);
    var mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');*/

    // 상품관계 저장 서비스 호출
    //if(nameLengthCheck && mandatoryCheck){
        PFRequest.post('/commonCode/SaveCommonCodeDetail.json',requestParam,{
            success : function(responseData){
                PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
                deleteInstanceList = [];
                searchInstanceCode();
                /*$('.detail-grid').html.empty();
                commonCodeDetailGrid = commonCodeDetailListGrid();
                commonCodeDetailGrid.setData(responseData);*/

            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'CommonCodeDetailService',
                operation: 'saveCommonCodeDetail'
            }
        });
    //}
}

function searchInstanceCode(){
	var form = PFComponent.makeYGForm($('.pf-cd-detail-search-form'));
    var requestParam = form.getData();
    requestParam.domainCode = gdomainCode;
    requestParam.tntInstId = loginTntInstId;

    if(child){
        requestParam.motherTntInstId = getMotherTntInstId();
    }
    requestParam.inqrySeqSort = true;

    PFRequest.get('/commonCode/getCommonCodeDetailList.json', requestParam, {
        success: function(responseData) {
            $('.detail-grid').empty();
            deleteInstanceList = [];
            commonCodeDetailGrid = commonCodeDetailListGrid();
            commonCodeDetailGrid.setData(responseData);
            modifyFlag = false;
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'CommonCodeDetailService',
            operation: 'queryListCommonCodeDetail'
        }
    });
}

/******************************************************************************************************************
 * rendering 함수
 ******************************************************************************************************************/

// 트리박스
function renderCommonCodeTreeBox() {
    $('.pf-cd-left-tree-box').html(commonCodeLeftTreeTpl());

    loginTntInstId = getLoginTntInstId();  // loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    tntInstId = getLoginTntInstId();
    mother = getMortherYn();

    if(getLoginTntInstId()!==getMotherTntInstId()) {
        child = true;
    }else{
        child = false;
    }

    // 기관코드 콤보 바인딩
    renderTntInstComboBox($el.find('.pf-multi-entity'), tntInstId);

    if (mother == true) {    // 중앙회인 경우에는 enable
        $el.find('.mother').show();
        if(writeYn == 'Y'){
        	$el.find('.create-common-code-btn').show();
        }else{
        	$el.find('.create-common-code-btn').hide();
        }
    }else{
        $el.find('.mother').hide();
        if(writeYn == 'Y'){
            $el.find('.create-common-code-btn').show();
        }else{
            $el.find('.create-common-code-btn').hide();
        }
    }
    renderCommonCodeInfo();
}


// 트리와 메인화면을
function renderCommonCodeInfo(treeItem) {

    var path = (treeItem) ? treeItem.id : null;

// pf-event에서 처리
//    $('.pf-detail-wrap').on('change','input',function(){
//        modifyFlag = true;
//        $('.most-significant-box').attr('data-edited','true');
//    });

    var hash = PFUtil.getHash();
    if(path == null){
        hash = '';
        $el.find('.pf-cd-info-wrap').removeClass('active');
    }

    if (!hash) {
        return;
    } else {
        hash.id = path;
    }
}

var createDomainCodeEvent = function () {

    var data = {work: "CREATE"};
    renderDomainCodeManagePopup(data);
}

/******************************************************************************************************************
 * 트리 관련
 ******************************************************************************************************************/
function renderDomainCodeNavTree() {

    if (renderDomainCodeNavTree.isRendered) {
        return;
    }
    renderDomainCodeNavTree.isRendered = true;


    PFUI.use(['pfui/tree', 'pfui/data', 'pfui/menu'], function (Tree, Data, Menu) {


        var domainCode = $el.find('.common-code-search-code').val();
        var domainName = $el.find('.common-code-search-name').val();
        var domainContent = $el.find('.common-code-search-content').val();
        
        var ua = window.navigator.userAgent;
        if (ua.indexOf('MSIE') > 0 || ua.indexOf('Trident') > 0) {
        	domainCode = encodeURI(domainCode);
        	domainName = encodeURI(domainName);
        	domainContent = encodeURI(domainContent);
        }
        
        /* --------------------------------------
         * nvaTreeStore
         * -------------------------------------- */
        if (g_serviceType == g_bxmService){ //bxm 서비스 일경우 파라미터 설정
            var params = {
                header: {
                    application: 'PF_Factory',
                    service: 'CommonCodeMasterService',
                    operation: 'queryListCommonCodeMaster'
                },
                input: {
                    tntInstId: getMotherTntInstId(),
                    pdInfoDscd: pdInfoDscd,
                    domainCode: domainCode,
                    domainName: domainName,
                    domainContent: domainContent,
                    commonHeader: {
                        loginTntInstId: loginTntInstId,
                        motherTntInstId: getCookie('motherTntInstId'),
                        lastModifier : getCookie('loginId')
                    }
                }
            };

            navTreeStore = new Data.TreeStore({
                autoLoad: false,
                url: '/serviceEndpoint/json/request.json',
                dataProperty: 'list',
                proxy : {
                    method : 'POST',
                    ajaxOptions : {
                        contentType: 'application/json; charset=UTF-8',
                        data:JSON.stringify(params)
                    },
                    dataType : 'json'
                },
                map: {
                    'bottom': 'leaf',
                    'domainCodeAndContent': 'text',
                    'domainCode': 'id'
                }
            });
        } else {

            //파라미터 세팅

            var tmpTntInstId;
                tmpTntInstId = getMotherTntInstId();

            navTreeStore = new Data.TreeStore({
                autoLoad: false,
                url: '/commonCode/getCommonCodeMasterList.json?tntInstId=' + tmpTntInstId +
                '&commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '", "motherTntInstId" : "' + getCookie('motherTntInstId') + '", "lastModifier" : "' + getCookie('loginId')+ '"}' +
                '&domainCode=' + domainCode +
                '&domainName=' + domainName +
                '&domainContent=' + domainContent,
                dataProperty: 'list',
                map: {
                    'bottom': 'leaf',
                    'domainCodeAndContent': 'text',
                    'domainCode': 'id'
                }
            });
        }

        // click change url params
        // csl='folder' and 'leaf=false' 일 때 호출됨
        navTreeStore.on('beforeload', function (ev) {
        });

        navTreeStore.on('beforeprocessload', function (ev) {
            var data = ev.data;

            if(data.ModelMap){
                data.list = data.ModelMap.responseMessage;
            }else {
                data.list = data.responseMessage;
            }

            if(data.list.length > 0){
                data.list.forEach(function(element){
                    element.bottom = true;

                    if(!element.bottom && !element.related){
                        element.cls = 'Folder';
                    }
                    if(element.bottom && !element.related){
                        element.cls = 'PT';
                    }
                    if(element.domainCode) {
                        element.domainCodeAndContent = '['+element.domainCode+']'+element.domainContent;
                    }
                    if(element.activeYn === 'N') {
                        element.custom = 'node_disable';
                    }
                });
            }

            $loadingDim.hide();
        });

        navTreeStore.on('load', function() {
            traceTree();
        });

        navTreeStore.load();


        /* --------------------------------------
         * navTree 생성
         * -------------------------------------- */

        $('.pf-cd-tree-nav').empty();

        navTree = new Tree.TreeList({
            itemTpl : '<li class="{custom}">{text}</li>',
            render: '.pf-cd-tree-nav',
            showLine: false,
            store: navTreeStore,
            checkType: 'none',
            showRoot: false
        });

        navTree.render();

        // tree item double click
        navTree.on('itemdblclick', function(e) {

            var domainCodeInfo;

                if(e.item.level == 1){

                	if(!modifyFlag){
                		getCommonCodeDetailList();
                	}else{
                		PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
                			getCommonCodeDetailList();
                            modifyFlag = false; // resetFormModifed();
                        }, function() {
                            return;
                        });
                	}

                	function getCommonCodeDetailList(){
	                    highDomainCode = e.item.highDomainCode;
	                    instanceLength = e.item.instanceLength;
	                    domainCodeInfo = e.item;
	                    domainCodeInfo.domainCode = e.item.id;

	                    var requestData = { domainCode : e.item.id,
	                        tntInstId: tntInstId,
	                        motherTntInstId: getMotherTntInstId(),
	                        inqrySeqSort : true
	                    };
	                    gdomainCode = e.item.id;
	                    PFRequest.get('/commonCode/getCommonCodeDetailList.json',requestData, {
	                        success: function(responseMessage) {

	                            $el.find('.pf-cd-info-wrap').addClass('active');
	                            $el.find('.pf-cd-info').html(commonCodeDetailInfoTpl());
	                            $el.find('.pf-cd-detail-info').html(commonCodeDetailManagementPopupTpl(domainCodeInfo));

	                            if(responseMessage.length !== 0){
	                                if(responseMessage[0].isMotherData === true){
	                                    for(var i = 0; i < responseMessage.length ; i++){
	                                        responseMessage[i].process = 'C';
	                                    }
	                                }
	                            }
	                            deleteInstanceList = [];
	                            commonCodeDetailGrid = commonCodeDetailListGrid();
	                            commonCodeDetailGrid.setData(responseMessage);

	                            if(child || writeYn == 'N'){
	                                $el.find('.add-detail-btn').hide();
	                            }
	                            if(loginTntInstId != tntInstId){
	                            	$el.find('.add-detail-btn').hide();
	                            }
	                        },
	                        bxmHeader: {
	                            application: 'PF_Factory',
	                            service: 'CommonCodeDetailService',
	                            operation: 'queryListCommonCodeDetail'
	                        }
	                    });
	                }
                }


        });


        /* --------------------------------------
         * Context Menu Event - 도메인코드
         * -------------------------------------- */

        // 도메인코드 조회 이벤트
        var searchCommonCodeEvent = function() {

            var requestData={};
            requestData.domainCode = treeItem.id;
            if(!child){
                requestData.tntInstId=  tntInstId;
            }else{
                requestData.tntInstId=  getMotherTntInstId();
            }

            PFRequest.get('/commonCode/getCommonCodeMaster.json',requestData, {
                success: function(responseMessage) {
                    responseMessage.work = "UPDATE";
                    renderDomainCodeManagePopup(responseMessage);
                },
                bxmHeader: {
                    application: 'PF_Factory',
                    service: 'CommonCodeMasterService',
                    operation: 'queryCommonCodeMaster'
                }
            });
        }

        // 도메인코드 삭제 이벤트
        var deleteDomainCodeEvent = function() {

            PFComponent.showConfirm(bxMsg('domainCodeDeleteConfirm'), function() {
                deleteDomainCode(treeItem.id);
            }, function() {
                return;
            });



        }

        /* --------------------------------------
         * Context Menu
         * -------------------------------------- */

        // 공통코드 mother context menu
        var commonCodeMotherContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchDomainCode'), searchCommonCodeEvent),    // 도메인코드 조회
                makeContextMenu('icon-remove' , bxMsg('DeleteDomainCode'), deleteDomainCodeEvent),    // 도메인코드 삭제
            ]
        });

        // child와 권한이 없는경우 조회 메뉴만 보여줌
        var commonCodeChildContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchDomainCode'), searchCommonCodeEvent),    // 도메인코드 조회
            ]
        });

        // context menu 추가
        navTree.on('itemcontextmenu', function(ev){

            if(loginTntInstId != tntInstId) return; // 타기관 선택 시 contextmenu 보여주지 않음

            var item = ev.item;
            navTree.setSelected(item);
            treeItem = item;

            var y = ev.pageY >= 500 ? ev.pageY-(28*4) : ev.pageY;

            if(!child){ //mother
                commonCodeMotherContextMenu.set('xy', [ev.pageX, y]);
                commonCodeMotherContextMenu.show();
            }else{ //child
                commonCodeChildContextMenu.set('xy', [ev.pageX, y]);
                commonCodeChildContextMenu.show();
            }
            return false;
        });

    });
}

// 트리 박스 스크롤
function scrollMove(){
    var selectedItemTop = $('.pfui-tree-item .pfui-tree-item-selected').offset().top;
    $('.pf-left-nav .pf-panel-body').scrollTop(selectedItemTop-200);
}

//
function traceTree() {
    if(traceTree.completeTrace) {return;}

    var currentNode = navTreeStore.findNode(traceTree.traceList[traceTree.depth]);

    if(((traceTree.traceList.length - 1) === traceTree.depth)) {
        setTimeout(function() {
            navTree.setSelection(currentNode);
            //scrollMove();
        }, 500)
        traceTree.completeTrace = true;
        return;
    }else {
        navTree.expandNode(currentNode);
    }

    traceTree.depth++;
}

/******************************************************************************************************************
 * 사용자 함수
 ******************************************************************************************************************/
// Context Menu 생성
function makeContextMenu(icon, title, clickEvent, UIEvent){
    var listener;

    if(UIEvent){
        listener = {
            'click': function (e) {
                clickEvent();
            },
            afterRenderUI: function(e) {
                UIEvent();
            }
        }
    } else{
        listener = {
            'click': function (e) {
                clickEvent();
            }
        }
    }

    var contextMenu = {
        iconCls: icon,
        text: title,
        listeners: listener
    }

    return contextMenu;
}

// 도메인코드상세 그리드
function commonCodeDetailListGrid(){

    var columns = [];

    if(!child){
        columns.push({text: bxMsg('InstanceCode'), flex: 1, dataIndex: 'instanceCode', style: 'text-align:center',
                editor: {
                    allowBlank: false
                }
            },
            {text: bxMsg('InstanceCodeName'), flex: 1, dataIndex: 'instanceName', style: 'text-align:center',
                editor: {

                }
            },
            {text: bxMsg('InstanceCodeContent'), flex: 1, dataIndex: 'instanceContent', style: 'text-align:center',
                editor: {

                }
            }
        );
    }else{
        columns.push({text: bxMsg('InstanceCode'), flex: 1, dataIndex: 'instanceCode', style: 'text-align:center'},
            {text: bxMsg('InstanceCodeName'), flex: 1, dataIndex: 'instanceName', style: 'text-align:center'},
            {text: bxMsg('InstanceCodeContent'), flex: 1, dataIndex: 'instanceContent', style: 'text-align:center'}
        );
    }

    columns.push(
        {text: bxMsg('inquirysequence'), width: 100, dataIndex: 'inquirySequence', style: 'text-align:center',
            editor: {
            }
        },
        {xtype: 'checkcolumn', text: bxMsg('PAS0301String4'), width: 100, dataIndex: 'activeYnB',
            listeners: {
                checkchange: function(column, rowIndex, checked, eOpts){

                    if(checked){
                        grid.store.getAt(rowIndex).set('activeYn', 'Y');
                    }else{
                        grid.store.getAt(rowIndex).set('activeYn', 'N');
                    }
                    if(grid.store.getAt(rowIndex).get('process') != 'C'){
                        grid.store.getAt(rowIndex).set('process', 'U');
                        modifyFlag = true;
                    }
                }
            }
        },
        {text: bxMsg('lastModifier'), flex: 1, dataIndex: 'lastModifier', style: 'text-align:center'},
        {text: bxMsg('lastModifiedDate'), flex: 1, dataIndex: 'gmtLastModify', style: 'text-align:center'}
        );

    if(!child){
        columns.push({   // delete row
            xtype: 'actioncolumn', width: 35, align: 'center', sortable: false,
            items: [{
            icon: '/images/x-delete-16.png',
            handler: function (grid, rowIndex, colIndex, item, e, record) {
                if(record.data.process != 'C') {
                    record.data.process = 'D';
                    deleteInstanceList.push(record.data);
                }
                record.destroy();
                modifyFlag = true;
            }
        }]
        });
    }

    var grid = PFComponent.makeExtJSGrid({
        pageAble: true,
        fields: ['instanceCode', 'instanceName', 'instanceContent','inquirySequence', 'activeYn', 'process',
            {
                name: 'activeYnB',
                convert: function (newValue, record) {
                   if (record.get('activeYn') == 'Y') {
                       return true;
                    }
                    return false;
                 }
             },'lastModifier', 'gmtLastModify', 'Z_Del'],
        gridConfig: {
            renderTo: '.detail-grid',
            columns: columns,
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                        afteredit: function(e, editor){
                            if(editor.originalValue !=  editor.value && editor.record.get('process') != 'C'){
                                editor.record.set('process', 'U');
                                modifyFlag = true;
                            }
                        },
                        beforeedit:function(e, editor) {
                            if (editor.field == 'instanceCode' && editor.record.get('process') != 'C') {
                                return false;
                            }
                        }
                    }
                })
            ],
            listeners: {
                scope: this,
                    itemdblclick : function(tree, record){
                }
            }
        }
    });
    return grid;
}
