define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-tree-grid',
        'common/component/loading-bar/_loading-bar',
        'text!views/trx-setting/cache-monitoring/_cache-monitoring-tpl.html'
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

            testKeyTypeCd: null,
            testKeyId: null,

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadList',
                'enter-component .bxm-search-wrap input': 'loadList',

                'click .cache-checkbox-btn': 'onClickCacheCheckboxBtn',
                'click .clear-btn': 'onClickOperationBtn',
                'click .reload-btn': 'onClickOperationBtn'
            },

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set Grid
                that.grid = new ExtTreeGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('CacheMonService', 'monitorCache', 'CacheInOMM'),
                        key: 'CacheInOMM'
                    },
                    responseParam: {
                        objKey: 'CacheMonListOMM',
                        key: 'cacheMonList'
                    },
                    header: {
                        treeExpand: true
                    },
                    paging: true,

                    fields: ['cacheNm', 'tableNm', 'nodeNm', 'containerNm', 'status', 'cacheCount', 'mngSvcUrl'],
                    columns: [
                        {
                            text: '',
                            renderer: function (value, p, record, idx) {
                                // child menu 인 경우에만 체크박스 선택 가능
                                if (record.get('childrenSize')) {
                                    return '';
                                } else {
                                    return Ext.String.format(
                                        '<input type="checkbox" class="bw-input ipt-radio cache-checkbox-btn" data-form-param="cacheNm" data-cache="{0}" data-table="{1}" data-parent="{2}" data-url="{3}"/>',
                                        record.get('cacheNm'),
                                        record.get('tableNm'),
                                        !record.get('status'),
                                        record.get('mngSvcUrl')
                                    );
                                }
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            width: 40
                        },
                        {xtype: 'treecolumn', text: bxMsg('trx-setting.cache-nm'), flex: 3, dataIndex: 'cacheNm', style: 'text-align: center'},
                        {text: bxMsg('trx-setting.table-nm'), flex: 2, dataIndex: 'tableNm', align: 'center'},
                        {text: bxMsg('trx-setting.nodeName'), flex: 2, dataIndex: 'nodeNm', align: 'center'},
                        {text: bxMsg('trx-setting.containerName'), flex: 2, dataIndex: 'containerNm', align: 'center'},
                        {text: bxMsg('trx-setting.status'), flex: 2, dataIndex: 'status', align: 'center'},
                        {
                            text: bxMsg('trx-setting.loadCount'), flex: 1, dataIndex: 'cacheCount', align: 'center',
                            renderer: function (value, p, record) {
                            	if(record.get('status')) { //parent 구분
                            		if(value > 0) {
                            			return value;
                            		} else {                            			
                            			return 0;
                            		}
                            	} else {
                            		return '';
                            	}
                            }
                        }
                    ]
                });

                // Dom Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$grid = that.$el.find('.bxm-grid-wrap');
            },

            render: function() {
                var that = this;

                that.$grid.html(that.grid.render(function(){that.loadList();}));

                return that.$el;
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param]').val('');
            },

            loadList: function() {
                var that = this,
                    params = commonUtil.makeParamFromForm(this.$searchWrap);
                this.grid.loadData(params, function(data) {
                    that.grid.expandAllTreeNode();
                    data = data['cacheMonList'];
                    if(data && data.length) {
                        that.$grid.find('tbody tr:first-child').click();
                    }
                }, true);
            },

            onClickCacheCheckboxBtn: function (event) {
                var $target = $(event.currentTarget),
                    cacheNm = $target.attr('data-cache'),
                    tableNm = $target.attr('data-table'),
                    isParent = $target.attr('data-parent') === 'true',
                    isChecked = $target.is(':checked');

                if (isParent) {
                    this.$grid.find('input[data-parent="false"][data-cache="' + cacheNm + '"][data-table="' + tableNm + '"]')
                        .each(function() {
                            this.checked = isChecked;
                        });
                } else {
                    if (isChecked && !this.$grid.find('input[data-parent="false"][data-cache="' + cacheNm + '"][data-table="' + tableNm + '"]:not(:checked)').length) {
                        this.$grid.find('input[data-parent="true"][data-cache="' + cacheNm + '"][data-table="' + tableNm + '"]').attr('checked', true);
                    } else if (!isChecked && !this.$grid.find('input[data-parent="false"][data-cache="' + cacheNm + '"][data-table="' + tableNm + '"]:checked').length) {
                        this.$grid.find('input[data-parent="true"][data-cache="' + cacheNm + '"][data-table="' + tableNm + '"]').attr('checked', false);
                    }
                }
            },

            onClickOperationBtn: function (event) {
                var that = this,
                    checkedItems = this.$grid.find('input[data-parent="false"]:checked'),
                    cacheMonList = [];

                if(!checkedItems.length) {
                    swal({type: 'warning', title: '', text: bxMsg('common.item-no-select-error'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                checkedItems.each(function (i, item) {
                    var $item = $(item);

                    cacheMonList.push({
                        cacheNm: $item.attr('data-cache'),
                        mngSvcUrl: $item.attr('data-url')
                    })
                });

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData('CacheMonService', $(event.currentTarget).attr('data-op'), 'CacheMonListOMM', {
                    cacheMonList: cacheMonList
                }), {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.status-change-success'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                            that.loadList();
                        } else if(code === 201){
                            swal({type: 'error', title: '', text: bxMsg('common.status-change-fail'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    }
                });
            }
        });
    }
);