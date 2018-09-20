/**
@Screen number  CAPCA002
@brief          
@author         
@history        2018.07.25      생성
*/

define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPCA/002/_CAPCA002.html'
        , 'bx-component/date-picker/_date-picker'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , DatePicker
        , ExtGrid
        , commonInfo
        ) {
    	
    	var comboStore1 = {}; // 배포서버식별자코드
    	
        /**
         * Backbone
         */
        var CAPCA002View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPCA002-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
						  'click #btn-search-toggle': 'toggleSearch'
						, 'click #btn-grid-toggle1': 'toggleGrid1'
					    , 'click #btn-grid-toggle2': 'toggleGrid2'
							
						, 'click #btn-search-reset' : 'resetSearch'
						, 'click #btn-xtn-search' : 'inquiryBaseData'
                }
                , initialize: function (initData) {
                    var that = this;

                    $.extend(that, initData);
                    that.$el.html(that.tpl());
                    that.initData = initData;
                    
                    console.log("###b chk initData",initData);
                    
                    var header = fn_getHeader("CAPCM0038400");
                    var sParam = {};
                    sParam.cdNbr = "A1526";
                    var linkData1 = {
                        "header": header,
                        "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                    };
                    
                    bxProxy.all([
                  	              // 상품대분류코드
                                   {
                                       url: sUrl,
                                       param: JSON.stringify(linkData1),
                                       success: function (responseData) {
                                           if (fn_commonChekResult(responseData)) {
                                               comboStore1 = new Ext.data.Store({
                                                   fields: ['cd', 'cdNm'],
                                                   data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                               });
                                           }
                                       }
                                   }
                                ], { success: function () {
                                	   		console.log("in bxProxy callback success",comboStore1);
                                	   		//param.dstbSrvrNm = cdNm
                                     	   var index = comboStore1.findExact('cd', initData.param.dstbSrvrId);
                                     	   if (index != -1) {
                                                rs = comboStore1.getAt(index).data;
                                                that.$el.find('#CAPCA002-search [data-form-param="dstbSrvrId"]').val(rs.cdNm);
                                            }
                                   } }
                    );
                    

                    that.CAPCA002BasicGrid = new ExtGrid({
                     	// 그리드 컬럼 정의
                     	fields: ['rowIndex', 'dstbCtvdErrKndCd', 'dstbCtvdPkCntnt', 'dstbCtvdOriginCntnt', 'dstbCtvdTrgtCntnt']
                     , id: 'CAPCA002BasicGrid'
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
							,
             	            {
	         	            	text: bxMsg('cbb_items.SCRNITM#errTpCd')
         	            		, dataIndex: 'dstbCtvdErrKndCd'
     	            			, width : 100
     	            			, style: 'text-align:center'
 	            				, align: 'center'
             	            }
							,
             	            {
	         	            	text: bxMsg('cbb_items.SCRNITM#pkCntnt')
         	            		, dataIndex: 'dstbCtvdPkCntnt'
     	            			, width : 120
     	            			, style: 'text-align:center'
 	            				, align: 'center'
             	            }
							,
             	            {
	         	            	text: bxMsg('cbb_items.SCRNITM#cpCntnt')
         	            		, dataIndex: 'dstbCtvdOriginCntnt'
     	            			, flex : 1
     	            			, style: 'text-align:center'
 	            				, align: 'center'
             	            }
							,
             	            {
	         	            	text: bxMsg('cbb_items.SCRNITM#apCntnt')
         	            		, dataIndex: 'dstbCtvdTrgtCntnt'
     	            			, flex : 1
     	            			, style: 'text-align:center'
 	            				, align: 'center'
             	            }
                 	  ] // end of columns

                    , listeners: {
                     	click:{
                     		element: 'body'
                     		, fn: function () {
                     			that.clickBaseGrid();
                 			}
                     	} 
                     }
                    });//end of CAPCA002BasicGrid
                    
                    that.CAPCA002DetailGrid = new ExtGrid({
                     	// 그리드 컬럼 정의
                     	fields: ['rowIndex','dstbCtvdErrKndCd','dstbCntnt']
                     , id: 'CAPCA002DetailGrid'
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
             	            },
            	            {
	         	            	text: bxMsg('cbb_items.SCRNITM#cntntLctn')
        	            		, dataIndex: 'dstbCtvdErrKndCd'
    	            			, width : 150
    	            			, style: 'text-align:center'
	            				, align: 'center'
            	            },
            	            {
	         	            	text: bxMsg('cbb_items.AT#cntnt')
        	            		, dataIndex: 'dstbCntnt'
    	            			, flex : 1
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
                    });//end of CAPCA002DetailGrid
                    
                } //END OF initialize
                
                /**
                 * render
                 */
                ,render : function (){
                	
                    this.$el.html(this.tpl());
                    this.$el.find(".CAPCA002Grid-base-list").html(this.CAPCA002BasicGrid.render({'height': "200px"}));
                    this.$el.find(".CAPCA002Grid-detail-list").html(this.CAPCA002DetailGrid.render({'height': "400px"}));
                    
                    this.setDatePicker();
                    this.setParamData(this.initData.param);
             	   
                    this.inquiryBaseData();
                    
                    return this.$el;
                	
                } 
                
                , inquiryBaseData: function () {
                    var that = this;

                    that.CAPCA002DetailGrid.resetData();
                    
                    var sParam = {};
                    var dstbCtvdDt = that.$el.find('#CAPCA002-search [data-form-param="dstbCtvdDt"]').val();
                    
                    if(dstbCtvdDt != ''){
                    	sParam.dstbCtvdDt = fn_getDateValue(dstbCtvdDt);
                    }else{
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbCtvdDt')+"]");
	                  	return;
                    }
                    
                    sParam.dstbCtvdSeqNbr = that.$el.find('#CAPCA002-search [data-form-param="dstbCtvdSeqNbr"]').val();
                    if(fn_isNull(sParam.dstbCtvdSeqNbr)){
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#dstbCtvdSeqNbr')+"]");
	                  	return;
                    }
                    
                    sParam.dstbTblId = that.$el.find('#CAPCA002-search [data-form-param="dstbTblId"]').val();
//                    sParam.dstbSrvrId = that.$el.find('#CAPCA002-search [data-form-param="dstbSrvrId"]').val();
                    sParam.dstbSrvrId = that.initData.param.dstbSrvrId;
                    
                    console.log("###b check service### call parm",sParam);
    
                    var linkData = {"header": fn_getHeader("CAPCA0028401"), "DstbCtvdRsltErrSrchIn": sParam};

                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	var data = responseData.CaDstbCtvdRsltErrSrchListOut.errRsltList;
                            	
                            	that.CAPCA002BasicGrid.setData(data)
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                } // end
                
                ,clickBaseGrid : function(){
                	var that = this;
                	that.CAPCA002DetailGrid.resetData();
                	
                	var selectedRecord = that.CAPCA002BasicGrid.grid.getSelectionModel().selected.items[0];
                	
                	console.log("###b select record",selectedRecord);
                	if (!selectedRecord) {
                		return;
                	} else {
                		var data = selectedRecord.data; //cp 내용, ap 내용이 있는 경우 각각 설정
                		var dataArray = [];
                		var sParam1 = {};
                		var sParam2 = {};
                		
                		if(!fn_isNull(data.dstbCtvdOriginCntnt)){
                			sParam1.dstbCtvdErrKndCd = "CP";
                			sParam1.dstbCntnt = data.dstbCtvdOriginCntnt;
                			
                			dataArray.push(sParam1);
                		}
              			if(!fn_isNull(data.dstbCtvdTrgtCntnt)){
                			sParam2.dstbCtvdErrKndCd = "AP"
                			sParam2.dstbCntnt = data.dstbCtvdTrgtCntnt;
                			
                			dataArray.push(sParam2);
              			}
                		console.log("###b set detail data", dataArray);
                		that.CAPCA002DetailGrid.setData(dataArray)
                	}
                }
                
               ,setParamData : function (param){
            	   
            	   this.$el.find('#CAPCA002-search [data-form-param="dstbCtvdDt"]').val(fn_setDateValue(param.dstbCtvdDt));
            	   this.$el.find('#CAPCA002-search [data-form-param="dstbCtvdSeqNbr"]').val(param.dstbCtvdSeqNbr);
//            	   this.$el.find('#CAPCA002-search [data-form-param="dstbSrvrId"]').val(param.dstbSrvrId);
//            	   this.$el.find('#CAPCA002-search [data-form-param="dstbSrvrId"]').val(param.dstbSrvrNm);
            	   this.$el.find('#CAPCA002-search [data-form-param="dstbTblId"]').val(param.dstbTblId);
            	   
            	   this.$el.find('#CAPCA002-search .bw-input').prop("readonly",true);
            	   this.$el.find('#CAPCA002-search [data-form-param="dstbSrvrId"]').prop("disabled",true);
               } 
               ,setDatePicker: function () {
                   fn_makeDatePicker(this.$el.find('#CAPCA002-search [data-form-param="dstbCtvdDt"]'));
               }
               /*
                * toogle
                */
               , toggleSearch : function() {
               	fn_pageLayerCtrl("#CAPCA002-search");
               }
               , toggleGrid1 : function() {
               	fn_pageLayerCtrl("#CAPCA002Grid-base-list");
               }
               , toggleGrid2 : function() {
            	   fn_pageLayerCtrl("#CAPCA002Grid-detail-list");
               }
               
            }); // end of Backbone.View.extend({


        return CAPCA002View;
    } // end of define function
)
; // end of define
