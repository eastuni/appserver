/******************************************************************************************************************
 * 팝업
 ******************************************************************************************************************/

// 상세팝업
function renderPdRelationConfigDetailPopup(record){
  const preductRelationDetailTpl = getTemplate('preductRelationDetailTpl');
  var fieldGrid;
  var fieldDeleteData = [];

  PFComponent.makePopup({
    title: bxMsg('PdRelationConfigDetail'),
    width: 600,
    height: 350,
    contents: preductRelationDetailTpl(record.data),
    buttons: [
      // 확인버튼
      {text:bxMsg('Z_OK'), elCls:'button button-primary write-btn', handler:function() {
        var fieldList = fieldDeleteData.concat(fieldGrid.getAllData());
        record.set('fieldList', fieldList);

        var updatList =  $.grep(fieldList, function(el, i){
          return  el.process != null && el.process != '';
        });

        if(updatList.length > 0 && (record.data.process == null || record.data.process == '') && record.data.process != 'C'){
          record.set('process', 'U');
        }

        this.close();       // 닫기
      }},
      {text:bxMsg('RightPane_Command1'), elCls:'button button-primary', handler:function(){
        this.close();       // 닫기
      }}
      ],
      contentsEvent: {
        'click .field-add-btn': function(e) {
          fieldGrid.addData({
            field: '',
            fieldNm: '',
            process: 'C'
          });
        }
      },
      listeners: {
        afterSyncUI: function() {

          if(writeYn != 'Y'){
            $('.write-btn').hide();
          }

          renderComboBox("PdInfoDscd", $('.pf-cp-product-relation-detail-popup .pd-info-dscd'),record.data.pdInfoDscd);

          fieldGrid = PFComponent.makeExtJSGrid({
            fields: ['field', 'fieldNm', 'dmnCd', 'dmnCntnt', 'process'],
            gridConfig: {
              renderTo: '.popup-product-relation-detail-grid',
              columns: [
                {text: bxMsg('field'), flex: 1, dataIndex: 'field',
                  renderer: function(value) {
                    return codeMapObj.PdRelField[value] || value;
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
                      data: codeArrayObj['PdRelField']
                    })
                  }
                },
                {text: bxMsg('fieldNm'), flex: 1, dataIndex: 'fieldNm',editor:{}},
                {text: bxMsg('DomainCode'), flex: 1, dataIndex: 'dmnCd',editor:{}},
                {text: bxMsg('DomainName'), flex: 1.5, dataIndex: 'dmnCntnt',editor:{}},
                {
                  xtype: 'actioncolumn', width: 35, align: 'center',
                  items: [{
                    icon: '/images/x-delete-16.png',
                    handler: function (fieldGrid, rowIndex, colIndex, item, e, record) {
                      if(record.data.process != 'C') {
                        record.data.process = 'D';
                        fieldDeleteData.push(record.data);
                      }
                      record.destroy();
                    }
                  }]
                }
                ],
                plugins: [
                  Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                      afteredit: function(e, editor){
                        if(editor.originalValue !=  editor.value && editor.record.get('process') != 'C'){
                          editor.record.set('process', 'U');
                        }
                      }
                    }
                  })
                  ]
          ,
          listeners: {
            scope: this,
            cellclick : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
              if(cellIndex == 2 || cellIndex == 3){
                PFPopup.selectCommonCode({}, function(item){
                  if(item){
                    record.set('dmnCd', item.domainCode);
                    record.set('dmnCntnt', item.domainContent);
                    if(record.data.process != 'C') {
                      record.set('process', 'U');
                    }
                  }
                });
              }
            }
          }
            }
          });

          if(record.data.fieldList){
            fieldGrid.setData(record.data.fieldList);
          }
        }
      }
  });
}