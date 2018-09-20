define(
    [
        'bx/common/config', 
        'text!app/views/page/CAPXP/000/_CAPXP000.html',
        'bx-component/ext-grid/_ext-grid',
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
        var CAPXP000View = Backbone.View.extend({
            // 태그이름 설정
            tagName: 'section',
            // 클래스이름 설정
            className: 'bx-container CAPXP000-page',
            // 탬플릿 설정
            templates: {
                'tpl': tpl
            },
            // 이벤트 설정
            events: {
                'click #btn-base-attribute-save': 'saveBaseAttribute',


                'click #btn-search-condition-inquire': 'inquireStandardAttribute',


                'click #btn-search-condition-reset': 'resetSearchCondition',
                'click #btn-base-attribute-reset': 'resetBaseAttribute',


                'click #btn-search-result-save': 'saveSearchResult',
                'click #btn-search-result-excel': 'downloadGridDataWithExcel',


                'click #btn-search-condition-toggle': 'toggleSearchCondition',
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
                this.$el.find("#CAPXP000Grid").html(this.CAPXP000Grid.render({'height': CaGridHeight}));


                this.$divValidationRule     = this.$el.find('#base-attribute-area #div-validation-rule');
                this.$selectValidationRule  = this.$el.find('#base-attribute-area #CAPXP000-cmpntCd-wrap');
                this.$inputValidationRule   = this.$el.find('#base-attribute-area #input-validation-rule');
                this.$buttonCodeSearch      = this.$el.find('#base-attribute-area #btn-code-search');

                this.setDatePicker();
                
                // 콤보데이터 로딩
                var sParam;
                sParam = {};                    
                //조건유형 combobox
                sParam.className = "CAPXP000-cmpntCd-wrap";
	        	sParam.targetId = "cmpntCd";
                sParam.viewType = "ValNm";
                //inData 정보 셋팅
                sParam.cdNbr = "11602";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
                
                sParam = {};                    
                sParam.className = "CAPXP000-sysIntrfcStsCd-wrap";
	        	sParam.targetId = "sysIntrfcStsCd";
                sParam.viewType = "ValNm";
                sParam.cdNbr = "A0097";
                fn_getCodeList(sParam, this);
                
                sParam = {};                    
                sParam.className = "CAPXP000-sysIntrfcMthdCd-wrap";
	        	sParam.targetId = "sysIntrfcMthdCd";
                sParam.viewType = "ValNm";
                sParam.cdNbr = "A0098";
                fn_getCodeList(sParam, this);

                //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPXP000-wrap #btn-search-result-save')
                                    		,this.$el.find('.CAPXP000-wrap #btn-base-attribute-save')
                                    			   ]);

                return this.$el;
            },


            createGrid: function () {
                var that = this;


                that.CAPXP000Grid = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'sysIntrfcId', 'aplyStartDt', 'sysIntrfcNm', 
                             'sysIntrfcStsCd', 'cmpntCd', 'sndSysId', 'rcvdSysId',
                        'intrmdrySysId', 'sysIntrfcMthdCd', 'asyncTimeoutScnd', 'rcvdSrvcCd', 
                        'timeoutSrvcCd', 'cntrprtSysSrvcCdCntnt', 'sndQueueId', 'tmpryQueueId',
                        'tstRspnsCrtnClassNm', 'lastChngTmstmp', 'extrnlTxCd',
                        'extrnlSrvcCd', 'extrnlRcvdSrvcCd', 'delYn', ],
                    id: 'CAPXP000Grid',
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
                            text: bxMsg('cbb_items.AT#sysIntrfcId'),
                            flex: 1,
                            dataIndex: 'sysIntrfcId',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#sysIntrfcNm'),
                            flex: 1,
                            dataIndex: 'sysIntrfcNm',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#cmpntCd'),
                            flex: 1,
                            dataIndex: 'cmpntCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#sndSysId'),
                            flex: 1,
                            dataIndex: 'sndSysId',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#rcvdSysId'),
                            flex: 1,
                            dataIndex: 'rcvdSysId',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            text: bxMsg('cbb_items.AT#sysIntrfcMthdCd'),
                            flex: 1,
                            dataIndex: 'sysIntrfcMthdCd',
                            style: 'text-align:center',
                            align: 'center'
                        },
                        {
                            xtype: 'actioncolumn',
                            width: 80,
                            align: 'center',
                            text: bxMsg('cbb_items.AT#delYn'),
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

            setBaseAttribute: function (data) {
                this.$el.find('#base-attribute-area [data-form-param="sysIntrfcId"]').val(data.sysIntrfcId);
                this.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]').val(XDate(data.aplyStartDt).toString('yyyy-MM-dd'));
                this.$el.find('#base-attribute-area [data-form-param="sysIntrfcNm"]').val(data.sysIntrfcNm);
                this.$el.find('#base-attribute-area [data-form-param="sysIntrfcStsCd"]').val(data.sysIntrfcStsCd);
                this.$el.find('#base-attribute-area [data-form-param="cmpntCd"]').val(data.cmpntCd);
                this.$el.find('#base-attribute-area [data-form-param="sndSysId"]').val(data.sndSysId);
                this.$el.find('#base-attribute-area [data-form-param="rcvdSysId"]').val(data.rcvdSysId);
                this.$el.find('#base-attribute-area [data-form-param="intrmdrySysId"]').val(data.intrmdrySysId);
                this.$el.find('#base-attribute-area [data-form-param="sysIntrfcMthdCd"]').val(data.sysIntrfcMthdCd);
                this.$el.find('#base-attribute-area [data-form-param="asyncTimeoutScnd"]').val(data.asyncTimeoutScnd);
                this.$el.find('#base-attribute-area [data-form-param="rcvdSrvcCd"]').val(data.rcvdSrvcCd);
                this.$el.find('#base-attribute-area [data-form-param="timeoutSrvcCd"]').val(data.timeoutSrvcCd);
                this.$el.find('#base-attribute-area [data-form-param="cntrprtSysSrvcCdCntnt"]').val(data.cntrprtSysSrvcCdCntnt);
                this.$el.find('#base-attribute-area [data-form-param="sndQueueId"]').val(data.sndQueueId);
                this.$el.find('#base-attribute-area [data-form-param="tmpryQueueId"]').val(data.tmpryQueueId);
                this.$el.find('#base-attribute-area [data-form-param="tstRspnsCrtnClassNm"]').val(data.tstRspnsCrtnClassNm);
                this.$el.find('#base-attribute-area [data-form-param="lastChngTmstmp"]').val(data.lastChngTmstmp);
                this.$el.find('#base-attribute-area [data-form-param="extrnlTxCd"]').val(data.extrnlTxCd);
                this.$el.find('#base-attribute-area [data-form-param="extrnlSrvcCd"]').val(data.extrnlSrvcCd);
                this.$el.find('#base-attribute-area [data-form-param="extrnlRcvdSrvcCd"]').val(data.extrnlRcvdSrvcCd);

                this.isBaseAttributeModified = true;
            },


            selectGridRecord: function () {
                var selectedData = this.CAPXP000Grid.grid.getSelectionModel().selected.items[0];


                if(selectedData == null) {
                	return;
                }


                this.setBaseAttribute(selectedData.data);
            },

            resetSearchCondition: function () {
                this.$el.find('#search-condition-area [data-form-param="sysIntrfcId"]').val("");
                this.$el.find('#search-condition-area [data-form-param="sysIntrfcNm"]').val("");
                this.$el.find('#search-condition-area [data-form-param="cmpntCd"]').val("");
                this.$el.find('#search-condition-area [data-form-param="sndSysId"]').val("");
                this.$el.find('#search-condition-area [data-form-param="rcvdSysId"]').val("");
                this.$el.find('#search-condition-area [data-form-param="sysIntrfcMthdCd"]').val("");
            },


            resetBaseAttribute: function () {
                this.$el.find('#base-attribute-area [data-form-param="sysIntrfcId"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]').val(getCurrentDate("yyyy-mm-dd"));
                this.$el.find('#base-attribute-area [data-form-param="extrnlTxCd"]').val("");
                
                this.$el.find('#base-attribute-area [data-form-param="sysIntrfcStsCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="cmpntCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#base-attribute-area [data-form-param="sndSysId"]').val("");
                
                this.$el.find('#base-attribute-area [data-form-param="rcvdSysId"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="rcvdSrvcCd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="sysIntrfcMthdCd"] option:eq(0)').attr("selected", "selected");
                
                this.$el.find('#base-attribute-area [data-form-param="sysIntrfcNm"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="extrnlSrvcCd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="extrnlRcvdSrvcCd"]').val("");
                
                this.$el.find('#base-attribute-area [data-form-param="intrmdrySysId"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="asyncTimeoutScnd"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="timeoutSrvcCd"]').val("");
                
                this.$el.find('#base-attribute-area [data-form-param="cntrprtSysSrvcCdCntnt"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="sndQueueId"]').val("");
                this.$el.find('#base-attribute-area [data-form-param="tmpryQueueId"]').val("");
                
                this.$el.find('#base-attribute-area [data-form-param="tstRspnsCrtnClassNm"]').val("");

                this.$buttonCodeSearch.hide();
                this.$selectValidationRule.hide();
                this.$inputValidationRule.show();

                this.isBaseAttributeModified = false;
            },


            inquireStandardAttribute: function () {
                // header 정보 set
                var that = this;
                var sParam = {};

                sParam.extrnlTxCd        = this.$el.find('#search-condition-area [data-form-param="sysIntrfcId"]').val();
                sParam.sysIntrfcNm              = this.$el.find('#search-condition-area [data-form-param="sysIntrfcNm"]').val();
                sParam.cmpntCd              = this.$el.find('#search-condition-area [data-form-param="cmpntCd"] option:selected').val();
                sParam.sndSysId              = this.$el.find('#search-condition-area [data-form-param="sndSysId"]').val();
                sParam.rcvdSysId              = this.$el.find('#search-condition-area [data-form-param="rcvdSysId"]').val();
                sParam.sysIntrfcMthdCd              = this.$el.find('#search-condition-area [data-form-param="sysIntrfcMthdCd"] option:selected').val();

                if (fn_isEmpty(sParam.extrnlTxCd) && fn_isEmpty(sParam.sysIntrfcNm) && fn_isEmpty(sParam.cmpntCd)
                		&& fn_isEmpty(sParam.sndSysId) && fn_isEmpty(sParam.rcvdSysId) && fn_isEmpty(sParam.sysIntrfcMthdCd)) {
                	fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0014'));
                    return;
                }

                var linkData = {"header": fn_getHeader("CAPXP02984002"), "CaSysIntrfcInfoSvcIn": sParam};

                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var list = responseData.CaSysIntrfcInfoSvcListOut.sysIntrfcInfoSvcListMultiCondition;
                            var totCnt = list.length;
                            // 서비스 입력항목
                            that.resetBaseAttribute();
                            if (list != null || list.length > 0) {
                                that.CAPXP000Grid.setData(list);
                                that.$el.find("#searchResultCount").html(bxMsg('cbb_items.SCRNITM#srchRslt')+" ("+fn_setComma(totCnt)+" "+bxMsg('cbb_items.SCRNITM#cnt')+")");
                                // 삭제 로우 초기화
                                that.deleteList = [];
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },
            
            /**
             * 달력생성
             */
            setDatePicker: function () {
                fn_makeDatePicker(this.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]'));
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
                        sub.sysIntrfcId = data.sysIntrfcId;
                        sub.extrnlTxCd = data.extrnlTxCd;
                        deleteList.push(sub);
                    });


                    sParam.tblNm = deleteList;

                    console.log(sParam);

                    var linkData = {"header": fn_getHeader("CAPXP02783004"), "CaSysIntrfcInfoSvcIn": sParam};


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
                // 필수 입력값
                sParam.sysIntrfcId   = that.$el.find('#base-attribute-area [data-form-param="sysIntrfcId"]').val();
                sParam.aplyStartDt       = fn_getDateValue(that.$el.find('#base-attribute-area [data-form-param="aplyStartDt"]').val());
                sParam.extrnlTxCd      = that.$el.find('#base-attribute-area [data-form-param="extrnlTxCd"]').val();
                sParam.sysIntrfcStsCd    = that.$el.find('#base-attribute-area [data-form-param="sysIntrfcStsCd"] option:selected').val();
                sParam.cmpntCd    = that.$el.find('#base-attribute-area [data-form-param="cmpntCd"] option:selected').val();
                sParam.sndSysId    = that.$el.find('#base-attribute-area [data-form-param="sndSysId"]').val();
                sParam.rcvdSysId    = that.$el.find('#base-attribute-area [data-form-param="rcvdSysId"]').val();
                sParam.rcvdSrvcCd    = that.$el.find('#base-attribute-area [data-form-param="rcvdSrvcCd"]').val();
                sParam.sysIntrfcMthdCd    = that.$el.find('#base-attribute-area [data-form-param="sysIntrfcMthdCd"] option:selected').val();
                
                
                sParam.extrnlSrvcCd  = that.$el.find('#base-attribute-area [data-form-param="extrnlSrvcCd"]').val();
                sParam.extrnlRcvdSrvcCd       = that.$el.find('#base-attribute-area [data-form-param="extrnlRcvdSrvcCd"]').val();
                
                sParam.sysIntrfcNm       = that.$el.find('#base-attribute-area [data-form-param="sysIntrfcNm"]').val();
                sParam.sysIntrfcStsCd    = that.$el.find('#base-attribute-area [data-form-param="sysIntrfcStsCd"]').val();
                
                sParam.intrmdrySysId    = that.$el.find('#base-attribute-area [data-form-param="intrmdrySysId"]').val();
                sParam.asyncTimeoutScnd    = that.$el.find('#base-attribute-area [data-form-param="asyncTimeoutScnd"]').val();
                sParam.rcvdSrvcCd    = that.$el.find('#base-attribute-area [data-form-param="rcvdSrvcCd"]').val();
                sParam.timeoutSrvcCd    = that.$el.find('#base-attribute-area [data-form-param="timeoutSrvcCd"]').val();
                sParam.cntrprtSysSrvcCdCntnt    = that.$el.find('#base-attribute-area [data-form-param="cntrprtSysSrvcCdCntnt"]').val();
                sParam.sndQueueId    = that.$el.find('#base-attribute-area [data-form-param="sndQueueId"]').val();
                sParam.tmpryQueueId    = that.$el.find('#base-attribute-area [data-form-param="tmpryQueueId"]').val();
                sParam.tstRspnsCrtnClassNm    = that.$el.find('#base-attribute-area [data-form-param="tstRspnsCrtnClassNm"]').val();

                if (fn_isEmpty(sParam.sysIntrfcId) || fn_isEmpty(sParam.aplyStartDt) || fn_isEmpty(sParam.extrnlTxCd)
                		|| fn_isEmpty(sParam.sysIntrfcStsCd) || fn_isEmpty(sParam.cmpntCd) || fn_isEmpty(sParam.sndSysId)
                		|| fn_isEmpty(sParam.rcvdSysId) || fn_isEmpty(sParam.rcvdSrvcCd) || fn_isEmpty(sParam.sysIntrfcMthdCd)) {
                	fn_alertMessage("", bxMsg('cbb_err_msg.AUICME0004'));
                    return;
                }
                
              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var srvcCd;

                    if (that.isBaseAttributeModified) {
                        //수정
                        srvcCd = "CAPXP02782003";
                    } else {
                        //등록
                        srvcCd = "CAPXP02781002";
                    }

                    var linkData = {"header": fn_getHeader(srvcCd), "CaSysIntrfcInfoSvcIn": sParam};


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
                this.CAPXP000Grid.exportCsvFile(bxMsg('cbb_items.SCRN#CAPXP000')+"_"+getCurrentDate("yyyy-mm-dd"));
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


        return CAPXP000View;
    } // end of define function
)
; // end of define
