define(
    [
     	'bx/common/common-info',
        'text!app/views/page/CAPMT/097/_CAPMT097.html',
        'bx-component/ext-grid/_ext-grid',
        'app/views/page/popup/CAPSV/popup-attribute-search'
    ],
    function (
        commonInfo,
        tpl,
        ExtGrid,
        PopupAttributeSearch
    ) {


        var deleteList = [];
        var initFlag = true;
        var initialData ={};
        var self;

        /**
         * Backbone
         */
        var CAPMT097View = Backbone.View.extend({
        	// set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPMT097-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {


                /*
                 * baseAtrbt-area
                 */
                'click #CAPMT097-btn-baseAtrbt-toggle': 'toggleBaseAttribute',


                /*
                 * search-result-area
                 */
                'click #btn-CAPMT097-grid-up': 'upNode',
				'click #btn-CAPMT097-grid-down': 'downNode',
                'click #btn-search-result-reset': 'resetSearchResult',
                'click #btn-search-result-save': 'saveSearchResult',
                'click #btn-search-result-toggle': 'toggleSearchResult',


                /*
                 * step-baseAtrbt-area
                 */
                'click #CAPMT095-btn-var-search': 'searchAtrbt',
                'click #CAPMT097-btn-step-baseAtrbt-reset': 'resetStepBaseAttribute',
                'click #CAPMT097-btn-step-baseAtrbt-save': 'saveStepBaseAttribute',
                'click #CAPMT097-btn-step-baseAtrbt-toggle': 'toggleStepBaseAttribute'
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
                initialData.stepId = that.initData.param.stepId;
                initialData.stepNm = that.initData.param.stepNm;
            },


            /**
             * Render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find("#CAPMT097Grid").html(this.CAPMT097Grid.render({
                    'height': "440px"
                }));
                
                
                this.$el.find('#baseAtrbt-area  [data-form-param="workflowId"]').val(that.initData.param.workflowId);
                this.$el.find('#baseAtrbt-area  [data-form-param="workflowNm"]').val(that.initData.param.workflowNm);
                this.$el.find('#baseAtrbt-area  [data-form-param="stepNm"]').val(that.initData.param.stepNm);

                
                if(!this.isWorkflowVar()){
                	this.$el.find('#keyGrpNm').hide();
                	for (var k =  0; k < (this.CAPMT097Grid.columns.length) ; k++) {
                        if (this.CAPMT097Grid.columns[k].dataIndex == "keyGrpNm") {
                        	this.CAPMT097Grid.columns[k].hidden = true;
                        }
                    }
                	
                }
                
                this.inquireSearchCondition();
                
                
                
                return this.$el;
            },
            


            /** 
             * Create search results grid
             */
            createGrid: function () {
                var that = this;


                this.CAPMT097Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'varNm', 'varId', 'varTpCd', 'keyYn','keyGrpNm', 'dfltVal', 'stepVarId', 
                             'srvcId', 'srvcNm',  'parmNm', 'aliasId'],
                    id: 'CAPMT097Grid',
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
						
						{text: bxMsg('cbb_items.AT#varId'), flex: 1, dataIndex: 'varId', style: 'text-align:center',align: 'center', hidden : true},
						{text: bxMsg('cbb_items.AT#varNm'), flex: 1, dataIndex: 'varNm', style: 'text-align:center',align: 'center', hidden : false},
						{text: bxMsg('cbb_items.AT#varTpCd'), flex: 1, dataIndex: 'varTpCd', style: 'text-align:center',align: 'center', hidden : true},
						{text: bxMsg('cbb_items.AT#keyYn'), flex: 1, dataIndex: 'keyYn', style: 'text-align:center',align: 'center', hidden : false},
						{text: bxMsg('cbb_items.AT#keyGrpNm'), flex: 1, dataIndex: 'keyGrpNm', style: 'text-align:center',align: 'center', hidden : false},
						{text: bxMsg('cbb_items.AT#dfltVal'), flex: 1, dataIndex: 'dfltVal', style: 'text-align:center',align: 'center', hidden : false},
						{text: bxMsg('cbb_items.AT#stepVarId'), flex: 1, dataIndex: 'stepVarId', style: 'text-align:center',align: 'center', hidden : true},
						{text: bxMsg('cbb_items.AT#srvcId'), flex: 1, dataIndex: 'srvcId', style: 'text-align:center',align: 'center', hidden : true},
						{text: bxMsg('cbb_items.AT#srvcNm'), flex: 1, dataIndex: 'srvcNm', style: 'text-align:center',align: 'center', hidden : true},
						{text: bxMsg('cbb_items.AT#parmNm'), flex: 1, dataIndex: 'parmNm', style: 'text-align:center',align: 'center', hidden : true},
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


                if(!this.CAPMT097Grid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPMT097Grid.grid.getSelectionModel().selected.items[0].data;


                if (!selectedRecord) {
                    return;
                }

                that.initFlag = false;
                this.$el.find('#step-baseAtrbt-area  [data-form-param="varId"]').val(selectedRecord.varId);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="varNm"]').val(selectedRecord.varNm);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="varTpCd"]').val(selectedRecord.varTpCd);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="keyYn"]').val(selectedRecord.keyYn);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="dfltVal"]').val(selectedRecord.dfltVal);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="keyGrpNm"]').val(selectedRecord.keyGrpNm);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="aliasId"]').val(selectedRecord.aliasId);
                this.$el.find('#CAPMT095-btn-var-search').hide();

            },

            /*
             * inquire workflow
             */
            inquireSearchCondition : function(){
            	 var that = this;
                 var sParam = {};
                 
                 var srvcCd = "PMT0908402";
                 if(that.isWorkflowVar()){
                	 sParam.varLvlCd = "W";
                 }
                 else{
                	 sParam.varLvlCd = "S";
                 }
                 
                 sParam.instCd = commonInfo.getInstInfo().instCd;
                 sParam.wflowId = that.initData.param.workflowId;
                 sParam.stepId =that.initData.param.stepId;;

                 if (sParam == null) {
                     this.CAPMT097Grid.resetData();
                     return;
                 }
                 
                 var linkData = {
                         "header": fn_getHeader(srvcCd),
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
                                     that.CAPMT097Grid.setData(tbList);

                                     
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
                this.CAPMT097Grid.resetData();
                this.inquireSearchCondition();
            },
            

            /*
             * Reset basic attribute
             */
            resetStepBaseAttribute: function () {
            	this.initFlag = true;
            	
                
                this.$el.find('#step-baseAtrbt-area  [data-form-param="varId"]').val('');
                this.$el.find('#step-baseAtrbt-area  [data-form-param="varNm"]').val('');
                this.$el.find('#step-baseAtrbt-area  [data-form-param="varTpCd"]').val('');
                this.$el.find('#step-baseAtrbt-area  [data-form-param="keyYn"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#step-baseAtrbt-area  [data-form-param="dfltVal"]').val('');
                this.$el.find('#step-baseAtrbt-area  [data-form-param="keyGrpNm"]').val('');
                this.$el.find('#step-baseAtrbt-area  [data-form-param="aliasId"]').val('');
                this.$el.find('#CAPMT095-btn-var-search').show();
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
                        sub.wflowId = self.initData.param.workflowId;
                        sub.stepId = that.initData.param.stepId;
                        sub.varId = data.varId;
                        table.push(sub);
                    });


                    sParam.tblNm = table;

                    var srvcCd;
                    if(that.isWorkflowVar()){
                    	srvcCd = "PMT0908302";
                    }
                    else{
                    	srvcCd = "PMT0918302";
                    }


                    var linkData = {"header": fn_getHeader(srvcCd), "WorkflowVariableSvcIOList": sParam};


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

                
                var srvcCd;
                if(that.isWorkflowVar()){
                    if(this.initFlag) srvcCd = "PMT0908101";
                    else srvcCd = "PMT0908201";
                }
                else{
                    if(this.initFlag) srvcCd = "PMT0918102";
                    else srvcCd = "PMT0918203";
                }
                
                
                sParam.instCd = commonInfo.getInstInfo().instCd;
                sParam.wflowId = that.initData.param.workflowId;
                sParam.stepId = that.initData.param.stepId;
                sParam.varId = this.$el.find('#step-baseAtrbt-area  [data-form-param="varId"]').val();
                sParam.varNm = this.$el.find('#step-baseAtrbt-area  [data-form-param="varNm"]').val();
                sParam.varTpCd = this.$el.find('#step-baseAtrbt-area  [data-form-param="varTpCd"]').val();
                sParam.keyYn = this.$el.find('#step-baseAtrbt-area  [data-form-param="keyYn"]').val();
                sParam.keyGrpNm = this.$el.find('#step-baseAtrbt-area  [data-form-param="keyGrpNm"]').val();
                sParam.dfltVal = this.$el.find('#step-baseAtrbt-area  [data-form-param="dfltVal"]').val();
                sParam.aliasId = this.$el.find('#step-baseAtrbt-area  [data-form-param="aliasId"]').val();
                
                var linkData = {"header": fn_getHeader(srvcCd), "WorkflowVariableSvcIO": sParam};
	              
                
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
                fn_pageLayerCtrl(this.$el.find('#baseAtrbt-area'), this.$el.find("#CAPMT097-btn-baseAtrbt-toggle"));
            },
            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find("#btn-search-result-toggle"));
            },
            
            toggleStepBaseAttribute: function () {
                fn_pageLayerCtrl(this.$el.find('#step-baseAtrbt-area'), this.$el.find("#CAPMT097-btn-step-baseAtrbt-toggle"));
            },
            
            searchAtrbt: function () {
             	var that = this;
             	var sParam = {};


         		this.popupAttributeSearch = new PopupAttributeSearch(sParam);
         		this.popupAttributeSearch.render();
         		this.popupAttributeSearch.on('popUpSetData', function (data) {

         			that.$el.find('#step-baseAtrbt-area  [data-form-param="varId"]').val(data.atrbtCd);   
         			that.$el.find('#step-baseAtrbt-area  [data-form-param="varNm"]').val(data.loginLngAtrbtNm);   
         			that.$el.find('#step-baseAtrbt-area  [data-form-param="varTpCd"]').val(data.atrbtTpCd);   
             		



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
            },


            isWorkflowVar: function(){
            	if(!self.initData.param.stepNm || that.initData.param.stepNm.length === 0)
            		return true;
            	else
            		return false;
            }





        }); // end of Backbone.View.extend({


        return CAPMT097View;
    } // end of define function
); // end of define
