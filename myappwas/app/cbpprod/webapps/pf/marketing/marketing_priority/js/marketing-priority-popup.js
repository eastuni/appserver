/**
 * 마케팅우선순의 설정 팝업
 */
function renderMarketingPriorityPopup(record, submitEvent){
    const productMarketingPriorityPopupTpl = getTemplate('productMarketingPriorityPopupTpl');
    var grid;
    var gridDeleteData = [];
    var selectedCellIndex;

    PFComponent.makePopup({
        title: bxMsg('pdMarketingPriorityManagement'),
        width: 800,
        height: 400 + ((arrGridTitleData.length/2+1) * 30),
        contents: productMarketingPriorityPopupTpl(record.data),
        submit: function () {
            submitEvent(gridDeleteData.concat(grid.getAllData()));
        },
        contentsEvent: {
            'click .product-add-btn' : function () {
                PFPopup.selectProduct({ pdInfoDscd, multi: true }, function (selectItem) {
                    if(selectItem.length > 0) {
                        var seqNbr = grid.store.data.length + 1;
                        selectItem.forEach(function(el, index){
                            grid.addData({
                                applyStartDate : PFUtil.getNextDate() + ' 00:00:00'
                                , applyEndDate : '9999-12-31 23:59:59'
                                , process : 'C'
                                , activeYn  : 'N'
                                , prioritySequenceNumber : seqNbr + index
                                , pdInformationCode : el.code
                                , pdInformationName : el.name
                            });
                        });
                    }
                    modifyFlag = true;
                });
            }
        },
        listeners: {
            afterSyncUI: function () {

                $('.pf-pmp-pd-marketing-priority-popup .bx-info-table .apply-date').text(record.get('applyStartDate') + ' ~ ' + record.get('applyEndDate'));
                $('.pf-pmp-pd-marketing-priority-popup .bx-info-table .cls-str-active-yn-select').text(codeMapObj['TemplateActiveYnCode'][record.get('activeYn')]);

                var titleConditionInfo = '';

                arrGridTitleData.forEach(function(el, index){
                  el.defineValues = el.defineValues || [];

                	var title = '';

                    if(el.titleConditionName.length > 12){
                        el.titleConditionName = el.titleConditionName.substring(0,12)+'...';
                    }

                    // 목록형일때
                    if(el.titleConditionTypeCode == '01') {

                        var listValue;
                        el.defineValues.forEach(function(value){
                           if(record.get('listCd'+(index+1)) == value['code']){
                               listValue = value['name'];
                           }
                        });


                        title =
                                '<th style="background:#eee">' + el.titleConditionName + '</th>' +
                                '<td>' + listValue + '</td>';

                    }
                    // 범위형일때
                    else if(el.titleConditionTypeCode == '02'){

                        if(el.titleConditionDetailTypeCode == '01') {
                        	title =
                                '<th style="background:#eee">' + el.titleConditionName + '</th>' +
                                '<td>' + record.get('minVal' + (index + 1)) + ' ~ ' + record.get('maxVal' + (index + 1))
                                       + ' [' + bxMsg('crncyCd') + ' : ' +  codeMapObj['CurrencyCode'][el.currencyValue]
                            		   + ' (' + codeMapObj['RangeBlwUnderTypeCode'][el.rangeBlwUnderType] + ')]' +
                                '</td>';
                        }
                        else {
                        	title =
	                            '<th style="background:#eee">' + el.titleConditionName + '</th>' +
	                            '<td>' + record.get('minVal' + (index + 1)) + ' ~ ' + record.get('maxVal' + (index + 1))
	                                   + ' [' + bxMsg('measureUnitCode') + ' : ' +  codeMapObj['ProductMeasurementUnitCode'][el.productMeasurementUnit]
	                        		   + ' (' + codeMapObj['RangeBlwUnderTypeCode'][el.rangeBlwUnderType] + ')]' +
	                            '</td>';
                        }
                    }

                    // 홀수
                    if(((index+1)%2) == 1) {
                    	titleConditionInfo = titleConditionInfo + '<tr>' + title;

                        if(arrGridTitleData.length == (index+1)){
                        	titleConditionInfo = titleConditionInfo + '<th style="background:#eee"></th><td></td></tr>';
                        }

                    }else{
                        titleConditionInfo = titleConditionInfo + title + '</tr>'
                    }
                });

                $('.pf-pmp-pd-marketing-priority-popup .bx-info-table').prepend(titleConditionInfo);

                grid = PFComponent.makeExtJSGrid({
                    pageAble: true,
                    fields: ['pdInformationCode', 'pdInformationName'
                        , 'classificationStructureDistinctionCode', 'classificationStructureName'
                        , 'classificationCode', 'navigation'
                        , 'applyStartDate', 'applyEndDate', 'activeYn', 'prioritySequenceNumber' , 'process'
                    ],
                    gridConfig: {
                        renderTo: '.product-list-grid',
                        columns: [
                            {
                                text: bxMsg('DPS0126String10'), width: 60, dataIndex: 'prioritySequenceNumber',         // 우선순위
                                align: 'center',
                                editor: {
                                    allowBlank: false
                                }
                            },
                            {text: bxMsg('pdCd'), flex: 1, dataIndex: 'pdInformationCode',align: 'center'},             // 상품코드
                            {text: bxMsg('pdNm'), flex: 1.5, dataIndex: 'pdInformationName',style: 'text-align:center'},// 상품명
                            {text: bxMsg('DPP0127String6'), flex:1 ,dataIndex:'applyStartDate', align: 'center',        // 적용시작일자
                                style: 'text-align:center',
                                editor: {
                                    allowBlank: false,
                                    listeners: {
                                        focus: function(_this) {
                                            PFUtil.getGridDateTimePicker(_this, 'applyStartDate', grid, selectedCellIndex, false);
                                        }
                                    }
                                },
                                listeners: {
                                    click: function() {
                                        selectedCellIndex = $(arguments[1]).parent().index();
                                    }
                                }
                            },
                            {text: bxMsg('DPP0127String7'), flex:1 , dataIndex:'applyEndDate', align: 'center',         // 적용종료일자
                                style: 'text-align:center',
                                editor: {
                                    allowBlank: false,
                                    listeners: {
                                        focus: function(_this) {
                                            PFUtil.getGridDateTimePicker(_this, 'applyEndDate', grid, selectedCellIndex, false);
                                        }
                                    }
                                },
                                listeners: {
                                    click: function() {
                                        selectedCellIndex = $(arguments[1]).parent().index();
                                    }
                                }
                            },
                            {
                                text: bxMsg('actvYn'),  width:80, dataIndex: 'activeYn', align: 'center',
                                style: 'text-align:center',
                                renderer: function(value) {
                                    return codeMapObj.TemplateActiveYnCode[value] || value;
                                }
                            },
                            {
                                xtype: 'actioncolumn', width: 35, align: 'center',
                                items: [{
                                    icon: '/images/x-delete-16.png',
                                    handler: function (grid, rowIndex, colIndex, item, e, record) {

                                        if(record.get('activeYn') == 'Y'){
                                            PFComponent.showMessage(bxMsg('dontDeleteActiveTypeConditionTemplate'), 'warning');
                                            return;
                                        }

                                        if(record.data.process != 'C') {
                                            record.data.process = 'D';
                                            gridDeleteData.push(record.data);
                                        }

                                        record.destroy();
                                        modifyFlag = true;
                                    }
                                }]
                            }
                        ],
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                clicksToEdit: 1,
                                listeners:{
                                    beforeedit:function(e, editor) {
                                        if( editor.record.data.activeYn == 'N' ||                                 // 비활동인 경우
                                            editor.record.data.process == 'C' ||                                      // 새로 추가된 row인 경우
                                            (getSelectedProjectId() && isEmergency(getSelectedProjectId()))    ||     // emergency 인 경우
                                            (getSelectedProjectId() && isUpdateStatus(getSelectedProjectId())) ){     // 상품정보 수정인 경우
                                            // 모두 수정가능
                                        }
                                        else if(editor.field != 'applyEndDate' && editor.field != 'prioritySequenceNumber') {
                                            return false;
                                        }
                                    },
                                    afteredit:function(e, editor){
                                        if(editor.originalValue !=  editor.value) {
                                            if (editor.field == 'applyStartDate' && (editor.record.get('process') == null || editor.record.get('process').length == 0)) {
                                                var originalData = $.extend(true, {}, editor.record.data);
                                                originalData[editor.field] = editor.record.modified[editor.field];
                                                originalData['process'] = 'D';
                                                gridDeleteData.push(originalData);
                                                editor.record.set('process', 'C');
                                            } else if (editor.record.get('process') != 'C') {
                                                editor.record.set('process', 'U');
                                            }
                                        }
                                    }
                                }
                            })
                        ]
                    }
                });

                if(record.get('lstClassificationInformationRelationVO')){

                    var data = record.get('lstClassificationInformationRelationVO');
                    var gridData = $.grep(data, function(el, i){
                        return el.process == null || el.process == '' || el.process != 'D';
                    });

                    gridDeleteData = $.grep(data, function(el, i){
                       return el.process == 'D';
                    });

                    grid.setData(gridData);
                }

                if(writeYn != 'Y'){
                    $('.write-btn').hide();
                }
            }
        }
    });
}
