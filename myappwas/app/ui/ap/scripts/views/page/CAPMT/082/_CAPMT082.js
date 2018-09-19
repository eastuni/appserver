define(
    [
          'bx/common/config'
        , 'text!app/views/page/CAPMT/082/_CAPMT082.html'
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
        var CAPMT082View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container CAPMT082-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }
            // 이벤트 설정
            , events: {
                  'click #btn-base-section-reset'   : 'resetBase'
                , 'click #btn-base-section-inquiry' : 'query'
                , 'click #btn-popup-jobId'          : 'popupJobId'
                , 'click #btn-base-section-toggle'  : 'fn_base_toggle'
                , 'click #btn-grid-section-toggle'  : 'fn_grid_toggle'
            }


            /**
             * initialize
             */
            , initialize: function (initData) {
                var that = this;
                that.pgNbr = 1;
                that.pgCnt = 100;
                that.totalcnt = 0;
                that.instCd=commonInfo.getInstInfo().instCd; //기관코드


                $.extend(that, initData);
                // 페이지 핸들바 설정 : 메뉴의 메인 페이지에 설정해야 함 (_.js파일)
                that.$el.attr('data-page', that.pageHandler);
                that.$el.html(that.tpl());


                bxProxy.all([
                     {// 처리상태 로딩
                        url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": {cdNbr:"A0401"}}), success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                that.comboStore1 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                     }
                    ]
                    , {
                        success: function () {
                            that.CAPMT082Grid = new ExtGrid({
                                 fields: ['jobId', 'prcsngDt', 'rcptNbr','txSeqNbr','atmptCnt', 'exctnNbr','cntrCtPrcsngStsCd','prcsngAmt']
                                , id: 'CAPMT082Grid'
                                , columns: [{
                                    text: 'No'
                                    , dataIndex: 'rowIndex'
                                    , sortable: false
                                    , flex: 1
                                    , height : 25
                                    , style: 'text-align:center'
                                    , align: 'center'
                                    // other config you need....
                                    , renderer: function (value, metaData, record, rowIndex, colIndex, sotre) {
                                        return rowIndex + 1;
                                        }
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#jobId')
                                        , flex: 3
                                        , dataIndex: 'jobId'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#prcsngDt')
                                        , flex: 3
                                        , dataIndex: 'prcsngDt'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#rcptNbr')
                                        , flex: 1
                                        , dataIndex: 'rcptNbr'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#txSeqNbr')
                                        , flex: 3
                                        , dataIndex: 'txSeqNbr'
                                        , style: 'text-align:center'
                                        , align: 'right'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#atmptCnt')
                                        , flex: 1
                                        , dataIndex: 'atmptCnt'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#exctnNbr')
                                        , flex: 1
                                        , dataIndex: 'exctnNbr'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#cntrCtPrcsngStsCd')
                                        , flex: 3
                                        , dataIndex: 'cntrCtPrcsngStsCd'
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
                                        text: bxMsg('cbb_items.AT#prcsngAmt')
                                        , flex: 3
                                        , dataIndex: 'prcsngAmt'
                                        , style: 'text-align:center'
                                        , align: 'center'


                                    }
                                    ] // end of columns
                                , listeners:
                                {
                                    viewready: function(grid, eOpts)
                                    {
                                        grid.view.getEl().on('scroll', function(event, target)
                                        {
                                            var viewEndPosition = target.scrollHeight - target.offsetHeight;
                                            if ((viewEndPosition > 0) && (viewEndPosition <= target.scrollTop))
                                            {
                                               that.next();
                                            }
                                        });
                                    }
                                }
                            });
                            that.createGrid();// 단일탭 그리드 렌더
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
                // 컴포넌트 코드
                fn_getCodeList({className:"CAPMT082-cntrCtPrcsngStsCd-wrap",targetId:"cntrCtPrcsngStsCd",nullYn:"Y",cdNbr:"A0401",allNm:bxMsg("cbb_items.SCRNITM#all")}, this);


                this.resetBase();


                return this.$el;
            }


            /**
             * 기본부 리셋
             */
            , resetBase: function () {
                that = this;
                that.$el.find('.CAPMT082-base-section [data-form-param="jobId"]').val("");
                that.$el.find('.CAPMT082-base-section [data-form-param="prcsngDt"]').val(getCurrentDate("yyyy-mm-dd"));
                that.$el.find('.CAPMT082-base-section [data-form-param="cntrCtPrcsngStsCd"]').val("");
                that.$el.find('.CAPMT082-base-section [data-form-param="rcptNbr"]').val("");
                that.$el.find('.CAPMT082-base-section [data-form-param="atmptCnt"]').val("");
                if(that.CAPMT082Grid)
                {
                    that.CAPMT082Grid.resetData();
                }
            }


            /**
             * 기본부 조회 버튼 클릭
             */
            , query: function () {
                var that = this, isValid=true;
                that.pgNbr=1;
                that.totalCnt=0;
                that.sParam = bxUtil.makeParamFromForm(that.$el.find('.CAPMT082-base-section'));
                if(fn_isEmpty(that.sParam.jobId))
                {
                    that.$el.find('.CAPMT082-base-section [data-form-param="jobId"]').focus();
                    isValid = false;
                }
                else if(fn_isEmpty(that.sParam.prcsngDt))
                {
                    that.$el.find('.CAPMT082-base-section [data-form-param="prcsngDt"]').focus();
                    isValid = false;
                }
                if(!isValid)
                {
                    fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004"));
                    return isValid;
                }
                if (commonInfo.getInstInfo().instCd) {
                    that.sParam.instCd = commonInfo.getInstInfo().instCd;
                } else {
                    fn_alertMessage("", bxMsg("cbb_items.SCRNITM#instSearchMsg"));
                    return;
                }
                that.sParam.prcsngDt = that.sParam.prcsngDt.replace(/-/gi,"");
                that.inquiryBaseData();
            }
            /**
             * 다음 조회
             */
            , next: function () {
                var that = this;


                if (that.totalCnt > 0) return;


                that.pgNbr++;
                that.inquiryBaseData();
            }
            /**
             * 기본부 정보로 그리드 조회
             */
            , inquiryBaseData: function () {
                // header 정보 set
                var that = this;
                that.sParam.pgNbr = that.pgNbr;
                that.sParam.pgCnt = that.pgCnt;
                var linkData = {"header": fn_getHeader("PMT0828401"), "inputDto": that.sParam};


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
                            if (tbList != null && tbList.length > 0)
                            {
                                 // 조회
                                 if (that.sParam.pgNbr == 1) {
                                    // 조회
                                    that.CAPMT082Grid.setData(tbList);
                                    that.rsltCnt=tbList.length;
                                 } else {
                                    // 다음 조회
                                    that.CAPMT082Grid.addData(tbList);
                                    that.rsltCnt=that.rsltCnt+tbList.length;
                                 }
                                 that.$el.find('#rsltCnt').html(that.rsltCnt);
                            }else{
                                if (that.sParam.pgNbr == 1)
                                {
                                    that.CAPMT082Grid.resetData();
                                    that.$el.find('#rsltCnt').html('0');
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
                this.$el.find(".CAPMT082-grid-section").html(this.CAPMT082Grid.render({'height': '450px'}));
            } // end of createGrid
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
                fn_makeDatePicker(this.$el.find('.CAPMT082-base-section [data-form-param="prcsngDt"]'));
            }//end of loadDatePicker


            , fn_base_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT082-base-section"), this.$el.find("#btn-base-section-toggle"));
            }


            , fn_grid_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT082-grid-section"), this.$el.find("#btn-grid-section-toggle"));
            }


        }); // end of Backbone.View.extend({


        return CAPMT082View;
    } // end of define function
); // end of define
