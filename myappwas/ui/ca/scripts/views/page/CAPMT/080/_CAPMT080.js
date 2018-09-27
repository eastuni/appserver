define(
    [
          'bx/common/config'
        , 'text!app/views/page/CAPMT/080/_CAPMT080.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-info'
        , 'app/views/page/popup/CAPMT/popup-centercutJobId'
    ]
    , function (config
        , tpl
        , ExtGrid
        , commonInfo
        , PopupCentercutJobId
        ) {


        /**
         * Backbone
         */
        var CAPMT080View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container CAPMT080-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }
            // 이벤트 설정
            , events: {
                  'click #btn-base-section-reset'   : 'resetBase'
                , 'click #btn-base-section-inquiry' : 'query'
                , 'click #btn-popup-jobId'          : 'popupJobId'
                , 'click #btn-detail-section-stop'  : 'stopAll'
                , 'click #btn-detail-section-start' : 'startAll'
                , 'click #btn-detail-section-kill'  : 'ForcedEnd'
                , 'click #btn-detail-section-del'   : 'deleteJob'
                , 'click #btn-detail-section-change': 'changeStatus'
                , 'click #btn-detail-section-run'   : 'runJob'
                , 'click #btn-detail-section-rerun' : 'reRunJob'
                , 'click #btn-base-section-toggle'  : 'fn_base_toggle'
                , 'click #btn-grid-section-toggle'  : 'fn_grid_toggle'
                , 'click #btn-detail-section-toggle': 'fn_detail_toggle'
            }


            /**
             * initialize
             */
            , initialize: function (initData) {
                var that = this;


                $.extend(that, initData);
                // 페이지 핸들바 설정 : 메뉴의 메인 페이지에 설정해야 함 (_.js파일)
                that.$el.attr('data-page', that.pageHandler);
                if (commonInfo.getInstInfo().instCd) {
                    that.instCd = commonInfo.getInstInfo().instCd;
                } else {
                    fn_alertMessage("", bxMsg("cbb_items.SCRNITM#instSearchMsg"));
                    return;
                }
                that.$el.html(that.tpl());


                bxProxy.all(
                [
                    {// 컴포넌트코드콤보 로딩
                        url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": {cdNbr:"11603"}}), success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                that.comboStore1 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }
                    , {// 처리상태 로딩
                        url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": {cdNbr:"A0401"}}), success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                that.comboStore2 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }
                ]
                , {
                    success: function () {
                        that.CAPMT080Grid = new ExtGrid({
                            // 그리드 컬럼 정의
                            //식별자, 처리일자, 접수 번호, 시도횟수, 처리상태 대상총건수
                            //대상금액, 정상처리건수, 정상처리금액, 오류처리건수, 오류처리금액
                            //작업명, 최종처리번호, 최초시작일시, 재시작일시, 종료일시
                            fields: ['cmpntCd', 'jobId', 'prcsngDt', 'rcptNbr', 'atmptCnt', 'cntrCtPrcsngStsCd', 'totTrgtCnt', 'totTrgtAmt', 'nrmlPrcsngCnt', 'nrmlPrcsngAmt', 'errPrcsngCnt', 'errPrcsngAmt'
                                ,'jobNm','lastPrcsngNbr','frstStartTmstmp','restartTmstmp', 'endTmstmp']
                            , id: 'CAPMT080Grid'
                            , columns:
                            [
                                {
                                    text: 'No'
                                    , dataIndex: 'rowIndex'
                                    , sortable: false
                                    , flex: 2
                                    , height: 25
                                    , style: 'text-align:center'
                                    , align: 'center'
                                    // other config you need....
                                    , renderer: function (value, metaData, record, rowIndex, colIndex, sotre) {
                                        return rowIndex + 1;
                                    }
                                }
                                , {
                                    text: bxMsg('cbb_items.AT#cmpntCd')
                                    , flex: 3
                                    , dataIndex: 'cmpntCd'
                                    , style: 'text-align:center'
                                    , align: 'center'
                                    , renderer: function (val) {
                                        index = that.comboStore1.findExact('cd', val);
                                        if (index != -1) {
                                            rs = that.comboStore1.getAt(index).data;
                                            return rs.cdNm;
                                        }
                                    }
                                }
                                , {
                                    text: bxMsg('cbb_items.AT#jobId')
                                    , flex: 4
                                    , dataIndex: 'jobId'
                                    , style: 'text-align:center'
                                    , align: 'center'
                                }
                                , {
                                    text: bxMsg('cbb_items.AT#jobNm')
                                    , flex: 4
                                    , dataIndex: 'jobNm'
                                    , hidden: true
                                }
                                , {
                                    text: bxMsg('cbb_items.AT#prcsngDt')
                                    , flex: 4
                                    , dataIndex: 'prcsngDt'
                                    , style: 'text-align:center'
                                    , align: 'center'
                                }
                                , {
                                    text: bxMsg('cbb_items.AT#rcptNbr')
                                    , flex: 4
                                    , dataIndex: 'rcptNbr'
                                    , style: 'text-align:center'
                                    , align: 'center'
                                }
                                , {
                                    text: bxMsg('cbb_items.AT#atmptCnt')
                                    , flex: 4
                                    , dataIndex: 'atmptCnt'
                                    , style: 'text-align:center'
                                    , align: 'center'
                                }
                                , {
                                    text: bxMsg('cbb_items.AT#cntrCtPrcsngStsCd')
                                    , flex: 4
                                    , dataIndex: 'cntrCtPrcsngStsCd'
                                    , style: 'text-align:center'
                                    , align: 'center'
                                    , renderer: function (val) {
                                        index = that.comboStore2.findExact('cd', val);
                                        if (index != -1) {
                                            rs = that.comboStore2.getAt(index).data;
                                            return rs.cdNm;
                                        }
                                    }
                                }
                                , {
                                    text: bxMsg('cbb_items.AT#lastPrcsngNbr')
                                    , flex: 4
                                    , dataIndex: 'lastPrcsngNbr'
                                    , hidden: true
                                }
                                , {
                                    text: bxMsg('cbb_items.AT#frstStartTmstmp')
                                    , flex: 4
                                    , dataIndex: 'frstStartTmstmp'
                                    , hidden: true
                                }
                                , {
                                    text: bxMsg('cbb_items.AT#restartTmstmp')
                                    , flex: 4
                                    , dataIndex: 'restartTmstmp'
                                    , hidden: true
                                }
                                , {
                                    text: bxMsg('cbb_items.AT#endTmstmp')
                                    , flex: 4
                                    , dataIndex: 'endTmstmp'
                                    , hidden: true
                                }
                                , {
                                    text: bxMsg('cbb_items.AT#totTrgtCnt')
                                    , flex: 4
                                    , dataIndex: 'totTrgtCnt'
                                    , style: 'text-align:center'
                                    , align: 'center'


                                }
                                , {
                                    text: bxMsg('cbb_items.AT#totTrgtAmt')
                                    , flex: 4
                                    , dataIndex: 'totTrgtAmt'
                                    , style: 'text-align:center'
                                    , align: 'center'


                                }
                                , {
                                    text: bxMsg('cbb_items.AT#nrmlPrcsngCnt')
                                    , flex: 4
                                    , dataIndex: 'nrmlPrcsngCnt'
                                    , style: 'text-align:center'
                                    , align: 'center'


                                }
                                , {
                                    text: bxMsg('cbb_items.AT#nrmlPrcsngAmt')
                                    , flex: 4
                                    , dataIndex: 'nrmlPrcsngAmt'
                                    , style: 'text-align:center'
                                    , align: 'center'


                                }
                                , {
                                    text: bxMsg('cbb_items.AT#errPrcsngCnt')
                                    , flex: 4
                                    , dataIndex: 'errPrcsngCnt'
                                    , style: 'text-align:center'
                                    , align: 'center'


                                }
                            ] // end of columns
                            , listeners: {
                                click: {
                                    element: 'body'
                                    , fn: function () {
                                        // -더블클릭시 이벤트 발생-
                                        // 2016.12.06 UI 3.0 액션표준 변경(클릭시 처리)
                                        that.clickGrid();
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
                fn_getCodeList({className:"CAPMT080-cntrCtPrcsngStsCd-wrap", nullYn:"N",cdNbr:"A0401", disabled:true}, this);


                this.resetBase();
                this.resetDetail();
                return this.$el;
            }


            /**
             * 기본부 리셋
             */
            , resetBase: function () {
                var that = this;


                that.$el.find('.CAPMT080-base-section [data-form-param="jobId"]').val("");
                that.$el.find('.CAPMT080-base-section [data-form-param="prcsngDt"]').val(getCurrentDate("yyyy-mm-dd"));
                that.$el.find('.CAPMT080-base-section [data-form-param="rcptNbr"]').val("");
                that.$el.find('.CAPMT080-base-section [data-form-param="atmptCnt"]').val("");


                if(that.CAPMT080Grid)
                {
                    that.CAPMT080Grid.resetData();
                    that.$el.find('#rsltCnt').html('0');
                }


            }


            /**
             * 기본부 조회 버튼 클릭
             */
            , query: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm(that.$el.find('.CAPMT080-base-section'));
                if (commonInfo.getInstInfo().instCd) {
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                } else {
                    fn_alertMessage("", bxMsg("'cbb_items.SCRNITM#instSearchMsg"));
                    return;
                }
                sParam.prcsngDt = sParam.prcsngDt.replace(/-/gi,"");
                that.inquiryBaseData(sParam);
            }




            /**
             * 기본부 정보로 그리드 조회
             */
            , inquiryBaseData: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;
                var linkData = {"header": fn_getHeader("PMT0808402"), "inputDto": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var data;
                            for (var name in responseData) {
                                if(name!="header") data=responseData[name];
                            }
                            that.dto = data;
                            var tbList = data.list;
                            if (tbList != null || tbList.length > 0) {
                                // 조회
                                that.CAPMT080Grid.setData(tbList);
                            }else{
                                that.CAPMT080Grid.grid.getEl().down('.x-grid-view').scroll('bottom', 100, true);
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            } // end


            /**
             * 상세부 정보 reset.
             */
            , resetDetail: function (param) {
                var that = this;


                that.detailDto= {};
                that.setDetailData();


            } // end
            /**
             * 그리드 생성
             */
            , createGrid: function () {
                var that = this;
                this.$el.find(".CAPMT080-grid-section").html(this.CAPMT080Grid.render({'height': '300px'}));
            } // end of createGrid


            /**
             * 그리드 행 더블클릭
             */
            , clickGrid: function () {
                var that = this;
                var selectedRecord = that.CAPMT080Grid.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                    return;
                } else {
                    that.detailDto = selectedRecord.data;
                    that.setDetailData();
                }


            }
            /**
             * RUN
             */
            , runJob: function () {
                var that = this;
                var dto =that.detailDto;
                if(!dto.jobId){
                    fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0014"));
                    return false;
                }
                var sParam = {};
                sParam.instCd=that.instCd;
                sParam.jobId=dto.jobId;
                sParam.prcsngDt=dto.prcsngDt;
                sParam.rcptNbr=dto.rcptNbr;
                sParam.atmptCnt=dto.atmptCnt;


                var linkData = {"header": fn_getHeader("PMT0808506"), "inputDto": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {


                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            }
            /**
             * RUN
             */
            , reRunJob: function () {
                var that = this;
                var dto =that.detailDto;
                if(!dto.jobId){
                    fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0014"));
                    return false;
                }
                var sParam = {};
                sParam.instCd=that.instCd;
                sParam.jobId=dto.jobId;
                sParam.prcsngDt=dto.prcsngDt;
                sParam.rcptNbr=dto.rcptNbr;
                sParam.atmptCnt=dto.atmptCnt;


                var linkData = {"header": fn_getHeader("PMT0808507"), "inputDto": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {


                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            }
            /**
             * set 상세부 정보.
             */
            , setDetailData: function () {
                var that = this;
                var dto = that.detailDto;
//              <!-- 센터컷 ID -->
                that.$el.find('.CAPMT080-detail-section [data-form-param="jobId"]').val(dto.jobId);
//              <!-- 센터컷 명 -->
                that.$el.find('.CAPMT080-detail-section [data-form-param="jobNm"]').val(dto.jobNm);
//              <!-- 센터컷  설명-->
                that.$el.find('.CAPMT080-detail-section [data-form-param="jobDescCntnt"]').val(dto.jobDescCntnt);
//              <!-- 처리일자 -->
                that.$el.find('.CAPMT080-detail-section [data-form-param="prcsngDt"]').val(dto.prcsngDt);
//              <!-- 접수번호-->
                that.$el.find('.CAPMT080-detail-section [data-form-param="rcptNbr"]').val(dto.rcptNbr);
//              <!-- 시도횟수-->
                that.$el.find('.CAPMT080-detail-section [data-form-param="atmptCnt"]').val(dto.atmptCnt);
//              <!-- 처리상태 -->
                that.$el.find('.CAPMT080-detail-section [data-form-param="cntrCtPrcsngStsCd"]').val(dto.cntrCtPrcsngStsCd);
//              <!-- 최종처리번호 -->
                that.$el.find('.CAPMT080-detail-section [data-form-param="lastPrcsngNbr"]').val(dto.lastPrcsngNbr);
//              <!-- 최초시작시간 -->
                that.$el.find('.CAPMT080-detail-section [data-form-param="frstStartTmstmp"]').val(dto.frstStartTmstmp);
//              <!-- 재시작시간 -->
                that.$el.find('.CAPMT080-detail-section [data-form-param="restartTmstmp"]').val(dto.restartTmstmp);
//              <!-- 작업대상총건수 -->
                that.$el.find('.CAPMT080-detail-section [data-form-param="endTmstmp"]').val(dto.endTmstmp);
//              <!-- 정상처리건수 -->
                that.$el.find('.CAPMT080-detail-section [data-form-param="totTrgtCnt"]').val(dto.totTrgtCnt);
//              <!-- 오류처리건수 -->
                that.$el.find('.CAPMT080-detail-section [data-form-param="nrmlPrcsngCnt"]').val(dto.nrmlPrcsngCnt);
                that.$el.find('.CAPMT080-detail-section [data-form-param="errPrcsngCnt"]').val(dto.errPrcsngCnt);
//              <!-- 작업대상총금액 -->
                that.$el.find('.CAPMT080-detail-section [data-form-param="totTrgtAmt"]').val(dto.totTrgtAmt);
//              <!-- 정상처리금액 -->
                that.$el.find('.CAPMT080-detail-section [data-form-param="nrmlPrcsngAmt"]').val(dto.nrmlPrcsngAmt);
//              <!-- 오류처리금액 -->
                that.$el.find('.CAPMT080-detail-section [data-form-param="errPrcsngAmt"]').val(dto.errPrcsngAmt);
            } // end
            /**
             *  작업식별자조회 팝업
             */
            , popupJobId: function () {


                var that = this;
                var sParam = {"instcd":that.instCd};
                var popup = new PopupCentercutJobId(sParam); // 팝업생성
                popup.render();


                popup.on('popUpSetData', function (param) {
                    that.$el.find('[data-form-param="jobId"]').val(param.jobId); //작업식별자
                });
            }
            /**
             * 데이터 피커 로드 컴포넌트 데이터 피커를 사용
             */
            , loadDatePicker: function () {
                fn_makeDatePicker(this.$el.find('.CAPMT080-base-section [data-form-param="prcsngDt"]'));
            }


            , fn_base_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT080-base-section"), this.$el.find("#btn-base-section-toggle"));
            }


            , fn_grid_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT080-grid-section"), this.$el.find("#btn-grid-section-toggle"));
            }


            , fn_detail_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT080-detail-section"), this.$el.find("#btn-detail-section-toggle"));
            }


        }); // end of Backbone.View.extend({


        return CAPMT080View;
    } // end of define function
); // end of define
