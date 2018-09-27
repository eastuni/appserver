const cndPopupTpl = getTemplate('cndPopupTpl');
const cndRelPopupTpl = getTemplate('cndRelPopupTpl');
const cndRelPopupTpl2 = getTemplate('cndRelPopupTpl2');
const conditionInfoPopupTpl = getTemplate('conditionInfoPopupTpl');

/**
 * @deprecated unused
 */
function renderConditionAddPopup() {
  var cndPopupGrid;
  var chooseCndGrid;

  PFComponent.makePopup({
    title: bxMsg('DTP0203Title'),
    width: 676,
    height: 330,
    contents: cndPopupTpl(),
    submit: function() {
      var selectedData = chooseCndGrid.getAllData();
      var seq = selectedGridData.length;

      selectedData.forEach(function(el) {
        var code = el.code

        var today = new Date();
        var year = today.getFullYear();
        var month = today.getMonth()+1;
        var date = today.getDate();

        if(month<10){
          month = '0'+month;
        }

        if(date<10){
          date = '0'+date;
        }

        el['applyStart'] = year + '-' + month + '-' + date + ' ' + '00:00:00';
        el['applyEnd'] = '9999-12-31 23:59:59';

        el['conditionTemplateType'] = el.type;
        el['conditionValueDecisionLevel'] = '01';
        el['isComposingCondition'] = 'N';

        el['conditionTemplate'] = {};
        el['conditionTemplate']['code'] = code;
        el['conditionTemplate']['name'] = el.name;
        //el['conditionTemplate']['tntInstId'] = 'MYBKC1CN';
        el['conditionTemplate']['tntInstId'] = getLoginTntInstId(); // OHS 20171213 - 수정 MYBKC1CN -> getLoginTntInstId()
        el['conditionTemplate']['currentCatalogId'] = el.currentCatalogId;

        el['uniqueSeq'] = seq;
        el['process'] = 'C';

        delete el['content'];
        delete el['code'];
        delete el['name'];
        delete el['type'];
        delete el['typeNm'];

        cndGrid.addData(el);
        listMap[seq] = el;
        selectedGridData.push(el);

        seq++;
      });

      modifyFlag = true;
    },
    contentsEvent: {
      'click .cnd-tpl-search': function() {
        var requestParam = {
            'conditionName': $('.add-cnd-popup .cnd-name-search').val(),
            'activeYn': 'Y'
        };

        var comboVal = $('.add-cnd-popup .cnd-type-select').val();

        if (comboVal) {
          requestParam.conditionTypeCode = comboVal;
        }

        if($('.cnd-tpl-type-select').val() == '03') {
          requestParam = {
              conditionTypeCode : '04',
              conditionDetailTypeCode:'04.10',
              conditionName : $('.add-cnd-popup .cnd-name-search').val()
          }
        }

        PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
          success: function(responseData) {

            $('.add-cnd-popup .popup-cnd-grid').empty();

            cndPopupGrid = PFComponent.makeExtJSGrid({
              fields: ['code', 'type', 'name', 'content', 'isActive', 'currentCatalogId', {
                name: 'typeNm',
                convert: function(newValue, record) {
                  var typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
                  return typeNm;
                }}],
                gridConfig: {
                  selType: 'checkboxmodel',
                  renderTo: '.popup-cnd-grid',
                  columns: [
                    {text: bxMsg('DTP0203String3'), width: 80, dataIndex: 'code'},
                    {text: bxMsg('DTP0203String4'), width: 80, dataIndex: 'typeNm'},
                    {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name'},
                    {text: bxMsg('DPS0101String6'), width: 70, dataIndex: 'isActive',
                      renderer: function(value, p, record) {
                        if (value === 'Y') {
                          return bxMsg('active');
                        } else if (value === 'N') {
                          return bxMsg('inactive');
                        }
                      }
                    },
                    {text: bxMsg('DTP0203String8'), flex: 1, dataIndex: 'content'}
                    ]
                }
            });

            if(responseData) {
            	cndPopupGrid.setData(responseData);
            }
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CndTemplateService',
            operation: 'queryListCndTemplate'
          }
        });
      },
      'click .search-list-add-btn' : function(){
        chooseCndGrid.addData(cndPopupGrid.getSelectedItem());
      }
    },
    listeners: {
      afterRenderUI: function() {
        var requestParam = {};

        var options = [];

        // 상품조건만 전체 세팅
        if($('.cnd-tpl-type-select').val() == '01') {
          var $defaultOption = $('<option>');
          $defaultOption.text(bxMsg('Z_All'));
          $defaultOption.val('');

          options.push($defaultOption);

          requestParam = {activeYn : 'Y'}
        }
        // 02 우대금리 : 조건템플릿 타입 03
        else if($('.cnd-tpl-type-select').val() == '02') {
          requestParam = {conditionTypeCode : '03'}
        }
        // 03 공통수수료 : 조건템플릿 타입 04
        else if($('.cnd-tpl-type-select').val() == '03') {
          requestParam = {conditionTypeCode : '04', conditionDetailTypeCode:'04.10'}
        }

        $.each(codeMapObj['ProductConditionTypeCode'], function(key,value){

          switch($('.cnd-tpl-type-select').val()){
          case '02' : // 우대금리
            if(key !== '03') return;
            break;
          case '03' : // 공통수수료
            if(key !== '04') return;
            break;
          case '07' : // 공통조건
            if(key == '04') return;
            break;
          }

          var $option = $('<option>');
          $option.val(key);
          $option.text(value);

          options.push($option);
        });

        $('.add-cnd-popup .cnd-type-select').html(options);

        PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
          success: function(responseData) {

            cndPopupGrid = PFComponent.makeExtJSGrid({
              fields: ['code', 'type', 'name', 'content', 'isActive', 'currentCatalogId', {
                name: 'typeNm',
                convert: function(newValue, record) {
                  var typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
                  return typeNm;
                }}],
                gridConfig: {
                  selType: 'checkboxmodel',
                  renderTo: '.popup-cnd-grid',
                  columns: [
                    {text: bxMsg('DTP0203String3'), width: 80, dataIndex: 'code'},
                    {text: bxMsg('DTP0203String4'), width: 80, dataIndex: 'typeNm'},
                    {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name'},
                    {text: bxMsg('DPS0101String6'), width: 70, dataIndex: 'isActive',
                      renderer: function(value, p, record) {
                        if (value === 'Y') {
                          return bxMsg('active');
                        } else if (value === 'N') {
                          return bxMsg('inactive');
                        }
                      }
                    },
                    {text: bxMsg('DTP0203String8'), flex: 1, dataIndex: 'content'}
                    ]
                }
            });

            if(responseData) {
            	cndPopupGrid.setData(responseData);
            }
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CndTemplateService',
            operation: 'queryListCndTemplate'
          }
        });

        chooseCndGrid = makeCndPopupChooseGrid();
      }
    }
  });

}


function renderCndToRelAddPopup(submitEvent){
  var cndPopupGrid,chooseCndGrid;

  // OHS 2017.12.01 추가 - ja 언어일경우 width 조정필요
  var popupWidth = bxMsg.locale == 'ja' ? 673 : 665;
  PFComponent.makePopup({
    title: bxMsg('DTP0203Title'),
    width: popupWidth,
    height: 330,
    contents: cndRelPopupTpl(),
    submit: function() {
      submitEvent(chooseCndGrid);
      modifyFlag = true;
    },
    contentsEvent: {
      'click .cnd-tpl-search': function() {
        var requestParam = {
            'conditionName': $('.add-cnd-to-rel-grid-popup .cnd-name-search').val()
        };

        // 20150205 OHS Debug And modifed
        //var comboVal = $('.add-cnd-popup .cnd-type-select').val();
        var comboVal = $('.add-cnd-to-rel-grid-popup .cnd-type-select').val();

        if(comboVal) {
          requestParam.conditionTypeCode = comboVal;
        } else {
          requestParam.conditionTypeCode = 'A';
        }

        PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
          success: function(responseData) {
        	  if(responseData) {
        		  cndPopupGrid.setData(responseData);
        	  }
        	  else {
        		  cndPopupGrid.setData([]);
        	  }
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CndTemplateService',
            operation: 'queryListCndTemplate'
          }
        });
      },
      'click .search-list-add-btn' : function(){
        chooseCndGrid.addData(cndPopupGrid.getSelectedItem());
      }
    },
    listeners: {
      afterRenderUI: function() {
        var requestParam = {'conditionTypeCode': 'A'};

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

        $('.add-cnd-to-rel-grid-popup .cnd-type-select').html(options);

        PFRequest.get('/condition/template/queryConditionTemplateBaseForList.json', requestParam, {
          success: function(responseData) {

            cndPopupGrid = PFComponent.makeExtJSGrid({
              fields: ['code', 'type', 'name', 'content', 'isActive', {
                name: 'typeNm',
                convert: function(newValue, record) {
                  var typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
                  return typeNm;
                }}],
                gridConfig: {
                  selType: 'checkboxmodel',
                  renderTo: '.popup-cnd-grid',
                  columns: [
                    {text: bxMsg('DTP0203String3'), width: 80, dataIndex: 'code'},
                    {text: bxMsg('DTP0203String4'), width: 80, dataIndex: 'typeNm'},
                    {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name'},
                    {text: bxMsg('DPS0101String6'), width: 70, dataIndex: 'isActive',
                      renderer: function(value, p, record) {
                        if (value === 'Y') {
                          return bxMsg('active');
                        } else if (value === 'N') {
                          return bxMsg('inactive');
                        }
                      }
                    },
                    {text: bxMsg('DTP0203String8'), flex: 1, dataIndex: 'content'}
                    ]
                }
            });

            if(responseData) {
            	cndPopupGrid.setData(responseData);
            }
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'CndTemplateService',
            operation: 'queryListCndTemplate'
          }
        });

        chooseCndGrid = makeCndPopupChooseGrid();
      }
    }
  });
}

function makeCndPopupChooseGrid(){
    var grid = PFComponent.makeExtJSGrid({
        fields: ['code', 'type', 'name', 'content', 'isActive', 'currentCatalogId', {
            name: 'typeNm',
            convert: function(newValue, record) {
                var typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
                return typeNm;
            }}],
        gridConfig: {
            renderTo: '.choose-cnd-grid',
            columns: [
                {text: bxMsg('DTP0203String3'), flex: 1, dataIndex: 'code'},
                {
                    xtype: 'actioncolumn', width: 35, align: 'center',
                    items: [{
                        icon: '/images/x-delete-16.png',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                        	modifyFlag = true;
                            record.destroy();
                        }
                    }]
                }
            ]
        }
    });

    return grid;
}

function renderCndToRelAddPopup2(submitEvent,record){

  var cndPopupGrid;

  var requestParam = {conditionGroupTemplateCode : record.data.conditionGroupTemplateCode1}

  PFRequest.get('/conditionGroup/template/getConditionGroupTemplate.json', requestParam, {
    success: function(responseData) {
      // OHS 20161026 값간관계유형코드로 분기하도록 아래 로직 수정
      var relationType = record.data.relationType;
      var conditionTemplateType = [];

      // 01 : 유효값필수존재 [범위만가능]
      if(relationType == '01') {
        conditionTemplateType.push('02');
      }
      // 02 : 유효목록코드필수존재 [목록만가능]
      else if(relationType == '02') {
        conditionTemplateType.push('01');
      }
      // 03 : 상호배타관계 [범위/목록]
      else if(relationType == '03') {
        conditionTemplateType.push('01');
        conditionTemplateType.push('02');
      }
      // 04 : 조건1<=조건2, 05 : 조건1<조건2, 06 : 조건1>=조건2, 07 : 조건1>조건2 [범위만가능], 08 : 배수
      else if(relationType == '04' || relationType == '05' || relationType == '06' || relationType == '07' || relationType == '08') {
        conditionTemplateType.push('02');
      }

      var gridDatas = condtionValueRelGridDataConvertor(responseData, conditionTemplateType);

      if(gridDatas.length === 0){
        PFComponent.showMessage(bxMsg('notHaveConditionInConditionGroupTemplate'), 'warning');
      }else{
        PFComponent.makePopup({
          title: bxMsg('DTP0203Title'),
          width: 500,
          height: 330,
          contents: cndRelPopupTpl2(),
          submit: function() {
            submitEvent(cndPopupGrid);
            modifyFlag = true;
          },
          listeners: {
            afterRenderUI: function() {

              $('.popup-cnd-tpl-grid-header').remove();

              cndPopupGrid = PFComponent.makeExtJSGrid({
                fields: ['code', 'type', 'name', 'content', 'isActive', {
                  name: 'typeNm',
                  convert: function(newValue, record) {
                    var typeNm = codeMapObj.ProductConditionTypeCode[record.get('type')];
                    return typeNm;
                  }}],
                  gridConfig: {
                    selType: 'checkboxmodel',
                    renderTo: '.popup-cnd-grid',
                    columns: [
                      {text: bxMsg('DTP0203String3'), width: 80, dataIndex: 'code'},
                      {text: bxMsg('DTP0203String4'), width: 80, dataIndex: 'typeNm'},
                      {text: bxMsg('DTP0203String5'), flex: 1, dataIndex: 'name'},
                      {text: bxMsg('DPS0101String6'), width: 70, dataIndex: 'isActive',
                        renderer: function(value, p, record) {
                          if (value === 'Y') {
                            return bxMsg('active');
                          } else if (value === 'N') {
                            return bxMsg('inactive');
                          }
                        }
                      },
                      {text: bxMsg('DTP0203String8'), flex: 1, dataIndex: 'content'}
                      ]
                  }
              });

              cndPopupGrid.setData(gridDatas);

            }
          }
        });
      }


    },
    bxmHeader: {
      application: 'PF_Factory',
      service: 'CndGroupTemplateService',
      operation: 'queryCndGroupTemplate'
    }
  });

}

/**
 * @deprecated unused
 */
function renderDetailConditionInfoPopup(){
  PFComponent.makePopup({
    title: bxMsg('DPP0107Title'),
    contents: relProductAddPopupTpl(),
    width: 600,
    submit: function () {

      modifyFlag = true;
    },
    contentsEvent: {
      'click .search-btn': function () {


      }
    },
    listeners: {
      afterRenderUI: function () {

      }
    }
  });
}


/**
 * 그리드 더블클릭 시 조건상세
 */
function renderConditionInfoPopup(data){
  PFComponent.makePopup({
    title: bxMsg('condition-info'), // 조건정보
    width: 500,
    height: 470,
    contents: conditionInfoPopupTpl(data),
    buttons: [{text: bxMsg('ContextMenu_Close'), elCls: 'button button-primary', handler : function(){ this.close() }}],
    listeners: {
      afterRenderUI: function () {

        $('.condition-type-name').val(codeMapObj.ProductConditionTypeCode[data.type]);
        $('.condition-active-status-name').val(codeMapObj.TemplateActiveYnCode[data.isActive]);


        switch (data.type){
        case '01' :
          statusFlag = '01';

          $('.condition-detail-type-name').val(codeMapObj.ProductConditionDetailTypeCode[data.currentCatalogId]);
          $('.type-content').html(conditionListGridTpl());

          if (data.currentCatalogId == '06') {
            renderConditionYNListGrid(data['values']);
          } else {
            renderConditionListGrid(data['values']);
          }

          break;
        case '02' : // 범위형일때
          statusFlag = '02';

          $('.condition-detail-type-name').val(codeMapObj.ProductConditionDetailTypeCode[data.currentCatalogId]);

          $('.pf-dc-info-form').append(rangeTypeItem());
          $('.is-single-value-item').val(data.isSingleValue);

          if(data.isSingleValue=='Y'){
            $('.single-value-checkbox').prop('checked',true);
          }

          break;
        case '03' : // 금리일때
          statusFlag = '03';

          $('.condition-detail-type-name').val(codeMapObj.ProductConditionInterestDetailTypeCode[data.currentCatalogId]);

          break;
        case '04' :// 수수료일때
          statusFlag = '04';

          $('.condition-detail-type-name').val(codeMapObj.ProductConditionFeeDetailTypeCode[data.currentCatalogId]);

          $('.pf-dc-info-form').append(chargeTypeItem());
          renderComboBox('ProductAmountTypeCode', $('.amtTpDscd'), data.amtTpDscd ? data.amtTpDscd : '');
          renderComboBox('FeeSettleTypeCode', $('.prePostAcqstnDscd'), data.prePostAcqstnDscd ? data.prePostAcqstnDscd : '', true, '');
          //if(data.isActive=='Y'){
          //    $('.fee-form-item').attr('disabled',true);
          //}

          var event = !data['event'] ? null : data['event'];
          //renderCondtionEventGrid(responseData['event']);

          break;
        };
      }
    }
  });

  // Y/N Condition Display Grid
  function renderConditionYNListGrid(data) {
    listGrid = PFComponent.makeExtJSGrid({
      pageAble: true,
      fields: ['key','value'],
      gridConfig: {
        renderTo: '.condition-list-grid',
        columns: [
          {text: bxMsg('MTM0300String7'), flex: 1, dataIndex: 'key'},
          {text: bxMsg('MTM0300String8'), flex: 2, dataIndex: 'value'},
          ],
          plugins: [
            Ext.create('Ext.grid.plugin.CellEditing', {
              clicksToEdit: 1
            })
            ]
      }
    });

    listGrid.setData(data);
  }

  var listGrid;
  function renderConditionListGrid(data) {
    listGrid = PFComponent.makeExtJSGrid({
      pageAble: true,
      fields: ['key','value'],
      gridConfig: {
        renderTo: '.condition-list-grid',
        columns: [
          {text: bxMsg('MTM0300String7'), flex: 1, dataIndex: 'key',  editor: {allowBlank: false,maxLength: 20, minLength:1}},
          {text: bxMsg('MTM0300String8'), flex: 2, dataIndex: 'value',  editor: {allowBlank: false,maxLength: 200}}
          ]
      }
    });

    listGrid.setData(data);
  }
}

function renderConditionValueListPopup(td, record){
  var cndValueFeeType1Grid;

  PFComponent.makePopup({
    title: bxMsg('DPP0150Title1'),
    height: 370,
    elCls: 'cnd-value-type-for-fee-popup',
    contents: cndValueType1Tpl(),
    submit: function() {
      var gridData = cndValueFeeType1Grid.getSelectedItem()[0];

      if(gridData){
        $(td).find('div').text(gridData.value);
        record.data.key1 = gridData.key;
        record.data.value1 = gridData.value;
        modifyFlag = true;
      }

    },
    listeners: {
      afterRenderUI: function() {
        cndValueFeeType1Grid = PFComponent.makeExtJSGrid({
          fields: ['key','value'],
          gridConfig: {
            selModel: Ext.create ('Ext.selection.CheckboxModel', {mode: 'SINGLE'}),
            renderTo: '.cnd-val-type1-grid',
            columns: [
              {text: bxMsg('DPS0121_21String2'), flex : 1, dataIndex: 'value', align:'center'},
              ],
              plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                  clicksToEdit: 1
                })
                ]
          }
        });

        PFRequest.get('/condition/template/getConditionTemplate.json', {'conditionCode': record.data.conditionTemplateCode1}, {
          success: function(responseData) {
            if (responseData && responseData['values']) {
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

function condtionValueRelGridDataConvertor(responseData, conditionTemplateType){
    var gridDatas = [];

    if(responseData.conditionTemplateItemList){
        $.each(responseData.conditionTemplateItemList,function(index, condition){
            var data = {};

            $.each(conditionTemplateType, function (idx, type){
                if(type == condition.conditionTemplateType){
                    data.code = condition.conditionTemplate.code;
                    data.name = condition.conditionTemplate.name;
                    data.content = condition.conditionTemplate.content;
                    data.isActive = condition.conditionTemplate.isActive;
                    data.type = condition.conditionTemplateType;

                    gridDatas.push(data);
                }
            });

        });
    }

    return gridDatas;
}