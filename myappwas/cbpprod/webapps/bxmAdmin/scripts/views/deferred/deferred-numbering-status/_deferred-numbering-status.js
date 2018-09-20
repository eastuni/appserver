define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'common/popup/deferred-search/deferred-search',
        'text!views/deferred/deferred-numbering-status/_deferred-numbering-status-tpl.html'
    ],
    function (
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        DeferredSearchPopup,
        tpl) {
        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadList',
                'enter-component .bxm-search-wrap input': 'loadList',
                'change .bxm-search-wrap input[data-form-param="bizDt"]': 'loadList',
                'click .deferred-search-btn': 'showDeferredSearchPopup'
            },

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());


                // Set SubViews
                that.subViews['deferredSearchPopup'] = new DeferredSearchPopup();
                that.subViews['deferredSearchPopup'].on('select-code', function (deferredId) {
                    that.$searchWrap.find('input[data-form-param="deferredId"]').val(deferredId);
                    that.loadList();
                });


                // Set Grid
                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('DfrdNumberingSituationService', 'getDfrdNumberingListUsingPaging', 'DfrdSeq01IO'),
                        key: 'DfrdSeq01IO'
                    },
                    responseParam: {
                        objKey: 'DfrdSeqList01IO',
                        key: 'dfrdNumering'
                    },
                    header: {
                        pageCount: true
                    },
                    paging: true,

                    fields: ['deferredId', 'bizDt', 'nodeNo', 'lastProcLogSeq', 'firstProcStartDttm', 'currProcStartDttm', 'lastProcEndDttm', 'procExecCnt', 'procEndYn', 'procErrYn'],
                    columns: [
                        {text: bxMsg('deferred.deferredId'), flex: 2, dataIndex: 'deferredId',  align: 'center'},
                        {
                            text: bxMsg('deferred.businessDate'), flex: 2, dataIndex: 'bizDt', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToDateString(value);
                            }
                        },
                        {text: bxMsg('deferred.nodeNo'), flex: 1, dataIndex: 'nodeNo',  align: 'center'},
                        {text: bxMsg('deferred.latestProcessingLogSeqNo'), flex: 2, dataIndex: 'lastProcLogSeq',  align: 'center'},
                        {
                            text: bxMsg('deferred.initialProcessingStartDatetime'), flex: 2, dataIndex: 'firstProcStartDttm', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToFullTimeString(value);
                            }
                        },
                        {
                            text: bxMsg('deferred.currentProcessingStartDatetime'), flex: 2, dataIndex: 'currProcStartDttm', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToFullTimeString(value);
                            }
                        },
                        {
                            text: bxMsg('deferred.latestProcessingCompleteDatetime'), flex: 2, dataIndex: 'lastProcEndDttm', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToFullTimeString(value);
                            }
                        },
                        {text: bxMsg('deferred.processExecutionCount'), flex: 1, dataIndex: 'procExecCnt',  align: 'center'},
                        {text: bxMsg('deferred.processingCompleteYn'), flex: 1, dataIndex: 'procEndYn',  align: 'center'},
                        {text: bxMsg('deferred.processingErrorYn'), flex: 1, dataIndex: 'procErrYn',  align: 'center'}
                    ]
                });


                // Dom Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$gridWrap = that.$el.find('.bxm-grid-wrap');
            },

            render: function() {
                var that = this;

                commonUtil.setDatePicker(that.$searchWrap.find('input[data-form-param="bizDt"]'), 'yy-mm-dd');

                that.$gridWrap.html(that.grid.render(function(){
                    that.resetSearch();
                    that.loadList();
                }));

                return that.$el;
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param]').val('');
                this.$searchWrap.find('[data-form-param="bizDt"]').datepicker('setDate', commonConfig.bizDate);
            },

            loadList: function() {
                var params = commonUtil.makeParamFromForm(this.$searchWrap);

                params.bizDt = params.bizDt.replace(/-/g, '');

                this.grid.loadData(params, null, true);
            },

            showDeferredSearchPopup: function () {
                this.subViews['deferredSearchPopup'].render();
            }
        });
    }
);