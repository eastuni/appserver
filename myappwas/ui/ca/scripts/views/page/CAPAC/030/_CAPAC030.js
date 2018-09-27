define(
    [
        'bx/common/config',
        'text!app/views/page/CAPAC/030/_CAPAC030.html',
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
        var CAPAC030View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section',
            // 클래스이름 설정
            className: 'bx-container CAPAC030-page',
            // 탬플릿 설정
            templates: {
                'tpl': tpl
            },
            // 이벤트 설정
            events: {
                'click #btn-search-result-save': 'deleteBillCtgryList',
                'click #btn-base-attribute-save': 'saveBaseAttribute',


                'click #btn-search-condition-inquire': 'inquireCashDenomination',


                'click #btn-base-attribute-reset': 'resetBaseAttribute',


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
                this.initFlag = true;


                this.createGrid();
            },


            /**
             * render
             */
            render: function () {
                this.$el.html(this.tpl());
                this.$el.find("#CAPAC030Grid").html(this.CAPAC030Grid.render({'height': CaGridHeight}));


                this.setComboBoxes();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPAC030-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPAC030-wrap #btn-base-attribute-save')
                                    			   ]);
                return this.$el;
            },


            createGrid: function () {
                var that = this;


                that.CAPAC030Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'crncyCd', 'billCtgryFormDscd', 'billCtgryUnitAmt', 'cashMgmtTrgtYn'],
                    id: 'CAPAC030Grid',
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
                            text: bxMsg('cbb_items.AT#crncyCd'),
                            flex: 1,
                            dataIndex: 'crncyCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#crncyCdNm'),
                            flex: 1,
                            dataIndex: 'crncyCd',
                            style: 'text-align:center',
                            align: 'center',
                            code: 'T0001',
                            renderer: function (val) {
                                return val ? bxMsg('cbb_items.CDVAL#T0001' + val) : '';
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#billCtgryFormDstnctn'),
                            flex: 1,
                            dataIndex: 'billCtgryFormDscd',
                            style: 'text-align:center',
                            align: 'center',
                            code: 'A0014',
                            renderer: function (val) {
                                return val ? bxMsg('cbb_items.CDVAL#A0014' + val) : '';
                            }
                        },
                        {
                            text: bxMsg('cbb_items.AT#billCtgryUnitAmt'),
                            flex: 1,
                            dataIndex: 'billCtgryUnitAmt',
                            style: 'text-align:center',
                            align: 'center'
                        	,renderer: function(value, metaData, record, rowIndex, colIndex, store) {
              	   				return Ext.util.Format.number(value, '0,000.00');
                  	   		}
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#cashMgmtTrgt'),
                            flex: 1,
                            dataIndex: 'cashMgmtTrgtYn',
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


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPAC030-crncyCd-wrap";
                sParam.targetId = "crncyCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "T0001";
                sParam.viewType = "ValNm";


                fn_getCodeList(sParam, this);   // 통화코드


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPAC030-crncyCd2-wrap";
                sParam.targetId = "crncyCd2";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "T0001";
                sParam.viewType = "ValNm";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 통화코드


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPAC030-billCtgryFormDscd-wrap";
                sParam.targetId = "billCtgryFormDscd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A0014";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 권종형태구분코드
            },


            setBaseAttribute: function (data) {
                var isCashManagementTarget = (data.cashMgmtTrgtYn == 'Y');
                this.initFlag = false;
                this.$el.find('#base-attribute-area [data-form-param="crncyCd"]').val(data.crncyCd);
//                this.$el.find('#base-attribute-area [data-form-param="crncyCdNm"]').val(bxMsg('cbb_items.CDVAL#T0001' + data.crncyCd));
                this.$el.find('#base-attribute-area [data-form-param="billCtgryFormDscd"]').val(data.billCtgryFormDscd);
                this.$el.find('#base-attribute-area [data-form-param="billCtgryUnitAmt"]').val(data.billCtgryUnitAmt);
                this.$el.find('#base-attribute-area #cashMgmtTrgtYn').prop('checked', isCashManagementTarget);


                this.$el.find('#base-attribute-area [data-form-param="crncyCd"]').prop('disabled', true);
                this.$el.find('#base-attribute-area [data-form-param="crncyCdNm"]').prop('disabled', true);
                this.$el.find('#base-attribute-area [data-form-param="billCtgryFormDscd"]').prop('disabled', true);
                this.$el.find('#base-attribute-area [data-form-param="billCtgryUnitAmt"]').prop('disabled', true);
            },


            selectGridRecord: function () {
                if(this.CAPAC030Grid.grid.getSelectionModel().selected.items[0]) {
                    var selectedData = this.CAPAC030Grid.grid.getSelectionModel().selected.items[0].data;
                    this.setBaseAttribute(selectedData);
                }
            },


            resetBaseAttribute: function () {
            	this.initFlag = true;
                this.$el.find('#base-attribute-area [data-form-param="crncyCd"] option:eq(0)').attr('selected', 'selected');
//                this.$el.find('#base-attribute-area [data-form-param="crncyCdNm"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="billCtgryFormDscd"] option:eq(0)').attr('selected', 'selected');
                this.$el.find('#base-attribute-area [data-form-param="billCtgryUnitAmt"]').val("");
                this.$el.find('#base-attribute-area #cashMgmtTrgtYn').prop('checked', false);


                this.$el.find('#base-attribute-area [data-form-param="crncyCd"]').prop('disabled', false);
                this.$el.find('#base-attribute-area [data-form-param="crncyCdNm"]').prop('disabled', true);
                this.$el.find('#base-attribute-area [data-form-param="billCtgryFormDscd"]').prop('disabled', false);
                this.$el.find('#base-attribute-area [data-form-param="billCtgryUnitAmt"]').prop('disabled', false);
            },


            inquireCashDenomination: function () {
                // header 정보 set
                var that = this;
                var sParam = {};


                sParam.instCd       = $.sessionStorage('headerInstCd');
                sParam.crncyCd      = this.$el.find('#search-condition-area [data-form-param="crncyCd"]').val();


                var linkData = {"header": fn_getHeader("CAPAC0300400"), "CaCrncyBillCtgryMgmtSvcGetCrncyBillCtgryListIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var refAtrbtList = responseData.CaCrncyBillCtgryMgmtSvcGetCrncyBillCtgryListOut.tblNm;
                            var totCnt = refAtrbtList.length;


                            // 서비스 입력항목
                            that.resetBaseAttribute();
                            if (refAtrbtList != null || refAtrbtList.length > 0) {
                                that.CAPAC030Grid.setData(refAtrbtList);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");


                                // 삭제 로우 초기화
                                that.deleteList = [];
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            deleteBillCtgryList : function (event) {
                if(this.deleteList.length < 1) return;


                var that = this;

				//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                function saveData() {
                    var table = [];
                    var sParam = {};
                    $(that.deleteList).each(function(idx, data) {
                        var sub = {};
                        sub.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                        sub.crncyCd             = data.crncyCd;
                        sub.billCtgryFormDscd   = data.billCtgryFormDscd;
                        sub.billCtgryUnitAmt    = data.billCtgryUnitAmt;
                        table.push(sub);
                    });


                    sParam.tblNm = table; 


                    var linkData = {"header": fn_getHeader("CAPAC0300300"), "CaCrncyBillCtgryMgmtSvcRemoveCrncyBillCtgryIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                // 재조회
                                that.inquireCashDenomination();
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
                    var header =  new Object(); //header 변수 선언


                    sParam.instCd               = $.sessionStorage('headerInstCd');
                    sParam.crncyCd              = that.$el.find('#base-attribute-area [data-form-param="crncyCd"]').val();
                    sParam.billCtgryFormDscd    = that.$el.find('#base-attribute-area [data-form-param="billCtgryFormDscd"]').val();
                    sParam.billCtgryUnitAmt     = that.$el.find('#base-attribute-area [data-form-param="billCtgryUnitAmt"]').val();
                    sParam.cashMgmtTrgtYn       = that.$el.find('#base-attribute-area #cashMgmtTrgtYn').prop('checked') ? 'Y' : 'N';


                    if(that.initFlag) {
                    	header = fn_getHeader("CAPAC0300100");
                    }
                    else {
                    	header = fn_getHeader("CAPAC0300200");
                    }


                    var linkData = {"header": header, "CaCrncyBillCtgryMgmtSvcCrncyBillCtgryIn": sParam};


                    //ajax 호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true,
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                // 재조회
                                that.inquireCashDenomination();
                            }
                        }
                    });
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
                fn_pageLayerCtrl(this.$el.find('#base-attribute-area'), this.$el.find('#btn-base-attribute-toggle'));
            }
        }); // end of Backbone.View.extend({


        return CAPAC030View;
    } // end of define function
)
; // end of define
