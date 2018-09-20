define(
    [
          'bx/common/config'
        , 'text!app/views/page/CAPMT/016/_CAPMT016.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
        , 'app/views/page/popup/CAPMT/popup-searchBatchJob'
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
        var CAPMT016View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container CAPMT016-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }
            // 이벤트 설정
            , events: {
                  'click #btn-base-section-reset'		: 'resetBase'
                , 'click #btn-base-section-inquiry'		: 'query'
                , 'click #btn-refresh'		: 'refreshData'
                , 'click #btn-popup-batchJobId': 'popupBatchJbIdSearchSrvc'
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


                that.$el.html(that.tpl());


                var sParam1 = {cdNbr:"A0222"}; // 실행상태코드


                bxProxy.all([{
                        // 배치컴포넌트코드
                        url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam1}), success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                comboStore0161 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                	}
                	]
                    , {
                        success: function () {
                            that.CAPMT016Grid = new ExtGrid({
                                // 그리드 컬럼 정의


                                fields: ['batchJobId', 'batchJobNm','batchJobInstncId','batchJobExctnNbr', 'batchJobExctnStartHms', 'batchJobExctnStsCd','batchJobEndStsCd'  ]
                                , id: 'CAPMT016Grid'
                                , columns: [
                                     //배치작업식별자
                                    {
                                        text: bxMsg('cbb_items.AT#batchJobId')
                                        , flex: 4
                                        , height: 25
                                        , dataIndex: 'batchJobId'
                                        , style: 'text-align:center'
                                        , align: 'left'
                                    }
                                    //배치작업명
	                        		, {
                                        text: bxMsg('cbb_items.AT#batchJobNm')
                                        , flex: 6
                                        , dataIndex: 'batchJobNm'
                                        , style: 'text-align:center'
                                        , align: 'left'


                                    }//배치작업인스턴스 식별자
	                        		, {
                                        text: bxMsg('cbb_items.AT#batchJobInstncId')
                                        , flex: 5
                                        , dataIndex: 'batchJobInstncId'
                                        , style: 'text-align:center'
                                        , align: 'left'


                                    }
	                        		//배치작업실행 넘버
	                        		, {
                                        text: bxMsg('cbb_items.AT#batchJobExctnNbr')
                                        , flex: 4
                                        , dataIndex: 'batchJobExctnNbr'
                                        , style: 'text-align:center'
                                        , align: 'center'


                                    }
	                        		//배치시작시간
	                        		, {
                                        text: bxMsg('cbb_items.AT#batchJobExctnStartHms')
                                        , flex: 4
                                        , dataIndex: 'batchJobExctnStartHms'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                        , renderer: function (val) {
                                        	var reVal = val.substring(0,2)+":";
                                            	reVal=reVal+val.substring(2,4)+":";
                                            	reVal=reVal+val.substring(4,6);


                                                return reVal;
                                        }
                                    }
	                        		//실행상태
	                        		, {
                                        text: bxMsg('cbb_items.AT#batchJobExctnStsCd')
                                        , flex: 4
                                        , dataIndex: 'batchJobExctnStsCd'
                                        , style: 'text-align:center'
                                       	, align: 'center'
                                       	, renderer: function (val) {
                                            	index = comboStore0161.findExact('cd', val);
                                            	if (index != -1) {
                                            		rs = comboStore0161.getAt(index).data;


                                                 return rs.cdNm;
                                             }
                                         }
                                    }
	                        		//종료구분
	                        		, {
                                        text: bxMsg('cbb_items.AT#batchJobEndStsCd')
                                        , flex: 4
                                        , dataIndex: 'batchJobEndStsCd'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                       	, renderer: function (val) {
                                            	index = comboStore0161.findExact('cd', val);
                                            	if (index != -1) {
                                            		rs = comboStore0161.getAt(index).data;


                                            	     //### 새로고침  2 ###
                                            		//조회한 결과를 그리드에 바인딩할 때 배치작업죵료구분코드가 실행중이면 작업은 수행중임
                                            		// 이경우 refresh 버튼을 살림
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


                // 데이터 피커 로드
                this.loadDatePicker();
                this.setTimePicker();


                //실행상태
                fn_getCodeList({className:"CAPMT016-batchJobExctnStsCd-wrap",targetId:"batchJobExctnStsCd",nullYn:"Y",cdNbr:"A0222",allNm:bxMsg("cbb_items.SCRNITM#all")}, this);


                this.setBaseData(this, "", "X");


                return this.$el;
            }




            , refreshData: function () {
                var that = this;
                var timeVal= that.$el.find('.CAPMT016-base-section [data-form-param="refreshIntvl"]').val();


                //토글로 처리
                if(that.isRefresh){
                	// refresh가 수행중 중지를 누른 경우
                	that.isRefresh=false;
                	//버튼의 label을 refresh로 변경
                	that.$el.find('#btn-refresh').prop("title",bxMsg('cbb_items.SCRNITM#refresh')).prop("innerHTML",bxMsg('cbb_items.SCRNITM#refresh'));
                	//검색조건들을 enable 시킴
                	that.setEnableDisable("Y");
                	if (this.go) { //실행중인 refresh를 중지시킴
                		clearInterval(this.go);
                	}
                } else { // refresh가 처음 선택된 경우
                	that.isRefresh=true;
                	//버튼의 label을 중지로 변경
                	that.$el.find('#btn-refresh').prop("title",bxMsg('cbb_items.ABRVTN#stop')).prop("innerHTML",bxMsg('cbb_items.ABRVTN#stop'));
                	//검색조건들을 disable 시킴
                	that.setEnableDisable("X");
                	if(timeVal) {
                			var nTimeVal=parseInt(timeVal);  //정수로 바꾸기
                			if(nTimeVal>0){
		                		this.go=setInterval(function(){
		                			//call_inquiry
		                			//alert("this is test");
		                			that.query();
		                		},nTimeVal*1000);
	                		}
                	}


                }


            }
            ,setEnableDisable: function(type){
            	that = this;
            	var bVal;


                if (type == "X") { bVal=true; }  //disable 시킴
                else {bVal=false;}  //enable 시킴


                that.$el.find('.CAPMT016-base-section [data-form-param="batchJobExctnDt"]').prop("disabled",bVal);
                that.$el.find('.CAPMT016-base-section [data-form-param="batchJobExctnStartHms"]').prop("disabled",bVal);
                that.$el.find('.CAPMT016-base-section [data-form-param="batchJobExctnEndHms"]').prop("disabled",bVal);
                that.$el.find('.CAPMT016-base-section [data-form-param="batchJobId"]').prop("disabled",bVal);
                that.$el.find('.CAPMT016-base-section [data-form-param="batchJobNm"]').prop("disabled",bVal);
                that.$el.find('.CAPMT016-base-section [data-form-param="batchJobExctnStsCd"]').prop("disabled",bVal);
            }
            , resetBase:function() {
                this.setBaseData(this, "", "X");
                this.setEnableDisable();
                that.CAPMT016Grid.resetData();
                that.$('#rsltCnt').html("0");
            }
            /**
			 * 기본부 초기화
			 */
            , setBaseData: function (that, responseData, type) {
                that = this;


                if (type == "X") {
                    that.$el.find('.CAPMT016-base-section [data-form-param="batchJobId"]').val("");
                    that.$el.find('.CAPMT016-base-section [data-form-param="batchJobNm"]').val("");
                    that.$el.find('.CAPMT016-base-section [data-form-param="batchAplctnNm"]').val("");
                    that.$el.find('.CAPMT016-base-section [data-form-param="batchJobInstncId"]').val("");
                    that.$el.find('.CAPMT016-base-section [data-form-param="batchJobExctnStartHms"]').val("");
                    that.$el.find('.CAPMT016-base-section [data-form-param="batchJobExctnEndHms"]').val("");
                    that.$el.find('.CAPMT016-base-section [data-form-param="batchJobExctnStsCd"]').val("");
                    that.$el.find('.CAPMT016-base-section [data-form-param="refreshIntvl"]').val("10");
                    that.$el.find('.CAPMT016-base-section [data-form-param="batchJobExctnDt"]').val(getCurrentDate("yyyy-mm-dd"));


                    that.$('#btn-refresh').prop("title",bxMsg('cbb_items.SCRNITM#refresh')).prop("innerHTML",bxMsg('cbb_items.SCRNITM#refresh'));
                    that.$('#btn-refresh').prop("disabled",false);
                }
            }






            /**
			 * 기본부 조회 버튼 클릭
			 */
            , query: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.CAPMT016-base-section'));


                if(sParam.refreshIntvl)
                {
                    delete sParam.refreshIntvl;
                }


                //기관코드 존재여부 체크
                if (commonInfo.getInstInfo().instCd) {
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                } else {
                    fn_alertMessage("", bxMsg("cbb_items.SCRNITM#instSearchMsg"));
                    return;
                }


                // 실행일 입력여부 체크
                if(that.$el.find('.CAPMT016-base-section [data-form-param="batchJobExctnDt"]').eq(0).val() == "") {
                    fn_alertMessage("", bxMsg("cbb_err_msg.UICME0004") + "[" + bxMsg("cbb_items.AT#exctnDt") + "]");
					return;
				}


                //### 새로고침  1 ###
                //query를 수행한 경우, 배치작업의 실행상태를 false로 초기화한다.
                //최초에는 배치작업은 비수행이다.
                that.isRunning=false;


                that.$el.find('#btn-refresh').prop("disabled",false);


                that.inquiryBaseData(sParam);


            }


            /**
			 * 기본부 정보로 그리드 조회
			 */
            , inquiryBaseData: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;
                sParam.batchJobExctnDt =  that.$el.find('.CAPMT016-base-section [data-form-param="batchJobExctnDt"]').val();
                sParam.batchJobExctnDt = sParam.batchJobExctnDt.replace(/-/gi,"");


                sParam.batchJobExctnStartHms = that.$el.find('.CAPMT016-base-section [data-form-param="batchJobExctnStartHms"]').val();
                if(sParam.batchJobExctnStartHms!=""){
                	sParam.batchJobExctnStartHms =  sParam.batchJobExctnStartHms.replace(/:/gi,"").concat("00");
                }


                sParam.batchJobExctnEndHms =  that.$el.find('.CAPMT016-base-section [data-form-param="batchJobExctnEndHms"]').val();
                if(sParam.batchJobExctnEndHms!="") {
                	sParam.batchJobExctnEndHms = sParam.batchJobExctnEndHms.replace(/:/gi,"").concat("00");
                }


                var linkData = {"header": fn_getHeader("PMT0168401"), "BatchJobExctnMgntSvcIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var tbList;
                            if(responseData.BatchJobExctnMgntSvcListOut.outList) {
                            	tbList=responseData.BatchJobExctnMgntSvcListOut.outList;
                            };
                            if (tbList != null || tbList.length > 0) {
                                //if (sParam.pgNbr == 1) {
                                    // 조회
                                    that.CAPMT016Grid.setData(tbList);


                                    //### 새로고침  3 ###
                                    //그리드의 바인딩 결과 실행중이 존재하면 refresh는 enable, 실행중이이 아니면 refresh는 disable
                                    if(!that.isRunning){//배치작업이 실행중이 아님 새로 고침 불필요
                                     	that.$el.find('#btn-refresh').prop("disabled",true);
                                     	//반복호출을 중단시켜야 함
                                     	if (that.go) { //실행중인 refresh를 중지시킴
                                    		clearInterval(that.go);
                                    	}
                                     }
                                /*} else {
                                    // 다음 조회
                                    that.CAPMT016Grid.addData(tbList);
                                    that.CAPMT016Grid.grid.getSelectionModel().select((that.pgNbr-1) * that.pgCnt + tbList.length -1);
                                } */
                                that.$('#rsltCnt').html(tbList.length);
                            }else{
                            	that.CAPMT016Grid.grid.getEl().down('.x-grid-view').scroll('bottom', 100, true);
                                that.$('#rsltCnt').html("0");
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end


            /**
			 * 데이터 피커 로드 컴포넌트 데이터 피커를 사용
			 */
            , loadDatePicker: function () {
            	fn_makeDatePicker(this.$('.CAPMT016-base-section [data-form-param="batchJobExctnDt"]'));
            }
            , setTimePicker:function()
            {
                var that = this;
                that.$('.CAPMT016-base-section [data-form-param="batchJobExctnStartHms"]').mask("99:99",{placeholder:"--:--"});
                that.$('.CAPMT016-base-section [data-form-param="batchJobExctnEndHms"]').mask("99:99",{placeholder:"--:--"});
            }
            /**
			 * 그리드 생성
			 */
            , createGrid: function () {
                var that = this;
                this.$el.find(".CAPMT016-grid-section").html(this.CAPMT016Grid.render({'height': '450px'}));
            } // end of createGrid


            /**
			 * 그리드 행 더블클릭
			 */


            , doubleiClickGrid: function () {


	            var that = this;
                var selectedRecord = that.CAPMT016Grid.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                    return;
                } else {
                	that.$el.trigger({
                        type: 'open-conts-page'
                    , pageHandler: 'CAPMT017'
                    , pageDPName: bxMsg('cbb_items.SCRN#CAPMT017')
                    , pageInitialize: true
                    , pageRenderInfo: {
                    	instCd:  commonInfo.getInstInfo().instCd
                    	,batchJobId: selectedRecord.data.batchJobId
                    	,batchJobInstncId:  selectedRecord.data.batchJobInstncId
                    	//실행일자
                    	,batchJobExctnDt: 		that.$el.find('.CAPMT016-base-section [data-form-param="batchJobExctnDt"]').val()
                    	//시작시간
                    	,batchJobExctnStartHms: selectedRecord.data.batchJobExctnStartHms
                    	//,origin: "PSV074"
                    	,batchJobExctnNbr: 		selectedRecord.data.batchJobExctnNbr
                    	}
                    });
                }
            }




            /**
             *  배치작업식별자 팝업
             */
            , popupBatchJbIdSearchSrvc: function () {


                var that = this;


                var popupBtchJb = new PopupBtchJb(); // 팝업생성


                popupBtchJb.render();
                popupBtchJb.on('popUpSetData', function (param) {
                    that.$el.find('.CAPMT016-base-section [data-form-param="batchJobId"]').val(param.batchJobId); //배치작업 식별자
                    that.$el.find('.CAPMT016-base-section [data-form-param="batchJobNm"]').val(param.batchJobNm); //배치작업명
                });
            }


            , fn_base_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT016-base-section"), this.$el.find("#btn-base-section-toggle"));
            }


            , fn_grid_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT016-grid-section"), this.$el.find("#btn-grid-section-toggle"));
            }




        }); // end of Backbone.View.extend({


        return CAPMT016View;
    } // end of define function
); // end of define
