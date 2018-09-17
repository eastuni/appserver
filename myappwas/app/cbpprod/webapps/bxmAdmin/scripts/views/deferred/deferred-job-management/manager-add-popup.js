define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/config',
        'common/component/popup/popup',
        'text!views/deferred/deferred-job-management/manager-add-popup-tpl.html'
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

            userIdList: [],
            gridData: {},

            initialize: function() {
                var that = this;

                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('DfrdMainMngtService', 'getManagerList', 'DfrdManagerOMM'),
                        key: 'DfrdManagerOMM'
                    },
                    responseParam: {
                        objKey: 'DfrdManagerListOMM',
                        key: 'userList'
                    },
                    header: {
                        pageCount: true
                    },

                    fields: ['userId', 'userNm', 'phoneNo'],
                    columns: [
                        {
                            text: '',
                            renderer: function (value, metaData, record) {
                                return Ext.String.format(
                                    '<input type="radio" name="userId" class="bw-input ipt-radio" data-form-param="userId" data-value="{0}" />',
                                    record.get('userId')
                                );
                            },
                            sortable: false,
                            authDisabled: true,
                            align: 'center',
                            flex: 1
                        },
                        {text: bxMsg('deferred.userId'), flex: 3, dataIndex: 'userId', align: 'center'},
                        {text: bxMsg('deferred.userNm'), flex: 3, dataIndex: 'userNm', align: 'center'},
                        {text: bxMsg('deferred.phoneNo'), flex: 3, dataIndex: 'phoneNo', align: 'center'}
                    ],
                    gridToggle: false,
                    paging: true,
                    pageCountList: [5, 10, 20],
                    listeners: {
                        select: function(_this, record, idx) {
                            $( $('input[name="userId"]')[idx] ).attr("checked", true);
                        }
                    }
                });

                that.$el.html(that.tpl());
                that.$el.find('.bxm-popup-grid').html(that.grid.render());
                that.$searchWrap = that.$el.find('.bxm-popup-search');
            },

            render: function(data) {
                this.loadList(data);
                this.setDraggable();
                this.show();
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param]').val('');
            },

            loadList: function (data) {
                var params = commonUtil.makeParamFromForm(this.$searchWrap);
                    
                    this.grid.loadData(params, null, true);
            },

            selectCode: function() {
                var userId = $( $('input[name="userId"]:checked')[0] ).attr('data-value');

                this.trigger('select-code', userId);
                this.close();
            }
        });
    }
);