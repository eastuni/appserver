const productHistoryPopupTpl = getTemplate('main/productHistoryPopupTpl');

function renderProductHistoryPopup(data) {
  var title;

  if(pdInfoDscd === pdInfoDscd_Product){
    title = bxMsg('DPP0129Title'); //상품기본 이력조회
  }else if(pdInfoDscd === pdInfoDscd_Service){
    title = bxMsg('ServiceBaseHistorySearch'); //서비스기본 이력조회
  }else if(pdInfoDscd === pdInfoDscd_Point){
    title = bxMsg('PointBaseHistorySearch'); //포인트기본 이력조회
  }

  PFComponent.makePopup({
    title: title,
    contents: productHistoryPopupTpl(data.getData()),
    modifyFlag : 'readonly',
    width: 800,
    height:470,
    buttons:[
      {text:bxMsg('ContextMenu_Close'), elCls:'button button-primary', handler:function(){
        this.close();
      }}
      ],
      listeners: {
        afterRenderUI: function() {
          $('.pf-cp-base-history-popup').find('.firstCatalogId').val($('.product-base-info-firstCatalogId').text());
          $('.pf-cp-base-history-popup').find('.secondCatalogId').val($('.product-base-info-secondCatalogId').text());
          $('.pf-cp-base-history-popup').find('.productTemplateCode').val($('.product-base-info-pf-tpl-cd').text());
          $('.pf-cp-base-history-popup').find('.status').val($('.product-base-info-mgmt-status').text());
          renderProductBaseHistoyGrid(data.getData().code);
        }
      }
  });

  function renderProductBaseHistoyGrid(code) {
    PFRequest.get('/product/getProductHistoryForList.json',{'code' : code, 'pdInfoDscd' : pdInfoDscd, 'tntInstId': tntInstId},{
      success: function(responsData){
        $.each(responsData,function(index, value){
          value.isCompositeProduct = codeMapObj.ProductBooleanCode[value.isCompositeProduct];
        });

        var columns = [];
        columns.push(
            {text: bxMsg('DAS0101String8'), width: 130, dataIndex: 'gmtLastModify'},
            {text: bxMsg('DPM10002Sring7'), width: 150, dataIndex: 'name'},
            {text: bxMsg('DPS0101String7'), width: 130, dataIndex: 'saleStart'},
            {text: bxMsg('DPS0101String8'), width: 130, dataIndex: 'saleEnd'},
            {text: bxMsg('DPS0101String9'), width: 110, dataIndex: 'isCompositeProduct'}
        );

        if(pdInfoDscd === pdInfoDscd_Service){
          columns.push(
              {text: bxMsg('alncCntrctNbr'), width: 130, dataIndex: 'allianceContractNumber'},
              {text: bxMsg('bnftBaseDscd'), width: 130, dataIndex: 'benefitBaseDscd',
                renderer: function(value) {
                  return codeMapObj['BenefitBaseDscd'][value] || value;
                }
              },
              {text: bxMsg('prcsngPotDscd'), width: 130, dataIndex: 'processingPointOfTimeDscd',
                renderer: function(value) {
                  return codeMapObj['BnftPrcsngPotCode'][value] || value;
                }
              },
              {text: bxMsg('dmfrSalesDscd'), width: 130, dataIndex: 'domesticAndForeignSalesDscd',
                renderer: function(value) {
                  return codeMapObj['DomesticForeignSalesDscd'][value] || value;
                }
              },
              {text: bxMsg('cmpgnId'), width: 130, dataIndex: 'campaignId'},
              {text: bxMsg('prvsnCndExistYn'), width: 130, dataIndex: 'provideConditionExistYn'}
          );
        }

        columns.push(
            {text: bxMsg('DPP0127String9'), width: 117, dataIndex: 'lastModifierName'}
        );

        var grid = PFComponent.makeExtJSGrid({
          httpMethod: 'get',
          pageAble: true,
          fields: [
            'saleStart','saleEnd','isCompositeProduct','name',
            'industryDistinctionCode','secondCatalogId','tntInstId','productTemplateCode',
            'firstCatalogId','code','lastModifier','gmtLastModify','lastModifierName',
            'allianceContractNumber','benefitBaseDscd','campaignId','domesticAndForeignSalesDscd','processingPointOfTimeDscd','provideConditionExistYn',
            {name:'productStatusName',
              convert: function(newValue, record){
                return codeMapObj.ProductStatusCode[record.get('productStatus')];
              }}
            ],
            gridConfig: {
              renderTo: '.pf-cp-base-history-grid',
              columns: columns,
              listeners: {
                scope: this,
                itemdblclick : function(tree, record){
                }
              }
            }

        });
        grid.setData(responsData);
      },
      bxmHeader: {
        application: 'PF_Factory',
        service: 'PdService',
        operation: 'queryListPdHistory'
      }
    });
  }

}