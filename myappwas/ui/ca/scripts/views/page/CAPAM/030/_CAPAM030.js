define(
    [
     	'bx/common/common-info',
        'text!app/views/page/CAPAM/030/_CAPAM030.html',
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
        var initFlag = true;


        /**
         * Backbone
         */
        var CAPAM030View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPAM030-page',
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
                'click #btn-search-result-move-up': 'moveUpSearchResult',
                'click #btn-search-result-move-down': 'moveDownSearchResult',
                'click #btn-search-result-toggle': 'toggleSearchResult',


                /*
                 * detail-information-area
                 */
                'click #btn-detail-information-reset': 'resetDetailInformation',
                'click #btn-detail-information-add': 'addDetailInformation',
                'click #btn-detail-information-toggle': 'toggleDetailInformation',
                
                /*
                 * check formula
                 */
                'click #CAPAM030-check-btn': 'checkFormula',

                // 값변경 이벤트 
                'change .CAPAM030-asmCmplncClCd-wrap': 'changeAsmCmplncClCd', //심사규제분류코드 변경 이벤트           
                'change .CAPAM030-cmplncItmCd-wrap': 'changeCmplncItmCd',      //규제항목코드 변경 이벤트           
                'change .CAPAM030-ruleCntnt': 'changeRuleCntnt',      //규제내용 변경 이벤트           
            },


            /**
             * initialize
             */
            initialize: function (initData) {
                $.extend(this, initData);


                this.initData = initData;
                this.setComboStore();
                this.initFlag = true;
                this.createGrid();


            },


            /**
             * Render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find("#CAPAM030Grid").html(this.CAPAM030Grid.render({
                    'height': CaGridHeight
                }));
                this.setComboBoxes();
                this.setDatePicker();
                
                
              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPAM030-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPAM030-wrap #btn-detail-information-add')
                                    			   ]);
                return this.$el;
            },




            /*
             *  Set combo store
             */


            setComboStore: function () {
                var that = this;


                that.comboStore1 = {}; // 심사규제분류코드        asmCmplncClCd        A1072
                that.comboStore2 = {}; // 규제비율항목코드         cmplncRatioItmCd     A0942
                that.comboStore3 = {}; // 신용평점우대항목코드   crdtScorePrfItmCd    A1073


                var sParam = {};

                // 심사규제분류코드
                sParam = {};
                sParam.cdNbr = "A1072";
                var linkData1 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };

                // 규제비율항목코드
                sParam = {};
                sParam.cdNbr = "A0942";
                var linkData2 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };
                
                // 신용평점우대항목코드
                sParam = {};
                sParam.cdNbr = "A1073";
                var linkData3 = {
                    "header": fn_getHeader("CAPCM0038400"),
                    "CaCmnCdSvcGetCdListByCdNbrIn": sParam
                };


                bxProxy.all([
  		              // 심사규제분류코드 콤보코드 로딩
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
	            	  // 규제비율항목코드 콤보로딩
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
            	  // 신용평점우대항목코드 콤보로딩
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
  	          ], {
                    success: function () {}
                });


            },


            /** 
             * Create search results grid
             */
            createGrid: function () {
                var that = this;


                this.CAPAM030Grid = new ExtGrid({
                    //  그리드 컬럼 정의
                    fields: ['No', 'cmplncSctnSeqNbr', 'aplyStartDt', 'aplyEndDt', 'bsicVal', 'maxVal', 'bsicRt', 'maxRt', 'ruleCntnt'],


                    id: 'CAPAM030Grid',
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

                            // 규제구간일련번호
                            {
                                text: bxMsg('cbb_items.AT#cmplncSctnSeqNbr'),
                                //width: 100,
                                dataIndex: 'cmplncSctnSeqNbr',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1
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

                            // 기본값
                            {
                                text: bxMsg('cbb_items.AT#bsicVal'),
                                //width: 100,
                                dataIndex: 'bsicVal',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1,
								renderer: function (value, metaData, record, rowIndex) {
									return Ext.util.Format.number(value, '0,000'); }
                            },

                            // 최대값
                            {
                                text: bxMsg('cbb_items.AT#maxVal'),
                                //width: 100,
                                dataIndex: 'maxVal',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1,
								renderer: function (value, metaData, record, rowIndex) {
									return Ext.util.Format.number(value, '0,000'); }
                            },

                            // 기본율
                            {
                                text: bxMsg('cbb_items.AT#bsicRt'),
                                //width: 100,
                                dataIndex: 'bsicRt',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1,
								renderer: function (value, metaData, record, rowIndex) {
									return Ext.util.Format.number(value, '0.000'); }
                                
                            },

                            // 최대율
                            {
                                text: bxMsg('cbb_items.AT#maxRt'),
                                //width: 100,
                                dataIndex: 'maxRt',
                                style: 'text-align:center',
                                align: 'center',
                                flex: 1,
								renderer: function (value, metaData, record, rowIndex) {
									return Ext.util.Format.number(value, '0.000'); }
                            },
                            
                            // 규칙내용
                            {
                                text: bxMsg('cbb_items.AT#ruleCntnt'),
                                //width: 100,
                                dataIndex: 'ruleCntnt',
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
                                            if (e.field == 'cmplncSctnSeqNbr' || e.field == 'aplyStartDt' || e.field == 'aplyEndDt' || e.field == 'bsicVal' || e.field == 'maxVal' || e.field == 'bsicRt' || e.field == 'maxRt' || e.field == 'ruleCntnt') {
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


                if(!this.CAPAM030Grid.grid.getSelectionModel().selected.items[0]) return;
                var selectedRecord = this.CAPAM030Grid.grid.getSelectionModel().selected.items[0].data;
                that.initFlag = false;
                that.$el.find('#detail-information-area [data-form-param="cmplncSctnSeqNbr"]').val(selectedRecord.cmplncSctnSeqNbr);
                that.$el.find('#detail-information-area [data-form-param="cmplncSctnSeqNbr"]').prop("disabled", true);

                that.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').val(XDate(selectedRecord.aplyStartDt).toString('yyyy-MM-dd'));
                that.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').prop("disabled", true);

                that.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').val(XDate(selectedRecord.aplyEndDt).toString('yyyy-MM-dd'));
                that.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').prop("disabled", true);

                that.$el.find('#detail-information-area [data-form-param="bsicVal"]').val(selectedRecord.bsicVal);
                that.$el.find('#detail-information-area [data-form-param="bsicVal"]').prop("disabled", false);

                that.$el.find('#detail-information-area [data-form-param="maxVal"]').val(selectedRecord.maxVal);
                that.$el.find('#detail-information-area [data-form-param="maxVal"]').prop("disabled", false);

                that.$el.find('#detail-information-area [data-form-param="bsicRt"]').val(selectedRecord.bsicRt);
                that.$el.find('#detail-information-area [data-form-param="bsicRt"]').prop("disabled", false);

                that.$el.find('#detail-information-area [data-form-param="maxRt"]').val(selectedRecord.maxRt);
                that.$el.find('#detail-information-area [data-form-param="maxRt"]').prop("disabled", false);

                that.$el.find('#detail-information-area [data-form-param="ruleCntnt"]').val(selectedRecord.ruleCntnt);
                that.$el.find('#detail-information-area [data-form-param="ruleCntnt"]').prop("disabled", false);

                that.$el.find('#detail-information-area [data-form-param="trnsfrFormulaCntnt"]').val("");
                that.$el.find('#detail-information-area [data-form-param="trnsfrFormulaCntnt"]').prop("disabled", true);

                that.$el.find('#detail-information-area [data-form-param="vldtnFinYn"]').val("");
                that.$el.find('#detail-information-area [data-form-param="vldtnFinYn"]').prop("disabled", true);

                that.$el.find('#detail-information-area [data-form-param="vldtnRsltMsgCntnt"]').val("");
                that.$el.find('#detail-information-area [data-form-param="vldtnRsltMsgCntnt"]').prop("disabled", true);
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
                sParam.asmCmplncClCd = this.$el.find('#search-condition-area  [data-form-param="asmCmplncClCd"]').val();
                sParam.cmplncItmCd = this.$el.find('#search-condition-area  [data-form-param="cmplncItmCd"]').val();


                var linkData = {
                    "header": fn_getHeader("CAPAM0300401"),
                    "CaAsmCmplncMgmtSvcGetCmplncListIn": sParam
                };


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {

                        if (fn_commonChekResult(responseData)) {
                            if (responseData.CaAsmCmplncMgmtSvcGetCmplncListOut.cmplncList) {
                                var tbList = responseData.CaAsmCmplncMgmtSvcGetCmplncListOut.cmplncList;
                                var totCnt = tbList.length;


                                if (tbList != null || tbList.length > 0) {
                                    that.CAPAM030Grid.setData(tbList);
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
                sParam.className = "CAPAM030-asmCmplncClCd-wrap";
                sParam.targetId = "asmCmplncClCd";
                sParam.nullYn = "N";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A1072";
                fn_getCodeList(sParam, this);


                /*
                 *  규제항목코드  = 규제비율항목코드
                 */
                sParam = {};
                sParam.className = "CAPAM030-cmplncItmCd-wrap";
                sParam.targetId = "cmplncRatioItmCd";
                sParam.nullYn = "N";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A0942";
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
             *  Add Compliance 
             */
            addDetailInformation: function(){

           		var that = this;
           		
           	//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
        		

           		var vldtnFinYn = this.$el.find('#detail-information-area  [data-form-param="vldtnFinYn"]').val();
           		console.log('vldtnFinYn = '+vldtnFinYn);
           		
           		if (vldtnFinYn != "Y") {
           			
           			console.log('fn_alertMessage');
                  	fn_alertMessage("", bxMsg('cbb_err_msg.AUILNE0029'));
                    return;
           		}
           		
           		sParam = {};
           		sParam.cmplncSctnSeqNbr = this.$el.find('#detail-information-area  [data-form-param="cmplncSctnSeqNbr"]').val();
           		
           		// console.log('cmplncSctnSeqNbr = '+sParam.cmplncSctnSeqNbr);
           		
           		sParam.aplyStartDt = fn_getDateValue(that.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').val());
           		sParam.aplyEndDt = fn_getDateValue(that.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').val());
           		sParam.bsicVal = this.$el.find('#detail-information-area  [data-form-param="bsicVal"]').val();
           		sParam.maxVal = this.$el.find('#detail-information-area  [data-form-param="maxVal"]').val();
           		sParam.bsicRt = this.$el.find('#detail-information-area  [data-form-param="bsicRt"]').val();
           		sParam.maxRt = this.$el.find('#detail-information-area  [data-form-param="maxRt"]').val();
           		sParam.ruleCntnt = this.$el.find('#detail-information-area  [data-form-param="ruleCntnt"]').val();
           		
           		//그리드의  구간일련번호가 같은 것이면  값 변경 셋팅 
				for (var i = 0; i < that.CAPAM030Grid.store.getRange().length; i++){

					 if(that.CAPAM030Grid.store.getAt(i).data.cmplncSctnSeqNbr == sParam.cmplncSctnSeqNbr){
						 
						console.log('cmplncSctnSeqNbr equal = '+that.CAPAM030Grid.store.getAt(i).data.cmplncSctnSeqNbr);
						 
             		    that.CAPAM030Grid.store.getAt(i).set('aplyStartDt',sParam.aplyStartDt );
             		    that.CAPAM030Grid.store.getAt(i).set('aplyEndDt',sParam.aplyEndDt );
             		    that.CAPAM030Grid.store.getAt(i).set('bsicVal',sParam.bsicVal );
             		    that.CAPAM030Grid.store.getAt(i).set('maxVal',sParam.maxVal );
             		    that.CAPAM030Grid.store.getAt(i).set('bsicRt',sParam.bsicRt );
             		    that.CAPAM030Grid.store.getAt(i).set('maxRt',sParam.maxRt );
             		    that.CAPAM030Grid.store.getAt(i).set('ruleCntnt',sParam.ruleCntnt );

             			return;
             		}
				 }           		
           
           		this.CAPAM030Grid.addData(sParam);
            },


            /*
             * Confirm delete item
             */
            saveSearchResult: function(){
            	var that = this;


            	//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }

                function saveData() {
                    var table = [];
                    var sParam = {};

                    $(that.CAPAM030Grid.store.data.items).each(function(idx, data) {
                        var sub = {};
                        var data2 = data.data;
                        sub.cmplncSctnSeqNbr = data2.cmplncSctnSeqNbr;
                        sub.aplyStartDt =  data2.aplyStartDt;
                        sub.aplyEndDt = data2.aplyEndDt;
                        sub.bsicVal = data2.bsicVal;
                        sub.maxVal = data2.maxVal;
                        sub.bsicRt = data2.bsicRt;
                        sub.maxRt = data2.maxRt;
                        sub.ruleCntnt = data2.ruleCntnt;
                        table.push(sub);
                    });
                    
	                sParam.instCd       = $.sessionStorage('headerInstCd');
	                sParam.baseDt   = fn_getDateValue(that.$el.find('#search-condition-area [data-form-param="baseDt"]').val());
	                sParam.asmCmplncClCd = that.$el.find('#search-condition-area  [data-form-param="asmCmplncClCd"]').val();
	                sParam.cmplncItmCd = that.$el.find('#search-condition-area  [data-form-param="cmplncItmCd"]').val();
                    sParam.cmplncList = table;


                    console.log(sParam);
                    var linkData = {"header": fn_getHeader("CAPAM0300101"), "CaAsmCmplncMgmtSvcRegisterCmplncIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));

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
                this.$el.find('#search-condition-area [data-form-param="crdtrtgMdlDscd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#search-condition-area [data-form-param="baseDt"]').val(getCurrentDate("yyyy-mm-dd"));
            },
            resetSearchResult: function () {
            	this.resetDetailInformation();
                this.CAPAM030Grid.resetData();
                this.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt'));
            },
            resetDetailInformation: function () {
            	this.initFlag = true;
                this.$el.find('#detail-information-area [data-form-param="cmplncSctnSeqNbr"]').prop("disabled", true);
                this.$el.find('#detail-information-area [data-form-param="cmplncSctnSeqNbr"]').val("");

                this.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').prop("disabled", false);
            	this.$el.find('#detail-information-area [data-form-param="aplyStartDt"]').val(getCurrentDate("yyyy-mm-dd"));
            	
                this.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="aplyEndDt"]').val("9999-12-31");
            	
                this.$el.find('#detail-information-area [data-form-param="bsicVal"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="bsicVal"]').val("");
                
                this.$el.find('#detail-information-area [data-form-param="maxVal"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="maxVal"]').val("");
                
                this.$el.find('#detail-information-area [data-form-param="bsicRt"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="bsicRt"]').val("");
                
                this.$el.find('#detail-information-area [data-form-param="maxRt"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="maxRt"]').val("");
                
                this.$el.find('#detail-information-area [data-form-param="ruleCntnt"]').prop("disabled", false);
                this.$el.find('#detail-information-area [data-form-param="ruleCntnt"]').val("");

                this.$el.find('#detail-information-area [data-form-param="trnsfrFormulaCntnt"]').val("");
                this.$el.find('#detail-information-area [data-form-param="trnsfrFormulaCntnt"]').prop("disabled", true);

                this.$el.find('#detail-information-area [data-form-param="vldtnFinYn"]').val("");
                this.$el.find('#detail-information-area [data-form-param="vldtnFinYn"]').prop("disabled", true);

                this.$el.find('#detail-information-area [data-form-param="vldtnRsltMsgCntnt"]').val("");
                this.$el.find('#detail-information-area [data-form-param="vldtnRsltMsgCntnt"]').prop("disabled", true);

            },

            moveUpSearchResult: function (that) {
                this.moveSelectedRow(-1);
            },
              
            moveDownSearchResult: function (that) {
                this.moveSelectedRow(1);
            },

            moveSelectedRow: function(distance) {	
            	
                console.log('moveSelectedRow');
              	
            	  //var selectedRow = this.selectedRow;
            	  var selectedRow = this.CAPAM030Grid.grid.getSelectionModel().selected.items[0];
            	
            	  console.log(selectedRow);
            	  if(!selectedRow){
            		  return;
            	  }
                  var lastIndex = this.CAPAM030Grid.store.count() - 1,
    	              oldIndex = this.CAPAM030Grid.store.indexOf(selectedRow),
    	              newIndex = oldIndex + distance;


    	          newIndex = (newIndex < 0)? 0 : newIndex;
    	          newIndex = (newIndex > lastIndex)? lastIndex : newIndex;


    	          if(selectedRow.length === 0) { return; }


    	          this.CAPAM030Grid.store.remove(selectedRow);
    	          this.CAPAM030Grid.store.insert(newIndex, selectedRow);
    	          this.CAPAM030Grid.grid.getSelectionModel().select(newIndex);


    	          if(distance < 0){
    	          	for(var i = newIndex + 1 ; i <= oldIndex ; i++ ){
    	          		var tempRow = this.CAPAM030Grid.store.data.items[i];
    	          		this.CAPAM030Grid.store.remove(tempRow);
    	          		this.CAPAM030Grid.store.insert(i, tempRow);
    	          	}
    	          } else {
    	          	for(var i = oldIndex ; i <= newIndex - 1 ; i++ ){
    	          		var tempRow = this.CAPAM030Grid.store.data.items[i];
    	          		this.CAPAM030Grid.store.remove(tempRow);
    	          		this.CAPAM030Grid.store.insert(i, tempRow);
    	          	}
    	          }
            },    

            
            // 심사규제분류코드 값 변경시
            changeAsmCmplncClCd: function () {
            	
            	var asmCmplncClCd = this.$el.find('#search-condition-area  [data-form-param="asmCmplncClCd"]').val();
            	
            	if(asmCmplncClCd == 'A0942') {
            		
                    /*
                     *  규제항목코드  = 규제비율항목코드
                     */
                    sParam = {};
                    sParam.className = "CAPAM030-cmplncItmCd-wrap";
                    sParam.targetId = "cmplncRatioItmCd";
                    sParam.nullYn = "N";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                    sParam.cdNbr = "A0942";
                    sParam.viewType = "ValNm"
                    fn_getCodeList(sParam, this);
                    
            	}
            	else if(asmCmplncClCd == 'A1073') {
            	    /*
                     *  규제항목코드  = 신용평점우대항목코드
                     */
                    sParam = {};
                    sParam.className = "CAPAM030-cmplncItmCd-wrap";
                    sParam.targetId = "crdtScorePrfItmCd";
                    sParam.nullYn = "N";
                    sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                    sParam.cdNbr = "A1073";
                    sParam.viewType = "ValNm"
                    fn_getCodeList(sParam, this);
            	}
            	
          
                
                // 그리드초기화 
                this.resetSearchResult();
                // 상사항목역역 초기화
                this.resetDetailInformation();
            },
            
            // 규제항목코드변경시 
            changeCmplncItmCd: function () {
            	
            	console.log('changeCmplncItmCd change');
            	
                // 그리드초기화 
            	this.resetSearchResult();
                // 상사항목역역 초기화
            	this.resetDetailInformation();
            },
            
            
            // 심사규제규칙 검증 
            checkFormula: function () {


                var that = this;
                var sParam = {};

                sParam.instCd       = $.sessionStorage('headerInstCd');
                // 입력 Key값이 없는 경우 전역변수에 저장된 Key값을 사용
                sParam.ruleCntnt = that.$el.find('#detail-information-area  [data-form-param="ruleCntnt"]').val();

                var linkData = {
                    "header": fn_getHeader("CAPAM0300402"),
                    "CaAsmCmplncMgmtSvcCheckFormulaIn": sParam
                };


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {

                        if (fn_commonChekResult(responseData)) {
                        	
                            if (responseData.CaAsmCmplncMgmtSvcCheckFormulaOut) {
                            	
                            	var data = responseData.CaAsmCmplncMgmtSvcCheckFormulaOut;
                            	that.$el.find('#detail-information-area [data-form-param="vldtnRsltMsgCntnt"]').val(data.vldtnRsltMsgCntnt);
                            	that.$el.find('#detail-information-area [data-form-param="vldtnFinYn"]').val(data.vldtnFinYn);
                            	that.$el.find('#detail-information-area [data-form-param="trnsfrFormulaCntnt"]').val(data.trnsfrFormulaCntnt);
                            }
                        }
                    }
                });
                
            },
            
            
            changeRuleCntnt: function () {
            	var that = this;
            	
            	console.log('changeRuleCntnt');
            	
            	that.$el.find('#detail-information-area [data-form-param="vldtnRsltMsgCntnt"]').val("");
            	that.$el.find('#detail-information-area [data-form-param="vldtnFinYn"]').val("");
            	that.$el.find('#detail-information-area [data-form-param="trnsfrFormulaCntnt"]').val("");
            }, 

            getYn: function(obj){
            	if($(obj).attr('checked'))
            		return "Y";
            	else
            		return "N";
            }


        }); // end of Backbone.View.extend({


        return CAPAM030View;
    } // end of define function
); // end of define
