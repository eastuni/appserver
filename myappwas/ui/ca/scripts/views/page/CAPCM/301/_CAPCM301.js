define(
    [
        'bx/common/config',
        'text!app/views/page/CAPCM/301/_CAPCM301.html',
        'bx-component/ext-grid/_ext-grid'
    ]
    , function (
        config,
        tpl,
        ExtGrid
    ) {


        /**
         * Backbone
         */
        var CAPCM301View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPCM301-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'click #btn-search-condition-reset': 'resetSearchCondition',
                'click #btn-search-condition-inquire': 'inquireGroupData',


                'click #btn-search-result-excel': 'downloadGridDataWithExcel',


                'click #btn-base-attribute-save': 'saveTextGroup',


                'click #btn-search-condition-toggle': 'toggleSearchCondition',
                'click #btn-search-result-toggle': 'toggleSearchResult',
                'click #btn-base-attribute-toggle': 'toggleBaseAttribute'
            },


            /**
             * initialize
             */
            initialize: function (initData) {
                $.extend(this, initData);


                this.txtSeqNbr = 0;


                this.createGrid();
            },


            /**
             * render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find(".CAPCM301Grid").html(this.CAPCM301Grid.render({'height': CaGridHeight}));
                this.setComboBoxes();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPCM301-wrap #btn-base-attribute-save')
                                    			   ]);
                return this.$el;
            },


            createGrid: function () {
                var that = this;


                this.CAPCM301Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'txtTmpltDscd', 'txtStyleDscd', 'txtStyleNm', 'txtSeqNbr'],
                    id: 'CAPCM301Grid',
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
                            text: bxMsg('cbb_items.SCRNITM#grp'),
                            flex: 1,
                            dataIndex: 'txtTmpltDscd',
                            style: 'text-align:center',
                            align: 'center',
                            code: 'A0567',
                            renderer: function (value) {
                                return value ? bxMsg('cbb_items.CDVAL#A0567' + value) : '';
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#category'),
                            flex: 1,
                            dataIndex: 'txtStyleDscd',
                            style: 'text-align:center',
                            align: 'center',
                            code: 'A0728',
                            renderer: function (value) {
                                return value ? bxMsg('cbb_items.CDVAL#A0728' + value) : '';
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#style'),
                            flex: 1,
                            dataIndex: 'txtStyleNm',
                            style: 'text-align:center',
                            align: 'center'
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
                                that.selectGridRecord();
                            }
                        }
                    }
                });
            },


            setComboBoxes: function () {
                var sParam = {};


                // combobox 정보 셋팅
                sParam.className = "CAPCM301-cndGrp-wrap";
                sParam.targetId = "cndGrp";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A0570";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPCM301-cndStyle-wrap";
                sParam.targetId = "cndStyle";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A0728";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPCM301-atrbtStyle-wrap";
                sParam.targetId = "atrbtStyle";
                sParam.cdNbr = "A0728";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
            },


            setBaseAttribute: function (data) {
                console.log(data);
                var group = data.txtTmpltDscd ? bxMsg('cbb_items.CDVAL#A0570' + data.txtTmpltDscd) : '';
                var category = data.txtStyleDscd ? bxMsg('cbb_items.CDVAL#A0567' + data.txtStyleDscd) : '';


                this.txtTmpltDscd   = data.txtTmpltDscd;
                this.txtStyleDscd   = data.txtStyleDscd;
                this.txtSeqNbr      = data.txtSeqNbr;


                this.$el.find('#base-attribute-area [data-form-param="grp"]').val(group);
                this.$el.find('#base-attribute-area [data-form-param="category"]').val(category);
                this.$el.find('.CAPCM301-atrbtStyle-wrap').val(data.txtStyleNm);
            },


            selectGridRecord: function () {
                var selectedData = this.CAPCM301Grid.grid.getSelectionModel().selected.items[0].data;
                this.setBaseAttribute(selectedData);
            },


            resetSearchCondition: function () {
                this.$el.find('.CAPCM301-cndGrp-wrap option:eq(0)').prop('selected', true);
                this.$el.find('.CAPCM301-cndStyle-wrap option:eq(0)').prop('selected', true);
            },


            resetBaseAttribute: function () {
                this.$el.find('#base-attribute-area [data-form-param="grp"]').val('');
                this.$el.find('#base-attribute-area [data-form-param="category"]').val('');
                this.$el.find('.CAPCM301-atrbtStyle-wrap option:eq(0)').prop('selected', true);
            },


            inquireGroupData: function () {
                var that = this;
                var sParam = {};


                sParam.instCd       = $.sessionStorage('headerInstCd');
                sParam.txtTmpltDscd = this.$el.find('.CAPCM301-cndGrp-wrap').val();
                sParam.txtStyleNm   = this.$el.find('.CAPCM301-cndStyle-wrap').val();


                var linkData = {"header": fn_getHeader("CAPCM3018400"), "CaStyleSvcTextStyleIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var list = responseData.CaStyleSvcTextStyleList.tblNm;
                            var totCnt = list.length;


                            that.CAPCM301Grid.setData(list);
                            that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            downloadGridDataWithExcel: function () {
                this.CAPCM301Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM301')+"_"+getCurrentDate("yyyy-mm-dd"));
            },


            saveTextGroup: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var sParam = {};


                    sParam.instCd           = $.sessionStorage('headerInstCd');
                    sParam.txtTmpltDscd     = that.txtTmpltDscd;
                    sParam.txtStyleDscd	    = that.txtStyleDscd;
                    sParam.txtSeqNbr        = that.txtSeqNbr;
                    sParam.txtStyleNm       = that.$el.find('.CAPCM301-atrbtStyle-wrap').val();


                    console.log(sParam);


                    if(fn_isNull(sParam.txtStyleNm)) {
                        fn_alertMessage("", bxMsg("cbb_err_msg.ABRVTN#failed"));
                        return;
                    }


                    var linkData = {"header": fn_getHeader("CAPCM3018200"), "CaStyleSvcTextStyleIO": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            toggleSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find('#search-condition-area'), this.$el.find('#btn-search-condition-toggle'));
            },


            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find('#btn-search-result-toggle'));
            },


            toggleBaseAttribute: function () {
                fn_pageLayerCtrl(this.$el.find("#base-attribute-area"), this.$el.find("#btn-base-attribute-toggle"));
            }
        }); // end of Backbone.View.extend({


        return CAPCM301View;
    } // end of define function
); // end of define


