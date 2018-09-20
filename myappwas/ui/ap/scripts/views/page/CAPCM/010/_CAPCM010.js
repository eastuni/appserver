define(
    [
        'bx/common/config', 
        'text!app/views/page/CAPCM/010/_CAPCM010.html',
        'bx-component/ext-grid/_ext-grid',
        'app/views/page/popup/CAPCM/popup-code-search',
        'app/views/page/popup/CAPCM/popup-class-search',
        'bx/common/common-info'
    ]
    , function (
        config,
        tpl,
        ExtGrid,
        PopupCodeSearch,
        PopupClassSearch,
        commonInfo
    ) {


        /**
         * Backbone
         */
        var CAPCM010View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section',
            // 클래스이름 설정
            className: 'bx-container CAPCM010-page',
            // 탬플릿 설정
            templates: {
                'tpl': tpl
            },
            // 이벤트 설정
            events: {
                'change .CAPCM010-vldtnWay-wrap': 'changeValidationWay',
                'change .CAPCM010-atrbtTp-wrap': 'changeAttributeTypeInBaseAttribute',


                'click #btn-code-search': 'openCodeSearchPopup',
                'click #btn-class-search': 'openClassSearchPopup',


                'click #btn-attribute-code-create': 'createAttributeCode',
                'click #btn-base-attribute-save': 'saveBaseAttribute',


                'click #btn-search-condition-inquire': 'inquireStandardAttribute',


                'click #btn-search-condition-reset': 'resetSearchCondition',
                'click #btn-base-attribute-reset': 'resetBaseAttribute',


                'click #btn-search-result-save': 'saveSearchResult',
                'click #btn-search-result-excel': 'downloadGridDataWithExcel',


                'click #btn-search-condition-toggle': 'toggleSearchCondition',
                'click #btn-additional-search-condition-toggle': 'toggleAdditionalSearchCondition',
                'click #btn-search-result-toggle': 'toggleSearchResult',
                'click #btn-base-attribute-toggle': 'toggleBaseAttribute',
				'keydown #searchKey' : 'fn_enter'
            }


            /**
             * initialize
             */
            , initialize: function (initData) {
                this.deleteList = [];
                this.isBaseAttributeModified = false;


                $.extend(this, initData);


                this.createGrid();
            },


            /**
             * render
             */
            render: function () {
                this.$el.html(this.tpl());
                this.$el.find("#CAPCM010Grid").html(this.CAPCM010Grid.render({'height': CaGridHeight}));


                this.$divValidationRule     = this.$el.find('#base-attribute-area #div-validation-rule');
                this.$selectValidationRule  = this.$el.find('#base-attribute-area #CAPCM010-vldtnRule-wrap');
                this.$inputValidationRule   = this.$el.find('#base-attribute-area #input-validation-rule');
                this.$buttonCodeSearch      = this.$el.find('#base-attribute-area #btn-code-search');


                this.setComboBoxes();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPCM010-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPCM010-wrap #btn-base-attribute-save')
                                    			   ]);

                return this.$el;
            },


            createGrid: function () {
                var that = this;


                that.CAPCM010Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'atrbtNm', 'useLngAtrbtNm', 'atrbtTpCd', 'atrbtVldtnWayCd', 'srvcInpVldtnMndtryYn',
                        'engAtrbtNm', 'atrbtLen', 'dcmlPntLen', 'parntAtrbtNm', 'atrbtVldtnWayCd', 'atrbtVldtnRuleCntnt', 'atrbtVldtnXtnRuleCntnt',
                        'prflDscd', 'maskTpCd', 'encrptnTpCd'],
                    id: 'CAPCM010Grid',
                    columns: [
                        {
                            text: 'No.',
                            dataIndex: 'rowIndex',
                            sortable: false,
                            width: 80,
                            height: 25,
                            style: 'text-align:center',
                            align: 'center',
                            // other config you need....
                            renderer: function (value, metaData, record, rowIndex) {
                                return rowIndex + 1;
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#atrbt'),
                            flex: 1,
                            dataIndex: 'atrbtNm',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#loginLngAtrbtNm'),
                            flex: 1,
                            dataIndex: 'useLngAtrbtNm',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#atrbtType'),
                            flex: 1,
                            dataIndex: 'atrbtTpCd',
                            style: 'text-align:center',
                            align: 'center',
                            code: '10001',
                            renderer: function (val) {
                                return val ? bxMsg('cbb_items.CDVAL#10001' + val) : '';
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#atrbtVldtnWay'),
                            flex: 1,
                            dataIndex: 'atrbtVldtnWayCd',
                            style: 'text-align:center',
                            align: 'center',
                            code: '10002',
                            renderer: function (val) {
                                return val ? bxMsg('cbb_items.CDVAL#10002' + val) : '';
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#srvcInpVldtnMndtryYn'),
                            flex: 1,
                            dataIndex: 'srvcInpVldtnMndtryYn',
                            style: 'text-align:center',
                            align: 'center',
                            renderer : function(val) {
                                var classNm = "s-no";


                                if(val =="Y") {
                                    classNm = "s-yes";
                                }


                                return "<span class=\"bw-sign "+classNm+"\">"+val+"</span>";
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#maskTpCd'),
                            flex: 1,
                            dataIndex: 'maskTpCd',
                            style: 'text-align:center',
                            align: 'center',
                            code: 'A1129',
                            renderer: function (val) {
                                return val ? bxMsg('cbb_items.CDVAL#A1129' + val) : '';
                            }
                        },
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
                                clicksToEdit: 2
                                , listeners: {
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


            createAttributeCode: function () {
                var that = this;
                var sParam = {};


                sParam.engAtrbtNm = this.$el.find('#base-attribute-area [data-form-param="atrbtNm"]').val();


                var linkData = {"header": fn_getHeader("CAPCM0108402"), "CaStdAtrbtMgmtSvcGenerateStdAtrbtNmIn": sParam};


                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: false,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var data = responseData.CaStdAtrbtMgmtSvcGenerateStdAtrbtNmOut;


                            if (data != null || data.length > 0) {
                                that.$el.find('#base-attribute-area [data-form-param="atrbtCd"]').val(data.atrbtNm);
//                                that.$el.find('[data-form-param="engAtrbtNm"]').val(data.engAtrbtNm);
                                that.$el.find('#base-attribute-area [data-form-param="parntAtrbtCd"]').val(data.parntAtrbtNm);
//                                if( data.parntAtrbtLen > 0){
//                                	that.$el.find('#base-attribute-area [data-form-param="atrbtLen"]').val(data.parntAtrbtLen);
//                                }
                            }
//
//                            if (data.atrbtNm != null) {
//                                that.$el.find('#base-attribute-area [data-form-param="atrbtCd"]').val(data.atrbtNm);
//                            }
                        }
                    }
                })
            },


            setComboBoxes: function () {
                var sParam = {};


                sParam = {};
                sParam.className = "CAPCM010-atrbtType-wrap";
                sParam.targetId = "atrbtTp";
                sParam.nullYn = "Y";
                sParam.cdNbr = "10001";
                fn_getCodeList(sParam, this);   // 속성타입코드


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM010-atrbtVldtnWay-wrap";
                sParam.targetId = "atrbtVldtnWay";
                sParam.nullYn = "Y";
                sParam.cdNbr = "10002";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 속성검증방법코드


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM010-srvcInpVldtnMndtryYn-wrap";
                sParam.targetId = "srvcInpVldtnMndtryYn";
                sParam.nullYn = "Y";
                sParam.cdNbr = "10000"; // 여부
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM010-atrbtTp-wrap";
                sParam.targetId = "atrbtTp";
                sParam.nullYn = "Y";
                sParam.cdNbr = "10001";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 속성타입코드


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM010-vldtnWay-wrap";
                sParam.targetId = "vldtnWay";
                sParam.nullYn = "Y";
                sParam.cdNbr = "10002";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 속성검증방법코드


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM010-vldtnRule-wrap";
                sParam.targetId = "clHrarcy";
                sParam.nullYn = "Y";
                sParam.cdNbr = "A0112";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 분류체계코드

                
                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM010-prflDscd-wrap";
                sParam.targetId = "prflDscd";
                sParam.nullYn = "Y";
                sParam.cdNbr = "A0903";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 프로파일구분

                
                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM010-maskYn-wrap";
                sParam.targetId = "maskYn";
                sParam.nullYn = "Y";
                sParam.cdNbr = "10000";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 마스킹여부

                
                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM010-maskTpCd-wrap";
                sParam.targetId = "maskTpCd";
                sParam.nullYn = "Y";
                sParam.cdNbr = "A1129";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 마스킹유형코드

                
                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM010-maskTpCd-wrap";
                sParam.targetId = "maskTpCd";
                sParam.nullYn = "Y";
                sParam.cdNbr = "A1129";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 마스킹유형코드

                
                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM010-encrptnTpCd-wrap";
                sParam.targetId = "encrptnTpCd";
                sParam.nullYn = "Y";
                sParam.cdNbr = "A1130";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 프로파일구분
            },


            setBaseAttribute: function (data) {
                this.$el.find('#base-attribute-area [data-form-param="atrbtNm"]').val(data.engAtrbtNm);
                this.$el.find('#base-attribute-area [data-form-param="atrbtCd"]').val(data.atrbtNm);
                this.$el.find('#base-attribute-area [data-form-param="loginLngAtrbtNm"]').val(data.useLngAtrbtNm);
                this.$el.find('#base-attribute-area [data-form-param="atrbtTp"]').val(data.atrbtTpCd);
                this.$el.find('#base-attribute-area [data-form-param="atrbtLen"]').val(data.atrbtLen);
                this.$el.find('#base-attribute-area [data-form-param="dcmlPntLen"]').val(data.dcmlPntLen);
                this.$el.find('#base-attribute-area [data-form-param="parntAtrbtCd"]').val(data.parntAtrbtNm);
                this.$el.find('#base-attribute-area [data-form-param="vldtnWay"]').val(data.atrbtVldtnWayCd);
                this.$el.find('#base-attribute-area [data-form-param="xtnVldtnRule"]').val(data.atrbtVldtnXtnRuleCntnt);
                this.$el.find('#base-attribute-area [data-form-param="prflDscd"]').val(data.prflDscd);
                this.$el.find('#base-attribute-area [data-form-param="maskTpCd"]').val(data.maskTpCd);
                this.$el.find('#base-attribute-area [data-form-param="encrptnTpCd"]').val(data.encrptnTpCd);


                this.changeValidationWay();


                if(data.atrbtVldtnWayCd =='T') {
                    this.$selectValidationRule.val(data.atrbtVldtnRuleCntnt);


                } else {


                    this.$inputValidationRule.val(data.atrbtVldtnRuleCntnt);
                }


                if(data.atrbtTpCd =='NU' ){
                	 this.$el.find('#base-attribute-area [data-form-param="dcmlPntLen"]').prop('readonly', false);
                }else{
                	this.$el.find('#base-attribute-area [data-form-param="dcmlPntLen"]').prop('readonly', true);
                }


                if(data.srvcInpVldtnMndtryYn == 'Y') {
                    this.$el.find('#base-attribute-area [data-form-param="srvcInpVldtnMndtryYn"]').prop('checked', true);
                } else {
                    this.$el.find('#base-attribute-area [data-form-param="srvcInpVldtnMndtryYn"]').prop('checked', false);
                }


                this.isBaseAttributeModified = true;
            },


            selectGridRecord: function () {
                var selectedData = this.CAPCM010Grid.grid.getSelectionModel().selected.items[0].data;


                if(selectedData == null) {
                	return;
                }


                this.setBaseAttribute(selectedData);
            },


            changeValidationWay: function () {
                var code = this.$el.find('#base-attribute-area [data-form-param="vldtnWay"]').val(); //속성검증방법


                this.$inputValidationRule.val("");


                if (code == "C") {       // 코드인스턴스검증
                    this.$divValidationRule.addClass('add-btn');
                    this.$buttonCodeSearch.show();
                    this.$inputValidationRule.show();
                    this.$selectValidationRule.hide();
                } else if(code == "T") { // 분류체계검증
                    this.$divValidationRule.removeClass('add-btn');
                    this.$buttonCodeSearch.hide();
                    this.$inputValidationRule.hide();
                    this.$selectValidationRule.show();
                } else {                 // others
                    this.$divValidationRule.removeClass('add-btn');
                    this.$buttonCodeSearch.hide();
                    this.$inputValidationRule.show();
                    this.$selectValidationRule.hide();
                }
            },


            changeAttributeTypeInBaseAttribute: function (e) {
                var code = $(e.target).val();
                var $inputDecimalPlaceLength = this.$el.find('#base-attribute-area [data-form-param="dcmlPntLen"]');


                $inputDecimalPlaceLength.val("");


                console.log(code);
                if(code == "NU") {
                    $inputDecimalPlaceLength.prop('readonly', false);
                } else {
                    $inputDecimalPlaceLength.prop('readonly', true);
                }


                /*
                 * 2016-12-12 요청사항 : YN(여부)의 경우에는 디폴트로 코드인스턴스 검증방법에 여부(1000)셋팅
                 */
                if( code == "YN"){
                	this.$el.find('#base-attribute-area [data-form-param="vldtnWay"]').val("C");
                	this.changeValidationWay();
                	this.$el.find('#base-attribute-area [data-form-param="vldtnRule"]').val("10000");
                	this.$el.find('#base-attribute-area [data-form-param="vldtnWay"]').prop('readonly', true);
                	this.$el.find('#base-attribute-area [data-form-param="vldtnRule"]').prop('readonly', true);


                }else{
                	this.$el.find('#base-attribute-area [data-form-param="vldtnWay"]').val("");
                	this.changeValidationWay();
                	this.$el.find('#base-attribute-area [data-form-param="vldtnRule"]').val("");
                	this.$el.find('#base-attribute-area [data-form-param="vldtnWay"]').prop('readonly', false);
                	this.$el.find('#base-attribute-area [data-form-param="vldtnRule"]').prop('readonly', false);


                }


            },


            /**
             * open pop-up for code search
             */
            openCodeSearchPopup: function() {
                var that = this;
                var param = {};


                param.code = this.$inputValidationRule.val();
                this.popupCodeSearch = new PopupCodeSearch(param);
                this.popupCodeSearch.render();
                this.popupCodeSearch.on('popUpSetData', function (data) {
                    that.$inputValidationRule.val(data.cdNbr);
                });
            },


            openClassSearchPopup: function () {
                var that = this;
                var sParam ={};
                sParam.useSubsetCdYn = 'Y';                
                this.popupClassSearch = new PopupClassSearch(sParam);
                this.popupClassSearch.render();
                this.popupClassSearch.on('popUpSetData', function (data) {
                    that.$el.find('#base-attribute-area [data-form-param="xtnVldtnRule"]').val(data.classNm);
                });
            },


            resetSearchCondition: function () {
                this.$el.find('#search-condition-area [data-form-param="atrbtCode"]').val("");
                this.$el.find('#search-condition-area [data-form-param="loginLngAtrbtNm"]').val("");
                this.$el.find('#search-condition-area [data-form-param="atrbtType"]').val("");
                this.$el.find('#search-condition-area [data-form-param="atrbtVldtnWay"] option:eq(0)').attr('selected', 'selected');
                this.$el.find('#search-condition-area [data-form-param="srvcInpVldtnMndtryYn"] option:eq(0)').attr('selected', 'selected');
                this.$el.find('#search-condition-area [data-form-param="maskYn"] option:eq(0)').attr('selected', 'selected');
            },


            resetBaseAttribute: function () {
                this.$el.find('#base-attribute-area [data-form-param="atrbtNm"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="atrbtCd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="loginLngAtrbtNm"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="atrbtTp"] option:eq(0)').attr('selected', 'selected');
                this.$el.find('#base-attribute-area [data-form-param="atrbtLen"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="dcmlPntLen"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="parntAtrbtCd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="vldtnWay"] option:eq(0)').attr('selected', 'selected');
                this.$el.find('#base-attribute-area #CAPCM010-vldtnRule-wrap option:eq(0)').attr('selected', 'selected');
                this.$el.find('#base-attribute-area [data-form-param="vldtnRule"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="xtnVldtnRule"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="prflDscd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="srvcInpVldtnMndtryYn"]').prop("checked", false);
                this.$el.find('#base-attribute-area [data-form-param="maskTpCd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="encrptnTpCd"]').val("");


                this.$buttonCodeSearch.hide();
                this.$selectValidationRule.hide();
                this.$inputValidationRule.show();


                this.isBaseAttributeModified = false;
            },


            inquireStandardAttribute: function () {
                // header 정보 set
                var that = this;
                var sParam = {};


                sParam.atrbtNm              = this.$el.find('#search-condition-area [data-form-param="atrbtCode"]').val();
                sParam.useLngAtrbtNm        = this.$el.find('#search-condition-area [data-form-param="loginLngAtrbtNm"]').val();
                sParam.atrbtTpCd            = this.$el.find('#search-condition-area [data-form-param="atrbtType"]').val();
                sParam.atrbtVldtnWayCd      = this.$el.find('#search-condition-area [data-form-param="atrbtVldtnWay"]').val();
                sParam.srvcInpVldtnMndtryYn = this.$el.find('#search-condition-area [data-form-param="srvcInpVldtnMndtryYn"]').val();
                sParam.maskYn               = this.$el.find('#search-condition-area [data-form-param="maskYn"]').val();


                console.log(sParam);


                if (fn_isEmpty(sParam.atrbtNm) && fn_isEmpty(sParam.useLngAtrbtNm) && fn_isEmpty(sParam.atrbtTpCd)&& fn_isEmpty(sParam.atrbtVldtnWayCd)) {
                	fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0014'));
                    return;
                }


                var linkData = {"header": fn_getHeader("CAPCM0108401"), "CaStdAtrbtMgmtSvcGetStdAtrbtListIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var atrbtList = responseData.CaStdAtrbtMgmtSvcGetStdAtrbtListOut.atrbtList;
                            var totCnt = atrbtList.length;
                            // 서비스 입력항목
                            that.resetBaseAttribute();
                            if (atrbtList != null || atrbtList.length > 0) {
                                that.CAPCM010Grid.setData(atrbtList);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                // 삭제 로우 초기화
                                that.deleteList = [];
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            saveSearchResult: function () {
                if(this.deleteList.length < 1) return;


                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var deleteList = [];
                    var sParam = {};


                    $(that.deleteList).each(function(idx, data) {
                        var sub = {};
                        sub.atrbtNm = data.atrbtNm;
                        deleteList.push(sub);
                    });


                    sParam.tblNm = deleteList;


                    var linkData = {"header": fn_getHeader("CAPCM0108301"), "CaStdAtrbtMgmtSvcDeleteStdAtrbtIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                // 재조회
                                that.inquireStandardAttribute();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), saveData, this);
            },


            saveBaseAttribute: function (event) {
                var that = this;
                var sParam = {};
                sParam.atrbtTpCd      = that.$el.find('#base-attribute-area [data-form-param="atrbtTp"]').val();
                sParam.useLngAtrbtNm  = that.$el.find('#base-attribute-area [data-form-param="loginLngAtrbtNm"]').val();
                sParam.atrbtLen       = that.$el.find('#base-attribute-area [data-form-param="atrbtLen"]').val();
                sParam.parntAtrbtNm   = that.$el.find('#base-attribute-area [data-form-param="parntAtrbtCd"]').val();
                sParam.prflDscd       = that.$el.find('#base-attribute-area [data-form-param="prflDscd"]').val();
                sParam.maskTpCd       = that.$el.find('#base-attribute-area [data-form-param="maskTpCd"]').val();
                sParam.encrptnTpCd    = that.$el.find('#base-attribute-area [data-form-param="encrptnTpCd"]').val();


                //길이 체크
                if(sParam.atrbtTpCd == "NU" || sParam.atrbtTpCd == "TX" || sParam.atrbtTpCd == "AN"|| sParam.atrbtTpCd == "PW"|| sParam.atrbtTpCd == "TN"){
                	if(fn_isEmpty(sParam.atrbtLen)|| sParam.atrbtLen =="0"){
                		if( fn_isEmpty(sParam.parntAtrbtNm) ){
                    		fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#atrbtLen") + "]");
                            return;	
                		}
                	}
                }


                if( fn_isEmpty( sParam.useLngAtrbtNm)){
                	fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0004") + "[" + bxMsg("cbb_items.SCRNITM#loginLngAtrbtNm") + "]");
                    return;
                }

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var sParam = {};
                    var srvcCd;


                    if (that.isBaseAttributeModified) {
                        //수정
                        srvcCd = "CAPCM0108201";
                    } else {
                        //등록
                        srvcCd = "CAPCM0108101";
                    }


                    sParam.useLngAtrbtNm = that.$el.find('#base-attribute-area [data-form-param="loginLngAtrbtNm"]').val();
                    sParam.engAtrbtNm = that.$el.find('#base-attribute-area [data-form-param="atrbtNm"]').val();


                    //표준속성검증
                    if (that.$el.find('#base-attribute-area [data-form-param="srvcInpVldtnMndtryYn"]').is(':checked')) {
                        sParam.srvcInpVldtnMndtryYn = "Y";
                    } else {
                        sParam.srvcInpVldtnMndtryYn = "N";
                    }


                    if (that.$el.find('#base-attribute-area [data-form-param="parntAtrbtCd"]').val()) {
                        sParam.parntAtrbtOvrrdYn = "Y";
                    } else {
                        sParam.parntAtrbtOvrrdYn = "N";
                    }


                    sParam.atrbtNm         = that.$el.find('#base-attribute-area [data-form-param="atrbtCd"]').val();
                    sParam.atrbtTpCd       = that.$el.find('#base-attribute-area [data-form-param="atrbtTp"]').val();
                    sParam.atrbtLen        = that.$el.find('#base-attribute-area [data-form-param="atrbtLen"]').val();
                    sParam.dcmlPntLen      = that.$el.find('#base-attribute-area [data-form-param="dcmlPntLen"]').val();
                    sParam.atrbtVldtnWayCd = that.$el.find('#base-attribute-area [data-form-param="vldtnWay"]').val();
                    sParam.prflDscd        = that.$el.find('#base-attribute-area [data-form-param="prflDscd"]').val();
                    sParam.maskTpCd        = that.$el.find('#base-attribute-area [data-form-param="maskTpCd"]').val();
                    sParam.encrptnTpCd     = that.$el.find('#base-attribute-area [data-form-param="encrptnTpCd"]').val();


                    if(sParam.atrbtVldtnWayCd == "T") {
                        sParam.atrbtVldtnRuleCntnt = that.$el.find('#base-attribute-area #CAPCM010-vldtnRule-wrap').val();
                    } else {
                        sParam.atrbtVldtnRuleCntnt = that.$el.find('#base-attribute-area [data-form-param="vldtnRule"]').val();
                    }


                    sParam.atrbtVldtnXtnRuleCntnt = that.$el.find('#base-attribute-area [data-form-param="xtnVldtnRule"]').val();
                    sParam.parntAtrbtNm = that.$el.find('#base-attribute-area [data-form-param="parntAtrbtCd"]').val();


                    var linkData = {"header": fn_getHeader(srvcCd), "CaStdAtrbtMgmtSvcRegisterStdAtrbtIn": sParam};


                    //ajax 호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true,
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            }
                        }
                    });
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            downloadGridDataWithExcel: function () {
                this.CAPCM010Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPCM010')+"_"+getCurrentDate("yyyy-mm-dd"));
            },


            toggleSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find('#search-condition-area'), this.$el.find('#btn-search-condition-toggle'));
            },


            toggleAdditionalSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find('#additional-search-condition-area'), this.$el.find('#btn-additional-search-condition-toggle'));
            },


            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find('#btn-search-result-toggle'));
            },


            toggleBaseAttribute: function () {
                fn_pageLayerCtrl(this.$el.find('#base-attribute-area'), this.$el.find('#btn-base-attribute-toggle'));
            }
            /**
             * 엔터 입력 처리를 위한 콜백함수
             */
            ,fn_enter: function (event) {
                var that = this;
                var event = event || window.event;
                var keyID = (event.which) ? event.which : event.keyCode;
                if(keyID == 13) { //enter
                	that.inquireStandardAttribute();
                }
            }
        }); // end of Backbone.View.extend({


        return CAPCM010View;
    } // end of define function
)
; // end of define
