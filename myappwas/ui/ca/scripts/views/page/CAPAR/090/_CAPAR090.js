define(
    [
        'bx/common/config',
        'text!app/views/page/CAPAR/090/_CAPAR090.html',
        'bx-component/date-picker/_date-picker',
        'bx-component/ext-grid/_ext-grid',
        'bx-component/bx-tree/bx-tree',
        'bx/common/common-info',
        'app/views/page/popup/CAPCM/popup-class-search',
        'app/views/page/popup/CAPSV/popup-attribute-search'
    ]
    , function (
        config,
        tpl,
        DatePicker,
        ExtGrid,
        bxTree,
        commonInfo,
        PopupClassSearch,
        PopupAttributeSearch
    ) {


        /**
         * Backbone
         */
        var CAPAR090View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPAR090-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'keydown #searchKey': 'fn_enter',

                'change .CAPAR090-issmdaTpCd-wrap': 'changeIssmdaTpCd',

                'click #btn-tree-search'	: 'searchTreeList',
                'click #btn-tree-hide'		: 'hideTree',
                'click #btn-tree-show'		: 'showTree',
                
                'click #btn-tmplt-info-reset'	: 'resetTmpltInfoBase',
                'click #btn-tmplt-info-save'	: 'saveTmpltInfoBase',
                'click #btn-tmplt-info-delete'	: 'deleteTmpltInfoBase',
                'click #btn-class-search'		: 'openClassSearchPopup',
                'click #btn-prfl-atrbt-search'	: 'openPrflAtrbtSearchPopup',
                'click #btn-psbk-msg-search'	: 'openPsbkMsgSearchPopup',                
                                
                'click #tab-prfl'		: 'clickPrflTab',
                'click #tab-psbk-msg'	: 'clickPsbkMsgTab',
                
                'click #btn-prfl-list-save'		: 'savePrflList',
                'click #btn-prfl-info-save'		: 'savePrflInfo',
                'click #btn-prfl-info-reset'	: 'resetPrflInfo',
                
                'click #btn-psbk-msg-rel-list-save'		: 'savePsbkMsgRelList',
                'click #btn-psbk-msg-rel-info-save'		: 'savePsbkMsgRelInfo',                
                'click #btn-psbk-msg-rel-info-reset'	: 'resetPsbkMsgRelInfo',

                'click #btn-tmplt-info-toggle'			: 'toggleTmpltBaseInfo',
                'click #btn-prfl-list-toggle'			: 'togglePrflList',
                'click #btn-psbk-msg-rel-list-toggle'	: 'togglePsbkMsgRelList',
                'click #btn-prfl-info-toggle'			: 'togglePrflInfo',
                'click #btn-psbk-msg-rel-info-toggle'	: 'togglePsbkMsgRelInfo'                
                
            },


            /**
             * initialize
             */
            initialize: function (initData) {
                var that = this;


                // 기관코드
                if (commonInfo.getInstInfo().instCd) {
                	that.instCd = commonInfo.getInstInfo().instCd;
                	that.baseDt = XDate(commonInfo.getSystemDate()).toString('yyyyMMdd');
                }
                else {
                	that.instCd = $.sessionStorage('headerInstCd');
                	that.baseDt = $.sessionStorage('txDt');
                }


                $.extend(that, initData);

                this.$el.html(this.tpl());

                
				that.createTree();
				
				that.fn_createGrid();
            },


            /**
             * render
             */
            render: function () {            	
                this.$el.find('.bx-tree-root').html(this.subViews['CAPAR090Tree'].render());


                this.selectTree();


                sParam = {};
                sParam.className = "CAPAR090-issmdaTpCd-wrap";
                sParam.targetId = "issmdaTpCd";
                sParam.viewType = "ValNm";
//                sParam.nullYn = "Y";
//                sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); 
                sParam.cdNbr = "A0451";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);

                
                sParam = {};
                sParam.className = "CAPAR090-psbkSrvcTpCd-wrap";
                sParam.targetId = "psbkSrvcTpCd";
                sParam.viewType = "ValNm";
                sParam.cdNbr = "A0916";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
                
                
                this.setDatePicker();
                

        		//배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPAR090-wrap #btn-tmplt-info-save')
                                    		,this.$el.find('.CAPAR090-wrap #btn-tmplt-info-delete')
                                    		
                                    		,this.$el.find('.grid-wrap #btn-prfl-list-save')
                                    		,this.$el.find('.grid-wrap #btn-psbk-msg-rel-list-save')
                                    		
                                    		,this.$el.find('#btn-prfl-info-save')
                                    		,this.$el.find('#btn-psbk-msg-rel-info-save')
                                    			   ]);
                return this.$el;
            },


            createTree: function () {
            	var that = this;
                that.subViews['CAPAR090Tree'] = new bxTree({
               	   fields: {id: 'cd', value: 'cdNm'},
                   // Tree Item - Checkbox 사용 여부
                      checkAble: false,


                      listeners: {
                          clickItem: function(itemId, itemData, currentTarget, e) {
                        	  if(itemData.arrIssmdaTmpltNm != null){
                        		  that.inquireServiceData(itemData);
                        		  this.$el.val(itemData.arrIssmdaTmpltId);
                        	  }
                          }
                      }
                  });
            },


            selectTree : function() {
            	var that = this;
             	that.treeList = [];


                var sParam = {};


                sParam.instCd = that.instCd;


                var linkData = {"header" : fn_getHeader("CAPAR0908401") , "CaArrIssmdaTmpltMgmtSvcGetTmpltListIn" : sParam};


                bxProxy.post(sUrl, JSON.stringify(linkData),{
              	   enableLoading: true,
                     success: function (responseData) {
                  	   if(fn_commonChekResult(responseData)) {		                      		  
                  		   that.subViews['CAPAR090Tree'].renderItem(responseData.CaArrIssmdaTmpltMgmtSvcGetTmpltListOut.issmdaTempltList);
                  		   that.treeList = responseData.CaArrIssmdaTmpltMgmtSvcGetTmpltListOut.issmdaTempltList;


                  	   }
                     }
                });
            },      

            
            searchTreeList : function() {
           	   var that = this;


           	   var searchKey = that.$el.find('[data-form-param="searchKey"]').val();


           	   var searchMenuList = [];


           	   if(!searchKey) {
           		   that.subViews['CAPAR090Tree'].renderItem(that.treeList);
           		   return;
           	   }


           	   if(that.treeList.length < 1) {
           		   return;
           	   }


           	   $(that.treeList).each(function(idx, data) {
           		   searchMenuList = that.selectMenu(searchMenuList, data, searchKey);
           	   });


           	   that.subViews['CAPAR090Tree'].renderItem(searchMenuList);
            },


            selectMenu : function(searchMenuList, obj,  inputValue) {                		
          		for(var i = 0; i < obj.children.length; i++) {
          			var temp001 = obj.children[i];


          			if(temp001.cdNm == inputValue) {
  	           				searchMenuList[searchMenuList.length] = temp001;	 	           				
  	           			}
          		}


              	return searchMenuList;
            },
            

            setTmpltInfoBase: function (data) {
            	this.changeYn = 'Y';
                this.$el.find('#tmplt-info-area [data-form-param="arrIssmdaTmpltId"]').val(data.arrIssmdaTmpltId);
                this.$el.find('#tmplt-info-area [data-form-param="arrIssmdaTmpltId"]').prop("disabled",true);
                this.$el.find('#tmplt-info-area [data-form-param="cdNm"]').val(data.arrIssmdaTmpltNm);
                this.$el.find('#tmplt-info-area [data-form-param="issmdaTpCd"]').val(data.arrIssmdaTpCd);
                this.$el.find('#tmplt-info-area [data-form-param="issmdaTpCd"]').prop("disabled",true);


                if(data.mltplIssueAblYn == 'Y') {
                    this.$el.find('#tmplt-info-area [data-form-param="mltplIssueAblYn"]').prop("checked", true);
                } else {
                    this.$el.find('#tmplt-info-area [data-form-param="mltplIssueAblYn"]').prop("checked", false);
                }


                if(data.phsclMediaYn == 'Y') {
                    this.$el.find('#tmplt-info-area [data-form-param="phsclMediaYn"]').prop("checked", true);
                } else {
                    this.$el.find('#tmplt-info-area [data-form-param="phsclMediaYn"]').prop("checked", false);
                }


                if(data.pswdMgmtYn == 'Y') {
                    this.$el.find('#tmplt-info-area [data-form-param="pswdMgmtYn"]').prop("checked", true);
                } else {
                    this.$el.find('#tmplt-info-area [data-form-param="pswdMgmtYn"]').prop("checked", false);
                }

                this.$el.find('#tmplt-info-area [data-form-param="classNm"]').val(data.classNm);


                var issmdaTpCd = this.$el.find('#tmplt-info-area [data-form-param="issmdaTpCd"]').val();

            },




            saveTmpltInfoBase: function (event) {
                var that = this;
              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }

                function saveData() {
                    var sParam = {};


                    sParam.instCd 				= that.instCd;
                    sParam.arrIssmdaTmpltId 	= that.$el.find('#tmplt-info-area [data-form-param="arrIssmdaTmpltId"]').val();
                    sParam.arrIssmdaTmpltNm 	= that.$el.find('#tmplt-info-area [data-form-param="cdNm"]').val();
                    sParam.arrIssmdaTpCd 		= that.$el.find('#tmplt-info-area [data-form-param="issmdaTpCd"]').val();
                    sParam.classNm				= that.$el.find('#tmplt-info-area [data-form-param="classNm"]').val();


                    if(that.$el.find('#tmplt-info-area [data-form-param="mltplIssueAblYn"]').prop("checked")){
                    	sParam.mltplIssueAblYn = "Y";
                    }else{
                    	sParam.mltplIssueAblYn = "N";
                    }
                    if(that.$el.find('#tmplt-info-area [data-form-param="phsclMediaYn"]').prop("checked")){
                    	sParam.phsclMediaYn = "Y";
                    }else{
                    	sParam.phsclMediaYn = "N";
                    }
                    if(that.$el.find('#tmplt-info-area [data-form-param="pswdMgmtYn"]').prop("checked")){
                    	sParam.pswdMgmtYn = "Y";
                    }else{
                    	sParam.pswdMgmtYn = "N";
                    }


                    if(sParam.arrIssmdaTmpltId == "") {
                		sParam = null;
                		return;
                	}


                    if(sParam.arrIssmdaTmpltNm == "") {
                		sParam = null;
                		return;
                	}


                    if(sParam.arrIssmdaTpCd == "") {
                		sParam = null;
                		return;
                	}


                    var serviceCode;
					if(that.changeYn == "Y"){
						serviceCode = "CAPAR0908201";
					}else{
						serviceCode = "CAPAR0908101";
					}
                    var linkData = {"header": fn_getHeader(serviceCode), "CaArrIssmdaTmpltMgmtSvcGetTmpltInfoIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                that.resetTmpltInfoBase();
		    	                //트리다시 그리기
				                that.selectTree();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);


            },


           deleteTmpltInfoBase: function (event) {
           	/*	if(this.changeYn != 'Y'){
           			return ;
           		}*/
	           	var that = this;
	           	
	          //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
	           	function deleteData() {
		            var sParam = {};


		            sParam.instCd 				= that.instCd;
                    sParam.arrIssmdaTmpltId 	= that.$el.find('#tmplt-info-area [data-form-param="arrIssmdaTmpltId"]').val();
                    sParam.arrIssmdaTmpltNm 	= that.$el.find('#tmplt-info-area [data-form-param="cdNm"]').val();
                    sParam.arrIssmdaTpCd 		= that.$el.find('#tmplt-info-area [data-form-param="issmdaTpCd"]').val();
		            console.log(sParam);


		            if(sParam.arrIssmdaTmpltId == "") {
                		sParam = null;
                		return;
                	}


                    if(sParam.arrIssmdaTmpltNm == "") {
                		sParam = null;
                		return;
                	}


                    if(sParam.arrIssmdaTpCd == "") {
                		sParam = null;
                		return;
                	}




		            var linkData = {"header": fn_getHeader("CAPAR0908301"), "CaArrIssmdaTmpltMgmtSvcGetTmpltInfoIn": sParam};


		            // ajax호출
		            bxProxy.post(sUrl, JSON.stringify(linkData), {
		                enableLoading: true
		                , success: function (responseData) {
		                    if (fn_commonChekResult(responseData)) {
		                        fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


		                        that.resetTmpltInfoBase();
		    	                //트리다시 그리기
				                that.selectTree();								


		                    }
		                }   // end of suucess: fucntion
		            }); // end of bxProxy
	        	}


	          	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), deleteData, this);


           }, 
           
           
           resetTmpltInfoBase: function (data) {
           	this.changeYn = 'N';
               this.$el.find('#tmplt-info-area [data-form-param="arrIssmdaTmpltId"]').val("");
               this.$el.find('#tmplt-info-area [data-form-param="arrIssmdaTmpltId"]').prop("disabled",false);
               this.$el.find('#tmplt-info-area [data-form-param="cdNm"]').val("");
               this.$el.find('#tmplt-info-area [data-form-param="issmdaTpCd"]').prop("disabled",false);
               this.$el.find('#tmplt-info-area [data-form-param="issmdaTpCd"] option:eq(0)').attr("selected", "selected");


               this.$el.find('#tmplt-info-area [data-form-param="mltplIssueAblYn"]').prop("checked", false);
               this.$el.find('#tmplt-info-area [data-form-param="phsclMediaYn"]').prop("checked", false);
               this.$el.find('#tmplt-info-area [data-form-param="pswdMgmtYn"]').prop("checked", false);

               this.$el.find('#tmplt-info-area [data-form-param="classNm"]').val("");
           },


           openClassSearchPopup: function () {
	           	var that = this;
	           	var sParam = {};
	           	sParam.cmpntCd = "ARB";
               	sParam.classLayerTp = "ARR_SRVC_CND";
             	sParam.classNm = that.$el.find('#tmplt-info-area [data-form-param="classNm"]').val();


	           	var popupClassSearch = new PopupClassSearch(sParam);
	           	popupClassSearch.render();


	           	popupClassSearch.on('popUpSetData', function (data) {
	           		that.$el.find('#tmplt-info-area [data-form-param="classNm"]').val(data.classNm); //클래스명
	           	});
           },  
           
           openPrflAtrbtSearchPopup: function () {
            	var that = this;
            	var sParam = {};
                sParam.xtnAtrbtNm = that.$el.find('.CAPAR090-dtl-table [data-form-param="prflAtrbtNm"]').val(); 


        		this.popupAttributeSearch = new PopupAttributeSearch(sParam);
        		this.popupAttributeSearch.render();

        		
        		this.popupAttributeSearch.on('popUpSetData', function (data) {
        			that.$el.find('.CAPAR090-dtl-table [data-form-param="prflAtrbtNm"]').val(data.atrbtCd);
        		});
         },
         
           
           clickPrflTab : function() {
	           	this.$el.find('.tab').removeClass("on-tab");                	
	           	this.$el.find('#tab-prfl').addClass("on-tab");	
	
	           	this.$el.find('#toolbar-prfl-list').css("display","block");
	           	this.$el.find('#toolbar-psbk-msg-rel-list').css("display","none");

	           	this.$el.find('#toolbar-prfl-info').css("display","block");
	           	this.$el.find('#toolbar-psbk-msg-rel-info').css("display","none");
	           	
	           	this.$el.find('#table-prfl-info').css("display","table");
	           	this.$el.find('#table-psbk-msg-rel-info').css("display","none");
	
	           	this.createGrid('tabPrfl');
           },
           
           
           clickPsbkMsgTab : function() {
	           	this.$el.find('.tab').removeClass("on-tab");                	
	           	this.$el.find('#tab-psbk-msg').addClass("on-tab");	
	
	           	this.$el.find('#toolbar-prfl-list').css("display","none");
	           	this.$el.find('#toolbar-psbk-msg-rel-list').css("display","block");

	           	this.$el.find('#toolbar-prfl-info').css("display","none");
	           	this.$el.find('#toolbar-psbk-msg-rel-info').css("display","block");
	           	
	           	this.$el.find('#table-prfl-info').css("display","none");
	           	this.$el.find('#table-psbk-msg-rel-info').css("display","table");
	
	           	this.createGrid('tabPsbkMsg');
          },
          
          
          fn_createGrid: function() {


          	var that = this;


          	that.CAPAR090Grid01 = new ExtGrid({
                  // 그리드 컬럼 정의
                  fields: ['rowIndex', 'arrIssmdaPrflAtrbtNm', 'arrIssmdaPrflAtrbtDescCntnt', 'arrIssmdaPrflCntnt']
                  , id: 'CAPAR090Grid'
                  , columns: [
                      {
                          text: 'No.'
                          , dataIndex: 'rowIndex'
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
                      , {text: bxMsg('cbb_items.SCRNITM#prflAtrbtNm'), flex: 3, dataIndex: 'arrIssmdaPrflAtrbtNm', style: 'text-align:center', align: 'center'}                                        
                      , {text: bxMsg('cbb_items.SCRNITM#prflAtrbtDesc'), flex: 3, dataIndex: 'arrIssmdaPrflAtrbtDescCntnt', style: 'text-align:center', align: 'center'}
                      , {text: bxMsg('cbb_items.SCRNITM#prflAtrbtCntnt'), flex: 2, dataIndex: 'arrIssmdaPrflCntnt', style: 'text-align:center', align: 'center'}
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

												  for(var i = deletedIndex ; i < totalIndex ; i++){
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
                  			that.clickPrflGridItem();                                    			
                  		}
                  	} 
                  }
              });      


              that.CAPAR090Grid02 = new ExtGrid({
                  // 그리드 컬럼 정의
                  fields: ['rowIndex', 'psbkMsgId', 'arrIssmdaPsbkMsgSeqNbr', 'psbkMsgNm', 'psbkSrvcTpCd', 'relSeqNbr', 'efctvStartDt', 'efctvEndDt', 'psbkBkgColumnCnt', 'psbkBkgRowCnt', 'psbkBkgSeq', 'psbkBkgEditAtrbtValJson']
                  , id: 'CAPAR090Grid'
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
                      , {text: bxMsg('cbb_items.AT#psbkMsgNm'), flex: 4, dataIndex: 'psbkMsgNm', style: 'text-align:center', align: 'center'}                                        
                      , {text: bxMsg('cbb_items.AT#psbkSrvcTpCd'), flex: 1, dataIndex: 'psbkSrvcTpCd', style: 'text-align:center', align: 'center'}
                      , {text: bxMsg('cbb_items.AT#efctvStartDt'), flex: 1, dataIndex: 'efctvStartDt', style: 'text-align:center', align: 'center', renderer: function(value){return XDate(value).toString('yyyy-MM-dd');} }
                      , {text: bxMsg('cbb_items.AT#efctvEndDt'), flex: 1, dataIndex: 'efctvEndDt', style: 'text-align:center', align: 'center', renderer: function(value){return XDate(value).toString('yyyy-MM-dd');} }
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


//												  for(var i = deletedIndex ; i <= totalIndex ; i++){
//													  var tempItem = grid.store.data.items[i];
//													  grid.store.remove(tempItem);
//													  grid.store.insert(i, tempItem);
//												  }
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
                  			that.clickPsbkMsgGridItem();                                    			
                  		}
                  	} 
                  }
              });


              that.createGrid();
          },
          
          
          clickPrflGridItem(){
        	  var selectedRecord = this.CAPAR090Grid.grid.getSelectionModel().selected.items[0];
              if (!selectedRecord) {
                  return;
              } else {
              	this.$el.find('.CAPAR090-dtl-table [data-form-param="prflAtrbtNm"]').val(selectedRecord.data.arrIssmdaPrflAtrbtNm);
              	this.$el.find('.CAPAR090-dtl-table [data-form-param="prflAtrbtNm"]').prop("disabled",true);
            	this.$el.find('.CAPAR090-dtl-table [data-form-param="prflAtrbtCntnt"]').val(selectedRecord.data.arrIssmdaPrflCntnt);
              }
          },
          
          
          clickPsbkMsgGridItem(){
        	  var selectedRecord = this.CAPAR090Grid.grid.getSelectionModel().selected.items[0];
              if (!selectedRecord) {
                  return;
              } else {	
            	var data = selectedRecord.data; 
            	this.$el.find('.CAPAR090-dtl-table [data-form-param="psbkMsgId"]').val(data.psbkMsgId);
                this.$el.find('.CAPAR090-dtl-table [data-form-param="psbkMsgId"]').prop("disabled",true);
                this.$el.find('.CAPAR090-dtl-table [data-form-param="psbkMsgId"]').prop("arrIssmdaPsbkMsgSeqNbr",data.arrIssmdaPsbkMsgSeqNbr);
                this.$el.find('.CAPAR090-dtl-table [data-form-param="psbkMsgNm"]').val(data.psbkMsgNm);
              	this.$el.find('.CAPAR090-dtl-table [data-form-param="psbkSrvcTpCd"]').val(data.psbkSrvcTpCd);
              	this.$el.find('.CAPAR090-dtl-table [data-form-param="psbkSrvcTpCd"]').prop("disabled",true);
              	this.$el.find('.CAPAR090-dtl-table [data-form-param="efctvStartDt"]').val(XDate(data.efctvStartDt).toString('yyyy-MM-dd'));
              	this.$el.find('.CAPAR090-dtl-table [data-form-param="efctvEndDt"]').val(XDate(data.efctvEndDt).toString('yyyy-MM-dd'));
              	this.$el.find('.CAPAR090-dtl-table [data-form-param="psbkBkgRowCnt"]').val(data.psbkBkgRowCnt);
              	this.$el.find('.CAPAR090-dtl-table [data-form-param="psbkBkgColumnCnt"]').val(data.psbkBkgColumnCnt);
              	this.$el.find('.CAPAR090-dtl-table [data-form-param="psbkBkgSeq"]').val(data.psbkBkgSeq);
              	this.$el.find('.CAPAR090-dtl-table [data-form-param="psbkBkgEditAtrbtValJson"]').val(data.psbkBkgEditAtrbtValJson);
              }
          },
          
          
          createGrid: function (onTab) {
        	  var that = this;
        	          	  
        	  switch (onTab) {
        	  case "tabPrfl":
        		  this.CAPAR090Grid = this.CAPAR090Grid01;
        		  break;
        	  case "tabPsbkMsg":
        		  this.CAPAR090Grid = this.CAPAR090Grid02;
        		  break;
        	  default:
        		  this.CAPAR090Grid = this.CAPAR090Grid01;
        	  break;
        	  }        
        	  this.$el.find(".CAPAR090-grid").html(this.CAPAR090Grid.render({'height': CaGridHeight}));
        	  
        	  // 트리에 선택되어 있는 서비스유형으로 조회
              var treeSelected = this.$el.find(".bx-tree-root").find(".bx-tree-root");
              if(treeSelected.val()){
              	var itemData = {};
              	itemData.arrIssmdaTmpltId = treeSelected.val();
              	this.inquireServiceData(itemData);
              } 
          },
          

           inquireServiceData: function (param) {

        	   // header 정보 set
               var that = this;
               var sParam = {};
               
               var curTabIdx = that.checkCurrentTab();
               switch (curTabIdx) {     
               case 0:			

	                sParam.instCd = that.instCd;
	                sParam.arrIssmdaTpCd = param.arrIssmdaTmpltNm;
	                sParam.arrIssmdaTmpltId = param.arrIssmdaTmpltId;


	                var linkData = {"header": fn_getHeader("CAPAR0908402"), "CaArrIssmdaTmpltMgmtSvcGetTmpltInfoIn": sParam};


	                // ajax호출
	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	              	  enableLoading: true,
	                    success: function(responseData){
	                  	  if(fn_commonChekResult(responseData)) {
	                  		  var data = responseData.CaArrIssmdaTmpltMgmtSvcGetTmpltInfoOut;

	                          that.setTmpltInfoBase(data);
	                          
	                          that.setPrflList(data);
	                        }
	                     }   // end of suucess: fucntion
	                 }); // end of bxProxy
					break;
				
				case 1:

	                sParam.instCd = that.instCd;                
	                sParam.arrIssmdaTmpltId = param.arrIssmdaTmpltId;
	                sParam.baseDt = that.baseDt;


	                var linkData = {"header": fn_getHeader("CAPAR0908403"), "CaArrIssmdaTmpltMgmtSvcGetRelatedPsbkMsgInfoIn": sParam};


	                // ajax호출
	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	              	  enableLoading: true,
	                    success: function(responseData){
	                  	  if(fn_commonChekResult(responseData)) {
	                  		  var data = responseData.CaArrIssmdaTmpltMgmtSvcGetRelatedPsbkMsgInfoOut;

	                          that.setPsbkMsgRelList(data);

	                        }
	                     }   // end of suucess: fucntion
	                }); // end of bxProxy

					break;
					
				default:
					break;
				}   
            },
            
            
            setPrflList: function (data) {
            	
            	var prflList = data.prflAtrbtList;

                if(prflList != null|| prflList.length > 0) {
                    this.CAPAR090Grid01.setData(prflList);
                    this.oldData01 = prflList;                    
                }
                else {
                	this.CAPAR090Grid01.resetData();
                }

                this.resetPrflInfo();
            },
            
            
            savePrflList: function () {
            	
            	var that = this;
            	var sParam = {};
            	
            	sParam.instCd = that.instCd;
            	sParam.arrIssmdaTmpltId = that.$el.find('#tmplt-info-area [data-form-param="arrIssmdaTmpltId"]').val();
            	sParam.prflAtrbtList = [];
            	
            	that.deleteList.forEach(function(val, idx){
					var pParam = {};
					pParam.arrIssmdaPrflAtrbtNm = val.arrIssmdaPrflAtrbtNm;
					pParam.arrIssmdaPrflCntnt = val.arrIssmdaPrflCntnt;
					sParam.prflAtrbtList.push(pParam);
				});
            	

                var linkData = {"header": fn_getHeader("CAPAR0908302"), "CaArrIssmdaTmpltMgmtSvcRemoveIssmdaPrflAtrbtIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData),{
              	  enableLoading: true,
                    success: function(responseData){
                  	  if(fn_commonChekResult(responseData)) {
                  		  var data = responseData.CaArrIssmdaTmpltMgmtSvcGetTmpltInfoOut;

                  		  var param = {};
                          param.arrIssmdaTmpltNm = that.$el.find('#tmplt-info-area [data-form-param="issmdaTpCd"]').val();
                          param.arrIssmdaTmpltId = that.$el.find('#tmplt-info-area [data-form-param="arrIssmdaTmpltId"]').val(); 
                  		  that.inquireServiceData(param);
                  		  
                          that.resetPrflInfo();
                        }
                     }   // end of suucess: fucntion
                 }); // end of bxProxy
            },
            
            
            resetPrflInfo: function () {
            	this.$el.find('.CAPAR090-dtl-table [data-form-param="prflAtrbtNm"]').val("");
            	this.$el.find('.CAPAR090-dtl-table [data-form-param="prflAtrbtNm"]').prop("disabled",false);
            	this.$el.find('.CAPAR090-dtl-table [data-form-param="prflAtrbtCntnt"]').val("");
            },
            
            
            savePrflInfo: function (param) {
            
            	var that = this;
            	var sParam = {};
            	sParam.instCd = that.instCd;
            	sParam.arrIssmdaTmpltId = that.$el.find('#tmplt-info-area [data-form-param="arrIssmdaTmpltId"]').val();
            	sParam.prflAtrbtList = [];

            	var pParam = {};
            	pParam.arrIssmdaPrflAtrbtNm = that.$el.find('.CAPAR090-dtl-table [data-form-param="prflAtrbtNm"]').val();
            	pParam.arrIssmdaPrflCntnt = that.$el.find('.CAPAR090-dtl-table [data-form-param="prflAtrbtCntnt"]').val();
            	
            	sParam.prflAtrbtList.push(pParam);

                var linkData = {"header": fn_getHeader("CAPAR0908102"), "CaArrIssmdaTmpltMgmtSvcSaveIssmdaPrflAtrbtIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData),{
              	  enableLoading: true,
                    success: function(responseData){
                  	  if(fn_commonChekResult(responseData)) {
                  		  var data = responseData.CaArrIssmdaTmpltMgmtSvcGetTmpltInfoOut;

                          param.arrIssmdaTmpltNm = that.$el.find('#tmplt-info-area [data-form-param="issmdaTpCd"]').val();
                          param.arrIssmdaTmpltId = that.$el.find('#tmplt-info-area [data-form-param="arrIssmdaTmpltId"]').val(); 
                  		  that.inquireServiceData(param);
                  		  
                          that.resetPrflInfo();
                        }
                     }   // end of suucess: fucntion
                 }); // end of bxProxy
            	
            },
            
            
            setPsbkMsgRelList: function (data) {
            	
            	var psbkMsgRelList = data.psbkMsgRelList;

                if(psbkMsgRelList != null|| psbkMsgRelList.length > 0) {
                	this.CAPAR090Grid02.setData(psbkMsgRelList);
                	this.oldData02 = psbkMsgRelList;                    
                }
                else {
                	this.CAPAR090Grid02.resetData();
                }

                this.resetPsbkMsgRelInfo();
            },
           
            
            savePsbkMsgRelList: function () {
            	
            	var that = this;
            	var sParam = {};
            	sParam.psbkMsgRelInfoList = [];
            	
            	that.deleteList.forEach(function(val, idx){
					var pParam = {};
					pParam.instCd = that.instCd;
					pParam.arrIssmdaTmpltId = that.$el.find('#tmplt-info-area [data-form-param="arrIssmdaTmpltId"]').val();
					pParam.psbkSrvcTpCd = val.psbkSrvcTpCd;
					pParam.psbkMsgId = val.psbkMsgId;
					pParam.arrIssmdaPsbkMsgSeqNbr = val.arrIssmdaPsbkMsgSeqNbr;
					
					sParam.psbkMsgRelInfoList.push(pParam);
				});
            	

                var linkData = {"header": fn_getHeader("CAPAR0908303"), "CaArrIssmdaTmpltMgmtSvcRemoveIssmdaPsbkMsgRelInfoIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData),{
              	  enableLoading: true,
                    success: function(responseData){
                  	  if(fn_commonChekResult(responseData)) {
                  		  var data = responseData.CaArrIssmdaTmpltMgmtSvcGetTmpltInfoOut;

                  		  var param = {};
                          param.arrIssmdaTmpltNm = that.$el.find('#tmplt-info-area [data-form-param="issmdaTpCd"]').val();
                          param.arrIssmdaTmpltId = that.$el.find('#tmplt-info-area [data-form-param="arrIssmdaTmpltId"]').val(); 
                  		  that.inquireServiceData(param);
                  		  
                          that.resetPsbkMsgRelInfo();
                        }
                     }   // end of suucess: fucntion
                 }); // end of bxProxy
            },
            
            
            resetPsbkMsgRelInfo: function () {
            	this.$el.find('.CAPAR090-dtl-table [data-form-param="psbkMsgId"]').val("");
                this.$el.find('.CAPAR090-dtl-table [data-form-param="psbkMsgId"]').prop("disabled",false);
              	this.$el.find('.CAPAR090-dtl-table [data-form-param="psbkMsgNm"]').val("");
              	this.$el.find('.CAPAR090-dtl-table [data-form-param="psbkSrvcTpCd"]').val("01");
              	this.$el.find('.CAPAR090-dtl-table [data-form-param="psbkSrvcTpCd"]').prop("disabled",false);    
              	this.$el.find('.CAPAR090-dtl-table [data-form-param="efctvStartDt"]').val("");
              	this.$el.find('.CAPAR090-dtl-table [data-form-param="efctvEndDt"]').val("");
              	this.$el.find('.CAPAR090-dtl-table [data-form-param="psbkBkgRowCnt"]').val("");
              	this.$el.find('.CAPAR090-dtl-table [data-form-param="psbkBkgColumnCnt"]').val("");
              	this.$el.find('.CAPAR090-dtl-table [data-form-param="psbkBkgSeq"]').val("");
              	this.$el.find('.CAPAR090-dtl-table [data-form-param="psbkBkgEditAtrbtValJson"]').val("");
            },

            
            savePsbkMsgRelInfo: function (param) {
                
            	var that = this;
            	var sParam = {};
            	sParam.instCd = that.instCd;
            	sParam.arrIssmdaTmpltId = that.$el.find('#tmplt-info-area [data-form-param="arrIssmdaTmpltId"]').val();
            	sParam.psbkMsgId = that.$el.find('.CAPAR090-dtl-table [data-form-param="psbkMsgId"]').val();
            	sParam.psbkSrvcTpCd = that.$el.find('.CAPAR090-dtl-table [data-form-param="psbkSrvcTpCd"]').val();
            	sParam.arrIssmdaPsbkMsgSeqNbr = that.$el.find('.CAPAR090-dtl-table [data-form-param="psbkMsgId"]').prop("arrIssmdaPsbkMsgSeqNbr");
            	sParam.psbkBkgRowCnt = that.$el.find('.CAPAR090-dtl-table [data-form-param="psbkBkgRowCnt"]').val();
            	sParam.psbkBkgColumnCnt = that.$el.find('.CAPAR090-dtl-table [data-form-param="psbkBkgColumnCnt"]').val();
            	sParam.psbkBkgSeq = that.$el.find('.CAPAR090-dtl-table [data-form-param="psbkBkgSeq"]').val();
            	sParam.efctvStartDt = XDate(that.$el.find('.CAPAR090-dtl-table [data-form-param="efctvStartDt"]').val()).toString('yyyyMMdd');
            	sParam.efctvEndDt = XDate(that.$el.find('.CAPAR090-dtl-table [data-form-param="efctvEndDt"]').val()).toString('yyyyMMdd');
            	sParam.psbkBkgEditAtrbtValJson = that.$el.find('.CAPAR090-dtl-table [data-form-param="psbkBkgEditAtrbtValJson"]').val();

                var linkData = {"header": fn_getHeader("CAPAR0908103"), "CaArrIssmdaTmpltMgmtSvcSaveIssmdaPsbkMsgRelInfoIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData),{
              	  enableLoading: true,
                    success: function(responseData){
                  	  if(fn_commonChekResult(responseData)) {
                  		  var data = responseData.CaArrIssmdaTmpltMgmtSvcGetTmpltInfoOut;

                          param.arrIssmdaTmpltNm = that.$el.find('#tmplt-info-area [data-form-param="issmdaTpCd"]').val();
                          param.arrIssmdaTmpltId = that.$el.find('#tmplt-info-area [data-form-param="arrIssmdaTmpltId"]').val(); 
                  		  that.inquireServiceData(param);
                  		  
                          that.resetPrflInfo();
                        }
                     }   // end of suucess: fucntion
                 }); // end of bxProxy
            	
            },
            
            
            

            /**
             * 달력생성
             */
            setDatePicker: function () {
                fn_makeDatePicker(this.$el.find('#table-psbk-msg-rel-info [data-form-param="efctvStartDt"]'));
                fn_makeDatePicker(this.$el.find('#table-psbk-msg-rel-info [data-form-param="efctvEndDt"]'));
            },




            /**
             * callback for enter input in tree
             */
            fn_enter: function (event) {
                var event = event || window.event;
                var keyID = (event.which) ? event.which : event.keyCode;
                if(keyID == 13) { //enter
                    this.searchTreeList();
                }
            },


            checkCurrentTab : function() {
            	var curTabIdx;
            	this.$el.find('.tab').each(function(key, value) {
            		if($(value).hasClass('on-tab')){
            			curTabIdx = key;
            		}
            	});
            	console.log('currentTab = '+curTabIdx);
            	return curTabIdx;
            },
            
            
            showTree: function () {
                this.$el.find('.col1').show();
                this.$el.find('.col2').css('left', '260px');
                this.$el.find('#btn-tree-show').hide();
            },


            hideTree: function () {
                this.$el.find('.col1').hide();
                this.$el.find('.col2').css('left', '30px');
                this.$el.find('#btn-tree-show').show();
            },


            changeIssmdaTpCd: function () {
            	var that = this;


            	var issmdaTpCd = that.$el.find('#tmplt-info-area [data-form-param="issmdaTpCd"]').val();

            },


            /**
             * show or hide template information section
             */
            toggleTmpltBaseInfo: function () {
                fn_pageLayerCtrl(this.$el.find("#tmplt-info-area"),this.$el.find('#btn-tmplt-info-toggle'));
            },

            
            togglePrflList: function () {
                fn_pageLayerCtrl(this.$el.find("#CAPAR090-grid"),this.$el.find('#btn-prfl-list-toggle'));
            },
            
            
            togglePsbkMsgRelList: function () {
                fn_pageLayerCtrl(this.$el.find("#CAPAR090-grid"),this.$el.find('#btn-psbk-msg-rel-list-toggle'));
            },
            
            
            togglePrflInfo: function () {
                fn_pageLayerCtrl(this.$el.find("#table-prfl-info"),this.$el.find('#btn-prfl-info-toggle'));
            },
            
            
            togglePsbkMsgRelInfo: function () {
                fn_pageLayerCtrl(this.$el.find("#table-psbk-msg-rel-info"),this.$el.find('#btn-psbk-msg-rel-info-toggle'));
            }

            
        }); // end of Backbone.View.extend({


        return CAPAR090View;
    } // end of define function
); // end of define


