define(
    [
     	'bx/common/common-info',
        'text!app/views/page/CAPMT/096/_CAPMT096.html',
        'bx-component/ext-grid/_ext-grid',
        'app/views/page/popup/CAPSV/popup-screen-search',
        'app/views/page/popup/CAPSV/popup-service',
        'app/views/page/popup/CAPMT/popup-rule'
    ],
    function (
        commonInfo,
        tpl,
        ExtGrid,
        PopupScrnSearch,
        PopupSrvcSearch,
        PopupRuleSearch
    ) {


        var comboStore = {}; 
        var recordParam = null;
        var deleteList = [];
        var initFlag = true;
        var initialData ={};
        var self;

        /**
         * Backbone
         */
        var CAPMT096View = Backbone.View.extend({
        	// set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPMT096-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {


                /*
                 * baseAtrbt-area
                 */
                'click #CAPMT096-btn-baseAtrbt-toggle': 'toggleBaseAttribute',


                /*
                 * search-result-area
                 */
                'click #btn-search-result-reset': 'resetSearchResult',
                'click #btn-search-result-save': 'saveSearchResult',
                'click #btn-search-result-toggle': 'toggleSearchResult',


                /*
                 * step-baseAtrbt-area
                 */
                'click #btn-scrnId-search': 'serachScrnId',
                'click #btn-srvcCd-search': 'searchSrvcCd',
                'click #btn-dsplyRuleNm-search': 'searchScrnRule',
                'click #btn-srvcRuleNm-search': 'searchSrvcRule',
                'click #CAPMT096-manage-role-btn': 'manageRole',
                'click #CAPMT096-btn-step-baseAtrbt-reset': 'resetStepBaseAttribute',
                'click #CAPMT096-btn-step-baseAtrbt-save': 'saveStepBaseAttribute',
                'click #CAPMT096-btn-step-baseAtrbt-toggle': 'toggleStepBaseAttribute'
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
                initialData.workflowNm = that.initData.param.workflowNm;
                initialData.workflowDescCntnt = that.initData.param.workflowDescCntnt;
                initialData.stepId = that.initData.param.stepId;
                initialData.stepNm = that.initData.param.stepNm;
                initialData.stepDescCntnt = that.initData.param.stepDescCntnt;
                
                comboStore = Ext.create('Ext.data.Store', {
                	fields: ['cd', 'cdNm'],
                    data : [
                        {cd: '',   cdNm: '없음'},
                        {cd: 'T',    cdNm: '할일'},
                        {cd: 'E', cdNm: '이벤트'}
                    ]
                });
            },


            /**
             * Render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find("#CAPMT096Grid").html(this.CAPMT096Grid.render({
                    'height': "330px"
                }));
                
                
                this.$el.find('#baseAtrbt-area  [data-form-param="workflowId"]').val(that.initData.param.workflowId);
                this.$el.find('#baseAtrbt-area  [data-form-param="workflowNm"]').val(that.initData.param.workflowNm);
                this.$el.find('#baseAtrbt-area  [data-form-param="workflowDescCntnt"]').val(that.initData.param.workflowDescCntnt);
                this.$el.find('#baseAtrbt-area  [data-form-param="stepId"]').val(that.initData.param.stepId);
                this.$el.find('#baseAtrbt-area  [data-form-param="stepNm"]').val(that.initData.param.stepNm);
                this.$el.find('#baseAtrbt-area  [data-form-param="stepDescCntnt"]').val(that.initData.param.stepDescCntnt);

                
                this.inquireSearchCondition();
                
                return this.$el;
            },
            




            /** 
             * Create search results grid
             */
            createGrid: function () {
                var that = this;


                this.CAPMT096Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'srvcId', 'srvcTpCd', 'srvcNm', 'srvcCd','srvcRuleId', 'scrnNm', 'scrnId', 
                             'srvcRuleNm', 'roleId',  'athrtyCd', 'scrnDsplyCd', 'dsplyRuleId', 'dsplyRuleNm', 'srvcSeq', 'lastChngTmstmp', 'lastChngGuid'],
                    id: 'CAPMT096Grid',
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
                         
                         {text: bxMsg('cbb_items.AT#srvcNm'), flex: 1, dataIndex: 'srvcNm', style: 'text-align:center',align: 'center', hidden : false},
                         {text: bxMsg('cbb_items.AT#srvcId'), flex: 1, dataIndex: 'srvcId', style: 'text-align:center',align: 'center', hidden : true},
                         {text: bxMsg('cbb_items.AT#srvcTpCd'), flex: 1, dataIndex: 'srvcTpCd', style: 'text-align:center',align: 'center', hidden : true},
                         {text: bxMsg('cbb_items.AT#srvcCd'), flex: 1, dataIndex: 'srvcCd', style: 'text-align:center',align: 'center', hidden : true},
                         {text: bxMsg('cbb_items.AT#srvcRuleId'), flex: 1, dataIndex: 'srvcRuleId', style: 'text-align:center',align: 'center', hidden : true},
                         {text: bxMsg('cbb_items.AT#scrnNm'), flex: 1, dataIndex: 'scrnNm', style: 'text-align:center',align: 'center', hidden : false},
                         {text: bxMsg('cbb_items.AT#scrnId'), flex: 1, dataIndex: 'scrnId', style: 'text-align:center',align: 'center', hidden : true},
                         {text: bxMsg('cbb_items.AT#srvcRuleNm'), flex: 1, dataIndex: 'srvcRuleNm', style: 'text-align:center',align: 'center', hidden : false},
                         {text: bxMsg('cbb_items.AT#roleId'), flex: 1, dataIndex: 'roleId', style: 'text-align:center',align: 'center', hidden : true},
                         {text: bxMsg('cbb_items.AT#athrtyCd'), flex: 1, dataIndex: 'athrtyCd', style: 'text-align:center',align: 'center', hidden : true},
                         {text: bxMsg('cbb_items.AT#dsplyRuleId'), flex: 1, dataIndex: 'dsplyRuleId', style: 'text-align:center',align: 'center', hidden : true},
                         {text: bxMsg('cbb_items.AT#dsplyRuleNm'), flex: 1, dataIndex: 'dsplyRuleNm', style: 'text-align:center',align: 'center', hidden : false},
                         
                         /*
                          * scrnDsplyCd
                          */
                        {
                            text: bxMsg('cbb_items.SCRNITM#todoEventDistinction'),
                            flex: 1, 
                            dataIndex: 'scrnDsplyCd',
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
                         
                         {text: bxMsg('cbb_items.AT#srvcSeq'), flex: 1, dataIndex: 'srvcSeq', style: 'text-align:center',align: 'center', hidden : true},
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
            
            /*
             * Select a grid record
             */
            selectGridRecord: function () {
                var that = this;


                if(!this.CAPMT096Grid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPMT096Grid.grid.getSelectionModel().selected.items[0].data;


                if (!selectedRecord) {
                    return;
                }

                that.initFlag = false;
                
                this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnNm"]').val(selectedRecord.scrnNm);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcNm"]').val(selectedRecord.srvcNm);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnDsplyCd"]').val(selectedRecord.scrnDsplyCd);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="dsplyRuleNm"]').val(selectedRecord.dsplyRuleNm);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcRuleNm"]').val(selectedRecord.srvcRuleNm);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnId"]').val(selectedRecord.scrnId);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcId"]').val(selectedRecord.srvcId);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcCd"]').val(selectedRecord.srvcCd);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcRuleId"]').val(selectedRecord.srvcRuleId);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="dsplyRuleId"]').val(selectedRecord.dsplyRuleId);
                //this.$el.find('#step-baseAtrbt-area  [data-form-param="manageRole"]').show('');
            },


            
            /*
             * inquire workflow
             */
            inquireSearchCondition : function(){
            	 var that = this;
                 var sParam = {};
                 
                 
                 sParam.instCd = commonInfo.getInstInfo().instCd;
                 sParam.wflowId = that.initData.param.workflowId;
                 sParam.stepId = that.initData.param.stepId;

                 if (sParam == null) {
                     this.CAPMT096Grid.resetData();
                     return;
                 }
                 
                 var linkData = {
                         "header": fn_getHeader("PMT0968400"),
                         "WorkflowStepMgmtSvcIO": sParam


                 };
                 
                 //ajax 호출
                 bxProxy.post(sUrl, JSON.stringify(linkData), {
                     //loading 설정
                     enableLoading: true,
                     success: function (responseData) {


                         if (fn_commonChekResult(responseData)) {
                             if (responseData.WorkflowServiceMgmtSvcIOList) {
                                 var tbList = responseData.WorkflowServiceMgmtSvcIOList.tblNm;
                                 var totCnt = tbList.length;


                                 if (tbList != null || tbList.length > 0) {
                                     that.CAPMT096Grid.setData(tbList);

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
            	this.resetStepBaseAttribute();
                this.CAPMT096Grid.resetData();
                this.inquireSearchCondition();
            },
            

            /*
             * Reset basic attribute
             */
            resetStepBaseAttribute: function () {
            	this.initFlag = true;
            	
                
                this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnNm"]').val('');
                this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcNm"]').val('');
                this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnDsplyCd"]').val('');
                this.$el.find('#step-baseAtrbt-area  [data-form-param="dsplyRuleNm"]').val('');
                this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcRuleNm"]').val('');
                this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnId"]').val('');
                this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcId"]').val('');
                this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcRuleId"]').val('');
                this.$el.find('#step-baseAtrbt-area  [data-form-param="dsplyRuleId"]').val('');
                this.$el.find('#step-baseAtrbt-area  [data-form-param="dsplyRuleId"]').val('');
                this.$el.find('#step-baseAtrbt-area  [data-form-param="manageRole"]').hide('');
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
                        sub.srvcId = data.srvcId;

                        
                        table.push(sub);
                    });


                    sParam.tblNm = table;




                    var linkData = {"header": fn_getHeader("PMT0968300"), "WorkflowServiceMgmtSvcIOList": sParam};


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
            saveStepBaseAttribute: function(){
            	var that = this;
                var sParam = {};
                var srvcCd = "";
                if(this.initFlag) srvcCd = "PMT0968100";
                else srvcCd = "PMT0968200";
                
                sParam.instCd = commonInfo.getInstInfo().instCd;
                sParam.wflowId = that.initData.param.workflowId;
                sParam.stepId = that.initData.param.stepId;
                sParam.srvcId = this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcId"]').val();
                sParam.srvcNm = this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcNm"]').val();
                sParam.srvcCd = this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcCd"]').val();
                sParam.scrnId = this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnId"]').val();
                sParam.scrnNm = this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnNm"]').val();
                sParam.srvcRuleId = this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcRuleId"]').val();
                sParam.dsplyRuleId = this.$el.find('#step-baseAtrbt-area  [data-form-param="dsplyRuleId"]').val();
                sParam.scrnDsplyCd = this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnDsplyCd"]').val();
                
                
                var linkData = {"header": fn_getHeader(srvcCd), "WorkflowServiceMgmtSvcIO": sParam};
	              
                
                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            that.resetStepBaseAttribute();
                            that.inquireSearchCondition();
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },
            
            /*
             * Toggle
             */
            toggleBaseAttribute: function () {
                fn_pageLayerCtrl(this.$el.find('#baseAtrbt-area'), this.$el.find("#CAPMT096-btn-baseAtrbt-toggle"));
            },
            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find("#btn-search-result-toggle"));
            },
            
            toggleStepBaseAttribute: function () {
                fn_pageLayerCtrl(this.$el.find('#step-baseAtrbt-area'), this.$el.find("#CAPMT096-btn-step-baseAtrbt-toggle"));
            },
            
            
            /**
             * 화면조회 팝업
             */
            serachScrnId : function(){
                var that = this;
                var sParam = {};


                sParam.scrnId = that.$el.find('#step-baseAtrbt-area [data-form-param="scrnId"]').val();


                var popupScrnSearch = new PopupScrnSearch(sParam);


                popupScrnSearch.render();
                popupScrnSearch.on('popUpSetData', function (data) {
                    that.$el.find('[data-form-param="scrnId"]').val(data.scrnId);
                    that.$el.find('[data-form-param="scrnNm"]').val(data.scrnNm);
                });
			},
			
			/**
             * 서비스조회 팝업
             */
			searchSrvcCd : function(){
				var that = this;
				var sParam = {};
				
				
				sParam.srvcCd = that.$el.find('#step-baseAtrbt-area [data-form-param="srvcCd"]').val();
				
				
				var popupSrvcSearch = new PopupSrvcSearch(sParam);
				
				
				popupSrvcSearch.render();
				popupSrvcSearch.on('popUpSetData', function (data) {
					that.$el.find('[data-form-param="srvcCd"]').val(data.srvcCd);
					that.$el.find('[data-form-param="srvcNm"]').val(data.srvcNm);
				});
			},

            
            /**
             * 규칙조회 팝업
             */
			searchSrvcRule : function(){
				var that = this;
				var sParam = {};
				
				
				sParam.srvcCd = that.$el.find('#step-baseAtrbt-area [data-form-param="srvcCd"]').val();
				
				
				var popupRuleSearch = new PopupRuleSearch(sParam);
				
				
				popupRuleSearch.render();
				popupRuleSearch.on('popUpSetData', function (data) {
					that.$el.find('[data-form-param="srvcRuleId"]').val(data.ruleId);
					that.$el.find('[data-form-param="srvcRuleNm"]').val(data.ruleNm);
				});
			},
			
			/**
             * 규칙조회 팝업
             */
			searchScrnRule : function(){
				var that = this;
				var sParam = {};
				
				
				sParam.srvcCd = that.$el.find('#step-baseAtrbt-area [data-form-param="srvcCd"]').val();
				
				
				var popupRuleSearch = new PopupRuleSearch(sParam);
				
				
				popupRuleSearch.render();
				popupRuleSearch.on('popUpSetData', function (data) {
					that.$el.find('[data-form-param="dsplyRuleId"]').val(data.ruleId);
					that.$el.find('[data-form-param="dsplyRuleNm"]').val(data.ruleNm);
				});
			},
			
			manageRole: function(){
            	
            	this.$el.trigger({
            		type: 'open-conts-page',
            		pageHandler: 'CAPMT098',
            		pageDPName: bxMsg('cbb_items.SCRN#CAPMT098'),
            		pageInitialize: true,
            		pageRenderInfo: {
            			workflowId: self.initData.param.workflowId,
            			workflowNm: self.initData.param.workflowNm,
            			stepId: self.initData.param.stepId,
            			stepNm: self.initData.param.stepNm,
            			srvcId: self.$el.find('#step-baseAtrbt-area  [data-form-param="srvcId"]').val(),
            			srvcNm: self.$el.find('#step-baseAtrbt-area  [data-form-param="srvcNm"]').val()
            			
            			
            		}
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


        return CAPMT096View;
    } // end of define function
); // end of define
