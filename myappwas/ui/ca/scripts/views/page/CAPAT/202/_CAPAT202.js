define(
		[ 'bx/common/config', 
		  'bx/common/common-info',
	 	  'text!app/views/page/CAPAT/202/_CAPAT202.html', 
		  'app/views/page/popup/CAPAT/popup-brnchCd',
		  'app/views/page/popup/CAPCM/popup-class-search'
	 	 ],


function(config, commonInfo, tpl, popupDeptId) {


	var CAPAT202BaseView = Backbone.View.extend({
				tagName : 'section',
				className : 'bx-container CAPAT202-page',
				templates : {
					'tpl' : tpl
				}
				, events : {
					'click .CAPAT202-dept-param-save-btn' : 'saveCAPAT202DeptParam', //부서 파라미터 저장


					'click #btn-selfChnlAcctgDept-search' : 'popUpDeptSearch', //회계부서 조회 팝업
					'click #btn-frgnTxHotspotDeptId-search' : 'popUpFxDeptSearch', //외환부서 조회 팝업


					'click #btn-dept-param-toggle' : 'popDeptParamLayerCtrl', //부서 파라미터 영역접기


				}


				, initialize : function(initData) {
					var that = this;
                    this.instCreateMode = false;


		            $.extend(that,initData);


		            // 페이지 템플릿 설정
		            that.$el.html(that.tpl());


		            // init data set
		            if(commonInfo.getInstInfo().instCd) {
		              	that.instCd = commonInfo.getInstInfo().instCd;
		            }
		            else {
		            	that.instCd = $.sessionStorage("instCd");
		            }		            
		            //콤보박스 설정
		            that.setComboBoxes();


				}
				, render : function() {
					
                	//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPAT202-wrap .CAPAT202-dept-param-save-btn')
                                        			   ]);
                    
					var that = this;


					// 기관파라미터 조회
                	this.selectInstitutionParameter();


                    return this.$el;


				}


                /**
                 * 부서 파라미터 조회
                 */
                , selectInstitutionParameter : function() {
                	this.instCreateMode = false;


                	// 부서파라미터 조회
                	this.selectDeptParam();
                }


                /**
                 * 부서파라미터 조회
                 */
                , selectDeptParam : function() {
                	var sParam = {};
                	sParam.instCd = commonInfo.getInstInfo().instCd;
                	sParam.instParmTpCd = "70"; // 부서기본을 70으로 잡았음 (코드 관리 참조)


                	this.selectProxy(sParam);
                }




                /**
                 * 조회
                 */
                , selectProxy : function(sParam) {
                	var that = this;
                	var linkData = {"header": fn_getHeader("CAPCM0308403"), "CaInstMgmtSvcGetParmIn": sParam};


                	// ajax호출
                	bxProxy.post(sUrl, JSON.stringify(linkData), {
                		enableLoading: true
                		, success: function (responseData) {
                			if (fn_commonChekResult(responseData)) {
                				var parmList = responseData.CaInstMgmtSvcGetParmOut.parmList;


                				$(parmList).each(function(idx, data) {


                					var paramVal = data.parmVal;


                					that.$el.find('[data-form-param="'+data.parmAtrbtNm+'"]').val(paramVal);


                				});
                			}
                		}   // end of suucess: fucntion
                	}); // end of bxProxy
                }


				/**
				 * 콤보박스 설정
				 */
				, setComboBoxes: function(){
					var that = this;


  	                // combobox - yn
  	                var sParam = {};
  	                sParam.className = "selfChnlAcctgDeptPrcsDsCd-wrap";
  	                sParam.nullYn = "Y";
  	                sParam.selectVal = "1";
  	                sParam.cdNbr = "A0371";
  	                sParam.viewType = "ValNm";
  	                fn_getCodeList(sParam, that);


				}


				/**
				 * 고객관리부서 조회 팝업
				 */
				, popUpDeptSearch : function(){
					var that = this;
					var that = this;					
					var param = {};
					param.instCd = commonInfo.getInstInfo().instCd;
					param.dtogRelCd = '02'; //회계조직


				    var popDeptIdObj = new popupDeptId(param);


				    popDeptIdObj.render();
				    popDeptIdObj.on('popUpSetData', function (param) {


				    	that.$el.find('[data-form-param="selfChnlAcctgDept"]').val(param.brnchCd+" "+param.brnchNm);
				    	that.$el.find('[data-form-param="selfChnlAcctgDeptId"]').val(param.brnchCd);


				    });
				}
				
				/**
				 * 외화거래집중부서 조회 팝업
				 */
				, popUpFxDeptSearch : function(){
					var that = this;
					var that = this;					
					var param = {};
					param.instCd = commonInfo.getInstInfo().instCd;
					param.dtogRelCd = '02'; //회계조직

				    var popDeptIdObj = new popupDeptId(param);


				    popDeptIdObj.render();
				    popDeptIdObj.on('popUpSetData', function (param) {
				    	that.$el.find('[data-form-param="frgnTxHotspotDeptId"]').val(param.brnchCd);
				    });
				}


                /**
                 * 부서 파라미터 저장 ( 현재는 하나 뿐이지만 추후 늘어날 것을 대비하여 TARGET 지정함 )
                 */
                , saveCAPAT202DeptParam: function (event) {
                	
                	//배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                    var that = this;
                    that.mainEvent = event;


                    function saveData() {
                        var sParam = {};
                        sParam.tblNm = [];
                        var paramList = {};
                        var target = "";


                        // 버튼 ID에 따른 target 변경
                        if(that.mainEvent.target.parentElement.id == "btn-setDept-save") {
                        	target = "#CAPAT202-deptParam-table";
                        }


                        paramList = bxUtil.makeParamFromForm(that.$el.find(target));


                        for (var key in paramList) {
                    		var param = {};
                    		param.instCd = commonInfo.getInstInfo().instCd;
                    		param.parmAtrbtNm = key;
                    		param.parmVal = paramList[key];
                    		sParam.tblNm.push(param);
                        }


                        var linkData = {"header": fn_getHeader("CAPCM0308103"), "CaInstMgmtSvcRegParmListIn": sParam};


                            // ajax호출
                            bxProxy.post(sUrl, JSON.stringify(linkData), {
                                enableLoading: true
                                , success: function (responseData) {
                                    if (fn_commonChekResult(responseData)) {
                                        fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                        that.selectInstitutionParameter();
                                    }
                                }   // end of suucess: fucntion
                            }); // end of bxProxy
                    }


                    fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
                }




	            /**
	             * 기타 화면 설정
	             */
				, popDeptParamLayerCtrl : function(){
					var that = this;
					fn_pageLayerCtrl(that.$el.find("#dept-param-area"));
				}


			});


	return CAPAT202BaseView;
});
