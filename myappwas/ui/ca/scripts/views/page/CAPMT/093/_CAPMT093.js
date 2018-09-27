define(
    [
     	'bx/common/common-info',
        'text!app/views/page/CAPMT/093/_CAPMT093.html',
        'bx-component/ext-grid/_ext-grid',
        'app/views/page/popup/CAPSV/popup-screen-search',
        'app/views/page/popup/CAPSV/popup-service'
    ],
    function (
        commonInfo,
        tpl,
        ExtGrid,
        PopupScrnSearch,
        PopupSrvcSearch
    ) {


        var recordParam = null;
        var deleteList = [];
        var initFlag = true;
        var initialData ={};
        var comboStore1 = {};

        /**
         * Backbone
         */
        var CAPMT093View = Backbone.View.extend({
        	// set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPMT093-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {

                /*
                 * step-baseAtrbt-area
                 */
                'click #CAPMT093-btn-step-baseAtrbt-toggle': 'toggleStepBaseAttribute',



                /*
                 * search-result-area
                 */
                'click #btn-search-result-reset': 'resetSearchResult',
                'click #btn-search-result-save': 'saveSearchResult',
                'click #btn-search-result-toggle': 'toggleSearchResult',


                /*
                 * prev-step
                 */
                'click #CAPMT093-btn-prev-step-baseAtrbt-toggle': 'togglePrevStep',
                'click #CAPMT093-btn-prev-step-baseAtrbt-reset': 'resetPrevStep',
                'click #CAPMT093-btn-prev-step-baseAtrbt-save': 'savePrevStep'	
                	
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
                self = this;
                that = this;
                
                initialData.workflowId = that.initData.param.workflowId;
                initialData.stepNm = that.initData.param.stepNm;
                initialData.stepTpCd = that.initData.param.stepTpCd;
                initialData.stepDescCntnt = that.initData.param.stepDescCntnt;
                initialData.stepId = that.initData.param.stepId;
                
                comboStore1 = Ext.create('Ext.data.Store', {
                	fields: ['cd', 'cdNm'],
                    data : [
                        {cd: '&&',   cdNm: 'ADD'},
                        {cd: '||',    cdNm: 'OR'}
                    ]
                });
                
            },


            /**
             * Render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find("#CAPMT093Grid").html(this.CAPMT093Grid.render({
                    'height': "380px"
                }));
                
                
                this.$el.find('#step-baseAtrbt-area  [data-form-param="stepId"]').val(that.initData.param.stepId);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="stepNm"]').val(that.initData.param.stepNm);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnNm"]').val(that.initData.param.scrnNm);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcNm"]').val(that.initData.param.srvcNm);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="stepDescCntnt"]').val(that.initData.param.stepDescCntnt);

                
                this.inquireSearchCondition();
                
                return this.$el;
            },
            


            /** 
             * Create search results grid
             */
            createGrid: function () {
                var that = this;


                this.CAPMT093Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'wflowId', 'stepId', 'stepNm', 'stepTpCd', 'nxtStepId', 'nxtStepNm',
                             'prvsCmprsnLvl', 'prvsCmprsnOprtrCd',  'lastChngGuid'],
                    id: 'CAPMT093Grid',
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
                         * stepNm
                         */
                        {
                        	text: bxMsg('cbb_items.AT#prvsStepNm'),
                        	dataIndex: 'stepNm',
                        	width: 200,
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: false
                        },
                        
                        /*
                         * stepTpCd
                         */
                        {
                        	text: bxMsg('cbb_items.AT#stepTpCd'),
                        	dataIndex: 'stepTpCd',
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
                        	hidden: true
                        },
                        
                        /*
                         * prvsCmprsnLvl 
                         */
                        {
                        	text: bxMsg('cbb_items.AT#cmprsnLvl'),
                        	dataIndex: 'prvsCmprsnLvl',
                        	width: 200,
                        	flex: 1,
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: false
                        },
                        
                        
                        {text: bxMsg('cbb_items.SCRNITM#prcsngRsltDscd'), flex: 1, dataIndex: 'prvsCmprsnOprtrCd', style: 'text-align:center',align: 'center', hidden : false,
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
                     this.CAPMT093Grid.resetData();
                     return;
                 }
                 
                 var linkData = {
                         "header": fn_getHeader("PMT0918403"),
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
                                     that.CAPMT093Grid.setData(tbList);

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
            	this.resetPrevStep();
                this.CAPMT093Grid.resetData();
                this.inquireSearchCondition();
            },
            

            /*
             * Reset basic attribute
             */
            resetPrevStep: function () {
            	this.initFlag = true;
            	
                this.$el.find('#prev-step-baseAtrbt-area [data-form-param="prvsStepNm"]').val('');
                this.$el.find('#prev-step-baseAtrbt-area [data-form-param="prvsCmprsnLvl"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#prev-step-baseAtrbt-area [data-form-param="prvsCmprsnOprtrCd"] option:eq(0)').attr("selected", "selected");   
                },



            /*
             * Select a grid record
             */
            selectGridRecord: function () {
                var that = this;


                if(!this.CAPMT093Grid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPMT093Grid.grid.getSelectionModel().selected.items[0].data;
                
                if (!selectedRecord) {
                    return;
                }


                that.initFlag = false;
                this.$el.find('#prev-step-baseAtrbt-area [data-form-param="prvsStepNm"]').val(selectedRecord.stepNm);
                this.$el.find('#prev-step-baseAtrbt-area [data-form-param="stepId"]').val(selectedRecord.stepId);
                this.$el.find('#prev-step-baseAtrbt-area [data-form-param="prvsCmprsnLvl"]').val(self.unFillBlank(selectedRecord.prvsCmprsnLvl));
                this.$el.find('#prev-step-baseAtrbt-area [data-form-param="prvsCmprsnOprtrCd"]').val(selectedRecord.prvsCmprsnOprtrCd);
                this.$el.find('#prev-step-baseAtrbt-area [data-form-param="lastChngGuid"]').val(selectedRecord.lastChngGuid);


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
            savePrevStep: function(){
            	var that = this;
                var sParam = {};
                var srvcCd = "";
                srvcCd = "PMT0918201";
                
                if(this.$el.find('#prev-step-baseAtrbt-area  [data-form-param="stepId"]').val() == "")
                	return;
                
                sParam.instCd = commonInfo.getInstInfo().instCd;
                sParam.wflowId = that.initData.param.workflowId;
                sParam.nxtStepId = that.initData.param.stepId;
                sParam.stepId = this.$el.find('#prev-step-baseAtrbt-area  [data-form-param="stepId"]').val();
                sParam.lastChngGuid = this.$el.find('#prev-step-baseAtrbt-area  [data-form-param="lastChngGuid"]').val();
                sParam.prvsCmprsnLvl = this.$el.find('#prev-step-baseAtrbt-area  [data-form-param="prvsCmprsnLvl"]').val();
                sParam.prvsCmprsnOprtrCd = this.$el.find('#prev-step-baseAtrbt-area  [data-form-param="prvsCmprsnOprtrCd"]').val();
                
                var linkData = {"header": fn_getHeader(srvcCd), "WorkflowStepMgmtSvcIO": sParam};
	              
                
                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            that.resetPrevStep();
                            that.inquireSearchCondition();
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },
            
            /*
             * Toggle
             */
            
            toggleStepBaseAttribute: function () {
                fn_pageLayerCtrl(this.$el.find('#step-baseAtrbt-area'), this.$el.find("#CAPMT093-btn-step-baseAtrbt-toggle"));
            },
            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find("#btn-search-result-toggle"));
            },
            togglePrevStep: function () {
            	fn_pageLayerCtrl(this.$el.find('#prev-step-baseAtrbt-area'), this.$el.find("#CAPMT093-btn-prev-step-baseAtrbt-toggle"));
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
            	else if(obj === 0)
            		return "";
            	else
            		return obj;
            }








        }); // end of Backbone.View.extend({


        return CAPMT093View;
    } // end of define function
); // end of define
