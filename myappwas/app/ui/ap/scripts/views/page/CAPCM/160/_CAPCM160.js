define(
    [
        'bx/common/config',
        'text!app/views/page/CAPCM/160/_CAPCM160.html',
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
        var CAPCM160View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section',
            // 클래스이름 설정
            className: 'bx-container CAPCM160-page',
            // 탬플릿 설정
            templates: {
                'tpl': tpl
            },
            // 이벤트 설정
            events: {
                'click #btn-search-result-save': 'saveSearchResult',
                'click #btn-base-attribute-save': 'saveBaseAttribute',


                'click #btn-search-condition-inquire': 'inquireReferenceAttribute',


                'click #btn-multi-language': 'openMultiLanguagePage',


                'click #btn-search-condition-reset': 'resetSearchCondition',
                'click #btn-base-attribute-reset': 'resetBaseAttribute',


                'click #btn-search-result-excel': 'downloadGridDataWithExcel',


                'click #btn-search-condition-toggle': 'toggleSearchCondition',
                'click #btn-search-result-toggle': 'toggleSearchResult',
                'click #btn-base-attribute-toggle': 'toggleBaseAttribute'
            }


            /**
             * initialize
             */
            , initialize: function (initData) {
                this.deleteList = [];


                $.extend(this, initData);


                this.createGrid();
            },


            /**
             * render
             */
            render: function () {
                this.$el.html(this.tpl());
                this.$el.find("#CAPCM160Grid").html(this.CAPCM160Grid.render({'height': CaGridHeight}));


                this.setComboBoxes();
                
              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPCM160-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPCM160-wrap #btn-base-attribute-save')
                                    			   ]);

                return this.$el;
            },


            createGrid: function () {
                var that = this;


                that.CAPCM160Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'refObjCd', 'refObjCd', 'refAtrbtNm', 'refAtrbtDescCntnt'],
                    id: 'CAPCM160Grid',
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
                            text: bxMsg('cbb_items.AT#refObjCd'),
                            flex: 1,
                            dataIndex: 'refObjCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#refObjNm'),
                            flex: 1,
                            dataIndex: 'refObjCd',
                            style: 'text-align:center',
                            align: 'center',
                            code: 'A0050',
                            renderer: function (val) {
                                return val ? bxMsg('cbb_items.CDVAL#A0050' + val) : '';
                            }
                        },
                        {
                            text: bxMsg('cbb_items.AT#refAtrbtNm'),
                            flex: 1,
                            dataIndex: 'refAtrbtNm',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#loginLngRefAtrbtNm'),
                            flex: 1,
                            dataIndex: 'refAtrbtDescCntnt',
                            style: 'text-align:center',
                            align: 'left'
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
                                that.selectGridRecord();
                            }
                        }
                    }
                });
            },


            setComboBoxes: function () {
                var sParam = {};


                sParam = {};
                sParam.className = "CAPCM160-refObjNm-wrap";
                sParam.targetId = "refObjNm";
                sParam.nullYn = "Y";
                sParam.cdNbr = "A0050";
                fn_getCodeList(sParam, this);   // 참조객체유형코드


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM160-refObjNm2-wrap";
                sParam.targetId = "refObjNm2";
                sParam.nullYn = "Y";
                sParam.cdNbr = "A0050";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 참조객체유형코드
            },


            setBaseAttribute: function (data) {
                this.$el.find('#base-attribute-area [data-form-param="refObjNm"]').val(data.refObjCd);
                this.$el.find('#base-attribute-area [data-form-param="refObjCd"]').val(data.refObjCd);
                this.$el.find('#base-attribute-area [data-form-param="refAtrbtNm"]').val(data.refAtrbtNm);
                this.$el.find('#base-attribute-area [data-form-param="loginLngRefAtrbtNm"]').val(data.refAtrbtDescCntnt);
            },


            selectGridRecord: function () {
                if(this.CAPCM160Grid.grid.getSelectionModel().selected.items[0]) {
                    var selectedData = this.CAPCM160Grid.grid.getSelectionModel().selected.items[0].data;
                    this.setBaseAttribute(selectedData);
                }
            },


            resetSearchCondition: function () {
                this.$el.find('#search-condition-area [data-form-param="refObjNm"] option:eq(0)').attr('selected', 'selected');
                this.$el.find('#search-condition-area [data-form-param="refAtrbtNm"]').val("");
                this.$el.find('#search-condition-area [data-form-param="loginLngRefAtrbtNm"]').val("");
            },


            resetBaseAttribute: function () {
                this.$el.find('#base-attribute-area [data-form-param="refObjNm"] option:eq(0)').attr('selected', 'selected');
                this.$el.find('#base-attribute-area [data-form-param="refObjCd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="refAtrbtNm"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="loginLngRefAtrbtNm"]').val("");
            },


            inquireReferenceAttribute: function () {
                // header 정보 set
                var that = this;
                var sParam = {};


                sParam.refObjCd     = this.$el.find('#search-condition-area [data-form-param="refObjNm"]').val();
                sParam.refAtrbtNm   = this.$el.find('#search-condition-area [data-form-param="refAtrbtNm"]').val();
                sParam.refAtrbtDescCntnt = this.$el.find('#search-condition-area [data-form-param="loginLngRefAtrbtNm"]').val();


                console.log(sParam);


                var linkData = {"header": fn_getHeader("CAPCM1608402"), "CaRefAtrbtMgmtSvcIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var refAtrbtList = responseData.CaRefAtrbtMgmtSvcOut.refAtrbtList;
                            var totCnt = refAtrbtList.length;


                            // 서비스 입력항목
                            that.resetBaseAttribute();
                            if (refAtrbtList != null || refAtrbtList.length > 0) {
                                that.CAPCM160Grid.setData(refAtrbtList);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");


                                // 삭제 로우 초기화
                                that.deleteList = [];
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            /**
             * 다국어 화면으로 이동
             */
            openMultiLanguagePage: function () {
                this.$el.trigger({
                    type: 'open-conts-page',
                    pageHandler: 'CAPCM190',
                    pageDPName: bxMsg('cbb_items.SCRN#CAPCM190'),
                    pageInitialize: true,
                    pageRenderInfo: {
                        trnsfrKndCd : "AT_NAME", // 서비스명
                        trnsfrOriginKeyVal : this.$el.find('#base-attribute-area [data-form-param="refAtrbtNm"]').val() // 서비스코드
                    }
                });
            },


            saveSearchResult: function (event) {
                if(this.deleteList.length < 1) return;


                var that = this;
                
              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }

                function saveData() {
                    var deleteList = [];
                    var sParam = {};


                    $(that.deleteList).each(function(idx, data) {
                        var sub = {};
                        console.log(data);
                        sub.refObjCd        = data.refObjCd;
                        sub.refAtrbtNm      = data.refAtrbtNm;
                        sub.refAtrbtDescCntnt    = data.refAtrbtDescCntnt;
                        deleteList.push(sub);
                    });


                    console.log(deleteList);


                    sParam.refAtrbtList = deleteList;


                    var linkData = {"header": fn_getHeader("CAPCM1608301"), "CaRefAtrbtMgmtSvcIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                // 재조회
                                that.inquireReferenceAttribute();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), saveData, this);
            },


            saveBaseAttribute: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var sParam = {};
                    var subParam = {};
                    sParam.refAtrbtList = [];


                    subParam.refObjCd        = that.$el.find('#base-attribute-area [data-form-param="refObjNm"]').val();
                    subParam.refAtrbtNm      = that.$el.find('#base-attribute-area [data-form-param="refAtrbtNm"]').val();
                    subParam.refAtrbtDescCntnt    = that.$el.find('#base-attribute-area [data-form-param="loginLngRefAtrbtNm"]').val();
                    sParam.refAtrbtList.push(subParam);


                    console.log(sParam);


                    var linkData = {"header": fn_getHeader("CAPCM1608101"), "CaRefAtrbtMgmtSvcIn": sParam};


                    //ajax 호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true,
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                that.resetBaseAttribute();
                            }
                        }
                    });
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            downloadGridDataWithExcel: function () {
                this.CAPCM160Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM160')+"_"+getCurrentDate("yyyy-mm-dd"));
            },


            toggleSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find('#search-condition-area'), this.$el.find('#btn-search-condition-toggle'));
            },


            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find('#btn-search-result-toggle'));
            },


            toggleBaseAttribute: function () {
                fn_pageLayerCtrl(this.$el.find('#base-attribute-area'), this.$el.find('#btn-base-attribute-toggle'));
            }
        }); // end of Backbone.View.extend({


        return CAPCM160View;
    } // end of define function
)
; // end of define
