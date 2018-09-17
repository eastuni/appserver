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


                var record = cndValComplexGrid.store.getAt(rowIndex);

                if(record.data.conditionStatusCode == '01' && (record.data.process == null || record.data.process.length == 0)){
                	var originalData = $.extend(true, {}, record.data);
                    originalData['process'] = 'D';
                    complexGridDeleteData.push(originalData);
                }

                record.set('process', 'C');
                record.set('y', listDataObj);


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


function renderHistoryCndValueType1Grid(data, historyPopupRenderTo) {

    var historyCndValueType1Grid = PFComponent.makeExtJSGrid({
        fields: ['code', 'isDefaultValue', 'isSelected', 'name'],
        gridConfig: {
            renderTo: historyPopupRenderTo,
            columns: [
                {xtype: 'checkcolumn', align:'center', text: bxMsg('PAS0301String4'), width: 120, dataIndex: 'isSelected', disabled:true},
                {text: bxMsg('DPS0121_21String1'), flex: 1, dataIndex: 'code', align:'center'},
                {text: bxMsg('DPS0121_21String2'), flex: 1, dataIndex: 'name', align:'center'},
                {text: bxMsg('defaultValue'), dataIndex: 'isDefaultValue',
                    renderer: function(value, p, record, idx) {
                        var checked = '';

                        if (record.get('isDefaultValue')) {
                            checked = 'checked';
                        }

                        return Ext.String.format(
                            '<input type="checkbox" name="default-check" class="grid-default-check-disabled" data-code="{0}" data-idx="{1}"' +checked+ ' disabled>',
                            record.get('code'),
                            idx
                        );

                    },
                    align: 'center', width: 120}
            ]
        }
    });

    historyCndValueType1Grid.setData(data);
}

//
function renderCndValueType1Grid(data, popup) {
    var renderTo,
        firstRender = true;

    if (popup) {
        renderTo = '.cnd-value-type1-popup .cnd-val-type1-grid';
    } else {
        renderTo = '.cnd-val-type1-grid';
    }

    cndValueType1Grid = PFComponent.makeExtJSGrid({
        fields: ['code', 'isDefaultValue', 'isSelected', 'name'],
        gridConfig: {
            renderTo: renderTo,
            columns: [
                {xtype: 'checkcolumn', text: bxMsg('PAS0301String4'), width: 120, dataIndex: 'isSelected', align:'center', // 기본값여부
                    listeners: {
                        checkchange: function(column, rowIndex, checked, eOpts) {
                            $(renderTo).find('.type1-grid-default-check').each(function(idx) {
                                var that = this;

                                // If ConditionAgreeLevel By Product Then DefaultCheck Disabled
                                if (selectedCondition.conditionAgreeLevel == '02') {
                                    if (checked && $(that).attr('data-idx') == rowIndex) {
                                        $(that).prop('disabled', false);
                                    } else if (!checked && $(that).attr('data-idx') == rowIndex) {
                                        $(that).prop('disabled', true).prop('checked', false);
                                    }
                                } else {
                                    $(that).prop('disabled', true).prop('checked', false);
                                }
                            });
                            modifyFlag = true;
                        }
                    }},
                {text: bxMsg('DPS0121_21String1'), flex: 1, dataIndex: 'code', align:'center'},
                {text: bxMsg('DPS0121_21String2'), flex: 1, dataIndex: 'name', align:'center'},
                {xtype: 'checkcolumn', text: bxMsg('defaultValue'), dataIndex: 'isDefaultValue',  sortable: false,
                    renderer: function(value, metadata, record, rowIndex) {
                        if (!record.get('isSelected') || selectedCondition.conditionAgreeLevel == '01') {
                            //record.set('defaultValue', true);
                            cndValueType1Grid.store.getAt(rowIndex).set('isDefaultValue', false);
                            return "<input type='checkbox' disabled>";
                        } else {
                            return (new Ext.ux.CheckColumn()).renderer(value);
                        }
                    },
                    listeners: {
                        beforecheckchange: function(column, rowIndex, checked, eOpts) {
                            if (!cndValueType1Grid.store.getAt(rowIndex).data['isSelected'] || selectedCondition.conditionAgreeLevel == '01') {
                                return false;
                            } else {
                                return true;
                            }
                        }
                    }, align: 'center', width: 120}
            ],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ]
        }
    });

    cndValueType1Grid.setData(data);
}





/*
 * 제공조건 그리드 제공조건값 set popup (서비스>제공조건탭, 수수료할인추가팝업>제공조건탭)
 * grid : 입력되지 않은 경우 default : cnd4feePopupGrid(수수료할인추가팝업>제공조건탭 기준)
 * provideCondList : 입력되지 않은 경우 default : productBenefitProvidedListConditionList(수수료할인추가팝업>제공조건탭 기준)
 */
function renderConditionValue1PopupForFee(data, rowIndex, conditionCode, grid, provideCndList){
    var cndValueFeeType1Grid;
    var checkboxmodel = Ext.create ('Ext.selection.CheckboxModel', {mode:'MULTI'});

    if(!grid) grid = cnd4feePopupGrid;
    if(!provideCndList) provideCndList = 'productBenefitProvidedListConditionList';

    PFComponent.makePopup({
        title: bxMsg('DPP0150Title1'),
        height: 370,
        elCls: 'cnd-value-type-for-fee-popup',
        contents: cndValueType1Tpl(),
        buttons: [
            {text:bxMsg('ButtonBottomString3'), elCls:'button button-primary write-btn', handler:function(){
                var gridData = cndValueFeeType1Grid.getSelectedItem();

                gridData.forEach(function(el) {
                    el.listCode = el.key;
                    el.listCodeName = el.value;

                    delete el.key;
                    delete el.isSelected;
                });

                grid.store.getAt(rowIndex).set(provideCndList, gridData);
                if(grid.store.getAt(rowIndex).get('process') != 'C'){
                    grid.store.getAt(rowIndex).set('process', 'U');
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
                            {text: bxMsg('DPS0121_21String2'), flex : 1, dataIndex: 'value', align:'center'},
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

                PFRequest.get('/condition/template/getConditionTemplate.json', {'conditionCode': conditionCode, 'tntInstId': selectedTreeItem.tntInstId}, {
                    success: function(responseData) {
                        if (responseData['values']) {
                            responseData['values'].forEach(function(el) {
                                if (data) {
                                    if (tempObj[el.key]) {
                                        el.isSelected = true;
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