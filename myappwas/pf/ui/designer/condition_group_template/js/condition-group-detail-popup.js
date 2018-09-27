const conditionDetailInfoPopup = getTemplate('conditionDetailInfoPopup');

/**
 * Render Condition Group Detail Information Manager Popup
 * 조건군템플릿 조건관계
 */
function renderConditionGroupDetailInfoManagerPopup(record, cndData, thisRow, index){
  var conditionValueRelGrid;

  record.data.conditionGroupTemplateCode = cndData.code;
  record.data.conditionGroupTemplateName = cndData.name;

  PFComponent.makePopup({
    title: bxMsg('DTE00002_Title')+bxMsg('detailInfo'),
    width: 800,
    contents: conditionDetailInfoPopup(record.data),
    submit: function() {
      // 조건간관계(구성조건)
      var complexData = relationGridDeleteData.concat(relationGrid.getAllData());
      complexData.forEach(function(el, index){
        if(el.process != null) {
          modifyFlag = true;
          return false;               // break
        }
      });
      listMap[previousUniqueSeq]['complexConditionTemplateRelationList'] = complexData; //$.extend(true, {}, complexData);
      record.data.complexConditionTemplateRelationList = complexData; //$.extend(true, {}, complexData);
      selectedGridData[index].complexConditionTemplateRelationList = complexData; //$.extend(true, {}, complexData);

      renderCheckboxOfGrid(relationGrid, thisRow, 7);

      // 기본값
      if(record.data.conditionTemplateType=='01'){  // 목록형
        if(defaultListGrid){
          listMap[previousUniqueSeq]['defaultValue'] = {};
          var gridData = [];

          $.each(defaultListGrid.getAllData(), function(index, row){
            if(row.selectedYn){
              gridData.push(row);
            }
          });

          listMap[previousUniqueSeq]['defaultValue']['selectValues'] = gridData;
          listMap[previousUniqueSeq]['defaultValue']['maxValue'] = null;
          listMap[previousUniqueSeq]['defaultValue']['measurementUnit'] = null;
          listMap[previousUniqueSeq]['defaultValue']['minValue'] = null;
          listMap[previousUniqueSeq]['defaultValue']['process'] = defaultListGridModifyFlag ? 'U' : null;

          record.data.defaultValue = {};
          record.data.defaultValue.selectValues = gridData;
          record.data.defaultValue.maxValue = null;
          record.data.defaultValue.measurementUnit = null;
          record.data.defaultValue.minValue = null;
          record.data.defaultValue.process = defaultListGridModifyFlag ? 'U' : null;

          // 조건템플릿 그리드의 record도 process set
          if(record.data.defaultValue.process != null && record.data.process == null){
            listMap[previousUniqueSeq]['process'] = 'U';
            record.data.process = 'U';
          }

          if(gridData.length == 0){
            record.data.defaultValueYn = false;
            listMap[previousUniqueSeq]['defaultValueYn'] = false;
            $('#'+thisRow.focusedRow.children[8].id).find('img').removeClass('x-grid-checkcolumn-checked');
          }else{
            record.data.defaultValueYn = true;
            listMap[previousUniqueSeq]['defaultValueYn'] = true;
            $('#'+thisRow.focusedRow.children[8].id).find('img').addClass('x-grid-checkcolumn-checked');
          }
        }

      }else{      // 범위형
        if(defaultRangeGrid){
          var defaultRangeGridData ;

          // 수정(내부적으로 D->U) 인 경우, 추가(C)만 한 경우, 수정(U) 한 경우
          if(defaultRangeGrid.getAllData().length > 0){
            defaultRangeGridData = defaultRangeGrid.getAllData()[0];
          }
          // 삭제만 한 경우
          else if(defaultRangeGridDeleteData.length > 0){
            defaultRangeGridData = defaultRangeGridDeleteData[0];
          }

          if(defaultRangeGridData != null){
            listMap[previousUniqueSeq]['defaultValue'] = defaultRangeGridData;
            record.data.defaultValue = defaultRangeGridData;
            record.data.defaultValue.selectValues = null;

            // OHS 20171213 수정 - 조건군템플릿조건템플릿 관계 신규추가후 기본값 추가시에 'U'로 세팅되어 저장되지않는 버그 수정
            /**
                            if(defaultRangeGridData.process != null){
                                modifyFlag = true;
                                listMap[previousUniqueSeq]['process'] = 'U';
                                record.data.process = 'U';
                            }
             */

            if(defaultRangeGridData.process != null) {
              modifyFlag = true;

              // OHS 20171213 수정 - 기존 저장되어서 조회되었던 데이터는 process 가 null 로 세팅되어 'U'로 변경해줌.
              if(listMap[previousUniqueSeq]['process'] == null || record.data.process == null) {
                listMap[previousUniqueSeq]['process'] = 'U';
                record.data.process = 'U';                            		
              }
            }
          }else{
            listMap[previousUniqueSeq]['defaultValue'] = null;
          }

          //if(record.data.defaultValue && record.data.defaultValue.process != null && record.data.process == null){
          //    listMap[previousUniqueSeq]['process'] = 'U';
          //    record.data.process = defaultListGridModifyFlag ? 'U' : null;
          //}

          renderCheckboxOfGrid(defaultRangeGrid, thisRow, 8);
        }
      }

      // 조건값간관계
      if(conditionValueRelGrid){
        var betweenConditionTemplateValueRelationList = conditionValueRelGridDeleteData.concat(conditionValueRelGrid.getAllData());
        listMap[previousUniqueSeq]['betweenConditionTemplateValueRelationList']=betweenConditionTemplateValueRelationList;
        record.data.betweenConditionTemplateValueRelationList = betweenConditionTemplateValueRelationList;

        betweenConditionTemplateValueRelationList.forEach(function(el, index){
          if(el.process != null) {
            modifyFlag = true;
            return false;               // break
          }
        });
      }

    },
    contentsEvent: {
      'click .add-cnd-to-rel-grid-btn': function() {
        var submitEvent = function(chooseCndGrid){
          var selectedData = chooseCndGrid.getAllData();

          if (relationGrid.getAllData().length + selectedData.length > 9) {
            PFComponent.showMessage(bxMsg('noMore9Rel'), 'warning');
            return;
          }

          if(typeof listMap[previousUniqueSeq]['complexConditionTemplateRelationList'] !== 'array') {
            listMap[previousUniqueSeq]['complexConditionTemplateRelationList'] = [];
          }

          selectedData.forEach(function(el) {
            var code = el.code;
            el['conditionTemplateCode'] = code;
            el['conditionTemplateName'] = el.name;
            el['relationType'] = '01';
            el['process'] = 'C';

            delete el['content'];
            delete el['code'];
            delete el['name'];
            delete el['type'];
            delete el['typeNm'];

            el.applyStart = PFUtil.getToday() + ' 00:00:00';
            el.applyEnd = record.data.applyEnd;//'9999-12-31 23:59:59'

            if (relationGrid.store.query('conditionTemplateCode', code).items.length == 0) {
              relationGrid.addData(el);
              listMap[previousUniqueSeq]['complexConditionTemplateRelationList'].push(el);
            }
          });
        }
        renderCndToRelAddPopup(submitEvent);
      },
      'click .add-cnd-to-val-rel-grid-btn': function(){
        var defaultData = {};
        defaultData.conditionTemplateCode = record.data.code;
        defaultData.applyStart = PFUtil.getToday() + ' 00:00:00';
        defaultData.applyEnd = record.data.applyEnd;    // 9999-12-31 23:59:59
        defaultData.conditionGroupTemplateCode = cndData.code;
        defaultData.process = 'C';

        conditionValueRelGrid.addData(defaultData);
        listMap[previousUniqueSeq]['betweenConditionTemplateValueRelationList']=conditionValueRelGrid.getAllData();
      },
      'click .add-cnd-to-val-default-rng-grid-btn': function(){
        var defaultData = {};
        if(record.data.conditionTemplate.currentCatalogId === '01'){
          defaultData = {'minValue': '0.00', 'maxValue': '0.00', 'measurementUnit': codeArrayObj['CurrencyCode'][0]['code'], 'process' : 'C'};
        }else if(record.data.conditionTemplate.currentCatalogId === '05'){
          defaultData = {'minValue': '0.00', 'maxValue': '0.00', 'measurementUnit': '11', 'process' : 'C'};
        }else{
          defaultData = {'minValue': '0.00', 'maxValue': '0.00', 'measurementUnit': '14', 'process' : 'C'};
        }
        defaultRangeGrid.addData(defaultData);
        listMap[previousUniqueSeq]['defaultValue'] = defaultRangeGrid.getAllData()[0];
        $('.add-cnd-to-val-default-rng-grid-btn').hide();
      }
    },
    listeners: {
      afterRenderUI: function() {

        var tabs = [];

        switch(record.data.conditionTemplateType){
        case '01' :
        case '02' :
          tabs.push({text:bxMsg('conditionToConditionRelation'), value:null, index:1});
          tabs.push({text:bxMsg('defaultValue'),value:null, index:2});
          tabs.push({text:bxMsg('conditionValueRelation'),value:null, index:3});
          break;
        case '03' :
          tabs.push({text:bxMsg('conditionToConditionRelation'),value:null, index:1});
          break;
        case '04' :
          tabs.push({text:bxMsg('conditionToConditionRelation'),value:null, index:1});
          break;
        default :
          tabs.push({text:bxMsg('conditionToConditionRelation'),value:null, index:1});
        tabs.push({text:bxMsg('defaultValue'),value:null, index:2});
        break;
        }

        PFUI.use('pfui/tab',function(Tab){

          var tab = new Tab.Tab({
            render : '.condition-sub-info-tab',
            elCls : 'nav-tabs',
            autoRender: true,
            children: tabs
          });

          tab.on('selectedchange',function (ev) {
            var item = ev.item;
            $('.condition-sub-info-grid').empty();

            switch(item.get('index')){

            // 조건간관계
            case 1 :
              renderConditionRelationGridTest(listMap[previousUniqueSeq]['complexConditionTemplateRelationList']);

              var $button = '<div style="padding-top: 7px;"></div>' +
              '<header class = "grid-extra-header">' +
              // 아이콘으로변경
              //'<button class="bx-btn bx-btn-small add-cnd-to-rel-grid-btn write-btn">'+bxMsg('ButtonBottomString8')+'</button>' +
              '<button type="button" class="bw-btn add-cnd-to-rel-grid-btn write-btn" icon-tooltip=' + bxMsg("ButtonBottomString8") +'>' +
              '<i class="bw-icon i-25 i-func-add"></i> </button>' +
              '</header>';

              $('.condition-sub-info-grid').prepend($button);

              break;

              // 기본값
            case 2 :
              var $button = '<div style="padding-top: 7px;"></div>' +
              '<header class = "grid-extra-header">' +
              '</header>';

              if(record.data.conditionTemplateType=='01'){
                var param = {'conditionCode': record.get('code')};
                PFRequest.get('/condition/template/getConditionTemplate.json',param,{
                  success: function(responseData){
                    if(record.data.defaultValue && listMap[previousUniqueSeq]['defaultValue']){
                      renderBaseListValGridTest(responseData['values'], listMap[previousUniqueSeq]['defaultValue']['selectValues']);
                    }else{
                      renderBaseListValGridTest(responseData['values']);
                    }
                  },
                  bxmHeader: {
                    application: 'PF_Factory',
                    service: 'CndTemplateService',
                    operation: 'queryCndTemplate'
                  }
                });

              }else{
                renderBaseRanValGridTest(listMap[previousUniqueSeq]['defaultValue'], record.data.conditionTemplate.currentCatalogId, record.data.applyStart);
                if(!listMap[previousUniqueSeq]['defaultValue'] || listMap[previousUniqueSeq]['defaultValue']['process'] == 'D') {
                  $button = '<div style="padding-top: 7px;"></div>' +
                  '<header class = "grid-extra-header">' +
                  //'<button class="bx-btn bx-btn-small add-cnd-to-val-default-rng-grid-btn write-btn">' + bxMsg('ButtonBottomString8') + '</button>' +
                  '<button type="button" class="bw-btn add-cnd-to-val-default-rng-grid-btn write-btn" icon-tooltip=' + bxMsg("ButtonBottomString8") + '>' +
                  '<i class="bw-icon i-25 i-func-add"></i>' +
                  '</button>' +
                  '</header>';
                }
              }

              $('.condition-sub-info-grid').prepend($button);

              break;

              // 조건값간관계
            case 3 :
              renderConditionValueRelGrid(record);

              var $button = '<div style="padding-top: 7px;"></div>' +
              '<header class = "grid-extra-header">' +
              // 아이콘으로변경
              '<button type="button" class="bw-btn add-cnd-to-val-rel-grid-btn write-btn" icon-tooltip=' + bxMsg("ButtonBottomString8") + '>' +
              '<i class="bw-icon i-25 i-func-add"></i> </button>' +
              '</header>';

              $('.condition-sub-info-grid').prepend($button);

              break;
            }

            if(writeYn != 'Y'){
              $('.write-btn').hide();
            }
          });

          // 팝업 오픈시 첫번째탭(조건간관계) 활성화
          tab.setSelected(tab.getItemAt(0), 1);

        });
      }
    }
  });


  /**
   * 조건값간관계
   */
  function renderConditionValueRelGrid(cndRecord) {
    var conditionGroupTemplateCode;
    var columns = [];

    if (cndRecord.data.conditionTemplateType == '01') { // 목록형
      var requestParam = {
          conditionCode: cndRecord.data.code,
          conditionTypeCode: cndRecord.data.conditionTemplateType
      }

      // 콤보 바인딩을 위한 조회
      PFRequest.get('/condition/template/getConditionTemplate.json', requestParam, {
        success: function (responseData) {

          var listComboArray = [];
          var listComboObj = {};

          $.each(responseData.values, function (index, listItem) {

            var listArr = {};
            var listObj = {};

            listArr.code = listItem.key;
            listArr.name = listItem.value;

            listObj[listItem.key] = listItem.value;

            listComboArray.push(listArr);
            listComboObj = $.extend(listComboObj, listObj);
          });

          combo = {
              text: bxMsg('DPS0129String4'), dataIndex: 'key', align: 'center', sortable: false, flex:1,
              renderer: function (value) {
                return listComboObj[value];
              },
              editor: {
                xtype: 'combo',
                typeAhead: true,
                triggerAction: 'all',
                displayField: 'name',
                valueField: 'code',
                editable: false,
                store: new Ext.data.Store({
                  fields: ['name', 'code'],
                  data: listComboArray
                }),
                listeners: {
                  'change': function (_this, newValue, oldValue, eOpts) {
                    modifyFlag = true;
                  }
                }
              }
          }

          columns.push(combo);

          renderGrid(cndRecord.data.conditionTemplateType);       // 그리드 호출
        },
        bxmHeader: {
          application: 'PF_Factory',
          service: 'CndTemplateService',
          operation: 'queryCndTemplate'
        }
      });
    }else { // 범위형
      //columns.push({text: bxMsg('DPS0129String4'), dataIndex: 'value', align: 'center', sortable: false, flex:1});
      renderGrid(cndRecord.data.conditionTemplateType);
    }

    /**
     *
     * @param maincndTmpltType : 조건유형별 조건값간관계코드 분기를위해 입력받음.
     */
    function renderGrid(maincndTmpltType) {
      // OHS 20161026 조건유형별 조건값간관계코드 dynamic 조립
      //columns.push(makeComboOfGrid(bxMsg('valueRelationTypeCode'), 'width', 120, 'relationType', 'ConditionValueBtweenTypeCode'));
      columns.push(makeComboOfGridForBtwnCndValue(bxMsg('valueRelationTypeCode'), 'width', 120, 'relationType', 'ConditionValueBtweenTypeCode', maincndTmpltType));
      columns.push({text: bxMsg('MTM0200String1'), flex: 1, dataIndex: 'conditionGroupTemplateCode1'});
      columns.push({text: bxMsg('DPP0128String2'), flex: 1, dataIndex: 'conditionTemplateCode1'});
      columns.push({text: bxMsg('DPS0129String4'), flex: 1, dataIndex: 'value1'});//, editor: {allowBlank: false}});
      columns.push({
        text: bxMsg('PAS0202String19'), width: 100, dataIndex: 'applyStartDate',
        editor: {
          allowBlank: true,
          listeners: {
            focus: function (_this) {
              var isNextDay = true;
              if(getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                isNextDay = false;
              }
              PFUtil.getGridDatePicker(_this, 'applyStart', conditionValueRelGrid, selectedCellIndex, isNextDay, true);
            }
          }
        },
        listeners: {
          click: function () {
            selectedCellIndex = $(arguments[1]).parent().index();
          }
        }
      });
      columns.push({
        text: bxMsg('PAS0202String20'), width: 100, dataIndex: 'applyEndDate',
        editor: {
          allowBlank: true,
          listeners: {
            focus: function (_this) {
              var isNextDay = true;
              if(getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                isNextDay = false;
              }
              PFUtil.getGridDatePicker(_this, 'applyEnd', conditionValueRelGrid, selectedCellIndex, isNextDay, true);
            }
          }
        },
        listeners: {
          click: function () {
            selectedCellIndex = $(arguments[1]).parent().index();
          }
        }
      });
      columns.push({
        xtype: 'actioncolumn', width: 35, align: 'center',
        items: [{
          icon: '/images/x-delete-16.png',
          handler: function (grid, rowIndex, colIndex, item, e, record) {

            if( record.data.process != 'C' &&
                selectedConditionGroup.isActive == 'Y' &&                                            // 활동상태이고
                (getSelectedProjectId() == "" || (getSelectedProjectId() && !isEmergency(getSelectedProjectId()) && !isUpdateStatus(getSelectedProjectId())) ) && // emergency도 아니고 상품정보수정도 아니고
                PFUtil.compareDateTime(record.data.applyStartDate, PFUtil.getNextDate()) == 1 ){    // 과거일자이면 (record.data.applyStartDate < PFUtil.getNextDate()
              PFComponent.showMessage(bxMsg('dontDeleteActiveTypeConditionTemplate'), 'warning');
              return;
            }

            if(record.data.process != 'C'){
              record.data.process = 'D';
              conditionValueRelGridDeleteData.push(record.data);
            }

            record.destroy();
            listMap[previousUniqueSeq]['betweenConditionTemplateValueRelationList']=conditionValueRelGrid.getAllData();
            modifyFlag = true;
          }
        }]
      });

      conditionValueRelGrid = PFComponent.makeExtJSGrid({
        fields: [
          'value', 'key', 'applyStart', 'applyEnd', 'conditionGroupTemplateCode',
          'conditionTemplateCode', 'relationType', 'conditionTemplateCode1', 'key1', 'conditionGroupTemplateCode1',
          'conditionGroupTemplateName1', 'conditionTemplateName1', 'value1',
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
          },
          'process'
          ],
          gridConfig: {
            renderTo: '.condition-sub-info-grid',
            columns: columns,
            plugins: [
              Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1,
                listeners: {
                  afteredit: function(e, editor){
                    if(editor.originalValue !=  editor.value){
                      if(editor.field != 'applyEndDate' && (editor.record.get('process') == null || editor.record.get('process').length == 0)) {
                        var originalData = $.extend(true, {}, editor.record.data);
                        originalData[editor.field] = editor.record.modified[editor.field];
                        if(editor.field == 'applyStartDate'){
                          originalData['applyStart'] = editor.record.modified[editor.field] + ' 00:00:00';
                        }
                        originalData['process'] = 'D';
                        relationGridDeleteData.push(originalData);

                        editor.record.set('process', 'C');
                      }else if(editor.record.get('process') != 'C'){
                        editor.record.set('process', 'U');
                      }
                      listMap[previousUniqueSeq]['betweenConditionTemplateValueRelationList']=conditionValueRelGrid.getAllData();
                    }
                  },
                  beforeedit:function(e, editor){
                    if( selectedConditionGroup.isActive == 'N' ||                                 // 비활동인 경우
                        editor.record.data.process == 'C' ||                                      // 새로 추가된 row인 경우
                        (getSelectedProjectId() && isEmergency(getSelectedProjectId()))    ||     // emergency 인 경우
                        (getSelectedProjectId() && isUpdateStatus(getSelectedProjectId())) ){     // 상품정보 수정인 경우
                      // 모두 수정가능
                    }
                    else if(editor.field != 'applyEndDate') {
                      return false;
                    }
                  }
                }
              })
              ],
              listeners: {
                cellclick: function (_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {

                  if (cndRecord.data.conditionTemplateType == '01') {
                    cellIndex--;
                  }
                  switch (cellIndex) {
                  case 1:         // 조건군템플릿코드
                    PFPopup.selectConditionGroupTemplate({}, function (selectedData) {
                      // 2018.01.22 Single select로 변경.
                      /*if(selectedList.length > 1){
                                                PFComponent.showMessage(bxMsg('ConditionGroupMultiSelectError'), 'warning');
                                            }else if(selectedList.length == 1) */
                      $(td).find('div').text(selectedData.code);
                      record.data.conditionGroupTemplateCode1 = selectedData.code;
                      conditionGroupTemplateCode = selectedData.code;

                      // 조건군템플릿코드를 선택한경우 조건코드, 조건값을 초기화
                      conditionValueRelGrid.store.getAt(rowIndex).set('conditionTemplateCode1', '');
                      conditionValueRelGrid.store.getAt(rowIndex).set('key1', '');
                      conditionValueRelGrid.store.getAt(rowIndex).set('value1', '');

                      modifyFlag = true;
                    });
                    break;
                  case 2:                 // 조건코드
                    if (record.data.conditionGroupTemplateCode1) {
                      var submitEvent = function (cndPopupGrid) {
                        var selectedItem = cndPopupGrid.getSelectedItem()[0];
                        if(!selectedItem) return;

                        setConditionCodeOfConditionValueRelGrid(selectedItem, td, record);

                        conditionValueRelGrid.store.getAt(rowIndex).set('key1', '');
                        conditionValueRelGrid.store.getAt(rowIndex).set('value1', '');
                      }
                      record.conditionTemplateType = cndRecord.data.conditionTemplateType;    // 조건유형코드
                      renderCndToRelAddPopup2(submitEvent, record);
                    } else {
                      PFComponent.showMessage(bxMsg('conditionValueRelGridSelectConditionValueFirst'), 'warning');
                    }
                    break;
                  case 3:                 // 조건값
                    if (record.data.conditionTemplateType1 == '02'){
                      break;
                    }

                    // OHS 20161026 수정, 조건유형코드가 01일때만 오는 제약을 풀어버림.

                    //else if (cndRecord.data.conditionTemplateType == '01' &&
                    //    record.data.conditionGroupTemplateCode1) {

                    else if (record.data.conditionGroupTemplateCode1) {
                      if (record.data.conditionTemplateCode1) {
                        renderConditionValueListPopup(td, record);
                      } else {
                        PFComponent.showMessage(bxMsg('conditionValueRelGridSelectConditionCodeFirst'), 'warning');
                      }
                    } else {
                      PFComponent.showMessage(bxMsg('conditionValueRelGridSelectConditionValueFirst'), 'warning');
                    }
                    break;
                  }

                }
              }
          }
      });
      if(cndRecord.raw.betweenConditionTemplateValueRelationList) {
        var conditionValueRelGridData = [];
        cndRecord.raw.betweenConditionTemplateValueRelationList.forEach(function(el, index){
          if(el.process != 'D') {
            conditionValueRelGridData.push(el);
          }
        });
        conditionValueRelGrid.setData(conditionValueRelGridData);
      }
    }

    function setConditionCodeOfConditionValueRelGrid(selectedItem, td, record){
      $(td).find('div').text(selectedItem.code);
      record.data.conditionTemplateCode1 = selectedItem.code;
      record.data.conditionGroupTemplateName1 = selectedItem.value;
      record.data.conditionTemplateType1 = selectedItem.type;
    }


  }

}

function renderCheckboxOfGrid(grid, thisRow, index){
  if(grid.getAllData().length == 0){
    $('#'+thisRow.focusedRow.children[index].id).find('img').removeClass('x-grid-checkcolumn-checked');
    if(index == 8) cndGrid.store.getAt(thisRow.focusedRow.rowIndex).raw.defaultValueYn = false;
  }else{
    $('#'+thisRow.focusedRow.children[index].id).find('img').addClass('x-grid-checkcolumn-checked');
    if(index == 8) cndGrid.store.getAt(thisRow.focusedRow.rowIndex).raw.defaultValueYn = true;
  }
}

/**
 * Render Condition Relation Grid Test
 * 조건선택팝업 조건간관계 그리드
 */
function renderConditionRelationGridTest(data, cndTp) {
  var relationGridData = [];
  if (data){
    data.forEach(function(el,index){
      if(el.process != 'D'){
        relationGridData.push(el);
      }
    });
  }

  relationGrid = PFComponent.makeExtJSGrid({
    fields: ['conditionTemplateCode', 'conditionTemplateName', 'applyStart', 'applyEnd', 'relationType', 'process',
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
        renderTo: '.condition-sub-info-grid',
        columns: [
          makeComboOfGrid(bxMsg('conditionToConditionRelation'), 'flex', 1, 'relationType', 'BetweenConditionRelationTypeCode'),
          //{text: bxMsg('conditionToConditionRelation'), flex:1, dataIndex: 'relationType'},
          {text: bxMsg('MTM0200String4'), flex:1, dataIndex: 'conditionTemplateCode'},
          {text: bxMsg('MTM0200String5'), flex:3, dataIndex: 'conditionTemplateName'},
          {text: bxMsg('DPP0127String6'), width:100, dataIndex: 'applyStartDate',
            editor: {
              allowBlank: false,
              listeners: {
                focus: function(_this) {
                  var isNextDay = true;
                  if(getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                    isNextDay = false;
                  }
                  PFUtil.getGridDatePicker(_this, 'applyStart', relationGrid, selectedCellIndex, isNextDay, true);
                }
              }
            },
            listeners: {
              click: function() {
                selectedCellIndex = $(arguments[1]).parent().index();
              }
            }
          },
          {text: bxMsg('DPP0127String7'), width:100, dataIndex: 'applyEndDate',
            editor: {
              allowBlank: false,
              listeners: {
                focus: function(_this) {
                  var isNextDay = true;
                  if(getSelectedProjectId() && (isEmergency(getSelectedProjectId()) || isUpdateStatus(getSelectedProjectId()))){
                    isNextDay = false;
                  }
                  PFUtil.getGridDatePicker(_this, 'applyEnd', relationGrid, selectedCellIndex, isNextDay, true);
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
            xtype: 'actioncolumn', width: 35, align: 'center',
            items: [{
              icon: '/images/x-delete-16.png',
              handler: function (grid, rowIndex, colIndex, item, e, record) {

                if( record.data.process != 'C' &&
                    selectedConditionGroup.isActive == 'Y' &&                                            // 활동상태이고
                    (getSelectedProjectId() == "" || (getSelectedProjectId() && !isEmergency(getSelectedProjectId()) && !isUpdateStatus(getSelectedProjectId())) ) && // emergency도 아니고 상품정보수정도 아니고
                    PFUtil.compareDateTime(record.data.applyStartDate, PFUtil.getNextDate()) == 1 ){    // 과거일자이면 (record.data.applyStartDate < PFUtil.getNextDate()
                  PFComponent.showMessage(bxMsg('dontDeleteActiveTypeConditionTemplate'), 'warning');
                  return;
                }

                if(record.data.process != 'C'){
                  record.data.process = 'D';
                  relationGridDeleteData.push(record.data);
                }

                record.destroy();
                listMap[previousUniqueSeq]['complexConditionTemplateRelationList'] = relationGrid.getAllData();
                modifyFlag = true;
              }
            }]
          }
          ],
          plugins: [
            Ext.create('Ext.grid.plugin.CellEditing', {
              clicksToEdit: 1,
              listeners : {
                afteredit: function(e, editor){
                  if(editor.originalValue !=  editor.value){
                    if(editor.field != 'applyEndDate' && (editor.record.get('process') == null || editor.record.get('process').length == 0)) {
                      var originalData = $.extend(true, {}, editor.record.data);
                      originalData[editor.field] = editor.record.modified[editor.field];
                      if(editor.field == 'applyStartDate'){
                        originalData['applyStart'] = editor.record.modified[editor.field] + ' 00:00:00';
                      }
                      originalData['process'] = 'D';
                      relationGridDeleteData.push(originalData);

                      editor.record.set('process', 'C');
                    }else if(editor.record.get('process') != 'C'){
                      editor.record.set('process', 'U');
                    }
                    listMap[previousUniqueSeq]['complexConditionTemplateRelationList'] = relationGrid.getAllData();
                  }
                },
                beforeedit:function(e, editor){
                  if( selectedConditionGroup.isActive == 'N' ||                                 // 비활동인 경우
                      editor.record.data.process == 'C' ||                                      // 새로 추가된 row인 경우
                      (getSelectedProjectId() && isEmergency(getSelectedProjectId()))    ||     // emergency 인 경우
                      (getSelectedProjectId() && isUpdateStatus(getSelectedProjectId())) ){     // 상품정보 수정인 경우

                    if(editor.field != 'applyStartDate' && editor.field != 'applyEndDate'){
                      return false;
                    }
                  }
                  else if(editor.field != 'applyEndDate') {
                    return false;
                  }
                }
              }
            })
            ]
      }
  });

  relationGrid.setData(relationGridData);
}

function renderBaseListValGridTest(defaultList, selectedData) {
  //$el.find('.pf-dcg-base-list-val-grid-wrap').addClass('sub-grid-active');
  //$el.find('.pf-dcg-base-list-val-grid').empty();

  var defaultListMap = {};

  defaultList.forEach(function(el){
    defaultListMap[el.key] = el;
  });

  if (selectedData) {
    selectedData.forEach(function(el) {
      if (defaultListMap[el.key]) {
        defaultListMap[el.key]['selectedYn'] = true;
      }
    });
  }

  defaultListGrid = PFComponent.makeExtJSGrid({
    fields: ['key', 'value', 'selectedYn', 'process'],
    gridConfig: {
      renderTo: '.condition-sub-info-grid',
      columns: [
        {xtype: 'checkcolumn', text: bxMsg('DPS0121_21String4'), width: 90, dataIndex: 'selectedYn',listeners: {
          checkchange: function(column, rowIndex, checked, eOpts){
            var gridData = [];

            $.each(defaultListGrid.getAllData(), function(index, row){
              if(row.selectedYn){
                gridData.push(row);
              }
            });

            if(listMap[previousUniqueSeq]['defaultValue'] == null){
              listMap[previousUniqueSeq]['defaultValue'] = {};
            }
            listMap[previousUniqueSeq]['defaultValue']['selectValues'] = gridData;

            defaultListGridModifyFlag = true;
            modifyFlag = true;
          }
        }},
        {text: bxMsg('DPS0126String25'), flex: 3, dataIndex: 'key'},
        {text: bxMsg('DPS0126String26'), flex: 5, dataIndex: 'value'}
        ],
        plugins: [
          Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
          })
          ]
    }
  });
  defaultListGrid.setData(defaultList);

}

function renderBaseRanValGridTest(data, currentCatalogId, startDt) {
  var comboData, comboMap;

  //$el.find('.pf-dcg-base-val-grid-wrap').addClass('sub-grid-active');
  //$el.find('.pf-dcg-base-val-grid').empty();

  if (currentCatalogId === '01') {
    comboData = codeArrayObj['CurrencyCode'];
    comboMap = codeMapObj['CurrencyCode'];

  } else if (currentCatalogId === '05') {
    comboData = [];
    comboMap = {};

    codeArrayObj['ProductMeasurementUnitCode'].forEach(function(el) {
      if (el.code === '11' || el.code === '12') {
        comboData.push(el);
        comboMap[el.code] = el.name;
      }
    });

  } else {
    comboData = codeArrayObj['ProductMeasurementUnitCode'];
    comboMap = codeMapObj['ProductMeasurementUnitCode'];
  }

  var dataArray = [];

  if(data && data.process != 'D') {
    dataArray.push(data);
  }

  defaultRangeGrid = PFComponent.makeExtJSGrid({
    fields: ['process', 'measurementUnit', {
      name: 'minValue',
      convert: function (newValue, record) {
        var minValue;
        var isNegativeNumber = newValue.substr(0,1) == '-';

        if (newValue) {
          var inputVal = newValue.split('.'),
          cutInt = (inputVal[0]) ? inputVal[0] : 0,
              cutDec = (inputVal[1]) ? inputVal[1] : '',
                  val,
                  i = 0;

              if (parseFloat(newValue) == '0') {
                var decimalString = '';
                for (i = 0; i < 2; i++) {
                  decimalString = decimalString + '0';
                }
                val = '0' + '.' + decimalString;
              } else {
                if (cutInt.length < 17) {
                  cutInt = parseInt(cutInt) + '';
                } else if (cutInt.length == 17 && cutInt.substr(0, 1) == '0') {
                  cutInt = parseInt(cutInt) + '';
                }

                if (cutDec != '') {
                  var decimalLength = cutDec.length;
                  for (i = 0; i < 2 - decimalLength; i++) {
                    cutDec = cutDec + '0';
                  }
                } else {
                  for (i = 0; i < 2; i++) {
                    cutDec = cutDec + '0';
                  }
                }

                val = cutInt + '.' + cutDec;
              }

              minValue = val;

        } else {
          minValue = record.get('minValue');
        }

        if(isNegativeNumber && cutInt == 0){
          minValue = parseFloat('-' + minValue) + '';
          if(minValue == '-0'){
            minValue = '0.00';
          }
        }

        if(cutInt == 'NaN'){
          minValue = '0.00'
        }

        return minValue;
      }
    }, {
      name: 'maxValue',
      convert: function (newValue, record) {
        var maxValue;
        var isNegativeNumber = newValue.substr(0,1) == '-';

        if (newValue) {
          var inputVal = newValue.split('.'),
          cutInt = (inputVal[0]) ? inputVal[0] : 0,
              cutDec = (inputVal[1]) ? inputVal[1] : '',
                  val,
                  i = 0;

              if (parseFloat(newValue) == '0') {
                var decimalString = '';
                for (i = 0; i < 2; i++) {
                  decimalString = decimalString + '0';
                }
                val = '0' + '.' + decimalString;
              } else {
                if (cutInt.length < 17) {
                  cutInt = parseInt(cutInt) + '';
                } else if (cutInt.length == 17 && cutInt.substr(0, 1) == '0') {
                  cutInt = parseInt(cutInt) + '';
                }

                if (cutDec != '') {
                  var decimalLength = cutDec.length;
                  for (i = 0; i < 2 - decimalLength; i++) {
                    cutDec = cutDec + '0';
                  }
                } else {
                  for (i = 0; i < 2; i++) {
                    cutDec = cutDec + '0';
                  }
                }

                val = cutInt + '.' + cutDec;
              }

              maxValue = val;

        } else {
          maxValue = record.get('maxValue');
        }

        if(isNegativeNumber && cutInt == 0){
          maxValue = parseFloat('-' + maxValue) + '';
          if(maxValue == '-0'){
            maxValue = '0.00';
          }
        }

        if(cutInt == 'NaN'){
          maxValue = '0.00'
        }

        return maxValue;
      }
    }],
    gridConfig: {
      renderTo: '.condition-sub-info-grid',
      columns: [
        {
          text: bxMsg('DPS0121_1String1'), flex: 1, dataIndex: 'minValue',
          renderer: function (value, metadata, record) {
            if(currentCatalogId == '01' || currentCatalogId == '04' || currentCatalogId =='05'){
              return PFValidation.gridFloatCheckRendererForRangeType(value, 19, 2);
            }else{
              return PFValidation.gridFloatCheckRenderer(value, 19, 2);
            }
          },
          editor: {
            xtype: 'textfield',
            allowBlank: false,
            selectOnFocus: true,
            listeners: {
              'render': function (cmp) {
                cmp.getEl()
                .on('keydown', function (e) {
                  if(currentCatalogId == '01' || currentCatalogId == '04' || currentCatalogId =='05'){
                    PFValidation.gridFloatCheckKeydownForRangeType(e, 19, 2);
                  }else{
                    PFValidation.gridFloatCheckKeydown(e, 19, 2);
                  }
                })
                .on('keyup', function (e) {
                  if(currentCatalogId == '01' || currentCatalogId == '04' || currentCatalogId =='05'){
                    PFValidation.gridFloatCheckKeyupForRangeType(e, 19, 2);
                  }else{
                    PFValidation.gridFloatCheckKeyup(e, 19, 2);
                  }
                })
              }
            }
          }
        },
        {
          text: bxMsg('DPS0121_1String2'), flex: 1, dataIndex: 'maxValue',
          renderer: function (value, metadata, record) {
            if(currentCatalogId == '01' || currentCatalogId == '04' || currentCatalogId =='05'){
              return PFValidation.gridFloatCheckRendererForRangeType(value, 19, 2);
            }else{
              return PFValidation.gridFloatCheckRenderer(value, 19, 2);
            }
          },
          editor: {
            xtype: 'textfield',
            allowBlank: false,
            selectOnFocus: true,
            listeners: {
              'render': function (cmp) {
                cmp.getEl()
                .on('keydown', function (e) {
                  if(currentCatalogId == '01' || currentCatalogId == '04' || currentCatalogId =='05'){
                    PFValidation.gridFloatCheckKeydownForRangeType(e, 19, 2);
                  }else{
                    PFValidation.gridFloatCheckKeydown(e, 19, 2);
                  }
                })
                .on('keyup', function (e) {
                  if(currentCatalogId == '01' || currentCatalogId == '04' || currentCatalogId =='05'){
                    PFValidation.gridFloatCheckKeyupForRangeType(e, 19, 2);
                  }else{
                    PFValidation.gridFloatCheckKeyup(e, 19, 2);
                  }
                })
              }
            }
          }
        },
        {
          text: currentCatalogId=='01' ? bxMsg('currencyCode') : bxMsg('DPS0121_1String5'),
              flex: 1, dataIndex: 'measurementUnit',
              renderer: function (value) {
                return comboMap[value] || value;
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
                  data: comboData
                })
              }
        },
        {
          xtype: 'actioncolumn', width: 35, align: 'center',
          items: [{
            icon: '/images/x-delete-16.png',
            handler: function (grid, rowIndex, colIndex, item, e, record) {

              /**
               * OHS 20171213 주석처리 - 목록 기본값과 동일하게 체크하지 않음.
                                if( record.data.process != 'C' &&
                                    selectedConditionGroup.isActive == 'Y' &&                                          // 활동상태이고
                                    (getSelectedProjectId() == "" || (getSelectedProjectId() && !isEmergency(getSelectedProjectId()) && !isUpdateStatus(getSelectedProjectId())) ) ){  // emergency도 아니고 상품정보수정도 아니고
                                    PFComponent.showMessage(bxMsg('dontDeleteActiveTypeConditionTemplate'), 'warning');
                                    return;
                                }
               */

              if(record.data.process != 'C'){
                record.data.process = 'D';
                defaultRangeGridDeleteData.push(record.data);
              }

              listMap[previousUniqueSeq]['defaultValue'] = record.data;   //defaultRangeGrid.getAllData()[0];
              record.destroy();

              // OHS 20171213 수정 - element index 지정
              //$('.add-cnd-to-val-default-rng-grid-btn').show();
              $('.add-cnd-to-val-default-rng-grid-btn').eq(0).show();
              modifyFlag = true;
            }
          }]
        }
        ],
        plugins: [
          Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1,
            listeners : {
              afteredit: function(e, editor){
                if(editor.originalValue !=  editor.value){
                  if(editor.field == 'measurementUnit' && (editor.record.get('process') == null || editor.record.get('process').length == 0)){
                    var originalData = $.extend(true, {}, editor.record.data);
                    originalData[editor.field] = editor.record.modified[editor.field];
                    originalData['process'] = 'D';
                    defaultRangeGridDeleteData.push(originalData);
                    editor.record.set('process', 'C');
                  }else if(editor.record.get('process') != 'C'){
                    editor.record.set('process', 'U');
                  }
                  listMap[previousUniqueSeq]['defaultValue'] = defaultRangeGrid.getAllData()[0];
                }
              },
              beforeedit:function(e, editor){
                if( selectedConditionGroup.isActive == 'N'||                                // 비활동인 경우
                    editor.record.data.process == 'C' ||                                      // 새로 생성한 row인 경우
                    PFUtil.compareDateTime(startDt, PFUtil.getNextDate()) >= 0 ||
                    (getSelectedProjectId() && isEmergency(getSelectedProjectId()))    ||     // emergency 인 경우
                    (getSelectedProjectId() && isUpdateStatus(getSelectedProjectId())) ){     // 상품정보 수정인 경우
                  // 모두 수정가능
                }
                else { // 조건군템플릿이 활성 상태이면 수정 불가
                  return false;
                }
              }
            }
          })
          ]
    }
  });
  defaultRangeGrid.setData(dataArray);

}