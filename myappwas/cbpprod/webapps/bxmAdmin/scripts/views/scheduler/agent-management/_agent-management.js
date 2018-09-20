define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'text!views/scheduler/agent-management/_agent-management-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        tpl
    ) {
        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .refresh-btn': 'loadList',
                'click .grid-del-btn': 'deleteItem'
            },

            // 작업 상태
            statusCdList: {
                'NORMAL': {text: 'Normal', icon: '<i class="fa fa-check-circle chr-c-blue"></i>'},
                'CLOSING': {text: 'Closing', icon: '<i class="fa fa-check-circle chr-c-green"></i>'},
                'ERROR': {text: 'Error', icon: '<i class="fa fa-exclamation-circle chr-c-orange"></i>'}
            },

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set Grid
                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('AgentService', 'getAgentList', 'PageCountOMM'),
                        key: 'PageCountOMM'
                    },
                    responseParam: {
                        objKey: 'AgentListOMM',
                        key: 'agentList'
                    },
                    header: {
                        button: [
                            {
                                html: '<button type="button" class="bw-btn refresh-btn"><i class="bw-icon i-25 i-func-refresh" title="' + bxMsg('common.refresh') + '"></i></button>'
                            }
                        ],
                        pageCount: true
                    },
                    paging: true,

                    fields: ['agentId', 'agentConnUrl', 'nodeNm', 'agentStatusCd'],
                    columns: [
                        {text: bxMsg('scheduler.agent-id'), flex: 3, dataIndex: 'agentId', align: 'center'},
                        {text: bxMsg('scheduler.agent-connect-url'), flex: 5, dataIndex: 'agentConnUrl', align: 'center'},
                        {text: bxMsg('scheduler.node-nm'), flex: 3, dataIndex: 'nodeNm',  align: 'center'},
                        {
                            text: bxMsg('scheduler.agent-status'), flex: 3, dataIndex: 'agentStatusCd', align: 'center',
                            renderer: function(value) {
                                var statusObj = that.statusCdList[value];

                                return statusObj.icon + ' ' + statusObj.text;
                            }
                        },
                        {
                            text:bxMsg('common.del'),
                            renderer: function (value, metaData, record){
                                if (record.get('agentStatusCd') === 'ERROR') {
                                    return Ext.String.format(
                                        '<button type="button" class="bw-btn grid-del-btn" data-id="{0}" data-url="{1}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                        record.get('agentId'),
                                        record.get('agentConnUrl')
                                    );
                                }
                            },
                            sortable: false,
                            align: 'center',
                            width: 50
                        }
                    ]

                });

                // Dom Element Cache
                that.$gridWrap = that.$el.find('.bxm-grid-wrap');
            },

            render: function() {
                var that = this;

                that.$gridWrap.html(that.grid.render(function(){that.loadList();}));

                return that.$el;
            },

            loadList: function() {
                this.grid.loadData({}, null, true);
            },

            deleteItem: function (e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function() {
                        requestParam = commonUtil.getBxmReqData(
                            'AgentService', 'removeAgent', 'AgentOMM',
                            {
                                agentId: $target.attr('data-id'),
                                agentConnUrl: $target.attr('data-url')
                            }
                        );

                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 1100){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                    //그리드 reload
                                    that.loadList();
                                } else if(code === 1102) {
                                    swal({type: 'error', title: '', text: bxMsg('scheduler.agent-delete-no-condition'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                } else {
                                    swal({type: 'error', title: '', text: bxMsg('common.del-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    }
                );
            }
        });
    }
);
