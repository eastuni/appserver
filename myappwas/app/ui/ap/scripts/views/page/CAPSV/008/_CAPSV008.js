define(
    [
        'bx/common/config',
        'text!app/views/page/CAPSV/008/_CAPSV008.html',
        'bx-component/ext-grid/_ext-grid',
        'bx-component/bx-tree/bx-tree',
        'bx/common/common-info',
        'app/views/page/popup/CAPCM/popup-code-search',
        'app/views/page/popup/CAPCM/popup-class-search'
    ]
    , function (
    		config,
    		tpl,
    		ExtGrid,
    		bxTree,
    		commonInfo,
            PopupCodeSearch,
            PopupClassSearch
        ) {

        /**
         * Backbone
         */
    	var list = [];
    	var flag = false;
        var CAPSV008View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPSV008-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'keydown #searchKey': 'pressEnterInTree',



                'click #btn-multi-language': 'openMultiLanguagePage',//다국어버튼
                'click #btn-init-dto': 'dtoCacheDelete',//hidden
                'click #btn-code-search': 'openCodeSearchPopup',//hidden
                'click #btn-class-search': 'openClassSearchPopup',//클래스검색버튼

                'click #btn-base-attribute-save': 'saveBaseAttribute',
                'click #btn-service-input-item-save': 'saveServiceInputItem',
                'click #btn-service-output-item-save': 'saveServiceOutputItem',//★
                'click #btn-service-profile-save': 'saveServiceProfile',

                'click #btn-base-attribute-delete': 'deleteBaseAttribute',

                'click #btn-tree-search': 'searchTreeList',

                'click #btn-tree-hide': 'hideTree',
                'click #btn-tree-show': 'showTree',

                'click #btn-base-attribute-toggle': 'toggleBaseAttribute',
                'click #btn-service-input-item-toggle1': 'toggleServiceInputItem1',
                'click #btn-service-input-item-toggle2': 'toggleServiceInputItem2',
                'click #btn-service-output-item-toggle': 'toggleServiceOutputItem',//★
                'click #btn-service-profile-toggle': 'toggleServiceProfile',
                	
                	
                'click #tab-srvcPrfl' : 'clickTapPrfl',
               	'click #tab-srvcInpItm' : 'clickTapInput',
				'click #tab-srvcOutpItm' : 'clickTapOutput',
				
				'click #btn-CAPSV008-srvcInpItm-upClass' : 'inquireInpUpperClass',
				'click #btn-CAPSV008-srvcOutpItm-upClass' : 'inquireOutpUpperClass'
            },
            
            // DTO 캐시 삭제
            dtoCacheDelete : function() {
            	var that = this;
            	var sParam = {};
            	sParam.srvcCd = "PAC0018400";
                var linkData = {"header": fn_getHeader("CAPSV0088302"), "CaSrvcMgmtSvcChngIn": sParam};

                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                        	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                        }
                    }
                });
            },
            
            /**
             * 초기화
             */
            initialize: function (initData) {
            	this.inpDtoList=[];
            	this.outpDtoList=[];
            	
            	
            	$.extend(this, initData);

                this.initData = initData;
                
                this.createGrid();
                //this.createTree();
                this.createTree2();
            },

            /**
             * 렌더
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());

                // 트리 렌더
                this.$el.find('.bx-tree-root').html(this.CAPSV008Tree.render());

                // 단일탭 그리드 렌더
                this.$el.find("#CAPSV008Grid-service-input-item").html(this.CAPSV008GridSrvcInpItm.render({'height': CaGridHeight}));
                this.$el.find("#CAPSV008Grid-service-output-item").html(this.CAPSV008GridSrvcOutpItm.render({'height': CaGridHeight}));
                this.$el.find("#CAPSV008Grid-service-profile").html(this.CAPSV008GridSrvcPrfl.render({'height': CaGridHeight}));

                this.$el.find('#service-output-item-area').hide();
                this.$el.find('#service-input-item-area').hide();
                this.$el.find('#btn-code-search').hide();

                //this.loadTreeList();
                this.loadTreeList2();
                this.setComboBoxes();
                this.setDatePicker();
                this.setTimeInput();
                
                var userInfo = commonInfo.getUserInfo();
                if(userInfo.staffId == "0000000026") {
                	this.$el.find("#init-dto-ara").show();
                }
                
                //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPSV008-wrap #btn-base-attribute-save')
                                    		, this.$el.find('.CAPSV008-wrap  #btn-base-attribute-delete')
                                    		, this.$el.find('.CAPSV008-wrap  #btn-service-input-item-save')
                                    		, this.$el.find('.CAPSV008-wrap  #btn-service-profile-save')
                                    			   ]);

                return this.$el;
            },

            /**
             * 트리 생성
             */
            createTree: function () {
                var that = this;

                this.CAPSV008Tree = new bxTree({
                   fields: {id: 'srvcCd', value: 'srvcNm'},

                 // Tree Item - Checkbox Use Yn
                    checkAble: false,

                    listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {

                           if(itemData.inpDtoNm) {
                               that.inquireServiceData(itemData);
                           }
                        }
                    }
                });
            },
            
            createTree2: function () {
                var that = this;
                flag = false;
                this.CAPSV008Tree = new bxTree({
                   fields: {id: 'cd', value: 'cdNm'},

                 // Tree Item - Checkbox Use Yn
                    checkAble: false,

                    listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {

                            var newNodeData = {}; 
                            newNodeData.srvcCd = itemData.cd;

//                            console.log(newNodeData);

                            var currentItem = e.currentTarget,
                                $currentNode = $(currentItem).parent().parent();

//                            console.log(currentItem);
                            // 부모 인지 확인
                            if($currentNode.hasClass("bx-tree-root") && flag == false) {
                            	if($(currentItem).next('ul').find('li').length === 0) {
                            		
                            		 // bx-tree-floor-item의 data-state = collapse 로 변경 하면 된다.
                                    // -로 일괄 변경 하고 싶으면 data-state = expand 로 변경
                                    $(currentItem).parent().attr("data-state", "expand");
                    	            that.inquireServiceData2(itemData);
                            	}
                            }else{
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

                this.CAPSV008GridSrvcInpItm = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'dtoClassNm','atrbtNm', 'engAtrbtNm', 'useLngAtrbtNm', 'stdAtrbtVldtnRuleCntnt', 'mndtryYn',
                        'xtnAtrbtOriginTblNm', 'atrbtVldtnWayCd', 'atrbtVldtnRuleCntnt', 'atrbtVldtnXtnRuleCntnt', 'stdAtrbtVldtnUseYn'
                        , 'atrbtDtoClassNm'
                    ]
                    , id: 'CAPSV008Grid-service-input-item'
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
         	            	text: bxMsg('cbb_items.AT#classNm')
         	            	, flex: 4
         	            	, dataIndex: 'dtoClassNm'
         	            	, style: 'text-align:center'
         	            	, align: 'center'
         	            	, hidden:true
         	            },
                        {
                            text: bxMsg('cbb_items.SCRNITM#atrbt'),
                            flex: 1,
                            dataIndex: 'atrbtNm',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.AT#engAtrbtNm'),
                            flex: 1,
                            dataIndex: 'engAtrbtNm',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.AT#useLngAtrbtNm'),
                            flex: 1,
                            dataIndex: 'useLngAtrbtNm',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.AT#mndtryYn'),
                            flex: 1,
                            dataIndex: 'mndtryYn',
                            style: 'text-align:center',
                            align: 'center'
                        }
                        , {
                            text: bxMsg('cbb_items.AT#atrbtDtoClassNm'),
                            width: 250,
                            dataIndex: 'atrbtDtoClassNm',
                            style: 'text-align:center',
                            align: 'left',
                            hidden: true
                        }
                        // DTO관리
                        , {
                            text: bxMsg('cbb_items.AT#dtoNm'),
                            tdCls: 'bw-btn',
                            renderer: function (value, p, record, idx) {
                                var button = "";

                                /**
                                 * 버튼 렌더링 조건
                                 */
                                if (!fn_isEmpty(record.get('atrbtDtoClassNm'))) {
                                    button = '<button type=\"button\" class=\"bw-btn\"><i class=\"bw-icon i-25 i-search atrbtDtoClass-grid-btn\"></i></button>';
                                }
                                
                                return button;
                            },
                            sortable: false,
                            align: 'left',
                            width: 90,
                            listeners: {
                                /**
                                 * 버튼 클릭 이벤트 등록
                                 */
                                click: function (grid, rowEl, rowIdx, cellIdx, e, record) {
                                    if ($(e.target).hasClass('atrbtDtoClass-grid-btn')) {
                                    	that.inpDtoList.push(record.data.dtoClassNm);
                                        that.dtoManger(record.data.atrbtDtoClassNm);
                                    }
                                }
                            }
                        }
                    ] // end of columns
                    , listeners: {
                        click: {
                            element: 'body'
                            , fn: function () {
                                that.clickGridOfServiceInputItem();
                            }
                        }
                    }
                });

                this.CAPSV008GridSrvcOutpItm = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex','dtoClassNm', 'atrbtNm', 'engAtrbtNm', 'useLngAtrbtNm', 'atrbtDtoClassNm'
                    ]
                    , id: 'CAPSV008Grid-service-output-item'
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
         	            	text: bxMsg('cbb_items.AT#classNm')
         	            	, flex: 4
         	            	, dataIndex: 'dtoClassNm'
         	            	, style: 'text-align:center'
         	            	, align: 'center'
         	            	, hidden:true
         	            },
                        {
                            text: bxMsg('cbb_items.SCRNITM#atrbt'),
                            flex: 1,
                            dataIndex: 'atrbtNm',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.AT#engAtrbtNm'),
                            flex: 1,
                            dataIndex: 'engAtrbtNm',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.AT#useLngAtrbtNm'),
                            flex: 1,
                            dataIndex: 'useLngAtrbtNm',
                            style: 'text-align:center',
                            align: 'left'
                        }
                        , {
                            text: bxMsg('cbb_items.AT#atrbtDtoClassNm'),
                            width: 250,
                            dataIndex: 'atrbtDtoClassNm',
                            style: 'text-align:center',
                            align: 'left',
                            hidden: true
                        }
                        // DTO관리
                        , {
                            text: bxMsg('cbb_items.AT#dtoNm'),
                            tdCls: 'bw-btn',
                            renderer: function (value, p, record, idx) {
                                var button = "";

                                /**
                                 * 버튼 렌더링 조건
                                 */
                                if (!fn_isEmpty(record.get('atrbtDtoClassNm'))) {
                                    button = '<button type=\"button\" class=\"bw-btn\"><i class=\"bw-icon i-25 i-search atrbtDtoClass-grid-btn\"></i></button>';
                                }
                                
                                return button;
                            },
                            sortable: false,
                            align: 'left',
                            width: 90,
                            listeners: {
                                /**
                                 * 버튼 클릭 이벤트 등록
                                 */
                                click: function (grid, rowEl, rowIdx, cellIdx, e, record) {
                                    if ($(e.target).hasClass('atrbtDtoClass-grid-btn')) {
                                    	that.outpDtoList.push(record.data.dtoClassNm);
                                        that.dtoManger(record.data.atrbtDtoClassNm);
                                    }
                                }
                            }
                        }
                    ] // end of columns
                    , listeners: {
                        click: {
                            element: 'body'
                            , fn: function () {
                            }
                        }
                    }
                });
                

                this.CAPSV008GridSrvcPrfl = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'srvcPrflNm', 'instSrvcPrflCntnt', 'srvcCd', 'srvcPrflAtrbtNm', 'srvcPrflCntnt']
                    , id: 'CAPSV008Grid-service-profile'
                    , columns: [
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
                            text: bxMsg('cbb_items.SCRNITM#srvcPrfl'),
                            flex: 1,
                            dataIndex: 'srvcPrflNm',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#settingVal'),
                            flex: 2,
                            dataIndex: 'srvcPrflCntnt',
                            style: 'text-align:center',
                            align: 'left',
                            editor: 'textfield'
                        },
                        {
                        	text: bxMsg('cbb_items.SCRNITM#srvcCd'),
                        	dataIndex: 'srvcCd',
                        	hidden : true
                        }, 
                        {
                        	text: bxMsg('cbb_items.SCRNITM#srvcPrflAtrbtNm'),
                        	dataIndex: 'srvcPrflAtrbtNm',
                        	hidden : true
                        }
                        
                    ] // end of columns

                    // 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
                    , gridConfig: {
                        // 셀 에디팅 플러그인
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                // 2번 클릭시, 에디팅할 수 있도록 처리
                                clicksToEdit: 2
                            }) // end of Ext.create
                        ] // end of plugins
                    } // end of gridConfig
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
                sParam.className = "CAPSV008-srvcSts-wrap";
                sParam.targetId = "srvcSts";
                sParam.nullYn = "N";
                sParam.cdNbr = "A0052";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);

                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPSV008-logLvl-wrap";
                sParam.targetId = "logLvl";
                sParam.cdNbr = "A0124"; // 로그레벨코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);

                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPSV008-txYn-wrap";
                sParam.targetId = "txYn";
                sParam.nullYn = "N";
                sParam.cdNbr = "10000"; // 여부
                // 콤보데이터 load
                fn_getCodeList(sParam, this);

                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPSV008-atrbtVldtnWay-wrap";
                sParam.targetId = "atrbtVldtnWay";
                sParam.nullYn = "Y";
                sParam.cdNbr = "10002";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 속성검증방법코드

                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPSV008-atrbtVldtnRuleCntnt-wrap";
                sParam.targetId = "selectAtrbtVldtnRule";
                sParam.nullYn = "Y";
                sParam.cdNbr = "A0112";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);  // 분류체계코드

                //제한코드
                sParam = {};
                sParam.className = "CAPSV008-rstrctnCd-wrap";
                sParam.targetId = "rstrctnCd";
                sParam.nullYn = "Y";
                sParam.cdNbr = "11308";
                fn_getCodeList(sParam, this);

                //채널코드
                sParam = {};
                sParam.className = "CAPSV008-chnlCd-wrap";
                sParam.targetId = "chnlCd";
                sParam.nullYn = "Y";
                sParam.cdNbr = "50002";
                fn_getCodeList(sParam, this);

                //상품대분류
                sParam = {};
                sParam.className = "CAPSV008-bizDsCd-wrap";
                sParam.targetId = "bizDsCd";
                sParam.nullYn = "Y";
                sParam.cdNbr = "80015";
                fn_getCodeList(sParam, this);
            },

            setDatePicker: function () {
                fn_makeDatePicker(this.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]'));
            },

            setTimeInput: function () {
                this.$el.find('#base-attribute-area [data-form-param="txAblStartHms"]').mask("99:99:99", {placeholder:"--:--:--"});
                this.$el.find('#base-attribute-area [data-form-param="txAblEndHms"]').mask("99:99:99", {placeholder:"--:--:--"});
            },

            /**
             * 기본 속성 영역을 서버로부터 받아온 데이터로 세팅
             * @param param 서버로부터 받아온 데이터
             */
            setBaseAttribute: function (data) {
                var aplyStartDt = XDate(data.aplyStartDt).toString('yyyy-MM-dd');

                this.$el.find('#base-attribute-area [data-form-param="cmpnt"]').val(bxMsg('cbb_items.CDVAL#11602' + data.cmpntCd));
                this.$el.find('#base-attribute-area [data-form-param="srvcCd"]').val(data.srvcCd);
                this.$el.find('#base-attribute-area [data-form-param="srvcNm"]').val(data.srvcNm);
                this.$el.find('#base-attribute-area [data-form-param="oprtn"]').val(data.oprtnNm);
                this.$el.find('#base-attribute-area [data-form-param="srvcSts"]').val(data.srvcStsCd);
                this.$el.find('#base-attribute-area [data-form-param="srvcClass"]').val(data.srvcClassNm);
                this.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]').val(aplyStartDt);

                if(data.srvcUseYn == 'Y') {
                    this.$el.find('#base-attribute-area [data-form-param="srvcUseYn"]').prop('checked', true);
                } else {
                    this.$el.find('#base-attribute-area [data-form-param="srvcUseYn"]').prop('checked', false);
                }

                this.$el.find('#base-attribute-area [data-form-param="logLvl"]').val(data.logLvlCd);
                this.$el.find('#base-attribute-area [data-form-param="timeoutSecond"]').val(data.timeoutScnd);
                this.$el.find('#base-attribute-area [data-form-param="txYn"]').val(data.txYn);

                this.$el.find('#base-attribute-area [data-form-param="txAblStartHms"]').val(fn_setTimeValue(data.txAblStartHms));
                this.$el.find('#base-attribute-area [data-form-param="txAblEndHms"]').val(fn_setTimeValue(data.txAblEndHms));
            },

            /**
             * 서비스 입력 항목 영역을 받아온 데이터로 세팅
             * @param data 서버로부터 받아온 데이터
             */
            setServiceInputItem: function (data) {
                if(data.stdAtrbtVldtnRuleCntnt.atrbtVldtnWayCd) {
                    this.$el.find('#service-input-item-area [data-form-param="stdAtrbtVldtnWay"]')
                        .val(bxMsg('cbb_items.CDVAL#10002' + data.stdAtrbtVldtnRuleCntnt.atrbtVldtnWayCd));
                } else {
                    this.$el.find('#service-input-item-area [data-form-param="stdAtrbtVldtnWay"]').val("");
                }

                this.$el.find('#service-input-item-area [data-form-param="stdAtrbtVldtnRule"]').val(data.stdAtrbtVldtnRuleCntnt.atrbtVldtnRuleCntnt);
                this.$el.find('#service-input-item-area [data-form-param="stdAtrbtVldtnXtnRule"]').val(data.stdAtrbtVldtnRuleCntnt.atrbtVldtnXtnRuleCntnt);
                this.$el.find('#service-input-item-area [data-form-param="atrbtVldtnWay"]').val(data.atrbtVldtnWayCd);
                this.$el.find('#service-input-item-area [data-form-param="atrbtVldtnRule"]').val(data.atrbtVldtnRuleCntnt);
                this.$el.find('#service-input-item-area [data-form-param="selectAtrbtVldtnRule"]').val(data.atrbtVldtnRuleCntnt);
                this.$el.find('#service-input-item-area [data-form-param="atrbtVldtnXtnRule"]').val(data.atrbtVldtnXtnRuleCntnt);

                if(data.mndtryYn == 'Y') {
                    this.$el.find('#service-input-item-area [data-form-param="mndtryYn"]').prop("checked", true);
                } else {
                    this.$el.find('#service-input-item-area [data-form-param="mndtryYn"]').prop("checked", false);
                }

                if(data.stdAtrbtVldtnUseYn == 'Y') {
                    this.$el.find('#service-input-item-area [data-form-param="stdAtrbtVldtnUseYn"]').prop("checked", true);
                } else {
                    this.$el.find('#service-input-item-area [data-form-param="stdAtrbtVldtnUseYn"]').prop("checked", false);
                }

                this.$el.find('#service-input-item-area [data-form-param="stdAtrbtVldtnWay"]').prop("readonly", true);
                this.$el.find('#service-input-item-area [data-form-param="stdAtrbtVldtnRule"]').prop("readonly", true);
                this.$el.find('#service-input-item-area [data-form-param="stdAtrbtVldtnXtnRule"]').prop("readonly", true);
            },


            initTreeList: function () {
                this.$el.find('[data-form-param="searchKey"]').val(this.initData.param.srvcCd);

                this.searchTreeList();

                if(this.initData.param.srvcCd && this.initData.param.srvcNm) {
                    console.log(this.initData);
                    this.CAPSV008Tree.selectItem(this.initData.param.srvcCd, false);
                    // 상세조회
                    var sParam = {};

                    sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                    sParam.srvcCd = this.initData.param.srvcCd;
                    sParam.inpDtoNm = this.initData.param.inpDtoNm;
                    this.inquireServiceData(sParam); // 조회
                }
            },

            /**
             * 모든 트리 항목들을 로드
             */
            loadTreeList: function () {
                var that = this;
                var sParam = {};
                var linkData = {"header" : fn_getHeader("CAPSV0208401") , "DummyIO" : sParam};

                this.treeList = [];

                bxProxy.post(sUrl, JSON.stringify(linkData),{
                   enableLoading: true,
                    success: function (responseData) {
                       if(fn_commonChekResult(responseData)) {
                           var serviceList = responseData.CaStdSrvcIoMgmtSvcGetStdSrvcListOut.cmpntSrvcList;

                           if(serviceList != null && serviceList.length > 0) {
                               
                           }

                           that.CAPSV008Tree.renderItem(responseData.CaStdSrvcIoMgmtSvcGetStdSrvcListOut.cmpntSrvcList);
                           that.treeList = responseData.CaStdSrvcIoMgmtSvcGetStdSrvcListOut.cmpntSrvcList;

                           if(that.initData.param) {
                               console.log('init tree');
                               that.initTreeList();
                           }
                       }
                    }
                });
            },
            
            loadTreeList2: function () {
                var that = this;
                var sParam = {};
                sParam.cdNbr = "11603";

                var linkData = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};

                //var linkData = {"header" : fn_getHeader("CAPSV0208401") , "DummyIO" : sParam};

                this.treeList = [];

                bxProxy.post(sUrl, JSON.stringify(linkData),{
                   enableLoading: true,
                    success: function (responseData) {
                       if(fn_commonChekResult(responseData)) {
                           var serviceList = responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;

                           if(serviceList != null && serviceList.length > 0) {
                               
                           }

                           that.CAPSV008Tree.renderItem(responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm);
                           that.treeList = responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;

                           if(that.initData.param) {
                               console.log('init tree');
                               that.initTreeList();
                           }
                           
                           // bx-tree-floor-item의 data-state = collapse 로 변경 하면 된다.
                           // -로 일괄 변경 하고 싶으면 data-state = expand 로 변경
                           
                           that.$el.find("li.bx-tree-floor-item").attr("data-state", "collapse");
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
                    this.CAPSV008Tree.renderItem(this.treeList);
                    flag = false;
                    return;
                }

                if(this.treeList.length < 1) {
                	flag = false;
                    return;
                }

                //matchingItems = this.findMatchingTreeItems(searchKey);
                
                
                // header 정보 set
                var that = this;
                var sParam = {};
                this.list = [];
                
                this.inpDtoNm = "";

                sParam.instCd   = $.sessionStorage('headerInstCd');
              //  sParam.cmpntCd   = param.cd;
                
                // 조회 key값 set
                sParam.srvcCd = searchKey;
                sParam.srvcNm = searchKey;
                
                //sParam.inpDtoNm = param.inpDtoNm;

                var linkData = {"header": fn_getHeader("CAPSV0328401"), "CaStdSrvcIoMgmtSvcGetInstSrvcListIn": sParam};

                 //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {

                        if (fn_commonChekResult(responseData)) {
                            if (responseData.CaStdSrvcIoMgmtSvcGetInstSrvcListOut) {
                                var tbList = responseData.CaStdSrvcIoMgmtSvcGetInstSrvcListOut.tblNm;
                                var totalCount = tbList.length;

                                if ((tbList != null || tbList.length > 0) && totalCount > 0) {
                                	list = [];
                                    $(tbList).each(function(idx, data) {
                                        var temp001 = data;
                                        var newNodeData = {};
                                        newNodeData.srvcCd = data.srvcCd;
                                        newNodeData.srvcNm = data.srvcNm;
                                        newNodeData.cmpntCd = data.cmpntCd;
                                        newNodeData.cd = data.cmpntCd;
                                        newNodeData.cdNm = data.srvcNm;

                                        list.push(newNodeData);

//                                        console.log(newNodeData);
                                       // that.CAPSV008Tree.addNode(data.cmpntCd, newNodeData);
                                        
                                        that.CAPSV008Tree.renderItem(list);
                                    	flag = true;
                                        
                                    });
                                    
                                   // that.CAPSV032Grid.setData(tbList);
                                    that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totalCount)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                }else{
                                	var emptyLst = [];
                                	that.CAPSV008Tree.renderItem(emptyLst);
                                	flag = false;
                                }
                            }
                        }
                    }
                });
                
//                if( matchingItems != null || matchingItems != ""){
//                	this.CAPSV008Tree.renderItem(matchingItems);
//                	flag = true;
//                }else{
//                	flag = false;
//                }
                
            },

            /**
             * 트리 메뉴 중 검색 조건에 해당하는 항목을 반환
             */
            findMatchingTreeItems : function(key) {
                var searchTreeList = [];
                var tmpSearchTreeList = [];

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
                
//                for (var i = 0; i < list.length; i++) {
//
//                    tmpVar = {};
//                    tmpVar.srvcCd = list[i].srvcCd;
//                    tmpVar.srvcNm = list[i].srvcNm;
//                    tmpVar.cmpntCd = list[i].cmpntCd;
//                    tmpVar.cd = list[i].cmpntCd;
//                    tmpVar.cdNm = list[i].srvcNm;
//           
//                 // if (temp001.inpDtoNm != null && temp001.srvcClassNm != null) {
//                    if (tmpVar.srvcNm.indexOf(key) > -1 || tmpVar.srvcCd.indexOf(key) > -1) {
//                        console.log(tmpVar);
//                       searchTreeList.push(tmpVar);
//                       for( var j = 0; j < searchTreeList.length; j++){
//                             tmpSearchTreeList.push(tmpVar);
//                       }
//                    }
//                 // }
//             }
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
                this.inpDtoList=[];
                this.outpDtoList=[];
                this.inpDtoNm = "";

                sParam.instCd   = $.sessionStorage('headerInstCd');
                sParam.srvcCd   = param.srvcCd;
                sParam.inpDtoNm = "InputTestOmm";
                sParam.outpDtoNm ="OutputTestOmm";

                var linkData = {"header": fn_getHeader("CAPSV0088400"), "CaStdSrvcIoMgmtSvcGetServiceAllInfoIn": sParam};

                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var data = responseData.CaStdSrvcIoMgmtSvcGetServiceAllInfoOut;

                            that.inpDtoNm = data.inpDtoNm;

                            // 기본속성
                            that.setBaseAttribute(data);
                            
                            // 서비스 입력항목
                            if (data.atrbtList != null || data.atrbtList.length > 0) {
                            	that.CAPSV008GridSrvcInpItm.setData(data.atrbtList);
                            	
                            }
                            // 서비스 출력항목
                            if (data.outpList != null || data.outpList.length > 0) {
                            	that.CAPSV008GridSrvcOutpItm.setData(data.outpList);
                            	
                            }
                            
                            // 서비스 프로파일
                            if (data.prflList != null || data.prflList.length > 0) {
                            	that.CAPSV008GridSrvcPrfl.setData(data.prflList);
                            }
                            
                            // 거래제한 은 화면설계서 수정 되면 한다.
                            
                            
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },
            
            inquireServiceData2: function (param) {
                // header 정보 set
                var that = this;
                var sParam = {};
                this.list = [];
                
                this.inpDtoNm = "";

                sParam.instCd   = $.sessionStorage('headerInstCd');
                sParam.cmpntCd   = param.cd;
                
                // 조회 key값 set
                sParam.srvcCd = null;
                sParam.srvcNm = null;
                sParam.useYn = null;
                sParam.srvcStsCd = null;
                sParam.txRstrctnCntnt =null;
                
                //sParam.inpDtoNm = param.inpDtoNm;

                var linkData = {"header": fn_getHeader("CAPSV0328400"), "CaStdSrvcIoMgmtSvcGetInstSrvcListIn": sParam};

                 //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    //loading 설정
                    enableLoading: true,
                    success: function (responseData) {

                        if (fn_commonChekResult(responseData)) {
                            if (responseData.CaStdSrvcIoMgmtSvcGetInstSrvcListOut) {
                                var tbList = responseData.CaStdSrvcIoMgmtSvcGetInstSrvcListOut.tblNm;
                                var totalCount = tbList.length;

                                if (tbList != null || tbList.length > 0) {
                                	
                                    $(tbList).each(function(idx, data) {
                                        var temp001 = data;
                                        var newNodeData = {};
                                        newNodeData.srvcCd = data.srvcCd;
                                        newNodeData.srvcNm = data.srvcNm;
                                        newNodeData.cmpntCd = data.cmpntCd;
                                        newNodeData.cd = data.cmpntCd;
                                        newNodeData.cdNm = data.srvcNm;
                                        //newNodeData.srvc = data.srvcCd;

                                        list.push(newNodeData);

//                                        console.log(newNodeData);
                                        that.CAPSV008Tree.addNode(data.cmpntCd, newNodeData);
                                    });
                                    
                                   // that.CAPSV032Grid.setData(tbList);
                                    that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totalCount)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                }
                            }
                        }
                    }
                });
            },
            
            /**
             * 그리드의 IO 관리 버튼 클릭
             * 입력값중 목록으로 되어 있는것들은 DTO명의 버튼이 생성 되어 목록 안의 DTO 를 수정 할수 있도록 한다.
             */
            dtoManger: function (dtoNm) {
                var that = this;
                
                var param = {};
                param.inpDtoNm = dtoNm;
                that.inpDtoNm = param.inpDtoNm;
                param.instCd  = $.sessionStorage('headerInstCd');
                
                var linkData = {"header": fn_getHeader("CAPSV0308401"), "CaStdSrvcIoMgmtSvcGetStdSrvcIOListIn": param};

                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                        	// 서비스 입력항목
                        	var data = responseData.CaStdSrvcIoMgmtSvcGetStdSrvcIOListOut;
                        	
                            if (data.atrbtList != null || data.atrbtList.length > 0) {
                            	
                            	if(that.$el.find(".on-tab")[0].id==="tab-srvcOutpItm"){
                         			that.CAPSV008GridSrvcOutpItm.setData(data.atrbtList);
                         		}else{
                         			that.CAPSV008GridSrvcInpItm.setData(data.atrbtList);
                         		}
                            }
                        }
                    }   // end of suucess: fucntion
                });     // end of bxProxy
            },
            
            /**
             * 다국어 화면으로 이동
             */
            openMultiLanguagePage: function () {
                this.$el.trigger({
                    type: 'open-conts-page',
                    pageHandler: 'CAPCM190',
                    pageDPName: bxMsg('cbb_items.SCRN#CAPCM190'),
                    pageInitialize: true,
                    pageRenderInfo: {
                        trnsfrKnd : "SRVC_NAME", // 서비스명
                        trnsfrOriginKeyVal : this.$el.find('#base-attribute-area [data-form-param="srvcCd"]').val() // 서비스코드
                    }
                });
            },

            openCodeSearchPopup: function () {
                var that = this;
                var param = {};
                var code = this.$el.find('#service-input-item-area [data-form-param="atrbtVldtnRule"]').val();

                if(code) {
                    param.cdNbr = code;
                }

                this.popupCodeSearch = new PopupCodeSearch(param);
                this.popupCodeSearch.render();
                this.popupCodeSearch.on('popUpSetData', function (data) {
                    that.$el.find('#service-input-item-area [data-form-param="atrbtVldtnRule"]').val(data.cdNbr);
                });
            },

            openClassSearchPopup: function () {
                var that = this;

                this.popupClassSearch = new PopupClassSearch();
                this.popupClassSearch.render();
                this.popupClassSearch.on('popUpSetData', function (data) {
                    that.$el.find('#service-input-item-area [data-form-param="atrbtVldtnXtnRule"]').val(data.classNm);
                });
            },

            /**
             * 기본 속성 영역 초기화
             */
            resetBaseAttribute: function () {
                this.$el.find('#base-attribute-area [data-form-param="cmpnt"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="srvcCd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="srvcNm"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="srvcClass"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="oprtn"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="srvcSts"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="srvcUseYn"]').prop("checked", false);
                this.$el.find('#base-attribute-area [data-form-param="logLvl"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="timeoutSecond"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="txYn"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="txAblStartHms"]').val("00:00:00");
                this.$el.find('#base-attribute-area [data-form-param="txAblEndHms"]').val("23:59:59");

                //that.$el.find('#base-attribute-area [data-form-param="srvcCd"]').prop("readonly", false);
                //that.$el.find('#base-attribute-area [data-form-param="srvcNm"]').prop("readonly", false);
                
                // dto cache 초기화
                var linkData = {"header": fn_getHeader("CAPSV0088302"), "CaSrvcMgmtSvcChngIn": {srvcCd: 'CAPSV0088302'}};

                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: false,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                        	
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },

            /**
             * 서비스 입력 항목 영역 초기화
             */
            resetServiceInputItem: function () {
            	this.inpDtoList=[];
                this.$el.find('#service-input-item-area [data-form-param="stdAtrbtVldtnWay"]').val("");
                this.$el.find('#service-input-item-area [data-form-param="stdAtrbtVldtnRule"]').val("");
                this.$el.find('#service-input-item-area [data-form-param="mndtryYn"]').prop("checked", false);
                this.$el.find('#service-input-item-area [data-form-param="stdAtrbtVldtnXtnRule"]').val("");
                this.$el.find('#service-input-item-area [data-form-param="stdAtrbtVldtnUseYn"]').prop("checked", false);
                this.$el.find('#service-input-item-area [data-form-param="atrbtVldtnWay"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#service-input-item-area [data-form-param="atrbtVldtnRule"]').val("");
                this.$el.find('#service-input-item-area [data-form-param="selectAtrbtVldtnRule"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#service-input-item-area [data-form-param="atrbtVldtnXtnRule"]').val("");

                this.$el.find('#service-input-item-area [data-form-param="stdAtrbtVldtnWay"]').prop("readonly", false);
                this.$el.find('#service-input-item-area [data-form-param="stdAtrbtVldtnRule"]').prop("readonly", false);
                this.$el.find('#service-input-item-area [data-form-param="stdAtrbtVldtnXtnRule"]').prop("readonly", false);

                this.$el.find('#service-input-item-area [data-form-param="atrbtVldtnRule"]').show();
                this.$el.find('#service-input-item-area [data-form-param="selectAtrbtVldtnRule"]').hide();
                this.$el.find('#service-input-item-area #btn-code-search').hide();

                this.CAPSV008GridSrvcInpItm.resetData();
            },
            /**
             * 서비스 출력 항목 영역 초기화
             */
            resetServiceOutputItem: function () {
            	this.outpDtoList=[];
            	this.CAPSV008GridSrvcOutpItm.resetData();
            },

            /**
             * 서비스 프로파일 영역 초기화
             */
            resetServiceProfile: function () {
                this.CAPSV008GridSrvcPrfl.resetData();
            },


            /**
             * 기본 속성 저장
             */
            saveBaseAttribute: function (event) {
                var that = this;

                //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var sParam = {};

                    sParam.srvcCd 			= that.$el.find('#base-attribute-area [data-form-param="srvcCd"]').val();
                    sParam.srvcStsCd		= that.$el.find('#base-attribute-area [data-form-param="srvcSts"]').val();
                    sParam.aplyStartDt 		= fn_getDateValue(that.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]').val());
                    sParam.logLvlCd 		= that.$el.find('#base-attribute-area [data-form-param="logLvl"]').val();
                    sParam.timeoutScnd 	= that.$el.find('#base-attribute-area [data-form-param="timeoutSecond"]').val();
                    sParam.txYn 			= that.$el.find('#base-attribute-area [data-form-param="txYn"]').val();
                    sParam.txAblStartHms 	= fn_getTimeValue(that.$el.find('#base-attribute-area [data-form-param="txAblStartHms"]').val());
                    sParam.txAblEndHms 	    = fn_getTimeValue(that.$el.find('#base-attribute-area [data-form-param="txAblEndHms"]').val());

                    

                    if(that.$el.find('#base-attribute-area [data-form-param="srvcUseYn"]').is(":checked")) {
                        sParam.srvcUseYn = "Y";
                    }
                    else {
                        sParam.srvcUseYn = "N";
                    }

                    sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드

                    var linkData = {"header": fn_getHeader("CAPSV0088201"), "CaSrvcMgmtSvcChngIn": sParam};

                        // ajax호출
                        bxProxy.post(sUrl, JSON.stringify(linkData), {
                            enableLoading: true
                            , success: function (responseData) {
                                if (fn_commonChekResult(responseData)) {
                                    fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                }
                            }   // end of suucess: fucntion
                        }); // end of bxProxy
                }

                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },
            
            /**
             * 서비스 출력항목 저장
             */

            saveServiceOutputItem : function(event){
            	
            },
            
            
            
            /**
             * 서비스입력항목 저장
             */
            saveServiceInputItem: function (event) {
                var that = this;
                var data = this.CAPSV008GridSrvcInpItm.grid.getSelectionModel().selected.items[0].data;
                var atrbtVldtnWayCd = this.$el.find('#service-input-item-area [data-form-param="atrbtVldtnWay"]').val();

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var sParam = {};

                    sParam.inpDtoNm 		    = that.inpDtoNm;
                    sParam.instCd 			    = $.sessionStorage('headerInstCd');
                    sParam.atrbtNm  		    = data.atrbtNm;
                    sParam.xtnAtrbtOriginTblNm 	= data.xtnAtrbtOriginTblNm;
                    sParam.atrbtVldtnWayCd 	    = that.$el.find('#service-input-item-area [data-form-param="atrbtVldtnWay"]').val();
                    sParam.atrbtVldtnXtnRuleCntnt 	= that.$el.find('#service-input-item-area [data-form-param="atrbtVldtnXtnRule"]').val();

                    if(atrbtVldtnWayCd == 'T') {
                        sParam.atrbtVldtnRuleCntnt = that.$el.find('#service-input-item-area [data-form-param="selectAtrbtVldtnRule"]').val();
                    } else {
                        sParam.atrbtVldtnRuleCntnt = that.$el.find('#service-input-item-area [data-form-param="atrbtVldtnRule"]').val();
                    }

                    if(that.$el.find('#service-input-item-area [data-form-param="mndtryYn"]').prop('checked')) {
                        sParam.mndtryYn = 'Y';
                    } else {
                        sParam.mndtryYn = 'N';
                    }

                    if(that.$el.find('#service-input-item-area [data-form-param="stdAtrbtVldtnUseYn"]').prop('checked')) {
                        sParam.stdAtrbtVldtnUseYn = 'Y';
                    } else {
                        sParam.stdAtrbtVldtnUseYn = 'N';
                    }

                    var linkData = {"header": fn_getHeader("CAPSV0308201"), "CaStdSrvcIoMgmtSvcRegisterStdSrvcIOAtrbtIn": sParam};

                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                
                                if(sParam.instCd =='STDA'){
                                	that.selectServiceIO(that);
                                }else{
                                	that.selectInstServiceIO(that); 
                                }
                                
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }

                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },
            
            /**
             * 서비스입력항목 조회
             */
            selectServiceIO : function(that) {
                var param = {};
                param.inpDtoNm = that.inpDtoNm;
                
                var linkData = {"header": fn_getHeader("CAPSV0308401"), "CaStdSrvcIoMgmtSvcGetStdSrvcIOListIn": param};

                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                        	// 서비스 입력항목
                        	var data = responseData.CaStdSrvcIoMgmtSvcGetStdSrvcIOListOut;
                        	
                        	// 서비스 입력항목
                            that.resetServiceInputItem();
                            if (data.atrbtList != null || data.atrbtList.length > 0) {
                            	that.CAPSV008GridSrvcInpItm.setData(data.atrbtList);
                            }
                        }
                    }   // end of suucess: fucntion
                });     // end of bxProxy
            },
            
            selectInstServiceIO : function(that) {
                var param = {};
                param.inpDtoNm = that.inpDtoNm;
                param.instCd = $.sessionStorage('headerInstCd');
                
                var linkData = {"header": fn_getHeader("CAPSV0318401"), "CaStdSrvcIoMgmtSvcGetStdSrvcIOListIn": param};

                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                        	// 서비스 입력항목
                        	var data = responseData.CaStdSrvcIoMgmtSvcGetStdSrvcIOListOut;
                        	
                        	// 서비스 입력항목
                            that.resetServiceInputItem();
                            if (data.atrbtList != null || data.atrbtList.length > 0) {
                            	that.CAPSV008GridSrvcInpItm.setData(data.atrbtList);
                            	
                            }
                        }
                    }   // end of suucess: fucntion
                });     // end of bxProxy
            },
            
            //
            saveServiceProfile: function (event) {
                var that = this;
                var records = this.CAPSV008GridSrvcPrfl.getChangedRecords('srvcPrflCntnt');
                var item = {};

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var sParam = {};
                    sParam.tblNm = [];

                    if (records.length == 0) {
                        fn_alertMessage("", bxMsg("cbb_err_msg.AUICME0004"));
                        return;
                    }
                    
                    var srvcCd, inpDtoNm;
                    
                    $(records).each(function(index, value) {
                    	console.log(value);
                    	if(index == 0) {
                    		srvcCd = value.data.srvcCd;
                    	}
                    	
                        item = {};
                        item.instCd             = $.sessionStorage('headerInstCd');
                        item.srvcCd             = value.data.srvcCd;
                        item.srvcPrflAtrbtNm    = value.data.srvcPrflAtrbtNm;
                        item.instSrvcPrflCntnt  = value.data.instSrvcPrflCntnt;
                        item.srvcPrflCntnt      = value.data.srvcPrflCntnt;
                        sParam.tblNm.push(item);
                    });

                    var linkData = {"header": fn_getHeader("CAPSV0088202"), "CaSrvcPrflMgmtSvcRegisterInstSrvcPrflIn": sParam};
                    
                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                
                                // 서비스프로파일 재조회
                                that.selectServicProfile(that);
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
            }

                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },
            
            /**
             * 서비스프로파일 조회
             */
            selectServicProfile : function(that) {
            	
            	var param = {};
                param.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                param.srvcCd = that.$el.find('#base-attribute-area [data-form-param="srvcCd"]').val();
                
                var linkData = {"header": fn_getHeader("CAPSV0058402"), "CaStdSrvcIoMgmtSvcGetSrvcPrflIn": param};

                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                        	// 서비스 입력항목
                        	var data = responseData.CaStdSrvcIoMgmtSvcGetSrvcPrflOut;
                        	
                        	// 서비스 프로파일
                            if (data.tblNm != null || data.tblNm.length > 0) {
                            	that.CAPSV008GridSrvcPrfl.setData(data.tblNm);
                            }
                        }
                    }   // end of suucess: fucntion
                });     // end of bxProxy
                
            	
            },
            

            deleteBaseAttribute: function (event) {
                var that = this;
                
                //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function deleteData() {
                    var sParam = {};

                    if(!that.$el.find('#base-attribute-area [data-form-param="srvcCd"]').prop("readonly")) {
                        return;
                    }

                    sParam.srvcCd 			= that.$el.find('#base-attribute-area [data-form-param="srvcCd"]').val();
                    sParam.srvcStsCd		= that.$el.find('#base-attribute-area [data-form-param="srvcSts"]').val();
                    sParam.aplyStartDt 		= fn_getDateValue(that.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]').val());
                    sParam.logLvlCd 		= that.$el.find('#base-attribute-area [data-form-param="logLvl"]').val();
                    sParam.timeoutScnd 	= that.$el.find('#base-attribute-area [data-form-param="timeoutSecond"]').val();
                    sParam.txYn 			= that.$el.find('#base-attribute-area [data-form-param="txYn"]').val();
                    sParam.txAblStartHms 	= fn_getTimeValue(that.$el.find('#base-attribute-area [data-form-param="txAblStartHms"]').val());
                    sParam.txAblEndHms 	    = fn_getTimeValue(that.$el.find('#base-attribute-area [data-form-param="txAblEndHms"]').val());

                    if(that.$el.find('#base-attribute-area [data-form-param="srvcUseYn"]').is(":checked")) {
                        sParam.srvcUseYn = "Y";
                    }
                    else {
                        sParam.srvcUseYn = "N";
                    }

                    sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드

                    if(fn_isNull(sParam.srvcCd)) {
                        fn_alertMessage("", bxMsg("cbb_err_msg.ABRVTN#failed"));
                    }

                    for (var sParamVal in sParam) {
                        if (sParam[sParamVal] == '') {
                            fn_alertMessage("", bxMsg("cbb_err_msg.ABRVTN#failed"));
                            return;
                        }
                    }

//                    var linkData = {"header": fn_getHeader("CAPSV0088201"), "CaSrvcMgmtSvcChngIn": sParam};
                    var linkData = {"header": fn_getHeader("CAPSV0088301"), "CaSrvcMgmtSvcChngIn": sParam};

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
                                that.resetServiceInputItem();
                                that.resetServiceOutputItem();
                                that.resetServiceProfile();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }

                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), deleteData, this);
            },

            /**
             * 서비스 입력 항목의 그리드 항목 클릭
             */
            clickGridOfServiceInputItem: function () {
                var selectedRecord = this.CAPSV008GridSrvcInpItm.grid.getSelectionModel().selected.items[0];

                if (!selectedRecord) {
                    return;
                } else {
                    this.setServiceInputItem(selectedRecord.data);
                }
            },

            /**
             * 속성 검증 규칙 변경
             */
            changeAttributeValidationRule: function () {
                var atrbtVldtnWayCd         = this.$el.find('#service-input-item-area [data-form-param="atrbtVldtnWay"]').val();

                var $codeSearchButton       = this.$el.find('#service-input-item-area #btn-code-search');
                var $inputAtrbtVldtnRule    = this.$el.find('#service-input-item-area [data-form-param="atrbtVldtnRule"]');
                var $selectAtrbtVldtnRule   = this.$el.find('#service-input-item-area [data-form-param="selectAtrbtVldtnRule"]');

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


            
            /*
             * tab 조절
             * */
            clickTapInput : function(event) {
            	this.$el.find("#tab-title > ul > li").removeClass("on-tab");
            	this.$el.find("#tab-srvcInpItm").addClass("on-tab");
            	this.$el.find("#service-input-item-area").show();
            	this.$el.find("#service-output-item-area").hide();
            	this.$el.find("#service-profile-area").hide();
            	this.CAPSV008GridSrvcInpItm.grid.getView().refresh();
            },


            clickTapOutput : function(event) {
            	this.$el.find("#tab-title > ul > li").removeClass("on-tab");
            	this.$el.find("#tab-srvcOutpItm").addClass("on-tab");
            	this.$el.find("#service-output-item-area").show();
            	this.$el.find("#service-input-item-area").hide();
            	this.$el.find("#service-profile-area").hide();
            	this.CAPSV008GridSrvcOutpItm.grid.getView().refresh();
            	
            },
            clickTapPrfl : function(event) {
            	this.$el.find("#tab-title > ul > li").removeClass("on-tab");
            	this.$el.find("#tab-srvcPrfl").addClass("on-tab");
            	this.$el.find("#service-profile-area").show();
            	this.$el.find("#service-output-item-area").hide();
            	this.$el.find("#service-input-item-area").hide();
            	this.CAPSV008GridSrvcPrfl.grid.getView().refresh();
            	
            },
            
            /**
             * 입력항목 상위클래스 버튼
             */
          	inquireInpUpperClass: function (){
          		
         	   	 if(!this.inpDtoList.length){
                    fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0069'));
         	   		 return;
            	}
         		
         		
         		var dtoNm=this.inpDtoList.pop();
         		this.dtoManger(dtoNm);
         	},
         	
         	/**
         	 * 출력항목 상위클래스 버튼
         	 */
         	inquireOutpUpperClass: function (){
         		
         		if(!this.outpDtoList.length){
         			fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0069'));
         			return;
         		}
         		
         		
         		var dtoNm=this.outpDtoList.pop();
         		console.log(dtoNm);
         		this.dtoManger(dtoNm);
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

            /**
             * 기본 속성 영역 토글
             */
            toggleBaseAttribute: function () {
                fn_pageLayerCtrl(this.$el.find("#base-attribute-area"), this.$el.find('#btn-base-attribute-toggle'));
            },

            /**
             * 서비스 입력항목 영역 토글
             */
            toggleServiceInputItem1: function () {
                fn_pageLayerCtrl(this.$el.find("#service-input-item-area"), this.$el.find('#btn-service-input-item-toggle1'));
            },

            /**
             * 서비스 입력항목 영역 토글
             */
            toggleServiceInputItem2: function () {
            	fn_pageLayerCtrl(this.$el.find("#service-input-item-area"), this.$el.find('#btn-service-input-item-toggle2'));
            },
            /**
             * 서비스 출력항목 영역 토글
             */
            toggleServiceOutputItem: function () {
            	fn_pageLayerCtrl(this.$el.find("#service-output-item-area"), this.$el.find('#btn-service-output-item-toggle'));
            },

            /**
             *서비스 프로파일 영역 토글
             */
            toggleServiceProfile: function () {
                fn_pageLayerCtrl(this.$el.find("#service-profile-area"), this.$el.find('#btn-service-profile-toggle'));
            }
        }); // end of Backbone.View.extend({

        return CAPSV008View;
    } // end of define function
); // end of define
