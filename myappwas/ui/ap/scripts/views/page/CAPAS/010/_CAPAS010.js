define(
    [
     	'bx/common/common-info',
        'text!app/views/page/CAPAS/010/_CAPAS010.html',
        'bx-component/ext-grid/_ext-grid'
    ],
    function (
        commonInfo,
        tpl,
        ExtGrid
    ) {


        var comboStore1 = {};  // 담보유형
     
        var deleteList = [];
        var initFlag = true;


        /**
         * Backbone
         */
        var CAPAS010View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPAS010-page',
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
                 * detail-information-area
                 */
                'click #btn-detail-information-reset': 'resetDetailInformation',
                'click #btn-detail-information-save': 'saveDetailInformation',
                'click #btn-detail-information-toggle': 'toggleDetailInformation',
                
            },


            /**
             * initialize
             */
            initialize: function (initData) {
                $.extend(this, initData);


                this.initData = initData;
                this.setComboStore();
                this.deleteList = [];
                this.initFlag = true;
                this.createGrid();


            },


            /**
             * Render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find("#CAPAS010Grid").html(this.CAPAS010Grid.render({
                    'height': CaGridHeight
                }));
                this.setComboBoxes();
                this.setDatePicker();
                
                
              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPAS010-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPAS010-wrap #btn-detail-information-save')
                                    			   ]);
                return this.$el;
            },




            /*
             *  Set combo store
             */


            setComboStore: function () {
                var that = this;


                that.comboStore1 = {}; // 담보유형
          
                var sParam = {};
               

                // 지역분류유형코드
                sParam = {};
                sParam.cdNbr = "A0349";
                var linkData1 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };

           
                bxProxy.all([
  		              // 담보유형
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
  	            
  	          ], {
                    success: function () {}
                });


            },


            /** 
             * Create search results grid
             */
            createGrid: function () {
                var that = this;


                this.CAPAS010Grid = new ExtGrid({
                    //  그리드 컬럼 정의
                    fields: ['No', 'assetKndCd', 'assetKndNm', 'aplyStartDt', 'aplyEndDt', 'assetDstrbtPrity'],


                    id: 'CAPAS010Grid',
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

                            // 담보종류코드
                            {
                                text: bxMsg('cbb_items.AT#assetKndCd'),
                                //width: 100,
                                flex: 1,
                                dataIndex: 'assetKndCd',
                                style: 'text-align:center',
                                align: 'center',
                            },
                            
                            // 담보종류명
                            {
                                text: bxMsg('cbb_items.AT#assetKndNm'),
                                //width: 100,
                                dataIndex: 'assetKndNm',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1
                            }, // end of 신용평가등급코드

                            // 적용시작년월일 
                            {
                                text: bxMsg('cbb_items.AT#aplyStartDt'),
                                //width: 100,
                                dataIndex: 'aplyStartDt',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1,
                             	renderer : function(val,metaData, record) {
      		                		return XDate(val).toString('yyyy-MM-dd');
                      	        }
                            },

                            // 적용종료년월일 
                            {
                                text: bxMsg('cbb_items.AT#aplyEndDt'),
                                //width: 100,
                                dataIndex: 'aplyEndDt',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1,
                             	renderer : function(val,metaData, record) {
      		                		return XDate(val).toString('yyyy-MM-dd');
                      	        }
                            },

                            // 담보배분순위
                            {
                                text: bxMsg('cbb_items.AT#assetDstrbtPrity'),
                                //width: 100,
                                dataIndex: 'assetDstrbtPrity',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1
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
                                            if (e.field == 'assetKndCd' || e.field == 'assetKndNm' || e.field == 'aplyStartDt' || e.field == 'aplyEndDt' || e.field == 'assetDstrbtPrity') {
                                                return false;
                                            }
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
                                that.selectRecord();
                            }
                        }
                    }
                });
            },


            /*
             * select record
             */
            selectRecord: function () {
                var that = this;


                if(!this.CAPAS010Grid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPAS010Grid.grid.getSelectionModel().selected.items[0].data;
                that.initFlag = false;
                that.$el.find('#detail-information-area [data-form-param="assetKndCd"]').val(selectedRecord.assetKndCd);
                that.$el.find('#detail-information-area [data-form-param="assetKndCd"]').prop("disabled", true);

                that.$el.find('#detail-information-area [data-form-param="assetKndNm"]').val(selectedRecord.assetKndNm);
                that.$el.find('#detail-information-area [data-form-param="assetKndNm"]').prop("disabled", true);
                
                that.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').val(XDate(selectedRecord.aplyStartDt).toString('yyyy-MM-dd'));
                that.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').prop("disabled", true);

                that.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').val(XDate(selectedRecord.aplyEndDt).toString('yyyy-MM-dd'));
                that.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').prop("disabled", false);

                that.$el.find('#detail-information-area [data-form-param="assetDstrbtPrity"]').val(selectedRecord.assetDstrbtPrity);
                that.$el.find('#detail-information-area [data-form-param="assetDstrbtPrity"]').prop("disabled", false);

            },


            /*
             * Inquire with search conditions
             */
            inquireSearchCondition: function () {
            	this.resetDetailInformation();


                var that = this;
                var sParam = {};


                sParam.instCd = $.sessionStorage('headerInstCd');
                sParam.baseDt = fn_getDateValue(this.$el.find('#search-condition-area  [data-form-param="baseDt"]').val());
                sParam.assetTpCd = this.$el.find('#search-condition-area  [data-form-param="assetTpCd"]').val();


                var linkData = {
                    "header": fn_getHeader("CAPAS0100401"),
                    "CaAssetKndMgmtSvcGetListAssetIn": sParam
                };


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {

                        if (fn_commonChekResult(responseData)) {
                            if (responseData.CaAssetKndMgmtSvcGetListAssetOut.assetKndList) {
                                var tbList = responseData.CaAssetKndMgmtSvcGetListAssetOut.assetKndList;
                                var totCnt = tbList.length;


                                if (tbList != null || tbList.length > 0) {
                                    that.CAPAS010Grid.setData(tbList);
                                    that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt') + " (" + fn_setComma(totCnt) + " " + bxMsg('cbb_items.SCRNITM#cnt') + ")");
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
                 *  자산유형
                 */
                sParam = {};
                sParam.className = "CAPAS010-assetTpCd-wrap";
                sParam.targetId = "assetKndCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A0349";
                fn_getCodeList(sParam, this);

            },

            
            /**
             * 달력생성
             */
            setDatePicker: function () {
                fn_makeDatePicker(this.$el.find('#detail-information-area [data-form-param="aplyStartDt"]'));
                fn_makeDatePicker(this.$el.find('#detail-information-area [data-form-param="aplyEndDt"]'));
                fn_makeDatePicker(this.$el.find('#search-condition-area [data-form-param="baseDt"]'));
            },


            /*
             *  Add new amount type
             */
            saveDetailInformation: function(){


            		var that = this;
	                var sParam = {};
	                // 변경 
	                var srvcCd = "CAPAS0100101";
	                
	                
	              //배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }
	                var assetKnd = sParam.assetKndCd = this.$el.find('#detail-information-area [data-form-param="assetKndCd"]').val();
	                var assetTp = this.$el.find('#search-condition-area  [data-form-param="assetTpCd"]').val();
	                var sub = assetKnd.substring(0,2);
	                
	                if(sub!=assetTp){
	                	// 자산종류와 자산유형이 불일치합니다. 입력값을 확인하십시오.
	                	fn_alertMessage("",bxMsg("cbb_err_msg.AUIASE0008"));
	                	return;
	                }
	                sParam.assetTpCd = this.$el.find('#search-condition-area  [data-form-param="assetTpCd"]').val();
	                sParam.instCd = $.sessionStorage('headerInstCd');
	                sParam.assetKndCd = this.$el.find('#detail-information-area [data-form-param="assetKndCd"]').val();
	                sParam.assetKndNm =  this.$el.find('#detail-information-area [data-form-param="assetKndNm"]').val();
	                sParam.aplyStartDt = fn_getDateValue(this.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').val());
	                sParam.aplyEndDt = fn_getDateValue(this.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').val());
	                sParam.assetDstrbtPrity = this.$el.find('#detail-information-area [data-form-param="assetDstrbtPrity"]').val();

	                console.log(sParam);
	                var linkData = {"header": fn_getHeader(srvcCd), "CaAssetKndMgmtSvcRegisterAssetKndIn": sParam};


	                // ajax호출
	                bxProxy.post(sUrl, JSON.stringify(linkData), {
	                    enableLoading: true
	                    , success: function (responseData) {
	                        if (fn_commonChekResult(responseData)) {
	                            fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


	                            that.resetDetailInformation();
	                            that.inquireSearchCondition();


	                        }
	                    }   // end of suucess: fucntion
	                }); // end of bxProxy
            	// fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-insert-msg'), saveData, this);
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
                if (!fn_headerTaskIdCheck()){
                    return;
                }

                function saveData() {
                    var table = [];
                    var sParam = {};
                    sParam.instCd = $.sessionStorage('headerInstCd');


                    $(that.deleteList).each(function(idx, data) {
                        var sub = {};
                        sub.assetKndCd = data.assetKndCd;
                        table.push(sub);
                    });


                    sParam.assetKndList = table;


                    console.log(sParam);
                    var linkData = {"header": fn_getHeader("CAPAS0100501"), "CaAssetKndMgmtSvcDeleteAssetKndIn": sParam};


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
             * Toggle 
             */
            toggleSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find('#search-condition-area'), this.$el.find("#btn-search-condition-toggle"));
            },
            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find("#btn-search-result-toggle"));
            },
            toggleDetailInformation: function () {
                fn_pageLayerCtrl(this.$el.find('#detail-information-area'), this.$el.find("#btn-detail-information-toggle"));
            },


            /*
             * Reset
             */
            resetSearchCondition: function () {
            	this.deleteList = [];
                this.$el.find('#search-condition-area [data-form-param="assetTpCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#search-condition-area [data-form-param="baseDt"]').val(getCurrentDate("yyyy-mm-dd"));
            },
            resetSearchResult: function () {
            	this.resetDetailInformation();
                this.CAPAS010Grid.resetData();
                this.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt'));
            },
            resetDetailInformation: function () {
            	this.deleteList = [];
            	this.initFlag = true;
                this.$el.find('#detail-information-area [data-form-param="assetKndCd"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="assetKndCd"]').val("");

                this.$el.find('#detail-information-area [data-form-param="assetKndNm"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="assetKndNm"]').val("");
                
                this.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').prop("disabled", false);
            	this.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').val(getCurrentDate("yyyy-mm-dd"));
            	
                this.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').val("9999-12-31");
                
                this.$el.find('#detail-information-area [data-form-param="assetDstrbtPrity"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="assetDstrbtPrity"]').val("");
            },




            getYn: function(obj){
            	if($(obj).attr('checked'))
            		return "Y";
            	else
            		return "N";
            }


        }); // end of Backbone.View.extend({


        return CAPAS010View;
    } // end of define function
); // end of define
