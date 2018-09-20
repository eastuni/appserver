define(
    [
     	'bx/common/common-info',
        'text!app/views/page/CAPAM/020/_CAPAM020.html',
        'bx-component/ext-grid/_ext-grid'
    ],
    function (
        commonInfo,
        tpl,
        ExtGrid
    ) {


        var comboStore1 = {};
        var comboStore2 = {};
        var comboStore3 = {};
        var deleteList = [];
        var initFlag = true;


        /**
         * Backbone
         */
        var CAPAM020View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPAM020-page',
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
                this.$el.find("#CAPAM020Grid").html(this.CAPAM020Grid.render({
                    'height': CaGridHeight
                }));
                this.setComboBoxes();
                this.setDatePicker();
                
                
              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPAM020-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPAM020-wrap #btn-detail-information-save')
                                    			   ]);
                return this.$el;
            },




            /*
             *  Set combo store
             */


            setComboStore: function () {
                var that = this;


                that.comboStore1 = {}; // 신용평가모형구분코드 crdtrtgMdlDscd
                that.comboStore2 = {}; // 시스템심사결과코드   sysExmntnRsltCd


                var sParam = {};

                // 신용평가모형구분코드
                sParam = {};
                sParam.cdNbr = "A1069";
                var linkData1 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };

                // 시스템심사결과코드
                sParam = {};
                sParam.cdNbr = "A0941";
                var linkData2 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };


                bxProxy.all([
  		              // 신용평가모형구분코드 콤보코드 로딩
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
  	            	  // 시스템심사결과코드 콤보로딩
  	            	  , {
                        url: sUrl,
                        param: JSON.stringify(linkData2),
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                that.comboStore2 = new Ext.data.Store({
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


                this.CAPAM020Grid = new ExtGrid({
                    //  그리드 컬럼 정의
                    fields: ['No', 'crdtrtgMdlDscd', 'crdtrtgGradeCd', 'aplyStartDt', 'aplyEndDt', 'startScore', 'endScore', 'sysExmntnRsltCd'],


                    id: 'CAPAM020Grid',
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

                            // 신용평가모형구분코드
                            {
                                text: bxMsg('cbb_items.AT#crdtrtgMdlDscd'),
                                //width: 100,
                                flex: 1,
                                dataIndex: 'crdtrtgMdlDscd',
                                style: 'text-align:center',
                                align: 'center',
                                editor: {
                                    xtype: 'combobox',
                                    store: that.comboStore1,
                                    displayField: 'cdNm',
                                    valueField: 'cd'
                                },
                                renderer: function (val) {

                                        index = that.comboStore1.findExact('cd', val);
                                        if (index != -1) {
                                            rs = that.comboStore1.getAt(index).data;
                                            return rs.cdNm;
                                        }
                                } // end of render
                            },
                            
                            // 신용평가등급코드
                            {
                                text: bxMsg('cbb_items.AT#crdtrtgGradeCd'),
                                //width: 100,
                                dataIndex: 'crdtrtgGradeCd',
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

                            // 시작점수
                            {
                                text: bxMsg('cbb_items.AT#startScore'),
                                //width: 100,
                                dataIndex: 'startScore',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1
                            },

                            // 종료점수
                            {
                                text: bxMsg('cbb_items.AT#endScore'),
                                //width: 100,
                                dataIndex: 'endScore',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1
                            },

                            // 신용평가모형구분코드
                            {
                                text: bxMsg('cbb_items.AT#sysExmntnRsltCd'),
                                //width: 100,
                                flex: 1,
                                dataIndex: 'sysExmntnRsltCd',
                                style: 'text-align:center',
                                align: 'center',
                                editor: {
                                    xtype: 'combobox',
                                    store: that.comboStore2,
                                    displayField: 'cdNm',
                                    valueField: 'cd'
                                },
                                renderer: function (val) {

                                        index = that.comboStore2.findExact('cd', val);
                                        if (index != -1) {
                                            rs = that.comboStore2.getAt(index).data;
                                            return rs.cdNm;
                                        }
                                } // end of render
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
                                            if (e.field == 'crdtrtgMdlDscd' || e.field == 'crdtrtgGradeCd' || e.field == 'aplyStartDt' || e.field == 'aplyEndDt' || e.field == 'startScore') {
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


                if(!this.CAPAM020Grid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPAM020Grid.grid.getSelectionModel().selected.items[0].data;
                that.initFlag = false;
                that.$el.find('#detail-information-area [data-form-param="crdtrtgMdlDscd"]').val(selectedRecord.crdtrtgMdlDscd);
                that.$el.find('#detail-information-area [data-form-param="crdtrtgMdlDscd"]').prop("disabled", true);

                that.$el.find('#detail-information-area [data-form-param="crdtrtgGradeCd"]').val(selectedRecord.crdtrtgGradeCd);
                that.$el.find('#detail-information-area [data-form-param="crdtrtgGradeCd"]').prop("disabled", true);
                
                that.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').val(XDate(selectedRecord.aplyStartDt).toString('yyyy-MM-dd'));
                that.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').prop("disabled", true);

                that.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').val(XDate(selectedRecord.aplyEndDt).toString('yyyy-MM-dd'));
                that.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').prop("disabled", false);

                that.$el.find('#detail-information-area [data-form-param="startScore"]').val(selectedRecord.startScore);
                that.$el.find('#detail-information-area [data-form-param="startScore"]').prop("disabled", false);

                that.$el.find('#detail-information-area [data-form-param="endScore"]').val(selectedRecord.endScore);
                that.$el.find('#detail-information-area [data-form-param="endScore"]').prop("disabled", false);

                that.$el.find('#detail-information-area [data-form-param="sysExmntnRsltCd"]').val(selectedRecord.sysExmntnRsltCd);
                that.$el.find('#detail-information-area [data-form-param="sysExmntnRsltCd"]').prop("disabled", false);
            },


            /*
             * Inquire with search conditions
             */
            inquireSearchCondition: function () {
            	this.resetDetailInformation();


                var that = this;
                var sParam = {};

                sParam.instCd       = $.sessionStorage('headerInstCd');
                // 입력 Key값이 없는 경우 전역변수에 저장된 Key값을 사용
                sParam.baseDt   = fn_getDateValue(that.$el.find('#search-condition-area [data-form-param="baseDt"]').val());
                sParam.crdtrtgMdlDscd = this.$el.find('#search-condition-area  [data-form-param="crdtrtgMdlDscd"]').val();


                var linkData = {
                    "header": fn_getHeader("CAPAM0200401"),
                    "CaCrdtrtgMgmtSvcGetCrdtrtgListIn": sParam
                };


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {

                        if (fn_commonChekResult(responseData)) {
                            if (responseData.CaCrdtrtgMgmtSvcGetCrdtrtgListOut.crdtrtgList) {
                                var tbList = responseData.CaCrdtrtgMgmtSvcGetCrdtrtgListOut.crdtrtgList;
                                var totCnt = tbList.length;


                                if (tbList != null || tbList.length > 0) {
                                    that.CAPAM020Grid.setData(tbList);
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
                 *  신용평가모형구분코드
                 */
                sParam = {};
                sParam.className = "CAPAM020-crdtrtgMdlDscd-wrap";
                sParam.targetId = "crdtrtgMdlDscd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A1069";
                fn_getCodeList(sParam, this);


                /*
                 *  시스템심사결과코드
                 */
                sParam = {};
                sParam.className = "CAPAM020-sysExmntnRsltCd-wrap";
                sParam.targetId = "sysExmntnRsltCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A0941";
                sParam.viewType = "ValNm"
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
	                var srvcCd = "CAPAM0200101";
	                
	                
	              //배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }
	                sParam.instCd       = $.sessionStorage('headerInstCd');
	                sParam.crdtrtgMdlDscd = this.$el.find('#detail-information-area [data-form-param="crdtrtgMdlDscd"]').val();
	                sParam.crdtrtgGradeCd =  this.$el.find('#detail-information-area [data-form-param="crdtrtgGradeCd"]').val();

	                sParam.aplyStartDt   = fn_getDateValue(that.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').val());
	                sParam.aplyEndDt   = fn_getDateValue(that.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').val());
	                sParam.startScore = this.$el.find('#detail-information-area [data-form-param="startScore"]').val();
	                sParam.endScore = this.$el.find('#detail-information-area [data-form-param="endScore"]').val();
	                sParam.sysExmntnRsltCd = this.$el.find('#detail-information-area [data-form-param="sysExmntnRsltCd"]').val();

	                console.log(sParam);
	                var linkData = {"header": fn_getHeader(srvcCd), "CaCrdtrtgMgmtSvcRegisterCrdtrtgIn": sParam};


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


                    $(that.deleteList).each(function(idx, data) {
                        var sub = {};
                        sub.crdtrtgMdlDscd = data.crdtrtgMdlDscd;
                        sub.crdtrtgGradeCd =  data.crdtrtgGradeCd;
                        sub.aplyStartDt = data.aplyStartDt;
                        sub.aplyEndDt = data.aplyEndDt;
                        sub.startScore = data.startScore;
                        sub.endScore = data.endScore;
                        sub.sysExmntnRsltCd = data.sysExmntnRsltCd;
                        table.push(sub);
                    });

	                sParam.instCd       = $.sessionStorage('headerInstCd');
                    sParam.crdtrtgList = table;


                    console.log(sParam);
                    var linkData = {"header": fn_getHeader("CAPAM0200501"), "CaCrdtrtgMgmtSvcDeleteCrdtrtgListIn": sParam};


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
                this.$el.find('#search-condition-area [data-form-param="crdtrtgMdlDscd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#search-condition-area [data-form-param="baseDt"]').val(getCurrentDate("yyyy-mm-dd"));
            },
            resetSearchResult: function () {
            	this.resetDetailInformation();
                this.CAPAM020Grid.resetData();
                this.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt'));
            },
            resetDetailInformation: function () {
            	this.deleteList = [];
            	this.initFlag = true;
                this.$el.find('#detail-information-area [data-form-param="crdtrtgMdlDscd"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="crdtrtgMdlDscd"]').val("");

                this.$el.find('#detail-information-area [data-form-param="crdtrtgGradeCd"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="crdtrtgGradeCd"]').val("");
                
                this.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').prop("disabled", false);
            	this.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').val(getCurrentDate("yyyy-mm-dd"));
            	
                this.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').val("9999-12-31");
            	
                this.$el.find('#detail-information-area [data-form-param="startScore"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="startScore"]').val("");
                
                this.$el.find('#detail-information-area [data-form-param="endScore"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="endScore"]').val("");
                
                this.$el.find('#detail-information-area [data-form-param="sysExmntnRsltCd"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="sysExmntnRsltCd"]').val("");
            },




            getYn: function(obj){
            	if($(obj).attr('checked'))
            		return "Y";
            	else
            		return "N";
            }


        }); // end of Backbone.View.extend({


        return CAPAM020View;
    } // end of define function
); // end of define
