const newProductTypeTplNmPopupTpl = getTemplate('newProductTypeTplNmPopupTpl');
const changeProductTypeTplNmPopupTpl = getTemplate('changeProductTypeTplNmPopupTpl');
const newDetailTpPopupTpl = getTemplate('newDetailTpPopupTpl');
const detailTpPopupTpl = getTemplate('detailTpPopupTpl');
const changeDetailTypeTplNmPopupTpl = getTemplate('changeDetailTypeTplNmPopupTpl');

function renderProductTypeCreatePopup(treeItem) {
  var title;
  switch (pdInfoDscd) {
  case pdInfoDscd_Product :
    title = 'DPE00001_New_PdTp_Title';
    break;
  case pdInfoDscd_Service :
    title = 'DPE00002_New_SvTp_Title'
      break;
  case pdInfoDscd_Point :
    title = 'DPE00003_New_PoTp_Title';
    break;
  }

  PFComponent.makePopup({
    title: bxMsg(title),
    width: 350,
    height: 170,
    contents: newProductTypeTplNmPopupTpl(),
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary write-btn enter-save-btn', handler : function(){
        var that = this,
        changedNm = $('.new-product-type-Tpl-name-popup .product-type-name-input').val();

        changedNm = changedNm.split(' ').join('');

        if(PFValidation.popupMandatoryCheck('.new-product-type-Tpl-name-popup .mandatory')){
          if(PFValidation.finalLengthCheck('', 50, changedNm) && PFValidation.specialCharacter('.new-product-tpl-popup .special')) {
            var requestParam = {'type': treeItem.type, "id": treeItem.id,"name": changedNm, 'pdInfoDscd' : pdInfoDscd};
            requestParam.projectId =  $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();

            PFRequest.post('/catalog/createCatalog.json', requestParam, {
              success: function(result) {
                that.close();

                PFComponent.showMessage(bxMsg('workSuccess'), 'success');

                var treeId = result.childCatalogs[0].id.split('.');

                traceTree.traceList = [treeId[0], treeId[0] + '.' + treeId[1]];

                traceTree.depth = 0;

                traceTree.completeTrace = false;
                renderProductNavTree.isRendered = false;
                renderProductNavTree();
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'CatalogService',
                operation: 'createCatalog'
              }
            });
          }
        }

      }},
      {text: bxMsg('ButtonBottomString16'), elCls: 'button button-primary', handler : function(){ this.close() }}
      ],
      listeners: {
          afterSyncUI: function() {
        	  $('.new-product-type-Tpl-name-popup .product-type-name-input').focus();
          }
      }
  });
}


function renderProductTypeRenamePopup(treeItem) {
  var projectId =  $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
  if(isNotMyTask(projectId)){
    return;
  };

  var title;
  switch (pdInfoDscd) {
  case pdInfoDscd_Product :
    title = 'DPE00001_Rename_PdTp_Title';   // 변경할 상품유형이름
    break;
  case pdInfoDscd_Service :
    title = 'DPE00001_Rename_SvTp_Title'
      break;
  case pdInfoDscd_Point :
    title = 'DPE00001_Rename_PoTp_Title';
    break;
  }

  PFComponent.makePopup({
    title: bxMsg(title),
    width: 350,
    height: 170,
    contents: changeProductTypeTplNmPopupTpl({'name': treeItem.text}),
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary write-btn enter-save-btn', handler : function(){
        var that = this,
        changedNm = $('.change-product-type-Tpl-name-popup .product-name-input').val();

        changedNm = changedNm.split(' ').join('');

        if(PFValidation.popupMandatoryCheck('.change-product-type-Tpl-name-popup .mandatory')){
          if(PFValidation.finalLengthCheck('', 50, changedNm) && PFValidation.specialCharacter('.change-product-type-Tpl-name-popup .special')) {
            var requestParam = {"type": '05', "id": treeItem.id,"name": changedNm};
            requestParam.projectId = projectId;

            PFRequest.post('/catalog/updateCatalog.json', requestParam, {
              success: function(result) {
                var changedNode = navTreeStore.findNode(treeItem.id);
                changedNode.text = changedNm;
                navTreeStore.update(changedNode);
                that.close();
                PFComponent.showMessage(bxMsg('workSuccess'), 'success'); // OHS 20180418 추가
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'CatalogService',
                operation: 'updateCatalog'
              }
            });
          }
        }

      }},
      {text: bxMsg('ButtonBottomString16'), elCls: 'button button-primary', handler : function(){ this.close() }}
      ],
      listeners: {
          afterSyncUI: function() {
        	  var $name = $('.change-product-type-Tpl-name-popup .product-name-input');
        	  var nameLength = $name.val().length;
        	  $name.selectRange(nameLength, nameLength);
          }
      }
  });
}


function renderProductDetailTypeCreatePopup(treeItem) {
  PFComponent.makePopup({
    title: bxMsg('DTE00001_New_DetailType_Title'),
    contents: newDetailTpPopupTpl(),
    width: 350,
    height: 170,
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary write-btn enter-save-btn', handler : function(){
        var that = this,
        changedNm = $('.new-detail-type-popup .detail-type-name-input').val();

        changedNm = changedNm.split(' ').join('');

        if(PFValidation.popupMandatoryCheck('.new-detail-type-popup .mandatory')){
          if(PFValidation.finalLengthCheck('', 50, changedNm) && PFValidation.specialCharacter('.new-detail-type-popup .special')) {
            var requestParam = {'id': treeItem.id, 'type': '5N', "name": changedNm, 'pdInfoDscd' : pdInfoDscd};
            requestParam.projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();

            PFRequest.post('/catalog/createCatalog.json', requestParam, {
              success: function(result) {
                var treeId = result.childCatalogs[0].id.split('.');

                traceTree.traceList = [treeId[0], treeId[0] + '.' + treeId[1], treeId[0] + '.' + treeId[1] + '.' + treeId[2]];

                traceTree.depth = 0;

                traceTree.completeTrace = false;
                renderProductNavTree.isRendered = false;
                renderProductNavTree();

                that.close();
                PFComponent.showMessage(bxMsg('workSuccess'), 'success',function() {
                  scrollMove();
                  location.hash = '&firstCatalogId=' + treeId[0] + '&secondCatalogId=' + treeId[1] +'&id='+result.childCatalogs[0].id;
                });
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'CatalogService',
                operation: 'createCatalog'
              }
            });
          }
        }
      }},
      {text: bxMsg('ButtonBottomString16'), elCls: 'button button-primary', handler : function(){ this.close() }}
      ],
      listeners: {
          afterSyncUI: function() {
        	  $('.new-detail-type-popup .detail-type-name-input').focus();
          }
      }
  });
}


function renderProductDetailTypeAddPopup(treeItem) {
  PFComponent.makePopup({
    title: bxMsg('DTE00001_New_DetailType_Title'),
    contents: detailTpPopupTpl(),
    width: 350,
    height: 170,
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary write-btn enter-save-btn', handler : function(){
        var that = this,
        changedNm = $('.add-detail-type-popup .detail-type-name-input').val();

        changedNm = changedNm.split(' ').join('');

        if(PFValidation.popupMandatoryCheck('.add-detail-type-popup .mandatory')){
          if(PFValidation.finalLengthCheck('', 50, changedNm) && PFValidation.specialCharacter('.add-detail-type-popup .special')) {
            var requestParam = {'id': treeItem.id, 'type': '6I', "name": changedNm, 'pdInfoDscd' : pdInfoDscd};
            requestParam.projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();

            PFRequest.post('/catalog/createCatalog.json', requestParam, {
              success: function(result) {

                var treeId = treeItem.id.split('.'),
                traceArr = [],
                tempId = '',
                firstIdx = true;

                treeId.forEach(function(el, idx) {

                  if (firstIdx) {
                    tempId = el;
                    firstIdx = false;
                  } else {
                    tempId = tempId + '.' +el;
                  }

                  traceArr.push(tempId);
                });
                traceArr.push(result.childCatalogs[0].id);

                traceTree.traceList = traceArr;
                traceTree.depth = 0;

                traceTree.completeTrace = false;
                renderProductNavTree.isRendered = false;
                renderProductNavTree();

                that.close();
                PFComponent.showMessage(bxMsg('workSuccess'), 'success');
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'CatalogService',
                operation: 'createCatalog'
              }
            });
          }
        }
      }},
      {text: bxMsg('ButtonBottomString16'), elCls: 'button button-primary', handler : function(){ this.close() }}
      ],
      listeners: {
          afterSyncUI: function() {
        	  $('.add-detail-type-popup .detail-type-name-input').focus();
          }
      }
  });
}


function renderProductDetailTypeRenamePopup(treeItem) {
  PFComponent.makePopup({
    title: bxMsg('DTE00001_Rename_DetailType_Title'),
    width: 350,
    height: 170,
    contents: changeDetailTypeTplNmPopupTpl({'name': treeItem.text}),
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary write-btn enter-save-btn', handler : function(){
        var that = this,
        changedNm = $('.change-detail-type-Tpl-name-popup .detail-name-input').val();

        changedNm = changedNm.split(' ').join('');

        if(PFValidation.popupMandatoryCheck('.change-detail-type-Tpl-name-popup .mandatory')){
          if(PFValidation.finalLengthCheck('', 50, changedNm) && PFValidation.specialCharacter('.change-detail-type-Tpl-name-popup .special')) {
            var requestParam = {"id": treeItem.id,"name": changedNm, "type": '06'};
            requestParam.projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();;

            PFRequest.post('/catalog/updateCatalog.json', requestParam, {
              success: function(result) {
                var changedNode = navTreeStore.findNode(treeItem.id);
                changedNode.text = changedNm;
                navTreeStore.update(changedNode);
                that.close();
                PFComponent.showMessage(bxMsg('workSuccess'), 'success'); // OHS 20180418 추가
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'CatalogService',
                operation: 'updateCatalog'
              }
            });
          }
        }
      }},
      {text: bxMsg('ButtonBottomString16'), elCls: 'button button-primary', handler : function(){ this.close() }}
      ],
      listeners: {
          afterSyncUI: function() {
        	  var $name = $('.change-detail-type-Tpl-name-popup .detail-name-input');
        	  var nameLength = $name.val().length;
        	  $name.selectRange(nameLength, nameLength);
          }
      }
  });
}


function renderProductDetailSubTypeCreatePopup(treeItem) {
  PFComponent.makePopup({
    title: bxMsg('DTE00001_New_DetailType_Title'),
    contents: newDetailTpPopupTpl(),
    width: 350,
    height: 170,
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary write-btn enter-save-btn', handler : function(){
        var that = this,
        changedNm = $('.new-detail-type-popup .detail-type-name-input').val();

        changedNm = changedNm.split(' ').join('');

        if(PFValidation.popupMandatoryCheck('.new-detail-type-popup .mandatory')){
          if(PFValidation.finalLengthCheck('', 50, changedNm) && PFValidation.specialCharacter('.new-detail-type-popup .special')) {
            var requestParam = {'id': treeItem.id, 'type': '6N', "name": changedNm, 'pdInfoDscd' : pdInfoDscd};
            requestParam.projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();

            PFRequest.post('/catalog/createCatalog.json', requestParam, {
              success: function(result) {
                that.close();

                var treeId = treeItem.id.split('.'),
                traceArr = [],
                tempId = '',
                firstIdx = true;

                treeId.forEach(function(el, idx) {

                  if (firstIdx) {
                    tempId = el;
                    firstIdx = false;
                  } else {
                    tempId = tempId + '.' +el;
                  }

                  traceArr.push(tempId);
                });

                traceArr.push(result.childCatalogs[0].id);

                traceTree.traceList = traceArr;

                traceTree.depth = 0;

                traceTree.completeTrace = false;
                renderProductNavTree.isRendered = false;
                renderProductNavTree();

                PFComponent.showMessage(bxMsg('workSuccess'), 'success',function() {
                  //scrollMove();
                  location.hash = '&firstCatalogId=' + treeId[0] + '&secondCatalogId=' + treeId[1] +'&id='+treeItem.id;
                });
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'CatalogService',
                operation: 'createCatalog'
              }
            });
          }
        }



      }},
      {text: bxMsg('ButtonBottomString16'), elCls: 'button button-primary', handler : function(){ this.close() }}
      ],
      listeners: {
          afterSyncUI: function() {
        	  $('.new-detail-type-popup .detail-type-name-input').focus();
          }
      }
  });
}


function renderProductDetailSubTypeAddPopup(treeItem) {
  PFComponent.makePopup({
    title: bxMsg('DTE00001_New_DetailType_Title'),      // 생성할 세부유형 이름
    contents: detailTpPopupTpl(),
    width: 350,
    height: 170,
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary write-btn enter-save-btn', handler : function(){
        var that = this,
        changedNm = $('.add-detail-type-popup .detail-type-name-input').val();

        changedNm = changedNm.split(' ').join('');

        if(PFValidation.popupMandatoryCheck('.add-detail-type-popup .mandatory')){
          if(PFValidation.finalLengthCheck('', 50, changedNm) && PFValidation.specialCharacter('.add-detail-type-popup .special')) {
            var requestParam = {"type": '5I', "id": treeItem.id,"name": changedNm, 'pdInfoDscd' : pdInfoDscd};
            requestParam.projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
            PFRequest.post('/catalog/createCatalog.json', requestParam, {
              success: function(result) {

                var treeId = treeItem.id.split('.'),
                traceArr = [],
                tempId = '',
                firstIdx = true;

                treeId.forEach(function(el, idx) {

                  if (firstIdx) {
                    tempId = el;
                    firstIdx = false;
                  } else {
                    tempId = tempId + '.' +el;
                  }

                  traceArr.push(tempId);
                });

                traceArr.push(result.childCatalogs[0].id);

                traceTree.traceList = traceArr;

                traceTree.depth = 0;

                traceTree.completeTrace = false;
                renderProductNavTree.isRendered = false;
                renderProductNavTree();


                that.close();
                PFComponent.showMessage(bxMsg('workSuccess'), 'success');
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'CatalogService',
                operation: 'createCatalog'
              }
            });

          }
        }
      }},
      {text: bxMsg('ButtonBottomString16'), elCls: 'button button-primary', handler : function(){ this.close() }}
      ],
      listeners: {
          afterSyncUI: function() {
        	  $('.add-detail-type-popup .detail-type-name-input').focus();
          }
      }
  });
}

