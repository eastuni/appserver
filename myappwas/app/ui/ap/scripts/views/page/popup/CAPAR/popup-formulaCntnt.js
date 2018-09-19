define(
    [
        'bx-component/popup/popup'
        , 'bx-component/ext-grid/_ext-grid'
        , 'text!app/views/page/popup/CAPAR/popup-formulaCntnt-tpl.html'
        , 'bx/common/common-info'
        , 'bx-component/bx-tree/bx-tree'
    ],
    function (Popup
        , ExtGrid
        , tpl
        , commonInfo
        , bxTree) {


        var deptOrgnztnRelCd;


        var BxpUserPopup = Popup.extend({
            //태그 이름 설정
            tagName: 'section'


            //클래스 이름 설정
            , className: 'popup-page'


            //템플릿설정
            , templates: {
                'tpl': tpl
            }


            , attributes: {
            	'style': 'width: 1020px; height: 800px;'
            }


            , events: {
                'click #btn-popup-search-modal': 'popPageLayerCtrl' // 조회영역 접기 
                , 'click #btn-popup-service-reset': 'reset' // 초기화         	
                , 'click #btn-popup-tree-modal': 'popTreeLayerCtrl' // 그리드영역 접기
                , 'click #btn-search': 'fn_cndSearch'// 검색버튼클릭
                , 'click #btn-popup-select': 'fn_select'//선택버튼클릭
                , 'click #btn-popup-cancel': 'close'//취소버튼클릭


                , 'click .formTest-btn': 'formTest'
	            , 'click #delete-btn': 'formula_delete'
	            , 'click #comma-btn': 'formula_comma'
	            , 'click #min-btn': 'formula_min'
	            , 'click #max-btn': 'formula_max'
	            , 'click #case-btn': 'formula_case'
	            , 'click #left-brace-btn': 'formula_lBrace'
	            , 'click #right-brace-btn': 'formula_rBrace'
	            , 'click #divi-btn': 'formula_divi'
	            , 'click #mult-btn': 'formula_mult'
	            , 'click #sub-btn': 'formula_sub'
	            , 'click #plus-btn': 'formula_plus'
	            , 'click #equal-btn': 'formTest'
            }


            /**
             * initialize
             * @param initConfig
             */
            , initialize: function (initConfig) {
            	var that = this;


                // Set Page
                this.$el.html(this.tpl());


                // Set Page modal 설정
                that.enableDim = true;


                // Set Grid
                that.dataGrid = new ExtGrid({
                    fields: ['No', 'cndCd', 'cndNm']
                	, id: 'dataGrid'
                    , columns: [
                        {
                            text: "No"
                            , dataIndex: 'rowIndex'
                            , sortable: false
                            , height: 25
                            , width: 50
                            , style: 'text-align:center', align: 'center'
                            , renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            return rowIndex + 1;
                        }
                        }
                        , {
                            text: bxMsg('cbb_items.AT#cndCd'),
                            flex: 1,
                            dataIndex: 'cndCd',
                            style: 'text-align:center',
                            align: 'center'
                        }
                        , {
                            text: bxMsg('cbb_items.AT#cndNm'),
                            flex: 2,
                            dataIndex: 'cndNm',
                            style: 'text-align:center',
                            align: 'left'
                        }
                    ]


                    , listeners: {
                        click: {
                            element: 'body',
                            fn: function () {
                                that.grid_select();
                            }
                        }
                    }
                });


                that.$el.find(".formula-grid").html(that.dataGrid.render({'height': '280px'}));
                that.dataGrid.resetData();
                that.show();


            }


            /**
             * render
             */
            , render: function (param) {
            	 var that = this;
                 that.instCd = param.instCd;
                 that.arrIntRtTpCd = param.arrIntRtTpCd;


                 that.$el.find('[data-form-param="formula"]').val(param.formulaCntnt);
                 that.formTest();
            }


            /**
             * 초기 화면 설정
             */
            , initPageConfiguration: function () {


                that.$el.find('[data-form-param="deptOrgnztnRelCd"]').val(deptOrgnztnRelCd);
                if(deptOrgnztnRelCd) {
                	that.$el.find('[data-form-param="deptOrgnztnRelCd"]').attr("disabled", true);
                }
            }


            , formTest: function () {
                var that = this;
                var sParam = {};


                sParam.instCd = that.instCd;
                sParam.arrIntRtTpCd = that.arrIntRtTpCd;
                sParam.formulaCntnt = that.$el.find('[data-form-param="formula"]').val();


                console.log(sParam);


                if (sParam.formulaCntnt === "")
                    return;


                var linkData = {"header": fn_getHeader("CAPAR0108402"), "CaCalcnMgmtSvcVarifyIntRtFormulaIn": sParam};


                // ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: false,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                        	//fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            var returnMsg = responseData.CaCalcnMgmtSvcVarifyIntRtFormulaOut;
                            that.$el.find('[data-form-param="formulaCntnt"]').val(returnMsg.trnsfrFormulaCntnt);
                            that.$el.find('[data-form-param="vldtnRsltMsgCntnt"]').val(returnMsg.vldtnRsltMsgCntnt);
                            that.$el.find('[data-form-param="vldtnFinYn"]').val(returnMsg.vldtnFinYn);
                        }
                    }   // end of success: function
                });     // end of bxProxy
            } // end of function 


            , fn_cndSearch: function () {
                var that = this;
                var sParam = {};


                sParam.instCd = commonInfo.getInstInfo().instCd;
                var cndCd = that.$el.find('[data-form-param="cndCd"]').val();


                sParam.cndCd = cndCd;
                sParam.cndNm = that.$el.find('[data-form-param="cndNm"]').val();


                console.log(sParam);


                var linkData = {"header": fn_getHeader("SPD0010402"), "PdTxSrvcMgmtSvcIn": sParam};


                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: false,
                    success: function (responseData) {
                        //에러인지 아닌지 판별해서 에러이면 메시지를 띄워주고 아니면 재조회 한다.
                        if (fn_commonChekResult(responseData)) {
                            if (responseData.PdTxSrvcMgmtSvcOut) {
                            	var tbList = responseData.PdTxSrvcMgmtSvcOut.tbl;
                                that.dataGrid.setData(tbList);
                                that.$el.find('#rsltCnt').html(tbList.length);
                            }
                        }
                    }
                });
            }


            /**
             * 조회영역 접기
             */
            , popPageLayerCtrl: function(){
        		var that = this;


        		fn_pageLayerCtrl(that.$el.find("#popup-search-area"));
            }


            /**
             * 입력항목 초기화
             */
            , reset: function(){
        		var that = this;
        	  	that.$el.find("[data-form-param='cndCd']").val("");
        	  	that.$el.find("[data-form-param='cndNm']").val("");
        	  	that.dataGrid.resetData();
            }


            /**
             * 트리영역 접기
             */
            , popTreeLayerCtrl: function(){
        		var that = this;
        		fn_pageLayerCtrl(that.$el.find("#popup-service-tree"));
            }


            , fn_select: function () {
                var that = this;
                param = {};


                param.formulaCntnt = that.$el.find('[data-form-param="formula"]').val();
                param.trnsfrFormulaCntnt = that.$el.find('[data-form-param="formulaCntnt"]').val();
                param.vldtnRsltMsgCntnt = that.$el.find('[data-form-param="vldtnRsltMsgCntnt"]').val();
                param.vldtnFinYn = that.$el.find('[data-form-param="vldtnFinYn"]').val();


                this.trigger('popUpSetData', param);
                this.close();
            }


            /**
             * afterClose
             */
            , afterClose: function () {
                this.remove();
            }


            , formula_delete: function () {
                var that = this;
                var formulaCntnt = that.$el.find('[data-form-param="formula"]').val();


                that.$el.find('[data-form-param="formula"]').val(formulaCntnt.slice(0, -1));
            }


            , formula_comma: function () {
                var that = this;
                var formulaCntnt = that.$el.find('[data-form-param="formula"]').val();


                formulaCntnt = formulaCntnt + ",";
                that.$el.find('[data-form-param="formula"]').val(formulaCntnt);
            }


            , formula_case: function () {
                var that = this;
                var formulaCntnt = that.$el.find('[data-form-param="formula"]').val();


                formulaCntnt = formulaCntnt + "case(";
                that.$el.find('[data-form-param="formula"]').val(formulaCntnt);
            }


            , formula_min: function () {
                var that = this;
                var formulaCntnt = that.$el.find('[data-form-param="formula"]').val();


                formulaCntnt = formulaCntnt + "min(";
                that.$el.find('[data-form-param="formula"]').val(formulaCntnt);
            }


            , formula_max: function () {
                var that = this;
                var formulaCntnt = that.$el.find('[data-form-param="formula"]').val();


                formulaCntnt = formulaCntnt + "max(";
                that.$el.find('[data-form-param="formula"]').val(formulaCntnt);
            }


            , formula_rBrace: function () {
                var that = this;
                var formulaCntnt = that.$el.find('[data-form-param="formula"]').val();


                formulaCntnt = formulaCntnt + ")";
                that.$el.find('[data-form-param="formula"]').val(formulaCntnt);
            }


            , formula_lBrace: function () {
                var that = this;
                var formulaCntnt = that.$el.find('[data-form-param="formula"]').val();


                formulaCntnt = formulaCntnt + "(";
                that.$el.find('[data-form-param="formula"]').val(formulaCntnt);
            }


            , formula_divi: function () {
                var that = this;
                var formulaCntnt = that.$el.find('[data-form-param="formula"]').val();


                formulaCntnt = formulaCntnt + "/";
                that.$el.find('[data-form-param="formula"]').val(formulaCntnt);
            }


            , formula_mult: function () {
                var that = this;
                var formulaCntnt = that.$el.find('[data-form-param="formula"]').val();


                formulaCntnt = formulaCntnt + "*";
                that.$el.find('[data-form-param="formula"]').val(formulaCntnt);
            }


            , formula_sub: function () {
                var that = this;
                var formulaCntnt = that.$el.find('[data-form-param="formula"]').val();


                formulaCntnt = formulaCntnt + "-";
                that.$el.find('[data-form-param="formula"]').val(formulaCntnt);
            }


            , formula_plus: function () {
                var that = this;
                var formulaCntnt = that.$el.find('[data-form-param="formula"]').val();


                formulaCntnt = formulaCntnt + "+";
                that.$el.find('[data-form-param="formula"]').val(formulaCntnt);
            }


            /**
             * 그리드 데이터 선택
             */
            , grid_select: function () {
                var that = this;
                var selectedData = that.dataGrid.grid.getSelectionModel().selected.items[0];
                var param = {};


                if (!selectedData) {
                    return;
                } else {
                    var formulaCntnt = that.$el.find('[data-form-param="formula"]').val();


                    formulaCntnt = formulaCntnt + "$" + selectedData.data.cndCd;
                    that.$el.find('[data-form-param="formula"]').val(formulaCntnt);
                }
            }


        });


        return BxpUserPopup;
    }
);
