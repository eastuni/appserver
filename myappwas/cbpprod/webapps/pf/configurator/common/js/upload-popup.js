const excelUploadPopupTpl = getTemplate('condition/excelUploadPopupTpl');
var $upload; // 엑셀업로드 전역변수

function renderExcelUploadPopup() {
  var url = "";
  if(g_serviceType == g_bxmService){
    url = "/serviceEndpoint/json/request.json";
  }
  else {
    url = "/product/upload.json";
  }
  var bxmHeader = {
      application: 'PF_Factory',
      service: 'PdCndService',
      operation: 'upload'
  };

  bxmHeader.locale = getCookie('lang');
  var commonHeader = {
      loginTntInstId: $('.product-factory-header', parent.document).find('.login-tntInst-id').text(),
      motherTntInstId: getCookie('motherTntInstId'),
      lastModifier : getCookie('loginId')
  };
  var input = {
      conditionGroupTemplateCode : detailRequestParam.conditionGroupTemplateCode,
      conditionGroupCode : detailRequestParam.conditionGroupCode,
      conditionCode : detailRequestParam.conditionCode,
      tntInstId : detailRequestParam.tntInstId,
      conditionType : selectedCondition.conditionTypeCode,
      commonConditionYn : 'Y',
      loginTntInstId: $('.product-factory-header', parent.document).find('.login-tntInst-id').text(),
      commonHeader : commonHeader
  };

  PFComponent.makePopup({
    title: bxMsg('upload'),
    width: 450,
    height: 160,
    contents: excelUploadPopupTpl(),
    elCls: 'excelUploadPopup',
    buttons:[
      {text:bxMsg('upload'), elCls:'button button-primary',handler:function(){
        if($upload.uploader.getContentElement().find('.uploader-error').text() != undefined && $upload.uploader.getContentElement().find('.uploader-error').text() !== ''){
          PFComponent.showMessage('엑셀업로드 에러', 'warning');
          return false;
        }

        var excelFileName = $('.excelUploadPopup').find('.pfui-queue-item-add .default').text();
        excelFileName = excelFileName.toLowerCase();
        if(!excelFileName) return false;

        if(excelFileName == "" || (excelFileName.indexOf(".xls") == -1)) {
          PFComponent.showMessage('.xlsx 파일만 업로드 가능합니다.', 'warning');
          return false;
        }
        else{
          $("#loadingModal").show();
          $upload.uploader.upload();
        }
      }},
      {text:bxMsg('ButtonBottomString16'), elCls:'button button-primary',handler:function(){
        this.close();
      }}
      ],
      listeners: {
        afterRenderUI: function() {
          $upload = this;
          PFUI.use('pfui/uploader',function (Uploader) {
            $upload.uploader = new Uploader.Uploader({
              render: '.excel-file-upload-span',
              name: 'file',
              url: url,
              data: {
                'tntInstId' : tntInstId,
                'conditionGroupTemplateCode' : selectedCondition.conditionGroupTemplateCode,
                'conditionGroupCode' : selectedCondition.conditionGroupCode,
                'conditionCode' : selectedCondition.id,
                'conditionType' : selectedCondition.conditionTypeCode,

                // BXM용 추가헤더정보
                'application': 'PF_Factory',
                'service': 'PdCndService',
                'operation': 'upload',
                'loginTntInstId' : $('.product-factory-header', parent.document).find('.login-tntInst-id').text(),
                'motherTntInstId': getCookie('motherTntInstId'),
                'lastModifier': getCookie('loginId')
              },
              type:'ajax',
              multiple : false,
              autoUpload: false,
              rules: {
                ext: ['.xls','</br>'+bxMsg('warningFileType')],
                maxSize: [1024 * 1024, bxMsg('maximumFileSizeIs10M')],
                min: [1, bxMsg('minimumFileNumber')]
              },
              text: bxMsg('excelFileUpload'),
              elStyle : {width:150},
              listeners : {
                change : function(ev) {
                  if($('.excel-file-upload-span').find('.pfui-queue-item')[0]){

                    if($('.excel-file-upload-span').find('.pfui-queue-item').length > 1) {
                      var item = $('.excel-file-upload-span').find('.pfui-queue-item')[0];
                      $(item).remove();
                    }
                    var item = $('.excel-file-upload-span').find('.pfui-queue-item')[0];
                    $('.excel-file-upload-input').val($(item).find('.default').text());

                    // clear image add ( 'x' )
                    $('.excel-file-upload-input').addClass('x');
                    $('.excel-file-upload-input').css('color', 'black');

                    if($('.excel-file-upload-span').find('.pfui-queue-item').find('.uploader-error').length != 0) {
                      $('.excel-file-upload-input').val($('.excel-file-upload-span').find('.pfui-queue-item').find('.uploader-error').text());
                      $('.excel-file-upload-input').css('color', 'red');
                    }
                  }
                }
              },
              isSuccess: function(result){
                // BXM 인 경우
                if(g_serviceType == g_bxmService){
                  $("#loadingModal").hide();
                  if(result.ModelMap && result.ModelMap.responseMessage
                      && (result.ModelMap.responseMessage.complexConditionTitleInfoList.length == 0 || result.ModelMap.responseMessage.complexConditionMatrix.length == 0)) {
                    PFUI.use('pfui/overlay',function(overlay){
                      //PFUI.Message.Alert(errorMessage, 'error');
                      PFComponent.showMessage(bxMsg('Z_ErrorMessage') + "[엑셀데이터를 확인하세요]", 'error');
                    });
                  }
                  else  if(result.ModelMap && result.ModelMap.responseMessage) {
                    PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                    $upload.close();
                    renderComplexGrid(result.ModelMap.responseMessage.complexConditionTitleInfoList, result.ModelMap.responseMessage.complexConditionMatrix);
                    var $conditionInfoWrap = $el.find('.pf-cc-condition-info');
                    $conditionInfoWrap.find('.TierAplyCalcnWayCodeCode-th').find('.red-notice').text('*');
                    $("#loadingModal").hide();
                  }
                  else {
                    PFUI.use('pfui/overlay',function(overlay){
                      //PFUI.Message.Alert(errorMessage, 'error');
                      PFComponent.showMessage(result.header.messages[0], 'error');
                    });
                  }
                }
                else {
                  if(result.responseError) {
                    $("#loadingModal").hide();
                    var errorMessage = '';
                    result.responseError.forEach(function(error) {
                      // Error Message 정비. 메세지만 출력
                      errorMessage += '<p>'+error.errorMsg+'</p>';
                    });

                    PFUI.use('pfui/overlay',function(overlay){
                      //PFUI.Message.Alert(errorMessage, 'error');
                      PFComponent.showMessage(errorMessage, 'error');
                    });
                  }
                  else if(result.responseMessage) {
                    PFComponent.showMessage(bxMsg('workSuccess'), 'success');
                    $upload.close();
                    renderComplexGrid(result.responseMessage.complexConditionTitleInfoList, result.responseMessage.complexConditionMatrix);
                    var $conditionInfoWrap = $el.find('.pf-cc-condition-info');
                    $conditionInfoWrap.find('.TierAplyCalcnWayCodeCode-th').find('.red-notice').text('*');
                    $("#loadingModal").hide();
                  }
                  else {
                    $("#loadingModal").hide();
                    PFUI.use('pfui/overlay',function(overlay){
                      PFComponent.showMessage(bxMsg('Z_ErrorMessage'), 'error');
                    });
                  }
                }
              }
            });
            $upload.uploader.render();
            $('.pfui-queue').css('display', 'none');
          });
        }
      }
  });
}