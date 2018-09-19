define(
		[ 'bx/common/config', 
		  'bx/common/common-info',
		  'bx-component/ext-grid/_ext-grid',
		  'app/views/page/popup/CAPCM/popup-class-search',
	 	  'text!app/views/page/CAPAT/404/_CAPAT404.html', 
	 	 ],


function(config, commonInfo, ExtGrid, PopupClassSearch, tpl) {


	var newSaveYn = true; //신규등록여부
	var deleteMbrshpList = new Array();//삭제할 멤버쉽규칙 목록


	var CAPAT404BaseView = Backbone.View
			.extend({
				tagName : 'section',
				className : 'bx-container CAPAT404-page',
				templates : {
					'tpl' : tpl
				},
				events : {
					'click .CAPAT404-mbrshp-list-save-btn' : 'saveCAPAT404MbrshpList', //필수 맴버쉽규칙 그리드 저장
					'click .CAPAT404-mbrshp-atrbt-save-btn' : 'saveCAPAT404MbrshpAtrbt', //필수 멤버쉽규칙 속성 저장

					'click .CAPAT404-mbrshp-list-reset-btn' : 'resetCAPAT404MbrshpList', //필수 맴버쉽규칙 그리드 초기화
					'click .CAPAT404-mbrshp-atrbt-reset-btn' : 'resetCAPAT404MbrshpAtrbt', //필수 멤버쉽규칙 속성 초기화					

					'click #btn-mbrshp-list-toggle' : 'popMbrshpListLayerCtrl', //필수 멤버쉽규칙 그리드 영역 접기
					'click #btn-mbrshp-atrbt-toggle' : 'popMbrshpAtrbtLayerCtrl', //필수 멤버쉽규칙 속성 영역 접기

					'click #btn-class-search': 'openClassSearchPopup' //호출클래스 popup

				},
				initialize : function(initData) {
					var that = this;

		            $.extend(that,initData);

		            // 페이지 템플릿 설정
		            that.$el.html(that.tpl());

		            // init data set
		            if(commonInfo.getInstInfo().instCd) {
		              	that.instCd = commonInfo.getInstInfo().instCd;
		            }
		            else {
		            	that.instCd = $.sessionStorage('instCd');
		            }

                    //콤보정보 생성
                    that.setComboStore();
		            that.setComboBoxes();
                    
		            //그리드 생성
		            that.createMbrshpListGrid();
		            
		            //속성초기화
		            that.resetCAPAT404MbrshpAtrbt();
		            
		            //최초조회
		            that.loadGridData();
				},
				

	            /*
	             *  Set combo store
	             */


	            setComboStore: function () {
	                var that = this;


	                that.comboStore1 = {}; // 액터역할코드  AtrlCd

	                var sParam = {};

	                // 액터역할코드
	                sParam = {};
	                sParam.cdNbr = "A1037";
	                var linkData1 = {
	                    "header": fn_getHeader("CAPCM0038400"),
	                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
	                };
	                
	                bxProxy.all([
	  		              // 액터역할코드 콤보코드 로딩
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
	  	          ], {
	                    success: function () {}
	                });
	            },
	            
				setComboBoxes : function(){
					var that = this;
					
  	                var sParam = {};
  	                sParam.className = "CAPAT404-dtl-atrlCd-wrap";
  	                sParam.nullYn = "Y";
  	                sParam.cdNbr = "A1037";
  	                sParam.viewType = "ValNm";
  	                fn_getCodeList(sParam, that);
				},
				
				render : function() {
					var that = this;

					//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPAT404-mbrshp-list-save-btn')
                                        		,this.$el.find('.CAPAT404-mbrshp-atrbt-save-btn')
                                        			   ]);
                	return this.$el;
				},

	            openClassSearchPopup: function () {
	                var that = this;
	                var sParam ={};
	                sParam.useSubsetCdYn = 'Y';                
	                this.popupClassSearch = new PopupClassSearch(sParam);
	                this.popupClassSearch.render();
	                this.popupClassSearch.on('popUpSetData', function (data) {
	                    that.$el.find('#base-attribute-area [data-form-param="callClassNm"]').val(data.classNm);
	                });
	            },

				/**
				 * 액터역할파라미터 그리드 생성
				 */
				createMbrshpListGrid : function(){
					var that = this;
                    that.CAPAT404Grid = new ExtGrid({

                        // 그리드 컬럼 정의
                        fields: ['No', 'atrlCd', 'atrlParmSeqNbr', 'pdCd', 'pdNm' ,'classNm','clearMbrshp']
                        , id: 'CAPAT404Grid'
                        , columns: [
            	              {
            	            	  text:'No'
            	            		  ,dataIndex: 'rowIndex'
            	            			  ,sortable : false
            	            			  , height : 25, flex: 1, style: 'text-align:center', align: 'center'
        	            				  ,renderer : function(value, metaData, record, rowIndex, colIndex, sotre) {
        	            					  return rowIndex+1;
        	            				  }
            	              } 
                    		  , {
                                text: bxMsg('cbb_items.AT#atrlCd')
                                , dataIndex: 'atrlCd'
                                , sortable: false
                                , flex: 2
                                , style: 'text-align:center'
                                , align: 'center'
                                , height : 25
                                , renderer: function(val) {
                             	   index = comboStore1.findExact('cd', val);
                                    if(index != -1) {
                                 	   rs = comboStore1.getAt(index).data;
                                        return rs.cdNm;
                                    }
                                } // end of render	
                    		  }
                     		 , {
                                 text: bxMsg('cbb_items.AT#atrlParmSeqNbr')
                                 , dataIndex: 'atrlParmSeqNbr'
                                 , sortable: false
                                 , flex: 2
                                 , style: 'text-align:center'
                                 , align: 'center'
                                 , height : 25
                     		  }   
                    		 , {
                                 text: bxMsg('cbb_items.AT#pdCd')
                                 , dataIndex: 'pdCd'
                                	 , sortable : false 
                                 , flex : 2
                                 , editor: 'textfield'
                                 , style: 'text-align:center'
                                 , align: 'center'
                                 , height : 25
                    		 }                      		  
                    		 , {
                                 text: bxMsg('cbb_items.AT#classNm')
                                 , dataIndex: 'classNm'
                                 , sortable: false
                                 , flex: 2
                                 , style: 'text-align:center'
                                 , align: 'center'
                                 , height : 25
                     		  }
                     		, {
                                xtype: 'actioncolumn',
                                width: 80,
                                align: 'center',
                                text: bxMsg('cbb_items.SCRNITM#del'),
                                style: 'text-align:center',
                                items: [
                                    {
                                        //  icon: 'images/icon/x-delete-16.png'
                                        iconCls: "bw-icon i-25 i-func-trash",
                                        tooltip: bxMsg('tm-layout.delete-field'),
                                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                 	                	   var dataList = that.CAPAT404Grid.getAllData();

                	                	   var data = {};
                	                	   data.atrlCd = dataList[rowIndex].atrlCd;
                	                	   data.atrlParmSeqNbr = dataList[rowIndex].atrlParmSeqNbr;
                	                	   deleteMbrshpList.push(data);
                	                	   
                	                	   grid.store.remove(record);
                	                	}
                                    }
                                ]
                            }

                    	] // end of columns
	                    , listeners: {click: {element: 'body',
	 			             	fn: function(){
	 			             		//클릭시 이벤트 발생
	 			             		that.selectMbrshp();
	 			             	}
	                    	} 
	                    }
                      });


                    //그리드 렌더
    	            that.$el.find("#CAPAT404-mbrshp-list-grid").html(that.CAPAT404Grid.render({'height': '240px'}));//5개 조회


    	            //그리드에 데이터 로드
    	            that.loadGridData();
				},


				/**
				 * 그리드에 데이터 로드
				 */
				loadGridData : function(){
					var that = this;

					var header =  new Object(); 
	                header = fn_getHeader("CAPAT4040401");

	                var sParam = {}; 
	                sParam.instCd = that.instCd;

	                var linkData = {"header" : header , "CaActorRolePSvcSrchListIn" : sParam};

	                // ajax 호출
	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	                	enableLoading: true,
	                	success: function(responseData){
	                		if(fn_commonChekResult(responseData)) {
	                			that.CAPAT404MbrshpInfoList = responseData.CaActorRolePSvcSrchListOut.parmList;	

	                			//set gride data
	        					that.CAPAT404Grid.setData(that.CAPAT404MbrshpInfoList);

	        					deleteMbrshpList = new Array();
	                		}
	                	}
	                });	


				},


				/**
				 * 액터 역할 파라미터 그리드 초기화
				 */
				resetCAPAT404MbrshpList : function(){
					var that = this;
				    that.CAPAT404Grid.setData(that.CAPAT404MbrshpInfoList);
				    deleteMbrshpList = new Array();
				},

				/**
				 * 액터 역할 파라미터 속성 저장
				 */
				saveCAPAT404MbrshpAtrbt: function(){
					var that = this;
					if(that.newSaveYn){
						if(that.$el.find('[data-form-param="atrlCd"]').val() == ""){
							fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.AT#atrlCd") + "]");
						}else if(that.$el.find('[data-form-param="pdCd"]').val() == "") {
							fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.AT#pdCd") + "]");
						}else if(that.$el.find('[data-form-param="callClassNm"]').val() == "") {
							fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.AT#callClassNm") + "]");
						}else{
							that.registerCustMbrshpCd();
						}
					}else{
						that.modifyCustMbrshpCd();
					}
				},


				/**
				 * 액터 역할 파라미터 신규등록
				 */
				registerCustMbrshpCd : function(){


					var that = this;
					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }

					var header =  new Object(); 
	                header = fn_getHeader("CAPAT4040101");


	                var sParam = {}; 
	                sParam.instCd = that.instCd;
	                sParam.atrlCd = that.$el.find('[data-form-param="atrlCd"]').val();
	                sParam.pdCd = that.$el.find('[data-form-param="pdCd"]').val();
	                sParam.classNm = that.$el.find('[data-form-param="callClassNm"]').val();


	                var linkData = {"header" : header , "CaActorRolePSvcRgstListIn" : sParam};


	                // ajax 호출
	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	                	enableLoading: true,
	                	success: function(responseData){
	                		if(fn_commonChekResult(responseData)) {
	                			fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));	
	                			that.resetCAPAT404MbrshpAtrbt();
	                			that.loadGridData();
	                		}
	                	}
	                });	


				},


				/**
				 * 액터 역할 파라미터 변경
				 */
				modifyCustMbrshpCd: function(){


					var that = this;
					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }

					var header =  new Object(); 
	                header = fn_getHeader("CAPAT4040201");


	                var sParam = {}; 
	                sParam.instCd = that.instCd;
	                sParam.atrlCd = that.$el.find('[data-form-param="atrlCd"]').val();
	                sParam.atrlParmSeqNbr = that.$el.find('[data-form-param="atrlParmSeqNbr"]').val();
	                sParam.pdCd = that.$el.find('[data-form-param="pdCd"]').val();
	                sParam.classNm = that.$el.find('[data-form-param="callClassNm"]').val();

	                var linkData = {"header" : header , "CaActorRolePSvcChngListIn" : sParam};

	                // ajax 호출
	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	                	enableLoading: true,
	                	success: function(responseData){
	                		if(fn_commonChekResult(responseData)) {
	                			fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
	                			that.resetCAPAT404MbrshpAtrbt();
	                			that.loadGridData();
	                		}
	                	}
	                });
				},


				/**
				 * 액터 역할 파라미터 그리드 저장(삭제)
				 */
				saveCAPAT404MbrshpList: function(){


					var that = this;
					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }

					var header =  new Object(); 
	                header = fn_getHeader("CAPAT4040301");


	                var sParam = {}; 
	                var delList = new Array();


					for(var i = 0 ; i < deleteMbrshpList.length ; i++){
						var row = {};


						row.instCd = that.instCd;
						row.atrlCd = deleteMbrshpList[i].atrlCd;
						row.atrlParmSeqNbr = deleteMbrshpList[i].atrlParmSeqNbr;


						delList.push(row);
					}
					sParam.delList = delList;

	                var linkData = {"header" : header , "CaCustMbrshpCdSvcDeleteListIn" : sParam};

					fn_confirmMessage(event, '', bxMsg('cbb_items.SCRNITM#data-delete-msg'), function(){
		                // ajax 호출
		                bxProxy.post(sUrl, JSON.stringify(linkData),{
		                	enableLoading: true,
		                	success: function(responseData){
		                		if(fn_commonChekResult(responseData)) {
		                			fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));	   
		                			that.resetCAPAT404MbrshpAtrbt();
		                			that.loadGridData();
		                		}
		                	}
		                });						
					});
				},


				/**
				 * 액터 역할 파라미터 속성 영역 초기화
				 */
				resetCAPAT404MbrshpAtrbt : function(){
					var that = this;
					that.newSaveYn = true;

        			that.$el.find('[data-form-param="atrlCd"]').attr('disabled', false);
        			that.$el.find('[data-form-param="atrlParmSeqNbr"]').attr('disabled', true);

        			that.$el.find('[data-form-param="atrlCd"]').val("");
        			that.$el.find('[data-form-param="atrlParmSeqNbr"]').val("");
        			that.$el.find('[data-form-param="pdCd"]').val("");
        			that.$el.find('[data-form-param="callClassNm"]').val("");

				},


				/**
				 * 그리드에서 액터 역할 파라미터 선택
				 */
				selectMbrshp : function(){
	                var that = this;
	                var selectedItem = that.CAPAT404Grid.grid.getSelectionModel().selected.items[0];


	                if(!selectedItem){
	                    return;
	                }
					that.newSaveYn = false;


        			that.$el.find('[data-form-param="atrlCd"]').attr('disabled', true);
        			that.$el.find('[data-form-param="atrlParmSeqNbr"]').attr('disabled', true);

        			that.$el.find('[data-form-param="atrlCd"]').val(selectedItem.data.atrlCd);
        			that.$el.find('[data-form-param="atrlParmSeqNbr"]').val(selectedItem.data.atrlParmSeqNbr);
        			that.$el.find('[data-form-param="pdCd"]').val(selectedItem.data.pdCd);
        			that.$el.find('[data-form-param="callClassNm"]').val(selectedItem.data.classNm);

				},


	            /**
	             * 기타 화면 설정
	             */
				popMbrshpListLayerCtrl : function(){
	        		var that = this;
	        		fn_pageLayerCtrl(that.$el.find("#mbrshp-list-area"));
	            },
	            popMbrshpAtrbtLayerCtrl : function(){
	        		var that = this;
	        		fn_pageLayerCtrl(that.$el.find("#mbrshp-atrbt-area"));
	            }
			});


	return CAPAT404BaseView;
});
