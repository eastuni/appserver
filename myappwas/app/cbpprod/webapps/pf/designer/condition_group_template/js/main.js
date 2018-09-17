/**
 * condition group template java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {

    setMainTapLeftPosition();
    $('body').css('overflow-y','scroll');

    var hash = parent.$('.pf-hidden .hash').text();
    if(hash) {
        location.hash = hash;
        parent.$('.pf-hidden .hash').text('');
    }

    renderConditionGroupTemplateTree();
    renderConditionGroupInfo();
});

    var modifyFlag = false;
    var selectedCellIndex;

    var $el = $('.pf-dcg');          // Page Root jQuery Element

    var productInfoFormTpl,     // Product Info Base Template in Sub Tab
        conditionGroupTemplateLeftTreeTpl,
    //cndTplPopupTpl,
        cndValueType1Tpl,
        conditionListGridTpl,
        rangeTypeItem,
        chargeTypeItem;

    var cndGrid,
        selectedConditionGroup,
        selectedGridData,
        previousUniqueSeq,
        defaultListGrid,
        relationGrid,
        defaultRangeGrid;

    var deleteGridData = [],
        conditionValueRelGridDeleteData = [],
        relationGridDeleteData = [],
        defaultRangeGridDeleteData = [],
        defaultListGridModifyFlag;


    var listMap = {},
        navTree,
        navTreeStore;

    function scrollMove(){
        var selectedItemTop = $('.pfui-tree-item.pfui-tree-item-selected').offset().top;
        $('.pf-left-nav .pf-panel-body').scrollTop(selectedItemTop-200);
    }

	var onEvent = PFUtil.makeEventBinder($el);

    var lengthVlad = PFValidation.realTimeLengthCheck($el);

    lengthVlad('.length-check-input', 50);

    PFComponent.toolTip($el);

    onEvent('click', 'a', function(e) { e.preventDefault(); });

    onEvent('click', '.refresh-icon', function(e) {
        renderConditionGroupNavTree.isRendered = false;
        renderConditionGroupNavTree();
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

    onEvent('click', '.condition-group-template-search-name', function(e) {
        $el.find('.condition-group-template-search-list-wrap').removeClass('active');
    });

    onEvent('keyup', '.condition-group-template-search-name', function(e) {
        var cndGroupTemplateName = this.value.split(' ').join('');

        if (e.keyCode == '13' && cndGroupTemplateName) {
            loadConditionGroupTemplateList(cndGroupTemplateName);
        }
    });

    onEvent('click', '.condition-group-template-search-btn', function(e) {
        var cndGroupTemplateName = $el.find('.condition-group-template-search-name').val().split(' ').join('');

        if (cndGroupTemplateName) {
        	loadConditionGroupTemplateList(cndGroupTemplateName);
        }
    });

    function loadConditionGroupTemplateList(conditionGroupTemplateName) {
        $el.find('.condition-group-template-search-list-wrap').addClass('active');
        $el.find('.condition-group-template-search-list-wrap').empty();

        //var tntInstId = $('.product-factory-header', parent.document).find('.pf-multi-entity').val();
        var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();

        PFUI.use(['pfui/tree', 'pfui/data'], function (Tree, Data) {

            var store;
            if (g_serviceType == g_bxmService){
                var params = {
                    header: {
                        application: 'PF_Factory',
                        service: 'CndGroupTemplateService',
                        operation: 'queryListCndGroupTemplate'
                    },
                    input: {
                        tntInstId: loginTntInstId,
                        conditionGroupTemplateName: conditionGroupTemplateName,
                        //cndGroupTemplateSearchDscd: searchDscd,
                        likeQueryYn: 'N',
                        commonHeader: {
                            loginTntInstId: loginTntInstId
                        }
                    }
                };

                store = new Data.TreeStore({
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
                        'codeAndName': 'text'
                    }
                });

            } else {
                store = new Data.TreeStore({
                    autoLoad: false,
                    dataProperty: 'list',
                    url: '/conditionGroup/template/queryConditionGroupTemplateBaseForList.json?tntInstId=' + loginTntInstId
	                    + '&likeQueryYn="N"'
	                    //+ '&cndGroupTemplateSearchDscd=' + searchDscd
	                    + '&commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '"}',
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
                } else if (data.responseError) {
                    data.list = [];
                }

            });

            // OHS 2017.08.25 수정 - IE 호환
            //store.load();
            if (g_serviceType == g_bxmService) {
                store.load();
            }else{
                store.load({conditionGroupTemplateName: conditionGroupTemplateName});
            }

            var tree = new Tree.TreeList({
                render : '.condition-group-template-search-list-wrap',
                showLine : false,
                store : store,
                showRoot : false
            });

            tree.render();

            tree.on('itemdblclick', function(e) {
                location.hash = 'conditionGroupTemplateCode=' + e.item.code;
                location.reload();

                if(!modifyFlag){
                    $el.find('.condition-group-template-search-list-wrap').removeClass('active');
                }
            });
        });
    }

    onEvent('click', '.condition-group-delete-btn', function() {
        deleteConditionGroup();
    });

    function deleteConditionGroup(treeItem) {

        var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
        if(isNotMyTask(projectId)){
            return;
        };

        var selectedItem =  treeItem || selectedConditionGroup;

        // OHS 2017.03.21 추가 - Emergency일때 삭제가능처리
        if(selectedItem.isActive == 'Y' && (getSelectedProjectId() == '' || !getSelectedProjectId()) && !isEmergency(getSelectedProjectId())) {
            PFComponent.showMessage(bxMsg('activeConditionGroupTamplateDelete'), 'warning');
            return;
        }

        var requestParam = {
            "tntInstId": selectedItem.tntInstId,
            "conditionGroupTemplateCode": selectedItem.code || selectedItem.id
        };
        requestParam.projectId = projectId;

        PFUI.use(['pfui/overlay'], function(Overlay){
            PFComponent.showConfirm(bxMsg('DPE00001_Delete_Confirm'), function() {
                PFRequest.post('/conditionGroup/template/deleteConditionGroupTemplate.json', requestParam, {
                    success: function(result) {
                        if (result) {
                            var deleteNode = navTreeStore.findNode(selectedItem.code || selectedItem.id);
                            navTreeStore.remove(deleteNode);
                            $el.find('.pf-dcg-info-wrap').removeClass('active');
                            PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                        }
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CndGroupTemplateService',
                        operation: 'deleteCndGroupTemplate'
                    }
                });
            }, 'error');
        });
    }

    onEvent('click', '.condition-group-save-btn', function() {

        var dontSave = false;

        var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
        if(isNotMyTask(projectId)){
            return;
        };

        if (!PFValidation.mandatoryCheck('.mandatory')) {
            return;
        }

        if (cndGrid.getAllData().length === 0) {
            PFComponent.showMessage(bxMsg('MTM0200Error2'), 'warning');
            return;
        }

        if (dontSave) {
            PFComponent.showMessage('[' + listMap[previousUniqueSeq]['conditionTemplate']['name']  + ']' + dontSave, 'warning');
            return;
        }

        var requestParam = {
            "lastModifier": "SYSTEM",
            "type":$el.find('.cnd-tpl-type-select').val(),
            "code": selectedConditionGroup.code,
            "name": $el.find('.condition-group-name-input').val().split(' ').join(''),
            "tntInstId": selectedConditionGroup.tntInstId,
            "isActive": selectedConditionGroup.isActive
        };
        requestParam.projectId = projectId;

        if(!PFValidation.finalLengthCheck('', 50,requestParam.name)){
            return;
        }

        var noCode;
        cndGrid.getAllData().forEach(function(element, idx, arr){
            listMap[element['uniqueSeq']]['process'] = element['process'];
            listMap[element['uniqueSeq']]['cndQrySeq'] = element['cndQrySeq']; // OHS 2016.07.19 추가, 화면변경값 save시 누락
            listMap[element['uniqueSeq']]['applyStart'] = element['applyStart'];
            listMap[element['uniqueSeq']]['applyEnd'] = element['applyEnd'];
            listMap[element['uniqueSeq']]['conditionValueDecisionLevel'] = element.conditionValueDecisionLevel;

            if (!element.defaultValue) {
                listMap[element['uniqueSeq']]['defaultValue'] = null;
            } else if(element.defaultValueYn){
                if(!listMap[element['uniqueSeq']]['defaultValue']){
                    noCode = element['name'];
                    dontSave = bxMsg('defaultNoData');
                    return false;
                }else if (listMap[element['uniqueSeq']]['defaultValue']['maxValue']) {
                    if (parseFloat(listMap[element['uniqueSeq']]['defaultValue']['maxValue']) < parseFloat(listMap[element['uniqueSeq']]['defaultValue']['minValue'])) {
                        noCode = element['name'];
                        dontSave = bxMsg('DPS0126_1Error4');
                        return false;
                    }
                } else if (listMap[element['uniqueSeq']]['defaultValue']['selectValues']) {
                    if (listMap[element['uniqueSeq']]['defaultValue']['selectValues'].length == 0) {
                        noCode = element['name'];
                        dontSave = bxMsg('defaultNoData');
                        return false;
                    }
                }
            }

            var cndTplRelListData = listMap[element['uniqueSeq']]['complexConditionTemplateRelationList'];
            if (element['complexConditionTemplateRelationList'] === true && !cndTplRelListData) {
                dontSave = bxMsg('noCndRelDataMSg');
                noCode = element['name'];
                return false;
            }

            if (element['complexConditionTemplateRelationList'] === false && cndTplRelListData) {
                listMap[element['uniqueSeq']]['complexConditionTemplateRelationList'] = null;
            }
        });

        /** OHS 20171213 주석처리 - 조건템플릿조건군템플릿관계 삭제시 관계된 모든 테이블 삭제되지 않는 버그발생.
        deleteGridData.forEach(function(el, idex, arr){
            el.complexConditionTemplateRelationList = null;
            el.betweenConditionTemplateValueRelationList = null;
        });
        */

        if (dontSave) {
            PFComponent.showMessage('[' + noCode + ']' + dontSave, 'warning');
            return;
        }

        if(!modifyFlag){
    		// 변경된 정보가 없습니다.
    		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
    		return;
    	}

        requestParam['conditionTemplateItemList'] = selectedGridData;
        requestParam['conditionTemplateDeleteItemList'] = deleteGridData;

        PFRequest.post('/conditionGroup/template/saveConditionGroupTemplate.json', requestParam, {
            success: function(result) {
                PFUI.use('pfui/overlay', function(overlay){
                    var changedNode = navTreeStore.findNode(requestParam.code);
                    changedNode.text = '['+requestParam.code + ']' + requestParam.name;
                    navTreeStore.update(changedNode);
                    PFComponent.showMessage(bxMsg('workSuccess'), 'success',function(){
                        location.hash = 'conditionGroupTemplateCode=' + requestParam.code;
                    });
                    $el.find('.condition-group-name-input').val(requestParam.name);
                    renderConditionGroupInfo();

                    modifyFlag = false;
                    $('.most-significant-box').removeAttr('data-edited');
                });
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'CndGroupTemplateService',
                operation: 'saveCndGroupTemplate'
            }
        });
    });

    onEvent('click', '.add-cnd-btn', function() {
    	// renderConditionAddPopup();
    	var cndList = cndGrid.getAllData();

    	PFPopup.selectConditionTemplate2({cndList: cndList}, function(selectedData) {
    		var seq = selectedGridData.length;

    	      selectedData.forEach(function(el) {
    	        var code = el.code

    	        var today = new Date();
    	        var year = today.getFullYear();
    	        var month = today.getMonth()+1;
    	        var date = today.getDate();

    	        if(month<10){
    	          month = '0'+month;
    	        }

    	        if(date<10){
    	          date = '0'+date;
    	        }

    	        el['applyStart'] = year + '-' + month + '-' + date + ' ' + '00:00:00';
    	        el['applyEnd'] = '9999-12-31 23:59:59';

    	        el['conditionTemplateType'] = el.type;
    	        el['conditionValueDecisionLevel'] = '01';
    	        el['isComposingCondition'] = 'N';

    	        el['conditionTemplate'] = {};
    	        el['conditionTemplate']['code'] = code;
    	        el['conditionTemplate']['name'] = el.name;
    	        //el['conditionTemplate']['tntInstId'] = 'MYBKC1CN';
    	        el['conditionTemplate']['tntInstId'] = getLoginTntInstId(); // OHS 20171213 - 수정 MYBKC1CN -> getLoginTntInstId()
    	        el['conditionTemplate']['currentCatalogId'] = el.currentCatalogId;

    	        el['uniqueSeq'] = seq;
    	        el['process'] = 'C';

    	        delete el['content'];
    	        delete el['code'];
    	        delete el['name'];
    	        delete el['type'];
    	        delete el['typeNm'];

    	        cndGrid.addData(el);
    	        listMap[seq] = el;
    	        selectedGridData.push(el);

    	        seq++;
    	      });

    	      modifyFlag = true;
    	});

    });

    //delete row data from listMap obj refered with selectedGridData
    function deleteArrFromObj(key) {
        var listMapObjKey = key;

        selectedGridData.forEach(function(el, idx){
            if(el.uniqueSeq === listMapObjKey) {
                selectedGridData.splice(idx, 1);
                return;
            }
        })
    }

    // Load Template in HTML
    productInfoFormTpl = getTemplate('productInfoFormTpl');
    conditionGroupTemplateLeftTreeTpl = getTemplate('conditionGroupTemplateLeftTreeTpl');
    cndValueType1Tpl = getTemplate('cndValueType1Tpl');
    conditionListGridTpl = getTemplate('conditionListGridTpl');
    rangeTypeItem = getTemplate('rangeTypeItem');
    chargeTypeItem = getTemplate('chargeTypeItem');


    function renderConditionGroupTemplateTree(){
        $('.pf-dcg-left-tree-box').html(conditionGroupTemplateLeftTreeTpl());
    }

    function traceTree() {
        if(traceTree.completeTrace) {return;}

        var currentNode = navTreeStore.findNode(traceTree.traceList[traceTree.depth]);

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

    function renderConditionGroupNavTree() {
        if(renderConditionGroupNavTree.isRendered) { return; }
        renderConditionGroupNavTree.isRendered = true;

        //var tntInstId = $('.product-factory-header', parent.document).find('.pf-multi-entity').val();
        var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();

        PFUI.use(['pfui/tree', 'pfui/data', 'pfui/menu'], function(Tree, Data, Menu) {

            var treeType = 'CG';

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
                        'parentCatalogId': 'parentCatalogId',
                        'type': 'type'
                    }
                });
            } else {
                navTreeStore = new Data.TreeStore({
                    autoLoad: false,
                    url: '/catalog/getCatalog.json?tntInstId=' + loginTntInstId + '&commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '"}'+ '&treeType=' + treeType,
                    dataProperty: 'childCatalogs',
                    map: {
                        'name': 'text',
                        'id': 'id',
                        'bottom': 'leaf',
                        'childTransactionCode': 'childTransactionCode',
                        'parentCatalogId': 'parentCatalogId',
                        'type': 'type'
                    }
                });
            }

            navTreeStore.on('beforeload', function(ev) {
                var params = ev.params,
                    node = navTreeStore.findNode(params.id),
                    queryParams;

                if(!node) { return; }

                // 조건군템플릿유형코드 세팅 처리 20150420
                if(g_serviceType == g_bxmService){  // bxm
                    queryParams = {
                        header: {
                            application: 'PF_Factory',
                            service: 'CndGroupTemplateService',
                            operation: 'queryListCndGroupTemplate'
                        },
                        input: {
                            tntInstId: loginTntInstId,
                            conditionGroupTemplateTypeCode: params.id,
                            treeType: treeType,
                            commonHeader: {
                                loginTntInstId: loginTntInstId
                            }
                        }
                    };

                    navTreeStore.get('proxy').set('ajaxOptions', {
                        contentType: 'application/json; charset=UTF-8',
                        data:JSON.stringify(queryParams)
                    });
                }
                else {
                    queryParams = 'conditionGroupTemplateTypeCode=' + params.id + '&tntInstId=' + loginTntInstId + '&commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '"}';
                    navTreeStore.get('proxy').set('url', '/conditionGroup/template/queryConditionGroupTemplateBaseForList.json?' + queryParams);
                }
                navTreeStore.set('map', {
                    'codeAndName': 'text',
                    'code': 'id'
                });
            });

            navTreeStore.on('beforeprocessload', function (ev) {
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

            navTreeStore.on('load', traceTree);
            navTreeStore.load();

            navTree = new Tree.TreeList({
                render : '.pf-dcg-tree-nav',
                showLine : false,
                store : navTreeStore,
                checkType : 'none',
                showRoot : false
            });

            $('.pf-dcg-tree-nav').empty();
            navTree.render();

            navTree.on('itemdblclick', function(e) {
                if(e.item.level != 1) {
                    location.hash = 'conditionGroupTemplateCode=' + e.item.id;
                    if(!modifyFlag){
                        renderConditionGroupInfo();
                    }else{
                        PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
                            renderConditionGroupInfo();
                            modifyFlag = false;
                            $('.most-significant-box').removeAttr('data-edited');
                        }, function() {
                            return;
                        });
                    }
                }
            });

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

            var openContextMenuEvent = function(){
                location.hash = 'conditionGroupTemplateCode=' + treeItem.id;
                if(!modifyFlag){
                    renderConditionGroupInfo();
                }else{
                    PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
                        renderConditionGroupInfo();
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

                renderConditionGroupTemplateCopyPopup(treeItem);

            }

            var renameContextMenuEvent = function(){

                if(!isHaveProject()){
                    haveNotTask();
                    return;
                }

                var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
                if(isNotMyTask(projectId)){
                    return;
                };

                renderConditionGroupTemplateRenamePopup(treeItem);

            }

            var removeContextMenuEvent = function(){
                if(!isHaveProject()){
                    haveNotTask();
                    return;
                }

                var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
                if(isNotMyTask(projectId)){
                    return;
                };
                deleteConditionGroup(treeItem);
            }

            var createContextMenuEvent = function(){
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

                renderConditionGroupTemplateCreatePopup(treeItem);

            }

            var centerBankwContextMenu =  new Menu.ContextMenu({
                children : [
                    makeContextMenu('icon-zoom-in', bxMsg('Context_Menu2'), openContextMenuEvent)
                ]
            });

            var conditionGroupContextMenu =  new Menu.ContextMenu({
                children : [
                    makeContextMenu('icon-zoom-in', bxMsg('Context_Menu2'), openContextMenuEvent),
                    makeContextMenu('icon-book', bxMsg('Context_Menu3'), copyContextMenuEvent),
                    makeContextMenu('icon-pencil', bxMsg('Context_Menu4'), renameContextMenuEvent),
                    makeContextMenu('icon-remove', bxMsg('Context_Menu5'), removeContextMenuEvent)
                ]
            })

            var conditionGroupInactiveContextMenu = new Menu.ContextMenu({
                children : [
                    makeContextMenu('icon-zoom-in', bxMsg('Context_Menu2'), openContextMenuEvent),
                    makeContextMenu('icon-book', bxMsg('Context_Menu3'), copyContextMenuEvent),
                    makeContextMenu('icon-pencil', bxMsg('Context_Menu4'), renameContextMenuEvent)
                ]
            });

            var firstNodeContextMenu = new Menu.ContextMenu({
                children : [
                    makeContextMenu('icon-th-list', bxMsg('Context_Menu1'), createContextMenuEvent)
                ]
            })

            navTree.on('itemcontextmenu', function(ev){
                var item = ev.item;
                navTree.setSelected(item);

                treeItem = item;
                var inactiveY = ev.pageY >= 500 ? ev.pageY-(28*5) : ev.pageY;
                var activeY = ev.pageY >= 500 ? ev.pageY-(28*4) : ev.pageY;

                if(treeItem.leaf && (treeItem.isActive == 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId())))){
                    if(getLoginTntInstId() != getMotherTntInstId() || writeYn != 'Y'){
                        centerBankwContextMenu.set('xy',[ev.pageX,ev.pageY]);
                        centerBankwContextMenu.show();
                    }else{
                        conditionGroupContextMenu.set('xy',[ev.pageX,inactiveY]);
                        conditionGroupContextMenu.show();
                    }
                }
                else if (treeItem.leaf && treeItem.isActive == 'Y') {
                    if(getLoginTntInstId() != getMotherTntInstId() || writeYn != 'Y'){
                        centerBankwContextMenu.set('xy',[ev.pageX,ev.pageY]);
                        centerBankwContextMenu.show();
                    }else{
                        conditionGroupInactiveContextMenu.set('xy',[ev.pageX,activeY]);
                        conditionGroupInactiveContextMenu.show();
                    }
                }
                else {
                    if(getLoginTntInstId() != getMotherTntInstId() || writeYn != 'Y'){
                        return false;
                    }else{
                        firstNodeContextMenu.set('xy',[ev.pageX,ev.pageY]);
                        firstNodeContextMenu.show();
                    }
                }

                return false; //prevent the default menu
            });

        });
    }


    function renderConditionGroupInfo() {

    	// 콤보박스
        //renderComboBox('CndGroupTemplateSearchDscd', $('.cnd-grp-tmplt-srch-type-select'), '01', true, bxMsg('Z_All'));

        var previousIndex = null,
            hash = PFUtil.getHash(),
            requestParam = {},
            firstRender = true;

        if(hash){
            var param = hash.split('=');
            requestParam[param[0]] = param[1];
        }

        if(!hash) {
            traceTree.completeTrace = true;
            renderConditionGroupNavTree();
            return;
        }
// pf-event에서 처리
//        $('.pf-detail-wrap').on('change','input',function(){
//            modifyFlag = true;
//            $('.most-significant-box').attr('data-edited','true');
//        });

        PFRequest.get('/conditionGroup/template/getConditionGroupTemplate.json', requestParam, {
            success: function(responseData, totalResponseData) {

                deleteGridData = [];
                conditionValueRelGridDeleteData = [];
                relationGridDeleteData = [];
                defaultRangeGridDeleteData = [];
                defaultListGridModifyFlag = false;

                selectedConditionGroup = responseData;
                selectedConditionGroup.isActiveNm = codeMapObj.TemplateActiveYnCode[responseData.isActive];

                traceTree.traceList = [
                    responseData.type,
                    selectedConditionGroup.code
                ];
                traceTree.depth = 0;

                renderConditionGroupNavTree();

                $el.find('.pf-dcg-info-wrap').addClass('active');
                $el.find('.pf-dcg-info').html(productInfoFormTpl(responseData));

                // 권한이 없는 경우 버튼 숨김
                if(writeYn != 'Y'){
                    $('.write-btn').hide();
                }

                // 2016.08.16 -> emergency를 위해 막음. 서버로직에서 막아야함.
                if (responseData.isActive === "Y") { //active status can not be saved
                    $el.find('.condition-group-delete-btn').prop('disabled', true);
                } else {
                    $el.find('.condition-group-delete-btn').prop('disabled', false);
                }

                //저축은행중앙회가 아닐 경우 수정 불가능
                //if($('.pf-multi-entity', parent.document).val() != '000'){
                //if(getLoginTntInstId() != '000'){
                if(getLoginTntInstId() != getMotherTntInstId() || writeYn != 'Y'){
                    $el.find('.condition-group-save-btn').prop('disabled', true);
                    $el.find('.condition-group-delete-btn').prop('disabled', true);
                }

                renderConditionGrid(responseData);

                var options = [];

                $.each(codeMapObj['ConditionGroupTemplateTypeCode'], function(key,value){
                    var $option = $('<option>');

                    $option.val(key);
                    $option.text(value);

                    options.push($option);
                });

                $('.cnd-tpl-type-select').html(options).val(responseData.type);
                if(responseData.projectBaseVO) {
                    setTaskRibbonInput(responseData.projectBaseVO.projectId, responseData.projectBaseVO.name);
                }
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'CndGroupTemplateService',
                operation: 'queryCndGroupTemplate'
            }
        });

        function renderConditionGrid(data) {
            selectedGridData = data.conditionTemplateItemList;
            listMap = {};

            if (selectedGridData) {
                selectedGridData.forEach(function(el){
                    el['defaultData'] = 'Y';
                    if(el.defaultValue){
                        el.defaultValueYn = true;
                    }

                    listMap[el.uniqueSeq] = el;
                });
            } else {
                selectedGridData = [];
            }

            // 그리드에서 사용하기 위한 툴팁 초기화
            Ext.tip.QuickTipManager.init();

            cndGrid = PFComponent.makeExtJSGrid({
                fields: ['conditionTemplate', 'defaultData', 'uniqueSeq', {
                    name: 'name',
                    convert: function(newValue, record) {
                        var conditionTemplate = record.get('conditionTemplate');
                        return conditionTemplate.name;
                    }
                }, {
                    name: 'code',
                    convert: function(newValue, record) {
                        var conditionTemplate = record.get('conditionTemplate');
                        return conditionTemplate.code;
                    }
                }, 'defaultValue', 'defaultValueYn',
                    //{
                    //    name: 'defaultValueYn',
                    //    convert: function(value, record) {
                    //        //id there is no property of complexCo-List, value(data) will be "".
                    //        //value have any data or true, this function will return true.
                    //        return record.data.defaultValue.defaultValueYn ? true : false;
                    //    }
                    //}
                    {
                        name: 'complexConditionTemplateRelationList',
                        convert: function(value, record) {
                            //id there is no property of complexCo-List, value(data) will be "".
                            //value have any data or true, this function will return true.
                            return value ? true : false;
                        }
                    }, {
                        name: 'betweenConditionTemplateValueRelationList',
                        convert: function(value, record) {
                            //id there is no property of complexCo-List, value(data) will be "".
                            //value have any data or true, this function will return true.
                            return value ? true : false;
                        }
                    }, {
                        name: 'isComposingCondition',
                        convert: function(value, model) {
                            //the type of isCompo-tion is String like 01 or 02, but the type of isCompo-tion is boolean(true) when we click the check.
                            if (value === 'Y' || value === true) {
                                return true;
                            } else if (value === 'N' || value === false) {
                                return false;
                            }
                        }
                    },{
                        name: 'conditionTemplateTypeNm',
                        convert: function(newValue, record) {
                            var conditionTemplateTypeNm = codeMapObj.ProductConditionTypeCode[record.get('conditionTemplateType')];
                            return conditionTemplateTypeNm;
                        }
                    },{
                        name : 'applyStartDate',
                        convert: function(newValue, record){
                            return record.get('applyStart').substr(0,10);
                        }
                    },{
                        name : 'applyEndDate',
                        convert: function(newValue, record){
                            return record.get('applyEnd').substr(0,10);
                        }
                    }, 'applyStart','applyEnd','conditionTemplateType', 'conditionValueDecisionLevel', 'cndQrySeq', 'process'],
                gridConfig: {
                    renderTo: '.pf-dcg-cnd-grid',
                    columns: [
                        //{xtype: 'rownumberer', width: 30, sortable: false},
                        {text: bxMsg('DTP0203String3'), width: 60, dataIndex: 'code'},
                        {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name',
                            renderer:function(value, meta){
                                meta.tdAttr = 'data-qtip="'+ value +'"';
                                return value;
                            }
                        },
                        {text: bxMsg('DTP0203String4'), width: 60, dataIndex: 'conditionTemplateTypeNm'},
                        {text: bxMsg('DPS0121String7'),  width: 100, dataIndex: 'conditionValueDecisionLevel',
                            renderer: function(value) {
                                return codeMapObj.ProductConditionAgreeLevelCode[value] || value;
                            },
                            editor: {
                                xtype: 'combo',
                                typeAhead: true,
                                triggerAction: 'all',
                                displayField: 'name',
                                valueField: 'code',
                                editable: false,
                                store: new Ext.data.Store({
                                    fields: ['code', 'name'],
                                    data: codeArrayObj['ProductConditionAgreeLevelCode']
                                })
                            }},
                        {text: bxMsg('inquirysequence'), width: 60, dataIndex: 'cndQrySeq', editor:{ }},
                        // 2015 04 22 OHS 추가시작
                        {text: bxMsg('DPP0127String6'), width:130,dataIndex:'applyStartDate',
                            editor: {
                                allowBlank: true,
                                listeners: {
                                    focus: function(_this) {
                                        //$('#'+_this.inputId).prop('readonly',true);
                                        $('#'+_this.inputId).on('selectstart',function(){
                                            return false;
                                        });
                                        $('#'+_this.inputId).on('dragstart',function(){
                                            return false;
                                        });

                                        var isNextDay = true;
                                        if(getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                                            isNextDay = false;
                                        }
                                        PFUtil.getGridDatePicker(_this, 'applyStart', cndGrid, selectedCellIndex, isNextDay, true);
                                    }
                                }
                            },
                            listeners: {
                                click: function() {
                                    selectedCellIndex = $(arguments[1]).parent().index();
                                }
                            }
                        },
                        {text: bxMsg('DPP0127String7'), width:130, dataIndex:'applyEndDate',
                            editor: {
                                allowBlank: false,
                                listeners: {
                                    focus: function(_this) {
                                        var isNextDay = true;
                                        if(getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                                            isNextDay = false;
                                        }
                                        PFUtil.getGridDatePicker(_this, 'applyEnd', cndGrid, selectedCellIndex, isNextDay, true);
                                    }
                                }
                            },
                            listeners: {
                                click: function() {
                                    selectedCellIndex = $(arguments[1]).parent().index();
                                }
                            }
                        },
                        // 2015 04 22 OHS 추가끝
                        {xtype: 'checkcolumn', text: bxMsg('MTM0200String8'), width: 60, dataIndex: 'complexConditionTemplateRelationList',
                            renderer: function(value, metadata, record) {
                                //if isComposi-tion is checked, complexCon-List can not be checked
                                if (record.get('isComposingCondition') == 'Y') {
                                    return "<input type='checkbox' disabled>";
                                } else {
                                    return (new Ext.ux.CheckColumn()).renderer(value);
                                }
                            },
                            listeners: {
                                checkchange: function(column, rowIndex, checked, eOpts) {
                                    //because of bug that is not triggered first click, this method is added
                                    modifyFlag = true;
                                    if(!checked){
                                        cndGrid.store.getAt(rowIndex).raw.complexConditionTemplateRelationList = null;
                                    }
                                    //(firstRender) && renderSubConditionGrid(cndGrid.store.getAt(rowIndex), rowIndex);
                                }
                            }
                        },
                        {xtype: 'checkcolumn', text: bxMsg('DPS0121_21String3'), width: 75, dataIndex: 'defaultValueYn', stopSelection: false,
                            renderer: function(value, metadata, record) {
                                //when contpltype is 03 or 04 or iscomposingcondition is checked, this checkbox should be disabled.(=can not be checked)
                                if (record.get('conditionTemplateType') == '03' || record.get('conditionTemplateType') == '04' || record.get('isComposingCondition') == true) {
                                    return "<input type='checkbox' disabled>";
                                } else {
                                    return (new Ext.ux.CheckColumn()).renderer(value);
                                }
                            },
                            listeners: {
                                checkchange: function(column, rowIndex, checked, eOpts) {
                                    //(firstRender) && renderSubConditionGrid(cndGrid.store.getAt(rowIndex), rowIndex);
                                    modifyFlag = true;
                                    if(!checked){
                                        //cndGrid.store.getAt(rowIndex).raw.defaultValue.selectValues = null;
                                        //cndGrid.store.getAt(rowIndex).raw.defaultValue.measurementUnit = null;
                                        //cndGrid.store.getAt(rowIndex).raw.defaultValue.minValue = null;
                                        //cndGrid.store.getAt(rowIndex).raw.defaultValue.maxValue = null;

                                    	// OHS 20171213 - if 조건문 추가 ( javascript 에러 방지 )
                                    	if(cndGrid.store.getAt(rowIndex).raw.defaultValue) {
                                    		cndGrid.store.getAt(rowIndex).raw.defaultValue.process = 'U';
                                    	}
                                    }
                                }
                            }
                        },
                        {
                            xtype: 'actioncolumn', width: 35, align: 'center',
                            items: [{
                                icon: '/images/edit-icon30.png',
                                handler: function (_this, rowIndex, colIndex, item, e, record) {
                                    previousIndex = rowIndex;
                                    previousUniqueSeq = record.get('uniqueSeq');
                                    _this.focusRow(rowIndex);
                                    renderConditionGroupDetailInfoManagerPopup(record, data, _this, rowIndex);
                                }
                            }]
                        },
                        {
                            xtype: 'actioncolumn', width: 35, align: 'center',
                            items: [{
                                icon: '/images/x-delete-16.png',
                                handler: function (grid, rowIndex, colIndex, item, e, record) {

                                    if( record.data.process != 'C' &&
                                        selectedConditionGroup.isActive == 'Y' &&                                          // 활동상태이고
                                        (getSelectedProjectId() == "" || (getSelectedProjectId() && !isEmergency(getSelectedProjectId()) && !isUpdateStatus(getSelectedProjectId())) ) && // emergency도 아니고 상품정보수정도 아니고
                                        PFUtil.compareDateTime(record.data.applyStartDate, PFUtil.getNextDate()) == 1){               // 상품정보수정도 아니면
                                        PFComponent.showMessage(bxMsg('dontDeleteActiveTypeConditionTemplate'), 'warning');
                                        return;
                                    }

                                    $el.find('.pf-dcg-cnd-rel-grid-wrap').removeClass('sub-grid-active');
                                    $el.find('.pf-dcg-base-val-grid-wrap').removeClass('sub-grid-active');
                                    $el.find('.pf-dcg-base-list-val-grid-wrap').removeClass('sub-grid-active');
                                    deleteArrFromObj(record.get('uniqueSeq'));
                                    if (record.data.process != 'C') {
                                        record.data.process = 'D';

                                        // OHS 20171213 추가 - betweenConditionTemplateValueRelationList, complexConditionTemplateRelationList 값 세팅
                                        if(record.data.complexConditionTemplateRelationList == true) {
                                        	record.data.complexConditionTemplateRelationList = listMap[record.data.uniqueSeq].complexConditionTemplateRelationList;
                                        }
                                        // OHS 20180131 추가 - complexConditionTemplateRelationList 값이 없을경우 Array 타입에 맞게 false 에서 [] 로 세팅해줌
                                        else {
                                        	record.data.complexConditionTemplateRelationList = [];
                                        }
                                        if(record.data.betweenConditionTemplateValueRelationList == true) {
                                        	record.data.betweenConditionTemplateValueRelationList = listMap[record.data.uniqueSeq].betweenConditionTemplateValueRelationList;
                                        }
                                        // OHS 20180131 추가 - betweenConditionTemplateValueRelationList 값이 없을경우 Array 타입에 맞게 false 에서 [] 로 세팅해줌
                                        else {
                                        	record.data.betweenConditionTemplateValueRelationList = [];
                                        }

                                        deleteGridData.push(record.data);
                                    }
                                    record.destroy();
                                    modifyFlag = true;
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
                                        if(editor.field == 'applyStartDate' && (editor.record.get('process') == null || editor.record.get('process').length == 0)){
                                            var originalData = $.extend(true, {}, listMap[editor.rowIdx]);
                                            originalData[editor.field] = editor.record.modified[editor.field];
                                            if(editor.field == 'applyStartDate'){
                                                originalData['applyStart'] = editor.record.modified[editor.field] + ' 00:00:00';
                                            }
                                            originalData['process'] = 'D';
                                            deleteGridData.push(originalData);
                                            editor.record.set('process', 'C');
                                        }else if(editor.record.get('process') != 'C'){
                                            editor.record.set('process', 'U');
                                        }
                                        modifyFlag = true;
                                    }
                                },
                                beforeedit:function(e, editor){
                                    if( selectedConditionGroup.isActive == 'N' ||                                 // 비활동인 경우
                                        editor.record.data.process == 'C' ||                                      // 새로 추가된 row인 경우
                                        (getSelectedProjectId() && isEmergency(getSelectedProjectId()))    ||     // emergency 인 경우
                                        (getSelectedProjectId() && isUpdateStatus(getSelectedProjectId())) ){     // 상품정보 수정인 경우
                                        // 모두 수정가능
                                    }
                                    else if(editor.field != 'applyEndDate' && editor.field != 'cndQrySeq') {
                                        return false;
                                    }
                                }
                            }
                        })
                    ],
                    listeners: {
                        scope: this,
                        itemdblclick : function(_this, record, item, index){

                            var requestParam = {
                                tntInstId: record.getData().conditionTemplate.tntInstId,
                                conditionCode: record.getData().code
                            };

                            PFRequest.get('/condition/template/getConditionTemplate.json',requestParam, {
                                success: function (responseData) {
                                    renderConditionInfoPopup(responseData);
                                },
                                bxmHeader: {
                                    application: 'PF_Factory',
                                    service: 'CndTemplateService',
                                    operation: 'queryCndTemplate'
                                }
                            });

                        }
                    }
                }
            });

            cndGrid.setData(selectedGridData);

            // 2016.09.30 yujin 주석처리 - 호출되지 않음
            //function renderSubConditionGrid (record, index){
            //    if (previousIndex != null && previousIndex != index) {
            //        $el.find('.sub-grid-active').each(function(idx, element) {
            //            var subGrid = $(element).attr('class').split(' ')[0];
            //
            //            switch (subGrid) {
            //                case 'pf-dcg-cnd-rel-grid-wrap' :
            //                    listMap[previousUniqueSeq]['complexConditionTemplateRelationList'] = relationGrid.getAllData();
            //                    break;
            //                case 'pf-dcg-base-val-grid-wrap' :
            //                    listMap[previousUniqueSeq]['defaultValue'] = defaultRangeGrid.getAllData()[0];
            //                    break;
            //                case 'pf-dcg-base-list-val-grid-wrap' :
            //                    if (!listMap[previousUniqueSeq]['defaultValue']) {
            //                        listMap[previousUniqueSeq]['defaultValue'] = {'selectValues': []};
            //                    }
            //
            //                    var selectedValueArr = [];
            //                    defaultListGrid.getAllData().forEach(function(el, idx) {
            //                        if (el.selectedYn) {
            //
            //                            selectedValueArr.push(el);
            //                        }
            //                    });
            //
            //                    listMap[previousUniqueSeq]['defaultValue']['selectValues'] = selectedValueArr;
            //                    break;
            //            }
            //        });
            //    }
            //
            //    previousIndex = index;
            //    previousUniqueSeq = record.get('uniqueSeq');
            //
            //    $el.find('.pf-dcg-cnd-rel-grid-wrap').removeClass('sub-grid-active');
            //    $el.find('.pf-dcg-base-val-grid-wrap').removeClass('sub-grid-active');
            //    $el.find('.pf-dcg-base-list-val-grid-wrap').removeClass('sub-grid-active');
            //
            //    if (record.get('complexConditionTemplateRelationList') == true) {
            //        renderConditionRelationGrid(record.raw.complexConditionTemplateRelationList);
            //    }
            //
            //    if (record.get('defaultValue') == true) {
            //        if (record.get('conditionTemplateType') == '01') {
            //            var requestGridParam = {'conditionCode': record.get('code')};
            //
            //            PFRequest.get('/condition/template/getConditionTemplate.json', requestGridParam, {
            //                success: function(responseData) {
            //                    if (responseData['values']) {
            //
            //                        if (record.raw.defaultValue) {
            //                            renderBaseListValGrid(responseData['values'], listMap[previousUniqueSeq]['defaultValue']['selectValues'])
            //                        } else {
            //                            renderBaseListValGrid(responseData['values'])
            //                        }
            //                    }
            //                },
            //                bxmHeader: {
            //                    application: 'PF_Factory',
            //                    service: 'CndTemplateService',
            //                    operation: 'queryCndTemplate'
            //                }
            //            });
            //
            //        } else if (record.get('conditionTemplateType') == '02') {
            //            renderBaseRanValGrid(listMap[previousUniqueSeq]['defaultValue'], record.get('conditionTemplate').currentCatalogId);
            //        }
            //    }
            //
            //    $el.find('.grid-sub-title-cndTp').text(record.get('code'));
            //}

        }

        //function renderConditionRelationGrid(data, cndTp) {
        //    if (!data) {
        //        data = [];
        //    }
        //
        //    $el.find('.pf-dcg-cnd-rel-grid-wrap').addClass('sub-grid-active');
        //    $el.find('.pf-dcg-cnd-rel-grid').empty();
        //
        //    relationGrid = PFComponent.makeExtJSGrid({
        //        fields: ['conditionTemplateCode', 'conditionTemplateName', 'relationType'],
        //        gridConfig: {
        //            renderTo: '.pf-dcg-cnd-rel-grid',
        //            columns: [
        //                {text: bxMsg('MTM0200String4'),	 flex: 1, dataIndex: 'conditionTemplateCode'},
        //                {text: bxMsg('MTM0200String5'),  flex: 1, dataIndex: 'conditionTemplateName'},
        //                {
        //                    xtype: 'actioncolumn', width: 35, align: 'center',
        //                    items: [{
        //                        icon: '/images/x-delete-16.png',
        //                        handler: function (grid, rowIndex, colIndex, item, e, record) {
        //                            record.destroy();
        //                            modifyFlag = true;
        //                        }
        //                    }]
        //                }
        //            ],
        //            plugins: [
        //                Ext.create('Ext.grid.plugin.CellEditing', {
        //                    clicksToEdit: 1
        //                })
        //            ]
        //        }
        //    });
        //
        //    relationGrid.setData(data);
        //}

        // 2016.10.05 yujin 주석 처리 - 호출되지 않음
        //function renderBaseRanValGrid(data, currentCatalogId) {
        //    var comboData, comboMap;
        //
        //    $el.find('.pf-dcg-base-val-grid-wrap').addClass('sub-grid-active');
        //    $el.find('.pf-dcg-base-val-grid').empty();
        //
        //    if (currentCatalogId === '01') {
        //        comboData = codeArrayObj['CurrencyCode'];
        //        comboMap = codeMapObj['CurrencyCode'];
        //
        //        if (!data) {
        //            data = {'minValue': '0.00', 'maxValue': '0.00'};    // 'measurementUnit': CNY
        //        }
        //
        //    } else if (currentCatalogId === '05') {
        //        comboData = [];
        //        comboMap = {};
        //
        //        codeArrayObj['ProductMeasurementUnitCode'].forEach(function(el) {
        //            if (el.code === '11' || el.code === '12') {
        //                comboData.push(el);
        //                comboMap[el.code] = el.name;
        //            }
        //        });
        //
        //        if (!data) {
        //            data = {'minValue': '0.00', 'maxValue': '0.00', 'measurementUnit': '11'};
        //        }
        //    } else {
        //        comboData = codeArrayObj['ProductMeasurementUnitCode'];
        //        comboMap = codeMapObj['ProductMeasurementUnitCode'];
        //        if (!data) {
        //            data = {'minValue': '0.00', 'maxValue': '0.00', 'measurementUnit': '14'};
        //        }
        //    }
        //
        //    var dataArray = [];
        //
        //    dataArray.push(data);
        //
        //    defaultRangeGrid = PFComponent.makeExtJSGrid({
        //        fields: ['minValue', 'measurementUnit',{
        //            name: 'minValue',
        //            convert: function(newValue, record) {
        //                var minValue ;
        //                if (newValue) {
        //                    var inputVal = newValue.split('.'),
        //                        cutInt = (inputVal[0]) ? inputVal[0] : 0,
        //                        cutDec = (inputVal[1]) ? inputVal[1] : '',
        //                        val,
        //                        i = 0;
        //
        //                    if (parseFloat(newValue) == '0') {
        //                        var decimalString = '';
        //                        for (i = 0; i < 2 ; i++) {
        //                            decimalString = decimalString + '0';
        //                        }
        //                        val = '0' + '.' + decimalString;
        //                    } else {
        //                        if (cutInt.length < 17) {
        //                            cutInt = parseInt(cutInt) + '';
        //                        } else if (cutInt.length == 17 && cutInt.substr(0,1) == '0') {
        //                            cutInt = parseInt(cutInt) + '';
        //                        }
        //
        //                        if (cutDec != '') {
        //                            var decimalLength = cutDec.length;
        //                            for (i = 0; i < 2 - decimalLength ; i++) {
        //                                cutDec = cutDec + '0';
        //                            }
        //                        } else {
        //                            for (i = 0; i < 2 ; i++) {
        //                                cutDec = cutDec + '0';
        //                            }
        //                        }
        //
        //                        val = cutInt+'.'+cutDec;
        //                    }
        //
        //                    minValue = val;
        //
        //                }  else {
        //                    minValue = record.get('minValue');
        //                }
        //
        //                return minValue;
        //            }
        //        },{
        //            name: 'maxValue',
        //            convert: function(newValue, record) {
        //                var maxValue ;
        //                if (newValue) {
        //                    var inputVal = newValue.split('.'),
        //                        cutInt = (inputVal[0]) ? inputVal[0] : 0,
        //                        cutDec = (inputVal[1]) ? inputVal[1] : '',
        //                        val,
        //                        i = 0;
        //
        //                    if (parseFloat(newValue) == '0') {
        //                        var decimalString = '';
        //                        for (i = 0; i < 2 ; i++) {
        //                            decimalString = decimalString + '0';
        //                        }
        //                        val = '0' + '.' + decimalString;
        //                    } else {
        //                        if (cutInt.length < 17) {
        //                            cutInt = parseInt(cutInt) + '';
        //                        } else if (cutInt.length == 17 && cutInt.substr(0,1) == '0') {
        //                            cutInt = parseInt(cutInt) + '';
        //                        }
        //
        //                        if (cutDec != '') {
        //                            var decimalLength = cutDec.length;
        //                            for (i = 0; i < 2 - decimalLength ; i++) {
        //                                cutDec = cutDec + '0';
        //                            }
        //                        } else {
        //                            for (i = 0; i < 2 ; i++) {
        //                                cutDec = cutDec + '0';
        //                            }
        //                        }
        //
        //                        val = cutInt+'.'+cutDec;
        //                    }
        //
        //                    maxValue = val;
        //
        //                }  else {
        //                    maxValue = record.get('maxValue');
        //                }
        //
        //                return maxValue;
        //            }
        //        }],
        //        gridConfig: {
        //            renderTo: '.pf-dcg-base-val-grid',
        //            columns: [
        //                {text: bxMsg('DPS0121_1String1'), flex: 1, dataIndex: 'minValue',
        //                    renderer: function(value, metadata, record) {
        //                        return PFValidation.gridFloatCheckRenderer(value, 19, 2);
        //                    },
        //                    editor: {
        //                        xtype: 'textfield',
        //                        allowBlank: false,
        //                        selectOnFocus: true,
        //                        listeners : {
        //                            'render': function (cmp) {
        //                                cmp.getEl()
        //                                    .on('keydown', function(e) {
        //                                        PFValidation.gridFloatCheckKeydown(e, 19, 2);
        //                                    })
        //                                    .on('keyup', function (e) {
        //                                        PFValidation.gridFloatCheckKeyup(e, 19, 2);
        //                                    })
        //                            }
        //                        }
        //                    }
        //                },
        //                {text: bxMsg('DPS0121_1String2'), flex: 1, dataIndex: 'maxValue',
        //                    renderer: function(value, metadata, record) {
        //                        return PFValidation.gridFloatCheckRenderer(value, 19, 2);
        //                    },
        //                    editor: {
        //                        xtype: 'textfield',
        //                        allowBlank: false,
        //                        selectOnFocus: true,
        //                        listeners : {
        //                            'render': function (cmp) {
        //                                cmp.getEl()
        //                                    .on('keydown', function(e) {
        //                                        PFValidation.gridFloatCheckKeydown(e, 19, 2);
        //                                    })
        //                                    .on('keyup', function (e) {
        //                                        PFValidation.gridFloatCheckKeyup(e, 19, 2);
        //                                    })
        //                            }
        //                        }
        //                    }
        //                },
        //                {text: bxMsg('DPS0121_1String5'), flex: 1, dataIndex: 'measurementUnit',
        //                    renderer: function(value) {
        //                        return comboMap[value] || value;
        //                    },
        //                    editor: {
        //                        xtype: 'combo',
        //                        typeAhead: true,
        //                        editable: false,
        //                        triggerAction: 'all',
        //                        displayField: 'name',
        //                        valueField: 'code',
        //                        store: new Ext.data.Store({
        //                            fields: ['code', 'name'],
        //                            data: comboData
        //                        })
        //                    }}
        //            ],
        //            plugins: [
        //                Ext.create('Ext.grid.plugin.CellEditing', {
        //                    clicksToEdit: 1
        //                })
        //            ]
        //        }
        //    });
        //
        //    defaultRangeGrid.setData(dataArray);
        //}

        //function renderBaseListValGrid(defaultList, selectedData) {
        //    $el.find('.pf-dcg-base-list-val-grid-wrap').addClass('sub-grid-active');
        //    $el.find('.pf-dcg-base-list-val-grid').empty();
        //
        //    var defaultListMap = {};
        //
        //    defaultList.forEach(function(el){
        //        defaultListMap[el.key] = el;
        //    });
        //
        //    if (selectedData) {
        //        selectedData.forEach(function(el) {
        //            if (defaultListMap[el.key]) {
        //                defaultListMap[el.key]['selectedYn'] = true;
        //            }
        //        });
        //    }
        //
        //    defaultListGrid = PFComponent.makeExtJSGrid({
        //        fields: ['key', 'value', 'selectedYn', 'process'],
        //        gridConfig: {
        //            renderTo: '.pf-dcg-base-list-val-grid',
        //            columns: [
        //                {xtype: 'checkcolumn', text: bxMsg('DPS0121_21String4'), width: 90, dataIndex: 'selectedYn',
        //                    listeners: {
        //                    checkchange: function(column, rowIndex, checked, eOpts){
        //                        modifyFlag = true;
        //                    }
        //                }},
        //                {text: bxMsg('DPS0126String25'), flex: 3, dataIndex: 'key'},
        //                {text: bxMsg('DPS0126String26'), flex: 5, dataIndex: 'value'}
        //            ],
        //            plugins: [
        //                Ext.create('Ext.grid.plugin.CellEditing', {
        //                    clicksToEdit: 1
        //                })
        //            ]
        //        }
        //    });
        //
        //    defaultListGrid.setData(defaultList);
        //}
    }



    function makeComboOfRelGrid(title, sizeType, size, dataIndex, data){

        var listComboArray = [];
        var listComboObj = {};

        var requestParam = {
            conditionCode : data.code,
            conditionTypeCode : data.conditionTemplateType
        }

        PFRequest.get('/condition/template/getConditionTemplate.json',requestParam, {
            success : function(responseData){
                $.each(responseData.values, function(index, listItem){

                    var listArr = {};
                    var listObj = {};

                    listArr.code = listItem.key;
                    listArr.name = listItem.value;

                    listObj[listItem.key] = listItem.value;

                    listComboArray.push(listArr);
                    listComboObj = $.extend(listComboObj, listObj);
                });

            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'CndTemplateService',
                operation: 'queryCndTemplate'
            }
        });

        var combo = {
            text: title, dataIndex: dataIndex, align: 'center', sortable: false,
            renderer: function(value) {
                return listComboObj[value];
            },
            editor: {
                xtype: 'combo',
                typeAhead: true,
                triggerAction: 'all',
                displayField: 'name',
                valueField: 'code',
                editable: false,
                store: new Ext.data.Store({
                    fields: ['name', 'code'],
                    data: listComboArray
                }),
                listeners: {
                    'change': function(_this, newValue, oldValue, eOpts) {
                        modifyFlag = true;
                    }
                }
            }
        }

        combo[sizeType] = size;

        return combo;
    };


    function makeComboOfGrid(title, sizeType, size, dataIndex, enumName){
        var combo = {
            text: title, dataIndex: dataIndex, align: 'center', sortable: false,
            renderer: function(value) {
                return codeMapObj[enumName][value];
            },
            editor: {
                xtype: 'combo',
                typeAhead: true,
                triggerAction: 'all',
                displayField: 'name',
                valueField: 'code',
                editable: false,
                store: new Ext.data.Store({
                    fields: ['name', 'code'],
                    data: codeArrayObj[enumName]
                }),
                listeners: {
                    'change': function(_this, newValue, oldValue, eOpts) {
                        modifyFlag = true;
                    }
                }
            }
        }

        combo[sizeType] = size;

        return combo;
    };

    //조건값간관계전용
    function makeComboOfGridForBtwnCndValue(title, sizeType, size, dataIndex, enumName, cndType){
        var combo = {
            text: title, dataIndex: dataIndex, align: 'center', sortable: false,
            renderer: function(value, p, record) {
                return codeMapObj[enumName][value];
            },
            editor: {
                xtype: 'combo',
                typeAhead: true,
                triggerAction: 'all',
                displayField: 'name',
                valueField: 'code',
                editable: false,
                store: new Ext.data.Store({
                    fields: ['name', 'code'],
                    data: codeArrayObjForBtwnCndValue(codeArrayObj[enumName], cndType)
                }),
                listeners: {
                    'change': function(_this, newValue, oldValue, eOpts) {
                        modifyFlag = true;
                    }
                }
            }
        }

        function codeArrayObjForBtwnCndValue(codeArrayObj, cndType) {
            if(codeArrayObj && cndType) {

                // 목록일경우 코드값 01, 02, 03
                if(cndType == '01') {
                    var newCodeArrayObj = [];
                    for(var i = 0; i < codeArrayObj.length; i++) {
                        if(i == '03') break;
                        newCodeArrayObj.push(codeArrayObj[i]);
                    }
                    return newCodeArrayObj;
                }
                // 범위일경우 코드값 전부
                else if(cndType == '02') {
                    var newCodeArrayObj = [];
                    for(var i = 0; i < codeArrayObj.length; i++) {
                        newCodeArrayObj.push(codeArrayObj[i]);
                    }
                    return newCodeArrayObj;
                }
                else {
                    return codeArrayObj;
                }
            }
        }

        combo[sizeType] = size;
        return combo;
    };



function fnEmergencyControl(flag){

    if(writeYn == 'Y' && getLoginTntInstId() == getMotherTntInstId()){
        if(flag) {
            $('.write-btn').prop('disabled', false);
        }
        else if($('.condition-group-active-status-code').val() == 'Y'){
            $('.condition-group-delete-btn').prop('disabled', true);
        }
    }
}