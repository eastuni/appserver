
var feeDiscountPopupGrid;
/**
 * 수수료할인 추가 팝업
 */
function makeFeeDiscountSearchPopup(submitEvent){
  const addFeeDiscountPopupTpl = getTemplate('addFeeDiscountPopupTpl'); // 수수료할인조건 팝업

  PFComponent.makePopup({
    title: bxMsg('addFeeDiscount'),  //수수료할인추가
    width: 750,
    height: 430,
    contents: addFeeDiscountPopupTpl(),
    submit: function () {
      var selectedData = feeDiscountPopupGrid.getSelectedItem();
      submitEvent(selectedData);
    },
    contentsEvent: {
      'click .search-btn': function(e) {
        var requestParam = PFComponent.makeYGForm($('.fee-discount-search-form')).getData();

        requestParam.tntInstId  = tntInstId;
        requestParam.feeDiscountStatusCode = '04';

        PFRequest.get('/product_condition/getListProductConditionFeeDiscountByName.json', requestParam, {
          success: function (responseData) {

            if(responseData && responseData.length > 0) {
              responseData.forEach(function (item, index) {
                if (!item.productName || item.productName === '' || item.productName === null) {
                  item.productName = bxMsg('CommonFee');
                }
              });
            }else{
            	responseData = [];
            }
            feeDiscountPopupGrid.setData(responseData);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'PdCndFeeDiscountService',
            operation: 'queryListCndFeeDiscountByName'
          }
        });
      }
    },
    listeners: {
      afterRenderUI: function() {

        var requestParam = {};

        requestParam.tntInstId  = tntInstId;
        requestParam.feeDiscountStatusCode = '04';

        PFRequest.get('/product_condition/getListProductConditionFeeDiscountByName.json', requestParam, {
          success: function (responseData) {

            renderFeeDiscountGrid(responseData);

          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'PdCndFeeDiscountService',
            operation: 'queryListCndFeeDiscountByName'
          }
        });
      }
    }
  });
}

function renderFeeDiscountGrid(data){

    feeDiscountPopupGrid = PFComponent.makeExtJSGrid({
        fields: ['productCode','productName','conditionGroupTemplateName', 'conditionName', 'conditionCode', 'conditionGroupCode', 'conditionGroupTemplateCode', '', 'feeDiscountSequenceNumber', 'feeDiscountName', 'feeDiscountAmount',
            'applyEndDate', 'applyStartDate', 'feeDiscountStatusCode', 'feeRateAmountDistinctionCode', 'complexConditionYn', 'feeDiscountMaxAmount', 'feeDiscountMinAmount', 'feeDiscountRate',
        ],
        gridConfig:{
            selModel:Ext.create ('Ext.selection.CheckboxModel', {mode:'MULTI'}),
            renderTo: '.fee-discount-grid',
            columns:[
                {text: bxMsg('pdNm'), flex: 1, dataIndex: 'productName', align:'left'},
                {text: bxMsg('DTE00002_Title'), flex: 1, dataIndex: 'conditionGroupTemplateName', align:'left'},
                {text: bxMsg('DTP0203String2'), flex: 1, dataIndex: 'conditionName', align:'left'},
                {text: bxMsg('DTP0203String3'), flex: 1, dataIndex: 'conditionCode', align:'center'},
                {text: bxMsg('feeDcSeqNbr'), flex: 1, dataIndex: 'feeDiscountSequenceNumber', align:'center'},
                {text: bxMsg('feeDcNm'), flex: 1, dataIndex: 'feeDiscountName', align:'left'},
                {text: bxMsg('feeDcAmt'), flex: 1, dataIndex: 'feeDiscountAmount', align:'right'}
            ],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ],
        }
    });

    if(data && data.length > 0 ){

        data.forEach(function(item, index){
            if(!item.productName || item.productName === '' || item.productName === null){
                item.productName = bxMsg('CommonFee');
            }
        });

        feeDiscountPopupGrid.setData(data);
    }
}

/******************************************************************************************************************
 * 수수료할인통합한도 관리 팝업
 ******************************************************************************************************************/
function renderFeeDiscountIntegrationBasePopup(data){

    // 팝업 호출
    PFComponent.makePopup({
        title: bxMsg('feeDiscountIntegrationLimitBaseManagement'),           // 통합한도기본관리
        contents: feeDiscountIntegrationBaseManagementPopupTpl(data),
        width:500,
        height:250,
        buttons: [
            // 저장 버튼
            {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn enter-save-btn',handler:function(){
                saveFeeDiscountIntegration(data.work, this);
            }},
            // 취소 버튼
            {text:bxMsg('ButtonBottomString17'), elCls:'button button-primary',handler:function(){
                this.close();
            }}],
        listeners: {
        	afterSyncUI: function() {

                var $name = $('.fee-discount-integration-limit-management-popup .fee-discount-integration-name');
              	var nameLength = $name.val().length;
              	$name.selectRange(nameLength, nameLength);

                renderComboBox("ProductBooleanCode", $('.fee-discount-integration-active-yn-select'));

                if(data.work == "CREATE"){
                    $('.fee-discount-integration-active-yn-select').val('N');
                }
                else if(data.work == "UPDATE") {
                    $('.fee-discount-integration-active-yn-select').val(data.activeYn);
                }
            }
        }
    });
}