define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'common/popup/deferred-search/deferred-search',
        'text!views/deferred/deferred-job-status-management/_deferred-job-status-management-tpl.html'
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
                'click .deferred-search-btn': 'showDeferredSearchPopup',

                'click .play-btn': 'restartDeferred'
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
                        obj: commonUtil.getBxmReqData('DfrdStatusMngtService', 'getDfrdStatusListUsingPaging', 'DfrdStatus01IO'),
                        key: 'DfrdStatus01IO'
                    },
                    responseParam: {
                        objKey: 'DfrdStatusList01IO',
                        key: 'dfrdStatus'
                    },
                    header: {
                        pageCount: true
                    },
                    paging: true,

                    fields: ['deferredId', 'deferredNm', 'bizDt', 'nodeNo', 'deferredMainStatusCd', 'modifyDttm'],
                    columns: [
                        {text: bxMsg('deferred.deferredId'), flex: 2, dataIndex: 'deferredId',  align: 'center'},
                        {text: bxMsg('deferred.deferredName'), flex: 2, dataIndex: 'deferredNm',  align: 'center'},
                        {
                            text: bxMsg('deferred.businessDate'), flex: 2, dataIndex: 'bizDt', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToDateString(value);
                            }
                        },
                        {text: bxMsg('deferred.nodeNo'), flex: 1, dataIndex: 'nodeNo',  align: 'center'},
                        {
                            text: bxMsg('deferred.deferredMainStatus'), flex: 2, dataIndex: 'deferredMainStatusCd', align: 'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMDF0004'][value];
                            }
                        },
                        {
                            text: bxMsg('deferred.modifiedDatetime'), flex: 2, dataIndex: 'modifyDttm', align: 'center',
                            renderer: function (value) {
                                return commonUtil.changeStringToFullTimeString(value);
                            }
                        },
                        {
                            text:bxMsg('deferred.restart'),
                            renderer: function (value, p, record){
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn play-btn" data-id="{0}" data-node="{1}" data-biz-dt="{2}" data-status-cd="{3}"><i class="fa fa-play chr-c-green"></i></button>',
                                    record.get('deferredId'),
                                    record.get('nodeNo'),
                                    record.get('bizDt'),
                                    record.get('deferredMainStatusCd')
                                );
                            },

                            sortable: false,
                            align: 'center',
                            width: 50
                        }
                    ]
                });


                // Dom Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$gridWrap = that.$el.find('.bxm-grid-wrap');
            },

            render: function() {
                var that = this;

                that.$gridWrap.html(that.grid.render(function(){
                    that.loadList();
                }));

                return that.$el;
            },

            resetSearch: function() {
                this.$searchWrap.find('[data-form-param]').val('');
            },

            loadList: function() {
                this.grid.loadData(commonUtil.makeParamFromForm(this.$searchWrap), null, true);
            },

            showDeferredSearchPopup: function () {
                this.subViews['deferredSearchPopup'].render();
            },

            restartDeferred: function (event) {
                var that = this,
                    $target = $(event.currentTarget),
                    requestParam;

                requestParam = commonUtil.getBxmReqData(
                    'DfrdStatusMngtService', 'restartDfrdWork', 'DfrdStatus01IO',
                    {
                        deferredId: $target.attr('data-id'),
                        nodeNo: $target.attr('data-node'),
                        bizDt: $target.attr('data-biz-dt'),
                        deferredMainStatusCd: $target.attr('data-status-cd')
                    }
                );

                commonUtil.requestBxmAjax(requestParam, {
                    success: function(response) {
                        var code = response.ResponseCode.code;

                        if(code === 200){
                            swal({type: 'success', title: '', text: bxMsg('common.run-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                            //그리드 reload
                            that.grid.reloadData();

                        } else if(code === 201) {
                            swal({type: 'error', title: '', text: bxMsg('deferred.deferredRestartFail'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                        }
                    }
                });
            }
        });
    }
);
