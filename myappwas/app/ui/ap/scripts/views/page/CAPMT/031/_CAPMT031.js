define(
    [
          'bx/common/config'
        , 'text!app/views/page/CAPMT/031/_CAPMT031.html'
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
        var CAPMT031View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section'
            // 클래스이름 설정
            , className: 'bx-container CAPMT031-page'
            // 탬플릿 설정
            , templates: {
                'tpl': tpl
            }
            // 이벤트 설정
            , events: {
                  'click #btn-base-section-reset'   : 'resetBase'
                , 'click #btn-base-section-inquiry' : 'query'
                , 'click #btn-grid-section-save'    : 'saveDetail'
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


                var sParam1 = {cdNbr:"11603"}; // 컴포넌트코드


                bxProxy.all(
                    [
                        {// 컴포넌트코드콤보 로딩
                            url: sUrl, param: JSON.stringify({"header": fn_getHeader("CAPCM0038400"), "inputDto": sParam1}), success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                    comboStore1 = new Ext.data.Store({
                                        fields: ['cd', 'cdNm'],
                                        data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                    });
                                }
                            }
                        }
                    ]
                    , {
                        success: function () {
                            that.CAPMT031Grid = new ExtGrid({
                                // 그리드 컬럼 정의
                                fields: ['cmpntCd', 'jobId', 'jobNm', 'trgtSrvcCd','useYn', 'aplyStartDt','frstOprtnStaffId','scndryOprtnStaffId']
                                , id: 'CAPMT031Grid'
                                , columns: [{
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
                                            index = comboStore1.findExact('cd', val);
                                            if (index != -1) {
                                                rs = comboStore1.getAt(index).data;
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
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#trgtSrvcCd')
                                        , flex: 4
                                        , dataIndex: 'trgtSrvcCd'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#useYn')
                                        , flex: 3
                                        , xtype: 'checkcolumn'
                                        , dataIndex: 'useYn'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                        , stopSelection: false
                                        , listeners: {
                                            click: function (_this, cell, rowIndex, eOpts) {
                                                var currentRecord = that.CAPMT031Grid.store.getAt(rowIndex),
                                                changedChecked = !currentRecord.get('useYn');
                                                currentRecord.set('useYn', changedChecked ? 'Y' : 'N');
                                            }
                                        }
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#aplyStartDt')
                                        , flex: 4
                                        , dataIndex: 'aplyStartDt'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#frstOprtnStaffId')
                                        , flex: 4
                                        , dataIndex: 'frstOprtnStaffId'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#scndryOprtnStaffId')
                                        , flex: 4
                                        , dataIndex: 'scndryOprtnStaffId'
                                        , style: 'text-align:center'
                                        , align: 'center'
                                    }
                                ] // end of columns
                            });


                            // 단일탭 그리드 렌더
                            that.createGrid();
                        } // end of success:.function
                    }
                ); // end of bxProxy.all
            }


            /**
             * render
             */
            , render: function () {
                var that = this;


                // 콤보데이터 로딩


                // 컴포넌트 코드
                fn_getCodeList({className:"CAPMT031-cmpntCd-wrap",targetId:"cmpntCd",nullYn:"Y",cdNbr:"11603",allNm:bxMsg("cbb_items.SCRNITM#all")}, this);


                this.resetBase();


                return this.$el;
            }


            /**
             * 기본부 리셋
             */
            , resetBase: function () {
                that = this;
                that.$el.find('.CAPMT031-base-section [data-form-param="cmpntCd"]').val("");
                that.$el.find('.CAPMT031-base-section [data-form-param="jobId"]').val("");
                that.$el.find('.CAPMT031-base-section [data-form-param="trgtSrvcCd"]').val("");
                if(that.CAPMT031Grid)
                {
                    that.CAPMT031Grid.resetData();
                    that.$el.find('#rsltCnt').html('0');
                }
            }


            /**
             * 기본부 조회 버튼 클릭
             */
            , query: function () {
                var that = this;
                var sParam = bxUtil.makeParamFromForm(that.$el.find('.CAPMT031-base-section'));
                if (commonInfo.getInstInfo().instCd) {
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                } else {
                    fn_alertMessage("", bxMsg("cbb_items.SCRNITM#instSearchMsg"));
                    return;
                }
                that.inquiryBaseData(sParam);
            }


            /**
             * 기본부 정보로 그리드 조회
             */
            , inquiryBaseData: function (param) {
                // header 정보 set
                var that = this;
                var sParam = param;
                var linkData = {"header": fn_getHeader("PMT0318402"), "inputDto": sParam};


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


                                $.each(tbList,function(index,value){
                                     value.useYn=(value.useYn=="Y"?true:false);
                                 });
                                that.CAPMT031Grid.setData(tbList);
                                that.$el.find('#rsltCnt').html(tbList.length);
                            }
                            else
                            {
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
                this.$el.find(".CAPMT031-grid-section").html(this.CAPMT031Grid.render({'height': '450px'}));
            } // end of createGrid
            /**
             * 상세부 정보 저장 버튼
             */
            , saveDetail: function () {
                var that = this;
                var changedAllData = that.CAPMT031Grid.getChangedRecords('useYn'); // 변경된 데이터 가져오기
                var sParam = {};
                var gridData = [];


                if (changedAllData.length > 0) {


                    var instCd = commonInfo.getInstInfo().instCd
                    if (!instCd) {
                        fn_alertMessage("", bxMsg("cbb_items.SCRNITM#instSearchMsg"));
                        return;
                    }


                    sParam.instCd = instCd;
                    for (var idx in changedAllData) {
                        var sub = {};
                        sub.cmpntCd = changedAllData[idx].data.cmpntCd;
                        sub.jobId = changedAllData[idx].data.jobId;
                        sub.useYn = changedAllData[idx].data.useYn?'Y':'N';
                        sub.aplyStartDt = changedAllData[idx].data.aplyStartDt;
                        sub.frstOprtnStaffId = changedAllData[idx].data.frstOprtnStaffId;
                        sub.scndryOprtnStaffId = changedAllData[idx].data.scndryOprtnStaffId;


                        gridData.push(sub);


                    }


                    sParam.list = gridData;


                    var linkData = {"header": fn_getHeader("PMT0318201"), "inputDto": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                            enableLoading: true
                            , success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                    fn_alertMessage("", bxMsg("cbb_items.SCRNITM#success"));
                                    // 재조회
                                    that.query();
                                }
                            }   // end of suucess: fucntion
                        }); // end of bxProxy
                }//if
            }// end of saveDetail
            , fn_base_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT031-base-section"), this.$el.find("#btn-base-section-toggle"));
            }// end of fn_base_toggle


            , fn_grid_toggle:function()
            {
                fn_pageLayerCtrl(this.$el.find(".CAPMT031-grid-section"), this.$el.find("#btn-grid-section-toggle"));
            }// end of fn_grid_toggle
        }); // end of Backbone.View.extend({


        return CAPMT031View;
    } // end of define function
); // end of define
