define(
    [
          'bx/common/config'
        , 'text!app/views/page/CAPMT/083/_CAPMT083.html'
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
        var CAPMT083View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container CAPMT083-page'
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
                that.instCd=commonInfo.getInstInfo().instCd; //기관코드


                $.extend(that, initData);
                // 페이지 핸들바 설정 : 메뉴의 메인 페이지에 설정해야 함 (_.js파일)
                that.$el.attr('data-page', that.pageHandler);
                that.$el.html(that.tpl());


                bxProxy.all([
                     {// 로그레벨 로딩
                        url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": {cdNbr:"A0124"}}), success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                that.comboStore1 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                     },
                     {// 센터컷 로그 유형 코드 로딩
                         url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": {cdNbr:"A0475"}}), success: function (responseData) {
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
                            that.CAPMT083Grid = new ExtGrid({
                                // 그리드 컬럼 정의
                                fields: ['jobId', 'prcsngDt', 'rcptNbr','atmptCnt', 'lastChngTmstmp','logLvlCd','cntrCtLogTpCd','logCntnt']
                                , id: 'CAPMT083Grid'
                                , columns: [
                                    {
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
                                        text: bxMsg('cbb_items.AT#atmptCnt')
                                        , flex: 1
                                        , dataIndex: 'atmptCnt'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.SCRNITM#logCreationTime')
                                        , flex: 4
                                        , dataIndex: 'lastChngTmstmp'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#logLvlCd')
                                        , flex: 3
                                        , dataIndex: 'logLvlCd'
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
                                        text: bxMsg('cbb_items.AT#cntrCtLogTpCd')
                                        , flex: 3
                                        , dataIndex: 'cntrCtLogTpCd'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                        , renderer: function (val)
                                        {
                                            index = that.comboStore2.findExact('cd', val);
                                            if (index != -1) {
                                                rs = that.comboStore2.getAt(index).data;
                                                return rs.cdNm;
                                            }
                                        }
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#logCntnt')
                                        , flex: 10
                                        , dataIndex: 'logCntnt'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    }
                                  ]// end of columns
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
                // 로그레벨 코드
                fn_getCodeList({className:"CAPMT083-logLvlCd-wrap",targetId:"logLvlCd",nullYn:"Y",cdNbr:"A0124",allNm:bxMsg("cbb_items.SCRNITM#all")}, this);


                this.resetBase();




                return this.$el;
            }


            /**
             * 기본부 리셋
             */
            , resetBase: function () {
                that = this;
                that.$el.find('.CAPMT083-base-section [data-form-param="jobId"]').val("");
                that.$el.find('.CAPMT083-base-section [data-form-param="prcsngDt"]').val(getCurrentDate("yyyy-mm-dd"));
                that.$el.find('.CAPMT083-base-section [data-form-param="rcptNbr"]').val("");
                that.$el.find('.CAPMT083-base-section [data-form-param="atmptCnt"]').val("");
                that.$el.find('.CAPMT083-base-section [data-form-param="logLvlCd"]').val("");
                if(that.CAPMT083Grid)
                {
                    that.CAPMT083Grid.resetData();
                }
            }
            /**
             * 다음 조회
             */
            , next: function () {
               // PMT0838401 service is not support paging
            }
            /**
             * 기본부 조회 버튼 클릭
             */
            , query: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm(that.$el.find('.CAPMT083-base-section'));
                if (commonInfo.getInstInfo().instCd) {
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                } else {
                    fn_alertMessage("", bxMsg("cbb_items.SCRNITM#instSearchMsg"));
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
                var linkData = {"header": fn_getHeader("PMT0838401"), "inputDto": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var data;
                            for (var name in responseData) {
                                if(name!="header") data=responseData[name];
                            }
                            var tbList = data.list;
                            if (tbList != null && tbList.length > 0) {
                                that.CAPMT083Grid.setData(tbList);
                                that.$el.find('#rsltCnt').html(tbList.length);
                            }
                            else
                            {
                                that.CAPMT083Grid.resetData();
                                that.$el.find('#rsltCnt').html('0');
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
                this.$el.find(".CAPMT083-grid-section").html(this.CAPMT083Grid.render({'height': '450px'}));
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
                fn_makeDatePicker(this.$el.find('.CAPMT083-base-section [data-form-param="prcsngDt"]'));
            }


            , fn_base_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT083-base-section"), this.$el.find("#btn-base-section-toggle"));
            }


            , fn_grid_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT083-grid-section"), this.$el.find("#btn-grid-section-toggle"));
            }


        }); // end of Backbone.View.extend({


        return CAPMT083View;
    } // end of define function
); // end of define
