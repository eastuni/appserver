const cndValueType1Tpl = getTemplate('condition/cndValueType1Tpl');

function renderConditionValue1Popup(data, rowIndex, historyButton){
    var yDefineValues, button;

    if (historyButton){
        button = historyButton;
    } else {
        button = [
            {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn', handler:function(){
                var listDataObj = {},
                    selectedCode = $('.cnd-value-type1-popup .cnd-val-type1-grid').find('input[name=default-check]:checked').attr('data-code'),
                    gridData = cndValueType1Grid.getAllData();

                listDataObj.defineValues = gridData;
                cndValComplexGrid.store.getAt(rowIndex).set('y', listDataObj);
                modifyFlag = true;

                this.close();
            }},
            {text:bxMsg('ButtonBottomString16'), elCls:'button button-primary', handler:function(){
                this.close();
            }}
        ]
    }

    if (!data) {
        if (selectedCondition.conditionClassifyCode == '01') {
            yDefineValues = selectedCondition.listConditionValue.defineValues;
        } else {
            yDefineValues = selectedCondition.defineValues;
        }

    } else {
        yDefineValues = data.defineValues;
    }

    PFComponent.makePopup({
        title: bxMsg('DPP0150Title1'),
        width: 500,
        height: 370,
        elCls: 'cnd-value-type1-popup',
        contents: cndValueType1Tpl(),
        buttons: button,
        listeners: {
            afterRenderUI: function() {
                if (historyButton) {
                    renderHistoryCndValueType1Grid(data.defineValues, '.cnd-value-type1-popup .cnd-val-type1-grid');
                } else {
                    renderCndValueType1Grid(yDefineValues, true);
                }
            }
        }
    });
}


function renderConditionValue1PopupForFee(data, rowIndex, conditionCode, grid){
    var cndValueFeeType1Grid;
    var checkboxmodel = Ext.create ('Ext.selection.CheckboxModel', {mode:'MULTI'});

    if(!grid) grid = cnd4feePopupGrid;

    PFComponent.makePopup({
        title: bxMsg('DPP0150Title1'),
        height: 370,
        elCls: 'cnd-value-type-for-fee-popup',
        contents: cndValueType1Tpl(),
        buttons: [
            {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn', handler:function(){
                var gridData = cndValueFeeType1Grid.getSelectedItem();

                gridData.forEach(function(el) {
                    el.listCode = el.key;
                    el.listCodeName = el.value;

                    delete el.key;
                    delete el.isSelected;
                });

                grid.store.getAt(rowIndex).set('productBenefitProvidedListConditionList', gridData);
                if(grid.store.getAt(rowIndex).get('process') != 'C'){
                    grid.store.getAt(rowIndex).set('process' , 'U');
                }

                modifyFlag = true;

                this.close();
            }},
            {text:bxMsg('ButtonBottomString16'), elCls:'button button-primary', handler:function(){
                this.close();
            }}
        ],
        listeners: {
            afterRenderUI: function() {
                cndValueFeeType1Grid = PFComponent.makeExtJSGrid({
                    fields: ['key','value', 'isSelected'],
                    gridConfig: {
                        selModel: checkboxmodel,
                        renderTo: '.cnd-val-type1-grid',
                        columns: [
                            {text: bxMsg('DPS0121_21String2'), flex: 1, dataIndex: 'value', align:'center'}
                        ],
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                clicksToEdit: 1
                            })
                        ],
                        listeners:{
                            scope: this,
                            'viewready' : function(_this, eOpts){
                                if(data){
                                    $.each(cndValueFeeType1Grid.getAllData(), function(index, condition){
                                        $.each(data, function(idx, thisRowCondition){
                                            if(condition.key == thisRowCondition.listCode){
                                                checkboxmodel.select(index, true);
                                            }
                                        });
                                    })
                                }
                            }
                        }
                    }
                });

                if (data) {
                    var tempObj = {};

                    data.forEach(function(el) {
                        tempObj[el.listCode] = el;
                    });
                }

                PFRequest.get('/condition/template/getConditionTemplate.json', {'conditionCode': conditionCode, 'tntInstId': tntInstId}, {
                    success: function(responseData) {
                        if (responseData['values']) {
                            responseData['values'].forEach(function(el) {

                                if (data) {
                                    if (tempObj[el.key]) {
                                        el['isSelected'] = true;
                                    }
                                }
                            });

                            cndValueFeeType1Grid.setData(responseData['values']);

                        }
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CndTemplateService',
                        operation: 'queryCndTemplate'
                    }
                });
            }
        }
    });
}