function renderIntRtStructureCreatePopup(data) {
  const createIntRtStructurePopupTpl = getTemplate('createIntRtStructurePopupTpl');

  PFComponent.makePopup({
    title: bxMsg('createIntRtStructure'),
    width: 415,
    height: 170,
    contents: createIntRtStructurePopupTpl(data),
    buttons: [
      {text: bxMsg('Z_OK'), elCls: 'button button-primary write-btn enter-save-btn', handler : function(){
        var that = this,
        name = $('.pf-irs-new-popup .intRtStructureName').val();

        name = name.split(' ').join('');

        if(PFValidation.popupMandatoryCheck('.pf-irs-new-popup .intRtStructureName')){
          if(PFValidation.finalLengthCheck('', 50, name) && PFValidation.specialCharacter('.pf-irs-new-popup .intRtStructureName')) {

            var requestParam = PFComponent.makeYGForm($('.pf-irs-new-popup')).getData();
            requestParam.projectId =  $($('.default-layout-task-menu', parent.document).find('.my-task-list')[0]).val();

            PFRequest.post('/interestRateStructure/createInterestRateStructureMaster.json', requestParam, {
              success: function(result) {
            	modifyFlag = false;
                that.close();

                PFComponent.showMessage(bxMsg('workSuccess'), 'success');

                var arrPath = result.fullPath.split('.');
                traceTree.traceList = arrPath;
                traceTree.depth = 0;
                traceTree.completeTrace = false;
                renderIntRtStructureNavTree.isRendered = false;
                renderIntRtStructureNavTree();

                result.bizDscd = arrPath[0];
                renderDetailInfo(result);
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'InterestRateStructureService',
                operation: 'createInterestRateStructureMaster'
              }
            });
          }
        }

      }},
      {text: bxMsg('ButtonBottomString16'), elCls: 'button button-primary', handler : function(){
    	  modifyFlag = false;
    	  this.close() }}
      ],
      listeners:{
        afterSyncUI: function(){
        	PFUtil.getDatePicker(true, $('.pf-irs-new-popup'));

          	var $name = $('.pf-irs-new-popup .intRtStructureName');
        	var nameLength = $name.val().length;
        	$name.selectRange(nameLength, nameLength);
        }
      }
  });

}