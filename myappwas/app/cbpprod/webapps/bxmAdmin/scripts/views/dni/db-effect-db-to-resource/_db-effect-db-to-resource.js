define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-tree-grid',
        'common/component/loading-bar/_loading-bar',
        'text!views/dni/db-effect-db-to-resource/_db-effect-db-to-resource-tpl.html'
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
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadApplicationTree',
                'enter-component .bxm-search-wrap input': 'loadApplicationTree',

                'click .table-item': 'toggleColumnView',
                'click .dbio-item': 'loadDbioList',
                'click .check-btn': 'moveToCallerDetail'
            },

            tableNm: null,
            columnNm: null,
            bxmAppId: null,
            pkgNm: null,
            classNm: null,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['treeLoadingBar'] = new LoadingBar();
                that.subViews['sqlLoadingBar'] = new LoadingBar();

                // Set Grid
                that.grid = new ExtTreeGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('DBDependencyService', 'getDbioCallerList', 'DbioCallerSqlInOMM'),
                        key: 'DbioCallerSqlInOMM'
                    },
                    responseParam: {
                        objKey: 'DbioCallerListOMM',
                        key: 'dbioList'
                    },
                    header: {
                        content: [
                            '<h3 class="bw-desc d-block bxm-grid-title">' + bxMsg('dni.dbio-caller-list') + '</h3>'
                        ]
                    },

                    fields: ['sqlId', 'sqlTypeCd', 'inputTypeCd', 'outputTypeCd', 'bxmAppId', 'pkgNm', 'classNm'],
                    columns: [
                        {
                            xtype: 'treecolumn',
                            text: '', flex: 3, dataIndex: 'sqlId', style: 'text-align: center;', tdCls: 'a-left lv1',
                            renderer: function (value, record) {
                                if (!value) {
                                    return '<i class="bw-sign s-db">DB</i>' + record.record.raw.pkgNm;
                                } else {
                                    return '<i class="fa fa-dot-circle-o chr-c-blue"></i>' + value;
                                }
                            }
                        },
                        {
                            text: bxMsg('dni.crud'), with: 100, dataIndex: 'sqlTypeCd', align: 'center',
                            renderer: function (value, record) {
                                if (record.record.raw.sqlId) {
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
                                } else {
                                    var crud = {},
                                        children = record.record.childNodes;

                                    children && children.length && children.forEach(function (item) {
                                        crud[item.raw.sqlTypeCd] = true;
                                    });

                                    return '<i class="bw-sign s-create ' + (crud[1] ? '' : 'null') + '">C</i>\
                                            <i class="bw-sign s-read ' + (crud[0] ? '' : 'null') + '">R</i>\
                                            <i class="bw-sign s-update ' + (crud[2] ? '' : 'null') + '">U</i>\
                                            <i class="bw-sign s-delete ' + (crud[3] ? '' : 'null') + '">D</i>';
                                }
                            }
                        },
                        {text: bxMsg('dni.input-type'), flex: 2.5, dataIndex: 'inputTypeCd', align: 'center'},
                        {text: bxMsg('dni.output-type'), flex: 2.5, dataIndex: 'outputTypeCd', align: 'center'},
                        {
                            text: bxMsg('dni.caller-check'),
                            renderer: function (value, p, record) {
                                if (record.get('bxmAppId')) {
                                    that.bxmAppId = record.get('bxmAppId');
                                    that.pkgNm = record.get('pkgNm');
                                    that.classNm = record.get('classNm');
                                }

                                return record.get('sqlId') && '<button type="button" class="bw-btn-txt check-btn" data-sql-id="' + record.get('sqlId') + '" data-app-id="' + that.bxmAppId + '" data-pkg="' + that.pkgNm + '" data-class="' + that.classNm + '">' + bxMsg('common.check') + '</button>';
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            tdCls: 'btn',
                            flex: 1.5
                        }
                    ],
                    listeners: {
                        select : function(_this, record) {
                        	that.bxmAppId = record.get('bxmAppId');
                        	that.pkgNm = record.get('pkgNm');
                        	that.classNm = record.get('classNm');
                            that.sqlId = record.get('sqlId');
                            that.loadSqlQuery();
                        }
                    }
                });

                // Dom Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$treeWrap = that.$el.find('.bxm-tree-wrap');
                that.$gridWrap = that.$el.find('.bxm-grid-wrap');
                that.$sqlWrap = that.$el.find('.sql-wrap');
                that.$sqlContent = that.$sqlWrap.find('.sql-content');
            },

            render: function() {
                var that = this;

                that.$gridWrap.html(that.grid.render(function () {
                    that.$gridTitle = that.$el.find('.bxm-grid-title');
                }));
                that.$treeWrap.append(that.subViews['treeLoadingBar'].render());
                that.$sqlWrap.append(that.subViews['sqlLoadingBar'].render());
                that.loadApplicationTree();

                return that.$el;
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param="keyword"]').val('');
            },

            loadApplicationTree: function () {
                var that = this,
                    formParams = commonUtil.makeParamFromForm(that.$searchWrap),
                    operation,
                    params;

                if (!formParams.keyword) {
                    operation = 'getDBTableTreeList';
                    params = {};
                } else if (formParams.searchType === 'table') {
                    operation = 'getDBTableTreeList';
                    params = {
                        tableNm: formParams.keyword
                    }
                } else if (formParams.searchType === 'column') {
                    operation = 'searchColumnList';
                    params = {
                        columnNm: formParams.keyword
                    }
                }

                // Ajax 요청
                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'DBDependencyService', operation, 'DBTableTreeOMM', params
                ), {
                    beforeSend: function() {
                        that.subViews['treeLoadingBar'].show();
                    },
                    success: function(response) {
                        var depResToDbTreeListOMM = response.DBTableTreeListOMM,
                            tableList = [],
                            columnList = [];

                        depResToDbTreeListOMM.tableList.forEach(function(table) {
                            columnList = [];

                            table.columnList.forEach(function (column) {
                                columnList.push(
                                    '<li class="column-item dbio-item" data-table="' + table.tableNm + '" data-value="' + column + '"><i class="bw-icon i-15 i-tree-column"></i><span>' + column + '</span></li>');
                            });

                            if (!formParams.keyword) {      // 전체 검색 시 tree collapse 상태로
                                tableList.push(
                                    '<li class="table-item dbio-item" data-table="' + table.tableNm + '">\
                                <i class="fa fa-' + (columnList.length ? 'plus-' : '') + 'square-o"></i><i class="bw-icon i-15 i-tree-table"></i><span>' + table.tableNm + '</span>\
                                <ul class="bw-tree t-type2 bw-tree-floor" style="display: none;">' + columnList.join('') + '</ul></li>');
                            } else {                        // keyword 검색 시 tree expand 상태로
                                tableList.push(
                                    '<li class="table-item dbio-item" data-table="' + table.tableNm + '">\
                                <i class="fa fa-' + (columnList.length ? 'minus-' : '') + 'square-o"></i><i class="bw-icon i-15 i-tree-table"></i><span>' + table.tableNm + '</span>\
                                <ul class="bw-tree t-type2 bw-tree-floor">' + columnList.join('') + '</ul></li>');
                            }

                        });

                        that.$treeWrap.html(tableList);
                    },
                    complete: function() {
                        that.subViews['treeLoadingBar'].hide();
                    }
                });
            },

            toggleColumnView: function (e) {
                e.stopPropagation();

                var $target = $(e.currentTarget);

                if ($target.children('i').hasClass('fa-plus-square-o')) {
                    // expand
                    $target.children('.fa').removeClass('fa-plus-square-o').addClass('fa-minus-square-o');
                    $target.children('ul').show();
                } else if ($target.children('i').hasClass('fa-minus-square-o')) {
                    // collapse
                    $target.children('.fa').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
                    $target.children('ul').hide();
                }
            },

            loadDbioList: function (e) {
                e.stopPropagation();

                var that = this,
                    $target = $(e.currentTarget);
                that.tableNm = $target.attr('data-table');
                that.columnNm = $target.attr('data-value');

                if($.isEmptyObject(that.columnNm)) {
                	that.$gridTitle.text(bxMsg('dni.dbio-caller-list') + ' : ' + that.tableNm);
                } else {
                	that.$gridTitle.text(bxMsg('dni.dbio-caller-list') + ' : ' + that.columnNm);
                }
                
                that.grid.loadData({
                    tableNm: that.tableNm,
                    columnNm: that.columnNm
                }, function () {
                    that.grid.expandAllTreeNode();
                });
            },

            moveToCallerDetail: function (e) {
                var target = $(e.currentTarget);
                commonUtil.redirectRoutePage('MENU00801', {
                    bxmAppId: target.attr('data-app-id'),
                    pkgNm: target.attr('data-pkg'),
                    classNm: target.attr('data-class'),
                    sqlId: target.attr('data-sql-id')
                });
            },

            loadSqlQuery: function () {
                if (!this.bxmAppId || !this.sqlId) return;

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