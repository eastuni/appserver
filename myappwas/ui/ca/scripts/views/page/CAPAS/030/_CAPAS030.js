define(
    [
     	'bx/common/common-info',
        'text!app/views/page/CAPAS/030/_CAPAS030.html',
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
        var CAPAS030View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPAS030-page',
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
              
             // 값변경 이벤트 
                'change .CAPAS030-houseShopClCd-wrap': 'changeHouseShopClCd', //주택상가구분코드 변경 이벤트           
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
                this.$el.find("#CAPAS030Grid").html(this.CAPAS030Grid.render({
                    'height': CaGridHeight
                }));
                this.setComboBoxes();
                this.setDatePicker();
                
                
              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPAS030-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPAS030-wrap #btn-detail-information-save')
                                    			   ]);
                return this.$el;
            },




            /*
             *  Set combo store
             */


            setComboStore: function () {
                var that = this;


                that.comboStore1 = {}; // 주택상가구분코드       houseShopClCd
                that.comboStore2 = {}; // 임대차지역구분코드   leaseRegionClCd
                that.comboStore3 = {}; // 주택임대차지역구분코드   houseLeaseRegionDscd
                that.comboStore4 = {}; // 상가임대차지역구분코드   shopLeaseRegionDscd


                var sParam = {};

                // 주택상가구분코드 
                sParam = {};
                sParam.cdNbr = "A0331";
                var linkData1 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };

                // 임대차지역구분코드
                sParam = {};
                sParam.cdNbr = "A0332";
                var linkData2 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };

                // 주택임대차지역구분코드
                sParam = {};
                sParam.cdNbr = "A0336";
                var linkData3 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };

                // 상가임대차지역구분코드
                sParam = {};
                sParam.cdNbr = "A0335";
                var linkData4 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };


                bxProxy.all([
  		              // 주택상가구분코드 콤보코드 로딩
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
  	            	  // 임대차지역구분코드 콤보로딩
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
	            	  // 주택임대차지역구분코드 콤보로딩
  	              , {
                        url: sUrl,
                        param: JSON.stringify(linkData3),
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                that.comboStore3 = new Ext.data.Store({
                                    fields: ['cd', 'cdNm'],
                                    data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                });
                            }
                        }
                    }
	            	  // 상가임대차지역구분코드 콤보로딩
  	              , {
                        url: sUrl,
                        param: JSON.stringify(linkData4),
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                that.comboStore4 = new Ext.data.Store({
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


                this.CAPAS030Grid = new ExtGrid({
                    //  그리드 컬럼 정의
                    fields: ['No', 'leaseRegionClCd', 'aplyStartDt', 'aplyEndDt', 'frstPrityRpymntAmt', 'dpstLmtAmt', 'exDpstLmtAmt'],


                    id: 'CAPAS030Grid',
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
                                text: bxMsg('cbb_items.AT#leaseRegionClCd'),
                                //width: 100,
                                flex: 1,
                                dataIndex: 'leaseRegionClCd',
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

                            // 최우선변제금액
                            {
                                text: bxMsg('cbb_items.AT#frstPrityRpymntAmt'),
                                //width: 100,
                                dataIndex: 'frstPrityRpymntAmt',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1,
                                renderer: function (value, metaData, record, rowIndex) {
									return Ext.util.Format.number(value, '0,000'); }                                
                            },

                            // 보증금한도금액
                            {
                                text: bxMsg('cbb_items.AT#dpstLmtAmt'),
                                //width: 100,
                                dataIndex: 'dpstLmtAmt',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1,
                                renderer: function (value, metaData, record, rowIndex) {
									return Ext.util.Format.number(value, '0,000'); }                                
                            },

                            // 환산보증금한도금액
                            {
                                text: bxMsg('cbb_items.AT#exDpstLmtAmt'),
                                //width: 100,
                                dataIndex: 'exDpstLmtAmt',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1,
                                renderer: function (value, metaData, record, rowIndex) {
									return Ext.util.Format.number(value, '0,000'); }                                
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
                                            if (e.field == 'leaseRegionClCd' || e.field == 'aplyStartDt' || e.field == 'aplyEndDt' || e.field == 'frstPrityRpymntAmt') {
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


                if(!this.CAPAS030Grid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPAS030Grid.grid.getSelectionModel().selected.items[0].data;
                that.initFlag = false;
                that.$el.find('#detail-information-area [data-form-param="leaseRegionClCd"]').val(selectedRecord.leaseRegionClCd);
                that.$el.find('#detail-information-area [data-form-param="leaseRegionClCd"]').prop("disabled", true);

                that.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').val(XDate(selectedRecord.aplyStartDt).toString('yyyy-MM-dd'));
                that.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').prop("disabled", true);

                that.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').val(XDate(selectedRecord.aplyEndDt).toString('yyyy-MM-dd'));
                that.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').prop("disabled", false);

//                that.$el.find('#detail-information-area [data-form-param="frstPrityRpymntAmt"]').val(Ext.util.Format.number(selectedRecord.frstPrityRpymntAmt, '0,000'));
                that.$el.find('#detail-information-area [data-form-param="frstPrityRpymntAmt"]').val(selectedRecord.frstPrityRpymntAmt);
                that.$el.find('#detail-information-area [data-form-param="frstPrityRpymntAmt"]').prop("disabled", false);

                that.$el.find('#detail-information-area [data-form-param="dpstLmtAmt"]').val(selectedRecord.dpstLmtAmt);
                that.$el.find('#detail-information-area [data-form-param="dpstLmtAmt"]').prop("disabled", false);

                that.$el.find('#detail-information-area [data-form-param="exDpstLmtAmt"]').val(selectedRecord.exDpstLmtAmt);
                that.$el.find('#detail-information-area [data-form-param="exDpstLmtAmt"]').prop("disabled", false);
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
                sParam.houseShopClCd = this.$el.find('#search-condition-area  [data-form-param="houseShopClCd"]').val();


                var linkData = {
                    "header": fn_getHeader("CAPAS0300401"),
                    "CaLeasePrtctnMgmtSvcGetLeasePrtctnListIn": sParam
                };


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {

                        if (fn_commonChekResult(responseData)) {
                            if (responseData.CaLeasePrtctnMgmtSvcGetLeasePrtctnListOut.leasePrtctnList) {
                                var tbList = responseData.CaLeasePrtctnMgmtSvcGetLeasePrtctnListOut.leasePrtctnList;
                                var totCnt = tbList.length;


                                if (tbList != null || tbList.length > 0) {
                                    that.CAPAS030Grid.setData(tbList);
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
                 *  주택상가구분코드
                 */
                sParam = {};
                sParam.className = "CAPAS030-houseShopClCd-wrap";
                sParam.targetId = "houseShopClCd";
                sParam.nullYn = "N";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A0331";
                fn_getCodeList(sParam, this);


                /*
                 *  임대차지역구분코드 = 주택임대차지역구분코드
                 */
                sParam = {};
                sParam.className = "CAPAS030-leaseRegionClCd-wrap";
                sParam.targetId = "houseLeaseRegionDscd";
                sParam.nullYn = "N";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A0336";
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
	                var srvcCd = "CAPAS0300101";
	                
	                
	              //배포처리[과제식별자 체크]
	                if (!fn_headerTaskIdCheck()){
	                    return;
	                }
	                sParam.instCd       = $.sessionStorage('headerInstCd');
	                sParam.houseShopClCd = this.$el.find('#search-condition-area [data-form-param="houseShopClCd"]').val();
	                sParam.leaseRegionClCd =  this.$el.find('#detail-information-area [data-form-param="leaseRegionClCd"]').val();

	                sParam.aplyStartDt   = fn_getDateValue(that.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').val());
	                sParam.aplyEndDt   = fn_getDateValue(that.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').val());
	                sParam.frstPrityRpymntAmt = this.$el.find('#detail-information-area [data-form-param="frstPrityRpymntAmt"]').val();
	                sParam.dpstLmtAmt = this.$el.find('#detail-information-area [data-form-param="dpstLmtAmt"]').val();
	                sParam.exDpstLmtAmt = this.$el.find('#detail-information-area [data-form-param="exDpstLmtAmt"]').val();

	                console.log(sParam);
	                var linkData = {"header": fn_getHeader(srvcCd), "CaLeasePrtctnMgmtSvcRegisterLeasePrtctnIn": sParam};


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
                        sub.leaseRegionClCd = data.leaseRegionClCd;
                        sub.aplyStartDt = data.aplyStartDt;
                        sub.aplyEndDt = data.aplyEndDt;
                        sub.frstPrityRpymntAmt = data.frstPrityRpymntAmt;
                        sub.dpstLmtAmt = data.dpstLmtAmt;
                        sub.exDpstLmtAmt = data.exDpstLmtAmt;
                        table.push(sub);
                    });

	                sParam.instCd       = $.sessionStorage('headerInstCd');
	                sParam.houseShopClCd = that.$el.find('#search-condition-area [data-form-param="houseShopClCd"]').val();
	                sParam.leasePrtctnList = table;


                    console.log(sParam);
                    var linkData = {"header": fn_getHeader("CAPAS0300501"), "CaLeasePrtctnMgmtSvcRemoveLeasePrtctnIn": sParam};


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
                this.$el.find('#search-condition-area [data-form-param="houseShopClCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#search-condition-area [data-form-param="baseDt"]').val(getCurrentDate("yyyy-mm-dd"));
            },
            resetSearchResult: function () {
            	this.resetDetailInformation();
                this.CAPAS030Grid.resetData();
                this.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt'));
            },
            resetDetailInformation: function () {
            	this.deleteList = [];
            	this.initFlag = true;
                this.$el.find('#detail-information-area [data-form-param="leaseRegionClCd"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="leaseRegionClCd"]').val("");

                this.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').prop("disabled", false);
            	this.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').val(getCurrentDate("yyyy-mm-dd"));
            	
                this.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').val("9999-12-31");
            	
                this.$el.find('#detail-information-area [data-form-param="frstPrityRpymntAmt"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="frstPrityRpymntAmt"]').val("");
//                this.$el.find('#detail-information-area [data-form-param="frstPrityRpymntAmt"]').val(Ext.util.Format.number("0", '0,000'));
                
                this.$el.find('#detail-information-area [data-form-param="dpstLmtAmt"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="dpstLmtAmt"]').val("");
                
                this.$el.find('#detail-information-area [data-form-param="exDpstLmtAmt"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="exDpstLmtAmt"]').val("");
            },

            // 주택상가구분코드 값 변경시
            changeHouseShopClCd: function () {
            	
            	var houseShopClCd = this.$el.find('#search-condition-area  [data-form-param="houseShopClCd"]').val();
            	
            	if(houseShopClCd == 'H') {
            		
                    /*
                     *  임대차지역구분코드  =  주택임대차지역구분코드
                     */
                    sParam = {};
                    sParam.className = "CAPAS030-leaseRegionClCd-wrap";
                    sParam.targetId = "houseLeaseRegionDscd";
                    sParam.nullYn = "N";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                    sParam.cdNbr = "A0336";
                    sParam.viewType = "ValNm"
                    fn_getCodeList(sParam, this);
                    
            	}
            	else if(houseShopClCd == 'S') {
            	    /*
                     *  임대차지역구분코드  =  상가임대차지역구분코드
                     */
                    sParam = {};
                    sParam.className = "CAPAS030-leaseRegionClCd-wrap";
                    sParam.targetId = "shopLeaseRegionDscd";
                    sParam.nullYn = "N";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                    sParam.cdNbr = "A0335";
                    sParam.viewType = "ValNm"
                    fn_getCodeList(sParam, this);
            	}
            	
                
                // 그리드초기화 
                this.resetSearchResult();
                // 상사항목역역 초기화
                this.resetDetailInformation();
            },
            


            getYn: function(obj){
            	if($(obj).attr('checked'))
            		return "Y";
            	else
            		return "N";
            }


        }); // end of Backbone.View.extend({

        
        
        
        return CAPAS030View;
    } // end of define function
); // end of define
