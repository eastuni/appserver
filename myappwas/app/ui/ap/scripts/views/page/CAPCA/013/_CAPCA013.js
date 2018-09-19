/**
@Screen number  CAPCA013
@brief          
@author         
@history        2018.08.14      생성
*/

define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPCA/013/_CAPCA013.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , ExtGrid
        , commonInfo
        ) {
    	
    	var comboStore1 = {}; // 배포서버식별자코드
    	
        /**
         * Backbone
         */
        var CAPCA013View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPCA013-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                    'click #btn-search-reset': 'resetSearch',
	  				'click #btn-search-toggle': 'toggleSearch',
					'click #btn-grid-toggle': 'toggleGrid',
					'click #btn-CAPCA013-error-detail' : 'inquiryErrorDetail',
					'click #btn-CAPCA013-search' : 'inquiryPrsntList',
					'click #btn-CAPCA013-execute-all-validation' : 'executeAllDataVldtn',
					'click #btn-CAPCA013-re-execute' : 'executeReVldtn',
                	
                	
                	
                }
                , initialize: function (initData) {
                    var that = this;

                    $.extend(that, initData);
                    that.$el.html(that.tpl());
                    that.initData = initData;
                    

                    // 콤보조회 서비스호출 준비
                    var sParam = {};
                    
                    // 여부
                    sParam = {};
                    sParam.cdNbr = "10000";
                    var linkData4 = {
                        "header": fn_getHeader("CAPCM0038400"),
                        "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                    };


                    bxProxy.all([
         						{
         	                        url: sUrl,
         	                        param: JSON.stringify(linkData4),
         	                        success: function (responseData) {
         	                            if (fn_commonChekResult(responseData)) {
         	                                that.comboStore1 = new Ext.data.Store({
         	                                    fields: ['cd', 'cdNm'],
         	                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
         	                                });
         	                            }
         	                        }
         	                    }
                                   ]
                                 , {
                                     success: function () {	
                    

		                    that.CAPCA013Grid = new ExtGrid({
		                     	// 그리드 컬럼 정의
		                     	fields: ['trgtYn','dataVldtnSqlId','exctnSeqNbr','seqNbr','exctnDt','exctnHms', 'cmpntCd', 'tblNm', 'columnNm', 'dataVldtnWayCd','dataVldtnDescCntnt','dataVldtnErrCnt','sqlErrYn',
		                     	         	{
				                     		name: 'checkTrgtYn',
				                            type: 'boolean',
				                            convert: function (value, record) {
				                                return record.get('trgtYn') === 'Y';
				                            	}
		                     	         	}
		                     			]
		                     , id: 'CAPCA013Grid'
		                 	, columns: [
		                 	            { text: 'trgtYn'
		           						, flex : 1
									    ,height : 25
		           						, xtype: 'checkcolumn'
		                                   , columntype: 'checkbox'
		           						, stopSelection: false
		           						, header : '<input type="checkbox" />'
		           						, listeners: {
		           							
		           						    click: function (_this, cell, rowIndex, eOpts) {
		           						    	
		                                           currentRecord = that.CAPCA013Grid.store.getAt(rowIndex);
		                                           console.log("currentRecord ::",currentRecord);
		                                           changedChecked = !currentRecord.get('checkTrgtYn');
		                                           currentRecord.set('trgtYn', changedChecked ? 'Y' : 'N');
		                                           currentRecord.set('checkTrgtYn', changedChecked);
		                                           console.log("afcurrentRecord ::",currentRecord);
		
		                                       },
		                                       headerclick: function(header, column, e, t,eOpts) {
		                                           var selections = that.CAPCA013Grid.store.getRange(),
		                                               i = 0,
		                                               len = selections.length;
		                                           
		                                          
		                                           that.CAPCA013Grid.store.suspendEvents();
		                                           for (; i < len; i++) {
			                                           var selected=that.CAPCA013Grid.store.getAt(i);

		                                           	 if( e.target.checked ){
		                                           		 if( e.target.checked === ( selected.data.trgtYn==='Y')){
		                                           		 }else{
		                                           			selected.set('trgtYn', 'Y');
		                                           			selected.set('checkTrgtYn',true);
		                                           		 }
		                                           	 }else{
		                                           		 if( !e.target.checked === ( selected.data.trgtYn==='N')){
		                                           		 }else{
		                                               		 selected.set('trgtYn', 'N');
		                                                     selected.set('checkTrgtYn',false);
		                                           		 }
		                                           	 }
		                                           }
		                                           
		                                           that.CAPCA013Grid.store.resumeEvents();
		                                           that.CAPCA013Grid.grid.getView().refresh();
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
		                            , 
		                            {text: "", dataIndex: 'dataVldtnSqlId', hidden : true}
		                            ,
		                            {text: "", dataIndex: 'exctnSeqNbr', hidden : true}
		                            ,
		                            {text: "", dataIndex: 'seqNbr', hidden : true}
									,
		             	            {
			         	            	text: bxMsg('cbb_items.AT#exctnDt')
		         	            		, dataIndex: 'exctnDt'
		         	            		, flex : 3
		     	            			, width : 100
		     	            			, style: 'text-align:center'
		 	            				, align: 'center'
		             	            }
									,
									{
										text: bxMsg('cbb_items.AT#exctnHms')
										, dataIndex: 'exctnHms'
											, flex : 3
											, width : 100
											, style: 'text-align:center'
												, align: 'center'
									}
									,
									{
										text: bxMsg('cbb_items.AT#cmpntCd')
										, dataIndex: 'cmpntCd'
											, flex : 3
											, width : 100
											, style: 'text-align:center'
												, align: 'center'
									}
									,
		             	            {
			         	            	text: bxMsg('cbb_items.AT#tblNm')
		         	            		, dataIndex: 'tblNm'
		             	            	, flex : 3
		     	            			, width : 120
		     	            			, style: 'text-align:center'
		 	            				, align: 'left'
		             	            }
									,
		             	            {
			         	            	text: bxMsg('cbb_items.AT#columnNm')
		         	            		, dataIndex: 'columnNm'
		     	            			, flex : 3
		     	            			, style: 'text-align:center'
		 	            				, align: 'left'
		             	            }
									,
		             	            {
			         	            	text: bxMsg('cbb_items.SCRNITM#vldtnWay')
		         	            		, dataIndex: 'dataVldtnWayCd'
		     	            			, flex : 3
		     	            			, style: 'text-align:center'
		 	            				, align: 'center'
		             	            }
									,
									{
										text: bxMsg('cbb_items.SCRNITM#vldtnDesc')
										, dataIndex: 'dataVldtnDescCntnt'
											, flex : 8
											, style: 'text-align:center'
												, align: 'left'
									}
									,
									{
										text: bxMsg('cbb_items.AT#dataVldtnErrCnt')
										, dataIndex: 'dataVldtnErrCnt'
											, flex : 3
											, style: 'text-align:center'
												, align: 'center'
									}
									,
									 {
										text:bxMsg('cbb_items.AT#sqlErrYn'), dataIndex: 'sqlErrYn', flex: 2, style: 'text-align:center', align: 'center',
					                	  editor: {
					                		  xtype: 'combobox',
					                		  store: that.comboStore1,
					                		  displayField: 'cdNm',
				                		  valueField: 'cd'
					                	  },
					                	  renderer: function (val) {
					                		  index = that.comboStore1.findExact('cd', val);
		
					                		  if (index != -1) {
					                			  rs = that.comboStore1.getAt(index).data;
					                			  var classNm = "s-no";
					                			  var val = rs.cd;
					                			  
					                			  if (val == "Y") {
					                				  classNm = "s-yes";
					                			  }
					                			  return "<span class=\"bw-sign " + classNm + "\">" + val + "</span>";
					                		  	}
						                	  } // end of render
					                  }
		                 	  ] // end of columns
		
		                    , listeners: {
		                     	click:{
		                     		element: 'body'
		                     		, fn: function () {
		                     		}
		                     	} 
		                     }
		                    });//end of CAPCA013Grid
                            that.createGrid();
                        }//end of success: ,function
                    }); //end of bxProxy.all
                } //END OF initialize
                
                /**
                 * render
                 */
                ,render : function (){
                	
                    this.$el.html(this.tpl());
                    this.setComboBoxes();

                    return this.$el;
                	
                }
                /**
                 * grid생성
                 */
                , createGrid: function () {
                    var that = this;
                    this.$el.find(".CAPCA013Grid-present-list").html(this.CAPCA013Grid.render({'height': "800px"}));
                } // end of createGrid


                
                /**
                 * 콤보박스 셋팅
                 */
                ,setComboBoxes: function () {
                    var sParam = {};
                    
                    sParam = {};
                    sParam.className = "CAPCA013-cmpntCd-wrap";
                    sParam.targetId = "cmpntCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                    sParam.cdNbr = "A0012";

                    fn_getCodeList(sParam, this);   // 서비스컴포넌트코드
                    
                    var sParam = {};
                    
                    sParam = {};
                    sParam.className = "CAPCA013-vldtnWay-wrap";
                    sParam.targetId = "vldtnWay";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                    sParam.cdNbr = "A1556";
                    
                    fn_getCodeList(sParam, this);   // 서비스컴포넌트코드
                    
                    var sParam = {};
                    
                    sParam = {};
                    sParam.className = "CAPCA013-inqryTrgt-wrap";
                    sParam.targetId = "inqryTrgt";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                    sParam.cdNbr = "A1560";
                    
                    fn_getCodeList(sParam, this);   // 서비스컴포넌트코드
                    
                }
                
                /**
                 * 에러상세보기버튼 CAPCA014페이지로 연결
                 */
                , inquiryErrorDetail: function () {
                    
                	var that = this;
                    var searchData = that.CAPCA013Grid.grid.getSelectionModel().selected.items[0].data;
                    
                    console.log("check selected grid in inquiryErrData1",searchData);
                    
                    if(searchData.dataVldtnErrCnt===0){
                 	   fn_alertMessage("", bxMsg("cbb_err_msg.AUISVE0006"));
                    	return;
                    }
                    
                    
                    var dataVldtnSqlId = searchData.dataVldtnSqlId;
                    var cmpntCd = searchData.cmpntCd;
                    var tblNm = searchData.tblNm;
                    var columnNm = searchData.columnNm;
                    var seqNbr = searchData.seqNbr;
                    var dataVldtnDescCntnt = searchData.dataVldtnDescCntnt;
                    var exctnSeqNbr = searchData.exctnSeqNbr;
                    var sqlErrYn=searchData.sqlErrYn;
                	
                	that.$el.trigger({
                		type: 'open-conts-page',
                		pageHandler: 'CAPCA014',
                		pageDPName: bxMsg('cbb_items.SCRN#CAPCA014'),
                		pageInitialize: true,
                		pageRenderInfo: {
                			dataVldtnSqlId : dataVldtnSqlId,
                			cmpntCd : cmpntCd,
                			tblNm : tblNm,
                			columnNm : columnNm,
                			seqNbr : seqNbr,
                			dataVldtnDescCntnt : dataVldtnDescCntnt,
                			exctnSeqNbr : exctnSeqNbr,
                			sqlErrYn : sqlErrYn
                		}
                	});
                    
                } // end
                
                /**
                 * 조회버튼 (검증현황조회) CAPCA0138401
                 */
                ,inquiryPrsntList : function (){
                    var that = this;
                    var sParam = {};
                    
                    sParam.cmpntCd = that.$el.find('#CAPCA013-search [data-form-param="cmpntCd"]').val();
                    sParam.tblNm = that.$el.find('#CAPCA013-search [data-form-param="tblNm"]').val().toUpperCase();
                    sParam.columnNm = that.$el.find('#CAPCA013-search [data-form-param="columnNm"]').val().toUpperCase();
                    sParam.dataVldtnWayCd = that.$el.find('#CAPCA013-search [data-form-param="vldtnWay"]').val();
                    sParam.dataVldtnRsltDscd = that.$el.find('#CAPCA013-search [data-form-param="inqryTrgt"]').val();
                    
                    console.log(sParam);
                    var linkData = {"header": fn_getHeader("CAPCA0138401"), "CaDataVldtnMgmtSvcGetPrsntIn": sParam};

                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	var data = responseData.CaDataVldtnMgmtSvcGetPrsntListOut.prsntList;
                            	
                            	that.CAPCA013Grid.setData(data)
                      		  	that.$el.find('#rsltCnt').html(data.length);                      		  	

                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy

                }
                
                
                
                
                /**
                 * 전체수행버튼 CAPCA0138101
                 */
                ,executeAllDataVldtn : function (){
                	  var that = this;
                      that.CAPCA013Grid.resetData();
                      var sParam={};
                      
                      var linkData = {"header": fn_getHeader("CAPCA0138101"),"DummyIO": sParam};

                      // ajax호출
                      bxProxy.post(sUrl, JSON.stringify(linkData), {
                          enableLoading: true
                          , success: function (responseData) {
                              if (fn_commonChekResult(responseData)) {
                              	that.inquiryPrsntList();
                              }
                          }   // end of suucess: fucntion
                      }); // end of bxProxy
                
                }
                	
                	
            	/**
            	 * 재수행버튼 CAPCA0138102
            	 */	
                ,executeReVldtn : function(){
                	
                	  var that = this;
                      var gridAllData = that.CAPCA013Grid.getAllData();
                      var sParam = {};	
	               	  sParam.dataVldtnSqlId=[];
	               	  console.log(gridAllData);
	               	  if(gridAllData.length>0){
	               		   $(gridAllData).each(function(idx,data){
	               			   if(data.trgtYn=='Y'){
	               				   sParam.dataVldtnSqlId.push(data.dataVldtnSqlId);
	               			   }
	               			   
	               		   });
	               	   }
	            	   console.log(sParam);

	            	   
	            	   if(sParam.dataVldtnSqlId.length===0){
	            		   return;
	            	   }
                      var linkData = {"header": fn_getHeader("CAPCA0138102"), "CaDataVldtnMgmtSvcExctnIn":sParam};

                      // ajax호출
                      bxProxy.post(sUrl, JSON.stringify(linkData), {
                          enableLoading: true
                          , success: function (responseData) {
                              if (fn_commonChekResult(responseData)) {
                              	that.inquiryPrsntList();
                              }
                          }   // end of suucess: fucntion
                      }); // end of bxProxy
                }
                
                ,resetSearch: function(){
                   	var that = this;
                	that.$el.find('#CAPCA013-search [data-form-param="cmpntCd"]').val('');
                	that.$el.find('#CAPCA013-search [data-form-param="tblNm"]').val('');
                	that.$el.find('#CAPCA013-search [data-form-param="columnNm"]').val('');
                	that.$el.find('#CAPCA013-search [data-form-param="vldtnWay"]').val('');
                	that.$el.find('#CAPCA013-search [data-form-param="inqryTrgt"]').val('');
                }
                
                , toggleGrid : function() {
                   	fn_pageLayerCtrl("#CAPCA013Grid-present-list");
                   }
                
                , toggleSearch : function() {
                	fn_pageLayerCtrl("#CAPCA013-search");
                }
            }); // end of Backbone.View.extend({



        return CAPCA013View;
    } // end of define function
)
; // end of define
