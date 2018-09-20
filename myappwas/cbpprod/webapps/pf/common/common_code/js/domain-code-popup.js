/******************************************************************************************************************
 * 도메인코드 관리 팝업
 ******************************************************************************************************************/
var popupModifyFlag = false;
function renderDomainCodeManagePopup(data){

	popupModifyFlag = false;

    const DomainCodeManagementPopupTpl = getTemplate('DomainCodeManagementPopupTpl'); // 도메인코드 관리
    let highDomainPopup;

    var button = [];

    if(!child) {
        // 저장 버튼
        button.push({
            text: bxMsg('ButtonBottomString1'), elCls: 'button button-primary write-btn',
            handler: function () {
                saveDomainCode(data.work, this);
            }
        });
    }

    // 취소 버튼
    button.push({text:bxMsg('ButtonBottomString16'), elCls:'button button-primary',handler:function(){
    	popupModifyFlag = false;
        this.close();
    }});


    // 팝업 호출
    PFComponent.makePopup({
        title: bxMsg('DomainCodeManagement'),           // 도메인코드 관리
        contents: DomainCodeManagementPopupTpl(data),
        width:420,
        height:280,
        buttons: button,
        modifyFlag : 'popup',
        contentsEvent: {
            'click .highDomainCode': function () {

                if(child){
                    return;
                }
                $('.highDomainCode').prop('readonly', true);
                var submitEvent = function(data){
                    $('.highDomainCode').val(data[0].domainCode);
                    popupModifyFlag = true;
                }
                if(!highDomainPopup || highDomainPopup.popup.destroyed){
                    highDomainPopup = renderSearchHighDomainCodePopup(submitEvent,$('.domainCode').val());
                }


            }
        },
        listeners: {
            afterRenderUI: function() {
              var domainCode = $('.domainCode').val();
              if(domainCode !== '' && domainCode !== null){
                 $('.domainCode').prop('disabled', true);
              }

                renderComboBox("ProductBooleanCode", $('.cls-str-active-yn-select'));

                if(data.work == "UPDATE") {
                    $('.cls-str-active-yn-select').val(data.activeYn);
                }
            }
        }
    });
}

//도메인코드 저장
function saveDomainCode(work, that){

    var form = PFComponent.makeYGForm($('.pf-cd-manage-form'));
    var nameLengthCheck = PFValidation.finalLengthCheck('',100,name);
    var mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');

    var requestUrl, bxmHeader;
    if(work == "CREATE"){
        requestUrl = "/commonCode/createCommonCodeMaster.json";
        bxmHeader = {
            application: 'PF_Factory',
            service: 'CommonCodeMasterService',
            operation: 'createCommonCodeMaster'
        };
    }else if(work == "UPDATE"){

    	if(!popupModifyFlag){
    		// 변경된 정보가 없습니다.
    		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
    		return;
    	}

        requestUrl = "/commonCode/updateCommonCodeMaster.json";
        bxmHeader = {
            application: 'PF_Factory',
            service: 'CommonCodeMasterService',
            operation: 'updateCommonCodeMaster'
        };
    }

    var requestData = form.getData();
    requestData.pdInfoDscd = pdInfoDscd;
    requestData.tntInstId = tntInstId;

    if(nameLengthCheck && mandatoryCheck){
        PFRequest.post(requestUrl, requestData, {
            success: function(result){

                PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
                popupModifyFlag = false;

                if(that) {
                    that.close();
                }

                //if(work == 'CREATE') {

                traceTree.traceList = [result];
                traceTree.depth = 0;
                traceTree.completeTrace = false;

                renderDomainCodeNavTree.isRendered = false;
                renderDomainCodeNavTree();

            },
            bxmHeader : bxmHeader
        });
    }
}

// 콤보바인딩함수
function renderComboBox(code, selector){

    var options = [];

    $.each(codeMapObj[code], function (code, name) {
        var $option = $('<option>');

        $option.val(code);
        $option.text(name);

        options.push($option);
    });

    selector.html(options);
}