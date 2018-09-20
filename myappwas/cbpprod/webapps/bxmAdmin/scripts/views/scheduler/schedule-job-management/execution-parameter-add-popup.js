define(
    [
        'common/util',
        'common/component/ext-grid/_ext-grid',
        'common/config',
        'common/component/popup/popup',
        'text!views/scheduler/schedule-job-management/execution-parameter-add-popup-tpl.html'
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

            paramList: [],
            gridData: {},

            initialize: function() {
                var that = this;

                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ScheduleInfoService', 'getExecParamPopupList', 'ScheduleInfoExecParamInOMM'),
                        key: 'ScheduleInfoExecParamInOMM'
                    },
                    responseParam: {
                        objKey: 'ParameterCodeListOMM',
                        key: 'parameterList'
                    },
                    header: {
                    },

                    fields: ['paramCd', 'paramCdNm', 'paramTypeCd', 'cdProcKey', 'currParamVal'],
                    columns: [
                        {
                            text: '',
                            renderer: function (value, metaData, record) {
                                return Ext.String.format(
                                    '<input type="checkbox" name="checkboxItem" class="bw-input ipt-radio" data-form-param="paramCd" data-value="{0}" />',
                                    record.get('paramCd')
                                );
                            },
                            sortable: false,
                            authDisabled: true,
                            align: 'center',
                            flex: 1
                        },
                        {text: bxMsg('scheduler.parameter-code'), flex: 3, dataIndex: 'paramCd', align: 'center'},
                        {text: bxMsg('scheduler.parameter-code-nm'), flex: 3, dataIndex: 'paramCdNm', align: 'center'},
                        {
                            text: bxMsg('scheduler.parameter-type'), flex: 2, dataIndex: 'paramTypeCd', align: 'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMAD0017'][value];
                            }
                        },
                        {text: bxMsg('scheduler.parameter-key'), flex: 2, dataIndex: 'cdProcKey', align: 'center'},
                        {text: bxMsg('scheduler.current-parameter-value'), flex: 3, dataIndex: 'currParamVal', align: 'center'}
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
                    paramList = [];

                if (Array.isArray(data)) {
                    data.forEach(function (item) {
                        paramList.push(item.paramCd);
                    });
                    that.paramList = params.paramList = paramList;
                } else {
                    params.paramList = that.paramList;
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
                var dataObject = commonUtil.convertArrayToObject(this.gridData['parameterList'], 'paramCd'),
                    selectedObject = {};

                commonUtil.makeParamFromForm(this.$el.find('.bxm-popup-grid'))['paramCd'].forEach(function (item) {
                    selectedObject[item] = dataObject[item];
                });

                this.trigger('select-code', selectedObject);
                this.close();
            }
        });
    }
);