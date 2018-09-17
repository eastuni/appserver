/**
 * @author wb-yealeekim
 * @version $$id: product.js, v 0.1 2015-01-22 PM 3:09 wb-yealeekim Exp $$
 */

$(function() {
    setMainTapLeftPosition();
    $('body').css('overflow-y','scroll');

    setTntInstComboBox();
    getRelConfig();

    var hash = parent.$('.pf-hidden .hash').text();
    if(hash) {
        location.hash = hash;
        parent.$('.pf-hidden .hash').text('');
    }

    renderProductInfo(PFUtil.getHash());

});


// 상품정보구분코드
var pdInfoDscd_Product = '01';  // 상품
var pdInfoDscd_Service = '02';  // 서비스
var pdInfoDscd_Point   = '03';  // 포인트

var modifyFlag = false;

var $el = $('.pf-cp');          // Page Root jQuery Element

var productInfoTpl,             // Product Info HTML Template
    productInfoForm,
    baseInfoMngFormTpl,
    relInfoGridTpl,
//relProductAddPopupTpl,
    relDepartmentAddPopupTpl,
    fileUploadPopupTpl,
    productLeftTreeTpl;

var selectedTreeItem;

// Related Product ID Cache
var selectRequestParam,
    productInfo, conditionRequestParam;

var clickEventForCode, clickEventForNewData, clickEventForGrid, clickSaveEventForUrl, clickOperation;

var currentPage;
var selectedCellIndex, selectedCndGridCellIndex;

var tntInstId;

var relNodesChildren = [];

function scrollMove(){
    // offset() : 대상 element가 시작되는 x 좌표와 y 좌표 값을 리턴한다
    var selectedItemTop = $('.pfui-tree-item.pfui-tree-item-selected').offset().top;
    $('.pf-left-nav .pf-panel-body').scrollTop(selectedItemTop-200);
}

var onEvent = PFUtil.makeEventBinder($el);
var productStore, navTree;

PFComponent.toolTip($el);

var checkFloat = PFValidation.floatCheck($el);
checkFloat('.float19', 17, 2);
checkFloat('.float21', 19, 2);
checkFloat('.float10', 3, 6);
checkFloat('.float0', 10, 0); // decimal 0 정수 처리

var checkFlatForRageType = PFValidation.floatCheckForRangeType($el);
//checkFlatForRageType('.float-range-10', 7, 3); // OHS 20180503 주석, 아래로직으로 대체, 화면 전체 통일하기위함.
checkFlatForRageType('.float-range-10', 3, 6);
checkFlatForRageType('.float-range-21', 19, 2);
checkFlatForRageType('.float-range-0', 14, 0);	// 일자(+시분초)를 감안하여 14자리로 변경

var focusDrag = PFValidation.dragAll($el);
focusDrag('.float21');
focusDrag('.float19');
focusDrag('.float10');
focusDrag('.float0');
focusDrag('.float-range-21');
focusDrag('.float-range-10');
focusDrag('.float-range-0'); // OHS20180417 추가 - 주기,숫자등과같은 조건은 dragall 처리가 되지않아 추가

var lengthVlad = PFValidation.realTimeLengthCheck($el);
lengthVlad('.length-check-input', 100);

onEvent('change', '.pf-multi-entity', function(e){

    tntInstId = $el.find('.pf-multi-entity').val();

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

    renderProductNavTree.isRendered = false;
    renderProductNavTree();
    $el.find('.pf-detail-wrap').removeClass('active');
});

//prevent tag a event
onEvent('click', 'a', function(e) {e.preventDefault();});

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

onEvent('click', '.product-search-name', function(e) {
    $el.find('.product-search-list-wrap').removeClass('active');
});

onEvent('keyup', '.product-search-name', function(e) {
    var productName = this.value.split(' ').join('');
    if (e.keyCode == '13' && productName) {
        loadProductList(productName);
    }
});

// tree product search button click
onEvent('click', '.product-search-btn', function(e) {
    var productName = $el.find('.product-search-name').val().split(' ').join('');

    if (productName) loadProductList(productName);
});

function loadProductList() {
    var productName = $el.find('.product-search-name').val();

    $el.find('.product-search-list-wrap').addClass('active');
    $el.find('.product-search-list-wrap').empty();

    var tntInstId = $el.find('.pf-multi-entity').val();
    //var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();

    PFUI.use(['pfui/tree', 'pfui/data'], function (Tree, Data) {

        var store;
        if(g_serviceType == g_bxmService){    // bxm

            var params = {
                header: {
                    application: 'PF_Factory',
                    service: 'PdService',
                    operation: 'queryListPd',
                    locale: getCookie('lang')
                },
                input: {
                    tntInstId: tntInstId,
                    pdInfoDscd: pdInfoDscd,
                    name : productName,
                    commonHeader: {
                        loginTntInstId: getLoginTntInstId(),
                        lastModifier: getLoginUserId()
                    }
                }
            };

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
        }else{
            store = new Data.TreeStore({
                autoLoad: false,
                dataProperty: 'list',
                url: '/product/queryProductBaseForList.json?tntInstId='+tntInstId
                //+'&name='+productName
                +'&commonHeaderMessage={"loginTntInstId":"'+getLoginTntInstId()+ '", "lastModifier":"' + getLoginUserId() +'"}'
                +'&pdInfoDscd='+pdInfoDscd,
                map: {
                    'name': 'text'
                }
            });
        }

        store.on('beforeprocessload', function (ev) {
            var data = ev.data;

            modifyFlag = false;

            if(data.ModelMap){
                data.responseMessage = data.ModelMap.responseMessage;
                delete data.ModelMap.responseMessage;
            }

            if (data.responseMessage) {
                data.list = data.responseMessage;
            } else if (data.responseError) {
                data.list = [];
            }

        });

        // OHS 2017.08.25 수정 - IE 호환
        //store.load();
        if (g_serviceType == g_bxmService) {
            store.load();
        }else{
            store.load({name: productName});
        }

        var tree = new Tree.TreeList({
            render : '.product-search-list-wrap',
            showLine : false,
            store : store,
            showRoot : false
        });

        tree.render();

        tree.on('itemdblclick', function(e) {

            location.hash = 'code=' + e.item.code+'&path='+e.item.fullPath+'&tntInstId='+e.item.tntInstId;
            location.reload();

            if(!modifyFlag){
                $el.find('.product-search-list-wrap').removeClass('active');
            }
        });
    });
}

//function formModifed(){
//    modifyFlag = true;
//    $('.most-significant-box').attr('data-edited','true');
//}

//function resetFormModifed(){
//    modifyFlag = false;
//    $('.most-significant-box').removeAttr('data-edited');
//}

//onEvent('change', '.pf-cp-product-info-base-form', function() {
//    formModifed();
//})

//onEvent('change', '.pf-cp-product-condition-panel', function(){
//    formModifed();
//})


onEvent('click', '.pf-cp-view-history-btn', function(e) {
    var data = PFComponent.makeYGForm($('.pf-cp-product-info-base-form'));
    renderProductHistoryPopup(data);
});

// OHS 2017.03.22 SideEffect방지를위해 상품용 체크function 도출
// 카드서비스요건 반영 '%' 허용
var productSpecialCharacter = function(selector) {
    var validateItem = $('body').find(selector);
    var checkResult = true;

    $.each(validateItem, function (index, formItem) {
        var text = $(formItem).val();
        var special_str = /[,.`~!@#$^&*+=|\\\'\";:\/?]/;

        if (special_str.test(text)) {
            var message = bxMsg('specialCharacterMsg');
            PFComponent.showMessage(message, 'warning');
            checkResult = false;
        }
    });

    return checkResult;
};

onEvent('click', '.pf-cp-product-info-save-btn', function(e) {

	if(!modifyFlag){
		// 변경된 정보가 없습니다.
		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
		return;
	}

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    };

    var params = productInfoForm.getData();
    params['name'] = params['name'] ? params.name.split(' ').join('') : params['name'];

    // OHS2017.03.22 카드서비스요건 반영 '%' 허용
    if (!PFValidation.mandatoryCheck('.mandatory') || !productSpecialCharacter('.special')
        || ! PFValidation.finalLengthCheck('',100,params['name'])) {
        return;
    }

    if(params['isCompositeProduct']==='Y'){
        var productRelationVO = {};
        productRelationVO.voList = clickEventForGrid.getAllData();
        productRelationVO.code = clickEventForCode;
        $.each(productRelationVO.voList,function(index, vo){
            delete(vo.code);
        })

        params.productRelationVO = productRelationVO;

    }

    // 판매종료일자가 과거이고, 해제상태일때 status 서버로 값 전송
    if(PFUtil.compareDateTime(commonConfig.currentXDate, XDate(params.saleEnd)) == -1
    		&& $('.product-base-info-mgmt-status').find('select') && $('.product-base-info-mgmt-status').find('select').val() == '06') {
    	params.productStatus = $('.product-base-info-mgmt-status').find('select').val();
    }

    params.projectId = projectId;
    params.pdInfoDscd = pdInfoDscd;
    params.tntInstId = tntInstId;

    PFRequest.post('/product/updateProductBase.json', params, {
        success: function(responseData) {
            PFComponent.showMessage(bxMsg('workSuccess'), 'success',function(){

            	modifyFlag = false;

                var hashString = PFUtil.getHash();
                var path;
                var code;
                var tntInstId;

                hashString.split('&').forEach(function(el) {
                    if (el.split('=')[0] === 'path') {
                        path = el.split('=')[1];
                    } else if (el.split('=')[0] === 'code') {
                        code = el.split('=')[1];
                    } else if (el.split('=')[0] === 'tntInstId') {
                        code = el.split('=')[1];
                    }
                });

                location.hash = 'code=' + code + '&path=' + path +'&tntInstId=' + tntInstId;
                $el.find('.pf-cp-product-info-base-form').find('.product-name').val(params.name);

                // 2017.02.07 OHS - 상품상태가 '해제' 일경우 처리
                if($('.product-base-info-mgmt-status').find('select').val() == '06') {
                	// '해제'상태 text처리
                	$('.product-base-info-mgmt-status').empty();
                	$('.product-base-info-mgmt-status').text(codeMapObj.ProductStatusCode['06']);

                	// 버튼처리
                	$('.pf-cp-product-info-delete-btn').prop('disabled', true);
                	$('.pf-cp-product-info-save-btn').prop('disabled', true);
                }
            });


            var changedNode = productStore.findNode(params.code);
            changedNode.text = params.name;

            // 상품상태 업데이트
            // OHS 2017.04.04 판매중상품이 다시 수정가능으로 바뀔수 없음.
            // 대신 상품기본 메인화면에 있는 상태를 업데이트 ( 판매중-> 해제 ) 로 바뀔 수 있으므로.
            //changedNode.productStatus = '06';
            changedNode.productStatus = params.productStatus;
            productStore.update(changedNode);

            modifyFlag = false; // resetFormModifed();
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdService',
            operation: 'updatePd'
        }
    });
});

onEvent('click', '.pf-cp-product-info-delete-btn', function(e) {
    if(!isHaveProject()){
        haveNotTask();
        return;
    }
    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    };
    var code = clickEventForCode;
    var requestData = { 'code' : code };
    requestData.projectId = projectId;
    requestData.pdInfoDscd = pdInfoDscd;
    requestData.tntInstId = tntInstId;

    PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), function() {


        PFRequest.post('/product/deleteProduct.json',requestData,{
            success: function(){
                var deleteNode = productStore.findNode(code);
                productStore.remove(deleteNode);
                renderProductNavTree();
                $('.pf-detail-wrap').removeClass('active');

                PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'PdService',
                operation: 'deletePd'
            }
        });

        modifyFlag = false; // resetFormModifed();

    }, function() {
        return;
    });

});

onEvent('click', '.pf-cp-product-hashtag-save-btn', function(e) {

  // for IE
  // console.log(tagsChanged); for debug
  //var hashtagList = Array.from(tagsChanged.values());
  var hashtagList = [];
  if (tagsChanged && tagsChanged.size > 0) {
	  tagsChanged.forEach(function(el) {
		  hashtagList.push(el);
	  });
  }

  // OHS 20180209 변경된내용이 없으면 저장하지 않음.
  if(!hashtagList || hashtagList.length == 0) {
	  // noChangeTag
	   PFComponent.showMessage(bxMsg('noChangeTag'), 'warning');
	   return;
  }

  var projectId = getSelectedProjectId();
  if(isNotMyTask(projectId)){
    return;
  };

  var requestData = {
      hashtagList: hashtagList,
      pdInfoDscd: pdInfoDscd,
      tntInstId: tntInstId,
      projectId: projectId
  };

  PFRequest.post('/product/saveProductHashtag.json', requestData, {
    success: function(responseData) {
      PFComponent.showMessage(bxMsg('workSuccess'), 'success');
      tagsChanged.clear();
    },
    bxmHeader: {
      application: 'PF_Factory',
      service: 'PdService',
      operation: 'saveProductHashtag'
    }
  });
});

//onEvent('change', '.first-category-select', function(e){
//
//});

onEvent('click', '.xb-btn-download', function(e) {
    alert(1);
});

onEvent('blur', '.start-date', function(e){
    PFUtil.checkDate(e.target);
});

onEvent('blur', '.end-date', function(e){
    PFUtil.checkDate(e.target, '9999-12-31 23:59:59');
});


// Load Template in HTML
productInfoTpl = getTemplate('main/productInfoTpl');
baseInfoMngFormTpl = getTemplate('main/baseInfoMngFormTpl');
relInfoGridTpl = getTemplate('main/relInfoGridTpl');
relDepartmentAddPopupTpl = getTemplate('main/relDepartmentAddPopupTpl');
fileUploadPopupTpl = getTemplate('main/fileUploadPopupTpl');
productLeftTreeTpl = getTemplate('main/productLeftTreeTpl');

$('.pf-cp-left-tree-box').html(productLeftTreeTpl());



function traceTree() {
    if(traceTree.completeTrace) {return;}

    var currentNode = productStore.findNode(traceTree.traceList[traceTree.depth]);

    if((traceTree.traceList.length -1) === traceTree.depth) {
        setTimeout(function() {
            navTree.setSelection(currentNode);
            scrollMove();
        }, 500);
        traceTree.completeTrace = true;
        selectedTreeItem = currentNode;
        return;
    }else {
        navTree.expandNode(currentNode);
    }

    traceTree.depth++;
}

function renderProductNavTree() {
    if(renderProductNavTree.isRendered) { return; }
    renderProductNavTree.isRendered = true;

    //var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();

    PFUI.use(['pfui/tree', 'pfui/data', 'pfui/menu'], function (Tree, Data, Menu) {


        if (g_serviceType == g_bxmService){// bxm
            var params = {
                header: {
                    application: 'PF_Factory',
                    service: 'CatalogService',
                    operation: 'queryCatalog'
                },
                input: {
                    tntInstId: tntInstId,
                    pdInfoDscd: pdInfoDscd,
                    treeType: treeType,
                    commonHeader: {
                        loginTntInstId: getLoginTntInstId()
                    }
                }
            };

            productStore = new Data.TreeStore({
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
                map:  {
                    'name': 'text',
                    'id': 'id',
                    'bottom': 'leaf',
                    'childTransactionCode': 'childTransactionCode',
                    'parentCatalogId': 'parentCatalogId',
                    'type': 'type'
                }
            });
        } else {
            productStore = new Data.TreeStore({
                autoLoad: false,
                url: '/catalog/getCatalog.json?tntInstId=' + tntInstId + '&commonHeaderMessage={"loginTntInstId":"' + getLoginTntInstId() + '", "lastModifier":"' + getLoginUserId() + '"}&pdInfoDscd=' + pdInfoDscd + '&treeType=' + treeType,
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

        // click change url params
        productStore.on('beforeload', function (ev) {
            var params = ev.params,
                node = productStore.findNode(params.id),
                queryParams, firstCatalogId, secondCatalogId;


            if(!node || node.productTemplateCode) { return; }

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
                            tntInstId: getLoginTntInstId(),
                            pdInfoDscd: pdInfoDscd,
                            treeType: treeType, // id : node.id,
                            firstCatalogId : node.id.split('.')[0],
                            secondCatalogId: node.id.split('.')[1],
                            commonHeader: {
                                loginTntInstId: getLoginTntInstId(),
                                lastModifier: getLoginUserId()
                            }
                        }
                    };

                    if (node.type === '06') {
                        queryParams.input.currentCatalogId = node.id.split('.')[node.id.split('.').length - 1];
                    }

                    productStore.get('proxy').set('ajaxOptions', {
                        contentType: 'application/json; charset=UTF-8',
                        data:JSON.stringify(queryParams)
                    });

                    productStore.set('map', {
                        'name': 'text',
                        'id': 'id',
                        'bottom': 'leaf'
                        //'firstCatalogId': 'firstCatalogId',
                        //'secondCatalogId': 'secondCatalogId'
                    });
                }else if(node.record.code){
                    queryParams = {
                        header: {
                            application: 'PF_Factory',
                            service: 'PdService',
                            operation: 'queryListPd'
                        },
                        input: {
                            tntInstId: getLoginTntInstId(),
                            pdInfoDscd: pdInfoDscd,
                            treeType: treeType,
                            businessDistinctionCode: node.firstCatalogId,
                            productTypeCode: node.secondCatalogId,
                            productTemplateCode: node.code,
                            commonHeader: {
                                loginTntInstId: getLoginTntInstId(),
                                lastModifier: getLoginUserId()
                            }
                        }
                    };

                    productStore.get('proxy').set('ajaxOptions', {
                        contentType: 'application/json; charset=UTF-8',
                        data:JSON.stringify(queryParams)
                    });
                    productStore.set('map', {
                        'name': 'text',
                        'code': 'id',
                        'bottom': 'leaf',
                        'productTemplateCode': 'productTemplateCode'
                    });
                } else {
                    queryParams = {
                        header: {
                            application: 'PF_Factory',
                            service: 'CatalogService',
                            operation: 'queryCatalog'
                        },
                        input: {
                            tntInstId: getLoginTntInstId(),
                            pdInfoDscd: pdInfoDscd,
                            treeType: treeType,
                            idType : node.record.type,
                            id: node.record.id,
                            commonHeader: {
                                loginTntInstId: getLoginTntInstId(),
                                lastModifier: getLoginUserId()
                            }
                        }
                    };

                    productStore.get('proxy').set('ajaxOptions', {
                        contentType: 'application/json; charset=UTF-8',
                        data:JSON.stringify(queryParams)
                    });
                    productStore.set('map', {
                        'name': 'text',
                        'id': 'id',
                        'bottom': 'leaf'
                    });
                }
            }
            // spring
            else {
                queryParams = 'tntInstId=' + tntInstId + '&commonHeaderMessage={"loginTntInstId":"' + getLoginTntInstId() + '", "lastModifier":"' + getLoginUserId() + '"}&pdInfoDscd=' + pdInfoDscd;

                if (node.childTransactionCode === 'PT20010') {
                    firstCatalogId = node.id.split('.')[0];
                    secondCatalogId = node.id.split('.')[1];

                    queryParams = queryParams + '&firstCatalogId=' + firstCatalogId + '&secondCatalogId=' + secondCatalogId;

                    if (node.type === '06') {
                        queryParams = queryParams + '&currentCatalogId=' + node.id.split('.')[node.id.split('.').length - 1];
                    }

                    productStore.get('proxy').set('url', '/product/template/queryProductTemplateBaseForList.json?' + queryParams);
                    productStore.set('map', {
                        'name': 'text',
                        'id': 'id',
                        'bottom': 'leaf'
                    });
                } else if (node.record.code) {
                    queryParams = queryParams + '&businessDistinctionCode=' + node.firstCatalogId +
                        '&productTypeCode=' + node.secondCatalogId + '&productTemplateCode=' + node.code;

                    productStore.get('proxy').set('url', '/product/queryProductBaseForList.json?' + queryParams);
                    productStore.set('map', {
                        'name': 'text',
                        'code': 'id',
                        'bottom': 'leaf',
                        'productTemplateCode': 'productTemplateCode'
                    });

                } else {
                    queryParams = queryParams + '&idType=' + node.record.type + '&treeType=' + treeType;
                    productStore.get('proxy').set('url', '/catalog/getCatalog.json?' + queryParams);
                    productStore.set('map', {
                        'name': 'text',
                        'id': 'id',
                        'bottom': 'leaf'
                    });
                }
            }
        });

        productStore.on('beforeprocessload', function (ev) {
            var data = ev.data;

            if(data.ModelMap){
                data.responseMessage = data.ModelMap.responseMessage;
                delete data.ModelMap.responseMessage;
            }

            // for script error;
            if(data.responseMessage == null) {
                data.responseMessage = [];
            }

            if($.isArray(data.responseMessage)) {

                if(data.productTemplateQueryListOrder) {
                    data.responseMessage.forEach(function(product) {
                        product.bottom = false;
                    });
                }
                else{
                    data.responseMessage.forEach(function(product) {
                        if(!product.cls) {
                            if(getLoginTntInstId() != getMotherTntInstId() && product.tntInstId == getMotherTntInstId()){
                                product.cls = 'MOTHER';
                            }
                        }
                    });
                }

                data.childCatalogs = $.grep(data.responseMessage, function(el){
                    return el.useYn != 'N';
                });
            }else if (data.responseMessage) {
                data.childCatalogs = $.grep(data.responseMessage.childCatalogs, function(el){
                        return el.useYn != 'N';
                    }) || [];
            }

        });

        productStore.on('load', function() {
            traceTree();

        });

        productStore.load();

        navTree = new Tree.TreeList({
            itemTpl : '<li class="productTypeDistinctionCode_{productTypeDistinctionCode}">{text}</li>',
            render : '.pf-config-product-tree-nav',
            showLine : false,
            store : productStore,
            checkType : 'none',
            showRoot : false
        });

        $('.pf-config-product-tree-nav').empty();

        navTree.render();

        var treeItem;

        navTree.on('itemdblclick', function(e) {
            if (e.item.productTemplateCode) {
                location.hash = 'code=' + e.item.id+'&path='+e.item.fullPath+'&tntInstId='+e.item.tntInstId;
                if(!modifyFlag){
                    selectedTreeItem = e.item;
                    selectedTreeItem.useYn = e.item.parent.useYn;
                    selectedTreeItem.writeYn = e.item.parent.writeYn;
                    renderProductInfo(PFUtil.getHash());
                }else{
                    PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
                        selectedTreeItem = e.item;
                        selectedTreeItem.useYn = e.item.parent.useYn;
                        selectedTreeItem.writeYn = e.item.parent.writeYn;
                        renderProductInfo(PFUtil.getHash());
                        modifyFlag = false; // resetFormModifed();
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

        var openContextMenuEvent = function (){
            if(!modifyFlag){
                location.hash = 'code=' + treeItem.id + '&path=' + treeItem.fullPath + '&tntInstId=' + treeItem.tntInstId;
                selectedTreeItem = treeItem;
                selectedTreeItem.useYn = treeItem.parent.useYn;
                selectedTreeItem.writeYn = treeItem.parent.writeYn;
                renderProductInfo(PFUtil.getHash());
            }else{
                PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
                    selectedTreeItem = treeItem;
                    selectedTreeItem.useYn = treeItem.parent.useYn;
                    selectedTreeItem.writeYn = treeItem.parent.writeYn;
                    renderProductInfo(PFUtil.getHash());
                    modifyFlag = false; // resetFormModifed();
                }, function() {
                    return;
                });
            }
        }

        var strNewCopyPdText;

        if(pdInfoDscd == pdInfoDscd_Product) {
            strNewCopyPdText = bxMsg('DPE00001_Copy_Title');      // 복사 할 상품이름
        } else if(pdInfoDscd == pdInfoDscd_Service) {
        	strNewCopyPdText = bxMsg('DPE00002_Copy_Title');     // 복사 할 서비스이름
        } else if(pdInfoDscd == pdInfoDscd_Point) {
        	strNewCopyPdText = bxMsg('DPE00003_Copy_Title');     // 복사 할 포인트이름
        }

        var copyContextMenuEvent = function (){
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
            renderProductCopyPopup(treeItem, strNewCopyPdText);
        }

        var strNewRenamePdText;

        if(pdInfoDscd == pdInfoDscd_Product) {
        	strNewRenamePdText = bxMsg('DPE00001_Rename_Title');      // 변경할 상품이름
        } else if(pdInfoDscd == pdInfoDscd_Service) {
        	strNewRenamePdText = bxMsg('DPE00002_Rename_Title');     // 변경할 서비스이름
        } else if(pdInfoDscd == pdInfoDscd_Point) {
        	strNewRenamePdText = bxMsg('DPE00003_Rename_Title');     // 변경할 포인트이름
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
            renderProductRenamePopup(treeItem, strNewRenamePdText);
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

            // OHS 20180130 버그 수정 - =! -> != 로 변경
            if(treeItem.productStatus != '01'){
                PFComponent.showMessage(bxMsg('dontDeleteActiveTypeConditionTemplate'), 'warning');
            }else{
                var requestData = {code : treeItem.id};
                requestData.projectId = projectId;
                requestData.pdInfoDscd = pdInfoDscd;
                requestData.tntInstId = tntInstId;

                PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), function() {
                    PFRequest.post('/product/deleteProduct.json',requestData,{
                        success : function(result){
                            var deleteNode = productStore.findNode(treeItem.id);
                            productStore.remove(deleteNode);
                            renderProductNavTree();
                            $('.pf-detail-wrap').removeClass('active');

                            PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');
                            modifyFlag = false; // resetFormModifed();
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'PdService',
                            operation: 'deletePd'
                        }
                    });
                }, function() {
                    return;
                });
            }
        }

        var strNewPdText;

        if(pdInfoDscd == pdInfoDscd_Product) {
            strNewPdText = bxMsg('Context_Menu7');      // 새 상품 만들기
        } else if(pdInfoDscd == pdInfoDscd_Service) {
            strNewPdText = bxMsg('Context_Menu71');     // 새 서비스 만들기
        } else if(pdInfoDscd == pdInfoDscd_Point) {
            strNewPdText = bxMsg('Context_Menu72');     // 새 포인트 만들기
        }

        var createProductContextMenuEvent = function (){

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
            renderProductCreatePopup(treeItem, strNewPdText);

        }

        var inactiveProductContextMenu = new Menu.ContextMenu({
            children : [
                makeContextMenu('icon-zoom-in', bxMsg('Context_Menu2'), openContextMenuEvent),
                //makeContextMenu('icon-file', bxMsg('newTabOpen'), newTabOpenContextMenuEvent),
                makeContextMenu('icon-book', bxMsg('Context_Menu3'), copyContextMenuEvent),
                makeContextMenu('icon-pencil', bxMsg('Context_Menu4'), renameContextMenuEvent),
                makeContextMenu('icon-remove', bxMsg('Context_Menu5'), removeContextMenuEvent)
            ]
        });

        var activeProductContextMenu = new Menu.ContextMenu({
            children : [
                makeContextMenu('icon-zoom-in', bxMsg('Context_Menu2'), openContextMenuEvent),
                //makeContextMenu('icon-file', bxMsg('newTabOpen'), newTabOpenContextMenuEvent),
                makeContextMenu('icon-book', bxMsg('Context_Menu3'), copyContextMenuEvent),
                makeContextMenu('icon-pencil', bxMsg('Context_Menu4'), renameContextMenuEvent)
            ]
        });

        var productTemplateContextMenu = new Menu.ContextMenu({
            children : [
                makeContextMenu('icon-plus', strNewPdText, createProductContextMenuEvent)
            ]
        });

        var centerBankContextMenu = new Menu.ContextMenu({
            children : [
                makeContextMenu('icon-zoom-in', bxMsg('Context_Menu2'), openContextMenuEvent)
            ]
        });

        // OHS 2017.04.04 추가 - 해제상태의 메뉴 추가 ('열기')
        var concellationContextMenu = new Menu.ContextMenu({
            children : [
                makeContextMenu('icon-zoom-in', bxMsg('Context_Menu2'), openContextMenuEvent)
            ]
        });

        navTree.on('itemcontextmenu', function(ev){
            var item = ev.item;

            var activeY = ev.pageY >= 500 ? ev.pageY-(28*5) : ev.pageY;
            var inactiveY = ev.pageY >= 500 ? ev.pageY-(28*4) : ev.pageY;

            navTree.setSelected(item);
            treeItem = item;

            // 상품, 수정가능
            if(treeItem.productTemplateCode && treeItem.productStatus =='01') {
                if(writeYn !='Y' || treeItem.parent.writeYn == 'N'){
                    centerBankContextMenu.set('xy',[ev.pageX,activeY]);
                    centerBankContextMenu.show();
                }else{
                    inactiveProductContextMenu.set('xy',[ev.pageX,activeY]);
                    inactiveProductContextMenu.show();
                }
            }
            // 상품, 판매중
            else if(treeItem.productTemplateCode && treeItem.productStatus =='04'){
                if(writeYn !='Y' || treeItem.parent.writeYn == 'N'){
                    centerBankContextMenu.set('xy',[ev.pageX,activeY]);
                    centerBankContextMenu.show();
                }else{
                    activeProductContextMenu.set('xy',[ev.pageX,inactiveY]);
                    activeProductContextMenu.show();
                }
            }
            // OHS 2017.04.04 추가 - 해제상태일때 '열기'는 보이도록 추가
            else if(treeItem.productTemplateCode && treeItem.productStatus =='06'){
            	concellationContextMenu.set('xy',[ev.pageX,activeY]);
            	concellationContextMenu.show();
            }

            // 상품템플릿
            // OHS 2017.04.04 수정 - 상품템플릿에서만 우클릭으로 +새상품만들기가 보여야함.
            else if(treeItem.cls == 'PT' && treeItem.industryDistinctionCode && writeYn =='Y' && treeItem.writeYn =='Y') {
                productTemplateContextMenu.set('xy',[ev.pageX,ev.pageY]);
                productTemplateContextMenu.show();
            }
            return false; //prevent the default menu

        });
    });
}

function renderProductInfo(productRequestParam) {
    firstConditionTabRender = true;

    if(!productRequestParam) {
        traceTree.completeTrace = true;
        renderProductNavTree();
        return;
    }
    selectRequestParam = productRequestParam;
    $el.find('.product-info').elementReady(renderProductSubTab);
}

function renderProductSubTab() {
    var that = this;

    PFUI.use(['pfui/tab','pfui/mask'],function(Tab){
        that.html(productInfoTpl());

        var tab = new Tab.TabPanel({
            srcNode : '.pf-cp-sub-tab',
            elCls : 'nav-tabs',
            panelContainer : '#pf-cp-sub-tab-conts',
            autoRender: true,
            itemStatusCls : {
                'selected' : 'active'
            }
        });

        tab.on('click', function (ev) {

            // 서비스화면 and 제공조건 탭 and Render가 필요한 경우
            if(pdInfoDscd == pdInfoDscd_Service && $('.pf-cp-sub-tab .active').index() == 2 && providedConditionTabRender){
                renderProvidedCondition(conditionRequestParam);
            }
            // OHS 2017.03.17 추가 - 서비스화면 and 한도조건 탭 and Render가 필요한 경우
            else if(pdInfoDscd == pdInfoDscd_Service && $('.pf-cp-sub-tab .active').index() == 3 && limitConditionTabRender){
            	renderLimitCondition(conditionRequestParam);
            }
        });

        renderBaseInfo();
        providedConditionTabRender = true;
        limitConditionTabRender = true;
    });
}

// 기관코드 콤보 바인딩
function setTntInstComboBox() {
    tntInstId = getLoginTntInstId();
    renderTntInstComboBox($el.find('.pf-multi-entity'), tntInstId);

    if (!getMortherYn()) {
        $el.find('.pf-multi-entity-yn').hide();
    }
}

// 관계설정정보
function getRelConfig(){

	var requestParam = {
			pdInfoDscd : pdInfoDscd
	}

	PFRequest.get('/common/relation/getListPdRelationConfiguration.json', requestParam, {
        success: function (responseData) {
        	if(responseData.length>0){
        		responseData.forEach(function(el){
        			if(el.useYn == 'Y'){
        				relNodesChildren.push({id:el.relTpCd , text:el.relTpNm});
        			}
        		})
        	}
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationConfigurationService',
            operation: 'getListPdRelationConfiguration'
        }
	});
}

// EmergencyControl
function fnEmergencyControl(flag){

    if(writeYn == 'Y'){
        if(flag) {  // 개발과제가 Emergency 일 때
            $('.write-btn').prop('disabled', false);
        }
        else if(selectedTreeItem && selectedTreeItem.productStatus == '04'){
            $('.pf-cp-product-info-delete-btn').prop('disabled', true);
            fnEmergencyControlForCpl4FeePopup(false);
        }
        // 해제상태일경우 저장,삭제불가
        else if(selectedTreeItem && selectedTreeItem.productStatus == '06') {
        	 $('.pf-cp-product-info-delete-btn').prop('disabled', true);
        	 $('.pf-cp-product-info-save-btn').prop('disabled', true);
        }

        fnEmergencyControlForProvCnd(flag);
    }
}
