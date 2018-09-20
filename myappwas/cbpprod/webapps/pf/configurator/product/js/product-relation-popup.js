const createProductAdditionInfoPopupTpl = getTemplate('main/createProductAdditionInfoPopupTpl');

function renderProductAdditionalInfoPopup(record, td) {

  var buttons = [];

  if(record.data.relationInformationStatus === '01'){
	  buttons.push({text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn',handler:function(){
	        var form = PFComponent.makeYGForm($('.product-addition-info-form'));
	        var formData = form.getData();
	        record.data.additionalInformationContent = formData.additionalInformationContent;
	        record.data.additionalInformationType = formData.additionalInformationType;
	        $(td).find('div').text(formData.additionalInformationContent);

	        this.close();
	      }});
  }

  buttons.push({text:bxMsg('ButtonBottomString17'), elCls:'button button-primary',handler:function(){
      this.close();
  }});

  PFComponent.makePopup({
    title: bxMsg('DPP0116Title'),
    contents: createProductAdditionInfoPopupTpl(record.data),
    width:550,
    height:280,
    buttons:buttons,
      listeners: {
        afterSyncUI: function() {

          // 부가정보 부모그리드에 부가정보유형의 값이 있을때만 세팅시켜줌
          if(record.data.additionalInformationType) {
        	  renderComboBox('ProductAdditionalInfoTypeCode', $('.product-addition-info-form .addi-info-combo'), record.data.additionalInformationType);
          }
          else {
        	  renderComboBox('ProductAdditionalInfoTypeCode', $('.product-addition-info-form .addi-info-combo'), '');
          }

          if(record.data.relationInformationStatus !== '01'){
        	  $('.product-addition-info-form .additionalInformationContent').prop('disabled', true);
          }
        }
      }
  });
}

function renderProductPassbookInfoPopup(record, td) {
  var content = '<textarea class="relBankbook-popup-bankbook-text" style="width:445px;height:110px;">'
    + record.data.passbookInformationContent +'</textarea>';

  PFComponent.makePopup({
    title: bxMsg('wordsContent'),
    contents: content,
    width: 500,
    height: 200,
    submit: function () {
      $(td).find('div').text($('.relBankbook-popup-bankbook-text').val());
      record.data.passbookInformationContent = $('.relBankbook-popup-bankbook-text').val();
    }

  })
}