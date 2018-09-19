define(
    [
     	'bx/common/common-info',
        'text!app/views/page/CAPST/001/_CAPST001.html',
        'bx-component/ext-grid/_ext-grid'
    ],
    function (
        commonInfo,
        tpl,
        ExtGrid
    ) {


        var comboStore1 = {}; // 상품대분류코드
        var comboStore2 = {}; // 상품중분류코드
        var comboStore3 = {}; // 상품템플릿코드
        var comboStore4 = {}; // 금액유형코드
        var comboStore5 = {}; // 잔액유형코드
        var comboStore6 = {}; // 기간이력관리방법코드
        var comboStore7 = {}; // 여부
        var comboStore8 = {}; // 입력일자별이력관리코드
        var comboStore9 = {}; // 상품코드
        var recordParam = null;
        var deleteList = [];
        var initFlag = true;
        var isProcess = false;


        /**
         * Backbone
         */
        var CAPST001View = Backbone.View.extend({
        	// set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPST001-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {


                /*
                 * search-condition-area
                 */
                'change .CAPST001-bizDscd-wrap': 'changeBusinessDistinctCode',
                'change .CAPST001-pdTpCd-wrap': 'changeProductTypeCode',
                'change .CAPST001-pdTmpltCd-wrap': 'changeProductTemplateCode',
                'change .CAPST001-dpstDtHstMgmtWayCd-wrap': 'changeDpstDtHstMgmtWayCd',
                'click #btn-search-condition-reset': 'resetSearchCondition',
                'click #btn-search-condition-inquire': 'inquireBalanceParameter',
                'click #btn-search-condition-toggle': 'toggleSearchCondition',


                /*
                 * search-result-area
                 */
                'click #btn-search-result-reset': 'resetSearchResult',
                'click #btn-search-result-save': 'saveSearchResult',
                'click #btn-search-result-toggle': 'toggleSearchResult',


                /*
                 * detail-information-area
                 */
                'click #btn-detail-information-reset': 'resetDetailInformation',
                'click #btn-detail-information-save': 'saveDetailInformation',
                'click #btn-detail-information-toggle': 'toggleDetailInformation'
            },


            /**
             * initialize
             */
            initialize: function (initData) {
                $.extend(this, initData);
                this.setComboStore();
                this.initData = initData;
                this.deleteList = [];
                this.initFlag = true;
                this.createGrid();
                self = this;
            },


            /**
             * Render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find("#CAPST001Grid").html(this.CAPST001Grid.render({
                    'height': CaGridHeight
                }));
                this.setComboBoxes();
                this.resetSearchCondition();
                this.resetDetailInformation();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPST001-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPST001-wrap #btn-detail-information-save')
                                    			   ]);
                
                return this.$el;
            },


            setComboStore: function () {
                header = fn_getHeader("CAPCM0038400");


                sParam = {};
                sParam.cdNbr = "80015";
                var linkData1 = {
                    "header": header,
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };


                sParam = {};
                sParam.cdNbr = "50026";
                var linkData4 = {
                    "header": header,
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };


                sParam = {};
                sParam.cdNbr = "50025";
                var linkData5 = {
                    "header": header,
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };


                sParam = {};
                sParam.cdNbr = "50030";
                var linkData6 = {
                    "header": header,
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };


                sParam = {};
                sParam.cdNbr = "A0435";
                var linkData8 = {
                    "header": header,
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };




                sParam = {};
                sParam.cdNbr = "10000";
                var linkData7 = {
                    "header": header,
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };




                bxProxy.all([
   	              // 상품대분류코드
                    {
                        url: sUrl,
                        param: JSON.stringify(linkData1),
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                comboStore1 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }
   	              // 금액유형코드 콤보코드 로딩
   	              , {
                        url: sUrl,
                        param: JSON.stringify(linkData4),
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                comboStore4 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }
   	              // 잔액유형코드 콤보코드 로딩
   	              , {
                        url: sUrl,
                        param: JSON.stringify(linkData5),
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                comboStore5 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }
   	              // 기간이력관리방법코드 콤보코드 로딩
   	              , {
                        url: sUrl,
                        param: JSON.stringify(linkData6),
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                comboStore6 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }
   	           // 입금일자별이력관리코드 콤보코드 로딩 2016.03.15
   	              , {
                        url: sUrl,
                        param: JSON.stringify(linkData8),
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                comboStore8 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }
   	              // 여부
   	              , {
                        url: sUrl,
                        param: JSON.stringify(linkData7),
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                comboStore7 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }


   	          ], {
                    success: function () {}
                });


            },


            /** 
             * Create search results grid
             */
            createGrid: function () {
                var that = this;


                this.CAPST001Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'bizDscd', 'pdTpCd', 'pdTmpltCd', 'pdCd', 'pdTpCdNm', 'pdTmpltNm', 'pdNm', 'amtTpCd', 'balTpCd'
                              , 'trmHstMgmtWayCd', 'dpstDtHstMgmtWayCd', 'dailyBalHstMgmtYn', 'addSbtrctDrctnOpsitYn', 'linkUpdtYn'],
                    id: 'CAPST001Grid',
                    columns: [


                         /*
                          *  Row index
                          */
                        {
                            text: bxMsg('cbb_items.SCRNITM#No'),
                            dataIndex: 'rowIndex',
                            sortable: false,
                            width: 50,
                            height: 25,
                            style: 'text-align:center',
                            align: 'center',
                            // other config you need....
                            renderer: function (value, metaData, record, rowIndex) {
                                return rowIndex + 1;
                            }
                         },
                         /*
                          * 업무코드
                          */
                        {
                            text: bxMsg('cbb_items.AT#bizDscd'),
                            dataIndex: 'bizDscd',
                            width: 100,
                            style: 'text-align:center',
                            align: 'center',
                            hidden: true
                        },


                         /*
                          * 상품유형코드
                          */
                        {
                            text: bxMsg('cbb_items.AT#pdTpCd'),
                            dataIndex: 'pdTpCd',
                            width: 100,
                            style: 'text-align:center',
                            align: 'center',
                            hidden: true
                        },


                         /*
                          * 상품템플릿코드
                          */
                        {
                            text: bxMsg('cbb_items.AT#pdTmpltCd'),
                            dataIndex: 'pdTmpltCd',
                            width: 100,
                            style: 'text-align:center',
                            align: 'center',
                            hidden: true
                        },


                         /*
                          * 상품코드
                          */
                        {
                            text: bxMsg('cbb_items.AT#pdCd'),
                            dataIndex: 'pdCd',
                            width: 200,
                            style: 'text-align:center',
                            align: 'center',
                            hidden: true
                        },


                         /*
                          * BizDscdNm
                          */
                        {
                            text: bxMsg('cbb_items.AT#bizDscd'),
                            width: 100,
                            dataIndex: 'bizDscd',
                            style: 'text-align:center',
                            align: 'center',
                            flex: 1,
                            editor: {
                                xtype: 'combobox',
                                store: comboStore1,
                                displayField: 'cdNm',
                                valueField: 'cd'
                            },
                            renderer: function (val) {
                                    index = comboStore1.findExact('cd', val);
                                    if (index != -1) {
                                        rs = comboStore1.getAt(index).data;
                                        return rs.cdNm;
                                    }
                                } // end of render
                         },


                         /*
                          * Product type name
                          */
                        {
                            text: bxMsg('cbb_items.AT#pdTpCd'),
                            dataIndex: 'pdTpCdNm',
                            width: 100,
                            style: 'text-align:center',
                            align: 'center',
                            flex: 1
                        },


                         /*
                          * Product template name
                          */
                        {
                            text: bxMsg('cbb_items.AT#pdTmpltCd'),
                            dataIndex: 'pdTmpltNm',
                            width: 100,
                            style: 'text-align:center',
                            align: 'center',
                            flex: 1
                        },


                         /*
                          * Product name 
                          */
                        {
                            text: bxMsg('cbb_items.AT#pdCd'),
                            dataIndex: 'pdNm',
                            width: 100,
                            style: 'text-align:center',
                            align: 'center',
                            flex: 1
                        },


                         /*
                          * Amount type code
                          */
                        {
                            text: bxMsg('cbb_items.AT#amtTpCd'),
                            width: 115,
                            dataIndex: 'amtTpCd',
                            style: 'text-align:center',
                            align: 'center',
                            flex: 1,
                            editor: {
                                xtype: 'combobox',
                                store: comboStore4,
                                displayField: 'cdNm',
                                valueField: 'cd'
                            },
                            renderer: function (val) {
                                    index = comboStore4.findExact('cd', val);
                                    if (index != -1) {
                                        rs = comboStore4.getAt(index).data;
                                        return rs.cdNm;
                                    }
                                } // end of render
                         },


                         /*
                          * Balance type code
                          */
                        {
                            text: bxMsg('cbb_items.AT#balTpCd'),
                            width: 160,
                            dataIndex: 'balTpCd',
                            style: 'text-align:center',
                            align: 'center',
                            flex: 1,
                            editor: {
                                xtype: 'combobox',
                                store: comboStore5,
                                displayField: 'cdNm',
                                valueField: 'cd'
                            },
                            renderer: function (val) {
                                    index = comboStore5.findExact('cd', val);
                                    if (index != -1) {
                                        rs = comboStore5.getAt(index).data;
                                        return rs.cdNm;
                                    }
                                } // end of render
                         },


                         /*
                          * 기간이력관리방법코드
                          */
                        {
                            text: bxMsg('cbb_items.SCRNITM#trmHstMgmtWay'),
                            width: 150,
                            dataIndex: 'trmHstMgmtWayCd',
                            style: 'text-align:center',
                            align: 'center',
                            flex: 1,
                            editor: {
                                xtype: 'combobox',
                                store: comboStore6,
                                displayField: 'cdNm',
                                valueField: 'cd'
                            },
                            renderer: function (val) {
                                    index = comboStore6.findExact('cd', val);
                                    if (index != -1) {
                                        rs = comboStore6.getAt(index).data;
                                        return rs.cdNm;
                                    }
                                } // end of render
                         },


                         /*
                          * 입금일자별이력관리코드
                          */
                        {
                            text: bxMsg('cbb_items.SCRNITM#dpstDtHstMgmtWay'),
                            width: 150,
                            dataIndex: 'dpstDtHstMgmtWayCd',
                            style: 'text-align:center',
                            align: 'center',
                            flex: 1,
                            editor: {
                                xtype: 'combobox',
                                store: comboStore8,
                                displayField: 'cdNm',
                                valueField: 'cd'
                            },
                            renderer: function (val) {
                                    index = comboStore8.findExact('cd', val);
                                    if (index != -1) {
                                        rs = comboStore8.getAt(index).data;
                                        return rs.cdNm;
                                    }
                                } // end of render
                         },


                         /*
                          * 일일잔액이력관리여부
                          */
                        {
                            text: bxMsg('cbb_items.AT#dailyBalHstMgmtYn'),
                            width: 150,
                            dataIndex: 'dailyBalHstMgmtYn',
                            style: 'text-align:center',
                            align: 'center',
                            hidden: true,
                            editor: {
                                xtype: 'combobox',
                                store: comboStore7,
                                displayField: 'cdNm',
                                valueField: 'cd'
                            },
                            renderer: function (val) {
                                    index = comboStore7.findExact('cd', val);
                                    if (index != -1) {
                                        rs = comboStore7.getAt(index).data;
                                        var classNm = "s-no";
                                        var val = rs.cd;


                                        if (val == "Y") {
                                            classNm = "s-yes";
                                        }
                                        return "<span class=\"bw-sign " + classNm + "\">" + val + "</span>";
                                    }
                                } // end of render
                         },


                         /*
                          * 잔액증감반대여부
                          */
                        {
                            text: bxMsg('cbb_items.AT#addSbtrctDrctnOpsitYn'),
                            width: 130,
                            dataIndex: 'addSbtrctDrctnOpsitYn',
                            style: 'text-align:center',
                            align: 'center',
                            hidden: true,
                            editor: {
                                xtype: 'combobox',
                                store: comboStore7,
                                displayField: 'cdNm',
                                valueField: 'cd'
                            },
                            renderer: function (val) {
                                    index = comboStore7.findExact('cd', val);
                                    if (index != -1) {
                                        rs = comboStore7.getAt(index).data;
                                        var classNm = "s-no";
                                        var val = rs.cd;


                                        if (val == "Y") {
                                            classNm = "s-yes";
                                        }
                                        return "<span class=\"bw-sign " + classNm + "\">" + val + "</span>";
                                    }
                                } // end of render
                         },


                         /*
                          * 연계갱신여부
                          */
                        {
                            text: bxMsg('cbb_items.AT#linkUpdtYn'),
                            width: 130,
                            dataIndex: 'linkUpdtYn',
                            style: 'text-align:center',
                            align: 'center',
                            hidden: true,
                            editor: {
                                xtype: 'combobox',
                                store: comboStore7,
                                displayField: 'cdNm',
                                valueField: 'cd'
                            },
                            renderer: function (val) {
                                    index = comboStore7.findExact('cd', val);
                                    if (index != -1) {
                                        rs = comboStore7.getAt(index).data;
                                        var classNm = "s-no";
                                        var val = rs.cd;


                                        if (val == "Y") {
                                            classNm = "s-yes";
                                        }
                                        return "<span class=\"bw-sign " + classNm + "\">" + val + "</span>";
                                    }
                                } // end of render
                         },


                        /*
                         * 관리번호
                         */
                        {
                            text: '',
                            width: 0,
                            dataIndex: 'prjArrNo',
                            hidden: true
                        },






                        /*
                         * Delete
                         */
                        {
                            xtype: 'actioncolumn',
                            width: 80,
                            align: 'center',
                            text: bxMsg('cbb_items.SCRNITM#del'),
                            style: 'text-align:center',
                            items: [
                                {
                                    //  icon: 'images/icon/x-delete-16.png'
                                    iconCls: "bw-icon i-25 i-func-trash",
                                    tooltip: bxMsg('tm-layout.delete-field'),
                                    handler: function (grid, rowIndex, colIndex, item, e, record) {
                                        that.deleteList.push(record.data);
                                        grid.store.remove(record);
                                    }
                                }
                            ]
                        }




                     ], // end of columns


                    // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                    gridConfig: {
                        // 셀 에디팅 플러그인
                        plugins: [
                             Ext.create('Ext.grid.plugin.CellEditing', {
                                    // 2번 클릭시, 에디팅할 수 있도록 처리
                                    clicksToEdit: 2,
                                    listeners: {
                                        'beforeedit': function (editor, e) {


                                                return false;
                                            } // end of edit
                                    } // end of listners
                                }) // end of Ext.create
                         ] // end of plugins
                    }, // end of gridConfig
                    listeners: {
                        click: {
                            element: 'body',
                            fn: function () {
                            	if(isProcess == false)
                            		that.selectGridRecord();
                            }
                        }
                    }
                });
            },


            /**
             *  Set Combo boxes
             */
            setComboBoxes: function () {


                var sParam = {};


                /**
                 *  Business Distinction Code
                 */
                sParam = {};
                sParam.className = "CAPST001-bizDscd-wrap";
                sParam.targetId = "bizDscd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "80015";
                fn_getCodeList(sParam, this);


                /**
                 *  Amount Type Code
                 */
                sParam = {};
                sParam.className = "CAPST001-amtTpCd-wrap";
                sParam.targetId = "amtTpCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "50026";
                sParam.viewType = "ValNm"
                fn_getCodeList(sParam, this);


                /**
                 *  Balance Type Code
                 */
                sParam = {};
                sParam.className = "CAPST001-balTpCd-wrap";
                sParam.targetId = "balTpCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "50025";
                sParam.viewType = "ValNm"
                fn_getCodeList(sParam, this);


                /**
                 *  기간이력관리방법코드
                 */
                sParam = {};
                sParam.className = "CAPST001-trmHstMgmtWayCd-wrap";
                sParam.targetId = "trmHstMgmtWayCd";
                sParam.nullYn = "N";
                sParam.cdNbr = "50030";
                fn_getCodeList(sParam, this);


                /**
                 *  입금일자별이력관리방법코드
                 */
                sParam = {};
                sParam.className = "CAPST001-dpstDtHstMgmtWayCd-wrap";
                sParam.targetId = "dpstDtHstMgmtWayCd";
                sParam.nullYn = "N";
                sParam.cdNbr = "A0435";
                fn_getCodeList(sParam, this);


            },


            /**
             * 업무 구분 코드 변경
             */
            changeBusinessDistinctCode: function (e) {
                var that = this;
                var targetArea;
                if (e) targetArea = $(e.target.closest("section")).parent().attr("id");
                else targetArea = "detail-information-area";




                var sParam = {};
                var bizDscd = $('#' + targetArea + '  [data-form-param="bizDscd"]').val();
                var $selectPdTpCd = $('#' + targetArea + '  [data-form-param="pdTpCd"]');
                var $selectPdTmpltCd = $('#' + targetArea + '  [data-form-param="pdTmpltCd"]');
                var $selectPdCd = $('#' + targetArea + '  [data-form-param="pdCd"]');






                //상품템플릿코드, 상품코드 초기화
                $selectPdTpCd.empty();
                $selectPdTpCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                $selectPdTmpltCd.empty();
                $selectPdTmpltCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                $selectPdCd.empty();
                $selectPdCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));


                if (bizDscd == "") {
                    //상품유형코드 초기화
                    $selectPdTpCd.empty();
                   // $selectPdTpCd.val("");
                    $selectPdTpCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                } else {
                    //combobox 정보 셋팅
                    sParam.className = "CAPST001-pdTpCd-wrap." + targetArea;
                    sParam.targetId = "pdTpCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                    //inData 정보 셋팅
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                    sParam.bizDscd = bizDscd;
                    sParam.pdTpCd = "";
                    sParam.pdTmpltCd = "";
                    sParam.pdCd = "";


                    //상품유형코드 콤보데이터 load
                    fn_getPdCodeList(sParam, self);
                }




            },


            /**
             * 상품 유형 코드 변경
             */
            changeProductTypeCode: function (e) {
                var that = this;
                var targetArea;
                if (e) targetArea = $(e.target.closest("section")).parent().attr("id");
                else targetArea = "detail-information-area";




                var sParam = {};
                var bizDscd = $('#' + targetArea + '  [data-form-param="bizDscd"]').val();
                var pdTpCd = $('#' + targetArea + '  [data-form-param="pdTpCd"]').val();


                var $selectPdTmpltCd = $('#' + targetArea + '  [data-form-param="pdTmpltCd"]');
                var $selectPdCd = $('#' + targetArea + '  [data-form-param="pdCd"]');


                //상품코드 초기화
                $selectPdTmpltCd.empty();
                $selectPdTmpltCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                $selectPdCd.empty();
                $selectPdCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));


                if (pdTpCd == "") {
                    //상품템플릿코드 초기화
                    $selectPdTmpltCd.empty();
                    $selectPdTmpltCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                } else {
                    //combobox 정보 셋팅
                    sParam.className = "CAPST001-pdTmpltCd-wrap." + targetArea;
                    sParam.targetId = "pdTmpltCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                    //inData 정보 셋팅
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                    sParam.bizDscd = bizDscd;
                    sParam.pdTpCd = pdTpCd;
                    sParam.pdTmpltCd = "";
                    sParam.pdCd = "";


                    //상품템플릿코드 콤보데이터 load
                    fn_getPdCodeList(sParam, self);
                }


            },


            /**
             * 상품 템플릿 코드 변경
             */
            changeProductTemplateCode: function (e) {
                var that = this;
                var targetArea;
                if (e) targetArea = $(e.target.closest("section")).parent().attr("id");
                else targetArea = "detail-information-area";




                var sParam = {};
                // 상품대분류코드
                var bizDscd = $('#' + targetArea + '  [data-form-param="bizDscd"]').val();
                var pdTpCd = $('#' + targetArea + '  [data-form-param="pdTpCd"]').val();
                var pdTmpltCd = $('#' + targetArea + '  [data-form-param="pdTmpltCd"]').val();


                var $selectPdCd = $('#' + targetArea + '  [data-form-param="pdCd"]');


                $selectPdCd.empty();
                $selectPdCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));


                if (pdTmpltCd == "") {
                    //상품템플릿코드 초기화
                    $selectPdCd.empty();
                    $selectPdCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                } else {
                    //combobox 정보 셋팅
                    sParam.className = "CAPST001-pdCd-wrap." + targetArea;
                    sParam.targetId = "pdCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                    //inData 정보 셋팅
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                    sParam.bizDscd = bizDscd;
                    sParam.pdTpCd = pdTpCd;
                    sParam.pdTmpltCd = pdTmpltCd;
                    sParam.pdCd = "";


                    //상품코드 콤보데이터 load
                    fn_getPdCodeList(sParam, self);
                }
            },
            
            //입금일자별이력관리여부-유효기간기준인 경우에는 기간이력관리방법과 일일잔액이력여부를 선택 불가
            changeDpstDtHstMgmtWayCd: function (e){
            	
            	var selectBox = self.$el.find('#detail-information-area [data-form-param="dpstDtHstMgmtWayCd"]')
            	
            	if(selectBox.val() == '04'){ //유효기간기준
	               	self.$el.find('#detail-information-area [data-form-param="trmHstMgmtWayCd"]').prop("disabled", true);
	               	self.$el.find('#detail-information-area [data-form-param="dailyBalHstMgmtYn"]').prop("disabled", true);
            	}
            	else{
            		self.$el.find('#detail-information-area [data-form-param="trmHstMgmtWayCd"]').prop("disabled", false);
	               	self.$el.find('#detail-information-area [data-form-param="dailyBalHstMgmtYn"]').prop("disabled", false);
            	}
            },


            /*
             * Set parameters for the selected record
             */
            setRecordParam: function (selectedRecord, that) {
                recordParam = {};
                recordParam.bizDscd = selectedRecord.bizDscd;
                recordParam.pdTpCd = selectedRecord.pdTpCd;
                recordParam.pdTmpltCd = selectedRecord.pdTmpltCd;
                recordParam.pdCd = selectedRecord.pdCd;
                recordParam.that = that;


                this.setBizDscd();
            },


            setBizDscd: function(){
                 self.$el.find('#detail-information-area [data-form-param="bizDscd"]').prop("disabled", true);
                 $("#detail-information-area [data-form-param='bizDscd'").val(recordParam.bizDscd);
                 sParam.className = "CAPST001-pdTpCd-wrap.detail-information-area" ;
                 sParam.targetId = "pdTpCd";
                 sParam.nullYn = "Y";
                 sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                 //inData 정보 셋팅
                 sParam.instCd = commonInfo.getInstInfo().instCd;
                 sParam.bizDscd = $('#detail-information-area [data-form-param="bizDscd"]').val();
                 sParam.pdTpCd = "";
                 sParam.pdTmpltCd = "";
                 sParam.pdCd = "";
                 sParam.selectVal = self.unFillBlank(recordParam.pdTpCd);
                 //상품유형코드 콤보데이터 load
                 fn_getPdCodeList(sParam, self, null, self.setPdTpCd);


            },


            setPdTpCd: function(){
            	 self.$el.find('#detail-information-area [data-form-param="pdTpCd"]').prop("disabled", true);


            	 sParam.className = "CAPST001-pdTmpltCd-wrap.detail-information-area";
                 sParam.targetId = "pdTmpltCd";
                 sParam.nullYn = "Y";
                 sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                 //inData 정보 셋팅
                 sParam.instCd = commonInfo.getInstInfo().instCd;
                 sParam.bizDscd = $('#detail-information-area [data-form-param="bizDscd"]').val();
                 sParam.pdTpCd = $('#detail-information-area [data-form-param="pdTpCd"]').val();
                 sParam.pdTmpltCd = "";
                 sParam.pdCd = "";
                 sParam.selectVal = self.unFillBlank(recordParam.pdTmpltCd);
                 //상품템플릿코드 콤보데이터 load
                 fn_getPdCodeList(sParam, self, null, self.setPdTmpltCd);


            },


            setPdTmpltCd: function(){




            	self.$el.find('#detail-information-area [data-form-param="pdTmpltCd"]').prop("disabled", true);


            	 sParam.className = "CAPST001-pdCd-wrap.detail-information-area";
                 sParam.targetId = "pdCd";
                 sParam.nullYn = "Y";
                 sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                 //inData 정보 셋팅
                 sParam.instCd = commonInfo.getInstInfo().instCd;
                 sParam.bizDscd =$('#detail-information-area [data-form-param="bizDscd"]').val();
                 sParam.pdTpCd = $('#detail-information-area [data-form-param="pdTpCd"]').val();
                 sParam.pdTmpltCd = $('#detail-information-area [data-form-param="pdTmpltCd"]').val();
                 sParam.pdCd = "";
                 sParam.selectVal = self.unFillBlank(recordParam.pdCd);
                 //상품중분류코드 콤보데이터 load
                 fn_getPdCodeList(sParam, self, null, self.setPdCd);
            },


            setPdCd: function(){
            	var that = recordParam.that;


            	self.$el.find('#detail-information-area [data-form-param="pdCd"]').prop("disabled", true);
            	isProcess = false;
                recordParam = {};
            },


            /*
             * Set prdoduct code and reset parameters for the selected record record 
             */
            postProcessSelection: function () {
            	if(!recordParam) return;
            	recordParam.that.$el.find('#detail-information-area [data-form-param="pdCd"]').prop("disabled", true);
            	recordParam.that.$el.find('#detail-information-area [data-form-param="pdCd"]').val(that.unFillBlank(recordParam.pdCd));
                recordParam = {};
            },


            /*
             * Rest search condition area
             */
            resetSearchCondition: function () {
            	this.deleteList = [];
                this.$el.find('#search-condition-area [data-form-param="bizDscd"] option:eq(0)').attr("selected", "selected");


                var $selectPdTpCd = this.$el.find('#search-condition-area [data-form-param="pdTpCd"]');
                var $selectPdTmpltCd = this.$el.find('#search-condition-area [data-form-param="pdTmpltCd"]');
                var $selectPdCd = this.$el.find('#search-condition-area [data-form-param="pdCd"]');
                $selectPdTpCd.empty();
                $selectPdTpCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                $selectPdTmpltCd.empty();
                $selectPdTmpltCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                $selectPdCd.empty();
                $selectPdCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                this.$el.find('#search-condition-area [data-form-param="amtTpCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#search-condition-area [data-form-param="balTpCd"] option:eq(0)').attr("selected", "selected");


            },


            /*
             * Inquire balance parameter with search conditions
             */
            inquireBalanceParameter: function () {
            	this.resetDetailInformation();


                var that = this;
                var sParam = {};


                // 조회 key값 set
                sParam.bizDscd = this.$el.find('#search-condition-area [data-form-param="bizDscd"]').val();
                sParam.pdTpCd = this.$el.find('#search-condition-area [data-form-param="pdTpCd"]').val();
                sParam.pdTmpltCd = this.$el.find('#search-condition-area [data-form-param="pdTmpltCd"]').val();
                sParam.pdCd = this.$el.find('#search-condition-area [data-form-param="pdCd"]').val();
                sParam.amtTpCd = this.$el.find('#search-condition-area [data-form-param="amtTpCd"]').val();
                sParam.balTpCd = this.$el.find('#search-condition-area [data-form-param="balTpCd"]').val();




                if (sParam == null) {
                    this.CAPST001Grid.resetData();
                    return;
                }


                if (commonInfo.getInstInfo().instCd) {
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                } else {
                    sParam.instCd = "";
                    fn_alertMessage("", bxMsg('cbb_items.SCRNITM#instSearchMsg'));
                    return;
                }


                var linkData = {
                    "header": fn_getHeader("CAPST0018400"),
                    "CaBalMgmtPMngrSvcGetBalMgmtPListIn": sParam


                };


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {


                        if (fn_commonChekResult(responseData)) {
                            if (responseData.CaBalMgmtPMngrSvcGetBalMgmtPListOut) {
                                var tbList = responseData.CaBalMgmtPMngrSvcGetBalMgmtPListOut.tblNm;
                                var totCnt = tbList.length;


                                if (tbList != null || tbList.length > 0) {
                                    that.CAPST001Grid.setData(tbList);
                                    that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt') + " (" + fn_setComma(totCnt) + " " + bxMsg('cbb_items.SCRNITM#cnt') + ")");


                                }
                            }
                        }
                    }
                });
            },


            /*
             * Rest search area
             */
            resetSearchResult: function () {
            	this.deleteList = [];
            	this.resetDetailInformation();
                this.CAPST001Grid.resetData();
                this.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt'));
            },


            /*
             * Select a grid record
             */
            selectGridRecord: function () {
                var that = this;
                isProcess = true;


                if(!this.CAPST001Grid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPST001Grid.grid.getSelectionModel().selected.items[0].data;


                if (!selectedRecord) {
                    return;
                }


                that.initFlag = false;
                that.setRecordParam(selectedRecord, that);




                that.$el.find('#detail-information-area [data-form-param="amtTpCd"]').prop("disabled", true);
                that.$el.find('#detail-information-area [data-form-param="balTpCd"]').prop("disabled", true);


                that.$el.find('#detail-information-area [data-form-param="amtTpCd"]').val(selectedRecord.amtTpCd);
                that.$el.find('#detail-information-area [data-form-param="balTpCd"]').val(selectedRecord.balTpCd);


                this.$el.find('#detail-information-area [data-form-param="trmHstMgmtWayCd"] ').val(selectedRecord.trmHstMgmtWayCd);
                this.$el.find('#detail-information-area [data-form-param="dpstDtHstMgmtWayCd"]').val(selectedRecord.dpstDtHstMgmtWayCd);

                if (selectedRecord.dailyBalHstMgmtYn == "Y")
                    this.$el.find('#detail-information-area [data-form-param="dailyBalHstMgmtYn"]').prop("checked", true);
                else
                    this.$el.find('#detail-information-area [data-form-param="dailyBalHstMgmtYn"]').prop("checked", false);


                if (selectedRecord.addSbtrctDrctnOpsitYn == "Y")
                    this.$el.find('#detail-information-area [data-form-param="addSbtrctDrctnOpsitYn"]').prop("checked", true);
                else
                    this.$el.find('#detail-information-area [data-form-param="addSbtrctDrctnOpsitYn"]').prop("checked", false);


                if (selectedRecord.linkUpdtYn == "Y")
                    this.$el.find('#detail-information-area [data-form-param="linkUpdtYn"]').prop("checked", true);
                else
                    this.$el.find('#detail-information-area [data-form-param="linkUpdtYn"]').prop("checked", false);

                if(selectedRecord.dpstDtHstMgmtWayCd == '04'){
                	this.$el.find('#detail-information-area [data-form-param="trmHstMgmtWayCd"]').prop("disabled", true);
                	this.$el.find('#detail-information-area [data-form-param="dailyBalHstMgmtYn"]').prop("disabled", true);
                }

            },


            /*
             * Reset detail information
             */
            resetDetailInformation: function () {
            	this.initFlag = true;
            	this.$el.find('#detail-information-area [data-form-param="bizDscd"]').prop("disabled", false);
            	this.$el.find('#detail-information-area [data-form-param="pdTpCd"]').prop("disabled", false);
            	this.$el.find('#detail-information-area [data-form-param="pdTmpltCd"]').prop("disabled", false);
            	this.$el.find('#detail-information-area [data-form-param="pdCd"]').prop("disabled", false);
            	this.$el.find('#detail-information-area [data-form-param="balTpCd"]').prop("disabled", false);
            	this.$el.find('#detail-information-area [data-form-param="amtTpCd"]').prop("disabled", false);


            	this.$el.find('#detail-information-area [data-form-param="bizDscd"] option:eq(0)').attr("selected", "selected");


            	var $selectPdTpCd = this.$el.find('#detail-information-area [data-form-param="pdTpCd"]');
                var $selectPdTmpltCd = this.$el.find('#detail-information-area [data-form-param="pdTmpltCd"]');
                var $selectPdCd = this.$el.find('#detail-information-area [data-form-param="pdCd"]');
                $selectPdTpCd.empty();
                $selectPdTpCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                $selectPdTmpltCd.empty();
                $selectPdTmpltCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                $selectPdCd.empty();
                $selectPdCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));

                this.$el.find('#detail-information-area [data-form-param="trmHstMgmtWayCd"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="dailyBalHstMgmtYn"]').prop("disabled", false);
                
                this.$el.find('#detail-information-area [data-form-param="amtTpCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#detail-information-area [data-form-param="balTpCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#detail-information-area [data-form-param="trmHstMgmtWayCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#detail-information-area [data-form-param="dpstDtHstMgmtWayCd"] option:eq(0)').attr("selected", "selected");

                this.$el.find('#detail-information-area [data-form-param="dailyBalHstMgmtYn"]').prop("checked", false);
                this.$el.find('#detail-information-area [data-form-param="addSbtrctDrctnOpsitYn"]').prop("checked", false);
                this.$el.find('#detail-information-area [data-form-param="linkUpdtYn"]').prop("checked", false);
            },


            /*
             * Confirm delete item
             */
            saveSearchResult: function(){
            	var that = this;


            	/*
            	 * if delete list is empty
            	 */
            	if(that.deleteList.length == 0){
            		fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-input-data-msg'));
            		return;
            	}

				//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }


                function saveData() {
                    var table = [];
                    var sParam = {};


                    $(that.deleteList).each(function(idx, data) {
                        var sub = {};
                        sub.bizDscd      = data.bizDscd;
                        sub.pdTpCd   = data.pdTpCd;
                        sub.pdTmpltCd   = data.pdTmpltCd;
                        sub.pdCd      = data.pdCd; // 헤더의 기관코드
                        sub.amtTpCd = data.amtTpCd;
                        sub.balTpCd = data.balTpCd;
                        sub.trmHstMgmtWayCd = data.trmHstMgmtWayCd;
                        sub.dpstDtHstMgmtWayCd = data.dpstDtHstMgmtWayCd;
                        sub.dailyBalHstMgmtYn = data.dailyBalHstMgmtYn;
                        sub.addSbtrctDrctnOpsitYn = data.addSbtrctDrctnOpsitYn;
                        sub.linkUpdtYn = data.linkUpdtYn;
                        sub.instCd = commonInfo.getInstInfo().instCd;


                        table.push(sub);
                    });


                    sParam.tblNm = table;




                    var linkData = {"header": fn_getHeader("CAPST0018301"), "CaBalMgmtPMngrSvcrRegisterBalMgmtPListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                that.deleteList = [];
                                that.inquireBalanceParameter();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), saveData, this);
            },


            /*
             *  Add new balance parameter
             */
            saveDetailInformation: function(){


            		var that = this;
	                var sParam = {};
	                var srvcCd = "";
	                if(this.initFlag) srvcCd = "CAPST0018100";
	                else srvcCd = "CAPST0018200";

					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }


	                sParam.bizDscd = this.$el.find('#detail-information-area [data-form-param="bizDscd"]').val();
	                sParam.pdTpCd = this.fillBlank(this.$el.find('#detail-information-area [data-form-param="pdTpCd"]').val());
	                sParam.pdTmpltCd = this.fillBlank(this.$el.find('#detail-information-area [data-form-param="pdTmpltCd"]').val());
	                sParam.pdCd = this.fillBlank(this.$el.find('#detail-information-area [data-form-param="pdCd"]').val());
	                sParam.amtTpCd = this.$el.find('#detail-information-area [data-form-param="amtTpCd"]').val();
	                sParam.balTpCd = this.$el.find('#detail-information-area [data-form-param="balTpCd"]').val();
	                sParam.trmHstMgmtWayCd = this.$el.find('#detail-information-area [data-form-param="trmHstMgmtWayCd"]').val();
	                sParam.dpstDtHstMgmtWayCd = this.$el.find('#detail-information-area [data-form-param="dpstDtHstMgmtWayCd"]').val();


	                sParam.dailyBalHstMgmtYn = this.getYn(this.$el.find('#detail-information-area [data-form-param="dailyBalHstMgmtYn"]'));
	                sParam.addSbtrctDrctnOpsitYn = this.getYn(this.$el.find('#detail-information-area [data-form-param="addSbtrctDrctnOpsitYn"]'));
	                sParam.linkUpdtYn = this.getYn(this.$el.find('#detail-information-area [data-form-param="linkUpdtYn"]'));
	                sParam.instCd = commonInfo.getInstInfo().instCd;


	                console.log(sParam);
	                var linkData = {"header": fn_getHeader(srvcCd), "CaBalMgmtPMngrSvcrRegisterBalMgmtPIn": sParam};
	                // ajax호출
	                bxProxy.post(sUrl, JSON.stringify(linkData), {
	                    enableLoading: true
	                    , success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


	                            that.resetDetailInformation();
	                            that.inquireBalanceParameter();




	                        }
	                    }   // end of suucess: fucntion
	                }); // end of bxProxy




            	// fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-insert-msg'), saveData, this);


            },


            /*
             * Toggle
             */
            toggleSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find('#search-condition-area'), this.$el.find("#btn-search-condition-toggle"));
            },
            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find("#btn-search-result-toggle"));
            },
            toggleDetailInformation: function () {
                fn_pageLayerCtrl(this.$el.find('#detail-information-area'), this.$el.find("#btn-detail-information-toggle"));
            },


            getYn: function(obj){
            	if($(obj).attr('checked'))
            		return "Y";
            	else
            		return "N";
            },


            fillBlank: function(obj){
            	if(obj != "")
            		return obj;
            	else
            		return '@';
            },


            unFillBlank: function(obj){
            	if(obj == "@")
            		return "";
            	else
            		return obj;
            }








        }); // end of Backbone.View.extend({


        return CAPST001View;
    } // end of define function
); // end of define
