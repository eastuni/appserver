define(
    [
          'bx/common/config'
        , 'text!app/views/page/CAPMT/018/_CAPMT018.html'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , commonInfo
        ) {


        /**
		 * Backbone
		 */
        var CAPMT018View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container CAPMT018-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }
            // 이벤트 설정
            , events: {
                  'click #btn-base-section-inquiry'		: 'query'
                , 'click #btn-refresh'		: 'refreshData'
                , 'click #btn-base-section-toggle': 'fn_base_toggle'
            }


            /**
			 * initialize
			 */
            , initialize: function (initData) {
                var that = this;
                that.isModify=false;




                $.extend(that, initData);
                // 페이지 핸들바 설정 : 메뉴의 메인 페이지에 설정해야 함 (_.js파일)
                that.$el.attr('data-page', that.pageHandler);


                that.$el.html(that.tpl());


                var sParam1 = {cdNbr:"A0222"}; // 스템상태코드


                bxProxy.all([{
                        // 배치컴포넌트코드
                        url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam1}), success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                comboStore0181 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                	}
                ,{
                    // 배치컴포넌트코드
                    url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam1}), success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            comboStore0182 = new Ext.data.Store({
                                fields: ['cd', 'cdNm'],
                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                            });
                        }
                    }
            	}
                	]
                    , {
                        success: function () {
                                                    } // end of success:.function
                    }); // end of bxProxy.all
            }


            /**
			 * render
			 */
            , render: function () {
                var that = this;
                var sParam = that.param;


                //스텝상태코드
                fn_getCodeList({className:"CAPMT018-stepStsCd-wrap",targetId:"stepStsCd",nullYn:"Y",cdNbr:"A0222"}, this);
                fn_getCodeList({className:"CAPMT018-stepEndStsCd-wrap",targetId:"stepEndStsCd",nullYn:"Y",cdNbr:"A0222"}, this);


                that.$el.find("#btn-base-section-reset").prop("disabled", true);
                that.$el.find("#btn-base-section-inquiry").prop("disabled", true);


                //refresh 영역 크기조정
                that.$el.find('.CAPMT018-base-section [data-form-param="refreshIntvl"]').val("10");


                this.setBaseData(this, "", "X");


                //### 새로고침 1 ###
                //query를 수행한 경우, 배치작업의 실행상태를 false로 초기화한다.
                that.isRunning=false;


                that.inquiryBaseData(sParam);


                return this.$el;
            }


            /**
			 * 기본부 초기화
			 */
            , setBaseData: function (that, responseData, type) {
                that = this;


                if (type == "X") {
                    that.$el.find('.CAPMT018-base-section [data-form-param="batchJobId"]').val("");
                    that.$el.find('.CAPMT018-base-section [data-form-param="batchJobNm"]').val("");
                    that.$el.find('.CAPMT018-base-section [data-form-param="batchJobInstncId"]').val("");
                }
                else {


                	 that.$el.find('.CAPMT018-base-section [data-form-param="batchJobId"]').val(responseData.batchJobId);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="batchJobNm"]').val(responseData.batchJobNm);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="batchJobInstncId"]').val(responseData.batchJobInstncId);


                	 that.$el.find('.CAPMT018-base-section [data-form-param="batchJobStepNbr"]').val(responseData.stepInfo.batchJobStepNbr);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="batchJobStepNm"]').val(responseData.stepInfo.batchJobStepNm);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="stepStsCd"]').val(responseData.stepInfo.stepStsCd);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="stepEndStsCd"]').val(responseData.stepInfo.stepEndStsCd);
                	 //### 새로고침  3 ###
	              		if (responseData.stepInfo.stepEndStsCd =="02")  { // 처리상태가 실행 중인 경우
	              			that.isRunning=true;
	              		}


                	 that.$el.find('.CAPMT018-base-section [data-form-param="commitCnt"]').val(responseData.stepInfo.commitCnt);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="rlbckCnt"]').val(responseData.stepInfo.rlbckCnt);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="readCnt"]').val(responseData.stepInfo.readCnt);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="filterCnt"]').val(responseData.stepInfo.filterCnt);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="writeCnt"]').val(responseData.stepInfo.writeCnt);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="readSkpCnt"]').val(responseData.stepInfo.readSkpCnt);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="writeSkpCnt"]').val(responseData.stepInfo.writeSkpCnt);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="prcsSkpCnt"]').val(responseData.stepInfo.prcsSkpCnt);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="stepStartHms"]').val(fn_setTimeValue(responseData.stepInfo.stepStartHms));
                	 that.$el.find('.CAPMT018-base-section [data-form-param="stepEndHms"]').val(fn_setTimeValue(responseData.stepInfo.stepEndHms));


                	 that.$el.find(' [data-form-param="trmntnMsgCntnt"]').val(responseData.stepInfo.trmntnMsgCntnt);


                	 that.$el.find('.CAPMT018-base-section [data-form-param="batchJobId"]').prop("disabled", true);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="batchJobNm"]').prop("disabled", true);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="batchJobInstncId"]').prop("disabled", true);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="batchJobStepNbr"]').prop("disabled", true);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="batchJobStepNm"]').prop("disabled", true);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="stepStsCd"]').prop("disabled", true);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="stepEndStsCd"]').prop("disabled", true);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="commitCnt"]').prop("disabled", true);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="rlbckCnt"]').prop("disabled", true);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="readCnt"]').prop("disabled", true);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="filterCnt"]').prop("disabled", true);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="writeCnt"]').prop("disabled", true);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="readSkpCnt"]').prop("disabled", true);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="writeSkpCnt"]').prop("disabled", true);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="prcsSkpCnt"]').prop("disabled", true);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="stepStartHms"]').prop("disabled", true);
                	 that.$el.find('.CAPMT018-base-section [data-form-param="stepEndHms"]').prop("disabled", true);


                	 that.$el.find('.CAPMT018-base-section [data-form-param="trmntnMsgCntnt"]').prop("disabled", true);




                }
            }


            , refreshData: function () {
                var that = this;
                var timeVal= that.$el.find('.CAPMT018-base-section [data-form-param="refreshIntvl"]').val();


                //### 새로고침 2 ###
                //query를 수행한 경우, 배치작업의 실행상태를 false로 초기화한다.
                that.isRunning=false;


                //토글로 처리
                if(that.isRefresh){
                	// refresh가 수행중 중지를 누른 경우
                	that.isRefresh=false;
                	//버튼의 label을 refresh로 변경
                	that.$el.find('#btn-refresh').prop("title",bxMsg('cbb_items.SCRNITM#refresh')).prop("innerHTML",bxMsg('cbb_items.SCRNITM#refresh'));
                	//검색조건들을 enable 시킴 - 항상 disabled이므로 필요 없음
                	if (this.go) { //실행중인 refresh를 중지시킴
                		clearInterval(this.go);
                	}
                } else { // refresh가 처음 선택된 경우
                	that.isRefresh=true;
                	//버튼의 label을 중지로 변경
                	that.$el.find('#btn-refresh').prop("title",bxMsg('cbb_items.ABRVTN#stop')).prop("innerHTML",bxMsg('cbb_items.ABRVTN#stop'));
                	//검색조건들을 disable 시킴 - 항상 disabled 이므로 필요없음


                	if(timeVal) {
                			var nTimeVal=parseInt(timeVal);  //정수로 바꾸기
                			if(nTimeVal>0){
 		                		this.go=setInterval(function(){
 		                			//call_inquiry
 		                			//alert("this is test");
 		                			that.inquiryBaseData(that.param);


 		                		},nTimeVal*1000);
 	                		}
                	}


                }


            }


            /**
			 * 기본부 조회 버튼 클릭
			 */
            /*
            , query: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.CAPMT018-base-section'));
                //기관코드 존재여부 체크
                if (commonInfo.getInstInfo().instCd) {
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                } else {
                    alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));


                    return;
                }


                that.inquiryBaseData(sParam);
            }
           */
            /**
			 * 기본부 정보로 그리드 조회
			 */
            , inquiryBaseData: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;


                if(sParam.refreshIntvl)
                {
                    delete sParam.refreshIntvl;
                }


                var linkData = {"header": fn_getHeader("PMT0188401"), "BatchJobExctnMgntSvcIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {


                            if(responseData.BatchJobExctnMgntSvcStepOut) {
                            	that.setBaseData(that, responseData.BatchJobExctnMgntSvcStepOut, "Y");
                            	//### 새로고침 4 ###
                                //데이터를 바인딩한 후, step의 종료코드가 실행중이 없으면 새로고침 버튼을 disable 시킴
                                if(!that.isRunning){//배치작업이 실행중이 아님 새로 고침 불필요
                                 	that.$el.find('#btn-refresh').prop("disabled",true);
                                 	//반복호출을 중단시켜야 함
                                 	if (that.go) { //실행중인 refresh를 중지시킴
                                		clearInterval(that.go);
                                	}
                                 }




                            };
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end


            , fn_base_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT018-base-section"), this.$el.find("#btn-base-section-toggle"));
            }


        }); // end of Backbone.View.extend({


        return CAPMT018View;
    } // end of define function
); // end of define
