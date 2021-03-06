// Generated by  on 2015-01-27 오후 5:15:30
define(
    [
        'bx/common/config'
        , 'bx-component/message/message-alert'
        , 'bx-component/message/message-confirm'
        , 'bx-component/ext-grid/_ext-grid'
        , 'text!app/views/page/PWF/020/PWF020-detl-tpl.html'
        , 'app/views/page/popup/CAPCM/popup-message'
    ],
    function (config,
              alertMessage,
              confirmMessage,
              ExtGrid,
              tpl,
              PopupMessage) {


        // 전역변수 선언
        var chkAddCol = false;


        var PWFTabView = Backbone.View.extend({


            // 태그이름 설정
            tagName: 'section',


            // 클래스 이름 설정
            className: 'PST001-list-page',


            // 템플릿 설정
            templates: {
                'tpl': tpl
            }


            // 이벤트 설정
            , events: {
                'click.bx-tab-container .bx-tab-menu-item': 'changeTab'
                , 'click .item-single-history-btn': 'showSingleHistory'
            }


            // 탭에 따라 호출될 메소드 지정
            , subPageRenderMap: {
                'PWF020-single-tab': 'selSingle'
            }


            , initialize: function (initData) {
                var that = this;


                $.extend(that, initData);


                // 페이지 템플릿 설정
                that.$el.html(that.tpl());


                var comboStore1 = {};
                var sParam = {};
                var selectStyle = {};
                sParam = {};
                sParam.cdNbr = "11906"; // workflow 승인구분코드


                var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                bxProxy.all([
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
                    ]
                    , {
                        success: function () {
                            // 그리드 렌더
                            that.createGrid("single");


                            /* ========================================================== */
                            /*  Grid Define   */
                            /* ========================================================== */
                            that.TaskGrid = new ExtGrid({
                                //  그리드 컬럼 정의
                                fields: ['No', 'instCd', 'taskId', 'taskNm'
                                    , 'crtnDt', 'exctnDt', 'exctnStaffId', 'exctnStaffNm'
                                    , 'wflowAprvlDscd', 'aprvlOpnn'
                                ]
                                , id: 'TaskGrid'
                                , columns: [
                                    {
                                        text: bxMsg('cbb_items.SCRNITM#No')
                                        , dataIndex: 'rowIndex',
                                        style: 'text-align:center',
                                        align: 'right'
                                        , sortable: false
                                        , width: 25
                                        // other config you need..
                                        , renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                        return rowIndex + 1;
                                    }
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#instCd'),
                                        dataIndex: 'instCd',
                                        width: 0,
                                        style: 'text-align:center',
                                        align: 'left'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#taskId'),
                                        dataIndex: 'taskId',
                                        width: 0,
                                        style: 'text-align:center',
                                        align: 'left'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#taskNm'),
                                        dataIndex: 'taskNm',
                                        width: 150,
                                        style: 'text-align:center',
                                        align: 'left'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#exctnStaffId'),
                                        dataIndex: 'exctnStaffId',
                                        width: 0,
                                        style: 'text-align:center',
                                        align: 'left'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#exctnStaffNm'),
                                        dataIndex: 'exctnStaffNm',
                                        width: 130,
                                        style: 'text-align:center',
                                        align: 'left'
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#crtnDt'),
                                        dataIndex: 'crtnDt',
                                        width: 80,
                                        style: 'text-align:center',
                                        align: 'center',
                                        renderer: function (val) {
                                            return that.setGridDate(val);
                                        }
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#exctnDt'),
                                        dataIndex: 'exctnDt',
                                        width: 80,
                                        style: 'text-align:center',
                                        align: 'center',
                                        renderer: function (val) {
                                            return that.setGridDate(val);
                                        }
                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#wflowAprvlDscd'),
                                        width: 130,
                                        dataIndex: 'wflowAprvlDscd',
                                        style: 'text-align:center',
                                        align: 'left'
                                        ,
                                        editor: {
                                            xtype: 'combobox'
                                            , store: comboStore1
                                            , displayField: 'cdNm'
                                            , valueField: 'cd'
                                        }
                                        ,
                                        renderer: function (val) {
                                            index = comboStore1.findExact('cd', val);
                                            if (index != -1) {
                                                rs = comboStore1.getAt(index).data;
                                                return rs.cdNm;
                                            }
                                        } // end of render


                                    }
                                    , {
                                        text: bxMsg('cbb_items.AT#aprvlOpnn'),
                                        dataIndex: 'aprvlOpnn',
                                        width: 400,
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
                                                    if (e.field == 'exctnDt' || e.field == 'crtnDt'
                                                    ) {
                                                        return false;
                                                    }
                                                }
                                            }
                                        }) // end of Ext.create
                                    ] // end of plugins
                                } // end of gridConfig
                                , listeners: {
                                    dblclick: {
                                        element: 'body',
                                        fn: function () {
                                            //더블클릭시 이벤트 발생
                                            that.selectReocrd();
                                        }
                                    }
                                }
                            });
                            // 그리드 렌더
                            that.createGrid("task");
                        }
                    });
            } // end of initialize:


            // 첫번째 탭 활성화 설정
            , render: function () {
                this.currentSubTab = 'PWF020-single-tab';


                sParam = {};
                selectStyle = {};
                sParam.className = "wflowPrgrsStsCd-wrap";
                sParam.targetId = "wflowPrgrsStsCd";
                sParam.nullYn = "Y";
                sParam.cdNbr = "11903";
                fn_getCodeList(sParam, this, selectStyle);


                return this.$el;
            }


            // 그리드 생성
            , createGrid: function (target) {
                if (target == "task") {
                    this.$el.find(".PWF020-task-grid").html(this.TaskGrid.render({'height': 150}));
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
                //info 에서 넘어온 파라미터를 전역변수에 현재 창의 전역변후에 넣는다.
                this.settedParam = param;


                (typeof this[subPageRenderName] === 'function') && this[subPageRenderName]();
            }


            // 그리드의 날짜컬럼의 포맷변경 yyyymmdd ==> yyyy-mm-dd
            , setGridDate: function (val) {
                var returnVal = "";


                if (val == null || val.length != 8) {
                    return null;
                }


                returnVal = val.substring(0, 4) + "-" + val.substring(4, 6) + "-" + val.substring(6, 8);


                return returnVal;
            }


            // 그리드의 날짜컬럼의 포맷 변경 yyyy-mm-dd ==> yyyymmdd
            , getGridDate: function (val) {
                var returnVal = "";
                returnVal = val.replace(/-/gi, '');


                return returnVal;
            }


            /* ============================================================== */
            /*  Single 조회         */
            /* ============================================================== */
            , selSingle: function () {
                var that = this;
            } // end of 조회
            //그리드 더블클릭시 이벤트 처리
            , selectReocrd: function () {
                var that = this;
            }
            , renderProcessInstanceDetail: function (param) {
                var that = this;
                // Initialize
                that.$el.find('[data-form-param="wflowId"]').val('');
                that.$el.find('[data-form-param="wflowNm"]').val('');
                that.$el.find('[data-form-param="wflowInstncId"]').val('');
                that.$el.find('#scaled-frame-processInstance').attr('src', baseUrl + '/activiti-explorer/diagram-viewer/index.html?processDefinitionId=' + param.wflowId + "&processInstanceId=" + param.wflowInstncId);
                console.log("iframe height = " + that.$el.find('#scaled-frame-processInstance').contents().find('body').height());
                that.$el.find('#scaled-frame-processInstance').height('600');


                that.$el.find('[data-form-param="wflowNm"]').val(param.wflowNm);
                that.$el.find('[data-form-param="wflowId"]').val(param.wflowId);
                that.$el.find('[data-form-param="wflowInstncId"]').val(param.wflowInstncId);
                that.$el.find('[data-form-param="aprvlAplctnCntnt"]').val(param.aprvlAplctnCntnt);


                var sParam = {};
                sParam.instCd = param.instCd;
                sParam.wflowInstncId = param.wflowInstncId;


                var linkData = {"header": fn_getHeader("PWF0208401"), "ToDoListInqrySvcGetToDoListIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            if (responseData.ToDoListInqrySvcGetToDoListOut) {
                                var taskList = responseData.ToDoListInqrySvcGetToDoListOut.taskList;


                                if (taskList != null || taskList.length > 0) {
                                    that.$el.find('[data-form-param="wflowPrgrsStsCd"]').val(taskList[0].wflowPrgrsStsCd);
                                    that.$el.find('[data-form-param="wflowPrgrsStsCd"]').attr("disabled", true);


                                    that.TaskGrid.setData(taskList);
                                } else {
                                    that.TaskGrid.resetData();
                                }
                            }
                        }
                    }
                });
            }


            , reset: function () {
                var that = this;


                that.$el.find('[data-form-param="wflowNm"]').val("");
                that.$el.find('[data-form-param="wflowId"]').val("");
                that.$el.find('[data-form-param="wflowInstncId"]').val("");
                that.$el.find('[data-form-param="aprvlAplctnCntnt"]').val("");


                that.TaskGrid.resetData();
            }


        }); // end of PWFTabView = Backbone.View.extend


        return PWFTabView;
    }  // end of main function
);
