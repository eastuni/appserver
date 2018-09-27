define(
    [
     	'bx/common/common-info',
        'text!app/views/page/CAPMT/092/_CAPMT092.html',
        'bx-component/ext-grid/_ext-grid',
        'app/views/page/popup/CAPMT/popup-rule'
    ],
    function (
        commonInfo,
        tpl,
        ExtGrid,
        PopupRuleSearch
    ) {


        var recordParam = null;
        var deleteList = [];
        var initFlag = true;
        var initialData ={};
        var ruleSaveShow = false;
        var comboStore = {};

        /**
         * Backbone
         */
        var CAPMT092View = Backbone.View.extend({
        	// set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPMT092-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {

                /*
                 * step-baseAtrbt-area
                 */
                'click #CAPMT092-btn-step-baseAtrbt-toggle': 'toggleStepBaseAttribute',



                /*
                 * search-result-area
                 */
                'click #btn-CAPMT092-grid-up': 'upNode',
				'click #btn-CAPMT092-grid-down': 'downNode',
                'click #btn-search-result-reset': 'resetSearchResult',
                'click #btn-search-result-save': 'saveSearchResult',
                'click #btn-search-result-toggle': 'toggleSearchResult',


                /*
                 * next-step
                 */
                'click #btn-additional-search-condition-toggle': 'toggleAdditionalCondition',
                'click #CAPMT092-var-list-toggle': 'toggleVarList',
                'click #CAPMT092-btn-rule-save': 'saveRule',
                'click #CAPMT092-addRule-btn': 'addRule',
                'click #CAPMT092-formTest-btn': 'validateFormula',
                'click #CAPMT092-btn-rule-search': 'searchRule',
                'click #CAPMT092-btn-next-step-baseAtrbt-toggle': 'toggleNextStep',
                'click #CAPMT092-btn-next-step-baseAtrbt-reset': 'resetNextStep',
                'click #CAPMT092-btn-next-step-baseAtrbt-save': 'saveNextStep'
                
                
                	
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
                this.setStepList();
                self = this;
                that = this;
                
                initialData.workflowId = that.initData.param.workflowId;
                initialData.stepNm = that.initData.param.stepNm;
                initialData.stepTpCd = that.initData.param.stepTpCd;
                initialData.stepDescCntnt = that.initData.param.stepDescCntnt;
                initialData.stepId = that.initData.param.stepId;
                initialData.stepSeq = that.initData.param.stepSeq;
                
                comboStore = Ext.create('Ext.data.Store', {
                	fields: ['cd', 'cdNm'],
                    data : [
                        {cd: 'N',   cdNm: '일반'},
                        {cd: 'B', cdNm: '백워드'}
                    ]
                });
                
            },


            /**
             * Render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find("#CAPMT092Grid").html(this.CAPMT092Grid.render({
                    'height': "380px"
                }));

                
                this.setComboBoxes();
                this.$el.find('#step-baseAtrbt-area  [data-form-param="stepId"]').val(that.initData.param.stepId);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="stepNm"]').val(that.initData.param.stepNm);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnNm"]').val(that.initData.param.scrnNm);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcNm"]').val(that.initData.param.srvcNm);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="stepDescCntnt"]').val(that.initData.param.stepDescCntnt);

                
                this.inquireSearchCondition();
                this.toggleVarList();
                
                return this.$el;
            },
            

            /**
             *  Set Combo boxes
             */
            setComboBoxes: function () {


                var sParam = {};


                sParam = {};
                sParam.className = "CAPMT092-bizDscd-wrap";
                sParam.targetId = "wflowBizDscd";
                sParam.cdNbr = "80015";
                fn_getCodeList(sParam, this);

            },

            /** 
             * Create search results grid
             */
            createGrid: function () {
                var that = this;


                this.CAPMT092Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'wflowId', 'stepId', 'nxtStepId', 'nxtStepNm',
                             'ruleId', 'ruleNm', 'ruleRsltCd',  'lastChngGuid', 'prcsCd'],
                    id: 'CAPMT092Grid',
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
                          * wflowId 
                          */
                        {
                            text: bxMsg('cbb_items.AT#wflowId'),
                            dataIndex: 'wflowId',
                            width: 200,
                            style: 'text-align:center',
                            align: 'center',
                            hidden: true
                        },
                        
                        /*
                         * stepId 
                         */
                        {
                        	text: bxMsg('cbb_items.AT#stepId'),
                        	dataIndex: 'stepId',
                        	width: 200,
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: true
                        },
                        
                        /*
                         * nxtStepId 
                         */
                        {
                        	text: bxMsg('cbb_items.AT#nxtStepId'),
                        	dataIndex: 'nxtStepId',
                        	width: 200,
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: true
                        },
                        
                        /*
                         * nxtStepNm 
                         */
                        {
                        	text: bxMsg('cbb_items.AT#nxtStepNm'),
                        	dataIndex: 'nxtStepNm',
                        	width: 200,
                        	flex: 1,
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: false
                        },
                        
                        /*
                         * ruleId 
                         */
                        {
                        	text: bxMsg('cbb_items.AT#ruleId'),
                        	dataIndex: 'ruleId',
                        	width: 200,
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: true
                        },
                        
                        /*
                         * ruleNm 
                         */
                        {
                        	text: bxMsg('cbb_items.AT#ruleNm'),
                        	dataIndex: 'ruleNm',
                        	width: 200,
                        	flex: 1,
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: false
                        },
                        
                        /*
                         * ruleRsltCd 
                         */
                        {
                        	text: bxMsg('cbb_items.SCRNITM#ruleResult'),
                        	dataIndex: 'ruleRsltCd',
                        	width: 200,
                        	flex: 1,
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: false
                        },
                        
                        /*
                         * prcsCd
                         */
                       {
                           text: bxMsg('cbb_items.AT#prcsCd'),
                           width: 200,
                           flex:1,
                           dataIndex: 'prcsCd',
                           style: 'text-align:center',
                           align: 'center',

                           editor: {
                               xtype: 'combobox',
                               store: comboStore,
                               displayField: 'cdNm',
                               valueField: 'cd'
                           },
                           renderer: function (val) {
                                   index = comboStore.findExact('cd', val);
                                   if (index != -1) {
                                       rs = comboStore.getAt(index).data;
                                       return rs.cdNm;
                                   }
                               } // end of render
                        },
                        
                        /*
                         * lastChngGuid 
                         */
                        {
                        	text: bxMsg('cbb_items.AT#lastChngGuid'),
                        	dataIndex: 'lastChngGuid',
                        	width: 200,
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: true
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
            
            upNode: function () {
            	
            	var grid = this.CAPMT092Grid.grid;
            	var direction = -1;
            	
            	var record = this.CAPMT091Grid.grid.getSelectionModel().selected.items[0];
            	if (!record) {
            		return;
            	}
            	var index = this.CAPMT091Grid.grid.store.indexOf(record);
            	if (direction < 0) {
            		index--;
            		if (index < 0) {
            			return;
            		}
            	} else {
            		index++;
            		if (index >= grid.store.getCount()) {
            			return;
            		}
            	}
            	grid.getStore().remove(record);
            	grid.getStore().insert(index, record);
            	grid.getSelectionModel().select(index, true);
            	
            },

            downNode: function () {
            	var grid = this.CAPMT092Grid.grid;
            	var direction = 1;
            	
            	var record = this.CAPMT091Grid.grid.getSelectionModel().selected.items[0];
            	if (!record) {
            		return;
            	}
            	var index = this.CAPMT091Grid.grid.store.indexOf(record);
            	if (direction < 0) {
            		index--;
            		if (index < 0) {
            			return;
            		}
            	} else {
            		index++;
            		if (index >= grid.store.getCount()) {
            			return;
            		}
            	}
            	grid.getStore().remove(record);
            	grid.getStore().insert(index, record);
            	grid.getSelectionModel().select(index, true);
            },


            setStepList : function(){
           	 var that = this;
                var sParam = {};
                
                
                sParam.instCd = commonInfo.getInstInfo().instCd;
                sParam.wflowId = that.initData.param.workflowId;

                
                var linkData = {
                        "header": fn_getHeader("PMT0918401"),
                        "WorkflowStepMgmtSvcIO": sParam


                };
                
                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {


                        if (fn_commonChekResult(responseData)) {
                            if (responseData.WorkflowStepMgmtSvcIOList) {
                                var tbList = responseData.WorkflowStepMgmtSvcIOList.tblNm;
                                var totCnt = tbList.length;
                                if (tbList != null || tbList.length > 0) {
                                	$(tbList).each(function (idx, item) {
                                	
                                        var optionText = item.stepNm;
                                        var optionValue = item.stepId;
                                        if(optionValue != self.initData.param.stepId) {
                                        	var option = $(document.createElement('option')).val(optionValue).text(optionText);
                                        	self.$el.find('#next-step-baseAtrbt-area  [data-form-param="nxtStepNm"]').append(option);
                                        }
                                    });
                                }
                            }
                        }
                    }
                });
                
           },

           createGrid2: function () {
               var that = this;


               this.CAPMT092Grid2 = new ExtGrid({
                   // 그리드 컬럼 정의
                   fields: ['rowIndex', 'varLvlCd', 'varId', 'varNm'],
                   id: ' ',
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
                        
                        {text: bxMsg('cbb_items.SCRNITM#variableRange'), dataIndex: 'varLvlCd', flex:1, style: 'text-align:center',align: 'center', hidden : false},
                        {text: bxMsg('cbb_items.AT#varId'), dataIndex: 'varId', flex:1, style: 'text-align:center',align: 'center', hidden : false},
                        {text: bxMsg('cbb_items.AT#varNm'), dataIndex: 'varNm', flex:1, style: 'text-align:center',align: 'center', hidden : false}
						
                       
     
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
                           		that.addVar();
                           }
                       }
                   }
               });
           },
           
           addVar: function(){
        	   if(!this.CAPMT092Grid2.grid.getSelectionModel().selected.items[0]) return;
               var selectedRecord = this.CAPMT092Grid2.grid.getSelectionModel().selected.items[0].data;
               var tmp = self.$el.find('#additional-CAPMT092-base-table [data-form-param="formulaCntnt"]').val();
               var addValue = "";
               if(!tmp || tmp.length === 0)
            	   addValue = " ";
               if(selectedRecord.varLvlCd === 'W')
            	   addValue += "#WF.";
               else{
            	   addValue += "#ST.";   
               }
               addValue += selectedRecord.varId + " ";
               self.$el.find('#additional-CAPMT092-base-table [data-form-param="formulaCntnt"]').val(tmp + addValue);
           },

            /*
             * inquire next step
             */
            inquireSearchCondition : function(){
            	 var that = this;
                 var sParam = {};
                 
                 
                 sParam.instCd = commonInfo.getInstInfo().instCd;
                 sParam.wflowId = that.initData.param.workflowId;
                 sParam.stepId = that.initData.param.stepId;

                 if (sParam == null) {
                     this.CAPMT092Grid.resetData();
                     return;
                 }
                 
                 var linkData = {
                         "header": fn_getHeader("PMT0918402"),
                         "WorkflowStepMgmtSvcIO": sParam


                 };
                 
                 //ajax 호출
                 bxProxy.post(sUrl, JSON.stringify(linkData), {
                     //loading 설정
                     enableLoading: true,
                     success: function (responseData) {


                         if (fn_commonChekResult(responseData)) {
                             if (responseData.WorkflowStepMgmtSvcIOList) {
                                 var tbList = responseData.WorkflowStepMgmtSvcIOList.tblNm;
                                 var totCnt = tbList.length;


                                 if (tbList != null || tbList.length > 0) {
                                     that.CAPMT092Grid.setData(tbList);

                                 }
                             }
                         }
                     }
                 });
                 
            },
            
           
            /*
             * inquire var
             */
            inquireVar : function(){
            	 var that = this;
                 var sParam = {};
                 
                 
                 sParam.instCd = commonInfo.getInstInfo().instCd;
                 sParam.wflowId = that.initData.param.workflowId;
                 sParam.stepId = that.initData.param.stepId;

                 if (sParam == null) {
                     this.CAPMT092Grid2.resetData();
                     return;
                 }
                 
                 var linkData = {
                         "header": fn_getHeader("PMT0908402"),
                         "WorkflowVariableSvcIO": sParam


                 };
                 
                 //ajax 호출
                 bxProxy.post(sUrl, JSON.stringify(linkData), {
                     //loading 설정
                     enableLoading: true,
                     success: function (responseData) {


                         if (fn_commonChekResult(responseData)) {
                             if (responseData.WorkflowVariableSvcIOList) {
                                 var tbList = responseData.WorkflowVariableSvcIOList.tblNm;
                                 var totCnt = tbList.length;


                                 if (tbList != null || tbList.length > 0) {
                                     that.CAPMT092Grid2.setData(tbList);
                                     
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
            	this.deleteList = [];
            	this.resetNextStep();
                this.CAPMT092Grid.resetData();
                this.inquireSearchCondition();
            },
            



            /*
             * Select a grid record
             */
            selectGridRecord: function () {
                var that = this;


                if(!this.CAPMT092Grid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPMT092Grid.grid.getSelectionModel().selected.items[0].data;


                if (!selectedRecord) {
                    return;
                }


                that.initFlag = false;

                self.$el.find('#next-step-baseAtrbt-area  [data-form-param="nxtStepNm"]').prop("disabled", true);
                self.$el.find('#next-step-baseAtrbt-area  [data-form-param="nxtStepNm"]').val(selectedRecord.nxtStepId);
                self.$el.find('#next-step-baseAtrbt-area  [data-form-param="ruleNm"]').val(selectedRecord.ruleNm);
                self.$el.find('#next-step-baseAtrbt-area  [data-form-param="ruleRsltCd"]').val(selectedRecord.ruleRsltCd);
                self.$el.find('#next-step-baseAtrbt-area  [data-form-param="ruleId"]').val(selectedRecord.ruleId);
                self.$el.find('#next-step-baseAtrbt-area  [data-form-param="lastChngGuid"]').val(selectedRecord.lastChngGuid);
                self.$el.find('#next-step-baseAtrbt-area  [data-form-param="prcsCd"]').val(selectedRecord.prcsCd);
                //self.$el.find("#CAPMT092-formTest-btn").show();
                
                if(!selectedRecord.ruleId || selectedRecord.ruleId.length === 0)
                	self.$el.find('#td-ruleResult').css('visibility','hidden');
                else
                	self.$el.find('#td-ruleResult').css('visibility','visible');
                
                
                var sParam = {};
                sParam.instCd = commonInfo.getInstInfo().instCd;
                sParam.ruleId = selectedRecord.ruleId;

                if(!sParam.ruleId || sParam.ruleId.trim().length === 0)
                	return;
                
                var linkData = {
                        "header": fn_getHeader("PMT0928401"),
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
                                	var data = tbList[0];
                                	self.$el.find('#additional-CAPMT092-base-table  [data-form-param="ruleNm"]').val(data.ruleNm);
                                	self.$el.find('#additional-CAPMT092-base-table  [data-form-param="bizDscd"]').val(data.bizDscd);
                                	self.$el.find('#additional-CAPMT092-base-table  [data-form-param="ruleDescCntnt"]').val(data.ruleDescCntnt);
                                	self.$el.find('#additional-CAPMT092-base-table  [data-form-param="formulaCntnt"]').val(data.formulaCntnt);
                          
                                }
                            }
                        }
                    }
                });
                
                
            },
            
            
            /*
             * Reset basic attribute
             */
            resetNextStep: function () {
            	this.initFlag = true;
            	
                self.$el.find('#next-step-baseAtrbt-area  [data-form-param="nxtStepNm"]').prop("disabled", false);
                self.$el.find('#next-step-baseAtrbt-area  [data-form-param="nxtStepNm"] option:eq(0)').attr("selected", "selected");
                self.$el.find('#next-step-baseAtrbt-area  [data-form-param="ruleNm"]').val('');
                self.$el.find('#next-step-baseAtrbt-area  [data-form-param="ruleRsltCd"] option:eq(0)').attr("selected", "selected");
                self.$el.find('#next-step-baseAtrbt-area  [data-form-param="prcsCd"] option:eq(0)').attr("selected", "selected");
                self.$el.find('#next-step-baseAtrbt-area  [data-form-param="ruleId"]').val('');
                self.$el.find('#next-step-baseAtrbt-area  [data-form-param="lastChngGuid"]').val('');
                self.$el.find('#td-ruleResult').css('visibility','hidden');
                //self.$el.find("#CAPMT092-formTest-btn").hide();
            },

            resetRule: function(){
            	self.$el.find('#additional-CAPMT092-base-table  [data-form-param="ruleNm"]').val('');
            	self.$el.find('#additional-CAPMT092-base-table  [data-form-param="bizDscd"] option:eq(0)').attr("selected", "selected");
            	self.$el.find('#additional-CAPMT092-base-table  [data-form-param="ruleDescCntnt"]').val('');
            	self.$el.find('#additional-CAPMT092-base-table  [data-form-param="formulaCntnt"]').val('');
            	self.$el.find('#additional-CAPMT092-base-table  [data-form-param="trnsfrFormulaCntnt"]').val('');
            	self.$el.find('#additional-CAPMT092-base-table  [data-form-param="vldtnFinYn"]').val('');
            	self.$el.find('#additional-CAPMT092-base-table  [data-form-param="vldtnRsltMsgCntnt"]').val('');
      
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
                        sub.wflowId = data.wflowId;
                        sub.nxtWflowId = data.wflowId;
                        sub.stepId = data.stepId;
                        sub.nxtStepId = data.nxtStepId;
                        sub.lastChngGuid=data.lastChngGuid;

                        
                        table.push(sub);
                    });


                    sParam.tblNm = table;




                    var linkData = {"header": fn_getHeader("PMT0918301"), "WorkflowMgmtSvcIOList": sParam};


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
            saveNextStep: function(){
            	var that = this;
                var sParam = {};
                var srvcCd = "";
                if(this.initFlag) srvcCd = "PMT0918101";
                else srvcCd = "PMT0918202";
                
                sParam.instCd = commonInfo.getInstInfo().instCd;
                sParam.wflowId = that.initData.param.workflowId;
                sParam.stepId = that.initData.param.stepId;
                sParam.nxtWflowId = that.initData.param.workflowId;
                sParam.stepSeq = that.initData.param.stepSeq;
                sParam.nxtStepId = this.$el.find('#next-step-baseAtrbt-area  [data-form-param="nxtStepNm"]').val();
                sParam.ruleId = this.$el.find('#next-step-baseAtrbt-area  [data-form-param="ruleId"]').val();
                sParam.ruleRsltCd = this.$el.find('#next-step-baseAtrbt-area  [data-form-param="ruleRsltCd"]').val();
                sParam.prcsCd = this.$el.find('#next-step-baseAtrbt-area  [data-form-param="prcsCd"]').val();
                
                var linkData = {"header": fn_getHeader(srvcCd), "WorkflowStepMgmtSvcIO": sParam};
	              
                
                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            that.resetNextStep();
                            that.inquireSearchCondition();
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },

            
            /*
             * save rule
             */
            saveRule: function(){
            	var that = this;
                var sParam = {};
                var srvcCd = "PMT0928200";
                var ruleId = self.$el.find('#next-step-baseAtrbt-area [data-form-param="ruleId"]').val();
                if(!ruleId || ruleId.length === 0)
                	srvcCd = "PMT0928100";
                
                sParam.instCd = commonInfo.getInstInfo().instCd;
                sParam.ruleId = this.$el.find('#next-step-baseAtrbt-area [data-form-param="ruleId"]').val();
                sParam.ruleNm = this.$el.find('#additional-CAPMT092-base-table  [data-form-param="ruleNm"]').val();
                sParam.bizDscd = this.$el.find('#additional-CAPMT092-base-table  [data-form-param="bizDscd"]').val();
                sParam.ruleDescCntnt = this.$el.find('#additional-CAPMT092-base-table  [data-form-param="ruleDescCntnt"]').val();
                sParam.formulaCntnt = this.$el.find('#additional-CAPMT092-base-table  [data-form-param="formulaCntnt"]').val();
                sParam.vldtnFinYn = this.$el.find('#additional-CAPMT092-base-table  [data-form-param="vldtnFinYn"]').val();
                
                var linkData = {"header": fn_getHeader(srvcCd), "WorkflowRuleMgmtSvcIO": sParam};
	              
                
                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var data = responseData.WorkflowRuleMgmtSvcIO;
        					self.$el.find('#next-step-baseAtrbt-area [data-form-param="ruleId"]').val(data.ruleId);
        					self.$el.find('#next-step-baseAtrbt-area [data-form-param="ruleNm"]').val(data.ruleNm);
        	                if(!data.ruleNm || data.ruleNm.length === 0)
        	                	self.$el.find('#td-ruleResult').css('visibility','hidden');
        	                else
        	                	self.$el.find('#td-ruleResult').css('visibility','visible');
                            self.resetRule();
                            
                            fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },
            
            validateFormula: function(){
            	
            	var that = this;
                var sParam = {};
                
                
                sParam.instCd = commonInfo.getInstInfo().instCd;
                sParam.formulaCntnt = that.$el.find('#additional-CAPMT092-base-table  [data-form-param="formulaCntnt"]').val();

                if (!sParam.formulaCntnt || sParam.formulaCntnt.length === 0) {
                    return;
                }
                
                var linkData = {
                        "header": fn_getHeader("PMT0928500"),
                        "WorkflowRuleMgmtSvcIO": sParam


                };
                
                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {


                        if (fn_commonChekResult(responseData)) {
                            if (responseData.WorkflowRuleMgmtSvcIO) {
                                var data = responseData.WorkflowRuleMgmtSvcIO;
                                that.$el.find('#additional-CAPMT092-base-table  [data-form-param="trnsfrFormulaCntnt"]').val(data.trnsfrFormulaCntnt);
                                that.$el.find('#additional-CAPMT092-base-table  [data-form-param="vldtnFinYn"]').val(data.vldtnFinYn);
                                that.$el.find('#additional-CAPMT092-base-table  [data-form-param="vldtnRsltMsgCntnt"]').val(data.vldtnRsltMsgCntnt);
                            }
                        }
                        
                        
                    }
                });
                
            },
            
            
            
            
            /*
             * Toggle
             */
            toggleStepBaseAttribute: function () {
                fn_pageLayerCtrl(this.$el.find('#step-baseAtrbt-area'), this.$el.find("#CAPMT092-btn-step-baseAtrbt-toggle"));
            },
            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find("#btn-search-result-toggle"));
            },
            toggleNextStep: function () {
            	fn_pageLayerCtrl(this.$el.find('#next-step-baseAtrbt-area'), this.$el.find("#CAPMT092-btn-next-step-baseAtrbt-toggle"));
            },
            toggleVarList: function () {
            	fn_pageLayerCtrl(this.$el.find('#var-list-area'), this.$el.find("#CAPMT092-var-list-toggle"));
            },
            toggleAdditionalCondition: function () {
            	this.inquireVar();
            	if(this.ruleSaveShow){
            		this.$el.find("#CAPMT092-btn-rule-save").hide();
            		this.$el.find("#CAPMT092Grid2").hide();
            		this.ruleSaveShow = false;
            	}
            	else{
            		this.$el.find("#CAPMT092-btn-rule-save").show();
            		this.$el.find("#CAPMT092Grid2").show();
            		this.ruleSaveShow = true;
            	}
            	
                fn_pageLayerCtrl(this.$el.find("#additional-CAPMT092-base-table"), this.$el.find("#btn-additional-search-condition-toggle"));
                that.$el.find("#CAPMT092Grid2").html(this.CAPMT092Grid2.render({
                 	'height': "380px"
                 }));
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
					that.$el.find('[data-form-param="ruleId"]').val(data.ruleId);
					that.$el.find('[data-form-param="ruleNm"]').val(data.ruleNm);
	                if(!data.ruleNm || data.ruleNm.length === 0)
	                	self.$el.find('#td-ruleResult').css('visibility','hidden');
	                else
	                	self.$el.find('#td-ruleResult').css('visibility','visible');
				});
			},
			
			addRule : function(){
				var that = this;
				var sParam = {};
				
				
				var popupRuleSearch = new PopupRuleSearch(sParam);
				
				
				popupRuleSearch.render();
				popupRuleSearch.on('popUpSetData', function (data) {
					that.$el.find('[data-form-param="ruleId"]').val(data.ruleId);
					that.$el.find('[data-form-param="ruleNm"]').val(data.ruleNm);
					if(!data.ruleNm || data.ruleNm.length === 0)
						self.$el.find('#td-ruleResult').css('visibility','hidden');
					else
						self.$el.find('#td-ruleResult').css('visibility','visible');
					var tmp = self.$el.find('#additional-CAPMT092-base-table [data-form-param="formulaCntnt"]').val();
					self.$el.find('#additional-CAPMT092-base-table [data-form-param="formulaCntnt"]').val(tmp + " #RL."+data.ruleId);	
					
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


        return CAPMT092View;
    } // end of define function
); // end of define
