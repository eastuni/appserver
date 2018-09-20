define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPDC/002/_CAPDC002.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx-component/bx-tree/bx-tree'
        , 'bx/common/common-info'
        , 'app/views/page/popup/CAPDC/popup-docId'
    ]
    , function (config
        , tpl
        , ExtGrid
        , bxTree
        , commonInfo
        , popupDocId
        ) {


        /**
         * Backbone
         */
        var CAPDC002View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPDC002-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                	'click #btn-tree-search' : 'loadTreeList'
            		, 'keydown #searchKey' : 'keyDownSearchKey'
            		, 'change #docId' : 'changeDocId'


                    , 'click #btn-grid-save': 'clickSaveGrid'
                    , 'click #btn-grid-add': 'clickAddGrid'
                	, 'click #btn-grid-modal': 'baseGridModal'


                	, 'click #btn-tree-hide': 'hideTree'
					, 'click #btn-tree-show': 'showTree'
                }
                /**
                 * 초기화 
                 */
                , initialize: function (initData) {
                    var that = this;


                	that.comboStore1 = {}; // 서비스컴포넌트코드
                	that.comboStore2 = {}; // 문서상태코드
                	that.comboStore3 = {}; // 문서유형코드 
                	that.comboStore4 = {}; // 문서작성유형코드 


                    that.deleteList = []; // 화면 삭제 정보 


                    $.extend(that, initData);
                    that.$el.html(that.tpl());


                    that.initData = initData;


                    if(commonInfo.getInstInfo().instCd) {
                		that.instCd = commonInfo.getInstInfo().instCd;
                	}
                	else {
                		that.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                	}


                    // 왼쪽 트리 생성
                    that.fn_createTree();
                }
                /**
                 * render
                 */
                , render: function () {
                    var that = this;


                    var sParam = {};
                    sParam.cdNbr = "11603"; // 서비스콤포넌트코드 
                    var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    sParam = {};
                    sParam.cdNbr = "A0048"; // 문서상태코드 
                    var linkData2 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    sParam = {};
                    sParam.cdNbr = "A0047"; // 문서유형코드 
                    var linkData3 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    sParam = {};
                    sParam.cdNbr = "A0488"; // 문서작성유형코드 
                    var linkData4 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    bxProxy.all([
                                 // 서비스컴포넌트콤보로딩
                                 {url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {
                                     if (fn_commonChekResult(responseData)) {
                                         comboStore1 = new Ext.data.Store({
                                             fields: ['cd', 'cdNm'],
                                             data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                         });                                         
                                     }
                                 }}
                                 // 문서상태코드
                                ,{url: sUrl, param: JSON.stringify(linkData2), success: function (responseData) {
                                     if (fn_commonChekResult(responseData)) {
                                         comboStore2 = new Ext.data.Store({
                                             fields: ['cd', 'cdNm'],
                                             data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                         });                                         
                                     }
                                 }}
                                 // 문서유형코드
                                ,{url: sUrl, param: JSON.stringify(linkData3), success: function (responseData) {
                                     if (fn_commonChekResult(responseData)) {
                                         comboStore3 = new Ext.data.Store({
                                             fields: ['cd', 'cdNm'],
                                             data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                         });                                         
                                     }
                                 }}
                                // 문서작성유형코드
                                ,{url: sUrl, param: JSON.stringify(linkData4), success: function (responseData) {
                                     if (fn_commonChekResult(responseData)) {
                                         comboStore4 = new Ext.data.Store({
                                             fields: ['cd', 'cdNm'],
                                             data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                         });                                         
                                     }
                                 }}                                
                              ]
                              , {
                                  success: function () {   


                                	/* ------------------------------------------------------------ */
				                    that.CAPDC002Grid = new ExtGrid({
				                        /* ------------------------------------------------------------ */
				                        // 단일탭 그리드 컬럼 정의
				                        fields: ['rowIndex', 'cmpntCd', 'docId', 'docNm', 'loinLngDocNm', 'docStsCd', 'docTpCd', 'docMkngTpCd', 'delBtn']
				                        , id: 'CAPDC002Grid'
				                        , columns: [
											{
											    text: 'No.'
											    , dataIndex: 'rowIndex'
											    , sortable: false
											    , width : 80
											    , height : 25
											    , style: 'text-align:center'
											    , align: 'center'
											    , renderer: function (value, metaData, record, rowIndex) {
											    	record.data.rowIndex = rowIndex + 1;
											        return record.data.rowIndex;
											    }
											}
				                            , {text: bxMsg('cbb_items.SCRNITM#cmpnt'), flex: 1, dataIndex: 'cmpntCd', style: 'text-align:center', align: 'left',
		                                       renderer: function(val) {
		                                    	   index = comboStore1.findExact('cd', val);
	                                               if(index != -1) {
	                                            	   rs = comboStore1.getAt(index).data;
	                                                   return rs.cdNm;
	                                               }
	                                           } // end of render	
				                            }
				                            , {text: bxMsg('cbb_items.AT#docId'),flex: 2, dataIndex: 'docId', style: 'text-align:center', align: 'left'}
				                            , {text: bxMsg('cbb_items.AT#docNm'),flex: 2, dataIndex: 'docNm', style: 'text-align:center', align: 'left'}
				                            , {text: bxMsg('cbb_items.AT#loinLngDocNm'),flex: 2, dataIndex: 'loinLngDocNm', style: 'text-align:center', align: 'left'}
				                            , {text: bxMsg('cbb_items.SCRNITM#docSts'), flex: 1,dataIndex: 'docStsCd', style: 'text-align:center', align: 'center',
			                                   renderer: function(val) {
			                                	   index = comboStore2.findExact('cd', val);
		                                           if(index != -1) {
		                                        	   rs = comboStore2.getAt(index).data;
		                                               return rs.cdNm;
		                                           }
		                                       } // end of render				                            	
					                          }
				                            , {text: bxMsg('cbb_items.SCRNITM#docTpCd'), flex: 1,dataIndex: 'docTpCd', style: 'text-align:center', align: 'center',
			                                   renderer: function(val) {
			                                	   index = comboStore3.findExact('cd', val);
		                                           if(index != -1) {
		                                        	   rs = comboStore3.getAt(index).data;
		                                               return rs.cdNm;
		                                           }
		                                       } // end of render				                            	
					                          }
				                            , {text: bxMsg('cbb_items.SCRNITM#docMkngTp'), flex: 1,dataIndex: 'docMkngTpCd', style: 'text-align:center', align: 'center',
				                                   renderer: function(val) {
				                                	   index = comboStore4.findExact('cd', val);
			                                           if(index != -1) {
			                                        	   rs = comboStore4.getAt(index).data;
			                                               return rs.cdNm;
			                                           }
			                                       } // end of render				                            	
						                     }				                            
				                            , {text: bxMsg('cbb_items.SCRNITM#del'),width: 80, style: 'text-align:center', align: 'center',
				                                   renderer: function(value, metaData, record, row, col, store, gridView, e){


				                                	   var delBtnCreateHtml = '<button type="button" onClick="this.blur()" class="bw-btn">' + 
				                                	   						'<i class="bw-icon i-25 i-func-trash"></i></button>';


				                                	   return delBtnCreateHtml;


				                                   } // end of render				                            	
						                     }
				                        ] // end of columns
				                        , listeners: {
				                        	cellClick: function (view, cell, cellIndex, record, row, rowIndex, e) {
				                        		if(cellIndex == 8) {
				                        			that.deleteList.push(record.data);
				                        			that.CAPDC002Grid.store.remove(record);				                        							                        			
				                        		}
				                            }  
				                        }
				                    });


				                    // 단일탭 그리드 렌더
				                    that.createGrid();  
                                  } // end of success:.function
                    }); // end of bxProxy.all	


                  //배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPDC002-wrap #btn-grid-save')
                                        			   ]);

                    return this.$el;
                }
                /**
                 * Tree 생성 
                 */
                , fn_createTree : function() {
                	var that = this;
                    that.subViews['CAPDC002Tree'] = new bxTree({
                   	   fields: {id: 'rltdId', value: 'rltdNm'},
                   	   	  // Tree Item - Checkbox 사용 여부
                          checkAble: false,


                          listeners: {
                              clickItem: function(itemId, itemData, currentTarget, e) {
                           	      if(itemData.clHrarcyId) {


                                      // 선택정보 set 
              	                      that.clHrarcyId = itemData.clHrarcyId;
              	                      that.clId = itemData.rltdId;


                           		      that.inquiryGridData(itemData);
                           	      }
                           	      else {
                           	    	that.clHrarcyId = null;
                           	    	that.clId = null;
                           	    	that.CAPDC002Grid.resetData();
                           	    	that.$el.find("#btn-grid-save").prop("disabled", true);
                           	    	that.$el.find("#btn-grid-add").prop("disabled", true);
                           	      }
                              }
                          }
                      });


                     that.$el.find('.bx-tree-root').html(that.subViews['CAPDC002Tree'].render());
                     that.selectTree();
                }
                /**
                 * tree 목록 조회    
                 */
                , selectTree : function(searchKey) {
                	var that = this;
                	that.treeList = [];


                    var linkData = {"header" : fn_getHeader("CAPDC0048402") , "DummyIO" : {}};


                    bxProxy.post(sUrl, JSON.stringify(linkData),{
                 	   enableLoading: true,
                        success: function (responseData) {
                     	   if(fn_commonChekResult(responseData)) {
                     		   that.subViews['CAPDC002Tree'].renderItem(responseData.CaDocSrchSvcGetDocClTreeListOut.docClTree);
                     		   that.treeList = responseData.CaDocSrchSvcGetDocClTreeListOut.docClTree;


                     		   if(searchKey) {
                     			  that.$el.find('[data-form-param="searchKey"]').val(searchKey);
                     			  that.loadTreeList();
                     		   }
                     		   else {
                     			   that.subViews['CAPDC002Tree'].expandAll();
                     		   }
                     	   }
                        }
                    });
                }
                /**
                 * 트리 조회버튼 클릭 
                 */
                , loadTreeList : function() {
             	   var that = this;


             	   var searchKey = that.$el.find('[data-form-param="searchKey"]').val();


             	   var searchDocList = [];


             	   if(!searchKey) {
             		   that.subViews['CAPDC002Tree'].renderItem(that.treeList);
             		   that.subViews['CAPDC002Tree'].expandAll();
             		   return;
             	   }


             	   if(that.treeList.length < 1) {
             		   return;
             	   }


             	   $(that.treeList).each(function(idx, data) {
             		   searchDocList = that.selectDoc(searchDocList, data, searchKey);
             	   });


             	   that.subViews['CAPDC002Tree'].renderItem(searchDocList); 
                }  
                /**
                 * 트리에서 문서명으로 검색 
                 */
                , selectDoc : function(searchDocList, obj,  searchKey) {
                		var that = this;


                		for(var i = 0; i < obj.children.length; i++) {
                			var childData = obj.children[i];


                			if(childData.clHrarcyId) {
	 	           				if(childData.rltdId.indexOf(searchKey) > -1 || childData.rltdNm.indexOf(searchKey) > -1) {
	 	           					var addData = {};
	 	           					addData.clHrarcyId = childData.clHrarcyId;
	 	           					addData.rltdId = childData.rltdId;
	 	           					addData.rltdNm = childData.rltdNm;
 	           						searchDocList.push(addData);
	 	           				}


	 	           				searchDocList = that.selectDoc(searchDocList, childData, searchKey);
	 	           			}
                		}


                	return searchDocList;
                }
                /**
                 * 문서Tree검색정보 입력 시 실행 
                 */
                , keyDownSearchKey : function(event) {
          	      	var event = event || window.event;
          	      	var keyID = (event.which) ? event.which : event.keyCode;
          	      	if(keyID == 13) { //enter
          	      		this.loadTreeList();
          	      	}
                }
                /**
                 * 문서분류정보조회 
                 */
                , inquiryGridData: function () {
                    // header 정보 set
                    var that = this;


                    // 이전 정보 clear 
                    that.CAPDC002Grid.resetData();
                    // 삭제 로우 초기화
                    that.deleteList = [];


                    that.$el.find("#btn-grid-save").prop("disabled", false);
                    that.$el.find("#btn-grid-add").prop("disabled", false);


                    var sParam = {};
                    sParam.instCd = that.instCd;
                    sParam.clHrarcyId = that.clHrarcyId;
                    sParam.clId = that.clId;


                    var linkData = {"header": fn_getHeader("CAPDC0048401"), "CaDocSrchSvcGetDocClListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	var tbList = responseData.CaDocSrchSvcGetDocClListOut.docClList;


                            	if (tbList != null || tbList.length > 0) {
                            		that.CAPDC002Grid.setData(tbList);
                            	}
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                } // end
                /**
                 * 그리드 저장 버튼 클릭
                 */
				, clickSaveGrid : function(event) {
					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }
					fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveGrid, this);
				}
				/**
				 * 그리드정보 저장
				 */
				, saveGrid : function(that) {
					var sParam = {};
					sParam.instCd = that.instCd;
					sParam.clHrarcyId = that.clHrarcyId;
					sParam.clId = that.clId;
					sParam.rgstList = new Array();
					sParam.delList = new Array();


					var docGridData = that.CAPDC002Grid.getAllData();


	                $(docGridData).each(function (idx, data) {
	                	var docClInfo = {};
	                	docClInfo.docId = data.docId;
	                	sParam.rgstList.push(docClInfo);
	                });


	                $(that.deleteList).each(function (idx, data) {
	                	var docClInfo = {};
	                	docClInfo.docId = data.docId;
	                	sParam.delList.push(docClInfo);
	                });


					var linkData = {"header": fn_getHeader("CAPDC0048101"), "CaDocRgstSvcRgstClListIn": sParam};


					// ajax호출
					bxProxy.post(sUrl, JSON.stringify(linkData), {
						enableLoading: true
						, success: function (responseData) {
							if (fn_commonChekResult(responseData)) {
								fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


								that.inquiryGridData();
							}
						}   // end of suucess: fucntion
					}); // end of bxProxy
				}			
                /**
                 * 그리드 생성
                 */
                , createGrid: function () {
                    var that = this;


                    this.$el.find(".CAPDC002-grid").html(this.CAPDC002Grid.render({'height': CaGridHeight}));
                } // end of createGrid
                /**
                 * 목록영역 toggle 
                 */
                , baseGridModal : function() {
                	fn_pageLayerCtrl("#CAPDC002-grid-area");
                }
                /**
                 * 그리드 내용 엑셀 다운로드
                 */
                , gridExcel : function() {
                	var that = this;
                	that.CAPDC002Grid.exportCsvFile(bxMsg('cbb_items.SCRNITM#CAPDC002-DOC-CLASSIFICATION-HIST')+"_"+getCurrentDate("yyyy-mm-dd"));
                }
                /**
                 * 트리 열기 
                 */
                , showTree: function () {
                    var that = this;
                    that.$el.find('.col1').show();
                    that.$el.find('.col2').css('left', '260px');
                    that.$el.find('#btn-tree-show').hide();
                }
                /**
                 * 트리 접기 
                 */
                , hideTree: function () {
                    var that = this;
                    that.$el.find('.col1').hide();
                    that.$el.find('.col2').css('left', '30px');
                    that.$el.find('#btn-tree-show').show();
                } 
                /**
                 * +버튼 클릭 시 문서검색 popup 
                 */
                , clickAddGrid : function() {


	                var that = this;


	                var popupDocIdObj = new popupDocId({});
	                popupDocIdObj.render();


	                popupDocIdObj.on('popUpSetData', function(param) {
	                	var isAddFlag = false;
						var docGridData = that.CAPDC002Grid.getAllData();


		                $(docGridData).each(function (idx, data) {


		                	if(param.docId == data.docId) {
		                		isAddFlag = true;
		                		return false;
		                	}
		                });


		                if(!isAddFlag) {
		                	that.CAPDC002Grid.addData(param);
		                }
                    });	                
	            }                
            })
            ; // end of Backbone.View.extend({


        return CAPDC002View;
    } // end of define function
)
; // end of define
