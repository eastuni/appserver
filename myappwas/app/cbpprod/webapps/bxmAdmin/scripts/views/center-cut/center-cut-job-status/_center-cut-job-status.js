define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'common/popup/center-cut-search/center-cut-search',
        // 'views/center-cut/center-cut-job-status/center-cut-processing-status-details-popup',
        'views/center-cut/center-cut-job-status/center-cut-error-details-popup',
        'text!views/center-cut/center-cut-job-status/_center-cut-job-status-tpl.html'
    ],
    function (
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        CenterCutSearchPopup,
        // CenterCutProcessingStatusDetailsPopup,
        CenterCutErrorDetailsPopup,
        tpl) {
        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .refresh-all-btn': 'refreshAll',
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadList',
                'enter-component .bxm-search-wrap input': 'loadList',
                'change .bxm-search-wrap select': 'loadList',
                'click .center-cut-search-btn': 'showCenterCutSearchPopup',

                'click .operation-buttons button': 'onClickOperationButton',
                'click .job-remove-btn': 'onClickJobRemoveBtn',

                // 'click .processing-status-details-btn': 'showCenterCutProcessingStatusDetailsPopup',
                'click .error-details-btn': 'showCenterCutErrorDetailsPopup',
                'click .process-error-btn': 'onClickProcessErrorButton'
            },

            currentListParams: null,
            currentDetailsListParams: null,
            currentDetailsParams: null,
            errorHandlingGridRendered: false,
            processingStatusGridRendered: false,
            errorHandlingGridModified: false,
            processingStatusGridModified: false,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());


                // Set SubViews
                that.subViews['detailLoadingBar'] = new LoadingBar();

                that.subViews['centerCutSearchPopup'] = new CenterCutSearchPopup();
                that.subViews['centerCutSearchPopup'].on('select-code', function (ccId) {
                    that.$searchWrap.find('input[data-form-param="ccId"]').val(ccId);
                });

                // that.subViews['centerCutProcessingStatusDetailsPopup'] = new CenterCutProcessingStatusDetailsPopup();
                that.subViews['centerCutErrorDetailsPopup'] = new CenterCutErrorDetailsPopup();


                // Set Grid
                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('SCC1003', 'searchListPcsnStat', 'SCC100301In', null, 'bxmAdminCC'),
                        key: 'SCC100301In'
                    },
                    responseParam: {
                        objKey: 'SCC100301Out',
                        key: 'listSCC1003Out'
                    },
                    header: {
                        pageCount: true,
                        button: [
                                 {
                                	 html: '<button type="button" class="bw-btn" title="' + bxMsg('centerCut.startAllCenterCuts') + '">\
                                	 <i class="svg-icon i-25 i-start-all-2"></i>\
                                	 </button>',
                                	 event: function () {
                                		 that.onClickOperationButton(null, '7');
                                	 }
                                 },
                            {
                                html: '<button type="button" class="bw-btn" title="' + bxMsg('centerCut.stopAllCenterCuts') + '">\
                                    <i class="svg-icon i-25 i-stop-all-4"></i>\
                                    </button>',
                                event: function () {
                                    that.onClickOperationButton(null, '6');
                                }
                            },
                            {
                                html: '<button type="button" class="bw-btn" title="' + bxMsg('common.refresh') + '"><i class="bw-icon i-25 i-func-refresh"></i></button>',
                                event: function () {
                                    that.loadList();
                                }
                            }
                        ]
                    },
                    paging: true,
                    pageCountDefaultVal: 5,

                    fields: ['ccId', 'acptNo', 'tnNo', 'pcsnStat', 'fstSrtDt', 'fstSrtTime', 'endDt', 'endTime', 'pcsnDt'],
                    columns: [
                        {text: bxMsg('centerCut.centerCutId'), flex: 4, dataIndex: 'ccId',  align: 'center'},
                        {text: bxMsg('centerCut.registrationNo'), flex: 1, dataIndex: 'acptNo',  align: 'center'},
                        {text: bxMsg('centerCut.turnNo'), flex: 1, dataIndex: 'tnNo',  align: 'center'},
                        {
                            text: bxMsg('centerCut.processStatus'), flex: 3, dataIndex: 'pcsnStat', align: 'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMCC0001'][value];
                            }
                        },
                        {
                            text: bxMsg('centerCut.startDate'), flex: 2, dataIndex: 'fstSrtDt', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToDateString(value);
                            }
                        },
                        {
                            text: bxMsg('centerCut.startTime'), flex: 2, dataIndex: 'fstSrtTime', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToTimeString(value);
                            }
                        },
                        {
                            text: bxMsg('centerCut.endDate'), flex: 2, dataIndex: 'endDt', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToDateString(value);
                            }
                        },
                        {
                            text: bxMsg('centerCut.endTime'), flex: 2, dataIndex: 'endTime', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToTimeString(value);
                            }
                        },
                        {
                            text:bxMsg('common.del'),
                            renderer: function (value, p, record){
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn job-remove-btn" data-id="{0}" data-pcsn="{1}" data-acpt="{2}" data-tn="{3}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('ccId'),
                                    record.get('pcsnDt'),
                                    record.get('acptNo'),
                                    record.get('tnNo')
                                );
                            },

                            sortable: false,
                            align: 'center',
                            width: 50
                        }
                    ],
                    listeners: {
                        select: function(_this, record) {
                            that.loadDetailsList({
                                ccId: record.get('ccId'),
                                pcsnDt: record.get('pcsnDt'),
                                acptNo: record.get('acptNo'),
                                tnNo: record.get('tnNo')
                            });
                        }
                    }
                });

                that.detailsListGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('SCC1003', 'searchCCDetailWorkList', 'BxmCCWorkStatusIO', null, 'bxmAdminCC'),
                        key: 'BxmCCWorkStatusIO'
                    },
                    responseParam: {
                        objKey: 'BxmCCWorkStatus02IO',
                        key: 'out'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn" title="' + bxMsg('common.refresh') + '"><i class="bw-icon i-25 i-func-refresh"></i></button>',
                                event: function () {
                                    that.loadDetailsList(that.currentDetailsListParams);
                                }
                            }
                        ]
                    },
                    paging: true,
                    pageCountDefaultVal: 5,

                    fields: ['ccId', 'pcsnDt', 'acptNo', 'tnNo', 'execNo', 'pcsnStat', 'ttObjCnt', 'ttObjAmt', 'nomlPcsnCnt', 'nomlPcsnAmt', 'errPcsnCnt', 'errPcsnAmt'],
                    columns: [
                        {text: bxMsg('centerCut.centerCutId'), flex: 3, dataIndex: 'ccId',  align: 'center'},
                        {
                            text: bxMsg('centerCut.processingDate'), flex: 2, dataIndex: 'pcsnDt', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToDateString(value);
                            }
                        },
                        {text: bxMsg('centerCut.registrationNo'), flex: 1, dataIndex: 'acptNo',  align: 'center'},
                        {text: bxMsg('centerCut.turnNo'), flex: 1, dataIndex: 'tnNo',  align: 'center'},
                        {text: bxMsg('centerCut.executionNo'), flex: 1, dataIndex: 'execNo',  align: 'center'},
                        {
                            text: bxMsg('centerCut.processStatus'), flex: 2, dataIndex: 'pcsnStat', align: 'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMCC0001'][value];
                            }
                        },
                        {
                            text: bxMsg('centerCut.totalTargetCount'), flex: 2, dataIndex: 'ttObjCnt',  align: 'center',
                            renderer: function (value) {
                                return commonUtil.numberWithCommas(value);
                            }
                        },
                        {
                            text: bxMsg('centerCut.targetPrice'), flex: 2, dataIndex: 'ttObjAmt',  align: 'center',
                            renderer: function (value) {
                                return commonUtil.numberWithCommas(value);
                            }
                        },
                        {
                            text: bxMsg('centerCut.numberOfNormalProcessing'), flex: 2, dataIndex: 'nomlPcsnCnt',  align: 'center',
                            renderer: function (value) {
                                return commonUtil.numberWithCommas(value);
                            }
                        },
                        {
                            text: bxMsg('centerCut.priceOfNormalProcessing'), flex: 2, dataIndex: 'nomlPcsnAmt',  align: 'center',
                            renderer: function (value) {
                                return commonUtil.numberWithCommas(value);
                            }
                        },
                        {
                            text: bxMsg('centerCut.numberOfErrorProcessing'), flex: 2, dataIndex: 'errPcsnCnt',  align: 'center',
                            renderer: function (value) {
                                return commonUtil.numberWithCommas(value);
                            }
                        },
                        {
                            text: bxMsg('centerCut.priceOfErrorProcessing'), flex: 2, dataIndex: 'errPcsnAmt',  align: 'center',
                            renderer: function (value) {
                                return commonUtil.numberWithCommas(value);
                            }
                        // },
                        // {
                        //     text:bxMsg('centerCut.processingStatus'),
                        //     renderer: function (value, p, record){
                        //         return Ext.String.format(
                        //             '<button type="button" class="bw-btn bw-btn-txt processing-status-details-btn" data-id0="{0}" data-id1="{1}" data-id2="{2}" data-id3="{3}" data-id4="{4}">' + bxMsg('common.check') + '</button>',
                        //             record.get('ccId'),
                        //             record.get('pcsnDt'),
                        //             record.get('acptNo'),
                        //             record.get('execNo'),
                        //             record.get('tnNo')
                        //         );
                        //     },
                        //
                        //     sortable: false,
                        //     align: 'center',
                        //     width: 50
                        }
                    ],
                    listeners: {
                        beforecellmousedown: function(_this, td, cellIndex) {
                            this.gridSelect = (cellIndex !== 12);
                        },
                        beforeselect: function() {
                            return this.gridSelect;
                        },
                        select: function(_this, record) {
                            that.loadDetails({
                                ccId: record.get('ccId'),
                                pcsnDt: record.get('pcsnDt'),
                                acptNo: record.get('acptNo'),
                                execNo: record.get('execNo'),
                                tnNo: record.get('tnNo')
                            });
                        }
                    }
                });

                that.errorHandlingGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('SCC1005', 'searchCcutError', 'SCC100501In', null, 'bxmAdminCC'),
                        key: 'SCC100501In'
                    },
                    responseParam: {
                        objKey: 'SCC100501Out',
                        key: 'listSCC1005Out'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn-txt re-register-all-btn">' + bxMsg('centerCut.reRegisterAll') + '</button>',
                                event: function () {
                                    that.reRegisterAll(that.currentDetailsParams);
                                }
                            },
                            {
                                html: '<button type="button" class="bw-btn" title="' + bxMsg('common.refresh') + '"><i class="bw-icon i-25 i-func-refresh"></i></button>',
                                event: function () {
                                    that.loadDetails(that.currentDetailsParams);
                                }
                            }
                        ]
                    },
                    paging: true,
                    pageCountDefaultVal: 5,

                    fields: ['acptNo', 'tnNo', 'execNo', 'ccTrxSqno', 'pcsnEltm', 'reRegCd', 'msgCd', 'errPrgmId', 'oputMsg', 'errPcsnAmt', 'ccId', 'pcsnDt'],
                    columns: [
                        {text: bxMsg('centerCut.registrationNo'), flex: 1, dataIndex: 'acptNo',  align: 'center'},
                        {text: bxMsg('centerCut.turnNo'), flex: 1, dataIndex: 'tnNo',  align: 'center'},
                        {text: bxMsg('centerCut.executionNo'), flex: 1, dataIndex: 'execNo',  align: 'center'},
                        {text: bxMsg('centerCut.sequenceNo'), flex: 1, dataIndex: 'ccTrxSqno',  align: 'center'},
                        {
                            text: bxMsg('centerCut.processingTime'), flex: 1.5, dataIndex: 'pcsnEltm', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToTimeString(value);
                            }
                        },
                        {
                            text: bxMsg('centerCut.status'), flex: 1.5, dataIndex: 'reRegCd', align: 'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMCC0015'][value];
                            }
                        },
                        {text: bxMsg('centerCut.errorCode'), flex: 1, dataIndex: 'msgCd',  align: 'center'},
                        {text: bxMsg('centerCut.errorProgram'), flex: 2, dataIndex: 'errPrgmId',  align: 'center'},
                        {
                            text: bxMsg('centerCut.errorMessage'), flex: 5, dataIndex: 'oputMsg',  align: 'center',
                            renderer: function (value){
                                return '<span title="' + value + '">' + value + '</span>';
                            }
                        },
                        {
                            text:bxMsg('centerCut.messageDetails'),
                            renderer: function (value, p, record){
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn bw-btn-txt error-details-btn" data-id0="{0}" data-id1="{1}" data-id2="{2}" data-id3="{3}" data-id4="{4}" data-id5="{5}">' + bxMsg('common.check') + '</button>',
                                    record.get('ccId'),
                                    record.get('pcsnDt'),
                                    record.get('acptNo'),
                                    record.get('execNo'),
                                    record.get('tnNo'),
                                    record.get('ccTrxSqno')
                                );
                            },
                            sortable: false,
                            align: 'center',
                            width: 60
                        },
                        {
                            text:bxMsg('centerCut.reRegister'),
                            renderer: function (value, p, record){
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn bw-btn-txt process-error-btn" data-id0="{0}" data-id1="{1}" data-id2="{2}" data-id3="{3}" data-id4="{4}" data-id5="{5}" data-id6="1">' + bxMsg('centerCut.reRegister') + '</button>',
                                    record.get('ccId'),
                                    record.get('pcsnDt'),
                                    record.get('acptNo'),
                                    record.get('execNo'),
                                    record.get('tnNo'),
                                    record.get('ccTrxSqno')
                                );
                            },
                            sortable: false,
                            align: 'center',
                            width: 60
                        },
                        {
                            text:bxMsg('common.del'),
                            renderer: function (value, p, record){
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn process-error-btn" data-id0="{0}" data-id1="{1}" data-id2="{2}" data-id3="{3}" data-id4="{4}" data-id5="{5}" data-id6="2"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('ccId'),
                                    record.get('pcsnDt'),
                                    record.get('acptNo'),
                                    record.get('execNo'),
                                    record.get('tnNo'),
                                    record.get('ccTrxSqno')
                                );
                            },
                            sortable: false,
                            align: 'center',
                            width: 50
                        }
                    ]
                });

                that.processingStatusGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('SCC1002', 'searchNodeStatus', 'SCC100203In', null, 'bxmAdminCC'),
                        key: 'SCC100203In'
                    },
                    responseParam: {
                        objKey: 'SCC100203Out',
                        key: 'listSCC100203Out'
                    },
                    header: {
                        content: [ // 병렬 프로세스 수, 노드 지정 방법
                            '<div><h3 class="bw-stt-detail clr-mg add-mg-r">' + bxMsg('centerCut.parallelProcessCount') + '<span>&nbsp;&nbsp;|&nbsp;&nbsp;</span><span class="bw-stt-detail-data"id="paraPrcsCnt"></span></h3>' +
                            '<h3 class="bw-stt-detail clr-mg">' + bxMsg('centerCut.nodeAppointMethod') + '<span>&nbsp;&nbsp;|&nbsp;&nbsp;</span><select class="bw-input ipt-select" id="nodeAppointMethod"></select></h3></div>'
                        ],
                        button: [
                            {
                                html: '<button type="button" class="bw-btn" title="' + bxMsg('common.save') + '"><i class="bw-icon i-25 i-func-save"></i></button>',
                                event: function () {
                                    that.saveProcessingStatus();
                                }
                            },
                            {
                                html: '<button type="button" class="bw-btn" title="' + bxMsg('common.refresh') + '"><i class="bw-icon i-25 i-func-refresh"></i></button>',
                                event: function () {
                                    that.loadProcessingStatusDetails(that.currentDetailsParams);
                                }
                            }
                        ]
                    },

                    fields: ['pcsnNodeNo', 'pcsnNodeNm', 'setPrcsCnt', 'curPrcsCnt', 'nomlPcsnCnt', 'nomlPcsnAmt', 'errPcsnCnt', 'errPcsnAmt'],
                    columns: [
                        {text: bxMsg('centerCut.processingNodeNo'), flex: 1, dataIndex: 'pcsnNodeNo', align: 'center'},
                        {text: bxMsg('centerCut.serverName'), flex: 3, dataIndex: 'pcsnNodeNm', align: 'center'},
                        {
                            text: bxMsg('centerCut.settingProcessCnt'), flex: 2, dataIndex: 'setPrcsCnt', align: 'center',
                            editor : {
                                xtype: 'textfield',
                                allowBlank: false
                            },
                            renderer: function (value) {
                                if (that.$nodeAppointMethod.val() === '1') {
                                    return that.$nodeAppointMethod.find('option:selected').text();
                                } else {
                                    return '<span style="cursor: pointer;">' + value + '<i class="bw-icon i-20 i-func-edit"></i></span>';
                                }
                            }
                        },
                        {text: bxMsg('centerCut.activeProcessCnt'), flex: 2, dataIndex: 'curPrcsCnt', align: 'center'},
                        {
                            text: bxMsg('centerCut.numberOfNormalProcessing'), flex: 2, dataIndex: 'nomlPcsnCnt',  align: 'center',
                            renderer: function (value) {
                                return commonUtil.numberWithCommas(value);
                            }
                        },
                        {
                            text: bxMsg('centerCut.priceOfNormalProcessing'), flex: 2, dataIndex: 'nomlPcsnAmt',  align: 'center',
                            renderer: function (value) {
                                return commonUtil.numberWithCommas(value);
                            }
                        },
                        {
                            text: bxMsg('centerCut.numberOfErrorProcessing'), flex: 2, dataIndex: 'errPcsnCnt',  align: 'center',
                            renderer: function (value) {
                                return commonUtil.numberWithCommas(value);
                            }
                        },
                        {
                            text: bxMsg('centerCut.priceOfErrorProcessing'), flex: 2, dataIndex: 'errPcsnAmt',  align: 'center',
                            renderer: function (value) {
                                return commonUtil.numberWithCommas(value);
                            }
                        }
                    ],
                    paging: false,
                    gridToggle: false,
                    gridConfig: {
                        plugins : [
                            Ext.create ('Ext.grid.plugin.CellEditing', {
                                clicksToEdit : 1,
                                listeners: {
                                    beforeedit: function (editor, e) {
                                        // `노드 지정 방법`이 자동일 경우 수정 불가
                                        if(that.$nodeAppointMethod.val() == 1){
                                            return false
                                        }
                                    },
                                    edit: function(editor, e){
                                        var selectedRowData = that.processingStatusGrid.getDataAt(e.rowIdx);

                                        if(isNaN(e.value)){
                                            swal({type: 'warning', title: '', text: bxMsg('common.number-value-msg'), timer: commonUtil.timer(), showConfirmButton: false});
                                            return false
                                        }

                                        if(selectedRowData['setPrcsCnt']){
                                            selectedRowData['setPrcsCnt'] = parseInt(e.value, 10);
                                            that.processingStatusGrid.setDataAt(e.rowIdx, selectedRowData);
                                        }
                                    }
                                }
                            })
                        ]
                    },
                    listeners: {
                        afterrender : function(grid) {
                            that.$nodeAppointMethod.on('change', function (e) {
                                var allData = that.processingStatusGrid.getAllData(),
                                    itemValue = 0;

                                if($(e.target).val() == 1){ // 자동
                                    itemValue = bxMsg('centerCut.auto');
                                }

                                allData.map(function (item) {
                                    item['setPrcsCnt'] = itemValue;
                                });

                                that.processingStatusGrid.setData(allData);
                            })
                        }
                    }
                });


                // Dom Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$pcsnStats = that.$searchWrap.find('.pcsnStats');
                that.$gridWrap = that.$el.find('.bxm-grid-wrap');
                that.$detailsListGrid = that.$el.find('.details-list-grid-wrap');
                that.$detailTitle = that.$el.find('h3 > .bxm-detail-title');
                that.$detailWrap = that.$el.find('.bxm-detail-wrap');
                that.$errorHandlingGrid = that.$el.find('.error-handling-grid-wrap');
                that.$processingStatusDetails = that.$el.find('.processingStatusDetails');
                that.$processingStatusGrid = that.$el.find('.processingStatusGrid');


                // tab menu 전환 기능
                that.$el.find(".tab-title li").click(function () {
                    that.$el.find(".tab-title li").removeClass("on-tab");
                    $(this).addClass("on-tab");
                    that.$el.find(".tabs").hide();
                    that.activeTab = $(this).attr("rel");
                    that.$el.find("#center-cut-job-status-" + that.activeTab).show();

                    if (that.activeTab === 'second-tab') {
                        if (!that.errorHandlingGridRendered) {
                            that.$errorHandlingGrid.html(that.errorHandlingGrid.render(function () {
                                that.currentDetailsParams && that.loadErrorHandlingDetails(that.currentDetailsParams);
                            }));

                            that.errorHandlingGridRendered = true;
                        }

                        if (that.errorHandlingGridModified) {
                            that.currentDetailsParams && that.loadErrorHandlingDetails(that.currentDetailsParams);

                            that.errorHandlingGridModified = false;
                        }
                    }

                    if (that.activeTab === 'last-tab') {
                        if (!that.processingStatusGridRendered) {
                            that.$processingStatusGrid.html(that.processingStatusGrid.render(function () {
                                that.currentDetailsParams && that.loadProcessingStatusDetails(that.currentDetailsParams);
                            }));

                            that.processingStatusGridRendered = true;
                        }

                        if (that.processingStatusGridModified) {
                            that.currentDetailsParams && that.loadProcessingStatusDetails(that.currentDetailsParams);
                            that.processingStatusGridModified = false;
                        }

                        that.$nodeAppointMethod = that.$el.find('#nodeAppointMethod');

                        that.$nodeAppointMethod.html(function () {
                            var cdList = commonConfig.comCdList['BXMCC0012'],
                                nodeAppointMethods = [];

                            [1, 2].forEach(function (item) {
                                nodeAppointMethods.push('<option value="' + item + '">' + cdList[item] + '</option>');
                            });

                            return nodeAppointMethods;
                        });
                    }
                });
            },

            render: function() {
                var that = this;

                commonUtil.setDatePicker(that.$searchWrap.find('input[data-form-param="pcsnDt"]'), 'yy-mm-dd');
                that.$pcsnStats.html(function () {
                    var cdList = commonConfig.comCdList['BXMCC0001'],
                        pcsnStats = [];

                    [3, 8, 9, 14, 10, 17, 20].forEach(function (item) {
                        pcsnStats.push('<input type="checkbox" class="bw-input ipt-radio" value="' + item + '"/>' +
                            '<span class="f-l" style="margin-right: 10px;">' + cdList[item] + '</span>');
                    });

                    return pcsnStats;
                });

                that.$gridWrap.html(that.grid.render(function(){
                    that.resetSearch();
                    that.loadList();
                }));
                that.$detailsListGrid.html(that.detailsListGrid.render());

                that.$detailWrap.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param]').val('');
                this.$searchWrap.find('[data-form-param="pcsnDt"]').datepicker('setDate', commonConfig.bizDate);
                this.$pcsnStats.find('input').prop('checked', false);
            },

            loadList: function() {
                var that = this,
                	listSub = [],
                    params = commonUtil.makeParamFromForm(this.$searchWrap);
                this.currentListParams = params;

                params.pcsnDt = params.pcsnDt.replace(/-/g, '');
                this.$pcsnStats.find('input:checked').each(function(i, item) {
                    listSub.push({
                        pcsnStat: $(item).val()
                    })
                });
                params.listSub = listSub;

                this.grid.loadData(params, function(data) {
                	data = data['listSCC1003Out'];
                	if(data && data.length) {
                		that.$gridWrap.find('tbody tr:first-child').click();
                	}
                }, true);

                this.detailsListGrid.resetData();
                this.currentDetailsParams = null;
                this.$detailWrap.find('input[data-form-param]').val('');
                this.errorHandlingGrid.resetData();
                this.errorHandlingGridModified = true;
                this.$processingStatusDetails.find('input[data-form-param]').val('');
                this.processingStatusGrid.resetData();
                this.processingStatusGridModified = true;
            },

            loadDetailsList: function (params) {
            	var that = this;
            	
                this.currentDetailsListParams = params;

                this.$detailTitle.text(params.ccId);
                this.detailsListGrid.loadData(params, function(data) {
                	data = data['out'];
                	if(data && data.length) {
                		that.$detailsListGrid.find('tbody tr:first-child').click();
                	}
                }, true);

                this.$detailWrap.find('input[data-form-param]').val('');
                this.errorHandlingGrid.resetData();
                this.processingStatusGridModified = true;
                this.$processingStatusDetails.find('input[data-form-param]').val('');
                this.processingStatusGrid.resetData();
                this.errorHandlingGridModified = true;
            },

            loadDetails: function (params) {

            	if(params == null) {
            		swal({type: 'warning', title: '', text: bxMsg('centerCut.job-select-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                	return;
            	}
            	
                this.currentDetailsParams = params;

                this.loadJobDetails(params);
                this.errorHandlingGridRendered && this.loadErrorHandlingDetails(params);
                this.processingStatusGridRendered && this.loadProcessingStatusDetails(this.currentDetailsParams);
            },

            loadJobDetails: function(params) {
                var that = this,
                    requestParam;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'SCC1003', 'searchCCDetailWork', 'BxmCCWorkStatusIO',
                    params,
                    'bxmAdminCC'
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var data = response['BxmCCWorkStatusIO'];

                        data['pcsnDt'] = commonUtil.changeStringToDateString(data['pcsnDt']);
                        data['pcsnStat'] = commonConfig.comCdList['BXMCC0001'][data['pcsnStat']];
                        data['fstSrtDt'] = commonUtil.changeStringToDateString(data['fstSrtDt']);
                        data['endDt'] = commonUtil.changeStringToDateString(data['endDt']);
                        data['reSrtDt'] = commonUtil.changeStringToDateString(data['reSrtDt']);
                        data['fstSrtTime'] = commonUtil.changeStringToTimeString(data['fstSrtTime']);
                        data['endTime'] = commonUtil.changeStringToTimeString(data['endTime']);
                        data['reSrtTime'] = commonUtil.changeStringToTimeString(data['reSrtTime']);
                        data['ttObjCnt'] = commonUtil.numberWithCommas(data['ttObjCnt']);
                        data['ttObjAmt'] = commonUtil.numberWithCommas(data['ttObjAmt']);
                        data['nomlPcsnCnt'] = commonUtil.numberWithCommas(data['nomlPcsnCnt']);
                        data['nomlPcsnAmt'] = commonUtil.numberWithCommas(data['nomlPcsnAmt']);
                        data['errPcsnCnt'] = commonUtil.numberWithCommas(data['errPcsnCnt']);
                        data['errPcsnAmt'] = commonUtil.numberWithCommas(data['errPcsnAmt']);
                        data['delPcsnCnt'] = commonUtil.numberWithCommas(data['delPcsnCnt']);
                        data['delPcsnAmt'] = commonUtil.numberWithCommas(data['delPcsnAmt']);

                        commonUtil.makeFormFromParam(that.$detailWrap, data);
                        commonUtil.makeFormFromParam(that.$processingStatusDetails, data);

                        that.errorHandlingGridModified = true;
                        that.processingStatusGridModified = true;
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },

            loadErrorHandlingDetails: function (params) {
                this.errorHandlingGrid.loadData(params, null, true);
            },

            loadProcessingStatusDetails: function (params) {
                var that = this;

            	if(params == null) {
            		swal({type: 'warning', title: '', text: bxMsg('centerCut.job-select-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                	return;
            	}

                // 병렬 프로세스 수 처리
                that.$paraPrcsCnt = that.$el.find('#paraPrcsCnt');

                this.processingStatusGrid.loadData(params, function (data) {
                    that.processingStatusDetailsData = data;
                    that.paraPrcsCnt = data['paraPrcsCnt'];

                    that.$nodeAppointMethod.val(data['nodeAsgnMethCd']);
                    that.$paraPrcsCnt.html(that.paraPrcsCnt);
                }, true);
            },

            refreshAll: function () {
                this.currentListParams && this.grid.loadData(this.currentListParams, null, true);
                this.currentDetailsListParams && this.detailsListGrid.loadData(this.currentDetailsListParams, null, true);
                this.currentDetailsParams && this.loadDetails(this.currentDetailsParams);
            },

            onClickJobRemoveBtn: function (event) {
                var $target = $(event.currentTarget);

                this.onClickOperationButton(null, '3', {
                    ccId: $target.attr('data-id'),
                    pcsnDt: $target.attr('data-pcsn'),
                    acptNo: $target.attr('data-acpt'),
                    tnNo: $target.attr('data-tn')

                });
            },

            onClickOperationButton: function (event, pcsnClsf, defaultParams) {
                var that = this,
                    params,
                    command;

                if (!pcsnClsf) {
                    pcsnClsf = $(event.currentTarget).val();
                }

                if (!/6|7/.test(pcsnClsf) && !this.currentDetailsListParams) {
                    swal({type: 'warning', title: '', text: bxMsg('common.run-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                switch (pcsnClsf) {
                    case '6':
                    	params = {
                            pcsnDt: this.currentListParams['pcsnDt'],
                            pcsnClsf: pcsnClsf
                        };
                    	command = bxMsg('centerCut.stopAllCenterCuts');
                        break;
                    case '7':
                        params = {
                            pcsnDt: this.currentListParams['pcsnDt'],
                            pcsnClsf: pcsnClsf
                        };
                    	command = bxMsg('centerCut.startAllCenterCuts');
                        break;
                    case '4':
                        params = {
                            ccId: this.currentDetailsParams['ccId'],
                            pcsnDt: this.currentDetailsParams['pcsnDt'],
                            acptNo: this.currentDetailsParams['acptNo'],
                            tnNo: this.currentDetailsParams['tnNo'],
                            execNo: this.currentDetailsParams['execNo'],
                            pcsnClsf: pcsnClsf
                        };
                        command = bxMsg('centerCut.processingAbnormalTermination');
                        break;
                    case '3':
/*                        if (!this.currentDetailsParams) {
                            swal({type: 'warning', title: '', text: bxMsg('common.run-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            return;
                        }*/
                        params = $.extend({}, this.currentDetailsParams, {
                            ccId: defaultParams ? defaultParams['ccId'] : this.currentDetailsParams['ccId'],
                            pcsnDt: defaultParams ? defaultParams['pcsnDt'] : this.currentDetailsParams['pcsnDt'],
                            acptNo: defaultParams ? defaultParams['acptNo'] : this.currentDetailsParams['acptNo'],
                            tnNo: defaultParams ? defaultParams['tnNo'] : this.currentDetailsParams['tnNo'],
                            pcsnClsf: pcsnClsf
                        });
                        command = bxMsg('centerCut.removeJob');
                        break;
                    case '1':
                        if (!this.currentDetailsParams) {
                            swal({type: 'warning', title: '', text: bxMsg('common.run-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            return;
                        }
                        params = $.extend({}, this.currentDetailsParams, {
                            pcsnClsf: pcsnClsf
                        });
                        command = bxMsg('centerCut.stop');
                        break;
                    default:
                        params = $.extend({}, this.currentDetailsParams);
                    	command = bxMsg('centerCut.executeCenterCut');
                }

                if($.isEmptyObject(params)) {
                	 swal({type: 'warning', title: '', text: bxMsg('centerCut.job-select-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                	return;
                }

                swal({
                    title: '', text: command + bxMsg('common.msg'), showCancelButton: true, closeOnConfirm: false
                }, function() {
                	var operation = pcsnClsf ? 'requestControlCentercut' : 'startCentercut',
                			omm = pcsnClsf ? 'SCC100202In' : 'SCC100201In',
                					requestParam = commonUtil.getBxmReqData('SCC1002', operation, omm, params, 'bxmAdminCC');

                	// Ajax 요청
                	commonUtil.requestBxmAjax(requestParam, {
                		success: function(response) {
                			var code = response['SCC100202Out'];

                			if(!code['rsvl']){
                				swal({type: 'success', title: '', text: bxMsg('common.run-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                				that.loadList();
                				that.loadDetailsList(that.currentDetailsListParams);
                			} else {
                				swal({type: 'error', title: '', text: bxMsg('common.run-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                			}
                		}
                	});
                }
                );
                
            },

            showCenterCutSearchPopup: function () {
                this.subViews['centerCutSearchPopup'].render();
            },

            // showCenterCutProcessingStatusDetailsPopup: function (event) {
            //     var $target = $(event.currentTarget);
            //
            //     this.subViews['centerCutProcessingStatusDetailsPopup'].render({
            //         ccId: $target.attr('data-id0'),
            //         pcsnDt: $target.attr('data-id1'),
            //         acptNo: $target.attr('data-id2'),
            //         execNo: $target.attr('data-id3'),
            //         tnNo: $target.attr('data-id4')
            //     });
            // },

            showCenterCutErrorDetailsPopup: function (event) {
                var $target = $(event.currentTarget);

                this.subViews['centerCutErrorDetailsPopup'].render({
                    ccId: $target.attr('data-id0'),
                    pcsnDt: $target.attr('data-id1'),
                    acptNo: $target.attr('data-id2'),
                    execNo: $target.attr('data-id3'),
                    tnNo: $target.attr('data-id4'),
                    ccTrxSqno: $target.attr('data-id5')
                });
            },

            onClickProcessErrorButton: function (event) {
                var $target = $(event.currentTarget),
                    params = {
                        ccId: $target.attr('data-id0'),
                        pcsnDt: $target.attr('data-id1'),
                        acptNo: $target.attr('data-id2'),
                        execNo: $target.attr('data-id3'),
                        tnNo: $target.attr('data-id4'),
                        ccTrxSqno: $target.attr('data-id5'),
                        condClasClsfCd: $target.attr('data-id6')
                    };

                // Ajax 요청
                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('SCC1005', 'processCcutError', 'SCC100502In', params, 'bxmAdminCC'), {
                    success: function(response) {
                        var code = response['SCC100502Out'];

                        if(!code['rsvl']){
                            swal({type: 'success', title: '', text: bxMsg('common.run-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        } else {
                            swal({type: 'error', title: '', text: bxMsg('common.run-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    }
                });
            },

            reRegisterAll: function (params) {
            	
            	if(params == null) {
            		swal({type: 'warning', title: '', text: bxMsg('centerCut.job-select-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                	return;
            	}
            	
                params = $.extend({}, params, {
                    condClasClsfCd: '0'
                });

                swal({
                    title: '', text: bxMsg('centerCut.reRegisterAll') + bxMsg('common.msg'), showCancelButton: true, closeOnConfirm: false
                }, function() {
                	commonUtil.requestBxmAjax(commonUtil.getBxmReqData('SCC1005', 'processCcutError', 'SCC100502In', params, 'bxmAdminCC'), {
                        success: function(response) {
                            var code = response['SCC100502Out'];

                            if(!code['rsvl']){
                                swal({type: 'success', title: '', text: bxMsg('common.run-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            } else {
                                swal({type: 'error', title: '', text: bxMsg('common.run-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            }
                        }
                    });
                }
                );
            },

            saveProcessingStatus: function () {
                var that = this,
                    processingStatusGridData = that.processingStatusGrid.getAllData(),
                    nodeAppointMethod = that.$nodeAppointMethod.val(),
                    allSettingProcessCnt = 0,
                    requestParam,
                    tempAllData = that.processingStatusDetailsData,
                    nodeList = [];

                if(nodeAppointMethod == 2){ // 수동

                    processingStatusGridData && processingStatusGridData.map(function (item) {
                        allSettingProcessCnt += parseInt(item['setPrcsCnt'], 10);
                    });

                    if(allSettingProcessCnt !== that.paraPrcsCnt){
                        swal({type: 'warning', title: '', text: "'설정 프로세스'의 총합이 병렬 프로세스 값과 같아야 합니다", timer: commonUtil.timer(), showConfirmButton: false});
                        return
                    }
                }

                // 자동일 경우 0 으로 post 한다
                // 수동일 경우 해당 값 보내기
                // 변경된 데이터 추가
                processingStatusGridData && processingStatusGridData.forEach(function (item) {
                    nodeList.push({
                        pcsnNodeNo: item.pcsnNodeNo.toString(),
                        setPrcsCnt: nodeAppointMethod == 2 ? item.setPrcsCnt.toString() : 0
                    });
                });

                // 불필요한 필드 삭제
                delete tempAllData['listSCC100203Out'];
                delete tempAllData['pcsnStat'];

                tempAllData['paraPrcsCnt'] = that.paraPrcsCnt; // paraPrcsCnt 필드 추가
                tempAllData['nodeAsgnMethCd'] = nodeAppointMethod; // nodeAsgnMethCd 필드 값 수정
                tempAllData['nodeList'] = nodeList; // nodeList 필드 추가

                // string 타입으로 변경
                Object.keys(tempAllData).map(function (key) {
                    if(typeof tempAllData[key] == 'number'){
                        tempAllData[key] = tempAllData[key].toString();
                    }
                });

                requestParam = commonUtil.getBxmReqData(
                    'SCC1002', 'updateNodeStatus', 'SCC100204In', tempAllData, 'bxmAdminCC'
                );

                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.timer(), showConfirmButton: false});
                            that.loadProcessingStatusDetails(that.currentDetailsParams);
                        }else if(code === 201){
                            swal({type: 'error', title: '', text: bxMsg('common.save-fail-msg'), timer: commonUtil.timer(), showConfirmButton: false});
                        }else if(code === 202){
                            swal({type: 'error', title: '', text: bxMsg('common.same-val-msg'), timer: commonUtil.timer(), showConfirmButton: false});
                        }else if(code === 204){
                            swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.timer(), showConfirmButton: false});
                        }
                    }
                })
            },
        });
    }
);