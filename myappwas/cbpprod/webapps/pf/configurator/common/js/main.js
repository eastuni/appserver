/**
 * Common Condition
 * 공통조건
 *
 * @author BwG
 * @history
 * 201x.xx.xx Initial
 */

$(function() {
    setMainTapLeftPosition();
    setTntInstComboBox();

    var hash = parent.$('.pf-hidden .hash').text();
    if(hash) {
        location.hash = hash;
        parent.$('.pf-hidden .hash').text('');
    }

    renderCommonInfo(PFUtil.getHash());
});

// OHS 2018.01.16추가 - 상품정보구분코드(디렉토리분리로 인해 오류 방지)
var pdInfoDscd_Product = '01';  // 상품
var pdInfoDscd_Service = '02';  // 서비스
var pdInfoDscd_Point   = '03';  // 포인트

$('body').css('overflow-y','scroll');

var modifyFlag = false;
var gridRendered = false;

var $el = $('.pf-cc');          // Page Root jQuery Element


// 공통조건 전역 변수
var commonLeftTreeTpl;
var pdInfoDscd_Product = '01',
    pdInfoDscd = pdInfoDscd_Product;

// Related common ID Cache
var //selectedTreeItem, // 상품 tree 선택시 사용
    selectRequestParam;

var clickEventForCode, clickEventForNewData, clickEventForGrid, clickSaveEventForUrl;

var currentPage;
var selectedCellIndex, selectedCndGridCellIndex;

var navTreeStore;

var tntInstId;

var conditionApplyTargetDscd; //제공조건기본 조건적용대상구분코드

var tokens; // OHS20180418 추가 - 계산영역처럼 back-sapce 버튼 처리를 하기 위함

function scrollMove(){
    // offset() : 대상 element가 시작되는 x 좌표와 y 좌표 값을 리턴한다
    var selectedItemTop = $('.pfui-tree-item.pfui-tree-item-selected').offset().top;
    $('.pf-left-nav .pf-panel-body').scrollTop(selectedItemTop-200);
}

var onEvent = PFUtil.makeEventBinder($el);
var navTree;

PFComponent.toolTip($el);

var checkFloat = PFValidation.floatCheck($el);
checkFloat('.float19', 17, 2);
checkFloat('.float21', 19, 2);
checkFloat('.float10', 3, 6);
checkFloat('.float0', 3, 0); // decimal 0 정수 처리

var checkFlatForRageType = PFValidation.floatCheckForRangeType($el);
checkFlatForRageType('.float-range-10', 7, 3);
checkFlatForRageType('.float-range-21', 19, 2);
checkFlatForRageType('.float-range-0', 14, 0);	// 일자(+시분초)를 감안하여 14자리로 변경

var focusDrag = PFValidation.dragAll($el);
focusDrag('.float21');
focusDrag('.float19');
focusDrag('.float10');
focusDrag('.float0'); // decimal 0 정수 처리
focusDrag('.float-range-21');
focusDrag('.float-range-10');
focusDrag('.float-range-0'); // OHS20180417 추가 - 주기,숫자등과같은 조건은 dragall 처리가 되지않아 추가

var lengthVlad = PFValidation.realTimeLengthCheck($el);
lengthVlad('.length-check-input', 50);

// 템플릿 로드
commonLeftTreeTpl = getTemplate('condition/commonLeftTreeTpl');
$('.pf-cc-left-tree-box').html(commonLeftTreeTpl());

//function formModifed(){
//    modifyFlag = true;
//    $('.most-significant-box').attr('data-edited','true');
//}

//function resetFormModifed(){
//    modifyFlag = false;
//    $('.most-significant-box').removeAttr('data-edited');
//}

//prevent tag a event
onEvent('click', 'a', function(e) {e.preventDefault();});

onEvent('blur', '.start-date', function(e){
    PFUtil.checkDate(e.target);
});

onEvent('blur', '.end-date', function(e){
    PFUtil.checkDate(e.target, '9999-12-31 23:59:59');
});

onEvent('click', '.refresh-icon', function(e) {
    renderConditionGroupNavTree.isRendered = false;
    renderConditionGroupNavTree();
    $el.find('.pf-cc-info-wrap').removeClass('active');
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

// 기관코드 콤보 change event
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

    renderConditionGroupNavTree.isRendered = false;
    renderConditionGroupNavTree();
    $el.find('.pf-cc-info-wrap').removeClass('active');
});

onEvent('click', '.common-search-name', function(e) {
    $el.find('.common-search-list-wrap').removeClass('active');
});

// 조건트리 검색창 엔터키
onEvent('keyup', '.common-search-name', function(e) {
    var commonName = this.value.split(' ').join('');
    if (e.keyCode == '13' && commonName) {
        loadcommonList(commonName);
    }
});

// 조건트리 검색버튼
onEvent('click', '.common-search-btn', function(e) {
    var commonName = $el.find('.common-search-name').val().split(' ').join('');
    if (commonName) {
    	loadcommonList(commonName);
    }
});

onEvent('click', '.pf-cp-product-condition2-fee-save-btn', function(e) {
    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    }

    var param = {
        code: productInfo.code,
        projectId: projectId,
        tntInstId: tntInstId
    };

    param.voList = cndType2Grid.getAllData();
    $.each(param.voList, function(index, vo){
        delete(vo.text);
        delete(vo.id);
        delete(vo.rate);
    });

    PFRequest.post('/product/updateProductPrimeInterestRelation.json', param, {
        success: function(responseData) {
            if (responseData === true) {
                PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                $el.find('.pf-cp-condition-list-wrap').empty();
                renderConditionTree(conditionRequestParam);
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationService',
            operation: 'updatePrimeInterestRelation'
        }
    });
});

// 엑셀 업로드 버튼 클릭
onEvent('mousedown', '.excel-upload-btn', function(e) {
  renderExcelUploadPopup();
});

/*
 * 엑셀 다운로드 버튼 클릭
 */
onEvent('click', '.excel-down-btn', function(e) {
    var bxmHeader = {
        application: 'PF_Factory',
        service: 'PdCndService',
        operation: 'download'
    };

    bxmHeader.locale = getCookie('lang');
    var commonHeader = {
        loginTntInstId: $('.product-factory-header', parent.document).find('.login-tntInst-id').text(),
        motherTntInstId: getCookie('motherTntInstId'),
        lastModifier : getCookie('loginId')
    };
    var input = {
        conditionGroupTemplateCode : detailRequestParam.conditionGroupTemplateCode,
        conditionGroupCode : detailRequestParam.conditionGroupCode,
        conditionCode : detailRequestParam.conditionCode,
        tntInstId : detailRequestParam.tntInstId,
        conditionType : selectedCondition.conditionTypeCode,
        commonConditionYn : 'Y',
        loginTntInstId: $('.product-factory-header', parent.document).find('.login-tntInst-id').text(),
        commonHeader : commonHeader
    };

    var request = {
        header : bxmHeader,
        input : input
    };

    // BXM 인 경우
    if(g_serviceType == g_bxmService){
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/serviceEndpoint/json/request.json', true);
        xhr.responseType = 'blob';

        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.onload = function(e) {
            if (this.status == 200) {
                var blob = new Blob([this.response], {type: 'application/vnd.ms-excel'});

                if(!blob || blob.size == 0) {
                    PFComponent.showMessage(bxMsg('Z_ErrorMessage'), 'error');
                }
                else {
                    var downloadUrl = URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    a.href = downloadUrl;
                    a.download = "ProductCondition.xls";
                    document.body.appendChild(a);
                    a.click();
                }
            } else {
                PFComponent.showMessage(this.response, 'error');
            }
        };
        xhr.send(JSON.stringify(request));
    }
    else {
        var url = '/product/download.json?conditionGroupTemplateCode=' + detailRequestParam.conditionGroupTemplateCode
            + '&conditionGroupCode=' + detailRequestParam.conditionGroupCode
            + '&conditionCode=' + detailRequestParam.conditionCode
            + '&tntInstId=' + detailRequestParam.tntInstId
            + '&conditionType=' + selectedCondition.conditionTypeCode
            + '&commonConditionYn=Y';
        $('.file-download-iframe').attr('src', url);
    }
});

/*
 * 업로드용 엑셀 다운로드 버튼 클릭
 */
onEvent('click', '.excel-down-for-upload-btn', function(e) {

    var bxmHeader = {
        application: 'PF_Factory',
        service: 'PdCndService',
        operation: 'download'
    };

    bxmHeader.locale = getCookie('lang');
    var commonHeader = {
        loginTntInstId: $('.product-factory-header', parent.document).find('.login-tntInst-id').text(),
        motherTntInstId: getCookie('motherTntInstId'),
        lastModifier : getCookie('loginId')
    };
    var input = {
        conditionGroupTemplateCode : detailRequestParam.conditionGroupTemplateCode,
        conditionGroupCode : detailRequestParam.conditionGroupCode,
        conditionCode : detailRequestParam.conditionCode,
        tntInstId : detailRequestParam.tntInstId,
        conditionType : selectedCondition.conditionTypeCode,
        commonConditionYn : 'Y',
        uploadYn : 'Y',
        loginTntInstId: $('.product-factory-header', parent.document).find('.login-tntInst-id').text(),
        commonHeader : commonHeader
    };

    var request = {
        header : bxmHeader,
        input : input
    };

    // BXM 인 경우
    if(g_serviceType == g_bxmService){
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/serviceEndpoint/json/request.json', true);
        xhr.responseType = 'blob';

        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.onload = function(e) {
            if (this.status == 200) {
                var blob = new Blob([this.response], {type: 'application/vnd.ms-excel'});

                if(!blob || blob.size == 0) {
                    PFComponent.showMessage(bxMsg('Z_ErrorMessage'), 'error');
                }
                else {
                    var downloadUrl = URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    a.href = downloadUrl;
                    a.download = "ProductCondition_upload.xls";
                    document.body.appendChild(a);
                    a.click();
                }
            } else {
                PFComponent.showMessage(this.response.responseError, 'error');
            }
        };
        xhr.send(JSON.stringify(request));
    }
    else {
        var url = '/product/download.json?conditionGroupTemplateCode=' + detailRequestParam.conditionGroupTemplateCode
            + '&conditionGroupCode=' + detailRequestParam.conditionGroupCode
            + '&conditionCode=' + detailRequestParam.conditionCode
            + '&tntInstId=' + detailRequestParam.tntInstId
            + '&conditionType=' + selectedCondition.conditionTypeCode
            + '&uploadYn=Y'
            + '&commonConditionYn=Y';
        $('.file-download-iframe').attr('src', url);
    }
});

function traceTree() {
    if(traceTree.completeTrace) {return;}

    var currentNode = navTreeStore.findNode(traceTree.traceList[traceTree.depth]);

    if((traceTree.traceList.length -1) === traceTree.depth) {
        setTimeout(function() {
            navTree.setSelection(currentNode);
            scrollMove();
        }, 500);
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

    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();

    PFUI.use(['pfui/tree', 'pfui/data', 'pfui/menu'], function(Tree, Data, Menu) {

        if (g_serviceType == g_bxmService){// bxm
            var params = {
                header: {
                    application: 'PF_Factory',
                    service: 'CatalogService',
                    operation: 'queryCatalog'
                },
                input: {
                    tntInstId: tntInstId,
                    //pdInfoDscd: pdInfoDscd,
                    loginTntInstId: loginTntInstId,
                    treeType: 'COM_CG',
                    commonHeader: {
                        loginTntInstId: getLoginTntInstId()
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
                map:  {
                    'name': 'text',
                    'bottom': 'leaf'
                }
            });
        } else {
            navTreeStore = new Data.TreeStore({
                autoLoad: false,
                url: '/catalog/getCatalog.json?treeType=COM_CG&tntInstId=' + tntInstId + '&loginTntInstId=' + loginTntInstId,
                dataProperty: 'childCatalogs',
                map: {
                    'name': 'text',
                    'bottom': 'leaf'
                }
            });
        }

        navTreeStore.on('beforeload', function(ev) {
            var params = ev.params,
                node = navTreeStore.findNode(params.id),
                queryParams;

            if(!node) { return; }

            // 최초 Node
            if(node.level == 1) {
                if(g_serviceType == g_bxmService){
                    queryParams = {
                        header: {
                            application: 'PF_Factory',
                            service: 'PdCndService',
                            operation: 'queryListPdCnd'
                        },
                        input: {
                            tntInstId: tntInstId,
                            //pdInfoDscd: pdInfoDscd,
                            conditionGroupTemplateTypeCode: params.id,
                            commonConditionYn: 'Y',
                            loginTntInstId: loginTntInstId,
                            commonHeader: {
                                loginTntInstId: getLoginTntInstId(),
                                lastModifier: getLoginUserId()
                            }
                        }
                    };

                    navTreeStore.get('proxy').set('ajaxOptions', {
                        contentType: 'application/json; charset=UTF-8',
                        data:JSON.stringify(queryParams)
                    });
                }else {
                    queryParams = 'conditionGroupTemplateTypeCode=' + params.id +
                        '&commonConditionYn=Y&tntInstId=' + tntInstId + '&loginTntInstId=' + loginTntInstId +
                        '&commonHeaderMessage={"loginTntInstId":"' + getLoginTntInstId() + '", "lastModifier":"' + getLoginUserId() + '"}';

                    navTreeStore.get('proxy').set('url', '/product_condition/getListProductCondition.json?' + queryParams);
                }
                navTreeStore.set('dataProperty', 'responseMessage');
            }
        });

        navTreeStore.on('beforeprocessload', function (ev) {
            var data = ev.data;

            if(data.ModelMap){
                data.responseMessage = data.ModelMap.responseMessage;
                delete data.ModelMap.responseMessage;
            }



            if($.isArray(data.responseMessage)) {

                data.responseMessage = $.grep(data.responseMessage, function(el){
                    return el.useYn != 'N';
                });

                data.childCatalogs = data.responseMessage;
            }else if (data.responseMessage) {

                data.responseMessage.childCatalogs = $.grep(data.responseMessage.childCatalogs, function(el){
                    return el.useYn != 'N';
                });

                data.childCatalogs = data.responseMessage.childCatalogs || [];
            }
        });

        navTreeStore.on('load', traceTree);

        navTreeStore.load();

        navTree = new Tree.TreeList({
            render: '.pf-config-common-tree-nav',
            itemTpl : '<li class="{custom}">{text}</li>',
            store: navTreeStore,
            checkType: 'none'
        });

        $('.pf-config-common-tree-nav').empty();
        navTree.render();

        var treeItem;

        navTree.on('itemdblclick', function (ev) {
            // 최하위 레벨에서 Detail 조회
            if (ev.item.level == 3) {
                detailRequestParam = {
                    conditionGroupTemplateCode: ev.item.conditionGroupTemplateCode,
                    conditionGroupCode: ev.item.conditionGroupCode,
                    conditionCode: ev.item.id,
                    tntInstId: ev.item.tntInstId,
                    writeYn : (ev.item.writeYn != 'N' ? 'Y' : 'N')
                };

                if (!modifyFlag){
                    renderConditionTree(detailRequestParam, ev.item.conditionTypeCode, ev.item.conditionDetailTypeCode);
                } else{
                    PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
                    	modifyFlag = false;
                        renderConditionTree(detailRequestParam, ev.item.conditionTypeCode, ev.item.conditionDetailTypeCode);
                    }, function() {
                        return;
                    });
                }
            }
        });

        var commonConditionGroupContextMenu = new Menu.ContextMenu({
            children : [
                {
                    iconCls:' icon-zoom-in',
                    text : bxMsg('Context_Menu2'),
                    listeners:{
                        'click': function(e) {
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
                    }
                },
                {
                    iconCls:'icon-file',
                    text : bxMsg('newTabOpen'),
                    listeners:{
                        'click': function(e) {
                            var hash = '#conditionGroupTemplateCode=' + treeItem.id,
                                protocol = (location.host.substr(0,5) === location.protocol) ? '' : location.protocol + '//';

                            window.open(protocol + location.host + location.pathname + hash, '_blank');
                        }
                    }
                }
            ]
        });

        var commonConditionGroupInactiveContextMenu = new Menu.ContextMenu({
            children : [
                {
                    iconCls:' icon-zoom-in',
                    text : bxMsg('Context_Menu2'), // 열기
                    listeners:{
                        'click': function(e) {
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
                    }
                },
                {
                    iconCls:'icon-file',
                    text : bxMsg('newTabOpen'), // 새탭으로 열기
                    listeners:{
                        'click': function(e) {
                            var hash = '#conditionGroupTemplateCode=' + treeItem.id,
                                protocol = (location.host.substr(0,5) === location.protocol) ? '' : location.protocol + '//';

                            window.open(protocol + location.host + location.pathname + hash, '_blank');
                        }
                    }
                }
            ]
        });
    });
}

function renderCommonInfo(commonRequestParam) {
    // 처음 오픈시
    if(!commonRequestParam) {
        traceTree.completeTrace = true;
        renderConditionGroupNavTree();
        return;

    } else { // 검색창을 통해 오픈시

    	var commonRequestObject = {};
        $.each(commonRequestParam.split('&'),function(index, commonRequestItem){
            var param = commonRequestItem.split('=');
            commonRequestObject[param[0]] = param[1];
        })

    	// Node를 찾아가기 위한 path
    	traceTree.traceList = [commonRequestObject.cndGroupTemplateTypeCode, commonRequestObject.cndGroupTemplateCode, commonRequestObject.cndCode];
    	traceTree.depth = 0;

    	// 트리조회
    	renderConditionGroupNavTree();

    	// 기본조회 input
    	detailRequestParam = {
			conditionGroupTemplateCode: commonRequestObject.cndGroupTemplateCode,
            conditionGroupCode: commonRequestObject.cndGroupTemplateCode + '001',
            conditionCode: commonRequestObject.cndCode,
            tntInstId: tntInstId,
            writeYn : (writeYn != 'N' ? 'Y' : 'N')
    	};

    	// 기본조회
        if (!modifyFlag){
            renderConditionTree(detailRequestParam, commonRequestObject.cndTypeCode, commonRequestObject.cndDetailTypeCode);
        } else{
            PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
                renderConditionTree(detailRequestParam, commonRequestObject.cndTypeCode, commonRequestObject.cndDetailTypeCode);
                modifyFlag = false;
            }, function() {
                return;
            });
        }
    }
}


// 조건트리 검색창 조회
function loadcommonList(commonName) {
    $el.find('.common-search-list-wrap').addClass('active');
    $el.find('.common-search-list-wrap').empty();

    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();

    PFUI.use(['pfui/tree', 'pfui/data'], function (Tree, Data) {
        var store;

        var params = {
            header: {
                application: 'PF_Factory',
                service: '',
                operation: 'queryListCndInCommonCndGroupTemplate'
            },
            input: {
                tntInstId: loginTntInstId,
                pdInfoDscd : pdInfoDscd,
                name : commonName,
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
                url: '/conditionGroup/template/queryListCndInCndGroupTemplate.json?tntInstId=' + loginTntInstId
                	+ '&pdInfoDscd=' + pdInfoDscd
                	+ '&commonCndGroupTemplateYn=Y'
                	+ '&commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '", "lastModifier":"' + getLoginUserId() +'"}',
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

        // OHS 2017.08.25 수정 - IE 호환
        //store.load();
        if (g_serviceType == g_bxmService) {
            store.load();
        }else{
            store.load({name: commonName});
        }

        var tree = new Tree.TreeList({
            render : '.common-search-list-wrap',
            showLine : false,
            store : store,
            showRoot : false
        });

        tree.render();

        tree.on('itemdblclick', function(e) {
            location.hash = '&tntInstId=' + e.item.tntInstId
            	+ '&cndGroupTemplateCode=' + e.item.currentCatalogId
            	+ '&cndGroupTemplateTypeCode=' + e.item.firstCatalogId
            	+ '&cndCode=' + e.item.code
            	+ '&cndTypeCode=' + e.item.type
            	+ '&cndDetailTypeCode=' + e.item.conditionDetailTypeCode;

            location.reload();

            if(!modifyFlag){
                $el.find('.common-search-list-wrap').removeClass('active');
            }
        });
    });
}

//////////////////////////////////////////////////////////////////////////////////////
/////condition tab////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////

var cndValueType2Tpl = getTemplate('condition/cndValueType2Tpl'),
    cndValueType3Tpl = getTemplate('condition/cndValueType3Tpl'),
    cndValueType4Tpl = getTemplate('condition/cndValueType4Tpl'),
    cndValueType4TblByHistory = getTemplate('condition/cndValueType4TblByHistory'),
    relProductAddPopupTpl = getTemplate('condition/relProductAddPopupTpl'),
    cnd4FeePopupTpl = getTemplate('condition/cnd4FeePopupTpl'),
    cnd4FeeSubPopupTpl = getTemplate('condition/cnd4FeeSubPopupTpl'),
    conditionType3_2Tpl = getTemplate('condition/conditionType3_2Tpl');
	conditionType4_2Tpl = getTemplate('condition/conditionType4_2Tpl');
	cnd4FeeConditionValueColumnSettingPopupTpl = getTemplate('condition/cnd4FeeConditionValueColumnSettingPopupTpl'),
    cnd4FeeConditionValueType4TblByComplex = getTemplate('condition/cnd4FeeConditionValueType4TblByComplex'),
    cndApplyRuleTpl = getTemplate('condition/cndApplyRuleTpl');  // 적용규칙

var cndValueType3FixedInfoTpl = getTemplate('condition/cndValueType3FixedInfoTpl'),
	cndValueType3VarInfoTpl = getTemplate('condition/cndValueType3VarInfoTpl');

var conditionType1Tpl = getTemplate('condition/conditionType1Tpl'),
    conditionType2Tpl = getTemplate('condition/conditionType2Tpl'),
    conditionType2GridTpl = getTemplate('condition/conditionType2GridTpl'),
    conditionType3Tpl = getTemplate('condition/conditionType3Tpl'),
    conditionType4Tpl = getTemplate('condition/conditionType4Tpl');
//discountRuleTpl = getTemplate($('#pf-cc-discount-rule-tpl').html());

var detailRequestParam, commonInfo, conditionRequestParam,
    cndValComplexGrid, cndValueType1Grid,
    YforNewColumn,
    stepCndCd,
    normalCndCdYn = false,
    GridMinMaxCheck = true,
    titleDataObj = {},
    titleDataArr = [],
    cndType2Grid, cndType3Grid, cnd4feePopupGrid, limitcnd4feePopupGrid;

// 삭제버튼 클릭 처리
onEvent('click', '.pf-cc-common-condition-delete-btn', function(e) {
    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    }

    var requestData = {
        "conditionCode": selectedCondition.id,
        "conditionGroupCode": selectedCondition.conditionGroupCode,
        "conditionGroupTemplateCode": selectedCondition.conditionGroupTemplateCode,
        "projectId": projectId,
        "tntInstId": tntInstId,
        "commonConditionYn" : 'Y'
    };

    //PFUI.use(['pfui/overlay'], function(Overlay){
    //    PFUI.Message.Confirm(bxMsg('DPE00001_Delete_Confirm'), function() {
    PFComponent.showConfirm(bxMsg('DPE00001_Delete_Confirm'), function() {
        PFRequest.post('/product_condition/deleteProductCondition.json', requestData, {
            success: function(responseData) {
                if (responseData === true) {
                    PFComponent.showMessage(bxMsg('workSuccess'), 'success');

                }

                $el.find('.pf-cc-condition-list-wrap').empty();
                $el.find('.pf-cc-common-condition-panel').hide();

                // Double-click해서 나오는 함수 호출해서 ...
                detailRequestParam = {
                    conditionGroupTemplateCode: selectedCondition.conditionGroupTemplateCode,
                    conditionGroupCode: selectedCondition.conditionGroupCode,
                    conditionCode: selectedCondition.id,
                    tntInstId: tntInstId
                };

                // 조건 삭제 후 조건 재조회
                renderConditionTree(detailRequestParam, selectedCondition.conditionTypeCode, selectedCondition.conditionDetailTypeCode);

                modifyFlag = false;
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'PdCndService',
                operation: 'deletePdCnd'


            }
        });
    }, function() {
        return;
    });
    //});
});

onEvent('click', '.pf-cc-common-condition-save-btn', function(e) {
    if(!isHaveProject()){
        haveNotTask();
        return;
    }

    if (!GridMinMaxCheck) {
        PFComponent.showMessage(bxMsg('DPS0126_1Error4'), 'warning');
        return;
    }
    GridMinMaxCheck = true;

    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    }

    var formData = PFComponent.makeYGForm($('.pf-cc-common-condition-panel .condition-table-wrap')).getData(),
        conditionTypeCode = formData.conditionTypeCode,
        complexGridData,
        dontSave = false;

    if ($el.find('.isMandatory').prop('checked')) {
        formData.isMandatory = true;
    } else {
        formData.isMandatory = false;
    }

    if ($el.find('.returnFeeYn').prop('checked')) {
        formData.returnFeeYn = 'Y';
    } else {
        formData.returnFeeYn = 'N';
    }

    if ($el.find('.isValueNull').prop('checked')) {
        formData.isValueNull = true;
    } else {
        formData.isValueNull = false;

        // 복합조건이나 계층미정의시 에러
        if (formData.conditionClassifyCode == '02' && cndValComplexGrid.getAllData().length == 0 && formData.conditionValueAplyWayCode != '03') {
            PFComponent.showMessage(bxMsg('DPS0129Error5'), 'warning');
            return;
        }

        var titleIndexMap = titleDataArr.filter(function(v) {
          return v.titleConditionTypeCode === "01";
        }).reduce(function(m, v, i) {
          m[v.titleConditionCode] = i;
          return m;
        }, {});

        var tierNumber = 1;
        switch (conditionTypeCode) {

            // 목록형
            case '01':
                if (formData.conditionClassifyCode == '01') {
                    //formData.productCode = productInfo.code;
                    formData.listConditionValue = {};

                    var selectedCode = $('.cnd-val-type1-grid').find('input[name=default-check]:checked').attr('data-code'),
                        gridData = cndValueType1Grid.getAllData(),
                        selectedCheck = false;

                    gridData.forEach(function (el) {
                        /* if (el.code === selectedCode) {
                         el.isDefaultValue = true;
                         } else {
                         el.isDefaultValue = false;
                         }*/

                        if (el.isSelected) {
                            selectedCheck = true;
                        }
                    });

                    if (!selectedCheck) {
                        PFComponent.showMessage(bxMsg('DPJ0122Error1'), 'warning');
                        return;
                    }

                    formData.listConditionValue.defineValues = gridData;
                } else if (formData.conditionClassifyCode == '02') {
                    formData.complexConditionTitleInfoList = titleDataArr;

                    //layerCalcType should be 02 when conditionClassifyCode is 02
                    formData.layerCalcType = '02';

                    titleDataArr.forEach(function (el) {
                        el.titleConditionGroupTemplateCode = formData.conditionGroupTemplateCode;
                    });

                    complexGridData = cndValComplexGrid.getAllData();

                    formData.complexConditionMatrix = [];

                    complexGridData.forEach(function (el) {
                      var listCodes = Object.keys(el).reduce(function(l, key) {
                        if (key.endsWith(".code")) {
                          l.push(el[key]);
                        }
                        return l;
                      }, []);
                      nestedFor(listCodes, function(values) {
                        var complexConditionMatrixDataObj = {};
                        complexConditionMatrixDataObj.listConditionValue = el.y;
                        complexConditionMatrixDataObj.tierNumber = tierNumber++;

                        complexConditionMatrixDataObj.x = [];

                        $.each(el, function (prop, value) {
                            var propNm = prop.split('.');

                            if (prop == 'y') {
                                complexConditionMatrixDataObj.listConditionValue = value;

                                //check that condition value(last column) has one more value or not
                                if (value.defineValues) {
                                    var dontSaveList = true;

                                    value.defineValues.forEach(function (el) {
                                        if (el.isSelected) {
                                            dontSaveList = false;
                                        }
                                    });

                                    if (dontSaveList) {
                                        dontSave = true;
                                        return;
                                    }
                                }

                            } else if (propNm.length != 2) {
                                if (value.listConditionValue) {
                                  value = $.extend({}, value);
                                  var index = titleIndexMap[prop];
                                  var code = values[index];
                                  value.listConditionValue = {
                                      defineValues: [{
                                        code: code,
                                        isSelected: true,
                                      }]
                                  }
                                }
                                value.id = prop;

                                //check that each condition has value or not
                                if (!value.rangeConditionValue && !value.listConditionValue) {
                                    dontSave = true;
                                    return;
                                }
                                else if (value.listConditionValue && value.listConditionValue.defineValues.length === 1
                                    && value.listConditionValue.defineValues[0].code === "") {
                                    dontSave = true;
                                    return;
                                }
                                complexConditionMatrixDataObj.x.push(value);
                            }
                        });

                        //check that condition value(last column) has one more value or not
                        if (!el.y) {
                            dontSave = true;
                            return;
                        }

                        formData.complexConditionMatrix.push(complexConditionMatrixDataObj);
                      });
                    });
                }

                break;

            // 범위형
            case '02' :
                if (formData.conditionClassifyCode == '01') {
                    formData.rangeConditionValue = PFComponent.makeYGForm($('.cnd-value-type2 .bx-info-table')).getData();

                    if (!selectedCondition.isSingleValue) {

                    	// 계약레벨
                    	if(selectedCondition.conditionAgreeLevel == '02') {
                      		// OHS 2017.02.16 시스템최대치에 체크하여도 값이 세팅되기때문에 동일하게 처리
                    		if (!PFValidation.minMaxCheck($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check')) {
                				PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
                				return;
                			}
                    		/*
                    		if (!$el.find('.isSystemMaxValue').find('input').prop('checked')) {
                    			if (!PFValidation.minMaxCheck($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check')) {
                    				PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
                    				return;
                    			}
                    		} else {
                    			if (formData.rangeConditionValue.defalueValue != 0 && parseFloat(formData.rangeConditionValue.minValue) > parseFloat(formData.rangeConditionValue.defalueValue)) {
                    				PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
                    				return;
                    			}
                    		}
                    		*/
                    	}
                    	// 상품레벨
                    	else {
                      		// OHS 2017.02.16 시스템최대치에 체크하여도 값이 세팅되기때문에 동일하게 처리
                    		var checkMsg = PFValidation.minMaxCheckForPfLvl($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check');
                			if (checkMsg) {
                				PFComponent.showMessage(checkMsg, 'warning');
                				return;
                			}
                    		/*
                    		if (!$el.find('.isSystemMaxValue').find('input').prop('checked')) {
                    			var checkMsg = PFValidation.minMaxCheckForPfLvl($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check');
                    			if (checkMsg) {
                    				PFComponent.showMessage(checkMsg, 'warning');
                    				return;
                    			}
                    		}
                    		else {
                    			if (formData.rangeConditionValue.defalueValue != 0 && parseFloat(formData.rangeConditionValue.minValue) > parseFloat(formData.rangeConditionValue.defalueValue)) {
                    				PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
                    				return;
                    			}
                    		}
                    		*/
                    	}
                    }

                    if (selectedCondition.isSingleValue) {
                        formData.rangeConditionValue.isSingleValue = true;
                        formData.rangeConditionValue.maxValue = formData.rangeConditionValue.defalueValue;
                        formData.rangeConditionValue.increaseValue = '0.00';
                        formData.rangeConditionValue.minValue = formData.rangeConditionValue.defalueValue;
                    } else {
                        formData.rangeConditionValue.isSingleValue = false;
                    }

                    if ($el.find('.isSystemMaxValue').find('input').prop('checked')) {
                        formData.rangeConditionValue.isSystemMaxValue = true;
                    } else {
                        formData.rangeConditionValue.isSystemMaxValue = false;
                    }

                } else if (formData.conditionClassifyCode == '02') {
                    formData.complexConditionTitleInfoList = titleDataArr;
                    titleDataArr.forEach(function (el) {
                        el.titleConditionGroupTemplateCode = formData.conditionGroupTemplateCode;
                    });

                    complexGridData = cndValComplexGrid.getAllData();

                    formData.complexConditionMatrix = [];

                    complexGridData.forEach(function (el) {
                      var listCodes = Object.keys(el).reduce(function(l, key) {
                        if (key.endsWith(".code")) {
                          l.push(el[key]);
                        }
                        return l;
                      }, []);
                      nestedFor(listCodes, function(values) {
                        var complexConditionMatrixDataObj = {};
                        complexConditionMatrixDataObj.rangeConditionValue = el.y;
                        complexConditionMatrixDataObj.tierNumber = tierNumber++;

                        complexConditionMatrixDataObj.x = [];

                        $.each(el, function (prop, value) {
                            var propNm = prop.split('.');

                            if (prop == 'y') {
                                // if isSingleValue is True Then, increaseValue
                                if (selectedCondition.isSingleValue) {
                                    value.maxValue = value.defalueValue;
                                    value.increaseValue = '0.00';
                                    value.minValue = value.defalueValue;
                                }
                                complexConditionMatrixDataObj.rangeConditionValue = value;
                            } else if (propNm.length != 2) {
                                if (value.listConditionValue) {
                                  value = $.extend({}, value);
                                  var index = titleIndexMap[prop];
                                  var code = values[index];
                                  value.listConditionValue = {
                                      defineValues: [{
                                        code: code,
                                        isSelected: true,
                                      }]
                                  }
                                }
                                value.id = prop;

                                // RangeConditionValue And ListConditionValue All Not Exists
                                if (!value.rangeConditionValue && !value.listConditionValue) {
                                    dontSave = true;
                                    return;
                                }
                                else if (value.listConditionValue && value.listConditionValue.defineValues.length === 1
                                    && value.listConditionValue.defineValues[0].code === "") {
                                    dontSave = true;
                                    return;
                                }
                                complexConditionMatrixDataObj.x.push(value);
                            }
                        });

                        if (!el.y) {
                            dontSave = true;
                            return;
                        }

                        formData.complexConditionMatrix.push(complexConditionMatrixDataObj);
                      });
                    });
                }

                break;


            case '03' :
                if (formData.conditionClassifyCode == '01') {
                	if ($('.fixed-info .interest-min-check').length>0 &&
                		!PFValidation.minMaxCheck($el, '.fixed-info .interest-min-check', '.fixed-info .interest-max-check', '.fixed-info .interest-default-check')) {

                		PFComponent.showMessage(bxMsg('minMaxAmountMsg'), 'warning');
                        return;
                    }
                    if ($('.var-info .interest-min-check').length>0 &&
                    	!PFValidation.minMaxCheck($el, '.var-info .interest-min-check', '.var-info .interest-max-check', '.var-info .interest-default-check')) {

                    	PFComponent.showMessage(bxMsg('minMaxAmountMsg'), 'warning');
                        return;
                    }

                    if ($('.fixed-info .applyMinInterestRate-min-check').length>0 &&
                    	!PFValidation.minMaxCheck($el, '.fixed-info .applyMinInterestRate-min-check', '.fixed-info .applyMinInterestRate-max-check')) {

                    	PFComponent.showMessage(bxMsg('DPJ0124Error8'), 'warning');
                        return;
                    }
                    if ($('.var-info .applyMinInterestRate-min-check').length>0 &&
                    	!PFValidation.minMaxCheck($el, '.var-info .applyMinInterestRate-min-check', '.var-info .applyMinInterestRate-max-check')) {

                    	PFComponent.showMessage(bxMsg('DPJ0124Error8'), 'warning');
                        return;
                    }

                    // 금리데이터유형코드 != 01.금리값 (상품결정레벨이 상품인 경우-공통은 모두 상품레벨)
                    if($el.find('.fixed-info .InterestTypeCode').val() != '01'){
                        $el.find('.fixed-info .maxSprdRt').val($el.find('.fixed-info .minSprdRt').val());   // 스프레드율 max = min
                    }
                    if($el.find('.var-info .InterestTypeCode').val() != '01'){
                        $el.find('.var-info .maxSprdRt').val($el.find('.var-info .minSprdRt').val());   // 스프레드율 max = min
                    }

                    var defaultData = PFComponent.makeYGForm($('.cnd-value-type3 .default-condition-info')).getData();

                    // 금리적용방식코드 분기
                    // 고정적용
                    if($el.find('.ProductConditionInterestApplyTypeCode').val() == '01') {
                        var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .cnd-value-type3-fixed-info .bx-info-table')).getData();
                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
                    }
                    // 변동적용
                    else if($el.find('.ProductConditionInterestApplyTypeCode').val() == '02'){
                    	var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .cnd-value-type3-var-info .bx-info-table')).getData();
                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
                    }
                    // 고정후변동
                    else if($el.find('.ProductConditionInterestApplyTypeCode').val() == '03'){
                    	var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .cnd-value-type3-fixed-info .bx-info-table')).getData();
                    	detailInfo.varIntCndValueVO = PFComponent.makeYGForm($('.cnd-value-type3 .cnd-value-type3-var-info .bx-info-table')).getData();
                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
                    }

                    // 금리유형에 따른 분기 - 고정후 변동일때
                    if($el.find('.ProductConditionInterestApplyTypeCode').val() == '03'){

                    	/*
                    	 * 고정정보
                    	 */
                    	// 금리값
	                    if($el.find('.fixed-info .InterestTypeCode').val() == '01') {
	                        var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .fixed-info .interest-value-wrap .bx-info-table')).getData();

	                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
	                    }
	                    // 기준금리
	                    else if($el.find('.fixed-info .InterestTypeCode').val() == '02') {
	                        if(!$el.find('.fixed-info .BaseIntRtKndCode')) {
	                            // 기준금리종류 미입력
	                            dontSave = true;
	                        }
	                        if(!$el.find('.fixed-info .BaseIntRtAplyTmCode')) {
	                            // 기준금리적용시점코드 미입력
	                            dontSave = true;
	                        }
	                        if(!$el.find('.fixed-info .SprdAplyFormulaCode')) {
	                            // 스프레드적용산식 미입력
	                            dontSave = true;
	                        }

	                        var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .fixed-info .base-interest-tpl .bx-info-table')).getData();
	                        formData.interestConditionValue = $.extend(defaultData,detailInfo);

	                    }

	                    /*
	                     * 변동정보
	                     */
                    	// 금리값
	                    if($el.find('.var-info .InterestTypeCode').val() == '01') {
	                        var varIntCndValueVO = PFComponent.makeYGForm($('.cnd-value-type3 .var-info .interest-value-wrap .bx-info-table')).getData();

	                        formData.interestConditionValue.varIntCndValueVO = $.extend(formData.interestConditionValue.varIntCndValueVO,varIntCndValueVO);
	                    }
	                    // 기준금리
	                    else if($el.find('.var-info .InterestTypeCode').val() == '02') {
	                        if(!$el.find('.var-info .BaseIntRtKndCode')) {
	                            // 기준금리종류 미입력
	                            dontSave = true;
	                        }
	                        if(!$el.find('.var-info .BaseIntRtAplyTmCode')) {
	                            // 기준금리적용시점코드 미입력
	                            dontSave = true;
	                        }
	                        if(!$el.find('.var-info .SprdAplyFormulaCode')) {
	                            // 스프레드적용산식 미입력
	                            dontSave = true;
	                        }

	                        var varIntCndValueVO = PFComponent.makeYGForm($('.cnd-value-type3 .var-info .base-interest-tpl .bx-info-table')).getData();
	                        formData.interestConditionValue.varIntCndValueVO = $.extend(formData.interestConditionValue.varIntCndValueVO,varIntCndValueVO);

	                    }
                    }else{

                    	if($el.find('.ProductConditionInterestApplyTypeCode').val() == '01'){
                    		$infoWrap = $('.fixed-info');
                    	}else if($el.find('.ProductConditionInterestApplyTypeCode').val() == '02'){
                    		$infoWrap = $('.var-info');
                    	}

	                    // 금리값
	                    if($infoWrap.find('.InterestTypeCode').val() == '01') {
	                        var detailInfo = PFComponent.makeYGForm($infoWrap.find('.interest-value-wrap .bx-info-table')).getData();

	                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
	                    }
	                    // 기준금리
	                    else if($infoWrap.find('.InterestTypeCode').val() == '02') {
	                        if(!$infoWrap.find('.BaseIntRtKndCode')) {
	                            // 기준금리종류 미입력
	                            dontSave = true;
	                        }
	                        if(!$infoWrap.find('.BaseIntRtAplyTmCode')) {
	                            // 기준금리적용시점코드 미입력
	                            dontSave = true;
	                        }
	                        if(!$infoWrap.find('.SprdAplyFormulaCode')) {
	                            // 스프레드적용산식 미입력
	                            dontSave = true;
	                        }

	                        var detailInfo = PFComponent.makeYGForm($infoWrap.find('.base-interest-tpl .bx-info-table')).getData();
	                        formData.interestConditionValue = $.extend(defaultData,detailInfo);

	                    }
                    }

                } else if (formData.conditionClassifyCode == '02') {
                    formData.complexConditionTitleInfoList = titleDataArr;
                    titleDataArr.forEach(function (el) {
                        el.titleConditionGroupTemplateCode = formData.conditionGroupTemplateCode;
                    });

                    complexGridData = cndValComplexGrid.getAllData();

                    formData.complexConditionMatrix = [];

                    complexGridData.forEach(function (el) {
                      var listCodes = Object.keys(el).reduce(function(l, key) {
                        if (key.endsWith(".code")) {
                          l.push(el[key]);
                        }
                        return l;
                      }, []);
                      nestedFor(listCodes, function(values) {
                        var complexConditionMatrixDataObj = {};
                        complexConditionMatrixDataObj.interestConditionValue = el.y;
                        complexConditionMatrixDataObj.tierNumber = tierNumber++;

                        complexConditionMatrixDataObj.x = [];

                        $.each(el, function (prop, value) {
                            var propNm = prop.split('.');

                            if (prop == 'y') {
                                complexConditionMatrixDataObj.interestConditionValue = value;
                            } else if (propNm.length != 2) {
                                if (value.listConditionValue) {
                                  value = $.extend({}, value);
                                  var index = titleIndexMap[prop];
                                  var code = values[index];
                                  value.listConditionValue = {
                                      defineValues: [{
                                        code: code,
                                        isSelected: true,
                                      }]
                                  }
                                }
                                value.id = prop;
                                // RangeConditionValue And ListConditionValue All Not Exists
                                if (!value.rangeConditionValue && !value.listConditionValue) {
                                    dontSave = true;
                                    return;
                                }
                                else if (value.listConditionValue && value.listConditionValue.defineValues.length === 1
                                    && value.listConditionValue.defineValues[0].code === "") {
                                    dontSave = true;
                                    return;
                                }
                                complexConditionMatrixDataObj.x.push(value);
                            }
                        });

                        if (!el.y) {
                            dontSave = true;
                            return;
                        }

                        formData.complexConditionMatrix.push(complexConditionMatrixDataObj);
                      });
                    });
                }
                break;

            // 수수료형
            case '04' :
                if (formData.conditionClassifyCode == '01') {   // 일반조건

                    // 수수료유형
                    var radioType = $('.cnd-value-type4').find('input[name=cnd-value-04-radio]:checked');

//                    /** 최소, 최대, 기본, 증가값 검증 START */
//                    // 금액
//                    if (radioType == 'charge-radio-amount') {
//                        if (!PFValidation.minMaxCheck($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check')) {
//                            PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
//                            return;
//                        }
//                    }
//                    // 율
//                    else if (radioType == 'charge-radio-rate') {
//                        if (!PFValidation.minMaxCheck($el, '.type3-min-check', '.type3-max-check', '.type3-default-check', '.type3-increase-check')) {
//                            PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
//                            return;
//                        }
//                    }
//                    /** 최소, 최대, 기본, 증가값 검증 END */

                    // 계약레벨
                	if(selectedCondition.conditionAgreeLevel == '02') {
                		// 금액
                        if (radioType.hasClass('charge-radio-amount')) {
                            if (!PFValidation.minMaxCheck($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check')) {
                                PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
                                return;
                            }
                        }
                        // 율
                        else if (radioType.hasClass('charge-radio-rate')) {
                            if (!PFValidation.minMaxCheck($el, '.type3-min-check', '.type3-max-check', '.type3-default-check', '.type3-increase-check')) {
                                PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
                                return;
                            }
                        }
                	}
                	// 상품레벨
                	else {
                		// 금액
                        if (radioType.hasClass('charge-radio-amount')) {
                        	var checkMsg = PFValidation.minMaxCheckForPfLvl($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check');
                          	if (checkMsg) {
                				PFComponent.showMessage(checkMsg, 'warning');
                				return;
                			}
                        }
                        // 율
                        else if (radioType.hasClass('charge-radio-rate')) {
                        	var checkMsg = PFValidation.minMaxCheckForPfLvl($el, '.type3-min-check', '.type3-max-check', '.type3-default-check', '.type3-increase-check');
                           	if (checkMsg) {
                				PFComponent.showMessage(checkMsg, 'warning');
                				return;
                			}
                        }
                	}

                    if (formData.conditionValueAplyWayCode === '03') {
                        formData.feeConditionValue = {
                            rate: '0',
                            fixed: '0',
                            bottom: '0',
                            top: '0'
                        };
                    } else {
                        //var radioType = $('.cnd-value-type4').find('input[name=cnd-value-04-radio]:checked').attr('class');
                        formData.feeConditionValue = PFComponent.makeYGForm($('.cnd-value-type4 .active')).getData();
                        // 수수료 유형코드 세팅
                        if (radioType.hasClass('charge-radio-amount')) {
                            formData.feeConditionValue.feeTpCd = '02';
                        } else if (radioType.hasClass('charge-radio-rate')) {
                            formData.feeConditionValue.feeTpCd = '01';
                        }

                        if ($el.find('.isSystemMaxValue').prop('checked')) {
                            formData.feeConditionValue.isSystemMaxValue = true;
                        } else {
                            formData.feeConditionValue.isSystemMaxValue = false;
                        }
                    }

                } else if (formData.conditionClassifyCode == '02') {
                    if (formData.conditionValueAplyWayCode === '03') {
                        formData.complexConditionTitleInfoList = null;
                        formData.complexConditionMatrix = null;
                        formData.conditionClassifyCode = '01';
                    } else {
                        formData.complexConditionTitleInfoList = titleDataArr;
                        titleDataArr.forEach(function (el) {
                            el.titleConditionGroupTemplateCode = formData.conditionGroupTemplateCode;
                        });

                        complexGridData = cndValComplexGrid.getAllData();

                        formData.complexConditionMatrix = [];

                        complexGridData.forEach(function (el) {
                          var listCodes = Object.keys(el).reduce(function(l, key) {
                            if (key.endsWith(".code")) {
                              l.push(el[key]);
                            }
                            return l;
                          }, []);
                          nestedFor(listCodes, function(values) {
                            var complexConditionMatrixDataObj = {};
                            complexConditionMatrixDataObj.feeConditionValue = el.y;
                            complexConditionMatrixDataObj.tierNumber = tierNumber++;

                            complexConditionMatrixDataObj.x = [];

                            $.each(el, function (prop, value) {
                                var propNm = prop.split('.');

                                if (prop == 'y') {
                                    complexConditionMatrixDataObj.feeConditionValue = value;
                                } else if (propNm.length != 2) {
                                    if (value.listConditionValue) {
                                      value = $.extend({}, value);
                                      var index = titleIndexMap[prop];
                                      var code = values[index];
                                      value.listConditionValue = {
                                          defineValues: [{
                                            code: code,
                                            isSelected: true,
                                          }]
                                      }
                                    }
                                    value.id = prop;
                                    // RangeConditionValue And ListConditionValue All Not Exists
                                    if (!value.rangeConditionValue && !value.listConditionValue) {
                                        dontSave = true;
                                        return;
                                    }
                                    else if (value.listConditionValue && value.listConditionValue.defineValues.length === 1
                                        && value.listConditionValue.defineValues[0].code === "") {
                                      dontSave = true;
                                      return;
                                    }
                                    complexConditionMatrixDataObj.x.push(value);
                                }
                            });

                            if (!el.y) {
                                dontSave = true;
                                return;
                            }

                            formData.complexConditionMatrix.push(complexConditionMatrixDataObj);
                          });
                        });
                    }
                }
                break;
        }
        if (dontSave) {
            PFComponent.showMessage(bxMsg('DPS0128Error4'), 'warning');
            return;
        }
    }

    formData.projectId = projectId;
    formData.tntInstId = tntInstId;
    formData.commonConditionYn = 'Y'; // 공통조건여부

    // 조건구조=복합조건 and 복합적용방법=다계층사용
    if(formData.conditionClassifyCode == '02' &&  formData.layerCalcType == '02') {

        formData.stepCndCd = stepCndCd;
    }

    PFRequest.post('/product_condition/saveProductCondition.json', formData, {
        success: function(responseData) {
            if (responseData === true) {
                PFComponent.showMessage(bxMsg('workSuccess'), 'success');

                // 조건군코드 세팅
                detailRequestParam.conditionGroupCode = detailRequestParam.conditionGroupTemplateCode + '001';
                renderConditionPage(detailRequestParam);

                if ($('.pf-config-common-tree-nav').find('.pfui-tree-item-selected').hasClass('node_disable')) {
                    $('.pf-config-common-tree-nav').find('.pfui-tree-item-selected').removeClass('node_disable');
                } else {
                    $('.pf-cc-condition-view-history-btn').prop('disabled', false);
                }
            }

            modifyFlag = false;
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdCndService',
            operation: 'savePdCnd'
        }
    });
});

onEvent('click', '.verify-btn', function(e) {
    if (!GridMinMaxCheck) {
        PFComponent.showMessage(bxMsg('DPS0126_1Error4'), 'warning');
        return;
    }
    GridMinMaxCheck = true;

    var formData = PFComponent.makeYGForm($('.pf-cc-common-condition-panel .condition-table-wrap')).getData(),
        conditionTypeCode = formData.conditionTypeCode,
        complexGridData,
        dontSave = false;

    if ($el.find('.isMandatory').prop('checked')) {
        formData.isMandatory = true;
    } else {
        formData.isMandatory = false;
    }

    if ($el.find('.returnFeeYn').prop('checked')) {
        formData.returnFeeYn = 'Y';
    } else {
        formData.returnFeeYn = 'N';
    }

    if ($el.find('.isValueNull').prop('checked')) {
        formData.isValueNull = true;
    } else {
        formData.isValueNull = false;

        // 복합조건이나 계층미정의시 에러
        if (formData.conditionClassifyCode == '02' && cndValComplexGrid.getAllData().length == 0 && formData.conditionValueAplyWayCode != '03') {
            PFComponent.showMessage(bxMsg('DPS0129Error5'), 'warning');
            return;
        }

        var titleIndexMap = titleDataArr.filter(function(v) {
          return v.titleConditionTypeCode === "01";
        }).reduce(function(m, v, i) {
          m[v.titleConditionCode] = i;
          return m;
        }, {});

        var tierNumber = 1;
        switch (conditionTypeCode) {
            // 목록형
            case '01':
                if (formData.conditionClassifyCode == '01') {
                    formData.listConditionValue = {};

                    var selectedCode = $('.cnd-val-type1-grid').find('input[name=default-check]:checked').attr('data-code'),
                        gridData = cndValueType1Grid.getAllData(),
                        selectedCheck = false;

                    gridData.forEach(function (el) {
                        if (el.isSelected) {
                            selectedCheck = true;
                        }
                    });

                    if (!selectedCheck) {
                        PFComponent.showMessage(bxMsg('DPJ0122Error1'), 'warning');
                        return;
                    }

                    formData.listConditionValue.defineValues = gridData;
                } else if (formData.conditionClassifyCode == '02') {
                    formData.complexConditionTitleInfoList = titleDataArr;

                    //layerCalcType should be 02 when conditionClassifyCode is 02
                    formData.layerCalcType = '02';

                    titleDataArr.forEach(function (el) {
                        el.titleConditionGroupTemplateCode = formData.conditionGroupTemplateCode;
                    });

                    complexGridData = cndValComplexGrid.getAllData();

                    formData.complexConditionMatrix = [];

                    complexGridData.forEach(function (el) {
                      var listCodes = Object.keys(el).reduce(function(l, key) {
                        if (key.endsWith(".code")) {
                          l.push(el[key]);
                        }
                        return l;
                      }, []);
                      nestedFor(listCodes, function(values) {
                        var complexConditionMatrixDataObj = {};
                        complexConditionMatrixDataObj.listConditionValue = el.y;
                        complexConditionMatrixDataObj.tierNumber = tierNumber++;

                        complexConditionMatrixDataObj.x = [];

                        $.each(el, function (prop, value) {
                            var propNm = prop.split('.');

                            if (prop == 'y') {
                                complexConditionMatrixDataObj.listConditionValue = value;

                                //check that condition value(last column) has one more value or not
                                if (value.defineValues) {
                                    var dontSaveList = true;

                                    value.defineValues.forEach(function (el) {
                                        if (el.isSelected) {
                                            dontSaveList = false;
                                        }
                                    });

                                    if (dontSaveList) {
                                        dontSave = true;
                                        return;
                                    }
                                }

                            } else if (propNm.length != 2) {
                                if (value.listConditionValue) {
                                  value = $.extend({}, value);
                                  var index = titleIndexMap[prop];
                                  var code = values[index];
                                  value.listConditionValue = {
                                      defineValues: [{
                                        code: code,
                                        isSelected: true,
                                      }]
                                  }
                                }
                                value.id = prop;

                                //check that each condition has value or not
                                if (!value.rangeConditionValue && !value.listConditionValue) {
                                    dontSave = true;
                                    return;
                                }
                                else if (value.listConditionValue && value.listConditionValue.defineValues.length === 1
                                    && value.listConditionValue.defineValues[0].code === "") {
                                    dontSave = true;
                                    return;
                                }
                                complexConditionMatrixDataObj.x.push(value);
                            }
                        });

                        //check that condition value(last column) has one more value or not
                        if (!el.y) {
                            dontSave = true;
                            return;
                        }

                        formData.complexConditionMatrix.push(complexConditionMatrixDataObj);
                      });
                    });
                }

                break;

            // 범위형
            case '02' :
                if (formData.conditionClassifyCode == '01') {
                    formData.rangeConditionValue = PFComponent.makeYGForm($('.cnd-value-type2 .bx-info-table')).getData();

                    if (!selectedCondition.isSingleValue) {

                    	// 계약레벨
                    	if(selectedCondition.conditionAgreeLevel == '02') {
                      		// OHS 2017.02.16 시스템최대치에 체크하여도 값이 세팅되기때문에 동일하게 처리
                    		if (!PFValidation.minMaxCheck($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check')) {
                				PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
                				return;
                    		}
                    	}
                    	// 상품레벨
                    	else {
                      		// OHS 2017.02.16 시스템최대치에 체크하여도 값이 세팅되기때문에 동일하게 처리
                    		var checkMsg = PFValidation.minMaxCheckForPfLvl($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check');
                			if (checkMsg) {
                				PFComponent.showMessage(checkMsg, 'warning');
                				return;
                			}
                    	}
                    }

                    if (selectedCondition.isSingleValue) {
                        formData.rangeConditionValue.isSingleValue = true;
                        formData.rangeConditionValue.maxValue = formData.rangeConditionValue.defalueValue;
                        formData.rangeConditionValue.increaseValue = '0.00';
                        formData.rangeConditionValue.minValue = formData.rangeConditionValue.defalueValue;
                    } else {
                        formData.rangeConditionValue.isSingleValue = false;
                    }

                    if ($el.find('.isSystemMaxValue').find('input').prop('checked')) {
                        formData.rangeConditionValue.isSystemMaxValue = true;
                    } else {
                        formData.rangeConditionValue.isSystemMaxValue = false;
                    }

                } else if (formData.conditionClassifyCode == '02') {
                    formData.complexConditionTitleInfoList = titleDataArr;
                    titleDataArr.forEach(function (el) {
                        el.titleConditionGroupTemplateCode = formData.conditionGroupTemplateCode;
                    });

                    complexGridData = cndValComplexGrid.getAllData();

                    formData.complexConditionMatrix = [];

                    complexGridData.forEach(function (el) {
                      var listCodes = Object.keys(el).reduce(function(l, key) {
                        if (key.endsWith(".code")) {
                          l.push(el[key]);
                        }
                        return l;
                      }, []);
                      nestedFor(listCodes, function(values) {
                        var complexConditionMatrixDataObj = {};
                        complexConditionMatrixDataObj.rangeConditionValue = el.y;
                        complexConditionMatrixDataObj.tierNumber = tierNumber++;

                        complexConditionMatrixDataObj.x = [];

                        $.each(el, function (prop, value) {
                            var propNm = prop.split('.');

                            if (prop == 'y') {
                                // if isSingleValue is True Then, increaseValue
                                if (selectedCondition.isSingleValue) {
                                    value.maxValue = value.defalueValue;
                                    value.increaseValue = '0.00';
                                    value.minValue = value.defalueValue;
                                }
                                complexConditionMatrixDataObj.rangeConditionValue = value;
                            } else if (propNm.length != 2) {
                                if (value.listConditionValue) {
                                  value = $.extend({}, value);
                                  var index = titleIndexMap[prop];
                                  var code = values[index];
                                  value.listConditionValue = {
                                      defineValues: [{
                                        code: code,
                                        isSelected: true,
                                      }]
                                  }
                                }
                                value.id = prop;

                                // RangeConditionValue And ListConditionValue All Not Exists
                                if (!value.rangeConditionValue && !value.listConditionValue) {
                                    dontSave = true;
                                    return;
                                }
                                else if (value.listConditionValue && value.listConditionValue.defineValues.length === 1
                                    && value.listConditionValue.defineValues[0].code === "") {
                                    dontSave = true;
                                    return;
                                }
                                complexConditionMatrixDataObj.x.push(value);
                            }
                        });

                        if (!el.y) {
                            dontSave = true;
                            return;
                        }

                        formData.complexConditionMatrix.push(complexConditionMatrixDataObj);
                      });
                    });
                }

                break;


            case '03' :
                if (formData.conditionClassifyCode == '01') {
                	if ($('.fixed-info .interest-min-check').length>0 &&
                		!PFValidation.minMaxCheck($el, '.fixed-info .interest-min-check', '.fixed-info .interest-max-check', '.fixed-info .interest-default-check')) {

                		PFComponent.showMessage(bxMsg('minMaxAmountMsg'), 'warning');
                        return;
                    }
                    if ($('.var-info .interest-min-check').length>0 &&
                    	!PFValidation.minMaxCheck($el, '.var-info .interest-min-check', '.var-info .interest-max-check', '.var-info .interest-default-check')) {

                    	PFComponent.showMessage(bxMsg('minMaxAmountMsg'), 'warning');
                        return;
                    }

                    if ($('.fixed-info .applyMinInterestRate-min-check').length>0 &&
                    	!PFValidation.minMaxCheck($el, '.fixed-info .applyMinInterestRate-min-check', '.fixed-info .applyMinInterestRate-max-check')) {

                    	PFComponent.showMessage(bxMsg('DPJ0124Error8'), 'warning');
                        return;
                    }
                    if ($('.var-info .applyMinInterestRate-min-check').length>0 &&
                    	!PFValidation.minMaxCheck($el, '.var-info .applyMinInterestRate-min-check', '.var-info .applyMinInterestRate-max-check')) {

                    	PFComponent.showMessage(bxMsg('DPJ0124Error8'), 'warning');
                        return;
                    }

                    // 금리데이터유형코드 != 01.금리값 (상품결정레벨이 상품인 경우-공통은 모두 상품레벨)
                    if($el.find('.fixed-info .InterestTypeCode').val() != '01'){
                        $el.find('.fixed-info .maxSprdRt').val($el.find('.fixed-info .minSprdRt').val());   // 스프레드율 max = min
                    }
                    if($el.find('.var-info .InterestTypeCode').val() != '01'){
                        $el.find('.var-info .maxSprdRt').val($el.find('.var-info .minSprdRt').val());   // 스프레드율 max = min
                    }

                    var defaultData = PFComponent.makeYGForm($('.cnd-value-type3 .default-condition-info')).getData();

                    // 금리적용방식코드 분기
                    // 고정적용
                    if($el.find('.ProductConditionInterestApplyTypeCode').val() == '01') {
                        var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .cnd-value-type3-fixed-info .bx-info-table')).getData();
                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
                    }
                    // 변동적용
                    else if($el.find('.ProductConditionInterestApplyTypeCode').val() == '02'){
                    	var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .cnd-value-type3-var-info .bx-info-table')).getData();
                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
                    }
                    // 고정후변동
                    else if($el.find('.ProductConditionInterestApplyTypeCode').val() == '03'){
                    	var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .cnd-value-type3-fixed-info .bx-info-table')).getData();
                    	detailInfo.varIntCndValueVO = PFComponent.makeYGForm($('.cnd-value-type3 .cnd-value-type3-var-info .bx-info-table')).getData();
                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
                    }

                    // 금리유형에 따른 분기 - 고정후 변동일때
                    if($el.find('.ProductConditionInterestApplyTypeCode').val() == '03'){

                    	/*
                    	 * 고정정보
                    	 */
                    	// 금리값
	                    if($el.find('.fixed-info .InterestTypeCode').val() == '01') {
	                        var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .fixed-info .interest-value-wrap .bx-info-table')).getData();

	                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
	                    }
	                    // 기준금리
	                    else if($el.find('.fixed-info .InterestTypeCode').val() == '02') {
	                        if(!$el.find('.fixed-info .BaseIntRtKndCode')) {
	                            // 기준금리종류 미입력
	                            dontSave = true;
	                        }
	                        if(!$el.find('.fixed-info .BaseIntRtAplyTmCode')) {
	                            // 기준금리적용시점코드 미입력
	                            dontSave = true;
	                        }
	                        if(!$el.find('.fixed-info .SprdAplyFormulaCode')) {
	                            // 스프레드적용산식 미입력
	                            dontSave = true;
	                        }

	                        var detailInfo = PFComponent.makeYGForm($('.cnd-value-type3 .fixed-info .base-interest-tpl .bx-info-table')).getData();
	                        formData.interestConditionValue = $.extend(defaultData,detailInfo);

	                    }

	                    /*
	                     * 변동정보
	                     */
                    	// 금리값
	                    if($el.find('.var-info .InterestTypeCode').val() == '01') {
	                        var varIntCndValueVO = PFComponent.makeYGForm($('.cnd-value-type3 .var-info .interest-value-wrap .bx-info-table')).getData();

	                        formData.interestConditionValue.varIntCndValueVO = $.extend(formData.interestConditionValue.varIntCndValueVO,varIntCndValueVO);
	                    }
	                    // 기준금리
	                    else if($el.find('.var-info .InterestTypeCode').val() == '02') {
	                        if(!$el.find('.var-info .BaseIntRtKndCode')) {
	                            // 기준금리종류 미입력
	                            dontSave = true;
	                        }
	                        if(!$el.find('.var-info .BaseIntRtAplyTmCode')) {
	                            // 기준금리적용시점코드 미입력
	                            dontSave = true;
	                        }
	                        if(!$el.find('.var-info .SprdAplyFormulaCode')) {
	                            // 스프레드적용산식 미입력
	                            dontSave = true;
	                        }

	                        var varIntCndValueVO = PFComponent.makeYGForm($('.cnd-value-type3 .var-info .base-interest-tpl .bx-info-table')).getData();
	                        formData.interestConditionValue.varIntCndValueVO = $.extend(formData.interestConditionValue.varIntCndValueVO,varIntCndValueVO);

	                    }
                    }else{

                    	if($el.find('.ProductConditionInterestApplyTypeCode').val() == '01'){
                    		$infoWrap = $('.fixed-info');
                    	}else if($el.find('.ProductConditionInterestApplyTypeCode').val() == '02'){
                    		$infoWrap = $('.var-info');
                    	}

	                    // 금리값
	                    if($infoWrap.find('.InterestTypeCode').val() == '01') {
	                        var detailInfo = PFComponent.makeYGForm($infoWrap.find('.interest-value-wrap .bx-info-table')).getData();

	                        formData.interestConditionValue = $.extend(defaultData,detailInfo);
	                    }
	                    // 기준금리
	                    else if($infoWrap.find('.InterestTypeCode').val() == '02') {
	                        if(!$infoWrap.find('.BaseIntRtKndCode')) {
	                            // 기준금리종류 미입력
	                            dontSave = true;
	                        }
	                        if(!$infoWrap.find('.BaseIntRtAplyTmCode')) {
	                            // 기준금리적용시점코드 미입력
	                            dontSave = true;
	                        }
	                        if(!$infoWrap.find('.SprdAplyFormulaCode')) {
	                            // 스프레드적용산식 미입력
	                            dontSave = true;
	                        }

	                        var detailInfo = PFComponent.makeYGForm($infoWrap.find('.base-interest-tpl .bx-info-table')).getData();
	                        formData.interestConditionValue = $.extend(defaultData,detailInfo);

	                    }
                    }

                } else if (formData.conditionClassifyCode == '02') {
                    formData.complexConditionTitleInfoList = titleDataArr;
                    titleDataArr.forEach(function (el) {
                        el.titleConditionGroupTemplateCode = formData.conditionGroupTemplateCode;
                    });

                    complexGridData = cndValComplexGrid.getAllData();

                    formData.complexConditionMatrix = [];

                    complexGridData.forEach(function (el) {
                      var listCodes = Object.keys(el).reduce(function(l, key) {
                        if (key.endsWith(".code")) {
                          l.push(el[key]);
                        }
                        return l;
                      }, []);
                      nestedFor(listCodes, function(values) {
                        var complexConditionMatrixDataObj = {};
                        complexConditionMatrixDataObj.interestConditionValue = el.y;
                        complexConditionMatrixDataObj.tierNumber = tierNumber++;

                        complexConditionMatrixDataObj.x = [];

                        $.each(el, function (prop, value) {
                            var propNm = prop.split('.');

                            if (prop == 'y') {
                                complexConditionMatrixDataObj.interestConditionValue = value;
                            } else if (propNm.length != 2) {
                                if (value.listConditionValue) {
                                  value = $.extend({}, value);
                                  var index = titleIndexMap[prop];
                                  var code = values[index];
                                  value.listConditionValue = {
                                      defineValues: [{
                                        code: code,
                                        isSelected: true,
                                      }]
                                  }
                                }
                                value.id = prop;
                                // RangeConditionValue And ListConditionValue All Not Exists
                                if (!value.rangeConditionValue && !value.listConditionValue) {
                                    dontSave = true;
                                    return;
                                }
                                else if (value.listConditionValue && value.listConditionValue.defineValues.length === 1
                                    && value.listConditionValue.defineValues[0].code === "") {
                                    dontSave = true;
                                    return;
                                }
                                complexConditionMatrixDataObj.x.push(value);
                            }
                        });

                        if (!el.y) {
                            dontSave = true;
                            return;
                        }

                        formData.complexConditionMatrix.push(complexConditionMatrixDataObj);
                      });
                    });
                }
                break;

            // 수수료형
            case '04' :
                if (formData.conditionClassifyCode == '01') {   // 일반조건

                    // 수수료유형
                    var radioType = $('.cnd-value-type4').find('input[name=cnd-value-04-radio]:checked');

//                    /** 최소, 최대, 기본, 증가값 검증 START */
//                    // 금액
//                    if (radioType == 'charge-radio-amount') {
//                        if (!PFValidation.minMaxCheck($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check')) {
//                            PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
//                            return;
//                        }
//                    }
//                    // 율
//                    else if (radioType == 'charge-radio-rate') {
//                        if (!PFValidation.minMaxCheck($el, '.type3-min-check', '.type3-max-check', '.type3-default-check', '.type3-increase-check')) {
//                            PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
//                            return;
//                        }
//                    }
//                    /** 최소, 최대, 기본, 증가값 검증 END */

                    // 계약레벨
                	if(selectedCondition.conditionAgreeLevel == '02') {
                		// 금액
                        if (radioType.hasClass('charge-radio-amount')) {
                            if (!PFValidation.minMaxCheck($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check')) {
                                PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
                                return;
                            }
                        }
                        // 율
                        else if (radioType.hasClass('charge-radio-rate')) {
                            if (!PFValidation.minMaxCheck($el, '.type3-min-check', '.type3-max-check', '.type3-default-check', '.type3-increase-check')) {
                                PFComponent.showMessage(bxMsg('Z_MinMaxValueError'), 'warning');
                                return;
                            }
                        }
                	}
                	// 상품레벨
                	else {
                		// 금액
                        if (radioType.hasClass('charge-radio-amount')) {
                        	var checkMsg = PFValidation.minMaxCheckForPfLvl($el, '.type2-min-check', '.type2-max-check', '.type2-default-check', '.type2-increase-check');
                          	if (checkMsg) {
                				PFComponent.showMessage(checkMsg, 'warning');
                				return;
                			}
                        }
                        // 율
                        else if (radioType.hasClass('charge-radio-rate')) {
                        	var checkMsg = PFValidation.minMaxCheckForPfLvl($el, '.type3-min-check', '.type3-max-check', '.type3-default-check', '.type3-increase-check');
                           	if (checkMsg) {
                				PFComponent.showMessage(checkMsg, 'warning');
                				return;
                			}
                        }
                	}

                    if (formData.conditionValueAplyWayCode === '03') {
                        formData.feeConditionValue = {
                            rate: '0',
                            fixed: '0',
                            bottom: '0',
                            top: '0'
                        };
                    } else {
                        //var radioType = $('.cnd-value-type4').find('input[name=cnd-value-04-radio]:checked').attr('class');
                        formData.feeConditionValue = PFComponent.makeYGForm($('.cnd-value-type4 .active')).getData();
                        // 수수료 유형코드 세팅
                        if (radioType.hasClass('charge-radio-amount')) {
                            formData.feeConditionValue.feeTpCd = '02';
                        } else if (radioType.hasClass('charge-radio-rate')) {
                            formData.feeConditionValue.feeTpCd = '01';
                        }

                        if ($el.find('.isSystemMaxValue').prop('checked')) {
                            formData.feeConditionValue.isSystemMaxValue = true;
                        } else {
                            formData.feeConditionValue.isSystemMaxValue = false;
                        }
                    }

                } else if (formData.conditionClassifyCode == '02') {
                    if (formData.conditionValueAplyWayCode === '03') {
                        formData.complexConditionTitleInfoList = null;
                        formData.complexConditionMatrix = null;
                        formData.conditionClassifyCode = '01';
                    } else {
                        formData.complexConditionTitleInfoList = titleDataArr;
                        titleDataArr.forEach(function (el) {
                            el.titleConditionGroupTemplateCode = formData.conditionGroupTemplateCode;
                        });

                        complexGridData = cndValComplexGrid.getAllData();

                        formData.complexConditionMatrix = [];

                        complexGridData.forEach(function (el) {
                          var listCodes = Object.keys(el).reduce(function(l, key) {
                            if (key.endsWith(".code")) {
                              l.push(el[key]);
                            }
                            return l;
                          }, []);
                          nestedFor(listCodes, function(values) {
                            var complexConditionMatrixDataObj = {};
                            complexConditionMatrixDataObj.feeConditionValue = el.y;
                            complexConditionMatrixDataObj.tierNumber = tierNumber++;

                            complexConditionMatrixDataObj.x = [];

                            $.each(el, function (prop, value) {
                                var propNm = prop.split('.');

                                if (prop == 'y') {
                                    complexConditionMatrixDataObj.feeConditionValue = value;
                                } else if (propNm.length != 2) {
                                    if (value.listConditionValue) {
                                      value = $.extend({}, value);
                                      var index = titleIndexMap[prop];
                                      var code = values[index];
                                      value.listConditionValue = {
                                          defineValues: [{
                                            code: code,
                                            isSelected: true,
                                          }]
                                      }
                                    }
                                    value.id = prop;
                                    // RangeConditionValue And ListConditionValue All Not Exists
                                    if (!value.rangeConditionValue && !value.listConditionValue) {
                                        dontSave = true;
                                        return;
                                    }
                                    else if (value.listConditionValue && value.listConditionValue.defineValues.length === 1
                                        && value.listConditionValue.defineValues[0].code === "") {
                                      dontSave = true;
                                      return;
                                    }
                                    complexConditionMatrixDataObj.x.push(value);
                                }
                            });

                            if (!el.y) {
                                dontSave = true;
                                return;
                            }

                            formData.complexConditionMatrix.push(complexConditionMatrixDataObj);
                          });
                        });
                    }
                }
                break;
        }
        if (dontSave) {
            PFComponent.showMessage(bxMsg('DPS0128Error4'), 'warning');
            return;
        }
    }

    formData.tntInstId = tntInstId;
    formData.commonConditionYn = 'Y'; // 공통조건여부

    // 조건구조=복합조건 and 복합적용방법=다계층사용
    if(formData.conditionClassifyCode == '02' &&  formData.layerCalcType == '02') {

        formData.stepCndCd = stepCndCd;
    }

    PFRequest.post('/product_condition/validateProductCondition.json', formData, {
        success: function(responseData) {
            if (responseData === true) {
                PFComponent.showMessage(bxMsg('noAbnormality'), 'success');
            }
        },
        // warning
        showMessageType : 'W',
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdCndService',
            operation: 'validatePdCnd'
        }
    });
});

function nestedFor(rangeList, callback, values) {
  var [range, ...rest] = rangeList;
  values = values || [];

  if (range)
    range.forEach(function(v, i) {
      nestedFor(rest, callback, values.concat([v]));
    });
  else
    callback(values);
}


function deleteArrFromObj(key, arr) {

    arr.forEach(function(el, idx){
        if (el.conditionTemplateCode === key) {
            arr.splice(idx, 1);

            return false;
        }
    })
}

onEvent('click', '.column-setting-btn', function(e) {
  renderColumnSettingPopup();
});

// simple <-> comlex condition
onEvent('change', '.ProductConditionClassifyCode', function(e) {
    var value = $(e.currentTarget).val(),
        complexGridWrap = $el.find('.complex-grid-wrap'),
        $conditionValueWrap = $el.find('.condition-value'),
        conditionTypeCode = selectedCondition.conditionTypeCode;

    // Simple Condition
    if (value === '01') {
        complexGridWrap.removeClass('active');
        $conditionValueWrap.addClass('active');

        $el.find('.conditionClassifyCode01-disabled').prop('disabled', true).val('');

        if (selectedCondition.conditionClassifyCode != '01') { //if original data was not simple condition

            switch (conditionTypeCode) {
                case '01':
                    renderCndValueType1Grid(selectedCondition.defineValues);
                    break;
                case '02' :
                    $conditionValueWrap.html(cndValueType2Tpl());

                    renderComboBox('CurrencyCode', $('.CurrencyCode'));
                    $conditionValueWrap.find('input[type=text]').val('0.00');

                    if (selectedCondition.conditionDetailTypeCode == '05') {
                        $conditionValueWrap.find('.isSystemMaxValue').prop('disabled', true);
                        renderComboBox('ProductMeasurementUnitCodeR', $('.ProductMeasurementUnitCode'));
                    }
                    // 02.날짜
                    else if(selectedCondition.conditionDetailTypeCode == '02'){
                        renderComboBox('ProductMeasurementUnitCodeD', $('.ProductMeasurementUnitCode'));
                    }
                    // 03.주기
                    else if(selectedCondition.conditionDetailTypeCode == '03'){
                        renderComboBox('ProductMeasurementUnitCodeF', $('.ProductMeasurementUnitCode'));
                    }
                    // 04.숫자
                    else if(selectedCondition.conditionDetailTypeCode == '04'){
                        renderComboBox('ProductMeasurementUnitCodeN', $('.ProductMeasurementUnitCode'));
                    }else {
                        renderComboBox('ProductMeasurementUnitCode', $('.ProductMeasurementUnitCode'));
                    }

                    if (selectedCondition.isSingleValue) {
                        $conditionValueWrap.find('.isSingleValue-hide').hide();
                    } else {
                        $conditionValueWrap.find('.isNotSingleValue-hide').hide();
                    }
                    // if conditionDetailTypeCode == '01' : AmountType
                    if (selectedCondition.conditionDetailTypeCode == '01') {
                        $conditionValueWrap.find('.detail-type01-hide').hide();
                    } else  {
                        $conditionValueWrap.find('.detail-except-type01-hide').hide();
                    }

                    break;
                case '03' :

                	defaultValueSetting = {
                		rateApplyWayCode : '01',
                        minInterestRate: '0.000000',
                        maxInterestRate: '0.000000',
                        rate: '0.000000'
                    };

                    $conditionValueWrap.html(cndValueType3Tpl());

                    renderComboBox('FrctnAplyWayCode', $('.FrctnAplyWayCode')); // 우수리적용방법코드
                    renderComboBox('ProductConditionInterestApplyTypeCode', $('.ProductConditionInterestApplyTypeCode')); // 금리적용방식코드
                    $conditionValueWrap.find('.ProductConditionInterestApplyTypeCode option[value="01"]').remove(); //04.타상품참조 제외
                    renderCndValueType3Tab($conditionValueWrap, {interestConditionValue : defaultValueSetting});

                    $conditionValueWrap.find('.FrctnAplyWayCode').val(''); // 우수리적용방법 default ''

                    $conditionValueWrap.find('.InterestTypeCode01-th').find('.red-notice').text('*');
                    $conditionValueWrap.find('.InterestTypeCode02-th').find('.red-notice').text('');
                    $conditionValueWrap.find('.InterestTypeCode03-th').find('.red-notice').text('');

                    $conditionValueWrap.find('.float0').val('0');
                    $conditionValueWrap.find('.float10').val('0.000000');

                    // 조건값결정레벨이 상품(01)이면
                    if(selectedCondition.conditionAgreeLevel == '01'){
                        // 스프레스율 1개만 입력
                        $conditionValueWrap.find('.maxSprdRt').hide();
                    }else{
                        $conditionValueWrap.find('.maxSprdRt').show();
                    }

                    break;
                case '04' :
                    $conditionValueWrap.html(cndValueType4Tpl());

                    // 측정단위 세팅
                    renderComboBox('ProductMeasurementUnitCodeR', $('.RtMsurUnitCd'), selectedCondition.rtMsurUnitCd ? selectedCondition.rtMsurUnitCd : '');
                    $el.find('.condition-type4-table-wrap').find('.TierAplyCalcnWayCodeCode01-disabled').prop('disabled', true).val('');
                    $conditionValueWrap.find('.float10').val('0.000000');
                    $conditionValueWrap.find('.float21').val('0.00');
                    $conditionValueWrap.find('.cnd-value-04-amount-table').addClass('active');
                    break;
            }
        } else { //In case original data was simple data. This is for reset for complex grid.
            titleDataArr = [];
            titleDataObj = {};
        }

        $el.find('.TierAplyCalcnWayCodeCode-th').find('.red-notice').empty();
    } else if (value === '02') {
        complexGridWrap.addClass('active');
        $conditionValueWrap.removeClass('active');

        if (selectedCondition.conditionClassifyCode != '02' && conditionTypeCode === '04' && $('.condition-type4-table-wrap').find('.ConditionValueApplyWayCodeCode').val() != '03') {
            $el.find('.conditionClassifyCode01-conditionValueAplyWayCode03-disabled').prop('disabled', false).find('option:eq(1)').prop('selected', true);
            $el.find('.layerCalcType01-conditionValueAplyWayCode03-disabled').prop('disabled', false).val('');
        } else {
            $el.find('.conditionClassifyCode01-disabled').prop('disabled', false).find('option:eq(0)').prop('selected', true);
        }

        $el.find('.TierAplyCalcnWayCodeCode-th').find('.red-notice').text('*');

        //It renders empty complex grid only if original data was not complex grid.
        if (selectedCondition.conditionClassifyCode != '02') {
            renderComplexGrid([], []);
        }
    }
});

onEvent('click', '.isValueNull', function(e) {
    var $conditionInfoWrap = $el.find('.pf-cc-condition-info'),
        defaultValueSetting;

    if($(e.currentTarget).prop('checked')) {
        $conditionInfoWrap.find('.isMandatory').prop('disabled', true).prop('checked', false);
        $conditionInfoWrap.find('.ProductConditionClassifyCode').prop('disabled', true).val('01');
        $conditionInfoWrap.find('.condition-value-wrap').removeClass('active');
        $conditionInfoWrap.find('.isValueNull-hidden').addClass('active');
        $conditionInfoWrap.find('.ConditionValueApplyWayCodeCode').prop('disabled', true).val(''); // 조건값적용방법

    } else {
        $conditionInfoWrap.find('.isMandatory').prop('disabled', false);
        $conditionInfoWrap.find('.condition-value-wrap').addClass('active');
        $conditionInfoWrap.find('.isValueNull-hidden').removeClass('active');
        $conditionInfoWrap.find('.condition-value').addClass('active');
        $conditionInfoWrap.find('.complex-grid-wrap').removeClass('active');
        $conditionInfoWrap.find('.ConditionValueApplyWayCodeCode').prop('disabled', false); // 조건값적용방법

        if (selectedCondition.isEnableComplexCondition) {
            $conditionInfoWrap.find('.isEnableComplexCondition-disabled').prop('disabled', false);
        }

        if (selectedCondition.conditionAgreeLevel != '02') {
            $conditionInfoWrap.find('.isMandatory').prop('disabled', true);
        }

        switch (selectedCondition.conditionTypeCode) {
            case '01' :

                if (selectedCondition.conditionClassifyCode != '01') {
                    !cndValueType1Grid && renderCndValueType1Grid(selectedCondition.defineValues);
                } else {
                    !cndValueType1Grid && renderCndValueType1Grid(selectedCondition.listConditionValue.defineValues);
                }

                //심플에서 복합 조건으로 변경할 경우, 복합 그리드의 조건값 필드를 더블클릭 할 때 필요한 정보를 저장해 둠
                YforNewColumn = selectedCondition.listConditionValue;
                break;
            case '02' :
                defaultValueSetting = {
                    minValue: '0.00',
                    maxValue: '0.00',
                    defalueValue: '0.00',
                    increaseValue: '0.00'
                };

            	// OHS 20180417 추가 - 소숫점일치를 위해 추가
            	// 금액
            	if(selectedCondition.conditionDetailTypeCode == '01') {
            		defaultValueSetting.defalueValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.defalueValue, 19, 2, true);
            		defaultValueSetting.minValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.minValue, 19, 2, true);
            		defaultValueSetting.maxValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.maxValue, 19, 2, true);
            		defaultValueSetting.defalueValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.defalueValue, 19, 2, true);
            	}
            	// 율
            	else if(selectedCondition.conditionDetailTypeCode == '05' || selectedCondition.conditionDetailTypeCode == '08') {
            		defaultValueSetting.defalueValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.defalueValue, 3, 6, true);
            		defaultValueSetting.minValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.minValue, 3, 6, true);
            		defaultValueSetting.maxValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.maxValue, 3, 6, true);
            		defaultValueSetting.defalueValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.defalueValue, 3, 6, true);
            	}
            	else {
            		defaultValueSetting.defalueValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.defalueValue, 8, 0, true);
            		defaultValueSetting.minValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.minValue, 8, 0, true);
            		defaultValueSetting.maxValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.maxValue, 8, 0, true);
            		defaultValueSetting.defalueValue = PFValidation.gridFloatCheckRenderer(defaultValueSetting.defalueValue, 8, 0, true);
            	}
                
                $conditionInfoWrap.find('.condition-value').html(cndValueType2Tpl(defaultValueSetting));

                if (selectedCondition.isSingleValue) {
                    $conditionInfoWrap.find('.isSingleValue-hide').hide();
                } else {
                    $conditionInfoWrap.find('.isNotSingleValue-hide').hide();
                }

                //conditionDetailTypeCode이 01이면 통화코드, 그외는 측정단위(05만 측정단위의 콤보가 달라짐)
                if (selectedCondition.conditionDetailTypeCode == '01') {
                    $conditionInfoWrap.find('.detail-type01-hide').hide();
                    renderComboBox('CurrencyCode', $('.CurrencyCode:visible'));
                } else {
                    $conditionInfoWrap.find('.detail-except-type01-hide').hide();

                    //05일 때 최대치 선택 못하게 하며 측정단위도 달라여쟈함
                    if (selectedCondition.conditionDetailTypeCode == '05') {
                        // isSystemMaxValue Control
                        $conditionInfoWrap.find('.isSystemMaxValue').prop('checked', false).prop('disabled', true);
                        renderComboBox('ProductMeasurementUnitCodeR', $('.ProductMeasurementUnitCode:visible'));
                    }
                    // 02.날짜
                    else if(selectedCondition.conditionDetailTypeCode == '02'){
                        renderComboBox('ProductMeasurementUnitCodeD', $('.ProductMeasurementUnitCode:visible'));
                    }
                    // 03.주기
                    else if(selectedCondition.conditionDetailTypeCode == '03'){
                        renderComboBox('ProductMeasurementUnitCodeF', $('.ProductMeasurementUnitCode:visible'));
                    }
                    // 04.숫자
                    else if(selectedCondition.conditionDetailTypeCode == '04'){
                        renderComboBox('ProductMeasurementUnitCodeN', $('.ProductMeasurementUnitCode:visible'));
                    }else {
                        renderComboBox('ProductMeasurementUnitCode', $('.ProductMeasurementUnitCode:visible'));
                    }
                }

                //  입력포멧 설정
                setRangeFormat($conditionInfoWrap.find('.cnd-value-type2-table'), selectedCondition.conditionDetailTypeCode);

                // OHS 20180417 추가 - default value를 입력하고 각 입력항목별로 맞춰진 소숫점처리대로 보이기위해 일괄 blur 처리
                $conditionInfoWrap.find('.condition-value').find('input').trigger('blur');
                break;
            case '03' :
                defaultValueSetting = {
            		rateApplyWayCode : '01',
                    minInterestRate: '0.000000',
                    maxInterestRate: '0.000000',
                    rate: '0.000000'
                };

                $conditionInfoWrap.find('.condition-value').html(cndValueType3Tpl(defaultValueSetting));
                var $cndValueType3Wrap = $conditionInfoWrap.find('.cnd-value-type3');
                renderCndValueType3Tab($cndValueType3Wrap, {interestConditionValue : defaultValueSetting});

                renderComboBox('FrctnAplyWayCode', $('.FrctnAplyWayCode'),'', true); // 우수리적용방법코드

                // 공통에서는 타상품참조 제외
                renderComboBox('ProductConditionInterestApplyTypeCode', $('.ProductConditionInterestApplyTypeCode')); // 금리적용방식코드
                $cndValueType3Wrap.find('.ProductConditionInterestApplyTypeCode option[value="04"]').remove(); //04.타상품참조 제외

                renderComboBox('ConditionValueApplyWayCodeCode', $('.ConditionValueApplyWayCodeCode'), '');

                // 우대금리적용시점코드 (01:신규일, 02:만기일)
                if(selectedCondition.conditionDetailTypeCode == '11'){   // 우대금리인 경우
                    renderComboBox('PreferentialInterestRateApplyBaseDayCode', $('.prfIntRtAplyTmCd'), '01');
                }else { // 우대금리가 아닌경우
                    $('.prfIntRt-hidden').addClass('active');   // 숨김
                    renderComboBox('PreferentialInterestRateApplyBaseDayCode', $('.prfIntRtAplyTmCd'), '');
                }

                $cndValueType3Wrap.find('.InterestTypeCode-01-enable').prop('disabled', false);

                $cndValueType3Wrap.find('.InterestTypeCode01-th').find('.red-notice').text('*');
                $cndValueType3Wrap.find('.InterestTypeCode02-th').find('.red-notice').text('');
                $cndValueType3Wrap.find('.InterestTypeCode03-th').find('.red-notice').text('');

                $cndValueType3Wrap.find('.float0').val('0');
                $cndValueType3Wrap.find('.float10').val('0.000000');

                // 우수리적용자릿수 default 세팅
                $cndValueType3Wrap.find('.FrctnAplyWayCode').val('');

                // 금리적용방식/금리데이터유형에 따른 화면 컨트롤
                setInterestCombobox({interestConditionValue:{type:$cndValueType3Wrap.find('.InterestTypeCode').val()}}, $cndValueType3Wrap);

                // 조건값결정레벨이 상품(01)이면
                if(selectedCondition.conditionAgreeLevel == '01'){
                    // 스프레스율 1개만 입력
                    $cndValueType3Wrap.find('.maxSprdRt').hide();
                }else{
                    $cndValueType3Wrap.find('.maxSprdRt').show();
                }

                // 금리데이터유형에 따른 화면 컨트롤 (renderCndValueType3Tab에서 이미 하고 있음)
                //setInterestSegmentTypeCombobox($cndValueType3Wrap);

                break;
            case '04' :
                defaultValueSetting = {
                    rate: '0.000000',
                    fixed: '0.00',
                    bottom: '0.00',
                    top: '0.00'
                };

                renderComboBox('CurrencyCode', $('.CurrencyCode'), selectedCondition.currencyValue);
                renderComboBox('FeeSettleTypeCode', $('.FeeSettleTypeCode'), selectedCondition.settleType, true);
                renderComboBox('LevyFrqDscd', $('.LevyFrqDscd'), selectedCondition.levyFrqDscd);    // 징수주기추가.
                renderComboBox('ConditionValueApplyWayCodeCode', $('.ConditionValueApplyWayCodeCode'), '', true);

                $conditionInfoWrap.find('.condition-value').html(cndValueType4Tpl(defaultValueSetting));

                // default 수수료유형 금액 선택
                var $type4Wrap = $('.cnd-value-type4');
                $type4Wrap.find('.cnd-value-04-amount-table').prop('checked', true);
                $type4Wrap.find('.cnd-value-04-amount-table').addClass('active');
                $type4Wrap.find('.cnd-value-04-rate-table').removeClass('active');

                // 기본값 세팅
                $type4Wrap.find('.float21').val('0.00');
                $type4Wrap.find('.float10').val('0.000000');

                renderComboBox('ProductMeasurementUnitCodeR', $('.RtMsurUnitCd'), selectedCondition.rtMsurUnitCd ? selectedCondition.rtMsurUnitCd : ''); // 측정단위 세팅
                renderComboBox('FeeCalculateBasicTypeCode', $('.FeeCalculateBasicTypeCode'), selectedCondition.feeConditionValue ? selectedCondition.feeConditionValue.calcBasic : '');   // 징수기준

                break;
        }

        $conditionInfoWrap.find('.conditionClassifyCode01-disabled').prop('disabled', true).val('');

        if (selectedCondition.isEnableComplexCondition) {
            $conditionInfoWrap.find('.isEnableComplexCondition-disabled').prop('disabled', false);
        }
    }

    fnSetCndAtrb();
});

//2017.02.13 OHS - product-condition.js 로직과 통일
onEvent('click', '.isSystemMaxValue', function(e) {
    if($(e.currentTarget).find('input').prop('checked')) {
        $('.cnd-value-type2').find('.maxValue').prop('disabled', true).val('9999999999999999999.999999');
    } else {
        $('.cnd-value-type2').find('.maxValue').prop('disabled', false).val('0.00');
    }
});

onEvent('click', '.isUseSameValue', function(e) {
    if($(e.currentTarget).find('input').prop('checked')) {
    	// 범위
        $('.cnd-value-type2').find('.defalueValue').val($('.cnd-value-type2').find('.minValue').val());

        // OHS 20180122 추가 - 금액/율 라디오버튼 선택에 따라서 분기하도록 함
        if($('input[name=cnd-value-04-radio]:checked').hasClass('charge-radio-amount')) {
        	$('.cnd-value-type4').find('.fixed').val($('.cnd-value-type4').find('.minFixFeeAmt').val()); // 금액
        }
        else {
        	$('.cnd-value-type4').find('.rate').val($('.cnd-value-type4').find('.minRt').val()); // 율
        }

        if(!$('.isSystemMaxValue').find('input').prop('checked')) {
            $('.cnd-value-type2').find('.maxValue').val($('.cnd-value-type2').find('.minValue').val());

            // OHS 20180122 추가 - 금액/율 라디오버튼 선택에 따라서 분기하도록 함
            if($('input[name=cnd-value-04-radio]:checked').hasClass('charge-radio-amount')) {
            	$('.cnd-value-type4').find('.maxFixFeeAmt').val($('.cnd-value-type4').find('.minFixFeeAmt').val()); // 금액
            }
            else {
            	$('.cnd-value-type4').find('.maxRt').val($('.cnd-value-type4').find('.minRt').val()); // 율
            }
        }
    }
});

onEvent('keyup.xdsoft', '.minValue', function(e) {
    if($('.isUseSameValue').find('input').prop('checked')){
        if(!$('.isSystemMaxValue').find('input').prop('checked')) {
            $('.cnd-value-type2').find('.maxValue').val($('.cnd-value-type2').find('.minValue').val());
            $('.cnd-value-type2').find('.maxValue').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
        }
        $('.cnd-value-type2').find('.defalueValue').val($('.cnd-value-type2').find('.minValue').val());
        $('.cnd-value-type2').find('.defalueValue').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
    }
});

onEvent('keyup.xdsoft', '.minFixFeeAmt', function(e) {
	// OHS 20180119 수정 - (수수료)금액 테이블영역에서 체크하도록 수정
    //if($('.isUseSameValue').find('input').prop('checked')){
	if($('.cnd-value-04-amount-table .isUseSameValue').find('input').prop('checked')){
        if(!$('.isSystemMaxValue').find('input').prop('checked')) {
            $('.cnd-value-type4').find('.maxFixFeeAmt').val($('.cnd-value-type4').find('.minFixFeeAmt').val());
            $('.cnd-value-type4').find('.maxFixFeeAmt').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
        }
        $('.cnd-value-type4').find('.fixed').val($('.cnd-value-type4').find('.minFixFeeAmt').val());
        $('.cnd-value-type4').find('.fixed').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
    }
});

onEvent('keyup.xdsoft', '.minRt', function(e) {
	// OHS 20180119 수정 - (수수료)율 테이블영역에서 체크하도록 수정
    //if($('.isUseSameValue').find('input').prop('checked')){
	if($('.cnd-value-04-rate-table .isUseSameValue').find('input').prop('checked')){
        if(!$('.isSystemMaxValue').find('input').prop('checked')) {
            $('.cnd-value-type4').find('.maxRt').val($('.cnd-value-type4').find('.minRt').val());
            $('.cnd-value-type4').find('.maxRt').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
        }
        $('.cnd-value-type4').find('.rate').val($('.cnd-value-type4').find('.minRt').val());
        $('.cnd-value-type4').find('.rate').trigger('blur'); // OHS20180321 - blur처리 소숫점을 동일하게 맞춰주기 위함
    }
});


// 조건 > 금리형 > 금리적용방식코드 변경 시
onEvent('change', '.ProductConditionInterestApplyTypeCode', function(e) {
    var $type3Wrap = $('.cnd-value-type3');

    var defaultValueSetting = {
            minInterestRate: '0.000000',
            maxInterestRate: '0.000000',
            rate: '0.000000',
            rateApplyWayCode : $(e.currentTarget).val()
        };

    renderCndValueType3Tab($type3Wrap, {interestConditionValue : defaultValueSetting});
});

//조건 > 금리형 > 금리데이터유형코드 변경 시
onEvent('change', '.fixed-info .InterestTypeCode', function(e) {
    var $type3Wrap = $('.fixed-info');

    var data = {interestConditionValue:{type:$(e.currentTarget).val()}};
    setInterestCombobox(data, $type3Wrap);
});
onEvent('change', '.var-info .InterestTypeCode', function(e) {
    var $type3Wrap = $('.var-info');
    var data = {interestConditionValue:{type:$(e.currentTarget).val()}};
    setInterestCombobox(data, $type3Wrap);
});

//조건 > 고정기간데이터유형구분코드
onEvent('change', '.fix-irt-tr .fixTrmDataTpDscd', function(e) {
	setFixTrmDataTpDscd($('.fix-irt-tr'), $(e.currentTarget).val());
});

//조건 > 기준금리데이터유형구분코드
onEvent('change', '.fixed-info .baseIntRateDataTpDscd', function(e) {
	setBaseIntRateDataTpDscd($('.fixed-info'), $(e.currentTarget).val());
});
onEvent('change', '.var-info .baseIntRateDataTpDscd', function(e) {
	setBaseIntRateDataTpDscd($('.var-info'), $(e.currentTarget).val());
});

// 조건 > 금리형 > 스프레드 적용산식 변경 시
onEvent('change', '.fixed-info .SprdAplyFormulaCode', function(e) {
    setSprdAplyFormulaCombobox($('.fixed-info'), $(e.currentTarget).val());
});
onEvent('change', '.var-info .SprdAplyFormulaCode', function(e) {
    setSprdAplyFormulaCombobox($('.var-info'), $(e.currentTarget).val());
});

// 조건 > 금리형 > 변동정보 > 변동정보적용방식 변경 시
onEvent('change', '.fixed-info .InterestSegmentTypeCode', function(e) {
    setInterestSegmentTypeCombobox($('.fixed-info'), $(e.currentTarget).val());
});
onEvent('change', '.var-info .InterestSegmentTypeCode', function(e) {
    setInterestSegmentTypeCombobox($('.var-info'), $(e.currentTarget).val());
});

onEvent('change', '.TierAplyCalcnWayCodeCode', function(e) {
    var $type4Table = $('.condition-type4-table-wrap');

    if($(e.currentTarget).val() != '02') {
        $type4Table.find('.TierAplyCalcnWayCodeCode01-disabled').prop('disabled', false).val('');
    } else  {
        $type4Table.find('.TierAplyCalcnWayCodeCode01-disabled').prop('disabled', true).val('');
    }
});

//조건값적용방법코드 변경시
onEvent('change', '.ConditionValueApplyWayCodeCode', function(e) {
    var $cndValueType3Wrap = $el.find('.cnd-value-type3');

    // 02.내부로직산출 선택시
    if($(e.currentTarget).val() == '02') {
        $el.find('.pf-cp-type3-panel .ProductConditionClassifyCode').prop('disabled', true).val('01').change();    // 조건구조: 일반조건
        $el.find('.pf-cp-type3-panel .cnd-val-apply-way').hide();
        $el.find('.pf-cp-type3-panel .additional-info-wrap').hide();
        $el.find('.pf-cp-type3-panel .cnd-value-type3-info-tab').hide();

    } else {
        $cndValueType3Wrap.find('.cnd-val-apply-way').show();
        $cndValueType3Wrap.find('.additional-info-wrap').show();
        $el.find('.pf-cp-type3-panel .ProductConditionClassifyCode').prop('disabled', false);   // 조건구조
        $cndValueType3Wrap.find('.ProductConditionInterestApplyTypeCode').val('01').change();    // 고정적용

        $el.find('.pf-cp-type3-panel .cnd-value-type3-info-tab').show();
        $cndValueType3Wrap.find('.ProductConditionInterestApplyTypeCode').val('01').change();    // 고정적용
    }
});

//변동주기참조조건코드 포커스
onEvent('focus', '.fixed-info .varFrqRefCndCd', function(e){
    PFPopup.selectConditionTemplate({}, function (data) {
        $('.fixed-info .varFrqRefCndCd').val(data.code);
        $('.fixed-info .varFrqRefCndNm').val(data.name);
    });
});
onEvent('focus', '.var-info .varFrqRefCndCd', function(e){
    PFPopup.selectConditionTemplate({}, function (data) {
        $('.var-info .varFrqRefCndCd').val(data.code);
        $('.var-info .varFrqRefCndNm').val(data.name);
    });
});

// 수수료 유형 [금액/율] 클릭 처리
onEvent('click', 'input[name=cnd-value-04-radio]', function(e) {
    var that = this,
        $type4Wrap = $('.cnd-value-type4');

    if ($(that).hasClass('charge-radio-amount')) {
        $type4Wrap.find('.cnd-value-04-amount-table').addClass('active');
        $type4Wrap.find('.cnd-value-04-rate-table').removeClass('active');
    } else if ($(that).hasClass('charge-radio-rate')) {
        $type4Wrap.find('.cnd-value-04-amount-table').removeClass('active');
        $type4Wrap.find('.cnd-value-04-rate-table').addClass('active');
    }
});

var enterFlag  = false;


onEvent('click', '.complex-condition-value-add-btn', function() {

    if (titleDataArr.length === 0)  {
        // 20150205 Message Add
        PFComponent.showMessage(bxMsg('complexHeaderSetMsg'), 'warning');
        return;
    }

    var tempObj = {},
        tempArr = [];

    $.each(titleDataObj, function(prop, val) {
        tempObj[prop] = {};
    });

    tempArr.push(tempObj);

    modifyFlag = true;
    cndValComplexGrid.addData(tempArr);
});


/**
 * 공통조건의 중간 트리
 *
 * @param param
 * @param type - (required) 조건유형
 */
function renderConditionTree(param, type, conditionDetailTypeCode) {
    $el.find('.pf-cc-info-wrap').addClass('active');

    $el.find('.pf-cc-condition-list-wrap').empty();
    $el.find('.pf-cc-condition-info').empty();

    PFUI.use('pfui/tree', function (Tree) {
        var data;

        switch (type) {
            case '01':
                data = [
                    {text: bxMsg('baseInfo'), id: '1'}          // 기본정보
                ];

                break;

            case '02':
                data = [
                    {text: bxMsg('baseInfo'), id: '5'}          // 기본정보
                ];

                break;

            case '03':  // 금리
                if(conditionDetailTypeCode == '11'){
                    data = [
                        {text: bxMsg('basicInterest'), id: '1'},    // 기본금리
                        {text: bxMsg('providedCondition'), id: '4'}    // 제공조건
                    ];
                }else{
                    data = [
                        {text: bxMsg('basicInterest'), id: '1'},    // 기본금리
                    ];
                }

                break;

            case '04':  // 수수료
                data = [
                    {text: bxMsg('DPS0121_4String3'), id: '1'}, // 기본수수료
                    {text: bxMsg('DPS0126String2'), id: '2'}    // 할인조건
                    //{text: bxMsg('MTM0300String17'), id: '3'}
                ];

                break;
        }

        if(data.length == 1){
            $el.find('.pf-cc-condition-list-wrap').css('width', 0);
            $el.find('.pf-cc-condition-info-wrap').css('left', 0);
            $el.find('.pf-conts').css('width', 830);
        }else{
            $el.find('.pf-cc-condition-list-wrap').css('width', 170);
            $el.find('.pf-cc-condition-info-wrap').css('left', 170);
            $el.find('.pf-conts').css('width', 1000);
        }

        var tree = new Tree.TreeList({
            itemTpl : '<li class="{custom}">{text}</li>',
            render: '.pf-cc-condition-list-wrap',
            elCls: 'pf-cc-condition-list',
            nodes: data
        });

        tree.render();

        tree.setSelected(tree.getItems()[0]);
        renderCondition(tree.getItems()[0]);

        tree.on('itemdblclick', function (ev) {
            renderCondition(ev.item);
        });


        // 공통조건의 중간 트리 더블클릭
        function renderCondition(item) {
            if (item.leaf) {
                switch (item.id) {

                    case '1' :  // 기본금리, 기본수수료
                        if (!modifyFlag) {
                            renderConditionPage(param);

                        } else {
                            PFComponent.showConfirm(bxMsg('warningDontSaved'), function () {
                                renderConditionPage(param);
                                modifyFlag = false;
                            }, function () {
                                return;
                            });
                        }
                        break;

                    case '2' :  // 수수료 할인조건
                        if (!modifyFlag) {
                        	// OHS 2017.04.04 - 수수료 신규저장후 할인조건을 클릭했을때 버튼 disabled처리를 위해 세팅
                        	if($('.conditionGroupCode').val()) {
                        		param.conditionGroupCode = $('.conditionGroupCode').val();
                        	}
                            renderConditionType4_2GridPage(param);

                        } else {
                            PFComponent.showConfirm(bxMsg('warningDontSaved'), function () {
                                renderConditionType4_2GridPage(param);
                                modifyFlag = false;
                            }, function () {
                                return;
                            });
                        }
                        break;

                    //case '3':
                    //    renderDiscountRulePage(param);
                    //    break;

                    case '4' : // 우대금리 제공조건
                        if (!modifyFlag) {
                            renderConditionType3_2GridPage(param);

                        } else {
                            PFComponent.showConfirm(bxMsg('warningDontSaved'), function () {
                                renderConditionType3_2GridPage(param);
                                modifyFlag = false;
                            }, function () {
                                return;
                            });
                        }
                        break;

                    case '5' : // 범위형 기본정보
                        if (!modifyFlag) {
                            renderConditionPage(param);

                        } else {
                            PFComponent.showConfirm(bxMsg('warningDontSaved'), function () {
                                renderConditionPage(param);
                                modifyFlag = false;
                            }, function () {
                                return;
                            });
                        }
                        break;
                }
            }
        }
    });
}

/**********************************************************************************************************************
 * render function
 **********************************************************************************************************************/


function renderConditionPage(detailRequestParam, subMenuId) {
    // 공통조건여부 무조건 세팅
    detailRequestParam.commonConditionYn = 'Y';

    var $conditionInfoWrap = $el.find('.pf-cc-condition-info');

    //reset title obj, arr of complex grid
    titleDataObj = {};
    titleDataArr = [];
    cndValueType1Grid = null;

    var tplMap = {
        '01': conditionType1Tpl,
        '02': conditionType2Tpl,
        '03': conditionType3Tpl,
        '04': conditionType4Tpl
    };

    PFRequest.get('/product_condition/getProductConditionDetail.json', detailRequestParam, {
        success: function(data) {

            // ProjectId 세팅
            if(data.projectBaseVO) {
                setTaskRibbonInput(data.projectBaseVO.projectId, data.projectBaseVO.name);
            }
            selectedCondition = data;

            data.conditionTypeCodeNm = codeMapObj['ProductConditionTypeCode'][data.conditionTypeCode];
            data.statusNm = codeMapObj['ProductStatusCode'][data.status];

            $conditionInfoWrap.html(tplMap[data.conditionTypeCode](data));

            if(writeYn != 'Y' || detailRequestParam.writeYn == 'N'){
                $('.write-btn').hide();
            }

            // 조건값결정레벨이 '02.계약'이 아니면 필수협상조건 체크박스 disable
            if (data.conditionAgreeLevel != '02') {
                $conditionInfoWrap.find('.isMandatory').prop('disabled', true);
            }

            // 환출대상여부 체크박스
            if(data.returnFeeYn == 'Y'){
            	$conditionInfoWrap.find('.returnFeeYn').prop('checked', true);
            }

            //4개의 타입에 모두 들어가는 공통 콤보박스
            renderComboBox('ProductConditionAgreeLevelCode', $('.ProductConditionAgreeLevelCode'), data.conditionAgreeLevel);
            renderComboBox('ProductConditionClassifyCode', $('.ProductConditionClassifyCode'), data.conditionClassifyCode);
            renderComboBox('TierAplyCalcnWayCodeCode', $('.TierAplyCalcnWayCodeCode'), data.layerCalcType);

            var intRtAplyBaseDayCd = data.intRtAplyBaseDayCd ? data.intRtAplyBaseDayCd : (data.conditionAgreeLevel=='01'? '03' : '01');
            renderComboBox('IntRtAplyBaseDayCode', $('.intRtAplyBaseDayCd'), intRtAplyBaseDayCd);

            // 자상품사용가능여부 체크박스
            $conditionInfoWrap.find('.childYn-check').prop('checked', data.isChildPdUsable);

            // 조건군코드 없을경우 이력조회 버튼 disabled
            if(!data.conditionGroupCode) {
                $conditionInfoWrap.find('.pf-cc-condition-view-history-btn').prop('disabled', true);
            } else {
                $conditionInfoWrap.find('.pf-cc-condition-view-history-btn').prop('disabled', false);
            }

            if (data.isValueNull) {
                $conditionInfoWrap.find('.isValueNull').prop('checked', true);
                $conditionInfoWrap.find('.isMandatory').prop('disabled', true);
                $conditionInfoWrap.find('.isValueNull-hidden').addClass('active');
                $conditionInfoWrap.find('.condition-value-wrap').removeClass('active');
                $conditionInfoWrap.find('.isEnableComplexCondition-disabled').prop('disabled', true).val('01');
                $conditionInfoWrap.find('.conditionClassifyCode01-disabled').prop('disabled', true).val('');
                $('.pf-config-common-tree-nav').find('.pfui-tree-item-selected').addClass('node_disable');	// 조건트리 조건값 없음 처리

            } else {
            	$('.pf-config-common-tree-nav').find('.pfui-tree-item-selected').removeClass('node_disable');	// 조거트리 조건값 있음 처리

                if (data.isMandatory) {
                    $conditionInfoWrap.find('.isMandatory').prop('checked', true);
                }

                // 우대금리적용시점코드 (01:신규일, 02:만기일)
                if(data.conditionDetailTypeCode == '11'){   // 우대금리인 경우
                    //제공조건 조건적용대상구분코드 우대금리로 설정
                    conditionApplyTargetDscd = '01';
                    renderComboBox('PreferentialInterestRateApplyBaseDayCode', $('.prfIntRtAplyTmCd'), data.prfIntRtAplyTmCd ? data.prfIntRtAplyTmCd : '01');
                }else {// 우대금리가 아닌경우
                    $('.prfIntRt-hidden').addClass('active');   // 숨김
                    renderComboBox('PreferentialInterestRateApplyBaseDayCode', $('.prfIntRtAplyTmCd'), data.prfIntRtAplyTmCd ? data.prfIntRtAplyTmCd : '');
                }

                //화면에 있는 필드는 아니지만 isEnableComplexCondition에 의해 심플/복합 콤보박스를 disabled or not 해야함
                if (!data.isEnableComplexCondition && data.conditionClassifyCode != '02') {
                    $conditionInfoWrap.find('.isEnableComplexCondition-disabled').prop('disabled', true);
                }

                renderComboBox('IntRtAplyBaseDayCode', $('.intRtAplyBaseDayCd'), data.intRtAplyBaseDayCd ? data.intRtAplyBaseDayCd:'');

                //심플조건일 때
                if (data.conditionClassifyCode == '01') {
                    $conditionInfoWrap.find('.condition-value').addClass('active');

                    // 03: 금리형 04: 수수료형
                    switch (data.conditionTypeCode) {

                        case '01' :
                            renderCndValueType1Grid(data.listConditionValue.defineValues);

                            //심플에서 복합 조건으로 변경할 경우, 복합 그리드의 조건값 필드를 더블클릭 할 때 필요한 정보를 저장해 둠
                            YforNewColumn = data.listConditionValue;
                            break;

                        case '02' :
                            if (data.rangeConditionValue) {
                            	/**
                                data.rangeConditionValue.minValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.minValue, 19, 2);
                                data.rangeConditionValue.maxValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.maxValue, 19, 2);
                                data.rangeConditionValue.increaseValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.increaseValue, 19, 2);
                                data.rangeConditionValue.defalueValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.defalueValue, 19, 2);
                                */
                            	
                             	// OHS 20180503 추가 - 소숫점일치를 위해 추가
                            	// 금액
                            	if(data.conditionDetailTypeCode == '01') {
                                    data.rangeConditionValue.minValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.minValue, 19, 2);
                                    data.rangeConditionValue.maxValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.maxValue, 19, 2);
                                    data.rangeConditionValue.increaseValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.increaseValue, 19, 2);
                                    data.rangeConditionValue.defalueValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.defalueValue, 19, 2);
                            	}
                            	// 율
                            	else if(data.conditionDetailTypeCode == '05' || data.conditionDetailTypeCode == '08') {
                                    data.rangeConditionValue.minValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.minValue, 3, 6);
                                    data.rangeConditionValue.maxValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.maxValue, 3, 6);
                                    data.rangeConditionValue.increaseValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.increaseValue, 3, 6);
                                    data.rangeConditionValue.defalueValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.defalueValue, 3, 6);
                            	}
                            	else {
                                    data.rangeConditionValue.minValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.minValue, 8, 0);
                                    data.rangeConditionValue.maxValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.maxValue, 8, 0);
                                    data.rangeConditionValue.increaseValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.increaseValue, 8, 0);
                                    data.rangeConditionValue.defalueValue = PFValidation.gridFloatCheckRenderer(data.rangeConditionValue.defalueValue, 8, 0);
                            	}
                            }

                            $conditionInfoWrap.find('.condition-value').html(cndValueType2Tpl(data.rangeConditionValue));

                            if (data.rangeConditionValue.isSystemMaxValue == true) {
                            	// 2017.02.15 OHS 수정 - 시스템최대치가 true이면 기존값을 없애고 disabled처리에서 값을 세팅해줌.
                                //$conditionInfoWrap.find('.maxValue').prop('disabled', true).val('');
                                $conditionInfoWrap.find('.maxValue').prop('disabled', true);
                                $conditionInfoWrap.find('.isSystemMaxValue').find('input').prop('checked', true);
                            }

                            //단일 값이면 기본값만 보여줘야 함
                            if (data.rangeConditionValue.isSingleValue) {
                                $conditionInfoWrap.find('.isSingleValue-hide').hide();
                            } else {
                                $conditionInfoWrap.find('.isNotSingleValue-hide').hide();
                            }

                            //conditionDetailTypeCode이 01이면 통화코드, 그외는 측정단위(05만 측정단위의 콤보가 달라짐)
                            if (data.conditionDetailTypeCode == '01') {
                                $conditionInfoWrap.find('.detail-type01-hide').hide();
                                renderComboBox('CurrencyCode', $('.CurrencyCode:visible'), data.rangeConditionValue.currencyValue);
                            } else {
                                $conditionInfoWrap.find('.detail-except-type01-hide').hide();

                                //05일 때 최대치 선택 못하게 하며 측정단위도 달라여쟈함
                                if (data.conditionDetailTypeCode == '05') {
                                    // isSystemMaxValue Control
                                    $conditionInfoWrap.find('input').find('.isSystemMaxValue').prop('checked', false).prop('disabled', true);
                                    renderComboBox('ProductMeasurementUnitCodeR', $('.ProductMeasurementUnitCode:visible'), data.rangeConditionValue.productMeasurementUnit);
                                }
                                // 02.날짜
                                else if(selectedCondition.conditionDetailTypeCode == '02'){
                                    renderComboBox('ProductMeasurementUnitCodeD', $('.ProductMeasurementUnitCode:visible'), data.rangeConditionValue.productMeasurementUnit);
                                }
                                // 03.주기
                                else if(selectedCondition.conditionDetailTypeCode == '03'){
                                    renderComboBox('ProductMeasurementUnitCodeF', $('.ProductMeasurementUnitCode:visible'), data.rangeConditionValue.productMeasurementUnit);
                                }
                                // 04.숫자
                                else if(selectedCondition.conditionDetailTypeCode == '04'){
                                    renderComboBox('ProductMeasurementUnitCodeN', $('.ProductMeasurementUnitCode:visible'), data.rangeConditionValue.productMeasurementUnit);
                                } else {
                                    renderComboBox('ProductMeasurementUnitCode', $('.ProductMeasurementUnitCode:visible'), data.rangeConditionValue.productMeasurementUnit);
                                }
                            }

                            // conditionDetailTypeCode이 01, 04, 05 일때 음수 허용
                            if(data.conditionDetailTypeCode == '01' ||
                                data.conditionDetailTypeCode == '04' ||
                                data.conditionDetailTypeCode == '05'){
                                $conditionInfoWrap.find('.minValue').addClass('float-range-21');
                                $conditionInfoWrap.find('.maxValue').addClass('float-range-21');

                                $conditionInfoWrap.find('.minValue').removeClass('float21');
                                $conditionInfoWrap.find('.maxValue').removeClass('float21');
                            }else{
                                $conditionInfoWrap.find('.minValue').addClass('float21');
                                $conditionInfoWrap.find('.maxValue').addClass('float21');

                                $conditionInfoWrap.find('.minValue').removeClass('float-range-21');
                                $conditionInfoWrap.find('.maxValue').removeClass('float-range-21');
                            }
                            break;

                        case '03' :
                            $('.frctnAplyCnt').val(data.interestConditionValue.frctnAplyCnt);
                            if (data.interestConditionValue) {
                                data.interestConditionValue.minInterestRate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.minInterestRate, 3, 6);
                                data.interestConditionValue.maxInterestRate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.maxInterestRate, 3, 6);
                                data.interestConditionValue.applyMinInterestRate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.applyMinInterestRate, 3, 6);
                                data.interestConditionValue.applyMaxInterestRate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.applyMaxInterestRate, 3, 6);
                                data.interestConditionValue.rate = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.rate, 3, 6);
                                data.interestConditionValue.minSprdRt = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.minSprdRt, 3, 6); // 스프레드율 최소
                                data.interestConditionValue.maxSprdRt = PFValidation.gridFloatCheckRenderer(data.interestConditionValue.maxSprdRt, 3, 6); // 스프레드율 최대
                            }
                            $conditionInfoWrap.find('.condition-value').html(cndValueType3Tpl(data.interestConditionValue));

                            renderComboBox('FrctnAplyWayCode', $('.FrctnAplyWayCode'), data.interestConditionValue.frctnAplyWayCd, true); // 우수리적용방법코드

                            renderComboBox('ProductConditionInterestApplyTypeCode', $('.ProductConditionInterestApplyTypeCode'), (data.interestConditionValue.rateApplyWayCode) ? data.interestConditionValue.rateApplyWayCode : '01'); // 금리적용방식코드
                            $conditionInfoWrap.find('.ProductConditionInterestApplyTypeCode option[value="04"]').remove(); //04.타상품참조제외

                            var $cndValueType3Wrap = $conditionInfoWrap.find('.cnd-value-type3');
                            renderCndValueType3Tab($conditionInfoWrap, data);

                            // 우수리적용방법 별도 처리 ( 빈값일경우 '' 세팅 )
                            if(!data.interestConditionValue.frctnAplyWayCd) {
                                $cndValueType3Wrap.find('.FrctnAplyWayCode').val('');
                            }

                            // 조건값결정레벨이 상품(01)이면
                            if(selectedCondition.conditionAgreeLevel == '01'){
                                // 스프레스율 1개만 입력
                                $cndValueType3Wrap.find('.maxSprdRt').hide();
                            }else{
                                $cndValueType3Wrap.find('.maxSprdRt').show();
                            }

                            if(detailRequestParam.applyMethod && detailRequestParam.applyMethod == '02'){
                                $conditionInfoWrap.find('.pf-cp-type3-panel .pf-panel-body *').prop('disabled', true);
                            }

                            // 조건값적용방법코드 -> 코드 바인딩은 복합인 경우에도 되어야 함. 아래 공통부분에서 바인딩
                            //renderComboBox('ConditionValueApplyWayCodeCode', $('.ConditionValueApplyWayCodeCode'), data.conditionValueAplyWayCode);   // 조건값적용방법코드
                            if (data.conditionValueAplyWayCode == '02') {
	                            $el.find('.pf-cp-type3-panel .ProductConditionClassifyCode').prop('disabled', true).val('01').change();    // 조건구조: 일반조건
	                            $el.find('.pf-cp-type3-panel .cndValApplyWayCode-hidden').hide();    // 자상품사용가능여부
	                            $el.find('.pf-cp-type3-panel .cnd-val-apply-way').hide();
	                            $el.find('.pf-cp-type3-panel .additional-info-wrap').hide();
	                            $el.find('.pf-cp-type3-panel .cnd-value-type3-info-tab').hide();
                            }


                            break;
                        case '04' :

                            if (data.feeConditionValue) {
                                // 금액정보 19, 2
                                // 징수수수료 정보
                                // 최소금액
                                data.feeConditionValue.bottom = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.bottom, 19, 2);
                                // 최대금액
                                data.feeConditionValue.top = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.top, 19, 2);

                                // 금액정보
                                // 최소수수료
                                data.feeConditionValue.minFixFeeAmt = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.minFixFeeAmt, 19, 2);
                                // 최대수수료
                                data.feeConditionValue.maxFixFeeAmt = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.maxFixFeeAmt, 19, 2);
                                // 기본수수료
                                data.feeConditionValue.fixed = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.fixed, 19, 2);
                                // 증가단위금액
                                data.feeConditionValue.fixFeeIncrsAmt = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.fixFeeIncrsAmt, 19, 2);


                                // 율 정보 4,6
                                // 최소
                                data.feeConditionValue.minRt = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.minRt, 3, 6);
                                // 최대
                                data.feeConditionValue.maxRt = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.maxRt, 3, 6);
                                // 기본
                                data.feeConditionValue.rate = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.rate, 3, 6);
                                // 단위증가
                                data.feeConditionValue.unitIncrsRt = PFValidation.gridFloatCheckRenderer(data.feeConditionValue.unitIncrsRt, 3, 6);
                            }

                            $conditionInfoWrap.find('.condition-value').html(cndValueType4Tpl(data.feeConditionValue));
                            $conditionInfoWrap.find('.condition-value').find('.cnd-value-04-amount-table').addClass('active');

                            if (data.feeConditionValue.isSystemMaxValue == true) {
                             	// OHS 2017.02.16 수정 - 시스템최대치 값세팅
                                //$conditionInfoWrap.find('.topValue').prop('disabled', true).val('');
                            	$conditionInfoWrap.find('.topValue').prop('disabled', true);
                                $conditionInfoWrap.find('.isSystemMaxValue').prop('checked', true);
                            }

                            renderComboBox('ProductMeasurementUnitCodeR', $('.RtMsurUnitCd'), data.feeConditionValue.rtMsurUnitCd ? data.feeConditionValue.rtMsurUnitCd : '');

                            // 율정보 체크
                            if (data.feeConditionValue.feeTpCd == '01') {
                                $conditionInfoWrap.find('.charge-radio-rate').prop('checked', true);
                                $conditionInfoWrap.find('.cnd-value-04-amount-table').removeClass('active');
                                $conditionInfoWrap.find('.cnd-value-04-rate-table').addClass('active');
                            }
                            // 금액정보 체크
                            else {
                                $conditionInfoWrap.find('.charge-radio-amount').prop('checked', true);
                                $conditionInfoWrap.find('.cnd-value-04-amount-table').addClass('active');
                                $conditionInfoWrap.find('.cnd-value-04-rate-table').removeClass('active');
                            }
                            break;
                    }

                    $conditionInfoWrap.find('.conditionClassifyCode01-disabled').prop('disabled', true).val('');

                // 복합조건일 때
                } else if (data.conditionClassifyCode == '02') {
                    $el.find('.complex-grid-wrap').addClass('active');

                    stepCndCd = data.stepConditionCode;

                    renderComplexGrid(data.complexConditionTitleInfoList, data.complexConditionMatrix);
                    $conditionInfoWrap.find('.TierAplyCalcnWayCodeCode-th').find('.red-notice').text('*');
                }

                // 금리형
                if (data.conditionTypeCode == '03') {
                    renderComboBox('IntTermCalculateTpyeCode', $('.IntTermCalculateTpyeCode'), data.termCalcType);
                    renderComboBox('IntDailyRateYearCoefficientCode', $('.IntDailyRateYearCoefficientCode'), data.dayRateYearlyCoefficient);
                    renderComboBox('InterestMethodCode', $('.InterestMethodCode'), data.calcInterestMethod);
                    renderComboBox('ConditionValueApplyWayCodeCode', $('.ConditionValueApplyWayCodeCode'), data.conditionValueAplyWayCode);   // 조건값적용방법코드

                    // 조건값적용방법코드에 따른 설정 -> 위 심플일때 금리형에서 처리
                    //if (data.conditionValueAplyWayCode === '02') { //조건값적용방법코드가 02이면, 아래 3줄 disbled
                        // $conditionInfoWrap.find('.calcBasic-conditionValueAplyWayCode03-disabled').prop('disabled', true).val('');
                        // $conditionInfoWrap.find('.conditionClassifyCode01-conditionValueAplyWayCode03-disabled').prop('disabled', true).val('');
                        // $conditionInfoWrap.find('.layerCalcType01-conditionValueAplyWayCode03-disabled').prop('disabled', true).val('');

                        // $conditionInfoWrap.find('.condition-value-wrap').removeClass('active');
                    //}
                }

                if (data.conditionTypeCode == '04') {

                    conditionApplyTargetDscd = '02';	//제공조건 조건적용대상구분코드 수수료로 설정

                    renderComboBox('FeeCalculateBasicTypeCode', $('.FeeCalculateBasicTypeCode'), data.calcBasic);
                    renderComboBox('CurrencyCode', $('.CurrencyCode'), data.currencyValue);
                    renderComboBox('FeeSettleTypeCode', $('.FeeSettleTypeCode'), data.settleType, true);
                    renderComboBox('LevyFrqDscd', $('.LevyFrqDscd'), data.levyFrqDscd);             // 징수주기추가.


                    if (data.layerCalcType == '01') { //01일 때만 관련조건정보 활성화
                    } else {
                        $conditionInfoWrap.find('.layerCalcType01-conditionValueAplyWayCode03-disabled').prop('disabled', true).val('');
                    }

                    if (data.conditionClassifyCode === '01') {
                        $conditionInfoWrap.find('.conditionClassifyCode01-disabled').prop('disabled', true).val('');
                        $conditionInfoWrap.find('.layerCalcType01-conditionValueAplyWayCode03-disabled').prop('disabled', true).val('');
                    }
                }
            }

            PFUtil.getDatePicker(true);
            fnSetCndAtrb();
            modifyFlag = false;
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdCndService',
            operation: 'queryPdCndDetail'
        }
    });
}

function renderConditionType2GridPage(requestParam) {
    var $conditionInfoWrap = $el.find('.pf-cp-condition-info');

    PFRequest.get('/product/queryPrimeInterestRelationList.json', requestParam, {
        success: function(data) {
            $conditionInfoWrap.html(conditionType2GridTpl());
            if(writeYn != 'Y' || detailRequestParam.writeYn == 'N'){
                $('.write-btn').hide();
            }

            if ($.isArray(data)) {
                data.forEach(function(el) {
                    el['conditionCode'] = el['id'];

                    delete el['id'];
                });
            }

            cndType2Grid = PFComponent.makeExtJSGrid({
                fields: ['text', 'applyStart','applyEnd','conditionGroupCode', 'conditionGroupTemplateCode', 'conditionCode', 'interestConditionValue', {
                    name: 'rate',
                    convert: function(newValue, record) {
                        if (newValue) {
                            return newValue;
                        } else {
                            return record.get('interestConditionValue').rate;
                        }
                    }}],
                gridConfig: {
                    renderTo: '.condition-type2-grid-wrap',
                    columns: [
                        {text: bxMsg('DPS0138String2'), flex: 1, dataIndex: 'text'},
                        {text: bxMsg('DPS0138String5'), width:150, dataIndex: 'rate'},
                        {text: bxMsg('DPP0127String6'), width:150,dataIndex:'applyStart',
                            editor: {
                                allowBlank: false,
                                listeners: {
                                    focus: function(_this) {
                                        //$('#'+_this.inputId).prop('readonly',true);
                                        PFUtil.getGridDateTimePicker(_this, 'applyStart', cndType2Grid, selectedCndGridCellIndex, true);
                                    },
                                    blur: function(_this, e){
                                        PFUtil.checkDate(e.target);
                                    }
                                }
                            },
                            listeners: {
                                click: function() {
                                    selectedCndGridCellIndex = $(arguments[1]).parent().index();
                                }
                            }
                        },
                        {text: bxMsg('DPP0127String7'), width:150,dataIndex:'applyEnd',
                            editor: {
                                allowBlank: false,
                                listeners: {
                                    focus: function(_this) {
                                        //$('#'+_this.inputId).prop('readonly',true);
                                        PFUtil.getGridDateTimePicker(_this, 'applyEnd', cndType2Grid, selectedCndGridCellIndex, true);
                                    },
                                    blur: function(_this, e){
                                        PFUtil.checkDate(e.target, '9999-12-31 23:59:59');
                                    }
                                }
                            },
                            listeners: {
                                click: function() {
                                    selectedCndGridCellIndex = $(arguments[1]).parent().index();
                                }
                            }
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
                    ],
                    plugins: [
                        Ext.create('Ext.grid.plugin.CellEditing', {
                            clicksToEdit: 1
                        })
                    ]
                }
            });

            cndType2Grid.setData(data);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PdRelationService',
            operation: 'queryListPrimeInterestRelation'
        }
    })
}

function renderCndValueType1Grid(data, popup) {
    var renderTo,
        firstRender = true;

    if (popup) {
        renderTo = '.cnd-value-type1-popup .cnd-val-type1-grid';
    } else {
        renderTo = '.cnd-val-type1-grid';
    }

    cndValueType1Grid = PFComponent.makeExtJSGrid({
        fields: ['code', 'isDefaultValue', 'isSelected', 'name'],
        gridConfig: {
            renderTo: renderTo,
            columns: [
                {xtype: 'checkcolumn', text: bxMsg('DPS0121_21String3'), width: 120, dataIndex: 'isSelected', align:'center',
                    listeners: {
                        checkchange: function(column, rowIndex, checked, eOpts) {
                            $(renderTo).find('.type1-grid-default-check').each(function(idx) {
                                var that = this;

                                // If ConditionAgreeLevel By common Then DefaultCheck Disabled
                                if (selectedCondition.conditionAgreeLevel == '02') {
                                    if (checked && $(that).attr('data-idx') == rowIndex) {
                                        $(that).prop('disabled', false);
                                    } else if (!checked && $(that).attr('data-idx') == rowIndex) {
                                        $(that).prop('disabled', true).prop('checked', false);
                                    }
                                } else {
                                    $(that).prop('disabled', true).prop('checked', false);
                                }
                            });
                            modifyFlag = true;
                        }
                    }},
                {text: bxMsg('DPS0121_21String1'), flex: 1, dataIndex: 'code', align:'center'},
                {text: bxMsg('DPS0121_21String2'), flex: 1, dataIndex: 'name', align:'center'},
                {xtype: 'checkcolumn', text: bxMsg('defaultValue'), dataIndex: 'isDefaultValue',  sortable: false,
                    renderer: function(value, metadata, record) {
                        if (!record.get('isSelected') || selectedCondition.conditionAgreeLevel == '01') {
                            return "<input type='checkbox' disabled>";
                        } else {
                            return (new Ext.ux.CheckColumn()).renderer(value);
                        }
                    },
                    listeners: {
                        beforecheckchange: function(column, rowIndex, checked, eOpts) {
                            if (!cndValueType1Grid.store.getAt(rowIndex).data['isSelected'] || selectedCondition.conditionAgreeLevel == '01') {
                                return false;
                            } else {
                                return true;
                            }
                        }
                    }, align: 'center', width: 120}
            ],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ]
        }
    });

    cndValueType1Grid.setData(data);
}

// RangeCondition commonMeasurementUnitCode Combo Assemly
function renderComboBoxByRate(code, selector, value, defaultSetting) {
    var options = [];

    if (defaultSetting) {
        var $defaultOption = $('<option>');

        $defaultOption.val('');
        $defaultOption.text('');

        options.push($defaultOption);
    }

    $.each(codeMapObj[code], function(key, value){
        var $option = $('<option>');

        if(key == '11' || key == '12') {
            $option.val(key);
            $option.text(value);

            options.push($option);
        }
    });

    selector.html(options);

    if (value) {
        selector.val(value);
    }
}

function renderComboBox(code, selector, value, defaultSetting) {
    var options = [];

    if (defaultSetting) {
        var $defaultOption = $('<option>');

        $defaultOption.val('');
        $defaultOption.text('');

        options.push($defaultOption);
    }

    $.each(codeMapObj[code], function(key, value){
        var $option = $('<option>');

        $option.val(key);
        $option.text(value);

        options.push($option);
    });

    selector.html(options);

    if (value) {
        selector.val(value);
    }
}

// 복합조건 그리드 render
function renderComplexGrid(title, data) {
    var fields = ['y'],
        columns = [{text: bxMsg('DPS0128String1'), width: 47, sortable: false, style : 'text-align:center',
          renderer: function(value, metaData, record) {
            var index = record.store.data.keys.indexOf(record.internalId);
            var prev = record.store.data.items.slice(0, index).map(function(v) { return v.data });
            var start = prev.reduce(function(n, cnd) {
              return n + Object.keys(cnd).reduce(function(m, key) {
                if (key.endsWith(".code")) {
                  m *= cnd[key].length;
                }
                return m;
              }, 1);
            }, 1);
            var len = Object.keys(record.data).reduce(function(m, key) {
              if (key.endsWith(".code")) {
                m *= record.data[key].length;
              }
              return m;
            }, 1);
            return start + (len > 1 ? "~" + (start + len - 1) : "");
          }
        }],
        gridData = [];

    //reset title obj, arr of complex grid
    $el.find('.complex-grid').empty();
    titleDataArr = [];
    titleDataObj = {};

    data.forEach(function(el) {
        var tempObj = {};

        el.x.forEach(function(xEl){
            var columnId = xEl.id;

            tempObj[columnId] = xEl;
        });

        YforNewColumn = tempObj['y'] = el.y;

        gridData.push(tempObj);
    });

    //title(즉, 컬럼 수) 만큼 필드와 컬럼 세팅 해줘야 함
    title.forEach(function(el) {
        el.defineValues = el.defineValues || [];
        var conditionCode = el.titleConditionCode,
            tempObj = {},
            conditionDetailCode = el.titleConditionDetailTypeCode;

        tempObj['titleConditionCode'] = conditionCode;
        tempObj['titleConditionName'] = el.titleConditionName;
        tempObj['titleConditionTypeCode'] = el.titleConditionTypeCode;

        // 기준조건여부
        if( stepCndCd && conditionCode == stepCndCd){
            tempObj['baseConditionYn'] = true;
        }else{
            tempObj['baseConditionYn'] = false;
        }

        //목록형
        if (el.titleConditionTypeCode == '01') {
            tempObj['defineValues'] = el.defineValues;

            var defineValuesObj = {};

            if(conditionCode=='L0149'){
                // 금액일때(통화코드) 명이 아닌 코드로 표시한다.
                el.defineValues.forEach(function(el) {
                    defineValuesObj[el.code] = el.code;
                });
            }else{
                el.defineValues.forEach(function(el) {
                    defineValuesObj[el.code] = el.name;
                });
            }

            fields.push(conditionCode, conditionCode+'.defineValues', {
                name: conditionCode+'.code',
                style: 'text-align:center',
                convert: function(newValue, record) {
                    var code ;

                    /*if (newValue) {
                        code = newValue;

                        record.get(conditionCode)['listConditionValue'] = {};
                        record.get(conditionCode)['listConditionValue']['defineValues'] = [];
                        record.get(conditionCode)['listConditionValue']['defineValues'].push({
                            code: newValue,
                            name: defineValuesObj[newValue],
                            isSelected: true
                        });

                    } else if (record.get(conditionCode)['listConditionValue']) {
                        record.get(conditionCode)['listConditionValue']['defineValues'].forEach(function(el) {
                            if (el.isSelected) {
                                code =  el.code;
                            }
                        })
                    } else {
                        code = '';
                    }

                    return code;*/
                    if (newValue) {
                        if (!Array.isArray(newValue)) newValue = [newValue];
                        // 순서 조정
                        var map = newValue.reduce(function(m, v) {
                          m[v] = true;
                          return m;
                        }, {});
                        code = el.defineValues.reduce(function(l, v) {
                          if (map[v.code])
                            l.push(v.code);
                          return l;
                        }, []);

                        record.get(conditionCode).listConditionValue = {
                          defineValues: newValue.map(function(v) {
                            return {
                              code: v,
                              name: defineValuesObj[v],
                              isSelected: true
                            };
                          })
                        };

                    } else if (record.get(conditionCode).listConditionValue) {
                        code = record.get(conditionCode).listConditionValue.defineValues.reduce(function(l, v) {
                            if (v.isSelected) {
                              l.push(v.code);
                            }
                            return l;
                        }, []);
                    } else {
                        code = [''];
                    }

                    return code.length > 0 ? code : [''];
                }
            });

            if(!parent.g_cndAtrb['cndAtrb-07'] || parent.g_cndAtrb['cndAtrb-07'] == 'Y') {
                columns.push(
                    {
                        header: el.titleConditionName + '(' + el.titleConditionCode + ')',
                        width: 170, dataIndex: conditionCode + '.code',
                        style: 'text-align:center',
                        renderer: function (value, metadata, record) {
                            var map = value.reduce(function(map, v) {
                              map[v] = true;
                              return map;
                            }, {});

                            var consecutive = false;
                            var resultList = [];
                            var temp = [];
                            var defineValues = el.defineValues;
                            defineValues.forEach(function(v, i) {
                              if (map[v.code]) {
                                temp.push(v);
                                consecutive = true;
                              }

                              if (i === defineValues.length - 1 || (!map[v.code] && consecutive)) {
                                if (temp.length === 1) {
                                  resultList.push(Ext.String.format("[{0}]{1}", temp[0].code, temp[0].name));
                                } else if (temp.length > 1) {
                                  var left = temp.shift();
                                  var right = temp.pop();
                                  resultList.push(Ext.String.format("[{0}]{1}~[{2}]{3}", left.code, left.name, right.code, right.name));
                                }
                                temp = [];
                                consecutive = false;
                              }
                            });

                            return resultList.join(", ");
                            //return defineValuesObj[value];
                        },
                        editor: {
                            xtype: 'combo',
                            typeAhead: true,
                            triggerAction: 'all',
                            displayField: conditionCode == 'L0149' ? 'code' : 'name',
                            valueField: 'code',
                            emptyText: bxMsg("select"),
                            multiSelect: true,
                            listConfig: {
                              getInnerTpl: function() {
                                return "[{code}] {name}";
                              }
                            },
                            editable: false,
                            store: new Ext.data.Store({
                                fields: ['code', 'name'],
                                data: el['defineValues']
                            })
                        }
                    }
                );
            }else{
                columns.push(
                    {
                        header: el.titleConditionName + '(' + el.titleConditionCode + ')',
                        width: 170, dataIndex: conditionCode + '.code',
                        style: 'text-align:center',
                        renderer: function (value, metadata, record) {
                            var map = value.reduce(function(map, v) {
                              map[v] = true;
                              return map;
                            }, {});

                            var consecutive = false;
                            var resultList = [];
                            var temp = [];
                            var defineValues = el.defineValues;
                            defineValues.forEach(function(v, i) {
                              if (map[v.code]) {
                                temp.push(v);
                                consecutive = true;
                              }

                              if (i === defineValues.length - 1 || (!map[v.code] && consecutive)) {
                                if (temp.length === 1) {
                                  resultList.push(Ext.String.format("[{0}]{1}", temp[0].code, temp[0].name));
                                } else if (temp.length > 1) {
                                  var left = temp.shift();
                                  var right = temp.pop();
                                  resultList.push(Ext.String.format("[{0}]{1}~[{2}]{3}", left.code, left.name, right.code, right.name));
                                }
                                temp = [];
                                consecutive = false;
                              }
                            });

                            return resultList.join(", ");
                            //return defineValuesObj[value];
                        },
                    }
                );
            }
        } else if (el.titleConditionTypeCode == '02') { //범위형
            tempObj['productMeasurementUnit'] = el.productMeasurementUnit;
            tempObj['currencyValue'] = el.currencyValue;
            tempObj['rangeBlwUnderType'] = el.rangeBlwUnderType;
            tempObj['titleConditionDetailTypeCode'] = el.titleConditionDetailTypeCode;

            fields.push(conditionCode, {
                name: conditionCode+'.minValue',
                style: 'text-align:center',
                convert: function(newValue, record) {
                    var minValue ;
                    var isNegativeNumber = newValue.substr(0,1) == '-';

                    if (newValue) {
                        if (!record.get(conditionCode)['rangeConditionValue']) {
                            record.get(conditionCode)['rangeConditionValue'] = {};
                        }

                        if(isNotNegativeRangeType(conditionDetailCode)){
                            minValue = PFValidation.gridFloatCheckRenderer(newValue, 19, 0, true);
                        }else{
                            minValue = PFValidation.gridFloatCheckRendererForRangeType(newValue, 19, 2, true);
                        }

                        record.get(conditionCode)['rangeConditionValue']['minValue'] = minValue;
                    }  else if (record.get(conditionCode)['rangeConditionValue']) {
                        minValue = record.get(conditionCode)['rangeConditionValue']['minValue'];
                    } else {
                        if (!record.get(conditionCode)['rangeConditionValue']) {
                            record.get(conditionCode)['rangeConditionValue'] = {};
                        }

                        minValue = '0.00';

                        record.get(conditionCode)['rangeConditionValue']['minValue'] = minValue;
                    }

                    if(isNegativeNumber && parseFloat(newValue) == 0){
                        minValue = parseFloat('-' + minValue) + '';
                        if(minValue == '-0'){
                            minValue = '0.00';
                        }
                    }

                    if(newValue){
                        var resultValue = parseFloat(newValue)+''
                        if(resultValue.split('.')[0] == 'NaN'){
                            minValue = '0.00'
                        }
                    }

                    return minValue;
                }
            }, {
                name: conditionCode+'.maxValue',
                style: 'text-align:center',
                convert: function(newValue, record) {
                    var maxValue ;
                    var isNegativeNumber = newValue.substr(0,1) == '-';

                    if (newValue) {
                        if (!record.get(conditionCode)['rangeConditionValue']) {
                            record.get(conditionCode)['rangeConditionValue'] = {};
                        }

                        if(isNotNegativeRangeType(conditionDetailCode)){
                            maxValue = PFValidation.gridFloatCheckRenderer(newValue, 19, 0, true);
                        }else{
                            maxValue = PFValidation.gridFloatCheckRendererForRangeType(newValue, 19, 2, true);
                        }

                        record.get(conditionCode)['rangeConditionValue']['maxValue'] = maxValue;
                    }  else if (record.get(conditionCode)['rangeConditionValue']['maxValue']){
                        maxValue = record.get(conditionCode)['rangeConditionValue']['maxValue'];
                    } else {
                        if (!record.get(conditionCode)['rangeConditionValue']) {
                            record.get(conditionCode)['rangeConditionValue'] = {};
                        }

                        maxValue = '0.00';

                        record.get(conditionCode)['rangeConditionValue']['maxValue'] = maxValue;
                    }

                    if(isNegativeNumber && parseFloat(newValue) == 0){
                        maxValue = parseFloat('-' + maxValue) + '';
                        if(maxValue == '-0'){
                            maxValue = '0.00';
                        }
                    }

                    if(newValue){
                        var resultValue = parseFloat(newValue)+''
                        if(resultValue.split('.')[0] == 'NaN'){
                            maxValue = '0.00'
                        }
                    }

                    return maxValue;
                }
            });

            var rangeHeader;

            if(el.titleConditionDetailTypeCode == '01') {
                rangeHeader = '<div align=center>' + el.titleConditionName + '(' + el.titleConditionCode + ')<br/>' + codeMapObj['CurrencyCode'][el.currencyValue] + '<br/>' + codeMapObj['RangeBlwUnderTypeCode'][el.rangeBlwUnderType] + '</div>';
            } else {
                rangeHeader = '<div align=center>' + el.titleConditionName + '(' + el.titleConditionCode + ')<br/>' + codeMapObj['ProductMeasurementUnitCode'][el.productMeasurementUnit] + '<br/>' + codeMapObj['RangeBlwUnderTypeCode'][el.rangeBlwUnderType] + '</div>';
            }

            if(!parent.g_cndAtrb['cndAtrb-07'] || parent.g_cndAtrb['cndAtrb-07'] == 'Y') {
                columns.push({
                    header: rangeHeader,
                    columns: [{
                        text: bxMsg('DPS0121_1String1'),
                        width: 160,
                        dataIndex: conditionCode + '.minValue',
                        style: 'text-align:center',
                        renderer: function (value, metadata, record) {
                            if (parseFloat(value) > parseFloat(record.get(conditionCode + '.maxValue'))) {
                                GridMinMaxCheck = false;
                            } else {
                                GridMinMaxCheck = true;
                            }

                            if (isNotNegativeRangeType(conditionDetailCode)) {
                                return PFValidation.gridFloatCheckRenderer(value, 19, 0, true);
                            } else {
                                return PFValidation.gridFloatCheckRendererForRangeType(value, 19, 2);
                            }
                        },
                        editor: {
                            xtype: 'textfield',
                            allowBlank: false,
                            selectOnFocus: true,
                            listeners: {
                                'render': function (cmp) {
                                    cmp.getEl()
                                        .on('keydown', function (e) {
                                            if (isNotNegativeRangeType(conditionDetailCode)) {
                                                PFValidation.gridFloatCheckKeydown(e, 19, 0, true);
                                            } else {
                                                PFValidation.gridFloatCheckKeydownForRangeType(e, 19, 2);
                                            }

                                        })
                                        .on('keyup', function (e) {
                                            if (isNotNegativeRangeType(conditionDetailCode)) {
                                                PFValidation.gridFloatCheckKeyup(e, 19, 0, true);
                                            } else {
                                                PFValidation.gridFloatCheckKeyupForRangeType(e, 19, 2);
                                            }
                                        })
                                }
                            }
                        }
                    }, {
                        text: bxMsg('DPS0121_1String2'),
                        width: 160,
                        dataIndex: conditionCode + '.maxValue',
                        style: 'text-align:center',
                        renderer: function (value, metadata, record) {
                            if (isNotNegativeRangeType(conditionDetailCode)) {
                                return PFValidation.gridFloatCheckRenderer(value, 19, 0, true);
                            } else {
                                return PFValidation.gridFloatCheckRendererForRangeType(value, 19, 2);
                            }
                        },
                        editor: {
                            xtype: 'textfield',
                            allowBlank: false,
                            selectOnFocus: true,
                            listeners: {
                                'render': function (cmp) {
                                    cmp.getEl()
                                        .on('keydown', function (e) {
                                            if (isNotNegativeRangeType(conditionDetailCode)) {
                                                PFValidation.gridFloatCheckKeydown(e, 19, 0, true);
                                            } else {
                                                PFValidation.gridFloatCheckKeydownForRangeType(e, 19, 2);
                                            }
                                        })
                                        .on('keyup', function (e) {
                                            if (isNotNegativeRangeType(conditionDetailCode)) {
                                                PFValidation.gridFloatCheckKeyup(e, 19, 0, true);
                                            } else {
                                                PFValidation.gridFloatCheckKeyupForRangeType(e, 19, 2);
                                            }
                                        })
                                }
                            }
                        }
                    }]
                });
            }else{
                columns.push({
                    header: rangeHeader,
                    columns: [{
                        text: bxMsg('DPS0121_1String1'),
                        width: 160,
                        dataIndex: conditionCode + '.minValue',
                        style: 'text-align:center',
                        renderer: function (value, metadata, record) {
                            if (parseFloat(value) > parseFloat(record.get(conditionCode + '.maxValue'))) {
                                GridMinMaxCheck = false;
                            } else {
                                GridMinMaxCheck = true;
                            }

                            if (isNotNegativeRangeType(conditionDetailCode)) {
                                return PFValidation.gridFloatCheckRenderer(value, 19, 0, true);
                            } else {
                                return PFValidation.gridFloatCheckRendererForRangeType(value, 19, 2);
                            }
                        }
                    }, {
                        text: bxMsg('DPS0121_1String2'),
                        width: 160,
                        dataIndex: conditionCode + '.maxValue',
                        style: 'text-align:center',
                        renderer: function (value, metadata, record) {
                            if (isNotNegativeRangeType(conditionDetailCode)) {
                                return PFValidation.gridFloatCheckRenderer(value, 19, 0, true);
                            } else {
                                return PFValidation.gridFloatCheckRendererForRangeType(value, 19, 2);
                            }
                        }
                    }]
                });
            }
        }

        titleDataArr.push(tempObj);
    });

    titleDataArr.forEach(function(el) {
        titleDataObj[el.titleConditionCode] = el;
    });

    var flex = 0,
        width = 0;

    if(titleDataArr.length >= 2) {
        flex = 0;
        width = 295;
    } else {
        flex = 1;
        width = 0;
    }

    // Header Style Center
    columns.push({text: bxMsg('DPS0129String4'), style: 'text-align:center', flex : flex, width : width,
        renderer: function(value, p, record) {
        var yTitle1 = '',
            yVal1 = '',
            yTitle2 = '',
            yVal2 = '',
            line1 = '',
            line2 = '',
            line3 = '';

        var conditionTypeCode = selectedCondition.conditionTypeCode;
        var extFormat;

        switch (conditionTypeCode) {
            case '01':
                if (record.get('y')) {
                    record.get('y')['defineValues'].forEach(function(el) {
                        if (el.isSelected) {
                            yTitle1 = yTitle1 + el.name + '，';
                        }
                    });
                }

                if(yTitle1 != '' && yTitle1.length > 0) {
                    yTitle1 = yTitle1.substring(0, yTitle1.length - 1);
                }

                extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}</p>', yTitle1);
                break;
            case '02' :
                if (record.get('y')) {
                    var defaultString = (record.get('y').defalueValue) ? record.get('y').defalueValue : '0.00',
                        minString = (record.get('y').minValue) ? record.get('y').minValue : '0.00',
                        maxString, baseString;

                    if (record.get('y').isSystemMaxValue) {
                        maxString = bxMsg('systemMax');
                    } else {
                        maxString = (record.get('y').maxValue) ? record.get('y').maxValue : '0.00';
                    }
                    baseString = (record.get('y').defalueValue) ? record.get('y').defalueValue : '0.00';

                 	// OHS 20180503 추가 - 소숫점일치를 위해 추가
                	// 금액
                	if(selectedCondition.conditionDetailTypeCode == '01') {
                    	defaultString = PFValidation.gridFloatCheckRenderer(defaultString, 19, 2, true);
                    	minString = PFValidation.gridFloatCheckRenderer(minString, 19, 2, true);
                    	if(!record.get('y').isSystemMaxValue) {
                    		maxString = PFValidation.gridFloatCheckRenderer(maxString, 19, 2, true);
                    	}
                    	baseString = PFValidation.gridFloatCheckRenderer(baseString, 19, 2, true);
                	}
                	// 율
                	else if(selectedCondition.conditionDetailTypeCode == '05' || selectedCondition.conditionDetailTypeCode == '08') {
                    	defaultString = PFValidation.gridFloatCheckRenderer(defaultString, 3, 6, true);
                    	minString = PFValidation.gridFloatCheckRenderer(minString, 3, 6, true);
                    	if(!record.get('y').isSystemMaxValue) {
                    		maxString = PFValidation.gridFloatCheckRenderer(maxString, 3, 6, true);
                    	}
                    	baseString = PFValidation.gridFloatCheckRenderer(baseString, 3, 6, true);
                	}
                	else {
                    	defaultString = PFValidation.gridFloatCheckRenderer(defaultString, 8, 0, true);
                    	minString = PFValidation.gridFloatCheckRenderer(minString, 8, 0, true);
                    	if(!record.get('y').isSystemMaxValue) {
                    		maxString = PFValidation.gridFloatCheckRenderer(maxString, 8, 0, true);
                    	}
                    	baseString = PFValidation.gridFloatCheckRenderer(baseString, 8, 0, true);
                	}
                    
                    if (selectedCondition.isSingleValue) {
                        yTitle1 = bxMsg('DPM100TabSring1') + ' : ';
                        yVal1 = defaultString;
                    } else {
                        yTitle1 = bxMsg('DPS0129Unit1String1') + ' : ';
                        yVal1 = minString + '~' + maxString + '(' + baseString  + ')';
                    }

                    if (selectedCondition.conditionDetailTypeCode == '01') {
                        yTitle2 = bxMsg('currencyCode') + ' : ';
                        yVal2 = codeMapObj['CurrencyCode'][record.get('y').currencyValue];
                    } else {
                        yTitle2 = bxMsg('DPS0129Unit1String2') + ' : ';
                        
                        // OHS 20171205 수정 - ProductMeasurementUnitCode 값이 없을경우 조회순서가 가장 빠른 측정단위코드를 기본 세팅
                        if(record.get('y').productMeasurementUnit == undefined) {
                        	
                        	var mrUnitCodeName = '';
                        	// OHS 20180503 - 조건상세유형코드별로 세분화처리
                        	// 02 : 날짜
                        	if(selectedCondition.conditionDetailTypeCode == '02') {
                        		mrUnitCodeName = 'ProductMeasurementUnitCodeD'; 
                        	}
                        	// 03 : 주기
                        	else if(selectedCondition.conditionDetailTypeCode == '03') {
                        		mrUnitCodeName = 'ProductMeasurementUnitCodeF';
                        	}
                        	// 04 : 숫자
                        	else if(selectedCondition.conditionDetailTypeCode == '04') {
                        		mrUnitCodeName = 'ProductMeasurementUnitCodeN';
                        	}
                        	// 05 : 율
                        	else if(selectedCondition.conditionDetailTypeCode == '05') {
                        		mrUnitCodeName = 'ProductMeasurementUnitCodeR';
                        	}
                        	
                        	if(codeArrayObj[mrUnitCodeName]) {
                        		yVal2 = codeArrayObj[mrUnitCodeName][0].name;
                        		record.data.y.productMeasurementUnit = codeArrayObj[mrUnitCodeName][0].code;
                        	}
                        	// 공통코드에 등록이 안되어있는경우 오류방지를 위해 ProductMeasurementUnitCode 에서 값세팅
                        	else {
                        		yVal2 = codeArrayObj['ProductMeasurementUnitCode'][0].name;
                        		record.data.y.productMeasurementUnit = codeArrayObj['ProductMeasurementUnitCode'][0].code;
                        	}
                        }
                        else {
                        	yVal2 = codeMapObj['ProductMeasurementUnitCode'][record.get('y').productMeasurementUnit];
                        }
                    }
                }

                extFormat = Ext.String.format('<p class="ext-condition-value-column">{0} {1} </br> {2} {3}</p>', yTitle1, yVal1, yTitle2, yVal2);
                break;
            case '03' :
                if (record.get('y')) {
                    var minInString,
                        maxInString, base,
                        refPdCd, refPdNm,
                        refCndCd, refCndNm;

                    var rateApplyWay,           // 금리적용방식
                        intVal,                 // 금리값(최대~최소(기본))
                        sprdVal,                // 기준금리 (+,-,*,/) 스프레드율
                        rateSegmentType,        // 변동적용방식
                        varIntRtCyclCalcnBase,  // 변동주기산정기준
                        refPdVal;               // 타상품금리연동 정보


                    // 금리적용방식
                    rateApplyWay = codeMapObj['ProductConditionInterestApplyTypeCode'][record.get('y').rateApplyWayCode];

                    // 금리값
                    minInString = (record.get('y').minInterestRate) ? record.get('y').minInterestRate : '';
                    maxInString = (record.get('y').maxInterestRate) ? record.get('y').maxInterestRate : '';
                    base = (record.get('y').rate) ? record.get('y').rate : '';
                    
                    // OHS 20180629 추가 - 추후 조건유형별로 자릿수를 공통변수로 추출해야함.
                    minInString = PFValidation.gridFloatCheckRenderer(minInString, 3, 6);
                    maxInString = PFValidation.gridFloatCheckRenderer(maxInString, 3, 6);
                    base = PFValidation.gridFloatCheckRenderer(base, 3, 6);
                    
                    intVal = bxMsg('DPS0129Unit1String1') + ' : ' + minInString + '~' + maxInString + '(' + base + ')';

                    // 금리데이터유형코드 = 기준금리연동
                    if(record.get('y').type == '02') {

                        var sprdAplyFormula;

                        switch (record.get('y').sprdAplyFormulaCd) {
                            case '01' :
                                sprdAplyFormula = '+';
                                break;
                            case '02' :
                                sprdAplyFormula = '-';
                                break;
                            case '03' :
                                sprdAplyFormula = '*';
                                break;
                            case '04' :
                                sprdAplyFormula = '/';
                                break;
                        }
                        sprdVal = codeMapObj['BaseIntRtKndCode'][record.get('y').baseRateCode] + (sprdAplyFormula ? sprdAplyFormula + record.get('y').minSprdRt : '');
                    }
                    // 금리데이터유형코드 = 타상품금리연동
                    else if(record.get('y').type == '03') {
                        yTitle1 = bxMsg('DPS0121_34String1') + ' : ';
                        refPdCd = (record.get('y').refPdCd) ? record.get('y').refPdCd : '';
                        refPdNm = (record.get('y').refPdNm) ? record.get('y').refPdNm : '';

                        yTitle2 = bxMsg('DPS0121_34String2') + ' : ';
                        refCndCd = (record.get('y').refCndCd) ? '[' + record.get('y').refCndCd  + ']' : '';
                        refCndNm = (record.get('y').refCndNm) ? ' / ' +record.get('y').refCndNm : '';

                        var refRefCndCd = (record.get('y').refRefCndCd) ? ' / ' + record.get('y').refRefCndNm : '';
                        var refCndVal = (record.get('y').refCndVal) ? record.get('y').refCndVal : '';
                        var refCndMsurUtCd = (record.get('y').refCndMsurUtCd) ? '(' + codeMapObj['ProductMeasurementUnitCode'][record.get('y').refCndMsurUtCd] + ')' : '';

                        refPdVal = refPdNm + refCndNm + refRefCndCd + ' '+ refCndVal + refCndMsurUtCd;
                    }

                    // 금리적용방식코드 != 고정적용
                    if(record.get('y').rateApplyWayCode != '01') {
                        // 변동적용방식
                        if (record.get('y').rateSegmentType == '01') {
                            // 신규이후변동적용  : 변동적용방식
                            rateSegmentType = codeMapObj['InterestSegmentTypeCode'][record.get('y').rateSegmentType];
                        }
                        else if (record.get('y').rateSegmentType == '02' || record.get('y').rateSegmentType == '03') {
                            // 일주기변동, 월주기변동 : (주기수)변동적용방식
                            rateSegmentType = '(' + record.get('y').varIntRtAplyCyclCnt + ')'
                                + codeMapObj['InterestSegmentTypeCode'][record.get('y').rateSegmentType];
                        }
                        else if (record.get('y').rateSegmentType == '04') {
                            // 약정주기변동적용 : 변동적용방식([조건코드]조건명)
                            rateSegmentType = codeMapObj['InterestSegmentTypeCode'][record.get('y').rateSegmentType]
                                + '([' + record.get('y').varFrqRefCndCd + ']' + record.get('y').varFrqRefCndNm + ')';
                        }

                        // 변동주기산정기준
                        varIntRtCyclCalcnBase = codeMapObj['VarIntRtCyclCalcnBaseCode'][record.get('y').varIntRtCyclCalcnBaseCd];
                    }

                    // 금리적용방식코드 = 고정
                    if (record.get('y').rateApplyWayCode == '01') {
                        // 금리값
                        if(record.get('y').type == '01'){
                            line1 = rateApplyWay + ', ' + intVal;
                        }
                        // 기준금리연동
                        else if(record.get('y').type == '02'){
                            line1 = rateApplyWay + ', ' + sprdVal;
                        }
                        // 타상품금리연동
                        else if(record.get('y').type == '03'){
                            line1 = rateApplyWay + ', ' + refPdVal;
                        }
                    }
                    // 금리적용방식코드 = 변동
                    else if (record.get('y').rateApplyWayCode == '02') {

                        line1 = rateApplyWay + ', ' + rateSegmentType + ', ' + varIntRtCyclCalcnBase;

                        // 금리값
                        if(record.get('y').type == '01'){
                            line2 = intVal;
                        }
                        // 기준금리연동
                        else if(record.get('y').type == '02'){
                            line2 = sprdVal;
                        }
                        // 타상품금리연동
                        else if(record.get('y').type == '03'){
                            line2 = refPdVal;
                        }
                    }
                    // 금리적용방식코드 = 고정후변동
                    else if (record.get('y').rateApplyWayCode == '03') {
                        // 기준금리연동
                        if(record.get('y').type == '02'){
                            line1 = rateApplyWay + ', '
                                + bxMsg('FixedDuration') + ':' + record.get('y').frstFixIrtAplyTrmCnt + codeMapObj['FrstFixIRtAplyTrmDscd'][record.get('y').frstFixIrtAplyTrmDscd] + ', ' // 고정기간
                                + intVal;
                            line2 = rateSegmentType + ', ' + varIntRtCyclCalcnBase + ', ' + sprdVal;
                        }
                        // 타상품금리연동
                        else if(record.get('y').type == '03'){
                            line1 = rateApplyWay + ', ' + refPdVal;
                            line2 = rateSegmentType + ', ' + varIntRtCyclCalcnBase;
                        }
                    }
                    // 금리적용방식코드 = 타상품참조
                    else if (record.get('y').rateApplyWayCode == '04') {
                        line1 = rateApplyWay + ', ' + refPdVal;
                    }

                    if(record.get('y').type != '01'){
                        line3 = bxMsg('DPS0121_31String3') + ':' +  record.get('y').applyMinInterestRate + '/' + record.get('y').applyMaxInterestRate;
                    }
                }

                if(line2.length > 0){
                    line2 = '</br>'+line2;
                }
                if(line3.length > 0){
                    line3 = '</br>'+line3;
                }

                extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}{1}{2}</p>', line1, line2, line3);
                break;
            case '04' :
                if (record.get('y')) {
                    var minFixFeeAmt, // 최소수수료
                        maxFixFeeAmt,  // 최대수수료
                        fixed, // 기본수수료
                        minRt, // 최소수수료율
                        maxRt, // 최대수수료율
                        rate; // 기본율
                    var bottom,
                        top,
                        calcBasic;  // 징수기준

                    calcBasic = codeMapObj['FeeCalculateBasicTypeCode'][(record.get('y').calcBasic)];

                    // 금액정보
                    if (record.get('y').feeTpCd == '02') {
                        minFixFeeAmt = (record.get('y').minFixFeeAmt) ? record.get('y').minFixFeeAmt : '0.00';
                        maxFixFeeAmt = (record.get('y').maxFixFeeAmt) ? record.get('y').maxFixFeeAmt : '0.00';
                        fixed = (record.get('y').fixed) ? record.get('y').fixed : '0.00';

                        minFixFeeAmt = PFValidation.gridFloatCheckRenderer(minFixFeeAmt, 19, 2, true);
                        maxFixFeeAmt = PFValidation.gridFloatCheckRenderer(maxFixFeeAmt, 19, 2, true);
                        fixed = PFValidation.gridFloatCheckRenderer(fixed, 19, 2, true);
                        
                        // 최소~최대(기본)
                        line1 = calcBasic + ', ' + bxMsg('DPS0129Unit1String1') + ' : ' + minFixFeeAmt + '~' + maxFixFeeAmt + '(' + fixed + ')';
                        line2 = '';
                    }
                    // 율정보
                    else if (record.get('y').feeTpCd == '01') {
                        minRt = (record.get('y').minRt) ? record.get('y').minRt : '0.000000';
                        maxRt = (record.get('y').maxRt) ? record.get('y').maxRt : '0.000000';
                        rate = (record.get('y').rate) ? record.get('y').rate : '0.000000';
                        bottom = (record.get('y').bottom) ? record.get('y').bottom : '0.00';
                        top = (record.get('y').top) ? record.get('y').top : '0.00';

                        minRt = PFValidation.gridFloatCheckRenderer(minRt, 3, 6, true);
                        maxRt = PFValidation.gridFloatCheckRenderer(maxRt, 3, 6, true);
                        rate = PFValidation.gridFloatCheckRenderer(rate, 3, 6, true);
                        bottom = PFValidation.gridFloatCheckRenderer(bottom, 19, 2, true);
                        top = PFValidation.gridFloatCheckRenderer(top, 19, 2, true);
                        
                        // 최소~최대(기본)
                        line1 = calcBasic  + ', ' + bxMsg('DPS0129Unit1String1') + ' : ' + minRt + '~' + maxRt + '(' + rate + ') (%)';
                        line2 = bxMsg('DPS0129Unit1String1') + ' : ' + bottom + '~' + top;
                    }
                }

                extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}</br> {1}</p>', line1, line2);
                break;
        }

        return extFormat;
    }
    });

    // 구성조건설정 권한이 있는 경우만 X(삭제) 컬럼 추가
    if(!parent.g_cndAtrb['cndAtrb-07'] || parent.g_cndAtrb['cndAtrb-07'] == 'Y') {
        columns.push({
            xtype: 'actioncolumn', width: 35, align: 'center',
            style: 'text-align:center',
            items: [{
                icon: '/images/x-delete-16.png',
                handler: function (grid, rowIndex, colIndex, item, e, record) {
                    record.destroy();
                    cndValComplexGrid.grid.getView().refresh(); // rowIndex adjusting.
                    modifyFlag = true;
                }
            }]
        });
    }

    cndValComplexGrid = PFComponent.makeExtJSGrid({
        fields: fields,
        gridConfig: {
            renderTo: '.complex-grid',
            columns: columns,
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                        afteredit: function(e, editor){
                            if (editor.field.endsWith(".code")) { // 목록조건 수정
                              cndValComplexGrid.grid.getView().refresh(); // rowIndex adjusting.
                            }
                        }
                    }
                })
            ],
            listeners: {
                scope: this,
                'celldblclick': function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    if ($(td).find('p').attr('class') === 'ext-condition-value-column') {
                        var conditionTypeCode = selectedCondition.conditionTypeCode;
                        switch (conditionTypeCode) {
                            case '01':
                                renderConditionValue1Popup(record.get('y'), rowIndex);
                                break;
                            case '02' :
                                renderConditionValue2Popup(record.get('y'), rowIndex);
                                break;
                            case '03' :
                                renderConditionValue3Popup(record.get('y'), rowIndex);
                                break;
                            case '04' :
                                renderConditionValue4Popup(record.get('y'), rowIndex);
                                break;
                        }
                    }
                }
            }
        }

    });

    cndValComplexGrid.store.model.override({
      isEqual : function(currentValue, newValue) {
        if (typeof currentValue == "undefined" || currentValue === null)
          return currentValue === newValue;
        if (currentValue === newValue) return true;

        if (Ext.isDate(currentValue))
          if (Ext.isDate(newValue))
            return currentValue.getTime() == newValue.getTime();
          else
            return false;

        if (Ext.isObject(currentValue)) {
          for (var key in currentValue) {
            if (currentValue.hasOwnProperty(key))
              if (!this.isEqual(currentValue[key], newValue[key]))
                return false;
          }
          return true;
        }
        else if (Ext.isArray(currentValue)) {
          if (newValue === null) return false;
          if (currentValue.length != newValue.length) return false;
          for (var i = 0 ; i < currentValue.length ; i++)
            if (!this.isEqual(currentValue[i], newValue[i]))
              return false;
          return true;
        }
        return false;
      }
    });

    gridData = aggregate(gridData);
    cndValComplexGrid.setData(gridData);
}

function aggregate(data) {
  var match = function(a, b) {
    // 조건값 체크
    if (a.y.conditionValueType === "DISCRETE") { // 목록
      if (a.y.defineValues.length !== b.y.defineValues.length)
        return null;
      for (var i=0; i<a.y.defineValues.length; i++) {
        if (a.y.defineValues[i].isSelected !== b.y.defineValues[i].isSelected)
          return null;
      }
    } else if (a.y.conditionValueType === "RANGE") { // 범위
      if (a.y.conditionDetailTypeCode !== b.y.conditionDetailTypeCode
          || a.y.minValue !== b.y.minValue
          || a.y.maxValue !== b.y.maxValue
          || a.y.defalueValue !== b.y.defalueValue
          || a.y.increaseValue !== b.y.increaseValue
          || a.y.currencyValue !== b.y.currencyValue
          || a.y.productMeasurementUnit !== b.y.productMeasurementUnit)
        return null;
    } else if (a.y.conditionValueType === "INTEREST") { // 금리
      if (a.y.applyMaxInterestRate !== b.y.applyMaxInterestRate
          || a.y.applyMinInterestRate !== b.y.applyMinInterestRate
          || a.y.baseIntRateDataTpDscd !== b.y.baseIntRateDataTpDscd
          || a.y.baseIntRtAplyTmCd !== b.y.baseIntRtAplyTmCd
          || a.y.baseIntRtAplyWayCd !== b.y.baseIntRtAplyWayCd
          || a.y.baseRateCode !== b.y.baseRateCode
          || a.y.calcMethod !== b.y.calcMethod
          || a.y.dayRateYearlyCoefficient !== b.y.dayRateYearlyCoefficient
          || a.y.fixTrmDataTpDscd !== b.y.fixTrmDataTpDscd
          || a.y.fixTrmRefCndCd !== b.y.fixTrmRefCndCd
          || a.y.frctnAplyCnt !== b.y.frctnAplyCnt
          || a.y.frctnAplyWayCd !== b.y.frctnAplyWayCd
          || a.y.frstFixIrtAplyTrmCnt !== b.y.frstFixIrtAplyTrmCnt
          || a.y.frstFixIrtAplyTrmDscd !== b.y.frstFixIrtAplyTrmDscd
          || a.y.maxInterestRate !== b.y.maxInterestRate
          || a.y.maxSprdRt !== b.y.maxSprdRt
          || a.y.minInterestRate !== b.y.minInterestRate
          || a.y.minSprdRt !== b.y.minSprdRt
          || a.y.rate !== b.y.rate
          || a.y.rateApplyWayCode !== b.y.rateApplyWayCode
          || a.y.rateFixedTerm !== b.y.rateFixedTerm
          || a.y.rateRefDay !== b.y.rateRefDay
          || a.y.rateSegmentCircle !== b.y.rateSegmentCircle
          || a.y.rateSegmentDayType !== b.y.rateSegmentDayType
          || a.y.rateSegmentType !== b.y.rateSegmentType
          || a.y.refTrmAplyDscd !== b.y.refTrmAplyDscd
          || a.y.sprdAplyFormulaCd !== b.y.sprdAplyFormulaCd
          || a.y.termCalcType !== b.y.termCalcType
          || a.y.varIntRtAplyCyclCnt !== b.y.varIntRtAplyCyclCnt
          || a.y.varIntRtCyclCalcnBaseCd !== b.y.varIntRtCyclCalcnBaseCd)
        return null;
    } else if (a.y.conditionValueType === "FEE") { // 수수료
      if (a.y.feeTpCd !== b.y.feeTpCd
          || a.y.calcBasic !== b.y.calcBasic
          || a.y.maxValue !== b.y.maxValue
          || a.y.minFixFeeAmt !== b.y.minFixFeeAmt
          || a.y.maxFixFeeAmt !== b.y.maxFixFeeAmt
          || a.y.fixed !== b.y.fixed
          || a.y.fixFeeIncrsAmt !== b.y.fixFeeIncrsAmt
          || a.y.bottom !== b.y.bottom
          || a.y.top !== b.y.top
          || a.y.minRt !== b.y.minRt
          || a.y.maxRt !== b.y.maxRt
          || a.y.rate !== b.y.rate
          || a.y.unitIncrsRt !== b.y.unitIncrsRt
          || a.y.rtMsurUnitCd !== b.y.rtMsurUnitCd
          || a.y.settleType !== b.y.settleType
          || a.y.currencyValue !== b.y.currencyValue
          || a.y.isSystemMaxValue !== b.y.isSystemMaxValue
          || a.y.levyFrqDscd !== b.y.levyFrqDscd)
        return null;
    } else return null; // 이외 타입은 aggregate 하지 않음.

    //구성조건 체크
    var diff = 0;
    var index = null;
    var target = Object.keys(a).filter(function(key) {
      return a[key].conditionTypeCode;
    });
    for (var i=0; i<target.length; i++) {
      var key = target[i];
      var va = a[key];
      var vb = b[key];

      if (va.conditionTypeCode === "01") { // 목록
        var la = va.listConditionValue.defineValues;
        var lb = vb.listConditionValue.defineValues;
        if (la.length !== lb.length) {
          diff++;
          index = key;
        }
        else {
          for (var j=0; j<la.length; j++) {
            if (la[j].code !== lb[j].code
                || la[j].isSelected !== lb[j].isSelected) {
              diff++;
              index = key;
              break;
            }
          }
        }

      } else if (va.conditionTypeCode === "02") { // 범위
        var ra = va.rangeConditionValue;
        var rb = va.rangeConditionValue;

        if (ra.conditionDetailTypeCode !== rb.conditionDetailTypeCode
            || ra.minValue !== rb.minValue
            || ra.maxValue !== rb.maxValue
            || ra.defalueValue !== rb.defalueValue
            || ra.increaseValue !== rb.increaseValue
            || ra.currencyValue !== rb.currencyValue
            || ra.productMeasurementUnit !== rb.productMeasurementUnit)
          diff++;
          index = key;

      }

      if (diff > 1) return null;
    }

    return index;
  };

  var iterate = function(list) {
    return list.reduce(function(l, now) {
      var prev = l.length ? l[l.length - 1] : null;
      if (prev) {
        var key = match(prev, now);
        if (key && prev[key].conditionTypeCode === "01") {
          var map = now[key].listConditionValue.defineValues.reduce(function(m, v) {
            if (v.isSelected)
              m[v.code] = true;
            return m;
          }, {});
          prev[key].listConditionValue.defineValues.forEach(function(v) {
            if (map[v.code])
              v.isSelected = true;
          });
        } else {
          l.push(now);
        }
      } else {
        l.push(now);
      }
      return l;
    }, []);
  };

  var prev, result = data;
  do {
    prev = result;
    result = iterate(result);
  } while (prev.length > result.length);

  return result;
}



onEvent('click', '.pf-cc-condition-view-history-btn', function(e) {
  renderConditionHistoryPopup();
});

onEvent("click", ".text-input-btn", function(e){
    var cntnt = $(".apply-rule").val() + $(e.currentTarget).val();
    $(".apply-rule").val(cntnt);

    // main.js - function setTokens() / 5505 line
    setTokens($(e.currentTarget).val()); // OHS20180416 추가 - 계산모듈처럼 적용

    var ruleContent = $(e.currentTarget).parent().parent().parent().find('.apply-rule').val();
    var count = 0;

    for(var i = 0 ; i < ruleContent.length ; i++){
        if (ruleContent.charAt(i) === '('){
            count++;
        }else if(ruleContent.charAt(i) === ')'){
            count--;
        }
    }

    if(count !== 0){
        $('.applyRuleSyntaxError').show();
        return;
    }

    if(ruleVerifier(ruleContent)){
        $('.applyRuleSyntaxError').hide();
    }else{
        $('.applyRuleSyntaxError').show();
    }
    modifyFlag = true;
});

onEvent("click", ".back-space-btn", function(e){

	// OHS 20180416 - 계산영역처럼 단위로 지움
	// 수기입력하였을때는 기존처럼 slice를 이용하여 지움
	var result = "";
    var delimiter = "";
    if(tokens && tokens.length > 0) {
    	$.each(tokens, function(index, token) {
    		if (token.type === TokenType.ARITHMETIC)
    			result += delimiter;
    			result += token.value;

	        if (token.type === TokenType.ARITHMETIC || token.type === TokenType.COMMA)
	        	result += delimiter;
    	});
    }

	if(tokens && tokens.length > 0 && result.replace(/ /gi, '') == $(".apply-rule").val().replace(/ /gi, '')) {
		tokens.pop();
		$(".apply-rule").val(PFFormulaEditor.toContent(tokens, " "));
	}
	else {
		var cntnt = $(".apply-rule").val().slice(0, -1);
	    $(".apply-rule").val(cntnt);
	}

    var ruleContent = $(e.currentTarget).parent().parent().parent().find('.apply-rule').val();
    var count = 0;

    for(var i = 0 ; i < ruleContent.length ; i++){
        if (ruleContent.charAt(i) === '('){
            count++;
        }else if(ruleContent.charAt(i) === ')'){
            count--;
        }
    }

    if(count !== 0){
        $('.applyRuleSyntaxError').show();
        return;
    }

    if(ruleContent == '') {
    	tokens = PFFormulaEditor.tokenize(''); // 초기화
    	$('.apply-rule-desc').val('');
    }

    if(ruleVerifier(ruleContent)){
        $('.applyRuleSyntaxError').hide();
    }else{
        $('.applyRuleSyntaxError').show();
    }
    modifyFlag = true;
});

// 적용규칙 검증
onEvent('keyup.xdsoft', '.apply-rule', function(e) {

    var ruleContent = $(e.currentTarget).parent().parent().find('.apply-rule').val();
    var count = 0;

    for(var i = 0 ; i < ruleContent.length ; i++){
        if (ruleContent.charAt(i) === '('){
            count++;
        }else if(ruleContent.charAt(i) === ')'){
            count--;
        }
    }

    if(count !== 0){
        $('.applyRuleSyntaxError').show();
        return;
    }

    if(ruleVerifier(ruleContent)){
        $('.applyRuleSyntaxError').hide();
    }else{
        $('.applyRuleSyntaxError').show();
    }
});

//OHS 20180418 - 적용규칙 값이 변경될때 값이 하나도없으면 tokens 초기화처리
onEvent('change', '.apply-rule', function(e) {
	if($(e.currentTarget).val() == '') {
		tokens = PFFormulaEditor.tokenize(''); // 초기화
		$('.apply-rule-desc').val('');
	}
});


function setInterestCombobox(data, $selector, varIntCndValueVO){

	var interestConditionValue;
	if(varIntCndValueVO){
		interestConditionValue = varIntCndValueVO;
	}else{
		interestConditionValue = data.interestConditionValue;
	}

	// 금리값
    if (!interestConditionValue.type || interestConditionValue.type == '01') {
        $selector.find('.interest-value-wrap').show();		// 금리값
        $selector.find('.interest-value-wrap .cnd-value-title').text(bxMsg('InterestValue'));

        $selector.find('.base-interest-type-wrap').hide();	// 기준금리
        $selector.find('.spread-info-wrap').hide();			// 스프레드
        $selector.find('.apply-limit-wrap').hide();			// 적용가능한도
        $selector.find('.interest-link-info-wrap').hide();	// 참조정보
    }
    // 기준금리연동
    else if (interestConditionValue.type == '02') {

        $selector.find('.interest-value-wrap').hide();		// 금리값
        $selector.find('.base-interest-type-wrap').show();	// 기준금리
        $selector.find('.spread-info-wrap').show();			// 스프레드
        setSprdAplyFormulaCombobox($selector);

        $selector.find('.apply-limit-wrap').show();			// 적용가능한도
        $selector.find('.interest-link-info-wrap').hide();	// 참조정보

    }
}

function setSprdAplyFormulaCombobox($selector, value){
    if(!value) {
        value = $selector.find('.SprdAplyFormulaCode').val();
    }
    if(value == ''){
        $selector.find('.minSprdRt').val('0.000000');
        $selector.find('.maxSprdRt').val('0.000000');
        $selector.find('.minSprdRt').prop('disabled', true);
        $selector.find('.maxSprdRt').prop('disabled', true);
    }else{
        $selector.find('.minSprdRt').prop('disabled', false);
        $selector.find('.maxSprdRt').prop('disabled', false);
    }
}

// 변동정보적용방식 선택에 따른 setting
function setInterestSegmentTypeCombobox($selector){

    // 변동정보적용방식 = 04.약정주기변동적용 일때
    if($selector.find('.InterestSegmentTypeCode').val() == '04'){
        // 변동주기참조조건코드 보임
        $selector.find('.varFrqRefCndCd').show();
        $selector.find('.varFrqRefCndNm').show();
    }else{
        // 변동주기참조조건코드 숨김
        $selector.find('.varFrqRefCndCd').hide();
        $selector.find('.varFrqRefCndNm').hide();
    }

}

// 고정기간데이터유형구분코드
function setFixTrmDataTpDscd($selector, value){
	if(!value){
		value = $selector.find('.fixTrmDataTpDscd').val();
	}

	// 지정값일때
	if(value == '01'){
		$selector.find('.fixTrmDataTpDscd-01').show();
		$selector.find('.fixTrmDataTpDscd-02').hide();

		$selector.find('.fix-irt-tr .refCndCd').val('');
		$selector.find('.fix-irt-tr .refCndNm').val('');
	}
	// 고정기간조건 -> 공통에선 제외
}

//기준금리데이터유형구분코드
function setBaseIntRateDataTpDscd($selector, value){
	if(!value){
		value = $selector.find('.baseIntRateDataTpDscd').val();
	}

	// 지정값일때
	if(value == '01'){
		$selector.find('.baseIntRateDataTpDscd-01').show();
		$selector.find('.baseIntRateDataTpDscd-02').hide();

		$selector.find('.refCndCd').val('');
		$selector.find('.refCndNm').val('');
	}
	// 고정기간조건
	else if(value == '02'){
		$selector.find('.baseIntRateDataTpDscd-01').hide();
		$selector.find('.baseIntRateDataTpDscd-02').show();

		$selector.find('.BaseIntRtKndCode').val('');
	}
}

// 기준금리 참조조건
onEvent('focus','.condition-value .fixed-info .condition-code',function(e){
	var submitEvent = function(data){
        if(!data) return;
        $(e.currentTarget).val(data.code);
        $('.fixed-info .condition-name').val(data.name);
    }

	makeConditionTemplateListSearchPopup(submitEvent, false, {});
});
onEvent('focus','.condition-value .var-info .condition-code',function(e){
	var submitEvent = function(data){
        if(!data) return;
        $(e.currentTarget).val(data.code);
        $('.var-info .condition-name').val(data.name);
    }

	makeConditionTemplateListSearchPopup(submitEvent, false, {});
});

// 수수료할인정보관리 추가버튼 클릭
onEvent('click', '.add-cnd4-fee-btn', function(e) {
    renderCnd4FeePopup();
});





/******************************************************************************************************************
 * 조건 > 우대금리 > 제공조건
 ******************************************************************************************************************/

/**
 * 우대금리 제공조건
 * @param treeItem
 */
function renderConditionType3_2GridPage(treeItem) {

    var $conditionInfoWrap = $el.find('.pf-cc-condition-info');
    cndType3Grid = null;

    $conditionInfoWrap.html(conditionType3_2Tpl());

    // 그리드
    cndType3Grid = renderConditionType3_2Grid(treeItem);

    // 적용규칙
    $('.apply-rule-info-wrap').html(cndApplyRuleTpl());     // 적용규칙 화면 render

    $('.apply-rule-info-wrap').find('.max-discount').hide();
    $('.apply-rule-info-wrap').find('.discount-amount[value="02"]').prop('checked', false);      // 금액 checked
    $('.apply-rule-info-wrap').find('.discount-rate[value="01"]').prop('checked', false);       // 율 unchecked
    $('.apply-rule-info-wrap').find('.pf-cp-apply-rule-grapic-view-btn').hide();

    $('.apply-rule-info-wrap .min').hide();
    $('.apply-rule-info-wrap .max').hide();
    $('.apply-rule-info-wrap .avg').hide();
    $('.apply-rule-info-wrap .sum').hide();

    $('.applyRuleSyntaxError').hide();

    $('.apply-rule-info-wrap').find('.rule-apply-target-distinction-code').val('04');
    PFUtil.getDatePicker(true);
    PFUtil.getAllDatePicker(true, $('.pf-cp-condition-type3-2tpl .common-header-group'));
    $('.bnft-prov-cnd-search').val(XDate(Date()).toString("yyyy-MM-dd")+ " 00:00:00");

    // 우대금리제공조건 엔터누를경우 조회
    $('.bnft-prov-cnd-search').on('keydown.xdsoft', function(e) {
        if (e.keyCode == '13') {
            if($('.bnft-prov-cnd-search').val()) {
                detailRequestParam.applyStartDate = $('.bnft-prov-cnd-search').val();
            }
            else {
                delete detailRequestParam.applyStartDate;
            }
            PFRequest.get('/benefit/queryListBenefitProvideCnd.json', detailRequestParam, {
                success: function(data) {
                    cndType3Grid.setData(data);
                },
                bxmHeader: {
                    application: 'PF_Factory',
                    service: 'BenefitProvideCndService',
                    operation: 'queryListBenefitProvideCnd'
                }
            });
        }
    });

    renderComboBox('ProductStatusCode', $('.apply-rule-info-wrap .status'));
    $conditionInfoWrap.find('.apply-rule')[0].placeholder = bxMsg('noneApplyRule');
    searchApplyRule(treeItem);	// 조회

    if(writeYn != 'Y' || detailRequestParam.writeYn == 'N'){
        $('.write-btn').hide();
    }

    if (treeItem && !treeItem.conditionGroupCode) {
        $conditionInfoWrap.find('.add-cnd3-prvdCnd-btn').prop('disabled', true);
        return;
    }

    if (treeItem) {
        detailRequestParam = {
            conditionGroupTemplateCode: treeItem.conditionGroupTemplateCode,
            conditionGroupCode: treeItem.conditionGroupCode,
            conditionCode: treeItem.conditionCode,
            tntInstId: treeItem.tntInstId
        };
    }

}

// 우대금리 제공조건 그리드
function renderConditionType3_2Grid(treeItem, renderTo){
    var grid = PFComponent.makeExtJSGrid({
        fields: ['providedConditionCode','providedConditionName','process',
            'providedConditionStatusCode', 'applyStartDate',
            'applyEndDate', 'providedConditionTypeCode', 'providedConditionDetailTypeCode',
            'productBenefitProvidedListConditionList', 'mesurementUnitCode',
            'isAdditionalInfoExist','provideCndAdditionalInfoDetailList', 'providedConditionSequenceNumber',
            {
                name: 'maxValue',
                convert: function(newValue, record) {
                    if (newValue) {
                        return newValue;
                    } else {
                        if (!record || !newValue) {
                            var val = '0.00';
                        }
                        return val;
                    }
                }
            },
            {
                name: 'minValue',
                convert: function(newValue, record) {
                    if (newValue) {
                        return newValue;
                    } else {
                        if (!record || !newValue) {
                            var val = '0.00';
                        }
                        return val;
                    }
                }
            }
        ],
        gridConfig: {
            renderTo: renderTo ? renderTo : '.condition-type3-2grid-wrap',
            columns: [
                {
                    text: bxMsg('DAS0101String11'),   // 일련번호
                    flex: 0.6,
                    dataIndex: 'providedConditionSequenceNumber'
                },
                {
                    text: bxMsg('providedConditionCode'),   // 제공조건코드
                    flex: 0.6,
                    dataIndex: 'providedConditionCode'
                },
                {
                    text : bxMsg('DPS0101String6'),         // 상태
                    width : 70,
                    align: 'center',
                    dataIndex : 'providedConditionStatusCode',
                    renderer : function(value){
                        return codeMapObj['ProductStatusCode'][value];
                    }
                },
                {
                    text: bxMsg('providedConditionName'),   // 제공조건명
                    flex: 0.6,
                    dataIndex: 'providedConditionName'
                },
                {
                    text: bxMsg('DPP0127String6'), flex: 1, dataIndex: 'applyStartDate'
                },
                {
                    text: bxMsg('DPP0127String7'), flex: 1, dataIndex: 'applyEndDate'
                },
                {
                    text: bxMsg('providedConditionVal'),
                    flex: 1,
                    renderer: function (value, p, record) {
                        var yVal = '', extFormat, yTitle1 = '', yVal1 = '';
                        var conditionTypeCode = record.get('providedConditionTypeCode');

                        if (conditionTypeCode == '01') {

                            if (record.get('productBenefitProvidedListConditionList')) {
                                record.get('productBenefitProvidedListConditionList').forEach(function (el) {
                                    yVal = yVal + '['+el.listCode+']'+ el.listCodeName + '，';
                                });

                                if (yVal != '' && yVal.length > 0) {
                                    yVal = yVal.substring(0, yVal.length - 1);
                                }
                            }

                            extFormat = Ext.String.format('<p class="ext-condition-value-column">{0}</p>', yVal);
                        } else {
                            var minString, maxString;

                            minString = record.get('minValue');
                            maxString = record.get('maxValue');

                            yTitle1 = bxMsg('DPS0129Unit1String1') + ' : ';
                            yVal1 = minString + '~' + maxString;

                            extFormat = Ext.String.format('<p class="ext-condition-value-column">{0} {1} </p>', yTitle1, yVal1);
                        }

                        return extFormat;
                    }
                },
                {
                    xtype: 'checkcolumn',
                    text: bxMsg('DPM10002Sring8'),
                    width: 60,
                    dataIndex: 'isAdditionalInfoExist' // 부가정보존재여부
                }
            ],
            listeners: {
                scope: this,
                'celldblclick': function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    if(cellIndex === 6){
                       	tokens = PFFormulaEditor.tokenize(''); // 초기화
                        if(writeYn != 'Y' || detailRequestParam.writeYn == 'N'){
                            renderProvCndPopup(record.data, true);
                        }else{
                            renderProvCndPopup(record.data, false);
                        }
                    }else{
                        var cntnt = $('.apply-rule').val() + "#"+record.get('providedConditionSequenceNumber');
                        $('.apply-rule').val(cntnt);

                        // OHS20180416 추가 - 계산영역처럼 적용
                        tokens.push({
                            type: TokenType.CONDITION,
                            value: "#"+record.get('providedConditionSequenceNumber')
                        });
                    }
                },
                'viewready': function(_this, eOpts){

                    if (treeItem) {
                        detailRequestParam = {
                            conditionGroupTemplateCode: treeItem.conditionGroupTemplateCode,
                            conditionGroupCode: treeItem.conditionGroupCode,
                            conditionCode: treeItem.conditionCode,
                            tntInstId: treeItem.tntInstId,
                            writeYn: treeItem.writeYn
                        };

                        if($('.bnft-prov-cnd-search').val()) {
                            detailRequestParam.applyStartDate = $('.bnft-prov-cnd-search').val(); // 조회기준일 추가
                        }
                        else {
                            delete detailRequestParam.applyStartDate;
                        }
                    }

                    // 우대금리 제공조건 그리드 조회
                    PFRequest.get('/benefit/queryListBenefitProvideCnd.json', detailRequestParam, {
                        success: function(data) {
                            grid.setData(data);
                            deleteConditionList = [];
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'BenefitProvideCndService',
                            operation: 'queryListBenefitProvideCnd'
                        }
                    });

                }
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                        beforeedit:function(e, editor){
                            //if(editor.record.get('process') != 'C'
                            //    && editor.field == 'applyStartDate') {
                            //    return false;
                            //}

                            if(editor.record.field == 'isAdditionalInfoExist'){
                                return false;
                            }
                        },
                        afteredit: function(e, editor){
                            if(editor.originalValue !=  editor.value && editor.record.get('process') != 'C'){
                                editor.record.set('process', 'U');
                            }
                        }
                    }
                })
            ]
        } // gridcinfig end
    }); // 그리드 end

    return grid;
}

// 우대금리제공조건그리드 저장
var deleteConditionList = [];
function saveBenefitProvideCnd(projectId){

    var formData = {};

    // 제공조건그리드
    if (cndType3Grid) {

        formData.projectId = projectId;
        formData.conditionGroupTemplateCode = selectedCondition.conditionGroupTemplateCode;
        formData.conditionGroupCode = selectedCondition.conditionGroupCode;
        formData.conditionCode = selectedCondition.id;
        formData.productBenefitProvidedConditonList = cndType3Grid.getAllData().concat(deleteConditionList);

        if(productBenefitProvidedConditonList.length == 0){
        	// 변경된 정보가 없습니다.
    		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
    		return;
        }

        formData.productBenefitProvidedConditonList.forEach(function(el) {

            el.conditionGroupTemplateCode = selectedCondition.conditionGroupTemplateCode;
            el.conditionGroupCode = selectedCondition.conditionGroupCode;
            el.conditionCode = selectedCondition.id;

            if (el.productBenefitProvidedListConditionList == '') {
                delete el.productBenefitProvidedListConditionList;
            } else {
                delete el.maxValue;
                delete el.minValue;
            }

            delete el.conditionDetailTypeCode;
            delete el.y;
        });

        PFRequest.post('/benefit/saveBenefitProvideCnd.json', formData, {
            success: function(responseData) {
                if (responseData) {
                    PFComponent.showMessage(bxMsg('workSuccess'),  'success');
                    deleteConditionList = [];
                    modifyFlag = false;

                    // 우대금리 제공조건 그리드 조회 (일련번호 바인딩을 위함)
                    delete formData.productBenefitProvidedConditonList;

                    if($('.bnft-prov-cnd-search').val()) {
                        formData.applyStartDate = $('.bnft-prov-cnd-search').val();
                    }
                    else {
                        delete formData.applyStartDate;
                    }

                    PFRequest.get('/benefit/queryListBenefitProvideCnd.json', formData, {
                        success: function(data) {
                            cndType3Grid.setData(data);
                        },
                        bxmHeader: {
                            application: 'PF_Factory',
                            service: 'BenefitProvideCndService',
                            operation: 'queryListBenefitProvideCnd'
                        }
                    });
                }
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'BenefitProvideCndService',
                operation: 'saveBenefitProvideCnd'
            }
        });
    }
}

// 우대금리 제공조건 추가버튼 클릭
onEvent('click', '.add-cnd3-prvdCnd-btn', function(e) {

    var submitEvent = function(selectedData) {

        var data = selectedData[0];

        data['applyStartDate'] = PFUtil.getNextDate() + ' 00:00:00';
        data['applyEndDate'] = '9999-12-31 23:59:59';
        data['process'] = 'C';
        data['cndDscd'] = '01';

        data['providedConditionTypeCode'] = data.type;
        data['providedConditionCode'] = data.code;
        data['providedConditionName'] = data.name;
        data['providedConditionStatusCode'] = '01';  // 조건의 active 상태가 아님 -> 제공조건의 상태는 최소 01.수정가능으로 서비스에서 생성함.
        data['providedConditionDetailTypeCode'] = data.conditionDetailTypeCode;
        data['provideCndAdditionalInfoDetailList'] = [];

        delete data['content'];
        delete data['code'];
        delete data['name'];
        delete data['type'];
        delete data['typeNm'];
        delete data['conditionDetailTypeCode'];

        renderProvCndPopup(data);
        modifyFlag = true;
    };

    renderCndPopup(submitEvent);
});

// 우대금리 제공조건 저장 버튼 클릭
onEvent('click', '.bnft-prov-cnd-save-btn', function(e) {
    var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
    if(isNotMyTask(projectId)){
        return;
    };

    saveBenefitProvideCnd(projectId);        // 제공조건 그리드 저장
});



// 기관코드 콤보 바인딩
function setTntInstComboBox() {
    tntInstId = getLoginTntInstId();
    renderTntInstComboBox($el.find('.pf-multi-entity'), tntInstId);

    if (!getMortherYn()) {
        $el.find('.pf-multi-entity-yn').hide();
    }
}


function isNotNegativeRangeType(conditionDetailTypeCode){
    if(conditionDetailTypeCode != '01' && conditionDetailTypeCode != '04' && conditionDetailTypeCode != '05'){
        return true;
    }else{
        return false;
    }
}


// CLEARABLE INPUT
function tog(v){return v?'addClass':'removeClass';}
$(document).on('input', '.clearable', function(){
    $(this)[tog(this.value)]('x');
}).on('mousemove', '.x', function( e ){
    $(this)[tog(this.offsetWidth-18 < e.clientX-this.getBoundingClientRect().left)]('onX');
}).on('touchstart click', '.onX', function( ev ){
    ev.preventDefault();
    $(this).removeClass('x onX').val('').change();

    if($('.product-import-file-upload-div').find('.pfui-queue-item')[0]){
        var item = $('.product-import-file-upload-div').find('.pfui-queue-item')[0];
        $(item).remove();
        $('.product-import-upload-file-form').val('');
        // import flow steps area clean and grid area display
        $('.pf-product-import-grid-wrap').css('display', 'none');
        $('.product-import-flow-steps').html('');
        currentFlowStep = 0;
        initImport = true;
    }
});

// 개발과제가 Emergency 일 때
function fnEmergencyControlForProvCnd(flag){

    if(flag) {
        $('.write-btn').prop('disabled', false);
        if(isNewData) {
            $('.prov-cnd-mod-btn').prop('disabled', true);
        } else if($('.prov-cnd-status').val() == '01'){
            $('.prov-cnd-reg-btn').prop('disabled', true);
        } else if($('.prov-cnd-status').val() == '04'){
            $('.prov-cnd-mod-btn').prop('disabled', false);
            $('.prov-cnd-delete-btn').prop('disabled', false);
        }
    }
    else{
        if(isNewData){
            $('.prov-cnd-reg-btn').prop('disabled', false);
        } else if($('.prov-cnd-status').val() == '04'){
            $('.prov-cnd-reg-btn').prop('disabled', false);
            $('.prov-cnd-delete-btn').prop('disabled', true);
            $('.prov-cnd-mod-btn').prop('disabled', false);
        }
    }

}

// 조건속성 설정
function fnSetCndAtrb(){
    var $conditionInfoWrap = $el.find('.pf-cc-condition-info');

    codeArrayObj['CndAttribute'].forEach(function(el){
        if(parent.g_cndAtrb['cndAtrb-'+el.code] && parent.g_cndAtrb['cndAtrb-'+el.code] != 'Y'){
            $conditionInfoWrap.find('.cndAtrb-'+el.code).hide();
        }
    });
}

//금리 정보  탭
function renderCndValueType3Tab($cndValueType3Wrap, data){

	var varIntCndValueVO = {
			type : '01'
	};

	var interestConditionValue = {
		rateApplyWayCode : '01',
		type : '01',
		varIntCndValueVO : varIntCndValueVO
	};

	if(data){
		if(data.interestConditionValue){
			interestConditionValue = data.interestConditionValue;

			if(!interestConditionValue.rateApplyWayCode){
				interestConditionValue.rateApplyWayCode = '01';
			}

			if(interestConditionValue.varIntCndValueVO){
				varIntCndValueVO = interestConditionValue.varIntCndValueVO;
			}
		}else{
			data.interestConditionValue = interestConditionValue;
		}
	}else{
		data = {
			interestConditionValue : interestConditionValue
		};
	}



	PFUI.use('pfui/tab',function(Tab){

		var children =  [];

		// 고정 or 고정후변동
		if(interestConditionValue.rateApplyWayCode == '01' || interestConditionValue.rateApplyWayCode == '03'){
			children.push({text:bxMsg('fixedInfo'),value:interestConditionValue,index:0}); 			// 고정 정보
		}
		// 변동 or 고정후 변동
		if(interestConditionValue.rateApplyWayCode == '02' || interestConditionValue.rateApplyWayCode == '03'){
			children.push({text:bxMsg('DPS0121_3BString2'),value:interestConditionValue, index:1}); // 변동 정보
		}

		$cndValueType3Wrap.find('#cnd-value-type3-tab').empty();
		$cndValueType3Wrap.find('#cnd-value-type3-tab-conts #fixed-info-panel').empty();
		$cndValueType3Wrap.find('#cnd-value-type3-tab-conts #var-info-panel').empty();

        var tab = new Tab.Tab({
            render : $cndValueType3Wrap.find('#cnd-value-type3-tab'),
            elCls : 'nav-tabs',
            autoRender: true,
            children:children
        });

        tab.on('selectedchange',function (ev) {
            var item = ev.item;

            if(item.get('index') == 0){
            	$cndValueType3Wrap.find('#fixed-info-panel').show();
            	$cndValueType3Wrap.find('#var-info-panel').hide();
            	$cndValueType3Wrap.find('#ref-info-panel').hide();

            	if(!$cndValueType3Wrap.find('#fixed-info-panel').html()){
                    $cndValueType3Wrap.find('#fixed-info-panel').html(cndValueType3FixedInfoTpl(interestConditionValue));

                    renderComboBox('InterestTypeCode', $('.fixed-info .InterestTypeCode'), (interestConditionValue.type) ? interestConditionValue.type : ''); // 금리데이터유형코드
                    $('.fixed-info .InterestTypeCode option[value="03"]').remove();    // 공통에서는 03.타상품금리연동 제외

                	renderComboBox('BaseIntRtKndCode', $('.fixed-info .BaseIntRtKndCode'), (interestConditionValue.baseRateCode) ? interestConditionValue.baseRateCode : ''); // 기준금리종류
                	renderComboBox('BaseIntRtAplyTmCode', $('.fixed-info .BaseIntRtAplyTmCode'), (interestConditionValue.baseIntRtAplyTmCd) ? interestConditionValue.baseIntRtAplyTmCd : ''); // 기준금리적용시점코드
                	renderComboBox('SprdAplyFormulaCode', $('.fixed-info .SprdAplyFormulaCode'), (interestConditionValue.sprdAplyFormulaCd) ? interestConditionValue.sprdAplyFormulaCd : '', true); // 스프레드적용산식
                	renderComboBox('RefTrmAplyDscd', $('.fixed-info .RefTrmAplyDscdEnum'), (interestConditionValue.refTrmAplyDscd) ? interestConditionValue.refTrmAplyDscd : ''); // 참조기간적용구분코드
                	renderComboBox('RefTrmMsurUtCode', $('.fixed-info .RefTrmMsurUtCode'), (interestConditionValue.refTrmMsurUtCd) ? interestConditionValue.refTrmMsurUtCd : ''); // 측정단위
                	renderComboBox('BaseIntRateDataTpDscd', $('.fixed-info .baseIntRateDataTpDscd'), (interestConditionValue.baseIntRateDataTpDscd) ? interestConditionValue.baseIntRateDataTpDscd : '01');

                	// 고정일 때
                	if(interestConditionValue.rateApplyWayCode == '01'){
                		$cndValueType3Wrap.find('.fixed-info .fix-irt-tr').hide();		// 고정정보 > 최초고정금리적용기간수
                	}
                	// 고정후변동일 때
                	else{
                		$cndValueType3Wrap.find('.fixed-info .fix-irt-tr').show();		// 고정정보 > 최초고정금리적용기간수
                		renderComboBox('FrstFixIRtAplyTrmDscd',$('.fixed-info .frstFixIrtAplyTrmDscd'),(interestConditionValue.frstFixIrtAplyTrmDscd) ? interestConditionValue.frstFixIrtAplyTrmDscd : '');
                		renderComboBox('FixTrmDataTpDscd', $('.fixed-info .fix-irt-tr .fixTrmDataTpDscd'), '01');	// 01로 고정
                		$('.fixed-info .fixTrmDataTpDscd option[value="02"]').remove();    // 공통에서는 02.고정기간조건 제외

                		if(interestConditionValue.refCndCd){
                            bindConditionName($cndValueType3Wrap.find('.fixed-info .refCndCd'), $cndValueType3Wrap.find('.fixed-info .refCndNm'));
                        }
                	}

                	setInterestCombobox(data, $cndValueType3Wrap.find('#fixed-info-panel'));
                	setFixTrmDataTpDscd($cndValueType3Wrap.find('.fixed-info  .fix-irt-tr'), '01'); // 01로 고정
                	setBaseIntRateDataTpDscd($cndValueType3Wrap.find('.fixed-info'), (interestConditionValue.baseIntRateDataTpDscd) ? interestConditionValue.baseIntRateDataTpDscd : '01');
            	}
            }
            else if(item.get('index') == 1){
            	$cndValueType3Wrap.find('#fixed-info-panel').hide();
            	$cndValueType3Wrap.find('#var-info-panel').show();
            	$cndValueType3Wrap.find('#ref-info-panel').hide();

                if(!$cndValueType3Wrap.find('#var-info-panel').html()){

                	// 변동 -> 변동영역 set
            		if(interestConditionValue.rateApplyWayCode == '02'){
            			$cndValueType3Wrap.find('#var-info-panel').html(cndValueType3VarInfoTpl(interestConditionValue));
            			renderComboBox('InterestTypeCode', $('.var-info .InterestTypeCode'), (interestConditionValue.type) ? interestConditionValue.type : ''); // 금리데이터유형코드
            			$('.var-info .InterestTypeCode option[value="03"]').remove();    // 공통에서는 03.타상품금리연동 제외

                        renderComboBox('InterestSegmentTypeCode', $('.var-info .InterestSegmentTypeCode'), (interestConditionValue.rateSegmentType) ? interestConditionValue.rateSegmentType : ''); // 변동정보 적용방식
                        renderComboBox('VarIntRtCyclCalcnBaseCode', $('.var-info .VarIntRtCyclCalcnBaseCode'), (interestConditionValue.varIntRtCyclCalcnBaseCd) ? interestConditionValue.varIntRtCyclCalcnBaseCd : ''); // 변동주기 산정기준
                        renderComboBox('BaseIntRtKndCode', $('.var-info .BaseIntRtKndCode'), (interestConditionValue.baseRateCode) ? interestConditionValue.baseRateCode : ''); // 기준금리종류
                        renderComboBox('BaseIntRtAplyTmCode', $('.var-info .BaseIntRtAplyTmCode'), (interestConditionValue.baseIntRtAplyTmCd) ? interestConditionValue.baseIntRtAplyTmCd : ''); // 기준금리적용시점코드
                        renderComboBox('SprdAplyFormulaCode', $('.var-info .SprdAplyFormulaCode'), (interestConditionValue.sprdAplyFormulaCd) ? interestConditionValue.sprdAplyFormulaCd : '', true); // 스프레드적용산식
                        renderComboBox('RefTrmAplyDscd', $('.var-info .RefTrmAplyDscdEnum'), (interestConditionValue.refTrmAplyDscd) ? interestConditionValue.refTrmAplyDscd : ''); // 참조기간적용구분코드
                        renderComboBox('RefTrmMsurUtCode', $('.var-info .RefTrmMsurUtCode'), (interestConditionValue.refTrmMsurUtCd) ? interestConditionValue.refTrmMsurUtCd : ''); // 측정단위
                        renderComboBox('BaseIntRateDataTpDscd', $('.var-info .baseIntRateDataTpDscd'), (interestConditionValue.baseIntRateDataTpDscd) ? interestConditionValue.baseIntRateDataTpDscd : '01');

                        setInterestCombobox(data, $cndValueType3Wrap.find('#var-info-panel'));
                        setBaseIntRateDataTpDscd($cndValueType3Wrap.find('.var-info'), (interestConditionValue.baseIntRateDataTpDscd) ? interestConditionValue.baseIntRateDataTpDscd : '01');

                        // 변동주기참조조건코드 네이밍
                        if(interestConditionValue.varFrqRefCndCd){
                            bindConditionName($cndValueType3Wrap.find('.var-info .varFrqRefCndCd'), $cndValueType3Wrap.find('.varFrqRefCndNm'));
                        }

                        // 기준금리참조조건코드 네이밍
                        if(interestConditionValue.refCndCd){
                            bindConditionName($cndValueType3Wrap.find('.var-info .refCndCd'), $cndValueType3Wrap.find('.var-info .refCndNm'));
                        }
            		}
            		// 고정후변동  -> 변동영역 set
            		if(interestConditionValue.rateApplyWayCode == '03'){
            			$cndValueType3Wrap.find('#var-info-panel').html(cndValueType3VarInfoTpl(varIntCndValueVO));
            			renderComboBox('InterestTypeCode', $('.var-info .InterestTypeCode'), (varIntCndValueVO.type) ? varIntCndValueVO.type : ''); // 금리데이터유형코드
            			$('.var-info .InterestTypeCode option[value="03"]').remove();    // 공통에서는 03.타상품금리연동 제외

                        renderComboBox('InterestSegmentTypeCode', $('.var-info .InterestSegmentTypeCode'), (varIntCndValueVO.rateSegmentType) ? varIntCndValueVO.rateSegmentType : ''); // 변동정보 적용방식
                        renderComboBox('VarIntRtCyclCalcnBaseCode', $('.var-info .VarIntRtCyclCalcnBaseCode'), (varIntCndValueVO.varIntRtCyclCalcnBaseCd) ? varIntCndValueVO.varIntRtCyclCalcnBaseCd : ''); // 변동주기 산정기준
                        renderComboBox('BaseIntRtKndCode', $('.var-info .BaseIntRtKndCode'), (varIntCndValueVO.baseRateCode) ? varIntCndValueVO.baseRateCode : ''); // 기준금리종류
                        renderComboBox('BaseIntRtAplyTmCode', $('.var-info .BaseIntRtAplyTmCode'), (varIntCndValueVO.baseIntRtAplyTmCd) ? varIntCndValueVO.baseIntRtAplyTmCd : ''); // 기준금리적용시점코드
                        renderComboBox('SprdAplyFormulaCode', $('.var-info .SprdAplyFormulaCode'), (varIntCndValueVO.sprdAplyFormulaCd) ? varIntCndValueVO.sprdAplyFormulaCd : '', true); // 스프레드적용산식
                        renderComboBox('RefTrmAplyDscd', $('.var-info .RefTrmAplyDscdEnum'), (varIntCndValueVO.refTrmAplyDscd) ? varIntCndValueVO.refTrmAplyDscd : ''); // 참조기간적용구분코드
                        renderComboBox('RefTrmMsurUtCode', $('.var-info .RefTrmMsurUtCode'), (varIntCndValueVO.refTrmMsurUtCd) ? varIntCndValueVO.refTrmMsurUtCd : ''); // 측정단위
                        renderComboBox('BaseIntRateDataTpDscd', $('.var-info .baseIntRateDataTpDscd'), (varIntCndValueVO.baseIntRateDataTpDscd) ? varIntCndValueVO.baseIntRateDataTpDscd : '01');

                        setInterestCombobox(data, $cndValueType3Wrap.find('#var-info-panel'), varIntCndValueVO);
                        setBaseIntRateDataTpDscd($cndValueType3Wrap.find('.var-info'), (varIntCndValueVO.baseIntRateDataTpDscd) ? varIntCndValueVO.baseIntRateDataTpDscd : '01');

                        // 변동주기참조조건코드 네이밍
                        if(varIntCndValueVO.varFrqRefCndCd){
                            bindConditionName($cndValueType3Wrap.find('.var-info .varFrqRefCndCd'), $popup.find('.varFrqRefCndNm'));
                        }

                        // 기준금리참조조건코드 네이밍
                        if(varIntCndValueVO.refCndCd){
                            bindConditionName($cndValueType3Wrap.find('.var-info .refCndCd'), $cndValueType3Wrap.find('.var-info .refCndNm'));
                        }
            		}



            		setInterestSegmentTypeCombobox($cndValueType3Wrap);
                }

            }else if(item.get('index') == 2){
            	$cndValueType3Wrap.find('#fixed-info-panel').hide();
            	$cndValueType3Wrap.find('#var-info-panel').hide();
            	$cndValueType3Wrap.find('#ref-info-panel').show();

                if(!$('#ref-info-panel').html()){
                	$cndValueType3Wrap.find('#ref-info-panel').html(cndValueType3RefInfoTpl(interestConditionValue));
                	renderComboBox('InterestTypeCode', $('.ref-info .InterestTypeCode'), (interestConditionValue.type) ? interestConditionValue.type : '03'); // 금리데이터유형코드
                	$cndValueType3Wrap.find('.ref-info .InterestTypeCode').prop('disabled', true);            // 금리데이터유형코드 disabled
                }
            }
        });

        tab.setSelected(tab.getItemAt(0));

    });
}

function setTokens(value) {
	//OHS 20180416 추가 - 계산영역처럼 적용함
	var operatorSet = new Set();
	operatorSet.add('min');
	operatorSet.add('max');
	operatorSet.add('avg');
	operatorSet.add('sum');
	operatorSet.add('and');
	operatorSet.add('or');
	operatorSet.add('not');
	operatorSet.add('priority');
	operatorSet.add('match');

	var s = value != '' ? value.toLowerCase() : '';
	var type;

	if (operatorSet.has(s)) { // function
	  type = TokenType.FUNCTION;

	} else if (s === "(") {
	  type = TokenType.OPEN_BRACKET;

	} else if (s === ")") {
	  type = TokenType.CLOSE_BRACKET;

	} else if (s === ",") {
	  type = TokenType.COMMA;

	} else if (s === "+" || s === "-" || s === "*" || s === "/") {
	  type = TokenType.ARITHMETIC;
	} else {
	  type = TokenType.NUMBER;
	}
	s = s.toUpperCase();
	tokens.push({
	  type: type,
	  value: s
	});
}