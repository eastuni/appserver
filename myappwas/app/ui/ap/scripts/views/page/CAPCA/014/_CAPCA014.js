/**
@Screen number  CAPCA014
@brief          
@author         
@history        2018.08.14      생성
*/

define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPCA/014/_CAPCA014.html'
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
        var CAPCA014View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPCA014-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
    				  'click #btn-search-toggle': 'toggleSearch',
    				  'click #btn-grid-toggle': 'toggleGrid',
    				  'click #btn-detail-toggle': 'toggleDtl',
    	              'click #btn-grid-excel': 'downloadGridDataWithExcel',
    	              
    	              
    	              
    	              'click #btn-CAPCA013-modifySql': 'modifySql',

                	
                }
                , initialize: function (initData) {
                    var that = this;
                    $.extend(that, initData);
                    that.$el.html(that.tpl());
                    that.initData = initData;
                    
                    console.log("###b chk initData",initData);
                  
                    that.CAPCA014Grid = new ExtGrid({
                     	// 그리드 컬럼 정의
                     	fields: ['rowIndex','cmpntCd', 'tblNm', 'columnNm','dataVldtnRsltCntnt']
                     , id: 'CAPCA014Grid'
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
 	            				, align: 'center'
             	            }
							,
             	            {
	         	            	text: bxMsg('cbb_items.AT#columnNm')
         	            		, dataIndex: 'columnNm'
     	            			, flex : 3
     	            			, style: 'text-align:center'
 	            				, align: 'center'
             	            }
							,
             	      
							{
								text: bxMsg('cbb_items.AT#dataVldtnRsltCntnt')
								, dataIndex: 'dataVldtnRsltCntnt'
									, flex : 8
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
                    });//end of CAPCA014Grid
                    
                } //END OF initialize
                
                /**
                 * render
                 */
                ,render : function (){
                	
                    this.$el.html(this.tpl());
                    this.$el.find(".CAPCA014Grid-err-list").html(this.CAPCA014Grid.render({'height': "600px"}));
                    this.setComboBoxes();
                    this.setParamData(this.initData.param);
                    this.inquiryErrList();

                    return this.$el;
                	
                }
                
                
                ,inquiryErrList : function (){
                    var that = this;
                    that.CAPCA014Grid.resetData();
                    var sParam = {};
                    console.log(that.initData);
                    sParam.exctnSeqNbr=that.initData.param.exctnSeqNbr;
                    sParam.dataVldtnSqlId =that.initData.param.dataVldtnSqlId;
                    
                    var linkData = {"header": fn_getHeader("CAPCA0148401"), "CaDataVldtnMgmtSvcExctnInfo": sParam};

                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	var data = responseData.CaDataVldtnMgmtSvcGetDataVldtnErrDtlListOut.errList;
                            	
                            	that.CAPCA014Grid.setData(data)
                      		  	that.$el.find('#CAPCA014-search [data-form-param="dataVldtnSqlCntnt"]').val(data[0].dataVldtnSqlCntnt);
                            	that.$el.find('#rsltCnt').html(data.length);                      		  	

                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy

                }
                
                ,modifySql:function(){
                	var that = this;
                    
                    var dataVldtnSqlId = that.initData.param.dataVldtnSqlId;
                    var cmpntCd =that.initData.param.cmpntCd;
                    var tblNm =that.initData.param.tblNm;
                    var columnNm = that.initData.param.columnNm;
                    var seqNbr = that.initData.param.seqNbr;
                	
                	that.$el.trigger({
                		type: 'open-conts-page',
                		pageHandler: 'CAPCA011',
                		pageDPName: bxMsg('cbb_items.SCRN#CAPCA011'),
                		pageInitialize: true,
                		pageRenderInfo: {
                			dataVldtnSqlId : dataVldtnSqlId,
                			cmpntCd : cmpntCd,
                			tblNm : tblNm,
                			columnNm : columnNm,
                			seqNbr : seqNbr
                		}
                	});
                }
                
                
                ,clickBaseGrid : function (){
                	var that = this;

                	var selectedRecord = that.CAPCA014Grid.grid.getSelectionModel().selected.items[0].data;
                	console.log("clickBaseGrid",selectedRecord);
                	that.$el.find('#CAPCA014-detail-table [data-form-param="errDtlCntnt"]').val(selectedRecord.dataVldtnRsltCntnt);

                }
                
                ,setParamData : function (param){
             	   this.$el.find('#CAPCA014-search [data-form-param="cmpntCd"]').val(param.cmpntCd);
             	   this.$el.find('#CAPCA014-search [data-form-param="tblNm"]').val(param.tblNm);
             	   this.$el.find('#CAPCA014-search [data-form-param="columnNm"]').val(param.columnNm);
             	   this.$el.find('#CAPCA014-search [data-form-param="seqNbr"]').val(param.seqNbr);
             	   this.$el.find('#CAPCA014-search [data-form-param="dataVldtnDescCntnt"]').val(param.dataVldtnDescCntnt);
             	   this.$el.find('#CAPCA014-search .bw-input').prop("readonly",true);
             	   if(param.sqlErrYn!=='Y'){
             		  this.$el.find('#btn-CAPCA013-modifySql').hide();
             	   }
                } 
                ,setComboBoxes: function () {
                    var sParam = {};
                    
                    sParam = {};
                    sParam.className = "CAPCA014-cmpntCd-wrap";
                    sParam.targetId = "cmpntCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                    sParam.cdNbr = "A0012";

                    fn_getCodeList(sParam, this);   // 서비스컴포넌트코드
                   
         
                }
                , toggleGrid : function() {
                   	fn_pageLayerCtrl("#CAPCA014Grid-err-list");
                   }
                
                , toggleSearch : function() {
                	fn_pageLayerCtrl("#CAPCA014-search");
                }
                , toggleDtl : function() {
                	fn_pageLayerCtrl("#CAPCA014-detail-table");
                }
                

                ,downloadGridDataWithExcel: function () {
                    this.CAPCA014Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCA014')+"_"+getCurrentDate("yyyy-mm-dd"));
                }

 
            }); // end of Backbone.View.extend({

        return CAPCA014View;
    } // end of define function
)
; // end of define
