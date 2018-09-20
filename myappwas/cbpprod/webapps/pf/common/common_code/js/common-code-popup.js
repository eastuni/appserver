/******************************************************************************************************************
 * 상위도메인코드 검색 팝업
 ******************************************************************************************************************/
function renderSearchHighDomainCodePopup(submitEvent, domainCode) {
    const searchHighDomainCodePopupTpl = getTemplate('searchHighDomainCodePopupTpl'); // 상위도메인코드 검색
    var highDomainCodeGrid;

    // 팝업 호출
    var popup = PFComponent.makePopup({
        title: bxMsg('SearchHighDomainCode'),           // 상위도메인코드 검색
        contents: searchHighDomainCodePopupTpl(),
        width:370,
        height:530,
        modifyFlag : 'readonly',
        buttons: [
            // 확인 버튼
            {text:bxMsg('ButtonBottomString3'), elCls:'button button-primary',handler:function () {
                var selectProduct = highDomainCodeGrid.getSelectedItem();
                submitEvent(selectProduct);
                this.close();
            }},
            // 닫기 버튼
            {text:bxMsg('ButtonBottomString17'), elCls:'button button-primary',handler:function(){
                this.close();
            }}],
        contentsEvent: {
            'click .search-btn': function () {

                var form = PFComponent.makeYGForm($('.high-code-search-form'));
                var requestParam = form.getData();
                requestParam.tntInstId = tntInstId;

                PFRequest.get('/commonCode/getCommonCodeHighCodeMasterList.json', requestParam, {
                    success: function (responseData) {
                        highDomainCodeGrid.setData(responseData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CommonCodeMasterService',
                        operation: 'queryListHighCommonCodeMaster'
                    }
                });
            }
        },
        listeners: {

            afterRenderUI: function() {
                highDomainCodeGrid = renderProductListGrid();
            }
        }
    });

    return popup;
}


/******************************************************************************************************************
 * 상위도메인코드 상세 검색 팝업
 ******************************************************************************************************************/
function renderSearchHighDomainCodeDetailPopup(){
    const searchHighDomainCodeDetailPopupTpl = getTemplate('searchHighDomainCodeDetailPopupTpl'); // 상위도메인코드 상세 검색
    let HighDomainCodeDetailGrid;

    // 팝업 호출
    PFComponent.makePopup({
        title: bxMsg('SearchHighDomainInstanceCode'),           // 상위도메인코드 검색
        contents: searchHighDomainCodeDetailPopupTpl(),
        width:500,
        height:400,
        buttons: [
            // 확인 버튼
            {text:bxMsg('ButtonBottomString3'), elCls:'button button-primary',handler:function () {
                var selectProduct = HighDomainCodeDetailGrid.getSelectedItem();
                for(var i = 0 ; i < selectProduct.length ; i++){
                    selectProduct[i].process = 'C';
                }
                commonCodeDetailGrid.addData(selectProduct);
                modifyFlag = true;
                this.close();
            }}
        ],
        listeners: {
            afterRenderUI: function() {

                var requestData = {};
                requestData.tntInstId = loginTntInstId;
                requestData.domainCode = highDomainCode;
                requestData.inqrySeqSort = true;

                PFRequest.get('/commonCode/getCommonCodeDetailList.json',requestData, {
                    success: function(responseMessage) {

                        HighDomainCodeDetailGrid = highDomainCodeDetailGrid();
                        HighDomainCodeDetailGrid.setData(responseMessage);

                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CommonCodeDetailService',
                        operation: 'queryListCommonCodeDetail'
                    }
                });

            }
        }
    });
}


/******************************************************************************************************************
 * 그리드 관련
 ******************************************************************************************************************/
// grid cell editing plugin
function getGridCellEditiongPlugin(){
    return Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1
    });
}


// 상위도메인코드 검색 팝업 그리드
function renderProductListGrid(){
    var checkboxmodel = Ext.create ('Ext.selection.CheckboxModel', {mode:'SINGLE'});

    var grid = PFComponent.makeExtJSGrid({
        pageAble: true,
        fields: ['domainCode', 'domainContent'],
        gridConfig: {
            selModel: checkboxmodel,
            renderTo: '.product-grid',
            columns: [
                {text: bxMsg('DomainCode'), width: 100, dataIndex: 'domainCode'},
                {text: bxMsg('DomainContent'), flex: 1, dataIndex: 'domainContent'}
            ],
        }
    });
    return grid;
}

/*상위도메인코드 인스턴스 그리드*/
function highDomainCodeDetailGrid(){
    var grid = PFComponent.makeExtJSGrid({
        pageAble: true,
        fields: ['select', 'instanceCode', 'instanceName','instanceContent', 'inquirySequence', 'activeYn', 'lastModifier', 'gmtLastModify'],
        gridConfig: {
            selType: 'checkboxmodel',
            renderTo: '.high-code-detail-grid',
            columns: [
                {text: bxMsg('InstanceCode'), flex: 1, dataIndex: 'instanceCode'},
                {text: bxMsg('InstanceCodeName'), flex: 1, dataIndex: 'instanceName'},
                {text: bxMsg('InstanceCodeContent'), flex: 1, dataIndex: 'instanceContent'}
            ],
            listeners: {
                scope: this,
                itemdblclick : function(tree, record){
                }
            }
        }
    });
    return grid;
}
