define(
		[ 'bx/common/config', 
		  'bx/common/common-info',
		  'bx-component/ext-grid/_ext-grid',
	 	  'text!app/views/page/CAPAT/403/_CAPAT403.html', 
	 	 ],


function(config, commonInfo, ExtGrid, tpl) {


	var newSaveYn = true; //신규등록여부
	var deleteAgrmntList = new Array();//삭제할 동의유형 목록


	var CAPAT403BaseView = Backbone.View
			.extend({
				tagName : 'section',
				className : 'bx-container CAPAT403-page',
				templates : {
					'tpl' : tpl
				},
				events : {
					'click .CAPAT403-agrmnt-list-save-btn' : 'saveCAPAT403AgrmntList', //필수 고객정보 활용동의 그리드 저장
					'click .CAPAT403-agrmnt-atrbt-save-btn' : 'saveCAPAT403AgrmntAtrbt', //필수 고객정보 활용동의 속성 저장


					'click .CAPAT403-agrmnt-list-reset-btn' : 'resetCAPAT403AgrmntList', //필수 고객정보 활용동의 그리드 초기화
					'click .CAPAT403-agrmnt-atrbt-reset-btn' : 'resetCAPAT403AgrmntAtrbt', //필수 고객정보 활용동의 속성 초기화					


					'click #btn-agrmnt-list-toggle' : 'popAgrmntListLayerCtrl', //필수 고객정보 활용동의 그리드 영역 접기
					'click #btn-agrmnt-atrbt-toggle' : 'popAgrmntAtrbtLayerCtrl' //필수 고객정보 활용동의 속성 영역 접기


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


		            //콤보박스 설정
		            that.setComboBoxes();

		            //그리드 생성
		            that.createAgrmntListGrid();
		            
		            //속성초기화
		            that.resetCAPAT403AgrmntAtrbt();

				},
				render : function() {
					var that = this;

					//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPAT403-agrmnt-list-save-btn')
                                        		,this.$el.find('.CAPAT403-agrmnt-atrbt-save-btn')
                                        			   ]);
                	return this.$el;
				},


				/**
				 * 콤보박스 설정
				 */
				setComboBoxes: function(){
					var that = this;


  	                // combobox - yn
  	                var sParam = {};
  	                sParam.className = "mndtryYn-wrap";
  	                sParam.nullYn = "Y";
  	                sParam.selectVal = "Y";
  	                sParam.cdNbr = "10000";
  	                sParam.viewType = "val";
  	                fn_getCodeList(sParam, that);


				},


				/**
				 * 고객기본등급 그리드 생성
				 */
				createAgrmntListGrid : function(){
					var that = this;
                    that.CAPAT403Grid = new ExtGrid({


                        // 그리드 컬럼 정의
                        fields: ['No', 'agrmntTpCd', 'agrmntTpCdNm', 'agrmntMndtryYn' ,'clearAgrmnt']
                        , id: 'CAPAT403Grid'
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
                                text: bxMsg('cbb_items.AT#mndtryCustInfoUseAgrmntTpCd')
                                , dataIndex: 'agrmntTpCd'
                                , sortable: false
                                , flex: 7
                                , style: 'text-align:center'
                                , align: 'center'
                                , height : 25
                    		  }
                    		 , {
                                 text: bxMsg('cbb_items.SCRNITM#mndtryCustInfoUseAgrmntNm')
                                 , flex : 7
                                 , dataIndex: 'agrmntTpCdNm'
                                 , editor: 'textfield'
                                 , style: 'text-align:center'
                                 , align: 'center'
                                 , sortable : false 
                    		 }  
                     		, {  
                     			dataIndex: 'agrmntMndtryYn'
                     			, text: bxMsg('cbb_items.SCRNITM#mndtryYn')
                     			, style: 'text-align:center'
                     			, align: 'center'
                     			, sortable : false
                     			, flex : 7
                              	, renderer : function(val) {
                            		var classNm = "s-no";
                            		if(val == 'Y') {
                            			classNm = "s-yes";
                            		}
                            		return "<span class=\"bw-sign "+classNm+"\">"+val+"</span>";
                            	}
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
                 	                	   var dataList = that.CAPAT403Grid.getAllData();

                	                	   var data = {};
                	                	   data.agrmntTpCd = dataList[rowIndex].agrmntTpCd;
                	                	   data.agrmntTpCdNm = dataList[rowIndex].agrmntTpCdNm;
                	                	   data.agrmntMndtryYn = dataList[rowIndex].agrmntMndtryYn;
                	                	   deleteAgrmntList.push(data);
                	                	   
                	                	   grid.store.remove(record);
                	                	}
                                    }
                                ]
                            }

                    	] // end of columns
	                    , listeners: {click: {element: 'body',
	 			             	fn: function(){
	 			             		//클릭시 이벤트 발생
	 			             		that.selectAgrmnt();
	 			             	}
	                    	} 
	                    }
                      });


                    //그리드 렌더
    	            that.$el.find("#CAPAT403-agrmnt-list-grid").html(that.CAPAT403Grid.render({'height': '240px'}));//5개 조회


    	            //그리드에 데이터 로드
    	            that.loadGridData();
				},


				/**
				 * 그리드에 데이터 로드
				 */
				loadGridData : function(){
					var that = this;


					var header =  new Object(); 
	                header = fn_getHeader("CAPAT1004031");


	                var sParam = {}; 
	                sParam.instCd = that.instCd;


	                var linkData = {"header" : header , "CaCustAgrmntCdSvcSrchIn" : sParam};


	                // ajax 호출
	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	                	enableLoading: true,
	                	success: function(responseData){
	                		if(fn_commonChekResult(responseData)) {
	                			that.CAPAT403AgrmntInfoList = responseData.CaCustAgrmntCdSvcSrchListOut.agrmntCodeList;	


	                			//set gride data
	        					that.CAPAT403Grid.setData(that.CAPAT403AgrmntInfoList);


	        					deleteAgrmntList = new Array();
	                		}
	                	}
	                });	


				},


				/**
				 * 고객 정보활용동의 그리드 초기화
				 */
				resetCAPAT403AgrmntList : function(){
					var that = this;
				    that.CAPAT403Grid.setData(that.CAPAT403AgrmntInfoList);
				    deleteAgrmntList = new Array();
				},




				/**
				 * 고객 정보활용동의 속성 저장
				 */
				saveCAPAT403AgrmntAtrbt: function(){
					var that = this;
					if(that.newSaveYn){
						if(that.$el.find('[data-form-param="mndtryCustInfoUseAgrmntTpCd"]').val() == ""){
							fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#mndtryCustInfoUseAgrmntTpCd") + "]");
						}else if(that.$el.find('[data-form-param="mndtryCustInfoUseAgrmntNm"]').val() == "") {
							fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#mndtryCustInfoUseAgrmntNm") + "]");
						}else if(that.$el.find('[data-form-param="mndtryYn"]').val() == "") {
							fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#mndtryYn") + "]");
						}else{
							that.registerCustAgrmntCd();
						}


					}else{
						that.modifyCustAgrmntCd();
					}
				},


				/**
				 * 고객 정보활용동의 신규등록
				 */
				registerCustAgrmntCd : function(){


					var that = this;
					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }

					var header =  new Object(); 
	                header = fn_getHeader("CAPAT1004032");


	                var sParam = {}; 
	                sParam.instCd = that.instCd;
	                sParam.agrmntTpCd = that.$el.find('[data-form-param="mndtryCustInfoUseAgrmntTpCd"]').val();
	                sParam.agrmntTpCdNm = that.$el.find('[data-form-param="mndtryCustInfoUseAgrmntNm"]').val();
	                sParam.agrmntMndtryYn = that.$el.find('[data-form-param="mndtryYn"]').val();


	                var linkData = {"header" : header , "CaCustAgrmntCdSvcRgstIn" : sParam};


	                // ajax 호출
	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	                	enableLoading: true,
	                	success: function(responseData){
	                		if(fn_commonChekResult(responseData)) {
	                			fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));	
	                			that.resetCAPAT403AgrmntAtrbt();
	                			that.loadGridData();
	                		}
	                	}
	                });	


				},


				/**
				 * 고객 정보활용동의 변경
				 */
				modifyCustAgrmntCd: function(){


					var that = this;
					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }

					var header =  new Object(); 
	                header = fn_getHeader("CAPAT1004033");


	                var sParam = {}; 
	                sParam.instCd = that.instCd;
	                sParam.agrmntTpCd = that.$el.find('[data-form-param="mndtryCustInfoUseAgrmntTpCd"]').val();
	                sParam.agrmntTpCdNm = that.$el.find('[data-form-param="mndtryCustInfoUseAgrmntNm"]').val();
	                sParam.agrmntMndtryYn = that.$el.find('[data-form-param="mndtryYn"]').val();


	                var linkData = {"header" : header , "CaCustAgrmntCdSvcRgstIn" : sParam};


	                // ajax 호출
	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	                	enableLoading: true,
	                	success: function(responseData){
	                		if(fn_commonChekResult(responseData)) {
	                			fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
	                			that.resetCAPAT403AgrmntAtrbt();
	                			that.loadGridData();
	                		}
	                	}
	                });
				},


				/**
				 * 고객 정보활용동의 그리드 저장(삭제)
				 */
				saveCAPAT403AgrmntList: function(){


					var that = this;
					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }

					var header =  new Object(); 
	                header = fn_getHeader("CAPAT1004034");


	                var sParam = {}; 
	                var deleteList = new Array();


					for(var i = 0 ; i < deleteAgrmntList.length ; i++){
						var row = {};


						row.instCd = that.instCd;
						row.agrmntTpCd = deleteAgrmntList[i].agrmntTpCd;


						deleteList.push(row);
					}
					sParam.deleteList = deleteList;




	                var linkData = {"header" : header , "CaCustAgrmntCdSvcDeleteListIn" : sParam};


					fn_confirmMessage(event, '', bxMsg('cbb_items.SCRNITM#data-delete-msg'), function(){
		                // ajax 호출
		                bxProxy.post(sUrl, JSON.stringify(linkData),{
		                	enableLoading: true,
		                	success: function(responseData){
		                		if(fn_commonChekResult(responseData)) {
		                			fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));	   
		                			that.resetCAPAT403AgrmntAtrbt();
		                			that.loadGridData();
		                		}
		                	}
		                });						
					});
				},


				/**
				 * 고객 정보활용동의 속성 영역 초기화
				 */
				resetCAPAT403AgrmntAtrbt : function(){
					var that = this;
					that.newSaveYn = true;


        			that.$el.find('[data-form-param="mndtryCustInfoUseAgrmntTpCd"]').attr('disabled', false);
        			that.$el.find('[data-form-param="mndtryCustInfoUseAgrmntNm"]').attr('disabled', false);


        			that.$el.find('[data-form-param="mndtryCustInfoUseAgrmntTpCd"]').val("");
        			that.$el.find('[data-form-param="mndtryCustInfoUseAgrmntNm"]').val("");
        			that.$el.find('[data-form-param="mndtryYn"]').val('Y');
				},


				/**
				 * 그리드에서 등급 선택
				 */
				selectAgrmnt : function(){
	                var that = this;
	                var selectedItem = that.CAPAT403Grid.grid.getSelectionModel().selected.items[0];


	                if(!selectedItem){
	                    return;
	                }
					that.newSaveYn = false;


        			that.$el.find('[data-form-param="mndtryCustInfoUseAgrmntTpCd"]').attr('disabled', true);
        			that.$el.find('[data-form-param="mndtryCustInfoUseAgrmntNm"]').attr('disabled', true);


        			that.$el.find('[data-form-param="mndtryCustInfoUseAgrmntTpCd"]').val(selectedItem.data.agrmntTpCd);
        			that.$el.find('[data-form-param="mndtryCustInfoUseAgrmntNm"]').val(selectedItem.data.agrmntTpCdNm);
        			that.$el.find('[data-form-param="mndtryYn"]').val(selectedItem.data.agrmntMndtryYn);


				},


	            /**
	             * 기타 화면 설정
	             */
				popAgrmntListLayerCtrl : function(){
	        		var that = this;
	        		fn_pageLayerCtrl(that.$el.find("#agrmnt-list-area"));
	            },
	            popAgrmntAtrbtLayerCtrl : function(){
	        		var that = this;
	        		fn_pageLayerCtrl(that.$el.find("#agrmnt-atrbt-area"));
	            }
			});


	return CAPAT403BaseView;
});
