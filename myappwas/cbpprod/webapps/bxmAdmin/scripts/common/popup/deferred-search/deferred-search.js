define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/config',
        'common/component/popup/popup',
        'text!common/popup/deferred-search/deferred-search-tpl.html'
    ],
    function(
        commonUtil,
        ExtGrid,
        commonConfig,
        Popup,
        tpl
    ) {
        return Popup.extend({
            className: 'md-large',

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
                        obj: commonUtil.getBxmReqData('DfrdWorkProgressSituationService', 'getDfrdId', 'DfrdMain01IO'),
                        key: 'BxmCCMainIO'
                    },
                    responseParam: {
                        objKey: 'DfrdMainList01IO',
                        key: 'dfrdMainIO'
                    },
                    header: {
                        pageCount: true
                    },

                    fields: ['deferredId', 'deferredNm', 'useYn', 'modifyUserId'],
                    columns: [
                        {
                            text: '',
                            renderer: function (value, metaData, record) {
                                return Ext.String.format(
                                    '<input type="radio" name="radioItem" class="bw-input ipt-radio" data-form-param="deferredId" data-value="{0}" />',
                                    record.get('deferredId')
                                );
                            },
                            sortable: false,
                            authDisabled: true,
                            align: 'center',
                            width: 40
                        },
                        {text: bxMsg('deferred.deferredId'), flex: 2, dataIndex: 'deferredId', align: 'center'},
                        {text: bxMsg('deferred.deferredName'), flex: 3, dataIndex: 'deferredNm', align: 'center'},
                        {text: bxMsg('centerCut.useYn'), flex: 1, dataIndex: 'useYn', align: 'center'},
                        {text: bxMsg('deferred.managerId'), flex: 3, dataIndex: 'modifyUserId', align: 'center'}
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

            render: function() {
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