define(
    [
     	'bx/common/common-info',
        'text!app/views/page/CAPAM/010/_CAPAM010.html',
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
        var deleteListOfSrchRltItmTbl = [];
        
        var initFlag = true;


        /**
         * Backbone
         */
        var CAPAM010View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPAM010-page',
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
                 * assessment-item-area
                 */
                'click #btn-assessment-item-reset': 'resetAssessmentItem',
                'click #btn-assessment-item-save': 'saveAssessmentItem',
                'click #btn-assessment-item-toggle': 'toggleAssessmentItem',
                
                
                /*
                 * search-result-assessment-item-table-area
                 */
                'click #btn-search-item-table-result-reset': 'resetSearchResultItemTable',
                'click #btn-search-item-table-result-save': 'saveSearchResultItemTable',
                'click #btn-search-item-table-result-move-up': 'moveUpSearchResultItemTable',
                'click #btn-search-item-table-result-move-down': 'moveDownSearchResultItemTable',
                'click #btn-search-item-table-result-toggle': 'toggleSearchResultItemTable',


                /*
                 * assessment-item-table-area
                 */
                'click #btn-assessment-item-table-reset': 'resetAssessmentItemTable',
                'click #btn-assessment-item-table-save': 'saveAssessmentItemTable',
                'click #btn-assessment-item-table-toggle': 'toggleAssessmentItemTable',
                

            },


            /**
             * initialize
             */
            initialize: function (initData) {
                $.extend(this, initData);

                this.initData = initData;
                this.setComboStore();
                this.deleteList = [];
                this.deleteListOfSrchRltItmTbl = [];
                this.initFlag = true;
                this.createGrid();
                this.resetSearchCondition();


            },


            /**
             * Render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find("#CAPAM010SrchRsltGrid").html(this.CAPAM010SrchRsltGrid.render({'height': "400px"}));
                this.$el.find("#CAPAM010SrchRsltItmTblGrid").html(this.CAPAM010SrchRsltItmTblGrid.render({'height': "300px"}));
                this.setComboBoxes();
                this.setDatePicker();
                
                
              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPAM010-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPAM010-wrap #btn-assessment-item-save')
        	                               	,this.$el.find('.CAPAM010-wrap #btn-search-item-table-result-save')
                                     		,this.$el.find('.CAPAM010-wrap #btn-assessment-item-table-save')
                                    			   ]);
                return this.$el;
            },




            /*
             *  Set combo store
             */


            setComboStore: function () {
                var that = this;


                that.comboStore1 = {}; // 심사항목타입코드  asmItmTpCd
                that.comboStore2 = {}; // 심사항목원천구분코드   asmItmOriginDscd
                that.comboStore3 = {}; // 속성타입코드   atrbtTpCd

                var sParam = {};

                // 심사항목타입코드
                sParam = {};
                sParam.cdNbr = "A1016";
                var linkData1 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };

                // 심사항목원천구분코드
                sParam = {};
                sParam.cdNbr = "A1017";
                var linkData2 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };

                // 속성타입코드
                sParam = {};
                sParam.cdNbr = "10001";
                var linkData3 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };


                
                bxProxy.all([
  		              // 심사항목타입코드 콤보코드 로딩
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
  	            	  // 심사항목원천구분코드 콤보로딩
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
  	            	  // 속성타입코드 콤보로딩
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


                this.CAPAM010SrchRsltGrid = new ExtGrid({
                    //  그리드 컬럼 정의
                    fields: ['No', 'asmItmId', 'asmItmNm', 'asmItmTpCd', 'asmItmRmkCntnt', 'asmItmOriginDscd', 'rgstrnDt'],


                    id: 'CAPAM010SrchRsltGrid',
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

                            // 심사항목식별자
                            {
                                text: bxMsg('cbb_items.AT#asmItmId'),
                                //width: 100,
                                dataIndex: 'asmItmId',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1
                            }, // end of 심사항목식별자

                            // 심사항목명
                            {
                                text: bxMsg('cbb_items.AT#asmItmNm'),
                                //width: 100,
                                dataIndex: 'asmItmNm',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1
                            }, // end of 심사항목명

                            // 심사항목타입코드
                            {
                                text: bxMsg('cbb_items.AT#asmItmTpCd'),
                                //width: 100,
                                flex: 1,
                                dataIndex: 'asmItmTpCd',
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
                                            return rs.cdNm;
                                        }
                                } // end of render
                            },
                            

                            // 심사항목비고내용
                            {
                                text: bxMsg('cbb_items.AT#asmItmRmkCntnt'),
                                //width: 100,
                                dataIndex: 'asmItmRmkCntnt',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1
                            }, // end of 심사항목명                            
                            
                            // 심사항목원천구분코드
                            {
                                text: bxMsg('cbb_items.AT#asmItmOriginDscd'),
                                //width: 100,
                                flex: 1,
                                dataIndex: 'asmItmOriginDscd',
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
                                            return rs.cdNm;
                                        }
                                } // end of render
                            },
                                                        
                            // 등록년월일 
                            {
                                text: bxMsg('cbb_items.AT#rgstrnDt'),
                                //width: 100,
                                dataIndex: 'rgstrnDt',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1,
                             	renderer : function(val,metaData, record) {
      		                		return XDate(val).toString('yyyy-MM-dd');
                      	        }
                            },
                            
                            // 삭제아이콘
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
                                                return false;
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
                                that.selectSrchRltGridRecord();
                            }
                        }
                    }
                });
                

                this.CAPAM010SrchRsltItmTblGrid = new ExtGrid({
                    //  그리드 컬럼 정의
                    fields: ['No', 'asmItmId', 'columnSeq', 'atrbtNm', 'atrbtTpCd', 'rgstrnDt'],


                    id: 'CAPAM010SrchRsltItmTblGrid',
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

                            // 심사항목식별자
                            {
                                text: bxMsg('cbb_items.AT#asmItmId'),
                                //width: 100,
                                dataIndex: 'asmItmId',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1
                            }, // end of 심사항목식별자

                            // 칼럼순서
                            {
                                text: bxMsg('cbb_items.AT#columnSeq'),
                                //width: 100,
                                dataIndex: 'columnSeq',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1
                            }, // end of 칼럼순서

                            // 속성명
                            {
                                text: bxMsg('cbb_items.AT#atrbtNm'),
                                //width: 100,
                                dataIndex: 'atrbtNm',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1
                            }, // end of 속성명                            
                            
                            // 속성타입코드
                            {
                                text: bxMsg('cbb_items.AT#atrbtTpCd'),
                                //width: 100,
                                flex: 1,
                                dataIndex: 'atrbtTpCd',
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
                            },
                            
                            // 등록년월일 
                            {
                                text: bxMsg('cbb_items.AT#rgstrnDt'),
                                //width: 100,
                                dataIndex: 'rgstrnDt',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1,
                             	renderer : function(val,metaData, record) {
      		                		return XDate(val).toString('yyyy-MM-dd');
                      	        }
                            },
                            
                            // 삭제아이콘
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
                                                     that.deleteListOfSrchRltItmTbl.push(record.data);
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
                                                return false;
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
                                that.selectSrchRsltItmTblGridRecord();
                            }
                        }
                    }
                });
                

            },


            /*
             * selectSrchRltGridRecord
             */
            selectSrchRltGridRecord: function () {
                var that = this;


                if(!this.CAPAM010SrchRsltGrid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPAM010SrchRsltGrid.grid.getSelectionModel().selected.items[0].data;
                that.initFlag = false;
                that.$el.find('#assessment-item-area [data-form-param="asmItmId"]').val(selectedRecord.asmItmId);
                that.$el.find('#assessment-item-area [data-form-param="asmItmId"]').prop("disabled", true);

                that.$el.find('#assessment-item-area [data-form-param="asmItmNm"]').val(selectedRecord.asmItmNm);
                that.$el.find('#assessment-item-area [data-form-param="asmItmNm"]').prop("disabled", false);
                
                that.$el.find('#assessment-item-area [data-form-param="asmItmTpCd"]').val(selectedRecord.asmItmTpCd);
                that.$el.find('#assessment-item-area [data-form-param="asmItmTpCd"]').prop("disabled", false);

                that.$el.find('#assessment-item-area [data-form-param="asmItmRmkCntnt"]').val(selectedRecord.asmItmRmkCntnt);
                that.$el.find('#assessment-item-area [data-form-param="asmItmRmkCntnt"]').prop("disabled", false);

                that.$el.find('#assessment-item-area [data-form-param="asmItmOriginDscd"]').val(selectedRecord.asmItmOriginDscd);
                that.$el.find('#assessment-item-area [data-form-param="asmItmOriginDscd"]').prop("disabled", false);

                that.$el.find('#assessment-item-area [data-form-param="rgstrnDt"]').val(XDate(selectedRecord.rgstrnDt).toString('yyyy-MM-dd'));
                that.$el.find('#assessment-item-area [data-form-param="rgstrnDt"]').prop("disabled", false);
                
                // 심사항목타입코드 
                var asmItmTpCd = this.$el.find('#assessment-item-area  [data-form-param="asmItmTpCd"]').val();
                console.log(asmItmTpCd);

                if (asmItmTpCd == 'TB') {
                	that.inquireSearcItemTableCondition();	

                	that.$el.find('#btn-search-item-table-result-reset').prop("disabled", false);
                	that.$el.find('#btn-search-item-table-result-save').prop("disabled", false);
                	that.$el.find('#btn-search-item-table-result-move-up').prop("disabled", false);
                	that.$el.find('#btn-search-item-table-result-move-down').prop("disabled", false);
                	that.$el.find('#btn-assessment-item-table-reset').prop("disabled", false);
                	that.$el.find('#btn-assessment-item-table-save').prop("disabled", false);
                }
                else {
                	that.resetSearchResultItemTable();
                	
                	that.$el.find('#btn-search-item-table-result-reset').prop("disabled", true);
                	that.$el.find('#btn-search-item-table-result-save').prop("disabled", true);
                	that.$el.find('#btn-search-item-table-result-move-up').prop("disabled", true);
                	that.$el.find('#btn-search-item-table-result-move-down').prop("disabled", true);
                	that.$el.find('#btn-assessment-item-table-reset').prop("disabled", true);
                	that.$el.find('#btn-assessment-item-table-save').prop("disabled", true);
                }
                
            },


            /*
             * selectSrchRltGridRecord   
             */
            selectSrchRsltItmTblGridRecord: function () {
                var that = this;


                if(!this.CAPAM010SrchRsltItmTblGrid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPAM010SrchRsltItmTblGrid.grid.getSelectionModel().selected.items[0].data;
                that.initFlag = false;
                that.$el.find('#assessment-item-table-area [data-form-param="asmItmId"]').val(selectedRecord.asmItmId);
                that.$el.find('#assessment-item-table-area [data-form-param="asmItmId"]').prop("disabled", true);

                that.$el.find('#assessment-item-table-area [data-form-param="columnSeq"]').val(selectedRecord.columnSeq);
                that.$el.find('#assessment-item-table-area [data-form-param="columnSeq"]').prop("disabled", true);
                
                that.$el.find('#assessment-item-table-area [data-form-param="atrbtNm"]').val(selectedRecord.atrbtNm);
                that.$el.find('#assessment-item-table-area [data-form-param="atrbtNm"]').prop("disabled", false);

                that.$el.find('#assessment-item-table-area [data-form-param="atrbtTpCd"]').val(selectedRecord.atrbtTpCd);
                that.$el.find('#assessment-item-table-area [data-form-param="atrbtTpCd"]').prop("disabled", false);

                that.$el.find('#assessment-item-table-area [data-form-param="rgstrnDt"]').val(XDate(selectedRecord.rgstrnDt).toString('yyyy-MM-dd'));
                that.$el.find('#assessment-item-table-area [data-form-param="rgstrnDt"]').prop("disabled", false);
            },


            /*
             * Inquire with search conditions    심사항목목록조회 
             */
            inquireSearchCondition: function () {
            	this.resetAssessmentItem();


                var that = this;
                var sParam = {};

                sParam.instCd       = $.sessionStorage('headerInstCd');
                // 입력 Key값이 없는 경우 전역변수에 저장된 Key값을 사용
                sParam.asmItmNm = this.$el.find('#search-condition-area  [data-form-param="asmItmNm"]').val();


                var linkData = {
                    "header": fn_getHeader("CAPAM0100401"),
                    "CaAsmItmMgmtSvcGetAsmItmListIn": sParam
                };


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {

                        if (fn_commonChekResult(responseData)) {
                            if (responseData.CaAsmItmMgmtSvcGetAsmItmListOut.asmItmList) {
                                var tbList = responseData.CaAsmItmMgmtSvcGetAsmItmListOut.asmItmList;
                                var totCnt = tbList.length;


                                if (tbList != null || tbList.length > 0) {
                                    that.CAPAM010SrchRsltGrid.setData(tbList);
                                    that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt') + " (" + fn_setComma(totCnt) + " " + bxMsg('cbb_items.SCRNITM#cnt') + ")");
                                }
                            }
                        }
                    }
                });
            },

            /*
             * Inquire with search conditions    심사항목테이블목록조회 
             */
            inquireSearcItemTableCondition: function () {
            	this.resetSearchResultItemTable();


                var that = this;
                var sParam = {};

                sParam.instCd       = $.sessionStorage('headerInstCd');
                // 입력 Key값이 없는 경우 전역변수에 저장된 Key값을 사용
                sParam.asmItmId = this.$el.find('#assessment-item-area  [data-form-param="asmItmId"]').val();


                var linkData = {
                    "header": fn_getHeader("CAPAM0100402"),
                    "CaAsmItmMgmtSvcGetAsmItmTblListIn": sParam
                };


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {

                        if (fn_commonChekResult(responseData)) {
                            if (responseData.CaAsmItmMgmtSvcGetAsmItmTblListOut.asmItmTblList) {
                                var tbList = responseData.CaAsmItmMgmtSvcGetAsmItmTblListOut.asmItmTblList;
                                var totCnt = tbList.length;


                                if (tbList != null || tbList.length > 0) {
                                    that.CAPAM010SrchRsltItmTblGrid.setData(tbList);
                                    that.$el.find("#srchItmTblRsltCount").html(bxMsg('cbb_items.SCRNITM#srchAsmItmTblRslt') + " (" + fn_setComma(totCnt) + " " + bxMsg('cbb_items.SCRNITM#cnt') + ")");
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
                 *  심사항목타입코드
                 */
                sParam = {};
                sParam.className = "CAPAM010-asmItmTpCd-wrap";
                sParam.targetId = "asmItmTpCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A1016";
                fn_getCodeList(sParam, this);


                /*
                 *  심사항목원천구분코드
                 */
                sParam = {};
                sParam.className = "CAPAM010-asmItmOriginDscd-wrap";
                sParam.targetId = "asmItmOriginDscd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A1017";
                sParam.viewType = "ValNm"
                fn_getCodeList(sParam, this);


                /*
                 *  속성타입코드
                 */
                sParam = {};
                sParam.className = "CAPAM010-atrbtTpCd-wrap";
                sParam.targetId = "atrbtTpCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "10001";
                sParam.viewType = "ValNm"
                fn_getCodeList(sParam, this);
                
            },

            
            /**
             * 달력생성
             */
            setDatePicker: function () {
                fn_makeDatePicker(this.$el.find('#assessment-item-area [data-form-param="rgstrnDt"]'));
                fn_makeDatePicker(this.$el.find('#assessment-item-table-area [data-form-param="rgstrnDt"]'));
            },


            /*
             *  Save new assessment Item 
             */
            saveAssessmentItem: function(){


            		var that = this;
	                var sParam = {};
	                var srvcCd = "CAPAM0100101";
	                
	                
	              //배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }
	                sParam.instCd       = $.sessionStorage('headerInstCd');
	                sParam.asmItmId = this.$el.find('#assessment-item-area [data-form-param="asmItmId"]').val();
	                sParam.asmItmNm =  this.$el.find('#assessment-item-area [data-form-param="asmItmNm"]').val();
	                sParam.asmItmTpCd =  this.$el.find('#assessment-item-area [data-form-param="asmItmTpCd"]').val();
	                sParam.asmItmRmkCntnt =  this.$el.find('#assessment-item-area [data-form-param="asmItmRmkCntnt"]').val();
	                sParam.asmItmOriginDscd =  this.$el.find('#assessment-item-area [data-form-param="asmItmOriginDscd"]').val();
	                sParam.rgstrnDt   = fn_getDateValue(that.$el.find('#assessment-item-area [data-form-param="rgstrnDt"]').val());

	                console.log(sParam);
	                var linkData = {"header": fn_getHeader(srvcCd), "CaAsmItmMgmtSvcRegisterAsmItmIn": sParam};


	                // ajax호출
	                bxProxy.post(sUrl, JSON.stringify(linkData), {
	                    enableLoading: true
	                    , success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));

	                            that.resetAssessmentItem();     // 심사항목영역 초기화 
	                            that.inquireSearchCondition();  // 심사항목목록조회  재수행 

	                        }
	                    }   // end of suucess: fucntion
	                }); // end of bxProxy
            	// fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-insert-msg'), saveData, this);
            },


            /*
             * Confirm delete item - 심사항목 삭제 
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
                        sub.asmItmId = data.asmItmId;
                        sub.crdtrtgGradeCd =  data.crdtrtgGradeCd;
                        sub.asmItmTpCd = data.asmItmTpCd;
                        sub.asmItmRmkCntnt = data.asmItmRmkCntnt;
                        sub.asmItmOriginDscd = data.asmItmOriginDscd;
                        sub.rgstrnDt = data.rgstrnDt;
                        table.push(sub);
                    });

	                sParam.instCd       = $.sessionStorage('headerInstCd');
                    sParam.asmItmList = table;


                    console.log(sParam);
                    var linkData = {"header": fn_getHeader("CAPAM0100501"), "CaAsmItmMgmtSvcDeleteAsmItmIn": sParam};


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
             *  Save new assessment Item Table   심사항목테이블 생성 
             */
            saveAssessmentItemTable: function(){


            		var that = this;
	                var sParam = {};
	                var srvcCd = "CAPAM0100102";
	                
	                
	              //배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }
	                sParam.instCd       = $.sessionStorage('headerInstCd');
	                sParam.asmItmId = this.$el.find('#assessment-item-table-area [data-form-param="asmItmId"]').val();
	                sParam.columnSeq =  this.$el.find('#assessment-item-table-area [data-form-param="columnSeq"]').val();
	                sParam.atrbtNm =  this.$el.find('#assessment-item-table-area [data-form-param="atrbtNm"]').val();
	                sParam.atrbtTpCd =  this.$el.find('#assessment-item-table-area [data-form-param="atrbtTpCd"]').val();
	                sParam.rgstrnDt   = fn_getDateValue(that.$el.find('#assessment-item-table-area [data-form-param="rgstrnDt"]').val());

	                console.log(sParam);
	                var linkData = {"header": fn_getHeader(srvcCd), "CaAsmItmMgmtSvcRegisteAsmItmTblIn": sParam};


	                // ajax호출
	                bxProxy.post(sUrl, JSON.stringify(linkData), {
	                    enableLoading: true
	                    , success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));

	                            that.resetAssessmentItemTable();        // 심사항목테이블영역 초기화 
	                            that.inquireSearcItemTableCondition();  // 심사항목테이블목록조회  재수행 

	                        }
	                    }   // end of suucess: fucntion
	                }); // end of bxProxy
            	// fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-insert-msg'), saveData, this);
            },


            /*
             * Confirm delete item table - 심사항목테이블 삭제 
             */
            saveSearchResultItemTable: function(){
            	var that = this;

             	/*
            	 * if delete list is empty
            	 */
//            	if(that.deleteListOfSrchRltItmTbl.length == 0){
//            		fn_alertMessage("", bxMsg('cbb_items.SCRNITM#no-input-data-msg'));
//            		return;
//            	}
            	
            	//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }

                function saveTblData() {
                    var table = [];
                    var sParam = {};


                    //$(that.deleteListOfSrchRltItmTbl).each(function(idx, data) {
                    $(that.CAPAM010SrchRsltItmTblGrid.store.data.items).each(function(idx, data) {
                        var sub = {};
                        var data2 = data.data;
                        sub.asmItmId = data2.asmItmId;
                        sub.columnSeq =  data2.columnSeq;
                        sub.atrbtNm = data2.atrbtNm;
                        sub.atrbtTpCd = data2.atrbtTpCd;
                        sub.rgstrnDt = data2.rgstrnDt;
                        table.push(sub);
                    });

	                sParam.instCd        = $.sessionStorage('headerInstCd');
	                sParam.asmItmId      = that.$el.find('#assessment-item-area [data-form-param="asmItmId"]').val();
                    sParam.asmItmTblList = table;


                    console.log(sParam);
                    var linkData = {"header": fn_getHeader("CAPAM0100502"), "CaAsmItmMgmtSvcDeleteAsmItmTblIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                that.deleteListOfSrchRltItmTbl = [];
                                that.inquireSearcItemTableCondition();
                                that.resetAssessmentItemTable();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), saveTblData, this);
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
            toggleAssessmentItem: function () {
                fn_pageLayerCtrl(this.$el.find('#assessment-item-area'), this.$el.find("#btn-assessment-item-toggle"));
            },
            toggleSearchResultItemTable: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-item-table-area'), this.$el.find("#btn-search-item-table-result-toggle"));
            },
            toggleAssessmentItemTable: function () {
                fn_pageLayerCtrl(this.$el.find('#assessment-item-table-area'), this.$el.find("#btn-assessment-item-table-toggle"));
            },


            /*
             * Reset
             */
            resetSearchCondition: function () {
            	this.deleteList = [];
            	this.deleteListOfSrchRltItmTbl = [];
            	console.log('resetSearchCondition');

            	this.$el.find('#search-condition-area [data-form-param="asmItmNm"]').val("");
            	this.$el.find('#search-condition-area [data-form-param="asmItmNm"]').prop("disabled", false);
            	
            },
            resetSearchResult: function () {
            	this.resetAssessmentItem();
                this.CAPAM010SrchRsltGrid.resetData();
                this.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt'));
            },
            resetAssessmentItem: function () {
            	this.deleteList = [];
            	this.deleteListOfSrchRltItmTbl = [];
            	this.initFlag = true;
                this.$el.find('#assessment-item-area [data-form-param="asmItmId"]').prop("disabled", true);
                this.$el.find('#assessment-item-area [data-form-param="asmItmId"]').val("");
                
                this.$el.find('#assessment-item-area [data-form-param="asmItmNm"]').prop("disabled", false);
                this.$el.find('#assessment-item-area [data-form-param="asmItmNm"]').val("");
                
                this.$el.find('#assessment-item-area [data-form-param="asmItmTpCd"]').prop("disabled", false);
                this.$el.find('#assessment-item-area [data-form-param="asmItmTpCd"]').val("");

                this.$el.find('#assessment-item-area [data-form-param="asmItmRmkCntnt"]').prop("disabled", false);
                this.$el.find('#assessment-item-area [data-form-param="asmItmRmkCntnt"]').val("");
                
                this.$el.find('#assessment-item-area [data-form-param="asmItmOriginDscd"]').prop("disabled", false);
                this.$el.find('#assessment-item-area [data-form-param="asmItmOriginDscd"]').val("");
                
                this.$el.find('#assessment-item-area [data-form-param="rgstrnDt"]').prop("disabled", false);
            	this.$el.find('#assessment-item-area [data-form-param="rgstrnDt"]').val(getCurrentDate("yyyy-mm-dd"));
            },
            resetSearchResultItemTable: function () {
            	this.resetAssessmentItemTable();
                this.CAPAM010SrchRsltItmTblGrid.resetData();
                this.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt'));
            },
            resetAssessmentItemTable: function () {
            	this.deleteListOfSrchRltItmTbl = [];
            	this.initFlag = true;
            	
            	var asmItmId = this.$el.find('#assessment-item-area  [data-form-param="asmItmId"]').val();
            	
                this.$el.find('#assessment-item-table-area [data-form-param="asmItmId"]').prop("disabled", true);
                this.$el.find('#assessment-item-table-area [data-form-param="asmItmId"]').val(asmItmId);
                
                this.$el.find('#assessment-item-table-area [data-form-param="columnSeq"]').prop("disabled", false);
                this.$el.find('#assessment-item-table-area [data-form-param="columnSeq"]').val("");
                
                this.$el.find('#assessment-item-table-area [data-form-param="atrbtNm"]').prop("disabled", false);
                this.$el.find('#assessment-item-table-area [data-form-param="atrbtNm"]').val("");

                this.$el.find('#assessment-item-table-area [data-form-param="atrbtTpCd"]').prop("disabled", false);
                this.$el.find('#assessment-item-table-area [data-form-param="atrbtTpCd"]').val("");
                
                this.$el.find('#assessment-item-table-area [data-form-param="rgstrnDt"]').prop("disabled", false);
            	this.$el.find('#assessment-item-table-area [data-form-param="rgstrnDt"]').val(getCurrentDate("yyyy-mm-dd"));
            },

            
            moveUpSearchResultItemTable: function (that) {
              this.moveSelectedRow(-1);
            },
            
            moveDownSearchResultItemTable: function (that) {
              this.moveSelectedRow(1);
            },


            moveSelectedRow: function(distance) {	
            	
              console.log('moveSelectedRow');
            	
          	  //var selectedRow = this.selectedRow;
          	  var selectedRow = this.CAPAM010SrchRsltItmTblGrid.grid.getSelectionModel().selected.items[0];
          	
          	  console.log(selectedRow);
          	  if(!selectedRow){
          		  return;
          	  }
                var lastIndex = this.CAPAM010SrchRsltItmTblGrid.store.count() - 1,
  	              oldIndex = this.CAPAM010SrchRsltItmTblGrid.store.indexOf(selectedRow),
  	              newIndex = oldIndex + distance;


  	          newIndex = (newIndex < 0)? 0 : newIndex;
  	          newIndex = (newIndex > lastIndex)? lastIndex : newIndex;


  	          if(selectedRow.length === 0) { return; }


  	          this.CAPAM010SrchRsltItmTblGrid.store.remove(selectedRow);
  	          this.CAPAM010SrchRsltItmTblGrid.store.insert(newIndex, selectedRow);
  	          this.CAPAM010SrchRsltItmTblGrid.grid.getSelectionModel().select(newIndex);


  	          if(distance < 0){
  	          	for(var i = newIndex + 1 ; i <= oldIndex ; i++ ){
  	          		var tempRow = this.CAPAM010SrchRsltItmTblGrid.store.data.items[i];
  	          		this.CAPAM010SrchRsltItmTblGrid.store.remove(tempRow);
  	          		this.CAPAM010SrchRsltItmTblGrid.store.insert(i, tempRow);
  	          	}
  	          } else {
  	          	for(var i = oldIndex ; i <= newIndex - 1 ; i++ ){
  	          		var tempRow = this.CAPAM010SrchRsltItmTblGrid.store.data.items[i];
  	          		this.CAPAM010SrchRsltItmTblGrid.store.remove(tempRow);
  	          		this.CAPAM010SrchRsltItmTblGrid.store.insert(i, tempRow);
  	          	}
  	          }
            }    
            
            
        }); // end of Backbone.View.extend({


        return CAPAM010View;
    } // end of define function
); // end of define
