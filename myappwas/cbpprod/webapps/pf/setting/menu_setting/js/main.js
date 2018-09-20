/**
 * menu setting java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {
	// 메인화면
	$('.pf-page-conts').html(menuMainFormTpl());

	$('.menu-config-dscd').trigger('change');

    renderMenuTab();

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
});

var deleteList = [];

$('body').css('overflow-y','scroll');

var $el = $('.pf-menu-setting');
var projectTypeListTpl,menuScreenFormTpl, activitySearchPopup;

var menuScreenListGrid;
var menuListGrid;
var form;
var selectedCellIndex;
var multiLanguageGrid; // 다국어 그리드

var selectedRecord;

var onEvent = PFUtil.makeEventBinder($el);

// 메뉴설정관리 메인
var menuMainFormTpl = getTemplate('menuMainFormTpl');
// 메뉴설정
var menuFormTpl = getTemplate('menuFormTpl');
// 화면설정
var menuScreenFormTpl = getTemplate('menuScreenFormTpl');

PFComponent.toolTip($el);

var menuTab;
/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/
onEvent('click', 'a', function(e) { e.preventDefault(); });

// 초기화버튼 클릭시
onEvent('click','.pf-reset-form-btn',function(e) {
	if(menuTab.getSelected().get('index') == 2) {
		PFComponent.makeYGForm($('.menu-class-query-table')).reset();
		menuListGrid.setStoreRootNode([]);
	}
	else {
		PFComponent.makeYGForm($('.menu-screen-query-table')).reset();
		menuScreenListGrid.resetData();
	}
});

// 조회버튼 클릭시
onEvent('click', '.pf-menu-list-inquiry-btn', function(e) {
	if(menuTab.getSelected().get('index') == 2) {
		searchMenuAllInformationList();
	}
	else {
		searchScreenMasterList();
	}
});

// 신규버튼 클릭시
onEvent('click', '.pf-menu-create-btn', function(e) {
	// 화면설정
	if(menuTab.getSelected().get('index') == 1) {
	    var defaultParam = {
	        "work" : "CREATE"
	    }
	    renderScreenConfigDetailPopup(defaultParam);
	}
	// 메뉴설정
	else {
	    var newData = {
	    		children: null,
	    		aplyStartDt : '',
	    		aplyEndDt : '',
	            process : 'C',
	            menuId : '',
	            menuNm : '',
	            upMenuId : '',
	            scrnId : '',
	            scrnNm : '',
	            inqrySeq : 0,
	            actvYn : 'Y',
	            //leaf : true,
	            leaf : false,
	            menuImg : '',
	            depth : 1
	    };
	    menuListGrid.addField(newData);
	}
});

// UP 버튼 클릭시
onEvent('click', '.pf-menu-upper-btn', function(e) {
	if(menuListGrid) {
		menuListGrid.upField();
	}
});

// DOWN 버튼 클릭시
onEvent('click', '.pf-menu-down-btn', function(e) {
	if(menuListGrid) {
		menuListGrid.downField();
	}
});

// 설정구분코드 콤보값 변경
onEvent('change', '.menu-config-dscd', function(e) {
});

//저장버튼
onEvent('click', '.menu-all-info-save-btn', function() {

	var gridData = menuListGrid.getAllData();
	if(gridData && gridData.length > 0) {

		var gridDataArr = [];
		var inqrySeq = 1;
		for(var i = 0; i < gridData.length; i++) {
			var gridDataObj = {};

			gridDataObj.originalMenuId = gridData[i].originalMenuId;
			gridDataObj.menuId = gridData[i].menuId;
			gridDataObj.scrnId = gridData[i].scrnId;
			gridData[i].leaf = gridData[i].leaf ? "Y" : "N";
			gridDataObj.leaf = gridData[i].leaf;

		    gridDataObj.inqrySeq = inqrySeq++;
			if(gridDataObj.leaf == "N") {
				gridDataObj.menuLvlNbr = 0;

				if(gridData[i].children && gridData[i].children.length > 0) {
					gridDataObj.existChildrenYn = 'Y';
				}
			}
			
		    gridDataObj.menuNm = gridData[i].menuNm;
		    gridDataObj.upMenuId = gridData[i].upMenuId;
		    gridDataObj.menuImg = gridData[i].menuImg;
		    gridDataObj.actvYn = gridData[i].actvYn;
		    gridDataObj.scrnNm = gridData[i].scrnNm;
		    gridDataObj.aplyStartDt = gridData[i].aplyStartDt;
		    gridDataObj.aplyEndDt = gridData[i].aplyEndDt;
			gridDataArr.push(gridDataObj);
			if(gridData[i].children && gridData[i].children.length > 0) {
				_makeChildData(gridData[i].children, undefined, gridDataObj.inqrySeq);
			}
		}

		function _makeChildData(_gridData, menuLvlNbr, parentSeq) {
			if(_gridData && _gridData.length > 0) {
				for(var i = 0; i < _gridData.length; i++) {
					var menuLevelNumber = 1;
					var gridDataObj = {};

					gridDataObj.originalMenuId = _gridData[i].originalMenuId;
					gridDataObj.menuId = _gridData[i].menuId;
					gridDataObj.scrnId = _gridData[i].scrnId;
					_gridData[i].leaf = _gridData[i].leaf ? "Y" : "N";
					gridDataObj.leaf = _gridData[i].leaf;
					gridDataObj.inqrySeq = inqrySeq++;

					if(gridDataObj.leaf == "N") {
						if(_gridData[i].children && _gridData[i].children.length > 0) {
							gridDataObj.existChildrenYn = 'Y';
						}

						if(menuLvlNbr) {
							gridDataObj.menuLvlNbr = menuLvlNbr;
						}
						else {
							gridDataObj.menuLvlNbr = menuLevelNumber;
						}
					}
					
				    gridDataObj.menuNm = _gridData[i].menuNm;
				    gridDataObj.upMenuId = _gridData[i].upMenuId;
				    gridDataObj.menuImg = _gridData[i].menuImg;
				    gridDataObj.actvYn = _gridData[i].actvYn;
				    gridDataObj.scrnNm = _gridData[i].scrnNm;
				    gridDataObj.aplyStartDt = _gridData[i].aplyStartDt;
				    gridDataObj.aplyEndDt = _gridData[i].aplyEndDt;
				    gridDataObj.leaf = _gridData[i].leaf;

				    if(parentSeq) {
				    	gridDataObj.parentSeq = parentSeq;
				    }

					gridDataArr.push(gridDataObj);
					menuLvlNbr = undefined;
					if(_gridData[i].children && _gridData[i].children.length > 0) {
						_makeChildData(_gridData[i].children, menuLevelNumber++, gridDataObj.inqrySeq);
					}
				}
			}
		}

		// data validation
		if(gridDataArr && gridDataArr.length > 0) {
			var duplicateMenuNm 		= false;
			var duplicateScrnId 		= false;
			var notExistsMenuId 		= false;
			var notExistsScrnId 		= false;
			var notExistsMenuScrnRel 	= false;
			var dotSavespecialCharacter = false;

			for(var i = 0; i < gridDataArr.length; i++) {
				// 메뉴 미존재 체크
				if(gridDataArr[i].leaf == "N" && (!gridDataArr[i].scrnId || gridDataArr[i].scrnId == '')
						&& (!gridDataArr[i].menuId || gridDataArr[i].menuId == '')) {
					notExistsMenuId = true;
				}
				// 화면 미존재 체크
				if(gridDataArr[i].leaf == "Y" && (gridDataArr[i].scrnId == '' || !gridDataArr[i].scrnId)) {
					notExistsScrnId = true;
				}
				// 메뉴인데 화면미존재 체크
				if(gridDataArr[i].leaf == "N" && !gridDataArr[i].existChildrenYn) {
					notExistsMenuScrnRel = true;
				}

				// OHS20180411 추가 - 메뉴명 특수문자 체크
				if(PFValidation.specialCharacterValue(gridDataArr[i].menuNm)) {
				  console.log(gridDataArr[i]);
					dotSavespecialCharacter = true;
					break;
				}
				
				var duplicateMenuNmCount = 0;
				var duplicateScrnIdCount = 0;

				for(var j = 0; j < gridDataArr.length; j++) {
					// 메뉴 중복 체크
					if(gridDataArr[i].menuNm && !gridDataArr[i].scrnId
						&& gridDataArr[j].menuNm && !gridDataArr[j].scrnId
							&& gridDataArr[i].menuNm == gridDataArr[j].menuNm) {

						duplicateMenuNmCount++;
					}
					// 화면 중복 체크
					if(gridDataArr[i].menuId && gridDataArr[i].scrnId
						&& gridDataArr[j].menuId && gridDataArr[j]
							&& gridDataArr[i].scrnId == gridDataArr[j].scrnId) {

	    				// 구간중복체크
	    				if((gridDataArr[i].aplyStartDt >= gridDataArr[j].aplyStartDt && gridDataArr[i].aplyStartDt <= gridDataArr[j].aplyEndDt)
	    						|| (gridDataArr[i].aplyStartDt < gridDataArr[j].aplyStartDt && gridDataArr[i].aplyEndDt > gridDataArr[j].aplyEndDt)) {

	    					duplicateScrnIdCount++;
	    				}

					}
				}

				if(duplicateMenuNmCount > 1) {
					duplicateMenuNm = true;
				}
				if(duplicateScrnIdCount > 1) {
					duplicateScrnId = true;
				}
			}

			// 메뉴명 중복
			if(duplicateMenuNm) {
				//PFComponent.showMessage(bxMsg('dupMenuNm'), 'warning');
				//return false;
			}
			// 화면명 중복
			if(duplicateScrnId) {
				PFComponent.showMessage(bxMsg('dupScrnNm'), 'warning');
				return false;
			}
			// 메뉴명 필수입력
			if(notExistsMenuId) {
				PFComponent.showMessage(bxMsg('mandatoryMenuNm'), 'warning');
				return false;
			}
			// 최하위노드 화면필수 선택
			if(notExistsScrnId) {
				PFComponent.showMessage(bxMsg('lowestNodeIsMandatoryScrn'), 'warning');
				return false;
			}
			// 메뉴는 필수로 화면을 가지고있어야함.
			if(notExistsMenuScrnRel) {
				PFComponent.showMessage(bxMsg('menuIsMandatoryHasScrn'), 'warning');
				return false;
			}
			
			// OHS20180411 추가 - 특수문자는 허용 안됨.
			if(dotSavespecialCharacter) {
				return false;
			}
		}

	    var requestParam = {};
	    requestParam['menuAllInfoList'] = gridDataArr;

	    PFRequest.post('/common/menu/saveMenuAllInfoList.json', requestParam, {
	        success: function(responseData) {
	            PFComponent.showMessage(bxMsg('workSuccess'), 'success');
	            // 메뉴 재조회
	            searchMenuAllInformationList();
	        },
	        bxmHeader: {
	            application: 'PF_Factory',
				service: 'ScreenService',
				operation: 'saveMenuAllInfoList'
	        }
	    });
	}
	else {
		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
        return;
	}
});

/**
 * 메뉴설정, 화면설정 탭
 */
function renderMenuTab() {
    PFUI.use('pfui/tab', function(Tab){

    	menuTab = new Tab.Tab({
            render : '#pf-menu-setting-dscd-tab-area',
            elCls : 'nav-tabs',
            autoRender: true,
            deferredRender: false,
            layoutOnTabChange: true,
            children:[
                {text:bxMsg('MenuSettingDscd_02'), index:1}	// 메뉴설정
              , {text:bxMsg('MenuSettingDscd_01'), index:2} // 화면설정
            ]
        });

        menuTab.on('selectedchange', function(ev){
            var item = ev.item;

            switch(item.get('index')){
                case 1:
                	if(!$el.find('.menu-screen-query-table') || $el.find('.menu-screen-query-table').length < 1) {
                		$el.find('.pf-menu-setting-screen-area').html(menuScreenFormTpl());
                	}
                	$('.pf-menu-setting-screen-area').css('display', 'block');
                	$('.pf-menu-setting-menu-area').css('display', 'none');

            		$('.copy-row-btn').css('display', 'none');
            		$('.menu-all-info-save-btn').css('display', 'none');
            		if(!menuScreenListGrid) {
            			renderScreenListGrid();
            		}
            		$('.pf-screen-setting-list-grid').css('display', 'block');
            		$('.pf-menu-setting-list-grid').css('display', 'none');

            		$('.pf-menu-upper-btn').css('display', 'none');
            		$('.pf-menu-down-btn').css('display', 'none');
                    break;

                case 2:
                	if(!$el.find('.menu-class-query-table') || $el.find('.menu-class-query-table').length < 1) {
                		$el.find('.pf-menu-setting-menu-area').html(menuFormTpl());
                	}
                	$('.pf-menu-setting-menu-area').css('display', 'block');
                	$('.pf-menu-setting-screen-area').css('display', 'none');
            		$('.copy-row-btn').css('display', 'block');
            		$('.menu-all-info-save-btn').css('display', 'block');
            	    PFUtil.getDatePicker();
            	    if(!menuListGrid) {
            	    	renderMenuListGrid();
            	    }
            		$('.pf-screen-setting-list-grid').css('display', 'none');
            		$('.pf-menu-setting-list-grid').css('display', 'block');

            		$('.pf-menu-upper-btn').css('display', 'block');
            		$('.pf-menu-down-btn').css('display', 'block');
                    break;
            }
        });

        menuTab.setSelected(menuTab.getItemAt(0), 1);
    });
}

/**
 * 메뉴전체정보 조회
 */
function searchMenuAllInformationList() {
	var requestParam = PFComponent.makeYGForm($('.menu-class-query-table')).getData();
    PFRequest.get('/common/menu/getMenuAllInfoList.json', requestParam, {
        success: function(responseData) {
            menuListGrid.setStoreRootNode(responseData.menuAllInfoList);
        },
        bxmHeader: {
            application: 'PF_Factory',
			service: 'ScreenService',
            operation: 'getMenuAllInfoList'
        }
    });
}

/******************************************************************************************************************
 * 사용자 함수
 ******************************************************************************************************************/
// 설정구분코드 콤보조립
function makeMenuConfigDscdCombo() {
    var options = [];

    var option = $('<option>');
    option.text(bxMsg('MenuSettingDscd_01'));
    option.val('01');

    options.push(option);

    option = $('<option>');
    option.text(bxMsg('MenuSettingDscd_02'));
    option.val('02');

    options.push(option);
    $('.menu-config-dscd').html(options);
}

// 화면 목록조회
function searchScreenMasterList(){
	var requestData = PFComponent.makeYGForm($('.menu-screen-query-table')).getData();

    PFRequest.get("/common/menu/getScreenMasterList.json" , requestData, {
        success: function(responseData) {
        	if(responseData && responseData.scrnMasterList) {
        		menuScreenListGrid.setData(responseData.scrnMasterList);
        	}
        	else {
        		menuScreenListGrid.setData([]);
        	}
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ScreenService',
            operation: 'getListScreen'
        }
    });
}

/******************************************************************************************************************
 * 화면설정 그리드
 ******************************************************************************************************************/
function renderScreenListGrid() {
	$('.pf-screen-setting-list-grid').empty();
    menuScreenListGrid = PFComponent.makeExtJSGrid({
    	// 화면ID, 화면명, 화면URL주소, 메뉴대상화면여부, 활동여부
        fields: [
            "scrnId", "scrnNm", "scrnUrlAddr", "menuTrgtScrnYn", "actvYn", "itmKeyVal",
        ],
        gridConfig: {
            renderTo: '.pf-screen-setting-list-grid',
            columns: [
                {text: bxMsg('ScrnId'), flex:  1  , dataIndex: 'scrnId'},
                {text: bxMsg('ScrnNm'), flex: 2, dataIndex: 'scrnNm'},
                {text: bxMsg('ScrnUrlAddr'), flex:  2  , dataIndex: 'scrnUrlAddr'},
                {xtype: 'checkcolumn', text: bxMsg('actvYn'), flex:  1  , dataIndex: 'actvYn',  disabled : true,
                    renderer: function(value, metadata, record) {
                        if (record.get('actvYn') == null || record.get('actvYn') == 'N'  ) {
                        	return (new Ext.ux.CheckColumn()).renderer(false);
                        } else {
                            return (new Ext.ux.CheckColumn()).renderer(true);
                        }
                    }
                },
                {xtype: 'checkcolumn', text: bxMsg('menuTargetYn'), flex:  1  , dataIndex: 'menuTrgtScrnYn',  disabled : true,
                	renderer: function(value, metadata, record) {
                		if (record.get('menuTrgtScrnYn') == null || record.get('menuTrgtScrnYn') == 'N'  ) {
                			return (new Ext.ux.CheckColumn()).renderer(false);
                		} else {
                			return (new Ext.ux.CheckColumn()).renderer(true);
                		}
                	}
                }
            ],
            listeners: {
                scope: this,
                itemdblclick : function(tree, record) {
                	if(record.data) {
                		record.data.dataMigrationStepId = record.data.menuStepId
                	}
                	var responseData = {}
                    responseData.work = "UPDATE";
                	responseData.scrnId = record.data.scrnId;
                	responseData.scrnNm = record.data.scrnNm;
                	responseData.scrnUrlAddr = record.data.scrnUrlAddr;
                	responseData.menuTargetScrnYn = record.data.menuTrgtScrnYn;
                	responseData.actvYn = record.data.actvYn;
                    renderScreenConfigDetailPopup(responseData);
                },
                afterrender : function(){
                	// 초기조회
                	searchScreenMasterList();
                }
            }
        }
    });
}


/******************************************************************************************************************
 * 메뉴설정 그리드
 ******************************************************************************************************************/
function renderMenuListGrid() {
	$('.pf-menu-setting-list-grid').empty();
	menuListGrid = PFComponent.makeExtTreeGrid({
		fields: ['menuId', 'upMenuId', 'inqrySeq', 'actvYn', 'scrnId', 'scrnNm', 'aplyStartDt', 'aplyEndDt', 'children', 'menuLvlNbr', 'itmKeyVal', 'menuImg', 'originalMenuId',
		         {
					name: 'leaf',
					convert: function(newValue, record) {
						if(newValue == 'Y' || newValue == true) {
							return true;
						}
						else {
							return false;
						}
					}
		         },
                 {
		            name: 'menuNm',
		            convert: function(newValue, record) {
		                record.data.menuId = newValue;

		                // 자식노드가있을경우 일괄적으로 upMenuId 세팅처리
		                if(record.childNodes && record.childNodes.length > 0) {
		                	for(var i = 0; i < record.childNodes.length; i++) {

		                		// leaf == false 인 하위메뉴에만 적용
	                			record.childNodes[i].data.upMenuId = newValue;
	                			record.commit(); // record commit

		            			if(record.childNodes[i].childNodes && record.childNodes[i].childNodes.length > 0) {
	                				_setRecursiveChildNodesUpMenuId(record.childNodes[i]);
	                			}
		                	}
		                }

		                function _setRecursiveChildNodesUpMenuId(record) {
		                    if(record.childNodes && record.childNodes.length > 0) {
			                	for(var i = 0; i < record.childNodes.length; i++) {

			                		// leaf == false 인 하위메뉴에만 적용
			                		if(record.childNodes[i].data.leaf == false) {
			                			record.childNodes[i].data.upMenuId = newValue;

			                			record.commit(); // record commit
			                		}

			                		if(record.childNodes[i].childNodes && record.childNodes[i].childNodes.length > 0) {
		                				_setRecursiveChildNodesUpMenuId(record.childNodes[i]);
		                			}
			                	}
			                }
		                }
		                return newValue;
		            }
                 },
                 // OHS20180411 추가 - 메뉴의 일자는 내부적으로만 시분초를 관리하고 사용자가 보기에는 yyyyMMdd까지만 보여줌.
                 {
                     name : 'applyStartDate',
                     convert: function(newValue, record){
                         return record.get('aplyStartDt') ? record.get('aplyStartDt').substr(0,10) : '';
                     }
                 },{
                     name : 'applyEndDate',
                     convert: function(newValue, record){
                         return record.get('aplyEndDt') ? record.get('aplyEndDt').substr(0,10) : '';
                     }
                 }
        ],
        gridConfig: {
            renderTo: '.pf-menu-setting-list-grid',
        	expanded: true,
            columns: [
                // 메뉴명(화면명)
                {xtype: 'treecolumn', text: bxMsg('MenuNm') + "(" + bxMsg('ScrnNm') + ")", width : 250, dataIndex: 'menuNm', style:'text-align:center', editor: 'textfield'},

                // 메뉴/화면ID
                {text: bxMsg('Menu') + '/' +bxMsg('ScrnId'), width : 100, dataIndex: 'scrnId',editor: {},
                	renderer: function (val, metadata, record) {
                		if(record.data.leaf == true) {
                			return (val ? val : "") + "<button type=\"button\" class=\"bw-btn add-mg-l-10 f-r grid-search\"  id=\"btn-scrn-grid-search\"><i class=\"bw-icon i-25 i-search search-scrn-id\"></i></button>";
                		}
                		else {
                			return record.data.originalMenuId;
                		}
                	}
                	, listeners: {
                        click: function (grid, rowEl, rowIdx, cellIdx, e, record) {
                            if ($(e.target).hasClass('search-scrn-id') && record.data.leaf == true) {
                            	// 화면팝업 호출
                            	var submitEvent = function(selectedData) {
                            		if(selectedData) {
                            			record.set('scrnId', selectedData.scrnId);
                            			record.set('menuNm', selectedData.scrnNm);
                            			record.set('scrnNm', selectedData.scrnNm);
                            			record.set('upMenuId', record.parentNode.data.menuId);
                            		}
                            	};
                            	renderScreenListSelectionPopup(submitEvent);
                            }
                        }
                    }
                },
                // 이미지
                // TODO : 추후 팝업을 통한 이미지 선택
                {text: bxMsg('image'), flex: 1, dataIndex: 'menuImg', editor: 'textfield'
                },
                // 적용시작일
                {text: bxMsg('DPP0127String6'), flex: 1, dataIndex: 'applyStartDate',
                    editor: {
                        allowBlank: false,
                        enableKeyEvents: true,
                        listeners: {
                            focus: function(_this) {
                                var isNextDay = true;
                                if(getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                                    isNextDay = false;
                                }
                            	PFUtil.getTreeGridDatePicker(_this, 'aplyStartDt', menuListGrid, selectedCellIndex, isNextDay, true, selectedRecord);
                            },
                            keyup: function(_this, e) {
                            	e.preventDefault();
                            },
                            keydown: function(_this, e) {
                            	e.preventDefault();
                            }
                        }
                    },
                    listeners: {
                        click: function(grid, rowEl, rowIdx, cellIdx, _this, record) {
                            selectedCellIndex = $(arguments[1]).parent().index();
                            selectedRecord = record;
                        }
                    }
                },
                // 적용종료일
                {text: bxMsg('DPP0127String7'), flex: 1, dataIndex: 'applyEndDate',
                    editor: {
                        allowBlank: false,
                        enableKeyEvents: true,
                        listeners: {
                            focus: function(_this) {
                                var isNextDay = true;
                                if(getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                                    isNextDay = false;
                                }
                            	PFUtil.getTreeGridDatePicker(_this, 'aplyEndDt', menuListGrid, selectedCellIndex, isNextDay, true, selectedRecord);
                            },
                            keyup: function(_this, e) {
                            	e.preventDefault();
                            },
                            keydown: function(_this, e) {
                            	e.preventDefault();
                            }
                            
                        }
                    },
                    listeners: {
                        click: function(grid, rowEl, rowIdx, cellIdx, _this, record) {
                            selectedCellIndex = $(arguments[1]).parent().index();
                            selectedRecord = record;
                        }
                    }
                },


                {   // action column row
                    xtype: 'actioncolumn', width: 60, align: 'center', sortable: false,
                    items: [
                            {
								iconCls : "bw-icon i-20 i-func-add"
								, handler: function (grid, rowIndex, colIndex, item, e, record) {
									if(record.data.depth > 2) {
										PFComponent.showMessage(bxMsg('maxMenuNodeDepth'), 'warning');
										return false;
									}
									// 화면명이 세팅되었으면 하위를 추가할 수 없음.
									if (record.data.scrnId === null || record.data.scrnId === '') {
							            record.appendChild({
							            	leaf:true,
							                children: null,
								    		aplyStartDt : PFUtil.getNextDate() + ' ' + '00:00:00',
								    		aplyEndDt : '9999-12-31 23:59:59',
							                menuId : '',
							                menuNm : "",
							                upMenuId : '',
							                scrnId : '',
							                scrnNm : '',
								            inqrySeq : 0,
								            actvYn : 'Y',
								            menuImg : '',
								            depth : record.data.depth + 1
							            });
							            record.data.aplyStartDt = '';
							            record.data.aplyEndDt = '';
							            record.data.leaf = false;
							            record.data.upMenuId = record.parentNode.data.menuId;
							            record.commit();
							            record.expand();
							        }
									else {
										PFComponent.showMessage(bxMsg('dontAddMenuNode'), 'warning');
                            			return false;
									}
								}
                            },
                            {
                            	icon: '/images/x-delete-16.png',
                            	handler: function (grid, rowIndex, colIndex, item, e, record) {
                            		if(record.childNodes && record.childNodes.length > 0) {
                            			PFComponent.showMessage(bxMsg('dontDeleteMenuNode'), 'warning');
                            			return false;
                            		}
                            		PFComponent.showConfirm(bxMsg('DPE00001_Delete_Confirm'), function() {
                            			if(record.data.process != 'C') {
                                			record.data.process = 'D';
                                			deleteList.push(record.data);
                                		}
                                		// 자식정보가 삭제될경우 부모의 자식존재여부를 가지고 leaf 여부를 재정의
                                		if(record.data.depth == 2) {
                                    		if(record.parentNode.childNodes && (record.parentNode.childNodes.length - 1) < 1) {
                                    			record.parentNode.data.leaf = false;
                                    			record.parentNode.data.expanded = false; // 폴더 접힘
                                    			record.parentNode.data.aplyStartDt = '';
                                    			record.parentNode.data.aplyEndDt = '';
                                	            record.parentNode.commit();
                                    		}
                                		}
                                		else {
                                    		if(record.parentNode.childNodes && (record.parentNode.childNodes.length - 1) < 1) {
                                    			record.parentNode.data.leaf = true;
                                    			record.parentNode.data.scrnId = '';
                                    			record.parentNode.data.menuId = '';
                                    			record.parentNode.data.menuNm = '';
                                    			record.parentNode.data.scrnNm = '';
                                    			record.parentNode.data.aplyStartDt = PFUtil.getNextDate() + ' ' + '00:00:00';
                                    			record.parentNode.data.aplyEndDt = '9999-12-31 23:59:59';
                                	            record.parentNode.commit();
                                    		}
                                		}
                                		record.destroy();
                                    }, function() {
                                        return;
                                    });
                            	}
                            }
                    ]
                }

            ],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                	pluginId: 'treeGridCellEdit',
                    clicksToEdit: 1,
                    listeners:{
                        afteredit: function(e, editor){
                            if(editor.originalValue !=  editor.value && editor.record.get('process') != 'C'){
                                editor.record.set('process', 'U');
                            }
                        },
                        beforeedit:function(e, editor){
                        	// 화면ID 수정 불가
                            if(editor.field == 'scrnId') {
                                return false;
                            }
                            // leaf == true 일경우 메뉴명(화면명) & 메뉴이미지 수정불가
                            if(editor.record.data.leaf == true && ( editor.field == 'menuNm' || editor.field == 'menuImg') ) {
                            	return false;
                            }
                            if(editor.record.data.leaf == false && (editor.field == 'aplyStartDt' || editor.field == 'aplyEndDt')) {
                            	return false;
                            }
                        }
                    }
                })
            ]
            , viewConfig: {
                toggleOnDblClick: false
                , plugins: {
                    ptype: 'treeviewdragdrop'
                    , containerScroll: true
                }
            },
            listeners: {
                scope: this,
                itemdblclick : function(tree, record){
                },
                afterrender : function(){
                	// 초기조회
            		searchMenuAllInformationList();
                }
            }
        }
    });
}