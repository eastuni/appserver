define(
    [
        'common/util',
        'common/config',
        'common/component/ext-grid/_ext-grid',
        'common/component/loading-bar/_loading-bar',
        'views/scheduler/parameter-code-management/parameter-code-management-popup',
        'text!views/scheduler/parameter-code-management/_parameter-code-management-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        ExtGrid,
        LoadingBar,
        SubPopup,
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

                'click .del-btn': 'deleteItem',
                'click .edit-btn': 'showEditItemPopup'
            },

            paramCd: null,

            initialize: function() {
                var that = this;

                // Set Page
                that.$el.html(that.tpl());

                // Set SubViews
                that.subViews['subPopup'] = new SubPopup();
                that.subViews['subPopup'].on('edit-item', function() {
                    // 사용자 수정시, 리스트, 상세 리프래시
                    var selectedIdx = that.grid.getSelectedRowIdx();

                    that.grid.reloadData(function() {
                        if(selectedIdx === -1){
                            that.loadDetail({
                                paramCd: that.paramCd
                            });
                        }else{
                            that.grid.setSelectedRowIdx(selectedIdx);
                        }
                    });
                });
                that.subViews['subPopup'].on('add-item', function() {
                    // 사용자 생성시, 리스트 리프래시
                    that.grid.reloadData();
                });

                that.subViews['detailLoadingBar'] = new LoadingBar();

                // Set Grid
                that.grid = new ExtGrid({
                    requestParam: {
                        obj: commonUtil.getBxmReqData('ParameterCodeService', 'getParameterCodeList', 'ParameterCodeInOMM'),
                        key: 'ParameterCodeInOMM'
                    },
                    responseParam: {
                        objKey: 'ParameterCodeListOMM',
                        key: 'parameterList'
                    },
                    header: {
                        pageCount: true,
                        button: [
                            {
                                html: '<button type="button" class="bw-btn"><i class="bw-icon i-25 i-func-add" title="' + bxMsg('common.add') + '"></i></button>',
                                event: function() {
                                    that.subViews['subPopup'].render();
                                }
                            }
                        ]
                    },
                    paging: true,

                    fields: ['paramCd', 'paramCdNm', 'paramTypeCd', 'fixedInputVal', 'autoRegYn', 'autoRegSeq', 'modifUseYn'],
                    columns: [
                        {text: bxMsg('scheduler.parameter-code'), flex: 2, dataIndex: 'paramCd', align: 'center'},
                        {text: bxMsg('scheduler.parameter-code-nm'), flex: 3, dataIndex: 'paramCdNm', align: 'center'},
                        {
                            text: bxMsg('scheduler.parameter-type'),
                            flex: 2,
                            dataIndex: 'paramTypeCd',
                            renderer: function (value) {
                                return commonConfig.comCdList['BXMAD0017'][value];
                            },
                            align: 'center'},
                        {text: bxMsg('scheduler.parameter-key'), flex: 3, dataIndex: 'fixedInputVal', align: 'center'},
                        {text: bxMsg('scheduler.required-yn'), flex: 1, dataIndex: 'autoRegYn', align: 'center'},
                        {
                            text: bxMsg('scheduler.required-priority'), flex: 1, dataIndex: 'autoRegSeq', align: 'center',
                            renderer: function (value) {
                                return value || 'N/A';
                            }
                        },
                        {text: bxMsg('scheduler.editable-yn'), flex: 1, dataIndex: 'modifUseYn', align: 'center'},
                        {
                            text: bxMsg('common.del'),
                            renderer: function (value, p, record, idx) {
                                return Ext.String.format(
                                    '<button type="button" class="bw-btn del-btn" data-id="{0}"><i class="bw-icon i-20 i-func-trash"></i></button>',
                                    record.get('paramCd')
//                                    ,record.get('cdVal')
//                                    ,record.get('langCd')
                                );
                            },
                            sortable: false,
                            menuDisabled: true,
                            align: 'center',
                            width: 50
                        }
                    ],
                    listeners: {
                        beforecellmousedown: function(_this, td, cellIndex) {
                            this.gridSelect = (cellIndex !== 7);
                        },
                        beforeselect: function() {
                            return this.gridSelect;
                        },
                        select : function(_this, record) {
                            that.loadDetail({
                                paramCd: record.get('paramCd')
                            });
                        }
                    }
                });

                // Dom Element Cache
                that.$searchWrap = that.$el.find('.bxm-search-wrap');
                that.$gridWrap = that.$el.find('.bxm-grid-wrap');
                that.$detailTitle = that.$el.find('h3 > .bxm-detail-title');
                that.$detailWrap = that.$el.find('.bxm-detail-wrap');
            },

            render: function() {
                var that = this;

                that.$gridWrap.html(that.grid.render(function(){that.loadList();}));
                that.$detailWrap.append(that.subViews['detailLoadingBar'].render());

                return that.$el;
            },

            resetSearch: function() {
                this.$searchWrap.find('input[data-form-param]').val('');
            },

            loadList: function() {
            	var that = this,
            		params = commonUtil.makeParamFromForm(this.$searchWrap);
            	
                this.grid.loadData(params, function(data) {
                	data = data['parameterList'];
                	if(data && data.length) {
                		that.$gridWrap.find('tbody tr:first-child').click();
                	} else {
                		that.$detailWrap.find('[data-form-param]').val('');
                    	that.$detailTitle.text('');
                	}
                }, true);
            },

            deleteItem: function(e) {
                var that = this,
                    $target = $(e.currentTarget),
                    requestParam;

                swal({
                        title: '', text: bxMsg('common.delete-msg'), showCancelButton: true, closeOnConfirm: false
                    },
                    function(){
                        // 요청 객체 생성
                        requestParam = commonUtil.getBxmReqData(
                            'ParameterCodeService', 'removeParameterCode', 'ParameterCodeOMM',
                            {
                                paramCd: $target.attr('data-id')
                            }
                        );

                        // Ajax 요청
                        commonUtil.requestBxmAjax(requestParam, {
                            success: function(response) {
                                var code = response.ResponseCode.code;

                                if(code === 200){
                                    swal({type: 'success', title: '', text: bxMsg('common.delete-success-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});

                                    // 그리드 리로드
                                    that.grid.reloadData();

                                    // 상세 초기화
                                    that.$detailTitle.text('');
                                    that.$detailWrap.find('input[data-form-param]').val('');
                                }else if(code === 205) {
                                    swal({type: 'error', title: '', text: bxMsg('common.incorrect-pwd-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                                }
                            }
                        });
                    }
                );
            },

            showEditItemPopup: function() {
                var renderData = commonUtil.makeParamFromForm(this.$detailWrap);

                if(!renderData.paramCd) {
                    swal({type: 'warning', title: '', text: bxMsg('common.edit-fail-msg'), timer: commonUtil.getPopupDuration(), showConfirmButton: false});
                    return;
                }

                this.subViews['subPopup'].render(renderData);
            },

            /**
             * paramCd
             * */
            loadDetail: function(param) {
                var that = this,
                    requestParam;

                that.paramCd = param.paramCd;

                // 요청 객체 생성
                requestParam = commonUtil.getBxmReqData(
                    'ParameterCodeService', 'getParameterCodeInfo', 'ParameterCodeInOMM',
                    {
                        paramCd: param.paramCd
                    }
                );

                // Ajax 요청
                commonUtil.requestBxmAjax(requestParam, {
                    beforeSend: function() {
                        that.subViews['detailLoadingBar'].show();
                    },
                    success: function(response) {
                        var data = response.ParameterCodeOMM;

                        that.$detailTitle.text(data.paramCd);
                        if (!data.autoRegSeq) data.autoRegSeq = 'N/A';
                        commonUtil.makeFormFromParam(that.$detailWrap, data);
                    },
                    complete: function() {
                        that.subViews['detailLoadingBar'].hide();
                    }
                });
            }
        });
    }
);