define(
    [
        'bx/common/config',
        'text!app/views/page/CAPCM/120/_CAPCM120.html',
        'bx-component/ext-grid/_ext-grid',
        'bx-component/bx-tree/bx-tree',
        'bx/common/common-info',
        'app/views/page/popup/CAPSV/popup-attribute-search',
        'app/views/page/popup/CAPCM/popup-code-search',
        'app/views/page/popup/CAPCM/popup-class-search'
    ]
    , function (
        config,
        tpl,
        ExtGrid,
        bxTree,
        commonInfo,
        PopupAttributeSearch,
        PopupCodeSearch,
        PopupClassSearch
    ) {
    	var sParamExnGrid ={};

        /**
         * Backbone
         */
        var CAPCM120View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPCM120-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'keydown #searchKey': 'pressEnterInTree',


                'change .CAPCM120-atrbtVldtnWayCd-wrap': 'changeAttributeValidationRule', //검증방법 변경


                'change .CAPCM120-clHrarcy-wrap': 'changeClHrarcy', // 분류 변경


                'change .CAPCM120-xtnAtrbtVrtnCmpsCd-wrap': 'changeXtnAtrbtVrtnCmpsCd', // 제약조건 변경
                'change .CAPCM120-xtnAtrbtVrtnCmpsCd2-wrap': 'changeXtnAtrbtVrtnCmpsCd2', // 제약조건 변경 (의무의 경우)


                'change .CAPCM120-bizDscd-wrap': 'changeBusinessDistinctCode', // 업무구분코드 변경
                'change .CAPCM120-pdTmpltCd-wrap': 'changeProductTemplateCode', // 상품템플릿코드 변경
                'change .CAPCM120-pdTpCd-wrap': 'changeProductTypeCode', // 상품코드 변경


                'click #btn-attribute-search': 'openAttributeSearchPopup', // 속성검색 팝업
                'click #btn-code-search': 'openCodeSearchPopup', // 코드검색 팝업
                'click #btn-class-search': 'openClassSearchPopup', // 클래스검색 팝업


                'click #btn-standard-attribute-validation-reset': 'resetStandardAttributeValidation2', // 표준 속성 검증 초기화
                'click #btn-extended-table-attribute-validation-reset': 'resetExtendedTableAttributeValidation', // 확장테이블 속성 검증 초기화
                'click #btn-restriction-condition-detail-reset': 'resetRestrictionCondition', // 확장테이블 속성 제약조건 초기화


                'click #btn-search-result-save': 'saveSearchResult', // 상단 그리드 저장
                'click #btn-standard-attribute-validation-save': 'saveStandardAttributeValidation', // 표준 속성 검증 저장
                'click #btn-standard-attribute-validation-save2': 'saveRestrictionConditionGrid2', // 표준 속성 검증 저장(추후 변경해야함)
                'click #btn-extended-table-attribute-validation-save': 'saveExtendedTableAttributeValidation', // 확장테이블 속성 검증 저장
                'click #btn-restriction-condition-save': 'saveRestrictionConditionGrid', // 확장테이블 속성 제약조건 그리드 저장
                'click #btn-restriction-condition-detail-save': 'saveRestrictionCondition', // 확장테이블 속성 제약조건 상세 저장
                'click #btn-detail-add': 'addRestrictionCondition', // 확장테이블 속성 제약조건 상세정보 추가


                'click #btn-search-result-excel': 'downloadExcelFile', // 엑셀 다운로드


                'click #btn-tree-search': 'searchTreeList', // 트리목록 조회


                'click #btn-tree-hide': 'hideTree',
                'click #btn-tree-show': 'showTree',


                'click #btn-search-result-toggle': 'toggleSearchResult',
                'click #btn-standard-attribute-validation-toggle': 'toggleStandardAttributeValidation',
                'click #btn-extended-table-attribute-validation-toggle': 'toggleExtendedTableAttributeValidation',
                'click #btn-restriction-condition-toggle': 'toggleRestrictionCondition',
				'click #tab-CAPCM120-dueDlgncDscd' : 'clickTabDueDlgncDscd',
				'click #tab-CAPCM120-actType' : 'clickTabActType',
				'click #tab-CAPCM120-pdType' : 'clickTabpdType'
            },

           
            /**
             * 초기화
             */
            initialize: function (initData) {
               
                var comboStoreStdYn = {}; // 여부

                
                sParamExnGrid.isNotReset = true;
                $.extend(this, initData);
                this.initData = initData;
                this.createGrid();
                this.createTree();
            },


            /**
             * 렌더
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());


                // 트리 렌더
                this.$el.find('.bx-tree-root').html(this.CAPCM120Tree.render());


                // 단일탭 그리드 렌더
                this.$el.find("#CAPCM120GridSearchResult").html(this.CAPCM120GridSearchResult.render({'height': CaGridHeight}));
                this.$el.find("#CAPCM120GridRestrictionCondition").html(this.CAPCM120GridXtnTblAtrbtRstrctnCnd.render({'height': CaGridHeight}));
                this.$el.find("#extended-table-attribute-validation #btn-code-search").hide();


                this.loadTreeList();
                this.setComboBoxes();
                this.tblNm = "";
                this.deleteList = [];
                this.deleteDetailList = [];
                this.deleteDetailListTmp = [];


                this.xtnAtrbtVrtnCmpsCd = "";
              //확장속성변형구성코드 정보(상품 제외 01)
                this.xtnAtrbtVrtnCmpsCdInfoList = [];
//
                // 코드값, 코드번호, 속성명
                this.xtnAtrbtVrtnCmpsCdInfoList.push(this._getXtnAtrbtVrtnCmpsCdInfo("02", "11933", "actorTpCd")); // 액터유형코드
                this.xtnAtrbtVrtnCmpsCdInfoList.push(this._getXtnAtrbtVrtnCmpsCdInfo("03", "50006", "arrArrRelCd")); // 계약계약관계코드
                this.xtnAtrbtVrtnCmpsCdInfoList.push(this._getXtnAtrbtVrtnCmpsCdInfo("04", "50005", "arrCustRelCd")); // 계약고객관계코드
                this.xtnAtrbtVrtnCmpsCdInfoList.push(this._getXtnAtrbtVrtnCmpsCdInfo("05", "50020", "arrSrvcBlckngCd")); // 계약서비스제한코드
                this.xtnAtrbtVrtnCmpsCdInfoList.push(this._getXtnAtrbtVrtnCmpsCdInfo("06", "A0384", "arrActvtyTpCd")); // 계약활동유형코드
                this.xtnAtrbtVrtnCmpsCdInfoList.push(this._getXtnAtrbtVrtnCmpsCdInfo("07", "A0451", "arrIssmdaTpCd")); // 계약발급매체유형코드
                
                /*2017-04-17 added by #6510*/
                this.xtnAtrbtVrtnCmpsCdInfoList.push(this._getXtnAtrbtVrtnCmpsCdInfo("08", "A0881", "dueDlgncDscd")); // 확인의무구분코드
                
                /*2017-05-22 added by #6909*/
                this.xtnAtrbtVrtnCmpsCdInfoList.push(this._getXtnAtrbtVrtnCmpsCdInfo("09", "A0079", "arrDocRelCd")); // 확인의무구분코드
                
                /*2017-05-21 added by user*/
                this.xtnAtrbtVrtnCmpsCdInfoList.push(this._getXtnAtrbtVrtnCmpsCdInfo("10", "A1043", "prtnrDtlTpCd")); // 확인의무구분코드

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPCM120-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPCM120-wrap #btn-standard-attribute-validation-save2')
                                    			   ]);
                return this.$el;
            },


//
            _getXtnAtrbtVrtnCmpsCdInfo : function(cdVal, cd, atrbtNm) {
            	var xtnAtrbtVrtnCmpsCdInfo = {};
            	xtnAtrbtVrtnCmpsCdInfo.cdVal = cdVal;
            	xtnAtrbtVrtnCmpsCdInfo.cd = cd;
            	xtnAtrbtVrtnCmpsCdInfo.atrbtNm = atrbtNm;
            	return xtnAtrbtVrtnCmpsCdInfo;
            },


            /**
             * 트리 생성
             */
            createTree: function () {
                var that = this;


                this.CAPCM120Tree = new bxTree({
                    fields: {id: 'tblId', value: 'tblNm'},


                    // Tree Item - Checkbox Use Yn
                    checkAble: false,


                    listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {


                            if(itemData.tblId) {
                                that.inquireServiceData(itemData);
                            }
                        }
                    }
                });
            },


            /**
             * 그리드 생성
             */
            createGrid: function () {
                var that = this;


                this.CAPCM120GridSearchResult = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['instCd', 'xtnAtrbtNm', 'xtnAtrbtDescCntnt', 'stdAtrbtVldtnUseYn', 'xtnAtrbtVrtnCmpsCd', 'stdAtrbtVldtnWayCd', 'stdAtrbtVldtnRuleCntnt', 'stdAtrbtVldtnXtnRuleCntnt'
                             , 'atrbtVldtnWayCd', 'atrbtVldtnRuleCntnt', 'atrbtVldtnXtnRuleCntnt', 'atrbtVldtnXtnRule', 'atrbtDfntnCntnt', 'rmkCntnt', 'lastChngTmstmp', 'tblNm']
                    , id: 'CAPCM120GridSearchResult'


                    , columns: [
                        {
                            text: 'No.',
                            dataIndex: 'rowIndex',
                            sortable: false,
                            width : 80,
                            height: 25,
                            style: 'text-align:center',
                            align: 'center',
                            // other config you need....
                            renderer: function (value, metaData, record, rowIndex) {
                                return rowIndex + 1;
                            }
                        },
                        {


                            text: bxMsg('cbb_items.AT#stdYn'),
                            flex: 1,
                            dataIndex: 'instCd',
                            style: 'text-align:center',
                            align: 'center',
                            code: 'A0024',
                        	renderer: function (val) {
                            	var rtn = bxMsg('cbb_items.CDVAL#A0024N');
                            	if(val==='STDA') {
                            		rtn = bxMsg('cbb_items.CDVAL#A0024STDA');
                        		}
                        		return rtn;


                            } // end of render
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#atrbt'),
                            flex: 1,
                            dataIndex: 'xtnAtrbtNm',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#loginLngAtrbtNm'),
                            flex: 1,
                            dataIndex: 'xtnAtrbtDescCntnt',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#stdAtrbtVldtnYn'),
                            flex: 1,
                            dataIndex: 'stdAtrbtVldtnUseYn',
                            style: 'text-align:center',
                            align: 'center',
                            code: '10000',
                        	renderer: function (val) {
                        		var result = "N";
                            	var classNm = "s-no";


                            	if(val && val =="Y") {
                        			classNm = "s-yes";
                        			result = "Y";
                        		}
                        		return "<span class=\"bw-sign "+classNm+"\">"+ result +"</span>";


                            } // end of render
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#xtnTblAtrbtVldtnYn'),
                            flex: 1,
                            dataIndex: 'atrbtVldtnWayCd',
                            style: 'text-align:center',
                            align: 'center',
                            code: '10002',
                        	renderer: function (val) {
                            	var classNm = "s-no";
                            	var result = "N";


                            	if(val) {
                        			classNm = "s-yes";
                        			result = "Y";
                        		}
                        		return "<span class=\"bw-sign "+classNm+"\">"+result +"</span>";


                            } // end of render
                        },
                        {text: "",dataIndex: 'stdYn',hidden : true},


                        {text: "",dataIndex: 'stdAtrbtVldtnWayCd',hidden : true},
                        {text: "",dataIndex: 'stdAtrbtVldtnRuleCntnt',hidden : true},
                        {text: "",dataIndex: 'stdAtrbtVldtnXtnRuleCntnt',hidden : true},


                        {text: "",dataIndex: 'atrbtVldtnRuleCntnt',hidden : true},
                        {text: "",dataIndex: 'atrbtVldtnXtnRuleCntnt',hidden : true},


                        {text: "",dataIndex: 'atrbtDfntnCntnt',hidden : true},
                        {text: "",dataIndex: 'rmkCntnt',hidden : true},


                        {text: "",dataIndex: 'xtnAtrbtVrtnCmpsCd',hidden : true},
                        {text: "",dataIndex: 'lastChngTmstmp',hidden : true},
                        {text: "",dataIndex: 'tblNm',hidden : true},
                        {
                            xtype: 'actioncolumn',
                            width: 80,
                            align: 'center',
                            text: bxMsg('cbb_items.SCRNITM#del'),
                            style: 'text-align:center',
                            items: [
                                {
                                    //  icon: 'images/icon/x-delete-16.png'
                                    iconCls : "bw-icon i-25 i-func-trash",
                                    tooltip: bxMsg('tm-layout.delete-field'),
                                    handler: function (grid, rowIndex, colIndex, item, e, record) {
                                    	var instCd = $.sessionStorage('headerInstCd');
                                    	if( record.data.instCd != instCd ){
                                    		if(record.data.instCd !='N'){
                                        		fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0056'));
                                        		return;
                                    		}
                                    	}
                                        that.deleteList.push(record.data);
                                        grid.store.remove(record);
                                    }
                                }
                            ]
                        }
                    ], // end of columns
                    listeners: {
                        click: {
                            element: 'body',
                            fn: function () {
                                that.selectGridOfSearchResult();
                            }
                        }
                    }
                });




                this.CAPCM120GridXtnTblAtrbtRstrctnCnd = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['mndtryYn', 'scrnInpYn', 'scrnChngAblYn', 'custInqryTrgtYn', 'intrnlInqryTrgtYn'
                             , 'jsonKeyValCntnt', 'cntnt', 'tblNm', 'xtnAtrbtNm', 'instCd', 'xtnAtrbtVrtnCmpsCd'
                             , 'prcsngDsVal'
                             ]
                    , id: 'CAPCM120GridXtnTblAtrbtRstrctnCnd'
                    , columns: [
                        {
                            text: 'No.',
                            dataIndex: 'rowIndex',
                            sortable: false,
                            width : 80,
                            height: 25,
                            style: 'text-align:center',
                            align: 'center',
                            // other config you need....
                            renderer: function (value, metaData, record, rowIndex) {
                                return rowIndex + 1;
                            }
                        },
                        {text: bxMsg('cbb_items.AT#cntnt'), flex: 2, dataIndex: 'cntnt', style: 'text-align:center', align: 'center'},
                        {text: bxMsg('cbb_items.SCRNITM#mndtry'), flex: 1, dataIndex: 'mndtryYn', style: 'text-align:center', align: 'center',
                        	renderer: function (val) {
                        		var result = "N";
                            	var classNm = "s-no";


                            	if(val && val =="Y") {
                        			classNm = "s-yes";
                        			result = "Y";
                        		}
                        		return "<span class=\"bw-sign "+classNm+"\">"+ result +"</span>";


                            } // end of render
                        },
                        {text: bxMsg('cbb_items.SCRNITM#scrnInp'), flex: 1, dataIndex: 'scrnInpYn', style: 'text-align:center', align: 'center',
                        	renderer: function (val) {
                        		var result = "N";
                            	var classNm = "s-no";


                            	if(val && val =="Y") {
                        			classNm = "s-yes";
                        			result = "Y";
                        		}
                        		return "<span class=\"bw-sign "+classNm+"\">"+ result +"</span>";


                            } // end of render
                        },
                        {text: bxMsg('cbb_items.SCRNITM#scrnChngAbl'), flex: 1, dataIndex: 'scrnChngAblYn', style: 'text-align:center', align: 'center',
                        	renderer: function (val) {
                        		var result = "N";
                            	var classNm = "s-no";


                            	if(val && val =="Y") {
                        			classNm = "s-yes";
                        			result = "Y";
                        		}
                        		return "<span class=\"bw-sign "+classNm+"\">"+ result +"</span>";


                            } // end of render
                        },
                        {text: bxMsg('cbb_items.SCRNITM#custInqryTrgt'), flex: 1, dataIndex: 'custInqryTrgtYn', style: 'text-align:center', align: 'center',
                        	renderer: function (val) {
                        		var result = "N";
                            	var classNm = "s-no";


                            	if(val && val =="Y") {
                        			classNm = "s-yes";
                        			result = "Y";
                        		}
                        		return "<span class=\"bw-sign "+classNm+"\">"+ result +"</span>";


                            } // end of render
                        },
                        {text: bxMsg('cbb_items.SCRNITM#intrnlInqryTrgt'), flex: 1, dataIndex: 'intrnlInqryTrgtYn', style: 'text-align:center', align: 'center',
                        	renderer: function (val) {
                        		var result = "N";
                            	var classNm = "s-no";


                            	if(val && val =="Y") {
                        			classNm = "s-yes";
                        			result = "Y";
                        		}
                        		return "<span class=\"bw-sign "+classNm+"\">"+ result +"</span>";


                            } // end of render
                        },
                        {text: bxMsg('cbb_items.SCRNITM#jsonKeyValCntnt'), flex: 1, dataIndex: 'jsonKeyValCntnt', style: 'text-align:center', align: 'center', hidden : true},
                        {text: bxMsg('cbb_items.SCRNITM#tblNm'), flex: 1, dataIndex: 'tblNm', style: 'text-align:center', align: 'center', hidden : true},
                        {text: bxMsg('cbb_items.SCRNITM#xtnAtrbtNm'), flex: 1, dataIndex: 'xtnAtrbtNm', style: 'text-align:center', align: 'center', hidden : true},
                        {text: bxMsg('cbb_items.SCRNITM#instCd'), flex: 1, dataIndex: 'instCd', style: 'text-align:center', align: 'center', hidden : true},
                        {text: bxMsg('cbb_items.SCRNITM#xtnAtrbtVrtnCmpsCd'), flex: 1, dataIndex: 'xtnAtrbtVrtnCmpsCd', style: 'text-align:center', align: 'center', hidden : true},
                        { flex: 1, dataIndex: 'prcsngDsVal', style: 'text-align:center', align: 'center', hidden : true},
                        { flex: 1, dataIndex: 'xtnTpCd', style: 'text-align:center', align: 'center', hidden : true},
                        {
                            xtype: 'actioncolumn',
                            width: 80,
                            align: 'center',
                            text: bxMsg('cbb_items.SCRNITM#del'),
                            style: 'text-align:center',
                            items: [
                                {
                                    //  icon: 'images/icon/x-delete-16.png'
                                    iconCls : "bw-icon i-25 i-func-trash",
                                    tooltip: bxMsg('tm-layout.delete-field'),
                                    handler: function (grid, rowIndex, colIndex, item, e, record) {
                                    	//record.data.flagIndex = rowIndex;
                    				 	record.data.prcsngDsVal = 'D';
                                        that.deleteDetailList.push(record.data);
                                        grid.store.remove(record);
                                    }
                                }
                            ]
                        }




                    ] // end of columns
	                , listeners: {
	                    click: {
	                        element: 'body',
	                        fn: function () {
	                        	this.xtnAtrbtVrtnCmpsCd = that.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnUseYn"]').val();
	                            that.selectGridOfDetailResult();
	                        }
	                    }
	                }
                });
            },


            /**
             * 콤보박스 세팅
             */
            setComboBoxes: function () {
                // 콤보데이터 로딩
                var sParam = {};


                // combobox 정보 셋팅
                sParam.className = "CAPCM120-stdAtrbtVldtnUseYn-wrap";
                sParam.targetId = "stdAtrbtVldtnUseYn";
                sParam.nullYn = "N";
                sParam.cdNbr = "10000"; // 여부 코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM120-clHrarcy-wrap";
                sParam.targetId = "clHrarcy";
               sParam.nullYn = "Y";
                sParam.cdNbr = "A0112"; // 분류체계코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                // 확장 속성검증방법코드
                sParam.className = "CAPCM120-atrbtVldtnWayCd-wrap";
                sParam.targetId = "atrbtVldtnWayCd";
                sParam.nullYn = "Y";
                sParam.cdNbr = "10002"; // 속성검증방법코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM120-xtnAtrbtVrtnCmpsCd-wrap";
                sParam.targetId = "xtnAtrbtVrtnCmpsCd";
                sParam.cdNbr = "12308"; // 확장속성변형구성코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
                
                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM120-xtnAtrbtVrtnCmpsCd2-wrap";
                sParam.targetId = "xtnAtrbtVrtnCmpsCd2";
                sParam.cdNbr = "12308"; // 확장속성변형구성코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM120-bizDscd-wrap";
                sParam.targetId = "bizDscd";
                sParam.nullYn = "Y";
                sParam.cdNbr = "80015";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 업무구분코드
            },


            /**
             * 목록조회 결과값 설정
             */
            setSearchResult: function (data) {
                this.CAPCM120GridSearchResult.setData(data);
            },


            /**
             * 표준 속성 검증 설정
             */
            setStandardAttributeValidation: function (data) {
            	this.$el.find('#standard-attribute-validation-area [data-form-param="xtnAtrbtNm"]').val(data.xtnAtrbtNm); // 속성코드
                this.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnUseYn"]').val(data.stdAtrbtVldtnUseYn != null ? data.stdAtrbtVldtnUseYn : "N"); // 표준속성검증 여부
                this.$el.find('#standard-attribute-validation-area [data-form-param="xtnAtrbtDesc"]').val(data.xtnAtrbtDescCntnt); // 속성명
                this.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnWayNm"]').val(data.stdAtrbtVldtnWayCd != null ? bxMsg('cbb_items.CDVAL#10002'+data.stdAtrbtVldtnWayCd) : ""); // 속성검증방법코드 
                this.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnWayCd"]').val(data.stdAtrbtVldtnWayCd); // 속성검증방법코드
                this.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnRule"]').val(data.stdAtrbtVldtnRuleCntnt); // 속성검증규칙
                this.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnXtnRule"]').val(data.stdAtrbtVldtnXtnRuleCntnt); // 확장 검증규칙


                this.$el.find('#btn-attribute-search').prop("readonly", true);


            },


            /**
             * 확장테이블 속성 검증 설정
             */
            setExtendedTableAttributeValidation: function (data) {
                this.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnWayCd"]').val(data.atrbtVldtnWayCd);
                this.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnRuleCntnt"]').val(data.atrbtVldtnRuleCntnt);
                this.$el.find('#extended-table-attribute-validation-area #CAPCM120-clHrarcy-wrap').val(data.atrbtVldtnRuleCntnt);
                this.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnXtnRule"]').val(data.atrbtVldtnXtnRuleCntnt);
                this.$el.find('#extended-table-attribute-validation-area [data-form-param="rmkCntnt"]').val(data.rmkCntnt);
                this.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd"]').val(data.xtnAtrbtVrtnCmpsCd);


                if(data.atrbtVldtnWayCd == "C") {
                	// 코드 팝업 버튼 보이기
                	this.$el.find('#extended-table-attribute-validation-area #CAPCM120-clHrarcy-wrap').hide();
                	this.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnRuleCntnt"]').show();
                	this.$el.find('#btn-code-search').show();
                }
                else if(data.atrbtVldtnWayCd == "T"){
                	// 분류 select 보이기
                	this.$el.find('#extended-table-attribute-validation-area #CAPCM120-clHrarcy-wrap').show();
                	this.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnRuleCntnt"]').hide();
                	this.$el.find('#btn-code-search').hide();
                }
                else {
                	this.$el.find('#extended-table-attribute-validation-area #CAPCM120-clHrarcy-wrap').hide();
                	this.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnRuleCntnt"]').show();
                	this.$el.find('#btn-code-search').hide();
                }
            },


            /**
             * 확장테이블 속성 제약조건 그리드 설정
             */
            setRestrictionConditionGrid : function(data) {
            	this.CAPCM120GridXtnTblAtrbtRstrctnCnd.setData(data);
            },


            /**
             * 확장테이블 속성 제약조건 상세 설정
             */
            setRestrictionCondition: function (data) {
                this.$el.find('#restriction-condition-area [data-form-param="rstrctnCnd"]').val("");
                this.$el.find('#restriction-condition-area [data-form-param="bizDscd"]').val("");
                this.$el.find('#restriction-condition-area [data-form-param="pdTpCd"]').val("");
                this.$el.find('#restriction-condition-area [data-form-param="pdTmpltCd"]').val("");
                this.$el.find('#restriction-condition-area [data-form-param="pdCd"]').val("");


                this.$el.find('#restriction-condition-area [data-form-param="mndtryYn"]').prop('checked', false);
                this.$el.find('#restriction-condition-area [data-form-param="scrnInpYn"]').prop('checked', false);
                this.$el.find('#restriction-condition-area [data-form-param="scrnChngAblYn"]').prop('checked', false);
                this.$el.find('#restriction-condition-area [data-form-param="custInqryTrgtYn"]').prop('checked', false);
                this.$el.find('#restriction-condition-area [data-form-param="intrnlInqryTrgtYn"]').prop('checked', false);
            },


            initTreeList: function () {
                this.$el.find('[data-form-param="searchKey"]').val(this.initData.param.srvcCd);


                this.searchTreeList();


                if(this.initData.param.srvcCd && this.initData.param.srvcNm) {
                    this.CAPCM120Tree.selectItem(this.initData.param.srvcCd, false);
                    // 상세조회
                    var sParam = {};


                    // sParam.instCd = $.sessionStorage('headerInstCd'); 
                    // sParam.srvcCd = this.initData.param.srvcCd;
                    // sParam.inpDtoNm = this.initData.param.inpDtoNm;
                    // this.inquireServiceData(sParam); 
                }
            },


            /**
             * 모든 트리 항목들을 로드
             */
            loadTreeList: function () {
                var that = this;
                var sParam = {};
                var linkData = {"header" : fn_getHeader("CAPCM0418401") , "CaTblMgmtSvcGetTblListIn" : sParam};


                this.treeList = [];


                bxProxy.post(sUrl, JSON.stringify(linkData),{
                    enableLoading: true,
                    success: function (responseData) {
                        if(fn_commonChekResult(responseData)) {
                            var menuList = responseData.CaTblMgmtSvcStdXtnTblTreeOut.menuList;


                            if(menuList != null && menuList.length > 0) {
                                that.CAPCM120Tree.renderItem(menuList);
                                that.treeList = menuList;
                            }


                            if(that.initData.param) {
                                console.log('init tree');
                                that.initTreeList();
                            }
                        }
                    }
                });
            },


            /**
             * 트리 리스트 항목 중 검색 조건에 해당하는 항목을 검색
             */
            searchTreeList: function () {
                var searchKey = this.$el.find('[data-form-param="searchKey"]').val();
                var matchingItems;


                if(!searchKey) {
                    this.CAPCM120Tree.renderItem(this.treeList);
                    return;
                }


                if(this.treeList.length < 1) {
                    return;
                }


                matchingItems = this.findMatchingTreeItems(searchKey);
                this.CAPCM120Tree.renderItem(matchingItems);
            },


            /**
             * 트리 메뉴 중 검색 조건에 해당하는 항목을 반환
             */
            findMatchingTreeItems : function(key) {
                var searchTreeList = [];


                $(this.treeList).each(function(idx, data) {
                    for (var i = 0; i < data.children.length; i++) {
                        var temp001 = data.children[i];
                        if (temp001.inpDtoNm != null && temp001.srvcClassNm != null) {
                            if ((temp001.srvcNm.indexOf(key) > -1 || temp001.srvcCd.indexOf(key) > -1)) {
                                searchTreeList.push(temp001);
                            }
                        }
                    }
                });
                return searchTreeList;
            },


            /**
             * 트리의 엔터 입력 처리를 위한 콜백함수
             */
            pressEnterInTree: function (event) {
                var event = event || window.event;
                var keyID = (event.which) ? event.which : event.keyCode;
                if(keyID == 13) { //enter
                    this.searchTreeList();
                }
            },


            /**
             * 트리 항목 선택시 서비스 데이터 조회
             * @param param
             */
            inquireServiceData: function (param) {
                // header 정보 set
                var that = this;
                var sParam = {};
                that.deleteList = [];
                sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                sParam.tblNm = param.tblNm;
                this.tblNm = sParam.tblNm;
                var linkData = {"header": fn_getHeader("CAPCM1208403"), "CaTblMgmtSvcGetTblXtnAtrbtListIn": sParam};


                // ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    // loading 설정
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            if (responseData.CaTblMgmtSvcGetTblXtnAtrbtListOut) {
                                that.CAPCM120GridSearchResult.setData(responseData.CaTblMgmtSvcGetTblXtnAtrbtListOut.atrbtList);
                            } else {
                                that.CAPCM120GridSearchResult.resetData();
                            }


                            // 하단 리셋
                            that.resetStandardAttributeValidation(); //  표준 속성 검증 초기화
                            that.resetExtendedTableAttributeValidation(); // 확장테이블 속성 검증 초기화
                            that.resetRestrictionConditionGrid(); // 확장테이블 속성 제약조건 그리드 초기화
                            that.resetRestrictionCondition(); // 확장테이블 송석 제약조건 초기화


                            that.tblNm = sParam.tblNm;


                            if(param.select) {
                            	// 
                            	if(responseData.CaTblMgmtSvcGetTblXtnAtrbtListOut.atrbtList.length > 0) {
                            		$(responseData.CaTblMgmtSvcGetTblXtnAtrbtListOut.atrbtList).each(function(idx, data) {
                            			if(param.xtnAtrbtNm == data.xtnAtrbtNm) {
                            				console.log("grid event");
                            				var $grid = that.CAPCM120GridSearchResult.grid;
                            				$grid.getSelectionModel().select(idx, true);


                            				// 선택한 그리드 조회
//                            				$grid.fireEvent('click', $grid, $grid.getSelectionModel().getLastSelected());


                            				// 그리드 선택시 이벤트 실행
                            				that.selectGridOfSearchResult();
                            				return false;
                            			}
                            		});
                            	}
                            }
                        }
                    }
                });
            },


            /**
             * 확장테이블 속성 제약조건 목록 조회
             */
            inquireDetailData : function(data) {
            	// header 정보 set
                var that = this;
                var sParam = {};
                that.deleteDetailList = [];


                that.xtnAtrbtVrtnCmpsCd = data.xtnAtrbtVrtnCmpsCd;


                sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                sParam.tblNm = that.tblNm;
                sParam.atrbtNm = data.xtnAtrbtNm;


                var linkData = {"header": fn_getHeader("CAPCM1208402"), "CaTblMgmtSvcGetTblXtnAtrbtIn": sParam};


                // ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    // loading 설정
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                        	if (responseData.CaTblMgmtSvcGetXtnAtrbtXtnAtrbtDtlOut) {
                        		var tbl = responseData.CaTblMgmtSvcGetXtnAtrbtXtnAtrbtDtlOut.xtnAtrbtXtnAtrbtDtlList;
                        		var dataList = [];
                        		var cntnt = "";
                        		var cntnt2 = "";
                        		var xtnTpCd ="";
                        		$(tbl).each(function(idx, sub) {
                        			console.log(sub.jsonKeyValCntnt);
                        			if(sub.jsonKeyValCntnt == null || sub.jsonKeyValCntnt == " " || sub.jsonKeyValCntnt == ""){
                        				return;
                        			}
                    				if( sub.xtnAtrbtVrtnCmpsCd != "00"){
                            			var parseJsonKeyValCntnt = $.parseJSON(sub.jsonKeyValCntnt);


                            			if(sub.xtnAtrbtVrtnCmpsCd == "01") { // 상품
                            				cntnt = "";
                            				if(parseJsonKeyValCntnt.bizDscd) {
                            					cntnt += bxMsg('cbb_items.CDVAL#80015'+parseJsonKeyValCntnt.bizDscd);
                            				}


                            				if(parseJsonKeyValCntnt.pdTpCd) {
                            					cntnt += " > "+bxMsg('cbb_items.PDMDL#'+parseJsonKeyValCntnt.bizDscd+""+parseJsonKeyValCntnt.pdTpCd);
                            				}


                            				if(parseJsonKeyValCntnt.pdTmpltCd) {
                            					cntnt += " > "+bxMsg('cbb_items.PDTMPLT#'+parseJsonKeyValCntnt.pdTmpltCd);
                        					}


                            				if(parseJsonKeyValCntnt.pdCd) {
                            					cntnt += " > "+bxMsg('cbb_items.PD#'+parseJsonKeyValCntnt.pdCd);
                    						}
                            			}else if(sub.xtnAtrbtVrtnCmpsCd != "00") {
                            				cntnt = "";
                            				cntnt2 = "";
                            				if(sub.xtnAtrbtVrtnCmpsCd == "08"){
                                				if(parseJsonKeyValCntnt.bizDscd) {
                                					xtnTpCd ="01";
                                					cntnt2 += bxMsg('cbb_items.CDVAL#80015'+parseJsonKeyValCntnt.bizDscd);
                                				}


                                				if(parseJsonKeyValCntnt.pdTpCd) {
                                					cntnt2 += " > "+bxMsg('cbb_items.PDMDL#'+parseJsonKeyValCntnt.bizDscd+""+parseJsonKeyValCntnt.pdTpCd);
                                				}


                                				if(parseJsonKeyValCntnt.pdTmpltCd) {
                                					cntnt2 += " > "+bxMsg('cbb_items.PDTMPLT#'+parseJsonKeyValCntnt.pdTmpltCd);
                                					
                            					}


                                				if(parseJsonKeyValCntnt.actorTpCd) {
                                					cntnt2 += bxMsg('cbb_items.AT#actorTpCd');
                                					cntnt2 += " > "+bxMsg('cbb_items.CDVAL#11933'+parseJsonKeyValCntnt.actorTpCd);
                                					xtnTpCd ="02";
                        						}
                                				
                                				if(parseJsonKeyValCntnt.pdCd) {
                                					cntnt2 += " > "+bxMsg('cbb_items.PD#'+parseJsonKeyValCntnt.pdCd);
                        						}
                                				$(that.xtnAtrbtVrtnCmpsCdInfoList).each(function(idx2, infoData) {
                                            		if(sub.xtnAtrbtVrtnCmpsCd === infoData.cdVal) {
                                            			cntnt += bxMsg('cbb_items.AT#'+infoData.atrbtNm);
                                               			if( parseJsonKeyValCntnt[infoData.atrbtNm] != null){
                                            				cntnt += " > "+bxMsg('cbb_items.CDVAL#'+infoData.cd+""+parseJsonKeyValCntnt[infoData.atrbtNm]);
                                            			}
                                               			xtnTpCd ="08";
                                            			return false;
                                            		}
                                        		});

                                				
                                			}else{
                                				
                                				$(that.xtnAtrbtVrtnCmpsCdInfoList).each(function(idx2, infoData) {
                                            		if(sub.xtnAtrbtVrtnCmpsCd === infoData.cdVal) {
                                            			cntnt += bxMsg('cbb_items.AT#'+infoData.atrbtNm);
                                               			if( parseJsonKeyValCntnt[infoData.atrbtNm] != null){
                                            				cntnt += " > "+bxMsg('cbb_items.CDVAL#'+infoData.cd+""+parseJsonKeyValCntnt[infoData.atrbtNm]);
                                            			}	
                                            			return false;
                                            		}
                                        		});
                                			}

                            			}
                        			}




                        			
                    				if(cntnt2 != null && cntnt2 != "" ){
                    					sub.cntnt = cntnt2;
                    				}else{
                    					sub.cntnt = cntnt;
                    					
                    				}
                    				sub.xtnTpCd = xtnTpCd;
                        			dataList.push(sub);
                        		});


                        		if(that.xtnAtrbtVrtnCmpsCd == "00") {
                        			that.resetDefaultDetail();
                        			that.resetRestrictionConditionGrid(sParamExnGrid);	
                        		}
                        		else {
                        			that.resetRestrictionCondition(); // 확장테이블 속성 제약조건 초기화
                        			that.setRestrictionConditionGrid(dataList);
                        		}
                        	}
                        }
                    }
                });
            }, 


            /**
             * 속성조회 팝업 
             */
            openAttributeSearchPopup: function () {
                var that = this;


                this.popupAttributeSearch = new PopupAttributeSearch();
                this.popupAttributeSearch.render();
                this.popupAttributeSearch.on('popUpSetData', function (data) {
                    that.$el.find('#standard-attribute-validation-area [data-form-param="xtnAtrbtNm"]').val(data.atrbtCd);
                    that.$el.find('#standard-attribute-validation-area [data-form-param="xtnAtrbtDesc"]').val(data.atrbtNm);


                    that.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnWayNm"]').val(data.atrbtVldtnWayCd != null ? bxMsg('cbb_items.CDVAL#10002'+data.atrbtVldtnWayCd) : ""); // 속성검증방법코드 
                    that.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnWayCd"]').val(data.atrbtVldtnWayCd); // 속성검증방법코드
                    that.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnRule"]').val(data.atrbtVldtnRuleCntnt); // 속성검증규칙
                    that.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnXtnRule"]').val(data.atrbtVldtnXtnRuleCntnt); // 확장 검증규칙
                });
            },


            /**
             * 코드조회 팝업
             */
            openCodeSearchPopup: function () {
                var that = this;


                this.popupCodeSearch = new PopupCodeSearch();
                this.popupCodeSearch.render();
                this.popupCodeSearch.on('popUpSetData', function (data) {
                    that.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnRuleCntnt"]').val(data.cdNbr);
                });
            },


            /**
             * 클래스 조회 팝업
             */
            openClassSearchPopup: function () {
                var that = this;


                this.popupClassSearch = new PopupClassSearch();
                this.popupClassSearch.render();
                this.popupClassSearch.on('popUpSetData', function (data) {
                    that.$el.find('#extended-table-attribute-validation [data-form-param="xtnVldtnRule"]').val(data.classNm);
                });
            },


            /**
             * 상단 그리드 초기화
             */
            resetSearchResult: function () {
                this.CAPCM120GridSearchResult.resetData();
            },


            /**
             * 표준 속성 검증 초기화
             */
            resetStandardAttributeValidation: function () {
                this.$el.find('#standard-attribute-validation-area [data-form-param="xtnAtrbtNm"]').val("");
                this.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnUseYn"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#standard-attribute-validation-area [data-form-param="xtnAtrbtDesc"]').val("");
                this.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnWayNm"]').val("");
                this.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnWayCd"]').val("");
                this.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnRule"]').val("");
                this.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnXtnRule"]').val("");


                this.$el.find('#btn-attribute-search').prop("readonly", false);


            },


            resetStandardAttributeValidation2: function () {
                this.$el.find('#standard-attribute-validation-area [data-form-param="xtnAtrbtNm"]').val("");
                this.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnUseYn"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#standard-attribute-validation-area [data-form-param="xtnAtrbtDesc"]').val("");
                this.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnWayNm"]').val("");
                this.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnWayCd"]').val("");
                this.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnRule"]').val("");
                this.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnXtnRule"]').val("");


                this.$el.find('#btn-attribute-search').prop("readonly", false);


                /*저장버튼 하나로 이루어지기 때문에 초기화도 전체가 될 수 있도록 한다.*/
                this.resetExtendedTableAttributeValidation(); // 확장테이블 속성 검증 초기화
                this.resetRestrictionConditionGrid(sParamExnGrid); // 확장테이블 속성 제약조건 그리드 초기화
                this.resetRestrictionCondition(); // 확장테이블 송석 제약조건 초기화
            },
            /**
             * 확장테이블 속성 검증 초기화
             */
            resetExtendedTableAttributeValidation: function () {
                this.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnWayCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnRuleCntnt"]').val("");
                this.$el.find('#extended-table-attribute-validation-area #CAPCM120-clHrarcy-wrap option:eq(0)').attr("selected", "selected");
                this.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnXtnRule"]').val("");
                this.$el.find('#extended-table-attribute-validation-area [data-form-param="rmkCntnt"]').val("");
                this.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd"] option:eq(0)').attr("selected", "selected");


                this.$el.find('#extended-table-attribute-validation-area #CAPCM120-clHrarcy-wrap').hide();
            	this.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnRuleCntnt"]').show();
            	this.$el.find('#btn-code-search').hide();
            },


            /**
             * 확장테이블 속성 제약조건 그리드 초기화
             */
            resetRestrictionConditionGrid : function() {
            	if( sParamExnGrid != null && ( sParamExnGrid.isNotReset != null && !sParamExnGrid.isNotReset)){
            		this.CAPCM120GridXtnTblAtrbtRstrctnCnd.resetData();
            	}
            },


            /**
             * 확장테이블 속성 제약조건 상세 초기화
             */
            resetRestrictionCondition: function () {


                this.resetRestrictionConditionDetail();
                var xtnAtrbtVrtnCmpsCd    = this.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd"]').val();
                if( xtnAtrbtVrtnCmpsCd != null && xtnAtrbtVrtnCmpsCd =="08"){
                	xtnAtrbtVrtnCmpsCd    = this.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd2"]').val();
                }
                if(xtnAtrbtVrtnCmpsCd == "01") {
                	this.resetProductDetail();
                }
                else if(xtnAtrbtVrtnCmpsCd != "00") {
                	this.resetOrtherDetail("", "");
                }
                else {
                	this.resetDefaultDetail();
                }
            },


            resetRestrictionConditionDetail : function() {
                this.$el.find('#restriction-condition-detail-area [data-form-param="bizDscd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#restriction-condition-detail-area [data-form-param="pdTpCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#restriction-condition-detail-area [data-form-param="pdTmpltCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#restriction-condition-detail-area [data-form-param="pdCd"] option:eq(0)').attr("selected", "selected");


                this.$el.find('#restriction-condition-detail-area [data-form-param="pdTpCd"]').empty();
                this.$el.find('#restriction-condition-detail-area [data-form-param="pdTmpltCd"]').empty();
                this.$el.find('#restriction-condition-detail-area [data-form-param="pdCd"]').empty();


                this.$el.find('#restriction-condition-detail-area [data-form-param="bizDscd"]').prop("readonly", false);
                this.$el.find('#restriction-condition-detail-area [data-form-param="pdTpCd"]').prop("readonly", false);
                this.$el.find('#restriction-condition-detail-area [data-form-param="pdTmpltCd"]').prop("readonly", false);
                this.$el.find('#restriction-condition-detail-area [data-form-param="pdCd"]').prop("readonly", false);;


                this.$el.find('#restriction-condition-detail-area [data-form-param="mndtryYn"]').prop("checked", false);
                this.$el.find('#restriction-condition-detail-area [data-form-param="scrnInpYn"]').prop("checked", false);
                this.$el.find('#restriction-condition-detail-area [data-form-param="scrnChngAblYn"]').prop("checked", false);
                this.$el.find('#restriction-condition-detail-area [data-form-param="custInqryTrgtYn"]').prop("checked", false);
                this.$el.find('#restriction-condition-detail-area [data-form-param="intrnlInqryTrgtYn"]').prop("checked", false);


                this.$el.find('#restriction-condition-detail-area [data-form-param="mndtryYn"]').prop("readonly", false);
                this.$el.find('#restriction-condition-detail-area [data-form-param="scrnInpYn"]').prop("readonly", false);
                this.$el.find('#restriction-condition-detail-area [data-form-param="scrnChngAblYn"]').prop("readonly", false);
                this.$el.find('#restriction-condition-detail-area [data-form-param="custInqryTrgtYn"]').prop("readonly", false);
                this.$el.find('#restriction-condition-detail-area [data-form-param="intrnlInqryTrgtYn"]').prop("readonly", false);


                this.$el.find('#restriction-condition-detail-area #pd_table_area').show();
                this.$el.find('#restriction-condition-detail-area #other_table_area').hide();
            },


            /**
             * 무관 초기 설정
             */
            resetDefaultDetail : function() {
            	var that = this;
            	that.resetRestrictionConditionDetail();


				// 하단 비활성화 처리
				that.$el.find('#restriction-condition-detail-area [data-form-param="bizDscd"]').prop("readonly", true);
				that.$el.find('#restriction-condition-detail-area [data-form-param="pdTpCd"]').prop("readonly", true);
				that.$el.find('#restriction-condition-detail-area [data-form-param="pdTmpltCd"]').prop("readonly", true);
				that.$el.find('#restriction-condition-detail-area [data-form-param="pdCd"]').prop("readonly", true);


				that.$el.find('#restriction-condition-detail-area [data-form-param="mndtryYn"]').prop("readonly", true);
				that.$el.find('#restriction-condition-detail-area [data-form-param="scrnInpYn"]').prop("readonly", true);
				that.$el.find('#restriction-condition-detail-area [data-form-param="scrnChngAblYn"]').prop("readonly", true);
				that.$el.find('#restriction-condition-detail-area [data-form-param="custInqryTrgtYn"]').prop("readonly", true);
				that.$el.find('#restriction-condition-detail-area [data-form-param="intrnlInqryTrgtYn"]').prop("readonly", true);


				that.$el.find("#btn-restriction-condition-detail-reset").prop("readonly", true);
				that.$el.find("#btn-restriction-condition-detail-save").prop("readonly", true);
				that.$el.find("#btn-detail-add").prop("readonly", true);
            },


            /**
             * 상품 초기 설정
             */
            resetProductDetail : function() {
            	var that = this;
            	// 초기화
				that.resetRestrictionConditionDetail();
				// 버튼 활성화
				that.$el.find('#restriction-condition-detail-area #pd_table_area').show();
				that.$el.find('#restriction-condition-detail-area #other_table_area').hide();


				that.$el.find("#btn-restriction-condition-detail-reset").prop("readonly", false);
				that.$el.find("#btn-restriction-condition-detail-save").prop("readonly", false);
				that.$el.find("#btn-detail-add").prop("readonly", false);
            },


            /**
             * 무관, 상품 외 설정
             */
            resetOrtherDetail : function(str, xtnTpCd) {
            	var that = this;
            	var xtnAtrbtVrtnCmpsCd    = that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd"]').val();
            	var xtnAtrbtVrtnCmpsNm    = that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd"] option:selected').text();
            	if(xtnTpCd != ""){
            		xtnAtrbtVrtnCmpsCd = xtnTpCd;
            		xtnAtrbtVrtnCmpsNm = that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd"] option:selected').text();
            		
            		$(that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd"]').find("option")).each(function(idx, data) {
            			if(data.value == xtnAtrbtVrtnCmpsCd) {
            				xtnAtrbtVrtnCmpsNm = data.text;
            				return false;
            			}
            		});
            	}




            	// 초기화
				that.resetRestrictionConditionDetail();
			


				var selectBoxParam = {};
				selectBoxParam.className = 'CAPCM120-other-wrap';
				selectBoxParam.targetId = "CAPCM120-other-wrap";
				selectBoxParam.nullYn = "Y";
				selectBoxParam.selectVal = str;


				if(str) {
					selectBoxParam.readonly = true;
				}
				else {
					selectBoxParam.readonly = false;
	            	if(xtnAtrbtVrtnCmpsCd != null && xtnAtrbtVrtnCmpsCd =="08" && xtnTpCd ==""){
	            		xtnAtrbtVrtnCmpsCd    = that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd2"]').val();
	            		xtnAtrbtVrtnCmpsNm    = that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd2"] option:selected').text();
	            	}
				}
				that.$el.find("#other_table_area #other-label").text(xtnAtrbtVrtnCmpsNm);

				$(that.xtnAtrbtVrtnCmpsCdInfoList).each(function(idx, data) {
					that.$el.find("#CAPCM120-other-wrap").attr("data-type", data.cdVal);
					if(xtnAtrbtVrtnCmpsCd === data.cdVal) {
						selectBoxParam.cdNbr = data.cd;
						fn_getCodeList(selectBoxParam, that);
						return false;
					}
				});


				that.$el.find('#restriction-condition-detail-area #pd_table_area').hide();
				that.$el.find('#restriction-condition-detail-area #other_table_area').show();


				that.$el.find("#btn-restriction-condition-detail-reset").prop("readonly", false);
				that.$el.find("#btn-restriction-condition-detail-save").prop("readonly", false);
				that.$el.find("#btn-detail-add").prop("readonly", false);
            },


            /**
             * 상단 그리드 삭제
             */
            saveSearchResult: function (event) {
                var that = this;


            	if (that.deleteList.length == 0) {
            		return;
            	}
            	
            	//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }

            	function deleteData() {
            		var sParam = {};
            		sParam.tblNm = [];


            		var param = {};


            		$(that.deleteList).each(function(index, data) {
            			var sub = {};
            			sub.instCd             		= $.sessionStorage('headerInstCd');
            			sub.tblNm     	        		= data.tblNm;
            			sub.xtnAtrbtNm             = data.xtnAtrbtNm;


            			sParam.tblNm.push(sub);


            			if(index == 0) {
            				param = sub;
            			}
            		});


            		var linkData = {"header": fn_getHeader("CAPCM1208304"), "CaTblMgmtSvcTblXtnAtrbtListIn": sParam};


            		// ajax호출
            		bxProxy.post(sUrl, JSON.stringify(linkData), {
            			enableLoading: true
            			, success: function (responseData) {
            				if (fn_commonChekResult(responseData)) {
            					fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


            					// 재조회
            					param.select = false; // 조회후 선택 여부
            					that.inquireServiceData(param);
            				}
            			}   // end of suucess: fucntion
            		}); // end of bxProxy
            	}


            	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), deleteData, this);
            },


            /**
             * 표준 속성 검증 저장
             */
            saveStandardAttributeValidation: function (event) {
                var that = this;


                 function saveData() {
                     var sParam = {};


                     sParam.instCd = $.sessionStorage('headerInstCd');
                     sParam.tblNm = that.tblNm;
                     sParam.xtnAtrbtNm =  that.$el.find('#standard-attribute-validation-area [data-form-param="xtnAtrbtNm"]').val();
                     sParam.stdAtrbtVldtnUseYn = that.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnUseYn"]').val();


                     console.log(sParam);


                     var linkData = {"header": fn_getHeader("CAPCM1208100"), "CaTblMgmtSvcSaveTblXtnAtrbtIn": sParam};


                     // ajax호출
                     bxProxy.post(sUrl, JSON.stringify(linkData), {
                         enableLoading: true
                         , success: function (responseData) {
                             if (fn_commonChekResult(responseData)) {
                                 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                 // 상단 그리드 재조회
                                 sParam.select = true; // 조회후 선택 여부
                                 that.inquireServiceData(sParam);


                                 // 하단 리셋
                                 that.resetStandardAttributeValidation(); //  표준 속성 검증 초기화
                                 that.resetExtendedTableAttributeValidation(); // 확장테이블 속성 검증 초기화
                                 
                                 that.resetRestrictionConditionGrid(sParam); // 확장테이블 속성 제약조건 그리드 초기화
                                 that.resetRestrictionCondition(); // 확장테이블 송석 제약조건 초기화
                             }
                         }   // end of suucess: fucntion
                     }); // end of bxProxy
                 }


                 fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            /**
             * 확장테이블 속성 검증 저장
             */
            saveExtendedTableAttributeValidation: function (event) {
                var that = this;


                 function saveData() {
                     var sParam = {};
                     sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                     sParam.tblNm = that.tblNm;
                     sParam.xtnAtrbtNm =  that.$el.find('#standard-attribute-validation-area [data-form-param="xtnAtrbtNm"]').val();
                     sParam.xtnAtrbtVrtnCmpsCd = that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd"]').val();
                     sParam.rmkCntnt = that.$el.find('#extended-table-attribute-validation-area [data-form-param="rmkCntnt"]').val();
                     sParam.atrbtVldtnWayCd = that.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnWayCd"]').val();
                     sParam.atrbtVldtnRuleCntnt = that.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnRuleCntnt"]').val();
                     sParam.atrbtVldtnXtnRuleCntnt = that.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnXtnRule"]').val();


                     var linkData = {"header": fn_getHeader("CAPCM1208101"), "CaTblMgmtSvcSaveTblXtnAtrbtIn": sParam};


                     // ajax호출
                     bxProxy.post(sUrl, JSON.stringify(linkData), {
                         enableLoading: true
                         , success: function (responseData) {
                             if (fn_commonChekResult(responseData)) {
                                 fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                 // 상단 그리드 재조회
                                 sParam.select = true; // 조회후 선택 여부
                                 that.inquireServiceData(sParam);


                                 // 하단 리셋
                                 that.resetStandardAttributeValidation(); //  표준 속성 검증 초기화
                                 that.resetExtendedTableAttributeValidation(); // 확장테이블 속성 검증 초기화
                                 that.resetRestrictionConditionGrid(); // 확장테이블 속성 제약조건 그리드 초기화
                                 that.resetRestrictionCondition(); // 확장테이블 송석 제약조건 초기화
                             }
                         }   // end of suucess: fucntion
                     }); // end of bxProxy
                 }


                 fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            /**
             * 확장테이블 속성 제약조건 상세 저장
             */
            saveRestrictionCondition: function () {
            	var that = this;


                function saveData() {
                    var sParam = {};
                    sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                    sParam.tblNm = that.tblNm;
                    sParam.xtnAtrbtNm =  that.$el.find('#standard-attribute-validation-area [data-form-param="xtnAtrbtNm"]').val();
                    sParam.xtnAtrbtVrtnCmpsCd = that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd"]').val();


                    if (sParam.tblNm == '' || sParam.tblNm == undefined) {
                    	fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0024'));
                        return;
                    }


                    if (sParam.xtnAtrbtNm == '' || sParam.xtnAtrbtNm == undefined) {
                        fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0025'));
                        return;
                    }


                    if(sParam.xtnAtrbtVrtnCmpsCd == "01") { // 상품
                    	var pdData = {};
                    	pdData.bizDscd = that.$el.find('#restriction-condition-detail-area [data-form-param="bizDscd"]').val();
                    	pdData.pdTpCd = that.$el.find('#restriction-condition-detail-area [data-form-param="pdTpCd"]').val();
                    	pdData.pdTmpltCd = that.$el.find('#restriction-condition-detail-area [data-form-param="pdTmpltCd"]').val();
                    	pdData.pdCd = that.$el.find('#restriction-condition-detail-area [data-form-param="pdCd"]').val();


                    	pdData.bizDscd = pdData.bizDscd == null ? "" : pdData.bizDscd;
                    	pdData.pdTpCd = pdData.pdTpCd == null ? "" : pdData.pdTpCd;
                    	pdData.pdTmpltCd = pdData.pdTmpltCd == null ? "" : pdData.pdTmpltCd;
                    	pdData.pdCd = pdData.pdCd == null ? "" : pdData.pdCd;


                    	if (pdData.bizDscd == "") {
                            fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0028'));
                            return;
                        }


                    	sParam.jsonKeyValCntnt = JSON.stringify(pdData);
                    }
                    else if(sParam.xtnAtrbtVrtnCmpsCd != "00") { // 무관, 상품 제외
                    	var otherData = {};
                    	var $selectBox = that.$el.find('#restriction-condition-detail-area [data-form-param="CAPCM120-other-wrap"]');


                    	if ($selectBox.val() == "") {
                            fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0028'));
                            return;
                        }


                    	$(that.xtnAtrbtVrtnCmpsCdInfoList).each(function(idx, data) {
                    		if(sParam.xtnAtrbtVrtnCmpsCd === data.cdVal) {
                    			otherData[data.atrbtNm] = $selectBox.val();
        						return false;
        					}
                    	});


                    	sParam.jsonKeyValCntnt = JSON.stringify(otherData);
                    }
                    else {
                    	sParam.jsonKeyValCntnt = "";
                    }


                    if (sParam.xtnAtrbtVrtnCmpsCd != '00' && sParam.jsonKeyValCntnt === '') {
                        fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0028'));
                        return;
                    }


                    sParam.mndtryYn = that.$el.find('#restriction-condition-detail-area [data-form-param="mndtryYn"]').is(":checked") ? "Y" : "N";
                    sParam.scrnInpYn = that.$el.find('#restriction-condition-detail-area [data-form-param="scrnInpYn"]').is(":checked") ? "Y" : "N";
                    sParam.scrnChngAblYn = that.$el.find('#restriction-condition-detail-area [data-form-param="scrnChngAblYn"]').is(":checked") ? "Y" : "N";
                    sParam.custInqryTrgtYn = that.$el.find('#restriction-condition-detail-area [data-form-param="custInqryTrgtYn"]').is(":checked") ? "Y" : "N";
                    sParam.intrnlInqryTrgtYn = that.$el.find('#restriction-condition-detail-area [data-form-param="intrnlInqryTrgtYn"]').is(":checked") ? "Y" : "N";


                    var linkData = {"header": fn_getHeader("CAPCM1208102"), "CaTblMgmtSvcSaveTblXtnAtrbtIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));




//                                
//                                that.inquireDetailData(sParam);
//                                
//                                
//                                that.resetRestrictionConditionDetail(); 


                                // 상단 그리드 재조회
                                sParam.select = true; // 조회후 선택 여부
                                that.inquireServiceData(sParam);
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


              //  fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },




            /**
             * 확장테이블 속성 제약조건 상세 저장
             */
            addRestrictionCondition: function () {
				var that = this;


                var sParam = {};
                var addGridRow = {};
                sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                sParam.tblNm = that.tblNm;
                sParam.xtnAtrbtNm =  that.$el.find('#standard-attribute-validation-area [data-form-param="xtnAtrbtNm"]').val();
                sParam.xtnAtrbtVrtnCmpsCd = that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd"]').val();
                if(sParam.xtnAtrbtVrtnCmpsCd == "08" ){
                	 sParam.xtnAtrbtVrtnCmpsCd = that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd2"]').val();
                }
                sParam.rstrctnCnd  =that.$el.find('#restriction-condition-area [data-form-param="rstrctnCnd"]').val();


                if (sParam.tblNm == '' || sParam.tblNm == undefined) {
                	fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0024'));
                    return;
                }


                if (sParam.xtnAtrbtNm == '' || sParam.xtnAtrbtNm == undefined) {
                    fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0025'));
                    return;
                }






                sParam.mndtryYn = that.$el.find('#restriction-condition-detail-area [data-form-param="mndtryYn"]').is(":checked") ? "Y" : "N";
                sParam.scrnInpYn = that.$el.find('#restriction-condition-detail-area [data-form-param="scrnInpYn"]').is(":checked") ? "Y" : "N";
                sParam.scrnChngAblYn = that.$el.find('#restriction-condition-detail-area [data-form-param="scrnChngAblYn"]').is(":checked") ? "Y" : "N";
                sParam.custInqryTrgtYn = that.$el.find('#restriction-condition-detail-area [data-form-param="custInqryTrgtYn"]').is(":checked") ? "Y" : "N";
                sParam.intrnlInqryTrgtYn = that.$el.find('#restriction-condition-detail-area [data-form-param="intrnlInqryTrgtYn"]').is(":checked") ? "Y" : "N";


                console.log(sParam);
                addGridRow.instCd = sParam.instCd;




                if(sParam.xtnAtrbtVrtnCmpsCd == "01") { // 상품
                	var pdData = {};
                	pdData.bizDscd = that.$el.find('#restriction-condition-detail-area [data-form-param="bizDscd"]').val();
                	pdData.pdTpCd = that.$el.find('#restriction-condition-detail-area [data-form-param="pdTpCd"]').val();
                	pdData.pdTmpltCd = that.$el.find('#restriction-condition-detail-area [data-form-param="pdTmpltCd"]').val();
                	pdData.pdCd = that.$el.find('#restriction-condition-detail-area [data-form-param="pdCd"]').val();


                	pdData.bizDscd = pdData.bizDscd == null ? "" : pdData.bizDscd;
                	pdData.pdTpCd = pdData.pdTpCd == null ? "" : pdData.pdTpCd;
                	pdData.pdTmpltCd = pdData.pdTmpltCd == null ? "" : pdData.pdTmpltCd;
                	pdData.pdCd = pdData.pdCd == null ? "" : pdData.pdCd;


                	if (pdData.bizDscd == "") {
                        fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0028'));
                        return;
                    }


                	sParam.jsonKeyValCntnt = JSON.stringify(pdData);
                }
                else if(sParam.xtnAtrbtVrtnCmpsCd != "00") { // 무관, 상품 제외
                	var otherData = {};
                	var $selectBox = that.$el.find('#restriction-condition-detail-area [data-form-param="CAPCM120-other-wrap"]');


                	if ($selectBox.val() == "") {
                        fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0028'));
                        return;
                    }


                	$(that.xtnAtrbtVrtnCmpsCdInfoList).each(function(idx, data) {
                		if(sParam.xtnAtrbtVrtnCmpsCd === data.cdVal) {
                			otherData[data.atrbtNm] = $selectBox.val();
                			data.prcsngDsVal ='U';
                			sParam.prcsngDsVal ='U';




    						return false;
    					}
                	});


                	sParam.jsonKeyValCntnt = JSON.stringify(otherData);
                }
                else {
                	sParam.jsonKeyValCntnt = "";
                }


                if (sParam.xtnAtrbtVrtnCmpsCd != '00' && sParam.jsonKeyValCntnt === '') {
                    fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0028'));
                    return;
                }
				sParam.cntnt2 = sParam.jsonKeyValCntnt;


            	console.log(sParam.jsonKeyValCntnt);
				if( sParam.xtnAtrbtVrtnCmpsCd != "00"){
        			var parseJsonKeyValCntnt = $.parseJSON(sParam.jsonKeyValCntnt);


        			if(sParam.xtnAtrbtVrtnCmpsCd == "01") { // 상품
        				cntnt = "";
        				if(parseJsonKeyValCntnt.bizDscd) {
        					cntnt += bxMsg('cbb_items.CDVAL#80015'+parseJsonKeyValCntnt.bizDscd);
        				}


        				if(parseJsonKeyValCntnt.pdTpCd) {
        					cntnt += " > "+bxMsg('cbb_items.PDMDL#'+parseJsonKeyValCntnt.bizDscd+""+parseJsonKeyValCntnt.pdTpCd);
        				}


        				if(parseJsonKeyValCntnt.pdTmpltCd) {
        					cntnt += " > "+bxMsg('cbb_items.PDTMPLT#'+parseJsonKeyValCntnt.pdTmpltCd);
    					}


        				if(parseJsonKeyValCntnt.pdCd) {
        					cntnt += " > "+bxMsg('cbb_items.PD#'+parseJsonKeyValCntnt.pdCd);
						}
        			}
        			else if(sParam.xtnAtrbtVrtnCmpsCd != "00") {
        				cntnt = "";
        				$(that.xtnAtrbtVrtnCmpsCdInfoList).each(function(idx2, infoData) {
        					if(sParam.xtnAtrbtVrtnCmpsCd === infoData.cdVal) {
                    			cntnt += bxMsg('cbb_items.AT#'+infoData.atrbtNm);
                    			if( parseJsonKeyValCntnt[infoData.atrbtNm] != null){
                    				cntnt += " > "+bxMsg('cbb_items.CDVAL#'+infoData.cd+""+parseJsonKeyValCntnt[infoData.atrbtNm]);
                    			}		
                    			return false;
        					}


                		});
        			}
				}


                //만약 기존껄 삭제 하고 다시 추가한다고 가정한다면, 삭제 리스트내용에 있는 속성정보를 remove한다.
            	if(this.deleteDetailList.length >=1  ){
              	   $(that.deleteDetailList).each(function(idx, data) {
              		   if(data.jsonKeyValCntnt === sParam.jsonKeyValCntnt ){
              			 that.deleteDetailList.splice(idx, 1);
              			 console.log(that.deleteDetailList);




              		   }
              	   });         
              	}
            	 sParam.xtnAtrbtVrtnCmpsCd = that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd"]').val();
            	//기존에 같은 속성명이 존재한다고 하면 한건만 등록 가능하게끔 해야함.
				 for (var i = 0; i < that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getRange().length; i++){


					 if(that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).data.jsonKeyValCntnt === sParam.jsonKeyValCntnt ){
             		    that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).set('mndtryYn',sParam.mndtryYn );
             		    that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).set('scrnInpYn',sParam.scrnInpYn );
             		    that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).set('scrnChngAblYn',sParam.scrnChngAblYn );
             		    that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).set('custInqryTrgtYn',sParam.custInqryTrgtYn );
             		    that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).set('intrnlInqryTrgtYn',sParam.intrnlInqryTrgtYn );
             		   that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).set('prcsngDsVal','U');
             		    if(that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd"]').val() === '01'){
            				var cntnt = "";
            				if(parseJsonKeyValCntnt.bizDscd) {
            					cntnt += bxMsg('cbb_items.CDVAL#80015'+parseJsonKeyValCntnt.bizDscd);
            				}


            				if(parseJsonKeyValCntnt.pdTpCd) {
            					cntnt += " > "+bxMsg('cbb_items.PDMDL#'+parseJsonKeyValCntnt.bizDscd+""+parseJsonKeyValCntnt.pdTpCd);
            				}


            				if(parseJsonKeyValCntnt.pdTmpltCd) {
            					cntnt += " > "+bxMsg('cbb_items.PDTMPLT#'+parseJsonKeyValCntnt.pdTmpltCd);
        					}


            				if(parseJsonKeyValCntnt.pdCd) {
            					cntnt += " > "+bxMsg('cbb_items.PD#'+parseJsonKeyValCntnt.pdCd);
    						}
            				that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).set('cntnt',cntnt );


             		    }             		


                        //that.saveList.push(currentRecord.data);
             			return;
             		   }
				 }




				sParam.cntnt = cntnt;
				//sParam.flagIndex = this.CAPCM120GridXtnTblAtrbtRstrctnCnd.length + 1;
				sParam.prcsngDsVal ='I';
  				console.log(sParam);
                this.CAPCM120GridXtnTblAtrbtRstrctnCnd.addData(sParam);






                this.$el.find("#CAPCM120GridSearchResult").html(this.CAPCM120GridSearchResult.render({'height': CaGridHeight}));






            },


            saveRestrictionConditionGrid: function () {
            	var that = this;


            	if(that.deleteDetailList.length == 0) {
            		return;
            	}


            	function deleteData() {
            		var sParam = {};
            		sParam.tblNm = [];


            		var param = {};


            		$(that.deleteDetailList).each(function(index, data) {
            			console.log(data);
            			var sub = {};
            			sub.instCd             = $.sessionStorage('headerInstCd');
            			sub.tblNm             = 	data.tblNm;
            			sub.xtnAtrbtNm    = 	data.xtnAtrbtNm;
            			sub.jsonKeyValCntnt    = data.jsonKeyValCntnt;


            			sParam.tblNm.push(sub);


            			if(index == 0) {
            				param = sub;
            			}
            		});


            		var linkData = {"header": fn_getHeader("CAPCM1208305"), "CaTblMgmtSvcTblXtnAtrbtListIn": sParam};


            		// 	ajax호출
            		bxProxy.post(sUrl, JSON.stringify(linkData), {
            			enableLoading: true
            			, success: function (responseData) {
            				if (fn_commonChekResult(responseData)) {
            					fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


//            					
//                                that.inquireDetailData(param);
//                                
//                                
//                                that.resetRestrictionConditionDetail(); 


                                // 상단 그리드 재조회
            					param.select = true; // 조회후 선택 여부
                                that.inquireServiceData(param);
            				}
            			}   // end of suucess: fucntion
            		}); // end of bxProxy
            	}


            	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), deleteData, this);
            },
            /**
             * 확장테이블 속성 제약조건 그리드 저장
             */
            saveRestrictionConditionGrid2: function () {
            	var that = this;
            	var sParam = {};
            	var chngTgtTbl = [];
            	var param ={};
            	var reParam ={};
            	
            	//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }

            	console.log(this.CAPCM120GridXtnTblAtrbtRstrctnCnd.grid.getStore());


				 for (var i = 0; i < that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getRange().length; i++){
					 	if( that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).data.prcsngDsVal === 'I'
					 		|| that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).data.prcsngDsVal === 'U'){
					 		that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).data.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
					 		that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).data.tblNm = that.tblNm;
					 		that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).data.xtnAtrbtNm =  that.$el.find('#standard-attribute-validation-area [data-form-param="xtnAtrbtNm"]').val();
					 		that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).data.xtnAtrbtVrtnCmpsCd = that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd"]').val();
					 		that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).data.rmkCntnt = that.$el.find('#extended-table-attribute-validation-area [data-form-param="rmkCntnt"]').val();
					 		that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).data.atrbtVldtnWayCd = that.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnWayCd"]').val();
					 		that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).data.atrbtVldtnRuleCntnt = that.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnRuleCntnt"]').val();
					 		that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).data.atrbtVldtnXtnRuleCntnt = that.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnXtnRule"]').val();
					 		that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).data.stdAtrbtVldtnUseYn = that.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnUseYn"]').val();
					 		chngTgtTbl.push(that.CAPCM120GridXtnTblAtrbtRstrctnCnd.store.getAt(i).data);
					 	}


      		    }


          		$(that.deleteDetailList).each(function(index, data) {
					console.log(data);
					var sub = {};
					sub = data;
					sub.rmkCntnt =  that.$el.find('#extended-table-attribute-validation-area [data-form-param="rmkCntnt"]').val();
					sub.stdAtrbtVldtnUseYn = that.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnUseYn"]').val();
					sub.xtnAtrbtNm =  that.$el.find('#standard-attribute-validation-area [data-form-param="xtnAtrbtNm"]').val();
					sub.xtnAtrbtVrtnCmpsCd = that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd"]').val();
					sub.rmkCntnt = that.$el.find('#extended-table-attribute-validation-area [data-form-param="rmkCntnt"]').val();
					sub.atrbtVldtnWayCd = that.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnWayCd"]').val();
					sub.atrbtVldtnRuleCntnt = that.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnRuleCntnt"]').val();
					sub.atrbtVldtnXtnRuleCntnt = that.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnXtnRule"]').val();


					chngTgtTbl.push(sub);
				});


             	if( chngTgtTbl.length <= 0){
             		//0인 경우는 속성상세 정보를 변경하는 것이라 기본 공통 구성 값을 변경할수도 있기 때문에 해당 값 적재해줘야함.
             		var sParamDft = {};
             		sParamDft.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
             		sParamDft.tblNm = that.tblNm;
             		sParamDft.xtnAtrbtNm =  that.$el.find('#standard-attribute-validation-area [data-form-param="xtnAtrbtNm"]').val();
             		sParamDft.xtnAtrbtVrtnCmpsCd = that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd"]').val();
             		sParamDft.rmkCntnt = that.$el.find('#extended-table-attribute-validation-area [data-form-param="rmkCntnt"]').val();
             		sParamDft.atrbtVldtnWayCd = that.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnWayCd"]').val();
             		sParamDft.atrbtVldtnRuleCntnt = that.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnRuleCntnt"]').val();
             		sParamDft.atrbtVldtnXtnRuleCntnt = that.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnXtnRule"]').val();
             		sParamDft.stdAtrbtVldtnUseYn = that.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnUseYn"]').val();
             		sParamDft.prcsngDsVal = "U";
             		console.log("default settting :" + sParamDft)
             		chngTgtTbl.push(sParamDft);
             	}
          		sParam.chngTrgtTblNm = chngTgtTbl;
          		console.log(sParam);
          		reParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
          		reParam.tblNm = that.tblNm;
          		reParam.xtnAtrbtNm =  that.$el.find('#standard-attribute-validation-area [data-form-param="xtnAtrbtNm"]').val();
          		reParam.xtnAtrbtVrtnCmpsCd = that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd"]').val();
          		reParam.rmkCntnt = that.$el.find('#extended-table-attribute-validation-area [data-form-param="rmkCntnt"]').val();
         		reParam.atrbtVldtnWayCd = that.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnWayCd"]').val();
         		reParam.atrbtVldtnRuleCntnt = that.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnRuleCntnt"]').val();
         		reParam.atrbtVldtnXtnRuleCntnt = that.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnXtnRule"]').val();
         		reParam.stdAtrbtVldtnUseYn = that.$el.find('#standard-attribute-validation-area [data-form-param="stdAtrbtVldtnUseYn"]').val();


            		var linkData = {"header": fn_getHeader("CAPCM1208103"), "CaTblMgmtSvcSaveTblXtnAtrbListIn": sParam};


            		// 	ajax호출
            		bxProxy.post(sUrl, JSON.stringify(linkData), {
            			enableLoading: true
            			, success: function (responseData) {
            				if (fn_commonChekResult(responseData)) {
            					fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
            					that.deleteDetailList = [];
            					chngTgtTbl =[];
                                // 상단 그리드 재조회




                    			var sParam = {};
                    			sParam.instCd             = $.sessionStorage('headerInstCd');
                    			sParam.tblNm             = 	reParam.tblNm;
                    			sParam.xtnAtrbtNm    = 	reParam.xtnAtrbtNm;
                    			sParam.jsonKeyValCntnt    = reParam.jsonKeyValCntnt;
                                sParam.select = true; // 조회후 선택 여부


                                that.inquireServiceData(sParam);


                                // 하단 리셋
                                that.resetStandardAttributeValidation(); //  표준 속성 검증 초기화
                                that.resetExtendedTableAttributeValidation(); // 확장테이블 속성 검증 초기화
                                that.resetRestrictionConditionGrid(); // 확장테이블 속성 제약조건 그리드 초기화
                                that.resetRestrictionCondition(); // 확장테이블 송석 제약조건 초기화
            				}
            			}   // end of suucess: fucntion
            		}); // end of bxProxy
            	//}


            	//fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), deleteData, this);
            },


            /**
             * 상단 그리드 선택
             */
            selectGridOfSearchResult: function () {
                var selectedRecord = this.CAPCM120GridSearchResult.grid.getSelectionModel().selected.items[0];
                var param = {};


                if (!selectedRecord) {
                    return;
                } else {
                	
                	if( selectedRecord.data.xtnAtrbtVrtnCmpsCd != null && selectedRecord.data.xtnAtrbtVrtnCmpsCd =="08"){
                        this.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd2"]').show();
                	}else{
                		this.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd2"]').hide();
                	}
                	
                    this.setStandardAttributeValidation(selectedRecord.data); // 표준 속성 검증 설정
                    this.setExtendedTableAttributeValidation(selectedRecord.data); // 확장테이블 속성 검증 설정
                    this.inquireDetailData(selectedRecord.data); // 확장테이블 속성 제약조건 조회


                }
            },


            /**
             * 확장테이블 속성 제약조건 그리드 선택
             */
            selectGridOfDetailResult : function() {
            	var selectedRecord = this.CAPCM120GridXtnTblAtrbtRstrctnCnd.grid.getSelectionModel().selected.items[0];


            	if(!selectedRecord) {
            		return;
            	}


            	var xtnAtrbtVrtnCmpsCd = this.xtnAtrbtVrtnCmpsCd;

            	//Actor Type의 경우 
            	if(selectedRecord.data.jsonKeyValCntnt != null && selectedRecord.data.jsonKeyValCntnt  != ""){
            		var parseJsonKeyValCntnt = $.parseJSON(selectedRecord.data.jsonKeyValCntnt);
            		if( parseJsonKeyValCntnt.actorTpCd != null){
            			xtnAtrbtVrtnCmpsCd ="02";
            		}
            	}

            	console.log(selectedRecord);
            	console.log(xtnAtrbtVrtnCmpsCd);


            	if(!selectedRecord.data) {
            		return;
            	}


            	if(xtnAtrbtVrtnCmpsCd == "00") {
            		this.resetDefaultDetail();
            	}
            	else {


            		//selectedRecord.data.prcsngDmrctnVal = 'U';
            		var parseJsonKeyValCntnt = $.parseJSON(selectedRecord.data.jsonKeyValCntnt);


            		if(xtnAtrbtVrtnCmpsCd == "01"|| (selectedRecord.xtnTpCd != "" && selectedRecord.xtnTpCd == "01")) { // 상품
            			this.resetProductDetail();
            			this.$el.find('#restriction-condition-detail-area [data-form-param="bizDscd"]').val(parseJsonKeyValCntnt.bizDscd);
            			this.$el.find('#restriction-condition-detail-area [data-form-param="bizDscd"]').prop("readonly", true);


            			var $selectPdTpCd = this.$el.find('#restriction-condition-detail-area [data-form-param="pdTpCd"]');
                        var $selectPdTmpltCd = this.$el.find('#restriction-condition-detail-area [data-form-param="pdTmpltCd"]');
                        var $selectPdCd = this.$el.find('#restriction-condition-detail-area [data-form-param="pdCd"]');


            			if(parseJsonKeyValCntnt.bizDscd && parseJsonKeyValCntnt.pdTpCd) {
            				var sParam = {};
            				//combobox 정보 셋팅
                            sParam.className = "CAPCM120-pdTpCd-wrap";
                            sParam.targetId = "pdTpCd";
                            sParam.nullYn = "Y";
                            //inData 정보 셋팅
                            sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                            sParam.bizDscd = parseJsonKeyValCntnt.bizDscd;
                            sParam.pdTpCd = "";
                            sParam.pdTmpltCd = "";
                            sParam.pdCd = "";
                            sParam.readonly = true;
                            sParam.selectVal = parseJsonKeyValCntnt.pdTpCd;


                            //상품유형코드 콤보데이터 load
                            fn_getPdCodeList(sParam, this, null);
            			}
            			else {
            				$selectPdTpCd.empty();
                            $selectPdTpCd.val("");
            			}


            			if(parseJsonKeyValCntnt.bizDscd && parseJsonKeyValCntnt.pdTpCd && parseJsonKeyValCntnt.pdTmpltCd) {
            				var sParam = {};
            				//combobox 정보 셋팅
            				sParam.className = "CAPCM120-pdTmpltCd-wrap";
            				sParam.targetId = "pdTmpltCd";
            				sParam.nullYn = "Y";
            				//inData 정보 셋팅
            				sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
            				sParam.bizDscd = parseJsonKeyValCntnt.bizDscd;
            				sParam.pdTpCd = parseJsonKeyValCntnt.pdTpCd;
            				sParam.pdTmpltCd = "";
            				sParam.pdCd = "";
            				sParam.readonly = true;
            				sParam.selectVal = parseJsonKeyValCntnt.pdTmpltCd;


            				//상품템플릿코드 콤보데이터 load
            				fn_getPdCodeList(sParam, this, null);
            			}
            			else {
            				$selectPdTmpltCd.empty();
                            $selectPdTmpltCd.val("");
            			}


            			if(parseJsonKeyValCntnt.bizDscd && parseJsonKeyValCntnt.pdTpCd && parseJsonKeyValCntnt.pdTmpltCd && parseJsonKeyValCntnt.pdCd) {
            				var sParam = {};
            				//combobox 정보 셋팅
                            sParam.className = "CAPCM120-pdCd-wrap";
                            sParam.targetId = "pdCd";
                            sParam.nullYn = "Y";
                            //inData 정보 셋팅
                            sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                            sParam.bizDscd = parseJsonKeyValCntnt.bizDscd;
            				sParam.pdTpCd = parseJsonKeyValCntnt.pdTpCd;
                            sParam.pdTmpltCd = parseJsonKeyValCntnt.pdTmpltCd;
                            sParam.pdCd = "";
                            sParam.readonly = true;
                            sParam.selectVal = parseJsonKeyValCntnt.pdCd;


                            //상품중분류코드 콤보데이터 load
                            fn_getPdCodeList(sParam, this, null);
            			}
            			else {
            				$selectPdCd.empty();
                            $selectPdCd.val("");
            			}
            		}
            		else { // 무관, 상품 외


            			var that = this;
            			var valueCntnt = "";
//            			if(xtnAtrbtVrtnCmpsCd == "08"){
//            				xtnAtrbtVrtnCmpsCd =selectedRecord.data.xtnTpCd;
//            			}
//            			
            
            			$(this.xtnAtrbtVrtnCmpsCdInfoList).each(function(idx, data) {
        					if(xtnAtrbtVrtnCmpsCd === data.cdVal) {
        						console.log(parseJsonKeyValCntnt[data.atrbtNm]);
        						valueCntnt = parseJsonKeyValCntnt[data.atrbtNm];
//        						that.$el.find("#CAPCM120-other-wrap").attr("data-type", data.cdVal);
//        						fn_getCodeList({
//                                    className: 'CAPCM120-other-wrap',
//                                    targetId: "CAPCM120-other-wrap",
//                                    nullYn: 'Y',
//                                    cdNbr: data.cd,
//                                    selectVal : parseJsonKeyValCntnt[data.atrbtNm],
//        							readonly : true
//                                }, that);
        					}
        				});


            			this.resetOrtherDetail(valueCntnt, xtnAtrbtVrtnCmpsCd);
            		}


            		// 여부 설정
            		this.$el.find('#restriction-condition-detail-area [data-form-param="mndtryYn"]').prop("checked", selectedRecord.data.mndtryYn == "Y" ? true : false);
                    this.$el.find('#restriction-condition-detail-area [data-form-param="scrnInpYn"]').prop("checked", selectedRecord.data.scrnInpYn == "Y" ? true : false);
                    this.$el.find('#restriction-condition-detail-area [data-form-param="scrnChngAblYn"]').prop("checked", selectedRecord.data.scrnChngAblYn == "Y" ? true : false);
                    this.$el.find('#restriction-condition-detail-area [data-form-param="custInqryTrgtYn"]').prop("checked", selectedRecord.data.custInqryTrgtYn == "Y" ? true : false);
                    this.$el.find('#restriction-condition-detail-area [data-form-param="intrnlInqryTrgtYn"]').prop("checked", selectedRecord.data.intrnlInqryTrgtYn == "Y" ? true : false);
            	}
            },


            /**
             * 속성 검증 규칙 변경
             */
            changeAttributeValidationRule: function () {
                var atrbtVldtnWayCd         = this.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnWayCd"]').val();


                var $codeSearchButton       = this.$el.find('#extended-table-attribute-validation-area #btn-code-search');
                var $inputAtrbtVldtnRule    = this.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnRuleCntnt"]');
                var $selectAtrbtVldtnRule   = this.$el.find('#extended-table-attribute-validation-area [data-form-param="clHrarcy"]');


                if(atrbtVldtnWayCd == 'C') {
                    $codeSearchButton.show();
                    $inputAtrbtVldtnRule.show();
                    $selectAtrbtVldtnRule.hide();
                } else if(atrbtVldtnWayCd == 'T') {
                    $codeSearchButton.hide();
                    $inputAtrbtVldtnRule.hide();
                    $selectAtrbtVldtnRule.show();
                } else {
                    $codeSearchButton.hide();
                    $inputAtrbtVldtnRule.show();
                    $selectAtrbtVldtnRule.hide();
                }
            },


            /**
             * 분류 선택 박스 변경시 원 속성검증규칙에 데이터를 설정 한다.
             */
            changeClHrarcy: function () {


            	var $inputAtrbtVldtnRule    = this.$el.find('#extended-table-attribute-validation-area [data-form-param="atrbtVldtnRuleCntnt"]');
                var $selectAtrbtVldtnRule   = this.$el.find('#extended-table-attribute-validation-area [data-form-param="clHrarcy"]');


                $inputAtrbtVldtnRule.val($selectAtrbtVldtnRule.val());
            },


            /**
             * 확장속성검증방법코드 변경 시 코드 별로 설정 한다.
             */
            changeXtnAtrbtVrtnCmpsCd: function () {
            	var that = this;
            	var xtnAtrbtVrtnCmpsCd    = that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd"]').val();
            	var xtnAtrbtVrtnCmpsNm    = that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd"] option:selected').text();


            	this.CAPCM120GridXtnTblAtrbtRstrctnCnd.resetData();

            	if( xtnAtrbtVrtnCmpsCd != null && xtnAtrbtVrtnCmpsCd =="08"){
                    this.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd2"]').show();
            	}else{
            		this.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd2"]').hide();
            	}

            	switch (xtnAtrbtVrtnCmpsCd) {
				case "00": // 무관
					that.resetDefaultDetail();
					break;


				case "01" : // 상품
					that.resetProductDetail();
	                break;


				default:
					that.resetOrtherDetail("", "");
					that.$el.find("#CAPCM120-other-wrap").prop("readonly", false);
					break;
				}
            },
            /**
             * 확장속성검증방법코드 변경 시 코드 별로 설정 한다. (해당 경우는 액터의 의무유형코드는 다수의 제약조건을 복합적으로 등록 할 수 있기에 화면에서 핸들링한다.
             */
            changeXtnAtrbtVrtnCmpsCd2: function () {
            	var that = this;
            	var xtnAtrbtVrtnCmpsCd    = that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd2"]').val();
            	var xtnAtrbtVrtnCmpsNm    = that.$el.find('#extended-table-attribute-validation-area [data-form-param="xtnAtrbtVrtnCmpsCd2"] option:selected').text();

            	sParamExnGrid.isNotReset = false;
            	//this.CAPCM120GridXtnTblAtrbtRstrctnCnd.resetData();


            	switch (xtnAtrbtVrtnCmpsCd) {
				case "00": // 무관
					that.resetDefaultDetail();
					break;


				case "01" : // 상품
					that.resetProductDetail();
	                break;


				default:
					that.resetOrtherDetail("","");
					that.$el.find("#CAPCM120-other-wrap").prop("readonly", false);
					break;
				}
            },


            /**
             * 업무 구분 코드 변경
             */
            changeBusinessDistinctCode: function () {
                var sParam = {};
                var bizDscd = this.$el.find('#restriction-condition-detail-area [data-form-param="bizDscd"]').val();


                var $selectPdTpCd = this.$el.find('#restriction-condition-detail-area [data-form-param="pdTpCd"]');
                var $selectPdTmpltCd = this.$el.find('#restriction-condition-detail-area [data-form-param="pdTmpltCd"]');
                var $selectPdCd = this.$el.find('#restriction-condition-detail-area [data-form-param="pdCd"]');


                if (bizDscd == "") {
                    //상품유형코드 초기화
                    $selectPdTpCd.empty();
                    $selectPdTpCd.val("");
                } else {
                    //combobox 정보 셋팅
                    sParam.className = "CAPCM120-pdTpCd-wrap";
                    sParam.targetId = "pdTpCd";
                    sParam.nullYn = "Y";
                    //inData 정보 셋팅
                    sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                    sParam.bizDscd = bizDscd;
                    sParam.pdTpCd = "";
                    sParam.pdTmpltCd = "";
                    sParam.pdCd = "";
                    //상품유형코드 콤보데이터 load
                    fn_getPdCodeList(sParam, this, null, this.changeProductTypeCode);
                }


                //상품템플릿코드, 상품코드 초기화
                $selectPdTmpltCd.empty();
                $selectPdTmpltCd.val("");


                $selectPdCd.empty();
                $selectPdCd.val("");
            },


            /**
             * 상품 유형 코드 변경
             */
            changeProductTypeCode: function (str) {
            	var that = this;


            	if(str.$el !== undefined) {
            		that = str;
            	}


                var sParam = {};
                var bizDscd = that.$el.find('#restriction-condition-detail-area [data-form-param="bizDscd"]').val();
                var pdTpCd = that.$el.find('#restriction-condition-detail-area [data-form-param="pdTpCd"]').val();


                var $selectPdTmpltCd = that.$el.find('#restriction-condition-detail-area [data-form-param="pdTmpltCd"]');
                var $selectPdCd = that.$el.find('#restriction-condition-detail-area [data-form-param="pdCd"]');




                if (pdTpCd == "") {
                    //상품템플릿코드 초기화
                    $selectPdTmpltCd.empty();
                    $selectPdTmpltCd.val("");
                } else {
                    //combobox 정보 셋팅
                    sParam.className = "CAPCM120-pdTmpltCd-wrap";
                    sParam.targetId = "pdTmpltCd";
                    sParam.nullYn = "Y";
                    //inData 정보 셋팅
                    sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                    sParam.bizDscd = bizDscd;
                    sParam.pdTpCd = pdTpCd;
                    sParam.pdTmpltCd = "";
                    sParam.pdCd = "";
                    //상품템플릿코드 콤보데이터 load
                    fn_getPdCodeList(sParam, that);
                }


                //상품코드 초기화
                $selectPdCd.empty();
                $selectPdCd.val("");
            },


            /**
             * 상품 템플릿 코드 변경
             */
            changeProductTemplateCode: function () {
                var sParam = {};
                // 상품대분류코드
                var bizDscd = this.$el.find('#restriction-condition-detail-area [data-form-param="bizDscd"]').val();
                var pdTpCd = this.$el.find('#restriction-condition-detail-area [data-form-param="pdTpCd"]').val();
                var pdTmpltCd = this.$el.find('#restriction-condition-detail-area [data-form-param="pdTmpltCd"]').val();


                var $selectPdCd = this.$el.find('#restriction-condition-detail-area [data-form-param="pdCd"]');


                if (pdTmpltCd == "") {
                    //상품템플릿코드 초기화
                    $selectPdCd.empty();
                    $selectPdCd.val("");
                } else {
                    //combobox 정보 셋팅
                    sParam.className = "CAPCM120-pdCd-wrap";
                    sParam.targetId = "pdCd";
                    sParam.nullYn = "Y";
                    //inData 정보 셋팅
                    sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                    sParam.bizDscd = bizDscd;
                    sParam.pdTpCd = pdTpCd;
                    sParam.pdTmpltCd = pdTmpltCd;
                    sParam.pdCd = "";
                    //상품중분류코드 콤보데이터 load
                    fn_getPdCodeList(sParam, this);
                }
            },


            /**
             * 트리 열기
             */
            showTree: function () {
                this.$el.find('.col1').show();
                this.$el.find('.col2').css('left', '260px');
                this.$el.find('#btn-tree-show').hide();
            },


            /**
             * 트리 접기
             */
            hideTree: function () {
                this.$el.find('.col1').hide();
                this.$el.find('.col2').css('left', '30px');
                this.$el.find('#btn-tree-show').show();
            },


            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find("#search-result-area"), this.$el.find('#btn-search-result-toggle'));
            },


            toggleStandardAttributeValidation: function () {
                fn_pageLayerCtrl(this.$el.find("#standard-attribute-validation-area"), this.$el.find('#btn-standard-attribute-validation-toggle'));
            },


            toggleExtendedTableAttributeValidation: function () {
                fn_pageLayerCtrl(this.$el.find("#extended-table-attribute-validation-area"), this.$el.find('#btn-extended-table-attribute-validation-toggle'));
            },


            toggleRestrictionCondition: function () {
                fn_pageLayerCtrl(this.$el.find("#restriction-condition-area"), this.$el.find('#btn-restriction-condition-toggle'));
            },


            downloadExcelFile: function () {
            	this.CAPCM120GridSearchResult.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM120')+"_"+getCurrentDate("yyyy-mm-dd"));
            }
        }); // end of Backbone.View.extend({


        return CAPCM120View;
    } // end of define function
); // end of define
