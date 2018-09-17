/**
 * condition template java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {

    setMainTapLeftPosition();

    var hash = parent.$('.pf-hidden .hash').text();
    if(hash) {
        location.hash = hash;
        parent.$('.pf-hidden .hash').text('');
    }

    renderConditionTemplateTree();
    renderDetailConditionTemplate();

});

$('body').css('overflow-y','scroll');

var modifyFlag = false;

var $el = $('.pf-dc');          // Page Root jQuery Element

var conditionInfoTpl,             // condition Info HTML Template
    conditionInfoFormTpl,     // condition Info Base Template in Sub Tab
    conditionInfoTab,             // Created Tab By Select condition in Tree Nav
    conditionListGridTpl,
    conditionEventGridTpl,
    listTypeItem,
    rangeTypeItem,
    palyerTypeItem,
    chargeTypeItem,
    copyConditionTplNmPopupTpl,
    conditionTemplateLeftTreeTpl;

var onEvent = PFUtil.makeEventBinder($el);
var lengthValidate = PFValidation.realTimeLengthCheck($el);
lengthValidate('.condition-name-valid',50);
lengthValidate('.condition-content-valid',200);
lengthValidate('.condition-charge-item-valid',64);

PFComponent.toolTip($el);

var statusFlag;
var conditionStore;
var navTree;
function scrollMove(){
    var selectedItemTop = $('.pfui-tree-item.pfui-tree-item-selected').offset().top;
    $('.pf-left-nav .pf-panel-body').scrollTop(selectedItemTop-200);
}

onEvent('click', 'a', function(e) { e.preventDefault(); });

onEvent('click', '.refresh-icon', function(e) {
    renderConditionNavTree.isRendered = false;
    renderConditionNavTree();
    $('.pf-detail-wrap').removeClass('active');
});

onEvent('click', '.sidebar-toggler', function(e) {
    var $target = $(e.currentTarget);

    $el.toggleClass('contents-expand');

    if($el.hasClass('contents-expand')) {
        $target.text('>');
    }else {
        $target.text('<');
    }

    setTimeout(function() {
        $('.manual-resize-component:visible').resize();
    }, 600);
});

onEvent('click', '.condition-template-search-name', function(e) {
    $el.find('.condition-template-search-list-wrap').removeClass('active');
});

onEvent('keyup', '.condition-template-search-name', function(e) {
    var conditionName = this.value.split(' ').join('');
    if (e.keyCode == '13' && conditionName) {
        loadConditionTemplateList(conditionName);
    }
});

onEvent('click', '.condition-template-search-btn', function(e) {
    var conditionName =  $el.find('.condition-template-search-name').val().split(' ').join('');

    if (conditionName) loadConditionTemplateList(conditionName);
});

// 목록참조유형코드 변경시
onEvent('change', '.list-ref-type-code', function(e){
    modifyFlag = true;

    // 목록코드일 때
    if($('.list-ref-type-code').val() == '01'){

    	if(writeYn == 'Y') {    $('.add-list-btn').show(); }
        $('.cmn-code-div').hide();
    	$('.table-code-div').hide();

        $('.ref-target-name').val('');
        $('.cmn-code-name').val('');

        $('.pf-dc-list-grid').empty();
        renderConditionListGrid({});

    // 공통코드일때
    }else if($('.list-ref-type-code').val() == '02'){

        $('.add-list-btn').hide();
    	$('.cmn-code-div').show();
    	$('.table-code-div').hide();

        $('.pf-dc-list-grid').empty();

    // 테이블참조일때
    }else if($('.list-ref-type-code').val() == '03'){

    	$('.add-list-btn').hide();
    	$('.cmn-code-div').hide();
    	$('.table-code-div').show();

    	$('.pf-dc-list-grid').empty();
    }

});


// 참조대상명 클릭 시
onEvent('click', '.ref-target-name', function(e) {

    // 02.공통코드 일 때
    if($('.list-ref-type-code').val() == '02'){
        PFPopup.selectCommonCode({}, function(selectedData) {
            $('.ref-target-name').val(selectedData.domainCode);
            $('.cmn-code-name').val(selectedData.domainContent);

            var requestParam = {
                domainCode : selectedData.domainCode,
                motherTntInstId : getLoginTntInstId()
            };

            PFRequest.get('/commonCode/getCommonCodeDetailList.json', requestParam,{
                success: function (responseData) {

                    responseData.forEach(function(el){
                        el.key = el.instanceCode;
                        el.value = el.instanceName;
                    });

                    $('.pf-dc-list-grid').empty();
                    renderConditionListGrid(responseData, '02');

                },
                bxmHeader: {
                    application: 'PF_Factory',
                    service: 'CommonCodeDetailService',
                    operation: 'queryListCommonCodeDetail'
                }
            })

            modifyFlag = true;
        });
    }
});

// 테이블 선택 변경시
onEvent('change', '.list-ref-table-code', function(e){
	$('.list-ref-table-code-column').val('');
	$('.list-ref-table-name-column').val('');
	$('.pf-dc-list-grid').empty();
	renderConditionListGrid([], '03');
})

// 명컬럼 엔터 입력
onEvent('keydown.xdsoft' , '.list-ref-table-name-column', function(e){
	if (e.keyCode == '13') {

		var requestParam = {
			table : $('.list-ref-table-code').val(),
			code  : $('.list-ref-table-code-column').val(),
			name  : $('.list-ref-table-name-column').val()
		};

		PFRequest.get('/system/getCodeName.json', requestParam,{
            success: function (responseData) {

                responseData.forEach(function(el){
                    el.key = el.code;
                    el.value = el.name;
                });

                $('.pf-dc-list-grid').empty();
                renderConditionListGrid(responseData, '03');

            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'SystemService',
                operation: 'getCodeName'
            }
        })
    }
});

function loadConditionTemplateList(conditionName) {
    $el.find('.condition-template-search-list-wrap').addClass('active');
    $el.find('.condition-template-search-list-wrap').empty();

    //var tntInstId = $('.product-factory-header', parent.document).find('.pf-multi-entity').val();
    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();

    PFUI.use(['pfui/tree', 'pfui/data'], function (Tree, Data) {

        var store;

        if (g_serviceType == g_bxmService) {  // bxm
            var params = {
                header: {
                    application: 'PF_Factory',
                    service: 'CndTemplateService',
                    operation: 'queryListCndTemplate'
                },
                input: {
                    tntInstId: loginTntInstId,
                    conditionName: conditionName,
                    activeYn: '05',
                    commonHeader: {
                        loginTntInstId: loginTntInstId
                    }
                }
            };
            store = new Data.TreeStore({
                autoLoad: false,
                dataProperty: 'list',
                url: '/serviceEndpoint/json/request.json',
                proxy: {
                    method: 'POST',
                    ajaxOptions: {
                        contentType: 'application/json; charset=UTF-8',
                        data: JSON.stringify(params)
                    },
                    dataType: 'json'
                },
                map: {
                    'codeAndName': 'text'
                }
            });

        } else {
            store = new Data.TreeStore({
                autoLoad: false,
                dataProperty: 'list',
                url: '/condition/template/queryConditionTemplateBaseForList.json?tntInstId=' + loginTntInstId + '&commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '"}',
                map: {
                    'codeAndName': 'text'
                }
            });
        }

        store.on('beforeprocessload', function (ev) {
            var data = ev.data;

            if(data.ModelMap){
                data.responseMessage = data.ModelMap.responseMessage;
                delete data.ModelMap.responseMessage;
            }

            if (data.responseMessage) {
                data.list = data.responseMessage;

                for(var i = 0 ; i < data.list.length ; i++){
                    data.list[i].codeAndName = '[' + data.list[i].code + ']' + data.list[i].name;
                }
            } else {
                data.list = [];
            }

        });

        if (g_serviceType == g_bxmService) {
            store.load();
        }else{
            store.load({conditionName: conditionName, activeYn: '05'});
        }

        var tree = new Tree.TreeList({
            render : '.condition-template-search-list-wrap',
            showLine : false,
            store : store,
            showRoot : false
        });

        tree.render();

        tree.on('itemdblclick', function(e) {
            location.hash = 'conditionCode=' + e.item.code;
            location.reload();

            if(!modifyFlag){
                $el.find('.condition-template-search-list-wrap').removeClass('active');
            }
        });
    });
}

onEvent('click','.save-btn',function(e){

    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    var form = PFComponent.makeYGForm($('.pf-dc-info-form'));
    var requestForm = form.getData();
    requestForm.name = requestForm.name == null ? '' : requestForm.name.split(' ').join('');

    var mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');
    var specialCheck =  PFValidation.specialCharacter('.special');
    var nameLengthCheck = PFValidation.finalLengthCheck('',50,requestForm.name);
    var contentLengthCkeck = PFValidation.finalLengthCheck('',200,requestForm.content);

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();

    if(isNotMyTask(projectId)) return;

    switch (statusFlag){
        case '01' :
            saveListTypeConditionTemplate(requestForm);
            break;
        case '02' :
            saveRangeTypeConditionTemplate(requestForm);
            break;
        case '03' :
            saveInterestTypeConditionTemplate(requestForm);
            break;
        case '04' :
            saveFeeTypeConditionTemplate(requestForm);
            break;
    }

    function saveListTypeConditionTemplate(requestForm){
        var dontSaveFlag = true;

        if(requestForm.currentCatalogId == '06'){   // 여부 일 때
            requestForm.listReferenceTypeCode = '01';        // 목록참조유형코드 = 01.목록코드
        }

        if(requestForm.listReferenceTypeCode == '01') { // 목록참조유형코드 = 01.목록코드 일 때
            requestForm.values = listGrid.getAllData();

            if (requestForm.values.length > 0) {
                dontSaveFlag = !(
                    checkListTypeMandatoryValue(requestForm) && checkListTypeSpecialChar(requestForm) &&
                    mandatoryCheck && nameLengthCheck && specialCheck && contentLengthCkeck
                );
            } else {
                PFComponent.showMessage(bxMsg('DPJ0122Error1'), 'warning');
                dontSaveFlag = true;
            }

            requestForm.referenceTargetName = "";

            if(dontSaveFlag) return;
        }else{
            requestForm.values = [];

            // 목록참조유형코드 = 02.공통코드 일 때
            if(requestForm.listReferenceTypeCode == '02') {
            	requestForm.referenceTargetName = $('.ref-target-name').val();
            }
            // 목록참조유형코드 = 03.테이블 일 때
            else if(requestForm.listReferenceTypeCode == '03') {
            	requestForm.referenceTargetName = $('.list-ref-table-code').val() + '@' + $('.list-ref-table-code-column').val() + '@' + $('.list-ref-table-name-column').val();
            }
        }

        saveConditionTemplate(requestForm);
    }

    function saveRangeTypeConditionTemplate(requestForm){
        requestForm.isSingleValue = $('.single-value-checkbox').prop('checked') ? 'Y' : 'N';

        var dontSaveFlag = !(mandatoryCheck && nameLengthCheck && specialCheck);
        if(dontSaveFlag) return;

        saveConditionTemplate(requestForm);
    }

    function saveInterestTypeConditionTemplate(requestForm){
        var dontSaveFlag = !(mandatoryCheck && nameLengthCheck && specialCheck);
        if(dontSaveFlag) return;

        saveConditionTemplate(requestForm)
    }

    function saveFeeTypeConditionTemplate(requestForm){
        //var gridData;
        //
        //var chargeNameLengthCheck = PFValidation.finalLengthCheck('',64,requestForm.chargeItemName);
        //var chargeCodeLengthCheck = PFValidation.finalLengthCheck('',64,requestForm.chargeItemCode);
        //var gridDataLengthCheck = true;
        //
        //if(eventGrid.getAllData()[0]){
        //    gridData = eventGrid.getAllData()[0];
        //
        //    gridDataLengthCheck = PFValidation.finalLengthCheck('',8,gridData.eventCode, "01", bxMsg('MTM0100String11'));
        //
        //    var codeReg = /[^a-zA-Z0-9\_]/;
        //
        //    if(codeReg.test(gridData.eventCode)){
        //        PFComponent.showMessage(bxMsg('ConditionListTypeKeyValidationError'), 'warning');
        //        specialCheck = false;
        //    }
        //
        //    gridData.eventCode = gridData.eventCode.split(' ').join('');
        //    requestForm.event = gridData;
        //}
        //
        //var dontSaveFlag = !(
        //mandatoryCheck && specialCheck &&
        //nameLengthCheck && chargeCodeLengthCheck &&
        //chargeNameLengthCheck && gridDataLengthCheck
        //);
        //

        var dontSaveFlag = !(mandatoryCheck && specialCheck)
        if(dontSaveFlag) return;

        saveConditionTemplate(requestForm);
    }

    function saveConditionTemplate(requestForm){

    	if(!modifyFlag){
    		// 변경된 정보가 없습니다.
    		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
    		return;
    	}

        requestForm.projectId = projectId;
        PFRequest.post('/condition/template/saveConditionTemplate.json',requestForm,{
            success: function(responseData){
                var changedNode = conditionStore.findNode(requestForm.code);
                changedNode.text = '[' + requestForm.code + ']' + requestForm.name;
                conditionStore.update(changedNode);
                $('.most-significant-box').removeAttr('data-edited');
                modifyFlag = false;

                PFComponent.showMessage(bxMsg('workSuccess'), 'success',function(){
                    location.hash = 'conditionCode=' + requestForm.code;
                });
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'CndTemplateService',
                operation: 'saveCndTemplate'
            }
        });
    }

    function checkListTypeMandatoryValue(requestForm){
        var saveFlag = true;
        $.each(requestForm.values,function(index,value){
            if( !(requestForm.values[index].key) || !(requestForm.values[index].value) ) {
                PFComponent.showMessage(bxMsg('Z_EmptyInputValue'), 'warning');
                saveFlag = false;
                return false;
            }
            requestForm.values[index].key=value.key.split(' ').join('');
            requestForm.values[index].value=value.value.split(' ').join('');
        });

        return saveFlag;
    }

    function checkListTypeSpecialChar(requestForm){
        var codeReg = /[^a-zA-Z0-9\_]/;
        var nameReg = /[`~!@#$%^&*+=|\\\'\";:\/?]/;

        var saveFlag = true;
        $.each(requestForm.values,function(index,value){
            if(codeReg.test(value.key)){
                PFComponent.showMessage(bxMsg('ConditionListTypeKeyValidationError'), 'warning');
                saveFlag = false;
                return false;
            }

            if(nameReg.test(value.value)){
                PFComponent.showMessage(bxMsg('specialCharacterMsg'), 'warning');
                saveFlag = false;
                return false;
            }
        });

        return saveFlag;
    }

});

// Load Template in HTML
conditionInfoFormTpl = getTemplate('conditionInfoFormTpl');
conditionListGridTpl = getTemplate('conditionListGridTpl');
listTypeItem = getTemplate('listTypeItem');
rangeTypeItem = getTemplate('rangeTypeItem');
chargeTypeItem = getTemplate('chargeTypeItem');
copyConditionTplNmPopupTpl = getTemplate('copyConditionTplNmPopupTpl');
conditionTemplateLeftTreeTpl = getTemplate('conditionTemplateLeftTreeTpl');


function renderConditionTemplateTree(){
    $('.pf-dc-left-tree-box').html(conditionTemplateLeftTreeTpl());
}


function traceTree() {
    if(traceTree.completeTrace) {return;}

    var currentNode = conditionStore.findNode(traceTree.traceList[traceTree.depth]);

    if((traceTree.traceList.length - 1) === traceTree.depth) {
        setTimeout(function() {
            navTree.setSelection(currentNode);
            scrollMove();
        }, 500)
        traceTree.completeTrace = true;
        return;
    }else {
        navTree.expandNode(currentNode);
    }

    traceTree.depth++;
}

function renderConditionNavTree() {
    if(renderConditionNavTree.isRendered) { return; }
    renderConditionNavTree.isRendered = true;

    //var tntInstId = $('.product-factory-header', parent.document).find('.pf-multi-entity').val();
    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();

    PFUI.use(['pfui/tree', 'pfui/data', 'pfui/menu'], function (Tree, Data, Menu) {

        var treeType = 'CT';

        if (g_serviceType == g_bxmService){
            var params = {
                header: {
                    application: 'PF_Factory',
                    service: 'CatalogService',
                    operation: 'queryCatalog'
                },
                input: {
                    tntInstId: loginTntInstId,
                    treeType: treeType,
                    commonHeader: {
                        loginTntInstId: loginTntInstId
                    }
                }
            };

            conditionStore = new Data.TreeStore({
                autoLoad: false,
                url: '/serviceEndpoint/json/request.json',
                dataProperty: 'childCatalogs',
                proxy : {
                    method : 'POST',
                    ajaxOptions : {
                        contentType: 'application/json; charset=UTF-8',
                        data:JSON.stringify(params)
                    },
                    dataType : 'json'
                },
                map: {
                    'name': 'text',
                    'id': 'id',
                    'bottom': 'leaf'
                }
            });
        } else {
            conditionStore = new Data.TreeStore({
                autoLoad: false,
                url: '/catalog/getCatalog.json?tntInstId=' + loginTntInstId + '&commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '"}'+ '&treeType=' + treeType,
                dataProperty: 'childCatalogs',
                map: {
                    'name': 'text',
                    'id': 'id',
                    'bottom': 'leaf'
                }
            });
        }

        // click change url params
        conditionStore.on('beforeload', function (ev) {
            var params = ev.params;
            var node = conditionStore.findNode(params.id);
            var queryParams;

            //params.idType = node.type;
            //params.firstCatalogId = '01';
            if(!node) { return; }

            if(g_serviceType == g_bxmService){  // bxm
                if (node.type === '01') {
                    queryParams = {
                        header: {
                            application: 'PF_Factory',
                            service: 'CatalogService',
                            operation: 'queryCatalog'
                        },
                        input: {
                            tntInstId: loginTntInstId,
                            treeType: treeType,
                            idType: node.record.type,
                            id:node.record.id,
                            commonHeader: {
                                loginTntInstId: loginTntInstId
                            }
                        }
                    };
                    conditionStore.get('proxy').set('ajaxOptions', {
                        contentType: 'application/json; charset=UTF-8',
                        data:JSON.stringify(queryParams)
                    });
                    conditionStore.set('map', {
                        'name': 'text',
                        'id': 'id',
                        'bottom': 'leaf'
                    });
                }
                else{
                    queryParams = {
                        header: {
                            application: 'PF_Factory',
                            service: 'CndTemplateService',
                            operation: 'queryListCndTemplate'
                        },
                        input: {
                            tntInstId: loginTntInstId,
                            treeType: treeType,
                            conditionDetailTypeCode:  node.record.id,
                                commonHeader: {
                                     loginTntInstId: loginTntInstId
                            }
                        }
                    };
                    conditionStore.get('proxy').set('ajaxOptions', {
                        contentType: 'application/json; charset=UTF-8',
                        data:JSON.stringify(queryParams)
                    });
                    conditionStore.set('map', {
                        'codeAndName': 'text',
                        'code': 'id'
                    });
                }

            }
            else {

                queryParams = 'tntInstId=' + loginTntInstId + '&commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '"}';

                if (node.type === '01') {
                    queryParams = queryParams + '&idType=' + node.record.type + '&treeType=' + treeType;
                    conditionStore.get('proxy').set('url', '/catalog/getCatalog.json?' + queryParams);
                    conditionStore.set('map', {
                        'name': 'text',
                        'id': 'id',
                        'bottom': 'leaf'
                    });
                } else {
                    queryParams = queryParams + '&conditionDetailTypeCode=' + node.record.id;
                    conditionStore.get('proxy').set('url', '/condition/template/queryConditionTemplateBaseForList.json?' + queryParams);
                    conditionStore.set('map', {
                        'codeAndName': 'text',
                        'code': 'id'
                    });
                }
            }

        });

        conditionStore.on('beforeprocessload', function (ev) {
            var data = ev.data;

            if(data.ModelMap){
                data.responseMessage = data.ModelMap.responseMessage;
                delete data.ModelMap.responseMessage;
            }

            if($.isArray(data.responseMessage)) {
                data.childCatalogs = data.responseMessage;
                for(var i = 0 ; i < data.childCatalogs.length ; i++){
                    data.childCatalogs[i].codeAndName = '[' + data.childCatalogs[i].code + ']' + data.childCatalogs[i].name;
                }
            }else if (data.responseMessage) {
                data.childCatalogs = data.responseMessage.childCatalogs || [];
            }
        });

        conditionStore.on('load', function() {
            traceTree();
        });

        conditionStore.load();

        navTree = new Tree.TreeList({
            render : '.pf-dc-tree-nav',
            showLine : false,
            store : conditionStore,
            checkType : 'none',
            showRoot : false
        });

        $('.pf-dc-tree-nav').empty();
        navTree.render();

        var treeItem;

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

        var openContextMenuEvent = function (){
            location.hash = 'conditionCode=' + treeItem.id;
            if(!modifyFlag){
                renderDetailConditionTemplate();
            }else{
                PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
                    renderDetailConditionTemplate();
                    modifyFlag = false;
                    $('.most-significant-box').removeAttr('data-edited');
                }, function() {
                    return;
                });
            }
        };

        var renameContextMenuEvent = function (){
            if(!isHaveProject()){
                haveNotTask();
                return;
            }

            var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
            if(isNotMyTask(projectId)){
                return;
            };
            renderConditionTemplateRenamePopup(treeItem);

        };

        var removeContextMenuEvent = function (){
            if(!isHaveProject()){
                haveNotTask();
                return;
            }

            var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
            if(isNotMyTask(projectId)){
                return;
            };

            var requestData = {
                "conditionCode" : treeItem.id,
                "projectId" : projectId
            };

            PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), function() {
                PFRequest.post('/condition/template/deleteConditionTemplate.json',requestData,{
                    success: function(){
                        var deleteNode = conditionStore.findNode(treeItem.id);
                        conditionStore.remove(deleteNode);
                        renderConditionNavTree();
                        $('.pf-detail').empty();
                        $('.pf-detail-wrap').removeClass('active');

                        modifyFlag = false;
                        PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CndTemplateService',
                        operation: 'deleteCndTemplate'
                    }
                });
            }, function() {
                return;
            });
        };

        var createContextMenuEvent = function (){
            if(!makeActionRibbonEvent()) return;
            renderConditionTemplateCreatePopup(treeItem);
        };

        var activeProductContextMenu = new Menu.ContextMenu({
            children : [
                makeContextMenu('icon-zoom-in' ,bxMsg('Context_Menu2'), openContextMenuEvent),
                //makeContextMenu('icon-book', bxMsg('Context_Menu3'), copyContextMenuClickEvent, copyContextMenuRenderEvent),
                makeContextMenu('icon-pencil', bxMsg('Context_Menu4'), renameContextMenuEvent),
            ]
        });

        var inactiveProductContextMenu = new Menu.ContextMenu({
            children : [
                makeContextMenu('icon-zoom-in' ,bxMsg('Context_Menu2'), openContextMenuEvent),
                //makeContextMenu('icon-book', bxMsg('Context_Menu3'), copyContextMenuClickEvent, copyContextMenuRenderEvent),
                makeContextMenu('icon-pencil', bxMsg('Context_Menu4'), renameContextMenuEvent),
                makeContextMenu('icon-remove', bxMsg('Context_Menu5'), removeContextMenuEvent)
            ]
        });

        var centerBankContextMenu = new Menu.ContextMenu({
            children : [
                makeContextMenu('icon-zoom-in' ,bxMsg('Context_Menu2'), openContextMenuEvent)
            ]
        })

        var parentNodeContextMenu = new Menu.ContextMenu({
            children : [makeContextMenu('icon-th-list', bxMsg('Context_Menu1'), createContextMenuEvent)]
        });

        onEvent('click','.delete-btn',function(){

            if(!isHaveProject()){
                haveNotTask();
                return;
            }

            var form = PFComponent.makeYGForm($('.pf-dc-info-form'));

            var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
            if(isNotMyTask(projectId)){
                return;
            };

            var requestData = {
                "conditionCode" : form.getData().code,
                "projectId" : projectId
            };

            PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), function() {
                PFRequest.post('/condition/template/deleteConditionTemplate.json',requestData,{
                    success:function(){
                        var deleteNode = conditionStore.findNode(form.getData().code);
                        conditionStore.remove(deleteNode);
                        renderConditionNavTree();
                        $('.pf-detail').empty();
                        $('.pf-detail-wrap').removeClass('active');
                        PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CndTemplateService',
                        operation: 'deleteCndTemplate'
                    }
                });
            }, function() {
                return;
            });

        });

        navTree.on('itemcontextmenu', function(ev) {
            var item = ev.item;
            navTree.setSelected(item);
            treeItem = item;
            var activeY = ev.pageY >= 500 ? ev.pageY - (28 * 4) : ev.pageY;
            var inactiveY = ev.pageY >= 500 ? ev.pageY - (28 * 5) : ev.pageY;

            if (treeItem.type == '01' && !treeItem.leaf) {
                return false;
            } else if (treeItem.id.indexOf('.') > 0 || !treeItem.leaf) {
                if (getLoginTntInstId() != getMotherTntInstId() || writeYn != 'Y') {
                    return false;
                } else {
                    parentNodeContextMenu.set('xy', [ev.pageX, ev.pageY]);
                    parentNodeContextMenu.show();
                }
            } else if (treeItem.id != '01' && (getLoginTntInstId() != getMotherTntInstId() || writeYn != 'Y')) {
                centerBankContextMenu.set('xy', [ev.pageX, ev.pageY]);
                centerBankContextMenu.show();
            } else if (getSelectedProjectId() && isEmergency(getSelectedProjectId())){
                inactiveProductContextMenu.set('xy',[ev.pageX,inactiveY]);
                inactiveProductContextMenu.show();
            } else if(treeItem.id != '01' && (treeItem.isActive == 'Y')){
                activeProductContextMenu.set('xy',[ev.pageX,activeY]);
                activeProductContextMenu.show();
            } else if(treeItem.id != '01' && treeItem.isActive == 'N'){
                inactiveProductContextMenu.set('xy',[ev.pageX,inactiveY]);
                inactiveProductContextMenu.show();
            }
            return false; //prevent the default menu
        });

        navTree.on('itemdblclick', function(e) {
            if (e.item.tntInstId) {
                location.hash = 'conditionCode=' + e.item.id;
                if(!modifyFlag){
                    renderDetailConditionTemplate();
                }else{
                    PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
                        renderDetailConditionTemplate();
                        modifyFlag = false;
                        $('.most-significant-box').removeAttr('data-edited');
                    }, function() {
                        return;
                    });
                }
            }
        });

    });
}

function renderDefaultInfo(data){
    $el.find('.pf-dc-info-wrap').addClass('active');
    $el.find('.pf-dc-info').html(conditionInfoFormTpl(data));
    if(data){
        $($('.default-layout-task-menu', parent.document)[1]).find('.save-tab-project-id').val(data.projectBaseVO.projectId);
    }

    //저축은행중앙회가 아닐경우 수정불가능
    //if($('.pf-multi-entity', parent.document).val() != '000'){
    //if(getLoginTntInstId() != '000'){
    if(getLoginTntInstId() != getMotherTntInstId() || writeYn != 'Y'){
        $('.save-btn').prop('disabled', true);
        $('.delete-btn').prop('disabled', true);
    }
}

function renderDetailConditionTemplate(){

//	pf-event에서 처리
//    $('.pf-detail-wrap').on('change','input',function(){
//        modifyFlag = true;
//        $('.most-significant-box').attr('data-edited','true');
//    });

    var hash = PFUtil.getHash();

    if(!hash) {
        traceTree.completeTrace = true;
        renderConditionNavTree();
        return;
    }

    var requestParam = {};
    $.each(hash.split('&'),function(index, hashItem){
        var param = hashItem.split('=');
        requestParam[param[0]] = param[1];
    })

    PFRequest.get('/condition/template/getConditionTemplate.json',requestParam, {
        success: function(responseData){

            var firstNodeId = responseData.type,
                secondNodeId = firstNodeId + '.' + responseData.currentCatalogId;

            traceTree.traceList = [firstNodeId, secondNodeId, responseData.code];
            traceTree.depth = 0;

            renderConditionNavTree();

            renderDefaultInfo(responseData);

            if(responseData.isActive=='Y'){
                $('.delete-btn').attr('disabled',true);
            };

            setTaskRibbonInput(responseData.projectBaseVO.projectId,responseData.projectBaseVO.name);

            function setEnumInForm(enumData, serverData, targetSelector){
                $.each(enumData,function(code, name){
                    if(code == serverData){
                        $(targetSelector).val(name);
                    }
                });
            }

            setEnumInForm(codeMapObj.ProductConditionTypeCode,responseData.type,'.condition-type-name');
            setEnumInForm(codeMapObj.TemplateActiveYnCode,responseData.isActive,'.condition-active-status-name');
            setEnumInForm(codeMapObj.ProductConditionDetailTypeCode,responseData.currentCatalogId,'.condition-detail-type-name');
            // 2017.01.20 OHS 수정, 조건유형별로 조건세부유형값 분기 세팅처리
            // setEnumInForm(codeMapObj.ProductConditionInterestDetailTypeCode,responseData.currentCatalogId,'.condition-detail-type-name');
            // setEnumInForm(codeMapObj.ProductConditionFeeDetailTypeCode,responseData.currentCatalogId,'.condition-detail-type-name');

            switch (responseData.type){
                case '01' :
                    statusFlag = '01';
                    $('.type-content').html(conditionListGridTpl());

                    // 여부 일때
                    if (responseData.currentCatalogId == '06') {
                        $('.add-list-btn').hide();
                        renderConditionYNListGrid(responseData['values']);

                    // 목록형 일때
                    } else {
                        $('.pf-dc-info-form').append(listTypeItem());      //
                        renderComboBox('ListReferenceTypeCode', $('.list-ref-type-code'), responseData.listReferenceTypeCode ? responseData.listReferenceTypeCode : '01');
                        renderComboBox('ListReferenceTableCode', $('.list-ref-table-code'), responseData.listReferenceTypeCode ? responseData.listReferenceTypeCode : '01');

                        // listReferenceTypeCode = 01.목록코드
                        if($('.list-ref-type-code').val() == '01' || responseData.listReferenceTypeCode == '01'){

                        	if(writeYn == 'Y') {    $('.add-list-btn').show(); }
                        	$('.cmn-code-div').hide();
                        	$('.table-code-div').hide();

                         // listReferenceTypeCode = 02.공통코드
                        }else if($('.list-ref-type-code').val() == '02' || responseData.listReferenceTypeCode == '02'){

                        	$('.add-list-btn').hide();
                        	$('.cmn-code-div').show();
                        	$('.table-code-div').hide();

                            $('.ref-target-name').val(responseData.referenceTargetName);
                            $('.cmn-code-name').val(parent.codeNameMap[responseData.referenceTargetName]);

                        // listReferenceTypeCode = 03.테이블
                        }else if($('.list-ref-type-code').val() == '03' || responseData.listReferenceTypeCode == '03'){

                        	$('.add-list-btn').hide();
                        	$('.cmn-code-div').hide();
                        	$('.table-code-div').show();

                        	var listRefTableCode = responseData.referenceTargetName.split('@');
                        	$('.list-ref-table-code').val(listRefTableCode[0]);
                            $('.list-ref-table-code-column').val(listRefTableCode[1]);
                            $('.list-ref-table-name-column').val(listRefTableCode[2]);
                        }

                        renderConditionListGrid(responseData['values'], $('.list-ref-type-code').val());
                    }
                    break;

                case '02' :
                    statusFlag = '02';

                    $('.pf-dc-info-form').append(rangeTypeItem());
                    $('.is-single-value-item').val(responseData.isSingleValue);

                    if(responseData.isSingleValue=='Y'){
                        $('.single-value-checkbox').prop('checked',true);
                    }

                    break;

                case '03' :
                	setEnumInForm(codeMapObj.ProductConditionInterestDetailTypeCode,responseData.currentCatalogId,'.condition-detail-type-name');
                    statusFlag = '03';

                    break;

                case '04' :
                	setEnumInForm(codeMapObj.ProductConditionFeeDetailTypeCode,responseData.currentCatalogId,'.condition-detail-type-name');

                    statusFlag = '04';

                    $('.pf-dc-info-form').append(chargeTypeItem());
                    renderComboBox('ProductAmountTypeCode', $('.amtTpDscd'), responseData.amtTpDscd ? responseData.amtTpDscd : '');
                    //renderComboBox('A0129', $('.amtTpDscd'), responseData.amtTpDscd ? responseData.amtTpDscd : '');
                    renderComboBox('FeeSettleTypeCode', $('.prePostAcqstnDscd'), responseData.prePostAcqstnDscd ? responseData.prePostAcqstnDscd : '', true, '');
                    renderComboBox('ProductBooleanCode', $('.returnFeeYn'), responseData.returnFeeYn ? responseData.returnFeeYn : 'N', true, '');

                    if(responseData.isActive=='Y'){
                        $('.fee-form-item').attr('disabled',true);
                    }

                    var event = !responseData['event'] ? null : responseData['event'];
                    //renderCondtionEventGrid(responseData['event']);

                    break;
            };

            // 권한이 없는 경우 버튼 숨김
            if(writeYn != 'Y'){
                $('.write-btn').hide();
            }

        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'CndTemplateService',
            operation: 'queryCndTemplate'
        }
    });

};

var listGrid;
function renderConditionListGrid(data, listReferenceTypeCode) {

    var columns;

    if (!listReferenceTypeCode || listReferenceTypeCode == '01') {

        columns = [
            {
                text: bxMsg('MTM0300String7'),
                flex: 1,
                dataIndex: 'key',
                editor: {allowBlank: false, maxLength: 20, minLength: 1}
            },
            {
                text: bxMsg('MTM0300String8'),
                flex: 2,
                dataIndex: 'value',
                editor: {allowBlank: false, maxLength: 200}
            },
            {
                xtype: 'actioncolumn', width: 35, align: 'center',
                items: [{
                    icon: '/images/x-delete-16.png',
                    handler: function (grid, rowIndex, colIndex, item, e, record) {
                        modifyFlag = true;
                        record.destroy();
                    }
                }]
            }
        ];
    } else {

        columns = [
            {
                text: bxMsg('MTM0300String7'),
                flex: 1,
                dataIndex: 'key'},
            {
                text: bxMsg('MTM0300String8'),
                flex: 2,
                dataIndex: 'value'
            }
        ];
    }

    listGrid = PFComponent.makeExtJSGrid({
        pageAble: true,
        fields: ['key','value'],
        gridConfig: {
            renderTo: '.pf-dc-list-grid',
            columns: columns,
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners: {
                        afteredit: function(e, editor) {
                            if (editor.originalValue != editor.value) {
                            	modifyFlag = true;
                            }
                        }
                    }
                })
            ]
        }
    });

    listGrid.setData(data);
}


// Y/N Condition Display Grid
function renderConditionYNListGrid(data) {
    listGrid = PFComponent.makeExtJSGrid({
        pageAble: true,
        fields: ['key','value'],
        gridConfig: {
            renderTo: '.pf-dc-list-grid',
            columns: [
                {text: bxMsg('MTM0300String7'), flex: 1, dataIndex: 'key'},
                {text: bxMsg('MTM0300String8'), flex: 2, dataIndex: 'value'},
            ],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners: {
                        afteredit: function(e, editor) {
                            if (editor.originalValue != editor.value) {
                            	modifyFlag = true;
                            }
                        }
                    }
                })
            ]
        }
    });

    listGrid.setData(data);
}



onEvent('click','.add-list-btn',function(){
    var newData = [{'key':'','value':''}];
    modifyFlag = true;
    listGrid.addData(newData);
})

// 호출하는 곳 없음 -> 삭제대상
var eventGrid;
function renderCondtionEventGrid(data){
    eventGrid = PFComponent.makeExtJSGrid({
        pageAble: true,
        fields: ['eventCode'],
        gridConfig: {
            renderTo: '.pf-dc-event-grid',
            columns: [
                {text: bxMsg('MTM0100String11'), flex: 1, dataIndex: 'eventCode',
                    editor: {
                        allowBlank: false
                    }
                },
                {
                    xtype: 'actioncolumn', width: 35, align: 'center',
                    items: [{
                        icon: '/images/x-delete-16.png',
                        handler: function (grid, rowIndex, colIndex, item, e, record){
                            modifyFlag = true;
                            record.destroy();
                        }
                    }]
                }
            ],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ]
        }
    });

    var resultData = [];
    resultData.push(data);
    if(data){
        eventGrid.setData(resultData);
    }else{
        eventGrid.setData([]);
    }
    //}

};

// 사용안함 -> 삭제대상
onEvent('click','.add-event-btn',function(){
    if(eventGrid.getAllData().length==1){
        PFComponent.showMessage(bxMsg('noMoreEventCode'), 'warning');
    }else{
        modifyFlag = true;
        var newData = {'eventCode':''};
        eventGrid.addData(newData);
    }
})

function makeActionRibbonEvent(){
    var result = true;

    if(!isHaveProject()){
        haveNotTask();
        return false;
    }

    if($($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val() === ''){
        selectNotTask();
        selectedYourTask();
        result = false;
        return;
    }

    if($($('.default-layout-task-menu', parent.document).find('.your-task')[0]).attr('data-status')=='true'){
        selectedYourTask();
        result = false;
        return;
    }

    return result;
}

function fnEmergencyControl(flag){

    if(writeYn == 'Y' && getLoginTntInstId() == getMotherTntInstId()){
        if(flag) {
            $('.write-btn').prop('disabled', false);
        }
        else if($('.condition-active-status-code').val() == 'Y'){
            $('.delete-btn').prop('disabled', true);
        }
    }
}