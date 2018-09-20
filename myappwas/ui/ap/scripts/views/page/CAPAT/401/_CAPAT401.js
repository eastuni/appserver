define(
		[ 'bx/common/config', 
		  'bx/common/common-info',
	 	  'text!app/views/page/CAPAT/401/_CAPAT401.html', 
		  'app/views/page/popup/CAPAT/popup-brnchCd',
		  'app/views/page/popup/CAPCM/popup-class-search'
	 	 ],


function(config, commonInfo, tpl, popupDeptId, PopupClassSearch) {


	var CAPAT401BaseView = Backbone.View
			.extend({
				tagName : 'section',
				className : 'bx-container CAPAT401-page',
				templates : {
					'tpl' : tpl
				},
				events : {
					'click .CAPAT401-cust-param-save-btn' : 'saveCAPAT401CustParam', //고객 파라미터 저장


					'click #btn-mbrshpAtmtcCreateRuleClassNm-search' : 'popUpClassSearch', //클래스 조회 팝업
					'click #btn-selfChnlCustMgmtDeptId-search' : 'popUpCustMgmtDeptSearch', //고객관리부서 조회 팝업


					'click #btn-cust-param-toggle' : 'popCustParamLayerCtrl', //고객 파라미터 영역접기


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
		            	that.instCd = $.sessionStorage("instCd");
		            }		            
		            //콤보박스 설정
		            that.setComboBoxes();


				},
				render : function() {
					
					var that = this;

                	//배포처리반영[버튼비활성화]
                    fn_btnCheckForDistribution([
                                        		this.$el.find('.CAPAT401-wrap #btn-setCust-save')
                                        			   ]);
                	return this.$el;
				},


                /**
                 * 고객 파라미터 조회
                 */
                selectInstitutionParameter : function() {
                	this.instCreateMode = false;


                	// 고객 파라미터 조회
                	this.selectCustParam();
                },


                /**
                 * 고객 파라미터 조회
                 */
                selectCustParam : function() {
                	var sParam = {};
                	sParam.instCd = commonInfo.getInstInfo().instCd;
                	sParam.instParmTpCd = "30"; // 고객기본을 30으로 잡았음 (코드 관리 참조)


                	this.selectProxy(sParam);
                },
                /**
                 * 조회
                 */
                selectProxy : function(sParam) {
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
                },


				/**
				 * 콤보박스 설정
				 */
				setComboBoxes: function(){
					var that = this;


  	                // combobox - yn
  	                var sParam = {};
  	                sParam.className = "indvBizAcctInqryYn-wrap";
  	                sParam.nullYn = "Y";
  	                sParam.selectVal = "Y";
  	                sParam.cdNbr = "10000";
  	                sParam.viewType = "val";
  	                fn_getCodeList(sParam, that);

  	                // combobox - yn
  	                var sParam = {};
  	                sParam.className = "dueDlgncAplyYn-wrap";
  	                sParam.nullYn = "Y";
  	                sParam.cdNbr = "10000";
  	                sParam.viewType = "val";
  	                fn_getCodeList(sParam, that);
  	                
  	                // combobox - year
  	                var sParam = {};
  	                sParam.className = "cddUpdtCyclCntnt-wrap";
  	                sParam.nullYn = "Y";
  	                sParam.cdNbr = "A0623";
  	                sParam.viewType = "textUnit";
		            sParam.unit = bxMsg('cbb_items.SCRNITM#month')
  	                CAPAT401_fn_getCodeList(sParam, that);
  	                
  	                // combobox - year
  	                var sParam = {};
  	                sParam.className = "eddUpdtCyclCntnt-wrap";
  	                sParam.nullYn = "Y";
  	                sParam.cdNbr = "A0623";
  	                sParam.viewType = "textUnit";
		            sParam.unit = bxMsg('cbb_items.SCRNITM#month')
  	                CAPAT401_fn_getCodeList(sParam, that);

		            //inquire institution parameters
		            setTimeout(function () {
		            	that.selectInstitutionParameter();
		            }, 300);
				},


				/**
				 * 클래스 조회 팝업
				 */
				popUpClassSearch : function(){
	                var that = this;


	                var popupClassSearch = new PopupClassSearch()


	                popupClassSearch.render();
	                popupClassSearch.on('popUpSetData', function (data) {
	                    that.$el.find('[data-form-param="mbrshpAtmtcCreateRuleClassNm"]').val(data.classNm);
	                });
				},


				/**
				 * 고객관리부서 조회 팝업
				 */
				popUpCustMgmtDeptSearch : function(){
					var that = this;
					var that = this;					
					var param = {};
					param.instCd = commonInfo.getInstInfo().instCd;
					param.dtogRelCd = '01'; //기본조직


				    var popDeptIdObj = new popupDeptId(param);


				    popDeptIdObj.render();
				    popDeptIdObj.on('popUpSetData', function (param) {


				    	that.$el.find('[data-form-param="selfChnlCustMgmtDeptId"]').val(param.brnchCd);


				    });
				},


	            /**
	             * 기타 화면 설정
	             */
				popCustParamLayerCtrl : function(){
					var that = this;
					fn_pageLayerCtrl(that.$el.find("#cust-param-area"));
				},


				/**
                 * 고객 파라미터 저장 ( 현재는 하나 뿐이지만 추후 늘어날 것을 대비하여 TARGET 지정함 )
                 */
				saveCAPAT401CustParam: function (event) {
                    
                    var that = this;
                    that.mainEvent = event;

                  //배포처리[과제식별자 체크]
                    if (!fn_headerTaskIdCheck()){
                        return;
                    }
                    function saveData() {
                        var sParam = {};
                        sParam.tblNm = [];
                        var paramList = {};
                        var target = "";


                        // 버튼 ID에 따른 target 변경
                        if(that.mainEvent.target.parentElement.id == "btn-setCust-save") {
                        	target = "#CAPAT401-custParam-table";
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




			});


	return CAPAT401BaseView;
});

/**
 * 공통코드조회
 */
function CAPAT401_fn_getCodeList(sParam, that, selectStyle, fn) {
    var param = {};


    param.cdNbr = sParam.cdNbr;


    var linkData = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": param};


    bxProxy.post(sUrl, JSON.stringify(linkData), {
        success: function (data) {
            if (fn_commonChekResult(data)) {
            	var $targetArea;




            	if(sParam.pageType && sParam.pageType == "popup") {
            		$targetArea = that.find("." + sParam.className);
            	}
            	else {
            		$targetArea = that.$el.find("." + sParam.className);
            	}


            	$targetArea.html("");


            	// 비활성화 처리
            	 if (sParam.disabled) {
            		 $targetArea.attr("disabled", true);
                 }


            	 // 숨김처리
            	 if (sParam.hidden) {
            		 $targetArea.attr("hidden", true);
                 }


            	 // 빈값 처리
            	 if (sParam.nullYn == "Y") {
                     var option = $(document.createElement('option')).val("").text(sParam.allNm);
                     $targetArea.append(option);
                 }


            	 $(data.CaCmnCdSvcGetCdListByCdNbrOut.tblNm).each(function (idx, item) {
                     var optionText = item.cdNm;
                     var optionValue = item.cd;
                     var option = $(document.createElement('option')).val(optionValue).text(optionText);


                     if (sParam.viewType) {
                         if (sParam.viewType == "ValNm") {
                             option = $(document.createElement('option')).val(optionValue).text(item.cd + " " + optionText);
                         }
                         else if (sParam.viewType == "textUnit") {
                             option = $(document.createElement('option')).val(optionValue).text(optionText + " " + sParam.unit);
                         }

                     }


                     $targetArea.append(option);
                 });


            	 if (sParam.selectVal) {
            		 $targetArea.find('option[value=' + sParam.selectVal + ']').attr('selected', true);
                 }


                typeof fn === 'function' && fn();
            }
        }
    });
}
