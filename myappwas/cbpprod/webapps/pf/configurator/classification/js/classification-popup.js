
/******************************************************************************************************************
 * 하위 분류체계 관리 팝업
 ******************************************************************************************************************/
function renderClassificationPopup(data){

	var title;

	if(pageType === pageType_Classification){
        title = bxMsg('ClassificationManagement');
    }
    else if(pageType === pageType_ProductGroupPage){
        title = bxMsg('SubProdcuctGroupManagement');
    }
    // OHS 2017.02.23 추가 - 서비스그룹 추가
    else if(pageType === pageType_ServiceGroupPage){
        title = bxMsg('SubServiceGroupManagement');
    }

    // 팝업 호출
    PFComponent.makePopup({
        title: title,           // 하위분류체계 관리
        contents: classificationManagementPopupTpl(data),
        width:500,
        height:200,
        buttons: [
            // 저장 버튼
            {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn enter-save-btn',handler:function(){

                saveClassification(data.work, data, this);

            }},
            // 취소 버튼
            {text:bxMsg('ButtonBottomString17'), elCls:'button button-primary',handler:function(){
                this.close();
            }}],
        listeners: {
        	afterSyncUI: function() {

                renderComboBox("ProductBooleanCode", $('.cls-active-yn-select'));
                PFUtil.getDatePicker(true, $('.classification-management-popup'));
                
                var $name = $('.classification-management-popup .classification-name');
              	var nameLength = $name.val().length;
              	$name.selectRange(nameLength, nameLength);

                // 신규일 때
                if(data.work == "CREATE") {
                    $('.start-date').prop('disabled', false);
                    $('.cls-active-yn-select').val('N');
                }else{
                    $('.cls-active-yn-select').val(data.activeYn);
                }
            }
        }
    });
}


/******************************************************************************************************************
 * 분류체계기본 관리 팝업
 ******************************************************************************************************************/
function renderClassificationStructureBasePopup(data){

    var title, height;

    if(pageType === pageType_Classification){
        title = bxMsg('ClassificationStructureBaseManagement');
        height = 250;
    }
    else if(pageType === pageType_ProductGroupPage){
        title = bxMsg('ProductGroupBaseManagement');
        height = 280;
    }
    // OHS 2017.02.23 추가 - 서비스그룹 추가
    else if(pageType === pageType_ServiceGroupPage){
        title = bxMsg('ServiceGroupBaseManagement');
        height = 280;
    }

    // 팝업 호출
    PFComponent.makePopup({
        title: title,           // 분류체계기본 관리
        contents: classificationStructureBaseManagementPopupTpl(data),
        width:500,
        height:height,
        buttons: [
            // 저장 버튼
            {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn enter-save-btn',handler:function(){
                saveClassificationStructure(data.work, this);
            }},
            // 취소 버튼
            {text:bxMsg('ButtonBottomString17'), elCls:'button button-primary',handler:function(){
                this.close();
            }}],
        listeners: {
            afterSyncUI: function() {

            	// OHS 2017.02.27 수정 - Benefit 영역에서 공통코드 신규 매핑('P0109' BnftGroupTypeCode)
            	if(pageType == pageType_ServiceGroupPage) {
            		renderComboBox("BnftGroupTypeCode", $('.cls-prod-group-type-select'), null, true, false);
            	}
            	else {
            		renderComboBox("ProductGroupTypeCode", $('.cls-prod-group-type-select'), null, true, false);
            	}
                renderComboBox("ProductBooleanCode", $('.cls-str-active-yn-select'));
                PFUtil.getDatePicker(true, $('.classification-structure-base-management-popup'));

                var $name = $('.classification-structure-base-management-popup .classification-structure-name');
              	var nameLength = $name.val().length;
              	$name.selectRange(nameLength, nameLength);

                if(data.work == "CREATE"){
                    $('.cls-str-active-yn-select').val('N');
                    $('.start-date').prop('disabled', false);
                }
                else if(data.work == "UPDATE") {
                    $('.cls-prod-group-type-select').val(data.classificationStructureUsageDistinctionCode);
                    $('.cls-str-active-yn-select').val(data.activeYn);
                }
            }
        }
    });
}