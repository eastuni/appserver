define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPSV/010/_CAPSV010.html'
        , 'bx-component/date-picker/_date-picker'
        , 'bx-component/ext-grid/_ext-tree-grid'
        , 'bx-component/bx-tree/bx-tree'
        , 'app/views/page/popup/CAPSV/popup-service'
        , 'app/views/page/popup/CAPSV/popup-userGrpCd'
        , 'app/views/page/popup/CAPSV/popup-screen-search'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , DatePicker
        , ExtTreeGrid
        , bxTree
        , PopupService
        , PopupUserGroup
        , PopupScrnGroup
        , commonInfo
        ) {


    	var flag  = false;
        /**
         * Backbone
         */
        var CAPSV010View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPSV010-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl

                }
                // 이벤트 설정
                , events: {
                	'click #btn-CAPSV010-tree-add' : 'addTree'
            		, 'click #btn-CAPSV010-tree-delete' : 'clickDeleteTree'


        			, 'click #btn-CAPSV010-grid-save': 'clickSaveGrid'
    				, 'click #btn-CAPSV010-grid-add': 'addGrid'
					, 'click #btn-up-grid': 'gridAreaModal'


					, 'click #btn-tree-hide': 'hideTree'
					, 'click #btn-tree-show': 'showTree'


					, 'click #btn-CAPSV010-grid-add': 'addNode' // root 추가
					, 'click #btn-CAPSV010-grid-up': 'upNode' // 위로 이동
					, 'click #btn-CAPSV010-grid-down': 'downNode' // 아래로 이동


					, 'click #btn-CAPSV010-grid-excel' : 'downloadGridDataWithExcel'
                }


                , downloadGridDataWithExcel: function () {
                	console.log("excel");


                    this.CAPSV010TreeGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPSV010')+"_"+getCurrentDate("yyyy-mm-dd"));
                }


                , upNode: function () {
                    
                	var node = this.CAPSV010TreeGrid.grid.getSelectionModel().lastSelected,
                    currentIdx = node.parentNode.indexOf(node),
                    currentPstnNbr=node.data.pstnNbr;
                	if(currentIdx !== 0){
                		if(node.data.txTpDscd==="R"){
                    		node.data.txTpDscd = "U";
                		}
                		node.data.pstnNbr=--currentPstnNbr;
                		if(node.previousSibling.data.txTpDscd==="R"){
                			node.previousSibling.data.txTpDscd="U";
                        }
                		node.previousSibling.data.pstnNbr=++currentPstnNbr;
            			node.save();
                    }
                	
                	while(currentIdx !== 0 && node.nextSibling!==null){
                		
                		if(node.nextSibling.data.txTpDscd==="R"){
                			node.nextSibling.data.txTpDscd="U";
                        }
                		node.nextSibling.data.pstnNbr=++currentPstnNbr;
                		node.save();
                		node=node.nextSibling;
                		
                	}
                    this.CAPSV010TreeGrid.upField();
                }


                , downNode: function () {
                	
                  	var node = this.CAPSV010TreeGrid.grid.getSelectionModel().lastSelected,
                  	parent = node.parentNode,
                	targetIdx = parent.indexOf(node) + 2,
                	currentPstnNbr=node.data.pstnNbr;
                    console.log()
                	if((targetIdx - 1) !== parent.childNodes.length){
                		if(node.data.txTpDscd==="R"){
                    		node.data.txTpDscd = "U";
                		}
                		if(node.nextSibling.data.txTpDscd==="R"){
                			node.nextSibling.data.txTpDscd="U";
                		}
            			node.nextSibling.data.pstnNbr=currentPstnNbr;
            			console.log(node.nextSibling.data.menuNm);
            			console.log(node.nextSibling.data.pstnNbr);
                        
                		node.data.pstnNbr=++currentPstnNbr;
                		console.log(node.data.menuNm);
            			console.log(node.data.pstnNbr);
                		node.save();
                    }
                	node=node.nextSibling;
                	
                	while((targetIdx - 1) !== parent.childNodes.length &&node.nextSibling!==null){
                		
                		if(node.nextSibling.data.txTpDscd==="R"){
                			node.nextSibling.data.txTpDscd="U";
                        }
                		node.nextSibling.data.pstnNbr=++currentPstnNbr;
                		console.log(node.nextSibling.data.menuNm);
            			console.log(node.nextSibling.data.pstnNbr);
                		node.save();
                		node=node.nextSibling;
                	}
                    this.CAPSV010TreeGrid.downField();
                }


                , addNode: function () {
                
                    this.CAPSV010TreeGrid.addField({
                        children: null
                        , menuNm: ""
                        , scrnId: ""
                        , parmVal: ""
                        , menuItmAtrbtNm1: ""
                        , menuItmAtrbtNm2: ""
                		, menuItmAtrbtNm3: ""
                        , dfltScrnTrgtYn: "N"
                        , txTpDscd: "C"
                       	, pstnNbr: ""
                       	, upSeqNbr: 0
                    });
                    console.log(this.CAPSV010TreeGrid);
                    var count = this.CAPSV010TreeGrid.getAllData().length-1,
                    node = this.CAPSV010TreeGrid.grid.getSelectionModel().store.data.items[count];
                    if(node.previousSibling){
                    	node.data.pstnNbr=node.previousSibling.data.pstnNbr+1;
                    }else{
                    	node.data.pstnNbr=1;
                    }
                    
                    node.save();
                    
                }
//
//
//
                , initialize: function (initData) {
                    var that = this;
                    that.that = this;


                    var deleteList = {};


                    $.extend(that, initData);
                    that.$el.html(that.tpl());
                    that.seletedTreeItemData = {};


                    // 왼쪽 트리 생성
                    that.fn_createTree();


                    // 그리드 생성
                    that.comboStore1 = {}; // 메뉴처리유형코드
                    that.comboStore2 = {}; // 여부
                    // 콤보조회 서비스호출 준비
                    var sParam = {};
                    // 메뉴처리유형코드
                    sParam = {};
                    sParam.cdNbr = "A0429";
                    var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    sParam = {};
                    sParam.cdNbr = "10000";
                    var linkData2 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    /* ========================================================== */
                    bxProxy.all([
                        /* ========================================================== */
                        // 메뉴처리유형코드
                        {
                            url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {
    	                        if (fn_commonChekResult(responseData)) {
    	                            that.comboStore1 = new Ext.data.Store({
    	                                fields: ['cd', 'cdNm'],
    	                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tbl
    	                            });
    	                        }
    	                    }
                        }
                        // 초기화면대상여부
                        , {
                            url: sUrl, param: JSON.stringify(linkData2), success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                    that.comboStore2 = new Ext.data.Store({
                                        fields: ['cd', 'cdNm'],
                                        data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tbl
                                    });
                                }
                            }
                        }
                    ], {
                        success: function () {


                        	that.CAPSV010TreeGrid = new ExtTreeGrid({
                                fields: ['menuPrcsngDscd', 'dfltScrnTrgtYn', 'menuNm', 'menuSeqNbr', 'menuId'
                                         , 'scrnId', 'parmVal', 'iconNm', 'menuItmAtrbtNm1', 'menuItmAtrbtNm2', 'menuItmAtrbtNm3'
                                         , 'children','txTpDscd','pstnNbr','upSeqNbr']
                                , id: 'CAPSV010TreeGrid'
                                , expanded: true
                                , columns: [
                                    {
                                        xtype: 'treecolumn'
                                        , text: bxMsg('cbb_items.AT#menuNm')
                                        , style: 'text-align:center'
                                        , dataIndex: 'menuNm'
                                        , editor: 'textfield'
                                        , style: 'text-align:center'
                                        , getClass: function () {}
                                    	, width : 250
                                        , height: 25
                                    }
                                    , {xtype: 'actioncolumn', text: "" , width : 80, align: 'center', style: 'text-align:center'
        	                        	, renderer: function (val) {
        	                        		return "<button type=\"button\" class=\"bw-btn-form add-mg-t-5\" id=\"btn-grid-search\">"+bxMsg('cbb_items.SCRNITM#btnMltLng')+"</button>";
        	                        	}
        	                        	, listeners: {
        		                          /**
        		                           * 버튼 클릭 이벤트 등록
        		                           */
        		                          click: function (grid, rowEl, rowIdx, cellIdx, e, record) {
        		                              if ($(e.target).hasClass('bw-btn-form')) {
        		                            	  // 다국어 화면으로 이동.
        		                            	  if(!record.get("menuId") && (!record.get("menuSeqNbr") || record.get("menuSeqNbr") == 0)) {
        		                            		  return;
        		                            	  }


        		                            	  var param = {};
        		                            	  param.trnsfrKndCd = "MENU_NAME"; // 메뉴명
//        		                            	  console.log(record);
        		                            	  param.trnsfrOriginKeyVal = record.get("menuId")+"_"+record.get("menuSeqNbr");// 메뉴아이디+메뉴일련번호

        		                            	  that.openPage(e, param);


        		                              }
        		                          }
        		                      }
                                 }
                                    , {text: bxMsg('cbb_items.AT#scrnId'), dataIndex: 'scrnId', flex : 1, style: 'text-align:center', align: 'left'
                                    	, renderer: function (val, metadata, record) {
                                    		if(record.data.depth == 3) {
                                    			return (val ? val : "") + "<button type=\"button\" class=\"bw-btn add-mg-l-10 f-r add-mg-r grid-search\"  id=\"btn-scrn-grid-search\"><i class=\"bw-icon i-25 i-search\"></i></button>";
                                    		}
                                    		else {
                                    			return "";
                                    		}
                                    	}
                                    	, listeners: {
                                            /**
                                             * 버튼 클릭 이벤트 등록
                                             */
                                            click: function (grid, rowEl, rowIdx, cellIdx, e, record) {
                                                if ($(e.target).hasClass('i-search')) {
                                                	// 화면팝업 호출

                                                	var param= {};
                                                	param.menuTargetYn = "Y";
                                                	var popupScrnGroup = new PopupScrnGroup(param);
                                                	popupScrnGroup.render();


                                                	popupScrnGroup.on('popUpSetData', function (data) {
                                                		record.set("scrnId", data.scrnId); // 설정하기
                                                	
                                                    });

                                            		if(record.data.txTpDscd==="R"){
                                            			record.data.txTpDscd = "U";
                                            			record.save();                                            
        		                                	}
                                                }
                                            }
                                        }
                                    }


                                  //메뉴처리유형코드
                                    , {text: bxMsg('cbb_items.SCRNITM#scrnTp'), dataIndex: 'menuPrcsngDscd',style: 'text-align:center',align: 'center', flex : 1
                                        , editor: {
                                            xtype: 'combobox'
                                            , store: that.comboStore1
                                            , displayField: 'cdNm'
                                            , valueField: 'cd'
                                        }
                                        , renderer: function (val) {
                                            index = that.comboStore1.findExact('cd', val);
                                            if (index != -1) {
                                                rs = that.comboStore1.getAt(index).data;
                                                return rs.cdNm
                                            }
                                        } // end of render
                                    } // end of atrbtVldtnWayCd
                                  //초기화면대상여부
                                    , {text: bxMsg('cbb_items.SCRNITM#dfltScrnYn'), dataIndex: 'dfltScrnTrgtYn',style: 'text-align:center',align: 'center', flex : 1
                                        , editor: {
                                            xtype: 'combobox'
                                            , store: that.comboStore2
                                            , displayField: 'cd'
                                            , valueField: 'cd'
                                        }
                                        , renderer: function (val) {
                                        	var classNm = "s-no";


                                        	if(val =="Y") {
                                    			classNm = "s-yes";
                                    		}
                                    		return "<span class=\"bw-sign "+classNm+"\">"+val+"</span>";


                                        } // end of render
                                    } // end of atrbtVldtnWayCd
                                    , {text: bxMsg('cbb_items.AT#parmVal'), dataIndex: 'parmVal', editor: 'textfield', style: 'text-align:center', align: 'center', flex : 1}
                                    , {text: bxMsg('cbb_items.AT#iconNm'), dataIndex: 'iconNm', editor: 'textfield', style: 'text-align:center', align: 'center', flex : 1}
                                    , {text: "", dataIndex: 'menuSeqNbr', hidden : true}
                                    , {text: "", dataIndex: 'menuId', hidden : true}
                                    , {text: "", dataIndex: 'menuItmAtrbtNm1', hidden : true}
                                    , {text: "", dataIndex: 'menuItmAtrbtNm2', hidden : true}
                                    , {text: "", dataIndex: 'menuItmAtrbtNm3', hidden : true}
                                    , {text: "", dataIndex: 'txTpDscd', hidden : true}
                                    , {text: "", dataIndex: 'pstnNbr', hidden : true}
                                    , {text: "", dataIndex: 'upSeqNbr', hidden : true}
                                    , {xtype: 'actioncolumn', width: 100, align: 'center',text: bxMsg('cbb_items.SCRNITM#edit'), style: 'text-align:center'
    	                             	, items: [
    	                             	          		{
    	                             	          			iconCls : "bw-icon i-25 i-func-add"
	                             	          				, handler: function (grid, rowIndex, colIndex, item, e, record) {
	                             	          					if (record.data.scrnId === null || record.data.scrnId === '') {
	                                                                record.appendChild({
	                                                                    children: null,
	                                                                    menuItmAtrbtNm1: "",
	                                                                    menuItmAtrbtNm2: "",
	                                                                    menuItmAtrbtNm3: "",
	                                                                    scrnId: "",
	                                                                    parmVal: "",
	                                                                    menuNm : "",
	                                                                    dfltScrnTrgtYn: "N",
	                                                                    txTpDscd : "C",
	                                                                	pstnNbr: "",
                                                                		upSeqNbr:""
	                                                                    	
	                                                                });
	                                                                var childCount=record.childNodes.length-1;
	                                                                var childNode=record.childNodes[childCount];
	                                                                childNode.data.pstnNbr=++childCount;
	                                                                childNode.data.upSeqNbr=record.data.menuSeqNbr; //TODO: 새로생겨서 SeqNbr이 없는애의 하위메뉴들은 여기가 안채워짐.
	                                                                childNode.save();

	                                                                record.data.leaf = false;
	                                                                record.commit();
	                                                                record.expand();
	                                                           
	                                                            }
	                             	          				}
    	                             	          		}
    	                             	          		, {
    	                             	          			iconCls : "bw-icon i-25 i-func-trash"
	                             	          				, handler: function (grid, rowIndex, colIndex, item, e, record) {
	                             	          					if (record.childNodes.length !== 0) {
	                                                                fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0029'));
	                                                                return;
	                                                            }
	                             	          					if( record.childNodes.length === 0){
	                             	          						flag = true;
	                             	          					}
	                             	          					if(record.data.txTpDscd!=="C"){
	                             	          						record.data.txTpDscd="D";
		                             	          					record.save();
			                             	          				that.deleteList.push(record.data);
	                             	          					}
	                             	          						record.destroy();
	                             	          				
	                             	          				}
    	                             	          		}
    	                             	        ]
    	                             }
                                ] // end of columns
                                , plugins: [
                                    Ext.create('Ext.grid.plugin.CellEditing', {
                                        pluginId: 'treeGridCellEdit'
                                        , clicksToEdit: 2
                                        , listeners: {
                                            'beforeedit': function (editor, e) {
                                                if (e.field == 'scrnId') {
                                                    return false;
                                                }else if(e.field=='menuNm' && e.record.data.txTpDscd!=="C"){
                                                	return false;
                                                }
                                            } // end of beforeedit
		                                    , 'afteredit': function (editor, e) {
		                                    	if(e.field == 'menuNm' && e.record.data.txTpDscd==="C") {
		                                    		
		                                    		// Register menu names of all languages.
		                                    		e.record.set("menuItmAtrbtNm1", e.record.get("menuNm"));
		                                    		e.record.set("menuItmAtrbtNm2", e.record.get("menuNm"));
		                                    		e.record.set("menuItmAtrbtNm3", e.record.get("menuNm"));
                                                	
                                                }
		                                    	if(e.record.data.txTpDscd==="R"){
                                            		e.record.data.txTpDscd = "U";
                                            		e.record.save();
    		                                    }
		                                    }  // end of after edit


                                        } // end of listners
                                    })
                                ]
                                , viewConfig: {
                                    toggleOnDblClick: false
                                    , plugins: {
	                                        ptype: 'treeviewdragdrop'
	                                        , containerScroll: true
                                    }
	                       			, listeners: {
		                       			 drop: function (element, data, overModel, dropPosition) {         
		                                     console.log("draganddrop");
		                                     console.log(data);
		                       				var node = data.records[0],
		                       				previousPstnNbr=node.previousSibling===null?"1":node.previousSibling.data.pstnNbr;
//		                       				previousPstnNbr=node.previousSibling.data.pstnNbr;
		                                	if(node.data.txTpDscd==="R"){
		                                		node.data.txTpDscd = "U";

		                                    }
		                                	node.data.pstnNbr=++previousPstnNbr;
	                                		node.save();
	                                		
		                                	while(node.nextSibling!==null){
		                                		
		                                		if(node.nextSibling.data.txTpDscd==="R"){
		                                			node.nextSibling.data.txTpDscd="U";
			                                    }
		                                		node.nextSibling.data.pstnNbr=++previousPstnNbr;
		                                		node.save();
		                                		node=node.nextSibling;
		                                	}
		                                	console.log("drag");
		                                	console.log(node);
		                                	node.data.upSeqNbr=node.parentNode.data.depth===0?0:node.parentNode.data.menuSeqNbr;//TODO: 새로생겨서 SeqNbr이 없는애의 하위메뉴들은 여기가 안채워짐.
		                       				node.save();
		                                 }
	                       			
	                       			
	                                }
                                }
                        	
                        	});


                        	that.$el.find(".CAPSV010-grid").html(that.CAPSV010TreeGrid.render({'height': "533px"}));




                        } // end of success:.function
                    }); // end of bxProxy.all


                }


//
//
//
                , render: function () {
                    var that = this;


                    that.menuId = "";
                    that.menuLvlVal = 0;

                    //배포처리반영[버튼비활성화]
                    this.resetDistributionBtn();
                    return this.$el;
                }
                , resetDistributionBtn : function(){
                	//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPSV010-wrap #btn-CAPSV010-tree-add')
                                        		,this.$el.find('.CAPSV010-wrap #btn-CAPSV010-tree-delete')
                                        		,this.$el.find('.CAPSV010-wrap #btn-CAPSV010-grid-add')
                                        		,this.$el.find('.CAPSV010-wrap #btn-CAPSV010-grid-save')
                                        		,this.$el.find('.CAPSV010-wrap #btn-CAPSV010-grid-up')
                                        		,this.$el.find('.CAPSV010-wrap #btn-CAPSV010-grid-down')
                                        			   ]);
                }


//
//
//
                , fn_createTree : function() {
                	var that = this;
                    that.subViews['CAPSV010Tree'] = new bxTree({
                        fields: {id: 'userGrpCd', value: 'menuNm'}
                        , listeners: {
                            clickItem: function (itemId, itemData, currentTarget, e) {
                                if (itemData.menuId) {
                                	that.inquiryBaseData(itemData);
                                }
                                that.seletedTreeItemData = itemData;
                            }
                        }
                    });


                     that.$el.find('.bx-tree-root').html(that.subViews['CAPSV010Tree'].render());


                     that.selectTree();
                }


//
//
//
                , selectTree : function() {
                	var that = this;
                	var sParam = {};


                	if(commonInfo.getInstInfo().instCd) {
                		sParam.instCd = commonInfo.getInstInfo().instCd;
                	}
                	else {
                		sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                	}


                    var linkData = {"header" : fn_getHeader("CAPSV0108401") , "CaMenuMgmtSvcGetMenuTreeIn" : sParam};


                    bxProxy.post(sUrl, JSON.stringify(linkData),{
                 	   enableLoading: true,
                        success: function (responseData) {
                        	if (fn_commonChekResult(responseData)) {
                        		that.subViews['CAPSV010Tree'].renderItem(responseData.CaMenuMgmtSvcGetMenuTreeOut.menuList);
                        	}
                        }
                    });
                }




//
//
//
                , addTree : function() {
                	var sParam = {};
                	var that = this;

                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                	var popupUserGroup = new PopupUserGroup(); // 팝업생성


                	if(commonInfo.getInstInfo().instCd) {
                		sParam.instCd = commonInfo.getInstInfo().instCd;
                	}
                	else {
                		sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                	}


                	sParam.userGrpCd = "";


                	popupUserGroup.render(sParam);
                	popupUserGroup.on('popUpSetData', function (data) {
                		that.setInitData();
//                		that.subViews['CAPSV010Tree'].addNode("", data);
                	});
                }


                //기관코드 셋팅
                , setInitData: function () {
                    var that = this;
                    var instCd = "";
                    that.seletedTreeItemData = {};


                    if(commonInfo.getInstInfo().instCd) {
                    	instCd = commonInfo.getInstInfo().instCd;
                	}
                	else {
                		instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                	}


                    if (instCd) {
                        that.selectTree();
                    } else {
                        fn_alertMessage("", bxMsg("cbb_items.SCRNITM#instSearchMsg"));
                    }
                }


//
//
//
                , clickDeleteTree : function () {
                	if($.isEmptyObject(this.seletedTreeItemData)) {
                		return;
                	}
            		if(this.seletedTreeItemData.chnlCd==null||this.seletedTreeItemData.menuId==null){
            			return;
            		}else if(this.CAPSV010TreeGrid.grid.getRootNode().childNodes.length!==0){
            			fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0068'));
            			return;
            		}
            		
            		//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
            		
                	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), this.deleteTree, this);
                }


                , deleteTree : function(that) {
                	var sParam = {};


                	// 현재 선택된 트리를 가져온다.
//                	console.log(that.seletedTreeItemData);
                	if(!$.isEmptyObject(that.seletedTreeItemData)) {
                	

                		if(commonInfo.getInstInfo().instCd) {
                    		sParam.instCd = commonInfo.getInstInfo().instCd;
                    	}
                    	else {
                    		sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                    	}


                		// 기관코드, 사용자그룹코드, 채널코드, 메뉴아이디
                		sParam.userGrpCd = that.seletedTreeItemData.userGrpCd;
                		sParam.chnlCd = that.seletedTreeItemData.chnlCd;
                		sParam.menuId = that.seletedTreeItemData.menuId;


                        var linkData = {"header" : fn_getHeader("CAPSV0108301") , "CaMenuMgmtSvcGetMenuTreeIn" : sParam};


                        bxProxy.post(sUrl, JSON.stringify(linkData),{
                     	   enableLoading: true,
                            success: function (responseData) {
                            	if (fn_commonChekResult(responseData)) {
                            		// 재조회
                            		that.setInitData();
                            	}
                            }
                        });
                	}


                }
//
//
//
                , openPage : function(evnet, param) {
                	var that = this;


                	if(!param) {
                		return;
                	}


                	that.$el.trigger({
                		type: 'open-conts-page',
                		pageHandler: 'CAPCM190',
                		pageDPName: bxMsg('cbb_items.SCRN#CAPCM190'),
                		pageInitialize: true,
                		pageRenderInfo: {
                			trnsfrKnd : param.trnsfrKndCd
            				, trnsfrOriginKeyVal : param.trnsfrOriginKeyVal
                		}
                	});
                }


//
//
//
                , inquiryBaseData: function (param) {
                    // header 정보 set
                    var that = this;
                    var sParam = {};
                    that.deleteList = [];

                    // 입력 Key값 set
                    sParam.menuId = param.menuId;  // 컴포넌트코드
                    sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드


                    var linkData = {"header": fn_getHeader("CAPSV0108402"), "CaMenuMgmtSvcGetMenuItemListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                if (responseData.CaMenuMgmtSvcGetMenuItemListIO) {
                                    that.menuId = responseData.CaMenuMgmtSvcGetMenuItemListIO.menuId;
                                    that.menuLvlVal = responseData.CaMenuMgmtSvcGetMenuItemListIO.menuLvlVal;


                                    that.CAPSV010TreeGrid.setStoreRootNode(responseData.CaMenuMgmtSvcGetMenuItemListIO.menuItemList);
                                }
                            }
                        }   // end of suucess: fucntion
                    });     // end of bxProxy
                } // end




//
//
//
                , clickSaveGrid : function(event) {
                	
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                	var gridAllData = this.CAPSV010TreeGrid.getAllData();
                	if(gridAllData.length > 0 || flag ==='true'|| this.deleteList.length>0) {
                		fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveGrid, this);
                	}
                	else {
                		fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0034'));
                	}

                } 


//
//
//
                , saveGrid : function(that) {

                	 var gridAllData = that.CAPSV010TreeGrid.getAllData();
                     var sParam = {};
                     sParam.menuId = that.menuId;
                     sParam.menuLvlVal = that.menuLvlVal;
                     sParam.menuItemList = [];
                     if (gridAllData.length > 0 || that.deleteList.length>0) {
                         $(gridAllData).each(function (idx, data) {
                        	 var sub = {};
                             sub.scrnId = data.scrnId;
                             sub.menuNm = data.menuNm;
                             sub.menuSeqNbr=data.menuSeqNbr;

                             sub.menuItmAtrbtNm1 = data.menuItmAtrbtNm1;
                             sub.menuItmAtrbtNm2 = data.menuItmAtrbtNm2;
                             sub.menuItmAtrbtNm3 = data.menuItmAtrbtNm3;
                             

                             sub.parmVal = data.parmVal;
                             sub.menuPrcsngDscd = data.menuPrcsngDscd;
                             sub.dfltScrnTrgtYn = data.dfltScrnTrgtYn;
                             sub.iconNm = data.iconNm;
                             sub.children = data.children;
                             sub.pstnNbr = data.pstnNbr;
                             sub.upSeqNbr = data.upSeqNbr;
                             sub.txTpDscd = data.txTpDscd;
                             
                             sParam.menuItemList.push(sub);
                             console.log(data)
                             
                             
                             
                         });

                        	 $(that.deleteList).each(function (idx, data) {
                        		 var sub = {};
                        		 sub.scrnId = data.scrnId;
                        		 sub.menuNm = data.menuNm;
                        		 sub.menuSeqNbr=data.menuSeqNbr;
                        		 
                        		 sub.menuItmAtrbtNm1 = data.menuItmAtrbtNm1;
                        		 sub.menuItmAtrbtNm2 = data.menuItmAtrbtNm2;
                        		 sub.menuItmAtrbtNm3 = data.menuItmAtrbtNm3;
                        		 
                        		 
                        		 sub.parmVal = data.parmVal;
                        		 sub.menuPrcsngDscd = data.menuPrcsngDscd;
                        		 sub.dfltScrnTrgtYn = data.dfltScrnTrgtYn;
                        		 sub.iconNm = data.iconNm;
                        		 sub.children = data.children;
                        		 sub.pstnNbr = data.pstnNbr;
                        		 sub.upSeqNbr = data.upSeqNbr;
                        		 sub.txTpDscd = data.txTpDscd;
                        		 
                        		 sParam.menuItemList.push(sub);
                        	 });

                         console.log("saveData : ");
                         console.log(sParam);


                         var linkData = {"header": fn_getHeader("CAPSV0108102"), "CaMenuMgmtSvcGetMenuItemListIO": sParam};
                         // ajax호출
                         bxProxy.post(sUrl, JSON.stringify(linkData), {
                             enableLoading: true,
                             success: function (responseData) {
                                 if (fn_commonChekResult(responseData)) {
                                	 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));

                                	 var param = {};
                                	 param.menuId = that.menuId;
                                	 // tree grid 재조회
                                	 that.inquiryBaseData(param);
                                 }
                             }   // end of suucess: fucntion
                         });     // end of bxProxy


                     }
                }


//
//
//
                , addGrid : function() {
                	var that = this;


                	that.CAPSV010TreeGrid.addData({});
                }
//
//
//
                , gridAreaModal : function() {
                	fn_pageLayerCtrl("#CAPSV010-grid", this.$el.find("#btn-up-grid"));
                }


//
//
//
                , gridExcel : function() {
                	var that = this;
                	that.CAPSV010TreeGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPSV010')+"_"+getCurrentDate("yyyy-mm-dd"));
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
            })
            ; // end of Backbone.View.extend({


        return CAPSV010View;
    } // end of define function
)
; // end of define
