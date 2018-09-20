//정합성체크시스템 그리드
var cnstncyChkSystemInfoGrid;
//정합성체크대상 그리드
var cnstncyChkTrgtObjCdDetailGrid;

/**
 * 정합성체크 상세팝업
 * @param responseData
 */
function renderCnstncyChkDetailPopup(cnstncyChkResponseData) {
  var buttons = [];

  // 신규등록일때 버튼
  if(!cnstncyChkResponseData || !cnstncyChkResponseData.cnstncyChkId) {
    // 저장
    buttons.push({
      text: bxMsg('ButtonBottomString1'),
      elCls: 'button button-primary btn-cnstncy-chk-save-unique write-btn',
      handler: function () {
        var requestParam = PFComponent.makeYGForm($('.pf-cnstncy-chk-detail-table')).getData();

        // 정합성체크대상시스템 정보 존재여부 확인
        if(cnstncyChkSystemInfoGrid.getAllData().length == 0) {
          // 정합성체크대상 시스템정보는 필수입력값입니다.
          PFComponent.showMessage(bxMsg('mandatorySystemInfo'), 'warning');
          return;
        }
        else {
          var returnFlag = false;
          var continueFlag = true;
          cnstncyChkSystemInfoGrid.getAllData().forEach(function(el) {
        	var duplicateCnt = 0;
            // 정합성체크대상 시스템정보에서 누락된 항목이있는지 한번더 체크
            if( (!el.sysCd || el.sysCd == '')
                || (!el.sysEnvrnmntDscd || el.sysEnvrnmntDscd == '')) {
              returnFlag = true;
            }
            else {
              cnstncyChkSystemInfoGrid.getAllData().forEach(function(_el) {
                // OHS 2017.11.22 수정 || -> &&
                if((el.sysCd == _el.sysCd)
                    && (el.sysEnvrnmntDscd == _el.sysEnvrnmntDscd)) {
                  duplicateCnt++;
                }
              });

              if(duplicateCnt > 1) {
                PFComponent.showMessage(bxMsg('isExistsSystemInfo'), 'warning'); // 동일한 시스템정보가 존재합니다.
                continueFlag = false;
              }
            }

          });
          if(returnFlag) {
            // 정합성체크대상 시스템정보는 필수입력값입니다.
            PFComponent.showMessage(bxMsg('mandatorySystemInfo'), 'warning');
            return;
          }

          if(!continueFlag) return;
        }

        if(cnstncyChkTrgtObjCdDetailGrid.getAllData().length == 0) {
          // 정합성체크대상 정보는 필수입력값입니다.
          PFComponent.showMessage(bxMsg('mandatoryTrgtObjInfo'), 'warning');
          return;
        }

        // 정합성체크오브젝트리스트
        requestParam.cnstncyObjectList = cnstncyChkTrgtObjCdDetailGrid.getAllData();
        // 정합성체크시스템리스트
        requestParam.cnstncyChkSystemList = cnstncyChkSystemInfoGrid.getAllData();
        // 정합성체크유형코드 세팅
        requestParam.cnstncyChkTpDscd = $('.cnstncy-chk-type-dscd').val();

        var that = this;
        PFRequest.post('/cnstncychk/createCnstncyChkBaseInfo.json', requestParam, {
          success: function (responseData) {

            PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
            that.close();
            $('.cnstncy-chk-search-btn').click();

            renderCnstncyChkDetailPopup(responseData);

          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'ConsistencyCheckService',
            operation: 'createCnstncyChkBaseInfo'
          }
        });
      }
    });
  }

  // 정합성체크상태 '01' : 미실행
  if(cnstncyChkResponseData && cnstncyChkResponseData.cnstncyChkId && cnstncyChkResponseData.cnstncyChkStsCd == '01') {
    // 저장(수정)
    buttons.push({
      text: bxMsg('ButtonBottomString1'),
      elCls: 'button button-primary btn-cnstncy-chk-save-unique write-btn',
      handler: function () {
        var requestParam = PFComponent.makeYGForm($('.pf-cnstncy-chk-detail-table')).getData();

        // 정합성체크대상시스템 정보 존재여부 확인
        if(cnstncyChkSystemInfoGrid.getAllData().length == 0) {
          // 정합성체크대상 시스템정보는 필수입력값입니다.
          PFComponent.showMessage(bxMsg('mandatorySystemInfo'), 'warning');
          return;
        }
        else {
          var returnFlag = false;
          var continueFlag = true;
          cnstncyChkSystemInfoGrid.getAllData().forEach(function(el) {
        	var duplicateCnt = 0;
            // 정합성체크대상 시스템정보에서 누락된 항목이있는지 한번더 체크
            if( (!el.sysCd || el.sysCd == '')
                || (!el.sysEnvrnmntDscd || el.sysEnvrnmntDscd == '')) {
              returnFlag = true;
            }
            else {
              cnstncyChkSystemInfoGrid.getAllData().forEach(function(_el) {
                // OHS 2017.11.22 수정 || -> &&
                if((el.sysCd == _el.sysCd)
                    && (el.sysEnvrnmntDscd == _el.sysEnvrnmntDscd)) {
                  duplicateCnt++;
                }
              });

              if(duplicateCnt > 1) {
                PFComponent.showMessage(bxMsg('isExistsSystemInfo'), 'warning'); // 동일한 시스템정보가 존재합니다.
                continueFlag = false;
              }
            }
            
          });
          if(!continueFlag) return;
          
          if(returnFlag) {
            // 정합성체크대상 시스템정보는 필수입력값입니다.
            PFComponent.showMessage(bxMsg('mandatorySystemInfo'), 'warning');
            return;
          }
        }

        if(cnstncyChkTrgtObjCdDetailGrid.getAllData().length == 0) {
          // 정합성체크대상 정보는 필수입력값입니다.
          PFComponent.showMessage(bxMsg('mandatoryTrgtObjInfo'), 'warning');
          return;
        }

        // 정합성체크오브젝트리스트
        requestParam.cnstncyObjectList = cnstncyChkTrgtObjCdDetailGrid.getAllData();
        // 정합성체크시스템리스트
        requestParam.cnstncyChkSystemList = cnstncyChkSystemInfoGrid.getAllData();
        // 정합성체크유형코드 세팅
        requestParam.cnstncyChkTpDscd = $('.cnstncy-chk-type-dscd').val();

        var that = this;
        PFRequest.post('/cnstncychk/updateCnstncyChkBaseInfo.json', requestParam, {
          success: function (responseData) {

            PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
            that.close();
            $('.cnstncy-chk-search-btn').click();

            renderCnstncyChkDetailPopup(responseData);

          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'ConsistencyCheckService',
            operation: 'updateCnstncyChkBaseInfo'
          }
        });
      }
    });

    // 삭제
    buttons.push({
      text: bxMsg('ButtonBottomString2'),
      elCls: 'button button-primary btn-publish-delete-unique write-btn',
      handler: function () {
        var requestParam = PFComponent.makeYGForm($('.pf-cnstncy-chk-detail-table')).getData();

        var that = this;
        PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), function () {
          PFRequest.post('/cnstncychk/deleteCnstncyChkBaseInfo.json', requestParam, {
            success: function (responseData) {
              PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');
              that.close();
              $('.cnstncy-chk-search-btn').click();
            },
            bxmHeader: {
              application: 'PF_Factory',
              service: 'ConsistencyCheckService',
              operation: 'deleteCnstncyChkBaseInfo'
            }
          });
        }, function () {
          return;
        });


      }
    });
  }

  // 정합성체크
  buttons.push({
    text: bxMsg('btnCnstncyChk'),
    elCls: 'button button-primary btn-publish-execute-unique write-btn',
    handler: function () {
      var cnstcnyChkDetail = PFComponent.makeYGForm($('.pf-cnstncy-chk-detail-table')).getData();

      // 정합성체크ID, 정합성체크시스템, 정합성체크대상 정보가 없을경우 정합성체크 불가
      if (!cnstcnyChkDetail || !cnstcnyChkDetail.cnstncyChkId
          || cnstncyChkSystemInfoGrid.getAllData().length == 0 || cnstncyChkTrgtObjCdDetailGrid.getAllData().length == 0) {
        // 정합성체크를 위한 정보가 부족합니다.
        PFComponent.showMessage(bxMsg('doNotCnstncyChk'), 'warning');
        return;
      }

      var that = this;
      PFComponent.showConfirm(bxMsg('confirmDoCnstncyChk'), function () {
        $loadingDim.show();
        var requestParam = PFComponent.makeYGForm($('.pf-cnstncy-chk-detail-table')).getData();

        // Render PublishDetail Popup Page
        PFRequest.post('/cnstncychk/doCnstncyChk.json', requestParam, {
          success: function (responseData) {

            PFComponent.showMessage(bxMsg('completedCnstncyChk'), 'success'); // 정합성체크가 완료되었습니다.
            that.close();
            $('.cnstncy-chk-search-btn').click();

            renderCnstncyChkDetailPopup(responseData);

            $loadingDim.hide();
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'ConsistencyCheckService',
            operation: 'doCnstncyChk'
          }
        });
      });
    }
  });

  buttons.push({
    text: bxMsg('ButtonBottomString17'),
    elCls: 'button button-primary write-btn',
    handler: function () {
      this.close();
    }
  });

  const cnstncyChkDetailPopup = getTemplate('cnstncyChkDetailPopup');

  /**
   * 정합성체크기본정보 팝업
   */
  PFComponent.makePopup({
    title: bxMsg('cnstncyChkBaseInfo'),
    contents: cnstncyChkDetailPopup(cnstncyChkResponseData),
    width:1000,
    height:560,
    buttons: buttons,
    contentsEvent: {
      // 정합성체크유형을 바꿀때마다 그리드 초기화
      'change .cnstncy-chk-type-dscd' : function() {
        cnstncyChkTrgtObjCdDetailGrid.resetData();
      },
      // 정합성체크대상 추가
      'click .add-target-obj-btn' : function() {
        var clickEventForNewData = {};
        // 상품팝업
        if($('.cnstncy-chk-type-dscd').val() == '01') {
          PFPopup.selectProduct({ multi: true }, function(data) {
            $.each(data,function(index, row){
              clickEventForNewData.cnstncyChkTrgtObjCd = row.code;
              clickEventForNewData.cnstncyChkTrgtObjName = row.name;
              cnstncyChkTrgtObjCdDetailGrid.addData(clickEventForNewData);
            });
            modifyFlag = true;
          });
        }
        // 서비스팝업
        else if($('.cnstncy-chk-type-dscd').val() == '02') {
          PFPopup.selectService({ multi: true }, function(data) {
            $.each(data,function(index, row){
              clickEventForNewData.cnstncyChkTrgtObjCd = row.code;
              clickEventForNewData.cnstncyChkTrgtObjName = row.name;
              cnstncyChkTrgtObjCdDetailGrid.addData(clickEventForNewData);
            });
            modifyFlag = true;
          });
        }
        // 테이블
        else if($('.cnstncy-chk-type-dscd').val() == '03') {
          renderPublishTargetTablePopup();
        }
      },
      // 정합성체크대상시스템 선택 팝업 호출
      'click .add-target-sys-btn': function() {
        RenderTargetSystemAddPopup();
      }
    },
    listeners: {
      afterSyncUI : function() {

        //var that = this;
        PFUI.use(['pfui/tab','pfui/mask'],function(Tab){

          var tab = new Tab.Tab({
            render : '.pf-cnstncy-chk-sub-tab',
            elCls : 'nav-tabs',
            autoRender: true,
            children : [
              {text:bxMsg('cnstncyChkDetailInfo'), index:1},	// 정합성체크상세정보
              {text:bxMsg('cnstncyChkRsltInfo'), index:2}		// 정합성체크결과
              ]
          });

          $('.pf-cnstncy-chk-result').hide();
          tab.on('selectedchange',function (ev) {

            var item = ev.item;

            // 정합성체크상세 탭
            if (item.get('index') == 1) {
              $('.pf-cnstncy-chk-result').hide();			// 정합성체크결과
              $('.pf-cnstncy-chk-information').show();	// 정합성체크상세정보

              // 정합성체크상태 콤보조립
              var options = [];
              $.each(codeMapObj['CnstncyChkStatusCode'], function (key, value) {
                var $option = $('<option>');
                $option.val(key);
                $option.text(value);
                options.push($option);
              });
              $('.pf-cnstncy-chk-detail-tpl .cnstncy-chk-status-code-list').html(options);


              // 정합성체크유형 콤보조립
              options = [];
              $.each(codeMapObj['CnstncyChkTpDscd'], function (key, value) {
                var $option = $('<option>');
                $option.val(key);
                $option.text(value);
                options.push($option);
              });
              $('.pf-cnstncy-chk-detail-tpl .cnstncy-chk-type-dscd').html(options);

              if (cnstncyChkResponseData) {
                // 정합성체크상태
                $('.pf-cnstncy-chk-detail-tpl .cnstncy-chk-status-code-list').val(cnstncyChkResponseData.cnstncyChkStsCd);
                // 정합성체크유형
                $('.pf-cnstncy-chk-detail-tpl .cnstncy-chk-type-dscd').val(cnstncyChkResponseData.cnstncyChkTpDscd);

              }

              // 정합성체크대상
              renderCnstncyChkTargetObjectGrid(cnstncyChkResponseData ? cnstncyChkResponseData.cnstncyObjectList : undefined);

              // 정합성체크시스템
              renderTargetSysGrid(cnstncyChkResponseData ? cnstncyChkResponseData.cnstncyChkSystemList : undefined);

            }
            // 정합성체크결과 탭
            else {
              $('.pf-cnstncy-chk-result').show();			// 정합성체크결과
              $('.pf-cnstncy-chk-information').hide();	// 정합성체크상세정보

              $('.pf-cnstncy-chk-result').html(cnstncyChkResultTab);

              // 정합성체크결과 그리드
              renderCnstncyChkRsltGrid(cnstncyChkResponseData ? cnstncyChkResponseData.cnstncyChkSystemList : undefined);
              // 정합성체크결과상세 그리드
              renderCnstncyChkRsltDetailGrid();
            }

            // 권한이 없는 경우
            if(writeYn != 'Y'){
              $('.write-btn').hide();
            }
          });


          // 등록상태일때는 정합성체크결과 탭을 disabled true 처리한다. ( 미실행 상태일때도 disabled true 처리 )
          //if(!cnstncyChkResponseData || !cnstncyChkResponseData.cnstncyChkId ) {
          if(!cnstncyChkResponseData || !cnstncyChkResponseData.cnstncyChkId || cnstncyChkResponseData.cnstncyChkStsCd == '01') {
            if($('.pf-cnstncy-chk-detail-popup').find('.nav-tabs').find('li') && $('.pf-cnstncy-chk-detail-popup').find('.nav-tabs').find('li').length > 0) {
              $.each($('.pf-cnstncy-chk-detail-popup').find('.nav-tabs').find('li'), function(idx, value) {

                if((idx == 1) && tab) {
                  tab.getItemAt(idx).set('disabled', true);
                  $(value).css('opacity', '0.4');
                }
              });
            }
          }

          // 정합성체크상세정보 탭
          tab.setSelected(tab.getItemAt(0));
        });

        // 등록일때는 정합성체크유형 선택 가능
        if(!cnstncyChkResponseData || !cnstncyChkResponseData.cnstncyChkId) {
          $('.cnstncy-chk-type-dscd').prop('disabled', false);
        }
      }
    }
  });
}

/**
 * 정합성체크시스템 정보 그리드
 */
function renderTargetSysGrid(responseData) {
  // Grid Empty
  $('.pf-cnstncy-chk-target-sys-grid').empty();
  cnstncyChkSystemInfoGrid = PFComponent.makeExtJSGrid({
    fields: ["sysCd", "sysEnvrnmntDscd", "sysNm", "sysEnvrnmntNm",
      {
      name: 'sysEnvrnmntNm',
      convert: function(newValue, record) {
//      var sysEnvrnmntNm = '';
//      if(record.get('sysEnvrnmntDscd')) {
//      sysEnvrnmntNm = codeMapObj.SystemEnvironmentDistinctionCode[record.get('sysEnvrnmntDscd')];
//      }
//      else {
//      sysEnvrnmntNm = codeMapObj.SystemEnvironmentDistinctionCode[newValue]
//      }
//      return sysEnvrnmntNm;
      }
      }
    ],
    gridConfig: {
      renderTo: '.pf-cnstncy-chk-target-sys-grid',
      columns: [
        // 1. 시스템명
        // 2. 대상환경
        {text: bxMsg('PAS0501String2'), flex: 1, dataIndex: 'sysNm', style: 'text-align:center', align: 'center'},
        {text: bxMsg('targetEnvironment'), flex: 1, dataIndex: 'sysEnvrnmntDscd', style: 'text-align:center',  align: 'left',
          renderer: function(value, p, record) {
            //record.set('sysEnvrnmntDscd', value);

//          if(codeMapObj.SystemEnvironmentDistinctionCode[record.get('sysEnvrnmntDscd')]
//          && codeMapObj.SystemEnvironmentDistinctionCode[record.get('sysEnvrnmntDscd')].code) {
//          record.set('sysEnvrnmntDscd', codeMapObj.SystemEnvironmentDistinctionCode[record.get('sysEnvrnmntDscd')].code);
//          }
//          return codeMapObj.SystemEnvironmentDistinctionCode[record.get('sysEnvrnmntDscd')] || value;
            return codeMapObj.SystemEnvironmentDistinctionCode[value] || value;;
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
              data: codeArrayObj['SystemEnvironmentDistinctionCode']
            })
          }
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
        plugins: [
          Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1,
            listeners:{
              beforeedit:function(e, editor){
              },
              afteredit: function(e, editor){
              }
            }
          })
          ]
    }
  });
  if(responseData) {
    cnstncyChkSystemInfoGrid.setData(responseData);
  }
}

/**
 * 정합성체크대상오브젝트 Grid
 * @param responseData
 */
function renderCnstncyChkTargetObjectGrid(responseData) {
  // Grid Empty
  $('.pf-cnstncy-chk-target-object-detail-grid').empty();


  cnstncyChkTrgtObjCdDetailGrid = PFComponent.makeExtJSGrid({
    fields: ['cnstncyChkTrgtObjCd', 'cnstncyChkTrgtObjName'],
    gridConfig: {
      renderTo: '.pf-cnstncy-chk-target-object-detail-grid',
      columns: [
        // 1. cnstncyChkTrgtObjCd : 대상코드
        // 2. PAS0202String18 : 대상명
        {text: bxMsg('cnstncyChkTrgtObjCd'), flex: 1, dataIndex: 'cnstncyChkTrgtObjCd', style: 'text-align:center', align: 'left'},
        {text: bxMsg('PAS0202String18'), flex: 1, dataIndex: 'cnstncyChkTrgtObjName', style: 'text-align:center',  align: 'left'},
        {
          xtype: 'actioncolumn', width: 35, align: 'center',
          items: [{
            icon: '/images/x-delete-16.png',
            handler: function (grid, rowIndex, colIndex, item, e, record) {
              record.destroy();
            }
          }]
        }
        ]
    }
  });
  if(responseData) {
    cnstncyChkTrgtObjCdDetailGrid.setData(responseData);
  }
}

function renderPublishTargetTablePopup() {
  // 정합성체크대상테이블 목록 팝업
  const publishTargetTablePopupTpl = getTemplate('publishTargetTablePopupTpl');
  var publishTargetGrid;
  // 정합성체크대상테이블 팝업
  PFComponent.makePopup({
    // 정합성체크대상테이블
    title: bxMsg('cnstncyChkTrgtTableList'),
    contents: publishTargetTablePopupTpl(),
    width:450,
    height:500,
    buttons: [
      // 확인 버튼
      {text:bxMsg('ButtonBottomString3'), elCls:'button button-primary',handler:function () {
        var selectTables = publishTargetGrid.getSelectedItem();
        selectTables.forEach(function(item, index){
          item.cnstncyChkTrgtObjCd = item.tableName;
          item.cnstncyChkTrgtObjName = item.logicalTableName;
        });
        cnstncyChkTrgtObjCdDetailGrid.addData(selectTables);
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

function RenderTargetSystemAddPopup() {
  //정합성체크대상시스템 선택 팝업 그리드
  var addTargetSysPopupGrid;
  const addTargetSysPopup = getTemplate('addTargetSysPopup');
  // 정합성체크대상시스템
  PFComponent.makePopup({
    title: bxMsg('cnstncyChkSystem'),
    contents: addTargetSysPopup(),
    width: 270,
    height: 300,
    submit: function() {
      var checkedItem = addTargetSysPopupGrid.getSelectedItem();

      if(checkedItem.length > 0) {
        checkedItem.forEach(function(el){
          el.sysCd = el.code;
          el.sysNm = el.name;
        });
      }
      // 정합성체크대상시스템 그리드에 데이터 세팅
      cnstncyChkSystemInfoGrid.addData(checkedItem);
    },
    listeners: {
      afterRenderUI: function() {

        PFRequest.get('/publish/PublishQuerySystemList.json',{
          success: function(responseData){

            renderAddTargetSystemGrid(responseData);

          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'PublishSystemService',
            operation: 'queryListPublishSystem'
          }
        });

      }
    }
  });


  /**
   * 정합성체크대상시스템 추가팝업 그리드
   */
  function renderAddTargetSystemGrid(responseData) {
    $('.add-target-sys-popup-grid').empty();
    addTargetSysPopupGrid = PFComponent.makeExtJSGrid({
      fields: ["name", "userNumber", "code"],
      gridConfig: {
        selModel: Ext.create ('Ext.selection.CheckboxModel', {mode: 'MULTI'}),
        renderTo: '.add-target-sys-popup-grid',
        columns: [
          // 1. PAS0501String2 : 시스템명
          // 2. DAS0101String19 : 담당자
          {text: bxMsg('PAS0501String2'), flex: 1, dataIndex: 'name', style: 'text-align:center', align: 'center'},
          {text: bxMsg('DAS0101String19'), flex: 1, dataIndex: 'userNumber', style: 'text-align:center', align: 'center'}
          ]
      }
    });
    if(responseData) {
      addTargetSysPopupGrid.setData(responseData);
    }
  }

}

function renderCnstncyChkObjResultDetailPopup(responseData) {
  // 정합성체크대상결과상세
  const cnstncyChkObjResultDetailTpl = getTemplate('cnstncyChkObjResultDetailTpl');
  // 정합성체크대상시스템
  PFComponent.makePopup({
    title: bxMsg('cnstncyChkRsltDetailInfo'),
    contents: cnstncyChkObjResultDetailTpl(),
    width: 1000,
    height: 610,
    listeners: {
      afterRenderUI: function() {
        renderCnstncyChkObjResultDetailGrid(responseData);
      }
    }
  });

  /**
   * 정합성체크대상 결과상세 팝업 그리드
   */
  function renderCnstncyChkObjResultDetailGrid(responseData) {
    // 정합성체크 대상상세결과 팝업 그리드
    var cnstncyChkObjRsltDetailGrid;
    $('.cnstncy-chk-obj-rslt-dtl-popup-grid').empty();

    var fieldArr = ["seqNbr", "cnstncyChkRsltCd", {name: 'cnstncyChkRsltStsName',
      convert: function(newValue, record) {
        if(record.get('cnstncyChkRsltCd') == '03' || record.get('cnstncyChkRsltCd') == '04') return newValue;
        if(codeMapObj.CnstncyChkResultStatusCode[record.get('cnstncyChkRsltCd')]) {
          return codeMapObj.CnstncyChkResultStatusCode[record.get('cnstncyChkRsltCd')];
        }
        else {
          return record.get('cnstncyChkRsltCd');
        }
      }
    }
    ];

    var columnArr = [{text: bxMsg('seqNbr'), width: 100, dataIndex: 'seqNbr', style: 'text-align:center', align: 'center'},
      {text: bxMsg('PAS0501String8'), width: 100, dataIndex: 'cnstncyChkRsltStsName', style: 'text-align:center', align: 'left'}];

    if(responseData && responseData.allTableColumns) {
      for(var i = 0; i < responseData.allTableColumns.length; i++) {
        var convertText = responseData.allTableColumns[i].toUpperCase(); // ex. tntInstId
        var convertCamelCase = responseData.allTableColumns[i].camelCase(); // ex. TNT_INST_ID

        fieldArr.push(convertCamelCase);

        if(convertText.indexOf('TNT_INST_ID') == -1 && convertText.indexOf('GMT_CREATE') == -1 && convertText.indexOf('GMT_MODIFIED') == -1 && convertText.indexOf('LAST_MODIFIER') == -1
            && convertText.indexOf('STS_CHNG_DT') == -1 && convertText.indexOf('LAST_CHNG_TMSTMP') == -1) {

          if(convertText.indexOf('START_DT') != -1 || convertText.indexOf('END_DT') != -1) {
            columnArr.push({text: convertText, width:80, dataIndex: convertCamelCase, style: 'text-align:center', align: 'center',
              renderer: function(value, p, record, rowIndex, store, view) {

                if(record.getData().cnstncyChkRsltCd == '03') {
                  if(cnstncyChkObjRsltDetailGrid.store.getAt(p.recordIndex).data
                      && cnstncyChkObjRsltDetailGrid.store.getAt(p.recordIndex + 1).data) {

                    if(cnstncyChkObjRsltDetailGrid.store.getAt(p.recordIndex).data[p.column.dataIndex]
                    != cnstncyChkObjRsltDetailGrid.store.getAt(p.recordIndex + 1).data[p.column.dataIndex]) {
                      p.style = "background:rgb(223, 171, 232);margin-top: 1px;"
                    }
                    if(value) {
                      return XDate(value).toString("yyyy-MM-dd HH:mm:ss");
                    }
                    else {
                      return '';
                    }
                  }
                  else {
                    if(value) {
                      return XDate(value).toString("yyyy-MM-dd HH:mm:ss");
                    }
                    else {
                      return '';
                    }
                  }
                }
                else if(record.getData().cnstncyChkRsltCd == '04') {

                  if(cnstncyChkObjRsltDetailGrid.store.getAt(p.recordIndex).data
                      && cnstncyChkObjRsltDetailGrid.store.getAt(p.recordIndex - 1).data) {

                    if(cnstncyChkObjRsltDetailGrid.store.getAt(p.recordIndex).data[p.column.dataIndex]
                    != cnstncyChkObjRsltDetailGrid.store.getAt(p.recordIndex - 1).data[p.column.dataIndex]) {
                      p.style = "background:rgb(223, 171, 232);margin-top: 1px;"
                    }
                    if(value) {
                      return XDate(value).toString("yyyy-MM-dd HH:mm:ss");
                    }
                    else {
                      return '';
                    }
                  }
                  else {
                    if(value) {
                      return XDate(value).toString("yyyy-MM-dd HH:mm:ss");
                    }
                    else {
                      return '';
                    }
                  }
                }
                else {
                  if(value) {
                    return XDate(value).toString("yyyy-MM-dd HH:mm:ss");
                  }
                  else {
                    return '';
                  }
                }
              }
            })
          }
          else {
            columnArr.push({text: convertText, width:80, dataIndex: convertCamelCase, style: 'text-align:center', align: 'center',
              renderer: function(value, p, record, rowIndex, store, view) {

                if(record.getData().cnstncyChkRsltCd == '03') {
                  if(cnstncyChkObjRsltDetailGrid.store.getAt(p.recordIndex).data
                      && cnstncyChkObjRsltDetailGrid.store.getAt(p.recordIndex + 1).data) {

                    if(cnstncyChkObjRsltDetailGrid.store.getAt(p.recordIndex).data[p.column.dataIndex].replace(' ', '')
                        != cnstncyChkObjRsltDetailGrid.store.getAt(p.recordIndex + 1).data[p.column.dataIndex].replace(' ', '')) {
                      p.style = "background:rgb(223, 171, 232);margin-top: 1px;"
                    }
                    return value;
                  }
                  else {
                    return value;
                  }
                }
                else if(record.getData().cnstncyChkRsltCd == '04') {

                  if(cnstncyChkObjRsltDetailGrid.store.getAt(p.recordIndex).data
                      && cnstncyChkObjRsltDetailGrid.store.getAt(p.recordIndex - 1).data) {

                    if(cnstncyChkObjRsltDetailGrid.store.getAt(p.recordIndex).data[p.column.dataIndex].replace(' ', '')
                        != cnstncyChkObjRsltDetailGrid.store.getAt(p.recordIndex - 1).data[p.column.dataIndex].replace(' ', '')) {
                      p.style = "background:rgb(223, 171, 232);margin-top: 1px;"
                    }
                    return value;
                  }
                  else {
                    return value;
                  }
                }
                else {
                  return value;
                }
              }
            })
          }
        }
      }
    }
    cnstncyChkObjRsltDetailGrid = PFComponent.makeExtJSGrid({
      fields: fieldArr,
      gridConfig: {
        renderTo: '.cnstncy-chk-obj-rslt-dtl-popup-grid',
        columns: columnArr
      }
    });
    if(responseData && responseData.cnstncyChkObjectResultVOList) {
      var gridDataArr = [];
      for(var i = 0; i < responseData.cnstncyChkObjectResultVOList.length; i++) {


        if(responseData.cnstncyChkObjectResultVOList[i].cnstncyChkSrcCntnt) {
          gridData = JSON.parse(responseData.cnstncyChkObjectResultVOList[i].cnstncyChkSrcCntnt)[0];
          gridData.cnstncyChkRsltCd = '01';
          gridData.seqNbr = responseData.cnstncyChkObjectResultVOList[i].seqNbr;
          gridDataArr.push(gridData);
        }

        if(responseData.cnstncyChkObjectResultVOList[i].cnstncyChkTrgtCntnt) {
          gridData = JSON.parse(responseData.cnstncyChkObjectResultVOList[i].cnstncyChkTrgtCntnt)[0];
          gridData.seqNbr = responseData.cnstncyChkObjectResultVOList[i].seqNbr;
          gridData.cnstncyChkRsltCd = '02';
          gridDataArr.push(gridData);
        }

        if(responseData.cnstncyChkObjectResultVOList[i].cnstncyChkUnmtchdCntnt) {
          var unMtchdCntntArr = JSON.parse(responseData.cnstncyChkObjectResultVOList[i].cnstncyChkUnmtchdCntnt);

          if(unMtchdCntntArr && unMtchdCntntArr.length == 2) {
            for(var unMatchedIdx = 0; unMatchedIdx < unMtchdCntntArr.length; unMatchedIdx++) {

              if(unMatchedIdx == 0) {
                gridData = unMtchdCntntArr[unMatchedIdx];
                gridData.seqNbr = responseData.cnstncyChkObjectResultVOList[i].seqNbr;
                gridData.cnstncyChkRsltStsName = bxMsg('compareUnmtchdSource');
                gridData.cnstncyChkRsltCd = '03';
                gridDataArr.push(gridData);
              }
              else {
                gridData = unMtchdCntntArr[unMatchedIdx];
                gridData.cnstncyChkRsltStsName = bxMsg('compareUnmtchdTarget');
                gridData.cnstncyChkRsltCd = '04';
                gridDataArr.push(gridData);
              }
            }
          }
        }
      }
      cnstncyChkObjRsltDetailGrid.setData(gridDataArr);
    }
  }

}

String.prototype.camelCase = function(){
    var newString = '';
    var lastEditedIndex;
    for (var i = 0; i < this.length; i++){
        if(this[i] == ' ' || this[i] == '-' || this[i] == '_'){
            newString += this[i+1].toUpperCase();
            lastEditedIndex = i+1;
        }
        else if(lastEditedIndex !== i) newString += this[i].toLowerCase();
    }
    return newString;
}