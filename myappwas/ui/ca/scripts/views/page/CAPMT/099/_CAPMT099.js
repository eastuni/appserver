define(
    [
     	'bx/common/common-info',
        'text!app/views/page/CAPMT/099/_CAPMT099.html',
        'bx-component/ext-grid/_ext-grid',
        'app/views/page/popup/CAPAT/popup-staffId'
    ],
    function (
        commonInfo,
        tpl,
        ExtGrid,
        popupStaffId
    ) {


        var comboStore1 = {}; // 업무구분코드('전체'를 포함)
        var comboStore2 = Ext.create('Ext.data.Store', {
        	fields: ['cd', 'cdNm'],
            data : [
                {cd: 'S',   cdNm: '진행대기'},
                {cd: 'R',    cdNm: '진행중'},
                {cd: 'F',     cdNm: '정상종료'},
                {cd: 'E', cdNm: '강제종료'},
                {cd: 'K', cdNm: '스킵'},
                {cd:'', cdNm: '미시작'}
            ]
        });
        var comboStore3 = {}; // 업무구분코드
        var recordParam = null;
        var deleteList = [];
        var initFlag = true;
        var saveSearchResult;

        /**
         * Backbone
         */
        var CAPMT099View = Backbone.View.extend({
        	// set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPMT099-page',
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
                'click #btn-staff-search': 'popStaffSearch',


                /*
                 * workflow progress status
                 */
                'click #btn-search-result-reset': 'resetSearchResult',
                'click #btn-search-result-save': 'saveSearchResult',
                'click #btn-search-result-toggle': 'toggleSearchResult',


                /*
                 * step progress status
                 */
                'click #CAPMT099-transfer-manager-btn': 'transferManager',
                'click #btn-search-result-rese2': 'resetSearchResult2',
                'click #btn-search-result-save2': 'saveSearchResult2',
                'click #btn-search-result-toggle2': 'toggleSearchResult2',

            },


            /**
             * initialize
             */
            initialize: function (initData) {
            	self = this;
                $.extend(this, initData);
                this.setComboStore();
                this.initData = initData;
                this.deleteList = [];
                this.initFlag = true;
                this.createGrid();
                this.createGrid2();
                
                
            },


            /**
             * Render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find("#CAPMT099Grid").html(this.CAPMT099Grid.render({
                    'height': "380px"
                }));
                this.$el.find("#CAPMT099Grid2").html(this.CAPMT099Grid2.render({
                	'height': "380px"
                }));
                this.setComboBoxes();
                this.resetSearchCondition();

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
   	              


   	          ], {
                    success: function () {}
                });


            },


            /** 
             * Create search results grid
             */
            createGrid: function () {
                var that = this;


                this.CAPMT099Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'wflowId', 'instncId', 'wflowNm', 'wflowTpCd', 'bizDscd', 'wflowStsCd', 
                             'instncCnt', 'instncId', 'wflowDescCntnt',  'wflowBizDscd', 'lastChngGuid', 'lastChngTmstmp', 'stepId', 'stepNm', 'staffId', 'staffNm', 'varVal'],
                    id: 'CAPMT099Grid',
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
                          * bizDscd
                          */
                        {
                            text: bxMsg('cbb_items.AT#bizDscd'),
                            width: 150,
                            dataIndex: 'bizDscd',
                            style: 'text-align:center',
                            align: 'center',

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
                          * workflow name
                          */
                         {
                         	text: bxMsg('cbb_items.AT#wflowNm'),
                         	dataIndex: 'wflowNm',
                         	width: 150,
                         	style: 'text-align:center',
                         	align: 'center',
                         	hidden: false
                         },
                         
                         /*
                          * varVal
                          */
                         {
                         	text: bxMsg('cbb_items.AT#varVal'),
                         	dataIndex: 'varVal',
                         	width: 200,
                         	flex:1,
                         	style: 'text-align:center',
                         	align: 'left',
                         	hidden: false
                         },
                         
                         
                         /*
                          * staffNm
                          */
                         {
                         	text: bxMsg('cbb_items.AT#staffNm'),
                         	dataIndex: 'staffNm',
                         	width: 150,
                         	style: 'text-align:center',
                         	align: 'center',
                         	hidden: false
                         },
                         
                         /*
                          * workflow id
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
                         * wflowTpCd
                         */
                        {
                        	text: bxMsg('cbb_items.AT#wflowTpCd'),
                        	dataIndex: 'wflowTpCd',
                        	width: 150,
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: true
                        },
                        
                        
                        
                        
                        
                        /*
                         * workflow instance count
                         */
                        {
                        	text: bxMsg('cbb_items.AT#instncCnt'),
                        	dataIndex: 'instncCnt',
                        	width: 150,
                        	flex:1,
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: true
                        },
                        
                        /*
                         *stepNm
                         */
                        {
                        	text: bxMsg('cbb_items.AT#fnlCmpltnStepNm'),
                        	dataIndex: 'stepNm',
                        	width: 150,
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: false
                        },
                        
                       
                        
                        
                        /*
                         * workflow description
                         */
                        {
                        	text: bxMsg('cbb_items.AT#wflowDescCntnt'),
                        	dataIndex: 'wflowDescCntnt',
                        	width: 200,
                            flex: 1,
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: true
                        },
                        
                        /*
                         * workflow lastChngGuid
                         */
                        {
                        	text: bxMsg('cbb_items.AT#lastChngGuid'),
                        	dataIndex: 'lastChngGuid',
                        	width: 200,
                        	flex: 1,
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: true
                        },
                         
                         /*
                          * 업무코드
                          */
                        {
                            text: bxMsg('cbb_items.AT#wflowBizDscd'),
                            dataIndex: 'wflowBizDscd',
                            width: 200,
                            flex:1,
                            style: 'text-align:center',
                            align: 'center',
                            hidden: true
                        },
                        
                        /*
                         * workflow status
                         */
                        {
                        	text: bxMsg('cbb_items.AT#wflowStsCd'),
                            width: 150,
                            dataIndex: 'wflowStsCd',
                            style: 'text-align:center',
                            align: 'center',

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
                        
                        /*
                         * lastChngTmstmp
                         */
                        {
                        	text: bxMsg('cbb_items.AT#lastChngTmstmp'),
                        	dataIndex: 'lastChngTmstmp',
                        	width: 200,
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: false
                        	,
                        	renderer: function (val) {
                                return self.getTimeStamp(new Date(val));
                                
                            } // end of render
                        },
                        
                        
 







                     ], // end of columns


                    // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                    gridConfig: {
                        // 셀 에디팅 플러그인
                        plugins: [
                             Ext.create('Ext.grid.plugin.CellEditing', {
                                    // 2번 클릭시, 에디팅할 수 있도록 처리
                                    clicksToEdit: 1,
                                    listeners: {
                                        'beforeedit': function (grid, record) {
                                        		if(record.field === "wflowStsCd")
                                        			return true;
                                        		else
                                        			return false;

                                            }, // end of edit
                                         'validateedit': function (editor, e) {

                                        	 if(e.originalValue === 'R' && e.value === 'E'){
                                        		 swal(
                                   					  {
                                   						  title: ""
                                   						  , text: bxMsg('cbb_items.SCRNITM#workflow-force-terminate-msg')
                                   						  , showCancelButton:true
                                   						  , html: true
                                   						  , confirmButtonText:bxMsg('cbb_items.ABRVTN#chk')
                                   						  , cancelButtonText:bxMsg('cbb_items.ABRVTN#cncl')
                                   						  , closeOnConfirm: true
                                   						  , closeOnCancel: true
                                   					  }
                                   				  
                                   					  , function (isConfirm) {
//                                   						  console.log("isConfirm : "+isConfirm);
                                   						  if (isConfirm === true) {
                                   							self.saveSearchResult(e.record.data);
                                   							return true;
                                   						  }
                                   						  else {
                                   							  return false;
                                   						  }
                                   					  }
                                   			  );
                                        		 
                                        		 return false;
                                        	 }
                                        	 else if(e.originalValue === e.value){
                                        		 return false;
                                        	 }
                                        	 else {
                                        		 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#wflowStsChngErr'));
                                        		 return false;
                                        	 }

                                       } // end of edit
                                    } // end of listners
                                }) // end of Ext.create
                         ] // end of plugins
                    }, // end of gridConfig
                    listeners: {
                    	click: {
                            element: 'body',
                            fn: function (grid, record) {
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


                this.CAPMT099Grid2 = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex',  'lastChngGuid', 'lastChngTmstmp', 'stepId', 'stepNm', 'stepStsCd', 'srvcId', 
                             'srvcNm', 'roleId', 'roleNm', 'staffId', 'staffNm', 'stepVarVal', 'wflowId', 'instncId', 'rspblPersonId', 'rspblPersonNm'],
                    id: 'CAPMT099Grid',
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
						
						{text: bxMsg('cbb_items.AT#stepNm'), dataIndex: 'stepNm', style: 'text-align:center',align: 'center', hidden : false},
						
						
						
						{text: bxMsg('cbb_items.AT#srvcNm'),  dataIndex: 'srvcNm', style: 'text-align:center',align: 'center', hidden : false},
						
                        /*
                         * stepVarVal
                         */
                        {
                        	text: bxMsg('cbb_items.AT#stepVarVal'),
                        	dataIndex: 'stepVarVal',
                        	width: 200,
                        	flex:1,
                         	style: 'text-align:center',
                         	align: 'left',
                        	hidden: false
                        },
						
						{text: bxMsg('cbb_items.AT#staffNm'), dataIndex: 'staffNm', style: 'text-align:center',align: 'center', hidden : false},
						{text: bxMsg('cbb_items.AT#rspblPersonNm'), dataIndex: 'rspblPersonNm', style: 'text-align:center',align: 'center', hidden : false},
						{text: bxMsg('cbb_items.AT#roleNm'), dataIndex: 'roleNm', style: 'text-align:center',align: 'center', hidden : false},
						{text: bxMsg('cbb_items.AT#wflowId'), dataIndex: 'wflowId', style: 'text-align:center',align: 'center', hidden : true},
						{text: bxMsg('cbb_items.AT#instncId'), dataIndex: 'instncId', style: 'text-align:center',align: 'center', hidden : true},

                        
                        /*
                         * stepStsCd 
                         */
                        {
                        	text: bxMsg('cbb_items.AT#stepStsCd'),
                            width: 150,
                            dataIndex: 'stepStsCd',
                            style: 'text-align:center',
                            align: 'center',

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
                                    else {
                                    	return "미시작";
                                    }
                                } // end of render
                        },
                        
                        /*
                         * lastChngTmstmp
                         */
                        {
                        	text: bxMsg('cbb_items.AT#lastChngTmstmp'),
                        	dataIndex: 'lastChngTmstmp',
                        	width: 200,
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: false
                        	,
                        	renderer: function (val) {
                        		if(!val || val.length === 0)
                        			return "";
                        		return self.getTimeStamp(new Date(val));
                                
                            } // end of render
                        }


                     ], // end of columns


                    // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                    gridConfig: {
                        // 셀 에디팅 플러그인
                        plugins: [
                             Ext.create('Ext.grid.plugin.CellEditing', {
                                    // 2번 클릭시, 에디팅할 수 있도록 처리
                                    clicksToEdit: 1,
                                    listeners: {
                                        'beforeedit': function (editor, e) {
                                        	if(e.field === "stepStsCd")
                                    			return true;
                                    		else
                                    			return false;

                                            }, // end of edit
                             
                             
                             
			                             'validateedit': function (editor, e) {
			                            	 if(e.originalValue ===  e.value)
			                            		 return false;
			                            	 if(e.value === 'F'){
			                            		 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#stepStsChngErr'));
                                    		 	return false;
			                            	 }
			                            		 swal(
			                       					  {
			                       						  title: ""
			                       						  , text: bxMsg('cbb_items.SCRNITM#step-status-update-msg')
			                       						  , showCancelButton:true
			                       						  , html: true
			                       						  , confirmButtonText:bxMsg('cbb_items.ABRVTN#chk')
			                       						  , cancelButtonText:bxMsg('cbb_items.ABRVTN#cncl')
			                       						  , closeOnConfirm: true
			                       						  , closeOnCancel: true
			                       					  }
			                       				  
			                       					  , function (isConfirm) {
			                       						  if (isConfirm === true) {
			                       							self.saveSearchResult2(e.record.data, e.value);
			                       							return true;
			                       						  }
			                       						  else {
			                       							  return false;
			                       						  }
			                       					  }
			                       			   );
			                            		 
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
                            	that.selectGridRecord2();
                            	
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
                sParam.className = "search-condition-area.CAPMT099-wflowBizDscd-wrap";
                sParam.targetId = "wflowBizDscd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "80015";
                fn_getCodeList(sParam, this);


                sParam = {};
                sParam.className = "baseAtrbt-area.CAPMT099-wflowBizDscd-wrap";
                sParam.targetId = "wflowBizDscd";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "80015";
                fn_getCodeList(sParam, this);

            },


            /*
             * inquire workflow
             */
            inquireSearchCondition : function(){
            	 var that = this;
                 var sParam = {};
                 
                 sParam.instCd = commonInfo.getInstInfo().instCd;
                 sParam.wflowNm = this.$el.find('#search-condition-area [data-form-param="workflowNm"]').val();
                 sParam.bizDscd = this.$el.find('#search-condition-area [data-form-param="wflowBizDscd"]').val();
                 sParam.staffId = this.$el.find('#search-condition-area [data-form-param="staffId"]').val();
                 sParam.varVal = this.$el.find('#search-condition-area [data-form-param="varVal"]').val();

                 if (sParam == null) {
                     this.CAPMT099Grid.resetData();
                     return;
                 }
                 
                 var linkData = {
                         "header": fn_getHeader("PMT0918405"),
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
                                     that.CAPMT099Grid.setData(tbList);
                                     that.$el.find(".searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt') + " (" + fn_setComma(totCnt) + " " + bxMsg('cbb_items.SCRNITM#cnt') + ")");


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
                this.$el.find('#search-condition-area [data-form-param="wflowBizDscd"] option:eq(0)').attr("selected", "selected");


                this.$el.find('#search-condition-area  [data-form-param="wflowBizDscd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#search-condition-area  [data-form-param="workflowStsCd"] option:eq(0)').attr("selected", "selected");
                
                this.$el.find('#search-condition-area  [data-form-param="workflowNm"]').val('');
                this.$el.find('#search-condition-area  [data-form-param="workflowDescCntnt"]').val('');


            },

            /*
             * Rest search area
             */
            resetSearchResult: function () {
            	this.deleteList = [];
                this.CAPMT099Grid.resetData();
                this.$el.find(".searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt'));
            },
            




            /*
             * Select a grid record
             */
            selectGridRecord: function () {
                var that = this;


                if(!this.CAPMT099Grid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPMT099Grid.grid.getSelectionModel().selected.items[0].data;


                if (!selectedRecord) {
                    return;
                }


                that.initFlag = false;


                
                
                
                var sParam = {};
                
                sParam.instCd = commonInfo.getInstInfo().instCd;
                sParam.wflowId = selectedRecord.wflowId;
                sParam.instncId = selectedRecord.instncId;

                if (sParam == null) {
                    this.CAPMT099Grid.resetData();
                    return;
                }
                
                var linkData = {
                        "header": fn_getHeader("PMT0918406"),
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
                                    that.CAPMT099Grid2.setData(tbList);


                                }
                            }
                        }
                    }
                });


            },


            
            selectGridRecord2 : function(){
                var selectedRecord = this.CAPMT099Grid2.grid.getSelectionModel().selected.items[0].data;
                var status = selectedRecord.stepStsCd;
                if(status === 'F' || status === 'E' || status ==='K')
                	this.$el.find('#CAPMT099-transfer-manager-btn').hide();
                else
                	this.$el.find('#CAPMT099-transfer-manager-btn').show();
            },

            /*
             * Confirm delete item
             */
            saveSearchResult: function(data){
            	var that = this;

            	if(!this.CAPMT099Grid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPMT099Grid.grid.getSelectionModel().selected.items[0].data;


                if (!selectedRecord) {
                    return;
                }

                var table = [];
                var sParam = {};




                sParam.instCd = commonInfo.getInstInfo().instCd;
                sParam.wflowId = data.wflowId;
                sParam.instncId = data.instncId;

                var srvcCd = "PMT0908202";


                var linkData = {"header": fn_getHeader(srvcCd), "WorkflowMgmtSvcIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                            that.inquireSearchCondition();
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
                
            },
            
            /*
             * Confirm delete item
             */
            saveSearchResult2: function(data, stsCd){
            	var that = this;
            	
            	if(!this.CAPMT099Grid2.grid.getSelectionModel().selected.items[0]) return;
            	var selectedRecord = this.CAPMT099Grid2.grid.getSelectionModel().selected.items[0].data;
            	
            	
            	if (!selectedRecord) {
            		return;
            	}
            	
            	var table = [];
            	var sParam = {};
            	
            	
            	
            	
            	sParam.instCd = commonInfo.getInstInfo().instCd;
            	sParam.wflowId = data.wflowId;
            	sParam.stepId = data.stepId;
            	sParam.instncId = data.instncId;
            	sParam.stepStsCd = stsCd;
            	
            	var srvcCd = "PMT0918204";
            	
            	
            	var linkData = {"header": fn_getHeader(srvcCd), "WorkflowStepMgmtSvcIO": sParam};
            	
            	
            	// ajax호출
            	bxProxy.post(sUrl, JSON.stringify(linkData), {
            		enableLoading: true
            		, success: function (responseData) {
            			if (fn_commonChekResult(responseData)) {
            				fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
            				
            				
            				that.selectGridRecord();
            			}
            		}   // end of suucess: fucntion
            	}); // end of bxProxy
            	
            },


            
            /*
             * Toggle
             */
            toggleSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find('#search-condition-area'), this.$el.find("#btn-search-condition-toggle"));
            },
            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find("#btn-search-result-reset"));
            },
            
            toggleSearchResult2: function () {
            	fn_pageLayerCtrl(this.$el.find('#search-result-area2'), this.$el.find("#btn-search-result-toggle2"));
            },
            
            
            getTimeStamp:function (d) {
            	  var s =
            	   this.leadingZeros(d.getFullYear(), 4) + '-' +
            	   this.leadingZeros(d.getMonth() + 1, 2) + '-' +
            	   this.leadingZeros(d.getDate(), 2) + ' ' +
            	   this.leadingZeros(d.getHours(), 2) + ':' +
            	   this.leadingZeros(d.getMinutes(), 2) + ':' +
            	   this.leadingZeros(d.getSeconds(), 2);

            	  return s;
            },

			/**
			 * Staff Search popup
			 */
			popStaffSearch: function(){
				var that = this;					
				var param = {};
				param.instCd = commonInfo.getInstInfo().instCd;

			    var popStaffIdObj = new popupStaffId(param);

			    popStaffIdObj.render();
			    popStaffIdObj.on('popUpSetData', function (param) {
			    	that.$el.find('[data-form-param="staffId"]').val(param.staffId); 
			    	that.$el.find('[data-form-param="staffNm"]').val(param.staffNm); 
			    });
			},
			
			/**
			 * Staff Search popup
			 */
			transferManager: function(){
				var that = this;					
				var param = {};
				param.instCd = commonInfo.getInstInfo().instCd;
				
				var popStaffIdObj = new popupStaffId(param);
				
				popStaffIdObj.render();
				popStaffIdObj.on('popUpSetData', function (param) {
					
					var selectedRecord = self.CAPMT099Grid2.grid.getSelectionModel().selected.items[0].data;
					var sParam = {};
					sParam.instCd = commonInfo.getInstInfo().instCd;
	                sParam.wflowId = selectedRecord.wflowId;
	                sParam.instncId = selectedRecord.instncId;
	                sParam.stepId = selectedRecord.stepId;
	                sParam.rspblPersonId = param.staffId;
	                sParam.deptId = param.deptId;
	                
	                
	                var linkData = {
	                         "header": fn_getHeader("PMT0918205"),
	                         "WorkflowStepMgmtSvcIO": sParam


	                 };
	                 
	                 //ajax 호출
	                 bxProxy.post(sUrl, JSON.stringify(linkData), {
	                     //loading 설정
	                     enableLoading: true,
	                     success: function (responseData) {
	                    	 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
	                    	 self.selectGridRecord();
	                     }
	                 });
				
					
				});
			},
            
            
            leadingZeros:	function (n, digits) {
            	  var zero = '';
            	  n = n.toString();

            	  if (n.length < digits) {
            	    for (i = 0; i < digits - n.length; i++)
            	      zero += '0';
            	  }
            	  return zero + n;
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

        
        return CAPMT099View;
    } // end of define function
); // end of define
