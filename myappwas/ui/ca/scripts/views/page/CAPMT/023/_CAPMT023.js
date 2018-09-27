define(
    [
          'bx/common/config'
        , 'text!app/views/page/CAPMT/023/_CAPMT023.html'
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
        var CAPMT023View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container CAPMT023-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }
            // 이벤트 설정
            , events: {
                  'click #btn-base-section-reset'		: 'resetBase'
                , 'click #btn-base-section-inquiry'		: 'query'
                //, 'click .CAPMT023-base-next-button'		: 'queryNext'
                , 'click #btn-grid-section-add'		: 'addNewJobInstance'
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


                var sParam1 = {cdNbr:"A0217"}; // 배치컴포넌트코드
                var sParam2 = {cdNbr:"30009"}; // 배치작업주기코드
                var sParam3 = {cdNbr:"10000"}; // 재실행가능여부


                bxProxy.all([{
                        // 배치컴포넌트코드
                        url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam1}), success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                comboStore731 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                	},{// 배치작업주기코드
	                    url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam2}), success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            comboStore732 = new Ext.data.Store({
	                                fields: ['cd', 'cdNm'],
	                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
	                            });
	                        }
	                    }
		            }
                	,{// 재실행가능여부
	                    url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam3}), success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            comboStore733 = new Ext.data.Store({
	                                fields: ['cd', 'cdNm'],
	                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
	                            });
	                        }
	                    }
		            }
                	]
                    , {
                        success: function () {
                            that.CAPMT023Grid = new ExtGrid({
                                // 그리드 컬럼 정의


                                fields: ['batchJobId', 'batchJobNm', 'batchAplctnNm', 'batchJobInstncId','batchJobCyclCd', 'reExctnAblYn'  ]
                                , id: 'CAPMT023Grid'
                                , columns: [
                                     //배치작업식별자
                                    {
                                        text: bxMsg('cbb_items.AT#batchJobId')
                                        , flex: 5
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
	                        		//배치컴포넌트코드
	                        		, {
                                        text: bxMsg('cbb_items.AT#batchAplctnNm')
                                        , flex: 4
                                        , dataIndex: 'batchAplctnNm'
                                        , style: 'text-align:center'
                                       	, align: 'center'
                                       	, renderer: function (val) {
                                            	index = comboStore731.findExact('cd', val);
                                            	if (index != -1) {
                                            		rs = comboStore731.getAt(index).data;
                                                 return rs.cdNm;
                                             }
                                         }
                                    }
	                        		//배치작업인스턴스 식별자
	                        		, {
                                        text: bxMsg('cbb_items.AT#batchJobInstncId')
                                        , flex: 6
                                        , dataIndex: 'batchJobInstncId'
                                        , style: 'text-align:center'
                                        , align: 'left'


                                    }
	                        		//배치작업주키코드
	                        		, {
                                        text: bxMsg('cbb_items.AT#batchJobCyclCd')
                                        , flex: 4
                                        , dataIndex: 'batchJobCyclCd'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                        , renderer: function (val) {
                                            	index = comboStore732.findExact('cd', val);
                                            	if (index != -1) {
                                            		rs = comboStore732.getAt(index).data;
                                                 return rs.cdNm;
                                             }
                                         }


                                    }
	                        		//배치작업 재실행가능여부
	                        		, {
                                        text: bxMsg('cbb_items.AT#reExctnAblYn')
                                        , flex: 3
                                        , dataIndex: 'reExctnAblYn'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                        , renderer: function (val) {
                                            	index = comboStore733.findExact('cd', val);
                                            	if (index != -1) {
                                            		rs = comboStore733.getAt(index).data;
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


                // 콤보데이터 로딩


                // 배치컴포넌트 코드
                fn_getCodeList({className:"CAPMT023-batchAplctnNm-wrap",targetId:"batchAplctnNm",nullYn:"Y",cdNbr:"A0217",allNm:bxMsg("cbb_items.SCRNITM#all")}, this);


                // 배치작업유형 코드
                fn_getCodeList({className:"CAPMT023-batchJobCyclCd-wrap",targetId:"batchJobCyclCd",nullYn:"Y",cdNbr:"30009",allNm:bxMsg("cbb_items.SCRNITM#all")}, this);


                that.$el.find('.CAPMT023-base-section [data-form-param="batchJobInstncId"]').prop("size","10");


                this.setBaseData(this, "", "X");


                return this.$el;
            }


            /**
			 * 기본부 초기화
			 */
            , setBaseData: function (that, responseData, type) {
                that = this;


                if (type == "X") {
                    that.$el.find('.CAPMT023-base-section [data-form-param="batchJobId"]').val("");
                    that.$el.find('.CAPMT023-base-section [data-form-param="batchJobNm"]').val("");
                    that.$el.find('.CAPMT023-base-section [data-form-param="batchAplctnNm"]').val("");
                    that.$el.find('.CAPMT023-base-section [data-form-param="batchJobInstncId"]').val("");
                    that.$el.find('.CAPMT023-base-section [data-form-param="batchJobCyclCd"]').val("");


                }
            }


            /**
			 * 기본부 리셋
			 */
            , resetBase: function () {
            	that = this;
            	that.$el.find('.CAPMT023-base-section [data-form-param="batchJobId"]').val("");
                that.$el.find('.CAPMT023-base-section [data-form-param="batchJobNm"]').val("");
                that.$el.find('.CAPMT023-base-section [data-form-param="batchAplctnNm"]').val("");
                that.$el.find('.CAPMT023-base-section [data-form-param="batchJobInstncId"]').val("");
                that.$el.find('.CAPMT023-base-section [data-form-param="batchJobCyclCd"]').val("");


                that.CAPMT023Grid.resetData();
            }


            /**
			 * 기본부 조회 버튼 클릭
			 */
            , query: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.CAPMT023-base-section'));
                //기관코드 존재여부 체크
                if (commonInfo.getInstInfo().instCd) {
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                } else {
                    alertMessage.info(bxMsg('cbb_items.SCRNITM#instSearchMsg'));


                    return;
                }


                that.inquiryBaseData(sParam);
            }
            /**
             * 다음 조회
             */
            , queryNext: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.CAPMT023-base-section'));
                sParam.instCd=commonInfo.getInstInfo().instCd;


                that.pgNbr++;


                that.inquiryBaseData(sParam);
            }
            /**
			 * 기본부 정보로 그리드 조회
			 */
            , inquiryBaseData: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;
              //  sParam.pgNbr = that.pgNbr;
              //  sParam.pgCnt = that.pgCnt;


                var linkData = {"header": fn_getHeader("PMT0238402"), "InstBatchJobMgntSvcIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var tbList;
                            if(responseData.InstBatchJobInstncSvcListOut.outList) {
                            	tbList=responseData.InstBatchJobInstncSvcListOut.outList;
                            };
                            if (tbList != null || tbList.length > 0) {
                                //if (sParam.pgNbr == 1) {
                                    // 조회
                                    that.CAPMT023Grid.setData(tbList);
                                /*} else {
                                    // 다음 조회
                                    that.CAPMT023Grid.addData(tbList);
                                    that.CAPMT023Grid.grid.getSelectionModel().select((that.pgNbr-1) * that.pgCnt + tbList.length -1);
                                } */
                                that.$('#rsltCnt').html(tbList.length);
                            }else{
                            	that.CAPMT023Grid.grid.getEl().down('.x-grid-view').scroll('bottom', 100, true);
                                that.$('#rsltCnt').html('0');
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end
            /**
			 * 데이터 피커 로드 컴포넌트 데이터 피커를 사용
			 */
            , loadDatePicker: function () {
            }
            /**
			 * 그리드 생성
			 */
            , createGrid: function () {
                var that = this;
                this.$el.find(".CAPMT023-grid-section").html(this.CAPMT023Grid.render({'height': '450px'}));
            } // end of createGrid


            /**
			 * 그리드 행 더블클릭
			 */


            , doubleiClickGrid: function () {


	            var that = this;
                var selectedRecord = that.CAPMT023Grid.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                    return;
                } else {
                	that.$el.trigger({
                        type: 'open-conts-page'
                    , pageHandler: 'CAPMT024'
                    , pageDPName: bxMsg('cbb_items.SCRN#CAPMT024')
                    , pageInitialize: true
                    , pageRenderInfo: {
                    	batchJobId: selectedRecord.data.batchJobId
                    	,batchJobNm: selectedRecord.data.batchJobNm
                    	,instCd:  commonInfo.getInstInfo().instCd
                    	,batchJobInstncId: selectedRecord.data.batchJobInstncId
                    	,origin: "CAPMT023"
                    	}
                    });
                }
            }


            , addNewJobInstance: function () {
	            var that = this;
                //var selectedRecord = that.CAPMT023Grid.grid.getSelectionModel().selected.items[0];


                //if (!selectedRecord) { 
                 //   return;
                //} else {


                var $batchJobId = that.$el.find('.CAPMT023-base-section [data-form-param="batchJobId"]');
                if(fn_isEmpty($batchJobId.val()))
                {
                    $batchJobId.focus();
                    fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004"));
                    return false;
                }


                	that.$el.trigger({
                        type: 'open-conts-page'
                    , pageHandler: 'CAPMT024'
                    , pageDPName: bxMsg('cbb_items.SCRN#CAPMT024')
                    , pageInitialize: true
                    , pageRenderInfo: {
                    	//2개의 값을 넘겨주어 024화면에서 조회를 실시한다.
                    	// batchJobId: selectedRecord.data.batchJobId
                    	batchJobId: $batchJobId.val()
                    	,instCd:  commonInfo.getInstInfo().instCd
                    	,origin: "CAPMT023"
                    	}
                    });
                //}


            }
            /**
             *  배치작업식별자 팝업
             */
            , popupBatchJbIdSearchSrvc: function () {
                var that = this;
                var popupBtchJb = new PopupBtchJb(); // 팝업생성


                popupBtchJb.render();
                popupBtchJb.on('popUpSetData', function (param) {
                    that.$el.find('.CAPMT023-base-section [data-form-param="batchJobId"]').val(param.batchJobId); //배치작업 식별자
                   // that.$el.find('[data-form-param="batchJobNm"]').val(param.batchJobNm); 
                    //2016.2.29 임시로 막음. 배치작업 등록시 다국어가 등록되지 않고 있음
                    that.$el.find('.CAPMT023-base-section [data-form-param="batchAplctnNm"]').val(param.batchAplctnNm); //배치작업명


                });
            }


            , fn_base_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT023-base-section"), this.$el.find("#btn-base-section-toggle"));
            }


            , fn_grid_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT023-grid-section"), this.$el.find("#btn-detail-section-toggle"));
            }


        }); // end of Backbone.View.extend({


        return CAPMT023View;
    } // end of define function
); // end of define
