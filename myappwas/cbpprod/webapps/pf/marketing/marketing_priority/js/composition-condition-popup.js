/******************************************************************************************************************
 * 팝업
 ******************************************************************************************************************/

/**
 * 구성조건설정 팝업
 */
function renderColumnSettingPopup(){
    const cndValColumnSettingPopupTpl = getTemplate('cndValColumnSettingPopupTpl');
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
        height: 390,
        contents: cndValColumnSettingPopupTpl(),
        buttons:[
            // 확인버튼
            {text:bxMsg('ButtonBottomString3'), elCls:'button button-primary write-btn', handler:function(){
                var selectedColumnList = columnSettingPopupGrid.getAllData();

                if (selectedColumnList.length > 9) {
                    PFComponent.showMessage(bxMsg('noMore9ComplexCnd'), 'warning');
                    return;
                }

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

                var bTierAutoGen = $('.condition-value-column-setting-popup .tier-auto-generation').prop('checked');

                    arrGridTitleData = selectedColumnList;
                    var data = [];
                    if(bTierAutoGen){
                        data = fnGenerateTierData(arrGridTitleData);
                    }
                    renderProductMarketingPriorityMngGrid(arrGridTitleData, data);       // data

                modifyFlag = true;
                this.close();
            }},

            // 취소 버튼
            {text:bxMsg('ButtonBottomString16'), elCls:'button button-primary', handler:function(){
                this.close();
            }}
        ],
        contentsEvent:{
            // 검색버튼 클릭시
            'click .cnd-tpl-search': function() {
                var requestParam = {
                    'conditionName': $('.condition-value-column-setting-popup .cnd-name-search').val(),
                    'tntInstId' : tntInstId
                };

                var comboVal = $('.condition-value-column-setting-popup .cnd-type-select').val();

                if (comboVal) {
                    requestParam.conditionTypeCode = comboVal;
                } else {
                    requestParam.conditionTypeCode = 'A';
                }
                PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
                    success: function (responseData) {

                        var resArrLength = responseData.length;

                        if(resArrLength > 0){
	                        // title로 설정되어 있는 조건은 제외
	                        var clone = responseData.slice(0);

	                        for (var i = 0; i < resArrLength; i++) {
	                            if (objGridTitleData[clone[i].code]) {
	                                fnArrGridTitleData(clone[i].code, responseData);
	                            }
	                        }
                        }
                        conditionPopupGrid.setData(responseData);

                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CndTemplateService',
                        operation: 'queryListCndTemplate'
                    }
                });
            }
        },
        listeners: {
            afterRenderUI: function() {

                var options = [];

                var $defaultOption = $('<option>');
                $defaultOption.text(bxMsg('Z_All'));
                $defaultOption.val('');

                options.push($defaultOption);

                $.each(codeMapObj['ProductConditionTypeCode'], function(key,value){
                    if (key === '03' || key === '04') {
                        return;
                    }

                    var $option = $('<option>');

                    $option.val(key);
                    $option.text(value);

                    options.push($option);
                });
                $('.condition-value-column-setting-popup .cnd-type-select').html(options);

                var requestParam = {'conditionTypeCode': 'A'};

                PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
                    success: function(responseData) {

                        var resArrLength = responseData.length;

                        // title로 설정되어 있는 조건은 제외
                        var clone = responseData.slice(0);

                        for (var i = 0; i < resArrLength; i++) {
                            if (objGridTitleData[clone[i].code]) {
                                fnArrGridTitleData(clone[i].code, responseData);
                            }
                        }

                        conditionPopupGrid = PFComponent.makeExtJSGrid({
                            fields: [
                                'code', 'name', 'type',
                                'defineValues', 'titleConditionDetailTypeCode', 'conditionDetailTypeCode',
                                {
                                    name: 'titleConditionCode',
                                    convert: function(newValue, record) {
                                        return record.get('code');
                                    }},
                                {
                                    name: 'titleConditionName',
                                    convert: function(newValue, record) {
                                        return record.get('name');
                                    }},
                                {
                                    name: 'titleConditionTypeCode',
                                    convert: function(newValue, record) {
                                        return record.get('type');
                                    }}
                            ],
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
                                    if (!record.get('titleConditionDetailTypeCode')) {
                                        record.set('titleConditionDetailTypeCode', record.get('conditionDetailTypeCode'));
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
                                        record.set('titleConditionDetailTypeCode', record.get('conditionDetailTypeCode'));
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
                                }},
                            {
                                xtype: 'actioncolumn', width: 35, align: 'center',
                                items: [{
                                    icon: '/images/edit-icon30.png',
                                    handler: function (_this, rowIndex, colIndex, item, e, record) {

                                        var submitEvent = function(data){
                                            columnSettingPopupGrid.setData(data);
                                        }
                                        renderTierValuePopup(columnSettingPopupGrid.getAllData(), rowIndex, submitEvent);
                                    }
                                }]
                            }
                        ];

                        columnSettingPopupGrid = PFComponent.makeExtJSGrid({
                            fields: ['titleConditionCode', 'rangeBlwUnderType', 'titleConditionName',
                                'productMeasurementUnit', 'titleConditionTypeCode', 'defineValues',
                                'type', 'titleConditionDetailTypeCode', 'currencyValue', 'baseConditionYn', 'conditionDetailTypeCode'],
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

                                        	if(columnSettingPopupGrid.getAllData().length > 9){
                                        		PFComponent.showMessage(bxMsg('noMore9ComplexCnd'), 'warning');
                                        		data.records[0].destroy();
                                        		conditionPopupGrid.addData(data.records[0].data);
                                        		return;
                                        	}

                                        	if(data.records[0].data.type == '01'){
	                                        	var requestParam = {
	                                    			conditionCode : data.records[0].data.code
	                                        	};

	                                        	 PFRequest.get('/condition/template/getConditionTemplate.json', requestParam, {
	                                               success:function (responseData) {

	                                            	   responseData.values.forEach(function(el){
	                                            		   el.code = el.key;
	                                            		   el.name = el.value;
	                                            		   el.isSelected = true;
	                                            	   })
	                                        			data.records[0].set('defineValues', responseData.values);
	                                        		},
	                                        		bxmHeader: {
	                                                  application: 'PF_Factory',
	                                                  service: 'CndTemplateService',
	                                                  operation: 'queryCndTemplate'
	                                                }
	                                        	});
                                        	}

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


                        columnSettingPopupGrid.setData(arrGridTitleData);
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'CndTemplateService',
                        operation: 'queryListCndTemplate'
                    }
                });

            }
        }
    });
}

/**
 * 계층값 입력 팝업
 */
function renderTierValuePopup(data, selectedIndex, submitEvent){
    const tierValupPopupTpl = getTemplate('tierValupPopupTpl');

    var gridMap = {};

    var heigth = 395 + (Math.floor((data.length-1)/3) * 30);

    PFComponent.makePopup({
        title: bxMsg('TierValue'),
        width: 400,
        height: heigth,
        contents: tierValupPopupTpl(),
        buttons :[
    	  // 확인
    	  {text:bxMsg('Z_OK'), elCls:'button button-primary write-btn', handler:function(){
    		  var flag = true;
              data.forEach(function(el){
                  $.each(gridMap, function(key, grid){
                      if(el.titleConditionCode == key){
                      	if(el.titleConditionTypeCode == '01'){
                      		if(grid.getSelectedItem().length == 0){
                      			flag = false;
                      		}
                      		el.defineValues.forEach(function(value){
                      			value.isSelected = false;
                      			grid.getSelectedItem().forEach(function(selectedItem){
                  					if(selectedItem.code == value.code){
                  						value.isSelected = true;
                  					}
                  				});
  	                		});
                      	}else if(el.titleConditionTypeCode == '02'){
                      		el.defineValues = grid.getAllData();
                      		if(el.defineValues.length == 0){
                      			flag = false;
                      		}
                      	}
                      }
                  });
              });

              if(!flag){
              	PFComponent.showMessage(bxMsg('Z_EmptyInputValue'), 'warning');
              	return;
              }

          	  submitEvent(data);
              this.close();
          }},
          // 취소
          {text:bxMsg('ButtonBottomString16'), elCls:'button button-primary', handler:function(){
              this.close();
          }}
        ],
        contentsEvent:{
          'click .grid-add-btn' : function(e){
              gridMap[e.target.closest('button').id.split('-')[0]].addData({});
          }
        },
        listeners: {
            afterSyncUI: function () {

                var children = [];
                var index = 0;
                data.forEach(function(el){

                	if(el.titleConditionName.length > 6){
                    	el.titleConditionName = el.titleConditionName.substring(0,6)+'...';
                    }

                    children.push({
                        text:el.titleConditionName,
                        id: el.titleConditionCode,
                        value: el,
                        index: index
                    });

                    var $tabCont = '<div class="'+ el.titleConditionCode + '-tpl cnd-info-sub-cont"></div>'
                    $('#cnd-info-sub-conts').append($tabCont);
                    index++;
                });

                PFUI.use('pfui/tab',function(Tab){
                    var tab = new Tab.Tab({
                        render: '#cnd-info-sub-tab',
                        elCls: 'nav-tabs',
                        autoRender: true,
                        children: children
                    });

                    tab.on('selectedchange', function(ev){
                        var item = ev.item;
                        renderTierValueGrid(item.get('value'));
                    })

                    tab.setSelected(tab.getItemAt(selectedIndex), 1);
                });
            }
        }
    });

    function renderTierValueGrid(data){

        $('.cnd-info-sub-cont').hide();
        $('.' + data.titleConditionCode + '-tpl').show();

        if(gridMap[data.titleConditionCode]){
            return;
        }

        // 범위형 일때반 추가 버튼
        if(data.titleConditionTypeCode == '02'){
	        var $button = '<div class="btn-box" style="height: 30px">' +
	                      '<button type="button" id="'+ data.titleConditionCode +'-add-btn" class="bw-btn grid-add-btn write-btn" icon-tooltip="' + bxMsg('ButtonBottomString8') + '">' +
	                      '<i class="bw-icon i-25 i-func-add"></i></button></div>';
	        $('#cnd-info-sub-conts .' + data.titleConditionCode + '-tpl').append($button);
        }

        var $grid = '<div class="'+ data.titleConditionCode + '-grid" style="height: 260px"></div>';
        $('#cnd-info-sub-conts .' + data.titleConditionCode + '-tpl').append($grid);

        var grid;
        var checkboxmodel = Ext.create ('Ext.selection.CheckboxModel', {mode:'MULTI'});

        // 목록형
        if(data.titleConditionTypeCode == '01'){
	        grid = PFComponent.makeExtJSGrid({
	            fields: ['code', 'name', 'isSelected'],
	            gridConfig:{
	            	selModel: checkboxmodel,
	                renderTo: '.' + data.titleConditionCode + '-grid',
	                columns:[
	                    {
	                        text: bxMsg('DPS0121_1String1'),
	                        flex: 1,
	                        dataIndex: 'code',
	                        style: 'text-align:center'
	                    },
	                    {
	                        text: bxMsg('DPS0121_1String2'),
	                        flex: 1,
	                        dataIndex: 'name',
	                        style: 'text-align:center'
	                    },
	                    {
	                        xtype: 'actioncolumn', width: 35, align: 'center',
	                        items: [{
	                            icon: '/images/x-delete-16.png',
	                            handler: function (grid, rowIndex, colIndex, item, e, record) {
	                                record.destroy();
	                            }
	                        }]
	                    }
	                ],
		        	listeners:{
		        		scope: this,
		        		'viewready' : function(_this, eOpts){
		        			if(data.defineValues){
	                        	$.each(data.defineValues, function(index, item){
                                    if(item.isSelected == true){
                                        checkboxmodel.select(index, true);
                                    }
	                            });
	                        }
		        		}
		        	}
	            }

	        });
        }

        // 범위형
        else if(data.titleConditionTypeCode == '02'){
	        grid = PFComponent.makeExtJSGrid({
	            fields: ['minVal', 'maxVal'],
	            gridConfig:{
	                renderTo: '.' + data.titleConditionCode + '-grid',
	                columns:[
	                    {
	                        text: bxMsg('DPS0121_1String1'),
	                        flex: 1,
	                        dataIndex: 'minVal',
	                        style: 'text-align:center',
	                        editor:{
	                            xtype: 'textfield',
	                            allowBlank: false,
	                            selectOnFocus: true
	                        }
	                    },
	                    {
	                        text: bxMsg('DPS0121_1String2'),
	                        flex: 1,
	                        dataIndex: 'maxVal',
	                        style: 'text-align:center',
	                        editor:{
	                            xtype: 'textfield',
	                            allowBlank: false,
	                            selectOnFocus: true
	                        }
	                    }
	                ],
	                plugins: [
	                    Ext.create('Ext.grid.plugin.CellEditing', {
	                        clicksToEdit: 1
	                    })
	                ]
	            }

	        });
        }

        if(data.defineValues){
            grid.setData(data.defineValues);
        }

        gridMap[data.titleConditionCode] = grid;
    }
}

// 이미 선택한 조건 제외
function fnArrGridTitleData(key, arr) {

    arr.forEach(function(el, idx){
        if (el.code === key) {
            arr.splice(idx, 1);

            return false;
        }
    })
}

/**
 * 계층데이터 자동생성
 */
function fnGenerateTierData(arrGridTitleData){
    var data = [];
    var temp = [];

    data = setValue(0);

    for(var i=1 ; i<10 ; i++) {
        if(!arrGridTitleData[i] || !arrGridTitleData[i].defineValues){
            break;
        }

        temp = data.slice(0);
        data = [];
        temp.forEach(function (el) {
            data = data.concat(setValue(i, el));
        });
    }

    function setValue(index, data){

        var result  = [];

        arrGridTitleData[index].defineValues.forEach(function(el) {
            var element = $.extend({}, data);
            if (arrGridTitleData[index].titleConditionTypeCode == '01') {
            	if(!el.isSelected || el.isSelected == false) return;
                element['listCd' + (index + 1)] = el.code;
            } else if (arrGridTitleData[index].titleConditionTypeCode == '02') {
                element['minVal' + (index + 1)] = el.minVal;
                element['maxVal' + (index + 1)] = el.maxVal;
            }
            element['activeYn'] = 'N';
            element['process'] = 'C';

            element['classificationDetailVO'] = {
                applyStartDate : PFUtil.getNextDate() + ' 00:00:00',
                applyEndDate : '9999-12-31 23:59:59',
                activeYn : 'N',
                process : 'C'
            };

            element['lstClassificationInformationRelationVO'] = [];

            result.push(element);
        });

        return result;
    }

    return data;
}
