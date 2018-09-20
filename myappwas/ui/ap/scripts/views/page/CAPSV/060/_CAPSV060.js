/**
 * @Screen number  CAPSV060
 * @brief          화면사용권한
 * @author         이영주
 * @history        2016.08.17      생성
 */
define(
    [
        'bx/common/config',
        'text!app/views/page/CAPSV/060/_CAPSV060.html',
        'bx-component/ext-grid/_ext-grid',
        'app/views/page/popup/CAPSV/popup-screen-search'
    ]
    , function (
        config,
        tpl,
        ExtGrid,
        PopupScreenSearch
    ) {
        /**
         * Backbone
         */
        var CAPSV060View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section',
            // 클래스이름 설정
            className: 'bx-container CAPSV060-page',
            // 탬플릿 설정
            templates: {
                'tpl': tpl
            },
            // 이벤트 설정
            events: {
                'click #btn-search-result-save': 'saveSearchResult',
                'click #btn-base-save': 'saveBase',


                'click #btn-scrn-search': 'popScrnSrch',


                'click #btn-search-condition-inquire': 'inquire',




                'click #btn-search-condition-reset': 'resetSearchCondition', // 조회조건초기화
                'click #btn-base-reset': 'resetBase', // 상세초기화


                'click #btn-search-result-excel': 'downloadGridDataWithExcel',


                'click #btn-search-condition-toggle': 'toggleSearchCondition', // 조회영역
                'click #btn-search-result-toggle': 'toggleSearchResult', // 그리드 결과 영역
                'click #btn-base-toggle': 'toggleBaseAttribute' // 상세 영역
            }


            /**
             * initialize
             */
            , initialize: function (initData) {
                this.deleteList = [];


                $.extend(this, initData);
                this.initFlag = true;
                this.createGrid();
            },


            /**
             * render
             */
            render: function () {
                this.$el.html(this.tpl());
                this.$el.find("#CAPSV060Grid").html(this.CAPSV060Grid.render({'height': CaGridHeight}));


                this.setComboBoxes();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPSV060-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPSV060-wrap #btn-base-save')
                                    		]);
                
                return this.$el;
            },


            createGrid: function () {
                var that = this;


                that.CAPSV060Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'cmpntCd', 'scrnId', 'scrnNm', 'guestUserYn', 'inctvUserYn', 'actvUserYn', 'instCd'],
                    id: 'CAPSV060Grid',
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
                            text: bxMsg('cbb_items.SCRNITM#cmpnt'),
                            flex: 1,
                            dataIndex: 'cmpntCd',
                            style: 'text-align:center',
                            align: 'center',
                            code: '11603',
                            renderer: function (val) {
                                return val ? bxMsg('cbb_items.CDVAL#11603' + val) : '';
                            }
                        },
                        {
                            text: bxMsg('cbb_items.AT#scrnId'),
                            flex: 1,
                            dataIndex: 'scrnId',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#scrnNm'),
                            flex: 1,
                            dataIndex: 'scrnNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                        	text: bxMsg('cbb_items.SCRNITM#guest'),
                        	flex: 1,
                        	dataIndex: 'guestUserYn',
                        	style: 'text-align:center',
                        	align: 'center',
                        	renderer: function (val) {
                        		var classNm = "s-no";
                        		if(val =="Y") {
                        			classNm = "s-yes";
                        		}
                        		return "<span class=\"bw-sign "+classNm+"\">"+val+"</span>";
                        	}
                        },
                        {
                        	text: bxMsg('cbb_items.SCRNITM#notActvUser'),
                        	flex: 1,
                        	dataIndex: 'inctvUserYn',
                        	style: 'text-align:center',
                        	align: 'center',
                        	renderer: function (val) {
                        		var classNm = "s-no";
                        		if(val =="Y") {
                        			classNm = "s-yes";
                        		}
                        		return "<span class=\"bw-sign "+classNm+"\">"+val+"</span>";
                        	}
                        },
                        {
                        	text: bxMsg('cbb_items.SCRNITM#actvUser'),
                        	flex: 1,
                        	dataIndex: 'actvUserYn',
                        	style: 'text-align:center',
                        	align: 'center',
                        	renderer: function (val) {
                        		var classNm = "s-no";
                        		if(val =="Y") {
                        			classNm = "s-yes";
                        		}
                        		return "<span class=\"bw-sign "+classNm+"\">"+val+"</span>";
                        	}
                        },
                        {
                        	text: bxMsg('cbb_items.AT#instCd'),
                        	flex: 1,
                        	dataIndex: 'instCd',
                        	style: 'text-align:center',
                        	align: 'center',
                        	hidden : true
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


            setComboBoxes: function () {
                var sParam = {};


                sParam = {};
                sParam.className = "CAPSV060-cmpnt-wrap";
                sParam.targetId = "cmpnt";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                sParam.cdNbr = "11603";
                fn_getCodeList(sParam, this);   // 서비스컴포넌트코드


                sParam = {};
                sParam.className = "CAPSV060-cmpnt2-wrap";
                sParam.targetId = "cmpnt";
                sParam.nullYn = "N";
                sParam.cdNbr = "11603";
                sParam.disabled = true;
                fn_getCodeList(sParam, this);   // 서비스컴포넌트코드


                sParam = {};
                sParam.cdNbr = "A0462";
                var linkData = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};


                var ynCd = fn_callSyncSvc(linkData);
                var ynCdParam = {};
                ynCdParam.tbl = ynCd.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;
                ynCdParam.textNm = "cdNm";
                ynCdParam.valueNm = "cd";
                ynCdParam.nullYn = "N";


                
                sParam = {};
                sParam.className = "CAPSV060-guestUserYn-wrap";
                sParam.targetId = "guestUserYn";
                sParam.nullYn = "N";
                sParam.cdNbr = "10000";
                sParam.disabled = true;
                fn_getCodeList(sParam, this);
                
                
                sParam = {};
                sParam.className = "CAPSV060-inctvUserYn-wrap";
                sParam.targetId = "inctvUserYn";
                sParam.nullYn = "N";
                sParam.cdNbr = "10000";
                sParam.disabled = true;
                fn_getCodeList(sParam, this);
                
                sParam = {};
                sParam.className = "CAPSV060-actvUserYn-wrap";
                sParam.targetId = "actvUserYn";
                sParam.nullYn = "N";
                sParam.cdNbr = "10000";
                sParam.disabled = true;
                fn_getCodeList(sParam, this);


            },


            setBase: function (data) {
            	this.initFlag = false;
                this.$el.find('#base-area [data-form-param="cmpntCd"]').val(data.cmpntCd);
                this.$el.find('#base-area [data-form-param="scrnId"]').val(data.scrnId);
                this.$el.find('#base-area [data-form-param="scrnNm"]').val(data.scrnNm);


                this.$el.find('#base-area [data-form-param="guestUserYn"]').val(data.guestUserYn);
                this.$el.find('#base-area [data-form-param="inctvUserYn"]').val(data.inctvUserYn);
                this.$el.find('#base-area [data-form-param="actvUserYn"]').val(data.actvUserYn);
                
                
                this.$el.find('#base-area [data-form-param="cmpntCd"]').prop("disabled", true);
                this.$el.find('#base-area [data-form-param="scrnId"]').prop("disabled", true);
                this.$el.find('#base-area [data-form-param="scrnNm"]').prop("disabled", true);
                
                this.$el.find('#base-area [data-form-param="guestUserYn"]').prop("disabled", false);
                this.$el.find('#base-area [data-form-param="actvUserYn"]').prop("disabled", false);
                this.$el.find('#base-area [data-form-param="inctvUserYn"]').prop("disabled", false);

                this.$el.find('#base-area [data-form-param="scrnId"]').prop("disabled", true);
                this.$el.find('#btn-scrn-search').prop("disabled", true);
            },


            convertYn : function(mode, str) {
            	var result = "";


            	if(mode == "A") { // YN 을 1,2 로 변경
            		if(str) {
            			result = str == "Y" ? "1" : "2";
            		}
            	}
            	else { // 1,2 를 YN 으로 변경
            		if(str) {
            			result = str == "1" ? "Y" : "N";
            		}
            	}


            	return result;
            },


            selectGridRecord: function () {
                if(this.CAPSV060Grid.grid.getSelectionModel().selected.items[0]) {
                    var selectedData = this.CAPSV060Grid.grid.getSelectionModel().selected.items[0].data;
                    this.setBase(selectedData);
                }
            },


            resetSearchCondition: function () {
                this.$el.find('#search-condition-area [data-form-param="cmpntCd"] option:eq(0)').attr('selected', 'selected');
                this.$el.find('#search-condition-area [data-form-param="scrnId"]').val("");
                this.$el.find('#search-condition-area [data-form-param="scrnNm"]').val("");
            },


            resetBase: function () {
            	this.initFlag = true;
                this.$el.find('#base-area [data-form-param="cmpntCd"] option:eq(0)').attr('selected', 'selected');
                this.$el.find('#base-area [data-form-param="scrnId"]').val("");
                this.$el.find('#base-area [data-form-param="scrnNm"]').val("");


                this.$el.find('#base-area [data-form-param="guestUserYn"] option:eq(0)').attr('selected', 'selected');
                this.$el.find('#base-area [data-form-param="inctvUserYn"] option:eq(0)').attr('selected', 'selected');
                this.$el.find('#base-area [data-form-param="actvUserYn"] option:eq(0)').attr('selected', 'selected');

                
                this.$el.find('#base-area [data-form-param="scrnId"]').prop("disabled", false);
                this.$el.find('#base-area [data-form-param="cmpntCd"]').prop("disabled", false);
                this.$el.find('#base-area [data-form-param="scrnNm"]').prop("disabled", false);
                this.$el.find('#base-area [data-form-param="guestUserYn"]').prop("disabled", false);
                this.$el.find('#base-area [data-form-param="inctvUserYn"]').prop("disabled", false);
                this.$el.find('#base-area [data-form-param="actvUserYn"]').prop("disabled", false);
                
                this.$el.find('#btn-scrn-search').prop("disabled", false);
            },


            inquire: function () {
                // header 정보 set
                var that = this;
                var sParam = {};
                sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                sParam.cmpntCd     = this.$el.find('#search-condition-area [data-form-param="cmpntCd"]').val();
                sParam.scrnId   = this.$el.find('#search-condition-area [data-form-param="scrnId"]').val();
                sParam.scrnNm = this.$el.find('#search-condition-area [data-form-param="scrnNm"]').val();


                var linkData = {"header": fn_getHeader("CAPSV0608401"), "CaScrnUserAthrtySvcScrnUserAthrtyIn": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var tbl = responseData.CaScrnUserAthrtySvcScrnUserAthrtyListOut.tblNm;
                            var totCnt = tbl.length;


                            that.initFlag = true;
                            that.resetBase();


                            if (tbl != null || totalCount > 0) {
                                that.CAPSV060Grid.setData(tbl);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");


                                // 삭제 로우 초기화
                                that.deleteList = [];
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            saveSearchResult: function (event) {
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
                        sub.instCd = data.instCd;
                        sub.cmpntCd        = data.cmpntCd;
                        sub.scrnId      = data.scrnId;
                        deleteList.push(sub);
                    });


                    sParam.tblNm = deleteList;


                    var linkData = {"header": fn_getHeader("CAPSV0608301"), "CaScrnUserAthrtySvcScrnUserAthrtyListIn": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                // 재조회
                                that.inquire();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), saveData, this);
            },


            saveBase: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                function saveData() {
                    var sParam = {};


                    sParam.instCd = $.sessionStorage('headerInstCd'); // 헤더의 기관코드
                    sParam.cmpntCd        = that.$el.find('#base-area [data-form-param="cmpntCd"]').val();
                    sParam.scrnId      = that.$el.find('#base-area [data-form-param="scrnId"]').val();
                    sParam.guestUserYn    = that.$el.find('#base-area [data-form-param="guestUserYn"]').val()
                    sParam.inctvUserYn    = that.$el.find('#base-area [data-form-param="inctvUserYn"]').val()
                    sParam.actvUserYn    = that.$el.find('#base-area [data-form-param="actvUserYn"]').val()




                    var linkData = {"header": fn_getHeader(that.initFlag ? "CAPSV0608100" : "CAPSV0608200"), "CaScrnUserAthrtySvcScrnUserAthrtyIn": sParam};


                    //ajax 호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true,
                        success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                that.inquire();
                            }
                        }
                    });
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            popScrnSrch : function() {
            	var that = this;


            	this.popupScreenSearch = new PopupScreenSearch();
            	this.popupScreenSearch.render();
            	this.popupScreenSearch.on('popUpSetData', function (data) {
            		that.$el.find('#base-area [data-form-param="scrnId"]').val(data.scrnId);
                	that.$el.find('#base-area [data-form-param="scrnNm"]').val(data.scrnNm);
                	that.$el.find('#base-area [data-form-param="cmpntCd"]').val(data.cmpntCd);
            	});
            },


            downloadGridDataWithExcel: function () {
                this.CAPSV060Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPSV060')+"_"+getCurrentDate("yyyy-mm-dd"));
            },


            toggleSearchCondition: function () {
                fn_pageLayerCtrl(this.$el.find('#search-condition-area'), this.$el.find('#btn-search-condition-toggle'));
            },


            toggleSearchResult: function () {
                fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find('#btn-search-result-toggle'));
            },


            toggleBaseAttribute: function () {
                fn_pageLayerCtrl(this.$el.find('#base-area'), this.$el.find('#btn-base-toggle'));
            }
        }); // end of Backbone.View.extend({


        return CAPSV060View;
    } // end of define function
)
; // end of define
