/**
 * eav model java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
var $loadingDim = $('#loading-dim');

$(function() {
	$loadingDim.show();
    $('body').css('overflow-y', 'scroll');
    lengthVlad('.length-check-input', 50);
    PFComponent.toolTip($el);

    // Start Rendering Page
    renderEAVObjectTreeBox();

	// 초기조회 추가
    queryEavObjectList();
});

var selectedCellIndex;

var $el = $('.pf-eav-model');	// Page Root jQuery Element

var objectLeftTreeTpl,              // EAV 모델관리 오브젝트 트리
	objectDetailInfoTpl,			// EAV 모델 상세정보 영역
	objectDetailManagementPopupTpl;	// 오브젝트 상세정보 관리

var navTree, navTreeStore;

var loginTntInstId, tntInstId, mother, child;

var gObjectId, gObjectName;

var clickEventForNewData = {};

var onEvent = PFUtil.makeEventBinder($el);

var lengthVlad = PFValidation.realTimeLengthCheck($el);

var attributeTpDscdComboDatas = []; 	// 속성유형구분코드 콤보
var dataTpDscdComboDatas = [];			// 데이터타입구분코드 콤보


// 그리드
var objectAttributeRelGrid,		// 오브젝트<>속성 관계 그리드
	eavScreenConfigGrid;		// EAV 화면구성 그리드

// 그리드용 삭제목록
var objAttributeRelDelList = [],	// 오브젝트<>속성관계 삭제목록
	attributeDeleteList = [];		// 속성삭제목록

var eavManagementGrid;

// Load Template in HTML
objectLeftTreeTpl = getTemplate('objectLeftTreeTpl');
objectDetailInfoTpl = getTemplate('objectDetailInfoTpl');
objectDetailManagementPopupTpl = getTemplate('objectDetailManagementPopupTpl');


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

// 새로고침 버튼 클릭
onEvent('click', '.refresh-icon', function(){
    $el.find('.eav-object-search-name').val('');
    $el.find('.eav-attribute-search-name').val('');
    queryEavObjectList();
});

// 오브젝트 검색
onEvent('click', '.eav-object-search-btn', function(){
	queryEavObjectList();
});

onEvent('keypress', '.eav-attribute-search-name', function(e) {
    if (e.keyCode == 13){
    	queryEavObjectList();
    }
});

onEvent('keypress', '.eav-object-search-name', function(e) {
    if (e.keyCode == 13){
    	queryEavObjectList();
    }
});


// 검색버튼
onEvent('click', '.eav-entity-attribute-relation-search-btn', function() {
	if($('#eav-grid-tab .active').index() === 0){
		// 오브젝트<>속성 관계 조회
		searchObjectAttributeRelList();

	} else if($('#eav-grid-tab .active').index() === 1){
		// EAV 화면구성 조회
		searchEAVScreenConfigInfoList();
	}
});

// 오브젝트<>속성 관계 추가버튼
onEvent('click', '.add-detail-btn', function() {

	// 속성관리 POPUP
	renderAttributeManagePopup();
});

// 20180205 - EAV 화면구성 미리보기 버튼
onEvent('click', '.preview-screen-btn', function() {
	renderPreviewPopup();
});

// 저장버튼
onEvent('click', '.detail-save-btn', function() {
	if($('#eav-grid-tab .active').index() === 0){
		// 오브젝트<>속성 관계 저장
		saveObjectAttributeRelInfo();

	} else if($('#eav-grid-tab .active').index() === 1){
		// EAV 화면구성 저장
		saveEAVScreenConfigInfo();
	}
});



// [팝업] 오브젝트 신규버튼 클릭
onEvent('click', '.create-eav-object-btn', function() {
	if(loginTntInstId != tntInstId){
		PFComponent.showMessage(bxMsg('AccessError'), 'warning');
		return;
	}

	// 오브젝트 관리 POPUP
	var data = {work: "CREATE"};
	renderObjectManagePopup(data);
});




/******************************************************************************************************************
 * BIZ 함수
 ******************************************************************************************************************/
/**
 * 오브젝트 목록조회
 */
function queryEavObjectList() {
    traceTree.completeTrace = true;
    renderObjectNavTree.isRendered = false;
    renderObjectNavTree();
}

// 오브젝트 저장
function saveObject(work, that){

    var form = PFComponent.makeYGForm($('.pf-eav-object-manage-form'));
    var mandatoryCheck = true;

    var formData = form.getData();
    if(!formData.objectId.split(' ').join('')) {
    	// 오브젝트ID는 필수입력값 입니다.
    	PFComponent.showMessage(bxMsg('mandatoryObjectId'), 'warning');
    	return;
    }
    if(!formData.objectName.split(' ').join('')) {
    	// 오브젝트명은 필수입력값 입니다.
    	PFComponent.showMessage(bxMsg('mandatoryObjectNm'), 'warning');
    	return;
    }
    if(!formData.objectTypeDscd.split(' ').join('')) {
    	// 오브젝트유형구분은 필수입력값 입니다.
    	PFComponent.showMessage(bxMsg('mandatoryObjectTypeDscd'), 'warning');
    	return;
    }

    var requestUrl, bxmHeader;

    if (work == "CREATE") {
        requestUrl = "/eav/createEntity.json";
        bxmHeader = {
            application: 'PF_Factory',
            service: 'EAVService',
            operation: 'createEntity'
        };

    } else if (work == "UPDATE") {
        requestUrl = "/eav/updateEntity.json";
        bxmHeader = {
            application: 'PF_Factory',
            service: 'EAVService',
            operation: 'updateEntity'
        };
    }

    var requestData = form.getData();
    requestData.tntInstId = tntInstId;

    if (mandatoryCheck) {
        PFRequest.post(requestUrl, requestData, {
            success: function(result){

                PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');

                if(that) {
                    that.close();
                }

                traceTree.traceList = [result];
                traceTree.depth = 0;
                traceTree.completeTrace = false;

                renderObjectNavTree.isRendered = false;
                renderObjectNavTree();

            },

            bxmHeader : bxmHeader
        });
    }
}

// 오브젝트삭제
function deleteObject(id) {

    var requestData = {
    		objectId: treeItem.id,
        tntInstId: tntInstId
    };

    PFRequest.post('/eav/deleteEntity.json', requestData, {
        success : function (responseMessage) {
            if (responseMessage) {
                PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');                                        // 삭제에 성공하였습니다.

                var pathArr = [];
                treeItem.path.forEach(function(path){
                    if(path && path != id){
                        pathArr.push(path);
                    }
                });

                traceTree.traceList = pathArr;
                traceTree.depth = 0;
                traceTree.completeTrace = false;

                renderObjectNavTree.isRendered = false;
                renderObjectNavTree();

                $el.find('.pf-eav-model-info-wrap').removeClass('active');
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'EAVService',
            operation: 'deleteEntity'
        }
    });
}

// 오브젝트<>속성 관계 저장
function saveObjectAttributeRelInfo() {
    var requestParam = {};

    requestParam.objectId = gObjectId;

    // 그리드데이터
    var gridData = objectAttributeRelGrid.getAllData();

    requestParam['voList'] = gridData.concat(objAttributeRelDelList);

    // 상품관계 저장 서비스 호출
    PFRequest.post('/eav/saveObjectAttributeRelation.json',requestParam,{
        success : function(responseData) {
            PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
            objAttributeRelDelList = [];
            searchObjectAttributeRelList();

        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'EAVService',
            operation: 'saveObjectAttributeRelation'
        }
    });
}

// 오브젝트<>속성 관계 조회
function searchObjectAttributeRelList() {
	// Set input
    var requestParam = {
    	'tntInstId' : tntInstId,
    	'objectId': gObjectId
   	};

    PFRequest.get('/eav/getObjectAttributeRelationList.json', requestParam, {
        success: function(responseData) {
            //$('.detail-grid').empty();
            objAttributeRelDelList = [];
            if(!objectAttributeRelGrid) {
            	objectAttributeRelGrid = objectAttributeRelListGrid();
            }
            objectAttributeRelGrid.setData(responseData);

        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'EAVService',
            operation: 'getObjectAttributeRelationList'
        }
    });
}

// EAV 화면구성 저장
function saveEAVScreenConfigInfo() {
    var requestParam = {};
    requestParam.objectId = gObjectId;

    // 그리드데이터
    requestParam['voList'] = eavScreenConfigGrid.getAllData();

    // EAV 화면구성 저장 서비스 호출
    PFRequest.post('/eav/saveEAVObjectAttributeScreenConfig.json',requestParam,{
        success : function(responseData) {
            PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');

            // 저장후 EAV 화면구성 조회
            searchEAVScreenConfigInfoList();
        },

        bxmHeader: {
            application: 'PF_Factory',
            service: 'EAVService',
            operation: 'saveEAVObjectAttributeScreenConfig'
        }
    });
}


// EAV 화면구성 조회
function searchEAVScreenConfigInfoList() {
	// Set input
    var requestParam = {
    	'tntInstId' : tntInstId,
    	'objectId': gObjectId
   	};

    PFRequest.get('/eav/getEAVScreenConfigInfoList.json', requestParam, {
        success: function(responseData) {
            //$('.eav-screen-grid').empty();

            if(!eavScreenConfigGrid) {
            	eavScreenConfigGrid = getEavScreenConfigGrid();
            }
            eavScreenConfigGrid.setData(responseData);

        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'EAVService',
            operation: 'getEAVScreenConfigInfoList'
        }
    });
}

/******************************************************************************************************************
 * rendering 함수
 ******************************************************************************************************************/

// 트리박스
function renderEAVObjectTreeBox() {
    $('.pf-eav-model-object-left-tree-box').html(objectLeftTreeTpl());

    loginTntInstId = getLoginTntInstId();
    tntInstId = getLoginTntInstId();
    mother = getMortherYn();
    child = true;

    if(writeYn == 'Y'){
        $el.find('.create-eav-object-btn').show();
    }else{
        $el.find('.create-eav-object-btn').hide();
    }

    // 트리와 메인화면 생성
    renderEAVObjectInfo();
}

// 트리와 메인화면을 생성
function renderEAVObjectInfo(treeItem) {

    var path = (treeItem) ? treeItem.id : null;

    var hash = PFUtil.getHash();
    if(path == null){
        hash = '';
        $el.find('.pf-eav-model-info-wrap').removeClass('active');
    }

    if (!hash) {
        return;
    } else {
        hash.id = path;
    }
}



// 탭 생성
function renderGridTab(data){
	PFUI.use(['pfui/tab','pfui/mask'],function(Tab){

        var tab = new Tab.Tab({
            render : '#eav-grid-tab',
            elCls : 'nav-tabs',
            autoRender: true,
            children:[
                {text:bxMsg('AttributeRelation'),value:data, index:1}		// 속성관계
              , {text:bxMsg('EAVScreenConfigure'),value:data, index:2}		// EAV 화면구성
            ],
            itemStatusCls : {
                'selected' : 'active'
            }
        });

        tab.on('selectedchange', function(ev){
            var item = ev.item;

            switch(item.get('index')){
            	// 속성관계 탭
                case 1:
                    $('.eav-grid-wrap').not($('.eav-model-grid-wrap')).hide();
                    $('.eav-model-grid-wrap').show();

                    //if(!objectAttributeRelGrid) {
                    	// 조회
                    	searchObjectAttributeRelList();
                    //}

                    break;

                // EAV 화면구성 탭
                case 2:
                    $('.eav-grid-wrap').not($('.eav-screen-grid-wrap')).hide();
                    $('.eav-screen-grid-wrap').show();

                    //if(!eavScreenConfigGrid) {
                    	// 조회
                    	searchEAVScreenConfigInfoList();
                    //}

                    break;

                default:
                	break;
            }
        });

        tab.setSelected(tab.getItemAt(0));
    });
}

/******************************************************************************************************************
 * 트리 관련
 ******************************************************************************************************************/
function renderObjectNavTree() {
    if (renderObjectNavTree.isRendered) {
        return;
    }

    renderObjectNavTree.isRendered = true;

    PFUI.use(['pfui/tree', 'pfui/data', 'pfui/menu'], function (Tree, Data, Menu) {

        var objectName = $el.find('.eav-object-search-name').val();
        var attributeName = $el.find('.eav-attribute-search-name').val();
        /* --------------------------------------
         * nvaTreeStore
         * -------------------------------------- */
        if (g_serviceType == g_bxmService){ //bxm 서비스 일경우 파라미터 설정
            var params = {
                header: {
                    application: 'PF_Factory',
                    service: 'EAVService',
                    operation: 'getEntityList'
                },
                input: {
                    tntInstId: getMotherTntInstId(),
                    objectName: objectName,
                    attributeName: attributeName,
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
                    'objectName': 'text',
                    'objectId': 'id',
                    'name': 'name'
                }
            });

        } else {

            //파라미터 세팅
            var tmpTntInstId;
                tmpTntInstId = getMotherTntInstId();

            navTreeStore = new Data.TreeStore({
                autoLoad: false,
                url: '/eav/getEntityList.json?tntInstId=' + tmpTntInstId +
                '&commonHeaderMessage={"loginTntInstId":"' + loginTntInstId + '", "motherTntInstId" : "' + getCookie('motherTntInstId') + '", "lastModifier" : "' + getCookie('loginId')+ '"}' +
                '&objectName=' + objectName +
                '&attributeName=' + attributeName,
                dataProperty: 'list',
                map: {
                    'bottom': 'leaf',
                    'objectName': 'text',
                    'objectId': 'id',
                    'name': 'name'
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

            if(data.list && data.list.length > 0){
                data.list.forEach(function(element){
                    element.bottom = true;

                    if(!element.bottom && !element.related){
                        element.cls = 'Folder';
                    }
                    if(element.bottom && !element.related){
                        element.cls = 'PT';
                    }
                    if(element.objectId) {
                    	element.name = element.objectName;
                        element.objectName = '['+element.objectId+']'+element.objectName;
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

        // Tree item double click
        navTree.on('itemdblclick', function(e) {
            var objectInfo;

            if(e.item.level == 1){

            	objectInfo = e.item;
            	objectInfo.objectId = e.item.id;
            	objectInfo.name = e.item.name;

                var requestData = { objectId : e.item.id,
                    tntInstId: tntInstId,
                    motherTntInstId: getMotherTntInstId(),
                    inqrySeqSort : true
                };

                gObjectId = e.item.id;
                gObjectName = e.item.name;

                $el.find('.pf-eav-model-info-wrap').addClass('active');
                $el.find('.pd-object-attribute-rel-info').html(objectDetailInfoTpl());
                $el.find('.pf-eav-obj-detail-info').html(objectDetailManagementPopupTpl(objectInfo));
                objectAttributeRelGrid = undefined;
                eavScreenConfigGrid = undefined;
                // 탭 생성
                renderGridTab();
            }
        });


        /* --------------------------------------
         * Context Menu Event - 오브젝트
         * -------------------------------------- */

        // 오브젝트 조회 이벤트
        var searchObjectEvent = function() {

            var requestData={};
            requestData.objectId = treeItem.id;
            requestData.tntInstId = getMotherTntInstId();

            PFRequest.get('/eav/getEntity.json',requestData, {
                success: function(responseMessage) {
                    responseMessage.work = "UPDATE";
                    renderObjectManagePopup(responseMessage);
                },
                bxmHeader: {
                    application: 'PF_Factory',
                    service: 'EAVService',
                    operation: 'getEntity'
                }
            });
        }

        // 오브젝트 삭제 이벤트
        var deleteObjectEvent = function() {
            PFComponent.showConfirm(bxMsg('DPE00001_Delete_Confirm'), function() {
            	deleteObject(treeItem.id);
            }, function() {
                return;
            });
        }

        // 해당 관리화면 오픈 - 20180205 주석처리 - 미리보기 팝업으로 변경
        var openManagePage = function() {
        	/**
        	var parameter = {
        			tntInstId: tntInstId,
        			motherTntInstId: getMotherTntInstId(),
        			objectId : treeItem.id
        	}
        	$(parent.document).find('.hidden-screen-area').find('.SCRN045').attr('parameter', JSON.stringify(parameter));
        	$(parent.document).find('.hidden-screen-area').find('.SCRN045').find('li').text(treeItem.name); // Tab Menu명은 Object명
        	$(parent.document).find('.hidden-screen-area').find('.SCRN045')[0].click();
        	*/
        }

        /* --------------------------------------
         * Context Menu
         * -------------------------------------- */

        // 오브젝트 mother context menu
        var objectMotherContextMenu = new Menu.ContextMenu({
            children: [
                makeContextMenu('icon-zoom-in', bxMsg('SearchObject'), searchObjectEvent), // 오브젝트 조회
                makeContextMenu('icon-remove' , bxMsg('DeleteObject'), deleteObjectEvent), // 오브젝트 삭제
                //makeContextMenu('icon-ok' , bxMsg('OpenManagePage'), openManagePage) // 해당 관리화면 오픈 - 20180205 주석처리 - 미리보기 팝업으로 변경
            ]
        });

        // context menu 추가
        navTree.on('itemcontextmenu', function(ev){

            var item = ev.item;
            navTree.setSelected(item);
            treeItem = item;

            var y = ev.pageY >= 500 ? ev.pageY-(28*4) : ev.pageY;

            objectMotherContextMenu.set('xy', [ev.pageX, y]);
            objectMotherContextMenu.show();

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





/******************************************************************************************************************
 * 그리드 관련
 ******************************************************************************************************************/
// grid cell editing plugin
function getGridCellEditiongPlugin(){
    return Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1
    });
}


// 오브젝트<>속성 관계 그리드
function objectAttributeRelListGrid(){
    var grid = PFComponent.makeExtJSGrid({
        pageAble: true,
        fields: ['atrbtId','atrbtNm', 'keyYn', 'dataLength', 'decimalDigit', 'defaultValue', 'nullYn', 'applyStartDate', 'applyEndDate', 'process',

                 {
		            name: 'keyYnB',
		            convert: function (newValue, record) {
		               if (record.get('keyYn') == 'Y') {
		                   return true;
		                }
		                return false;
		             }
		         },
		         {
		             name: 'nullYnB',
		             convert: function (newValue, record) {
		                if (record.get('nullYn') == 'Y') {
		                    return true;
		                 }
		                 return false;
		              }
		          }
		         ],
        gridConfig: {
            renderTo: '.detail-grid',
            columns: [
	              // 속성ID
	              {text: bxMsg('AttributeId'), flex: 1, dataIndex: 'atrbtId', editor: {}, style: 'text-align:center'},

	              // 속성명
	              {text: bxMsg('AttributeName'), flex: 1, dataIndex: 'atrbtNm', editor: {}, style: 'text-align:center'},

	              // 데이터길이
	              {text: bxMsg('DataLength'), width: 75, dataIndex: 'dataLength',editor: {}, style: 'text-align:center', align: 'right'},

	              // 소수점자릿수
	              {text: bxMsg('DecimalDigit'), width: 90, dataIndex: 'decimalDigit',editor: {}, style: 'text-align:center', align: 'right'},

	              // 기본값
	              {text: bxMsg('bsicVal'), width: 75, dataIndex: 'defaultValue',editor: {}, style: 'text-align:center', align: 'center'},

	              // KEY여부
	              {xtype: 'checkcolumn', text: bxMsg('KeyYn'), width: 75, dataIndex: 'keyYnB',
	                  listeners: {
	                      checkchange: function(column, rowIndex, checked, eOpts){
	                          if(checked){
	                              grid.store.getAt(rowIndex).set('keyYn', 'Y');
	                          }else{
	                              grid.store.getAt(rowIndex).set('keyYn', 'N');
	                          }

	                          if(grid.store.getAt(rowIndex).get('process') != 'C'){
	                              grid.store.getAt(rowIndex).set('process', 'U');
	                          }
	                      }
	                  }
	              },

	              // Null여부
	              {xtype: 'checkcolumn', text: bxMsg('NullYn'), width: 75, dataIndex: 'nullYnB',
	                  listeners: {
	                      checkchange: function(column, rowIndex, checked, eOpts){
	                          if(checked){
	                              grid.store.getAt(rowIndex).set('nullYn', 'Y');
	                          }else{
	                              grid.store.getAt(rowIndex).set('nullYn', 'N');
	                          }

	                          if(grid.store.getAt(rowIndex).get('process') != 'C'){
	                              grid.store.getAt(rowIndex).set('process', 'U');
	                          }
	                      }
	                  }
	              },

	              	// 적용시작일자
	                {text: bxMsg('DPP0127String6'), flex:1,dataIndex:'applyStartDate', align: 'center',
	                    editor: {
	                        allowBlank: false,
	                        listeners: {
	                            focus: function(_this) {
	                                PFUtil.getGridDateTimePicker(_this, 'applyStartDate', grid, selectedCellIndex);
	                            }
	                        }
	                    },
	                    listeners: {
	                        click: function() {
	                            selectedCellIndex = $(arguments[1]).parent().index();
	                        }
	                    }
	                },

	                // 적용종료일자
	                {text: bxMsg('DPP0127String7'), flex:1, dataIndex:'applyEndDate', align: 'center',
	                    editor: {
	                        allowBlank: false,
	                        listeners: {
	                            focus: function(_this) {
	                                PFUtil.getGridDateTimePicker(_this, 'applyEndDate', grid, selectedCellIndex);
	                            }
	                        }
	                    },
	                    listeners: {
	                        click: function() {
	                            selectedCellIndex = $(arguments[1]).parent().index();
	                        }
	                    }
	                },

	              // delete row
	              {xtype: 'actioncolumn', width: 35, align: 'center', sortable: false,
	               items: [{
	                      icon: '/images/x-delete-16.png',
	                      handler: function (grid, rowIndex, colIndex, item, e, record) {
	                          if(record.data.process != 'C') {
	                              record.data.process = 'D';
	                              objAttributeRelDelList.push(record.data);
	                          }
	                          record.destroy();
	                      }
	                  }]
	              }
	          ],

            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                        afteredit: function(e, editor){
                            if(editor.originalValue !=  editor.value && editor.record.get('process') != 'C'){
                                editor.record.set('process', 'U');
                            }
                        },
                        beforeedit:function(e, editor) {
                        	if(editor.field == 'atrbtId' || editor.field == 'atrbtNm') {
                                return false;
                            }
                        	if(editor.record.get('process') != 'C' && editor.field == 'applyStartDate') {
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


// EAV 화면구성 그리드
function getEavScreenConfigGrid(){
    var grid = PFComponent.makeExtJSGrid({
        pageAble: true,
        fields: ['atrbtId','atrbtNm', 'screenConfigWayDscd', 'screenConfigSeq', 'process'],
        gridConfig: {
            renderTo: '.eav-screen-grid',
            columns: [
	              // 속성ID
	              {text: bxMsg('AttributeId'), flex: 1, dataIndex: 'atrbtId', editor: {}, style: 'text-align:center'},

	              // 속성명
	              {text: bxMsg('AttributeName'), flex: 1, dataIndex: 'atrbtNm', editor: {}, style: 'text-align:center'},

	              {text: bxMsg('ScreenConfigWayDscd'), flex: 1, dataIndex: 'screenConfigWayDscd', style: 'text-align:center',
	                    renderer: function(value) {
	                    	return codeMapObj.screenConfigWayDscd[value] || value;
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
	                            data: codeArrayObj['screenConfigWayDscd']
	                        })
	                    }
	                },

	              // 화면구성순서
	              {text: bxMsg('ScreenConfigSeq'), flex: 1, dataIndex: 'screenConfigSeq', editor: {}, style: 'text-align:center', align: 'right'},

	          ],

            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                        afteredit: function(e, editor){
                            if(editor.originalValue !=  editor.value && editor.record.get('process') != 'C'){
                                editor.record.set('process', 'U');
                            }
                        },
                        beforeedit:function(e, editor) {
                        	if(editor.field == 'atrbtId' || editor.field == 'atrbtNm') {
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