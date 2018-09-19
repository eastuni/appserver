define(
    [
        'bx/common/config',
        'text!app/views/page/CAPCM/302/_CAPCM302.html',
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
        var CAPCM302View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPCM302-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'click #btn-search-condition-reset': 'resetSearchCondition',
                'click #btn-search-condition-inquire': 'inquireGroupData',


                'click #btn-search-result-excel': 'downloadGridDataWithExcel',


                'click #btn-base-attribute-add': 'openTextStylePage',
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
            },


            /**
             * render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.createGrid();
                this.setComboBoxes();
                this.$el.find(".CAPCM302Grid").html(this.CAPCM302Grid.render({'height': CaGridHeight}));

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPCM302-wrap #btn-base-attribute-save')
                                    			   ]);
                return this.$el;
            },


            createGrid: function () {
                var that = this;


                this.CAPCM302Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'buttonTmpltDscd', 'buttonStyleNm', 'buttonSeqNbr'],
                    id: 'CAPCM302Grid',
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
                            dataIndex: 'buttonTmpltDscd',
                            style: 'text-align:center',
                            align: 'center',
                            code: 'A0571',
                            renderer: function (value) {
                                return value ? bxMsg('cbb_items.CDVAL#A0571' + value) : '';
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#style'),
                            flex: 1,
                            dataIndex: 'buttonStyleNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#buttonSeqNbr'),
                            flex: 1,
                            dataIndex: 'buttonSeqNbr',
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
                sParam.className = "CAPCM302-cndGrp-wrap";
                sParam.targetId = "cndGrp";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A0571";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPCM302-cndStyle-wrap";
                sParam.targetId = "cndStyle";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A0730";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPCM302-atrbtStyle-wrap";
                sParam.targetId = "atrbtStyle";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A0730";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
            },


            selectGridRecord: function () {


            },


            resetSearchCondition: function () {


            },


            inquireGroupData: function (param) {
                var that = this;
                var sParam = {};


                sParam.instCd           = $.sessionStorage('headerInstCd');
                sParam.buttonTmpltDscd  = this.$el.find('.CAPCM302-cndGrp-wrap').val()== null ? "": this.$el.find('.CAPCM302-cndGrp-wrap').val();
                sParam.buttonStyleNm    = this.$el.find('.CAPCM302-cndStyle-wrap').val()== null ? "" :this.$el.find('.CAPCM302-cndStyle-wrap').val();


                var linkData = {"header": fn_getHeader("CAPCM3028400"), "CaStyleSvcButtonStyleIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var list = responseData.CaStyleSvcButtonStyleList.tblNm;
                            var totCnt = list.length;


                            that.CAPCM302Grid.setData(list);
                            that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            downloadGridDataWithExcel: function () {


            },


            openTextStylePage: function () {
                this.$el.trigger({
                    type : 'open-conts-page',
                    pageHandler : 'CAPCM309',
                    pageDPName : bxMsg('cbb_items.SCRN#CAPCM309'),
                    pageInitialize : true,
                    pageRenderInfo : {


                    }
                });
            },


            saveTextGroup: function () {


            },


            toggleSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find('#search-condition-area'), this.$el.fin('#btn-search-condition-toggle'));
            },


            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.fin('#btn-search-result-toggle'));
            },


            toggleBaseAttribute: function () {
                fn_pageLayerCtrl(this.$el.find("#base-attribute-area"), this.$el.find("#btn-base-attribute-toggle"));
            }
        }); // end of Backbone.View.extend({


        return CAPCM302View;
    } // end of define function
); // end of define


