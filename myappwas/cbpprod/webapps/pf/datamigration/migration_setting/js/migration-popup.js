/******************************************************************************************************************
 * 데이터이행단계 설정 상세 팝업
 ******************************************************************************************************************/
function renderMigrationStepConfigDetailPopup(data){
  const migrationStepDetailPopupTpl = getTemplate('migrationStepDetailPopupTpl');
  var buttons = [];
  var migrationStepTableListGrid;

  if(data && data.work == "CREATE") {
    buttons = [
      // 저장 버튼
      {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn',handler:function(){
        var that = this;
        if(!$('.migration-step-name').val()){
          // 이행단계명은 필수입력값 입니다.
          PFComponent.showMessage(bxMsg('stepNameIsMandatory'), 'warning');
          return;
        }
        if(!$('.execute-seq').val() || $('.execute-seq').val() <= 0) {
          // 수행순서를 0으로 입력할 수 없습니다.
          PFComponent.showMessage(bxMsg('executeSeqMinCheck'), 'warning');
          return;
        }
        if(!migrationStepTableListGrid.getAllData() || migrationStepTableListGrid.getAllData().length <= 0) {
          // 이행단계별 이행테이블은 필수입력값입니다.
          PFComponent.showMessage(bxMsg('dataMigrationTableIsMandatory'), 'warning');
          return;
        }

        var duplicateFlag = false;
        var duplicateExecuteSeqFlag = false;
        var zeroExecuteCount = 0;

        for(var i = 0; i < migrationStepTableListGrid.getAllData().length; i++) {
          var duplicateCount = 0;
          var duplicateExecuteSeqCount = 0;

          for(var j = 0; j < migrationStepTableListGrid.getAllData().length; j++) {
            if(migrationStepTableListGrid.getAllData()[i].migrationTableName
                == migrationStepTableListGrid.getAllData()[j].migrationTableName) {
              duplicateCount++;
            }

            // 수행순서 중복 체크
            if(migrationStepTableListGrid.getAllData()[i].executeSeq
                == migrationStepTableListGrid.getAllData()[j].executeSeq) {
              duplicateExecuteSeqCount++;
            }


          }
          if(duplicateCount > 1) {
            duplicateFlag = true;
          }
          if(duplicateExecuteSeqCount > 1) {
            duplicateExecuteSeqFlag = true;
          }

          // 수행순서는 최소 1이상 입력해야함. 0으로 입력 불가
          if(migrationStepTableListGrid.getAllData()[i].executeSeq <= 0) {
            zeroExecuteCount++;
          }
        }
        if(duplicateFlag) {
          // 중복된 이행대상 테이블이 존재합니다.
          PFComponent.showMessage(bxMsg('migrationDuplicateTable'), 'warning');
          return;
        }
        if(zeroExecuteCount > 0) {
          // 수행순서를 0으로 입력할 수 없습니다.
          PFComponent.showMessage(bxMsg('executeSeqMinCheck'), 'warning');
          return;
        }
        if(duplicateExecuteSeqFlag) {
          // 수행순서를 동일하게 저장할 수 없습니다.
          PFComponent.showMessage(bxMsg('migrationDuplicateExecSeq'), 'warning');
          return;
        }

        var requestData = {
            "migrationStepNm" : $('.migration-step-name').val(),
            "executeSeq" : $('.execute-seq').val()
        };
        requestData.migrationStepTableList = migrationStepTableListGrid.getAllData();

        PFRequest.post('/migrationstep/saveMigrationStepInfo.json',requestData,{
          success: function(){
            PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
            searchMigrationStepList();
            that.close();
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'MigrationStepService',
            operation: 'saveMigrationStepInfo'
          }
        });
      }},
      // 닫기 버튼
      {text:bxMsg('ContextMenu_Close'), elCls:'button button-primary',handler:function(){
        this.close();
      }}
      ]
  }else if (data && data.work == "UPDATE") {
    buttons = [
      // 저장 버튼
      {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn',handler:function(){
        var that = this;
        if(!$('.migration-step-id').val()){
          // 데이터이행단계ID는 필수입력값 입니다.
          PFComponent.showMessage(bxMsg('dataMigStepIdIsMandatory'), 'warning');
          return;
        }
        if(!$('.migration-step-name').val()){
          // 이행단계명은 필수입력값 입니다.
          PFComponent.showMessage(bxMsg('stepNameIsMandatory'), 'warning');
          return;
        }
        if(!$('.execute-seq').val() || $('.execute-seq').val() <= 0) {
          // 수행순서를 0으로 입력할 수 없습니다.
          PFComponent.showMessage(bxMsg('executeSeqMinCheck'), 'warning');
          return;
        }
        if(!migrationStepTableListGrid.getAllData() || migrationStepTableListGrid.getAllData().length <= 0) {
          // 이행단계별 이행테이블은 필수입력값입니다.
          PFComponent.showMessage(bxMsg('dataMigrationTableIsMandatory'), 'warning');
          return;
        }

        var duplicateFlag = false;
        var duplicateExecuteSeqFlag = false;
        var zeroExecuteCount = 0;

        for(var i = 0; i < migrationStepTableListGrid.getAllData().length; i++) {
          var duplicateCount = 0;
          var duplicateExecuteSeqCount = 0;

          for(var j = 0; j < migrationStepTableListGrid.getAllData().length; j++) {
            if(migrationStepTableListGrid.getAllData()[i].migrationTableName
                == migrationStepTableListGrid.getAllData()[j].migrationTableName) {
              duplicateCount++;
            }

            // 수행순서 중복 체크
            if(migrationStepTableListGrid.getAllData()[i].executeSeq
                == migrationStepTableListGrid.getAllData()[j].executeSeq) {
              duplicateExecuteSeqCount++;
            }


          }
          if(duplicateCount > 1) {
            duplicateFlag = true;
          }
          if(duplicateExecuteSeqCount > 1) {
            duplicateExecuteSeqFlag = true;
          }

          // 수행순서는 최소 1이상 입력해야함. 0으로 입력 불가
          if(migrationStepTableListGrid.getAllData()[i].executeSeq <= 0) {
            zeroExecuteCount++;
          }
        }
        if(duplicateFlag) {
          // 중복된 이행대상 테이블이 존재합니다.
          PFComponent.showMessage(bxMsg('migrationDuplicateTable'), 'warning');
          return;
        }
        if(zeroExecuteCount > 0) {
          // 수행순서를 0으로 입력할 수 없습니다.
          PFComponent.showMessage(bxMsg('executeSeqMinCheck'), 'warning');
          return;
        }
        if(duplicateExecuteSeqFlag) {
          // 수행순서를 동일하게 저장할 수 없습니다.
          PFComponent.showMessage(bxMsg('migrationDuplicateExecSeq'), 'warning');
          return;
        }

        var requestData = {
            "migrationStepId" : $('.migration-step-id').val(),
            "migrationStepNm" : $('.migration-step-name').val(),
            "executeSeq" : $('.execute-seq').val()
        }
        requestData.migrationStepTableList = migrationStepTableListGrid.getAllData();

        PFRequest.post('/migrationstep/saveMigrationStepInfo.json',requestData,{
          success: function(){
            PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
            searchMigrationStepList();
            that.close();
          }, bxmHeader: {
            application: 'PF_Factory',
            service: 'MigrationStepService',
            operation: 'saveMigrationStepInfo'
          }
        });
      }},
      // 삭제 버튼
      {text:bxMsg('ButtonBottomString2'), elCls:'button button-primary write-btn',handler:function(){
        var that = this;
        if(!$('.migration-step-id').val()){
          // 데이터이행단계ID는 필수입력값 입니다.
          PFComponent.showMessage(bxMsg('dataMigStepIdIsMandatory'), 'warning');
          return;
        }
        var requestData = {
            "migrationStepId" : $('.migration-step-id').val()
        }
        PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), function() {
          PFRequest.post('/migrationstep/deleteMigrationStepInfo.json',requestData,{
            success:function(){
              PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');
              searchMigrationStepList();
              that.close();
            },
            bxmHeader: {
              application: 'PF_Factory',
              service: 'MigrationStepService',
              operation: 'deleteMigrationStepInfo'
            }
          });
        }, function() {
          return;
        });
      }},
      // 닫기 버튼
      {text:bxMsg('ContextMenu_Close'), elCls:'button button-primary',handler:function(){
        this.close();
      }}
      ]
  }

  // 팝업 호출
  PFComponent.makePopup({
    // 데이터이행설정상세
    title: bxMsg('dataMigrationConfig'),
    contents: migrationStepDetailPopupTpl(data),
    width:700,
    height:400,
    buttons: buttons,
    contentsEvent: {
      // 이행테이블추가
      'click .add-migration-table': function() {
        renderMigrationTableAddPopup(migrationStepTableListGrid);
      }
    },
    listeners: {
      afterRenderUI: function() {
        var checkFlatForRageType = PFValidation.floatCheckForRangeType($('.pf-migration-step-form'));
        checkFlatForRageType('.float-range-0', 11, 0);

        //var focusDrag = PFValidation.dragAll($('.pf-migration-step-form'));
        //focusDrag('.float0'); // decimal 0 정수 처리

        // 데이터이행대상테이블 그리드
        migrationStepTableListGrid = renderMigrationStepTableListGrid();

        if(data && data.migrationStepTableList) {
          migrationStepTableListGrid.setData(data.migrationStepTableList);
        }
      }
    }
  });

}


/**
 * 데이터이행대상테이블 그리드
 * @returns
 */
function renderMigrationStepTableListGrid() {
  var grid = PFComponent.makeExtJSGrid({
    fields: [
      "migrationTableName","migrationTableContent","executeSeq"
      ],
      gridConfig: {
        renderTo: '.pf-migration-table-grid',
        columns: [
          {text: bxMsg('migrationTableName'), flex:1, dataIndex: 'migrationTableName', style: 'text-align:left'},
          {text: bxMsg('tableName'), flex:1, dataIndex: 'migrationTableContent', style: 'text-align:left',
            renderer: function(value, p, record) {
              if(!value) {
                return tableMap[record.data.migrationTableName];
              }
              else {
                return value;
              }
            }
          },
          {text: bxMsg('executeSeq'), flex: 1, dataIndex: 'executeSeq', style: 'text-align:left',
            editor: {
              xtype: 'textfield',
              allowBlank: false,
              selectOnFocus: true,
              listeners: {
                'render': function (cmp) {
                  cmp.getEl()
                  .on('keydown', function (e) {
                    PFValidation.gridFloatCheckKeydown(e, 11, 0);
                  })
                  .on('keyup', function (e) {
                    PFValidation.gridFloatCheckKeyup(e, 11, 0);
                  })
                }
              }
            }
          },
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
          ],
          plugins: [
            Ext.create('Ext.grid.plugin.CellEditing', {
              clicksToEdit: 1
            })
            ]
      }
  });
  return grid;
}


function renderMigrationTableAddPopup(migrationStepTableListGrid) {
  var publishTargetGrid;
  var publishTargetTablePopupTpl = getTemplate('publishTargetTablePopupTpl');
  PFComponent.makePopup({
    // 이행대상테이블
    title: bxMsg('migrationTrgtTableList'),
    contents: publishTargetTablePopupTpl(),
    width:450,
    height:500,
    buttons: [
      // 확인 버튼
      {text:bxMsg('ButtonBottomString3'), elCls:'button button-primary',handler:function () {
        var selectTables = publishTargetGrid.getSelectedItem();
        selectTables.forEach(function(item, index){
          item.migrationTableName = item.tableName;
          item.migrationTableContent = item.logicalTableName;
        });
        migrationStepTableListGrid.addData(selectTables);
        this.close();
      }},
      // 닫기 버튼
      {text:bxMsg('ButtonBottomString17'), elCls:'button button-primary',handler:function(){
        this.close();
      }}],

      listeners: {
        afterRenderUI: function() {
          publishTargetGrid = renderPublishTargetGrid();
          publishTargetGrid.setData(tables);
        }
      }
  });

  function renderPublishTargetGrid(){
    var grid = PFComponent.makeExtJSGrid({
      pageAble: true,
      fields: ['select','logicalTableName', 'tableName'],
      gridConfig: {
        selType: 'checkboxmodel',
        renderTo: '.publish-target-table-grid',
        columns: [
          {text: bxMsg('logicalName'), flex: 1, dataIndex: 'logicalTableName'},
          {text: bxMsg('physicalName'), flex: 1, dataIndex: 'tableName'}
          ]
      }
    });
    return grid;
  }

}