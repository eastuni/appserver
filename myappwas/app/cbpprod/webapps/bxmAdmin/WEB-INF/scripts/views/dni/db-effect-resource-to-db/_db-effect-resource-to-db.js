define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'text!views/dni/db-effect-resource-to-db/_db-effect-resource-to-db-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        tpl
    ) {
        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'searchApplicationTree',
                'enter-component .bxm-search-wrap input': 'searchApplicationTree',

                'change select[data-form-param="bxmAppId"]': 'loadApplicationTree',
                'click .tree-item': 'loadApplicationTree',
                'click .class-item': 'loadSqlList',
                'click .check-btn': 'moveToCallerDetail',

                'click .first-tab': 'loadTableList',
                'click .last-tab': 'loadSqlQuery'

            },

            bxmAppId: null,
            pkgNm: null,
            classNm: null,
            sqlId: null,
            activeTab: 'first-tab',

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['treeLoadingBar'] = new LoadingBar();
                that.subViews['sqlLoadingBar'] = new LoadingBar();

                // Set Grid
                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('DBDependencyService', 'getSqlList', 'ResMethodInOMM'),
                        key: 'ResMethodInOMM'
                    },
                    responseParam: {
                        objKey: 'SqlListOMM',
                        key: 'sqlList'
                    },
                    header: {
                        content: [
                            '<h3 class="bw-desc d-block bxm-grid-title"></h3>'
                        ]
                    },
                    gridToggle: false,

                    fields: ['sqlId', 'inputType', 'outputType',  'execTypeCd', 'isExecuted'],
                    columns: [
                        {
                            text: bxMsg('dni.method-nm'), flex: 3, dataIndex: 'sqlId', style: 'text-align: center;', tdCls: 'a-left lv1',
                            renderer: function (value, record) {
                                switch (record.record.raw.execTypeCd) {
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
                        {text: bxMsg('dni.input-type'), flex: 3, dataIndex: 'inputType', align: 'center'},
                        {text: bxMsg('dni.output-type'), flex: 3, dataIndex: 'outputType', align: 'center'},
                        {
                            text: bxMsg('dni.dbio-analysis-yn'), flex: 1.2, dataIndex: 'isExecuted', align: 'center',
                            renderer: function (value) {
                                return value ? '<i class="fa fa-check-circle chr-c-green"></i>'
                                    : '<i class="fa fa-circle chr-c-orange"></i>';
                            }
                        },
                        {
                            text: bxMsg('dni.caller-check'),
                            renderer: function (value, p, record) {
                                return '<button type="button" class="bw-btn bw-btn-txt check-btn" data-sql-id="' + record.get('sqlId') + '">' + bxMsg('common.check') + '</button>';
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            tdCls: 'btn',
                            flex: 1.5
                        }
                    ],
                    listeners: {
                        select: function(_this, record) {
                            that.sqlId = record.get('sqlId');
                            that.loadSqlDetail();
                        }
                    }
                });

                that.tableGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('DBDependencyService', 'getTableList', 'TableInfoInOMM'),
                        key: 'TableInfoInOMM'
                    },
                    responseParam: {
                        objKey: 'TableListOMM',
                        key: 'tableList'
                    },
                    header: {},
                    gridToggle: false,

                    fields: ['tableNm', 'sqlTypeCd'],
                    columns: [
                        {
                            text: bxMsg('dni.table-nm'), flex: 1, dataIndex: 'tableNm', style: 'text-align: center;', tdCls: 'a-left lv1',
                            renderer: function (value, record) {
                                if (record.record.raw.comments) value = value + '(' + record.record.raw.comments + ')';
                                return '<i class="bw-icon i-15 i-tree-table"></i>' + value;
                            }
                        },
                        {
                            text: bxMsg('dni.crud'), width: 100, dataIndex: 'sqlTypeCd', align: 'center',
                            renderer: function (value) {
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
                        }
                    ],
                    listeners: {
                        select : function(_this, record) {
                            that.tableNm = record.get('tableNm');
                            that.loadColumnList();
                        }
                    }
                });

                that.columnGrid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('DBDependencyService', 'getColumnList', 'TableInfoInOMM'),
                        key: 'TableInfoInOMM'
                    },
                    responseParam: {
                        objKey: 'ColumnListOMM',
                        key: 'columnList'
                    },
                    header: {},
                    gridToggle: false,

                    fields: ['columnNm', 'isUsed'],
                    columns: [
                        {
                            text: bxMsg('dni.column-nm'), flex: 4, dataIndex: 'columnNm', style: 'text-align: center;', tdCls: 'a-left lv1',
                            renderer: function (value, record) {
                                if (record.record.raw.comments) value = value + '(' + record.record.raw.comments + ')';
                                return '<i class="bw-icon i-15 i-tree-column"></i>' + value;
                            }
                        },
                        {
                            text: bxMsg('dni.yn'), flex: 1, dataIndex: 'isUsed', align: 'center',
                            renderer: function (value) {
                                return value ? '<i class="fa fa-check-circle chr-c-green"></i>'
                                    : '<i class="fa fa-circle chr-c-orange"></i>';
                            }
                        }
                    ]
                });

                // Dom Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$treeWrap = that.$el.find('.bxm-tree-wrap');
                that.$gridWrap = that.$el.find('.bxm-grid-wrap');
                that.$tableGridWrap = that.$el.find('.table-grid-wrap');
                that.$columnGridWrap = that.$el.find('.column-grid-wrap');
                that.$sqlWrap = that.$el.find('.sql-wrap');
                that.$sqlContent = that.$sqlWrap.find('.sql-content');

                // tab menu 전환 기능
                that.$el.find(".tab-title li").click(function () {
                    that.$el.find(".tab-title li").removeClass("on-tab");
                    $(this).addClass("on-tab");
                    that.$el.find(".tabs").hide();
                    that.activeTab = $(this).attr("rel");
                    that.$el.find("#db-effect-resource-to-db-" + that.activeTab).show();
                });
            },

            render: function() {
                var that = this;

                that.loadApplicationList();
                that.$gridWrap.html(that.grid.render(function () {
                    that.$gridTitle = that.$el.find('.bxm-grid-title');
                }));
                that.$tableGridWrap.html(that.tableGrid.render());
                that.$columnGridWrap.html(that.columnGrid.render());
                that.$treeWrap.append(that.subViews['treeLoadingBar'].render());
                that.$sqlWrap.append(that.subViews['sqlLoadingBar'].render());

                return that.$el;
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param="keyword"]').val('');
            },

            loadApplicationList: function () {
                var that = this;

                // Ajax 요청
                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('ResourceAnalyzeService', 'getAppList', 'EmptyOMM'), {
                    success: function(response) {
                        that.$searchWrap.find('select[data-form-param="bxmAppId"]')
                            .html(commonUtil.getCommonCodeOptionTag(response.ResAppListOMM.appList, true, bxMsg('dni.application-select')));
                    }
                });
            },

            searchApplicationTree: function () {
                var that = this,
                    $target = that.$treeWrap,
                    formParams = commonUtil.makeParamFromForm(that.$searchWrap),
                    operation,
                    params;
                if (!formParams.bxmAppId) {
                    swal({type: 'warning', title: '', text: bxMsg('dni.app-not-select-warning'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }
                if (!formParams.keyword) {
                    that.loadApplicationTree();
                    return;
                }

                if (formParams.searchType === 'package') {
                    operation = 'searchPackage';
                    params = {
                        bxmAppId: that.bxmAppId = formParams.bxmAppId,
                        pkgNm: formParams.keyword,
                        onlyDbio: true
                    }
                } else {
                    operation = 'searchClass';
                    params = {
                        bxmAppId: that.bxmAppId = formParams.bxmAppId,
                        classNm: formParams.keyword,
                        onlyDbio: true
                    }
                }

                // Ajax 요청
                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'ResourceAnalyzeService', operation, 'ResTreeListInOMM',
                    params
                ), {
                    beforeSend: function() {
                        that.subViews['treeLoadingBar'].show();
                    },
                    success: function(response) {
                        $target.html(renderRecursiveTree(response.ResSearchListOMM.packageList));
                    },
                    complete: function() {
                        that.subViews['treeLoadingBar'].hide();
                    }
                });

                function renderRecursiveTree(itemArray, pkgNm) {
                    var target = [];
                    itemArray && itemArray.forEach(function(item) {
                        if (item.packageNm) {
                            var packageNm = item.packageNm,
                                fullPackageNm = pkgNm ? pkgNm + '.' + packageNm : packageNm;
                            target.push(
                                '<li class="tree-item">' +
                                '<i class="fa fa-plus-square-o"></i>' +
                                '<i class="bw-icon i-15 i-tree-pkg"></i>' +
                                '<span>'+ packageNm + '</span>' +
                                '<ul class="bw-tree bw-tree-floor" data-value="'+ fullPackageNm + '">' +
                                renderRecursiveTree(item.children, fullPackageNm) + '</ul></li>')
                        } else {
                            var classNm = item.classNm;
                            target.push(
                                '<li class="class-item" data-pkg="' + pkgNm + '" data-value="'+ classNm + '">' +
                                '<i class="fa"></i>' +
                                '<i class="bw-icon i-15 i-tree-class"></i>' +
                                '<span>'+ classNm + '</span></li>')
                        }
                    });

                    return target.join('');
                }
            },

            loadApplicationTree: function (e) {
                e && e.stopPropagation();

                var that = this,
                    $target = e && e.type === 'click' ? $(e.currentTarget).find('ul') : that.$treeWrap,
                    pkgNm = $target.attr('data-value'),
                    params = commonUtil.makeParamFromForm(that.$searchWrap);

                // 서브클래스가 없는 게 확인된 경우 바로 리턴
                if (e && $(e.currentTarget).children('ul').hasClass('no-sub-class')) return;

                // 이미 확장된 트리를 다시 누르면 트리를 닫음
                if (e && e.type !== 'change' && $target.children().length) {
                    $target.html([]).siblings('.fa').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
                    return;
                }

                // Ajax 요청
                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'DBDependencyService', 'getDbioTreeList', 'DepResToDbTreeListInOMM',
                    {
                        bxmAppId: that.bxmAppId = params.bxmAppId,
                        pkgNm: pkgNm
                    }
                ), {
                    beforeSend: function() {
                        that.subViews['treeLoadingBar'].show();
                    },
                    success: function(response) {
                        var depResToDbTreeListOMM = response.DepResToDbTreeListOMM,
                            treeList = [];

                        depResToDbTreeListOMM.treeList.forEach(function(value) {
                            treeList.push(
                                '<li class="tree-item">' +
                                '<i class="fa fa-plus-square-o"></i>' +
                                '<i class="bw-icon i-15 i-tree-pkg"></i>' +
                                '<span>'+ value + '</span>' +
                                '<ul class="bw-tree bw-tree-floor" data-value="'+ (pkgNm ? pkgNm + '.' + value : value) + '"></ul></li>')
                        });
                        depResToDbTreeListOMM.dbioList.forEach(function(value) {
                            treeList.push(
                                '<li class="class-item" data-pkg="' + pkgNm + '" data-value="'+ value + '">' +
                                '<i class="fa"></i>' +
                                '<i class="bw-icon i-15 i-tree-class"></i>' +
                                '<span>'+ value + '</span></li>')
                        });

                        if (treeList.length) {
                            $target.html(treeList).siblings('.fa').removeClass('fa-plus-square-o').addClass('fa-minus-square-o');
                        } else {
                            $target.addClass('no-sub-class');
                            $target.siblings('.fa').removeClass('fa-plus-square-o');
                        }
                    },
                    complete: function() {
                        that.subViews['treeLoadingBar'].hide();
                    }
                });
            },

            loadSqlList: function (e) {
                e.stopPropagation();

                var that = this,
                    $target = $(e.currentTarget),
                    params = commonUtil.makeParamFromForm(that.$searchWrap);
                that.pkgNm = $target.attr('data-pkg');
                that.classNm = $target.attr('data-value');

                that.$gridTitle.text(that.pkgNm + '.' + that.classNm);
                that.grid.loadData({
                    bxmAppId: params.bxmAppId,
                    pkgNm: that.pkgNm,
                    classNm: that.classNm
                });
            },

            moveToCallerDetail: function (e) {
                var that = this,
                    target = $(e.currentTarget);
                commonUtil.redirectRoutePage('MENU00801', {
                    bxmAppId: that.bxmAppId,
                    pkgNm: that.pkgNm,
                    classNm: that.classNm,
                    sqlId: target.attr('data-sql-id')
                });
            },

            loadSqlDetail: function () {
                switch (this.activeTab) {
                    case 'first-tab':
                        this.loadTableList();
                        break;
                    case 'last-tab':
                        this.loadSqlQuery();
                        break;
                    default:
                }
            },

            loadTableList: function () {
                if (!this.bxmAppId) return;

                var that = this,
                    params = {
                        bxmAppId: that.bxmAppId,
                        pkgNm: that.pkgNm,
                        classNm: that.classNm,
                        sqlId: that.sqlId
                    };

                that.tableGrid.loadData(params);
                that.columnGrid.resetData();
            },

            loadColumnList: function () {
                if (!this.bxmAppId) return;

                var that = this,
                    params = {
                        bxmAppId: that.bxmAppId,
                        pkgNm: that.pkgNm,
                        classNm: that.classNm,
                        sqlId: that.sqlId,
                        tableNm: that.tableNm
                    };

                that.columnGrid.loadData(params);
            },

            loadSqlQuery: function () {
                if (!this.bxmAppId) return;

                var that = this;

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'DBDependencyService', 'getSqlQuery', 'TableInfoInOMM',
                    {
                        bxmAppId: that.bxmAppId,
                        pkgNm: that.pkgNm,
                        classNm: that.classNm,
                        sqlId: that.sqlId
                    }
                ), {
                    beforeSend: function() {
                        that.subViews['sqlLoadingBar'].show();
                    },
                    success: function(response) {
                        that.$sqlContent.html(response.SqlQueryOMM.sqlQuery);
                    },
                    complete: function() {
                        that.subViews['sqlLoadingBar'].hide();
                    }
                });
            }
        });
    }
);