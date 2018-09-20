/**
 * 분류체계기본 관리 팝업
 */
function renderContentGroupBasePopup(data) {
  const title = bxMsg('contentsGroupBaseMgmt');
  const height = 250;

  // 팝업 호출
  PFComponent.makePopup({
    title, // 분류체계기본 관리
    contents: classificationStructureBaseManagementPopupTpl(data),
    width: 500,
    height,
    buttons: [
      // 저장 버튼
      {
        text: bxMsg('ButtonBottomString1'),
        elCls: 'button button-primary write-btn',
        handler() {
          saveContentGroup(data.work, this);
          modifyFlag = false;
        },
      },
      // 취소 버튼
      {
        text: bxMsg('ButtonBottomString17'),
        elCls: 'button button-primary',
        handler() {
        	modifyFlag = false;
            this.close();
        },
      }],
    listeners: {
      afterSyncUI() {
        PFUtil.renderComboBox('ProductGroupTypeCode', $('.cls-prod-group-type-select'), null, true, false);
        PFUtil.renderComboBox('ProductBooleanCode', $('.cls-str-active-yn-select'));
        PFUtil.getDatePicker(true, $('.classification-structure-base-management-popup'));

        if (data.work === 'CREATE') {
          $('.cls-str-active-yn-select').val('N');
          $('.start-date').prop('disabled', false);
        } else if (data.work === 'UPDATE') {
          $('.cls-prod-group-type-select').val(data.classificationStructureUsageDistinctionCode);
          $('.cls-str-active-yn-select').val(data.activeYn);
        }
      },
    },
  });
}


/**
 * 하위 분류체계 관리 팝업
 */
function renderClassificationPopup(data) {
  // 팝업 호출
  PFComponent.makePopup({
    title: bxMsg('SubGroupMngmt'), // 하위그룹 관리
    contents: classificationManagementPopupTpl(data),
    width: 500,
    height: 200,
    buttons: [
      // 저장 버튼
      {
        text: bxMsg('ButtonBottomString1'),
        elCls: 'button button-primary write-btn',
        handler() {
          saveClassification(data.work, data, this);
          modifyFlag = false;
        },
      },
      // 취소 버튼
      {
        text: bxMsg('ButtonBottomString17'),
        elCls: 'button button-primary',
        handler() {
        	modifyFlag = false;
            this.close();
        },
      }],
    listeners: {
      afterRenderUI() {
        PFUtil.renderComboBox('ProductBooleanCode', $('.cls-active-yn-select'));
        PFUtil.getDatePicker(true, $('.classification-management-popup'));

        // 신규일 때
        if (data.work === 'CREATE') {
          $('.start-date').prop('disabled', false);
          $('.cls-active-yn-select').val('N');
        } else {
          $('.cls-active-yn-select').val(data.activeYn);
        }
      },
    },
  });
}
