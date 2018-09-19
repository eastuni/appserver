// Generated by Bankware Global CBB Solution Center on 2015-02-03-15:26:10


define(
    [
        'bx/common/config'
        , 'bx-component/message/message-alert'
        , 'bx-component/message/message-confirm'
        , 'bx-component/ext-grid/_ext-grid'
        , 'text!app/views/page/PWF/402/PWF402-list-tpl.html'
        , 'bx/common/common-message'
    ],
    function (config
        , alertMessage
        , confirmMessage
        , ExtGrid
        , tpl) {


        // 전역변수 선언
        var chkAddCol = false;


        var comboStore1 = {}; // 속성타입코드
        var comboStore2 = {}; // 속성검증방법코드


        var PWF402TabView = Backbone.View.extend({


            // 태그이름 설정
            tagName: 'section',


            // 클래스 이름 설정
            className: 'PWF402-list-page',


            // 템플릿 설정
            templates: {
                'tpl': tpl
            }


            // 이벤트 설정
            , events: {
                'click.bx-tab-container .bx-tab-menu-item': 'changeTab'
            }


            // 탭에 따라 호출될 메소드 지정
            , subPageRenderMap: {
                'PWF402-single-tab': 'selSingle'
            }


            , initialize: function (initData) {
                var that = this;


                $.extend(that, initData);


                // 페이지 템플릿 설정
                that.$el.html(that.tpl());


                // 콤보조회 서비스호출 준비
                var sParam = {};
                // 속성타입코드
                sParam = {};
                sParam.cdNbr = "10001";
                var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                // 속성검증방법코드
                sParam = {};
                sParam.cdNbr = "10002";
                var linkData2 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                /* ========================================================== */
                bxProxy.all([
                    /* ========================================================== */
                    // 속성타입코드콤보로딩
                    {
                        url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            comboStore1 = new Ext.data.Store({
                                fields: ['cd', 'cdNm'],
                                data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tbl
                            });
                        }
                    }
                    }
                    // 속성검증방법코드콤보로딩
                    , {
                        url: sUrl, param: JSON.stringify(linkData2), success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                comboStore2 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tbl
                                });
                            }
                        }
                    }
                ], {
                    success: function () {
                        /* ------------------------------------------------------------ */
                        that.PWF402SingleGrid = new ExtGrid({
                            /* ------------------------------------------------------------ */
                            // 단일탭 그리드 컬럼 정의
                            fields: ['aprvlCndNbr', 'tblNm', 'xtnAtrbtNm', 'atrbtTpCd', 'atrbtVldtnWayCd', 'vldtnRule']
                            , id: 'PWF402SingleGrid'
                            , columns: [
                                {
                                    text: 'No.'
                                    , dataIndex: 'rowIndex',
                                    style: 'text-align:center',
                                    align: 'right'
                                    , sortable: false
                                    , width: 50
                                    // other config you need....
                                    , renderer: function (value, metaData, record, rowIndex, colIndex, sotre) {
                                    return rowIndex + 1;
                                }
                                }
                                , {text: "", width: 0, dataIndex: 'aprvlCndNbr', editor: 'textfield', hidden: true}
                                , {
                                    text: bxMsg('cbb_items.AT#tblNm'), width: 100, dataIndex: 'tblNm', editor: 'textfield',
                                    style: 'text-align:center',
                                    align: 'left'
                                }
                                , {
                                    text: bxMsg('cbb_items.AT#xtnAtrbtNm'),
                                    width: 100,
                                    dataIndex: 'xtnAtrbtNm',
                                    editor: 'textfield',
                                    style: 'text-align:center',
                                    align: 'left'
                                }
                                , {
                                    text: bxMsg('cbb_items.AT#atrbtTpCd'), width: 100, dataIndex: 'atrbtTpCd',
                                    style: 'text-align:center',
                                    align: 'left'
                                    , editor: {
                                        xtype: 'combobox'
                                        , store: comboStore1
                                        , displayField: 'cdNm'
                                        , valueField: 'cd'
                                    }
                                    , renderer: function (val) {
                                        index = comboStore1.findExact('cd', val);
                                        if (index != -1) {
                                            rs = comboStore1.getAt(index).data;
                                            return rs.cdNm
                                        }
                                    } // end of render
                                } // end of atrbtTpCd
                                , {
                                    text: bxMsg('cbb_items.AT#atrbtVldtnWayCd'), width: 150, dataIndex: 'atrbtVldtnWayCd',
                                    style: 'text-align:center',
                                    align: 'left'
                                    , editor: {
                                        xtype: 'combobox'
                                        , store: comboStore2
                                        , displayField: 'cdNm'
                                        , valueField: 'cd'
                                    }
                                    , renderer: function (val) {
                                        index = comboStore2.findExact('cd', val);
                                        if (index != -1) {
                                            rs = comboStore2.getAt(index).data;
                                            return rs.cdNm
                                        }
                                    } // end of render
                                } // end of atrbtVldtnWayCd
                                , {
                                    text: bxMsg('cbb_items.AT#atrbtVldtnRule'),
                                    width: 400,
                                    dataIndex: 'vldtnRule',
                                    editor: 'textfield',
                                    style: 'text-align:center',
                                    align: 'left'
                                }
                            ] // end of columns
                            // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                            , gridConfig: {
                                // 셀 에디팅 플러그인
                                // 2번 클릭시, 에디팅할 수 있도록 처리
                                plugins: [
                                    Ext.create('Ext.grid.plugin.CellEditing', {
                                        clicksToEdit: 2
                                        , listeners: {
                                            'beforeedit': function (editor, e) {
                                                if (e.field == 'aprvlCndNbr'
                                                    || e.field == 'tblNm'
                                                    || e.field == 'xtnAtrbtNm'
                                                    || e.field == 'atrbtTpCd'
                                                    || e.field == 'atrbtVldtnWayCd'
                                                    || e.field == 'vldtnRule'
                                                ) {
                                                    return false;
                                                }
                                            } // end of beforeedit
                                        } // end of listners
                                    }) // end of Ext.create
                                ] // end of plugins
                            } // end of gridConfig


                            // 더블클릭 이벤트 정의
                            , listeners: {
                                dblclick: {
                                    element: 'body',
                                    fn: function () {
                                        param = {};
                                        param = that.PWF402SingleGrid.grid.getSelectionModel().selected.items[0];


                                        // 더블클릭 이벤트 발생
                                        that.trigger('loadDtlData', param);
                                    }
                                }
                            } // end of listerners
                        });
                        // 단일탭 그리드 렌더
                        that.createGrid("single");


                    } // end of success:.function
                }); // end of bxProxy.all


            } // end of initialize:


            // 첫번째 탭 활성화 설정
            , render: function () {
                this.currentSubTab = 'PWF402-single-tab';
                return this.$el;
            }


            //그리드 초기화
            , initList: function () {
                this.PWF402SingleGrid.resetData();
                this.trigger('initDetl');
            }


            // 그리드 생성
            , createGrid: function (target) {
                if (target == "single") {
                    this.$el.find(".PWF402-single-grid").html(this.PWF402SingleGrid.render({'height': '200px'}));
                }
            } // end of createGrid


            // 탭 변경 이벤트 처리
            , changeTab: function (e) {
                var $clickedTab = $(e.currentTarget),
                    pageLink = $clickedTab.attr('data-link'),
                    $tabs = $clickedTab.siblings('.bx-tab-menu-item'),
                    $pages = $clickedTab.parents('.bx-tab-menu').next().find('.bx-tab-page');


                // 활성화 되어있는 탭과 페이지 비활성화 처리
                $tabs.filter('.is-active').removeClass('is-active');
                $pages.filter('.is-active').removeClass('is-active');


                // 클릭된 탭과 페이지 활성화 처리
                $clickedTab.addClass('is-active');
                $pages.filter('[data-link="' + pageLink + '"]').addClass('is-active');


                // 현재 활성화 탭 설정
                this.currentSubTab = pageLink;
                $pages.filter('[data-link="' + pageLink + '"]').show();




                // 탭에 연결된 메소드 호출
                this.renderSubPage();
            }


            // 텝에 연결된 매소드 호출
            , renderSubPage: function (param) {
                var subPageRenderName = this.subPageRenderMap[this.currentSubTab];


                // 기본부에서 넘어온 파라미터를 현재창의 전역변수에 넣는다
                this.settedParam = param;


                (typeof this[subPageRenderName] === 'function') && this[subPageRenderName]();
            }


            // 그리드의 날짜컬럼의 포맷변경 yyyymmdd ==> yyyy-mm-dd
            , setGridDate: function (val) {
                var now = new Date(val);
                var returnVal = val;


                if (isNaN(now.getFullYear())) {
                    if (val.length == 8) {
                        val = val.substring(0, 4) + "-" + val.substring(4, 6) + "-" + val.substring(6, 8);
                    }
                    returnVal = val;
                }
                else {
                    var year = now.getFullYear();
                    var month = now.getMonth() + 1;
                    var date = now.getDate();


                    if ((month + "").length < 2) {
                        month = "0" + month;   //달의 숫자가 1자리면 앞에 0을 붙임.
                    }
                    if ((date + "").length < 2) {
                        date = "0" + date;
                    }
                    returnVal = year + "-" + Month + "-" + date;
                }
                return returnVal;
            }


            // 그리드의 날짜컬럼의 포맷 변경 yyyy-mm-dd ==> yyyymmdd
            , getGridDate: function (val) {
                var now = new Date(val);
                var returnVal;
                if (isNaN(now.getFullYear())) {
                    returnVal = val;
                }
                else {
                    var year = now.getFullYear();
                    var month = now.getMonth() + 1;
                    var date = now.getDate();


                    if ((month + "").length < 2) {
                        month = "0" + month;   //달의 숫자가 1자리면 앞에 0을 붙임.
                    }
                    if ((date + "").length < 2) {
                        date = "0" + date;
                    }


                    returnVal = year + "" + month + "" + date;
                }
                return returnVal;
            }




            /* ============================================================== */
            /*  Single 조회         */
            /* ============================================================== */
            , selSingle: function () {
                chkAddcol = false;
                var that = this;
                var sParam = {};
                var param = this.settedParam;


                // 입력 Key값 set
                sParam.instCd = param.instCd;//기관코드
                sParam.aprvlCndNbr = param.aprvlCndNbr;  // 분개규칙일련번호


                var linkData = {"header": fn_getHeader("PWF4028401"), "AprvlCndMgmtSvcGetAprvlCondDtlIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var tbList = responseData.AprvlCndMgmtSvcGetAprvlCondDtlOut.xtnAtrList;
                            if (tbList != null || tbList.length > 0) {
                                that.PWF402SingleGrid.setData(tbList);
                            }
                            else {
                                that.PWF402SingleGrid.resetData();
                            }
                        }
                    }   // end of suucess: fucntion
                });     // end of bxProxy
            } // end of 조회
        }); // end of PWF402TabView = Backbone.View.extend


        return PWF402TabView;
    }  // end of main function
);
