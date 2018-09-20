const copyProductNmPopupTpl = getTemplate('main/copyProductNmPopupTpl');
const changeProductNmPopupTpl = getTemplate('main/changeProductNmPopupTpl');
const createProductPopupTpl = getTemplate('main/createProductPopupTpl');

function renderProductCopyPopup(treeItem, title) {
  var makePopup = PFComponent.makePopup({
    title: title,
    width: 400,
    height: 180,
    elCls: 'product-context-menu-copy',
    contents: copyProductNmPopupTpl({'name': treeItem.text + '_copy'}),
    useCurrentTaskIdConfirmYn: true,
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary write-btn enter-save-btn', handler : function(){
        if(!isHaveProject()){
          haveNotTask();
          return;
        }

        var that = this,
        changedNm = $($.find('.copy-product-tpl-popup')).find('.product-name-input').val().split(' ').join('');

        // OHS 2017.03.22 - 상품명 '%' 허용
        if(!PFValidation.finalLengthCheck('', 100, changedNm) || !PFValidation.popupMandatoryCheck('.copy-product-tpl-popup .mandatory') || !productSpecialCharacter('.copy-product-tpl-popup .special')) {
          return;
        }

        var mandatoryCheck = PFValidation.popupMandatoryCheck('.copy-product-tpl-popup .mandatory');

        if(mandatoryCheck){
          // OHS 2017.03.22 - 상품명 '%' 허용
          if(PFValidation.finalLengthCheck('', 100, changedNm) && productSpecialCharacter('.copy-product-tpl-popup .special')) {
            var form = PFComponent.makeYGForm($('.copy-product-tpl-popup.context-popup').find('.copy-product-tpl-form'));

            var requestParam = {};
            requestParam.projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
            requestParam.code = treeItem.id;
            requestParam.newCode = form.getData().newCode;
            requestParam.name = form.getData().name.split(' ').join('');
            requestParam.pdInfoDscd = pdInfoDscd;
            // requestParam.tntInstId = getLoginTntInstId() 모기관의 상품을 copy 하더라고 login한 기관코드로 저장되어야 함. treeitem의 기관코드가 아님.
            requestParam.tntInstId = treeItem.tntInstId;   // 2016.09.28 모기관의 상품을 copy할 경우 login한 기관의 상품이 copy됨.

            PFRequest.post('/product/copyProduct.json',requestParam, {
              beforeSend: function() {
                $('#loading-dim').show();
                $('.product-context-menu-copy').addClass('popup-loading-dim');
              },
              success: function (result) {
                var treeId = treeItem.fullPath.split('.'),
                parentNodeId = '',
                firstIdx = true;

                treeId.forEach(function(el, idx) {
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
                  location.hash = 'code=' + result.code + '&path='+parentNodeId + '&tntInstId=' + result.tntInstId;
                  location.reload();
                });
              },
              complete: function() {
                $('#loading-dim').hide();
                $('.product-context-menu-copy').removeClass('popup-loading-dim');
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'PdService',
                operation: 'copyPd'
              }
            });
          };
        }// mandatory check end

      }},
      {text: bxMsg('ButtonBottomString16'), elCls: 'button button-primary', handler : function(){ this.close() }}
      ],
      contentsEvent: {
        'keydown .code-number': function(e) {
          PFValidation.numberCheck(e);
        }
      },
      listeners: {
          afterSyncUI: function() {
        	  var $name = $('.copy-product-tpl-popup .product-name-input');
        	  var nameLength = $name.val().length;
        	  $name.selectRange(0, nameLength);
          }
      }
  });
}


function renderProductRenamePopup(treeItem, title) {
  var makePopup = PFComponent.makePopup({
    title: title,
    width: 350,
    height: 170,
    contents: changeProductNmPopupTpl({'name': treeItem.text}),
    useCurrentTaskIdConfirmYn : true,
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary write-btn enter-save-btn', handler : function(){
        if(!isHaveProject()){
          haveNotTask();
          return;
        }

        var that = this,
        changedNm = $('.change-product-Tpl-name-popup .product-name-input').val().split(' ').join('');

        // OHS 2017.03.22 - 상푸명 '%' 허용
        if(!PFValidation.finalLengthCheck('', 100, changedNm) || !PFValidation.popupMandatoryCheck('.change-product-Tpl-name-popup .mandatory') || !productSpecialCharacter('.change-product-Tpl-name-popup .special')) {
          return;
        }

        var requestParam = {"code": treeItem.id,"name": changedNm};
        requestParam.projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
        requestParam.pdInfoDscd = pdInfoDscd;
        requestParam.tntInstId = tntInstId;

        PFRequest.post('/product/updateProductBaseName.json', requestParam, {
          success: function(result) {
            that.close();
            PFUI.use('pfui/overlay', function(overlay){
              PFComponent.showMessage(bxMsg('workSuccess'), 'success',function(){
            	  modifyFlag = false;
                location.hash = 'code=' + requestParam.code + '&path='+treeItem.fullPath+'&tntInstId='+treeItem.tntInstId;
                location.reload();
              });
            });
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'PdService',
            operation: 'updatePdName'
          }
        });

      }},
      {text: bxMsg('ButtonBottomString16'), elCls: 'button button-primary', handler : function(){ this.close() }}
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


function renderProductCreatePopup(treeItem, title) {
  var makePopup = PFComponent.makePopup({
    title,
    contents: createProductPopupTpl(),
    width: 400,
    height: 180,
    useCurrentTaskIdConfirmYn: true,
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary write-btn enter-save-btn', handler : function(){
        if(!isHaveProject()){
          haveNotTask();
          return;
        }

        var that = this,
        $form = $('.new-product-form-table'),
        splitId = treeItem.id.split('.');


        var name =  $form.find('[data-form-param="name"]').val().split(' ').join('');
        var code = $form.find('[data-form-param="code"]').val();

        // OHS 2017.03.22 - 상품명 '%'허용
        if (!productSpecialCharacter('.create-product-tpl-popup .special') ||!PFValidation.finalLengthCheck('', 100,name)
            || !PFValidation.popupMandatoryCheck('.create-product-tpl-popup .mandatory')) {
          return;
        }

        var requestParam = {
            firstCatalogId: treeItem.firstCatalogId,
            secondCatalogId: treeItem.secondCatalogId,
            productTemplateCode: treeItem.code,
            name: name,
            code: $form.find('[data-form-param="code"]').val()
        };
        requestParam.projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
        requestParam.pdInfoDscd = pdInfoDscd;
        requestParam.tntInstId = tntInstId;



        PFRequest.post('/product/createProductBase.json', requestParam, {
          success: function(result) {
            var parentNode = productStore.findNode(treeItem.id);
            result.productTemplateCode = parentNode.code;
            productStore.add(result, parentNode);

            that.close();
            PFComponent.showMessage(bxMsg('workSuccess'), 'success',function(){
              scrollMove();
              location.hash = 'code=' + result.code + '&path=' + result.fullPath + '&tntInstId=' + result.tntInstId;
              renderProductInfo(PFUtil.getHash());
              modifyFlag = false;
              location.reload();
            });

          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'PdService',
            operation: 'createPd'
          }
        });

      }},
      {text: bxMsg('ButtonBottomString16'), elCls: 'button button-primary', handler : function(){ this.close() }}
      ],
      contentsEvent: {
        'keydown .code-number': function(e) {
          PFValidation.numberCheck(e);
        }
      },
      listeners: {
          afterSyncUI: function() {
        	  $('.create-product-tpl-popup .product-name-input').focus();
          }
      }
  });
}