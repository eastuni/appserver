define(
    [
'bx/common/common-info',
        'text!app/views/page/CAPST/003/_CAPST003.html',
        'bx-component/ext-grid/_ext-grid'
    ],
    function (
        commonInfo,
        tpl,
        ExtGrid
    ) {

    	//20180426 참조잔액사용시기코드(refBalUseTmCd) 주석처리
        var comboStore1 = {}; // 여부
        var comboStore2 = {}; // 입출구분코드
        var comboStore3 = {}; // 잔액초기화주기코드
        var comboStore4 = {}; // 참조잔액사용시기코드
        var comboStore5 = {}; // 잔액갱신방법코드
        var comboStore6 = {}; // 잔액초기화기준일구분코드
        var comboStore7 = {}; // 잔액유형구분코드
        var deleteList = [];
        var initFlag = true;

        /**
         * Backbone
         */
        var CAPST003View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPST003-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                /*
                 * search-condition-area
                 */
            	'keydown .search-key' : 'fn_enter',
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
                'click #btn-multi-language': 'openMultiLanguagePage',
            },

            /**
             * 초기화
             */
            initialize: function (initData) {
                $.extend(this, initData);
                this.setComboStore();
                this.initData = initData;
                this.deleteList = [];
                this.initFlag = true;
                this.createGrid();

            },

            /**
             * 렌더
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find("#CAPST003Grid").html(this.CAPST003Grid.render({
                    'height': CaGridHeight
                }));
                this.setComboBoxes();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPST003-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPST003-wrap #btn-detail-information-save')
                                    			   ]);
                
                return this.$el;
            },

            /*
             * Set combo store
             */
            setComboStore: function () {
                var that = this;

                that.comboStore1 = {}; // 여부
                that.comboStore2 = {}; // 입출구분코드
                that.comboStore3 = {}; // 잔액초기화주기코드
                that.comboStore4 = {}; // 참조잔액사용시기코드
                that.comboStore5 = {}; // 잔액갱신방법코드
                that.comboStore6 = {}; // 잔액초기화기준일구분코드
                that.comboStore7 = {}; // 잔액유형구분코드

                var sParam = {};

                // 여부
                sParam = {};
                sParam.cdNbr = "10000";
                var linkData1 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };

                // 입출구분코드
                sParam = {};
                sParam.cdNbr = "50028";
                var linkData2 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };

                // 잔액초기화주기코드
                sParam = {};
                sParam.cdNbr = "80000";
                var linkData3 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };

                // 참조잔액사용시기코드
                sParam = {};
                sParam.cdNbr = "80012";
                var linkData4 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };


                // 잔액갱신방법코드
                sParam = {};
                sParam.cdNbr = "80002";
                var linkData5 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };


                // 잔액초기화기준일구분코드
                sParam = {};
                sParam.cdNbr = "80001";
                var linkData6 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };

                // 잔액유형구분코드
                sParam = {};
                sParam.cdNbr = "A0449";
                var linkData7 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };


                bxProxy.all([
   		              // 여부
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
   	            	  // 입출구분코드 콤보로딩
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
   	            	  // 잔액초기화주기코드 콤보로딩
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
   	            	// 잔액유형구분코드 콤보로딩
   	            	  , {
                        url: sUrl,
                        param: JSON.stringify(linkData7),
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                that.comboStore7 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }

   	            	  // 참조잔액사용시기코드 콤보로딩
   	            	  , {
                        url: sUrl,
                        param: JSON.stringify(linkData4),
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                that.comboStore4 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }
   	            	  // 잔액갱신방법코드 콤보로딩
   	            	  , {
                        url: sUrl,
                        param: JSON.stringify(linkData5),
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                that.comboStore5 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }
   	            	  // 잔액초기화기준일구분코드 콤보로딩
   	            	  , {
                        url: sUrl,
                        param: JSON.stringify(linkData6),
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                that.comboStore6 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }
   	          ], {
                    success: function () {

                    }
                });
            },

            /** 
             * Create search results grid
             */
            createGrid: function () {
                var that = this;

                this.CAPST003Grid = new ExtGrid({
                    //  그리드 컬럼 정의
                    fields: ['No', 'balTpCd', 'balTpCdNm', 'balTpDscd', 'balInitzCyclCd', 'balInitzBaseDayDscd', 'refBalTpCd', 'refBalTpCdNm'
      	                               		, 'refBalUseTmCd', 'balUpdtWayCd', 'balUpdtDpstWhdrwlDscd'
      	                               		, 'balUpdtClassNm', 'updtJdgmntMthdNm', 'actvYn'
      	                                 , 'lastChngTmstmp', 'lastChngGuid', 'engNm'],
                    id: 'STSingleGrid',
                    columns: [
                            {
                                text: bxMsg('cbb_items.SCRNITM#No'),
                                dataIndex: 'rowIndex',
                                sortable: false,
                                width: 50,
                                height: 25,
                                style: 'text-align:center',
                                align: 'center'
                                    // other config you need.. 
                                    ,
                                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                    return rowIndex + 1;
                                }
      	    						 }
      	                          // 잔액유형코드
      	                          , {
                                text: bxMsg('cbb_items.AT#balTpCd'),
                                width: 100,
                                dataIndex: 'balTpCd',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1
                            }
      	                          // 잔액유형코드명
      	                          , {
                                text: bxMsg('cbb_items.AT#balTpCdNm'),
                                dataIndex: 'balTpCdNm',
                                width: 150,
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1
                            }
      	                          // 영문명
      	                          , {
                                text: bxMsg('cbb_items.AT#engNm'),
                                dataIndex: 'engNm',
                                width: 150,
                                style: 'text-align:center',
                                align: 'center',
                                hidden: true
                            }

      	                          // 잔액유형구분코드
      	                          , {
                                text: bxMsg('cbb_items.SCRNITM#balTpDstnctn'),
                                width: 120,
                                dataIndex: 'balTpDscd',
                                style: 'text-align:center',
                                align: 'center',
                                editor: {
                                    xtype: 'combobox',
                                    store: that.comboStore7,
                                    displayField: 'cdNm',
                                    valueField: 'cd'
                                },
                                flex: 1,
                                renderer: function (val) {
                                        index = that.comboStore7.findExact('cd', val);
                                        if (index != -1) {
                                            rs = that.comboStore7.getAt(index).data;
                                            return rs.cdNm;
                                        }
                                    } // end of render
      	                          } // end of 잔액유형구분코드 

      	                          // 잔액초기화주기코드
      	                          , {
                                text: bxMsg('cbb_items.SCRNITM#balInitzCycl'),
                                width: 120,
                                dataIndex: 'balInitzCyclCd',
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
                                    } // end of render
      	                          } // end of 잔액초기화주기코드
      	                          // 잔액초기화기준일구분코드
      	                          , {
                                text: bxMsg('cbb_items.AT#balInitzBaseDayDscd'),
                                width: 130,
                                dataIndex: 'balInitzBaseDayDscd',
                                style: 'text-align:center',
                                align: 'center',
                                editor: {
                                    xtype: 'combobox',
                                    store: that.comboStore6,
                                    displayField: 'cdNm',
                                    valueField: 'cd'
                                   
                                },
                                hidden: true,
                                renderer: function (val) {
                                        index = that.comboStore6.findExact('cd', val);
                                        if (index != -1) {
                                            rs = that.comboStore6.getAt(index).data;
                                            return rs.cdNm;
                                        }
                                    } // end of render
      	                          } // end of 잔액초기화기준일구분코드
      	                          // 잔액갱신방법
      	                          , {
                                text: bxMsg('cbb_items.SCRNITM#balUpdtWay'),
                                width: 130,
                                dataIndex: 'balUpdtWayCd',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1,
                                editor: {
                                    xtype: 'combobox',
                                    store: that.comboStore5,
                                    displayField: 'cdNm',
                                    valueField: 'cd'
                                },
                                renderer: function (val) {
                                        index = that.comboStore5.findExact('cd', val);
                                        if (index != -1) {
                                            rs = that.comboStore5.getAt(index).data;
                                            return rs.cdNm;
                                        }
                                    } // end of render
      	                          } // end of 잔액갱신방법
      	                          // 잔액갱신대상입출구분코드
      	                          , {
                                text: bxMsg('cbb_items.AT#balUpdtDpstWhdrwlDscd'),
                                width: 130,
                                dataIndex: 'balUpdtDpstWhdrwlDscd',
                                style: 'text-align:center',
                                align: 'center',
                                editor: {
                                    xtype: 'combobox',
                                    store: that.comboStore2,
                                    displayField: 'cdNm',
                                    valueField: 'cd'
                                    
                                },
                                hidden: true,
                                renderer: function (val) {
                                        index = that.comboStore2.findExact('cd', val);
                                        if (index != -1) {
                                            rs = that.comboStore2.getAt(index).data;
                                            return rs.cdNm;
                                        }
                                    } // end of render
      	                          } // end of 잔액갱신대상입출구분코드
      	                          // 잔액갱신클래스명
      	                          , {
                                text: bxMsg('cbb_items.AT#balUpdtClassNm'),
                                width: 150,
                                dataIndex: 'balUpdtClassNm',
                                style: 'text-align:center',
                                align: 'center',
                                hidden: true
                            }
      	                          // 갱신판단메소드명
      	                          , {
                                text: bxMsg('cbb_items.AT#updtJdgmntMthdNm'),
                                width: 200,
                                dataIndex: 'updtJdgmntMthdNm',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1
                            }
      	                    // 참조잔액유형코드
      	                    , {
                                text: bxMsg('cbb_items.AT#refBalTpCd'),
                                width: 110,
                                dataIndex: 'refBalTpCd',
                                style: 'text-align:center',
                                align: 'center',
                                hidden: true
                            }
      	                    

	                          // 참조잔액유형코드명
	                          , {
                          text: bxMsg('cbb_items.SCRNITM#refBalTp'),
                          dataIndex: 'refBalTpCdNm',
                          width: 120,
                          style: 'text-align:center',
                          align: 'center',
                          flex: 1
                         
                      }
      	                          // 활동여부
      	                          , {
                                text: bxMsg('cbb_items.AT#actvYn'),
                                width: 100,
                                dataIndex: 'actvYn',
                                style: 'text-align:center',
                                align: 'center',
                                editor: {
                                    xtype: 'combobox',
                                    store: that.comboStore1,
                                    displayField: 'cdNm',
                                    valueField: 'cd'
                                },
                                renderer: function (val) {
                                        index = that.comboStore1.findExact('cd', val);
                                        if (index != -1) {
                                            rs = that.comboStore1.getAt(index).data;
                                            var classNm = "s-no";
                                            var val = rs.cd;

                                            if (val == "Y") {
                                                classNm = "s-yes";
                                            }
                                            return "<span class=\"bw-sign " + classNm + "\">" + val + "</span>";
                                        }
                                    } // end of render
      	                          } // end of 활동여부
      	           
      	                          // 참조잔액사용시기코드
//      	                          , {
//                                text: bxMsg('cbb_items.AT#refBalUseTmCd'),
//                                width: 130,
//                                dataIndex: 'refBalUseTmCd',
//                                style: 'text-align:center',
//                                align: 'center',
//                                editor: {
//                                    xtype: 'combobox',
//                                    store: that.comboStore4,
//                                    displayField: 'cdNm',
//                                    valueField: 'cd'
//                                },
//                                hidden: true,
//                                renderer: function (val) {
//                                        index = that.comboStore4.findExact('cd', val);
//                                        if (index != -1) {
//                                            rs = that.comboStore4.getAt(index).data;
//                                            return rs.cdNm;
//                                        }
//                                    } // end of render
//      	                          } // end of 참조잔액사용시기코드
      	                   , {
                                text: '',
                                width: 0,
                                dataIndex: 'lastChngTmstmp',
                                hidden: true
                            } // 최종변경일시
      	                          , {
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
                                        	//|| e.field == 'refBalUseTmCd'
                                            if (e.field == 'balTpDscd' || e.field == 'balInitzCyclCd' || e.field == 'balInitzBaseDayDscd' || e.field == 'refBalTpCd' || e.field == 'balUpdtWayCd' || e.field == 'balUpdtDpstWhdrwlDscd' || e.field == 'actvYn') {
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
             *  Select a grid record
             */
            selectRecord: function () {
                var that = this;
                
                if(!this.CAPST003Grid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPST003Grid.grid.getSelectionModel().selected.items[0].data;
                that.initFlag = false;
                if (!selectedRecord) {
                    return;
                }

                that.$el.find('#detail-information-area [data-form-param="balTpCd"]').prop("disabled", true);
                that.$el.find('#detail-information-area [data-form-param="balTpCd"]').val(selectedRecord.balTpCd);
                that.$el.find('#detail-information-area [data-form-param="balTpCdNm"]').val(selectedRecord.balTpCdNm);
                that.$el.find('#detail-information-area [data-form-param="balTpDstnctn"]').val(selectedRecord.balTpDscd);
                that.$el.find('#detail-information-area [data-form-param="balInitzCycl"]').val(selectedRecord.balInitzCyclCd);
                that.$el.find('#detail-information-area [data-form-param="balInitzBaseDay"]').val(selectedRecord.balInitzBaseDayDscd);
                that.$el.find('#detail-information-area [data-form-param="balUpdtWay"]').val(selectedRecord.balUpdtWayCd);
                that.$el.find('#detail-information-area [data-form-param="balUpdtDpstAndWhdrwlOfMnyDstnctn"]').val(selectedRecord.balUpdtDpstWhdrwlDscd);
                that.$el.find('#detail-information-area [data-form-param="balUpdtClassNm"]').val(selectedRecord.balUpdtClassNm);
                that.$el.find('#detail-information-area [data-form-param="updtJdgmntMthdNm"]').val(selectedRecord.updtJdgmntMthdNm);
                that.$el.find('#detail-information-area [data-form-param="refBalTp"]').val(selectedRecord.refBalTpCd);
//                that.$el.find('#detail-information-area [data-form-param="refBalUseTmCd"]').val(selectedRecord.refBalUseTmCd);
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
                var param = that.settedParam;
                var sParam = {};
                // 입력 Key값이 없는 경우 전역변수에 저장된 Key값을 사용
                sParam.balTpCd = this.$el.find('#search-condition-area  [data-form-param="balTpCd"]').val()
                sParam.balTpCdNm = this.$el.find('#search-condition-area  [data-form-param="balTpCdNm"]').val()
                sParam.balInitzCyclCd = this.$el.find('#search-condition-area  [data-form-param="balInitzCycl"]').val()
                sParam.refBalTpCd = this.$el.find('#search-condition-area  [data-form-param="refBalTp"]').val()
                console.log(sParam);
                var linkData = {
                    "header": fn_getHeader("CAPST0038400"),
                    "CaBalTpMgmtSvcGetBalTpMgmtListIn": sParam
                };

                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            if (responseData.CaBalTpMgmtSvcGetBalTpMgmtListOut.tblNm) {
                                var tbList = responseData.CaBalTpMgmtSvcGetBalTpMgmtListOut.tblNm;
                                var totalCount = tbList.length;

                                if (tbList != null || tbList.length > 0) {
                                    that.CAPST003Grid.setData(tbList);
                                    that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt') + " (" + fn_setComma(totalCount) + " " + bxMsg('cbb_items.SCRNITM#cnt') + ")");

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
                 *  잔액초기화주기
                 */
                sParam = {};
                sParam.className = "CAPST003-balInitzCycl-wrap";
                sParam.targetId = "balInitzCycl";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select');
                sParam.cdNbr = "80000";
                fn_getCodeList(sParam, this);

                /*
                 *  참조잔액유형
                 */
                sParam = {};
                sParam.className = "CAPST003-refBalTp-wrap";
                sParam.targetId = "refBalTp";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select');
                sParam.cdNbr = "50025";
                sParam.viewType = "ValNm"
                fn_getCodeList(sParam, this);

                /*
                 *  잔액유형구분
                 */
                sParam = {};
                sParam.className = "CAPST003-balTpDstnctn-wrap";
                sParam.targetId = "balTpDstnctn";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select');
                sParam.cdNbr = "A0449";
                fn_getCodeList(sParam, this);

                /*
                 *  잔액초기화기준일
                 */
                sParam = {};
                sParam.className = "CAPST003-balInitzBaseDay-wrap";
                sParam.targetId = "balInitzBaseDay";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select');
                sParam.cdNbr = "80001";
                fn_getCodeList(sParam, this);

                /*
                 *  잔액갱신방법
                 */
                sParam = {};
                sParam.className = "CAPST003-balUpdtWay-wrap";
                sParam.targetId = "balUpdtWay";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select');
                sParam.cdNbr = "80002";
                fn_getCodeList(sParam, this);

                /*
                 *  잔액갱신대상입출구분
                 */
                sParam = {};
                sParam.className = "CAPST003-balUpdtDpstAndWhdrwlOfMnyDstnctn-wrap";
                sParam.targetId = "balUpdtDpstAndWhdrwlOfMnyDstnctn";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "50028";
                fn_getCodeList(sParam, this);

                /*
                 *  참조잔액사용시기코드
                 */
//                sParam = {};
//                sParam.className = "CAPST003-refBalUseTmCd-wrap";
//                sParam.targetId = "refBalUseTmCd";
//                sParam.nullYn = "Y";
//                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
//                sParam.cdNbr = "80012";
//                fn_getCodeList(sParam, this);


            },
            
            /*
             *  Add new balance type
             */
            saveDetailInformation: function(){
            	
            		var that = this;
	                var sParam = {};
	                var srvcCd = "";
	                if(this.initFlag) srvcCd = "CAPST0038100";
	                else srvcCd = "CAPST0038200";
	                
					//배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }
	                
	                sParam.balTpCd = this.$el.find('#detail-information-area [data-form-param="balTpCd"]').val();
	                sParam.balTpCdNm =  this.$el.find('#detail-information-area [data-form-param="balTpCdNm"]').val();
	                sParam.balTpDscd = this.$el.find('#detail-information-area [data-form-param="balTpDstnctn"]').val();
	                sParam.balInitzCyclCd = this.$el.find('#detail-information-area [data-form-param="balInitzCycl"]').val();
	                sParam.balInitzBaseDayDscd = this.$el.find('#detail-information-area [data-form-param="balInitzBaseDay"]').val();
	                sParam.balUpdtWayCd = this.$el.find('#detail-information-area [data-form-param="balUpdtWay"]').val();
	                sParam.balUpdtDpstWhdrwlDscd = this.$el.find('#detail-information-area [data-form-param="balUpdtDpstAndWhdrwlOfMnyDstnctn"]').val();
	                sParam.balUpdtClassNm = this.$el.find('#detail-information-area [data-form-param="balUpdtClassNm"]').val();
	                sParam.updtJdgmntMthdNm = this.$el.find('#detail-information-area [data-form-param="updtJdgmntMthdNm"]').val();
	                sParam.refBalTpCd = this.$el.find('#detail-information-area [data-form-param="refBalTp"]').val();
//	                sParam.refBalUseTmCd = this.$el.find('#detail-information-area [data-form-param="refBalUseTmCd"]').val();
	                sParam.actvYn = this.getYn(this.$el.find('#detail-information-area [data-form-param="actvYn"]'));

	                if(fn_isNull(sParam.balTpCd)){
                    	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#balTpCd')+"]");
	                  	return;
                    }
	                if(isNaN(sParam.balTpCd) == true){ //문자체크
	                	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#chkDigitMsg') + "["+bxMsg('cbb_items.AT#balTpCd')+"]");
	                  	return;
	                }
	                if(fn_isNull(sParam.balTpCdNm)){
	                	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#balTpCdNm')+"]");
	                	return;
	                }
	                if(fn_isNull(sParam.balTpDscd)){
	                	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#balTpDscd')+"]");
	                	return;
	                }
	                if(fn_isNull(sParam.balInitzCyclCd)){
	                	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#balInitzCyclCd')+"]");
	                	return;
	                }
	                if(fn_isNull(sParam.balInitzBaseDayDscd)){
	                	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#balInitzBaseDayDscd')+"]");
	                	return;
	                }
	                if(fn_isNull(sParam.balUpdtWayCd)){
	                	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-mandatory-data-msg') + "["+bxMsg('cbb_items.AT#balUpdtWayCd')+"]");
	                	return;
	                }
	                
	                console.log(sParam);
	                var linkData = {"header": fn_getHeader(srvcCd), "CaBalTpMgmtSvcGetBalTpMgmtIn": sParam};
	
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
                        
                        sub.balTpCd = data.balTpCd;
                        sub.balTpCdNm =  data.balTpCdNm;
                        sub.balTpDscd = data.balTpDscd;
                        sub.balInitzCyclCd = data.balInitzCyclCd;
                        sub.balInitzBaseDayDscd = data.balInitzBaseDayDscd;
                        sub.balUpdtWayCd = data.balUpdtWayCd;
                        sub.balUpdtDpstWhdrwlDscd = data.balUpdtDpstWhdrwlDscd;
                        sub.balUpdtClassNm = data.balUpdtClassNm;
                        sub.updtJdgmntMthdNm = data.updtJdgmntMthdNm;
                        sub.refBalTpCd = data.refBalTpCd;
//                        sub.refBalUseTmCd = data.refBalUseTmCd;
                        sub.actvYn = data.actvYn;

                        table.push(sub);
                    });

                    sParam.tblNm = table;

                    console.log(sParam);
                    var linkData = {"header": fn_getHeader("CAPST0038301"), "CaBalTpMgmtSvcDeleteBalTpMgmtListIn": sParam};

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
            	this.$el.find('#search-condition-area [data-form-param="balTpCd"]').val("");
                this.$el.find('#search-condition-area [data-form-param="balTpCdNm"]').val("");
                this.$el.find('#search-condition-area [data-form-param="balInitzCycl"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#search-condition-area [data-form-param="refBalTp"] option:eq(0)').attr("selected", "selected");

            },
            resetSearchResult: function () {
            	this.deleteList = [];
            	this.resetDetailInformation();
                this.CAPST003Grid.resetData();
                this.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt'));
            },
            resetDetailInformation: function () {
            	this.initFlag = true;
            	 this.$el.find('#detail-information-area [data-form-param="balTpCd"]').attr("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="balTpCd"]').val("");
                this.$el.find('#detail-information-area [data-form-param="balTpCdNm"]').val("");
                this.$el.find('#detail-information-area [data-form-param="balUpdtClassNm"]').val("");
                this.$el.find('#detail-information-area [data-form-param="updtJdgmntMthdNm"]').val("");
                this.$el.find('#detail-information-area [data-form-param="balTpDstnctn"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#detail-information-area [data-form-param="balInitzCycl"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#detail-information-area [data-form-param="balInitzBaseDay"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#detail-information-area [data-form-param="balUpdtWay"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#detail-information-area [data-form-param="balUpdtDpstAndWhdrwlOfMnyDstnctn"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#detail-information-area [data-form-param="refBalTp"] option:eq(0)').attr("selected", "selected");
//                this.$el.find('#detail-information-area [data-form-param="refBalUseTmCd"] option:eq(0)').attr("selected", "selected");
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
                        trnsfrOriginKeyVal : '50025' +  this.$el.find('#detail-information-area [data-form-param="balTpCd"]').val()
                        
                    }
                });
            },

            getYn: function(obj){
            	if($(obj).attr('checked'))
            		return "Y";
            	else
            		return "N";
            },
            
            fn_enter: function (event) {
                var that = this;
                var event = event || window.event;
                var keyID = (event.which) ? event.which : event.keyCode;
                if(keyID == 13) { //enter
                	that.inquireSearchCondition();
                }
            }

        }); // end of Backbone.View.extend({

        return CAPST003View;
    } // end of define function
); // end of define