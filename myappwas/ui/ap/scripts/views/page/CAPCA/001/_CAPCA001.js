/**
@Screen number  CAPCA001
@brief          
@author         
@history        2018.07.25      생성
*/

define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPCA/001/_CAPCA001.html'
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

        /**
         * Backbone
         */
        var CAPCA001View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPCA001-page'
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
						, 'click #btn-CAPCA001-search-error' : 'inquiryErrorData'
							
                }
                , initialize: function (initData) {
                    var that = this;

                    $.extend(that, initData);
                    that.$el.html(that.tpl());

                    that.initData = initData;
                    
                    that.CAPCA001BasicGrid = new ExtGrid({
                     	// 그리드 컬럼 정의
                     	fields: ['rowIndex', 'dstbCtvdDt', 'dstbCtvdSeqNbr', 'dstbCtvdStartHms', 'dstbCtvdEndHms', 'dstbCtvdRsltCd',
                     	         'dstbRqstId','dstbCtvdRqstDt' ,'dstbCtvdRqstSeqNbr','detailList']
                     , id: 'CAPCA001BasicGrid'
                 	, columns: [
							{
							    text: 'No.',
							    dataIndex: 'rowIndex',
							    sortable: false,
							    width : 50,
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
	         	            	text: bxMsg('cbb_items.SCRNITM#vdDt')
         	            		, dataIndex: 'dstbCtvdDt'
     	            			, flex : 1
     	            			, style: 'text-align:center'
 	            				, align: 'center'
 	            				, type: 'date'
 	                            , renderer : function(value) {
 	                                    return XDate(value).toString('yyyy-MM-dd');
 	                                }
             	            }
							,
             	            {
	         	            	text: bxMsg('cbb_items.SCRNITM#vdSeqNbr')
         	            		, dataIndex: 'dstbCtvdSeqNbr'
     	            			, width : 80
     	            			, style: 'text-align:center'
 	            				, align: 'center'
             	            }
							,
             	            {
	         	            	text: bxMsg('cbb_items.AT#vldtnStartHms')
         	            		, dataIndex: 'dstbCtvdStartHms'
     	            			, flex : 1
     	            			, style: 'text-align:center'
 	            				, align: 'center'
 	            				, renderer : function(value) {
 	                                    return fn_setTimeValue(value);
 	                                }
             	            }
							,
             	            {
	         	            	text: bxMsg('cbb_items.AT#vldtnEndHms')
         	            		, dataIndex: 'dstbCtvdEndHms'
     	            			, flex : 1
     	            			, style: 'text-align:center'
 	            				, align: 'center'
 	            				, renderer : function(value) {
 	                                    return fn_setTimeValue(value);
 	                                } 	            					
             	            },
             	           {
                               text: bxMsg('cbb_items.SCRNITM#dstbCtvdRslt'),
                               flex: 1,
                               dataIndex: 'dstbCtvdRsltCd',
                               style: 'text-align:center',
                               align: 'center',
                               code: 'A1515',
                               renderer: function (val) {
                                   return val ? bxMsg('cbb_items.CDVAL#A1515' + val) : '';
                               }
                           },
             	            {
	         	            	text: bxMsg('cbb_items.AT#dstbRqstId')
         	            		, dataIndex: 'dstbRqstId'
     	            			, flex : 1
     	            			, style: 'text-align:center'
 	            				, align: 'center'
             	            }
							,
             	            {
	         	            	text: bxMsg('cbb_items.AT#dstbCtvdRqstDt')
         	            		, dataIndex: 'dstbCtvdRqstDt'
     	            			, flex : 1
     	            			, style: 'text-align:center'
 	            				, align: 'center'
 	            				, type: 'date'
 	    	                    , renderer : function(value) {
 	    	                                    return XDate(value).toString('yyyy-MM-dd');
 	    	                                }
             	            }
							,
             	            {
	         	            	text: bxMsg('cbb_items.AT#dstbCtvdRqstSeqNbr')
         	            		, dataIndex: 'dstbCtvdRqstSeqNbr'
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
                    });//end of CAPCA001BasicGrid
                    
                    that.CAPCA001DetailGrid = new ExtGrid({
                     	// 그리드 컬럼 정의
                     	fields: ['rowIndex','dstbSrvrId','dstbTblId','dstbCtvdPrgrsCd','dstbCtvdOriginCnt','dstbCtvdTrgtCnt','dstbCtvdErrCnt','dstbCtvdStartHms','dstbCtvdEndHms']
                     , id: 'CAPCA001DetailGrid'
                 	, columns: [
             	            {
	                            text: 'No.',
	                            dataIndex: 'rowIndex',
	                            sortable: false,
	                            width : 70,
	                            height : 25,
	                            style: 'text-align:center',
	                            align: 'center',
	                            // other config you need....
	                            renderer: function (value, metaData, record, rowIndex) {
	                                return rowIndex + 1;
	                            }
             	            },
             	            {
                                text: bxMsg('cbb_items.AT#dstbSrvrNm'),
                                dataIndex: 'dstbSrvrId',
                                width : 150,
                                style: 'text-align:center',
                                align: 'center',
                                code: 'A1526',
                                renderer: function (val) {
                                    return val ? bxMsg('cbb_items.CDVAL#A1526' + val) : '';
                                }
                            },
            	            {
	         	            	text: bxMsg('cbb_items.AT#tblNm')
        	            		, dataIndex: 'dstbTblId'
    	            			, flex : 1
    	            			, style: 'text-align:center'
	            				, align: 'center'
            	            },
            	            {
                                text: bxMsg('cbb_items.AT#dstbCtvdPrgrsCd'),
                                flex: 1,
                                dataIndex: 'dstbCtvdPrgrsCd',
                                style: 'text-align:center',
                                align: 'center',
                                code: 'A1506',
                                renderer: function (val) {
                                    return val ? bxMsg('cbb_items.CDVAL#A1506' + val) : '';
                                }
                            },
            	            {
	         	            	text: bxMsg('cbb_items.SCRNITM#cpCnt')
        	            		, dataIndex: 'dstbCtvdOriginCnt'
    	            			, width : 90
    	            			, style: 'text-align:center'
	            				, align: 'center'
            	            },
            	            {
	         	            	text: bxMsg('cbb_items.SCRNITM#trgtCnt')
        	            		, dataIndex: 'dstbCtvdTrgtCnt'
    	            			, width : 90
    	            			, style: 'text-align:center'
	            				, align: 'center'
            	            },
            	            {
	         	            	text: bxMsg('cbb_items.AT#errCnt')
        	            		, dataIndex: 'dstbCtvdErrCnt'
    	            			, width : 90
    	            			, style: 'text-align:center'
	            				, align: 'center'
            	            },
            	            {
	         	            	text: bxMsg('cbb_items.AT#vldtnStartHms')
        	            		, dataIndex: 'dstbCtvdStartHms'
    	            			, width : 150
    	            			, style: 'text-align:center'
	            				, align: 'center'
	            				, renderer : function(value) {
	                                    return fn_setTimeValue(value);
	                                }
            	            },
            	            {
	         	            	text: bxMsg('cbb_items.AT#vldtnEndHms')
        	            		, dataIndex: 'dstbCtvdEndHms'
    	            			, width : 150
    	            			, style: 'text-align:center'
	            				, align: 'center'
	            				, renderer : function(value) {
	                                    return fn_setTimeValue(value);
	                                }
            	            }
                 	  ] // end of columns

                    , listeners: {
                     	click:{
                     		element: 'body'
                     		, fn: function () {
                     			that.clickDetailGrid();
                 			}
                     	} 
                     }
                    });//end of CAPCA001DetailGrid
                    
                } //END OF initialize
                
                /**
                 * render
                 */
                ,render : function (){
                	
                    this.$el.html(this.tpl());
                    this.$el.find(".CAPCA001Grid-validation-info").html(this.CAPCA001BasicGrid.render({'height': "200px"}));
                    this.$el.find(".CAPCA001Grid-detail-list").html(this.CAPCA001DetailGrid.render({'height': "400px"}));
                    
                    this.setDatePicker();
                    
                 // 콤보데이터 로딩
                    var sParam = {};

                    //배포상태
                    sParam = {};
                    sParam.className = "CAPCA001-base-dstbCtvdRslt-wrap";
                    sParam.targetId = "dstbCtvdRslt";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                    sParam.cdNbr = "A1515";
                    fn_getCodeList(sParam, this);
                    
                	//배포처리반영[버튼비활성화]
//                    this.resetDistributionBtn();
                    return this.$el;
                	
                } //end of render
//                , resetDistributionBtn : function(){
//                	//배포처리반영[버튼비활성화]
//                    fn_btnCheckForDistribution([
//                                        		this.$el.find('.CAPCA001-wrap #btn-service-save')
//                                        		]);
//                }

                , inquiryBaseData: function () {
                    var that = this;

                    that.CAPCA001DetailGrid.resetData();
                    
                    var sParam = {};
                    var qryStartDt = that.$el.find('.CAPCA001-search [data-form-param="vldtnStartDt"]').val();
                    var qryEndDt = that.$el.find('.CAPCA001-search [data-form-param="vldtnEndDt"]').val();
                    
                    if(qryStartDt != ''){
                    	sParam.qryStartDt = fn_getDateValue(qryStartDt);
                    }else{
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#vldtnStartDt')+"]");
	                  	return;
                    }
                    
                    if(qryEndDt != ''){
                    	sParam.qryEndDt = fn_getDateValue(qryEndDt);
                    }else{
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#vldtnEndDt')+"]");
	                  	return;
                    }
                    
                    sParam.dstbTblId = that.$el.find('.CAPCA001-search [data-form-param="dstbTblId"]').val();
                    sParam.dstbCtvdRsltCd = that.$el.find('.CAPCA001-search [data-form-param="dstbCtvdRslt"]').val();
                    
//                    var srchStartDtm = that.$el.find('#CAPSV302additionalSearchCndWrap [data-form-param="srchStartDtm"]').val();
//                    var srchEndDtm = that.$el.find('#CAPSV302additionalSearchCndWrap [data-form-param="srchEndDtm"]').val();
//                    if(srchStartDtm != ''){
//                    	sParam.srchStartDtm = fn_getDateValue(srchStartDtm) + "000000";
//                    }
//                    if(srchEndDtm != ''){
//                    	sParam.srchEndDtm = fn_getDateValue(srchEndDtm) + "235959";
//                    }
                    
                    console.log("###b check service1 call parm",sParam);
    
                    var linkData = {"header": fn_getHeader("CAPCA0018401"), "DstbCtvdSrchListIn": sParam};

                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	var data = responseData.CaDstbCtvdSrchRsltListOut;
                            	console.log("###b check service1 data",data);
                            	data = responseData.CaDstbCtvdSrchRsltListOut.srchOutList;
                            	
                            	that.CAPCA001BasicGrid.setData(data)
                            	
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                } // end
                
                , inquiryErrorData: function () {
                    
                	var that = this;
                    var basicData = that.CAPCA001BasicGrid.grid.getSelectionModel().selected.items[0].data;
                    var datailData = that.CAPCA001DetailGrid.grid.getSelectionModel().selected.items[0].data;
                    
                    console.log("check selected detail grid in inquiryErrData1",basicData);
                    console.log("check selected detail grid in inquiryErrData2",datailData);
                    
                    var dstbCtvdDt = basicData.dstbCtvdDt;
                    var dstbCtvdSeqNbr = basicData.dstbCtvdSeqNbr;
                    var dstbSrvrId = datailData.dstbSrvrId;
                    var dstbTblId = datailData.dstbTblId;
                	
                	that.$el.trigger({
                		type: 'open-conts-page',
                		pageHandler: 'CAPCA002',
                		pageDPName: bxMsg('cbb_items.SCRN#CAPCA002'),
                		pageInitialize: true,
                		pageRenderInfo: {
                			dstbCtvdDt : dstbCtvdDt,
                			dstbCtvdSeqNbr : dstbCtvdSeqNbr,
                			dstbSrvrId : dstbSrvrId,
                			dstbTblId : dstbTblId
                		}
                	});
                    
                } // end
                
                ,clickBaseGrid : function(){
                	var that = this;
                	that.CAPCA001DetailGrid.resetData();
                	that.setVisibleErrorBtn(false);
                	
                	var selectedRecord = that.CAPCA001BasicGrid.grid.getSelectionModel().selected.items[0];
                	
                	console.log("###b select record",selectedRecord);
                	if (!selectedRecord) {
                		return;
                	} else {
                		var data = selectedRecord.data.detailList;
                		console.log("###b click grid detail data", data);
                		that.CAPCA001DetailGrid.setData(data)
                	}
                }
                
                ,clickDetailGrid : function(){
                	var that = this;
                	var selectedRecord = that.CAPCA001BasicGrid.grid.getSelectionModel().selected.items[0];
                	var selectedDetailRecord = that.CAPCA001DetailGrid.grid.getSelectionModel().selected.items[0];
            		
            		if(selectedRecord.data.dstbCtvdRsltCd == "02" && (selectedDetailRecord.data.dstbCtvdErrCnt)*1>0 ){
            			that.setVisibleErrorBtn(true);
            		}else{
            			that.setVisibleErrorBtn(false);
            		}
                }
                
                , setVisibleErrorBtn: function(valid){
                	var that = this;
                	var $errBtn = that.$el.find('#btn-CAPCA001-search-error');
                	
                	if (valid){
                        $errBtn.show();
                      } else {
                        $errBtn.hide();
                      }
                    }
                
                //검색조건 부분 초기화
               , resetSearch: function () {
            	   var that = this;
            	   console.log("reset");
            	   that.CAPCA001BasicGrid.resetData();
            	   that.CAPCA001DetailGrid.resetData();
            	   
            	   that.setDatePicker();
                   that.$el.find('.CAPCA001-search [data-form-param="dstbTblId"]').val('');
                   that.$el.find('.CAPCA001-search [data-form-param="dstbCtvdRslt"]').val('');
                   
               },
               setDatePicker: function () {
                   fn_makeDatePicker(this.$el.find('#CAPCA001-search [data-form-param="vldtnStartDt"]'));
                   fn_makeDatePicker(this.$el.find('#CAPCA001-search [data-form-param="vldtnEndDt"]'));
               }
               /*
                * toogle
                */
               , toggleSearch : function() {
               	fn_pageLayerCtrl("#CAPCA001-search");
               }
               , toggleGrid1 : function() {
               	fn_pageLayerCtrl("#CAPCA001Grid-validation-info");
               }
               , toggleGrid2 : function() {
            	   fn_pageLayerCtrl("#CAPCA001Grid-detail-list");
               }
               
            }); // end of Backbone.View.extend({


        return CAPCA001View;
    } // end of define function
)
; // end of define
