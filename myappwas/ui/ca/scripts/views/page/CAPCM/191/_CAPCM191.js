define(
    [
        'bx/common/config',
        'text!app/views/page/CAPCM/191/_CAPCM191.html',
        'bx-component/ext-grid/_ext-grid',
        'bx-component/bx-tree/bx-tree',
        'bx/common/common-info',
    ]
    , function (
        config,
        tpl,
        ExtGrid,
        bxTree,
        commonInfo
    ) {


        /**
         * Backbone
         */
        var CAPCM191View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPCM191-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'keydown #searchKey': 'pressEnterInTree',


                'click #btn-base-attribute-reset': 'resetBaseAttribute',
                'click #btn-limit-setting-reset': 'resetLimitSetting',


                'click #btn-base-attribute-save': 'saveBaseAttribute',
                'click #btn-limit-history-save': 'saveBaseAttribute',
                'click #btn-limit-setting-save': 'saveLimitSetting',


                'click #btn-base-attribute-delete': 'deleteBaseAttribute',


                'click #btn-tree-search': 'searchTreeList',


                'click #btn-tree-hide': 'hideTree',
                'click #btn-tree-show': 'showTree',


                'click #btn-base-attribute-toggle': 'toggleBaseAttribute',
                'click #btn-limit-history-toggle': 'toggleLimitHistory',
                'click #btn-limit-setting-toggle': 'toggleLimitSetting'
            },


            /**
             * 초기화
             */
            initialize: function (initData) {
                $.extend(this, initData);


                this.initData = initData;
                this.deleteList = [];
                this.isNewRole = true;
                this.isNewLimit = true;


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
                this.$el.find('.bx-tree-root').html(this.CAPCM191Tree.render());


                // 단일탭 그리드 렌더
                this.$el.find("#CAPCM191Grid").html(this.CAPCM191Grid.render({'height': CaGridHeight}));


                this.loadTreeList();
                this.setComboBoxes();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPCM191-wrap #btn-base-attribute-save')
                                    		,this.$el.find('.CAPCM191-wrap #btn-base-attribute-delete')
                                    		,this.$el.find('.CAPCM191-wrap #btn-limit-history-save')
                                    		,this.$el.find('.CAPCM191-wrap #btn-limit-setting-save')
                                    			   ]);
                return this.$el;
            },


            /**
             * 트리 생성
             */
            createTree: function () {
                var that = this;


                this.CAPCM191Tree = new bxTree({
                    fields: {id: 'roleId', value: 'roleNm'},


                    // Tree Item - Checkbox Use Yn
                    checkAble: false,


                    listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {
                            if(itemData.roleId) {
                                that.inquireRoleData(itemData);
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


                this.CAPCM191Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'lmtDscd', 'crncyCd', 'maxAmt']
                    , id: 'CAPCM191Grid'
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
                            text: bxMsg('cbb_items.SCRNITM#lmtDstnctn'),
                            flex: 1,
                            dataIndex: 'lmtDscd',
                            style: 'text-align:center',
                            align: 'center',
                            code: 'A0468',
                            renderer : function(val) {
                                return val ? bxMsg("cbb_items.CDVAL#A0468" + val) : "";
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#crncy'),
                            flex: 1,
                            dataIndex: 'crncyCd',
                            style: 'text-align:center',
                            align: 'center',
                            code: 'T0001',
                            renderer: function (val) {
                                return val ? bxMsg("cbb_items.CDVAL#T0001" + val) : "";
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#lmtAmt'),
                            flex: 1,
                            dataIndex: 'maxAmt',
                            style: 'text-align:center',
                            align: 'left'
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
                sParam.className = "CAPCM191-roleStsCd-wrap";
                sParam.targetId = "roleStsCd";
                sParam.cdNbr = "A0054"; // 역할상태코드
                sParam.nullYn = "Y";
              	sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                // 콤보데이터 load
                fn_getCodeList(sParam, this);

                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPCM191-roleTpCd-wrap";
                sParam.targetId = "roleTpCd";
                sParam.cdNbr = "A1124"; // 역할유형코드
                sParam.nullYn = "Y";
              	sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                // 콤보데이터 load
                fn_getCodeList(sParam, this);

                sParam = {};
                // combobox 정보 셋팅
                sParam.className = "CAPCM191-athrtyAplyRngTpCd-wrap";
                sParam.targetId = "athrtyAplyRngTpCd";
                sParam.cdNbr = "A1125"; // 권한적용범위유형코드
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM191-lmtDscd-wrap";
                sParam.targetId = "lmtDscd";
                sParam.cdNbr = "A0468"; // 한도구분코드
                sParam.nullYn = "Y";
              	sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                //combobox 정보 셋팅
                sParam = {};
                sParam.className = "CAPCM191-crncyCd-wrap";
                sParam.targetId = "crncyCd";
                sParam.cdNbr = "T0001"; // 통화코드
                sParam.nullYn = "Y";
              	sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
            },


            setBaseAttribute: function (data) {
                this.isNewRole = false;


                this.$el.find('#base-attribute-area [data-form-param="roleId"]').val(data.roleId);
                this.$el.find('#base-attribute-area [data-form-param="roleNm"]').val(data.roleNm);
                this.$el.find('#base-attribute-area [data-form-param="roleStsCd"]').val(data.roleStsCd);
                this.$el.find('#base-attribute-area [data-form-param="roleTpCd"]').val(data.roleTpCd);
                this.$el.find('#base-attribute-area [data-form-param="athrtyAplyRngTpCd"]').val(data.athrtyAplyRngTpCd);


                this.$el.find('#base-attribute-area [data-form-param="roleId"]').prop('disabled', true);


                this.CAPCM191Grid.resetData();
            },


            setLimitHistory: function (data) {
                this.CAPCM191Grid.setData(data);
            },


            setLimitSetting: function (data) {
                this.isNewLimit = false;


                this.$el.find('#limit-setting-area [data-form-param="lmtDscd"]').val(data.lmtDscd);
                this.$el.find('#limit-setting-area [data-form-param="crncyCd"]').val(data.crncyCd);
                this.$el.find('#limit-setting-area [data-form-param="maxAmt"]').val(data.maxAmt);
            },


            /**
             * 모든 트리 항목들을 로드
             */
            loadTreeList: function () {
                var that = this;
                var sParam = {};


                sParam.instCd   = $.sessionStorage('headerInstCd');


                var linkData = {"header" : fn_getHeader("CAPCM1918402") , "CaRoleMgmtSvcGetRoleListIn" : sParam};


                this.treeList = [];


                bxProxy.post(sUrl, JSON.stringify(linkData),{
                    enableLoading: true,
                    success: function (responseData) {
                        if(fn_commonChekResult(responseData)) {
                            var list = responseData.CaRoleMgmtSvcGetRoleTreeListOut.children;


                            if(list != null) {
                                that.CAPCM191Tree.renderItem(list);
                                that.treeList = list;
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
                    this.CAPCM191Tree.renderItem(this.treeList);
                    return;
                }


                if(this.treeList.length < 1) {
                    return;
                }


                matchingItems = this.findMatchingTreeItems(searchKey);
                this.CAPCM191Tree.renderItem(matchingItems);
            },


            /**
             * 트리 메뉴 중 검색 조건에 해당하는 항목을 반환
             */
            findMatchingTreeItems : function(key) {
                var searchTreeList = [];


                $(this.treeList).each(function(idx, data) {
                    for (var i = 0; i < data.children.length; i++) {
                        var temp001 = data.children[i];
                        if (temp001.roleNm != null && temp001.roleId != null) {
                            if ((temp001.roleNm.indexOf(key) > -1 || temp001.roleId.indexOf(key) > -1)) {
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
                var selectedRecord = this.CAPCM191Grid.grid.getSelectionModel().selected.items[0];


                if (selectedRecord) {
                    this.setLimitSetting(selectedRecord.data);
                }
            },


            /**
             * 트리 항목 선택시 데이터 조회
             * @param param
             */
            inquireRoleData: function (param) {
                // header 정보 set
                var that = this;
                var sParam = {};


                sParam.instCd       = $.sessionStorage('headerInstCd');
                sParam.roleId       = param.roleId;
                sParam.roleNm       = param.roleNm;
                sParam.roleStsCd    = param.roleStsCd;


                var linkData = {"header": fn_getHeader("CAPCM1918401"), "CaRoleMgmtSvcGetRoleListIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var data = responseData.CaRoleMgmtSvcGetRoleListOut.tblNm[0];


                            if(data != null) {
                                // 기본속성
                                that.setBaseAttribute(data);


                                // 서비스 입력항목
                                if (data.limitList != null) {
                                    that.setLimitHistory(data.limitList);


                                    // 삭제 로우 초기화
                                    that.deleteList = [];
                                }
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            resetBaseAttribute: function () {
                this.isNewRole = true;


                this.$el.find('#base-attribute-area [data-form-param="roleId"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="roleNm"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="roleStsCd"] option:eq(0)').prop('selected', true);
                this.$el.find('#base-attribute-area [data-form-param="roleTpCd"] option:eq(0)').prop('selected', true);
                this.$el.find('#base-attribute-area [data-form-param="athrtyAplyRngTpCd"] option:eq(0)').prop('selected', true);


                this.$el.find('#base-attribute-area [data-form-param="roleId"]').prop('disabled', false);


                this.resetLimitHistory();
                this.resetLimitSetting();
            },


            resetLimitHistory: function () {
                this.CAPCM191Grid.resetData();
            },


            resetLimitSetting: function () {
                this.isNewLimit = true;


                this.$el.find('#limit-setting-area [data-form-param="lmtDscd"] option:eq(0)').prop('selected', true);
                this.$el.find('#limit-setting-area [data-form-param="crncyCd"] option:eq(0)').prop('selected', true);
                this.$el.find('#limit-setting-area [data-form-param="maxAmt"]').val("");
            },


            saveBaseAttribute: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }

                function saveData() {
                    var sParam = {};
                    var sub = {};
                    var srvcCd = that.isNewRole ? 'CAPCM1918100': 'CAPCM1918200';


                    sParam.instCd       = $.sessionStorage('headerInstCd');
                    sParam.roleId       = that.$el.find('#base-attribute-area [data-form-param="roleId"]').val();
                    sParam.roleNm       = that.$el.find('#base-attribute-area [data-form-param="roleNm"]').val();
                    sParam.roleTpCd       = that.$el.find('#base-attribute-area [data-form-param="roleTpCd"]').val();
                    sParam.athrtyAplyRngTpCd       = that.$el.find('#base-attribute-area [data-form-param="athrtyAplyRngTpCd"]').val();
                    sParam.roleStsCd    = that.$el.find('#base-attribute-area [data-form-param="roleStsCd"]').val();
                    sParam.limitList    = [];


                    $(that.CAPCM191Grid.getAllData()).each(function (index, element) {
                        sub.instCd      = $.sessionStorage('headerInstCd');
                        sub.lmtDscd     = element.lmtDscd;
                        sub.crncyCd     = element.crncyCd;
                        sub.maxAmt      = element.maxAmt;
                        sub.roleId      = that.$el.find('#base-attribute-area [data-form-param="roleId"]').val();
                        sParam.limitList.push(sub);
                    });


                    console.log(sParam);


                    var linkData = {"header": fn_getHeader(srvcCd), "CaRoleMgmtSvcGetRoleSaveIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                if(that.isNewRole) {
                                    that.loadTreeList();
                                    that.resetBaseAttribute();
                                }
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            saveLimitSetting: function (event) {
                var that = this;
              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }

                function saveData() {
                    var sParam = {};


                    sParam.instCd   = $.sessionStorage('headerInstCd');
                    sParam.lmtDscd  = that.$el.find('#limit-setting-area [data-form-param="lmtDscd"]').val();
                    sParam.crncyCd  = that.$el.find('#limit-setting-area [data-form-param="crncyCd"]').val();
                    sParam.maxAmt   = that.$el.find('#limit-setting-area [data-form-param="maxAmt"]').val();
                    sParam.roleId   = that.$el.find('#base-attribute-area [data-form-param="roleId"]').val();


                    console.log(sParam);


                    var linkData = {"header": fn_getHeader("CAPCM1918201"), "CaRoleMgmtSvcGetLimitIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                var param = {};
                                param.instCd    = $.sessionStorage('headerInstCd');
                                param.roleId    = that.$el.find('#base-attribute-area [data-form-param="roleId"]').val();
                                param.roleNm    = that.$el.find('#base-attribute-area [data-form-param="roleNm"]').val();
                                param.roleStsCd = that.$el.find('#base-attribute-area [data-form-param="roleStsCd"]').val();


                                that.inquireRoleData(param);


                                if(that.isNewLimit) {
                                    that.resetLimitSetting();
                                }
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy


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


                    sParam.instCd       = $.sessionStorage('headerInstCd');
                    sParam.roleId       = that.$el.find('#base-attribute-area [data-form-param="roleId"]').val();
                    sParam.roleNm       = that.$el.find('#base-attribute-area [data-form-param="roleNm"]').val();
                    sParam.roleTpCd       = that.$el.find('#base-attribute-area [data-form-param="roleTpCd"]').val();
                    sParam.athrtyAplyRngTpCd       = that.$el.find('#base-attribute-area [data-form-param="athrtyAplyRngTpCd"]').val();
                    sParam.roleStsCd    = '03';     // 폐기코드


                    console.log(sParam);


                    var linkData = {"header": fn_getHeader("CAPCM1918200"), "CaRoleMgmtSvcGetRoleSaveIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                that.loadTreeList();


                                that.resetBaseAttribute();
                                that.resetLimitSetting();
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
                fn_pageLayerCtrl(this.$el.find("#limit-history-area"),
                    this.$el.find('#btn-limit-history-toggle'));
            },


            toggleNumberingRuleCompositionAttribute: function () {
                fn_pageLayerCtrl(this.$el.find("#limit-setting-area"),
                    this.$el.find('#btn-limit-setting-toggle'));
            }
        }); // end of Backbone.View.extend({


        return CAPCM191View;
    } // end of define function
); // end of define
