define(
    [
        'bx/common/config'
        , 'text!app/views/page/CAPAR/060/_CAPAR060.html'
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
        var CAPAR060View = Backbone.View.extend({
                // 태그이름 설정
                tagName: 'section'
                // 클래스이름 설정
                , className: 'bx-container CAPAR060-page'
                // 탬플릿 설정
                , templates: {
                    'tpl': tpl
                }
                // 이벤트 설정
                , events: {
                	'click #btn-tree-search' : 'loadTreeList'
            		, 'keydown #searchKey' : 'fn_enter'
            		, 'click #btn-search-reset' : 'resetSearch'
					, 'click #btn-xtn-search': 'inquiryServiceData'
					, 'click #btn-search-toggle': 'toggleSearch'
					, 'click #btn-grid-save': 'clickSaveGrid'
					, 'click #btn-grid-toggle': 'toggleGrid'
					, 'click #btn-base-reset': 'resetBase'
					, 'click #btn-base-save': 'clickSaveBase'
					, 'click #btn-base-toggle': 'toggleBase'
					, 'click #btn-attribute-search': 'openXtnAtrbtSearchPopup'	
					, 'click #btn-class-search': 'openClassSearchPopup'		
					, 'change .CAPAR060-bizDscd-wrap' : 'changeBizDscd'
					, 'change .CAPAR060-pdTpCd-wrap' : 'changePdTpCd'
					, 'change .CAPAR060-pdTmpltCd-wrap' : 'changePdTmpltCd'					
                }


//
//
//
                , initialize: function (initData) {
                    var that = this;
                    that.that = this;


                    var deleteList = [];


                    $.extend(that, initData);
                    that.$el.html(that.tpl());


                    that.initData = initData;


                    that.CAPAR060Grid01 = new ExtGrid({
                    	// 그리드 컬럼 정의
                    	fields: ['rowIndex', 'instCd', 'xtnAtrbtNm', 'atrbtNm', 'xtnAtrbtClassNm', 'bizDscd', 'bizDscdNm', 'pdTpNm', 'pdTpCd', 'pdTmpltCd', 'pdTmpltNm', 'pdCd', 'pdNm']
                    , id: 'CAPAR060Grid01'
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
                    	            	text:bxMsg('cbb_items.AT#stdYn') 
                    	            	, dataIndex : 'instCd'
                    	            		, sortable: true
                    	            		, flex : 2
                    	            		, style: 'text-align:center' 
                    	            			, align:'center'
                    	            				, renderer: function(instCd) {
                    	            					if(instCd == "STDA")
                    	            						return bxMsg('cbb_items.CDVAL#119091');
                    	            					else
                    	            						return bxMsg('cbb_items.CDVAL#119092'); 	
                    	            				} 
                    	            }                                        
                    	            , {text: bxMsg('cbb_items.AT#xtnAtrbtNm'), flex: 3, dataIndex: 'xtnAtrbtNm', style: 'text-align:center', align: 'left'}                                        
                    	            , {text: bxMsg('cbb_items.AT#atrbtNm'), flex: 4, dataIndex: 'atrbtNm', style: 'text-align:center', align: 'left'}
                    	            , {text: bxMsg('cbb_items.AT#xtnAtrbtClassNm'), flex: 5, dataIndex: 'xtnAtrbtClassNm', style: 'text-align:center', align: 'left'}
                    	            , {text: bxMsg('cbb_items.SCRNITM#bizDscd'), flex: 2, dataIndex: 'bizDscdNm', style: 'text-align:center', align: 'center'}
                    	            , {text: bxMsg('cbb_items.SCRNITM#pdTpCd'), flex: 3, dataIndex: 'pdTpNm', style: 'text-align:center', align: 'center'}
                    	            , {text: bxMsg('cbb_items.SCRNITM#pdTmpltCd'), flex: 3, dataIndex: 'pdTmpltNm', style: 'text-align:center', align: 'center'}
                    	            , {text: bxMsg('cbb_items.SCRNITM#pdCd'), flex: 5, dataIndex: 'pdNm', style: 'text-align:center', align: 'left'}
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
                    			, fn: function (currentTarget, e) {
                    				that.clickGridItem();                                    			
                    			}
                    	} 
                    }
                    });
                    
                    
                    that.CAPAR060Grid02 = new ExtGrid({
                    	// 그리드 컬럼 정의
                    	fields: ['rowIndex', 'upClNm', 'clNm']
                    	, id: 'CAPAR060-grid02'
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
                    	            , {text: bxMsg('cbb_items.AT#bizDsNm'), flex: 5, dataIndex: 'upClNm', style: 'text-align:center', align: 'center'}
                    	            , {text: bxMsg('cbb_items.AT#arrSrvcTpNm'), flex: 5, dataIndex: 'clNm', style: 'text-align:center', align: 'center'}                    	            
                    	]            
                    });


                    // 단일탭 그리드 렌더
                    that.createGrid();
                    var sParam = {};
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                    that.inquiryServiceData(sParam);               
                }                
                /**
                 * 서비스 입력 항목의 그리드 항목 클릭
                 */
                , clickGridItem: function () {
                	var selectedRecord = this.CAPAR060Grid01.grid.getSelectionModel().selected.items[0];


                	if (!selectedRecord) {
                		return;
                	} else {
                		this.setServiceTypeItem(selectedRecord.data);
                		this.inquiryApplyTargetServiceTypeList(selectedRecord.data);
                	}                    
                } 
                /**
                 * 서비스 입력 항목 영역을 받아온 데이터로 세팅
                 * @param data 서버로부터 받아온 데이터
                 */
                , setServiceTypeItem: function (data) {


                	var that = this;


                    this.$el.find('#CAPAR060-base-table [data-form-param="xtnAtrbtNm2"]').val(data.xtnAtrbtNm);
                    this.$el.find('#CAPAR060-base-table [data-form-param="atrbtNm2"]').val(data.atrbtNm);
                    this.$el.find('#CAPAR060-base-table [data-form-param="xtnAtrbtClassNm2"]').val(data.xtnAtrbtClassNm);
                    this.$el.find('#btn-attribute-search').prop("disabled", true);
                    that.updateYn = 'Y';


                    this.selectBizDscd(data);


                    this.selectPdTpCd(data);


                    this.selectPdTmpltCd(data);


                    this.selectPdCd(data);
                }

                
                , inquiryApplyTargetServiceTypeList: function(data) {
                	
                	var that = this;
                	
                	var sParam = {};
                	sParam.instCd = data.instCd;
                	sParam.xtnAtrbtNm = data.xtnAtrbtNm;
                	
                	var linkData = {"header": fn_getHeader("CAPAR0308405"), "CaArrXtnAtrbtCntrlSvcGetListSrvcTpByXtnAtrbtIn": sParam};

					// ajax호출
					bxProxy.post(sUrl, JSON.stringify(linkData), {		
						enableLoading: true
						, success: function (responseData) {
							if (fn_commonChekResult(responseData)) {		
								
								
								var tbList = responseData.CaArrXtnAtrbtCntrlSvcGetListSrvcTpByXtnAtrbtOutList.tblList;
								
								var totCnt = tbList.length;
								that.$el.find("#ServiceListCount").html(bxMsg('cbb_items.SCRNITM#aplyTrgtArrSrvcTpList')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
							
								that.CAPAR060Grid02.setData(tbList);								
							}
						}   // end of suucess: fucntion
					}); // end of bxProxy
                }             


                , render: function () {
                    // 콤보데이터 로딩
                    var selectStyle = {};
                    var sParam;
                    sParam = {};                    


                    var sParam2;
                    sParam2 = {};
                	//업무구분코드 combobox
                    sParam2.className = "CAPAR060-bizDscd-wrap";
    	        	sParam2.targetId = "bizDscd";
                    sParam2.nullYn = "Y";
                    sParam2.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                    sParam2.viewType = "ValNm";
                    //inData 정보 셋팅
                    sParam2.cdNbr = "80015";
                    // 콤보데이터 load
                    fn_getCodeList(sParam2, this, selectStyle);


                    // 기본부 초기화
                    this.resetBase();

                  //배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPAR060-wrap #btn-grid-save')
                                        		,this.$el.find('.CAPAR060-wrap #btn-base-save')
                                        			   ]);
                    return this.$el;
                }


//
//
//
                , changeBizDscd: function() {
                	var that = this;
                	var param = {};
                	var bizDscd = that.$el.find('.CAPAR060-base-table [data-form-param="bizDscd"]').val(); //업무구분코드


                	param.bizDscd = bizDscd;


                    //상품중분류코드 재조회
                    that.selectPdTpCd(param);
                }


//
//
//
	            , changePdTpCd: function() {
	          	  	var that = this;
	          	  	var param = {};
	          	  	var bizDscd = that.$el.find('.CAPAR060-base-table [data-form-param="bizDscd"]').val(); //업무구분코드
	          	  	var pdTpCd = that.$el.find('.CAPAR060-base-table [data-form-param="pdTpCd"]').val(); // 상품유형코드


	          	  	param.bizDscd = bizDscd;
	          	  	param.pdTpCd = pdTpCd;


	          	  	//상품중분류코드 재조회
	          	  	that.selectPdTmpltCd(param);
	            }


//
//
//
			    , changePdTmpltCd: function() {
			    	var that = this;
			    	var param = {};
			    	var bizDscd = that.$el.find('.CAPAR060-base-table [data-form-param="bizDscd"]').val(); //업무구분코드
	          	  	var pdTpCd = that.$el.find('.CAPAR060-base-table [data-form-param="pdTpCd"]').val(); // 상품유형코드
	          	  	var pdTmpltCd = that.$el.find('.CAPAR060-base-table [data-form-param="pdTmpltCd"]').val(); // 상품템플릿코드


	          	  	param.bizDscd = bizDscd;
	          	  	param.pdTpCd = pdTpCd;
	          	  	param.pdTmpltCd = pdTmpltCd;


			        //상품중분류코드 재조회
			        that.selectPdCd(param);
			    }   


//
//
//
			    , selectBizDscd: function(param) {
			    	var that = this;
			    	var sParam = {};
			    	var selectStyle = {};


			    	//combobox 정보 셋팅
			    	sParam.className = "CAPAR060-bizDscd-wrap";
			    	sParam.targetId = "bizDscd";
			    	sParam.nullYn = "Y";
			    	sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
			    	sParam.cdNbr = "80015";


			    	var instInfo = commonInfo.getInstInfo();
			    	sParam.instCd = instInfo.instCd;


			    	if(param.bizDscdNm) {
			    		sParam.selectVal = param.bizDscd;
			    		sParam.disabled = true;
			    	}


			    	// 콤보데이터 load
			    	fn_getCodeList(sParam, this, selectStyle);  // 상품유형코드


			    	//상품유형코드 초기화
			    	that.initPdTpCd();


			    	//상품템플릿 초기화
			    	that.initPdTmpltCd();


			    	//상품코드 초기화
			    	that.initPdCd();
			    }


//
//
//
                , selectPdTpCd: function(param) {
                	var that = this;
                	var sParam = {};
                	var selectStyle = {};


                    if(param.bizDscd == "") {
                    	//상품중분류코드 초기화
                        that.initPdTpCd();
                    }
                    else {
                    	//combobox 정보 셋팅
                    	sParam.className = "CAPAR060-pdTpCd-wrap";
                    	sParam.targetId = "pdTpCd";
                    	sParam.nullYn = "Y";
                    	sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
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
                    	fn_getPdCodeList(sParam, this, selectStyle);  // 상품유형코드
                    }


                    //상품템플릿 초기화
                    that.initPdTmpltCd();


                    //상품코드 초기화
                    that.initPdCd();
                }


//
//
//
          , selectPdTmpltCd: function(param) {
          	  var that = this;
          	  var sParam = {};
          	  var selectStyle = {};


              if(param.pdTpCd == "") {
              	//상품중분류코드 초기화
                  that.initPdTmpltCd();
              }
              else {
              	//combobox 정보 셋팅
              	sParam.className = "CAPAR060-pdTmpltCd-wrap";
              	sParam.targetId = "pdTmpltCd";
              	sParam.nullYn = "Y";
              	sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
              	//inData 정보 셋팅
              	sParam.bizDscd = param.bizDscd;
              	sParam.pdTpCd = param.pdTpCd;


              	var instInfo = commonInfo.getInstInfo();
              	sParam.instCd = instInfo.instCd;


              	if(param.pdTmpltNm) {
              		sParam.selectVal = this.unFillBlank(param.pdTmpltCd);
              		sParam.disabled = true;
              	}


              	// 콤보데이터 load
              	fn_getPdCodeList(sParam, this, selectStyle);  // 상품템플릿코드
              }


              //상품코드 초기화
              that.initPdCd();
          }


//
//
//
    , selectPdCd: function(param) {
    	var that = this;
    	var sParam = {};
    	var selectStyle = {};


        if(param.pdTmpltCd == "") {
        	//상품중분류코드 초기화
            that.initPdCd();
        }
        else {
        	//combobox 정보 셋팅
        	sParam.className = "CAPAR060-pdCd-wrap";
        	sParam.targetId = "pdCd";
        	sParam.nullYn = "Y";
        	sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
        	//inData 정보 셋팅
        	sParam.bizDscd = param.bizDscd;
        	sParam.pdTpCd = param.pdTpCd;
        	sParam.pdTmpltCd = param.pdTmpltCd;


        	var instInfo = commonInfo.getInstInfo();
        	sParam.instCd = instInfo.instCd;


        	if(param.pdNm) {
        		sParam.selectVal = this.unFillBlank(param.pdCd);
        		sParam.disabled = true;
        	}


        	// 콤보데이터 load
        	fn_getPdCodeList(sParam, this, selectStyle);  // 상품중분류코드
        }
    }

    , unFillBlank: function(obj){
    	if(obj == "@")
    		return "";
    	else
    		return obj;
    }
//
//
//
			    , initBizDscd : function () {
			    	var sParam = {};
			    	var selectStyle = {};
			    	//상품유형코드 리셋
			    	sParam.className = "CAPAR060-bizDscd-wrap";
			    	sParam.targetId = "bizDscd";
			    	fn_getEmptyCombo(sParam, this, selectStyle); //상품코드
			    }


    			, initPdTpCd : function () {
                	//상품유형코드 리셋
                	var selectPdTpCd = this.$el.find('.CAPAR060-base-table [data-form-param="pdTpCd"]');
                	selectPdTpCd.empty();
                	selectPdTpCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                }


                , initPdTmpltCd : function () {
                	//상품템플릿코드 리셋
                	var selectPdTmpltCd = this.$el.find('.CAPAR060-base-table [data-form-param="pdTmpltCd"]');
                	selectPdTmpltCd.empty();
                	selectPdTmpltCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                }


                , initPdCd : function () {
                	//상품코드 리셋
                	var selectPdCd = this.$el.find('.CAPAR060-base-table [data-form-param="pdCd"]');
                	selectPdCd.empty();
                	selectPdCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                }


//
//
//
                , fn_enter : function(event) {
          	      	var event = event || window.event;
          	      	var keyID = (event.which) ? event.which : event.keyCode;
          	      	if(keyID == 13) { //enter
          	      		this.loadTreeList();
          	      	}
                }


//
//
//
                , inquiryServiceData: function (param) {	 
                    // header 정보 set
                    var that = this;
                    that.deleteList = [];


                    var sParam = {};


                    sParam.xtnAtrbtNm = that.$el.find('.CAPAR060-base-table [data-form-param="xtnAtrbtNm1"]').val();
                    sParam.xtnAtrbtClassNm = that.$el.find('.CAPAR060-base-table [data-form-param="xtnAtrbtClassNm1"]').val();


                    console.log(sParam);


               	  	var instInfo = commonInfo.getInstInfo();
               	  	if(that.pageArg == 'STDA') {
      					sParam.instCd = 'STDA';
      				}else{
                  		sParam.instCd = instInfo.instCd;
      				}	              


                    var linkData = {"header": fn_getHeader("CAPAR0608401"), "CaArrXtnAtrbtCntrlClassInqryIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData),{
                  	  enableLoading: true,
                        success: function(responseData){
                      	  if(fn_commonChekResult(responseData)) {
                      		  var tbList = responseData.CaArrXtnAtrbtCntrlClassItmListOut.tblList;


                      		  var totCnt = tbList.length;


                                if(tbList != null|| tbList.length > 0) {
                                	that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                    that.CAPAR060Grid01.setData(tbList);
                                    that.oldData = tbList;
                                    that.initFag = true;
                                }
                                else {
                                    that.CAPAR060Grid01.resetData();
                                }


                                that.resetBase();
                            }
                         }   // end of suucess: fucntion
                     }); // end of bxProxy                                       
                } // end


//
//
//
			, clickSaveGrid : function(event) {
				if(!this.deleteList.length){
					return;
				}
				//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
				fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveGrid, this);
			}


//
//
//
			, saveGrid : function(that) {			


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
					item.instCd = instCd;
					item.xtnAtrbtNm = value.xtnAtrbtNm;
					item.xtnAtrbtClassNm = value.xtnAtrbtClassNm
					item.bizDscd = value.bizDscd;
					item.pdTpCd = value.pdTpCd;
					item.pdTmpltCd = value.pdTmpltCd;
					item.pdCd = value.pdCd;
					list.push(item);
				});
				sParam.arrXtnAtrbtList = list;


				var linkData = {"header": fn_getHeader("CAPAR0608301"), "CaArrXtnAtrbtListCntrlClassSaveIn": sParam};


				// ajax호출
				bxProxy.post(sUrl, JSON.stringify(linkData), {		
					enableLoading: true
					, success: function (responseData) {
						if (fn_commonChekResult(responseData)) {		
							fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
							that.inquiryServiceData(sParam);
						}
					}   // end of suucess: fucntion
				}); // end of bxProxy
			}


//
//
//
				, clickSaveBase : function(event) {
					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }
					fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), this.saveBase, this);
				}


//
//
//
				, saveBase : function(that) {			


					var sParam = {};
					sParam.instCd = commonInfo.getInstInfo().instCd;
					sParam.xtnAtrbtNm = that.$el.find('.CAPAR060-base-table [data-form-param="xtnAtrbtNm2"]').val();
					sParam.xtnAtrbtClassNm = that.$el.find('.CAPAR060-base-table [data-form-param="xtnAtrbtClassNm2"]').val();
					sParam.bizDscd = that.$el.find('.CAPAR060-base-table [data-form-param="bizDscd"] option:selected').val();
					sParam.pdTpCd = that.$el.find('.CAPAR060-base-table [data-form-param="pdTpCd"] option:selected').val();
					sParam.pdTmpltCd = that.$el.find('.CAPAR060-base-table [data-form-param="pdTmpltCd"] option:selected').val();
					sParam.pdCd = that.$el.find('.CAPAR060-base-table [data-form-param="pdCd"] option:selected').val();


					var srvcCd = "CAPAR0608101";	// save new one
					if(that.updateYn == "Y"){
						srvcCd = "CAPAR0608201";	// update
					} 


					var linkData = {"header": fn_getHeader(srvcCd), "CaArrXtnAtrbtCntrlClassSaveIn": sParam};


					// ajax호출
					bxProxy.post(sUrl, JSON.stringify(linkData), {		
						enableLoading: true
						, success: function (responseData) {
							if (fn_commonChekResult(responseData)) {		
								fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
								that.inquiryServiceData(sParam);
							}
						}   // end of suucess: fucntion
					}); // end of bxProxy
				}




//
//
//
  ,openXtnAtrbtSearchPopup: function () {
     	var that = this;
     	var sParam = {};
        sParam.xtnAtrbtNm = that.$el.find('#CAPAR060-base-table [data-form-param="xtnAtrbtNm2"]').val();  


 		this.popupAttributeSearch = new PopupAttributeSearch(sParam);
 		this.popupAttributeSearch.render();
 		this.popupAttributeSearch.on('popUpSetData', function (data) {


 			that.$el.find('#CAPAR060-base-table [data-form-param="xtnAtrbtNm2"]').val(data.atrbtCd);   
 			that.$el.find('#CAPAR060-base-table [data-form-param="atrbtNm2"]').val(data.loginLngAtrbtNm);   
// 			that.xtnAtrbtNm = data.atrbtCd;
// 			that.atrbtNm = data.atrbtNm;




 		});
  }


  ,openClassSearchPopup : function () {
	  	var that = this;
     	var sParam = {};
     	sParam.cmpntCd = "ARB";
       	sParam.classLayerTp = "AR_XTN_ATRBT";
     	sParam.classNm = that.$el.find('#CAPAR060-base-table [data-form-param="xtnAtrbtClassNm2"]').val();          
     	console.log(sParam);
     	var popupClassSearch = new PopupClassSearch(sParam);
     	popupClassSearch.render();


     	popupClassSearch.on('popUpSetData', function (data) {
     		that.$el.find('#CAPAR060-base-table [data-form-param="xtnAtrbtClassNm2"]').val(data.classNm);
     	});
  }


//
//
//
                , createGrid: function () {
                    var that = this;


                    this.$el.find(".CAPAR060-grid01").html(this.CAPAR060Grid01.render({'height': CaGridHeight}));
                    this.$el.find(".CAPAR060-grid02").html(this.CAPAR060Grid02.render({'height': "240px"}));
                } // end of createGrid


//
//
//
                , resetSearch : function() {
                	this.$el.find('#CAPAR060-search [data-form-param="xtnAtrbtNm1"]').val("");
                	this.$el.find('#CAPAR060-search [data-form-param="xtnAtrbtClassNm1"]').val("");
                }


//
//
//
                , resetBase : function() {


                	var that = this;


                	this.$el.find('#CAPAR060-base-table [data-form-param="xtnAtrbtNm2"]').val("");
                	this.$el.find('#CAPAR060-base-table [data-form-param="atrbtNm2"]').val("");
                	this.$el.find('#CAPAR060-base-table [data-form-param="xtnAtrbtClassNm2"]').val("");
                	this.$el.find('#btn-attribute-search').prop("disabled", false);
                	var bizDscd = this.$el.find('#CAPAR060-base-table [data-form-param="bizDscd"]');
                	var pdTpCd = this.$el.find('#CAPAR060-base-table [data-form-param="pdTpCd"]');
                	var pdTmpltCd = this.$el.find('#CAPAR060-base-table [data-form-param="pdTmpltCd"]');
                	var pdCd = this.$el.find('#CAPAR060-base-table [data-form-param="pdCd"]');
                	bizDscd.val("");
                	bizDscd.attr("disabled", false);
                	that.updateYn = 'N';


                	//상품유형코드 초기화
	                this.initPdTpCd();


	                //상품템플릿 초기화
	                this.initPdTmpltCd();


	                //상품코드 초기화
	                this.initPdCd();


	                var instCd = commonInfo.getInstInfo().instCd;
                	if(instCd == "STDA"){
                		pdTpCd.attr("disabled", true);
                    	pdTmpltCd.attr("disabled", true);
                    	pdCd.attr("disabled", true);
					}else{
						pdTpCd.attr("disabled", false);
	                	pdTmpltCd.attr("disabled", false);
	                	pdCd.attr("disabled", false);
					}	
                }


//
//
//
                , toggleSearch : function() {
                	fn_pageLayerCtrl("#CAPAR060-search");
                }


//
//
//
                , toggleGrid : function() {
                	fn_pageLayerCtrl("#CAPAR060-grid01");
                }


//
//
//
		        , toggleBase : function() {
		        	fn_pageLayerCtrl("#CAPAR060-base-table");
		        }




            })
            ; // end of Backbone.View.extend({


        return CAPAR060View;
    } // end of define function
)
; // end of define
