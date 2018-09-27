const cndValColumnSettingPopupTpl = getTemplate('condition/cndValColumnSettingPopupTpl');

function renderColumnSettingPopup() {
  var conditionPopupGrid, columnSettingPopupGrid,
  measureComboData = codeArrayObj['ProductMeasurementUnitCode'],
  measureComboMap = codeMapObj['ProductMeasurementUnitCode'],
  rangeComboData = codeArrayObj['RangeBlwUnderTypeCode'],
  rangeComboMap = codeMapObj['RangeBlwUnderTypeCode'],
  currencyComboData = codeArrayObj['CurrencyCode'],
  currencyComboMap = codeMapObj['CurrencyCode'];

  PFComponent.makePopup({
    title: bxMsg('columnSetting'),
    width: 840,
    height: 300,
    contents: cndValColumnSettingPopupTpl(),
    buttons:[
      {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn', handler:function(){
        var selectedColumnList = columnSettingPopupGrid.getAllData();
        var newCode;
        selectedColumnList.forEach(function(el, idx){
          el['complexConditionRecordSequence'] = idx+1;

          if (el.conditionTemplateCode) {
            newCode = el.conditionTemplateCode;
          }

          delete el.conditionTemplateCode;
          delete el.conditionTemplateName;
          delete el.type;
        });

        titleDataArr = selectedColumnList;

        // 20150206 OHS - Grid Data Clean
        //var data = (selectedCondition.complexConditionMatrix) ? selectedCondition.complexConditionMatrix : [];
        data = [];

        data.forEach(function(el) {
          $.each(el, function(prop, value) {
            if (prop == 'x') {
              el['x'].push({id: newCode});
            }
          })
        });

        renderComplexGrid(titleDataArr, data);
        modifyFlag = true;
        this.close();
      }},
      {text:bxMsg('ButtonBottomString16'), elCls:'button button-primary', handler:function(){
        this.close();
      }}
      ],
      listeners: {
        afterRenderUI: function() {
          var requestParam = {
              'conditionGroupTemplateCode': selectedCondition.conditionGroupTemplateCode,
              'conditionTemplateCode': selectedCondition.id,
              'tntInstId' : tntInstId
          };

          PFRequest.get('/conditionGroup/template/queryComplexConditionTemplateRelationForList.json', requestParam, {
            success: function(responseData) {

              var resArrLength = responseData.length;

              var clone = responseData.slice(0);

              for (var i = 0; i < resArrLength; i++) {
                if (titleDataObj[clone[i].conditionTemplateCode]) {
                  deleteArrFromObj(clone[i].conditionTemplateCode, responseData);
                }
              }

              conditionPopupGrid = PFComponent.makeExtJSGrid({
                fields: ['conditionTemplateCode', 'conditionTemplateName', 'type', 'defineValues',
                  'titleConditionDetailTypeCode', 'detailType',{
                  name: 'titleConditionCode',
                  convert: function(newValue, record) {
                    return record.get('conditionTemplateCode');

                  }}, {
                    name: 'titleConditionName',
                    convert: function(newValue, record) {
                      return record.get('conditionTemplateName');

                    }}, {
                      name: 'titleConditionTypeCode',
                      convert: function(newValue, record) {
                        return record.get('type');

                      }}],
                      gridConfig: {
                        renderTo: '.condition-value-column-setting-popup .condition-list-grid',
                        viewConfig: {
                          plugins: [
                            Ext.create('Ext.grid.plugin.DragDrop', {
                              ptype: 'gridviewdragdrop',
                              dragGroup: 'firstGridDDGroup',
                              dropGroup: 'secondGridDDGroup'
                            })],
                            listeners: {
                              drop: function(node, data, overModel, dropPosition, eOpts) {
                                columnSettingPopupGrid.grid.getView().refresh();
                              }
                            }
                        },
                        columns: [
                          {text: bxMsg('DTP0203String3'), flex: 0.6, dataIndex: 'titleConditionCode'},
                          {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'titleConditionName'}
                          ]
                      }
              });

              conditionPopupGrid.setData(responseData);

              var columns = [
                {xtype: 'rownumberer', width: 30, sortable: false},
                {text: bxMsg('DTP0203String3'), flex: 0.6, dataIndex: 'titleConditionCode'},
                {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'titleConditionName'},
                {text: bxMsg('measureUnitCode'), flex: 1.3, dataIndex: 'productMeasurementUnit',
                  renderer: function(value, p, record) {
                    if (record.get('detailType')) {
                      record.set('titleConditionDetailTypeCode', record.get('detailType'));
                    }

                    if (record.get('titleConditionTypeCode') === '02' && record.get('titleConditionDetailTypeCode') !== '01')  {

                      var val;
                      if (value) {
                        val = value;
                      } else {
                        if (record.get('titleConditionDetailTypeCode') === '05') {
                          val = '11';
                        } else {
                          val = '14';
                        }

                        record.set('productMeasurementUnit', val)
                      }
                      return measureComboMap[val];
                    }
                  },
                  editor: {
                    xtype: 'combo',
                    typeAhead: true,
                    editable: false,
                    triggerAction: 'all',
                    displayField: 'name',
                    valueField: 'code',
                    store: new Ext.data.Store({
                      fields: ['code', 'name'],
                      data: measureComboData
                    })
                  }},
                  {text: bxMsg('currencyCode'), flex: 1, dataIndex: 'currencyValue',
                    renderer: function(value, p, record) {
                      if(!record.get('titleConditionDetailTypeCode')) {
                        record.set('titleConditionDetailTypeCode', record.get('detailType'));
                      }
                      if (record.get('titleConditionTypeCode') === '02'&& record.get('titleConditionDetailTypeCode') === '01') {
                        var val;

                        if (value) {
                          val = value;
                        } else {
                          val = codeArrayObj['CurrencyCode'][0].code; //조회순서가 제일 높은게 들어감
                          record.set('currencyValue', val)
                        }
                        return currencyComboMap[val];
                      }
                    },
                    editor: {
                      xtype: 'combo',
                      typeAhead: true,
                      editable: false,
                      triggerAction: 'all',
                      displayField: 'name',
                      valueField: 'code',
                      store: new Ext.data.Store({
                        fields: ['code', 'name'],
                        data: currencyComboData
                      })
                    }},
                    {text: bxMsg('rangeCode'), flex: 1.3, dataIndex: 'rangeBlwUnderType',
                      renderer: function(value, p, record) {
                        if (record.get('titleConditionTypeCode') === '02') {
                          var val;

                          if (value) {
                            val = value;
                          } else {
                            val = '14';
                            record.set('rangeBlwUnderType', '01')
                          }

                          return rangeComboMap[val];
                        }
                      },
                      editor: {
                        xtype: 'combo',
                        typeAhead: true,
                        editable: false,
                        triggerAction: 'all',
                        displayField: 'name',
                        valueField: 'code',
                        store: new Ext.data.Store({
                          fields: ['code', 'name'],
                          data: rangeComboData
                        })
                      }}
                    ];

              // 기준조건여부 추가
              var formData = PFComponent.makeYGForm($('.pf-cc-common-condition-panel .condition-table-wrap')).getData();
              if(formData.conditionClassifyCode == '02' &&            // 조건구조=복합조건
                  formData.layerCalcType == '02') {                    // 복합적용방법=다계층사용
                columns.push(
                    {
                      xtype: 'checkcolumn',
                      text: bxMsg('BaseConditionYn'),
                      align: 'center',
                      width: 80,
                      align: 'center',
                      sortable: false,
                      dataIndex: 'baseConditionYn',
                      listeners: {
                        checkchange: function(column, rowIndex, checked, eOpts) {
                          if (checked) {
                            stepCndCd = columnSettingPopupGrid.store.getAt(rowIndex).get('titleConditionCode');
                            columnSettingPopupGrid.store.data.items.forEach(function(el, idx){
                              if(idx != rowIndex){
                                columnSettingPopupGrid.store.getAt(idx).set('baseConditionYn', false);
                              }
                            });
                          } else{
                            stepCndCd = "";
                          }
                        }
                      }
                    }
                );
              }

              columnSettingPopupGrid = PFComponent.makeExtJSGrid({
                fields: ['titleConditionCode', 'rangeBlwUnderType', 'titleConditionName',
                  'productMeasurementUnit', 'titleConditionTypeCode', 'defineValues',
                  'type', 'titleConditionDetailTypeCode', 'currencyValue', 'baseConditionYn'],
                  gridConfig: {
                    renderTo: '.condition-value-column-setting-popup .column-list-grid',
                    viewConfig: {
                      plugins: [
                        Ext.create('Ext.grid.plugin.DragDrop', {
                          ptype: 'gridviewdragdrop',
                          dragGroup: 'secondGridDDGroup',
                          dropGroup: 'firstGridDDGroup'
                        })],
                        listeners: {
                          drop: function(node, data, overModel, dropPosition, eOpts) {
                            columnSettingPopupGrid.grid.getView().refresh();
                          }
                        }
                    },
                    stripeRows: true,
                    columns: columns,
                    plugins: [
                      Ext.create('Ext.grid.plugin.CellEditing', {
                        clicksToEdit: 1,
                        listeners: {
                          beforeedit: function(e, editor){
                            if (editor.record.data.titleConditionTypeCode !== '02') {
                              return false;
                            } else {
                              if(editor.record.data.titleConditionDetailTypeCode === '01' ) {
                                if(editor.field == 'productMeasurementUnit') {
                                  return false;
                                }
                              } else {
                                if(editor.field == 'currencyValue') {
                                  return false;
                                }
                              }
                            }
                          },
                          edit: function(e, editor) {
                            if(editor.record.data.titleConditionDetailTypeCode === '05' ) {
                              if (editor.value !== '11' && editor.value !== '12') {
                                PFComponent.showMessage(bxMsg('RPorRM'), 'warning');
                                editor.record.set('productMeasurementUnit', editor.originalValue);
                              }
                            }
                          }
                        }
                      })
                      ]
                  }
              });

              columnSettingPopupGrid.setData(titleDataArr);
            },
            bxmHeader: {
              application: 'PF_Factory',
              service: 'CndGroupTemplateService',
              operation: 'queryListCndGroupTemplateRelation'
            }
          });
        }
      }
  });

}