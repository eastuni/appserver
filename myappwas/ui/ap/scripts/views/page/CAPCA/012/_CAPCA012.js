/**
@Screen number  CAPCA012
@brief          
@author         
@history        2018.08.14      생성
*/

define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPCA/012/_CAPCA012.html'
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
        var CAPCA012View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPCA012-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                  'click #btn-search-reset': 'resetSearch',
				  'click #btn-CAPCA012-search' : 'inquiryPrsntList',
  				  'click #btn-search-toggle': 'toggleSearch',
  				  
  				  
				  'click #btn-grid-toggle': 'toggleGrid',
				  'click #btn-CAPCA012-error-detail' : 'inquiryErrorDetail',
                	
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
                    

		                    that.CAPCA012Grid = new ExtGrid({
		                     	// 그리드 컬럼 정의
		                     	fields: ['rowIndex','dataVldtnSqlId','exctnSeqNbr','seqNbr','exctnDt','exctnHms', 'cmpntCd', 'tblNm', 'columnNm', 'dataVldtnWayCd','dataVldtnDescCntnt','dataVldtnErrCnt','sqlErrYn'
		                     			]
		                     , id: 'CAPCA012Grid'
		                 	, columns: [
		                 	       	{
									    text: 'No.',
									    dataIndex: 'rowIndex',
									    sortable: false,
		         	            		flex : 1,
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
			         	            	text: bxMsg('cbb_items.SCRNITM#identifier')
		         	            		, dataIndex: 'dataVldtnSqlId'
		         	            		, flex : 3
		     	            			, width : 100
		     	            			, style: 'text-align:center'
		 	            				, align: 'center'
		             	            }
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
		                    });//end of CAPCA012Grid
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
                    this.setDatePicker();

                    return this.$el;
                	
                }
                /**
                 * grid생성
                 */
                , createGrid: function () {
                    var that = this;
                    this.$el.find(".CAPCA012Grid-base-list").html(this.CAPCA012Grid.render({'height': "800px"}));
                } // end of createGrid


                
                /**
                 * 콤보박스 셋팅
                 */
                ,setComboBoxes: function () {
                    var sParam = {};
                    
                    sParam = {};
                    sParam.className = "CAPCA012-cmpntCd-wrap";
                    sParam.targetId = "cmpntCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                    sParam.cdNbr = "A0012";

                    fn_getCodeList(sParam, this);   // 서비스컴포넌트코드
                    
                    var sParam = {};
                    
                    sParam = {};
                    sParam.className = "CAPCA012-vldtnWay-wrap";
                    sParam.targetId = "vldtnWay";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                    sParam.cdNbr = "A1556";
                    
                    fn_getCodeList(sParam, this);   // 서비스컴포넌트코드
                    
                    var sParam = {};
                    
                    sParam = {};
                    sParam.className = "CAPCA012-inqryTrgt-wrap";
                    sParam.targetId = "inqryTrgt";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                    sParam.cdNbr = "A1560";
                    
                    fn_getCodeList(sParam, this);   // 서비스컴포넌트코드
                    
                }
                
                /**
                 *  에러상세보기버튼 CAPCA014페이지로 연결
                 */
                 
                , inquiryErrorDetail: function () {
                    
                	var that = this;
                    var searchData = that.CAPCA012Grid.grid.getSelectionModel().selected.items[0].data;
                    
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
                    var sqlErrYn = searchData.sqlErrYn;
                	
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
                 * 조회버튼 (검증현황조회) 
                 */
                ,inquiryPrsntList : function (){
                    var that = this;
                    var sParam = {};
                    
                    sParam.cmpntCd = that.$el.find('#CAPCA012-search [data-form-param="cmpntCd"]').val();
                    sParam.tblNm = that.$el.find('#CAPCA012-search [data-form-param="tblNm"]').val().toUpperCase();
                    sParam.columnNm = that.$el.find('#CAPCA012-search [data-form-param="columnNm"]').val().toUpperCase();
                    sParam.dataVldtnWayCd = that.$el.find('#CAPCA012-search [data-form-param="vldtnWay"]').val();
                    sParam.dataVldtnSqlId = that.$el.find('#CAPCA012-search [data-form-param="dataVldtnSqlId"]').val().toUpperCase();
                    sParam.dataVldtnRsltDscd = that.$el.find('#CAPCA012-search [data-form-param="inqryTrgt"]').val();
                	sParam.inqryStartDt = XDate(that.$el.find('#CAPCA012-search [data-form-param="srchStartDtm"]').val()).toString('yyyyMMdd');
                	sParam.inqryEndDt = XDate(that.$el.find('#CAPCA012-search [data-form-param="srchEndDtm"]').val()).toString('yyyyMMdd');
                    
                    console.log(sParam);
                    var linkData = {"header": fn_getHeader("CAPCA0128401"), "CaDataVldtnMgmtSvcGetRsltIn": sParam};

                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	var data = responseData.CaDataVldtnMgmtSvcGetRsltListOut.rsltList;
                            	
                            	that.CAPCA012Grid.setData(data)
                      		  	that.$el.find('#rsltCnt').html(data.length);                      		  	

                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy

                }
                
                ,setDatePicker: function () {
                    var that = this;

                    fn_makeDatePicker(that.$el.find('#CAPCA012-search [data-form-param="srchStartDtm"]'));
                    fn_makeDatePicker(that.$el.find('#CAPCA012-search [data-form-param="srchEndDtm"]'));
                }
                
                
                ,resetSearch: function(){
                   	var that = this;
                	that.$el.find('#CAPCA012-search [data-form-param="cmpntCd"]').val('');
                	that.$el.find('#CAPCA012-search [data-form-param="tblNm"]').val('');
                	that.$el.find('#CAPCA012-search [data-form-param="columnNm"]').val('');
                	that.$el.find('#CAPCA012-search [data-form-param="vldtnWay"]').val('');
                	that.$el.find('#CAPCA012-search [data-form-param="dataVldtnSqlId"]').val('');
                	that.$el.find('#CAPCA012-search [data-form-param="inqryTrgt"]').val('');
                    fn_makeDatePicker(that.$el.find('#CAPCA012-search [data-form-param="srchStartDtm"]'));
                    fn_makeDatePicker(that.$el.find('#CAPCA012-search [data-form-param="srchEndDtm"]'));
                }
                
                , toggleGrid : function() {
                   	fn_pageLayerCtrl("#CAPCA012Grid-base-list");
                   }
                
                , toggleSearch : function() {
                	fn_pageLayerCtrl("#CAPCA012-search");
                }

                
                
                
                
                
                
                
                
                
            }); // end of Backbone.View.extend({



        return CAPCA012View;
    } // end of define function
)
; // end of define
