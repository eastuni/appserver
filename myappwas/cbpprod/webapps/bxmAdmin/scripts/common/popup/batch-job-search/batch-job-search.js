define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/config',
        'common/component/popup/popup',
        'text!common/popup/batch-job-search/batch-job-search-tpl.html'
    ],
    function(
        commonUtil,
        ExtGrid,
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

            initialize: function() {
                var that = this;

                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('BatchJobService', 'getJobList', 'BatchJobSearchConditionOMM'),
                        key: 'BatchJobSearchConditionOMM'
                    },
                    responseParam: {
                        objKey: 'BatchJobListOMM',
                        key: 'batchJobList'
                    },
                    header: {
                        pageCount: true
                    },

                    fields: ['jobId', 'jobNm', 'bxmAppId'],
                    columns: [
                        {
                            text: '',
                            renderer: function (value, metaData, record) {
                                return Ext.String.format(
                                    '<input type="radio" name="radioItem" class="bw-input ipt-radio" data-form-param="jobId" data-value="{0}" />',
                                    record.get('jobId')
                                );
                            },
                            sortable: false,
                            authDisabled: true,
                            align: 'center',
                            flex: 5
                        },
                        {text: bxMsg('batch.job-id'), flex: 15, dataIndex: 'jobId', align: 'center'},
                        {text: bxMsg('batch.job-nm'), flex: 25, dataIndex: 'jobNm', align: 'center'},
                        {text: bxMsg('batch.app-nm'), flex: 25, dataIndex: 'bxmAppId', align: 'center'}
                    ],
                    paging: true,
                    gridToggle: false,
                    pageCountList: [5, 10, 20],

                    listeners: {
                        select: function(_this, record, idx) {
                            $( that.$el.find('input[name="radioItem"]')[idx] ).attr("checked", true);
                        }
                    }
                });

                that.$el.html(that.tpl());
                that.$el.find('.bxm-popup-grid').html(that.grid.render());
                that.$searchWrap = that.$el.find('.bxm-popup-search');
            },

            render: function(viewType) {
                if (viewType === 'centerCut') {
                    this.grid.requestParam = {
                        obj: commonUtil.getBxmReqData('CentercutInfoService', 'getJobList', 'BatchJobSearchConditionOMM'),
                        key: 'BatchJobSearchConditionOMM'
                    };
                }
                this.loadList();
                this.setDraggable();
                this.show();
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param]').val('');
            },

            loadList: function () {
                this.grid.loadData(commonUtil.makeParamFromForm(this.$searchWrap), null, true);
            },

            selectCode: function() {
                this.trigger('select-code', this.$el.find('input[name="radioItem"]:checked').attr('data-value'));
                this.close();
            }
        });
    }
);