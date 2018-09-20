define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPCM/171/_CAPCM171.html'
        , 'bx-component/date-picker/_date-picker'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx-component/bx-tree/bx-tree'
        , 'bx-component/ext-grid/_ext-tree-grid'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , DatePicker
        , ExtGrid
        , bxTree
        , ExtTreeGrid
        , commonInfo
        ) {


        /**
         * Backbone
         */
        var CAPCM171View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPCM171-page'
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


            		, 'click #btn-CAPCM171-grid-excel': 'gridExcel'
            		, 'click #btn-CAPCM171-grid-save': 'clickSaveGrid'
    				, 'click #btn-CAPCM171-grid-add': 'addGrid'
					, 'click #btn-CAPCM171-grid-up': 'upNode'
					, 'click #btn-CAPCM171-grid-down': 'downNode'
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


                    // 분류 트리 생성
                    that.fn_createClTreeList();
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
                    sParam.className = "CAPCM171-clTrgtTpCd-wrap";
                    sParam.targetId = "clTrgtTpCd";
                    sParam.cdNbr = "A0080";
                    // 콤보데이터 load
                    fn_getCodeList(sParam, this);

                  //배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPCM171-wrap #btn-base-save')
                                        		,this.$el.find('.CAPCM171-wrap #btn-base-delete')
                                        		,this.$el.find('.CAPCM171-wrap #btn-CAPCM171-grid-save')
                                        			   ]);

                    return this.$el;
                }


//
//
//
            	, fn_createTree : function() {
                	var that = this;
                    that.subViews['CAPCM171Tree'] = new bxTree({
                   	   fields: {id: 'clHrarcyId', value: 'clHrarcyNm'},
                       // Tree Item - Checkbox 사용 여부
                          checkAble: false,


                          listeners: {
                              clickItem: function(itemId, itemData, currentTarget, e) {
                           	   if(itemData.clHrarcyId) {
                           		   that.inquiryBaseData(itemData); // 기본정보조회
                           		   that.inquiryTreeGridData(itemData); // 분류 트리 조회
                           	   }
                              }
                          }
                      });


                     that.$el.find('.bx-tree-root').html(that.subViews['CAPCM171Tree'].render());


                     that.selectTree();
                }


//
//
//
                , selectTree : function() {
                	var that = this;
                	that.treeList = [];


                    var sParam = {};


                    var linkData = {"header" : fn_getHeader("CAPCM1718400") , "CaClTreeMgmtSvcSysIn" : sParam};


                    bxProxy.post(sUrl, JSON.stringify(linkData),{
                 	   enableLoading: true,
                        success: function (responseData) {
                     	   if(fn_commonChekResult(responseData)) {
                     		   var children = responseData.CaClTreeMgmtSvcSysTreeOut.children;
                     		   that.subViews['CAPCM171Tree'].renderItem(children);
                     		   that.treeList = children;


                     		  if(that.initData.param) {
                     			  if(that.initData.param.scrnNm) {
                     				  that.initTreeList();
                     			  }
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


             	   var searchMenuList = [];


             	   if(!searchKey) {
             		   that.subViews['CAPCM171Tree'].renderItem(that.treeList);
             		   return;
             	   }


             	   if(that.treeList.length < 1) {
             		   return;
             	   }


             	   $(that.treeList).each(function(idx, data) {
             		   searchMenuList = that.selectMenu(searchMenuList, data, searchKey);
             	   });


             	   that.subViews['CAPCM171Tree'].renderItem(searchMenuList);
                }


                , selectMenu : function(searchMenuList, obj,  inputValue) {


                		for(var i = 0; i < obj.children.length; i++) {
                			var temp001 = obj.children[i];
                			if(temp001.clHrarcyNm.indexOf(inputValue) > -1 || temp001.clHrarcyId.indexOf(inputValue) > -1) {
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


                , clickResetBaseArea : function() {
                	this.setBaseArea("R", this, null);
                }
//
//
//
                , setBaseArea: function (type, that, data) {
                	if(type == "R") {
                		that.$el.find('.CAPCM171-base-table [data-form-param="clHrarcyId"]').val("");
                		that.$el.find('.CAPCM171-base-table [data-form-param="clHrarcyNm"]').val("");
                		that.$el.find('.CAPCM171-base-table [data-form-param="clHrarcyEngNm"]').val("");
                		that.$el.find('.CAPCM171-base-table [data-form-param="clTrgtTpCd"] option:eq(0)').attr("selected", "selected");


                		that.$el.find('.CAPCM171-base-table [data-form-param="clHrarcyId"]').prop("disabled", false);
                	}
                	else {
                		that.$el.find('.CAPCM171-base-table [data-form-param="clHrarcyId"]').val(data.clHrarcyId);
                		that.$el.find('.CAPCM171-base-table [data-form-param="clHrarcyNm"]').val(data.clHrarcyNm);
                		that.$el.find('.CAPCM171-base-table [data-form-param="clHrarcyEngNm"]').val(data.clHrarcyEngNm);
                		that.$el.find('.CAPCM171-base-table [data-form-param="clTrgtTpCd"]').val(data.clTrgtTpCd);


                		that.$el.find('.CAPCM171-base-table [data-form-param="clHrarcyId"]').prop("disabled", true);
                	}
                }


//
//
//
                , inquiryBaseData: function (param) {
                    // header 정보 set
                    var that = this;
                    var sParam = {};


                    sParam.clHrarcyId = param.clHrarcyId;


                    var linkData = {"header": fn_getHeader("CAPCM1718401"), "CaClTreeMgmtSvcSysIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
//                        enableLoading: true,
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	var data = responseData.CaClTreeMgmtSvcSysOut;
                            	that.setBaseArea("S", that, data);


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
					sParam.clHrarcyId = that.$el.find('.CAPCM171-base-table [data-form-param="clHrarcyId"]').val();
					sParam.clHrarcyNm = that.$el.find('.CAPCM171-base-table [data-form-param="clHrarcyNm"]').val();
					sParam.clHrarcyEngNm = that.$el.find('.CAPCM171-base-table [data-form-param="clHrarcyEngNm"]').val();
					sParam.clTrgtTpCd = that.$el.find('.CAPCM171-base-table [data-form-param="clTrgtTpCd"]').val();


					var linkData = {"header": fn_getHeader("CAPCM1718101"), "CaClTreeMgmtSvcSysIn": sParam};


					// ajax호출
					bxProxy.post(sUrl, JSON.stringify(linkData), {
						enableLoading: true
						, success: function (responseData) {
							if (fn_commonChekResult(responseData)) {
								fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
								// 기본부 초기화
								that.setBaseArea("R", that, null);


								// 그리드 초기화


								// 상세 초기화


								// 트리 재조회
								that.selectTree();
							}
						}   // end of suucess: fucntion
					}); // end of bxProxy
				}


//
//
//
				, clickDeleteBase : function(event) {
					if(!this.$el.find('.CAPCM171-base-table [data-form-param="clHrarcyId"]').prop("disabled")) {
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
					sParam.clHrarcyId = that.$el.find('.CAPCM171-base-table [data-form-param="clHrarcyId"]').val();


					var linkData = {"header": fn_getHeader("CAPCM1718301"), "CaClTreeMgmtSvcSysIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            	// 기본부 초기화
								that.setBaseArea("R", that, null);


								// 그리드 초기화


								// 트리 재조회
								that.selectTree();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
				}




//
//
//
				, fn_createClTreeList : function() {
					var that = this;


	                that.PCM171ClTreeGrid = new ExtTreeGrid({
	                    fields: ['clId', 'clNm', 'clEngNm', 'mostLowrLvlYn', 'clHrarcyId', 'children']
	                    , expanded: true
	                    , id: 'PCM171ClTreeGrid'
	                    , columns: [
	                        {
	                            xtype: 'treecolumn' 
	                            , text: bxMsg('cbb_items.AT#clId')
	                            , style: 'text-align:center'
                                , dataIndex: 'clId'
                                , editor: 'textfield'
                                , style: 'text-align:center'
                                , getClass: function () {}
                            	, width : 250
                                , height: 25
	                        },
	                        {text: bxMsg('cbb_items.AT#clNm'), flex: 1, dataIndex: 'clNm', style: 'text-align:center', align: 'center', editor: 'textfield'},
	                        {text: bxMsg('cbb_items.AT#clEngNm'), flex: 1, dataIndex: 'clEngNm', style: 'text-align:center', align: 'center', editor: 'textfield'},
	                        {text: bxMsg('cbb_items.AT#clHrarcyId'), dataIndex: 'clHrarcyId', hidden : true},
	                        {text: bxMsg('cbb_items.AT#mostLowrLvlYn'), flex: 1, dataIndex: 'mostLowrLvlYn', style: 'text-align:center', align: 'center'
	                        	, renderer: function (val) {
                                	var classNm = "s-no";


                                	if(val =="Y") {
                            			classNm = "s-yes";
                            		}
                            		return "<span class=\"bw-sign "+classNm+"\">"+val+"</span>";


                                } // end of render
	                        },
	                        {xtype: 'actioncolumn', width: 100, align: 'center',text: bxMsg('cbb_items.SCRNITM#edit'), style: 'text-align:center'
                             	, items: [
                             	          		{
                             	          			iconCls : "bw-icon i-25 i-func-add"
                         	          				, handler: function (grid, rowIndex, colIndex, item, e, record) {
//                         	          					if (record.data.mostLowrLvlYn != 'Y') {
//                                                            record.appendChild({
//                                                            	clId: '',
//                                                            	clNm: '',
//                                                            	clEngNm: '',
//                                                            	clHrarcyId: '',
//                                                                mostLowrLvlYn: 'N',
//                                                                children: null
//                                                            });
//                                                            record.data.leaf = false;
//                                                            record.commit();
//                                                            record.expand();
//                                                        }
                         	          					record.set("mostLowrLvlYn", "N");


                         	          					record.appendChild({
                                                        	clId: '',
                                                        	clNm: '',
                                                        	clEngNm: '',
                                                        	clHrarcyId: '',
                                                            mostLowrLvlYn: 'N',
                                                            children: null
                                                        });
                                                        record.data.leaf = false;
                                                        record.commit();
                                                        record.expand();
                         	          				}
                             	          		}
                             	          		, {
                             	          			iconCls : "bw-icon i-25 i-func-trash"
                         	          				, handler: function (grid, rowIndex, colIndex, item, e, record) {
                         	          					if (record.childNodes.length !== 0) {
                         	          						fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0029'));
                                                            return;
                                                        } else if (record.childNodes.length == 0) {
                                                            record.remove();
                                                        }
                         	          				}
                             	          		}
                             	        ]
                             }
	                    ] // end of columns


	                    , plugins: [
	                        Ext.create('Ext.grid.plugin.CellEditing', {
	                            pluginId: 'treeGridCellEdit',
	                            clicksToEdit: 2
	                        })
	                    ]
	                    // 클릭 이벤트 정의
	                    , listeners: {
	                        cellclick: function (view, cell, cellIndex, record, row, rowIndex, e) {


	                        },
	                        drop: function () {
	                            ;
	                        }
	                    } // end of listerners,
	                    , viewConfig: {
	                        toggleOnDblClick: false,
	                        plugins: {
	                            ptype: 'treeviewdragdrop',
	                            containerScroll: true
	                        }
	                    }
	                    , 'afteredit': function (editor, e) {


	                    }  // end of after edit
	                });


	                that.$el.find(".CAPCM171-grid").html(that.PCM171ClTreeGrid.render({'height': CaGridHeight}));
				}


//
//
//
                , inquiryTreeGridData : function(param) {
                	// header 정보 set
                    var that = this;
                    var sParam = {};


                    sParam.clHrarcyId = param.clHrarcyId;


                    var linkData = {"header": fn_getHeader("CAPCM1708401"), "CaClTreeMgmtSvcIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true,
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	var tbList = responseData.CaClTreeMgmtSvcOut.children;
                                that.PCM171ClTreeGrid.setStoreRootNode(tbList);
//                                that.PCM171ClTreeGrid.expandAll();


                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                } // end


//
//
//
                , clickSaveGrid : function(event) {
                	if(!this.$el.find('.CAPCM171-base-table [data-form-param="clHrarcyId"]').val()) {
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
                	var sParam = {};
                	sParam.clHrarcyId = that.$el.find('.CAPCM171-base-table [data-form-param="clHrarcyId"]').val();
                	sParam.clList = that.PCM171ClTreeGrid.getAllData();




                	var linkData = {"header": fn_getHeader("CAPCM1708101"), "CaClTreeMgmtSvcIn": sParam};
                	// ajax호출
                	bxProxy.post(sUrl, JSON.stringify(linkData), {
                		enableLoading: true
                		, success: function (responseData) {
                			if (fn_commonChekResult(responseData)) {
                				fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                				that.inquiryTreeGridData(sParam); // 분류 트리 조회
                			}
                		}   // end of suucess: fucntion
                	}); // end of bxProxy


                }


//
//
//
                , addGrid : function() {
                	this.PCM171ClTreeGrid.addField({children: null, clId: '', clNm: '', clEngNm: ''
                		, clHrarcyId: this.$el.find('.CAPCM171-base-table [data-form-param="clHrarcyId"]').val()
                		, mostLowrLvlYn: 'N'});
                }
//
//
//
                , baseSearchModal : function() {
                	fn_pageLayerCtrl("#CAPCM171-base-table", this.$el.find("#btn-base-search-modal"));
                }
//
//
//
                , gridAreaModal : function() {
                	fn_pageLayerCtrl("#CAPCM171-grid", this.$el.find("#btn-up-grid"));
                }


//
//
//
                , gridExcel : function() {
                	var that = this;
                	that.PCM171ClTreeGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM171')+"_"+getCurrentDate("yyyy-mm-dd"));
                }


                , upNode: function () {
                    this.PCM171ClTreeGrid.upField();
                }


                , downNode: function () {
                    this.PCM171ClTreeGrid.downField();
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


        return CAPCM171View;
    } // end of define function
)
; // end of define
