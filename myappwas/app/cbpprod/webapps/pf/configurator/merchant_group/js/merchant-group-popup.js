function renderMerchantGroupManagementPopup(data) {
  // 팝업 호출
  PFComponent.makePopup({
    title: bxMsg('merchantGroupManagement'),           // 가맹점 그룹 관리
    contents: merchantGroupManagementPopupTpl(data),
    width: 350,
    height: 200,
    buttons: [
      // 저장 버튼
      {
        text: bxMsg('ButtonBottomString1'),
        elCls: 'button button-primary write-btn enter-save-btn', 
        handler() {
          saveMerchantGroup(data.work, true).then(() => {
            this.close();
          }, () => {});
        },
      },
      // 취소 버튼
      {
        text: bxMsg('ButtonBottomString16'),
        elCls: 'button button-primary',
        handler() {
          this.close();
        }
      }
    ],
    listeners: {
      afterSyncUI() {
        const isUpdate = data && data.work === "UPDATE";

        const $name = $('.merchant-group-management-popup input[data-form-param="merchantGroupName"]');
        const nameLength = $name.val().length;
        $name.selectRange(nameLength, nameLength);
        
        const $dscd = $('.merchant-group-management-popup select[data-form-param="merchantGroupTypeCode"]');
        const $activeYn = $('.merchant-group-management-popup select[data-form-param="activeYn"]');

        PFUtil.renderComboBox("merchantGroupTypeCode", $dscd, isUpdate ? data.merchantGroupTypeCode : '01');
        PFUtil.renderComboBox("ProductBooleanCode", $activeYn, isUpdate ? data.activeYn : 'N');

        if (data && data.work == "UPDATE") {
          $dscd.attr('disabled', true);
        }
      }
    },
  });
}
