define(
    [
        'bx/common/config',
        'text!app/views/page/CAPAC/002/_CAPAC002.html',
        'bx-component/ext-grid/_ext-grid',
        'bx-component/bx-tree/bx-tree',
        'bx/common/common-info',
        'app/views/page/popup/CAPAC/popup-acctgItm-search',
        'app/views/page/popup/CAPAT/popup-brnchCd'
    ]
    , function (
        config,
        tpl,
        ExtGrid,
        bxTree,
        commonInfo,
        PopupAcctgItmSearch,
        PopupDeptSearch
    ) {


        /**
         * Backbone
         */
        var CAPAC002View = Backbone.View.extend({
            // set tag name 
            tagName: 'section',
            // set class name
            className: 'bx-container CAPAC002-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'keydown #searchKey': 'pressEnterInTree',


                'click #btn-base-attribute-reset': 'resetBaseAttribute',
                'click #btn-journalizing-department-attribute-reset': 'resetJournalizingDepartmentAttribute',


                'click #btn-base-attribute-save': 'saveBaseAttribute',
                'click #btn-journalizing-department-save': 'saveJournalizingDepartment',
                'click #btn-journalizing-department-attribute-save': 'saveJournalizingDepartmentAttribute',


                'click #btn-acctgItm-add': 'addAcctgAttribute',
                'click #btn-tree-search': 'searchTreeList',
                'click #btn-tree-next-search': 'nextSearchTreeList',


//                'click #btn-acctgItmCd-search': 'openAcctgItmSearchPopup',
                'click #btn-acctgItmCd-search': 'searchTreeList',
                'click #btn-upAcctgItmCd-search': 'openUpAcctgItmSearchPopup',
                'click #btn-rltvAcctgItmCd-search': 'openRltvAcctgItmSearchPopup',


                'click #btn-deptId-search': 'openDeptSearchPopup',


                'click #btn-tree-hide': 'hideTree',
                'click #btn-tree-show': 'showTree',


                'click #btn-base-attribute-toggle': 'toggleBaseAttribute',
                'click #btn-journalizing-department-toggle': 'toggleJournalizingDepartment',
                'click #btn-journalizing-department-attribute-toggle': 'toggleJournalizingDepartmentAttribute'
            },


            /**
             * 초기화
             */
            initialize: function (initData) {
                $.extend(this, initData);


                this.initData = initData;


                // 초기화 버튼클릭시와 추가버튼 클릭시 true 한다. 조회시 false 로 한다.
                this.initFlag = true; // 신규여부
                this.deptInitFlag = true; // 계정처리가능점 신규 여부
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
                this.$el.find('.bx-tree-root').html(this.CAPAC002Tree.render());


                // 단일탭 그리드 렌더
                this.$el.find("#CAPAC002Grid").html(this.CAPAC002Grid.render({'height': CaGridHeight}));


                this.init_pagingInfo();
//                this.loadTreeList();


                this.setComboBoxes();
                this.setDatePicker();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPAC002-wrap #btn-base-attribute-save')
                                    		,this.$el.find('.CAPAC002-wrap #btn-journalizing-department-save')
                                    		,this.$el.find('.CAPAC002-wrap #btn-journalizing-department-attribute-save')
                                    			   ]);
                return this.$el;
            },


            /**
             * 트리 생성
             */
            createTree: function () {
                var that = this;


                this.CAPAC002Tree = new bxTree({
                    fields: {id: 'acctgItmCd', value: 'acctgItmNm'},


                    // Tree Item - Checkbox Use Yn
                    checkAble: false,


                    listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {
                        	if(itemData.acctgItmCd) {            		   
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


                this.CAPAC002Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'deptId', 'deptNm', 'aplyStartDt', 'aplyEndDt', 'acctgItmCd', 'acctgDscd'
                    ]
                    , id: 'CAPAC002Grid'
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
                            text: bxMsg('cbb_items.SCRNITM#deptId'),
                            flex: 1,
                            dataIndex: 'deptId',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#deptNm'),
                            flex: 1,
                            dataIndex: 'deptNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#aplyStartDt'),
                            flex: 1,
                            dataIndex: 'aplyStartDt',
                            style: 'text-align:center',
                            align: 'left',
                            type: 'date',
                            renderer: function (value) {
                                return XDate(value).toString('yyyy-MM-dd');
                            }
                        },
                        {
                            text: bxMsg('cbb_items.AT#aplyEndDt'),
                            flex: 1,
                            dataIndex: 'aplyEndDt',
                            style: 'text-align:center',
                            align: 'left',
                            type: 'date',
                            renderer: function (value) {
                                return XDate(value).toString('yyyy-MM-dd');
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
                        },
                        {
                        	text: bxMsg('cbb_items.SCRNITM#acctgItmCd'),
                        	dataIndex: 'acctgItmCd',
                        	hidden : true
                        },
                        {
                        	text: bxMsg('cbb_items.SCRNITM#acctgDscd'),
                        	dataIndex: 'acctgDscd',
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


                // combobox 정보 셋팅
                sParam.className = "CAPAC002-acctgDstnctn-wrap";
                sParam.targetId = "acctgDstnctn";
//                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "51011"; // 회계구분코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPAC002-bsisDstnctn-wrap";
                sParam.targetId = "bsisDstnctn";
//                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "51010"; // BSIS구분코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPAC002-acctgDstnctn2-wrap";
                sParam.targetId = "acctgDstnctn2";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "51011"; // 회계구분코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPAC002-bsisDstnctn2-wrap";
                sParam.targetId = "bsisDstnctn2";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "51010"; // BSIS구분코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPAC002-dbCdtDstnctn-wrap";
                sParam.targetId = "dbCdtDstnctn";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "A0412"; // 차대변구분코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPAC002-titlAcctgCl-wrap";
                sParam.targetId = "titlAcctgCl";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "51012"; // 계정과목분류코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPAC002-outpLvl-wrap";
                sParam.targetId = "outpLvl";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all');
                sParam.cdNbr = "51016"; // 출력레벨구분코드
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
            },


            /**
             * 달력생성
             */
            setDatePicker: function () {
                fn_makeDatePicker(this.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]'));
                fn_makeDatePicker(this.$el.find('#base-attribute-area [data-form-param="aplyEndDt"]'));
                fn_makeDatePicker(this.$el.find('#journalizing-department-attribute-area [data-form-param="aplyStartDt"]'));
                fn_makeDatePicker(this.$el.find('#journalizing-department-attribute-area [data-form-param="aplyEndDt"]'));
            },


            /**
             * 계정과목 추가 버튼 클릭
             * 현재 계정과목코드, 계정과목명을 저장후 기본속성을 리셋 하고
             * 계정과목코드를 상위계정과목 코드로 변경 한다.
             * 등록여부를 설정 한다.
             */
            addAcctgAttribute : function() {
            	this.initFlag = true;
            	var acctgItmCd, acctgItmNm, acctgDscd;


            	acctgItmCd = this.$el.find('#base-attribute-area [data-form-param="acctgItmCd"]').val();
            	acctgItmNm = this.$el.find('#base-attribute-area [data-form-param="acctgItmNm"]').val();
            	acctgDscd = this.$el.find('#base-attribute-area [data-form-param="acctgDstnctn"]').val();


            	if(acctgItmCd && acctgItmNm && acctgDscd) {
            		this.resetBaseAttribute();
            		this.$el.find('#base-attribute-area [data-form-param="upAcctgItmNm"]').prop("disabled", true);
            		this.$el.find('#base-attribute-area [data-form-param="acctgDstnctn"]').prop("disabled", true);


            		this.$el.find('#base-attribute-area [data-form-param="upAcctgItmCd"]').val(acctgItmCd);
                    this.$el.find('#base-attribute-area [data-form-param="upAcctgItmNm"]').val(acctgItmNm);
                    this.$el.find('#base-attribute-area [data-form-param="acctgDstnctn"]').val(acctgDscd);
            	}
            },


            /**
             * 기본속성 설정
             */
            setBaseAttribute: function (data) {
            	this.initFlag = false;
            	this.$el.find('#base-attribute-area [data-form-param="acctgItmCd"]').val(data.acctgItmCd);
                this.$el.find('#base-attribute-area [data-form-param="acctgItmNm"]').val(data.acctgItmNm);


                // 계정과목약어명
                this.$el.find('#base-attribute-area [data-form-param="acctgItmAbrvtnNm"]').val(data.acctgTitlAcctgAbrvtnNm);
                this.$el.find('#base-attribute-area [data-form-param="upAcctgItmCd"]').val(data.upAcctgItmCd);
                this.$el.find('#base-attribute-area [data-form-param="upAcctgItmNm"]').val(data.upAcctgItmNm);


                // 회계구분
                this.$el.find('#base-attribute-area [data-form-param="acctgDstnctn"]').val(data.acctgDscd);
                this.$el.find('#base-attribute-area [data-form-param="bsisDstnctn"]').val(data.bsisDscd);
                this.$el.find('#base-attribute-area [data-form-param="dbCdtDstnctn"]').val(data.debitCrdtDscd);


                // 계정과목분류
                this.$el.find('#base-attribute-area [data-form-param="titlAcctgCl"]').val(data.titlAcctgClCd);
                this.$el.find('#base-attribute-area [data-form-param="outpSeqNbr"]').val(data.acctgItmOutpSeqNbr);
                this.$el.find('#base-attribute-area [data-form-param="outpLvl"]').val(data.glOutpLvlDscd);


                // 양변계정
                this.$el.find('#base-attribute-area #btsdAcct').prop("checked", data.btsdAcctgItmYn == "Y" ? true : false);
                this.$el.find('#base-attribute-area [data-form-param="rltvAcctgItmCd"]').val(data.rltdAcctgItmCd);
                this.$el.find('#base-attribute-area [data-form-param="rltvAcctgItmNm"]').val(data.rltdAcctgItmNm);


                // 실계정과목
                this.$el.find('#base-attribute-area #realTitlAcctg').prop("checked", data.realTitlAcctgYn == "Y" ? true : false);
                this.$el.find('#base-attribute-area #minusBalAllwnc').prop("checked", data.minusBalAllwncYn == "Y" ? true : false);
                this.$el.find('#base-attribute-area #hqAcct').prop("checked", data.hqAcctgItmYn == "Y" ? true : false);


                // 처리가능부점등록여부
                this.$el.find('#base-attribute-area #prcsAblBrnchRgstrn').prop("checked", data.prcsAblBrnchRgstrnYn == "Y" ? true : false);
                this.$el.find('#base-attribute-area #frgncTxAmtOcr').prop("checked", data.frgnTxAmtOcrYn == "Y" ? true : false);
                this.$el.find('#base-attribute-area #manualEntryPrmsn').prop("checked", data.manualEntryPrmsnDscd == "1" ? true : false);


                // 젹용시작일
                this.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]').val(XDate(data.aplyStartDt).toString('yyyy-MM-dd'));
                this.$el.find('#base-attribute-area [data-form-param="aplyEndDt"]').val(XDate(data.aplyEndDt).toString('yyyy-MM-dd'));
                this.$el.find('#base-attribute-area [data-form-param="acctgDstnctnNm"]').val(data.acctgDstnctnNm);




                this.$el.find('#base-attribute-area [data-form-param="acctgDstnctn"]').prop("disabled", true);
                this.$el.find('#base-attribute-area [data-form-param="acctgItmCd"]').prop("disabled", true);
                this.$el.find('#base-attribute-area [data-form-param="upAcctgItmNm"]').prop("disabled", true);
                this.$el.find('#base-attribute-area [data-form-param="rltvAcctgItmNm"]').prop("disabled", true);
                this.$el.find('#base-attribute-area #prcsAblBrnchRgstrn').prop("disabled", true);
            },


            /**
             * 계정처리 가능점 그리드 설정
             */
            setJournalizingDepartment: function (data) {
                this.CAPAC002Grid.setData(data);
            },


            /**
             * 계정처리 가능점 속성 설정
             */
            setJournalizingDepartmentAttribute: function (data) {
            	this.deptInitFlag = false;
            	this.$el.find('#journalizing-department-attribute-area [data-form-param="deptId"]').prop("disabled", true);
            	this.$el.find('#journalizing-department-attribute-area #btn-deptId-search').prop("disabled", true);
            	this.$el.find('#journalizing-department-attribute-area [data-form-param="deptNm"]').prop("disabled", true);
            	this.$el.find('#journalizing-department-attribute-area [data-form-param="aplyStartDt"]').prop("disabled", true);


            	this.$el.find('#journalizing-department-attribute-area [data-form-param="acctgDscd"]').val(data.acctgDscd);
            	this.$el.find('#journalizing-department-attribute-area [data-form-param="acctgItmCd"]').val(data.acctgItmCd);
            	this.$el.find('#journalizing-department-attribute-area [data-form-param="deptId"]').val(data.deptId);
            	this.$el.find('#journalizing-department-attribute-area [data-form-param="deptNm"]').val(data.deptNm);
            	this.$el.find('#journalizing-department-attribute-area [data-form-param="aplyStartDt"]').val(XDate(data.aplyStartDt).toString('yyyy-MM-dd'));
            	this.$el.find('#journalizing-department-attribute-area [data-form-param="aplyEndDt"]').val(XDate(data.aplyEndDt).toString('yyyy-MM-dd'));
            },


            /**
             * 계정과목트리 초기화
             */
            initTreeList: function () {
                this.$el.find('[data-form-param="searchKey"]').val(this.initData.param.srvcCd);


                this.searchTreeList();


                if(this.initData.param.srvcCd && this.initData.param.srvcNm) {
                    console.log(this.initData);
                    this.CAPAC002Tree.selectItem(this.initData.param.srvcCd, false);
                    // 상세조회
                    var sParam = {};


                    this.inquireServiceData(sParam); // 조회
                }
            },


            /**
             * 트리조회 초기화
             */


            init_pagingInfo : function() {
         	   var that = this;
         	   that.pgNbr = 1; // 페이지번호
         	   that.pgCnt = 500; // 페이지건수
         	   that.acctgList = [];
            },


            /**
             * 트리 조회
             */
            loadTreeList: function () {
                var that = this;
                var sParam = {};


                sParam.instCd       = $.sessionStorage('headerInstCd');
                sParam.acctgDscd = this.$el.find('#tree-numbering-list .CAPAC002-acctgDstnctn-wrap').val();
                sParam.bsisDscd = this.$el.find('#tree-numbering-list .CAPAC002-bsisDstnctn-wrap').val();
                sParam.acctgItmCd = this.$el.find('#tree-numbering-list [data-form-param="acctgItmCd"]').val();
                sParam.acctgItmNm = this.$el.find('#tree-numbering-list [data-form-param="searchKey"]').val();
                var chkCloseAcctgInqryYn = this.$el.find('#tree-numbering-list').find("#abltnAcctgItm").is(":checked");


                if(chkCloseAcctgInqryYn) {
                	sParam.closeAcctgInqryYn = "Y";
                }
                else {
                	sParam.closeAcctgInqryYn = "N";
                }


                sParam.pgNbr = this.pgNbr;
                sParam.pgCnt = this.pgCnt;


                var linkData = {"header" : fn_getHeader("CAPAC0018402") , "CaCoaMgmtSvcGetCoaListIn" : sParam};


                this.treeList = [];


                bxProxy.post(sUrl, JSON.stringify(linkData),{
                    enableLoading: true,
                    success: function (responseData) {
                        if(fn_commonChekResult(responseData)) {
                            var list = responseData.CaCoaMgmtSvcGetCoaTreeListOut.children;


                            if(that.pgNbr == 1) { 
                            	that.CAPAC002Tree.renderItem(list);
                            	that.acctgList = list;
                            	that.treeList = list;
                 		   }


                 		   else	{                    			   
                 			   //다음
                 			   	that.acctgList = that.acctgList.concat(list);
                 			   	that.CAPAC002Tree.renderItem(that.acctgList);
                 			   	that.treeList = that.acctgList;
                 		   }


                            if(sParam.acctgItmCd) {
                            	that.CAPAC002Tree.selectItem(sParam.acctgItmCd);
                            	// 트리 단건 클릭
                            	var param = {};
                            	param.acctgDscd = sParam.acctgDscd ? sParam.acctgDscd : "01";
                            	param.acctgItmCd = sParam.acctgItmCd;


                            	that.inquireServiceData(param);
                            }


                            if(responseData.CaCoaMgmtSvcGetCoaTreeListOut.inqryCnt > that.$el.find('.bx-tree-node-conts').length) {
                            	that.$el.find('#btn-tree-next-search').prop("disabled", false);
                            }


                            if(sParam.acctgItmCd.length > 0 || sParam.acctgItmNm.length > 0){
                            	that.$el.find('#btn-tree-next-search').prop("disabled", true);
                            }


                            $('.bx-tree-floor-item :contains("Y")').css("background-color","gainsboro");


                        }
                    }
                });
            },


            /**
             * 트리 리스트 항목 중 검색 조건에 해당하는 항목을 검색
             */
            searchTreeList: function () {
            	this.init_pagingInfo();
                this.loadTreeList();
            },
            /**
             * 트리 리스트 항목 중 검색 조건에 해당하는 항목을 검색
             */
            nextSearchTreeList: function () {
            	this.pageNum++;
            	this.loadTreeList();
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


            selectGridRecord: function () {
                var selectedRecord = this.CAPAC002Grid.grid.getSelectionModel().selected.items[0];


                if (!selectedRecord) {
                    return;
                } else {
                    this.setJournalizingDepartmentAttribute(selectedRecord.data);
                }
            },


            /**
             * 트리 항목 선택시 서비스 데이터 조회
             * 계정과목 상세 조회
             * @param param
             */
            inquireServiceData: function (param) {
                // header 정보 set
                var that = this;
                var sParam = {};


                sParam.instCd       = $.sessionStorage('headerInstCd');
                sParam.acctgDscd = param.acctgDscd;
                sParam.acctgItmCd = param.acctgItmCd;


                var linkData = {"header": fn_getHeader("CAPAC0018401"), "CaCoaMgmtSvcGetCoaListIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
//                        	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                        	// 기본속성에 설정
                            var data = responseData.CaCoaMgmtSvcGetCoaIO;


                            if(data != null) {
                                // 기본속성
                                that.setBaseAttribute(data);


                                // 계정처리가능점 목록조회
                                that.inquireAccountingAbleDeptData(data);
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            /**
             * 계정처리가능점목록조회
             * 계정과목코드로 조회 한다.
             */
            inquireAccountingAbleDeptData: function (param) {
            	// header 정보 set
            	var that = this;
            	var sParam = {};


            	sParam.instCd       = $.sessionStorage('headerInstCd');
            	sParam.acctgDscd = param.acctgDscd;
            	sParam.acctgItmCd = param.acctgItmCd;
//            	sParam.deptId = param.deptId;
//                sParam.aplyStartDt = param.aplyStartDt;
//                sParam.aplyEndDt = param.aplyEndDt;


            	var linkData = {"header": fn_getHeader("CAPAC0048400"), "CaCoaMgmtSvcAcctgAbilBrnchIO": sParam};


            	// ajax호출
            	bxProxy.post(sUrl, JSON.stringify(linkData), {
            		enableLoading: true
            		, success: function (responseData) {
            			that.deleteList = [];
            			that.resetJournalizingDepartmentAttribute();


            			if (fn_commonChekResult(responseData)) {
            				var data = responseData.CaCoaMgmtSvcAcctgAbilBrnchListOut.tblNm;


            				if(data != null) {
            					that.$el.find('#journalizing-department-attribute-area [data-form-param="acctgDscd"]').val(sParam.acctgDscd);
            					that.$el.find('#journalizing-department-attribute-area [data-form-param="acctgItmCd"]').val(sParam.acctgItmCd);
            					that.setJournalizingDepartment(data);
            				}
            			}
            			else {
            				that.resetJournalizingDepartment();
            				that.resetJournalizingDepartmentAttribute();
            			}
            		}   // end of suucess: fucntion
            	}); // end of bxProxy
            },


            /**
             * 트리 계정과목 팝업
             */
            openAcctgItmSearchPopup: function () {
                var that = this;
                var param = {};


                this.popupUpAcctgItmSearch = new PopupAcctgItmSearch();
                this.popupUpAcctgItmSearch.render();
                this.popupUpAcctgItmSearch.on('popUpSetData', function (data) {
                	that.$el.find('#tree-numbering-list #acctgItmCd').val(data.acctgItmCd);
                	that.$el.find('#tree-numbering-list [data-form-param="searchKey"]').val(data.acctgItmNm);
                });
            },


            /**
             * 기본속성 상위 계정과목 팝업
             */
            openUpAcctgItmSearchPopup: function () {
            	var that = this;
            	var param = {};


            	this.popupUpAcctgItmSearch = new PopupAcctgItmSearch();
            	this.popupUpAcctgItmSearch.render();
            	this.popupUpAcctgItmSearch.on('popUpSetData', function (data) {
            		that.$el.find('#tree-numbering-list #acctgItmCd').val(data.acctgItmCd);
            		that.$el.find('#tree-numbering-list [data-form-param="searchKey"]').val(data.acctgItmNm);
            	});
            },


            /**
             * 기본속성 상대 계정과목 팝업
             */
            openRltvAcctgItmSearchPopup: function () {
                var that = this;
                var param = {};


                this.popupRltvAcctgItmSearch = new PopupAcctgItmSearch();
                this.popupRltvAcctgItmSearch.render();
                this.popupRltvAcctgItmSearch.on('popUpSetData', function (data) {
                    that.$el.find('#base-attribute-area [data-form-param="rltvAcctgItmCd"]').val(data.acctgItmCd);
                    that.$el.find('#base-attribute-area [data-form-param="rltvAcctgItmNm"]').val(data.acctgItmNm);
                });
            },


            /**
             * 계정처리 가능점 부서 팝업
             */
            openDeptSearchPopup: function () {
                var that = this;
                var param = {};


                this.popupDeptSearch = new PopupDeptSearch();
                this.popupDeptSearch.render();
                this.popupDeptSearch.on('popUpSetData', function (data) {
                    that.$el.find('#journalizing-department-attribute-area [data-form-param="deptId"]').val(data.deptId);
                    that.$el.find('#journalizing-department-attribute-area [data-form-param="deptNm"]').val(data.deptNm);
                });
            },


            /**
             * 기본속성 초기화
             */
            resetBaseAttribute: function () {
            	this.initFlag = true;
                this.$el.find('#base-attribute-area [data-form-param="acctgItmCd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="acctgItmNm"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="acctgItmAbrvtnNm"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="upAcctgItmCd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="upAcctgItmNm"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="acctgDstnctn"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="bsisDstnctn"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="dbCdtDstnctn"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="titlAcctgCl"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="outpSeqNbr"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="outpLvl"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area #btsdAcct').prop("checked", false);
                this.$el.find('#base-attribute-area [data-form-param="rltvAcctgItmCd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="rltvAcctgItmNm"]').val("");
                this.$el.find('#base-attribute-area #realTitlAcctg').prop("checked", false);
                this.$el.find('#base-attribute-area #minusBalAllwnc').prop("checked", false);
                this.$el.find('#base-attribute-area #hqAcct').prop("checked", false);
                this.$el.find('#base-attribute-area #prcsAblBrnchRgstrn').prop("checked", false);
                this.$el.find('#base-attribute-area #frgncTxAmtOcr').prop("checked", false);
                this.$el.find('#base-attribute-area #manualEntryPrmsn').prop("checked", false);
                this.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]').val(getCurrentDate("yyyy-mm-dd"));
                this.$el.find('#base-attribute-area [data-form-param="aplyEndDt"]').val(getCurrentDate("yyyy-mm-dd"));


                this.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]').val(getCurrentDate("yyyy-mm-dd"));     //적용시작년월일
                this.$el.find('#base-attribute-area [data-form-param="aplyEndDt"]').val("");     //적용종료년월일
                this.$el.find('#base-attribute-area [data-form-param="acctgDstnctnNm"]').val("");


                this.$el.find('#base-attribute-area [data-form-param="acctgDstnctn"]').prop("disabled", false);
                this.$el.find('#base-attribute-area [data-form-param="acctgItmCd"]').prop("disabled", false);
                this.$el.find('#base-attribute-area [data-form-param="upAcctgItmNm"]').prop("disabled", true);
                this.$el.find('#base-attribute-area [data-form-param="rltvAcctgItmNm"]').prop("disabled", true);
                this.$el.find('#base-attribute-area #prcsAblBrnchRgstrn').prop("disabled", false); 
            },


            /**
             * 계정처리 가능점 속성 초기화
             */
            resetJournalizingDepartmentAttribute: function () {
            	this.deptInitFlag = true;


            	this.$el.find('#journalizing-department-attribute-area [data-form-param="deptId"]').val("");
                this.$el.find('#journalizing-department-attribute-area [data-form-param="deptNm"]').val("");
                this.$el.find('#journalizing-department-attribute-area [data-form-param="aplyStartDt"]').val(getCurrentDate("yyyy-mm-dd"));
                this.$el.find('#journalizing-department-attribute-area [data-form-param="aplyEndDt"]').val("9999-12-31");


                this.$el.find('#journalizing-department-attribute-area [data-form-param="deptId"]').prop("disabled", false);
            	this.$el.find('#journalizing-department-attribute-area #btn-deptId-search').prop("disabled", false);
            	this.$el.find('#journalizing-department-attribute-area [data-form-param="aplyStartDt"]').prop("disabled", false);
            },


            /**
             * 계정처리가능점 그리드 초기화
             */
            resetJournalizingDepartment : function() {
            	this.CAPAC002Grid.resetData();
            },


            /**
             * 기본속성 저장
             */
            saveBaseAttribute: function (event) {
                var that = this;

				//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var sParam = {};


                    sParam.newSaveYn = "N";


                    if(that.initFlag) {
                    	sParam.newSaveYn = "Y";
                    }


                    sParam.instCd       = $.sessionStorage('headerInstCd');


                    sParam.acctgDscd                = that.$el.find('#base-attribute-area [data-form-param="acctgDstnctn"]').val();
                    sParam.acctgItmCd               = that.$el.find('#base-attribute-area [data-form-param="acctgItmCd"]').val();
                    sParam.acctgItmNm               = that.$el.find('#base-attribute-area [data-form-param="acctgItmNm"]').val();
                    sParam.bsisDscd                 = that.$el.find('#base-attribute-area [data-form-param="bsisDstnctn"]').val();
                    sParam.acctgTitlAcctgAbrvtnNm   = that.$el.find('#base-attribute-area [data-form-param="acctgItmAbrvtnNm"]').val();
                    sParam.upAcctgItmCd             = that.$el.find('#base-attribute-area [data-form-param="upAcctgItmCd"]').val();
                    sParam.upAcctgItmNm             = that.$el.find('#base-attribute-area [data-form-param="upAcctgItmNm"]').val();
                    sParam.debitCrdtDscd               = that.$el.find('#base-attribute-area [data-form-param="dbCdtDstnctn"]').val();
                    sParam.titlAcctgClCd            = that.$el.find('#base-attribute-area [data-form-param="titlAcctgCl"]').val();
                    sParam.realTitlAcctgYn          = that.$el.find('#base-attribute-area #realTitlAcctg').prop('checked') ? 'Y' : 'N';
                    sParam.minusBalAllwncYn         = that.$el.find('#base-attribute-area #minusBalAllwnc').prop('checked') ? 'Y' : 'N';
                    sParam.hqAcctgItmYn             = that.$el.find('#base-attribute-area #hqAcct').prop('checked') ? 'Y' : 'N';
                    sParam.prcsAblBrnchRgstrnYn     = that.$el.find('#base-attribute-area #prcsAblBrnchRgstrn').prop('checked') ? 'Y' : 'N';
                    sParam.acctgItmOutpSeqNbr       = that.$el.find('#base-attribute-area [data-form-param="outpSeqNbr"]').val();
                    sParam.glOutpLvlDscd            = that.$el.find('#base-attribute-area [data-form-param="outpLvl"]').val();
                    sParam.btsdAcctgItmYn           = that.$el.find('#base-attribute-area #btsdAcct').prop('checked') ? 'Y' : 'N';
                    sParam.rltdAcctgItmCd           = that.$el.find('#base-attribute-area [data-form-param="rltvAcctgItmCd"]').val();
                    sParam.rltdAcctgItmNm           = that.$el.find('#base-attribute-area [data-form-param="rltvAcctgItmNm"]').val();
                    sParam.aplyStartDt              = fn_getDateValue(that.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]').val());
                    sParam.aplyEndDt                = fn_getDateValue(that.$el.find('#base-attribute-area [data-form-param="aplyEndDt"]').val());
                    sParam.frgnTxAmtOcrYn          = that.$el.find('#base-attribute-area #frgncTxAmtOcr').prop('checked') ? 'Y' : 'N';
                    sParam.manualEntryPrmsnDscd       = that.$el.find('#base-attribute-area #manualEntryPrmsn').prop('checked') ? '1' : '2';
                    sParam.acctgDstnctnNm           = that.$el.find('#base-attribute-area [data-form-param="acctgDstnctnNm"]').val();


                    var linkData = {"header": fn_getHeader("CAPAC0018100"), "CaCoaMgmtSvcGetCoaIO": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                // 트리 재조회
                                that.loadTreeList();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            /**
             * 계정처리 가능점 속성 목록 삭제
             */
            saveJournalizingDepartment: function (event) {
                var that = this;
				//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }

                function saveData() {
                    var table = [];
                    var sParam = {};


                    if(that.deleteList.length < 1) {
//                    if(that.deleteList.length < 1 || that.deptInitFlag) {
                    	return;
                    }


                    var acctgDscd = "";
                    var acctgItmCd = "";


                    $(that.deleteList).each(function(idx, data) {
                    	console.log(data);
                        var sub = {};
                        sub.instCd      		 	= $.sessionStorage('headerInstCd');


                        sub.acctgDscd      		= data.acctgDscd;
                        sub.acctgItmCd      	= data.acctgItmCd;
                        sub.deptId      			= data.deptId;
                        sub.aplyStartDt 			= data.aplyStartDt;
                        sub.aplyEndDt   			= data.aplyEndDt; // 헤더의 기관코드


                        acctgDscd = sub.acctgDscd;
                        acctgItmCd = sub.acctgItmCd;


                    	table.push(sub);
                    });


                    sParam.tblNm = table;


                    var linkData = {"header": fn_getHeader("CAPAC0048300"), "CaCoaMgmtSvcAcctgAbilBrnchListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                            	fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                that.deleteList = [];
                                var param = {}; 
                                param.acctgDscd = acctgDscd;
                                param.acctgItmCd = acctgItmCd;


                                that.inquireAccountingAbleDeptData(param);
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#del'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), saveData, this);
            },


            /**
             * 계정처리 가능점 속성 저장
             */
            saveJournalizingDepartmentAttribute: function (event) {
                var that = this;

				//배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                function saveData() {


                    var sParam = {};
                    sParam.instCd       = $.sessionStorage('headerInstCd');
                    sParam.deptId   = that.$el.find('#journalizing-department-attribute-area [data-form-param="deptId"]').val();
                    sParam.deptNm   = that.$el.find('#journalizing-department-attribute-area [data-form-param="deptNm"]').val();
                    sParam.aplyStartDt   = fn_getDateValue(that.$el.find('#journalizing-department-attribute-area [data-form-param="aplyStartDt"]').val());
                    sParam.aplyEndDt   = fn_getDateValue(that.$el.find('#journalizing-department-attribute-area [data-form-param="aplyEndDt"]').val());


//                    sParam.acctgDscd = that.$el.find('#journalizing-department-attribute-area [data-form-param="acctgDscd"]').val();
//              	  	sParam.acctgItmCd = that.$el.find('#journalizing-department-attribute-area [data-form-param="acctgItmCd"]').val();
              	  	sParam.acctgDscd = that.$el.find('#tree-numbering-list .CAPAC002-acctgDstnctn-wrap').val();
              	  	sParam.acctgItmCd = that.$el.find('#base-attribute-area [data-form-param="acctgItmCd"]').val();


                    if(!sParam.deptId || !sParam.acctgDscd || !sParam.acctgItmCd) {
                    	return;
                    }


                    if(sParam.aplyStartDt && sParam.aplyEndDt) {
              		  	if(Number(sParam.aplyStartDt) > Number(sParam.aplyEndDt)){
              		  		fn_alertMessage("", bxMsg('cbb_items.SCRNITM#chkDate'));
              		  		return;
              		  	}
              	  	}


                    var linkData = {"header": fn_getHeader("CAPAC0048100"), "CaCoaMgmtSvcAcctgAbilBrnchIO": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                // 그리드 재조회
                                that.inquireAccountingAbleDeptData(sParam);
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
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
                fn_pageLayerCtrl(this.$el.find("#base-attribute-area"), this.$el.find("#btn-base-attribute-toggle"));
            },


            toggleNumberingRuleComposition: function () {
                fn_pageLayerCtrl(this.$el.find("#journalizing-department-area"),
                    this.$el.find("#btn-journalizing-department-toggle"));
            },


            toggleNumberingRuleCompositionAttribute: function () {
                fn_pageLayerCtrl(this.$el.find("#journalizing-department-attribute-area"),
                    this.$el.find("#btn-journalizing-department-attribute-toggle"));
            }
        }); // end of Backbone.View.extend({


        return CAPAC002View;
    } // end of define function
); // end of define
