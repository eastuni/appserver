define(
    [
     	'bx/common/common-info',
        'text!app/views/page/CAPMT/094/_CAPMT094.html',
        'bx-component/ext-grid/_ext-grid',
        'app/views/page/popup/CAPMT/popup-rule'
    ],
    function (
        commonInfo,
        tpl,
        ExtGrid,
        PopupRuleSearch
    ) {


        var deleteList = [];
        var initFlag = true;
        var comboStore1 = {};

        /**
         * Backbone
         */
        var CAPMT094View = Backbone.View.extend({
        	// set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPMT094-page',
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
                'click #btn-baseAtrbt-save': 'saveWorkflow',
                'click #btn-baseAtrbt-toggle': 'toggleBasicAttribute',

                /*
                 * 
                 */
                'click #CAPMT094-formTest-btn': 'validateFormula',
                'click #CAPMT094-addRule-btn': 'addRule',
            },


            /**
             * initialize
             */
            initialize: function (initData) {
                $.extend(this, initData);
                this.initData = initData;
                this.deleteList = [];
                this.initFlag = true;
                this.setComboStore();
                this.createGrid();
                self = this;
                
            },


            /**
             * Render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find("#CAPMT094Grid").html(this.CAPMT094Grid.render({
                    'height': "380px"
                }));
                this.setComboBoxes();
                //this.resetSearchCondition();
//                this.resetBasicAttribute();

              //배포처리반영[버튼비활성화]
//                fn_btnCheckForDistribution([
//                                    		this.$el.find('.CAPMT094-wrap #btn-search-result-save')
//                                    		,this.$el.find('.CAPMT094-wrap #btn-baseAtrbt-save')
//                                    			   ]);
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
            
            setComboBoxes: function () {


                var sParam = {};


                /**
                 *  Business Distinction Code
                 */
                sParam = {};
                sParam.className = "search-condition-area.CAPMT094-bizDscd-wrap";
                sParam.targetId = "wflowBizDscd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "80015";
                fn_getCodeList(sParam, this);


                sParam = {};
                sParam.className = "baseAtrbt-area.CAPMT094-bizDscd-wrap";
                sParam.targetId = "wflowBizDscd";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "80015";
                fn_getCodeList(sParam, this);

            },

            /** 
             * Create search results grid
             */
            createGrid: function () {
                var that = this;


                this.CAPMT094Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                	fields: ['rowIndex', 'ruleId', 'ruleNm', 'bizDscd', 'ruleDescCntnt', 'formulaCntnt', 'lastChngTmstmp', 'lastChngGuid'],
                    id: 'CAPMT094Grid',
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
                         
                         {text: bxMsg('cbb_items.AT#ruleId'), dataIndex: 'ruleId', style: 'text-align:center',align: 'center', hidden:true},
                         {text: bxMsg('cbb_items.AT#ruleNm'), dataIndex: 'ruleNm', width: 200, style: 'text-align:center',align: 'center'},
                         
                        {
                            text: bxMsg('cbb_items.AT#bizDscd'),
                            width: 200,
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
                        
                        
                         {text: bxMsg('cbb_items.AT#ruleDescCntnt'), flex: 1,  dataIndex: 'ruleDescCntnt', style: 'text-align:center',align: 'center'},
                         {text: bxMsg('cbb_items.AT#formulaCntnt'), flex: 1, dataIndex: 'formulaCntnt', style: 'text-align:center',align: 'center'},
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
             * inquire workflow
             */
            inquireSearchCondition : function(){
            	 var that = this;
                 var sParam = {};
                 
                 sParam.instCd = commonInfo.getInstInfo().instCd;
                 sParam.ruleId = this.$el.find('#search-condition-area [data-form-param="ruleId"]').val();
                 sParam.bizDscd = this.$el.find('#search-condition-area [data-form-param="bizDscd"]').val();
                 sParam.ruleNm = this.$el.find('#search-condition-area [data-form-param="ruleNm"]').val();
                 sParam.ruleDescCntnt = this.$el.find('#search-condition-area [data-form-param="ruleDescCntnt"]').val();
                 
                 if (sParam == null) {
                     this.CAPMT094Grid.resetData();
                     return;
                 }
                 
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
                                     that.CAPMT094Grid.setData(tbList);
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
                this.$el.find('#search-condition-area  [data-form-param="ruleId"]').val('');
                this.$el.find('#search-condition-area  [data-form-param="ruleNm"]').val('');
                this.$el.find('#search-condition-area  [data-form-param="bizDscd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#search-condition-area  [data-form-param="ruleDescCntnt"]').val('');


            },

            /*
             * Rest search area
             */
            resetSearchResult: function () {
            	this.deleteList = [];
            	this.resetBasicAttribute();
                this.CAPMT094Grid.resetData();
                this.$el.find(".searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt'));
            },
            

            /*
             * Reset basic attribute
             */
            resetBasicAttribute: function () {
            	this.initFlag = true;
            	
          
                
                this.$el.find('#baseAtrbt-area  [data-form-param="ruleId"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="ruleNm"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="bizDscd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#baseAtrbt-area  [data-form-param="ruleDescCntnt"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="formulaCntnt"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="trnsfrFormulaCntnt"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="vldtnFinYn"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="vldtnRsltMsgCntnt"]').val('');

            },



            /*
             * Select a grid record
             */
            selectGridRecord: function () {
                var that = this;


                if(!this.CAPMT094Grid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPMT094Grid.grid.getSelectionModel().selected.items[0].data;


                if (!selectedRecord) {
                    return;
                }


                that.initFlag = false;

                this.$el.find('#baseAtrbt-area  [data-form-param="trnsfrFormulaCntnt"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="vldtnFinYn"]').val('');
                this.$el.find('#baseAtrbt-area  [data-form-param="vldtnRsltMsgCntnt"]').val('');

                this.$el.find('#baseAtrbt-area  [data-form-param="ruleId"]').val(selectedRecord.ruleId);
                this.$el.find('#baseAtrbt-area  [data-form-param="ruleNm"]').val(selectedRecord.ruleNm);
                this.$el.find('#baseAtrbt-area  [data-form-param="bizDscd"]').val(selectedRecord.bizDscd);
                this.$el.find('#baseAtrbt-area  [data-form-param="ruleDescCntnt"]').val(selectedRecord.ruleDescCntnt);
                this.$el.find('#baseAtrbt-area  [data-form-param="formulaCntnt"]').val(selectedRecord.formulaCntnt);


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
                        sub.ruleId = data.ruleId;

                        
                        table.push(sub);
                    });


                    sParam.tblNm = table;




                    var linkData = {"header": fn_getHeader("PMT0928301"), "WorkflowRuleMgmtSvcIOList": sParam};


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
            saveWorkflow: function(){
            	var that = this;
                var sParam = {};
                var srvcCd = "";
                
				//배포처리[과제식별자 체크]
//                if (!fn_headerTaskIdCheck()){
//                    return;
//                }
                
                if(this.initFlag) srvcCd = "PMT0928100";
                else srvcCd = "PMT0928200";
                
                sParam.instCd = commonInfo.getInstInfo().instCd;
                sParam.ruleId = this.$el.find('#baseAtrbt-area  [data-form-param="ruleId"]').val();
                sParam.ruleNm = this.$el.find('#baseAtrbt-area  [data-form-param="ruleNm"]').val();
                sParam.bizDscd = this.$el.find('#baseAtrbt-area  [data-form-param="bizDscd"]').val();
                sParam.ruleDescCntnt = this.$el.find('#baseAtrbt-area  [data-form-param="ruleDescCntnt"]').val();
                sParam.formulaCntnt = this.$el.find('#baseAtrbt-area  [data-form-param="formulaCntnt"]').val();
                sParam.vldtnFinYn = this.$el.find('#baseAtrbt-area  [data-form-param="vldtnFinYn"]').val();
                
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
            
            validateFormula: function(){
            	
            	var that = this;
                var sParam = {};
                
                
                sParam.instCd = commonInfo.getInstInfo().instCd;
                sParam.formulaCntnt = that.$el.find('#baseAtrbt-area  [data-form-param="formulaCntnt"]').val();

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
                                that.$el.find('#baseAtrbt-area  [data-form-param="trnsfrFormulaCntnt"]').val(data.trnsfrFormulaCntnt);
                                that.$el.find('#baseAtrbt-area  [data-form-param="vldtnFinYn"]').val(data.vldtnFinYn);
                                that.$el.find('#baseAtrbt-area  [data-form-param="vldtnRsltMsgCntnt"]').val(data.vldtnRsltMsgCntnt);
                            }
                        }
                        
                        
                    }
                });
                
            },
            
            addRule : function(){
				var that = this;
				var sParam = {};
				
				
				var popupRuleSearch = new PopupRuleSearch(sParam);
				
				
				popupRuleSearch.render();
				popupRuleSearch.on('popUpSetData', function (data) {
					var tmp = self.$el.find('#baseAtrbt-area [data-form-param="formulaCntnt"]').val();
					self.$el.find('#baseAtrbt-area [data-form-param="formulaCntnt"]').val(tmp + " #RL."+data.ruleId);	
					
				});
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


        return CAPMT094View;
    } // end of define function
); // end of define
