define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPSV/012/_CAPSV012.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx-component/bx-tree/bx-tree'
        , 'app/views/page/popup/CAPSV/popup-attribute-search'
        , 'app/views/page/popup/CAPCM/popup-class-search'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , ExtGrid
        , bxTree
        , PopupAttributeSearch
        , PopupClassSearch
        , commonInfo
        ) {

        /**
         * Backbone
         */
        var CAPSV012View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPSV012-page'
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


                    that.CAPSV012Grid = new ExtGrid({
                     	// 그리드 컬럼 정의
                     	fields: ['trgtYn', 'classNm', 'beanNm', 'parntClassNm', 'pckgNm', 'classTpCd','rflctnNcsrYn'
                     	        ,
                                {
                                    name: 'checkTrgtYn',
                                    type: 'boolean',
                                    convert: function (value, record) {
                                        return record.get('trgtYn') === 'Y';
                                        ;
                                    }
                                }]
                     , id: 'CAPSV012Grid'
                 	, columns: [
             	            {
	         	            /*	text: 'No.'
	         	            		, dataIndex: 'rowIndex'
	         	            			, sortable: false
	         	            			, height : 25
	         	            			, flex : 1
	         	            			, style: 'text-align:center'
	         	            				, align: 'center'
	         	            					// other config you need....
	         	            					, renderer: function (value, metaData, record, rowIndex) {
	         	            						return rowIndex + 1;
	         	            					}*/
             	            	
             	            	

        						  text: 'trgtYn'
        						, flex : 1
        						, xtype: 'checkcolumn'
                                , columntype: 'checkbox'
        						, stopSelection: false
        						, header : '<input type="checkbox" />'
        						, listeners: {
        							
        						    click: function (_this, cell, rowIndex, eOpts) {
        						    	
                                        currentRecord = that.CAPSV012Grid.store.getAt(rowIndex),
                                        changedChecked = !currentRecord.get('checkTrgtYn');
                                        if(currentRecord.data.rflctnNcsrYn!=='Y'){return;}

                                        currentRecord.set('trgtYn', changedChecked ? 'Y' : 'N');
                                        currentRecord.set('checkTrgtYn', changedChecked);
                                    },
                                    headerclick: function(header, column, e, t,eOpts) {
                                        var selections = that.CAPSV012Grid.store.getRange(),
                                            i = 0,
                                            len = selections.length;
                                        	
                                        
                                        for (; i < len; i++) {
                                        	if(that.CAPSV012Grid.store.getAt(i).data.rflctnNcsrYn!=='Y'){continue;}
                                        	
                                        	 if( e.target.checked ){
                                        		 if( e.target.checked === ( that.CAPSV012Grid.store.getAt(i).data.trgtYn==='Y')){
                                        		 }else{
                                                     that.CAPSV012Grid.store.getAt(i).set('trgtYn', 'Y');
                                                     that.CAPSV012Grid.store.getAt(i).set('checkTrgtYn',true);
                                        		 }
                                        	 }else{
                                        		 if( !e.target.checked === ( that.CAPSV012Grid.store.getAt(i).data.trgtYn==='N')){
                                        		 }else{
                                            		 that.CAPSV012Grid.store.getAt(i).set('trgtYn', 'N');
                                                     that.CAPSV012Grid.store.getAt(i).set('checkTrgtYn',false);
                                        		 }
                                        	 }
                                        }
                                    }
        							
        						}  
        						, editor: {
		        					xtype: 'checkcolumn'
		        					,cls: 'x-grid-checkheader-editor'
        						}
        						, dataIndex: 'checkTrgtYn'
        						, style: 'text-align:center'
        						, align: 'center'
        					}
             	            	
             	            	
             	            , {
             	            	text: bxMsg('cbb_items.AT#classNm')
             	            	, flex: 4
             	            	, dataIndex: 'classNm'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	}
             	            , {
             	            	text: bxMsg('cbb_items.AT#beanNm')
             	            	, flex: 4
             	            	, dataIndex: 'beanNm'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	}
             	            , {
             	            	text: bxMsg('cbb_items.AT#parntClassNm')
             	            	, flex: 4
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
             	            	text: bxMsg('cbb_items.AT#rflctnNcsrYn')
             	            	, flex: 1
             	            	, dataIndex: 'rflctnNcsrYn'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	, code : 'A1140'
             	            }
             	            
                 	  ] // end of columns

                    , listeners: {
                     	click:{
                     		element: 'body'
                     		, fn: function () {
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
                    this.$el.find(".CAPSV012-grid").html(this.CAPSV012Grid.render({'height': CaGridHeight}));
                	
                    this.setComboBoxes();
                    
                    //배포처리반영[버튼비활성화]
                    this.resetDistributionBtn();
                    return this.$el;
                	
                } //end of render
                
                
                , resetDistributionBtn : function(){
                	//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPSV012-wrap #btn-grid-save')
                                        			   ]);
                }
                
            	   
               ,fn_createTree : function (){
            	   var that = this;
            	   that.subViews['CAPSV012Tree'] = new bxTree({
            		   fields : {id : 'nodeId', value : 'nodeNm'}
            	   
            	   	  ,listeners :{
            	   		  clickItem : function(itemId, itemData, currentTarget, e){
            	   			  console.log(itemData.cdNm);
            	   			that.inquire(itemData);
            	   		  }
            	   	  } 
            	   
            	   });
            	
            	   that.$el.find('.bx-tree-root').html(that.subViews['CAPSV012Tree'].render());
               }              
                
               ,setComboBoxes: function () {
                   var sParam = {};
                   
                   sParam = {};
                   sParam.className = "CAPSV012-classTpCd-wrap";
                   sParam.targetId = "classTpCd";
                   sParam.nullYn = "Y";
                   sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                   sParam.cdNbr = "A1141";
                   fn_getCodeList(sParam, this);   // 서비스컴포넌트코드
                   
                   sParam = {};
                   sParam.className = "CAPSV012-rflctnNcsrYn-wrap";
                   sParam.targetId = "rflctnNcsrYn";
                   sParam.nullYn = "Y";
                   sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                   sParam.cdNbr = "A1140";
                   fn_getCodeList(sParam, this);   // 서비스컴포넌트코드
                   
               }
               
               
               
               
               
               //조회
               ,inquire: function (){
            	   var that = this;
                   var sParam = {};
                   that.deleteList = [];

                   sParam.classLayerTpCd = that.$el.find("#CAPSV012-search [data-form-param='classTpCd']").val();
                   sParam.classNm = that.$el.find("#CAPSV012-search [data-form-param='classNm']").val();
                   sParam.rflctnNcsrYn = that.$el.find("#CAPSV012-search [data-form-param='rflctnNcsrYn']").val();
                   
                   

                   if(sParam.classLayerTpCd==="" && sParam.classNm===""){
                	   fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0031"));
                       return;
                   }
                   
                   var linkData = {"header": fn_getHeader("CAPSV0128401"), "CaClassMgmtSvcGetClassInfoListFromPhsclTblIn": sParam};


                   //ajax 호출
                   bxProxy.post(sUrl, JSON.stringify(linkData), {
                       success: function (responseData) {
                           if (fn_commonChekResult(responseData)) {
                               var classList = responseData.CaClassMgmtSvcGetClassInfoFromPhsclTblListOut.classList;
                               var totCnt = classList.length;

                               
                               
                               if (classList != null || classList.length > 0) {
                            	   
                            	   $(classList).each(function (idx, data) {
                            		   var classLayerTpCd="";
                            		  $(data.classLayerTpCdList).each(function (idx,tpCd){
                            			 classLayerTpCd = idx==0?tpCd:classLayerTpCd+", "+tpCd;
                            		  });
                            		   data.classTpCd=classLayerTpCd;
                            	   });
                            	   
                            	   that.CAPSV012Grid.setData(classList); 
                                   that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                               } else {
                                   that.CAPSV012Grid.resetData();
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
               	fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveGrid, this);
               }
               
               ,saveGrid : function(that){
            	   
            	   var gridAllData = that.CAPSV012Grid.getAllData();
            	   var sParam = {};	
            	   sParam.rflctnList=[];
            	   console.log(gridAllData);
            	   if(gridAllData.length>0){
            		   $(gridAllData).each(function(idx,data){
            			   if(data.trgtYn=='Y'){
            				   var sub={};
            				   sub.classNm=data.classNm;
            				   sParam.rflctnList.push(sub);
            			   }
            			   
            		   });
            	   }
            	   console.log(sParam);

					var linkData = {"header": fn_getHeader("CAPSV0128501"), "CaClassMgmtSvcSaveClassInfoListIn": sParam};


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
                   this.$el.find('.CAPSV012-base-table [data-form-param="classTpCd"]').val("");
                   this.$el.find('.CAPSV012-base-table [data-form-param="classNm"]').val("");
                   this.$el.find('.CAPSV012-base-table [data-form-param="chngYn"]').val("");

               }
  
                
               , toggleSearch : function() {
               	fn_pageLayerCtrl("#CAPSV012-search");
               }


               , toggleGrid : function() {
               	fn_pageLayerCtrl("#CAPSV012-grid");
               }
                
                
                
            }); // end of Backbone.View.extend({


        return CAPSV012View;
    } // end of define function
)
; // end of define
