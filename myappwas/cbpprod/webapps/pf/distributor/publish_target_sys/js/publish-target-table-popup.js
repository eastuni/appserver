const publishTargetTablePopupTpl = getTemplate('publishTargetTablePopupTpl');

function renderPublishTargetTablePopup(){
    // 팝업 호출
    PFComponent.makePopup({
        title: bxMsg('PAS0501String7'),           // 배포대상테이블
        contents: publishTargetTablePopupTpl(),
        width:450,
        height:500,
        buttons: [
            // 확인 버튼
            {text:bxMsg('ButtonBottomString3'), elCls:'button button-primary',handler:function () {
                var selectTables = publishTargetGrid.getSelectedItem();
                var today =  commonConfig.currentXDate.toString('yyyy-MM-dd');
                var applyEnd = '9999-12-31 23:59:59';
                modifyFlag = true;
                selectTables.forEach(function(item, index){
                    item.applyStart = today + ' ' + '00:00:00';
                    item.applyEnd = applyEnd
                });
                publishTargetTableGrid.addData(selectTables);
                this.close();
            }},
            // 닫기 버튼
            {text:bxMsg('ButtonBottomString17'), elCls:'button button-primary',handler:function(){

                this.close();
            }}],

        listeners: {

            afterRenderUI: function() {

            	publishTargetGrid = renderPublishTargetGrid();

            	var requsetParam = {
            			objectId : 'TableList'
            	};
            	PFRequest.get('/eav/getEAVObjectValueDetailInfoList.json', requsetParam, {
                    success: function (responseData) {

                    	// ,
                    	var voList = responseData.voList ?  responseData.voList : responseData;
                    	tables = [];
                    	voList.forEach(function(el){
                    		if(el.atrbtId !== "tableName"){
                    			return;
                    		}
                    		tables.push({
            					tableName: el.atrbtVal
            				  , logicalTableName:bxMsg(el.atrbtVal)
            				});
                    	});
                		publishTargetGrid.setData(tables);
                    },
            		bxmHeader: {
            			application: 'PF_Factory',
            			service: 'EAVService',
            			operation: 'getEAVScreenConfigInfoList'
            		}
            	});
            }
        }
    });
}

function renderPublishTargetGrid(){

    var grid = PFComponent.makeExtJSGrid({
        pageAble: true,
        fields: ['select','logicalTableName', 'tableName'],
        gridConfig: {
        	selType: 'checkboxmodel',
            renderTo: '.publish-target-table-grid',
            columns: [
                {text: bxMsg('logicalName'), flex: 1, dataIndex: 'logicalTableName'},
                {text: bxMsg('physicalName'), flex: 1, dataIndex: 'tableName'}
            ]
        }
    });
    return grid;
}
