define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPSV/050/_CAPSV050.html'
        , 'bx-component/date-picker/_date-picker'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx-component/bx-tree/bx-tree'
        , 'app/views/page/popup/CAPSV/popup-service'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , DatePicker
        , ExtGrid
        , bxTree
        , PopupService
        , commonInfo
        ) {


        /**
         * Backbone
         */
        var CAPSV050View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPSV050-page'
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
        			, 'click #btn-mltLng': 'openPage'


        			, 'click #btn-CAPSV050-grid-save': 'clickSaveGrid'
    				, 'click #btn-CAPSV050-grid-add': 'addGrid'
					, 'click #btn-up-grid': 'gridAreaModal'


					, 'click #btn-tree-hide': 'hideTree'
					, 'click #btn-tree-show': 'showTree'
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


                    that.comboStore1 = {};
                    var sParam = {};


                    sParam.cdNbr = "11603";


                    var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    bxProxy.all([
                                 {
		                            // 컴포넌트콤보로딩
		                            url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {


		                            	if (fn_commonChekResult(responseData)) {
		                            		that.comboStore1 = new Ext.data.Store({
		                                        fields: ['cd', 'cdNm']
		                                        , data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
		                                    });
		                                }
		                            }
		                        }
                          ]
                        , {
                            success: function () {
                                that.CAPSV050Grid = new ExtGrid({
                                    // 그리드 컬럼 정의
                                    fields: ['rowIndex', 'cmpntCd', 'srvcCd', 'srvcNm']
                                    , id: 'CAPSV050Grid'
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
                                        , {
                                            text: bxMsg('cbb_items.SCRNITM#cmpnt'), flex: 1, dataIndex: 'cmpntCd', style: 'text-align:center', align: 'left'
                                            	, editor: {
	                                                xtype: 'combobox'
	                                                , store: that.comboStore1
	                                                , displayField: 'cdNm'
	                                                , valueField: 'cd'
	                                            }
                                            , renderer: function (val) {
                                                var index = that.comboStore1.findExact('cd', val);


                                                if (index != -1) {
                                                    var rs = that.comboStore1.getAt(index).data;


                                                    return rs.cdNm;
                                                }
                                            }
                                        }
                                        , {text: bxMsg('cbb_items.AT#srvcCd'), flex: 1, dataIndex: 'srvcCd', style: 'text-align:center', align: 'left'}
                                        , {text: bxMsg('cbb_items.AT#srvcNm'), flex: 1, dataIndex: 'srvcNm', style: 'text-align:center', align: 'left'}
                                        , {
        	                             	xtype: 'actioncolumn', width: 80, align: 'center',text: bxMsg('cbb_items.SCRNITM#del')
        	                             	 , style: 'text-align:center'
        	                             	, items: [
															{
															//  icon: 'images/icon/x-delete-16.png'
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


                                    // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                                    , gridConfig: {
                                    	// 셀 에디팅 플러그인
                                        plugins: [
                                            Ext.create('Ext.grid.plugin.CellEditing', {
                                                // 2번 클릭시, 에디팅할 수 있도록 처리
                                                clicksToEdit: 2
                                                , listeners: {
                                                	'beforeedit': function (editor, e) {
                                                        return false;
                                                    } // end of edit
                                                } // end of listners
                                            }) // end of Ext.create
                                        ] // end of plugins
                                    } // end of gridConfig
                                    , listeners: {
                                        dblclick: {
                                            element: 'body'
                                            , fn: function () {


                                            }
                                        }
                                    }
                                });


                                // 단일탭 그리드 렌더
                                that.createGrid();
                            } // end of success:.function
                        }); // end of bxProxy.all
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
                    sParam.className = "CAPSV050-cmpntCd-wrap";
                    sParam.targetId = "cmpntCd";
//                    sParam.nullYn = "Y";
//                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); 
                    sParam.cdNbr = "11603";
                    // 콤보데이터 load
                    fn_getCodeList(sParam, this);


                    sParam = {};
                    // combobox 정보 셋팅
                    sParam.className = "CAPSV050-menuTrgtScrnYn-wrap";
                    sParam.targetId = "menuTrgtScrnYn";
//                    sParam.nullYn = "Y";
//                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); 
                    sParam.cdNbr = "10000";
                    // 콤보데이터 load
                    fn_getCodeList(sParam, this);


                    // 기본부 초기화
                    that.resetBaseArea(this);

                  //배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPSV050-wrap #btn-base-save')
                                        		,this.$el.find('.CAPSV050-wrap #btn-CAPSV050-grid-save')
                                        		,this.$el.find('.CAPSV050-wrap #btn-base-delete')
                                        			   ]);

                    return this.$el;
                }


//
//
//
                , fn_createTree : function() {
                	var that = this;
                    that.subViews['CAPSV050Tree'] = new bxTree({
                   	   fields: {id: 'scrnId', value: 'scrnNm'},
                       // Tree Item - Checkbox 사용 여부
                          checkAble: false,


                          listeners: {
                              clickItem: function(itemId, itemData, currentTarget, e) {
                           	   if(itemData.cdNm == null) {
                           		   that.inquiryBaseData(itemData);
                           	   }
                              }
                          }
                      });


                     that.$el.find('.bx-tree-root').html(that.subViews['CAPSV050Tree'].render());


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


                    var linkData = {"header" : fn_getHeader("CAPSV0508402") , "CaScrnMgmtSvcGetScreenInformationTreeIn" : sParam};


                    bxProxy.post(sUrl, JSON.stringify(linkData),{
                 	   enableLoading: true,
                        success: function (responseData) {
                     	   if(fn_commonChekResult(responseData)) {
                     		   that.subViews['CAPSV050Tree'].renderItem(responseData.CaScrnMgmtSvcGetScreenInformationTreeOutList.tblNm);
                     		   that.treeList = responseData.CaScrnMgmtSvcGetScreenInformationTreeOutList.tblNm;


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
                		that.subViews['CAPSV050Tree'].selectItem(that.initData.param.scrnId, false);
                		// 상세조회
                		var sParam = {};
                		if(commonInfo.getInstInfo().instCd) {
                    		sParam.instCd = commonInfo.getInstInfo().instCd;
                    	}
                    	else {
                    		sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                    	}
                		sParam.scrnId = that.initData.param.scrnId;
                		that.inquiryBaseData(sParam); // 조회
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
             		   that.subViews['CAPSV050Tree'].renderItem(that.treeList);
             		   return;
             	   }


             	   if(that.treeList.length < 1) {
             		   return;
             	   }


             	   $(that.treeList).each(function(idx, data) {
             		   searchMenuList = that.selectMenu(searchMenuList, data, searchKey);
             	   });


             	   that.subViews['CAPSV050Tree'].renderItem(searchMenuList);
                }


                , selectMenu : function(searchMenuList, obj,  inputValue) {


                		for(var i = 0; i < obj.children.length; i++) {
                			var temp001 = obj.children[i];


                			if(temp001.cdNm == null) {
	 	           				if(temp001.scrnNm.indexOf(inputValue) > -1 || temp001.scrnId.indexOf(inputValue) > -1) {
	 	           					searchMenuList[searchMenuList.length] = temp001;
	 	           				}
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
                , openPage : function() {
                	var that = this;


                    that.$el.trigger({
                        type: 'open-conts-page',
                        pageHandler: 'CAPCM190',
                        pageDPName: bxMsg('cbb_items.SCRN#CAPCM190'),
                        pageInitialize: true,
                        pageRenderInfo: {
                        	trnsfrKnd : "SCRN_NAME" // 화면명
                    		, trnsfrOriginKeyVal : that.$el.find('.CAPSV050-base-table [data-form-param="scrnId"]').val() // 화면식별자
                        }
                    });
                }
                , clickResetBaseArea : function() {
                	this.resetBaseArea(this);
                }
//
//
//
                , resetBaseArea: function (that) {


                    that.$el.find('.CAPSV050-base-table [data-form-param="cmpntCd"] option:eq(0)').attr("selected", "selected");
                    that.$el.find('.CAPSV050-base-table [data-form-param="scrnId"]').val("");
                    that.$el.find('.CAPSV050-base-table [data-form-param="scrnNbr"]').val("");
                    that.$el.find('.CAPSV050-base-table [data-form-param="scrnNm"]').val("");
                    that.$el.find('.CAPSV050-base-table [data-form-param="menuTrgtScrnYn"] option:eq(0)').attr("selected", "selected");
                    
                    
                    that.$el.find('.CAPSV050-base-table [data-form-param="dstbTrgtScrnYn"]').prop("checked", false);
                    that.$el.find('.CAPSV050-base-table [data-form-param="scrnUseYn"]').prop("checked", false);
                    that.$el.find('.CAPSV050-base-table [data-form-param="popupScrnYn"]').prop("checked", false);
                    that.$el.find('.CAPSV050-base-table [data-form-param="scrnUrlAddr"]').val("");


                    that.$el.find('.CAPSV050-base-table [data-form-param="scrnId"]').prop("readonly", false);
                    that.$el.find('.CAPSV050-base-table [data-form-param="scrnNbr"]').prop("readonly", false);
                }


//
//
//
                , inquiryBaseData: function (param) {
                    // header 정보 set
                    var that = this;
                    var sParam = {};


                    sParam.instCd = param.instCd;
                    sParam.scrnId = param.scrnId;


                    var linkData = {"header": fn_getHeader("CAPSV0508403"), "CaScrnMgmtSvcGetScrnInfoListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	var scrnInfo = responseData.CaScrnMgmtSvcGetScreenInformationListOut;
                            	// 기본설정
                            	that.$el.find('.CAPSV050-base-table [data-form-param="cmpntCd"]').val(scrnInfo.cmpntCd);
                                that.$el.find('.CAPSV050-base-table [data-form-param="scrnId"]').val(scrnInfo.scrnId);
                                that.$el.find('.CAPSV050-base-table [data-form-param="scrnNbr"]').val(scrnInfo.scrnNbr);
                                that.$el.find('.CAPSV050-base-table [data-form-param="scrnNm"]').val(scrnInfo.scrnNm);
                                that.$el.find('.CAPSV050-base-table [data-form-param="menuTrgtScrnYn"]').val(scrnInfo.menuTrgtScrnYn);

                                if(scrnInfo.scrnId) {
                                	that.$el.find('.CAPSV050-base-table [data-form-param="scrnId"]').prop("readonly", true);
                                	that.$el.find('.CAPSV050-base-table [data-form-param="scrnNbr"]').prop("readonly", true);
                                }

                                if(scrnInfo.dstbTrgtScrnYn == "Y") {
                                	that.$el.find('.CAPSV050-base-table [data-form-param="dstbTrgtScrnYn"]').prop("checked", true);
                                }
                                else {
                                	that.$el.find('.CAPSV050-base-table [data-form-param="dstbTrgtScrnYn"]').prop("checked", false);
                                }

                                if(scrnInfo.scrnUseYn == "Y") {
                                	that.$el.find('.CAPSV050-base-table [data-form-param="scrnUseYn"]').prop("checked", true);
                                }
                                else {
                                	that.$el.find('.CAPSV050-base-table [data-form-param="scrnUseYn"]').prop("checked", false);
                                }


                                if(scrnInfo.popupScrnYn == "Y") {
                                	that.$el.find('.CAPSV050-base-table [data-form-param="popupScrnYn"]').prop("checked", true);
                                }
                                else {
                                	that.$el.find('.CAPSV050-base-table [data-form-param="popupScrnYn"]').prop("checked", false);
                                }
                                that.$el.find('.CAPSV050-base-table [data-form-param="scrnUrlAddr"]').val(scrnInfo.scrnUrlAddr);


                            	// 화면 제공 서비스 목록 설정
                                if (scrnInfo.tblNm != null || scrnInfo.tblNm.length > 0) {
                                    that.CAPSV050Grid.setData(scrnInfo.tblNm);


                                    // 삭제 로우 초기화
                                    that.deleteList = [];
                                }
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                } // end


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
					sParam.cmpntCd = that.$el.find('.CAPSV050-base-table [data-form-param="cmpntCd"]').val();


					var scrnNbr = that.$el.find('.CAPSV050-base-table [data-form-param="scrnNbr"]').val();
					sParam.scrnNbr = scrnNbr;
					that.$el.find('.CAPSV050-base-table [data-form-param="scrnId"]').val(scrnNbr);
					sParam.scrnId = scrnNbr;


					sParam.scrnNm = that.$el.find('.CAPSV050-base-table [data-form-param="scrnNm"]').val();
					sParam.menuTrgtScrnYn = that.$el.find('.CAPSV050-base-table [data-form-param="menuTrgtScrnYn"]').val();

					if(that.$el.find('.CAPSV050-base-table [data-form-param="dstbTrgtScrnYn"]').is(":checked")) {
						sParam.dstbTrgtScrnYn = "Y";
					}
					else {
						sParam.dstbTrgtScrnYn = "N";
					}

					if(that.$el.find('.CAPSV050-base-table [data-form-param="scrnUseYn"]').is(":checked")) {
						sParam.scrnUseYn = "Y";
					}
					else {
						sParam.scrnUseYn = "N";
					}


					if(that.$el.find('.CAPSV050-base-table [data-form-param="popupScrnYn"]').is(":checked")) {
						sParam.popupScrnYn = "Y";
					}
					else {
						sParam.popupScrnYn = "N";
					}


					sParam.scrnUrlAddr = that.$el.find('.CAPSV050-base-table [data-form-param="scrnUrlAddr"]').val();


					for (var sParamVal in sParam) {
						if (sParam[sParamVal] == '') {
							fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004"));
							return;
						}
					}


					if(commonInfo.getInstInfo().instCd) {
                		sParam.instCd = commonInfo.getInstInfo().instCd;
                	}
                	else {
                		sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                	}


					sParam.srvcList = [];


					if(that.$el.find('.CAPSV050-base-table [data-form-param="scrnId"]').prop("readonly")) {
						// 수정
						sParam.saveStsCd = 'update';
					}
					else {
						// 등록
						sParam.saveStsCd = 'insert';
					}


					var linkData = {"header": fn_getHeader("CAPSV0518501"), "CaScrnMgmtSvcSaveScrnInfoIn": sParam};


					// ajax호출
					bxProxy.post(sUrl, JSON.stringify(linkData), {
						enableLoading: true
						, success: function (responseData) {
							if (fn_commonChekResult(responseData)) {
								fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
								that.inquiryBaseData(sParam);
							}
						}   // end of suucess: fucntion
					}); // end of bxProxy
				}


//
//
//
				, clickDeleteBase : function(event) {
					if(!this.$el.find('.CAPSV050-base-table [data-form-param="scrnId"]').prop("readonly")) {
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


					if(!that.$el.find('.CAPSV050-base-table [data-form-param="scrnId"]').prop("readonly")) {
						return;
					}


					sParam.scrnId = that.$el.find('.CAPSV050-base-table [data-form-param="scrnId"]').val();


					if(fn_isNull(sParam.scrnId)) {
						fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004"));
					}


					var linkData = {"header": fn_getHeader("CAPSV0518301"), "CaScrnMgmtSvcRemoveScrnInfoIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            	// tree 재조회
                            	that.selectTree();


                            	// 전체 초기화
                            	that.resetBaseArea(that);
                            	that.CAPSV050Grid.resetData();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
				}




//
//
//
                , clickSaveGrid : function(event) {
                	if(!this.$el.find('.CAPSV050-base-table [data-form-param="scrnId"]').val()) {
                		return;
                	}

                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                	fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveGrid, this);
                } 


//
//
//
                , saveGrid : function(that) {
                	var srvcList = [];
                	var delSrvcList = [];
                	var sParam = {};
                	sParam.scrnId = that.$el.find('.CAPSV050-base-table [data-form-param="scrnId"]').val();


                	$(that.CAPSV050Grid.getAllData()).each(function(idx, data) {
                		var srvcParam = {};
                		srvcParam.srvcCd = data.srvcCd;
                		srvcList.push(srvcParam);
                	});


                	sParam.srvcList = srvcList;
                	
                	
                	var linkData = {"header": fn_getHeader("CAPSV0518502"), "CaScrnMgmtSvcSaveScrnInfoIn": sParam};


                	// ajax호출
                	bxProxy.post(sUrl, JSON.stringify(linkData), {
                		enableLoading: true
                		, success: function (responseData) {
                			if (fn_commonChekResult(responseData)) {
                				fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                				if(commonInfo.getInstInfo().instCd) {
                            		sParam.instCd = commonInfo.getInstInfo().instCd;
                            	}
                            	else {
                            		sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                            	}
                				that.inquiryBaseData(sParam);
                			}
                		}   // end of suucess: fucntion
                	}); // end of bxProxy


                }


//
//
//
                , createGrid: function () {
                    var that = this;


                    this.$el.find(".CAPSV050-grid").html(this.CAPSV050Grid.render({'height': CaGridHeight}));
                } // end of createGrid


//
//
//
                , addGrid : function() {
                	var that = this;


                	var popupService = new PopupService();
                	popupService.render();


                	popupService.on('popUpSetData', function (data) {
//                		record.set("srvcCd", data.srvcCd); 
//                		record.set("cmpntCd", data.cmpntCd); 
//                		record.set("srvcNm", data.srvcNm); 


                		that.CAPSV050Grid.addData({"srvcCd" : data.srvcCd, "cmpntCd" : data.cmpntCd, "srvcNm" : data.srvcNm});
                    });




                }
//
//
//
                , baseSearchModal : function() {
                	fn_pageLayerCtrl("#CAPSV050-base-table", this.$el.find("#btn-base-search-modal"));
                }


//
//
//
                , gridAreaModal : function() {
                	fn_pageLayerCtrl("#CAPSV050-grid", this.$el.find("#btn-up-grid"));
                }


//
//
//
                , gridExcel : function() {
                	var that = this;
                	that.CAPSV050Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPSV050')+"_"+getCurrentDate("yyyy-mm-dd"));
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


        return CAPSV050View;
    } // end of define function
)
; // end of define
