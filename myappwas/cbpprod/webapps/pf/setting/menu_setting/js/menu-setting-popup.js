/******************************************************************************************************************
 * 화면 설정 상세 팝업
 ******************************************************************************************************************/
function renderScreenConfigDetailPopup(data){
  //화면설정상세 팝업
  const menuScreenDetailPopupTpl = getTemplate('menuScreenDetailPopupTpl');

  var buttons = [];

  if(data && data.work == "CREATE") {
    buttons = [
      // 저장 버튼
      {text:bxMsg('ButtonBottomString1'), elCls:'button button-primary write-btn',handler:function(){
        var that = this;
        if($('.pf-menu-screen-form').find('.scrn-id').val() && !PFValidation.finalLengthCheck($('.pf-menu-screen-form').find('.scrn-id'), 3)) {
          return;
        }

        if(!$('.pf-menu-screen-form').find('.scrn-name').val()){
          // 화면명은 필수입력값 입니다.
          PFComponent.showMessage(bxMsg('scrnNmMandatory'), 'warning');
          return;
        }
        if(!$('.pf-menu-screen-form').find('.scrn-url-addr').val()){
          // 화면URL주소는 필수입력값 입니다.
          PFComponent.showMessage(bxMsg('scrnUrlAddrMandatory'), 'warning');
          return;
        }

        var requestData = {
            "scrnId" : $('.pf-menu-screen-form').find('.scrn-id').val(),
            "scrnNm" : $('.pf-menu-screen-form').find('.scrn-name').val(),
            "scrnUrlAddr" : $('.pf-menu-screen-form').find('.scrn-url-addr').val(),
            "menuTrgtScrnYn" : $('.pf-menu-screen-form').find('.menu-target-yn').val(),
            "actvYn" : $('.pf-menu-screen-form').find('.actv-yn').val(),
        };

        PFRequest.post('/common/menu/createScreenMaster.json',requestData,{
          success: function(){
            PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
            searchScreenMasterList();
            that.close();
          }, bxmHeader: {
            application: 'PF_Factory',
            service: 'ScreenService',
            operation: 'createScreenInfo'
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
        if(!$('.pf-menu-screen-form').find('.scrn-id').val()) {
          // 화면ID는 필수입력값 입니다.
          PFComponent.showMessage(bxMsg('scrnIsMandatory'), 'warning');
          return;
        }

        if(!$('.pf-menu-screen-form').find('.scrn-name').val()) {
          // 화면명은 필수입력값 입니다.
          PFComponent.showMessage(bxMsg('scrnNmMandatory'), 'warning');
          return;
        }
        if(!$('.pf-menu-screen-form').find('.scrn-url-addr').val()) {
          // 화면URL주소는 필수입력값 입니다.
          PFComponent.showMessage(bxMsg('scrnUrlAddrMandatory'), 'warning');
          return;
        }
        var requestData = {
            "scrnId" : $('.pf-menu-screen-form').find('.scrn-id').val(),
            "scrnNm" : $('.pf-menu-screen-form').find('.scrn-name').val(),
            "scrnUrlAddr" : $('.pf-menu-screen-form').find('.scrn-url-addr').val(),
            "menuTrgtScrnYn" : $('.pf-menu-screen-form').find('.menu-target-yn').val(),
            "actvYn" : $('.pf-menu-screen-form').find('.actv-yn').val(),
        };


        PFRequest.post('/common/menu/updateScreenMaster.json',requestData,{
          success: function(){
            PFComponent.showMessage(bxMsg('Z_SaveSucceed'), 'success');
            searchScreenMasterList();
            that.close();
          }, bxmHeader: {
            application: 'PF_Factory',
            service: 'ScreenService',
            operation: 'updateScreenInfo'
          }
        });
      }},
      // 삭제 버튼
      {text:bxMsg('ButtonBottomString2'), elCls:'button button-primary write-btn screen-delete-btn',handler:function(){
    	  var that = this;
    	  if(!$('.pf-menu-screen-form').find('.scrn-id').val()){
    		  //화면ID는 필수입력값 입니다.
    		  PFComponent.showMessage(bxMsg('scrnIsMandatory'), 'warning');
    		  return;
    	  }
    	  var requestData = {
    			  "scrnId" : $('.scrn-id').val()
    	  }
    	  PFComponent.showConfirm(bxMsg('Z_Q_ProductDelete'), function() {
    		  PFRequest.post('/common/menu/deleteScreenMaster.json',requestData,{
	            success:function(){
	              PFComponent.showMessage(bxMsg('Z_DeleteSucced'), 'success');
	              searchScreenMasterList();
	              that.close();
	            },
	            bxmHeader: {
	              application: 'PF_Factory',
	              service: 'ScreenService',
	              operation: 'deleteScreenInfo'
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

  if(data.scrnUrlAddr && data.scrnUrlAddr.indexOf('product_compare') != -1 
		  && buttons && buttons.length == 3) {
	  buttons = [buttons[0], buttons[2]];
  }
  
  // 팝업 호출
  PFComponent.makePopup({
    // 화면설정상세
    title: bxMsg('screenConfigDetail'),
    contents: menuScreenDetailPopupTpl(data),
    width:400,
    height:260,
    buttons: buttons,
    contentsEvent: {
    },
    listeners: {
      afterRenderUI: function() {
        if(data.work == "UPDATE" || data.work == "DELETE") {
          $('.pf-menu-screen-form').find('.scrn-id').prop('disabled', true);
        }
        // 메뉴대상화면여부 콤보조립
        makeComboBox("ProductBooleanCode", $('.pf-menu-screen-form').find('.menu-target-yn'));
        // 활동여부 콤보조립
        makeComboBox("ProductBooleanCode", $('.pf-menu-screen-form').find('.actv-yn'));

        $('.pf-menu-screen-form').find('.menu-target-yn').val(data.menuTargetScrnYn);
        $('.pf-menu-screen-form').find('.actv-yn').val(data.actvYn);
        
        if($('.pf-menu-screen-form').find('.scrn-url-addr').val()
        		&& $('.pf-menu-screen-form').find('.scrn-url-addr').val().indexOf('product_compare') != -1) {
        	$('.pf-menu-screen-form').find('.screen-delete-btn').css('display', 'none');
        	
        }
      },
      afterBindUI : function() {
          if($('.pf-menu-screen-form').find('.scrn-url-addr').val()
          		&& $('.pf-menu-screen-form').find('.scrn-url-addr').val().indexOf('product_compare') != -1) {
          	$('.pf-menu-screen-form').find('.screen-delete-btn').css('display', 'none');
          	
          }
      },
      afterCreateDom : function() {
          if($('.pf-menu-screen-form').find('.scrn-url-addr').val()
            		&& $('.pf-menu-screen-form').find('.scrn-url-addr').val().indexOf('product_compare') != -1) {
            	$('.pf-menu-screen-form').find('.screen-delete-btn').css('display', 'none');
            	
            }
      }
    }
  });

}


/**
 * 콤보조립을 위한 함수
 * @param codeName
 * @param renderTo
 */
function makeComboBox(codeName, renderTo, defaultValue) {
	if(!codeName || !renderTo) return;

    var options = [];
    var $defaultOption = $('<option>');
    $.each(codeMapObj[codeName], function(key,value){
        var $option = $('<option>');
        $option.val(key);
        $option.text(value);

        options.push($option);
    });
    $(renderTo).html(options);

    if (defaultValue) {
    	$(renderTo).val(defaultValue);
    }
}



/******************************************************************************************************************
 * 화면 선택 팝업
 * @param submitEvent
 ******************************************************************************************************************/
function renderScreenListSelectionPopup(submitEvent) {
  // 화면목록조회 팝업
  const screenListQueryPopupTpl = getTemplate('screenListQueryPopupTpl');
  var menuScreenListPopupGrid;

	PFComponent.makePopup({
    	// 화면 선택
        title: bxMsg('screenListSelection'),
        contents: screenListQueryPopupTpl(),
        submit: function() {
            var selectItem = menuScreenListPopupGrid.getSelectedItem();
            if(selectItem) {
            	submitEvent(selectItem[0]);
            }
        },
        width:470,
        height:500,
        //buttons: buttons,
        contentsEvent: {
            'click .cnd-tpl-search': function () {
            	var requestData = {};
            	requestData.actvYn = 'Y';				// 활동여부Y
            	requestData.menuTrgtScrnYn = 'Y';		// 메뉴대상화면여부Y
            	requestData.scrnId = $('.pf-screen-list-popup-table').find('.scrn-id').val();
            	requestData.scrnNm = $('.pf-screen-list-popup-table').find('.scrn-name').val();
                PFRequest.get("/common/menu/getScreenMasterList.json" , requestData, {
                    success: function(responseData) {
                    	if(responseData && responseData.scrnMasterList) {
                    		menuScreenListPopupGrid.setData(responseData.scrnMasterList);
                    	}
                    	else {
                    		menuScreenListPopupGrid.setData([]);
                    	}
                    },
                    bxmHeader: {
                        application: 'PF_Factory',
                        service: 'ScreenService',
                        operation: 'getListScreen'
                    }
                });
            }
        },
        listeners: {
            afterRenderUI: function() {
            	renderScreenListPopupGrid();
            }
        }
    });


	/**
	 * 화면목록조회 그리드
	 */
	function renderScreenListPopupGrid() {
	  $('.pf-screen-list-popup-grid').empty();
	  var checkboxmodel = Ext.create ('Ext.selection.CheckboxModel', {mode:'SINGLE'});
	  menuScreenListPopupGrid = PFComponent.makeExtJSGrid({
	    // 화면ID, 화면명, 화면URL주소, 메뉴대상화면여부, 활동여부
	    fields: [
	      "scrnId", "scrnNm", "scrnUrlAddr", "menuTrgtScrnYn", "actvYn"
	      ],
	      gridConfig: {
	        selModel: checkboxmodel,
	        renderTo: '.pf-screen-list-popup-grid',
	        columns: [
	          {text: bxMsg('ScrnId'), flex:  1  , dataIndex: 'scrnId'},
	          {text: bxMsg('ScrnNm'), flex: 2, dataIndex: 'scrnNm'},
	          {text: bxMsg('ScrnUrlAddr'), flex:  2  , dataIndex: 'scrnUrlAddr'}
	          ],
	          listeners: {
	            scope: this,
	            itemdblclick : function(tree, record) {
	            },
	            afterrender : function(){
	              var requestData = {};
	              requestData.actvYn = 'Y';				// 활동여부Y
	              requestData.menuTrgtScrnYn = 'Y';		// 메뉴대상화면여부Y
	              requestData.scrnId = $('.pf-screen-list-popup-table').find('.scrn-id').val();
	              requestData.scrnNm = $('.pf-screen-list-popup-table').find('.scrn-name').val();
	              PFRequest.get("/common/menu/getScreenMasterList.json" , requestData, {
	                success: function(responseData) {
	                  if(responseData && responseData.scrnMasterList) {
	                    menuScreenListPopupGrid.setData(responseData.scrnMasterList);
	                  }
	                  else {
	                    menuScreenListPopupGrid.setData([]);
	                  }
	                },
	                bxmHeader: {
	                  application: 'PF_Factory',
	                  service: 'ScreenService',
	                  operation: 'getListScreen'
	                }
	              });
	            }
	          }
	      }
	  });
	}
}
