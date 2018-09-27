define(
    [
        'bx/common/config',
        'text!app/views/page/CAPAC/010/_CAPAC010.html',
        'bx-component/ext-grid/_ext-grid',
        'bx/common/common-info',
        'app/views/page/popup/CAPAC/popup-acctgItm-search',
        'app/views/page/popup/CAPAC/popup-refAtrbt-search',
        'app/views/page/popup/CAPCM/popup-code-search'
    ]
    , function (
        config,
        tpl,
        ExtGrid,
        commonInfo,
        PopupAcctgItmSearch,
        PopupRefAtrbtSearch,
        PopupCodeSearch
    ) {


        /**
         * Backbone
         */
        var CAPAC010View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section',
            // 클래스이름 설정
            className: 'bx-container CAPAC010-page',
            // 탬플릿 설정
            templates: {
                'tpl': tpl
            },
            // 이벤트 설정
            events: {
                'change .CAPAC010-bizDscd-wrap': 'changeBusinessDistinctCode',
                'change .CAPAC010-pdTpCd-wrap': 'changeProductTypeCode',
                'change .CAPAC010-pdTmpltCd-wrap': 'changeProductTemplateCode',


                'change .CAPAC010-bizDscd2-wrap': 'selectBusinessDistinctCodeOfDetail',
                'change .CAPAC010-pdTpCd2-wrap': 'selectProductTypeCodeOfDetail',
                'change .CAPAC010-pdTmpltCd2-wrap': 'selectProductTemplateCodeOfDetail',


                'click #btn-search-condition-reset': 'resetSearchCondition',
                'click #btn-journalizing-rule-detail-reset': 'resetJournalizingRuleDetail',
                'click #btn-extended-journalizing-rule-attribute-reset': 'resetExtendedJournalizingRuleAttribute',


                'click #btn-search-condition-inquire': 'inquireJournalizingRule',


                'click #btn-acctgItmCd-search': 'openAcctgItmSearchPopup',
                'click #btn-acctgItmCd2-search': 'openAcctgItmSearchPopupOfDetail',
                'click #btn-xtnAtrbtNm-search': 'openRefAtrbtSearchPopup',
                'click #btn-vldtnRuleCntnt-search': 'openCodeSearchPopup',


                'click #btn-search-result-excel': 'downloadGridDataWithExcel',


                'click #btn-search-result-save': 'saveSearchResult',
                'click #btn-journalizing-rule-detail-save': 'saveJournalizingRuleDetail',
                'click #btn-extended-journalizing-rule-save': 'saveExtendedJournalizingRule',
                'click #btn-extended-journalizing-rule-attribute-save': 'saveExtendedJournalizingRuleAttribute',


                'change .CAPAC010-atrbtVldtnWayCd-wrap': 'changeJournalizingCondition',


                'click #btn-search-condition-toggle': 'toggleSearchCondition',
                'click #btn-search-result-toggle': 'toggleSearchResult',
                'click #btn-journalizing-rule-detail-toggle': 'toggleJournalizingRuleDetail',
                'click #btn-extended-journalizing-rule-toggle': 'toggleExtendedJournalizingRule',
                'click #btn-extended-journalizing-rule-attribute-toggle': 'toggleExtendedJournalizingRuleAttribute'
            },


            initialize: function (initData) {
                $.extend(this, initData);


                this.baseSeqNbr = 0;
                this.detailAcctgDscd = "";
                this.xtnSeqNbr = 0;
                this.isNewBaseInfo = true;
                this.isNewXtnInfo = true;
                this.deleteListOfSrchRlt = [];
                this.deleteListOfXtnJnrzRl = [];
                this.deleteList = [];
                this.deleteDetailList = [];
                this.createGrid();
            },


            render: function () {
                this.$el.html(this.tpl());
                this.$el.find("#CAPAC010SrchRsltGrid").html(this.CAPAC010SrchRltGrid.render({'height': CaGridHeight}));
                this.$el.find('#CAPAC010ExtdJrnlRlGrid').html(this.CAPAC010ExtdJrnlRlGrid.render({'height': "200px"}));


                this.$divVldtnRuleCntnt      = this.$el.find('#extended-journalizing-rule-attribute-area #input-vldtnRuleCntnt-wrap');
                this.$buttonCodeSearch  = this.$el.find('#extended-journalizing-rule-attribute-area #btn-vldtnRuleCntnt-search');
                this.$inputVldtnRuleCntnt    = this.$el.find('#extended-journalizing-rule-attribute-area #input-vldtnRuleCntnt');
                this.$selectVldtnRuleCntnt   = this.$el.find('#extended-journalizing-rule-attribute-area #CAPCM010-vldtnRuleCntnt-wrap');


                this.setComboBoxes();
                this.setDatePicker();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPAC010-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPAC010-wrap #btn-journalizing-rule-detail-save')
                                    		,this.$el.find('.CAPAC010-wrap #btn-extended-journalizing-rule-save')
                                    		,this.$el.find('.CAPAC010-wrap #btn-extended-journalizing-rule-attribute-save')
                                    			   ]);
                return this.$el;
            },


            /**
             * 달력생성
             */
            setDatePicker: function () {
                fn_makeDatePicker(this.$el.find('#journalizing-rule-detail-area [data-form-param="aplyStartDt"]'));
                fn_makeDatePicker(this.$el.find('#journalizing-rule-detail-area [data-form-param="aplyEndDt"]'));
            },


            /**
             * 그리드생성
             */
            createGrid: function () {
                var that = this;


                this.CAPAC010SrchRltGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'bizDscd', 'pdTpCdNm', 'pdTmpltNm', 'pdNm', 'amtTpCd', 'acctgItmCd', 'acctgItmNm',
                        'xtnInfoNcsrYn', 'acctgDscd', 'seqNbr', 'aplyStartDt', 'aplyEndDt'],
                    id: 'CAPAC010SrchRltGrid',
                    columns: [
                        {
                            text: 'No.',
                            dataIndex: 'rowIndex',
                            sortable: false,
                            width: 80,
                            height: 25,
                            style: 'text-align:center',
                            align: 'center',
                            // other config you need....
                            renderer: function (value, metaData, record, rowIndex) {
                                return rowIndex + 1;
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#bizDstnctnNm'),
                            flex: 1,
                            dataIndex: 'bizDscd',
                            style: 'text-align:center',
                            align: 'center',
                            code: '80015',
                            renderer: function (val) {
                                return val ? bxMsg('cbb_items.CDVAL#80015' + val) : '';
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#pdTp'),
                            flex: 1,
                            dataIndex: 'pdTpCdNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#pdTmplt'),
                            flex: 1,
                            dataIndex: 'pdTmpltNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#pdNm'),
                            flex: 1,
                            dataIndex: 'pdNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#amtTp'),
                            flex: 1,
                            dataIndex: 'amtTpCd',
                            style: 'text-align:center',
                            align: 'center',
                            code: '50026',
                            renderer: function (val) {
                                return val ? bxMsg('cbb_items.CDVAL#50026' + val) : '';
                            }
                        },
                        {
                            text: bxMsg('cbb_items.AT#acctgItmCd'),
                            flex: 1,
                            dataIndex: 'acctgItmCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#acctgItmNm'),
                            flex: 1,
                            dataIndex: 'acctgItmNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#xtnRuleNcsrYn'),
                            flex: 1,
                            dataIndex: 'xtnInfoNcsrYn',
                            style: 'text-align:center',
                            align: 'center',
                            renderer : function(val) {
                                var classNm = "s-no";


                                if(val =="Y") {
                                    classNm = "s-yes";
                                }


                                return "<span class=\"bw-sign "+classNm+"\">"+val+"</span>";
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#acctgDstnctn'),
                            flex: 1,
                            dataIndex: 'acctgDscd',
                            style: 'text-align:center',
                            align: 'center',
                            code: '51011',
                            renderer: function (val) {
                                return val ? bxMsg('cbb_items.CDVAL#51011' + val) : '';
                            }
                        },
                        {
                            xtype: 'actioncolumn',
                            width: 80,
                            align: 'center',
                            text: bxMsg('cbb_items.SCRNITM#del'),
                            style: 'text-align:center',
                            items: [
                                {
                                    //  icon: 'images/icon/x-delete-16.png'
                                    iconCls : "bw-icon i-25 i-func-trash",
                                    tooltip: bxMsg('tm-layout.delete-field'),
                                    handler: function (grid, rowIndex, colIndex, item, e, record) {
                                        that.deleteListOfSrchRlt.push(record.data);
                                        grid.store.remove(record);
                                    }
                                }
                            ]
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#aplyStartDt'),
                            dataIndex: 'aplyStartDt',
                            hidden : true
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#aplyEndDt'),
                            dataIndex: 'aplyEndDt',
                            hidden : true
                        }
                    ], // end of columns


                    // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                    gridConfig: {
                        // 셀 에디팅 플러그인
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                // 2번 클릭시, 에디팅할 수 있도록 처리
                                clicksToEdit: 2
                                , listeners: {
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
                                that.selectSrchRltGridRecord();
                            }
                        }
                    }
                });


                this.CAPAC010ExtdJrnlRlGrid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'tblNm', 'xtnAtrbtNm', 'refAtrbtDesc', 'atrbtTpCd', 'atrbtVldtnWayCd', 'vldtnRuleCntnt', 'seqNbr'],
                    id: 'CAPAC010ExtdJrnlRlGrid',
                    columns: [
                        {
                            text: 'No.',
                            dataIndex: 'rowIndex',
                            sortable: false,
                            width: 80,
                            height: 25,
                            style: 'text-align:center',
                            align: 'center',
                            // other config you need....
                            renderer: function (value, metaData, record, rowIndex) {
                                return rowIndex + 1;
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#refTbl'),
                            flex: 1,
                            dataIndex: 'tblNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#refTblNm'),
                            flex: 1,
                            dataIndex: 'tblNm',
                            style: 'text-align:center',
                            align: 'center',
                            code: 'A0050',
                            renderer: function (val) {
                                return val ? bxMsg('cbb_items.CDVAL#A0050' + val) : '';
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#refAtrbt'),
                            flex: 1,
                            dataIndex: 'xtnAtrbtNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#refAtrbtNm'),
                            flex: 1,
                            dataIndex: 'refAtrbtDesc',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#atrbtType'),
                            flex: 1,
                            dataIndex: 'atrbtTpCd',
                            style: 'text-align:center',
                            align: 'center',
                            code: '10001',
                            renderer: function (val) {
                                return val ? bxMsg('cbb_items.CDVAL#10001' + val) : '';
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#jnrzCnd'),
                            flex: 1,
                            dataIndex: 'atrbtVldtnWayCd',
                            style: 'text-align:center',
                            align: 'center',
                            code: '10002',
                            renderer: function (val) {
                                return val ? bxMsg('cbb_items.CDVAL#10002' + val) : '';
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#jnrzCndVal'),
                            flex: 1,
                            dataIndex: 'vldtnRuleCntnt',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            xtype: 'actioncolumn',
                            width: 80,
                            align: 'center',
                            text: bxMsg('cbb_items.SCRNITM#del'),
                            style: 'text-align:center',
                            items: [
                                {
                                    //  icon: 'images/icon/x-delete-16.png'
                                    iconCls : "bw-icon i-25 i-func-trash",
                                    tooltip: bxMsg('tm-layout.delete-field'),
                                    handler: function (grid, rowIndex, colIndex, item, e, record) {
                                        that.deleteListOfXtnJnrzRl.push(record.data);
                                        grid.store.remove(record);
                                    }
                                }
                            ]
                        },
                        {
                        	text: bxMsg('cbb_items.SCRNITM#seqNbr'),
                        	dataIndex: 'seqNbr',
                        	hidden : true
                        }
                    ], // end of columns


                    // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                    gridConfig: {
                        // 셀 에디팅 플러그인
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                // 2번 클릭시, 에디팅할 수 있도록 처리
                                clicksToEdit: 2
                                , listeners: {
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
                                that.selectExtdJrnlRlGridRecord();
                            }
                        }
                    }
                });
            },


            /**
             * 콤보박스 설정
             */
            setComboBoxes: function () {
                var sParam;


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPAC010-bizDscd-wrap";
                sParam.targetId = "bizDscd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                sParam.cdNbr = "80015"; // 업무구분코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPAC010-bizDscd2-wrap";
                sParam.targetId = "bizDscd2";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                sParam.cdNbr = "80015"; // 업무구분코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPAC010-amtTpCd-wrap";
                sParam.targetId = "amtTpCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                sParam.cdNbr = "50026"; // 금액유형코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPAC010-amtTpCd2-wrap";
                sParam.targetId = "amtTpCd2";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                sParam.cdNbr = "50026"; // 금액유형코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPAC010-tblNm-wrap";
                sParam.targetId = "tblNm";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                sParam.cdNbr = "A0050"; // 참조객체코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPAC010-atrbtTpCd-wrap";
                sParam.targetId = "atrbtTpCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                sParam.cdNbr = "10001"; // 속성타입코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPAC010-atrbtVldtnWayCd-wrap";
                sParam.targetId = "atrbtVldtnWayCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                sParam.cdNbr = "10002"; // 속성검증구분코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPCM010-vldtnRuleCntnt-wrap";
                sParam.targetId = "vldtnRuleCntnt";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                sParam.cdNbr = "A0112"; // 분류체계코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
            },


            /**
             * 분개규칙 그리드 설정
             */
            setSearchResult: function (data) {
                this.CAPAC010SrchRltGrid.setData(data);
            },


            /**
             * 분개규칙상세 설정
             */
            setJournalizingRuleDetail: function (data) {
                this.baseSeqNbr = data.seqNbr;
                this.xtnSeqNbr = data.seqNbr;


                this.detailAcctgDscd = data.acctgDscd;
                this.isNewBaseInfo = false;
                this.selectBusinessDistinctCodeOfDetail(data);
                this.selectProductTypeCodeOfDetail(data);
                this.selectProductTemplateCodeOfDetail(data);
                this.selectProductCodeOfDetail(data);


                this.$el.find('#journalizing-rule-detail-area [data-form-param="amtTpCd"]').val(data.amtTpCd);
                this.$el.find('#journalizing-rule-detail-area [data-form-param="acctgItmCd"]').val(data.acctgItmCd);
                this.$el.find('#journalizing-rule-detail-area [data-form-param="acctgItmNm"]').val(data.acctgItmNm);
                this.$el.find('#journalizing-rule-detail-area [data-form-param="aplyStartDt"]').val(XDate(data.aplyStartDt).toString('yyyy-MM-dd'));
                this.$el.find('#journalizing-rule-detail-area [data-form-param="aplyEndDt"]').val(XDate(data.aplyEndDt).toString('yyyy-MM-dd'));
            },


            /**
             * 분개규칙확장 그리드 설정
             */
            setExtendedJournalizingRule: function (data) {
                this.CAPAC010ExtdJrnlRlGrid.setData(data);
            },


            /**
             * 분개규칙확장 설정
             */
            setExtendedJournalizingRuleAttribute: function (data) {


                this.xtnSeqNbr = data.seqNbr;


                this.isNewXtnInfo = false;
                this.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="tblNm"]').val(data.tblNm);
                this.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="xtnAtrbtNm"]').val(data.xtnAtrbtNm);
                this.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="atrbtTpCd"]').val(data.atrbtTpCd);
                this.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="atrbtVldtnWayCd"]').val(data.atrbtVldtnWayCd);
                
                this.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="refAtrbtDesc"]').val(data.refAtrbtDescCntnt);


                this.setJournalizingCondition(data.atrbtVldtnWayCd);


                this.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="vldtnRuleCntnt"]').val(data.vldtnRuleCntnt);
                this.$el.find('#extended-journalizing-rule-attribute-area .CAPCM010-vldtnRuleCntnt-wrap').val(data.vldtnRuleCntnt);
            },


            /**
             * 분개조건설정
             */
            setJournalizingCondition: function (code) {
                this.$inputVldtnRuleCntnt.val("");


                if(code == 'C') {
                    this.$divVldtnRuleCntnt.addClass('add-btn');
                    this.$buttonCodeSearch.show();
                    this.$inputVldtnRuleCntnt.show();
                    this.$selectVldtnRuleCntnt.hide();
                } else if(code == 'T') {
                    this.$divVldtnRuleCntnt.removeClass('add-btn');
                    this.$buttonCodeSearch.hide();
                    this.$inputVldtnRuleCntnt.hide();
                    this.$selectVldtnRuleCntnt.show();
                } else {                 // others
                    this.$divVldtnRuleCntnt.removeClass('add-btn');
                    this.$buttonCodeSearch.hide();
                    this.$inputVldtnRuleCntnt.show();
                    this.$selectVldtnRuleCntnt.hide();
                }
            },


            /**
             * 조회조건 초기화
             */
            resetSearchCondition: function () {
                this.$el.find('#search-condition-area [data-form-param="bizDscd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#search-condition-area [data-form-param="pdTpCd"]').empty();
                this.$el.find('#search-condition-area [data-form-param="pdTpCd"]').val("");
                this.$el.find('#search-condition-area [data-form-param="pdTmpltCd"]').empty();
                this.$el.find('#search-condition-area [data-form-param="pdTmpltCd"]').val("");
                this.$el.find('#search-condition-area [data-form-param="pdCd"]').empty();
                this.$el.find('#search-condition-area [data-form-param="pdCd"]').val("");
                this.$el.find('#search-condition-area [data-form-param="amtTpCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#search-condition-area [data-form-param="acctgItmCd"]').val("");
                this.$el.find('#search-condition-area [data-form-param="acctgItmNm"]').val("");
            },


            /**
             * 분개규칙 초기화
             */
            resetJournalizingRuleDetail: function () {
                this.baseSeqNbr = 0;
                this.detailAcctgDscd = "";
                this.isNewBaseInfo = true;
                this.$el.find('#journalizing-rule-detail-area [data-form-param="bizDscd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#journalizing-rule-detail-area [data-form-param="pdTpCd"]').empty();
                this.$el.find('#journalizing-rule-detail-area [data-form-param="pdTpCd"]').val("");
                this.$el.find('#journalizing-rule-detail-area [data-form-param="pdTmpltCd"]').empty();
                this.$el.find('#journalizing-rule-detail-area [data-form-param="pdTmpltCd"]').val("");
                this.$el.find('#journalizing-rule-detail-area [data-form-param="pdCd"]').empty();
                this.$el.find('#journalizing-rule-detail-area [data-form-param="pdCd"]').val("");
                this.$el.find('#journalizing-rule-detail-area [data-form-param="amtTpCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#journalizing-rule-detail-area [data-form-param="acctgItmCd"]').val("");
                this.$el.find('#journalizing-rule-detail-area [data-form-param="acctgItmNm"]').val("");
                this.$el.find('#journalizing-rule-detail-area [data-form-param="aplyStartDt"]').val(getCurrentDate("yyyy-mm-dd"));
                this.$el.find('#journalizing-rule-detail-area [data-form-param="aplyEndDt"]').val("9999-12-31");
                
                this.resetExtendedJournalizingRuleAttribute();
                this.CAPAC010ExtdJrnlRlGrid.resetData();
                
            },


            /**
             * 분개규칙확장 초기화
             */
            resetExtendedJournalizingRuleAttribute: function () {
//                this.xtnSeqNbr = 0;
                this.isNewXtnInfo = true;
                this.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="tblNm"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="atrbtTpCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="atrbtVldtnWayCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="xtnAtrbtNm"]').val("");
                this.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="vldtnRuleCntnt"]').val("");
                this.$el.find('#extended-journalizing-rule-attribute-area .CAPCM010-vldtnRuleCntnt-wrap option:eq(0)').attr("selected", "selected");


                this.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="vldtnRuleCntnt"]').show();
                this.$el.find('#extended-journalizing-rule-attribute-area .CAPCM010-vldtnRuleCntnt-wrap').hide();
                this.$el.find('#extended-journalizing-rule-attribute-area #btn-vldtnRuleCntnt-search').hide();
                this.$el.find('#input-vldtnRuleCntnt-wrap').removeClass('add-btn');
            },


            /**
             * 분개규칙목록조회
             */
            inquireJournalizingRule: function () {
                var that = this;
                var sParam = {};


                // 조회 key값 set
                sParam.instCd       = $.sessionStorage('headerInstCd');
                sParam.bizDscd      = this.$el.find('#search-condition-area [data-form-param="bizDscd"]').val();
                sParam.pdTpCd       = this.$el.find('#search-condition-area [data-form-param="pdTpCd"]').val();
                sParam.pdTmpltCd    = this.$el.find('#search-condition-area [data-form-param="pdTmpltCd"]').val();
                sParam.pdCd         = this.$el.find('#search-condition-area [data-form-param="pdCd"]').val();
                sParam.amtTpCd      = this.$el.find('#search-condition-area [data-form-param="amtTpCd"]').val();
                sParam.acctgItmCd   = this.$el.find('#search-condition-area [data-form-param="acctgItmCd"]').val();
                sParam.acctgItmNm   = this.$el.find('#search-condition-area [data-form-param="acctgItmNm"]').val();


                var linkData = {"header": fn_getHeader("CAPAC0108401"), "CaJrnzRuleMgmtSvcGetJrnzRuleListIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {
                    	that.deleteListOfSrchRlt = []; // 분개규칙 삭제목록 초기화
                    	that.deleteListOfXtnJnrzRl = []; // 확장분개규칙 삭제목록 초기화
                    	that.resetJournalizingRuleDetail(); // 분개규칙상세 초기화
                    	that.CAPAC010ExtdJrnlRlGrid.resetData(); // 확장분개규칙 그리드 초기화
                    	that.resetExtendedJournalizingRuleAttribute(); // 확장분개규칙 속성 초기화


                        if (fn_commonChekResult(responseData)) {
                            var list = responseData.CaJrnzRuleMgmtSvcGetJrnzRuleListOut.jrnzRuleList;
                            var totCnt = list.length;


                            if (list != null) {
                                that.setSearchResult(list);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                            }
                        }
                    }
                });
            },


            /**
             * 분개규칙상세조회
             */
            inquireJournalizingRuleDetail: function (data) {
                var that = this;
                var sParam = {};


                // 조회 key값 set
                sParam.instCd       = $.sessionStorage('headerInstCd');
                sParam.seqNbr       = data.seqNbr;


                var linkData = {"header": fn_getHeader("CAPAC0208401"), "CaJrnzRuleMgmtSvcGetJrnzRuleDtlIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {
                    	that.resetExtendedJournalizingRuleAttribute();


                        if (fn_commonChekResult(responseData)) {
                            var data = responseData.CaJrnzRuleMgmtSvcGetJrnzRuleDtlOut;
                            var list = data.xtnAtrList;
                            var totCnt = list.length;


                            if(data != null) {
                                that.setJournalizingRuleDetail(data);
                            }


                            if(list != null) {
                                that.setExtendedJournalizingRule(list);
                                // that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totalCount)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                            }
                        }
                    }
                });
            },


            /**
             * 계정과목코드팝업
             */
            openAcctgItmSearchPopup: function () {
                var that = this;
                var param = {};


                this.popupUpAcctgItmSearch = new PopupAcctgItmSearch();
                this.popupUpAcctgItmSearch.render();
                this.popupUpAcctgItmSearch.on('popUpSetData', function (data) {
                    that.$el.find('#search-condition-area [data-form-param="acctgItmCd"]').val(data.acctgItmCd);
                    that.$el.find('#search-condition-area [data-form-param="acctgItmNm"]').val(data.acctgItmNm);
                });
            },


            /**
             * 상세쪽 계정과목코드팝업
             */
            openAcctgItmSearchPopupOfDetail: function () {
                var that = this;
                var param = {};


                this.popupUpAcctgItmSearch = new PopupAcctgItmSearch();
                this.popupUpAcctgItmSearch.render();
                this.popupUpAcctgItmSearch.on('popUpSetData', function (data) {
                    that.$el.find('#journalizing-rule-detail-area [data-form-param="acctgItmCd"]').val(data.acctgItmCd);
                    that.$el.find('#journalizing-rule-detail-area [data-form-param="acctgItmNm"]').val(data.acctgItmNm);
                    that.detailAcctgDscd = data.acctgDscd;
                });
            },


            /**
             * 참조속성팝업
             */
            openRefAtrbtSearchPopup:function () {
                var that = this;
                var param = {};


                var refObjCd = this.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="tblNm"]').val();


//                if(!refObjCd) {
//                	return;
//                }


                param.refObjCd = refObjCd;
                param.refAtrbtNm = this.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="xtnAtrbtNm"]').val();




                this.popupRefAtrbtSearch = new PopupRefAtrbtSearch(param);
                this.popupRefAtrbtSearch.render();
                this.popupRefAtrbtSearch.on('popUpSetData', function (data) {
                	that.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="tblNm"]').val(data.refObjCd);
                    that.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="xtnAtrbtNm"]').val(data.refAtrbtNm);
                });
            },


            /**
             * 코드검색 팝업
             */
            openCodeSearchPopup:function () {
                var that = this;


                this.popupCodeSearch = new PopupCodeSearch();
                this.popupCodeSearch.render();
                this.popupCodeSearch.on('popUpSetData', function (data) {
                    that.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="vldtnRuleCntnt"]').val(data.cdNbr);
                });
            },


            downloadGridDataWithExcel: function () {
                this.CAPAC010SrchRltGrid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPAC010')+"_"+getCurrentDate("yyyy-mm-dd"));
            },


            selectSrchRltGridRecord: function () {
                var selectedData = this.CAPAC010SrchRltGrid.grid.getSelectionModel().selected.items[0];


                if(!selectedData) return;


                this.inquireJournalizingRuleDetail(selectedData.data);
            },


            selectExtdJrnlRlGridRecord: function () {
                var selectedData = this.CAPAC010ExtdJrnlRlGrid.grid.getSelectionModel().selected.items[0];


                if(!selectedData) return;


                this.setExtendedJournalizingRuleAttribute(selectedData.data);
            },


            /**
             * 분개규칙 목록 삭제
             */
            saveSearchResult: function (event) {
                var that = this;

				//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var table = [];
                    var sParam = {};


                    $(that.deleteListOfSrchRlt).each(function(idx, data) {
                        var sub = {};


                        sub.instCd = $.sessionStorage('headerInstCd'); //기관코드
                        sub.seqNbr = data.seqNbr;
                        sub.acctgDscd = data.acctgDscd;
                        sub.acctgItmCd = data.acctgItmCd;
                        sub.amtTpCd = data.amtTpCd;
                        sub.aplyStartDt = data.aplyStartDt;
                        sub.aplyEndDt = data.aplyEndDt;


                        table.push(sub);
                    });


                    sParam.tblNm = table;


                    var linkData = {"header": fn_getHeader("CAPAC0208301"), "CaJrnzRuleMgmtSvcJrnzRuleBsicInfoListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                that.deleteListOfSrchRlt = [];
                                that.inquireJournalizingRule();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), saveData, this);
            },


            /**
             * 분개규칙 상세 저장
             */
            saveJournalizingRuleDetail: function (event) {
                var that = this;

				//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                function saveData() {
                    var sParam = {};
                    var srvcCd = that.isNewBaseInfo ? 'CAPAC0208101' : 'CAPAC0208201';


                    sParam.instCd       = $.sessionStorage('headerInstCd');
                    sParam.seqNbr       = that.baseSeqNbr;
                    sParam.acctgItmCd   = that.$el.find('#journalizing-rule-detail-area [data-form-param="acctgItmCd"]').val();


                    sParam.amtTpCd      = that.$el.find('#journalizing-rule-detail-area [data-form-param="amtTpCd"]').val();


                    sParam.bizDscd      = that.$el.find('#journalizing-rule-detail-area [data-form-param="bizDscd"]').val();
                    sParam.pdTpCd       = that.$el.find('#journalizing-rule-detail-area [data-form-param="pdTpCd"]').val();
                    sParam.pdTmpltCd    = that.$el.find('#journalizing-rule-detail-area [data-form-param="pdTmpltCd"]').val();
                    sParam.pdCd         = that.$el.find('#journalizing-rule-detail-area [data-form-param="pdCd"]').val();


                    sParam.acctgDscd = that.detailAcctgDscd;
                    sParam.aplyStartDt  = fn_getDateValue(that.$el.find('#journalizing-rule-detail-area [data-form-param="aplyStartDt"]').val());
                    sParam.aplyEndDt    = fn_getDateValue(that.$el.find('#journalizing-rule-detail-area [data-form-param="aplyEndDt"]').val());




                	var linkData = {"header": fn_getHeader(srvcCd), "CaJrnzRuleMgmtSvcJrnzRuleBsicInfoIO": sParam};


                	// ajax호출
                	bxProxy.post(sUrl, JSON.stringify(linkData), {
                		enableLoading: true
                		, success: function (responseData) {
                			if (fn_commonChekResult(responseData)) {
                				fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                				that.deleteList = [];
                				that.inquireJournalizingRule();
                			}
                		}   // end of suucess: fucntion
                	}); // end of bxProxy


                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);


            },


            /**
             *  분개규칙확장상세 목록 삭제
             */
            saveExtendedJournalizingRule: function (event) {
        		var that = this;

				//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                function saveData() {
                    var table = [];
                    var sParam = {};
                    var param = {};


                    $(that.deleteListOfXtnJnrzRl).each(function(idx, data) {
                        var sub = {};


                        sub.instCd = $.sessionStorage('headerInstCd'); //기관코드
                        sub.seqNbr = data.seqNbr;
                        sub.tblNm = data.tblNm;
                        sub.xtnAtrbtNm = data.xtnAtrbtNm;
                        if(idx == 0) {
                        	param = sub;
                        }


                        table.push(sub);
                    });


                    sParam.tblNm = table;


                    var linkData = {"header": fn_getHeader("CAPAC0208302"), "CaJrnzRuleMgmtSvcJrnzRuleXtnInfoListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                that.deleteListOfXtnJnrzRl = [];
                                that.inquireJournalizingRuleDetail(param);
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), saveData, this);
            },


            /**
             * 분개규칙확장상세 저장
             */
            saveExtendedJournalizingRuleAttribute: function (event) {
                var that = this;

				//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                function saveData() {
                    var sParam = {};
                    var srvcCd = that.isNewXtnInfo ? 'CAPAC0208102' : 'CAPAC0208202';
                    var chkValue = that.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="vldtnRuleCntnt"]').val();


                    var values = chkValue.split(';');


                    sParam.instCd           = $.sessionStorage('headerInstCd');
                    sParam.tblNm            = that.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="tblNm"]').val();
                    sParam.xtnAtrbtNm       = that.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="xtnAtrbtNm"]').val();
                    sParam.atrbtTpCd        = that.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="atrbtTpCd"]').val();
                    sParam.atrbtVldtnWayCd  = that.$el.find('#extended-journalizing-rule-attribute-area [data-form-param="atrbtVldtnWayCd"]').val();
                    sParam.seqNbr           = that.xtnSeqNbr;
                    sParam.valList = [];


                    if(sParam.atrbtVldtnWayCd == 'R') {
                        sParam.minVal = values[0];
                        sParam.maxVal = values[1];
                    } else if(sParam.atrbtVldtnWayCd == 'T') {
                        var value = that.$el.find('#extended-journalizing-rule-attribute-area .CAPCM010-vldtnRuleCntnt-wrap').val();
                        sParam.valList.push(value);
                    } else {
                        $(values).each(function (index, element) {
                            sParam.valList.push(element);
                        });
                    }


                    var linkData = {"header": fn_getHeader(srvcCd), "CaJrnzRuleMgmtSvcJrnzRuleXtnInfoIO": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                that.deleteListOfXtnJnrzRl = [];
                                that.inquireJournalizingRuleDetail(sParam);
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            changeJournalizingCondition: function (e) {
                var code = $(e.target).val();
                this.setJournalizingCondition(code);
            },


            /**
             * 업무 구분 코드 변경
             */
            changeBusinessDistinctCode: function () {
                var sParam = {};
                var bizDscd = this.$el.find('#search-condition-area [data-form-param="bizDscd"]').val();


                var $selectPdTpCd = this.$el.find('#search-condition-area [data-form-param="pdTpCd"]');
                var $selectPdTmpltCd = this.$el.find('#search-condition-area [data-form-param="pdTmpltCd"]');
                var $selectPdCd = this.$el.find('#search-condition-area [data-form-param="pdCd"]');


                if (bizDscd == "") {
                    //상품유형코드 초기화
                    $selectPdTpCd.empty();
                    $selectPdTpCd.val("");
                } else {
                    //combobox 정보 셋팅
                    sParam.className = "CAPAC010-pdTpCd-wrap";
                    sParam.targetId = "pdTpCd";
                    sParam.nullYn = "Y";
                    //inData 정보 셋팅
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                    sParam.bizDscd = bizDscd;
                    sParam.pdTpCd = "";
                    sParam.pdTmpltCd = "";
                    sParam.pdCd = "";
                    //상품유형코드 콤보데이터 load
                    fn_getPdCodeList(sParam, this);
                }


                //상품템플릿코드, 상품코드 초기화
                $selectPdTmpltCd.empty();
                $selectPdTmpltCd.val("");


                $selectPdCd.empty();
                $selectPdCd.val("");
            },


            /**
             * 상품 유형 코드 변경
             */
            changeProductTypeCode: function () {
                var sParam = {};
                var bizDscd = this.$el.find('#search-condition-area [data-form-param="bizDscd"]').val();
                var pdTpCd = this.$el.find('#search-condition-area [data-form-param="pdTpCd"]').val();


                var $selectPdTmpltCd = this.$el.find('#search-condition-area [data-form-param="pdTmpltCd"]');
                var $selectPdCd = this.$el.find('#search-condition-area [data-form-param="pdCd"]');




                if (pdTpCd == "") {
                    //상품템플릿코드 초기화
                    $selectPdTmpltCd.empty();
                    $selectPdTmpltCd.val("");
                } else {
                    //combobox 정보 셋팅
                    sParam.className = "CAPAC010-pdTmpltCd-wrap";
                    sParam.targetId = "pdTmpltCd";
                    sParam.nullYn = "Y";
                    //inData 정보 셋팅
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                    sParam.bizDscd = bizDscd;
                    sParam.pdTpCd = pdTpCd;
                    sParam.pdTmpltCd = "";
                    sParam.pdCd = "";
                    //상품템플릿코드 콤보데이터 load
                    fn_getPdCodeList(sParam, this);
                }


                //상품코드 초기화
                $selectPdCd.empty();
                $selectPdCd.val("");
            },


            /**
             * 상품 템플릿 코드 변경
             */
            changeProductTemplateCode: function () {
                var sParam = {};
                // 상품대분류코드
                var bizDscd = this.$el.find('#search-condition-area [data-form-param="bizDscd"]').val();
                var pdTpCd = this.$el.find('#search-condition-area [data-form-param="pdTpCd"]').val();
                var pdTmpltCd = this.$el.find('#search-condition-area [data-form-param="pdTmpltCd"]').val();
                var $selectPdCd = this.$el.find('#search-condition-area [data-form-param="pdCd"]');


                if (pdTmpltCd == "") {
                    //상품템플릿코드 초기화
                    $selectPdCd.empty();
                    $selectPdCd.val("");
                } else {
                    //combobox 정보 셋팅
                    sParam.className = "CAPAC010-pdCd-wrap";
                    sParam.targetId = "pdCd";
                    sParam.nullYn = "Y";
                    //inData 정보 셋팅
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                    sParam.bizDscd = bizDscd;
                    sParam.pdTpCd = pdTpCd;
                    sParam.pdTmpltCd = pdTmpltCd;
                    sParam.pdCd = "";
                    //상품중분류코드 콤보데이터 load
                    fn_getPdCodeList(sParam, this);
                }
            },


            /**
             * 업무 구분 코드 변경
             */
            selectBusinessDistinctCodeOfDetail: function (data) {
                var that = this;
                var sParam = {};
                var bizDscd = data.bizDscd ? data.bizDscd : this.$el.find('#journalizing-rule-detail-area [data-form-param="bizDscd"]').val();
                var $selectPdTpCd = this.$el.find('#journalizing-rule-detail-area [data-form-param="pdTpCd"]');
                var $selectPdTmpltCd = this.$el.find('#journalizing-rule-detail-area [data-form-param="pdTmpltCd"]');
                var $selectPdCd = this.$el.find('#journalizing-rule-detail-area [data-form-param="pdCd"]');


                if(data.bizDscd) {
                    that.$el.find('#journalizing-rule-detail-area [data-form-param="bizDscd"]').val(data.bizDscd);
                }


                if (fn_isNull(bizDscd)) {
                    //상품유형코드 초기화
                    $selectPdTpCd.empty();
                    $selectPdTpCd.val("");
                } else {
                    //combobox 정보 셋팅
                    sParam.className = "CAPAC010-pdTpCd2-wrap";
                    sParam.targetId = "pdTpCd2";
                    sParam.nullYn = "Y";
                    sParam.viewType = "ValNm";
                    //inData 정보 셋팅
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                    sParam.bizDscd = bizDscd;
                    sParam.pdTpCd = "";
                    sParam.pdTmpltCd = "";
                    sParam.pdCd = "";
                    //상품유형코드 콤보데이터 load
                    fn_getPdCodeList(sParam, this, null, function () {
                        if(data.pdTpCd) {
                            that.$el.find('#journalizing-rule-detail-area [data-form-param="pdTpCd"]').val(data.pdTpCd);
                        }
                    });
                }


                //상품템플릿코드, 상품코드 초기화
                $selectPdTmpltCd.empty();
                $selectPdTmpltCd.val("");


                $selectPdCd.empty();
                $selectPdCd.val("");
            },


            /**
             * 상품 유형 코드 변경
             */
            selectProductTypeCodeOfDetail: function (data) {
                var that = this;
                var sParam = {};
                var bizDscd = data.bizDscd ? data.bizDscd : this.$el.find('#journalizing-rule-detail-area [data-form-param="bizDscd"]').val();
                var pdTpCd = data.pdTpCd ? data.pdTpCd : this.$el.find('#journalizing-rule-detail-area [data-form-param="pdTpCd"]').val();
                var $selectPdTmpltCd = this.$el.find('#journalizing-rule-detail-area [data-form-param="pdTmpltCd"]');
                var $selectPdCd = this.$el.find('#journalizing-rule-detail-area [data-form-param="pdCd"]');


                if (fn_isNull(pdTpCd)) {
                    //상품템플릿코드 초기화
                    $selectPdTmpltCd.empty();
                    $selectPdTmpltCd.val("");
                } else {
                    //combobox 정보 셋팅
                    sParam.className = "CAPAC010-pdTmpltCd2-wrap";
                    sParam.targetId = "pdTmpltCd2";
                    sParam.nullYn = "Y";
                    sParam.viewType = "ValNm";
                    //inData 정보 셋팅
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                    sParam.bizDscd = bizDscd;
                    sParam.pdTpCd = pdTpCd;
                    sParam.pdTmpltCd = "";
                    sParam.pdCd = "";
                    //상품템플릿코드 콤보데이터 load
                    fn_getPdCodeList(sParam, this, null, function () {
                        if(data.pdTmpltCd) {
                            that.$el.find('#journalizing-rule-detail-area [data-form-param="pdTmpltCd"]').val(data.pdTmpltCd);
                        }
                    });
                }


                //상품코드 초기화
                $selectPdCd.empty();
                $selectPdCd.val("");
            },


            /**
             * 상품 템플릿 코드 변경
             */
            selectProductTemplateCodeOfDetail: function (data) {
                var that = this;
                var sParam = {};
                var bizDscd = data.bizDscd ? data.bizDscd : this.$el.find('#journalizing-rule-detail-area [data-form-param="bizDscd"]').val();
                var pdTpCd = data.pdTpCd ? data.pdTpCd : this.$el.find('#journalizing-rule-detail-area [data-form-param="pdTpCd"]').val();
                var pdTmpltCd = data.pdTmpltCd ? data.pdTmpltCd : this.$el.find('#journalizing-rule-detail-area [data-form-param="pdTmpltCd"]').val();
                var $selectPdCd = this.$el.find('#journalizing-rule-detail-area [data-form-param="pdCd"]');


                if (fn_isNull(pdTmpltCd)) {
                    //상품템플릿코드 초기화
                    $selectPdCd.empty();
                    $selectPdCd.val("");
                } else {
                    //combobox 정보 셋팅
                    sParam.className = "CAPAC010-pdCd2-wrap";
                    sParam.targetId = "pdCd2";
                    sParam.nullYn = "Y";
                    sParam.viewType = "ValNm";
                    //inData 정보 셋팅
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                    sParam.bizDscd = bizDscd;
                    sParam.pdTpCd = pdTpCd;
                    sParam.pdTmpltCd = pdTmpltCd;
                    sParam.pdCd = "";
                    //상품중분류코드 콤보데이터 load
                    fn_getPdCodeList(sParam, this, null, function () {
                        if(data.pdCd) {
                            that.$el.find('#journalizing-rule-detail-area [data-form-param="pdCd"]').val(data.pdCd);
                        }
                    });
                }
            },


            selectProductCodeOfDetail: function (data) {
                this.$el.find('#journalizing-rule-detail-area [data-form-param="pdCd"]').val(data.pdCd);
            },


            toggleSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find("#search-condition-area"), this.$el.find("#btn-search-condition-toggle"));
            },


            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find("#search-result-area"), this.$el.find("#btn-search-result-toggle"));
            },


            toggleJournalizingRuleDetail: function () {
                fn_pageLayerCtrl(this.$el.find("#journalizing-rule-detail-area"), this.$el.find("#btn-journalizing-rule-detail-toggle"));
            },


            toggleExtendedJournalizingRule: function () {
                fn_pageLayerCtrl(this.$el.find("#extended-journalizing-rule-area"), this.$el.find("#btn-extended-journalizing-rule-toggle"));
            },


            toggleExtendedJournalizingRuleAttribute: function () {
                fn_pageLayerCtrl(this.$el.find("#extended-journalizing-rule-attribute-area"), this.$el.find("#btn-extended-journalizing-rule-attribute-toggle"));
            }
        });


        return CAPAC010View;
    }
);


