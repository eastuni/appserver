define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPSV/001/_CAPSV001.html'
        , 'bx-component/date-picker/_date-picker'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx-component/bx-tree/bx-tree'
        , 'app/views/page/popup/CAPSV/popup-service'
        , 'app/views/page/popup/CAPAT/popup-brnchCd'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , DatePicker
        , ExtGrid
        , bxTree
        , PopupService
        , PopupDept
        , commonInfo
        ) {


        /**
         * Backbone
         */
        var CAPSV001View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPSV001-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                	'click #btn-tree-search' : 'loadTreeList'
            		, 'keydown #searchKey' : 'fn_enter'


                    , 'click #btn-base-reset': 'clickResetBaseArea'
                	, 'click #btn-base-save': 'clickSaveBase'
            		, 'click #btn-base-delete': 'clickDeleteBase'


                	, 'click #btn-base-search-modal': 'baseSearchModal'


        			, 'click #btn-CAPSV001-dept-grid-save': 'clickSaveDeptGrid'
    				, 'click #btn-CAPSV001-dept-grid-add': 'addDeptGrid'


					, 'click #btn-CAPSV001-srvc-grid-save': 'clickSaveSrvcGrid'
					, 'click #btn-CAPSV001-srvc-grid-add': 'addSrvcGrid'


					, 'click #btn-up-dept-grid': 'deptGridAreaModal'
					, 'click #btn-up-srvc-grid': 'srvcGridAreaModal'


					, 'click #btn-tree-hide': 'hideTree'
					, 'click #btn-tree-show': 'showTree'


					, 'click #tab-CAPSV001-dept' : 'clickTapDept'
					, 'click #tab-CAPSV001-srvc' : 'clickTapSrvc'
                }
//
//
//
                , initialize: function (initData) {
                    var that = this;
                    that.that = this;

                  //set institution code
					this.instCd = fn_getInstCd(commonInfo.getInstInfo().instCd);
					if(!this.instCd){
						this.instCd = $.sessionStorage('instCd');
					}

                    that.deleteList = [];


                    $.extend(that, initData);
                    that.$el.html(that.tpl());
                    that.$el.find("#srvc-gird-area").hide();
                    that.initData = initData;


                    // 왼쪽 트리 생성
                    that.fn_createTree();


                    // 그리드 생성
                    that.fn_createGrid();
                }


//
//
//
                , render: function () {
                 // 콤보데이터 로딩
                    var sParam = {};


                    //제어센터유형
                    sParam = {};
                    sParam.className = "CAPSV001-cntrlCntrTpCd-wrap";
                    sParam.targetId = "cntrlCntrTpCd";
                    sParam.nullYn = "N";
                    sParam.cdNbr = "11305";
                    fn_getCodeList(sParam, this);


                    //제어센터성격
                    sParam = {};
                    sParam.className = "CAPSV001-cntrlChrCd-wrap";
                    sParam.targetId = "cntrlChrCd";
                    sParam.nullYn = "N";
                    sParam.cdNbr = "11306";
                    fn_getCodeList(sParam, this);


                    //휴일구분
                    sParam = {};
                    sParam.className = 'CAPSV001-hldyDscd-wrap';
                    sParam.targetId = "hldyDscd";
                    sParam.nullYn = "N";
//                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); 
//                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "11307";
                    fn_getCodeList(sParam, this);

                  //배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPSV001-wrap #btn-base-save')
                                        		,this.$el.find('.CAPSV001-wrap #btn-base-delete')
                                        		,this.$el.find('.CAPSV001-wrap #btn-CAPSV001-dept-grid-save')
                                        		,this.$el.find('.CAPSV001-wrap #btn-CAPSV001-srvc-grid-save')
                                        			   ]);

                    return this.$el;
                }


//
//
//
                , fn_createTree : function() {
                	var that = this;
                    that.subViews['CAPSV001Tree'] = new bxTree({
                   	   fields: {id: 'nodeId', value: 'nodeNm'},
                          listeners: {
                              clickItem: function(itemId, itemData, currentTarget, e) {
                            	  that.inquiryBaseData(itemData);
                              }
                          }
                      });


                     that.$el.find('.bx-tree-root').html(that.subViews['CAPSV001Tree'].render());


                     that.selectTree();
                }


//
//
//
                , selectTree : function() {
                	var that = this;
                	that.treeList = [];


                    var sParam = {};
                    if(commonInfo.getInstInfo().instCd) {
                		sParam.instCd = commonInfo.getInstInfo().instCd;
                	}
                	else {
                		sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                	}


                    var linkData = {"header" : fn_getHeader("CAPSV0028405") , "CaCntrlCntrMgmtSvcGetCntrlCntrTreeIn" : sParam};


                    bxProxy.post(sUrl, JSON.stringify(linkData),{
                 	   enableLoading: true,
                        success: function (responseData) {
                     	   if(fn_commonChekResult(responseData)) {
                     		  if(responseData.CaCntrlCntrMgmtSvcGetCntrlCntrTreeOut) {
                     			 that.treeList = responseData.CaCntrlCntrMgmtSvcGetCntrlCntrTreeOut.tblNm;
                  				 that.subViews['CAPSV001Tree'].renderItem(responseData.CaCntrlCntrMgmtSvcGetCntrlCntrTreeOut.tblNm);
                  			  }
                     	   }
                        }
                    });
                }


//
//
//
                , loadTreeList : function() {
             	   var that = this;


             	   var searchKey = that.$el.find('[data-form-param="searchKey"]').val();


             	   var searchTreeList = [];


             	   if(!searchKey) {
             		   that.subViews['CAPSV001Tree'].renderItem(that.treeList);
             		   return;
             	   }


             	   if(that.treeList.length < 1) {
             		   return;
             	   }


             	   $(that.treeList).each(function(idx, data) {
             		   searchTreeList = that.selecteTreeItem(searchTreeList, data, searchKey);
             	   });


             	   that.subViews['CAPSV001Tree'].renderItem(searchTreeList);
                }


                , selecteTreeItem : function(searchTreeList, obj,  inputValue) {


                		for(var i = 0; i < obj.children.length; i++) {
                			var temp001 = obj.children[i];


                			if(temp001.cdNm == null) {
	 	           				if(temp001.nodeId.indexOf(inputValue) > -1 || temp001.nodeNm.indexOf(inputValue) > -1) {
	 	           					searchTreeList[searchTreeList.length] = temp001;
	 	           				}
	 	           			}
                		}


                	return searchTreeList;
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
                , fn_createGrid : function() {
                	var that = this;


                    that.CAPSV001DeptGrid = new ExtGrid({
                        // 그리드 컬럼 정의
                        fields: ['rowIndex', 'deptId', 'deptNm', 'aplyStartDt', 'aplyEndDt', 'status']
                        , id: 'CAPSV001Grid'
                        , columns: [
                            {
                                text: 'No.'
                                , dataIndex: 'rowIndex'
                                , sortable: false
                                , width : 80
								, height: 25
                                , style: 'text-align:center'
                                , align: 'center'
                                // other config you need....
                                , renderer: function (value, metaData, record, rowIndex) {
                                    return rowIndex + 1;
                                }
                            }
                            , {text: bxMsg('cbb_items.AT#deptId'), flex: 1, dataIndex: 'deptId', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#deptNm'), flex: 1, dataIndex: 'deptNm', style: 'text-align:center', align: 'center'}
                            , {text: bxMsg('cbb_items.AT#aplyStartDt'), flex: 1, dataIndex: 'aplyStartDt', style: 'text-align:center', align: 'center'
                                , renderer: function (val) {
                                    return XDate(val).toString('yyyy-MM-dd');
                                }
                                , editor: new Ext.form.DateField({
                                    allowBlank: false
                                    , xtype: 'datefield'
                                    , format: 'Y-m-d'
                                    , minValue: new Date()
                                })
                            }
                            , {text: bxMsg('cbb_items.AT#aplyEndDt'), flex: 1, dataIndex: 'aplyEndDt', style: 'text-align:center', align: 'center'
                                , renderer: function (val) {
                                    return XDate(val).toString('yyyy-MM-dd');
                                }
                                , editor: new Ext.form.DateField({
                                    allowBlank: false
                                    , xtype: 'datefield'
                                    , format: 'Y-m-d'
                                    , minValue: new Date()
                                })
                            }
                            , {dataIndex: 'status', hidden : true}
                            , {xtype: 'actioncolumn', width: 80, align: 'center', style: 'text-align:center', text: bxMsg('cbb_items.SCRNITM#del')
                             	, items: [
												{
												  iconCls : "bw-icon i-25 i-func-trash"
												  , tooltip: bxMsg('tm-layout.delete-field')
												  , handler: function (grid, rowIndex, colIndex, item, e, record) {
													  that.deleteList.push(record.data);
													  grid.store.remove(record);
												  }
												}
                             	        ]
                             }
                        ] // end of columns
	                    , gridConfig: {
	                        // 셀 에디팅 플러그인
	                        // 2번 클릭시, 에디팅할 수 있도록 처리
	                        plugins: [
	                            Ext.create('Ext.grid.plugin.CellEditing', {
	                                clicksToEdit: 2
	                                , listeners: {


	                                }  // end of listener for after edit
	                            }) // end of Ext.create
	                        ] // end of plugins
	                    } // end of gridConfig
                    });


                    that.$el.find("#CAPSV001-dept-grid").html(that.CAPSV001DeptGrid.render({'height': CaGridHeight}));


                    // 서비스 그리드 생성
                    that.CAPSV001SrvcGrid = new ExtGrid({
                    	// 그리드 컬럼 정의
                    	fields: ['rowIndex', 'cmpntCd', 'srvcCd', 'srvcNm', 'aplyStartDt', 'aplyEndDt', 'status']
                    , id: 'CAPSV001Grid'
                    	, columns: [
                    	            {
                    	            	text: 'No.'
                	            		, dataIndex: 'rowIndex'
            	            			, sortable: false
            	            			, width : 80
            	            			, height: 25
            	            			, style: 'text-align:center'
        	            				, align: 'center'
        	            					// other config you need....
    	            					, renderer: function (value, metaData, record, rowIndex) {
    	            						return rowIndex + 1;
    	            					}
                    	            }
                    	            , {text: bxMsg('cbb_items.AT#cmpntCd'), flex: 1, dataIndex: 'cmpntCd', style: 'text-align:center', align: 'center'
                    	            	, code: '11603'
                                        , renderer: function (val) {
                                            return val ? bxMsg('cbb_items.CDVAL#11603' + val) : '';
                                        }
                    	            }
                    	            , {text: bxMsg('cbb_items.AT#srvcCd'), flex: 1, dataIndex: 'srvcCd', style: 'text-align:center', align: 'center'}
                    	            , {text: bxMsg('cbb_items.AT#srvcNm'), flex: 1, dataIndex: 'srvcNm', style: 'text-align:center', align: 'center'}
                    	            , {text: bxMsg('cbb_items.AT#aplyStartDt'), flex: 1, dataIndex: 'aplyStartDt', style: 'text-align:center', align: 'center'
                    	            	, renderer: function (val) {
                    	            		return XDate(val).toString('yyyy-MM-dd');
                    	            	}
                    	            , editor: new Ext.form.DateField({
                    	            	allowBlank: false
                    	            	, xtype: 'datefield'
                    	            		, format: 'Y-m-d'
                    	            			, minValue: new Date()
                    	            })
                    	            }
                    	            , {text: bxMsg('cbb_items.AT#aplyEndDt'), flex: 1, dataIndex: 'aplyEndDt', style: 'text-align:center', align: 'center'
                    	            	, renderer: function (val) {
                    	            		return XDate(val).toString('yyyy-MM-dd');
                    	            	}
                    	            , editor: new Ext.form.DateField({
                    	            	allowBlank: false
                    	            	, xtype: 'datefield'
                    	            		, format: 'Y-m-d'
                    	            			, minValue: new Date()
                    	            })
                    	            }
                    	            , {dataIndex: 'status', hidden : true}
                    	            , {xtype: 'actioncolumn', width: 80, align: 'center', style: 'text-align:center', text: bxMsg('cbb_items.SCRNITM#del')
                    	            	, items: [
                    	            	          {
                    	            	        	  iconCls : "bw-icon i-25 i-func-trash"
                    	            	        		  , tooltip: bxMsg('tm-layout.delete-field')
                    	            	        		  , handler: function (grid, rowIndex, colIndex, item, e, record) {
                    	            	        			  that.deleteList.push(record.data);
        													  grid.store.remove(record);
                    	            	        		  }
                    	            	          }
                    	            	          ]
                    	            }
            	            ] // end of columns
		                    , gridConfig: {
		                        // 셀 에디팅 플러그인
		                        // 2번 클릭시, 에디팅할 수 있도록 처리
		                        plugins: [
		                            Ext.create('Ext.grid.plugin.CellEditing', {
		                                clicksToEdit: 2
		                                , listeners: {


		                                }  // end of listener for after edit
		                            }) // end of Ext.create
		                        ] // end of plugins
		                    } // end of gridConfig
                    });


                    that.$el.find("#CAPSV001-srvc-grid").html(that.CAPSV001SrvcGrid.render({'height': CaGridHeight}));
                }


//
//
//
                , inquiryBaseData: function (param) {
                    // header 정보 set
                    var that = this;
                    var sParam = {};


                    if(!param.cntrlCntrId) {
                    	return;
                    }


                    sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                    sParam.cntrlCntrId = param.cntrlCntrId;


                    var linkData = {"header": fn_getHeader("CAPSV0028401"), "CaCntrlCntrMgmtSvcGetCntrlCntrBsicIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	var data = responseData.CaCntrlCntrMgmtSvcGetCntrlCntrBsicOut;
                            	that.setBaseData(that, "S", data);


                            	if(that.$el.find("#dept-grid-area").is(':visible')) {
                            		that.selectDeptList(sParam.cntrlCntrId);
                            	}
                            	else {
                            		that.selectSrvcList(sParam.cntrlCntrId);
                            	}
                            	that.deleteList = [];
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                } // end


                , clickResetBaseArea : function() {
                	this.setBaseData(this, "R", null);
                }
//
//
//
                , setBaseData : function(that, type, data) {
                	if(type == "R") {
                		this.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrNm"]').val("");
                		this.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrId"]').val("");
                		this.$el.find('#CAPSV001-base-table [data-form-param="cntrlChrCd"] option:eq(0)').attr("selected", "selected");
                		this.$el.find('#CAPSV001-base-table [data-form-param="hldyDscd"] option:eq(0)').attr("selected", "selected");
                		this.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrTpCd"] option:eq(0)').attr("selected", "selected");


                		this.$el.find("#tab-CAPSV001-dept").trigger("click");
                	}
                	else {
                		this.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrNm"]').val(data.cntrlCntrNm);
                		this.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrId"]').val(data.cntrlCntrId);
                		this.$el.find('#CAPSV001-base-table [data-form-param="cntrlChrCd"]').val(data.cntrlChrCd);
                		this.$el.find('#CAPSV001-base-table [data-form-param="hldyDscd"]').val(data.hldyDscd);
                		this.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrTpCd"]').val(data.cntrlCntrTpCd);
                	}
                }


//
//
//
                , clickTapDept : function(event) {
                	this.$el.find("#tab-title > ul > li").removeClass("on-tab");
                	this.$el.find("#tab-CAPSV001-dept").addClass("on-tab");
                	this.$el.find("#dept-grid-area").show();
                	this.$el.find("#srvc-gird-area").hide();
                	this.deleteList = [];
                	this.selectDeptList(this.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrId"]').val());
                }


                , clickTapSrvc : function(event) {
                	this.$el.find("#tab-title > ul > li").removeClass("on-tab");
                	this.$el.find("#tab-CAPSV001-srvc").addClass("on-tab");
                	this.$el.find("#dept-grid-area").hide();
                	this.$el.find("#srvc-gird-area").show();
                	this.deleteList = [];
                	this.selectSrvcList(this.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrId"]').val());
                }


//
//
//
            	, selectDeptList: function (cntrlCntrId) {
                    var that = this;
                    var sParam = {};


                    if(!cntrlCntrId) {
                    	that.CAPSV001DeptGrid.resetData();
                    	return;
                    }


                    // 입력 Key값 set
                    sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                    sParam.cntrlCntrId = cntrlCntrId;


                    var linkData = {"header": fn_getHeader("CAPSV0028403"), "CaCntrlCntrMgmtSvcGetCntrlCntrDtlIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
//                    	enableLoading: true,
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                if (responseData.CaCntrlCntrMgmtSvcGetCntrlCntrDtlOut) {
                                	var tbl = responseData.CaCntrlCntrMgmtSvcGetCntrlCntrDtlOut.tblNm;


                                	$(tbl).each(function(idx, data) {
                                		data.status = "U";
                                	});
                                	that.deleteList = [];
                                    that.CAPSV001DeptGrid.setData(tbl);
                                }
                            }
                        }   // end of suucess: fucntion
                    });     // end of bxProxy
                } // end of 조회


//
//
//
                , selectSrvcList: function (cntrlCntrId) {
                	var that = this;
                    var sParam = {};


                    if(!cntrlCntrId) {
                    	that.CAPSV001SrvcGrid.resetData();
                    	return;
                    }


                    // 입력 Key값 set
                    sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                    sParam.cntrlCntrId = cntrlCntrId;


                    var linkData = {"header": fn_getHeader("CAPSV0028402"), "CaCntrlCntrMgmtSvcGetCntrlCntrSrvcIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
//                    	enableLoading: true,                    	
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                if (responseData.CaCntrlCntrMgmtSvcGetCntrlCntrSrvcOut) {
                                	var tbl = responseData.CaCntrlCntrMgmtSvcGetCntrlCntrSrvcOut.tblNm;


                                	$(tbl).each(function(idx, data) {
                                		data.status = "U";
                                	});
                                	that.deleteList = [];
                                	that.CAPSV001SrvcGrid.setData(tbl);
                                }
                            }
                        }   // end of suucess: fucntion
                    });     // end of bxProxy
                } // end of 조회


//
//
//


				, clickSaveBase : function(event) {
					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }
					
					fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveBase, this);
				}


//
//
//
				, saveBase : function(that) {


					var sParam = {};
					sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
					sParam.cntrlCntrId = that.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrId"]').val();       //제어센터ID
                    sParam.cntrlCntrNm =  that.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrNm"]').val();      //제어센터명
                    sParam.cntrlCntrTpCd = that.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrTpCd"]').val();       //제어센터유형
                    sParam.cntrlChrCd = that.$el.find('#CAPSV001-base-table [data-form-param="cntrlChrCd"]').val();       //제어센터성격
                    sParam.hldyDscd = that.$el.find('#CAPSV001-base-table [data-form-param="hldyDscd"]').val();       //휴일구분


                      // header 정보 set
                      var header =  new Object();


                      if(!sParam.cntrlCntrId) { // 등록
                    	  header = fn_getHeader("CAPSV0028101");
                        }
                      else { // 수정
                    	  header = fn_getHeader("CAPSV0028201");
                      }


                      var linkData = {"header": header, "CntrlCntrMgmtSvcCntrlCntrBsicIn": sParam};


                      //ajax 호출
                      bxProxy.post(sUrl, JSON.stringify(linkData),{
                          success: function (responseData) {
                              // 에러여부 확인. 에러시 메시지 띄워주고 정상시 재조회 호출
                        	  if(fn_commonChekResult(responseData)) {
                        		  fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                  var param = {};
                                  if(!sParam.cntrlCntrId) { //등록
                                	  param.cntrlCntrId = responseData.CaCntrlCntrMgmtSvcCntrlCntrBsicOut.cntrlCntrId;
                                	  that.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrId"]').val(param.cntrlCntrId);
                                	  that.selectTree();
                                  }
                                  else { //수정
                                	  param.cntrlCntrId = sParam.cntrlCntrId;
                                	  that.inquiryBaseData(param);
                                  }
                              }
                        } // end of success: function
                    }); // end of bxProxy.post.....
				}


//
//
//
				, clickDeleteBase : function(event) {
					if(!this.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrId"]').val()) {
						return;
					}

					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }
					fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), this.deleteBase, this);
				}


//
//
//
				, deleteBase : function(that) {


					var sParam = {};
					sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
					sParam.cntrlCntrId = that.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrId"]').val();       //제어센터ID
                    sParam.cntrlCntrNm =  that.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrNm"]').val();      //제어센터명
                    sParam.cntrlCntrTpCd = that.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrTpCd"]').val();       //제어센터유형
                    sParam.cntrlChrCd = that.$el.find('#CAPSV001-base-table [data-form-param="cntrlChrCd"]').val();       //제어센터성격
                    sParam.hldyDscd = that.$el.find('#CAPSV001-base-table [data-form-param="hldyDscd"]').val();       //휴일구분


                    var linkData = {"header": fn_getHeader("CAPSV0028301"), "CaCntrlCntrMgmtSvcCntrlCntrBsicIn": sParam};


                    //ajax 호출
                    bxProxy.post(sUrl, JSON.stringify(linkData),{
                        success: function (responseData) {


                            // 에러여부 확인. 에러시 메시지 띄워주고 정상시 재조회 호출
                      	  if(fn_commonChekResult(responseData)) {
                      		  fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                      		  // 초기화
                      		  that.clickResetBaseArea();
                      		  // 트리 재조회
                      		  that.selectTree();
                      	  }
                        } // end of success function
                    });   // end of bxProxy
				}




//
//
//
				, clickSaveDeptGrid : function () {
					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }
	                
					fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveDeptGrid, this);
                }


				, clickSaveSrvcGrid : function () {
					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }
					fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveSrvcGrid, this);
				}


//
//
//
                , saveDeptGrid : function(that) {
                	var gridAllData = that.CAPSV001DeptGrid.getAllData();
                	var sParam = {};
                	sParam.tblNm = [];


                	sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                	sParam.cntrlCntrId = that.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrId"]').val();       //제어센터ID


                	if(gridAllData.length > 0) {


                		$(gridAllData).each(function (idx, data) {
                			var sub = {};
                			sub.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                			sub.cntrlCntrId = that.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrId"]').val(); // 제어센터ID
                            sub.deptId = data.deptId; //부점코드
                            sub.aplyStartDt = XDate(data.aplyStartDt).toString('yyyyMMdd'); //적용시작일
                            sub.aplyEndDt = XDate(data.aplyEndDt).toString('yyyyMMdd'); //적용종료일


                			sParam.tblNm.push(sub);
                		});
                	}


                	var linkData = {"header": fn_getHeader("CAPSV0028102"), "CaCntrlCntrMgmtSvcCntrlCntrDtlIn": sParam};


            		// ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                // 저장후 재조회
                                that.selectDeptList(sParam.cntrlCntrId);
                            }
                        }   // end of suucess: fucntion
                    });     // end of bxProxy
                }


                , saveSrvcGrid : function(that) {
                	var gridAllData = that.CAPSV001SrvcGrid.getAllData();
                	var sParam = {};
                	sParam.tblNm = [];


                	sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                	sParam.cntrlCntrId = that.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrId"]').val();       //제어센터ID


                	if(gridAllData.length > 0) {


                		$(gridAllData).each(function (idx, data) {
                			var sub = {};
                			sub.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                			sub.cntrlCntrId = sParam.cntrlCntrId; // 제어센터ID
                			sub.srvcCd = data.srvcCd; //서비스코드
                			sub.aplyStartDt = XDate(data.aplyStartDt).toString('yyyyMMdd'); //적용시작일
                			sub.aplyEndDt = XDate(data.aplyEndDt).toString('yyyyMMdd'); //적용종료일


                			sParam.tblNm.push(sub);
                		});
                	}


                	var linkData = {"header": fn_getHeader("CAPSV0028103"), "CaCntrlCntrMgmtSvcCntrlCntrSrvcIn": sParam};


                	// ajax호출
                	bxProxy.post(sUrl, JSON.stringify(linkData), {
                		success: function (responseData) {
                			if (fn_commonChekResult(responseData)) {
                				fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                				// 저장후 재조회
                				that.selectSrvcList(sParam.cntrlCntrId);
                			}
                		}   // end of suucess: fucntion
                	});     // end of bxProxy
                }


//
//
//
                , addDeptGrid : function () {
                	var that = this;
                	var param = {};
                	param.instCd = this.instCd;
                	param.dtogRelCd = '01'; //기본조직 조회
                	
                	var popupDept = new PopupDept(param);
                	popupDept.render();


                	popupDept.on('popUpSetData', function (data) {


                		var gridAllData = that.CAPSV001DeptGrid.getAllData();
                		var chkDup = false;


                		$(gridAllData).each(function(idx, gridData) {
                			if(gridData.deptId == data.deptId) {
                				chkDup = true;
                				return false;
                			}
                		});


                		if(!chkDup) {
                			that.CAPSV001DeptGrid.addData(
                    				{"deptId" : data.deptId
                    					, "deptNm" : data.deptNm
                    					, "aplyStartDt": getCurrentDate("yyyy-mm-dd")
                    					, "aplyEndDt": "9999-12-31"
                    					, "status" : "I"}
                    				);
                		}
                    });
                }


                , addSrvcGrid : function() {
                	var that = this;
                	var popupService = new PopupService();
                	popupService.render();


                	popupService.on('popUpSetData', function (data) {


                		var gridAllData = that.CAPSV001SrvcGrid.getAllData();
                		var chkDup = false;


                		$(gridAllData).each(function(idx, gridData) {
                			if(gridData.srvcCd == data.srvcCd) {
                				chkDup = true;
                				return false;
                			}
                		});


                		if(!chkDup) {
                			that.CAPSV001SrvcGrid.addData(
                    				{"srvcCd" : data.srvcCd
                    					, "cmpntCd" : data.cmpntCd
                    					, "srvcNm" : data.srvcNm
                    					, "aplyStartDt": getCurrentDate("yyyy-mm-dd")
                    					, "aplyEndDt": "9999-12-31"
                    					, "status" : "I"
                    					}
                				);
                		}
                    });
                }


//
//
//
                , baseSearchModal : function() {
                	fn_pageLayerCtrl("#CAPSV001-base-table", this.$el.find("#btn-base-search-modal"));
                }


//
//
//
                , deptGridAreaModal : function() {
                	var target = this.$el.find("#btn-up-dept-grid").attr("data-info");
                	fn_pageLayerCtrl("#"+target, this.$el.find("#btn-up-dept-grid"));


                	if(this.$el.find("#dept-grid-area").is(':visible')) {
                		this.selectDeptList(this.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrId"]').val());
                	}


                }


                , srvcGridAreaModal : function() {
                	var target = this.$el.find("#btn-up-srvc-grid").attr("data-info");
                	fn_pageLayerCtrl("#"+target, this.$el.find("#btn-up-srvc-grid"));


                	if(this.$el.find("#srvc-gird-area").is(':visible')) {
                		this.selectSrvcList(this.$el.find('#CAPSV001-base-table [data-form-param="cntrlCntrId"]').val());
                	}
                }


//
//
//
                , gridExcel : function() {
                	var that = this;
                	that.CAPSV001Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPSV001')+"_"+getCurrentDate("yyyy-mm-dd"));
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


        return CAPSV001View;
    } // end of define function
)
; // end of define
