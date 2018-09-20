function renderNumberingAddPopup() {
  const numberingTotDigitCntAddPopup = getTemplate('numberingTotDigitCntAddPopup');
  PFComponent.makePopup({
    title: bxMsg('totDigitCntMngr'), // 총자릿수관리
    contents: numberingTotDigitCntAddPopup(),
    width: 600,
    buttons:[
      {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn', handler:function(){
        var gridData = numberingDigitGrid.getAllData();

        var continueFlag = true;
        var modifyFlag = false;
        if(gridData && gridData.length > 0) {
          gridData.forEach(function (el) {
        	if(el.process != null) {
        		modifyFlag = true;
        	}
            // TODO : 숫자인지 체크
            // OHS 20171208 추가 - 필수입력값 체크
            if(el.totDigitCnt == '' || el.totDigitCnt == 0) {
              PFComponent.showMessage(bxMsg('requiredNbrgTotDigitCnt'), 'warning'); // 총자릿수는 빈값을 입력할 수 없습니다.
              continueFlag = false;
            }

            // 필수값 누락 체크 ( 구분코드 )
            if(!el.dscd || el.dscd == '') {
              // 필수 입력값이 비어있습니다.
              PFComponent.showMessage(bxMsg('mandatoryInputIsEmpty'), 'warning');
              returnFlag = false;
            }

            var dupCnt = 0;
            gridData.forEach(function (el_) {
              if (el.dscd == el_.dscd) {
                dupCnt++;
              }
            });

            if (dupCnt > 1) {
              PFComponent.showMessage(bxMsg('duplicatedNbrgDscd'), 'warning'); // 동일한 구분코드가 존재합니다.
              continueFlag = false;
            }
          });
        }
        if(!modifyFlag && (!deleteTotDigitCntPopupList || deleteTotDigitCntPopupList.length <= 0)) {
        	PFComponent.showMessage(bxMsg('nothingToSave'), 'warning'); // 변경된 정보가 없습니다.
        	return;
        }
        if(!continueFlag) return;

        var requestParam = {};
        requestParam['voList'] = gridData.concat(deleteTotDigitCntPopupList);

        PFRequest.post('/numbering/saveNumbering.json', requestParam, {
          success: function(responseData) {
            if(responseData) {
              PFComponent.showMessage(bxMsg('workSuccess'), 'success');

              if($('.tntInstId').val() == '') return;
              var requestParam = {
                  tntInstId : $('.tntInstId').val(),
                  refKey : 'DEFAULT'
              }
              PFRequest.get('/numbering/getListNumberingDistinctDigit.json', requestParam, {
                success: function(responseData) {
                  if(responseData == '') {
                    PFComponent.showMessage(bxMsg('notExistDefaultNbrgData'), 'warning');
                  }
                  deleteTotDigitCntPopupList = [];
                  numberingDigitGrid.setData(responseData);
                },
                bxmHeader: {
                  application: 'PF_Factory',
                  service: 'NumberingService',
                  operation: 'getListNumberingDistinctDigit'
                }
              });
            }
            else {
              PFComponent.showMessage(bxMsg('SaveFailed'), 'warning');
            }
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'NumberingService',
            operation: 'saveNumbering'
          }
        });
      }},
      {text:bxMsg('DPS0121_21String4'), elCls:'button button-primary', handler:function(){
        var selectedData = numberingDigitGrid.getSelectedItem();
        if(selectedData == '') return;

        var returnFalg = false;
        selectedData.forEach(function(el) {
          var dupCnt = 0;
          selectedData.forEach(function(el_) {
            if(el.dscd == el_.dscd) {
              dupCnt++;
            }

            if(!el.gmtLastModify || el.gmtLastModify == '' || el.gmtLastModify == null) {
              // 저장된 구분코드만 선택 가능합니다.
              returnFalg = true;
            }
          });
          if(dupCnt > 1) {
            PFComponent.showMessage(bxMsg('AlreadySavedNbrgDscd'), 'warning');
            return;
          }

          if(el.dscd == '' || el.totDigitCnt == '') return;
          el['refKey'] = '';
          el['lastNbr'] = '';
          el['process'] = 'C';
        });

        if(returnFalg) {
          // 저장된 구분코드만 선택 가능합니다.
          PFComponent.showMessage(bxMsg('cantSelectedByNotSaved'), 'warning');
          return;
        }
        numberingListGrid.addData(selectedData);
        this.close();
      }},
      {text:bxMsg('ButtonBottomString17'), elCls:'button button-primary', handler:function(){

        this.close();
      }}
      ],
      contentsEvent: {
        'click .numbering-tot-digit-cnt-add': function () {
          var newData = {
              tntInstId : $('.tntInstId').val(),
              refKey : 'DEFAULT',
              process : 'C'
          };
          numberingDigitGrid.addData(newData);
          numberingDigitGrid.grid.getSelectionModel().deselectAll();
        }
      },
      listeners: {
        afterRenderUI: function () {
          nbrgToolTip($('.nbrg-tot-digit-cnt-grid'));
          numberingDigitGrid = renderNumberingDigitGrid();

          if($('.tntInstId').val() == '') return;
          var requestParam = {
              tntInstId : $('.tntInstId').val(),
              refKey : 'DEFAULT'
          }
          PFRequest.get('/numbering/getListNumberingDistinctDigit.json', requestParam, {
            success: function(responseData) {
              if(responseData == '') {
                PFComponent.showMessage(bxMsg('notExistDefaultNbrgData'), 'warning');
              }
              deleteTotDigitCntPopupList = [];
              numberingDigitGrid.setData(responseData);
            },
            bxmHeader: {
              application: 'PF_Factory',
              service: 'NumberingService',
              operation: 'getListNumberingDistinctDigit'
            }
          });
        }
      }
  });
}


// 참조키설정 팝업
function _renderNumberingPreFix(recordData) {
  const numberingRefKeyAddPopup = getTemplate('numberingRefKeyAddPopup'); // OHS 2017.03.03 추가
  var nbrgObjDscd;
  var totDigitCnt;
  var wayDscd;

  var numberingPreFixGrid01; // 참조키 설정 Grid (특정항목_상수, 특정항목_일련번호, 특정항목_입력값별_일련번호)
  var numberingPreFixGrid02; // 참조키 설정 Grid (상수)
  var numberingPreFixGrid03; // 참조키 설정 Grid (특정테이블컬럼)

  if(recordData) {
    nbrgObjDscd = recordData.dscd;
    totDigitCnt = recordData.totDigitCnt;
    wayDscd = recordData.wayDscd;
  }

  PFComponent.makePopup({
    title: bxMsg('preFixSetting'), // 참조키 설정
    contents: numberingRefKeyAddPopup(),
    width: 800,
    buttons:[
      {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn', handler:function(){
        var gridData;

        if($('.refKeyWayDscd').val() == '01') {
          gridData = numberingPreFixGrid01.getAllData();
        }
        else if($('.refKeyWayDscd').val() == '03') {
          gridData = numberingPreFixGrid03.getAllData();
        }
        else if($('.refKeyWayDscd').val() == '02') {
          gridData = numberingPreFixGrid02.getAllData();
        }

        var continueFlag = true;
        var modifyFlag = false;
        if(gridData && gridData.length > 0) {
          gridData.forEach(function (el) {
        	if(el.process != null) {
            	modifyFlag = true;
            }
            	
            // 상수는 참조키를 필수정의하여야함.
            if($('.refKeyWayDscd').val() == '02') {
              if(el.refKey == '' || el.refKey.length == 0) {
                // 참조키를 빈값으로 저장할 수 없습니다.
                PFComponent.showMessage(bxMsg('requiredRefKeyForPreFix'), 'warning');
                continueFlag = false;
                return;
              }
            }

            // 특정항목이고 특정항목값에 값을 입력하였다면 참조키는 필수입력
            if($('.refKeyWayDscd').val() == '01' && (el.numberingItemValue != null && el.numberingItemValue != '' && el.numberingItemValue.length > 0)
                && (el.refKey == null || el.refKey == '' || el.refKey.length == 0)) {


              if(el.refDigitCnt == '' || el.refDigitCnt == 0 || el.refDigitCnt == '0') {
                PFComponent.showMessage(bxMsg('requiredRefDigitCntForPreFix'), 'warning');
                continueFlag = false;
              }
            }

            // 특정항목_입력값일경우 특정항목값, 참조키, 참조키자릿수는 필수
            if($('.refKeyWayDscd').val() == '03' && (
                (el.numberingItem == null || el.numberingItem == '' || el.numberingItem.length <= 0) 
                || (el.numberingItemValue == null || el.numberingItemValue == '' || el.numberingItemValue.length <= 0)
                || (el.refKey == null || el.refKey == '' || el.refKey.length == 0)
                || (el.refDigitCnt == '' || el.refDigitCnt == 0 || el.refDigitCnt == '0'))
            ) {

              PFComponent.showMessage(bxMsg('requiredValueCheckNbrgDscd03'), 'warning');
              continueFlag = false;
            }

            if(el.refDigitCnt == '' || el.refDigitCnt == 0 || el.refDigitCnt == '0') {
              // 참조키 자릿수를 빈값으로 저장할 수 없습니다.
              //PFComponent.showMessage(bxMsg('requiredRefDigitCntForPreFix'), 'warning');
              //continueFlag = false;
            }

          });
        }
        if(!modifyFlag && (!deletePreFixPopupList || deletePreFixPopupList.length <= 0)) {
        	PFComponent.showMessage(bxMsg('nothingToSave'), 'warning'); // 변경된 정보가 없습니다.
        	return;
        }
        
        if(!continueFlag) return;

        var requestParam = {
            dscd : nbrgObjDscd,
            wayDscd : $('.refKeyWayDscd').val()
        };
        requestParam['voList'] = gridData.concat(deletePreFixPopupList);

        PFRequest.post('/numbering/saveNumberingPreFix.json', requestParam, {
          success: function(responseData) {
            if(responseData) {
              PFComponent.showMessage(bxMsg('workSuccess'), 'success');

              if($('.tntInstId').val() == '') return;
              var requestParam = {
                  tntInstId : $('.tntInstId').val(),
                  dscd : nbrgObjDscd,
                  wayDscd : $('.refKeyWayDscd').val()
              }
              PFRequest.get('/numbering/getListNumberingDefaultRefKey.json', requestParam, {
                success: function(responseData) {
                  if($('.refKeyWayDscd').val() == '01') {
                    numberingPreFixGrid01.setData(responseData);
                  }
                  else if($('.refKeyWayDscd').val() == '03') {
                    numberingPreFixGrid03.setData(responseData);
                  }
                  else if($('.refKeyWayDscd').val() == '02') {
                    numberingPreFixGrid02.setData(responseData);

                    if(numberingPreFixGrid02.getAllData().length > 0) {
                      $('.numbering-prefix-add').hide();
                    }
                    else {
                      $('.numbering-prefix-add').show();
                    }
                  }
                  deletePreFixPopupList = [];
                },
                bxmHeader: {
                  application: 'PF_Factory',
                  service: 'NumberingService',
                  operation: 'getListNumberingDefaultRefKey'
                }
              });
            }
            else {
              PFComponent.showMessage(bxMsg('SaveFailed'), 'warning');
            }
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'NumberingService',
            operation: 'saveNumberingPreFix'
          }
        });
      }},
      {text:bxMsg('ButtonBottomString17'), elCls:'button button-primary', handler:function(){
        // 닫기버튼
        this.close();

        // 자리수정보 재조회
        if($('.tntInstId').val() == '') return;
        var requestParam = {
            tntInstId : $('.tntInstId').val(),
            refKey : 'DEFAULT'
        }
        PFRequest.get('/numbering/getListNumberingDistinctDigit.json', requestParam, {
          success: function(responseData) {
            if(responseData == '') {
              PFComponent.showMessage(bxMsg('notExistDefaultNbrgData'), 'warning');
            }
            deleteTotDigitCntPopupList = [];
            numberingDigitGrid.setData(responseData);
          },
          bxmHeader: {
            application: 'PF_Factory',
            service: 'NumberingService',
            operation: 'getListNumberingDistinctDigit'
          }
        });
      }}
      ],
      contentsEvent: {
        'change .refKeyWayDscd': function (e) {
          // 공통코드 그리드
          if($(e.currentTarget).val() == '01') {
            $('.numbering-ref-key-grid-01').css('visibility', 'visible');
            $('.numbering-ref-key-grid-02').css('visibility', 'hidden');
            $('.numbering-ref-key-grid-03').css('visibility', 'hidden');
            $('.numbering-prefix-add').show();
          }
          else if($(e.currentTarget).val() == '03') {
            $('.numbering-ref-key-grid-01').css('visibility', 'hidden');
            $('.numbering-ref-key-grid-02').css('visibility', 'hidden');
            $('.numbering-ref-key-grid-03').css('visibility', 'visible');
            $('.numbering-prefix-add').show();
          }
          // 상수 그리드
          else if($(e.currentTarget).val() == '02') {
            $('.numbering-ref-key-grid-01').css('visibility', 'hidden');
            $('.numbering-ref-key-grid-02').css('visibility', 'visible');
            $('.numbering-ref-key-grid-03').css('visibility', 'hidden');
          }

          if($('.tntInstId').val() == '') return;
          var requestParam = {
              tntInstId : $('.tntInstId').val(),
              dscd : nbrgObjDscd,
              wayDscd : $('.refKeyWayDscd').val()
          }
          PFRequest.get('/numbering/getListNumberingDefaultRefKey.json', requestParam, {
            success: function(responseData) {
              if($('.refKeyWayDscd').val() == '01') {
                numberingPreFixGrid01.setData(responseData);
              }
              else if($('.refKeyWayDscd').val() == '03') {
                numberingPreFixGrid03.setData(responseData);
              }
              else if($('.refKeyWayDscd').val() == '02') {
                numberingPreFixGrid02.setData(responseData);

                if(numberingPreFixGrid02.getAllData().length > 0) {
                  $('.numbering-prefix-add').hide();
                }
                else {
                  $('.numbering-prefix-add').show();
                }
              }
              deletePreFixPopupList = [];
            },
            bxmHeader: {
              application: 'PF_Factory',
              service: 'NumberingService',
              operation: 'getListNumberingDefaultRefKey'
            }
          });
        }
      },
      listeners: {
        afterRenderUI: function () {
          numberingPreFixGrid01 = renderNumberingPreFixGrid01();
          numberingPreFixGrid02 = renderNumberingPreFixGrid02();
          numberingPreFixGrid03 = renderNumberingPreFixGrid03(); // OHS 2017.09.07 추가

          // 참조키방법구분코드 콤보조립
          // 1.특정항목
          var options = [];
          var $option = $('<option>');
          $option.val("01");
          $option.text(bxMsg('numberingItem'));
          options.push($option);

          // OHS 2017.09.07 추가
          // 3.특정항목 입력값
          $option = $('<option>');
          $option.val("03");
          var comboMessage = bxMsg('numberingItem') + ' ' + bxMsg('input') + bxMsg('value'); 
          $option.text(comboMessage);
          options.push($option);

          // 2.상수
          $option = $('<option>');
          $option.val("02");
          $option.text(bxMsg('Constants'));
          options.push($option);
          $('.refKeyWayDscd').html(options);
          $('.refKeyWayDscd').val(wayDscd);

          // 3.특정테이블컬럼값
//        $option = $('<option>');
//        $option.val("03");
//        $option.text(bxMsg('numberingTableColumn'));
//        options.push($option);
//        $('.refKeyWayDscd').html(options);
//        $('.refKeyWayDscd').val(wayDscd);


          // 특정항목 그리드
          if($('.refKeyWayDscd').val() == '01') {
            $('.numbering-ref-key-grid-01').css('visibility', 'visible');
            $('.numbering-ref-key-grid-02').css('visibility', 'hidden');
            $('.numbering-ref-key-grid-03').css('visibility', 'hidden');
            $('.numbering-prefix-add').show();
          }
          else if($('.refKeyWayDscd').val() == '03') {
            $('.numbering-ref-key-grid-03').css('visibility', 'visible');
            $('.numbering-ref-key-grid-01').css('visibility', 'hidden');
            $('.numbering-ref-key-grid-02').css('visibility', 'hidden');
            $('.numbering-prefix-add').show();
          }
          // 상수 그리드
          else if($('.refKeyWayDscd').val() == '02') {
            $('.numbering-ref-key-grid-01').css('visibility', 'hidden');
            $('.numbering-ref-key-grid-03').css('visibility', 'hidden');
            $('.numbering-ref-key-grid-02').css('visibility', 'visible');
          }


          if($('.tntInstId').val() == '') return;
          var requestParam = {
              tntInstId : $('.tntInstId').val(),
              dscd : nbrgObjDscd,
              wayDscd : $('.refKeyWayDscd').val()
          }
          PFRequest.get('/numbering/getListNumberingDefaultRefKey.json', requestParam, {
            success: function(responseData) {
              if(responseData == '' || responseData.length < 1) {
                $('.refKeyWayDscd').val('01').trigger("change");
                return;
              }
              if($('.refKeyWayDscd').val() == '01') {
                numberingPreFixGrid01.setData(responseData);
              }
              else if($('.refKeyWayDscd').val() == '03') {
                numberingPreFixGrid03.setData(responseData);
              }
              else if($('.refKeyWayDscd').val() == '02') {
                numberingPreFixGrid02.setData(responseData);

                if(numberingPreFixGrid02.getAllData().length > 0) {
                  $('.numbering-prefix-add').hide();
                }
                else {
                  $('.numbering-prefix-add').show();
                }
              }
              deletePreFixPopupList = [];
            },
            bxmHeader: {
              application: 'PF_Factory',
              service: 'NumberingService',
              operation: 'getListNumberingDefaultRefKey'
            }
          });

          var popupOnEvent = PFUtil.makeEventBinder($('.pf-nbrg-ref-key-setting-popup'));
          // 참조키설정 Add버튼 클릭처리
          popupOnEvent('click', '.numbering-prefix-add', function(e) {

            // 특정항목 설정
            if($('.refKeyWayDscd').val() == '01') {
              var addItem = {};
              addItem.tntInstId = $('.tntInstId').val();
              addItem.dscd = nbrgObjDscd;
              addItem.totDigitCnt = totDigitCnt;
              addItem.refDigitCnt = 0;
              addItem.process = 'C';
              numberingPreFixGrid01.addData(addItem);

              /*
                    	                           var submitEvent = function(selectedData) {
                                                   	if(selectedData) {
                                                   		selectedData.tntInstId = $('.tntInstId').val();
                                                   		selectedData.dscd = nbrgObjDscd;
                                                   		selectedData.totDigit = totDigit;
                                                   		selectedData.process = 'C';
                                                   		selectedData.dmnCd = selectedData.domainCode;
                                                   		numberingPreFixGrid01.addData(selectedData);
                                                   	}
                                                   };
                                                   // 공통코드 팝업
                                                   renderCommonCodePopup(submitEvent);
               */
            }
            else if($('.refKeyWayDscd').val() == '03') {
              var addItem = {};
              addItem.tntInstId = $('.tntInstId').val();
              addItem.dscd = nbrgObjDscd;
              addItem.totDigitCnt = totDigitCnt;
              addItem.refDigitCnt = 0;
              addItem.process = 'C';
              numberingPreFixGrid03.addData(addItem);
            }
            // 참조키 설정
            else if($('.refKeyWayDscd').val() == '02') {
              // 상수참조일경우에는 1건만등록가능.
              if(numberingPreFixGrid02.getAllData() < 1) {
                var addItem = {};
                addItem.tntInstId = $('.tntInstId').val();
                addItem.dscd = nbrgObjDscd;
                addItem.totDigitCnt = totDigitCnt;
                addItem.refDigitCnt = 0;
                addItem.process = 'C';
                numberingPreFixGrid02.addData(addItem);

                $('.numbering-prefix-add').hide();
              }
            }
            // 특정테이블컬럽값 설정
//          else if($('.refKeyWayDscd').val() == '03') {
//          // 특정테이블컬럼값참조일경우에는 1건만등록가능.
//          if(numberingPreFixGrid03.getAllData() < 1) {
//          var addItem = {};
//          addItem.tntInstId = $('.tntInstId').val();
//          addItem.dscd = nbrgObjDscd;
//          addItem.totDigit = totDigit;
//          addItem.process = 'C';
//          numberingPreFixGrid03.addData(addItem);

//          $('.numbering-prefix-add').hide();
//          }
//          }
          });
        }
      }
  });
}

/**
 * 특정항목 그리드
 */
function renderNumberingPreFixGrid01() {
  var grid = PFComponent.makeExtJSGrid({
    pageAble: true,
    //fields: ['tntInstId', 'dmnCd', 'instncCd','instncCdNm', 'refKey', 'dscd', 'totDigitCnt', 'refDigitCnt', 'lastModifier', 'gmtLastModify', 'process'],
    fields: ['tntInstId', 'numberingItem', 'numberingItemValue', 'refKey', 'dscd', 'totDigitCnt', 'refDigitCnt', 'lastModifier', 'gmtLastModify', 'process'],
    gridConfig: {
      renderTo: '.numbering-ref-key-grid-01',
      columns: [
//      {text: bxMsg('DomainCode'), flex: 0.5, dataIndex: 'dmnCd',
//      editor: {}
//      },
//      {text: bxMsg('InstanceCode'), flex: 0.5, dataIndex: 'instncCd',
//      editor: {}
//      },
//      {text: bxMsg('InstanceCodeName'), flex: 1, dataIndex: 'instncCdNm',
//      editor: {}
//      },

        // 특정항목
        {text: bxMsg('numberingItem'), flex: 2.3, dataIndex: 'numberingItem',
          editor: {
            xtype: 'combo',
            typeAhead: true,
            editable: false,
            triggerAction: 'all',
            displayField: 'name',
            valueField: 'name',
            store: new Ext.data.Store({
              fields: ['code', 'name'],
              data: codeArrayObj['NumberingItemCode'] // 채번규칙특정항목코드
            })
          }
        },
        {text: bxMsg('numberingItemValue'), flex: 1, dataIndex: 'numberingItemValue',
          editor: {}
        },
        {text: bxMsg('refKey'), flex: 1, dataIndex: 'refKey',
          editor: {}
        },
        // 참조키자릿수 ( 참조키중 몇자리를 쓸것인지 정의, 미정의시 totDigitCnt를 사용 )
        {text: bxMsg('refDigitCnt'), flex: 1, dataIndex: 'refDigitCnt',
          editor: {maxLength:2}
        },
        // delete row
        {
          xtype: 'actioncolumn', width: 35, align: 'center', sortable: false,
          items: [{
            icon: '/images/x-delete-16.png',
            handler: function (grid, rowIndex, colIndex, item, e, record) {
            	
            	// 정상 삭제는 되나, 관련 데이터가 있는 경우 warning message 추가 필요. "데이터가 있는데 진짜 삭제하시겠습니까"							
            	PFComponent.showConfirm(bxMsg('existsNbrgDataDeleteCheck'), function() {
                    if(record.data.process != 'C') {
                        record.data.process = 'D';
                        deletePreFixPopupList.push(record.data);
                      }
                      record.destroy();
                }, function() {
                    return;
                });
            }
          }]
        }
        ],
        plugins: [
          Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1,
            listeners:{
              afteredit: function(e, editor){
                if(editor.originalValue !=  editor.value && editor.record.get('process') != 'C'){
                  editor.record.set('process', 'U');
                }

                // 참조키를 입력하면 자동으로 refDigit길이 자동세팅
                if(editor.field == 'refKey') {
                  editor.record.set('refDigitCnt', editor.record.get('refKey').length);
                }
              },
              beforeedit:function(e, editor) {
              }
            }
          })
          ],
          listeners: {
            scope: this,
            itemdblclick : function(tree, record){
            },
            cellclick : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
            }
          }
    }
  });
  return grid;
}

/**
 * 특정항목_입력값
 */
function renderNumberingPreFixGrid03() {
  var grid = PFComponent.makeExtJSGrid({
    pageAble: true,
    //fields: ['tntInstId', 'dmnCd', 'instncCd','instncCdNm', 'refKey', 'dscd', 'totDigitCnt', 'refDigitCnt', 'lastModifier', 'gmtLastModify', 'process'],
    fields: ['tntInstId', 'numberingItem', 'numberingItemValue', 'refKey', 'dscd', 'totDigitCnt', 'refDigitCnt', 'lastModifier', 'gmtLastModify', 'process'],
    gridConfig: {
      renderTo: '.numbering-ref-key-grid-03',
      columns: [
//      {text: bxMsg('DomainCode'), flex: 0.5, dataIndex: 'dmnCd',
//      editor: {}
//      },
//      {text: bxMsg('InstanceCode'), flex: 0.5, dataIndex: 'instncCd',
//      editor: {}
//      },
//      {text: bxMsg('InstanceCodeName'), flex: 1, dataIndex: 'instncCdNm',
//      editor: {}
//      },

        // 특정항목
        {text: bxMsg('numberingItem'), flex: 2.3, dataIndex: 'numberingItem',
          editor: {
            xtype: 'combo',
            typeAhead: true,
            editable: false,
            triggerAction: 'all',
            displayField: 'name',
            valueField: 'name',
            store: new Ext.data.Store({
              fields: ['code', 'name'],
              data: codeArrayObj['NumberingItemCode'] // 채번규칙특정항목코드
            })
          }
        },
        {text: bxMsg('numberingItemValue'), flex: 1, dataIndex: 'numberingItemValue',
          editor: {}
        },
        {text: bxMsg('refKey'), flex: 2.3, dataIndex: 'refKey',
          editor: {
            xtype: 'combo',
            typeAhead: true,
            editable: false,
            triggerAction: 'all',
            displayField: 'name',
            valueField: 'name',
            store: new Ext.data.Store({
              fields: ['code', 'name'],
              data: codeArrayObj['NumberingItemCode'] // 채번규칙특정항목코드
            })
          }
        },
        // 참조키자릿수 ( 참조키중 몇자리를 쓸것인지 정의, 미정의시 totDigitCnt를 사용 )
        {text: bxMsg('refDigitCnt'), flex: 1, dataIndex: 'refDigitCnt',
          editor: {maxLength:2}
        },
        // delete row
        {
          xtype: 'actioncolumn', width: 35, align: 'center', sortable: false,
          items: [{
            icon: '/images/x-delete-16.png',
            handler: function (grid, rowIndex, colIndex, item, e, record) {
            	
            	// 정상 삭제는 되나, 관련 데이터가 있는 경우 warning message 추가 필요. "데이터가 있는데 진짜 삭제하시겠습니까"							
            	PFComponent.showConfirm(bxMsg('existsNbrgDataDeleteCheck'), function() {
                    if(record.data.process != 'C') {
                        record.data.process = 'D';
                        deletePreFixPopupList.push(record.data);
                      }
                      record.destroy();
                }, function() {
                    return;
                });
            }
          }]
        }
        ],
        plugins: [
          Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1,
            listeners:{
              afteredit: function(e, editor){
                if(editor.originalValue !=  editor.value && editor.record.get('process') != 'C'){
                  editor.record.set('process', 'U');
                }

                // 참조키를 입력하면 자동으로 refDigit길이 자동세팅
                if(editor.field == 'refKey') {
                  //editor.record.set('refDigitCnt', editor.record.get('refKey').length);
                }
              },
              beforeedit:function(e, editor) {
              }
            }
          })
          ],
          listeners: {
            scope: this,
            itemdblclick : function(tree, record){
            },
            cellclick : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
            }
          }
    }
  });
  return grid;
}

/**
 * 상수값그리드
 * @returns
 */
function renderNumberingPreFixGrid02() {
  var grid = PFComponent.makeExtJSGrid({
    pageAble: true,
    fields: ['tntInstId', 'refKey', 'dscd', 'totDigitCnt', 'refDigitCnt', 'lastModifier', 'gmtLastModify', 'process'],
    gridConfig: {
      renderTo: '.numbering-ref-key-grid-02',
      columns: [
        {text: bxMsg('refKey'), flex: 1, dataIndex: 'refKey',
          editor: {}
        },
        // 참조키자릿수
        {text: bxMsg('refDigitCnt'), flex: 1, dataIndex: 'refDigitCnt',
          editor: {maxLength:2}
        },
        // delete row
        {
          xtype: 'actioncolumn', width: 35, align: 'center', sortable: false,
          items: [{
            icon: '/images/x-delete-16.png',
            handler: function (grid, rowIndex, colIndex, item, e, record) {
            	
            	// 정상 삭제는 되나, 관련 데이터가 있는 경우 warning message 추가 필요. "데이터가 있는데 진짜 삭제하시겠습니까"
            	PFComponent.showConfirm(bxMsg('existsNbrgDataDeleteCheck'), function() {
                    if(record.data.process != 'C') {
                        record.data.process = 'D';
                        deletePreFixPopupList.push(record.data);
                      }
                      record.destroy();
                }, function() {
                    return;
                });
            }
          }]
        }
        ],
        plugins: [
          Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1,
            listeners:{
              afteredit: function(e, editor){
                if(editor.originalValue !=  editor.value && editor.record.get('process') != 'C'){
                  editor.record.set('process', 'U');
                }

                // 참조키를 입력하면 자동으로 refDigit길이 자동세팅
                if(editor.field == 'refKey') {
                  editor.record.set('refDigitCnt', editor.record.get('refKey').length);
                }
              },
              beforeedit:function(e, editor) {
              }
            }
          })
          ],
          listeners: {
            scope: this,
            itemdblclick : function(tree, record){
            },
            cellclick : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
            }
          }
    }
  });
  return grid;
}

//
//                        	/**
//                        	 * 특정테이블컬럼값그리드
//                        	 * @returns
//                        	 */
//                        	function renderNumberingPreFixGrid03() {
//                        		var grid = PFComponent.makeExtJSGrid({
//                        			pageAble: true,
//                        			fields: ['tntInstId', 'tableName', 'columnName', 'refKey', 'dscd', 'totDigitCnt', 'refDigitCnt', 'lastModifier', 'gmtLastModify', 'process'],
//                        			gridConfig: {
//                        				renderTo: '.numbering-ref-key-grid-03',
//                        				columns: [
//                        				          // 테이블
//                        				          {text: bxMsg('PAS0501String11'), flex: 1, dataIndex: 'tableName',
//                        				        	  editor: {}
//                        				          },
//                        				          // 컬럼
//                        				          {text: bxMsg('numberingColumn'), flex: 1, dataIndex: 'columnName',
//                        				        	  editor: {}
//                        				          },
//                        				          // 일련번호자릿수
//                        				          {text: bxMsg('refDigitCnt'), flex: 1, dataIndex: 'refDigitCnt',
//                        				        	  editor: {}
//                        				          },
//                        				          // delete row
//                        				          {
//                        				        	  xtype: 'actioncolumn', width: 35, align: 'center', sortable: false,
//                        				        	  items: [{
//                        				        		  icon: '/images/x-delete-16.png',
//                        				        		  handler: function (grid, rowIndex, colIndex, item, e, record) {
//                        				        			  if(record.data.process != 'C') {
//                        				        				  record.data.process = 'D';
//                        				        				  deletePreFixPopupList.push(record.data);
//                        				        			  }
//                        				        			  record.destroy();
//                        				        		  }
//                        				        	  }]
//                        				          }
//                        				          ],
//                        				plugins: [
//            				                    Ext.create('Ext.grid.plugin.CellEditing', {
//            				                    	clicksToEdit: 1,
//            				                    	listeners:{
//            				                    		afteredit: function(e, editor){
//            				                    			if(editor.originalValue !=  editor.value && editor.record.get('process') != 'C'){
//            				                    				editor.record.set('process', 'U');
//            				                    			}
//            				                    		},
//            				                    		beforeedit:function(e, editor) {
//            				                    		}
//            				                    	}
//            				                    })
//    				                    ],
//    				                    listeners: {
//    				                    	scope: this,
//    				                    	itemdblclick : function(tree, record){
//    				                    	},
//    				                    	cellclick : function(_this, td, cellIndex, record, tr, rowIndex, e, eOpts) {
//    				                    	}
//    				                    }
//                        			}
//                        		});
//                        		return grid;
//                        	}

/**
 * 채번규칙 자릿수 팝업 그리드
 * 2017.03.03 preFixSetYn 추가
 *  - 사용자가 팝업화면서 참조키설정여부를 체크박스로 확인하기위함
 */
function renderNumberingDigitGrid(){
    var grid = PFComponent.makeExtJSGrid({
    	pageAble: true,
        fields: ['tntInstId', 'dscd','refKey','lastNbr', 'totDigitCnt', 'lastModifier', 'gmtLastModify', 'process', 'preFixYn', 'wayDscd'],
        gridConfig: {
            selModel: Ext.create('Ext.selection.CheckboxModel', {mode: 'SINGLE', allowDeselect:true}),
            renderTo: '.nbrg-tot-digit-cnt-grid',
            columns: [
                {text: bxMsg('dscd'), flex: 0.5, dataIndex: 'dscd',
                    editor: {
                        xtype: 'combo',
                        typeAhead: true,
                        triggerAction: 'all',
                        displayField: 'dscdNm',
                        valueField: 'dscd',
                        matchFieldWidth: false, // 값길이에 따라서 콤보 width 조절
                        editable: false,
                        store: new Ext.data.Store({
                            fields: ['dscd', 'dscdNm'],
                            data: dscdComboDatas
                        })
                    }
                },
                {text: bxMsg('dscdNm'), flex: 1.5, dataIndex: 'dscd',
                    renderer: function(value) {
                        return dscdMapDatas[value] ? dscdMapDatas[value].dscdNm : value;
                    }
                },
                {text: bxMsg('totDigitCnt'), flex: 0.5, dataIndex: 'totDigitCnt',
                    editor: {maxLength:2}
                },
                {xtype: 'checkcolumn', text: bxMsg('preFixSettingYn'), flex: 0.7, disabled:true, dataIndex: 'preFixYn',
                    renderer: function(value, metadata, record) {

                        if (record.get('preFixYn') == 'Y') {
                            return "<input type='checkbox' checked disabled>";
                        } else {
                            return "<input type='checkbox' disabled>";
                        }

                    },
                },

                // OHS 2017.03.02 추가 - prefix를 정의하기위함
                {
                    xtype: 'actioncolumn', width: 35, align: 'center', id:'pre-fix-popup-icon',
                    items: [{
                        icon: '/images/edit-icon30.png',
                        handler: function (_this, rowIndex, colIndex, item, e, record) {
                        	// OHS 20180225 추가 - 총자릿수 정보를 먼저 저장후에 참조키 설정을 할 수 있음.
                        	if(record.data.process == 'C' || record.data.process == 'D') {
                        		PFComponent.showMessage(bxMsg('ShouldBeTotDigitInfoSave'), 'warning');
                        		return;
                        	}
                            _this.focusRow(rowIndex);
                            _renderNumberingPreFix(record.data);

                        }
                    }]
                },
                // delete row
                {
                    xtype: 'actioncolumn', width: 35, align: 'center', sortable: false,
                    items: [{
                        icon: '/images/x-delete-16.png',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                        	
                        	// 정상 삭제는 되나, 관련 데이터가 있는 경우 warning message 추가 필요. "데이터가 있는데 진짜 삭제하시겠습니까"
                        	PFComponent.showConfirm(bxMsg('existsNbrgDataDeleteCheck'), function() {
                                if(record.data.process != 'C') {
                                    record.data.process = 'D';
                                    deleteTotDigitCntPopupList.push(record.data);
                                }
                                record.destroy();
                            }, function() {
                                return;
                            });
                        }
                    }]
                }

            ],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                        afteredit: function(e, editor){
                            if(editor.field == 'dscd') {
                                if(numberingDigitGrid && numberingDigitGrid.getAllData().length > 0) {
                                    var dupCnt = 0;
                                    numberingDigitGrid.getAllData().forEach(function(el) {
                                        if(editor.record.data.dscd == el.dscd) {
                                            dupCnt++;
                                        }
                                    });
                                    if(dupCnt > 1) {
                                        PFComponent.showMessage(bxMsg('AlreadySavedNbrgDscd'), 'warning');
                                        return;
                                    }
                                }
                            }
                            if(editor.originalValue !=  editor.value && editor.record.get('process') != 'C'){
                                editor.record.set('process', 'U');
                            }
                        },
                        beforeedit:function(e, editor) {
                            // 'C'가 아니면 구분코드, 참조키 수정불가
                            if (editor.record.data.process !== 'C'
                                && (editor.field == 'dscd')) {
                                return false;
                            }
                            else if(editor.field == 'preFixYn') {
                            	return false;
                            }
                        }
                    }
                })
            ],
            listeners: {
                scope: this,
                itemdblclick : function(tree, record){
                }
            }
        }
    });
    return grid;
}

/**
 * 참조키설정 아이콘을위한 ToolTip함수
 */
var nbrgToolTip = function($el) {
    $($el).on('mouseenter', '.x-grid-cell-pre-fix-popup-icon .x-action-col-icon', function (e) {
        var that = this,
            $toolTip = $('.tooltip');

            var message = $(that).attr('icon-tooltip');

            if($toolTip.is(':visible')) {
                return;
            }

            $('.tooltip-message').text(bxMsg('preFixSetting')); // Messge : 참조키 설정

            $toolTip.removeAttr('style');
            $toolTip.css({top: e.pageY+15, left: e.pageX+15}).show();
            $toolTip.css('z-index', 2000);
    }).on('mouseleave', '.x-grid-cell-pre-fix-popup-icon .x-action-col-icon', function (e) {
        var $toolTip = $('.tooltip');

        if(!$toolTip.is(':visible')) {
            return;
        }

        $toolTip.hide();
    });
}

