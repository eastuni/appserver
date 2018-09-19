define(
    [
     	'bx/common/common-info',
        'text!app/views/page/CAPMT/090/_CAPMT090.html',
        'bx-component/ext-grid/_ext-grid'
        , 'app/views/page/popup/CAPMT/popup-copy'
    ],
    function (
        commonInfo,
        tpl,
        ExtGrid,
        PopupWfCopy
    ) {


        var comboStore1 = {}; // 업무구분코드('전체'를 포함)
        var comboStore2 = {}; // 상태코드
        var comboStore3 = {}; // 업무구분코드
        var recordParam = null;
        var deleteList = [];
        var initFlag = true;
        var copyParam = {};

        /**
         * Backbone
         */
        var CAPMT090View = Backbone.View.extend({
        	// set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPMT090-page',
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
                'click #btn-search-result-copy': 'copySelectRow',
                'click #btn-search-result-save': 'saveSearchResult',
                'click #btn-search-result-toggle': 'toggleSearchResult',
                /*
                 * baseAtrbt-area
                 */
                'click #btn-baseAtrbt-reset': 'resetBasicAttribute',
                'click #btn-baseAtrbt-save': 'saveWorkflow',
                'click #btn-baseAtrbt-toggle': 'toggleBasicAttribute',
                /*
                 * 
                 */
                'click #CAPMT090-manage-step-btn': 'manageStep',
                'click #CAPMT090-manage-variable-btn': 'manageVariable',
                'click #CAPMT090-manage-role-btn': 'manageRole'
            },

            /**
             * initialize
             */
            initialize: function (initData) {
                $.extend(this, initData);
                this.setComboStore();
                this.initData = initData;
                this.deleteList = [];
                this.initFlag = true;
                this.createGrid();
                self = this;
                
                var header = fn_getHeader("CAPCM0038400");
                var sParam = {};
                sParam.cdNbr = "A1092";
                var linkData1 = {
                    "header": header,
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };

                bxProxy.all([
                    {
                        url: sUrl,
                        param: JSON.stringify(linkData1),
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                comboStore2 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }
   	          ], {
                    success: function () {}
                });
                
                sParam = {};
                sParam.className = "search-condition-area.CAPMT090-workflowStsCd-wrap";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A1092";
                fn_getCodeList(sParam, this);
                
                sParam = {};
                sParam.className = "baseAtrbt-area.CAPMT090-workflowStsCd-wrap";
                sParam.nullYn = "N";
                sParam.cdNbr = "A1092";
                fn_getCodeList(sParam, this);
            },


            /**
             * Render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find("#CAPMT090Grid").html(this.CAPMT090Grid.render({
                    'height': "380px"
                }));
                this.setComboBoxes();
                this.resetSearchCondition();
                this.resetBasicAttribute();

              //배포처리반영[버튼비활성화]
//                fn_btnCheckForDistribution([
//                                    		this.$el.find('.CAPMT090-wrap #btn-search-result-save')
//                                    		,this.$el.find('.CAPMT090-wrap #btn-baseAtrbt-save')
//                                    			   ]);
                return this.$el;
            },


            setComboStore: function () {
                var header = fn_getHeader("CAPCM0038400");


                var sParam = {};
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


                this.CAPMT090Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'wflowId', 'wflowNm', 'wflowTpCd', 'wflowBizDscd', 'wflowStsCd', 
                             'instncCnt', 'wflowDescCntnt',  'wflowBizDscd', 'lastChngGuid'],
                    id: 'CAPMT090Grid',
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
                          * workflow id
                          */
                        {
                            text: bxMsg('cbb_items.AT#wflowId'),
                            dataIndex: 'wflowId',
                            width: 200,
                            flex:1,
                            style: 'text-align:center',
                            align: 'center',
                            hidden: true
                        },
                        
                        /*
                         * workflow name
                         */
                        {
                        	text: bxMsg('cbb_items.AT#wflowNm'),
                        	dataIndex: 'wflowNm',
                        	width: 200,
                        	flex:1,
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: false
                        },
                        
                        /*
                         * workflow name
                         */
                        {
                        	text: bxMsg('cbb_items.AT#wflowTpCd'),
                        	dataIndex: 'wflowTpCd',
                        	width: 200,
                        	flex:1,
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: true
                        },
                        
                        /*
                         * wflowBizDscdNm
                         */
                       {
                           text: bxMsg('cbb_items.AT#wflowBizDscd'),
                           width: 200,
                           flex:1,
                           dataIndex: 'wflowBizDscd',
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
                         * workflow status
                         */
                        {
                        	text: bxMsg('cbb_items.AT#wflowStsCd'),
                            width: 200,
                            flex:1,
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
                         * workflow instance count
                         */
                        {
                        	text: bxMsg('cbb_items.AT#instncCnt'),
                        	dataIndex: 'instncCnt',
                        	width: 200,
                        	flex:1,
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden: true
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
                        	hidden: false
                        },
                        
                        /*
                         * workflow description
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


            /**
             *  Set Combo boxes
             */
            setComboBoxes: function () {


                var sParam = {};


                /**
                 *  Business Distinction Code
                 */
                sParam = {};
                sParam.className = "search-condition-area.CAPMT090-wflowBizDscd-wrap";
                sParam.targetId = "wflowBizDscd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "80015";
                fn_getCodeList(sParam, this);


                sParam = {};
                sParam.className = "baseAtrbt-area.CAPMT090-wflowBizDscd-wrap";
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
                 sParam.wflowBizDscd = this.$el.find('#search-condition-area [data-form-param="wflowBizDscd"]').val();
                 sParam.wflowStsCd = this.$el.find('#search-condition-area [data-form-param="workflowStsCd"]').val();
                 sParam.wflowDescCntnt = this.$el.find('#search-condition-area [data-form-param="workflowDescCntnt"]').val();

                 if (sParam == null) {
                     this.CAPMT090Grid.resetData();
                     return;
                 }
                 
                 var linkData = {
                         "header": fn_getHeader("PMT0908401"),
                         "WorkflowMgmtSvcIO": sParam


                 };
                 
                 //ajax 호출
                 bxProxy.post(sUrl, JSON.stringify(linkData), {
                     //loading 설정
                     enableLoading: true,
                     success: function (responseData) {


                         if (fn_commonChekResult(responseData)) {
                             if (responseData.WorkflowMgmtSvcIOList) {
                                 var tbList = responseData.WorkflowMgmtSvcIOList.tblNm;
                                 var totCnt = tbList.length;


                                 if (tbList != null || tbList.length > 0) {
                                     that.CAPMT090Grid.setData(tbList);
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
            	this.resetBasicAttribute();
                this.CAPMT090Grid.resetData();
                this.$el.find(".searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt'));
            },

            /*
             * Reset basic attribute
             */
            resetBasicAttribute: function () {
            	this.initFlag = true;
            	
                this.$el.find('#baseAtrbt-area  [data-form-param="wflowBizDscd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option:eq(0)').attr("selected", "selected");
                
                this.$el.find('#baseAtrbt-area  [data-form-param="workflowId"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="workflowNm"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="workflowTpCd"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="workflowDescCntnt"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="lastChngGuid"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="manageStep"]').hide();
                this.$el.find('#baseAtrbt-area  [data-form-param="manageVariable"]').hide();
                this.$el.find('#baseAtrbt-area  [data-form-param="manageRole"]').hide();

            },

            /*
             * Select a grid record
             */
            selectGridRecord: function () {
                var that = this;

                if(!this.CAPMT090Grid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPMT090Grid.grid.getSelectionModel().selected.items[0].data;

                if (!selectedRecord) {
                    return;
                }

                that.initFlag = false;

                this.$el.find('#baseAtrbt-area  [data-form-param="workflowId"]').val(selectedRecord.wflowId);
                this.$el.find('#baseAtrbt-area  [data-form-param="workflowNm"]').val(selectedRecord.wflowNm);
                this.$el.find('#baseAtrbt-area  [data-form-param="wflowBizDscd"]').val(selectedRecord.wflowBizDscd);
                this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"]').val(selectedRecord.wflowStsCd);
                this.$el.find('#baseAtrbt-area  [data-form-param="workflowDescCntnt"]').val(selectedRecord.wflowDescCntnt);
                this.$el.find('#baseAtrbt-area  [data-form-param="workflowTpCd"]').val(selectedRecord.wflowTpCd);
                this.$el.find('#baseAtrbt-area  [data-form-param="lastChngGuid"]').val(selectedRecord.lastChngGuid);
                this.$el.find('#baseAtrbt-area  [data-form-param="manageStep"]').show();
                this.$el.find('#baseAtrbt-area  [data-form-param="manageVariable"]').show();
                this.$el.find('#baseAtrbt-area  [data-form-param="manageRole"]').show();

                if(selectedRecord.wflowStsCd == 'E'){
                	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="E"]').show();
                	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="F"]').show();
                	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="C"]').hide();
                	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="T"]').hide();
                	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="D"]').hide();
                }
                else if(selectedRecord.wflowStsCd == 'F'){
                	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="E"]').show();
                	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="F"]').show();
                	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="C"]').show();
                	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="T"]').hide();
                	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="D"]').hide();           
                }
                else if(selectedRecord.wflowStsCd == 'C'){
                	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="E"]').hide();
                	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="F"]').show();
                	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="C"]').show();
                	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="T"]').hide();
                	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="D"]').hide();           
                }
	            else if(selectedRecord.wflowStsCd == 'T'){
	            	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="E"]').hide();
	            	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="F"]').show();
	            	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="C"]').hide();
	            	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="T"]').show();
	            	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="D"]').hide();           
	            }
	            else{
	            	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="E"]').hide();
	            	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="F"]').hide();
	            	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="C"]').hide();
	            	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="T"]').hide();
	            	this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"] option[value="D"]').hide();           
	            }
            
            },

            /*
             * copy select workflow 
             */
            copySelectRow: function(){
                if(!this.CAPMT090Grid.grid.getSelectionModel().selected.items[0]) return;
                var data = this.CAPMT090Grid.grid.getSelectionModel().selected.items[0].data;

                if (!data) {
                    return;
                }
                
    			var that = this;
    			that.copyParam = {};
    			that.copyParam.wflowId= data.wflowId;
    			that.copyParam.instCd= commonInfo.getInstInfo().instCd;
    			
    			var popupParam={};
    			popupParam.fromInstNm=commonInfo.getInstInfo().instNm;
    			popupParam.fromWflowNm=data.wflowNm;
    			
    			var popupWfCopy = new PopupWfCopy(popupParam);
    			popupWfCopy.render();

    			popupWfCopy.on('popUpSetData', function(data) {
    				 that.copyParam.instCd2 = data.instCd;
    				 that.copyParam.wflowNm = data.wflowNm;
    				 var linkData = {"header": fn_getHeader("PMT0908102"), "WorkflowMgmtSvcIO":  that.copyParam};
    				 // ajax호출
    				 bxProxy.post(sUrl, JSON.stringify(linkData), {
    					 enableLoading: true
    					 , success: function (responseData) {
    						 if (fn_commonChekResult(responseData)) {
    							 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
    							 that.deleteList = [];
    							 that.inquireSearchCondition();
    							 that.resetBasicAttribute();
    						 }
    					 }   // end of suucess: fucntion
    				 }); // end of bxProxy
    			});
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
//                if (!fn_headerTaskIdCheck()){
//                    return;
//                }

                function saveData() {
                    var table = [];
                    var sParam = {};

                    $(that.deleteList).each(function(idx, data) {
                        var sub = {};
                        sub.instCd = commonInfo.getInstInfo().instCd;

                        sub.wflowId = data.wflowId;
                        sub.wflowNm=data.wflowNm;
                        sub.wflowBizDscd=data.wflowBizDscd;
                        sub.wflowStsCd=data.wflowStsCd;
                        sub.wflowDescCntnt=data.wflowDescCntnt;
                        sub.wflowTpCd=data.wflowTpCd;
                        sub.lastChngGuid=data.lastChngGuid;
                        
                        table.push(sub);
                    });

                    sParam.tblNm = table;

                    var linkData = {"header": fn_getHeader("PMT0908301"), "WorkflowMgmtSvcIOList": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));

                                that.deleteList = [];
                                that.inquireSearchCondition();
                                that.resetBasicAttribute();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }

                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), saveData, this);
            },

            /*
             * save workflow
             */
            saveWorkflow: function(){
            	var that = this;
                var sParam = {};
                var srvcCd = "";
                
				//배포처리[과제식별자 체크]
//                if (!fn_headerTaskIdCheck()){
//                    return;
//                }
                
                if(this.initFlag) srvcCd = "PMT0908100";
                else srvcCd = "PMT0908200";
                
                sParam.instCd = commonInfo.getInstInfo().instCd;
                sParam.wflowId = this.$el.find('#baseAtrbt-area  [data-form-param="workflowId"]').val();
                sParam.wflowNm = this.$el.find('#baseAtrbt-area  [data-form-param="workflowNm"]').val();
                sParam.wflowTpCd = this.$el.find('#baseAtrbt-area  [data-form-param="workflowTpCd"]').val();
                sParam.wflowBizDscd = this.$el.find('#baseAtrbt-area  [data-form-param="wflowBizDscd"]').val();
                sParam.wflowStsCd = this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"]').val();
                sParam.wflowDescCntnt = this.$el.find('#baseAtrbt-area  [data-form-param="workflowDescCntnt"]').val();
                sParam.lastChngGuid = this.$el.find('#baseAtrbt-area  [data-form-param="lastChngGuid"]').val();

                
                var linkData = {"header": fn_getHeader(srvcCd), "WorkflowMgmtSvcIO": sParam};
	              
                
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
            
            manageStep: function(){

            	this.$el.trigger({
                    type: 'open-conts-page',
                    pageHandler: 'CAPMT091',
                    pageDPName: bxMsg('cbb_items.SCRN#CAPMT091'),
                    pageInitialize: true,
                    pageRenderInfo: {
                    	workflowId: this.$el.find('#baseAtrbt-area  [data-form-param="workflowId"]').val(),
		            	workflowNm: this.$el.find('#baseAtrbt-area  [data-form-param="workflowNm"]').val(),
		            	workflowTpCd: this.$el.find('#baseAtrbt-area  [data-form-param="workflowTpCd"]').val(),
		            	workflowDescCntnt: this.$el.find('#baseAtrbt-area  [data-form-param="workflowDescCntnt"]').val(),
		            	lastChngGuid: this.$el.find('#baseAtrbt-area  [data-form-param="lastChngGuid"]').val(),
		            	wflowBizDscd: this.$el.find('#baseAtrbt-area  [data-form-param="wflowBizDscd"] option:selected').text(),
		            	workflowStsCd: this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"]').val()

                    }
                });
            },
            
            manageVariable: function(){

            	this.$el.trigger({
                    type: 'open-conts-page',
                    pageHandler: 'CAPMT097',
                    pageDPName: bxMsg('cbb_items.SCRN#CAPMT097'),
                    pageInitialize: true,
                    pageRenderInfo: {
                    	workflowId: this.$el.find('#baseAtrbt-area  [data-form-param="workflowId"]').val(),
		            	workflowNm: this.$el.find('#baseAtrbt-area  [data-form-param="workflowNm"]').val(),
		            	workflowTpCd: this.$el.find('#baseAtrbt-area  [data-form-param="workflowTpCd"]').val(),
		            	workflowDescCntnt: this.$el.find('#baseAtrbt-area  [data-form-param="workflowDescCntnt"]').val(),
		            	lastChngGuid: this.$el.find('#baseAtrbt-area  [data-form-param="lastChngGuid"]').val(),
		            	wflowBizDscd: this.$el.find('#baseAtrbt-area  [data-form-param="wflowBizDscd"]').val(),
		            	workflowStsCd: this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"]').val()

                    }
                });
            },
            
            manageRole: function(){
            	
            	this.$el.trigger({
            		type: 'open-conts-page',
            		pageHandler: 'CAPMT098',
            		pageDPName: bxMsg('cbb_items.SCRN#CAPMT098'),
            		pageInitialize: true,
            		pageRenderInfo: {
            			workflowId: this.$el.find('#baseAtrbt-area  [data-form-param="workflowId"]').val(),
            			workflowNm: this.$el.find('#baseAtrbt-area  [data-form-param="workflowNm"]').val(),
            			workflowTpCd: this.$el.find('#baseAtrbt-area  [data-form-param="workflowTpCd"]').val(),
            			workflowDescCntnt: this.$el.find('#baseAtrbt-area  [data-form-param="workflowDescCntnt"]').val(),
            			lastChngGuid: this.$el.find('#baseAtrbt-area  [data-form-param="lastChngGuid"]').val(),
            			wflowBizDscd: this.$el.find('#baseAtrbt-area  [data-form-param="wflowBizDscd"]').val(),
            			workflowStsCd: this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"]').val()
            			
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

        return CAPMT090View;
    } // end of define function
); // end of define
