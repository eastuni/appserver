define(
    [
          'bx/common/config'
        , 'text!app/views/page/CAPMT/022/_CAPMT022.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
        , 'app/views/page/popup/CAPAT/popup-staffId'
    ]
    , function (config
        , tpl
        , ExtGrid
        , commonInfo
        , PopupStaffId
        ) {


        /**
		 * Backbone
		 */
        var CAPMT022View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container CAPMT022-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }
            // 이벤트 설정
            , events: {
                  'click #btn-base-section-reset'		: 'resetBase'
                , 'click #btn-base-section-inquiry'		: 'query'
                , 'click #btn-detail-section-save'	: 'saveDetail'
                , 'click #btn-detail-section-del'	: 'deleteDetail'
                , 'click #btn-popup-frstOprtnStaffId' : 'popupSearchStaff1'
                , 'click #btn-popup-scndryOprtnStaffId' : 'popupSearchStaff2'
            }


            /**
			 * initialize
			 */
            , initialize: function (initData) {
                var that = this;
                that.isModify=false;
                //that.pgNbr = 1;
                //that.pgCnt = 20;


                $.extend(that, initData);


                that.$el.html(that.tpl());


                var sParam1 = {cdNbr:"A0217"}; // 배치컴포넌트코드
                var sParam2 = {cdNbr:"30008"}; // 배치작업유형코드
                var sParam3 = {cdNbr:"10000"}; // 삭제여부
                //var sParam4 = {cdNbr:"10000"}; 


                bxProxy.all([{
                        // 배치컴포넌트코드
                        url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam1}), success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                comboStore721 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                	},{// 배치작업유형코드
	                    url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam2}), success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            comboStore722 = new Ext.data.Store({
	                                fields: ['cd', 'cdNm'],
	                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
	                            });
	                        }
	                    }
		            }
                	,{// 삭제여부코드
	                    url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam3}), success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            comboStore723 = new Ext.data.Store({
	                                fields: ['cd', 'cdNm'],
	                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
	                            });
	                        }
	                    }


		            }
                	/*
                	,{// 사용여부코드
	                    url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam3}), success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            comboStore4 = new Ext.data.Store({
	                                fields: ['cd', 'cdNm'],
	                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
	                            });
	                        }
	                    }


		            }*/
                	]
                    , {
                        success: function () {
                            that.CAPMT022Grid = new ExtGrid({
                                // 그리드 컬럼 정의
                            	// 사용여부, 적용시작일 추가할 것
                                fields: ['batchJobId', 'batchJobNm', 'batchAplctnNm', 'batchJobTpCd','useYn', 'aplyStartDt','delYn','frstOprtnStaffId','scndryOprtnStaffId'  ]
                                , id: 'CAPMT022Grid'
                                , columns: [
                                     //배치작업식별자
                                    {
                                        text: bxMsg('cbb_items.AT#batchJobId')
                                        , flex: 7
                                        , height: 25
                                        , dataIndex: 'batchJobId'
                                        , style: 'text-align:center'
                                        , align: 'left'
                                    }
                                    //배치작업명
	                        		, {
                                        text: bxMsg('cbb_items.AT#batchJobNm')
                                        , flex: 7
                                        , dataIndex: 'batchJobNm'
                                        , style: 'text-align:center'
                                        , align: 'left'


                                    }
	                        		//배치작업유형코드
	                        		, {
                                        text: bxMsg('cbb_items.AT#batchJobTpCd')
                                        , flex: 3
                                        , dataIndex: 'batchJobTpCd'
                                        , style: 'text-align:center'
                                       	, align: 'center'
                                        , renderer: function (val) {
                                        	index = comboStore722.findExact('cd', val);
                                        	if (index != -1) {
                                        		rs = comboStore722.getAt(index).data;
                                                return rs.cdNm;
                                            }
                                        }
                                    }
	                        		//배치컴포넌트코드
                                    , {
                                        text: bxMsg('cbb_items.AT#batchAplctnNm')
                                        , flex: 3
                                        , dataIndex: 'batchAplctnNm'
                                        , style: 'text-align:center'
                                       	, align: 'center'
                                       	, renderer: function (val) {
                                            	index = comboStore721.findExact('cd', val);
                                            	if (index != -1) {
                                            		rs = comboStore721.getAt(index).data;
                                                 return rs.cdNm;
                                             }
                                         }
                                    }
                                    //적용시작일
                                    , {
                                    	text: bxMsg('cbb_items.AT#aplyStartDt')
                                    	, flex: 4
                                    	, dataIndex: 'aplyStartDt'
                                    	, style: 'text-align:center'
                                    	, align: 'center'
                                    }
                                  //삭제여부
                                    , {
                                    	text: bxMsg('cbb_items.AT#delYn')
                                    	, flex: 2
                                    	, dataIndex: 'delYn'
                                    	, style: 'text-align:center'
                                    	, align: 'center'
                                    	, renderer: function (val) {
                                            	index = comboStore723.findExact('cd', val);
                                            	if (index != -1) {
                                            		rs = comboStore723.getAt(index).data;
                                                 return rs.cdNm;
                                             }
                                         }
                                    }
                                  //1차 운영자
                                    , {
                                    	text: bxMsg('cbb_items.AT#frstOprtnStaffId')
                                    	, flex: 4
                                    	, dataIndex: 'frstOprtnStaffId'
                                    	, style: 'text-align:center'
                                    	, align: 'center'
                                    }//2차 운영자
                                    , {
                                    	text: bxMsg('cbb_items.AT#scndryOprtnStaffId')
                                    	, flex: 4
                                    	, dataIndex: 'scndryOprtnStaffId'
                                    	, style: 'text-align:center'
                                    	, align: 'center'
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


                // 콤보데이터 로딩


                // 배치컴포넌트 코드
                fn_getCodeList({className:"CAPMT022-base-section .CAPMT022-batchAplctnNm-wrap",targetId:"batchAplctnNm",nullYn:"Y",cdNbr:"A0217",allNm:bxMsg("cbb_items.SCRNITM#all")}, this);
                fn_getCodeList({className:"CAPMT022-detail-section .CAPMT022-batchAplctnNm-wrap",targetId:"batchAplctnNm",nullYn:"Y",cdNbr:"A0217"}, this);


                // 배치작업유형 코드
                fn_getCodeList({className:"CAPMT022-base-section .CAPMT022-batchJobTpCd-wrap",targetId:"batchJobTpCd",nullYn:"Y",cdNbr:"30008",allNm:bxMsg("cbb_items.SCRNITM#all")}, this);
                fn_getCodeList({className:"CAPMT022-detail-section .CAPMT022-batchJobTpCd-wrap",targetId:"batchJobTpCd",nullYn:"Y",cdNbr:"30008"}, this);


                // 삭제여부
                fn_getCodeList({className:"CAPMT022-delYn-wrap",targetId:"delYn",nullYn:"Y",cdNbr:"10000"}, this);


                // 사용여부
                //fn_getCodeList({className:"CAPMT022-useYn-wrap",targetId:"useYn",nullYn:"Y",cdNbr:"10000"}, this);






                this.setBaseData(this, "", "X");


                return this.$el;
            }


            /**
			 * 기본부 초기화
			 */
            , setBaseData: function (that, responseData, type) {
                that = this;


                if (type == "X") {
                    that.$el.find('.CAPMT022-base-section [data-form-param="batchJobId"]').val("");
                    that.$el.find('.CAPMT022-base-section [data-form-param="batchJobNm"]').val("");
                    that.$el.find('.CAPMT022-base-section [data-form-param="batchAplctnNm"]').val("");
                    that.$el.find('.CAPMT022-base-section [data-form-param="batchJobTpCd"]').val("");


                }
            }


            /**
			 * 기본부 리셋
			 */
            , resetBase: function () {
            	that = this;
            	that.$el.find('.CAPMT022-base-section [data-form-param="batchJobId"]').val("");
                that.$el.find('.CAPMT022-base-section [data-form-param="batchJobNm"]').val("");
                that.$el.find('.CAPMT022-base-section [data-form-param="batchAplctnNm"]').val("");
                that.$el.find('.CAPMT022-base-section [data-form-param="batchJobTpCd"]').val("");


                that.CAPMT022Grid.resetData();
            }


            /**
			 * 기본부 조회 버튼 클릭
			 */
            , query: function () {
                var that = this;
                //that.pgNbr=1;


                var sParam = bxUtil.makeParamFromForm($('.CAPMT022-base-section'));


                //기관코드 존재여부 체크
                if (commonInfo.getInstInfo().instCd) {
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                } else {
                    fn_alertMessage("", bxMsg("cbb_items.SCRNITM#instSearchMsg"));
                    return;
                }


                that.inquiryBaseData(sParam);
            }
            /**
             * 다음 조회
             */
            , queryNext: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.CAPMT022-base-section'));
                sParam.instCd = commonInfo.getInstInfo().instCd;


                //that.pgNbr++;


                that.inquiryBaseData(sParam);
            }
            /**
			 * 기본부 정보로 그리드 조회
			 */
            , inquiryBaseData: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;
               // sParam.pgNbr = that.pgNbr;
               // sParam.pgCnt = that.pgCnt;


                var linkData = {"header": fn_getHeader("PMT0228402"), "InstBatchJobMgntSvcIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var tbList = responseData.InstBatchJobMgntSvcListOut.outList;
                            if (tbList != null || tbList.length > 0) {
                               // if (sParam.pgNbr == 1) {
                                    // 조회
                                    that.CAPMT022Grid.setData(tbList);
                               // } else {
                                    // 다음 조회
                                //    that.CAPMT022Grid.addData(tbList);
                                //    that.CAPMT022Grid.grid.getSelectionModel().select((that.pgNbr-1) * that.pgCnt + tbList.length -1);
                                //}
                            }else{
                            	that.CAPMT022Grid.grid.getEl().down('.x-grid-view').scroll('bottom', 100, true);
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end
            /**
			 * 데이터 피커 로드 컴포넌트 데이터 피커를 사용
			 */
            , loadDatePicker: function () {
                fn_makeDatePicker(this.$('.CAPMT022-detail-section [data-form-param="aplyStartDt"]'));
            }
            /**
			 * 그리드 생성
			 */
            , createGrid: function () {
                var that = this;
                this.$el.find(".CAPMT022-grid-section").html(this.CAPMT022Grid.render({'height': '450px'}));
            } // end of createGrid


            /**
			 * 그리드 행 더블클릭
			 */
            /*
            , doubleiClickGrid: function () {
                var that = this;
                var selectedRecord = that.CAPMT022Grid.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                    return;
                } else {
                	that.$el.trigger({
                        type: 'open-conts-page'
                    , pageHandler: 'PMT023'
                    , pageDPName: bxMsg('cbb_items.SCRN#PMT023')
                    , pageInitialize: true
                    , pageRenderInfo: {
                    	batchJobId: selectedRecord.data.batchJobId
                    	,instCd:  commonInfo.getInstInfo().instCd
                    	}
                    });
                }


            }
           */


            , doubleiClickGrid: function () {
	            var that = this;
	            var sParam = bxUtil.makeParamFromForm($('.CAPMT022-base-section'));
	            var selectedRecord = that.CAPMT022Grid.grid.getSelectionModel().selected.items[0];


	            if (!selectedRecord) {
	                return;
	            } else {
	                var sParam = {};
	                //sParam.batchJobId = selectedRecord.data.batchJobId;
	                that.setDetailData(selectedRecord.data);
	                //that.inquiryDetail(sParam);
	            }
            }
            /**
			 * set 상세부 정보.
			 */
            , setDetailData: function (param) {
                var that = this;


                var resetData = param;


                if(param.aplyStartDt){  //적용시작일이 존재하는 경우 변경작업 delete-insert
                	that.isModify=true;
            	}
                else{  //적용시작일이 존재하지 않는 경우 insert
                	resetData.aplyStartDt=getCurrentDate("yyyy-mm-dd");
                	that.isModify=false;
                }


                // <!-- 배치 식별자 -->
            	that.$el.find('.CAPMT022-detail-section [data-form-param="batchJobId"]').val(param.batchJobId);


            	// <!-- 배치작업명 -->
            	that.$el.find('.CAPMT022-detail-section [data-form-param="batchJobNm"]').val(param.batchJobNm);
            	// <!-- 배치컴포넌트 -->
            	that.$el.find('.CAPMT022-detail-section [data-form-param="batchAplctnNm"]').val(param.batchAplctnNm);
            	that.$el.find('.CAPMT022-detail-section [data-form-param="batchAplctnNm"]').prop("disabled", true);




            	// <!-- 배치작업유형코드 -->
            	that.$el.find('.CAPMT022-detail-section [data-form-param="batchJobTpCd"]').val(param.batchJobTpCd);
            	that.$el.find('.CAPMT022-detail-section [data-form-param="batchJobTpCd"]').prop("disabled", true);


            	// <!-- 사용여부 -->
            	//that.$el.find('.CAPMT022-detail-section [data-form-param="useYn"]').val(param.useYn);


            	// <!-- 적용시작일 -->
            	that.$el.find('.CAPMT022-detail-section [data-form-param="aplyStartDt"]').val(param.aplyStartDt);

            	// <!-- 1차운영자 -->
            	that.$el.find('.CAPMT022-detail-section [data-form-param="frstOprtnStaffId"]').val(param.frstOprtnStaffId);


            	//<!-- 2차운영자 -->
            	that.$el.find('.CAPMT022-detail-section [data-form-param="scndryOprtnStaffId"]').val(param.scndryOprtnStaffId);


            	// <!-- 삭제여부-->
            	that.$el.find('.CAPMT022-detail-section [data-form-param="delYn"]').val(param.delYn);








            } // end


            /**
			 * 상세부 정보 조회
			 */
            /*
            , inquiryDetail: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;


                sParam.instCd=commonInfo.getInstInfo().instCd;
                var linkData = {"header": fn_getHeader("PMT0228401"), "InstBatchJobMgntSvcIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var detailData = responseData.InstBatchJobMgntSvcIO;  //메소드 변경 필요....
                            if (detailData) {
                            	that.displayDetail(detailData);
                            }else{
                            	alert("error! it's impossible.");
                            }
                        }
                    }   // end of success: function
                }); // end of bxProxy
            } // end
            */
            /**
			 * 상세부 정보 Display.
			 */
            /*
            , displayDetail: function (param) {
                var that = this;


                that.isModify=true;


                that.setDetailData(param);


             // 데이터 피커 렌더
             //   this.$el.find('.PMT023-aplyStartDt-wrap').html(this.subViews['aplyStartDt'].render());


            } // end
            */


            /**
			 * 상세부 정보 reset.
			 */
            /*
            , resetDetail: function (param) {
                var that = this;
                that.isModify=true;


                //var resetData = {};
                var resetData = param;


                if(param.aplyStartDt){
                	resetData.aplyStartDt=param.aplyStartDt;
            	}
                else{
                	resetData.aplyStartDt=getCurrentDate("yyyy-mm-dd")
                }
                that.setDetailData(resetData);


            } // end
            */
            /**
			 * 상세부 정보 저장 버튼
			 */
            , saveDetail: function (param) {
                var that = this;


                var sParam = bxUtil.makeParamFromForm($('.CAPMT022-detail-section'));
                sParam.aplyStartDt = sParam.aplyStartDt.replace(/-/gi,"");
                sParam.instCd=commonInfo.getInstInfo().instCd;
                if(that.isModify){
                	that.modifyDetail(sParam);
                }else{
                	that.addDetail(sParam);
                }




            } // end
            /**
			 * 상세부 정보 추가
			 */
            , addDetail: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;


                var linkData = {"header": fn_getHeader("PMT0228101"), "InstBatchJobMgntSvcIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            fn_alertMessage("", bxMsg("cbb_items.SCRNITM#success"));
                        	//that.resetDetail();
                        	//that.resetDetail(sParam);
                        	//속도를 향상시키기 위해서는 그리드에 값을 설정하는 방법이 필요함 -> 현재는 표준이 정해져 있는 것은 아님
                            that.query();
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end
            /**
			 * 상세부 정보 변경
			 */
            , modifyDetail: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;




                var linkData = {"header": fn_getHeader("PMT0228201"), "InstBatchJobMgntSvcIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            fn_alertMessage("", bxMsg("cbb_items.SCRNITM#success"));
                        	//that.resetDetail();
                        	//that.resetDetail(sParam);
                        	that.query();
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end
            /**
			 * 상세부 정보 삭제
			 */
            , deleteDetail: function () {
                // header 정보 set
                var that = this;
                var sParam = {"batchJobId": that.$el.find('.CAPMT022-detail-section [data-form-param="batchJobId"]').val()};
                sParam.instCd=commonInfo.getInstInfo().instCd;


                var linkData = {"header": fn_getHeader("PMT0228301"), "InstBatchJobMgntSvcIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            fn_alertMessage("", bxMsg("cbb_items.SCRNITM#success"));
                        	//that.resetDetail();
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end
            , popupSearchStaff1 : function() {
    			var that = this;
    			var param = {};
    			param.instCd = that.instCd;
    			param.type = "03";
    			//param.data = that.$el.find(".staffNm-wrap").html();
    			var popupStaffIdObj = new PopupStaffId(param);
    			popupStaffIdObj.render();
    			popupStaffIdObj.on('popUpSetData', function(param) {
    				that.$el.find('.CAPMT022-detail-section [data-form-param="frstOprtnStaffId"]').val(param.staffId);
    			});
    		}
            , popupSearchStaff2 : function() {
    			var that = this;
    			var param = {};
    			param.instCd = that.instCd;
    			param.type = "03";


    			var popupStaffIdObj = new PopupStaffId(param);
    			popupStaffIdObj.render();
    			popupStaffIdObj.on('popUpSetData', function(param) {
    				that.$el.find('.CAPMT022-detail-section [data-form-param="scndryOprtnStaffId"]').val(param.staffId);
    			});
    		}




        }); // end of Backbone.View.extend({


        return CAPMT022View;
    } // end of define function
); // end of define
