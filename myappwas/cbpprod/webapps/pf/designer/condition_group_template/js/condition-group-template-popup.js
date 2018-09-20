const newConditionGroupTplPopupTpl = getTemplate('newConditionGroupTplPopupTpl');
const changeConditionGroupTplNmPopupTpl = getTemplate('changeConditionGroupTplNmPopupTpl');
const copyConditionGroupTplNmPopupTpl = getTemplate('copyConditionGroupTplNmPopupTpl');

function renderConditionGroupTemplateCreatePopup(treeItem) {
  PFComponent.makePopup({
    title: bxMsg('DTE00002_New_Title'),
    width: 350,
    height: 170,
    contents: newConditionGroupTplPopupTpl(),
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary enter-save-btn', handler : function(){
        var that = this,
        changedNm = $('.new-condition-group-tpl-popup .condition-group-name-input').val();

        changedNm = changedNm.split(' ').join('');

        if(PFValidation.popupMandatoryCheck('.new-condition-group-tpl-popup .mandatory')){
          if(PFValidation.popupMandatoryCheck('.new-condition-group-tpl-popup .mandatory') && PFValidation.finalLengthCheck('', 50, changedNm) && PFValidation.specialCharacter('.new-condition-group-tpl-popup .special')) {
            var requestParam = {"name": changedNm};
            requestParam.projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();
            requestParam.type = treeItem.id;
            PFRequest.post('/conditionGroup/template/createConditionGroupTemplateBase.json', requestParam, {
              success: function(result) {
                var parentNode = navTreeStore.findNode(treeItem.id);
                navTreeStore.add(result, parentNode);
                modifyFlag = false;
                that.close();
                PFComponent.showMessage(bxMsg('workSuccess'), 'success',function(){
                  scrollMove();
                  location.hash = 'conditionGroupTemplateCode=' + result.code;
                  location.reload();
                });
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'CndGroupTemplateService',
                operation: 'createCndGroupTemplate'
              }
            });
          }
        }

      }},
      {text: bxMsg('ButtonBottomString16'), elCls: 'button button-primary', handler : function(){ this.close() }}
      ],
      listeners: {
          afterSyncUI: function() {
        	  $('.new-condition-group-tpl-popup .condition-group-name-input').focus();
          }
      }
  });
}

function renderConditionGroupTemplateRenamePopup(treeItem) {
	var name = treeItem.text.substring(treeItem.text.indexOf(']')+1);

	PFComponent.makePopup({
    title: bxMsg('DTE00002_Rename_Title'),
    width: 350,
    height: 170,
    contents: changeConditionGroupTplNmPopupTpl({'name': name}),
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary enter-save-btn', handler : function(){
        var that = this,
        changedNm = $('.change-condition-group-Tpl-name-popup .condition-group-name-input').val();

        changedNm = changedNm.split(' ').join('');

        if(PFValidation.popupMandatoryCheck('.change-condition-group-Tpl-name-popup .condition-group-name-input')){
          if(PFValidation.finalLengthCheck('', 50, changedNm) && PFValidation.specialCharacter('.change-condition-group-Tpl-name-popup .special')) {
            var requestParam = {
                "code": treeItem.id,
                "type": treeItem.type,
                "name": changedNm,
                "isActive": treeItem.isActive
            };
            requestParam.projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();

            PFRequest.post('/conditionGroup/template/updateConditionGroupTemplateBase.json', requestParam, {
              success: function(result) {
                PFUI.use('pfui/overlay', function(overlay){
                  var changedNode = navTreeStore.findNode(treeItem.id);
                  changedNode.text = changedNm;
                  navTreeStore.update(changedNode);
                });
                modifyFlag = false;
                that.close();
                PFComponent.showMessage(bxMsg('workSuccess'), 'success',function(){
                  location.hash = 'conditionGroupTemplateCode=' + requestParam.code;
                  location.reload();
                });
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'CndGroupTemplateService',
                operation: 'updateCndGroupTemplate'
              }
            });
          }
        }

      }},
      {text: bxMsg('ButtonBottomString16'), elCls: 'button button-primary', handler : function(){ this.close() }}
      ],
      listeners: {
          afterSyncUI: function() {
        	  var $name = $('.change-condition-group-Tpl-name-popup .condition-group-name-input');
        	  var nameLength = $name.val().length;
        	  $name.selectRange(nameLength, nameLength);
          }
      }
  });

}


function renderConditionGroupTemplateCopyPopup(treeItem) {
	var name = treeItem.text.substring(treeItem.text.indexOf(']')+1) + '_copy';

  PFComponent.makePopup({
    title: bxMsg('DTE00002_Copy_Title'),
    width: 350,
    height: 170,
    contents: copyConditionGroupTplNmPopupTpl({'name': name}),
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary enter-save-btn', handler : function(){
        var that = this,
        changedNm = $('.copy-condition-group-tpl-popup .condition-group-name-input').val();

        changedNm = changedNm.split(' ').join('');

        if(PFValidation.popupMandatoryCheck('.copy-condition-group-tpl-popup .condition-group-name-input')){
          if(PFValidation.finalLengthCheck('', 50, changedNm) && PFValidation.specialCharacter('.copy-condition-group-tpl-popup .special')) {
            var requestParam = {
                "conditionGroupTemplateCode": treeItem.id,
                "conditionGroupTemplateName": changedNm
            };
            requestParam.projectId = $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();

            PFRequest.post('/conditionGroup/template/copyConditionGroupTemplate.json', requestParam, {
              success: function(result) {
                PFUI.use('pfui/overlay', function(overlay){
                  var parentNode = navTreeStore.findNode(treeItem.path[1]);
                  result.text = changedNm;
                  navTreeStore.add(result, parentNode);
                  modifyFlag = false;
                  that.close();
                  PFComponent.showMessage(bxMsg('workSuccess'), 'success',function(){
                    location.hash = 'conditionGroupTemplateCode=' + result.code;
                    location.reload();
                  });
                });
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'CndGroupTemplateService',
                operation: 'copyCndGroupTemplate'
              }
            });
          }
        }
      }},
      {text: bxMsg('ButtonBottomString16'), elCls: 'button button-primary', handler : function(){ this.close() }}
      ],
      listeners: {
          afterSyncUI: function() {
        	  var $name = $('.copy-condition-group-tpl-popup .condition-group-name-input');
        	  var nameLength = $name.val().length;
        	  $name.selectRange(0, nameLength);
          }
      }
  });

}

