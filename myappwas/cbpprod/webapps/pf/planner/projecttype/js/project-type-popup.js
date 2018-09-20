/******************************************************************************************************************
 * 개발과졔 유형 관리 팝업
 ******************************************************************************************************************/
var popupModifyFlag = false;
function renderProjectTypeMasterPopup(data){

  popupModifyFlag = false;
  var projectTypeMngListGrid;

  var  buttons = [
      // 저장 버튼
      {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn',handler:function(){

        var form = PFComponent.makeYGForm($('.project-type-info-table'));
        var that = this;

        var name = $('.project-type-name').val();
        if(!name){
          PFComponent.showMessage(bxMsg('ProjectTypeNameError'), 'warning');       // 액티비티명은 필수입력사항입니다
          return;
        }

        var requestData = form.getData();
        requestData.registUserName = getLoginUserId();                      // 최종변경자명
        requestData.relationList = projectTypeMngListGrid.getAllData();

        var nameLengthCheck = PFValidation.finalLengthCheck('',100,name);
        var mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');

        if(nameLengthCheck && mandatoryCheck){

        	if(data && data.work == "CREATE"){
		          PFRequest.post('/projecttype/createProjectTypeMaster.json',requestData,{
		            success: function(response){
		              PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
		              searchProjectTypeData();
		              $('.pf-ppt-project-type-master-form .project-type-code').val(response.projectTypeCode);
		              $('.delete-btn').show();
		              data.work = "UPDATE";
		            },
		            bxmHeader: {
		              application: 'PF_Factory',
		              service: 'ProjectTypeMasterService',
		              operation: 'createProjectTypeMaster'
		            }
		          });
        	}else if (data && data.work == "UPDATE") {  // 업데이트 시

                if(!popupModifyFlag){
            		// 변경된 정보가 없습니다.
            		PFComponent.showMessage(bxMsg('nothingToSave'), 'warning');
            		return;
            	}

        		PFRequest.post('/projecttype/updateProjectTypeMaster.json',requestData,{
                    success: function(){
                      PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
                      searchProjectTypeData();
                    }, bxmHeader: {
                      application: 'PF_Factory',
                      service: 'ProjectTypeMasterService',
                      operation: 'updateProjectTypeMaster'
                    }
                  });
        	}
        }
      }}
      ];


  buttons.push(
	// 삭제 버튼
      {text:bxMsg('ButtonBottomString2'), elCls:'button button-primary delete-btn write-btn',handler:function(){
        var form = PFComponent.makeYGForm($('.project-type-info-table'));
        var that = this;
        PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), function() {
          PFRequest.post('/projecttype/deleteProjectTypeMaster.json',form.getData(),{
            success:function(){
              PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');
              searchProjectTypeData();
              that.close();
            },
            bxmHeader: {
              application: 'PF_Factory',
              service: 'ProjectTypeMasterService',
              operation: 'deleteProjectTypeMaster'
            }
          });
        }, function() {
          return;
        });
      }}
  );
  buttons.push(
	// 닫기 버튼
      {text:bxMsg('ContextMenu_Close'), elCls:'button button-primary',handler:function(){
    	popupModifyFlag = false;
        this.close();
      }}
  );

  // 팝업 호출
  PFComponent.makePopup({
    title: bxMsg('PAM0300Title'),           // 개발과제유형관리
    contents: projectTypePopupDetailFormTpl(data),
    width:700,
    height:335,
    buttons: buttons,
    modifyFlag : 'popup',
    contentsEvent: {
      // 액티비티 추가 버튼 클릭 시
      'click .add-activity-popup-btn': function() {
        var submitEvent = function(selectedItems){
          var beforeGridData = projectTypeMngListGrid.getAllData();
          var index = 0;
          beforeGridData.forEach(function(bf){
            index = Math.max(bf.inquirySequence, index);
          });

          selectedItems.forEach(function(el){
            var idCheckflag = false;
            beforeGridData.forEach(function(bf){
              if(bf.activityId == el.activityId){
                idCheckflag = true;
                return;
              }
            });
            if(idCheckflag) return;    // 그리드에 이미 같은 id가 존재하면 return;

            el.applyStartDate = PFUtil.getToday();
            el.applyEndDate   = '9999-12-31';
            el.isMandatory    = false;
            el.inquirySequence= ++index;
            projectTypeMngListGrid.addData(el);
            popupModifyFlag = true;
          });
        };
        renderActivitySearchPopup(submitEvent);
      }
    },
    listeners: {
    	afterSyncUI: function() {
        // 그리드
        projectTypeMngListGrid = renderProjectTpteMngListGrid();

        // 신규 요청 일 때
        if(data && data.work == "CREATE") {
          $('.regist-user-name').val(getLoginUserId());                         // 등록사원ID
          //$('.regist-date').val(commonConfig.currentXDate.toString('yyyy-MM-dd HH:mm:ss'));             // 등록일자
          $('.delete-btn').hide();
        } else if(data && data.work == "UPDATE") {
          $('.file-need-yn-select').val(data.fileNeedYn);
          $('.contents-text-box-need-yn-select').val(data.contentNeedYn);
          if(data.relationList){
            projectTypeMngListGrid.setData(data.relationList);
          }
        }

      }
    }
  });

}

// 그리드
function renderProjectTpteMngListGrid() {
  var grid = PFComponent.makeExtJSGrid({
    fields: [
      "activityId","activityName", "applyStartDate", "applyEndDate", 'isMandatory', 'inquirySequence'
      ],
      gridConfig: {
        renderTo: '.pf-ppt-project-type-mng-list-grid',
        columns: [
          {text: bxMsg('ActivityId')	  	, flex:    1, dataIndex: 'activityId', style: 'text-align:center'},		// 액티비티 ID
          {text: bxMsg('ActivityName')  	, flex:    1, dataIndex: 'activityName', style: 'text-align:center'},	// 액티비티명
          {	// 적용시작일자
            text: bxMsg('DPP0127String6'),
            flex: 1,
            dataIndex: 'applyStartDate',
            align: 'center',
            editor: {
              allowBlank: false,
              listeners: {
                focus: function(_this) {
                  PFUtil.getGridDatePicker(_this, 'applyStart',grid,selectedCellIndex);
                }
              }
            },
            listeners: {
              click: function() {
                selectedCellIndex = $(arguments[1]).parent().index();
              }
            }
          },
          {	// 적용종료일자
            text: bxMsg('DPP0127String7'),
            flex:    1,
            dataIndex: 'applyEndDate',
            align: 'center',
            editor: {
              allowBlank: false,
              listeners: {
                focus: function(_this) {
                  PFUtil.getGridDatePicker(_this, 'applyEnd',grid,selectedCellIndex);
                }
              }
            },
            listeners: {
              click: function() {
                selectedCellIndex = $(arguments[1]).parent().index();
              }
            }
          },
          {	// 필수여부
            xtype: 'checkcolumn',
            text: bxMsg('DPS0104String4'),
            flex:    1,
            dataIndex: 'isMandatory',
            align: 'center',
            listeners: {
              checkchange: function(column, rowIndex, checked, eOpts){
            	  popupModifyFlag = true;
              }
            }
          },
          {	// 조회순서
            text: bxMsg('inquirysequence'),
            flex: 1,
            dataIndex: 'inquirySequence',
            align: 'center',
            editor:{allowBlank:false}
          },
          {
            xtype: 'actioncolumn', width: 35, align: 'center',
            items: [{
              icon: '/images/x-delete-16.png',
              handler: function (grid, rowIndex, colIndex, item, e, record) {
            	  popupModifyFlag = true;
            	  record.destroy();
              }
            }]
          }
          ],
          plugins: [
            Ext.create('Ext.grid.plugin.CellEditing', {
              clicksToEdit: 1,
              listeners:{
                  afteredit: function(e, editor){
                      if(editor.originalValue !=  editor.value){
                    	  popupModifyFlag = true;
                      }
                  }
              }
            })
            ]
      }
  });

  return grid;
}
