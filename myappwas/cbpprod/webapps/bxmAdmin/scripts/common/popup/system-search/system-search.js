define(
    [
        'common/util',
        'common/component/ext-grid/_ext-tree-grid',
        'common/config',
        'common/component/popup/popup',
        'text!common/popup/system-search/system-search-tpl.html'
    ],
    function(
        commonUtil,
        ExtTreeGrid,
        commonConfig,
        Popup,
        tpl
    ) {
        return Popup.extend({
            className: 'md-small',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadList',
                'enter-component .bxm-popup-search input': 'loadList',

                'click .save-btn': 'selectCode',
                'click .cancel-btn': 'close'
            },

            treeRendering: false,

            initialize: function() {
                var that = this;

                that.grid = new ExtTreeGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('PopupService', 'getSystemPopupList', 'PopupInOMM'),
                        key: 'PopupInOMM'
                    },
                    responseParam: {
                        objKey: 'SystemTreeListOMM',
                        key: 'systemTree'
                    },
                    header: {
                        pageCount: true
                    },

                    fields: ['sysId', 'sysNm', 'existChildren'],
                    columns: [
                              {
                            	  text: '',
                            	  renderer: function (value, metaData, record) {
                            		  return Ext.String.format(
                            				  '<input type="radio" name="radioItem" class="bw-input ipt-radio" data-form-param="sysId" data-value="{0}" />',
                            				  record.get('sysId')
                            		  );
                            	  },
                            	  sortable: false,
                            	  authDisabled: true,
                            	  align: 'center',
                            	  flex: 5
                              },
                        {
                            xtype: 'treecolumn',
                            text: bxMsg('scheduler.system-id'), flex: 15, dataIndex: 'sysId', style: 'text-align: center',
                            renderer: function (value, metaData, record) {
                                if (record.get('existChildren')) {
                                    metaData.tdCls += ' has-children';
                                }
                                return value;
                            }
                        },
                        {text: bxMsg('scheduler.system-nm'), flex: 25, dataIndex: 'sysNm', align: 'center'}
                    ],
                    paging: true,
                    gridToggle: false,
                    pageCountList: [5, 10, 20],

                    listeners: {
                        select: function(_this, record, idx) {
                            $( that.$el.find('input[name="radioItem"]')[idx] ).attr("checked", true);
                        },

                        beforeitemdblclick: function () {
                            return false;
                        },
                        itemexpand: function () {
                            setTimeout(function () {
                                that.treeRendering = false;
                            }, 500)
                        },
                        itemcollapse: function () {
                            setTimeout(function () {
                                that.treeRendering = false;
                            }, 500)
                        },
                        itemclick: function (_this, record, item, index) {
                            if (that.treeRendering || !record.get('existChildren')) return;
                            that.treeRendering = true;

                            if (record.isExpanded()) {
                                record.collapse();
                            } else {
                                // children이 있는 데 한번도 expand 한 적이 없을 때
                                if (record.isLeaf()) {
                                    that.loadSystemTreeChildren({
                                        sysId: record.get('sysId')
                                    }, function (data) {
                                        record.appendChild(data);
                                        record.data.leaf = false;
                                        record.commit();
                                        record.expand();
                                        that.renderDummyExpander(that.$gridWrap);
                                        $( that.$el.find('input[name="radioItem"]')[index] ).attr("checked", true);
                                    });
                                    return;
                                } else {
                                    record.expand();
                                }
                            }

                            that.renderDummyExpander(that.$gridWrap);
                            $( that.$el.find('input[name="radioItem"]')[index] ).attr("checked", true);
                        },
                        afteritemexpand: function () {
                            that.renderDummyExpander(that.$gridWrap);
                        }
                    },
                    gridConfig: {
                        animate: false
                    }
                });

                that.$el.html(that.tpl());
                that.$searchWrap = that.$el.find('.bxm-popup-search');
                that.$gridWrap = that.$el.find('.bxm-popup-grid');
                that.$gridWrap.html(that.grid.render());
            },

            render: function() {
                this.loadList();
                this.setDraggable();
                this.show();
            },

            renderDummyExpander: function (dummyExpandTarget) {
                dummyExpandTarget.find('.has-children div').each(function (i, item) {
                    $(item).children('img:eq(-2)').addClass('x-tree-expander');
                });
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param]').val('');
            },

            loadList: function () {
                var that = this,
                    params = commonUtil.makeParamFromForm(this.$searchWrap);

                this.grid.loadData(params, function () {
                    that.renderDummyExpander(that.$gridWrap);
                    if (params.sysId || params.sysNm) {
                        setTimeout(function () {
                            that.grid.expandAllTreeNode();
                        }, 100);
                    }
                }, true);

                this.grid.loadData(commonUtil.makeParamFromForm(this.$searchWrap), null, true);
            },

            loadSystemTreeChildren: function (params, callback) {
                var that = this;

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'ScheduleGroupService', 'showSystemChildren', 'SystemTreeInOMM',
                    params
                ), {
                    beforeSend: function() {
                        that.grid.subViews['gridLoadingBar'].show();
                    },
                    success: function(response) {
                        callback && callback(response.SystemTreeOMM.children);
                    },
                    complete: function() {
                        that.grid.subViews['gridLoadingBar'].hide();
                    }
                });
            },

            selectCode: function() {
                this.trigger('select-code', this.$el.find('input[name="radioItem"]:checked').attr('data-value'));
                this.close();
            }
        });
    }
);