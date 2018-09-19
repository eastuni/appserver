define(
    [
          'bx/common/config'
        , 'text!app/views/page/CAPMT/020/_CAPMT020.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
    ]
    , function (config
        , tpl
        , ExtGrid
        , commonInfo
        ) {


        /**
		 * Backbone
		 */
        var CAPMT020View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container CAPMT020-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }
            // 이벤트 설정
            , events: {
                  'click #btn-base-section-reset'		: 'resetBase'
                , 'click #btn-base-section-inquiry'		: 'query'
                , 'click #btn-base-section-toggle': 'fn_base_toggle'
                , 'click #btn-grid-section-toggle': 'fn_grid_toggle'
            }


            /**
			 * initialize
			 */
            , initialize: function (initData) {
                var that = this;
                that.isModify=false;
                that.pgNbr = 1;
                that.pgCnt = 20;
                that.totalcnt = 0;


                $.extend(that, initData);


                that.$el.html(that.tpl());


                var sParam1 = {cdNbr:"A0217"}; // 배치컴포넌트코드
                var sParam2 = {cdNbr:"30008"}; // 배치작업유형코드


                bxProxy.all([{
                        // 배치컴포넌트코드
                        url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam1}), success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                comboStore1 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                	},{// 배치작업유형코드
	                    url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam2}), success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            comboStore2 = new Ext.data.Store({
	                                fields: ['cd', 'cdNm'],
	                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
	                            });
	                        }
	                    }


		            }]
                    , {
                        success: function () {


                            that.CAPMT020Grid = new ExtGrid({
                                // 그리드 컬럼 정의
                                fields: ['batchJobId', 'batchJobNm',  'batchJobTpCd','batchAplctnNm'  ]
                                , id: 'CAPMT020Grid'
                                , columns: [ {
                                        text: bxMsg('cbb_items.AT#batchJobId')
                                        , flex: 7
                                        , height : 25
                                        , dataIndex: 'batchJobId'
                                        , style: 'text-align:center'
                                        , align: 'left'
                                    }
	                        		, {
                                        text: bxMsg('cbb_items.AT#batchJobNm')
                                        , flex: 7
                                        , dataIndex: 'batchJobNm'
                                        , style: 'text-align:center'
                                        , align: 'left'


                                    }


                                    , {
                                        text: bxMsg('cbb_items.AT#batchJobTpCd')
                                        , flex: 3
                                        , dataIndex: 'batchJobTpCd'
                                        , style: 'text-align:center'
                                       	, align: 'center'
                                        , renderer: function (val) {
                                        	index = comboStore2.findExact('cd', val);
                                        	if (index != -1) {
                                        		rs = comboStore2.getAt(index).data;
                                                return rs.cdNm;
                                            }
                                        }
                                    }
                                    ,  {
                                        text: bxMsg('cbb_items.AT#batchAplctnNm')
                                        , flex: 3
                                        , dataIndex: 'batchAplctnNm'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                        , renderer: function (val) {
                                            index = comboStore1.findExact('cd', val);
                                            if (index != -1) {
                                                rs = comboStore1.getAt(index).data;
                                                return rs.cdNm;
                                             }
                                         }
                                    }


                                ] // end of columns


                                , listeners: {
                                    viewready: function(grid, eOpts)
                                    {
                                        grid.view.getEl().on('scroll', function(event, target)
                                        {
                                            var viewEndPosition = target.scrollHeight - target.offsetHeight;
                                            if ((viewEndPosition > 0) && (viewEndPosition <= target.scrollTop))
                                            {
                                               that.queryNext();
                                            }
                                        });
                                    }
                                    , dblclick: {
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
                fn_getCodeList({className:"CAPMT020-batchAplctnNm-wrap",targetId:"batchAplctnNm",nullYn:"Y",cdNbr:"A0217",allNm:bxMsg("cbb_items.SCRNITM#all")}, this);


                // 배치작업유형 코드
                fn_getCodeList({className:"CAPMT020-batchJobTpCd-wrap",targetId:"batchJobTpCd",nullYn:"Y",cdNbr:"30008",allNm:bxMsg("cbb_items.SCRNITM#all")}, this);


                this.setBaseData(this, "", "X");


                return this.$el;
            }


            /**
			 * 기본부 초기화
			 */
            , setBaseData: function (that, responseData, type) {
                that = this;


                if (type == "X") {
                    that.$el.find('.CAPMT020-base-section [data-form-param="batchJobId"]').val("");
                    that.$el.find('.CAPMT020-base-section [data-form-param="batchJobNm"]').val("");
                    that.$el.find('.CAPMT020-base-section [data-form-param="batchAplctnNm"]').val("");
                    that.$el.find('.CAPMT020-base-section [data-form-param="batchJobTpCd"]').val("");


                }
            }


            /**
			 * 기본부 리셋
			 */
            , resetBase: function () {
            	that = this;
            	that.$el.find('.CAPMT020-base-section [data-form-param="batchJobId"]').val("");
                that.$el.find('.CAPMT020-base-section [data-form-param="batchJobNm"]').val("");
                that.$el.find('.CAPMT020-base-section [data-form-param="batchAplctnNm"]').val("");
                that.$el.find('.CAPMT020-base-section [data-form-param="batchJobTpCd"]').val("");


                that.CAPMT020Grid.resetData();
            }


            /**
			 * 기본부 조회 버튼 클릭
			 */
            , query: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm($('.CAPMT020-base-section'));
                that.pgNbr=1;
                that.totalCnt=0;
                that.inquiryBaseData(sParam);
            }


            /**
             * 다음 조회
             */
            , queryNext: function () {
                var that = this;


                if (that.totalCnt > 0) return;


                var sParam = bxUtil.makeParamFromForm($('.CAPMT020-base-section'));
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
                sParam.pgNbr = that.pgNbr;
                sParam.pgCnt = that.pgCnt;


                var linkData = {"header": fn_getHeader("PMT0208402"), "BatchJobMgntSvcIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {


                        	var tbList = responseData.BatchJobMgntSvcListOut.outList;


                            if (tbList != null && tbList.length > 0) {
                                if (sParam.pgNbr == 1) {
                                    // 조회
                                    that.CAPMT020Grid.setData(tbList);
                                    that.rsltCnt=tbList.length;
                                } else {
                                    // 다음 조회
                                    that.CAPMT020Grid.addData(tbList);
                                    that.rsltCnt=that.rsltCnt+tbList.length;
                                }
                                that.$('#rsltCnt').html(that.rsltCnt);
                            }else{
                                if (sParam.pgNbr == 1)
                                {
                                    that.CAPMT020Grid.resetData();
                                    that.$('#rsltCnt').html('0');
                                }
                                else
                                {
                                    that.totalCnt = that.rsltCnt;
                                }
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
                this.$el.find(".CAPMT020-grid-section").html(this.CAPMT020Grid.render({'height': '450px'}));
            } // end of createGrid


            /**
			 * 그리드 행 더블클릭
			 */
            , doubleiClickGrid: function () {
                var that = this;
                var selectedRecord = that.CAPMT020Grid.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                    return;
                } else {
                	that.$el.trigger({
                        type: 'open-conts-page'
                    , pageHandler: 'CAPMT021'
                    , pageDPName: bxMsg('cbb_items.SCRN#CAPMT021')
                    , pageInitialize: true
                    , pageRenderInfo: {
                    	batchJobId: selectedRecord.data.batchJobId
                    	}
                    });
                }


            }


            , fn_base_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT020-base-section"), this.$el.find("#btn-base-section-toggle"));
            }


            , fn_grid_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT020-grid-section"), this.$el.find("#btn-grid-section-toggle"));
            }




        }); // end of Backbone.View.extend


        return CAPMT020View;
    } // end of define function
); // end of define
