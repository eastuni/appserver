/**
 * role menu java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {
    renderRoleMenuDtlList();                         // 메인화면 초기세팅

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }
});

$('body').css('overflow-y','scroll');

var $el = $('.pf-crm');
var onEvent = PFUtil.makeEventBinder($el);
var lengthVlad = PFValidation.realTimeLengthCheck($('body'));
lengthVlad('.task-valid-100',100);
PFComponent.toolTip($el);

var roleMenuDtlGrid;
var form;
var selectedCellIndex;                  // grid calendar
var roleObj={}, roleArrayObj;           // 그리드 콤보 바인딩을 위함
var deleteRoleList = [], deleteRoleMenuList = [];

var roleMenuDtlListTpl = getTemplate('roleMenuDtlListTpl');
var menuListGrdTpl = getTemplate('menuListGrdTpl');
var categoryListGrdTpl = getTemplate('categoryListGrdTpl');
var cndGroupListGrdTpl = getTemplate('cndGroupListGrdTpl');
var cndListGrdTpl = getTemplate('cndListGrdTpl');
var cndAtrbListGrdTpl = getTemplate('cndAtrbListGrdTpl');
var pdBaseRelListGrdTpl = getTemplate('pdBaseRelListGrdTpl');
var projectListGrdTpl = getTemplate('projectListGrdTpl');

var menuListGrd, categoryListGrd, cndGroupListGrd, cndListGrd, cndAtrbListGrd, pdBaseRelListGrd, projectListGrd;
var gridData = [], gridDeleteData = [];
var mapProjectType = {}, arrProjectType = [];
var modifyFlag = false;

/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/

onEvent('click', 'a', function(e) { e.preventDefault(); });

// 조회버튼 클릭시
onEvent('click', '.role-menu-list-inquiry-btn', function(e) {

    fnSearch();

});

// 저장버튼 클릭시
onEvent('click', '.role-menu-save-btn', function(e) {
    saveRoleMenuDtl();
});

//  OHS 0180509 추가 - 역할 콤보박스 값 변경시
onEvent('change', '.role-select', function(e) {
	fnSearch();
});

// 분류 추가버튼 클릭시
onEvent('click', '.category-add-btn', function(e){

    var newData = {
        roleId : $('.role-select').val(),
        athrtyTpDscd : '02',
        pdInfoDscd : '01',
        bizDscd : '*',
        bizDscdNm : bxMsg('Z_All'),
        pdTpCd : '*',
        pdTpNm : bxMsg('Z_All'),
        pdTmpltCd : '*',
        pdTmpltNm : bxMsg('Z_All'),
        aplyStartDt : PFUtil.getToday() + ' ' + '00:00:00',
        aplyEndDt : '9999-12-31 23:59:59',
        useYn : 'N',
        writeYn : 'N',
        process : 'C'               // create
    };

    categoryListGrd.addData(newData);
    modifyFlag = true;
});

// 조건군 추가버튼 클릭시
onEvent('click', '.cnd-group-add-btn', function (e) {

    PFPopup.selectConditionGroupTemplate({ multi: true }, function (selectItem) {
        selectItem.forEach(function(el){
            cndGroupListGrd.addData({
                roleId : $('.role-select').val(),
                athrtyTpDscd : '03',
                cndGrpTmpltCd : el.code,
                cndGrpTmpltNm : el.name,
                aplyStartDt : PFUtil.getToday() + ' ' + '00:00:00',
                aplyEndDt : '9999-12-31 23:59:59',
                useYn : 'N',
                writeYn : 'N',
                process : 'C'               // create
            });
            modifyFlag = true;
        });

    });
});

// 조건 추가버튼 클릭시
onEvent('click', '.cnd-add-btn', function(e){

    //var newData = [];
	var cndList = [];
	cndListGrd.getAllData().forEach(function(el){
		cndList.push({
			code : el.cndCd,
			name : el.cndNm
		});
	});

    PFPopup.selectConditionTemplate2({cndList: cndList}, function (selectItem) {
        selectItem.forEach(function(el){
            cndListGrd.addData({
                roleId : $('.role-select').val(),
                athrtyTpDscd : '04',
                cndCd : el.code,
                cndNm : el.name,
                aplyStartDt : PFUtil.getToday() + ' ' + '00:00:00',
                aplyEndDt : '9999-12-31 23:59:59',
                useYn : 'N',
                writeYn : 'N',
                process : 'C'               // create
            });
            modifyFlag = true;
        });
    });

});

// 조건속성 추가버튼 클릭시
onEvent('click', '.cnd-atrb-add-btn', function(e){

    var newData = {
        roleId : $('.role-select').val(),
        athrtyTpDscd : '05',
        aplyStartDt : PFUtil.getToday() + ' ' + '00:00:00',
        aplyEndDt : '9999-12-31 23:59:59',
        useYn : 'N',
        writeYn : 'N',
        process : 'C'               // create
    };

    cndAtrbListGrd.addData(newData);
    modifyFlag = true;
});

// 상품기본/관계 추가버튼 클릭시
onEvent('click', '.cnd-pd-base-rel-add-btn', function(e){

    var newData = {
        roleId : $('.role-select').val(),
        athrtyTpDscd : '06',
        aplyStartDt : PFUtil.getToday() + ' ' + '00:00:00',
        aplyEndDt : '9999-12-31 23:59:59',
        useYn : 'N',
        writeYn : 'N',
        process : 'C'               // create
    };

    pdBaseRelListGrd.addData(newData);
    modifyFlag = true;
});

// 개발과제 추가버튼 클릭시
onEvent('click', '.cnd-project-add-btn', function(e){

    var newData = {
        roleId : $('.role-select').val(),
        athrtyTpDscd : '07',
        aplyStartDt : PFUtil.getToday() + ' ' + '00:00:00',
        aplyEndDt : '9999-12-31 23:59:59',
        useYn : 'N',
        writeYn : 'N',
        process : 'C'               // create
    };

    projectListGrd.addData(newData);
    modifyFlag = true;
});

/******************************************************************************************************************
 * 사용자 함수
 ******************************************************************************************************************/
function resetGridData(){
    gridData = [];
    gridDeleteData = [];

    //if(menuListGrd)         menuListGrd.resetData();
    if(menuListGrd) {
    	menuListGrd.setStoreRootNode([]);
    	menuListGrd.expandAll();
    }
    if(categoryListGrd)     categoryListGrd.resetData();
    if(cndGroupListGrd)     cndGroupListGrd.resetData();
    if(cndListGrd)          cndListGrd.resetData();
    if(cndAtrbListGrd)      cndAtrbListGrd.resetData();
    if(pdBaseRelListGrd)    pdBaseRelListGrd.resetData();
    if(projectListGrd)      projectListGrd.resetData();
}

function bindGridData(){
    if(menuListGrd && menuListGrd.getAllData().length == 0) {
    	/**
        menuListGrd.setData($.grep(gridData, function (el, i) {
            return !el.athrtyTpDscd || el.athrtyTpDscd == '01';
        }));
        */
    	if(gridData && gridData.menuMasterWrapVO && gridData.menuMasterWrapVO.menuAllInfoList) {
    		menuListGrd.setStoreRootNode(gridData.menuMasterWrapVO.menuAllInfoList);
    	}
    };

    var roleDetailData = gridData.voList;
    if(!roleDetailData){
    	roleDetailData = [];
    }
    if(categoryListGrd && categoryListGrd.getAllData().length == 0) {
        //categoryListGrd.setData($.grep(gridData, function (el, i) {
        categoryListGrd.setData($.grep(roleDetailData, function (el, i) {
            return el.athrtyTpDscd == '02';
        }));
    }
    if(cndGroupListGrd && cndGroupListGrd.getAllData().length == 0) {
        //cndGroupListGrd.setData($.grep(gridData, function (el, i) {
    	cndGroupListGrd.setData($.grep(roleDetailData, function (el, i) {
            return el.athrtyTpDscd == '03';
        }));
    };
    if(cndListGrd && cndListGrd.getAllData().length == 0) {
        //cndListGrd.setData($.grep(gridData, function (el, i) {
    	cndListGrd.setData($.grep(roleDetailData, function (el, i) {
            return el.athrtyTpDscd == '04';
        }));
    }
    if(cndAtrbListGrd && cndAtrbListGrd.getAllData().length == 0) {
        //cndAtrbListGrd.setData($.grep(gridData, function (el, i) {
    	cndAtrbListGrd.setData($.grep(roleDetailData, function (el, i) {
            return el.athrtyTpDscd == '05';
        }));
    }
    if(pdBaseRelListGrd && pdBaseRelListGrd.getAllData().length == 0) {
        //pdBaseRelListGrd.setData($.grep(gridData, function (el, i) {
        pdBaseRelListGrd.setData($.grep(roleDetailData, function (el, i) {
            return el.athrtyTpDscd == '06';
        }));
    }
    if(projectListGrd && projectListGrd.getAllData().length == 0) {
        //projectListGrd.setData($.grep(gridData, function (el, i) {
    	projectListGrd.setData($.grep(roleDetailData, function (el, i) {
            return el.athrtyTpDscd == '07';
        }));
    }
}

// 역할 콤보 바인딩
function renderRoleComboBox(loadYn) {
    PFRequest.get('/common/role/getRoleMasterList.json',{
        async: false,
        success: function(response) {
            roleArrayObj = response;
            var options = [];
            $.each(response, function(index, role){
                var $option = $('<option>');
                $option.val(role.roleId);
                $option.text(role.roleNm);
                options.push($option);

                roleObj[role.roleId] = role.roleNm;
            });
            $('.role-select').html(options);

            if(loadYn) {
                fnSearch();
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'RoleMasterService',
            operation: 'queryListRoleMaster'
        }
    });
}


/******************************************************************************************************************
 * BIZ 함수(서비스 호출)
 ******************************************************************************************************************/
// 그리드 조회
function fnSearch(){
    resetGridData();

    PFRequest.get('/common/role/getRoleMenuDetailList.json', form.getData(), {
        success: function (responseData) {
            if(responseData) {

                gridData = responseData;

                if(gridData && !gridData.voList) {
                	gridData.voList = [];
                }
                bindGridData();
                modifyFlag = false;
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'RoleMenuDetailService',
            operation: 'queryListRoleMenuDetail'
        }
    });
}

// 그리드 저장
function saveRoleMenuDtl(){

    gridData = [];
    gridData = gridData.concat(gridDeleteData);
    if(menuListGrd && menuListGrd.getAllData().length > 0) {

    	var menuListGridData = menuListGrd.getAllData();
    	var gridDataArr = [];
		for(var i = 0; i < menuListGridData.length; i++) {
			var gridDataObj = {};
			
			// OHS 20180508 - 아래로직 주석처리
			//gridDataObj.roleId = menuListGridData[i].roleId;
			gridDataObj.roleId = $('.role-select').val();
			gridDataObj.athrtyTpDscd = menuListGridData[i].athrtyTpDscd;
		    gridDataObj.menuId = menuListGridData[i].menuId;
		    gridDataObj.scrnId = menuListGridData[i].scrnId;
		    gridDataObj.bizDscd = menuListGridData[i].bizDscd;
		    gridDataObj.pdTpCd = menuListGridData[i].pdTpCd;
		    gridDataObj.pdTpNm = menuListGridData[i].pdTpNm;
		    gridDataObj.pdTmpltCd = menuListGridData[i].pdTmpltCd;
		    gridDataObj.pdTmpltNm = menuListGridData[i].pdTmpltNm;
		    gridDataObj.cndGrpTmpltCd = menuListGridData[i].cndGrpTmpltCd;
		    gridDataObj.cndGrpTmpltNm = menuListGridData[i].cndGrpTmpltNm;
		    gridDataObj.cndCd = menuListGridData[i].cndCd;
		    gridDataObj.cndNm = menuListGridData[i].cndNm;
		    gridDataObj.atrbDscd = menuListGridData[i].atrbDscd;
		    gridDataObj.aplyStartDt = '2000-01-01 00:00:00';
		    gridDataObj.aplyEndDt = '9999-12-31 23:59:59';
		    gridDataObj.useYn = menuListGridData[i].useYn;
		    gridDataObj.writeYn = menuListGridData[i].writeYn;
		    gridDataObj.process = menuListGridData[i].process;
		    gridDataObj.pdInfoDscd = "";
		    gridDataObj.pdTmpltCd = "";
		    gridDataObj.pdTmpltNm = "";
		    gridDataObj.pdTpCd = "";
		    gridDataObj.pdTpNm = "";
		    gridDataObj.atrbDscd = "";
		    gridDataObj.bizDscd = "";
		    gridDataObj.cndCd = "";
		    gridDataObj.cndGrpTmpltCd = "";
		    gridDataObj.cndGrpTmpltNm = "";
		    gridDataObj.cndNm = "";

			gridDataArr.push(gridDataObj);
			if(menuListGridData[i].children && menuListGridData[i].children.length > 0) {
				_checkDuplicateData(menuListGridData[i].children);
			}
		}

		function _checkDuplicateData(_gridData) {
			if(_gridData && _gridData.length > 0) {
				for(var i = 0; i < _gridData.length; i++) {
					var gridDataObj = {};
					
					// OHS 20180508 - 아래로직 주석처리
					//gridDataObj.roleId = _gridData[i].roleId;
					gridDataObj.roleId = $('.role-select').val();
					gridDataObj.athrtyTpDscd = _gridData[i].athrtyTpDscd;
				    gridDataObj.menuId = _gridData[i].menuId;
				    gridDataObj.scrnId = _gridData[i].scrnId;
				    gridDataObj.bizDscd = _gridData[i].bizDscd;
				    gridDataObj.pdTpCd = _gridData[i].pdTpCd;
				    gridDataObj.pdTpNm = _gridData[i].pdTpNm;
				    gridDataObj.pdTmpltCd = _gridData[i].pdTmpltCd;
				    gridDataObj.pdTmpltNm = _gridData[i].pdTmpltNm;
				    gridDataObj.cndGrpTmpltCd = _gridData[i].cndGrpTmpltCd;
				    gridDataObj.cndGrpTmpltNm = _gridData[i].cndGrpTmpltNm;
				    gridDataObj.cndCd = _gridData[i].cndCd;
				    gridDataObj.cndNm = _gridData[i].cndNm;
				    gridDataObj.atrbDscd = _gridData[i].atrbDscd;
				    gridDataObj.aplyStartDt = '2000-01-01 00:00:00';
				    gridDataObj.aplyEndDt = '9999-12-31 23:59:59';
				    gridDataObj.useYn = _gridData[i].useYn;
				    gridDataObj.writeYn = _gridData[i].writeYn;
				    gridDataObj.process = _gridData[i].process;
				    gridDataObj.pdInfoDscd = "";
				    gridDataObj.pdTmpltCd = "";
				    gridDataObj.pdTmpltNm = "";
				    gridDataObj.pdTpCd = "";
				    gridDataObj.pdTpNm = "";
				    gridDataObj.atrbDscd = "";
				    gridDataObj.bizDscd = "";
				    gridDataObj.cndCd = "";
				    gridDataObj.cndGrpTmpltCd = "";
				    gridDataObj.cndGrpTmpltNm = "";
				    gridDataObj.cndNm = "";

					gridDataArr.push(gridDataObj);
					if(_gridData[i].children && _gridData[i].children.length > 0) {
						_checkDuplicateData(_gridData[i].children);
					}
				}
			}
		}
		gridData = gridData.concat(gridDataArr);
    }
    if(categoryListGrd)     gridData = gridData.concat(categoryListGrd.getAllData());
    if(cndGroupListGrd)     gridData = gridData.concat(cndGroupListGrd.getAllData());
    if(cndListGrd)          gridData = gridData.concat(cndListGrd.getAllData());
    if(cndAtrbListGrd)      gridData = gridData.concat(cndAtrbListGrd.getAllData());
    if(pdBaseRelListGrd)    gridData = gridData.concat(pdBaseRelListGrd.getAllData());
    if(projectListGrd)      gridData = gridData.concat(projectListGrd.getAllData());

    if(gridData.length == 0){
        PFComponent.showMessage(bxMsg('saveNoData'), 'warning');
        return;
    }

    gridData = $.grep(gridData, function(el, i){
    	if(el.athrtyTpDscd == '01') {
    		return true;
    	}
    	/**
    	 * OHS 2017.11.23 - 주석처리, 역할별권한관리 메뉴 이외의 탭 데이터 소실버그
    	else if(el.process != null && el.process != '') {
    		return false;
    	}
    	*/
    	else {
            return  el.process != null && el.process != '';
    	}
    });

    var checkMandatory = true;
    gridData.forEach(function(el){
        if(el.process != 'D' && el.athrtyTpDscd == '02' && el.bizDscd == '*'){
            checkMandatory = false;
        }
    });
    if(!checkMandatory){
        PFComponent.showMessage(bxMsg('BizDscdSelectError'), 'warning');
        return;
    }

    var requestParam = {
        voList: gridData
    };

    if(!modifyFlag){
		// 변경된 정보가 없습니다.
		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
		return;
	}

    PFRequest.post('/common/role/saveRoleMenuDetail.json', requestParam, {
        success: function(responseData) {
            if (responseData === true) {
                PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                fnSearch();
            }
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'RoleMenuDetailService',
            operation: 'saveRoleMenuDetail'
        }
    });
}


/******************************************************************************************************************
 * render 함수
 ******************************************************************************************************************/

// 메인화면 초기세팅
function renderRoleMenuDtlList() {

    $('.pf-page-conts').html(roleMenuDtlListTpl());
    form = PFComponent.makeYGForm($('.role-menu-query-table'));

    PFUtil.getAllDatePicker(false);
    $('.base-search-date').val(PFUtil.getToday());

    renderRoleComboBox(true);
    fnGetProjectTypeData();

    renderGridTab();

}

function fnGetProjectTypeData(){
    // 개발과제유형 콤보 바인딩
    PFRequest.get('/projecttype/getProjectTypeMasterList.json', {}, {
        success: function (responseData) {

            $.each(responseData, function (index, projectType) {
                mapProjectType[projectType.projectTypeCode] = projectType.projectTypeName;
                arrProjectType.push({
                    code : projectType.projectTypeCode
                  , name : projectType.projectTypeName
                });
            });

        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'ProjectTypeMasterService',
            operation: 'queryListProjectTypeMaster'
        }
    });
}

function renderGridTab(data){
    PFUI.use('pfui/tab', function(Tab){

        var tab = new Tab.Tab({
            render : '#role-list-grid-tab',
            elCls : 'nav-tabs',
            autoRender: true,
            children:[
                {text:bxMsg('Menu'),value:data, index:1}		            // 메뉴
              , {text:bxMsg('category'),value:data, index:2}		        // 분류
              , {text:bxMsg('ConditionGroup'),value:data, index:3}		    // 조건군
              , {text:bxMsg('DPM100TabSring2'),value:data, index:4}		    // 조건
              , {text:bxMsg('ConditionAttribute'),value:data, index:5}		// 조건속성
              , {text:bxMsg('PdBaseRelation'),value:data, index:6}		    // 상품기본/관계
              , {text:bxMsg('Project'),value:data, index:7}		            // 개발과제
            ]
        });

        tab.on('selectedchange', function(ev){
            var item = ev.item;

            switch(item.get('index')){
                case 1:
                    $('.role-grid-wrap').not($('.menu-list-grid-wrap')).hide();
                    $('.menu-list-grid-wrap').show();
                    if(!menuListGrd) {
                        $('.menu-list-grid-wrap').html(menuListGrdTpl());
                        //menuListGrd = renderGrid('01');
                        // OHS 2017.08.11 신규 작성 (메뉴관리 외부화)
                        menuListGrd = renderMenuListGrid('01');
                    }
                    break;

                case 2:
                    $('.role-grid-wrap').not($('.category-list-grid-wrap')).hide();
                    $('.category-list-grid-wrap').show();
                    if(!categoryListGrd) {
                        $('.category-list-grid-wrap').html(categoryListGrdTpl());
                        categoryListGrd = renderGrid('02');
                    }
                    break;

                case 3:
                    $('.role-grid-wrap').not($('.cnd-grp-list-grid-wrap')).hide();
                    $('.cnd-grp-list-grid-wrap').show();
                    if(!cndGroupListGrd) {
                        $('.cnd-grp-list-grid-wrap').html(cndGroupListGrdTpl());
                        cndGroupListGrd = renderGrid('03');
                    }
                    break;

                case 4:
                    $('.role-grid-wrap').not($('.cnd-list-grid-wrap')).hide();
                    $('.cnd-list-grid-wrap').show();
                    if(!cndListGrd) {
                        $('.cnd-list-grid-wrap').html(cndListGrdTpl());
                        cndListGrd = renderGrid('04');
                    }
                    break;

                case 5:
                    $('.role-grid-wrap').not($('.atrb-list-grid-wrap')).hide();
                    $('.atrb-list-grid-wrap').show();
                    if(!cndAtrbListGrd) {
                        $('.atrb-list-grid-wrap').html(cndAtrbListGrdTpl());
                        cndAtrbListGrd = renderGrid('05');
                    }
                    break;

                case 6:
                    $('.role-grid-wrap').not($('.pd-base-rel-list-grid-wrap')).hide();
                    $('.pd-base-rel-list-grid-wrap').show();
                    if(!pdBaseRelListGrd) {
                        $('.pd-base-rel-list-grid-wrap').html(pdBaseRelListGrdTpl());
                        pdBaseRelListGrd = renderGrid('06');
                    }
                    break;

                case 7:
                    $('.role-grid-wrap').not($('.project-list-grid-wrap')).hide();
                    $('.project-list-grid-wrap').show();
                    if(!projectListGrd) {
                        $('.project-list-grid-wrap').html(projectListGrdTpl());
                        projectListGrd = renderGrid('07');
                    }
                    break;
            }

            bindGridData();
        });

        tab.setSelected(tab.getItemAt(0), 1);
    });
}

// 그리드
function renderGrid(athrtyTpDscd) {

    var roleGrid;
    var selectedCellIndex;
    var columns = [];
    var renderClass;

    if(athrtyTpDscd == '01'){
        renderClass = '.pf-crm-role-menu-list-grid';
        columns.push({text: bxMsg('MenuNm'), flex:1, dataIndex: 'menuNm', style: 'text-align:center'});     // 메뉴명
        columns.push({text: bxMsg('ScrnNm'), flex:2, dataIndex: 'scrnNm', style: 'text-align:center'});     // 화면명
    }else{
        if(athrtyTpDscd == '02'){ // 분류
            renderClass = '.pf-crm-role-category-list-grid';
            columns.push({
                text: bxMsg('pdInfoDscd'), dataIndex: 'pdInfoDscd', style: 'text-align:center', sortable: false, flex:1,
                renderer: function (value) {
                    return codeMapObj['PdInfoDscd'][value];
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
                        data: codeArrayObj['PdInfoDscd']
                    }),
                    listeners: {
                        'change': function (_this, newValue, oldValue, eOpts) {

                        }
                    }
                }
            });

            columns.push({text: bxMsg('DPS0101String10'), flex:1, dataIndex: 'bizDscdNm', style: 'text-align:center'});      // 업무구분코드
            columns.push({text: bxMsg('DPS0101String2'), flex:1, dataIndex: 'pdTpNm', style: 'text-align:center'});        // 상품유형
            columns.push({text: bxMsg('DPS0101String3'), flex:1, dataIndex: 'pdTmpltNm', style: 'text-align:center'});     // 상품템플릿
        }else if(athrtyTpDscd == '03'){   // 조건군
            renderClass = '.pf-crm-role-cnd-group-list-grid';
            columns.push({
                text: bxMsg('ConditionGroup'), flex:1, dataIndex: 'cndGrpTmpltCd', style: 'text-align:center'
            });
            columns.push({
                text: bxMsg('ConditionGroupName'), flex:2, dataIndex: 'cndGrpTmpltNm', style: 'text-align:center'
            });
        }else if(athrtyTpDscd == '04'){   // 조건
            renderClass = '.pf-crm-role-cnd-list-grid';
            columns.push({
                text: bxMsg('DPM100TabSring2'), flex:1, dataIndex: 'cndCd', style: 'text-align:center'
            });
            columns.push({
                text: bxMsg('cndNm'), flex:2, dataIndex: 'cndNm', style: 'text-align:center'
            });
        }else if(athrtyTpDscd == '05'){   // 조건속성
            renderClass = '.pf-crm-role-atrb-list-grid';
            columns.push({
                text: bxMsg('ConditionAttribute'), dataIndex: 'atrbDscd', style: 'text-align:center', sortable: false, flex:1,
                renderer: function (value) {
                    return codeMapObj['CndAttribute'][value];
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
                        data: codeArrayObj['CndAttribute']
                    })
                }
            });
        }else if(athrtyTpDscd == '06'){   // 상품기본관계
            renderClass = '.pf-crm-role-pd-base-rel-list-grid';
            columns.push({
                text: bxMsg('PdBaseRelation'), dataIndex: 'atrbDscd', style: 'text-align:center', sortable: false, flex:1,
                renderer: function (value) {
                    return codeMapObj['PdBaseRelationDscd'][value];
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
                        data: codeArrayObj['PdBaseRelationDscd']
                    })
                }
            });
        }else if(athrtyTpDscd == '07'){   // 개발과제유형
            renderClass = '.pf-crm-role-project-list-grid';
            columns.push({
                text: bxMsg('Project'), dataIndex: 'atrbDscd', style: 'text-align:center', sortable: false, flex:1,
                renderer: function (value) {
                    return mapProjectType[value];
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
                        data: arrProjectType
                    })
                }
            });
        }

        columns.push({   // 적용시작일자
            text: bxMsg('DPP0127String6'), flex:1, sortable: false, dataIndex: 'aplyStartDt', align: 'center',
            editor: {
                allowBlank: false,
                listeners: {
                    focus: function(_this) {
                        var isNextDay = true;
                        if(getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                            isNextDay == false;
                        }
                        PFUtil.getGridDateTimePicker(_this, 'applyStart', roleGrid, selectedCellIndex, isNextDay);
                    },
                    blur: function(_this, e){
                        PFUtil.checkDate(e.target);
                    }
                }
            },
            listeners: {
                click: function() {
                    selectedCellIndex = $(arguments[1]).parent().index();
                }
            }
        });

        columns.push(   // 적용종료일자
            {
                text: bxMsg('DPP0127String7'), flex:1, sortable: false, dataIndex: 'aplyEndDt', align: 'center',
                editor: {
                    allowBlank: false,
                    listeners: {
                        focus: function(_this) {
                            var isNextDay = true;
                            if(getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                                isNextDay == false;
                            }
                            PFUtil.getGridDateTimePicker(_this, 'applyEnd', roleGrid, selectedCellIndex, isNextDay);
                        },
                        blur: function(_this, e){
                            PFUtil.checkDate(e.target, '9999-12-31 23:59:59');
                        }
                    }
                },
                listeners: {
                    click: function() {
                        selectedCellIndex = $(arguments[1]).parent().index();
                    }
                }
            }
        );
    }

    // 상품기본/관계정보인 경우에는 사용여부 제외
    if(athrtyTpDscd != '06') {
        columns.push(   // 사용여부
            {
                xtype: 'checkcolumn', text: bxMsg('PAS0301String4'), width: 80, dataIndex: 'useYnB',
                listeners: {
                    checkchange: function (column, rowIndex, checked, record, eOpts) {
                        if (checked) {
                            record.set('useYn', 'Y');
                            record.set('useYnB', true);
                        } else {
                            record.set('useYn', 'N');
                            record.set('useYnB', false);
                            record.set('writeYn', 'N');
                            record.set('writeYnB', false);
                        }

                        var record = roleGrid.store.getAt(rowIndex);

                        if (record.get('process') != 'C') {
                            record.set('process', 'U');
                        }

                        if (record.get('scrnId') == '000') {
                            $.each(roleGrid.store.data.items, function (index, item) {
                                if (item.get('menuId') == record.get('menuId')) {
                                    item.set('useYn', record.get('useYn'));
                                    item.set('useYnB', record.get('useYnB'));

                                    if (item.get('process') != 'C') {
                                    	item.set('process', 'U');
                                    }

                                    // 해제 시에는 쓰기여부도 해제
                                    if (!checked) {
                                        item.set('writeYn', 'N');
                                        item.set('writeYnB', false);
                                    }
                                }
                            });
                        }

                        modifyFlag = true;
                    }
                }
            }
        );
    }

    if(athrtyTpDscd != '05' && athrtyTpDscd != '07') {
        columns.push(   // 쓰기여부
            {
                xtype: 'checkcolumn', text: bxMsg('WriteYn'), width: 80, dataIndex: 'writeYnB',
                listeners: {
                    checkchange: function (column, rowIndex, checked, record, eOpts) {
                        if (checked) {
                            record.set('writeYn', 'Y');
                            record.set('writeYnB', true);
                        } else {
                            record.set('writeYn', 'N');
                            record.set('writeYnB', false);
                        }

                        var record = roleGrid.store.getAt(rowIndex);
                        if (record.get('process') != 'C') {
                            record.set('process', 'U');
                        }

                        if (record.get('scrnId') == '000') {
                            $.each(roleGrid.store.data.items, function (index, item) {
                                if (item.get('menuId') == record.get('menuId')) {
                                    item.set('writeYn', record.get('writeYn'));
                                    item.set('writeYnB', record.get('writeYnB'));
                                }
                            });
                        }
                        modifyFlag = true;
                    }
                }
            }
        );
    }

    if(athrtyTpDscd != '01') {
        columns.push({
            xtype: 'actioncolumn', width: 35, align: 'center', sortable: false,
            renderer: function (val, metadata, record) {
                this.items[0].icon = '/images/x-delete-16.png';
            },
            items: [{
                icon: '',
                handler: function (grid, rowIndex, colIndex, item, e, record) {

                    if (record.data.process != 'C') {
                        record.data.process = 'D';
                        gridDeleteData.push(record.data);
                    }
                    record.destroy();
                    modifyFlag = true;
                }
            }]
        });
    }


    roleGrid = PFComponent.makeExtJSGrid({
        fields: ['process','roleId', 'athrtyTpDscd', 'menuId', 'scrnId','pdInfoDscd'
            ,'bizDscd',{
                name : 'bizDscdNm',
                convert: function(newValue, record){
                    if(record.get('bizDscd') == '*'){
                        return bxMsg('Z_All');
                    }else{
                        return codeMapObj['ProductCategoryLevelOneCode'][record.get('bizDscd')];;
                    }
                }
            }
            ,'pdTpCd',{
                name: 'pdTpNm',
                convert: function(newValue, record){
                    if(record.get('pdTpCd') == '*'){
                        return bxMsg('Z_All');
                    }else{
                        return newValue;
                    }
                }
            },
            'pdTmpltCd',{
                name:'pdTmpltNm',
                convert: function(newValue, record){
                    if(record.get('pdTmpltCd') == '*'){
                        return bxMsg('Z_All');
                    }else{
                        return newValue;
                    }
                }
            }
            ,'cndGrpTmpltCd','cndGrpTmpltNm',
            'cndCd','cndNm','atrbDscd',
            'aplyStartDt','aplyEndDt',
            'useYn', {
                name: 'useYnB',
                convert: function (newValue, record) {
                    return !!(record.get('useYn') == 'Y');
                }
            }, 'writeYn',{
                name: 'writeYnB',
                convert: function (newValue, record) {
                    return !!(record.get('writeYn') == 'Y');
                }
            }, {
                name: 'menuNm',
                convert: function (newValue, record) {
                    if(record.get('scrnId') != '000'){
                        return;
                    }
                    return bxMsg('MENU' + record.get('menuId') + '000');
                }
            }, {
                name: 'scrnNm',
                convert: function (newValue, record){
                    if(record.get('scrnId') == '000'){
                        return;
                    }
                    return bxMsg('MENU' + record.get('menuId') + record.get('scrnId'));
                }
            }
        ],
        //dataRoot: 'list',
        gridConfig: {
            renderTo: renderClass,
            columns: columns,
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                        afteredit: function(e, editor){
                            if(editor.originalValue !=  editor.value){

                                if(editor.field != 'aplyEndDt' &&
                                    editor.field != 'useYn' && editor.field != 'useYnB' &&
                                    editor.field != 'writeYn' && editor.field != 'writeYnB' &&
                                    (editor.record.get('process') == null || editor.record.get('process').length == 0)){

                                    var originalData = $.extend(true, {}, editor.record.data);
                                    originalData[editor.field] = editor.record.modified[editor.field];
                                    originalData['process'] = 'D';
                                    gridDeleteData.push(originalData);

                                    editor.record.set('process', 'C');
                                }

                                else if(editor.record.get('process') != 'C'){
                                    editor.record.set('process', 'U');
                                }

                                modifyFlag = true;
                            }
                        }
                    }
                })
            ],
            listeners: {
                afterrender : function(){

                },
                cellclick : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {

                    switch(_this.headerCt.getHeaderAtIndex(cellIndex).dataIndex){
                        case 'bizDscdNm' :
                            var dmnCd;
                            if(record.get('pdInfoDscd') == '01'){
                                dmnCd = 'P0003';
                            }else if(record.get('pdInfoDscd') == '02'){
                                dmnCd = 'P0004';
                            }else if(record.get('pdInfoDscd') == '03'){
                                dmnCd = 'P0005';
                            }
                            PFPopup.selectCommonCodeDetail({
                              code: dmnCd,
                              codeNm: bxMsg('DPS0101String10')
                            }, function (selectItem) {
                                if(selectItem) {
                                    if(record.get('process') == null || record.get('process').length == 0){
                                        var originalData = $.extend(true, {}, record.data);
                                        originalData['process'] = 'D';
                                        gridDeleteData.push(originalData);
                                        record.set('process', 'C');
                                    }
                                    record.set('bizDscd', selectItem.instanceCode);
                                    record.set('bizDscdNm', selectItem.instanceName);
                                    record.set('pdTpCd', '*');
                                    record.set('pdTpNm', bxMsg('Z_All'));
                                    record.set('pdTmpltCd', '*');
                                    record.set('pdTmpltNm', bxMsg('Z_All'));
                                    
                                    modifyFlag = true;
                                }
                            });
                            break;

                        case 'pdTpNm' :
                            if(record.get('bizDscd') == '*'){
                                PFComponent.showMessage(bxMsg('BizDscdSelectErrorMsg'), 'warning');
                                return;
                            }

                            PFPopup.selectProductType({
                              pdInfoDscd: record.get('pdInfoDscd'),
                              bizDscd: record.get('bizDscd')
                            }, function (selectItem) {
                                if(record.get('process') == null || record.get('process').length == 0) {
                                    var originalData = $.extend(true, {}, record.data);
                                    originalData['process'] = 'D';
                                    gridDeleteData.push(originalData);
                                }

                                record.set('process', 'C');
                                record.set('pdTpCd', selectItem.code);
                                record.set('pdTpNm', selectItem.name);
                                record.set('pdTmpltCd', '*');
                                record.set('pdTmpltNm', bxMsg('Z_All'));
                                
                                modifyFlag = true;
                            });
                            break;

                        case 'pdTmpltNm':
                            var submitEvent = function(selectItem){
                                if(selectItem) {

                                    if(record.get('process') == null || record.get('process').length == 0) {
                                        var originalData = $.extend(true, {}, record.data);
                                        originalData['process'] = 'D';
                                        gridDeleteData.push(originalData);
                                    }

                                    record.set('process', 'C');
                                    record.set('pdTmpltCd', selectItem.code);
                                    record.set('pdTmpltNm', selectItem.name);
                                    
                                    modifyFlag = true;
                                }
                            };

                            if(record.get('bizDscd') == '*'){
                                PFComponent.showMessage(bxMsg('BizDscdSelectErrorMsg'), 'warning');
                                return;
                            }
                            if(record.get('pdTpCd') == '*'){
                                PFComponent.showMessage(bxMsg('PdTpCdSelectErrorMsg'), 'warning');
                                return;
                            }

                            PFPopup.selectProductTemplate({
                              pdInfoDscd: record.get('pdInfoDscd'),
                              bizDscd: record.get('bizDscd'),
                              pdTpCd: record.get('pdTpCd')
                            }, function (selectItem) {
                                if(record.get('process') == null || record.get('process').length == 0) {
                                    var originalData = $.extend(true, {}, record.data);
                                    originalData['process'] = 'D';
                                    gridDeleteData.push(originalData);
                                }

                                record.set('process', 'C');
                                record.set('pdTmpltCd', selectItem.code);
                                record.set('pdTmpltNm', selectItem.name);
                                
                                modifyFlag = true;
                            });
                            break;

                        case 'cndGrpTmpltCd':
                            break;

                        case 'cndCd':
                            break;
                    }
                }
            }
        }
    });

    return roleGrid;
}

//그리드
function renderMenuListGrid(athrtyTpDscd) {

    var roleGrid;
    var selectedCellIndex;
    var columns = [];
    var renderClass;

    if(athrtyTpDscd == '01'){
        renderClass = '.pf-crm-role-menu-list-grid';
        columns.push({xtype: 'treecolumn', text: bxMsg('MenuNm'), flex:1, dataIndex: 'menuNm', style: 'text-align:center'});     // 메뉴명
        columns.push({text: bxMsg('ScrnNm'), flex:2, dataIndex: 'scrnNm', style: 'text-align:center'});     // 화면명
    }

    // 상품기본/관계정보인 경우에는 사용여부 제외
    if(athrtyTpDscd != '06') {
        columns.push(   // 사용여부
            {
                xtype: 'checkcolumn', text: bxMsg('PAS0301String4'), width: 80, dataIndex: 'useYnB',
                listeners: {

                    checkchange: function (column, rowIndex, checked, record, eOpts) {
                        if (checked) {
                            //roleGrid.getAt(rowIndex).set('useYn', 'Y');
                        	//roleGrid.store.getRootNode().getChildAt(rowIndex).set('useYn', 'Y');
                        	record.set('useYn', 'Y');
                        	record.set('useYnB', true);

                        	// 부모노드의 사용여부가 N일경우 Y로 변경
                        	// 단, 부모노드의 뎁스가 0(루트)일경우 제외
                        	if(record.parentNode.data.depth != 0
                        			&&record.parentNode.data.useYn == 'N'
                        				&& !record.parentNode.data.useYnB) {
                        		record.parentNode.set('useYn', 'Y');
                        		record.parentNode.set('useYnB', true);
                        	}
                        } else {
                            //roleGrid.getAt(rowIndex).set('useYn', 'N');
                            //roleGrid.getAt(rowIndex).set('writeYn', 'N');
                            //roleGrid.getAt(rowIndex).set('writeYnB', false);

                            //roleGrid.store.getRootNode().getChildAt(rowIndex).set('useYn', 'N');
                            //roleGrid.store.getRootNode().getChildAt(rowIndex).set('writeYn', 'N');
                            //roleGrid.store.getRootNode().getChildAt(rowIndex).set('writeYnB', false);

                            record.set('useYn', 'N');
                            record.set('writeYn', 'N');
                            record.set('writeYnB', false);
                            record.set('useYnB', false);
                        }

                        //var record = roleGrid.store.getRootNode().getChildAt(rowIndex);

                        if (record.get('process') != 'C') {
                            record.set('process', 'U');
                        }
                        //record.commit();
                        if (record.get('scrnId') == 'SCRN000' || record.get('scrnId') == '' || record.get('scrnId') == null) {
                            $.each(record.childNodes, function (index, item) {
                                if (item.get('menuId') == record.get('menuId')) {
                                    item.set('useYn', record.get('useYn'));
                                    item.set('useYnB', record.get('useYnB'));

                                    if (item.get('process') != 'C') {
                                    	item.set('process', 'U');
                                    }

                                    // 해제 시에는 쓰기여부도 해제
                                    if (!checked) {
                                        item.set('writeYn', 'N');
                                        item.set('writeYnB', false);
                                    }
                                }
                            });
                        }

                        modifyFlag = true;
                    }
                }
            }
        );
    }

    if(athrtyTpDscd != '05' && athrtyTpDscd != '07') {
        columns.push(   // 쓰기여부
            {
                xtype: 'checkcolumn', text: bxMsg('WriteYn'), width: 80, dataIndex: 'writeYnB',
                listeners: {
                    checkchange: function (column, rowIndex, checked, record, eOpts) {
                        if (checked) {
                        	//roleGrid.store.getRootNode().getChildAt(rowIndex).set('writeYn', 'Y');
                        	record.set('writeYn', 'Y');
                        	record.set('writeYnB', true);

                          	// 부모노드의 사용여부가 N일경우 Y로 변경
                        	// 단, 부모노드의 뎁스가 0(루트)일경우 제외
                        	if(record.parentNode.data.depth != 0
                        			&&record.parentNode.data.writeYn == 'N'
                        				&& !record.parentNode.data.writeYnB) {
                        		record.parentNode.set('writeYn', 'Y');
                        		record.parentNode.set('writeYnB', true);
                        	}
                        } else {
                        	//roleGrid.store.getRootNode().getChildAt(rowIndex).set('writeYn', 'N');
                        	record.set('writeYn', 'N');
                        	record.set('writeYnB', false);
                        }

                        //var record = roleGrid.store.getRootNode().getChildAt(rowIndex);
                        if (record.get('process') != 'C') {
                            record.set('process', 'U');
                        }
                        //record.commit();
                        if (record.get('scrnId') == 'SCRN000' || record.get('scrnId') == '' || record.get('scrnId') == null) {
                            $.each(record.childNodes, function (index, item) {
                                if (item.get('menuId') == record.get('menuId')) {
                                    item.set('writeYn', record.get('writeYn'));
                                    item.set('writeYnB', record.get('writeYnB'));
                                }
                            });
                        }

                        modifyFlag = true;
                    }
                }
            }
        );
    }

    roleGrid = PFComponent.makeExtTreeGrid({
        fields: ['process','roleId', 'athrtyTpDscd', 'menuId', 'scrnId','pdInfoDscd', 'children'
            ,'bizDscd',{
                name : 'bizDscdNm',
                convert: function(newValue, record){
                    if(record.get('bizDscd') == '*'){
                        return bxMsg('Z_All');
                    }else{
                        return codeMapObj['ProductCategoryLevelOneCode'][record.get('bizDscd')];;
                    }
                }
            }
            ,'pdTpCd',{
                name: 'pdTpNm',
                convert: function(newValue, record){
                    if(record.get('pdTpCd') == '*'){
                        return bxMsg('Z_All');
                    }else{
                        return newValue;
                    }
                }
            },
            'pdTmpltCd',{
                name:'pdTmpltNm',
                convert: function(newValue, record){
                    if(record.get('pdTmpltCd') == '*'){
                        return bxMsg('Z_All');
                    }else{
                        return newValue;
                    }
                }
            }
            ,'cndGrpTmpltCd','cndGrpTmpltNm',
            'cndCd','cndNm','atrbDscd',
            'aplyStartDt','aplyEndDt',
            'useYn', {
                name: 'useYnB',
                convert: function (newValue, record) {
                    return !!(record.get('useYn') === 'Y');
                }
            }, 'writeYn',{
                name: 'writeYnB',
                convert: function (newValue, record) {
                    return !!(record.get('writeYn') === 'Y');
                }
            }, {
                name: 'menuNm'
//                ,
//                convert: function (newValue, record) {
//
//                    if(record.get('scrnId') != '000'){
//                        return;
//                    }
//                    return bxMsg('MENU' + record.get('menuId') + '000');
//
//                }
            }, {
                name: 'scrnNm'
//                	,
//                convert: function (newValue, record){
//                    if(record.get('scrnId') == '000'){
//                        return;
//                    }
//                    return bxMsg('MENU' + record.get('menuId') + record.get('scrnId'));
//                }
            }
            ,
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
            }
        ],
        //dataRoot: 'list',
        gridConfig: {
            renderTo: renderClass,
           	expanded: false,
            columns: columns,
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                 	pluginId: 'treeGridCellEdit',
                    clicksToEdit: 1,
                    listeners:{
                        afteredit: function(e, editor){
                            if(editor.originalValue !=  editor.value){

                                if(editor.field != 'aplyEndDt' &&
                                    editor.field != 'useYn' && editor.field != 'useYnB' &&
                                    editor.field != 'writeYn' && editor.field != 'writeYnB' &&
                                    (editor.record.get('process') == null || editor.record.get('process').length == 0)){

                                    var originalData = $.extend(true, {}, editor.record.data);
                                    originalData[editor.field] = editor.record.modified[editor.field];
                                    originalData['process'] = 'D';
                                    gridDeleteData.push(originalData);

                                    editor.record.set('process', 'C');
                                }

                                else if(editor.record.get('process') != 'C'){
                                    editor.record.set('process', 'U');
                                }
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
                afterrender : function(){
                },
                cellclick : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                }
            }
        }
    });

    return roleGrid;
}