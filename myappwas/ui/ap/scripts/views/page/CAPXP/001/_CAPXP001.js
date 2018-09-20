define(
    [
        'bx/common/config', 
        'text!app/views/page/CAPXP/001/_CAPXP001.html',
        'bx-component/ext-grid/_ext-grid',
        'bx/common/common-info'
    ]
    , function (
        config,
        tpl,
        ExtGrid,
        PopupCodeSearch,
        PopupClassSearch,
        commonInfo
    ) {


        /**
         * Backbone
         */
        var CAPXP001View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section',
            // 클래스이름 설정
            className: 'bx-container CAPXP001-page',
            // 탬플릿 설정
            templates: {
                'tpl': tpl
            },
            // 이벤트 설정
            events: {
                'click #btn-base-attribute-save': 'saveBaseAttribute',


                'click #btn-search-condition-inquire': 'inquireStandardAttribute',


                'click #btn-search-condition-reset': 'resetSearchCondition',
                'click #btn-base-attribute-reset': 'resetBaseAttribute',


                'click #btn-search-result-save': 'saveSearchResult',
                'click #btn-search-result-excel': 'downloadGridDataWithExcel',


                'click #btn-search-condition-toggle': 'toggleSearchCondition',
                'click #btn-additional-search-condition-toggle': 'toggleAdditionalSearchCondition',
                'click #btn-search-result-toggle': 'toggleSearchResult',
                'click #btn-base-attribute-toggle': 'toggleBaseAttribute',
				'keydown #searchKey' : 'fn_enter'
            }


            /**
             * initialize
             */
            , initialize: function (initData) {
                this.deleteList = [];
                this.isBaseAttributeModified = false;


                $.extend(this, initData);


                this.createGrid();
            },


            /**
             * render
             */
            render: function () {
                this.$el.html(this.tpl());
                this.$el.find("#CAPXP001Grid").html(this.CAPXP001Grid.render({'height': CaGridHeight}));


                this.$divValidationRule     = this.$el.find('#base-attribute-area #div-validation-rule');
                this.$selectValidationRule  = this.$el.find('#base-attribute-area #CAPXP001-stsCd-wrap');
                this.$inputValidationRule   = this.$el.find('#base-attribute-area #input-validation-rule');
                this.$buttonCodeSearch      = this.$el.find('#base-attribute-area #btn-code-search');

                this.setDatePicker();
                
                // 콤보데이터 로딩
                this.setCode("CAPXP001-stsCd-wrap", "stsCd", "ValNm", "A0439");
                this.setCode("CAPXP001-safUpdtYn-wrap", "safUpdtYn", "ValNm", "10000");
                this.setCode("CAPXP001-timeoutRgstrnYn-wrap", "timeoutRgstrnYn", "ValNm", "10000");
                this.setCode("CAPXP001-cnclOrgnlTxChkYn-wrap", "cnclOrgnlTxChkYn", "ValNm", "10000");
                this.setCode("CAPXP001-extrnlMsngNbrChkYn-wrap", "extrnlMsngNbrChkYn", "ValNm", "10000");
                this.setCode("CAPXP001-extrnlDplctnChkYn-wrap", "extrnlDplctnChkYn", "ValNm", "10000");
                this.setCode("CAPXP001-hndlngMgmtMsgPrcsngYn-wrap", "hndlngMgmtMsgPrcsngYn", "ValNm", "10000");

                //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPXP001-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPXP001-wrap #btn-base-attribute-save')
                                    			   ]);

                return this.$el;
            },
            
            setCode : function (className, targetId, viewType, cdNbr) {
            	var sParam;
                sParam = {};                    
                //조건유형 combobox
                sParam.className = className;
	        	sParam.targetId = targetId;
                sParam.viewType = viewType;
                //inData 정보 셋팅
                sParam.cdNbr = cdNbr;
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
            },

            createGrid: function () {
                var that = this;


                that.CAPXP001Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'extrnlTxCd', 'stsCd', 'aplyStartDt', 'extrnlInstCd', 'extrnlBizDscd', 'extrnlSubBizDscd',
                        'jointNetworkClCd', 'jointNetworkTxDscd', 'hndlngOpnDscd', 'txDscd', 'dpstWhdrwlDscd', 'srvcCallBfAfHstCreateCd', 'srvcCallBfAfCommitCd',
                        'safCreateCd', 'safUpdtYn', 'timeoutRgstrnYn', 'timeoutScnd', 'cnclOrgnlTxChkYn',
                        'cnclOrgnlTxUpdtCd', 'extrnlMsngNbrChkYn', 'extrnlDplctnChkYn', 'hndlngMgmtMsgPrcsngYn',
                        'xtnParmOneYn', 'xtnParmTwoYn', 'xtnParmThreeYn',
                        'xtnParmFourYn', 'xtnParmFiveYn', 'xtnParmSixYn', 'xtnParmSevenYn', 'xtnParmEightYn',
                        'xtnParmNineYn', 'xtnParmTenYn', 'delYn'],
                    id: 'CAPXP001Grid',
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
                            text: bxMsg('cbb_items.AT#extrnlTxCd'),
                            flex: 1,
                            dataIndex: 'extrnlTxCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#stsCd'),
                            flex: 1,
                            dataIndex: 'stsCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#aplyStartDt'),
                            flex: 1,
                            dataIndex: 'aplyStartDt',
                            style: 'text-align:center',
                            align: 'center',
                        },
                        {
                            text: bxMsg('cbb_items.AT#extrnlInstCd'),
                            flex: 1,
                            dataIndex: 'extrnlInstCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#extrnlBizDscd'),
                            flex: 1,
                            dataIndex: 'extrnlBizDscd',
                            style: 'text-align:center',
                            align: 'center',
                        },
                        {
                            text: bxMsg('cbb_items.AT#extrnlSubBizDscd'),
                            flex: 1,
                            dataIndex: 'extrnlSubBizDscd',
                            style: 'text-align:center',
                            align: 'center',
                        },
                        {
                            text: bxMsg('cbb_items.AT#jointNetworkClCd'),
                            flex: 1,
                            dataIndex: 'jointNetworkClCd',
                            style: 'text-align:center',
                            align: 'center',
                            code: 'A1129',
                        },
                        {
                            text: bxMsg('cbb_items.AT#jointNetworkTxDscd'),
                            flex: 1,
                            dataIndex: 'jointNetworkClCd',
                            style: 'text-align:center',
                            align: 'center',
                            code: 'A1129',
                        },
                        {
                            xtype: 'actioncolumn',
                            width: 80,
                            align: 'center',
                            text: bxMsg('cbb_items.AT#delYn'),
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


            setBaseAttribute: function (data) {
                this.$el.find('#base-attribute-area [data-form-param="extrnlTxCd"]').val(data.extrnlTxCd);
                this.$el.find('#base-attribute-area [data-form-param="stsCd"]').val(data.stsCd);
                this.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]').val(XDate(data.aplyStartDt).toString('yyyy-MM-dd'));
                this.$el.find('#base-attribute-area [data-form-param="extrnlInstCd"]').val(data.extrnlInstCd);
                
                this.$el.find('#base-attribute-area [data-form-param="extrnlBizDscd"]').val(data.extrnlBizDscd);
                this.$el.find('#base-attribute-area [data-form-param="extrnlSubBizDscd"]').val(data.extrnlSubBizDscd);
                this.$el.find('#base-attribute-area [data-form-param="jointNetworkClCd"]').val(data.jointNetworkClCd);
                this.$el.find('#base-attribute-area [data-form-param="jointNetworkTxDscd"]').val(data.jointNetworkTxDscd);
                
                this.$el.find('#base-attribute-area [data-form-param="hndlngOpnDscd"]').val(data.hndlngOpnDscd);
                this.$el.find('#base-attribute-area [data-form-param="dpstWhdrwlDscd"]').val(data.dpstWhdrwlDscd);
                this.$el.find('#base-attribute-area [data-form-param="srvcCallBfAfHstCreateCd"]').val(data.srvcCallBfAfHstCreateCd);
                this.$el.find('#base-attribute-area [data-form-param="srvcCallBfAfCommitCd"]').val(data.srvcCallBfAfCommitCd);
                
                this.$el.find('#base-attribute-area [data-form-param="safCreateCd"]').val(data.safCreateCd);
                this.$el.find('#base-attribute-area [data-form-param="safUpdtYn"]').val(data.safUpdtYn);
                this.$el.find('#base-attribute-area [data-form-param="timeoutRgstrnYn"]').val(data.timeoutRgstrnYn);
                this.$el.find('#base-attribute-area [data-form-param="timeoutScnd"]').val(data.timeoutScnd);
                
                this.$el.find('#base-attribute-area [data-form-param="cnclOrgnlTxChkYn"]').val(data.cnclOrgnlTxChkYn);
                this.$el.find('#base-attribute-area [data-form-param="cnclOrgnlTxUpdtCd"]').val(data.cnclOrgnlTxUpdtCd);
                this.$el.find('#base-attribute-area [data-form-param="extrnlMsngNbrChkYn"]').val(data.extrnlMsngNbrChkYn);
                this.$el.find('#base-attribute-area [data-form-param="extrnlDplctnChkYn"]').val(data.extrnlDplctnChkYn);
                
                this.$el.find('#base-attribute-area [data-form-param="hndlngMgmtMsgPrcsngYn"]').val(data.hndlngMgmtMsgPrcsngYn);
                this.$el.find('#base-attribute-area [data-form-param="xtnParmOneYn"]').val(data.xtnParmOneYn);
                
                this.$el.find('#base-attribute-area [data-form-param="xtnParmTwoYn"]').val(data.xtnParmTwoYn);
                this.$el.find('#base-attribute-area [data-form-param="xtnParmThreeYn"]').val(data.xtnParmThreeYn);
                this.$el.find('#base-attribute-area [data-form-param="xtnParmFourYn"]').val(data.xtnParmFourYn);
                this.$el.find('#base-attribute-area [data-form-param="xtnParmFiveYn"]').val(data.xtnParmFiveYn);
                
                this.$el.find('#base-attribute-area [data-form-param="xtnParmSixYn"]').val(data.xtnParmSixYn);
                this.$el.find('#base-attribute-area [data-form-param="xtnParmSevenYn"]').val(data.xtnParmSevenYn);
                this.$el.find('#base-attribute-area [data-form-param="xtnParmEightYn"]').val(data.xtnParmEightYn);
                this.$el.find('#base-attribute-area [data-form-param="xtnParmNineYn"]').val(data.xtnParmNineYn);
                
                this.$el.find('#base-attribute-area [data-form-param="xtnParmTenYn"]').val(data.xtnParmTenYn);

                this.isBaseAttributeModified = true;
            },


            selectGridRecord: function () {
                var selectedData = this.CAPXP001Grid.grid.getSelectionModel().selected.items[0];


                if(selectedData == null) {
                	return;
                }


                this.setBaseAttribute(selectedData.data);
            },


            resetSearchCondition: function () {
                this.$el.find('#search-condition-area [data-form-param="extrnlTxCd"]').val("");
            },
            
            /**
             * 달력생성
             */
            setDatePicker: function () {
                fn_makeDatePicker(this.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]'));
            },


            resetBaseAttribute: function () {
                this.$el.find('#base-attribute-area [data-form-param="extrnlTxCd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="stsCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]').val(getCurrentDate("yyyy-mm-dd"));
                this.$el.find('#base-attribute-area [data-form-param="extrnlInstCd"]').val("");
                
                this.$el.find('#base-attribute-area [data-form-param="extrnlBizDscd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="extrnlSubBizDscd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="jointNetworkClCd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="jointNetworkTxDscd"]').val("");
                
                this.$el.find('#base-attribute-area [data-form-param="hndlngOpnDscd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="dpstWhdrwlDscd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="srvcCallBfAfHstCreateCd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="srvcCallBfAfCommitCd"]').val("");
                
                this.$el.find('#base-attribute-area [data-form-param="safCreateCd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="safUpdtYn"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="timeoutRgstrnYn"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="timeoutScnd"]').val("");
                
                this.$el.find('#base-attribute-area [data-form-param="cnclOrgnlTxChkYn"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="cnclOrgnlTxUpdtCd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="extrnlMsngNbrChkYn"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="extrnlDplctnChkYn"] option:eq(0)').attr("selected", "selected");
                
                this.$el.find('#base-attribute-area [data-form-param="hndlngMgmtMsgPrcsngYn"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="xtnParmOneYn"]').val("");
                
                this.$el.find('#base-attribute-area [data-form-param="xtnParmTwoYn"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="xtnParmThreeYn"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="xtnParmFourYn"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="xtnParmFiveYn"]').val("");
                
                this.$el.find('#base-attribute-area [data-form-param="xtnParmSixYn"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="xtnParmSevenYn"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="xtnParmEightYn"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="xtnParmNineYn"]').val("");
                
                this.$el.find('#base-attribute-area [data-form-param="xtnParmTenYn"]').val("");

                this.$buttonCodeSearch.hide();
                this.$selectValidationRule.hide();
                this.$inputValidationRule.show();

                this.isBaseAttributeModified = false;
            },


            inquireStandardAttribute: function () {
                // header 정보 set
                var that = this;
                var sParam = {};


                sParam.extrnlTxCd              = this.$el.find('#search-condition-area [data-form-param="extrnlTxCd"]').val();
                console.log(sParam);


                if (fn_isEmpty(sParam.extrnlTxCd)) {
                	fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0014'));
                    return;
                }


                var linkData = {"header": fn_getHeader("CAPXP03684005"), "CaExtrnlTxParmIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var list = responseData.CaExtrnlTxParmOut.extrnlTxParmList;
                            var totCnt = list.length;
                            // 서비스 입력항목
                            that.resetBaseAttribute();
                            if (list != null || list.length > 0) {
                                that.CAPXP001Grid.setData(list);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                // 삭제 로우 초기화
                                that.deleteList = [];
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            saveSearchResult: function () {
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
                        sub.extrnlTxCd = data.extrnlTxCd;
                        deleteList.push(sub);
                    });


                    sParam.tblNm = deleteList;

                    console.log(sParam);

                    var linkData = {"header": fn_getHeader("CAPXP03683003"), "CaExtrnlTxParmListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                // 재조회
                                that.inquireStandardAttribute();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), saveData, this);
            },


            saveBaseAttribute: function (event) {
                var that = this;
                var sParam = {};
                sParam.extrnlTxCd      = that.$el.find('#base-attribute-area [data-form-param="extrnlTxCd"]').val();

                if( fn_isEmpty( sParam.extrnlTxCd)){
                	fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.AT#extrnlTxCd") + "]");
                    return;
                }

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var sParam = {};
                    var srvcCd;


                    if (that.isBaseAttributeModified) {
                        //수정
                        srvcCd = "CAPXP03682002";
                    } else {
                        //등록
                        srvcCd = "CAPXP03681001";
                    }

                    sParam.extrnlTxCd      = that.$el.find('#base-attribute-area [data-form-param="extrnlTxCd"]').val();
                    sParam.stsCd         = that.$el.find('#base-attribute-area [data-form-param="stsCd"] option:selected').val();
                    sParam.aplyStartDt       = fn_getDateValue(that.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]').val());
                    sParam.extrnlInstCd        = that.$el.find('#base-attribute-area [data-form-param="extrnlInstCd"]').val();
                    sParam.extrnlBizDscd      = that.$el.find('#base-attribute-area [data-form-param="extrnlBizDscd"]').val();
                    sParam.extrnlSubBizDscd = that.$el.find('#base-attribute-area [data-form-param="extrnlSubBizDscd"]').val();
                    sParam.jointNetworkClCd        = that.$el.find('#base-attribute-area [data-form-param="jointNetworkClCd"]').val();
                    sParam.jointNetworkTxDscd        = that.$el.find('#base-attribute-area [data-form-param="jointNetworkTxDscd"]').val();
                    sParam.hndlngOpnDscd     = that.$el.find('#base-attribute-area [data-form-param="hndlngOpnDscd"]').val();
                    sParam.dpstWhdrwlDscd     = that.$el.find('#base-attribute-area [data-form-param="dpstWhdrwlDscd"]').val();
                    sParam.srvcCallBfAfHstCreateCd     = that.$el.find('#base-attribute-area [data-form-param="srvcCallBfAfHstCreateCd"]').val();
                    sParam.srvcCallBfAfCommitCd     = that.$el.find('#base-attribute-area [data-form-param="srvcCallBfAfCommitCd"]').val();
                    sParam.safCreateCd     = that.$el.find('#base-attribute-area [data-form-param="safCreateCd"]').val();
                    sParam.safUpdtYn     = that.$el.find('#base-attribute-area [data-form-param="safUpdtYn"] option:selected').val();
                    sParam.timeoutRgstrnYn     = that.$el.find('#base-attribute-area [data-form-param="timeoutRgstrnYn"] option:selected').val();
                    sParam.timeoutScnd     = that.$el.find('#base-attribute-area [data-form-param="timeoutScnd"]').val();
                    sParam.cnclOrgnlTxChkYn     = that.$el.find('#base-attribute-area [data-form-param="cnclOrgnlTxChkYn"] option:selected').val();
                    sParam.cnclOrgnlTxUpdtCd     = that.$el.find('#base-attribute-area [data-form-param="cnclOrgnlTxUpdtCd"]').val();
                    sParam.extrnlMsngNbrChkYn     = that.$el.find('#base-attribute-area [data-form-param="extrnlMsngNbrChkYn"] option:selected').val();
                    sParam.extrnlDplctnChkYn     = that.$el.find('#base-attribute-area [data-form-param="extrnlDplctnChkYn"] option:selected').val();
                    sParam.hndlngMgmtMsgPrcsngYn     = that.$el.find('#base-attribute-area [data-form-param="hndlngMgmtMsgPrcsngYn"] option:selected').val();
                    sParam.xtnParmOneYn     = that.$el.find('#base-attribute-area [data-form-param="xtnParmOneYn"]').val();
                    sParam.xtnParmTwoYn     = that.$el.find('#base-attribute-area [data-form-param="xtnParmTwoYn"]').val();
                    sParam.xtnParmThreeYn     = that.$el.find('#base-attribute-area [data-form-param="xtnParmThreeYn"]').val();
                    sParam.xtnParmFourYn     = that.$el.find('#base-attribute-area [data-form-param="xtnParmFourYn"]').val();
                    sParam.xtnParmFiveYn     = that.$el.find('#base-attribute-area [data-form-param="xtnParmFiveYn"]').val();
                    sParam.xtnParmSixYn     = that.$el.find('#base-attribute-area [data-form-param="xtnParmSixYn"]').val();
                    sParam.xtnParmSevenYn     = that.$el.find('#base-attribute-area [data-form-param="xtnParmSevenYn"]').val();
                    sParam.xtnParmEightYn     = that.$el.find('#base-attribute-area [data-form-param="xtnParmEightYn"]').val();
                    sParam.xtnParmNineYn     = that.$el.find('#base-attribute-area [data-form-param="xtnParmNineYn"]').val();
                    sParam.xtnParmTenYn     = that.$el.find('#base-attribute-area [data-form-param="xtnParmTenYn"]').val();

                    var linkData = {"header": fn_getHeader(srvcCd), "CaExtrnlTxParmIn": sParam};


                    //ajax 호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true,
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            }
                        }
                    });
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            downloadGridDataWithExcel: function () {
                this.CAPXP001Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPXP001')+"_"+getCurrentDate("yyyy-mm-dd"));
            },


            toggleSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find('#search-condition-area'), this.$el.find('#btn-search-condition-toggle'));
            },


            toggleAdditionalSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find('#additional-search-condition-area'), this.$el.find('#btn-additional-search-condition-toggle'));
            },


            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find('#btn-search-result-toggle'));
            },


            toggleBaseAttribute: function () {
                fn_pageLayerCtrl(this.$el.find('#base-attribute-area'), this.$el.find('#btn-base-attribute-toggle'));
            }
            /**
             * 엔터 입력 처리를 위한 콜백함수
             */
            ,fn_enter: function (event) {
                var that = this;
                var event = event || window.event;
                var keyID = (event.which) ? event.which : event.keyCode;
                if(keyID == 13) { //enter
                	that.inquireStandardAttribute();
                }
            }
        }); // end of Backbone.View.extend({


        return CAPXP001View;
    } // end of define function
)
; // end of define
