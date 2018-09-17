define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/config',
        'common/component/popup/popup',
        'text!views/scheduler/schedule-job-management/manager-add-popup-tpl.html'
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
                        obj: commonUtil.getBxmReqData('ScheduleInfoService', 'getManagerPopupList', 'ScheduleInfoManagerInOMM'),
                        key: 'ScheduleInfoManagerInOMM'
                    },
                    responseParam: {
                        objKey: 'ScheduleInfoManagerListOMM',
                        key: 'managerPopupList'
                    },
                    header: {
                    },

                    fields: ['userId', 'userNm', 'roleNm', 'phoneNo', 'email'],
                    columns: [
                        {
                            text: '',
                            renderer: function (value, metaData, record) {
                                return Ext.String.format(
                                    '<input type="checkbox" name="checkboxItem" class="bw-input ipt-radio" data-form-param="userId" data-value="{0}" />',
                                    record.get('userId')
                                );
                            },
                            sortable: false,
                            authDisabled: true,
                            align: 'center',
                            flex: 1
                        },
                        {text: bxMsg('scheduler.user-nm'), flex: 3, dataIndex: 'userNm', align: 'center'},
                        {text: bxMsg('scheduler.role'), flex: 3, dataIndex: 'roleNm', align: 'center'},
                        {text: bxMsg('scheduler.phone-no'), flex: 3, dataIndex: 'phoneNo', align: 'center'},
                        {text: bxMsg('scheduler.email'), flex: 3, dataIndex: 'email', align: 'center'}
                    ],
                    gridToggle: false,

                    listeners: {
                        itemclick: function(_this, record, item, idx) {
                            var $target = $( that.$el.find('input[name="checkboxItem"]')[idx] );
                            if ($target.attr('checked')) {
                                $target.attr("checked", false);
                            } else {
                                $target.attr("checked", true);
                            }
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
                var that = this,
                    params = commonUtil.makeParamFromForm(this.$searchWrap),
                    userIdList = [];

                if (Array.isArray(data)) {
                    data.forEach(function (item) {
                        userIdList.push(item.userId);
                    });
                    that.userIdList = params.userIdList = userIdList;
                } else {
                    params.userIdList = that.userIdList;
                }

                this.grid.loadData(params, function (data) {
                    that.gridData = data;

                    $('input[type="checkbox"][name="checkboxItem"]').on('click', function () {
                        var $target = $(this);
                        if ($target.attr('checked')) {
                            $target.attr("checked", false);
                        } else {
                            $target.attr("checked", true);
                        }
                    })
                }, true);
            },

            selectCode: function() {
                var dataObject = commonUtil.convertArrayToObject(this.gridData['managerPopupList'], 'userId'),
                    selectedObject = {};

                commonUtil.makeParamFromForm(this.$el.find('.bxm-popup-grid'))['userId'].forEach(function (item) {
                    selectedObject[item] = dataObject[item];
                });

                this.trigger('select-code', selectedObject);
                this.close();
            }
        });
    }
);