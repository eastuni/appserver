/**
 * contents group java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */

const $el = $('.pf-info-cntnt'); // Page Root jQuery Element

// Load Template in HTML
const classificationLeftTreeTpl = getTemplate('classificationLeftTreeTpl'); // 트리
const classificationDetailInfoTpl = getTemplate('classificationDetailInfoTpl');
const classificationStructureBaseManagementPopupTpl = getTemplate('classificationStructureBaseManagementPopupTpl'); // 콘텐츠그룹기본 관리
const classificationManagementPopupTpl = getTemplate('classificationManagementPopupTpl'); // 하위 콘텐츠그룹 관리
const classificationInfoFormTpl = getTemplate('classificationInfoFormTpl'); // 상품관계관리
const cndInfoTpl = getTemplate('cndInfoTpl');

// 상품정보구분코드
const pdInfoDscd_Product = '01';
const pdInfoDscd_Service = '02';
const pdInfoDscd_Point = '03';

const G_classificationStructureTypeCode = '4';

const clickEventForNewData = {};

const onEvent = PFUtil.makeEventBinder($el);
const lengthVald = PFValidation.realTimeLengthCheck($el);

let modifyFlag = false;
let selectedCellIndex;

let navTree;
let navTreeStore;
let relatedPdGrid;

let classForEvent;

let pdInfoDscd = '01';

let loginTntInstId;
let tntInstId;

let conditionInfoGrid;
let productRelgridDeleteData = [];

/**
 * 이벤트 함수
 */

onEvent('click', 'a', (e) => {
  e.preventDefault();
});

// add button click event
onEvent('click', '.add-rel-product-btn', () => {
  const submitEvent = function (data) {
    clickEventForNewData.pdInformationCode = data.code;
    clickEventForNewData.pdInformationName = data.name;
    setNewGridData(clickEventForNewData, relatedPdGrid);
    modifyFlag = true;
  };

  if (pdInfoDscd === pdInfoDscd_Product) {
    PFPopup.selectProduct({}, submitEvent);
  } else if (pdInfoDscd === pdInfoDscd_Service) {
    PFPopup.selectService({}, submitEvent);
  } else if (pdInfoDscd === pdInfoDscd_Point) {
    PFPopup.selectProduct({ pdInfoDscd: '03' }, submitEvent);
  }
});

onEvent('click', '.product-save-btn', () => {
  saveContentRelation();
  conditionInfoGrid = null;
});

onEvent('click', '.class-str-save-btn', () => {
  saveContentRelation('UPDATE');
});

onEvent('click', '.class-str-delete-btn', () => {
  PFComponent.showConfirm(bxMsg('DPE00001_Delete_Confirm'), () => {
    deleteContentGroup($('.classificationStructureDistinctionCode').val(), $('.start-date').val());
  });
});

onEvent('click', '.class-save-btn', () => {
  saveClassification('UPDATE');
});

onEvent('click', '.class-delete-btn', () => {
  PFComponent.showConfirm(bxMsg('DPE00001_Delete_Confirm'), () => {
    deleteClassification($('.classificationStructureDistinctionCode').val(), $('.classificationCode').val(), $('.start-date').val());
  }, () => {

  });
});

// 상품그룹에서 상품그룹조건 확장버튼
onEvent('click', '.pf-info-cntnt-condition-expend-view-btn', (e) => {
  const $button = $('.pf-info-cntnt-condition-info-tpl .pf-info-cntnt-condition-expend-view-btn');
  $button.toggleClass('cnd-info-expand');

  if ($button.hasClass('cnd-info-expand')) {
    $(e.currentTarget).html('<i class="bw-icon i-25 i-close3"></i>');

    $('.pf-info-cntnt-condition-info-tpl .pf-panel-body').show();
    PFUtil.getAllDatePicker(true, $('.pf-info-cntnt-condition-info-tpl .pf-panel-body'));

    if (!conditionInfoGrid) {
      searchClassificationConditionList();
    }
  } else {
    $(e.currentTarget).html('<i class="bw-icon i-25 i-open3"></i>');
    $('.pf-info-cntnt-condition-info-tpl .pf-panel-body').hide();
  }
});


// 에디트
onEvent('click', '.add-cnd-tmplt-btn', () => {
  renderContentsEditPopup({ process: 'C' });
});


/*
 * BIZ 함수
 */
// 콘텐츠그룹 저장
function saveContentGroup(work, that) {
  if (!isHaveProject()) {
    haveNotTask();
    return;
  }

  const projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
  if (isNotMyTask(projectId)) {
    return;
  }

  let form;
  let name;

  if (that) {
    form = PFComponent.makeYGForm($('.pfui-stdmod-body .classification-structure-base-management-popup .pf-info-cntnts-str-base-form'));
    name = $('.pfui-stdmod-body .classification-structure-base-management-popup .classification-structure-name').val(); // 콘텐츠그룹기본명
  } else {
    form = PFComponent.makeYGForm($('.pf-info-cntnts-str-base-form'));
    name = $('.classification-structure-name').val(); // 콘텐츠그룹기본명
  }

  if (!name) {
    PFComponent.showMessage(bxMsg('ContentGroupNameError'), 'warning'); // 콘텐츠그룹기본명은 필수입력사항입니다
    return;
  }

  const nameLengthCheck = PFValidation.finalLengthCheck('', 100, name);
  const mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');

  let requestUrl,
    bxmHeader;
  if (work === 'CREATE') {
    requestUrl = '/classification/createClassificationMaster.json';
    bxmHeader = {
      application: 'PF_Factory',
      service: 'ClassificationMasterService',
      operation: 'createClassificationMaster',
    };
  } else if (work === 'UPDATE') {

    if(!modifyFlag){
  	// 변경된 정보가 없습니다.
		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
		return;
    }

    requestUrl = '/classification/updateClassificationMaster.json';
    bxmHeader = {
      application: 'PF_Factory',
      service: 'ClassificationMasterService',
      operation: 'updateClassificationMaster',
    };
  }

  const requestData = form.getData();
  requestData.pdInfoDscd = pdInfoDscd;
  requestData.projectId = projectId;
  requestData.tntInstId = tntInstId;
  requestData.classificationStructureTypeCode = G_classificationStructureTypeCode; // OHS 2017.02.27 수정 - 기존 저장 후 매핑되지않고있음 코드 자리수 불일치

  if (nameLengthCheck && mandatoryCheck) {
    PFRequest.post(requestUrl, requestData, {
      success(result) {
        PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
        modifyFlag = false;

        if (that) {
          that.close();
        }

        // if(work === 'CREATE') {

        traceTree.traceList = [result];
        traceTree.depth = 0;
        traceTree.completeTrace = false;

        reloadClassificationNavTree();
      },
      bxmHeader,
    });
  }
}

// 콘텐츠그룹삭제
function deleteContentGroup(id, applyStartDate) {
  if (!isHaveProject()) {
    haveNotTask();
    return;
  }

  const projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
  if (isNotMyTask(projectId)) {
    return;
  }

  const requestData = {
    classificationStructureDistinctionCode: id,
    pdInfoDscd,
    projectId,
    tntInstId,
    applyStartDate,
  };
  PFRequest.post('/classification/deleteClassificationMaster.json', requestData, {
    success(responseMessage) {
      if (responseMessage) {
        PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success'); // 삭제에 성공하였습니다.
        modifyFlag = false;

        const pathArr = [];
        treeItem.path.forEach((path) => {
          if (path && path !== id) {
            pathArr.push(path);
          }
        });

        traceTree.traceList = pathArr;
        traceTree.depth = 0;
        traceTree.completeTrace = false;

        reloadClassificationNavTree();
        $el.find('.pf-info-cntnt-info-wrap').removeClass('active');
      }
    },
    bxmHeader: {
      application: 'PF_Factory',
      service: 'ClassificationMasterService',
      operation: 'deleteClassificationMaster',
    },
  });
}

// 분류 저장
function saveClassification(work, data, that) {
  if (!isHaveProject()) {
    haveNotTask();
    return;
  }

  const projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
  if (isNotMyTask(projectId)) {
    return;
  }

  let form;
  let name;

  if (that) {
    form = PFComponent.makeYGForm($('.pfui-stdmod-body .classification-management-popup .pf-info-cntnts-form'));
    name = $('.pfui-stdmod-body .classification-management-popup .classification-name').val(); // 분류기본명
  } else {
    form = PFComponent.makeYGForm($('.pf-info-cntnts-form'));
    name = $('.classification-name').val(); // 콘텐츠그룹기본명
  }

  if (!name) {
    PFComponent.showMessage(bxMsg('ClassificationNameError'), 'warning'); // 콘텐츠그룹기본명은 필수입력사항입니다
    return;
  }

  const nameLengthCheck = PFValidation.finalLengthCheck('', 100, name);
  const mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');

  let requestUrl,
    bxmHeader;
  if (work === 'CREATE') {
    requestUrl = '/classification/createClassificationDetail.json';
    bxmHeader = {
      application: 'PF_Factory',
      service: 'ClassificationDetailService',
      operation: 'createClassificationDetail',
    };
  } else if (work === 'UPDATE') {
    requestUrl = '/classification/updateClassificationDetail.json';
    bxmHeader = {
      application: 'PF_Factory',
      service: 'ClassificationDetailService',
      operation: 'updateClassificationDetail',
    };
  }

  const requestData = form.getData();
  requestData.pdInfoDscd = pdInfoDscd;
  requestData.projectId = projectId;
  requestData.tntInstId = tntInstId;

  if (nameLengthCheck && mandatoryCheck) {
    PFRequest.post(requestUrl, requestData, {
      success(resposeData) {
        PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
        modifyFlag = false;

        if (that) {
          that.close();
        }

        if (work === 'UPDATE') {
          data = navTreeStore.findNode(`${requestData.classificationStructureDistinctionCode}.${requestData.classificationCode}`);
        }

        const pathArr = [];
        data.path.forEach((path) => {
          if (path) {
            pathArr.push(path);
          }
        });
        pathArr.push(resposeData);

        traceTree.traceList = pathArr;
        traceTree.depth = 0;
        traceTree.completeTrace = false;

        reloadClassificationNavTree();
      },
      bxmHeader,
    });
  }
}

// 분류 삭제
function deleteClassification(code, id, applyStartDate, treeItem) {
  if (!isHaveProject()) {
    haveNotTask();
    return;
  }

  const projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
  if (isNotMyTask(projectId)) {
    return;
  }
  const requestData = {
    classificationStructureDistinctionCode: code,
    classificationCode: id,
    pdInfoDscd,
    tntInstId,
    projectId,
    applyStartDate,
  };

  PFRequest.post('/classification/deleteClassificationDetail.json', requestData, {
    success(responseMessage) {
      if (responseMessage) {
        PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success'); // 삭제에 성공하였습니다.
        modifyFlag = false;

        const pathArr = [];

        // OHS 2017.09.08 수정 - treeItem is undefined script error
        if (!treeItem && classForEvent) {
          classForEvent.path.forEach((path) => {
            if (path && path !== id) {
              pathArr.push(path);
            }
          });
        } else {
          treeItem.path.forEach((path) => {
            if (path && path !== id) {
              pathArr.push(path);
            }
          });
        }


        traceTree.traceList = pathArr;
        traceTree.depth = 0;
        traceTree.completeTrace = false;

        reloadClassificationNavTree();

        $el.find('.pf-info-cntnt-info-wrap').removeClass('active');
      }
    },
    bxmHeader: {
      application: 'PF_Factory',
      service: 'ClassificationDetailService',
      operation: 'deleteClassificationDetail',
    },
  });
}

// 관계 저장
function saveContentRelation() {
  if (!isHaveProject()) {
    haveNotTask();
    return;
  }

  const projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
  if (isNotMyTask(projectId)) {
    return;
  }

  // requestData
  const requestParam = {};
  const hash = PFUtil.getHash();
  $.each(hash.split('&'), (index, hashItem) => {
    const param = hashItem.split('=');
    requestParam[param[0]] = param[1];
  });

  // 그리드데이터
  let gridData;
  if (!PFValidation.mandatoryCheck('.mandatory') || !PFValidation.specialCharacter('.special')) {
    return;
  }

  // gridData = relatedPdGrid.getAllData();
  gridData = productRelgridDeleteData.concat(relatedPdGrid.getAllData());

  requestParam.voList = gridData;
  requestParam.pdInfoDscd = pdInfoDscd;
  requestParam.projectId = projectId;
  requestParam.tntInstId = tntInstId;

  const nameLengthCheck = PFValidation.finalLengthCheck('', 100, name);
  const mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');

  if(!modifyFlag){
  	// 변경된 정보가 없습니다.
		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
		return;
    }

  // 상품관계 저장 서비스 호출
  if (nameLengthCheck && mandatoryCheck) {
    PFRequest.post('/classification/updateClassificationInformationRelation.json', requestParam, {
      success() {
        PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
        modifyFlag = false;

        const item = navTreeStore.findNode(`${requestParam.classificationStructureDistinctionCode}.${requestParam.classificationCode}`);

        const pathArr = [];
        item.path.forEach((path) => {
          if (path) {
            pathArr.push(path);
          }
        });

        traceTree.traceList = pathArr;
        traceTree.depth = 0;
        traceTree.completeTrace = false;

        productRelgridDeleteData = [];

        reloadClassificationNavTree();
        renderClassificationInfo(classForEvent);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'ClassificationInformationRelationService',
        operation: 'updateClassificationInformationRelation',
      },
    });
  }
}

function saveConditionValue(requestParam) {
  PFRequest.post('/classification/saveClassificationCnd.json', requestParam, {
    success() {
      PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');

      const requestData = {};

      requestData.tntInstId = tntInstId;
      requestData.pdInfoDscd = pdInfoDscd;
      requestData.classificationStructureDistinctionCode = classForEvent.classificationStructureDistinctionCode;
      requestData.classificationCode = classForEvent.classificationCode;
      requestData.isComplexCnd = false;

      PFRequest.get('/classification/getListClassificationCnd.json', requestData, {
        success(result) {
          // 삼품그룹 조건정보 그리드
          result.forEach((el) => {
            el.status = el.cndStatusCode;

            if (!el.isComplexCnd) { // 단순
              el.conditionClassifyCode = '01';

              if (el.conditionTypeCode === '01') { // 목록
                const conditionList = [];

                el.listConditionValue.defineValues.forEach((condition) => {
                  let obj = {};
                  obj.listCode = condition.code;
                  conditionList.push(obj);
                });
                el.conditionList = conditionList;
              } else if (el.conditionTypeCode === '02') { // 범위
                el.conditionDetailTypeCode = el.rangeConditionValue.conditionDetailTypeCode;
              }
            } else if (el.isComplexCnd) { // 복합
              el.conditionClassifyCode = '02';

              if (el.conditionTypeCode === '02') { // 범위
                el.conditionDetailTypeCode = el.complexConditionMatrix[0].y.conditionDetailTypeCode;
              }
            }
          });

          conditionInfoGrid.setData(result);
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'ClassificationCndService',
          operation: 'queryListClassificationCnd',
        },
      });
    },
    bxmHeader: {
      application: 'PF_Factory',
      service: 'ClassificationCndService',
      operation: 'saveClassificationCnd',
    },
  });
}

// 검색트림
function loadClassificationList(name) {
  $el.find('.classification-search-list-wrap').addClass('active');
  $el.find('.classification-search-list-wrap').empty();

  const tntInstId = $el.find('.pf-multi-entity').val();

  PFUI.use(['pfui/tree', 'pfui/data'], (Tree, Data) => {
    let store;
    if (g_serviceType === g_bxmService) { // bxm
      const params = {
        header: {
          application: 'PF_Factory',
          service: 'ClassificationDetailService',
          operation: 'queryListClassificationDetail',
          locale: getCookie('lang'),
        },
        input: {
          tntInstId,
          pdInfoDscd,
          classificationName: name,
          classificationStructureTypeCode: G_classificationStructureTypeCode,
          commonHeader: {
            loginTntInstId: getLoginTntInstId(),
            lastModifier: getLoginUserId(),
          },
        },
      };

      store = new Data.TreeStore({
        autoLoad: false,
        dataProperty: 'list',
        url: '/serviceEndpoint/json/request.json',
        proxy: {
          method: 'POST',
          ajaxOptions: {
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify(params),
          },
          dataType: 'json',
        },
        map: {
          classificationName: 'text',
          classificationCode: 'id',
        },
      });
    } else {
      store = new Data.TreeStore({
        autoLoad: false,
        dataProperty: 'list',
        url: `/classification/getListClassificationDetail.json?tntInstId=${tntInstId}&classificationName=${name}&commonHeaderMessage={"loginTntInstId":"${getLoginTntInstId()}", "lastModifier":"${getLoginUserId()}"}`
                + `&pdInfoDscd=${pdInfoDscd}&classificationStructureTypeCode=${G_classificationStructureTypeCode}`,
        map: {
          classificationName: 'text',
          classificationCode: 'id',
        },
      });
    }

    store.on('beforeprocessload', (ev) => {
      const data = ev.data;

      if (data.ModelMap) {
        data.responseMessage = data.ModelMap.responseMessage;
        delete data.ModelMap.responseMessage;
      }

      if (data.responseMessage) {
        data.list = data.responseMessage;
      } else if (data.responseError) {
        data.list = [];
      }
    });

    store.load();

    const tree = new Tree.TreeList({
      render: '.classification-search-list-wrap',
      showLine: false,
      store,
      showRoot: false,
    });

    tree.render();

    tree.on('itemclick', (e) => {
      location.hash = `classificationStructureDistinctionCode=${e.item.classificationStructureDistinctionCode
      }&classificationCode=${e.item.id
      }&fullPath=${e.item.fullPath}`;

      location.reload();

      if (!modifyFlag) {
        $el.find('.classification-search-list-wrap').removeClass('active');
      }
    });
  });
}

/** ****************************************************************************************************************
 * rendering 함수
 ***************************************************************************************************************** */

// 트리박스
function renderClassficationTreeBox() {
  $('.pf-info-cntnt-left-tree-box').html(classificationLeftTreeTpl());

  loginTntInstId = getLoginTntInstId(); // loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();
  tntInstId = getLoginTntInstId();
  mother = getMortherYn();

  // 기관코드 콤보 바인딩
  renderTntInstComboBox($el.find('.pf-multi-entity'), tntInstId, (returnValue) => {
    if (!returnValue) return;

    if (!getMortherYn()) {
      $el.find('.pf-multi-entity-yn').hide();
    }

    if (parent.parameter && parent.parameter.length > 0) {
      pdInfoDscd = parent.parameter;
      parent.parameter = '';
    }

    renderClassificationInfo(); // renderProductInfo();
  });
}

// 트리와 메인화면을
function renderClassificationInfo(treeItem) {
  const path = (treeItem) ? treeItem.id : null;
  let hash;

  classForEvent = treeItem;
  if (path === null) {
    hash = '';
    $el.find('.pf-info-cntnt-info-wrap').removeClass('active');
  }

  $('.pf-detail-wrap').on('change', 'input', () => {
    modifyFlag = true;
    $('.most-significant-box').attr('data-edited', 'true');
  });

  hash = PFUtil.getHash();

  if (!hash) {
    traceTree.completeTrace = true;
    renderClassificationNavTree();
    return;
  }

  const requestParam = {};
  $.each(hash.split('&'), (index, hashItem) => {
    const param = hashItem.split('=');
    requestParam[param[0]] = param[1];
  });

  if (requestParam.fullPath) {
    this.fullPath = requestParam.fullPath;
  } else {
    this.fullPath = undefined;
  }

  requestParam.pdInfoDscd = pdInfoDscd; // 상품정보구분코드
  requestParam.tntInstId = tntInstId;

  PFRequest.get('/classification/getListClassificationInformationRelation.json', requestParam, {
    success(responseData) {
      const navigationArr = responseData.navigation.split('.');
      let navigationStr = '';
      let responseClassificationCode;
      let responseContentGroupDistinctionCode;

      responseClassificationCode = navigationArr[0].split(':')[0];
      responseContentGroupDistinctionCode = responseData.classificationStructureDistinctionCode;

      navigationArr.forEach((navi) => {
        if (navigationStr === '') {
          navigationStr = navi.split(':')[1];
        } else {
          navigationStr = `${navigationStr} > ${navi.split(':')[1]}`;
        }


        productClassificationCode = navi.split(':')[0];
      });
      responseData.navigation = navigationStr;

      responseData.relTitle = bxMsg('ContentGroupManagement');

      $el.find('.pf-info-cntnt-info-wrap').addClass('active');
      $el.find('.pf-info-cntnt-info').html(classificationInfoFormTpl(responseData));


      // 권한이 없으면 버튼 숨김
      if (writeYn !== 'Y') {
        $('.write-btn').hide();
      }

      if (tntInstId === loginTntInstId) { // enable
        $el.find('.add-rel-product-btn').prop('disabled', false);
        $el.find('.product-save-btn').prop('disabled', false);
      } else { // disable
        $el.find('.add-rel-product-btn').prop('disabled', true);
        $el.find('.product-save-btn').prop('disabled', true);
      }

      productRelgridDeleteData = [];
      renderClassificationGrid(responseData.voList);

      const cndExpendbutton = '<button class="bw-btn bx-btn-small pf-info-cntnt-condition-expend-view-btn">' +
                '<i class="bw-icon i-25 i-open3"></i>' +
                '</button>';

      $el.find('.pf-info-cntnt-info').append(cndInfoTpl());
      $el.find('.pf-info-cntnt-condition-info-tpl .header-btn-group').append(cndExpendbutton);
      $el.find('.pf-info-cntnt-condition-info-tpl .pf-panel-body').hide();

      const pathArr = [];

      if (this.fullPath) {
        const tmpArr = this.fullPath.split('.');

        for (let i = 0; i < tmpArr.length; i++) {
          if (i === 0) {
            pathArr.push(tmpArr[i]);
          } else {
            pathArr.push(`${tmpArr[0]}.${tmpArr[i]}`);
          }
        }

        traceTree.traceList = pathArr;
        traceTree.depth = 0;
        traceTree.completeTrace = false;
      }

      renderClassificationNavTree();
    },
    bxmHeader: {
      application: 'PF_Factory',
      service: 'ClassificationInformationRelationService',
      operation: 'queryListClassificationInformationRelation',
    },
  });
}


/** ****************************************************************************************************************
 * 트리 관련
 ***************************************************************************************************************** */
function renderClassificationNavTree() {
  if (renderClassificationNavTree.isRendered) {
    return;
  }
  renderClassificationNavTree.isRendered = true;


  PFUI.use(['pfui/tree', 'pfui/data', 'pfui/menu'], (Tree, Data, Menu) => {
    /* --------------------------------------
         * nvaTreeStore
         * -------------------------------------- */
    let classificationStructureTypeCode;

    if (g_serviceType === g_bxmService) {
      const params = {
        header: {
          application: 'PF_Factory',
          service: 'ClassificationMasterService',
          operation: 'queryListClassificationMaster',
        },
        input: {
          tntInstId,
          pdInfoDscd,
          classificationStructureTypeCode: G_classificationStructureTypeCode,
          commonHeader: {
            loginTntInstId,
            motherTntInstId: getMotherTntInstId(),
            lastModifier: getLoginUserId(),
          },
        },
      };

      navTreeStore = new Data.TreeStore({
        autoLoad: false,
        url: '/serviceEndpoint/json/request.json',
        dataProperty: 'list',
        proxy: {
          method: 'POST',
          ajaxOptions: {
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify(params),
          },
          dataType: 'json',
        },
        map: {
          bottom: 'leaf',
          classificationStructureName: 'text',
          classificationStructureDistinctionCode: 'id', // 콘텐츠그룹구분코드
        },
      });
    } else {
      navTreeStore = new Data.TreeStore({
        autoLoad: false,
        url: `/classification/getListClassificationMaster.json?tntInstId=${tntInstId
        }&commonHeaderMessage={"loginTntInstId":"${loginTntInstId}", "motherTntInstId" : "${getMotherTntInstId()}", "lastModifier" : "${getLoginUserId()}"}` +
                    `&pdInfoDscd=${pdInfoDscd
                    }&classificationStructureTypeCode=${G_classificationStructureTypeCode}`,
        dataProperty: 'list',
        map: {
          bottom: 'leaf',
          classificationStructureName: 'text',
          classificationStructureDistinctionCode: 'id', // 콘텐츠그룹구분코드
        },
      });
    }

    // click change url params
    // csl='folder' and 'leaf=false' 일 때 호출됨
    navTreeStore.on('beforeload', (ev) => {
      let params = ev.params;
      let node = navTreeStore.findNode(params.id);
      let queryParams;

      if (!node) { return; }

      // 상품관계관리가 존재하면
      if (node.related) {

      }
      //  하위분류가 없으면
      else if (node.bottom) {

      }
      // 하위분류조회
      else {
        if (g_serviceType === g_bxmService) {
          queryParams = {
            header: {
              application: 'PF_Factory',
              service: 'ClassificationDetailService',
              operation: 'queryListClassificationDetail',
            },
            input: {
              tntInstId,
              pdInfoDscd,
              commonHeader: {
                loginTntInstId,
              },
            },
          };

          if (node.level === 1) {
            queryParams.input.classificationStructureDistinctionCode = node.id; // 콘텐츠그룹구분코드
          } else if (node.level > 1) {
            queryParams.input.classificationStructureDistinctionCode = node.classificationStructureDistinctionCode; // 콘텐츠그룹구분코드
            queryParams.input.levelNumber = node.levelNumber; // 레벨
            queryParams.input.higherClassificationCode = node.classificationCode; // 상위분류코드
          }
          navTreeStore.get('proxy').set('ajaxOptions', {
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify(queryParams),
          });
        } else {
          queryParams = `tntInstId=${  tntInstId
                         }&pdInfoDscd=${  pdInfoDscd
                         }&commonHeaderMessage={"loginTntInstId":"${  loginTntInstId  }", "motherTntInstId" : "${  getMotherTntInstId() }"}`;
          if (node.level === 1) {
            queryParams = `${queryParams
                             }&classificationStructureDistinctionCode=${  node.id}`; // 콘텐츠그룹구분코드
          } else if (node.level > 1) {
            queryParams = `${queryParams
                             }&classificationStructureDistinctionCode=${  node.classificationStructureDistinctionCode  // 콘텐츠그룹구분코드
                             }&levelNumber=${  node.levelNumber                            // 레벨
                             }&higherClassificationCode=${  node.classificationCode}`; // 상위분류코드
          }

          navTreeStore.get('proxy').set('url', `/classification/getListClassificationDetail.json?${  queryParams}`);
        }

        navTreeStore.set('map', {
          classificationName: 'text',
          // 'classificationCode'                    : 'id',
          bottom: 'leaf',
        });
      }
    });

    navTreeStore.on('beforeprocessload', (ev) => {
      const data = ev.data;
      if (data.ModelMap) {
        data.list = data.ModelMap.responseMessage;
      } else {
        data.list = data.responseMessage;
      }

      if (data.list && data.list.length > 0) {
        data.list.forEach((element) => {
          if (!element.bottom && !element.related) {
            element.cls = 'Folder';
          }
          if (element.bottom && !element.related) {
            element.cls = 'PT';
          }
          if (element.classificationCode) {
            element.id = `${element.classificationStructureDistinctionCode}.${ element.classificationCode}`;
          }
        });
      }
    });

    navTreeStore.on('load', () => {
      traceTree();
    });

    navTreeStore.load();


    /* --------------------------------------
         * navTree 생성
         * -------------------------------------- */

    $('.pf-info-cntnt-tree-nav').empty();

    navTree = new Tree.TreeList({
      render: '.pf-info-cntnt-tree-nav',
      showLine: false,
      store: navTreeStore,
      checkType: 'none',
      showRoot: false,
    });

    navTree.render();

    // tree item double click
    navTree.on('itemdblclick', (e) => {
      location.hash = makeClassificationInfoParameter(e.item);

      // OHS 2017.02.23 수정 - 기존에서 사용했던 2곳은 주석처리하고 if문밖에서 아에 값을 세팅.(스크립트오류방지)
      classForEvent = e.item;

      // 개발과제 binding
      if (e.item) {
        const item = e.item.projectBaseVO || e.item;
        setTaskRibbonInput(item.projectId, item.projectName);
      }

      if (e.item.related) { // 상품관계관리가 존재하는 경우
        let emptyObj;
        conditionInfoGrid = emptyObj;
        if (!modifyFlag) {
          renderClassificationInfo(e.item);
        } else {
          PFComponent.showConfirm(bxMsg('warningDontSaved'), () => {
            renderClassificationInfo(e.item);
            modifyFlag = false;
            $('.most-significant-box').removeAttr('data-edited');
          }, () => {

          });
        }
      } else if (e.item.level === 1) {
        var requestData = {
          classificationStructureDistinctionCode: e.item.id,
          pdInfoDscd,
          tntInstId,
          applyStartDate: e.item.applyStartDate,
        };
        PFRequest.get('/classification/getClassificationMaster.json', requestData, {
          success(responseMessage) {
            $el.find('.pf-info-cntnt-info-wrap').addClass('active');
            $el.find('.pf-info-cntnt-info').html(classificationDetailInfoTpl());
            $el.find('.pf-info-cntnt-detail-info').html(classificationStructureBaseManagementPopupTpl(responseMessage));

            PFUtil.getDatePicker(true, $('.classification-structure-base-management-popup'));

            $el.find('.save-btn').addClass('class-str-save-btn');
            $el.find('.delete-btn').addClass('class-str-delete-btn');
            $el.find('.save-btn').removeClass('class-save-btn');
            $el.find('.delete-btn').removeClass('class-delete-btn');

            // 권한이 없으면 버튼 숨김
            if (writeYn !== 'Y') {
              $('.write-btn').hide();
            }

            if (tntInstId === loginTntInstId) { // enable
              $el.find('.save-btn').prop('disabled', false);
              $el.find('.delete-btn').prop('disabled', false);
            } else{ // disable
              $el.find('.save-btn').prop('disabled', true);
              $el.find('.delete-btn').prop('disabled', true);
            }

            if (responseMessage.activeYn === 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId()))) {
              $('.delete-btn').prop('disabled', false);
            } else{
              $('.delete-btn').prop('disabled', true);
            }

            renderComboBox('ProductGroupTypeCode', $('.cls-prod-group-type-select'), null, true, false);
            renderComboBox('ProductBooleanCode', $('.cls-str-active-yn-select'));
            $('.cls-prod-group-type-select').val(responseMessage.classificationStructureUsageDistinctionCode);

            $('.cls-str-active-yn-select').val(responseMessage.activeYn);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'ClassificationMasterService',
            operation: 'queryClassificationMaster',
          },
        });
      } else {
        var requestData = {
          classificationStructureDistinctionCode: e.item.classificationStructureDistinctionCode,
          classificationCode: e.item.classificationCode,
          pdInfoDscd,
          tntInstId,
          applyStartDate: e.item.applyStartDate,
        };

        PFRequest.get('/classification/getClassificationDetail.json', requestData, {
          success(responseMessage) {
            $el.find('.pf-info-cntnt-info-wrap').addClass('active');
            $el.find('.pf-info-cntnt-info').html(classificationDetailInfoTpl());
            $el.find('.pf-info-cntnt-detail-info').html(classificationManagementPopupTpl(responseMessage));
            PFUtil.getDatePicker(true, $('.classification-management-popup'));

            $el.find('.save-btn').removeClass('class-str-save-btn');
            $el.find('.delete-btn').removeClass('class-str-delete-btn');
            $el.find('.save-btn').addClass('class-save-btn');
            $el.find('.delete-btn').addClass('class-delete-btn');

            // 권한이 없으면 버튼 숨김
            if (writeYn !== 'Y') {
              $('.write-btn').hide();
            }

            if (tntInstId === loginTntInstId) { // enable
              $el.find('.save-btn').prop('disabled', false);
              $el.find('.delete-btn').prop('disabled', false);
            } else{ // disable
              $el.find('.save-btn').prop('disabled', true);
              $el.find('.delete-btn').prop('disabled', true);
            }

            if (responseMessage.activeYn === 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId()))) {
              $('.delete-btn').prop('disabled', false);
            }else {
              $('.delete-btn').prop('disabled', true);
            }

            renderComboBox('ProductBooleanCode', $('.cls-active-yn-select'));
            $('.cls-active-yn-select').val(responseMessage.activeYn);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'ClassificationDetailService',
            operation: 'queryClassificationDetail',
          },
        });
      }
    });


    /* --------------------------------------
         * Context Menu Event - 콘텐츠그룹
         * -------------------------------------- */

    // 콘텐츠그룹기본 조회 이벤트
    const searchContentGroupEvent = function () {
      const requestData = {
        classificationStructureDistinctionCode: treeItem.id,
        PdInfoDscd: pdInfoDscd,
        tntInstId,
        applyStartDate: treeItem.applyStartDate,
      };
      PFRequest.get('/classification/getClassificationMaster.json', requestData, {
        success(responseMessage) {
          responseMessage.work = 'UPDATE';
          renderContentGroupBasePopup(responseMessage);
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'ClassificationMasterService',
          operation: 'queryClassificationMaster',
        },
      });
    };

    // 콘텐츠그룹기본 삭제 이벤트
    const deleteContentGroupEvent = function () {
      deleteContentGroup(treeItem.id, treeItem.applyStartDate);
    };

    /* --------------------------------------
         * Context Menu Event - 분류
         * -------------------------------------- */

    // 분류 신규 이벤트
    const createClassificationEvent = function () {
      const data = { work: 'CREATE' };
      if (treeItem.level === 1) {
        data.classificationStructureDistinctionCode = treeItem.id;
        data.higherClassificationCode = '';
        data.levelNumber = 0;
        data.applyStartDate = `${PFUtil.getNextDate()} 00:00:00`;
        data.applyEndDate = '9999-12-31 23:59:59';
      } else if (treeItem.level > 1) {
        data.classificationStructureDistinctionCode = treeItem.classificationStructureDistinctionCode;
        data.higherClassificationCode = treeItem.classificationCode;
        data.levelNumber = treeItem.levelNumber;
        data.applyStartDate = `${PFUtil.getNextDate()} 00:00:00`;
        data.applyEndDate = '9999-12-31 23:59:59';
      }

      data.path = treeItem.path;

      renderClassificationPopup(data);
    };

    // 분류 조회 이벤트
    const searchClassificationEvent = function () {
      const requestData = {
        classificationStructureDistinctionCode: treeItem.classificationStructureDistinctionCode,
        classificationCode: treeItem.classificationCode,
        pdInfoDscd,
        tntInstId,
        applyStartDate: treeItem.applyStartDate,
      };
      PFRequest.get('/classification/getClassificationDetail.json', requestData, {
        success(responseMessage) {
          responseMessage.work = 'UPDATE';
          renderClassificationPopup(responseMessage);
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'ClassificationDetailService',
          operation: 'queryClassificationDetail',
        },
      });
    };

    // 분류기본 삭제 이벤트
    const deleteClassificationEvent = function () {
      deleteClassification(treeItem.classificationStructureDistinctionCode, treeItem.classificationCode, treeItem.applyStartDate, treeItem);
    };

    /* --------------------------------------
         * Context Menu Event - 상품 관계 관리
         * -------------------------------------- */
    const PfRelationManagementEvent = function () {
      location.hash = makeClassificationInfoParameter(treeItem);
      let emptyObj;
      conditionInfoGrid = emptyObj;
      if (!modifyFlag) {
        renderClassificationInfo(treeItem);
      } else {
        PFComponent.showConfirm(bxMsg('warningDontSaved'), () => {
          renderClassificationInfo(treeItem);
          modifyFlag = false;
          $('.most-significant-box').removeAttr('data-edited');
        }, () => {

        });
      }
    };

    /* --------------------------------------
         * Context Menu
         * -------------------------------------- */
    const relationManagementLabel = bxMsg('PfRelationManagement');

    // 콘텐츠그룹 context menu
    const classificationStructureContextMenu = new Menu.ContextMenu({
      children: [
        makeContextMenu('icon-zoom-in', bxMsg('searchContentsGroup'), searchContentGroupEvent), // 콘텐츠그룹기본 조회
        makeContextMenu('icon-remove', bxMsg('deleteContentsGroup'), deleteContentGroupEvent), // 콘텐츠그룹 삭제
        makeContextMenu('icon-plus', bxMsg('createSubGroup'), createClassificationEvent), // 분류 신규
      ],
    });

    const classificationStructureActiveContextMenu = new Menu.ContextMenu({
      children: [
        makeContextMenu('icon-zoom-in', bxMsg('searchContentsGroup'), searchContentGroupEvent), // 콘텐츠그룹기본 조회
        makeContextMenu('icon-plus', bxMsg('createSubGroup'), createClassificationEvent), // 분류 신규
      ],
    });

    const centerContentGroupContextMenu = new Menu.ContextMenu({
      children: [
        makeContextMenu('icon-zoom-in', bxMsg('searchContentsGroup'), searchContentGroupEvent), // 콘텐츠그룹기본 조회
      ],
    });

    // 분류 상품관계도 없고 하위분류도 없는 경우 Context menu - 모든 context menu를 다 보여줌.
    const classificationBottomContextMenu = new Menu.ContextMenu({
      children: [
        makeContextMenu('icon-zoom-in', bxMsg('searchSubGroup'), searchClassificationEvent), // 분류 조회
        makeContextMenu('icon-remove', bxMsg('deleteSubGroup'), deleteClassificationEvent), // 분류 삭제
        makeContextMenu('icon-plus', bxMsg('createSubGroup'), createClassificationEvent), // 분류 신규
        makeContextMenu('icon-file', relationManagementLabel, PfRelationManagementEvent), // 상품관계관리
      ],
    });

    const classificationBottomActiveContextMenu = new Menu.ContextMenu({
      children: [
        makeContextMenu('icon-zoom-in', bxMsg('searchSubGroup'), searchClassificationEvent), // 분류 조회
        makeContextMenu('icon-plus', bxMsg('createSubGroup'), createClassificationEvent), // 분류 신규
        makeContextMenu('icon-file', relationManagementLabel, PfRelationManagementEvent), // 상품관계관리
      ],
    });


    // 분류 Related Context menu
    const classificationRelatedContextMenu = new Menu.ContextMenu({
      children: [
        makeContextMenu('icon-zoom-in', bxMsg('searchSubGroup'), searchClassificationEvent), // 분류 조회
        makeContextMenu('icon-remove', bxMsg('deleteSubGroup'), deleteClassificationEvent), // 분류 삭제
        makeContextMenu('icon-file', relationManagementLabel, PfRelationManagementEvent), // 상품관계관리
      ],
    });

    const classificationRelatedActiveContextMenu = new Menu.ContextMenu({
      children: [
        makeContextMenu('icon-zoom-in', bxMsg('searchSubGroup'), searchClassificationEvent), // 분류 조회
        makeContextMenu('icon-file', relationManagementLabel, PfRelationManagementEvent), // 상품관계관리
      ],
    });

    // 상품그룹 Related Context menu
    const productGroupRelatedContextMenu = new Menu.ContextMenu({
      children: [
        makeContextMenu('icon-zoom-in', bxMsg('SearchProductGroup'), searchClassificationEvent), // 상품그룹 조회
        makeContextMenu('icon-remove', bxMsg('DeleteProductGroup'), deleteClassificationEvent), // 상품그룹 삭제
        makeContextMenu('icon-file', relationManagementLabel, PfRelationManagementEvent), // 상품관계관리
      ],
    });

    const productGroupRelatedActiveContextMenu = new Menu.ContextMenu({
      children: [
        makeContextMenu('icon-zoom-in', bxMsg('SearchProductGroup'), searchClassificationEvent), // 상품그룹 조회
        makeContextMenu('icon-file', relationManagementLabel, PfRelationManagementEvent), // 상품관계관리
      ],
    });

    const centerProductGroupRelatedContextMenu = new Menu.ContextMenu({
      children: [
        makeContextMenu('icon-zoom-in', bxMsg('SearchProductGroup'), searchClassificationEvent), // 상품그룹 조회
      ],
    });


    // 분류 하위분류 있는 경우 Context menu
    const classificationContextMenu = new Menu.ContextMenu({
      children: [
        makeContextMenu('icon-zoom-in', bxMsg('searchSubGroup'), searchClassificationEvent), // 분류 조회
        makeContextMenu('icon-remove', bxMsg('deleteSubGroup'), deleteClassificationEvent), // 분류 삭제
        makeContextMenu('icon-plus', bxMsg('createSubGroup'), createClassificationEvent), // 분류 신규
      ],
    });

    const classificationActiveContextMenu = new Menu.ContextMenu({
      children: [
        makeContextMenu('icon-zoom-in', bxMsg('searchSubGroup'), searchClassificationEvent), // 분류 조회
        makeContextMenu('icon-plus', bxMsg('createSubGroup'), createClassificationEvent), // 분류 신규
      ],
    });

    const centerClassificationContextMenu = new Menu.ContextMenu({
      children: [
        makeContextMenu('icon-zoom-in', bxMsg('searchSubGroup'), searchClassificationEvent), // 분류 조회
      ],
    });


    // context menu 추가
    navTree.on('itemcontextmenu', (ev) => {
      if (loginTntInstId !== tntInstId) return; // 타기관 선택 시 contextmenu 보여주지 않음

      const item = ev.item;
      navTree.setSelected(item);
      treeItem = item;

      const y = ev.pageY >= 500 ? ev.pageY - (28 * 4) : ev.pageY;


      if (treeItem.level === 1) {
        if (writeYn !== 'Y') {
          centerContentGroupContextMenu.set('xy', [ev.pageX, y]);
          centerContentGroupContextMenu.show();
        }
        // 비활동이거나 emergency
        else if (treeItem.activeYn === 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId()))) {
          classificationStructureContextMenu.set('xy', [ev.pageX, y]);
          classificationStructureContextMenu.show();
        }
        // 활동일때
        else {
          classificationStructureActiveContextMenu.set('xy', [ev.pageX, y]);
          classificationStructureActiveContextMenu.show();
        }
      }
      // 분류인 경우
      else if (treeItem.level > 1) {
        if (writeYn !== 'Y') {
          centerClassificationContextMenu.set('xy', [ev.pageX, y]);
          centerClassificationContextMenu.show();
        } else {
          // 상품관계가 연결된 경우
          if (treeItem.related) {
            if (treeItem.activeYn === 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId()))) {
              classificationRelatedContextMenu.set('xy', [ev.pageX, y]);
              classificationRelatedContextMenu.show();
            } else {
              classificationRelatedActiveContextMenu.set('xy', [ev.pageX, y]);
              classificationRelatedActiveContextMenu.show();
            }
          }
          // 상품관계가 연결되지 않은 경우
          else {
            // 하위 분류가 없는 경우
            if (treeItem.leaf) {
              if (treeItem.activeYn === 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId()))) {
                classificationBottomContextMenu.set('xy', [ev.pageX, y]);
                classificationBottomContextMenu.show();
              } else {
                classificationBottomActiveContextMenu.set('xy', [ev.pageX, y]);
                classificationBottomActiveContextMenu.show();
              }
            }
            // 하위 분류가 있는 경우
            else if (treeItem.activeYn === 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId()))) {
              classificationContextMenu.set('xy', [ev.pageX, y]);
              classificationContextMenu.show();
            } else {
              classificationActiveContextMenu.set('xy', [ev.pageX, y]);
              classificationActiveContextMenu.show();
            }
          }
        }
      }
      return false;
    });
  });
}

function reloadClassificationNavTree() {
  renderClassificationNavTree.isRendered = false;
  renderClassificationNavTree();
}

// 트리 박스 스크롤
function scrollMove() {
  const selectedItemTop = $('.pfui-tree-item .pfui-tree-item-selected').offset().top;
  $('.pf-left-nav .pf-panel-body').scrollTop(selectedItemTop - 200);
}

//
function traceTree() {
  if (traceTree.completeTrace) { return; }

  const currentNode = navTreeStore.findNode(traceTree.traceList[traceTree.depth]);

  if (((traceTree.traceList.length - 1) === traceTree.depth)) {
    setTimeout(() => {
      classForEvent = currentNode;
      navTree.setSelection(currentNode);
      // scrollMove();
    }, 100);
    traceTree.completeTrace = true;
    return;
  }
  navTree.expandNode(currentNode);


  traceTree.depth++;
}

/** ****************************************************************************************************************
 * 그리드 관련
 ***************************************************************************************************************** */
function renderClassificationGrid(data) {
  const columns = [];

  if (pdInfoDscd === pdInfoDscd_Product) {
    columns.push({ text: bxMsg('DPP0107String1'), flex: 1, dataIndex: 'pdInformationCode' }); // 상품코드
    columns.push({ text: bxMsg('DPP0107String2'), flex: 2, dataIndex: 'pdInformationName' }); // 상품명
  } else if (pdInfoDscd === pdInfoDscd_Service) {
    columns.push({ text: bxMsg('ServiceCode'), flex: 1, dataIndex: 'pdInformationCode' }); // 상품코드
    columns.push({ text: bxMsg('ServiceName'), flex: 2, dataIndex: 'pdInformationName' }); // 상품명
  } else if (pdInfoDscd === pdInfoDscd_Point) {
    columns.push({ text: bxMsg('PointCode'), flex: 1, dataIndex: 'pdInformationCode' }); // 상품코드
    columns.push({ text: bxMsg('PointName'), flex: 2, dataIndex: 'pdInformationName' }); // 상품명
  }

  columns.push({
    text: bxMsg('DPP0127String6'),
    width: 150,
    dataIndex: 'applyStartDate', // 적용시작일
    editor: {
      allowBlank: false,
      listeners: {
        focus(_this) {
          let isNextDay = true;
          if (getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))) {
            isNextDay = false;
          }
          PFUtil.getGridDateTimePicker(_this, 'applyStartDate', relatedPdGrid, selectedCellIndex, isNextDay);
        },
        blur(_this, e) {
          PFUtil.checkDate(e.target);
        },
      },
    },
    listeners: {
      click() {
        selectedCellIndex = $(arguments[1]).parent().index();
      },
    },
  });

  columns.push({
    text: bxMsg('DPP0127String7'),
    width: 150,
    dataIndex: 'applyEndDate', // 적용종료일
    editor: {
      allowBlank: false,
      listeners: {
        focus(_this) {
          PFUtil.getGridDateTimePicker(_this, 'applyEndDate', relatedPdGrid, selectedCellIndex, true);
        },
        blur(_this, e) {
          PFUtil.checkDate(e.target, '9999-12-31 23:59:59');
        },
      },
    },
    listeners: {
      click() {
        selectedCellIndex = $(arguments[1]).parent().index();
      },
    },
  });

  columns.push({ // delete row
    xtype: 'actioncolumn',
    width: 35,
    align: 'center',
    sortable: false,
    items: [{
      icon: '/images/x-delete-16.png',
      handler(grid, rowIndex, colIndex, item, e, record) {
        if (record.data.activeYn === 'N' || (getSelectedProjectId() && isEmergency(getSelectedProjectId()))) {
          if (record.data.process !== 'C') {
            record.data.process = 'D';
            productRelgridDeleteData.push(record.data);
          }
          record.destroy();
          modifyFlag = true;
        } else {
          PFComponent.showMessage(bxMsg('dontDeleteActiveTypeConditionTemplate'), 'warning');
        }
      },
    }],
  });

  relatedPdGrid = PFComponent.makeExtJSGrid({
    // pageAble: true,
    fields: ['pdInformationCode', 'pdInformationName', 'applyStartDate', 'applyEndDate', 'activeYn', 'process'],
    gridConfig: {
      renderTo: '.pf-info-cntnt-grid',
      columns,
      listeners: {
        scope: this,
        celldblclick(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
          const cntnt = `${$('.apply-rule').val()}#${record.get('pdInformationCode')}`;
          $('.apply-rule').val(cntnt);
        },
      },
      plugins: [getGridCellEditiongPlugin()],
    },
  });

  relatedPdGrid.setData(data);
}

// grid cell editing plugin
function getGridCellEditiongPlugin() {
  return Ext.create('Ext.grid.plugin.CellEditing', {
    clicksToEdit: 1,
    listeners: {
      afteredit(e, editor) {
        if (editor.originalValue !== editor.value) {
          if (editor.field !== 'applyEndDate' && (editor.record.get('process') === null || editor.record.get('process').length === 0)) {
            const originalData = $.extend(true, {}, editor.record.data);
            originalData[editor.field] = editor.record.modified[editor.field];
            originalData.process = 'D';
            productRelgridDeleteData.push(originalData);

            editor.record.set('process', 'C');
          } else if (editor.record.get('process') !== 'C') {
            editor.record.set('process', 'U');
          }
          modifyFlag = true;
        }
      },
      beforeedit(e, editor) {
        if (editor.record.data.activeYn === 'N' || // 비활동인 경우
                    (getSelectedProjectId() && isEmergency(getSelectedProjectId())) || // emergency 인 경우
                    (getSelectedProjectId() && isUpdateStatus(getSelectedProjectId()))) { // 상품정보 수정인 경우
          // 모두 수정 가능
        } else if (editor.field === 'applyStartDate' && editor.record.get('process') !== 'C') {
          return false;
        }
      },
    },
  });
}

// 그리드 new data
function setNewGridData(clickEventForNewData, relatedPdGrid) {
  const applyStartDate = `${PFUtil.getNextDate()} ` + '00:00:00';
  const applyEndDate = '9999-12-31 23:59:59';

  clickEventForNewData.applyStartDate = applyStartDate;
  clickEventForNewData.applyEndDate = applyEndDate;
  clickEventForNewData.applyStart = applyStartDate;
  clickEventForNewData.applyEnd = applyEndDate;
  clickEventForNewData.activeYn = 'N';
  clickEventForNewData.process = 'C';

  relatedPdGrid.addData(clickEventForNewData);
  modifyFlag = true;
}

/** ****************************************************************************************************************
 * 사용자 함수
 ***************************************************************************************************************** */
// 파라미터 조합
function makeClassificationInfoParameter(treeItem) {
  let returnVal;

  if (treeItem.level === 1) {
    returnVal = `classificationStructureDistinctionCode=${treeItem.id}`;
  } else { treeItem.level > 1; } {
    returnVal = `classificationStructureDistinctionCode=${treeItem.classificationStructureDistinctionCode
    }&classificationCode=${treeItem.classificationCode}`;
  }

  return returnVal;
}


// Context Menu 생성
function makeContextMenu(icon, title, clickEvent, UIEvent) {
  let listener;

  if (UIEvent) {
    listener = {
      click(e) {
        clickEvent();
      },
      afterRenderUI(e) {
        UIEvent();
      },
    };
  } else {
    listener = {
      click(e) {
        clickEvent();
      },
    };
  }

  const contextMenu = {
    iconCls: icon,
    text: title,
    listeners: listener,
  };

  return contextMenu;
}

// 개발과제가 Emergency 일 때
function fnEmergencyControl(flag) {
  if (writeYn === 'Y') {
    if (flag) {
      $('.write-btn').prop('disabled', false);
    } else if ($('.cls-active-yn-select').val() === 'Y' || $('.cls-str-active-yn-select').val() === 'Y') {
      $('.delete-btn').prop('disabled', true);
    }
  }
}

function searchClassificationConditionList(searchBaseDate) {
  const requestData = {};

  if (searchBaseDate && searchBaseDate !== null && searchBaseDate !== '') {
    requestData.applyStart = searchBaseDate;
  }

  requestData.tntInstId = tntInstId;
  requestData.pdInfoDscd = pdInfoDscd;
  requestData.classificationStructureDistinctionCode = classForEvent.classificationStructureDistinctionCode;
  requestData.classificationCode = classForEvent.classificationCode;

  PFRequest.get('/contents/getListPdInfoCntnt.json', requestData, {
    success(result) {
      if (!conditionInfoGrid) {
        conditionInfoGrid = renderConditionInfoGrid();
      }
      conditionInfoGrid.setData(result);
    },
    bxmHeader: {
      application: 'PF_Factory',
      service: 'ProductInfoContentsService',
      operation: 'getListPdInfoCntnt',
    },
  });
}


function renderConditionInfoGrid() {
  conditionInfoGrid = PFComponent.makeExtJSGrid({
    pageAble: true,
    fields: ['classificationStructureDistinctionCode', 'classificationCode', 'pdInfoChnlDscd', 'pdInfoCntntDscd', 'applyStartDate', 'applyEndDate', 'cntntTitle', 'cntnt'],
    gridConfig: {
      renderTo: '.pf-cnd-tmplt-grid',
      columns: [
        {
          text: bxMsg('chnlDscd'),
          flex: 0.3,
          dataIndex: 'pdInfoChnlDscd',
          renderer(value, p, record) {
            return codeMapObj.CntntChnlDscd[value];
          },
        },
        {
          text: bxMsg('contentsType'),
          flex: 1,
          dataIndex: 'pdInfoCntntDscd',
          renderer(value, p, record) {
            return codeMapObj.CntntTypeDscd[value];
          },
        },
        { text: bxMsg('contentsTitle'), flex: 1, dataIndex: 'cntntTitle' },
        { text: bxMsg('DPP0127String6'), width: 150, dataIndex: 'applyStartDate' },
        { text: bxMsg('DPP0127String7'), width: 150, dataIndex: 'applyEndDate' },
      ],
      listeners: {
        scope: this,
        celldblclick(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
          renderContentsEditPopup(Object.assign(record.data, { process: 'U' }));
        },
      },
      plugins: [getGridCellEditiongPlugin()],
    },
  });
  return conditionInfoGrid;
}


{
  $('body').css('overflow-y', 'scroll');
  lengthVald('.length-check-input', 50);
  PFComponent.toolTip($el);

  // Start Rendering Page
  renderClassficationTreeBox(); // 상품분류 Tree Box
}
