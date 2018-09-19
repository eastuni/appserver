define(
    [
     	'bx/common/common-info',
        'text!app/views/page/CAPST/002/_CAPST002.html',
        'bx-component/ext-grid/_ext-grid'
    ],
    function (
        commonInfo,
        tpl,
        ExtGrid
    ) {


        var comboStore1 = {};
        var comboStore2 = {};
        var comboStore3 = {};
        var deleteList = [];
        var initFlag = true;


        /**
         * Backbone
         */
        var CAPST002View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPST002-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                /*
                 * search-condition-area
                 */
                'click #btn-search-condition-reset': 'resetSearchCondition',
                'click #btn-search-condition-inquire': 'inquireSearchCondition',
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
                'click #btn-detail-information-toggle': 'toggleDetailInformation',
                'click #btn-multi-language': 'openMultiLanguagePage'
            },


            /**
             * initialize
             */
            initialize: function (initData) {
                $.extend(this, initData);


                this.initData = initData;
                this.setComboStore();
                this.deleteList = [];
                this.initFlag = true;
                this.createGrid();


            },


            /**
             * Render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find("#CAPST002Grid").html(this.CAPST002Grid.render({
                    'height': CaGridHeight
                }));
                this.setComboBoxes();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPST002-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPST002-wrap #btn-detail-information-save')
                                    			   ]);
                return this.$el;
            },




            /*
             *  Set combo store
             */


            setComboStore: function () {
                var that = this;


                that.comboStore1 = {}; // 금액유형코드
                that.comboStore2 = {}; // 여부
                that.comboStore3 = {}; // 입출구분코드


                var sParam = {};


                sParam = {};
                sParam.cdNbr = "50026";
                var linkData1 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };


                sParam = {};
                sParam.cdNbr = "10000";
                var linkData2 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };


                // 입출구분코드
                sParam = {};
                sParam.cdNbr = "50028";
                var linkData3 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };


                bxProxy.all([
  		              // 금액유형코드 콤보코드 로딩
                    {
                        url: sUrl,
                        param: JSON.stringify(linkData1),
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                that.comboStore1 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }
  		              // 여부
  		              , {
                        url: sUrl,
                        param: JSON.stringify(linkData2),
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                that.comboStore2 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }
  	            	  // 입출구분코드 콤보로딩
  	            	  , {
                        url: sUrl,
                        param: JSON.stringify(linkData3),
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                that.comboStore3 = new Ext.data.Store({
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


                this.CAPST002Grid = new ExtGrid({
                    //  그리드 컬럼 정의
                    fields: ['No', 'amtTpCd', 'amtTpCdNm', 'dpstWhdrwlDscd', 'upAmtTpCd', 'upAmtTpCdNm', 'acctgPrcsYn', 'actvYn', 
                                              'lastChngTmstmp', 'lastChngGuid', 'engNm'],


                    id: 'CAPST002Grid',
                    columns: [
                            {
                                text: bxMsg('cbb_items.SCRNITM#No'),
                                dataIndex: 'rowIndex',
                                sortable: false,
                                width: 80,
                                height: 25,
                                style: 'text-align:center',
                                align: 'center'
                                    // other config you need.. 
                                    ,
                                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                    return rowIndex + 1;
                                }
                			},


                            // 금액유형코드
                            {
                                text: bxMsg('cbb_items.AT#amtTpCd'),
                                //width: 100,
                                dataIndex: 'amtTpCd',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1
                           }, // end of 금액유형코드


                           // 금액유형코드명
                            {
                                text: bxMsg('cbb_items.AT#amtTpCdNm'),
                                dataIndex: 'amtTpCdNm',
                                //width: 150,
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1
                             },


                             // 입출구분코드
                             {
                                 text: bxMsg('cbb_items.AT#dpstWhdrwlDscd'),
                                 //width: 100,
                                 flex: 1,
                                 dataIndex: 'dpstWhdrwlDscd',
                                 style: 'text-align:center',
                                 align: 'center',
                                 editor: {
                                     xtype: 'combobox',
                                     store: that.comboStore3,
                                     displayField: 'cdNm',
                                     valueField: 'cd'
                                 },
                                 renderer: function (val) {

                                         index = that.comboStore3.findExact('cd', val);
                                         if (index != -1) {
                                             rs = that.comboStore3.getAt(index).data;
                                             return rs.cdNm;
                                         }
//                                         else{
//                                        	 return bxMsg('cbb_items.SCRNITM#all');
//                                         }
                                     } // end of render
                                       },
                                       // end of 입출구분코드
                                       // 상위 금액유형코드
                                       {
                                           text: bxMsg('cbb_items.AT#upAmtTpCd'),
                                           //width: 120,
                                           flex: 1,
                                           dataIndex: 'upAmtTpCd',
                                           style: 'text-align:center',
                                           align: 'center'
                                                   }, // end of 금액유형코드


                                       // 상위 금액유형코드명
                                       {
                                           text: bxMsg('cbb_items.AT#upAmtTpCdNm'),
                                           //width: 150,
                                           flex: 1,
                                           dataIndex: 'upAmtTpCdNm',
                                           style: 'text-align:center',
                                           align: 'center'
                                                   }, // end of 금액유형코드
                             // 영문명
//                            {
//                                text: bxMsg('cbb_items.AT#engNm'),
//                                dataIndex: 'engNm',
//                                width: 150,
//                                style: 'text-align:center',
//                                align: 'left',
//                                hidden: true
//                                        },


                             // 회계처리여부
                            {
                                text: bxMsg('cbb_items.AT#acctgPrcsYn'),
                                //width: 100,


                                dataIndex: 'acctgPrcsYn',
                                style: 'text-align:center',
                                align: 'center',
                                editor: {
                                    xtype: 'combobox',
                                    store: that.comboStore2,
                                    displayField: 'cdNm',
                                    valueField: 'cd'
                                },
                                renderer: function (val) {
                                        index = that.comboStore2.findExact('cd', val);
                                        if (index != -1) {
                                            rs = that.comboStore2.getAt(index).data;
                                            var classNm = "s-no";
                                            var val = rs.cd;


                                            if (val == "Y") {
                                                classNm = "s-yes";
                                            }
                                            return "<span class=\"bw-sign " + classNm + "\">" + val + "</span>";
                                        }
                                    } // end of render
                                      }, // end of 일일잔액이력관리여부


                             // 활동여부
                            {
                                text: bxMsg('cbb_items.AT#actvYn'),
                                //width: 100,


                                dataIndex: 'actvYn',
                                style: 'text-align:center',
                                align: 'center',
                                editor: {
                                    xtype: 'combobox',
                                    store: that.comboStore2,
                                    displayField: 'cdNm',
                                    valueField: 'cd'
                                },
                                renderer: function (val) {




                                        index = that.comboStore2.findExact('cd', val);
                                        if (index != -1) {
                                            rs = that.comboStore2.getAt(index).data;
                                            var classNm = "s-no";
                                            var val = rs.cd;


                                            if (val == "Y") {
                                                classNm = "s-yes";
                                            }
                                            return "<span class=\"bw-sign " + classNm + "\">" + val + "</span>";
                                        }
                                    } // end of render
                                      }, // end of 활동여부






                            {
                                text: '',
                                width: 0,
                                dataIndex: 'lastChngTmstmp',
                                hidden: true
                                        }, // 최종변경일시
                            {
                                text: '',
                                width: 0,
                                dataIndex: 'lastChngGuid',
                                hidden: true
                                        }, // 최종변경GUID
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
                                  ] // end of columns


                    // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                    ,
                    gridConfig: {
                        // 셀 에디팅 플러그인
                        // 2번 클릭시, 에디팅할 수 있도록 처리
                        plugins: [
                                           Ext.create('Ext.grid.plugin.CellEditing', {
                                    clicksToEdit: 2,
                                    listeners: {
                                        'beforeedit': function (editor, e) {
                                            if (e.field == 'amtTpCd' || e.field == 'upAmtTpCd' || e.field == 'acctgPrcsYn' || e.field == 'actvYn' || e.field == 'dpstWhdrwlDscd') {
                                                return false;
                                            }
                                        }
                                    }
                                }) // end of Ext.create
                                      ] // end of plugins
                    } // end of gridConfig
                    ,
                    listeners: {
                        click: {
                            element: 'body',
                            fn: function () {
                                //클릭시 이벤트 발생
                                that.selectRecord();
                            }
                        }
                    }
                });
            },


            /*
             * select record
             */
            selectRecord: function () {
                var that = this;


                if(!this.CAPST002Grid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPST002Grid.grid.getSelectionModel().selected.items[0].data;
                that.initFlag = false;
                that.$el.find('#detail-information-area [data-form-param="amtTpCd"]').prop("disabled", true);
                that.$el.find('#detail-information-area [data-form-param="amtTpCd"]').val(selectedRecord.amtTpCd);
                that.$el.find('#detail-information-area [data-form-param="amtTpCdNm"]').val(selectedRecord.amtTpCdNm);
                that.$el.find('#detail-information-area [data-form-param="dpstWhdrwlDscd"]').val(selectedRecord.dpstWhdrwlDscd);
                that.$el.find('#detail-information-area [data-form-param="upAmtTpCd"]').val(selectedRecord.upAmtTpCd);
                if (selectedRecord.acctgPrcsYn == "Y")
                    this.$el.find('#detail-information-area [data-form-param="acctgPrcsYn"]').prop("checked", true);
                else
                    this.$el.find('#detail-information-area [data-form-param="acctgPrcsYn"]').prop("checked", false);
                if (selectedRecord.actvYn == "Y")
                    this.$el.find('#detail-information-area [data-form-param="actvYn"]').prop("checked", true);
                else
                    this.$el.find('#detail-information-area [data-form-param="actvYn"]').prop("checked", false);


            },


            /*
             * Inquire with search conditions
             */
            inquireSearchCondition: function () {
            	this.resetDetailInformation();


                var that = this;
                var sParam = {};


                // 입력 Key값이 없는 경우 전역변수에 저장된 Key값을 사용
                // sParam.amtTpCd = this.$el.find('#search-condition-area  [data-form-param="amtTpCd"]').val();
                sParam.amtTpCdNm = this.$el.find('#search-condition-area  [data-form-param="amtTpCdNm"]').val();
                sParam.upAmtTpCd = this.$el.find('#search-condition-area  [data-form-param="upAmtTpCd"]').val();
                sParam.acctgPrcsYn = this.$el.find('#search-condition-area  [data-form-param="acctgPrcsYn"]').val();


                var linkData = {
                    "header": fn_getHeader("CAPST0028400"),
                    "CaAmtTpMgmtSvcGetAmtTpMgmtListIn": sParam
                };


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {


                        if (fn_commonChekResult(responseData)) {
                            if (responseData.CaAmtTpMgmtSvcGetAmtTpMgmtListOut.tblNm) {
                                var tbList = responseData.CaAmtTpMgmtSvcGetAmtTpMgmtListOut.tblNm;
                                var totCnt = tbList.length;


                                if (tbList != null || tbList.length > 0) {
                                    that.CAPST002Grid.setData(tbList);
                                    that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt') + " (" + fn_setComma(totCnt) + " " + bxMsg('cbb_items.SCRNITM#cnt') + ")");


                                }
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


                /*
                 *  회계처리여부
                 */
                sParam = {};
                sParam.className = "CAPST002-acctgPrcsYn-wrap";
                sParam.targetId = "acctgPrcsYn";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "10000";
                fn_getCodeList(sParam, this);


                /*
                 *  상위금액유형코드
                 */
                sParam = {};
                sParam.className = "CAPST002-upAmtTpCd-wrap";
                sParam.targetId = "upAmtTpCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "50026";
                sParam.viewType = "ValNm"
                fn_getCodeList(sParam, this);


                /*
                 *  입출구분코드
                 */
                sParam = {};
                sParam.className = "CAPST002-dpstWhdrwlDscd-wrap";
                sParam.targetId = "dpstWhdrwlDscd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "50028";
                fn_getCodeList(sParam, this);






            },


            /*
             *  Add new amount type
             */
            saveDetailInformation: function(){


            		var that = this;
	                var sParam = {};
	                var srvcCd = "";
	                if(this.initFlag) srvcCd = "CAPST0028100";
	                else srvcCd = "CAPST0028200";
	                
	              //배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }

	                sParam.amtTpCd = this.$el.find('#detail-information-area [data-form-param="amtTpCd"]').val();
	                sParam.amtTpCdNm =  this.$el.find('#detail-information-area [data-form-param="amtTpCdNm"]').val();
	                //sParam.engNm = this.fillBlank(this.$el.find('#detail-information-area [data-form-param="pdTmpltCd"]').val());
	                sParam.dpstWhdrwlDscd = this.$el.find('#detail-information-area [data-form-param="dpstWhdrwlDscd"]').val();
	                sParam.upAmtTpCd = this.$el.find('#detail-information-area [data-form-param="upAmtTpCd"]').val();


	                sParam.acctgPrcsYn = this.getYn(this.$el.find('#detail-information-area [data-form-param="acctgPrcsYn"]'));
	                sParam.actvYn = this.getYn(this.$el.find('#detail-information-area [data-form-param="actvYn"]'));




	                console.log(sParam);
	                var linkData = {"header": fn_getHeader(srvcCd), "CaAmtTpMgmtSvcGetAmtTpMgmtIn": sParam};


	                // ajax호출
	                bxProxy.post(sUrl, JSON.stringify(linkData), {
	                    enableLoading: true
	                    , success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


	                            that.resetDetailInformation();
	                            that.inquireSearchCondition();


	                        }
	                    }   // end of suucess: fucntion
	                }); // end of bxProxy




            	// fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-insert-msg'), saveData, this);


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


                        sub.amtTpCd = data.amtTpCd;
                        sub.amtTpCdNm =  data.amtTpCdNm;
                        sub.dpstWhdrwlDscd = data.dpstWhdrwlDscd;
                        sub.upAmtTpCd = data.upAmtTpCd;
                        sub.acctgPrcsYn = data.acctgPrcsYn;
                        sub.actvYn = data.actvYn;


                        table.push(sub);
                    });


                    sParam.tblNm = table;


                    console.log(sParam);
                    var linkData = {"header": fn_getHeader("CAPST0028301"), "CaAmtTpMgmtSvcDeleteAmtTpMgmtListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                that.deleteList = [];
                                that.inquireSearchCondition();
                                that.resetDetailInformation();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), saveData, this);
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


            /*
             * Reset
             */
            resetSearchCondition: function () {
            	this.deleteList = [];
                this.$el.find('#search-condition-area [data-form-param="amtTpCdNm"]').val("");
                this.$el.find('#search-condition-area [data-form-param="upAmtTpCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#search-condition-area [data-form-param="acctgPrcsYn"] option:eq(0)').attr("selected", "selected");


            },
            resetSearchResult: function () {
            	this.resetDetailInformation();
                this.CAPST002Grid.resetData();
                this.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt'));
            },
            resetDetailInformation: function () {
            	this.deleteList = [];
            	this.initFlag = true;
                this.$el.find('#detail-information-area [data-form-param="amtTpCd"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="amtTpCd"]').val("");
                this.$el.find('#detail-information-area [data-form-param="amtTpCdNm"]').val("");
                this.$el.find('#detail-information-area [data-form-param="dpstWhdrwlDscd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#detail-information-area [data-form-param="upAmtTpCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#detail-information-area [data-form-param="acctgPrcsYn"]').attr("checked", false);
                this.$el.find('#detail-information-area [data-form-param="actvYn"]').attr("checked", false);
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
                    	trnsfrKnd : "CDVAL_NAME",
                        trnsfrOriginKeyVal : '50026' + this.$el.find('#detail-information-area [data-form-param="amtTpCd"]').val()
                    }
                });
            },


            getYn: function(obj){
            	if($(obj).attr('checked'))
            		return "Y";
            	else
            		return "N";
            }


        }); // end of Backbone.View.extend({


        return CAPST002View;
    } // end of define function
); // end of define
