define(
    [
     	'bx/common/common-info',
        'text!app/views/page/CAPMT/095/_CAPMT095.html',
        'app/views/page/popup/CAPSV/popup-attribute-search',
        'bx-component/ext-grid/_ext-grid',
        'app/views/page/popup/CAPMT/popup-rule',
        'app/views/page/popup/CAPCM/popup-class-search'
    ],
    function (
        commonInfo,
        tpl,
        PopupAttributeSearch,
        ExtGrid,
        PopupRuleSearch,
        PopupClassSearch
    ) {


        var deleteList = [];
        var initFlag = true;
        
        var comboStore1 = {};
        var comboStore2 = {};

        /**
         * Backbone
         */
        var CAPMT095View = Backbone.View.extend({
        	// set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPMT095-page',
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
                 * baseAtrbt-area
                 */
                'click #btn-baseAtrbt-reset': 'resetBasicAttribute',
                'click #btn-baseAtrbt-save': 'saveRuleItem',
                'click #btn-baseAtrbt-toggle': 'toggleBasicAttribute',
                'change .constantVarialbleDistinction': 'changeConstantVariable',

                /*
                 * 
                 */
                'click #CAPMT095-btn-var-search': 'searchAtrbt',
                'click #CAPMT095-btn-itmId-search': 'searchBaseAtrbt',
                'click #CAPMT095-btn-rule-search': 'searchRule',
                'click #CAPMT095-btn-class-search': 'searchClass',
            },


            /**
             * initialize
             */
            initialize: function (initData) {
                $.extend(this, initData);
                this.initData = initData;
                this.deleteList = [];
                this.initFlag = true;
                this.createGrid();
                this.createGrid2();
                self = this;
                
                
                comboStore1 = Ext.create('Ext.data.Store', {
                	fields: ['cd', 'cdNm'],
                    data : [
                        {cd: '&&',   cdNm: 'AND'},
                        {cd: '||',    cdNm: 'OR'}
                    ]
                });
                
                comboStore2 = Ext.create('Ext.data.Store', {
                	fields: ['cd', 'cdNm'],
                    data : [
                        {cd: 'W',   cdNm: '워크플로우'},
                        {cd: 'S',    cdNm: '스텝'}
                    ]
                });
                
            },


            /**
             * Render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find("#CAPMT095Grid").html(this.CAPMT095Grid.render({
                    'height': "380px"
                }));
                this.$el.find("#CAPMT095Grid2").html(this.CAPMT095Grid2.render({
                	'height': "380px"
                }));
                this.resetSearchCondition();
                this.resetBasicAttribute();

                this.$el.find('#search-condition-area  [data-form-param="ruleId"]').val(self.initData.param.ruleId);
                this.$el.find('#search-condition-area  [data-form-param="ruleNm"]').val(self.initData.param.ruleNm);
                this.$el.find('#search-condition-area  [data-form-param="ruleDescCntnt"]').val(self.initData.param.ruleDescCntnt);

                this.inquireSearchCondition();
                
                return this.$el;
            },




            /** 
             * Create search results grid
             */
            createGrid: function () {
                var that = this;


                this.CAPMT095Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                	fields: ['rowIndex', 'cmprsnSeq', 'cmprsnLvl', 'cmprsnOprtrCd', 'itmCmprsnId', 'itmLvlCd', 'itmNm', 'itmId', 'itmTpCd',
                	          'varNm', 'varTpCd', 'itmOprtrCd', 'varId', 'cmprsnVal', 'varLvlCd', 'lastChngTmstmp', 'lastChngGuid', 'userClassNm', 'callRuleId', 'callRuleNm'],
                    id: 'CAPMT095Grid',
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
                         
                         {text: bxMsg('cbb_items.AT#itmCmprsnId'), flex: 1, dataIndex: 'itmCmprsnId', style: 'text-align:center',align: 'center', hidden : true},
                         {text: bxMsg('cbb_items.AT#cmprsnSeq'), flex: 1, dataIndex: 'cmprsnSeq', style: 'text-align:center',align: 'center', hidden : true},
                         {text: bxMsg('cbb_items.AT#cmprsnLvl'), flex: 1, dataIndex: 'cmprsnLvl', style: 'text-align:center',align: 'center', hidden : false},
                         
                         {text: bxMsg('cbb_items.SCRNITM#prcsngRsltDscd'), flex: 1, dataIndex: 'cmprsnOprtrCd', style: 'text-align:center',align: 'center', hidden : false,
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
                         
                         
                         
                         {text: bxMsg('cbb_items.SCRNITM#baseVariable'), flex: 1, dataIndex: 'itmId', style: 'text-align:center',align: 'center', hidden : true},
                         {text: bxMsg('cbb_items.SCRNITM#baseVariable'), flex: 1, dataIndex: 'itmNm', style: 'text-align:center',align: 'center', hidden : false},
                         {text: bxMsg('cbb_items.SCRNITM#baseVariable'), flex: 1, dataIndex: 'itmTpCd', style: 'text-align:center',align: 'center', hidden : true},
                         {text: bxMsg('cbb_items.SCRNITM#baseVariableRange'), flex: 1, dataIndex: 'itmLvlCd', style: 'text-align:center',align: 'center',
                        	 editor: {
                                 xtype: 'combobox',
                                 store: comboStore2,
                                 displayField: 'cdNm',
                                 valueField: 'cd'
                             },
                             renderer: function (val) {
                                     index = comboStore2.findExact('cd', val);
                                     if (index != -1) {
                                         rs = comboStore2.getAt(index).data;
                                         return rs.cdNm;
                                     }
                                 } // end of render
                         
                         },
                         {text: bxMsg('cbb_items.SCRNITM#cmprsnOprtr'), flex: 1, dataIndex: 'itmOprtrCd', style: 'text-align:center',align: 'center'},
                         {text: bxMsg('cbb_items.SCRNITM#targetValue'), flex: 1, dataIndex: 'cmprsnVal', style: 'text-align:center',align: 'center', hidden : false},
                         {text: bxMsg('cbb_items.SCRNITM#targetVariable'), flex: 1, dataIndex: 'varNm', style: 'text-align:center',align: 'center', hidden : false},
                         {text: bxMsg('cbb_items.SCRNITM#targetVariableRange'), flex: 1, dataIndex: 'varLvlCd', style: 'text-align:center',align: 'center', hidden : false,
                        	 editor: {
                                 xtype: 'combobox',
                                 store: comboStore2,
                                 displayField: 'cdNm',
                                 valueField: 'cd'
                             },
                             renderer: function (val) {
                                     index = comboStore2.findExact('cd', val);
                                     if (index != -1) {
                                         rs = comboStore2.getAt(index).data;
                                         return rs.cdNm;
                                     }
                                 } // end of render
                         },
                         {text: bxMsg('cbb_items.AT#userClassNm'), flex: 1, dataIndex: 'userClassNm', style: 'text-align:center',align: 'center', hidden : false},
                         {text: bxMsg('cbb_items.AT#callRuleId'), flex: 1, dataIndex: 'callRuleId', style: 'text-align:center',align: 'center', hidden : true},
                         {text: bxMsg('cbb_items.AT#callRuleNm'), flex: 1, dataIndex: 'callRuleNm', style: 'text-align:center',align: 'center', hidden : false},
                         {text: bxMsg('cbb_items.AT#varLvlCd'), flex: 1, dataIndex: 'varLvlCd', style: 'text-align:center',align: 'center', hidden : true},
                         {text: bxMsg('cbb_items.AT#lastChngTmstmp'), dataIndex: 'lastChngTmstmp', hidden : true},
                         {text: bxMsg('cbb_items.AT#lastChngGuid'), dataIndex: 'lastChngGuid', hidden : true},

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
             * Create search results grid
             */
            createGrid2: function () {
            	var that = this;
            	
            	
            	this.CAPMT095Grid2 = new ExtGrid({
            		// 그리드 컬럼 정의
            		fields: ['rowIndex', 'cmprsnSeq', 'cmprsnLvl', 'cmprsnOprtrCd', 'itmCmprsnId', 'itmLvlCd', 'itmNm', 'itmId', 'itmTpCd',
            		         'varNm', 'varTpCd', 'itmOprtrCd', 'varId', 'cmprsnVal', 'varLvlCd', 'lastChngTmstmp', 'lastChngGuid', 'userClassNm', 'callRuleId', 'callRuleNm'],
            		         id: 'CAPMT095Grid',
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
            		                   
            		                   {text: bxMsg('cbb_items.AT#itmCmprsnId'), flex: 1, dataIndex: 'itmCmprsnId', style: 'text-align:center',align: 'center', hidden : true},
            		                   {text: bxMsg('cbb_items.AT#cmprsnSeq'), flex: 1, dataIndex: 'cmprsnSeq', style: 'text-align:center',align: 'center', hidden : true},
            		                   {text: bxMsg('cbb_items.AT#cmprsnLvl'), flex: 1, dataIndex: 'cmprsnLvl', style: 'text-align:center',align: 'center', hidden : false},
            		                   
            		                   {text: bxMsg('cbb_items.SCRNITM#prcsngRsltDscd'), flex: 1, dataIndex: 'cmprsnOprtrCd', style: 'text-align:center',align: 'center', hidden : false,
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
            		                   
            		                   
            		                   
            		                   {text: bxMsg('cbb_items.SCRNITM#baseVariable'), flex: 1, dataIndex: 'itmId', style: 'text-align:center',align: 'center', hidden : true},
            		                   {text: bxMsg('cbb_items.SCRNITM#baseVariable'), flex: 1, dataIndex: 'itmNm', style: 'text-align:center',align: 'center', hidden : false},
            		                   {text: bxMsg('cbb_items.SCRNITM#baseVariable'), flex: 1, dataIndex: 'itmTpCd', style: 'text-align:center',align: 'center', hidden : true},
            		                   {text: bxMsg('cbb_items.SCRNITM#baseVariableRange'), flex: 1, dataIndex: 'itmLvlCd', style: 'text-align:center',align: 'center',
            		                	   editor: {
            		                		   xtype: 'combobox',
            		                		   store: comboStore2,
            		                		   displayField: 'cdNm',
            		                		   valueField: 'cd'
            		                	   },
            		                	   renderer: function (val) {
            		                		   index = comboStore2.findExact('cd', val);
            		                		   if (index != -1) {
            		                			   rs = comboStore2.getAt(index).data;
            		                			   return rs.cdNm;
            		                		   }
            		                	   } // end of render
            		                	   
            		                   },
            		                   {text: bxMsg('cbb_items.SCRNITM#cmprsnOprtr'), flex: 1, dataIndex: 'itmOprtrCd', style: 'text-align:center',align: 'center'},
            		                   {text: bxMsg('cbb_items.SCRNITM#targetValue'), flex: 1, dataIndex: 'cmprsnVal', style: 'text-align:center',align: 'center', hidden : false},
            		                   {text: bxMsg('cbb_items.SCRNITM#targetVariable'), flex: 1, dataIndex: 'varNm', style: 'text-align:center',align: 'center', hidden : false},
            		                   {text: bxMsg('cbb_items.SCRNITM#targetVariableRange'), flex: 1, dataIndex: 'varLvlCd', style: 'text-align:center',align: 'center', hidden : false,
            		                	   editor: {
            		                		   xtype: 'combobox',
            		                		   store: comboStore2,
            		                		   displayField: 'cdNm',
            		                		   valueField: 'cd'
            		                	   },
            		                	   renderer: function (val) {
            		                		   index = comboStore2.findExact('cd', val);
            		                		   if (index != -1) {
            		                			   rs = comboStore2.getAt(index).data;
            		                			   return rs.cdNm;
            		                		   }
            		                	   } // end of render
            		                   },
            		                   {text: bxMsg('cbb_items.AT#userClassNm'), flex: 1, dataIndex: 'userClassNm', style: 'text-align:center',align: 'center', hidden : false},
            		                   {text: bxMsg('cbb_items.AT#callRuleId'), flex: 1, dataIndex: 'callRuleId', style: 'text-align:center',align: 'center', hidden : true},
            		                   {text: bxMsg('cbb_items.AT#callRuleNm'), flex: 1, dataIndex: 'callRuleNm', style: 'text-align:center',align: 'center', hidden : false},
            		                   {text: bxMsg('cbb_items.AT#varLvlCd'), flex: 1, dataIndex: 'varLvlCd', style: 'text-align:center',align: 'center', hidden : true},
            		                   {text: bxMsg('cbb_items.AT#lastChngTmstmp'), dataIndex: 'lastChngTmstmp', hidden : true},
            		                   {text: bxMsg('cbb_items.AT#lastChngGuid'), dataIndex: 'lastChngGuid', hidden : true}
            		                   
            		                   
            		                   
            		                   
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




            /*
             * inquire workflow
             */
            inquireSearchCondition : function(){
            	 var that = this;
                 var sParam = {};
                 
                 sParam.instCd = commonInfo.getInstInfo().instCd;
                 sParam.ruleId = this.$el.find('#search-condition-area [data-form-param="ruleId"]').val();
                 
                 if (sParam == null) {
                     this.CAPMT095Grid.resetData();
                     return;
                 }
                 
                 var linkData = {
                         "header": fn_getHeader("PMT0928402"),
                         "WorkflowRuleMgmtSvcIO": sParam


                 };
                 
                 //ajax 호출
                 bxProxy.post(sUrl, JSON.stringify(linkData), {
                     //loading 설정
                     enableLoading: true,
                     success: function (responseData) {


                         if (fn_commonChekResult(responseData)) {
                             if (responseData.WorkflowRuleMgmtSvcIOList) {
                                 var tbList = responseData.WorkflowRuleMgmtSvcIOList.tblNm;
                                 var totCnt = tbList.length;


                                 if (tbList != null || tbList.length > 0) {
                                     that.CAPMT095Grid.setData(tbList);
                                     that.$el.find(".searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt') + " (" + fn_setComma(totCnt) + " " + bxMsg('cbb_items.SCRNITM#cnt') + ")");


                                 }
                             }
                         }
                     }
                 });
                 
            },
            
            
            inquireCallRule : function(){
            	var that = this;
            	var sParam = {};
            	
            	sParam.instCd = commonInfo.getInstInfo().instCd;
            	sParam.ruleId = this.$el.find('#baseAtrbt-area  [data-form-param="callRuleId"]').val();
            	
            	if (sParam == null) {
            		this.CAPMT095Grid2.resetData();
            		return;
            	}
            	
            	var linkData = {
            			"header": fn_getHeader("PMT0928402"),
            			"WorkflowRuleMgmtSvcIO": sParam
            			
            			
            	};
            	
            	//ajax 호출
            	bxProxy.post(sUrl, JSON.stringify(linkData), {
            		//loading 설정
            		enableLoading: true,
            		success: function (responseData) {
            			
            			
            			if (fn_commonChekResult(responseData)) {
            				if (responseData.WorkflowRuleMgmtSvcIOList) {
            					var tbList = responseData.WorkflowRuleMgmtSvcIOList.tblNm;
            					var totCnt = tbList.length;
            					
            					
            					if (tbList != null || tbList.length > 0) {
            						that.CAPMT095Grid2.setData(tbList);
            						
            					}
            				}
            			}
            		}
            	});
            	
            },
            
           






            /*
             * Rest search condition area
             */
            resetSearchCondition: function () {
            	this.deleteList = [];
                this.$el.find('#search-condition-area  [data-form-param="ruleId"]').val('');
                this.$el.find('#search-condition-area  [data-form-param="ruleNm"]').val('');
                this.$el.find('#search-condition-area  [data-form-param="ruleDescCntnt"]').val('');

                
            },

            /*
             * Rest search area
             */
            resetSearchResult: function () {
            	this.deleteList = [];
            	this.resetBasicAttribute();
                this.CAPMT095Grid.resetData();
                this.$el.find(".searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt'));
                this.inquireSearchCondition();
            },
            

            /*
             * Reset basic attribute
             */
            resetBasicAttribute: function () {
            	this.initFlag = true;
            	
            	this.$el.find('#baseAtrbt-area  [data-form-param="constantVarialbleDistinction"]').val('C');
            	this.changeConstantVariable();
                
                this.$el.find('#baseAtrbt-area  [data-form-param="itmCmprsnId"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="cmprsnOprtrCd"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="varNm"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="itmOprtrCd"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="cmprsnVal"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="varId"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="itmLvlCd"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="itmId"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="itmNm"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="varLvlCd"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="cmprsnLvl"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="varTpCd"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="itmTpCd"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="itmTpCd"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="userClassNm"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="callRuleId"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="callRuleNm"]').val('');

            },



            /*
             * Select a grid record
             */
            selectGridRecord: function () {
                var that = this;


                if(!this.CAPMT095Grid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPMT095Grid.grid.getSelectionModel().selected.items[0].data;


                if (!selectedRecord) {
                    return;
                }


                that.initFlag = false;

                if(selectedRecord.userClassNm){
                	that.$el.find('#baseAtrbt-area  [data-form-param="constantVarialbleDistinction"]').val('U');
                }
                else if(selectedRecord.callRuleId){
                	that.$el.find('#baseAtrbt-area  [data-form-param="constantVarialbleDistinction"]').val('R');
                }
                else if(!selectedRecord.cmprsnVal || selectedRecord.cmprsnVal.length === 0)
                	that.$el.find('#baseAtrbt-area  [data-form-param="constantVarialbleDistinction"]').val('V');
                else
                	that.$el.find('#baseAtrbt-area  [data-form-param="constantVarialbleDistinction"]').val('C');
                this.$el.find('#baseAtrbt-area  [data-form-param="callRuleId"]').val(selectedRecord.callRuleId);
                that.changeConstantVariable();
                this.$el.find('#baseAtrbt-area  [data-form-param="itmCmprsnId"]').val(selectedRecord.itmCmprsnId);
                this.$el.find('#baseAtrbt-area  [data-form-param="cmprsnOprtrCd"]').val(selectedRecord.cmprsnOprtrCd);
                this.$el.find('#baseAtrbt-area  [data-form-param="varNm"]').val(selectedRecord.varNm);
                this.$el.find('#baseAtrbt-area  [data-form-param="itmOprtrCd"]').val(selectedRecord.itmOprtrCd);
                this.$el.find('#baseAtrbt-area  [data-form-param="cmprsnVal"]').val(selectedRecord.cmprsnVal);
                this.$el.find('#baseAtrbt-area  [data-form-param="varId"]').val(selectedRecord.varId);
                this.$el.find('#baseAtrbt-area  [data-form-param="varTpCd"]').val(selectedRecord.varTpCd);
                this.$el.find('#baseAtrbt-area  [data-form-param="itmLvlCd"]').val(selectedRecord.itmLvlCd);
                this.$el.find('#baseAtrbt-area  [data-form-param="varLvlCd"]').val(selectedRecord.varLvlCd);
                this.$el.find('#baseAtrbt-area  [data-form-param="cmprsnLvl"]').val(selectedRecord.cmprsnLvl);
                this.$el.find('#baseAtrbt-area  [data-form-param="itmId"]').val(selectedRecord.itmId);
                this.$el.find('#baseAtrbt-area  [data-form-param="itmNm"]').val(selectedRecord.itmNm);
                this.$el.find('#baseAtrbt-area  [data-form-param="itmTpCd"]').val(selectedRecord.itmTpCd);
                this.$el.find('#baseAtrbt-area  [data-form-param="userClassNm"]').val(selectedRecord.userClassNm);
                this.$el.find('#baseAtrbt-area  [data-form-param="callRuleId"]').val(selectedRecord.callRuleId);
                this.$el.find('#baseAtrbt-area  [data-form-param="callRuleNm"]').val(selectedRecord.callRuleNm);
               


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




                function saveData() {
                    var table = [];
                    var sParam = {};


                    $(that.deleteList).each(function(idx, data) {
                        var sub = {};
                        sub.instCd = commonInfo.getInstInfo().instCd;
                        sub.itmCmprsnId = data.itmCmprsnId;
                        sub.ruleId = self.initData.param.ruleId;

                        
                        table.push(sub);
                    });


                    sParam.tblNm = table;




                    var linkData = {"header": fn_getHeader("PMT0928302"), "WorkflowRuleMgmtSvcIOList": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                that.deleteList = [];
                                that.inquireSearchCondition();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), saveData, this);
            },


            /*
             * save workflow
             */
            saveRuleItem: function(){
            	var that = this;
                var sParam = {};
                var srvcCd = "";
                if(this.initFlag) srvcCd = "PMT0928101";
                else srvcCd = "PMT0928201";
                
                sParam.instCd = commonInfo.getInstInfo().instCd;
                sParam.ruleId = self.initData.param.ruleId;
                sParam.itmCmprsnId = this.$el.find('#baseAtrbt-area  [data-form-param="itmCmprsnId"]').val();
                sParam.cmprsnOprtrCd = this.$el.find('#baseAtrbt-area  [data-form-param="cmprsnOprtrCd"]').val();
                sParam.varNm = this.$el.find('#baseAtrbt-area  [data-form-param="varNm"]').val();
                sParam.varId = this.$el.find('#baseAtrbt-area  [data-form-param="varId"]').val();
                sParam.itmOprtrCd = this.$el.find('#baseAtrbt-area  [data-form-param="itmOprtrCd"]').val();
                sParam.cmprsnVal = this.$el.find('#baseAtrbt-area  [data-form-param="cmprsnVal"]').val();
                sParam.itmLvlCd = this.$el.find('#baseAtrbt-area  [data-form-param="itmLvlCd"]').val();
                sParam.varLvlCd = this.$el.find('#baseAtrbt-area  [data-form-param="varLvlCd"]').val();
                sParam.cmprsnLvl = this.$el.find('#baseAtrbt-area  [data-form-param="cmprsnLvl"]').val();
                sParam.varTpCd = this.$el.find('#baseAtrbt-area  [data-form-param="varTpCd"]').val();
                sParam.itmId = this.$el.find('#baseAtrbt-area  [data-form-param="itmId"]').val();
                sParam.itmNm = this.$el.find('#baseAtrbt-area  [data-form-param="itmNm"]').val();
                sParam.itmTpCd = this.$el.find('#baseAtrbt-area  [data-form-param="itmTpCd"]').val();
                sParam.userClassNm = this.$el.find('#baseAtrbt-area  [data-form-param="userClassNm"]').val();
                sParam.callRuleId = this.$el.find('#baseAtrbt-area  [data-form-param="callRuleId"]').val();

                
                
                var linkData = {"header": fn_getHeader(srvcCd), "WorkflowRuleMgmtSvcIO": sParam};
	              
                
                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            that.resetBasicAttribute();
                            that.inquireSearchCondition();
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },
            
            changeConstantVariable : function(){
            	var that = this;
            	var tmpVar = that.$el.find('#baseAtrbt-area  [data-form-param="constantVarialbleDistinction"]').val();
            	if(tmpVar === 'C'){
            		this.$el.find('#td-itmOprtrCd').css("visibility", "visible");
            		this.$el.find('.sourceVariable').show();
            		this.$el.find('.targetVariable').hide();
            		this.$el.find('.targetValue').show();
            		this.$el.find('.userClassNm').hide();
            		this.$el.find('.callRuleId').hide();
            		this.$el.find('#call-rule-toolbar').hide();
            		this.$el.find('#call-rule-area').hide();
            	}
            	else if(tmpVar === 'V'){
            		this.$el.find('#td-itmOprtrCd').css("visibility", "visible");
            		this.$el.find('.sourceVariable').show();
            		this.$el.find('.targetVariable').show();
            		this.$el.find('.targetValue').hide();
            		this.$el.find('.userClassNm').hide();
            		this.$el.find('.callRuleId').hide();
            		this.$el.find('#call-rule-toolbar').hide();
            		this.$el.find('#call-rule-area').hide();
            	}
            	else if(tmpVar === 'U'){
            		this.$el.find('#td-itmOprtrCd').css("visibility", "hidden");
            		this.$el.find('.sourceVariable').hide();
            		this.$el.find('.targetVariable').hide();
            		this.$el.find('.targetValue').hide();
            		this.$el.find('.userClassNm').show();
            		this.$el.find('.callRuleId').hide();
            		this.$el.find('#call-rule-toolbar').hide();
            		this.$el.find('#call-rule-area').hide();
            	}
            	else if(tmpVar === 'R'){
            		this.$el.find('#td-itmOprtrCd').css("visibility", "hidden");
            		this.$el.find('.sourceVariable').hide();
            		this.$el.find('.targetVariable').hide();
            		this.$el.find('.targetValue').hide();
            		this.$el.find('.userClassNm').hide();
            		this.$el.find('.callRuleId').show();
            		this.$el.find('#call-rule-toolbar').show();
            		this.$el.find('#call-rule-area').show();
            		this.inquireCallRule();
            	}
            	
            	this.resetField();
            },
            
            resetField : function(){
        		self.$el.find('#baseAtrbt-area  [data-form-param="varId"]').val('');   
     			self.$el.find('#baseAtrbt-area  [data-form-param="varNm"]').val('');   
     			self.$el.find('#baseAtrbt-area  [data-form-param="varLvlCd"]').val('');   
     			self.$el.find('#baseAtrbt-area  [data-form-param="varTpCd"]').val('');   
     			self.$el.find('#baseAtrbt-area  [data-form-param="cmprsnVal"]').val('');   
     			self.$el.find('#baseAtrbt-area  [data-form-param="userClassNm"]').val('');   
     			self.$el.find('#baseAtrbt-area  [data-form-param="callRuleId"]').val('');   
     			self.$el.find('#baseAtrbt-area  [data-form-param="callRuleNm"]').val('');   
            },
            
            /*
             * Toggle
             */
            toggleSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find('#search-condition-area'), this.$el.find("#btn-search-condition-toggle"));
            },
            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find("#btn-baseAtrbt-toggle"));
            },
            
            toggleBasicAttribute: function () {
                fn_pageLayerCtrl(this.$el.find('#baseAtrbt-area'), this.$el.find("#btn-baseAtrbt-toggle"));
            },
            
            

           searchAtrbt: function () {
             	var that = this;
             	var sParam = {};


         		this.popupAttributeSearch = new PopupAttributeSearch(sParam);
         		this.popupAttributeSearch.render();
         		this.popupAttributeSearch.on('popUpSetData', function (data) {

         			that.$el.find('#baseAtrbt-area  [data-form-param="varId"]').val(data.atrbtCd);   
         			that.$el.find('#baseAtrbt-area  [data-form-param="varNm"]').val(data.loginLngAtrbtNm);   
         			that.$el.find('#baseAtrbt-area  [data-form-param="varTpCd"]').val(data.atrbtTpCd);   
             		



         		});
          },
          searchBaseAtrbt: function () {
        	  var that = this;
        	  var sParam = {};
        	  
        	  
        	  this.popupAttributeSearch = new PopupAttributeSearch(sParam);
        	  this.popupAttributeSearch.render();
        	  this.popupAttributeSearch.on('popUpSetData', function (data) {
        		  
        		  that.$el.find('#baseAtrbt-area  [data-form-param="itmId"]').val(data.atrbtCd);   
        		  that.$el.find('#baseAtrbt-area  [data-form-param="itmNm"]').val(data.loginLngAtrbtNm);   
        		  that.$el.find('#baseAtrbt-area  [data-form-param="itmTpCd"]').val(data.atrbtTpCd);   
        		  
        		  
        		  
        		  
        	  });
          },
          
          /**
           * 규칙조회 팝업
           */
			searchRule : function(){
				var that = this;
				var sParam = {};
				
				var popupRuleSearch = new PopupRuleSearch(sParam);
				
				
				popupRuleSearch.render();
				popupRuleSearch.on('popUpSetData', function (data) {
					that.$el.find('[data-form-param="callRuleId"]').val(data.ruleId);
					that.$el.find('[data-form-param="callRuleNm"]').val(data.ruleNm);
					that.inquireCallRule();
				});
			},
			
			/**
			 * 클래스조회 팝업
			 */
			searchClass : function(){
				var that = this;
				var sParam = {};
				
                var popupClassSearch = new PopupClassSearch(sParam);


                popupClassSearch.render();
                popupClassSearch.on('popUpSetData', function (data) {
                    that.$el.find('[data-form-param="userClassNm"]').val(data.classNm);
                });
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


        return CAPMT095View;
    } // end of define function
); // end of define
