define(
    [
        'bx/common/config',
        'text!app/views/page/CAPCM/005/_CAPCM005.html',
        'bx-component/ext-grid/_ext-grid',
        'bx-component/bx-tree/bx-tree',
        'bx/common/common-info',
        'app/views/page/popup/CAPAC/popup-refAtrbt-search',
        'app/views/page/popup/CAPCM/popup-class-search'
    ]
    , function (
        config,
        tpl,
        ExtGrid,
        bxTree,
        commonInfo,
        PopupRefAtrbtSrch,
        PopupClassSrch
    ) {


        /**
         * Backbone
         */
        var CAPCM005View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPCM005-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'keydown #searchKey': 'pressEnterInTree',


                'click #btn-numbering-rule-composition-up': 'upSelectedRow',
                'click #btn-numbering-rule-composition-down': 'downSelectedRow',


                'click #btn-base-attribute-reset': 'resetBaseAttribute',
                'click #btn-numbering-rule-composition-attribute-reset': 'resetNumberingRuleCompositionAttribute',


                'click #btn-base-attribute-save': 'saveBaseAttribute',
                'click #btn-numbering-rule-composition-save': 'saveNumberingRuleComposition',
                'click #btn-numbering-rule-composition-attribute-save': 'saveNumberingRuleCompositionAttribute',


                'click #btn-base-attribute-delete': 'deleteBaseAttribute',
                'click #btn-reference-attribute-search': 'openReferenceAttributeSearchPopup',
                'click #btn-class-search': 'openClassSearchPopup',


                'click #btn-tree-search': 'searchTreeList',


                'click #btn-tree-hide': 'hideTree',
                'click #btn-tree-show': 'showTree',


                'click #btn-base-attribute-toggle': 'toggleBaseAttribute',
                'click #btn-numbering-rule-composition-toggle': 'toggleNumberingRuleComposition',
                'click #btn-numbering-rule-composition-attribute-toggle': 'toggleNumberingRuleCompositionAttribute'
            },


            /**
             * 초기화
             */
            initialize: function (initData) {
                $.extend(this, initData);


                this.initData = initData;
                this.deleteList = [];
                this.isNewNumbering = true;
                this.isNewNumberingRuleAttribute = true;


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
                this.$el.find('.bx-tree-root').html(this.CAPCM005Tree.render());


                // 단일탭 그리드 렌더
                this.$el.find("#CAPCM005Grid").html(this.CAPCM005Grid.render({'height': CaGridHeight}));


                this.loadTreeList();
                this.setComboBoxes();
                this.setDatePicker();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPCM005-wrap #btn-base-attribute-save')
                                    		,this.$el.find('.CAPCM005-wrap #btn-base-attribute-delete')
                                    		,this.$el.find('.CAPCM005-wrap #btn-numbering-rule-composition-save')
                                    		,this.$el.find('.CAPCM005-wrap #btn-numbering-rule-composition-attribute-save')
                                    			   ]);
                return this.$el;
            },


            /**
             * 트리 생성
             */
            createTree: function () {
                var that = this;


                this.CAPCM005Tree = new bxTree({
                    fields: {id: 'nbrgAtrbtNm', value: 'nbrgAtrbtLngChngNm'},


                    // Tree Item - Checkbox Use Yn
                    checkAble: false,


                    listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {
                            that.inquireNumberingData(itemData);
                        }
                    }
                });
            },


            /**
             * 그리드 생성
             */
            createGrid: function () {
                var that = this;


                this.CAPCM005Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['nbrgTierYn', 'nbrgCmpsMthdCd', 'fixedTxtCntnt', 'refAtrbtNm', 'refStartPstnCnt',
                        'refFgrsCnt', 'cmpsStartPstnCnt', 'cmpsFgrsCnt', 'startNbr', 'cmpsSeqNbr', 'prcsClassNm', 'prcsMthdNm'
                    ]
                    , id: 'CAPCM005GridNumberingRuleComposition'
                    , columns: [
                        {
                            text: 'No.',
                            dataIndex: 'rowIndex',
                            sortable: false,
                            width : 80,
                            height : 25,
                            style: 'text-align:center',
                            align: 'center',
                            // other config you need....
                            renderer: function (value, metaData, record, rowIndex) {
                                return rowIndex + 1;
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#nbrgStd'),
                            flex: 1,
                            dataIndex: 'nbrgTierYn',
                            style: 'text-align:center',
                            align: 'center',
                            renderer : function(val) {
                                var classNm = (val == "Y") ? "s-yes" : "s-no";


                                return "<span class=\"bw-sign "+classNm+"\">"+val+"</span>";
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#cmpsWay'),
                            flex: 1,
                            dataIndex: 'nbrgCmpsMthdCd',
                            style: 'text-align:center',
                            align: 'center',
                            renderer: function (val) {
                                return val ? bxMsg("cbb_items.CDVAL#11910" + val) : "";
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#fixedTxt'),
                            flex: 1,
                            dataIndex: 'fixedTxtCntnt',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#refAtrbt'),
                            flex: 1,
                            dataIndex: 'refAtrbtNm',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#refStartPstn'),
                            flex: 1,
                            dataIndex: 'refStartPstnCnt',
                            style: 'text-align:center',
                            align: 'right'
                        },
                        {
                            text: bxMsg('cbb_items.AT#refFgrsCnt'),
                            flex: 1,
                            dataIndex: 'refFgrsCnt',
                            style: 'text-align:center',
                            align: 'right'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#cmpsStartPstn'),
                            flex: 1,
                            dataIndex: 'cmpsStartPstnCnt',
                            style: 'text-align:center',
                            align: 'right'
                        },
                        {
                            text: bxMsg('cbb_items.AT#cmpsFgrsCnt'),
                            flex: 1,
                            dataIndex: 'cmpsFgrsCnt',
                            style: 'text-align:center',
                            align: 'right'
                        },
                        {
                        	text: bxMsg('cbb_items.AT#startNbr'),
                        	flex: 1,
                        	dataIndex: 'startNbr',
                        	style: 'text-align:center',
                        	align: 'right'
                        },
                        {text: bxMsg('cbb_items.AT#cmpsSeqNbr'), dataIndex: 'cmpsSeqNbr', hidden: true},
                        {
                            text: bxMsg('cbb_items.AT#prcsClassNm'),
                            width: 100,
                            dataIndex: 'prcsClassNm',
                            editor: 'textfield', style: 'text-align:center', align: 'left', hidden: true
                        },
                        {
                            text: bxMsg('cbb_items.AT#prcsMthdNm'),
                            width: 100,
                            dataIndex: 'prcsMthdNm',
                            editor: 'textfield', style: 'text-align:center', align: 'left', hidden: true
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
                    ] // end of columns


                    // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                    , gridConfig: {
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
                    } // end of gridConfig
                    , listeners: {
                        click: {
                            element: 'body'
                            , fn: function () {
                                that.selectGridRecord();
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


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPCM005-cmpntCd-wrap";
                sParam.targetId = "cmpntCd";
                sParam.cdNbr = "11602"; // 컴포넌트코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM005-nbrgWayDscd-wrap";
                sParam.targetId = "nbrgWayDscd";
                sParam.cdNbr = "11301"; // 채번방식구분코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM005-excsNbrgPrcsCd-wrap";
                sParam.targetId = "excsNbrgPrcsCd";
                sParam.cdNbr = "11302"; // 초과채번구분코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM005-initzCyclCd-wrap";
                sParam.targetId = "initzCyclCd";
                sParam.cdNbr = "11304";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 초기화주기코드


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM005-nbrgCmpsMthdCd-wrap";
                sParam.targetId = "nbrgCmpsMthdCd";
                sParam.cdNbr = "11910";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 채번구성방법코드


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM005-encryptDscd-wrap";
                sParam.targetId = "encryptDscd";
                sParam.cdNbr = "A0616";
                sParam.nullYn = "Y";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 암호화구분코드
            },


            setDatePicker: function () {
                fn_makeDatePicker(this.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]'));
                fn_makeDatePicker(this.$el.find('#base-attribute-area [data-form-param="aplyEndDt"]'));
            },


            setBaseAttribute: function (data) {
                this.isNewNumbering = false;
                var aplyStartDt = XDate(data.aplyStartDt).toString('yyyy-MM-dd');
                var aplyEndDt = XDate(data.aplyEndDt).toString('yyyy-MM-dd');


                this.$el.find('#base-attribute-area [data-form-param="nbrgAtrbtNm"]').val(data.nbrgAtrbtNm);
                this.$el.find('#base-attribute-area [data-form-param="nbrgRuleNm"]').val(data.nbrgRuleNm);
                this.$el.find('#base-attribute-area [data-form-param="cmpntCd"]').val(data.cmpntCd);
                this.$el.find('#base-attribute-area [data-form-param="nbrgWayDscd"]').val(data.nbrgWayDscd);
                this.$el.find('#base-attribute-area [data-form-param="nbrgRuleCntnt"]').val(data.nbrgRuleCntnt);
                this.$el.find('#base-attribute-area [data-form-param="seqNm"]').val(data.seqNm);
                this.$el.find('#base-attribute-area [data-form-param="seqNbrLen"]').val(data.seqNbrLen);
                this.$el.find('#base-attribute-area [data-form-param="maxNbrgVal"]').val(data.maxNbrgVal);
                this.$el.find('#base-attribute-area [data-form-param="excsNbrgPrcsCd"]').val(data.excsNbrgPrcsCd);
                this.$el.find('#base-attribute-area [data-form-param="initzCyclCd"]').val(data.initzCyclCd);
                this.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]').val(aplyStartDt);
                this.$el.find('#base-attribute-area [data-form-param="aplyEndDt"]').val(aplyEndDt);
                this.$el.find('#base-attribute-area [data-form-param="encryptDscd"]').val(data.encrptnDscd);
                this.$el.find('#base-attribute-area [data-form-param="acctNbrgClassNm"]').val(data.acctNbrgClassNm);


                this.$el.find('#base-attribute-area [data-form-param="nbrgAtrbtNm"]').prop('disabled', true);
                this.$el.find('#base-attribute-area [data-form-param="nbrgRuleNm"]').prop('disabled', true);
                this.$el.find('#base-attribute-area [data-form-param="seqNm"]').prop('disabled', true);


                this.$el.find('#base-attribute-area [data-form-param="acctNbrgClassNm"]').prop("disabled", data.nbrgAtrbtNm == "acctNbr" ? false : true);
            	this.$el.find('#btn-class-search').prop("disabled", data.nbrgAtrbtNm == "acctNbr" ? false : true);




                this.CAPCM005Grid.resetData();
            },


            setNumberingRuleComposition: function (data) {
                this.CAPCM005Grid.setData(data);
            },


            setNumberingRuleCompositionAttribute: function (data) {
                var numberingCheckbox = this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="nbrgTierYn"]');


                this.isNewNumberingRuleAttribute = false;


                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="nbrgCmpsMthdCd"]').val(data.nbrgCmpsMthdCd);
                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="fixedTxtCntnt"]').val(data.fixedTxtCntnt);
                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="refAtrbtNm"]').val(data.refAtrbtNm);
                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="refStartPstnCnt"]').val(data.refStartPstnCnt);
                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="refFgrsCnt"]').val(data.refFgrsCnt);
                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="cmpsStartPstnCnt"]').val(data.cmpsStartPstnCnt);
                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="cmpsFgrsCnt"]').val(data.cmpsFgrsCnt);
                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="startNbr"]').val(data.startNbr);


                if(data.nbrgTierYn == "Y") {
                    numberingCheckbox.prop("checked", true);
                } else {
                    numberingCheckbox.prop("checked", false);
                }


                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="refAtrbtNm"]').prop('disabled', true);
            },


            upSelectedRow: function () {
                this.CAPCM005Grid.upSelectedRow();
            },


            downSelectedRow: function () {
                this.CAPCM005Grid.downSelectedRow();
            },


            initTreeList: function () {
                this.$el.find('[data-form-param="searchKey"]').val(this.initData.param.srvcCd);


                this.searchTreeList();


                if(this.initData.param.srvcCd && this.initData.param.srvcNm) {
                    console.log(this.initData);
                    this.CAPCM005Tree.selectItem(this.initData.param.srvcCd, false);
                    // 상세조회
                    var sParam = {};


                    this.inquireServiceData(sParam); // 조회
                }
            },


            /**
             * 모든 트리 항목들을 로드
             */
            loadTreeList: function () {
                var that = this;
                var sParam = {};
                var linkData = {"header" : fn_getHeader("CAPCM0058401") , "DummyIO" : sParam};


                this.treeList = [];


                bxProxy.post(sUrl, JSON.stringify(linkData),{
                    enableLoading: true,
                    success: function (responseData) {
                        if(fn_commonChekResult(responseData)) {
                            var numberingRuleList = responseData.CaNbrgRuleMgmtSvcNbrgTrgtListOut.tblNm;


                            if(numberingRuleList != null && numberingRuleList.length > 0) {
                                that.CAPCM005Tree.renderItem(numberingRuleList);
                                that.treeList = numberingRuleList;
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
                    this.CAPCM005Tree.renderItem(this.treeList);
                    return;
                }


                if(this.treeList.length < 1) {
                    return;
                }


                matchingItems = this.findMatchingTreeItems(searchKey);
                this.CAPCM005Tree.renderItem(matchingItems);
            },


            /**
             * 트리 메뉴 중 검색 조건에 해당하는 항목을 반환
             */
            findMatchingTreeItems : function(key) {
                var searchTreeList = [];


//                $(this.treeList).each(function(idx, data) {
//                    for (var i = 0; i < data.children.length; i++) {
//                        var temp001 = data.children[i];
//                        if (temp001.inpDtoNm != null && temp001.srvcClassNm != null) {
//                            if ((temp001.srvcNm.indexOf(key) > -1 || temp001.srvcCd.indexOf(key) > -1)) {
//                                searchTreeList.push(temp001);
//                            }
//                        }
//                    }
//                });
              //changed by Oh : 조회조건 값 실행 되지 않아 수정함
                $(this.treeList).each(function(idx, data) {
                    var temp001 = data;
                    if (temp001.nbrgAtrbtNm != null || temp001.nbrgAtrbtLngChngNm != null) {
                        if ((temp001.nbrgAtrbtNm.indexOf(key) > -1 || temp001.nbrgAtrbtLngChngNm.indexOf(key) > -1)) {
                            searchTreeList.push(temp001);
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


            selectGridRecord: function () {
                var selectedRecord = this.CAPCM005Grid.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                    return;
                } else {
                    this.setNumberingRuleCompositionAttribute(selectedRecord.data);
                }
            },


            /**
             * 트리 항목 선택시 서비스 데이터 조회
             * @param param
             */
            inquireNumberingData: function (param) {
                // header 정보 set
                var that = this;
                var sParam = {};


                sParam.instCd       = $.sessionStorage('headerInstCd');
                sParam.nbrgAtrbtNm  = param.nbrgAtrbtNm;


                var linkData = {"header": fn_getHeader("CAPCM0058402"), "CaNbrgRuleMgmtSvcGetNbrgRuleIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var data = responseData.CaNbrgRuleMgmtSvcGetNbrgRuleOut;


                            if(data != null) {
                                // 기본속성
                                that.setBaseAttribute(data);

                                if( data.instCd != null && ( data.instCd =='STDA'  && sParam.instCd != 'STDA') ){
                                	that.isNewNumbering = true;
                                	fn_alertMessage("",bxMsg("cbb_err_msg.AUICME0059"));
                                }

                                // 서비스 입력항목
                                if (data.tblNm != null) {
                                    that.setNumberingRuleComposition(data.tblNm);


                                    // 삭제 로우 초기화
                                    that.deleteList = [];
                                }


                                // 채번규칙구성 속성 초기화
                                that.resetNumberingRuleCompositionAttribute();


                                // 트리 재조회
                                that.loadTreeList();
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            openReferenceAttributeSearchPopup: function () {
                var that = this;
                var param = {};
                var refAtrbtNm = this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="refAtrbtNm"]').val();


                if(refAtrbtNm) {
                    param.refAtrbtNm = refAtrbtNm;
                }


                this.popupRefAtrbtSrch = new PopupRefAtrbtSrch(param);
                this.popupRefAtrbtSrch.render();
                this.popupRefAtrbtSrch.on('popUpSetData', function (data) {
                	//  record.set('refAtrbtNm', data.refObjCd + '.' + data.refAtrbtNm);
                    that.$el.find('#numbering-rule-composition-attribute-area [data-form-param="refAtrbtNm"]').val(data.refObjCd + '.'+ data.refAtrbtNm );
                });
            },


            openClassSearchPopup: function () {
            	var that = this;
            	var param = {};


            	this.popupClassSrch = new PopupClassSrch(param);
            	this.popupClassSrch.render();
            	this.popupClassSrch.on('popUpSetData', function (data) {
            		that.$el.find('#base-attribute-area [data-form-param="acctNbrgClassNm"]').val(data.classNm);
            	});
            },


            resetBaseAttribute: function () {
                this.isNewNumbering = true;


                this.$el.find('#base-attribute-area [data-form-param="nbrgAtrbtNm"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="nbrgRuleNm"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="cmpntCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="nbrgWayDscd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="nbrgRuleCntnt"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="seqNm"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="seqNbrLen"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="maxNbrgVal"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="excsNbrgPrcsCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="initzCyclCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]').val(getCurrentDate("yyyy-mm-dd"));
                this.$el.find('#base-attribute-area [data-form-param="aplyEndDt"]').val(getCurrentDate("yyyy-mm-dd"));
                this.$el.find('#base-attribute-area [data-form-param="encryptDscd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="acctNbrgClassNm"]').val("");


                this.$el.find('#base-attribute-area [data-form-param="nbrgAtrbtNm"]').prop('disabled', false);
                this.$el.find('#base-attribute-area [data-form-param="nbrgRuleNm"]').prop('disabled', false);
                this.$el.find('#base-attribute-area [data-form-param="seqNm"]').prop('disabled', false);


                this.$el.find('#base-attribute-area [data-form-param="acctNbrgClassNm"]').prop("disabled", true);
            	this.$el.find('#btn-class-search').prop("disabled", true);
                this.resetNumberingRuleCompositionAttribute();
                this.CAPCM005Grid.resetData();
            },


            resetNumberingRuleCompositionAttribute: function () {
                this.isNewNumberingRuleAttribute = true;


                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="nbrgCmpsMthdCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="fixedTxtCntnt"]').val("");
                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="refAtrbtNm"]').val("");
                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="refStartPstnCnt"]').val("");
                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="refFgrsCnt"]').val("");
                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="cmpsStartPstnCnt"]').val("");
                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="cmpsFgrsCnt"]').val("");
                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="cmpsFgrsCnt"]').val("");
                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="startNbr"]').val("");
                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="nbrgTierYn"]').prop("checked", false);
                this.$el.find('#numbering-rule-composition-attribute-area [data-form-param="refAtrbtNm"]').prop('disabled', false);
            },


            saveBaseAttribute: function (event) {
                var that = this;

				//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                function saveData() {
                    var sParam = {};
                    var srvcCd = that.isNewNumbering ? 'CAPCM0058101': 'CAPCM0058201';


                    sParam.instCd           = $.sessionStorage('headerInstCd');
                    sParam.nbrgAtrbtNm      = that.$el.find('#base-attribute-area [data-form-param="nbrgAtrbtNm"]').val();
                    sParam.nbrgRuleNm       = that.$el.find('#base-attribute-area [data-form-param="nbrgRuleNm"]').val();
                    sParam.cmpntCd          = that.$el.find('#base-attribute-area [data-form-param="cmpntCd"]').val();
                    sParam.nbrgWayDscd      = that.$el.find('#base-attribute-area [data-form-param="nbrgWayDscd"]').val();
                    sParam.nbrgRuleCntnt    = that.$el.find('#base-attribute-area [data-form-param="nbrgRuleCntnt"]').val();
                    sParam.seqNm            = that.$el.find('#base-attribute-area [data-form-param="seqNm"]').val();
                    sParam.seqNbrLen        = that.$el.find('#base-attribute-area [data-form-param="seqNbrLen"]').val();
                    sParam.maxNbrgVal       = that.$el.find('#base-attribute-area [data-form-param="maxNbrgVal"]').val();
                    sParam.excsNbrgPrcsCd   = that.$el.find('#base-attribute-area [data-form-param="excsNbrgPrcsCd"]').val();
                    sParam.initzCyclCd      = that.$el.find('#base-attribute-area [data-form-param="initzCyclCd"]').val();
                    sParam.encrptnDscd      = that.$el.find('#base-attribute-area [data-form-param="encryptDscd"]').val();
                    sParam.aplyStartDt      = fn_getDateValue(that.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]').val());
                    sParam.aplyEndDt        = fn_getDateValue(that.$el.find('#base-attribute-area [data-form-param="aplyEndDt"]').val());
                    sParam.acctNbrgClassNm = "";
                    if(sParam.nbrgAtrbtNm == "acctNbr") {
                    	sParam.acctNbrgClassNm = that.$el.find('#base-attribute-area [data-form-param="acctNbrgClassNm"]').val();
                    }


                    console.log(sParam);


                    var linkData = {"header": fn_getHeader(srvcCd), "CaNbrgRuleMgmtSvcRegisterNbrgRuleBsicInfoIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                if(that.isNewNumbering) {
                                	that.saveNumberingRuleCompositionAttribute(event);
                                    that.resetBaseAttribute();
                                    that.inquireNumberingData(sParam);
                                }
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            saveNumberingRuleComposition: function (event) {
                var that = this;
				//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }

                function saveData() {
                    that.saveRealNumberingRuleComposition(that);
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            saveRealNumberingRuleComposition : function(that) {
            	var sParam = {};
            	var nbrgAtrbtNm = that.$el.find('#base-attribute-area [data-form-param="nbrgAtrbtNm"]').val();


                var tblList = that.CAPCM005Grid.getAllData();


                $(tblList).each(function (index, element) {
                	element.instCd = $.sessionStorage('headerInstCd');
                	element.nbrgAtrbtNm = nbrgAtrbtNm;
                	element.sortSeqNbr = index;
                });


                sParam.tblNm = tblList;


                console.log(sParam);


                var linkData = {"header": fn_getHeader("CAPCM0058202"), "CaNbrgRuleMgmtSvcRegisterNbrgRuleCmpsInfoIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            sParam.nbrgAtrbtNm = nbrgAtrbtNm;
                            that.inquireNumberingData(sParam);
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            saveNumberingRuleCompositionAttribute: function (event) {
                var that = this;

				//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                function saveData() {
                    var sParam = {};


                    sParam.nbrgTierYn       = that.$el.find('#numbering-rule-composition-attribute-area [data-form-param="nbrgTierYn"]')
                        .prop('checked') ? 'Y' : 'N';
                    sParam.nbrgCmpsMthdCd   = that.$el.find('#numbering-rule-composition-attribute-area [data-form-param="nbrgCmpsMthdCd"]').val();
                    sParam.fixedTxtCntnt    = that.$el.find('#numbering-rule-composition-attribute-area [data-form-param="fixedTxtCntnt"]').val();
                    sParam.refAtrbtNm       = that.$el.find('#numbering-rule-composition-attribute-area [data-form-param="refAtrbtNm"]').val();
                    sParam.refStartPstnCnt  = that.$el.find('#numbering-rule-composition-attribute-area [data-form-param="refStartPstnCnt"]').val();
                    sParam.refFgrsCnt       = that.$el.find('#numbering-rule-composition-attribute-area [data-form-param="refFgrsCnt"]').val();
                    sParam.cmpsStartPstnCnt = that.$el.find('#numbering-rule-composition-attribute-area [data-form-param="cmpsStartPstnCnt"]').val();
                    sParam.cmpsFgrsCnt      = that.$el.find('#numbering-rule-composition-attribute-area [data-form-param="cmpsFgrsCnt"]').val();
                    sParam.startNbr      = that.$el.find('#numbering-rule-composition-attribute-area [data-form-param="startNbr"]').val();


                    if(that.isNewNumberingRuleAttribute) {
                        that.CAPCM005Grid.addData(sParam);
                    } else {
                        var models = that.CAPCM005Grid.grid.getStore().getRange();
                        var index = that.CAPCM005Grid.getSelectedIndex();


                        models[index].set('nbrgTierYn', sParam.nbrgTierYn);
                        models[index].set('nbrgCmpsMthdCd', sParam.nbrgCmpsMthdCd);
                        models[index].set('fixedTxtCntnt', sParam.fixedTxtCntnt);
                        models[index].set('refAtrbtNm', sParam.refAtrbtNm);
                        models[index].set('refStartPstnCnt', sParam.refStartPstnCnt);
                        models[index].set('refFgrsCnt', sParam.refFgrsCnt);
                        models[index].set('cmpsStartPstnCnt', sParam.cmpsStartPstnCnt);
                        models[index].set('cmpsFgrsCnt', sParam.cmpsFgrsCnt);
                        models[index].set('startNbr', sParam.startNbr);
                    }


                    that.saveRealNumberingRuleComposition(that);
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            deleteBaseAttribute: function (event) {
                var that = this;

				//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                function deleteData() {
                    var sParam = {};


                    sParam.instCd           = $.sessionStorage('headerInstCd');
                    sParam.nbrgAtrbtNm      = that.$el.find('#base-attribute-area [data-form-param="nbrgAtrbtNm"]').val();
                    sParam.nbrgRuleNm       = that.$el.find('#base-attribute-area [data-form-param="nbrgRuleNm"]').val();
                    sParam.cmpntCd          = that.$el.find('#base-attribute-area [data-form-param="cmpntCd"]').val();
                    sParam.nbrgWayDscd      = that.$el.find('#base-attribute-area [data-form-param="nbrgWayDscd"]').val();
                    sParam.nbrgRuleCntnt    = that.$el.find('#base-attribute-area [data-form-param="nbrgRuleCntnt"]').val();
                    sParam.seqNm            = that.$el.find('#base-attribute-area [data-form-param="seqNm"]').val();
                    sParam.seqNbrLen        = that.$el.find('#base-attribute-area [data-form-param="seqNbrLen"]').val();
                    sParam.maxNbrgVal       = that.$el.find('#base-attribute-area [data-form-param="maxNbrgVal"]').val();
                    sParam.excsNbrgPrcsCd   = that.$el.find('#base-attribute-area [data-form-param="excsNbrgPrcsCd"]').val();
                    sParam.initzCyclCd      = that.$el.find('#base-attribute-area [data-form-param="initzCyclCd"]').val();
                    sParam.aplyStartDt      = fn_getDateValue(that.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]').val());
                    sParam.aplyEndDt        = fn_getDateValue(that.$el.find('#base-attribute-area [data-form-param="aplyEndDt"]').val());


                    console.log(sParam);


                    var linkData = {"header": fn_getHeader("CAPCM0058301"), "CaNbrgRuleMgmtSvcRegisterNbrgRuleBsicInfoIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                // tree 재조회
                                that.loadTreeList();


                                // 전체 초기화
                                that.resetBaseAttribute();
                                that.resetNumberingRuleCompositionAttribute();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), deleteData, this);
            },


            showTree: function () {
                this.$el.find('.col1').show();
                this.$el.find('.col2').css('left', '260px');
                this.$el.find('#btn-tree-show').hide();
            },


            hideTree: function () {
                this.$el.find('.col1').hide();
                this.$el.find('.col2').css('left', '30px');
                this.$el.find('#btn-tree-show').show();
            },


            toggleBaseAttribute: function () {
                fn_pageLayerCtrl(this.$el.find("#base-attribute-area"), this.$el.find('#btn-base-attribute-toggle'));
            },


            toggleNumberingRuleComposition: function () {
                fn_pageLayerCtrl(this.$el.find("#numbering-rule-composition-area"),
                    this.$el.find('#btn-numbering-rule-composition-toggle'));
            },


            toggleNumberingRuleCompositionAttribute: function () {
                fn_pageLayerCtrl(this.$el.find("#numbering-rule-composition-attribute-area"),
                    this.$el.find('#btn-numbering-rule-composition-attribute-toggle'));
            }
        }); // end of Backbone.View.extend({


        return CAPCM005View;
    } // end of define function
); // end of define
