define(
    [
     	'bx/common/common-info',
        'text!app/views/page/CAPST/004/_CAPST004.html',
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


        /**
         * Backbone
         */
        var CAPST004View = Backbone.View.extend({
        	// set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPST004-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {


                /*
                 * search-condition-area
                 */
                /*'change .CAPST004-bizDscd-wrap': 'changeBusinessDistinctCode',
                'change .CAPST004-pdTpCd-wrap': 'changeProductTypeCode',
                'change .CAPST004-pdTmpltCd-wrap': 'changeProductTemplateCode',
                */
            	
                'change .CAPST004-bizDscd-wrap': 'selectBusinessDistinctCodeOfDetail',
                'change .CAPST004-pdTpCd-wrap': 'selectProductTypeCodeOfDetail',
                'change .CAPST004-pdTmpltCd-wrap': 'selectProductTemplateCodeOfDetail',
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
                this.$el.find("#CAPST004Grid").html(this.CAPST004Grid.render({
                    'height': CaGridHeight
                }));
                this.setComboBoxes();
                this.resetSearchCondition();
                this.resetDetailInformation();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPST004-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPST004-wrap #btn-detail-information-save')
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


                this.CAPST004Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'bizDscd', 'pdTpCd', 'pdTmpltCd', 'pdCd', 'pdTpCdNm', 'pdTmpltNm', 'pdNm', 'amtTpCd', 'acctgPrcsYn'],
                    id: 'CAPST004Grid',
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
                          * 회계처리여부
                          */
                        {
                            text: bxMsg('cbb_items.AT#acctgPrcsYn'),
                            //width: 130,


                            dataIndex: 'acctgPrcsYn',
                            style: 'text-align:center',
                            align: 'center',
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
                sParam.className = "CAPST004-bizDscd-wrap";
                sParam.targetId = "bizDscd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "80015";
                fn_getCodeList(sParam, this);


                /**
                 *  Amount Type Code
                 */
                sParam = {};
                sParam.className = "CAPST004-amtTpCd-wrap";
                sParam.targetId = "amtTpCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select');
                sParam.cdNbr = "50026";
                sParam.viewType = "ValNm";
                fn_getCodeList(sParam, this);


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


            },


            /*
             * Inquire balance parameter with search conditions
             */
            inquireBalanceParameter: function () {
            	this.resetDetailInformation();
            	this.deleteList = [];


                var that = this;
                var sParam = {};


                // 조회 key값 set
                sParam.bizDscd = this.$el.find('#search-condition-area [data-form-param="bizDscd"]').val();
                sParam.pdTpCd = this.$el.find('#search-condition-area [data-form-param="pdTpCd"]').val();
                sParam.pdTmpltCd = this.$el.find('#search-condition-area [data-form-param="pdTmpltCd"]').val();
                sParam.pdCd = this.$el.find('#search-condition-area [data-form-param="pdCd"]').val();
                sParam.amtTpCd = this.$el.find('#search-condition-area [data-form-param="amtTpCd"]').val();




                if (sParam == null) {
                    this.CAPST004Grid.resetData();
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
                    "header": fn_getHeader("CAPST0048400"),
                    "CaXtnAmtTpMgmtSvcGetXtnAmtTypeListIn": sParam
                };


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {


                        if (fn_commonChekResult(responseData)) {
                            if (responseData.CaXtnAmtTpMgmtSvcGetXtnAmtTypeListOut) {
                                var tbList = responseData.CaXtnAmtTpMgmtSvcGetXtnAmtTypeListOut.tblNm;
                                var totCnt = tbList.length;


                                if (tbList != null || tbList.length > 0) {
                                    that.CAPST004Grid.setData(tbList);
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
            	this.resetDetailInformation();
                this.CAPST004Grid.resetData();
                this.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt'));
            },


            /*
             * Select a grid record
             */
            selectGridRecord: function () {
                var that = this;


                if(!this.CAPST004Grid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPST004Grid.grid.getSelectionModel().selected.items[0].data;


                if (!selectedRecord) {
                    return;
                }


                that.initFlag = false;
                that.setRecordParam(selectedRecord, that);




                that.$el.find('#detail-information-area [data-form-param="amtTpCd"]').prop("disabled", true);


                that.$el.find('#detail-information-area [data-form-param="amtTpCd"]').val(selectedRecord.amtTpCd);


                if (selectedRecord.acctgPrcsYn == "Y")
                    this.$el.find('#detail-information-area [data-form-param="acctgPrcsYn"]').prop("checked", true);
                else
                    this.$el.find('#detail-information-area [data-form-param="acctgPrcsYn"]').prop("checked", false);


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


                this.$el.find('#detail-information-area [data-form-param="amtTpCd"] option:eq(0)').attr("selected", "selected");


                this.$el.find('#detail-information-area [data-form-param="acctgPrcsYn"]').prop("checked", false);
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
                        sub.acctgPrcsYn = data.acctgPrcsYn;
                        sub.instCd = commonInfo.getInstInfo().instCd;


                        table.push(sub);
                    });


                    sParam.tblNm = table;




                    var linkData = {"header": fn_getHeader("CAPST0048301"), "CaXtnAmtTpMgmtSvcRegisterXtnAmtTypeListIn": sParam};


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
	                if(this.initFlag) srvcCd = "CAPST0048100";
	                else srvcCd = "CAPST0048200";


					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }

	                sParam.bizDscd = this.$el.find('#detail-information-area [data-form-param="bizDscd"]').val();
	                sParam.pdTpCd = this.fillBlank(this.$el.find('#detail-information-area [data-form-param="pdTpCd"]').val());
	                sParam.pdTmpltCd = this.fillBlank(this.$el.find('#detail-information-area [data-form-param="pdTmpltCd"]').val());
	                sParam.pdCd = this.fillBlank(this.$el.find('#detail-information-area [data-form-param="pdCd"]').val());
	                sParam.amtTpCd = this.$el.find('#detail-information-area [data-form-param="amtTpCd"]').val();


	                sParam.acctgPrcsYn = this.getYn(this.$el.find('#detail-information-area [data-form-param="acctgPrcsYn"]'));
	                sParam.instCd = commonInfo.getInstInfo().instCd;

	                if(fn_isNull(sParam.bizDscd)){ 
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#bizDscd')+"]");
	                  	return;
                    }
	                
	                if(fn_isNull(sParam.amtTpCd)){ 
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#amtTpCd')+"]");
	                  	return;
                    }
	                
	                console.log(sParam);
	                var linkData = {"header": fn_getHeader(srvcCd), "CaXtnAmtTpMgmtSvcRegisterXtnAmtTypeIn": sParam};
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
                 sParam.className = "CAPST004-pdTpCd-wrap.detail-information-area" ;
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


            	 sParam.className = "CAPST004-pdTmpltCd-wrap.detail-information-area";
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


            	 sParam.className = "CAPST004-pdCd-wrap.detail-information-area";
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

                recordParam = {};
            },
            
            /**
             * 업무 구분 코드 변경
             */
            selectBusinessDistinctCodeOfDetail: function (data) {
            	var targetClassNm = data.target.classList[3];
                var that = this;
                var sParam = {};
                var bizDscd = data.bizDscd ? data.bizDscd : that.$el.find('#'+targetClassNm+' [data-form-param="bizDscd"]').val();
                var $selectPdTpCd = that.$el.find('#'+targetClassNm+' [data-form-param="pdTpCd"]');
                var $selectPdTmpltCd = that.$el.find('#'+targetClassNm+' [data-form-param="pdTmpltCd"]');
                var $selectPdCd = that.$el.find('#'+targetClassNm+' [data-form-param="pdCd"]');


                if(data.bizDscd) {
                    that.$el.find('#'+targetClassNm+' [data-form-param="bizDscd"]').val(data.bizDscd);
                }
                
                if (fn_isNull(bizDscd)) {
                    //상품유형코드 초기화
                    $selectPdTpCd.empty();
                    $selectPdTpCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                    $selectPdTmpltCd.empty();
                    $selectPdTmpltCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                    $selectPdCd.empty();
                    $selectPdCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                } else {
                    //combobox 정보 셋팅
                    sParam.className = targetClassNm+".CAPST004-pdTpCd-wrap";
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
                    fn_getPdCodeList(sParam, this, null, function () { //상품콤보 설정 후 수행할 callback
                    	if($selectPdTpCd[0].length<=1){
                    		//로드할 상품콤보 목록이 없는 경우 없음 option을 추가
                    		$selectPdTpCd.append($(document.createElement('option')).val("1").text(bxMsg('cbb_items.SCRNITM#none')));
                    		//추가한 없음(1)옵션을 선택
                    		$selectPdTpCd.val("1").prop("selected", true);
                    	}
                    });
                }

                //상품템플릿코드, 상품코드 초기화
                $selectPdTmpltCd.empty();
                $selectPdTmpltCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));


                $selectPdCd.empty();
                $selectPdCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
            },


            /**
             * 상품 유형 코드 변경
             */
            selectProductTypeCodeOfDetail: function (data) {
            	var targetClassNm = data.target.classList[3];
                var that = this;
                var sParam = {};
                var bizDscd = data.bizDscd ? data.bizDscd : this.$el.find('#'+targetClassNm+' [data-form-param="bizDscd"]').val();
                var pdTpCd = data.pdTpCd ? data.pdTpCd : this.$el.find('#'+targetClassNm+' [data-form-param="pdTpCd"]').val();
                var $selectPdTmpltCd = this.$el.find('#'+targetClassNm+' [data-form-param="pdTmpltCd"]');
                var $selectPdCd = this.$el.find('#'+targetClassNm+' [data-form-param="pdCd"]');


                if (fn_isNull(pdTpCd)) {
                    //상품템플릿코드 초기화
                    $selectPdTmpltCd.empty();
                    $selectPdTmpltCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                } else {
                    //combobox 정보 셋팅
                    sParam.className = targetClassNm+".CAPST004-pdTmpltCd-wrap";
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
                    fn_getPdCodeList(sParam, this, null, function () {
                        if(data.pdTmpltCd) {
                            that.$el.find('#'+targetClassNm+' [data-form-param="pdTmpltCd"]').val(data.pdTmpltCd);
                        }
                    });
                }


                //상품코드 초기화
                $selectPdCd.empty();
                $selectPdCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
            },


            /**
             * 상품 템플릿 코드 변경
             */
            selectProductTemplateCodeOfDetail: function (data) {
            	var targetClassNm = data.target.classList[3];
                var that = this;
                var sParam = {};
                var bizDscd = data.bizDscd ? data.bizDscd : this.$el.find('#'+targetClassNm+' [data-form-param="bizDscd"]').val();
                var pdTpCd = data.pdTpCd ? data.pdTpCd : this.$el.find('#'+targetClassNm+' [data-form-param="pdTpCd"]').val();
                var pdTmpltCd = data.pdTmpltCd ? data.pdTmpltCd : this.$el.find('#'+targetClassNm+' [data-form-param="pdTmpltCd"]').val();
                var $selectPdCd = this.$el.find('#'+targetClassNm+' [data-form-param="pdCd"]');


                if (fn_isNull(pdTmpltCd)) {
                    //상품템플릿코드 초기화
                    $selectPdCd.empty();
                    $selectPdCd.append($(document.createElement('option')).val("").text(bxMsg('cbb_items.SCRNITM#all')));
                } else {
                    //combobox 정보 셋팅
                    sParam.className = targetClassNm+".CAPST004-pdCd-wrap";
                    sParam.targetId = "pdCd";
                    sParam.nullYn = "Y";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                    //inData 정보 셋팅
                    sParam.instCd = commonInfo.getInstInfo().instCd;
                    sParam.bizDscd = bizDscd;
                    sParam.pdTpCd = pdTpCd;
                    sParam.pdTmpltCd = pdTmpltCd;
                    sParam.pdCd = "";
                    //상품중분류코드 콤보데이터 load
                    fn_getPdCodeList(sParam, this, null, function () {
                        if(data.pdCd) {
                            that.$el.find('#'+targetClassNm+' [data-form-param="pdCd"]').val(data.pdCd);
                        }
                    });
                }
            },

            selectProductCodeOfDetail: function (data) {
            	var targetClassNm = data.target.classList[3];
                this.$el.find('#'+targetClassNm+' [data-form-param="pdCd"]').val(data.pdCd);
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


        return CAPST004View;
    } // end of define function
); // end of define
