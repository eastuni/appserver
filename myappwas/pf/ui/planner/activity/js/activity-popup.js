/**
 * @fileOverview Activity management popup.
 *     액티비티 정보를 관리/편집할 수 있는 팝업.
 * @author PF Team
 */


/**
 * Edit activity with popup.
 * @param {Object} data
 */
var popupModifyFlag = false;
function editActivity(data) {

  popupModifyFlag = false;

  const activityPopupDetailFormTpl = PFUtil.getTemplate('planner/activity', 'activityPopupDetailFormTpl');
  let buttons = [
      // 저장 버튼
      {
        text: bxMsg('ButtonBottomString1'),
        elCls: 'button button-primary write-btn',
        handler() {
          const form = PFComponent.makeYGForm($('.activity-info-table'));
          const that = this;

          const name = $('.activity-name').val();
          if (!name) {
            PFComponent.showMessage(bxMsg('ActivityNameError'), 'warning'); // 액티비티명은 필수입력사항입니다
            return;
          }

          const requestData = form.getData();
          requestData.registUserName = getLoginUserId(); // 최종변경자명
          requestData.fileId = '';
          requestData.fileName = '';

          const nameLengthCheck = PFValidation.finalLengthCheck('', 100, name);
          const mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');

          if (nameLengthCheck && mandatoryCheck) {

        	  if (data && data.work === 'CREATE') { // 신규 시
	            PFRequest.post('/activity/createActivityMaster.json', requestData, {
	              success(responseMessage) {
	                PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
	                searchActivityData();
	                $('.pf-pa-activity-master-form .activity-id').val(responseMessage.activityId);
	                $('.delete-btn').show();
	                data.work = "UPDATE";
	              },
	              bxmHeader: {
	                application: 'PF_Factory',
	                service: 'ActivityMasterService',
	                operation: 'createActivityMaster',
	              },
	            });
        	  } else if (data && data.work === 'UPDATE') { // 업데이트 시

        		  if(!popupModifyFlag){
        	    		// 변경된 정보가 없습니다.
        	    		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
        	    		return;
        	    	}

        		  PFRequest.post('/activity/updateActivityMaster.json', requestData, {
                      success() {
                        PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
                        searchActivityData();
                      },
                      bxmHeader: {
                        application: 'PF_Factory',
                        service: 'ActivityMasterService',
                        operation: 'updateActivityMaster',
                      },
                    });
        	  }
          }
        },
      }
    ];

  buttons.push(// 삭제 버튼
      {
        text: bxMsg('ButtonBottomString2'),
        elCls: 'button button-primary delete-btn write-btn',
        handler() {
          const form = PFComponent.makeYGForm($('.activity-info-table'));
          const that = this;
          PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), () => {
            PFRequest.post('/activity/deleteActivityMaster.json', form.getData(), {
              success() {
                PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');
                searchActivityData();
                that.close();
              },
              bxmHeader: {
                application: 'PF_Factory',
                service: 'ActivityMasterService',
                operation: 'deleteActivityMaster',
              },
            });
          }, () => {

          });
        },
      },);

  buttons.push(// 닫기 버튼
	  {
	      text: bxMsg('ContextMenu_Close'),
	      elCls: 'button button-primary',
	      handler() {
	        this.close();
	      },
	    }
  );

  // 팝업 호출
  PFComponent.makePopup({
    title: bxMsg('ActivityManagement'), // 액티비티관리
    contents: activityPopupDetailFormTpl(data),
    width: 700,
    height: 250,
    modifyFlag : 'popup',
    buttons,
    listeners: {
      afterSyncUI() {
        // 콤보바인딩
        PFUtil.renderComboBox('ProductBooleanCode', $('.file-need-yn-select'));
        PFUtil.renderComboBox('ProductBooleanCode', $('.content-need-yn-select'));

        // 신규 요청 일 때
        if (data && data.work === 'CREATE') {
        	$('.file-need-yn-select').val('N');
            $('.content-need-yn-select').val('N');
            $('.regist-user-name').val(getLoginUserId()); // 등록사원ID
            $('.delete-btn').hide();
        } else if (data && data.work === 'UPDATE') {
        	$('.file-need-yn-select').val(data.fileNeedYn);
        	$('.content-need-yn-select').val(data.contentNeedYn);
        }
      },
    },
  });
}
