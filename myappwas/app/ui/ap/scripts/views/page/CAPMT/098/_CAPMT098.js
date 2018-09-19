define(
    [
     	'bx/common/common-info',
        'text!app/views/page/CAPMT/098/_CAPMT098.html',
        'bx-component/ext-grid/_ext-grid',
        'app/views/page/popup/CAPCM/popup-role-search'
    ],
    function (
        commonInfo,
        tpl,
        ExtGrid,
        PopupRoleSearch
    ) {

    	var comboStore = {};
        var deleteList = [];
        var initFlag = true;
        var initialData ={};
        var self;

        /**
         * Backbone
         */
        var CAPMT098View = Backbone.View.extend({
        	// set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPMT098-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {


                /*
                 * baseAtrbt-area
                 */
                'click #CAPMT098-btn-baseAtrbt-toggle': 'toggleBaseAttribute',


                /*
                 * search-result-area
                 */
                'click #btn-CAPMT098-grid-up': 'upNode',
				'click #btn-CAPMT098-grid-down': 'downNode',
                'click #btn-search-result-reset': 'resetSearchResult',
                'click #btn-search-result-save': 'saveSearchResult',
                'click #btn-search-result-toggle': 'toggleSearchResult',


                /*
                 * step-baseAtrbt-area
                 */
                'click #btn-roleId-search': 'searchRoleId',
                'click #CAPMT098-btn-step-baseAtrbt-reset': 'resetStepBaseAttribute',
                'click #CAPMT098-btn-step-baseAtrbt-save': 'saveStepBaseAttribute',
                'click #CAPMT098-btn-step-baseAtrbt-toggle': 'toggleStepBaseAttribute'
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
                initialData.srvcId = that.initData.param.srvcId;
                initialData.srvcNm = that.initData.param.srvcNm;
                
                comboStore = Ext.create('Ext.data.Store', {
                	fields: ['cd', 'cdNm'],
                    data : [
                        {cd: 'N',   cdNm: '없음'},
                        {cd: 'E',    cdNm: '실행'},
                        {cd: 'R',     cdNm: '참조'},
                        {cd: 'A', cdNm: '승인'},
                        {cd: 'M', cdNm: '관리'}
                    ]
                });
            },
            


            /**
             * Render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find("#CAPMT098Grid").html(this.CAPMT098Grid.render({
                    'height': "440px"
                }));
                
                
                this.$el.find('#baseAtrbt-area  [data-form-param="workflowId"]').val(that.initData.param.workflowId);
                this.$el.find('#baseAtrbt-area  [data-form-param="workflowNm"]').val(that.initData.param.workflowNm);
                this.$el.find('#baseAtrbt-area  [data-form-param="stepNm"]').val(that.initData.param.stepNm);
                this.$el.find('#baseAtrbt-area  [data-form-param="srvcNm"]').val(that.initData.param.srvcNm);

                
                this.inquireSearchCondition();
                
                return this.$el;
            },
            


            /** 
             * Create search results grid
             */
            createGrid: function () {
                var that = this;


                this.CAPMT098Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'athrtyCd', 'roleId', 'roleNm'],
                    id: 'CAPMT098Grid',
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
						
						{text: bxMsg('cbb_items.AT#roleId'), flex: 1, dataIndex: 'roleId', style: 'text-align:center',align: 'center', hidden : false},
						{text: bxMsg('cbb_items.AT#roleNm'), flex: 1, dataIndex: 'roleNm', style: 'text-align:center',align: 'center', hidden : false},
						{text: bxMsg('cbb_items.AT#athrtyCd'), flex: 1, dataIndex: 'athrtyCd', style: 'text-align:center',align: 'center', hidden : false,
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


                if(!this.CAPMT098Grid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPMT098Grid.grid.getSelectionModel().selected.items[0].data;


                if (!selectedRecord) {
                    return;
                }

                that.initFlag = false;
                this.$el.find('#step-baseAtrbt-area  [data-form-param="roleId"]').val(selectedRecord.roleId);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="roleNm"]').val(selectedRecord.roleNm);
                this.$el.find('#step-baseAtrbt-area  [data-form-param="athrtyCd"]').val(selectedRecord.athrtyCd);
                this.$el.find('#btn-roleId-search').hide();

            },

            /*
             * inquire workflow
             */
            inquireSearchCondition : function(){
            	 var that = this;
                 var sParam = {};
                 
                 var srvcCd = "PMT0988400";
                 
                 sParam.instCd = commonInfo.getInstInfo().instCd;
                 sParam.wflowId = that.initData.param.workflowId;
                 sParam.stepId =that.initData.param.stepId;
                 sParam.srvcId =that.initData.param.srvcId;

                 if (sParam == null) {
                     this.CAPMT098Grid.resetData();
                     return;
                 }
                 
                 var linkData = {
                         "header": fn_getHeader(srvcCd),
                         "WorkflowRoleMgmtSvcIO": sParam


                 };
                 
                 //ajax 호출
                 bxProxy.post(sUrl, JSON.stringify(linkData), {
                     //loading 설정
                     enableLoading: true,
                     success: function (responseData) {


                         if (fn_commonChekResult(responseData)) {
                             if (responseData.WorkflowRoleMgmtSvcIOList) {
                                 var tbList = responseData.WorkflowRoleMgmtSvcIOList.tblNm;
                                 var totCnt = tbList.length;


                                 if (tbList != null || tbList.length > 0) {
                                     that.CAPMT098Grid.setData(tbList);

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
                this.CAPMT098Grid.resetData();
                this.inquireSearchCondition();
            },
            

            /*
             * Reset basic attribute
             */
            resetStepBaseAttribute: function () {
            	this.initFlag = true;
            	
                
                this.$el.find('#step-baseAtrbt-area  [data-form-param="roleId"]').val('');
                this.$el.find('#step-baseAtrbt-area  [data-form-param="roleNm"]').val('');
                this.$el.find('#step-baseAtrbt-area  [data-form-param="athrtyCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#btn-roleId-search').show();
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
                        sub.stepId = self.initData.param.stepId;
                        sub.srvcId = self.initData.param.srvcId;
                        sub.roleId = data.roleId;
                        table.push(sub);
                    });


                    sParam.tblNm = table;

                    var srvcCd = "PMT0988300";


                    var linkData = {"header": fn_getHeader(srvcCd), "WorkflowRoleMgmtSvcIOList": sParam};


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

                
                var srvcCd = "PMT0988100";
                
                
                sParam.instCd = commonInfo.getInstInfo().instCd;
                sParam.wflowId = that.initData.param.workflowId;
                sParam.stepId = that.initData.param.stepId;
                sParam.srvcId = that.initData.param.srvcId;
                sParam.roleId = this.$el.find('#step-baseAtrbt-area  [data-form-param="roleId"]').val();
                sParam.roleNm = this.$el.find('#step-baseAtrbt-area  [data-form-param="roleNm"]').val();
                sParam.athrtyCd = this.$el.find('#step-baseAtrbt-area  [data-form-param="athrtyCd"]').val();
                
                var linkData = {"header": fn_getHeader(srvcCd), "WorkflowRoleMgmtSvcIO": sParam};
	              
                
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
                fn_pageLayerCtrl(this.$el.find('#baseAtrbt-area'), this.$el.find("#CAPMT098-btn-baseAtrbt-toggle"));
            },
            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find("#btn-search-result-toggle"));
            },
            
            toggleStepBaseAttribute: function () {
                fn_pageLayerCtrl(this.$el.find('#step-baseAtrbt-area'), this.$el.find("#CAPMT098-btn-step-baseAtrbt-toggle"));
            },
            
            searchRoleId: function () {
             	var that = this;
             	var sParam = {};


         		this.popupRoleSearch = new PopupRoleSearch(sParam);
         		this.popupRoleSearch.render();
         		this.popupRoleSearch.on('popUpSetData', function (data) {

         			that.$el.find('#step-baseAtrbt-area  [data-form-param="roleId"]').val(data.roleId);   
         			that.$el.find('#step-baseAtrbt-area  [data-form-param="roleNm"]').val(data.roleNm);   
             		



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


        return CAPMT098View;
    } // end of define function
); // end of define
