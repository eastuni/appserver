/**
@Screen number  CAPCA011
@brief          
@author         
@history        2018.08.14      생성
*/

define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPCA/011/_CAPCA011.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , ExtGrid
        , commonInfo
        ) {
    	
        /**
         * Backbone
         */
        var CAPCA011View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPCA011-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                	'click #btn-dataVldtn-search' : 'searchDataVldtnInfo',
					'click #btn-search-reset' : 'resetSearchCnd',
					'click #btn-search-toggle': 'toggleSearch',
					
					
					'click #btn-grid-toggle': 'toggleGrid',
					'click #btn-save-grid': 'saveGrid',
					'click #btn-CAPCA011-execute-validation': 'executeVldtn',
					
					
					'click #btn-CAPCA011-generate-sql' : 'generateSql',
					'click #btn-detail-save' : 'saveDataVldtnRuleInfo',
					'click #btn-detail-reset' : 'resetDetailInfo',
					'click #btn-detail-toggle': 'toggleDtl',

                
                }
                , initialize: function (initData) {
                    var that = this;
                    console.log(initData);
                    $.extend(that, initData);
                    that.$el.html(that.tpl());
                    that.initData = initData;
                    that.deleteList=[];
                    

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
                     
                    that.CAPCA011Grid = new ExtGrid({
                     	// 그리드 컬럼 정의
                     	fields: ['trgtYn','dataVldtnSqlId', 'cmpntCd', 'tblNm', 'columnNm', 'dataVldtnWayCd','seqNbr','dataVldtnDescCntnt','cpUseYn','apUseYn','dataVldtnUseYn',
                     	         'dataVldtnSqlCntnt','dataVldtnMysqlCntnt','dataVldtnOracleCntnt',
                     	         	{
		                     		name: 'checkTrgtYn',
		                            type: 'boolean',
		                            convert: function (value, record) {
		                                return record.get('trgtYn') === 'Y';
		                            	}
                     	         	}
                     			]
                     , id: 'CAPCA011Grid'
                 	, columns: [
                 	            { text: 'trgtYn'
           						, flex : 1
           						, height: 25
           						, xtype: 'checkcolumn'
                                   , columntype: 'checkbox'
           						, stopSelection: false
           						, header : '<input type="checkbox" />'
           						, listeners: {
           							
           						    click: function (_this, cell, rowIndex, eOpts) {
           						    	   console.log(new Date().getTime());
                                           currentRecord = that.CAPCA011Grid.store.getAt(rowIndex),
           						    	   console.log(new Date().getTime());
                                           changedChecked = !currentRecord.get('checkTrgtYn');
           						    	   console.log(new Date().getTime());
                                           var chnlDscd=$.sessionStorage('chnlDscd');//40 : config , 01 : admin
                                           console.log("ChnlDscd: ",chnlDscd);
           						    	   console.log(new Date().getTime());
                                           //데이터검증사용여부가 Y가 아니면 선택이 안되도록
                                           if(currentRecord.data.dataVldtnUseYn!=='Y'){return;}
                                           
                                           //CONFIG/ADMIN에 따라 CP사용여부 혹은 AP사용여부가 Y가 아니면 선택이 안되도록
                                          	if(chnlDscd==='40'){
                                           		if(currentRecord.data.cpUseYn!=='Y'){return;}
                                           	}else{
                                           		if(currentRecord.data.apUseYn!=='Y'){return;}
                                           	}
            						       console.log(new Date().getTime());
                                          	
                                           currentRecord.set('trgtYn', changedChecked ? 'Y' : 'N');
           						    	   console.log(new Date().getTime());
                                           currentRecord.set('checkTrgtYn', changedChecked);
                                       },
                                       headerclick: function(header, column, e, t,eOpts) {
                                           var selections = that.CAPCA011Grid.store.getRange(),
                                               i = 0,
                                               len = selections.length;
                                           	
                                           var chnlDscd=$.sessionStorage('chnlDscd');//40 : config , 01 : admin
                                           console.log("ChnlDscd: ",chnlDscd);
                                           that.CAPCA011Grid.store.suspendEvents();

                                           for (; i < len; i++) {
                                        	   var selected =that.CAPCA011Grid.store.getAt(i);
                                            //데이터검증사용여부가 Y가 아니면 선택이 안되도록
                                           	if(selected.data.dataVldtnUseYn!=='Y'){continue;}

                                            //CONFIG/ADMIN에 따라 CP사용여부 혹은 AP사용여부가 Y가 아니면 선택이 안되도록
                                           	if(chnlDscd==='40'){
                                           		if(selected.data.cpUseYn!=='Y'){continue;}
                                           	}else{
                                           		if(selected.data.apUseYn!=='Y'){continue;}
                                           	}

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
                                           that.CAPCA011Grid.store.resumeEvents();
                                           that.CAPCA011Grid.grid.getView().refresh();
                                           
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
                            {  
	         	            	text: bxMsg('cbb_items.SCRNITM#identifier')
         	            		, dataIndex: 'dataVldtnSqlId'
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
								text: bxMsg('cbb_items.SCRNITM#seqNbr')
								, dataIndex: 'seqNbr'
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
							 ,{text:bxMsg('cbb_items.AT#cpUseYn'), dataIndex: 'cpUseYn', flex: 2, style: 'text-align:center', align: 'center',
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
							  ,{text:bxMsg('cbb_items.AT#apUseYn'), dataIndex: 'apUseYn', flex: 2, style: 'text-align:center', align: 'center',
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
							  ,{text:bxMsg('cbb_items.AT#dataVldtnUseYn'), dataIndex: 'dataVldtnUseYn', flex: 2, style: 'text-align:center', align: 'center',
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
							  
				              , 
	                            {text: "", dataIndex: 'dataVldtnSqlCntnt', hidden : true}
				              , 
	                            {text: "", dataIndex: 'dataVldtnMysqlCntnt', hidden : true}
				              , 
	                            {text: "", dataIndex: 'dataVldtnOracleCntnt', hidden : true}
							  ,{
		                            xtype: 'actioncolumn',
		                            width: 80,
		                            flex : 2,
		                            align: 'center',
		                            text: bxMsg('cbb_items.SCRNITM#del'),
		                            style: 'text-align:center',
		                            items: [
		                                {
		                                    //  icon: 'images/icon/x-delete-16.png'
		                                    iconCls : "bw-icon i-25 i-func-trash",
		                                    tooltip: bxMsg('tm-layout.delete-field'),
		                                    handler: function (grid, rowIndex, colIndex, item, e, record) {
		                                    	that.initFlag = false;
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
                     			that.inquiryDetailInfo();
                     		}
                     	} 
                     }
                    });//end of CAPCA011Grid
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
                    
                    //오류상세조회화면에서 넘어온경우만
                    if(this.initData.param!=undefined){
                        this.inquiryDataForModifySql(this.initData.param);

                    }
                    


                    //배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPCA011-wrap #btn-save-grid')
                                        		,this.$el.find('.CAPCA011-wrap #btn-detail-save')
                                        			   ]);
                    
                    
                    return this.$el;
                	
                }
                /**
                 * grid생성
                 */
                , createGrid: function () {
                    var that = this;
                    this.$el.find(".CAPCA011Grid-base-list").html(this.CAPCA011Grid.render({'height': "400px"}));
                } // end of createGrid


                /**
                 * 콤보박스 셋팅
                 */
                ,setComboBoxes: function () {
                    var sParam = {};
                    
                    sParam = {};
                    sParam.className = "CAPCA011-cmpntCd-wrap";
                    sParam.targetId = "cmpntCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                    sParam.cdNbr = "A0012";
                    fn_getCodeList(sParam, this);   // 서비스컴포넌트코드
                
                    sParam = {};
                    sParam.className = "CAPCA011-vldtnWay-wrap";
                    sParam.targetId = "vldtnWay";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                    sParam.cdNbr = "A1556";
                    
                    fn_getCodeList(sParam, this);   // 서비스컴포넌트코드
                }
                
                
                
                
                
                /**
                 * 저장버튼 CAPCA0118501
                 */
                ,saveDataVldtnRuleInfo : function(){
                	var that = this;
                      var sParam = {};	
                      
	                    	//배포처리[과제식별자 체크]
	                  	if (!fn_headerTaskIdCheck()){
	   	                    return;
	   	                }
	                  	
                      sParam.dataVldtnSqlId = that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnSqlId"]').val().toUpperCase();
                      sParam.cmpntCd = that.$el.find('#CAPCA011-detail-table [data-form-param="cmpntCd"]').val();
                      sParam.tblNm = that.$el.find('#CAPCA011-detail-table [data-form-param="tblNm"]').val().toUpperCase();
                      sParam.columnNm = that.$el.find('#CAPCA011-detail-table [data-form-param="columnNm"]').val().toUpperCase();
                      sParam.dataVldtnWayCd = that.$el.find('#CAPCA011-detail-table [data-form-param="vldtnWay"]').val();
                      sParam.seqNbr = that.$el.find('#CAPCA011-detail-table [data-form-param="seqNbr"]').val();
                      sParam.dataVldtnDescCntnt = that.$el.find('#CAPCA011-detail-table [data-form-param="vldtnDesc"]').val();
                      sParam.dataVldtnSqlCntnt = that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnSqlCntnt"]').val();
                      sParam.dataVldtnMysqlCntnt = that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnMysqlCntnt"]').val();
                      sParam.dataVldtnOracleCntnt = that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnOracleCntnt"]').val();

                      if(that.$el.find('#CAPCA011-detail-table [data-form-param="cpUseYn"]').is(':checked')) { //cp사용여부
                      	sParam.cpUseYn = "Y";                	
                      } else {
                      	sParam.cpUseYn = "N";
                      }

                      if(that.$el.find('#CAPCA011-detail-table [data-form-param="apUseYn"]').is(':checked')) { //ap사용여부
                        	sParam.apUseYn = "Y";                	
                        } else {
                        	sParam.apUseYn = "N";
                        }

                      if(that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnUseYn"]').is(':checked')) { //데이터검증사용여부
                        	sParam.dataVldtnUseYn = "Y";                	
                        } else {
                        	sParam.dataVldtnUseYn = "N";
                        }
                      
                      console.log("저장서비스입력 : ",sParam);
                      
                      var linkData = {"header": fn_getHeader("CAPCA0118501"), "CaDataVldtnMgmtSvcRgstVldtnRuleIO":sParam};

                      // ajax호출
                      bxProxy.post(sUrl, JSON.stringify(linkData), {
                          enableLoading: true
                          , success: function (responseData) {
                              if (fn_commonChekResult(responseData)) {
                      			fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                      			//재조회
                    			that.searchDataVldtnInfo();
                            	  
                              }
                          }   // end of suucess: fucntion
                      }); // end of bxProxy
                	
                	
                	
                	
                }
                
                /**
                 * 조회버튼 CAPCA0118401
                 */
                ,searchDataVldtnInfo: function(){
                	var that = this;
                    var sParam = {};	 
                    that.deleteList=[];
                    sParam.cmpntCd = that.$el.find('#CAPCA011-search [data-form-param="cmpntCd"]').val();
                    sParam.tblNm = that.$el.find('#CAPCA011-search [data-form-param="tblNm"]').val().toUpperCase();
                    sParam.columnNm = that.$el.find('#CAPCA011-search [data-form-param="columnNm"]').val().toUpperCase();
                    sParam.dataVldtnWayCd = that.$el.find('#CAPCA011-search [data-form-param="vldtnWay"]').val();
                    sParam.dataVldtnSqlId = that.$el.find('#CAPCA011-search [data-form-param="dataVldtnSqlId"]').val().toUpperCase();
                	console.log("CaDataVldtnMgmtSvcGetDataVldtnInfoIn :",sParam);
                	
                    var linkData = {"header": fn_getHeader("CAPCA0118401"), "CaDataVldtnMgmtSvcGetDataVldtnInfoIn":sParam};

                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	var data =responseData.CaDataVldtnMgmtSvcGetDataVldtnInfoListOut.outList;
                            	that.CAPCA011Grid.setData(data);
                      		  	that.$el.find('#rsltCnt').html(data.length);                      		  	
                            	that.resetDetailInfo();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
              	
                }
                
                
                /**
                 * 기본속성셋팅
                 */
                ,inquiryDetailInfo: function(searchData){
                	var that = this;
                	if(searchData===undefined){
                        var searchData = that.CAPCA011Grid.grid.getSelectionModel().selected.items[0].data;
                	}
                	
                	console.log("clickGrid",searchData);

                    that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnSqlId"]').val(searchData.dataVldtnSqlId);
                    that.$el.find('#CAPCA011-detail-table [data-form-param="cmpntCd"]').val(searchData.cmpntCd);
                    
                    that.$el.find('#CAPCA011-detail-table [data-form-param="tblNm"]').val(searchData.tblNm);
                    that.$el.find('#CAPCA011-detail-table [data-form-param="columnNm"]').val(searchData.columnNm);
                    that.$el.find('#CAPCA011-detail-table [data-form-param="vldtnWay"]').val(searchData.dataVldtnWayCd);
                    that.$el.find('#CAPCA011-detail-table [data-form-param="seqNbr"]').val(searchData.seqNbr);
                    that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnSqlId"]').val(searchData.dataVldtnSqlId);
                    that.$el.find('#CAPCA011-detail-table [data-form-param="vldtnDesc"]').val(searchData.dataVldtnDescCntnt);
                    that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnSqlCntnt"]').val(searchData.dataVldtnSqlCntnt);
                    that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnMysqlCntnt"]').val(searchData.dataVldtnMysqlCntnt);
                    that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnOracleCntnt"]').val(searchData.dataVldtnOracleCntnt);
                   // CP사용여부
	                if(searchData.cpUseYn == "Y") {
	                	that.$el.find('#CAPCA011-detail-table [data-form-param="cpUseYn"]').prop("checked", true);
	                }
	                else {
	                	that.$el.find('#CAPCA011-detail-table [data-form-param="cpUseYn"]').prop("checked", false);
	                }
                    // AP사용여부
	                if(searchData.apUseYn == "Y") {
	                	that.$el.find('#CAPCA011-detail-table [data-form-param="apUseYn"]').prop("checked", true);
	                }
	                else {
	                	that.$el.find('#CAPCA011-detail-table [data-form-param="apUseYn"]').prop("checked", false);
	                }
	                // 데이터검증사용여부
	                if(searchData.dataVldtnUseYn == "Y") {
	                	that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnUseYn"]').prop("checked", true);
	                }
	                else {
	                	that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnUseYn"]').prop("checked", false);
	                }
	                
                    that.$el.find('#CAPCA011-detail-table [data-form-param="cmpntCd"]').prop("disabled", true); 
                    that.$el.find('#CAPCA011-detail-table [data-form-param="tblNm"]').prop("disabled", true); 
                    that.$el.find('#CAPCA011-detail-table [data-form-param="columnNm"]').prop("disabled", true); 
	                
                }
                
                
                /**
                 * sql변환버튼 CAPCA0118502
                 */
                ,generateSql: function(){
                 	var that = this;
                 
                 	
                 	function generate(){
                 	var sParam = {};	
                	
                    
                    sParam.dataVldtnSqlCntnt = that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnSqlCntnt"]').val();
                	
                    var linkData = {"header": fn_getHeader("CAPCA0118502"), "CaDataVldtnMgmtSvcGenDataVldtnSqlIO":sParam};

                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	var data =responseData.CaDataVldtnMgmtSvcGenDataVldtnSqlIO;
                            	 that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnMysqlCntnt"]').val(data.dataVldtnMysqlCntnt);
                            	 that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnOracleCntnt"]').val(data.dataVldtnOracleCntnt);
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }
    	          	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#gnrtSql'), bxMsg('cbb_items.SCRNITM#sql-generate-msg'), generate, this);

                	
                }
                
                /**
                 * 검증수행버튼 CAPCA0138102
                 */
                ,executeVldtn:function(){
                	
              	  var that = this;
                  var gridAllData = that.CAPCA011Grid.getAllData();
                  var sParam = {};	
               	  sParam.dataVldtnSqlId=[];
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
                    			fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                    			that.searchDataVldtnInfo();
                          }
                      }   // end of suucess: fucntion
                  }); // end of bxProxy
                }
                
                /**
                 * 그리드 저장(deleteList 삭제) CAPCA0118301
                 */
                ,saveGrid:function(){
                	
                	var that = this;
          	
                  	//배포처리[과제식별자 체크]
                	if (!fn_headerTaskIdCheck()){
 	                    return;
 	                }
                	
                	if(that.deleteList.length<=0){
                       	fn_alertMessage("", bxMsg('cbb_err_msg.AUIATE0009'));
                       	//삭제할 자료가 없습니다.
                       	return;
                	}
                	
                 	function deleteData(){
                 	 var sParam = {};	
                    
                 	 sParam.dataVldtnSqlId=[];

                 	 if(that.deleteList.length>0){
                 		   $(that.deleteList).each(function(idx,data){
                 			   sParam.dataVldtnSqlId.push(data.dataVldtnSqlId);
                 		   });
                 	   }
                	
                    var linkData = {"header": fn_getHeader("CAPCA0118301"), "CaDataVldtnMgmtSvcExctnIn":sParam};

                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
		                        fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
		                        that.deleteList = [];
                    			that.searchDataVldtnInfo();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }
    	          	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), deleteData, this);

                	
                }
                
                
                /**
                 * CAPCA014화면에서 SQL수정 버튼을 통해 들어왔을때 타야하는 로직들
                 *  1. 검색조건셋팅
                 *  2. 검색
                 *  3. 상세정보셋팅
                 */
                ,inquiryDataForModifySql : function (param){

                	console.log("inquiryDataForModifySql: ",param);
                	
                	//검색조건셋팅
              	   this.$el.find('#CAPCA011-search [data-form-param="cmpntCd"]').val(param.cmpntCd);
              	   this.$el.find('#CAPCA011-search [data-form-param="tblNm"]').val(param.tblNm.toUpperCase());
              	   this.$el.find('#CAPCA011-search [data-form-param="columnNm"]').val(param.columnNm.toUpperCase());
              	   this.$el.find('#CAPCA011-search [data-form-param="dataVldtnSqlId"]').val(param.dataVldtnSqlId.toUpperCase());
              	   
              	   //검색
              	   this.searchDataVldtnInfo();
              	   
              	   //상세정보 셋팅
              	   this.inquiryDataVldtnInfoBySqlId(param.dataVldtnSqlId);
                } 
                
                /**
                 * dataVldtnSqlId로 검증정보조회 CAPCA0118402
                 */
                ,inquiryDataVldtnInfoBySqlId:function(sqlId){
                	var that = this;

	              	 var sParam = {};	
	                 
	             	 sParam.dataVldtnSqlId=sqlId;
	            	
	                var linkData = {"header": fn_getHeader("CAPCA0118402"), "CaDataVldtnMgmtSvcGetDataVldtnInfoIn":sParam};
	
	                // ajax호출
	                bxProxy.post(sUrl, JSON.stringify(linkData), {
	                    enableLoading: true
	                    , success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                        	//기본속성테이블데이터셋팅
	                        	that.inquiryDetailInfo(responseData.CaDataVldtnMgmtSvcGetDataVldtnInfoOut)
	                        }
	                    }   // end of suucess: fucntion
	                }); // end of bxProxy
               
                }
                
                /**
                 * reset
                 */
                
                ,resetDetailInfo: function(){
                	var that = this;

                	  that.$el.find('#CAPCA011-detail-table [data-form-param="cmpntCd"]').prop("disabled", false); 
                      that.$el.find('#CAPCA011-detail-table [data-form-param="tblNm"]').prop("disabled", false); 
                      that.$el.find('#CAPCA011-detail-table [data-form-param="columnNm"]').prop("disabled", false); 
                      
                      that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnSqlId"]').val('');
                      that.$el.find('#CAPCA011-detail-table [data-form-param="cmpntCd"]').val('');
                      that.$el.find('#CAPCA011-detail-table [data-form-param="tblNm"]').val('');
                      that.$el.find('#CAPCA011-detail-table [data-form-param="columnNm"]').val('');
                      that.$el.find('#CAPCA011-detail-table [data-form-param="vldtnWay"]').val('');
                      that.$el.find('#CAPCA011-detail-table [data-form-param="seqNbr"]').val('');
                      that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnSqlId"]').val('');
                      that.$el.find('#CAPCA011-detail-table [data-form-param="vldtnDesc"]').val('');
                      that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnSqlCntnt"]').val('');
                      that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnMysqlCntnt"]').val('');
                      that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnOracleCntnt"]').val('');
                      that.$el.find('#CAPCA011-detail-table [data-form-param="cpUseYn"]').prop("checked", true);
                      that.$el.find('#CAPCA011-detail-table [data-form-param="apUseYn"]').prop("checked", true);
                      that.$el.find('#CAPCA011-detail-table [data-form-param="dataVldtnUseYn"]').prop("checked", true);
  	                
                }
                
                ,resetSearchCnd: function(){
                	var that = this;
                	that.$el.find('#CAPCA011-search [data-form-param="cmpntCd"]').val('');
                	that.$el.find('#CAPCA011-search [data-form-param="tblNm"]').val('');
                	that.$el.find('#CAPCA011-search [data-form-param="columnNm"]').val('');
                	that.$el.find('#CAPCA011-search [data-form-param="vldtnWay"]').val('');
                	that.$el.find('#CAPCA011-search [data-form-param="dataVldtnSqlId"]').val('');
                	
                }
                

                
                /**
                 * toggle
                 */
                , toggleGrid : function() {
                   	fn_pageLayerCtrl("#CAPCA011Grid-base-list");
                   }
                , toggleSearch : function() {
                	fn_pageLayerCtrl("#CAPCA011-search");
                }
                , toggleDtl : function() {
                	fn_pageLayerCtrl("#CAPCA011-detail-table");
                }
 
                
                
                
            }); // end of Backbone.View.extend({

        return CAPCA011View;
    } // end of define function
)
; // end of define
