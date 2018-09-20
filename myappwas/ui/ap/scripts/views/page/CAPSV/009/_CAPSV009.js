define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPSV/009/_CAPSV009.html'
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
        var CAPSV009View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPSV009-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
						  'click #btn-search-toggle': 'toggleSearch'
						, 'click #btn-grid-toggle': 'toggleSrvcInfo'
					    , 'click #btn-service-input-toggle': 'toggleInput'
					    , 'click #btn-service-output-toggle': 'toggleOutput'
							
						, 'click #btn-search-reset' : 'resetSearch'

						, 'click #btn-service-save' : 'clickSaveGrid'
						, 'click #btn-xtn-search': 'inquire'
						, 'click #btn-CAPSV009-srvcInpItm-upClass' : 'inquireInpUpperClass'
						, 'click #btn-CAPSV009-srvcOutpItm-upClass' : 'inquireOutpUpperClass'
							
							
						, 'click #tab-srvcInpItm' : 'clickTapInput'
						, 'click #tab-srvcOutpItm' : 'clickTapOutput'
                }
                , initialize: function (initData) {
                    var that = this;
                    that.inquireYn =false;
                    that.inpDtoList = [];
                    that.outpDtoList = [];

                    $.extend(that, initData);
                    that.$el.html(that.tpl());


                    that.initData = initData;


                    that.CAPSV009GridSrvcInfo = new ExtGrid({
                     	// 그리드 컬럼 정의
                     	fields: ['stsCd', 'cmpntCd', 'srvcCd', 'srvcNm', 'srvcClassNm', 'oprtnNm','inpDtoNm','outpDtoNm']
                     , id: 'CAPSV009GridSrvcInfo'
                 	, columns: [
             	            {
	         	            	text: bxMsg('cbb_items.SCRNITM#dstnctn')
         	            		, dataIndex: 'stsCd'
     	            			, height : 25
     	            			, flex : 2
     	            			, style: 'text-align:center'
 	            				, align: 'center'
             	            }
             	            , {
             	            	text: bxMsg('cbb_items.SCRNITM#cmpnt')
             	            	, flex: 4
             	            	, dataIndex: 'cmpntCd'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	}
             	            , {
             	            	text: bxMsg('cbb_items.AT#srvcCd')
             	            	, flex: 4
             	            	, dataIndex: 'srvcCd'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	}
             	            , {
             	            	text: bxMsg('cbb_items.AT#srvcNm')
             	            	, flex: 4
             	            	, dataIndex: 'srvcNm'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	}
             	            , {
             	            	text: bxMsg('cbb_items.CDVAL#1140101')
             	            	, flex: 4
             	            	, dataIndex: 'srvcClassNm'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	}
             	            , {
             	            	text: bxMsg('cbb_items.ABRVTN#oprtnl')
             	            	, flex: 4
             	            	, dataIndex: 'oprtnNm'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	}
             	            , {
             	            	text: bxMsg('cbb_items.AT#inpDtoNm')
             	            	, flex: 4
             	            	, dataIndex: 'inpDtoNm'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            }
             	            , {
             	            	text: bxMsg('cbb_items.AT#outpDtoNm')
             	            	, flex: 4
             	            	, dataIndex: 'outpDtoNm'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            }
             	            
                 	  ] // end of columns

                    , listeners: {
                     	click:{
                     		element: 'body'
                     		, fn: function () {
                 			}
                     	} 
                     }
                    });//end of CAPSV009GridSrvcInfo
                    
                    that.CAPSV009GridSrvcInput = new ExtGrid({
                     	// 그리드 컬럼 정의
                     	fields: ['rowIndex', 'dtoClassNm', 'atrbtNm', 'dtoNm','stsCd']
                     , id: 'CAPSV009GridSrvcInput'
                 	, columns: [
             	            {
	                            text: 'No.',
	                            dataIndex: 'rowIndex',
	                            sortable: false,
	                            width : 80,
	                            height : 25,
	                            style: 'text-align:center',
	                            align: 'center',
	                            // other config you need....
	                            renderer: function (value, metaData, record, rowIndex) {
	                                return rowIndex + 1;
	                            }
             	            }
             	            , {
             	            	text: bxMsg('cbb_items.AT#classNm')
             	            	, flex: 4
             	            	, dataIndex: 'dtoClassNm'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	}
             	            , {
             	            	text: bxMsg('cbb_items.AT#atrbtNm')
             	            	, flex: 4
             	            	, dataIndex: 'atrbtNm'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	}
             	           , {
            	            	text: bxMsg('cbb_items.AT#dtoNm')
            	            	, flex: 4
            	            	, dataIndex: 'dtoNm'
            	            	, style: 'text-align:center'
            	            	, align: 'center'
            	            	}
             	           , {
                               tdCls: 'bw-btn',
                               renderer: function (value, p, record, idx) {
                                   var button = "";

                                   /**
                                    * 버튼 렌더링 조건
                                    */
                                   if (!fn_isEmpty(record.get('dtoNm'))) {
                                       button = '<button type=\"button\" class=\"bw-btn\"><i class=\"bw-icon i-25 i-search dtoClass-grid-btn\"></i></button>';
                                   }
                                   
                                   return button;
                               },
                               sortable: false,
                               align: 'left',
                               width: 90,
                               listeners: {
                                   /**
                                    * 버튼 클릭 이벤트 등록
                                    */
                                   click: function (grid, rowEl, rowIdx, cellIdx, e, record) {
                                       if ($(e.target).hasClass('dtoClass-grid-btn')) {
                                    	   that.inpDtoList.push(record.data.dtoClassNm);
                                    	   that.inquireDtoInfo(record.data.dtoNm,"in");
                                       }
                                   }
                               }
                           }
             	            , {
             	            	text: bxMsg('cbb_items.SCRNITM#modifiedOrNew')
             	            	, flex: 4
             	            	, dataIndex: 'stsCd'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	}
                 	  ] // end of columns

                    , listeners: {
                     	click:{
                     		element: 'body'
                     		, fn: function () {
                 			}
                     	} 
                     }
                    });//end of CAPSV009GridSrvcInput
                    
                    
                    
                    that.CAPSV009GridSrvcOutput = new ExtGrid({
                     	// 그리드 컬럼 정의
                     	fields: ['rowIndex', 'dtoClassNm', 'atrbtNm', 'dtoNm','stsCd']
                     , id: 'CAPSV009GridSrvcOutput'
                 	, columns: [
             	            {
	                            text: 'No.',
	                            dataIndex: 'rowIndex',
	                            sortable: false,
	                            width : 80,
	                            height : 25,
	                            style: 'text-align:center',
	                            align: 'center',
	                            // other config you need....
	                            renderer: function (value, metaData, record, rowIndex) {
	                                return rowIndex + 1;
	                            }
             	            }
             	            , {
             	            	text: bxMsg('cbb_items.AT#classNm')
             	            	, flex: 4
             	            	, dataIndex: 'dtoClassNm'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	}
             	            , {
             	            	text: bxMsg('cbb_items.AT#atrbtNm')
             	            	, flex: 4
             	            	, dataIndex: 'atrbtNm'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	}
             	            , {
             	            	text: bxMsg('cbb_items.AT#dtoNm')
             	            	, flex: 4
             	            	, dataIndex: 'dtoNm'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	}
             	           , {
                               tdCls: 'bw-btn',
                               renderer: function (value, p, record, idx) {
                                   var button = "";

                                   /**
                                    * 버튼 렌더링 조건
                                    */
                                   if (!fn_isEmpty(record.get('dtoNm'))) {
                                       button = '<button type=\"button\" class=\"bw-btn\"><i class=\"bw-icon i-25 i-search dtoClass-grid-btn\"></i></button>';
                                   }
                                   
                                   return button;
                               },
                               sortable: false,
                               align: 'left',
                               width: 90,
                               listeners: {
                                   /**
                                    * 버튼 클릭 이벤트 등록
                                    */
                                   click: function (grid, rowEl, rowIdx, cellIdx, e, record) {
                                       if ($(e.target).hasClass('dtoClass-grid-btn')) {
                                    	   that.outpDtoList.push(record.data.dtoClassNm);
                                    	   that.inquireDtoInfo(record.data.dtoNm,"out");
                                       }
                                   }
                               }
                           }
             	            , {
             	            	text: bxMsg('cbb_items.SCRNITM#modifiedOrNew')
             	            	, flex: 4
             	            	, dataIndex: 'stsCd'
             	            	, style: 'text-align:center'
             	            	, align: 'center'
             	            	}
                 	  ] // end of columns

                    , listeners: {
                     	click:{
                     		element: 'body'
                     		, fn: function () {
                 			}
                     	} 
                     }
                    });//end of CAPSV009GridSrvcOutput
                } //END OF initialize
                
                /**
                 * render
                 */
                ,render : function (){
                	
                    this.$el.html(this.tpl());
                    this.$el.find(".CAPSV009Grid-service-info").html(this.CAPSV009GridSrvcInfo.render({'height': "125px"}));//2건조회
                    this.$el.find(".CAPSV009Grid-service-input").html(this.CAPSV009GridSrvcInput.render({'height': CaGridHeight}));
                    this.$el.find(".CAPSV009Grid-service-output").html(this.CAPSV009GridSrvcOutput.render({'height': CaGridHeight}));
                	this.$el.find("#output-grid-area").hide();
                    
                	//배포처리반영[버튼비활성화]
                    this.resetDistributionBtn();
                    return this.$el;
                	
                } //end of render
                , resetDistributionBtn : function(){
                	//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPSV009-wrap #btn-service-save')
                                        		]);
                }

               
               //조회
               ,inquire: function (){
            	   var that = this;
            	   console.log("inquire");	
            	   var srvcCd=that.$el.find("#CAPSV009-search [data-form-param='srvcCd']").val();
            	   if(srvcCd ===""){
            		   fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0004'));
            		   return;
            	   }
            	   
            	   
            	   var sParam = {};
            	   sParam.srvcCd=srvcCd;
            	   
                   var linkData = {"header": fn_getHeader("CAPSV0098401"), "CaSrvcMgmtSvcGetSrvcInfoListFromPhsclTblIn": sParam};

                   // ajax호출
                   bxProxy.post(sUrl, JSON.stringify(linkData), {
                       enableLoading: true,
                       success: function (responseData) {
                          
                    	   that.inpDtoList = [];
                           that.outpDtoList = [];
                    	   
                           if (fn_commonChekResult(responseData)) {
                        	   
                        	//서비스정보부분 SETTING
                           	var data = responseData.CaSrvcMgmtSvcGetSrvcInfoFromPhsclTblListOut;
                               	that.CAPSV009GridSrvcInfo.setData(data.srvcInfoList);
                            	
//                               	if(that.$el.find(".on-tab")[0].id==="tab-srvcOutpItm"){
//                               		that.inquireDtoInfo(data.srvcInfoList[1].outpDtoNm);
//                         		}else{
//                         			 that.inquireDtoInfo(data.srvcInfoList[1].inpDtoNm);
//                         		}
                               	
                               	that.inquireDtoInfo(data.srvcInfoList[1].outpDtoNm,"out");
                               	console.log("heeran",data.srvcInfoList[1].outpDtoNm);
                    			that.inquireDtoInfo(data.srvcInfoList[1].inpDtoNm,"in");
                    			that.inquireYn=true;
                           }
                           //검색조건 비활성화
                           $("[data-form-param='srvcCd']").prop("disabled", true).prop("readonly", true);
                       }   // end of success: function
                   });     // end of bxProxy
               }

               
          
               
               /*저장(반영)버튼*/
               ,clickSaveGrid : function (event){
            		//배포처리[과제식별자 체크]
                   if (!fn_headerTaskIdCheck()){
                       return;
                   }
                   var srvcCd=this.$el.find("#CAPSV009-search [data-form-param='srvcCd']").val();
            	   if(!this.inquireYn){
            		   	fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0070'));
            	   		return;
            	   }
                  	fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveGrid, this);
               
               }
                  
               ,saveGrid : function(that){
            	   var srvcCd=that.$el.find("#CAPSV009-search [data-form-param='srvcCd']").val();
            	/*   if(!that.inquireYn){
            		   	fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0070'));
            	   		return;
            	   }*/
            	   
              	  var sParam = {};
            	  sParam.srvcCd=srvcCd;
            	  
            	  var linkData = {"header": fn_getHeader("CAPSV0098501"), "CaSrvcMgmtSvcSaveServiceInfoListIn": sParam};


					// ajax호출
					bxProxy.post(sUrl, JSON.stringify(linkData), {		
						enableLoading: true
						, success: function (responseData) {
							if (fn_commonChekResult(responseData)) {		
								fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
//								that.inquire();
							}
						}   // end of suucess: fucntion
					}); // end of bxProxy
           	   
           	   
              }	
              	
              	
              	/*dto 정보 조회*/
              	,inquireDtoInfo: function (dtoNm,inOrOut){
              		var that = this;
              		var inOrOut=inOrOut;
              		console.log(that);
              		var sParam={};
              	  	sParam.dtoNm=dtoNm;
              	   
                     var linkData = {"header": fn_getHeader("CAPSV0098402"), "CaStdSrvcIoMgmtSvcGetSrvcIOFromPhsclTblIn": sParam};

                     // ajax호출
                     bxProxy.post(sUrl, JSON.stringify(linkData), {
                         enableLoading: true,
                         success: function (responseData) {
                             if (fn_commonChekResult(responseData)) {
                          	   
                          	//서비스정보부분 SETTING
                             	var data = responseData.CaStdSrvcIoMgmtSvcGetSrvcIOFromPhsclTblListOut;
                             		
                             	/*	if(that.$el.find(".on-tab")[0].id==="tab-srvcOutpItm"){
                             			that.CAPSV009GridSrvcOutput.setData(data.atrbtList);
                             		}else{
                             			that.CAPSV009GridSrvcInput.setData(data.atrbtList);
                             		}*/
                             		if(inOrOut==="out"){
                             			that.CAPSV009GridSrvcOutput.setData(data.atrbtList);
                             		}else if(inOrOut==="in"){
                             			that.CAPSV009GridSrvcInput.setData(data.atrbtList);
                             		}
                             		
                             }
                             
                         }   // end of success: function
                     });  
              	}
               
              	
              	,inquireInpUpperClass: function (){
              		
              	   	 if(!this.inpDtoList.length){
                         fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0069'));
              	   		 return;
                 	}
              		
              		
              		var dtoNm=this.inpDtoList.pop();
              		console.log(dtoNm);
              		this.inquireDtoInfo(dtoNm,"in");
              	}
              	,inquireOutpUpperClass: function (){
              		
              		if(!this.outpDtoList.length){
              			fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0069'));
              			return;
              		}
              		
              		
              		var dtoNm=this.outpDtoList.pop();
              		console.log(dtoNm);
              		this.inquireDtoInfo(dtoNm,"out");
              	}
               
                //검색조건 부분 초기화
               , resetSearch: function () {
            	   console.log("reset");
            	   this.inpDtoList = [];
            	   this.outpDtoList = [];
            	   this.inquireYn=false;
                   $("[data-form-param='srvcCd']").prop("disabled", false).prop("readonly", false);
                   this.$el.find('.CAPSV009-search-table [data-form-param="srvcCd"]').val("");
                   this.CAPSV009GridSrvcInfo.resetData();
                   this.CAPSV009GridSrvcInput.resetData();
                   this.CAPSV009GridSrvcOutput.resetData();
                   
               }
  
                
               
               
               
               
               /*
                * tab 조절
                * */
               , clickTapInput : function(event) {
               	this.$el.find("#tab-title > ul > li").removeClass("on-tab");
               	this.$el.find("#tab-srvcInpItm").addClass("on-tab");
               	this.$el.find("#input-grid-area").show();
               	this.$el.find("#output-grid-area").hide();
               	this.CAPSV009GridSrvcInput.grid.getView().refresh();
               	//input내용 불러오는 함수
            	/*if(!this.CAPSV009GridSrvcInfo.grid.store.data.items[1])
                   		return;
               	this.inquireDtoInfo(this.CAPSV009GridSrvcInfo.grid.store.data.items[1].data.inpDtoNm);
               */}


               , clickTapOutput : function(event) {
               	this.$el.find("#tab-title > ul > li").removeClass("on-tab");
               	this.$el.find("#tab-srvcOutpItm").addClass("on-tab");
               	this.$el.find("#output-grid-area").show();
               	this.$el.find("#input-grid-area").hide();
               	this.CAPSV009GridSrvcOutput.grid.getView().refresh();
               	//output 내용 불러오는 함수
               	
              /* 	if(!this.CAPSV009GridSrvcInfo.grid.store.data.items[1])
               		return;
               	this.inquireDtoInfo(this.CAPSV009GridSrvcInfo.grid.store.data.items[1].data.outpDtoNm);
            */   }
                  
               
               
               
               
               /*
                * toogle
                */
               , toggleSearch : function() {
               	fn_pageLayerCtrl("#CAPSV009-search");
               }
               , toggleSrvcInfo : function() {
               	fn_pageLayerCtrl("#CAPSV009Grid-service-info");
               }
               , toggleInput : function() {
            	   fn_pageLayerCtrl("#CAPSV009Grid-service-input");
               }
               , toggleOutput : function() {
            	   fn_pageLayerCtrl("#CAPSV009Grid-service-output");
               }
               
            }); // end of Backbone.View.extend({


        return CAPSV009View;
    } // end of define function
)
; // end of define
