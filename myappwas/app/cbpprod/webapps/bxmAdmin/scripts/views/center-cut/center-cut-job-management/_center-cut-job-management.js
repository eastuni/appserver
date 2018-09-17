define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/center-cut/center-cut-job-management/center-cut-job-management-popup',
        'text!views/center-cut/center-cut-job-management/_center-cut-job-management-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        EditPopup,
        tpl
    ) {
        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .reset-search-btn': 'resetSearch',
                'click .search-btn': 'loadList',
                'enter-component .bxm-search-wrap input': 'loadList',

                'click .grid-del-btn': 'deleteItem',
                'click .edit-btn': 'showEditItemPopup'
            },

            ccId: null,
            detailData: null,

            initialize: function() {

                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['editPopup'] = new EditPopup();
                that.subViews['editPopup'].on('edit-item', function(){
                    var selectedIdx = that.grid.getSelectedRowIdx();

                    that.grid.reloadData(function(){
                        if(selectedIdx === -1){
                            that.loadDetail({
                                ccId: that.ccId,
                                scheduleId: that.scheduleId
                            });
                        } else {
                            that.grid.setSelectedRowIdx(selectedIdx);
                        }
                    });
                });
                that.subViews['editPopup'].on('add-item', function(){
                    that.grid.reloadData();
                });

                that.subViews['detailLoadingBar'] = new LoadingBar();


                // Set Grid
                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('SCC1001', 'searchCcutMainList', 'SCC100101In', null, 'bxmAdminCC'),
                        key: 'SCC100101In'
                    },

                    responseParam: {
                        objKey: 'SCC100103Out',
                        key: 'out'
                    },

                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="'
                                + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['editPopup'].render();
                                }
                            }
                        ]
                    },
                    paging: true,

                    fields: ['ccId', 'ccIdNm', 'onSvcTrxCd', 'paraPrcsCnt', 'schdCnt', 'ccIdUseYn', 'regUserId', 'regDttm'],
                    columns: [
                        {text: bxMsg('centerCut.centerCutId'), flex: 2, dataIndex: 'ccId', align:'center'},
                        {text: bxMsg('centerCut.centerCutName'), flex: 4, dataIndex: 'ccIdNm', align:'center'},
                        {text: bxMsg('centerCut.onlineServiceTransactionCode'), flex: 3, dataIndex: 'onSvcTrxCd', align:'center'},
                        {text: bxMsg('centerCut.parallelProcessCount'), flex: 2, dataIndex: 'paraPrcsCnt', align:'center'},
                        {text: bxMsg('centerCut.dataCount'), flex: 2, dataIndex: 'schdCnt', align:'center'},
/*                        {
                            text: bxMsg('centerCut.dataGenerateType'), flex: 2, dataIndex: 'inptDataTpCd', align:'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMCC0003'][value];
                            }
                        },*/
                        {text: bxMsg('centerCut.useYn'), flex: 1.5, dataIndex: 'ccIdUseYn', align:'center'},
/*                        {
                            text: bxMsg('centerCut.logLevel'), flex: 1.5, dataIndex: 'logLv', align:'center',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMCC0008'][value];
                            }
                        },*/
                        {text: bxMsg('centerCut.registererId'), flex: 1, dataIndex: 'regUserId', align:'center'},
                        {text: bxMsg('centerCut.registerDatetime'), flex: 2, dataIndex: 'regDttm', align:'center'},
                        {
                            text:bxMsg('common.del'),
                            renderer: function (value, p, record){
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn grid-del-btn" data-id="{0}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('ccId')
                                );
                            },

                            sortable: false,
                            align: 'center',
                            width: 50
                        }
                    ],

                    listeners: {
                        select: function(_this, record){
                            that.loadDetail({ccId: record.get('ccId')});
                        }
                    }
                });


                // DOM Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$gridWrap = that.$el.find('.bxm-grid-wrap');
                that.$detailTitle = that.$el.find('h3 > .bxm-detail-title');
                that.$detailWrap = that.$el.find('.bxm-detail-wrap');
            },

            render: function() {
                var that = this;

                that.loadList();
                that.$gridWrap.html(that.grid.render(function() {that.loadList();}));
                // that.setEvntSectCn();
                that.$detailWrap.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            afterRender: function(pageRenderInfo) {
                var that = this,
                    params;

                if(pageRenderInfo && pageRenderInfo.ccId) {
                    that.ccId = pageRenderInfo.ccId;

                    that.loadDetail({ccId: that.ccId}, function () {
                        commonUtil.makeFormFromParam(that.$searchWrap, params);
                        that.loadList();
                    });
                }
            },

            resetSearch: function() {
                this.$searchWrap.find('input[data-form-param]').val('');
            },

            loadList: function() {
            	var that = this,
            		params = commonUtil.makeParamFromForm(that.$searchWrap);
            	
            	that.grid.loadData(params, function(data) {
                	data = data['out'];
                	if(data && data.length) {
                		that.$gridWrap.find('tbody tr:first-child').click();
                	}
                }, true);
            },

            loadDetail: function(param, callback) {
                var that = this,
                    requestParam;

                that.ccId = param.ccId;
                that.scheduleId = param.scheduleId;

                //요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'SCC1001', 'searchCcutMain', 'SCC100101In',
                    {
                        ccId: param.ccId
                    },
                    'bxmAdminCC'
                );

                //Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function(){
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var data = response['SCC100101Out'],
                            nodeCnt,
                            options = [];

                        that.detailData = $.extend(true, {}, data);
                        that.$detailTitle.text(data.ccId);

                        if (data['nodeList'] && data['nodeList'].length) {
                            data['nodeList'].map(function(node) {
                                options.push(node['nodeNm'] + ' <input type="text" value="' + node['nodePrcsCnt'] + '" readonly/>');
                            });
                            that.$detailWrap.find('div.processes-per-node').html(options);
                        } else {
                            that.$detailWrap.find('div.processes-per-node').html('');
                        }

                        commonUtil.makeFormFromParam(that.$detailWrap, data);
                        // that.setEvntSectCn(data['evntSectCn']);
                    },
                    complete: function(){
                        that.subViews['detailLoadingBar'].hide();
                        callback && callback();
                    }
                });
            },

            // setEvntSectCn: function(evntSectCn) {
            //     evntSectCn = evntSectCn || '000';
            //     var html = '';
            //
            //     for (var i = 0; i < evntSectCn.length; ++i) {
            //         html += '<button type="button" class="bw-btn' + (evntSectCn[i] === '1' ? ' on' : '"') + '">'
            //             + bxMsg('centerCut.evntSectCn')[i] + '</button>';
            //     }
            //
            //     this.$detailWrap.find('[data-form-param="evntSectCn"]').html(html);
            // },

            deleteItem: function(e){
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function() {
                        //요청객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'SCC1001', 'deleteCcutMain', 'SCC100101In',
                            {
                                ccId: $target.attr('data-id')
                            },
                            'bxmAdminCC'
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 200){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                    //그리드 reload
                                    that.grid.reloadData();

                                    //상세 초기화
                                    that.$detailTitle.text('');
                                    that.$detailWrap.find('[data-form-param]').val('');
                                    // that.setEvntSectCn();
                                } else if(code === 201) {
                                    swal({type: 'error', title: '', text: bxMsg('common.del-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    });
            },

            showEditItemPopup: function(){
                if(!this.detailData) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['editPopup'].render(this.detailData);
            }
        });
    }
);
