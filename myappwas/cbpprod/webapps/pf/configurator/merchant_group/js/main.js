/**
 * merchant group java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {
    $('body').css('overflow-y', 'scroll');
    lengthVlad('.length-check-input', 50);
    PFComponent.toolTip($el);

    // Start Rendering Page
    renderMerchantTreeBox();                       // 상품분류 Tree Box

});

var modifyFlag = false;
var selectedCellIndex;

var $el = $('.pf-mg');          // Page Root jQuery Element

var navTree, navTreeStore,
    relatedPdGrid,
    conditionInfoGrid;

var merchant = '01';

var classForEvent;

var pdInfoDscd = '01';  // 초기값 = 상품
var loginTntInstId, tntInstId, mother;

var clickEventForNewData = {};

var productRelgridDeleteData = [];

var onEvent = PFUtil.makeEventBinder($el);

var lengthVlad = PFValidation.realTimeLengthCheck($el);

// Load Template in HTML
const merchantLeftTreeTpl = getTemplate('merchantLeftTreeTpl');
const merchantDetailInfoTpl = getTemplate('merchantDetailInfoTpl');
const merchantInfoFormTpl = getTemplate('merchantInfoFormTpl');
const merchantGroupManagementPopupTpl = getTemplate('merchantGroupManagementPopupTpl'); // 가맹점그룹 관리
/******************************************************************************************************************
 * 이벤트 함수
 ******************************************************************************************************************/

onEvent('click', 'a', (e) => {
    e.preventDefault();
});

onEvent('click', '.refresh-icon', () => {
    renderMerchantNavTree.isRendered = false;
    renderMerchantNavTree();
    $('.pf-detail-wrap').removeClass('active');
});

onEvent('click', '.sidebar-toggler', () => {
    $el.toggleClass('contents-expand');
    setTimeout(() => {
      $('.manual-resize-component:visible').resize();
    }, 600);
});

onEvent('change', '.pf-multi-entity', (e) => {
    tntInstId = $el.find('.pf-multi-entity').val();     // 기관콤보 change 시 tntInstId 변경

    $('.tab-nav-list').empty();
    $('.tab-content').empty();

    if ($(e.currentTarget).val() !== getLoginTntInstId()) {
        $($('.default-layout-task-menu').find('.your-task')[0]).attr('data-status', 'true');
        $($('.default-layout-task-menu').find('.your-task')[0]).removeClass('task-hide');
        $($('.default-layout-task-menu').find('.your-task')[0]).val('');
        $($('.default-layout-task-menu').find('.my-task-list')[0]).addClass('task-hide');
    } else {
        $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).removeAttr('data-status');
        $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).addClass('task-hide');
        $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).removeClass('task-hide');
        $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).find('option').eq(0).prop('selected',true);
    }

    renderMerchantNavTree.isRendered = false;
    renderMerchantInfo();
    $el.find('.pf-mg-info-wrap').removeClass('active');
});


// add button click event
onEvent('click', '.add-rel-product-btn', () => {
  PFPopup.selectMerchant({}, (selectItem) => {
    clickEventForNewData.merchantNumber = selectItem.merchantCode;
    clickEventForNewData.merchantName = selectItem.merchantName;
    setNewGridData(clickEventForNewData, relatedPdGrid);
  });
});

onEvent('click', '.product-save-btn', () => {
  saveMerchantRelation();
});


onEvent('click', '.merchant-save-btn', () => {
  saveMerchantGroup('UPDATE');
});

onEvent('click', '.merchant-delete-btn', (e) => {
  PFComponent.showConfirm(bxMsg('DPE00001_Delete_Confirm'), () => {
    deleteMerchant(treeItem);
  });
});


/******************************************************************************************************************
 * BIZ 함수
 ******************************************************************************************************************/
//분류 저장
function saveMerchantGroup(work, isPopup) {
  return new Promise((resolve, reject = function() {}) => {
    if (!hasValidProjectId()) {
      reject(new Error());
      return;
    }

    const parent = isPopup ? '.pfui-dialog' : '.pf-mg-info';
    var form = PFComponent.makeYGForm($(`${parent} .pf-merchant-group-form`));

    var name = $('.merchant-group-name').val();       // 가맹점그룹기본명

    if (!name) {
      PFComponent.showMessage(bxMsg('merchantGroupNameError'), 'warning');          // 가맹점그룹명은 필수입력사항입니다
      reject(new Error());
      return;
    }

    var nameLengthCheck = PFValidation.finalLengthCheck('', 100, name);
    var mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');

    let request;
    if (work === "CREATE") {
      request = Requests.createMerchantGroup;
    } else if (work === "UPDATE") {
      request = Requests.updateMerchantGroup;

      if (!modifyFlag){
        // 변경된 정보가 없습니다.
        PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
        return;
      }
    }

    var requestData = form.getData();
    requestData.pdInfoDscd = pdInfoDscd;
    requestData.projectId = getSelectedProjectId();
    requestData.tntInstId = tntInstId;

    if (nameLengthCheck && mandatoryCheck){

      if (work === 'UPDATE') {
        data = navTreeStore.findNode(requestData.merchantGroupCode);
      }

      request(requestData).then((responseData) => {
        PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
        modifyFlag = false;

        renderMerchantNavTree.isRendered = false;
        renderMerchantNavTree({ merchantGroupCode: requestData.merchantGroupCode });
        resolve();
      });
    }

  });
}

// 분류 삭제
function deleteMerchant(treeItem) {
  if (!hasValidProjectId()) return;

  var requestData = {
      tntInstId : tntInstId,
      merchantGroupCode : treeItem.id,
  };

  Requests.deleteMerchantGroup(requestData).then((responseMessage) => {
    if (responseMessage) {
      PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');      // 삭제에 성공하였습니다.
      modifyFlag = false;

      var pathArr = [];
      treeItem.path.forEach((path) => {
        if (path && path !== treeItem.id){
          pathArr.push(path);
        }
      });

      traceTree.traceList = pathArr;
      traceTree.depth = 0;
      traceTree.completeTrace = false;

      renderMerchantNavTree.isRendered = false;
      renderMerchantNavTree({ merchantGroupCode: requestData.merchantGroupCode });

      $el.find('.pf-mg-info-wrap').removeClass('active');
    }
  });
};

// 관계 저장
function saveMerchantRelation() {
  if (!hasValidProjectId()) return;

  // requestData
  var requestParam = {};
  var hash = PFUtil.getHash();
  $.each(hash.split('&'),function(index, hashItem){
    var param = hashItem.split('=');
    requestParam[param[0]] = param[1];
  })

  // 그리드데이터
  var gridData;
  if (!PFValidation.mandatoryCheck('.mandatory') || !PFValidation.specialCharacter('.special')) {
    return;
  }

  gridData = relatedPdGrid.getAllData();
  gridData = gridData.concat(productRelgridDeleteData);


  requestParam['voList'] = gridData;
  requestParam.projectId = getSelectedProjectId();
  requestParam.tntInstId = tntInstId;
  requestParam.merchantGroupCode = treeItem.id;

  var nameLengthCheck = PFValidation.finalLengthCheck('',100,name);
  var mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');

  if (!modifyFlag){
    // 변경된 정보가 없습니다.
    PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
    return;
  }

  // 상품관계 저장 서비스 호출
  if (nameLengthCheck && mandatoryCheck) {
    var item = navTreeStore.findNode(treeItem.id);

    Requests.saveMerchantGroupMerchantRel(requestParam).then(() => {
      PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
      modifyFlag = false;

      var pathArr = [];
      item.path.forEach(function(path){
        if (path){
          pathArr.push(path);
        }
      });

      traceTree.traceList = pathArr;
      traceTree.depth = 0;
      traceTree.completeTrace = false;

      productRelgridDeleteData = [];

      renderMerchantNavTree.isRendered = false;
      renderMerchantNavTree({ merchantGroupCode: requestParam.merchantGroupCode });
      renderMerchantInfo(classForEvent);

    });
  }
};

var createMerchantGroupEvent = function () {
  if (!hasValidProjectId()) return;

    if ($($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val() === ''){
        selectNotTask();
        selectedYourTask();
        return;
    }

    if ( $($('.default-layout-task-menu', parent.document).find('.your-task')[0]).attr('data-status')=='true'){
        selectedYourTask();
        return;
    }

    var data = {work: "CREATE"};
    renderMerchantGroupManagementPopup(data);
}

/******************************************************************************************************************
 * rendering 함수
 ******************************************************************************************************************/

// 트리박스
function renderMerchantTreeBox() {
    $('.pf-mg-left-tree-box').html(merchantLeftTreeTpl());

    loginTntInstId = getLoginTntInstId();  // loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
    tntInstId = getLoginTntInstId();
    mother = getMortherYn();

    // 기관코드 콤보 바인딩
    renderTntInstComboBox($el.find('.pf-multi-entity'), tntInstId, function(returnValue) {

        if (!returnValue) return;

        if (!getMortherYn()) {
            $el.find('.pf-multi-entity-yn').hide();
        }
        renderMerchantInfo();
    });
}

// 트리와 메인화면을
function renderMerchantInfo(treeItem) {
    var path = (treeItem) ? treeItem.id : null;
    var hash = PFUtil.getHash();
    if (path === null){
        hash = '';
        $el.find('.pf-mg-info-wrap').removeClass('active');
    }

    if (!hash) {
        traceTree.completeTrace = true;
        renderMerchantNavTree(treeItem);
        return;
    } else {
        hash.id = path;
    }

    var requestParam = {};

    requestParam.tntInstId = tntInstId;
    requestParam.merchantGroupCode  = treeItem.id;
    //가맹점그룹가맹점관계
    Requests.getListMerchantGroupMerchantRel(requestParam).then((responseData) => {
      var navigationStr = '';

      responseData.navigation = navigationStr;
      $el.find('.pf-mg-info-wrap').addClass('active');
      $el.find('.pf-mg-info').html(merchantInfoFormTpl(treeItem));


      // 권한이 없으면 버튼 숨김
      if (writeYn !== 'Y'){
        $('.write-btn').hide();
      }

      if (tntInstId === loginTntInstId){    // enable
        $el.find('.add-rel-product-btn').prop('disabled', false);
        $el.find('.product-save-btn').prop('disabled', false);
      } else{                              // disable
        $el.find('.add-rel-product-btn').prop('disabled', true);
        $el.find('.product-save-btn').prop('disabled', true);
      }

      productRelgridDeleteData = [];
      renderMerchantGrid(responseData);
    });
}


/******************************************************************************************************************
 * 그리드 관련
 ******************************************************************************************************************/
function renderMerchantGrid(data) {

    relatedPdGrid = PFComponent.makeExtJSGrid({
        //pageAble: true,
        fields: ['merchantNumber', 'merchantName', 'applyStartDate','applyEndDate', 'process', 'pdRelStatusCode'],
        gridConfig: {
          renderTo: '.pf-mg-grid',
          columns: [
            {
              text: bxMsg('merchantNo'),
              flex: 1,
              dataIndex: 'merchantNumber',
            },                        // 상품코드
            {
              text: bxMsg('merchantName'),
              flex: 2,
              dataIndex: 'merchantName',
            },                        // 상품명
            {
              text: bxMsg('DPP0127String6'),
              width: 150,
              dataIndex: 'applyStartDate',                            // 적용시작일
              editor: {
                allowBlank: false,
                listeners: {
                  focus(_this) {
                    var isNextDay = true;
                    if (getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                      isNextDay = false;
                    }
                    PFUtil.getGridDateTimePicker(_this, 'applyStartDate', relatedPdGrid, selectedCellIndex, isNextDay);
                  },
                  blur(_this, e){
                    PFUtil.checkDate(e.target);
                  },
                }
              },
              listeners: {
                click() {
                  selectedCellIndex = $(arguments[1]).parent().index();
                },
              },
            },
            {
              text: bxMsg('DPP0127String7'),
              width: 150,
              dataIndex: 'applyEndDate',     // 적용종료일
              editor: {
                allowBlank: false,
                listeners: {
                  focus(_this) {
                    PFUtil.getGridDateTimePicker(_this, 'applyEndDate', relatedPdGrid, selectedCellIndex, true);
                  },
                  blur(_this, e){
                    PFUtil.checkDate(e.target, '9999-12-31 23:59:59');
                  },
                },
              },
              listeners: {
                click: function() {
                  selectedCellIndex = $(arguments[1]).parent().index();
                },
              },
            },
            {   // delete row
              xtype: 'actioncolumn', width: 35, align: 'center', sortable: false,
              items: [{
                icon: '/images/x-delete-16.png',
                handler(grid, rowIndex, colIndex, item, e, record) {

                  if (record.data.pdRelStatusCode === '01' ||
                      (getSelectedProjectId() && isEmergency(getSelectedProjectId()))) {
                    if (record.data.process !== 'C') {
                      record.data.process = 'D';
                      productRelgridDeleteData.push(record.data);
                    }
                    record.destroy();
                    modifyFlag = true;

                  } else {
                    PFComponent.showMessage(bxMsg('dontDeleteActiveTypeConditionTemplate'), 'warning');
                  }
                }
              }],
            },
          ],
          plugins: [getGridCellEditiongPlugin()],
        },
    });

    relatedPdGrid.setData(data);
}

// grid cell editing plugin
function getGridCellEditiongPlugin(){
  return Ext.create('Ext.grid.plugin.CellEditing', {
    clicksToEdit: 1,
    listeners: {
      beforeedit(e, editor){
        var projectId = getSelectedProjectId();
        if (editor.record.data.activeYn === 'N' ||                                          // 비활동인 경우
            (getSelectedProjectId() && isEmergency(getSelectedProjectId())) ||      // emergency 인 경우
            (getSelectedProjectId() && isUpdateStatus(getSelectedProjectId())) ){   // 상품정보 수정 인 경우
          // 모두 수정 가능
        }
        else if (editor.field === 'applyStartDate' && editor.record.get('process') !== 'C') {
          return false;
        }
      },
      afteredit(e, editor){
        if (editor.originalValue !==  editor.value) {

          if ( editor.field!='applyEndDate' &&
              (editor.record.get('process') === null || editor.record.get('process').length === 0)) {
            var originalData = $.extend(true, {}, editor.record.data);
            originalData[editor.field] = editor.record.modified[editor.field];
            originalData['process'] = 'D';
            productRelgridDeleteData.push(originalData);

            editor.record.set('process', 'C');
          }
          else if (editor.record.get('process') !== 'C'){
            editor.record.set('process', 'U');
          }

          modifyFlag = true;
        }
      }
    }
  });
}

// 그리드 new data
function setNewGridData(clickEventForNewData, relatedPdGrid) {
  var nextDate = PFUtil.getNextDate();
  var applyStartDate = nextDate + ' 00:00:00';
  var applyEndDate = '9999-12-31 23:59:59';

  clickEventForNewData.applyStartDate = applyStartDate;
  clickEventForNewData.applyEndDate = applyEndDate;
  clickEventForNewData.pdRelStatusCode = '01';
  clickEventForNewData.process = 'C';

  relatedPdGrid.addData(clickEventForNewData);
  modifyFlag = true;
};



function renderMerchantNavTree(_item) {
  if (renderMerchantNavTree.isRendered) {
    return;
  }
  renderMerchantNavTree.isRendered = true;

  return renderNavTree(_item).then(([tree, treeStore]) => {
    navTree = tree;
    navTreeStore = treeStore;

    // tree item double click
    navTree.on('itemdblclick', (e) => {
      const item = treeItem = e.item;

      setTaskRibbonInput(item.projectId, item.projectName);
      location.hash = makeMerchantInfoParameter(treeItem);

      if (item.relate) {   // 상품관계관리가 존재하는 경우
        if (modifyFlag) {
          PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
            renderMerchantInfo(e.item);
            modifyFlag = false;
            $('.most-significant-box').removeAttr('data-edited');
          });

        } else {
          classForEvent = item;
          renderMerchantInfo(item);
        }

      } else if (item.level > 1) {
        $el.find('.pf-mg-info-wrap').addClass('active');
        $el.find('.pf-mg-info').html(merchantDetailInfoTpl());
        $el.find('.pf-mg-detail-info').html(merchantGroupManagementPopupTpl(item));

        $el.find('.save-btn').removeClass('mechant-group-save-btn');
        $el.find('.delete-btn').removeClass('merchant-group-delete-btn');
        $el.find('.save-btn').addClass('merchant-save-btn');
        $el.find('.delete-btn').addClass('merchant-delete-btn');

        // 권한이 없으면 버튼 숨김
        if (writeYn !== 'Y') {
          $('.write-btn').hide();
        }

        if (tntInstId === loginTntInstId) {    // enable
          $el.find('.save-btn').prop('disabled', false);
          $el.find('.delete-btn').prop('disabled', false);

        } else {                              // disable
          $el.find('.save-btn').prop('disabled', true);
          $el.find('.delete-btn').prop('disabled', true);
        }

        const $dscd = $('.merchant-group-management-popup select[data-form-param="merchantGroupTypeCode"]');
        const $activeYn = $('.merchant-group-management-popup select[data-form-param="activeYn"]');

        PFUtil.renderComboBox("merchantGroupTypeCode", $dscd, item.merchantGroupTypeCode);
        PFUtil.renderComboBox("ProductBooleanCode", $activeYn, item.activeYn);
        $dscd.attr('disabled', true);
      }
    });


    /* --------------------------------------
     * Context Menu Event - 가맹점그룹
     * -------------------------------------- */
    /* --------------------------------------
     * Context Menu Event - 분류
     * -------------------------------------- */

    // 분류 조회 이벤트
    var searchMerchantEvent = function() {

      treeItem.work = "UPDATE";
      renderMerchantGroupManagementPopup(treeItem);

    }

    // 분류기본 삭제 이벤트
    var deleteMerchantEvent = function() {
      deleteMerchant(treeItem);

    }

    /* --------------------------------------
     * Context Menu Event - 상품 관계 관리
     * -------------------------------------- */
    var PfRelationManagementEvent = function(){
      location.hash = makeMerchantInfoParameter(treeItem);
      if (!modifyFlag){
        renderMerchantInfo(treeItem);
      } else{
        PFComponent.showConfirm(bxMsg('warningDontSaved'), function() {
          renderMerchantInfo(treeItem);
          modifyFlag = false;
          $('.most-significant-box').removeAttr('data-edited');
        }, function() {
          return;
        });
      }
    }

    /* --------------------------------------
     * Context Menu
     * -------------------------------------- */


    // 가맹점그룹 신규 context menu
    PFUI.use(['pfui/menu'], (Menu) => {
      var merchantGroupNewContextMenu = new Menu.ContextMenu({
        children: [
          makeContextMenu('icon-folder-close', bxMsg('createMerchantGroup'), createMerchantGroupEvent)     // 가맹점그룹 신규
          ]
      });

      var merchantGroupRelatedContextMenu = new Menu.ContextMenu({
        children: [
          makeContextMenu('icon-zoom-in', bxMsg('searchMerchantGroup'), searchMerchantEvent),          // 가맹점그룹 조회
          makeContextMenu('icon-remove' , bxMsg('deleteMerchantGroup'), deleteMerchantEvent),          // 가맹점그룹 삭제
          makeContextMenu('icon-file'   , bxMsg('merchantRelManagement'), PfRelationManagementEvent)           // 가맹점관계관리
          ]
      });

      var centerMerchantGroupContextMenu = new Menu.ContextMenu({
        children: [
          makeContextMenu('icon-zoom-in', bxMsg('searchMerchantGroup'), searchMerchantEvent),          // 분류 조회
          makeContextMenu('icon-file'   , bxMsg('merchantRelManagement'), PfRelationManagementEvent)           // 가맹점관계관리
          ]
      });


      // context menu 추가
      navTree.on('itemcontextmenu', function(ev){

        if (loginTntInstId !== tntInstId) return; // 타기관 선택 시 contextmenu 보여주지 않음

        var item = ev.item;
        navTree.setSelected(item);
        treeItem = item;

        var y = ev.pageY >= 500 ? ev.pageY - 28*4 : ev.pageY;

        // 최상위인 경우
        if (treeItem.level === 1) {
          if (writeYn !== 'Y') {

          } else {
            merchantGroupNewContextMenu.set('xy', [ev.pageX, y]);
            merchantGroupNewContextMenu.show();
          }

        }
        // 가맹점그룹인 경우
        else if (treeItem.level > 1) {
          // 쓰기 권한이 없는 경우
          if (writeYn !== 'Y'){
            centerMerchantGroupContextMenu.set('xy', [ev.pageX, y]);
            centerMerchantGroupContextMenu.show();
          }
          // 쓰기 권한이 있는 경우
          else{
            // 활동여부가 N 이거나 emergency이면
            if (treeItem.activeYn === 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId()))){
              merchantGroupRelatedContextMenu.set('xy', [ev.pageX, y]);
              merchantGroupRelatedContextMenu.show();
            } else{
              centerMerchantGroupContextMenu.set('xy', [ev.pageX, y]);
              centerMerchantGroupContextMenu.show();
            }

          }
        }

        return false;
      });
    });
  });
  
}





/******************************************************************************************************************
 * 사용자 함수
 ******************************************************************************************************************/
// 파라미터 조합
function makeMerchantInfoParameter(treeItem) {
    if (treeItem.level === 1) {
        return 'merchantGroupCode=' + treeItem.id;
    } else if (treeItem.level > 1) {
        return 'merchantGroupCode=' + treeItem.id
            + '&merchantGroupTypeCode=' + treeItem.merchantGroupTypeCode;
    }
};


function hasValidProjectId() {
  if (!isHaveProject()){
    haveNotTask();
    return false;
  }

  const projectId = getSelectedProjectId();
  if (isNotMyTask(projectId)){
    return false;
  }
  
  return true;
}

// Context Menu 생성
function makeContextMenu(iconCls, text, clickEvent, UIEvent) {
  return {
    iconCls,
    text,
    listeners: {
      click() {
        clickEvent();
      },
      afterRenderUI() {
        if (UIEvent) UIEvent();
      },
    },
  };
};



// 개발과제가 Emergency 일 때
function fnEmergencyControl(flag) {
  if (writeYn === 'Y') {
    if (flag) {
      $('.write-btn').prop('disabled', false);
    } else if ($('.active-yn').val() === 'Y') {
      $('.merchant-delete-btn').prop('disabled', true);
    }
  }
};