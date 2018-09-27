define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPSV/011/_CAPSV011.html'
        , 'bx-component/date-picker/_date-picker'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx-component/bx-tree/bx-tree'
        , 'app/views/page/popup/CAPSV/popup-attribute-search'
        , 'app/views/page/popup/CAPCM/popup-class-search'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , DatePicker
        , ExtGrid
        , bxTree
        , PopupAttributeSearch
        , PopupClassSearch
        , commonInfo
        ) {

        /**
         * Backbone
         */
        var CAPSV011View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPSV011-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
						  'click #btn-search-toggle': 'toggleSearch'
						, 'click #btn-grid-toggle': 'toggleGrid'
						, 'click #btn-search-reset' : 'resetSearch'
						,'click #btn-xtn-search': 'inquire'
						,'click #btn-grid-save' : 'clickSaveGrid'
                }
                , initialize: function (initData) {
                    var that = this;

                    var deleteList = [];


                    $.extend(that, initData);
                    that.$el.html(that.tpl());


                    that.initData = initData;


                    that.CAPSV011Grid = new ExtGrid({
                     	// 그리드 컬럼 정의
                     	fields: ['rowIndex', 'classNm', 'beanNm', 'parntClassNm', 'pckgNm', 'classTpCd']
                     , id: 'CAPSV011Grid'
                 	, columns: [
             	            {
	         	            	text: 'No.'
	         	            		, dataIndex: 'rowIndex'
	         	            			, sortable: false
	         	            			, height : 25
	         	            			, flex : 1
	         	            			, style: 'text-align:center'
	         	            				, align: 'center'
	         	            					// other config you need....
	         	            					, renderer: function (value, metaData, record, rowIndex) {
	         	            						return rowIndex + 1;
	         	            					}
             	            }
             	            , {
             	            	text: bxMsg('cbb_items.AT#classNm')
             	            	, flex: 3
             	            	, dataIndex: 'classNm'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	}
             	            , {
             	            	text: bxMsg('cbb_items.AT#beanNm')
             	            	, flex: 3
             	            	, dataIndex: 'beanNm'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	}
             	            , {
             	            	text: bxMsg('cbb_items.AT#parntClassNm')
             	            	, flex: 3
             	            	, dataIndex: 'parntClassNm'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	}
             	            , {
             	            	text: bxMsg('cbb_items.AT#pckgNm')
             	            	, flex: 6
             	            	, dataIndex: 'pckgNm'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	}
             	            , {
             	            	text: bxMsg('cbb_items.AT#classTpCd')
             	            	, flex: 4
             	            	, dataIndex: 'classTpCd'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	}
             	            , {
       	                 	 xtype: 'actioncolumn', flex: 1, align: 'center',text: bxMsg('cbb_items.SCRNITM#del')
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

                    , listeners: {
                     	click:{
                     		element: 'body'
                     		, fn: function () {
//                                that.selectGridRecord();
                 			}
                     	} 
                     }
                    });//end of ExtGrid
                } //END OF initialize
                
                /**
                 * render
                 */
                ,render : function (){
                	
                    this.$el.html(this.tpl());
                    this.$el.find(".CAPSV011-grid").html(this.CAPSV011Grid.render({'height': CaGridHeight}));
                	
                    this.setComboBoxes();
                    
                  //배포처리반영[버튼비활성화]
                    this.resetDistributionBtn();
                    return this.$el;
                	
                } //end of render
                
                , resetDistributionBtn : function(){
                	//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPSV011-wrap #btn-grid-save')
                                        			   ]);
                }
                
                ,setComboBoxes: function () {
                    var sParam = {};
                    
                    sParam = {};
                    sParam.className = "CAPSV011-classTpCd-wrap";
                    sParam.targetId = "classTpCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                    sParam.cdNbr = "A1141";
                    fn_getCodeList(sParam, this);   // 서비스컴포넌트코드
                    
                }
               ,fn_createTree : function (){
            	   var that = this;
            	   that.subViews['CAPSV011Tree'] = new bxTree({
            		   fields : {id : 'nodeId', value : 'nodeNm'}
            	   
            	   	  ,listeners :{
            	   		  clickItem : function(itemId, itemData, currentTarget, e){
            	   			  console.log(itemData.cdNm);
            	   			that.inquire(itemData);
            	   		  }
            	   	  } 
            	   
            	   });
            	
            	   that.$el.find('.bx-tree-root').html(that.subViews['CAPSV011Tree'].render());
               }              
                
               
               //조회
               ,inquire: function (){
            	   var that = this;
                   var sParam = {};
                   that.deleteList = [];

                   sParam.classLayerTpCd = that.$el.find("#CAPSV011-search [data-form-param='classTpCd']").val();
                   sParam.classNm = that.$el.find("#CAPSV011-search [data-form-param='classNm']").val();

                   if(sParam.classLayerTpCd==="" && sParam.classNm===""){
                	   fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0031"));
                       return;
                   }

                   var linkData = {"header": fn_getHeader("CAPCM0208404"), "CaClassMgmtSvcGetClassInfoListIn": sParam};


                   //ajax 호출
                   bxProxy.post(sUrl, JSON.stringify(linkData), {
                       success: function (responseData) {
                           if (fn_commonChekResult(responseData)) {
                               var classList = responseData.CaClassMgmtSvcGetClassInfoListOut.classList;
                               var totCnt = classList.length;

                               
                               
                               if (classList != null || classList.length > 0) {
                            	   
                            	   $(classList).each(function (idx, data) {
                            		   var classLayerTpCd="";
                            		  $(data.classLayerTpCdList).each(function (idx,tpCd){
                            			 classLayerTpCd = idx==0?tpCd:classLayerTpCd+", "+tpCd;
                            		  });
                            		   data.classTpCd=classLayerTpCd;
                            	   });
                            	   
                            	   that.CAPSV011Grid.setData(classList); 
                                   that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                               } else {
                                   that.CAPSV011Grid.resetData();
                               }
                           }


                       }   // end of suucess: fucntion
                   });
               
               }
               
               
               ,clickSaveGrid : function (event){
            		//배포처리[과제식별자 체크]
                   if (!fn_headerTaskIdCheck()){
                       return;
                   }
            	   if(!this.deleteList.length){
               		return;
               	}
               	fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveGrid, this);
               }
               
               ,saveGrid : function(that){
            		var sParam = {};				
                	var instCd = "";					
                	if(commonInfo.getInstInfo().instCd) {
                		instCd = commonInfo.getInstInfo().instCd;
                	} else {
                		instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                	}

					var list = [];
					$(that.deleteList).each(function (key, value){
						var item = {};
						item.classNm = value.classNm;
						list.push(item);
					});
					sParam.classNmList = list;

					console.log("deleteSave");
					console.log(sParam);
					var linkData = {"header": fn_getHeader("CAPSV0118301"), "CaClassMgmtSvcRemoveClassInfoListIn": sParam};


					// ajax호출
					bxProxy.post(sUrl, JSON.stringify(linkData), {		
						enableLoading: true
						, success: function (responseData) {
							if (fn_commonChekResult(responseData)) {		
								fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
								that.inquire();
							}
						}   // end of suucess: fucntion
					}); // end of bxProxy
            	   
            	   
               }
               
                //검색조건 부분 초기화
               , resetSearch: function () {
            	   console.log("reset");
                   this.$el.find('.CAPSV011-base-table [data-form-param="classTpCd"]').val("");
                   this.$el.find('.CAPSV011-base-table [data-form-param="classNm"]').val("");
               }
  
                
               , toggleSearch : function() {
               	fn_pageLayerCtrl("#CAPSV011-search");
               }


               , toggleGrid : function() {
               	fn_pageLayerCtrl("#CAPSV011-grid");
               }
                
                
                
            }); // end of Backbone.View.extend({


        return CAPSV011View;
    } // end of define function
)
; // end of define
