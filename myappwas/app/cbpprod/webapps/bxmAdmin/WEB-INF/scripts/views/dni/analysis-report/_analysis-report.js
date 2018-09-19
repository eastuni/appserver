define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-tree-grid',
        'common/component/loading-bar/_loading-bar',
        'text!views/dni/analysis-report/_analysis-report-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtTreeGrid,
        LoadingBar,
        tpl
    ) {
        return Backbone.View.extend({
            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .resource-reset-search-btn': 'resourceResetSearch',
                'click .resource-search-btn': 'loadResourceList',
                'enter-component .resource-search-wrap input': 'loadResourceList',

                'click .all-reset-search-btn': 'allResetSearch',
                'click .all-search-btn': 'loadAllList',
                'enter-component .all-search-wrap input': 'loadAllList',

                // 'click .first-tab': 'clickFirstTab',
                'click .last-tab': 'clickLastTab'
            },

            activeTab: 'first-tab',
            resourceSearchParams: null,
            allSearchParams: null,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['resourceLoadingBar'] = new LoadingBar();
                that.subViews['allLoadingBar'] = new LoadingBar();

                // Set Grid
                that.resourceGrid = new ExtTreeGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('AnalyzeReportService', 'searchResByTableColumn', 'DBTableTreeOMM'),
                        key: 'DBTableTreeOMM'
                    },
                    responseParam: {
                        objKey: 'ReportResourceGridOMM',
                        key: 'reportResList'
                    },
                    header: {
                        content: [
                            '<h3 class="bw-desc">' + bxMsg('dni.max-20-msg') + '</h3>'
                        ],
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-xls" title="' + bxMsg('common.excel-download') + '"></i></button>',
                                event: function() {
                                    swal({
                                            title: '', text: bxMsg('common.excel-download-msg'), showCancelButton: true
                                        },
                                        function(){
                                            // 요청 객체 생성
                                            var requestParam = commonUtil.getBxmReqData(
                                                'AnalyzeReportService', 'exportExcelResList', 'DBTableTreeOMM',
                                                that.resourceSearchParams
                                            );

                                            // Ajax 요청
                                            commonUtil.requestBxmAjax(requestParam, {
                                                success: function(response) {
                                                    var filePath = response.ExcelExportOMM.filePath;

                                                    commonUtil.downloadFile('fileEndpoint/download', {filePath: filePath});
                                                }
                                            });
                                        }
                                    );
                                }
                            }
                        ],
                        pageCountDefaultVal: 20
                    },
                    gridToggle: false,

                    fields: ['methodNm', 'sqlTypeCd', 'bxmAppId', 'classNm', 'inputType', 'outputType'],
                    columns: [
                        {
                            xtype: 'treecolumn',
                            text: bxMsg('dni.method-nm'), flex: 3, dataIndex: 'methodNm', style: 'text-align: center;', tdCls: 'a-left lv1',
                            renderer: function (value, record) {
                                switch (record.record.raw.methodExecTypeCd) {
                                    case '1':
                                        return '<i class="bw-sign s-so">SO</i>' + value;
                                    case '2':
                                        return '<i class="bw-sign s-bo">BO</i>' + value;
                                    case '3':
                                        return '<i class="bw-sign s-db">DB</i>' + value;
                                    case '4':
                                        return '<i class="bw-sign s-omm">OMM</i>' + value;
                                    default:
                                        return '<i class="bw-sign s-etc">ETC</i>' + value;
                                }
                            }
                        },
                        {
                            text: bxMsg('dni.crud'), with: 100, dataIndex: 'sqlTypeCd', align: 'center',
                            renderer: function (value, record) {
                                if (!value) {
                                    return record.record.raw.isRecursive ? '<i class="bw-sign s-db" style="width: 60px;">RECURSIVE</i>' : '';
                                }

                                switch (value) {
                                    case '0':
                                        return '<i class="bw-sign s-create null">C</i>\
                                            <i class="bw-sign s-read">R</i>\
                                            <i class="bw-sign s-update null">U</i>\
                                            <i class="bw-sign s-delete null">D</i>';
                                    case '1':
                                        return '<i class="bw-sign s-create">C</i>\
                                            <i class="bw-sign s-read null">R</i>\
                                            <i class="bw-sign s-update null">U</i>\
                                            <i class="bw-sign s-delete null">D</i>';
                                    case '2':
                                        return '<i class="bw-sign s-create null">C</i>\
                                            <i class="bw-sign s-read null">R</i>\
                                            <i class="bw-sign s-update">U</i>\
                                            <i class="bw-sign s-delete null">D</i>';
                                    case '3':
                                        return '<i class="bw-sign s-create null">C</i>\
                                            <i class="bw-sign s-read null">R</i>\
                                            <i class="bw-sign s-update null">U</i>\
                                            <i class="bw-sign s-delete">D</i>';
                                    default:
                                        return '<i class="bw-sign s-create null">C</i>\
                                            <i class="bw-sign s-read null">R</i>\
                                            <i class="bw-sign s-update null">U</i>\
                                            <i class="bw-sign s-delete null">D</i>';
                                }
                            }
                        },
                        {text: bxMsg('dni.bxm-app-id'), flex: 2.5, dataIndex: 'bxmAppId', align: 'center'},
                        {
                            text: bxMsg('dni.class-nm'), flex: 4, dataIndex: 'classNm', align: 'center',
                            renderer: function (value, record) {
                                return record.record.raw.pkgNm + '.' + value;
                            }
                        },
                        {text: bxMsg('dni.input-type'), flex: 2.5, dataIndex: 'inputType', align: 'center'},
                        {text: bxMsg('dni.output-type'), flex: 2.5, dataIndex: 'outputType', align: 'center'}
                    ]
                });

                that.allGrid = new ExtTreeGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('AnalyzeReportService', 'searchDbByResource', 'ReportDbSearchConditionOMM'),
                        key: 'ReportDbSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'ReportDbDataListOMM',
                        key: 'tableList'
                    },
                    header: {
                        content: [
                            '<h3 class="bw-desc">' + bxMsg('dni.max-20-msg') + '</h3>'
                        ],
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-xls" title="' + bxMsg('common.excel-download') + '"></i></button>',
                                event: function() {
                                    swal({
                                            title: '', text: bxMsg('common.excel-download-msg'), showCancelButton: true
                                        },
                                        function(){
                                            // 요청 객체 생성
                                            var requestParam = commonUtil.getBxmReqData(
                                                'AnalyzeReportService', 'exportExcelDbList', 'ReportDbSearchConditionOMM',
                                                that.allSearchParams
                                            );

                                            // Ajax 요청
                                            commonUtil.requestBxmAjax(requestParam, {
                                                success: function(response) {
                                                    var filePath = response.ExcelExportOMM.filePath;

                                                    commonUtil.downloadFile('fileEndpoint/download', {filePath: filePath});
                                                }
                                            });
                                        }
                                    );
                                }
                            }
                        ],
                        pageCountDefaultVal: 20
                    },
                    gridToggle: false,

                    fields: ['columnNm', 'sqlTypeCd', 'dataType', 'comments'],
                    columns: [
                        {
                            xtype: 'treecolumn',
                            text: bxMsg('dni.item-nm'), flex: 3, dataIndex: 'columnNm', style: 'text-align: center;', tdCls: 'a-left lv1',
                            renderer: function (value, record) {
                                if (!value) {
                                    return '<i class="bw-icon i-15 i-tree-table"></i>' + record.record.raw.tableNm;
                                } else {
                                    return '<i class="bw-icon i-15 i-tree-column"></i>' + value;
                                }
                            }
                        },
                        {
                            text: bxMsg('dni.crud'), with: 100, dataIndex: 'sqlTypeCd', align: 'center',
                            renderer: function (value, record) {
                                if (record.record.raw.columnNm) {
                                    return '<i class="bw-sign s-create ' + (value.indexOf('1') !== -1 ? '' : 'null') + '">C</i>\
                                            <i class="bw-sign s-read ' + (value.indexOf('0') !== -1 ? '' : 'null') + '">R</i>\
                                            <i class="bw-sign s-update ' + (value.indexOf('2') !== -1 ? '' : 'null') + '">U</i>\
                                            <i class="bw-sign s-delete ' + (value.indexOf('3') !== -1 ? '' : 'null') + '">D</i>';

                                } else {
                                    var crud = {},
                                        children = record.record.childNodes;

                                    children && children.length && children.forEach(function (item) {
                                        item.raw.sqlTypeCd.forEach(function (type) {
                                            crud[type] = true;
                                        });
                                    });

                                    return '<i class="bw-sign s-create ' + (crud[1] ? '' : 'null') + '">C</i>\
                                            <i class="bw-sign s-read ' + (crud[0] ? '' : 'null') + '">R</i>\
                                            <i class="bw-sign s-update ' + (crud[2] ? '' : 'null') + '">U</i>\
                                            <i class="bw-sign s-delete ' + (crud[3] ? '' : 'null') + '">D</i>';
                                }
                            }
                        },
                        {
                            text: bxMsg('dni.data-type'), flex: 2, dataIndex: 'dataType', align: 'center',
                            renderer: function (value, record) {
                                if (record.record.raw.comments) value = value + '(' + record.record.raw.dataLength + ' bytes)';
                                return value;
                            }
                        },
                        {text: bxMsg('dni.description'), flex: 3, dataIndex: 'comments', style: 'text-align: center;'}
                    ]
                });


                // Dom Element Cache
                that.$resouceSearchWrap = that.$el.find('.resource-search-wrap');
                that.$allSearchWrap = that.$el.find('.all-search-wrap');
                that.$resourceGridWrap = that.$el.find('.resource-grid-wrap');
                that.$allGridWrap = that.$el.find('.all-grid-wrap');

                // tab menu 전환 기능
                that.$el.find(".tab-title li").click(function () {
                    that.$el.find(".tab-title li").removeClass("on-tab");
                    $(this).addClass("on-tab");
                    that.$el.find(".tabs").hide();
                    that.activeTab = $(this).attr("rel");
                    that.$el.find("#analysis-report-" + that.activeTab).show();
                });
            },

            render: function() {
                var that = this;

                that.$resourceGridWrap.html(that.resourceGrid.render());
                that.$resourceGridWrap.append(that.subViews['resourceLoadingBar'].render());

                return that.$el;
            },

            resourceResetSearch: function() {
                this.$resouceSearchWrap.find('[data-form-param]').val('');
            },

            allResetSearch: function() {
                this.$allSearchWrap.find('[data-form-param]').val('');
            },

            loadResourceList: function () {
                var that = this,
                    params = commonUtil.makeParamFromForm(that.$resouceSearchWrap);

                if(!commonUtil.doesObjectHasValues(params)) {
                    swal({type: 'warning', title: '', text: bxMsg('common.input-empty-error'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                that.resourceGrid.loadData(params, function () {
                    that.resourceSearchParams = params;
                    that.resourceGrid.expandAllTreeNode();
                });
            },

            loadAllList: function () {
                var that = this,
                    params = commonUtil.makeParamFromForm(that.$allSearchWrap);

                if(!commonUtil.doesObjectHasValues(params)) {
                    swal({type: 'warning', title: '', text: bxMsg('common.input-empty-error'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                that.allGrid.loadData(params, function () {
                    that.allSearchParams = params;
                    that.allGrid.expandAllTreeNode();
                });
            },

            clickFirstTab: function () {
                if (!this.resourceGrid.getAllData().length) this.loadResourceList();
            },

            clickLastTab: function () {
                var that = this;

                if (!that.allGridRendered) {
                    that.$allGridWrap.html(that.allGrid.render(function () {
                        that.allGridRendered = true;
                    }));
                    that.$allGridWrap.append(that.subViews['allLoadingBar'].render());
                }

                // if (!this.allGrid.getAllData().length) this.loadAllList();
            }
        });
    }
);
