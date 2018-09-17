/**
 *
 */
const systemEnvironmentInfoPopupTpl = getTemplate('SystemEnvironmentInfoPopupTpl');

function renderSystemEnvironmentInfoPopup(data, index){

	PFComponent.makePopup({
        title: bxMsg('systemEnvironmentInfo'),           // 운영환경정보
        contents: systemEnvironmentInfoPopupTpl(data ? data : {}),
        width:450,
        height:200,
        buttons: [
        	// 테스트 버튼
            {text:bxMsg('test'), elCls:'button button-primary',handler:function () {
            	if(PFValidation.mandatoryCheck('.mandatory')){
            		// Set input
            		var requestParam = {};
            		requestParam.ip = PFComponent.makeYGForm($('.pf-ptc-environment-info-form')).getData().interfcId;
            		requestParam.timeoutMilSec = 5000;
            		
            		// 배포 대상 환경 접속 테스트 호출
	                PFRequest.get('/publish/testPublishSystem.json',requestParam,{
	                    success: function(responseData){
	                    	if (responseData) {
	                    		PFComponent.showMessage(bxMsg('connectServerSuccess'), 'success');
	                    	} else {
	                    		PFComponent.showMessage(bxMsg('connectServerFail'), 'warning');
	                    	}
	                    },
	                    bxmHeader: {
	                        application: 'PF_Factory',
	                        service: 'PublishSystemService',
	                        operation: 'testPublishSystem'
	                    }
	                });
                }
            }},
            // 확인 버튼
            {text:bxMsg('ButtonBottomString3'), elCls:'button button-primary',handler:function () {

            	var newData = PFComponent.makeYGForm($('.pf-ptc-environment-info-form')).getData();

            	// 수정인 경우
            	if(data){
            		enviromentGrid.store.getAt(index).set('envrnmntDscd',newData.envrnmntDscd);
            		enviromentGrid.store.getAt(index).set('interfcId',newData.interfcId);
            		enviromentGrid.store.getAt(index).set('constrntChkInterfcId',newData.constrntChkInterfcId);
            		enviromentGrid.store.getAt(index).set('dbmsDscd', newData.dbmsDscd);
            	}
            	// 신규인 경우
            	else{
                    enviromentGrid.addData(newData);
            	}
            	this.close();

            }},
            // 닫기 버튼
            {text:bxMsg('ButtonBottomString17'), elCls:'button button-primary',handler:function(){

                this.close();
            }}],

        listeners: {

            afterRenderUI: function() {
            	renderComboBox("SystemEnvironmentDistinctionCode", $('.envrnmnt-dscd-select'), data ? data.envrnmntDscd : '03');
            	renderComboBox("SystemDbmsDscd", $('.dbms-dscd-select'), data ? data.dbmsDscd : '01' );
            }
        }
	});
}