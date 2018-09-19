define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPAR/030/_CAPAR030.html'
        , 'bx-component/date-picker/_date-picker'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx-component/bx-tree/bx-tree'
        , 'app/views/page/popup/CAPAR/popup-condition-search'
        , 'app/views/page/popup/CAPAR/popup-vldtn-rule-class-search'
        , 'app/views/page/popup/CAPAR/popup-xtnAtrbt-class-search'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , DatePicker
        , ExtGrid
        , bxTree
        , PopupConditionSearch
        , PopupClassSearch
        , PopupXtnClassSearch
        , commonInfo
        ) {


        /**
         * Backbone
         */
        var CAPAR030View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPAR030-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                	'click #btn-tree-search' : 'loadTreeList'
            		, 'keydown #searchKey' : 'fn_enter'
					, 'click #btn-tree-hide': 'hideTree'
					, 'click #btn-tree-show': 'showTree'
					, 'click #tab-pd-cnd': 'clickPdCndTab'
					, 'click #tab-vldtn-rule': 'clickVldtnRuleTab'
					, 'click #tab-xtn-atrbt': 'clickXtnAtrbtTab'
					, 'click #btn-move-up': 'moveConditionItemUp'
					, 'click #btn-move-down': 'moveConditionItemDown'
					, 'click #btn-xtnAtrbt-move-up': 'moveXtnAtrbtItemUp'
					, 'click #btn-xtnAtrbt-move-down': 'moveXtnAtrbtItemDown'
					, 'click #btn-save-cnd-list': 'saveConditionList'
					, 'click #btn-save-class-list': 'saveClassList'
					, 'click #btn-save-xtnAtrbt-list': 'saveXtnClassList'
					, 'click #btn-grid-area-toggle': 'toggleGridArea'							
					, 'click #btn-reset-condition': 'resetConditionAttribute'
					, 'click #btn-reset-class': 'resetClassAttribute'
					, 'click #btn-reset-xtn-class': 'resetExtendsAttribute'	
					, 'click #btn-save-condition': 'saveConditionAttribute'
					, 'click #btn-save-class': 'saveClassAttribute'
					, 'click #btn-save-xtnAtrbt': 'saveClassExtendsAttribute'	
					, 'click #btn-base-area-toggle': 'toggleBaseArea'	
					, 'click #btn-condition-search': 'openConditionSearchPopup'
					, 'click #btn-class-search': 'openClassSearchPopup'
					, 'click #btn-attribute-search': 'openXtnClassSearchPopup'
                }


//
//
//
                , initialize: function (initData) {
                    var that = this;
                    that.that = this;




                    var deleteList = [];


                    $.extend(that, initData);
                    that.$el.html(that.tpl());


                    that.initData = initData;


                    // 왼쪽 트리 생성
                    that.fn_createTree();


                    that.fn_createGrid();


                }


                , fn_createGrid: function() {


                	var that = this;


                	that.CAPAR030Grid01 = new ExtGrid({
                        // 그리드 컬럼 정의
                        fields: ['aplySeq', 'cndCd', 'cndNm', 'cndUseWayNm']
                        , id: 'CAPAR030Grid'
                        , columns: [
                            {
                                text: 'No.'
                                , dataIndex: 'aplySeq'
                                , sortable: false
                                , height : 25
                                , width: 40
                                , style: 'text-align:center'
                                , align: 'center'
                                // other config you need....
                                , renderer: function (value, metaData, record, aplySeq) {
                                	record.data.aplySeq = ++aplySeq;
                                    return aplySeq;
                                }
                            }
                            , {text: bxMsg('cbb_items.AT#cndCd'), flex: 1, dataIndex: 'cndCd', style: 'text-align:center', align: 'left'}                                        
                            , {text: bxMsg('cbb_items.AT#cndNm'), flex: 1, dataIndex: 'cndNm', style: 'text-align:center', align: 'left'}
                            , {text: bxMsg('cbb_items.AT#cndUseWayNm'), flex: 1, dataIndex: 'cndUseWayNm', style: 'text-align:center', align: 'left'}
                            , {
                             	xtype: 'actioncolumn', width: 60, align: 'center',text: bxMsg('cbb_items.SCRNITM#del')
                             	 , style: 'text-align:center'
                             	, items: [
												{
												//  icon: 'images/icon/x-delete-16.png'
												  iconCls : "bw-icon i-25 i-func-trash"
												  , tooltip: bxMsg('tm-layout.delete-field')
												  , handler: function (grid, rowIndex, colIndex, item, e, record) {
													  if(that.deleteList == null){
														  that.deleteList = [];
													  }
													  that.deleteList.push(record.data);


													  var totalIndex = grid.store.count() - 1;
													  var deletedIndex = grid.store.indexOf(record);


													  grid.store.remove(record);


													  for(var i = deletedIndex ; i <= totalIndex ; i++){
														  var tempItem = grid.store.data.items[i];
														  grid.store.remove(tempItem);
														  grid.store.insert(i, tempItem);
													  }
												  }
												}
                             	        ]
                             }
                        ] // end of columns


                        , listeners: {
                        	click:{
                        		element: 'body'
                        		, fn: function () {
                        			console.log("function1");
                        			that.clickGridItem();                                    			
                        		}
                        	} 
                        }
                    });      


                    that.CAPAR030Grid02 = new ExtGrid({
                        // 그리드 컬럼 정의
                        fields: ['rowIndex', 'cmpntNm', 'classNm', 'classDescCntnt']
                        , id: 'CAPAR030Grid'
                        , columns: [
                            {
                                text: 'No.'
                                , dataIndex: 'rowIndex'
                                , sortable: false
                                , height: 25
                                , width: 40
                                , style: 'text-align:center'
                                , align: 'center'
                                // other config you need....
                                , renderer: function (value, metaData, record, rowIndex) {
                                    return rowIndex + 1;
                                }
                            }
                            , {text: bxMsg('cbb_items.AT#cmpntNm'), flex: 2, dataIndex: 'cmpntNm', style: 'text-align:center', align: 'left'}                                        
                            , {text: bxMsg('cbb_items.AT#classNm'), flex: 9, dataIndex: 'classNm', style: 'text-align:center', align: 'left'}
                            , {text: bxMsg('cbb_items.AT#classDescCntnt'), flex: 9, dataIndex: 'classDescCntnt', style: 'text-align:center', align: 'left'}
                            , {
                             	xtype: 'actioncolumn', width: 60, align: 'center',text: bxMsg('cbb_items.SCRNITM#del')
                             	 , style: 'text-align:center'
                             	, items: [
												{
												//  icon: 'images/icon/x-delete-16.png'
												  iconCls : "bw-icon i-25 i-func-trash"
												  , tooltip: bxMsg('tm-layout.delete-field')
												  , handler: function (grid, rowIndex, colIndex, item, e, record) {
													  if(that.deleteList == null){
														  that.deleteList = [];
													  }
													  that.deleteList.push(record.data);


													  var totalIndex = grid.store.count() - 1;
													  var deletedIndex = grid.store.indexOf(record);


													  grid.store.remove(record);


//													  for(var i = deletedIndex ; i <= totalIndex ; i++){
//														  var tempItem = grid.store.data.items[i];
//														  grid.store.remove(tempItem);
//														  grid.store.insert(i, tempItem);
//													  }
												  }
												}
                             	        ]
                             }
                        ] // end of columns


                        , listeners: {
                        	click:{
                        		element: 'body'
                        		, fn: function () {
                        			console.log("function2");
                        			that.clickGridItem();                                    			
                        		}
                        	} 
                        }
                    });


                    that.CAPAR030Grid03 = new ExtGrid({
                    	// 그리드 컬럼 정의
                    	fields: ['rowIndex', 'xtnAtrbtNm', 'atrbtNm']
                    , id: 'CAPAR030Grid'
                    	, columns: [
                    	            {
                    	            	text: 'No.'
                    	            		, dataIndex: 'rowIndex'
                    	            			, sortable: false
                    	            			, height: 25
                    	            			, width: 40
                    	            			, style: 'text-align:center'
                    	            				, align: 'center'
                    	            					// other config you need....
                    	            					, renderer: function (value, metaData, record, rowIndex) {
                    	            						return rowIndex + 1;
                    	            					}
                    	            }
                    	            , {text: bxMsg('cbb_items.AT#xtnAtrbtNm'), flex: 3, dataIndex: 'xtnAtrbtNm', style: 'text-align:center', align: 'left'}                                        
                    	            , {text: bxMsg('cbb_items.AT#atrbtNm'), flex: 4, dataIndex: 'atrbtNm', style: 'text-align:center', align: 'left'}
                    	            , {
                                     	xtype: 'actioncolumn', width: 60, align: 'center',text: bxMsg('cbb_items.SCRNITM#del')
                                     	 , style: 'text-align:center'
                                     	, items: [
        												{
        												//  icon: 'images/icon/x-delete-16.png'
        												  iconCls : "bw-icon i-25 i-func-trash"
        												  , tooltip: bxMsg('tm-layout.delete-field')
        												  , handler: function (grid, rowIndex, colIndex, item, e, record) {
        													  if(that.deleteList == null){
        														  that.deleteList = [];
        													  }
        													  that.deleteList.push(record.data);


        													  var totalIndex = grid.store.count() - 1;
        													  var deletedIndex = grid.store.indexOf(record);


        													  grid.store.remove(record);


        													  for(var i = deletedIndex ; i <= totalIndex ; i++){
        														  var tempItem = grid.store.data.items[i];
        														  grid.store.remove(tempItem);
        														  grid.store.insert(i, tempItem);
        													  }
        												  }
        												}
                                     	        ]
                                     }
                    	            ] // end of columns


                    , listeners: {
                    	click:{
                    		element: 'body'
                    			, fn: function () {
                    				console.log("function3");
                    				that.clickGridItem();                                    			
                    			}
                    	} 
                    }
                    });


                    that.createGrid();
                }


                /**
                 * 서비스 입력 항목의 그리드 항목 클릭
                 */
                , clickGridItem: function () {
                    var selectedRecord = this.CAPAR030Grid.grid.getSelectionModel().selected.items[0];
                    if (!selectedRecord) {
                        return;
                    } else {	
                    	this.selectedRow = selectedRecord;
                    	this.setServiceTypeItem(selectedRecord.data);
                    }
                }           


                /**
                 * 서비스 입력 항목 영역을 받아온 데이터로 세팅
                 * @param data 서버로부터 받아온 데이터
                 */
                , setServiceTypeItem: function (data) {
    				this.typeChangeYn = 'Y';
    				var curTabIdx = this.checkCurrentTab();
    		        switch (curTabIdx) {     
    				case 0:
    					this.$el.find('#CAPAR030-base-table [data-form-param="cndCd"]').val(data.cndCd);
                        this.$el.find('#CAPAR030-base-table [data-form-param="cndNm"]').val(data.cndNm);
                        this.$el.find('#CAPAR030-base-table [data-form-param="cndUseWayNm"] option').each(function(key, value){
                        	if(value.text == data.cndUseWayNm){
                        		$(value).attr("selected", "selected");
                        	}                    	
                        });
						break;
    				case 1:
    					this.$el.find('#CAPAR030-base-table [data-form-param="classNm"]').val(data.classNm);
                        this.$el.find('#CAPAR030-base-table [data-form-param="classDescCntnt"]').val(data.classDescCntnt);
                        break;
    				case 2:
    					this.$el.find('#CAPAR030-base-table [data-form-param="xtnAtrbtNm"]').val(data.xtnAtrbtNm);
    					this.$el.find('#CAPAR030-base-table [data-form-param="atrbtNm"]').val(data.atrbtNm);
    					this.$el.find('#btn-attribute-search').prop("disabled", true);
    					break;
					default:
						break;
					}        
                }
//
//
//
                , render: function () {
                    var that = this;


                    // 콤보데이터 로딩
                    var sParam;


                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = "CAPAR030-cndUseWayNm-wrap";
                    sParam.targetId = "cndUseWayNm";                    
                    sParam.cdNbr = "A0031";
                    // 콤보데이터 load
                    fn_getCodeList(sParam, this);


                    // 기본부 초기화
                    that.resetConditionAttribute();
                    that.resetClassAttribute();
                    that.resetExtendsAttribute();

                  //배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPAR030-wrap #btn-save-cnd-list')
                                        		,this.$el.find('.CAPAR030-wrap #btn-save-class-list')
                                        		,this.$el.find('.CAPAR030-wrap #btn-save-xtnAtrbt-list')
                                        		,this.$el.find('.CAPAR030-wrap #btn-save-condition')
                                        		,this.$el.find('.CAPAR030-wrap #btn-save-class')
                                        		,this.$el.find('.CAPAR030-wrap #btn-save-xtnAtrbt')
                                        			   ]);
                    return this.$el;
                }


//
//
//
                , fn_createTree : function() {
                	var that = this;                 	
                    that.subViews['CAPAR030Tree'] = new bxTree({
                   	   fields: {id: 'cd', value: 'cdNm'},
                       // Tree Item - Checkbox 사용 여부
                          checkAble: false,


                          listeners: {
                              clickItem: function(itemId, itemData, currentTarget, e) {                            	  
                            	  if(itemData.children.length == 0){
                            		  that.inquiryServiceData(itemData);		
                              		  this.$el.val(itemData.cd);
                            	  }
                              }
                          }
                      });


                     that.$el.find('.bx-tree-root').html(that.subViews['CAPAR030Tree'].render());


                     that.selectTree();	


                }


//
//
//
                , selectTree : function() {
                	var that = this;
                	that.treeList = [];


                    var sParam = {};
                    sParam.clHrarcyId = "ArrangementService";


                    var linkData = {"header" : fn_getHeader("CAPAR0308401") , "CaArrCndSrvcMgmtSvcGetServiceTypeIn" : sParam};


                    bxProxy.post(sUrl, JSON.stringify(linkData),{
                 	   enableLoading: true,
                        success: function (responseData) {
                     	   if(fn_commonChekResult(responseData)) {		                      		  
                     		   that.subViews['CAPAR030Tree'].renderItem(responseData.CaArrCndSrvcMgmtSvcGetServiceTypeOutList.tblList);
                     		   that.treeList = responseData.CaArrCndSrvcMgmtSvcGetServiceTypeOutList.tblList;


                     		  if(that.initData.param) {
                     			  if(that.initData.param.scrnNm) {
                     				  that.initTreeList();
                     			  }
                     		  }
                     	   }
                        }
                    });
                }


                // 화면현황에서 넘어 왔을떄 호출 한다.
                , initTreeList : function() {
                	var that = this;	 	
                	that.$el.find('[data-form-param="searchKey"]').val(that.initData.param.scrnNm);


                	that.loadTreeList();


                	if(that.initData.param.scrnNm && that.initData.param.scrnId) {
                		that.subViews['CAPAR030Tree'].selectItem(that.initData.param.scrnId, false);
                		// 상세조회
                		var sParam = {};
                		if(commonInfo.getInstInfo().instCd) {
                    		sParam.instCd = commonInfo.getInstInfo().instCd;
                    	}
                    	else {
                    		sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                    	}
                		sParam.scrnId = that.initData.param.scrnId;
                		that.inquiryServiceData(sParam); // 조회
                	}
                }
//
//
//
                , loadTreeList : function() {
             	   var that = this;


             	   var searchKey = that.$el.find('[data-form-param="searchKey"]').val();


             	   var searchMenuList = [];


             	   if(!searchKey) {
             		   that.subViews['CAPAR030Tree'].renderItem(that.treeList);
             		   return;
             	   }


             	   if(that.treeList.length < 1) {
             		   return;
             	   }


             	   $(that.treeList).each(function(idx, data) {
             		   searchMenuList = that.selectMenu(searchMenuList, data, searchKey);
             	   });


             	   that.subViews['CAPAR030Tree'].renderItem(searchMenuList);
                }


                , selectMenu : function(searchMenuList, obj,  inputValue) {                		
                		for(var i = 0; i < obj.children.length; i++) {
                			var temp001 = obj.children[i];


                			if(temp001.cdNm == inputValue) {
	 	           				searchMenuList[searchMenuList.length] = temp001;	 	           				
	 	           			}
                		}


                	return searchMenuList;
                }


//
//
//
                , fn_enter : function(event) {
          	      	var event = event || window.event;
          	      	var keyID = (event.which) ? event.which : event.keyCode;
          	      	if(keyID == 13) { //enter
          	      		this.loadTreeList();
          	      	}
                }






//
//
//
          , moveConditionItemUp: function (that) {
        	  this.moveSelectedRow(-1);
          }
          , moveConditionItemDown: function (that) {
        	  this.moveSelectedRow(1);
          }
//
//
//
          , moveXtnAtrbtItemUp: function (that) {
        	  this.moveSelectedRow(-1);
          }
          , moveXtnAtrbtItemDown: function (that) {
        	  this.moveSelectedRow(1);
          }




          , moveSelectedRow: function(distance) {	
        	  var selectedRow = this.selectedRow;
        	  if(!selectedRow){
        		  return;
        	  }
              var lastIndex = this.CAPAR030Grid.store.count() - 1,
	              oldIndex = this.CAPAR030Grid.store.indexOf(selectedRow),
	              newIndex = oldIndex + distance;


	          newIndex = (newIndex < 0)? 0 : newIndex;
	          newIndex = (newIndex > lastIndex)? lastIndex : newIndex;


	          if(selectedRow.length === 0) { return; }


	          this.CAPAR030Grid.store.remove(selectedRow);
	          this.CAPAR030Grid.store.insert(newIndex, selectedRow);
	          this.CAPAR030Grid.grid.getSelectionModel().select(newIndex);


	          if(distance < 0){
	          	for(var i = newIndex + 1 ; i <= oldIndex ; i++ ){
	          		var tempRow = this.CAPAR030Grid.store.data.items[i];
	          		this.CAPAR030Grid.store.remove(tempRow);
	          		this.CAPAR030Grid.store.insert(i, tempRow);
	          	}
	          } else {
	          	for(var i = oldIndex ; i <= newIndex - 1 ; i++ ){
	          		var tempRow = this.CAPAR030Grid.store.data.items[i];
	          		this.CAPAR030Grid.store.remove(tempRow);
	          		this.CAPAR030Grid.store.insert(i, tempRow);
	          	}
	          }
          }
//
//
//
          , saveConditionList:function (){
        	  var that = this;
        	  var sParam = {};        	
        	  sParam.arrCndList = [];

        	//배포처리[과제식별자 체크]
              if (!fn_headerTaskIdCheck()){
                  return;
              }
        	  function saveGrid() {
        		  var instCd = {};
            	  if(commonInfo.getInstInfo().instCd) {
            		  instCd = commonInfo.getInstInfo().instCd;
            	  } else {
            		  instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
            	  } 
            	  $(that.CAPAR030Grid.store.data.items).each(function(key, value){
            		  	var param = {};        	   	
            	  		var data = value.data;
            	  		var treeSelected = that.$el.find(".bx-tree-root").find(".bx-tree-root");
            	  		param.instCd = instCd; 
            	   		param.arrSrvcTpCd = treeSelected.val();
            	   		param.aplySeq = data.aplySeq;
            	   		param.cndCd = data.cndCd;
            	   		that.$el.find('.CAPAR030-base-table [data-form-param="cndUseWayNm"]').find('option').each(function(key, value){
            	   			if(value.text == data.cndUseWayNm){
            	   				param.cndUseWayCd = value.value;
            	   			}
            	   		});
            	   		sParam.arrCndList.push(param);
            	  });
            	  sParam.instCd = instCd;
            	  sParam.arrSrvcTpCd =  that.$el.find(".bx-tree-root").find(".bx-tree-root").val();


            	  var linkData = {"header" : fn_getHeader("CAPAR0308204") , "CaArrCndListCntrlSrvcSaveIn" : sParam};


            	  bxProxy.post(sUrl, JSON.stringify(linkData),{
            		  enableLoading: true,
            		  success: function (responseData) {
            			  if(fn_commonChekResult(responseData)) {
            				  // do nothing
            			  }
            		  }
            	  });
              }


              fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveGrid, this);
          	}


//
//
//
			, saveClassList:function (){
			  var that = this;
			  var sParam = {};        	
			  sParam.srvcClassList = [];

			//배포처리[과제식별자 체크]
              if (!fn_headerTaskIdCheck()){
                  return;
              }
              
			  function saveGrid() {
				  var instCd = {};
				  if(commonInfo.getInstInfo().instCd) {
					  instCd = commonInfo.getInstInfo().instCd;
				  } else {
					  instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
				  } 
				  sParam.instCd = instCd;
				  
				  $(that.CAPAR030Grid.store.data.items).each(function(key, value){
					  	var param = {};        	   	
				  		var data = value.data;
				  		param.arrSrvcTpCd = that.$el.find(".bx-tree-root").find(".bx-tree-root").val();
				   		param.classNm = data.classNm;
				   		param.classDescCntnt = data.classDescCntnt;
//				   		that.$el.find('.CAPAR030-base-table [data-form-param="cndUseWayNm"]').find('option').each(function(key, value){
//				   			if(value.text == data.cndUseWayNm){
//				   				param.cndUseWayCd = value.value;
//				   			}
//				   		});
				   		sParam.srvcClassList.push(param);
				  });
				  sParam.arrSrvcTpCd = that.$el.find(".bx-tree-root").find(".bx-tree-root").val();


				  var linkData = {"header" : fn_getHeader("CAPAR0508103") , "CaArrSrvcVldtnRuleListSaveIn" : sParam};


				  bxProxy.post(sUrl, JSON.stringify(linkData),{
					  enableLoading: true,
					  success: function (responseData) {
						  if(fn_commonChekResult(responseData)) {
							  // do nothing
						  }
					  }
				  });
			  }


			  fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveGrid, this);
			}
//
//
//
			, saveXtnClassList:function (){
				var that = this;
				var sParam = {};        	
				sParam.arrXtnAtrbtList = [];

				//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
				function saveGrid() {
					var instCd = {};
					if(commonInfo.getInstInfo().instCd) {
						instCd = commonInfo.getInstInfo().instCd;
					} else {
						instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
					} 
					$(that.CAPAR030Grid.store.data.items).each(function(key, value){
						var param = {};        	   	
						var data = value.data;
						param.arrSrvcTpCd = that.$el.find(".bx-tree-root").find(".bx-tree-root").val();
						param.xtnAtrbtNm = data.xtnAtrbtNm;
						sParam.arrXtnAtrbtList.push(param);
					});
					sParam.arrSrvcTpCd = that.$el.find(".bx-tree-root").find(".bx-tree-root").val();
					sParam.instCd = instCd;
					var linkData = {"header" : fn_getHeader("CAPAR0308206") , "CaArrXtnAtrbtListCntrlSrvcSaveIn" : sParam};


					bxProxy.post(sUrl, JSON.stringify(linkData),{
						enableLoading: true,
						success: function (responseData) {
							if(fn_commonChekResult(responseData)) {
								// do nothing
							}
						}
					});
				}


				fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveGrid, this);
			}


//
//
//
            , resetConditionAttribute: function () {
            	this.$el.find('.CAPAR030-base-table [data-form-param="cndCd"]').val("");
            	this.$el.find('.CAPAR030-base-table [data-form-param="cndNm"]').val("");
            	this.$el.find('.CAPAR030-base-table [data-form-param="cndNm"]').prop("placeholder", bxMsg('cbb_items.SCRNITM#cndNm'));
        		this.$el.find('.CAPAR030-base-table [data-form-param="cndUseWayNm"] option:eq(0)').attr("selected", "selected");
            }


//
//
//
			, resetClassAttribute: function () {
				this.$el.find('.CAPAR030-base-table [data-form-param="classNm"]').val("");
				this.$el.find('.CAPAR030-base-table [data-form-param="classDescCntnt"]').val("");
				this.$el.find('.CAPAR030-base-table [data-form-param="classDescCntnt"]').prop("placeholder", bxMsg('cbb_items.AT#classDescCntnt'));


			}
//
//
//
			, resetExtendsAttribute: function () {
				this.typeChangeYn = 'N';
				this.$el.find('.CAPAR030-base-table [data-form-param="xtnAtrbtNm"]').val("");
				this.$el.find('.CAPAR030-base-table [data-form-param="atrbtNm"]').val("");
				this.$el.find('#btn-attribute-search').prop("disabled", false);


			}


//
//
//
          , saveConditionAttribute:function (){
        	  var that = this;   
        	  
        	//배포처리[과제식별자 체크]
              if (!fn_headerTaskIdCheck()){
                  return;
              }
        	  
              var sParam = {};
              function saveCondition() {
            	  var sParam = {};
            	  sParam.arrSrvcTpCd = that.$el.find(".bx-tree-root").find(".bx-tree-root").val();
            	  sParam.cndCd = that.$el.find('.CAPAR030-base-table [data-form-param="cndCd"]').val();
            	  sParam.cndUseWayCd = that.$el.find('.CAPAR030-base-table [data-form-param="cndUseWayNm"] option:selected').val();        	  
            	  if(commonInfo.getInstInfo().instCd) {
            		  sParam.instCd = commonInfo.getInstInfo().instCd;
            	  } else {
            		  sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
            	  }


            	  var srvcCd = "CAPAR0308102";	// save new one
            	  $(that.oldData).each(function(key,value){
            		 if(value.cndCd == sParam.cndCd){
            			 srvcCd = "CAPAR0308203";	// update
            		 } 
            	  });


            	  var linkData = {"header" : fn_getHeader(srvcCd) , "ArrCndCntrlSrvcSaveIn" : sParam};


            	  bxProxy.post(sUrl, JSON.stringify(linkData),{
            		  enableLoading: true,
            		  success: function (responseData) {
            			  if(fn_commonChekResult(responseData)) {
            				  // reload grid
            				  var pParm = {};		
            				  pParm.cd = sParam.arrSrvcTpCd;	
            				  that.inquiryServiceData(pParm);
            				  // TODO alert message
            			  }
            		  }
            	  });
              }


              fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveCondition, this);


          }


//
//
//
		  , saveClassAttribute:function (){
			  var that = this;   
			  
			//배포처리[과제식별자 체크]
              if (!fn_headerTaskIdCheck()){
                  return;
              }
			  var sParam = {};
			  function saveClass() {
				  var sParam = {};
				  sParam.arrSrvcTpCd = that.$el.find(".bx-tree-root").find(".bx-tree-root").val();
				  sParam.classNm = that.$el.find('.CAPAR030-base-table [data-form-param="classNm"]').val();
	        	  if(commonInfo.getInstInfo().instCd) {
	        		  sParam.instCd = commonInfo.getInstInfo().instCd;
	        	  } else {
	        		  sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
	        	  }	

				  var linkData = {"header" : fn_getHeader("CAPAR0508102") , "CaArrSrvcVldtnRuleSaveIn" : sParam};


				  bxProxy.post(sUrl, JSON.stringify(linkData),{
					  enableLoading: true,
					  success: function (responseData) {
						  if(fn_commonChekResult(responseData)) {
							  // reload grid
							  var pParm = {};		
							  pParm.cd = sParam.arrSrvcTpCd;	
							  that.inquiryServiceData(pParm);
							  // TODO alert message
						  }
					  }
				  });
			  }


			  fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveClass, this);


			}
//
//
//
		  , saveClassExtendsAttribute:function (){
			  var that = this;   
			  var sParam = {};
			  
			//배포처리[과제식별자 체크]
              if (!fn_headerTaskIdCheck()){
                  return;
              }
			  
			  sParam.arrSrvcTpCd = that.$el.find(".bx-tree-root").find(".bx-tree-root").val();
			  sParam.xtnAtrbtNm = that.$el.find('.CAPAR030-base-table [data-form-param="xtnAtrbtNm"]').val();


              if (fn_isEmpty(sParam.arrSrvcTpCd)) {
              	fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0014'));
                  return;
              }
              if (fn_isEmpty(sParam.xtnAtrbtNm)) {
            	  fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0014'));
            	  return;
              }			  
			  function saveClass() {


				  var sParam = {};
				  sParam.arrSrvcTpCd = that.$el.find(".bx-tree-root").find(".bx-tree-root").val();
				  sParam.xtnAtrbtNm = that.$el.find('.CAPAR030-base-table [data-form-param="xtnAtrbtNm"]').val();
	        	  if(commonInfo.getInstInfo().instCd) {
	        		  sParam.instCd = commonInfo.getInstInfo().instCd;
	        	  } else {
	        		  sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
	        	  }					  
                  var service_cd = 'CAPAR0308103';
                  if(that.typeChangeYn == 'Y'){
                	  service_cd = 'CAPAR0308205';
                  }


				  var linkData = {"header" : fn_getHeader(service_cd) , "CaArrXtnAtrbtCntrlSrvcSaveIn" : sParam};


				  bxProxy.post(sUrl, JSON.stringify(linkData),{
					  enableLoading: true,
					  success: function (responseData) {
						  if(fn_commonChekResult(responseData)) {
							  // reload grid
							  var pParm = {};		
							  pParm.cd = sParam.arrSrvcTpCd;	
							  that.inquiryServiceData(pParm);
							  // TODO alert message
						  }
					  }
				  });
			  }


			  fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveClass, this);


		  }


//
//
//
	    , inquiryServiceData: function (param) {	 
	        // header 정보 set
	        var that = this;
	        that.deleteList == [];


	        var sParam = {};
	        sParam.arrSrvcTpCd = param.cd;		


	   	  	var curTabIdx = that.checkCurrentTab();
	        switch (curTabIdx) {     
			case 0:
		   	  	if(that.pageArg == 'STDA') {
					sParam.instCd = 'STDA';
				}else{
					sParam.instCd = commonInfo.getInstInfo().instCd;
				}


		        var linkData = {"header": fn_getHeader("CAPAR0308402"), "CaArrCndSrvcMgmtSvcGetConditionListIn": sParam};


		        // ajax호출
		        bxProxy.post(sUrl, JSON.stringify(linkData),{
		      	  enableLoading: true,
		            success: function(responseData){
		          	  if(fn_commonChekResult(responseData)) {
		          		  var tbList = responseData.CaArrCndSrvcMgmtSvcGetConditionOutList.tblList;


		                    if(tbList != null|| tbList.length > 0) {
		                        that.CAPAR030Grid.setData(tbList);
		                        that.oldData = tbList;
		                        that.initFag = true;
		                    }
		                    else {
		                        that.CAPAR030Grid.resetData();
		                    }


		                    that.resetConditionAttribute();
		                }
		             }   // end of suucess: fucntion
		         }); // end of bxProxy
				break;
				
			case 1:	
				
		   	  	if(that.pageArg == 'STDA') {
					sParam.instCd = 'STDA';
				}else{
					sParam.instCd = commonInfo.getInstInfo().instCd;
				}				
		        var linkData = {"header": fn_getHeader("CAPAR0508401"), "CaArrSrvcVldtnRuleInqryIn": sParam};


		        // ajax호출
		        bxProxy.post(sUrl, JSON.stringify(linkData),{
		      	  enableLoading: true,
		            success: function(responseData){
		          	  if(fn_commonChekResult(responseData)) {
		          		  var tbList = responseData.CaArrSrvcVldtnRuleItmListOut.tblList;


		                    if(tbList != null|| tbList.length > 0) {
		                        that.CAPAR030Grid.setData(tbList);
		                        that.oldData = tbList;
		                        that.initFag = true;
		                    }
		                    else {
		                        that.CAPAR030Grid.resetData();
		                    }


		                    that.resetClassAttribute();
		                }
		             }   // end of suucess: fucntion
		         }); // end of bxProxy
				break;
				
			case 2:			 
		   	  	if(that.pageArg == 'STDA') {
					sParam.instCd = 'STDA';
				}else{
					sParam.instCd = commonInfo.getInstInfo().instCd;
				}
				var linkData = {"header": fn_getHeader("CAPAR0308403"), "CaArrXtnAtrbtCntrlSrvcInqryIn": sParam};


				// ajax호출
				bxProxy.post(sUrl, JSON.stringify(linkData),{
					enableLoading: true,
					success: function(responseData){
						if(fn_commonChekResult(responseData)) {
							var tbList = responseData.CaArrXtnAtrbtCntrlSrvcInqryItmListOut.tblList;


							if(tbList != null|| tbList.length > 0) {
								that.CAPAR030Grid.setData(tbList);
								that.oldData = tbList;
								that.initFag = true;
							}
							else {
								that.CAPAR030Grid.resetData();
							}


							that.resetExtendsAttribute();
						}
					}   // end of suucess: fucntion
				}); // end of bxProxy
				break;
			default:
				break;
			}




	    } // end	    
//
//
//
	    ,openConditionSearchPopup: function () {
           	var that = this;
           	var sParam = {};
           	sParam.cndCd = that.$el.find('#CAPAR030-base-table [data-form-param="cndCd"]').val();
            sParam.cndNm = that.$el.find('#CAPAR030-base-table [data-form-param="cndNm"]').val();
            sParam.cndUseWayNm = that.$el.find('#CAPAR030-base-table [data-form-param="cndUseWayNm"] option:selected').text();


           	var popupConditionSearch = new PopupConditionSearch(sParam);
           	popupConditionSearch.render();


           	popupConditionSearch.on('popUpSetData', function (data) {           		
           		that.$el.find('#CAPAR030-base-table [data-form-param="cndCd"]').val(data.cndCd);
                that.$el.find('#CAPAR030-base-table [data-form-param="cndNm"]').val(data.cndNm);
           	});
        }


	    ,openClassSearchPopup: function () {
           	var that = this;
           	var sParam = {};
           	sParam.cmpntCd = "ARB";
           	sParam.classLayerTp = "AR_SRVC_VLDTN";
           	sParam.classNm = that.$el.find('#CAPAR030-base-table [data-form-param="classNm"]').val();
            sParam.classDescCntnt = that.$el.find('#CAPAR030-base-table [data-form-param="classDescCntnt"]').val();            


           	var popupClassSearch = new PopupClassSearch(sParam);
           	popupClassSearch.render();


           	popupClassSearch.on('popUpSetData', function (data) {
           		that.$el.find('#CAPAR030-base-table [data-form-param="classNm"]').val(data.classNm);
                that.$el.find('#CAPAR030-base-table [data-form-param="classDescCntnt"]').val(data.classDescCntnt);
           	});
        }
	    ,openXtnClassSearchPopup: function () {
	    	var that = this;
	    	var sParam = {};
	    	sParam.xtnAtrbtNm = that.$el.find('#CAPAR030-base-table [data-form-param="xtnAtrbtNm"]').val();


	    	var popupXtnClassSearch = new PopupXtnClassSearch(sParam);
	    	popupXtnClassSearch.render();


	    	popupXtnClassSearch.on('popUpSetData', function (data) {
	    		that.$el.find('#CAPAR030-base-table [data-form-param="xtnAtrbtNm"]').val(data.xtnAtrbtNm);
	    		that.$el.find('#CAPAR030-base-table [data-form-param="atrbtNm"]').val(data.atrbtNm);
	    	});
	    }


//
//
//
                , createGrid: function (onTab) {
                    var that = this;


                    switch (onTab) {
					case "tabPdCnd":
						this.CAPAR030Grid = this.CAPAR030Grid01;
						break;
					case "tabVldtnRule":
						this.CAPAR030Grid = this.CAPAR030Grid02;
						break;
					case "tabXtnAtrbt":
						this.CAPAR030Grid = this.CAPAR030Grid03;
						break;
					default:
						this.CAPAR030Grid = this.CAPAR030Grid01;
						break;
					}        
                    this.$el.find(".CAPAR030-grid").html(this.CAPAR030Grid.render({'height': CaGridHeight}));


                    // 트리에 선택되어 있는 서비스유형으로 조회
                    var treeSelected = this.$el.find(".bx-tree-root").find(".bx-tree-root");
                    if(treeSelected.val()){
                    	var itemData = {};
                    	itemData.cd = treeSelected.val();
                    	this.inquiryServiceData(itemData);
                    }                    	
                } // end of createGrid


//
//
//
                , toggleGridArea : function() {
                	fn_pageLayerCtrl("#CAPAR030-grid");
                }


//
//
//
                , toggleBaseArea : function() {
                	fn_pageLayerCtrl("#CAPAR030-base-table");
                }
//
//
//
                , clickPdCndTab : function() {
                	this.$el.find('.tab').removeClass("on-tab");
                	this.$el.find('#tab-pd-cnd').addClass("on-tab");  


                	this.$el.find('#toolbar-pd-cnd').css("display","block");
                	this.$el.find('#toolbar-vldtn-rule').css("display","none");
                	this.$el.find('#toolbar-xtn-atrbt').css("display","none");
                	this.$el.find('#toolbar-condition').css("display","block");
                	this.$el.find('#toolbar-class').css("display","none");
                	this.$el.find('#toolbar-xtnAtrbt').css("display","none");
                	this.$el.find('#base-table-condition').css("display","table");
                	this.$el.find('#base-table-class').css("display","none");
                	this.$el.find('#base-table-xtnAtrbt').css("display","none");


                	this.createGrid('tabPdCnd');
                }	
//
//
//
                , clickVldtnRuleTab : function() {
                	this.$el.find('.tab').removeClass("on-tab");                	
                	this.$el.find('#tab-vldtn-rule').addClass("on-tab");


                	this.$el.find('#toolbar-pd-cnd').css("display","none");
                	this.$el.find('#toolbar-vldtn-rule').css("display","block");
                	this.$el.find('#toolbar-xtn-atrbt').css("display","none");
                	this.$el.find('#toolbar-condition').css("display","none");
                	this.$el.find('#toolbar-class').css("display","block");
                	this.$el.find('#toolbar-xtnAtrbt').css("display","none");
                	this.$el.find('#base-table-condition').css("display","none");
                	this.$el.find('#base-table-class').css("display","table");
                	this.$el.find('#base-table-xtnAtrbt').css("display","none");


                	this.createGrid('tabVldtnRule');
                }
//
//
//
                , clickXtnAtrbtTab : function() {
                	this.$el.find('.tab').removeClass("on-tab");                	
                	this.$el.find('#tab-xtn-atrbt').addClass("on-tab");


                	this.$el.find('#toolbar-pd-cnd').css("display","none");
                	this.$el.find('#toolbar-vldtn-rule').css("display","none");
                	this.$el.find('#toolbar-xtn-atrbt').css("display","block");
                	this.$el.find('#toolbar-condition').css("display","none");
                	this.$el.find('#toolbar-class').css("display","none");
                	this.$el.find('#toolbar-xtnAtrbt').css("display","block");
                	this.$el.find('#base-table-condition').css("display","none");
                	this.$el.find('#base-table-class').css("display","none");
                	this.$el.find('#base-table-xtnAtrbt').css("display","table");


                	this.createGrid('tabXtnAtrbt');
                }
//
//
//
                , checkCurrentTab : function() {
                	var curTabIdx;
                	this.$el.find('.tab').each(function(key, value) {
                		if($(value).hasClass('on-tab')){
                			curTabIdx = key;
                		}
                	});
                	return curTabIdx;
                }
//
//
//
                , showTree: function () {
                    var that = this;
                    that.$el.find('.col1').show();
                    that.$el.find('.col2').css('left', '260px');
                    that.$el.find('#btn-tree-show').hide();
                }


//
//
//
                , hideTree: function () {
                    var that = this;
                    that.$el.find('.col1').hide();
                    that.$el.find('.col2').css('left', '30px');
                    that.$el.find('#btn-tree-show').show();
                }
            }); // end of Backbone.View.extend({


        return CAPAR030View;
    } // end of define function
)
; // end of define
