/******************************************************************************************************************
 * 팝업
 ******************************************************************************************************************/

function renderFormulaHistoryPopup(data){
  const historyPopupTpl = getTemplate('historyPopupTpl');
  const historyDetailTpl = getTemplate('historyDetailTpl');
  var grdFormulaHistory;

  PFComponent.makePopup({
    title: bxMsg('FormulaHistory'),
    width: 600,
    height: 440,
    contents: historyPopupTpl(),
    modifyFlag : 'readonly',
    buttons: [
      {text:bxMsg('RightPane_Command1'), elCls:'button button-primary', handler:function(){
        this.close();
      }}
      ],
      listeners: {
        afterRenderUI: function() {

          grdFormulaHistory = PFComponent.makeExtJSGrid({
            url: '/interestRateStructure/getListInterestRateStructureMaster.json',
            httpMethod: 'get',
            fields: [
              "tntInstId","pdInfoDscd","intRtStructureCode","intRtStructureName", "applyStartDate","applyEndDate"
              , "fractionApplyWayCode", "fractionApplyCount"
              , "intRtStructureStatusCode", "intRtStructureContent", "conversionContent"
              ],
              //dataRoot: 'list',
              gridConfig: {
                renderTo: '.pf-irs-history-popup .pf-irs-history-grid',
                columns: [

                  {text: bxMsg('intRtStrctrCode'),  width:100, dataIndex: 'intRtStructureCode', style: 'text-align:center'},  // 금리체계코드
                  {text: bxMsg('intRtStrctrName'),  width:100, dataIndex: 'intRtStructureName', style: 'text-align:center'},
                  {text: bxMsg('DPP0127String6'),   width:100, dataIndex: 'applyStartDate', align: 'center'},                     // 적용시작일자
                  {text: bxMsg('DPP0127String7'), width:100, dataIndex:'applyEndDate', align: 'center'},                          // 적용종료일자
                  {text: bxMsg('DPS0101String6'),  width:60, dataIndex: 'intRtStructureStatusCode', style: 'text-align:center',      // 상태
                    renderer: function(value) {
                      return codeMapObj.ProductStatusCode[value] || value;
                    },
                    editor: {
                      xtype: 'combo',
                      typeAhead: true,
                      triggerAction: 'all',
                      displayField: 'name',
                      valueField: 'code',
                      editable: false,
                      store: new Ext.data.Store({
                        fields: ['code', 'name'],
                        data: codeArrayObj['ProductStatusCode']
                      })
                    }
                  },
                  {text: bxMsg('frctnAplyWayCd'),  width:100, dataIndex: 'fractionApplyWayCode', style: 'text-align:center',      // 우수리적용방법코드
                    renderer: function(value) {
                      return codeMapObj.FrctnAplyWayCode[value] || value;
                    },
                    editor: {
                      xtype: 'combo',
                      typeAhead: true,
                      triggerAction: 'all',
                      displayField: 'name',
                      valueField: 'code',
                      editable: false,
                      store: new Ext.data.Store({
                        fields: ['code', 'name'],
                        data: codeArrayObj['FrctnAplyWayCode']
                      })
                    }
                  },
                  {text: bxMsg('frctnAplyCnt'),  width:100, dataIndex: 'fractionApplyCount', style: 'text-align:center'},      // 우수리적용자리수
                  {text: bxMsg('formulaCntnt'),  width:200, dataIndex: 'intRtStructureContent', style: 'text-align:center'},      // 공식
                  {text: bxMsg('conversionFormula'), width:300, dataIndex: 'conversionContent', style: 'text-align:center'}       // 변환공식
                  ],
                  listeners:{
                    scope: this,
                    'celldblclick': function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {

                      $('.pf-irs-history-popup .pf-irs-history-detail').html(historyDetailTpl(record.data));
                      //$('.pf-irs-history-popup select').prop('disabled', true);
                      $('.pf-irs-history-popup input').prop('disabled', true);

                      renderComboBox("ProductStatusCode", $('.pf-irs-history-popup .int-rt-strctr-sts-select'), record.data.intRtStructureStatusCode, true);
                      renderComboBox("FrctnAplyWayCode", $('.pf-irs-history-popup .frctn-aply-way-cd'), record.data.fractionApplyWayCode, true);
                      $('.pf-irs-history-popup .conversion-content').val(record.data.conversionContent);
                    }
                  }
              }
          });

          var requestParam = {
              tntInstId      : data.tntInstId
              , pdInfoDscd     : pdInfoDscd
              , intRtStructureCode    : data.intRtStructureCode
          };

          // 그리드데이터 Load
          var option = {
              'isReset' : true,
              bxmHeader: {
                application: 'PF_Factory',
                service: 'FormulaMasterService',
                operation: 'queryListFormulaMaster'
              }
          };

          grdFormulaHistory.loadData(requestParam, option);
        }
      }
  });
}