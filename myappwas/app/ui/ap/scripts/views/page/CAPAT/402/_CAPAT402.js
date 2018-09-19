define(
		[ 'bx/common/config', 
		  'bx/common/common-info',
		  'bx-component/ext-grid/_ext-grid',
	 	  'text!app/views/page/CAPAT/402/_CAPAT402.html', 
	 	 ],


function(config, commonInfo, ExtGrid, tpl) {


	var newSaveYn = true; //신규등록여부
	var deleteGradeList = new Array();//삭제할 등급 목록		


	var CAPAT402BaseView = Backbone.View
			.extend({
				tagName : 'section',
				className : 'bx-container CAPAT402-page',
				templates : {
					'tpl' : tpl
				},
				events : {
					'click .CAPAT402-default-grade-save-btn' : 'saveCAPAT402DfltGradeGrid', //고객기본등급속성 그리드 저장					
					'click .CAPAT402-dflt-grade-atrbt-save-btn' : 'saveCAPAT402DfltGradeAtrbt', //고객기본등급속성 저장
					'change .custGradeKndTpCd-wrap' : 'getCustGradeCdList', //고객등급코드목록 조회


					'click .CAPAT402-default-grade-reset-btn' : 'resetCAPAT402DfltGrade', //고객기본등급 그리드 초기화
					'click .CAPAT402-dflt-grade-atrbt-reset-btn' : 'resetCAPAT402DfltGradeAtrbt', //고객기본등급 속성 초기화


					'click #btn-default-grade-toggle' : 'popDfltGradeLayerCtrl', //고객기본등급 그리드 영역 접기
					'click #btn-dflt-grade-atrbt-toggle' : 'popDfltGradeAtrbtLayerCtrl' //고객기본등급 속성 영역 접기


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


		            //그리드 생성
		            that.createCustDfltGradeGrid();
		            
		            //콤보박스 설정
		            that.setComboBoxes();
		            
		            //페이지 파라미터 조회
		        	var pageParam = initData.pageArg;		
		        	var custGradeTpCdList = pageParam.split('|');
		        	var cdDataList = [];
		        	$(custGradeTpCdList).each(function(idx, custGradeTpCd){
		        		var custGradeTpCdNbrList = custGradeTpCd.split(";");
		        		var cdData = {};
		        		cdData.cd = custGradeTpCdNbrList[0];
		        		cdData.cdNbr = custGradeTpCdNbrList[1];
		        		cdDataList.push(cdData);
		        	});    	
		        	that.custGradeTpCdNbrStore = new Ext.data.Store({
		                fields: ['cd', 'cdNbr'],
		                data: cdDataList
		            });

				},
				render : function() {
					var that = this;

					//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPAT402-default-grade-save-btn')
                                        		,this.$el.find('.CAPAT402-dflt-grade-atrbt-save-btn')
                                        			   ]);
                	return this.$el;
				},
				
				/**
				 * 콤보박스 설정
				 */
				setComboBoxes : function(){
					var that = this;
					
  	                var sParam = {};
  	                sParam.className = "custGradeKndTpCd-wrap";
  	                sParam.nullYn = "Y";
  	                sParam.cdNbr = "A1000";
  	                sParam.viewType = "ValNm";
  	                fn_getCodeList(sParam, that);
				},

				/**
				 * 고객기본등급 그리드 생성
				 */
				createCustDfltGradeGrid : function(){
					var that = this;
                    that.CAPAT402Grid = new ExtGrid({


                        // 그리드 컬럼 정의
                        fields: ['No', 'custGradeKndTpCd', 'custGradeCdCntnt', 'custGradeCd' , 'clearGrade']
                        , id: 'CAPAT402Grid'
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
                                text: bxMsg('cbb_items.SCRNITM#custGradeKndTpCd')
                                , dataIndex: 'custGradeKndTpCd'
                                , sortable: false
                                , flex: 7
                                , style: 'text-align:center'
                                , align: 'center'
                                , height : 25
                    		  }
                    		 , {
                                 text: bxMsg('cbb_items.SCRNITM#custGradeCdCntnt')
                                 , flex : 7
                                 , dataIndex: 'custGradeCdCntnt'
                                 , editor: 'textfield'
                                 , style: 'text-align:center'
                                 , align: 'center'
                                 , sortable : false 
                    		 }  
                     		, {  
                     			dataIndex: 'custGradeCd'
                     			, text: bxMsg('cbb_items.SCRNITM#custGradeCd')
                     			, style: 'text-align:center'
                     			, align: 'center'
                     			, sortable : false
                     			, flex : 7
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
                 	                	   var dataList = that.CAPAT402Grid.getAllData();

                	                	   var data = {};
                	                	   data.custGradeKndTpCd = dataList[rowIndex].custGradeKndTpCd;
                	                	   data.custGradeCdCntnt = dataList[rowIndex].custGradeCdCntnt;
                	                	   data.custGradeCd = dataList[rowIndex].custGradeCd;
                	                	   deleteGradeList.push(data);

                	                	   grid.store.remove(record);
                                        }
                                    }
                                ]
                            }
                    	] // end of columns
	                    , listeners: {click: {element: 'body',
	 			             	fn: function(){
	 			             		//클릭시 이벤트 발생
	 			             		that.selectGrade();
	 			             	}
	                    	} 
	                    }
                      });


                    //그리드 렌더
    	            that.$el.find("#CAPAT402-default-grade-grid").html(that.CAPAT402Grid.render({'height': '240px'}));//5개 조회


    	            //그리드에 데이터 로드
    	            that.loadGridData();
				},


				/**
				 * 그리드에 데이터 로드
				 */
				loadGridData : function(){
					var that = this;


					var header =  new Object(); 
	                header = fn_getHeader("CAPAT1005035");


	                var sParam = {}; 
	                sParam.instCd = that.instCd;


	                var linkData = {"header" : header , "CaCustGradeCdSvcSrchIn" : sParam};


	                // ajax 호출
	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	                	enableLoading: true,
	                	success: function(responseData){
	                		if(fn_commonChekResult(responseData)) {
	                			that.CAPAT402DfltGradeList = responseData.CaCustGradeCdSvcSrchListOut.gradeCodeList;	


	                			//set grid data
	        					that.CAPAT402Grid.setData(that.CAPAT402DfltGradeList);
	        					//삭제할 그리드정보 초기화
	        					deleteGradeList = new Array();
	                		}
	                	}
	                });	
				},


				/**
				 * 고객기본등급 그리드 초기화
				 */
				resetCAPAT402DfltGrade : function(){
					var that = this;
				    that.CAPAT402Grid.setData(that.CAPAT402DfltGradeList);
				    deleteGradeList = new Array();
				},
				
				/**
				 * 고객등급코드목록 조회
				 */
				getCustGradeCdList : function(custGradeCd){
					var that = this;
					
					var cdVal = that.$el.find("[data-form-param='custGradeKndTpCd']").val();
					var index = that.custGradeTpCdNbrStore.findExact('cd', cdVal);
					var custGradeCdNbr = null;
					if(index != -1) {
						custGradeCdNbr = that.custGradeTpCdNbrStore.getAt(index).data.cdNbr;
					}
					
					if(custGradeCdNbr == null){
						return;
					}else if(custGradeCdNbr == "NA"){
						that.$el.find("[data-form-param='custGradeCd']").replaceWith('<input type="text" class="bw-input w-70" data-form-param="custGradeCd"/>');//select를 input으로 변경
					}else{
						that.$el.find("[data-form-param='custGradeCd']").replaceWith('<select class="bw-input w-70 ipt-select custGradeCd-wrap" data-form-param="custGradeCd"></select>');//input을 select로 변경
	  	                var sParam = {};
	  	                sParam.className = "custGradeCd-wrap";
	  	                sParam.nullYn = "N";
	  	                sParam.cdNbr = custGradeCdNbr;
	  	                sParam.viewType = "ValNm";
	  	                if(custGradeCd){
	  	                	sParam.selectVal = custGradeCd;
	  	                }
	  	                fn_getCodeList(sParam, that);
					}
				},


				/**
				 * 고객기본등급 속성 저장
				 */
				saveCAPAT402DfltGradeAtrbt: function(){
					var that = this;
					if(that.newSaveYn){
						if(that.$el.find('[data-form-param="custGradeKndTpCd"]').val() == ""){
							fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#custGradeKndTpCd") + "]");
						}else if(that.$el.find('[data-form-param="custGradeCd"]').val() == "") {
							fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#custGradeCd") + "]");
						}else{
							that.registerCustDfltGradeCd();
						}


					}else{
						that.modifyCustDfltGradeCd();
					}
				},


				/**
				 * 그리드에서 등급 선택
				 */
				selectGrade : function(){
	                var that = this;
	                var selectedRole = that.CAPAT402Grid.grid.getSelectionModel().selected.items[0];


	                if(!selectedRole){
	                    return;
	                }
	                


					that.newSaveYn = false;
        			that.$el.find('[data-form-param="custGradeKndTpCd"]').attr('disabled', true);


        			that.$el.find('[data-form-param="custGradeKndTpCd"]').val(selectedRole.data.custGradeKndTpCd);
        			that.getCustGradeCdList(selectedRole.data.custGradeCd);

				},




				/**
				 * 고객 기본등급 신규등록
				 */
				registerCustDfltGradeCd : function(){


					var that = this;
					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }

					var header =  new Object(); 
	                header = fn_getHeader("CAPAT1005037"); // 등록되어져 있는 값 중에서만 기본등급을 등록할 수 있음


	                var sParam = {}; 
	                sParam.instCd = that.instCd;
	                sParam.custGradeKndTpCd = that.$el.find('[data-form-param="custGradeKndTpCd"]').val();
	                sParam.custGradeCd = that.$el.find('[data-form-param="custGradeCd"]').val();


	                var linkData = {"header" : header , "CaCustGradeCdSvcRgstIn" : sParam};


	                // ajax 호출
	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	                	enableLoading: true,
	                	success: function(responseData){
	                		if(fn_commonChekResult(responseData)) {
	                			fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));	
	                			that.resetCAPAT402DfltGradeAtrbt();
	                			that.loadGridData();
	                		}
	                	}
	                });	


				},


				/**
				 * 고객 기본등급 변경
				 */
				modifyCustDfltGradeCd: function(){


					var that = this;

					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }
					var header =  new Object(); 
	                header = fn_getHeader("CAPAT1005037");


	                var sParam = {}; 
	                sParam.instCd = that.instCd;
	                sParam.custGradeKndTpCd = that.$el.find('[data-form-param="custGradeKndTpCd"]').val();
	                sParam.custGradeCd = that.$el.find('[data-form-param="custGradeCd"]').val();


	                var linkData = {"header" : header , "CaCustGradeCdSvcRgstIn" : sParam};


	                // ajax 호출
	                bxProxy.post(sUrl, JSON.stringify(linkData),{
	                	enableLoading: true,
	                	success: function(responseData){
	                		if(fn_commonChekResult(responseData)) {
	                			fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));
	                			that.resetCAPAT402DfltGradeAtrbt();
	                			that.loadGridData();
	                		}
	                	}
	                });
				},


				/**
				 * 고객 기본등급 그리드 저장(삭제)
				 */
				saveCAPAT402DfltGradeGrid: function(){


					var that = this;
					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }

					var header =  new Object(); 
	                header = fn_getHeader("CAPAT1005038");


	                var sParam = {}; 
	                var deleteList = new Array();


					for(var i = 0 ; i < deleteGradeList.length ; i++){
						var row = {};


						row.instCd = that.instCd;
						row.custGradeKndTpCd = deleteGradeList[i].custGradeKndTpCd;
						row.custGradeCd = deleteGradeList[i].custGradeCd;


						deleteList.push(row);
					}
					sParam.deleteList = deleteList;




	                var linkData = {"header" : header , "CaCustGradeCdSvcDeleteListIn" : sParam};


					fn_confirmMessage(event, '', bxMsg('cbb_items.SCRNITM#data-delete-msg'), function(){
		                // ajax 호출
		                bxProxy.post(sUrl, JSON.stringify(linkData),{
		                	enableLoading: true,
		                	success: function(responseData){
		                		if(fn_commonChekResult(responseData)) {
		                			fn_alertMessage("",bxMsg('cbb_items.SCRNITM#success'));	   
		                			that.resetCAPAT402DfltGradeAtrbt();
		                			that.loadGridData();
		                		}
		                	}
		                });						
					});
				},


				/**
				 * 고객기본등급 입력영역 초기화
				 */
				resetCAPAT402DfltGradeAtrbt : function(){
					var that = this;
					that.newSaveYn = true;




        			that.$el.find('[data-form-param="custGradeKndTpCd"]').val("");
        			that.$el.find('[data-form-param="custGradeCd"]').val("");
        			that.$el.find('[data-form-param="custGradeKndTpCd"]').attr('disabled', false);
        			that.$el.find('[data-form-param="custGradeCd"]').attr('disabled', false);


				},


	            /**
	             * 기타 화면 설정
	             */
				popDfltGradeLayerCtrl : function(){
	        		var that = this;
	        		fn_pageLayerCtrl(that.$el.find("#default-grade-area"));
	            },
	            popDfltGradeAtrbtLayerCtrl : function(){
	        		var that = this;
	        		fn_pageLayerCtrl(that.$el.find("#dflt-grade-atrbt-area"));
	            }
			});


	return CAPAT402BaseView;
});
