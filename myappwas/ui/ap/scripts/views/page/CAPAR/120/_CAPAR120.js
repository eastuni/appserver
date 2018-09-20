define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPAR/120/_CAPAR120.html'
        , 'bx-component/date-picker/_date-picker'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx-component/bx-tree/bx-tree'
        , 'bx/common/common-info'
        , 'app/views/page/popup/CAPSV/popup-attribute-search'
    ]
    , function (config
        , tpl
        , DatePicker
        , ExtGrid
        , bxTree
        , commonInfo
        , PopupAttributeSearch
        ) {


        /**
         * Backbone
         */
        var CAPAR120View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPAR120-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                	'click #btn-base-reset' : 'resetBaseArea'
                   ,'click #btn-detail-reset' : 'resetDetailArea'
                   ,'click #btn-search' : 'inquiryServiceData'
                   ,'click #btn-detail-save' : 'saveArrPdRuleDetl'
                   ,'click #btn-CAPAR120-grid-save' : 'saveArrPdRuleDetlList'
                   ,'click #btn-up-base' : 'toggleArrPdRuleBase'
                   ,'click #btn-up-grid' : 'toggleArrPdRuleGrid'
                   ,'click #btn-up-detail' : 'toggleArrPdRuleDetl'
                   ,'click #btn-attribute-search': 'openAttributeSearchPopup'
                   ,'change .arrPdRuleTpCd-wrap' : 'changeArrPdRuleTpCd'
                   ,'change .bizDscd-wrap' : 'changeBizDscd'   
            	   ,'change .pdTpCd-wrap' : 'changePdMClcd'  
        		   ,'change .pdTmpltCd-wrap' : 'changePdTmpltCd'
    			   ,'change .CAPAR120-arrPdRuleTpCd-wrap' : 'changeArrPdRuleTpCdDetl'
                   ,'change .CAPAR120-bizDscd-wrap' : 'changeBizDscdDetl'   
            	   ,'change .CAPAR120-pdTpCd-wrap' : 'changePdMClcdDetl'  
        		   ,'change .CAPAR120-pdTmpltCd-wrap' : 'changePdTmpltCdDetl'
                }


                , initialize: function (initData) {
                    var that = this;
                    that.that = this;
                    that.initFlag = false;


                    that.deleteList = [];
                    that.arrPdRuleCntntCdNbrList = []; 


                    $.extend(that, initData);
                    that.$el.html(that.tpl());


                    that.initData = initData;   


                    // 콤보조회 서비스호출 준비
                    var sParam = {};


                    // 계약상품규칙유형코드
                    sParam = {};
                    sParam.cdNbr = "A0433";
                    var linkData1 = {"header" : fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn" : sParam};


                    // 업무구분코드
                    sParam = {};
                    sParam.cdNbr = "80015";
                    var linkData2 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                    bxProxy.all([
						// 계약상품규칙유형코드 콤보코드 로딩
	                    {url: sUrl, param: JSON.stringify(linkData1), success: function(responseData) {
	                    	if(fn_commonChekResult(responseData)) {
	                    		that.comboStore1 = new Ext.data.Store({
	                    			fields: ['cd', 'cdNm'],
	     	                      	data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
	     	                  	});
	                 	  	}
	                    }}
						// 업무구분코드
						, {url:sUrl, param: JSON.stringify(linkData2), success: function(responseData) {
							  if(fn_commonChekResult(responseData)) {
								  that.comboStore2 = new Ext.data.Store({
									  fields: ['cd', 'cdNm'],
									  data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
								  });
							  }
						}}
                          ]
                        , {
                            success: function () {	
                                that.CAPAR120Grid = new ExtGrid({
                                    // 그리드 컬럼 정의
                                    fields: ['No', 'arrPdRuleTpCd','bizDscd', 'pdTpCd', 'pdTmpltCd', 'pdCd', 'pdTpNm', 'pdTmpltNm', 'pdNm', 'arrPdRuleCntnt', 'arrPdRuleNm']
                                    , id: 'CAPAR120Grid'
                                    , columns: [
											{
											    text:'No'
											    ,dataIndex: 'rowIndex'
											    ,sortable : false
											    , height: 25
											    ,width: 40, style: 'text-align:center', align: 'center'
											    // other config you need....
											    ,renderer : function(value, metaData, record, rowIndex, colIndex, sotre) {
											        return rowIndex+1;
											    }
											}
										  // 계약상품규칙유형코드
			    						  ,{text:bxMsg('cbb_items.SCRNITM#arrPdRuleTp'), width: 150, dataIndex: 'arrPdRuleTpCd', style: 'text-align:center', align: 'center'
				                              ,editor: {
				                                  xtype: 'combobox'
				                                  ,store: that.comboStore1
				                                  ,displayField: 'cdNm'
				                                  ,valueField: 'cd'
				                              }
				                              ,renderer: function(val) {
				                                  index = that.comboStore1.findExact('cd', val);
				                                  if(index != -1) {
				                                      rs = that.comboStore1.getAt(index).data;
				                                      return rs.cdNm;
				                                  }
				                              } // end of render
				                          } // end of 계약상품규칙유형코드


						                  // 업무구분명
						                  ,{text:bxMsg('cbb_items.SCRNITM#bizDscd'), dataIndex: 'bizDscd', flex: 1, style: 'text-align:center', align: 'center'
						                	   ,editor: {
						                           xtype: 'combobox'
						                          ,store: that.comboStore2
						                          ,displayField: 'cdNm'
						                          ,valueField: 'cd'
						                      }
						                      ,renderer: function(val) {
						                          index = that.comboStore2.findExact('cd', val);
						                          if(index != -1) {
						                              rs = that.comboStore2.getAt(index).data;
						                              return rs.cdNm
						                          }
						                      } // end of render
						                  } // end of bizDscd


						                  // 상품유형명
						                  ,{text:bxMsg('cbb_items.SCRNITM#pdTpCd'), dataIndex: 'pdTpNm', flex: 1, style: 'text-align:center', align: 'center'}


						                  // 상품템플릿
						                  ,{text:bxMsg('cbb_items.SCRNITM#pdTmpltCd'), dataIndex: 'pdTmpltNm', flex: 1, style: 'text-align:center', align: 'center'}


						                  // 상품명
						                  ,{text:bxMsg('cbb_items.SCRNITM#pdCd'), dataIndex: 'pdNm', flex: 1, style: 'text-align:center', align: 'center'}


						                  // 계약상품유형내용
				                          ,{text:bxMsg('cbb_items.SCRNITM#arrPdRule'), dataIndex: 'arrPdRuleNm', flex: 1, style: 'text-align:center', align: 'center'}


						                  ,{
					                            xtype: 'actioncolumn',
					                            width: 80,
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


                                    // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                                    , gridConfig: {
                                    	// 셀 에디팅 플러그인
                                        plugins: [
                                            Ext.create('Ext.grid.plugin.CellEditing', {
						                      clicksToEdit : 2
						                      , listeners : {
						                            'beforeedit': function(editor, e) {
						                            	if(e.field == 'arrPdRuleTpCd' || e.field == 'bizDscd') {
						                            		return false;
						                            	}
						                            }
						                        }
						                  }) // end of Ext.create
                                        ] // end of plugins
                                    } // end of gridConfig
                                    , listeners: {
                                    	
                                    	cellclick( _this, td, cellIndex, record, tr, rowIndex, e, eOpts ){
			                            	that.selectReocrd();
			                            }
                                    }
                                });


                                // 단일탭 그리드 렌더
                                that.createGrid();
                            } // end of success:.function
                        }); // end of bxProxy.all


                    that.getArrPdRuleCntntCdNbr();
                }


                , render: function () {
                    var that = this;


                    that.setCombo();
                    that.changeArrPdRuleTpCd();
                    
                    
                  //배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPAR120-wrap #btn-CAPAR120-grid-save')
                                        		,this.$el.find('.CAPAR120-wrap #btn-detail-save')
                                        			   ]);

                    return this.$el;
                }


                , setCombo: function() {
                	var that = this;
                	// 콤보데이터 로딩
                    var sParam;
                    var param;


                    sParam = {};


                    //
                    //계약상품규칙유형코드
                    sParam.className = "arrPdRuleTpCd-wrap";
                    sParam.targetId = "arrPdRuleTpCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "A0433";
                    // 콤보데이터 load
                    fn_getCodeList(sParam, this); 


                	//업무구분코드 초기화
                    param = {};
                    param.classNm = "bizDscd-wrap";
                    that.initBizDscd(param);


                    // 기본부 초기화
                    that.resetBaseArea();


                    //
                 	//계약상품규칙유형코드
                    sParam = {};
                    sParam.className = "CAPAR120-arrPdRuleTpCd-wrap";
                    sParam.targetId = "arrPdRuleTpCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                    sParam.viewType = "ValNm";
                    sParam.cdNbr = "A0433";
                    // 콤보데이터 load
                    fn_getCodeList(sParam, this); 


                    //업무구분코드
                    param = {};
                    param.classNm = "CAPAR120-bizDscd-wrap";
                    that.initBizDscd(param);


                    // 상세부 초기화
                    that.resetDetailArea();
                }


                /* ======================================================================== */
                /*    계약상품규칙유형코드 변경                                										*/
                /* ======================================================================== */
                , changeArrPdRuleTpCd: function() {
                	var that = this;
                	var param = {};
                	var arrPdRuleTpCd = that.$el.find('.CAPAR120-base-table [data-form-param="arrPdRuleTpCd"]').val(); //계약상품규칙유형코드


                	param.arrPdRuleTpCd = arrPdRuleTpCd;
                	param.classNm = "bizDscd-wrap";
                    //업무구분코드 재조회
                    that.selectBizDscd(param);
                }


                /* ======================================================================== */
                /*    계약상품규칙유형코드 변경(상세부)                                				*/
                /* ======================================================================== */
                , changeArrPdRuleTpCdDetl: function(pdParam) {
                	var that = this;
                	var param = {};
                	var arrPdRuleTpCd = that.$el.find('.CAPAR120-detail-table [data-form-param="arrPdRuleTpCd"]').val(); //계약상품규칙유형코드


                	var $txtArrPdRuleCntnt = that.$el.find('.CAPAR120-detail-table [data-form-param="txtArrPdRuleCntnt"]');
                	var $btnAtrbtSearch    = that.$el.find('.CAPAR120-detail-table #btn-attribute-search');
                	var $arrPdRuleCntnt    = that.$el.find('.CAPAR120-detail-table [data-form-param="arrPdRuleCntnt"]');


                    $txtArrPdRuleCntnt.val("");


                	if(arrPdRuleTpCd == "07"){
                		$txtArrPdRuleCntnt.show();
                		$btnAtrbtSearch.show();
                		$arrPdRuleCntnt.hide();
                	}else{
                		$txtArrPdRuleCntnt.hide();
                		$btnAtrbtSearch.hide();
                		$arrPdRuleCntnt.show();


                		param.arrPdRuleTpCd = arrPdRuleTpCd;
                    	param.classNm = "CAPAR120-bizDscd-wrap";
                    	
                    	if(pdParam.arrPdRuleCntnt) return;

                    	// 계약상품규칙내용 재조회
                        that.selectArrPdRuleCntn(param);
                	}

                	if(pdParam.bizDscd) return;
                	
                	// 업무구분코드 재조회
                    that.selectBizDscd(param);
                }


                /* ======================================================================== */
                /*    업무구분코드 변경                                											*/
                /* ======================================================================== */
                , changeBizDscd: function() {
                	var that = this;
                	var param = {};
                	var bizDscd = that.$el.find('.CAPAR120-base-table [data-form-param="bizDscd"]').val(); //업무구분코드


                	param.bizDscd = bizDscd;
                	param.classNm = "pdTpCd-wrap";
                    //상품중분류코드 재조회
                    that.selectPdMClcd(param);
                }


                /* ======================================================================== */
                /*    업무구분코드 변경(상세부)                                						*/
                /* ======================================================================== */
                , changeBizDscdDetl: function() {
                	var that = this;
                	var param = {};
                	var bizDscd = that.$el.find('.CAPAR120-detail-table [data-form-param="bizDscd"]').val(); //업무구분코드


                	param.bizDscd = bizDscd;
                	param.classNm = "CAPAR120-pdTpCd-wrap";
                    //상품중분류코드 재조회
                    that.selectPdMClcd(param);
                }


                /* ======================================================================== */
                /*    상품중분류코드 변경                                											*/
                /* ======================================================================== */
	            , changePdMClcd: function() {
	            	var that = this;
	            	var param = {};


	            	param.bizDscd = that.$el.find('.CAPAR120-base-table [data-form-param="bizDscd"]').val(); //업무구분코드
	            	param.pdTpCd = that.$el.find('.CAPAR120-base-table [data-form-param="pdTpCd"]').val(); //상품중분류코드
	            	param.classNm = "pdTmpltCd-wrap";
	            	//상품템플릿코드 재조회
	            	that.selectPdTmpltCd(param);
	            }


	            /* ======================================================================== */
                /*    상품중분류코드 변경  (상세부)                              					*/
                /* ======================================================================== */
	            , changePdMClcdDetl: function() {
	            	var that = this;
	            	var param = {};


	            	param.bizDscd = that.$el.find('.CAPAR120-detail-table [data-form-param="bizDscd"]').val(); //업무구분코드
	            	param.pdTpCd = that.$el.find('.CAPAR120-detail-table [data-form-param="pdTpCd"]').val(); //상품중분류코드
	            	//상품템플릿코드 재조회
	            	param.classNm = "CAPAR120-pdTmpltCd-wrap";
	            	that.selectPdTmpltCd(param);
	            }


		        /* ======================================================================== */
		        /*    상품템플릿코드 변경                                											*/
		        /* ======================================================================== */
    		    , changePdTmpltCd: function() {
    		    	var that = this;
    		    	var param = {};


    		    	param.bizDscd = that.$el.find('.CAPAR120-base-table [data-form-param="bizDscd"]').val(); //업무구분코드
    		    	param.pdTpCd = that.$el.find('.CAPAR120-base-table [data-form-param="pdTpCd"]').val(); //상품중분류코드
    		    	param.pdTmpltCd = that.$el.find('.CAPAR120-base-table [data-form-param="pdTmpltCd"]').val(); //상품템플릿코드
    		    	param.classNm = "pdCd-wrap";
    		    	//상품코드 재조회
    		    	that.selectPdCd(param);
    		    }


    		    /* ======================================================================== */
    	        /*    상품템플릿코드 변경   (상세부)                             						*/
    	        /* ======================================================================== */
    		    , changePdTmpltCdDetl: function() {
    		    	var that = this;
    		    	var param = {};


    		    	param.bizDscd = that.$el.find('.CAPAR120-detail-table [data-form-param="bizDscd"]').val(); //상품대분류코드
    		    	param.pdTpCd = that.$el.find('.CAPAR120-detail-table [data-form-param="pdTpCd"]').val(); //상품중분류코드
    		    	param.pdTmpltCd = that.$el.find('.CAPAR120-detail-table [data-form-param="pdTmpltCd"]').val(); //상품템플릿코드
    		    	param.classNm = "CAPAR120-pdCd-wrap";
    		    	//상품코드 재조회
    		    	that.selectPdCd(param);
    		    }
    		    

    		    /* ======================================================================== */
                /*    업무구분코드 조회                               											*/
                /* ======================================================================== */
                , selectBizDscd: function(param) {
                	var that = this;
                	var sParam = {};
                    var pdTpCd = {};
                    var pdTmpltCd = {};
                    var pdCd = {};


                    if(param.arrPdRuleTpCd == "") {
                    	//업무구분코드 초기화
                        that.initBizDscd(param);
                    }
                    else {
                    	//combobox 정보 셋팅
                    	sParam.className = param.classNm;
                    	sParam.targetId = "bizDscd";
                    	sParam.nullYn = "Y";
                        sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                        sParam.viewType = "ValNm";
                    	//inData 정보 셋팅
                    	sParam.cdNbr = "80015";


                    	// 기관코드 셋팅
                    	var instInfo = commonInfo.getInstInfo();
                    	sParam.instCd = instInfo.instCd;


                    	if(param.bizDscd) {
                    		sParam.selectVal = param.bizDscd;
                    		sParam.disabled = true;
                    	}


                    	// 콤보데이터 load
                    	fn_getCodeList(sParam, this);  // 업무구분코드
                    }


                    if(param.classNm == "bizDscd-wrap"){
                    	pdTpCd.classNm = "pdTpCd-wrap";
                    	pdTmpltCd.classNm = "pdTmpltCd-wrap";
                    	pdCd.classNm = "pdCd-wrap";
                    }else{
                    	pdTpCd.classNm = "CAPAR120-pdTpCd-wrap";
                    	pdTmpltCd.classNm = "CAPAR120-pdTmpltCd-wrap";
                    	pdCd.classNm = "CAPAR120-pdCd-wrap";
                    }


                    //상품유형코드 초기화
                    that.initPdMClcd(pdTpCd);


                    //상품템플릿 초기화
                    that.initPdTmpltCd(pdTmpltCd);


                    //상품코드 초기화
                	that.initPdCd(pdCd);
                }


			    /* ======================================================================== */
			    /*    상품중분류코드 조회                                											*/
			    /* ======================================================================== */
                , selectPdMClcd: function(param) {
                	var that = this;
                	var sParam = {};
                    var pdTmpltCd = {};
                    var pdCd = {};


                    if(param.bizDscd == "") {
                    	//상품중분류코드 초기화
                        that.initPdMClcd(param);
                    }
                    else {
                    	//combobox 정보 셋팅
                    	sParam.className = param.classNm;
                    	sParam.targetId = "pdTpCd";
                    	sParam.nullYn = "Y";
                        sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                        sParam.viewType = "ValNm";
                    	//inData 정보 셋팅
                    	sParam.bizDscd = param.bizDscd;
                    	//sParam.pdTpCd = "";


                    	var instInfo = commonInfo.getInstInfo();
                    	sParam.instCd = instInfo.instCd;


                    	if(param.pdTpCd) {
                    		sParam.selectVal = this.unFillBlank(param.pdTpCd);
                    		sParam.disabled = true;
                    	}


                    	// 콤보데이터 load
                    	fn_getPdCodeList(sParam, this);  // 상품중분류코드
                    }




                    if(param.classNm == "pdTpCd-wrap"){
                    	pdTmpltCd.classNm = "pdTmpltCd-wrap";
                    	pdCd.classNm = "pdCd-wrap";
                    }else{
                    	pdTmpltCd.classNm = "CAPAR120-pdTmpltCd-wrap";
                    	pdCd.classNm = "CAPAR120-pdCd-wrap";
                    }


                    //상품템플릿 초기화
                    that.initPdTmpltCd(pdTmpltCd);


                    //상품코드 초기화
                    that.initPdCd(pdCd);
                }


			    /* ======================================================================== */
			    /*    상품탬플릿코드 조회                                											*/
			    /* ======================================================================== */
                , selectPdTmpltCd: function(param) {
                	var that = this;
                	var sParam = {};
                	var pdCd = {};


                	if(param.pdTpCd == "") {
                		//상품템플릿 초기화
                		that.initPdTmpltCd(param);
                	}
                	else {
                		//combobox 정보 셋팅
                		sParam.className = param.classNm;
                		sParam.targetId = "pdTmpltCd";
                		sParam.nullYn = "Y";
                        sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                        sParam.viewType = "ValNm";
                		//inData 정보 셋팅
                		sParam.bizDscd = param.bizDscd;
                		sParam.pdTpCd = param.pdTpCd;


                		var instInfo = commonInfo.getInstInfo();
                		sParam.instCd = instInfo.instCd;


                		if(param.pdTmpltCd) {
                    		sParam.selectVal = this.unFillBlank(param.pdTmpltCd);
                    		sParam.disabled = true;
                    	}


                		// 콤보데이터 load
                		fn_getPdCodeList(sParam, this);  //상품탬플릿코드
                	}


                	//상품코드 초기화
                	if(param.classNm == "pdTmpltCd-wrap"){
                		pdCd.classNm = "pdCd-wrap";
                    }else{
                    	pdCd.classNm = "CAPAR120-pdCd-wrap";
                    }
                    that.initPdCd(pdCd);
                }


			    /* ======================================================================== */
			    /*    상품코드 조회                                												*/
			    /* ======================================================================== */
                , selectPdCd: function(param) {
                	var that = this;
                	var sParam = {};


                	if(param.pdTpCd == "") {
                		//상품템플릿 초기화
                		that.initPdTmpltCd(param);
                	}
                	else {
                		//combobox 정보 셋팅
                		sParam.className = param.classNm;
                		sParam.targetId = "pdCd";
                		sParam.nullYn = "Y";
                        sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                        sParam.viewType = "ValNm";
                		//inData 정보 셋팅
                		sParam.bizDscd = param.bizDscd;
                		sParam.pdTpCd = param.pdTpCd;
                		sParam.pdTmpltCd = param.pdTmpltCd;


                		var instInfo = commonInfo.getInstInfo();
                		sParam.instCd = instInfo.instCd;


                		if(param.pdCd) {
                    		sParam.selectVal = this.unFillBlank(param.pdCd);
                    		sParam.disabled = true;
                    	}


                		// 콤보데이터 load
                		fn_getPdCodeList(sParam, this);  //상품코드
                	}
                }


                /* ======================================================================== */
                /*    계약상품규칙내용 조회                               									    */
                /* ======================================================================== */
                , selectArrPdRuleCntn: function(param) {
                	var that = this;
                	var sParam = {};
                    var cdNbr = "";


                    if(param.arrPdRuleTpCd == "") {
                    	//계약상품규칙내용 초기화
                        that.initArrPdRuleCntnt();
                    }
                    else {


                    	for(var i = 0 ; i < that.arrPdRuleCntntCdNbrList.length ; i++){


                    		if(param.arrPdRuleTpCd == that.arrPdRuleCntntCdNbrList[i].cdNbrTpCd){
                    			cdNbr = that.arrPdRuleCntntCdNbrList[i].cdNbr;
                    		}
            			} 


                    	//combobox 정보 셋팅
                    	sParam.className = "CAPAR120-arrPdRuleCntnt-wrap";
                    	sParam.targetId = "arrPdRuleCntnt";
                    	sParam.nullYn = "Y";
                        sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 전체
                        sParam.viewType = "ValNm";
                    	//inData 정보 셋팅
                    	sParam.cdNbr = cdNbr;


                    	if(param.arrPdRuleCntnt) {
                    		sParam.selectVal = param.arrPdRuleCntnt;
                    	}


                    	// 기관코드 셋팅
                    	var instInfo = commonInfo.getInstInfo();
                    	sParam.instCd = instInfo.instCd;                	


                    	// 콤보데이터 load
                    	fn_getCodeList(sParam, this);  // 계약상품규칙내용
                    }
                }


                , unFillBlank: function(obj){
                	if(obj == "@")
                		return "";
                	else
                		return obj;
                }


			    /* ======================================================================== */
			    /*    업무구분코드 초기화                               										    */
			    /* ======================================================================== */
                , initBizDscd : function (param) {


//                    if(param.classNm=="bizDscd-wrap"){
//                    	var $selectBizDscd = this.$el.find('.CAPAR120-base-table [data-form-param="bizDscd"]');
//                    }else{
//                    	var $selectBizDscd = this.$el.find('.CAPAR120-detail-table [data-form-param="bizDscd"]');
//                    }
//
//
//                    $selectBizDscd.val("");
//                    $selectBizDscd.empty();
//                    $selectBizDscd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                }    


			    /* ======================================================================== */
			    /*    상품중분류코드 초기화                                										*/
			    /* ======================================================================== */
                , initPdMClcd : function (param) {


                	if(param.classNm=="pdTpCd-wrap"){
                    	var $selectPdTpCd = this.$el.find('.CAPAR120-base-table [data-form-param="pdTpCd"]');
                    }else{
                    	var $selectPdTpCd = this.$el.find('.CAPAR120-detail-table [data-form-param="pdTpCd"]');
                    }


                	$selectPdTpCd.empty();
                	$selectPdTpCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));


                }


			    /* ======================================================================== */
			    /*    상품템플릿코드 초기화                                										*/
			    /* ======================================================================== */
                , initPdTmpltCd : function (param) {


                	if(param.classNm=="pdTmpltCd-wrap"){
                    	var $selectPdTmpltCd = this.$el.find('.CAPAR120-base-table [data-form-param="pdTmpltCd"]');
                    }else{
                    	var $selectPdTmpltCd = this.$el.find('.CAPAR120-detail-table [data-form-param="pdTmpltCd"]');
                    }


                	$selectPdTmpltCd.empty();
                	$selectPdTmpltCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));


                }


			    /* ======================================================================== */
			    /*    상품코드 초기화                               											    */
			    /* ======================================================================== */
                , initPdCd : function (param) {


                	if(param.classNm=="pdCd-wrap"){
                    	var $selectPdCd = this.$el.find('.CAPAR120-base-table [data-form-param="pdCd"]');
                    }else{
                    	var $selectPdCd = this.$el.find('.CAPAR120-detail-table [data-form-param="pdCd"]');
                    }


                	$selectPdCd.empty();
                	$selectPdCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));


                }


                /* ======================================================================== */
			    /*    계약상품규칙내용 초기화                               										*/
			    /* ======================================================================== */
                , initArrPdRuleCntnt : function () {


                    var $selectArrPdRuleCntnt = this.$el.find('.CAPAR120-detail-table [data-form-param="arrPdRuleCntnt"]');


                    $selectArrPdRuleCntnt.empty();
                    $selectArrPdRuleCntnt.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));


                }


                /* ======================================================================== */
			    /*    기본부 초기화                               												*/
			    /* ======================================================================== */
                , resetBaseArea : function() {


                	var param = {};
                	var that = this;


                	that.$el.find('.CAPAR120-base-table [data-form-param="arrPdRuleTpCd"] option:eq(0)').attr("selected", "selected");
  	        	  	that.$el.find('.CAPAR120-base-table [data-form-param="bizDscd"] option:eq(0)').attr("selected", "selected");


                    //상품유형코드 초기화
                    param = {};
                    param.classNm = "pdTpCd-wrap";
                    that.initPdMClcd(param);


                    //상품템플릿 초기화
                    param = {};
                    param.classNm = "pdTmpltCd-wrap";
                    that.initPdTmpltCd(param);


                    //상품코드 초기화
                    param = {};
                    param.classNm = "pdCd-wrap";
                    that.initPdCd(param);
                }


                /* ======================================================================== */
			    /*    상세부 초기화                               												*/
			    /* ======================================================================== */
	            , resetDetailArea: function() {
	            	var param = {};
	            	var that = this;
	            	that.initFlag = true;


	            	that.$el.find('.CAPAR120-detail-table [data-form-param="arrPdRuleTpCd"] option:eq(0)').attr("selected", "selected");
	            	that.$el.find('.CAPAR120-detail-table [data-form-param="bizDscd"] option:eq(0)').attr("selected", "selected");


	            	//상품유형코드 초기화
	            	param = {};
	            	param.classNm = "CAPAR120-pdTpCd-wrap";
	            	that.initPdMClcd(param);


	            	//상품템플릿 초기화
	            	param = {};
	            	param.classNm = "CAPAR120-pdTmpltCd-wrap";
	            	that.initPdTmpltCd(param);


	            	//상품코드 초기화
	            	param = {};
	            	param.classNm = "CAPAR120-pdCd-wrap";
	            	that.initPdCd(param);


	            	//계약상품규칙내용 초기화
	            	that.initArrPdRuleCntnt();


	            	that.$el.find('.CAPAR120-detail-table [data-form-param="txtArrPdRuleCntnt"]').val("");
	            	that.$el.find('.CAPAR120-detail-table [data-form-param="arrPdRuleTpCd"]').prop("disabled", false);
	            	that.$el.find('.CAPAR120-detail-table [data-form-param="bizDscd"]').prop("disabled", false);
	            	that.$el.find('.CAPAR120-detail-table [data-form-param="pdTpCd"]').prop("disabled", false);
	            	that.$el.find('.CAPAR120-detail-table [data-form-param="pdTmpltCd"]').prop("disabled", false);
	            	that.$el.find('.CAPAR120-detail-table [data-form-param="pdCd"]').prop("disabled", false);
	            }


	            /* ======================================================================== */
			    /*    속성조회 팝업                            												*/
			    /* ======================================================================== */
	            , openAttributeSearchPopup: function () {
	                var that = this;


	                this.popupAttributeSearch = new PopupAttributeSearch();
	                this.popupAttributeSearch.render();
	                this.popupAttributeSearch.on('popUpSetData', function (data) {
	                    that.$el.find('.CAPAR120-detail-table [data-form-param="txtArrPdRuleCntnt"]').val(data.atrbtCd);
	                });
	            }


	            /* ======================================================================== */
			    /*    조회                                   												    */
			    /* ======================================================================== */
                , inquiryServiceData: function () {	 
                    // header 정보 set
                    var that = this;
                    var sParam = {};


               	  	var instInfo = commonInfo.getInstInfo();
               	  	if(that.pageArg == 'STDA') {
      					sParam.instCd = 'STDA';
      				}else{
                  		sParam.instCd = instInfo.instCd;
      				}


	               	sParam.arrPdRuleTpCd = that.$el.find('.CAPAR120-base-table [data-form-param="arrPdRuleTpCd"]').val(); // 계약관계종류코드
	                sParam.bizDscd = that.$el.find('.CAPAR120-base-table [data-form-param="bizDscd"]').val(); // 업무구분코드
	                sParam.pdTpCd = that.$el.find('.CAPAR120-base-table [data-form-param="pdTpCd"]').val(); // 상품유형코드
	                sParam.pdTmpltCd = that.$el.find('.CAPAR120-base-table [data-form-param="pdTmpltCd"]').val(); // 상품템플릿코드
	                sParam.pdCd = that.$el.find('.CAPAR120-base-table [data-form-param="pdCd"]').val(); // 상품코드


                    var linkData = {"header": fn_getHeader("CAPAR1208401"), "CaArrPdRuleMgmtSvcArrPdRuleIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData),{
                  	  enableLoading: true,
                        success: function(responseData){
                      	  if(fn_commonChekResult(responseData)) {
                      		  var tbList = responseData.CaArrPdRuleMgmtSvcGetArrPdRuleListOut.arrPdRuleList;


                                if(tbList != null|| tbList.length > 0) {
                                    that.CAPAR120Grid.setData(tbList);
                                    that.oldData = tbList;
                                    that.initFag = true;
                                }
                                else {
                                    that.CAPAR120Grid.resetData();
                                }


                                that.$el.find('#rsltCnt').html(tbList.length);


                                that.resetDetailArea();
                            }
                         }   // end of suucess: fucntion
                     }); // end of bxProxy


                } // end




                /* ======================================================================== */
			    /*    계약상품규칙내용코드 조회														*/
			    /* ======================================================================== */
                ,getArrPdRuleCntntCdNbr: function () {
              	  	var that = this;
                    var sParam = {};


                    var linkData = {"header": fn_getHeader("CAPAR1208402"), "DummyIO": sParam};


                    //ajax 호출
                    bxProxy.post(sUrl, JSON.stringify(linkData),{
                  	  //loading 설정
                  	  enableLoading: true,
                  	  success: function(responseData) {


                  		  if(fn_commonChekResult(responseData)) {
                  			  if(responseData.CaArrPdRuleCntntCdNbrListOut) {
                  				  var cdNbrList = responseData.CaArrPdRuleCntntCdNbrListOut.list;


                  				  for(var i = 0 ; i < cdNbrList.length ; i++){
    	              				  var list = {};
    	              				  list.cdNbr = cdNbrList[i].cdNbr;
    	          			     	  list.cdNbrTpCd = cdNbrList[i].cdNbrTpCd;
    	          			     	  that.arrPdRuleCntntCdNbrList.push(list);


    	              			  }//for문 끝  
                  			  }
                  		  }
                  	  }
                    });


                } // end of 조회




                /* ======================================================================== */
			    /*    삭제내역 일괄 저장                                   											*/
			    /* ======================================================================== */
                , saveArrPdRuleDetlList : function() {
                	if(this.initFlag){
              			return ;
              		}

                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                    
    	           	var that = this;
    	           	function deleteData() {
    		            var table = [];
    		            var sParam = {};


    	              	$(that.deleteList).each(function(idx, data) {
    		            	var delList = {};
    		            	delList.instCd = commonInfo.getInstInfo().instCd;
    		            	delList.arrPdRuleTpCd = data.arrPdRuleTpCd;
    		            	delList.bizDscd = data.bizDscd;
    		            	delList.pdTpCd = data.pdTpCd;
    		            	delList.pdTmpltCd = data.pdTmpltCd;
    		            	delList.pdCd = data.pdCd;
    		            	delList.arrPdRuleCntnt = data.arrPdRuleCntnt;


    		                table.push(delList);
    		            });


    		            sParam.tblList = table;


    		            var linkData = {"header": fn_getHeader("CAPAR1208301"), "CaArrPdRuleMgmtSvcDeletePdRuleIn": sParam};


    		            // ajax호출
    		            bxProxy.post(sUrl, JSON.stringify(linkData), {
    		                enableLoading: true
    		                , success: function (responseData) {
    		                    if (fn_commonChekResult(responseData)) {
    		                        fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


    		                        that.deleteList = [];
    								that.inquiryServiceData();
    		                    }
    		                }   // end of suucess: fucntion
    		            }); // end of bxProxy
    	        	}


    	          	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), deleteData, this);


                } 


                /* ======================================================================== */
			    /*    저장                                   												    */
			    /* ======================================================================== */
                , saveArrPdRuleDetl : function() {
                	var that = this;
                	var sParam = {};
                	var txCd = "";
                	
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }

                    var instInfo = commonInfo.getInstInfo();
                    instCdBase = instInfo.instCd;


                    sParam.instCd = instCdBase;


                    sParam.arrPdRuleTpCd = that.$el.find('.CAPAR120-detail-table [data-form-param="arrPdRuleTpCd"]').val();	//계약관계종류코드
                    sParam.bizDscd = that.$el.find('.CAPAR120-detail-table [data-form-param="bizDscd"]').val();	//업무구분코드
                    sParam.pdTpCd = that.$el.find('.CAPAR120-detail-table [data-form-param="pdTpCd"]').val();	//상품유형코드
                    sParam.pdTmpltCd = that.$el.find('.CAPAR120-detail-table [data-form-param="pdTmpltCd"]').val();	//상품템플릿코드
                    sParam.pdCd = that.$el.find('.CAPAR120-detail-table [data-form-param="pdCd"]').val();	//상품코드
                    if(sParam.arrPdRuleTpCd == "07"){
                    	sParam.arrPdRuleCntnt = that.$el.find('.CAPAR120-detail-table [data-form-param="txtArrPdRuleCntnt"]').val();	//계약상품규칙내용
                    }else{
                    	sParam.arrPdRuleCntnt = that.$el.find('.CAPAR120-detail-table [data-form-param="arrPdRuleCntnt"]').val();	//계약상품규칙내용
                    }




                    if(sParam.pdTpCd == "" || sParam.pdTpCd == null){
                    	sParam.pdTpCd = "@";
                    }


                    if(sParam.pdTmpltCd == "" || sParam.pdTmpltCd == null){
                    	sParam.pdTmpltCd = "@";
                    }


                    if(sParam.pdCd == "" || sParam.pdCd == null){
                    	sParam.pdCd = "@";
                    }


                    if(that.initFlag) { //등록
                		txCd = "CAPAR1208101";
                	}
                	else {
                		txCd = "CAPAR1208201";
                	}


                    var linkData = {"header": fn_getHeader(txCd), "CaArrPdRuleMgmtSvcArrPdRuleIn": sParam};


                    //ajax 호출
                    bxProxy.post(sUrl, JSON.stringify(linkData),{
                    	enableLoading: true,
                    	success: function(responseData){
                    		if(fn_commonChekResult(responseData)) {
                    			fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                    			//재조회
                    			that.trigger('loadData', null);
                    			that.inquiryServiceData();
                    		}
                    	}
                    });
                }


                /* ======================================================================== */
			    /*    조회 내역 클릭 시 호출                                   										*/
			    /* ======================================================================== */
                , selectReocrd: function () {
                    var selectedRecord = this.CAPAR120Grid.grid.getSelectionModel().selected.items[0];


                    if (!selectedRecord) {
                        return;
                    } else {
                        this.setServiceTypeItem(selectedRecord.data);
                    }
                }            


                /* ======================================================================== */
                /*    클릭한 그리드 내역 상세부에 셋팅                                									*/
                /* ======================================================================== */
                , setServiceTypeItem: function (data) {
            	   	var that = this;
            	   	var pdParam = {};
            	   	that.initFlag = false;


	               	that.$el.find('.CAPAR120-detail-table [data-form-param="arrPdRuleTpCd"]').prop("disabled", true);	// 계약관계종류코드
	            	that.$el.find('.CAPAR120-detail-table [data-form-param="arrPdRuleTpCd"]').val(data.arrPdRuleTpCd);  
	            	that.$el.find('.CAPAR120-detail-table [data-form-param="bizDscd"]').val(data.bizDscd);       //업무구분코드


	            	//상품데이터 셋팅
	            	pdParam.arrPdRuleTpCd = data.arrPdRuleTpCd;
	            	pdParam.bizDscd = data.bizDscd;
	            	pdParam.pdTpCd = data.pdTpCd;
	            	pdParam.pdTpCdNm = data.pdTpCdNm;
	            	pdParam.pdTmpltCd = data.pdTmpltCd;
	            	pdParam.pdTmpltNm = data.pdTmpltNm;
	            	pdParam.pdCd = data.pdCd;
	            	pdParam.pdNm = data.pdNm;
	            	pdParam.arrPdRuleCntnt = data.arrPdRuleCntnt;	            		            	

	            	//업무구분코드 조회
	            	pdParam.classNm = "CAPAR120-bizDscd-wrap";
	            	that.selectBizDscd(pdParam);


	            	//상품유형코드 조회
	            	pdParam.classNm = "CAPAR120-pdTpCd-wrap";
	                that.selectPdMClcd(pdParam);


	                //상품템플릿코드 조회
	                pdParam.classNm = "CAPAR120-pdTmpltCd-wrap";
	            	that.selectPdTmpltCd(pdParam);


	            	//상품코드 조회
	            	pdParam.classNm = "CAPAR120-pdCd-wrap";
	            	that.selectPdCd(pdParam);
	            	
	            	//계약상품규칙유형
	            	that.changeArrPdRuleTpCdDetl(pdParam);

	            	if(data.arrPdRuleTpCd == "07"){
	            		that.$el.find('.CAPAR120-detail-table [data-form-param="txtArrPdRuleCntnt"]').val(data.arrPdRuleNm); 
	            	}else{
	            		that.selectArrPdRuleCntn(data);
	            	}


	            	that.$el.find('.CAPAR120-detail-table [data-form-param="bizDscd"]').prop("disabled", true);   // 업무구분
	            	that.$el.find('.CAPAR120-detail-table [data-form-param="pdTpCd"]').prop("disabled", true);    // 상품유형코드
	            	that.$el.find('.CAPAR120-detail-table [data-form-param="pdTmpltCd"]').prop("disabled", true); // 상품템플릿코드
	            	that.$el.find('.CAPAR120-detail-table [data-form-param="pdCd"]').prop("disabled", true);      // 상품코드


                }


                /* ======================================================================== */
                /*    그리드 생성                                												*/
                /* ======================================================================== */
                , createGrid: function () {
                    var that = this;


                    this.$el.find(".CAPAR120-grid").html(this.CAPAR120Grid.render({'height': CaGridHeight}));
                } // end of createGrid


                , toggleArrPdRuleBase: function () {
                    fn_pageLayerCtrl(this.$el.find("#CAPAR120-base-table"),this.$el.find('#btn-up-base'));
                }


                , toggleArrPdRuleGrid: function () {
                    fn_pageLayerCtrl(this.$el.find("#CAPAR120-grid"),this.$el.find('#btn-up-grid'));
                }


                , toggleArrPdRuleDetl: function () {
                    fn_pageLayerCtrl(this.$el.find("#CAPAR120-detail-table"),this.$el.find('#btn-up-detail'));
                }


            })
            ; // end of Backbone.View.extend({


        return CAPAR120View;
    } // end of define function
)
; // end of define
