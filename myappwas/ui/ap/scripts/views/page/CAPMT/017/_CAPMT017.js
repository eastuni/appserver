define(
    [
          'bx/common/config'
        , 'text!app/views/page/CAPMT/017/_CAPMT017.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , ExtGrid
        , commonInfo
        , PopupBtchJb
        ) {


        /**
		 * Backbone
		 */
        var CAPMT017View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container CAPMT017-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }
            // 이벤트 설정
            , events: {
                  'click #btn-refresh'		: 'refreshData'
                , 'click #btn-base-section-suspend'		: 'suspendBatchjob'
                , 'click #btn-base-section-resume'		: 'resumeBatchjob'
                , 'click #btn-base-section-restart'		: 'restartBatchjob'
                , 'click #btn-base-section-stop'			: 'stopBatchjob'
                // , 'click .CAPMT017-base-forcedStop-button'	: 'forcedStopBatchjob'
                , 'click #btn-base-section-toggle': 'fn_base_toggle'
                , 'click #btn-grid-section-toggle': 'fn_grid_toggle'
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


                var sParam1 = {cdNbr:"A0222"}; // 실행상태코드
                var sParam2 = {cdNbr:"A0222"}; // 종료상태코드


                bxProxy.all([{
                        // 실행상태코드
                        url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam1}), success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                comboStore0171 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                	}
                	,{
                		// 종료상태코드
	                    url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam2}), success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            comboStore0172 = new Ext.data.Store({
	                                fields: ['cd', 'cdNm'],
	                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
	                            });
	                        }
	                    }
                	}
                	]
                    , {
                        success: function () {
                            that.CAPMT017Grid = new ExtGrid({
                                // 그리드 컬럼 정의


                                fields: ['batchJobStepNbr', 'batchJobStepNm', 'stepStartHms', 'stepEndHms','stepStsCd','stepEndStsCd'  ]
                                , id: 'CAPMT017Grid'
                                , columns: [
                                     //스텝식별자
                                    {
                                        text: bxMsg('cbb_items.AT#batchJobStepNbr')
                                        , flex: 3
                                        , height: 25
                                        , dataIndex: 'batchJobStepNbr'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    }
                                    //스텝명
	                        		, {
                                        text: bxMsg('cbb_items.AT#batchJobStepNm')
                                        , flex: 7
                                        , dataIndex: 'batchJobStepNm'
                                        , style: 'text-align:center'
                                        , align: 'left'


                                    }
	                        		//시작시간
	                        		, {
                                        text: bxMsg('cbb_items.AT#stepStartHms')
                                        , flex: 4
                                        , dataIndex: 'stepStartHms'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                        , renderer: function (val) {
                                        	return fn_setTimeValue(val);
                                        }


                                    }
	                        		//종료시간
	                        		, {
                                        text: bxMsg('cbb_items.AT#stepEndHms')
                                        , flex: 4
                                        , dataIndex: 'stepEndHms'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                        , renderer: function (val) {
                                                return fn_setTimeValue(val);
                                        }
                                    }


	                        		//실행상태
	                        		, {
                                        text: bxMsg('cbb_items.AT#stepStsCd')
                                        , flex: 3
                                        , dataIndex: 'stepStsCd'
                                        , style: 'text-align:center'
                                       	, align: 'center'
                                       	, renderer: function (val) {
                                            	index = comboStore0171.findExact('cd', val);
                                            	if (index != -1) {
                                            		rs = comboStore0171.getAt(index).data;
                                                 return rs.cdNm;
                                             }
                                         }
                                    }
	                        		//종료상태
	                        		, {
                                        text: bxMsg('cbb_items.AT#stepEndStsCd')
                                        , flex: 3
                                        , dataIndex: 'stepEndStsCd'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                        , renderer: function (val) {
                                            	index = comboStore0172.findExact('cd', val);
                                            	if (index != -1) {
                                            		rs = comboStore0172.getAt(index).data;


                                            		//### 새로고침  3 ###
                                            		if (val =="02")  { // 처리상태가 실행 중인 경우
                                            			that.isRunning=true;
                                            		}
                                                 return rs.cdNm;
                                             }
                                         }
                                    }




                                ] // end of columns


                                , listeners: {
                                    dblclick: {
                                        element: 'body'
                                        , fn: function () {
                                            // 더블클릭시 이벤트 발생
                                            that.doubleiClickGrid();
                                        }
                                    }
                                }
                            });


                            // 단일탭 그리드 렌더
                            that.createGrid();
                        } // end of success:.function
                    }); // end of bxProxy.all
            }


            /**
			 * render
			 */
            , render: function () {
                var that = this;
                var sParam = that.param;






                //실행상태
                fn_getCodeList({className:"CAPMT017-batchJobExctnStsCd-wrap",targetId:"batchJobExctnStsCd",nullYn:"Y",cdNbr:"A0222",allNm:bxMsg("cbb_items.SCRNITM#all")}, this);
                //종료상태
                fn_getCodeList({className:"CAPMT017-batchJobEndStsCd-wrap",targetId:"batchJobEndStsCd",nullYn:"Y",cdNbr:"A0222",allNm:bxMsg("cbb_items.SCRNITM#all")}, this);


                //refresh 영역 크기조정
                that.$el.find('.CAPMT017-base-section [data-form-param="refreshIntvl"]').val("10");
                //버튼을 가운데 정렬
                //that.$el.find('.bx-form-item-wrap-new').prop("text-align","center");




                this.setBaseData(this, "", "X");


                sParam.batchJobExctnDt = sParam.batchJobExctnDt.replace(/-/gi,"");


                //### 새로고침 1 ###
                //query를 수행한 경우, 배치작업의 실행상태를 false로 초기화한다.
                that.isRunning=false;


                that.inquiryBaseData(sParam);


                //데이터 조회가 완료된 이후 버튼을 재설정
                that.changeButton();




                return this.$el;
            }


            /**
			 * 기본부 초기화
			 */
            , setBaseData: function (that, responseData, type) {
                that = this;


                if (type == "X") {
                    that.$el.find('.CAPMT017-base-section [data-form-param="batchJobId"]').val("");
                    that.$el.find('.CAPMT017-base-section [data-form-param="batchJobNm"]').val("");
                    //that.$el.find('.CAPMT017-base-section [data-form-param="batchAplctnNm"]').val("");
                    that.$el.find('.CAPMT017-base-section [data-form-param="batchJobInstncId"]').val("");
                }{
                	  that.$el.find('.CAPMT017-base-section [data-form-param="batchJobId"]').val(responseData.batchJobId);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="batchJobNm"]').val(responseData.batchJobNm);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="batchJobInstncId"]').val(responseData.batchJobInstncId);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="stepCnt"]').val(responseData.stepCnt);
                	  //배치작업생성시간
                	  that.$el.find('.CAPMT017-base-section [data-form-param="batchJobCreatedHms"]').val(fn_setTimeValue(responseData.batchJobCreatedHms));
                	  that.$el.find('.CAPMT017-base-section [data-form-param="batchJobExctnStsCd"]').val(responseData.batchJobExctnStsCd);
                	  //배치작업 실행시작시간
                	  that.$el.find('.CAPMT017-base-section [data-form-param="batchJobExctnStartHms"]').val(fn_setTimeValue(responseData.batchJobExctnStartHms));
                	  //배치작업 실행 종료시간
                	  that.$el.find('.CAPMT017-base-section [data-form-param="batchJobExctnEndHms"]').val(fn_setTimeValue(responseData.batchJobExctnEndHms));
                	  that.$el.find('.CAPMT017-base-section [data-form-param="batchJobEndStsCd"]').val(responseData.batchJobEndStsCd);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="commitCnt"]').val(responseData.commitCnt);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="rlbckCnt"]').val(responseData.rlbckCnt);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="readCnt"]').val(responseData.readCnt);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="filterCnt"]').val(responseData.filterCnt);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="writeCnt"]').val(responseData.writeCnt);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="readSkpCnt"]').val(responseData.readSkpCnt);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="writeSkpCnt"]').val(responseData.writeSkpCnt);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="prcsSkpCnt"]').val(responseData.prcsSkpCnt);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="batchJobParmVal"]').val(responseData.batchJobParmVal);






                	  that.$el.find('.CAPMT017-base-section [data-form-param="batchJobId"]').prop("disabled", true);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="batchJobNm"]').prop("disabled", true);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="batchJobInstncId"]').prop("disabled", true);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="stepCnt"]').prop("disabled", true);
                	  //배치작업생성시간
                	  that.$el.find('.CAPMT017-base-section [data-form-param="batchJobCreatedHms"]').prop("disabled", true);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="batchJobExctnStsCd"]').prop("disabled", true);
                	  //배치작업 실행시작시간
                	  that.$el.find('.CAPMT017-base-section [data-form-param="batchJobExctnStartHms"]').prop("disabled", true);
                	  //배치작업 실행 종료시간
                	  that.$el.find('.CAPMT017-base-section [data-form-param="batchJobExctnEndHms"]').prop("disabled", true);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="batchJobEndStsCd"]').prop("disabled", true);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="commitCnt"]').prop("disabled", true);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="rlbckCnt"]').prop("disabled", true);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="readCnt"]').prop("disabled", true);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="filterCnt"]').prop("disabled", true);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="writeCnt"]').prop("disabled", true);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="readSkpCnt"]').prop("disabled", true);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="writeSkpCnt"]').prop("disabled", true);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="prcsSkpCnt"]').prop("disabled", true);
                	  that.$el.find('.CAPMT017-base-section [data-form-param="batchJobParmVal"]').prop("disabled", true);






                }


            }


           , refreshData: function () {
               var that = this;
               var timeVal= that.$el.find('.CAPMT017-base-section [data-form-param="refreshIntvl"]').val();


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
			 * 기본부 정보로 그리드 조회
			 */
            , inquiryBaseData: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;


                var linkData = {"header": fn_getHeader("PMT0178401"), "BatchJobExctnMgntSvcDtlOut": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                        	that.setBaseData(that, responseData.BatchJobExctnMgntSvcDtlOut, "Y");
                            var tbList;
                            if(responseData.BatchJobExctnMgntSvcDtlOut.stepInfo) {
                            	tbList=responseData.BatchJobExctnMgntSvcDtlOut.stepInfo;
                            };
                            if (tbList != null || tbList.length > 0) {
                                    that.CAPMT017Grid.setData(tbList);


                                  //### 새로고침  3 ###
                                    //그리드의 바인딩 결과 실행중이 존재하면 refresh는 enable, 실행중이이 아니면 refresh는 disable
                                    if(!that.isRunning){//배치작업이 실행중이 아님 새로 고침 불필요
                                     	that.$el.find('#btn-refresh').prop("disabled",true);
                                     	//반복호출을 중단시켜야 함
                                     	if (that.go) { //실행중인 refresh를 중지시킴
                                    		clearInterval(that.go);
                                    	}
                                     }


                                    that.$('#rsltCnt').html(tbList.length);
                                    //데이터 조회가 완료된 이후 버튼을 재설정
	                                that.changeButton();


                            }else{
                            	that.CAPMT017Grid.grid.getEl().down('.x-grid-view').scroll('bottom', 100, true);
                                that.$('#rsltCnt').html("0");
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end




            , restartBatchjob: function (param) {
            	var that=this;
            	that.controlBatchjob(that.param,"01");
            }
            , suspendBatchjob: function (param) {
            	var that=this;
            	that.controlBatchjob(that.param,"02");
            }
            , resumeBatchjob: function (param) {
            	var that=this;
            	that.controlBatchjob(that.param,"03");
            }
            , stopBatchjob: function (param) {
            	var that=this;
            	that.controlBatchjob(that.param,"04");
            }
          /*  , forcedStopBatchjob: function (param) {
            	var that=this;
            	that.controlBatchjob(that.param,"05");
            }
            */


	        , controlBatchjob: function (param, cntlCode) {
	            // header 정보 set
	            var that = this;
	            var sParam = {};


	            sParam.instCd=param.instCd; //기관코드
	            sParam.batchJobId=param.batchJobId; //배치작업식별자
	            sParam.batchJobExctnDt=param.batchJobExctnDt; //배치작업거래일자
	            sParam.batchJobInstncId=param.batchJobInstncId; //배치작업 인스턴스 식별자
	            sParam.batchJobExctnNbr=param.batchJobExctnNbr; //배치작업 실행번호
	            sParam.batchJobCntrlCd=cntlCode;  //배치명령어코드


	            var linkData = {"header": fn_getHeader("PMT0178101"), "BatchJobExctnMgntSvcIO": sParam};


	            // ajax호출
	            bxProxy.post(sUrl, JSON.stringify(linkData), {
	                enableLoading: true
	                , success: function (responseData) {
	                    if (fn_commonChekResult(responseData)) {
                            fn_alertMessage("", bxMsg("cbb_items.SCRNITM#success"));
	                        // that.query();  -> 어떤 작업이 필요???
	                    }
	                }   // end of suucess: fucntion
	            }); // end of bxProxy


	        } // end




	        , changeButton: function () {
            	var that=this;
            	var batchJobEndStatus=that.$el.find('.CAPMT017-base-section [data-form-param="batchJobEndStsCd"]').val();
            	var oSuspendBtn =	that.$el.find('#btn-base-section-suspend');
            	var oResumeBtn =	that.$el.find('#btn-base-section-resume');
            	var oRestartBtn =	that.$el.find('#btn-base-section-restart');
            	var oStopBtn =		that.$el.find('#btn-base-section-stop');
            	//var oForcedStopBtn =	that.$el.find('.CAPMT017-base-forcedStop-button');




            	oSuspendBtn.prop("disabled", true);
            	oResumeBtn.prop("disabled", true);
            	oRestartBtn.prop("disabled", true);
            	oStopBtn.prop("disabled", true);
            	//oForcedStopBtn.prop("disabled", true);


            	switch(batchJobEndStatus) {
            		case "01": //정상완료 -> restart
            			oRestartBtn.prop("disabled", false);
            			break;
            	    case "02":  //실행중  -> suspend, stop,  resume
            	    	        // 02, 03은 동일한 처리
            	    case "03": //실행완료  -> suspend, stop,  resume


            	    	oSuspendBtn.prop("disabled", false);
            	    	oStopBtn.prop("disabled", false);
                    	//oForcedStopBtn.prop("disabled", false);
                    	//2015.12.4 resume을 suspend와 동일하게 함
                    	oResumeBtn.prop("disabled", false);
            			break;
            	    case "05": //중단 ->  restart
            	    	       // 2015.12.4 resume, stop, forcedstop 을 삭제함
            	    	oRestartBtn.prop("disabled", false);
                    	//oForcedStopBtn.prop("disabled", false);
            			break;
            	    case "06"://실패
            	    case "07"://비정상종료
            	    case "08"://미실행
            	    	oRestartBtn.prop("disabled", false);
            			break;
            	    default:
            	    }


            }




            /**
			 * 그리드 생성
			 */
            , createGrid: function () {
                var that = this;
                this.$el.find(".CAPMT017-grid-section").html(this.CAPMT017Grid.render({'height': '250px'}));
            } // end of createGrid


            /**
			 * 그리드 행 더블클릭
			 */


            , doubleiClickGrid: function () {


	            var that = this;
                var selectedRecord = that.CAPMT017Grid.grid.getSelectionModel().selected.items[0];




                if (!selectedRecord) {
                    return;
                } else {
                	that.$el.trigger({
                        type: 'open-conts-page'
                    , pageHandler: 'CAPMT018'
                    , pageDPName: bxMsg('cbb_items.SCRN#CAPMT018')
                    , pageInitialize: true
                    , pageRenderInfo: {
                    	instCd:  commonInfo.getInstInfo().instCd
                    	,batchJobId: that.$el.find('.CAPMT017-base-section [data-form-param="batchJobId"]').val()
                    	,batchJobInstncId: that.$el.find('.CAPMT017-base-section [data-form-param="batchJobInstncId"]').val()
                    	,batchJobStepNbr: selectedRecord.data.batchJobStepNbr
                    	//,origin: "PSV074"
                    	}
                    });
                }
            }


            , fn_base_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT017-base-section"), this.$el.find("#btn-base-section-toggle"));
            }


            , fn_grid_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT017-grid-section"), this.$el.find("#btn-grid-section-toggle"));
            }


        }); // end of Backbone.View.extend({


        return CAPMT017View;
    } // end of define function
); // end of define
