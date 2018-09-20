define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/config',
        'common/component/popup/popup',
        'text!common/popup/center-cut-search/center-cut-search-tpl.html'
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
                        obj: commonUtil.getBxmReqData('SCC1005', 'searchCenterCutId', 'BxmCCMainIO', null, 'bxmAdminCC'),
                        key: 'BxmCCMainIO'
                    },
                    responseParam: {
                        objKey: 'BxmCCMain01IO',
                        key: 'out'
                    },
                    header: {
                        pageCount: true
                    },

                    fields: ['ccId', 'ccIdNm', 'inptDataTpCd', 'ccIdUseYn'],
                    columns: [
                        {
                            text: '',
                            renderer: function (value, metaData, record) {
                                return Ext.String.format(
                                    '<input type="radio" name="radioItem" class="bw-input ipt-radio" data-form-param="ccId" data-value="{0}" />',
                                    record.get('ccId')
                                );
                            },
                            sortable: false,
                            authDisabled: true,
                            align: 'center',
                            width: 40
                        },
                        {text: bxMsg('centerCut.centerCutId'), flex: 3, dataIndex: 'ccId', align: 'center'},
                        {text: bxMsg('centerCut.centerCutName'), flex: 3, dataIndex: 'ccIdNm', align: 'center'},
                        {
                            text: bxMsg('centerCut.dataGenerateType'), flex: 2, dataIndex: 'inptDataTpCd', align:'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMCC0003'][value];
                            }
                        },
                        {text: bxMsg('centerCut.useYn'), flex: 1, dataIndex: 'ccIdUseYn', align: 'center'}
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