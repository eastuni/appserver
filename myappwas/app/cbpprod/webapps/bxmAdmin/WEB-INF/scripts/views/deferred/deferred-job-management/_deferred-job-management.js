define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/deferred/deferred-job-management/deferred-job-management-popup',
        'text!views/deferred/deferred-job-management/_deferred-job-management-tpl.html'
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

            deferredId: null,
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
                                deferredId: that.deferredId
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
                        obj: commonUtil.getBxmReqData('DfrdMainMngtService', 'getDfrdMainListUsingPaging', 'DfrdMain01IO'),
                        key: 'DfrdMain01IO'
                    },

                    responseParam: {
                        objKey: 'DfrdMainList01IO',
                        key: 'dfrdMainIO'
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
                    pageCountDefaultVal: 5,

                    fields: ['deferredId', 'deferredNm', 'trxCd', 'useYn', 'logLv', 'modifyUserId', 'modifyOccurDttm'],
                    columns: [
                        {text: bxMsg('deferred.deferredId'), flex: 2, dataIndex: 'deferredId', align:'center'},
                        {text: bxMsg('deferred.deferredName'), flex: 3, dataIndex: 'deferredNm', align:'center'},
                        {text: bxMsg('deferred.transactionCode'), flex: 1, dataIndex: 'trxCd', align:'center'},
                        {text: bxMsg('centerCut.useYn'), flex: 1, dataIndex: 'useYn', align:'center'},
                        {text: bxMsg('deferred.managerId'), flex: 2, dataIndex: 'modifyUserId', align:'center'},
                        {text: bxMsg('deferred.registerDatetime'), flex: 3, dataIndex: 'modifyOccurDttm', align:'center'},
                        {
                            text:bxMsg('common.del'),
                            renderer: function (value, p, record){
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn grid-del-btn" data-id="{0}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('deferredId')
                                );
                            },

                            sortable: false,
                            align: 'center',
                            width: 50
                        }
                    ],

                    listeners: {
                        select: function(_this, record){
                            that.loadDetail({deferredId: record.get('deferredId')});
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

                that.$gridWrap.html(that.grid.render(function(){that.loadList();}));
                that.$detailWrap.append(that.subViews['detailLoadingBar'].render());
                
                return this.$el;
            },

            afterRender: function(pageRenderInfo) {
                var that = this,
                    params;

                if(pageRenderInfo && pageRenderInfo.deferredId) {
                    that.deferredId = pageRenderInfo.deferredId;

                    that.loadDetail({deferredId: that.deferredId}, function () {
                        commonUtil.makeFormFromParam(that.$searchWrap, params);
                        that.loadList();
                    });
                }
            },

            resetSearch: function() {
                this.$searchWrap.find('input[data-form-param]').val('');
            },

            loadList: function() {
            	var that= this,
            		params = commonUtil.makeParamFromForm(this.$searchWrap);
            	
                this.grid.loadData(params, function(data) {
                	data = data['dfrdMainIO'];
                	if(data && data.length) {
                		that.$gridWrap.find('tbody tr:first-child').click();
                	}
                }, true);
            },

            loadDetail: function(param, callback) {
                var that = this,
                    requestParam;

                that.deferredId = param.deferredId;

                //요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'DfrdMainMngtService', 'getDfrdMainDetail', 'DfrdMain01IO',
                    {
                        deferredId: param.deferredId
                    }
                );

                //Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function(){
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var data = response['DfrdMain01IO'];
                        that.detailData = data;

                        that.$detailTitle.text(data.deferredId);
                        commonUtil.makeFormFromParam(that.$detailWrap, data);
                    },
                    complete: function(){
                        that.subViews['detailLoadingBar'].hide();
                        callback && callback();
                    }
                });
            },

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
                            'DfrdMainMngtService', 'deleteDfrdMain', 'DfrdMain01IO',
                            {
                                deferredId: $target.attr('data-id')
                            }
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
