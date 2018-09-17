function renderConditionTemplateRenamePopup(treeItem) {
	var name = treeItem.text.substring(treeItem.text.indexOf(']')+1);

  const changeConditionTplNmPopupTpl = getTemplate('changeConditionTplNmPopupTpl');
  PFComponent.makePopup({
    title: bxMsg('DTE00003_Rename_Title'),
    width: 350,
    height: 170,
    contents: changeConditionTplNmPopupTpl({'name': name}),
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary write-btn enter-save-btn', handler : function(){
        var that = this,
        changedNm = $('.condition-name-change-input').val();

        changedNm = changedNm.split(' ').join('');


        var mandatoryCheck = PFValidation.popupMandatoryCheck('.change-condition-Tpl-name-popup .mandatory');
        var lengthCheck = PFValidation.finalLengthCheck('.condition-name-change-input', 50, changedNm);
        var specialCharacterCheck = PFValidation.specialCharacter('.change-condition-Tpl-name-popup .special');
        var saveFlag = !(mandatoryCheck && lengthCheck && specialCharacterCheck);
        var projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();

        if(saveFlag){return;}

        var requestParam = {
            "firstCatalogId": treeItem.type,
            "secondCatalogId": treeItem.currentCatalogId,
            "code": treeItem.id,
            "name": changedNm,
            "projectId" : projectId
        };

        PFRequest.post('/condition/template/updateConditionTemplateBase.json', requestParam, {
          success: function(result) {
            PFUI.use('pfui/overlay', function(overlay){
              var changedNode = conditionStore.findNode(treeItem.id);
              changedNode.text = changedNm;
              conditionStore.update(changedNode);
              modifyFlag = false;
              that.close();
              PFComponent.showMessage(bxMsg('workSuccess'), 'success',function(){
                location.hash = 'conditionCode=' + requestParam.code;
                location.reload();
              });
            });
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CndTemplateService',
            operation: 'updateCndTemplate'
          }
        });
      }},
      {text: bxMsg('ButtonBottomString16'), elCls: 'button button-primary', handler : function(){ this.close() }}
      ],
      listeners: {
          afterSyncUI: function() {
        	  var $name = $('.change-condition-Tpl-name-popup .condition-name-change-input');
        	  var nameLength = $name.val().length;
        	  $name.selectRange(nameLength, nameLength);
          }
      }
  });
}

function renderConditionTemplateCreatePopup(treeItem) {
  const newConditionTplPopupTpl = getTemplate('newConditionTplPopupTpl');
  PFComponent.makePopup({
    title: bxMsg('DPP160_New_Title'),
    width: 400,
    height: 200,
    contents: newConditionTplPopupTpl(),
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary write-btn enter-save-btn', handler : function(){

        var that = this,
        name = $('.condition-name-input').val().split(' ').join('');
        var mandatoryCheck = PFValidation.popupMandatoryCheck('.new-condition-tpl-form .mandatory');
        var lengthCheck = PFValidation.finalLengthCheck('.condition-name-input', 50, name);
        var specialCharacter = PFValidation.specialCharacter('.new-condition-tpl-form .special');

        var saveFlag = !( mandatoryCheck && lengthCheck && specialCharacter );
        if(saveFlag) return;

        var form = PFComponent.makeYGForm($('.new-condition-tpl-form'));
        var requestParam = form.getData();

        var reg = /^[0-9]{4}$/;
        if(!(reg.test(form.getData().code)) && !(form.getData().code=='' || form.getData().code==null)){
          PFComponent.showMessage(bxMsg('DPP160_Error2'), 'warning');
          return;
        }

        requestParam.projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
        requestParam.type = treeItem.id.substr(0,treeItem.id.indexOf('.'));
        requestParam.isActive = '02';
        requestParam.currentCatalogId = treeItem.id.substr(treeItem.id.indexOf('.')+1,treeItem.id.length);
        requestParam.name = name;

        PFRequest.post('/condition/template/createConditionTemplateBase.json', requestParam, {
          success: function(responseData){
            var parentNode = conditionStore.findNode(treeItem.id);
            conditionStore.add(responseData, parentNode);
            modifyFlag = false;
            that.close();
            PFComponent.showMessage(bxMsg('workSuccess'), 'success',function(){
              scrollMove();
              location.hash = 'conditionCode=' + responseData.code;
              location.reload();
            });

            // ribbon
            //$($('.default-layout-task-menu', parent.document).find('.my-task-list')[1]).prop('disabled',true);
            $($('.default-layout-task-menu', parent.document).find('.save-tab-project-id')[1]).val(requestParam.projectId);

          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CndTemplateService',
            operation: 'createCndTemplate'
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
        	  $('.new-condition-tpl-popup .condition-name-input').focus();
          }
      }
  });

}