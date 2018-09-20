/**
 * product, point, service java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {
    setMainTapLeftPosition();

    // OHS 20171030 추가 - 개발과제변경내역 더블클릭시 Hash값 처리를 위함
    var hash = parent.$('.pf-hidden .hash').text();
    if(hash) {
        location.hash = hash;
        parent.$('.pf-hidden .hash').text('');
    }

    renderProductTemplateTree();
    renderProductInfo();
});


$('body').css('overflow-y','scroll');

// 상품정보구분코드
var pdInfoDscd_Product  = '01';  // 상품
var pdInfoDscd_Service  = '02';  // service
var pdInfoDscd_Point    = '03';  // point

var conditionTemplateTypeCode_Product = '01',
    conditionTemplateTypeCode_Service = '06',
    conditionTemplateTypeCode_Point = '07'

var modifyFlag = false;
var selectedCellIndex;

var $el = $('.pf-dp');          // Page Root jQuery Element

var productInfoFormTpl,     // Product Info Base Template in Sub Tab
    productTemplateLeftTreeTpl;

var cndGrid, selectedProduct, firstCatalogId, secondCatalogId, navTree, navTreeStore;
var statusMap = {},
    firstCatalogMap = {},
    secondCatalogMap = {},
    selectedGridData,
    deleteGridData = [],
    listMap = {};

var onEvent = PFUtil.makeEventBinder($el);

var lengthVlad = PFValidation.realTimeLengthCheck($el);

lengthVlad('.length-check-input', 50);
PFComponent.toolTip($el);

onEvent('click', 'a', function(e) { e.preventDefault(); });

onEvent('click', '.refresh-icon', function(e) {
    renderProductNavTree.isRendered = false;
    renderProductNavTree();
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

onEvent('click', '.product-template-search-name', function(e) {
    $el.find('.product-template-search-list-wrap').removeClass('active');
});

onEvent('keyup', '.product-template-search-name', function(e) {
    var productTemplateName = this.value.split(' ').join('');

    if (e.keyCode == '13' && productTemplateName) {
        loadProductTemplateList(productTemplateName);
    }
});

onEvent('click', '.product-template-search-btn', function(e) {
    var productTemplateName = $el.find('.product-template-search-name').val().split(' ').join('');

    if (productTemplateName) loadProductTemplateList(productTemplateName);
});

function loadProductTemplateList(productTemplateName) {
    $el.find('.product-template-search-list-wrap').addClass('active');
    $el.find('.product-template-search-list-wrap').empty();

    //var tntInstId = $('.product-factory-header', parent.document).find('.pf-multi-entity').val();
    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();

    PFUI.use(['pfui/tree', 'pfui/data'], function (Tree, Data) {
        var store;

        var params = {
            header: {
                application: 'PF_Factory',
                service: 'PdTemplateService',
                operation: 'queryListPdTemplate'
            },
            input: {
                tntInstId: loginTntInstId,
                pdInfoDscd : pdInfoDscd,
                name : productTemplateName,
                commonHeader:{
                    loginTntInstId : loginTntInstId,
                    lastModifier:  getLoginUserId()
                }
            }
        };

        if (g_serviceType == g_bxmService) {
            store = new Data.TreeStore({
                autoLoad: false,
                dataProperty: 'list',
                url: '/serviceEndpoint/json/request.json',
                proxy : {
                    method : 'POST',
                    ajaxOptions : {
                        contentType: 'application/json; charset=UTF-8',
                        data:JSON.stringify(params)
                    },
                    dataType : 'json'
                },
                map: {
                    'name': 'text'
                }
            });
        } else {
            store = new Data.TreeStore({
                autoLoad: false,
                dataProperty: 'list',
                url: '/product/template/queryProductTemplateBaseForList.json?tntInstId=' + loginTntInstId + '&pdInfoDscd=' + pdInfoDscd + '&commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '", "lastModifier":"' + getLoginUserId() +'"}',
                map: {
                    'name': 'text'
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
            } else {
                data.list = [];
            }

        });

        store.load({name : productTemplateName});

        var tree = new Tree.TreeList({
            render : '.product-template-search-list-wrap',
            showLine : false,
            store : store,
            showRoot : false
        });

        tree.render();

        tree.on('itemdblclick', function(e) {
            location.hash = makeProductTemplateInfoParameter(e.item);
            location.reload();

            if(!modifyFlag){
                $el.find('.product-template-search-list-wrap').removeClass('active');
            }
        });
    });
}

onEvent('click', '.product-save-btn', function() {

    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    };

    var gridData;
    if (!PFValidation.mandatoryCheck('.mandatory') || !PFValidation.specialCharacter('.special')) {
        return;
    }

    var requestParam = {
        "firstCatalogId": selectedProduct.firstCatalogId,
        "secondCatalogId": selectedProduct.secondCatalogId,
        "code": selectedProduct.code,
        "name": $el.find('.product-name-input').val().split(' ').join('')
    };
    requestParam.projectId = projectId;
    requestParam.pdInfoDscd = pdInfoDscd;

    gridData = deleteGridData.concat(cndGrid.getAllData());

    gridData.forEach(function(element, idx, arr) {
        element['mandatoryYn'] = (element['mandatoryYn']) ? 'Y' : 'N';
    });

    requestParam['conditionGroupTemplateItemList'] = gridData;

	if(!modifyFlag){
		// 변경된 정보가 없습니다.
		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
		return;
	}

    PFRequest.post('/product/template/saveProductTemplate.json', requestParam, {
        success: function(result) {
            PFUI.use('pfui/overlay', function(overlay){
                PFComponent.showMessage(bxMsg('workSuccess'), 'success',function(){

                });
                // OHS 20161027 세부유형 뎁스가 길어지면 nodeId값이 없을때 스크립트 오류 방지
                //var nodeId = requestParam.firstCatalogId + '.' + requestParam.secondCatalogId + '.' + requestParam.code;
                var nodeId = selectedProduct.id;
                var changedNode = navTreeStore.findNode(nodeId);
                changedNode.text = requestParam.name;
                navTreeStore.update(changedNode);
                modifyFlag = false;
                $('.most-significant-box').removeAttr('data-edited');
                renderProductInfo();
            });
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdTemplateService',
            operation: 'savePdTemplate'
        }
    });
});

onEvent('click', '.product-delete-btn', function() {
    deleteProduct();
});

function deleteProduct(treeItem) {
    if(!isHaveProject()){
        haveNotTask();
        return;
    }
    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    };

    var selectedItem =  treeItem || selectedProduct;

    if(selectedItem.status == '04' && (getSelectedProjectId() == '' || !getSelectedProjectId()) && !isEmergency(getSelectedProjectId())) {
        PFComponent.showMessage(bxMsg('activeProductTamplateDelete'), 'warning');
        return;
    }

    var requestParam = {
        "firstCatalogId": selectedItem.firstCatalogId,
        "secondCatalogId": selectedItem.secondCatalogId,
        "code": selectedItem.code
    };
    requestParam.projectId = projectId;
    requestParam.pdInfoDscd = pdInfoDscd;   // 01.상품


    PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), function() {
        PFRequest.post('/product/template/deleteProductTemplate.json', requestParam, {
            success: function(result) {
                if (result) {
                    $el.find('.pf-dp-info-wrap').removeClass('active');

                    var deleteNode = navTreeStore.findNode(selectedItem.id);
                    navTreeStore.remove(deleteNode);

                    //location.hash = '';       // 2015.09.23 유진 주석처리. 삭제 후 화면 깨짐.

                    if (result) {
                        var treeId = selectedItem.id.split('.'),
                            traceArr = [],
                            tempId = '',
                            firstIdx = true,
                            idLength = treeId.length;

                        treeId.forEach(function (el, idx) {
                            if (idLength - 1 == idx) {
                                return;
                            }

                            if (firstIdx) {
                                tempId = el;
                                firstIdx = false;
                            } else {
                                tempId = tempId + '.' + el;
                            }

                            traceArr.push(tempId);
                        });

                        traceTree.traceList = traceArr;

                        traceTree.depth = 0;

                        traceTree.completeTrace = false;
                        renderProductNavTree.isRendered = false;
                        renderProductNavTree();
                    }

                    PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                }
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'PdTemplateService',
                operation: 'deletePdTemplate'
            }
        });
    }, function() {
        return;
    });

}

onEvent('click', '.add-cnd-tpl-btn', function(e) {
  renderConditionTemplatePopup();
});

// Load Template in HTML
productInfoFormTpl = getTemplate('productInfoFormTpl');
productTemplateLeftTreeTpl = getTemplate('productTemplateLeftTreeTpl');


function renderProductTemplateTree() {
    $('.pf-dp-left-tree-box').html(productTemplateLeftTreeTpl());
}

var navTree;

function scrollMove(){
    var selectedItemTop = $('.pfui-tree-item.pfui-tree-item-selected').offset().top;
    $('.pf-left-nav .pf-panel-body').scrollTop(selectedItemTop-200);
}

function traceTree() {
    if(traceTree.completeTrace) {return;}

    var currentNode = navTreeStore.findNode(traceTree.traceList[traceTree.depth]);

    if(((traceTree.traceList.length - 1) === traceTree.depth)) {
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

function renderProductNavTree() {

    if(renderProductNavTree.isRendered) { return; }
    renderProductNavTree.isRendered = true;

    //var tntInstId = $('.product-factory-header', parent.document).find('.pf-multi-entity').val();
    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();

    PFUI.use(['pfui/tree', 'pfui/data', 'pfui/menu'], function (Tree, Data, Menu) {

        var treeType;
        switch (pdInfoDscd) {
            case pdInfoDscd_Product :
                treeType = 'PT';
                break;
            case pdInfoDscd_Service :
                treeType = 'ST';    // Service Template
                break;
            case pdInfoDscd_Point :
                treeType = 'OT';    // pOint Template
                break;
        }


        if (g_serviceType == g_bxmService){
            var params = {
                header: {
                    application: 'PF_Factory',
                    service: 'CatalogService',
                    operation: 'queryCatalog'
                },
                input: {
                    tntInstId: loginTntInstId,
                    pdInfoDscd: pdInfoDscd,
                    treeType: treeType,
                    commonHeader: {
                        loginTntInstId: loginTntInstId
                    }
                }
            };

            navTreeStore = new Data.TreeStore({
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
                    'bottom': 'leaf',
                    'childTransactionCode': 'childTransactionCode',
                    'type': 'type'
                }
            });
        } else {
            navTreeStore = new Data.TreeStore({
                autoLoad: false,
                url: '/catalog/getCatalog.json?commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '"}&tntInstId=' + loginTntInstId + '&pdInfoDscd=' + pdInfoDscd + '&treeType=' + treeType ,
                dataProperty: 'childCatalogs',
                map: {
                    'name': 'text',
                    'id': 'id',
                    'bottom': 'leaf',
                    'childTransactionCode': 'childTransactionCode',
                    'type': 'type'
                }
            });
        }
        // click change url params
        navTreeStore.on('beforeload', function (ev) {
            var params = ev.params;
            var node = navTreeStore.findNode(params.id);
            var queryParams;

            //params.idType = node.type;
            //params.firstCatalogId = '01';
            if(!node) { return; }

            // bxm
            if(g_serviceType == g_bxmService){
                if (node.childTransactionCode === 'PT20010') {
                    queryParams = {
                        header: {
                            application: 'PF_Factory',
                            service: 'PdTemplateService',
                            operation: 'queryListPdTemplate'
                        },
                        input: {
                            tntInstId: loginTntInstId,
                            pdInfoDscd: pdInfoDscd,
                            treeType: treeType,
                            firstCatalogId : node.id.split('.')[0],
                            secondCatalogId: node.id.split('.')[1],
                            commonHeader: {
                                loginTntInstId: loginTntInstId
                            }
                        }
                    };

                    if (node.type === '06') {
                        queryParams.input.currentCatalogId = node.id.split('.')[node.id.split('.').length - 1];
                    }

                    navTreeStore.get('proxy').set('ajaxOptions', {
                        contentType: 'application/json; charset=UTF-8',
                        data:JSON.stringify(queryParams)
                    });

                    navTreeStore.set('map', {
                        'name': 'text',
                        'id': 'id',
                        'firstCatalogId': 'firstCatalogId',
                        'secondCatalogId': 'secondCatalogId'
                    });
                } else {
                    queryParams = {
                        header: {
                            application: 'PF_Factory',
                            service: 'CatalogService',
                            operation: 'queryCatalog'
                        },
                        input: {
                            tntInstId: loginTntInstId,
                            pdInfoDscd: pdInfoDscd,
                            treeType: treeType,
                            idType : node.record.type,
                            id: node.record.id,
                            commonHeader: {
                                loginTntInstId: loginTntInstId
                            }
                        }
                    };

                    navTreeStore.get('proxy').set('ajaxOptions', {
                        contentType: 'application/json; charset=UTF-8',
                        data:JSON.stringify(queryParams)
                    });
                    navTreeStore.set('map', {
                        'name': 'text',
                        'id': 'id',
                        'bottom': 'leaf'
                    });
                }
            }else {
                queryParams = 'tntInstId=' + loginTntInstId + '&commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '", "lastModifier":"' + getLoginUserId() +'"}&pdInfoDscd=' + pdInfoDscd;

                if (node.childTransactionCode === 'PT20010') {
                    firstCatalogId = node.id.split('.')[0];
                    secondCatalogId = node.id.split('.')[1];
                    queryParams = queryParams + '&firstCatalogId=' + firstCatalogId + '&' + 'secondCatalogId=' + secondCatalogId;

                    if (node.type === '06') {
                        queryParams = queryParams + '&' + 'currentCatalogId=' + node.id.split('.')[node.id.split('.').length - 1];
                    }

                    navTreeStore.get('proxy').set('url', '/product/template/queryProductTemplateBaseForList.json?' + queryParams);
                    navTreeStore.set('map', {
                        'name': 'text',
                        'id': 'id',
                        'firstCatalogId': 'firstCatalogId',
                        'secondCatalogId': 'secondCatalogId'
                    });
                } else {
                    queryParams = queryParams + '&idType=' + node.record.type + '&treeType=' + treeType/* + '&id=' + node.record.id*/;
                    navTreeStore.get('proxy').set('url', '/catalog/getCatalog.json?' + queryParams);
                    navTreeStore.set('map', {
                        'name': 'text',
                        'id': 'id',
                        'bottom': 'leaf'
                    });
                }
            }
        });

        navTreeStore.on('beforeprocessload', function (ev) {
            var data = ev.data;

            if(data.ModelMap){
                data.responseMessage = data.ModelMap.responseMessage;
                delete data.ModelMap.responseMessage;
            }

            if($.isArray(data.responseMessage)) {
                data.childCatalogs = data.responseMessage;
            }else if (data.responseMessage) {
                data.childCatalogs = data.responseMessage.childCatalogs || [];
            }
        });

        navTreeStore.on('load', function() {
            traceTree();
        });


        navTreeStore.load();

        $('.pf-dp-tree-nav').empty();

        navTree = new Tree.TreeList({
            render : '.pf-dp-tree-nav',
            showLine : false,
            store : navTreeStore,
            checkType : 'none',
            showRoot : false
        });

        navTree.render();

        var treeItem;

        navTree.on('itemdblclick', function(e) {
            if (e.item.cls === 'PT' || e.item.cls === 'ST' || e.item.cls === 'OT') {
                location.hash = makeProductTemplateInfoParameter(e.item);
                if(!modifyFlag){
                    renderProductInfo(e.item);
                }else{
                    PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
                        renderProductInfo(e.item);
                        modifyFlag = false;
                        $('.most-significant-box').removeAttr('data-edited');
                    }, function() {
                        return;
                    });
                }
            }
        });

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

        var openContextMenuEvent = function(){
            location.hash = makeProductTemplateInfoParameter(treeItem);
            if(!modifyFlag){
                renderProductInfo(treeItem);
            }else{
                PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
                    renderProductInfo(treeItem);
                    modifyFlag = false;
                    $('.most-significant-box').removeAttr('data-edited');
                }, function() {
                    return;
                });
            }
        }

        var copyContextMenuEvent = function(){
            if(!isHaveProject()){
                haveNotTask();
                return;
            }

            if($($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val() === ''){
                selectNotTask();
                selectedYourTask();
                return;
            }

            if($($('.default-layout-task-menu', parent.document).find('.your-task')[0]).attr('data-status')=='true'){
                selectedYourTask();
                return;
            }
            renderProductTemplateCopyPopup(treeItem);

        }

        var renameProductTemplateContextMenuEvent = function(){
            if(!isHaveProject()){
                haveNotTask();
                return;
            }

            var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
            if(isNotMyTask(projectId)){
                return;
            };
            renderProductTemplateRenamePopup(treeItem);

        }

        var removeProductTemplateContextMenuEvent = function(){

            if(!isHaveProject()){
                haveNotTask();
                return;
            }

            var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
            if(isNotMyTask(projectId)){
                return;
            };

            deleteProduct(treeItem);
        }

        var createProductTypeMenuEvent = function(){
            if(!isHaveProject()){
                haveNotTask();
                return;
            }

            if($($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val() === ''){
                selectNotTask();
                selectedYourTask();
                return;
            }

            if( $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).attr('data-status')=='true'){
                selectedYourTask();
                return;
            }
            renderProductTypeCreatePopup(treeItem);

        }

        // 상품유형이름 변경
        var renameParentNodeContextMenuEvent = function(){
            if(!isHaveProject()){
                haveNotTask();
                return;
            }
            renderProductTypeRenamePopup(treeItem);

        }

        var removeParentNodeContextMenuEvent = function(){
            if(!isHaveProject()){
                haveNotTask();
                return;
            }

            var projectId =  $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
            if(isNotMyTask(projectId)){
                return;
            };


            if(treeItem.leaf == false){
                PFComponent.showMessage(bxMsg('dontdeleteCatalog'), 'warning');

                return;
            }

            var requestParam = {'id': treeItem.id, 'type': '05', pdInfoDscd : '01'};
            requestParam.projectId =  $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();

            PFComponent.showConfirm(bxMsg('DPE00001_Delete_PdTp_Contents'), function() {
                PFRequest.post('/catalog/deleteCatalog.json', requestParam, {
                    success: function(result) {
                        if (result) {
                            $el.find('.pf-dp-info-wrap').removeClass('active');
                            var deleteNode = navTreeStore.findNode(treeItem.id);
                            navTreeStore.remove(deleteNode);

                            PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                        }
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CatalogService',
                        operation: 'deleteCatalog'
                    }
                });
            }, function() {
                return;
            });
        }

        var createDetailTypeContextMenuEvent = function(){
            if(treeItem.childTransactionCode == 'PT20010'){
                PFComponent.showMessage(bxMsg('noNewCatalog'), 'warning');

                return;
            }

            if(!isHaveProject()){
                haveNotTask();
                return;
            }

            if( $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val() === ''){
                selectNotTask();
                selectedYourTask();
                return;
            }

            if( $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).attr('data-status')=='true'){
                selectedYourTask();
                return;
            }
            renderProductDetailTypeCreatePopup(treeItem);

        }

        var addDetailTypeContextMenuEvent = function(){
            if(!isHaveProject()){
                haveNotTask();
                return;
            }

            if($($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val() === ''){
                selectNotTask();
                selectedYourTask();
                return;
            }

            if($($('.default-layout-task-menu', parent.document).find('.your-task')[0]).attr('data-status')=='true'){
                selectedYourTask();
                return;
            }

            if(treeItem.leaf == true){
                PFComponent.showMessage(bxMsg('noAddCatalog'), 'warning');

                return;
            }
            renderProductDetailTypeAddPopup(treeItem);

        }

        var createProductTemplateContextMenuEvent = function(){
            if(treeItem.childTransactionCode && treeItem.childTransactionCode.substr(0,2) == 'CC'){
                PFComponent.showMessage(bxMsg('noNewTemplate'), 'warning');

                return;
            }

            if(!isHaveProject()){
                haveNotTask();
                return;
            }

            if($($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val() === ''){
                selectNotTask();
                selectedYourTask();
                return;
            }

            if( $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).attr('data-status')=='true'){
                selectedYourTask();
                return;
            }
            renderProductTemplateCreatePopup(treeItem);

        }

        var renameChildNodeContextMenuEvent = function(){
            if(!isHaveProject()){
                haveNotTask();
                return;
            }

            var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
            if(isNotMyTask(projectId)){
                return;
            };
            renderProductDetailTypeRenamePopup(treeItem);


        }

        var removeChildNodeContextMenuEvent = function(){
            if(!isHaveProject()){
                haveNotTask();
                return;
            }

            var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
            if(isNotMyTask(projectId)){
                return;
            };

            var requestParam = {'id': treeItem.id, 'type': treeItem.type, pdInfoDscd : '01'};
            requestParam.projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();

            PFComponent.showConfirm(bxMsg('DTE00001_Delete_DetailType_Contents'), function() {
                PFRequest.post('/catalog/deleteCatalog.json', requestParam, {
                    success: function(result) {
                        if (result) {
                            var treeId = treeItem.id.split('.'),
                                traceArr = [],
                                tempId = '',
                                firstIdx = true,
                                idLength = treeId.length;

                            treeId.forEach(function(el, idx) {
                                if (idLength-1 == idx) {
                                    return;
                                }

                                if (firstIdx) {
                                    tempId = el;
                                    firstIdx = false;
                                } else {
                                    tempId = tempId + '.' +el;
                                }

                                traceArr.push(tempId);
                            });

                            traceTree.traceList = traceArr;

                            traceTree.depth = 0;

                            traceTree.completeTrace = false;
                            renderProductNavTree.isRendered = false;
                            renderProductNavTree();

                            PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                        }
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CatalogService',
                        operation: 'deleteCatalog'
                    }
                });
            }, function() {
                return;
            });
        }

        var createChildNodeDetailTypeContextMenuEvent = function(){
            if(treeItem.childTransactionCode){
                if(treeItem.childTransactionCode == 'PT20010'){
                    PFComponent.showMessage(bxMsg('noNewCatalog'), 'warning');

                    return;
                }
            }

            if(!isHaveProject()){
                haveNotTask();
                return;
            }

            if($($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val() === ''){
                selectNotTask();
                selectedYourTask();
                return;
            }

            if($($('.default-layout-task-menu', parent.document).find('.your-task')[0]).attr('data-status')=='true'){
                selectedYourTask();
                return;
            }
            renderProductDetailSubTypeCreatePopup(treeItem);

        }

        // 세부유형 추가
        var addChildNodeDetailTypeContextMenuEvent = function(){
            if(!isHaveProject()){
                haveNotTask();
                return;
            }

            if($($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val() === ''){
                selectNotTask();
                selectedYourTask();
                return;
            }

            if($($('.default-layout-task-menu', parent.document).find('.your-task')[0]).attr('data-status')=='true'){
                selectedYourTask();
                return;
            }

            if(treeItem.leaf == true){
                PFComponent.showMessage(bxMsg('noAddCatalog'), 'warning');

                return;
            }
            renderProductDetailSubTypeAddPopup(treeItem);

        }

        var createChildNodeProductTemplateContextMenuEvent = function(){
            if(treeItem.childTransactionCode){
                if(treeItem.childTransactionCode.substr(0,2) == 'CC'){
                    PFComponent.showMessage(bxMsg('noNewTemplate'), 'warning');

                    return;
                }
            }

            if(!isHaveProject()){
                haveNotTask();
                return;
            }

            if($($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val() === ''){
                selectNotTask();
                selectedYourTask();
                return;
            }

            if($($('.default-layout-task-menu', parent.document).find('.your-task')[0]).attr('data-status')=='true'){
                selectedYourTask();
                return;
            }
            renderSubProductTemplateCreatePopup(treeItem);

        }


        var activeProductContextMenu = new Menu.ContextMenu({
            children : [
                makeContextMenu('icon-zoom-in', bxMsg('Context_Menu2'), openContextMenuEvent),
                makeContextMenu('icon-book', bxMsg('Context_Menu3'), copyContextMenuEvent),
                makeContextMenu('icon-pencil', bxMsg('Context_Menu4'), renameProductTemplateContextMenuEvent)
            ]
        });

        var inactiveProductContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('Context_Menu2'), openContextMenuEvent),
                makeContextMenu('icon-book', bxMsg('Context_Menu3'), copyContextMenuEvent),
                makeContextMenu('icon-pencil', bxMsg('Context_Menu4'), renameProductTemplateContextMenuEvent),
                makeContextMenu('icon-remove', bxMsg('Context_Menu5'), removeProductTemplateContextMenuEvent)
            ]
        });

        var centerBankContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('Context_Menu2'), openContextMenuEvent)
            ]
        });

        var Context_Menu8, Context_Menu6;
        switch (pdInfoDscd) {
            case pdInfoDscd_Product :
                Context_Menu8 = 'Context_Menu8';
                Context_Menu6 = 'Context_Menu6';
                break;
            case pdInfoDscd_Service :
                Context_Menu8 = 'Context_Menu81';
                Context_Menu6 = 'Context_Menu61';
                break;
            case pdInfoDscd_Point :
                Context_Menu8 = 'Context_Menu82';
                Context_Menu6 = 'Context_Menu62';
                break;
        }

        var type4ContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-th-list', bxMsg(Context_Menu8), createProductTypeMenuEvent),
            ]
        });

        var type5ContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-pencil', bxMsg('Context_Menu4'), renameParentNodeContextMenuEvent),           // 상품유형이름 변경
                makeContextMenu('icon-remove', bxMsg('Context_Menu5'), removeParentNodeContextMenuEvent),           // 상품유형 삭제
                makeContextMenu('icon-folder-close', bxMsg('Context_Menu9'), createDetailTypeContextMenuEvent),     // 세부유형 생성
                makeContextMenu('icon-plus', bxMsg('Context_Menu10'), addChildNodeDetailTypeContextMenuEvent),      // 세부유형 생성
                makeContextMenu('icon-th-list', bxMsg(Context_Menu6), createProductTemplateContextMenuEvent)        // 상품템플릿 생성
            ]
        });

        var type6ContextMenu =  new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-pencil', bxMsg('Context_Menu4'), renameChildNodeContextMenuEvent),            // 세부유형이름 변경
                makeContextMenu('icon-remove', bxMsg('Context_Menu5'), removeChildNodeContextMenuEvent),            // 세부유형 삭제
                makeContextMenu('icon-folder-close', bxMsg('Context_Menu9'), createChildNodeDetailTypeContextMenuEvent),
                makeContextMenu('icon-plus', bxMsg('Context_Menu10'), addDetailTypeContextMenuEvent),
                makeContextMenu('icon-th-list', bxMsg(Context_Menu6), createChildNodeProductTemplateContextMenuEvent)
            ]
        });

        navTree.on('itemcontextmenu', function(ev){
            var item = ev.item;
            navTree.setSelected(item);
            treeItem = item;

            // 수정가능 or Emergency
            if((treeItem.cls === 'PT' || treeItem.cls === 'ST' || treeItem.cls === 'OT') &&
                (treeItem.status == '01' || (getSelectedProjectId() && isEmergency(getSelectedProjectId()))) ) {
                if(getLoginTntInstId() != getMotherTntInstId() || writeYn != 'Y'){
                    var y = ev.pageY >= 500 ? ev.pageY-(28*4) : ev.pageY;
                    centerBankContextMenu.set('xy',[ev.pageX,y]);
                    centerBankContextMenu.show();
                    return false;
                }else{
                    var y = ev.pageY >= 500 ? ev.pageY-(28*5) : ev.pageY;
                    inactiveProductContextMenu.set('xy',[ev.pageX,y]);
                    inactiveProductContextMenu.show();
                    return false;
                }
            }
            // 판매중
            else if ((treeItem.cls === 'PT' || treeItem.cls === 'ST' || treeItem.cls === 'OT') && treeItem.status == '04') {
                if(getLoginTntInstId() != getMotherTntInstId() || writeYn != 'Y'){
                    var y = ev.pageY >= 500 ? ev.pageY-(28*4) : ev.pageY;
                    centerBankContextMenu.set('xy',[ev.pageX,y]);
                    centerBankContextMenu.show();
                    return false;
                }else{
                    var y = ev.pageY >= 500 ? ev.pageY-(28*4) : ev.pageY;
                    activeProductContextMenu.set('xy',[ev.pageX,y]);
                    activeProductContextMenu.show();
                    return false;
                }
            }

            switch (treeItem.type) {
                case '04':
                    if(getLoginTntInstId() != getMotherTntInstId() || writeYn != 'Y'){
                        return false;
                    }else{
                        var y = ev.pageY >= 500 ? ev.pageY-(28*4) : ev.pageY;
                        type4ContextMenu.set('xy',[ev.pageX,y]);
                        type4ContextMenu.show();
                   }
                    break;
                case '05':
                    if(getLoginTntInstId() != getMotherTntInstId() || writeYn != 'Y'){
                        return false;
                    }else{
                        var y = ev.pageY >= 500 ? ev.pageY-(28*3) : ev.pageY;
                        type5ContextMenu.set('xy',[ev.pageX,y]);
                        type5ContextMenu.show();
                    }
                    break;
                case '06':
                    //if($('.pf-multi-entity', parent.document).val() != '000'){
                    //if(getLoginTntInstId() != '000'){
                    if(getLoginTntInstId() != getMotherTntInstId() || writeYn != 'Y'){
                        return false;
                    }else{
                        var y = ev.pageY >= 500 ? ev.pageY-(28*4) : ev.pageY;
                        type6ContextMenu.set('xy',[ev.pageX,y]);
                        type6ContextMenu.show();
                    }
                    break;
            }
            return false;
        });
    });
//        });
}

function makeProductTemplateInfoParameter(productTemplateInfo) {
    var returnVal = 'code=' + productTemplateInfo.code +
            '&firstCatalogId=' + productTemplateInfo.firstCatalogId +
            '&secondCatalogId=' + productTemplateInfo.secondCatalogId +
            '&id=' + productTemplateInfo.id
        ;

    if  (productTemplateInfo.currentCatalogId) {
        returnVal = returnVal +  '&currentCatalogId=' + productTemplateInfo.currentCatalogId;
    }

    return returnVal;
}

function renderProductInfo(treeItem) {

    var path = (treeItem) ? treeItem.id : null;

//    pf-event에서 처리
//    $('.pf-detail-wrap').on('change','input',function(){
//        modifyFlag = true;
//        $('.most-significant-box').attr('data-edited','true');
//    });

    var hash = PFUtil.getHash();
    if(!hash) {
        traceTree.completeTrace = true;
        renderProductNavTree();
        return;
    } else {
        hash.id = path ;

        var treeId,
        traceArr = [],
        tempId = '',
        firstIdx = true;

        hash.split('&').forEach(function(el) {
            if (el.split('=')[0] === 'id') {
                treeId = el.split('=')[1];
            }
        });

        treeId.split('.').forEach(function(el, idx) {

            if (firstIdx) {
                tempId = el;
                firstIdx = false;
            } else {
                tempId = tempId + '.' +el;
            }

            traceArr.push(tempId);
        });

        traceTree.traceList = traceArr;
        traceTree.depth = 0;
        renderProductNavTree();
    }


    var requestParam = {};
    $.each(hash.split('&'),function(index, hashItem){
        var param = hashItem.split('=');
        requestParam[param[0]] = param[1];
    })
    requestParam.pdInfoDscd = pdInfoDscd;

    if(!requestParam.code){
    	return;
    }

    PFRequest.get('/product/template/getProductTemplate.json', requestParam, {
        success: function(responseData) {

            deleteGridData = [];

//            var treeId,
//                traceArr = [],
//                tempId = '',
//                firstIdx = true;
//
//            hash.split('&').forEach(function(el) {
//                if (el.split('=')[0] === 'id') {
//                    treeId = el.split('=')[1];
//                }
//            });
//
//            treeId.split('.').forEach(function(el, idx) {
//
//                if (firstIdx) {
//                    tempId = el;
//                    firstIdx = false;
//                } else {
//                    tempId = tempId + '.' +el;
//                }
//
//                traceArr.push(tempId);
//            });
//
//            traceTree.traceList = traceArr;
//            traceTree.depth = 0;
//            renderProductNavTree();

            selectedProduct = responseData;
            selectedProduct.firstCatalogId = responseData.firstCatalogId;
            selectedProduct.secondCatalogId = responseData.secondCatalogId;
            selectedProduct.statusNm = codeMapObj.ProductStatusCode[responseData.status];
            selectedProduct.id = treeId;

            switch (pdInfoDscd) {
                case pdInfoDscd_Product :
                    selectedProduct.firstCatalogNm = codeMapObj.ProductCategoryLevelOneCode[responseData.firstCatalogId];
                    break;
                case pdInfoDscd_Service :
                    selectedProduct.firstCatalogNm = codeMapObj.ServiceCategoryLevelOneCode[responseData.firstCatalogId];
                    break;
                case pdInfoDscd_Point :
                    selectedProduct.firstCatalogNm = codeMapObj.PointCategoryLevelOneCode[responseData.firstCatalogId];
                    break;
            }


            $el.find('.pf-dp-info-wrap').addClass('active');
            $el.find('.pf-dp-info').html(productInfoFormTpl(selectedProduct));
            if(writeYn != 'Y'){
                $('.write-btn').hide();
            }

            if (responseData.status === "04") { //active status can not be saved
                $el.find('.product-delete-btn').prop('disabled', true);
            } else {
                $el.find('.product-delete-btn').prop('disabled', false);
            }

            //저축은행중앙회가 아닐경우 수정불가능
            //if($('.pf-multi-entity', parent.document).val() != '000'){
            //if(getLoginTntInstId() != '000'){
            if(getLoginTntInstId() != getMotherTntInstId() || writeYn != 'Y'){
                $('.product-save-btn').prop('disabled', true);
                $('.product-delete-btn').prop('disabled', true);
            }


            renderConditionGrid(responseData['conditionGroupTemplateItemList']);
            if(responseData.projectBaseVO != null) {
                setTaskRibbonInput(responseData.projectBaseVO.projectId, responseData.projectBaseVO.name);
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdTemplateService',
            operation: 'queryPdTemplate'
        }
    });

    function renderConditionGrid(data) {
        selectedGridData = data;

        if (selectedGridData) {
            selectedGridData.forEach(function(el){
                listMap[el.code+'@'+el.applyStart.split(' ')[0]] = el;
            });
        } else {
            selectedGridData = [];
        }

        cndGrid = PFComponent.makeExtJSGrid({
            pageAble: true,
            fields: ['code', 'name', 'process', 'inquirySequence', {
                name: 'mandatoryYn',
                convert: function(value, model) {
                    if (value === 'Y' || value === true) {
                        return true;
                    } else {
                        return false;
                    }
                }}, 'applyStart','applyEnd',
                {
                name : 'applyStartDate',
                convert: function(newValue, record){
                    return record.get('applyStart').substr(0,10);
                }
                },{
                    name : 'applyEndDate',
                    convert: function(newValue, record){
                        return record.get('applyEnd').substr(0,10);
                    }
                }
            ],
            gridConfig: {
                renderTo: '.pf-dp-condition-template-grid',
                columns: [
                    {text: bxMsg('MTM0100String7'), width: 130, dataIndex: 'code', style: 'text-align:center'},
                    {text: bxMsg('MTM0100String8'), flex: 1, dataIndex: 'name',style: 'text-align:center'},
                    {text: bxMsg('inquirysequence'), width: 60, dataIndex: 'inquirySequence', editor:{ }},
                    {xtype: 'checkcolumn', text: bxMsg('productMandatoryYesOrNo'), width: 120, dataIndex: 'mandatoryYn',
                        listeners: {
                            checkchange: function(column, rowIndex, checked, eOpts){
                                if(cndGrid.store.getAt(rowIndex).get('process') != 'C'){
                                    cndGrid.store.getAt(rowIndex).set('process', 'U');
                                }
                                modifyFlag = true;
                            }
                        }},
                    {text: bxMsg('DPP0127String6'), width:150,dataIndex:'applyStartDate',align:'center',
                        editor: {
                            allowBlank: false,
                            listeners: {
                                focus: function(_this) {
                                    //$('#'+_this.inputId).prop('readonly',true);
                                    PFUtil.getGridDatePicker(_this, 'applyStart', cndGrid, selectedCellIndex, false, true);
                                }
                            }
                        },
                        listeners: {
                            click: function() {
                                selectedCellIndex = $(arguments[1]).parent().index();
                            }
                        }
                    },
                    {text: bxMsg('DPP0127String7'), width:150,dataIndex:'applyEndDate',align:'center',
                        editor: {
                            allowBlank: false,
                            listeners: {
                                focus: function(_this) {
                                    //$('#'+_this.inputId).prop('readonly',true);
                                    PFUtil.getGridDatePicker(_this, 'applyEnd', cndGrid, selectedCellIndex, false, true);
                                }
                            }
                        },
                        listeners: {
                            click: function() {
                                selectedCellIndex = $(arguments[1]).parent().index();
                            }
                        }
                    },
                    {
                        xtype: 'actioncolumn', width: 35, align: 'center',
                        items: [{
                            icon: '/images/x-delete-16.png',
                            handler: function (grid, rowIndex, colIndex, item, e, record) {
                                if(selectedProduct.status == '04' &&                                                    // 활동상태이고
                                    (getSelectedProjectId() == "" || (getSelectedProjectId() && !isEmergency(getSelectedProjectId())) ) && // emergency도 아니고 (상품정보수정일때 과거일자는 삭제불가)
                                    PFUtil.compareDateTime(record.data.applyStartDate, PFUtil.getNextDate()) == 1){     // 미래일자도 아니면

                                    PFComponent.showMessage(bxMsg('dontDeleteActiveTypeConditionTemplate'), 'warning');
                                    return;
                                }

                                if (record.data.process != 'C') {
                                    record.data.process = 'D';
                                    deleteGridData.push(record.data);
                                }

                                modifyFlag = true;
                                record.destroy();
                            }
                        }]
                    }
                ],
                plugins: [
                    Ext.create('Ext.grid.plugin.CellEditing', {
                        clicksToEdit: 1,
                        listeners: {
                            afteredit: function(e, editor) {
                                if (editor.originalValue != editor.value) {
                                    // 키컬럼 수정이면 D->C
                                    if(editor.field == 'applyStartDate' && (editor.record.get('process') == null || editor.record.get('process').length == 0)){
                                        var originalData = $.extend(true, {}, editor.record.data);
                                        originalData[editor.field] = editor.record.modified[editor.field];
                                        if(editor.field == 'applyStartDate'){
                                            originalData['applyStart'] = editor.record.modified[editor.field] + ' 00:00:00';
                                        }
                                        originalData['process'] = 'D';
                                        deleteGridData.push(originalData);
                                        editor.record.set('process', 'C');
                                    }
                                    // 키컬럼 외 수정이면 U
                                    else if(editor.record.get('process') != 'C'){
                                        editor.record.set('process', 'U');
                                    }

                                    modifyFlag  = true;
                                }
                            },
                            beforeedit:function(e, editor){
                                if( selectedProduct.status == '01' ||                                         // 수정가능인 경우
                                    editor.record.data.process == 'C' ||                                      // 새로 추가된 row인 경우
                                    (getSelectedProjectId() && isEmergency(getSelectedProjectId()))    ||     // emergency 인 경우
                                    (getSelectedProjectId() && isUpdateStatus(getSelectedProjectId())) ){     // 상품정보 수정인 경우
                                    // 모두 수정가능
                                }
                                else if(editor.field == 'applyStartDate') {
                                    return false;
                                }
                            }
                        }
                    })
                ],
                listeners: {
                    scope: this,
                    itemdblclick : function(tree, record){
                        renderConditionGroupDetailInfoPopup(record.data);
                    }
                }
            }
        });

        cndGrid.setData(selectedGridData);
    }
}

function fnEmergencyControl(flag){

    if(writeYn == 'Y' || getLoginTntInstId() == getMotherTntInstId()){
        if(flag) {
            $('.write-btn').prop('disabled', false);
        }else if($('.product-active-status-code').val() == '04'){
            $('.product-delete-btn').prop('disabled', true);
        }
    }
}