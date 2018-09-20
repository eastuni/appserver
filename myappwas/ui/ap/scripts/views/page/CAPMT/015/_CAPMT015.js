define(
    [
          'bx/common/config'
        , 'text!app/views/page/CAPMT/015/_CAPMT015.html'
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
        var CAPMT015View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container CAPMT015-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }
            // 이벤트 설정
            , events: {
                  'click #btn-base-section-reset'   : 'resetBase'
                , 'click #btn-base-section-inquiry' : 'query'
                , 'click #btn-popup-batchJobId'     : 'popupBatchJbIdSearchSrvc'
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


                var sParam1 = {cdNbr:"30009"}; // 배치작업주기코드
                var sParam2 = {cdNbr:"A0222"}; // 실행상태코드


                bxProxy.all([{
                        // 배치작업주기트코드
                        url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam1}), success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                comboStore0151 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                	}
	               , {
	                    // 실행상태코드
	                    url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam2}), success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            comboStore0152 = new Ext.data.Store({
	                                fields: ['cd', 'cdNm'],
	                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
	                            });
	                        }
	                    }
	            	}
                	]
                    , {
                        success: function () {
                            that.CAPMT015Grid = new ExtGrid({
                                // 그리드 컬럼 정의


                                fields: ['batchJobId', 'batchJobNm', 'batchJobInstncId','batchJobCyclCd', 'batchJobExctnStsCd'  ]
                                , id: 'CAPMT015Grid'
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
	                        		//배치작업인스턴스 식별자
	                        		, {
                                        text: bxMsg('cbb_items.AT#batchJobInstncId')
                                        , flex: 4
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
                                        , align: 'left'
                                        , renderer: function (val) {
                                            	index = comboStore0151.findExact('cd', val);
                                            	if (index != -1) {
                                            		rs = comboStore0151.getAt(index).data;
                                                 return rs.cdNm;
                                             }
                                         }


                                    }
	                        		//배치작업 실행상태
	                        		, {
                                        text: bxMsg('cbb_items.AT#batchJobExctnStsCd')
                                        , flex: 4
                                        , dataIndex: 'batchJobExctnStsCd'
                                        , style: 'text-align:center'
                                        , align: 'left'
                                        , renderer: function (val) {
                                            	index = comboStore0152.findExact('cd', val);
                                            	if (index != -1) {
                                            		rs = comboStore0152.getAt(index).data;
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


                // 배치컴포넌트 코드
                fn_getCodeList({className:"CAPMT015-batchAplctnNm-wrap",targetId:"batchAplctnNm",nullYn:"Y",cdNbr:"A0217",allNm:bxMsg("cbb_items.SCRNITM#all")}, this);


                this.setBaseData(this, "", "X");


                return this.$el;
            }


            /**
			 * 기본부 초기화
			 */
            , setBaseData: function (that, responseData, type) {
                that = this;


                if (type == "X") {
                    that.$el.find('.CAPMT015-base-section [data-form-param="batchJobId"]').val("");
                    that.$el.find('.CAPMT015-base-section [data-form-param="batchJobNm"]').val("");
                    that.$el.find('.CAPMT015-base-section [data-form-param="batchAplctnNm"]').val("");
                    that.$el.find('.CAPMT015-base-section [data-form-param="batchJobInstncId"]').val("");


                }
            }


            /**
			 * 기본부 리셋
			 */
            , resetBase: function () {
            	that = this;
            	that.$el.find('.CAPMT015-base-section [data-form-param="batchJobId"]').val("");
                that.$el.find('.CAPMT015-base-section [data-form-param="batchJobNm"]').val("");
                that.$el.find('.CAPMT015-base-section [data-form-param="batchAplctnNm"]').val("");
                that.$el.find('.CAPMT015-base-section [data-form-param="batchJobInstncId"]').val("");


                that.CAPMT015Grid.resetData();
            }


            /**
			 * 기본부 조회 버튼 클릭
			 */
            , query: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.CAPMT015-base-section'));
                //기관코드 존재여부 체크
                if (commonInfo.getInstInfo().instCd) {
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                } else {
                    fn_alertMessage("", bxMsg("cbb_items.SCRNITM#instSearchMsg"));
                    return;
                }


                /* 배치작업 식별자 필수 아님 - 메시지 삭제함 2015.12.2
                if(that.$el.find('[data-form-param="batchJobId"]').eq(0).val() == "") {
					alertMessage.error(bxMsg("cbb_err_msg.UICME0004") + "[" + bxMsg("cbb_items.CDVAL#A021801") + "]");
					return;
				}
                */
                that.inquiryBaseData(sParam);
            }
            /**
             * 다음 조회
             */
            , queryNext: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.CAPMT015-base-section'));
                sParam.instCd=commonInfo.getInstInfo().instCd;


                that.pgNbr++;


                that.inquiryBaseData(sParam);
            }
            /**
			 * 기본부 정보로 그리드 조회
			 */
            , inquiryBaseData: function (param) {
                // header 정보 set
                that = this;
                var sParam = param;


                var linkData = {"header": fn_getHeader("PMT0158402"), "BatchJobExctnMgntSvcIO": sParam};


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
                                    that.CAPMT015Grid.setData(tbList);
                                /*} else {
                                    // 다음 조회
                                    that.CAPMT015Grid.addData(tbList);
                                    that.CAPMT015Grid.grid.getSelectionModel().select((that.pgNbr-1) * that.pgCnt + tbList.length -1);
                                } */
                            }else{
                            	that.CAPMT015Grid.grid.getEl().down('.x-grid-view').scroll('bottom', 100, true);
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end


            /**
			 * 그리드 생성
			 */
            , createGrid: function () {
                var that = this;
                this.$el.find(".CAPMT015-grid-section").html(this.CAPMT015Grid.render({'height': '450px'}));
            } // end of createGrid


            /**
			 * 그리드 행 더블클릭
			 */


            , doubleiClickGrid: function () {


	            var that = this;
                var selectedRecord = that.CAPMT015Grid.grid.getSelectionModel().selected.items[0];


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
                    	,origin: "CAPMT024"
                    	,jobStatus: selectedRecord.data.batchJobExctnStsCd
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
                    that.$el.find('.CAPMT015-base-section [data-form-param="batchJobId"]').val(param.batchJobId); //배치작업 식별자
                    //that.$el.find('[data-form-param="batchJobNm"]').val(param.batchJobNm); 
                    //2016.2.29 임시로 막음, 배치작업등록시 다국어 등록이 안 되고 있음
                    that.$el.find('.CAPMT015-base-section [data-form-param="batchAplctnNm"]').val(param.batchAplctnNm); //배치컴포넌트코드
                });
            }


            , fn_base_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT015-base-section"), this.$el.find("#btn-base-section-toggle"));
            }


            , fn_grid_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT015-grid-section"), this.$el.find("#btn-grid-section-toggle"));
            }




        }); // end of Backbone.View.extend({


        return CAPMT015View;
    } // end of define function
); // end of define
