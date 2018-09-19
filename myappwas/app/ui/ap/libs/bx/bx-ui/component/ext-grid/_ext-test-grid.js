define(
    function () {
        var ExtGrid = Backbone.View.extend({
            tagName: 'section',
            className: 'bx-ext-grid',

            grid: null,
            store: null,

            currentPageNumber: 1,

            /**
             * @param config { url*, httpMethod, fields*, columns*, miniColumn, listeners, pageAble }
             */
            initialize: function (config) {
                var that = this;

                $.extend(that, config);

                //grid listener setting
                that.listeners || (that.listeners = {});
                that.listeners.scope = that.grid;

                that.initStore(config.fields, config.storeListeners);

                if(that.pageAble) {
                    that.listeners['viewready'] = function(grid, eOpts){
                        grid.view.getEl().on( 'scroll', function(event, target) {
                            var viewEndPosition = target.scrollHeight - target.offsetHeight;

                            if ((viewEndPosition > 0) && (viewEndPosition <= target.scrollTop)){

                                that.settedParam.pageNumber = ++that.currentPageNumber;
                                that.loadData(that.settedParam, false);
                            }
                        });
                    }
                }


            },

            /**
             * @param renderOption {width, height}
             */
            render: function (renderOption) {
                var that = this;

                //grid size setting
                renderOption || (renderOption = {});
                renderOption.width ? (that.width = renderOption.width) : (that.width = '100%');
                renderOption.height ? (that.height = renderOption.height) : (that.height = '100%');

                that.$el.width(that.width);
                that.$el.height(that.height);

                //grid render
                $.elementReady(that.el, function () {
                    (that.grid === null) && that.renderGrid();
                });

                return that.$el;
            },

            initStore: function(fields, listeners) {
                this.store = Ext.create('Ext.data.Store', {fields: fields, listeners: listeners});
            },

            /**
             * @param param
             * @param option {isReset, loadBefore, loadSuccess, loadComplete}
             */
            loadData: function (param, option) {
                var that = this,
                    httpMethod = that.httpMethod || 'get',
                    option = option || {},
                    storeFn;

                that.settedParam = param;

                if(option.isReset) {
                    storeFn = 'loadData';
                    that.currentPageNumber = 1;
                }else {
                    storeFn = 'add';
                }
                
                bxProxy[httpMethod](that.url, param, {
                    beforeSend: function() {
                        typeof option.loadBefore === 'function' && option.loadBefore();
                    },
                    success: function(responseData) {
                        that.store[storeFn](responseData);
                        typeof option.loadSuccess === 'function' && option.loadSuccess(responseData);
                    },
                    complete: function() {
                        typeof option.loadComplete === 'function' && option.loadComplete();
                    }
                });
            },

            addData: function(data) {
                this.store.add(data);
            },

            resetData: function() {
                this.store.removeAll();
            },

            getAllData: function() {
                var dataList = [];

                this.store.each(function(record) {
                    dataList.push(record.data);
                });

                return dataList;
            },

            setData: function(data) {
                this.resetData();
                this.store.loadData(data);
            },

            renderGrid: function () {
                var that = this,
                    gridConts = {
                        store: that.store,
                        header: false,
                        style: {
                            width: that.width
                        },

                        emptyText: '<section class="empty-message-wrap"><p class="empty-message">'+bxMsg('cbb_items.SCRNITM#no-data-msg')+'</p></section>',
                        viewConfig: {
                            deferEmptyText: false
                        },

                        setSizePack: function() {
                            this.setSize(that.width, that.height);
                        },

                        columns: that.columns,

                        height: that.height,
                        renderTo: that.$el[0],

                        plugins: that.plugins,

                        selModel: that.selModel,

                        listeners: that.listeners
                    };

                $.extend(true, gridConts, that.gridConfig);

                (that.checkbox) && (gridConts.selType = 'checkboxmodel');
                (that.cell) && (gridConts.selType = 'cellmodel');

                that.grid = Ext.create('Ext.grid.Panel', gridConts);
            },

            changeColumns: function(columns) {
                this.grid.reconfigure(null, columns);
            },

            getSelectedItem: function() {
                var dataList = [];

                this.getSelectedItemRow().forEach(function(raw, i) {
                    dataList.push(raw.data);
                });

                return dataList;
            },

            getSelectedItemRow: function( ) {
                return this.grid.getSelectionModel().getSelection();
            },

            upSelectedRow: function() {
                this.moveSelectedRow(-1);
            },

            downSelectedRow: function() {
                this.moveSelectedRow(1);
            },

            moveSelectedRow: function(distance) {
                var selectedRows = this.getSelectedItemRow(),
                    lastIndex = this.store.count() - 1,
                    newIndex = this.store.indexOf(selectedRows[0]) + distance;

                newIndex = (newIndex < 0)? 0 : newIndex;
                newIndex = (newIndex > lastIndex)? lastIndex : newIndex;

                if(selectedRows.length === 0) { return; }

                this.store.remove(selectedRows[0]);
                this.store.insert(newIndex, selectedRows);
                this.grid.getSelectionModel().select(newIndex);
            },

            getSelectedRecords: function() {
                return this.grid.getSelectionModel().getSelection();
            },
 
            resizeGrid: function () {
                this.grid && this.grid.setSizePack();
            },
            
            getChangedRecords: function(fieldName) {
            	var changedRecords = [];
            	
            	this.store.each(function(record) {
            		if(record.isModified(fieldName)) {
            			changedRecords.push(record);
            		}
            	});
            	
            	return changedRecords;
            },
            
            
            getFilteredRecords: function(fieldName, value) {
            	var checkedRecords = [];
            	
            	this.store.each(function(record) {
            		if(record.get(fieldName) === value ) {
            			checkedRecords.push(record.data);
            		}
            	});
            	
            	return checkedRecords;
            }
        });

        return ExtGrid;
    }
);