const conditionGroupDetailInfoPopup = getTemplate('conditionGroupDetailInfoPopup');

function renderConditionGroupDetailInfoPopup(data){
    var requestParam = {conditionGroupTemplateCode : data.code}
    PFRequest.get(
        '/conditionGroup/template/getConditionGroupTemplate.json',
        requestParam,
        {
            success:makeConditionGroupDetailInfoPopup,
            bxmHeader: {
                application: 'PF_Factory',
                service: 'CndGroupTemplateService',
                operation: 'queryCndGroupTemplate'
            }
        }
    );
}

function makeConditionGroupDetailInfoPopup(resopnseData){

    resopnseData.isActiveNm = codeMapObj.TemplateActiveYnCode[resopnseData.isActive];

    PFComponent.makePopup({
        title: bxMsg('DTE00002_Title')+bxMsg('detailInfo'),
        width: 800,
        height: 500,
        contents: conditionGroupDetailInfoPopup(resopnseData),
        submit: function() {},
        listeners: {
            afterRenderUI: function() {
                renderComboBox('ConditionGroupTemplateTypeCode', $('.cnd-tpl-type-select'));
                renderConditionGrid(resopnseData.conditionTemplateItemList);
            }
        }
    });
}


function renderConditionGrid(gridData) {

    var cndGrid = PFComponent.makeExtJSGrid({
        fields: ['conditionTemplate', 'defaultData', 'uniqueSeq', {
            name: 'name',
            convert: function(newValue, record) {
                var conditionTemplate = record.get('conditionTemplate');
                return conditionTemplate.name;
            }
        }, {
            name: 'code',
            convert: function(newValue, record) {
                var conditionTemplate = record.get('conditionTemplate');
                return conditionTemplate.code;
            }
        }, 'defaultValue', {
            name: 'defaultValue',
            convert: function(value, record) {
                //id there is no property of complexCo-List, value(data) will be "".
                //value have any data or true, this function will return true.
                return value ? true : false;
            }
        }, {
            name: 'complexConditionTemplateRelationList',
            convert: function(value, record) {
                //id there is no property of complexCo-List, value(data) will be "".
                //value have any data or true, this function will return true.
                return value ? true : false;
            }
        }, {
            name: 'betweenConditionTemplateValueRelationList',
            convert: function(value, record) {
                //id there is no property of complexCo-List, value(data) will be "".
                //value have any data or true, this function will return true.
                return value ? true : false;
            }
        }, {
            name: 'isComposingCondition',
            convert: function(value, model) {
                //the type of isCompo-tion is String like 01 or 02, but the type of isCompo-tion is boolean(true) when we click the check.
                if (value === 'Y' || value === true) {
                    return true;
                } else if (value === 'N' || value === false) {
                    return false;
                }
            }
        },{
            name: 'conditionTemplateTypeNm',
            convert: function(newValue, record) {
                var conditionTemplateTypeNm = codeMapObj.ProductConditionTypeCode[record.get('conditionTemplateType')];
                return conditionTemplateTypeNm;
            }
        },'conditionTemplateType', 'conditionValueDecisionLevel', 'applyStart','applyEnd',
            {
                name : 'applyStartDate',
                convert: function(newValue, record){
                    return record.get('applyStart').substr(0,10);
                }
            },{
                name : 'applyEndDate',
                convert: function(newValue, record){
                    return record.get('applyEnd').substr(0,10);
                }
            }
        ],
        gridConfig: {
            renderTo: '.pf-dcg-cnd-grid',
            columns: [
                {xtype: 'rownumberer', width: 30, sortable: false},
                {text: bxMsg('DTP0203String3'), width: 80, dataIndex: 'code',disabled: true},
                {text: bxMsg('DTP0203String5'), width: 200, dataIndex: 'name',disabled: true},
                {text: bxMsg('DTP0203String4'), width: 80, dataIndex: 'conditionTemplateTypeNm',disabled: true},
                {
                    text: bxMsg('DPS0121String7'), width: 120, dataIndex: 'conditionValueDecisionLevel',disabled: true,
                    renderer: function (value) {
                        return codeMapObj.ProductConditionAgreeLevelCode[value] || value;
                    }
                },
                // 2015 04 22 OHS 추가시작
                {
                    text: bxMsg('DPP0127String6'), width: 100, dataIndex: 'applyStartDate',disabled: true
                },
                {
                    text: bxMsg('DPP0127String7'), width: 100, dataIndex: 'applyEndDate',disabled: true
                },
                {
                    xtype: 'checkcolumn',
                    text: bxMsg('MTM0200String8'),
                    width: 100,
                    dataIndex: 'complexConditionTemplateRelationList',
                    disabled: true
                },
                {
                    xtype: 'checkcolumn',
                    text: bxMsg('DPS0121_21String3'),
                    width: 100,
                    dataIndex: 'defaultValue',
                    disabled: true
                }
            ],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ]
        }
    });

    cndGrid.setData(gridData);
}
