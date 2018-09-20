const newProductTplPopupTpl = getTemplate('newProductTplPopupTpl');
const copyProductTplNmPopupTpl = getTemplate('copyProductTplNmPopupTpl');
const changeProductTplNmPopupTpl = getTemplate('changeProductTplNmPopupTpl');


function renderProductTemplateCreatePopup(treeItem) {
  var title;
  switch (pdInfoDscd) {
  case pdInfoDscd_Product :
    title = 'DTE00001_New_Title';
    break;
  case pdInfoDscd_Service :
    title = 'DTE00004_New_Title'
      break;
  case pdInfoDscd_Point :
    title = 'DTE00005_New_Title';
    break;
  }

  PFComponent.makePopup({
    title: bxMsg(title),
    width: 350,
    height: 170,
    contents: newProductTplPopupTpl(),
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary write-btn enter-save-btn', handler : function(){
        var that = this,
        newName = $('.new-product-tpl-popup .product-name-input').val(),
        firstCatalogId = treeItem.id.split('.')[0],
        secondCatalogId = treeItem.id.split('.')[1];

        newName = newName.split(' ').join('');

        if(PFValidation.popupMandatoryCheck('.new-product-tpl-popup .mandatory')){
          if(PFValidation.finalLengthCheck('', 50, newName) && PFValidation.specialCharacter('.new-product-tpl-popup .special')) {
            var treeId = treeItem.id.split('.');

            var requestParam = {"firstCatalogId": treeId[0],"secondCatalogId": treeId[1], "name": newName};
            requestParam.projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
            requestParam.pdInfoDscd = pdInfoDscd;   // 01.상품

            PFRequest.post('/product/template/createProductTemplateBase.json', requestParam, {
              success: function(result) {
                PFUI.use('pfui/overlay', function(overlay){
                  var parentNode = navTreeStore.findNode(treeItem.id);
                  navTreeStore.add(result, parentNode);
                  modifyFlag = false;
                  that.close();
                  PFComponent.showMessage(bxMsg('workSuccess'), 'success',function() {
                    scrollMove();
                    location.hash = 'code=' + result.code + '&firstCatalogId=' + firstCatalogId + '&secondCatalogId=' + secondCatalogId+'&id='+treeItem.id + '.' + result.code;
                    location.reload();
                  });
                });

              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'PdTemplateService',
                operation: 'createPdTemplate'
              }
            });
          }
        }
      }},
      {text: bxMsg('ButtonBottomString16'), elCls: 'button button-primary', handler : function(){
    	  modifyFlag = false;
    	  this.close()
    	  }
      }
      ],
      listeners: {
          afterSyncUI: function() {
        	  $('.new-product-tpl-popup .product-name-input').focus();
          }
      }
  });
}


function renderProductTemplateCopyPopup(treeItem) {
  var title;
  switch (pdInfoDscd) {
  case pdInfoDscd_Product :
    title = 'DTE00001_Copy_Title';
    break;
  case pdInfoDscd_Service :
    title = 'DTE00004_Copy_Title'
      break;
  case pdInfoDscd_Point :
    title = 'DTE00005_Copy_Title';
    break;
  }

  PFComponent.makePopup({
    title: bxMsg(title),
    width: 350,
    height: 170,
    contents: copyProductTplNmPopupTpl({'name': treeItem.text + '_copy'}),
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary write-btn enter-save-btn', handler : function(){
        var that = this,
        changedNm = $($.find('.copy-product-tpl-popup')).find('.product-name-input').val();

        changedNm = changedNm.split(' ').join('');

        if(PFValidation.popupMandatoryCheck('.copy-product-tpl-popup .product-name-input')){
          if(PFValidation.finalLengthCheck('', 50, changedNm) && PFValidation.specialCharacter('.copy-product-tpl-popup .special')) {
            var idSplit = treeItem.id.split('.');

            var requestParam = {
                "firstCatalogId": treeItem.firstCatalogId,
                "secondCatalogId": treeItem.secondCatalogId,
                "currentCategoryId": treeItem.currentCatalogId,
                "code": treeItem.code,
                "name": changedNm
            };
            requestParam.projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
            requestParam.pdInfoDscd = pdInfoDscd;

            PFRequest.post('/product/template/copyProductTemplate.json', requestParam, {
              success: function(result, totalResult) {
                PFUI.use('pfui/overlay', function(overlay){
                  var treeId = treeItem.id.split('.'),
                  idLength = treeId.length,
                  parentNodeId = '',
                  firstIdx = true;

                  treeId.forEach(function(el, idx) {
                    if (idLength-1 === idx) {
                      return;
                    }

                    if (firstIdx) {
                      firstIdx = false;
                      parentNodeId = el;
                    } else {
                      parentNodeId = parentNodeId + '.' + el;
                    }
                  });
                  modifyFlag = false;
                  that.close();
                  PFComponent.showMessage(bxMsg('workSuccess'), 'success',function(){
                    var locationHash = 'code=' + result.code+'&firstCatalogId='+result.firstCatalogId+'&secondCatalogId='+result.secondCatalogId+'&id='+parentNodeId + '.' + result.code;
                    if (treeItem.currentCatalogId) {
                      locationHash = locationHash + '&currentCatalogId=' + treeItem.currentCatalogId;
                    }
                    scrollMove();
                    location.hash = locationHash;
                    location.reload();
                  });
                });
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'PdTemplateService',
                operation: 'copyPdTemplate'
              }
            });
          }
        }

      }},
      {text: bxMsg('ButtonBottomString16'), elCls: 'button button-primary', handler : function(){
    	  modifyFlag = false;
    	  this.close()
    	  }
      }
      ],
      listeners: {
          afterSyncUI: function() {
        	  var $name = $('.copy-product-tpl-popup .product-name-input');
        	  var nameLength = $name.val().length;
        	  $name.selectRange(0, nameLength);
          }
      }
  });
}

function renderProductTemplateRenamePopup(treeItem) {
  var title;
  switch (pdInfoDscd) {
  case pdInfoDscd_Product :
    title = 'DTE00001_Rename_Title';
    break;
  case pdInfoDscd_Service :
    title = 'DTE00004_Rename_Title'
      break;
  case pdInfoDscd_Point :
    title = 'DTE00005_Rename_Title';
    break;
  }

  PFComponent.makePopup({
    title: bxMsg(title),
    width: 350,
    height: 170,
    contents: changeProductTplNmPopupTpl({'name': treeItem.text}),
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary write-btn enter-save-btn', handler : function(){
        var that = this,
        changedNm = $('.change-product-Tpl-name-popup .product-name-input').val();

        changedNm = changedNm.split(' ').join('');


        if(PFValidation.popupMandatoryCheck('.change-product-Tpl-name-popup .product-name-input')){
          if(PFValidation.finalLengthCheck('', 50, changedNm) && PFValidation.specialCharacter('.change-product-Tpl-name-popup .special')) {
            var treeId = treeItem.id.split('.');
            var idLength = treeId.length;
            var requestParam = {"firstCatalogId": treeItem.firstCatalogId,"secondCatalogId": treeItem.secondCatalogId, "code": treeId[idLength-1],"name": changedNm};
            requestParam.projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();//projectId;
            requestParam.pdInfoDscd = pdInfoDscd;

            PFRequest.post('/product/template/updateProductTemplateBase.json', requestParam, {
              success: function(result) {
                PFUI.use('pfui/overlay', function(overlay){
                  var parentNodeId = '',
                  firstIdx = true;

                  treeId.forEach(function(el, idx) {
                    if (idLength-1 === idx) {
                      return;
                    }

                    if (firstIdx) {
                      firstIdx = false;
                      parentNodeId = el;
                    } else {
                      parentNodeId = parentNodeId + '.' + el;
                    }
                  });
                  modifyFlag = false;
                  that.close();
                  PFComponent.showMessage(bxMsg('workSuccess'), 'success',function(){
                    var locationHash = 'code=' + treeId[idLength-1]
                    + '&firstCatalogId='+treeItem.firstCatalogId
                    + '&secondCatalogId='+treeItem.secondCatalogId
                    + '&id='+parentNodeId + '.' + treeItem.code;
                    if (treeItem.currentCatalogId) {
                      locationHash = locationHash + '&currentCatalogId=' + treeItem.currentCatalogId;
                    }
                    location.hash = locationHash;
                    location.reload();
                  });
                });
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'PdTemplateService',
                operation: 'updatePdTemplate'
              }
            });
          }
        }

      }},
      {text: bxMsg('ButtonBottomString16'), elCls: 'button button-primary', handler : function(){
    	  modifyFlag = false;
    	  this.close()
    	  }
      }
      ],
      listeners: {
          afterSyncUI: function() {
        	  var $name = $('.change-product-Tpl-name-popup .product-name-input');
        	  var nameLength = $name.val().length;
        	  $name.selectRange(nameLength, nameLength);
          }
      }
  });
}


function renderSubProductTemplateCreatePopup(treeItem) {
  PFComponent.makePopup({
    title: bxMsg('DTE00001_New_Title'),
    width: 350,
    height: 170,
    contents: newProductTplPopupTpl(),
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary write-btn enter-save-btn', handler : function(){
        var that = this,
        newName = $('.new-product-tpl-popup .product-name-input').val();

        newName = newName.split(' ').join('');

        if(PFValidation.popupMandatoryCheck('.new-product-tpl-popup .mandatory')){
          if(PFValidation.finalLengthCheck('', 50, newName) && PFValidation.specialCharacter('.new-product-tpl-popup .special')) {
            var requestParam = {"firstCatalogId":treeItem.id.split('.')[0],"secondCatalogId":treeItem.id.split('.')[1], "currentCatalogId":treeItem.id.split('.')[treeItem.id.split('.').length - 1], "name": newName};
            requestParam.projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
            requestParam.pdInfoDscd = pdInfoDscd;   // 01.상품

            PFRequest.post('/product/template/createProductTemplateBase.json', requestParam, {
              success: function(result) {
                PFUI.use('pfui/overlay', function(overlay){
                  modifyFlag = false;
                  that.close();
                  PFComponent.showMessage(bxMsg('workSuccess'), 'success',function() {
                    scrollMove();
                    location.hash = 'code=' + result.code + '&firstCatalogId=' + result.firstCatalogId + '&secondCatalogId=' + result.secondCatalogId + '&id=' + treeItem.id + '.'+result.code;
                    location.reload();
                  });
                });
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'PdTemplateService',
                operation: 'createPdTemplate'
              }
            });
          }
        }
      }},
      {text: bxMsg('ButtonBottomString16'), elCls: 'button button-primary', handler : function(){
    	  modifyFlag = false;
    	  this.close()
    	  }
      }
      ],
      listeners: {
          afterSyncUI: function() {
        	  $('.new-product-tpl-popup .product-name-input').focus();
          }
      }
  });
}