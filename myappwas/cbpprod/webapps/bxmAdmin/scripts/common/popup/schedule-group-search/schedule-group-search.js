define(
    [
        'common/util',
        'common/component/ext-grid/_ext-tree-grid',
        'common/config',
        'common/component/popup/popup',
        'text!common/popup/schedule-group-search/schedule-group-search-tpl.html'
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
            sysId: null,
            initialize: function() {
                var that = this;

                that.grid = new ExtTreeGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ScheduleGroupService', 'getScheduleGroupList', 'ScheduleGroupInOMM'),
                        key: 'ScheduleGroupInOMM'
                    },
                    responseParam: {
                        objKey: 'ScheduleGroupListOMM',
                        key: 'treeList'
                    },
                    header: {
                        pageCount: true
                    },

                    fields: ['scheduleGrpId', 'scheduleGrpNm', 'existChildren'],
                    columns: [
                              {
                            	  text: '',
                            	  renderer: function (value, metaData, record) {
                            		  return Ext.String.format(
                            				  '<input type="radio" name="radioItem" class="bw-input ipt-radio" data-form-param="scheduleGrpId" data-value="{0}" />',
                            				  record.get('scheduleGrpId')
                            		  );
                            	  },
                            	  sortable: false,
                            	  authDisabled: true,
                            	  align: 'center',
                            	  flex: 5
                              },
                        {
                            xtype: 'treecolumn',
                            text: bxMsg('scheduler.schedule-group-id'), flex: 15, dataIndex: 'scheduleGrpId', style: 'text-align: center',
                            renderer: function (value, metaData, record) {
                                if (record.get('existChildren')) {
                                    metaData.tdCls += ' has-children';
                                }
                                return value;
                            }
                        },
                        {text: bxMsg('scheduler.schedule-group-nm'), flex: 25, dataIndex: 'scheduleGrpNm', align: 'center'}
                    ],
                    paging: true,
                    gridToggle: false,
                    pageCountList: [5, 10, 20],

                    listeners: {
                        select: function(_this, record, index) {
                            $( that.$el.find('input[name="radioItem"]')[index] ).attr("checked", true);
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
                                    that.loadScheduleGroupListChildren({
                                        scheduleGrpId: record.get('scheduleGrpId'),
                                        scheduleGrpNm: record.get('scheduleGrpNm'),
                                        sysId: that.sysId
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
                that.$titleWrap = that.$el.find('.schedule-group-title');
                that.$searchWrap = that.$el.find('.bxm-popup-search');
                that.$gridWrap = that.$el.find('.bxm-popup-grid');
                that.$gridWrap.html(that.grid.render());
            },

            render: function(sysId) {
            	this.sysId = sysId;
                this.loadList(sysId);
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

            loadList: function (sysId) {
                var that = this,
                    params = commonUtil.makeParamFromForm(this.$searchWrap);
                	params.sysId = that.sysId;
                
                	that.$titleWrap.text(params.sysId + bxMsg('scheduler.schedule-group-title'));
                	
                this.grid.loadData(params, function () {
                    that.renderDummyExpander(that.$gridWrap);
                    if (params.scheduleGrpId || params.scheduleGrpNm) {
                        that.grid.expandAllTreeNode();
                    }
                }, true);
            },

            loadScheduleGroupListChildren: function (params, callback) {
                var that = this;

                commonUtil.requestBxmAjax(commonUtil.getBxmReqData(
                    'ScheduleGroupService', 'showGroupChildren', 'ScheduleGroupInOMM',
                    params
                ), {
                    beforeSend: function() {
                        that.grid.subViews['gridLoadingBar'].show();
                    },
                    success: function(response) {
                        callback && callback(response.ScheduleGroupTreeOMM.children);
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