define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'common/component/bx-flowchart/bx-flowchart',
        'views/online/link-flow-management/link-start-trading-code-search-popup',
        'views/online/link-flow-management/link-flow-main-add-popup',
        'text!views/online/link-flow-management/_link-flow-management-tpl.html',
        'text!views/online/link-flow-management/link-flow-detail-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        BxFlowchart,
        LinkStartTradingCodeSearchPopup,
        LinkFlowMainPopup,
        tpl,
        detailTpl
    ) {

        var LinkFlowManagementView = Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl,
                'detailTpl': detailTpl
            },

            events: {
                'click .reset-search-btn': 'resetLinkFlowList',
                'click .search-btn': 'loadLinkFlowList',
                'enter-component .link-flow-management-search input': 'loadLinkFlowList',
                'click .del-link-flow-btn': 'delLinkFlow',

                'click .edit-link-flow-management-btn': 'setEditModeLinkFlow',
                'click .save-link-flow-management-btn': 'saveLinkFlow',
                'click .cancel-link-flow-management-btn': 'cancelLinkFlow',

                'change [data-form-param="linkOutputCheckYn"]': 'checkLinkOutputFqn',
                'change [data-form-param="inputCheckYn"]': 'checkInputCheckCtt',
                'change [data-form-param="linkBefCheckYn"]': 'checkLinkCheckFqn',
                'change [data-form-param="linkAftCheckYn"]': 'checkLinkCheckFqn',
                'change [data-form-param="startYn"]': 'checkOutputType',
                'change .link-flow-management-detail [data-form-param]': 'saveDetailData',

                'change [data-form-param="inputMappingType"]': 'toggleInputMappingGrid',
                'change [data-form-param="linkOutputMappingType"]': 'toggleLinkOutputMappingGrid',

                'click .del-output-mapping-btn': 'removeMappingOutputGridRow',
                'click .del-input-mapping-btn': 'removeMappingInputGridRow'
            },

            FLOWCHART_V_MARGIN: 10,
            TRX_RIGHT_Y_PADDING_TO_PILLAR: 40,
            TRX_RIGHT_Y: 0,
            TRX_RIGHT_HEIGHT: 80,

            bxFlowchartData: {nodeIdMap: null, detailLength: 0, draggStartIdx: 0, draggEndIdx: 0},
            detailGridList: {},
            detailGridData: {},
            mainFlowInfo: {},
            detailList: [],

            initialize: function() {
                var that = this;
                that.TRX_RIGHT_Y = this.FLOWCHART_V_MARGIN + this.TRX_RIGHT_Y_PADDING_TO_PILLAR;

                // Set Page
                that.$el.html(that.tpl());

                // Set Grid
                that.linkFlowGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('LinkFlowMainService', 'getLinkMainList', 'LinkFlowMainInOMM'),
                        key: 'LinkFlowMainInOMM'
                    },
                    responseParam: {
                        objKey: 'LinkFlowMainListOMM',
                        key: 'linkMainList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['linkFlowMainPopup'].render();
                                }
                            }
                        ]
                    },
                    paging: true,
                    fields: ['linkTrxCnt', 'linkMainCd', 'linkStartTrxCd', 'useYn', 'linkOutputMappingType', 'linkOutputCheckYn', 'linkTrxCds'],
                    columns: [
                        {text: bxMsg('online.link-representative-code'), flex: 1, dataIndex: 'linkMainCd', align: 'center'},
                        {text: bxMsg('online.start-trading-code'), flex: 1, dataIndex: 'linkStartTrxCd', align: 'center'},
                        {text: bxMsg('online.link-trading-count'), flex: 1, dataIndex: 'linkTrxCnt', align: 'center'},
                        {text: bxMsg('online.link-trading-code'), flex: 2, dataIndex: 'linkTrxCds', align: 'center'},
                        {text: bxMsg('online.use-yn'), width: 160, dataIndex: 'useYn', align: 'center'},
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn del-link-flow-btn" data-id="{0}"> ' +
                                    '<i class="bw-icon i-20 i-func-trash"></i>' +
                                    '</button>',
                                    record.get('linkMainCd')
                                );
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            width: 50
                        }
                    ],
                    listeners: {
                        select : function(_this, record) {
                            that.loadLinkFlow({linkMainCd: record.get('linkMainCd')});
                        }
                    }
                });

                that.linkOutMappingGrid = new ExtGrid({
                    header: {
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    if(that.$el.attr('data-mode') === 'read') return;

                                    if(that.detailList.length === 0){
                                        swal({type: 'warning', title: '', text: bxMsg('online.add-link-trading-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                        return;
                                    }
                                    that.linkOutMappingGrid.addData({type: 'R'});
                                    that.linkOutMappingGrid.update();
                                }
                            },
                            {
                                html: '<button type="button" class="bw-btn"><i class="fa fa-angle-up chr-c-blue fs-20" title="' + bxMsg('common.up') + '"></i></button>',
                                event: function() {
                                    var selectedRow = that.linkOutMappingGrid.getSelectedRecords(),
                                        selectedNbr,
                                        prevRow;

                                    if(selectedRow.length === 0){
                                        swal({type: 'warning', title: '', text: bxMsg('message.select-field-msg'), timer: commonUtil.timer(), showConfirmButton: false});
                                        return;
                                    }

                                    selectedNbr = that.linkOutMappingGrid.getSelectedRowIdx();
                                    prevRow = that.linkOutMappingGrid.getDataAt(selectedNbr-1);

                                    // 이전 로우가 없으면 리턴
                                    if(!prevRow) {
                                        return;
                                    }else{
                                        prevRow = $.extend({}, prevRow);

                                        that.linkOutMappingGrid.removeAt(selectedNbr - 1);
                                        that.linkOutMappingGrid.insertData(selectedNbr - 1, selectedRow[0].data);
                                        that.linkOutMappingGrid.removeAt(selectedNbr);
                                        that.linkOutMappingGrid.insertData(selectedNbr, prevRow);
                                        that.linkOutMappingGrid.setSelectedRowIdx(selectedNbr-1);
                                    }
                                }
                            },
                            {
                                html: '<button type="button" class="bw-btn"><i class="fa fa-angle-down chr-c-blue fs-20" title="' + bxMsg('common.down') + '"></i></button>',
                                event: function() {
                                    var selectedRow = that.linkOutMappingGrid.getSelectedRecords(),
                                        selectedNbr,
                                        nextRow;

                                    if(selectedRow.length === 0){
                                        swal({type: 'warning', title: '', text: bxMsg('message.select-field-msg'), timer: commonUtil.timer(), showConfirmButton: false});
                                        return;
                                    }

                                    selectedNbr = that.linkOutMappingGrid.getSelectedRowIdx();
                                    nextRow = that.linkOutMappingGrid.getDataAt(selectedNbr+1);

                                    // 다음 로우가 없으면 리턴
                                    if(!nextRow) {
                                        return;
                                    }else{
                                        nextRow = $.extend({}, nextRow);

                                        that.linkOutMappingGrid.removeAt(selectedNbr);
                                        that.linkOutMappingGrid.insertData(selectedNbr, nextRow);
                                        that.linkOutMappingGrid.removeAt(selectedNbr + 1);
                                        that.linkOutMappingGrid.insertData(selectedNbr + 1, selectedRow[0].data);
                                        that.linkOutMappingGrid.setSelectedRowIdx(selectedNbr+1);
                                    }
                                }
                            }
                        ]
                    },
                    requestParam: {
                        obj: commonUtil.getBxmReqData('LinkFlowMainService', 'getMainFlowDetails', 'LinkFlowMainOMM'),
                        key: 'LinkFlowMainOMM'
                    },
                    responseParam: {
                        objKey: 'LinkFlowMainDetailOMM',
                        key: 'mainFlowInfo'
                    },
                    clr: 'grid-row-span',
                    pageCountDefaultVal: 5,
                    fields: ['source', 'type', 'map'],
                    columns: [
                        {text: 'Source', flex: 1, dataIndex: 'source', align: 'center'},
                        {
                            text: 'Target', flex: 1, align: 'center',
                            renderer: function(value) {
                            	return that.mainFlowInfo.linkStartTrxCd + '_out';
                            }
//                            renderer: function (value, meta, record, rowIndex, colIndex, store) {
//                                var first = !rowIndex ,
//                                    last = rowIndex >= store.getCount() - 1;
//
//                                !meta.css && (meta.css = '');
//                                meta.css += ' row-span' + (first ? ' row-span-first' : '') +  (last ? ' row-span-last' : '');
//
//                                return first ? that.mainFlowInfo.linkStartTrxCd + '_out' : '';
//                            }
                        },
                        {
                            text: 'Type', flex: 1, dataIndex: 'type', align: 'center',
                            editor : {
                                xtype : 'combobox',
                                store : Ext.create('Ext.data.Store', {
                                    fields: ['id', 'val'],
                                    data: [
                                        {id: 'R', val: 'RULE'},
                                        {id: 'A', val: 'AUTO'}
                                    ]
                                }),
                                displayField: 'val',
                                valueField: 'id',
                                listeners: {
                                    change: function(combo, newValue) {
                                        if(newValue === 'A'){
                                            var record = that.linkOutMappingGrid.getSelectedRecords()[0];

                                            record.data.map = '';
                                            record.commit();
                                        }
                                    }
                                }
                            },
                            renderer: function(value) {
                                if(value === 'R') return 'RULE';
                                else if(value === 'A') return 'AUTO';
                            }
                        },
                        {
                            text: 'MAP (ID)', flex: 1, dataIndex: 'map', align: 'center',
                            editor : {
                                xtype : 'textfield',
                                allowBlank :false
                            }
                        },
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn del-output-mapping-btn" data-idx="{0}"> ' +
                                    '<i class="bw-icon i-20 i-func-trash"></i>' +
                                    '</button>',
                                    idx
                                );
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            width: 50
                        }
                    ],
                    gridConfig: {
                        plugins : [
                            Ext.create ('Ext.grid.plugin.CellEditing', {
                                clicksToEdit : 1,
                                listeners: {
                                    beforeedit: function( editor, e ) {
                                        if(that.$el.attr('data-mode') === 'read') return false;

                                        if(e.field === 'source'){
                                            // Source에 하위 연동 거래 코드 표시 (출력 기분이 출력 저장인 경우만)
                                            that.linkOutMappingGrid.grid.columns[0].getEditor().getStore().loadData(
                                                that.detailList.filter(function(detailItem) {
                                                    return detailItem.outputType === 'S';
                                                })
                                            );
                                        }

                                        if(e.field === 'map'){
                                            var record = that.linkOutMappingGrid.getSelectedRecords()[0];

                                            return record.data.type !== 'A';
                                        }
                                    }
                                }
                            })
                        ]
                    }
                });

                // Set SubViews
                that.subViews['detailLoadingBar'] = new LoadingBar();
                that.subViews['linkStartTradingCodeSearchPopup'] = new LinkStartTradingCodeSearchPopup();
                that.subViews['linkStartTradingCodeSearchPopup'].on('select-code', function(data) {
                    var newDetail = {
                        linkSeq: that.bxFlowchartData.detailLength + 1, trxCd: data.linkStartTrxCd, outputType: (that.mainFlowInfo.linkStartTrxCd === data.linkStartTrxCd) ? 'B' : 'S',
                        inputCheckCtt: null, inputCheckYn: 'Y', inputMappingCtt: null, inputMappingType: 'B',
                        linkAftCheckYn: 'Y', linkBefCheckYn: 'Y', linkCheckFqn: null, linkMainCd: that.mainFlowInfo.linkMainCd,
                        startYn: (that.mainFlowInfo.linkStartTrxCd === data.linkStartTrxCd) ? 'Y' : 'N', tranProcCd: '1TX'
                    },
                    addObj = that.bxFlowchart.getNodeById(that.bxFlowchartData.nodeIdMap.addId);
                    addObj.y = addObj.y + 80;

                    that.drawTrxContainer(newDetail, that.bxFlowchartData.detailLength);

                    that.detailList.push(newDetail);
                    that.bxFlowchartData.detailLength += 1;

                    that.setFlowchartHeight(that.bxFlowchartData.detailLength+1);
                    that.bxFlowchart.update();
                    that.renderFlowDetail();
                    that.setEditMode();
                });
                that.subViews['linkFlowMainPopup'] = new LinkFlowMainPopup();
                that.subViews['linkFlowMainPopup'].on('add-link-flow-main', function() {
                    // 사용자 생성시, 리스트 리프래시
                    that.linkFlowGrid.reloadData();
                });

                // Dom Element Cache
                that.$linkFlowGrid = that.$el.find('.link-flow-management-grid');
                that.$linkFlowSearch = that.$el.find('.link-flow-management-search');
                that.$linkFlowDetailTitle = that.$el.find('.link-flow-management-detail-title');
                that.$linkFlowDetail = that.$el.find('.link-flow-management-detail');
                that.$linkFlowChart = that.$el.find('.link-flow-chart');
                that.$linkFlowChartMain = that.$el.find('.link-flow-chart-main');
                that.$linkFlowChartDetail = that.$el.find('.link-flow-detail-accordion');
            },

            render: function() {
                var that = this;

                $.elementReady(that.$el, function() {
                    that.$linkFlowGrid.html(that.linkFlowGrid.render(function(){that.loadLinkFlowList();}));
                    that.$el.find('.link-out-mapping-grid').html(that.linkOutMappingGrid.render());
                    that.$linkFlowDetail.append(that.subViews['detailLoadingBar'].render());
                    that.$linkFlowChartMain.find('[data-form-param="linkOutputMappingType"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0036']));

                    that.bxFlowchart = new BxFlowchart.default({
                        el: that.$linkFlowChart[0],
                        nodeTypes: {
                            CH: {
                                clickFn: function(e, node) {
                                    node.type = 'NCH';
                                    that.bxFlowchart.update();

                                    var $body = that.$linkFlowChartDetail.find('.accordion-body[data-link-seq="'+ node.linkSeq + '"]');
                                    $body.find('[data-form-param=inputCheckYn]').val('N').trigger('change');

                                    that.detailList.forEach(function(detailItem) {
                                        if(node.linkSeq == detailItem.linkSeq){
                                            detailItem.inputCheckYn = 'N';
                                        }
                                    });
                                }
                            },
                            NCH: {
                                clickFn: function (e, node) {
                                    node.type = 'CH';
                                    that.bxFlowchart.update();

                                    var $body = that.$linkFlowChartDetail.find('.accordion-body[data-link-seq="'+ node.linkSeq + '"]');
                                    $body.find('[data-form-param=inputCheckYn]').val('Y').trigger('change');

                                    that.detailList.forEach(function(detailItem) {
                                        if(node.linkSeq == detailItem.linkSeq){
                                            detailItem.inputCheckYn = 'Y';
                                        }
                                    });
                                }
                            },
                            IM: {
                                clickFn: function (e, node) {
                                    node.type = 'IB';
                                    that.bxFlowchart.update();

                                    var $body = that.$linkFlowChartDetail.find('.accordion-body[data-link-seq="'+ node.linkSeq + '"]');
                                    $body.find('[data-form-param=inputMappingType]').val('B').trigger('change');

                                    that.detailList.forEach(function(detailItem) {
                                        if(node.linkSeq == detailItem.linkSeq){
                                            detailItem.inputMappingType = 'B';
                                        }
                                    });
                                }
                            },
                            IB: {
                                clickFn: function (e, node) {
                                    node.type = 'IM';
                                    that.bxFlowchart.update();

                                    var $body = that.$linkFlowChartDetail.find('.accordion-body[data-link-seq="'+ node.linkSeq + '"]');
                                    $body.find('[data-form-param=inputMappingType]').val('M').trigger('change');

                                    that.detailList.forEach(function(detailItem) {
                                        if(node.linkSeq == detailItem.linkSeq){
                                            detailItem.inputMappingType = 'M';
                                        }
                                    });
                                }
                            },
                            OB: {
                                clickFn: function (e, node) {
                                    if(node.startYn == 'Y') {
                                        swal({type: 'warning', title: '', text: bxMsg('online.change-start-trading-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                        return;
                                    }

                                    node.type = 'OS';
                                    that.bxFlowchart.update();

                                    var $body = that.$linkFlowChartDetail.find('.accordion-body[data-link-seq="'+ node.linkSeq + '"]');
                                    $body.find('[data-form-param=outputType]').val('S').trigger('change');

                                    that.detailList.forEach(function(detailItem) {
                                        if(node.linkSeq == detailItem.linkSeq){
                                            detailItem.outputType = 'S';
                                        }
                                    });
                                }
                            },
                            OS: {
                                clickFn: function (e, node) {
                                    node.type = 'OD';
                                    that.bxFlowchart.update();

                                    var $body = that.$linkFlowChartDetail.find('.accordion-body[data-link-seq="'+ node.linkSeq + '"]');
                                    $body.find('[data-form-param=outputType]').val('D').trigger('change');

                                    that.detailList.forEach(function(detailItem) {
                                        if(node.linkSeq == detailItem.linkSeq){
                                            detailItem.outputType = 'D';
                                        }
                                    });
                                }
                            },
                            OD: {
                                clickFn: function (e, node) {
                                    node.type = 'OS';
                                    that.bxFlowchart.update();

                                    var $body = that.$linkFlowChartDetail.find('.accordion-body[data-link-seq="'+ node.linkSeq + '"]');
                                    $body.find('[data-form-param=outputType]').val('B').trigger('change');

                                    that.detailList.forEach(function(detailItem) {
                                        if(node.linkSeq == detailItem.linkSeq){
                                            detailItem.outputType = 'B';
                                        }
                                    });
                                }
                            },
                            PRE: {
                                clickFn: function (e, node) {
                                    node.type = 'NPRE';
                                    that.bxFlowchart.update();

                                    var $body = that.$linkFlowChartDetail.find('.accordion-body[data-link-seq="'+ node.linkSeq + '"]');
                                    $body.find('[data-form-param=linkBefCheckYn]').val('N').trigger('change');

                                    that.detailList.forEach(function(detailItem) {
                                        if(node.linkSeq == detailItem.linkSeq){
                                            detailItem.linkBefCheckYn = 'N';
                                        }
                                    });
                                }
                            },
                            NPRE: {
                                clickFn: function (e, node) {
                                    node.type = 'PRE';
                                    that.bxFlowchart.update();

                                    var $body = that.$linkFlowChartDetail.find('.accordion-body[data-link-seq="'+ node.linkSeq + '"]');
                                    $body.find('[data-form-param=linkBefCheckYn]').val('Y').trigger('change');

                                    that.detailList.forEach(function(detailItem) {
                                        if(node.linkSeq == detailItem.linkSeq){
                                            detailItem.linkBefCheckYn = 'Y';
                                        }
                                    });
                                }
                            },
                            POST: {
                                clickFn: function (e, node) {
                                    node.type = 'NPOST';
                                    that.bxFlowchart.update();

                                    var $body = that.$linkFlowChartDetail.find('.accordion-body[data-link-seq="'+ node.linkSeq + '"]');
                                    $body.find('[data-form-param=linkAftCheckYn]').val('N').trigger('change');

                                    that.detailList.forEach(function(detailItem) {
                                        if(node.linkSeq == detailItem.linkSeq){
                                            detailItem.linkAftCheckYn = 'N';
                                        }
                                    });
                                }
                            },
                            NPOST: {
                                clickFn: function (e, node) {
                                    node.type = 'POST';
                                    that.bxFlowchart.update();

                                    var $body = that.$linkFlowChartDetail.find('.accordion-body[data-link-seq="'+ node.linkSeq + '"]');
                                    $body.find('[data-form-param=linkAftCheckYn]').val('Y').trigger('change');

                                    that.detailList.forEach(function(detailItem) {
                                        if(node.linkSeq == detailItem.linkSeq){
                                            detailItem.linkAftCheckYn = 'Y';
                                        }
                                    });
                                }
                            },
                            '1TX': {
                                clickFn: function (e, node) {
                                    node.type = 'NTX-R';
                                    that.bxFlowchart.update();

                                    var $body = that.$linkFlowChartDetail.find('.accordion-body[data-link-seq="'+ node.linkSeq + '"]');
                                    $body.find('[data-form-param=tranProcCd]').val('NTX-R').trigger('change');

                                    that.detailList.forEach(function(detailItem) {
                                        if(node.linkSeq == detailItem.linkSeq){
                                            detailItem.tranProcCd = 'NTX-R';
                                        }
                                    });
                                }
                            },
                            'NTX-R': {
                                clickFn: function (e, node) {
                                    node.type = 'NTX';
                                    that.bxFlowchart.update();

                                    var $body = that.$linkFlowChartDetail.find('.accordion-body[data-link-seq="'+ node.linkSeq + '"]');
                                    $body.find('[data-form-param=tranProcCd]').val('NTX').trigger('change');

                                    that.detailList.forEach(function(detailItem) {
                                        if(node.linkSeq == detailItem.linkSeq){
                                            detailItem.tranProcCd = 'NTX';
                                        }
                                    });
                                }
                            },
                            NTX: {
                                clickFn: function (e, node) {
                                    node.type = '1TX';
                                    that.bxFlowchart.update();

                                    var $body = that.$linkFlowChartDetail.find('.accordion-body[data-link-seq="'+ node.linkSeq + '"]');
                                    $body.find('[data-form-param=tranProcCd]').val('1TX').trigger('change');

                                    that.detailList.forEach(function(detailItem) {
                                        if(node.linkSeq == detailItem.linkSeq){
                                            detailItem.tranProcCd = '1TX';
                                        }
                                    });
                                }
                            },
                            'S1TX': {
                                clickFn: function (e, node) {
                                    node.type = 'SNTX-R';
                                    that.bxFlowchart.update();

                                    var $body = that.$linkFlowChartDetail.find('.accordion-body[data-link-seq="'+ node.linkSeq + '"]');
                                    $body.find('[data-form-param=tranProcCd]').val('NTX-R').trigger('change');

                                    that.detailList.forEach(function(detailItem) {
                                        if(node.linkSeq == detailItem.linkSeq){
                                            detailItem.tranProcCd = 'NTX-R';
                                        }
                                    });
                                }
                            },
                            'SNTX-R': {
                                clickFn: function (e, node) {
                                    node.type = 'SNTX';
                                    that.bxFlowchart.update();

                                    var $body = that.$linkFlowChartDetail.find('.accordion-body[data-link-seq="'+ node.linkSeq + '"]');
                                    $body.find('[data-form-param=tranProcCd]').val('NTX').trigger('change');

                                    that.detailList.forEach(function(detailItem) {
                                        if(node.linkSeq == detailItem.linkSeq){
                                            detailItem.tranProcCd = 'NTX';
                                        }
                                    });
                                }
                            },
                            SNTX: {
                                clickFn: function (e, node) {
                                    node.type = 'S1TX';
                                    that.bxFlowchart.update();

                                    var $body = that.$linkFlowChartDetail.find('.accordion-body[data-link-seq="'+ node.linkSeq + '"]');
                                    $body.find('[data-form-param=tranProcCd]').val('1TX').trigger('change');

                                    that.detailList.forEach(function(detailItem) {
                                        if(node.linkSeq == detailItem.linkSeq){
                                            detailItem.tranProcCd = '1TX';
                                        }
                                    });
                                }
                            },
                            MAPPING: {
                                clickFn: function (e, node) {
                                    node.type = 'NMAPPING';
                                    that.bxFlowchart.update();

                                    that.$linkFlowChartMain.find('[data-form-param=linkOutputMappingType]').val('B').trigger('change');
                                }
                            },
                            NMAPPING: {
                                clickFn: function (e, node) {
                                    node.type = 'MAPPING';
                                    that.bxFlowchart.update();

                                    that.$linkFlowChartMain.find('[data-form-param=linkOutputMappingType]').val('M').trigger('change');
                                }
                            },
                            CONFIRM: {
                                clickFn: function (e, node) {
                                    node.type = 'NCONFIRM';
                                    that.bxFlowchart.update();

                                    that.$linkFlowChartMain.find('[data-form-param=linkOutputCheckYn]').val('N').trigger('change');
                                }
                            },
                            NCONFIRM: {
                                clickFn: function (e, node) {
                                    node.type = 'CONFIRM';
                                    that.bxFlowchart.update();

                                    that.$linkFlowChartMain.find('[data-form-param=linkOutputCheckYn]').val('Y').trigger('change');
                                }
                            },
                            ADD: {
                                clickFn: function (e, node) {
                                    var existingTrxCdList = [];

                                    that.detailList.forEach(function(detailItem) {
                                        existingTrxCdList.push(detailItem.trxCd);
                                    });
                                    that.subViews['linkStartTradingCodeSearchPopup'].render({existingTrxCdList: existingTrxCdList});
                                }
                            },
                            DEL: {
                                clickFn: function (e, node) {
                                    var delIdx;

                                    that.detailList.some(function(detailItem, idx) {
                                        if(detailItem.linkSeq == node.linkSeq) {
                                            delIdx = idx;
                                            return true;
                                        }
                                    });

                                    that.detailList.splice(delIdx, 1);

                                    that.detailList.forEach(function(detailItem, idx) {
                                        detailItem.linkSeq = idx + 1;
                                    });

                                    that.renderFlowChart();
                                    that.renderFlowDetail();
                                    that.setEditModeLinkFlow();
                                }
                            },
                            CENTER_PILLAR: {
                                width: 22,
                                style: 'fill: url(#grad1);'
                            },
                            DRAG: {
                                draggable: true,
                                draggedStartedFn: function (e, d) {
                                    var draggNodeIdGroup = that.bxFlowchart.getNodeGroup(d.linkSeq),
                                        draggTextIdGroup = that.bxFlowchart.getTextGroup(d.linkSeq);

                                    that.draggedGroup = [];

                                    that.bxFlowchartData.draggStartIdx = d.linkSeq - 1;

                                    draggNodeIdGroup && draggNodeIdGroup.forEach(function(groupItemId){
                                        var groupItemObj = that.bxFlowchart.getNodeById(groupItemId);

                                        that.draggedGroup.push(groupItemObj);

                                        groupItemObj.fx = groupItemObj.x;
                                        groupItemObj.fy = groupItemObj.y;
                                    });

                                    draggTextIdGroup && draggTextIdGroup.forEach(function(groupItemId){
                                        var groupItemObj = that.bxFlowchart.getTextById(groupItemId);

                                        that.draggedGroup.push(groupItemObj);

                                        groupItemObj.initX = groupItemObj.fx = groupItemObj.x;
                                        groupItemObj.initY = groupItemObj.fy = groupItemObj.y;
                                    });
                                },
                                draggedFn: function(e, d){
                                    var diffX = e.x - d.fx,
                                        diffY = e.y - d.fy;

                                    that.draggedGroup.forEach(function(groupItemObj){
                                        groupItemObj.x = groupItemObj.fx = groupItemObj.fx + diffX;
                                        groupItemObj.y = groupItemObj.fy = groupItemObj.fy + diffY;
                                    });
                                },
                                dragEndedFn: function(e, d){
                                    var startData,
                                        i;

                                    that.bxFlowchartData.draggEndIdx
                                        = Math.ceil((d.y - that.TRX_RIGHT_Y - that.TRX_RIGHT_HEIGHT / 2) / that.TRX_RIGHT_HEIGHT);

                                    if(e.y - d.fy < 0) {
                                        that.bxFlowchartData.draggEndIdx += 1;
                                    }
                                    if(that.bxFlowchartData.draggEndIdx <= -1){
                                        that.bxFlowchartData.draggEndIdx = 0;
                                    }
                                    if(that.bxFlowchartData.draggEndIdx >= that.bxFlowchartData.detailLength){
                                        that.bxFlowchartData.draggEndIdx = that.bxFlowchartData.detailLength - 1;
                                    }

                                    that.draggedGroup.forEach(function(groupItemObj){
                                        groupItemObj.fx = null;
                                        groupItemObj.fy = null;
                                    });

                                    if(e.x < 20 || e.x > 750){
                                        return;
                                    }

                                    if(that.bxFlowchartData.draggStartIdx !== undefined && that.bxFlowchartData.draggEndIdx !== undefined &&
                                        that.bxFlowchartData.draggStartIdx >= 0 && that.bxFlowchartData.draggEndIdx >= 0) {

                                        if(that.bxFlowchartData.draggStartIdx > that.bxFlowchartData.draggEndIdx) {
                                            startData = that.detailList[that.bxFlowchartData.draggStartIdx];

                                            for(i = that.bxFlowchartData.draggStartIdx ; i > that.bxFlowchartData.draggEndIdx ; i --){
                                                that.detailList[i] = that.detailList[i - 1];
                                            }

                                            that.detailList[that.bxFlowchartData.draggEndIdx] = startData;

                                            that.detailList.forEach(function(detailItem, idx) {
                                                detailItem.linkSeq = idx + 1;
                                            });

                                            that.renderFlowChart();
                                            that.renderFlowDetail();
                                            that.setEditModeLinkFlow();
                                        }else if(that.bxFlowchartData.draggStartIdx < that.bxFlowchartData.draggEndIdx) {
                                            startData = that.detailList[that.bxFlowchartData.draggStartIdx];

                                            for(i = that.bxFlowchartData.draggStartIdx ; i < that.bxFlowchartData.draggEndIdx ; i ++){
                                                that.detailList[i] = that.detailList[i + 1];
                                            }

                                            that.detailList[that.bxFlowchartData.draggEndIdx] = startData;

                                            that.detailList.forEach(function(detailItem, idx) {
                                                detailItem.linkSeq = idx + 1;
                                            });

                                            that.renderFlowChart();
                                            that.renderFlowDetail();
                                            that.setEditModeLinkFlow();
                                        }
                                    }
                                }
                            }
                        },
                        fieldNm: {
                            node: {
                                id: 'id',
                                type: 'type',
                                x: 'x',
                                y: 'y',
                                text: 'text',
                                extraParam: ['trxCd', 'linkSeq', 'startYn']
                            }
                        },
                        grid: false,
                        draggable: false,
                        svgDraggable: false,
                        wheelDrag: false
                    });

                    // that.$linkFlowChart.resizable({containment: 'parent', minHeight: 100, minWidth: 100});
                    that.setReadMode();
                });

                return that.$el;
            },

            resetLinkFlowList: function() {
                this.$linkFlowSearch.find('[data-form-param]').val('');
            },

            loadLinkFlowList: function() {
                this.linkFlowGrid.loadData(commonUtil.makeParamFromForm(this.$linkFlowSearch), null, true);
            },

            /**
             * linkMainCd
             * */
            loadLinkFlow: function(param) {
                var that = this,
                    requestParam;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'LinkFlowMainService', 'getMainFlowDetails', 'LinkFlowMainOMM',
                    param
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var linkFlowMainDetailOMM = response.LinkFlowMainDetailOMM,
                            detailList = linkFlowMainDetailOMM.detailList;

                        that.mainFlowInfo = linkFlowMainDetailOMM.mainFlowInfo;
                        that.detailList = detailList;

                        // 타이틀
                        that.$linkFlowDetailTitle.html(that.mainFlowInfo.linkMainCd);

                        // 플로우 차트
                        that.renderFlowChart();
                        that.bxFlowchart.resetZoom(0, 0, 1, 0);

                        // 메인 정보 데이터
                        commonUtil.makeFormFromParam(that.$linkFlowChartMain, that.mainFlowInfo);
                        that.$linkFlowChartMain.find('[data-form-param="linkOutputCheckYn"]').trigger('change');
                        that.$linkFlowChartMain.find('[data-form-param="linkOutputMappingType"]').trigger('change');
                        that.linkOutMappingGrid.grid.columns[0].editor = {
                            xtype : 'combobox',
                            store : Ext.create('Ext.data.Store', {
                                fields: ['trxCd'],
                                data: that.detailList.filter(function(detailItem) {
                                    return detailItem.outputType === 'S';
                                })
                            }),
                            displayField: 'trxCd',
                            valueField: 'trxCd'
                        };
                        that.linkOutMappingGrid.update();
                        that.linkOutMappingGrid.setData(that.mainFlowInfo.linkOutputMappingCtt ? that.mainFlowInfo.linkOutputMappingCtt : []);

                        // 상세 정보 데이터
                        that.renderFlowDetail();

                        that.setReadMode();
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },

            renderFlowChart: function() {
                var that = this;

                that.bxFlowchart.reset();
                that.bxFlowchart.update();
                that.bxFlowchartData = {nodeIdMap: {}, detailLength: that.detailList.length};

                // 기본 노드 표시
                that.bxFlowchart.addNode({type: 'RA', x: 5, y: 84}, true);
                that.bxFlowchart.addNode({type: 'LA', x: 5, y: 164}, true);
                that.bxFlowchartData.nodeIdMap.centerPillarId = that.bxFlowchart.addNode({
                    type: 'CENTER_PILLAR',
                    x: 190,
                    y: that.FLOWCHART_V_MARGIN,
                    height: that.getPillarHeight(that.bxFlowchartData.detailLength)
                }, true);

                that.bxFlowchart.addText({x: 64, y: 130, width: 72, text: bxMsg('online.start-trading-code'), style: 'fill: #565656;font-size: 12px;'}, true);
                that.bxFlowchart.addText({x: 55, y: 145, width: 90, text: that.mainFlowInfo.linkStartTrxCd, style: 'fill: #565656;font-size: 12px;'}, true);

                // 연동제어 표시
                if (that.mainFlowInfo.linkTrxTypeCd === 'C') {
                    that.bxFlowchart.addNode({type: 'LT', x: 93, y: 84}, true);
                }else{
                    that.bxFlowchart.addNode({type: 'NLT', x: 93, y: 84}, true);
                }

                // 맵핑/체크 표시
                that.bxFlowchart.addNode({type: that.mainFlowInfo.linkOutputCheckYn === 'Y' ? 'CONFIRM' : 'NCONFIRM', x: 52, y: 154}, true);
                that.bxFlowchart.addNode({type: that.mainFlowInfo.linkOutputMappingType === 'M' ? 'MAPPING' : 'NMAPPING', x: 118, y: 150, rotate: '180 15,15'}, true);

                // 디테일 노드 표시
                that.detailList.forEach(function(detailItem, idx) {
                    that.drawTrxContainer(detailItem, idx);
                });

                that.setFlowchartHeight(that.detailList.length);

                that.bxFlowchart.update();
            },

            drawTrxContainer: function (data, index) {
                var that = this;

                that.bxFlowchart.setNodeGroup(data.linkSeq, [
                    that.bxFlowchart.addNode({type: 'TRXL', x: 212, y: that.TRX_RIGHT_Y + (80 * index)}, true),
                    that.bxFlowchart.addNode({type: data.startYn === 'Y' ? 'STRXN' : 'TRXN', x: 392, y: that.TRX_RIGHT_Y+13 + (80 * index), extraParam: {trxCd: data.trxCd, linkSeq: data.linkSeq}}, true),
                    that.bxFlowchart.addNode({type: data.inputCheckYn === 'Y' ? 'CH' : 'NCH', x: 250, y: that.TRX_RIGHT_Y+13 + (80 * index), extraParam: {trxCd: data.trxCd, linkSeq: data.linkSeq}}, true),
                    that.bxFlowchart.addNode({type: 'I' + data.inputMappingType, x: 287, y: that.TRX_RIGHT_Y+13 + (80 * index), extraParam: {trxCd: data.trxCd, linkSeq: data.linkSeq}}, true),
                    that.bxFlowchart.addNode({type: 'O' + data.outputType, x: 287, y: that.TRX_RIGHT_Y+41 + (80 * index), extraParam: {trxCd: data.trxCd, linkSeq: data.linkSeq, startYn: data.startYn}}, true),
                    that.bxFlowchart.addNode({type: data.linkBefCheckYn=== 'Y' ? 'PRE' : 'NPRE', x: 324, y: that.TRX_RIGHT_Y+16 + (80 * index), extraParam: {trxCd: data.trxCd, linkSeq: data.linkSeq}}, true),
                    that.bxFlowchart.addNode({type: data.linkAftCheckYn === 'Y' ? 'POST' : 'NPOST', x: 324, y: that.TRX_RIGHT_Y+44 + (80 * index), extraParam: {trxCd: data.trxCd, linkSeq: data.linkSeq}}, true),
                    that.bxFlowchart.addNode({type: data.startYn === 'Y' ? 'S' + data.tranProcCd : data.tranProcCd, x: 520, y: that.TRX_RIGHT_Y+13 + (80 * index), extraParam: {trxCd: data.trxCd, linkSeq: data.linkSeq}}, true),
                    that.bxFlowchart.addNode({type: 'DRAG', x: 565, y: that.TRX_RIGHT_Y+1 + (80 * index), extraParam: {trxCd: data.trxCd, linkSeq: data.linkSeq}}, true),
                    that.bxFlowchart.addNode({type: 'DEL', x: 596, y: that.TRX_RIGHT_Y+33 + (80 * index), extraParam: {trxCd: data.trxCd, linkSeq: data.linkSeq}}, true)
                ]);

                var preStr = '';
                if(data.linkSeq.toString().length < 3){
                    for(var i = 0; i < 3 - data.linkSeq.toString().length; i ++ ) {preStr += '0';}
                }
                var linkSeqStr = preStr + data.linkSeq;

                that.bxFlowchart.setTextGroup(data.linkSeq, [
                    that.bxFlowchart.addText({x: 410, y: that.TRX_RIGHT_Y+38 + (80 * index), width: 100, text: bxMsg('online.link-trading-code') + linkSeqStr, style: data.startYn === 'Y' ? 'fill: #FFF;font-size: 12px;' : 'fill: #565656;font-size: 12px;'}, true),
                    that.bxFlowchart.addText({x: 410, y: that.TRX_RIGHT_Y+53 + (80 * index), width: 100, text: data.trxCd, style: data.startYn === 'Y' ? 'fill: #FFF;font-size: 12px;' : 'fill: #565656;font-size: 12px;'}, true)
                ]);
            },

            setFlowchartHeight: function (trxContainerCount) {
                var that = this;

                // wrapper height
                that.$linkFlowChart.height(that.FLOWCHART_V_MARGIN * 2 + this.getPillarHeight(trxContainerCount));

                // pillar height
                var centerPillar = that.bxFlowchart.getNodeById(that.bxFlowchartData.nodeIdMap.centerPillarId);
                centerPillar.height = that.getPillarHeight(trxContainerCount);
                that.bxFlowchartData.nodeIdMap.centerPillarId = that.bxFlowchart.setNodeById(centerPillar.id, centerPillar);

                that.bxFlowchart.update();

            },

            getPillarHeight: function (trxContainerCount) {
                return this.TRX_RIGHT_Y_PADDING_TO_PILLAR * 2 + (80 * trxContainerCount);
            },

            renderFlowDetail: function() {
                var that = this,
                    $detailList = [];

                that.detailList.forEach(function(data, idx) {
                    var $tpl = $(that.detailTpl({
                        trxCd: data.trxCd,
                        linkSeq: data.linkSeq
                    }));

                    $tpl.find('[data-form-param="inputMappingType"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0036']));
                    $tpl.find('[data-form-param="outputType"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0037']));
                    $tpl.find('[data-form-param="tranProcCd"]').html(commonUtil.getCommonCodeOptionTag(commonConfig.comCdList['BXMAD0035']));

                    commonUtil.makeFormFromParam($tpl, data);

                    // linkSeq 3자리, 빈공간 0붙이기
                    data.linkSeq =  data.linkSeq + '';

                    if(data.linkSeq.length < 3){
                        var linkSeqStr = '';
                        for(var i = 0; i < 3 - data.linkSeq.length; i ++ ) {linkSeqStr += '0';}
                    }
                    $tpl.find('[data-form-param="linkSeq"]').val(linkSeqStr + data.linkSeq);

                    $detailList.push($tpl);
                });

                that.$linkFlowChartDetail.html($('<div>').addClass('bw-accordion').html($detailList));

                // 연동 플로우 입력 매핑 정보 그리드
                that.detailGridList = {};
                that.detailGridData = {};
                that.detailList.forEach(function(data, idx) {
                    var sourceColumn = {text: 'Source', flex: 1, dataIndex: 'source', align: 'center'},
                        sourceData = [],
                        detailItem;

                    // Source에 기동 거래 코드 + 전 순번 의 연동 거래 코드 (출력 구분이 기본 출력, 출력 저장인 경우만)
                    sourceData.push({val: that.mainFlowInfo.linkStartTrxCd});
                    for(var i = 0; i < idx ; i++){
                        detailItem = that.detailList[i];

                        if(detailItem.outputType === 'S' || detailItem.outputType === 'B') {
                            sourceData.push({val: detailItem.trxCd});
                        }
                    }

                    sourceColumn.editor = {
                        xtype : 'combobox',
                        store : Ext.create('Ext.data.Store', {
                            fields: ['val'],
                            data: sourceData
                        }),
                        displayField: 'val',
                        valueField: 'val'
                    };

                    that.detailGridData[data.linkSeq] = data.inputMappingCtt;
                    that.detailGridList[data.linkSeq] = new ExtGrid({
                        header: {
                            button: [
                                {
                                    html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                    event: function() {
                                        var detailGrid;

                                        if(that.$el.attr('data-mode') === 'read') return;

                                        detailGrid = that.detailGridList[data.linkSeq];

                                        detailGrid.addData({type: 'R', inout: 'out'});
                                        detailGrid.update();

                                        that.detailList.forEach(function(detailItem) {
                                            if(data.linkSeq == detailItem.linkSeq){
                                                detailItem.inputMappingCtt = detailGrid.getAllData();
                                            }
                                        });
                                    }
                                },
                                {
                                    html: '<button type="button" class="bw-btn"><i class="fa fa-angle-up chr-c-blue fs-20" title="' + bxMsg('common.up') + '"></i></button>',
                                    event: function() {
                                        var detailGrid = that.detailGridList[data.linkSeq],
                                            selectedRow = detailGrid.getSelectedRecords(),
                                            selectedNbr,
                                            prevRow;

                                        if(selectedRow.length === 0){
                                            swal({type: 'warning', title: '', text: bxMsg('message.select-field-msg'), timer: commonUtil.timer(), showConfirmButton: false});
                                            return;
                                        }

                                        selectedNbr = detailGrid.getSelectedRowIdx();
                                        prevRow = detailGrid.getDataAt(selectedNbr-1);

                                        // 이전 로우가 없으면 리턴
                                        if(!prevRow) {
                                            return;
                                        }else{
                                            prevRow = $.extend({}, prevRow);

                                            detailGrid.removeAt(selectedNbr - 1);
                                            detailGrid.insertData(selectedNbr - 1, selectedRow[0].data);
                                            detailGrid.removeAt(selectedNbr);
                                            detailGrid.insertData(selectedNbr, prevRow);
                                            detailGrid.setSelectedRowIdx(selectedNbr-1);
                                        }
                                    }
                                },
                                {
                                    html: '<button type="button" class="bw-btn"><i class="fa fa-angle-down chr-c-blue fs-20" title="' + bxMsg('common.down') + '"></i></button>',
                                    event: function() {
                                        var detailGrid = that.detailGridList[data.linkSeq],
                                            selectedRow = detailGrid.getSelectedRecords(),
                                            selectedNbr,
                                            nextRow;

                                        if(selectedRow.length === 0){
                                            swal({type: 'warning', title: '', text: bxMsg('message.select-field-msg'), timer: commonUtil.timer(), showConfirmButton: false});
                                            return;
                                        }

                                        selectedNbr = detailGrid.getSelectedRowIdx();
                                        nextRow = detailGrid.getDataAt(selectedNbr+1);

                                        // 다음 로우가 없으면 리턴
                                        if(!nextRow) {
                                            return;
                                        }else{
                                            nextRow = $.extend({}, nextRow);

                                            detailGrid.removeAt(selectedNbr);
                                            detailGrid.insertData(selectedNbr, nextRow);
                                            detailGrid.removeAt(selectedNbr + 1);
                                            detailGrid.insertData(selectedNbr + 1, selectedRow[0].data);
                                            detailGrid.setSelectedRowIdx(selectedNbr+1);
                                        }
                                    }
                                }
                            ]
                        },
                        requestParam: {
                            obj: commonUtil.getBxmReqData('LinkFlowMainService', 'getMainFlowDetails', 'LinkFlowMainOMM'),
                            key: 'LinkFlowMainOMM'
                        },
                        responseParam: {
                            objKey: 'LinkFlowMainDetailOMM',
                            key: 'mainFlowInfo'
                        },
                        clr: 'grid-row-span',
                        pageCountDefaultVal: 5,
                        fields: ['source', 'inout', 'type', 'map'],
                        columns: [
                            sourceColumn,
                            {
                                text: 'InOut', flex: 1, dataIndex: 'inout', align: 'center',
                                editor: {
                                    xtype : 'combobox',
                                    store : Ext.create('Ext.data.Store', {
                                        fields: ['val'],
                                        data: [
                                            {val: 'out'},
                                            {val: 'in'}
                                        ]
                                    }),
                                    displayField: 'val',
                                    valueField: 'val'
                                }
                            },
                            {
                                text: 'Target', flex: 1, align: 'center',
                                renderer: function() {
                                	return data.trxCd + '_in';
                                }
//                                renderer: function (value, meta, record, rowIndex, colIndex, store) {
//                                    var first = !rowIndex ,
//                                        last = rowIndex >= store.getCount() - 1;
//
//                                    !meta.css && (meta.css = '');
//                                    meta.css += ' row-span' + (first ? ' row-span-first' : '') +  (last ? ' row-span-last' : '');
//
//                                    return first ? data.trxCd + '_in' : '';
//                                }
                            },
                            {
                                text: 'Type', flex: 1, dataIndex: 'type', align: 'center',
                                editor : {
                                    xtype : 'combobox',
                                    store : Ext.create('Ext.data.Store', {
                                        fields: ['id', 'val'],
                                        data: [
                                            {id: 'R', val: 'RULE'},
                                            {id: 'A', val: 'AUTO'}
                                        ]
                                    }),
                                    displayField: 'val',
                                    valueField: 'id',
                                    listeners: {
                                        change: function(combo, newValue) {
                                            if(newValue === 'A'){
                                                var record = that.detailGridList[data.linkSeq].getSelectedRecords()[0];

                                                record.data.map = '';
                                                record.commit();
                                            }
                                        }
                                    }
                                },
                                renderer: function(value) {
                                    if(value === 'R') return 'RULE';
                                    else if(value === 'A') return 'AUTO';
                                }
                            },
                            {
                                text: 'MAP (ID)', flex: 1, dataIndex: 'map', align: 'center',
                                editor : {
                                    xtype : 'textfield',
                                    allowBlank :false
                                }
                            },
                            {
                                text: bxMsg('common.del'),
                                renderer: function (value, p, record, idx) {
                                    return Ext.String.format(
                                        '<button type="button" class="bw-btn del-input-mapping-btn" data-idx="{0}" data-link-seq="{1}"> ' +
                                        '<i class="bw-icon i-20 i-func-trash"></i>' +
                                        '</button>',
                                        idx,
                                        data.linkSeq
                                    );
                                },
                                sortable: false,
                                menuDisabled: true,
                                align: 'center',
                                width: 50
                            }
                        ],
                        gridConfig: {
                            plugins : [
                                Ext.create ('Ext.grid.plugin.CellEditing', {
                                    clicksToEdit : 1,
                                    listeners: {
                                        beforeedit: function( editor, e ) {
                                            if(that.$el.attr('data-mode') === 'read') return false;

                                            if(e.field === 'inout' && e.record.get('source') !== that.mainFlowInfo.linkStartTrxCd) {
                                                return false;
                                            }

                                            if(e.field === 'source'){
                                                var sourceData = [],
                                                    detailItem;

                                                // Source에 기동 거래 코드 + 전 순번 의 연동 거래 코드 (출력 구분이 기본 출력, 출력 저장인 경우만)
                                                sourceData.push({val: that.mainFlowInfo.linkStartTrxCd});
                                                for(var i = 0; i < idx ; i++){
                                                    detailItem = that.detailList[i];

                                                    if(detailItem.outputType === 'S' || detailItem.outputType === 'B') {
                                                        sourceData.push({val: detailItem.trxCd});
                                                    }
                                                }

                                                that.detailGridList[data.linkSeq].grid.columns[0].getEditor().getStore().loadData(sourceData);
                                            }

                                            if(e.field === 'map'){
                                                var record = that.detailGridList[data.linkSeq].getSelectedRecords()[0];

                                                return record.data.type !== 'A';
                                            }

                                        },
                                        edit: function ( editor, e ) {
                                            if(e.field === 'source' && e.record.get('source') !== that.mainFlowInfo.linkStartTrxCd) {
                                                e.record.set('inout', 'out');
                                            }
                                        }
                                    }
                                })
                            ]
                        }
                    });

                    that.detailGridList[data.linkSeq].setData(that.detailGridData[data.linkSeq] ?  that.detailGridData[data.linkSeq] : []);
                });

                commonUtil.setExpandAccordion(that.$linkFlowChartDetail.find('.bw-accordion'), {
                    slideDownFn: function(param) {
                        var linkSeq = parseInt(param.currContent.find('[data-form-param="linkSeq"]').val()),
                            $gridWrap = that.$linkFlowChartDetail.find('.accordion-body[data-link-seq="' + linkSeq + '"] .link-in-mapping-grid');

                        if($gridWrap.find('.bx-ext-grid').length === 0) {
                            $gridWrap.html(that.detailGridList[linkSeq].render());
                        }else{
                            that.detailGridList[linkSeq].resizeGrid();
                        }
                    }
                });
                that.$linkFlowChartDetail.find('[data-form-param="inputMappingType"]').trigger('change');
            },

            delLinkFlow: function (e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        // 요청 객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'LinkFlowMainService', 'removeMainFlow', 'LinkFlowMainInOMM',
                            {
                                linkMainCd: $target.attr('data-id')
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 200){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                    // 그리드 리로드
                                    that.linkFlowGrid.reloadData();

                                    // 상세 초기화
                                    that.$linkFlowDetailTitle.text('');
                                    that.bxFlowchart.reset();
                                    that.bxFlowchart.update();
                                    that.bxFlowchart.resetZoom(0, 0, 1, 0);
                                    that.$linkFlowChartMain.find('[data-form-param]').val('');
                                    that.linkOutMappingGrid.resetData();
                                    that.$linkFlowChartDetail.html('');

                                    // 데이터 초기화
                                    that.bxFlowchartData = {nodeIdMap: null, detailLength: 0};
                                    that.detailGridList = {};
                                    that.detailGridData = {};
                                    that.mainFlowInfo = {};
                                    that.detailList = [];
                                }else if(code === 205) {
                                    swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    }
                );
            },

            setReadMode: function() {
                var that = this;

                // FlowChart
                that.$el.attr('data-mode', 'read');
                that.bxFlowchart.setMode('read');

                // Main
                that.$linkFlowChartMain.find('[data-form-param]').prop('disabled', true);

                // Detail
                that.$linkFlowChartDetail.find('[data-form-param]').prop('disabled', true);

                that.$el.find('[data-mode]').hide();
                that.$el.find('[data-mode="read"]').show();
            },

            setEditMode: function() {
                var that = this;

                // FlowChart
                that.$el.attr('data-mode', 'edit');
                that.bxFlowchart.setMode('edit');

                // Main
                that.$linkFlowChartMain.find('[data-form-param]').prop('disabled', false);
                that.$linkFlowChartMain.find('[data-pk]').prop('disabled', true);

                // Detail
                that.$linkFlowChartDetail.find('[data-form-param]').prop('disabled', false);
                that.$linkFlowChartDetail.find('[data-form-param="linkSeq"]').prop('disabled', true);
                that.$linkFlowChartDetail.find('[data-form-param="trxCd"]').prop('disabled', true);
                that.$linkFlowChartDetail.find('[data-form-param="trxNm"]').prop('disabled', true);
                that.$linkFlowChartDetail.find('[data-form-param="startYn"]').prop('disabled', true);

                that.$linkFlowChartDetail.find('[data-form-param="inputCheckYn"]').trigger('change');
                that.$linkFlowChartDetail.find('[data-form-param="linkAftCheckYn"]').trigger('change');
                that.$linkFlowChartDetail.find('[data-form-param="startYn"]').trigger('change');

                that.$linkFlowChartDetail.find('.no-function-option').prop('disabled', false); // 기능 없는 옵션 (BC POC용)

                that.$el.find('[data-mode]').hide();
                that.$el.find('[data-mode="edit"]').show();
            },

            setEditModeLinkFlow: function() {
                var that = this;

                if(!that.mainFlowInfo.linkMainCd) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                that.bxFlowchartData.nodeIdMap.addId = that.bxFlowchart.addNode({type: 'ADD', x: 212, y: that.TRX_RIGHT_Y + (80 * (that.bxFlowchartData.detailLength))});

                that.setFlowchartHeight(that.bxFlowchartData.detailLength+1);
                that.setEditMode();
            },

            saveLinkFlow: function() {
                var that = this,
                    requestParam,
                    param = {},
                    $askFormItems,
                    detailCheck = false,
                    validateMsg = false;

                // 메인 정보 필수 값 확인
                param.mainInfo = commonUtil.makeParamFromForm(that.$linkFlowChartMain);
                $askFormItems = that.$linkFlowChartMain.find('.asterisk');
                for(var i = 0 ; i < $askFormItems.length; i++){
                    var $askFormItem = $($askFormItems[i]),
                        key = $askFormItem.find('[data-form-param]').attr('data-form-param'),
                        msg = $askFormItem.find('.bw-label').text();

                    if(!param.mainInfo[key]) {
                        swal({type: 'warning', title: '', text: msg + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }
                }

                // 츨력 맵핑 정보 MAP 값 확인
                if(param.mainInfo.linkOutputMappingType === 'M'){
                    param.mainInfo.linkOutputMappingCtt = that.linkOutMappingGrid.getAllData();
                    param.mainInfo.linkOutputMappingCtt.forEach(function(dataItem) {
                        if(dataItem.type === 'R' && !dataItem.map){
                            validateMsg = bxMsg('online.input-mapping-msg');
                        }
                    });

                    if(validateMsg){
                        swal({type: 'warning', title: '', text: validateMsg, timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        return;
                    }
                }

                param.detailList = [];

                that.$linkFlowChartDetail.find('.accordion-body') && that.$linkFlowChartDetail.find('.accordion-body').each(function(idx, el) {
                    var data = commonUtil.makeParamFromForm($(el));

                    // 상세 입력 맵핑 정보 MAP 값 확인
                    if(data.inputMappingType === 'M'){
                        data.inputMappingCtt = that.detailGridList[parseInt(data.linkSeq)].getAllData();
                        data.inputMappingCtt.forEach(function(dataItem) {
                            if(dataItem.type === 'R' && !dataItem.map){
                                validateMsg = $(el).prev().text() + ' - ' + bxMsg('online.input-mapping-msg');
                            }
                        });

                        if(validateMsg){
                            swal({type: 'warning', title: '', text: validateMsg, timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            return;
                        }
                    }

                    param.detailList.push(data);

                    // 상세 정보 필수 값 확인
                    $askFormItems = $(el).find('.asterisk');

                    for(var i = 0 ; i < $askFormItems.length; i++){
                        var $askFormItem = $($askFormItems[i]),
                            key = $askFormItem.find('[data-form-param]').attr('data-form-param'),
                            msg = $askFormItem.find('.bw-label').text().trim();

                        if(!data[key]) {
                            detailCheck = $askFormItem.parents('.accordion-body').prev().text() + ' - ' + msg;
                        }
                    }
                });

                if(detailCheck) {
                    swal({type: 'warning', title: '', text: detailCheck + bxMsg('common.type-value-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                if(validateMsg){
                    swal({type: 'warning', title: '', text: validateMsg, timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                // 기동 여부 체크
                validateMsg = 0;
                param.detailList.forEach(function(detailItem) {
                    if(detailItem.startYn === 'N') {
                        validateMsg += 1;
                    }
                });

                if(validateMsg === param.detailList.length){
                    swal({type: 'warning', title: '', text: bxMsg('online.add-start-trading-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }


                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'LinkFlowMainService', 'editMainFlowDetails', 'MainDetailInOMM',
                    param
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.save-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                            // 그리드 리로드
                            that.loadLinkFlowList();
                            that.loadLinkFlow({linkMainCd: that.mainFlowInfo.linkMainCd});

                        }else if(code === 205) {
                            swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            },

            cancelLinkFlow: function() {
            	var linkMainCd;
            	linkMainCd = this.$linkFlowChartMain.find('[data-form-param="linkMainCd"]').val();
            	this.loadLinkFlow({linkMainCd: linkMainCd});
            	this.setReadMode();
            },

            checkLinkOutputFqn: function(e) {
                var $target = $(e.currentTarget),
                    $checkTarget = this.$linkFlowChartMain.find('[data-form-param="linkOutputFqn"]');

                if($target.val() === 'Y') {
                    $checkTarget.parent().addClass('asterisk');
                    $checkTarget.attr('disabled', false);
                }else{
                    $checkTarget.parent().removeClass('asterisk');
                    $checkTarget.val('').attr('disabled', true);
                }
            },

            checkInputCheckCtt: function(e) {
                var $target = $(e.currentTarget),
                    $checkTarget = $target.parents('.accordion-body').find('[data-form-param="inputCheckCtt"]');

                if($target.val() === 'Y') {
                    $checkTarget.parent().addClass('asterisk');
                    $checkTarget.attr('disabled', false);
                }else{
                    $checkTarget.parent().removeClass('asterisk');
                    $checkTarget.val('').attr('disabled', true);
                }
            },

            checkLinkCheckFqn: function(e) {
                var $target = $(e.currentTarget),
                    $form = $target.parents('.accordion-body'),
                    $checkTarget = $form.find('[data-form-param="linkCheckFqn"]');

                if($form.find('[data-form-param="linkBefCheckYn"]').val() === 'N' && $form.find('[data-form-param="linkAftCheckYn"]').val() === 'N' ) {
                    $checkTarget.parent().removeClass('asterisk');
                    $checkTarget.val('').attr('disabled', true);
                }else{
                    $checkTarget.parent().addClass('asterisk');
                    $checkTarget.attr('disabled', false);
                }
            },

            checkOutputType: function(e) {
                var $target = $(e.currentTarget),
                    $checkTarget = $target.parents('.accordion-body').find('[data-form-param="outputType"]');

                if($target.val() === 'Y') {
//                    $checkTarget.val('S').attr('disabled', true);
                    $checkTarget.val('B').attr('disabled', true); // 기본 출력
                }else{
                	$checkTarget.find('option[value="B"]').remove(); // cause bc poc modified
                	$checkTarget.attr('disabled', false);
                }
            },

            toggleLinkOutputMappingGrid: function(e) {
                var $target = $(e.currentTarget);

                if($target.val() === 'M'){
                    this.$linkFlowChartMain.find('.link-out-mapping-grid-wrap').show();
                    this.linkOutMappingGrid && this.linkOutMappingGrid.resizeGrid();
                }else{
                    this.$linkFlowChartMain.find('.link-out-mapping-grid-wrap').hide();
                }
            },

            toggleInputMappingGrid: function(e) {
                var $target = $(e.currentTarget),
                    $grid = $target.parents('.accordion-body').find('.link-in-mapping-grid-wrap'),
                    linkSeq = parseInt($target.parents('.accordion-body').find('[data-form-param="linkSeq"]').val());

                if($target.val() === 'M'){
                    $grid.show();
                    this.detailGridList[linkSeq] && this.detailGridList[linkSeq].resizeGrid();
                }else{
                    $grid.hide();
                }
            },

            removeMappingOutputGridRow: function(e) {
                if(this.$el.attr('data-mode') === 'read') return;

                this.linkOutMappingGrid.removeAt(parseInt($(e.currentTarget).attr('data-idx')));
                this.linkOutMappingGrid.update();
            },

            removeMappingInputGridRow: function(e) {
                var $target = $(e.currentTarget),
                    detailGrid = this.detailGridList[$target.attr('data-link-seq')];

                if(this.$el.attr('data-mode') === 'read') return;

                detailGrid.removeAt(parseInt($target.attr('data-idx')));
                detailGrid.update();

                this.detailList.forEach(function(detailItem) {
                    if($target.attr('data-link-seq') == detailItem.linkSeq){
                        detailItem.inputMappingCtt = detailGrid.getAllData();
                    }
                });
            },

            saveDetailData: function(e) {
                var $target = $(e.currentTarget),
                    $form = $target.parents('.accordion-body'),
                    linkSeq = $form.attr('data-link-seq');

                this.detailList.forEach(function(detailItem) {
                    if(linkSeq == detailItem.linkSeq){
                        detailItem[$target.attr('data-form-param')] = $target.val();
                    }
                });
            }

        });

        return LinkFlowManagementView;
    }
);